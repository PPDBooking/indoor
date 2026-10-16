# Point Pedro — GitHub Pages + Apps Script + Google Sheets Web Push

## Release
GitHub PWA Wrapper **v1.0.0.2**; Apps Script **v1.0.0.26** based only on uploaded **v1.0.0.25**. No Firebase, Netlify, or additional database. The existing Apps Script URL stays the same when you update its existing deployment.

**Do not publish secrets in the public GitHub repository, JavaScript, README, screenshots or Google Sheets.**

## வரிசைப்படி அமைப்பது

1. Apps Script v1.0.0.26 ZIP-இல் இருக்கும் `Code.gs`, `UIJs.html`, `index.html`, `Style.html`, `appsscript.json` மற்றும் இருக்கும் Root Files-ஐ உங்கள் Apps Script Project-ல் Update செய்யவும். Existing Deployment → **Edit** → **New version** → **Deploy**. புதிய Deployment URL வேண்டாம்; ஏற்கனவே இருக்கும் `/exec` URL தொடரட்டும். Deploy செய்வதற்கு முன் காப்புப் பிரதியை வைத்துக்கொள்ளவும்.
2. உங்கள் **தனிப்பட்ட Computer**-ல் Node.js வைத்து `npx --yes --package web-push@3.6.7 web-push generate-vapid-keys --json` இயக்கவும். Public Key, Private Key இரண்டு தனி Values கிடைக்கும். **Private Key-யை எவருடனும் பகிரக்கூடாது.**
3. GitHub ZIP-ல் `push-config.json` திறந்து `vapidPublicKey` என்ற இடத்தில் **Public Key மட்டும்** வைக்கவும். இது Public தகவல். `index.html`, `app.js`, `sw.js`, `manifest.webmanifest`, `push-config.json`, `icons` மற்றும் `.github/workflows` / `.github/scripts` ஆகியவற்றை Repository Root-ல் Upload செய்து Commit செய்யவும். **ZIP-ஐ அப்படியே Upload செய்ய வேண்டாம்.**
4. GitHub Repository → **Settings → Secrets and variables → Actions → New repository secret** மூலமாக பின்வரும் Secrets சேர்க்கவும்:
   - `GAS_WEBAPP_URL` = ஏற்கனவே உள்ள Apps Script `/exec` HTTPS URL.
   - `GAS_WORKER_SECRET` = உங்கள் Computer-ல் உருவாக்கிய குறைந்தது 32 character சீரற்ற, தனிப்பட்ட Secret.
   - `VAPID_PUBLIC_KEY` = Step 2-ல் பெற்ற Public Key.
   - `VAPID_PRIVATE_KEY` = Step 2-ல் பெற்ற **Private Key**.
   - `VAPID_SUBJECT` = `mailto:your-real-admin-email@example.com` (உங்கள் சொந்த உண்மையான Email).
5. GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens**: `ppddssa2017-droid/ppdindoor` ஒரே Repository மட்டும், **Contents: Read and write** permission உடைய குறைந்தபட்ச காலாவதியுடனான Token உருவாக்கவும். GitHub `repository_dispatch` Event Trigger செய்ய இதுவே பயன்படும். Token GitHub Files-ல் எழுதக்கூடாது.
6. Google Apps Script → **Project Settings → Script Properties**-ல் கீழே உள்ள Values பாதுகாப்பாக உள்ளிடவும்:
   - `WEB_PUSH_GITHUB_TOKEN` = Step 5 GitHub fine-grained Token.
   - `WEB_PUSH_WORKER_SECRET` = Step 4 `GAS_WORKER_SECRET`-க்கு **அதே** Value.
   - `WEB_PUSH_WEBAPP_URL` = Step 4 `GAS_WEBAPP_URL`-க்கு **அதே** Apps Script URL.
   - `WEB_PUSH_ENABLED` = தொடக்கத்தில் `false`. மேலுள்ள எல்லா அமைப்புகளும் சரியான பிறகு `true`.
7. GitHub Pages PWA திறந்து Login செய்யுங்கள். மேலுள்ள தனியான GitHub Toolbar இல்லை. சிறிய Bell Setup button மட்டும் இன்னும் Device Register செய்யப்படாத போது தோன்றும். **Enable notifications → Allow → Register this device**. iPhone-ல் Safari **Add to Home Screen** (iOS 16.4+) செய்து App-ல் இருந்து Permission தர வேண்டும்.
8. Permission → Device Linked / Sender Enabled ஆகியவற்றைச் சரிபார்த்து **Send REAL push test via GitHub Actions** அழுத்தவும். GitHub → **Actions → Point Pedro Web Push**-ல் Workflow Status பார்க்கவும். Local Test Notification உண்மையான Background Push Test அல்ல.
9. App மூடி/Lock செய்து Real Push மூலம் Android மற்றும் iPhone-ல் Delivery சோதிக்கவும்; முதலில் Admin Device மற்றும் ஒரு Test Player Device மட்டும் Register செய்துப் பார்க்கவும்.

## அன்றாட செயல்பாடு

- New Booking — Auto Approval OFF: Admin + Player.
- Auto Approved: Admin + Player. Manual Approved: Player மட்டும்.
- Booking Cancelled: Admin + Player. Declined: Player மட்டும்.
- Extended: Admin + Player. New Player Registration: Admin.
- Red Bell Automation Failure: Developer + Super Admin (Scheduled Health Check இயங்கினால் மட்டும்).
- Waitlist: Player தேர்ந்தெடுக்கும் `Auto-book if at least` மற்றும் `Ask me first if at least` நேரங்களே பயன்படுத்தப்படும். Offer, Expiry Push; Auto-conversion தனி இரட்டை Push ஆகாது — உருவான Booking-ன் Push-ஐ பயன்படுத்தும்.

**Important:** Current Golden Bell, Red Bell, Email Notifications, Login, Booking Data அனைத்தும் அப்படியே. GitHub Actions உடனடி Server அல்ல; Notification தாமதம் வரலாம். Phone offline / Focus / Notification Settings காரணமாக Delivery தாமதமாகலாம். User Logout செய்தால் அந்த Session-க்கு இணைக்கப்பட்ட Devices Disable ஆகும்; மீண்டும் Login செய்தால் மீண்டும் Register செய்யப்படும்.

## பாதுகாப்பு

- Public GitHub source-ல் VAPID Public Key மட்டும். Private Key மற்றும் Worker Secrets GitHub Actions Secrets / Apps Script Script Properties-ல் மட்டும்.
- Registered Push Devices Google Sheets-ல் சேமிக்கப்படும்; இது Subscription Secrets கொண்டது. Sheet-ஐ public sharing செய்யக்கூடாது.
- GitHub Actions worker, Google Apps Script `doPost`-க்கு authenticated POST செய்து Job-ஐ எடுக்கும். GitHub Dispatch-ல் User Data அனுப்பப்படாது.
- Github Pages has terms limiting commercial/sensitive-transaction hosting. Confirm production-use eligibility before relying on it.
- Existing GAS web app executes as deployer for anonymous requests; protect its deployed URL and worker secret. You MUST NOT share the worker secret or make the Sheet public.
- Installed PWA-வில் Setup Button மறைந்த பின்பு Settings மீண்டும் திறக்க URL-க்கு `?notifications=1` சேர்க்கலாம்.

## பழுதுநீக்கல்

| Screen | பொருள் / நடவடிக்கை |
|---|---|
| `Permission Allowed`, `Not connected` | Public VAPID Key அல்லது Login / Device Registration இன்னும் முடியவில்லை |
| `Device linked · sender not configured` | Apps Script Properties-ல் `WEB_PUSH_ENABLED=true` உட்பட அமைப்பை முடிக்கவும் |
| Real test Workflow ERROR | GitHub Actions Logs; Secrets, Fine-grained PAT Contents permission, Apps Script new Deployment ஆகியவற்றை சரிபார்க்கவும் |
| No Push but Workflow SUCCESS | Browser push service accepted, ஆனால் Lock Screen / Focus Settings / PWA Install நிலைகளைச் சரிபார்க்கவும் |
| iPhone-ல் Permission கேட்கவில்லை | Safari Home Screen Installed PWA-வில் தொடங்கி Button அழுத்தவும் |

**Software build cannot be live-tested without your private accounts, configured secrets, and deployed Apps Script/Pages.**
