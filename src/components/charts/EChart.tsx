"use client";

import * as echarts from "echarts";
import { useEffect, useRef } from "react";

type EventHandler = (params: any) => void;

interface EChartProps {
  option: echarts.EChartsOption;
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
  const chartRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const chart = echarts.init(el, undefined, { renderer: "canvas" });
    chartRef.current = chart;

    const ro = new ResizeObserver(() => chart.resize());
    ro.observe(el);

    return () => {
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
