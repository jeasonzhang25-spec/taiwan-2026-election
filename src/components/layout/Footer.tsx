import { DEMO_DISCLAIMER } from "@/lib/constants";
import BrandLogo from "@/components/layout/BrandLogo";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-page px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <div>
            <a href="/" aria-label="島嶼選情首頁" className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30">
              <BrandLogo markSize={34} />
            </a>
            <nav className="mt-3 flex gap-4" aria-label="頁尾導覽">
              <a href="/data-status" className="text-ink-secondary underline decoration-line-strong underline-offset-4 hover:text-ink">資料狀態</a>
              <a href="/roadmap" className="text-ink-secondary underline decoration-line-strong underline-offset-4 hover:text-ink">完善清單</a>
            </nav>
          </div>
          <div className="max-w-md leading-5">
            <span className="rounded bg-[#FBF8EF] px-1.5 py-0.5 text-[#8A6410]">
              {DEMO_DISCLAIMER}
            </span>
          </div>
        </div>
        <div className="mt-6 border-t border-line pt-4 text-[11px] text-ink-muted">
          2022 結果與選舉時程以中選會資料為準；2026 民調保留原機構、樣本、方法、誤差與來源連結。地圖含金門、連江等離島。
        </div>
      </div>
    </footer>
  );
}
