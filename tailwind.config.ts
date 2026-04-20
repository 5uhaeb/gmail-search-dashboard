import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        ink: "var(--ink)",
        "ink-mute": "var(--ink-mute)",
        accent: {
          red: "var(--red)",
          blue: "var(--blue)",
          yellow: "var(--yellow)",
          green: "var(--green)",
        },
      },
      boxShadow: {
        cartoon: "5px 5px 0 0 var(--ink)",
        "cartoon-sm": "2px 2px 0 0 var(--ink)",
        "cartoon-md": "4px 4px 0 0 var(--ink)",
        "cartoon-lg": "6px 6px 0 0 var(--ink)",
        "cartoon-pressed": "1px 1px 0 0 var(--ink)",
      },
      borderWidth: {
        cartoon: "2.5px",
        "cartoon-thin": "2px",
      },
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
