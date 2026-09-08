/** A deliberately bounded illustration, not a full tax or suitability engine. */
export const IHT_RULES = { version:'2026-27.1', from:'2026-04-06', to:'2027-04-05', taxYear:'2026/27', nilRateBand:325000, residenceBand:175000, taperThreshold:2000000, rate:0.4 } as const;
export type IhtInput = {
  date:string; scenario:'individual'|'survivor'; residence:'straightforward-uk'|'other'|'unsure';
  beneficiaries:'descendants'|'others'|'spouse'|'mixed'|'unsure'; home:number; homeMortgage:number; savings:number; investments:number; otherAssets:number; debts:number; pensions:number;
  qualifyingHome:'yes'|'no'|'unsure'; transferNrb:'0'|'50'|'100'|'unsure'; transferRnrb:'0'|'50'|'100'|'unsure';
  pensionTreatment:'none'|'confirmed-excluded'|'review'; complexity:'none'|'yes'|'unsure';
};
export const EMPTY_IHT:IhtInput={date:'2026-09-08',scenario:'individual',residence:'unsure',beneficiaries:'unsure',home:0,homeMortgage:0,savings:0,investments:0,otherAssets:0,debts:0,pensions:0,qualifyingHome:'unsure',transferNrb:'0',transferRnrb:'0',pensionTreatment:'none',complexity:'unsure'};
const options:Record<string,readonly string[]>={scenario:['individual','survivor'],residence:['straightforward-uk','other','unsure'],beneficiaries:['descendants','others','spouse','mixed','unsure'],qualifyingHome:['yes','no','unsure'],transferNrb:['0','50','100','unsure'],transferRnrb:['0','50','100','unsure'],pensionTreatment:['none','confirmed-excluded','review'],complexity:['none','yes','unsure']};
export const moneyFields=['home','homeMortgage','savings','investments','otherAssets','debts','pensions'] as const;
export function validateIht(value:unknown):IhtInput {
  if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Please check your calculator answers.');
  const obj=value as Record<string,unknown>;
  if(typeof obj.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(obj.date)||Number.isNaN(Date.parse(obj.date))||new Date(obj.date).toISOString().slice(0,10)!==obj.date)throw new Error('Enter a valid calculation date.');
  for(const [key,allowed] of Object.entries(options))if(typeof obj[key]!=='string'||!allowed.includes(obj[key] as string))throw new Error('Please answer each question before continuing.');
  for(const key of moneyFields)if(typeof obj[key]!=='number'||!Number.isFinite(obj[key])||obj[key]<0||obj[key]>1e9||Math.abs(obj[key]*100-Math.round(obj[key]*100))>0.0001)throw new Error('Enter amounts between £0 and £1 billion, using up to two decimal places.');
  if((obj.homeMortgage as number)>(obj.home as number))throw new Error('The mortgage exceeds the home value. This situation needs an adviser’s review.');
  const clean:Record<string,unknown>={date:obj.date};
  for(const key of [...Object.keys(options),...moneyFields])clean[key]=obj[key];
  return clean as IhtInput;
}
export function calculateIht(value:unknown){
  const input=validateIht(value),rules=IHT_RULES,reasons:string[]=[];
  const gross=input.home+input.savings+input.investments+input.otherAssets;
  const estate=Math.max(0,Math.round((gross-input.homeMortgage-input.debts)*100)/100);
  if(input.debts>gross-input.homeMortgage)reasons.push('Liabilities exceed the assets entered; debt deductibility needs review.');
  if(input.date<rules.from||input.date>rules.to)reasons.push('This illustration supports 2026/27 only. Later rules, including pension changes from 6 April 2027, need a fresh review.');
  if(input.residence!=='straightforward-uk')reasons.push('Residence, overseas assets or cross-border circumstances need specialist review.');
  if(['mixed','unsure'].includes(input.beneficiaries))reasons.push('The beneficiaries or applicable exemptions need clarification.');
  if(input.complexity!=='none')reasons.push('Gifts, trusts, business or agricultural assets, charity gifts, downsizing or other specialist factors need review.');
  if(input.pensions>0&&input.pensionTreatment!=='confirmed-excluded')reasons.push('The inheritance-tax treatment of the pension benefits has not been confirmed.');
  if(input.pensionTreatment==='review')reasons.push('Pension treatment has been flagged for review.');
  if(input.scenario==='survivor'&&(input.transferNrb==='unsure'||input.transferRnrb==='unsure'))reasons.push('Unused allowances from the late spouse or civil partner need to be established.');
  if(input.scenario==='individual'&&(input.transferNrb!=='0'||input.transferRnrb!=='0'))reasons.push('Transferred allowances require the surviving-spouse or civil-partner scenario.');
  if(input.home>0&&input.beneficiaries==='descendants'&&input.qualifyingHome==='unsure')reasons.push('Eligibility for the residence allowance needs clarification.');
  if(input.qualifyingHome==='yes'&&input.beneficiaries!=='descendants'&&input.beneficiaries!=='spouse')reasons.push('The stated home inheritance does not match the beneficiary selection.');
  const nrb=rules.nilRateBand*(1+(input.scenario==='survivor'&&input.transferNrb!=='unsure'?Number(input.transferNrb)/100:0));
  const maximumResidence=rules.residenceBand*(1+(input.scenario==='survivor'&&input.transferRnrb!=='unsure'?Number(input.transferRnrb)/100:0));
  const taper=Math.max(0,(estate-rules.taperThreshold)/2);
  const residenceBand=input.beneficiaries==='descendants'&&input.qualifyingHome==='yes'?Math.max(0,Math.min(input.home-input.homeMortgage,maximumResidence-taper)):0;
  const exempt=input.beneficiaries==='spouse'?estate:0;
  const taxable=Math.max(0,estate-exempt-nrb-residenceBand);
  const tax=Math.round(taxable*rules.rate*100)/100;
  const assumptions=[
    `Illustration using rules version ${rules.version}, tax year ${rules.taxYear}, for ${input.date}.`,
    'Only the ownership shares belonging to the estate are included; assets and debts are not counted twice.',
    'The supported scenario assumes straightforward UK long-term residence, including the recipient spouse or civil partner where relevant.',
    'No relevant lifetime gifts, trusts, business/agricultural relief, charitable gifts, downsizing claims, overseas assets or other specialist factors are modelled.',
    input.beneficiaries==='spouse'?'All of the estate passes to a spouse or civil partner qualifying for full exemption. This is not a calculation of the survivor’s later estate.':'The estate passes outright to the selected non-exempt beneficiaries.',
    input.scenario==='survivor'?'The entered unused allowance percentages are assumed to be confirmed and claimable; there is no automatic doubling.':'No unused allowance from another estate is included.',
    'The residence allowance is limited by the qualifying home interest passing outright to direct descendants, and tapered using net estate value before exemptions and reliefs.',
    ...(input.pensions>0?['The entered pension benefits are excluded only on the basis of the user’s confirmation that their treatment has been professionally verified for this date.']:[]),
    'No future asset growth, tax savings, product recommendation or guarantee is included.',
  ];
  return {input,estate,rulesVersion:rules.version,taxYear:rules.taxYear,reasons:[...new Set(reasons)],assumptions,needsReview:reasons.length>0,nilRateBand:reasons.length?null:nrb,residenceBand:reasons.length?null:residenceBand,exempt:reasons.length?null:exempt,taxable:reasons.length?null:taxable,tax:reasons.length?null:tax};
}
export type IhtResult=ReturnType<typeof calculateIht>;
export const formatMoney=(n:number)=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0}).format(n);
