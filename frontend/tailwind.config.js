/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'navy': '#1D1A39',
        'purple': '#1D1A39',
        'plum': '#662549',
        'rose': '#af445a',
        'amber': '#f59f59',
        'peach': '#e8bcb9',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-poppins)', 'sans-serif'],
        serif: ['var(--font-dm-serif)', 'serif'],
      },
    },
  },
  plugins: [],
}
