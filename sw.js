/* Point Pedro Court GitHub Pages shell v1.0.0.174.
   GAS iframe / Google Sheets / authentication responses are NEVER cached here. */
'use strict';
const CACHE_NAME='ppd-wrapper-shell-v1.0.0.174';
const PREFIX='ppd-wrapper-shell-';
const SCOPE_URL=new URL('./',self.registration.scope);
const CORE_FILES=['./','./index.html','./styles.css?v=1.0.0.174','./app.js?v=1.0.0.174','./assets/ppd-badminton-splash.webp','./assets/ppd-badminton-desktop.webp?v=1.0.0.174'];
const OPTIONAL_FILES=['./manifest.webmanifest','./push-config.json',
  './icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png'];
const isScopeURL=url=>url.origin===SCOPE_URL.origin&&url.pathname.startsWith(SCOPE_URL.pathname);
const shellPaths=new Set([...CORE_FILES,...OPTIONAL_FILES].map(path=>new URL(path,SCOPE_URL).pathname));
const isShellURL=url=>isScopeURL(url)&&shellPaths.has(url.pathname);
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE_NAME);
    await cache.addAll(CORE_FILES);
    // Not all deployments ship icons/manifest inside the incremental ZIP.
    // Missing optional assets must NOT prevent the core worker from installing.
    await Promise.all(OPTIONAL_FILES.map(file=>cache.add(file).catch(()=>{})));
    if(!self.registration.active)await self.skipWaiting();
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&key!==CACHE_NAME).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('message',event=>{
  if(event.data?.type==='PPD_SW_ACTIVATE')event.waitUntil(self.skipWaiting());
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(!isShellURL(url))return;
  event.respondWith((async()=>{
    try{
      const response=await fetch(event.request);
      if(response.ok&&response.type==='basic'){
        const copy=response.clone();
        event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy)));
      }
      return response;
    }catch(e){
      const cache=await caches.open(CACHE_NAME);
      const fallback=await cache.match(event.request,{ignoreSearch:true});
      if(fallback)return fallback;
      if(event.request.mode==='navigate'){
        const page=await cache.match('./index.html');if(page)return page;
      }
      return Response.error();
    }
  })());
});
self.addEventListener('push',event=>{
  let data={};
  try{data=event.data?event.data.json():{};}catch(_){data={body:event.data?event.data.text():''};}
  const title=String(data.title||'Point Pedro Indoor Court').slice(0,90);
  const body=String(data.body||'You have a new notification.').slice(0,220);
  let safeURL=SCOPE_URL.href;
  try{const u=new URL(data.url||'./',SCOPE_URL);if(isScopeURL(u))safeURL=u.href;}catch(_){}
  event.waitUntil((async()=>{
    await self.registration.showNotification(title,{
      body,icon:'./icons/icon-192.png',badge:'./icons/icon-192.png',
      tag:String(data.tag||'ppd-booking-alert').slice(0,100),data:{url:safeURL}
    });
    const list=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    list.forEach(client=>client.postMessage({type:'PPD_PUSH_RECEIVED'}));
  })());
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  event.waitUntil((async()=>{
    let url=SCOPE_URL.href;
    try{const u=new URL(event.notification.data?.url||url,SCOPE_URL);if(isScopeURL(u))url=u.href;}catch(_){}
    const list=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    for(const client of list){
      try{const u=new URL(client.url);if(isScopeURL(u)){
        await client.focus();if(client.navigate&&client.url!==url)await client.navigate(url);return;
      }}catch(_){}
    }
    return self.clients.openWindow(url);
  })());
});
