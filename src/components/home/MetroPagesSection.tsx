import { COUNTY_MAP } from "@/lib/data/counties";
import { COUNTY_PAGE_IDS } from "@/lib/data/county-pages";
import { MAJOR_CITY_POLLS } from "@/lib/data/polling";
import { PartyDot } from "@/components/ui/PartyDot";
import { partyShort } from "@/lib/constants";

export default function MetroPagesSection() {
  return (
    <section className="mx-auto max-w-page px-4 pt-16 sm:px-6 lg:px-8" aria-labelledby="metro-pages-title">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><span className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">全台 22 縣市</span><h2 id="metro-pages-title" className="mt-2 text-[22px] font-semibold leading-8 tracking-tight text-ink sm:text-2xl">進入縣市獨立頁面</h2><p className="mt-1.5 text-sm leading-6 text-ink-secondary">每個縣市都有穩定網址；有資料時提供比較器，沒有民調時清楚說明監測與資料缺口。</p></div><span className="text-xs text-ink-muted">民調 · 人選身分 · 政見 · 訂閱</span></div>
      <div className="mt-6 grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {COUNTY_PAGE_IDS.map((id) => {
          const county = COUNTY_MAP[id];
          const count = MAJOR_CITY_POLLS[id]?.length ?? 0;
          return <a key={id} href={`/county/${id}`} className="group rounded-xl border border-line bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-card-hover"><div className="flex items-center justify-between"><span className="font-semibold text-ink">{county.name}</span><span className="text-brand transition-transform group-hover:translate-x-1">→</span></div><div className="mt-2 flex items-center justify-between gap-2 text-xs text-ink-secondary"><span className="inline-flex items-center gap-1.5"><PartyDot party={county.incumbentParty} size={8} />現任 {partyShort(county.incumbentParty)}</span><span className="num text-ink-muted">{count > 0 ? `${count} 筆` : "待資料"}</span></div></a>;
        })}
      </div>
    </section>
  );
}
