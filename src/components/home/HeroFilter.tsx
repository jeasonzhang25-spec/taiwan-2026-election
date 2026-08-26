"use client";

import { useDashboard } from "@/context/ElectionContext";
import { ELECTION_TYPES, DISPLAY_MODES, PARTY_LIST, LAST_UPDATED } from "@/lib/constants";
import { SOURCE_OPTIONS } from "@/lib/data/sources";
import type { DisplayMode, ElectionType, PartyId } from "@/lib/types";

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
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-ink-muted">{label}</span>
      <div
        className="flex items-center rounded-lg border border-line bg-surface p-0.5"
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
            className={`rounded-md px-2.5 py-1 text-xs transition-colors duration-150 ${
              value === o.value
                ? "bg-ink text-white"
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
    <label className="flex items-center gap-1.5">
      <span className="text-xs text-ink-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 rounded-lg border border-line bg-surface px-2 pr-6 text-xs text-ink outline-none transition-colors duration-150 hover:border-line-strong focus:border-ink"
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

  return (
    <section id="overview" className="scroll-mt-20 border-b border-line bg-canvas">
      <div className="mx-auto max-w-page px-4 pb-5 pt-8 sm:px-6 lg:px-8">
        <div className="mb-5 max-w-2xl">
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">
            2026 台灣九合一選舉選情總覽
          </h1>
          <p className="mt-2 text-sm leading-6 text-ink-secondary">
            匯總公開民調、候選人動態與歷史選舉數據，觀察 22 個縣市的競爭態勢。
          </p>
        </div>

        {/* 篩選器 */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <Segmented<ElectionType>
            label="選舉類型"
            value={filters.electionType}
            onChange={(v) => setFilters({ electionType: v })}
            options={ELECTION_TYPES.map((option) => ({
              ...option,
              disabled: option.value !== "mayor",
              hint: option.value === "mayor" ? undefined : "此原型尚未接入這個層級的資料",
            }))}
          />

          <label className="flex items-center gap-1.5">
            <span className="text-xs text-ink-muted">逐筆民調截至</span>
            <input
              type="date"
              value={filters.date}
              min="2026-07-06"
              max={LAST_UPDATED.slice(0, 10)}
              onChange={(e) => setFilters({ date: e.target.value })}
              className="h-8 rounded-lg border border-line bg-surface px-2 text-xs text-ink outline-none transition-colors duration-150 hover:border-line-strong focus:border-ink"
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
            label="逐筆民調來源"
            value={filters.source}
            onChange={(v) => setFilters({ source: v })}
            options={[
              { value: "all", label: "全部來源" },
              ...SOURCE_OPTIONS.map((s) => ({ value: s, label: s })),
            ]}
          />

          <Segmented<DisplayMode>
            label="顯示模式"
            value={filters.displayMode}
            onChange={(v) => setFilters({ displayMode: v })}
            options={DISPLAY_MODES.map((m) => ({ value: m.value, label: m.label }))}
          />
        </div>
        <p className="mt-2 text-[11px] leading-4 text-ink-muted">
          目前僅提供縣市長資料；來源與截至日期只影響已收錄逐筆民調數量、六都趨勢與詳情，地圖摘要維持最新版本。
        </p>
      </div>
    </section>
  );
}
