import { test, expect } from '@playwright/test';
import { pageCatalog, sitemapEntries } from '../../lib/seo';
import services from '../../lib/services.json' with { type: 'json' };
import { site } from '../../lib/site';
const meta = (html: string, name: string) =>
  html.match(new RegExp(`<meta[^>]+(?:name|property)="${name}"[^>]+content="([^"]*)"`))?.[1];
const jsonLd = (html: string) =>
  Array.from(
    html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
    (m) => JSON.parse(m[1]),
  );
test('every canonical page has unique search metadata and parseable, accurate structured data in server HTML', async ({
  request,
}) => {
  const titles = new Set<string>(),
    descriptions = new Set<string>();
  for (const entry of pageCatalog) {
    const route = '/' + entry.path;
    const response = await request.get(route);
    expect(response.status(), route).toBe(200);
    const html = await response.text();
    const title = html.match(/<title>(.*?)<\/title>/)?.[1];
    expect(title, route).toBeTruthy();
    expect(titles.has(title!), route + ' duplicate title').toBe(false);
    titles.add(title!);
    const description = meta(html, 'description');
    expect(description?.length, route).toBeGreaterThan(40);
    expect(descriptions.has(description!), route + ' duplicate description').toBe(false);
    descriptions.add(description!);
    expect(html, route).toContain(`rel="canonical" href="${site.origin}${route}"`);
    expect(meta(html, 'og:url'), route).toBe(site.origin + route);
    expect(meta(html, 'robots'), route).toContain('noindex');
    expect(meta(html, 'twitter:title'), route).toBeTruthy();
    const graphs = jsonLd(html);
    expect(graphs, route).toHaveLength(2);
    const nodes = graphs.flatMap((g) => g['@graph']);
    expect(
      nodes.some((n) => n['@type'] === 'Organization'),
      route,
    ).toBe(true);
    expect(
      nodes.some((n) => n['@id'] === site.origin + route + '#webpage'),
      route,
    ).toBe(true);
    expect(
      nodes.some((n) => n['@type'] === 'BreadcrumbList'),
      route,
    ).toBe(!!entry.path);
    expect(JSON.stringify(graphs), route).not.toMatch(
      /aggregateRating|hasCredential|streetAddress|priceRange/,
    );
    if (entry.kind === 'article') expect(nodes.some((n) => n['@type'] === 'Article')).toBe(true);
    if (entry.kind === 'service') {
      expect(nodes.some((n) => n['@type'] === 'Service')).toBe(true);
      const service = services.find((s) => s.pillar + '/' + s.slug === entry.path)!;
      for (const f of service.faqs)
        expect(html).toContain(f.a.replaceAll('&', '&amp;').replaceAll("'", '&#x27;'));
      expect(html).toContain('AT A GLANCE');
      expect(html).toContain('Further reading');
    }
  }
  expect(pageCatalog.filter((p) => p.kind === 'service')).toHaveLength(20);
});
test('preview crawl rules, canonical sitemap coverage, redirects and missing pages stay consistent', async ({
  request,
}) => {
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('User-Agent: OAI-SearchBot');
  expect(robots).toContain('Disallow: /');
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).not.toContain('<loc>');
  expect(
    sitemapEntries()
      .map((p) => new URL(p.url).pathname)
      .sort(),
  ).toEqual(pageCatalog.map((p) => '/' + p.path).sort());
  expect((await request.get('/videos', { maxRedirects: 0 })).status()).toBe(308);
  const missing = await request.get('/not-a-real-search-page');
  expect(missing.status()).toBe(404);
  expect(meta(await missing.text(), 'robots')).toContain('noindex');
});
