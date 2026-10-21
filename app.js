/* GitHub Pages PWA wrapper v1.0.0.183: shared mobile glass dock and safe-area control. */
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
  document.documentElement.classList.toggle('ppd-standalone',standalone());
  document.documentElement.classList.toggle('ppd-ios',isIOS);
  /* v1.0.0.183: debug panel (first 120s in the installed app, or ?ppddebug=1) with live layout experiments X1-X4. */
  (function(){
    const DEBUG_STANDALONE_SECONDS=120;
    const forced=/[?&]ppddebug=1/.test(location.search);
    if(!(forced||(DEBUG_STANDALONE_SECONDS>0&&standalone())))return;
    const root=document.documentElement;
    const setFull=()=>{const f=screen.height||0;if(f>innerHeight&&f-innerHeight<=120)root.style.setProperty('--ppd-full',f+'px');else root.style.removeProperty('--ppd-full');};
    const wrap=document.createElement('div');
    wrap.style.cssText='position:fixed;z-index:2147483647;left:6px;top:70px;font:11px/1.35 monospace;color:#7dffb0;background:#000c;border-radius:8px;padding:6px 8px;max-width:78vw';
    const pre=document.createElement('pre');pre.style.cssText='margin:0 0 6px;white-space:pre;pointer-events:none';
    const row=document.createElement('div');row.style.cssText='display:flex;gap:6px;flex-wrap:wrap';
    wrap.appendChild(pre);wrap.appendChild(row);root.appendChild(wrap);
    const probe=document.createElement('div');
    probe.style.cssText='position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)';
    root.appendChild(probe);
    let current='off';
    const show=()=>{setFull();const cs=getComputedStyle(probe),vv=window.visualViewport;
      pre.textContent=['variant '+current,'screen '+screen.width+'x'+screen.height,'inner '+innerWidth+'x'+innerHeight,'visual '+(vv?Math.round(vv.width)+'x'+Math.round(vv.height):'n/a'),'docEl '+root.clientHeight,'inset top '+cs.paddingTop+' bottom '+cs.paddingBottom,'standalone '+standalone()].join('\n');};
    ['off','x1','x2','x3','x4'].forEach(v=>{
      const b=document.createElement('button');b.type='button';b.textContent=v==='off'?'Off':v.toUpperCase();
      b.style.cssText='min-width:44px;min-height:34px;border-radius:7px;border:1px solid #7dffb0;background:#06301f;color:#fff;font:12px monospace';
      b.addEventListener('click',()=>{['x1','x2','x3','x4'].forEach(k=>root.classList.remove('ppd-'+k));if(v!=='off')root.classList.add('ppd-'+v);current=v;show();});
      row.appendChild(b);
    });
    show();['resize','orientationchange','pageshow'].forEach(e=>window.addEventListener(e,()=>setTimeout(show,80)));
    const timer=setInterval(show,1500);
    if(!forced)setTimeout(()=>{clearInterval(timer);wrap.remove();probe.remove();},DEBUG_STANDALONE_SECONDS*1000);
  })();
  const hasApis = () => ('Notification' in window) && ('serviceWorker' in navigator) && ('PushManager' in window) && window.isSecureContext;
  let sw = null, vapidKey = '', authReady = false, deviceRegistered = false, pushReady = false, deferredInstall = null;
  let gasWindow = null, gasOrigin = '', currentUserId = '';
  const DISPLAY_PREFERENCE_PREFIX='ppd_mobile_display_settings_v2:';
  const DEFAULT_DISPLAY_PREFERENCE={safeArea:false};
  const normalizeDisplayPreference=value=>({safeArea:!!(value&&value.safeArea===true)});
  function displayPreferenceKey(userId){return DISPLAY_PREFERENCE_PREFIX+String(userId||'');}
  function readDisplayPreference(userId){
    if(!userId)return null;
    try{const saved=JSON.parse(localStorage.getItem(displayPreferenceKey(userId))||'null');return saved&&typeof saved==='object'?normalizeDisplayPreference(saved):null;}catch(_){return null;}
  }
  function saveDisplayPreference(userId,value){
    if(!userId)return;
    try{localStorage.setItem(displayPreferenceKey(userId),JSON.stringify(normalizeDisplayPreference(value)));}catch(_){}
  }
  function applyDisplayPreference(value){
    const preference=normalizeDisplayPreference(value);
    document.documentElement.classList.toggle('ppd-safe-area-on',preference.safeArea);
    return preference;
  }
  function restoreDisplayPreferenceForUser(userId,gasPreference){
    if(!userId)return;
    const preference=gasPreference&&typeof gasPreference==='object'
      ?normalizeDisplayPreference(gasPreference):(readDisplayPreference(userId)||DEFAULT_DISPLAY_PREFERENCE);
    saveDisplayPreference(userId,preference);
    applyDisplayPreference(preference);
    postToGAS('PPD_DISPLAY_PREFERENCE',{userId:String(userId),preferences:preference});
  }
  applyDisplayPreference(DEFAULT_DISPLAY_PREFERENCE);
  let pushConfigLoaded = false, registrationCheckInFlight = false, registrationCheckPendingUser = '', registrationPromptShownForUser = '';
  let registrationDialogMode = false;
  const REMEMBER_STORAGE='ppd_pwa_remembered_session_v1';
  const savedSession=()=>{try{const v=JSON.parse(localStorage.getItem(REMEMBER_STORAGE)||'null');
    return v && typeof v.token==='string' && /^[A-Za-z0-9_.-]{16,1024}$/.test(v.token) && typeof v.userId==='string' &&
      Date.now()-Number(v.savedAt)>=0 && Date.now()-Number(v.savedAt)<91*86400000 ? v : null;
  }catch(_){return null;}};
  const clearSavedSession=()=>{try{localStorage.removeItem(REMEMBER_STORAGE);}catch(_){}};
  const storeRememberedSession=(token,userId)=>{if(!/^[A-Za-z0-9_.-]{16,1024}$/.test(String(token))||!userId)return;
    try{localStorage.setItem(REMEMBER_STORAGE,JSON.stringify({token:String(token),userId:String(userId),savedAt:Date.now()}));}catch(_){}}; 
  let bridgeProbeCount = 0;
  const state = {lastError:''};
  const startup = $('startup-screen'), startupStatus = $('startup-status'), startupActions = $('startup-actions');
  const splashLogo=$('pwa-splash-logo');
  const splashBackgroundQuery=window.matchMedia('(min-width: 701px)');
  let splashBackgroundLoadId=0;
  function preloadSplashBackground(){
    const loadId=++splashBackgroundLoadId;
    const desktop=splashBackgroundQuery.matches;
    startup.classList.remove('ppdSplashBackgroundReady');
    const image=new Image();image.decoding='async';
    const reveal=()=>{if(loadId===splashBackgroundLoadId&&splashBackgroundQuery.matches===desktop&&image.naturalWidth>0)startup.classList.add('ppdSplashBackgroundReady');};
    image.onload=()=>{if(typeof image.decode==='function')image.decode().then(reveal).catch(reveal);else reveal();};
    image.onerror=()=>{};
    image.src=desktop?'./assets/ppd-badminton-desktop.webp?v=1.0.0.183':'./assets/ppd-badminton-splash.webp';
    if(image.complete&&image.naturalWidth>0){if(typeof image.decode==='function')image.decode().then(reveal).catch(reveal);else reveal();}
  }
  preloadSplashBackground();
  if(splashBackgroundQuery.addEventListener)splashBackgroundQuery.addEventListener('change',preloadSplashBackground);
  else {let previousDesktop=splashBackgroundQuery.matches;window.addEventListener('resize',()=>{const nextDesktop=splashBackgroundQuery.matches;if(nextDesktop!==previousDesktop){previousDesktop=nextDesktop;preloadSplashBackground();}});}
  const PWA_SPLASH_META_KEY='ppd_public_splash_meta_v1';
  function applySplashMetadata(data, persist=true){
    if(!data||typeof data!=='object')return;
    const name=typeof data.developerName==='string'?data.developerName.trim().slice(0,100):'';
    const version=typeof data.appVersion==='string'?data.appVersion.trim().slice(0,40):'';
    const displayName=typeof data.developerName==='string'?(name||'AA Computers'):'';
    if(displayName)$('pwa-splash-developer').textContent=displayName;
    if(version)$('pwa-splash-version').textContent=version;
    if(persist&&(typeof data.developerName==='string'||version)){try{
      const previous=JSON.parse(localStorage.getItem(PWA_SPLASH_META_KEY)||'{}');
      localStorage.setItem(PWA_SPLASH_META_KEY,JSON.stringify({developerName:displayName||String(previous.developerName||'AA Computers').slice(0,100),appVersion:version||String(previous.appVersion||'1.0.1.183').slice(0,40)}));
    }catch(_){}}
  }
  try{const savedSplashMeta=JSON.parse(localStorage.getItem(PWA_SPLASH_META_KEY)||'null');if(savedSplashMeta&&typeof savedSplashMeta.developerName==='string')applySplashMetadata({developerName:savedSplashMeta.developerName},false);}catch(_){}
  let splashLogoFallbackTimer=setTimeout(showSplashLogoFallback,2000);
  function showSplashLogoFallback(){
    if(splashLogo&&!splashLogo.classList.contains('ppdLogoReady')&&splashLogo.parentElement)
      splashLogo.parentElement.classList.add('ppdLogoFailed');
  }
  function markSplashLogoReady(){
    if(splashLogoFallbackTimer){clearTimeout(splashLogoFallbackTimer);splashLogoFallbackTimer=null;}
    splashLogo.classList.add('ppdLogoReady');
    if(splashLogo.parentElement)splashLogo.parentElement.classList.remove('ppdLogoFailed');
  }
  splashLogo.addEventListener('error',function(){
    if(splashLogoFallbackTimer){clearTimeout(splashLogoFallbackTimer);splashLogoFallbackTimer=null;}
    this.removeAttribute('src');this.classList.remove('ppdLogoReady');
    if(this.parentElement)this.parentElement.classList.add('ppdLogoFailed');
  });
  splashLogo.addEventListener('load',function(){if(this.naturalWidth>0)markSplashLogoReady();});
  if(splashLogo.complete&&splashLogo.naturalWidth>0)markSplashLogoReady();
  for (const e of [splashLogo]) { e.addEventListener('contextmenu',event=>event.preventDefault()); e.addEventListener('dragstart',event=>event.preventDefault()); }
  const updateBanner = $('update-banner');
  const updateNow = $('update-now'), updateLater = $('update-later');
  let startupResolved = false, authRestoring = false, pendingWorker = null, workerReloading = false;
  const GAS_BASE_URL = iframe.dataset.gasUrl || iframe.getAttribute('src');
  // Email links always open this GitHub Pages frontend. Only the wrapper forwards the
  // approved route parameters to the private GAS iframe so the correct page opens after login.
  const GAS_URL = (() => {
    const target = new URL(GAS_BASE_URL, location.href);
    const launch = new URLSearchParams(location.search);
    ['login','username','target','request','booking','action'].forEach(key => {
      if (launch.has(key)) target.searchParams.set(key, launch.get(key));
    });
    return target.href;
  })();
  iframe.src = GAS_URL;
  let startupTimer=null;
  const displayStartup = (message,allowRetry=false) => {
    startupResolved=false; startup.hidden=false; startup.classList.remove('splash-leaving');
    startupStatus.textContent=message;const splashLabel=$('startup-screen-text');if(splashLabel)splashLabel.textContent=allowRetry?'Connection needs attention':(message==='Checking your saved session securely.'?'Preparing your application...':message);startupActions.hidden=!allowRetry;
    if(!allowRetry && !startupTimer){
      startupTimer=setTimeout(()=>{
        startupTimer=null;
        if(!startupResolved)displayStartup('The server is taking longer than expected. You can retry without clearing saved data.',true);
      },24000);
    }
  };
  const completeStartup = () => {
    startupResolved=true;startupActions.hidden=true;startup.classList.add('splash-leaving');setTimeout(()=>{if(startupResolved)startup.hidden=true;},400);
    if(startupTimer){clearTimeout(startupTimer);startupTimer=null;}
  };
  try{const lastBrand=localStorage.getItem('ppd_public_brand_logo');if(lastBrand && /^https:\/\//i.test(lastBrand))$('pwa-splash-logo').src=lastBrand;}catch(_){}
  displayStartup('Checking your saved session securely.');
  $('startup-retry').addEventListener('click',()=>{
    displayStartup('Reconnecting to the court app…');
    if(gasWindow&&gasOrigin)requestAuthResync();
    else iframe.src=GAS_URL;
  });
  // Do not force reload/clear site data just to install a new application shell.
  updateNow.addEventListener('click',()=>{
    if(!pendingWorker)return;
    if(!confirm('Updating will reload this app. Complete any booking or unsaved form first. Update now?'))return;
    updateNow.disabled=true;updateNow.textContent='Updating…';
    workerReloading=true;pendingWorker.postMessage({type:'PPD_SW_ACTIVATE'});
  });
  updateLater.addEventListener('click',()=>{updateBanner.hidden=true;});
  function offerUpdate(worker){
    if(!worker||!navigator.serviceWorker?.controller)return;
    pendingWorker=worker;updateBanner.hidden=false;
    updateNow.disabled=false;updateNow.textContent='Update now';
  }
  navigator.serviceWorker?.addEventListener('controllerchange',()=>{
    if(workerReloading)location.reload();
  });

  /* Optional per-device WebAuthn privacy lock. This masks the entire PWA shell.
     Server-side session verification and role permissions always remain in GAS.
      Only explicitly remembered, server-revocable login tokens are stored at this
      dedicated PWA origin for iOS session recovery; no passwords or biometric keys. */
  const BIO_STORAGE = 'ppd_bio_local_v1';
  const bioAvailable = () => !!(window.PublicKeyCredential && navigator.credentials && window.crypto?.subtle && window.isSecureContext);
  const bioLoad = () => {try {const x=JSON.parse(localStorage.getItem(BIO_STORAGE)||'null');
    return x&&x.enabled&&x.credentialId&&x.userId&&x.publicJwk?x:null;}catch(_){return null;}};
  const bioSave = value => localStorage.setItem(BIO_STORAGE, JSON.stringify(value));
  const b64 = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  const unb64 = value => Uint8Array.from(atob(String(value).replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-String(value).length%4)%4)),c=>c.charCodeAt(0));
  const rand = () => crypto.getRandomValues(new Uint8Array(32));
  const bytesEqual = (a,b) => a.length===b.length && a.every((x,i)=>x===b[i]);
  const textBytes = s => new TextEncoder().encode(s);
  function cborValue(bytes, start=0) {
    let at=start;
    const read=() => {
      if(at>=bytes.length)throw new Error('Invalid authenticator key.');
      const h=bytes[at++],major=h>>5,extra=h&31;
      let n;
      if(extra<24)n=extra;
      else if(extra===24)n=bytes[at++];
      else if(extra===25)n=(bytes[at++]<<8)|bytes[at++];
      else if(extra===26)n=(bytes[at++]*0x1000000+bytes[at++]*65536+bytes[at++]*256+bytes[at++]);
      else throw new Error('Unsupported authenticator key encoding.');
      if(major===0)return n;
      if(major===1)return -1-n;
      if(major===2||major===3){const v=bytes.slice(at,at+n);at+=n;return major===2?v:new TextDecoder().decode(v);}
      if(major===4)return Array.from({length:n},()=>read());
      if(major===5){const m=new Map();for(let i=0;i<n;i++){const k=read();m.set(k,read());}return m;}
      if(major===7){if(n===20)return false;if(n===21)return true;if(n===22)return null;}
      throw new Error('Unsupported authenticator format.');
    };
    return [read(),at];
  }
  async function checkClientData(buffer,expected,type){
    const client=JSON.parse(new TextDecoder().decode(buffer));
    if(client.type!==type || client.origin!==location.origin || !bytesEqual(unb64(client.challenge),expected))
      throw new Error('Biometric challenge verification failed.');
  }
  async function checkAuthenticatorData(bytes,attested){
    if(bytes.length<37)throw new Error('Invalid device authenticator data.');
    const rpHash=new Uint8Array(await crypto.subtle.digest('SHA-256',textBytes(location.hostname)));
    if(!bytesEqual(bytes.slice(0,32),rpHash) || (bytes[32]&0x05)!==0x05 || (attested && !(bytes[32]&0x40)))
      throw new Error('Device verification was not completed.');
  }
  function derSignatureToRaw(der){
    let p=0;
    const byte=()=>der[p++];
    if(byte()!==0x30)throw new Error('Invalid signature.');
    let total=byte();if(total===0x81)total=byte();
    if(p+total!==der.length)throw new Error('Invalid signature length.');
    function part(){if(byte()!==2)throw new Error('Invalid signature integer.');const n=byte();const raw=der.slice(p,p+n);p+=n;
      if(raw.length>33 || (raw.length===33&&raw[0]!==0))throw new Error('Invalid signature size.');
      const x=raw.slice(raw.length===33?1:0);if(x.length>32)throw new Error('Invalid signature width.');
      const out=new Uint8Array(32);out.set(x,32-x.length);return out;
    }
    const r=part(),s=part();if(p!==der.length)throw new Error('Invalid signature data.');
    const v=new Uint8Array(64);v.set(r);v.set(s,32);return v;
  }
  async function bioCreateForUser(userId){
    if(!bioAvailable())throw new Error('Platform biometrics are unsupported on this browser.');
    const challenge=rand(),handle=rand(); // random WebAuthn user handle; userId stays in this device's lock preference.
    const c=await navigator.credentials.create({publicKey:{challenge, rp:{name:'Point Pedro Indoor Court'},
      user:{id:handle,name:'PPD device user',displayName:'Point Pedro member'},
      pubKeyCredParams:[{type:'public-key',alg:-7}],
      authenticatorSelection:{authenticatorAttachment:'platform',residentKey:'discouraged',userVerification:'required'},
      timeout:60000,attestation:'none'}});
    if(!c || c.type!=='public-key')throw new Error('Biometric enrollment cancelled.');
    await checkClientData(c.response.clientDataJSON,challenge,'webauthn.create');
    const att=cborValue(new Uint8Array(c.response.attestationObject))[0];
    if(!(att instanceof Map))throw new Error('Authenticator registration invalid.');
    const ad=att.get('authData');await checkAuthenticatorData(ad,true);
    const idLen=(ad[53]<<8)|ad[54], offset=55+idLen;
    if(idLen<1 || offset>=ad.length)throw new Error('Authenticator credential missing.');
    const signedId=ad.slice(55,offset);
    if(!bytesEqual(signedId,new Uint8Array(c.rawId)))throw new Error('Authenticator identity mismatch.');
    const cose=cborValue(ad,offset)[0];
    if(!(cose instanceof Map)||cose.get(3)!==-7||cose.get(1)!==2||cose.get(-1)!==1)
      throw new Error('This device does not support the required ES256 credential.');
    const x=cose.get(-2),y=cose.get(-3);
    if(!(x instanceof Uint8Array)||!(y instanceof Uint8Array)||x.length!==32||y.length!==32)
      throw new Error('Authenticator public key invalid.');
    return {enabled:true,userId,credentialId:b64(signedId),publicJwk:{kty:'EC',crv:'P-256',x:b64(x),y:b64(y),ext:true},createdAt:new Date().toISOString()};
  }
  async function bioVerify(saved){
    if(!bioAvailable())throw new Error('Biometric unlock is unavailable on this device.');
    const challenge=rand(),request={challenge,timeout:60000,userVerification:'required',rpId:location.hostname,
      allowCredentials:[{type:'public-key',id:unb64(saved.credentialId)}]};
    const assertion=await navigator.credentials.get({publicKey:request});
    if(!assertion||assertion.type!=='public-key'||!bytesEqual(new Uint8Array(assertion.rawId),unb64(saved.credentialId)))
      throw new Error('This device credential did not match.');
    await checkClientData(assertion.response.clientDataJSON,challenge,'webauthn.get');
    const ad=new Uint8Array(assertion.response.authenticatorData);
    await checkAuthenticatorData(ad,false);
    const hash=new Uint8Array(await crypto.subtle.digest('SHA-256',assertion.response.clientDataJSON));
    const signed=new Uint8Array(ad.length+hash.length);signed.set(ad);signed.set(hash,ad.length);
    const key=await crypto.subtle.importKey('jwk',saved.publicJwk,{name:'ECDSA',namedCurve:'P-256'},false,['verify']);
    const valid=await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},key,
      derSignatureToRaw(new Uint8Array(assertion.response.signature)),signed);
    if(!valid)throw new Error('Biometric signature was not verified.');
    return true;
  }
  const bioGate=document.createElement('section');
  bioGate.className='ppd-biometric-gate';bioGate.setAttribute('role','dialog');
  bioGate.setAttribute('aria-modal','true');bioGate.setAttribute('aria-label','Unlock court app');
  bioGate.innerHTML='<div class="ppd-biometric-card"><div class="ppd-biometric-symbol" aria-hidden="true">🔐</div><h2>Unlock Point Pedro Court</h2><p>Use your device fingerprint, face or screen lock to continue.</p><button type="button" class="ppd-biometric-unlock">Unlock App</button><button type="button" class="ppd-biometric-signout">Sign out & use password</button><small class="ppd-biometric-message" role="status"></small></div>';
  document.body.appendChild(bioGate);
  const bioMsg=bioGate.querySelector('.ppd-biometric-message');
  const bioStatus=msg=>{bioMsg.textContent=msg;};
  let bioBusy=false, bioUnlockGranted=false, bioForgetRequested=false, bioUnlockedForUser='';
  function bioPresent(){
    // If the GAS server reports a public/expired session, show the login page,
    // never trap the user behind a local biometric gate with no server session.
    const hasLocalLock=!!bioLoad();
    const locked=hasLocalLock&&!bioUnlockGranted&&(!startupResolved||authReady);
    document.body.classList.toggle('ppd-biometric-locked',locked);
    bioGate.hidden=!locked;
    if(locked)bioGate.querySelector('.ppd-biometric-unlock').focus({preventScroll:true});
  }
  function bioReply(msg){postToGAS('PPD_BIO_STATUS',{supported:bioAvailable(),enabled:!!(bioLoad()&&bioLoad().userId===currentUserId),message:msg||
    (bioAvailable()?'This device biometric app lock is '+(bioLoad()?.userId===currentUserId?'enabled.':'disabled.'):
     'Biometric lock requires a compatible secure PWA with device screen lock.')});}
  bioGate.querySelector('.ppd-biometric-unlock').addEventListener('click',async()=>{
    if(bioBusy)return;const saved=bioLoad();if(!saved){bioUnlockGranted=true;bioPresent();return;}
    bioBusy=true;bioStatus('Waiting for device verification...');
    try{await bioVerify(saved);bioUnlockedForUser=saved.userId;bioUnlockGranted=true;bioPresent();bioReply('Device unlocked.');}
    catch(e){bioStatus(String(e.message||e));}
    finally{bioBusy=false;}
  });
  bioGate.querySelector('.ppd-biometric-signout').addEventListener('click',()=>{
    if(!authReady){bioStatus('Waiting for GAS authentication. Use Retry loading if the connection is delayed.');return;}
    if(!confirm('Sign out on this device and remove the biometric privacy lock?'))return;
    bioForgetRequested=true;bioStatus('Signing out securely...');postToGAS('PPD_BIO_FORGET');
  });
  async function bioToggle(){
    if(!authReady||!currentUserId){bioReply('Login is required before changing biometric preferences.');return;}
    if(bioBusy)return;bioBusy=true;
    try{
      const saved=bioLoad();
      if(saved && saved.userId!==currentUserId)throw new Error('Another user configured this device lock. Please sign out first.');
      if(saved){await bioVerify(saved);localStorage.removeItem(BIO_STORAGE);bioUnlockedForUser='';bioUnlockGranted=true;
        bioReply('Biometric app lock disabled on this device.');bioPresent();}
      else {const created=await bioCreateForUser(currentUserId);bioSave(created);bioUnlockGranted=true;
        bioReply('Biometric app lock enabled. It will be requested on the next app launch.');}
    }catch(e){bioReply('No changes saved: '+String(e.message||e).slice(0,160));}
    finally{bioBusy=false;}
  }
  // A direct PWA-origin button gesture is needed on some phones to open WebAuthn.
  const bioChangeDialog=document.createElement('dialog');
  bioChangeDialog.className='ppd-bio-confirm';
  bioChangeDialog.innerHTML='<div class="ppd-bio-confirm-content"><h2>Biometric App Lock</h2><p>Use this device fingerprint, face or screen lock. This is a local privacy lock; server login remains required.</p><button type="button" class="ppd-bio-confirm-go">Continue with device verification</button><button type="button" class="ppd-bio-confirm-cancel">Cancel</button></div>';
  document.body.appendChild(bioChangeDialog);
  bioChangeDialog.querySelector('.ppd-bio-confirm-go').addEventListener('click',()=>{
    bioChangeDialog.close();bioToggle();
  });
  bioChangeDialog.querySelector('.ppd-bio-confirm-cancel').addEventListener('click',()=>{
    bioChangeDialog.close();bioReply('No changes made.');
  });
  function promptBioChange(){
    if(!bioAvailable()){bioReply('WebAuthn is not supported on this PWA device.');return;}
    if(!authReady||!currentUserId){bioReply('Login is required to change device lock.');return;}
    bioChangeDialog.showModal();
  }
  bioPresent();
  // A long background absence re-locks only devices whose users opted in.
  let bioHiddenAt=0;
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){bioHiddenAt=Date.now();return;}
    if(bioHiddenAt&&Date.now()-bioHiddenAt>5*60*1000&&bioLoad()){
      bioUnlockedForUser='';bioUnlockGranted=false;bioPresent();
    }
    bioHiddenAt=0;
  });
  window.addEventListener('pagehide',()=>{bioHiddenAt=Date.now();});
  window.addEventListener('pageshow',e=>{if(e.persisted&&bioLoad()){
    bioUnlockedForUser='';bioUnlockGranted=false;bioPresent();
  }});

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
    sw=await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});
    if(sw.waiting)offerUpdate(sw.waiting);
    sw.addEventListener('updatefound',()=>{
      const worker=sw.installing;
      if(worker)worker.addEventListener('statechange',()=>{
        if(worker.state==='installed'&&navigator.serviceWorker.controller)offerUpdate(worker);
      });
    });
    return navigator.serviceWorker.ready;
  }
  const safeProbe=document.createElement('div');
  safeProbe.style.cssText='position:fixed;left:0;bottom:0;width:0;height:0;visibility:hidden;pointer-events:none;padding-bottom:env(safe-area-inset-bottom,0px)';
  document.documentElement.appendChild(safeProbe);
  const safeBottom=()=>{const v=parseFloat(getComputedStyle(safeProbe).paddingBottom);return isFinite(v)&&v>=0&&v<=80?Math.round(v):0;};
  function postToGAS(type, extra={}) {
    if(!gasWindow || !gasOrigin)return;
    // Reply to the exact authenticated Apps Script HTMLService window (often nested).
    // Only browser Push subscription metadata and navigation intents cross this bridge.
    gasWindow.postMessage({source:'PPD_PWA',type,safeBottom:safeBottom(),...extra},gasOrigin);
  }
  function requestAuthResync(){
    // The script.google.com outer iframe can contain a nested googleusercontent frame.
    // Both receive a query; only the trusted GAS UI is allowed to answer.
    const msg={source:'PPD_PWA',type:'PPD_AUTH_QUERY',safeBottom:safeBottom()};
    try{iframe.contentWindow?.postMessage(msg,'https://script.google.com');}catch(e){}
    if(gasWindow&&gasOrigin)postToGAS('PPD_AUTH_QUERY');
  }
  iframe.addEventListener('load',()=>{
    bridgeProbeCount=0;
    // An iframe document navigation needs its own server-confirmed auth handshake.
    if(startupResolved){
      authReady=false;currentUserId='';
      displayStartup('Checking the court session after navigation…');
      bioUnlockGranted=false;bioPresent();
    }
    requestAuthResync();
  });
  // Probe without clearing an active remembered session or replacing the GAS frame.
  const bridgeTimer=setInterval(()=>{
    if(!authReady&&++bridgeProbeCount<=180)requestAuthResync();
  },3000);
  window.addEventListener('focus',()=>{
    if(!authReady||authRestoring)requestAuthResync();
    sw?.update().catch(()=>{});
  });
  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden && (!authReady||authRestoring))requestAuthResync();
  });
  async function existingSubscription(){const r=await ensureSW();return r&&r.pushManager?r.pushManager.getSubscription():null;}
  function setRegistrationDialogMode(enabled){
    registrationDialogMode=!!enabled;
    const title=$('notifications-title'),subtitle=dialog.querySelector('.dialog-heading p'),notice=dialog.querySelector('.notice-box p');
    if(title)title.textContent=registrationDialogMode?'Complete device registration':'Mobile notifications';
    if(subtitle)subtitle.textContent=registrationDialogMode?'Notifications are allowed — one final step':'Push settings for this device';
    if(notice)notice.textContent=registrationDialogMode?'Notifications permission is already allowed. Continue to link this device to your signed-in booking account.':'Golden Bell stays in your booking app. This setting controls permission for phone notifications while the app is closed.';
  }
  function showRegistrationPrompt(userId,message){
    const id=String(userId||'');
    if(!authReady||!id||id!==currentUserId||!hasApis()||Notification.permission!=='granted'||(isIOS&&!standalone()))return;
    if(registrationPromptShownForUser===id)return;
    registrationPromptShownForUser=id;
    setRegistrationDialogMode(true);
    refreshUI(true);
    setDetails(!vapidKey?'Notifications are allowed, but device registration is not configured. Please contact the administrator.':(message||'Notifications are already allowed. Select Continue & register this device to finish linking it to your account.'));
    if(!dialog.open)dialog.showModal();
  }
  async function checkCurrentDeviceRegistrationAfterLogin(userId){
    const id=String(userId||'');
    if(!authReady||!id||id!==currentUserId||!hasApis()||Notification.permission!=='granted'||(isIOS&&!standalone()))return;
    registrationCheckPendingUser=id;
    if(!pushConfigLoaded||registrationCheckInFlight)return;
    if(!gasWindow||!gasOrigin)return;
    registrationCheckInFlight=true;
    try{
      const sub=await existingSubscription();
      if(!authReady||currentUserId!==id)return;
      postToGAS('PPD_PUSH_STATUS',{registrationCheck:true,registrationCheckUserId:id,subscription:sub&&typeof sub.toJSON==='function'?sub.toJSON():null});
    }catch(e){
      if(authReady&&currentUserId===id&&registrationCheckPendingUser===id){
        registrationCheckPendingUser='';
        deviceRegistered=false;pushReady=false;
        showRegistrationPrompt(id,'We could not verify this device yet. Continue to retry registration after login.');
      }
    }finally{registrationCheckInFlight=false;}
  }
  function refreshUI(preserveDetails=false){
    const p=('Notification' in window)?Notification.permission:'unsupported';
    permissionLabel.textContent=!hasApis()?'Unavailable':p==='granted'?'Allowed':p==='denied'?'Blocked':'Not requested';
    enable.disabled=!hasApis()||p==='denied'||(p==='granted'&&!authReady)||(p==='granted'&&authReady&&!vapidKey);
    enable.textContent=p==='granted'?(authReady?(deviceRegistered?'Refresh device registration':'Continue & register this device'):'Login to finish device registration'):'Enable notifications';
    testLocal.disabled=!hasApis()||p!=='granted';
    testReal.disabled=!(deviceRegistered&&pushReady&&authReady);
    delivery.textContent=deviceRegistered?(pushReady?'Device linked · sender enabled':'Device linked · sender not configured'):'Not connected';
    // Setup launcher disappears after the device has been registered; open ?notifications=1 to manage later.
    setup.hidden=deviceRegistered&&pushReady || new URLSearchParams(location.search).has('hidesetup');
    $('ios-install-tip').hidden=!isIOS||standalone();
    if(!preserveDetails){
      if(!hasApis())setDetails('This browser cannot use Web Push. Use HTTPS on a supported browser.');
      else if(isIOS&&!standalone())setDetails('On iPhone: add this app to the Home Screen before enabling Web Push.');
      else if(p==='denied')setDetails('Notifications are blocked. Allow this site in device settings.');
      else if(deviceRegistered&&pushReady)setDetails('This device is registered. Use REAL push test to check background delivery. GitHub Actions notifications may be delayed.');
      else if(deviceRegistered)setDetails('Device linked, but server setup is still needed. Please configure Web Push Secrets and enable it in Apps Script.');
      else if(p==='granted'&&!vapidKey)setDetails('Permission allowed. VAPID public key not configured. See GitHub README before registering.');
      else if(p==='granted'&&!authReady)setDetails('Please log in to the booking app to link this device to your account.');
      else if(p==='granted')setDetails('Permission is allowed. Select Continue & register this device to connect push.');
      else setDetails('Enable notifications on this device. Golden Bell remains unchanged.');
    }
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
    if(d.type==='PPD_SPLASH_METADATA'){
       applySplashMetadata(d,true);
       postToGAS('PPD_SPLASH_METADATA_ACK');
       return;
    }else if(d.type==='PPD_SESSION_REQUEST'){
      const saved=savedSession();
      postToGAS('PPD_SESSION_RECOVER',{token:saved?saved.token:''});
    }else if(d.type==='PPD_SESSION_STORE'){
      if(d.remembered===true)storeRememberedSession(d.token,d.userId);
    }else if(d.type==='PPD_SESSION_CLEAR'){
      clearSavedSession();
    }else if(d.type==='PPD_DISPLAY_SETTINGS'){
      const userId=String(d.userId||'');
      if(userId){
        const preference=normalizeDisplayPreference(d.preferences);
        saveDisplayPreference(userId,preference);
        if(!currentUserId||currentUserId===userId)applyDisplayPreference(preference);
      }
      return;
    }else if(d.type==='PPD_AUTH_READY'){
       applySplashMetadata({developerName:d.developerName,appVersion:d.appVersion},true);
       if(typeof d.logoUrl==='string' && $('pwa-splash-logo')){
         const candidate=d.logoUrl.trim();
         if(/^https:\/\//i.test(candidate) || /^data:image\/(?:png|jpeg|webp);base64,/i.test(candidate)){
           $('pwa-splash-logo').src=candidate;
           try{localStorage.setItem('ppd_public_brand_logo',candidate.length<8000?candidate:'');}catch(_){/* optional public metadata */}
         }
       }
      postToGAS('PPD_AUTH_ACK');
      authRestoring=!!d.restoring;
      if(authRestoring){
        if(startupActions.hidden)displayStartup('Restoring your saved login securely…');
        bioPresent();
        return;
      }
      const wasAuthenticated=authReady, previousUser=currentUserId;
      authReady=!!d.authenticated;
      currentUserId=authReady?String(d.userId||''):'';
      if(authReady)restoreDisplayPreferenceForUser(currentUserId,d.displayPreferences);
      else applyDisplayPreference(DEFAULT_DISPLAY_PREFERENCE);
      if(authReady && (!wasAuthenticated || previousUser!==currentUserId)){
        bioUnlockGranted=!!(bioUnlockedForUser&&bioUnlockedForUser===currentUserId);
        deviceRegistered=false;pushReady=false;registrationPromptShownForUser='';registrationCheckPendingUser='';
      }
      if(!authReady){deviceRegistered=false;pushReady=false;registrationCheckPendingUser='';registrationPromptShownForUser='';}
      completeStartup();bioPresent();
      if(authReady&&(!wasAuthenticated||previousUser!==currentUserId)){
        registrationPromptShownForUser='';
        if('Notification' in window&&Notification.permission==='granted')checkCurrentDeviceRegistrationAfterLogin(currentUserId);
      }
    }else if(d.type==='PPD_AUTH_RETRY'){
      authRestoring=false;
      // Show GAS's existing Retry secure session screen, retaining its token.
      completeStartup();bioPresent();
    }else if(d.type==='PPD_BIO_QUERY'){
      if(authReady && currentUserId && String(d.userId||'')===currentUserId)bioReply();
    }else if(d.type==='PPD_BIO_SET'){
      if(authReady && currentUserId && String(d.userId||'')===currentUserId)promptBioChange();
    }else if(d.type==='PPD_BIO_SESSION_GONE'){
      // Expired GAS session requires password. Wait for GAS to finish loading the
      // public page before removing our startup shield; keep the opt-in preference.
      authReady=false;currentUserId='';bioUnlockedForUser='';bioUnlockGranted=true;
      registrationCheckPendingUser='';registrationPromptShownForUser='';deviceRegistered=false;pushReady=false;
      clearSavedSession();
      displayStartup('Your saved session expired. Opening sign-in…');bioPresent();
    }else if(d.type==='PPD_BIO_FORGOTTEN'){
      if(bioForgetRequested && d.ok){localStorage.removeItem(BIO_STORAGE);bioUnlockGranted=true;
        bioPresent();bioForgetRequested=false;location.reload();}
      else{bioForgetRequested=false;bioStatus('Unable to sign out. Try again after reconnecting.');}
    }else if(d.type==='PPD_REGISTER_RESULT'){
      deviceRegistered=!!d.ok;pushReady=!!d.ready;
      if(d.ok){
        registrationCheckPendingUser='';registrationPromptShownForUser=currentUserId;
        setDetails('This device is now registered to your booking account.');
        if(dialog.open)dialog.close();
      }else{
        setDetails('Device registration error: '+String(d.error||'Please sign in again.'));
      }
    }else if(d.type==='PPD_TEST_RESULT'){
      setDetails(d.ok?'Real Push queued. It may take time for GitHub Actions to execute; lock screen delivery is not yet guaranteed.':'Real push test failed: '+String(d.error||'Unknown error'));
    }else if(d.type==='PPD_STATUS_RESULT'){
      if(d.registrationCheck===true&&authReady&&String(d.registrationCheckUserId||'')===currentUserId&&registrationCheckPendingUser===currentUserId){
        registrationCheckPendingUser='';
        deviceRegistered=!!d.currentDeviceRegistered;pushReady=!!d.serverReady;
        if(deviceRegistered){
          registrationPromptShownForUser=currentUserId;
          setDetails(pushReady?'This device is already registered and ready for background push.':'This device is registered, but the push sender still needs configuration.');
        }else{
          showRegistrationPrompt(currentUserId,d.ok===false?'We could not verify this device yet. Continue to retry registration after login.':'Notifications are already allowed. Continue to link this device to your booking account.');
        }
      }else if(d.lastDelivery&&d.lastDelivery.status==='ACCEPTED')setDetails('Browser Push Service accepted last delivery at '+String(d.lastDelivery.at)+'. Device display is still subject to phone settings.');
    }
    refreshUI(d.type==='PPD_STATUS_RESULT'&&d.registrationCheck===true || d.type==='PPD_REGISTER_RESULT');
  });
  setup.addEventListener('click',()=>{setRegistrationDialogMode(false);requestAuthResync();refreshUI();dialog.showModal();});
  $('notification-close-button').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{setRegistrationDialogMode(false);refreshUI();});
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
    pushConfigLoaded=true;
    try{await ensureSW();}catch(e){console.warn('Service worker failed:',e);}
    refreshUI();
    if(authReady&&'Notification' in window&&Notification.permission==='granted')checkCurrentDeviceRegistrationAfterLogin(currentUserId);
  }).catch(e=>{
    pushConfigLoaded=true;refreshUI();console.warn('Push config load failed:',e);
    if(authReady&&'Notification' in window&&Notification.permission==='granted')checkCurrentDeviceRegistrationAfterLogin(currentUserId);
  });
  refreshUI();
})();
