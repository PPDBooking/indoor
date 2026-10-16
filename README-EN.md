# Point Pedro Indoor Court — GitHub Pages PWA wrapper

## Included

Static, repository-root-ready Pages site: iframe pointing at the exact supplied Google Apps Script Web App, installable PWA manifest/icons, service worker registering on the GitHub Pages origin, an explicit user-gesture notification permission button, and a separate **local notification test**. The service worker caches **only GitHub-hosted shell assets**; booking data remains online in Apps Script / Sheets. No changes to existing backend or spreadsheet.

## Install

1. Extract ZIP. Upload *contents* to a test repository at root (index.html must be at root).
2. Settings → Pages → Deploy from a branch → `main`, `/(root)`.
3. Open `https://USERNAME.github.io/REPOSITORY/` over HTTPS. Click **Push** in header.
4. On iPhone iOS 16.4+, open in Safari, install Add to Home Screen, open installed icon and then request permission. Android uses a compatible browser.
5. Local test is NOT a real booking alert.

## Critical boundaries

- Apps Script may block iframing with CSP/X-Frame-Options. The `Open directly` header icon offers a fallback; a static GitHub site cannot override Google headers. `ALLOWALL` on GAS is sometimes necessary but not always sufficient; it also carries clickjacking risks.
- Real background Web Push requires authenticated player-to-device subscriptions and a backend sender. This zip does not register with FCM or send real push. Even if permission is granted, **background booking push is not connected**.
- `sw.js` has future standard Web Push `push` and `notificationclick` handlers, but without a PushManager subscription registered to a trusted sender no push event will arrive. The notification click handler opens the PWA shell; booking-specific internal navigation needs a future validated GAS bridge.
- Do not upload secrets/private keys to a public GitHub repository.
- GitHub Pages restrictions include prohibitions on using it as free hosting for commercial transactions and guidance against sensitive transactions. Assess this before production usage.
- Replace the provided **temporary placeholder app icons** with the original association logo, which was not available in this session.
- This package **does not change** Google Apps Script or Google Sheets.

Useful official docs:
- https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- https://developers.google.com/apps-script/reference/html/x-frame-options-mode
- https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers
