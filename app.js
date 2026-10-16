/* GitHub Pages PWA wrapper v1.0.0.3: authenticated GAS iframe + PushManager. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const dialog = $('notification-dialog');
  const iframe = $('booking-frame');
  const setup = $('notification-settings-button');
  const enable = $('enable-notifications-button');
  const testLocal = $('test-notification-button');
  const testReal = $('real-notification-test-button');
  const install = $('install-button');
  const details = $('notification-details');
  const delivery = $('push-delivery-status');
  const permissionLabel = $('permission-status');
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const hasApis = () => ('Notification' in window) && ('serviceWorker' in navigator) && ('PushManager' in window) && window.isSecureContext;
  let sw = null, vapidKey = '', authReady = false, deviceRegistered = false, pushReady = false, deferredInstall = null;
  let gasWindow = null, gasOrigin = '';
  let bridgeProbeCount = 0;
  const state = {lastError:''};
  const scriptOrigins = ['https://script.google.com','https://script.googleusercontent.com'];
  const setDetails = msg => {details.textContent=msg;};
  function isGASOrigin(origin) {
    try {const u=new URL(origin);return u.protocol==='https:'&&(scriptOrigins.includes(u.origin)||u.hostname.endsWith('.googleusercontent.com'));}catch(e){return false;}
  }
  function toBase64Bytes(str) {
    const pad='='.repeat((4-str.length%4)%4),decoded=atob((str+pad).replace(/-/g,'+').replace(/_/g,'/'));
    return Uint8Array.from(decoded,c=>c.charCodeAt(0));
  }
  async function ensureSW(){
    if(sw)return sw;
    if(!('serviceWorker' in navigator)||!window.isSecureContext)return null;
    sw=await navigator.serviceWorker.register('./sw.js',{scope:'./'});
    return navigator.serviceWorker.ready;
  }
  function postToGAS(type, extra={}) {
    if(!gasWindow || !gasOrigin)return;
    // Reply to the exact authenticated Apps Script HTMLService window (often nested).
    // Only browser Push subscription metadata and navigation intents cross this bridge.
    gasWindow.postMessage({source:'PPD_PWA',type,...extra},gasOrigin);
  }
  function requestAuthResync(){
    // The script.google.com outer iframe can contain a nested googleusercontent frame.
    // Both receive a query; only the trusted GAS UI is allowed to answer.
    const msg={source:'PPD_PWA',type:'PPD_AUTH_QUERY'};
    try{iframe.contentWindow?.postMessage(msg,'https://script.google.com');}catch(e){}
    if(gasWindow&&gasOrigin)postToGAS('PPD_AUTH_QUERY');
  }
  iframe.addEventListener('load',()=>{bridgeProbeCount=0;requestAuthResync();});
  const bridgeTimer=setInterval(()=>{
    if(authReady||++bridgeProbeCount>20){clearInterval(bridgeTimer);return;}
    requestAuthResync();
  },3000);
  window.addEventListener('focus',()=>{if(!authReady)requestAuthResync();});
  async function existingSubscription(){const r=await ensureSW();return r&&r.pushManager?r.pushManager.getSubscription():null;}
  function refreshUI(){
    const p=('Notification' in window)?Notification.permission:'unsupported';
    permissionLabel.textContent=!hasApis()?'Unavailable':p==='granted'?'Allowed':p==='denied'?'Blocked':'Not requested';
    enable.disabled=!hasApis()||p==='denied';
    enable.textContent=p==='granted'?'Register this device for background push':'Enable notifications';
    testLocal.disabled=!hasApis()||p!=='granted';
    testReal.disabled=!(deviceRegistered&&pushReady&&authReady);
    delivery.textContent=deviceRegistered?(pushReady?'Device linked · sender enabled':'Device linked · sender not configured'):'Not connected';
    // Setup launcher disappears after the device has been registered; open ?notifications=1 to manage later.
    setup.hidden=deviceRegistered&&pushReady || new URLSearchParams(location.search).has('hidesetup');
    $('ios-install-tip').hidden=!isIOS||standalone();
    if(!hasApis())setDetails('This browser cannot use Web Push. Use HTTPS on a supported browser.');
    else if(isIOS&&!standalone())setDetails('On iPhone: add this app to the Home Screen before enabling Web Push.');
    else if(p==='denied')setDetails('Notifications are blocked. Allow this site in device settings.');
    else if(deviceRegistered&&pushReady)setDetails('This device is registered. Use REAL push test to check background delivery. GitHub Actions notifications may be delayed.');
    else if(deviceRegistered)setDetails('Device linked, but server setup is still needed. Please configure Web Push Secrets and enable it in Apps Script.');
    else if(p==='granted'&&!vapidKey)setDetails('Permission allowed. VAPID public key not configured. See GitHub README before registering.');
    else if(p==='granted'&&!authReady)setDetails('Please log in to the booking app to link this device to your account.');
    else if(p==='granted')setDetails('Permission is allowed. Select Register this device to connect push.');
    else setDetails('Enable notifications on this device. Golden Bell remains unchanged.');
  }
  async function registerDevice(force=false){
    if(!hasApis() || Notification.permission!=='granted')return;
    if(isIOS&&!standalone())return;
    if(!vapidKey){refreshUI();return;}
    try{
      const reg=await ensureSW();
      let sub=await reg.pushManager.getSubscription();
      if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:toBase64Bytes(vapidKey)});
      if(authReady && (force||!deviceRegistered))postToGAS('PPD_PUSH_REGISTER',{subscription:sub.toJSON(),label:(isIOS?'iOS':'Browser')+' PWA'});
    }catch(e){state.lastError=String(e.message||e);setDetails('Push registration failed: '+state.lastError);}
  }
  async function requestPermissionAndRegister(){
    if(isIOS&&!standalone()){refreshUI();return;}
    if(!hasApis())return;
    try{
      // Must be called directly within a user gesture for iOS.
      const perm=Notification.permission==='granted'?'granted':await Notification.requestPermission();
      if(perm==='granted')await registerDevice(true);
    }catch(e){setDetails('Could not enable notifications: '+String(e.message||e));}
    refreshUI();
  }
  window.addEventListener('message', async event=>{
    if(!isGASOrigin(event.origin)||!event.data||event.data.source!=='PPD_GAS')return;
    if(gasWindow && event.source!==gasWindow)return;
    if(!gasWindow){gasWindow=event.source;gasOrigin=event.origin;}
    const d=event.data;
    if(d.type==='PPD_AUTH_READY'){
      postToGAS('PPD_AUTH_ACK');
      authReady=!!d.authenticated;
      if(!authReady){deviceRegistered=false;pushReady=false;}
      else if(Notification.permission==='granted')await registerDevice(true);
    }else if(d.type==='PPD_REGISTER_RESULT'){
      deviceRegistered=!!d.ok;pushReady=!!d.ready;
      if(!d.ok)setDetails('Device registration error: '+String(d.error||'Please sign in again.'));
    }else if(d.type==='PPD_TEST_RESULT'){
      setDetails(d.ok?'Real Push queued. It may take time for GitHub Actions to execute; lock screen delivery is not yet guaranteed.':'Real push test failed: '+String(d.error||'Unknown error'));
    }else if(d.type==='PPD_STATUS_RESULT'){
      if(d.lastDelivery&&d.lastDelivery.status==='ACCEPTED')setDetails('Browser Push Service accepted last delivery at '+String(d.lastDelivery.at)+'. Device display is still subject to phone settings.');
    }
    refreshUI();
  });
  setup.addEventListener('click',()=>{requestAuthResync();refreshUI();dialog.showModal();});
  $('notification-close-button').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  enable.addEventListener('click',()=>{requestAuthResync();requestPermissionAndRegister();});
  testLocal.addEventListener('click',async()=>{
    if(Notification.permission!=='granted')return;
    try{const r=await ensureSW();await r.showNotification('Point Pedro Indoor Court',{body:'Local test only — not a booking notification.',icon:'./icons/icon-192.png',badge:'./icons/icon-192.png',tag:'ppd-local-test',data:{url:new URL('./',location.href).href}});setDetails('Local test notification shown; this is not an end-to-end push test.');}
    catch(e){setDetails('Local test failed: '+String(e.message||e));}
  });
  testReal.addEventListener('click',()=>{postToGAS('PPD_PUSH_TEST');setDetails('Requesting a real Push test from the authenticated booking app…');});
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;install.hidden=false;});
  install.addEventListener('click',async()=>{
    if(deferredInstall){deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;install.hidden=true;}
    else if(isIOS){$('ios-install-tip').hidden=false;}
  });
  window.addEventListener('appinstalled',()=>{install.hidden=true;deferredInstall=null;});
  window.addEventListener('online',()=>{$('offline-note').hidden=true;});
  window.addEventListener('offline',()=>{$('offline-note').hidden=false;});
  $('offline-note').hidden=navigator.onLine;
  if(new URLSearchParams(location.search).get('notifications')==='1'){
    setTimeout(()=>{refreshUI();dialog.showModal();},350);
  }
  const navPage=new URLSearchParams(location.search).get('ppdpage');
  function forwardNavigation(){if(authReady&&navPage)postToGAS('PPD_PUSH_NAVIGATE',{page:navPage});}
  window.addEventListener('message',e=>{if(e.source===gasWindow&&isGASOrigin(e.origin)&&e.data?.type==='PPD_AUTH_READY')setTimeout(forwardNavigation,500);});
  navigator.serviceWorker?.addEventListener('message',e=>{if(e.data?.type==='PPD_PUSH_RECEIVED'&&authReady)postToGAS('PPD_PUSH_STATUS');});
  fetch('./push-config.json',{cache:'no-store'}).then(r=>r.ok?r.json():{}).then(async config=>{
    vapidKey=String(config.vapidPublicKey||'').trim();if(!/^[A-Za-z0-9_-]{80,100}$/.test(vapidKey))vapidKey='';
    try{await ensureSW();}catch(e){console.warn('Service worker failed:',e);}
    refreshUI();
    if(Notification.permission==='granted'&&authReady)await registerDevice(true);
  }).catch(e=>{refreshUI();console.warn('Push config load failed:',e);});
  refreshUI();
})();
