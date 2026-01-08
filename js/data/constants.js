// constants.js - Game constants and static data

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

// Board layout constants
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
export const JS_VERSION = '0.0.136-js';

// Format large numbers with scientific notation (>1000)
export function formatNumber(n) {
    if (n < 1000) return Math.floor(n).toString();
    if (n < 1e6) return (n / 1e3).toFixed(1) + 'K';
    if (n < 1e9) return (n / 1e6).toFixed(2) + 'M';
    if (n < 1e12) return (n / 1e9).toFixed(2) + 'B';
    return n.toExponential(2);
}
