import { COUNTY_MAP } from "@/lib/data/counties";
import { METRO_COUNTY_IDS } from "@/lib/data/county-pages";
import { MAJOR_CITY_POLLS } from "@/lib/data/polling";
import { PartyDot } from "@/components/ui/PartyDot";
import { partyShort } from "@/lib/constants";

export default function MetroPagesSection() {
  return (
    <section className="mx-auto max-w-page px-4 pt-10 sm:px-6 lg:px-8" aria-labelledby="metro-pages-title">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end"><div><span className="text-xs font-medium text-[#245D91]">六都深度頁</span><h2 id="metro-pages-title" className="mt-1 text-xl font-semibold tracking-tight text-ink">進入縣市獨立頁面</h2><p className="mt-1 text-sm text-ink-secondary">民調比較、政見資料、來源訂閱與提醒集中在各縣市專頁。</p></div><span className="text-xs text-ink-muted">其他 16 縣市後續擴充</span></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {METRO_COUNTY_IDS.map((id) => {
          const county = COUNTY_MAP[id];
          const count = MAJOR_CITY_POLLS[id]?.length ?? 0;
          return <a key={id} href={`/county/${id}`} className="group rounded-xl border border-line bg-surface p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card-hover"><div className="flex items-center justify-between"><span className="font-semibold text-ink">{county.name}</span><span className="text-ink-muted transition-transform group-hover:translate-x-0.5">→</span></div><div className="mt-3 flex items-center gap-1.5 text-xs text-ink-secondary"><PartyDot party={county.incumbentParty} size={8} />現任 {partyShort(county.incumbentParty)}</div><div className="mt-1 text-xs text-ink-muted">{count} 筆民調情境</div></a>;
        })}
      </div>
    </section>
  );
}
