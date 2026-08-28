// ============================================================
// 選情看板 —— 核心 TypeScript 型別
// 所有資料結構在此定義，方便後續將人工核驗資料替換為 API / DB
// ============================================================

/** 選舉類型 */
export type ElectionType = "mayor" | "councilor" | "township" | "village";

/** 政黨識別碼 */
export type PartyId = "kmt" | "dpp" | "tpp" | "npp" | "ind";

/** 首頁地圖顯示模式 */
export type DisplayMode = "leading-party" | "competitiveness" | "poll-change";

/** 競爭評級 */
export type Competitiveness =
  | "stable-lead" // 穩定領先
  | "slim-lead" // 小幅領先
  | "tossup" // 五五波
  | "likely-flip" // 可能翻轉
  | "insufficient"; // 資料不足

/** 政黨 */
export interface Party {
  id: PartyId;
  name: string;
  short: string;
  color: string;
  /** 地圖/圖表用的備用紋理，供色盲使用者辨識（非純顏色傳達） */
  texture?: "none" | "stripes" | "dots";
}

/** 民調或正式選務資料中的人選 */
export interface Candidate {
  id: string;
  name: string;
  partyId: PartyId;
  /** 是否為現任首長爭取連任 */
  isIncumbent?: boolean;
  /** 登記完成前，只能視為民調題目中的人選 */
  status?: "poll-option" | "official";
}

/** 單一筆公開民調記錄 */
export interface PollRecord {
  id: string;
  institute: string; // 調查機構
  date: string; // 調查時間（ISO date）
  fieldwork?: string; // 原始調查日期文字
  sampleSize?: number; // 樣本數；來源未揭露時不填
  method?: string; // 調查方式（市話／手機／網路等）
  marginOfError?: number; // 誤差範圍（百分比）
  source: string; // 資料來源
  sourceUrl?: string; // 來源連結（預留）
  publishedAt?: string; // 發佈時間
  sourceKind?: "public" | "internal" | "primary";
  scenario?: string; // 該列民調的題目／對戰情境
  undecided?: number;
  results: Record<string, number>; // candidateId -> 支持度（%）
}

/** 候選人民調趨勢點 */
export interface PollPoint {
  recordId: string;
  date: string;
  value: number; // 支持度 %
  marginError?: number; // 誤差 %
  institute: string;
  sampleSize?: number;
  scenario?: string;
}

/** 重要事件標記 */
export interface EventMark {
  date: string;
  label: string;
}

/** 縣市選情 */
export interface CountyRace {
  id: string; // 縣市 id（與 GeoJSON name 對應）
  name: string; // 縣市名（繁體）
  nameEn: string;
  electionType: ElectionType;
  /** 現任執政黨 */
  incumbentParty: PartyId;
  incumbentName: string;
  candidates: Candidate[];
  /** 最新支持度：candidateId -> % */
  latestSupport: Record<string, number>;
  /** 領先者 candidateId */
  leadingId: string;
  /** 領先差距（百分點，正值表示領先者勝出） */
  margin: number;
  competitiveness: Competitiveness;
  /** 領先差距近一週變化（正=擴大、負=縮小） */
  change: number;
  changeNote?: string;
  lastPollDate: string;
  keyIssues: string[];
  updatedAt: string;
  dataStatus: "verified-poll" | "insufficient";
  dataSource?: string;
  dataSourceUrl?: string;
  dataNote?: string;
  /** 2022 選舉結果（供歷史版圖區使用） */
  result2022: HistoricalResult;
  /** 歷史執政黨版圖 */
  historical: HistoricalResult[];
}

/** 歷史選舉結果（以政黨層級呈現，不記錄個人姓名，避免誤用） */
export interface HistoricalResult {
  year: number;
  winner: PartyId;
  voteShare?: number; // 得票率 %（只有已核對時才填）
  runnerUp?: PartyId;
}

/** 民調趨勢（單一候選人的完整序列） */
export interface PollSeries {
  candidateId: string;
  points: PollPoint[];
}

/** 縣市民調趨勢集合（供趨勢圖使用） */
export interface CountyPollTrend {
  countyId: string;
  series: PollSeries[];
  events: EventMark[];
  /** 每筆公開民調（供「最近五次民調」使用） */
  records: PollRecord[];
}

/** 全域篩選器狀態 */
export interface FilterState {
  electionType: ElectionType;
  date: string; // 觀察日期
  party: PartyId | "all";
  source: string | "all";
  displayMode: DisplayMode;
}

/** 資料來源卡片 */
export interface SourceCard {
  name: string;
  kind: string;
  url?: string;
  description: string;
}
