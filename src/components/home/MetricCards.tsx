"use client";

import { useDashboard } from "@/context/ElectionContext";
import { COUNTIES } from "@/lib/data/counties";
import { MAJOR_CITY_POLLS } from "@/lib/data/polling";
import { PARTY_LIST, ELECTION_DAY } from "@/lib/constants";
import { filterCounties, filterPollRecords, countLeadingByParty, countTossups } from "@/lib/utils/filter";
import { daysUntil } from "@/lib/utils/format";
import { PartyDot } from "@/components/ui/PartyDot";
import { DataDisclaimer } from "@/components/ui/DataDisclaimer";

export default function MetricCards() {
  const { filters } = useDashboard();
  const filtered = filterCounties(COUNTIES, filters);

  const leadingByParty = countLeadingByParty(filtered);
  const tossups = countTossups(filtered);

  const pollRecords = Object.values(MAJOR_CITY_POLLS).flat();
  const filteredPollCount = filterPollRecords(pollRecords, filters).length;

  const days = daysUntil(ELECTION_DAY);

  return (
    <section className="mx-auto max-w-page px-4 pt-5 sm:px-6 lg:px-8">
      <div className="grid grid-cols-3 gap-3 lg:grid-cols-4">
        {/* 各黨領先縣市 */}
        <div className="col-span-3 rounded-xl border border-line bg-surface p-4 shadow-card lg:col-span-1">
          <div className="text-xs text-ink-secondary">各黨領先縣市</div>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            {PARTY_LIST.map((p) => {
              const count = leadingByParty[p.id] ?? 0;
              return (
                <span key={p.id} className="inline-flex items-center gap-1.5" title={p.name}>
                  <PartyDot party={p.id} size={11} />
                  <span className="text-xs text-ink-secondary">{p.short}</span>
                  <span className="num text-base font-semibold text-ink">{count}</span>
                </span>
              );
            })}
            <span className="inline-flex items-center gap-1.5" title="五五波（膠著）">
              <span className="hatch-tossup inline-block h-[11px] w-[11px] rounded-[3px] bg-[#DBD8D0]" />
              <span className="text-xs text-ink-secondary">五五波</span>
              <span className="num text-base font-semibold text-ink">{tossups}</span>
            </span>
          </div>
        </div>

        {/* 膠著縣市數量 */}
        <div className="rounded-xl border border-line bg-surface p-3 shadow-card sm:p-4">
          <div className="text-xs text-ink-secondary">膠著縣市數量</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="num text-2xl font-semibold text-ink sm:text-3xl">{tossups}</span>
            <span className="hidden text-xs text-ink-muted sm:inline">個縣市呈五五波</span>
          </div>
        </div>

        {/* 已收錄公開民調 */}
        <div className="rounded-xl border border-line bg-surface p-3 shadow-card sm:p-4">
          <div className="text-xs text-ink-secondary">已收錄公開民調</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="num text-2xl font-semibold text-ink sm:text-3xl">{filteredPollCount}</span>
            <span className="text-xs text-ink-muted">筆</span>
          </div>
        </div>

        {/* 距離投票日 */}
        <div className="rounded-xl border border-line bg-surface p-3 shadow-card sm:p-4">
          <div className="text-xs text-ink-secondary">距離投票日</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="num text-2xl font-semibold text-ink sm:text-3xl">{days}</span>
            <span className="text-xs text-ink-muted">天</span>
          </div>
        </div>
      </div>

      <DataDisclaimer className="mt-3" />
    </section>
  );
}
