#!/usr/bin/env python3
"""Validate the generated public-poll catalogue before it is published."""

from __future__ import annotations

import argparse
import json
from datetime import date
from pathlib import Path
from typing import Any
from urllib.parse import urlparse


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

        try:
            poll_date = date.fromisoformat(str(record.get("date")))
            if poll_date > date.today():
                errors.append(f"{label}: poll date is in the future")
        except ValueError:
            errors.append(f"{label}: invalid ISO date {record.get('date')!r}")

        if record.get("sourceKind") not in VALID_SOURCE_KINDS:
            errors.append(f"{label}: invalid sourceKind {record.get('sourceKind')!r}")
        if not is_source_url(record.get("sourceUrl")):
            errors.append(f"{label}: sourceUrl must be a valid web URL")
        elif str(record.get("sourceUrl")).startswith("http://"):
            warnings.append(f"{label}: source only provides an HTTP link")

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
    print(
        f"Poll data validation passed: {len(records)} scenarios, "
        f"{len(coverage)} counties, {len(ids)} unique IDs."
    )
    print(
        f"Disclosure note: {missing_sample} rows lack sample size; "
        f"{missing_method} rows lack methodology in the public index."
    )


if __name__ == "__main__":
    main()
