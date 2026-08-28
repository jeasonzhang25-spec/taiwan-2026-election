import { getPollDataHealth } from "@/lib/data/health";

export default function TrustCenterSection() {
  const health = getPollDataHealth();
  return (
    <section className="mx-auto max-w-page px-4 pt-10 sm:px-6 lg:px-8" aria-labelledby="trust-title">
      <div className="overflow-hidden rounded-xl border border-line bg-[#F0F5F2] shadow-card">
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-[#126B43]">
                <span className="h-2 w-2 rounded-full bg-[#178A56]" aria-hidden="true" />
                資料檢查正常
              </span>
              <span className="text-xs text-ink-muted">最近檢查 {health.checkedAt}</span>
            </div>
            <h2 id="trust-title" className="text-xl font-semibold tracking-tight text-ink">每個數字都能追到來源，也看得到缺口</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-secondary">
              已收錄 {health.recordCount} 筆民調情境、涵蓋 {health.countyCount} 個縣市、來自 {health.sourceCount} 個發布來源。系統會在同步後自動檢查異常；來源未揭露的方法與樣本數，不自行補猜。
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
            <a href="/data-status" className="rounded-lg bg-ink px-4 py-2.5 text-center text-sm font-medium text-white transition-opacity hover:opacity-85">查看資料狀態</a>
            <a href="/roadmap" className="rounded-lg border border-line-strong bg-white px-4 py-2.5 text-center text-sm font-medium text-ink hover:border-ink-muted">查看完善清單</a>
          </div>
        </div>
      </div>
    </section>
  );
}
