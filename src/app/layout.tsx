import type { Metadata } from "next";
import "./globals.css";
import WebVitalsReporter from "@/components/monitoring/WebVitalsReporter";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "島嶼選情 · 2026 台灣九合一選舉選情看板",
  description:
    "匯總公開民調、候選人動態與歷史選舉數據，觀察 22 個縣市的競爭態勢。",
  alternates: { canonical: "/" },
  openGraph: {
    title: "島嶼選情 · 2026 台灣九合一選舉觀察",
    description: "以可追溯來源整理 22 縣市公開民調、資料缺口與選情脈絡，不提供勝選預測。",
    type: "website",
    url: "/",
    siteName: "島嶼選情",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "島嶼選情",
          url: siteUrl,
          description: "2026 台灣地方選舉公開民調與資料透明度平台",
          inLanguage: "zh-Hant",
        }).replace(/</g, "\\u003c") }} />
        {children}
        <WebVitalsReporter />
      </body>
    </html>
  );
}
