/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/**/*.{js,jsx}',
  ],
  theme: { /* ... all the shadcn theme settings ... */ },
  plugins: [require("tailwindcss-animate")],
}
