'use client';
import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowUpRight,
  ChevronDown,
  Menu,
  Phone,
  MessageCircle,
  Camera as Instagram,
} from 'lucide-react';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { site, pillars, REVIEW_CTA } from '@/lib/site';

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Better Call Sim home">
      <img src="/brand/better-call-sim-logo.png" alt="Better Call Sim" width="210" height="105" />
    </Link>
  );
}
export function ContactLink({
  type,
  children,
  className,
}: {
  type: 'phone' | 'whatsapp';
  children?: React.ReactNode;
  className?: string;
}) {
  const href =
    type === 'phone'
      ? site.phone
        ? 'tel:' + site.phone.replace(/\s/g, '')
        : '/contact#direct-contact'
      : site.whatsapp
        ? 'https://wa.me/' +
          site.whatsapp.replace(/\D/g, '') +
          '?text=Hello%20Sim%2C%20I%27d%20like%20to%20discuss%20my%20planning.'
        : '/contact#direct-contact';
  const Icon = type === 'phone' ? Phone : MessageCircle;
  return (
    <a
      href={href}
      className={className}
      aria-label={type === 'phone' ? 'Call Sim' : 'Contact Sim on WhatsApp'}
    >
      <Icon size={16} />
      {children ?? (type === 'phone' ? 'Call Sim' : 'WhatsApp')}
    </a>
  );
}
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="utility">
        <div className="container utility-inner">
          <span>FINANCIAL ADVICE · ESTATE PLANNING · PROPERTY FINANCE</span>
          <div>
            <ContactLink type="phone" />
            <ContactLink type="whatsapp" />
          </div>
        </div>
      </div>
      <header className="site-header container">
        <Brand />
        <nav aria-label="Main navigation">
          <DropdownMenu>
            <DropdownMenuTrigger className="nav-trigger">
              How I Help <ChevronDown size={12} />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="nav-dropdown">
              {pillars.map((p) => (
                <DropdownMenuItem key={p.slug} render={<Link href={'/' + p.slug} />}>
                  {p.title}
                  <ArrowUpRight size={16} />
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/the-plan">The Plan</Link>
          <Link href="/meet-sim">Meet Sim</Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="nav-trigger">
              Insights <ChevronDown size={12} />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="nav-dropdown">
              {[
                ['Guides & insights', '/insights'],
                ['Case studies', '/case-studies'],
                ['IHT calculator', '/iht-calculator'],
              ].map(([label, href]) => (
                <DropdownMenuItem key={href} render={<Link href={href} />}>
                  {label}
                  <ArrowUpRight size={16} />
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
        <div className="header-actions">
          <Link className="button button-small" href="/book-review">
            Book your review <ArrowUpRight size={16} />
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="mobile-menu-button" aria-label="Open navigation">
              <Menu size={23} />
            </SheetTrigger>
            <SheetContent className="mobile-navigation">
              <SheetTitle>Explore Better Call Sim</SheetTitle>
              <SheetDescription>Your wealth. Your family. Your legacy.</SheetDescription>
              <nav aria-label="Mobile navigation">
                {[
                  ['Home', '/'],
                  ...pillars.map((p) => [p.title, '/' + p.slug]),
                  ['The Plan', '/the-plan'],
                  ['Meet Sim', '/meet-sim'],
                  ['Insights', '/insights'],
                  ['Case studies', '/case-studies'],
                  ['IHT calculator', '/iht-calculator'],
                  ['Contact', '/contact'],
                ].map(([label, href]) => (
                  <Link onClick={() => setOpen(false)} href={href} key={href}>
                    {label}
                    <ArrowUpRight size={17} />
                  </Link>
                ))}
              </nav>
              <Link className="button" onClick={() => setOpen(false)} href="/book-review">
                {REVIEW_CTA}
              </Link>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  );
}
export function SiteFooter() {
  return (
    <>
      <section className="final-cta">
        <div className="container final-cta-inner">
          <div>
            <p className="eyebrow">YOUR NEXT CHAPTER STARTS WITH A CONVERSATION</p>
            <h2>
              Let’s make a plan.
              <br />
              <em>For what matters to you.</em>
            </h2>
          </div>
          <div>
            <Link href="/book-review" className="button button-light">
              {REVIEW_CTA}
              <ArrowUpRight size={18} />
            </Link>
            <div className="contact-row">
              <ContactLink type="phone" />
              <ContactLink type="whatsapp" />
            </div>
          </div>
        </div>
      </section>
      <footer className="footer">
        <div className="container">
          <div className="footer-main">
            <div className="footer-brand">
              <Brand />
              <p>
                Your wealth. Your family.
                <br />
                Your legacy. One plan.
              </p>
              <p className="footer-location">Based in {site.location}.</p>
              <a href={site.instagram} target="_blank" rel="noreferrer" className="instagram-link">
                <Instagram size={18} /> @bettercallsimuk <ArrowUpRight size={13} />
              </a>
            </div>
            <div>
              <h3>How I help</h3>
              {pillars.map((p) => (
                <Link key={p.slug} href={'/' + p.slug}>
                  {p.title}
                </Link>
              ))}
              <Link href="/iht-calculator">IHT calculator</Link>
            </div>
            <div>
              <h3>Get to know Sim</h3>
              <Link href="/meet-sim">Meet Sim</Link>
              <Link href="/the-plan">The Plan</Link>
              <Link href="/case-studies">Case studies</Link>
              <Link href="/insights">Insights & videos</Link>
            </div>
            <div>
              <h3>Let’s talk</h3>
              <Link href="/book-review">Book your review</Link>
              <Link href="/contact">Contact</Link>
              <ContactLink type="phone" />
              <ContactLink type="whatsapp" />
            </div>
          </div>
          <div className="regulatory-grid">
            <div>
              <h4>Financial advice & property finance</h4>
              <p>
                {site.regulatedProvider
                  ? `${site.regulatedProvider}. FCA reference: ${site.fcaReference}.`
                  : 'The regulated provider, permissions and applicable protections must be confirmed before advice is provided. Regulatory status depends on the service and product; not all property finance is FCA regulated.'}
              </p>
              <Link href="/regulatory-information">
                Read the regulatory information <ArrowUpRight size={12} />
              </Link>
            </div>
            <div>
              <h4>Estate planning</h4>
              <p>
                Will writing and estate-planning services are outside FCA regulation. They do not
                carry the same regulatory protections as regulated financial advice. The provider
                and terms will be confirmed before you proceed.
              </p>
              <p>
                No STEP membership or other professional accreditation is claimed on this website.
              </p>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Better Call Sim</span>
            <div>
              {[
                ['Privacy', 'privacy'],
                ['Cookies', 'cookies'],
                ['Terms', 'terms'],
                ['Complaints', 'complaints'],
                ['Accessibility', 'accessibility'],
              ].map(([title, slug]) => (
                <Link href={'/' + slug} key={slug}>
                  {title}
                </Link>
              ))}
            </div>
          </div>
          {site.preview && (
            <p className="preview-notice">
              Private design preview · Please use sample details. Business disclosures and direct
              contact details await verification.
            </p>
          )}
        </div>
      </footer>
      <div className="mobile-contact-bar">
        <Link href="/book-review">
          <ArrowUpRight size={18} />
          Book a review
        </Link>
        <ContactLink type="phone" />
        <ContactLink type="whatsapp" />
      </div>
    </>
  );
}
