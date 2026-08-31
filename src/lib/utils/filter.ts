import type { CountyRace, FilterState, PollRecord } from "../types";
import { MAJOR_CITY_POLLS } from "../data/polling";
import { leadingPartyId } from "./format";

const SOURCE_KIND_RANK = { primary: 0, internal: 1, public: 2 } as const;

function sortPollRecords(records: PollRecord[]): PollRecord[] {
  return [...records].sort((a, b) =>
    a.date.localeCompare(b.date)
    || (SOURCE_KIND_RANK[a.sourceKind ?? "public"] - SOURCE_KIND_RANK[b.sourceKind ?? "public"])
    || Object.keys(a.results).length - Object.keys(b.results).length
    || a.id.localeCompare(b.id),
  );
}

function marginFor(record: PollRecord): number {
  const ordered = Object.values(record.results).sort((a, b) => b - a);
  return Number(((ordered[0] ?? 0) - (ordered[1] ?? 0)).toFixed(2));
}

/** 取得縣市的領先者政黨 */
export function getLeadingParty(county: CountyRace) {
  return leadingPartyId(county.leadingId, county.candidates);
}

/**
 * 依日期與來源產生單一縣市的真實資料快照。
 * 只使用截止日當天或之前的紀錄，避免歷史視圖誤用未來民調。
 */
export function buildCountySnapshot(
  county: CountyRace,
  filter: FilterState,
): CountyRace {
  const records = sortPollRecords(
    filterPollRecords(MAJOR_CITY_POLLS[county.id] ?? [], filter),
  );
  const record = records.at(-1);

  if (!record) {
    const boundary = filter.date ? `${filter.date} 以前` : "目前";
    const source = filter.source === "all" ? "已收錄來源" : `「${filter.source}」`;
    return {
      ...county,
      latestSupport: {},
      leadingId: "",
      margin: 0,
      competitiveness: "insufficient",
      change: 0,
      changeNote: undefined,
      lastPollDate: "",
      dataStatus: "insufficient",
      dataSource: undefined,
      dataSourceUrl: undefined,
      dataNote: `${boundary}，${source}沒有可用的候選人支持度民調。`,
    };
  }

  const ordered = Object.entries(record.results).sort((a, b) => b[1] - a[1]);
  const leadingId = ordered[0]?.[0] ?? "";
  const runnerId = ordered[1]?.[0] ?? "";
  const margin = marginFor(record);
  const previous = [...records]
    .reverse()
    .find((candidate) =>
      candidate.id !== record.id
      && candidate.date < record.date
      && leadingId in candidate.results
      && runnerId in candidate.results,
    );
  const previousMargin = previous
    ? (previous.results[leadingId] ?? 0) - (previous.results[runnerId] ?? 0)
    : margin;
  const change = Number((margin - previousMargin).toFixed(2));

  return {
    ...county,
    latestSupport: { ...record.results },
    leadingId,
    margin,
    competitiveness:
      record.marginOfError !== undefined && margin <= record.marginOfError
        ? "tossup"
        : margin <= 10
          ? "slim-lead"
          : "stable-lead",
    change,
    changeNote: previous
      ? `相較 ${previous.date} 的可比情境，領先差距${change >= 0 ? "增加" : "減少"} ${Math.abs(change).toFixed(1)} 個百分點。`
      : "目前篩選範圍內沒有更早的可比情境。",
    lastPollDate: record.date,
    dataStatus: "verified-poll",
    dataSource: record.source,
    dataSourceUrl: record.sourceUrl,
    dataNote: `快照採用截至所選日期的最新一筆「${record.scenario ?? "候選人支持度"}」題目（${record.institute}，${record.date}）；同日其他組合仍保留於民調表。人名為問卷選項，不代表已完成候選人登記。`,
  };
}

/** 先依日期與來源建立 22 縣市快照。 */
export function buildCountySnapshots(
  counties: CountyRace[],
  filter: FilterState,
): CountyRace[] {
  return counties.map((county) => buildCountySnapshot(county, filter));
}

/** 再依選舉類型與領先政黨過濾已生成的快照。 */
export function filterCountySnapshots(
  snapshots: CountyRace[],
  filter: FilterState,
): CountyRace[] {
  let list = snapshots;

  if (filter.electionType !== "mayor") {
    list = list.filter((c) => c.electionType === filter.electionType);
  }

  if (filter.party !== "all") {
    list = list.filter(
      (c) => c.dataStatus === "verified-poll" && getLeadingParty(c) === filter.party,
    );
  }

  return list;
}

/** 依全部篩選器產生並過濾縣市快照（displayMode 只影響著色）。 */
export function filterCounties(
  counties: CountyRace[],
  filter: FilterState,
): CountyRace[] {
  return filterCountySnapshots(buildCountySnapshots(counties, filter), filter);
}

/** 篩選在所選日期與來源範圍內的逐筆民調。 */
export function filterPollRecords(
  records: PollRecord[],
  filter: FilterState,
): PollRecord[] {
  if (filter.electionType !== "mayor") return [];
  return records.filter((record) => {
    if (filter.source !== "all" && record.institute !== filter.source) return false;
    if (filter.date && record.date > filter.date) return false;
    return true;
  });
}

/** 計算各黨領先縣市數量 */
export function countLeadingByParty(
  counties: CountyRace[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const c of counties) {
    if (c.dataStatus !== "verified-poll") continue;
    // 五五波是獨立狀態，不應再重複計入某一政黨。
    if (c.competitiveness === "tossup") continue;
    const p = getLeadingParty(c);
    counts[p] = (counts[p] ?? 0) + 1;
  }
  return counts;
}

/** 計算膠著縣市數量 */
export function countTossups(counties: CountyRace[]): number {
  return counties.filter((c) => c.competitiveness === "tossup").length;
}

export function countInsufficient(counties: CountyRace[]): number {
  return counties.filter((c) => c.dataStatus === "insufficient").length;
}

/** 依「競爭程度」排序（越膠著越靠前，用於關鍵選區） */
export function sortByCompetitiveness(counties: CountyRace[]): CountyRace[] {
  const rank: Record<string, number> = {
    tossup: 0,
    "likely-flip": 1,
    "slim-lead": 2,
    "stable-lead": 3,
    insufficient: 4,
  };
  return [...counties].sort(
    (a, b) =>
      (rank[a.competitiveness] ?? 4) - (rank[b.competitiveness] ?? 4) ||
      a.margin - b.margin,
  );
}

/** 取得某縣市領先者與第二名（用於關鍵選區、表格） */
export function topTwo(county: CountyRace) {
  const sorted = [...county.candidates].sort(
    (a, b) =>
      (county.latestSupport[b.id] ?? 0) - (county.latestSupport[a.id] ?? 0),
  );
  return { leader: sorted[0], runner: sorted[1] };
}
