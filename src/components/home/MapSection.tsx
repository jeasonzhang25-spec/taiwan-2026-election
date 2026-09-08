"use client";

import dynamic from "next/dynamic";
import { useDashboard } from "@/context/ElectionContext";
import { COUNTIES } from "@/lib/data/counties";
import { buildCountySnapshots, filterCountySnapshots } from "@/lib/utils/filter";
import MapLegend from "@/components/ui/MapLegend";
import KeyDistricts from "./KeyDistricts";
import { EmptyState } from "@/components/ui/EmptyState";
import { partyShort } from "@/lib/constants";

const TaiwanMap = dynamic(() => import("@/components/map/TaiwanMap"), {
  ssr: false,
  loading: () => <div role="status" className="h-full min-h-[360px] animate-pulse rounded-xl bg-[#1B1E23]" aria-label="地圖載入中" />,
});

export default function MapSection() {
  const { filters, countyId, openCounty } = useDashboard();
  const snapshots = buildCountySnapshots(COUNTIES, filters);
  const filtered = filterCountySnapshots(snapshots, filters);

  return (
    <section id="election-map" className="mx-auto max-w-page scroll-mt-24 px-4 pt-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* 左側：地圖（2/3） */}
        <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5 lg:col-span-2">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">台灣選情地圖</h2>
            {filtered.length > 0 && (
              <label className="flex items-center gap-1.5 text-xs text-ink-muted">
                <span>選擇縣市</span>
                <select
                  id="county-picker"
                  value={countyId && filtered.some((county) => county.id === countyId) ? countyId : ""}
                  onChange={(event) => {
                    if (event.target.value) openCounty(event.target.value);
                  }}
                  className="h-10 rounded-xl border border-line bg-surface px-3 text-sm text-ink outline-none hover:border-line-strong focus:border-brand"
                >
                  <option value="">查看詳情…</option>
                  {filtered.map((county) => (
                    <option key={county.id} value={county.id}>{county.name}</option>
                  ))}
                </select>
              </label>
            )}
          </div>

          {filtered.length > 0 ? (
            <div className="h-[400px] w-full sm:h-[480px]">
              <TaiwanMap
                all={snapshots}
                filtered={filtered}
                mode={filters.displayMode}
                selectedId={countyId}
                onSelect={openCounty}
              />
            </div>
          ) : (
            <EmptyState
              title="無符合條件的縣市"
              description="請調整篩選條件，或清除政黨／來源／日期限制。"
            />
          )}

          <div className="mt-3 border-t border-line pt-3">
            <MapLegend mode={filters.displayMode} />
          </div>
          <details className="mt-3 rounded-lg border border-line bg-canvas text-xs">
            <summary className="cursor-pointer px-3 py-2 font-medium text-ink-secondary">查看地圖文字摘要（{filtered.length} 縣市）</summary>
            <div className="grid gap-px border-t border-line bg-line sm:grid-cols-2">
              {filtered.map((county) => {
                const leader = county.candidates.find((candidate) => candidate.id === county.leadingId);
                return <div key={county.id} className="flex items-center justify-between gap-3 bg-canvas px-3 py-2"><a href={`/county/${county.id}`} className="font-medium text-ink hover:underline">{county.name}</a><span className="text-right text-ink-secondary">{county.dataStatus === "insufficient" ? "尚無民調" : `${leader?.name ?? "—"}（${leader ? partyShort(leader.partyId) : "—"}）領先 ${county.margin.toFixed(1)} 點`}</span></div>;
              })}
            </div>
          </details>
        </div>

        {/* 右側：本週關鍵選區（1/3） */}
        <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight text-ink">快照關鍵選區</h2>
          </div>
          <KeyDistricts counties={filtered} />
        </div>
      </div>
    </section>
  );
}
