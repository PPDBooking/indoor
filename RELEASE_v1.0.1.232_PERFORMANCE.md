# PPD GitHub Pages PWA v1.0.1.232 — Startup and Shell Performance

## Changes
- The navigation document uses stale-while-revalidate: cached HTML displays immediately while a fresh copy is checked in the background.
- Versioned CSS/JS and approved local images use cache-first, avoiding repeat network requests competing with the Apps Script iframe. The push public-key config remains network-first so configuration changes are picked up.
- Cache keys are canonicalized by same-origin path, so route/query parameters do not create duplicate shell cache entries.
- The worker still caches only the explicit GitHub Pages shell allow-list. Apps Script iframe pages, booking availability, authentication, payments, door codes and other API responses are never cached by the PWA worker.
- Service worker registration starts independently from the optional push-config fetch.
- Mobile splash background reduced from 1,087,634 bytes to 106,464 bytes (about 90% smaller). Splash-only logo reduced from 412,310 bytes to 88,048 bytes (about 79% smaller); the original PNG app/manifest icon is retained unchanged. Together these two high-priority splash assets are about 87% smaller.
- PWA build number updated to 232.

## Compatibility
- No booking, login, session, permission, finance, notification or door-code behavior changed in the PWA wrapper.
- Coordinate with Apps Script v1.0.2.282 for the backend/UI performance changes.
