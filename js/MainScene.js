// MainScene.js - Main game scene (refactored)

import {
    GameSettings,
    BOARD_TOTAL_SIZE,
    GEM_STATE,
    PlayerData,
    loadPlayerData,
    savePlayerData,
    ALL_GEM_COLORS,
    ENHANCEMENT,
    rollEnhancement,
    processAutoBuys
} from './config.js';
import { getCellSize, getLayout } from './utils.js';
import { findValidMoves, getValidColors, shuffleArray } from './BoardLogic.js';
import { createGemTextures } from './GemRenderer.js';
import { FallManager } from './FallManager.js';
import { SwapHandler } from './SwapHandler.js';
import { UIManager } from './UIManager.js';
import { BombManager } from './BombManager.js';
import { MatchProcessor } from './MatchProcessor.js';
import { COLORS } from './styles.js';

export class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    init() {
        loadPlayerData();
        this.board = [];
        this.gems = [];
        this.pendingMatches = [];
        this.lastMoveTime = 0;
        this.isAutoMoving = false;
        this.lastMatchWasManual = false;

        const context = {
            board: this.board,
            gems: this.gems,
            pendingMatches: this.pendingMatches,
            scene: this
        };

        this.fallManager = new FallManager(context);
        this.swapHandler = new SwapHandler(context);
        this.uiManager = new UIManager(this);
        this.bombManager = new BombManager(this, context);
        this.matchProcessor = new MatchProcessor(this, context);
    }

    preload() {
        createGemTextures(this);
    }

    create() {
        const boardSize = GameSettings.boardSize;

        // Calculate adaptive layout
        this.layout = getLayout(this.cameras.main.width, this.cameras.main.height);

        // Background
        this.add.rectangle(
            this.layout.centerX,
            this.layout.canvasHeight / 2,
            this.layout.canvasWidth,
            this.layout.canvasHeight,
            COLORS.bgDark
        );

        // Board background
        const boardBgSize = BOARD_TOTAL_SIZE + 20;
        this.add.rectangle(
            this.layout.boardOffsetX + BOARD_TOTAL_SIZE / 2,
            this.layout.boardOffsetY + BOARD_TOTAL_SIZE / 2,
            boardBgSize,
            boardBgSize,
            COLORS.bgOverlay,
            0.3
        ).setStrokeStyle(2, COLORS.border);

        // Gem mask
        const maskShape = this.make.graphics();
        maskShape.fillRect(
            this.layout.boardOffsetX - 10,
            this.layout.boardOffsetY - 10,
            BOARD_TOTAL_SIZE + 20,
            BOARD_TOTAL_SIZE + 20
        );
        this.gemMask = maskShape.createGeometryMask();

        this.uiManager.create();
        this.createBoard();

        this.selectionIndicator = this.add.image(0, 0, 'selection');
        this.selectionIndicator.setVisible(false);
        this.selectionIndicator.setDepth(100);

        this.removeInitialMatches();

        // Input handlers
        this.input.on('gameobjectdown', (pointer, gameObject) => {
            if (gameObject.getData('isBomb')) {
                this.bombManager.explodeBomb(gameObject, this.uiManager);
            } else {
                this.swapHandler.onGemPointerDown(pointer, gameObject);
            }
        });

        this.input.on('pointerup', (pointer) => {
            this.swapHandler.onPointerUp(pointer);
        });

        this.fallManager.initSpawnTimers(boardSize);

        // FPS counter for debugging
        this.fpsText = this.add.text(10, 10, 'FPS: --', {
            fontSize: '14px',
            color: '#00ff00',
            backgroundColor: '#000000'
        }).setDepth(1000);

        this.events.on('shutdown', this.shutdown, this);
        this.events.on('resume', this.onResume, this);
    }

    shutdown() {
        this.input.off('gameobjectdown');
        this.input.off('pointerup');
    }

    onResume() {
        this.uiManager.updateCurrency();
        this.uiManager.updatePrestige();
    }

    createBoard() {
        this.board.length = 0;
        this.gems.length = 0;
        const boardSize = GameSettings.boardSize;

        for (let row = 0; row < boardSize; row++) {
            this.board[row] = [];
            this.gems[row] = [];
            for (let col = 0; col < boardSize; col++) {
                const gemType = Phaser.Math.Between(0, GameSettings.colorCount - 1);
                this.board[row][col] = gemType;
                this.gems[row][col] = this.createGem(row, col, gemType);
            }
        }
    }

    createGem(row, col, gemType, startY = null, enhancement = null) {
        const pos = this.getGemPosition(row, col);
        const cellSize = getCellSize();

        // Use Container so overlay moves automatically with gem
        const container = this.add.container(pos.x, startY !== null ? startY : pos.y);

        // Gem sprite at center of container
        const gemSprite = this.make.image({ x: 0, y: 0, key: `gem_${gemType}`, add: false });
        container.add(gemSprite);
        container.setData('sprite', gemSprite);

        // Enhancement overlay (offset to corner, inside container)
        const enh = enhancement !== null ? enhancement : rollEnhancement();
        container.setData('enhancement', enh);

        if (enh !== ENHANCEMENT.NONE) {
            const cornerOffset = cellSize * 0.25;
            const overlay = this.make.image({ x: cornerOffset, y: cornerOffset, key: `overlay_${enh}`, add: false });
            overlay.setScale(0.7);
            container.add(overlay);
            container.setData('overlay', overlay);
        }

        // Apply mask to container (not children) - better performance
        container.setMask(this.gemMask);

        // Set container size for interaction
        container.setSize(cellSize, cellSize);
        container.setInteractive({ useHandCursor: true });

        // Store data on container
        container.setData('row', row);
        container.setData('col', col);
        container.setData('type', gemType);
        container.setData('state', GEM_STATE.IDLE);
        container.setData('targetY', pos.y);

        return container;
    }

    getGemPosition(row, col) {
        const cellSize = getCellSize();
        const gap = GameSettings.gap;
        return {
            x: this.layout.boardOffsetX + col * (cellSize + gap) + cellSize / 2,
            y: this.layout.boardOffsetY + row * (cellSize + gap) + cellSize / 2
        };
    }

    removeInitialMatches() {
        const boardSize = GameSettings.boardSize;
        const colorCount = GameSettings.colorCount;

        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                // Skip bombs - they should not be modified
                if (this.board[row][col] === 'bomb') continue;

                const validColors = getValidColors(this.board, row, col, colorCount);

                if (validColors.length > 0) {
                    const newType = validColors[Phaser.Math.Between(0, validColors.length - 1)];
                    if (newType !== this.board[row][col]) {
                        this.board[row][col] = newType;
                        // Container: update sprite texture inside
                        const gem = this.gems[row][col];
                        const sprite = gem.getData('sprite');
                        if (sprite) sprite.setTexture(`gem_${newType}`);
                        gem.setData('type', newType);
                    }
                }
            }
        }
    }

    update(time, delta) {
        this.fallManager.updateFallingGems(delta);
        this.fallManager.updateGravity();
        this.fallManager.spawnNewGems(time);
        this.checkLandedGems();
        this.checkAutoMove(time);
        processAutoBuys();

        // Update FPS counter
        this.fpsText.setText(`FPS: ${Math.round(this.game.loop.actualFps)}`);
    }

    checkLandedGems() {
        const hadMatches = this.matchProcessor.checkLandedGems(
            this.bombManager,
            this.uiManager,
            this.lastMatchWasManual
        );
        if (hadMatches) {
            this.lastMatchWasManual = false;
        }
    }

    checkAutoMove(time) {
        if (this.isAutoMoving) return;

        if (this.lastMoveTime === 0) {
            this.lastMoveTime = time;
            return;
        }

        if (time - this.lastMoveTime >= PlayerData.autoMoveDelay) {
            const boardSize = GameSettings.boardSize;
            const validMoves = findValidMoves(this.board, boardSize);

            const availableMoves = validMoves.filter(move => {
                const gem1 = this.gems[move.row1]?.[move.col1];
                const gem2 = this.gems[move.row2]?.[move.col2];
                return gem1?.getData('state') === GEM_STATE.IDLE &&
                       gem2?.getData('state') === GEM_STATE.IDLE;
            });

            if (availableMoves.length > 0) {
                const move = availableMoves[Phaser.Math.Between(0, availableMoves.length - 1)];
                this.isAutoMoving = true;
                this.swapHandler.swapGems(move.row1, move.col1, move.row2, move.col2);
                this.lastMoveTime = time;
            } else if (validMoves.length === 0 && !this.isBoardBusy()) {
                this.uiManager.showMessage('Нет ходов! Перемешиваю...');
                this.shuffleBoard();
                this.lastMoveTime = time;
            }
        }
    }

    isBoardBusy() {
        const boardSize = GameSettings.boardSize;
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const gem = this.gems[row]?.[col];
                if (!gem) return true;
                if (gem.getData('state') !== GEM_STATE.IDLE) return true;
            }
        }
        return false;
    }

    shuffleBoard() {
        const boardSize = GameSettings.boardSize;
        const types = [];
        const shufflePositions = [];

        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                if (this.board[row][col] === 'bomb') continue;
                if (this.board[row][col] !== null) {
                    types.push(this.board[row][col]);
                    shufflePositions.push({ row, col });
                }
            }
        }

        shuffleArray(types, (i) => Phaser.Math.Between(0, i));

        for (let i = 0; i < shufflePositions.length && i < types.length; i++) {
            const { row, col } = shufflePositions[i];
            this.board[row][col] = types[i];
            const gem = this.gems[row][col];
            if (gem) {
                // Container: update sprite texture inside
                const sprite = gem.getData('sprite');
                if (sprite) sprite.setTexture(`gem_${types[i]}`);
                gem.setData('type', types[i]);
            }
        }

        this.removeInitialMatches();

        if (findValidMoves(this.board, boardSize).length === 0) {
            this.shuffleBoard();
        }
    }

    destroyGemWithEffect(gem) {
        const x = gem.x;
        const y = gem.y;
        const colorIndex = gem.getData('type');
        const color = colorIndex !== 'bomb' ? ALL_GEM_COLORS[colorIndex] : COLORS.bombParticle;

        // Container: animate the whole container, destroy() removes all children
        // Pop animation
        this.tweens.add({
            targets: gem,
            scale: { from: 1, to: 1.3 },
            duration: 80,
            ease: 'Quad.easeOut',
            onComplete: () => {
                this.tweens.add({
                    targets: gem,
                    scale: 0,
                    alpha: 0,
                    duration: 100,
                    ease: 'Quad.easeIn',
                    onComplete: () => gem.destroy()
                });
            }
        });

        // Particles
        const particleCount = 8;
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2 + Math.random() * 0.3;
            const particle = this.add.circle(x, y, 12, color);
            particle.setStrokeStyle(3, COLORS.white, 0.8);
            particle.setDepth(150);

            const distance = 50 + Math.random() * 50;
            const targetX = x + Math.cos(angle) * distance;
            const targetY = y + Math.sin(angle) * distance;

            this.tweens.add({
                targets: particle,
                x: targetX,
                y: targetY,
                scale: { from: 1.5, to: 0 },
                alpha: { from: 1, to: 0 },
                duration: 700,
                ease: 'Quad.easeOut',
                onComplete: () => particle.destroy()
            });
        }
    }

    restartGame() {
        const boardSize = GameSettings.boardSize;

        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const gem = this.gems[row]?.[col];
                // Container: destroy() removes all children (sprite, overlay)
                if (gem) gem.destroy();
            }
        }

        this.pendingMatches.length = 0;
        this.lastMatchWasManual = false;
        this.swapHandler.clearSelection();
        this.fallManager.resetSpawnTimers(boardSize);

        this.createBoard();
        this.removeInitialMatches();

        this.uiManager.showMessage('Новая игра!');
    }
}
