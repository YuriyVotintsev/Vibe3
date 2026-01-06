// BoardLogic.js - Pure board logic functions (no Phaser dependencies)

/**
 * Check if a position on the board has a match of 3 or more
 * @param {Array} board - 2D array of gem types
 * @param {number} row - Row to check
 * @param {number} col - Column to check
 * @param {number} boardSize - Size of the board
 * @returns {boolean} - True if there's a match at this position
 */
export function checkMatchAt(board, row, col, boardSize) {
    const type = board[row][col];
    if (type === null || type === undefined) return false;

    // Check horizontal
    let count = 1;
    for (let c = col - 1; c >= 0 && board[row][c] === type; c--) count++;
    for (let c = col + 1; c < boardSize && board[row][c] === type; c++) count++;
    if (count >= 3) return true;

    // Check vertical
    count = 1;
    for (let r = row - 1; r >= 0 && board[r][col] === type; r--) count++;
    for (let r = row + 1; r < boardSize && board[r][col] === type; r++) count++;
    if (count >= 3) return true;

    return false;
}

/**
 * Check if swapping two positions would create a match
 * @param {Array} board - 2D array of gem types
 * @param {number} row1 - First row
 * @param {number} col1 - First column
 * @param {number} row2 - Second row
 * @param {number} col2 - Second column
 * @param {number} boardSize - Size of the board
 * @returns {boolean} - True if swap would create a match
 */
export function wouldCreateMatch(board, row1, col1, row2, col2, boardSize) {
    // Temporarily swap
    [board[row1][col1], board[row2][col2]] = [board[row2][col2], board[row1][col1]];

    // Check if either position now has a match
    const hasMatch = checkMatchAt(board, row1, col1, boardSize) ||
                     checkMatchAt(board, row2, col2, boardSize);

    // Swap back
    [board[row1][col1], board[row2][col2]] = [board[row2][col2], board[row1][col1]];

    return hasMatch;
}

/**
 * Find all valid moves on the board
 * @param {Array} board - 2D array of gem types
 * @param {number} boardSize - Size of the board
 * @returns {Array} - Array of valid moves {row1, col1, row2, col2}
 */
export function findValidMoves(board, boardSize) {
    const validMoves = [];

    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            // Check right swap
            if (col < boardSize - 1) {
                if (wouldCreateMatch(board, row, col, row, col + 1, boardSize)) {
                    validMoves.push({ row1: row, col1: col, row2: row, col2: col + 1 });
                }
            }
            // Check down swap
            if (row < boardSize - 1) {
                if (wouldCreateMatch(board, row, col, row + 1, col, boardSize)) {
                    validMoves.push({ row1: row, col1: col, row2: row + 1, col2: col });
                }
            }
        }
    }
    return validMoves;
}

/**
 * Get valid colors for a position that won't create initial matches
 * @param {Array} board - 2D array of gem types
 * @param {number} row - Row position
 * @param {number} col - Column position
 * @param {number} colorCount - Number of available colors
 * @returns {Array} - Array of valid color indices
 */
export function getValidColors(board, row, col, colorCount) {
    const forbiddenColors = new Set();

    // Check horizontal (2 gems to the left)
    if (col >= 2 && board[row][col - 1] === board[row][col - 2]) {
        forbiddenColors.add(board[row][col - 1]);
    }

    // Check vertical (2 gems above)
    if (row >= 2 && board[row - 1][col] === board[row - 2][col]) {
        forbiddenColors.add(board[row - 1][col]);
    }

    // Build list of valid colors
    const validColors = [];
    for (let c = 0; c < colorCount; c++) {
        if (!forbiddenColors.has(c)) {
            validColors.push(c);
        }
    }

    return validColors;
}

/**
 * Fisher-Yates shuffle for an array (in-place)
 * @param {Array} array - Array to shuffle
 * @param {Function} randomFn - Random function (index) => random int 0..index
 * @returns {Array} - The shuffled array (same reference)
 */
export function shuffleArray(array, randomFn) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = randomFn(i);
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
