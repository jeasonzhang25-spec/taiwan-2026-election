import { METRO_POLICY_DIMENSIONS } from "@/lib/data/county-pages";
import { partyShort } from "@/lib/constants";
import { PartyDot } from "@/components/ui/PartyDot";
import type { Candidate } from "@/lib/types";

export default function PolicyComparison({ countyName, candidates }: { countyName: string; candidates: Candidate[] }) {
  return (
    <section id="policies" className="scroll-mt-24" aria-labelledby="policies-title">
      <span className="text-xs font-medium text-[#8A5D0A]">政見資料</span>
      <h2 id="policies-title" className="mt-1 text-2xl font-semibold tracking-tight text-ink">同題比較框架已建立，等待官方登記資料</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-secondary">目前頁面中的人名來自民調問卷，不等於中選會核定候選人。正式登記與選舉公報發布後，本站才會把可追溯的政見逐項填入。</p>

      <div className="mt-5 rounded-xl border border-[#E4D3AA] bg-[#FBF8EF] p-4 sm:p-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="text-sm font-semibold text-[#725817]">正式候選人名冊尚未完成</div>
            <p className="mt-1 text-sm leading-6 text-[#725817]/85">2026 年候選人登記期間為 8 月 31 日至 9 月 4 日；登記、審定與政見來源會分階段更新。</p>
          </div>
          <a href="https://web.cec.gov.tw/api/file/2ecc9288-48df-44b1-8dbd-d0a263763fd0.pdf" target="_blank" rel="noreferrer" className="shrink-0 rounded-lg border border-[#D8C391] bg-white px-4 py-2 text-center text-sm font-medium text-[#725817] hover:border-[#B89A54]">查看中選會時程 ↗</a>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-line bg-surface p-5 shadow-card">
        <h3 className="text-sm font-semibold text-ink">目前民調曾列入的人選</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {candidates.map((candidate) => (
            <div key={candidate.id} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas px-3 py-1.5 text-xs text-ink-secondary">
              <PartyDot party={candidate.partyId} size={8} />
              <span className="font-medium text-ink">{candidate.name}</span>
              <span>{partyShort(candidate.partyId)}</span>
              <span className="text-ink-muted">· 民調選項</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-line bg-surface shadow-card">
        <div className="border-b border-line px-5 py-4"><h3 className="text-sm font-semibold text-ink">{countyName}政見比較維度</h3><p className="mt-1 text-xs leading-5 text-ink-muted">未來每一項都會保留原文、來源網址、發布日期與履行成本；不把媒體轉述當成正式政見。</p></div>
        <div className="divide-y divide-line">
          {METRO_POLICY_DIMENSIONS.map((dimension) => (
            <div key={dimension.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[180px_1fr_auto] sm:items-center">
              <div className="font-medium text-ink">{dimension.label}</div>
              <div className="text-sm text-ink-secondary">{dimension.description}</div>
              <span className="w-fit rounded-full bg-[#F0EFEC] px-2.5 py-1 text-xs text-ink-muted">等待官方資料</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
