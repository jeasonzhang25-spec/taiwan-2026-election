import { POLICY_DIMENSIONS } from "@/lib/data/county-pages";
import { candidatePartyLabel, candidateStatusLabel } from "@/lib/data/candidate-status";
import { getVerifiedPolicies } from "@/lib/data/policies";
import { CANDIDATE_REGISTRATION_CHECKED_AT } from "@/lib/data/candidate-registrations";
import { PartyDot } from "@/components/ui/PartyDot";
import type { Candidate } from "@/lib/types";

const POLICY_SOURCE_LABELS = {
  "candidate-primary": "候選人一手資料",
  "media-direct": "媒體直接報導",
} as const;

const RACE_SCOPE_NOTES: Partial<Record<string, { text: string; sourceUrl: string; sourceLabel: string }>> = {
  "hsinchu-city": {
    text: "邱臣遠已登記參選的是新竹縣竹北市長，並非新竹市長，因此不列入本頁的新竹市長候選人台帳。",
    sourceUrl: "https://web.cec.gov.tw/api/file/ce0f22c7-0255-4184-9411-1302ec497eee.pdf",
    sourceLabel: "新竹縣選委會鄉鎮市長登記冊",
  },
  "hsinchu-county": {
    text: "邱臣遠已登記參選竹北市長；竹北市長屬鄉鎮市長層級，不是新竹縣長，因此不列入本頁的縣長候選人台帳。",
    sourceUrl: "https://web.cec.gov.tw/api/file/ce0f22c7-0255-4184-9411-1302ec497eee.pdf",
    sourceLabel: "新竹縣選委會鄉鎮市長登記冊",
  },
};

export default function PolicyComparison({ countyId, countyName, candidates }: { countyId: string; countyName: string; candidates: Candidate[] }) {
  const policies = getVerifiedPolicies(countyId);
  const raceScopeNote = RACE_SCOPE_NOTES[countyId];
  const registeredCandidates = candidates.filter((candidate) => candidate.status === "registered" || candidate.status === "qualified");
  const registeredCount = registeredCandidates.length;
  const coveredCandidateCount = new Set(policies.map((policy) => policy.candidateId)).size;
  const policiesByDimension = new Map(POLICY_DIMENSIONS.map((dimension) => [
    dimension.id,
    policies.filter((policy) => policy.dimensionId === dimension.id),
  ]));
  return (
    <section id="policies" className="scroll-mt-24" aria-labelledby="policies-title">
      <span className="text-xs font-medium text-[#F1C46B]">政見資料</span>
      <h2 id="policies-title" className="mt-1 text-2xl font-semibold tracking-tight text-ink">登記已截止，政見資料持續核驗</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-secondary">全台 22 縣市、81 位縣市長登記人已建立台帳並連回各地選委會來源；政見優先採候選人一手資料，媒體對政策發布的直接報導會另行標示，不把評論或推測當成政見。</p>

      {raceScopeNote && <div className="mt-4 rounded-xl border border-[#2B4664] bg-[#162333] px-4 py-3 text-sm leading-6 text-[#B9D6F2]">
        <span>{raceScopeNote.text}</span>{" "}
        <a href={raceScopeNote.sourceUrl} target="_blank" rel="noreferrer" className="font-medium text-brand hover:underline">{raceScopeNote.sourceLabel} ↗</a>
      </div>}

      <div className="mt-5 rounded-xl border border-[#55411D] bg-[#2A2112] p-4 sm:p-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="text-sm font-semibold text-[#F1C46B]">候選人登記已完成，資格審定中</div>
            <p className="mt-1 text-sm leading-6 text-[#F1C46B]/85">登記已於 2026 年 9 月 4 日截止；本頁收錄 {registeredCount} 位已登記人選，台帳核對至 {CANDIDATE_REGISTRATION_CHECKED_AT}。正式候選人名單預計於 10 月 16 日前審定。</p>
          </div>
          <a href="https://web.cec.gov.tw/central/article/64711" target="_blank" rel="noreferrer" className="shrink-0 rounded-lg border border-[#55411D] bg-surface px-4 py-2 text-center text-sm font-medium text-[#F1C46B] hover:border-[#7A6030]">查看中選會登記消息 ↗</a>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-line bg-surface p-5 shadow-card">
        <h3 className="text-sm font-semibold text-ink">人選身分台帳</h3>
        {candidates.length > 0 ? <div className="mt-3 flex flex-wrap gap-2">
          {candidates.map((candidate) => (
            <div key={candidate.id} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas px-3 py-1.5 text-xs text-ink-secondary">
              <PartyDot party={candidate.partyId} size={8} />
              <span className="font-medium text-ink">{candidate.name}</span>
              <span>{candidatePartyLabel(candidate)}</span>
              <span className="text-ink-muted">· {candidateStatusLabel(candidate.status)}{candidate.statusDate ? ` ${candidate.statusDate}` : ""}</span>
              {candidate.statusSourceUrl && <a href={candidate.statusSourceUrl} target="_blank" rel="noreferrer" aria-label={`查看${candidate.name}登記來源`} className="font-medium text-brand hover:underline">來源 ↗</a>}
            </div>
          ))}
        </div> : <p className="mt-3 rounded-lg border border-dashed border-line-strong bg-canvas px-4 py-3 text-sm leading-6 text-ink-secondary">目前尚未接入這個縣市的官方登記名冊；完成核驗後會加入狀態日期與原始來源。</p>}
      </div>

      <div className="mt-4 rounded-xl border border-line bg-surface p-5 shadow-card">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h3 className="text-sm font-semibold text-ink">逐候選人政見覆蓋</h3>
            <p className="mt-1 text-xs leading-5 text-ink-muted">每位登記人都已加入監測；尚未找到可回查原文時會明確留白，不以政黨主張或媒體評論代填。</p>
          </div>
          <span className="text-xs font-medium text-brand">{coveredCandidateCount} / {registeredCount} 人已有核驗資料</span>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {registeredCandidates.map((candidate) => {
            const candidatePolicies = policies.filter((policy) => policy.candidateId === candidate.id);
            return (
              <div key={candidate.id} className="rounded-lg border border-line bg-canvas px-3.5 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex min-w-0 items-center gap-2 text-sm font-semibold text-ink"><PartyDot party={candidate.partyId} size={8} /><span className="truncate">{candidate.name}</span></span>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-medium ${candidatePolicies.length > 0 ? "bg-[#13271F] text-[#72D6A0]" : "bg-[#1E2735] text-[#9EC5EE]"}`}>
                    {candidatePolicies.length > 0 ? `${candidatePolicies.length} 項已核驗` : "尚無核驗資料"}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-ink-muted">
                  {candidatePolicies.length > 0
                    ? `涵蓋 ${new Set(candidatePolicies.map((policy) => policy.dimensionId)).size} 個比較維度，保留發布日期與原始連結。`
                    : "目前尚無符合收錄標準的公開政見；新來源會先進入核驗佇列。"}
                </p>
              </div>
            );
          })}
        </div>
        <div className="mt-4 rounded-lg border border-[#55411D] bg-[#2A2112] px-3.5 py-3 text-xs leading-5 text-[#F1C46B]">
          官方完整政見仍未到公開階段：直轄市長候選人名單預定 11 月 12 日公告，縣市長名單預定 11 月 17 日公告，公辦政見發表會安排於 11 月 13 日至 27 日。現階段只能收錄候選人已主動公開且可回查的內容。 <a href="https://web.cec.gov.tw/api/file/2ecc9288-48df-44b1-8dbd-d0a263763fd0.pdf" target="_blank" rel="noreferrer" className="font-medium underline decoration-current/40 underline-offset-2">查看選務時程 ↗</a>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-line bg-surface shadow-card">
        <div className="flex flex-col justify-between gap-2 border-b border-line px-5 py-4 sm:flex-row sm:items-end"><div><h3 className="text-sm font-semibold text-ink">{countyName}政見比較維度</h3><p className="mt-1 text-xs leading-5 text-ink-muted">保留發布日期、來源網址與來源層級；預算、期程等尚未公布的欄位不代為推算。</p></div>{policies.length > 0 && <span className="shrink-0 text-xs font-medium text-brand">已核驗 {policies.length} 項 · 涵蓋 {coveredCandidateCount} 人</span>}</div>
        <div className="divide-y divide-line">
          {POLICY_DIMENSIONS.map((dimension) => {
            const dimensionPolicies = policiesByDimension.get(dimension.id) ?? [];
            return (
            <div key={dimension.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[180px_1fr] sm:items-start">
              <div className="font-medium text-ink">{dimension.label}</div>
              <div>
                <div className="text-sm text-ink-secondary">{dimension.description}</div>
                {dimensionPolicies.length > 0 ? <div className="mt-3 grid gap-3 xl:grid-cols-2">{dimensionPolicies.map((policy) => {
                  const candidate = candidates.find((item) => item.id === policy.candidateId);
                  return <article key={policy.id} className="rounded-lg border border-line bg-canvas p-3"><div className="flex flex-wrap items-center justify-between gap-2"><h4 className="flex items-center gap-2 text-sm font-semibold text-ink">{candidate && <PartyDot party={candidate.partyId} size={8} />}<span>{candidate?.name ?? policy.candidateId}｜{policy.title}</span></h4><span className={`rounded-full px-2 py-1 text-[11px] font-medium ${policy.sourceKind === "candidate-primary" ? "bg-[#172B24] text-[#72D6A0]" : "bg-[#1E2735] text-[#9EC5EE]"}`}>{POLICY_SOURCE_LABELS[policy.sourceKind]}</span></div><p className="mt-2 text-sm leading-6 text-ink-secondary">{policy.summary}</p><div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs"><time dateTime={policy.publishedAt} className="text-ink-muted">發布 {policy.publishedAt}</time><a href={policy.sourceUrl} target="_blank" rel="noreferrer" className="font-medium text-brand hover:underline">{policy.sourceName} · 查看來源 ↗</a></div></article>;
                })}</div> : <span className="mt-2 inline-flex w-fit rounded-full bg-[#1B1E23] px-2.5 py-1 text-xs text-ink-muted">等待可追溯的正式資料</span>}
              </div>
            </div>
          );})}
        </div>
        <p className="border-t border-line px-5 py-3 text-xs leading-5 text-ink-muted">未出現在比較卡片中的登記人選，代表目前尚未找到符合收錄標準的公開政見，不代表對方沒有提出主張。系統會定期掃描候選人姓名與政策關鍵字，發現後先核對原文再發布。</p>
      </div>
    </section>
  );
}
