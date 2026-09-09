import type { Metadata } from 'next';
import './globals.css';
import './search.css';
import { SiteHeader, SiteFooter } from '@/components/site-shell';
import { site } from '@/lib/site';
import { pageMetadata, siteStructuredData } from '@/lib/seo';
import { StructuredData } from '@/components/search-content';

export const metadata: Metadata = {
  ...pageMetadata(''),
  metadataBase: new URL(site.origin),
  applicationName: site.name,
  icons: { icon: '/favicon.svg' },
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : {}),
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
      </body>
    </html>
  );
}
