# Point Pedro Indoor Court — GAS v1.0.1.153 / GitHub PWA v1.0.0.6

## அடிப்படைப் பதிப்புகள்
- GAS: `v1.0.1.152` ZIP அடிப்படையில்.
- GitHub PWA: `v1.0.0.5` ZIP அடிப்படையில்.
- **இரண்டு புதிய பதிப்புகளையும் ஒன்றாக Deploy செய்வது அவசியம்.** புதிய GAS Session Recovery Protocol மற்றும் புதிய PWA Protocol ஒன்றையொன்று சார்ந்தவை.

## GAS-இல் செய்யப்பட்ட Original Source மாற்றங்கள்
- `index.html`: பயனர் கொடுத்த ஏழு 3D PNG Artwork-கள் (Refresh, Search, Gold Bell, Red Bell, Login, Logout, New User). Apps Script HTML-இல் தனி PNG File upload தேவையில்லாமல் இருக்க சிறிய transparent PNG Data URI ஆக இணைக்கப்பட்டுள்ளது. Button Click Handlers/Notification Badge IDs அப்படியே உள்ளன.
- `Style.html`: Desktop-இல் Login-ஐ Text Button-க்கு பதிலாக Icon; Universal Button Border/Background/Size; Mobile Public Header-இல் Refresh + New User + Login வரிசை அருகருகே; Authenticated Icons பழைய வரிசை; Title Font சற்று பெரிது; Transparent Logo தொடர்ந்து அதேபடி; Direct GAS Safe Area மற்றும் GitHub iframe Safe Area இரண்டையும் தனித்தனியாகக் கையாளும் root rules.
- `UIJs.html`: Public/Authenticated Header class மாற்றம். Browser iframe Storage இழந்த iPhone PWA-க்கு **Remember this device** தேர்வு செய்திருந்தால் மட்டுமே PWA Origin-இல் சேமிக்கப்பட்ட revocable session token மூலம் மீண்டும் GAS Server Bootstrap Validation நடத்துதல். Explicit Logout, remembered-login off, server-declared invalid/expired session ஆகியவற்றில் PWA copy அழித்தல். Existing Biometric Privacy Lock logic தொடர்ந்து பயன்படுத்தப்படும்.
- `Code.gs`: Version `1.0.1.153`.

## GitHub PWA மாற்றங்கள்
- `index.html`: iOS status bar mode `black-translucent`; CSS/JS cache version `1.0.0.6`.
- `styles.css`: iOS Standalone Safe Area (notch, rounded corners, Home Indicator), Green Header / Dark Bottom Bar background; existing fixed iframe shell continues.
- `app.js`: local PWA origin remembered session recovery, strict GAS origin/window validation, new PWA Session Bridge; `navigator.standalone` fallback; original WebAuthn biometric privacy gate, PushManager preserved.
- `sw.js`: shell cache version `1.0.0.6`.

## Login பாதுகாப்பு & வரம்புகள்
- **Remember this device** ON எனத் தேர்வு செய்து PWA-இல் வெற்றிகரமாக Login செய்தால் மட்டுமே PWA இந்த GAS session bearer token-ஐ உள்ளூரில் நினைவில் வைத்துக் கொள்ளும். **Password, biometric template, private key சேமிக்கப்படாது.**
- PWA Origin Browser Local Storage-இல் **server-revocable bearer token** சேமிக்கப்படுகிறது; இந்த சாதனத்திற்கு அணுகல் உள்ளவர்கள் அல்லது அந்த Web Origin-இன் JavaScript-ஐ மாற்றும் ஒருவருக்கு அது வெளிப்படும் அபாயம் உண்டு. **தனிப்பட்ட, நம்பகமான சாதனத்தில் மட்டும் Remember this device பயன்படுத்தவும்**; பகிரப்படும் சாதனத்தில் OFF வைத்து Logout செய்யவும். HTTPS மற்றும் சரியான Site/Origin பாதுகாப்பு அவசியம்.
- PWA சேமித்த Token-ஐ நம்பி மட்டும் Login செய்யாது. GAS `getSessionBootstrap` மூலம் Server-side session expiry, active account, permissions சரிபார்க்கப்பட்ட பிறகே உள்ளே செல்லும்.
- Session expired / revoked / password மாற்றத்தால் server session invalid என்றால் மீண்டும் Username/Password Login அவசியம். Face ID / Fingerprint என்பது **optional local privacy unlock** மட்டுமே; காலாவதியான server session-க்கு passwordless login அல்ல.
- iPhone-இல் OS Browser Site Data அழிக்கப்பட்டாலும், Private Mode அல்லது Website Data Clear செய்யப்பட்டாலும், Session மீண்டும் கிடைக்காது.
- புதிய Bridge நிறுவிய பிறகு iPhone-இல் ஒரு முறை **Remember this device** ON வைத்து Login செய்ய வேண்டும். பழைய பதிப்பில் GAS iframe-இல் மட்டும் இருந்த Token தானாக GitHub PWA Storage-க்கு வராது.

## சரியான Deployment வரிசை
1. இயங்கும் GAS Project, Google Sheets, Script Properties, GitHub Files ஆகியவற்றைப் பாதுகாப்பாக Backup எடுக்கவும்.
2. **அதே Apps Script Project-இல்** புதிய ZIP-இன் `Code.gs`, `index.html`, `Style.html`, `UIJs.html` ஆகியவற்றை மாற்றி Save செய்யவும்; **Manage Deployments → Edit → New Version → Deploy** செய்யவும். Web App `/exec` URL மாறாமல் இருக்க வேண்டும்.
3. GitHub Pages Repository-இல் `index.html`, `styles.css`, `app.js`, `sw.js` ஆகிய 4 Files மட்டும் மாற்றவும். Existing `manifest.webmanifest`, `icons/`, push-config, GitHub Actions மற்றும் பிற Assets-ஐ நீக்க வேண்டாம்.
4. GitHub `index.html` iframe `src` தற்போதைய GAS `/exec` URL-ஐக் காட்டுகிறதா உறுதிப்படுத்தவும். GAS-இல் configure செய்த PWA Origin உண்மையான GitHub Origin (`https://ppdbooking.github.io` என இருந்தால் அதுவே) உடன் பொருந்த வேண்டும்.
5. iPhone Add-to-Home-Screen App-ஐத் திறந்து புதிய Version முழுமையாக Load ஆகும் வரை காத்திருக்கவும். ஒருமுறை `Remember this device` உடன் Login செய்யவும்; App-ஐ முழுவதுமாக Close → Reopen செய்து சோதிக்கவும்.
6. Optional Biometric Lock User Settings-இல் Enable செய்திருந்தால் Face ID/Fingerprint → authenticated Home வேலை செய்யும் என்று சோதிக்கவும். Logout செய்த பின் எந்த Biometric-உம் பழைய Server Session-ஐ மீட்டெடுக்கக்கூடாது.
7. Direct GAS iPhone Safari, Android Chrome Home-Screen App, Desktop Browser, iPhone GitHub PWA ஆகியவற்றில் Header/Icon Alignment, Notch/Bottom Safe Area, Scroll, Notifications, Bookings சோதிக்கவும்.

## சோதனை செய்தவை / செய்யாதவை
- செய்யப்பட்டது: GAS Code.gs + UIJs.html JavaScript Syntax Checks; PWA app.js/sw.js Syntax Checks; Duplicate HTML IDs; 7 Original Image Assets; 320/390/430/1280px Browser Layout checks; Mock PWA Session Recovery (Remember OFF/ON, Recovery, Bad Token, Logout); old GAS/PWA ZIP உடன் exact changed-file comparison.
- **செய்யப்படாதவை**: உண்மையான iPhone Standalone Safari App, Face ID Device Hardware, Live Google Apps Script Authentication/Google Sheets, GitHub Production Service Worker / Push, Logout/PIN செயல்முறை End-to-End tests. Live Success உறுதிப்படுத்தப்படவில்லை.

## மாற்றப்படாமல் பாதுகாக்கப்பட்டவை
New Booking Rules, Admin Extension, Court Availability, User Tabs, Payments, Tuya, Camera, Existing Notification/Push handlers, Existing Biometric WebAuthn logic, Desktop logged-in icon order, Main Booking Layout, Navigation/footer.
