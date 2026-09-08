import test from 'node:test';
import assert from 'node:assert/strict';
import {validateLead} from '../lib/validation.ts';
const lead={requestId:'c2919890-49b2-4ba9-9a74-b157264a3e7c',name:'Preview Visitor',email:'preview@example.com',phone:'',interest:'IHT report',contactMethod:'email',message:'',marketingEmail:false,callback:false,website:''};
test('report fulfilment needs no marketing consent or telephone',()=>{const r=validateLead(lead);assert.equal(r.marketingEmail,false);assert.equal(r.phone,'');});
test('callback or telephone preference requires a number',()=>{assert.throws(()=>validateLead({...lead,callback:true}));assert.throws(()=>validateLead({...lead,contactMethod:'phone'}));assert.equal(validateLead({...lead,callback:true,phone:'07700 900123'}).phone,'07700 900123');});
test('invalid email, unsafe fields and bot field rejected',()=>{for(const patch of [{email:'bad'},{email:'test@example.com\r\nBcc: x@y.com'},{name:''},{message:'x'.repeat(1001)},{website:'spam'},{marketingEmail:'yes'},{requestId:'known-id'}])assert.throws(()=>validateLead({...lead,...patch}));});
