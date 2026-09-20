import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#ffffff",
          surface: "#f8fafc",
          card: "#ffffff",
          "card-hover": "#f1f5f9",
          glass: "rgba(255, 255, 255, 0.92)",
          // System Primary: Light Green
          primary: "#22c55e",
          "primary-light": "#16a34a",
          "primary-dark": "#15803d",
          // Remap secondary to light green for global consistency
          secondary: "#16a34a",
          "secondary-light": "#22c55e",
          // Warning: Yellow
          warning: "#eab308",
          "warning-light": "#ca8a04",
          "warning-dark": "#a16207",
          accent: "#eab308",
          // Danger / Alert: Red
          danger: "#ef4444",
          "danger-light": "#dc2626",
          "danger-dark": "#b91c1c",
          // Base Monochrome
          black: "#000000",
          white: "#ffffff",
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
        glow: "0 0 25px rgba(34, 197, 94, 0.35)",
        "glow-lg": "0 0 45px rgba(34, 197, 94, 0.5)",
        "glow-warning": "0 0 25px rgba(234, 179, 8, 0.35)",
        "glow-danger": "0 0 25px rgba(239, 68, 68, 0.35)",
        card: "0 10px 30px rgba(0, 0, 0, 0.45)",
        modal: "0 20px 50px rgba(0, 0, 0, 0.6)",
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
        "city-scroll": "cityScroll 35s linear infinite",
        "city-scroll-slow": "cityScroll 60s linear infinite",
        "wheel-spin": "wheelSpin 0.6s linear infinite",
        "car-bounce": "carBounce 1.2s ease-in-out infinite",
        "road-move": "roadMove 0.8s linear infinite",
      },
      keyframes: {
        radarExpand: {
          "0%": { transform: "scale(0.8)", opacity: "1" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        cityScroll: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        wheelSpin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        carBounce: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-1.5px)" },
        },
        roadMove: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-40px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
