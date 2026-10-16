# PPD Court v1.0.0.30 / PWA v1.0.0.4 — Login, Startup, Biometric, Zoom

## SOURCE & INSTALLATION

இந்த release, முன்பு வழங்கப்பட்ட **Apps Script v1.0.0.29** source-ஐ அடிப்படையாகக் கொண்டது. தற்போதைய live Apps Script-ல் அதன் பிறகு தனியாக Code மாற்றங்கள் செய்திருந்தால், அவற்றை இந்த ZIP மூலம் overwrite செய்யாமல் முதலில் merge செய்ய வேண்டும்.

### Step 1 — Apps Script

முதலில் backup எடுக்கவும். `PPD_AppsScript_v1.0.0.30_Login_Startup_Biometric_Zoom.zip`-இன் **root**-ல் உள்ள `Code.gs`, `UIJs.html`, `Style.html`, `index.html` ஆகிய நான்கு files-ஐ Google Apps Script project-இல் replace செய்யவும். மற்ற existing project files-ஐ அப்படியே வைத்திருக்கவும்.

**Deploy > Manage deployments > Existing web app > Edit > Version: New version > Deploy** பயன்படுத்தவும். இதனால் வழக்கமாக அதே `/exec` URL தொடரும். தேவையின்றி **New deployment** உருவாக்க வேண்டாம்.

### Step 2 — GitHub PWA

`PPD_GitHub_PWA_v1.0.0.4_Login_Biometric_Zoom.zip`-இன் **root**-ல் உள்ள இந்த நான்கு Files மட்டும் repository root-ல் update செய்யவும்:

- `app.js`
- `styles.css`
- `sw.js`
- `index.html`

ZIP-ல் உள்ள `index.html`, release தயாரித்த நேரத்தில் GitHub repository-ல் இருந்த Apps Script `/exec` URL-ஐ preserve செய்கிறது. **பின்னர் URL மாற்றப்பட்டிருந்தால்**, upload செய்யும் முன் GitHub live `index.html`-ன் `iframe src` மற்றும் ZIP `index.html` URL ஒன்றா என verify செய்யவும். வேறுபட்டால் live URL-ஐயே வைத்துக் கொண்டு viewport meta மட்டும் update செய்யவும். GitHub Actions workflow, `push-config.json`, VAPID keys அல்லது GitHub Secrets மாற்றப்படவில்லை.

Upload முடிந்ததும் GitHub Pages deployment Success என்பதைப் பார்க்கவும்; App-ஐ மூடி மீண்டும் திறக்கவும். **PWA Site Data Clear / Uninstall செய்ய வேண்டாம்** — அது Push Subscription-ஐ reset செய்யக்கூடும்.

## FUNCTIONAL BEHAVIOUR

1. **Remember This Device**: பழைய Fixed 7-Day Session நீக்கப்பட்டது. Signed-in பயன்பாட்டில் இருக்கும் Remembered Session server-side rolling renewal பெறும். பாதுகாப்புக்காக **90 நாட்கள் முழுமையாக பயன்படுத்தாவிட்டால்**, அல்லது logout / server revocation / clear browser data என்றால் மீண்டும் Login தேவைப்படும். முற்றிலும் காலாவதியாகாத token வழங்கப்படவில்லை.
2. **Startup**: Server உறுதிசெய்யும் Session Validation தொடரும். Bootstrap-க்கு இடையில் unnecessary background notifications/preloading ஒத்திவைக்கப்பட்டுள்ளன. Temporary Apps Script network error வந்தால் token அழிக்காமல் **Retry secure session** தோன்றும். Apps Script cold start காரணமாக எல்லா devices-லும் instant load உறுதி இல்லை.
3. **Biometric App Lock**: Login ஆன பிறகு **Profile > Credentials & Security** கீழ் optional Enable/Disable. Default OFF. Installed PWA stable origin-ல் WebAuthn user verification கிடைத்தால் Fingerprint / Face / Screen Lock மூலம் privacy unlock; supported browser/device-ல் மட்டும். Enable செய்யும்போது PWA top-level 'Continue with device verification' Button-ஐ அழுத்த வேண்டும். மறுமுறை PWA launch செய்யும்போதும் 5 நிமிடத்துக்கு மேல் background-ல் இருந்துவிட்டு திரும்பும்போதும் Lock மீண்டும் காட்டப்படும். Backend Login-க்கு Biometric மாற்றீடு அல்ல; இது **local privacy gate**, direct Apps Script access-ஐ தனியாகத் தடுக்காது.
4. **Zoom**: Mobile PWA + GAS iframe-ல் standard pinch/double-tap zoom controls குறைக்கப்பட்டன; normal scrolling மற்றும் page navigation தொடரும். Browser accessibility zoom/magnification மற்றும் desktop browser controls-ஐ முழுமையாகத் தடுக்க முடியாது.
5. **Notification Click**: Existing push delivery and click routing code பாதுகாக்கப்பட்டது. Real Phone notification-ல் எந்த booking detail page திறக்கும் என்பது existing server event targetPage rules-க்கு ஏற்ப.

## TEST CHECKLIST (Live deployment இல்லாமல் complete ஆகாது)

- Login → Remember This Device தேர்வு → PWA close/reopen → Login Page skip ஆகிறதா
- Temporary network outage → stored token மாறாமல் Retry காட்டுகிறதா
- Logout → மீண்டும் Username/Password கேட்கிறதா
- Profile → Biometric Enable → OS prompt → App reopen → biometric unlock
- Biometric OFF தேர்வு → பின்பு normal startup
- Mobile pinch/double tap → booking calendar/button interaction பாதிக்கப்படாமல் Zoom தடுக்கப்படுகிறதா
- Golden/Red Bell in-app notifications + Real Push Test → PC/Mobile-ல் சரியாகத் தொடர்கிறதா
- Push notification tap → existing PWA opens; target page access remains authorized

**Note:** Static JS syntax, file presence, PWA DOM checks செய்யப்பட்டுள்ளன. நிஜமான Android/iOS device, GAS latency, WebAuthn hardware verification மற்றும் booking regression ஆகியவை production deployment-க்கு பிறகு மட்டுமே உறுதிப்படுத்த முடியும்.
