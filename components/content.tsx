import Link from 'next/link';
import {
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  Sprout,
  House,
  HeartHandshake,
  Layers3,
} from 'lucide-react';
import { REVIEW_CTA, stages } from '@/lib/site';
import { articles, stories } from '@/lib/editorial';
export function ReviewButton() {
  return (
    <Link className="button" href="/book-review">
      {REVIEW_CTA}
      <ArrowUpRight size={18} />
    </Link>
  );
}
export function PageIntro({
  eyebrow,
  title,
  description,
  breadcrumb,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  breadcrumb?: { label: string; href: string };
}) {
  return (
    <section className="page-intro container">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        {breadcrumb && (
          <>
            <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
            <span>/</span>
          </>
        )}
        <span aria-current="page">{breadcrumb ? title : eyebrow}</span>
      </nav>
      <p className="eyebrow">{eyebrow}</p>
      <h1>
        {title.split('\n').map((line, i) => (
          <span key={line}>
            {i > 0 ? (
              <>
                <br />
                <em>{line}</em>
              </>
            ) : (
              line
            )}
          </span>
        ))}
      </h1>
      {description && <p className="page-description">{description}</p>}
    </section>
  );
}
const coverConfig: Record<string, { slogan: string; icon: typeof ShieldCheck }> = {
  estate: { slogan: 'MAKE YOUR\nWISHES CLEAR.', icon: ShieldCheck },
  pensions: { slogan: 'YOUR NEXT\nCHAPTER.', icon: Sprout },
  property: { slogan: 'ROOM FOR\nWHAT’S NEXT.', icon: House },
};

export function ArticleCards() {
  return (
    <div className="article-grid">
      {articles.map((a, i) => {
        const config = coverConfig[a.theme] || coverConfig.estate;
        const Icon = config.icon;
        return (
          <Link
            href={'/insights/' + a.slug}
            key={a.slug}
            className={'article-card article-' + a.theme}
          >
            <div className="article-cover">
              <span>
                {config.slogan.split('\n').map((t) => (
                  <span key={t}>
                    {t}
                    <br />
                  </span>
                ))}
              </span>
              <div className="cover-symbol">
                <Icon size={62} strokeWidth={0.8} />
              </div>
              <span className="cover-label">THE BIGGER PICTURE / 0{i + 1}</span>
            </div>
            <div className="article-meta">
              <span>{a.category}</span>
              <span>{a.readTime}</span>
            </div>
            <h3>{a.title}</h3>
            <p>{a.description}</p>
            <span className="text-link">
              Read the guide <ArrowUpRight size={16} />
            </span>
          </Link>
        );
      })}
    </div>
  );
}
export function StoryCards() {
  return (
    <div className="story-grid">
      {stories.map((s, i) => (
        <Link href={'/case-studies/' + s.slug} key={s.slug} className="story-card">
          <div className="story-icon">
            {i === 0 ? (
              <HeartHandshake size={30} strokeWidth={1.2} />
            ) : i === 1 ? (
              <Sprout size={30} strokeWidth={1.2} />
            ) : (
              <Layers3 size={30} strokeWidth={1.2} />
            )}
            <span>ILLUSTRATIVE SCENARIO</span>
          </div>
          <p className="story-category">{s.category}</p>
          <h3>{s.title}</h3>
          <p>{s.description}</p>
          <span className="text-link">
            See the bigger picture <ArrowUpRight size={16} />
          </span>
        </Link>
      ))}
    </div>
  );
}
export function ReviewJourney() {
  return (
    <div className="review-journey">
      {[
        {
          title: 'Complimentary Discovery',
          text: 'Share your family, property and financial priorities in a relaxed, no-jargon conversation.',
        },
        {
          title: 'Connecting the Whole Picture',
          text: 'We look across estate planning, pensions, mortgages and protection so nothing is left in a silo.',
        },
        {
          title: 'A Concrete Action Plan',
          text: 'Identify immediate gaps, tax exposure and sensible next steps — with any future fees agreed before you proceed.',
        },
      ].map((step, i) => (
        <div key={step.title}>
          <span className="journey-number">0{i + 1}</span>
          <h3>{step.title}</h3>
          <p>{step.text}</p>
        </div>
      ))}
    </div>
  );
}
export function RelatedPillars() {
  return (
    <div className="small-pillar-links">
      {[
        ['Estate Planning', '/estate-planning'],
        ['Financial Advice', '/financial-advice'],
        ['Property Finance', '/property-finance'],
      ].map(([title, href]) => (
        <Link href={href} key={href}>
          {title}
          <ArrowUpRight size={18} />
        </Link>
      ))}
    </div>
  );
}
export function StaticStages() {
  return (
    <div className="stage-explainer">
      {stages.map((s, i) => (
        <section key={s.name}>
          <span className="journey-number">0{i + 1}</span>
          <div>
            <p className="eyebrow">{s.name}</p>
            <h2>{s.verb}</h2>
            <p>{s.text}</p>
            <div className="stage-page-links">
              {s.links.map((l) => (
                <Link href={l.href} key={l.href}>
                  {l.label}
                  <ArrowRight size={16} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
