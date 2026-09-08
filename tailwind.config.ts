import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Linear Civic Dark：统一石墨底，以细微明度差建立资料层级
        canvas: "#0B0C0E",
        surface: "#121417",
        // 文字层级
        ink: "#F4F5F7",
        "ink-secondary": "#B1B5BD",
        "ink-muted": "#8D929B",
        brand: {
          DEFAULT: "#8584FF",
          strong: "#706FF2",
          soft: "#25243E",
          mist: "#171824",
        },
        // 边框与分隔线
        line: "#282B31",
        "line-strong": "#3A3E47",
        // 政党色（仅用于地图/图表/少量状态标记）
        party: {
          kmt: "#4D8FD1",
          dpp: "#35A86B",
          tpp: "#27B1C0",
          npp: "#E7B52D",
          ind: "#A0A6AF",
          tossup: "#737983",
        },
        // 状态
        danger: "#FF6B66",
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
      fontSize: {
        xs: ["0.8125rem", { lineHeight: "1.25rem" }],
      },
      borderRadius: {
        xl: "12px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0, 0, 0, 0.22)",
        "card-hover": "0 10px 30px rgba(0, 0, 0, 0.28)",
        drawer: "-12px 0 36px rgba(0, 0, 0, 0.42)",
      },
      maxWidth: {
        page: "1280px",
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
