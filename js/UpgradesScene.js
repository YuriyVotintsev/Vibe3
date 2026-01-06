import {
    GameSettings,
    ALL_GEM_COLORS,
    COLOR_NAMES,
    PlayerData,
    getUpgradeCost,
    upgradeColor,
    savePlayerData,
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
        const cx = this.cameras.main.width / 2;
        const cy = this.cameras.main.height / 2;

        // Dark background
        this.add.rectangle(cx, cy, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.9);

        // Title
        this.add.text(cx, 30, '⬆️ Апгрейды', { fontSize: '24px', color: '#e94560' }).setOrigin(0.5);

        // Currency display
        this.currencyText = this.add.text(cx, 60, `💰 ${PlayerData.currency}`, {
            fontSize: '20px', color: '#f1c40f'
        }).setOrigin(0.5);

        // Auto-move timer upgrade
        this.createAutoMoveUpgrade();

        // Bomb upgrades
        this.createBombUpgrades();

        // Scrollable area for color upgrades
        this.createColorUpgrades();

        // Close button
        const closeBtn = this.add.rectangle(cx, this.cameras.main.height - 40, 150, 40, 0xe74c3c)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => closeBtn.setFillStyle(0xc0392b))
            .on('pointerout', () => closeBtn.setFillStyle(0xe74c3c))
            .on('pointerdown', () => this.scene.stop());
        this.add.text(cx, this.cameras.main.height - 40, '✕ Закрыть', {
            fontSize: '16px', color: '#ffffff'
        }).setOrigin(0.5);
    }

    createAutoMoveUpgrade() {
        const y = 95;
        const cx = this.cameras.main.width / 2;

        // Label
        this.add.text(60, y, '⏱️ Авто-ход', {
            fontSize: '14px', color: '#ffffff'
        }).setOrigin(0, 0.5);

        // Current value
        const seconds = (PlayerData.autoMoveDelay / 1000).toFixed(1);
        this.autoMoveText = this.add.text(160, y, `${seconds}с`, {
            fontSize: '16px', color: '#55efc4', fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        // Cost (or max if at minimum)
        const atMin = PlayerData.autoMoveDelay <= 100;
        const cost = getAutoMoveUpgradeCost();
        this.autoMoveCostText = this.add.text(220, y, atMin ? 'MAX' : `${cost}💰`, {
            fontSize: '14px', color: atMin ? '#55efc4' : '#f1c40f'
        }).setOrigin(0, 0.5);

        // Upgrade button
        const canAfford = PlayerData.currency >= cost && !atMin;
        const btnColor = canAfford ? 0x27ae60 : 0x555555;

        this.autoMoveBtn = this.add.rectangle(340, y, 70, 32, btnColor)
            .setInteractive({ useHandCursor: canAfford })
            .on('pointerover', () => {
                const affordable = PlayerData.currency >= getAutoMoveUpgradeCost() && PlayerData.autoMoveDelay > 100;
                if (affordable) this.autoMoveBtn.setFillStyle(0x2ecc71);
            })
            .on('pointerout', () => {
                const affordable = PlayerData.currency >= getAutoMoveUpgradeCost() && PlayerData.autoMoveDelay > 100;
                this.autoMoveBtn.setFillStyle(affordable ? 0x27ae60 : 0x555555);
            })
            .on('pointerdown', () => this.buyAutoMoveUpgrade());

        const step = getAutoMoveStep();
        this.autoMoveBtnText = this.add.text(340, y, `-${step / 1000}с`, {
            fontSize: '14px', color: '#ffffff'
        }).setOrigin(0.5);
    }

    buyAutoMoveUpgrade() {
        if (upgradeAutoMove()) {
            this.refreshUI();
        }
    }

    createBombUpgrades() {
        // Bomb Chance upgrade
        const y1 = 130;
        this.add.text(60, y1, '💣 Шанс бомбы', {
            fontSize: '14px', color: '#ffffff'
        }).setOrigin(0, 0.5);

        this.bombChanceText = this.add.text(185, y1, `${PlayerData.bombChance}%`, {
            fontSize: '16px', color: '#55efc4', fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        const atMaxChance = PlayerData.bombChance >= 50;
        const chanceCost = getBombChanceUpgradeCost();
        this.bombChanceCostText = this.add.text(240, y1, atMaxChance ? 'MAX' : `${chanceCost}💰`, {
            fontSize: '14px', color: atMaxChance ? '#55efc4' : '#f1c40f'
        }).setOrigin(0, 0.5);

        const canAffordChance = PlayerData.currency >= chanceCost && !atMaxChance;
        this.bombChanceBtn = this.add.rectangle(340, y1, 70, 32, canAffordChance ? 0x27ae60 : 0x555555)
            .setInteractive({ useHandCursor: canAffordChance })
            .on('pointerover', () => {
                const affordable = PlayerData.currency >= getBombChanceUpgradeCost() && PlayerData.bombChance < 50;
                if (affordable) this.bombChanceBtn.setFillStyle(0x2ecc71);
            })
            .on('pointerout', () => {
                const affordable = PlayerData.currency >= getBombChanceUpgradeCost() && PlayerData.bombChance < 50;
                this.bombChanceBtn.setFillStyle(affordable ? 0x27ae60 : 0x555555);
            })
            .on('pointerdown', () => this.buyBombChanceUpgrade());

        this.bombChanceBtnText = this.add.text(340, y1, '+5%', {
            fontSize: '14px', color: '#ffffff'
        }).setOrigin(0.5);

        // Bomb Radius upgrade
        const y2 = 165;
        this.add.text(60, y2, '💥 Радиус бомбы', {
            fontSize: '14px', color: '#ffffff'
        }).setOrigin(0, 0.5);

        this.bombRadiusText = this.add.text(195, y2, `${PlayerData.bombRadius}`, {
            fontSize: '16px', color: '#55efc4', fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        const atMaxRadius = PlayerData.bombRadius >= 3;
        const radiusCost = getBombRadiusUpgradeCost();
        this.bombRadiusCostText = this.add.text(240, y2, atMaxRadius ? 'MAX' : `${radiusCost}💰`, {
            fontSize: '14px', color: atMaxRadius ? '#55efc4' : '#f1c40f'
        }).setOrigin(0, 0.5);

        const canAffordRadius = PlayerData.currency >= radiusCost && !atMaxRadius;
        this.bombRadiusBtn = this.add.rectangle(340, y2, 70, 32, canAffordRadius ? 0x27ae60 : 0x555555)
            .setInteractive({ useHandCursor: canAffordRadius })
            .on('pointerover', () => {
                const affordable = PlayerData.currency >= getBombRadiusUpgradeCost() && PlayerData.bombRadius < 3;
                if (affordable) this.bombRadiusBtn.setFillStyle(0x2ecc71);
            })
            .on('pointerout', () => {
                const affordable = PlayerData.currency >= getBombRadiusUpgradeCost() && PlayerData.bombRadius < 3;
                this.bombRadiusBtn.setFillStyle(affordable ? 0x27ae60 : 0x555555);
            })
            .on('pointerdown', () => this.buyBombRadiusUpgrade());

        this.bombRadiusBtnText = this.add.text(340, y2, '+1', {
            fontSize: '14px', color: '#ffffff'
        }).setOrigin(0.5);
    }

    buyBombChanceUpgrade() {
        if (upgradeBombChance()) {
            this.refreshUI();
        }
    }

    buyBombRadiusUpgrade() {
        if (upgradeBombRadius()) {
            this.refreshUI();
        }
    }

    createColorUpgrades() {
        const startY = 205;
        const itemHeight = 50;
        const colorCount = GameSettings.colorCount;

        this.upgradeItems = [];

        for (let i = 0; i < colorCount; i++) {
            const y = startY + i * itemHeight;

            // Color preview (small square)
            const colorPreview = this.add.rectangle(60, y, 30, 30, ALL_GEM_COLORS[i])
                .setStrokeStyle(2, 0xffffff);

            // Color name
            const nameText = this.add.text(85, y, COLOR_NAMES[i], {
                fontSize: '14px', color: '#ffffff'
            }).setOrigin(0, 0.5);

            // Current multiplier
            const multiplier = PlayerData.colorMultipliers[i] || 1;
            const multText = this.add.text(200, y, `x${multiplier}`, {
                fontSize: '16px', color: '#55efc4', fontStyle: 'bold'
            }).setOrigin(0, 0.5);

            // Upgrade cost
            const cost = getUpgradeCost(i);
            const costText = this.add.text(260, y, `${cost}💰`, {
                fontSize: '14px', color: '#f1c40f'
            }).setOrigin(0, 0.5);

            // Upgrade button
            const canAfford = PlayerData.currency >= cost;
            const btnColor = canAfford ? 0x27ae60 : 0x555555;

            const btn = this.add.rectangle(360, y, 70, 32, btnColor)
                .setInteractive({ useHandCursor: canAfford })
                .on('pointerover', () => {
                    if (PlayerData.currency >= getUpgradeCost(i)) {
                        btn.setFillStyle(0x2ecc71);
                    }
                })
                .on('pointerout', () => {
                    const affordable = PlayerData.currency >= getUpgradeCost(i);
                    btn.setFillStyle(affordable ? 0x27ae60 : 0x555555);
                })
                .on('pointerdown', () => this.buyUpgrade(i));

            const btnText = this.add.text(360, y, '+1', {
                fontSize: '14px', color: '#ffffff'
            }).setOrigin(0.5);

            this.upgradeItems.push({
                colorIndex: i,
                multText,
                costText,
                btn,
                btnText
            });
        }
    }

    buyUpgrade(colorIndex) {
        if (upgradeColor(colorIndex)) {
            this.refreshUI();
        }
    }

    refreshUI() {
        // Update currency
        this.currencyText.setText(`💰 ${PlayerData.currency}`);

        // Update auto-move upgrade
        const seconds = (PlayerData.autoMoveDelay / 1000).toFixed(1);
        const atMin = PlayerData.autoMoveDelay <= 100;
        const autoMoveCost = getAutoMoveUpgradeCost();
        const autoMoveAfford = PlayerData.currency >= autoMoveCost && !atMin;
        const step = getAutoMoveStep();

        this.autoMoveText.setText(`${seconds}с`);
        this.autoMoveCostText.setText(atMin ? 'MAX' : `${autoMoveCost}💰`);
        this.autoMoveCostText.setColor(atMin ? '#55efc4' : '#f1c40f');
        this.autoMoveBtn.setFillStyle(autoMoveAfford ? 0x27ae60 : 0x555555);
        this.autoMoveBtn.setInteractive({ useHandCursor: autoMoveAfford });
        this.autoMoveBtnText.setText(`-${step / 1000}с`);

        // Update bomb chance upgrade
        const atMaxChance = PlayerData.bombChance >= 50;
        const chanceCost = getBombChanceUpgradeCost();
        const canAffordChance = PlayerData.currency >= chanceCost && !atMaxChance;

        this.bombChanceText.setText(`${PlayerData.bombChance}%`);
        this.bombChanceCostText.setText(atMaxChance ? 'MAX' : `${chanceCost}💰`);
        this.bombChanceCostText.setColor(atMaxChance ? '#55efc4' : '#f1c40f');
        this.bombChanceBtn.setFillStyle(canAffordChance ? 0x27ae60 : 0x555555);
        this.bombChanceBtn.setInteractive({ useHandCursor: canAffordChance });

        // Update bomb radius upgrade
        const atMaxRadius = PlayerData.bombRadius >= 3;
        const radiusCost = getBombRadiusUpgradeCost();
        const canAffordRadius = PlayerData.currency >= radiusCost && !atMaxRadius;

        this.bombRadiusText.setText(`${PlayerData.bombRadius}`);
        this.bombRadiusCostText.setText(atMaxRadius ? 'MAX' : `${radiusCost}💰`);
        this.bombRadiusCostText.setColor(atMaxRadius ? '#55efc4' : '#f1c40f');
        this.bombRadiusBtn.setFillStyle(canAffordRadius ? 0x27ae60 : 0x555555);
        this.bombRadiusBtn.setInteractive({ useHandCursor: canAffordRadius });

        // Update each color upgrade item
        for (const item of this.upgradeItems) {
            const i = item.colorIndex;
            const multiplier = PlayerData.colorMultipliers[i] || 1;
            const cost = getUpgradeCost(i);
            const canAfford = PlayerData.currency >= cost;

            item.multText.setText(`x${multiplier}`);
            item.costText.setText(`${cost}💰`);
            item.btn.setFillStyle(canAfford ? 0x27ae60 : 0x555555);
            item.btn.setInteractive({ useHandCursor: canAfford });
        }
    }
}
