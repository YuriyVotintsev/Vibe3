// gameSettings.js - Game settings and configuration

import { getBoardSize, getColorCount } from './prestige.js';

// Game settings (some values are dynamic via prestige)
export const GameSettings = {
    get boardSize() { return getBoardSize(); },
    get colorCount() { return getColorCount(); },
    fallSpeed: 8,       // cells per second
    gap: 4,             // gap between cells
    spawnDelay: 80,     // ms delay for spawning
    priceMultiplier: 1  // 0.1 to 1, affects upgrade costs
};
