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

// Player persistent data
export const PlayerData = {
    currency: 0,          // earned from matches, spent on upgrades
    totalEarned: 0,       // lifetime currency earned
    prestigeLevel: 0,     // future use
    autoMoveDelay: 5000,  // ms between auto-moves (starts at 5 seconds)
    bombChance: 10,       // % chance to spawn bomb on manual match (starts at 10%)
    bombRadius: 1,        // explosion radius (starts at 1)
    // Enhanced gem spawn chances (in %) - CASCADING: each tier rolls from previous
    silverChance: 5,      // chance for silver gem (x5) - from normal
    goldChance: 1,        // chance for gold gem (x25) - from silver
    crystalChance: 0,     // chance for crystal gem (x125) - from gold
    rainbowChance: 0,     // chance for rainbow gem (x625) - from crystal
    prismaticChance: 0    // chance for prismatic gem (x3125) - from rainbow
};

// Enhanced gem types and multipliers
export const ENHANCEMENT = {
    NONE: 'none',
    SILVER: 'silver',
    GOLD: 'gold',
    CRYSTAL: 'crystal',
    RAINBOW: 'rainbow',
    PRISMATIC: 'prismatic'
};

export const ENHANCEMENT_MULTIPLIERS = {
    [ENHANCEMENT.NONE]: 1,
    [ENHANCEMENT.SILVER]: 5,
    [ENHANCEMENT.GOLD]: 25,
    [ENHANCEMENT.CRYSTAL]: 125,
    [ENHANCEMENT.RAINBOW]: 625,
    [ENHANCEMENT.PRISMATIC]: 3125
};

export const ENHANCEMENT_NAMES = {
    [ENHANCEMENT.SILVER]: 'Серебряный',
    [ENHANCEMENT.GOLD]: 'Золотой',
    [ENHANCEMENT.CRYSTAL]: 'Кристальный',
    [ENHANCEMENT.RAINBOW]: 'Радужный',
    [ENHANCEMENT.PRISMATIC]: 'Призматический'
};

// Roll for gem enhancement when spawning (CASCADING system)
// Each tier can only upgrade from the previous tier
// e.g., if silver=50%, gold=50%, actual gold chance = 25% (50% * 50%)
export function rollEnhancement() {
    // Roll for silver (from normal gem)
    if (Phaser.Math.Between(1, 100) > PlayerData.silverChance) {
        return ENHANCEMENT.NONE;
    }
    // Got silver! Roll for gold upgrade
    if (Phaser.Math.Between(1, 100) > PlayerData.goldChance) {
        return ENHANCEMENT.SILVER;
    }
    // Got gold! Roll for crystal upgrade
    if (PlayerData.crystalChance <= 0 || Phaser.Math.Between(1, 100) > PlayerData.crystalChance) {
        return ENHANCEMENT.GOLD;
    }
    // Got crystal! Roll for rainbow upgrade
    if (PlayerData.rainbowChance <= 0 || Phaser.Math.Between(1, 100) > PlayerData.rainbowChance) {
        return ENHANCEMENT.CRYSTAL;
    }
    // Got rainbow! Roll for prismatic upgrade
    if (PlayerData.prismaticChance <= 0 || Phaser.Math.Between(1, 100) > PlayerData.prismaticChance) {
        return ENHANCEMENT.RAINBOW;
    }
    // Got prismatic!
    return ENHANCEMENT.PRISMATIC;
}

// Silver chance upgrade (5% -> 100%, +5% per upgrade = 19 upgrades)
export function getSilverLevel() {
    return (PlayerData.silverChance - 5) / 5;
}

export function getSilverUpgradeCost() {
    const level = getSilverLevel();
    return Math.floor(50 * Math.pow(1.10, level) * GameSettings.priceMultiplier);
}

export function upgradeSilver() {
    const cost = getSilverUpgradeCost();
    if (PlayerData.currency >= cost && PlayerData.silverChance < 100) {
        PlayerData.currency -= cost;
        PlayerData.silverChance += 5;
        savePlayerData();
        return true;
    }
    return false;
}

// Gold chance upgrade (1% -> 100%, +4% per upgrade = 25 upgrades)
export function getGoldLevel() {
    return Math.floor((PlayerData.goldChance - 1) / 4);
}

export function getGoldUpgradeCost() {
    const level = getGoldLevel();
    return Math.floor(50 * Math.pow(1.10, level) * GameSettings.priceMultiplier);
}

export function upgradeGold() {
    const cost = getGoldUpgradeCost();
    if (PlayerData.currency >= cost && PlayerData.goldChance < 100) {
        PlayerData.currency -= cost;
        PlayerData.goldChance = Math.min(100, PlayerData.goldChance + 4);
        savePlayerData();
        return true;
    }
    return false;
}

// Crystal chance upgrade (0% -> 100%, +3% per upgrade = 34 upgrades)
export function getCrystalLevel() {
    return Math.floor(PlayerData.crystalChance / 3);
}

export function getCrystalUpgradeCost() {
    const level = getCrystalLevel();
    return Math.floor(50 * Math.pow(1.10, level) * GameSettings.priceMultiplier);
}

export function upgradeCrystal() {
    const cost = getCrystalUpgradeCost();
    if (PlayerData.currency >= cost && PlayerData.crystalChance < 100) {
        PlayerData.currency -= cost;
        PlayerData.crystalChance = Math.min(100, PlayerData.crystalChance + 3);
        savePlayerData();
        return true;
    }
    return false;
}

// Rainbow chance upgrade (0% -> 100%, +2% per upgrade = 50 upgrades)
export function getRainbowLevel() {
    return Math.floor(PlayerData.rainbowChance / 2);
}

export function getRainbowUpgradeCost() {
    const level = getRainbowLevel();
    return Math.floor(50 * Math.pow(1.10, level) * GameSettings.priceMultiplier);
}

export function upgradeRainbow() {
    const cost = getRainbowUpgradeCost();
    if (PlayerData.currency >= cost && PlayerData.rainbowChance < 100) {
        PlayerData.currency -= cost;
        PlayerData.rainbowChance = Math.min(100, PlayerData.rainbowChance + 2);
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
    return Math.floor(50 * Math.pow(1.10, level) * GameSettings.priceMultiplier);
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
    return Math.floor(200 * Math.pow(1.8, level) * GameSettings.priceMultiplier);
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
    return Math.floor(300 * Math.pow(1.6, level) * GameSettings.priceMultiplier);
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
    return Math.floor(500 * Math.pow(2.5, level) * GameSettings.priceMultiplier);
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
    if (PlayerData.silverChance === undefined) PlayerData.silverChance = 5;
    if (PlayerData.goldChance === undefined) PlayerData.goldChance = 1;
    if (PlayerData.crystalChance === undefined) PlayerData.crystalChance = 0;
    if (PlayerData.rainbowChance === undefined) PlayerData.rainbowChance = 0;
    if (PlayerData.prismaticChance === undefined) PlayerData.prismaticChance = 0;
}

export function resetPlayerData() {
    PlayerData.currency = 0;
    PlayerData.totalEarned = 0;
    PlayerData.prestigeLevel = 0;
    PlayerData.autoMoveDelay = 5000;
    PlayerData.bombChance = 10;
    PlayerData.bombRadius = 1;
    PlayerData.silverChance = 5;
    PlayerData.goldChance = 1;
    PlayerData.crystalChance = 0;
    PlayerData.rainbowChance = 0;
    PlayerData.prismaticChance = 0;
    savePlayerData();
}

// Game settings (mutable)
export const GameSettings = {
    boardSize: 8,
    colorCount: 6,
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
export const JS_VERSION = '0.0.66-js';
