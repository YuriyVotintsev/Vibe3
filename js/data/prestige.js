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

// Calculate prestige coins from currency
// Coins require: 1st=10K, 2nd=20K, 3rd=30K... Nth=N*10K
// Total for N coins = 10000 * N * (N+1) / 2
export function getPrestigeCoinsFromCurrency(currency) {
    if (currency < 10000) return 0;
    const n = Math.floor((-1 + Math.sqrt(1 + currency / 1250)) / 2);
    return Math.max(0, n);
}

export function getCurrencyForCoins(n) {
    return 10000 * n * (n + 1) / 2;
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

// Upgrade configurations
const PRESTIGE_UPGRADE_CONFIGS = {
    moneyMult: {
        property: 'prestigeMoneyMult',
        getCost: () => PlayerData.prestigeMoneyMult + 1,
        maxLevel: Infinity
    },
    tiers: {
        property: 'prestigeTiers',
        getCost: () => (PlayerData.prestigeTiers + 1) * 2,
        maxLevel: 4
    },
    colors: {
        property: 'prestigeColors',
        getCost: () => (PlayerData.prestigeColors + 1) * 3,
        maxLevel: 3
    },
    arena: {
        property: 'prestigeArena',
        getCost: () => (PlayerData.prestigeArena + 1) * 2,
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

export const AUTO_BUY_COST = 5;

function buyAutoBuy(property) {
    if (!PlayerData[property] && PlayerData.prestigeCurrency >= AUTO_BUY_COST) {
        PlayerData.prestigeCurrency -= AUTO_BUY_COST;
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
