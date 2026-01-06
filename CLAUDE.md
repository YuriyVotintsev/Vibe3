# Claude Code Instructions for Vibe3

## IMPORTANT: Version Updates

**Before each commit, update version in ALL these places:**
1. `index.html` — comment, HTML div, and `?v=XXX` in all imports
2. `js/config.js` — `BUILD_VERSION`
3. `js/MainScene.js` — `?v=XXX` in imports
4. `js/SettingsScene.js` — `?v=XXX` in imports

Use short version like `009` for query params (no dots).

## Code Style Preferences

- Split files when they exceed 400-500 lines
- Prefer ES modules with clear imports/exports
- Keep related functionality grouped in medium-sized files (not too granular, not monolithic)

## Project Structure

- `/js/` - ES modules (config, scenes, utils)
- `/index.html` - Entry point with minimal code
- Phaser 3 game framework
