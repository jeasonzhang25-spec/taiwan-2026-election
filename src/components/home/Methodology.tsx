import { SOURCES } from "@/lib/data/sources";
import { POLL_COUNTY_COUNT, POLL_RECORD_COUNT } from "@/lib/data/polling";
import { SectionTitle } from "@/components/ui/SectionTitle";

const READING_POINTS: { title: string; body: string }[] = [
  {
    title: "民調平均如何計算",
    body: "本看板以「最新一筆」民調呈現縣市現況，趨勢圖則逐筆展示各機構原始數字，不進行跨機構加權平均，避免不同抽樣與問法造成的誤導。",
  },
  {
    title: "不同機構資料如何處理",
    body: "各家機構的樣本、調查方式與誤差範圍不盡相同，故以「折線＋資料點」並陳；來源未公開的方法欄位會顯示「未揭露」，不自行猜填。",
  },
  {
    title: "誤差範圍意味著什麼",
    body: "誤差範圍（±%）代表抽樣誤差的區間。只有該筆資料已揭露抽樣誤差時，才用「差距不大於誤差」判為五五波；未揭露者不做這項推斷。",
  },
  {
    title: "「領先」不等於預測當選",
    body: "民調是某一時點的抽樣快照，受未表態者、投票率與後續事件影響。本看板的「領先／差距」是描述性資訊，絕非勝選預測。",
  },
  {
    title: "資料多久更新一次",
    body: "外部媒體標題索引每 5 分鐘嘗試更新，開啟頁面時也會自動刷新；正式民調資料仍以 30 分鐘為檢查週期，只有內容改變且驗證通過才發布。平台與來源快取仍可能造成短暫延遲。",
  },
  {
    title: "沒有資料如何呈現",
    body: "公開索引空表或沒有至少兩名人選數字的縣市一律標示「尚無民調」並以灰色呈現，不推估領先政黨、不補虛構候選人。",
  },
];

export default function Methodology() {
  return (
    <section id="methodology" className="mx-auto max-w-page scroll-mt-20 px-4 pt-16 sm:px-6 lg:px-8">
      <SectionTitle
        title="如何閱讀本看板"
        subtitle={`目前收錄 ${POLL_RECORD_COUNT} 筆問卷情境、涵蓋 ${POLL_COUNTY_COUNT} 個縣市；以下是正確閱讀方式。`}
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {READING_POINTS.map((p, index) => (
          <details key={p.title} open={index === 0} className="group rounded-xl border border-line bg-surface px-4 py-3.5">
            <summary className="flex min-h-8 cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-ink marker:hidden">
              {p.title}
              <span className="text-brand transition-transform group-open:rotate-45" aria-hidden="true">＋</span>
            </summary>
            <p className="border-t border-line pt-3 text-[13px] leading-6 text-ink-secondary">{p.body}</p>
          </details>
        ))}
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h3 className="text-sm font-semibold text-ink">資料來源</h3>
          <a href="/data-status" className="text-xs font-medium text-[#245D91] hover:underline">查看完整資料狀態 →</a>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SOURCES.slice(0, 3).map((s) => (
            <div key={s.name} className="flex flex-col rounded-xl border border-line bg-surface p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ink">{s.name}</span>
                <span className="rounded bg-[#F0EFEC] px-1.5 py-0.5 text-[10px] text-ink-secondary">
                  {s.kind}
                </span>
              </div>
              <p className="mt-1.5 flex-1 text-[13px] leading-5 text-ink-secondary">{s.description}</p>
              <div className="mt-3">
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noreferrer" className="text-xs text-[#2B6CB0] hover:underline">
                    前往來源 ↗
                  </a>
                ) : (
                  <span className="text-[11px] text-ink-muted">來源連結待補</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
