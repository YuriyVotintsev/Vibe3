// upgrades.js - Regular upgrades logic (DRY version)

import { PlayerData, savePlayerData } from './playerData.js';
import { GameSettings } from './gameSettings.js';
import { ENHANCEMENT } from './enhancements.js';

// ========== UPGRADE CONFIGURATIONS ==========

// Configuration for all upgrades
// property: PlayerData key, name: UI display, unit: value suffix
// enhancement: required tier (null = always visible)
// === UPGRADE BALANCE v3: Active play economy ===
// Base income: ~240 currency/min (60 moves × 4 gems × 1 currency)
// First upgrade (Bronze) in ~5 seconds = 20 currency
// Everything starts at ZERO — player earns all bonuses
const UPGRADE_CONFIGS = {
    autoMove: {
        property: 'autoMoveDelay',
        name: 'Авто-ход',
        unit: 'с',
        enhancement: null,
        baseCost: 200,      // v3: not priority for active player
        growthRate: 1.6,    // v3: moderate growth
        step: null,         // special: variable step
        min: 100,           // v3: back to 100ms minimum
        max: 5000,          // v3: back to 5000ms start
        getValue: () => (PlayerData.autoMoveDelay / 1000).toFixed(1),
        getLevel: () => {
            // 5000 -> 500 (9 steps of 500ms), then 500 -> 100 (4 steps of 100ms)
            if (PlayerData.autoMoveDelay >= 500) {
                return Math.round((5000 - PlayerData.autoMoveDelay) / 500);
            }
            return 9 + Math.round((500 - PlayerData.autoMoveDelay) / 100);
        },
        getMaxLevel: () => 13
    },
    bombChance: {
        property: 'bombChance',
        name: 'Шанс бомбы',
        unit: '%',
        enhancement: null,
        baseCost: 150,      // v3: medium priority, unlocks fun mechanic
        growthRate: 1.4,    // v3: accessible growth
        step: 5,
        min: 0,             // v3: starts at ZERO!
        max: 50,
        getValue: () => PlayerData.bombChance,
        getLevel: () => PlayerData.bombChance / 5,
        getMaxLevel: () => 50 / 5
    },
    bombRadius: {
        property: 'bombRadius',
        name: 'Радиус',
        unit: '',
        enhancement: null,
        baseCost: 800,      // v3: expensive, powerful upgrade
        growthRate: 2.5,    // v3: steep, only 2 levels
        step: 1,
        min: 1,
        max: 3,
        getValue: () => PlayerData.bombRadius,
        getLevel: () => PlayerData.bombRadius - 1,
        getMaxLevel: () => 3 - 1
    },
    bronze: {
        property: 'bronzeChance',
        name: 'Бронза',
        unit: '%',
        enhancement: ENHANCEMENT.BRONZE,
        baseCost: 20,       // v3: first buy in ~5 seconds!
        growthRate: 1.12,   // v3: gentle curve, many levels
        step: 5,            // v3: +5% per upgrade
        min: 0,             // v3: starts at ZERO!
        max: 100,
        getValue: () => PlayerData.bronzeChance,
        getLevel: () => PlayerData.bronzeChance / 5,
        getMaxLevel: () => 100 / 5
    },
    silver: {
        property: 'silverChance',
        name: 'Серебро',
        unit: '%',
        enhancement: ENHANCEMENT.SILVER,
        baseCost: 50,       // v3: unlocks after some bronze
        growthRate: 1.15,   // v3: slightly steeper
        step: 4,
        min: 0,             // v3: starts at ZERO!
        max: 100,
        getValue: () => PlayerData.silverChance,
        getLevel: () => Math.floor(PlayerData.silverChance / 4),
        getMaxLevel: () => 100 / 4
    },
    gold: {
        property: 'goldChance',
        name: 'Золото',
        unit: '%',
        enhancement: ENHANCEMENT.GOLD,
        baseCost: 100,      // v3: mid-game unlock
        growthRate: 1.18,
        step: 3,
        min: 0,
        max: 100,
        getValue: () => PlayerData.goldChance,
        getLevel: () => Math.floor(PlayerData.goldChance / 3),
        getMaxLevel: () => Math.ceil(100 / 3)
    },
    crystal: {
        property: 'crystalChance',
        name: 'Кристалл',
        unit: '%',
        enhancement: ENHANCEMENT.CRYSTAL,
        baseCost: 200,      // v3: late-early game
        growthRate: 1.20,
        step: 2,
        min: 0,
        max: 100,
        getValue: () => PlayerData.crystalChance,
        getLevel: () => Math.floor(PlayerData.crystalChance / 2),
        getMaxLevel: () => 100 / 2
    },
    rainbow: {
        property: 'rainbowChance',
        name: 'Радуга',
        unit: '%',
        enhancement: ENHANCEMENT.RAINBOW,
        baseCost: 400,      // v3: mid-game
        growthRate: 1.22,
        step: 2,
        min: 0,
        max: 100,
        getValue: () => PlayerData.rainbowChance,
        getLevel: () => Math.floor(PlayerData.rainbowChance / 2),
        getMaxLevel: () => 100 / 2
    },
    prismatic: {
        property: 'prismaticChance',
        name: 'Призма',
        unit: '%',
        enhancement: ENHANCEMENT.PRISMATIC,
        baseCost: 800,      // v3: late game
        growthRate: 1.25,
        step: 1,
        min: 0,
        max: 100,
        getValue: () => PlayerData.prismaticChance,
        getLevel: () => PlayerData.prismaticChance,
        getMaxLevel: () => 100
    },
    celestial: {
        property: 'celestialChance',
        name: 'Небесный',
        unit: '%',
        enhancement: ENHANCEMENT.CELESTIAL,
        baseCost: 1500,     // v3: endgame
        growthRate: 1.28,
        step: 1,
        min: 0,
        max: 100,
        getValue: () => PlayerData.celestialChance,
        getLevel: () => PlayerData.celestialChance,
        getMaxLevel: () => 100
    }
};

// Export configs for UI generation
export { UPGRADE_CONFIGS };

// ========== GENERIC UPGRADE FUNCTIONS ==========

function getUpgradeCost(config) {
    const level = config.getLevel();
    return Math.floor(config.baseCost * Math.pow(config.growthRate, level) * GameSettings.priceMultiplier);
}

function isMaxed(config) {
    // autoMove is special: decreases from max to min, so only check min
    if (config.property === 'autoMoveDelay') {
        return PlayerData.autoMoveDelay <= config.min;
    }
    return PlayerData[config.property] >= config.max;
}

function performUpgrade(config) {
    if (isMaxed(config)) return false;

    const cost = getUpgradeCost(config);
    if (PlayerData.currency < cost) return false;

    PlayerData.currency -= cost;

    // Special handling for autoMove (decreases instead of increases)
    if (config.property === 'autoMoveDelay') {
        // v3: 5000->500 in 500ms steps, then 500->100 in 100ms steps
        const step = PlayerData.autoMoveDelay > 500 ? 500 : 100;
        PlayerData.autoMoveDelay = Math.max(config.min, PlayerData.autoMoveDelay - step);
    } else {
        PlayerData[config.property] = Math.min(config.max, PlayerData[config.property] + config.step);
    }

    savePlayerData();
    return true;
}

// ========== UI UPGRADE OBJECT FACTORY ==========
// Creates a "Tell, Don't Ask" style upgrade object for UI

export function createUpgradeForUI(configKey, currencyGetter = () => PlayerData.currency) {
    const config = UPGRADE_CONFIGS[configKey];
    if (!config) throw new Error(`Unknown upgrade: ${configKey}`);

    return {
        key: configKey,
        config,
        getName: () => config.name,
        getValue: () => `${config.getValue()}${config.unit}`,
        getLevel: () => `${config.getLevel()}/${config.getMaxLevel()}`,
        // Tell, Don't Ask: getCost returns null if maxed (tells you the state)
        getCost: () => isMaxed(config) ? null : getUpgradeCost(config),
        // canAfford derives from getCost - no duplicate logic
        canAfford() {
            const cost = this.getCost();
            return cost !== null && currencyGetter() >= cost;
        },
        onBuy: () => performUpgrade(config)
    };
}

// ========== BACKWARD COMPATIBLE EXPORTS ==========
// (kept for existing code that imports individual functions)

export const getBronzeLevel = () => UPGRADE_CONFIGS.bronze.getLevel();
export const getBronzeUpgradeCost = () => getUpgradeCost(UPGRADE_CONFIGS.bronze);
export const upgradeBronze = () => performUpgrade(UPGRADE_CONFIGS.bronze);

export const getSilverLevel = () => UPGRADE_CONFIGS.silver.getLevel();
export const getSilverUpgradeCost = () => getUpgradeCost(UPGRADE_CONFIGS.silver);
export const upgradeSilver = () => performUpgrade(UPGRADE_CONFIGS.silver);

export const getGoldLevel = () => UPGRADE_CONFIGS.gold.getLevel();
export const getGoldUpgradeCost = () => getUpgradeCost(UPGRADE_CONFIGS.gold);
export const upgradeGold = () => performUpgrade(UPGRADE_CONFIGS.gold);

export const getCrystalLevel = () => UPGRADE_CONFIGS.crystal.getLevel();
export const getCrystalUpgradeCost = () => getUpgradeCost(UPGRADE_CONFIGS.crystal);
export const upgradeCrystal = () => performUpgrade(UPGRADE_CONFIGS.crystal);

export const getRainbowLevel = () => UPGRADE_CONFIGS.rainbow.getLevel();
export const getRainbowUpgradeCost = () => getUpgradeCost(UPGRADE_CONFIGS.rainbow);
export const upgradeRainbow = () => performUpgrade(UPGRADE_CONFIGS.rainbow);

export const getPrismaticLevel = () => UPGRADE_CONFIGS.prismatic.getLevel();
export const getPrismaticUpgradeCost = () => getUpgradeCost(UPGRADE_CONFIGS.prismatic);
export const upgradePrismatic = () => performUpgrade(UPGRADE_CONFIGS.prismatic);

export const getCelestialLevel = () => UPGRADE_CONFIGS.celestial.getLevel();
export const getCelestialUpgradeCost = () => getUpgradeCost(UPGRADE_CONFIGS.celestial);
export const upgradeCelestial = () => performUpgrade(UPGRADE_CONFIGS.celestial);

export const getBombChanceLevel = () => UPGRADE_CONFIGS.bombChance.getLevel();
export const getBombChanceUpgradeCost = () => getUpgradeCost(UPGRADE_CONFIGS.bombChance);
export const upgradeBombChance = () => performUpgrade(UPGRADE_CONFIGS.bombChance);

export const getBombRadiusLevel = () => UPGRADE_CONFIGS.bombRadius.getLevel();
export const getBombRadiusUpgradeCost = () => getUpgradeCost(UPGRADE_CONFIGS.bombRadius);
export const upgradeBombRadius = () => performUpgrade(UPGRADE_CONFIGS.bombRadius);

export const getAutoMoveLevel = () => UPGRADE_CONFIGS.autoMove.getLevel();
export const getAutoMoveUpgradeCost = () => getUpgradeCost(UPGRADE_CONFIGS.autoMove);
export const getAutoMoveStep = () => PlayerData.autoMoveDelay > 500 ? 500 : 100; // v3: standard steps
export const upgradeAutoMove = () => performUpgrade(UPGRADE_CONFIGS.autoMove);

// ========== AUTO-BUY PROCESSOR ==========

// Map upgrade key to auto-buy PlayerData key
const AUTO_BUY_KEYS = {
    autoMove: 'autoBuyAutoMove',
    bombChance: 'autoBuyBombChance',
    bombRadius: 'autoBuyBombRadius',
    bronze: 'autoBuyBronze',
    silver: 'autoBuySilver',
    gold: 'autoBuyGold',
    crystal: 'autoBuyCrystal',
    rainbow: 'autoBuyRainbow',
    prismatic: 'autoBuyPrismatic',
    celestial: 'autoBuyCelestial'
};

export function processAutoBuys() {
    let purchased = false;

    for (const [upgradeKey, autoBuyKey] of Object.entries(AUTO_BUY_KEYS)) {
        if (!PlayerData[autoBuyKey]) continue;

        const config = UPGRADE_CONFIGS[upgradeKey];
        if (isMaxed(config)) continue;

        const cost = getUpgradeCost(config);
        if (PlayerData.currency >= cost) {
            performUpgrade(config);
            purchased = true;
        }
    }

    return purchased;
}

// Export AUTO_BUY_KEYS for UI
export { AUTO_BUY_KEYS };
