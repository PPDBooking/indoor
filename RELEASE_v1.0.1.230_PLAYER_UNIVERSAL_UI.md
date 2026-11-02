# PPD GitHub PWA v1.0.1.230 — Player/Universal UI support
Includes and supersedes the combined v225–v229 PWA changes without changing main.

## Changes in PWA wrapper
- Save the authenticated user's LIGHT/DARK/AUTO preference to the GitHub PWA origin's local storage, independently of the Apps Script iframe's storage.
- Reply to authenticated user-specific preference read requests without exposing another user's preference.
- Use dark grey for the native status bar in Dark Mode, light header colour in Light Mode (from prior v228).
- Theme PWA-owned notification/install dialogs and floating bell according to the currently resolved mode.
- Bump JS/CSS/Service Worker versions to v1.0.1.230.

## Coordinated Apps Script release
Apply Apps Script v1.0.1.263 changed files alongside this PWA package. This contains universal date picker, sidebar divider and Player Portal changes. No data/permission/payment back-end behaviour is altered.

## Update without a branch merge
Download this branch ZIP from GitHub, extract and upload the required PWA source files to the existing GitHub Pages main repository. Do not upload the ZIP itself. Main has NOT been changed by this release branch. Verify Light/Dark/Auto persistence and install/notification flows on actual devices before production rollout.
