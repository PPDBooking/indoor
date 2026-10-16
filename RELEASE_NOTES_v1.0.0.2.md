# Point Pedro GitHub PWA v1.0.0.2

Based exclusively on user-uploaded `indoor-main.zip`. This ZIP contains root-level files (not an extra enclosing folder). No Firebase / Netlify.

- Removes the duplicate GitHub branding toolbar, Install, Push, and direct-script shortcuts from the main UI. Keeps one small onboarding bell launcher until device registration and backend sender setup finish; it can be reopened with `?notifications=1`.
- Keeps the Apps Script iframe, original uploaded association PWA icons, fixed viewport and offline notice.
- Uses browser PushManager subscription, publicly configured VAPID key, GitHub Service Worker Push/Click event handlers, and an authenticated cross-frame link to the Apps Script session.
- Adds a real-background-push request button; in addition, Local Notification remains to test browser permission.
- New GitHub Actions job (`repository_dispatch`), sends via standard Web Push / VAPID and posts authenticated delivery acceptance reports to Apps Script.
- Requires secrets before live operation; no secrets or private data are in the public ZIP.

**Not live-deployed or end-to-end tested.** GH Actions may take time to start; delivered-to-Push-Service is not proof of handset display.
