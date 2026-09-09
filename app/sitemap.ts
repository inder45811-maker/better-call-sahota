import { canIndexSite, sitemapEntries } from '@/lib/seo';
export default function sitemap() {
  return canIndexSite() ? sitemapEntries() : [];
}
