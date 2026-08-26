import type { CountyRace, FilterState, PollRecord } from "../types";
import { leadingPartyId } from "./format";

/** 取得縣市的領先者政黨 */
export function getLeadingParty(county: CountyRace) {
  return leadingPartyId(county.leadingId, county.candidates);
}

/** 依篩選器過濾縣市（不含 displayMode，displayMode 只影響著色） */
export function filterCounties(
  counties: CountyRace[],
  filter: FilterState,
): CountyRace[] {
  let list = counties;

  if (filter.electionType !== "mayor") {
    list = list.filter((c) => c.electionType === filter.electionType);
  }

  if (filter.party !== "all") {
    list = list.filter((c) => getLeadingParty(c) === filter.party);
  }

  return list;
}

/** 篩選有逐筆紀錄的民調；縣市摘要沒有歷史快照，不在此假裝回溯。 */
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
