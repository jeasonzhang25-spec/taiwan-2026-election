import type { NextRequest } from "next/server";
import { COUNTY_MAP } from "@/lib/data/counties";
import { MAJOR_CITY_POLLS, POLL_CANDIDATES } from "@/lib/data/polling";

export const dynamic = "force-dynamic";

function xml(value: string | number) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET(request: NextRequest) {
  const countyId = request.nextUrl.searchParams.get("countyId") ?? "";
  const source = request.nextUrl.searchParams.get("source");
  const county = COUNTY_MAP[countyId];
  const allRecords = MAJOR_CITY_POLLS[countyId];
  if (!county || !allRecords) {
    return new Response("Unknown county", { status: 400, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
  const records = allRecords
    .filter((record) => !source || record.source === source)
    .sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
  const candidateNames = new Map((POLL_CANDIDATES[countyId] ?? []).map((candidate) => [candidate.id, candidate.name]));
  const pageUrl = `${request.nextUrl.origin}/county/${countyId}`;
  const title = source ? `${county.name} · ${source} 民調更新` : `${county.name}公開民調更新`;
  const items = records.map((record) => {
    const results = Object.entries(record.results)
      .sort((a, b) => b[1] - a[1])
      .map(([id, value]) => `${candidateNames.get(id) ?? id} ${value}%`)
      .join("、");
    const link = record.sourceUrl ?? `${pageUrl}#poll-comparison`;
    return `<item>
      <title>${xml(`${record.date}｜${record.source}｜${record.scenario ?? "候選人支持度"}`)}</title>
      <link>${xml(link)}</link>
      <guid isPermaLink="false">${xml(record.id)}</guid>
      <pubDate>${xml(new Date(`${record.date}T12:00:00+08:00`).toUTCString())}</pubDate>
      <description>${xml(`${results}。${record.sampleSize ? `樣本 ${record.sampleSize}` : "樣本數未揭露"}；${record.method ?? "調查方法未揭露"}。`)}</description>
    </item>`;
  }).join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${xml(title)}</title>
    <link>${xml(pageUrl)}</link>
    <description>${xml(`${county.name}逐筆公開民調更新；不同問卷情境分開發布。`)}</description>
    <language>zh-TW</language>
    <lastBuildDate>${xml(new Date().toUTCString())}</lastBuildDate>
    ${items}
  </channel>
</rss>`;
  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=1800",
    },
  });
}
