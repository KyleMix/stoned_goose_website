import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx,mdx}", "./components/**/*.{ts,tsx}", "./content/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0A0A0A",
        bone: "#EFE9DD",
        haze: {
          50: "#F6F1E6",
          100: "#E2DCCF",
          200: "#B9B2A4",
          300: "#7C7468",
          400: "#3F3A33",
          500: "#1F1C18",
        },
        hazard: "#F2EA00",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        display: "-0.04em",
        eyebrow: "0.28em",
      },
      maxWidth: {
        col: "70ch",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        drift: {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "50%": { transform: "translate(2%,-1%) scale(1.04)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
      animation: {
        marquee: "marquee 60s linear infinite",
        drift: "drift 22s ease-in-out infinite",
        scan: "scan 8s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
