import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { PageIntro } from '@/components/content';
import { ContactLink } from '@/components/site-shell';
import { EnquiryForm } from '@/components/enquiry-form';
import copy from '@/lib/sports-planning.json';

type Block = { type: string; text?: string; items?: string[] };
function CopyBlocks({ blocks }: { blocks: Block[] }) {
  return blocks.map((block, index) => {
    if (block.type === 'list')
      return (
        <ul className="sports-checklist" key={index}>
          {block.items?.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    if (block.type === 'steps')
      return (
        <ol className="sports-process" key={index}>
          {block.items?.map((item) => {
            const [title, ...detail] = item.split(' — ');
            return (
              <li key={title}>
                <h3>{title}</h3>
                <p>{detail.join(' — ')}</p>
              </li>
            );
          })}
        </ol>
      );
    return <p key={index}>{block.text}</p>;
  });
}
export function SportsPlanningPage() {
  return (
    <main id="main" className="sports-page">
      <PageIntro
        eyebrow="FOOTBALLERS & SPORTS PROFESSIONALS"
        title={copy.title}
        description={copy.tagline}
      />
      <section className="container sports-opening" aria-label="Planning around your career">
        <div>
          <CopyBlocks blocks={copy.intro} />
        </div>
        <aside className="sports-invitation">
          <p className="eyebrow">YOUR CAREER. YOUR FAMILY. YOUR FUTURE.</p>
          <h2>One connected picture.</h2>
          <p>A personal planning conversation, built around the realities of your sporting life.</p>
          <Link href="#private-meeting" className="button">
            Book a private planning meeting <ArrowUpRight size={18} />
          </Link>
          <div className="contact-row">
            <ContactLink type="phone" />
            <ContactLink type="whatsapp" />
          </div>
        </aside>
      </section>
      <div className="container biography-layout sports-layout">
        <aside className="biography-contents">
          <p className="eyebrow">YOUR PLANNING</p>
          <nav aria-label="Sports planning sections">
            {copy.sections.map((section) => (
              <a key={section.id} href={'#' + section.id}>
                {section.title}
              </a>
            ))}
          </nav>
        </aside>
        <div className="biography-chapters">
          {copy.sections.map((section) => (
            <section id={section.id} key={section.id} aria-labelledby={section.id + '-title'}>
              <h2 id={section.id + '-title'}>{section.title}</h2>
              <CopyBlocks blocks={section.blocks} />
              {section.id === 'private-meeting' && (
                <>
                  <div className="contact-row">
                    <ContactLink type="phone" />
                    <ContactLink type="whatsapp" />
                  </div>
                  <EnquiryForm
                    initialInterest="Footballers & Sports Professionals"
                    submitLabel="Request a private planning meeting"
                  />
                </>
              )}
            </section>
          ))}
          <aside
            className="sports-provider"
            aria-label="Service providers and regulatory information"
          >
            <p className="eyebrow">WHO PROVIDES YOUR SERVICES</p>
            <p>{copy.disclosure}</p>
            <Link href="/regulatory-information" className="text-link">
              Regulatory information <ArrowUpRight size={16} />
            </Link>
          </aside>
          <nav className="sports-service-links" aria-label="Explore related services">
            <Link href="/estate-planning">
              Estate planning <ArrowUpRight size={16} />
            </Link>
            <Link href="/financial-advice">
              Financial advice <ArrowUpRight size={16} />
            </Link>
            <Link href="/property-finance">
              Property finance <ArrowUpRight size={16} />
            </Link>
          </nav>
        </div>
      </div>
    </main>
  );
}
