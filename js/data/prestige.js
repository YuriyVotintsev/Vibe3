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
    // 10% multiplicative reduction per level: 1.0, 0.9, 0.81, 0.729...
    return Math.pow(0.9, PlayerData.prestigeCostReduction);
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
    // 10% multiplicative increase per level: 1.0, 1.1, 1.21, 1.331...
    return Math.pow(1.1, PlayerData.prestigeComboEffect);
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

// v6: MAJOR REBALANCE - prices scaled ~100-1000x
// Player was earning 1,000,000 coins while all upgrades cost ~215 total
// New total cost for all limited upgrades: ~290,000
// Infinite upgrades scale faster to remain challenging
const PRESTIGE_UPGRADE_CONFIGS = {
    // Тиры: 50, 500, 5000, 50000 (x10 progression) - unlocks new gem types
    tiers: {
        property: 'prestigeTiers',
        getCost: () => 50 * Math.pow(10, PlayerData.prestigeTiers),
        maxLevel: 4
    },
    // Цвета: 100, 1000, 10000 (x10 progression) - fewer colors = easier matches
    colors: {
        property: 'prestigeColors',
        getCost: () => 100 * Math.pow(10, PlayerData.prestigeColors),
        maxLevel: 3
    },
    // Арена: 200, 2000, 20000, 200000 (x10 progression) - biggest impact on income
    arena: {
        property: 'prestigeArena',
        getCost: () => 200 * Math.pow(10, PlayerData.prestigeArena),
        maxLevel: 4
    },
    // Starting capital: 10, 50, 200 - early QoL upgrade
    startingCapital: {
        property: 'prestigeStartingCapital',
        getCost: () => [10, 50, 200][PlayerData.prestigeStartingCapital] || null,
        maxLevel: 3
    },
    // Cost reduction: 30 * 2.2^level - powerful late-game infinite upgrade
    costReduction: {
        property: 'prestigeCostReduction',
        getCost: () => Math.floor(30 * Math.pow(2.2, PlayerData.prestigeCostReduction)),
        maxLevel: Infinity
    },
    // Growth reduction: 30, 200, 1000 - moderate utility
    growthReduction: {
        property: 'prestigeGrowthReduction',
        getCost: () => [30, 200, 1000][PlayerData.prestigeGrowthReduction] || null,
        maxLevel: 3
    },
    // Combo gain: 25, 150, 600 - early-mid game
    comboGain: {
        property: 'prestigeComboGain',
        getCost: () => [25, 150, 600][PlayerData.prestigeComboGain] || null,
        maxLevel: 3
    },
    // Combo effect: 50 * 2.0^level - powerful infinite upgrade
    comboEffect: {
        property: 'prestigeComboEffect',
        getCost: () => Math.floor(50 * Math.pow(2.0, PlayerData.prestigeComboEffect)),
        maxLevel: Infinity
    }
};

function performPrestigeUpgrade(config) {
    const cost = config.getCost();
    if (cost === null) return false; // maxed out

    const currentLevel = PlayerData[config.property];
    const isInfinite = config.maxLevel === Infinity;

    if (PlayerData.prestigeCurrency >= cost && (isInfinite || currentLevel < config.maxLevel)) {
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
// v6: MAJOR REBALANCE - scaled ~10-5000x based on tier
// Early autos are affordable, endgame autos are luxury purchases
// Total cost: ~63,520 coins

const AUTO_BUY_COSTS = {
    autoBuyBronze: 30,        // Early essential
    autoBuySilver: 60,        // Early essential
    autoBuyGold: 200,         // Mid-game
    autoBuyCrystal: 500,      // Mid-game
    autoBuyBombChance: 150,   // Mid-game QoL
    autoBuyBombRadius: 400,   // Mid-late game
    autoBuyRainbow: 2000,     // Late game
    autoBuyAutoMove: 100,     // Early QoL
    autoBuyPrismatic: 10000,  // Endgame luxury
    autoBuyCelestial: 50000,  // Endgame luxury
    autoBuyComboDecay: 80     // Early-mid game
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
export const buyAutoBuyComboDecay = () => buyAutoBuy('autoBuyComboDecay');

// Export costs for UI
export { AUTO_BUY_COSTS };
