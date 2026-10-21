# GitHub Pages PWA v1.0.0.186

Date: 2026-10-22

## Changes

- PWA wrapper version, asset query versions and Service Worker cache key bumped to `1.0.0.186`.
- Added a trusted GAS-to-PWA `PPD_OPEN_NOTIFICATIONS` message so the application Settings page can open the existing device notification permission / registration dialog.
- Added runtime PWA information reporting to the Apps Script frame: PWA version/build, online status, Service Worker status, standalone-install status, update availability and last successful Service Worker controller change.
- Preserved the existing notification setup dialog, Web Push registration flow, safe-area behavior, and session-token boundary. No session token is added to the PWA info message.

## Validation

- `app.js` JavaScript syntax check passed.
- The PWA version and cache references were checked for stale `1.0.0.185` strings.
- Browser-level push delivery and GitHub Pages publication require live deployment and were not verified from this ZIP.
