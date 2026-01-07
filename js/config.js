// All available gem colors (20 total)
export const ALL_GEM_COLORS = [
    0xe74c3c, // 1. red
    0x3498db, // 2. blue
    0x27ae60, // 3. green
    0xf1c40f, // 4. yellow
    0x9b59b6, // 5. purple
    0xe67e22, // 6. orange
    0x1abc9c, // 7. turquoise
    0xe91e63, // 8. pink
    0x00bcd4, // 9. cyan
    0x8bc34a, // 10. lime
    0xff5722, // 11. deep orange
    0x607d8b, // 12. blue grey
    0x795548, // 13. brown
    0x9c27b0, // 14. deep purple
    0x3f51b5, // 15. indigo
    0x009688, // 16. teal
    0xcddc39, // 17. yellow-green
    0xffc107, // 18. amber
    0x03a9f4, // 19. light blue
    0xf44336  // 20. bright red
];

// Color names for UI
export const COLOR_NAMES = [
    'Красный', 'Синий', 'Зелёный', 'Жёлтый', 'Фиолетовый', 'Оранжевый',
    'Бирюзовый', 'Розовый', 'Голубой', 'Лаймовый', 'Рыжий', 'Серый',
    'Коричневый', 'Пурпурный', 'Индиго', 'Тиловый', 'Салатовый', 'Янтарный',
    'Небесный', 'Алый'
];

// Format large numbers with scientific notation (>10000)
export function formatNumber(n) {
    if (n < 10000) return Math.floor(n).toString();
    if (n < 1e6) return (n / 1e3).toFixed(1) + 'K';
    if (n < 1e9) return (n / 1e6).toFixed(2) + 'M';
    if (n < 1e12) return (n / 1e9).toFixed(2) + 'B';
    return n.toExponential(2);
}

// Player persistent data
export const PlayerData = {
    currency: 0,          // earned from matches, spent on upgrades
    totalEarned: 0,       // lifetime currency earned
    autoMoveDelay: 5000,  // ms between auto-moves (starts at 5 seconds)
    bombChance: 10,       // % chance to spawn bomb on manual match (starts at 10%)
    bombRadius: 1,        // explosion radius (starts at 1)
    // Enhanced gem spawn chances (in %) - CASCADING: each tier rolls from previous
    bronzeChance: 5,      // chance for bronze gem (x2) - from normal
    silverChance: 1,      // chance for silver gem (x5) - from bronze
    goldChance: 0,        // chance for gold gem (x15) - from silver
    crystalChance: 0,     // chance for crystal gem (x50) - from gold
    rainbowChance: 0,     // chance for rainbow gem (x200) - from crystal
    prismaticChance: 0,   // chance for prismatic gem (x1000) - from rainbow
    celestialChance: 0,   // chance for celestial gem (x5000) - from prismatic
    // Prestige system
    prestigeCurrency: 0,  // prestige coins
    prestigeMoneyMult: 0, // money multiplier level (2^level)
    prestigeTiers: 0,     // unlocked tier levels (0=3 tiers, 4=7 tiers)
    prestigeColors: 0,    // color reduction level (0=6 colors, 3=3 colors)
    prestigeArena: 0      // arena size level (0=5x5, 4=9x9)
};

// Enhanced gem types and multipliers (7 tiers total)
export const ENHANCEMENT = {
    NONE: 'none',
    BRONZE: 'bronze',
    SILVER: 'silver',
    GOLD: 'gold',
    CRYSTAL: 'crystal',
    RAINBOW: 'rainbow',
    PRISMATIC: 'prismatic',
    CELESTIAL: 'celestial'
};

// Tier index for unlock checking (0-based)
export const ENHANCEMENT_TIER = {
    [ENHANCEMENT.BRONZE]: 0,
    [ENHANCEMENT.SILVER]: 1,
    [ENHANCEMENT.GOLD]: 2,
    [ENHANCEMENT.CRYSTAL]: 3,
    [ENHANCEMENT.RAINBOW]: 4,
    [ENHANCEMENT.PRISMATIC]: 5,
    [ENHANCEMENT.CELESTIAL]: 6
};

export const ENHANCEMENT_MULTIPLIERS = {
    [ENHANCEMENT.NONE]: 1,
    [ENHANCEMENT.BRONZE]: 2,
    [ENHANCEMENT.SILVER]: 5,
    [ENHANCEMENT.GOLD]: 15,
    [ENHANCEMENT.CRYSTAL]: 50,
    [ENHANCEMENT.RAINBOW]: 200,
    [ENHANCEMENT.PRISMATIC]: 1000,
    [ENHANCEMENT.CELESTIAL]: 5000
};

export const ENHANCEMENT_NAMES = {
    [ENHANCEMENT.BRONZE]: 'Бронзовый',
    [ENHANCEMENT.SILVER]: 'Серебряный',
    [ENHANCEMENT.GOLD]: 'Золотой',
    [ENHANCEMENT.CRYSTAL]: 'Кристальный',
    [ENHANCEMENT.RAINBOW]: 'Радужный',
    [ENHANCEMENT.PRISMATIC]: 'Призматический',
    [ENHANCEMENT.CELESTIAL]: 'Небесный'
};

// Get number of unlocked tiers (3 base + prestigeTiers upgrades, max 7)
export function getUnlockedTiers() {
    return Math.min(7, 3 + PlayerData.prestigeTiers);
}

// Check if a tier is unlocked
export function isTierUnlocked(tier) {
    return ENHANCEMENT_TIER[tier] < getUnlockedTiers();
}

// Roll for gem enhancement when spawning (CASCADING system)
// Each tier can only upgrade from the previous tier
// e.g., if bronze=50%, silver=50%, actual silver chance = 25% (50% * 50%)
export function rollEnhancement() {
    const unlockedTiers = getUnlockedTiers();

    // Roll for bronze (tier 0) - from normal gem
    if (unlockedTiers < 1 || Phaser.Math.Between(1, 100) > PlayerData.bronzeChance) {
        return ENHANCEMENT.NONE;
    }
    // Got bronze! Roll for silver upgrade (tier 1)
    if (unlockedTiers < 2 || PlayerData.silverChance <= 0 || Phaser.Math.Between(1, 100) > PlayerData.silverChance) {
        return ENHANCEMENT.BRONZE;
    }
    // Got silver! Roll for gold upgrade (tier 2)
    if (unlockedTiers < 3 || PlayerData.goldChance <= 0 || Phaser.Math.Between(1, 100) > PlayerData.goldChance) {
        return ENHANCEMENT.SILVER;
    }
    // Got gold! Roll for crystal upgrade (tier 3)
    if (unlockedTiers < 4 || PlayerData.crystalChance <= 0 || Phaser.Math.Between(1, 100) > PlayerData.crystalChance) {
        return ENHANCEMENT.GOLD;
    }
    // Got crystal! Roll for rainbow upgrade (tier 4)
    if (unlockedTiers < 5 || PlayerData.rainbowChance <= 0 || Phaser.Math.Between(1, 100) > PlayerData.rainbowChance) {
        return ENHANCEMENT.CRYSTAL;
    }
    // Got rainbow! Roll for prismatic upgrade (tier 5)
    if (unlockedTiers < 6 || PlayerData.prismaticChance <= 0 || Phaser.Math.Between(1, 100) > PlayerData.prismaticChance) {
        return ENHANCEMENT.RAINBOW;
    }
    // Got prismatic! Roll for celestial upgrade (tier 6)
    if (unlockedTiers < 7 || PlayerData.celestialChance <= 0 || Phaser.Math.Between(1, 100) > PlayerData.celestialChance) {
        return ENHANCEMENT.PRISMATIC;
    }
    // Got celestial!
    return ENHANCEMENT.CELESTIAL;
}

// Bronze chance upgrade (5% -> 100%, +5% per upgrade = 19 upgrades)
export function getBronzeLevel() {
    return (PlayerData.bronzeChance - 5) / 5;
}

export function getBronzeUpgradeCost() {
    const level = getBronzeLevel();
    return Math.floor(100 * Math.pow(1.15, level) * GameSettings.priceMultiplier);
}

export function upgradeBronze() {
    const cost = getBronzeUpgradeCost();
    if (PlayerData.currency >= cost && PlayerData.bronzeChance < 100) {
        PlayerData.currency -= cost;
        PlayerData.bronzeChance += 5;
        savePlayerData();
        return true;
    }
    return false;
}

// Silver chance upgrade (1% -> 100%, +4% per upgrade = 25 upgrades)
export function getSilverLevel() {
    return Math.floor((PlayerData.silverChance - 1) / 4);
}

export function getSilverUpgradeCost() {
    const level = getSilverLevel();
    return Math.floor(150 * Math.pow(1.18, level) * GameSettings.priceMultiplier);
}

export function upgradeSilver() {
    const cost = getSilverUpgradeCost();
    if (PlayerData.currency >= cost && PlayerData.silverChance < 100) {
        PlayerData.currency -= cost;
        PlayerData.silverChance = Math.min(100, PlayerData.silverChance + 4);
        savePlayerData();
        return true;
    }
    return false;
}

// Gold chance upgrade (0% -> 100%, +3% per upgrade = 34 upgrades)
export function getGoldLevel() {
    return Math.floor(PlayerData.goldChance / 3);
}

export function getGoldUpgradeCost() {
    const level = getGoldLevel();
    return Math.floor(250 * Math.pow(1.20, level) * GameSettings.priceMultiplier);
}

export function upgradeGold() {
    const cost = getGoldUpgradeCost();
    if (PlayerData.currency >= cost && PlayerData.goldChance < 100) {
        PlayerData.currency -= cost;
        PlayerData.goldChance = Math.min(100, PlayerData.goldChance + 3);
        savePlayerData();
        return true;
    }
    return false;
}

// Crystal chance upgrade (0% -> 100%, +2% per upgrade = 50 upgrades)
export function getCrystalLevel() {
    return Math.floor(PlayerData.crystalChance / 2);
}

export function getCrystalUpgradeCost() {
    const level = getCrystalLevel();
    return Math.floor(500 * Math.pow(1.22, level) * GameSettings.priceMultiplier);
}

export function upgradeCrystal() {
    const cost = getCrystalUpgradeCost();
    if (PlayerData.currency >= cost && PlayerData.crystalChance < 100) {
        PlayerData.currency -= cost;
        PlayerData.crystalChance = Math.min(100, PlayerData.crystalChance + 2);
        savePlayerData();
        return true;
    }
    return false;
}

// Rainbow chance upgrade (0% -> 100%, +1% per upgrade = 100 upgrades)
export function getRainbowLevel() {
    return PlayerData.rainbowChance;
}

export function getRainbowUpgradeCost() {
    const level = getRainbowLevel();
    return Math.floor(1000 * Math.pow(1.25, level) * GameSettings.priceMultiplier);
}

export function upgradeRainbow() {
    const cost = getRainbowUpgradeCost();
    if (PlayerData.currency >= cost && PlayerData.rainbowChance < 100) {
        PlayerData.currency -= cost;
        PlayerData.rainbowChance = Math.min(100, PlayerData.rainbowChance + 1);
        savePlayerData();
        return true;
    }
    return false;
}

// Prismatic chance upgrade (0% -> 100%, +1% per upgrade = 100 upgrades)
export function getPrismaticLevel() {
    return PlayerData.prismaticChance;
}

export function getPrismaticUpgradeCost() {
    const level = getPrismaticLevel();
    return Math.floor(2500 * Math.pow(1.28, level) * GameSettings.priceMultiplier);
}

export function upgradePrismatic() {
    const cost = getPrismaticUpgradeCost();
    if (PlayerData.currency >= cost && PlayerData.prismaticChance < 100) {
        PlayerData.currency -= cost;
        PlayerData.prismaticChance = Math.min(100, PlayerData.prismaticChance + 1);
        savePlayerData();
        return true;
    }
    return false;
}

// Celestial chance upgrade (0% -> 100%, +1% per upgrade = 100 upgrades)
export function getCelestialLevel() {
    return PlayerData.celestialChance;
}

export function getCelestialUpgradeCost() {
    const level = getCelestialLevel();
    return Math.floor(5000 * Math.pow(1.30, level) * GameSettings.priceMultiplier);
}

export function upgradeCelestial() {
    const cost = getCelestialUpgradeCost();
    if (PlayerData.currency >= cost && PlayerData.celestialChance < 100) {
        PlayerData.currency -= cost;
        PlayerData.celestialChance = Math.min(100, PlayerData.celestialChance + 1);
        savePlayerData();
        return true;
    }
    return false;
}

// Auto-move timer upgrade
export function getAutoMoveLevel() {
    if (PlayerData.autoMoveDelay >= 500) {
        return Math.round((5000 - PlayerData.autoMoveDelay) / 500);
    } else {
        // After 0.5s, levels continue with 0.1s steps
        return 9 + Math.round((500 - PlayerData.autoMoveDelay) / 100);
    }
}

export function getAutoMoveUpgradeCost() {
    const level = getAutoMoveLevel();
    return Math.floor(500 * Math.pow(2.0, level) * GameSettings.priceMultiplier);
}

export function getAutoMoveStep() {
    // 0.5s steps until 0.5s, then 0.1s steps
    return PlayerData.autoMoveDelay > 500 ? 500 : 100;
}

export function upgradeAutoMove() {
    const cost = getAutoMoveUpgradeCost();
    const step = getAutoMoveStep();
    if (PlayerData.currency >= cost && PlayerData.autoMoveDelay > 100) {
        PlayerData.currency -= cost;
        PlayerData.autoMoveDelay -= step;
        savePlayerData();
        return true;
    }
    return false;
}

// Bomb chance upgrade (10% -> 15% -> 20% ... up to 50%)
export function getBombChanceLevel() {
    return (PlayerData.bombChance - 10) / 5;
}

export function getBombChanceUpgradeCost() {
    const level = getBombChanceLevel();
    return Math.floor(600 * Math.pow(1.8, level) * GameSettings.priceMultiplier);
}

export function upgradeBombChance() {
    const cost = getBombChanceUpgradeCost();
    if (PlayerData.currency >= cost && PlayerData.bombChance < 50) {
        PlayerData.currency -= cost;
        PlayerData.bombChance += 5;
        savePlayerData();
        return true;
    }
    return false;
}

// Bomb radius upgrade (1 -> 2 -> 3, max 3)
export function getBombRadiusLevel() {
    return PlayerData.bombRadius - 1;
}

export function getBombRadiusUpgradeCost() {
    const level = getBombRadiusLevel();
    return Math.floor(1500 * Math.pow(3.0, level) * GameSettings.priceMultiplier);
}

export function upgradeBombRadius() {
    const cost = getBombRadiusUpgradeCost();
    if (PlayerData.currency >= cost && PlayerData.bombRadius < 3) {
        PlayerData.currency -= cost;
        PlayerData.bombRadius += 1;
        savePlayerData();
        return true;
    }
    return false;
}

// ========== PRESTIGE SYSTEM ==========

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
// Coins require: 1st=500, 2nd=1000, 3rd=1500... Nth=N*500
// Total for N coins = 500 * N * (N+1) / 2
export function getPrestigeCoinsFromCurrency(currency) {
    // Solve: 500 * N * (N+1) / 2 <= currency
    // N^2 + N - currency/250 <= 0
    // N = floor((-1 + sqrt(1 + currency/62.5)) / 2)
    if (currency < 500) return 0;
    const n = Math.floor((-1 + Math.sqrt(1 + currency / 62.5)) / 2);
    return Math.max(0, n);
}

// Get total currency required for N prestige coins
export function getCurrencyForCoins(n) {
    return 500 * n * (n + 1) / 2;
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

// Prestige upgrade costs (in prestige coins)
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

// ========== SAVE/LOAD ==========

// Save/Load player data to localStorage
export function savePlayerData() {
    localStorage.setItem('match3_player', JSON.stringify(PlayerData));
}

export function loadPlayerData() {
    const saved = localStorage.getItem('match3_player');
    if (saved) {
        const data = JSON.parse(saved);
        Object.assign(PlayerData, data);
    }
    // Ensure autoMoveDelay has a valid value
    if (!PlayerData.autoMoveDelay || PlayerData.autoMoveDelay < 100) {
        PlayerData.autoMoveDelay = 5000;
    }
    // Ensure bomb properties have valid values
    if (!PlayerData.bombChance) PlayerData.bombChance = 10;
    if (!PlayerData.bombRadius) PlayerData.bombRadius = 1;
    // Ensure enhanced gem properties have valid values
    if (PlayerData.bronzeChance === undefined) PlayerData.bronzeChance = 5;
    if (PlayerData.silverChance === undefined) PlayerData.silverChance = 1;
    if (PlayerData.goldChance === undefined) PlayerData.goldChance = 0;
    if (PlayerData.crystalChance === undefined) PlayerData.crystalChance = 0;
    if (PlayerData.rainbowChance === undefined) PlayerData.rainbowChance = 0;
    if (PlayerData.prismaticChance === undefined) PlayerData.prismaticChance = 0;
    if (PlayerData.celestialChance === undefined) PlayerData.celestialChance = 0;
    // Ensure prestige properties have valid values
    if (PlayerData.prestigeCurrency === undefined) PlayerData.prestigeCurrency = 0;
    if (PlayerData.prestigeMoneyMult === undefined) PlayerData.prestigeMoneyMult = 0;
    if (PlayerData.prestigeTiers === undefined) PlayerData.prestigeTiers = 0;
    if (PlayerData.prestigeColors === undefined) PlayerData.prestigeColors = 0;
    if (PlayerData.prestigeArena === undefined) PlayerData.prestigeArena = 0;
}

export function resetPlayerData() {
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
    // Note: prestige upgrades are NOT reset
    savePlayerData();
}

// Game settings (mutable) - boardSize and colorCount are dynamic via prestige
export const GameSettings = {
    get boardSize() { return getBoardSize(); },
    get colorCount() { return getColorCount(); },
    fallSpeed: 8,  // cells per second
    gap: 4,
    spawnDelay: 80,
    priceMultiplier: 1  // 0.1 to 1, affects upgrade costs
};

// Constants
export const BOARD_TOTAL_SIZE = 500;
export const BOARD_OFFSET_X = 50;
export const BOARD_OFFSET_Y = 120;
export const SWAP_DURATION = 150;

// Gem states
export const GEM_STATE = {
    IDLE: 'idle',
    FALLING: 'falling',
    SWAPPING: 'swapping',
    MATCHED: 'matched'
};

// JS version (update with each commit)
export const JS_VERSION = '0.0.83-js';
