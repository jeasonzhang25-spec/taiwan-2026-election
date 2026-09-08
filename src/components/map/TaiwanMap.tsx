"use client";

import * as echarts from "echarts/core";
import type { EChartsCoreOption } from "echarts/core";
import { useEffect, useMemo, useState } from "react";
import EChart from "@/components/charts/EChart";
import { loadTaiwanGeoJson, buildNameToId } from "@/lib/geojson";
import { getLeadingParty } from "@/lib/utils/filter";
import { partyColor } from "@/lib/constants";
import type { CountyRace, DisplayMode } from "@/lib/types";
import { Skeleton } from "@/components/ui/Skeleton";

// ---- 顯示模式配色 ----

/** 競爭程度配色（中性明度階，避免與政黨色及互動紫混淆） */
const COMPETITIVE_COLOR: Record<string, string> = {
  "stable-lead": "#31353B",
  "slim-lead": "#4A5059",
  tossup: "#666D78",
  "likely-flip": "#949BA6",
  insufficient: "#25282E",
};

/** 民調變化配色（蓝灰/橙发散；只在此模式使用） */
function pollChangeColor(change: number): string {
  if (change > 0.1) return "#7A9FC8"; // 領先擴大
  if (change < -0.1) return "#D7794C"; // 差距縮小
  return "#666D78"; // 維持
}

const NO_DATA_COLOR = "#25282E";
const TOSSUP_COLOR = "#737983";
const COMPACT_LABEL_COUNTIES = new Set([
  "keelung",
  "hsinchu-city",
  "chiayi-city",
  "penghu",
  "kinmen",
  "lienchiang",
]);

const INSET_IDS = new Set(["penghu", "kinmen", "lienchiang"]);
const MAP_LAYOUTS = [
  { map: "taiwan-main", ids: null, center: ["61%", "51%"], size: "94%" },
  { map: "taiwan-lienchiang", ids: new Set(["lienchiang"]), center: ["15%", "18%"], size: "20%" },
  { map: "taiwan-penghu", ids: new Set(["penghu"]), center: ["15%", "50%"], size: "20%" },
  { map: "taiwan-kinmen", ids: new Set(["kinmen"]), center: ["15%", "80%"], size: "20%" },
] as const;

function countyLabel(county: CountyRace): string {
  return county.name.replace(/[縣市]$/, "");
}

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
  const [geoRegionCount, setGeoRegionCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const nameToId = useMemo(() => buildNameToId(all), [all]);

  useEffect(() => {
    let cancelled = false;
    loadTaiwanGeoJson()
      .then((gj) => {
        if (cancelled) return;
        const collection = gj as { type: "FeatureCollection"; features: Array<{ properties?: { name?: string } }> };
        const featureCollection = (names: Set<string> | null) => ({
          ...collection,
          features: collection.features.filter((feature) => {
            const id = nameToId[feature.properties?.name ?? ""];
            return names ? names.has(id) : !INSET_IDS.has(id);
          }),
        });
        echarts.registerMap("taiwan-main", featureCollection(null) as any);
        for (const layout of MAP_LAYOUTS.slice(1)) {
          echarts.registerMap(layout.map, featureCollection(layout.ids) as any);
        }
        setGeoRegionCount(collection.features.length);
        setGeoLoaded(true);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? "地圖資料載入失敗");
      });
    return () => {
      cancelled = true;
    };
  }, [nameToId]);

  const filteredIds = useMemo(() => new Set(filtered.map((c) => c.id)), [filtered]);
  const byId = useMemo(
    () => Object.fromEntries(all.map((c) => [c.id, c])),
    [all],
  );

  const option = useMemo<EChartsCoreOption>(() => {
    const data = all.map((c) => {
      const isFiltered = filteredIds.has(c.id);
      const color = isFiltered ? colorFor(c, mode) : NO_DATA_COLOR;
      const isSelected = c.id === selectedId;
      const fontSize = COMPACT_LABEL_COUNTIES.has(c.id) ? 7 : 8;
      return {
        name: c.name,
        value: isFiltered ? c.margin : undefined,
        label: {
          // 詳情抽屜已顯示縣市名；隱藏選中區標籤，讓版圖輪廓完整露出。
          show: !isSelected,
          formatter: countyLabel(c),
          color: "#F4F5F7",
          fontSize,
          fontWeight: 500,
          textBorderColor: "rgba(11,12,14,0.88)",
          textBorderWidth: 2,
        },
        itemStyle: {
          areaColor: color,
          borderColor: isSelected ? "#F4F5F7" : "#0B0C0E",
          borderWidth: isSelected ? 2.5 : 1,
          opacity: isFiltered ? 1 : 0.45,
        },
        emphasis: {
          itemStyle: {
            areaColor: isFiltered ? color : NO_DATA_COLOR,
            opacity: 1,
          },
          label: {
            show: !isSelected,
            color: "#FFFFFF",
            fontSize,
            fontWeight: 600,
            textBorderColor: "rgba(11,12,14,0.94)",
            textBorderWidth: 2,
          },
        },
      };
    });

    return {
      aria: { enabled: true, decal: { show: true } },
      tooltip: {
        trigger: "item",
        backgroundColor: "#16181C",
        borderColor: "#343841",
        borderWidth: 1,
        padding: [10, 12],
        textStyle: { color: "#F4F5F7", fontSize: 12 },
        extraCssText: "box-shadow: 0 10px 30px rgba(0,0,0,0.36); border-radius: 8px;",
        formatter: (params: any) => {
          const county = byId[nameToId[params.name]];
          if (!county) return params.name;
          const isFiltered = filteredIds.has(county.id);
          if (!isFiltered) {
            return `<div style="font-weight:600">${county.name}</div><div style="color:#8D929B;font-size:11px">當前篩選下無資料</div>`;
          }
          if (county.dataStatus === "insufficient") {
            return `<div style="font-weight:600;margin-bottom:4px">${county.name}</div><div style="color:#B1B5BD;font-size:11px">目前沒有已核驗的 2026 公開民調</div>`;
          }
          const leader = county.candidates.find((c) => c.id === county.leadingId);
          const leaderParty = leader ? partyColor(leader.partyId) : "#888";
          const leaderName = leader?.name ?? "—";
          const leaderValue = county.latestSupport[county.leadingId] ?? 0;
          return `
            <div style="font-weight:600;margin-bottom:4px">${county.name}</div>
            <div style="font-size:11px;color:#B1B5BD">領先：${leaderName}</div>
            <div style="font-size:11px;margin-top:2px">
              <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${leaderParty};margin-right:4px"></span>
              支持度 <b style="font-family:monospace">${leaderValue.toFixed(1)}%</b>
            </div>
            <div style="font-size:11px;color:#B1B5BD;margin-top:2px">領先差距 ${county.margin.toFixed(1)} 個百分點</div>
          `;
        },
      },
      series: MAP_LAYOUTS.map((layout) => ({
          type: "map",
          name: layout.map,
          map: layout.map,
          roam: false,
          aspectScale: 1,
          layoutCenter: layout.center,
          layoutSize: layout.size,
          selectedMode: false,
          label: {
            show: false,
          },
          data: data
            .filter((item) => {
              const id = nameToId[item.name];
              return layout.ids ? layout.ids.has(id) : !INSET_IDS.has(id);
            })
            .map((item) => layout.ids ? {
              ...item,
              label: { ...item.label, fontSize: 10, fontWeight: 600, textBorderWidth: 3 },
              emphasis: {
                ...item.emphasis,
                label: { ...item.emphasis.label, fontSize: 10, textBorderWidth: 3 },
              },
            } : item),
        })),
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
    <div className="h-full w-full" data-map-region-count={all.length} data-map-feature-count={geoRegionCount} data-map-series-count={MAP_LAYOUTS.length}>
      <EChart
        option={option}
        className="h-full w-full"
        style={{ minHeight: 360 }}
        ariaLabel="台灣 22 縣市選情地圖，包含台灣本島、澎湖、金門與連江，可點擊縣市查看詳情"
        onEvents={{
          click: (params: any) => {
            const id = nameToId[params.name];
            if (id) onSelect(id);
          },
        }}
      />
    </div>
  );
}
