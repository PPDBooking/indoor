# GitHub Pages PWA — Release v1.0.1.225
- Based on the current v1.0.1.224 PWA shell; this branch is not merged or deployed.
- Added a trusted Apps Script-to-PWA install bridge so the single Install App action in Player/Staff Settings can open the browser's native install prompt when available.
- Added device-specific fallback instructions when a browser does not offer a direct prompt.
- iPhone/iPad installation uses the required Safari Share → Add to Home Screen flow; the website does not attempt to bypass Apple's confirmation.
- Preserved the existing PWA notification dialog, service-worker safety rules, offline shell and authentication bridge.
- Bumped the service-worker cache key and asset query versions to v1.0.1.225.
