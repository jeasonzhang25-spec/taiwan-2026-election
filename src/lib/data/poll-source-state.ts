import sourceAudit from "./generated/poll-source-audit.json";
import type { PollSourceState } from "./provenance";

type SourceRow = {
  status: PollSourceState["status"];
  evidence: PollSourceState["evidence"];
  contentChanged: boolean;
  recordIds: string[];
};

type ReviewRow = { recordIds: string[]; reasons: string[] };

const audit = sourceAudit as unknown as {
  generatedAt: string;
  sources: SourceRow[];
  reviewQueue: ReviewRow[];
};

const states = new Map<string, PollSourceState>();
for (const source of audit.sources) {
  for (const recordId of source.recordIds) {
    states.set(recordId, {
      status: source.status,
      evidence: source.evidence,
      checkedAt: audit.generatedAt,
      reviewReasons: [],
      contentChanged: source.contentChanged,
    });
  }
}
for (const review of audit.reviewQueue) {
  for (const recordId of review.recordIds) {
    const state = states.get(recordId);
    if (state) state.reviewReasons = [...new Set([...state.reviewReasons, ...review.reasons])];
  }
}

export const POLL_SOURCE_CHECKED_AT = audit.generatedAt;

export function pollSourceStatesFor(recordIds: string[]): Record<string, PollSourceState> {
  return Object.fromEntries(recordIds.map((recordId) => [
    recordId,
    states.get(recordId) ?? {
      status: "not-checked",
      evidence: "none",
      checkedAt: audit.generatedAt,
      reviewReasons: [],
      contentChanged: false,
    },
  ]));
}
