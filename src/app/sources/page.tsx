import type { Metadata } from "next";
import InfoPageHeader from "@/components/layout/InfoPageHeader";
import Footer from "@/components/layout/Footer";
import { COUNTY_MAP } from "@/lib/data/counties";
import pollData from "@/lib/data/generated/public-polls.json";
import auditData from "@/lib/data/generated/poll-source-audit.json";

export const metadata: Metadata = {
  title: "民調來源台帳與去重規則｜島嶼選情",
  description: "逐組查看公開民調的縣市、調查期間、機構、題目數量、來源網址與自動核驗狀態。",
  alternates: { canonical: "/sources" },
  openGraph: {
    title: "民調來源台帳與去重規則｜島嶼選情",
    description: "公開民調來源、調查分組與核驗狀態。",
    type: "website",
    url: "/sources",
  },
};

type PollRecord = {
  id: string;
  sourceKind?: "public" | "internal" | "primary";
};

type SurveyGroup = {
  id: string;
  countyId: string;
  fieldwork?: string;
  institute: string;
  recordIds: string[];
  sourceUrls: string[];
  scenarioCount: number;
};

type SourceAudit = {
  url: string;
  status: "reachable" | "restricted" | "unreachable" | "not-checked";
  evidence: "strong" | "partial" | "none";
  contentChanged: boolean;
};

const records = pollData.records as PollRecord[];
const recordById = new Map(records.map((record) => [record.id, record]));
const sourceAuditByUrl = new Map(
  (auditData.sources as SourceAudit[]).map((source) => [source.url, source]),
);
const groups = auditData.surveyGroups as SurveyGroup[];

const STATUS_LABEL = {
  reachable: "可讀取",
  restricted: "限制自動讀取",
  unreachable: "暫時無法連線",
  "not-checked": "尚未檢查",
};

function domain(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}

export default function SourcesPage() {
  const byCounty = Array.from(groups.reduce((map, group) => {
    const list = map.get(group.countyId) ?? [];
    list.push(group);
    map.set(group.countyId, list);
    return map;
  }, new Map<string, SurveyGroup[]>()).entries()).sort((a, b) =>
    (COUNTY_MAP[a[0]]?.name ?? a[0]).localeCompare(COUNTY_MAP[b[0]]?.name ?? b[0], "zh-Hant"),
  );

  return (
    <>
      <InfoPageHeader />
      <main id="main-content" className="mx-auto max-w-page px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-ink-secondary shadow-card">資料治理</span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">民調來源台帳</h1>
          <p className="mt-3 text-base leading-7 text-ink-secondary">
            同一份調查可能包含多組對戰題目，也可能被多家媒體轉載。本站按「縣市＋調查期間＋機構」歸組，不把每一道題誤算成獨立民調；無法從公開資料確認委託方或原始發布者時，維持未披露。
          </p>
        </div>

        <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="來源台帳摘要">
          {[
            [auditData.summary.recordCount, "問卷情境"],
            [auditData.summary.surveyCount, "調查分組"],
            [auditData.summary.sourceCount, "來源網址"],
            [auditData.summary.reviewQueueCount, "待人工複核"],
          ].map(([value, label]) => (
            <div key={String(label)} className="rounded-xl border border-line bg-surface p-4 shadow-card">
              <div className="num text-2xl font-semibold text-ink">{value}</div>
              <div className="mt-1 text-sm text-ink-secondary">{label}</div>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-xl border border-line bg-surface p-5 shadow-card">
          <h2 className="text-lg font-semibold text-ink">去重與發布規則</h2>
          <ol className="mt-4 grid gap-3 text-sm leading-6 text-ink-secondary md:grid-cols-3">
            <li className="rounded-lg bg-canvas p-4"><strong className="block text-ink">1. 調查歸組</strong>縣市、調查期間與機構相同的多道題目歸為一組，保留每題原始數字。</li>
            <li className="rounded-lg bg-canvas p-4"><strong className="block text-ink">2. 來源核驗</strong>檢查連結可達性及候選人、百分比證據；網站限制抓取時進入人工複核。</li>
            <li className="rounded-lg bg-canvas p-4"><strong className="block text-ink">3. 修訂保護</strong>已發布數字被替換或刪除時阻擋新版，不用新抓取結果靜默覆蓋。</li>
          </ol>
        </section>

        <div className="mt-10 space-y-8">
          {byCounty.map(([countyId, countyGroups]) => (
            <section key={countyId} aria-labelledby={`source-${countyId}`}>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h2 id={`source-${countyId}`} className="text-xl font-semibold text-ink">{COUNTY_MAP[countyId]?.name ?? countyId}</h2>
                  <p className="mt-1 text-sm text-ink-secondary">{countyGroups.length} 組調查</p>
                </div>
                <a href={`/county/${countyId}`} className="text-sm font-medium text-brand hover:underline">查看縣市頁 →</a>
              </div>
              <div className="mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface shadow-card">
                {countyGroups.map((group) => {
                  const groupRecords = group.recordIds.flatMap((id) => recordById.get(id) ? [recordById.get(id)!] : []);
                  const sourceKind = groupRecords[0]?.sourceKind ?? "public";
                  return (
                    <article key={group.id} className="grid gap-3 p-4 sm:grid-cols-[minmax(170px,0.8fr)_minmax(220px,1.2fr)_auto] sm:items-start">
                      <div>
                        <h3 className="font-semibold text-ink">{group.institute}</h3>
                        <p className="mt-1 text-xs text-ink-muted">{group.fieldwork || "調查期間未披露"} · {group.scenarioCount} 道題目</p>
                        <span className="mt-2 inline-flex rounded-full bg-canvas px-2 py-1 text-xs text-ink-secondary">{sourceKind === "internal" ? "政黨內參" : sourceKind === "primary" ? "黨內初選" : "公開發布"}</span>
                      </div>
                      <div className="space-y-2">
                        {group.sourceUrls.map((url) => {
                          const audit = sourceAuditByUrl.get(url);
                          return (
                            <div key={url} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                              <a href={url} target="_blank" rel="noreferrer" className="font-medium text-brand hover:underline">{domain(url)} ↗</a>
                              <span className="text-ink-muted">{audit ? STATUS_LABEL[audit.status] : "未列入核驗"}</span>
                              {audit?.contentChanged ? <span className="text-[#FF8A84]">內容有變化</span> : null}
                            </div>
                          );
                        })}
                      </div>
                      <div className="text-xs text-ink-muted">委託／原始發布關係：<span className="font-medium text-ink-secondary">依來源披露</span></div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
