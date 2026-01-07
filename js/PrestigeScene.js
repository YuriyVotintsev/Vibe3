// PrestigeScene.js - Prestige menu scene

import {
    PlayerData,
    formatNumber,
    getPrestigeCoinsFromCurrency,
    getProgressToNextCoin,
    getCurrencyForNextCoin,
    performPrestige
} from './config.js';
import { getPrestigeUpgrades, getAutoBuyItems } from './data/upgradesData.js';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from './styles.js';
import { Button, UpgradeButton, AutoBuyButton } from './ui/Button.js';

export class PrestigeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PrestigeScene' });
        this.currentTab = 0; // 0 = upgrades, 1 = auto-buy
    }

    create() {
        const W = this.cameras.main.width;
        const H = this.cameras.main.height;
        const cx = W / 2;

        // Dark overlay
        this.add.rectangle(cx, H / 2, W, H, COLORS.bgOverlay, 0.9);

        // Panel background
        const panelTop = 20;
        const panelBottom = H - 90;
        const panelHeight = panelBottom - panelTop;

        const panel = this.add.graphics();
        panel.fillStyle(COLORS.bgPanel, 1);
        panel.fillRoundedRect(15, panelTop, W - 30, panelHeight, RADIUS['2xl']);
        panel.lineStyle(3, COLORS.warning, 1);
        panel.strokeRoundedRect(15, panelTop, W - 30, panelHeight, RADIUS['2xl']);

        // Title
        this.add.text(cx, 50, 'ПРЕСТИЖ', {
            fontSize: FONT_SIZE['4xl'],
            fontFamily: 'Arial Black',
            color: COLORS.text.gold
        }).setOrigin(0.5);

        // Prestige coins display
        this.createPrestigeCoinsDisplay(cx);

        // Progress section
        this.createProgressSection(cx, W);

        // Prestige button
        this.createPrestigeButton(cx);

        // Tab buttons
        this.createTabs(W);

        // Tab content
        if (this.currentTab === 0) {
            this.createUpgradesTab(W);
        } else {
            this.createAutoBuyTab(W);
        }

        // Close button
        this.createCloseButton(W, H);

        // Track currency for live updates
        this.lastCurrency = PlayerData.currency;
    }

    createPrestigeCoinsDisplay(cx) {
        const coinsBg = this.add.graphics();
        coinsBg.fillStyle(COLORS.primary, 0.2);
        coinsBg.fillRoundedRect(cx - 100, 80, 200, 40, RADIUS.lg);

        const potential = getPrestigeCoinsFromCurrency(PlayerData.currency);
        const displayText = potential > 0
            ? `👑 ${PlayerData.prestigeCurrency} (+${potential})`
            : `👑 ${PlayerData.prestigeCurrency}`;

        this.add.text(cx, 100, displayText, {
            fontSize: FONT_SIZE['3xl'],
            color: COLORS.text.purple,
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    createProgressSection(cx, W) {
        const potential = getPrestigeCoinsFromCurrency(PlayerData.currency);
        const progress = getProgressToNextCoin();

        this.add.text(cx, 145, potential > 0 ? `Можно получить: +${potential} 👑` : 'Копите 💰 для престижа', {
            fontSize: FONT_SIZE.lg,
            color: potential > 0 ? COLORS.text.green : COLORS.text.muted
        }).setOrigin(0.5);

        // Progress bar
        const barWidth = W - 80;
        const barHeight = 16;
        const barY = 170;

        const barBg = this.add.graphics();
        barBg.fillStyle(COLORS.border, 1);
        barBg.fillRoundedRect(cx - barWidth / 2, barY, barWidth, barHeight, RADIUS.sm);

        if (progress > 0) {
            const barFill = this.add.graphics();
            barFill.fillStyle(COLORS.warning, 1);
            barFill.fillRoundedRect(cx - barWidth / 2, barY, barWidth * progress, barHeight, RADIUS.sm);
        }

        const nextCoinCost = getCurrencyForNextCoin();
        this.add.text(cx, barY + barHeight + 12, `${formatNumber(PlayerData.currency)} / ${formatNumber(nextCoinCost)} 💰`, {
            fontSize: FONT_SIZE.md,
            color: COLORS.text.muted
        }).setOrigin(0.5);
    }

    createPrestigeButton(cx) {
        const potential = getPrestigeCoinsFromCurrency(PlayerData.currency);
        const prestigeBtnY = 225;
        const canPrestige = potential > 0;

        new Button(this, {
            x: cx,
            y: prestigeBtnY,
            width: 220,
            height: 40,
            text: canPrestige ? `ПРЕСТИЖ (+${potential}👑)` : 'ПРЕСТИЖ',
            style: canPrestige ? 'warning' : 'disabled',
            radius: RADIUS.lg,
            fontSize: FONT_SIZE.xl,
            onClick: () => {
                if (canPrestige && performPrestige()) {
                    this.scene.stop();
                    this.scene.stop('MainScene');
                    this.scene.start('MainScene');
                }
            }
        });
    }

    createTabs(W) {
        const cx = W / 2;
        const tabY = 270;
        const tabWidth = (W - 60) / 2;
        const tabHeight = 32;

        // Tab 1: Upgrades
        this.createTabButton(25, tabY, tabWidth - 2, tabHeight, 'УЛУЧШЕНИЯ', 0);

        // Tab 2: Auto-buy
        this.createTabButton(25 + tabWidth + 2, tabY, tabWidth - 2, tabHeight, 'АВТО-ПОКУПКА', 1);
    }

    createTabButton(x, y, width, height, label, tabIndex) {
        const isActive = this.currentTab === tabIndex;

        const btn = this.add.graphics();
        btn.fillStyle(isActive ? COLORS.warning : COLORS.bgDisabled, 1);
        btn.fillRoundedRect(x, y, width, height, RADIUS.sm);

        this.add.rectangle(x + width / 2, y + height / 2, width, height, 0x000000, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                if (this.currentTab !== tabIndex) {
                    this.currentTab = tabIndex;
                    this.scene.restart();
                }
            });

        this.add.text(x + width / 2, y + height / 2, label, {
            fontSize: FONT_SIZE.md,
            color: isActive ? COLORS.text.dark : COLORS.text.muted,
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    createUpgradesTab(W) {
        const startY = 315;
        const padding = SPACING['3xl'];
        const gap = SPACING.md;
        const cols = 3;
        const btnWidth = Math.floor((W - padding * 2 - gap * (cols - 1)) / cols);
        const btnHeight = 70;

        const upgrades = getPrestigeUpgrades();
        this.upgradeButtons = [];

        for (let i = 0; i < upgrades.length; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = padding + col * (btnWidth + gap);
            const y = startY + row * (btnHeight + gap);

            const button = new UpgradeButton(this, {
                x,
                y,
                width: btnWidth,
                height: btnHeight,
                upgrade: upgrades[i],
                formatCost: (cost) => `${cost}👑`,
                onPurchase: () => this.scene.restart()
            });

            this.upgradeButtons.push(button);
        }
    }

    createAutoBuyTab(W) {
        const startY = 315;
        const padding = SPACING['3xl'];
        const gap = SPACING.sm;
        const cols = 3;
        const btnWidth = Math.floor((W - padding * 2 - gap * (cols - 1)) / cols);
        const btnHeight = 55;

        const autoBuys = getAutoBuyItems();

        for (let i = 0; i < autoBuys.length; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = padding + col * (btnWidth + gap);
            const y = startY + row * (btnHeight + gap);

            // Tell, Don't Ask: pass item object, button queries it
            new AutoBuyButton(this, {
                x, y, width: btnWidth, height: btnHeight,
                item: autoBuys[i],
                onPurchase: () => this.scene.restart()
            });
        }
    }

    update() {
        if (PlayerData.currency !== this.lastCurrency) {
            this.lastCurrency = PlayerData.currency;
            this.scene.restart();
        }
    }

    createCloseButton(W, H) {
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
