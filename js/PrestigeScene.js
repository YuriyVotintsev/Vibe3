// PrestigeScene.js - Prestige menu scene (mobile-friendly redesign)

import {
    PlayerData,
    formatNumber,
    getPrestigeCoinsFromCurrency,
    getProgressToNextCoin,
    getCurrencyForNextCoin,
    performPrestige,
    getMoneyMultiplier
} from './config.js';
import { getPrestigeUpgrades, getAutoBuyItems } from './data/upgradesData.js';
import { COLORS, FONT_SIZE, RADIUS } from './styles.js';
import { Button } from './ui/Button.js';

export class PrestigeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PrestigeScene' });
        this.currentTab = 0; // 0 = upgrades, 1 = auto-buy
    }

    create() {
        const W = this.cameras.main.width;
        const H = this.cameras.main.height;
        const cx = W / 2;
        const padding = 15;

        // Dark overlay
        this.add.rectangle(cx, H / 2, W, H, COLORS.bgOverlay, 0.92);

        // Main panel
        const panelTop = 15;
        const panelHeight = H - 30;

        const panel = this.add.graphics();
        panel.fillStyle(COLORS.bgPanel, 1);
        panel.fillRoundedRect(padding, panelTop, W - padding * 2, panelHeight, RADIUS['2xl']);
        panel.lineStyle(2, COLORS.warning, 0.8);
        panel.strokeRoundedRect(padding, panelTop, W - padding * 2, panelHeight, RADIUS['2xl']);

        // === HEADER SECTION ===
        this.createHeader(W, padding);

        // === PRESTIGE INFO SECTION ===
        this.createPrestigeSection(W, cx);

        // === TABS ===
        this.createTabs(W, padding);

        // === CONTENT AREA ===
        if (this.currentTab === 0) {
            this.createUpgradesTab(W, padding);
        } else {
            this.createAutoBuyTab(W, padding);
        }

        // === CLOSE BUTTON ===
        this.createCloseButton(W, H, padding);

        // Track currency for live updates
        this.lastCurrency = PlayerData.currency;
    }

    createHeader(W, padding) {
        const headerY = 35;

        // Title
        this.add.text(padding + 15, headerY, '👑 ПРЕСТИЖ', {
            fontSize: FONT_SIZE['3xl'],
            fontFamily: 'Arial Black',
            color: COLORS.text.gold
        }).setOrigin(0, 0.5);

        // Close X button in corner
        const closeX = this.add.text(W - padding - 15, headerY, '✕', {
            fontSize: FONT_SIZE['3xl'],
            color: COLORS.text.muted
        }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });

        closeX.on('pointerover', () => closeX.setColor(COLORS.text.white));
        closeX.on('pointerout', () => closeX.setColor(COLORS.text.muted));
        closeX.on('pointerdown', () => this.scene.stop());

        // Coins display right side
        const potential = getPrestigeCoinsFromCurrency(PlayerData.currency);
        const coinsText = potential > 0
            ? `${PlayerData.prestigeCurrency} (+${potential})`
            : `${PlayerData.prestigeCurrency}`;

        this.add.text(W - padding - 50, headerY, coinsText, {
            fontSize: FONT_SIZE['2xl'],
            color: COLORS.text.purple,
            fontStyle: 'bold'
        }).setOrigin(1, 0.5);
    }

    createPrestigeSection(W, cx) {
        const sectionY = 70;
        const potential = getPrestigeCoinsFromCurrency(PlayerData.currency);
        const progress = getProgressToNextCoin();
        const multiplier = getMoneyMultiplier();

        // Multiplier badge
        const multiBg = this.add.graphics();
        multiBg.fillStyle(COLORS.warning, 0.3);
        multiBg.fillRoundedRect(cx - 60, sectionY, 120, 32, RADIUS.lg);

        this.add.text(cx, sectionY + 16, `Множитель: x${multiplier}`, {
            fontSize: FONT_SIZE.lg,
            color: COLORS.text.gold,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Progress bar
        const barY = sectionY + 45;
        const barWidth = W - 80;
        const barHeight = 20;

        const barBg = this.add.graphics();
        barBg.fillStyle(COLORS.border, 1);
        barBg.fillRoundedRect(cx - barWidth / 2, barY, barWidth, barHeight, RADIUS.sm);

        if (progress > 0) {
            const barFill = this.add.graphics();
            barFill.fillStyle(COLORS.warning, 1);
            const fillWidth = Math.max(barHeight, barWidth * progress);
            barFill.fillRoundedRect(cx - barWidth / 2, barY, fillWidth, barHeight, RADIUS.sm);
        }

        // Progress text on bar
        const nextCoinCost = getCurrencyForNextCoin();
        this.add.text(cx, barY + barHeight / 2, `${formatNumber(PlayerData.currency)} / ${formatNumber(nextCoinCost)}`, {
            fontSize: FONT_SIZE.base,
            color: COLORS.text.white,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Prestige button
        const btnY = barY + 50;
        const canPrestige = potential > 0;

        new Button(this, {
            x: cx,
            y: btnY,
            width: W - 80,
            height: 50,
            text: canPrestige ? `⚡ ПРЕСТИЖ +${potential}👑` : '⚡ ПРЕСТИЖ',
            style: canPrestige ? 'warning' : 'disabled',
            radius: RADIUS.xl,
            fontSize: FONT_SIZE['2xl'],
            onClick: () => {
                if (canPrestige && performPrestige()) {
                    this.scene.stop();
                    this.scene.stop('MainScene');
                    this.scene.start('MainScene');
                }
            }
        });
    }

    createTabs(W, padding) {
        const tabY = 195;
        const tabWidth = (W - padding * 2 - 30) / 2;
        const tabHeight = 44;
        const gap = 10;

        // Tab 1: Upgrades
        this.createTabButton(padding + 10, tabY, tabWidth, tabHeight, '⬆️ Улучшения', 0);

        // Tab 2: Auto-buy
        this.createTabButton(padding + 10 + tabWidth + gap, tabY, tabWidth, tabHeight, '🤖 Авто', 1);
    }

    createTabButton(x, y, width, height, label, tabIndex) {
        const isActive = this.currentTab === tabIndex;

        const btn = this.add.graphics();
        btn.fillStyle(isActive ? COLORS.warning : COLORS.bgButton, 1);
        btn.fillRoundedRect(x, y, width, height, RADIUS.lg);

        if (!isActive) {
            btn.lineStyle(2, COLORS.borderLight, 1);
            btn.strokeRoundedRect(x, y, width, height, RADIUS.lg);
        }

        const hitArea = this.add.rectangle(x + width / 2, y + height / 2, width, height, 0x000000, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                if (this.currentTab !== tabIndex) {
                    this.currentTab = tabIndex;
                    this.scene.restart();
                }
            });

        this.add.text(x + width / 2, y + height / 2, label, {
            fontSize: FONT_SIZE.xl,
            color: isActive ? COLORS.text.dark : COLORS.text.light,
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    createUpgradesTab(W, padding) {
        const startY = 255;
        const gap = 12;
        const cols = 3;
        const contentWidth = W - padding * 2 - 20;
        const btnWidth = Math.floor((contentWidth - gap * (cols - 1)) / cols);
        const btnHeight = 90;

        const upgrades = getPrestigeUpgrades();

        for (let i = 0; i < upgrades.length; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = padding + 10 + col * (btnWidth + gap);
            const y = startY + row * (btnHeight + gap);

            this.createPrestigeUpgradeButton(x, y, btnWidth, btnHeight, upgrades[i]);
        }
    }

    createPrestigeUpgradeButton(x, y, width, height, upgrade) {
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

        // Name
        this.add.text(x + width / 2, y + 18, upgrade.getName(), {
            fontSize: FONT_SIZE.lg,
            color: COLORS.text.white,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Value
        this.add.text(x + width / 2, y + 42, upgrade.getValue(), {
            fontSize: FONT_SIZE['2xl'],
            color: COLORS.text.green,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Cost / Level
        const costText = isMaxed ? 'MAX' : `${cost}👑`;
        this.add.text(x + width / 2, y + 68, costText, {
            fontSize: FONT_SIZE.lg,
            color: isMaxed ? COLORS.text.muted : (canAfford ? COLORS.text.gold : COLORS.text.goldDark),
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Level indicator (small)
        this.add.text(x + width - 8, y + height - 8, upgrade.getLevel(), {
            fontSize: FONT_SIZE.sm,
            color: COLORS.text.muted
        }).setOrigin(1, 1);

        // Hit area
        if (!isMaxed) {
            this.add.rectangle(x + width / 2, y + height / 2, width, height, 0x000000, 0)
                .setInteractive({ useHandCursor: canAfford })
                .on('pointerdown', () => {
                    if (canAfford && upgrade.onBuy()) {
                        this.scene.restart();
                    }
                });
        }
    }

    createAutoBuyTab(W, padding) {
        const startY = 255;
        const gap = 10;
        const cols = 2;
        const contentWidth = W - padding * 2 - 20;
        const btnWidth = Math.floor((contentWidth - gap * (cols - 1)) / cols);
        const btnHeight = 70;

        const autoBuys = getAutoBuyItems();

        for (let i = 0; i < autoBuys.length; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = padding + 10 + col * (btnWidth + gap);
            const y = startY + row * (btnHeight + gap);

            this.createAutoBuyButton(x, y, btnWidth, btnHeight, autoBuys[i]);
        }
    }

    createAutoBuyButton(x, y, width, height, item) {
        const isOwned = item.isOwned();
        const canAfford = item.canAfford();

        // Background
        const bg = this.add.graphics();
        let bgColor, alpha = 1;

        if (isOwned) {
            bgColor = COLORS.success;
            alpha = 0.7;
        } else {
            bgColor = canAfford ? COLORS.bgButton : COLORS.bgDisabledDark;
        }

        bg.fillStyle(bgColor, alpha);
        bg.fillRoundedRect(x, y, width, height, RADIUS.lg);

        if (!isOwned) {
            bg.lineStyle(2, canAfford ? COLORS.successBright : COLORS.bgDisabled, 1);
            bg.strokeRoundedRect(x, y, width, height, RADIUS.lg);
        }

        // Name
        this.add.text(x + width / 2, y + 22, item.name, {
            fontSize: FONT_SIZE.xl,
            color: isOwned ? COLORS.text.green : COLORS.text.white,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Status
        const statusText = isOwned ? '✓ КУПЛЕНО' : `${item.cost}👑`;
        this.add.text(x + width / 2, y + 48, statusText, {
            fontSize: FONT_SIZE.lg,
            color: isOwned ? COLORS.text.green : (canAfford ? COLORS.text.gold : COLORS.text.goldDark),
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Hit area
        if (!isOwned) {
            this.add.rectangle(x + width / 2, y + height / 2, width, height, 0x000000, 0)
                .setInteractive({ useHandCursor: canAfford })
                .on('pointerdown', () => {
                    if (canAfford && item.onBuy()) {
                        this.scene.restart();
                    }
                });
        }
    }

    update() {
        if (PlayerData.currency !== this.lastCurrency) {
            this.lastCurrency = PlayerData.currency;
            this.scene.restart();
        }
    }

    createCloseButton(W, H, padding) {
        new Button(this, {
            x: W / 2,
            y: H - 45,
            width: W - padding * 2 - 20,
            height: 52,
            text: '← НАЗАД',
            style: 'secondary',
            radius: RADIUS.xl,
            fontSize: FONT_SIZE['2xl'],
            onClick: () => this.scene.stop()
        });
    }
}
