/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
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
        }
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}
