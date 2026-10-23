/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F6F5F1",
        ink: {
          DEFAULT: "#1B2430",
          soft: "#3D4552",
          muted: "#6B7280",
        },
        line: "#DEDBD2",
        signal: {
          50: "#EEF5F4",
          100: "#D7E8E5",
          300: "#7FB3AA",
          500: "#1F6F63",
          600: "#195A50",
          700: "#134640",
        },
        ochre: {
          100: "#F3E4CB",
          400: "#C97D3A",
          500: "#B9862E",
          600: "#96691F",
        },
        success: "#1F6F63",
        error: "#B3402A",
      },
      fontFamily: {
        serif: ["\"Source Serif 4\"", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "10px",
      },
      maxWidth: {
        prose: "68ch",
      },
    },
  },
  plugins: [],
};
