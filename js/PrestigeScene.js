// PrestigeScene.js - Prestige menu scene (mobile-friendly, v2)

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
        this.currentTab = 0;
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
        panel.lineStyle(2, COLORS.warning, 0.8);
        panel.strokeRoundedRect(padding, 15, W - padding * 2, H - 30, RADIUS['2xl']);

        // === HEADER: Title ===
        this.createHeader(W, cx);

        // === COINS SECTION (most important!) ===
        this.createCoinsSection(W, cx);

        // === PRESTIGE BUTTON + PROGRESS ===
        this.createPrestigeSection(W, cx);

        // === TABS ===
        this.createTabs(W, padding);

        // === CONTENT ===
        if (this.currentTab === 0) {
            this.createUpgradesTab(W, padding);
        } else {
            this.createAutoBuyTab(W, padding);
        }

        // === CLOSE BUTTON ===
        this.createCloseButton(W, H, padding);

        this.lastCurrency = PlayerData.currency;
    }

    createHeader(W, cx) {
        // Title centered
        this.add.text(cx, 38, '👑 ПРЕСТИЖ', {
            fontSize: FONT_SIZE['3xl'],
            fontFamily: 'Arial Black',
            color: COLORS.text.gold
        }).setOrigin(0.5);
    }

    createCoinsSection(W, cx) {
        const y = 75;
        const potential = getPrestigeCoinsFromCurrency(PlayerData.currency);
        const multiplier = getMoneyMultiplier();

        // Background card for coins - taller
        const cardBg = this.add.graphics();
        cardBg.fillStyle(0x2a1a4a, 1); // dark purple
        cardBg.fillRoundedRect(25, y - 5, W - 50, 70, RADIUS.lg);
        cardBg.lineStyle(2, 0x9b59b6, 0.6);
        cardBg.strokeRoundedRect(25, y - 5, W - 50, 70, RADIUS.lg);

        // Build coins text - centered
        const coinsText = potential > 0
            ? `👑 ${PlayerData.prestigeCurrency}  +${potential}`
            : `👑 ${PlayerData.prestigeCurrency}`;

        this.add.text(cx, y + 18, coinsText, {
            fontSize: FONT_SIZE['4xl'],
            color: '#e056fd', // bright purple
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Multiplier - centered below coins
        this.add.text(cx, y + 50, `множитель денег: x${multiplier}`, {
            fontSize: FONT_SIZE.lg,
            color: COLORS.text.gold,
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    createPrestigeSection(W, cx) {
        const potential = getPrestigeCoinsFromCurrency(PlayerData.currency);
        const progress = getProgressToNextCoin();
        const canPrestige = potential > 0;

        // Progress bar
        const barY = 160;
        const barWidth = W - 60;
        const barHeight = 24;

        const barBg = this.add.graphics();
        barBg.fillStyle(0x333344, 1);
        barBg.fillRoundedRect(cx - barWidth / 2, barY, barWidth, barHeight, RADIUS.md);

        if (progress > 0) {
            const barFill = this.add.graphics();
            barFill.fillStyle(COLORS.warning, 1);
            const fillWidth = Math.max(barHeight, barWidth * progress);
            barFill.fillRoundedRect(cx - barWidth / 2, barY, fillWidth, barHeight, RADIUS.md);
        }

        // Progress text - larger, more readable
        const nextCoinCost = getCurrencyForNextCoin();
        this.add.text(cx, barY + barHeight / 2, `💰 ${formatNumber(PlayerData.currency)} / ${formatNumber(nextCoinCost)}`, {
            fontSize: FONT_SIZE.lg,
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // PRESTIGE BUTTON - prominent
        const btnY = barY + 55;

        new Button(this, {
            x: cx,
            y: btnY,
            width: W - 60,
            height: 54,
            text: canPrestige ? `⚡ ПРЕСТИЖ  +${potential} 👑` : '⚡ ПРЕСТИЖ',
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
        const tabY = 240;
        const tabWidth = (W - padding * 2 - 30) / 2;
        const tabHeight = 46;
        const gap = 10;

        this.createTabButton(padding + 10, tabY, tabWidth, tabHeight, '⬆️ Улучшения', 0);
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

        this.add.rectangle(x + width / 2, y + height / 2, width, height, 0x000000, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                if (this.currentTab !== tabIndex) {
                    this.currentTab = tabIndex;
                    this.scene.restart();
                }
            });

        this.add.text(x + width / 2, y + height / 2, label, {
            fontSize: FONT_SIZE['2xl'],
            color: isActive ? '#000000' : '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    createUpgradesTab(W, padding) {
        const startY = 302;
        const gap = 12;
        const cols = 3;
        const contentWidth = W - padding * 2 - 20;
        const btnWidth = Math.floor((contentWidth - gap * (cols - 1)) / cols);
        const btnHeight = 95;

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

        // Name - larger
        this.add.text(x + width / 2, y + 20, upgrade.getName(), {
            fontSize: FONT_SIZE.xl,
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Value - prominent, bright
        this.add.text(x + width / 2, y + 48, upgrade.getValue(), {
            fontSize: FONT_SIZE['3xl'],
            color: '#55efc4', // bright cyan-green
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Cost - always bright gold
        const costText = isMaxed ? 'MAX' : `${cost}👑`;
        this.add.text(x + width / 2, y + 76, costText, {
            fontSize: FONT_SIZE.xl,
            color: isMaxed ? '#666666' : '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Level indicator - bottom right, white
        this.add.text(x + width - 8, y + height - 8, upgrade.getLevel(), {
            fontSize: FONT_SIZE.base,
            color: '#ffffff'
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
        const startY = 302;
        const gap = 10;
        const cols = 2;
        const contentWidth = W - padding * 2 - 20;
        const btnWidth = Math.floor((contentWidth - gap * (cols - 1)) / cols);
        const btnHeight = 75;

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
            alpha = 0.8;
        } else {
            bgColor = canAfford ? COLORS.bgButton : COLORS.bgDisabledDark;
        }

        bg.fillStyle(bgColor, alpha);
        bg.fillRoundedRect(x, y, width, height, RADIUS.lg);

        if (!isOwned) {
            bg.lineStyle(2, canAfford ? COLORS.successBright : COLORS.bgDisabled, 1);
            bg.strokeRoundedRect(x, y, width, height, RADIUS.lg);
        }

        // Name - larger
        this.add.text(x + width / 2, y + 25, item.name, {
            fontSize: FONT_SIZE['2xl'],
            color: isOwned ? '#55efc4' : '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Status - always bright gold for cost
        const statusText = isOwned ? '✓ ВКЛ' : `${item.cost} 👑`;
        this.add.text(x + width / 2, y + 52, statusText, {
            fontSize: FONT_SIZE.xl,
            color: isOwned ? '#55efc4' : '#ffd700',
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
