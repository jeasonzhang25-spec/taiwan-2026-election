import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "島嶼選情 · 2026 台灣九合一選舉選情看板",
  description:
    "匯總公開民調、候選人動態與歷史選舉數據，觀察 22 個縣市的競爭態勢。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
