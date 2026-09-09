export const CONTENT_UPDATED = '2026-09-09';
export const CONTENT_UPDATED_LABEL = '9 September 2026';
export type Source = { name: string; url: string };
export type Answer = { question: string; answer: string; sources: Source[] };
const gov = (name: string, path: string): Source => ({
  name: 'GOV.UK: ' + name,
  url: 'https://www.gov.uk/' + path,
});
const mh = (name: string, path: string): Source => ({
  name: 'MoneyHelper: ' + name,
  url: 'https://www.moneyhelper.org.uk/en/' + path,
});
const wills = gov('Making a will', 'make-will');
const trusts = gov('Trusts and taxes', 'trusts-taxes');
const lpas = gov('Lasting powers of attorney', 'power-of-attorney');
const iht = gov('Inheritance Tax', 'inheritance-tax');
const pensions = mh('Pensions and retirement', 'pensions-and-retirement');
const investing = mh(
  'Understanding investment risks',
  'savings/investing/thinking-about-investing-make-sure-you-understand-the-risks',
);
const mortgages = mh('Mortgages and homebuying', 'homes/buying-a-home');
const insurance = mh('Insurance', 'everyday-money/insurance');
const answer = (question: string, text: string, ...sources: Source[]): Answer => ({
  question,
  answer: text,
  sources,
});

export const serviceAnswers: Record<string, Answer> = {
  wills: answer(
    'What is a will?',
    'A will records who should inherit your estate after your death and who should carry out your wishes. It can also record guardianship wishes for children. Validity, family circumstances and assets that pass outside the will need separate consideration.',
    wills,
  ),
  trusts: answer(
    'What is a trust?',
    'A trust is a legal arrangement in which trustees hold and manage assets for beneficiaries under agreed terms. It can help organise when and how people receive support, but creates legal, administration and potentially tax obligations.',
    trusts,
  ),
  'lasting-powers-of-attorney': answer(
    'What is a lasting power of attorney?',
    'In England and Wales, an LPA lets you appoint trusted people to make specified decisions during your lifetime. Property and financial affairs, and health and welfare, use separate documents. An LPA must be made with the required capacity and registered before use.',
    lpas,
  ),
  'inheritance-tax-planning': answer(
    'What does inheritance tax planning involve?',
    'Inheritance tax planning considers the value of your estate, who will inherit, available allowances and exemptions, and the effect of gifts or other arrangements. A useful plan starts with your own needs; it cannot promise that tax will be avoided.',
    iht,
  ),
  'bloodline-protection': answer(
    'What does bloodline protection mean?',
    'Bloodline protection is a planning term for considering how family wealth passes to intended beneficiaries over time. Wills, trusts and ownership arrangements may play a part. No arrangement guarantees protection against every family dispute, legal claim, tax charge or care assessment.',
    wills,
    trusts,
  ),
  'business-succession': answer(
    'What is business succession planning?',
    'Business succession planning considers who will own, control and run a business when an owner retires, loses capacity or dies. It brings business agreements, personal estate plans and funding questions together; tax relief and insurance suitability require separate checks.',
    gov('Selling or transferring a business', 'browse/business/sell-transfer-your-business'),
    gov('Business Relief for Inheritance Tax', 'business-relief-inheritance-tax'),
  ),
  'care-planning': answer(
    'What does financial planning for care cover?',
    'Care planning considers possible support needs, available income and assets, decision-making arrangements and the rules for funding care. Needs and financial assessments matter. Giving away assets does not guarantee that they will be disregarded in a care assessment.',
    {
      name: 'NHS: Paying for your own care',
      url: 'https://www.nhs.uk/social-care-and-support/money-work-and-benefits/paying-for-your-own-care-self-funding/',
    },
  ),
  investments: answer(
    'What does investment planning involve?',
    'Investment planning connects your goals, time horizon and need for access to your money with the risks you can afford and are willing to take. It considers diversification, charges and tax. Investment values can fall as well as rise.',
    investing,
  ),
  pensions: answer(
    'What is a pension review?',
    'A pension review brings together your existing pension arrangements, retirement goals, expected spending and other resources. It considers charges, investments, guarantees and beneficiaries. Transferring or combining pensions is not automatically beneficial and can mean losing valuable benefits.',
    pensions,
  ),
  isas: answer(
    'What is an ISA?',
    'An Individual Savings Account is a UK tax wrapper for eligible savings or investments. Different ISA types serve different needs and have eligibility and contribution rules. A tax wrapper does not remove investment risk or make every underlying investment suitable.',
    gov('Individual Savings Accounts', 'individual-savings-accounts'),
  ),
  'investment-bonds': answer(
    'What is an investment bond?',
    'An investment bond usually holds a lump-sum investment within a life insurance policy. Its charges, investment choices, access terms and tax treatment need careful consideration. It is different from a bank savings bond or lending money directly to a company.',
    mh('Investment bonds', 'savings/investing/what-are-investment-bonds'),
  ),
  'life-assurance': answer(
    'What does life assurance cover?',
    'Life assurance or life insurance can provide a payment on death, subject to the policy terms. Planning considers who depends on you, how much cover is needed, how long it should last and who should receive the payment.',
    mh('Life insurance', 'everyday-money/insurance/what-is-life-insurance'),
  ),
  'income-protection': answer(
    'What is income protection insurance?',
    'Income protection can replace part of your earnings if illness or injury prevents you from working, subject to the policy definition and waiting period. Cover limits, exclusions, employer sick pay and the length of benefit payments all matter.',
    mh(
      'Income protection insurance',
      'everyday-money/insurance/what-is-income-protection-insurance',
    ),
  ),
  'business-protection': answer(
    'What does business protection planning cover?',
    'Business protection planning considers the financial effect of losing an owner or key person through death or serious illness. Insurance may support business continuity, debt repayment or ownership arrangements, but the cover, policy ownership and agreements must fit the business.',
    insurance,
  ),
  mortgages: answer(
    'What is a mortgage?',
    'A mortgage is borrowing secured against a property. A review considers affordability, deposit, interest-rate structure, fees and repayment term. The property may be repossessed if repayments are not maintained, so the overall cost and risks matter as well as the monthly payment.',
    mortgages,
  ),
  remortgages: answer(
    'What is remortgaging?',
    'Remortgaging means replacing an existing mortgage with a new mortgage, usually with a different lender. It can be considered when a deal ends or circumstances change. Compare fees, early repayment charges, the total cost and alternatives with your current lender.',
    mh('A guide to remortgaging', 'homes/buying-a-home/a-guide-to-remortgaging'),
  ),
  'buy-to-let': answer(
    'What is a buy-to-let mortgage?',
    'A buy-to-let mortgage is generally used to finance a property intended for letting to tenants. Lender criteria, rental income, ownership structure and tax need consideration. Regulatory treatment varies; many business buy-to-let mortgages are outside FCA regulation.',
    mh('Buy-to-let mortgages', 'blog/buy-or-rent-a-home/buy-to-let-mortgages-explained'),
  ),
  bridging: answer(
    'What is bridging finance?',
    'Bridging finance is short-term borrowing, usually secured on property, to cover a temporary funding gap. It needs a credible repayment route and careful consideration of interest, fees and what happens if plans are delayed. Regulation depends on the arrangement.',
    mortgages,
  ),
  'second-charges': answer(
    'What is a second charge mortgage?',
    'A second charge mortgage is additional borrowing secured against a property that already has a mortgage. The original mortgage stays in place. Compare the combined repayments, total cost and alternatives, because both loans can put the property at risk.',
    mh('Second charge mortgages', 'homes/buying-a-home/second-charge-or-second-mortgages'),
  ),
  'equity-release': answer(
    'What is equity release?',
    'Equity release lets eligible homeowners access some of their property value, typically through a lifetime mortgage or home reversion plan. It can affect inheritance, benefits and future choices. Costs, alternatives and specialist advice need careful consideration before proceeding.',
    mh('Equity release', 'homes/buying-a-home/what-is-equity-release'),
  ),
};
export const hubAnswers: Record<string, Answer> = {
  'estate-planning': answer(
    'What does estate planning bring together?',
    'Estate planning connects your wishes for inheritance with arrangements for decisions during life. It can include wills, trusts, LPAs, inheritance tax, business succession and care planning. The documents and advice needed depend on your family, assets and the applicable jurisdiction.',
    wills,
    lpas,
    iht,
  ),
  'financial-advice': answer(
    'What can a financial review help you understand?',
    'A financial review brings your goals, savings, investments, pensions and protection into one conversation. It helps identify the questions that need attention and whether regulated advice is needed. The actual provider, advice scope, charges and permissions must be explained before you proceed.',
    investing,
    pensions,
    insurance,
  ),
  'property-finance': answer(
    'What does a property finance review cover?',
    'A property finance review considers what you want to buy or refinance, what you can afford and the costs and risks of different borrowing options. It can cover residential mortgages, landlord finance and specialist lending, with regulation depending on the product and circumstances.',
    mortgages,
  ),
};
export const calculatorAnswer = answer(
  'What does this inheritance tax calculator estimate?',
  'This calculator illustrates a limited set of straightforward UK estate scenarios using its stated 2026/27 rules. It considers assets, debts, beneficiaries and available allowances, then produces a report. Complex or uncertain answers require adviser review and may prevent a numerical estimate. It does not recommend products or calculate guaranteed tax savings.',
  iht,
);
export const articleAnswers: Record<string, string> = {
  'wills-and-lpas':
    'A will deals with your wishes after death. An LPA appoints someone to make specified decisions during your lifetime. They serve different purposes, so having one does not replace consideration of the other. LPA rules described here apply to England and Wales.',
  'pension-review-checklist':
    'Bring recent pension statements, contribution details, information about guarantees and charges, a State Pension forecast, and a picture of your goals and spending. A review should start with what you already have before considering whether anything should change.',
  'before-you-remortgage':
    'Check the end date of your deal, remaining balance, early repayment charges and the rate you may move onto. Compare your current lender’s options with alternatives using fees, affordability and the total cost, not the headline rate alone.',
};
