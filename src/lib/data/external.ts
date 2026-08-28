export type ExternalFeedKind = "poll" | "analysis";

export interface VerifiedPollResult {
  name: string;
  party: string;
  value: number;
  color: string;
}

export interface VerifiedPoll {
  id: string;
  county: string;
  fieldwork: string;
  publishedAt: string;
  question: string;
  executor: string;
  commissioner: string;
  method: string;
  sampleSize: number;
  marginOfError: number;
  results: VerifiedPollResult[];
  undecided?: number;
  note?: string;
  sourceName: string;
  sourceUrl: string;
}

export interface AnalysisItem {
  id: string;
  analyst: string;
  outlet: string;
  publishedAt: string;
  title: string;
  summary: string;
  sourceUrl: string;
}

export interface ExternalFeedItem {
  id: string;
  kind: ExternalFeedKind;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
}

export const EXTERNAL_DATA_CHECKED_AT = "2026-08-27";

/**
 * 人工核驗的公開民調索引。
 * 這裡不做跨機構平均，也不將資料寫回地圖或席次預測。
 */
export const VERIFIED_POLLS: VerifiedPoll[] = [
  {
    id: "taichung-apollo-2026-08",
    county: "台中市",
    fieldwork: "2026-08-03 — 2026-08-05",
    publishedAt: "2026-08-08",
    question: "台中市長選舉支持度",
    executor: "艾普羅行銷市場研究股份有限公司",
    commissioner: "引用報導未揭露",
    method: "住宅電話抽樣、人員電話訪問；對象為戶籍在台中市、年滿 20 歲民眾",
    sampleSize: 1077,
    marginOfError: 3,
    results: [
      { name: "江啟臣", party: "國民黨", value: 38.2, color: "#2B6CB0" },
      { name: "何欣純", party: "民進黨", value: 24.1, color: "#178A56" },
    ],
    note: "報導完整揭露執行機構、調查時間、抽樣方式、樣本與誤差，但未揭露委託或經費來源。",
    sourceName: "Newtalk 新聞",
    sourceUrl: "https://newtalk.tw/news/view/2026-08-08/1052110",
  },
  {
    id: "kaohsiung-bigmedia-2026-08",
    county: "高雄市",
    fieldwork: "2026-07-27 — 2026-08-01",
    publishedAt: "2026-08-10",
    question: "高雄市長選舉支持度",
    executor: "皮爾森數據",
    commissioner: "鉅聞天下新聞網",
    method: "網路主動發放調查；對象為高雄市 20 歲以上網路人口",
    sampleSize: 1608,
    marginOfError: 2.4,
    results: [
      { name: "賴瑞隆", party: "民進黨", value: 47.78, color: "#178A56" },
      { name: "柯志恩", party: "國民黨", value: 46.14, color: "#2B6CB0" },
    ],
    undecided: 4.24,
    note: "兩者差距小於該調查標示的抽樣誤差；網路樣本與電話調查不可直接合併比較。",
    sourceName: "TVBS 新聞轉述原調查",
    sourceUrl: "https://news.tvbs.com.tw/politics/4004777",
  },
  {
    id: "newtaipei-tvbs-2026-07",
    county: "新北市",
    fieldwork: "2026-07-20 — 2026-07-23",
    publishedAt: "2026-07-29",
    question: "新北市長選舉支持度",
    executor: "TVBS 民意調查中心",
    commissioner: "國民黨新北市議會黨團政策智庫",
    method: "市內電話訪問；對象為新北市 20 歲以上民眾",
    sampleSize: 1303,
    marginOfError: 2.7,
    results: [
      { name: "李四川", party: "國民黨", value: 43.7, color: "#2B6CB0" },
      { name: "蘇巧慧", party: "民進黨", value: 36.8, color: "#178A56" },
    ],
    note: "這是政黨黨團委託調查，委託方會顯著展示，避免只看執行機構名稱。",
    sourceName: "中央社",
    sourceUrl: "https://www.cna.com.tw/news/aloc/202607290180.aspx",
  },
  {
    id: "taipei-tvbs-2026-05",
    county: "台北市",
    fieldwork: "2026-05-21 — 2026-05-26",
    publishedAt: "2026-05-27",
    question: "有投票意願者的台北市長支持度",
    executor: "TVBS 民意調查中心",
    commissioner: "TVBS",
    method: "電話後四碼隨機抽樣、人員電話訪問，並依人口結構加權",
    sampleSize: 901,
    marginOfError: 3.3,
    results: [
      { name: "蔣萬安", party: "國民黨", value: 58, color: "#2B6CB0" },
      { name: "沈伯洋", party: "民進黨", value: 30, color: "#178A56" },
    ],
    undecided: 13,
    note: "百分比合計可能因四捨五入略有差異。",
    sourceName: "TVBS 民調中心／新聞頁",
    sourceUrl: "https://news.tvbs.com.tw/politics/3214850",
  },
  {
    id: "changhua-cnews-2026-05",
    county: "彰化縣",
    fieldwork: "2026-05-20 — 2026-05-21",
    publishedAt: "2026-05-25",
    question: "三人競逐情境下的縣長支持度",
    executor: "CNEWS 匯流新聞網民調中心",
    commissioner: "CNEWS 匯流新聞網",
    method: "家戶電話、分層比例隨機抽樣，並依戶籍地、性別、年齡、教育程度加權",
    sampleSize: 1068,
    marginOfError: 3,
    results: [
      { name: "陳素月", party: "民進黨", value: 30.5, color: "#178A56" },
      { name: "魏平政", party: "國民黨", value: 14, color: "#2B6CB0" },
      { name: "蔡壁如", party: "民眾黨", value: 8.5, color: "#0E8FA0" },
    ],
    undecided: 47,
    note: "此題為特定三人參選情境，不可與兩人對決題直接比較。",
    sourceName: "CNEWS 匯流民調",
    sourceUrl: "https://cnews.com.tw/001260525a01/",
  },
];

/** 觀點只作為可追溯的資料入口，不參與任何數值計算。 */
export const ANALYSIS_ITEMS: AnalysisItem[] = [
  {
    id: "zheng-zilong-kaohsiung-2026-08",
    analyst: "鄭自隆",
    outlet: "鉅聞天下專欄",
    publishedAt: "2026-08-13",
    title: "五五波，高雄誰能拔得頭籌？",
    summary: "作者將 1.64 個百分點差距解釋為統計上的膠著；這是署名評論，不是新的民調資料。",
    sourceUrl: "https://www.bigmedia.com.tw/article/1786526168615",
  },
  {
    id: "wu-zijia-newtaipei-2026-06",
    analyst: "吳子嘉",
    outlet: "《董事長開講》／TVBS 報導",
    publishedAt: "2026-06-09",
    title: "從曝光與選戰定位解讀新北民調",
    summary: "評論者認為蘇巧慧的曝光策略與候選人定位需要調整；其中對後續差距的判斷屬於個人預測。",
    sourceUrl: "https://news.tvbs.com.tw/politics/3225730",
  },
  {
    id: "chen-huiwen-taipei-2026-05",
    analyst: "陳揮文",
    outlet: "媒體評論／TVBS 報導",
    publishedAt: "2026-05-28",
    title: "從台北民調討論候選人調整時機",
    summary: "評論者據當時的 TVBS 調查主張儘早評估人選；這是策略意見，不代表事實結論。",
    sourceUrl: "https://news.tvbs.com.tw/politics/3215442",
  },
];

export const POLL_BLACKOUT_START = "2026-11-18T00:00:00+08:00";
export const POLL_BLACKOUT_END = "2026-11-28T16:00:00+08:00";

export function isPollPublicationBlackout(date: Date): boolean {
  const time = date.getTime();
  return (
    time >= Date.parse(POLL_BLACKOUT_START) &&
    time < Date.parse(POLL_BLACKOUT_END)
  );
}
