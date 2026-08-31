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

function formatTaiwanDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

const REVIEW_REASON_LABELS: Record<string, string> = {
  published_results_changed: "已發布數字與上一版不一致",
  source_content_changed: "來源頁內容有變動",
  source_unreachable: "來源目前無法連線",
  source_restricted: "來源限制自動讀取",
  no_poll_evidence_found: "頁面未辨識到候選人或百分比",
};

function sourceDomain(value?: string | null) {
  if (!value) return "未提供來源網址";
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}

export default function DataStatusPage() {
  const health = getPollDataHealth();
  const covered = Object.entries(POLL_RECORDS_BY_COUNTY)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);
  const missingNames = health.missingCountyIds.map((id) => COUNTY_MAP[id]?.name ?? id);
  const statusLabel = health.status === "healthy"
    ? "發布前檢查通過"
    : health.status === "stale"
      ? `超過 ${health.staleAfterHours} 小時未核驗`
      : "資料檢查未通過";
  const healthy = health.status === "healthy";

  return (
    <>
      <InfoPageHeader />
      <main id="main-content" className="mx-auto max-w-page px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${healthy ? "bg-[#E8F5EE] text-[#126B43]" : "bg-[#FBF1E2] text-[#8A5D0A]"}`}>
              <span className={`h-2 w-2 rounded-full ${healthy ? "bg-[#178A56]" : "bg-[#D19A0B]"}`} aria-hidden="true" />
              {statusLabel}
            </span>
            <span className="text-xs text-ink-muted">民調目錄核驗 {health.checkedAt}</span>
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">資料狀態與更正紀錄</h1>
          <p className="mt-3 text-base leading-7 text-ink-secondary">
            這裡公開網站目前收錄多少資料、哪些地方仍是空白，以及我們如何避免錯誤資料自動上線。它是資料透明度頁，不是即時開票頁。
          </p>
        </div>

        <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="資料摘要">
          <Metric label="民調情境" value={`${health.recordCount} 筆`} note="每個問卷對戰組合各自保留" />
          <Metric label="公開調查組" value={`約 ${health.surveyCount} 組`} note="依縣市、調查期間、機構與來源歸組" />
          <Metric label="縣市覆蓋" value={`${health.countyCount} / ${health.totalCountyCount}`} note="有至少兩名人選的數字支持度" />
          <Metric label="最新調查日期" value={health.latestPollDate} note="依公開索引中的調查結束日" />
        </section>

        <section className="mt-10 rounded-xl border border-line bg-surface p-5 shadow-card sm:p-6" aria-labelledby="freshness-title">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="freshness-title" className="text-lg font-semibold text-ink">兩套更新時間，分別說明</h2>
              <p className="mt-1 text-sm leading-6 text-ink-secondary">即時新聞索引和結構化民調不是同一套資料，不能共用一個「最新」標籤。</p>
            </div>
            <span className="rounded-full border border-line bg-canvas px-3 py-1 text-xs text-ink-muted">{health.scheduleLabel}</span>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <article className="rounded-lg border border-line bg-canvas p-4">
              <div className="flex items-center justify-between gap-3"><h3 className="font-semibold text-ink">結構化民調</h3><span className="rounded bg-[#E8F5EE] px-2 py-1 text-[11px] font-medium text-[#126B43]">人工規則核驗</span></div>
              <dl className="mt-3 grid gap-2 text-sm">
                <div className="flex justify-between gap-4"><dt className="text-ink-muted">目錄最近檢查</dt><dd className="num text-ink">{health.checkedAt}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-ink-muted">內容最近變化</dt><dd className="num text-right text-ink">{formatTaiwanDateTime(health.generatedAt)}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-ink-muted">最新調查結束日</dt><dd className="num text-ink">{health.latestPollDate}</dd></div>
              </dl>
            </article>
            <article className="rounded-lg border border-line bg-canvas p-4">
              <div className="flex items-center justify-between gap-3"><h3 className="font-semibold text-ink">即時媒體索引</h3><span className="rounded bg-[#EAF1FA] px-2 py-1 text-[11px] font-medium text-[#245A96]">頁面開啟後刷新</span></div>
              <p className="mt-3 text-sm leading-6 text-ink-secondary">每 5 分鐘嘗試讀取新聞標題、來源、時間和連結。它只用於發現線索，不會自動寫入地圖、領先縣市或民調趨勢。</p>
              <a href="/#live-data" className="mt-2 inline-flex text-sm font-medium text-[#245D91] hover:underline">查看即時索引與實際抓取時間 →</a>
            </article>
          </div>
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
              <div className="flex items-start justify-between gap-4">
                <div><h2 className="text-lg font-semibold text-ink">發布前校驗與揭露缺口</h2><p className="mt-2 text-sm leading-6 text-ink-secondary">結構錯誤會阻擋發布；原始來源未揭露的欄位會如實留空。</p></div>
                <span className={`num rounded-full px-2.5 py-1 text-xs font-semibold ${health.blockingIssueCount === 0 ? "bg-[#E8F5EE] text-[#126B43]" : "bg-[#FBECEC] text-[#9C2B25]"}`}>{health.blockingIssueCount} 個阻斷項</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  [health.rowsWithFullMethodology, "筆方法欄位完整"],
                  [health.rowsMissingSampleSize, "筆未列樣本數"],
                  [health.rowsMissingMethod, "筆未列調查方法"],
                  [health.rowsMissingPublishedAt, "筆未列發布日期"],
                  [health.rowsMissingMarginOfError, "筆未列抽樣誤差"],
                  [health.invalidSourceUrlCount, "筆來源連結無效"],
                ].map(([value, label]) => (
                  <div key={String(label)} className="rounded-lg bg-canvas p-3"><div className="num text-xl font-semibold">{value}</div><div className="mt-1 text-xs text-ink-muted">{label}</div></div>
                ))}
              </div>
              <a href={health.indexUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-sm font-medium text-[#245D91] underline decoration-[#245D91]/30 underline-offset-4 hover:decoration-[#245D91]">查看公開民調索引 ↗</a>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-xl border border-line bg-surface p-5 shadow-card sm:p-6" aria-labelledby="source-audit-title">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <h2 id="source-audit-title" className="text-lg font-semibold text-ink">民調來源自動核驗</h2>
              <p className="mt-2 text-sm leading-6 text-ink-secondary">
                系統會逐一檢查原始連結是否可讀、來源頁內容是否改變，以及已發布支持度是否被改寫。機器無法判定的項目會進入人工複核，不會直接覆蓋網站數字。
              </p>
            </div>
            <div className="text-right text-xs leading-5 text-ink-muted">
              <div>{health.sourceAudit.checkedSourceCount > 0 ? "最近完成核驗" : "尚未完成連線核驗"}</div>
              <div className="num">{formatTaiwanDateTime(health.sourceAudit.generatedAt)}</div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              [health.sourceAudit.checkedSourceCount, "個來源已檢查"],
              [health.sourceAudit.reachableCount, "個可正常讀取"],
              [health.sourceAudit.restrictedCount, "個限制自動讀取"],
              [health.sourceAudit.unreachableCount, "個目前無法連線"],
              [health.sourceAudit.contentChangedCount, "個來源內容變動"],
              [health.sourceAudit.reviewQueueCount, "項待人工複核"],
            ].map(([value, label]) => (
              <div key={String(label)} className="rounded-lg border border-line bg-canvas p-3">
                <div className="num text-xl font-semibold text-ink">{value}</div>
                <div className="mt-1 text-xs leading-5 text-ink-muted">{label}</div>
              </div>
            ))}
          </div>

          {health.sourceAudit.reviewQueue.length > 0 ? (
            <div className="mt-5 overflow-hidden rounded-lg border border-line">
              <div className="flex items-center justify-between gap-3 border-b border-line bg-canvas px-4 py-3">
                <h3 className="text-sm font-semibold text-ink">人工複核佇列</h3>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${health.sourceAudit.blockingIssueCount > 0 ? "bg-[#FBECEC] text-[#9C2B25]" : "bg-[#FBF1E2] text-[#8A5D0A]"}`}>
                  {health.sourceAudit.blockingIssueCount > 0 ? `${health.sourceAudit.blockingIssueCount} 項阻擋發布` : "不阻擋上一版資料"}
                </span>
              </div>
              <div className="divide-y divide-line">
                {health.sourceAudit.reviewQueue.slice(0, 6).map((item) => (
                  <article key={item.id} className="grid gap-2 px-4 py-3 text-sm sm:grid-cols-[180px_1fr_auto] sm:items-center">
                    <div className="truncate font-medium text-ink">{sourceDomain(item.url)}</div>
                    <div className="text-ink-secondary">{item.reasons.map((reason) => REVIEW_REASON_LABELS[reason] ?? reason).join("、")}</div>
                    {item.url ? <a href={item.url} target="_blank" rel="noreferrer" className="text-xs font-medium text-[#245D91] hover:underline">查看來源 ↗</a> : null}
                  </article>
                ))}
              </div>
              {health.sourceAudit.reviewQueueCount > health.sourceAudit.reviewQueue.slice(0, 6).length ? (
                <div className="border-t border-line bg-canvas px-4 py-2.5 text-xs text-ink-muted">頁面先列出前 6 項；完整清單保存在核驗產物中。</div>
              ) : null}
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-[#CFE7DA] bg-[#F1F8F4] px-4 py-3 text-sm text-[#126B43]">
              目前沒有需要人工複核的來源異常，也沒有偵測到已發布數字被改寫。
            </div>
          )}
        </section>

        <section className="mt-10 rounded-xl border border-line bg-surface p-5 shadow-card sm:p-6">
          <h2 className="text-lg font-semibold text-ink">自動更新怎麼把關</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            {[
              ["01", "發現", "每 30 分鐘檢查公開民調索引是否有新內容。"],
              ["02", "雙層驗證", "先核對欄位與百分比，再檢查來源連線、內容指紋與數字變更。"],
              ["03", "安全發布", "數字遭改寫時阻擋新版；其餘可疑來源排入人工複核，保留上一版。"],
              ["04", "監看告警", "流程失敗或超過 72 小時未成功檢查時，自動建立 GitHub 提醒。"],
            ].map(([number, title, detail]) => (
              <div key={String(number)} className="rounded-lg border border-line bg-canvas p-4">
                <div className="num text-xs text-ink-muted">{number}</div>
                <h3 className="mt-2 font-semibold text-ink">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-ink-secondary">{detail}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-ink-muted">自動工作流已放入專案；上傳至 GitHub 並啟用 Actions 後才會定時執行。同步失敗或校驗不通過時不會覆蓋上一版可用資料。GitHub 排程可能受平台負載延遲，不承諾秒級即時。</p>
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
