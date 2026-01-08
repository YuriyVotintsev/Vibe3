// UpgradesScene.js - Upgrades menu scene (redesigned)

import { PlayerData, formatNumber } from './config.js';
import { getRegularUpgrades } from './data/upgradesData.js';
import { COLORS, FONT_SIZE, RADIUS } from './styles.js';
import { Button } from './ui/Button.js';

export class UpgradesScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UpgradesScene' });
    }

    create() {
        const W = this.cameras.main.width;
        const H = this.cameras.main.height;
        const cx = W / 2;
        const padding = 15;

        // Dark overlay
        this.add.rectangle(cx, H / 2, W, H, COLORS.bgOverlay, 0.92);

        // Main panel
        const panel = this.add.graphics();
        panel.fillStyle(COLORS.bgPanel, 1);
        panel.fillRoundedRect(padding, 15, W - padding * 2, H - 30, RADIUS['2xl']);
        panel.lineStyle(2, COLORS.primary, 0.8);
        panel.strokeRoundedRect(padding, 15, W - padding * 2, H - 30, RADIUS['2xl']);

        // === HEADER ===
        this.add.text(cx, 38, '⬆️ АПГРЕЙДЫ', {
            fontSize: FONT_SIZE['3xl'],
            fontFamily: 'Arial Black',
            color: '#ffffff'
        }).setOrigin(0.5);

        // === CURRENCY CARD ===
        this.createCurrencyCard(W, cx);

        // === SCROLL AREA SETUP ===
        this.scrollTop = 150;
        this.scrollBottom = H - 100;
        this.scrollHeight = this.scrollBottom - this.scrollTop;

        // Create scrollable container
        this.scrollContainer = this.add.container(0, 0);

        // Mask for scroll area
        const maskShape = this.make.graphics();
        maskShape.fillRect(20, this.scrollTop, W - 40, this.scrollHeight);
        this.scrollContainer.setMask(maskShape.createGeometryMask());

        // Build upgrade grid
        this.contentHeight = this.createUpgradeGrid(W, padding);
        this.scrollY = 0;
        this.maxScroll = Math.max(0, this.contentHeight - this.scrollHeight);

        // Scroll input
        this.setupScrollInput();

        // Scroll indicator
        if (this.maxScroll > 0) {
            this.createScrollIndicator(W);
        }

        // === CLOSE BUTTON ===
        new Button(this, {
            x: cx,
            y: H - 45,
            width: W - padding * 2 - 20,
            height: 52,
            text: '← НАЗАД',
            style: 'secondary',
            radius: RADIUS.xl,
            fontSize: FONT_SIZE['2xl'],
            onClick: () => this.scene.stop()
        });

        // Track currency
        this.lastCurrency = PlayerData.currency;
    }

    createCurrencyCard(W, cx) {
        const y = 75;

        // Card background
        const cardBg = this.add.graphics();
        cardBg.fillStyle(0x1a3a2a, 1); // dark green
        cardBg.fillRoundedRect(25, y - 5, W - 50, 55, RADIUS.lg);
        cardBg.lineStyle(2, COLORS.success, 0.6);
        cardBg.strokeRoundedRect(25, y - 5, W - 50, 55, RADIUS.lg);

        // Currency text centered
        this.currencyText = this.add.text(cx, y + 20, `💰 ${formatNumber(PlayerData.currency)}`, {
            fontSize: FONT_SIZE['4xl'],
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    createUpgradeGrid(W, padding) {
        const startY = this.scrollTop;
        const gap = 10;
        const cols = 2;
        const contentWidth = W - padding * 2 - 20;
        const btnWidth = Math.floor((contentWidth - gap * (cols - 1)) / cols);
        const btnHeight = 85;

        const upgrades = getRegularUpgrades();
        this.upgradeButtons = [];

        for (let i = 0; i < upgrades.length; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = padding + 10 + col * (btnWidth + gap);
            const y = startY + row * (btnHeight + gap);

            this.createUpgradeButton(x, y, btnWidth, btnHeight, upgrades[i]);
        }

        const rows = Math.ceil(upgrades.length / cols);
        return rows * (btnHeight + gap) + 20;
    }

    createUpgradeButton(x, y, width, height, upgrade) {
        const cost = upgrade.getCost();
        const isMaxed = cost === null;
        const canAfford = !isMaxed && upgrade.canAfford();

        // Background
        const bg = this.add.graphics();
        let bgColor = isMaxed ? COLORS.bgDisabled : (canAfford ? COLORS.success : COLORS.bgButton);
        bg.fillStyle(bgColor, 1);
        bg.fillRoundedRect(x, y, width, height, RADIUS.lg);

        if (!isMaxed) {
            bg.lineStyle(2, canAfford ? COLORS.successBright : COLORS.borderLight, 1);
            bg.strokeRoundedRect(x, y, width, height, RADIUS.lg);
        }

        // Add to scroll container
        this.scrollContainer.add(bg);

        // Name
        const nameText = this.add.text(x + width / 2, y + 18, upgrade.getName(), {
            fontSize: FONT_SIZE.xl,
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.scrollContainer.add(nameText);

        // Value
        const valueText = this.add.text(x + width / 2, y + 44, upgrade.getValue(), {
            fontSize: FONT_SIZE['2xl'],
            color: '#55efc4',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.scrollContainer.add(valueText);

        // Cost - always bright
        const costText = isMaxed ? 'MAX' : `${formatNumber(cost)} 💰`;
        const costLabel = this.add.text(x + width / 2, y + 68, costText, {
            fontSize: FONT_SIZE.lg,
            color: isMaxed ? '#666666' : '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.scrollContainer.add(costLabel);

        // Level - bottom right
        const levelText = this.add.text(x + width - 8, y + height - 8, upgrade.getLevel(), {
            fontSize: FONT_SIZE.base,
            color: '#ffffff'
        }).setOrigin(1, 1);
        this.scrollContainer.add(levelText);

        // Hit area
        if (!isMaxed) {
            const hitArea = this.add.rectangle(x + width / 2, y + height / 2, width, height, 0x000000, 0)
                .setInteractive({ useHandCursor: canAfford })
                .on('pointerdown', () => {
                    if (upgrade.canAfford() && upgrade.onBuy()) {
                        this.scene.restart();
                    }
                });
            this.scrollContainer.add(hitArea);
        }

        // Store for refresh
        this.upgradeButtons.push({ bg, nameText, valueText, costLabel, levelText, upgrade });
    }

    setupScrollInput() {
        this.isDragging = false;
        this.lastPointerY = 0;

        this.input.on('pointerdown', (pointer) => {
            if (pointer.y > this.scrollTop && pointer.y < this.scrollBottom) {
                this.isDragging = true;
                this.lastPointerY = pointer.y;
            }
        });

        this.input.on('pointermove', (pointer) => {
            if (this.isDragging && pointer.isDown && this.maxScroll > 0) {
                const dy = this.lastPointerY - pointer.y;
                this.lastPointerY = pointer.y;
                this.scrollBy(dy);
            }
        });

        this.input.on('pointerup', () => {
            this.isDragging = false;
        });

        this.input.on('wheel', (pointer, go, dx, dy) => {
            this.scrollBy(dy * 0.5);
        });
    }

    scrollBy(delta) {
        this.scrollY = Phaser.Math.Clamp(this.scrollY + delta, 0, this.maxScroll);
        this.scrollContainer.y = -this.scrollY;
        this.updateScrollIndicator();
    }

    createScrollIndicator(W) {
        const trackX = W - 25;
        const trackTop = this.scrollTop + 5;
        const trackHeight = this.scrollHeight - 10;

        this.scrollTrack = this.add.graphics();
        this.scrollTrack.fillStyle(COLORS.border, 0.5);
        this.scrollTrack.fillRoundedRect(trackX - 3, trackTop, 6, trackHeight, 3);

        const thumbHeight = Math.max(30, (this.scrollHeight / this.contentHeight) * trackHeight);
        this.scrollThumb = this.add.graphics();
        this.thumbHeight = thumbHeight;
        this.trackTop = trackTop;
        this.trackHeight = trackHeight;
        this.trackX = trackX;

        this.updateScrollIndicator();
    }

    updateScrollIndicator() {
        if (!this.scrollThumb || this.maxScroll <= 0) return;

        const progress = this.scrollY / this.maxScroll;
        const thumbY = this.trackTop + progress * (this.trackHeight - this.thumbHeight);

        this.scrollThumb.clear();
        this.scrollThumb.fillStyle(COLORS.primary, 0.8);
        this.scrollThumb.fillRoundedRect(this.trackX - 3, thumbY, 6, this.thumbHeight, 3);
    }

    update() {
        if (PlayerData.currency !== this.lastCurrency) {
            this.lastCurrency = PlayerData.currency;
            this.currencyText.setText(`💰 ${formatNumber(PlayerData.currency)}`);
        }
    }
}
