import type { Candidate, CandidateStatus } from "../types";
import { partyShort } from "../constants";

export const CANDIDATE_STATUS_META: Record<CandidateStatus, { label: string; description: string }> = {
  "poll-option": { label: "民調選項", description: "只代表公開民調曾詢問此人，不等於本人已宣布參選。" },
  announced: { label: "已宣布", description: "本人已公開表達參選意向，仍未完成正式登記。" },
  nominated: { label: "已提名", description: "政黨或提名程序已確認，仍須完成登記與資格審定。" },
  registered: { label: "已登記", description: "已向選務機關完成登記，仍待候選人資格審定。" },
  qualified: { label: "審定候選人", description: "已列入選務機關公告的候選人名單。" },
};

export function candidateStatusLabel(status: CandidateStatus | undefined): string {
  return CANDIDATE_STATUS_META[status ?? "poll-option"].label;
}

export function candidatePartyLabel(candidate: Pick<Candidate, "partyId" | "partyLabel">): string {
  return candidate.partyLabel ?? partyShort(candidate.partyId);
}
