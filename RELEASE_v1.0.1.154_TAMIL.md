# Point Pedro Indoor Court – GAS v1.0.1.154 / GitHub PWA v1.0.0.7

## Base
- GAS: v1.0.1.153 (latest uploaded source from previous turn)
- GitHub Pages PWA: v1.0.0.6 (latest uploaded wrapper source)
- Live deployment was **not** performed.

## Source Changes
1. The **first user-approved Splash Screen artwork** is reused from the uploaded `Point Pedro Sports Association Splash Screen(1).png`. It was converted to WebP without redesign. GAS and PWA have the same artwork. Only the bottom credits are dynamically overlaid: **App Developed by** and **Version**. The artwork/credits scale as one canvas across screens. The image contains all other titles and decorative elements as approved.
2. Startup checks run behind the splash. On a successfully initialized public/authenticated page it fades away. Errors retain a safe retry. PWA and GAS do not expose unverified private session data during restore. Cached current-page refresh now keeps the page visible instead of showing the blocking route overlay.
3. Mobile header uses a solid green background with less shadow, with responsive title text (not a fixed pixel size). Exact iOS status-bar visuals may remain OS-dependent.
4. Staff mobile navigation **More** button is omitted. To retain access to remaining staff pages, tap **Developer** in the mobile footer to open the original More Sheet. Player navigation remains unchanged.
5. Mobile footer: Developer | Visitors | Version. Real visit count and configured developer/version are used.
6. Golden Bell Notification panel is constrained beneath the measured header and above the footer on mobile. The red critical-system panel uses the same viewport bounds. The underlying Red Bell retains its separate critical-alert data model.
7. Individual Mark-as-Read check button now invokes `markNotificationRead` independently. Clicking the rest of the card continues opening the destination. Golden Bell loading shows a loading state instead of premature 'No notifications'.
8. Booking-related in-app notifications can enrich Player/Court/Start/End/Duration from saved booking details. Missed-completion notifications retain their special staff message.
9. Web Push booking messages are compact. **Player**: Court, start-end, `(1H)/(2.5H)` and event message; no personal name. **Admin/Staff**: same plus player name; no booking number and no `Action:` label. Push remains tied to the existing GAS event queue / GitHub workflow, preserving push opt-in and recipients.
10. Player Booking `Book On Behalf Of` display is explicitly hidden for nonstaff routes; existing server-side owner restriction retained.
11. Player Search, User List and Payment-Account lists sort alphabetically by name without reordering Sheets. Timetable start times retain time order.
12. UTF-8 text-safety sweep performed on authored sources. No bulk modification of existing Sheet content was attempted. For corrupted historical Sheet values, a separate audited data-repair procedure would be required.
13. GitHub PWA service worker cache namespace updated to v1.0.0.7; the same approved splash image is a required cache asset. Existing authenticated iframe bridge and push logic retained.

## Files Changed
- GAS: `Code.gs`, `index.html`, `Style.html`, `UIJs.html`; all other baseline items preserved.
- PWA: `index.html`, `styles.css`, `app.js`, `sw.js`, new `splash-approved.webp`.

## Tested
- Server/Client JavaScript parser validation with Node.js.
- 22 source/mocked regression checks passed: compact push content (player and staff), no booking number or `Action`, staff-only booking delegation, notification read controls, alphabetical names, PWA version, splash image integration and unchanged session bridge.
- ZIP CRC read tests and required files check.

## Not Yet Verified / Important Limitations
- Real iPhone PWA opening, protected iOS safe area, fingerprint/Face ID, actual Google Sheets data, browser cache across production deploy, real push receipt and notification tap destination MUST be tested in the live environment.
- iPhone's third-party iframe storage policy remains browser-controlled; the previously implemented remembered-session bridge is retained but cannot be guaranteed across every iOS configuration.
- Critical Red Bell lists runtime error conditions, not per-user persisted notification records. It shares geometry, **not** individual Mark All Read/Clear semantics; inventing those actions would be misleading.
- Some list contexts with specialized priority/date/time semantics retain their original order; only name-based general User/Player/Payment dropdowns were sorted.
- It is not safe to auto-fix unknown already corrupted historical data fields without an approved repair mapping and backup.
- App startup still requires a server session validation. The artwork masks this process, but cannot eliminate actual network latency.

## Deployment: Recommended Sequence
1. Take backup of the existing Apps Script project and GitHub PWA repo. Save/verify Script Properties without sharing any secret values.
2. On **the same Apps Script project**, replace the four edited files and deploy via Manage Deployments → Edit → New Version. New Apps Script project = new properties; avoid that unless migrating settings.
3. In GitHub repo, update the four web files and add `splash-approved.webp` beside `index.html`. Do not overwrite `manifest.webmanifest`, icons, existing workflow or private secrets.
4. Install/refresh app shell safely. Confirm new JS/CSS/service worker cache version and direct GAS `/exec` URL.
5. Test public and authenticated iPhone/Android flow; ensure valid session reopens, disable/enable biometric, review Player booking page, test staff More via Developer footer, Golden/Red panels, single read mark, real Push delivery for both player/admin, route navigation and icon layout.
6. Run production only after staging QA passes. Do NOT run live cancellation, booking or payment actions without a safe test account.

## Source Governance
- Root-level edits only, no duplicated/overridden functions.
- Other booking and financial business rules deliberately preserved.
