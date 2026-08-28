"use client";

import * as echarts from "echarts";
import { useEffect, useMemo, useState } from "react";
import EChart from "@/components/charts/EChart";
import { loadTaiwanGeoJson, buildNameToId } from "@/lib/geojson";
import { getLeadingParty } from "@/lib/utils/filter";
import { partyColor } from "@/lib/constants";
import type { CountyRace, DisplayMode } from "@/lib/types";
import { Skeleton } from "@/components/ui/Skeleton";

// ---- 顯示模式配色 ----

/** 競爭程度配色（紫色系，避開政黨色，色盲可辨） */
const COMPETITIVE_COLOR: Record<string, string> = {
  "stable-lead": "#E6E0F3",
  "slim-lead": "#C3B4E4",
  tossup: "#9B7BD1",
  "likely-flip": "#6A3FA8",
  insufficient: "#E6E4DE",
};

/** 民調變化配色（紫/橙發散，避開政黨色） */
function pollChangeColor(change: number): string {
  if (change > 0.1) return "#7C5CD6"; // 領先擴大
  if (change < -0.1) return "#E07A3F"; // 差距縮小
  return "#DBD8D0"; // 維持
}

const NO_DATA_COLOR = "#EDEBE5";
const TOSSUP_COLOR = "#DBD8D0";

function colorFor(county: CountyRace, mode: DisplayMode): string {
  if (county.dataStatus === "insufficient") return NO_DATA_COLOR;
  if (mode === "leading-party") {
    if (county.competitiveness === "tossup") return TOSSUP_COLOR;
    return partyColor(getLeadingParty(county));
  }
  if (mode === "competitiveness") {
    return COMPETITIVE_COLOR[county.competitiveness] ?? NO_DATA_COLOR;
  }
  // poll-change
  return pollChangeColor(county.change);
}

interface TaiwanMapProps {
  all: CountyRace[];
  filtered: CountyRace[];
  mode: DisplayMode;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function TaiwanMap({
  all,
  filtered,
  mode,
  selectedId,
  onSelect,
}: TaiwanMapProps) {
  const [geoLoaded, setGeoLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadTaiwanGeoJson()
      .then((gj) => {
        if (cancelled) return;
        echarts.registerMap("taiwan", gj);
        setGeoLoaded(true);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? "地圖資料載入失敗");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const nameToId = useMemo(() => buildNameToId(all), [all]);
  const filteredIds = useMemo(() => new Set(filtered.map((c) => c.id)), [filtered]);
  const byId = useMemo(
    () => Object.fromEntries(all.map((c) => [c.id, c])),
    [all],
  );

  const option = useMemo<echarts.EChartsOption>(() => {
    const data = all.map((c) => {
      const isFiltered = filteredIds.has(c.id);
      const color = isFiltered ? colorFor(c, mode) : NO_DATA_COLOR;
      const isSelected = c.id === selectedId;
      return {
        name: c.name,
        value: isFiltered ? c.margin : undefined,
        itemStyle: {
          areaColor: color,
          borderColor: isSelected ? "#111827" : "#FFFFFF",
          borderWidth: isSelected ? 2.5 : 1,
          opacity: isFiltered ? 1 : 0.45,
        },
        emphasis: {
          itemStyle: {
            areaColor: isFiltered ? color : NO_DATA_COLOR,
            opacity: 1,
          },
          label: { show: true, color: "#111827", fontWeight: 600 },
        },
      };
    });

    return {
      tooltip: {
        trigger: "item",
        backgroundColor: "#FFFFFF",
        borderColor: "#E7E4DC",
        borderWidth: 1,
        padding: [10, 12],
        textStyle: { color: "#1A1A1A", fontSize: 12 },
        extraCssText: "box-shadow: 0 6px 20px rgba(26,26,26,0.10); border-radius: 8px;",
        formatter: (params: any) => {
          const county = byId[nameToId[params.name]];
          if (!county) return params.name;
          const isFiltered = filteredIds.has(county.id);
          if (!isFiltered) {
            return `<div style="font-weight:600">${county.name}</div><div style="color:#8A8F99;font-size:11px">當前篩選下無資料</div>`;
          }
          if (county.dataStatus === "insufficient") {
            return `<div style="font-weight:600;margin-bottom:4px">${county.name}</div><div style="color:#5F6470;font-size:11px">目前沒有已核驗的 2026 公開民調</div>`;
          }
          const leader = county.candidates.find((c) => c.id === county.leadingId);
          const leaderParty = leader ? partyColor(leader.partyId) : "#888";
          const leaderName = leader?.name ?? "—";
          const leaderValue = county.latestSupport[county.leadingId] ?? 0;
          return `
            <div style="font-weight:600;margin-bottom:4px">${county.name}</div>
            <div style="font-size:11px;color:#5F6470">領先：${leaderName}</div>
            <div style="font-size:11px;margin-top:2px">
              <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${leaderParty};margin-right:4px"></span>
              支持度 <b style="font-family:monospace">${leaderValue.toFixed(1)}%</b>
            </div>
            <div style="font-size:11px;color:#5F6470;margin-top:2px">領先差距 ${county.margin.toFixed(1)} 個百分點</div>
          `;
        },
      },
      series: [
        {
          type: "map",
          map: "taiwan",
          roam: false,
          aspectScale: 1,
          layoutCenter: ["50%", "50%"],
          layoutSize: "100%",
          selectedMode: false,
          label: {
            show: true,
            color: "#4B5563",
            fontSize: 9,
            formatter: (p: any) => {
              const c = byId[nameToId[p.name]];
              return c ? c.name.replace(/[縣市]$/, "") : p.name;
            },
          },
          data,
        },
      ],
    };
  }, [all, filteredIds, mode, selectedId, byId, nameToId]);

  if (error) {
    return (
      <div className="flex h-full min-h-[360px] items-center justify-center rounded-xl border border-dashed border-line-strong text-sm text-ink-secondary">
        地圖資料載入失敗，請重新整理。
      </div>
    );
  }

  if (!geoLoaded) {
    return <Skeleton className="h-full min-h-[360px] w-full" />;
  }

  return (
    <EChart
      option={option}
      className="h-full w-full"
      style={{ minHeight: 360 }}
      ariaLabel="台灣 22 縣市選情地圖，可點擊縣市查看詳情"
      onEvents={{
        click: (params: any) => {
          const id = nameToId[params.name];
          if (id) onSelect(id);
        },
      }}
    />
  );
}
