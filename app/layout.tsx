import type { Metadata } from 'next';
import { DM_Sans, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import {SiteHeader,SiteFooter} from '@/components/site-shell';

const bodyFont = DM_Sans({
  variable: '--font-body',
  subsets: ['latin'],
});

const displayFont = Cormorant_Garamond({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: { default: 'Better Call Sim | Your wealth. Your family. Your legacy.', template: '%s | Better Call Sim' },
  description: 'Bring financial advice, estate planning and property finance into one clear plan. Explore your options and book your Financial & Estate Review.',
  robots: { index: false, follow: false },
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <body
        className={`${bodyFont.variable} ${displayFont.variable} antialiased`}
      >
        <SiteHeader/>{children}<SiteFooter/>
      </body>
    </html>
  );
}
