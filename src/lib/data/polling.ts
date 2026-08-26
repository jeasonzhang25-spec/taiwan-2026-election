// ============================================================
// 民調趨勢模擬資料
// ⚠️ 本檔案內所有機構、數字、日期皆為「演示用虛構資料」，
//    僅用於介面展示，不代表任何真實民調或真實選情。
//    候選人一律使用「候選人A／B／C」等虛構代稱。
// ============================================================

import type {
  PollRecord,
  PollPoint,
  PollSeries,
  CountyPollTrend,
  EventMark,
} from "../types";

/** 民調 wave 的緊湊定義 */
interface WaveDef {
  date: string;
  institute: string;
  sample: number;
  method: string;
  moe: number;
  results: Record<string, number>; // candidateId -> %
}

function mkRecords(countyId: string, waves: WaveDef[]): PollRecord[] {
  return waves.map((w, i) => ({
    id: `${countyId}-p${i + 1}`,
    institute: w.institute,
    date: w.date,
    sampleSize: w.sample,
    method: w.method,
    marginOfError: w.moe,
    source: w.institute,
    sourceUrl: "", // 預留來源連結位置
    publishedAt: `${w.date} 10:00`,
    results: w.results,
  }));
}

/** 由民調記錄建構候選人趨勢序列 */
export function buildSeries(
  countyId: string,
  records: PollRecord[],
): CountyPollTrend {
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
  const byCandidate = new Map<string, PollPoint[]>();

  for (const r of sorted) {
    for (const [cid, value] of Object.entries(r.results)) {
      if (!byCandidate.has(cid)) byCandidate.set(cid, []);
      byCandidate.get(cid)!.push({
        date: r.date,
        value,
        marginError: r.marginOfError,
        institute: r.institute,
        sampleSize: r.sampleSize,
      });
    }
  }

  const series: PollSeries[] = Array.from(byCandidate.entries()).map(
    ([candidateId, points]) => ({ candidateId, points }),
  );

  return {
    countyId,
    series,
    events: EVENTS[countyId] ?? [],
    records: sorted,
  };
}

// ---- 六都（重點縣市）完整民調 waves ---------------------------

export const MAJOR_CITY_WAVES: Record<string, WaveDef[]> = {
  taipei: [
    { date: "2026-07-06", institute: "島嶼民調中心", sample: 1072, method: "市話＋手機", moe: 3.0, results: { "taipei-a": 33.0, "taipei-b": 32.4, "taipei-c": 11.8 } },
    { date: "2026-07-14", institute: "北台民意研究", sample: 1096, method: "市話", moe: 3.0, results: { "taipei-a": 33.6, "taipei-b": 32.9, "taipei-c": 11.2 } },
    { date: "2026-07-22", institute: "港都數據", sample: 1104, method: "市話＋手機", moe: 3.0, results: { "taipei-a": 32.8, "taipei-b": 33.5, "taipei-c": 11.9 } },
    { date: "2026-07-30", institute: "南風市場研究", sample: 1088, method: "網路", moe: 3.1, results: { "taipei-a": 34.1, "taipei-b": 33.0, "taipei-c": 11.0 } },
    { date: "2026-08-07", institute: "島嶼民調中心", sample: 1101, method: "市話＋手機", moe: 3.0, results: { "taipei-a": 33.5, "taipei-b": 33.2, "taipei-c": 11.6 } },
    { date: "2026-08-15", institute: "北台民意研究", sample: 1112, method: "市話", moe: 2.9, results: { "taipei-a": 33.9, "taipei-b": 33.4, "taipei-c": 11.3 } },
    { date: "2026-08-22", institute: "港都數據", sample: 1120, method: "市話＋手機", moe: 2.9, results: { "taipei-a": 34.2, "taipei-b": 33.8, "taipei-c": 11.1 } },
  ],
  newtaipei: [
    { date: "2026-07-06", institute: "島嶼民調中心", sample: 1066, method: "市話＋手機", moe: 3.0, results: { "newtaipei-a": 38.2, "newtaipei-b": 34.6 } },
    { date: "2026-07-13", institute: "北台民意研究", sample: 1088, method: "市話", moe: 3.0, results: { "newtaipei-a": 37.8, "newtaipei-b": 35.2 } },
    { date: "2026-07-20", institute: "港都數據", sample: 1102, method: "市話＋手機", moe: 3.0, results: { "newtaipei-a": 38.5, "newtaipei-b": 34.9 } },
    { date: "2026-07-28", institute: "南風市場研究", sample: 1090, method: "網路", moe: 3.1, results: { "newtaipei-a": 37.2, "newtaipei-b": 35.8 } },
    { date: "2026-08-05", institute: "島嶼民調中心", sample: 1098, method: "市話＋手機", moe: 3.0, results: { "newtaipei-a": 38.0, "newtaipei-b": 35.1 } },
    { date: "2026-08-13", institute: "北台民意研究", sample: 1110, method: "市話", moe: 2.9, results: { "newtaipei-a": 37.6, "newtaipei-b": 35.5 } },
    { date: "2026-08-21", institute: "港都數據", sample: 1122, method: "市話＋手機", moe: 2.9, results: { "newtaipei-a": 38.3, "newtaipei-b": 35.0 } },
  ],
  taoyuan: [
    { date: "2026-07-07", institute: "島嶼民調中心", sample: 1058, method: "市話＋手機", moe: 3.0, results: { "taoyuan-a": 41.5, "taoyuan-b": 30.2, "taoyuan-c": 9.8 } },
    { date: "2026-07-15", institute: "北台民意研究", sample: 1080, method: "市話", moe: 3.0, results: { "taoyuan-a": 41.0, "taoyuan-b": 30.8, "taoyuan-c": 10.1 } },
    { date: "2026-07-23", institute: "港都數據", sample: 1095, method: "市話＋手機", moe: 3.0, results: { "taoyuan-a": 41.8, "taoyuan-b": 30.0, "taoyuan-c": 9.6 } },
    { date: "2026-07-31", institute: "南風市場研究", sample: 1077, method: "網路", moe: 3.1, results: { "taoyuan-a": 40.6, "taoyuan-b": 31.2, "taoyuan-c": 10.4 } },
    { date: "2026-08-08", institute: "島嶼民調中心", sample: 1090, method: "市話＋手機", moe: 3.0, results: { "taoyuan-a": 41.4, "taoyuan-b": 30.5, "taoyuan-c": 9.9 } },
    { date: "2026-08-16", institute: "北台民意研究", sample: 1105, method: "市話", moe: 2.9, results: { "taoyuan-a": 41.7, "taoyuan-b": 30.3, "taoyuan-c": 9.7 } },
    { date: "2026-08-23", institute: "港都數據", sample: 1118, method: "市話＋手機", moe: 2.9, results: { "taoyuan-a": 42.1, "taoyuan-b": 30.0, "taoyuan-c": 9.4 } },
  ],
  taichung: [
    { date: "2026-07-08", institute: "島嶼民調中心", sample: 1078, method: "市話＋手機", moe: 3.0, results: { "taichung-a": 34.8, "taichung-b": 35.6 } },
    { date: "2026-07-16", institute: "北台民意研究", sample: 1092, method: "市話", moe: 3.0, results: { "taichung-a": 35.3, "taichung-b": 35.1 } },
    { date: "2026-07-24", institute: "港都數據", sample: 1106, method: "市話＋手機", moe: 3.0, results: { "taichung-a": 34.5, "taichung-b": 36.0 } },
    { date: "2026-08-01", institute: "南風市場研究", sample: 1083, method: "網路", moe: 3.1, results: { "taichung-a": 35.9, "taichung-b": 34.8 } },
    { date: "2026-08-09", institute: "島嶼民調中心", sample: 1096, method: "市話＋手機", moe: 3.0, results: { "taichung-a": 35.1, "taichung-b": 35.4 } },
    { date: "2026-08-17", institute: "北台民意研究", sample: 1114, method: "市話", moe: 2.9, results: { "taichung-a": 35.6, "taichung-b": 35.0 } },
    { date: "2026-08-24", institute: "港都數據", sample: 1120, method: "市話＋手機", moe: 2.9, results: { "taichung-a": 35.4, "taichung-b": 35.7 } },
  ],
  tainan: [
    { date: "2026-07-07", institute: "島嶼民調中心", sample: 1062, method: "市話＋手機", moe: 3.0, results: { "tainan-a": 46.8, "tainan-b": 24.3 } },
    { date: "2026-07-14", institute: "北台民意研究", sample: 1082, method: "市話", moe: 3.0, results: { "tainan-a": 46.2, "tainan-b": 24.9 } },
    { date: "2026-07-21", institute: "港都數據", sample: 1098, method: "市話＋手機", moe: 3.0, results: { "tainan-a": 47.1, "tainan-b": 24.0 } },
    { date: "2026-07-29", institute: "南風市場研究", sample: 1075, method: "網路", moe: 3.1, results: { "tainan-a": 45.9, "tainan-b": 25.3 } },
    { date: "2026-08-06", institute: "島嶼民調中心", sample: 1088, method: "市話＋手機", moe: 3.0, results: { "tainan-a": 46.6, "tainan-b": 24.5 } },
    { date: "2026-08-14", institute: "北台民意研究", sample: 1103, method: "市話", moe: 2.9, results: { "tainan-a": 47.0, "tainan-b": 24.1 } },
    { date: "2026-08-22", institute: "港都數據", sample: 1115, method: "市話＋手機", moe: 2.9, results: { "tainan-a": 47.4, "tainan-b": 23.8 } },
  ],
  kaohsiung: [
    { date: "2026-07-06", institute: "島嶼民調中心", sample: 1075, method: "市話＋手機", moe: 3.0, results: { "kaohsiung-a": 40.2, "kaohsiung-b": 36.8 } },
    { date: "2026-07-13", institute: "北台民意研究", sample: 1090, method: "市話", moe: 3.0, results: { "kaohsiung-a": 39.8, "kaohsiung-b": 37.4 } },
    { date: "2026-07-20", institute: "港都數據", sample: 1105, method: "市話＋手機", moe: 3.0, results: { "kaohsiung-a": 40.6, "kaohsiung-b": 36.5 } },
    { date: "2026-07-28", institute: "南風市場研究", sample: 1084, method: "網路", moe: 3.1, results: { "kaohsiung-a": 39.2, "kaohsiung-b": 37.9 } },
    { date: "2026-08-05", institute: "島嶼民調中心", sample: 1094, method: "市話＋手機", moe: 3.0, results: { "kaohsiung-a": 40.0, "kaohsiung-b": 37.0 } },
    { date: "2026-08-13", institute: "北台民意研究", sample: 1108, method: "市話", moe: 2.9, results: { "kaohsiung-a": 40.4, "kaohsiung-b": 36.6 } },
    { date: "2026-08-21", institute: "港都數據", sample: 1121, method: "市話＋手機", moe: 2.9, results: { "kaohsiung-a": 40.8, "kaohsiung-b": 36.2 } },
  ],
};

/** 重要事件標記（供趨勢圖標示） */
export const EVENTS: Record<string, EventMark[]> = {
  taipei: [
    { date: "2026-07-28", label: "候選人登記截止" },
    { date: "2026-08-10", label: "首場電視政見會" },
  ],
  newtaipei: [{ date: "2026-08-05", label: "重大市政爭議發酵" }],
  taoyuan: [{ date: "2026-08-12", label: "候選人辯論會" }],
  taichung: [{ date: "2026-07-25", label: "重大交通政策宣布" }],
  tainan: [{ date: "2026-08-08", label: "颱風防災事件" }],
  kaohsiung: [{ date: "2026-08-15", label: "產業招商利多" }],
};

/** 六都的民調記錄與趨勢 */
export const MAJOR_CITY_POLLS: Record<string, PollRecord[]> = Object.fromEntries(
  Object.entries(MAJOR_CITY_WAVES).map(([id, waves]) => [id, mkRecords(id, waves)]),
);

export const MAJOR_CITY_TRENDS: Record<string, CountyPollTrend> =
  Object.fromEntries(
    Object.entries(MAJOR_CITY_POLLS).map(([id, records]) => [
      id,
      buildSeries(id, records),
    ]),
  );

/** 六都縣市 id */
export const MAJOR_CITY_IDS = [
  "taipei",
  "newtaipei",
  "taoyuan",
  "taichung",
  "tainan",
  "kaohsiung",
];
