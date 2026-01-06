# Claude Code Instructions for Vibe3

## IMPORTANT: Version Updates

**Before each commit, update version in TWO places:**
1. `index.html` — HTML div text AND `window.APP_VERSION`
2. `js/config.js` — `JS_VERSION`

Both should match. If user sees different versions, it means caching issue.

## Code Style Preferences

- Split files when they exceed 400-500 lines
- Prefer ES modules with clear imports/exports
- Keep related functionality grouped in medium-sized files (not too granular, not monolithic)

## Project Structure

- `/js/` - ES modules (config, scenes, utils)
- `/index.html` - Entry point with minimal code
- Phaser 3 game framework
