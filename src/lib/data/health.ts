import pollData from "./generated/public-polls.json";
import pollSourceAudit from "./generated/poll-source-audit.json";

type SourceKind = "public" | "internal" | "primary";

type PollHealthRecord = {
  id: string;
  countyId: string;
  date: string;
  fieldwork?: string;
  institute: string;
  source: string;
  sourceKind?: SourceKind;
  sampleSize?: number;
  method?: string;
  marginOfError?: number;
  publishedAt?: string;
  sourceUrl?: string;
  results: Record<string, number>;
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

type PollSourceAuditSummary = {
  recordCount: number;
  surveyCount: number;
  sourceCount: number;
  checkedSourceCount: number;
  reachableCount: number;
  restrictedCount: number;
  unreachableCount: number;
  notCheckedCount: number;
  contentChangedCount: number;
  reviewQueueCount: number;
  blockingIssueCount: number;
};

type PollSourceReviewItem = {
  id: string;
  priority: "blocking" | "high" | "medium" | "low";
  reasons: string[];
  url?: string | null;
  recordIds: string[];
};

type PollSourceAuditPayload = {
  generatedAt: string;
  dataGeneratedAt?: string;
  summary: PollSourceAuditSummary;
  reviewQueue: PollSourceReviewItem[];
};

const payload = pollData as unknown as HealthPayload;
const sourceAudit = pollSourceAudit as unknown as PollSourceAuditPayload;
const allCountyIds = [
  "taipei", "newtaipei", "taoyuan", "taichung", "tainan", "kaohsiung",
  "keelung", "hsinchu-city", "hsinchu-county", "miaoli", "changhua", "nantou",
  "yunlin", "chiayi-city", "chiayi-county", "pingtung", "yilan", "hualien",
  "taitung", "penghu", "kinmen", "lienchiang",
];

const STALE_AFTER_HOURS = 72;
const SOURCE_AUDIT_STALE_AFTER_HOURS = 36;

function surveyKey(record: PollHealthRecord): string {
  return [
    record.countyId,
    record.fieldwork || record.date,
    record.institute,
    record.sourceUrl || record.source,
  ].join("|");
}

function isValidWebUrl(value?: string): boolean {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export const POLL_RECORDS_BY_COUNTY = Object.fromEntries(
  allCountyIds.map((countyId) => [
    countyId,
    payload.records.filter((record) => record.countyId === countyId).length,
  ]),
);

export function getPollDataHealth(now = new Date()) {
  const checked = new Date(`${payload.checkedAt}T23:59:59+08:00`);
  const ageMs = now.getTime() - checked.getTime();
  const isStale = ageMs > STALE_AFTER_HOURS * 60 * 60 * 1000;
  const kindCounts: Record<SourceKind, number> = { public: 0, internal: 0, primary: 0 };
  for (const record of payload.records) {
    kindCounts[record.sourceKind ?? "public"] += 1;
  }
  const duplicateIdCount = payload.records.length - new Set(payload.records.map((record) => record.id)).size;
  const invalidSourceUrlCount = payload.records.filter((record) => !isValidWebUrl(record.sourceUrl)).length;
  const invalidResultCount = payload.records.filter((record) => {
    const values = Object.values(record.results ?? {});
    return values.length < 2 || values.some((value) => !Number.isFinite(value) || value < 0 || value > 100);
  }).length;
  const structureBlockingIssueCount = duplicateIdCount + invalidSourceUrlCount + invalidResultCount;
  const sourceAuditAgeMs = now.getTime() - new Date(sourceAudit.generatedAt).getTime();
  const sourceAuditIsStale = !Number.isFinite(sourceAuditAgeMs)
    || sourceAuditAgeMs > SOURCE_AUDIT_STALE_AFTER_HOURS * 60 * 60 * 1000;
  const blockingIssueCount = structureBlockingIssueCount + sourceAudit.summary.blockingIssueCount;
  const rowsWithFullMethodology = payload.records.filter((record) =>
    Boolean(
      record.fieldwork
      && record.publishedAt
      && record.sampleSize
      && record.method
      && record.marginOfError !== undefined
      && record.sourceUrl,
    ),
  ).length;
  const generatedAt = payload.generatedAt ?? `${payload.checkedAt}T00:00:00Z`;
  return {
    status: blockingIssueCount > 0 ? "blocked" as const : isStale || sourceAuditIsStale ? "stale" as const : "healthy" as const,
    checkedAt: payload.checkedAt,
    generatedAt,
    staleAfterHours: STALE_AFTER_HOURS,
    sourceAuditStaleAfterHours: SOURCE_AUDIT_STALE_AFTER_HOURS,
    scheduleLabel: "每小時第 17、47 分檢查",
    recordCount: payload.recordCount,
    surveyCount: new Set(payload.records.map(surveyKey)).size,
    countyCount: payload.countyCount,
    totalCountyCount: allCountyIds.length,
    sourceCount: new Set(payload.records.map((record) => record.source)).size,
    sourceDomainCount: new Set(payload.records.flatMap((record) => {
      if (!record.sourceUrl) return [];
      try {
        return [new URL(record.sourceUrl).hostname.replace(/^www\./, "")];
      } catch {
        return [];
      }
    })).size,
    latestPollDate: payload.records.reduce(
      (latest, record) => record.date > latest ? record.date : latest,
      "",
    ),
    sourceKindCounts: kindCounts,
    missingCountyIds: allCountyIds.filter((id) => !payload.countyIds.includes(id)),
    rowsMissingSampleSize: payload.records.filter((record) => !record.sampleSize).length,
    rowsMissingMethod: payload.records.filter((record) => !record.method).length,
    rowsMissingPublishedAt: payload.records.filter((record) => !record.publishedAt).length,
    rowsMissingMarginOfError: payload.records.filter((record) => record.marginOfError === undefined).length,
    rowsWithFullMethodology,
    duplicateIdCount,
    invalidSourceUrlCount,
    invalidResultCount,
    structureBlockingIssueCount,
    blockingIssueCount,
    sourceAudit: {
      generatedAt: sourceAudit.generatedAt,
      isStale: sourceAuditIsStale,
      ...sourceAudit.summary,
      reviewQueue: sourceAudit.reviewQueue.slice(0, 12),
    },
    indexUrl: payload.indexUrl,
  };
}
