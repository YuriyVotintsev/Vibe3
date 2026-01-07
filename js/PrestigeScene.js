import {
    PlayerData,
    getNextPrestigeCoinCost,
    buyPrestigeCoin,
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
    upgradePrestigeArena
} from './config.js';

export class PrestigeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PrestigeScene' });
    }

    create() {
        const W = this.cameras.main.width;
        const H = this.cameras.main.height;
        const cx = W / 2;

        // Track values for live updates
        this.lastCurrency = PlayerData.currency;
        this.lastPrestige = PlayerData.prestigeCurrency;

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
        }).setOrigin(0.5).setShadow(2, 2, '#000000', 4);

        // Currency displays
        this.createCurrencyDisplays(cx);

        // Buy prestige coin section
        this.createBuyCoinSection(cx);

        // Prestige upgrades
        this.createUpgradeRows();

        // Close button
        this.createCloseButton();
    }

    update() {
        // Live update when currencies change
        if (PlayerData.currency !== this.lastCurrency || PlayerData.prestigeCurrency !== this.lastPrestige) {
            this.lastCurrency = PlayerData.currency;
            this.lastPrestige = PlayerData.prestigeCurrency;
            this.currencyText.setText(`${PlayerData.currency}`);
            this.prestigeText.setText(`${PlayerData.prestigeCurrency}`);
            this.updateBuyCoinButton();
            this.refreshAllRows();
        }
    }

    createCurrencyDisplays(cx) {
        // Regular currency
        const currencyBg = this.add.graphics();
        currencyBg.fillStyle(0xf39c12, 0.3);
        currencyBg.fillRoundedRect(30, 80, 130, 40, 10);
        this.add.text(45, 100, '💰', { fontSize: '22px' }).setOrigin(0.5);
        this.currencyText = this.add.text(65, 100, `${PlayerData.currency}`, {
            fontSize: '20px', color: '#f1c40f', fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        // Prestige currency
        const prestigeBg = this.add.graphics();
        prestigeBg.fillStyle(0x9b59b6, 0.3);
        prestigeBg.fillRoundedRect(180, 80, 130, 40, 10);
        this.add.text(195, 100, '👑', { fontSize: '22px' }).setOrigin(0.5);
        this.prestigeText = this.add.text(215, 100, `${PlayerData.prestigeCurrency}`, {
            fontSize: '20px', color: '#e056fd', fontStyle: 'bold'
        }).setOrigin(0, 0.5);
    }

    createBuyCoinSection(cx) {
        const y = 140;
        const W = this.cameras.main.width;

        // Background
        const bg = this.add.graphics();
        bg.fillStyle(0x2a2a3e, 0.8);
        bg.fillRoundedRect(25, y, W - 50, 50, 10);

        // Label
        this.add.text(40, y + 25, 'Купить 👑', {
            fontSize: '16px', color: '#e056fd', fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        // Cost
        this.buyCoinCostText = this.add.text(150, y + 25, `${getNextPrestigeCoinCost()}💰`, {
            fontSize: '14px', color: '#f1c40f'
        }).setOrigin(0, 0.5);

        // Button
        const btnX = W - 60;
        const btnSize = 44;
        const affordable = PlayerData.currency >= getNextPrestigeCoinCost();

        this.buyCoinBtn = this.add.graphics();
        this.buyCoinBtn.fillStyle(affordable ? 0x9b59b6 : 0x555555, 1);
        this.buyCoinBtn.fillRoundedRect(btnX - btnSize / 2, y + 25 - btnSize / 2, btnSize, btnSize, 8);

        this.add.text(btnX, y + 25, '+1', {
            fontSize: '14px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.buyCoinHitArea = this.add.rectangle(btnX, y + 25, btnSize, btnSize, 0x000000, 0)
            .setInteractive({ useHandCursor: affordable })
            .on('pointerdown', () => {
                if (buyPrestigeCoin()) {
                    this.currencyText.setText(`${PlayerData.currency}`);
                    this.prestigeText.setText(`${PlayerData.prestigeCurrency}`);
                    this.updateBuyCoinButton();
                    this.refreshAllRows();
                }
            });

        this.buyCoinBtnX = btnX;
        this.buyCoinBtnY = y + 25;
        this.buyCoinBtnSize = btnSize;
    }

    updateBuyCoinButton() {
        const affordable = PlayerData.currency >= getNextPrestigeCoinCost();
        this.buyCoinCostText.setText(`${getNextPrestigeCoinCost()}💰`);
        this.buyCoinBtn.clear();
        this.buyCoinBtn.fillStyle(affordable ? 0x9b59b6 : 0x555555, 1);
        this.buyCoinBtn.fillRoundedRect(
            this.buyCoinBtnX - this.buyCoinBtnSize / 2,
            this.buyCoinBtnY - this.buyCoinBtnSize / 2,
            this.buyCoinBtnSize, this.buyCoinBtnSize, 8
        );
        this.buyCoinHitArea.setInteractive({ useHandCursor: affordable });
    }

    createUpgradeRows() {
        const W = this.cameras.main.width;
        let y = 205;

        this.upgradeRows = [];

        // Money multiplier (infinite)
        y = this.createUpgradeRow(y, '💵', 'Множитель', () => {
            return `x${getMoneyMultiplier()}`;
        }, () => {
            return `${getPrestigeMoneyMultCost()}👑`;
        }, () => 'x2', () => {
            return PlayerData.prestigeCurrency >= getPrestigeMoneyMultCost();
        }, () => upgradePrestigeMoneyMult());

        // Unlock tiers (max 4)
        y = this.createUpgradeRow(y, '🔓', 'Уровни гемов', () => {
            return `${getUnlockedTiers()}/7`;
        }, () => {
            const atMax = PlayerData.prestigeTiers >= 4;
            return atMax ? 'MAX' : `${getPrestigeTiersCost()}👑`;
        }, () => '+1', () => {
            const atMax = PlayerData.prestigeTiers >= 4;
            return !atMax && PlayerData.prestigeCurrency >= getPrestigeTiersCost();
        }, () => upgradePrestigeTiers());

        // Reduce colors (max 3)
        y = this.createUpgradeRow(y, '🎨', 'Меньше цветов', () => {
            return `${getColorCount()}`;
        }, () => {
            const atMax = PlayerData.prestigeColors >= 3;
            return atMax ? 'MAX' : `${getPrestigeColorsCost()}👑`;
        }, () => '-1', () => {
            const atMax = PlayerData.prestigeColors >= 3;
            return !atMax && PlayerData.prestigeCurrency >= getPrestigeColorsCost();
        }, () => upgradePrestigeColors());

        // Increase arena (max 4)
        y = this.createUpgradeRow(y, '📐', 'Размер арены', () => {
            const size = getBoardSize();
            return `${size}x${size}`;
        }, () => {
            const atMax = PlayerData.prestigeArena >= 4;
            return atMax ? 'MAX' : `${getPrestigeArenaCost()}👑`;
        }, () => '+1', () => {
            const atMax = PlayerData.prestigeArena >= 4;
            return !atMax && PlayerData.prestigeCurrency >= getPrestigeArenaCost();
        }, () => upgradePrestigeArena());
    }

    createUpgradeRow(y, icon, name, getValue, getCost, getAction, canAfford, onBuy) {
        const W = this.cameras.main.width;

        // Row background
        const rowBg = this.add.graphics();
        rowBg.fillStyle(0x2a2a3e, 0.5);
        rowBg.fillRoundedRect(25, y, W - 50, 55, 10);

        // Icon
        this.add.text(40, y + 28, icon, { fontSize: '22px' }).setOrigin(0, 0.5);

        // Name
        this.add.text(72, y + 28, name, {
            fontSize: '16px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        // Value
        const valueText = this.add.text(190, y + 28, getValue(), {
            fontSize: '18px', color: '#55efc4', fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        // Cost
        const costText = this.add.text(255, y + 28, getCost(), {
            fontSize: '14px', color: '#e056fd'
        }).setOrigin(0, 0.5);

        // Button
        const btnX = W - 60;
        const btnSize = 44;
        const affordable = canAfford();

        const btn = this.add.graphics();
        btn.fillStyle(affordable ? 0x9b59b6 : 0x555555, 1);
        btn.fillRoundedRect(btnX - btnSize / 2, y + 28 - btnSize / 2, btnSize, btnSize, 8);

        this.add.text(btnX, y + 28, getAction(), {
            fontSize: '12px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        const hitArea = this.add.rectangle(btnX, y + 28, btnSize, btnSize, 0x000000, 0)
            .setInteractive({ useHandCursor: affordable })
            .on('pointerdown', () => {
                if (canAfford() && onBuy()) {
                    this.currencyText.setText(`${PlayerData.currency}`);
                    this.prestigeText.setText(`${PlayerData.prestigeCurrency}`);
                    this.refreshAllRows();
                }
            });

        this.upgradeRows.push({ valueText, costText, btn, hitArea, btnX, y, btnSize, getValue, getCost, canAfford });

        return y + 62;
    }

    refreshAllRows() {
        for (const row of this.upgradeRows) {
            row.valueText.setText(row.getValue());
            row.costText.setText(row.getCost());
            const affordable = row.canAfford();
            const col = affordable ? 0x9b59b6 : 0x555555;
            row.btn.clear().fillStyle(col, 1).fillRoundedRect(
                row.btnX - row.btnSize / 2, row.y + 28 - row.btnSize / 2,
                row.btnSize, row.btnSize, 8
            );
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
