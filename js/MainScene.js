import {
    GameSettings,
    BOARD_TOTAL_SIZE,
    BOARD_OFFSET_X,
    BOARD_OFFSET_Y,
    SWAP_DURATION,
    GEM_STATE,
    JS_VERSION,
    PlayerData,
    loadPlayerData,
    savePlayerData,
    ALL_GEM_COLORS
} from './config.js';
import { getCellSize } from './utils.js';
import {
    findValidMoves,
    getValidColors,
    shuffleArray,
    findAllMatchPositions,
    matchSetToArray
} from './BoardLogic.js';
import { createGemTextures } from './GemRenderer.js';
import { FallManager } from './FallManager.js';
import { SwapHandler } from './SwapHandler.js';

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
        this.lastMatchWasManual = false;  // Track if last match came from manual move
        this.pendingBombSpawn = null;     // Position to spawn bomb after match

        // FallManager handles falling, gravity, spawning
        this.fallManager = new FallManager({
            board: this.board,
            gems: this.gems,
            pendingMatches: this.pendingMatches,
            scene: this
        });

        // SwapHandler handles selection and swapping
        this.swapHandler = new SwapHandler({
            board: this.board,
            gems: this.gems,
            pendingMatches: this.pendingMatches,
            scene: this
        });
    }

    preload() {
        createGemTextures(this);
    }

    create() {
        const boardSize = GameSettings.boardSize;

        // Background
        this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0x1a1a2e
        );

        // Board background (fixed size)
        const boardBgSize = BOARD_TOTAL_SIZE + 20;
        this.add.rectangle(
            BOARD_OFFSET_X + BOARD_TOTAL_SIZE / 2,
            BOARD_OFFSET_Y + BOARD_TOTAL_SIZE / 2,
            boardBgSize,
            boardBgSize,
            0x000000,
            0.3
        ).setStrokeStyle(2, 0x333333);

        // Create mask for gems (so they don't overlap UI when falling from above)
        const maskShape = this.make.graphics();
        maskShape.fillRect(
            BOARD_OFFSET_X - 10,
            BOARD_OFFSET_Y - 10,
            BOARD_TOTAL_SIZE + 20,
            BOARD_TOTAL_SIZE + 20
        );
        this.gemMask = maskShape.createGeometryMask();

        this.createUI();
        this.createBoard();

        this.selectionIndicator = this.add.image(0, 0, 'selection');
        this.selectionIndicator.setVisible(false);
        this.selectionIndicator.setDepth(100);

        this.removeInitialMatches();

        // Handle pointer down on gems (start swipe tracking)
        this.input.on('gameobjectdown', (pointer, gameObject) => {
            if (gameObject.getData('isBomb')) {
                this.explodeBomb(gameObject);
            } else {
                this.swapHandler.onGemPointerDown(pointer, gameObject);
            }
        });

        // Handle pointer up (detect swipe or click)
        this.input.on('pointerup', (pointer) => {
            this.swapHandler.onPointerUp(pointer);
        });

        this.fallManager.initSpawnTimers(boardSize);

        this.events.on('shutdown', this.shutdown, this);
        this.events.on('resume', this.onResume, this);
    }

    shutdown() {
        this.input.off('gameobjectdown');
        this.input.off('pointerup');
    }

    onResume() {
        // Update currency display when returning from upgrades
        this.currencyText.setText(`${PlayerData.currency}`);
    }

    createUI() {
        const cx = this.cameras.main.width / 2;

        // Header panel background
        const headerBg = this.add.graphics();
        headerBg.fillStyle(0x16213e, 0.95);
        headerBg.fillRoundedRect(10, 8, this.cameras.main.width - 20, 100, 15);
        headerBg.lineStyle(2, 0x3498db, 0.5);
        headerBg.strokeRoundedRect(10, 8, this.cameras.main.width - 20, 100, 15);

        // Title
        this.add.text(cx, 35, 'MATCH-3', {
            fontSize: '32px',
            fontFamily: 'Arial Black',
            color: '#ffffff'
        }).setOrigin(0.5).setShadow(2, 2, '#000000', 4);

        // Currency stat card (centered)
        const statY = 80;
        const statWidth = 180;
        this.add.graphics()
            .fillStyle(0xf39c12, 0.25)
            .fillRoundedRect(cx - statWidth / 2, statY - 22, statWidth, 44, 10);
        this.add.text(cx - 50, statY, '💰', { fontSize: '28px' }).setOrigin(0.5);
        this.currencyText = this.add.text(cx + 5, statY, `${PlayerData.currency}`, {
            fontSize: '26px', color: '#f1c40f', fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        // Message text
        this.messageText = this.add.text(cx, BOARD_OFFSET_Y + BOARD_TOTAL_SIZE + 25, '', {
            fontSize: '18px',
            color: '#55efc4',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Bottom button panel - 2 buttons
        const btnY = BOARD_OFFSET_Y + BOARD_TOTAL_SIZE + 70;
        const btnWidth = 140;
        const btnHeight = 48;
        const btnSpacing = 80;

        // Button helper function
        const createButton = (x, color, hoverColor, label, callback) => {
            const bg = this.add.graphics();
            bg.fillStyle(color, 1);
            bg.fillRoundedRect(x - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 12);

            this.add.rectangle(x, btnY, btnWidth, btnHeight, 0x000000, 0)
                .setInteractive({ useHandCursor: true })
                .on('pointerover', () => {
                    bg.clear();
                    bg.fillStyle(hoverColor, 1);
                    bg.fillRoundedRect(x - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 12);
                })
                .on('pointerout', () => {
                    bg.clear();
                    bg.fillStyle(color, 1);
                    bg.fillRoundedRect(x - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 12);
                })
                .on('pointerdown', callback);

            this.add.text(x, btnY, label, {
                fontSize: '18px', color: '#ffffff', fontStyle: 'bold'
            }).setOrigin(0.5);
        };

        createButton(cx - btnSpacing, 0x9b59b6, 0x8e44ad, '⬆️ Апгрейд', () => this.scene.launch('UpgradesScene'));
        createButton(cx + btnSpacing, 0x3498db, 0x2980b9, '⚙️ Опции', () => this.scene.launch('SettingsScene'));

        // Version text
        this.add.text(10, this.cameras.main.height - 10, JS_VERSION, {
            fontSize: '14px', color: '#888888', fontStyle: 'bold'
        }).setOrigin(0, 1);
    }

    createBoard() {
        // Clear arrays without reassigning (keep references for managers)
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

    createGem(row, col, gemType, startY = null) {
        const pos = this.getGemPosition(row, col);
        const gem = this.add.image(pos.x, startY !== null ? startY : pos.y, `gem_${gemType}`);
        gem.setInteractive({ useHandCursor: true });
        gem.setData('row', row);
        gem.setData('col', col);
        gem.setData('type', gemType);
        gem.setData('state', GEM_STATE.IDLE);
        gem.setData('targetY', pos.y);
        gem.setMask(this.gemMask);
        return gem;
    }

    getGemPosition(row, col) {
        const cellSize = getCellSize();
        const gap = GameSettings.gap;
        return {
            x: BOARD_OFFSET_X + col * (cellSize + gap) + cellSize / 2,
            y: BOARD_OFFSET_Y + row * (cellSize + gap) + cellSize / 2
        };
    }

    removeInitialMatches() {
        const boardSize = GameSettings.boardSize;
        const colorCount = GameSettings.colorCount;

        // Smart placement: for each cell, pick a color that won't create a match
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const validColors = getValidColors(this.board, row, col, colorCount);

                if (validColors.length > 0) {
                    const newType = validColors[Phaser.Math.Between(0, validColors.length - 1)];
                    if (newType !== this.board[row][col]) {
                        this.board[row][col] = newType;
                        this.gems[row][col].setTexture(`gem_${newType}`);
                        this.gems[row][col].setData('type', newType);
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
    }

    checkAutoMove(time) {
        // Don't auto-move if swap is in progress
        if (this.isAutoMoving) return;

        // Initialize lastMoveTime on first frame
        if (this.lastMoveTime === 0) {
            this.lastMoveTime = time;
            return;
        }

        // Check if enough time has passed
        if (time - this.lastMoveTime >= PlayerData.autoMoveDelay) {
            const boardSize = GameSettings.boardSize;
            const validMoves = findValidMoves(this.board, boardSize);

            // Filter to moves where both gems are IDLE (can swap during falling)
            const availableMoves = validMoves.filter(move => {
                const gem1 = this.gems[move.row1]?.[move.col1];
                const gem2 = this.gems[move.row2]?.[move.col2];
                return gem1?.getData('state') === GEM_STATE.IDLE &&
                       gem2?.getData('state') === GEM_STATE.IDLE;
            });

            if (availableMoves.length > 0) {
                // Pick random available move
                const move = availableMoves[Phaser.Math.Between(0, availableMoves.length - 1)];
                this.isAutoMoving = true;
                this.swapHandler.swapGems(move.row1, move.col1, move.row2, move.col2);
                this.lastMoveTime = time;
            } else if (validMoves.length === 0 && !this.isBoardBusy()) {
                // No valid moves AND board is settled - shuffle
                this.showMessage('Нет ходов! Перемешиваю...');
                this.shuffleBoard();
                this.lastMoveTime = time;
            }
            // If validMoves exist but none available (gems falling) - wait
        }
    }

    isBoardBusy() {
        const boardSize = GameSettings.boardSize;
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const gem = this.gems[row]?.[col];
                if (!gem) return true; // Empty cell = gems falling
                if (gem.getData('state') !== GEM_STATE.IDLE) return true;
            }
        }
        return false;
    }

    shuffleBoard() {
        const boardSize = GameSettings.boardSize;

        // Collect all gem types (skip bomb positions)
        const types = [];
        const shufflePositions = [];
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                // Skip if there's a bomb at this position (bomb stays in place)
                if (this.board[row][col] === 'bomb') continue;

                if (this.board[row][col] !== null) {
                    types.push(this.board[row][col]);
                    shufflePositions.push({ row, col });
                }
            }
        }

        // Fisher-Yates shuffle using BoardLogic
        shuffleArray(types, (i) => Phaser.Math.Between(0, i));

        // Reassign only non-bomb positions
        for (let i = 0; i < shufflePositions.length && i < types.length; i++) {
            const { row, col } = shufflePositions[i];
            this.board[row][col] = types[i];
            const gem = this.gems[row][col];
            if (gem) {
                gem.setTexture(`gem_${types[i]}`);
                gem.setData('type', types[i]);
            }
        }

        // Remove any initial matches after shuffle
        this.removeInitialMatches();

        // Check if we have valid moves now, if not shuffle again
        if (findValidMoves(this.board, boardSize).length === 0) {
            this.shuffleBoard();
        }
    }

    checkLandedGems() {
        if (this.pendingMatches.length === 0) return;

        this.pendingMatches.length = 0;
        const matches = this.findAllMatches();

        if (matches.length > 0) {
            // Calculate currency with color multipliers and show floating text
            matches.forEach(({ row, col }) => {
                const gem = this.gems[row]?.[col];
                if (gem) {
                    const colorIndex = gem.getData('type');
                    const colorMultiplier = PlayerData.colorMultipliers[colorIndex] || 1;
                    const gemCurrency = colorMultiplier;

                    PlayerData.currency += gemCurrency;
                    PlayerData.totalEarned += gemCurrency;

                    // Show floating currency at gem position
                    this.showFloatingCurrency(gem.x, gem.y, gemCurrency);
                }
            });

            this.currencyText.setText(`${PlayerData.currency}`);
            savePlayerData();

            // Try to spawn bomb if match was from manual move
            if (this.lastMatchWasManual && matches.length >= 3) {
                this.trySpawnBomb(matches);
            }
            this.lastMatchWasManual = false;

            matches.forEach(({ row, col }) => {
                const gem = this.gems[row]?.[col];
                if (gem && gem.getData('state') !== GEM_STATE.MATCHED) {
                    gem.setData('state', GEM_STATE.MATCHED);
                    this.destroyGemWithEffect(gem);

                    // Don't null the cell if bomb is pending there
                    const pendingBomb = this.pendingBombSpawn;
                    if (!pendingBomb || pendingBomb.row !== row || pendingBomb.col !== col) {
                        this.board[row][col] = null;
                    }
                    this.gems[row][col] = null;
                }
            });

            // Spawn bomb after gems are destroyed
            this.spawnPendingBomb();
        }
    }

    trySpawnBomb(matches) {
        // Roll for bomb spawn chance
        if (Phaser.Math.Between(1, 100) > PlayerData.bombChance) return;

        // Find center of match (approximate)
        const centerIdx = Math.floor(matches.length / 2);
        const { row, col } = matches[centerIdx];

        // Don't spawn if there's already a bomb there
        if (this.board[row]?.[col] === 'bomb') return;

        // Immediately reserve the cell for the bomb (prevent gravity from filling it)
        // The gem at this position will be destroyed, so we mark it as bomb now
        this.pendingBombSpawn = { row, col };
    }

    // Called after match gems are destroyed
    spawnPendingBomb() {
        if (!this.pendingBombSpawn) return;

        const { row, col } = this.pendingBombSpawn;
        this.pendingBombSpawn = null;

        // Mark cell as bomb immediately to prevent gravity
        this.board[row][col] = 'bomb';

        const pos = this.getGemPosition(row, col);
        const bomb = this.add.image(pos.x, pos.y, 'bomb');
        bomb.setInteractive({ useHandCursor: true });
        bomb.setData('row', row);
        bomb.setData('col', col);
        bomb.setData('type', 'bomb');
        bomb.setData('isBomb', true);
        bomb.setData('state', GEM_STATE.IDLE);
        bomb.setData('targetY', pos.y);
        bomb.setMask(this.gemMask);

        // Spawn animation
        bomb.setScale(0);
        this.tweens.add({
            targets: bomb,
            scale: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });

        // Store in gems array
        this.gems[row][col] = bomb;
    }

    explodeBomb(bomb) {
        const row = bomb.getData('row');
        const col = bomb.getData('col');
        const radius = PlayerData.bombRadius;
        const boardSize = GameSettings.boardSize;

        // Remove the bomb from board
        this.board[row][col] = null;
        this.gems[row][col] = null;
        bomb.destroy();

        // Collect other bombs for chain reaction
        const chainBombs = [];

        // Destroy gems in circular radius
        for (let r = row - radius; r <= row + radius; r++) {
            for (let c = col - radius; c <= col + radius; c++) {
                if (r < 0 || r >= boardSize || c < 0 || c >= boardSize) continue;
                if (r === row && c === col) continue; // Skip the exploding bomb itself

                // Check circular distance
                const distance = Math.sqrt((r - row) ** 2 + (c - col) ** 2);
                if (distance > radius + 0.5) continue;

                const gem = this.gems[r]?.[c];
                if (gem && gem.getData('state') === GEM_STATE.IDLE) {
                    // Check if it's another bomb (chain reaction)
                    if (gem.getData('isBomb')) {
                        chainBombs.push(gem);
                        continue;
                    }

                    // Award currency for gems (not bombs)
                    const colorIndex = gem.getData('type');
                    const colorMultiplier = PlayerData.colorMultipliers[colorIndex] || 1;
                    PlayerData.currency += colorMultiplier;
                    PlayerData.totalEarned += colorMultiplier;
                    this.showFloatingCurrency(gem.x, gem.y, colorMultiplier);

                    // Destroy gem with effect
                    gem.setData('state', GEM_STATE.MATCHED);
                    this.destroyGemWithEffect(gem);

                    this.board[r][c] = null;
                    this.gems[r][c] = null;
                }
            }
        }

        this.currencyText.setText(`${PlayerData.currency}`);
        savePlayerData();

        // Chain reaction: explode nearby bombs after a short delay
        chainBombs.forEach(otherBomb => {
            this.time.delayedCall(100, () => {
                if (otherBomb.active) this.explodeBomb(otherBomb);
            });
        });

        // Show explosion message
        this.showMessage('💥 БУМ!');
    }

    showFloatingCurrency(x, y, amount) {
        const text = this.add.text(x, y, `+${amount}💰`, {
            fontSize: '14px',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(200);

        this.tweens.add({
            targets: text,
            scale: { from: 1, to: 1.5 },
            duration: 1500,
            ease: 'Power2',
            onComplete: () => text.destroy()
        });
    }

    destroyGemWithEffect(gem) {
        const x = gem.x;
        const y = gem.y;
        const colorIndex = gem.getData('type');
        const color = colorIndex !== 'bomb' ? ALL_GEM_COLORS[colorIndex] : 0xff6600;

        // Pop animation: scale up then down
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

        // Spawn sparkle particles
        const particleCount = 8;
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2 + Math.random() * 0.3;
            const particle = this.add.circle(x, y, 12, color);
            particle.setStrokeStyle(3, 0xffffff, 0.8);
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

    findAllMatches() {
        const boardSize = GameSettings.boardSize;
        const matchPositions = findAllMatchPositions(this.board, boardSize);

        // Filter to only include gems that are IDLE
        const filtered = matchSetToArray(matchPositions).filter(({ row, col }) => {
            const gem = this.gems[row]?.[col];
            return gem?.getData('state') === GEM_STATE.IDLE;
        });

        return filtered;
    }

    showMessage(text) {
        this.messageText.setText(text);
        this.messageText.setAlpha(1);

        this.tweens.add({
            targets: this.messageText,
            alpha: 0,
            delay: 1000,
            duration: 500
        });
    }

    restartGame() {
        const boardSize = GameSettings.boardSize;

        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                if (this.gems[row]?.[col]) {
                    this.gems[row][col].destroy();
                }
            }
        }

        this.pendingMatches.length = 0;
        this.lastMatchWasManual = false;

        this.swapHandler.clearSelection();

        this.fallManager.resetSpawnTimers(boardSize);

        this.createBoard();
        this.removeInitialMatches();

        this.showMessage('Новая игра!');
    }
}
