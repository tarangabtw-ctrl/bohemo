import { Poppins, Noto_Sans, IBM_Plex_Mono, Anek_Bangla, Noto_Sans_Devanagari, Noto_Sans_Bengali, Noto_Sans_Thai, Be_Vietnam_Pro } from 'next/font/google'

// Latin set, loaded on every page via the root layout.
export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800', '900'],
  variable: '--font-display',
  display: 'swap',
})

export const notoSans = Noto_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-body',
  display: 'swap',
})

export const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
})

// Script subsets. Import and apply `.variable` only on pages/segments that render that script —
// per CLAUDE.md, Devanagari/Bengali/Thai/Vietnamese load on demand, never globally.
export const anekBangla = Anek_Bangla({
  subsets: ['bengali'],
  weight: ['700', '800'],
  variable: '--font-display-bn',
  display: 'swap',
})

export const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body-hi',
  display: 'swap',
})

export const notoSansBengali = Noto_Sans_Bengali({
  subsets: ['bengali'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body-bn',
  display: 'swap',
})

export const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body-th',
  display: 'swap',
})

export const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese'],
  weight: ['500', '600', '700', '800', '900'],
  variable: '--font-display-vi',
  display: 'swap',
})
