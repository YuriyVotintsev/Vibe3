import { GameSettings, BOARD_TOTAL_SIZE } from './config.js';

// Calculate cell size based on board size
export function getCellSize() {
    const totalGaps = (GameSettings.boardSize - 1) * GameSettings.gap;
    return (BOARD_TOTAL_SIZE - totalGaps) / GameSettings.boardSize;
}
