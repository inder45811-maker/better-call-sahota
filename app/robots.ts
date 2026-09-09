import type { MetadataRoute } from 'next';
import { canIndexSite, canonicalUrl } from '@/lib/seo';
export default function robots(): MetadataRoute.Robots {
  const index = canIndexSite();
  const access = index ? { allow: '/', disallow: ['/api/'] } : { disallow: '/' };
  return {
    rules: [
      { userAgent: '*', ...access },
      { userAgent: 'OAI-SearchBot', ...access },
    ],
    ...(index ? { sitemap: canonicalUrl('sitemap.xml') } : {}),
  };
}
