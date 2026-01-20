/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#e53935',
          light: '#ee3b41',
          dark: '#d32f2f',
          darker: '#b71c1c',
        },
        secondary: {
          DEFAULT: '#ffffff',
        },
      },
    },
  },
  plugins: [],
}