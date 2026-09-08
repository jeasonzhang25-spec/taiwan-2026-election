#!/usr/bin/env python3
"""Validate the complete mayor/county-magistrate registry against public sources.

The published roster is never replaced by a partial response. Network or parsing
problems are written to an audit queue so the last verified registry stays live.
"""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
REGISTRY_PATH = ROOT / "src/lib/data/generated/candidate-registrations.json"
AUDIT_PATH = ROOT / "src/lib/data/generated/candidate-registration-audit.json"
EXPECTED_COUNTIES = 22
EXPECTED_CANDIDATES = 81


def fetch_text(url: str) -> tuple[str, str, int | None]:
    import requests
    from bs4 import BeautifulSoup

    try:
        response = requests.get(
            url,
            timeout=15,
            headers={"User-Agent": "IslandElectionDashboard/0.2 (+public-data-audit)"},
        )
        if response.status_code in {401, 403, 429}:
            return "restricted", "", response.status_code
        response.raise_for_status()
        content_type = response.headers.get("content-type", "")
        if "html" in content_type:
            text = BeautifulSoup(response.text, "html.parser").get_text(" ", strip=True)
        else:
            text = response.content[:250_000].decode("utf-8", errors="ignore")
        return "reachable", text, response.status_code
    except requests.RequestException:
        return "unreachable", "", None


def stable_write(payload: dict[str, Any]) -> None:
    previous: dict[str, Any] | None = None
    if AUDIT_PATH.exists():
        previous = json.loads(AUDIT_PATH.read_text(encoding="utf-8"))
    comparable = {key: value for key, value in payload.items() if key != "generatedAt"}
    previous_comparable = (
        {key: value for key, value in previous.items() if key != "generatedAt"}
        if previous
        else None
    )
    if comparable == previous_comparable:
        return
    AUDIT_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--offline", action="store_true", help="Only validate the local registry")
    parser.add_argument("--no-write", action="store_true", help="Validate without replacing the audit artifact")
    args = parser.parse_args()

    registry = json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))
    candidates_by_county = registry["candidates"]
    flat_candidates = [
        (county_id, candidate)
        for county_id, candidates in candidates_by_county.items()
        for candidate in candidates
    ]
    duplicate_ids = len(flat_candidates) - len(
        {f"{county_id}-{candidate['name']}" for county_id, candidate in flat_candidates}
    )
    local_errors: list[str] = []
    if len(candidates_by_county) != EXPECTED_COUNTIES:
        local_errors.append(f"county_count:{len(candidates_by_county)}")
    if len(flat_candidates) != EXPECTED_CANDIDATES:
        local_errors.append(f"candidate_count:{len(flat_candidates)}")
    if duplicate_ids:
        local_errors.append(f"duplicate_ids:{duplicate_ids}")
    if set(candidates_by_county) != set(registry["sources"]):
        local_errors.append("county_source_mismatch")

    source_rows: list[dict[str, Any]] = []
    aggregate_missing_names: list[str] = []
    if args.offline:
        for county_id, url in registry["sources"].items():
            source_rows.append({"countyId": county_id, "url": url, "status": "not-checked"})
        aggregate_status = "not-checked"
    else:
        for county_id, url in registry["sources"].items():
            status, text, status_code = fetch_text(url)
            source_rows.append(
                {
                    "countyId": county_id,
                    "url": url,
                    "status": status,
                    "statusCode": status_code,
                }
            )
        aggregate_status, aggregate_text, _ = fetch_text(registry["aggregateSourceUrl"])
        if aggregate_status == "reachable":
            aggregate_missing_names = [
                candidate["name"]
                for _, candidate in flat_candidates
                if candidate["name"] not in aggregate_text
            ]

    review_queue = [
        {
            "id": f"candidate-source-{row['countyId']}",
            "priority": "medium",
            "reason": row["status"],
            "countyId": row["countyId"],
            "url": row["url"],
        }
        for row in source_rows
        if row["status"] in {"unreachable", "restricted"}
    ]
    if aggregate_missing_names:
        review_queue.append(
            {
                "id": "candidate-aggregate-difference",
                "priority": "blocking",
                "reason": "registered_names_missing_from_cross_check",
                "names": aggregate_missing_names,
                "url": registry["aggregateSourceUrl"],
            }
        )

    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "registryCheckedAt": registry["checkedAt"],
        "aggregateSourceUrl": registry["aggregateSourceUrl"],
        "aggregateStatus": aggregate_status,
        "summary": {
            "countyCount": len(candidates_by_county),
            "candidateCount": len(flat_candidates),
            "sourceCount": len(source_rows),
            "reachableCount": sum(row["status"] == "reachable" for row in source_rows),
            "restrictedCount": sum(row["status"] == "restricted" for row in source_rows),
            "unreachableCount": sum(row["status"] == "unreachable" for row in source_rows),
            "notCheckedCount": sum(row["status"] == "not-checked" for row in source_rows),
            "localErrorCount": len(local_errors),
            "aggregateMissingNameCount": len(aggregate_missing_names),
            "reviewQueueCount": len(review_queue),
            "blockingIssueCount": len(local_errors) + (1 if aggregate_missing_names else 0),
        },
        "localErrors": local_errors,
        "sources": source_rows,
        "reviewQueue": review_queue,
    }
    if not args.no_write:
        stable_write(payload)
    print(
        f"Candidate registry: {len(candidates_by_county)} counties, "
        f"{len(flat_candidates)} registered candidates, {len(review_queue)} review items"
    )
    return 1 if local_errors or aggregate_missing_names else 0


if __name__ == "__main__":
    raise SystemExit(main())
