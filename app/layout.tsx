import type { Metadata } from 'next';
import './globals.css';
import './search.css';
import './heritage.css';
import { SiteHeader, SiteFooter } from '@/components/site-shell';
import { site } from '@/lib/site';
import { pageMetadata, siteStructuredData } from '@/lib/seo';
import { StructuredData } from '@/components/search-content';
import { SiteAnalytics } from '@/components/site-analytics';

const googleVerification = [
  process.env.GOOGLE_SITE_VERIFICATION,
  process.env.GOOGLE_SITE_VERIFICATION_ADDITIONAL,
].filter((value): value is string => Boolean(value));

export const metadata: Metadata = {
  ...pageMetadata(''),
  metadataBase: new URL(site.origin),
  applicationName: site.name,
  icons: { icon: '/favicon.svg' },
  verification: {
    ...(googleVerification.length ? { google: googleVerification } : {}),
    ...(process.env.BING_SITE_VERIFICATION
      ? { other: { 'msvalidate.01': process.env.BING_SITE_VERIFICATION } }
      : {}),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <body className="antialiased">
        <StructuredData value={siteStructuredData()} />
        <SiteHeader />
        {children}
        <SiteFooter />
        <SiteAnalytics />
      </body>
    </html>
  );
}
