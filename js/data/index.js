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
    resetPlayerData
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
    getPrestigeMoneyMultCost,
    getPrestigeTiersCost,
    getPrestigeColorsCost,
    getPrestigeArenaCost,
    upgradePrestigeMoneyMult,
    upgradePrestigeTiers,
    upgradePrestigeColors,
    upgradePrestigeArena,
    AUTO_BUY_COST,
    buyAutoBuyAutoMove,
    buyAutoBuyBombChance,
    buyAutoBuyBombRadius,
    buyAutoBuyBronze,
    buyAutoBuySilver,
    buyAutoBuyGold,
    buyAutoBuyCrystal,
    buyAutoBuyRainbow,
    buyAutoBuyPrismatic,
    buyAutoBuyCelestial
} from './prestige.js';

// Upgrades
export {
    getBronzeLevel,
    getBronzeUpgradeCost,
    upgradeBronze,
    getSilverLevel,
    getSilverUpgradeCost,
    upgradeSilver,
    getGoldLevel,
    getGoldUpgradeCost,
    upgradeGold,
    getCrystalLevel,
    getCrystalUpgradeCost,
    upgradeCrystal,
    getRainbowLevel,
    getRainbowUpgradeCost,
    upgradeRainbow,
    getPrismaticLevel,
    getPrismaticUpgradeCost,
    upgradePrismatic,
    getCelestialLevel,
    getCelestialUpgradeCost,
    upgradeCelestial,
    getAutoMoveLevel,
    getAutoMoveUpgradeCost,
    getAutoMoveStep,
    upgradeAutoMove,
    getBombChanceLevel,
    getBombChanceUpgradeCost,
    upgradeBombChance,
    getBombRadiusLevel,
    getBombRadiusUpgradeCost,
    upgradeBombRadius,
    processAutoBuys
} from './upgrades.js';

// Upgrade data configurations
export {
    getRegularUpgrades,
    getPrestigeUpgrades,
    getAutoBuyItems
} from './upgradesData.js';
