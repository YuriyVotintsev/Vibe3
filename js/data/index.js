// data/index.js - Re-export all data modules for convenient imports

// Constants
export {
    ALL_GEM_COLORS,
    COLOR_NAMES,
    BOARD_TOTAL_SIZE,
    BOARD_OFFSET_X,
    BOARD_OFFSET_Y,
    SWAP_DURATION,
    GEM_STATE,
    JS_VERSION,
    formatNumber
} from './constants.js';

// Player data
export {
    PlayerData,
    savePlayerData,
    loadPlayerData,
    resetPlayerData,
    on,
    off,
    getDefaultValue,
    getPrestigeResetKeys
} from './playerData.js';

// Enhancements
export {
    ENHANCEMENT,
    ENHANCEMENT_TIER,
    ENHANCEMENT_MULTIPLIERS,
    ENHANCEMENT_NAMES,
    getUnlockedTiers,
    isTierUnlocked,
    rollEnhancement
} from './enhancements.js';

// Game settings
export { GameSettings } from './gameSettings.js';

// Prestige
export {
    getMoneyMultiplier,
    getBoardSize,
    getColorCount,
    getPrestigeCoinsFromCurrency,
    getCurrencyForCoins,
    getCurrencyForNextCoin,
    getProgressToNextCoin,
    performPrestige,
    getPrestigeTiersCost,
    getPrestigeColorsCost,
    getPrestigeArenaCost,
    upgradePrestigeTiers,
    upgradePrestigeColors,
    upgradePrestigeArena,
    // New early-game prestige upgrades
    getStartingCapital,
    getStartingCapitalCost,
    upgradeStartingCapital,
    getCostReductionMultiplier,
    getCostReductionCost,
    upgradeCostReduction,
    getGrowthReductionAmount,
    getGrowthReductionCost,
    upgradeGrowthReduction,
    // Combo prestige upgrades
    getComboGainBonus,
    getComboGainCost,
    upgradeComboGain,
    getComboEffectMultiplier,
    getComboEffectCost,
    upgradeComboEffect,
    // Auto-buy
    getAutoBuyCost,
    AUTO_BUY_COSTS,
    buyAutoBuyAutoMove,
    buyAutoBuyBombChance,
    buyAutoBuyBombRadius,
    buyAutoBuyBronze,
    buyAutoBuySilver,
    buyAutoBuyGold,
    buyAutoBuyCrystal,
    buyAutoBuyRainbow,
    buyAutoBuyPrismatic,
    buyAutoBuyCelestial,
    buyAutoBuyComboDecay
} from './prestige.js';

// Upgrades - configs and factories
export {
    UPGRADE_CONFIGS,
    AUTO_BUY_KEYS,
    createUpgradeForUI,
    processAutoBuys,
    // Backward compatible exports
    getBronzeLevel, getBronzeUpgradeCost, upgradeBronze,
    getSilverLevel, getSilverUpgradeCost, upgradeSilver,
    getGoldLevel, getGoldUpgradeCost, upgradeGold,
    getCrystalLevel, getCrystalUpgradeCost, upgradeCrystal,
    getRainbowLevel, getRainbowUpgradeCost, upgradeRainbow,
    getPrismaticLevel, getPrismaticUpgradeCost, upgradePrismatic,
    getCelestialLevel, getCelestialUpgradeCost, upgradeCelestial,
    getAutoMoveLevel, getAutoMoveUpgradeCost, getAutoMoveStep, upgradeAutoMove,
    getBombChanceLevel, getBombChanceUpgradeCost, upgradeBombChance,
    getBombRadiusLevel, getBombRadiusUpgradeCost, upgradeBombRadius
} from './upgrades.js';

// Upgrade data configurations
export {
    getRegularUpgrades,
    getPrestigeUpgrades,
    getAutoBuyItems
} from './upgradesData.js';
