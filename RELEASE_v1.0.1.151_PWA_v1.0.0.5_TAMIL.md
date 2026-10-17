# Point Pedro Court — GAS v1.0.1.151 + GitHub PWA v1.0.0.5

## அடிப்படை Source மற்றும் Scope

- GAS baseline: `PPD_AppsScript_v1.0.1.150_GAS_Notifications_Extension_Mobile.zip`.
- GitHub baseline: பயனர் வழங்கிய `PPD_GitHub_PWA_v1.0.0.4_Login_Biometric_Zoom.zip`.
- GAS-இல் `Code.gs`-ன் version label மற்றும் `UIJs.html`-இன் **ஏற்கனவே இருக்கும் Login/PWA bridge மூல Functions** மட்டுமே திருத்தப்பட்டுள்ளன. மற்ற source files பழையபடியே உள்ளன.
- GitHub-இல் `index.html`, `styles.css`, `app.js`, `sw.js` Original Files மட்டும் திருத்தப்பட்டுள்ளன. Existing Push Gateway மற்றும் Golden Bell செயல்பாடுகள் நீக்கப்படவில்லை.
- Live GAS, Google Sheets, Tuya Hardware, iOS PWA ஆகியவற்றை இந்த சூழலில் இயக்கிச் சோதிக்க இயலவில்லை. நேரடி Production Verification கட்டாயம்.

## செய்துள்ள மாற்றங்கள்

1. **Session startup handshake:** GAS `PPD_AUTH_READY` செய்தியில் `restoring` நிலையைத் தெரிவிக்கிறது. PWA Login Validation நடக்கும்போது Public Home-ஐ முன்கூட்டியே காண்பிக்காது. Server validation முடிந்த பின்னர் Authenticated/Public View திறக்கும்.
2. **Retry without token loss:** Network Error ஆனால் GAS-இன் `Retry secure session` திரை காட்டப்படும். `PPD_AUTH_RETRY` செய்தி மூலம் PWA Loading Overlay அகற்றப்படும். Token-ஐ GitHub Parent பக்கத்திற்கு அனுப்பவில்லை.
3. **Safe biometric privacy gate:** Biometric opt-in வைத்திருப்பவருக்கு PWA local WebAuthn Gate தொடர்ந்து இருக்கும். ஆனால் செல்லுபடியாகும் Server Session இல்லாதபோது App பயனரை Biometric Gate-க்குள் சிக்கவைக்காது. OS Screen Lock/Fingerprint/Face Unlock user verification பயன்படுத்தப்படும். இது GAS Password Login-க்கு மாற்றீடு அல்ல.
4. **Fixed Wrapper Layout:** GitHub HTML/body/app shell `100dvh`-இல் நிலையாக இருக்கும்; GAS iframe முழு பகுதியையும் நிரப்பும். GAS-இன் Header மற்றும் Footer GitHub-இல் Duplicate செய்யப்படவில்லை. Scroll செய்யப்படுவது iframe உள்ளடக்கமே.
5. **Zoom/mobile:** GitHub Wrapper-இல் viewport மற்றும் touch overflow சீரமைப்பு; Direct GAS-க்கு v1.0.1.150-ல் முன்பே செய்த mobile view மாற்றங்கள் தொடரும். Browser / iOS Accessibility Zoom-ஐ முற்றிலும் தடுக்க முடியாது.
6. **Safer PWA updates:** Service Worker v1.0.0.5. New worker தானாக live booking-ஐ refresh செய்யாது. `Update now`-ஐ பயனர் உறுதிப்படுத்தியபின் மட்டுமே shell reload நடக்கும். Install நேரத்தில் optional manifest/icons இல்லை என்றாலும் core SW install தடுக்கப்படாது.
7. **Offline cache boundary:** GAS iframe, Google Sheets, Auth Responses ஆகியவை GitHub Service Worker-ஆல் cache செய்யப்படாது. GitHub Static Shell Files மட்டுமே cache செய்யப்படும்.

## முக்கியமான தொழில்நுட்ப வரம்பு — Persistent Login

உங்கள் தற்போதைய அமைப்பில் **GitHub Pages ஒரு origin, GAS iframe வேறு origin**. GAS `localStorage`/`sessionStorage` உள்ள Remember-Me Token-ஐ GitHub Parent-க்கு அனுப்பவில்லை; பாதுகாப்புக்காக இதை மாற்றவில்லை.

Browser (குறிப்பாக iPhone Standalone Safari/PWA) GAS iframe-க்கு third-party storage வழங்காமல் இருந்தால், App Close/Reopen பிறகு அந்த Session Token கிடைக்காமல் போகலாம். இந்த Release **Loading/Bridge/Retry பிரச்சனைகளைச் சரிசெய்கிறது; எல்லா Browser-களிலும் Token Persistence உத்தரவாதம் அளிக்கவில்லை.** அனைத்து iOS/Android-களிலும் உறுதியான Passwordless Restore வேண்டுமானால் முதல்-தரப்பு server-origin authentication architecture என்ற பெரிய மாற்றம் தேவைப்படும். PWA GitHub localStorage-இல் plain password அல்லது GAS session token பாதுகாப்பற்ற முறையில் சேமிக்கப்படவில்லை.

## Deployment – சரியான வரிசை

**படி 0.** தற்போதைய GAS Project, GitHub Repository மற்றும் Script Properties Backup எடுக்கவும். App-ஐ Uninstall செய்யவோ Site Data Clear செய்யவோ வேண்டாம்; அப்படிச் செய்தால் Push Subscription/Biometric Setting அழியலாம்.

**படி 1 – GAS:** `PPD_AppsScript_v1.0.1.151_PWA_Bridge_Compatibility.zip`-இன் root-இல் உள்ள `Code.gs` மற்றும் `UIJs.html` மட்டும் தற்போது இயங்கும் **அதே** GAS Project-இல் Replace செய்யவும். மற்ற source files v1.0.1.150-இல் இருந்தபடி வைத்திருக்கவும். `Deploy → Manage deployments → Existing Web App → Edit → New version → Deploy`. புதிய Project உருவாக்க வேண்டாம்.

**படி 2 – GitHub:** `PPD_GitHub_PWA_v1.0.0.5_Session_Biometric_Update.zip`-இல் உள்ள `index.html`, `styles.css`, `app.js`, `sw.js` நான்கையும் பழைய Original Files-க்கு பதிலாக Repository Root-இல் Update செய்யவும். மற்ற `manifest.webmanifest`, `icons/`, `push-config.json`, `.github/workflows/` ஆகியவற்றை அழிக்க/மாற்ற வேண்டாம்.

**படி 3 – URL check:** GitHub `index.html`-இன் `booking-frame src` இன்னும் தற்போதைய GAS `/exec` URL-ஐக் காட்டுகிறதா பார்க்கவும். ZIP-இல் பழைய URL இருந்தால் தற்போதைய `/exec` URL-ஐ மட்டும் பயன்படுத்தவும். GAS `PPD_PWA_ORIGIN` உங்கள் உண்மையான GitHub Pages domain-க்கு பொருந்த வேண்டும் (default `https://ppdbooking.github.io`).

**படி 4 – Update:** GitHub Pages Deployment Success வந்ததும் PWA திறக்கவும். புதிய Version banner வந்தால் Booking/Form முடித்த பிறகு `Update now` தேர்வு செய்யவும். Uninstall அல்லது Storage Clear தேவையில்லை.

## Acceptance Checklist

- [ ] Direct GAS: Remember This Device → Login → Close/Reopen → valid session இருந்தால் Home.
- [ ] GitHub PWA: Login → Close/Reopen → Saved Session கிடைத்தால் Home, Public Screen Flash இல்லாமல்.
- [ ] Wi-Fi/Network failure: GAS Retry Screen காணப்பட வேண்டும்; Session Token அழியக்கூடாது.
- [ ] Logout / Session expiry: Server பாதுகாப்பான Login கேட்க வேண்டும்.
- [ ] Optional Biometric ENABLE: WebAuthn Verification → PWA Unlock; non-enabled accounts normal session behaviour.
- [ ] Biometric இருந்தும் Server Session இல்லை: Public Login-க்குச் செல்ல முடியும்; biometric deadlock இல்லை.
- [ ] Header/Bottom Navigation நிலையாக இருக்க வேண்டும்; Content மட்டும் Scroll ஆக வேண்டும்.
- [ ] Zoom, keyboard focus, safe-area: iPhone + Android சோதனை.
- [ ] Real Push/Golden Bell/Notification Settings பழையபடியே வேலை செய்ய வேண்டும்.
- [ ] Version Update நடந்துகொண்டிருக்கும் Booking Submit-ஐ திடீரென refresh செய்யக்கூடாது.
- [ ] புதிய GAS Web App Project உருவாக்காமல் அதே deployment பயன்படுத்தப்பட்டுள்ளதா உறுதிசெய்யவும்.

## Static / Mock Test Results

- GAS `Code.gs`, `UIJs.html`, PWA `app.js`, `sw.js` syntax: PASS.
- Browser DOM mock: Auth Restoring → Authenticated / Public View; no page errors: PASS.
- Service Worker lifecycle: initial install, user-approved upgrade, cache isolation: PASS.
- Live iPhone/Android, fingerprint hardware, cross-site PWA session persistence: **NOT YET VERIFIED**.
