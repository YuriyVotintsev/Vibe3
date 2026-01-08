// prestige.js - Prestige system logic (DRY version)

import { PlayerData, savePlayerData, getDefaultValue, getPrestigeResetKeys } from './playerData.js';

// ========== PRESTIGE CALCULATIONS ==========

export function getMoneyMultiplier() {
    // Multiplier = total lifetime prestige coins + 1 (useful from first coin)
    return PlayerData.totalPrestigeCoinsEarned + 1;
}

export function getBoardSize() {
    return Math.min(9, 5 + PlayerData.prestigeArena);
}

export function getColorCount() {
    return Math.max(3, 6 - PlayerData.prestigeColors);
}

// New prestige bonuses
export function getStartingCapital() {
    const amounts = [0, 100, 500, 2000];
    return amounts[PlayerData.prestigeStartingCapital] || 0;
}

export function getCostReductionMultiplier() {
    // 10% reduction per level: 1.0, 0.9, 0.8, 0.7
    return 1 - PlayerData.prestigeCostReduction * 0.1;
}

export function getGrowthReductionAmount() {
    // 0.01 reduction per level
    return PlayerData.prestigeGrowthReduction * 0.01;
}

// Combo bonuses from prestige
export function getComboGainBonus() {
    // +0.5 combo per match per level: 0, 0.5, 1.0, 1.5
    return PlayerData.prestigeComboGain * 0.5;
}

export function getComboEffectMultiplier() {
    // +25% combo effect per level: 1.0, 1.25, 1.5, 1.75
    return 1 + PlayerData.prestigeComboEffect * 0.25;
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

    // Add prestige coins (both spendable and lifetime total)
    PlayerData.prestigeCurrency += coinsToGain;
    PlayerData.totalPrestigeCoinsEarned += coinsToGain;

    // Reset regular progress using playerData's reset keys
    for (const key of getPrestigeResetKeys()) {
        PlayerData[key] = getDefaultValue(key);
    }

    // Apply starting capital bonus
    const startingCapital = getStartingCapital();
    if (startingCapital > 0) {
        PlayerData.currency = startingCapital;
    }

    savePlayerData();
    return true;
}

// ========== PRESTIGE UPGRADES ==========

// v5: Multiplier removed, now based on total earned coins
// Тиры: 3, 6, 9, 12 (x3)
// Цвета: 5, 10, 15 (x5)
// Арена: 3, 6, 9, 12 (x3)
const PRESTIGE_UPGRADE_CONFIGS = {
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
    },
    // New early-game upgrades
    startingCapital: {
        property: 'prestigeStartingCapital',
        getCost: () => [2, 4, 6][PlayerData.prestigeStartingCapital] || null,
        maxLevel: 3
    },
    costReduction: {
        property: 'prestigeCostReduction',
        getCost: () => [2, 5, 9][PlayerData.prestigeCostReduction] || null,
        maxLevel: 3
    },
    growthReduction: {
        property: 'prestigeGrowthReduction',
        getCost: () => [3, 6, 10][PlayerData.prestigeGrowthReduction] || null,
        maxLevel: 3
    },
    // Combo prestige upgrades
    comboGain: {
        property: 'prestigeComboGain',
        getCost: () => [3, 6, 10][PlayerData.prestigeComboGain] || null,
        maxLevel: 3
    },
    comboEffect: {
        property: 'prestigeComboEffect',
        getCost: () => [4, 8, 12][PlayerData.prestigeComboEffect] || null,
        maxLevel: 3
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
export const getPrestigeTiersCost = () => PRESTIGE_UPGRADE_CONFIGS.tiers.getCost();
export const getPrestigeColorsCost = () => PRESTIGE_UPGRADE_CONFIGS.colors.getCost();
export const getPrestigeArenaCost = () => PRESTIGE_UPGRADE_CONFIGS.arena.getCost();

// Exported upgrade functions
export const upgradePrestigeTiers = () => performPrestigeUpgrade(PRESTIGE_UPGRADE_CONFIGS.tiers);
export const upgradePrestigeColors = () => performPrestigeUpgrade(PRESTIGE_UPGRADE_CONFIGS.colors);
export const upgradePrestigeArena = () => performPrestigeUpgrade(PRESTIGE_UPGRADE_CONFIGS.arena);
export const upgradeStartingCapital = () => performPrestigeUpgrade(PRESTIGE_UPGRADE_CONFIGS.startingCapital);
export const upgradeCostReduction = () => performPrestigeUpgrade(PRESTIGE_UPGRADE_CONFIGS.costReduction);
export const upgradeGrowthReduction = () => performPrestigeUpgrade(PRESTIGE_UPGRADE_CONFIGS.growthReduction);

// Exported cost functions for new upgrades
export const getStartingCapitalCost = () => PRESTIGE_UPGRADE_CONFIGS.startingCapital.getCost();
export const getCostReductionCost = () => PRESTIGE_UPGRADE_CONFIGS.costReduction.getCost();
export const getGrowthReductionCost = () => PRESTIGE_UPGRADE_CONFIGS.growthReduction.getCost();
export const getComboGainCost = () => PRESTIGE_UPGRADE_CONFIGS.comboGain.getCost();
export const getComboEffectCost = () => PRESTIGE_UPGRADE_CONFIGS.comboEffect.getCost();

// Combo upgrade functions
export const upgradeComboGain = () => performPrestigeUpgrade(PRESTIGE_UPGRADE_CONFIGS.comboGain);
export const upgradeComboEffect = () => performPrestigeUpgrade(PRESTIGE_UPGRADE_CONFIGS.comboEffect);

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
