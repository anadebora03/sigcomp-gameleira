/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}','./components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT:'#1a5c38', light:'#2d8f5e', dark:'#0d3d22', bg:'#f0f7f3', border:'#c3ddd0' },
        gold:      { DEFAULT:'#c9a227', dark:'#a07800', light:'#fef3c7' },
        navy:      { DEFAULT:'#0F1E3A', dark:'#0a1628', light:'#e8eef7' },
      },
      fontFamily: { sans: ['Inter','system-ui','sans-serif'] },
    },
  },
  plugins: [],
}
