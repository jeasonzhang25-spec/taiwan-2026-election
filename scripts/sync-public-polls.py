#!/usr/bin/env python3
"""Sync the public 2026 Taiwan local-election polling index into static JSON.

The index is used as a catalogue: every row keeps the cited publication URL so
readers can return to the reporting source. Empty future tables, non-numeric
rows and scenarios with fewer than two named choices are excluded.
"""

from __future__ import annotations

import hashlib
import json
import re
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any

import requests
from bs4 import BeautifulSoup, Tag


INDEX_URL = "https://zh.wikipedia.org/wiki/2026年中華民國直轄市長及縣市長選舉民意調查"
OUTPUT = Path(__file__).resolve().parents[1] / "src/lib/data/generated/public-polls.json"
USER_AGENT = "TaiwanElectionDashboardDataSync/1.0 (local public-data catalogue)"

COUNTY_IDS = {
    "台北市": "taipei",
    "新北市": "newtaipei",
    "桃園市": "taoyuan",
    "台中市": "taichung",
    "台南市": "tainan",
    "高雄市": "kaohsiung",
    "基隆市": "keelung",
    "新竹縣": "hsinchu-county",
    "新竹市": "hsinchu-city",
    "苗栗縣": "miaoli",
    "彰化縣": "changhua",
    "南投縣": "nantou",
    "雲林縣": "yunlin",
    "嘉義縣": "chiayi-county",
    "嘉義市": "chiayi-city",
    "屏東縣": "pingtung",
    "宜蘭縣": "yilan",
    "花蓮縣": "hualien",
    "台東縣": "taitung",
    "澎湖縣": "penghu",
    "金門縣": "kinmen",
    "連江縣": "lienchiang",
}

PARTY_IDS = {
    "國民": "kmt",
    "民進": "dpp",
    "民眾": "tpp",
    "時力": "npp",
    "無黨": "ind",
    "台聯": "ind",
}

# Details verified from full methodology disclosures for the five original rows.
ENRICHMENTS: dict[tuple[str, str, str], dict[str, Any]] = {
    ("taipei", "TVBS", "2026-05-26"): {
        "institute": "TVBS 民意調查中心",
        "sampleSize": 901,
        "method": "電話後四碼隨機抽樣、人員電話訪問",
        "marginOfError": 3.3,
        "publishedAt": "2026-05-27",
    },
    ("newtaipei", "TVBS", "2026-07-23"): {
        "institute": "TVBS 民意調查中心",
        "sampleSize": 1303,
        "method": "市內電話訪問",
        "marginOfError": 2.7,
        "publishedAt": "2026-07-29",
    },
    ("taichung", "艾普羅民調", "2026-08-05"): {
        "institute": "艾普羅行銷市場研究",
        "sampleSize": 1077,
        "method": "住宅電話抽樣、人員電話訪問",
        "marginOfError": 3.0,
        "publishedAt": "2026-08-08",
    },
    ("kaohsiung", "皮爾森", "2026-08-01"): {
        "institute": "皮爾森數據",
        "sampleSize": 1608,
        "method": "網路主動發放調查",
        "marginOfError": 2.4,
        "publishedAt": "2026-08-10",
    },
    ("changhua", "匯流民調", "2026-05-21"): {
        "institute": "CNEWS 匯流新聞網民調中心",
        "sampleSize": 1068,
        "method": "家戶電話、分層比例隨機抽樣",
        "marginOfError": 3.0,
        "publishedAt": "2026-05-25",
    },
}


def clean_text(cell: Tag) -> str:
    text = cell.get_text(" ", strip=True)
    text = re.sub(r"\s*\[\s*(?:註\s*)?\d+\s*\]\s*", "", text)
    return re.sub(r"\s+", " ", text).strip()


def citation_url(cell: Tag, soup: BeautifulSoup) -> str | None:
    for anchor in cell.select('sup a[href^="#cite_note-"]'):
        note = soup.select_one(anchor.get("href", ""))
        if note:
            external = note.select_one("a.external[href]")
            if external:
                return external.get("href")
    return None


def expand_table(table: Tag, soup: BeautifulSoup) -> list[list[dict[str, str | None]]]:
    """Expand HTML rowspans/colspans into a rectangular row representation."""
    active: dict[int, tuple[dict[str, str | None], int]] = {}
    output: list[list[dict[str, str | None]]] = []
    rows = table.select(":scope > tbody > tr") or table.select(":scope > tr")

    for tr in rows:
        cells = tr.find_all(["th", "td"], recursive=False)
        row: list[dict[str, str | None]] = []
        column = 0

        def fill_active() -> None:
            nonlocal column
            while column in active:
                value, remaining = active[column]
                row.append(value)
                remaining -= 1
                if remaining:
                    active[column] = (value, remaining)
                else:
                    del active[column]
                column += 1

        for cell in cells:
            fill_active()
            value = {"text": clean_text(cell), "url": citation_url(cell, soup)}
            rowspan = int(cell.get("rowspan", 1))
            colspan = int(cell.get("colspan", 1))
            for _ in range(colspan):
                row.append(value)
                if rowspan > 1:
                    active[column] = (value, rowspan - 1)
                column += 1
        fill_active()
        output.append(row)

    return output


def parse_percentage(value: str) -> float | None:
    if value.strip() in {"", "-", "—", "_", "–"}:
        return None
    match = re.search(r"-?\d+(?:\.\d+)?", value.replace(",", ""))
    if not match:
        return None
    number = float(match.group(0))
    return number if 0 <= number <= 100 else None


def parse_end_date(value: str, default_year: int) -> tuple[str | None, int]:
    """Return end date and active year for chronologically ordered table rows."""
    normalized = value.replace("到", "至").replace("日及", "日至")
    years = [int(x) for x in re.findall(r"(20\d{2})年", normalized)]
    year = years[-1] if years else default_year
    months = [int(x) for x in re.findall(r"(\d{1,2})月", normalized)]
    days = [int(x) for x in re.findall(r"(\d{1,2})日", normalized)]
    if not months:
        return None, year
    month = months[-1]
    day = days[-1] if days else 1
    try:
        return date(year, month, day).isoformat(), year
    except ValueError:
        return None, year


def parse_candidate(header: str, county_id: str) -> dict[str, str] | None:
    for prefix, party_id in PARTY_IDS.items():
        if header.startswith(prefix):
            name = header[len(prefix):].strip()
            if not name:
                return None
            return {
                "id": f"{county_id}-{name}",
                "name": name,
                "partyId": party_id,
            }
    return None


def source_kind(source: str) -> str:
    if "初選" in source:
        return "primary"
    if "內參" in source or source in {"國民黨", "民進黨", "民眾黨"}:
        return "internal"
    return "public"


def main() -> None:
    response = requests.get(INDEX_URL, headers={"User-Agent": USER_AGENT}, timeout=45)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")

    records: list[dict[str, Any]] = []
    candidates: dict[str, dict[str, dict[str, str]]] = {}

    for table_index, table in enumerate(soup.select("table.wikitable")):
        county_heading = table.find_previous("h2")
        scenario_heading = table.find_previous("h3")
        if not county_heading or not scenario_heading:
            continue
        county_name = clean_text(county_heading)
        county_id = COUNTY_IDS.get(county_name)
        if not county_id:
            continue

        grid = expand_table(table, soup)
        if len(grid) < 2:
            continue
        headers = [cell["text"] or "" for cell in grid[0]]
        parsed_headers = [parse_candidate(header, county_id) for header in headers]

        active_year = 2026
        for row_index, row in enumerate(grid[1:]):
            if len(row) < 2:
                continue
            row += [{"text": "", "url": None}] * (len(headers) - len(row))
            source = str(row[0]["text"] or "").strip()
            fieldwork = str(row[1]["text"] or "").strip()
            end_date, active_year = parse_end_date(fieldwork, active_year)
            if not source or not end_date:
                continue

            results: dict[str, float] = {}
            row_candidates: list[dict[str, str]] = []
            for column, candidate in enumerate(parsed_headers):
                if not candidate or column >= len(row):
                    continue
                value = parse_percentage(str(row[column]["text"] or ""))
                if value is None:
                    continue
                results[candidate["id"]] = value
                row_candidates.append(candidate)

            # A candidate-support matchup needs at least two named numeric choices.
            if len(results) < 2:
                continue

            undecided_index = next((i for i, h in enumerate(headers) if "未表態" in h), None)
            undecided = (
                parse_percentage(str(row[undecided_index]["text"] or ""))
                if undecided_index is not None and undecided_index < len(row)
                else None
            )
            # Citations are usually attached to the source cell, but a few
            # rowspan groups attach the reference to the fieldwork-date cell.
            source_url = row[0]["url"] or row[1]["url"]
            digest = hashlib.sha1(
                f"{county_id}|{table_index}|{row_index}|{source}|{fieldwork}|{sorted(results.items())}".encode()
            ).hexdigest()[:12]
            record: dict[str, Any] = {
                "id": f"poll-{digest}",
                "countyId": county_id,
                "institute": source,
                "date": end_date,
                "fieldwork": fieldwork,
                "source": source,
                "sourceUrl": source_url,
                "sourceKind": source_kind(source),
                "scenario": clean_text(scenario_heading),
                "results": results,
            }
            if undecided is not None:
                record["undecided"] = undecided
            record.update(ENRICHMENTS.get((county_id, source, end_date), {}))
            records.append(record)

            county_candidates = candidates.setdefault(county_id, {})
            for candidate in row_candidates:
                county_candidates[candidate["id"]] = candidate

    records.sort(key=lambda item: (item["countyId"], item["date"], item["source"], item["id"]))
    candidate_output = {
        county_id: sorted(values.values(), key=lambda item: (item["partyId"], item["name"]))
        for county_id, values in sorted(candidates.items())
    }
    coverage = sorted({record["countyId"] for record in records})
    content = {
        "checkedAt": date.today().isoformat(),
        "indexUrl": INDEX_URL,
        "recordCount": len(records),
        "countyCount": len(coverage),
        "countyIds": coverage,
        "records": records,
        "candidates": candidate_output,
    }

    # `generatedAt` only changes when the actual catalogue changes. This keeps
    # scheduled checks from creating a meaningless commit every time they run.
    previous: dict[str, Any] = {}
    if OUTPUT.exists():
        try:
            previous = json.loads(OUTPUT.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            previous = {}
    comparable_keys = ("indexUrl", "recordCount", "countyCount", "countyIds", "records", "candidates")
    unchanged = bool(previous) and all(previous.get(key) == content.get(key) for key in comparable_keys)
    generated_at = previous.get("generatedAt") if unchanged else None
    payload = {
        **content,
        "generatedAt": generated_at or datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(records)} scenario rows across {len(coverage)} counties to {OUTPUT}")


if __name__ == "__main__":
    main()
