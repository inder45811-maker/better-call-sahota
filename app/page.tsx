import Link from 'next/link';
import {
  ArrowUpRight,
  ShieldCheck,
  House,
  TrendingUp,
  Phone,
  Check,
  Play,
  Camera,
} from 'lucide-react';
import { PlanningStages } from '@/components/planning-stages';
import { ArticleCards, StoryCards, ReviewJourney, ReviewButton } from '@/components/content';
import { ContactLink } from '@/components/site-shell';
import { Faq } from '@/components/faq';
import { homeFaqs, site } from '@/lib/site';
import { StructuredData } from '@/components/search-content';
import { pageStructuredData } from '@/lib/seo';

export default function Home() {
  return (
    <main id="main">
      <StructuredData value={pageStructuredData('')} />
      <section className="bcs-hero">
        <div className="container bcs-hero-grid">
          <div className="bcs-hero-copy">
            <p className="eyebrow">
              <span className="status-dot" />
              THE BIG PICTURE. PERSONALLY PLANNED.
            </p>
            <h1>
              Your wealth.
              <br />
              Your family.
              <br />
              Your legacy.
              <br />
              <em>One plan.</em>
            </h1>
            <p>
              Your finances, your property and your family’s future. Bring it all together with a
              Financial &amp; Estate Review.
            </p>
            <ReviewButton />
            <div className="hero-secondary">
              <ContactLink type="whatsapp">Let’s talk on WhatsApp</ContactLink>
              <span>No jargon. A real conversation.</span>
            </div>
          </div>
          <div className="bcs-hero-visual">
            <span className="hero-watermark" aria-hidden="true">
              BETTER
              <br />
              CALL SIM.
            </span>
            <div className="hero-gold-line" aria-hidden="true" />
            <img
              className="sim-hero-portrait"
              src="/brand/simran-sahota.png"
              alt="Simran Sahota, the person behind Better Call Sim"
              width="700"
              height="850"
              fetchPriority="high"
            />
            <div className="sim-nameplate">
              <div>
                <span>YOUR PLAN STARTS WITH A PERSON.</span>
                <strong>SIMRAN SAHOTA</strong>
              </div>
              <Link href="/meet-sim" aria-label="Meet Simran Sahota">
                <ArrowUpRight size={27} />
              </Link>
            </div>
            <div className="hero-personal-note">
              <Phone size={18} />
              <span>
                BIG DECISIONS?
                <br />
                <b>BETTER CALL SIM.</b>
              </span>
            </div>
          </div>
        </div>
      </section>
      <div className="bcs-marquee" aria-label="Build, grow, protect, pass on">
        <div className="container">
          <span>BUILD</span>
          <ArrowUpRight />
          <span>GROW</span>
          <ArrowUpRight />
          <span>PROTECT</span>
          <ArrowUpRight />
          <span>PASS ON</span>
        </div>
      </div>
      <section className="section container" id="services">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THREE AREAS. ONE BIGGER PICTURE.</p>
            <h2>
              Life doesn’t come
              <br />
              <em>in separate boxes.</em>
            </h2>
          </div>
          <p>
            Neither should your planning. Connect the decisions you make today with the future you
            want to build.
          </p>
        </div>
        <div className="bcs-services">
          {[
            {
              n: '01',
              title: 'Estate Planning',
              icon: ShieldCheck,
              tag: 'LOOK AFTER WHAT MATTERS.',
              desc: 'Make your wishes clear. Plan for the people and the legacy you leave behind.',
              items: [
                'Wills & Trusts',
                'LPAs & Inheritance Tax',
                'Bloodline, Business & Care Planning',
              ],
              url: '/estate-planning',
            },
            {
              n: '02',
              title: 'Financial Advice',
              icon: TrendingUp,
              tag: 'GIVE YOUR MONEY A PURPOSE.',
              desc: 'Connect your investments, retirement plans and protection with your life.',
              items: [
                'Investments, ISAs & Bonds',
                'Pensions & Life Assurance',
                'Income & Business Protection',
              ],
              url: '/financial-advice',
            },
            {
              n: '03',
              title: 'Property Finance',
              icon: House,
              tag: 'MAKE YOUR NEXT MOVE COUNT.',
              desc: 'From your first property to your next investment, explore the way forward.',
              items: [
                'Mortgages & Remortgages',
                'Buy-to-Let & Bridging',
                'Second Charges & Equity Release',
              ],
              url: '/property-finance',
            },
          ].map((p) => (
            <Link className="bcs-service-card" href={p.url} key={p.n}>
              <div className="bcs-service-top">
                <p.icon size={35} strokeWidth={1.3} />
                <span>{p.n}</span>
              </div>
              <p className="bcs-card-kicker">{p.tag}</p>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
              <ul>
                {p.items.map((item) => (
                  <li key={item}>
                    <Check size={14} />
                    {item}
                  </li>
                ))}
              </ul>
              <span className="bcs-card-link">
                Explore {p.title.toLowerCase()}
                <ArrowUpRight size={22} />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="bcs-personal">
        <div className="container bcs-personal-grid">
          <div>
            <p className="eyebrow">THE PERSON BEHIND THE PLAN</p>
            <h2>
              Big on clarity.
              <br />
              <em>Personal by design.</em>
            </h2>
            <p>
              A new home. A growing family. A business you’ve worked hard to build. You don’t need a
              stack of disconnected conversations. You need somewhere to start.
            </p>
            <p>
              I’m Simran Sahota. Better Call Sim brings financial, property and estate-planning
              conversations together around you.
            </p>
            <Link className="text-link" href="/meet-sim">
              Meet Sim <ArrowUpRight size={19} />
            </Link>
          </div>
          <div className="bcs-personal-statement">
            <span>
              YOUR GOALS.
              <br />
              YOUR PEOPLE.
              <br />
              <b>LET’S TALK.</b>
            </span>
            <div>
              <img
                src="/brand/better-call-sim-logo.png"
                alt="Better Call Sim"
                width="230"
                height="100"
              />
              <a
                href={site.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Visit Sim on Instagram"
              >
                <Camera size={24} />
              </a>
            </div>
          </div>
        </div>
      </section>
      <section className="section container bcs-plan" id="the-plan">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE BETTER CALL SIM APPROACH</p>
            <h2>
              A plan for now.
              <br />
              <em>And what’s next.</em>
            </h2>
          </div>
          <p>Four connected stages. Start where you are, and keep your whole life in view.</p>
        </div>
        <PlanningStages />
      </section>
      <section className="bcs-iht">
        <div className="container bcs-iht-grid">
          <div>
            <p className="eyebrow">KNOW WHERE YOU STAND</p>
            <h2>
              Do you have an
              <br />
              <em>
                inheritance tax
                <br />
                question?
              </em>
            </h2>
            <p>
              Get an illustrative view of your estate and a personalised report showing the
              assumptions and questions worth exploring.
            </p>
            <Link href="/iht-calculator" className="button">
              Get My IHT Illustration <ArrowUpRight size={20} />
            </Link>
            <span className="bcs-small">
              Name and email requested. Illustration only, not personal advice.
            </span>
          </div>
          <div className="bcs-tax-visual">
            <span className="tax-label">THE STANDARD IHT RATE</span>
            <strong>
              40<span>%</span>
            </strong>
            <p>
              can apply to the taxable part of an estate.
              <br />
              Your allowances and circumstances matter.
            </p>
            <div className="tax-visual-footer">
              <ShieldCheck size={23} />
              <span>
                Understand the picture.
                <br />
                <b>Then plan the next step.</b>
              </span>
            </div>
          </div>
        </div>
      </section>
      <section className="section container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">PLANNING IN THE REAL WORLD</p>
            <h2>
              Different lives.
              <br />
              <em>Connected decisions.</em>
            </h2>
          </div>
          <div>
            <p className="heading-note">
              Three hypothetical scenarios showing how the pieces fit together. These are
              illustrations, not client results.
            </p>
            <Link className="text-link" href="/case-studies">
              Explore the scenarios <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
        <StoryCards />
      </section>
      <section className="bcs-review section">
        <div className="container">
          <div className="center-heading">
            <p className="eyebrow">YOUR FINANCIAL &amp; ESTATE REVIEW</p>
            <h2>
              Let’s make the
              <br />
              <em>first move simple.</em>
            </h2>
          </div>
          <ReviewJourney />
          <div className="center-action">
            <ReviewButton />
            <p>The scope, format and any fee are agreed before you proceed.</p>
          </div>
        </div>
      </section>
      <section className="section container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">STRAIGHT-TALKING INSIGHTS</p>
            <h2>
              Big topics.
              <br />
              <em>Made clearer.</em>
            </h2>
          </div>
          <Link className="text-link" href="/insights">
            Explore the guides <ArrowUpRight size={18} />
          </Link>
        </div>
        <ArticleCards />
        <a className="bcs-social-banner" href={site.instagram} target="_blank" rel="noreferrer">
          <span className="bcs-play">
            <Play size={23} fill="currentColor" />
          </span>
          <div>
            <h3>More from Better Call Sim.</h3>
            <p>Explore Sim’s educational posts and videos on Instagram.</p>
          </div>
          <span>
            @bettercallsimuk <ArrowUpRight size={23} />
          </span>
        </a>
      </section>
      <section className="faq-section section">
        <div className="container faq-layout">
          <div>
            <p className="eyebrow">LET’S CLEAR A FEW THINGS UP</p>
            <h2>
              Good questions.
              <br />
              <em>Clear answers.</em>
            </h2>
            <Link href="/contact" className="text-link">
              Ask Sim a question <ArrowUpRight size={18} />
            </Link>
          </div>
          <Faq items={homeFaqs} />
        </div>
      </section>
    </main>
  );
}
