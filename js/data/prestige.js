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

// === PRESTIGE BALANCE v3: Active play economy ===
// IMPORTANT: Currency resets to 0 after each prestige!
// Coins are earned fresh each run, not cumulative.
//
// Coin costs (cumulative within single run):
//   1 coin: 3000, 2 coins: 9000, 3 coins: 18000
//
// Prestige progression (currency resets each time):
//   Prestige 1: mult=0→1, ~240/min, earn 1 coin in ~12 min
//   Prestige 2: mult=1 (2x), ~400/min, earn 1-2 coins in ~12 min
//   Prestige 3: mult=2 (4x), ~800/min, earn 2-3 coins in ~12 min
//   Prestige 5: mult=4 (16x), earn 3-4 coins per run
//   Prestige 10: mult=8+ (256x+), earn 5-6 coins per run
//
// Total coins over 2 hours: ~50-60 coins
// Enough for: all tiers, arena, colors, several auto-buys, high mult
export function getPrestigeCoinsFromCurrency(currency) {
    if (currency < 3000) return 0;
    // Derived from: 3000 * n * (n+1) / 2 = currency
    // n = (-1 + sqrt(1 + 4*currency/3000)) / 2
    const n = Math.floor((-1 + Math.sqrt(1 + currency / 375)) / 2);
    return Math.max(0, n);
}

export function getCurrencyForCoins(n) {
    return 3000 * n * (n + 1) / 2;
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

// Upgrade configurations (balanced for ~2 hour completion)
const PRESTIGE_UPGRADE_CONFIGS = {
    moneyMult: {
        property: 'prestigeMoneyMult',
        getCost: () => PlayerData.prestigeMoneyMult + 1,
        maxLevel: Infinity
    },
    tiers: {
        property: 'prestigeTiers',
        getCost: () => PlayerData.prestigeTiers + 1, // was *2, now linear
        maxLevel: 4
    },
    colors: {
        property: 'prestigeColors',
        getCost: () => (PlayerData.prestigeColors + 1) * 2, // was *3, now *2
        maxLevel: 3
    },
    arena: {
        property: 'prestigeArena',
        getCost: () => PlayerData.prestigeArena + 1, // was *2, now linear
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
// v3: Different costs based on when player needs them
// Early game (Bronze/Silver): cheap, needed soon
// Mid game (Gold/Crystal/Bombs): moderate
// Late game (Rainbow/Prismatic/Celestial): expensive luxury

const AUTO_BUY_COSTS = {
    autoBuyBronze: 2,       // Essential, buy early
    autoBuySilver: 2,       // Essential, buy early
    autoBuyGold: 3,         // Mid-game
    autoBuyCrystal: 3,      // Mid-game
    autoBuyBombChance: 3,   // Mid-game QoL
    autoBuyBombRadius: 4,   // Late-mid, powerful
    autoBuyRainbow: 4,      // Late game
    autoBuyAutoMove: 4,     // Late game (active players don't need early)
    autoBuyPrismatic: 5,    // Endgame luxury
    autoBuyCelestial: 5     // Endgame luxury
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
