import type { Metadata } from "next";
import InfoPageHeader from "@/components/layout/InfoPageHeader";
import Footer from "@/components/layout/Footer";
import { COUNTY_MAP } from "@/lib/data/counties";
import { DATA_CHANGE_LOG } from "@/lib/data/change-log";
import { getPollDataHealth, POLL_RECORDS_BY_COUNTY } from "@/lib/data/health";

export const metadata: Metadata = {
  title: "資料狀態與更正紀錄｜島嶼選情",
  description: "查看島嶼選情的民調覆蓋、更新狀態、資料缺口、同步流程與更正紀錄。",
};

export const dynamic = "force-dynamic";

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4 shadow-card">
      <div className="text-xs text-ink-muted">{label}</div>
      <div className="num mt-2 text-2xl font-semibold text-ink">{value}</div>
      <div className="mt-1 text-xs leading-5 text-ink-secondary">{note}</div>
    </div>
  );
}

export default function DataStatusPage() {
  const health = getPollDataHealth();
  const covered = Object.entries(POLL_RECORDS_BY_COUNTY)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);
  const missingNames = health.missingCountyIds.map((id) => COUNTY_MAP[id]?.name ?? id);

  return (
    <>
      <InfoPageHeader />
      <main id="main-content" className="mx-auto max-w-page px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${health.status === "healthy" ? "bg-[#E8F5EE] text-[#126B43]" : "bg-[#FBF1E2] text-[#8A5D0A]"}`}>
              <span className={`h-2 w-2 rounded-full ${health.status === "healthy" ? "bg-[#178A56]" : "bg-[#D19A0B]"}`} aria-hidden="true" />
              {health.status === "healthy" ? "資料檢查正常" : "資料超過 72 小時未更新"}
            </span>
            <span className="text-xs text-ink-muted">最近檢查 {health.checkedAt}</span>
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">資料狀態與更正紀錄</h1>
          <p className="mt-3 text-base leading-7 text-ink-secondary">
            這裡公開網站目前收錄多少資料、哪些地方仍是空白，以及我們如何避免錯誤資料自動上線。它是資料透明度頁，不是即時開票頁。
          </p>
        </div>

        <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="資料摘要">
          <Metric label="民調情境" value={`${health.recordCount} 筆`} note="同一調查不同對戰組合分開保留" />
          <Metric label="縣市覆蓋" value={`${health.countyCount} / ${health.totalCountyCount}`} note="有至少兩名人選的數字支持度" />
          <Metric label="發布來源" value={`${health.sourceCount} 個`} note="保留每一筆原始報導連結" />
          <Metric label="最新調查日期" value={health.latestPollDate} note="依公開索引中的調查結束日" />
        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
            <div className="border-b border-line px-5 py-4">
              <h2 className="text-lg font-semibold text-ink">縣市覆蓋</h2>
              <p className="mt-1 text-sm text-ink-secondary">筆數代表公開表格中的問卷情境，不等於獨立調查次數。</p>
            </div>
            <div className="grid gap-x-6 gap-y-1 p-3 sm:grid-cols-2">
              {covered.map(([id, count]) => (
                <div key={id} className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm hover:bg-canvas">
                  <span className="text-ink">{COUNTY_MAP[id]?.name ?? id}</span>
                  <span className="num text-ink-secondary">{count} 筆</span>
                </div>
              ))}
            </div>
            <div className="border-t border-line bg-[#FBF8EF] px-5 py-4 text-sm leading-6 text-[#725817]">
              尚無符合條件的公開支持度民調：{missingNames.join("、")}。沒有數字不代表沒有參選人，也不代表選情落後。
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-xl border border-line bg-surface p-5 shadow-card">
              <h2 className="text-lg font-semibold text-ink">來源類型</h2>
              <div className="mt-4 space-y-3 text-sm">
                {[
                  ["公開發布", health.sourceKindCounts.public, "媒體、調查機構或公開報導"],
                  ["政黨內參", health.sourceKindCounts.internal, "由政黨或陣營公布，需留意立場"],
                  ["黨內初選", health.sourceKindCounts.primary, "只反映特定提名程序或黨內比較"],
                ].map(([label, count, note]) => (
                  <div key={String(label)} className="flex items-start justify-between gap-4 border-b border-line pb-3 last:border-0 last:pb-0">
                    <div><div className="font-medium text-ink">{label}</div><div className="mt-0.5 text-xs text-ink-muted">{note}</div></div>
                    <span className="num font-semibold text-ink">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-line bg-surface p-5 shadow-card">
              <h2 className="text-lg font-semibold text-ink">來源未完整揭露的欄位</h2>
              <p className="mt-2 text-sm leading-6 text-ink-secondary">公開索引常只有支持度與日期；本站不推測缺少的方法學資訊。</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-canvas p-3"><div className="num text-xl font-semibold">{health.rowsMissingSampleSize}</div><div className="mt-1 text-xs text-ink-muted">筆未列樣本數</div></div>
                <div className="rounded-lg bg-canvas p-3"><div className="num text-xl font-semibold">{health.rowsMissingMethod}</div><div className="mt-1 text-xs text-ink-muted">筆未列調查方法</div></div>
              </div>
              <a href={health.indexUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-sm font-medium text-[#245D91] underline decoration-[#245D91]/30 underline-offset-4 hover:decoration-[#245D91]">查看公開民調索引 ↗</a>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-xl border border-line bg-surface p-5 shadow-card sm:p-6">
          <h2 className="text-lg font-semibold text-ink">自動更新怎麼把關</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            {[
              ["01", "發現", "每 30 分鐘檢查公開民調索引是否有新內容。"],
              ["02", "驗證", "核對筆數、日期、百分比、縣市、候選人與來源網址。"],
              ["03", "發布", "只有資料真的改變且網站建置通過，才保存新版。"],
              ["04", "監看", "資料超過 72 小時沒有成功檢查時，頁面改為提醒狀態。"],
            ].map(([number, title, detail]) => (
              <div key={String(number)} className="rounded-lg border border-line bg-canvas p-4">
                <div className="num text-xs text-ink-muted">{number}</div>
                <h3 className="mt-2 font-semibold text-ink">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-ink-secondary">{detail}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-ink-muted">自動工作流已放入專案；上傳至 GitHub 並啟用 Actions 後才會定時執行。GitHub 排程可能受平台負載延遲，不承諾秒級即時。</p>
        </section>

        <section className="mt-10" aria-labelledby="change-log-title">
          <div className="flex items-end justify-between gap-4">
            <div><h2 id="change-log-title" className="text-xl font-semibold text-ink">更新與更正紀錄</h2><p className="mt-1 text-sm text-ink-secondary">重要資料異動會留下原因，不靜默改寫。</p></div>
          </div>
          <div className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface shadow-card">
            {DATA_CHANGE_LOG.map((entry) => (
              <article key={`${entry.date}-${entry.title}`} className="grid gap-3 p-5 sm:grid-cols-[110px_1fr]">
                <div><div className="num text-xs text-ink-muted">{entry.date}</div><div className="mt-1 text-xs font-medium text-[#245D91]">{entry.kind}</div></div>
                <div><h3 className="font-semibold text-ink">{entry.title}</h3><p className="mt-1 text-sm leading-6 text-ink-secondary">{entry.detail}</p></div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
