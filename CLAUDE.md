# Claude Code Instructions for Vibe3

## IMPORTANT: Version Updates

**Before each commit, update `window.APP_VERSION` in `index.html`!**
This is the ONLY place where version is defined. It automatically:
- Shows in HTML div
- Gets used for cache-busting all JS imports
- Shows on canvas via `window.APP_VERSION`

## Code Style Preferences

- Split files when they exceed 400-500 lines
- Prefer ES modules with clear imports/exports
- Keep related functionality grouped in medium-sized files (not too granular, not monolithic)

## Project Structure

- `/js/` - ES modules (config, scenes, utils)
- `/index.html` - Entry point with minimal code
- Phaser 3 game framework
