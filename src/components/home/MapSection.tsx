"use client";

import { useDashboard } from "@/context/ElectionContext";
import { COUNTIES } from "@/lib/data/counties";
import { filterCounties } from "@/lib/utils/filter";
import TaiwanMap from "@/components/map/TaiwanMap";
import MapLegend from "@/components/ui/MapLegend";
import KeyDistricts from "./KeyDistricts";
import { EmptyState } from "@/components/ui/EmptyState";

export default function MapSection() {
  const { filters, countyId, openCounty } = useDashboard();
  const filtered = filterCounties(COUNTIES, filters);

  return (
    <section className="mx-auto max-w-page px-4 pt-6 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* 左側：地圖（2/3） */}
        <div className="rounded-xl border border-line bg-surface p-4 shadow-card lg:col-span-2">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-ink">台灣選情地圖</h2>
            {filtered.length > 0 && (
              <label className="flex items-center gap-1.5 text-xs text-ink-muted">
                <span>選擇縣市</span>
                <select
                  id="county-picker"
                  value={countyId && filtered.some((county) => county.id === countyId) ? countyId : ""}
                  onChange={(event) => {
                    if (event.target.value) openCounty(event.target.value);
                  }}
                  className="h-8 rounded-lg border border-line bg-surface px-2 text-xs text-ink outline-none hover:border-line-strong focus:border-ink"
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
            <div className="h-[360px] w-full sm:h-[440px]">
              <TaiwanMap
                all={COUNTIES}
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
        </div>

        {/* 右側：本週關鍵選區（1/3） */}
        <div className="rounded-xl border border-line bg-surface p-4 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">本週關鍵選區</h2>
          </div>
          <KeyDistricts counties={filtered} />
        </div>
      </div>
    </section>
  );
}
