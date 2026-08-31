import { getPollDataHealth } from "@/lib/data/health";

export default function TrustCenterSection() {
  const health = getPollDataHealth();
  const healthy = health.status === "healthy";
  return (
    <section className="mx-auto max-w-page px-4 pt-16 sm:px-6 lg:px-8" aria-labelledby="trust-title">
      <div className="overflow-hidden rounded-2xl border border-brand/15 bg-brand-mist">
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium ${healthy ? "text-[#126B43]" : "text-[#8A5D0A]"}`}>
                <span className={`h-2 w-2 rounded-full ${healthy ? "bg-[#178A56]" : "bg-[#D19A0B]"}`} aria-hidden="true" />
                {healthy ? "發布前檢查通過" : health.status === "stale" ? "核驗資料已過期" : "資料檢查未通過"}
              </span>
              <span className="text-xs text-ink-muted">民調目錄核驗 {health.checkedAt}</span>
            </div>
            <h2 id="trust-title" className="text-[22px] font-semibold leading-8 tracking-tight text-ink sm:text-2xl">每個數字都能追到來源，也看得到缺口</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-secondary">
              已收錄 {health.recordCount} 筆民調情境，歸為約 {health.surveyCount} 組公開調查，涵蓋 {health.countyCount} 個縣市。發布前會阻擋重複 ID、無效來源連結與異常支持度；來源未揭露的方法與樣本數不自行補猜。
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
            <a href="/data-status" className="rounded-xl bg-brand px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-brand-strong">查看資料狀態</a>
            <a href="/roadmap" className="rounded-lg border border-line-strong bg-white px-4 py-2.5 text-center text-sm font-medium text-ink hover:border-ink-muted">查看完善清單</a>
          </div>
        </div>
      </div>
    </section>
  );
}
