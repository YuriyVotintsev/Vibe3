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
    colorMultipliers: {}  // { colorIndex: multiplier }
};

// Initialize color multipliers (all start at 1x)
export function initColorMultipliers() {
    for (let i = 0; i < ALL_GEM_COLORS.length; i++) {
        if (PlayerData.colorMultipliers[i] === undefined) {
            PlayerData.colorMultipliers[i] = 1;
        }
    }
}

// Get upgrade cost for a color (increases with level)
export function getUpgradeCost(colorIndex) {
    const currentMultiplier = PlayerData.colorMultipliers[colorIndex] || 1;
    const level = currentMultiplier - 1; // level 0 = 1x, level 1 = 2x, etc.
    return Math.floor(100 * Math.pow(1.5, level));
}

// Apply upgrade to a color
export function upgradeColor(colorIndex) {
    const cost = getUpgradeCost(colorIndex);
    if (PlayerData.currency >= cost) {
        PlayerData.currency -= cost;
        PlayerData.colorMultipliers[colorIndex] = (PlayerData.colorMultipliers[colorIndex] || 1) + 1;
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
    initColorMultipliers();
}

// Game settings (mutable)
export const GameSettings = {
    boardSize: 8,
    colorCount: 6,
    fallSpeed: 8,  // cells per second
    gap: 4,
    spawnDelay: 80
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
export const JS_VERSION = '0.0.19-js';
