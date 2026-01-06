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

        // Dark overlay
        this.add.rectangle(cx, H / 2, W, H, 0x000000, 0.92);

        // Panel
        const panel = this.add.graphics();
        panel.fillStyle(0x1e1e2e, 1);
        panel.fillRoundedRect(15, 20, W - 30, H - 40, 16);
        panel.lineStyle(3, 0x9b59b6, 1);
        panel.strokeRoundedRect(15, 20, W - 30, H - 40, 16);

        // Title
        this.add.text(cx, 55, 'АПГРЕЙДЫ', {
            fontSize: '28px',
            fontFamily: 'Arial Black',
            color: '#ffffff'
        }).setOrigin(0.5).setShadow(2, 2, '#000000', 4);

        // Currency display
        const currencyBg = this.add.graphics();
        currencyBg.fillStyle(0xf39c12, 0.3);
        currencyBg.fillRoundedRect(cx - 100, 85, 200, 50, 12);
        this.add.text(cx - 60, 110, '💰', { fontSize: '28px' }).setOrigin(0.5);
        this.currencyText = this.add.text(cx + 10, 110, `${PlayerData.currency}`, {
            fontSize: '28px', color: '#f1c40f', fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        // Create scrollable upgrade list
        this.createUpgradeList();

        // Close button at bottom
        this.createCloseButton();
    }

    createUpgradeList() {
        const W = this.cameras.main.width;
        const cx = W / 2;
        const ROW_HEIGHT = 70;
        let y = 155;

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
        y += 10;
        this.add.text(cx, y, '— МНОЖИТЕЛИ ЦВЕТОВ —', {
            fontSize: '14px', color: '#9b59b6', fontStyle: 'bold'
        }).setOrigin(0.5);
        y += 30;

        // Color upgrades
        const colorCount = GameSettings.colorCount;
        for (let i = 0; i < colorCount; i++) {
            const colorIndex = i;
            y = this.createColorUpgradeRow(y, colorIndex);
        }
    }

    createUpgradeRow(y, icon, name, getValue, getCost, getAction, canAfford, onBuy) {
        const W = this.cameras.main.width;
        const cx = W / 2;

        // Row background
        const rowBg = this.add.graphics();
        rowBg.fillStyle(0x2a2a3e, 0.5);
        rowBg.fillRoundedRect(25, y, W - 50, 60, 10);

        // Icon and name on left
        this.add.text(40, y + 30, icon, { fontSize: '24px' }).setOrigin(0, 0.5);
        this.add.text(75, y + 30, name, {
            fontSize: '18px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        // Current value
        const valueText = this.add.text(200, y + 30, getValue(), {
            fontSize: '20px', color: '#55efc4', fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        // Cost
        const costText = this.add.text(270, y + 30, getCost(), {
            fontSize: '16px', color: '#f1c40f'
        }).setOrigin(0, 0.5);

        // Buy button
        const btnX = W - 70;
        const btnSize = 50;
        const affordable = canAfford();

        const btn = this.add.graphics();
        const btnColor = affordable ? 0x27ae60 : 0x555555;
        btn.fillStyle(btnColor, 1);
        btn.fillRoundedRect(btnX - btnSize / 2, y + 30 - btnSize / 2, btnSize, btnSize, 10);

        const btnText = this.add.text(btnX, y + 30, getAction(), {
            fontSize: '14px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        const hitArea = this.add.rectangle(btnX, y + 30, btnSize, btnSize, 0x000000, 0)
            .setInteractive({ useHandCursor: affordable })
            .on('pointerover', () => {
                if (canAfford()) {
                    btn.clear().fillStyle(0x2ecc71, 1).fillRoundedRect(btnX - btnSize / 2, y + 30 - btnSize / 2, btnSize, btnSize, 10);
                }
            })
            .on('pointerout', () => {
                const col = canAfford() ? 0x27ae60 : 0x555555;
                btn.clear().fillStyle(col, 1).fillRoundedRect(btnX - btnSize / 2, y + 30 - btnSize / 2, btnSize, btnSize, 10);
            })
            .on('pointerdown', () => {
                if (canAfford() && onBuy()) {
                    this.refreshRow(valueText, costText, btn, hitArea, btnX, y, btnSize, getValue, getCost, canAfford);
                    this.currencyText.setText(`${PlayerData.currency}`);
                }
            });

        this.upgradeRows.push({ valueText, costText, btn, hitArea, btnX, y, btnSize, getValue, getCost, canAfford });

        return y + 70;
    }

    createColorUpgradeRow(y, colorIndex) {
        const W = this.cameras.main.width;
        const cx = W / 2;

        // Row background
        const rowBg = this.add.graphics();
        rowBg.fillStyle(0x2a2a3e, 0.3);
        rowBg.fillRoundedRect(25, y, W - 50, 50, 8);

        // Color preview
        const preview = this.add.graphics();
        preview.fillStyle(ALL_GEM_COLORS[colorIndex], 1);
        preview.fillRoundedRect(35, y + 10, 30, 30, 6);
        preview.lineStyle(2, 0xffffff, 0.3);
        preview.strokeRoundedRect(35, y + 10, 30, 30, 6);

        // Color name
        this.add.text(75, y + 25, COLOR_NAMES[colorIndex], {
            fontSize: '16px', color: '#e0e0e0'
        }).setOrigin(0, 0.5);

        // Multiplier
        const getValue = () => `x${PlayerData.colorMultipliers[colorIndex] || 1}`;
        const valueText = this.add.text(190, y + 25, getValue(), {
            fontSize: '18px', color: '#55efc4', fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        // Cost
        const getCost = () => `${getUpgradeCost(colorIndex)}💰`;
        const costText = this.add.text(250, y + 25, getCost(), {
            fontSize: '14px', color: '#f1c40f'
        }).setOrigin(0, 0.5);

        // Buy button
        const btnX = W - 70;
        const btnW = 50;
        const btnH = 36;
        const canAfford = () => PlayerData.currency >= getUpgradeCost(colorIndex);

        const btn = this.add.graphics();
        const btnColor = canAfford() ? 0x27ae60 : 0x555555;
        btn.fillStyle(btnColor, 1);
        btn.fillRoundedRect(btnX - btnW / 2, y + 25 - btnH / 2, btnW, btnH, 8);

        this.add.text(btnX, y + 25, '+1', {
            fontSize: '14px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        const hitArea = this.add.rectangle(btnX, y + 25, btnW, btnH, 0x000000, 0)
            .setInteractive({ useHandCursor: canAfford() })
            .on('pointerover', () => {
                if (canAfford()) {
                    btn.clear().fillStyle(0x2ecc71, 1).fillRoundedRect(btnX - btnW / 2, y + 25 - btnH / 2, btnW, btnH, 8);
                }
            })
            .on('pointerout', () => {
                const col = canAfford() ? 0x27ae60 : 0x555555;
                btn.clear().fillStyle(col, 1).fillRoundedRect(btnX - btnW / 2, y + 25 - btnH / 2, btnW, btnH, 8);
            })
            .on('pointerdown', () => {
                if (canAfford() && upgradeColor(colorIndex)) {
                    valueText.setText(getValue());
                    costText.setText(getCost());
                    const col = canAfford() ? 0x27ae60 : 0x555555;
                    btn.clear().fillStyle(col, 1).fillRoundedRect(btnX - btnW / 2, y + 25 - btnH / 2, btnW, btnH, 8);
                    hitArea.setInteractive({ useHandCursor: canAfford() });
                    this.currencyText.setText(`${PlayerData.currency}`);
                    this.refreshAllRows();
                }
            });

        this.upgradeRows.push({
            valueText, costText, btn, hitArea,
            btnX, y: y - 5, btnSize: btnH, btnW,
            getValue, getCost, canAfford, isColor: true
        });

        return y + 55;
    }

    refreshRow(valueText, costText, btn, hitArea, btnX, y, btnSize, getValue, getCost, canAfford) {
        valueText.setText(getValue());
        costText.setText(getCost());
        const affordable = canAfford();
        const col = affordable ? 0x27ae60 : 0x555555;
        btn.clear().fillStyle(col, 1).fillRoundedRect(btnX - btnSize / 2, y + 30 - btnSize / 2, btnSize, btnSize, 10);
        hitArea.setInteractive({ useHandCursor: affordable });
        this.refreshAllRows();
    }

    refreshAllRows() {
        for (const row of this.upgradeRows) {
            row.valueText.setText(row.getValue());
            row.costText.setText(row.getCost());
            const affordable = row.canAfford();
            const col = affordable ? 0x27ae60 : 0x555555;
            if (row.isColor) {
                const btnW = row.btnW || 50;
                const btnH = row.btnSize;
                row.btn.clear().fillStyle(col, 1).fillRoundedRect(row.btnX - btnW / 2, row.y + 30 - btnH / 2, btnW, btnH, 8);
            } else {
                row.btn.clear().fillStyle(col, 1).fillRoundedRect(row.btnX - row.btnSize / 2, row.y + 30 - row.btnSize / 2, row.btnSize, row.btnSize, 10);
            }
            row.hitArea.setInteractive({ useHandCursor: affordable });
        }
    }

    createCloseButton() {
        const W = this.cameras.main.width;
        const H = this.cameras.main.height;
        const cx = W / 2;
        const btnY = H - 50;
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
