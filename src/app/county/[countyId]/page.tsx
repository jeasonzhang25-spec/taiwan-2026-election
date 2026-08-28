import type { Metadata } from "next";
import { notFound } from "next/navigation";
import InfoPageHeader from "@/components/layout/InfoPageHeader";
import Footer from "@/components/layout/Footer";
import PollComparisonTool from "@/components/county/PollComparisonTool";
import PolicyComparison from "@/components/county/PolicyComparison";
import SourceSubscriptions from "@/components/county/SourceSubscriptions";
import { PartyDot } from "@/components/ui/PartyDot";
import { CompetitivenessBadge } from "@/components/ui/Badge";
import { COUNTY_MAP } from "@/lib/data/counties";
import { isMetroCountyId, METRO_COUNTY_IDS } from "@/lib/data/county-pages";
import { MAJOR_CITY_POLLS } from "@/lib/data/polling";
import { partyName, partyShort } from "@/lib/constants";
import { fmtPct } from "@/lib/utils/format";

export const dynamicParams = false;

export function generateStaticParams() {
  return METRO_COUNTY_IDS.map((countyId) => ({ countyId }));
}

export function generateMetadata({ params }: { params: { countyId: string } }): Metadata {
  const county = COUNTY_MAP[params.countyId];
  if (!county || !isMetroCountyId(params.countyId)) return {};
  return {
    title: `${county.name} 2026 選情、民調與政見｜島嶼選情`,
    description: `${county.name} 2026 縣市長選舉專頁，提供逐筆民調比較、候選人登記狀態、政見資料與來源訂閱。`,
  };
}

export default function CountyPage({ params }: { params: { countyId: string } }) {
  if (!isMetroCountyId(params.countyId)) notFound();
  const county = COUNTY_MAP[params.countyId];
  if (!county) notFound();
  const records = [...(MAJOR_CITY_POLLS[county.id] ?? [])].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  const latestRecord = records.at(-1);
  const latestCandidates = county.candidates
    .filter((candidate) => candidate.id in county.latestSupport)
    .sort((a, b) => (county.latestSupport[b.id] ?? 0) - (county.latestSupport[a.id] ?? 0));
  const sourceSummaries = Array.from(records.reduce((map, record) => {
    const current = map.get(record.source) ?? { name: record.source, count: 0, latestDate: "" };
    current.count += 1;
    if (record.date > current.latestDate) current.latestDate = record.date;
    map.set(record.source, current);
    return map;
  }, new Map<string, { name: string; count: number; latestDate: string }>()).values())
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "zh-Hant"));
  const sourceCount = sourceSummaries.length;
  const earliestDate = records[0]?.date ?? "—";

  return (
    <>
      <InfoPageHeader />
      <main id="main-content">
        <section className="border-b border-line bg-[#F0F3F6]">
          <div className="mx-auto max-w-page px-4 pb-8 pt-6 sm:px-6 lg:px-8">
            <nav className="flex flex-wrap items-center gap-2 text-xs text-ink-muted" aria-label="麵包屑">
              <a href="/" className="hover:text-ink">全台總覽</a><span aria-hidden="true">/</span><span className="text-ink-secondary">{county.name}</span>
            </nav>
            <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_380px] lg:items-end">
              <div>
                <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-ink-secondary shadow-card">六都專頁</span><CompetitivenessBadge value={county.competitiveness} /></div>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{county.name} 2026 選情</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-secondary">逐筆比較 {records.length} 筆公開問卷情境，並追蹤正式候選人登記、政見來源與後續資料更新。人名目前仍是民調選項，不代表中選會正式名冊。</p>
                <div className="mt-4 flex flex-wrap gap-2">{METRO_COUNTY_IDS.map((id) => <a key={id} href={`/county/${id}`} aria-current={id === county.id ? "page" : undefined} className={`rounded-full border px-3 py-1.5 text-xs ${id === county.id ? "border-ink bg-ink text-white" : "border-line-strong bg-white text-ink-secondary hover:text-ink"}`}>{COUNTY_MAP[id]?.name}</a>)}</div>
              </div>
              <div className="rounded-xl border border-white/80 bg-white p-5 shadow-card">
                <div className="text-xs text-ink-muted">2022 當選首長</div>
                <div className="mt-2 flex items-center gap-2"><PartyDot party={county.incumbentParty} size={12} /><span className="text-lg font-semibold text-ink">{county.incumbentName}</span><span className="text-sm text-ink-secondary">{partyName(county.incumbentParty)}</span></div>
                <div className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-4 text-center"><div><div className="num text-lg font-semibold">{records.length}</div><div className="mt-1 text-[11px] text-ink-muted">民調情境</div></div><div><div className="num text-lg font-semibold">{sourceCount}</div><div className="mt-1 text-[11px] text-ink-muted">發布來源</div></div><div><div className="num text-sm font-semibold">{latestRecord?.date ?? "—"}</div><div className="mt-1 text-[11px] text-ink-muted">最新日期</div></div></div>
              </div>
            </div>
          </div>
        </section>

        <nav className="sticky top-0 z-30 border-b border-line bg-canvas/95 backdrop-blur" aria-label={`${county.name}頁面導覽`}>
          <div className="mx-auto flex max-w-page gap-1 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8"><a href="#overview" className="whitespace-nowrap rounded-md px-3 py-2 text-sm text-ink-secondary hover:bg-white hover:text-ink">最新概況</a><a href="#poll-comparison" className="whitespace-nowrap rounded-md px-3 py-2 text-sm text-ink-secondary hover:bg-white hover:text-ink">民調比較</a><a href="#policies" className="whitespace-nowrap rounded-md px-3 py-2 text-sm text-ink-secondary hover:bg-white hover:text-ink">政見資料</a><a href="#subscriptions" className="whitespace-nowrap rounded-md px-3 py-2 text-sm text-ink-secondary hover:bg-white hover:text-ink">訂閱提醒</a></div>
        </nav>

        <div className="mx-auto max-w-page space-y-16 px-4 py-10 sm:px-6 lg:px-8">
          <section id="overview" className="scroll-mt-24" aria-labelledby="overview-title">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><span className="text-xs font-medium text-ink-muted">最新概況</span><h2 id="overview-title" className="mt-1 text-2xl font-semibold tracking-tight text-ink">最近採用的公開情境</h2></div><div className="text-xs text-ink-muted">資料範圍 {earliestDate} 至 {latestRecord?.date ?? "—"}</div></div>
            <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_340px]">
              <div className="rounded-xl border border-line bg-surface p-5 shadow-card">
                <div className="flex flex-col justify-between gap-2 border-b border-line pb-4 sm:flex-row sm:items-start"><div><div className="text-sm font-semibold text-ink">{latestRecord?.scenario ?? "候選人支持度"}</div><div className="mt-1 text-xs text-ink-muted">{latestRecord?.date} · {latestRecord?.source}</div></div>{latestRecord?.sourceUrl && <a href={latestRecord.sourceUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-[#245D91] hover:underline">查看原始來源 ↗</a>}</div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">{latestCandidates.map((candidate) => <div key={candidate.id} className="rounded-lg border border-line bg-canvas p-4"><div className="flex items-center justify-between gap-3"><span className="inline-flex items-center gap-2 text-sm font-medium text-ink"><PartyDot party={candidate.partyId} size={10} />{candidate.name}<span className="text-xs font-normal text-ink-muted">{partyShort(candidate.partyId)}</span></span><span className="num text-xl font-semibold">{fmtPct(county.latestSupport[candidate.id] ?? 0)}</span></div></div>)}</div>
                <p className="mt-4 text-xs leading-5 text-ink-muted">這是單一問卷情境，不是本站平均或勝選預測；同日其他對戰組合可在比較器中查看。</p>
              </div>
              <div className="rounded-xl border border-line bg-surface p-5 shadow-card"><h3 className="text-sm font-semibold text-ink">資料揭露狀態</h3><div className="mt-4 space-y-3 text-sm"><div className="flex justify-between gap-3 border-b border-line pb-3"><span className="text-ink-secondary">來源類型</span><span className="font-medium text-ink">{latestRecord?.sourceKind === "internal" ? "政黨內參" : latestRecord?.sourceKind === "primary" ? "黨內初選" : "公開發布"}</span></div><div className="flex justify-between gap-3 border-b border-line pb-3"><span className="text-ink-secondary">樣本數</span><span className="font-medium text-ink">{latestRecord?.sampleSize?.toLocaleString() ?? "未揭露"}</span></div><div className="flex justify-between gap-3 border-b border-line pb-3"><span className="text-ink-secondary">調查方法</span><span className="max-w-[180px] text-right font-medium text-ink">{latestRecord?.method ?? "未揭露"}</span></div><div className="flex justify-between gap-3"><span className="text-ink-secondary">抽樣誤差</span><span className="font-medium text-ink">{latestRecord?.marginOfError !== undefined ? `±${latestRecord.marginOfError}%` : "未揭露"}</span></div></div></div>
            </div>
          </section>

          <PollComparisonTool countyId={county.id} countyName={county.name} records={records} candidates={county.candidates} />
          <PolicyComparison countyName={county.name} candidates={county.candidates} />
          <SourceSubscriptions countyId={county.id} countyName={county.name} sources={sourceSummaries} latestDate={latestRecord?.date ?? ""} />
        </div>
      </main>
      <Footer />
    </>
  );
}
