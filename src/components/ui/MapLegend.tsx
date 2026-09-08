"use client";

import type { DisplayMode } from "@/lib/types";
import { PARTY_LIST } from "@/lib/constants";

/** 地圖圖例（依顯示模式切換，搭配文字與紋理，色盲友好） */
export default function MapLegend({ mode }: { mode: DisplayMode }) {
  if (mode === "leading-party") {
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-secondary">
        {PARTY_LIST.map((p) => (
          <span key={p.id} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-3 rounded-[3px]"
              style={{ backgroundColor: p.color }}
            />
            {p.short}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span
            className="hatch-tossup inline-block h-3 w-3 rounded-[3px] bg-[#737983]"
            aria-hidden
          />
          五五波
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-[3px] bg-[#25282E] border border-line" />
          尚無民調
        </span>
      </div>
    );
  }

  if (mode === "competitiveness") {
    const items: [string, string][] = [
      ["#31353B", "穩定領先"],
      ["#4A5059", "小幅領先"],
      ["#666D78", "五五波"],
      ["#949BA6", "可能翻轉"],
      ["#25282E", "尚無民調"],
    ];
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-secondary">
        {items.map(([c, label]) => (
          <span key={label} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-[3px]" style={{ backgroundColor: c }} />
            {label}
          </span>
        ))}
      </div>
    );
  }

  // poll-change
  const items: [string, string][] = [
    ["#7A9FC8", "領先擴大"],
    ["#666D78", "維持不變"],
    ["#D7794C", "差距縮小"],
    ["#25282E", "無資料"],
  ];
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-secondary">
      {items.map(([c, label]) => (
        <span key={label} className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-[3px]" style={{ backgroundColor: c }} />
          {label}
        </span>
      ))}
    </div>
  );
}
