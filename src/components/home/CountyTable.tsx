"use client";

import { useMemo, useState } from "react";
import { useDashboard } from "@/context/ElectionContext";
import { COUNTIES } from "@/lib/data/counties";
import { filterCounties, topTwo } from "@/lib/utils/filter";
import { partyShort } from "@/lib/constants";
import { fmtPct, fmtShortDate } from "@/lib/utils/format";
import { PartyDot } from "@/components/ui/PartyDot";
import { CompetitivenessBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { CountyRace } from "@/lib/types";

type SortKey = "name" | "support" | "margin";
type SortDir = "asc" | "desc";

export default function CountyTable() {
  const { filters, openCounty, countyId } = useDashboard();
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("margin");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [showAllMobile, setShowAllMobile] = useState(false);

  const rows = useMemo(() => {
    let list = filterCounties(COUNTIES, filters);
    if (query.trim()) {
      const q = query.trim();
      list = list.filter((c) => c.name.includes(q) || c.nameEn.toLowerCase().includes(q.toLowerCase()));
    }
    const leaderSupport = (c: CountyRace) => c.latestSupport[c.leadingId] ?? 0;
    const sorted = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name, "zh-Hant");
      else if (sortKey === "support") cmp = leaderSupport(a) - leaderSupport(b);
      else cmp = a.margin - b.margin;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [filters, query, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "asc");
    }
  }

  const sortIndicator = (key: SortKey) =>
    sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : "";
  const mobileRows = query.trim() || showAllMobile ? rows : rows.slice(0, 8);

  return (
    <section id="counties" className="mx-auto max-w-page scroll-mt-20 px-4 pt-16 sm:px-6 lg:px-8">
      <SectionTitle
        title="縣市選情列表"
        subtitle="22 個縣市完整列表；只有公開索引中已有候選人支持度數字的縣市顯示 2026 支持度。"
        aside={
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
              <path d="m20 20-3.2-3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              id="county-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜尋縣市…"
              className="h-10 w-44 rounded-xl border border-line bg-surface pl-8 pr-3 text-sm text-ink outline-none transition-colors duration-150 focus:border-brand sm:w-56"
            />
          </div>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          title="無符合條件的縣市"
          description="請調整搜尋關鍵字或篩選條件。"
        />
      ) : (
        <>
          {/* 桌面表格 */}
          <div className="hidden overflow-hidden rounded-xl border border-line bg-surface shadow-card md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-canvas text-xs text-ink-secondary">
                <tr>
                  <th
                    className="px-4 py-2.5 font-medium"
                    aria-sort={sortKey === "name" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                  >
                    <button onClick={() => toggleSort("name")} className="inline-flex items-center gap-1 hover:text-ink">
                      縣市{sortIndicator("name")}
                    </button>
                  </th>
                  <th className="px-3 py-2.5 font-medium">現任執政黨</th>
                  <th className="px-3 py-2.5 font-medium">主要候選人</th>
                  <th
                    className="px-3 py-2.5 font-medium"
                    aria-sort={sortKey === "support" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                  >
                    <button onClick={() => toggleSort("support")} className="inline-flex items-center gap-1 hover:text-ink">
                      最新支持度{sortIndicator("support")}
                    </button>
                  </th>
                  <th className="px-3 py-2.5 font-medium">領先者</th>
                  <th
                    className="px-3 py-2.5 font-medium"
                    aria-sort={sortKey === "margin" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                  >
                    <button onClick={() => toggleSort("margin")} className="inline-flex items-center gap-1 hover:text-ink">
                      領先差距{sortIndicator("margin")}
                    </button>
                  </th>
                  <th className="px-3 py-2.5 font-medium">競爭評級</th>
                  <th className="px-3 py-2.5 font-medium">最近更新</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((c) => {
                  const { leader, runner } = topTwo(c);
                  const support = c.latestSupport[c.leadingId] ?? 0;
                  const hasData = c.dataStatus === "verified-poll" && Boolean(leader);
                  const active = countyId === c.id;
                  return (
                    <tr
                      key={c.id}
                      onClick={() => openCounty(c.id)}
                      className={`cursor-pointer transition-colors duration-150 hover:bg-canvas/70 ${active ? "bg-canvas" : ""}`}
                    >
                      <td className="px-4 py-3 font-medium text-ink">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openCounty(c.id);
                          }}
                          className="rounded-sm text-left hover:underline"
                          aria-label={`查看${c.name}選情詳情`}
                        >
                          {c.name}
                        </button>
                      </td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center gap-1.5 text-ink-secondary">
                          <PartyDot party={c.incumbentParty} size={9} />
                          {partyShort(c.incumbentParty)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-ink-secondary">
                        {hasData && leader ? leader.name : "尚無公開數字"}
                        {hasData && leader && <span className="text-ink-muted">（{partyShort(leader.partyId)}）</span>}
                        {runner && (
                          <>
                            <span className="text-ink-muted"> vs </span>
                            {runner.name}
                            <span className="text-ink-muted">（{partyShort(runner.partyId)}）</span>
                          </>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <span className="num font-medium text-ink">{hasData ? fmtPct(support) : "—"}</span>
                      </td>
                      <td className="px-3 py-3">
                        {hasData && leader ? <span className="inline-flex items-center gap-1.5"><PartyDot party={leader.partyId} size={9} />{leader.name}</span> : <span className="text-ink-muted">—</span>}
                      </td>
                      <td className="px-3 py-3">
                        {hasData ? <><span className="num">{c.margin.toFixed(1)}</span><span className="text-ink-muted"> 個百分點</span></> : <span className="text-ink-muted">—</span>}
                      </td>
                      <td className="px-3 py-3">
                        <CompetitivenessBadge value={c.competitiveness} />
                      </td>
                      <td className="px-3 py-3 text-xs text-ink-muted">{hasData ? fmtShortDate(c.lastPollDate) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 手機卡片列表 */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:hidden">
            {mobileRows.map((c) => {
              const { leader, runner } = topTwo(c);
              const support = c.latestSupport[c.leadingId] ?? 0;
              const hasData = c.dataStatus === "verified-poll" && Boolean(leader);
              const active = countyId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => openCounty(c.id)}
                  className={`min-h-11 rounded-xl border p-3.5 text-left transition-all duration-150 ${active ? "border-brand bg-brand-mist" : "border-line bg-surface"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-ink">{c.name}</span>
                    <CompetitivenessBadge value={c.competitiveness} />
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-ink-secondary">
                    <PartyDot party={c.incumbentParty} size={9} />
                    2022 當選 {partyShort(c.incumbentParty)}{hasData ? ` · 民調 ${fmtShortDate(c.lastPollDate)}` : " · 暫無公開數字"}
                  </div>
                  {hasData && leader ? <div className="mt-2 flex items-center justify-between text-[13px]">
                    <span className="inline-flex items-center gap-1.5 text-ink-secondary">
                      <PartyDot party={leader.partyId} size={9} />
                      {leader.name}（{partyShort(leader.partyId)}）
                    </span>
                    <span className="num font-medium text-ink">{fmtPct(support)}</span>
                  </div> : <div className="mt-2 text-[13px] text-ink-muted">尚無可比較的公開支持度</div>}
                  {runner && (
                    <div className="mt-1 flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1.5 text-ink-secondary">
                        <PartyDot party={runner.partyId} size={9} />
                        {runner.name}（{partyShort(runner.partyId)}）
                      </span>
                    </div>
                  )}
                  {hasData && <div className="mt-2 border-t border-line pt-1.5 text-[11px] text-ink-muted">領先差距 {c.margin.toFixed(1)} 個百分點</div>}
                </button>
              );
            })}
          </div>
          {!query.trim() && rows.length > 8 && (
            <button
              type="button"
              onClick={() => setShowAllMobile((value) => !value)}
              className="mt-3 min-h-11 w-full rounded-xl border border-line bg-surface px-4 text-sm font-medium text-ink-secondary md:hidden"
            >
              {showAllMobile ? "收起縣市列表" : `查看全部 ${rows.length} 個縣市`}
            </button>
          )}
        </>
      )}
    </section>
  );
}
