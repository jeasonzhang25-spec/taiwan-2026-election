import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 页面背景：温暖米白 / 极浅灰
        canvas: "#F6F4EF",
        surface: "#FFFFFF",
        // 文字层级
        ink: "#1A1A1A",
        "ink-secondary": "#5F6470",
        "ink-muted": "#8A8F99",
        // 边框与分隔线
        line: "#E7E4DC",
        "line-strong": "#D8D4CA",
        // 政党色（仅用于地图/图表/少量状态标记）
        party: {
          kmt: "#2B6CB0",
          dpp: "#178A56",
          tpp: "#0E8FA0",
          npp: "#D19A0B",
          ind: "#8A9199",
          tossup: "#D5D1C8",
        },
        // 状态
        danger: "#B3261E",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "PingFang TC",
          "PingFang SC",
          "Noto Sans TC",
          "Microsoft JhengHei",
          "Heiti TC",
          "Segoe UI",
          "system-ui",
          "sans-serif",
        ],
        num: [
          "SF Mono",
          "JetBrains Mono",
          "Roboto Mono",
          "Cascadia Code",
          "ui-monospace",
          "Menlo",
          "monospace",
        ],
      },
      borderRadius: {
        xl: "12px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(26, 26, 26, 0.04), 0 1px 3px rgba(26, 26, 26, 0.05)",
        "card-hover": "0 2px 6px rgba(26, 26, 26, 0.06), 0 4px 14px rgba(26, 26, 26, 0.06)",
        drawer: "-12px 0 32px rgba(26, 26, 26, 0.12)",
      },
      maxWidth: {
        page: "1440px",
      },
      transitionDuration: {
        "150": "150ms",
        "200": "200ms",
        "250": "250ms",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out",
        "slide-up": "slide-up 200ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
