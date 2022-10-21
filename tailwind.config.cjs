/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./web/index.html", "./web/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      sans: ["Nunito", "sans-serif"],
      serif: ["serif"],
      mono: ["monospace"],
    },
    extend: {},
  },
  plugins: [],
};
