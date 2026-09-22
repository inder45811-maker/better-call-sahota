import Image from 'next/image';
import { ArrowUpRight, Camera } from 'lucide-react';
import { PageIntro, ReviewButton, RelatedPillars } from '@/components/content';
import { site } from '@/lib/site';

const chapters = [
  {
    id: 'understanding-people',
    title: 'Being good with people starts with understanding them.',
    paragraphs: [
      'Financial planning shouldn’t be about throwing technical language at somebody until they nod politely and hope the meeting ends.',
      'It should be about listening, understanding what somebody is trying to achieve, identifying the problems they may not have considered and then explaining their options in a way that actually makes sense.',
      'That’s ultimately why I created Better Call Sim.',
    ],
  },
  {
    id: 'financial-services',
    title: 'More than a decade in financial services',
    paragraphs: [
      'Since moving into financial services, I’ve built experience across mortgages, protection, financial planning and estate planning, working with clients at very different stages of their financial lives.',
      'Today, my work increasingly focuses on bringing those different areas together.',
      'Because your Will shouldn’t be considered completely separately from your property.',
      'Your life insurance shouldn’t necessarily be considered separately from your estate.',
      'And your inheritance tax planning shouldn’t ignore your businesses, investments, pensions, mortgages or the people who will eventually inherit your wealth.',
      'Good planning means looking at the bigger picture.',
    ],
  },
  {
    id: 'working-alongside-bhupinder',
    title: 'Working alongside Bhupinder Anand',
    paragraphs: [
      'In July 2023, I joined Bhupinder Anand as his only consultant, working directly alongside him across financial and estate planning.',
      'Bhupinder’s career spans more than three decades. He has achieved 30 years of Million Dollar Round Table membership, including 25 years at Top of the Table level, and has twice been recognised as UK Independent Financial Adviser of the Year.',
      'He has also been recognised by the Evening Standard as “Best IFA in the Capital” and has spent years sharing his experience with financial advisers around the world.',
      'Working directly alongside Bhupinder has given me something I consider incredibly valuable: access to decades of high-level financial planning experience, technical knowledge and a wider professional network of expertise.',
      'It means that when I’m working with a client, I’m not restricted to looking at one product or one problem in isolation.',
      'We can look at the entire financial picture.',
      'And where a situation becomes particularly complex, I have access to an exceptional depth of financial planning knowledge and professional experience when considering the appropriate strategy.',
    ],
  },
  {
    id: 'why-better-call-sim',
    title: 'Why “Better Call Sim”?',
    paragraphs: [
      'Because I believe professional advice should feel like a conversation, not a lecture.',
      'Better Call Sim is my way of making financial and estate planning clearer, more accessible and more human.',
      'It’s also why I create educational content online.',
      'There are incredibly powerful financial and estate planning strategies available in the UK, but they’re useless to somebody who doesn’t know they exist or can’t understand how they work.',
      'Sometimes my job is identifying a potential inheritance tax problem.',
      'Sometimes it’s making sure a mortgage can be cleared if somebody dies.',
      'Sometimes it’s protecting wealth for the next generation.',
      'Sometimes it’s helping a business owner understand how their personal and business planning interact.',
      'And sometimes it’s simply showing somebody an option they didn’t know they had.',
    ],
  },
];

export function MeetSimPage() {
  return (
    <main id="main">
      <PageIntro
        eyebrow="MEET SIM"
        title="About Simran"
        description="Financial planning is complicated enough. Getting good advice shouldn’t be."
      />
      <section className="container about-layout biography-intro" aria-labelledby="simran-name">
        <div className="about-mark">
          <Image
            src={site.adviserPortrait}
            alt="Simran Singh Sahota, founder of Better Call Sim"
            width={1122}
            height={1402}
            sizes="(max-width: 760px) 90vw, 600px"
          />
        </div>
        <div>
          <p className="eyebrow">THE PERSON BEHIND THE PLAN</p>
          <h2 id="simran-name">I’m Simran Singh Sahota, founder of Better Call Sim.</h2>
          <p>
            I’ve worked in financial services for more than a decade and became professionally
            qualified in 2016, but my career actually started in sales and customer service.
          </p>
          <p>
            Before entering financial services, I worked for both Phones4u and Carphone Warehouse.
            At Phones4u, I became the top salesperson in my store, progressing into a Deputy Manager
            role. I later joined Carphone Warehouse, where I became the number one consultant out of
            approximately 500 consultants across the company.
          </p>
          <p>
            Those years taught me something that has stayed with me throughout my career: being good
            with people starts with understanding them.
          </p>
          <a href={site.instagram} className="text-link" target="_blank" rel="noreferrer">
            <Camera size={18} /> Meet Sim on Instagram <ArrowUpRight size={17} />
          </a>
        </div>
      </section>
      <div className="container biography-layout">
        <aside className="biography-contents" aria-label="On this page">
          <p className="eyebrow">MY STORY</p>
          <nav aria-label="Biography chapters">
            <a href="#understanding-people">Understanding people</a>
            <a href="#financial-services">My financial-services experience</a>
            <a href="#working-alongside-bhupinder">Working alongside Bhupinder</a>
            <a href="#why-better-call-sim">Why Better Call Sim?</a>
            <a href="#professional-support">STEP and professional support</a>
            <a href="#my-approach">My approach</a>
          </nav>
        </aside>
        <div className="biography-chapters">
          {chapters.map((chapter) => (
            <section id={chapter.id} key={chapter.id} aria-labelledby={chapter.id + '-title'}>
              <h2 id={chapter.id + '-title'}>{chapter.title}</h2>
              {chapter.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
          <section id="professional-support" aria-labelledby="professional-support-title">
            <p className="eyebrow">SPECIALIST ESTATE-PLANNING SUPPORT</p>
            <h2 id="professional-support-title">STEP and professional support</h2>
            <p>
              Anand Wills &amp; Trusts works in association with Countrywide Tax &amp; Trust
              Corporation Ltd. Countrywide’s team includes full members of STEP, the Society of
              Trust and Estate Practitioners, who hold the Trust and Estate Practitioner (TEP)
              designation.
            </p>
            <p>
              Countrywide also states that it follows the STEP Will Writing Code when drafting
              Wills. These memberships belong to the individual practitioners at Countrywide.
            </p>
            <p>
              <a href="https://countrywidegroup.co.uk/im-planning-my-will" target="_blank" rel="noreferrer">
                Read about Countrywide’s STEP practitioners
              </a>
              {' · '}
              <a href="https://fliphtml5.com/vbugf/lrmd/Futureproof_Your_Estate_-_An_Essential_Guide/" target="_blank" rel="noreferrer">
                Anand’s estate-planning guide
              </a>
            </p>
          </section>
          <section id="my-approach" className="biography-approach" aria-labelledby="approach-title">
            <p className="eyebrow">A PLAN BUILT AROUND YOU</p>
            <h2 id="approach-title">My approach is simple:</h2>
            <ol>
              <li>Understand where you are.</li>
              <li>Understand where you want to be.</li>
              <li>Identify the problems and opportunities in between.</li>
              <li>Then build the right plan around you.</li>
            </ol>
            <p>That’s what Better Call Sim is about.</p>
            <ReviewButton />
          </section>
        </div>
      </div>
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
}

