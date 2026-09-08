const INSTITUTE_ALIASES: Record<string, string> = {
  ETToday: "ETtoday",
  NewTalk: "Newtalk",
};

/** 統一大小寫或歷史拼法，避免同一來源在篩選器中重複出現。 */
export function canonicalInstituteName(value: string): string {
  const name = value.trim();
  return INSTITUTE_ALIASES[name] ?? name;
}
