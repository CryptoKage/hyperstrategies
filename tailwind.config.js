/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx}", // Scan all your components
  ],
  theme: {
    extend: {
      // This tells Tailwind how to map shadcn's color names
      // to YOUR existing CSS variables from global.css
      colors: {
        border: 'var(--color-border)',
        background: 'var(--color-background)',
        foreground: 'var(--color-text-primary)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          foreground: 'var(--color-background)',
        },
        secondary: {
          DEFAULT: 'var(--color-surface)',
          foreground: 'var(--color-text-primary)',
        },
        card: {
          DEFAULT: 'var(--color-surface)',
          foreground: 'var(--color-text-primary)',
        },
        muted: {
          foreground: 'var(--color-text-secondary)',
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
