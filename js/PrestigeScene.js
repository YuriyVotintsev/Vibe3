import {
    PlayerData,
    formatNumber,
    getPrestigeCoinsFromCurrency,
    getProgressToNextCoin,
    getCurrencyForNextCoin,
    getMoneyMultiplier,
    getBoardSize,
    getColorCount,
    getUnlockedTiers,
    getPrestigeMoneyMultCost,
    upgradePrestigeMoneyMult,
    getPrestigeTiersCost,
    upgradePrestigeTiers,
    getPrestigeColorsCost,
    upgradePrestigeColors,
    getPrestigeArenaCost,
    upgradePrestigeArena,
    performPrestige,
    AUTO_BUY_COST,
    buyAutoBuyAutoMove,
    buyAutoBuyBombChance,
    buyAutoBuyBombRadius,
    buyAutoBuyBronze,
    buyAutoBuySilver,
    buyAutoBuyGold,
    buyAutoBuyCrystal,
    buyAutoBuyRainbow,
    buyAutoBuyPrismatic,
    buyAutoBuyCelestial
} from './config.js';

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
        this.add.rectangle(cx, H / 2, W, H, 0x000000, 0.9);

        // Panel background
        const panelTop = 20;
        const panelBottom = H - 90;
        const panelHeight = panelBottom - panelTop;

        const panel = this.add.graphics();
        panel.fillStyle(0x1e1e2e, 1);
        panel.fillRoundedRect(15, panelTop, W - 30, panelHeight, 16);
        panel.lineStyle(3, 0xf1c40f, 1);
        panel.strokeRoundedRect(15, panelTop, W - 30, panelHeight, 16);

        // Title
        this.add.text(cx, 50, 'ПРЕСТИЖ', {
            fontSize: '28px',
            fontFamily: 'Arial Black',
            color: '#f1c40f'
        }).setOrigin(0.5);

        // Prestige coins display
        const coinsBg = this.add.graphics();
        coinsBg.fillStyle(0xe056fd, 0.2);
        coinsBg.fillRoundedRect(cx - 80, 80, 160, 40, 10);

        this.add.text(cx, 100, `👑 ${PlayerData.prestigeCurrency}`, {
            fontSize: '24px', color: '#e056fd', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Progress section
        const potential = getPrestigeCoinsFromCurrency(PlayerData.currency);
        const progress = getProgressToNextCoin();

        this.add.text(cx, 145, potential > 0 ? `Можно получить: +${potential} 👑` : 'Копите 💰 для престижа', {
            fontSize: '16px', color: potential > 0 ? '#55efc4' : '#888888'
        }).setOrigin(0.5);

        // Progress bar
        const barWidth = W - 80;
        const barHeight = 16;
        const barY = 170;

        const barBg = this.add.graphics();
        barBg.fillStyle(0x333333, 1);
        barBg.fillRoundedRect(cx - barWidth / 2, barY, barWidth, barHeight, 6);

        if (progress > 0) {
            const barFill = this.add.graphics();
            barFill.fillStyle(0xf1c40f, 1);
            barFill.fillRoundedRect(cx - barWidth / 2, barY, barWidth * progress, barHeight, 6);
        }

        const nextCoinCost = getCurrencyForNextCoin();
        this.add.text(cx, barY + barHeight + 12, `${formatNumber(PlayerData.currency)} / ${formatNumber(nextCoinCost)} 💰`, {
            fontSize: '12px', color: '#888888'
        }).setOrigin(0.5);

        // Prestige button (perform prestige)
        if (potential > 0) {
            const prestigeBtnY = 230;
            const prestigeBtn = this.add.graphics();
            prestigeBtn.fillStyle(0x9b59b6, 1);
            prestigeBtn.fillRoundedRect(cx - 100, prestigeBtnY - 20, 200, 40, 10);

            this.add.rectangle(cx, prestigeBtnY, 200, 40, 0x000000, 0)
                .setInteractive({ useHandCursor: true })
                .on('pointerover', () => {
                    prestigeBtn.clear();
                    prestigeBtn.fillStyle(0x8e44ad, 1);
                    prestigeBtn.fillRoundedRect(cx - 100, prestigeBtnY - 20, 200, 40, 10);
                })
                .on('pointerout', () => {
                    prestigeBtn.clear();
                    prestigeBtn.fillStyle(0x9b59b6, 1);
                    prestigeBtn.fillRoundedRect(cx - 100, prestigeBtnY - 20, 200, 40, 10);
                })
                .on('pointerdown', () => {
                    if (performPrestige()) {
                        this.scene.stop();
                        this.scene.stop('MainScene');
                        this.scene.start('MainScene');
                    }
                });

            this.add.text(cx, prestigeBtnY, `ПРЕСТИЖ +${potential}👑`, {
                fontSize: '16px', color: '#ffffff', fontStyle: 'bold'
            }).setOrigin(0.5);
        }

        // Tab buttons
        this.createTabs();

        // Tab content
        if (this.currentTab === 0) {
            this.createUpgradesTab();
        } else {
            this.createAutoBuyTab();
        }

        // Close button
        this.createCloseButton();

        // Track currency for live updates
        this.lastCurrency = PlayerData.currency;
    }

    createTabs() {
        const W = this.cameras.main.width;
        const cx = W / 2;
        const tabY = 280;
        const tabWidth = (W - 60) / 2;
        const tabHeight = 32;

        // Tab 1: Upgrades
        const tab1Active = this.currentTab === 0;
        const tab1Btn = this.add.graphics();
        tab1Btn.fillStyle(tab1Active ? 0xf1c40f : 0x444444, 1);
        tab1Btn.fillRoundedRect(25, tabY, tabWidth - 2, tabHeight, 6);

        this.add.rectangle(25 + tabWidth / 2 - 1, tabY + tabHeight / 2, tabWidth - 2, tabHeight, 0x000000, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                if (this.currentTab !== 0) {
                    this.currentTab = 0;
                    this.scene.restart();
                }
            });

        this.add.text(25 + tabWidth / 2 - 1, tabY + tabHeight / 2, 'УЛУЧШЕНИЯ', {
            fontSize: '12px', color: tab1Active ? '#000000' : '#888888', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Tab 2: Auto-buy
        const tab2Active = this.currentTab === 1;
        const tab2Btn = this.add.graphics();
        tab2Btn.fillStyle(tab2Active ? 0xf1c40f : 0x444444, 1);
        tab2Btn.fillRoundedRect(25 + tabWidth + 2, tabY, tabWidth - 2, tabHeight, 6);

        this.add.rectangle(25 + tabWidth * 1.5 + 1, tabY + tabHeight / 2, tabWidth - 2, tabHeight, 0x000000, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                if (this.currentTab !== 1) {
                    this.currentTab = 1;
                    this.scene.restart();
                }
            });

        this.add.text(25 + tabWidth * 1.5 + 1, tabY + tabHeight / 2, 'АВТО-ПОКУПКА', {
            fontSize: '12px', color: tab2Active ? '#000000' : '#888888', fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    createUpgradesTab() {
        let upgradeY = 320;

        // Money multiplier upgrade
        upgradeY = this.createUpgradeRow(upgradeY, '💰', 'Множитель',
            `x${getMoneyMultiplier()}`,
            getPrestigeMoneyMultCost(),
            () => {
                if (upgradePrestigeMoneyMult()) this.scene.restart();
            });

        // Tiers upgrade
        const maxTiers = PlayerData.prestigeTiers >= 4;
        upgradeY = this.createUpgradeRow(upgradeY, '⭐', 'Тиры гемов',
            `${getUnlockedTiers()}/7`,
            maxTiers ? 'MAX' : getPrestigeTiersCost(),
            maxTiers ? null : () => {
                if (upgradePrestigeTiers()) this.scene.restart();
            });

        // Colors upgrade
        const maxColors = PlayerData.prestigeColors >= 3;
        upgradeY = this.createUpgradeRow(upgradeY, '🎨', 'Цветов',
            `${getColorCount()}`,
            maxColors ? 'MAX' : getPrestigeColorsCost(),
            maxColors ? null : () => {
                if (upgradePrestigeColors()) this.scene.restart();
            });

        // Arena size upgrade
        const maxArena = PlayerData.prestigeArena >= 4;
        upgradeY = this.createUpgradeRow(upgradeY, '📐', 'Размер поля',
            `${getBoardSize()}x${getBoardSize()}`,
            maxArena ? 'MAX' : getPrestigeArenaCost(),
            maxArena ? null : () => {
                if (upgradePrestigeArena()) this.scene.restart();
            });
    }

    createAutoBuyTab() {
        let y = 320;
        const rowHeight = 38;

        // Auto-buy upgrades list
        const autoBuys = [
            { name: 'Авто-мув', owned: PlayerData.autoBuyAutoMove, buy: buyAutoBuyAutoMove },
            { name: 'Шанс бомб', owned: PlayerData.autoBuyBombChance, buy: buyAutoBuyBombChance },
            { name: 'Радиус бомб', owned: PlayerData.autoBuyBombRadius, buy: buyAutoBuyBombRadius },
            { name: 'Бронза', owned: PlayerData.autoBuyBronze, buy: buyAutoBuyBronze },
            { name: 'Серебро', owned: PlayerData.autoBuySilver, buy: buyAutoBuySilver },
            { name: 'Золото', owned: PlayerData.autoBuyGold, buy: buyAutoBuyGold },
            { name: 'Кристалл', owned: PlayerData.autoBuyCrystal, buy: buyAutoBuyCrystal },
            { name: 'Радуга', owned: PlayerData.autoBuyRainbow, buy: buyAutoBuyRainbow },
            { name: 'Призма', owned: PlayerData.autoBuyPrismatic, buy: buyAutoBuyPrismatic },
            { name: 'Небесный', owned: PlayerData.autoBuyCelestial, buy: buyAutoBuyCelestial }
        ];

        autoBuys.forEach(item => {
            this.createAutoBuyRow(y, item.name, item.owned, item.buy);
            y += rowHeight;
        });
    }

    createAutoBuyRow(y, name, owned, onBuy) {
        const W = this.cameras.main.width;
        const rowHeight = 35;

        // Row background
        const rowBg = this.add.graphics();
        rowBg.fillStyle(owned ? 0x27ae60 : 0x2a2a3e, owned ? 0.3 : 0.5);
        rowBg.fillRoundedRect(25, y, W - 50, rowHeight, 6);

        // Name
        this.add.text(35, y + rowHeight / 2, name, {
            fontSize: '13px', color: owned ? '#55efc4' : '#ffffff'
        }).setOrigin(0, 0.5);

        // Status/Cost
        if (owned) {
            this.add.text(W - 60, y + rowHeight / 2, '✓ АКТИВНО', {
                fontSize: '11px', color: '#55efc4', fontStyle: 'bold'
            }).setOrigin(1, 0.5);
        } else {
            const canAfford = PlayerData.prestigeCurrency >= AUTO_BUY_COST;

            this.add.text(W - 95, y + rowHeight / 2, `${AUTO_BUY_COST}👑`, {
                fontSize: '11px', color: canAfford ? '#f1c40f' : '#888888'
            }).setOrigin(1, 0.5);

            // Buy button
            const btnX = W - 55;
            const btnSize = 30;

            const btn = this.add.graphics();
            btn.fillStyle(canAfford ? 0x27ae60 : 0x555555, 1);
            btn.fillRoundedRect(btnX - btnSize / 2, y + rowHeight / 2 - btnSize / 2, btnSize, btnSize, 5);

            this.add.rectangle(btnX, y + rowHeight / 2, btnSize, btnSize, 0x000000, 0)
                .setInteractive({ useHandCursor: canAfford })
                .on('pointerover', () => {
                    if (canAfford) {
                        btn.clear();
                        btn.fillStyle(0x2ecc71, 1);
                        btn.fillRoundedRect(btnX - btnSize / 2, y + rowHeight / 2 - btnSize / 2, btnSize, btnSize, 5);
                    }
                })
                .on('pointerout', () => {
                    btn.clear();
                    btn.fillStyle(canAfford ? 0x27ae60 : 0x555555, 1);
                    btn.fillRoundedRect(btnX - btnSize / 2, y + rowHeight / 2 - btnSize / 2, btnSize, btnSize, 5);
                })
                .on('pointerdown', () => {
                    if (canAfford && onBuy()) {
                        this.scene.restart();
                    }
                });

            this.add.text(btnX, y + rowHeight / 2, '+', {
                fontSize: '18px', color: '#ffffff', fontStyle: 'bold'
            }).setOrigin(0.5);
        }
    }

    update() {
        // Live update when currency changes (game runs in background)
        if (PlayerData.currency !== this.lastCurrency) {
            this.lastCurrency = PlayerData.currency;
            // Restart scene to refresh all values
            this.scene.restart();
        }
    }

    createCloseButton() {
        const W = this.cameras.main.width;
        const H = this.cameras.main.height;
        const cx = W / 2;
        const btnY = H - 45;
        const btnWidth = W - 60;
        const btnHeight = 50;

        const btn = this.add.graphics();
        btn.fillStyle(0xe74c3c, 1);
        btn.fillRoundedRect(cx - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 12);

        this.add.rectangle(cx, btnY, btnWidth, btnHeight, 0x000000, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                btn.clear();
                btn.fillStyle(0xc0392b, 1);
                btn.fillRoundedRect(cx - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 12);
            })
            .on('pointerout', () => {
                btn.clear();
                btn.fillStyle(0xe74c3c, 1);
                btn.fillRoundedRect(cx - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 12);
            })
            .on('pointerdown', () => this.scene.stop());

        this.add.text(cx, btnY, '✕ ЗАКРЫТЬ', {
            fontSize: '18px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    createUpgradeRow(y, icon, name, value, cost, onBuy) {
        const W = this.cameras.main.width;
        const rowHeight = 45;

        // Row background
        const rowBg = this.add.graphics();
        rowBg.fillStyle(0x2a2a3e, 0.5);
        rowBg.fillRoundedRect(25, y, W - 50, rowHeight, 8);

        // Icon and name
        this.add.text(35, y + rowHeight / 2, icon, { fontSize: '18px' }).setOrigin(0, 0.5);
        this.add.text(60, y + rowHeight / 2, name, {
            fontSize: '14px', color: '#ffffff'
        }).setOrigin(0, 0.5);

        // Value
        this.add.text(160, y + rowHeight / 2, value, {
            fontSize: '14px', color: '#55efc4', fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        // Cost or MAX
        const costStr = typeof cost === 'number' ? `${cost}👑` : cost;
        const canAfford = typeof cost === 'number' && PlayerData.prestigeCurrency >= cost;

        this.add.text(220, y + rowHeight / 2, costStr, {
            fontSize: '12px', color: canAfford ? '#f1c40f' : '#888888'
        }).setOrigin(0, 0.5);

        // Buy button (if not maxed)
        if (onBuy) {
            const btnX = W - 55;
            const btnSize = 35;

            const btn = this.add.graphics();
            btn.fillStyle(canAfford ? 0x27ae60 : 0x555555, 1);
            btn.fillRoundedRect(btnX - btnSize / 2, y + rowHeight / 2 - btnSize / 2, btnSize, btnSize, 6);

            this.add.rectangle(btnX, y + rowHeight / 2, btnSize, btnSize, 0x000000, 0)
                .setInteractive({ useHandCursor: canAfford })
                .on('pointerover', () => {
                    if (canAfford) {
                        btn.clear();
                        btn.fillStyle(0x2ecc71, 1);
                        btn.fillRoundedRect(btnX - btnSize / 2, y + rowHeight / 2 - btnSize / 2, btnSize, btnSize, 6);
                    }
                })
                .on('pointerout', () => {
                    btn.clear();
                    btn.fillStyle(canAfford ? 0x27ae60 : 0x555555, 1);
                    btn.fillRoundedRect(btnX - btnSize / 2, y + rowHeight / 2 - btnSize / 2, btnSize, btnSize, 6);
                })
                .on('pointerdown', () => {
                    if (canAfford) onBuy();
                });

            this.add.text(btnX, y + rowHeight / 2, '+', {
                fontSize: '20px', color: '#ffffff', fontStyle: 'bold'
            }).setOrigin(0.5);
        }

        return y + rowHeight + 5;
    }
}
