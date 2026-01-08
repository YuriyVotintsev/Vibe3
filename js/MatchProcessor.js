// MatchProcessor.js - Handles match detection and rewards

import {
    GameSettings,
    GEM_STATE,
    PlayerData,
    savePlayerData,
    ENHANCEMENT,
    ENHANCEMENT_MULTIPLIERS,
    getMoneyMultiplier
} from './config.js';
import { findAllMatchPositions, matchSetToArray } from './BoardLogic.js';

/**
 * Processes gem matches:
 * - Detects matches on board
 * - Calculates and awards currency
 * - Triggers gem destruction
 */
export class MatchProcessor {
    /**
     * @param {Phaser.Scene} scene - The game scene
     * @param {Object} context - Shared context { board, gems, pendingMatches }
     */
    constructor(scene, context) {
        this.scene = scene;
        this.ctx = context;
    }

    /**
     * Find all current matches (only IDLE gems)
     * @returns {Array} Array of {row, col} positions
     */
    findAllMatches() {
        const boardSize = GameSettings.boardSize;
        const matchPositions = findAllMatchPositions(this.ctx.board, boardSize);

        return matchSetToArray(matchPositions).filter(({ row, col }) => {
            const gem = this.ctx.gems[row]?.[col];
            return gem?.getData('state') === GEM_STATE.IDLE;
        });
    }

    /**
     * Process landed gems and check for matches
     * @param {BombManager} bombManager - For bomb spawning
     * @param {UIManager} uiManager - For UI updates
     * @param {boolean} wasManualMove - Whether last move was manual (for bomb spawning)
     * @param {ComboManager} comboManager - For combo tracking
     * @returns {boolean} Whether matches were found
     */
    checkLandedGems(bombManager, uiManager, wasManualMove, comboManager) {
        if (this.ctx.pendingMatches.length === 0) return false;

        this.ctx.pendingMatches.length = 0;
        const matches = this.findAllMatches();

        if (matches.length === 0) return false;

        // Add combo based on match size
        if (comboManager) {
            comboManager.addCombo(matches.length);
        }

        // Award currency for each matched gem (with combo multiplier)
        this.awardCurrency(matches, uiManager, comboManager);

        // Try to spawn bomb if manual move
        if (wasManualMove && matches.length >= 3) {
            bombManager.trySpawnBomb(matches);
        }

        // Destroy matched gems
        this.destroyMatches(matches, bombManager);

        // Spawn bomb after gems destroyed
        bombManager.spawnPendingBomb();

        return true;
    }

    /**
     * Award currency for matched gems
     * @param {Array} matches - Array of {row, col}
     * @param {UIManager} uiManager - For floating text
     * @param {ComboManager} comboManager - For combo multiplier
     */
    awardCurrency(matches, uiManager, comboManager) {
        const moneyMult = getMoneyMultiplier();
        const comboMult = comboManager ? comboManager.getMultiplier() : 1;

        matches.forEach(({ row, col }) => {
            const gem = this.ctx.gems[row]?.[col];
            if (gem) {
                const enhancement = gem.getData('enhancement') || ENHANCEMENT.NONE;
                const enhMultiplier = ENHANCEMENT_MULTIPLIERS[enhancement] || 1;
                const gemCurrency = Math.floor(enhMultiplier * moneyMult * comboMult);

                PlayerData.currency += gemCurrency;
                PlayerData.totalEarned += gemCurrency;

                uiManager.showFloatingCurrency(gem.x, gem.y, gemCurrency, enhancement);
            }
        });

        uiManager.updateCurrency();
        savePlayerData();
    }

    /**
     * Destroy matched gems with effects
     * @param {Array} matches - Array of {row, col}
     * @param {BombManager} bombManager - To check pending bomb positions
     */
    destroyMatches(matches, bombManager) {
        const { board, gems } = this.ctx;

        matches.forEach(({ row, col }) => {
            const gem = gems[row]?.[col];
            if (gem && gem.getData('state') !== GEM_STATE.MATCHED) {
                gem.setData('state', GEM_STATE.MATCHED);
                this.scene.destroyGemWithEffect(gem);

                // Don't null if bomb pending there
                if (!bombManager.isPendingAt(row, col)) {
                    board[row][col] = null;
                }
                gems[row][col] = null;
            }
        });
    }
}
