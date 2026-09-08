import {allowRequest,emailMessage,json,readBody,saveLead,updateDelivery} from '@/lib/server';
import { validateLead,MARKETING_COPY } from '@/lib/validation';
import { calculateIht } from '@/lib/iht';
import {makeReport,pdfBase64} from '@/lib/report';
export async function POST(request:Request){
 let lead,result;
 try{const raw=await readBody(request);lead=validateLead(raw.lead);result=calculateIht(raw.calculator);}catch(error){return json({error:error instanceof Error?error.message:'Check your details.'},400);}
 try{
  if(!await allowRequest(request))return json({error:'Please wait 15 minutes before requesting another report.'},429);
  const record=await saveLead(lead.requestId,'iht-report',{lead,calculator:result.input,rulesVersion:result.rulesVersion,marketingWording:MARKETING_COPY});
  const pdf=pdfBase64(await makeReport(lead.name,result,record.createdAt));
  const delivery=record.emailStatus==='sent'?'sent':await emailMessage(lead.requestId,lead.email,'Your requested inheritance-tax illustration',`Hello ${lead.name},\n\nAttached is the inheritance-tax illustration you requested from Better Call Sim. It includes your answers, the rules used and the limitations. This is an illustration, not individual advice.\n\nBetter Call Sim`,{filename:'better-call-sim-iht-report.pdf',content:pdf});
  await updateDelivery(lead.requestId,delivery);
  return json({result,pdf,delivery,reference:lead.requestId.slice(0,8)});
 }catch{return json({error:'We could not generate your report. Your answers are still here; please try again.'},503);}
}
