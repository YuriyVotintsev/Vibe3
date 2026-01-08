// upgrades.js - Regular upgrades logic (DRY version)

import { PlayerData, savePlayerData } from './playerData.js';
import { GameSettings } from './gameSettings.js';
import { ENHANCEMENT } from './enhancements.js';
import { getCostReductionMultiplier, getGrowthReductionAmount } from './prestige.js';

// ========== UPGRADE CONFIGURATIONS ==========

// Configuration for all upgrades
// property: PlayerData key, name: UI display, unit: value suffix
// enhancement: required tier (null = always visible)
// === UPGRADE BALANCE v4: High income economy ===
// Gem multipliers: 1, 5, 20, 100, 500, 2000, 10000, 50000
// Income scales ~10-25x higher than v3
const UPGRADE_CONFIGS = {
    autoMove: {
        property: 'autoMoveDelay',
        name: 'Скорость автохода',
        unit: 'с',
        enhancement: null,
        baseCost: 500,
        growthRate: 1.236,
        step: null,         // special: 10% reduction per level
        min: 10,            // 0.01s minimum (practically infinite)
        max: 5000,
        getValue: () => (PlayerData.autoMoveDelay / 1000).toFixed(2),
        getNextValue: () => (Math.max(10, PlayerData.autoMoveDelay * 0.9) / 1000).toFixed(2),
        getLevel: () => {
            const delay = PlayerData.autoMoveDelay;
            if (delay >= 5000) return 0;
            return Math.round(Math.log(5000 / delay) / Math.log(1 / 0.9));
        },
        getMaxLevel: () => '∞'
    },
    bombChance: {
        property: 'bombChance',
        name: 'Шанс бомбы',
        unit: '%',
        enhancement: null,
        baseCost: 400,      // v4: ~2.5x increase
        growthRate: 1.5,
        step: 5,
        min: 0,
        max: 50,
        getValue: () => PlayerData.bombChance,
        getLevel: () => PlayerData.bombChance / 5,
        getMaxLevel: () => 50 / 5
    },
    bombRadius: {
        property: 'bombRadius',
        name: 'Радиус бомбы',
        unit: '',
        enhancement: null,
        baseCost: 2000,     // v4: ~2.5x increase
        growthRate: 2.5,
        step: 1,
        min: 1,
        max: 3,
        getValue: () => PlayerData.bombRadius,
        getLevel: () => PlayerData.bombRadius - 1,
        getMaxLevel: () => 3 - 1
    },
    bronze: {
        property: 'bronzeChance',
        name: 'обычн.→бронза',
        unit: '%',
        enhancement: ENHANCEMENT.BRONZE,
        baseCost: 20,       // v4: unchanged! First buy stays quick
        growthRate: 1.12,   // v4: unchanged! Gentle curve
        step: 5,
        min: 0,
        max: 100,
        getValue: () => PlayerData.bronzeChance,
        getLevel: () => PlayerData.bronzeChance / 5,
        getMaxLevel: () => 100 / 5
    },
    silver: {
        property: 'silverChance',
        name: 'бронза→серебро',
        unit: '%',
        enhancement: ENHANCEMENT.SILVER,
        baseCost: 200,      // v4: 4x (income ~4x higher with bronze)
        growthRate: 1.18,
        step: 4,
        min: 0,
        max: 100,
        getValue: () => PlayerData.silverChance,
        getLevel: () => Math.floor(PlayerData.silverChance / 4),
        getMaxLevel: () => 100 / 4
    },
    gold: {
        property: 'goldChance',
        name: 'серебро→золото',
        unit: '%',
        enhancement: ENHANCEMENT.GOLD,
        baseCost: 600,      // v4: 6x (income ~6x with silver)
        growthRate: 1.20,
        step: 3,
        min: 0,
        max: 100,
        getValue: () => PlayerData.goldChance,
        getLevel: () => Math.floor(PlayerData.goldChance / 3),
        getMaxLevel: () => Math.ceil(100 / 3)
    },
    crystal: {
        property: 'crystalChance',
        name: 'золото→кристалл',
        unit: '%',
        enhancement: ENHANCEMENT.CRYSTAL,
        baseCost: 2000,     // v4: 10x (income ~10x with gold)
        growthRate: 1.22,
        step: 2,
        min: 0,
        max: 100,
        getValue: () => PlayerData.crystalChance,
        getLevel: () => Math.floor(PlayerData.crystalChance / 2),
        getMaxLevel: () => 100 / 2
    },
    rainbow: {
        property: 'rainbowChance',
        name: 'кристалл→радуга',
        unit: '%',
        enhancement: ENHANCEMENT.RAINBOW,
        baseCost: 5000,     // v4: 12x (income ~12x with crystal)
        growthRate: 1.25,
        step: 2,
        min: 0,
        max: 100,
        getValue: () => PlayerData.rainbowChance,
        getLevel: () => Math.floor(PlayerData.rainbowChance / 2),
        getMaxLevel: () => 100 / 2
    },
    prismatic: {
        property: 'prismaticChance',
        name: 'радуга→призма',
        unit: '%',
        enhancement: ENHANCEMENT.PRISMATIC,
        baseCost: 15000,    // v4: 18x (income ~18x with rainbow)
        growthRate: 1.28,
        step: 1,
        min: 0,
        max: 100,
        getValue: () => PlayerData.prismaticChance,
        getLevel: () => PlayerData.prismaticChance,
        getMaxLevel: () => 100
    },
    celestial: {
        property: 'celestialChance',
        name: 'призма→небесный',
        unit: '%',
        enhancement: ENHANCEMENT.CELESTIAL,
        baseCost: 50000,    // v4: 33x (income ~25x with prismatic)
        growthRate: 1.30,
        step: 1,
        min: 0,
        max: 100,
        getValue: () => PlayerData.celestialChance,
        getLevel: () => PlayerData.celestialChance,
        getMaxLevel: () => 100
    },
    comboDecay: {
        property: 'comboDecayReduction',
        name: 'Угасание комбо',
        unit: '%/с',
        enhancement: null,  // Always visible
        baseCost: 100,
        growthRate: 1.5,
        step: 10,           // 10% multiplicative reduction per level
        min: 0,
        max: Infinity,      // Infinite upgrade
        getValue: () => {
            // Base decay 25%/s * 0.9^level
            const level = PlayerData.comboDecayReduction / 10;
            return (25 * Math.pow(0.9, level)).toFixed(2);
        },
        getNextValue: () => {
            const level = PlayerData.comboDecayReduction / 10;
            return (25 * Math.pow(0.9, level + 1)).toFixed(2);
        },
        getLevel: () => PlayerData.comboDecayReduction / 10,
        getMaxLevel: () => '∞'
    }
};

// Export configs for UI generation
export { UPGRADE_CONFIGS };

// ========== GENERIC UPGRADE FUNCTIONS ==========

// Enhanced gem upgrade keys that get growth reduction
const ENHANCED_GEM_KEYS = ['bronze', 'silver', 'gold', 'crystal', 'rainbow', 'prismatic', 'celestial'];

function getUpgradeCost(config) {
    const level = config.getLevel();

    // Apply growth reduction to enhanced gem upgrades (min 1.05)
    let growthRate = config.growthRate;
    const configKey = Object.keys(UPGRADE_CONFIGS).find(k => UPGRADE_CONFIGS[k] === config);
    if (ENHANCED_GEM_KEYS.includes(configKey)) {
        const reduction = getGrowthReductionAmount();
        growthRate = Math.max(1.05, growthRate - reduction);
    }

    // Apply cost reduction multiplier
    const costReduction = getCostReductionMultiplier();

    return Math.floor(config.baseCost * Math.pow(growthRate, level) * GameSettings.priceMultiplier * costReduction);
}

function isMaxed(config) {
    // Infinite upgrades never max out
    if (config.max === Infinity) return false;
    // autoMove is special: decreases from max to min
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

    // Special handling for autoMove (10% reduction per level)
    if (config.property === 'autoMoveDelay') {
        const newDelay = Math.round(PlayerData.autoMoveDelay * 0.9);
        PlayerData.autoMoveDelay = Math.max(10, newDelay);
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

    // Calculate next value: use config.getNextValue if exists, otherwise compute from step
    const getNextValue = () => {
        if (config.getNextValue) return config.getNextValue();
        // Default: current + step (capped at max)
        const current = PlayerData[config.property];
        const next = Math.min(config.max, current + config.step);
        return next;
    };

    return {
        key: configKey,
        config,
        getName: () => config.name,
        getValue: () => {
            const current = config.getValue();
            const unit = config.unit;
            if (isMaxed(config)) return `${current}${unit}`;
            const next = getNextValue();
            return `${current}${unit} (→${next}${unit})`;
        },
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
export const getAutoMoveStep = () => Math.round(PlayerData.autoMoveDelay * 0.1); // 10% of current
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
    celestial: 'autoBuyCelestial',
    comboDecay: 'autoBuyComboDecay'
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
