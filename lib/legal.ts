export const legalPages: Record<
  string,
  { title: string; intro: string; sections: { title: string; text: string }[] }
> = {
  privacy: {
    title: 'Your privacy matters.',
    intro: 'How Better Call Sim and Anand Wills & Trusts Ltd handle the information you provide.',
    sections: [
      {
        title: 'Data controller and business identity',
        text: 'Better Call Sim is a trading style of Anand Wills & Trusts Ltd, the data controller for personal information collected through this website. If you have questions about how your data is handled or wish to exercise your data rights, contact Simran Sahota at Simran@anandassociates.com or by telephone on +44 7711 902299.',
      },
      {
        title: 'Enquiries and report requests',
        text: 'When you request a Financial & Estate Review or get in touch, we collect your name, email address, optional telephone number, area of interest, contact preference and your message. The inheritance tax calculator generates its PDF report entirely in your browser memory; your calculation figures and name are not stored on our servers or submitted into a marketing database.',
      },
      {
        title: 'How we use your information',
        text: 'Information submitted through our enquiry forms is used solely to respond to your request, arrange your review conversation and provide any follow-up you have requested. We do not sell your data or share it with third parties for their own marketing. If you choose to opt into our educational email updates, you may unsubscribe at any time.',
      },
      {
        title: 'Storage and service providers',
        text: 'Form submissions are transmitted securely via Resend directly to Sim’s configured business inbox. This website does not maintain an unencrypted lead database or publicly accessible archive of submissions. Hosting infrastructure is provided via Vercel with enterprise-grade SSL encryption and security controls.',
      },
      {
        title: 'Retention and access',
        text: 'Enquiry details are retained in our secure email records for as long as necessary to manage our client relationship and meet statutory professional record-keeping standards. You have the right to request a copy of the personal information we hold about you, request corrections, or ask for deletion where no statutory retention requirement applies.',
      },
      {
        title: 'Your choices and rights',
        text: 'Under UK data protection legislation (UK GDPR), you have the right to access, rectify, or request erasure of your personal data, restrict processing, and withdraw consent at any time. You also have the right to raise a concern with the Information Commissioner’s Office (ICO) at ico.org.uk.',
      },
      {
        title: 'External websites and social platforms',
        text: 'Links to Instagram (@bettercallsimuk), TikTok, WhatsApp or external resources are provided for your convenience. Visiting those platforms is subject to the respective provider’s own privacy and cookie policies.',
      },
    ],
  },
  cookies: {
    title: 'Simple, considered privacy.',
    intro: 'Our approach to cookies and tracking on this website.',
    sections: [
      {
        title: 'Essential website operation only',
        text: 'This website is built with a privacy-first approach. We do not use third-party tracking pixels, invasive cross-site advertising cookies, or persistent marketing trackers. Essential cookies may be deployed solely by the hosting infrastructure for performance, security and routing.',
      },
      {
        title: 'Calculator privacy',
        text: 'The inheritance tax calculator runs locally in your browser session. Your financial figures, assets and family scenarios are never recorded in persistent browser cookies or transmitted to analytics tools.',
      },
      {
        title: 'External content and links',
        text: 'Social media links (Instagram, TikTok, WhatsApp) open the respective external platforms in a new tab. We do not embed active third-party tracking scripts from social networks on our pages.',
      },
    ],
  },
  terms: {
    title: 'Using this website.',
    intro: 'General information and terms governing the use of this website.',
    sections: [
      {
        title: 'Educational information and illustrations',
        text: 'Content provided on this website, including articles, calculators and illustrations, is for general educational and informational purposes only. It does not constitute personal financial, tax, or legal advice, nor does it create a client relationship. Every individual’s circumstances are unique; you should always seek formal advice tailored to your situation before making financial or legal commitments.',
      },
      {
        title: 'Reviews and enquiries',
        text: 'Submitting a review request or enquiry initiates a conversation. It does not constitute formal engagement for regulated financial advice or legal services. The scope of any formal service, regulatory status, terms of engagement and any applicable fees will be agreed with you in writing before any chargeable work begins.',
      },
      {
        title: 'Accuracy and regulatory evolution',
        text: 'Tax legislation, inheritance tax thresholds, regulatory rules and product terms are subject to change by UK authorities. While reasonable care is taken to ensure content is accurate at the time of publication, no guarantee is given regarding the future applicability of tax reliefs, mortgage approvals, or investment returns.',
      },
      {
        title: 'Intellectual property',
        text: 'All branding, copy, custom illustrations, design elements and media on this website are the property of Anand Wills & Trusts Ltd trading as Better Call Sim. Unauthorised reproduction or distribution is prohibited.',
      },
    ],
  },
  complaints: {
    title: 'If something isn’t right.',
    intro: 'Clear routes for resolving concerns depending on the service provided.',
    sections: [
      {
        title: 'Our commitment',
        text: 'We strive to provide clear, high-quality guidance and professional service. If you are dissatisfied with any aspect of our service, please contact Simran Sahota at Simran@anandassociates.com or call +44 7711 902299 so we can review your concerns promptly.',
      },
      {
        title: 'Regulated financial services complaints',
        text: 'Where your complaint relates to regulated financial advice or regulated property finance provided through Anand Financial Architecture Ltd, it will be handled under the firm’s formal complaints procedure in accordance with FCA rules. If you cannot settle your complaint with the firm, you may be entitled to refer it to the Financial Ombudsman Service (FOS) at financial-ombudsman.org.uk.',
      },
      {
        title: 'Estate planning complaints',
        text: 'Estate planning, Wills and trusts are provided through Anand Wills & Trusts Ltd in association with Countrywide Tax & Trust Corporation Ltd. These services are outside FCA regulation. Complaints regarding estate planning will be handled directly through Anand Wills & Trusts Ltd’s internal complaint process, in accordance with applicable professional codes.',
      },
    ],
  },
  accessibility: {
    title: 'A website you can use.',
    intro:
      'We are committed to making our website accessible, clear and usable for everyone.',
    sections: [
      {
        title: 'Accessibility features',
        text: 'This website is designed to comply with WCAG 2.2 Level AA accessibility guidelines. Features include full keyboard navigation, visible focus indicators, screen-reader friendly markup, high-contrast typography, responsive scaling across mobile and desktop, and reduced-motion support.',
      },
      {
        title: 'Alternative formats and tools',
        text: 'The inheritance tax calculator provides an on-screen readable summary as well as a downloadable PDF report. Complex planning concepts are presented in plain English without unnecessary legal or financial jargon.',
      },
      {
        title: 'Feedback and assistance',
        text: 'If you encounter any difficulty accessing content or navigating this website, please let us know. Contact Simran Sahota directly at Simran@anandassociates.com or on +44 7711 902299, and we will be glad to assist you with alternative formats.',
      },
    ],
  },
  'regulatory-information': {
    title: 'Clear about who does what.',
    intro:
      'One coordinated planning conversation does not mean every service has the same provider or regulatory status. We make the roles, permissions and protections explicit.',
    sections: [
      {
        title: 'Financial advice and property finance',
        text: 'Better Call Sim is a trading style of Anand Wills & Trusts Ltd. Regulated financial advice and regulated property finance are provided by Anand Financial Architecture Ltd, which is authorised and regulated by the Financial Conduct Authority (FCA Firm Reference Number 797619). You can verify Anand Financial Architecture Ltd and its permissions on the FCA Financial Services Register at register.fca.org.uk.',
      },
      {
        title: 'Estate planning, Wills and trusts',
        text: 'Estate planning, will writing and trust planning services are provided through Anand Wills & Trusts Ltd in association with Countrywide Tax & Trust Corporation Ltd. Estate planning and will-writing services are outside the scope of FCA regulation. The terms of engagement, specific services and governing jurisdiction are confirmed in writing before work begins.',
      },
      {
        title: 'Property finance varies',
        text: 'Residential mortgages and regulated equity release are FCA-regulated activities. Most buy-to-let mortgages, commercial lending, and certain bridging finance arrangements are not regulated by the FCA. The regulatory status, consumer protections and risks are explained for each specific financing structure before you proceed.',
      },
      {
        title: 'Professional credentials and consumer protections',
        text: 'Anand Wills & Trusts Ltd works in association with Countrywide Tax & Trust Corporation Ltd, an established estate-planning specialist whose organisation includes STEP-qualified practitioners (Trust and Estate Practitioners). Countrywide states that it follows the STEP Will Writing Code. Financial Ombudsman Service (FOS) and Financial Services Compensation Scheme (FSCS) protections apply strictly to eligible regulated activities carried out through Anand Financial Architecture Ltd, and do not apply to unregulated estate-planning services.',
      },
      {
        title: 'Investment and property risk warnings',
        text: 'The value of investments and any income from them can fall as well as rise, and you may get back less than you invest. Past performance is no guarantee of future returns. Tax treatment depends on individual circumstances and may change. Your home or property may be repossessed if you do not keep up repayments on a mortgage or other loan secured against it.',
      },
    ],
  },
};
