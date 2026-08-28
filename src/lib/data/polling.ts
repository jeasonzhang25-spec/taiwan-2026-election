import pollData from "./generated/public-polls.json";
import type { Candidate, CountyPollTrend, PartyId, PollPoint, PollRecord, PollSeries } from "../types";

type GeneratedRecord = Omit<PollRecord, "sourceUrl"> & {
  countyId: string;
  sourceUrl?: string | null;
};

type GeneratedPayload = {
  checkedAt: string;
  generatedAt?: string;
  indexUrl: string;
  recordCount: number;
  countyCount: number;
  countyIds: string[];
  records: GeneratedRecord[];
  candidates: Record<string, Candidate[]>;
};

const payload = pollData as unknown as GeneratedPayload;

/** 由逐筆公開調查建構序列；不做跨機構平均或平滑。 */
export function buildSeries(countyId: string, records: PollRecord[]): CountyPollTrend {
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
  const byCandidate = new Map<string, PollPoint[]>();
  for (const record of sorted) {
    for (const [candidateId, value] of Object.entries(record.results)) {
      if (!byCandidate.has(candidateId)) byCandidate.set(candidateId, []);
      byCandidate.get(candidateId)!.push({
        recordId: record.id,
        date: record.date,
        value,
        marginError: record.marginOfError,
        institute: record.institute,
        sampleSize: record.sampleSize,
        scenario: record.scenario,
      });
    }
  }
  const series: PollSeries[] = Array.from(byCandidate, ([candidateId, points]) => ({ candidateId, points }));
  return { countyId, series, events: [], records: sorted };
}

/**
 * 公開民調資料庫。每一筆代表一個已公布的問卷情境；同一調查若公布
 * 多組對戰組合，會保留為多筆，不把不同題目合併成虛構平均。
 */
export const MAJOR_CITY_POLLS: Record<string, PollRecord[]> = payload.records.reduce(
  (grouped, generated) => {
    const { countyId, sourceUrl, ...record } = generated;
    if (!grouped[countyId]) grouped[countyId] = [];
    grouped[countyId].push({ ...record, sourceUrl: sourceUrl || undefined });
    return grouped;
  },
  {} as Record<string, PollRecord[]>,
);

export const POLL_CANDIDATES: Record<string, Candidate[]> = Object.fromEntries(
  Object.entries(payload.candidates).map(([countyId, candidates]) => [
    countyId,
    candidates.map((item) => ({
      ...item,
      partyId: item.partyId as PartyId,
      status: "poll-option" as const,
    })),
  ]),
);

export const POLL_DATA_CHECKED_AT = payload.checkedAt;
export const POLL_DATA_GENERATED_AT = payload.generatedAt ?? `${payload.checkedAt}T00:00:00Z`;
export const POLL_INDEX_URL = payload.indexUrl;
export const POLL_RECORD_COUNT = payload.recordCount;
export const POLL_COUNTY_COUNT = payload.countyCount;
export const POLL_COUNTY_IDS = payload.countyIds;

export const MAJOR_CITY_TRENDS: Record<string, CountyPollTrend> = Object.fromEntries(
  Object.entries(MAJOR_CITY_POLLS).map(([id, records]) => [id, buildSeries(id, records)]),
);

/** 有逐筆候選人支持度數字的縣市，依全台地圖慣用順序排列。 */
const COUNTY_ORDER = [
  "taipei", "newtaipei", "taoyuan", "taichung", "tainan", "kaohsiung",
  "keelung", "hsinchu-city", "hsinchu-county", "miaoli", "changhua", "nantou",
  "yunlin", "chiayi-city", "chiayi-county", "pingtung", "yilan", "hualien",
  "taitung", "penghu", "kinmen", "lienchiang",
];

export const MAJOR_CITY_IDS = COUNTY_ORDER.filter((id) => Boolean(MAJOR_CITY_POLLS[id]?.length));
