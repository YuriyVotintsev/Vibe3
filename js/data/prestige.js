// prestige.js - Prestige system logic (DRY version)

import { PlayerData, savePlayerData, getDefaultValue, getPrestigeResetKeys } from './playerData.js';

// ========== PRESTIGE CALCULATIONS ==========

export function getMoneyMultiplier() {
    return Math.pow(2, PlayerData.prestigeMoneyMult);
}

export function getBoardSize() {
    return Math.min(9, 5 + PlayerData.prestigeArena);
}

export function getColorCount() {
    return Math.max(3, 6 - PlayerData.prestigeColors);
}

// === PRESTIGE BALANCE v4: High income economy ===
// IMPORTANT: Currency resets to 0 after each prestige!
// Coins are earned fresh each run, not cumulative.
//
// Coin costs (cumulative within single run):
//   1 coin: 5000, 2 coins: 15000, 3 coins: 30000
//
// With v4 gem multipliers (up to x50000), income is 10-25x higher
// Prestige upgrade costs increased to compensate
const COIN_BASE = 5000;

export function getPrestigeCoinsFromCurrency(currency) {
    if (currency < COIN_BASE) return 0;
    // Derived from: COIN_BASE * n * (n+1) / 2 = currency
    // n^2 + n - 2*currency/COIN_BASE = 0
    // n = (-1 + sqrt(1 + 8*currency/COIN_BASE)) / 2
    const n = Math.floor((-1 + Math.sqrt(1 + 8 * currency / COIN_BASE)) / 2);
    return Math.max(0, n);
}

export function getCurrencyForCoins(n) {
    return COIN_BASE * n * (n + 1) / 2;
}

export function getCurrencyForNextCoin() {
    const currentCoins = getPrestigeCoinsFromCurrency(PlayerData.currency);
    return getCurrencyForCoins(currentCoins + 1);
}

export function getProgressToNextCoin() {
    const currentCoins = getPrestigeCoinsFromCurrency(PlayerData.currency);
    const currentThreshold = getCurrencyForCoins(currentCoins);
    const nextThreshold = getCurrencyForCoins(currentCoins + 1);
    const range = nextThreshold - currentThreshold;
    const progress = PlayerData.currency - currentThreshold;
    return Math.min(1, progress / range);
}

// ========== PRESTIGE ACTION ==========

export function performPrestige() {
    const coinsToGain = getPrestigeCoinsFromCurrency(PlayerData.currency);
    if (coinsToGain <= 0) return false;

    // Add prestige coins
    PlayerData.prestigeCurrency += coinsToGain;

    // Reset regular progress using playerData's reset keys
    for (const key of getPrestigeResetKeys()) {
        PlayerData[key] = getDefaultValue(key);
    }

    savePlayerData();
    return true;
}

// ========== PRESTIGE UPGRADES ==========

// v4: Higher costs to match increased income
// Множитель: 2, 4, 6, 8... (x2)
// Тиры: 3, 6, 9, 12 (x3)
// Цвета: 5, 10, 15 (x5)
// Арена: 3, 6, 9, 12 (x3)
const PRESTIGE_UPGRADE_CONFIGS = {
    moneyMult: {
        property: 'prestigeMoneyMult',
        getCost: () => (PlayerData.prestigeMoneyMult + 1) * 2,
        maxLevel: Infinity
    },
    tiers: {
        property: 'prestigeTiers',
        getCost: () => (PlayerData.prestigeTiers + 1) * 3,
        maxLevel: 4
    },
    colors: {
        property: 'prestigeColors',
        getCost: () => (PlayerData.prestigeColors + 1) * 5,
        maxLevel: 3
    },
    arena: {
        property: 'prestigeArena',
        getCost: () => (PlayerData.prestigeArena + 1) * 3,
        maxLevel: 4
    }
};

function performPrestigeUpgrade(config) {
    const cost = config.getCost();
    const currentLevel = PlayerData[config.property];

    if (PlayerData.prestigeCurrency >= cost && currentLevel < config.maxLevel) {
        PlayerData.prestigeCurrency -= cost;
        PlayerData[config.property] += 1;
        savePlayerData();
        return true;
    }
    return false;
}

// Exported cost functions
export const getPrestigeMoneyMultCost = () => PRESTIGE_UPGRADE_CONFIGS.moneyMult.getCost();
export const getPrestigeTiersCost = () => PRESTIGE_UPGRADE_CONFIGS.tiers.getCost();
export const getPrestigeColorsCost = () => PRESTIGE_UPGRADE_CONFIGS.colors.getCost();
export const getPrestigeArenaCost = () => PRESTIGE_UPGRADE_CONFIGS.arena.getCost();

// Exported upgrade functions
export const upgradePrestigeMoneyMult = () => performPrestigeUpgrade(PRESTIGE_UPGRADE_CONFIGS.moneyMult);
export const upgradePrestigeTiers = () => performPrestigeUpgrade(PRESTIGE_UPGRADE_CONFIGS.tiers);
export const upgradePrestigeColors = () => performPrestigeUpgrade(PRESTIGE_UPGRADE_CONFIGS.colors);
export const upgradePrestigeArena = () => performPrestigeUpgrade(PRESTIGE_UPGRADE_CONFIGS.arena);

// ========== AUTO-BUY UNLOCKS ==========
// v4: Higher costs (~2x) to match increased income
// Early game (Bronze/Silver): essential
// Mid game (Gold/Crystal/Bombs): moderate
// Late game (Rainbow/Prismatic/Celestial): luxury

const AUTO_BUY_COSTS = {
    autoBuyBronze: 4,       // Essential, buy early
    autoBuySilver: 4,       // Essential, buy early
    autoBuyGold: 6,         // Mid-game
    autoBuyCrystal: 6,      // Mid-game
    autoBuyBombChance: 6,   // Mid-game QoL
    autoBuyBombRadius: 8,   // Late-mid, powerful
    autoBuyRainbow: 8,      // Late game
    autoBuyAutoMove: 8,     // Late game
    autoBuyPrismatic: 10,   // Endgame luxury
    autoBuyCelestial: 10    // Endgame luxury
};

export function getAutoBuyCost(property) {
    return AUTO_BUY_COSTS[property] || 3;
}

function buyAutoBuy(property) {
    const cost = getAutoBuyCost(property);
    if (!PlayerData[property] && PlayerData.prestigeCurrency >= cost) {
        PlayerData.prestigeCurrency -= cost;
        PlayerData[property] = true;
        savePlayerData();
        return true;
    }
    return false;
}

export const buyAutoBuyAutoMove = () => buyAutoBuy('autoBuyAutoMove');
export const buyAutoBuyBombChance = () => buyAutoBuy('autoBuyBombChance');
export const buyAutoBuyBombRadius = () => buyAutoBuy('autoBuyBombRadius');
export const buyAutoBuyBronze = () => buyAutoBuy('autoBuyBronze');
export const buyAutoBuySilver = () => buyAutoBuy('autoBuySilver');
export const buyAutoBuyGold = () => buyAutoBuy('autoBuyGold');
export const buyAutoBuyCrystal = () => buyAutoBuy('autoBuyCrystal');
export const buyAutoBuyRainbow = () => buyAutoBuy('autoBuyRainbow');
export const buyAutoBuyPrismatic = () => buyAutoBuy('autoBuyPrismatic');
export const buyAutoBuyCelestial = () => buyAutoBuy('autoBuyCelestial');

// Export costs for UI
export { AUTO_BUY_COSTS };
