import { ImageResponse } from "next/og";

export const alt = "島嶼選情，2026 台灣九合一選舉觀察";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", background: "#08090A", color: "#F7F8F8", padding: "72px", fontFamily: "sans-serif" }}>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", border: "2px solid #25272B", borderRadius: 28, background: "#111214", padding: "64px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, color: "#F7F8F8", fontSize: 28, fontWeight: 700 }}><div style={{ width: 42, height: 42, borderRadius: 14, background: "#8584FF" }} />島嶼選情</div>
        <div style={{ display: "flex", flexDirection: "column" }}><div style={{ color: "#A9A8FF", fontSize: 25, fontWeight: 700 }}>2026 台灣九合一選舉觀察</div><div style={{ display: "flex", flexDirection: "column", marginTop: 18, fontSize: 62, lineHeight: 1.12, fontWeight: 750 }}><span>公開民調、縣市脈絡</span><span>與資料透明度</span></div><div style={{ marginTop: 24, color: "#8A8F98", fontSize: 24 }}>22 縣市 · 原始來源 · 自動核驗 · 不提供勝選預測</div></div>
      </div>
    </div>,
    size,
  );
}
