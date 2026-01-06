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
    savePlayerData
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
        this.moves = 0;
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

        this.input.on('gameobjectdown', (pointer, gameObject) => {
            if (gameObject.getData('isBomb')) {
                this.explodeBomb(gameObject);
            } else {
                this.swapHandler.onGemClick(pointer, gameObject);
            }
        });

        this.fallManager.initSpawnTimers(boardSize);

        this.events.on('shutdown', this.shutdown, this);
        this.events.on('resume', this.onResume, this);
    }

    shutdown() {
        this.input.off('gameobjectdown');
    }

    onResume() {
        // Update currency display when returning from upgrades
        this.currencyText.setText(`${PlayerData.currency}`);
    }

    createUI() {
        this.add.text(
            this.cameras.main.width / 2, 30,
            '🎮 Match-3',
            { fontSize: '32px', fontFamily: 'Segoe UI', color: '#e94560' }
        ).setOrigin(0.5);

        const panelY = 75;
        const panelSpacing = 150;
        const startX = this.cameras.main.width / 2 - panelSpacing / 2;

        this.add.text(startX, panelY, '💰 ДЕНЬГИ', { fontSize: '12px', color: '#aaaaaa' }).setOrigin(0.5);
        this.currencyText = this.add.text(startX, panelY + 20, `${PlayerData.currency}`, { fontSize: '24px', color: '#f1c40f', fontStyle: 'bold' }).setOrigin(0.5);

        this.add.text(startX + panelSpacing, panelY, '👆 ХОДЫ', { fontSize: '12px', color: '#aaaaaa' }).setOrigin(0.5);
        this.movesText = this.add.text(startX + panelSpacing, panelY + 20, '0', { fontSize: '24px', color: '#e94560', fontStyle: 'bold' }).setOrigin(0.5);

        this.messageText = this.add.text(
            this.cameras.main.width / 2,
            BOARD_OFFSET_Y + BOARD_TOTAL_SIZE + 25,
            '',
            { fontSize: '18px', color: '#55efc4' }
        ).setOrigin(0.5);

        const btnY = BOARD_OFFSET_Y + BOARD_TOTAL_SIZE + 60;
        const btnWidth = 95;
        const btnSpacing = 100;

        // New game button
        const newGameBtn = this.add.rectangle(this.cameras.main.width / 2 - btnSpacing, btnY, btnWidth, 40, 0xe94560)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => newGameBtn.setFillStyle(0xc0392b))
            .on('pointerout', () => newGameBtn.setFillStyle(0xe94560))
            .on('pointerdown', () => this.restartGame());
        this.add.text(this.cameras.main.width / 2 - btnSpacing, btnY, '🔄 Новая', { fontSize: '12px', color: '#ffffff' }).setOrigin(0.5);

        // Upgrades button
        const upgradesBtn = this.add.rectangle(this.cameras.main.width / 2, btnY, btnWidth, 40, 0x9b59b6)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => upgradesBtn.setFillStyle(0x8e44ad))
            .on('pointerout', () => upgradesBtn.setFillStyle(0x9b59b6))
            .on('pointerdown', () => this.scene.launch('UpgradesScene'));
        this.add.text(this.cameras.main.width / 2, btnY, '⬆️ Апгрейд', { fontSize: '12px', color: '#ffffff' }).setOrigin(0.5);

        // Settings button
        const settingsBtn = this.add.rectangle(this.cameras.main.width / 2 + btnSpacing, btnY, btnWidth, 40, 0x3498db)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => settingsBtn.setFillStyle(0x2980b9))
            .on('pointerout', () => settingsBtn.setFillStyle(0x3498db))
            .on('pointerdown', () => this.scene.launch('SettingsScene'));
        this.add.text(this.cameras.main.width / 2 + btnSpacing, btnY, '⚙️ Опции', { fontSize: '12px', color: '#ffffff' }).setOrigin(0.5);

        this.buildText = this.add.text(
            10,
            this.cameras.main.height - 10,
            `JS: ${JS_VERSION}`,
            { fontSize: '14px', color: '#888888' }
        ).setOrigin(0, 1);
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

                    this.tweens.add({
                        targets: gem,
                        scale: 0,
                        alpha: 0,
                        duration: 150,
                        ease: 'Power2',
                        onComplete: () => gem.destroy()
                    });

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

        // Destroy gems in radius
        for (let r = row - radius; r <= row + radius; r++) {
            for (let c = col - radius; c <= col + radius; c++) {
                if (r < 0 || r >= boardSize || c < 0 || c >= boardSize) continue;
                if (r === row && c === col) continue; // Skip the exploding bomb itself

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

                    // Destroy gem with explosion effect
                    gem.setData('state', GEM_STATE.MATCHED);
                    this.tweens.add({
                        targets: gem,
                        scale: 1.5,
                        alpha: 0,
                        duration: 200,
                        ease: 'Power2',
                        onComplete: () => gem.destroy()
                    });

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

        this.moves = 0;
        this.pendingMatches.length = 0;
        this.lastMatchWasManual = false;

        this.movesText.setText('0');

        this.swapHandler.clearSelection();

        this.fallManager.resetSpawnTimers(boardSize);

        this.createBoard();
        this.removeInitialMatches();

        this.showMessage('Новая игра!');
    }
}
