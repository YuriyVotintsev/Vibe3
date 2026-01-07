// BombManager.js - Handles bomb spawning and explosions

import {
    GameSettings,
    GEM_STATE,
    PlayerData,
    savePlayerData,
    ENHANCEMENT,
    ENHANCEMENT_MULTIPLIERS,
    getMoneyMultiplier
} from './config.js';

/**
 * Manages bomb mechanics:
 * - Spawning bombs after manual matches
 * - Bomb explosion and chain reactions
 */
export class BombManager {
    /**
     * @param {Phaser.Scene} scene - The game scene
     * @param {Object} context - Shared context { board, gems }
     */
    constructor(scene, context) {
        this.scene = scene;
        this.ctx = context;
        this.pendingBombSpawn = null;
    }

    /**
     * Try to spawn a bomb at match center
     * @param {Array} matches - Array of {row, col} matched positions
     */
    trySpawnBomb(matches) {
        if (Phaser.Math.Between(1, 100) > PlayerData.bombChance) return;

        const centerIdx = Math.floor(matches.length / 2);
        const { row, col } = matches[centerIdx];

        if (this.ctx.board[row]?.[col] === 'bomb') return;

        this.pendingBombSpawn = { row, col };
    }

    /**
     * Spawn pending bomb after match gems are destroyed
     */
    spawnPendingBomb() {
        if (!this.pendingBombSpawn) return;

        const { row, col } = this.pendingBombSpawn;
        this.pendingBombSpawn = null;

        this.ctx.board[row][col] = 'bomb';

        const pos = this.scene.getGemPosition(row, col);
        const bomb = this.scene.add.image(pos.x, pos.y, 'bomb');
        bomb.setInteractive({ useHandCursor: true });
        bomb.setData('row', row);
        bomb.setData('col', col);
        bomb.setData('type', 'bomb');
        bomb.setData('isBomb', true);
        bomb.setData('state', GEM_STATE.IDLE);
        bomb.setData('targetY', pos.y);
        bomb.setMask(this.scene.gemMask);

        // Spawn animation
        bomb.setScale(0);
        this.scene.tweens.add({
            targets: bomb,
            scale: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });

        this.ctx.gems[row][col] = bomb;
    }

    /**
     * Check if bomb spawn is pending at position
     */
    isPendingAt(row, col) {
        const pending = this.pendingBombSpawn;
        return pending && pending.row === row && pending.col === col;
    }

    /**
     * Explode a bomb and destroy nearby gems
     * @param {Phaser.GameObjects.Image} bomb - The bomb to explode
     * @param {UIManager} uiManager - For showing effects and messages
     */
    explodeBomb(bomb, uiManager) {
        const row = bomb.getData('row');
        const col = bomb.getData('col');
        const radius = PlayerData.bombRadius;
        const boardSize = GameSettings.boardSize;
        const { board, gems } = this.ctx;

        // Remove the bomb from board
        board[row][col] = null;
        gems[row][col] = null;
        bomb.destroy();

        // Collect other bombs for chain reaction
        const chainBombs = [];

        // Destroy gems in circular radius
        for (let r = row - radius; r <= row + radius; r++) {
            for (let c = col - radius; c <= col + radius; c++) {
                if (r < 0 || r >= boardSize || c < 0 || c >= boardSize) continue;
                if (r === row && c === col) continue;

                const distance = Math.sqrt((r - row) ** 2 + (c - col) ** 2);
                if (distance > radius + 0.5) continue;

                const gem = gems[r]?.[c];
                if (gem && gem.getData('state') === GEM_STATE.IDLE) {
                    if (gem.getData('isBomb')) {
                        chainBombs.push(gem);
                        continue;
                    }

                    // Award currency
                    const enhancement = gem.getData('enhancement') || ENHANCEMENT.NONE;
                    const enhMultiplier = ENHANCEMENT_MULTIPLIERS[enhancement] || 1;
                    const gemCurrency = enhMultiplier * getMoneyMultiplier();
                    PlayerData.currency += gemCurrency;
                    PlayerData.totalEarned += gemCurrency;
                    uiManager.showFloatingCurrency(gem.x, gem.y, gemCurrency, enhancement);

                    // Destroy gem
                    gem.setData('state', GEM_STATE.MATCHED);
                    this.scene.destroyGemWithEffect(gem);

                    board[r][c] = null;
                    gems[r][c] = null;
                }
            }
        }

        uiManager.updateCurrency();
        savePlayerData();

        // Chain reaction
        chainBombs.forEach(otherBomb => {
            this.scene.time.delayedCall(100, () => {
                if (otherBomb.active) this.explodeBomb(otherBomb, uiManager);
            });
        });

        uiManager.showMessage('💥 БУМ!');
    }
}
