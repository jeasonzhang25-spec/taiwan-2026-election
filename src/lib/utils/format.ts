import type { PartyId } from "../types";

/** 格式化百分比：34.2 -> "34.2%" */
export function fmtPct(v: number, digits = 1): string {
  return `${v.toFixed(digits)}%`;
}

/** 格式化領先差距：3.3 -> "+3.3"；0.4 -> "0.4" */
export function fmtMargin(v: number, digits = 1): string {
  const s = v.toFixed(digits);
  return v > 0 ? `+${s}` : s;
}

/** 領先差距變化說明 */
export function changeNote(change: number): string {
  if (Math.abs(change) < 0.1) return "維持不變";
  return change > 0 ? "領先擴大" : "差距縮小";
}

/** ISO date -> "8/22" */
export function fmtShortDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${Number(m)}/${Number(d)}`;
}

/** ISO date -> "2026年8月22日" */
export function fmtLongDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${y}年${Number(m)}月${Number(d)}日`;
}

/** 距離投票日天數 */
export function daysUntil(target: string, from?: string): number {
  const t = new Date(`${target}T00:00:00`);
  const f = from ? new Date(`${from}T00:00:00`) : new Date();
  const diff = t.getTime() - f.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/** 是否為「膠著」狀態（供圖例與紋理使用） */
export function isTossup(competitiveness: string): boolean {
  return competitiveness === "tossup";
}

/** 領先者政黨 */
export function leadingPartyId(leadingId: string, candidates: { id: string; partyId: PartyId }[]): PartyId {
  return candidates.find((c) => c.id === leadingId)?.partyId ?? "ind";
}
