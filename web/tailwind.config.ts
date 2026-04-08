import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sidebar: {
          bg: "#2C3345",
          text: "#8899AA",
          active: "#FFFFFF",
          hover: "#3A4558",
          accent: "#36B37E",
        },
        page: {
          bg: "#F0F2F5",
        },
        primary: {
          DEFAULT: "#36B37E",
          foreground: "#FFFFFF",
        },
        danger: "#E5493A",
        warning: "#FFAB00",
        info: "#0065FF",
      },
      fontFamily: {
        sans: ['"Open Sans"', "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
