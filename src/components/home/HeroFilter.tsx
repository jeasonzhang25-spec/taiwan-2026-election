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
      <span className="text-[13px] font-medium text-ink-secondary">{label}</span>
      <div
        className="flex items-center rounded-xl border border-line bg-canvas p-1"
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
                ? "bg-brand text-white shadow-sm"
                : "text-ink-secondary hover:text-ink"
            } disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:text-ink-secondary`}
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
      <span className="text-[13px] font-medium text-ink-secondary">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full min-w-0 rounded-xl border border-line bg-surface px-3 pr-8 text-sm text-ink outline-none transition-colors duration-150 hover:border-line-strong focus:border-brand sm:min-w-40"
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
    <section id="overview" className="scroll-mt-20 border-b border-line bg-[#EEF3F3]">
      <div className="mx-auto max-w-page px-4 pb-8 pt-9 sm:px-6 sm:pb-10 sm:pt-12 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-medium text-brand">
              <span className="rounded-full border border-brand/15 bg-white/75 px-2.5 py-1">全台 22 縣市</span>
              <span>公開來源 · 持續核驗</span>
            </div>
            <h1 className="text-[28px] font-semibold leading-[1.2] tracking-[-0.025em] text-ink sm:text-[40px] sm:leading-[1.15]">
              2026 台灣九合一選舉<span className="hidden sm:inline"> </span><br className="sm:hidden" />選情總覽
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-ink-secondary sm:text-base">
              從全台版圖到單一縣市，追蹤可回到原始來源的民調情境、候選人動態與歷史選舉資料。
            </p>
          </div>
          <a href="#election-map" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-strong">
            查看全台地圖
            <span className="ml-2" aria-hidden="true">↓</span>
          </a>
        </div>

        <div className="mt-8 rounded-2xl border border-white/90 bg-white/90 p-4 shadow-card sm:p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-ink-muted">選舉項目</span>
                <span className="rounded-lg bg-brand-soft px-3 py-2 font-medium text-brand">縣市長</span>
                <span className="hidden text-xs text-ink-muted sm:inline">其他層級後續開放</span>
              </div>
              <Segmented<DisplayMode>
                label="地圖顯示"
                value={filters.displayMode}
                onChange={(v) => setFilters({ displayMode: v })}
                options={DISPLAY_MODES.map((m) => ({ value: m.value, label: m.label }))}
              />
            </div>
            <div className="flex items-center gap-2">
              {hasAdvancedFilters && <span className="text-xs font-medium text-brand">已套用進階條件</span>}
              <button
                type="button"
                onClick={() => setAdvancedOpen((open) => !open)}
                aria-expanded={advancedOpen}
                className="inline-flex min-h-10 items-center rounded-xl border border-line bg-surface px-3.5 text-sm font-medium text-ink-secondary transition-colors hover:border-line-strong hover:text-ink"
              >
                {advancedOpen ? "收起進階篩選" : "更多篩選"}
                <span className={`ml-2 transition-transform ${advancedOpen ? "rotate-180" : ""}`} aria-hidden="true">⌄</span>
              </button>
            </div>
          </div>

          {advancedOpen && (
            <div className="mt-5 grid gap-4 border-t border-line pt-5 md:grid-cols-[1fr_1fr_1.7fr_auto] md:items-end">
              <label className="flex min-w-0 flex-col items-start gap-1.5">
                <span className="text-[13px] font-medium text-ink-secondary">選情快照截至</span>
              <input
                type="date"
                value={filters.date}
                min="2025-01-01"
                max={today}
                onChange={(e) => setFilters({ date: e.target.value })}
                  className="h-10 w-full rounded-xl border border-line bg-surface px-3 text-sm text-ink outline-none transition-colors duration-150 hover:border-line-strong focus:border-brand"
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
                className="h-10 rounded-xl border border-line bg-canvas px-4 text-sm font-medium text-ink-secondary hover:border-line-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                清除條件
              </button>
            </div>
          )}

          <div className="mt-4 flex items-start gap-2 rounded-xl bg-brand-mist px-3.5 py-3 text-[13px] leading-5 text-ink-secondary" aria-live="polite">
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand" aria-hidden="true" />
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
