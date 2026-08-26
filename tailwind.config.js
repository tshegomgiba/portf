/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        mobile: "320px",
        tablet: "640px",
        laptop: "1024px",
        desktop: "1280px",
      },
      colors: {
        frost: {
          50: "#f2f7fb",
          100: "#e4eef6",
          200: "#c8dceb",
          300: "#9fc0d8",
          400: "#6a9cbc",
          500: "#4a7fa3",
          600: "#3a6586",
          700: "#31536e",
          800: "#2c465c",
          900: "#283c4e",
          950: "#1a2734",
        },
        ice: {
          DEFAULT: "#7ec8e3",
          soft: "#b8e0f0",
          deep: "#2d6a8f",
        },
      },
      fontFamily: {
        display: ['"Syne"', "system-ui", "sans-serif"],
        sans: ['"Outfit"', "system-ui", "sans-serif"],
      },
      animation: {
        "loop-scroll": "loop-scroll 70s linear infinite",
        "bounce-up-down": "bounceUpDown 3s infinite",
        "side-to-side": "SideToSide 7s infinite",
      },
      keyframes: {
        "loop-scroll": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-100%)" },
        },
        bounceUpDown: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        SideToSide: {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(-10px)" },
        },
      },
      backgroundImage: {
        hero1: "url('/src/images/pexels-stywo-1054218.jpg')",
        texture: "url('/src/images/bg-texture.png')",
        window: "url('/src/images/eran-menashri--JaaRZYHY0s-unsplash.jpg')",
      },
    },
  },
  plugins: [],
};
