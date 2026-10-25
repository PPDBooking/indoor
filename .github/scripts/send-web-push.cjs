'use strict';
// Authenticated job data stays in Google Sheets; GitHub dispatch only supplies an opaque job id.
// Never print tokens, subscription endpoints, keys, or full response bodies.
const webpush=require('web-push');
const required=['GAS_WEBAPP_URL','GAS_WORKER_SECRET','VAPID_PUBLIC_KEY','VAPID_PRIVATE_KEY','VAPID_SUBJECT','PUSH_JOB_ID'];
for(const key of required)if(!process.env[key])throw new Error('Missing required secret/config: '+key);
const env=process.env;
if(!/^PUSH-[A-Z0-9]{12,32}$/.test(env.PUSH_JOB_ID))throw new Error('Invalid job identifier');
if(!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/.test(env.GAS_WEBAPP_URL))throw new Error('GAS_WEBAPP_URL must be the deployed Apps Script /exec URL');
webpush.setVapidDetails(env.VAPID_SUBJECT,env.VAPID_PUBLIC_KEY,env.VAPID_PRIVATE_KEY);
async function requestGAS(action, extra={}){
  const controller=new AbortController();
  const id=setTimeout(()=>controller.abort(),45000);
  try{
    const res=await fetch(env.GAS_WEBAPP_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,secret:env.GAS_WORKER_SECRET,jobId:env.PUSH_JOB_ID,...extra}),redirect:'follow',signal:controller.signal});
    if(!res.ok)throw new Error('GAS worker HTTP '+res.status);
    const text=await res.text();let obj;try{obj=JSON.parse(text);}catch(e){throw new Error('GAS worker did not return JSON: check /exec deployment permissions.');}
    if(!obj.ok)throw new Error('GAS worker rejected '+action+': '+String(obj.error||'Unknown error').slice(0,100));
    return obj;
  }finally{clearTimeout(id);}
}
const allowedHost=host=>['fcm.googleapis.com','updates.push.services.mozilla.com','web.push.apple.com','wns2-by3p.notify.windows.com'].includes(host)||/^[a-z0-9.-]+\.notify\.windows\.com$/.test(host);
(async()=>{
  const response=await requestGAS('claim');if(response.skip){console.log('Job already processed or currently claimed.');return;}
  const job=response.job;if(!job||!Array.isArray(job.devices))throw new Error('Job format invalid');
  const results=[];
  const suffix=String(job.eventType||'BOOKING').slice(0,40)+'-'+String(job.relatedId||job.jobId).slice(0,60);
  const page=['home','book','bookings','users'].includes(String(job.targetPage))?job.targetPage:'home';
  const payload=JSON.stringify({title:String(job.title||'Point Pedro Indoor Court').slice(0,90),body:String(job.body||'New booking update').slice(0,210),url:'./?ppdpage='+encodeURIComponent(page),tag:suffix});
  for(const d of job.devices.slice(0,12)){
    try{
      const url=new URL(d.subscription.endpoint);
      if(url.protocol!=='https:'||!allowedHost(url.hostname.toLowerCase()))throw new Error('Forbidden Push endpoint');
      const r=await webpush.sendNotification(d.subscription,payload,{TTL:60*60*6,urgency:job.eventType==='CRITICAL_FAILURE'?'high':'normal'});
      results.push({deviceId:d.deviceId,ok:r.statusCode>=200&&r.statusCode<300,statusCode:r.statusCode});
    }catch(e){
      results.push({deviceId:d.deviceId,ok:false,statusCode:Number(e.statusCode)||0,error:String(e.message||e).slice(0,120)});
    }
  }
  await requestGAS('ack',{results,error:results.some(x=>!x.ok)?'One or more push deliveries were not accepted.':''});
  console.log('Job processed:',results.length,'devices, accepted:',results.filter(x=>x.ok).length);
  if(results.some(x=>!x.ok))process.exitCode=1;
})().catch(error=>{console.error('Web Push worker:',String(error.message||error).slice(0,130));process.exitCode=1;});
