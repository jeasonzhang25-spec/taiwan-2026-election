import pollData from "./generated/public-polls.json";

type SourceKind = "public" | "internal" | "primary";

type PollHealthRecord = {
  countyId: string;
  date: string;
  source: string;
  sourceKind?: SourceKind;
  sampleSize?: number;
  method?: string;
  sourceUrl?: string;
};

type HealthPayload = {
  checkedAt: string;
  generatedAt?: string;
  indexUrl: string;
  recordCount: number;
  countyCount: number;
  countyIds: string[];
  records: PollHealthRecord[];
};

const payload = pollData as unknown as HealthPayload;
const allCountyIds = [
  "taipei", "newtaipei", "taoyuan", "taichung", "tainan", "kaohsiung",
  "keelung", "hsinchu-city", "hsinchu-county", "miaoli", "changhua", "nantou",
  "yunlin", "chiayi-city", "chiayi-county", "pingtung", "yilan", "hualien",
  "taitung", "penghu", "kinmen", "lienchiang",
];

export const POLL_RECORDS_BY_COUNTY = Object.fromEntries(
  allCountyIds.map((countyId) => [
    countyId,
    payload.records.filter((record) => record.countyId === countyId).length,
  ]),
);

export function getPollDataHealth(now = new Date()) {
  const checked = new Date(`${payload.checkedAt}T23:59:59+08:00`);
  const ageMs = now.getTime() - checked.getTime();
  const isStale = ageMs > 72 * 60 * 60 * 1000;
  const kindCounts: Record<SourceKind, number> = { public: 0, internal: 0, primary: 0 };
  for (const record of payload.records) {
    kindCounts[record.sourceKind ?? "public"] += 1;
  }
  return {
    status: isStale ? "stale" as const : "healthy" as const,
    checkedAt: payload.checkedAt,
    generatedAt: payload.generatedAt ?? `${payload.checkedAt}T00:00:00Z`,
    recordCount: payload.recordCount,
    countyCount: payload.countyCount,
    totalCountyCount: allCountyIds.length,
    sourceCount: new Set(payload.records.map((record) => record.source)).size,
    latestPollDate: payload.records.reduce(
      (latest, record) => record.date > latest ? record.date : latest,
      "",
    ),
    sourceKindCounts: kindCounts,
    missingCountyIds: allCountyIds.filter((id) => !payload.countyIds.includes(id)),
    rowsMissingSampleSize: payload.records.filter((record) => !record.sampleSize).length,
    rowsMissingMethod: payload.records.filter((record) => !record.method).length,
    indexUrl: payload.indexUrl,
  };
}
