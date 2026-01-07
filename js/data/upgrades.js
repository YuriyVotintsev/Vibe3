// upgrades.js - Regular upgrades logic (DRY version)

import { PlayerData, savePlayerData } from './playerData.js';
import { GameSettings } from './gameSettings.js';
import { ENHANCEMENT } from './enhancements.js';

// ========== UPGRADE CONFIGURATIONS ==========

// Configuration for all upgrades
// property: PlayerData key, name: UI display, unit: value suffix
// enhancement: required tier (null = always visible)
// === UPGRADE BALANCE v2 ===
// Philosophy: First upgrade in 20-30 seconds, constant progression
// Early game: cheap & fast. Late game: expensive but satisfying.
//
// At ~80 currency/min start, first Bronze (15) comes at ~11 seconds!
const UPGRADE_CONFIGS = {
    autoMove: {
        property: 'autoMoveDelay',
        name: 'Авто-ход',
        unit: 'с',
        enhancement: null,
        baseCost: 100,      // v2: was 300, now very accessible
        growthRate: 1.5,    // v2: was 1.7, smoother curve
        step: null,         // special: variable step (500ms then 100ms)
        min: 50,            // v2: was 100, endgame goes FAST
        max: 3000,          // v2: was 5000, starts at 3000 now
        getValue: () => (PlayerData.autoMoveDelay / 1000).toFixed(1),
        getLevel: () => {
            // 3000 -> 500 (5 steps of 500ms), then 500 -> 50 (5 steps of ~90ms)
            if (PlayerData.autoMoveDelay >= 500) {
                return Math.round((3000 - PlayerData.autoMoveDelay) / 500);
            }
            return 5 + Math.round((500 - PlayerData.autoMoveDelay) / 90);
        },
        getMaxLevel: () => 10  // v2: fewer levels, each more impactful
    },
    bombChance: {
        property: 'bombChance',
        name: 'Шанс бомбы',
        unit: '%',
        enhancement: null,
        baseCost: 100,      // v2: was 400
        growthRate: 1.5,    // v2: was 1.6
        step: 5,
        min: 15,            // v2: starts at 15% now
        max: 50,
        getValue: () => PlayerData.bombChance,
        getLevel: () => (PlayerData.bombChance - 15) / 5,
        getMaxLevel: () => (50 - 15) / 5
    },
    bombRadius: {
        property: 'bombRadius',
        name: 'Радиус',
        unit: '',
        enhancement: null,
        baseCost: 400,      // v2: was 1000, big impact upgrade
        growthRate: 2.0,    // v2: was 2.5
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
        baseCost: 15,       // v2: VERY cheap! First buy in ~15 seconds
        growthRate: 1.15,   // v2: was 1.12, slightly steeper
        step: 3,            // v2: was 5, more granular progression
        min: 15,            // v2: starts at 15%
        max: 100,
        getValue: () => PlayerData.bronzeChance,
        getLevel: () => Math.floor((PlayerData.bronzeChance - 15) / 3),
        getMaxLevel: () => Math.floor((100 - 15) / 3)
    },
    silver: {
        property: 'silverChance',
        name: 'Серебро',
        unit: '%',
        enhancement: ENHANCEMENT.SILVER,
        baseCost: 25,       // v2: was 80
        growthRate: 1.18,   // v2: was 1.14, steeper for late game
        step: 3,            // v2: was 4
        min: 8,             // v2: starts at 8%
        max: 100,
        getValue: () => PlayerData.silverChance,
        getLevel: () => Math.floor((PlayerData.silverChance - 8) / 3),
        getMaxLevel: () => Math.ceil((100 - 8) / 3)
    },
    gold: {
        property: 'goldChance',
        name: 'Золото',
        unit: '%',
        enhancement: ENHANCEMENT.GOLD,
        baseCost: 50,       // v2: was 150
        growthRate: 1.20,   // v2: was 1.16
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
        baseCost: 100,      // v2: was 300
        growthRate: 1.22,   // v2: was 1.18
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
        baseCost: 200,      // v2: was 600
        growthRate: 1.26,   // v2: was 1.20, steeper for endgame
        step: 2,            // v2: was 1, faster early rainbow
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
        baseCost: 400,      // v2: was 1500
        growthRate: 1.30,   // v2: was 1.22, endgame scaling
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
        baseCost: 800,      // v2: was 3000
        growthRate: 1.35,   // v2: was 1.25, very steep endgame
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
    return PlayerData[config.property] >= config.max ||
           (config.property === 'autoMoveDelay' && PlayerData.autoMoveDelay <= config.min);
}

function performUpgrade(config) {
    if (isMaxed(config)) return false;

    const cost = getUpgradeCost(config);
    if (PlayerData.currency < cost) return false;

    PlayerData.currency -= cost;

    // Special handling for autoMove (decreases instead of increases)
    if (config.property === 'autoMoveDelay') {
        // v2: 3000->500 in 500ms steps, then 500->50 in 90ms steps
        const step = PlayerData.autoMoveDelay > 500 ? 500 : 90;
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
export const getAutoMoveStep = () => PlayerData.autoMoveDelay > 500 ? 500 : 90; // v2: 90ms for fine-tuning
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
