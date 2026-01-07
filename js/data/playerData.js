// playerData.js - Player state management (DRY version)

// Default values - single source of truth
const DEFAULTS = {
    // Currency
    currency: 0,
    totalEarned: 0,

    // Regular upgrades
    autoMoveDelay: 5000,
    bombChance: 10,
    bombRadius: 1,

    // Enhancement chances
    bronzeChance: 5,
    silverChance: 1,
    goldChance: 0,
    crystalChance: 0,
    rainbowChance: 0,
    prismaticChance: 0,
    celestialChance: 0,

    // Prestige
    prestigeCurrency: 0,
    prestigeMoneyMult: 0,
    prestigeTiers: 0,
    prestigeColors: 0,
    prestigeArena: 0,

    // Auto-buy flags
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

// Properties that reset on prestige (not prestige upgrades or auto-buys)
const PRESTIGE_RESET_KEYS = [
    'currency', 'totalEarned', 'autoMoveDelay', 'bombChance', 'bombRadius',
    'bronzeChance', 'silverChance', 'goldChance', 'crystalChance',
    'rainbowChance', 'prismaticChance', 'celestialChance'
];

// Player persistent data - initialized from defaults
export const PlayerData = { ...DEFAULTS };

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
    for (const [key, defaultValue] of Object.entries(DEFAULTS)) {
        if (PlayerData[key] === undefined || PlayerData[key] === null) {
            PlayerData[key] = defaultValue;
        }
    }

    // Special validation for autoMoveDelay
    if (PlayerData.autoMoveDelay < 100) {
        PlayerData.autoMoveDelay = DEFAULTS.autoMoveDelay;
    }
}

// Reset player data (keeps prestige upgrades and auto-buys)
export function resetPlayerData() {
    for (const key of PRESTIGE_RESET_KEYS) {
        PlayerData[key] = DEFAULTS[key];
    }
    savePlayerData();
}

// Get default value for a property (used by prestige.js)
export function getDefaultValue(key) {
    return DEFAULTS[key];
}

// Get all prestige reset keys (used by prestige.js)
export function getPrestigeResetKeys() {
    return PRESTIGE_RESET_KEYS;
}
