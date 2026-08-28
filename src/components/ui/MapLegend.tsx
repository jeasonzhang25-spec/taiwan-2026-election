"use client";

import type { DisplayMode } from "@/lib/types";
import { PARTY_LIST } from "@/lib/constants";

/** 地圖圖例（依顯示模式切換，搭配文字與紋理，色盲友好） */
export default function MapLegend({ mode }: { mode: DisplayMode }) {
  if (mode === "leading-party") {
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-ink-secondary">
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
            className="hatch-tossup inline-block h-3 w-3 rounded-[3px] bg-[#DBD8D0]"
            aria-hidden
          />
          五五波
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-[3px] bg-[#EDEBE5] border border-line" />
          尚無民調
        </span>
      </div>
    );
  }

  if (mode === "competitiveness") {
    const items: [string, string][] = [
      ["#E6E0F3", "穩定領先"],
      ["#C3B4E4", "小幅領先"],
      ["#9B7BD1", "五五波"],
      ["#6A3FA8", "可能翻轉"],
      ["#E6E4DE", "尚無民調"],
    ];
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-ink-secondary">
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
    ["#7C5CD6", "領先擴大"],
    ["#DBD8D0", "維持不變"],
    ["#E07A3F", "差距縮小"],
    ["#EDEBE5", "無資料"],
  ];
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-ink-secondary">
      {items.map(([c, label]) => (
        <span key={label} className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-[3px]" style={{ backgroundColor: c }} />
          {label}
        </span>
      ))}
    </div>
  );
}
