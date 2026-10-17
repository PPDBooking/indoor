# Point Pedro Indoor Court – Correction Release

**GAS:** v1.0.1.155 (previous v1.0.1.154)  
**GitHub Pages PWA:** v1.0.0.8 (previous v1.0.0.7)

## செய்யப்பட்டது

1. **Splash Screen:** முன்பு பயன்படுத்தப்பட்ட முழு Splash Screenshot (`splash-approved.webp` மற்றும் GAS-இன் inline WebP) இரண்டும் UI-இலிருந்து நீக்கப்பட்டன. தலைப்பு, subtitle, gold divider, green gradient background, loading bar, developer name மற்றும் version ஆகியவை தனித்தனி Responsive HTML/CSS கூறுகளாக வடிவமைக்கப்பட்டுள்ளன.
2. **Original Logo மட்டும்:** GAS `initialSettings.logoUrl`/`S.settings.logoUrl`-ஐப் பயன்படுத்துகிறது. PWA GAS-இன் அங்கீகரிக்கப்பட்ட `PPD_AUTH_READY` message-இல் கிடைக்கும் `logoUrl`-ஐப் பயன்படுத்துகிறது. மாற்று/கற்பனை Association Logo சேர்க்கப்படவில்லை. URL கிடைக்காத நேரத்தில் Loading Indicator மட்டும் இருக்கும்.
3. **Full-screen iPhone safe area:** PWA Splash, iframe shell-க்கு வெளியே full viewport overlay ஆக உள்ளது. Loading அனிமேஷன் உண்மையான server progress percentage என்று பொய்யாகக் காட்டுவதில்லை; load முடியும் வரை indeterminate animation, பின்னர் fade-out.
4. **Partners:** Playing Partners / Add Playing Partner என்ற இரண்டு Tabs. முதல் Tab-இல் Name (52px round avatar+full name), NIC, Contact Number, GN Division, Status, Action என்ற ஆறு தனி Columns ஒரே நேர்கோட்டில் vertical-center alignment-உடன் உள்ளன. Mobile swipe உள்ளது; scrollbar தெரியாது. Existing Admin approval requests & private photo permissions retained.
5. **Partner Form:** Preferred Name நீக்கப்பட்டுள்ளது; Full Name மட்டும். பழைய database `name` புலத்துடன் backward compatibility பாதுகாக்கப்பட்டுள்ளது. Native date picker, Take Photo/Upload Photo மற்றும் accessible round consent selector.
6. **Universal scrollbars:** Existing invisible scrollbars விதி பாதுகாக்கப்பட்டு, பிழையாகத் தெரியக்கூடிய `scrollbar-width:thin` விதிகள் சரிசெய்யப்பட்டுள்ளன. Actual wheel/touch scrolling தொடரும்.
7. **Encoding audit:** நான்கு தற்போதைய GAS source files-இல் வழக்கமான mojibake literal patterns கண்டறியப்படவில்லை. ஏற்கனவே Google Sheets-இல் சேமித்துள்ள பழைய Text/Live Dropdown Runtime Encoding திருத்தப்பட்டுள்ளது என உத்தரவாதம் அளிக்க முடியாது; தனி data-level ஆய்வு தேவை.

## பாதுகாக்கப்பட்டவை

Existing Booking/Payment/Tuya/Notification/Push workflows, Server Session Validation, User Access Rules, Database Sheets மற்றும் GitHub Session Bridge ஆகியவற்றில் தொடர்பற்ற மாற்றங்கள் செய்யப்படவில்லை.

## Deploy

1. Live GAS மற்றும் GitHub Repository-க்கு Backup எடுக்கவும்.
2. **அதே** GAS Project-இல் புதிய ZIP-இன் திருத்தப்பட்ட `Code.gs`, `index.html`, `UIJs.html`, `Style.html` Files-ஐ வைத்துப் புதிய Deployment Version உருவாக்கவும். பழைய Script Properties, Google Sheets Database, Deploy ID மாற்ற வேண்டாம்.
3. GitHub Repository-இல் `index.html`, `styles.css`, `app.js`, `sw.js` Files-ஐ v1.0.0.8 ZIP-இலிருந்து Update செய்யவும். பழைய `splash-approved.webp` தேவையில்லை; புதிய Code அதைக் கேட்காது. Existing manifest, original PWA icons மற்றும் push workflow files பாதுகாக்கப்பட வேண்டும்.
4. **System Settings-இல் Original Logo URL** browser-இல் உண்மையாகத் திறக்கக்கூடியதாக இருக்க வேண்டும். இது தனிப் Logo File-ஐ ZIP-இல் நகலெடுக்கவில்லை. private/inaccessible URL என்றால் PWA-இல் Logo தெரியாமல் போகலாம்.
5. iPhone PWA-இல் first open, remembered login, splash fade, background refresh, Partners tab, avatar, horizontal swipe, Edit/Delete request ஆகியவற்றை சோதிக்கவும். Android/Desktop/Direct GAS-இலும் சோதிக்கவும்.

## சோதனைகள் மற்றும் வரம்புகள்

- `UIJs.html`, GitHub `app.js` மற்றும் `sw.js` JavaScript syntax check passed.
- Duplicate HTML IDs இல்லை; PWA splash தனியான Body-level overlay; GitHub startup/dialogs சரியான containment.
- Playwright UI simulations: 320px, 390px, 430px Splash responsive; horizontally overflow இல்லை. Partners Table 390px swipe and 900px columns; tab switch success.
- **Live Google Sheets, Google Drive photo, iPhone session, browser logo permission மற்றும் production deployment சோதனை செய்யப்படவில்லை.** ZIP Test Deployment-இல் முதலில் verify செய்ய வேண்டும்.
