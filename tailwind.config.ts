import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#F0EDE6',
          dark: '#E8E4DC',
          mid: '#EBE7DF',
          pill: '#E3DFD7',
        },
        ink: '#0D0D0D',
        muted: '#6B6560',
        secondary: '#3D3A35',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      borderColor: {
        DEFAULT: 'rgba(13, 13, 13, 0.10)',
      },
    },
  },
  plugins: [],
}

export default config
