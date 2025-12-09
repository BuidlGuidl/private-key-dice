/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./utils/**/*.{js,ts,jsx,tsx}"],
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("daisyui")],
  darkTheme: "dark",
  darkMode: ["selector", "[data-theme='dark']"],
  // DaisyUI theme colors
  daisyui: {
    themes: [
      {
        light: {
          primary: "#6366F1", // indigo
          "primary-content": "#0b1020",
          secondary: "#0F172A", // slate-900
          "secondary-content": "#E5E7EB",
          accent: "#22C55E", // emerald
          "accent-content": "#022C22",
          neutral: "#020617",
          "neutral-content": "#E5E7EB",
          "base-100": "#020617",
          "base-200": "#020617",
          "base-300": "#020617",
          "base-content": "#E5E7EB",
          info: "#38BDF8",
          success: "#22C55E",
          warning: "#FACC15",
          error: "#FB7185",

          "--rounded-btn": "9999rem",

          ".tooltip": {
            "--tooltip-tail": "6px",
          },
          ".link": {
            textUnderlineOffset: "2px",
          },
          ".link:hover": {
            opacity: "80%",
          },
        },
      },
      {
        dark: {
          primary: "#6366F1",
          "primary-content": "#0b1020",
          secondary: "#020617",
          "secondary-content": "#E5E7EB",
          accent: "#22C55E",
          "accent-content": "#022C22",
          neutral: "#020617",
          "neutral-content": "#E5E7EB",
          "base-100": "#020617",
          "base-200": "#020617",
          "base-300": "#020617",
          "base-content": "#E5E7EB",
          info: "#38BDF8",
          success: "#22C55E",
          warning: "#FACC15",
          error: "#FB7185",

          "--rounded-btn": "9999rem",

          ".tooltip": {
            "--tooltip-tail": "6px",
            "--tooltip-color": "oklch(var(--p))",
          },
          ".link": {
            textUnderlineOffset: "2px",
          },
          ".link:hover": {
            opacity: "80%",
          },
        },
      },
    ],
  },
  theme: {
    extend: {
      boxShadow: {
        center: "0 0 12px -2px rgb(0 0 0 / 0.05)",
        "glow-primary": "0 0 35px rgba(99, 102, 241, 0.8)",
        "glow-accent": "0 0 35px rgba(34, 197, 94, 0.8)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "tilt-shift": {
          "0%, 100%": { transform: "rotate(-1deg)" },
          "50%": { transform: "rotate(1deg)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: 0.8 },
          "50%": { opacity: 1 },
        },
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 3s ease-in-out infinite",
        "tilt-slow": "tilt-shift 6s ease-in-out infinite",
        "pulse-soft": "pulse-soft 2.5s ease-in-out infinite",
      },
    },
  },
};
