import { COUNTY_MAP } from "@/lib/data/counties";
import { METRO_COUNTY_IDS } from "@/lib/data/county-pages";
import { MAJOR_CITY_POLLS } from "@/lib/data/polling";
import { PartyDot } from "@/components/ui/PartyDot";
import { partyShort } from "@/lib/constants";

export default function MetroPagesSection() {
  return (
    <section className="mx-auto max-w-page px-4 pt-16 sm:px-6 lg:px-8" aria-labelledby="metro-pages-title">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><span className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">六都深度頁</span><h2 id="metro-pages-title" className="mt-2 text-[22px] font-semibold leading-8 tracking-tight text-ink sm:text-2xl">進入縣市獨立頁面</h2><p className="mt-1.5 text-sm leading-6 text-ink-secondary">民調比較、政見資料、來源訂閱與提醒集中在各縣市專頁。</p></div><span className="text-xs text-ink-muted">其他 16 縣市後續擴充</span></div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {METRO_COUNTY_IDS.map((id) => {
          const county = COUNTY_MAP[id];
          const count = MAJOR_CITY_POLLS[id]?.length ?? 0;
          return <a key={id} href={`/county/${id}`} className="group rounded-2xl border border-line bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-card-hover"><div className="flex items-center justify-between"><span className="text-lg font-semibold text-ink">{county.name}</span><span className="text-brand transition-transform group-hover:translate-x-1">→</span></div><div className="mt-4 flex items-center gap-1.5 text-sm text-ink-secondary"><PartyDot party={county.incumbentParty} size={9} />現任 {partyShort(county.incumbentParty)}</div><div className="mt-1 text-[13px] text-ink-muted">{count} 筆民調情境</div></a>;
        })}
      </div>
    </section>
  );
}
