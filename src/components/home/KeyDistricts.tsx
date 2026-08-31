"use client";

import { useState } from "react";
import { useDashboard } from "@/context/ElectionContext";
import type { CountyRace } from "@/lib/types";
import { partyShort } from "@/lib/constants";
import { sortByCompetitiveness, topTwo } from "@/lib/utils/filter";
import { fmtShortDate, fmtPct, changeNote } from "@/lib/utils/format";
import { PartyDot } from "@/components/ui/PartyDot";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

function statusBadge(county: CountyRace) {
  if (county.competitiveness === "tossup") {
    return <Badge tone="amber">膠著</Badge>;
  }
  if (county.change > 0.1) return <Badge tone="blue">領先擴大</Badge>;
  if (county.change < -0.1) return <Badge tone="red">差距縮小</Badge>;
  return <Badge tone="gray">維持不變</Badge>;
}

export default function KeyDistricts({ counties }: { counties: CountyRace[] }) {
  const { openCounty, countyId } = useDashboard();
  const [showAll, setShowAll] = useState(false);
  const top = sortByCompetitiveness(
    counties.filter((county) => county.dataStatus === "verified-poll"),
  ).slice(0, 5);
  const visible = showAll ? top : top.slice(0, 3);

  if (top.length === 0) {
    return (
      <EmptyState
        title="無關鍵選區"
        description="目前篩選條件下沒有已核驗的公開民調。"
      />
    );
  }

  return (
    <div className="space-y-2.5">
      {visible.map((county) => {
        const { leader, runner } = topTwo(county);
        const leaderSupport = county.latestSupport[county.leadingId] ?? 0;
        const runnerSupport = runner ? county.latestSupport[runner.id] ?? 0 : 0;
        const isActive = countyId === county.id;

        return (
          <button
            key={county.id}
            onClick={() => openCounty(county.id)}
            className={`block w-full rounded-xl border p-3.5 text-left transition-all duration-150 hover:-translate-y-0.5 hover:shadow-card-hover ${
              isActive ? "border-brand bg-brand-mist" : "border-line bg-surface"
            }`}
            aria-pressed={isActive}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">{county.name}</span>
              {statusBadge(county)}
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 text-ink-secondary">
                  <PartyDot party={leader.partyId} size={9} />
                  {leader.name} · {partyShort(leader.partyId)}
                </span>
                <span className="num font-medium text-ink">{fmtPct(leaderSupport)}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#ECEAE3]">
                <div className="h-full rounded-full bg-brand transition-[width] duration-200" style={{ width: `${leaderSupport}%` }} />
              </div>
              {runner && (
                <>
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 text-ink-secondary">
                      <PartyDot party={runner.partyId} size={9} />
                      {runner.name} · {partyShort(runner.partyId)}
                    </span>
                    <span className="num font-medium text-ink">{fmtPct(runnerSupport)}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#ECEAE3]">
                    <div className="h-full rounded-full bg-ink-muted/60 transition-[width] duration-200" style={{ width: `${runnerSupport}%` }} />
                  </div>
                </>
              )}
            </div>

            <div className="mt-2 flex items-center justify-between border-t border-line pt-2 text-[11px] text-ink-muted">
              <span>
                差距 <span className="num font-medium text-ink">{county.margin.toFixed(1)}</span> 個百分點 ·{" "}
                <span className={county.change > 0.1 ? "text-[#245A96]" : county.change < -0.1 ? "text-[#9C2B25]" : ""}>
                  {changeNote(county.change)}
                </span>
              </span>
              <span>民調 {fmtShortDate(county.lastPollDate)}</span>
            </div>
          </button>
        );
      })}
      {top.length > 3 && (
        <button
          type="button"
          onClick={() => setShowAll((value) => !value)}
          className="min-h-10 w-full rounded-xl border border-line bg-canvas px-3 text-sm font-medium text-ink-secondary transition-colors hover:border-line-strong hover:text-ink"
        >
          {showAll ? "收起其他選區" : `查看另外 ${top.length - 3} 個選區`}
        </button>
      )}
    </div>
  );
}
