"use client";

import { useState } from "react";
import { useDashboard } from "@/context/ElectionContext";
import { DISPLAY_MODES, PARTY_LIST } from "@/lib/constants";
import { MAJOR_CITY_POLLS } from "@/lib/data/polling";
import { SOURCE_OPTIONS } from "@/lib/data/sources";
import type { DisplayMode, PartyId } from "@/lib/types";
import { filterPollRecords } from "@/lib/utils/filter";
import { taiwanToday } from "@/lib/utils/format";

function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; disabled?: boolean; hint?: string }[];
  label: string;
}) {
  return (
    <div className="flex flex-col items-start gap-1.5 sm:flex-row sm:items-center">
      <span className="text-[13px] font-medium text-white/55">{label}</span>
      <div
        className="flex items-center rounded-xl border border-white/10 bg-white/[0.04] p-1"
        role="group"
        aria-label={label}
      >
        {options.map((o) => (
          <button
            type="button"
            key={o.value}
            onClick={() => onChange(o.value)}
            aria-pressed={value === o.value}
            disabled={o.disabled}
            title={o.hint}
            className={`min-h-9 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors duration-150 ${
              value === o.value
                ? "bg-brand text-canvas shadow-sm"
                : "text-white/60 hover:bg-white/[0.04] hover:text-white"
            } disabled:cursor-not-allowed disabled:opacity-45`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function CompactSelect({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label: string;
}) {
  return (
    <label className="flex min-w-0 flex-col items-start gap-1.5">
      <span className="text-[13px] font-medium text-white/55">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full min-w-0 rounded-xl border border-white/10 bg-[#17181A] px-3 pr-8 text-sm text-white outline-none transition-colors duration-150 hover:border-white/20 focus:border-[#8584FF] sm:min-w-40"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function HeroFilter() {
  const { filters, setFilters } = useDashboard();
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const today = taiwanToday();
  const includedPolls = filterPollRecords(
    Object.values(MAJOR_CITY_POLLS).flat(),
    filters,
  );
  const latestIncludedDate = includedPolls.reduce(
    (latest, record) => (record.date > latest ? record.date : latest),
    "",
  );
  const hasAdvancedFilters = Boolean(filters.date) || filters.party !== "all" || filters.source !== "all";

  return (
    <section id="overview" className="relative scroll-mt-20 overflow-hidden border-b border-white/10 bg-[#0B0C0E] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_76%_5%,rgba(113,112,255,0.16),transparent_31rem)]" aria-hidden="true" />
      <div className="relative mx-auto max-w-page px-4 pb-10 pt-12 sm:px-6 sm:pb-14 sm:pt-16 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-medium text-[#A9A8FF]">
              <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-white/80">全台 22 縣市</span>
              <span>公開來源 · 持續核驗</span>
            </div>
            <h1 className="max-w-4xl text-[32px] font-semibold leading-[1.15] tracking-[-0.035em] text-white sm:text-[50px] sm:leading-[1.08] lg:text-[56px]">
              2026 台灣九合一選舉<span className="hidden sm:inline"> </span><br className="sm:hidden" />選情總覽
            </h1>
            <p className="mt-5 max-w-2xl text-[15px] leading-7 text-white/60 sm:text-base">
              從全台版圖到單一縣市，追蹤可回到原始來源的民調情境、候選人動態與歷史選舉資料。
            </p>
          </div>
          <a href="#election-map" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-canvas transition-all duration-150 hover:-translate-y-0.5 hover:bg-brand-strong">
            查看全台地圖
            <span className="ml-2" aria-hidden="true">↓</span>
          </a>
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-[#121316]/90 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur sm:p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-white/55">選舉項目</span>
                <span className="rounded-lg bg-white/[0.07] px-3 py-2 font-medium text-white">縣市長</span>
                <span className="hidden text-xs text-white/55 sm:inline">其他層級後續開放</span>
              </div>
              <Segmented<DisplayMode>
                label="地圖顯示"
                value={filters.displayMode}
                onChange={(v) => setFilters({ displayMode: v })}
                options={DISPLAY_MODES.map((m) => ({ value: m.value, label: m.label }))}
              />
            </div>
            <div className="flex items-center gap-2">
              {hasAdvancedFilters && <span className="text-xs font-medium text-[#A9A8FF]">已套用進階條件</span>}
              <button
                type="button"
                onClick={() => setAdvancedOpen((open) => !open)}
                aria-expanded={advancedOpen}
                className="inline-flex min-h-10 items-center rounded-xl border border-white/10 bg-white/[0.04] px-3.5 text-sm font-medium text-white/60 transition-colors hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
              >
                {advancedOpen ? "收起進階篩選" : "更多篩選"}
                <span className={`ml-2 transition-transform ${advancedOpen ? "rotate-180" : ""}`} aria-hidden="true">⌄</span>
              </button>
            </div>
          </div>

          {advancedOpen && (
            <div className="mt-5 grid gap-4 border-t border-white/10 pt-5 md:grid-cols-[1fr_1fr_1.7fr_auto] md:items-end">
              <label className="flex min-w-0 flex-col items-start gap-1.5">
                <span className="text-[13px] font-medium text-white/55">選情快照截至</span>
              <input
                type="date"
                value={filters.date}
                min="2025-01-01"
                max={today}
                onChange={(e) => setFilters({ date: e.target.value })}
                  className="h-10 w-full rounded-xl border border-white/10 bg-[#17181A] px-3 text-sm text-white outline-none transition-colors duration-150 hover:border-white/20 focus:border-[#8584FF]"
              />
            </label>
              <CompactSelect
                label="政黨"
                value={filters.party}
                onChange={(v) => setFilters({ party: v as PartyId | "all" })}
                options={[
                  { value: "all", label: "全部政黨" },
                  ...PARTY_LIST.map((p) => ({ value: p.id, label: p.name })),
                ]}
              />
              <CompactSelect
                label="選情資料來源"
                value={filters.source}
                onChange={(v) => setFilters({ source: v })}
                options={[
                  { value: "all", label: "全部來源" },
                  ...SOURCE_OPTIONS.map((s) => ({ value: s, label: s })),
                ]}
              />
              <button
                type="button"
                onClick={() => setFilters({ date: "", party: "all", source: "all" })}
                disabled={!hasAdvancedFilters}
                className="h-10 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-white/60 hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                清除條件
              </button>
            </div>
          )}

          <div className="mt-4 flex items-start gap-2 rounded-xl border border-white/[0.06] bg-white/[0.035] px-3.5 py-3 text-[13px] leading-5 text-white/55" aria-live="polite">
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#8F8EFF]" aria-hidden="true" />
            <p>
              {filters.date
                ? `正在查看截至 ${filters.date} 的資料快照，納入的最新民調為 ${latestIncludedDate || "無"}。`
                : `目前採用最新資料，已收錄民調的最新日期為 ${latestIncludedDate || "無"}。`}
              日期、政黨與來源會同步更新地圖、統計卡與縣市列表；日期最多可選至今天（{today}）。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
