"use client";

import { useMemo, useState } from "react";
import PollTrendChart from "@/components/charts/PollTrendChart";
import { PartyDot } from "@/components/ui/PartyDot";
import { buildSeries } from "@/lib/data/polling";
import { partyShort } from "@/lib/constants";
import type { Candidate, PollRecord } from "@/lib/types";

const SOURCE_KIND_LABEL = {
  public: "公開發布",
  internal: "政黨內參",
  primary: "黨內初選",
} as const;

export default function PollComparisonTool({
  countyId,
  countyName,
  records,
  candidates,
}: {
  countyId: string;
  countyName: string;
  records: PollRecord[];
  candidates: Candidate[];
}) {
  const candidateFrequency = useMemo(() => {
    const counts = new Map<string, number>();
    for (const record of records) {
      for (const id of Object.keys(record.results)) counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    return counts;
  }, [records]);
  const initialCandidates = useMemo(
    () => [...candidates]
      .sort((a, b) => (candidateFrequency.get(b.id) ?? 0) - (candidateFrequency.get(a.id) ?? 0))
      .slice(0, 4)
      .map((candidate) => candidate.id),
    [candidateFrequency, candidates],
  );
  const dates = useMemo(() => records.map((record) => record.date).sort(), [records]);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>(initialCandidates);
  const [sourceKind, setSourceKind] = useState<"all" | "public" | "internal" | "primary">("all");
  const [source, setSource] = useState("all");
  const [scenario, setScenario] = useState("all");
  const [dateFrom, setDateFrom] = useState(dates[0] ?? "");
  const [dateTo, setDateTo] = useState(dates.at(-1) ?? "");
  const [showAll, setShowAll] = useState(false);

  const sources = useMemo(() => [...new Set(records.map((record) => record.source))].sort((a, b) => a.localeCompare(b, "zh-Hant")), [records]);
  const scenarios = useMemo(() => [...new Set(records.map((record) => record.scenario).filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b, "zh-Hant")), [records]);

  const filtered = useMemo(() => records.filter((record) => {
    if (sourceKind !== "all" && (record.sourceKind ?? "public") !== sourceKind) return false;
    if (source !== "all" && record.source !== source) return false;
    if (scenario !== "all" && record.scenario !== scenario) return false;
    if (dateFrom && record.date < dateFrom) return false;
    if (dateTo && record.date > dateTo) return false;
    return selectedCandidates.some((id) => id in record.results);
  }).sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id)), [dateFrom, dateTo, records, scenario, selectedCandidates, source, sourceKind]);

  const selectedCandidateRows = candidates.filter((candidate) => selectedCandidates.includes(candidate.id));
  const trend = buildSeries(countyId, filtered);
  trend.series = trend.series.filter((series) => selectedCandidates.includes(series.candidateId));
  const visibleRows = showAll ? [...filtered].reverse() : [...filtered].reverse().slice(0, 12);
  const filteredSources = new Set(filtered.map((record) => record.source)).size;

  function toggleCandidate(id: string) {
    setSelectedCandidates((current) => {
      if (current.includes(id)) return current.length === 1 ? current : current.filter((value) => value !== id);
      return current.length >= 5 ? [...current.slice(1), id] : [...current, id];
    });
  }

  function resetFilters() {
    setSelectedCandidates(initialCandidates);
    setSourceKind("all");
    setSource("all");
    setScenario("all");
    setDateFrom(dates[0] ?? "");
    setDateTo(dates.at(-1) ?? "");
    setShowAll(false);
  }

  return (
    <section id="poll-comparison" className="scroll-mt-24" aria-labelledby="poll-comparison-title">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <span className="text-xs font-medium text-[#245D91]">民調比較器</span>
          <h2 id="poll-comparison-title" className="mt-1 text-2xl font-semibold tracking-tight text-ink">比較不同機構、題目與人選</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-secondary">不同機構與對戰題目不混成單一平均；篩選後逐筆並列，最多同時追蹤 5 名人選。</p>
        </div>
        <button type="button" onClick={resetFilters} className="self-start rounded-lg border border-line bg-surface px-3 py-2 text-xs font-medium text-ink-secondary hover:border-line-strong hover:text-ink">重設條件</button>
      </div>

      <div className="mt-5 rounded-xl border border-line bg-surface p-4 shadow-card sm:p-5">
        <fieldset>
          <legend className="text-xs font-medium text-ink-secondary">比較人選</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {candidates.map((candidate) => {
              const active = selectedCandidates.includes(candidate.id);
              return (
                <button key={candidate.id} type="button" aria-pressed={active} onClick={() => toggleCandidate(candidate.id)} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${active ? "border-ink bg-ink text-white" : "border-line bg-canvas text-ink-secondary hover:border-line-strong"}`}>
                  <PartyDot party={candidate.partyId} size={8} />
                  {candidate.name}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-2 lg:grid-cols-5">
          <label className="text-xs text-ink-secondary">來源類型
            <select value={sourceKind} onChange={(event) => setSourceKind(event.target.value as typeof sourceKind)} className="mt-1 block h-9 w-full rounded-lg border border-line bg-white px-2 text-sm text-ink">
              <option value="all">全部類型</option><option value="public">公開發布</option><option value="internal">政黨內參</option><option value="primary">黨內初選</option>
            </select>
          </label>
          <label className="text-xs text-ink-secondary">發布來源
            <select value={source} onChange={(event) => setSource(event.target.value)} className="mt-1 block h-9 w-full rounded-lg border border-line bg-white px-2 text-sm text-ink">
              <option value="all">全部來源</option>{sources.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="text-xs text-ink-secondary">題目情境
            <select value={scenario} onChange={(event) => setScenario(event.target.value)} className="mt-1 block h-9 w-full rounded-lg border border-line bg-white px-2 text-sm text-ink">
              <option value="all">全部題目</option>{scenarios.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="text-xs text-ink-secondary">起始日期
            <input type="date" value={dateFrom} min={dates[0]} max={dateTo || dates.at(-1)} onChange={(event) => setDateFrom(event.target.value)} className="mt-1 block h-9 w-full rounded-lg border border-line bg-white px-2 text-sm text-ink" />
          </label>
          <label className="text-xs text-ink-secondary">結束日期
            <input type="date" value={dateTo} min={dateFrom || dates[0]} max={dates.at(-1)} onChange={(event) => setDateTo(event.target.value)} className="mt-1 block h-9 w-full rounded-lg border border-line bg-white px-2 text-sm text-ink" />
          </label>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_260px]">
        <div className="rounded-xl border border-line bg-surface p-4 shadow-card">
          {filtered.length > 0 ? <PollTrendChart trend={trend} candidates={selectedCandidateRows} height={340} /> : <div className="flex h-[340px] items-center justify-center text-sm text-ink-muted">目前條件下沒有可比較的民調</div>}
        </div>
        <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
          <div className="rounded-xl border border-line bg-surface p-4 shadow-card"><div className="text-xs text-ink-muted">符合情境</div><div className="num mt-2 text-2xl font-semibold">{filtered.length}</div><div className="mt-1 text-xs text-ink-secondary">筆逐題數字</div></div>
          <div className="rounded-xl border border-line bg-surface p-4 shadow-card"><div className="text-xs text-ink-muted">發布來源</div><div className="num mt-2 text-2xl font-semibold">{filteredSources}</div><div className="mt-1 text-xs text-ink-secondary">個來源</div></div>
          <div className="rounded-xl border border-line bg-surface p-4 shadow-card"><div className="text-xs text-ink-muted">最新日期</div><div className="num mt-2 text-lg font-semibold">{filtered.at(-1)?.date ?? "—"}</div><div className="mt-1 text-xs text-ink-secondary">調查結束日</div></div>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-line bg-surface shadow-card">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h3 className="text-sm font-semibold text-ink">逐筆比較明細</h3><span className="text-xs text-ink-muted">{countyName} · {filtered.length} 筆</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="bg-canvas text-ink-secondary"><tr><th className="px-4 py-2.5 font-medium">日期／來源</th><th className="px-3 py-2.5 font-medium">類型</th><th className="px-3 py-2.5 font-medium">題目</th><th className="px-3 py-2.5 font-medium">比較人選支持度</th><th className="px-3 py-2.5 font-medium">方法揭露</th></tr></thead>
            <tbody className="divide-y divide-line">
              {visibleRows.map((record) => (
                <tr key={record.id} className="align-top hover:bg-canvas/60">
                  <td className="px-4 py-3"><div className="num whitespace-nowrap text-ink">{record.date}</div>{record.sourceUrl ? <a href={record.sourceUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex text-[#245D91] hover:underline">{record.source} ↗</a> : <div className="mt-1">{record.source}</div>}</td>
                  <td className="px-3 py-3"><span className="rounded bg-canvas px-2 py-1 text-ink-secondary">{SOURCE_KIND_LABEL[record.sourceKind ?? "public"]}</span></td>
                  <td className="max-w-[260px] px-3 py-3 leading-5 text-ink-secondary">{record.scenario ?? "—"}</td>
                  <td className="px-3 py-3"><div className="space-y-1">{Object.entries(record.results).filter(([id]) => selectedCandidates.includes(id)).sort((a, b) => b[1] - a[1]).map(([id, value]) => { const candidate = candidates.find((item) => item.id === id); return <div key={id} className="flex min-w-[150px] items-center justify-between gap-4"><span className="inline-flex items-center gap-1.5"><PartyDot party={candidate?.partyId ?? "ind"} size={8} />{candidate?.name ?? id}<span className="text-ink-muted">{candidate ? partyShort(candidate.partyId) : ""}</span></span><span className="num font-medium">{value}%</span></div>; })}</div></td>
                  <td className="px-3 py-3 leading-5 text-ink-secondary">{record.sampleSize ? `樣本 ${record.sampleSize.toLocaleString()}` : "樣本未揭露"}<br />{record.method ?? "方法未揭露"}</td>
                </tr>
              ))}
              {visibleRows.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-ink-muted">目前條件下沒有資料</td></tr>}
            </tbody>
          </table>
        </div>
        {filtered.length > 12 && <button type="button" onClick={() => setShowAll((value) => !value)} className="block w-full border-t border-line px-4 py-3 text-sm font-medium text-[#245D91] hover:bg-canvas">{showAll ? "收合，只看最近 12 筆" : `展開全部 ${filtered.length} 筆`}</button>}
      </div>
    </section>
  );
}
