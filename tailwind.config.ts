import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        titan: {
          black: "#050505",
          charcoal: "#101010",
          ink: "#18130a",
          gold: "#d7ad4f",
          bright: "#f4d37b",
          muted: "#9f8650",
          ivory: "#f7f1df"
        }
      },
      boxShadow: {
        gold: "0 24px 80px rgba(215, 173, 79, 0.18)",
        panel: "0 20px 60px rgba(0, 0, 0, 0.45)"
      }
    }
  },
  plugins: []
};

export default config;
