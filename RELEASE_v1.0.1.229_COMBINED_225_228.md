# Point Pedro Indoor Court — Combined PWA Release v1.0.1.229

## Purpose
Downloadable standalone GitHub PWA source incorporating the changes prepared in branches v1.0.1.225, v1.0.1.226, v1.0.1.227, and v1.0.1.228, without asking the user to merge branches.

## Included changes
- **225**: Staff/Player Settings → Install App bridge and native/manual installation guidance. Where the old 225 message handler duplicates the safer 227/228 top-level install handler, the later native handler is retained and the manual guide is used as fallback.
- **226**: Staff theme-state messaging and dynamic OS/status-bar backing.
- **227**: Persisted bottom navigation spacing and iOS status-bar backdrop CSS.
- **228**: Light Status Bar matches light header; Dark Status Bar uses dark grey; Player theme state is accepted.
- **229 combined package**: Cache key, JS/CSS URL versions, and build number updated so the combined changes load together.

## Files to replace when updating an existing main deployment
- `app.js`
- `index.html`
- `sw.js`

`styles.css` carries the v227 theme backdrop rule and is included in the full repository ZIP. If your currently deployed main already includes v227, this file is unchanged.

## Install without merging Git branches
1. Download this branch as ZIP via GitHub's Code → Download ZIP, and extract it.
2. Replace the three listed files in the GitHub Pages repository with the versions from this package.
3. Preserve all other assets and configuration, then commit/publish the file changes as usual.
4. Refresh/reopen the PWA and verify install prompts, light/dark mode, iOS and Android status-bar backgrounds, and navigation spacing.

## Safety / deployment notes
- Existing `main` was not changed by preparing this release branch.
- Do not directly upload the archive ZIP as one repository file: extract the needed source files.
- Browser/PWA live validation has not been completed. Test on mobile before production deployment.
- This package contains the GitHub PWA source only; the Apps Script package is separate.
