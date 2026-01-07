// FallManager.js - Handles gem falling, gravity, and spawning
import { GameSettings, BOARD_OFFSET_Y, GEM_STATE } from './config.js';
import { getCellSize } from './utils.js';

/**
 * Manages gem falling physics:
 * - Tick-based falling animation
 * - Gravity (filling empty cells)
 * - Spawning new gems at top
 */
export class FallManager {
    /**
     * @param {Object} context - Reference to scene context containing board, gems, etc.
     */
    constructor(context) {
        this.ctx = context;
        this.lastSpawnTime = {};
    }

    /**
     * Initialize spawn timers for all columns
     * @param {number} boardSize
     */
    initSpawnTimers(boardSize) {
        for (let col = 0; col < boardSize; col++) {
            this.lastSpawnTime[col] = 0;
        }
    }

    /**
     * Reset spawn timers (e.g., on new game)
     * @param {number} boardSize
     */
    resetSpawnTimers(boardSize) {
        this.initSpawnTimers(boardSize);
    }

    /**
     * Update falling gems positions based on delta time
     * @param {number} delta - Time since last frame in ms
     */
    updateFallingGems(delta) {
        const cellSize = getCellSize();
        const fallAmount = (GameSettings.fallSpeed * cellSize * delta) / 1000;
        const boardSize = GameSettings.boardSize;
        const { gems, pendingMatches } = this.ctx;

        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const gem = gems[row]?.[col];
                if (!gem) continue;

                if (gem.getData('state') === GEM_STATE.FALLING) {
                    const targetY = gem.getData('targetY');

                    if (gem.y < targetY) {
                        gem.y = Math.min(gem.y + fallAmount, targetY);

                        // Move overlay with gem (maintain corner offset)
                        const overlay = gem.getData('overlay');
                        if (overlay) {
                            const cornerOffset = getCellSize() * 0.25;
                            overlay.y = gem.y + cornerOffset;
                        }

                        if (gem.y >= targetY) {
                            gem.y = targetY;
                            gem.setData('state', GEM_STATE.IDLE);
                            pendingMatches.push({ row, col });
                        }
                    }
                }
            }
        }
    }

    /**
     * Apply gravity - move gems down to fill empty cells
     */
    updateGravity() {
        const boardSize = GameSettings.boardSize;
        const { board, gems, scene } = this.ctx;

        for (let col = 0; col < boardSize; col++) {
            for (let row = boardSize - 1; row >= 0; row--) {
                if (board[row][col] === null) {
                    for (let aboveRow = row - 1; aboveRow >= 0; aboveRow--) {
                        if (board[aboveRow][col] !== null) {
                            const gem = gems[aboveRow][col];
                            if (gem && gem.getData('state') === GEM_STATE.IDLE) {
                                board[row][col] = board[aboveRow][col];
                                board[aboveRow][col] = null;

                                gems[row][col] = gem;
                                gems[aboveRow][col] = null;

                                gem.setData('row', row);
                                gem.setData('targetY', scene.getGemPosition(row, col).y);
                                gem.setData('state', GEM_STATE.FALLING);
                            }
                            break;
                        }
                    }
                }
            }
        }
    }

    /**
     * Spawn new gems at the top of empty columns
     * @param {number} time - Current game time
     */
    spawnNewGems(time) {
        const boardSize = GameSettings.boardSize;
        const cellSize = getCellSize();
        const gap = GameSettings.gap;
        const { board, gems, scene } = this.ctx;

        for (let col = 0; col < boardSize; col++) {
            if (board[0][col] === null) {
                if (time - this.lastSpawnTime[col] >= GameSettings.spawnDelay) {
                    let canSpawn = true;

                    // Check if any gem is falling to row 0
                    for (let r = 0; r < boardSize; r++) {
                        const gem = gems[r]?.[col];
                        if (gem && gem.getData('state') === GEM_STATE.FALLING) {
                            const targetRow = gem.getData('row');
                            if (targetRow <= 0) {
                                canSpawn = false;
                                break;
                            }
                        }
                    }

                    if (canSpawn) {
                        const gemType = Phaser.Math.Between(0, GameSettings.colorCount - 1);
                        const startY = BOARD_OFFSET_Y - cellSize / 2 - gap;
                        const gem = scene.createGem(0, col, gemType, startY);

                        board[0][col] = gemType;
                        gems[0][col] = gem;
                        gem.setData('state', GEM_STATE.FALLING);

                        this.lastSpawnTime[col] = time;
                    }
                }
            }
        }
    }
}
