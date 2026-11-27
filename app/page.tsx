import Link from 'next/link';
import Image from 'next/image';
import { Camera, Check, House, ShieldCheck, TrendingUp } from 'lucide-react';
import { EnquiryForm } from '@/components/enquiry-form';
import { Faq } from '@/components/faq';
import { TikTokIcon } from '@/components/icons';
import { StructuredData } from '@/components/search-content';
import { stories } from '@/lib/editorial';
import { homepageMedia } from '@/lib/homepage-media';
import { pageStructuredData } from '@/lib/seo';
import { homeFaqs, pillars, REVIEW_CTA, site } from '@/lib/site';
import './homepage.css';

const scenarioCovers = {
  family: '/images/property-residence.webp',
  retirement: '/images/financial-study.webp',
  business: '/images/estate-legacy.webp',
};

const pillarIcons = [ShieldCheck, TrendingUp, House];

const reviewSteps = [
  {
    title: 'Tell me what’s changing',
    text: 'Start with the decision in front of you and the people it affects.',
  },
  {
    title: 'Look at what you already have',
    text: 'We’ll talk through how your property, finances and estate plans fit together.',
  },
  {
    title: 'Agree what to do next',
    text: 'We’ll identify what needs attention and who can help with each step.',
  },
];

function ReviewLink() {
  return (
    <Link href="#request-review" className="button">
      {REVIEW_CTA}
    </Link>
  );
}

export default function Home() {
  const { introduction, clientStories } = homepageMedia;
  return (
    <main id="main" className="homepage">
      <StructuredData value={pageStructuredData('')} />

      <section className="homepage-hero" aria-labelledby="home-title">
        <div className="homepage-container">
          <div className="homepage-intro">
            <p className="homepage-kicker">
              Financial planning · Estate planning · Property finance
            </p>
            <h1 id="home-title">
              Your wealth. Your family.
              <br />
              <em>One joined-up plan.</em>
            </h1>
            <p>
              I’m Simran Sahota. I help you see how your home, finances and
              plans for your family fit together, so you can decide what to do
              first.
            </p>
            <Link
              href="#request-review"
              className="button homepage-mobile-review"
            >
              Request a review
            </Link>
          </div>

          <div className="homepage-hero-grid">
            <div className="homepage-feature">
              {introduction ? (
                <video
                  controls
                  playsInline
                  preload="none"
                  src={introduction.src}
                  poster={introduction.poster}
                  aria-label="An introduction to Better Call Sim"
                >
                  <track
                    kind="captions"
                    src={introduction.captions}
                    srcLang="en"
                    label="English"
                    default
                  />
                </video>
              ) : (
                <>
                  <Image
                    src={site.adviserPortrait}
                    alt="Simran Sahota"
                    fill
                    sizes="(max-width: 740px) 95vw, (max-width: 1200px) 53vw, 640px"
                    loading="eager"
                    fetchPriority="high"
                  />
                  <div className="homepage-feature-caption">
                    <div>
                      <strong>Simran Sahota</strong>
                      <span>Better Call Sim</span>
                    </div>
                    <Link href="/meet-sim">Meet Sim</Link>
                  </div>
                </>
              )}
            </div>
            <div id="request-review" className="homepage-request" tabIndex={-1}>
              <EnquiryForm variant="homepage" />
            </div>
          </div>

          <ul className="homepage-benefits" aria-label="About your review">
            <li>
              <Check size={17} aria-hidden="true" /> Working with specialist
              partners
            </li>
            <li>
              <Check size={17} aria-hidden="true" /> Over a decade in financial
              services
            </li>
            <li>
              <Check size={17} aria-hidden="true" /> Any further fees agreed in
              advance
            </li>
          </ul>
        </div>
      </section>

      <section
        className="homepage-section homepage-stories"
        aria-labelledby="stories-title"
      >
        <div className="homepage-container">
          <div className="homepage-section-heading">
            <div>
              <p className="homepage-kicker">
                {clientStories.length
                  ? 'Client stories'
                  : 'Illustrative scenarios'}
              </p>
              <h2 id="stories-title">
                {clientStories.length
                  ? 'In our clients’ words.'
                  : 'What planning looks like.'}
              </h2>
            </div>
            <p>
              {clientStories.length
                ? 'Hear why clients got in touch and what they wanted to work through.'
                : 'Explore three hypothetical situations where a change at home, at work or near retirement raises decisions worth looking at together.'}
            </p>
          </div>
          {clientStories.length ? (
            <div className="homepage-story-grid">
              {clientStories.map(({ name, topic, quote, video }) => (
                <article key={video.src} className="homepage-story">
                  <video
                    controls
                    playsInline
                    preload="none"
                    src={video.src}
                    poster={video.poster}
                    aria-label={name + '’s client story'}
                  >
                    <track
                      kind="captions"
                      src={video.captions}
                      srcLang="en"
                      label="English"
                      default
                    />
                  </video>
                  <div className="homepage-story-copy">
                    <p className="homepage-kicker">{topic}</p>
                    <h3>{name}</h3>
                    <blockquote>{quote}</blockquote>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="homepage-story-grid">
              {stories.map((story) => (
                <Link
                  href={'/case-studies/' + story.slug}
                  className="homepage-story"
                  key={story.slug}
                >
                  <div className="homepage-story-image">
                    <Image
                      src={
                        scenarioCovers[
                          story.theme as keyof typeof scenarioCovers
                        ]
                      }
                      alt=""
                      fill
                      sizes="(max-width: 560px) 34vw, (max-width: 740px) 48vw, (max-width: 1200px) 31vw, 370px"
                    />
                  </div>
                  <div className="homepage-story-copy">
                    <p className="homepage-kicker">{story.category}</p>
                    <h3>{story.title}</h3>
                    <span className="homepage-story-link">
                      Read the scenario
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section
        className="homepage-section homepage-process"
        id="the-plan"
        aria-labelledby="process-title"
      >
        <div className="homepage-container">
          <div className="homepage-section-heading">
            <div>
              <p className="homepage-kicker">
                Your financial &amp; estate review
              </p>
              <h2 id="process-title">What happens when we talk?</h2>
            </div>
            <p>
              Bring your questions. You can start with one decision and we’ll
              see what else it connects to.
            </p>
          </div>
          <ol className="homepage-process-grid">
            {reviewSteps.map(({ title, text }) => (
              <li key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
          <ReviewLink />
        </div>
      </section>

      <section
        className="homepage-section homepage-about"
        aria-labelledby="about-title"
      >
        <div className="homepage-container homepage-about-grid">
          <div className="homepage-about-image">
            <Image
              src="/brand/simran-study-hands-together.png"
              alt="Simran Sahota in his study"
              fill
              sizes="(max-width: 740px) 92vw, (max-width: 1200px) 47vw, 530px"
            />
          </div>
          <div className="homepage-about-copy">
            <p className="homepage-kicker">Meet Sim</p>
            <h2 id="about-title">One person to start with.</h2>
            <p>
              I’ve spent over a decade in financial services. I started Better
              Call Sim so families could talk through their home, money and
              plans for the people they love in the same conversation.
            </p>
            <p>
              I work alongside Bhupinder Anand on financial and estate planning.
              We’ll explain who can help with each part and what any further
              work would involve before you decide to proceed.
            </p>
            <Link href="/meet-sim" className="homepage-text-link">
              More about Sim and the people he works with
            </Link>
          </div>
        </div>
      </section>

      <section
        className="homepage-section homepage-services"
        id="services"
        aria-labelledby="services-title"
      >
        <div className="homepage-container">
          <div className="homepage-section-heading">
            <div>
              <p className="homepage-kicker">How I help</p>
              <h2 id="services-title">Start with what matters to you.</h2>
            </div>
            <p>
              Explore a specific area or{' '}
              <Link href="/the-plan">see how the pieces fit together</Link>.
            </p>
          </div>
          <div className="homepage-pillar-grid">
            {pillars.map((pillar, index) => {
              const Icon = pillarIcons[index];
              return (
                <Link href={'/' + pillar.slug} key={pillar.slug}>
                  <Icon size={28} strokeWidth={1.5} aria-hidden="true" />
                  <h3>{pillar.title}</h3>
                  <p>{pillar.services}</p>
                  <span className="homepage-story-link">
                    Explore {pillar.title.toLowerCase()}
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="homepage-tools">
            <Link href="/family-wealth-check">
              <strong>Start My Family Wealth Check</strong>
              <span>Find a starting point for your planning.</span>
            </Link>
            <Link href="/iht-calculator">
              <strong>Inheritance Tax Calculator</strong>
              <span>Get an illustration and download your report.</span>
            </Link>
            <Link href="/insights">
              <strong>Planning Guides</strong>
              <span>Read about wills, pensions, protection and property.</span>
            </Link>
          </div>
        </div>
      </section>

      <section
        className="homepage-section homepage-faq"
        aria-labelledby="faq-title"
      >
        <div className="homepage-container faq-layout">
          <div>
            <p className="homepage-kicker">Before you get in touch</p>
            <h2 id="faq-title">Frequently asked questions.</h2>
            <Link href="/contact" className="homepage-text-link">
              Ask Sim a question
            </Link>
          </div>
          <Faq items={homeFaqs} />
        </div>
      </section>

      <section className="homepage-close" aria-labelledby="close-title">
        <div className="homepage-container">
          <h2 id="close-title">
            Let’s work out <em>where to start.</em>
          </h2>
          <p>
            Tell me what’s on your mind. We’ll arrange an initial conversation
            and work out what deserves a closer look.
          </p>
          <ReviewLink />
          <div id="social" className="homepage-social">
            <span>Follow Better Call Sim</span>
            <a href={site.instagram} target="_blank" rel="noreferrer">
              <Camera size={17} aria-hidden="true" /> Instagram
            </a>
            <a href={site.tiktok} target="_blank" rel="noreferrer">
              <TikTokIcon size={17} /> TikTok
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
