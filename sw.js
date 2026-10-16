/* Version: 1.0.0.4 – GitHub Pages shell ONLY, not the GAS iframe. */
'use strict';
const CACHE_NAME = 'ppd-wrapper-shell-v1.0.0.4';
const SHELL_FILES = ['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./push-config.json','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png'];
const SCOPE_URL = new URL('./',self.registration.scope);
const isSameScopeURL = url => url.origin===SCOPE_URL.origin && url.pathname.startsWith(SCOPE_URL.pathname);
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('ppd-wrapper-shell-') && k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if(event.request.method!=='GET') return;
  const requestURL = new URL(event.request.url);
  if(!isSameScopeURL(requestURL)) return; // NEVER intercept/cache Google Apps Script or Google Sheets data.
  event.respondWith(fetch(event.request).then(response=>{
    if(response.ok && response.type==='basic'){
      const copy=response.clone();event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy)));
    }
    return response;
  }).catch(()=>caches.match(event.request)));
});
self.addEventListener('push', event => {
  // Future standard Web Push sender can provide {title,body,url,tag} JSON.
  // No sender or account registration is included in this frontend package.
  let data={};
  try {data=event.data?event.data.json():{};}catch(_){data={body:event.data?event.data.text():''};}
  const title=String(data.title || 'Point Pedro Indoor Court').slice(0,90);
  const body=String(data.body || 'You have a new notification.').slice(0,220);
  let safeURL=SCOPE_URL.href;
  try {const u=new URL(data.url||'./',SCOPE_URL);if(isSameScopeURL(u))safeURL=u.href;}catch(_){}
  event.waitUntil((async()=>{
    await self.registration.showNotification(title,{
      body,icon:'./icons/icon-192.png',badge:'./icons/icon-192.png',
      tag:String(data.tag||'ppd-booking-alert').slice(0,100),data:{url:safeURL}
    });
    const clientsList=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    clientsList.forEach(c=>c.postMessage({type:'PPD_PUSH_RECEIVED'}));
  })());
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil((async()=>{
    let url=SCOPE_URL.href;
    try {const u=new URL(event.notification.data?.url||url,SCOPE_URL);if(isSameScopeURL(u))url=u.href;}catch(_){}
    const clientsList=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    for(const client of clientsList){
      try{const u=new URL(client.url);if(isSameScopeURL(u)){await client.focus();if(client.navigate && client.url!==url)await client.navigate(url);return;}}catch(_){}
    }
    return self.clients.openWindow(url);
  })());
});
