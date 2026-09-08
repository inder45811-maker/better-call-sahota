import Link from 'next/link';
import {
  ArrowUpRight,
  ArrowRight,
  Sprout,
  ShieldCheck,
  House,
  FileText,
  Play,
  Camera as Instagram,
} from 'lucide-react';
import { PlanningStages } from '@/components/planning-stages';
import { ArticleCards, StoryCards, ReviewJourney, ReviewButton } from '@/components/content';
import { Faq } from '@/components/faq';
import { homeFaqs, site } from '@/lib/site';

export default function Home() {
  return (
    <>
      <main id="main">
        <section className="hero container">
          <div className="hero-copy">
            <p className="eyebrow">A LITTLE CLARITY. A BIGGER PICTURE.</p>
            <h1>
              Your wealth.
              <br />
              Your family.
              <br />
              Your legacy.
              <br />
              <em>One plan.</em>
            </h1>
            <p className="hero-description">
              Life is connected. Your planning should be too. Bring your finances, property
              decisions and estate planning together around what matters to you.
            </p>
            <Link className="button" href="/book-review">
              Book Your Financial &amp; Estate Review <ArrowUpRight size={18} />
            </Link>
            <a className="text-link" href="#services">
              Explore how I can help <ArrowRight size={16} />
            </a>
          </div>
          <div className="hero-visual">
            <div
              className="hero-photo"
              role="img"
              aria-label="A light-filled contemporary home opening onto a green courtyard"
            />
            <div className="photo-caption">
              <span className="tiny-rule" /> FOR THE LIFE YOU&apos;RE BUILDING.
              <br />
              <span className="caption-second">And the people you&apos;re building it for.</span>
            </div>
            <div className="hero-note">
              <span className="note-symbol">
                <Sprout size={25} />
              </span>
              <div>
                <p>A joined-up approach.</p>
                <span>From your first steps to your lasting legacy.</span>
              </div>
            </div>
            <div className="hero-aside">THOUGHTFULLY PLANNED. PERSONALLY GUIDED.</div>
          </div>
        </section>
        <section className="approach-strip">
          <div className="container approach-inner">
            <span>ONE BIGGER PICTURE</span>
            <p>Your goals at the centre.</p>
            <p>Clear, practical conversations.</p>
            <p>Planning that connects.</p>
          </div>
        </section>
        <section id="services" className="section container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">HOW I CAN HELP</p>
              <h2>
                Different needs.
                <br />
                <em>One clear direction.</em>
              </h2>
            </div>
            <p>
              From the home you buy to the wealth you pass on, see how the pieces of your plan fit
              together.
            </p>
          </div>
          <div className="pillar-grid">
            {[
              {
                title: 'Estate Planning',
                icon: ShieldCheck,
                desc: 'Make your wishes clear and plan for the people who matter most.',
                services: 'Wills · Trusts · LPAs · Inheritance Tax',
                url: '/estate-planning',
              },
              {
                title: 'Financial Advice',
                icon: Sprout,
                desc: 'Give your money a purpose, through every chapter of your life.',
                services: 'Investments · Pensions · Protection',
                url: '/financial-advice',
              },
              {
                title: 'Property Finance',
                icon: House,
                desc: 'Find the right starting point for your next property decision.',
                services: 'Mortgages · Remortgages · Equity Release',
                url: '/property-finance',
              },
            ].map((p, i) => (
              <Link key={p.title} className="pillar-card" href={p.url}>
                <div className="pillar-top">
                  <p.icon size={31} strokeWidth={1.3} />
                  <span>0{i + 1}</span>
                </div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
                <span className="pillar-services">{p.services}</span>
                <span className="pillar-link">
                  Explore {p.title.toLowerCase()} <ArrowUpRight size={19} />
                </span>
              </Link>
            ))}
          </div>
        </section>
        <section className="plan-section section" id="the-plan">
          <div className="container">
            <div className="section-heading">
              <div>
                <p className="eyebrow">A PLAN THAT MOVES WITH YOU</p>
                <h2>
                  Every chapter.
                  <br />
                  <em>Connected.</em>
                </h2>
              </div>
              <p>
                You don’t live your life in separate boxes. Your financial and estate planning
                shouldn’t either.
              </p>
            </div>
            <PlanningStages />
          </div>
        </section>
        <section className="section container personal-section">
          <div className="personal-image">
            <img
              src="/images/legacy.jpg"
              width="800"
              height="1100"
              loading="lazy"
              alt="A mature tree overlooking peaceful rolling fields in Devon"
            />
            <div className="image-quote">
              The best place to start?
              <br />
              <em>What matters to you.</em>
            </div>
          </div>
          <div className="personal-copy">
            <p className="eyebrow">A PERSONAL APPROACH</p>
            <h2>
              Big decisions.
              <br />
              <em>A real conversation.</em>
            </h2>
            <p>
              It might be a new home. A growing family. The business you’ve built. Or simply a
              feeling that it’s time to get things in order.
            </p>
            <p>
              Better Call Sim brings these conversations together, so you can start with your life
              and work towards a clearer plan.
            </p>
            <div className="adviser-signoff">
              <span className="small-monogram">S.</span>
              <div>
                <strong>Sim</strong>
                <span>The person behind Better Call Sim</span>
              </div>
            </div>
            <Link href="/meet-sim" className="text-link">
              Get to know Sim <ArrowUpRight size={17} />
            </Link>
          </div>
        </section>
        <section className="calculator-feature container">
          <div className="calculator-feature-copy">
            <p className="eyebrow">A LITTLE INSIGHT GOES A LONG WAY</p>
            <h2>
              What could inheritance tax
              <br />
              <em>mean for your family?</em>
            </h2>
            <p>
              Get an illustrative view of your estate, understand the assumptions and take a useful
              starting point into your next conversation.
            </p>
            <Link href="/iht-calculator" className="button button-light">
              Estimate Your IHT Position <ArrowUpRight size={18} />
            </Link>
            <span className="calculator-feature-note">
              Name and email requested for your report. Illustration only.
            </span>
          </div>
          <div className="report-preview" aria-label="Report contents">
            <div className="report-preview-head">
              <span>
                better call <b>sim.</b>
              </span>
              <FileText size={20} />
            </div>
            <p className="eyebrow">YOUR IHT ILLUSTRATION</p>
            <h3>
              Your estate.
              <br />A clearer picture.
            </h3>
            <div className="report-line">
              <span>Your estate overview</span>
              <span>01</span>
            </div>
            <div className="report-line">
              <span>Allowances & assumptions</span>
              <span>02</span>
            </div>
            <div className="report-line">
              <span>Questions to explore</span>
              <span>03</span>
            </div>
            <div className="report-preview-bottom">
              <span>Prepared around your answers</span>
              <ArrowUpRight size={18} />
            </div>
          </div>
        </section>
        <section className="section container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">PUTTING THE PIECES TOGETHER</p>
              <h2>
                Life rarely fits
                <br />
                <em>into one category.</em>
              </h2>
            </div>
            <div>
              <p className="heading-note">
                Explore three illustrative planning scenarios. These are examples, not actual client
                case studies.
              </p>
              <Link href="/case-studies" className="text-link">
                Explore the scenarios <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
          <StoryCards />
        </section>
        <section className="review-section section">
          <div className="container">
            <div className="center-heading">
              <p className="eyebrow">YOUR FINANCIAL & ESTATE REVIEW</p>
              <h2>
                Clarity starts
                <br />
                <em>with a conversation.</em>
              </h2>
              <p>A simple way to bring the bigger picture into focus.</p>
            </div>
            <ReviewJourney />
            <div className="center-action">
              <ReviewButton />
              <p>Scope, format and any fee confirmed before you proceed.</p>
            </div>
          </div>
        </section>
        <section className="section container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">A LITTLE KNOWLEDGE. MORE CONFIDENCE.</p>
              <h2>
                The bigger picture,
                <br />
                <em>made clearer.</em>
              </h2>
            </div>
            <Link className="text-link" href="/insights">
              All insights <ArrowUpRight size={17} />
            </Link>
          </div>
          <ArticleCards />
          <div className="instagram-feature">
            <div className="instagram-icon">
              <Instagram size={29} />
            </div>
            <div>
              <h3>More conversations with Sim.</h3>
              <p>Explore Sim’s posts and videos on Instagram.</p>
            </div>
            <a href={site.instagram} target="_blank" rel="noreferrer" className="text-link">
              Visit @bettercallsimuk <ArrowUpRight size={18} />
            </a>
          </div>
        </section>
        <section className="faq-section section">
          <div className="container faq-layout">
            <div>
              <p className="eyebrow">GOOD QUESTIONS DESERVE CLEAR ANSWERS</p>
              <h2>
                A few things
                <br />
                <em>you might be wondering.</em>
              </h2>
              <Link href="/contact" className="text-link">
                Have another question? Let’s talk <ArrowUpRight size={17} />
              </Link>
            </div>
            <Faq items={homeFaqs} />
          </div>
        </section>
      </main>
    </>
  );
}
