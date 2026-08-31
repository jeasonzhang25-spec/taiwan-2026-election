#!/usr/bin/env python3
"""Validate the generated public-poll catalogue before it is published."""

from __future__ import annotations

import argparse
import json
from datetime import date, datetime
from pathlib import Path
from typing import Any
from urllib.parse import urlparse
from zoneinfo import ZoneInfo


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_INPUT = ROOT / "src/lib/data/generated/public-polls.json"
VALID_COUNTIES = {
    "taipei", "newtaipei", "taoyuan", "taichung", "tainan", "kaohsiung",
    "keelung", "hsinchu-city", "hsinchu-county", "miaoli", "changhua", "nantou",
    "yunlin", "chiayi-city", "chiayi-county", "pingtung", "yilan", "hualien",
    "taitung", "penghu", "kinmen", "lienchiang",
}
VALID_SOURCE_KINDS = {"public", "internal", "primary"}


def load_json(path: Path) -> dict[str, Any]:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise SystemExit(f"ERROR: data file not found: {path}") from exc
    except json.JSONDecodeError as exc:
        raise SystemExit(f"ERROR: invalid JSON in {path}: {exc}") from exc


def is_source_url(value: Any) -> bool:
    if not isinstance(value, str):
        return False
    parsed = urlparse(value)
    return parsed.scheme in {"http", "https"} and bool(parsed.netloc)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--previous", type=Path)
    args = parser.parse_args()

    payload = load_json(args.input)
    records = payload.get("records")
    candidates = payload.get("candidates")
    errors: list[str] = []
    warnings: list[str] = []
    if not isinstance(records, list):
        raise SystemExit("ERROR: records must be an array")
    if not isinstance(candidates, dict):
        raise SystemExit("ERROR: candidates must be an object")

    today_taipei = datetime.now(ZoneInfo("Asia/Taipei")).date()
    try:
        checked_at = date.fromisoformat(str(payload.get("checkedAt")))
        if checked_at > today_taipei:
            errors.append("checkedAt is in the future for Asia/Taipei")
    except ValueError:
        errors.append(f"invalid checkedAt {payload.get('checkedAt')!r}")
    try:
        datetime.fromisoformat(str(payload.get("generatedAt")).replace("Z", "+00:00"))
    except ValueError:
        errors.append(f"invalid generatedAt {payload.get('generatedAt')!r}")
    if not is_source_url(payload.get("indexUrl")):
        errors.append("indexUrl must be a valid web URL")

    ids: set[str] = set()
    coverage: set[str] = set()
    for index, record in enumerate(records):
        label = f"records[{index}]"
        if not isinstance(record, dict):
            errors.append(f"{label}: must be an object")
            continue
        record_id = record.get("id")
        if not isinstance(record_id, str) or not record_id:
            errors.append(f"{label}: missing id")
        elif record_id in ids:
            errors.append(f"{label}: duplicate id {record_id}")
        else:
            ids.add(record_id)

        county_id = record.get("countyId")
        if county_id not in VALID_COUNTIES:
            errors.append(f"{label}: unknown countyId {county_id!r}")
        else:
            coverage.add(county_id)

        poll_date: date | None = None
        try:
            poll_date = date.fromisoformat(str(record.get("date")))
            if poll_date > today_taipei:
                errors.append(f"{label}: poll date is in the future")
        except ValueError:
            errors.append(f"{label}: invalid ISO date {record.get('date')!r}")

        for field in ("institute", "source", "scenario", "fieldwork"):
            if not isinstance(record.get(field), str) or not record.get(field, "").strip():
                errors.append(f"{label}: missing {field}")

        if record.get("sourceKind") not in VALID_SOURCE_KINDS:
            errors.append(f"{label}: invalid sourceKind {record.get('sourceKind')!r}")
        if not is_source_url(record.get("sourceUrl")):
            errors.append(f"{label}: sourceUrl must be a valid web URL")
        elif str(record.get("sourceUrl")).startswith("http://"):
            warnings.append(f"{label}: source only provides an HTTP link")

        sample_size = record.get("sampleSize")
        if sample_size is not None and (
            isinstance(sample_size, bool)
            or not isinstance(sample_size, int)
            or sample_size <= 0
        ):
            errors.append(f"{label}: invalid sampleSize {sample_size!r}")

        margin = record.get("marginOfError")
        if margin is not None and (
            isinstance(margin, bool)
            or not isinstance(margin, (int, float))
            or not 0 < margin <= 20
        ):
            errors.append(f"{label}: invalid marginOfError {margin!r}")

        published_at = record.get("publishedAt")
        if published_at is None:
            warnings.append(f"{label}: publication date not disclosed")
        else:
            try:
                published_date = date.fromisoformat(str(published_at))
                if poll_date and published_date < poll_date:
                    warnings.append(f"{label}: publication date predates poll end date")
                if published_date > today_taipei:
                    errors.append(f"{label}: publication date is in the future")
            except ValueError:
                errors.append(f"{label}: invalid publishedAt {published_at!r}")

        undecided = record.get("undecided")
        if undecided is not None and (
            isinstance(undecided, bool)
            or not isinstance(undecided, (int, float))
            or not 0 <= undecided <= 100
        ):
            errors.append(f"{label}: invalid undecided percentage {undecided!r}")

        results = record.get("results")
        if not isinstance(results, dict) or len(results) < 2:
            errors.append(f"{label}: needs at least two numeric candidate results")
            continue
        registered = {
            candidate.get("id")
            for candidate in candidates.get(county_id, [])
            if isinstance(candidate, dict)
        }
        for candidate_id, value in results.items():
            if candidate_id not in registered:
                errors.append(f"{label}: unregistered candidate {candidate_id!r}")
            if isinstance(value, bool) or not isinstance(value, (int, float)) or not 0 <= value <= 100:
                errors.append(f"{label}: invalid percentage for {candidate_id!r}: {value!r}")
        numeric_values = [value for value in results.values() if isinstance(value, (int, float)) and not isinstance(value, bool)]
        if sum(numeric_values) > 105:
            warnings.append(f"{label}: named choices total more than 105%; verify question format")

        if record.get("sampleSize") is None:
            warnings.append(f"{label}: sample size not disclosed")
        if record.get("method") is None:
            warnings.append(f"{label}: method not disclosed")

    declared_count = payload.get("recordCount")
    declared_counties = set(payload.get("countyIds") or [])
    if declared_count != len(records):
        errors.append(f"recordCount says {declared_count}, but records contains {len(records)}")
    if payload.get("countyCount") != len(coverage):
        errors.append(f"countyCount says {payload.get('countyCount')}, but records cover {len(coverage)}")
    if declared_counties != coverage:
        errors.append("countyIds does not match record coverage")
    if len(records) < 250:
        errors.append(f"record count floor failed: {len(records)} < 250")
    if len(coverage) < 18:
        errors.append(f"county coverage floor failed: {len(coverage)} < 18")

    if args.previous and args.previous.exists():
        previous = load_json(args.previous)
        previous_count = int(previous.get("recordCount") or 0)
        previous_counties = int(previous.get("countyCount") or 0)
        if previous_count and len(records) < previous_count * 0.9:
            errors.append(f"record count dropped more than 10%: {previous_count} -> {len(records)}")
        if len(coverage) < previous_counties - 2:
            errors.append(f"county coverage dropped by more than 2: {previous_counties} -> {len(coverage)}")

    if errors:
        print("Poll data validation FAILED")
        for item in errors:
            print(f"- {item}")
        raise SystemExit(1)

    missing_sample = sum("sample size" in item for item in warnings)
    missing_method = sum("method" in item for item in warnings)
    missing_published = sum("publication date not disclosed" in item for item in warnings)
    print(
        f"Poll data validation passed: {len(records)} scenarios, "
        f"{len(coverage)} counties, {len(ids)} unique IDs."
    )
    print(
        f"Disclosure note: {missing_sample} rows lack sample size; "
        f"{missing_method} rows lack methodology; {missing_published} rows lack publication date."
    )
    print(f"Non-blocking disclosure warnings: {len(warnings)}.")


if __name__ == "__main__":
    main()
