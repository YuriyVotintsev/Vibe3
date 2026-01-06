import {
    GameSettings,
    ALL_GEM_COLORS,
    COLOR_NAMES,
    PlayerData,
    getUpgradeCost,
    upgradeColor,
    getAutoMoveUpgradeCost,
    getAutoMoveStep,
    upgradeAutoMove,
    getBombChanceUpgradeCost,
    upgradeBombChance,
    getBombRadiusUpgradeCost,
    upgradeBombRadius
} from './config.js';

export class UpgradesScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UpgradesScene' });
    }

    create() {
        const W = this.cameras.main.width;
        const H = this.cameras.main.height;
        const cx = W / 2;

        // Panel bounds (button is outside, below panel)
        const panelTop = 20;
        const panelBottom = H - 90;
        const panelHeight = panelBottom - panelTop;

        // Scroll area bounds (inside panel)
        this.scrollTop = 150;
        this.scrollBottom = panelBottom - 15;
        this.scrollHeight = this.scrollBottom - this.scrollTop;

        // Track last currency for live updates
        this.lastCurrency = PlayerData.currency;

        // Dark overlay (covers entire screen)
        this.add.rectangle(cx, H / 2, W, H, 0x000000, 0.85);

        // Panel background (smaller, doesn't include button)
        const panel = this.add.graphics();
        panel.fillStyle(0x1e1e2e, 1);
        panel.fillRoundedRect(15, panelTop, W - 30, panelHeight, 16);
        panel.lineStyle(3, 0x9b59b6, 1);
        panel.strokeRoundedRect(15, panelTop, W - 30, panelHeight, 16);

        // Title (fixed)
        this.add.text(cx, 55, 'АПГРЕЙДЫ', {
            fontSize: '28px',
            fontFamily: 'Arial Black',
            color: '#ffffff'
        }).setOrigin(0.5).setShadow(2, 2, '#000000', 4);

        // Currency display (fixed)
        const currencyBg = this.add.graphics();
        currencyBg.fillStyle(0xf39c12, 0.3);
        currencyBg.fillRoundedRect(cx - 100, 85, 200, 50, 12);
        this.add.text(cx - 60, 110, '💰', { fontSize: '28px' }).setOrigin(0.5);
        this.currencyText = this.add.text(cx + 10, 110, `${PlayerData.currency}`, {
            fontSize: '28px', color: '#f1c40f', fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        // Create scrollable container
        this.scrollContainer = this.add.container(0, 0);

        // Create mask for scroll area
        const maskShape = this.make.graphics();
        maskShape.fillRect(20, this.scrollTop, W - 40, this.scrollHeight);
        const mask = maskShape.createGeometryMask();
        this.scrollContainer.setMask(mask);

        // Build upgrade list inside container
        this.contentHeight = this.createUpgradeList();
        this.scrollY = 0;
        this.maxScroll = Math.max(0, this.contentHeight - this.scrollHeight);

        // Setup scroll input
        this.setupScrollInput();

        // Close button (outside panel, on overlay)
        this.createCloseButton();

        // Scroll indicator
        this.createScrollIndicator();
    }

    update() {
        // Live update when currency changes (game runs in background)
        if (PlayerData.currency !== this.lastCurrency) {
            this.lastCurrency = PlayerData.currency;
            this.currencyText.setText(`${PlayerData.currency}`);
            this.refreshAllRows();
        }
    }

    createUpgradeList() {
        const W = this.cameras.main.width;
        const cx = W / 2;
        let y = this.scrollTop;

        this.upgradeRows = [];

        // Auto-move upgrade
        y = this.createUpgradeRow(y, '⏱️', 'Авто-ход', () => {
            const seconds = (PlayerData.autoMoveDelay / 1000).toFixed(1);
            return `${seconds}с`;
        }, () => {
            const atMin = PlayerData.autoMoveDelay <= 100;
            return atMin ? 'MAX' : `${getAutoMoveUpgradeCost()}💰`;
        }, () => {
            const step = getAutoMoveStep();
            return `-${step / 1000}с`;
        }, () => {
            const atMin = PlayerData.autoMoveDelay <= 100;
            return !atMin && PlayerData.currency >= getAutoMoveUpgradeCost();
        }, () => upgradeAutoMove());

        // Bomb chance upgrade
        y = this.createUpgradeRow(y, '💣', 'Шанс бомбы', () => {
            return `${PlayerData.bombChance}%`;
        }, () => {
            const atMax = PlayerData.bombChance >= 50;
            return atMax ? 'MAX' : `${getBombChanceUpgradeCost()}💰`;
        }, () => '+5%', () => {
            const atMax = PlayerData.bombChance >= 50;
            return !atMax && PlayerData.currency >= getBombChanceUpgradeCost();
        }, () => upgradeBombChance());

        // Bomb radius upgrade
        y = this.createUpgradeRow(y, '💥', 'Радиус', () => {
            return `${PlayerData.bombRadius}`;
        }, () => {
            const atMax = PlayerData.bombRadius >= 3;
            return atMax ? 'MAX' : `${getBombRadiusUpgradeCost()}💰`;
        }, () => '+1', () => {
            const atMax = PlayerData.bombRadius >= 3;
            return !atMax && PlayerData.currency >= getBombRadiusUpgradeCost();
        }, () => upgradeBombRadius());

        // Separator
        y += 15;
        const separator = this.add.text(cx, y, '— МНОЖИТЕЛИ —', {
            fontSize: '14px', color: '#9b59b6', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.scrollContainer.add(separator);
        y += 25;

        // Color upgrades
        const colorCount = GameSettings.colorCount;
        for (let i = 0; i < colorCount; i++) {
            y = this.createColorUpgradeRow(y, i);
        }

        return y - this.scrollTop + 20;
    }

    createUpgradeRow(y, icon, name, getValue, getCost, getAction, canAfford, onBuy) {
        const W = this.cameras.main.width;

        // Row background
        const rowBg = this.add.graphics();
        rowBg.fillStyle(0x2a2a3e, 0.5);
        rowBg.fillRoundedRect(25, y, W - 50, 55, 10);
        this.scrollContainer.add(rowBg);

        // Icon
        const iconText = this.add.text(40, y + 28, icon, { fontSize: '22px' }).setOrigin(0, 0.5);
        this.scrollContainer.add(iconText);

        // Name
        const nameText = this.add.text(72, y + 28, name, {
            fontSize: '16px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        this.scrollContainer.add(nameText);

        // Value
        const valueText = this.add.text(185, y + 28, getValue(), {
            fontSize: '18px', color: '#55efc4', fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        this.scrollContainer.add(valueText);

        // Cost
        const costText = this.add.text(255, y + 28, getCost(), {
            fontSize: '14px', color: '#f1c40f'
        }).setOrigin(0, 0.5);
        this.scrollContainer.add(costText);

        // Button
        const btnX = W - 60;
        const btnSize = 44;
        const affordable = canAfford();

        const btn = this.add.graphics();
        btn.fillStyle(affordable ? 0x27ae60 : 0x555555, 1);
        btn.fillRoundedRect(btnX - btnSize / 2, y + 28 - btnSize / 2, btnSize, btnSize, 8);
        this.scrollContainer.add(btn);

        const btnLabel = this.add.text(btnX, y + 28, getAction(), {
            fontSize: '12px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.scrollContainer.add(btnLabel);

        const hitArea = this.add.rectangle(btnX, y + 28, btnSize, btnSize, 0x000000, 0)
            .setInteractive({ useHandCursor: affordable })
            .on('pointerover', () => {
                if (canAfford()) btn.clear().fillStyle(0x2ecc71, 1).fillRoundedRect(btnX - btnSize / 2, y + 28 - btnSize / 2, btnSize, btnSize, 8);
            })
            .on('pointerout', () => {
                btn.clear().fillStyle(canAfford() ? 0x27ae60 : 0x555555, 1).fillRoundedRect(btnX - btnSize / 2, y + 28 - btnSize / 2, btnSize, btnSize, 8);
            })
            .on('pointerdown', () => {
                if (canAfford() && onBuy()) {
                    this.currencyText.setText(`${PlayerData.currency}`);
                    this.refreshAllRows();
                }
            });
        this.scrollContainer.add(hitArea);

        this.upgradeRows.push({ valueText, costText, btn, hitArea, btnX, y, btnSize, getValue, getCost, canAfford });

        return y + 62;
    }

    createColorUpgradeRow(y, colorIndex) {
        const W = this.cameras.main.width;

        // Row background
        const rowBg = this.add.graphics();
        rowBg.fillStyle(0x2a2a3e, 0.3);
        rowBg.fillRoundedRect(25, y, W - 50, 44, 8);
        this.scrollContainer.add(rowBg);

        // Color preview
        const preview = this.add.graphics();
        preview.fillStyle(ALL_GEM_COLORS[colorIndex], 1);
        preview.fillRoundedRect(35, y + 8, 28, 28, 5);
        preview.lineStyle(1, 0xffffff, 0.3);
        preview.strokeRoundedRect(35, y + 8, 28, 28, 5);
        this.scrollContainer.add(preview);

        // Name
        const nameText = this.add.text(72, y + 22, COLOR_NAMES[colorIndex], {
            fontSize: '14px', color: '#e0e0e0'
        }).setOrigin(0, 0.5);
        this.scrollContainer.add(nameText);

        // Value
        const getValue = () => `x${PlayerData.colorMultipliers[colorIndex] || 1}`;
        const valueText = this.add.text(175, y + 22, getValue(), {
            fontSize: '16px', color: '#55efc4', fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        this.scrollContainer.add(valueText);

        // Cost
        const getCost = () => `${getUpgradeCost(colorIndex)}💰`;
        const costText = this.add.text(230, y + 22, getCost(), {
            fontSize: '12px', color: '#f1c40f'
        }).setOrigin(0, 0.5);
        this.scrollContainer.add(costText);

        // Button
        const btnX = W - 60;
        const btnW = 44;
        const btnH = 32;
        const canAfford = () => PlayerData.currency >= getUpgradeCost(colorIndex);

        const btn = this.add.graphics();
        btn.fillStyle(canAfford() ? 0x27ae60 : 0x555555, 1);
        btn.fillRoundedRect(btnX - btnW / 2, y + 22 - btnH / 2, btnW, btnH, 6);
        this.scrollContainer.add(btn);

        const btnLabel = this.add.text(btnX, y + 22, '+1', {
            fontSize: '12px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.scrollContainer.add(btnLabel);

        const hitArea = this.add.rectangle(btnX, y + 22, btnW, btnH, 0x000000, 0)
            .setInteractive({ useHandCursor: canAfford() })
            .on('pointerover', () => {
                if (canAfford()) btn.clear().fillStyle(0x2ecc71, 1).fillRoundedRect(btnX - btnW / 2, y + 22 - btnH / 2, btnW, btnH, 6);
            })
            .on('pointerout', () => {
                btn.clear().fillStyle(canAfford() ? 0x27ae60 : 0x555555, 1).fillRoundedRect(btnX - btnW / 2, y + 22 - btnH / 2, btnW, btnH, 6);
            })
            .on('pointerdown', () => {
                if (canAfford() && upgradeColor(colorIndex)) {
                    this.currencyText.setText(`${PlayerData.currency}`);
                    this.refreshAllRows();
                }
            });
        this.scrollContainer.add(hitArea);

        this.upgradeRows.push({
            valueText, costText, btn, hitArea,
            btnX, y, btnSize: btnH, btnW,
            getValue, getCost, canAfford, isColor: true
        });

        return y + 50;
    }

    setupScrollInput() {
        // Track drag state
        this.isDragging = false;
        this.lastPointerY = 0;

        // Start drag
        this.input.on('pointerdown', (pointer) => {
            this.isDragging = true;
            this.lastPointerY = pointer.y;
        });

        // Drag to scroll
        this.input.on('pointermove', (pointer) => {
            if (this.isDragging && pointer.isDown && this.maxScroll > 0) {
                const dy = this.lastPointerY - pointer.y;
                this.lastPointerY = pointer.y;
                this.scrollBy(dy);
            }
        });

        // End drag
        this.input.on('pointerup', () => {
            this.isDragging = false;
        });

        // Mouse wheel
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            this.scrollBy(deltaY * 0.5);
        });
    }

    scrollBy(delta) {
        this.scrollY = Phaser.Math.Clamp(this.scrollY + delta, 0, this.maxScroll);
        this.scrollContainer.y = -this.scrollY;
        this.updateScrollIndicator();
    }

    createScrollIndicator() {
        if (this.maxScroll <= 0) return;

        const W = this.cameras.main.width;
        const trackX = W - 25;
        const trackTop = this.scrollTop + 5;
        const trackHeight = this.scrollHeight - 10;

        // Track
        this.scrollTrack = this.add.graphics();
        this.scrollTrack.fillStyle(0x333333, 0.5);
        this.scrollTrack.fillRoundedRect(trackX - 3, trackTop, 6, trackHeight, 3);

        // Thumb
        const thumbHeight = Math.max(30, (this.scrollHeight / this.contentHeight) * trackHeight);
        this.scrollThumb = this.add.graphics();
        this.scrollThumbHeight = thumbHeight;
        this.scrollTrackTop = trackTop;
        this.scrollTrackHeight = trackHeight;
        this.scrollTrackX = trackX;

        this.updateScrollIndicator();
    }

    updateScrollIndicator() {
        if (!this.scrollThumb || this.maxScroll <= 0) return;

        const progress = this.scrollY / this.maxScroll;
        const thumbY = this.scrollTrackTop + progress * (this.scrollTrackHeight - this.scrollThumbHeight);

        this.scrollThumb.clear();
        this.scrollThumb.fillStyle(0x9b59b6, 0.8);
        this.scrollThumb.fillRoundedRect(this.scrollTrackX - 3, thumbY, 6, this.scrollThumbHeight, 3);
    }

    refreshAllRows() {
        for (const row of this.upgradeRows) {
            row.valueText.setText(row.getValue());
            row.costText.setText(row.getCost());
            const affordable = row.canAfford();
            const col = affordable ? 0x27ae60 : 0x555555;

            if (row.isColor) {
                const btnW = row.btnW || 44;
                const btnH = row.btnSize;
                row.btn.clear().fillStyle(col, 1).fillRoundedRect(row.btnX - btnW / 2, row.y + 22 - btnH / 2, btnW, btnH, 6);
            } else {
                row.btn.clear().fillStyle(col, 1).fillRoundedRect(row.btnX - row.btnSize / 2, row.y + 28 - row.btnSize / 2, row.btnSize, row.btnSize, 8);
            }
            row.hitArea.setInteractive({ useHandCursor: affordable });
        }
    }

    createCloseButton() {
        const W = this.cameras.main.width;
        const H = this.cameras.main.height;
        const cx = W / 2;
        const btnY = H - 45;
        const btnWidth = W - 60;
        const btnHeight = 50;

        // Button directly on overlay (no background needed)
        const btn = this.add.graphics();
        btn.fillStyle(0xe74c3c, 1);
        btn.fillRoundedRect(cx - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 12);

        this.add.rectangle(cx, btnY, btnWidth, btnHeight, 0x000000, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                btn.clear().fillStyle(0xc0392b, 1).fillRoundedRect(cx - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 12);
            })
            .on('pointerout', () => {
                btn.clear().fillStyle(0xe74c3c, 1).fillRoundedRect(cx - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 12);
            })
            .on('pointerdown', () => this.scene.stop());

        this.add.text(cx, btnY, '✕ ЗАКРЫТЬ', {
            fontSize: '18px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);
    }
}
