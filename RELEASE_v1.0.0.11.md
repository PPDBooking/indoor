# GitHub Pages PWA Wrapper — v1.0.0.11

Baseline: v1.0.0.10.

- Email links can open the GitHub Pages URL with `login`, `username`, `target`, and `request` parameters; the wrapper forwards only those approved route parameters to the Apps Script iframe.
- Removed the visible “Open direct GAS” fallback link so the startup screen does not expose the backend deployment URL. Retry remains available.
- Splash logo fades from blurred/dim to sharp/bright after the image finishes loading.
- Bumped stylesheet, script and service-worker cache version to v1.0.0.11.
- No live GitHub Pages deployment was performed.
