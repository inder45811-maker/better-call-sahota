import { PDFDocument,StandardFonts,rgb } from 'pdf-lib';
import { formatMoney,type IhtResult } from './iht';
export async function makeReport(name:string,result:IhtResult,createdAt:number){
 const pdf=await PDFDocument.create();pdf.setTitle('Your illustrative inheritance-tax report');pdf.setAuthor('Better Call Sim');pdf.setCreationDate(new Date(createdAt));
 const body=await pdf.embedFont(StandardFonts.Helvetica),bold=await pdf.embedFont(StandardFonts.HelveticaBold),serif=await pdf.embedFont(StandardFonts.TimesRoman);
 const navy=rgb(.08,.18,.23),grey=rgb(.33,.39,.4),gold=rgb(.6,.47,.26);
 let page=pdf.addPage([595,842]),y=784;
 const clean=(s:string)=>s.replace(/[→]/g,'>').replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/[–—]/g,'-').replace(/[^\x20-\x7e\xA0-\xFF]/g,'');
 const footer=()=>{page.drawText('Better Call Sim | Illustration only - not personal advice',{x:44,y:28,size:8,font:body,color:grey});};
 const line=(text:string,size=10,font=body,color=grey)=>{const words=clean(text).split(/\s+/);let row='';for(const word of words){const next=row?row+' '+word:word;if(font.widthOfTextAtSize(next,size)>503&&row){draw(row);row=word;}else row=next;}if(row)draw(row);function draw(value:string){if(y<65){footer();page=pdf.addPage([595,842]);y=780;}page.drawText(value,{x:46,y,size,font,color});y-=size*1.55;}};
 line('better call sim.',27,serif,navy);y-=16;line('YOUR INHERITANCE-TAX ILLUSTRATION',11,bold,gold);y-=10;line('Prepared for '+name,19,serif,navy);line('Generated '+new Date(createdAt).toLocaleDateString('en-GB')+' | Rules '+result.rulesVersion+' | Tax year '+result.taxYear);y-=17;
 line(result.needsReview?'An adviser review is needed.':'Illustrative inheritance-tax estimate: '+formatMoney(result.tax!),22,serif,navy);y-=10;
 line('Net estate entered: '+formatMoney(result.estate),12,bold,navy);
 if(!result.needsReview){line('Basic allowance modelled: '+formatMoney(result.nilRateBand!));line('Residence allowance modelled: '+formatMoney(result.residenceBand!));line('Spouse/civil-partner exemption modelled: '+formatMoney(result.exempt!));line('Taxable estate in this illustration: '+formatMoney(result.taxable!));}
 else{line('A headline estimate is withheld because the following could materially affect it:');result.reasons.forEach(r=>line('- '+r));}
 y-=20;line('Your answers',16,serif,navy);
 const labels:Record<string,string>={date:'Calculation date',scenario:'Estate scenario',residence:'Residence screen',beneficiaries:'Beneficiaries',home:'Your share of home value',homeMortgage:'Mortgage on that share',savings:'Savings',investments:'Investments',otherAssets:'Other assets',debts:'Other debts',pensions:'Pensions',qualifyingHome:'Qualifying home',transferNrb:'Unused basic allowance (%)',transferRnrb:'Unused residence allowance (%)',pensionTreatment:'Pension treatment',complexity:'Specialist circumstances'};
 Object.entries(result.input).forEach(([key,value])=>line(`${labels[key]??key}: ${typeof value==='number'?formatMoney(value):value}`));
 y-=20;line('Assumptions and scope',16,serif,navy);result.assumptions.forEach(a=>{line('- '+a);y-=4;});
 y-=14;line('Sources and next steps',16,serif,navy);line('GOV.UK: gov.uk/inheritance-tax');line('HMRC: gov.uk/guidance/inheritance-tax-residence-nil-rate-band');line('Pension changes: gov.uk/government/publications/inheritance-tax-on-pensions-technical-note');y-=12;
 line('This report illustrates the answers supplied. It is not a valuation, tax return, recommendation or individual legal or financial advice. Rules and personal circumstances can change. A Financial & Estate Review can help identify which questions need professional advice.');footer();
 return pdf.save();
}
export function pdfBase64(bytes:Uint8Array){let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);return btoa(binary);}
