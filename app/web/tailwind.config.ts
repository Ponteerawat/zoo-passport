import type { Config } from "tailwindcss";

// Design tokens ยกมาจากธีมเดิม (app/web/*/style.css) — คงสี/ฟอนต์เดิม
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#f6f1e6",
        forest: { DEFAULT: "#386641", dark: "#1f3d1a" },
        leaf: { DEFAULT: "#5a9c3f", light: "#7fc957" },
        wood: { DEFAULT: "#6b4423", dark: "#4a2e17" },
        gold: { DEFAULT: "#f0a336", dark: "#d9862a" },
        ink: "#2c2418",
        muted: { DEFAULT: "#9a9384", bg: "#e3ded2" },
      },
      fontFamily: {
        display: ["var(--font-baloo)", "var(--font-kanit)", "sans-serif"],
        body: ["var(--font-nunito)", "var(--font-noto-thai)", "sans-serif"],
      },
      boxShadow: {
        card: "0 10px 30px rgba(31,61,26,0.15)",
      },
    },
  },
  plugins: [],
} satisfies Config;
