import { Noto_Sans_JP } from 'next/font/google';

export const sans = Noto_Sans_JP({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-noto-sans',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
});
