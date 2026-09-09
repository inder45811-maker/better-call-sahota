# Search, generative and answer engine readiness

Implemented 9 September 2026. Northolt, West London is the base supplied by the client. No street address, public office, opening hours, broader service area or professional credentials have been assumed.

## Across the site

- A single catalogue covers 43 canonical pages: home, hubs, all 20 services, adviser and contact pages, the review and calculator journeys, guides, hypothetical scenarios and policies. Each has a distinct title and description, a self-canonical URL and matching Open Graph/Twitter text metadata. No new social image was generated.
- Organization and WebSite JSON-LD identify the brand, supplied telephone, Instagram profile and location. Page-specific WebPage, BreadcrumbList, Service, Article, collection and Person entities describe the visible content. Unknown regulated providers and credentials are omitted. Questions and answers match the visible FAQs; no ratings or client outcomes are invented.
- Each service has a concise explanation and primary-source further reading. Hubs and the calculator explain scope in text. Article summaries, contents links, publisher and actual update dates make guides easier to navigate and assess. “Updated” is not presented as a qualified professional review.
- Pages are rendered on the server and the main content pages are pre-rendered. FAQ answers remain in the initial HTML, with accessible expand/collapse controls. Structured data safely escapes script-closing text.
- `/videos` redirects permanently to the combined insights page. The sitemap uses the canonical catalogue and only real content update dates. APIs retain noindex headers and private submissions never enter metadata, schema or sitemap entries.

## Indexing and launch

The review site deliberately remains **noindex** and disallows crawlers. Its sitemap is empty. The code is ready for discoverability after public launch; the private preview itself is not intended to rank or appear in AI answers.

Before launch, set the real `NEXT_PUBLIC_SITE_URL`, verify the factual business and regulatory information, connect the live services and change `site.preview` only after launch approval. Vercel preview deployments remain noindex even when the production site is live. Deployment protection provides access control; robots.txt does not.

The live crawler policy allows public content for ordinary search crawlers and OAI-SearchBot and excludes `/api/`. Check any Vercel firewall or bot protection separately. No settings for model-training crawlers have been added or advertised as necessary for search visibility.

Add owner-issued `GOOGLE_SITE_VERIFICATION` and `BING_SITE_VERIFICATION` values if HTML-tag verification is used, or verify the domain through DNS. Submit the live sitemap in Google Search Console and Bing Webmaster Tools and inspect representative URLs. Those accounts and domain ownership have not been verified by this implementation. A Google Business Profile and wider location claims need the actual business details and eligibility; Northolt residence does not establish a public walk-in office.

There is no guaranteed ranking, featured answer or AI citation. Current Google guidance says SEO fundamentals remain relevant to generative results and that special AI files or schema are not required. Google retired FAQ rich results in May 2026; the visible Q&A and semantic Question/Answer data are not presented as eligibility for that retired feature. No `llms.txt`, hidden keyword blocks, fabricated citations, location doorway pages or “AI ranking” claims were added.

## Evidence and maintenance

Browser checks inspect the server HTML of every canonical page for unique metadata, canonical URLs, structured-data validity, source text and FAQ availability. They also check preview indexing controls, sitemap coverage, redirects and 404 responses. Unit checks cover the index policy and JSON-LD escaping. Maintain source links and update dates when the underlying content changes. Add client-approved experience, case studies and video transcripts as those become available; technical metadata is not a substitute for them.

Primary implementation references: [Google generative search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), [structured data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data), [Article](https://developers.google.com/search/docs/appearance/structured-data/article), [Organization](https://developers.google.com/search/docs/appearance/structured-data/organization), [Breadcrumb](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb), [FAQ retirement](https://developers.google.com/search/updates), [OpenAI search crawler](https://developers.openai.com/api/docs/bots).
