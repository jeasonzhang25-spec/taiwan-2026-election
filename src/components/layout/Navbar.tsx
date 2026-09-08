"use client";

import { useState } from "react";
import { NAV_ITEMS } from "@/lib/constants";
import BrandLogo from "@/components/layout/BrandLogo";

type DataStatus = "healthy" | "stale" | "blocked";

const STATUS_META: Record<DataStatus, { label: string; dot: string; text: string }> = {
  healthy: { label: "民調核驗", dot: "bg-[#35A86B]", text: "text-white/60" },
  stale: { label: "民調資料已過期", dot: "bg-[#E7B52D]", text: "text-[#F1C46B]" },
  blocked: { label: "民調資料待修復", dot: "bg-[#FF6B66]", text: "text-[#FF8A84]" },
};

function focusCountySearch() {
  const el = document.getElementById("counties");
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(() => {
    (document.getElementById("county-search") as HTMLInputElement | null)?.focus();
  }, 350);
}

export default function Navbar({ dataStatus, checkedAt }: { dataStatus: DataStatus; checkedAt: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const status = STATUS_META[dataStatus];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0B0C0E]/95 text-white backdrop-blur-xl">
      <a
        href="#main-content"
        className="sr-only absolute left-3 top-3 z-50 rounded-md bg-brand px-3 py-2 text-sm text-canvas focus:not-sr-only"
      >
        跳至主要內容
      </a>
      <div className="mx-auto flex h-[72px] max-w-page items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* 左側品牌 */}
        <a href="/" aria-label="島嶼選情首頁" className="min-w-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40">
          <BrandLogo tone="dark" />
        </a>

        {/* 中央導航（桌面） */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="主要導覽">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`/#${item.id}`}
              className="rounded-md px-3 py-1.5 text-[13px] text-white/60 transition-colors duration-150 hover:bg-white/[0.06] hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* 右側狀態與操作 */}
        <div className="flex items-center gap-2">
          <a href="/data-status" className={`hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs transition-colors hover:border-white/20 hover:text-white sm:flex ${status.text}`} aria-label={`查看資料狀態，${status.label}，最近核驗 ${checkedAt}`}>
            <span className={`h-2 w-2 rounded-full ${status.dot}`} aria-hidden="true" />
            <span className="whitespace-nowrap">{status.label} {checkedAt}</span>
          </a>

          <button
            onClick={focusCountySearch}
            aria-label="搜尋縣市"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/60 transition-colors duration-150 hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
              <path d="m20 20-3.2-3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>

          {/* 手機選單按鈕 */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="選單"
            aria-expanded={menuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/70 lg:hidden"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* 手機選單 */}
      {menuOpen && (
        <nav className="border-t border-white/10 bg-[#0B0C0E] px-4 py-2 lg:hidden" aria-label="手機導覽">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`/#${item.id}`}
              onClick={() => setMenuOpen(false)}
              className="block min-h-11 rounded-md px-3 py-3 text-sm text-white/65 hover:bg-white/[0.06] hover:text-white"
            >
              {item.label}
            </a>
          ))}
          <div className="my-2 border-t border-white/10" />
          <a href="/data-status" onClick={() => setMenuOpen(false)} className="block rounded-md px-3 py-2.5 text-sm text-white/65 hover:bg-white/[0.06] hover:text-white">資料狀態</a>
          <a href="/sources" onClick={() => setMenuOpen(false)} className="block rounded-md px-3 py-2.5 text-sm text-white/65 hover:bg-white/[0.06] hover:text-white">來源台帳</a>
          <a href="/roadmap" onClick={() => setMenuOpen(false)} className="block rounded-md px-3 py-2.5 text-sm text-white/65 hover:bg-white/[0.06] hover:text-white">完善清單</a>
        </nav>
      )}
    </header>
  );
}
