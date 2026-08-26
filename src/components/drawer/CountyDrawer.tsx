"use client";

import { useEffect, useRef } from "react";
import { useDashboard } from "@/context/ElectionContext";
import { getCounty } from "@/lib/data/counties";
import { MAJOR_CITY_POLLS, buildSeries } from "@/lib/data/polling";
import { filterPollRecords } from "@/lib/utils/filter";
import { partyColor, partyName } from "@/lib/constants";
import { PartyDot } from "@/components/ui/PartyDot";
import { CompetitivenessBadge } from "@/components/ui/Badge";
import { DataDisclaimer } from "@/components/ui/DataDisclaimer";
import { EmptyState } from "@/components/ui/EmptyState";
import PollTrendChart from "@/components/charts/PollTrendChart";
import { fmtShortDate, fmtPct } from "@/lib/utils/format";

export default function CountyDrawer() {
  const { countyId, closeCounty, filters } = useDashboard();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!countyId) return;
    // 鎖定背景捲動
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeCounty();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      const previous = previousFocusRef.current;
      const fallback = document.getElementById("county-picker") as HTMLElement | null;
      if (previous && previous !== document.body && previous.isConnected) previous.focus();
      else fallback?.focus();
    };
  }, [countyId, closeCounty]);

  if (!countyId) return null;

  const county = getCounty(countyId);
  if (!county) return null;

  const records = filterPollRecords(MAJOR_CITY_POLLS[countyId] ?? [], filters);
  const trend = records.length > 0 ? buildSeries(countyId, records) : undefined;
  const leader = county.candidates.find((c) => c.id === county.leadingId);
  const sortedCandidates = [...county.candidates].sort(
    (a, b) =>
      (county.latestSupport[b.id] ?? 0) - (county.latestSupport[a.id] ?? 0),
  );
  const recentPolls = [...records].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={`${county.name} 選情詳情`}>
      {/* 背景遮罩 */}
      <div
        className="backdrop-enter absolute inset-0 bg-black/25"
        onClick={closeCounty}
        aria-hidden="true"
      />

      {/* 抽屜 */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className="drawer-enter absolute inset-y-0 right-0 flex w-full flex-col overflow-y-auto bg-surface shadow-drawer outline-none sm:w-[44%] sm:max-w-[620px]"
      >
        {/* 標題列 */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-surface/95 px-5 py-4 backdrop-blur">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold tracking-tight text-ink">{county.name}</h2>
              <CompetitivenessBadge value={county.competitiveness} />
            </div>
            <p className="mt-1 text-[13px] text-ink-secondary">
              現任：{county.incumbentName}（{partyName(county.incumbentParty)}）
            </p>
          </div>
          <button
            ref={closeRef}
            onClick={closeCounty}
            aria-label="關閉"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-ink-secondary transition-colors duration-150 hover:bg-canvas hover:text-ink"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="space-y-6 px-5 py-5">
          <DataDisclaimer />

          {/* 候選人資料卡 */}
          <section aria-label="主要候選人">
            <h3 className="mb-2 text-sm font-semibold text-ink">主要候選人</h3>
            <div className="space-y-2">
              {sortedCandidates.map((c) => {
                const support = county.latestSupport[c.id] ?? 0;
                const isLeader = c.id === county.leadingId;
                const pct = Math.max(0, Math.min(100, support));
                return (
                  <div
                    key={c.id}
                    className={`rounded-lg border p-3 ${isLeader ? "border-line-strong bg-canvas" : "border-line"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PartyDot party={c.partyId} size={12} />
                        <span className="text-sm font-medium text-ink">{c.name}</span>
                        <span className="text-xs text-ink-secondary">{partyName(c.partyId)}</span>
                        {c.isIncumbent && (
                          <span className="rounded bg-[#F0EFEC] px-1.5 py-0.5 text-[10px] text-ink-secondary">現任</span>
                        )}
                        {isLeader && (
                          <span className="rounded bg-[#EAF1FA] px-1.5 py-0.5 text-[10px] font-medium text-[#245A96]">領先</span>
                        )}
                      </div>
                      <div className="num text-base font-semibold text-ink">{fmtPct(support)}</div>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#F0EEE8]">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: partyColor(c.partyId) }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-ink-secondary">
              領先者：{leader?.name}，領先{" "}
              <span className="num font-medium text-ink">{county.margin.toFixed(1)}</span> 個百分點
            </p>
          </section>

          {/* 民調趨勢 */}
          <section aria-label="民調趨勢">
            <h3 className="mb-2 text-sm font-semibold text-ink">民調趨勢</h3>
            {trend && trend.series.length > 0 ? (
              <PollTrendChart trend={trend} candidates={county.candidates} height={240} />
            ) : (
              <EmptyState
                title="尚無趨勢資料"
                description="此縣市目前僅有單筆摘要資料，未提供完整民調時間序列。"
              />
            )}
          </section>

          {/* 最近五次民調 */}
          <section aria-label="最近民調">
            <h3 className="mb-2 text-sm font-semibold text-ink">最近五次公開民調</h3>
            {recentPolls.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-line">
                <table className="w-full min-w-[460px] text-left text-xs">
                  <thead className="bg-canvas text-ink-secondary">
                    <tr>
                      <th className="px-3 py-2 font-medium">機構</th>
                      <th className="px-3 py-2 font-medium">日期</th>
                      <th className="px-3 py-2 font-medium">樣本</th>
                      <th className="px-3 py-2 font-medium">方式</th>
                      <th className="px-3 py-2 font-medium">誤差</th>
                      <th className="px-3 py-2 font-medium">領先者</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {recentPolls.map((r) => {
                      const topId = Object.entries(r.results).sort((a, b) => b[1] - a[1])[0]?.[0];
                      const topCand = county.candidates.find((c) => c.id === topId);
                      return (
                        <tr key={r.id} className="hover:bg-canvas/60">
                          <td className="px-3 py-2 text-ink">{r.institute}</td>
                          <td className="px-3 py-2 num">{fmtShortDate(r.date)}</td>
                          <td className="px-3 py-2 num">{r.sampleSize}</td>
                          <td className="px-3 py-2">{r.method}</td>
                          <td className="px-3 py-2 num">±{r.marginOfError}%</td>
                          <td className="px-3 py-2">
                            {topCand ? (
                              <span className="inline-flex items-center gap-1">
                                <PartyDot party={topCand.partyId} size={8} />
                                {topCand.name}
                              </span>
                            ) : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="尚無逐筆民調" description="此縣市未收錄逐筆公開民調。" />
            )}
          </section>

          {/* 2022 選舉結果 */}
          <section aria-label="2022 選舉結果">
            <h3 className="mb-2 text-sm font-semibold text-ink">2022 年選舉結果</h3>
            <div className="flex items-center gap-3 rounded-lg border border-line p-3">
              <PartyDot party={county.result2022.winner} size={14} />
              <div>
                <div className="text-sm font-medium text-ink">
                  {partyName(county.result2022.winner)}當選
                </div>
                <div className="text-xs text-ink-secondary">
                  得票率 {fmtPct(county.result2022.voteShare)}
                </div>
              </div>
            </div>
          </section>

          {/* 歷史政黨版圖 */}
          <section aria-label="歷史政黨版圖">
            <h3 className="mb-2 text-sm font-semibold text-ink">歷史政黨版圖</h3>
            <div className="flex items-center gap-2">
              {county.historical.map((h) => (
                <div
                  key={h.year}
                  className="flex-1 rounded-lg border border-line p-2 text-center"
                >
                  <div className="text-[11px] text-ink-muted">{h.year}</div>
                  <div className="mt-1 flex items-center justify-center gap-1.5">
                    <PartyDot party={h.winner} size={9} />
                    <span className="text-xs font-medium text-ink">{partyName(h.winner)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 關鍵議題 */}
          <section aria-label="關鍵議題">
            <h3 className="mb-2 text-sm font-semibold text-ink">關鍵議題</h3>
            <div className="flex flex-wrap gap-1.5">
              {county.keyIssues.map((issue) => (
                <span
                  key={issue}
                  className="rounded-full border border-line bg-canvas px-2.5 py-1 text-xs text-ink-secondary"
                >
                  {issue}
                </span>
              ))}
            </div>
          </section>

          {/* 更新時間與來源 */}
          <section className="border-t border-line pt-4 text-xs text-ink-muted" aria-label="資料資訊">
            更新時間：{county.updatedAt} · 資料來源：公開民調（演示資料）
          </section>
        </div>
      </div>
    </div>
  );
}
