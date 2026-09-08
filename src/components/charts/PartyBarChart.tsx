"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import EChart from "./EChart";
import { PARTIES } from "@/lib/constants";
import type { PartyId } from "@/lib/types";

interface PartyBarChartProps {
  data: { party: PartyId; count: number }[];
  height?: number;
}

/** 各黨領先縣市數量（橫向長條圖，非圓餅圖） */
export default function PartyBarChart({ data, height = 240 }: PartyBarChartProps) {
  const sortedData = useMemo(() => [...data].sort((a, b) => b.count - a.count), [data]);
  const option = useMemo<EChartsOption>(() => {
    return {
      aria: { enabled: true, decal: { show: true } },
      animationDuration: 200,
      grid: { left: 8, right: 28, top: 8, bottom: 4, containLabel: true },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: "#16181C",
        borderColor: "#343841",
        borderWidth: 1,
        textStyle: { color: "#F4F5F7", fontSize: 12 },
        formatter: (params: any) => {
          const p = Array.isArray(params) ? params[0] : params;
          return `${p.name}：<b>${p.value}</b> 個縣市`;
        },
      },
      xAxis: {
        type: "value",
        minInterval: 1,
        axisLabel: { fontSize: 10, color: "#8D929B" },
        splitLine: { lineStyle: { color: "#24272D" } },
      },
      yAxis: {
        type: "category",
        inverse: true,
        data: sortedData.map((d) => PARTIES[d.party].name),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { fontSize: 11, color: "#B1B5BD" },
      },
      series: [
        {
          type: "bar",
          data: sortedData.map((d) => ({
            value: d.count,
            itemStyle: { color: PARTIES[d.party].color, borderRadius: [0, 4, 4, 0] },
          })),
          barWidth: 18,
          label: {
            show: true,
            position: "right",
            fontSize: 11,
            color: "#B1B5BD",
            fontFamily: "ui-monospace, monospace",
          },
        },
      ],
    };
  }, [sortedData]);

  return (
    <div>
      <EChart option={option} className="w-full" style={{ height }} ariaLabel="各政黨領先縣市數量橫向長條圖" />
      <details className="mt-2 rounded-lg border border-line bg-canvas text-xs">
        <summary className="cursor-pointer px-3 py-2 font-medium text-ink-secondary">查看圖表文字資料</summary>
        <ul className="divide-y divide-line border-t border-line">
          {sortedData.map((item) => <li key={item.party} className="flex justify-between gap-4 px-3 py-2"><span>{PARTIES[item.party].name}</span><span className="num font-semibold">{item.count} 個縣市</span></li>)}
        </ul>
      </details>
    </div>
  );
}
