// prestige.js - Prestige system logic

import { PlayerData, savePlayerData } from './playerData.js';

// ========== PRESTIGE CALCULATIONS ==========

// Get money multiplier from prestige (2^level, min 1)
export function getMoneyMultiplier() {
    return Math.pow(2, PlayerData.prestigeMoneyMult);
}

// Get current board size (5 + prestigeArena, max 9)
export function getBoardSize() {
    return Math.min(9, 5 + PlayerData.prestigeArena);
}

// Get current color count (6 - prestigeColors, min 3)
export function getColorCount() {
    return Math.max(3, 6 - PlayerData.prestigeColors);
}

// Calculate how many prestige coins you can get from a currency amount
// Coins require: 1st=10K, 2nd=20K, 3rd=30K... Nth=N*10K
// Total for N coins = 10000 * N * (N+1) / 2
export function getPrestigeCoinsFromCurrency(currency) {
    // Solve: 10000 * N * (N+1) / 2 <= currency
    // N^2 + N - currency/5000 <= 0
    // N = floor((-1 + sqrt(1 + currency/1250)) / 2)
    if (currency < 10000) return 0;
    const n = Math.floor((-1 + Math.sqrt(1 + currency / 1250)) / 2);
    return Math.max(0, n);
}

// Get total currency required for N prestige coins
export function getCurrencyForCoins(n) {
    return 10000 * n * (n + 1) / 2;
}

// Get currency needed for the next prestige coin from current amount
export function getCurrencyForNextCoin() {
    const currentCoins = getPrestigeCoinsFromCurrency(PlayerData.currency);
    const nextCoinTotal = getCurrencyForCoins(currentCoins + 1);
    return nextCoinTotal;
}

// Get progress towards next prestige coin (0-1)
export function getProgressToNextCoin() {
    const currentCoins = getPrestigeCoinsFromCurrency(PlayerData.currency);
    const currentThreshold = getCurrencyForCoins(currentCoins);
    const nextThreshold = getCurrencyForCoins(currentCoins + 1);
    const range = nextThreshold - currentThreshold;
    const progress = PlayerData.currency - currentThreshold;
    return Math.min(1, progress / range);
}

// ========== PRESTIGE ACTION ==========

// Perform prestige: reset game, gain prestige coins
export function performPrestige() {
    const coinsToGain = getPrestigeCoinsFromCurrency(PlayerData.currency);
    if (coinsToGain <= 0) return false;

    // Add prestige coins
    PlayerData.prestigeCurrency += coinsToGain;

    // Reset regular progress (but keep prestige upgrades)
    PlayerData.currency = 0;
    PlayerData.totalEarned = 0;
    PlayerData.autoMoveDelay = 5000;
    PlayerData.bombChance = 10;
    PlayerData.bombRadius = 1;
    PlayerData.bronzeChance = 5;
    PlayerData.silverChance = 1;
    PlayerData.goldChance = 0;
    PlayerData.crystalChance = 0;
    PlayerData.rainbowChance = 0;
    PlayerData.prismaticChance = 0;
    PlayerData.celestialChance = 0;

    savePlayerData();
    return true;
}

// ========== PRESTIGE UPGRADE COSTS ==========

export function getPrestigeMoneyMultCost() {
    return PlayerData.prestigeMoneyMult + 1; // 1, 2, 3, 4...
}

export function getPrestigeTiersCost() {
    return (PlayerData.prestigeTiers + 1) * 2; // 2, 4, 6, 8
}

export function getPrestigeColorsCost() {
    return (PlayerData.prestigeColors + 1) * 3; // 3, 6, 9
}

export function getPrestigeArenaCost() {
    return (PlayerData.prestigeArena + 1) * 2; // 2, 4, 6, 8
}

// ========== PRESTIGE UPGRADES ==========

// Upgrade prestige: money multiplier (infinite)
export function upgradePrestigeMoneyMult() {
    const cost = getPrestigeMoneyMultCost();
    if (PlayerData.prestigeCurrency >= cost) {
        PlayerData.prestigeCurrency -= cost;
        PlayerData.prestigeMoneyMult += 1;
        savePlayerData();
        return true;
    }
    return false;
}

// Upgrade prestige: unlock tiers (max 4 upgrades = 7 tiers)
export function upgradePrestigeTiers() {
    const cost = getPrestigeTiersCost();
    if (PlayerData.prestigeCurrency >= cost && PlayerData.prestigeTiers < 4) {
        PlayerData.prestigeCurrency -= cost;
        PlayerData.prestigeTiers += 1;
        savePlayerData();
        return true;
    }
    return false;
}

// Upgrade prestige: reduce colors (max 3 upgrades = 3 colors)
export function upgradePrestigeColors() {
    const cost = getPrestigeColorsCost();
    if (PlayerData.prestigeCurrency >= cost && PlayerData.prestigeColors < 3) {
        PlayerData.prestigeCurrency -= cost;
        PlayerData.prestigeColors += 1;
        savePlayerData();
        return true;
    }
    return false;
}

// Upgrade prestige: increase arena (max 4 upgrades = 9x9)
export function upgradePrestigeArena() {
    const cost = getPrestigeArenaCost();
    if (PlayerData.prestigeCurrency >= cost && PlayerData.prestigeArena < 4) {
        PlayerData.prestigeCurrency -= cost;
        PlayerData.prestigeArena += 1;
        savePlayerData();
        return true;
    }
    return false;
}

// ========== AUTO-BUY PRESTIGE UPGRADES ==========

// Auto-buy cost (one-time purchase, 5 coins each)
export const AUTO_BUY_COST = 5;

// Generic auto-buy function
function buyAutoBuy(property) {
    if (!PlayerData[property] && PlayerData.prestigeCurrency >= AUTO_BUY_COST) {
        PlayerData.prestigeCurrency -= AUTO_BUY_COST;
        PlayerData[property] = true;
        savePlayerData();
        return true;
    }
    return false;
}

// Auto-buy upgrade functions
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
