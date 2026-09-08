export type LeadInput={requestId:string;name:string;email:string;phone:string;interest:string;contactMethod:'email'|'phone'|'whatsapp';message:string;marketingEmail:boolean;callback:boolean;website:string};
const interests=['Financial & Estate Review','Estate Planning','Financial Advice','Property Finance','IHT report','Not sure yet'];
export function validateLead(value:unknown):LeadInput{
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Please check your details.');
 const v=value as Record<string,unknown>;
 const text=(key:string,max:number,required=false)=>{if(typeof v[key]!=='string'){if(!required&&v[key]===undefined)return '';throw new Error('Please check your '+key+'.');}const s=(v[key] as string).trim();if(s.length>max||(required&&!s)||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(s))throw new Error('Please check your '+key+'.');return s;};
 const requestId=text('requestId',36,true);if(!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(requestId))throw new Error('Please reload the form and try again.');
 const name=text('name',100,true),email=text('email',254,true).toLowerCase(),phone=text('phone',30),message=text('message',1000),website=text('website',200);
 if(!/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(email))throw new Error('Enter a valid email address.');
 if(!interests.includes(v.interest as string)||!['email','phone','whatsapp'].includes(v.contactMethod as string))throw new Error('Choose an area of interest and contact method.');
 if(typeof v.marketingEmail!=='boolean'||typeof v.callback!=='boolean')throw new Error('Please check your contact preferences.');
 if((phone||v.callback||v.contactMethod!=='email')&&!/^\+?[\d ()-]{7,30}$/.test(phone))throw new Error('Enter a valid telephone number for your preferred contact method.');
 if(website)throw new Error('Unable to accept this request.');
 return {requestId,name,email,phone,interest:v.interest as string,contactMethod:v.contactMethod as LeadInput['contactMethod'],message,marketingEmail:v.marketingEmail,callback:v.callback,website};
}
export const CONSENT_VERSION='2026-09-08-v1';
export const MARKETING_COPY='Email me occasional planning guides and updates. I can unsubscribe at any time.';
