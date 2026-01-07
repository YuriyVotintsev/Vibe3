import { GameSettings, BOARD_TOTAL_SIZE, BOARD_OFFSET_X } from './config.js';

// Calculate cell size based on board size
export function getCellSize() {
    const totalGaps = (GameSettings.boardSize - 1) * GameSettings.gap;
    return (BOARD_TOTAL_SIZE - totalGaps) / GameSettings.boardSize;
}

// Layout constants
const HEADER_HEIGHT = 110;  // Fixed header height
const FOOTER_HEIGHT = 130;  // Fixed footer height (buttons + message + padding)
const BOARD_PADDING = 20;   // Padding around board

/**
 * Calculate adaptive layout based on canvas size
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 * @returns {Object} Layout positions
 */
export function getLayout(canvasWidth, canvasHeight) {
    // Available space for board (between header and footer)
    const availableHeight = canvasHeight - HEADER_HEIGHT - FOOTER_HEIGHT;

    // Center board vertically in available space
    const boardOffsetY = HEADER_HEIGHT + (availableHeight - BOARD_TOTAL_SIZE) / 2;

    // Buttons and message positions from bottom
    const buttonsY = canvasHeight - 50;  // Buttons at bottom
    const messageY = canvasHeight - 105; // Message above buttons

    return {
        headerHeight: HEADER_HEIGHT,
        boardOffsetX: BOARD_OFFSET_X,
        boardOffsetY: Math.max(HEADER_HEIGHT + BOARD_PADDING, boardOffsetY),
        messageY,
        buttonsY,
        centerX: canvasWidth / 2,
        canvasWidth,
        canvasHeight
    };
}
