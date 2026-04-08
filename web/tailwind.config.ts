import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sidebar: {
          bg: "#1a2635",
          text: "rgba(255,255,255,0.6)",
          active: "#ffffff",
          hover: "rgba(255,255,255,0.06)",
          "active-bg": "rgba(61,180,140,0.16)",
          accent: "#3db48c",
        },
        page: {
          bg: "#eef2f7",
        },
        primary: {
          DEFAULT: "#3db48c",
          dark: "#2d9974",
          foreground: "#FFFFFF",
        },
        danger: "#991b1b",
        "danger-bg": "#fee2e2",
        warning: "#92400e",
        "warning-bg": "#fef3c7",
        info: "#1e40af",
        "info-bg": "#dbeafe",
        "t1": "#1a202c",
        "t2": "#4a5568",
        "t3": "#a0aec0",
        border: "#e2e8f0",
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
