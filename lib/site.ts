export const site = {
  name: 'Better Call Sim',
  adviser: 'Simran Sahota',
  location: 'Northolt, West London',
  instagram: 'https://www.instagram.com/bettercallsimuk/',
  origin: (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, ''),
  preview: true,
  // Replace only with client-verified details. Do not add example numbers.
  phone: '+44 7711 902299',
  whatsapp: '+44 7711 902299',
  email: '',
  legalEntity: '',
  regulatedProvider: '',
  fcaReference: '',
  principal: '',
  adviserPortrait: '/brand/simran-sahota.png',
  adviserStory:
    'I’m Simran Sahota, the person behind Better Call Sim. My approach starts with a conversation about your family, your priorities and what you want to put in place. This website brings those estate-planning conversations together with the financial and property questions that often sit alongside them.',
  bookingUrl: 'https://calendly.com/estateplanningexpertise',
};
export const REVIEW_CTA = 'Book Your Financial & Estate Review';
export const pillars = [
  {
    slug: 'estate-planning',
    title: 'Estate Planning',
    subtitle: 'For the people who matter most.',
    description: 'Make your wishes clear, think ahead and bring your family’s future into focus.',
    eyebrow: 'YOUR WISHES. THOUGHTFULLY PLANNED.',
    lead: 'A plan for the people\nyou love.',
    services: 'Wills · Trusts · LPAs · Inheritance Tax',
    icon: 'shield',
  },
  {
    slug: 'financial-advice',
    title: 'Financial Advice',
    subtitle: 'Give your money a purpose.',
    description: 'Connect the decisions you make today with the life you want to live tomorrow.',
    eyebrow: 'YOUR MONEY. WITH DIRECTION.',
    lead: 'Plan for the life\nyou want to live.',
    services: 'Investments · Pensions · Protection',
    icon: 'sprout',
  },
  {
    slug: 'property-finance',
    title: 'Property Finance',
    subtitle: 'Your next chapter starts here.',
    description:
      'Explore your options for buying, refinancing and making decisions about property.',
    eyebrow: 'YOUR PROPERTY. YOUR NEXT CHAPTER.',
    lead: 'A clearer path to\nyour next property.',
    services: 'Mortgages · Remortgages · Equity Release',
    icon: 'home',
  },
] as const;
export const stages = [
  {
    name: 'Build',
    verb: 'Start with strong foundations.',
    text: 'Your home, your income, your priorities. Get a clear picture of where you are and what comes next.',
    links: [
      { label: 'Property finance', href: '/property-finance' },
      { label: 'Financial advice', href: '/financial-advice' },
    ],
  },
  {
    name: 'Grow',
    verb: 'Give your ambitions a plan.',
    text: 'Consider how investments, pensions and savings could support your goals, with risk kept in view.',
    links: [
      { label: 'Investments', href: '/financial-advice/investments' },
      { label: 'Pensions', href: '/financial-advice/pensions' },
    ],
  },
  {
    name: 'Protect',
    verb: 'Look after what matters.',
    text: 'Think through the unexpected, protect your income and record who you trust to make decisions.',
    links: [
      { label: 'Life assurance', href: '/financial-advice/life-assurance' },
      { label: 'Powers of attorney', href: '/estate-planning/lasting-powers-of-attorney' },
    ],
  },
  {
    name: 'Pass on',
    verb: 'Make your wishes count.',
    text: 'Bring together your will, inheritance plans and business succession with the people you want to benefit.',
    links: [
      { label: 'Estate planning', href: '/estate-planning' },
      { label: 'IHT calculator', href: '/iht-calculator' },
    ],
  },
];
export const homeFaqs = [
  {
    q: 'Where should I start if I’m not sure what I need?',
    a: 'Start with the Financial & Estate Review. Share what is on your mind and the areas you would like to explore. You do not need to choose a product or have every document ready to begin a conversation.',
  },
  {
    q: 'Can I get help with just one part of my planning?',
    a: 'Yes. You may be thinking about a will, a pension or a mortgage. The service pages explain each area and show where a related decision may also deserve attention.',
  },
  {
    q: 'What does the initial review cost?',
    a: 'The scope and any fee will be confirmed before the appointment. Submitting a request does not commit you to a product or a paid service.',
  },
  {
    q: 'Are all the services FCA regulated?',
    a: 'No. Estate-planning services such as will writing sit outside FCA regulation. Financial advice and some property-finance activities have different regulatory requirements. The provider and applicable protections must be confirmed before you proceed.',
  },
  {
    q: 'Can I use the IHT calculator instead of taking advice?',
    a: 'The calculator is an illustration for a limited range of straightforward situations. It cannot assess suitability or every exemption, relief or family circumstance. Its report shows assumptions and identifies when an adviser’s review is needed.',
  },
];
