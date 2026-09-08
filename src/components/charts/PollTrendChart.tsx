"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import type { EChartsOption } from "echarts";
import { partyColor } from "@/lib/constants";
import { fmtShortDate } from "@/lib/utils/format";
import type { Candidate, CountyPollTrend, PartyId } from "@/lib/types";

interface PollTrendChartProps {
  trend: CountyPollTrend;
  candidates: Candidate[];
  height?: number;
}

const EChart = dynamic(() => import("./EChart"), { ssr: false });

function fmtArchiveDate(value: string) {
  const [year, month, day] = value.split("-");
  return year && month && day ? `${year.slice(2)}/${Number(month)}/${Number(day)}` : value;
}

/**
 * 縣市民調趨勢圖：
 * - 折線 + 資料點（不進行虛假平滑）
 * - 誤差範圍（垂直誤差線）
 * - 懸浮顯示機構／樣本數／日期
 */
export default function PollTrendChart({
  trend,
  candidates,
  height = 280,
}: PollTrendChartProps) {
  const latestRecord = [...trend.records].sort(
    (a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id),
  ).at(-1);
  const candidateById = new Map(candidates.map((candidate) => [candidate.id, candidate]));
  const option = useMemo<EChartsOption>(() => {
    const records = [...trend.records].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
    const recordIds = records.map((record) => record.id);
    const recordById = new Map(records.map((record) => [record.id, record]));
    const recordIndex = new Map(recordIds.map((id, i) => [id, i]));

    const candidateById = new Map(candidates.map((c) => [c.id, c]));

    const lineSeries = trend.series.map((s) => {
      const cand = candidateById.get(s.candidateId);
      const color = partyColor(cand?.partyId as PartyId);
      const data = recordIds.map((recordId) => {
        const p = s.points.find((x) => x.recordId === recordId);
        if (!p) return null;
        return {
          value: p.value,
          institute: p.institute,
          sampleSize: p.sampleSize,
          moe: p.marginError,
        };
      });
      return {
        name: cand?.name ?? s.candidateId,
        type: "line" as const,
        data,
        connectNulls: false,
        smooth: false,
        symbol: "circle",
        symbolSize: 5,
        lineStyle: { width: 2, color },
        itemStyle: { color },
        emphasis: { focus: "series" as const },
      };
    });

    // 誤差範圍：每個候選人一條 custom series，畫垂直誤差線
    const errorSeries = trend.series.map((s) => {
      const cand = candidateById.get(s.candidateId);
      const color = partyColor(cand?.partyId as PartyId);
      const data = s.points.filter((p) => p.marginError !== undefined).map((p) => [
        recordIndex.get(p.recordId) as number,
        p.value,
        p.marginError,
      ]);
      return {
        name: `${cand?.name ?? ""} 誤差`,
        type: "custom" as const,
        renderItem: (params: any, api: any): any => {
          const idx = api.value(0);
          const val = api.value(1);
          const moe = api.value(2);
          const x = api.coord([idx, 0])[0];
          const yTop = api.coord([0, val + moe])[1];
          const yBot = api.coord([0, val - moe])[1];
          return {
            type: "group",
            children: [
              { type: "line", shape: { x1: x, y1: yTop, x2: x, y2: yBot }, style: { stroke: color, lineWidth: 1.2, opacity: 0.7 } },
              { type: "line", shape: { x1: x - 4, y1: yTop, x2: x + 4, y2: yTop }, style: { stroke: color, lineWidth: 1.2, opacity: 0.7 } },
              { type: "line", shape: { x1: x - 4, y1: yBot, x2: x + 4, y2: yBot }, style: { stroke: color, lineWidth: 1.2, opacity: 0.7 } },
            ],
          };
        },
        data,
        silent: true,
        z: 3,
      };
    });

    return {
      aria: { enabled: true, decal: { show: true } },
      animationDuration: 200,
      grid: { left: 8, right: 14, top: 34, bottom: 6, containLabel: true },
      tooltip: {
        trigger: "axis",
        backgroundColor: "#16181C",
        borderColor: "#343841",
        borderWidth: 1,
        padding: [8, 10],
        textStyle: { color: "#F4F5F7", fontSize: 12 },
        extraCssText: "box-shadow: 0 10px 30px rgba(0,0,0,0.36); border-radius: 8px;",
        formatter: (params: any) => {
          const list = Array.isArray(params) ? params : [params];
          const lineParams = list.filter(
            (p: any) => p.seriesType === "line" && p.data != null,
          );
          if (lineParams.length === 0) return "";
          const first = lineParams[0];
          const meta = first.data;
          const record = recordById.get(String(first.axisValue));
          const head = `<div style="font-weight:600;margin-bottom:4px">${record?.date ?? fmtShortDate(String(first.axisValue))}${record?.scenario ? ` · ${record.scenario}` : ""}</div>`;
          const rows = lineParams
            .map((p: any) => {
              const color = p.color || "#888";
              return `<div style="display:flex;justify-content:space-between;gap:12px;font-size:11px">
                <span><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${color};margin-right:4px"></span>${p.seriesName}</span>
                <b style="font-family:monospace">${Number(p.data.value).toFixed(1)}%</b>
              </div>`;
            })
            .join("");
          const foot = meta
            ? `<div style="margin-top:6px;font-size:10px;color:#8D929B">${meta.institute} · ${meta.sampleSize ? `樣本 ${meta.sampleSize}` : "樣本未揭露"} · ${meta.moe !== undefined ? `誤差 ±${meta.moe}%` : "誤差未揭露"}</div>`
            : "";
          return head + rows + foot;
        },
      },
      legend: {
        show: true,
        top: 0,
        left: 0,
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { fontSize: 11, color: "#B1B5BD" },
      },
      xAxis: {
        type: "category",
        data: recordIds,
        boundaryGap: false,
        axisLine: { lineStyle: { color: "#343841" } },
        axisTick: { show: false },
        axisLabel: {
          fontSize: 10,
          color: "#8D929B",
          hideOverlap: true,
          formatter: (value: string) => fmtArchiveDate(recordById.get(value)?.date ?? value),
        },
      },
      yAxis: {
        type: "value",
        axisLabel: { fontSize: 10, color: "#8D929B", formatter: "{value}%" },
        splitLine: { lineStyle: { color: "#24272D" } },
        min: (v: any) => Math.max(0, Math.floor(v.min - 4)),
      },
      series: [...lineSeries, ...errorSeries],
    };
  }, [trend, candidates]);

  return (
    <div>
      <div className="sr-only">
        <p>民調趨勢圖。共 {trend.records.length} 筆問卷情境。</p>
        {latestRecord && (
          <p>
            最新一筆為 {latestRecord.date}，{latestRecord.institute}，
            {Object.entries(latestRecord.results)
              .sort((a, b) => b[1] - a[1])
              .map(([id, value]) => `${candidateById.get(id)?.name ?? id} ${value}%`)
              .join("、")}。
          </p>
        )}
      </div>
      <EChart
        option={option}
        className="w-full"
        style={{ height }}
        ariaLabel="候選人支持度民調趨勢圖；下方可展開文字資料"
      />
      <details className="mt-2 rounded-lg border border-line bg-canvas text-xs">
        <summary className="cursor-pointer px-3 py-2 font-medium text-ink-secondary">查看趨勢圖文字資料</summary>
        <div className="overflow-x-auto border-t border-line">
          <table className="w-full min-w-[520px] text-left">
            <thead className="text-ink-muted"><tr><th className="px-3 py-2 font-medium">日期</th><th className="px-3 py-2 font-medium">機構</th><th className="px-3 py-2 font-medium">題目結果</th></tr></thead>
            <tbody className="divide-y divide-line">{[...trend.records].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)).slice(0, 12).map((record) => <tr key={record.id}><td className="num whitespace-nowrap px-3 py-2">{record.date}</td><td className="px-3 py-2">{record.institute}</td><td className="px-3 py-2">{Object.entries(record.results).sort((a, b) => b[1] - a[1]).map(([id, value]) => `${candidateById.get(id)?.name ?? id} ${value}%`).join("、")}</td></tr>)}</tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
