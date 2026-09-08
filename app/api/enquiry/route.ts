import {allowRequest,emailMessage,json,readBody,runtime,saveLead,updateDelivery} from '@/lib/server';
import { validateLead,MARKETING_COPY } from '@/lib/validation';
export async function POST(request:Request){
 let raw:unknown,lead;
 try{raw=await readBody(request);lead=validateLead(raw);}catch(error){return json({error:error instanceof Error?error.message:'Check your details.'},400);}
 try{
  if(!await allowRequest(request))return json({error:'You have submitted several requests. Please wait 15 minutes before trying again.'},429);
  const record=await saveLead(lead.requestId,'enquiry',{lead,marketingWording:MARKETING_COPY});
  const status=record.emailStatus==='sent'?'sent':await emailMessage(lead.requestId,runtime().ENQUIRY_TO_EMAIL??'','New review request',`Name: ${lead.name}\nEmail: ${lead.email}\nPreferred contact: ${lead.contactMethod}\nPhone: ${lead.phone}\nInterest: ${lead.interest}\nMessage: ${lead.message}\nMarketing email permission: ${lead.marketingEmail?'yes':'no'}`);
  await updateDelivery(lead.requestId,status);
  return json({status:'requested',delivery:status,reference:lead.requestId.slice(0,8)});
 }catch{return json({error:'We could not complete your request. Your answers are still here; please try again.'},503);}
}
