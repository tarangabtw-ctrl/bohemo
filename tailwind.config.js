/** @type {import('tailwindcss').Config} */
// v2 design tokens, from the Claude Design handoff bundle
// (design-handoff/bohemo-design-system/project/tokens/*.css). Do not hand-type
// colours, type sizes or radii in components — extend this file instead.
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: { 900: '#1F2120', 700: '#3A3733', 600: '#5E5852' },
        paper: { 0: '#FFFFFF', 50: '#FAF7F1' },
        cream: { 100: '#F2EEE5', 200: '#EEEAE0', 300: '#E5DFD2' },
        sand: { 300: '#D9CFBC', 400: '#C7B79C' },
        kraft: { 500: '#A89070' },
        umber: { 600: '#8A7860' },
        walnut: { 700: '#6B4B2E', 800: '#4E3621' },
        moss: { 700: '#345C36', 100: '#DDE4D0' },
        ochre: { 700: '#7A5A12', 100: '#EFE0B6' },
        slate: { 700: '#2F465B', 100: '#DAE0E3' },
        madder: { 700: '#631F18', 100: '#F0DAD3' },

        // Semantic aliases — prefer these in components.
        surface: {
          page: '#F2EEE5',
          raised: '#FAF7F1',
          inset: '#E5DFD2',
          overlay: '#FFFFFF',
          inverse: '#1F2120',
        },
        text: {
          strong: '#1F2120',
          body: '#1F2120',
          muted: '#5E5852',
          inverse: '#EEEAE0',
          link: '#6B4B2E',
          'link-hover': '#4E3621',
        },
        border: {
          hairline: '#D9CFBC',
          soft: '#C7B79C',
          strong: '#8A7860',
          ink: '#1F2120',
        },
        fill: {
          tag: '#E5DFD2',
          'tag-brown': '#D9CFBC',
          data: '#A89070',
          'data-track': '#D9CFBC',
          skeleton: '#D9CFBC',
        },
        action: {
          'primary-bg': '#1F2120',
          'primary-bg-hover': '#3A3733',
          'primary-fg': '#EEEAE0',
          'secondary-bg': '#FAF7F1',
          'secondary-border': '#1F2120',
          'ghost-hover': '#E5DFD2',
        },
        focus: { ring: '#6B4B2E', 'ring-inverse': '#EEEAE0' },
        positive: { DEFAULT: '#345C36', soft: '#DDE4D0', 'on-ink': '#B5D3A6' },
        warning: { DEFAULT: '#7A5A12', soft: '#EFE0B6' },
        info: { DEFAULT: '#2F465B', soft: '#DAE0E3' },
        negative: { DEFAULT: '#631F18', soft: '#F0DAD3', 'on-ink': '#D98170' },
        'flat-on-ink': '#C7B79C',
        mark: { filled: '#1F2120', 'filled-soft': '#8A7860', empty: '#8A7860' },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'Noto Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        'display-bn': ['var(--font-display-bn)', 'Anek Bangla', 'var(--font-body-bn)', 'sans-serif'],
        'display-vi': ['var(--font-display-vi)', 'Be Vietnam Pro', 'var(--font-body)', 'sans-serif'],
        'body-hi': ['var(--font-body-hi)', 'Noto Sans Devanagari', 'var(--font-body)', 'sans-serif'],
        'body-bn': ['var(--font-body-bn)', 'Noto Sans Bengali', 'var(--font-body)', 'sans-serif'],
        'body-th': ['var(--font-body-th)', 'Noto Sans Thai', 'var(--font-body)', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['clamp(40px, 4.6vw + 22px, 76px)', { lineHeight: '0.98', letterSpacing: '-0.035em' }],
        'display-l': ['clamp(34px, 3vw + 22px, 56px)', { lineHeight: '1.02', letterSpacing: '-0.035em' }],
        'display-m': ['clamp(28px, 1.8vw + 21px, 40px)', { lineHeight: '1.08', letterSpacing: '-0.035em' }],
        'title-1': ['clamp(24px, 0.9vw + 20px, 30px)', { lineHeight: '1.18', letterSpacing: '-0.02em' }],
        'title-2': ['clamp(20px, 0.5vw + 18px, 23px)', { lineHeight: '1.25', letterSpacing: '-0.02em' }],
        'title-3': ['18px', { lineHeight: '1.32', letterSpacing: '-0.01em' }],
        'body-lg': ['18px', { lineHeight: '1.65' }],
        body: ['16px', { lineHeight: '1.55' }],
        'body-sm': ['14px', { lineHeight: '1.5' }],
        label: ['12px', { lineHeight: '1.3', letterSpacing: '0.06em' }],
        'data-lg': ['20px', { lineHeight: '1.2' }],
        data: ['14px', { lineHeight: '1.2' }],
        'data-sm': ['12px', { lineHeight: '1.2' }],
      },
      letterSpacing: {
        display: '-0.035em',
        title: '-0.02em',
        label: '0.06em',
      },
      borderRadius: {
        xs: '6px',
        sm: '10px',
        md: '14px',
        lg: '20px',
        xl: '28px',
        pill: '9999px',
      },
      borderWidth: {
        hairline: '1px', // --border-1: card, nav and footer rules
        thin: '1.5px', // --border-2: button, tag, input, chip borders
        thick: '2px', // --border-3: focus-adjacent emphasis, input focus border
        heavy: '3px', // --rule-heavy: section rules, scrolled nav, focus ring width
      },
      maxWidth: {
        container: '1200px',
        'container-read': '680px',
      },
      spacing: {
        'nav-h': '64px',
        'tabbar-h': '64px',
        'hit-min': '44px',
      },
      outlineWidth: {
        thick: '2px', // --border-3, the focus ring width
      },
      boxShadow: {
        overlay: '0 1px 0 rgba(31,33,32,0.06), 0 10px 28px -8px rgba(31,33,32,0.22)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
      },
      transitionDuration: {
        fast: '120ms',
        base: '180ms',
        slow: '320ms',
      },
    },
  },
  plugins: [],
}
