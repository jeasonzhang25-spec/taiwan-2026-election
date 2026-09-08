"use client";

import * as echarts from "echarts/core";
import { BarChart, CustomChart, LineChart, MapChart } from "echarts/charts";
import { AriaComponent, GridComponent, LegendComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { EChartsCoreOption, EChartsType } from "echarts/core";
import { useEffect, useRef } from "react";

echarts.use([
  AriaComponent,
  BarChart,
  CanvasRenderer,
  CustomChart,
  GridComponent,
  LegendComponent,
  LineChart,
  MapChart,
  TooltipComponent,
]);

type EventHandler = (params: any) => void;

interface EChartProps {
  option: EChartsCoreOption;
  className?: string;
  style?: React.CSSProperties;
  onEvents?: Record<string, EventHandler>;
  ariaLabel?: string;
}

/** 輕量 ECharts 封裝：自動 init / resize / dispose */
export default function EChart({
  option,
  className,
  style,
  onEvents,
  ariaLabel,
}: EChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<EChartsType | null>(null);
  const initialOptionRef = useRef(option);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const chart = echarts.init(el, undefined, { renderer: "canvas" });
    chartRef.current = chart;
    // ResizeObserver 可能在下一個 effect 套用 option 前先觸發；地圖座標系尚未建立時 resize 會報錯。
    chart.setOption(initialOptionRef.current, true);

    let resizeFrame = 0;
    const ro = new ResizeObserver(([entry]) => {
      if (!entry || entry.contentRect.width <= 0 || entry.contentRect.height <= 0) return;
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        if (!chart.isDisposed()) chart.resize({ silent: true });
      });
    });
    ro.observe(el);

    return () => {
      cancelAnimationFrame(resizeFrame);
      ro.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.setOption(option, true);
    }
  }, [option]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !onEvents) return;
    const entries = Object.entries(onEvents);
    entries.forEach(([ev, handler]) => chart.on(ev as any, handler));
    return () => {
      if (!chart.isDisposed()) {
        entries.forEach(([ev]) => chart.off(ev as any));
      }
    };
  }, [onEvents]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={style}
      role="img"
      aria-label={ariaLabel}
    />
  );
}
