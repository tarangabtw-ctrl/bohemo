/** @type {import('tailwindcss').Config} */
// v2: brand tokens removed. New design system tokens go in theme.extend.
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
