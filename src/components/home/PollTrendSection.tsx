"use client";

import { useState } from "react";
import { useDashboard } from "@/context/ElectionContext";
import { MAJOR_CITY_IDS, MAJOR_CITY_POLLS, buildSeries } from "@/lib/data/polling";
import { COUNTY_MAP } from "@/lib/data/counties";
import { filterPollRecords } from "@/lib/utils/filter";
import PollTrendChart from "@/components/charts/PollTrendChart";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { EmptyState } from "@/components/ui/EmptyState";

const MAX_SELECTED = 3;

export default function PollTrendSection() {
  const { filters } = useDashboard();
  const [selected, setSelected] = useState<string[]>([
    "taipei",
    "newtaipei",
    "kaohsiung",
  ]);

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_SELECTED) return [...prev.slice(1), id];
      return [...prev, id];
    });
  }

  return (
    <section id="trend" className="mx-auto max-w-page scroll-mt-20 px-4 pt-10 sm:px-6 lg:px-8">
      <SectionTitle
        title="公開民調完整資料庫"
        subtitle="逐題保留已公開數字與來源連結；黨內參、初選民調另作標記，不補點、不平滑，也不把不同題目硬做平均。"
      />

      {/* 縣市切換標籤 */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {MAJOR_CITY_IDS.map((id) => {
          const county = COUNTY_MAP[id];
          const active = selected.includes(id);
          return (
            <button
              key={id}
              onClick={() => toggle(id)}
              aria-pressed={active}
              className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors duration-150 ${
                active
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-surface text-ink-secondary hover:border-line-strong hover:text-ink"
              }`}
            >
              {county?.name ?? id}
            </button>
          );
        })}
        <span className="ml-1 text-[11px] text-ink-muted">最多同時顯示 {MAX_SELECTED} 個縣市</span>
      </div>

      {/* 圖表網格 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {selected.map((id) => {
          const county = COUNTY_MAP[id];
          if (!county) return null;
          const records = filterPollRecords(MAJOR_CITY_POLLS[id] ?? [], filters);
          const trend = buildSeries(id, records);
          return (
            <div key={id} className="rounded-xl border border-line bg-surface p-4 shadow-card">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink">{county.name}</h3>
              </div>
              {trend.series.length > 0 ? (
                <PollTrendChart trend={trend} candidates={county.candidates} height={260} />
              ) : (
                <EmptyState
                  title="此條件下無逐筆民調"
                  description="請調整來源或截至日期。"
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
