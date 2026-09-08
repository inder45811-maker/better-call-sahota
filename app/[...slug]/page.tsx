import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  Info,
  Camera as Instagram,
  Phone,
  MessageCircle,
  FileText,
} from 'lucide-react';
import {
  PageIntro,
  ReviewButton,
  ArticleCards,
  StoryCards,
  ReviewJourney,
  StaticStages,
  RelatedPillars,
} from '@/components/content';
import { Faq } from '@/components/faq';
import { EnquiryForm } from '@/components/enquiry-form';
import { IhtCalculator } from '@/components/iht-calculator';
import { ContactLink } from '@/components/site-shell';
import services from '@/lib/services.json';
import { pillars, site, homeFaqs } from '@/lib/site';
import { articles, stories } from '@/lib/editorial';
import { legalPages } from '@/lib/legal';
type PageProps = { params: Promise<{ slug: string[] }> };
function resolveTitle(path: string) {
  return (
    services.find((s) => s.pillar + '/' + s.slug === path)?.title ??
    pillars.find((p) => p.slug === path)?.title ??
    articles.find((a) => 'insights/' + a.slug === path)?.title ??
    stories.find((s) => 'case-studies/' + s.slug === path)?.title ??
    legalPages[path]?.title ??
    (
      {
        'meet-sim': 'Meet Sim',
        'the-plan': 'The Plan',
        insights: 'Insights & guides',
        videos: 'Videos',
        'case-studies': 'Planning scenarios',
        'book-review': 'Book Your Financial & Estate Review',
        contact: 'Contact Sim',
        'iht-calculator': 'Inheritance Tax Calculator',
      } as Record<string, string>
    )[path]
  );
}
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const path = (await params).slug.join('/'),
    title = resolveTitle(path);
  return {
    title: title ?? 'Page not found',
    description:
      services.find((s) => s.pillar + '/' + s.slug === path)?.description ??
      'Explore your financial, estate and property planning with Better Call Sim.',
    alternates: { canonical: site.origin + '/' + path },
    robots: { index: !site.preview, follow: !site.preview },
  };
}
export default async function ContentPage({ params }: PageProps) {
  const path = (await params).slug.join('/');
  const pillar = pillars.find((p) => p.slug === path),
    service = services.find((s) => s.pillar + '/' + s.slug === path),
    article = articles.find((a) => 'insights/' + a.slug === path),
    story = stories.find((s) => 'case-studies/' + s.slug === path),
    legal = legalPages[path];
  if (pillar)
    return (
      <main id="main">
        <PageIntro eyebrow={pillar.title} title={pillar.lead} description={pillar.description} />
        <section className="container hub-layout">
          <aside className="hub-aside">
            <img
              src={'/images/' + (pillar.slug === 'estate-planning' ? 'legacy' : 'home') + '.jpg'}
              width="700"
              height="900"
              alt={
                pillar.slug === 'estate-planning'
                  ? 'A mature tree across rolling countryside'
                  : 'A warm contemporary home with a green courtyard'
              }
            />
            <div>
              <p className="eyebrow">THE BIGGER PICTURE</p>
              <h3>{pillar.subtitle}</h3>
              <Link href="/the-plan" className="text-link">
                See how it connects <ArrowUpRight size={17} />
              </Link>
            </div>
          </aside>
          <div className="service-list">
            {services
              .filter((s) => s.pillar === pillar.slug)
              .map((s, i) => (
                <Link className="service-row" key={s.slug} href={'/' + s.pillar + '/' + s.slug}>
                  <span className="row-number">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h2>{s.title}</h2>
                    <p>{s.description}</p>
                  </div>
                  <ArrowUpRight size={22} />
                </Link>
              ))}
          </div>
        </section>
        <section className="container section">
          <div className="inline-review">
            <div>
              <h2>Not sure where to begin?</h2>
              <p>A conversation can help identify what needs attention first.</p>
            </div>
            <ReviewButton />
          </div>
        </section>
      </main>
    );
  if (service) {
    const category = pillars.find((p) => p.slug === service.pillar)!;
    return (
      <main id="main">
        <PageIntro
          eyebrow={category.title}
          title={service.title}
          description={service.description}
          breadcrumb={{ label: category.title, href: '/' + category.slug }}
        />
        <section className="container service-detail">
          <article>
            <p className="service-intro">{service.intro}</p>
            <h2>What this can help you explore</h2>
            <ul className="check-list">
              {service.helps.map((t) => (
                <li key={t}>
                  <Check size={19} />
                  {t}
                </li>
              ))}
            </ul>
            <div className="consideration-box">
              <Info size={23} />
              <div>
                <h3>Things to consider</h3>
                {service.considerations.map((t) => (
                  <p key={t}>{t}</p>
                ))}
              </div>
            </div>
            <h2>Your questions, answered.</h2>
            <Faq items={service.faqs} />
            <div className="provider-note">
              <h3>Who provides this service?</h3>
              <p>
                {service.pillar === 'estate-planning'
                  ? 'Estate-planning services are outside FCA regulation. The legal provider, supported jurisdiction and terms must be confirmed before work begins.'
                  : 'The provider, applicable permissions, advice scope and terms must be confirmed before you proceed. Regulatory treatment and protections vary by service and product.'}
              </p>
              <Link href="/regulatory-information">
                Regulatory information <ArrowUpRight size={14} />
              </Link>
            </div>
          </article>
          <aside className="service-review">
            <p className="eyebrow">YOUR NEXT STEP</p>
            <h3>
              Let’s look at
              <br />
              <em>your bigger picture.</em>
            </h3>
            <p>Start with your questions. A review can help put the next decisions in context.</p>
            <ReviewButton />
            <div className="contact-row">
              <ContactLink type="phone" />
              <ContactLink type="whatsapp" />
            </div>
            <hr />
            <p className="eyebrow">ALSO WORTH EXPLORING</p>
            {service.related.map((slug) => {
              const related = services.find((s) => s.slug === slug)!;
              return (
                <Link
                  className="related-service"
                  key={slug}
                  href={'/' + related.pillar + '/' + slug}
                >
                  {related.title}
                  <ArrowUpRight size={16} />
                </Link>
              );
            })}
          </aside>
        </section>
      </main>
    );
  }
  if (path === 'the-plan')
    return (
      <main id="main">
        <PageIntro
          eyebrow="THE PLAN"
          title={'Every chapter.\nConnected.'}
          description="Build, grow, protect and pass on. Four connected areas of planning, with your life at the centre."
        />
        <section className="container">
          <StaticStages />
        </section>
        <section className="section review-section">
          <div className="container">
            <div className="center-heading">
              <p className="eyebrow">HOW YOUR REVIEW WORKS</p>
              <h2>A clear place to start.</h2>
            </div>
            <ReviewJourney />
            <div className="center-action">
              <ReviewButton />
            </div>
          </div>
        </section>
      </main>
    );
  if (path === 'meet-sim')
    return (
      <main id="main">
        <PageIntro
          eyebrow="MEET SIM"
          title={'Big decisions.\nA real conversation.'}
          description="The person behind Better Call Sim — and an approach that starts with what matters to you."
        />
        <section className="container about-layout">
          <div className="about-mark">
            {site.adviserPortrait ? (
              <img src={site.adviserPortrait} alt="Sim" width="700" height="850" />
            ) : (
              <>
                <span className="about-initial">
                  S<span>.</span>
                </span>
                <p>better call sim.</p>
                <span className="about-mark-label">YOUR WEALTH. YOUR FAMILY. YOUR LEGACY.</span>
              </>
            )}
          </div>
          <div>
            <p className="eyebrow">A PERSONAL APPROACH</p>
            <h2>
              Start with your life.
              <br />
              <em>Build a plan around it.</em>
            </h2>
            <p>
              There’s often more than one reason to start planning. A property decision can affect
              your finances. A new family chapter can change your wishes. The aim of Better Call Sim
              is to connect those conversations.
            </p>
            <p>
              Begin with what you want to understand. Explore what needs attention. Agree the next
              steps, including where a specialist provider is needed.
            </p>
            {site.adviserStory ? (
              <p>{site.adviserStory}</p>
            ) : (
              <p className="notice">
                Sim’s personal biography, portrait and professional credentials will be added once
                supplied and verified. No qualifications or experience claims have been assumed for
                this preview.
              </p>
            )}
            <a href={site.instagram} className="text-link" target="_blank" rel="noreferrer">
              <Instagram size={18} />
              Meet Sim on Instagram <ArrowUpRight size={17} />
            </a>
            <ReviewButton />
          </div>
        </section>
        <section className="section container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">ONE CONNECTED CONVERSATION</p>
              <h2>Your priorities set the direction.</h2>
            </div>
          </div>
          <RelatedPillars />
        </section>
      </main>
    );
  if (path === 'book-review')
    return (
      <main id="main">
        <PageIntro
          eyebrow="BOOK YOUR FINANCIAL & ESTATE REVIEW"
          title={'Your next chapter.\nLet’s talk about it.'}
        />
        <section className="container booking-layout">
          <aside>
            <h2>
              A little preparation.
              <br />
              <em>A clearer conversation.</em>
            </h2>
            <p>
              You don’t need to know which service you need. Share your priorities and start there.
            </p>
            <ul className="check-list">
              {[
                'Talk about what matters to you.',
                'Consider how your plans fit together.',
                'Understand the next questions to explore.',
              ].map((t) => (
                <li key={t}>
                  <Check size={18} />
                  {t}
                </li>
              ))}
            </ul>
            <div className="booking-expectation">
              <p className="eyebrow">WHAT HAPPENS NEXT</p>
              <p>
                Your request is reviewed before an appointment is agreed. The format, duration,
                scope and any fee will be confirmed with you.
              </p>
            </div>
            <div className="contact-row">
              <ContactLink type="phone" />
              <ContactLink type="whatsapp" />
            </div>
          </aside>
          <EnquiryForm />
        </section>
      </main>
    );
  if (path === 'contact')
    return (
      <main id="main">
        <PageIntro
          eyebrow="CONTACT"
          title={'Good questions.\nStart here.'}
          description="A change in your life, a question about your plans or a feeling it’s time to get organised. Let’s start with that."
        />
        <section className="container contact-options" id="direct-contact">
          <a href={site.instagram} target="_blank" rel="noreferrer">
            <Instagram size={27} />
            <h2>Find Sim on Instagram</h2>
            <p>@bettercallsimuk</p>
            <span className="text-link">
              Open the profile <ArrowUpRight size={17} />
            </span>
          </a>
          <div>
            <Phone size={27} />
            <h2>Prefer a call?</h2>
            {site.phone ? (
              <ContactLink type="phone">{site.phone}</ContactLink>
            ) : (
              <p>
                The business telephone number is awaiting verification. You can request a callback
                through the review form.
              </p>
            )}
          </div>
          <div>
            <MessageCircle size={27} />
            <h2>A quick WhatsApp</h2>
            {site.whatsapp ? (
              <ContactLink type="whatsapp" />
            ) : (
              <p>
                The official WhatsApp number is awaiting verification. The Instagram profile is
                available now.
              </p>
            )}
          </div>
        </section>
        <section className="section container">
          <EnquiryForm />
        </section>
      </main>
    );
  if (path === 'iht-calculator')
    return (
      <main id="main">
        <PageIntro
          eyebrow="INHERITANCE TAX CALCULATOR"
          title={'Your estate.\nA little more clarity.'}
          description="Build an illustrative picture of your estate and request a report to save and discuss. No obligation to subscribe to marketing."
        />
        <section className="container calculator-section">
          <IhtCalculator />
        </section>
      </main>
    );
  if (path === 'insights' || path === 'videos')
    return (
      <main id="main">
        <PageIntro
          eyebrow="INSIGHTS & VIDEOS"
          title={'A little knowledge.\nMore confidence.'}
          description="Plain-English starting points for the decisions that shape your financial and family life."
        />
        <section className="container insights-section">
          <ArticleCards />
          <div className="video-section">
            <div>
              <p className="eyebrow">MORE FROM SIM</p>
              <h2>
                Conversations worth
                <br />
                <em>making time for.</em>
              </h2>
              <p>
                Visit Sim’s Instagram for posts and videos. Selected website videos will appear here
                once the media, captions and transcripts are supplied.
              </p>
            </div>
            <a className="video-instagram" href={site.instagram} target="_blank" rel="noreferrer">
              <Instagram size={45} strokeWidth={1} />
              <span>bettercallsimuk</span>
              <strong>Explore Sim’s Instagram</strong>
              <ArrowUpRight size={25} />
            </a>
          </div>
        </section>
      </main>
    );
  if (article)
    return (
      <main id="main">
        <PageIntro
          eyebrow={article.category}
          title={article.title}
          description={article.description}
          breadcrumb={{ label: 'Insights', href: '/insights' }}
        />
        <article className="article-body container">
          <div className="reading-meta">
            {article.readTime} · Reviewed 8 September 2026 · Educational guide
          </div>
          {article.paragraphs.map(([title, text]) => (
            <section key={title}>
              <h2>{title}</h2>
              <p>{text}</p>
            </section>
          ))}
          <p className="source-links">
            Source:{' '}
            <a href={article.source} target="_blank" rel="noreferrer">
              {article.sourceName}
            </a>
          </p>
          <div className="notice">
            General information only. The appropriate options depend on your circumstances and the
            rules in force. This guide is not personal advice.
          </div>
          <Link className="button" href={article.related}>
            Explore this service <ArrowUpRight size={17} />
          </Link>
        </article>
      </main>
    );
  if (path === 'case-studies')
    return (
      <main id="main">
        <PageIntro
          eyebrow="PLANNING SCENARIOS"
          title={'Different lives.\nA connected approach.'}
          description="Explore how related decisions can come together. These are hypothetical illustrations, not real client stories or promised outcomes."
        />
        <section className="container stories-section">
          <StoryCards />
          <p className="notice">
            Genuine client case studies will be published only with approval and the necessary
            consent. These examples do not describe work undertaken for actual clients.
          </p>
        </section>
      </main>
    );
  if (story)
    return (
      <main id="main">
        <PageIntro
          eyebrow={story.category}
          title={story.title}
          description={story.description}
          breadcrumb={{ label: 'Planning scenarios', href: '/case-studies' }}
        />
        <article className="container article-body">
          <p className="scenario-label">ILLUSTRATIVE SCENARIO — NOT AN ACTUAL CLIENT CASE STUDY</p>
          <section>
            <h2>The situation</h2>
            <p>{story.situation}</p>
          </section>
          <section>
            <h2>What matters</h2>
            <ul className="check-list">
              {story.priorities.map((t) => (
                <li key={t}>
                  <Check size={18} />
                  {t}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2>Bringing the pieces together</h2>
            <p>{story.approach}</p>
          </section>
          <section>
            <h2>The aim</h2>
            <p>{story.outcome}</p>
          </section>
          <Link href={story.related} className="button">
            Explore the related service <ArrowUpRight size={17} />
          </Link>
        </article>
      </main>
    );
  if (legal)
    return (
      <main id="main">
        <PageIntro eyebrow="USEFUL INFORMATION" title={legal.title} description={legal.intro} />
        <article className="container article-body legal-body">
          {legal.sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.text}</p>
            </section>
          ))}
          {path === 'regulatory-information' && (
            <a
              className="text-link"
              href="https://register.fca.org.uk/"
              target="_blank"
              rel="noreferrer"
            >
              Check the FCA Register <ArrowUpRight size={17} />
            </a>
          )}
          <p className="reading-meta">
            Last updated: 8 September 2026. Preview wording requires business review before public
            launch.
          </p>
        </article>
      </main>
    );
  notFound();
}
