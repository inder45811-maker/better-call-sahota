import type { Metadata } from 'next';
import './globals.css';
import { SiteHeader, SiteFooter } from '@/components/site-shell';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: {
    default: 'Better Call Sim | Your wealth. Your family. Your legacy.',
    template: '%s | Better Call Sim',
  },
  description:
    'Bring financial advice, estate planning and property finance into one clear plan. Explore your options and book your Financial & Estate Review.',
  robots: { index: !site.preview, follow: !site.preview },
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <body className="antialiased">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
