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
// Base income: ~240 currency/min (active) + upgrades
// Coins require: 1st=3000, 2nd=6000, 3rd=9000... Nth=N*3000
// Total for N coins = 3000 * N * (N+1) / 2
//
// Progression timeline (with upgrades accelerating income):
//   Coin 1: 3000 currency (~8-10 min active play)
//   Coin 2: 9000 total (~18-20 min, has 2x mult)
//   Coin 3: 18000 total (~28-30 min)
//   Coin 5: 45000 total (~45-50 min)
//   Coin 10: 165000 total (~75-80 min)
//   Coin 15: 360000 total (~100-110 min)
//   Coin 20: 630000 total (~120 min = endgame)
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

export const AUTO_BUY_COST = 3; // v3: reasonable for active economy

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
