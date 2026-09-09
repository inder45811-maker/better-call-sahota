import type { Metadata, MetadataRoute } from 'next';
import services from './services.json';
import { articles, stories } from './editorial';
import { legalPages } from './legal';
import { site, pillars, homeFaqs } from './site';
import { CONTENT_UPDATED, serviceAnswers, hubAnswers } from './search-content';
import { mayIndex } from './search-policy';

type Page = {
  path: string;
  title: string;
  description: string;
  label: string;
  kind: 'page' | 'collection' | 'service' | 'article' | 'about' | 'contact';
  parent?: string;
  updated?: string;
};
const fixed: Page[] = [
  {
    path: '',
    label: 'Home',
    title: 'Estate & Financial Planning in Northolt, West London',
    description:
      'Better Call Sim is based in Northolt, West London. Explore estate planning, financial advice and property finance, and book your Financial & Estate Review.',
    kind: 'page',
  },
  {
    path: 'the-plan',
    label: 'The Plan',
    title: 'Build, Grow, Protect & Pass On',
    description:
      'See how Better Call Sim connects your home, finances, protection and legacy through four planning stages and a Financial & Estate Review.',
    kind: 'page',
  },
  {
    path: 'meet-sim',
    label: 'Meet Sim',
    title: 'Meet Simran Sahota in Northolt, West London',
    description:
      'Meet Northolt-based Simran Sahota, the person behind Better Call Sim, and his approach to connecting your financial, property and estate plans.',
    kind: 'about',
  },
  {
    path: 'book-review',
    label: 'Book a review',
    title: 'Book Your Financial & Estate Review',
    description:
      'Start a conversation about your wealth, family and future. Request a Financial & Estate Review or choose a time through Sim’s booking calendar.',
    kind: 'page',
  },
  {
    path: 'contact',
    label: 'Contact',
    title: 'Contact Sim in Northolt, West London',
    description:
      'Contact Northolt-based Better Call Sim by telephone, WhatsApp or review request. Ask about estate planning, financial advice and property finance.',
    kind: 'contact',
  },
  {
    path: 'iht-calculator',
    label: 'Inheritance Tax Calculator',
    title: 'Inheritance Tax Calculator & Report',
    description:
      'Explore an illustrative UK inheritance tax estimate for supported 2026/27 scenarios. Request a report with your inputs, allowances and assumptions.',
    kind: 'page',
    updated: CONTENT_UPDATED,
  },
  {
    path: 'insights',
    label: 'Insights & videos',
    title: 'Estate, Pension & Mortgage Guides',
    description:
      'Explore Better Call Sim’s educational guides on wills, LPAs, pensions and mortgages, with links to Sim’s posts and videos.',
    kind: 'collection',
  },
  {
    path: 'case-studies',
    label: 'Planning scenarios',
    title: 'Family, Retirement & Business Planning Scenarios',
    description:
      'Explore hypothetical family, retirement and business planning scenarios. See how connected decisions fit together, without promised client outcomes.',
    kind: 'collection',
  },
];
const hubDescriptions: Record<string, string> = {
  'estate-planning':
    'Explore wills, trusts, LPAs, inheritance tax, bloodline protection, business succession and care planning. Start your estate planning conversation.',
  'financial-advice':
    'Explore investments, pensions, ISAs, investment bonds and personal or business protection. Connect your financial questions with your wider plan.',
  'property-finance':
    'Explore mortgages, remortgages, buy-to-let, bridging, second charges and equity release. Understand the questions for your property finance review.',
};
export const pageCatalog: Page[] = [
  ...fixed,
  ...pillars.map((p) => ({
    path: p.slug,
    label: p.title,
    title: p.title,
    description: hubDescriptions[p.slug],
    kind: 'collection' as const,
    updated: CONTENT_UPDATED,
  })),
  ...services.map((s) => ({
    path: s.pillar + '/' + s.slug,
    label: s.title,
    title: s.title === 'Wills' ? 'Wills & Will Planning' : s.title,
    description: s.description,
    kind: 'service' as const,
    parent: s.pillar,
    updated: CONTENT_UPDATED,
  })),
  ...articles.map((a) => ({
    path: 'insights/' + a.slug,
    label: a.title,
    title: a.title,
    description: a.description,
    kind: 'article' as const,
    parent: 'insights',
    updated: CONTENT_UPDATED,
  })),
  ...stories.map((s) => ({
    path: 'case-studies/' + s.slug,
    label: s.title,
    title: s.title,
    description: 'Illustrative scenario: ' + s.description,
    kind: 'page' as const,
    parent: 'case-studies',
  })),
  ...Object.entries(legalPages).map(([path, p]) => ({
    path,
    label:
      (
        {
          privacy: 'Privacy',
          cookies: 'Cookies',
          terms: 'Terms',
          complaints: 'Complaints',
          accessibility: 'Accessibility',
          'regulatory-information': 'Regulatory information',
        } as Record<string, string>
      )[path] || p.title,
    title:
      (
        {
          privacy: 'Privacy Notice',
          cookies: 'Cookie Information',
          terms: 'Website Terms',
          complaints: 'Complaints Information',
          accessibility: 'Accessibility Statement',
          'regulatory-information': 'Regulatory Information & Service Providers',
        } as Record<string, string>
      )[path] || p.title,
    description: p.intro,
    kind: 'page' as const,
  })),
];
export const getPage = (path: string) => pageCatalog.find((p) => p.path === path);
export const canonicalUrl = (path = '') => site.origin + (path ? '/' + path : '/');
export const canIndexSite = () => mayIndex(site.preview, process.env.VERCEL_ENV);
export function pageMetadata(path: string): Metadata {
  const page = getPage(path);
  if (!page)
    return {
      title: 'Page not found',
      alternates: { canonical: null },
      robots: { index: false, follow: false },
    };
  const title = page.title + ' | ' + site.name;
  const index = canIndexSite();
  return {
    title: { absolute: title },
    description: page.description,
    alternates: { canonical: canonicalUrl(path) },
    robots: {
      index,
      follow: index,
      googleBot: {
        index,
        follow: index,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      title,
      description: page.description,
      url: canonicalUrl(path),
      siteName: site.name,
      locale: 'en_GB',
      type: page.kind === 'article' ? 'article' : 'website',
      ...(page.kind === 'article'
        ? { publishedTime: '2026-09-08', modifiedTime: page.updated }
        : {}),
    },
    twitter: { card: 'summary', title, description: page.description },
  };
}
export function siteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': canonicalUrl() + '#organization',
        name: site.name,
        url: canonicalUrl(),
        logo: canonicalUrl('brand/better-call-sim-logo.png'),
        telephone: site.phone,
        sameAs: [site.instagram],
        location: { '@type': 'Place', name: site.location },
      },
      {
        '@type': 'WebSite',
        '@id': canonicalUrl() + '#website',
        name: site.name,
        url: canonicalUrl(),
        inLanguage: 'en-GB',
        publisher: { '@id': canonicalUrl() + '#organization' },
      },
    ],
  };
}
export function pageStructuredData(path: string) {
  const page = getPage(path);
  if (!page) return null;
  const url = canonicalUrl(path),
    organisation = { '@id': canonicalUrl() + '#organization' };
  const type =
    (
      { about: 'AboutPage', contact: 'ContactPage', collection: 'CollectionPage' } as Record<
        string,
        string
      >
    )[page.kind] || 'WebPage';
  const node: Record<string, unknown> = {
    '@type': type,
    '@id': url + '#webpage',
    url,
    name: page.label,
    description: page.description,
    inLanguage: 'en-GB',
    isPartOf: { '@id': canonicalUrl() + '#website' },
    publisher: organisation,
  };
  const graph: Record<string, unknown>[] = [node];
  if (path) {
    const crumbs = [getPage('')!, ...(page.parent ? [getPage(page.parent)!] : []), page];
    node.breadcrumb = { '@id': url + '#breadcrumbs' };
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': url + '#breadcrumbs',
      itemListElement: crumbs.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: p.label,
        item: canonicalUrl(p.path),
      })),
    });
  }
  const service = services.find((s) => s.pillar + '/' + s.slug === path);
  const article = articles.find((a) => 'insights/' + a.slug === path);
  const faqs = path === '' ? homeFaqs : service?.faqs;
  if (service) {
    node.mainEntity = { '@id': url + '#service' };
    graph.push({
      '@type': 'Service',
      '@id': url + '#service',
      name: service.title,
      serviceType: service.title,
      description: serviceAnswers[service.slug].answer,
      url,
    });
    node.citation = serviceAnswers[service.slug].sources.map((s) => s.url);
  }
  if (hubAnswers[path]) node.citation = hubAnswers[path].sources.map((s) => s.url);
  if (faqs)
    node.hasPart = faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    }));
  if (article) {
    node.mainEntity = { '@id': url + '#article' };
    graph.push({
      '@type': 'Article',
      '@id': url + '#article',
      headline: article.title,
      description: article.description,
      mainEntityOfPage: { '@id': url + '#webpage' },
      author: organisation,
      publisher: organisation,
      datePublished: '2026-09-08',
      dateModified: page.updated,
      inLanguage: 'en-GB',
      citation: article.source,
      articleSection: article.category,
    });
  }
  if (path === 'meet-sim') {
    node.mainEntity = { '@id': url + '#simran-sahota' };
    graph.push({
      '@type': 'Person',
      '@id': url + '#simran-sahota',
      name: site.adviser,
      url,
      description: 'The person behind Better Call Sim.',
      worksFor: organisation,
    });
  }
  if (page.kind === 'collection') {
    const children = pageCatalog.filter((p) => p.parent === path);
    if (children.length)
      node.mainEntity = {
        '@type': 'ItemList',
        itemListElement: children.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: p.label,
          url: canonicalUrl(p.path),
        })),
      };
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}
export function sitemapEntries(): MetadataRoute.Sitemap {
  return pageCatalog.map((p) => ({
    url: canonicalUrl(p.path),
    ...(p.updated ? { lastModified: p.updated } : {}),
  }));
}
