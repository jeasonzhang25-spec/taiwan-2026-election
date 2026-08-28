import { NextResponse } from "next/server";
import {
  isPollPublicationBlackout,
  type ExternalFeedItem,
  type ExternalFeedKind,
} from "@/lib/data/external";

export const revalidate = 1800;

const FEEDS: { kind: ExternalFeedKind; url: string }[] = [
  {
    kind: "poll",
    url: "https://news.google.com/rss/search?q=2026%20%E4%B9%9D%E5%90%88%E4%B8%80%20%E6%B0%91%E8%AA%BF&hl=zh-TW&gl=TW&ceid=TW%3Azh-Hant",
  },
  {
    kind: "analysis",
    url: "https://news.google.com/rss/search?q=2026%20%E4%B9%9D%E5%90%88%E4%B8%80%20%E9%81%B8%E6%83%85%20%E5%88%86%E6%9E%90&hl=zh-TW&gl=TW&ceid=TW%3Azh-Hant",
  },
];

function decodeEntities(value: string): string {
  const entities: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
  };

  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&(amp|lt|gt|quot|#39);/g, (match) => entities[match] ?? match)
    .replace(/<[^>]*>/g, "")
    .trim();
}

function tagValue(block: string, tag: string): string {
  const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeEntities(match[1]) : "";
}

function safeHttpsUrl(value: string): string | null {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function parseFeed(xml: string, kind: ExternalFeedKind): ExternalFeedItem[] {
  const blocks = xml.match(/<item>[\s\S]*?<\/item>/gi) ?? [];

  return blocks.slice(0, 8).flatMap((block, index) => {
    const rawTitle = tagValue(block, "title");
    const url = safeHttpsUrl(tagValue(block, "link"));
    const publishedAt = tagValue(block, "pubDate");
    const source = tagValue(block, "source") || "外部媒体";
    const title = rawTitle.endsWith(` - ${source}`)
      ? rawTitle.slice(0, -(source.length + 3)).trim()
      : rawTitle;

    if (!title || !url || !publishedAt) return [];

    return [
      {
        id: `${kind}-${publishedAt}-${index}`,
        kind,
        title,
        source,
        url,
        publishedAt,
      },
    ];
  });
}

async function fetchFeed(feed: (typeof FEEDS)[number]): Promise<ExternalFeedItem[]> {
  const response = await fetch(feed.url, {
    headers: { "User-Agent": "IslandElectionDashboard/0.1" },
    next: { revalidate: 1800 },
  });

  if (!response.ok) throw new Error(`Feed responded ${response.status}`);
  return parseFeed(await response.text(), feed.kind);
}

export async function GET() {
  const now = new Date();
  const blackout = isPollPublicationBlackout(now);
  const activeFeeds = blackout ? FEEDS.filter((feed) => feed.kind === "analysis") : FEEDS;
  const settled = await Promise.allSettled(activeFeeds.map(fetchFeed));
  const items = settled.flatMap((result) =>
    result.status === "fulfilled" ? result.value : [],
  );
  const uniqueItems = Array.from(
    items.reduce((map, item) => {
      const key = item.title.replace(/\s+/g, " ").trim();
      const current = map.get(key);
      if (!current || (current.kind === "analysis" && item.kind === "poll" && /民調/.test(key))) {
        map.set(key, item);
      }
      return map;
    }, new Map<string, ExternalFeedItem>()).values(),
  );
  const filteredItems = blackout
    ? uniqueItems.filter((item) => !/民調|支持度|領先\s*\d|落後\s*\d/.test(item.title))
    : uniqueItems;

  return NextResponse.json(
    {
      items: filteredItems,
      fetchedAt: now.toISOString(),
      blackout,
      partial: settled.some((result) => result.status === "rejected"),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
      },
    },
  );
}
