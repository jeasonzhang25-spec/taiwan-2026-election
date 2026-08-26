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
  const option = useMemo<EChartsOption>(() => {
    const sorted = [...data].sort((a, b) => b.count - a.count);
    return {
      animationDuration: 200,
      grid: { left: 8, right: 28, top: 8, bottom: 4, containLabel: true },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: "#FFFFFF",
        borderColor: "#E7E4DC",
        borderWidth: 1,
        textStyle: { color: "#1A1A1A", fontSize: 12 },
        formatter: (params: any) => {
          const p = Array.isArray(params) ? params[0] : params;
          return `${p.name}：<b>${p.value}</b> 個縣市`;
        },
      },
      xAxis: {
        type: "value",
        minInterval: 1,
        axisLabel: { fontSize: 10, color: "#8A8F99" },
        splitLine: { lineStyle: { color: "#F0EEE8" } },
      },
      yAxis: {
        type: "category",
        inverse: true,
        data: sorted.map((d) => PARTIES[d.party].name),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { fontSize: 11, color: "#5F6470" },
      },
      series: [
        {
          type: "bar",
          data: sorted.map((d) => ({
            value: d.count,
            itemStyle: { color: PARTIES[d.party].color, borderRadius: [0, 4, 4, 0] },
          })),
          barWidth: 18,
          label: {
            show: true,
            position: "right",
            fontSize: 11,
            color: "#5F6470",
            fontFamily: "ui-monospace, monospace",
          },
        },
      ],
    };
  }, [data]);

  return (
    <EChart
      option={option}
      className="w-full"
      style={{ height }}
      ariaLabel="各政黨領先縣市數量橫向長條圖"
    />
  );
}
