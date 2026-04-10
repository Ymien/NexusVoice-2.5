/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "var(--bg-base)",
        panel: "var(--bg-panel)",
        main: "var(--text-main)",
        muted: "var(--text-muted)",
        primary: "var(--primary)",
        "primary-hover": "var(--primary-hover)",
        "on-primary": "var(--text-on-primary)",
        border: "var(--border-color)",
      },
      borderRadius: {
        panel: "var(--radius-panel)",
        btn: "var(--radius-button)",
      },
      boxShadow: {
        panel: "var(--shadow-panel)",
      },
      borderWidth: {
        panel: "var(--border-panel)",
      }
    },
  },
  plugins: [],
};
