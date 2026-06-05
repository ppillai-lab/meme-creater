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
        bjp: '#FF6B00',
        dmk: '#E01B24',
        tvk: '#C0392B',
        aiadmk: '#1E8BC3',
        mnm: '#8E44AD',
      },
      fontFamily: {
        impact: ['Impact', 'Arial Black', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
