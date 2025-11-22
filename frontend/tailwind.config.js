module.exports = {
  plugins: [
    require('@tailwindcss/container-queries'),
  ],
};
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0f1720",
        surface: "#111318",
        mutedSurface: "#0b0d10",
        text: "rgba(255,255,255,0.92)",
        muted: "rgba(255,255,255,0.65)",
        accent: "#4f7cff",
        accentHover: "#3b66f0",
        success: "#22c55e",
      },
      fontFamily: {
        sans: [
          "system-ui",
          "Avenir",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      borderRadius: {
        zero: "0px",
      }
    },
  },
  plugins: [],
};
