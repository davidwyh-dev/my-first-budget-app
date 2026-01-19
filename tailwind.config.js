/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0f0f0f',
        surface: '#1a1a1a',
        'surface-hover': '#222222',
        border: '#2a2a2a',
        'text-primary': '#f5f5f5',
        'text-secondary': '#a0a0a0',
        accent: '#d4a373',
        'accent-hover': '#e5b384',
        success: '#4ade80',
        danger: '#f87171',
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body: ['Lora', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.25)',
        'soft-lg': '0 8px 30px rgba(0, 0, 0, 0.3)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
