/** A deliberately bounded illustration, not a full tax or suitability engine. */
export const IHT_RULES = {
  version: '2026-27.2',
  from: '2026-04-06',
  to: '2027-04-05',
  taxYear: '2026/27',
  nilRateBand: 325000,
  residenceBand: 175000,
  taperThreshold: 2000000,
  rate: 0.4,
} as const;
export type IhtScenario = 'individual' | 'couple' | 'survivor';
export type IhtInput = {
  date: string;
  scenario: IhtScenario;
  residence: 'straightforward-uk' | 'other' | 'unsure';
  beneficiaries: 'descendants' | 'others' | 'spouse' | 'mixed' | 'unsure';
  home: number;
  homeMortgage: number;
  savings: number;
  investments: number;
  otherAssets: number;
  debts: number;
  pensions: number;
  qualifyingHome: 'yes' | 'no' | 'unsure';
  transferNrb: '0' | '50' | '100' | 'unsure';
  transferRnrb: '0' | '50' | '100' | 'unsure';
  pensionTreatment: 'none' | 'confirmed-excluded' | 'review';
  complexity: 'none' | 'yes' | 'unsure';
  /** Couple scenario only: does everything pass outright to the survivor on the first death? */
  firstDeathPassing: 'na' | 'all-to-spouse' | 'other' | 'unsure';
  /** Couple scenario only: could either partner's own net estate exceed the taper threshold? */
  largerEstateOver2m: 'na' | 'no' | 'yes' | 'unsure';
  /** Couple scenario only: net estate of the partner with the larger share (when over £2m). */
  largerEstate: number;
};
export const EMPTY_IHT: IhtInput = {
  date: '2026-09-08',
  scenario: 'individual',
  residence: 'unsure',
  beneficiaries: 'unsure',
  home: 0,
  homeMortgage: 0,
  savings: 0,
  investments: 0,
  otherAssets: 0,
  debts: 0,
  pensions: 0,
  qualifyingHome: 'unsure',
  transferNrb: '0',
  transferRnrb: '0',
  pensionTreatment: 'none',
  complexity: 'unsure',
  firstDeathPassing: 'na',
  largerEstateOver2m: 'na',
  largerEstate: 0,
};
/** Shared labels so the dropdown, results screen and PDF always describe the same scenario. */
export const SCENARIO_LABELS: Record<IhtScenario, string> = {
  individual: 'An individual estate',
  couple: 'A married couple / civil partners — estimate after both deaths',
  survivor: 'A surviving spouse / civil partner’s estate',
};
export const COUPLE_HEADING = 'Estimated inheritance tax after both deaths';
export const COUPLE_EXPLANATION =
  'This illustration uses current asset values and the selected tax-year rules. It assumes assets pass to the surviving spouse or civil partner on the first death and that the stated unused allowances are available to transfer. Actual liability depends on your circumstances, eligibility and the rules at each death.';
export const COUPLE_SCOPE =
  'This estimates the position after the second death using current values and the selected tax-year rules. It is not a first-death tax calculation or a prediction of future tax law.';
const options: Record<string, readonly string[]> = {
  scenario: ['individual', 'couple', 'survivor'],
  residence: ['straightforward-uk', 'other', 'unsure'],
  beneficiaries: ['descendants', 'others', 'spouse', 'mixed', 'unsure'],
  qualifyingHome: ['yes', 'no', 'unsure'],
  transferNrb: ['0', '50', '100', 'unsure'],
  transferRnrb: ['0', '50', '100', 'unsure'],
  pensionTreatment: ['none', 'confirmed-excluded', 'review'],
  complexity: ['none', 'yes', 'unsure'],
  firstDeathPassing: ['na', 'all-to-spouse', 'other', 'unsure'],
  largerEstateOver2m: ['na', 'no', 'yes', 'unsure'],
};
export const moneyFields = [
  'home',
  'homeMortgage',
  'savings',
  'investments',
  'otherAssets',
  'debts',
  'pensions',
  'largerEstate',
] as const;
/**
 * Scenario-specific answers that must not survive a scenario switch.
 * Used by the UI when the scenario changes and by validation as a safety net.
 */
export function resetForScenario(input: IhtInput, scenario: IhtScenario): IhtInput {
  const next: IhtInput = { ...input, scenario };
  if (scenario !== 'survivor') {
    next.transferNrb = '0';
    next.transferRnrb = '0';
  }
  if (scenario === 'couple') {
    if (input.scenario !== 'couple') {
      next.firstDeathPassing = 'unsure';
      next.largerEstateOver2m = 'unsure';
      next.largerEstate = 0;
    }
    if (next.beneficiaries === 'spouse') next.beneficiaries = 'unsure';
  } else {
    next.firstDeathPassing = 'na';
    next.largerEstateOver2m = 'na';
    next.largerEstate = 0;
  }
  return next;
}
/** Older callers (and the agent tool) may omit the couple-only fields. */
const EMPTY_IHT_COUPLE_DEFAULTS = {
  firstDeathPassing: 'na',
  largerEstateOver2m: 'na',
  largerEstate: 0,
} as const;
export function validateIht(value: unknown): IhtInput {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Please check your calculator answers.');
  const obj: Record<string, unknown> = {
    ...EMPTY_IHT_COUPLE_DEFAULTS,
    ...(value as Record<string, unknown>),
  };
  if (
    typeof obj.date !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(obj.date) ||
    Number.isNaN(Date.parse(obj.date)) ||
    new Date(obj.date).toISOString().slice(0, 10) !== obj.date
  )
    throw new Error('Enter a valid calculation date.');
  for (const [key, allowed] of Object.entries(options))
    if (typeof obj[key] !== 'string' || !allowed.includes(obj[key] as string))
      throw new Error('Please answer each question before continuing.');
  for (const key of moneyFields)
    if (
      typeof obj[key] !== 'number' ||
      !Number.isFinite(obj[key]) ||
      obj[key] < 0 ||
      obj[key] > 1e9 ||
      Math.abs(obj[key] * 100 - Math.round(obj[key] * 100)) > 0.0001
    )
      throw new Error('Enter amounts between £0 and £1 billion, using up to two decimal places.');
  if ((obj.homeMortgage as number) > (obj.home as number))
    throw new Error(
      'The mortgage exceeds the home value. This situation needs an adviser’s review.',
    );
  const clean: Record<string, unknown> = { date: obj.date };
  for (const key of [...Object.keys(options), ...moneyFields]) clean[key] = obj[key];
  const input = clean as IhtInput;
  // Couple-only answers are meaningless elsewhere; never let them linger after a switch.
  if (input.scenario !== 'couple') {
    input.firstDeathPassing = 'na';
    input.largerEstateOver2m = 'na';
    input.largerEstate = 0;
  } else if (input.largerEstateOver2m !== 'yes') input.largerEstate = 0;
  return input;
}
const pennies = (n: number) => Math.round(n * 100) / 100;
export function calculateIht(value: unknown) {
  const input = validateIht(value),
    rules = IHT_RULES,
    reasons: string[] = [];
  const couple = input.scenario === 'couple';
  const totalAssets = pennies(input.home + input.savings + input.investments + input.otherAssets);
  const liabilities = pennies(input.homeMortgage + input.debts);
  const estate = Math.max(0, pennies(totalAssets - liabilities));
  if (input.debts > totalAssets - input.homeMortgage)
    reasons.push('Liabilities exceed the assets entered; debt deductibility needs review.');
  if (input.date < rules.from || input.date > rules.to)
    reasons.push(
      'This illustration supports 2026/27 only. Later rules, including pension changes from 6 April 2027, need a fresh review.',
    );
  if (input.residence !== 'straightforward-uk')
    reasons.push(
      'Residence, overseas assets or cross-border circumstances need specialist review.',
    );
  if (['mixed', 'unsure'].includes(input.beneficiaries))
    reasons.push('The beneficiaries or applicable exemptions need clarification.');
  if (input.complexity !== 'none')
    reasons.push(
      couple
        ? 'Gifts, trusts, business or agricultural assets, charity gifts, downsizing, previous marriages or other specialist factors for either partner need review. These can use up or restrict the allowances available to transfer.'
        : 'Gifts, trusts, business or agricultural assets, charity gifts, downsizing or other specialist factors need review.',
    );
  if (input.pensions > 0 && input.pensionTreatment !== 'confirmed-excluded')
    reasons.push('The inheritance-tax treatment of the pension benefits has not been confirmed.');
  if (input.pensionTreatment === 'review')
    reasons.push('Pension treatment has been flagged for review.');
  if (
    input.scenario === 'survivor' &&
    (input.transferNrb === 'unsure' || input.transferRnrb === 'unsure')
  )
    reasons.push('Unused allowances from the late spouse or civil partner need to be established.');
  if (input.scenario !== 'survivor' && (input.transferNrb !== '0' || input.transferRnrb !== '0'))
    reasons.push('Transferred allowances require the surviving-spouse or civil-partner scenario.');
  if (input.home > 0 && input.beneficiaries === 'descendants' && input.qualifyingHome === 'unsure')
    reasons.push('Eligibility for the residence allowance needs clarification.');
  if (
    input.qualifyingHome === 'yes' &&
    input.beneficiaries !== 'descendants' &&
    input.beneficiaries !== 'spouse'
  )
    reasons.push('The stated home inheritance does not match the beneficiary selection.');
  if (couple) {
    if (input.beneficiaries === 'spouse')
      reasons.push(
        'After the second death there is no surviving spouse or civil partner. Choose who inherits from the survivor.',
      );
    if (input.firstDeathPassing === 'other')
      reasons.push(
        'Some assets pass to someone other than the surviving spouse or civil partner on the first death. That can use up allowances, so the amounts available to transfer need an adviser’s review.',
      );
    else if (input.firstDeathPassing !== 'all-to-spouse')
      reasons.push(
        'It is not confirmed that everything passes outright to the surviving spouse or civil partner on the first death, so full transferable allowances cannot be assumed.',
      );
    if (input.largerEstateOver2m === 'yes') {
      if (input.largerEstate <= rules.taperThreshold)
        reasons.push(
          'You indicated that one partner’s estate exceeds £2 million, but the amount entered does not. Please check this answer.',
        );
      else if (input.largerEstate > estate)
        reasons.push(
          'The larger individual estate entered exceeds the combined net estate, implying net liabilities for the other partner. This needs an adviser’s review.',
        );
    } else if (input.largerEstateOver2m === 'no') {
      if (estate > rules.taperThreshold * 2)
        reasons.push(
          'The combined net estate exceeds £4 million, so at least one partner’s own estate must exceed £2 million. Please enter the larger individual estate so first-death tapering can be applied.',
        );
    } else
      reasons.push(
        'It is not known whether either partner’s own estate exceeds £2 million. Tapering on the first death can reduce the residence allowance available to transfer, so this needs to be established.',
      );
  }
  // Basic nil-rate band: own band plus any transferred percentage.
  const transferNrbPct = couple
    ? 1 // Only reached without review when everything passes to the survivor and no gifts apply.
    : input.scenario === 'survivor' && input.transferNrb !== 'unsure'
      ? Number(input.transferNrb) / 100
      : 0;
  const nrb = rules.nilRateBand * (1 + transferNrbPct);
  // Residence nil-rate band: own band plus transferred amount, reduced by first-death taper.
  const firstDeathTaper =
    couple && input.largerEstateOver2m === 'yes'
      ? Math.max(0, (input.largerEstate - rules.taperThreshold) / 2)
      : 0;
  const transferredResidence = couple
    ? Math.max(0, rules.residenceBand - firstDeathTaper)
    : input.scenario === 'survivor' && input.transferRnrb !== 'unsure'
      ? rules.residenceBand * (Number(input.transferRnrb) / 100)
      : 0;
  const untaperedResidence = couple
    ? rules.residenceBand * 2
    : rules.residenceBand + transferredResidence;
  const maximumResidence = rules.residenceBand + transferredResidence;
  // The £2m threshold applies once to the estate being taxed; it does not double for couples.
  const taper = Math.max(0, (estate - rules.taperThreshold) / 2);
  const residenceEligible = input.beneficiaries === 'descendants' && input.qualifyingHome === 'yes';
  const qualifyingHomeValue = Math.max(0, input.home - input.homeMortgage);
  const residenceBand = residenceEligible
    ? Math.max(0, Math.min(qualifyingHomeValue, maximumResidence - taper))
    : 0;
  // Allowance actually lost through tapering (first and second death), after the home-value cap.
  const residenceTaperLoss = residenceEligible
    ? pennies(Math.min(qualifyingHomeValue, untaperedResidence) - residenceBand)
    : 0;
  const exempt = !couple && input.beneficiaries === 'spouse' ? estate : 0;
  const totalAllowances = nrb + residenceBand;
  const taxable = Math.max(0, pennies(estate - exempt - totalAllowances));
  const tax = pennies(taxable * rules.rate);
  const assumptions = [
    `Illustration using rules version ${rules.version}, tax year ${rules.taxYear}, for ${formatDateUK(input.date)}.`,
    ...(couple
      ? [
          COUPLE_SCOPE,
          'The combined assets and liabilities of both partners are entered once, with each joint asset and joint debt counted once.',
          'Everything passes outright to the surviving spouse or civil partner on the first death, so no basic allowance is used then and 100% of it is treated as transferable, subject to a claim being made.',
          firstDeathTaper > 0
            ? `Prudently assumes the partner with the larger estate (${formatMoney(input.largerEstate)}) dies first. Tapering on that death reduces the residence allowance available to transfer to ${formatMoney(transferredResidence)}.`
            : 'Neither partner’s own estate exceeds £2 million, so no residence allowance is lost to tapering on the first death.',
          'The £2 million taper threshold is applied once, to the survivor’s combined estate; it does not double for couples.',
        ]
      : [
          'Only the ownership shares belonging to the estate are included; assets and debts are not counted twice.',
        ]),
    'The supported scenario assumes straightforward UK long-term residence, including the recipient spouse or civil partner where relevant.',
    'No relevant lifetime gifts, trusts, business/agricultural relief, charitable gifts, downsizing claims, overseas assets or other specialist factors are modelled.',
    couple
      ? 'After the second death the estate passes outright to the selected non-exempt beneficiaries.'
      : input.beneficiaries === 'spouse'
        ? 'All of the estate passes to a spouse or civil partner qualifying for full exemption. This is not a calculation of the survivor’s later estate.'
        : 'The estate passes outright to the selected non-exempt beneficiaries.',
    ...(input.scenario === 'survivor'
      ? [
          'The entered unused allowance percentages are assumed to be confirmed and claimable; there is no automatic doubling.',
        ]
      : input.scenario === 'individual'
        ? ['No unused allowance from another estate is included.']
        : []),
    'The residence allowance is limited by the net qualifying home value passing outright to direct descendants, and tapered by £1 for every £2 of net estate value (before exemptions and reliefs) above £2 million.',
    ...(input.pensions > 0
      ? [
          'The entered pension benefits are excluded only on the basis of the user’s confirmation that their treatment has been professionally verified for this date.',
        ]
      : []),
    'No future asset growth, tax savings, product recommendation or guarantee is included.',
  ];
  const uniqueReasons = [...new Set(reasons)];
  const review = uniqueReasons.length > 0;
  return {
    input,
    totalAssets,
    liabilities,
    estate,
    rulesVersion: rules.version,
    taxYear: rules.taxYear,
    scenarioLabel: SCENARIO_LABELS[input.scenario],
    heading: couple ? COUPLE_HEADING : null,
    explanation: couple ? COUPLE_EXPLANATION : null,
    reasons: uniqueReasons,
    assumptions,
    needsReview: review,
    nilRateBand: review ? null : nrb,
    residenceBand: review ? null : residenceBand,
    residenceTaperLoss: review ? null : residenceTaperLoss,
    totalAllowances: review ? null : totalAllowances,
    exempt: review ? null : exempt,
    taxable: review ? null : taxable,
    tax: review ? null : tax,
  };
}
export type IhtResult = ReturnType<typeof calculateIht>;
export const formatMoney = (n: number) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(n);
export function formatDateUK(iso: string) {
  const [y, m, d] = iso.split('-');
  return y && m && d ? `${d}/${m}/${y}` : iso;
}
export const NOT_CALCULATED = 'Not calculated (adviser review)';
export type IhtSummaryRow = { key: string; label: string; value: string; emphasis?: boolean };
/**
 * The single presentation of a calculation. Both the on-screen results and the PDF render
 * exactly these rows, so the two can never disagree.
 */
export function ihtSummary(result: IhtResult): IhtSummaryRow[] {
  const m = (n: number | null) => (n === null ? NOT_CALCULATED : formatMoney(n));
  return [
    { key: 'scenario', label: 'Selected scenario', value: result.scenarioLabel },
    { key: 'date', label: 'Calculation date', value: formatDateUK(result.input.date) },
    {
      key: 'rules',
      label: 'Rules applied',
      value: `${result.taxYear} tax year (rules version ${result.rulesVersion})`,
    },
    { key: 'assets', label: 'Total assets', value: formatMoney(result.totalAssets) },
    { key: 'liabilities', label: 'Liabilities', value: formatMoney(result.liabilities) },
    { key: 'estate', label: 'Net estate', value: formatMoney(result.estate), emphasis: true },
    ...(result.exempt
      ? [{ key: 'exempt', label: 'Spouse/civil-partner exemption', value: m(result.exempt) }]
      : []),
    { key: 'nrb', label: 'Basic nil-rate band applied', value: m(result.nilRateBand) },
    { key: 'rnrb', label: 'Residence nil-rate band applied', value: m(result.residenceBand) },
    {
      key: 'taper',
      label: 'Residence allowance lost through tapering',
      value: m(result.residenceTaperLoss),
    },
    { key: 'allowances', label: 'Total allowances', value: m(result.totalAllowances) },
    { key: 'taxable', label: 'Taxable estate', value: m(result.taxable) },
    {
      key: 'tax',
      label: result.heading ? 'Estimated IHT after both deaths' : 'Estimated IHT',
      value: result.needsReview ? 'Adviser review needed' : m(result.tax),
      emphasis: true,
    },
  ];
}
