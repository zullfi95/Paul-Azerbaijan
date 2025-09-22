/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "black-colour-paul": "var(--black-colour-paul)",
        "ivory-colour-paul": "var(--ivory-colour-paul)",
        "primary-1": "var(--primary-1)",
        "primary-2": "var(--primary-2)",
      },
    },
  },
  plugins: [],
};
