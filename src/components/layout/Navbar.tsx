"use client";

import { useState } from "react";
import { NAV_ITEMS, LAST_UPDATED } from "@/lib/constants";
import BrandLogo from "@/components/layout/BrandLogo";

function focusCountySearch() {
  const el = document.getElementById("counties");
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(() => {
    (document.getElementById("county-search") as HTMLInputElement | null)?.focus();
  }, 350);
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/90 backdrop-blur">
      <a
        href="#main-content"
        className="sr-only absolute left-3 top-3 z-50 rounded-md bg-ink px-3 py-2 text-sm text-white focus:not-sr-only"
      >
        跳至主要內容
      </a>
      <div className="mx-auto flex h-14 max-w-page items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* 左側品牌 */}
        <a href="/" aria-label="島嶼選情首頁" className="min-w-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30">
          <BrandLogo />
        </a>

        {/* 中央導航（桌面） */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="主要導覽">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`/#${item.id}`}
              className="rounded-md px-3 py-1.5 text-[13px] text-ink-secondary transition-colors duration-150 hover:bg-surface hover:text-ink"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* 右側狀態與操作 */}
        <div className="flex items-center gap-2">
          <a href="/data-status" className="hidden items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-ink-secondary transition-colors hover:border-line-strong hover:text-ink sm:flex" aria-label={`查看資料狀態，更新 ${LAST_UPDATED}`}>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#178A56] opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#178A56]" />
            </span>
            <span className="whitespace-nowrap">更新 {LAST_UPDATED}</span>
          </a>

          <button
            onClick={focusCountySearch}
            aria-label="搜尋縣市"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface text-ink-secondary transition-colors duration-150 hover:text-ink"
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
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface text-ink-secondary lg:hidden"
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
        <nav className="border-t border-line bg-canvas px-4 py-2 lg:hidden" aria-label="手機導覽">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`/#${item.id}`}
              onClick={() => setMenuOpen(false)}
              className="block rounded-md px-3 py-2.5 text-sm text-ink-secondary hover:bg-surface hover:text-ink"
            >
              {item.label}
            </a>
          ))}
          <div className="my-2 border-t border-line" />
          <a href="/data-status" onClick={() => setMenuOpen(false)} className="block rounded-md px-3 py-2.5 text-sm text-ink-secondary hover:bg-surface hover:text-ink">資料狀態</a>
          <a href="/roadmap" onClick={() => setMenuOpen(false)} className="block rounded-md px-3 py-2.5 text-sm text-ink-secondary hover:bg-surface hover:text-ink">完善清單</a>
        </nav>
      )}
    </header>
  );
}
