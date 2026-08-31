#!/usr/bin/env python3
"""Audit poll source pages and build a bounded manual-review queue."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DATA = ROOT / "src/lib/data/generated/public-polls.json"
DEFAULT_OUTPUT = ROOT / "src/lib/data/generated/poll-source-audit.json"
USER_AGENT = "IslandElectionSourceAudit/2.0 (+https://github.com/)"


def load_json(path: Path | None) -> dict[str, Any]:
    if not path or not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


def stable_hash(value: str, length: int = 16) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()[:length]


def scenario_key(record: dict[str, Any]) -> str:
    candidates = ",".join(sorted((record.get("results") or {}).keys()))
    return "|".join([
        str(record.get("countyId", "")), str(record.get("fieldwork") or record.get("date", "")),
        str(record.get("institute", "")), str(record.get("scenario", "")), candidates,
        str(record.get("sourceUrl", "")),
    ])


def result_signature(record: dict[str, Any]) -> str:
    return json.dumps(record.get("results") or {}, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def survey_key(record: dict[str, Any]) -> str:
    return "|".join([
        str(record.get("countyId", "")), str(record.get("fieldwork") or record.get("date", "")),
        str(record.get("institute", "")),
    ])


def audit_snapshot(payload: dict[str, Any]) -> dict[str, Any]:
    """Return the persisted fields that represent a meaningful audit change."""
    return {
        "dataGeneratedAt": payload.get("dataGeneratedAt"),
        "summary": payload.get("summary"),
        "sources": payload.get("sources"),
        "surveyGroups": payload.get("surveyGroups"),
        "reviewQueue": payload.get("reviewQueue"),
    }


def normalized_text(content: bytes, content_type: str) -> tuple[str, str]:
    if "html" not in content_type.lower():
        digest = hashlib.sha256(content).hexdigest()
        return "", digest
    soup = BeautifulSoup(content, "html.parser")
    for node in soup(["script", "style", "noscript", "svg"]):
        node.decompose()
    text = re.sub(r"\s+", " ", soup.get_text(" ", strip=True)).strip()
    return text, hashlib.sha256(text[:500_000].encode("utf-8")).hexdigest()


def poll_evidence_fingerprint(text: str, candidate_names: set[str], values: set[str]) -> str | None:
    """Hash expected poll evidence, excluding unstable ads and recommendation rails."""
    present_candidates = sorted(name for name in candidate_names if len(name) >= 2 and name in text)
    present_values = sorted(value for value in values if value and re.search(rf"(?<!\d){re.escape(value)}\s*%", text))
    if not present_candidates and not present_values:
        return None
    normalized = json.dumps(
        {"candidates": present_candidates, "percentages": present_values},
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    )
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


def fetch_url(url: str, timeout: float) -> dict[str, Any]:
    retry = Retry(total=2, connect=2, read=2, backoff_factor=0.5, status_forcelist=(500, 502, 503, 504), allowed_methods=("GET",))
    session = requests.Session()
    session.mount("https://", HTTPAdapter(max_retries=retry))
    session.mount("http://", HTTPAdapter(max_retries=retry))
    try:
        response = session.get(url, headers={"User-Agent": USER_AGENT}, timeout=(5, timeout), allow_redirects=True)
        content = response.content[:1_500_000]
        content_type = response.headers.get("content-type", "").split(";")[0]
        text, fingerprint = normalized_text(content, content_type)
        if response.status_code in {401, 403, 429}:
            status = "restricted"
        elif 200 <= response.status_code < 400:
            status = "reachable"
        else:
            status = "unreachable"
        return {
            "status": status, "httpStatus": response.status_code, "finalUrl": response.url,
            "contentType": content_type or None, "fingerprint": fingerprint or None,
            "text": text, "error": None,
        }
    except requests.RequestException as exc:
        return {"status": "unreachable", "httpStatus": None, "finalUrl": None, "contentType": None, "fingerprint": None, "text": "", "error": type(exc).__name__}
    finally:
        session.close()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, default=DEFAULT_DATA)
    parser.add_argument("--previous-data", type=Path)
    parser.add_argument("--previous-audit", type=Path)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--workers", type=int, default=10)
    parser.add_argument("--timeout", type=float, default=10)
    parser.add_argument("--max-sources", type=int, default=0)
    parser.add_argument("--offline", action="store_true")
    args = parser.parse_args()

    data = load_json(args.input)
    records = data.get("records") or []
    previous_data = load_json(args.previous_data)
    previous_audit = load_json(args.previous_audit)
    previous_sources = {item.get("url"): item for item in previous_audit.get("sources", [])}

    by_url: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for record in records:
        if record.get("sourceUrl"):
            by_url[str(record["sourceUrl"])].append(record)
    all_urls = sorted(by_url)
    urls = all_urls
    if args.max_sources:
        urls = urls[:args.max_sources]

    fetched: dict[str, dict[str, Any]] = {}
    if not args.offline:
        with ThreadPoolExecutor(max_workers=max(1, args.workers)) as pool:
            futures = {pool.submit(fetch_url, url, args.timeout): url for url in urls}
            for future in as_completed(futures):
                fetched[futures[future]] = future.result()

    sources: list[dict[str, Any]] = []
    review: list[dict[str, Any]] = []
    changed_content = 0
    for url in all_urls:
        related = by_url[url]
        check = fetched.get(url, {"status": "not-checked", "httpStatus": None, "finalUrl": None, "contentType": None, "fingerprint": None, "text": "", "error": None})
        text = check.pop("text", "")
        candidate_names = {candidate_id.split("-", 1)[-1] for record in related for candidate_id in (record.get("results") or {})}
        values = {str(value).rstrip("0").rstrip(".") for record in related for value in (record.get("results") or {}).values()}
        candidate_hits = sum(name in text for name in candidate_names) if text else 0
        value_hits = sum(bool(re.search(rf"(?<!\d){re.escape(value)}\s*%", text)) for value in values) if text else 0
        evidence = "strong" if candidate_hits >= 2 and value_hits >= 1 else "partial" if candidate_hits or value_hits else "none"
        page_fingerprint = check.get("fingerprint")
        if check["status"] != "reachable":
            check["fingerprint"] = None
        elif text:
            check["fingerprint"] = poll_evidence_fingerprint(text, candidate_names, values)
        else:
            # Binary sources such as PDFs retain their response-body fingerprint.
            check["fingerprint"] = page_fingerprint
        previous = previous_sources.get(url) or {}
        content_changed = bool(previous.get("fingerprint") and check.get("fingerprint") and previous["fingerprint"] != check["fingerprint"])
        if content_changed:
            changed_content += 1
        reasons: list[str] = []
        if check["status"] in {"unreachable", "restricted"}:
            reasons.append(f"source_{check['status']}")
        elif check["status"] == "reachable" and evidence == "none":
            reasons.append("no_poll_evidence_found")
        if content_changed:
            reasons.append("source_content_changed")
        source_item = {
            "id": f"source-{stable_hash(url)}", "url": url, "domain": urlparse(url).netloc,
            **check, "evidence": evidence, "candidateHits": candidate_hits, "percentageHits": value_hits,
            "contentChanged": content_changed, "recordIds": [record["id"] for record in related],
        }
        sources.append(source_item)
        if reasons:
            review.append({"id": f"review-{stable_hash(url)}", "priority": "high" if content_changed else "medium", "reasons": reasons, "url": url, "recordIds": source_item["recordIds"]})

    previous_by_scenario: dict[str, list[dict[str, Any]]] = defaultdict(list)
    current_by_scenario: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for record in previous_data.get("records", []):
        previous_by_scenario[scenario_key(record)].append(record)
    for record in records:
        current_by_scenario[scenario_key(record)].append(record)

    result_changes: list[str] = []
    for key, current_group in current_by_scenario.items():
        previous_group = previous_by_scenario.get(key)
        if not previous_group:
            continue
        previous_signatures = sorted(result_signature(record) for record in previous_group)
        current_signatures = sorted(result_signature(record) for record in current_group)
        # Adding a new row is allowed when every published result remains present.
        # Replacing or removing any previously published result requires review.
        published_results_preserved = not (Counter(previous_signatures) - Counter(current_signatures))
        if published_results_preserved:
            continue
        change_id = stable_hash(key)
        result_changes.append(change_id)
        review.append({
            "id": f"review-results-{change_id}",
            "priority": "blocking",
            "reasons": ["published_results_changed"],
            "url": current_group[0].get("sourceUrl"),
            "recordIds": [record["id"] for record in current_group],
        })

    surveys: dict[str, dict[str, Any]] = {}
    for record in records:
        key = survey_key(record)
        item = surveys.setdefault(key, {"id": f"survey-{stable_hash(key)}", "countyId": record.get("countyId"), "fieldwork": record.get("fieldwork"), "institute": record.get("institute"), "recordIds": [], "sourceUrls": set(), "scenarios": set()})
        item["recordIds"].append(record["id"])
        if record.get("sourceUrl"):
            item["sourceUrls"].add(record["sourceUrl"])
        item["scenarios"].add(record.get("scenario"))
    survey_groups = []
    for item in surveys.values():
        survey_groups.append({
            "id": item["id"],
            "countyId": item["countyId"],
            "fieldwork": item["fieldwork"],
            "institute": item["institute"],
            "recordIds": item["recordIds"],
            "sourceUrls": sorted(item["sourceUrls"]),
            "scenarioCount": len(item["scenarios"]),
        })

    counts = defaultdict(int)
    for item in sources:
        counts[item["status"]] += 1
    output = {
        "version": 2,
        "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
        "dataGeneratedAt": data.get("generatedAt"),
        "summary": {
            "recordCount": len(records), "surveyCount": len(survey_groups), "sourceCount": len(by_url),
            "checkedSourceCount": counts["reachable"] + counts["restricted"] + counts["unreachable"], "reachableCount": counts["reachable"], "restrictedCount": counts["restricted"],
            "unreachableCount": counts["unreachable"], "notCheckedCount": counts["not-checked"],
            "contentChangedCount": changed_content, "reviewQueueCount": len(review),
            "blockingIssueCount": len(result_changes),
        },
        "sources": sources,
        "surveyGroups": sorted(survey_groups, key=lambda item: item["id"]),
        "reviewQueue": sorted(review, key=lambda item: ({"blocking": 0, "high": 1, "medium": 2}.get(item["priority"], 3), item["id"])),
    }
    if previous_audit and audit_snapshot(previous_audit) == audit_snapshot(output):
        output["generatedAt"] = previous_audit.get("generatedAt", output["generatedAt"])
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    checked_count = counts["reachable"] + counts["restricted"] + counts["unreachable"]
    print(f"Source audit: {checked_count}/{len(by_url)} sources checked; reachable={counts['reachable']}, restricted={counts['restricted']}, unreachable={counts['unreachable']}, review={len(review)}, blocking={len(result_changes)}")
    if result_changes:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
