/* GitHub Pages wrapper only. Booking business logic remains on Google Apps Script. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const dialog = $('notification-dialog');
  const enableButton = $('enable-notifications-button');
  const testButton = $('test-notification-button');
  const permissionStatus = $('permission-status');
  const details = $('notification-details');
  const statusDot = $('push-dot');
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const iosInstallTip = $('ios-install-tip');
  const installButton = $('install-button');
  let workerRegistration = null;
  let deferredInstallPrompt = null;

  function setDetails(message) { details.textContent = message; }
  function hasPermissionApi() { return ('Notification' in window) && ('serviceWorker' in navigator) && window.isSecureContext; }

  async function ensureWorker() {
    if (workerRegistration) return workerRegistration;
    if (!('serviceWorker' in navigator) || !window.isSecureContext) return null;
    workerRegistration = await navigator.serviceWorker.register('./sw.js', {scope:'./'});
    return workerRegistration;
  }

  function refreshPermissionUI() {
    const usable = hasPermissionApi();
    const permission = ('Notification' in window) ? Notification.permission : 'unsupported';
    permissionStatus.textContent = usable ? ({default:'Not requested', granted:'Allowed', denied:'Blocked'}[permission] || permission) : 'Unavailable';
    enableButton.disabled = !usable || permission === 'denied' || permission === 'granted';
    enableButton.textContent = permission === 'granted' ? 'Permission granted' : permission === 'denied' ? 'Blocked in device settings' : 'Enable notifications';
    testButton.disabled = !usable || permission !== 'granted';
    statusDot.style.background = permission === 'granted' ? '#7dddba' : '#efc773';
    iosInstallTip.hidden = !isIOS || standalone();
    if (!usable) setDetails('This browser or context cannot register web notifications. Open the HTTPS GitHub Pages URL.');
    else if (isIOS && !standalone()) setDetails('On iPhone, install this site to the Home Screen before granting push permission.');
    else if (permission === 'denied') setDetails('Notifications are blocked. Change the permission in browser or iPhone settings, then reopen.');
    else if (permission === 'granted') setDetails('Phone notification permission is allowed. Live booking push is not connected yet.');
    else setDetails('Allow notifications on this device. Your current Golden Bell notifications are unaffected.');
  }

  $('notification-settings-button').addEventListener('click', () => {
    refreshPermissionUI();
    if (!dialog.open) dialog.showModal();
  });
  $('notification-close-button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  enableButton.addEventListener('click', async () => {
    // Apple requires a direct user gesture. Keep this call in the click handler.
    if (isIOS && !standalone()) {refreshPermissionUI();return;}
    if (!hasPermissionApi()) {refreshPermissionUI();return;}
    enableButton.disabled = true;
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') await ensureWorker();
    } catch (error) {
      setDetails('Permission request failed: ' + (error && error.message ? error.message : 'Unknown browser error'));
    } finally {refreshPermissionUI();}
  });
  testButton.addEventListener('click', async () => {
    if (!hasPermissionApi() || Notification.permission !== 'granted') return;
    testButton.disabled = true;
    try {
      const reg = await ensureWorker();
      if (!reg || !reg.showNotification) throw new Error('Service Worker notifications are unavailable');
      await reg.showNotification('Point Pedro Indoor Court', {
        body:'Local notification test. This is NOT a booking alert.',
        icon:'./icons/icon-192.png', badge:'./icons/icon-192.png',
        tag:'ppd-local-test', data:{url:new URL('./',location.href).href}
      });
      setDetails('Local test requested. You must still connect a secure Push sender for real booking alerts.');
    } catch (error) {
      setDetails('Test failed: ' + (error && error.message ? error.message : 'Unknown browser error'));
    } finally {refreshPermissionUI();}
  });

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();deferredInstallPrompt=event;installButton.hidden=false;
  });
  window.addEventListener('appinstalled', () => {installButton.hidden=true;deferredInstallPrompt=null;});
  installButton.addEventListener('click',async()=>{
    if(deferredInstallPrompt){deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;installButton.hidden=true;}
    else {dialog.showModal();refreshPermissionUI();}
  });
  window.addEventListener('online', () => $('offline-note').hidden=true);
  window.addEventListener('offline', () => $('offline-note').hidden=false);
  $('offline-note').hidden=navigator.onLine;
  refreshPermissionUI();
  ensureWorker().catch(error=>console.warn('PWA Service Worker setup failed:',error));
})();
