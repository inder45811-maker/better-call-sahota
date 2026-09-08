import { site } from '@/lib/site';
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      ...(site.preview ? { disallow: '/' } : { allow: '/', disallow: ['/api/'] }),
    },
    sitemap: site.origin + '/sitemap.xml',
  };
}
