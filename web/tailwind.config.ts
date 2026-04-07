import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sidebar: {
          bg: "#1E1E2E",
          text: "#E2E8F0",
          active: "#FFFFFF",
          hover: "#2D2D42",
        },
        page: {
          bg: "#F4F6F8",
        },
        primary: {
          DEFAULT: "#22C55E",
          foreground: "#FFFFFF",
        },
        danger: "#EF4444",
        warning: "#F59E0B",
        info: "#3B82F6",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
