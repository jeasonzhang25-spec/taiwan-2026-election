import type { ExternalFeedKind } from "./external";

const REJECTS_POLL_CONTEXT = /不再(?:做|公布|進行)民調|不做民調|停止(?:做|公布|進行)?民調|拒絕(?:做|公布|進行)?民調/;

/** 依標題語境分類；明確否定發布民調的句子不可被查詢來源兜底成民調。 */
export function inferExternalFeedKind(title: string, fallback: ExternalFeedKind): ExternalFeedKind {
  if (REJECTS_POLL_CONTEXT.test(title)) return "news";
  if (/民調|支持度|好感度|領先|落後|五五波|調查出爐/.test(title)) return "poll";
  if (/名嘴|評論|社論|投書|預言|斷言|觀點|看法|推演|看好|看衰/.test(title)) return "commentary";
  if (/選情|戰況|布局|盤點|分析|評析|解析|評估|攻防|勝算|戰略|結構差異|觀察點/.test(title)) return "analysis";
  if (fallback === "commentary" || fallback === "analysis") return "news";
  return fallback;
}
