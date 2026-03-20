import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: "var(--accent)",
        "accent-light": "var(--accent-light)",
        "accent-soft": "var(--accent-soft)",
        sage: "var(--sage)",
        "sage-light": "var(--sage-light)",
      },
      fontFamily: {
        heading: ["Syne", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        body: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      borderRadius: {
        z: "0.75rem",
        "z-lg": "1.25rem",
        "z-xl": "1.5rem",
      },
      boxShadow: {
        z: "0 4px 14px -2px rgb(0 0 0 / 0.06)",
        "z-hover": "0 12px 28px -4px rgb(0 0 0 / 0.1)",
      },
    },
  },
  plugins: [],
};
export default config;
