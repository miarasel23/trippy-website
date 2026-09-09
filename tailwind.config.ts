import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#070a12",
          surface: "#0e1424",
          card: "#11182b",
          "card-hover": "#192440",
          glass: "rgba(15, 23, 42, 0.75)",
          primary: "#10b981",
          "primary-light": "#34d399",
          "primary-dark": "#059669",
          secondary: "#06b6d4",
          "secondary-light": "#38bdf8",
          accent: "#f59e0b",
          danger: "#ef4444",
          muted: "#64748b",
          subtle: "#94a3b8",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Outfit", "sans-serif"],
        body: ["var(--font-body)", "Inter", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      boxShadow: {
        glow: "0 0 25px rgba(16, 185, 129, 0.35)",
        "glow-cyan": "0 0 25px rgba(6, 182, 212, 0.3)",
        card: "0 10px 30px rgba(0, 0, 0, 0.35)",
        modal: "0 20px 50px rgba(0, 0, 0, 0.5)",
      },
      borderRadius: {
        sm: "8px",
        md: "14px",
        lg: "20px",
        xl: "28px",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "radar-expand": "radarExpand 2s infinite",
      },
      keyframes: {
        radarExpand: {
          "0%": { transform: "scale(0.8)", opacity: "1" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
