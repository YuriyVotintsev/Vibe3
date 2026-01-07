import {
    PlayerData,
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
    getPrestigeCoinsFromCurrency,
    getCurrencyForCoins,
    getProgressToNextCoin,
    performPrestige
} from './config.js';

export class PrestigeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PrestigeScene' });
    }

    create() {
        // Don't pause MainScene - let it run in background (like UpgradesScene)

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
        const panelBottom = H - 130;
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

        // Prestige coins display
        this.add.text(cx - 50, 85, '👑', { fontSize: '26px' }).setOrigin(0.5);
        this.prestigeText = this.add.text(cx - 20, 85, `${PlayerData.prestigeCurrency}`, {
            fontSize: '26px', color: '#e056fd', fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        // Progress bar section
        this.createProgressBar(cx);

        // Prestige upgrades
        this.createUpgradeRows();

        // Bottom buttons
        this.createBottomButtons();
    }

    update() {
        // Live update when currencies change
        if (PlayerData.currency !== this.lastCurrency || PlayerData.prestigeCurrency !== this.lastPrestige) {
            this.lastCurrency = PlayerData.currency;
            this.lastPrestige = PlayerData.prestigeCurrency;
            this.prestigeText.setText(`${PlayerData.prestigeCurrency}`);
            this.updateProgressBar();
            this.updatePrestigeButton();
            this.refreshAllRows();
        }
    }

    createProgressBar(cx) {
        const W = this.cameras.main.width;
        const y = 125;
        const barWidth = W - 80;
        const barHeight = 24;

        // Background
        const bgGraphics = this.add.graphics();
        bgGraphics.fillStyle(0x2a2a3e, 1);
        bgGraphics.fillRoundedRect(cx - barWidth / 2, y, barWidth, barHeight, 8);

        // Progress fill
        this.progressBarFill = this.add.graphics();
        this.progressBarWidth = barWidth;
        this.progressBarX = cx - barWidth / 2;
        this.progressBarY = y;
        this.progressBarHeight = barHeight;

        this.updateProgressBar();

        // Progress text
        const currentCoins = getPrestigeCoinsFromCurrency(PlayerData.currency);
        const nextThreshold = getCurrencyForCoins(currentCoins + 1);
        this.progressText = this.add.text(cx, y + barHeight / 2, `${PlayerData.currency} / ${nextThreshold}`, {
            fontSize: '14px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Label
        this.add.text(cx, y - 15, 'До следующей монеты:', {
            fontSize: '12px', color: '#aaaaaa'
        }).setOrigin(0.5);
    }

    updateProgressBar() {
        const progress = getProgressToNextCoin();
        const fillWidth = Math.max(4, this.progressBarWidth * progress);

        this.progressBarFill.clear();
        this.progressBarFill.fillStyle(0xf1c40f, 1);
        this.progressBarFill.fillRoundedRect(this.progressBarX, this.progressBarY, fillWidth, this.progressBarHeight, 8);

        // Update text
        const currentCoins = getPrestigeCoinsFromCurrency(PlayerData.currency);
        const nextThreshold = getCurrencyForCoins(currentCoins + 1);
        if (this.progressText) {
            this.progressText.setText(`${PlayerData.currency} / ${nextThreshold}`);
        }
    }

    createUpgradeRows() {
        const W = this.cameras.main.width;
        let y = 165;

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

    createBottomButtons() {
        const W = this.cameras.main.width;
        const H = this.cameras.main.height;
        const cx = W / 2;
        const btnWidth = (W - 80) / 2;
        const btnHeight = 50;
        const btnY = H - 65;

        // Prestige button (left)
        const coinsToGain = getPrestigeCoinsFromCurrency(PlayerData.currency);
        const canPrestige = coinsToGain > 0;

        this.prestigeBtn = this.add.graphics();
        this.prestigeBtn.fillStyle(canPrestige ? 0x27ae60 : 0x555555, 1);
        this.prestigeBtn.fillRoundedRect(30, btnY - btnHeight / 2, btnWidth, btnHeight, 12);

        const prestigeBtnX = 30 + btnWidth / 2;
        this.prestigeBtnText = this.add.text(prestigeBtnX, btnY, this.getPrestigeButtonLabel(), {
            fontSize: '16px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.prestigeBtnHitArea = this.add.rectangle(prestigeBtnX, btnY, btnWidth, btnHeight, 0x000000, 0)
            .setInteractive({ useHandCursor: canPrestige })
            .on('pointerover', () => {
                if (getPrestigeCoinsFromCurrency(PlayerData.currency) > 0) {
                    this.prestigeBtn.clear().fillStyle(0x2ecc71, 1).fillRoundedRect(30, btnY - btnHeight / 2, btnWidth, btnHeight, 12);
                }
            })
            .on('pointerout', () => {
                const canP = getPrestigeCoinsFromCurrency(PlayerData.currency) > 0;
                this.prestigeBtn.clear().fillStyle(canP ? 0x27ae60 : 0x555555, 1).fillRoundedRect(30, btnY - btnHeight / 2, btnWidth, btnHeight, 12);
            })
            .on('pointerdown', () => {
                if (performPrestige()) {
                    // Restart game
                    this.scene.stop();
                    this.scene.stop('MainScene');
                    this.scene.start('MainScene');
                }
            });

        this.prestigeBtnY = btnY;
        this.prestigeBtnWidth = btnWidth;

        // Close button (right)
        const closeBtnX = W - 30 - btnWidth / 2;
        const closeBtn = this.add.graphics();
        closeBtn.fillStyle(0xe74c3c, 1);
        closeBtn.fillRoundedRect(W - 30 - btnWidth, btnY - btnHeight / 2, btnWidth, btnHeight, 12);

        this.add.rectangle(closeBtnX, btnY, btnWidth, btnHeight, 0x000000, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                closeBtn.clear().fillStyle(0xc0392b, 1).fillRoundedRect(W - 30 - btnWidth, btnY - btnHeight / 2, btnWidth, btnHeight, 12);
            })
            .on('pointerout', () => {
                closeBtn.clear().fillStyle(0xe74c3c, 1).fillRoundedRect(W - 30 - btnWidth, btnY - btnHeight / 2, btnWidth, btnHeight, 12);
            })
            .on('pointerdown', () => this.scene.stop());

        this.add.text(closeBtnX, btnY, '✕ ЗАКРЫТЬ', {
            fontSize: '16px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    getPrestigeButtonLabel() {
        const coins = getPrestigeCoinsFromCurrency(PlayerData.currency);
        if (coins > 0) {
            return `✓ ПРЕСТИЖ (+${coins}👑)`;
        }
        return '✓ ПРЕСТИЖ (0👑)';
    }

    updatePrestigeButton() {
        const canPrestige = getPrestigeCoinsFromCurrency(PlayerData.currency) > 0;
        this.prestigeBtn.clear();
        this.prestigeBtn.fillStyle(canPrestige ? 0x27ae60 : 0x555555, 1);
        this.prestigeBtn.fillRoundedRect(30, this.prestigeBtnY - 25, this.prestigeBtnWidth, 50, 12);
        this.prestigeBtnText.setText(this.getPrestigeButtonLabel());
        this.prestigeBtnHitArea.setInteractive({ useHandCursor: canPrestige });
    }
}
