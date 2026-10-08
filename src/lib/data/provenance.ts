export type ArtifactFreshness = "current" | "stale" | "unknown";

export function artifactFreshness(
  checkedAt: string | undefined,
  staleAfterHours: number,
  now = new Date(),
): ArtifactFreshness {
  if (!checkedAt) return "unknown";
  const checkedTime = Date.parse(checkedAt);
  if (!Number.isFinite(checkedTime)) return "unknown";
  const ageMs = now.getTime() - checkedTime;
  if (ageMs < 0) return "unknown";
  return ageMs > staleAfterHours * 60 * 60 * 1000 ? "stale" : "current";
}

export type PollSourceState = {
  status: "reachable" | "restricted" | "unreachable" | "not-checked";
  evidence: "strong" | "partial" | "none";
  checkedAt: string;
  reviewReasons: string[];
  contentChanged: boolean;
};

export function pollSourceStateLabel(state: PollSourceState | undefined): string {
  if (!state || state.status === "not-checked") return "來源未完成自動檢查";
  if (state.status === "unreachable") return "上次檢查來源無法連線";
  if (state.status === "restricted") return "上次檢查來源限制自動讀取";
  if (state.reviewReasons.length > 0 || state.contentChanged) return "來源待人工複核";
  if (state.evidence === "strong") return "來源找到人選與部分數字（機器）";
  if (state.evidence === "partial") return "僅有部分來源證據";
  return "來源可讀，數字未自動辨識";
}
