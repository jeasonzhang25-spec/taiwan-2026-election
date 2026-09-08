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
import { COUNTY_PAGE_IDS, isCountyPageId } from "@/lib/data/county-pages";
import { MAJOR_CITY_POLLS } from "@/lib/data/polling";
import { partyName, partyShort } from "@/lib/constants";
import { fmtPct } from "@/lib/utils/format";

export const dynamicParams = false;

export function generateStaticParams() {
  return COUNTY_PAGE_IDS.map((countyId) => ({ countyId }));
}

type CountyPageProps = { params: Promise<{ countyId: string }> };

export async function generateMetadata({ params }: CountyPageProps): Promise<Metadata> {
  const { countyId } = await params;
  const county = COUNTY_MAP[countyId];
  if (!county || !isCountyPageId(countyId)) return {};
  const title = `${county.name} 2026 選情、民調與政見｜島嶼選情`;
  const description = `${county.name} 2026 縣市長選舉專頁，提供逐筆民調、候選人身分狀態、政見來源與資料缺口。`;
  return {
    title,
    description,
    alternates: { canonical: `/county/${county.id}` },
    openGraph: { title, description, type: "website", url: `/county/${county.id}` },
  };
}

export default async function CountyPage({ params }: CountyPageProps) {
  const { countyId } = await params;
  if (!isCountyPageId(countyId)) notFound();
  const county = COUNTY_MAP[countyId];
  if (!county) notFound();
  const records = [...(MAJOR_CITY_POLLS[county.id] ?? [])].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  const latestRecord = records.at(-1);
  const latestCandidates = county.candidates
    .filter((candidate) => candidate.id in county.latestSupport)
    .sort((a, b) => (county.latestSupport[b.id] ?? 0) - (county.latestSupport[a.id] ?? 0));
  const registeredCandidateCount = county.candidates.filter((candidate) => candidate.status === "registered" || candidate.status === "qualified").length;
  const pollCandidates = county.candidates.filter((candidate) => records.some((record) => candidate.id in record.results));
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
        <section className="border-b border-line bg-[#0F1114]">
          <div className="mx-auto max-w-page px-4 pb-8 pt-6 sm:px-6 lg:px-8">
            <nav className="flex flex-wrap items-center gap-2 text-xs text-ink-muted" aria-label="麵包屑">
              <a href="/" className="hover:text-ink">全台總覽</a><span aria-hidden="true">/</span><span className="text-ink-secondary">{county.name}</span>
            </nav>
            <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_380px] lg:items-end">
              <div>
                <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-ink-secondary shadow-card">縣市獨立頁</span><CompetitivenessBadge value={county.competitiveness} /></div>
                <h1 className="mt-3 text-3xl font-semibold tracking-[-0.025em] text-ink sm:text-[40px] sm:leading-[1.15]">{county.name} 2026 選情</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-secondary">逐筆比較 {records.length} 筆公開問卷情境。候選人登記已於 9 月 4 日截止{registeredCandidateCount > 0 ? `；本頁已核對 ${registeredCandidateCount} 位登記人選` : "；官方名冊正在分縣市接入"}，尚待資格審定。</p>
                <details className="relative mt-4 w-fit rounded-lg border border-line-strong bg-surface text-sm text-ink-secondary shadow-card">
                  <summary className="cursor-pointer list-none rounded-lg px-3 py-2 font-medium hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">切換縣市 · 目前 {county.name}</summary>
                  <div className="absolute left-0 z-40 mt-2 grid w-[min(86vw,520px)] grid-cols-2 gap-1 rounded-xl border border-line bg-surface p-2 shadow-elevated sm:grid-cols-4">
                    {COUNTY_PAGE_IDS.map((id) => <a key={id} href={`/county/${id}`} aria-current={id === county.id ? "page" : undefined} className={`rounded-lg px-3 py-2 text-[13px] font-medium ${id === county.id ? "bg-brand text-canvas" : "text-ink-secondary hover:bg-canvas hover:text-ink"}`}>{COUNTY_MAP[id]?.name}</a>)}
                  </div>
                </details>
              </div>
              <div className="rounded-2xl border border-line bg-surface p-5">
                <div className="text-xs text-ink-muted">2022 當選首長</div>
                <div className="mt-2 flex items-center gap-2"><PartyDot party={county.incumbentParty} size={12} /><span className="text-lg font-semibold text-ink">{county.incumbentName}</span><span className="text-sm text-ink-secondary">{partyName(county.incumbentParty)}</span></div>
                <div className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-4 text-center"><div><div className="num text-lg font-semibold">{records.length}</div><div className="mt-1 text-xs text-ink-muted">民調情境</div></div><div><div className="num text-lg font-semibold">{sourceCount}</div><div className="mt-1 text-xs text-ink-muted">發布來源</div></div><div><div className="num text-sm font-semibold">{latestRecord?.date ?? "—"}</div><div className="mt-1 text-xs text-ink-muted">最新日期</div></div></div>
              </div>
            </div>
          </div>
        </section>

        <nav className="sticky top-0 z-30 border-b border-line bg-canvas/95 backdrop-blur" aria-label={`${county.name}頁面導覽`}>
          <div className="mx-auto flex max-w-page gap-1 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8"><a href="#overview" className="inline-flex min-h-10 items-center whitespace-nowrap rounded-lg px-3 text-sm font-medium text-ink-secondary hover:bg-surface hover:text-brand">最新概況</a><a href="#poll-comparison" className="inline-flex min-h-10 items-center whitespace-nowrap rounded-lg px-3 text-sm font-medium text-ink-secondary hover:bg-surface hover:text-brand">民調比較</a><a href="#policies" className="inline-flex min-h-10 items-center whitespace-nowrap rounded-lg px-3 text-sm font-medium text-ink-secondary hover:bg-surface hover:text-brand">政見資料</a><a href="#subscriptions" className="inline-flex min-h-10 items-center whitespace-nowrap rounded-lg px-3 text-sm font-medium text-ink-secondary hover:bg-surface hover:text-brand">訂閱提醒</a></div>
        </nav>

        <div className="mx-auto max-w-page space-y-16 px-4 py-10 sm:px-6 lg:px-8">
          <section id="overview" className="scroll-mt-24" aria-labelledby="overview-title">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><span className="text-xs font-medium text-ink-muted">最新概況</span><h2 id="overview-title" className="mt-1 text-2xl font-semibold tracking-tight text-ink">最近採用的公開情境</h2></div><div className="text-xs text-ink-muted">資料範圍 {earliestDate} 至 {latestRecord?.date ?? "—"}</div></div>
            <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_340px]">
              {latestRecord ? <div className="rounded-xl border border-line bg-surface p-5 shadow-card">
                <div className="flex flex-col justify-between gap-2 border-b border-line pb-4 sm:flex-row sm:items-start"><div><div className="text-sm font-semibold text-ink">{latestRecord?.scenario ?? "候選人支持度"}</div><div className="mt-1 text-xs text-ink-muted">{latestRecord?.date} · {latestRecord?.source}</div></div>{latestRecord?.sourceUrl && <a href={latestRecord.sourceUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-brand hover:underline">查看原始來源 ↗</a>}</div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">{latestCandidates.map((candidate) => <div key={candidate.id} className="rounded-lg border border-line bg-canvas p-4"><div className="flex items-center justify-between gap-3"><span className="inline-flex items-center gap-2 text-sm font-medium text-ink"><PartyDot party={candidate.partyId} size={10} />{candidate.name}<span className="text-xs font-normal text-ink-muted">{partyShort(candidate.partyId)}</span></span><span className="num text-xl font-semibold">{fmtPct(county.latestSupport[candidate.id] ?? 0)}</span></div></div>)}</div>
                <p className="mt-4 text-xs leading-5 text-ink-muted">這是單一問卷情境，不是本站平均或勝選預測；同日其他對戰組合可在比較器中查看。</p>
              </div> : <div className="rounded-xl border border-line bg-surface p-5 shadow-card"><span className="rounded-full bg-[#2A2112] px-2.5 py-1 text-xs font-medium text-[#F1C46B]">尚無公開支持度民調</span><h3 className="mt-4 text-lg font-semibold text-ink">沒有數字，不代表沒有選情</h3><p className="mt-2 text-sm leading-6 text-ink-secondary">截至 {county.updatedAt}，公開索引尚無至少兩名人選都有數字的 {county.name} 縣市長支持度調查。本站不以傳聞、匿名截圖或評論推估補空白。</p><a href="/data-status" className="mt-4 inline-flex text-sm font-medium text-brand hover:underline">查看資料覆蓋與核驗狀態 →</a></div>}
              {latestRecord ? <div className="rounded-xl border border-line bg-surface p-5 shadow-card"><h3 className="text-sm font-semibold text-ink">資料揭露狀態</h3><div className="mt-4 space-y-3 text-sm"><div className="flex justify-between gap-3 border-b border-line pb-3"><span className="text-ink-secondary">來源類型</span><span className="font-medium text-ink">{latestRecord.sourceKind === "internal" ? "政黨內參" : latestRecord.sourceKind === "primary" ? "黨內初選" : "公開發布"}</span></div><div className="flex justify-between gap-3 border-b border-line pb-3"><span className="text-ink-secondary">樣本數</span><span className="font-medium text-ink">{latestRecord.sampleSize?.toLocaleString() ?? "未揭露"}</span></div><div className="flex justify-between gap-3 border-b border-line pb-3"><span className="text-ink-secondary">調查方法</span><span className="max-w-[180px] text-right font-medium text-ink">{latestRecord.method ?? "未揭露"}</span></div><div className="flex justify-between gap-3"><span className="text-ink-secondary">抽樣誤差</span><span className="font-medium text-ink">{latestRecord.marginOfError !== undefined ? `±${latestRecord.marginOfError}%` : "未揭露"}</span></div></div></div> : <div className="rounded-xl border border-line bg-surface p-5 shadow-card"><h3 className="text-sm font-semibold text-ink">監測狀態</h3><dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between gap-3 border-b border-line pb-3"><dt className="text-ink-secondary">最近核驗</dt><dd className="num font-medium text-ink">{county.updatedAt}</dd></div><div className="flex justify-between gap-3 border-b border-line pb-3"><dt className="text-ink-secondary">民調情境</dt><dd className="num font-medium text-ink">0</dd></div><div className="flex justify-between gap-3"><dt className="text-ink-secondary">目前處理</dt><dd className="font-medium text-ink">持續監測</dd></div></dl></div>}
            </div>
          </section>

          {records.length > 0 ? <PollComparisonTool countyId={county.id} countyName={county.name} records={records} candidates={pollCandidates} /> : <section id="poll-comparison" className="scroll-mt-24" aria-labelledby="poll-comparison-title"><span className="text-xs font-medium text-brand">民調比較器</span><h2 id="poll-comparison-title" className="mt-1 text-2xl font-semibold tracking-tight text-ink">目前沒有可比較的公開民調</h2><div className="mt-5 rounded-xl border border-dashed border-line-strong bg-surface px-5 py-8 text-center"><p className="text-sm leading-6 text-ink-secondary">系統仍會持續監測公開索引。找到可追溯來源並通過校驗後，這裡會自動出現逐筆比較、趨勢圖與來源明細。</p><a href="/data-status" className="mt-3 inline-flex text-sm font-medium text-brand hover:underline">查看自動核驗狀態 →</a></div></section>}
          <PolicyComparison countyId={county.id} countyName={county.name} candidates={county.candidates} />
          <SourceSubscriptions countyId={county.id} countyName={county.name} sources={sourceSummaries} latestDate={latestRecord?.date ?? ""} />
        </div>
      </main>
      <Footer />
    </>
  );
}
