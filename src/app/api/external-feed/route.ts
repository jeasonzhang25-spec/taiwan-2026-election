import { NextResponse } from "next/server";
import {
  isPollPublicationBlackout,
  type ExternalFeedItem,
  type ExternalFeedKind,
} from "@/lib/data/external";

export const revalidate = 300;

type FeedDefinition = {
  kind: ExternalFeedKind;
  query: string;
  topic: string;
};

const FEED_DEFINITIONS: FeedDefinition[] = [
  { kind: "news", query: "2026 九合一 選舉", topic: "全台" },
  { kind: "poll", query: "2026 九合一 民調", topic: "全台" },
  { kind: "analysis", query: "2026 九合一 選情 分析", topic: "全台" },
  { kind: "commentary", query: "2026 九合一 名嘴 評論", topic: "評論" },
  { kind: "commentary", query: "2026 縣市長 評論", topic: "評論" },
  { kind: "commentary", query: "2026 地方選舉 名嘴 解析", topic: "評論" },
  { kind: "commentary", query: "2026 九合一 觀點 投書", topic: "評論" },
  { kind: "commentary", query: "2026 縣市長 社論", topic: "評論" },
  { kind: "analysis", query: "2026 地方選舉 選情 評析", topic: "全台" },
  { kind: "news", query: "2026 台北市長 選舉", topic: "台北市" },
  { kind: "news", query: "2026 新北市長 選舉", topic: "新北市" },
  { kind: "news", query: "2026 桃園市長 選舉", topic: "桃園市" },
  { kind: "news", query: "2026 台中市長 選舉", topic: "台中市" },
  { kind: "news", query: "2026 台南市長 選舉", topic: "台南市" },
  { kind: "news", query: "2026 高雄市長 選舉", topic: "高雄市" },
];

const FEEDS = FEED_DEFINITIONS.map((feed) => ({
  ...feed,
  url: `https://news.google.com/rss/search?q=${encodeURIComponent(feed.query)}&hl=zh-TW&gl=TW&ceid=TW%3Azh-Hant`,
}));

const ITEMS_PER_FEED = 20;
const MAX_ITEMS = 72;
const MAX_ITEMS_PER_SOURCE = 8;
const MIN_ITEMS_PER_KIND = 12;
const KIND_PRIORITY: Record<ExternalFeedKind, number> = {
  news: 0,
  analysis: 1,
  commentary: 2,
  poll: 3,
};

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

function inferKind(title: string, fallback: ExternalFeedKind): ExternalFeedKind {
  if (/民調|支持度|好感度|領先|落後|五五波|調查出爐/.test(title)) return "poll";
  if (/名嘴|評論|社論|投書|預言|斷言|觀點|看法|推演|看好|看衰/.test(title)) return "commentary";
  if (/選情|戰況|布局|盤點|分析|評析|解析|評估|攻防|勝算|戰略|結構差異|觀察點/.test(title)) return "analysis";
  if (fallback === "commentary" || fallback === "analysis") return "news";
  return fallback;
}

function isElectionRelated(title: string): boolean {
  return /2026|九合一|地方選舉|縣市長|市長|縣長|選情|民調|參選|候選|提名/.test(title);
}

function parseFeed(xml: string, feed: (typeof FEEDS)[number]): ExternalFeedItem[] {
  const blocks = xml.match(/<item>[\s\S]*?<\/item>/gi) ?? [];

  return blocks.slice(0, ITEMS_PER_FEED).flatMap((block, index) => {
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
        id: `${feed.kind}-${feed.topic}-${publishedAt}-${index}`,
        kind: inferKind(title, feed.kind),
        title,
        source,
        url,
        publishedAt,
        topic: feed.topic,
      },
    ];
  });
}

async function fetchFeed(feed: (typeof FEEDS)[number]): Promise<ExternalFeedItem[]> {
  const response = await fetch(feed.url, {
    headers: { "User-Agent": "IslandElectionDashboard/0.1" },
    next: { revalidate: 300 },
  });

  if (!response.ok) throw new Error(`Feed responded ${response.status}`);
  return parseFeed(await response.text(), feed);
}

export async function GET() {
  const now = new Date();
  const blackout = isPollPublicationBlackout(now);
  const activeFeeds = blackout ? FEEDS.filter((feed) => feed.kind === "analysis") : FEEDS;
  const settled = await Promise.allSettled(activeFeeds.map(fetchFeed));
  const items = settled.flatMap((result) =>
    result.status === "fulfilled" ? result.value : [],
  );
  const uniqueItems = Array.from(items.reduce((map, item) => {
    const key = item.url || item.title.replace(/[\s｜|]+/g, " ").trim().toLocaleLowerCase("zh-Hant");
    const current = map.get(key);
    if (!current || KIND_PRIORITY[item.kind] > KIND_PRIORITY[current.kind]) map.set(key, item);
    return map;
  }, new Map<string, ExternalFeedItem>()).values())
    .filter((item) => isElectionRelated(item.title))
    .filter((item) => !Number.isNaN(Date.parse(item.publishedAt)))
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  const filteredItems = blackout
    ? uniqueItems.filter((item) => !/民調|支持度|領先\s*\d|落後\s*\d/.test(item.title))
    : uniqueItems;
  const sourceCounts = new Map<string, number>();
  const selectedUrls = new Set<string>();
  const balancedItems: ExternalFeedItem[] = [];
  function addItem(item: ExternalFeedItem) {
    if (selectedUrls.has(item.url)) return false;
    const count = sourceCounts.get(item.source) ?? 0;
    if (count >= MAX_ITEMS_PER_SOURCE) return false;
    sourceCounts.set(item.source, count + 1);
    selectedUrls.add(item.url);
    balancedItems.push(item);
    return true;
  }
  (["commentary", "analysis", "poll", "news"] as ExternalFeedKind[]).forEach((kind) => {
    let added = 0;
    for (const item of filteredItems) {
      if (item.kind !== kind || added >= MIN_ITEMS_PER_KIND) continue;
      if (addItem(item)) added += 1;
    }
  });
  for (const item of filteredItems) {
    if (balancedItems.length >= MAX_ITEMS) break;
    addItem(item);
  }
  balancedItems.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

  return NextResponse.json(
    {
      items: balancedItems,
      fetchedAt: now.toISOString(),
      blackout,
      partial: settled.some((result) => result.status === "rejected"),
      successfulFeeds: settled.filter((result) => result.status === "fulfilled").length,
      totalFeeds: activeFeeds.length,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900",
      },
    },
  );
}
