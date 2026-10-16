# Point Pedro Indoor Court — GitHub Pages PWA Wrapper v1.0.0.1

## இந்த ZIP என்ன செய்கிறது?

- நீங்கள் கொடுத்த Google Apps Script Web App URL-ஐ `iframe`-ல் திறக்கும்.
- GitHub Pages-ல் PWA-ஆக நிறுவக்கூடிய `manifest.webmanifest`, `sw.js`, 192/512/180 PNG icons உள்ளன.
- மேலே **Push** Button → **Enable notifications** மூலம் Browser Notification Permission கேட்கப்படும்.
- Permission அனுமதித்த பிறகு **Show a local test notification** மூலம் அந்த சாதனத்திலேயே Test செய்யலாம்.
- **இது உண்மையான Booking Push Notification அல்ல.** Backend Push Sender + Authenticated Device Linking இல்லாமல் Background Booking Notification வராது.
- Apps Script, Google Spreadsheet, Golden Bell, Login, Booking Logic எதுவும் இந்த ZIP-ஆல் மாற்றப்படவில்லை.

## GitHub Pages-ல் Upload செய்வது

1. ZIP extract செய்யுங்கள். `index.html` போன்ற files Repository root-ல் இருக்க வேண்டும். ZIP-ஐ அப்படியே ஒரு file-ஆக upload செய்ய வேண்டாம்.
2. GitHub-ல் ஒரு புதிய test repository உருவாக்கி files upload செய்யுங்கள்.
3. Repository → **Settings → Pages** → Source: `Deploy from a branch` → Branch: `main` → Folder: `/(root)` → Save.
4. சில நிமிடங்களில் `https://USERNAME.github.io/REPOSITORY/` என்ற HTTPS URL கிடைக்கும்.
5. Mobile browser-ல் திறந்து **Push → Enable notifications**. Android-ல் install செய்யலாம். iPhone-ல் Safari → Share → Add to Home Screen → Installed app-ல் Push Button.
6. Permission கிடைத்ததும் **Local test notification** வேலை செய்கிறதா பார்க்கவும்.

## GitHub Pages/Google Apps Script முக்கியக் கவனிக்க வேண்டியவை

- Google Apps Script Web App iframe-ல் இயங்க `HtmlService.XFrameOptionsMode.ALLOWALL` தேவையாக இருக்கலாம்; Google-ன் பாதுகாப்பு headers காரணமாக சில deployments embed ஆகாது. Code-ஐ மாற்றாமல் இதை இந்த wrapper-ஆல் சரி செய்ய முடியாது.
- Wrapper-ன் மேலே உள்ள Open Direct icon மூலமாக Apps Script-ஐ நேரடியாகத் திறக்கலாம்.
- Browser permission-ஐ iframe-க்குள் அல்ல, GitHub Parent Page-ல் கேட்கிறோம்.
- GitHub Pages **static hosting only**. Login/Payments/Commercial Booking System-க்கு GitHub Pages usage rules சரிபார்த்த பிறகே production பயன்படுத்தவும். இதை ஆரம்பத்தில் TEST என்று கருதவும்.
- Google Apps Script iframe-ல் இருக்கும் Data **offline-ல் வேலை செய்யாது**; Service Worker GitHub static files-ஐ மட்டும் cache செய்யும்.
- GitHub-ல் public repository என்றால் Code அனைவருக்கும் தெரியும்: Password, Private Key, Service Account JSON, API Secret, User Details ஆகியவற்றை upload செய்யக்கூடாது.
- GitHub Pages URL/Repository மாற்றினால் App புதிய Origin ஆகும்; PWA மற்றும் Push Subscription-ஐ மீண்டும் Install/Enable செய்ய வேண்டியிருக்கலாம்.
- 3rd-party cookies, browser privacy settings, authentication மற்றும் Google iframe restrictions காரணமாக Sessions வேறுபடலாம்.

## உண்மையான Push-க்குத் தேவையான அடுத்த Phase (இந்த ZIP-ல் இல்லை)

1. Google Apps Script Booking Events-ல் Notification Dispatcher சேர்க்க வேண்டும்.
2. Firebase Cloud Messaging அல்லது Standards-based Web Push Provider + authenticated server sender அமைக்க வேண்டும்.
3. Notification Permission மட்டும் போதாது: `PushManager.subscribe`/FCM token registration + secure Player/Device Binding + signed requests + unsubscribe/logout cleanup தேவை.
4. Device Subscription/Token மற்றும் Delivery Logs-ஐ Spreadsheet-ல் பாதுகாப்பாகக் கையாள வேண்டும்.
5. Service Worker-க்கு Message Delivery, iPhone/Android tests மற்றும் Booking deep-link bridge சேர்க்க வேண்டும்.
6. உண்மையான User Identity-ஐ GitHub Parent Page மட்டும் நம்ப முடியாது. Apps Script Authentication-உடன் பாதுகாப்பான token exchange அவசியம்.
7. iPhone PWA Web Push iOS 16.4+ மற்றும் Home Screen installation தேவை. Real-device testing அவசியம்.

## எந்த files?

- `index.html`: responsive iframe + controls
- `styles.css`: no outer scrollbars, safe-area responsive layout
- `app.js`: Service Worker registration, install prompt, notification permission, local test
- `sw.js`: GitHub shell cache, future standard push receive/click handler; **no sender**
- `manifest.webmanifest`: PWA install settings
- `icons/`: temporary court-themed icons — ORIGINAL association PNG supplied இல்லை; வேண்டுமானால் உங்கள் Logo-வால் மாற்றவும்
- `.nojekyll`: GitHub Pages static files unchanged

**Version:** wrapper 1.0.0.1; original Apps Script version unchanged.
