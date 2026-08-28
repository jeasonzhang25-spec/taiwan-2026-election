// ============================================================
// 可追溯資料來源卡片。
// ============================================================

import type { SourceCard } from "../types";
import { MAJOR_CITY_POLLS, POLL_INDEX_URL } from "./polling";

export const SOURCES: SourceCard[] = [
  {
    name: "中央選舉委員會",
    kind: "官方選務",
    description: "投票日、候選人登記、選舉公告與正式選舉結果的權威來源。",
    url: "https://web.cec.gov.tw/api/file/2ecc9288-48df-44b1-8dbd-d0a263763fd0.pdf",
  },
  {
    name: "中選會選舉資料庫",
    kind: "官方結果",
    description: "用於核對 2022 縣市長當選政黨、當選首長與已確認得票率。",
    url: "https://web.cec.gov.tw/ttec/article/61823",
  },
  {
    name: "2026 地方選舉民調公開索引",
    kind: "民調目錄",
    description: "用於盤點各縣市已公開的候選人支持度題目；每筆資料另保留該列引用的原始報導或調查連結。",
    url: POLL_INDEX_URL,
  },
  {
    name: "CNEWS 匯流民調",
    kind: "民調機構",
    description: "發布地方選舉電話調查，並在報導末列出抽樣、加權、樣本與經費來源。",
    url: "https://cnews.com.tw/001260525a01/",
  },
  {
    name: "中央通訊社",
    kind: "新聞核對",
    description: "用於交叉核對民調公布情境、委託方回應及地方選舉進度。",
    url: "https://www.cna.com.tw/news/aloc/202607290180.aspx",
  },
  {
    name: "Google News RSS",
    kind: "即時索引",
    description: "只聚合標題、來源、時間與連結，不自動將新聞內容當作已核驗事實。",
    url: "https://news.google.com/",
  },
];

/** 可作為篩選器的「資料來源」清單 */
export const SOURCE_OPTIONS: string[] = Array.from(
  new Set(Object.values(MAJOR_CITY_POLLS).flat().map((record) => record.institute)),
).sort((a, b) => a.localeCompare(b, "zh-Hant"));
