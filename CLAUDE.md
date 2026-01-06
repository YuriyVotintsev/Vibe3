# Claude Code Instructions for Vibe3

## IMPORTANT: Version Updates

**Before each commit, update version in TWO places:**
1. `index.html` — HTML div text (id="html-version")
2. `js/config.js` — `JS_VERSION`

## Before Implementing Features

Before starting a new feature or improving an existing one, check if refactoring would make the implementation easier:
- Is the target file too large (>400 lines)? Consider splitting.
- Is there duplicate code that could be extracted?
- Would a helper function or utility simplify the change?
- Is the code structure making the change harder than it needs to be?

If yes — refactor first, commit separately, then implement the feature.

## Code Style Preferences

- Split files when they exceed 400-500 lines
- Prefer ES modules with clear imports/exports
- Keep related functionality grouped in medium-sized files (not too granular, not monolithic)

## Project Structure

- `/js/` - ES modules (config, scenes, utils)
- `/index.html` - Entry point with minimal code
- Phaser 3 game framework
