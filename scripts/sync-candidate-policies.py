#!/usr/bin/env python3
"""Discover policy statements for every registered county-level candidate.

Discovery never writes a headline into the verified policy dataset. It creates a
review queue with an exact candidate match, source URL and timestamp; verified
records continue to require a primary source or a direct report.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import quote
from xml.etree import ElementTree

import requests


ROOT = Path(__file__).resolve().parents[1]
REGISTRY_PATH = ROOT / "src/lib/data/generated/candidate-registrations.json"
POLICIES_PATH = ROOT / "src/lib/data/policies.ts"
AUDIT_PATH = ROOT / "src/lib/data/generated/candidate-policy-audit.json"
POLICY_TERMS = re.compile(r"政見|政策|白皮書|願景|主張|方案|建設|福利|交通|住宅|教育|醫療|長照|產業|防災")


def current_policy_counts() -> tuple[dict[str, int], set[str]]:
    source = POLICIES_PATH.read_text(encoding="utf-8")
    counts: dict[str, int] = {}
    for candidate_id in re.findall(r'candidateId:\s*"([^"]+)"', source):
        counts[candidate_id] = counts.get(candidate_id, 0) + 1
    urls = set(re.findall(r'sourceUrl:\s*"(https://[^"]+)"', source))
    return counts, urls


def feed_url(county_name: str) -> str:
    query = f'2026 {county_name} 長 選舉 (政見 OR 政策 OR 願景 OR 方案)'
    return f"https://news.google.com/rss/search?q={quote(query)}&hl=zh-TW&gl=TW&ceid=TW:zh-Hant"


def fetch_feed(county_id: str, county_name: str, candidates: list[dict[str, Any]]) -> tuple[str, list[dict[str, Any]], str]:
    url = feed_url(county_name)
    response = requests.get(url, timeout=15, headers={"User-Agent": "IslandElectionDashboard/0.2"})
    response.raise_for_status()
    root = ElementTree.fromstring(response.content)
    rows: list[dict[str, Any]] = []
    for item in root.findall(".//item")[:40]:
        title = (item.findtext("title") or "").strip()
        link = (item.findtext("link") or "").strip()
        published_at = (item.findtext("pubDate") or "").strip()
        source_node = item.find("source")
        source_name = (source_node.text or "外部媒體").strip() if source_node is not None else "外部媒體"
        if not title or not link or not POLICY_TERMS.search(title):
            continue
        matched = [candidate for candidate in candidates if candidate["name"] in title]
        for candidate in matched:
            rows.append(
                {
                    "id": f"{county_id}-{candidate['name']}-{hashlib.sha256(link.encode('utf-8')).hexdigest()[:12]}",
                    "countyId": county_id,
                    "candidateId": f"{county_id}-{candidate['name']}",
                    "candidateName": candidate["name"],
                    "title": title,
                    "sourceName": source_name,
                    "sourceUrl": link,
                    "publishedAt": published_at,
                    "reason": "candidate_name_and_policy_term_matched",
                }
            )
    return county_id, rows, url


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
    AUDIT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--offline", action="store_true", help="Build coverage without fetching feeds")
    parser.add_argument("--no-write", action="store_true", help="Validate without replacing the audit artifact")
    args = parser.parse_args()
    registry = json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))
    policy_counts, known_urls = current_policy_counts()
    county_names = {
        "taipei": "台北市", "newtaipei": "新北市", "taoyuan": "桃園市", "taichung": "台中市",
        "tainan": "台南市", "kaohsiung": "高雄市", "keelung": "基隆市", "hsinchu-city": "新竹市",
        "hsinchu-county": "新竹縣", "miaoli": "苗栗縣", "changhua": "彰化縣", "nantou": "南投縣",
        "yunlin": "雲林縣", "chiayi-city": "嘉義市", "chiayi-county": "嘉義縣", "pingtung": "屏東縣",
        "yilan": "宜蘭縣", "hualien": "花蓮縣", "taitung": "台東縣", "penghu": "澎湖縣",
        "kinmen": "金門縣", "lienchiang": "連江縣",
    }
    successful_feeds = 0
    failed_feeds: list[dict[str, str]] = []
    discovered: list[dict[str, Any]] = []
    feed_rows: list[dict[str, Any]] = []
    if not args.offline:
        with ThreadPoolExecutor(max_workers=8) as executor:
            futures = {
                executor.submit(fetch_feed, county_id, county_names[county_id], candidates): county_id
                for county_id, candidates in registry["candidates"].items()
            }
            for future in as_completed(futures):
                county_id = futures[future]
                try:
                    _, rows, url = future.result()
                    successful_feeds += 1
                    discovered.extend(rows)
                    feed_rows.append({"countyId": county_id, "url": url, "status": "reachable", "itemCount": len(rows)})
                except Exception as error:  # network errors should not break the published site
                    failed_feeds.append({"countyId": county_id, "reason": type(error).__name__})
                    feed_rows.append({"countyId": county_id, "url": feed_url(county_names[county_id]), "status": "unreachable", "itemCount": 0})
    else:
        feed_rows = [
            {"countyId": county_id, "url": feed_url(county_names[county_id]), "status": "not-checked", "itemCount": 0}
            for county_id in registry["candidates"]
        ]

    unique: dict[str, dict[str, Any]] = {}
    for item in discovered:
        if item["sourceUrl"] in known_urls:
            continue
        key = f"{item['candidateId']}|{item['title']}"
        unique[key] = item
    review_queue = sorted(unique.values(), key=lambda item: (item["countyId"], item["candidateName"], item["title"]))
    coverage = []
    for county_id, candidates in registry["candidates"].items():
        for candidate in candidates:
            candidate_id = f"{county_id}-{candidate['name']}"
            queue_count = sum(item["candidateId"] == candidate_id for item in review_queue)
            verified_count = policy_counts.get(candidate_id, 0)
            coverage.append(
                {
                    "countyId": county_id,
                    "candidateId": candidate_id,
                    "candidateName": candidate["name"],
                    "verifiedPolicyCount": verified_count,
                    "reviewQueueCount": queue_count,
                    "status": "verified" if verified_count else "monitoring",
                }
            )

    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "summary": {
            "candidateCount": len(coverage),
            "coveredCandidateCount": sum(item["verifiedPolicyCount"] > 0 for item in coverage),
            "verifiedPolicyCount": sum(item["verifiedPolicyCount"] for item in coverage),
            "monitoredFeedCount": len(feed_rows),
            "successfulFeedCount": successful_feeds,
            "failedFeedCount": len(failed_feeds),
            "reviewQueueCount": len(review_queue),
        },
        "candidates": coverage,
        "feeds": sorted(feed_rows, key=lambda item: item["countyId"]),
        "failedFeeds": failed_feeds,
        "reviewQueue": review_queue[:250],
    }
    if not args.no_write:
        stable_write(payload)
    print(
        f"Policy monitor: {len(coverage)} candidates, {sum(item['verifiedPolicyCount'] for item in coverage)} "
        f"verified policies, {len(review_queue)} discoveries awaiting review"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
