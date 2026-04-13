/**
 * app/layout.tsx
 *
 * ルートレイアウト - AIFCC Modular Starter
 */

import type { Metadata } from 'next';
import { Noto_Sans_JP } from 'next/font/google';
import './globals.css';

const notoSansJP = Noto_Sans_JP({
  variable: '--font-noto-sans-jp',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

export const metadata: Metadata = {
  title: 'AIFCC Modular Starter',
  description: 'AIFCC Cockpit - Modular Starter',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <body>{children}</body>
    </html>
  );
}
