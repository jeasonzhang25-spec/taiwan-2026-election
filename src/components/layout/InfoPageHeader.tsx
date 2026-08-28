import BrandLogo from "@/components/layout/BrandLogo";

export default function InfoPageHeader() {
  return (
    <header className="border-b border-line bg-canvas/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-page items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="/" aria-label="島嶼選情首頁" className="shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30">
          <BrandLogo />
        </a>
        <nav className="flex items-center gap-1 text-sm" aria-label="資訊頁導覽">
          <a href="/data-status" className="hidden rounded-md px-3 py-2 text-ink-secondary hover:bg-surface hover:text-ink sm:inline-flex">資料狀態</a>
          <a href="/roadmap" className="hidden rounded-md px-3 py-2 text-ink-secondary hover:bg-surface hover:text-ink sm:inline-flex">完善路線圖</a>
          <a href="/" className="ml-1 rounded-md border border-line bg-surface px-3 py-1.5 font-medium text-ink shadow-card">回到首頁</a>
        </nav>
      </div>
    </header>
  );
}
