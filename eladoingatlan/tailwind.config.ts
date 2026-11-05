import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#f7f1e6",
        foreground: "#241f18",
      },
      fontFamily: {
        sans: ['"Source Serif 4"', "Georgia", "ui-serif", "serif"],
        display: ['"Fraunces"', "Georgia", "ui-serif", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
