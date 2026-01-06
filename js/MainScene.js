import {
    ALL_GEM_COLORS,
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
    getAutoMoveUpgradeCost
} from './config.js';
import { getCellSize } from './utils.js';

export class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    init() {
        loadPlayerData();
        this.board = [];
        this.gems = [];
        this.selectedGem = null;
        this.moves = 0;
        this.lastSpawnTime = {};
        this.pendingMatches = [];
        this.lastMoveTime = 0;
        this.isAutoMoving = false;
    }

    preload() {
        this.createGemTextures();
    }

    createGemTextures() {
        const cellSize = getCellSize();
        const size = cellSize - 8;
        const radius = 10;

        for (let i = 0; i < ALL_GEM_COLORS.length; i++) {
            const key = `gem_${i}`;
            if (this.textures.exists(key)) {
                this.textures.remove(key);
            }

            const graphics = this.make.graphics({ x: 0, y: 0, add: false });
            graphics.fillStyle(ALL_GEM_COLORS[i], 1);
            graphics.fillRoundedRect(0, 0, size, size, radius);
            graphics.fillStyle(0xffffff, 0.3);
            graphics.fillRoundedRect(4, 4, size - 20, size - 20, radius - 2);
            graphics.fillStyle(0x000000, 0.2);
            graphics.fillRoundedRect(8, size - 16, size - 16, 8, 4);
            graphics.generateTexture(key, size, size);
            graphics.destroy();
        }

        if (this.textures.exists('selection')) {
            this.textures.remove('selection');
        }
        const selectGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        selectGraphics.lineStyle(4, 0xffffff, 1);
        selectGraphics.strokeRoundedRect(2, 2, cellSize - 4, cellSize - 4, 12);
        selectGraphics.generateTexture('selection', cellSize, cellSize);
        selectGraphics.destroy();
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

        this.input.on('gameobjectdown', this.onGemClick, this);

        for (let col = 0; col < boardSize; col++) {
            this.lastSpawnTime[col] = 0;
        }

        this.events.on('shutdown', this.shutdown, this);
        this.events.on('resume', this.onResume, this);
    }

    shutdown() {
        this.input.off('gameobjectdown', this.onGemClick, this);
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
        this.board = [];
        this.gems = [];
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
                let forbiddenColors = new Set();

                // Check horizontal (2 gems to the left)
                if (col >= 2 &&
                    this.board[row][col-1] === this.board[row][col-2]) {
                    forbiddenColors.add(this.board[row][col-1]);
                }

                // Check vertical (2 gems above)
                if (row >= 2 &&
                    this.board[row-1][col] === this.board[row-2][col]) {
                    forbiddenColors.add(this.board[row-1][col]);
                }

                // Pick a valid color
                let validColors = [];
                for (let c = 0; c < colorCount; c++) {
                    if (!forbiddenColors.has(c)) {
                        validColors.push(c);
                    }
                }

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
        this.updateFallingGems(delta);
        this.updateGravity();
        this.spawnNewGems(time);
        this.checkLandedGems();
        this.checkAutoMove(time);
    }

    checkAutoMove(time) {
        // Don't auto-move if already moving or board is busy
        if (this.isAutoMoving) return;
        if (this.isBoardBusy()) return;

        // Initialize lastMoveTime on first stable frame
        if (this.lastMoveTime === 0) {
            this.lastMoveTime = time;
            return;
        }

        // Check if enough time has passed
        if (time - this.lastMoveTime >= PlayerData.autoMoveDelay) {
            const validMoves = this.findValidMoves();

            if (validMoves.length > 0) {
                // Pick random valid move
                const move = validMoves[Phaser.Math.Between(0, validMoves.length - 1)];
                this.isAutoMoving = true;
                this.swapGems(move.row1, move.col1, move.row2, move.col2);
            } else {
                // No valid moves - shuffle
                this.showMessage('Нет ходов! Перемешиваю...');
                this.shuffleBoard();
            }
            this.lastMoveTime = time;
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

    findValidMoves() {
        const validMoves = [];
        const boardSize = GameSettings.boardSize;

        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                // Check right swap
                if (col < boardSize - 1) {
                    if (this.wouldCreateMatch(row, col, row, col + 1)) {
                        validMoves.push({ row1: row, col1: col, row2: row, col2: col + 1 });
                    }
                }
                // Check down swap
                if (row < boardSize - 1) {
                    if (this.wouldCreateMatch(row, col, row + 1, col)) {
                        validMoves.push({ row1: row, col1: col, row2: row + 1, col2: col });
                    }
                }
            }
        }
        return validMoves;
    }

    wouldCreateMatch(row1, col1, row2, col2) {
        // Temporarily swap
        [this.board[row1][col1], this.board[row2][col2]] = [this.board[row2][col2], this.board[row1][col1]];

        // Check if either position now has a match
        const hasMatch = this.checkMatchAt(row1, col1) || this.checkMatchAt(row2, col2);

        // Swap back
        [this.board[row1][col1], this.board[row2][col2]] = [this.board[row2][col2], this.board[row1][col1]];

        return hasMatch;
    }

    checkMatchAt(row, col) {
        const type = this.board[row][col];
        if (type === null || type === undefined) return false;

        const boardSize = GameSettings.boardSize;

        // Check horizontal
        let count = 1;
        for (let c = col - 1; c >= 0 && this.board[row][c] === type; c--) count++;
        for (let c = col + 1; c < boardSize && this.board[row][c] === type; c++) count++;
        if (count >= 3) return true;

        // Check vertical
        count = 1;
        for (let r = row - 1; r >= 0 && this.board[r][col] === type; r--) count++;
        for (let r = row + 1; r < boardSize && this.board[r][col] === type; r++) count++;
        if (count >= 3) return true;

        return false;
    }

    shuffleBoard() {
        const boardSize = GameSettings.boardSize;

        // Collect all gem types
        const types = [];
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                if (this.board[row][col] !== null) {
                    types.push(this.board[row][col]);
                }
            }
        }

        // Fisher-Yates shuffle
        for (let i = types.length - 1; i > 0; i--) {
            const j = Phaser.Math.Between(0, i);
            [types[i], types[j]] = [types[j], types[i]];
        }

        // Reassign
        let idx = 0;
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                if (this.board[row][col] !== null && idx < types.length) {
                    this.board[row][col] = types[idx];
                    const gem = this.gems[row][col];
                    if (gem) {
                        gem.setTexture(`gem_${types[idx]}`);
                        gem.setData('type', types[idx]);
                    }
                    idx++;
                }
            }
        }

        // Remove any initial matches after shuffle
        this.removeInitialMatches();

        // Check if we have valid moves now, if not shuffle again
        if (this.findValidMoves().length === 0) {
            this.shuffleBoard();
        }
    }

    updateFallingGems(delta) {
        const cellSize = getCellSize();
        const fallAmount = (GameSettings.fallSpeed * cellSize * delta) / 1000;
        const boardSize = GameSettings.boardSize;

        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const gem = this.gems[row]?.[col];
                if (!gem) continue;

                if (gem.getData('state') === GEM_STATE.FALLING) {
                    const targetY = gem.getData('targetY');

                    if (gem.y < targetY) {
                        gem.y = Math.min(gem.y + fallAmount, targetY);

                        if (gem.y >= targetY) {
                            gem.y = targetY;
                            gem.setData('state', GEM_STATE.IDLE);
                            this.pendingMatches.push({ row, col });
                        }
                    }
                }
            }
        }
    }

    updateGravity() {
        const boardSize = GameSettings.boardSize;

        for (let col = 0; col < boardSize; col++) {
            for (let row = boardSize - 1; row >= 0; row--) {
                if (this.board[row][col] === null) {
                    for (let aboveRow = row - 1; aboveRow >= 0; aboveRow--) {
                        if (this.board[aboveRow][col] !== null) {
                            const gem = this.gems[aboveRow][col];
                            if (gem && gem.getData('state') === GEM_STATE.IDLE) {
                                this.board[row][col] = this.board[aboveRow][col];
                                this.board[aboveRow][col] = null;

                                this.gems[row][col] = gem;
                                this.gems[aboveRow][col] = null;

                                gem.setData('row', row);
                                gem.setData('targetY', this.getGemPosition(row, col).y);
                                gem.setData('state', GEM_STATE.FALLING);
                            }
                            break;
                        }
                    }
                }
            }
        }
    }

    spawnNewGems(time) {
        const boardSize = GameSettings.boardSize;
        const cellSize = getCellSize();
        const gap = GameSettings.gap;

        for (let col = 0; col < boardSize; col++) {
            if (this.board[0][col] === null) {
                if (time - this.lastSpawnTime[col] >= GameSettings.spawnDelay) {
                    let canSpawn = true;
                    for (let r = 0; r < boardSize; r++) {
                        const gem = this.gems[r]?.[col];
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
                        const gem = this.createGem(0, col, gemType, startY);

                        this.board[0][col] = gemType;
                        this.gems[0][col] = gem;
                        gem.setData('state', GEM_STATE.FALLING);

                        this.lastSpawnTime[col] = time;
                    }
                }
            }
        }
    }

    checkLandedGems() {
        if (this.pendingMatches.length === 0) return;

        this.pendingMatches = [];
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

                    this.board[row][col] = null;
                    this.gems[row][col] = null;
                }
            });
        }
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

    onGemClick(pointer, gem) {
        if (gem.getData('state') !== GEM_STATE.IDLE) return;

        const row = gem.getData('row');
        const col = gem.getData('col');

        if (this.selectedGem === null) {
            this.selectedGem = { row, col, gem };
            const pos = this.getGemPosition(row, col);
            this.selectionIndicator.setPosition(pos.x, pos.y);
            this.selectionIndicator.setVisible(true);

            this.tweens.killTweensOf(this.selectionIndicator);
            this.tweens.add({
                targets: this.selectionIndicator,
                scale: { from: 1, to: 1.1 },
                duration: 300,
                yoyo: true,
                repeat: -1
            });
        } else {
            const { row: prevRow, col: prevCol, gem: prevGem } = this.selectedGem;

            if (!prevGem || prevGem.getData('state') !== GEM_STATE.IDLE) {
                this.clearSelection();
                return;
            }

            if (this.areAdjacent(prevRow, prevCol, row, col)) {
                this.clearSelection();
                this.lastMoveTime = this.time.now; // Reset auto-move timer
                this.swapGems(prevRow, prevCol, row, col);
            } else {
                this.selectedGem = { row, col, gem };
                const pos = this.getGemPosition(row, col);
                this.selectionIndicator.setPosition(pos.x, pos.y);
            }
        }
    }

    clearSelection() {
        this.selectedGem = null;
        this.selectionIndicator.setVisible(false);
        this.tweens.killTweensOf(this.selectionIndicator);
        this.selectionIndicator.setScale(1);
    }

    areAdjacent(row1, col1, row2, col2) {
        const rowDiff = Math.abs(row1 - row2);
        const colDiff = Math.abs(col1 - col2);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    swapGems(row1, col1, row2, col2) {
        const gem1 = this.gems[row1][col1];
        const gem2 = this.gems[row2][col2];
        const wasAutoMove = this.isAutoMoving;

        if (!gem1 || !gem2) return;
        if (gem1.getData('state') !== GEM_STATE.IDLE) return;
        if (gem2.getData('state') !== GEM_STATE.IDLE) return;

        gem1.setData('state', GEM_STATE.SWAPPING);
        gem2.setData('state', GEM_STATE.SWAPPING);

        const pos1 = this.getGemPosition(row1, col1);
        const pos2 = this.getGemPosition(row2, col2);

        [this.board[row1][col1], this.board[row2][col2]] = [this.board[row2][col2], this.board[row1][col1]];
        [this.gems[row1][col1], this.gems[row2][col2]] = [this.gems[row2][col2], this.gems[row1][col1]];

        gem1.setData('row', row2);
        gem1.setData('col', col2);
        gem2.setData('row', row1);
        gem2.setData('col', col1);

        this.tweens.add({
            targets: gem1,
            x: pos2.x,
            y: pos2.y,
            duration: SWAP_DURATION,
            ease: 'Power2'
        });

        this.tweens.add({
            targets: gem2,
            x: pos1.x,
            y: pos1.y,
            duration: SWAP_DURATION,
            ease: 'Power2',
            onComplete: () => {
                gem1.setData('state', GEM_STATE.IDLE);
                gem2.setData('state', GEM_STATE.IDLE);
                gem1.setData('targetY', pos2.y);
                gem2.setData('targetY', pos1.y);

                const matches = this.findAllMatches();

                if (matches.length > 0) {
                    this.moves++;
                    this.movesText.setText(this.moves.toString());
                    this.isAutoMoving = false;

                    this.pendingMatches.push({ row: row2, col: col2 });
                    this.pendingMatches.push({ row: row1, col: col1 });
                } else {
                    gem1.setData('state', GEM_STATE.SWAPPING);
                    gem2.setData('state', GEM_STATE.SWAPPING);

                    [this.board[row1][col1], this.board[row2][col2]] = [this.board[row2][col2], this.board[row1][col1]];
                    [this.gems[row1][col1], this.gems[row2][col2]] = [this.gems[row2][col2], this.gems[row1][col1]];

                    gem1.setData('row', row1);
                    gem1.setData('col', col1);
                    gem2.setData('row', row2);
                    gem2.setData('col', col2);

                    this.tweens.add({
                        targets: gem1,
                        x: pos1.x,
                        y: pos1.y,
                        duration: SWAP_DURATION,
                        ease: 'Power2'
                    });

                    this.tweens.add({
                        targets: gem2,
                        x: pos2.x,
                        y: pos2.y,
                        duration: SWAP_DURATION,
                        ease: 'Power2',
                        onComplete: () => {
                            gem1.setData('state', GEM_STATE.IDLE);
                            gem2.setData('state', GEM_STATE.IDLE);
                            gem1.setData('targetY', pos1.y);
                            gem2.setData('targetY', pos2.y);
                            this.isAutoMoving = false;
                        }
                    });

                    if (!wasAutoMove) {
                        this.showMessage('Нет совпадений!');
                    }
                    this.isAutoMoving = false;
                }
            }
        });
    }

    findAllMatches() {
        const matches = new Set();
        const boardSize = GameSettings.boardSize;

        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize - 2; col++) {
                const type = this.board[row]?.[col];
                if (type !== null && type !== undefined &&
                    type === this.board[row]?.[col + 1] &&
                    type === this.board[row]?.[col + 2]) {
                    const g1 = this.gems[row]?.[col];
                    const g2 = this.gems[row]?.[col + 1];
                    const g3 = this.gems[row]?.[col + 2];
                    if (g1?.getData('state') === GEM_STATE.IDLE &&
                        g2?.getData('state') === GEM_STATE.IDLE &&
                        g3?.getData('state') === GEM_STATE.IDLE) {
                        matches.add(`${row},${col}`);
                        matches.add(`${row},${col + 1}`);
                        matches.add(`${row},${col + 2}`);

                        let k = col + 3;
                        while (k < boardSize && this.board[row]?.[k] === type) {
                            const gk = this.gems[row]?.[k];
                            if (gk?.getData('state') === GEM_STATE.IDLE) {
                                matches.add(`${row},${k}`);
                            }
                            k++;
                        }
                    }
                }
            }
        }

        for (let col = 0; col < boardSize; col++) {
            for (let row = 0; row < boardSize - 2; row++) {
                const type = this.board[row]?.[col];
                if (type !== null && type !== undefined &&
                    type === this.board[row + 1]?.[col] &&
                    type === this.board[row + 2]?.[col]) {
                    const g1 = this.gems[row]?.[col];
                    const g2 = this.gems[row + 1]?.[col];
                    const g3 = this.gems[row + 2]?.[col];
                    if (g1?.getData('state') === GEM_STATE.IDLE &&
                        g2?.getData('state') === GEM_STATE.IDLE &&
                        g3?.getData('state') === GEM_STATE.IDLE) {
                        matches.add(`${row},${col}`);
                        matches.add(`${row + 1},${col}`);
                        matches.add(`${row + 2},${col}`);

                        let k = row + 3;
                        while (k < boardSize && this.board[k]?.[col] === type) {
                            const gk = this.gems[k]?.[col];
                            if (gk?.getData('state') === GEM_STATE.IDLE) {
                                matches.add(`${k},${col}`);
                            }
                            k++;
                        }
                    }
                }
            }
        }

        return Array.from(matches).map(pos => {
            const [row, col] = pos.split(',').map(Number);
            return { row, col };
        });
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
        this.selectedGem = null;
        this.pendingMatches = [];

        this.movesText.setText('0');

        this.clearSelection();

        for (let col = 0; col < boardSize; col++) {
            this.lastSpawnTime[col] = 0;
        }

        this.createBoard();
        this.removeInitialMatches();

        this.showMessage('Новая игра!');
    }
}
