# Point Pedro Indoor Court – GAS v1.0.1.156 / GitHub PWA v1.0.0.9

## Source baseline
- GAS: v1.0.1.155 ZIP, root-level source files only.
- PWA: v1.0.0.8 ZIP, existing wrapper files only.
- No existing backend data, live deployment, database, or Tuya settings were modified.

## GAS UI corrections
1. Desktop Sidebar: First **Total Visits** line and count retained. The **second Visitors label and count below the divider are hidden only on desktop**. Below divider: Developer (left) and Version (right).
2. Mobile Sidebar/Footer: The three-column Developer / Visitors / Version information remains. Nothing is removed from mobile visitor count.
3. Replaced the fragile Total Visits icon and Playing Partners action glyph with HTML numeric character entities; likewise booking player dropdown triangle.
4. My Playing Partners: mobile (<=700px) uses one vertical card per person with large round avatar, name, NIC, phone, GN division, status and three-dot action; desktop continues its six-column row-aligned table.
5. Mobile scrolling works normally without displaying horizontal scrollbar; no forced whole-page horizontal overflow in preview.
6. My Playing Partners tabs now use original universal Audit & Security-style rounded white container, green active button, bordered inactive buttons.
7. Exactly 16px space between **Playing Partners Directory** and **My Edit / Delete Requests**.
8. Exactly 16px space between **Save Workflow** and **Default Booking Approval** (`#workflowRulesList`).
9. Original green/gold Splash is live HTML/CSS with dynamic title, real settings logo, animated loading, developer/version. Responsive association heading: two lines when wide, three lines on small mobile; logo space reduced; badminton decorations restored as SVG background art without substituting for the actual association logo.

## GitHub PWA corrections
1. Desktop outer area changed from green to light grey (`#f2f4f6`) to match direct GAS presentation. Original max-width centered app layout retained; standalone iPhone green safe area retains its existing separate media styling.
2. Splash two/three-line responsive heading, smaller logo area, desktop/mobile subtitle distinction, badminton shuttle and racket decorations, footer preserved. No screenshot baked into the page; heading, logo and loading bar remain independent HTML/CSS components.
3. PWA service worker cache bumped to `ppd-wrapper-shell-v1.0.0.9`; index references updated CSS/JS cache versions.

## Character encoding notes
- HTML declares UTF-8 and source has zero detectable pre-existing `\uFFFD` or standard mojibake byte-patterns in current JavaScript/HTML sources.
- The known visible glyphs were replaced with numeric HTML entities. **This does not auto-repair already-corrupted text in Sheets or guarantee all browser/device fonts**; report any remaining exact page and glyph for follow-up.

## Tested (non-production)
- GAS JavaScript and PWA `app.js`/`sw.js` parse without error.
- HTML IDs unique in both projects.
- Browser layouts at 320px, 390px, 900px: no splash horizontal page overflow; mobile shows stacked partner card and desktop keeps aligned table.
- Sidebar behavior: at desktop viewport second Visitors hidden and first line remains; at mobile second Visitors shows and first Total Visits line is hidden in compact nav.
- PWA Desktop outer area computed background color `rgb(242,244,246)`.
- Live GAS, actual player records, iPhone PWA safe area, Push, biometric, and production behavior **not tested**.

## Deploy safely
1. Backup your currently working GAS and GitHub Pages files and project-specific properties.
2. Deploy GAS first using the **same Apps Script Project**: replace changed root files `Code.gs`, `index.html`, `Style.html`, `UIJs.html`. Use Manage Deployments → Edit → New Version.
3. Next replace GitHub PWA `index.html`, `styles.css`, `app.js`, `sw.js`. Keep existing push manifest/icons/secrets untouched.
4. Validate Desktop Sidebar (2nd Visitors absent), mobile footer (Visitors still visible), Partners directory mobile/desktop, two gaps, tab styling, splash logo and desktop outer background.
5. Do not deploy to production before validating a test copy; never delete Script Properties or Sheets.
