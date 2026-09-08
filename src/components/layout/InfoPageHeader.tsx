import BrandLogo from "@/components/layout/BrandLogo";

export default function InfoPageHeader() {
  return (
    <header className="border-b border-white/10 bg-[#0B0C0E] text-white">
      <div className="mx-auto flex h-[72px] max-w-page items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="/" aria-label="島嶼選情首頁" className="shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40">
          <BrandLogo tone="dark" />
        </a>
        <nav className="flex items-center gap-1 text-sm" aria-label="資訊頁導覽">
          <a href="/data-status" className="hidden rounded-md px-3 py-2 text-white/60 hover:bg-white/[0.06] hover:text-white sm:inline-flex">資料狀態</a>
          <a href="/sources" className="hidden rounded-md px-3 py-2 text-white/60 hover:bg-white/[0.06] hover:text-white md:inline-flex">來源台帳</a>
          <a href="/roadmap" className="hidden rounded-md px-3 py-2 text-white/60 hover:bg-white/[0.06] hover:text-white sm:inline-flex">完善路線圖</a>
          <a href="/" className="ml-1 inline-flex min-h-10 items-center rounded-xl border border-white/15 bg-white/[0.06] px-3.5 font-medium text-white hover:bg-white/10">回到首頁</a>
        </nav>
      </div>
    </header>
  );
}
