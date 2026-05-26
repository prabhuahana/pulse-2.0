import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-dm)", "system-ui", "sans-serif"],
        dyslexia: ["var(--font-opendyslexic)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        pulse: "20px",
        "pulse-lg": "24px",
      },
      boxShadow: {
        soft: "0 8px 32px rgb(0 0 0 / 6%)",
        glow: "0 0 40px var(--accent-glow)",
      },
      animation: {
        "fade-up": "fadeUp 0.4s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
