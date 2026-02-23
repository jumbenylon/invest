import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sakura: {
          50: '#fff0f5',
          100: '#ffe0eb',
          200: '#ffb3cc',
          300: '#ff80aa',
          400: '#ff4d88',
          500: '#ff1a66',
          600: '#e6005c',
          700: '#b30048',
          800: '#800033',
          900: '#4d001f',
        },
        invest: {
          green: '#00b359',
          red: '#e63946',
          gold: '#f4a261',
          dark: '#0f1117',
          card: '#1a1d27',
          border: '#2a2d3a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
