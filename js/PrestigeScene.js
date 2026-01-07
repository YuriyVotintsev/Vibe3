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
            const prestigeBtnY = 225;
            const prestigeBtn = this.add.graphics();
            prestigeBtn.fillStyle(0x9b59b6, 1);
            prestigeBtn.fillRoundedRect(cx - 100, prestigeBtnY - 18, 200, 36, 10);

            this.add.rectangle(cx, prestigeBtnY, 200, 36, 0x000000, 0)
                .setInteractive({ useHandCursor: true })
                .on('pointerover', () => {
                    prestigeBtn.clear();
                    prestigeBtn.fillStyle(0x8e44ad, 1);
                    prestigeBtn.fillRoundedRect(cx - 100, prestigeBtnY - 18, 200, 36, 10);
                })
                .on('pointerout', () => {
                    prestigeBtn.clear();
                    prestigeBtn.fillStyle(0x9b59b6, 1);
                    prestigeBtn.fillRoundedRect(cx - 100, prestigeBtnY - 18, 200, 36, 10);
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
        const tabY = 270;
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
        const W = this.cameras.main.width;
        const startY = 315;

        // Grid settings
        const padding = 25;
        const gap = 8;
        const cols = 3;
        const btnWidth = Math.floor((W - padding * 2 - gap * (cols - 1)) / cols);
        const btnHeight = 70;

        // Prestige upgrades with level info
        const upgrades = [
            {
                name: 'Множитель',
                getValue: () => `x${getMoneyMultiplier()}`,
                getLevel: () => `${PlayerData.prestigeMoneyMult}/∞`,
                getCost: () => getPrestigeMoneyMultCost(),
                canAfford: () => PlayerData.prestigeCurrency >= getPrestigeMoneyMultCost(),
                onBuy: () => upgradePrestigeMoneyMult()
            },
            {
                name: 'Тиры гемов',
                getValue: () => `${getUnlockedTiers()}/7`,
                getLevel: () => `${PlayerData.prestigeTiers}/4`,
                getCost: () => PlayerData.prestigeTiers >= 4 ? null : getPrestigeTiersCost(),
                canAfford: () => PlayerData.prestigeTiers < 4 && PlayerData.prestigeCurrency >= getPrestigeTiersCost(),
                onBuy: () => upgradePrestigeTiers()
            },
            {
                name: 'Цветов',
                getValue: () => `${getColorCount()}`,
                getLevel: () => `${PlayerData.prestigeColors}/3`,
                getCost: () => PlayerData.prestigeColors >= 3 ? null : getPrestigeColorsCost(),
                canAfford: () => PlayerData.prestigeColors < 3 && PlayerData.prestigeCurrency >= getPrestigeColorsCost(),
                onBuy: () => upgradePrestigeColors()
            },
            {
                name: 'Размер поля',
                getValue: () => `${getBoardSize()}x${getBoardSize()}`,
                getLevel: () => `${PlayerData.prestigeArena}/4`,
                getCost: () => PlayerData.prestigeArena >= 4 ? null : getPrestigeArenaCost(),
                canAfford: () => PlayerData.prestigeArena < 4 && PlayerData.prestigeCurrency >= getPrestigeArenaCost(),
                onBuy: () => upgradePrestigeArena()
            }
        ];

        for (let i = 0; i < upgrades.length; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = padding + col * (btnWidth + gap);
            const y = startY + row * (btnHeight + gap);

            this.createUpgradeButton(x, y, btnWidth, btnHeight, upgrades[i]);
        }
    }

    createAutoBuyTab() {
        const W = this.cameras.main.width;
        const startY = 315;

        // Grid settings
        const padding = 25;
        const gap = 6;
        const cols = 3;
        const btnWidth = Math.floor((W - padding * 2 - gap * (cols - 1)) / cols);
        const btnHeight = 55;

        // Auto-buy upgrades
        const autoBuys = [
            { name: 'Авто-мув', owned: PlayerData.autoBuyAutoMove, buy: buyAutoBuyAutoMove },
            { name: 'Шанс бомб', owned: PlayerData.autoBuyBombChance, buy: buyAutoBuyBombChance },
            { name: 'Радиус', owned: PlayerData.autoBuyBombRadius, buy: buyAutoBuyBombRadius },
            { name: 'Бронза', owned: PlayerData.autoBuyBronze, buy: buyAutoBuyBronze },
            { name: 'Серебро', owned: PlayerData.autoBuySilver, buy: buyAutoBuySilver },
            { name: 'Золото', owned: PlayerData.autoBuyGold, buy: buyAutoBuyGold },
            { name: 'Кристалл', owned: PlayerData.autoBuyCrystal, buy: buyAutoBuyCrystal },
            { name: 'Радуга', owned: PlayerData.autoBuyRainbow, buy: buyAutoBuyRainbow },
            { name: 'Призма', owned: PlayerData.autoBuyPrismatic, buy: buyAutoBuyPrismatic },
            { name: 'Небесный', owned: PlayerData.autoBuyCelestial, buy: buyAutoBuyCelestial }
        ];

        for (let i = 0; i < autoBuys.length; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = padding + col * (btnWidth + gap);
            const y = startY + row * (btnHeight + gap);

            this.createAutoBuyButton(x, y, btnWidth, btnHeight, autoBuys[i]);
        }
    }

    createUpgradeButton(x, y, width, height, upgrade) {
        const { name, getValue, getLevel, getCost, canAfford, onBuy } = upgrade;
        const cost = getCost();
        const isMaxed = cost === null;
        const affordable = !isMaxed && canAfford();

        // Button background
        const btn = this.add.graphics();
        const bgColor = isMaxed ? 0x444444 : (affordable ? 0x27ae60 : 0x2a2a3e);
        btn.fillStyle(bgColor, 1);
        btn.fillRoundedRect(x, y, width, height, 8);
        if (!isMaxed) {
            btn.lineStyle(2, affordable ? 0x55efc4 : 0x555555, 1);
            btn.strokeRoundedRect(x, y, width, height, 8);
        }

        // Name
        this.add.text(x + width / 2, y + 12, name, {
            fontSize: '12px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Level
        this.add.text(x + width / 2, y + 26, getLevel(), {
            fontSize: '10px', color: '#d0d0d0'
        }).setOrigin(0.5);

        // Value
        this.add.text(x + width / 2, y + 43, getValue(), {
            fontSize: '15px', color: '#55efc4', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Cost
        const costStr = isMaxed ? 'MAX' : `${cost}👑`;
        this.add.text(x + width / 2, y + 59, costStr, {
            fontSize: '11px', color: isMaxed ? '#999999' : (affordable ? '#f1c40f' : '#cc9900')
        }).setOrigin(0.5);

        // Hit area
        if (!isMaxed) {
            this.add.rectangle(x + width / 2, y + height / 2, width, height, 0x000000, 0)
                .setInteractive({ useHandCursor: affordable })
                .on('pointerover', () => {
                    const hoverColor = canAfford() ? 0x2ecc71 : 0x3a3a4e;
                    btn.clear();
                    btn.fillStyle(hoverColor, 1);
                    btn.fillRoundedRect(x, y, width, height, 8);
                    btn.lineStyle(2, canAfford() ? 0x55efc4 : 0x555555, 1);
                    btn.strokeRoundedRect(x, y, width, height, 8);
                })
                .on('pointerout', () => {
                    const col = canAfford() ? 0x27ae60 : 0x2a2a3e;
                    btn.clear();
                    btn.fillStyle(col, 1);
                    btn.fillRoundedRect(x, y, width, height, 8);
                    btn.lineStyle(2, canAfford() ? 0x55efc4 : 0x555555, 1);
                    btn.strokeRoundedRect(x, y, width, height, 8);
                })
                .on('pointerdown', () => {
                    if (canAfford() && onBuy()) {
                        this.scene.restart();
                    }
                });
        }
    }

    createAutoBuyButton(x, y, width, height, item) {
        const { name, owned, buy } = item;
        const canAfford = PlayerData.prestigeCurrency >= AUTO_BUY_COST;

        // Button background
        const btn = this.add.graphics();
        const bgColor = owned ? 0x27ae60 : (canAfford ? 0x2a2a3e : 0x222233);
        btn.fillStyle(bgColor, owned ? 0.6 : 1);
        btn.fillRoundedRect(x, y, width, height, 8);
        if (!owned) {
            btn.lineStyle(2, canAfford ? 0x55efc4 : 0x444444, 1);
            btn.strokeRoundedRect(x, y, width, height, 8);
        }

        // Name
        this.add.text(x + width / 2, y + 18, name, {
            fontSize: '12px', color: owned ? '#55efc4' : '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Status or cost
        if (owned) {
            this.add.text(x + width / 2, y + 38, '✓ ВКЛ', {
                fontSize: '13px', color: '#55efc4', fontStyle: 'bold'
            }).setOrigin(0.5);
        } else {
            this.add.text(x + width / 2, y + 38, `${AUTO_BUY_COST}👑`, {
                fontSize: '13px', color: canAfford ? '#f1c40f' : '#cc9900'
            }).setOrigin(0.5);

            // Hit area
            this.add.rectangle(x + width / 2, y + height / 2, width, height, 0x000000, 0)
                .setInteractive({ useHandCursor: canAfford })
                .on('pointerover', () => {
                    if (canAfford) {
                        btn.clear();
                        btn.fillStyle(0x3a3a4e, 1);
                        btn.fillRoundedRect(x, y, width, height, 8);
                        btn.lineStyle(2, 0x55efc4, 1);
                        btn.strokeRoundedRect(x, y, width, height, 8);
                    }
                })
                .on('pointerout', () => {
                    btn.clear();
                    btn.fillStyle(canAfford ? 0x2a2a3e : 0x222233, 1);
                    btn.fillRoundedRect(x, y, width, height, 8);
                    btn.lineStyle(2, canAfford ? 0x55efc4 : 0x444444, 1);
                    btn.strokeRoundedRect(x, y, width, height, 8);
                })
                .on('pointerdown', () => {
                    if (canAfford && buy()) {
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
}
