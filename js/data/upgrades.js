// upgrades.js - Regular upgrades logic (DRY version)

import { PlayerData, savePlayerData } from './playerData.js';
import { GameSettings } from './gameSettings.js';

// ========== UPGRADE CONFIGURATIONS ==========

// Configuration for all upgrades: { property, baseCost, growthRate, step, min, max, getLevel }
const UPGRADE_CONFIGS = {
    bronze: {
        property: 'bronzeChance',
        baseCost: 100,
        growthRate: 1.15,
        step: 5,
        min: 5,
        max: 100,
        getLevel: () => (PlayerData.bronzeChance - 5) / 5
    },
    silver: {
        property: 'silverChance',
        baseCost: 150,
        growthRate: 1.18,
        step: 4,
        min: 1,
        max: 100,
        getLevel: () => Math.floor((PlayerData.silverChance - 1) / 4)
    },
    gold: {
        property: 'goldChance',
        baseCost: 250,
        growthRate: 1.20,
        step: 3,
        min: 0,
        max: 100,
        getLevel: () => Math.floor(PlayerData.goldChance / 3)
    },
    crystal: {
        property: 'crystalChance',
        baseCost: 500,
        growthRate: 1.22,
        step: 2,
        min: 0,
        max: 100,
        getLevel: () => Math.floor(PlayerData.crystalChance / 2)
    },
    rainbow: {
        property: 'rainbowChance',
        baseCost: 1000,
        growthRate: 1.25,
        step: 1,
        min: 0,
        max: 100,
        getLevel: () => PlayerData.rainbowChance
    },
    prismatic: {
        property: 'prismaticChance',
        baseCost: 2500,
        growthRate: 1.28,
        step: 1,
        min: 0,
        max: 100,
        getLevel: () => PlayerData.prismaticChance
    },
    celestial: {
        property: 'celestialChance',
        baseCost: 5000,
        growthRate: 1.30,
        step: 1,
        min: 0,
        max: 100,
        getLevel: () => PlayerData.celestialChance
    },
    bombChance: {
        property: 'bombChance',
        baseCost: 600,
        growthRate: 1.8,
        step: 5,
        min: 10,
        max: 50,
        getLevel: () => (PlayerData.bombChance - 10) / 5
    },
    bombRadius: {
        property: 'bombRadius',
        baseCost: 1500,
        growthRate: 3.0,
        step: 1,
        min: 1,
        max: 3,
        getLevel: () => PlayerData.bombRadius - 1
    }
};

// Auto-move has special logic
const AUTO_MOVE_CONFIG = {
    property: 'autoMoveDelay',
    baseCost: 500,
    growthRate: 2.0,
    min: 100,
    max: 5000
};

// ========== GENERIC UPGRADE FUNCTIONS ==========

function getUpgradeCost(config) {
    const level = config.getLevel();
    return Math.floor(config.baseCost * Math.pow(config.growthRate, level) * GameSettings.priceMultiplier);
}

function performUpgrade(config) {
    const cost = getUpgradeCost(config);
    const currentValue = PlayerData[config.property];

    if (PlayerData.currency >= cost && currentValue < config.max) {
        PlayerData.currency -= cost;
        PlayerData[config.property] = Math.min(config.max, currentValue + config.step);
        savePlayerData();
        return true;
    }
    return false;
}

// ========== EXPORTED UPGRADE FUNCTIONS ==========

// Bronze
export const getBronzeLevel = () => UPGRADE_CONFIGS.bronze.getLevel();
export const getBronzeUpgradeCost = () => getUpgradeCost(UPGRADE_CONFIGS.bronze);
export const upgradeBronze = () => performUpgrade(UPGRADE_CONFIGS.bronze);

// Silver
export const getSilverLevel = () => UPGRADE_CONFIGS.silver.getLevel();
export const getSilverUpgradeCost = () => getUpgradeCost(UPGRADE_CONFIGS.silver);
export const upgradeSilver = () => performUpgrade(UPGRADE_CONFIGS.silver);

// Gold
export const getGoldLevel = () => UPGRADE_CONFIGS.gold.getLevel();
export const getGoldUpgradeCost = () => getUpgradeCost(UPGRADE_CONFIGS.gold);
export const upgradeGold = () => performUpgrade(UPGRADE_CONFIGS.gold);

// Crystal
export const getCrystalLevel = () => UPGRADE_CONFIGS.crystal.getLevel();
export const getCrystalUpgradeCost = () => getUpgradeCost(UPGRADE_CONFIGS.crystal);
export const upgradeCrystal = () => performUpgrade(UPGRADE_CONFIGS.crystal);

// Rainbow
export const getRainbowLevel = () => UPGRADE_CONFIGS.rainbow.getLevel();
export const getRainbowUpgradeCost = () => getUpgradeCost(UPGRADE_CONFIGS.rainbow);
export const upgradeRainbow = () => performUpgrade(UPGRADE_CONFIGS.rainbow);

// Prismatic
export const getPrismaticLevel = () => UPGRADE_CONFIGS.prismatic.getLevel();
export const getPrismaticUpgradeCost = () => getUpgradeCost(UPGRADE_CONFIGS.prismatic);
export const upgradePrismatic = () => performUpgrade(UPGRADE_CONFIGS.prismatic);

// Celestial
export const getCelestialLevel = () => UPGRADE_CONFIGS.celestial.getLevel();
export const getCelestialUpgradeCost = () => getUpgradeCost(UPGRADE_CONFIGS.celestial);
export const upgradeCelestial = () => performUpgrade(UPGRADE_CONFIGS.celestial);

// Bomb Chance
export const getBombChanceLevel = () => UPGRADE_CONFIGS.bombChance.getLevel();
export const getBombChanceUpgradeCost = () => getUpgradeCost(UPGRADE_CONFIGS.bombChance);
export const upgradeBombChance = () => performUpgrade(UPGRADE_CONFIGS.bombChance);

// Bomb Radius
export const getBombRadiusLevel = () => UPGRADE_CONFIGS.bombRadius.getLevel();
export const getBombRadiusUpgradeCost = () => getUpgradeCost(UPGRADE_CONFIGS.bombRadius);
export const upgradeBombRadius = () => performUpgrade(UPGRADE_CONFIGS.bombRadius);

// ========== AUTO-MOVE (special logic) ==========

export function getAutoMoveLevel() {
    if (PlayerData.autoMoveDelay >= 500) {
        return Math.round((5000 - PlayerData.autoMoveDelay) / 500);
    }
    return 9 + Math.round((500 - PlayerData.autoMoveDelay) / 100);
}

export function getAutoMoveUpgradeCost() {
    const level = getAutoMoveLevel();
    return Math.floor(AUTO_MOVE_CONFIG.baseCost * Math.pow(AUTO_MOVE_CONFIG.growthRate, level) * GameSettings.priceMultiplier);
}

export function getAutoMoveStep() {
    return PlayerData.autoMoveDelay > 500 ? 500 : 100;
}

export function upgradeAutoMove() {
    const cost = getAutoMoveUpgradeCost();
    const step = getAutoMoveStep();
    if (PlayerData.currency >= cost && PlayerData.autoMoveDelay > AUTO_MOVE_CONFIG.min) {
        PlayerData.currency -= cost;
        PlayerData.autoMoveDelay -= step;
        savePlayerData();
        return true;
    }
    return false;
}

// ========== AUTO-BUY PROCESSOR ==========

// Auto-buy configuration: { autoBuyKey, upgradeKey, getCost, canUpgrade, upgrade }
const AUTO_BUY_CONFIGS = [
    {
        autoBuyKey: 'autoBuyAutoMove',
        canUpgrade: () => PlayerData.autoMoveDelay > 100,
        getCost: getAutoMoveUpgradeCost,
        upgrade: upgradeAutoMove
    },
    {
        autoBuyKey: 'autoBuyBombChance',
        canUpgrade: () => PlayerData.bombChance < 50,
        getCost: getBombChanceUpgradeCost,
        upgrade: upgradeBombChance
    },
    {
        autoBuyKey: 'autoBuyBombRadius',
        canUpgrade: () => PlayerData.bombRadius < 3,
        getCost: getBombRadiusUpgradeCost,
        upgrade: upgradeBombRadius
    },
    {
        autoBuyKey: 'autoBuyBronze',
        canUpgrade: () => PlayerData.bronzeChance < 100,
        getCost: getBronzeUpgradeCost,
        upgrade: upgradeBronze
    },
    {
        autoBuyKey: 'autoBuySilver',
        canUpgrade: () => PlayerData.silverChance < 100,
        getCost: getSilverUpgradeCost,
        upgrade: upgradeSilver
    },
    {
        autoBuyKey: 'autoBuyGold',
        canUpgrade: () => PlayerData.goldChance < 100,
        getCost: getGoldUpgradeCost,
        upgrade: upgradeGold
    },
    {
        autoBuyKey: 'autoBuyCrystal',
        canUpgrade: () => PlayerData.crystalChance < 100,
        getCost: getCrystalUpgradeCost,
        upgrade: upgradeCrystal
    },
    {
        autoBuyKey: 'autoBuyRainbow',
        canUpgrade: () => PlayerData.rainbowChance < 100,
        getCost: getRainbowUpgradeCost,
        upgrade: upgradeRainbow
    },
    {
        autoBuyKey: 'autoBuyPrismatic',
        canUpgrade: () => PlayerData.prismaticChance < 100,
        getCost: getPrismaticUpgradeCost,
        upgrade: upgradePrismatic
    },
    {
        autoBuyKey: 'autoBuyCelestial',
        canUpgrade: () => PlayerData.celestialChance < 100,
        getCost: getCelestialUpgradeCost,
        upgrade: upgradeCelestial
    }
];

export function processAutoBuys() {
    let purchased = false;

    for (const config of AUTO_BUY_CONFIGS) {
        if (PlayerData[config.autoBuyKey] && config.canUpgrade()) {
            if (PlayerData.currency >= config.getCost()) {
                config.upgrade();
                purchased = true;
            }
        }
    }

    return purchased;
}
