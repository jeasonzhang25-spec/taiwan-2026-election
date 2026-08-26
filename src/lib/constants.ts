import type {
  Party,
  PartyId,
  ElectionType,
  DisplayMode,
  Competitiveness,
} from "./types";

// ============================================================
// 常數定義：政黨、選舉類型、顯示模式、競爭評級
// ============================================================

/** 政黨（顏色僅用於地圖/圖表/少量狀態標記，並搭配文字與紋理） */
export const PARTIES: Record<PartyId, Party> = {
  kmt: {
    id: "kmt",
    name: "中國國民黨",
    short: "國民黨",
    color: "#2B6CB0",
    texture: "none",
  },
  dpp: {
    id: "dpp",
    name: "民主進步黨",
    short: "民進黨",
    color: "#178A56",
    texture: "none",
  },
  tpp: {
    id: "tpp",
    name: "台灣民眾黨",
    short: "民眾黨",
    color: "#0E8FA0",
    texture: "stripes",
  },
  npp: {
    id: "npp",
    name: "時代力量",
    short: "時力",
    color: "#D19A0B",
    texture: "dots",
  },
  ind: {
    id: "ind",
    name: "無黨籍及其他",
    short: "無黨籍",
    color: "#8A9199",
    texture: "stripes",
  },
};

export const PARTY_LIST: Party[] = Object.values(PARTIES);

export function partyName(id: PartyId): string {
  return PARTIES[id]?.name ?? "未知";
}

export function partyShort(id: PartyId): string {
  return PARTIES[id]?.short ?? "未知";
}

export function partyColor(id: PartyId): string {
  return PARTIES[id]?.color ?? "#8A9199";
}

/** 選舉類型 */
export const ELECTION_TYPES: { value: ElectionType; label: string }[] = [
  { value: "mayor", label: "縣市長" },
  { value: "councilor", label: "縣市議員" },
  { value: "township", label: "鄉鎮市長" },
  { value: "village", label: "村里長" },
];

/** 顯示模式 */
export const DISPLAY_MODES: { value: DisplayMode; label: string; hint: string }[] =
  [
    { value: "leading-party", label: "領先政黨", hint: "以領先者政黨著色" },
    { value: "competitiveness", label: "競爭程度", hint: "以競爭激烈程度著色" },
    { value: "poll-change", label: "民調變化", hint: "以近一週民調變化著色" },
  ];

/** 競爭評級 */
export const COMPETITIVENESS: Record<
  Competitiveness,
  { label: string; tone: "green" | "blue" | "amber" | "red" | "gray" }
> = {
  "stable-lead": { label: "穩定領先", tone: "green" },
  "slim-lead": { label: "小幅領先", tone: "blue" },
  tossup: { label: "五五波", tone: "amber" },
  "likely-flip": { label: "可能翻轉", tone: "red" },
  insufficient: { label: "資料不足", tone: "gray" },
};

export function competitivenessLabel(c: Competitiveness): string {
  return COMPETITIVENESS[c]?.label ?? c;
}

/** 投票日（演示設定，可替換） */
export const ELECTION_DAY = "2026-11-28";

/** 最後更新時間（演示） */
export const LAST_UPDATED = "2026-08-25 09:30";

/** 各類選舉的說明 */
export const ELECTION_TYPE_DESC: Record<ElectionType, string> = {
  mayor: "22 縣市首長改選，即「縣市長」層級選舉。",
  councilor: "各縣市議會席次改選，即「縣市議員」層級選舉。",
  township: "鄉鎮市區首長改選，即「鄉鎮市長」層級選舉。",
  village: "村里長改選，即最基層行政首長選舉。",
};

/** 導航項目 */
export const NAV_ITEMS = [
  { id: "overview", label: "全台總覽" },
  { id: "counties", label: "縣市選情" },
  { id: "trend", label: "民調趨勢" },
  { id: "history", label: "歷史版圖" },
  { id: "methodology", label: "資料說明" },
] as const;

/** 演示資料警示文字 */
export const DEMO_DISCLAIMER =
  "演示資料，僅用於介面展示，不代表實際選情。";
