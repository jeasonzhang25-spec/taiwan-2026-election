"use client";

import { useMemo } from "react";
import { useDashboard } from "@/context/ElectionContext";
import { COUNTIES } from "@/lib/data/counties";
import { filterCounties, countLeadingByParty, getLeadingParty } from "@/lib/utils/filter";
import { PARTY_LIST, partyShort } from "@/lib/constants";
import PartyBarChart from "@/components/charts/PartyBarChart";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { PartyDot } from "@/components/ui/PartyDot";
import type { PartyId } from "@/lib/types";

type SeatStatus = "hold" | "flip" | "tossup" | "insufficient";

function classify(county: (typeof COUNTIES)[number]): SeatStatus {
  if (county.dataStatus === "insufficient") return "insufficient";
  if (county.competitiveness === "tossup") return "tossup";
  if (getLeadingParty(county) === county.result2022.winner) return "hold";
  return "flip";
}

export default function PartyMapSection() {
  const { filters } = useDashboard();
  const filtered = filterCounties(COUNTIES, filters);

  const leadingByParty = countLeadingByParty(filtered);
  const barData = PARTY_LIST.map((p) => ({
    party: p.id,
    count: leadingByParty[p.id] ?? 0,
  })).filter((d) => d.count > 0);

  const { holds, flips, tossups, insufficient, gains, losses, flipList } = useMemo(() => {
    let holds = 0;
    let flips = 0;
    let tossups = 0;
    let insufficient = 0;
    const gainSet = new Set<PartyId>();
    const lossSet = new Set<PartyId>();
    const flipList: { name: string; from: PartyId; to: PartyId }[] = [];

    for (const c of COUNTIES) {
      const s = classify(c);
      if (s === "insufficient") insufficient++;
      else if (s === "hold") holds++;
      else if (s === "tossup") tossups++;
      else {
        flips++;
        const to = getLeadingParty(c);
        const from = c.result2022.winner;
        gainSet.add(to);
        lossSet.add(from);
        flipList.push({ name: c.name, from, to });
      }
    }
    return { holds, flips, tossups, insufficient, gains: gainSet.size, losses: lossSet.size, flipList };
  }, []);

  const stats: { label: string; value: number; tone: string }[] = [
    { label: "守住", value: holds, tone: "text-[#245A96]" },
    { label: "翻轉", value: flips, tone: "text-[#7C5CD6]" },
    { label: "新增", value: gains, tone: "text-[#1C6B44]" },
    { label: "失去", value: losses, tone: "text-[#9C2B25]" },
    { label: "膠著", value: tossups, tone: "text-[#8A6410]" },
    { label: "不足", value: insufficient, tone: "text-ink-muted" },
  ];

  return (
    <section id="history" className="mx-auto max-w-page scroll-mt-20 px-4 pt-10 sm:px-6 lg:px-8">
      <SectionTitle
        title="政黨版圖"
        subtitle="只比較已有公開候選人支持度數字的縣市；尚無民調者不推估守住或翻轉。"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* 左：各黨領先縣市數量（橫向長條圖） */}
        <div className="rounded-xl border border-line bg-surface p-4 shadow-card">
          <h3 className="mb-3 text-sm font-semibold text-ink">各黨領先縣市數量</h3>
          {barData.length > 0 ? (
            <PartyBarChart data={barData} height={240} />
          ) : (
            <div className="flex h-[240px] items-center justify-center text-sm text-ink-muted">
              目前篩選下無領先資料
            </div>
          )}
        </div>

        {/* 右：與 2022 年相比 */}
        <div className="rounded-xl border border-line bg-surface p-4 shadow-card">
          <h3 className="mb-3 text-sm font-semibold text-ink">與 2022 年相比</h3>

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {stats.map((s) => (
              <div key={s.label} className="rounded-lg border border-line bg-canvas p-2 text-center">
                <div className={`num text-xl font-semibold ${s.tone}`}>{s.value}</div>
                <div className="mt-0.5 text-[11px] text-ink-secondary">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            {flipList.map((f) => (
              <div key={f.name} className="flex items-center justify-between rounded-lg border border-line p-2.5 text-xs">
                <span className="font-medium text-ink">{f.name}</span>
                <span className="inline-flex items-center gap-1.5 text-ink-secondary">
                  <span className="inline-flex items-center gap-1">
                    <PartyDot party={f.from} size={9} />
                    {partyShort(f.from)}
                  </span>
                  <span aria-hidden>→</span>
                  <span className="inline-flex items-center gap-1">
                    <PartyDot party={f.to} size={9} />
                    {partyShort(f.to)}
                  </span>
                </span>
              </div>
            ))}
            {flipList.length === 0 && (
              <p className="rounded-lg border border-dashed border-line-strong px-3 py-4 text-center text-xs text-ink-muted">
                目前無翻轉選區。
              </p>
            )}
          </div>

          <p className="mt-3 text-[11px] leading-4 text-ink-muted">
            守住＝領先政黨與 2022 相同；翻轉＝領先政黨改變；新增／失去＝各政黨相對 2022
            增減的領先席次；膠著＝差距不大於該調查已揭露的抽樣誤差；不足＝公開索引尚無數字。這是資料快照，不是當選預測。
          </p>
        </div>
      </div>
    </section>
  );
}
