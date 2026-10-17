# Point Pedro Indoor Court — Mobile Correction Release

- **GAS:** v1.0.1.157 (previous v1.0.1.156)
- **GitHub Pages PWA:** v1.0.0.10 (previous v1.0.0.9)
- **Scope:** User-confirmed mobile layout / splash corrections only. No booking, finance, Tuya, notification, or database logic changes.

## மாற்றங்கள்

1. **Splash Logo**: Divisional Indoor / Court Reservation System text-க்கும் animated loading bar-க்கும் நடுவிலுள்ள தனி responsive slot-இல் சீராக மையப்படுத்தப்பட்டுள்ளது. Logo அந்த slot-இன் 90% வரை (aspect ratio மாறாமல்) பொருந்தும். Original logo URL அப்படியே; புதிய logo இல்லை.
2. **Long press**: Splash logo மற்றும் GAS header logo-வை iPhone-இல் hold செய்தால் image share/save pop-up வருவதைத் தடுக்க `-webkit-touch-callout`, `draggable=false` மற்றும் `contextmenu` prevention சேர்க்கப்பட்டுள்ளது. மற்ற படங்களுக்கான browser behavior மாற்றப்படவில்லை.
3. **iOS status bar**: PWA Standalone outer background green மற்றும் existing `black-translucent` Apple status bar meta உடன் இணைக்கப்பட்டுள்ளது. Direct GAS metadata-வும் மாற்றப்பட்டுள்ளது. சில iOS/browser சூழல்களில் status bar தோற்றத்தை OS கட்டுப்படுத்தலாம்.
4. **Player Footer**: கீழே வீணாகத் தெரியும் space குறைக்கப்பட்டு safe-area கருத்தில் கொள்ளப்பட்டுள்ளது; Developer / Visitors / Version தொடரும்.
5. **Staff/Admin Mobile**: Player Portal-க்கு ஒத்த **fixed six equal bottom navigation slots + compact three-part footer** அமைப்பு. முதல் 6 authorized menu links நேரடியாகக் காட்டப்படும்; மீதமுள்ள authorized pages பழைய Footer Developer link வழி திறக்கும் **More navigation sheet**-இல் கிடைக்கும். Staff navigation-க்கான தேவையற்ற horizontal scrolling நீக்கப்பட்டுள்ளது. Desktop/sidebar வடிவமைப்பு மாற்றப்படவில்லை.
6. **GitHub wrapper**: பழைய standalone bottom-padding extra band நீக்கப்பட்டது; top safe-area green remains, iframe responsive. Desktop outer-side light-gray theme தொடரும்.

## சரிபார்த்த சோதனைகள்

- JavaScript Syntax: GAS UIJS / GitHub app.js / sw.js PASS.
- Static integrity: logo selectors, role-specific nav classes, More menu access, versioned CSS/JS, service worker cache PASS (15 checks).
- Chromium mock rendering: splash 320×700, 390×844, 900×800 PASS (no horizontal document overflow).
- Chromium mock rendering: Player and Staff mobile bottom navigation 390×844 PASS (six visible slots each; no navigation horizontal overflow).

**Live iPhone, Safari status bar, Google Apps Script Session, Tuya, Google Sheets ஆகியவற்றில் இன்னும் end-to-end சோதிக்கப்படவில்லை.**

## Deploy வழிமுறை

1. தற்போதைய GAS Project மற்றும் GitHub Repository Backup எடுக்கவும்.
2. இதே Apps Script Project-இல் GAS v1.0.1.157 உள்ள `Code.gs`, `index.html`, `Style.html`, `UIJs.html` ஆகிய files update செய்து **Manage Deployments → Edit → New Version** செய்யவும்.
3. GitHub Pages-இல் PWA v1.0.0.10 உள்ள `index.html`, `styles.css`, `app.js`, `sw.js` மாற்றவும். பழைய manifest/icons/push settings பாதுகாக்கவும்.
4. iPhone Home Screen App-ஐ முழுவதும் close/reopen செய்து புதிய Service Worker load ஆகும் என்பதைச் சரிபார்க்கவும். Pending Booking இருந்தால் cache clear செய்ய வேண்டாம்.
5. Player மற்றும் Admin இரு Accounts-இலும் 6 icons, Developer-footer More menu, logo long press, splash logo alignment, safe area, logout/reopen ஆகியவற்றைச் சோதிக்கவும்.
6. Google Apps Script Direct URL மற்றும் GitHub PWA இரண்டையும் தனியாகச் சோதிக்கவும்.

## வரம்புகள்

- Browser OS-level Share menu-ஐ எல்லா சூழல்களிலும் முழுவதும் கட்டுப்படுத்த முடியாது; DOM logo long-press events தடுக்கப்பட்டுள்ளன.
- iPhone status bar நிறம் iOS install/display mode மற்றும் browser settings-க்கு உட்பட்டது. Green background பக்கத்தில் அமைக்கப்பட்டாலும் OS status-area தோற்றம் மாறக்கூடும்.
- Live Deploy செய்யப்படவில்லை.
