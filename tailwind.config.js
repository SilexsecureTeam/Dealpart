// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4EA674",
        secondary: "#023337",
        accent: "#C1E6BA",
        "accent-light": "#EAF8E7",
        success: "#21C45D",
        error: "#F43443",
        grey: "#7C7C7C",
      },
      boxShadow: {
        card: "0 4px 12px rgba(0, 0, 0, 0.08)",
        ambient: "0 6px 16px rgba(0, 0, 0, 0.10)",
        "ambient-lg": "0 12px 24px rgba(0, 0, 0, 0.12)",
      },
    },
  },
  plugins: [],
};