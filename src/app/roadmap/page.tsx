import type { Metadata } from "next";
import InfoPageHeader from "@/components/layout/InfoPageHeader";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "完善清單與發展路線｜島嶼選情",
  description: "島嶼選情網站的已完成項目、近期優化清單與長期發展設想。",
};

const groups = [
  {
    eyebrow: "現在可用",
    title: "資料基礎與閱讀體驗",
    tone: "green",
    items: [
      ["全量公開民調檔案", "收錄 18 個縣市、286 筆問卷情境，原始來源可逐筆開啟。"],
      ["資料分類", "公開發布、政黨內參、黨內初選分開標示，不混成單一平均。"],
      ["縣市聯動", "地圖、列表、趨勢圖與縣市詳情可互相切換，手機版可完整操作。"],
      ["資料邊界", "人名標示為民調選項，不冒充中選會正式登記候選人。"],
    ],
  },
  {
    eyebrow: "本階段完成",
    title: "可靠性與透明度",
    tone: "blue",
    items: [
      ["自動同步工作流", "每 30 分鐘檢查新民調；程式已備妥，上傳 GitHub 並啟用 Actions 後生效。"],
      ["發布前驗證", "資料異常縮水、日期或百分比錯誤、來源遺失時阻擋更新。"],
      ["資料健康頁", "公開覆蓋範圍、來源類型、缺少欄位、最近檢查時間與空白縣市。"],
      ["更正紀錄", "重要新增與修正留下時間、原因和影響範圍。"],
    ],
  },
  {
    eyebrow: "最新完成",
    title: "六都深度頁與追蹤工具",
    tone: "blue",
    items: [
      ["六都獨立頁", "台北、新北、桃園、台中、台南、高雄已有可分享網址與完整資料入口。"],
      ["民調比較器", "可按人選、來源類型、發布來源、題目情境和日期範圍逐筆比較。"],
      ["政見資料框架", "先公開登記狀態與比較維度；正式資料發布後才逐項填入，不用民調人名冒充候選人。"],
      ["來源訂閱與提醒", "提供縣市／指定來源 RSS，以及不蒐集個資的瀏覽器本機追蹤。"],
    ],
  },
  {
    eyebrow: "下一步",
    title: "擴充其餘縣市與正式選務資料",
    tone: "amber",
    items: [
      ["其餘 16 縣市獨立頁", "沿用六都模板，依資料量逐步開放可分享的地方專頁。"],
      ["正式候選人同步", "登記與審定後串接中選會名冊，保留民調選項與正式候選人的差異。"],
      ["正式政見版本", "依選舉公報與候選人一手來源建立同題比較、版本日期與原文連結。"],
      ["真正背景推播", "若後續建立會員與通知服務，再提供 Email 或 Web Push；目前不蒐集聯絡資料。"],
    ],
  },
  {
    eyebrow: "中長期設想",
    title: "完整九合一與選舉夜模式",
    tone: "gray",
    items: [
      ["議員與基層選舉", "擴充縣市議員、鄉鎮市長與村里長，先從資料格式穩定的縣市開始。"],
      ["議題與事實查核", "整理交通、住宅、育兒等共同題目，連結官方預算與可信查核來源。"],
      ["歷史選舉探索", "比較投票率、得票變化與行政區翻轉，不用單一色塊簡化地方差異。"],
      ["開票夜即時頁", "採中選會正式資料、更新延遲提示、異常備援與高流量架構。"],
    ],
  },
] as const;

const toneStyles = {
  green: "bg-[#E8F5EE] text-[#126B43]",
  blue: "bg-[#EAF2FA] text-[#245D91]",
  amber: "bg-[#FBF1E2] text-[#8A5D0A]",
  gray: "bg-[#EEEDE9] text-[#5F6470]",
};

export default function RoadmapPage() {
  return (
    <>
      <InfoPageHeader />
      <main id="main-content" className="mx-auto max-w-page px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-ink-secondary shadow-card">公開產品路線圖</span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">完善清單與發展前景</h1>
          <p className="mt-3 text-base leading-7 text-ink-secondary">先把資料可信、來源可追、手機好用打穩，再擴展縣市專頁、民調比較和政見工具。複雜功能採獨立頁面，首頁只保留最重要的全台脈絡。</p>
        </div>

        <div className="mt-9 grid gap-5 lg:grid-cols-2">
          {groups.map((group) => (
            <section key={group.title} className="rounded-xl border border-line bg-surface p-5 shadow-card sm:p-6">
              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${toneStyles[group.tone]}`}>{group.eyebrow}</span>
              <h2 className="mt-3 text-xl font-semibold text-ink">{group.title}</h2>
              <div className="mt-5 space-y-4">
                {group.items.map(([title, detail]) => (
                  <article key={title} className="border-l-2 border-line-strong pl-4">
                    <h3 className="text-sm font-semibold text-ink">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-ink-secondary">{detail}</p>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-8 rounded-xl bg-ink p-6 text-white sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-8">
          <div><h2 className="text-xl font-semibold">六都模板已可用，下一步擴至其餘 16 縣市</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">先依資料覆蓋與讀者需求排序，再接入正式候選人名冊與選舉公報，避免空頁面先於可靠資料上線。</p></div>
          <a href="/county/taipei" className="mt-5 inline-flex shrink-0 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-ink sm:mt-0">查看六都專頁</a>
        </section>
      </main>
      <Footer />
    </>
  );
}
