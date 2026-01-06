# Claude Code Instructions for Vibe3

## IMPORTANT: Version Updates

**Before each commit, update `BUILD_VERSION` in `js/config.js`!**
This is how the user tracks if their browser loaded the new code.

## Code Style Preferences

- Split files when they exceed 400-500 lines
- Prefer ES modules with clear imports/exports
- Keep related functionality grouped in medium-sized files (not too granular, not monolithic)

## Project Structure

- `/js/` - ES modules (config, scenes, utils)
- `/index.html` - Entry point with minimal code
- Phaser 3 game framework
