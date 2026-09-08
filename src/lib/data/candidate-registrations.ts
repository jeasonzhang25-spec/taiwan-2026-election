import type { Candidate, PartyId } from "../types";
import registrationData from "./generated/candidate-registrations.json";

type RegistrationSeed = {
  name: string;
  partyId: PartyId;
  partyLabel?: string;
  statusDate: string;
};

export type RegisteredCandidate = Candidate & {
  status: "registered";
  statusDate: string;
  statusSourceUrl: string;
};

const candidates = registrationData.candidates as Record<string, RegistrationSeed[]>;
const sources = registrationData.sources as Record<string, string>;

/**
 * 115 年縣市長登記台帳。姓名與順序以 9 月 4 日全台彙總交叉檢查，
 * 每個縣市另連回所屬選舉委員會的原始登記頁或附件。
 * 完成登記不等於資格已審定。
 */
export const REGISTERED_MAYOR_CANDIDATES: Record<string, RegisteredCandidate[]> = Object.fromEntries(
  Object.entries(candidates).map(([countyId, rows]) => [
    countyId,
    rows.map((row) => ({
      id: `${countyId}-${row.name}`,
      name: row.name,
      partyId: row.partyId,
      partyLabel: row.partyLabel,
      status: "registered" as const,
      statusDate: row.statusDate,
      statusSourceUrl: sources[countyId],
    })),
  ]),
);

export const CANDIDATE_REGISTRATION_CHECKED_AT = registrationData.checkedAt;
export const CANDIDATE_REGISTRATION_GENERATED_AT = registrationData.generatedAt;
export const CANDIDATE_REGISTRATION_AGGREGATE_SOURCE = registrationData.aggregateSourceUrl;
export const CANDIDATE_REGISTRATION_SOURCES = sources;
