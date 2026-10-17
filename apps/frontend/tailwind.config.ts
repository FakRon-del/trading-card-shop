import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue:        '#2563EB',
          'blue-hover':'#1D4ED8',
          'blue-light':'#EFF4FF',
          'blue-border':'#DBEAFE',
          green:       '#16A34A',
          'green-light':'#DCFCE7',
        }
      }
    },
  },
  plugins: [],
}

export default config