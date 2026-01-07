// playerData.js - Player state management

// Player persistent data
export const PlayerData = {
    currency: 0,          // earned from matches, spent on upgrades
    totalEarned: 0,       // lifetime currency earned
    autoMoveDelay: 5000,  // ms between auto-moves (starts at 5 seconds)
    bombChance: 10,       // % chance to spawn bomb on manual match (starts at 10%)
    bombRadius: 1,        // explosion radius (starts at 1)
    // Enhanced gem spawn chances (in %) - CASCADING: each tier rolls from previous
    bronzeChance: 5,      // chance for bronze gem (x2) - from normal
    silverChance: 1,      // chance for silver gem (x5) - from bronze
    goldChance: 0,        // chance for gold gem (x15) - from silver
    crystalChance: 0,     // chance for crystal gem (x50) - from gold
    rainbowChance: 0,     // chance for rainbow gem (x200) - from crystal
    prismaticChance: 0,   // chance for prismatic gem (x1000) - from rainbow
    celestialChance: 0,   // chance for celestial gem (x5000) - from prismatic
    // Prestige system
    prestigeCurrency: 0,  // prestige coins
    prestigeMoneyMult: 0, // money multiplier level (2^level)
    prestigeTiers: 0,     // unlocked tier levels (0=3 tiers, 4=7 tiers)
    prestigeColors: 0,    // color reduction level (0=6 colors, 3=3 colors)
    prestigeArena: 0,     // arena size level (0=5x5, 4=9x9)
    // Auto-buy upgrades (prestige unlocks)
    autoBuyAutoMove: false,
    autoBuyBombChance: false,
    autoBuyBombRadius: false,
    autoBuyBronze: false,
    autoBuySilver: false,
    autoBuyGold: false,
    autoBuyCrystal: false,
    autoBuyRainbow: false,
    autoBuyPrismatic: false,
    autoBuyCelestial: false
};

// Default values for reset
const DEFAULT_VALUES = {
    currency: 0,
    totalEarned: 0,
    autoMoveDelay: 5000,
    bombChance: 10,
    bombRadius: 1,
    bronzeChance: 5,
    silverChance: 1,
    goldChance: 0,
    crystalChance: 0,
    rainbowChance: 0,
    prismaticChance: 0,
    celestialChance: 0
};

// Save player data to localStorage
export function savePlayerData() {
    localStorage.setItem('match3_player', JSON.stringify(PlayerData));
}

// Load player data from localStorage
export function loadPlayerData() {
    const saved = localStorage.getItem('match3_player');
    if (saved) {
        const data = JSON.parse(saved);
        Object.assign(PlayerData, data);
    }

    // Ensure all properties have valid values
    ensureValidValues();
}

// Ensure all player data properties have valid values
function ensureValidValues() {
    // Auto-move delay
    if (!PlayerData.autoMoveDelay || PlayerData.autoMoveDelay < 100) {
        PlayerData.autoMoveDelay = 5000;
    }

    // Bomb properties
    if (!PlayerData.bombChance) PlayerData.bombChance = 10;
    if (!PlayerData.bombRadius) PlayerData.bombRadius = 1;

    // Enhanced gem properties
    if (PlayerData.bronzeChance === undefined) PlayerData.bronzeChance = 5;
    if (PlayerData.silverChance === undefined) PlayerData.silverChance = 1;
    if (PlayerData.goldChance === undefined) PlayerData.goldChance = 0;
    if (PlayerData.crystalChance === undefined) PlayerData.crystalChance = 0;
    if (PlayerData.rainbowChance === undefined) PlayerData.rainbowChance = 0;
    if (PlayerData.prismaticChance === undefined) PlayerData.prismaticChance = 0;
    if (PlayerData.celestialChance === undefined) PlayerData.celestialChance = 0;

    // Prestige properties
    if (PlayerData.prestigeCurrency === undefined) PlayerData.prestigeCurrency = 0;
    if (PlayerData.prestigeMoneyMult === undefined) PlayerData.prestigeMoneyMult = 0;
    if (PlayerData.prestigeTiers === undefined) PlayerData.prestigeTiers = 0;
    if (PlayerData.prestigeColors === undefined) PlayerData.prestigeColors = 0;
    if (PlayerData.prestigeArena === undefined) PlayerData.prestigeArena = 0;

    // Auto-buy properties
    if (PlayerData.autoBuyAutoMove === undefined) PlayerData.autoBuyAutoMove = false;
    if (PlayerData.autoBuyBombChance === undefined) PlayerData.autoBuyBombChance = false;
    if (PlayerData.autoBuyBombRadius === undefined) PlayerData.autoBuyBombRadius = false;
    if (PlayerData.autoBuyBronze === undefined) PlayerData.autoBuyBronze = false;
    if (PlayerData.autoBuySilver === undefined) PlayerData.autoBuySilver = false;
    if (PlayerData.autoBuyGold === undefined) PlayerData.autoBuyGold = false;
    if (PlayerData.autoBuyCrystal === undefined) PlayerData.autoBuyCrystal = false;
    if (PlayerData.autoBuyRainbow === undefined) PlayerData.autoBuyRainbow = false;
    if (PlayerData.autoBuyPrismatic === undefined) PlayerData.autoBuyPrismatic = false;
    if (PlayerData.autoBuyCelestial === undefined) PlayerData.autoBuyCelestial = false;
}

// Reset player data (keeps prestige upgrades)
export function resetPlayerData() {
    Object.assign(PlayerData, DEFAULT_VALUES);
    savePlayerData();
}

// Full reset including prestige
export function fullResetPlayerData() {
    Object.keys(PlayerData).forEach(key => {
        if (typeof PlayerData[key] === 'boolean') {
            PlayerData[key] = false;
        } else {
            PlayerData[key] = 0;
        }
    });
    Object.assign(PlayerData, DEFAULT_VALUES);
    savePlayerData();
}
