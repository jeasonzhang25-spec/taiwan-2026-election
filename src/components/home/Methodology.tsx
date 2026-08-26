import { SOURCES } from "@/lib/data/sources";
import { SectionTitle } from "@/components/ui/SectionTitle";

const READING_POINTS: { title: string; body: string }[] = [
  {
    title: "民調平均如何計算",
    body: "本看板以「最新一筆」民調呈現縣市現況，趨勢圖則逐筆展示各機構原始數字，不進行跨機構加權平均，避免不同抽樣與問法造成的誤導。",
  },
  {
    title: "不同機構資料如何處理",
    body: "各家機構的樣本、調查方式（市話／手機／網路）與誤差範圍不盡相同，故以「折線＋資料點」並陳，而非混成單一平滑曲線，方便你比較來源差異。",
  },
  {
    title: "誤差範圍意味著什麼",
    body: "誤差範圍（±%）代表抽樣誤差的區間。當兩名候選人的差距小於誤差範圍時，實際領先者仍可能不同，這正是「五五波」的判斷依據。",
  },
  {
    title: "「領先」不等於預測當選",
    body: "民調是某一時點的抽樣快照，受未表態者、投票率與後續事件影響。本看板的「領先／差距」是描述性資訊，絕非勝選預測。",
  },
  {
    title: "資料多久更新一次",
    body: "演示版本為靜態資料；正式版本將以固定頻率（如每日）更新，並於導覽列標示最後更新時間。",
  },
  {
    title: "模擬資料與真實資料的區別",
    body: "目前所有民調、候選人與支持度皆為演示用虛構資料，僅供介面展示。接入真實資料後，此警示區將自動移除。",
  },
];

export default function Methodology() {
  return (
    <section id="methodology" className="mx-auto max-w-page scroll-mt-20 px-4 pt-10 sm:px-6 lg:px-8">
      <SectionTitle
        title="如何閱讀本看板"
        subtitle="幾個關鍵概念，幫助你正確理解選情數據。"
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {READING_POINTS.map((p) => (
          <div key={p.title} className="rounded-xl border border-line bg-surface p-4 shadow-card">
            <h3 className="text-sm font-semibold text-ink">{p.title}</h3>
            <p className="mt-1.5 text-[13px] leading-5 text-ink-secondary">{p.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="mb-3 text-sm font-semibold text-ink">資料來源</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SOURCES.map((s) => (
            <div key={s.name} className="flex flex-col rounded-xl border border-line bg-surface p-4 shadow-card">
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
