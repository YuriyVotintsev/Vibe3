// UpgradesScene.js - Upgrades menu scene

import { PlayerData, formatNumber } from './config.js';
import { getRegularUpgrades } from './data/upgradesData.js';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from './styles.js';
import { Button, UpgradeButton } from './ui/Button.js';

export class UpgradesScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UpgradesScene' });
    }

    create() {
        const W = this.cameras.main.width;
        const H = this.cameras.main.height;
        const cx = W / 2;

        // Panel bounds
        const panelTop = 20;
        const panelBottom = H - 90;
        const panelHeight = panelBottom - panelTop;

        // Scroll area bounds
        this.scrollTop = 150;
        this.scrollBottom = panelBottom - 15;
        this.scrollHeight = this.scrollBottom - this.scrollTop;

        // Track last currency for live updates
        this.lastCurrency = PlayerData.currency;

        // Dark overlay
        this.add.rectangle(cx, H / 2, W, H, COLORS.bgOverlay, 0.85);

        // Panel background
        const panel = this.add.graphics();
        panel.fillStyle(COLORS.bgPanel, 1);
        panel.fillRoundedRect(15, panelTop, W - 30, panelHeight, RADIUS['2xl']);
        panel.lineStyle(3, COLORS.primary, 1);
        panel.strokeRoundedRect(15, panelTop, W - 30, panelHeight, RADIUS['2xl']);

        // Title
        this.add.text(cx, 55, 'АПГРЕЙДЫ', {
            fontSize: FONT_SIZE['4xl'],
            fontFamily: 'Arial Black',
            color: COLORS.text.white
        }).setOrigin(0.5).setShadow(2, 2, '#000000', 4);

        // Currency display
        this.createCurrencyDisplay(cx);

        // Create scrollable container
        this.scrollContainer = this.add.container(0, 0);

        // Create mask for scroll area
        const maskShape = this.make.graphics();
        maskShape.fillRect(20, this.scrollTop, W - 40, this.scrollHeight);
        const mask = maskShape.createGeometryMask();
        this.scrollContainer.setMask(mask);

        // Build upgrade grid inside container
        this.contentHeight = this.createUpgradeGrid();
        this.scrollY = 0;
        this.maxScroll = Math.max(0, this.contentHeight - this.scrollHeight);

        // Setup scroll input
        this.setupScrollInput();

        // Close button
        this.createCloseButton();

        // Scroll indicator
        this.createScrollIndicator();
    }

    createCurrencyDisplay(cx) {
        const currencyBg = this.add.graphics();
        currencyBg.fillStyle(COLORS.warning, 0.3);
        currencyBg.fillRoundedRect(cx - 100, 85, 200, 50, RADIUS.xl);

        this.add.text(cx - 60, 110, '💰', { fontSize: FONT_SIZE['4xl'] }).setOrigin(0.5);

        this.currencyText = this.add.text(cx + 10, 110, formatNumber(PlayerData.currency), {
            fontSize: FONT_SIZE['4xl'],
            color: COLORS.text.gold,
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
    }

    update() {
        if (PlayerData.currency !== this.lastCurrency) {
            this.lastCurrency = PlayerData.currency;
            this.currencyText.setText(formatNumber(PlayerData.currency));
            this.refreshAllButtons();
        }
    }

    createUpgradeGrid() {
        const W = this.cameras.main.width;
        const y = this.scrollTop;

        this.upgradeButtons = [];

        // Grid settings
        const padding = SPACING['3xl'];
        const gap = SPACING.md;
        const cols = 3;
        const btnWidth = Math.floor((W - padding * 2 - gap * (cols - 1)) / cols);
        const btnHeight = 70;

        // Get upgrades from data module
        const upgrades = getRegularUpgrades();

        // Create grid of buttons
        for (let i = 0; i < upgrades.length; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = padding + col * (btnWidth + gap);
            const btnY = y + row * (btnHeight + gap);

            const button = new UpgradeButton(this, {
                x,
                y: btnY,
                width: btnWidth,
                height: btnHeight,
                upgrade: upgrades[i],
                container: this.scrollContainer,
                formatCost: (cost) => formatNumber(cost) + '💰',
                onPurchase: () => {
                    this.currencyText.setText(formatNumber(PlayerData.currency));
                    this.refreshAllButtons();
                }
            });

            this.upgradeButtons.push(button);
        }

        const rows = Math.ceil(upgrades.length / cols);
        return rows * (btnHeight + gap) + 20;
    }

    setupScrollInput() {
        this.isDragging = false;
        this.lastPointerY = 0;

        this.input.on('pointerdown', (pointer) => {
            this.isDragging = true;
            this.lastPointerY = pointer.y;
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

        this.scrollTrack = this.add.graphics();
        this.scrollTrack.fillStyle(COLORS.border, 0.5);
        this.scrollTrack.fillRoundedRect(trackX - 3, trackTop, 6, trackHeight, 3);

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
        this.scrollThumb.fillStyle(COLORS.primary, 0.8);
        this.scrollThumb.fillRoundedRect(this.scrollTrackX - 3, thumbY, 6, this.scrollThumbHeight, 3);
    }

    refreshAllButtons() {
        for (const button of this.upgradeButtons) {
            button.refresh();
        }
    }

    createCloseButton() {
        const W = this.cameras.main.width;
        const H = this.cameras.main.height;

        new Button(this, {
            x: W / 2,
            y: H - 45,
            width: W - 60,
            height: 50,
            text: '✕ ЗАКРЫТЬ',
            style: 'danger',
            radius: RADIUS.xl,
            fontSize: FONT_SIZE.xl,
            onClick: () => this.scene.stop()
        });
    }
}
