/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7ff",
          100: "#d9ecff",
          500: "#1f7aec",
          600: "#1468d4",
          700: "#0f54aa",
          900: "#0f1d37"
        }
      },
      fontFamily: {
        sans: ["Manrope", "sans-serif"]
      },
      boxShadow: {
        soft: "0 24px 60px rgba(15, 29, 55, 0.12)"
      },
      keyframes: {
        floatIn: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        floatIn: "floatIn 0.45s ease-out"
      }
    }
  },
  plugins: []
};
