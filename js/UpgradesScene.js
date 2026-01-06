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
        const panelWidth = this.cameras.main.width - 40;
        const panelHeight = this.cameras.main.height - 60;

        // Dark overlay
        this.add.rectangle(cx, cy, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.85);

        // Main panel
        const panel = this.add.graphics();
        panel.fillStyle(0x1a1a2e, 1);
        panel.fillRoundedRect(20, 30, panelWidth, panelHeight, 20);
        panel.lineStyle(3, 0x9b59b6, 1);
        panel.strokeRoundedRect(20, 30, panelWidth, panelHeight, 20);

        // Title bar
        const titleBar = this.add.graphics();
        titleBar.fillStyle(0x9b59b6, 0.3);
        titleBar.fillRoundedRect(20, 30, panelWidth, 50, { tl: 20, tr: 20, bl: 0, br: 0 });

        this.add.text(cx, 55, 'АПГРЕЙДЫ', {
            fontSize: '22px', fontFamily: 'Arial Black', color: '#ffffff'
        }).setOrigin(0.5).setShadow(1, 1, '#000000', 2);

        // Currency display
        const currencyBg = this.add.graphics();
        currencyBg.fillStyle(0xf39c12, 0.2);
        currencyBg.fillRoundedRect(cx - 80, 85, 160, 35, 8);
        this.add.text(cx - 50, 102, '💰', { fontSize: '20px' }).setOrigin(0.5);
        this.currencyText = this.add.text(cx + 10, 102, `${PlayerData.currency}`, {
            fontSize: '20px', color: '#f1c40f', fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        // Upgrades section
        this.createUpgradeRows();

        // Close button
        this.createCloseButton(cx, this.cameras.main.height - 55);
    }

    createUpgradeRows() {
        const startY = 135;
        const rowHeight = 42;
        let currentY = startY;

        // Section: General
        currentY = this.createSectionHeader('Общие', currentY);
        currentY = this.createAutoMoveRow(currentY);
        currentY += 5;

        // Section: Bombs
        currentY = this.createSectionHeader('Бомбы', currentY);
        currentY = this.createBombChanceRow(currentY);
        currentY = this.createBombRadiusRow(currentY);
        currentY += 5;

        // Section: Colors
        currentY = this.createSectionHeader('Множители', currentY);
        this.createColorUpgrades(currentY);
    }

    createSectionHeader(title, y) {
        const cx = this.cameras.main.width / 2;
        this.add.text(35, y + 12, title.toUpperCase(), {
            fontSize: '11px', color: '#888888', fontStyle: 'bold'
        });
        this.add.graphics().lineStyle(1, 0x333333).lineBetween(35, y + 28, this.cameras.main.width - 35, y + 28);
        return y + 35;
    }

    createUpgradeButton(x, y, canAfford, onBuy) {
        const btn = this.add.graphics();
        const color = canAfford ? 0x27ae60 : 0x444444;
        btn.fillStyle(color, 1);
        btn.fillRoundedRect(x - 32, y - 14, 64, 28, 6);

        const hitArea = this.add.rectangle(x, y, 64, 28, 0x000000, 0)
            .setInteractive({ useHandCursor: canAfford })
            .on('pointerover', () => {
                if (canAfford) {
                    btn.clear().fillStyle(0x2ecc71, 1).fillRoundedRect(x - 32, y - 14, 64, 28, 6);
                }
            })
            .on('pointerout', () => {
                const col = canAfford ? 0x27ae60 : 0x444444;
                btn.clear().fillStyle(col, 1).fillRoundedRect(x - 32, y - 14, 64, 28, 6);
            })
            .on('pointerdown', onBuy);

        return { btn, hitArea };
    }

    createAutoMoveRow(y) {
        const seconds = (PlayerData.autoMoveDelay / 1000).toFixed(1);
        const atMin = PlayerData.autoMoveDelay <= 100;
        const cost = getAutoMoveUpgradeCost();
        const canAfford = PlayerData.currency >= cost && !atMin;
        const step = getAutoMoveStep();

        this.add.text(45, y, '⏱️', { fontSize: '18px' }).setOrigin(0, 0.5);
        this.add.text(75, y, 'Авто-ход', { fontSize: '14px', color: '#cccccc' }).setOrigin(0, 0.5);

        this.autoMoveText = this.add.text(180, y, `${seconds}с`, {
            fontSize: '16px', color: '#55efc4', fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        this.autoMoveCostText = this.add.text(250, y, atMin ? 'MAX' : `${cost}💰`, {
            fontSize: '13px', color: atMin ? '#55efc4' : '#f1c40f'
        }).setOrigin(0, 0.5);

        const { btn, hitArea } = this.createUpgradeButton(355, y, canAfford, () => this.buyAutoMoveUpgrade());
        this.autoMoveBtn = btn;
        this.autoMoveBtnHit = hitArea;

        this.autoMoveBtnText = this.add.text(355, y, `-${step / 1000}с`, {
            fontSize: '12px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        return y + 38;
    }

    createBombChanceRow(y) {
        const atMax = PlayerData.bombChance >= 50;
        const cost = getBombChanceUpgradeCost();
        const canAfford = PlayerData.currency >= cost && !atMax;

        this.add.text(45, y, '💣', { fontSize: '18px' }).setOrigin(0, 0.5);
        this.add.text(75, y, 'Шанс бомбы', { fontSize: '14px', color: '#cccccc' }).setOrigin(0, 0.5);

        this.bombChanceText = this.add.text(195, y, `${PlayerData.bombChance}%`, {
            fontSize: '16px', color: '#55efc4', fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        this.bombChanceCostText = this.add.text(250, y, atMax ? 'MAX' : `${cost}💰`, {
            fontSize: '13px', color: atMax ? '#55efc4' : '#f1c40f'
        }).setOrigin(0, 0.5);

        const { btn, hitArea } = this.createUpgradeButton(355, y, canAfford, () => this.buyBombChanceUpgrade());
        this.bombChanceBtn = btn;
        this.bombChanceBtnHit = hitArea;

        this.add.text(355, y, '+5%', { fontSize: '12px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

        return y + 38;
    }

    createBombRadiusRow(y) {
        const atMax = PlayerData.bombRadius >= 3;
        const cost = getBombRadiusUpgradeCost();
        const canAfford = PlayerData.currency >= cost && !atMax;

        this.add.text(45, y, '💥', { fontSize: '18px' }).setOrigin(0, 0.5);
        this.add.text(75, y, 'Радиус бомбы', { fontSize: '14px', color: '#cccccc' }).setOrigin(0, 0.5);

        this.bombRadiusText = this.add.text(200, y, `${PlayerData.bombRadius}`, {
            fontSize: '16px', color: '#55efc4', fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        this.bombRadiusCostText = this.add.text(250, y, atMax ? 'MAX' : `${cost}💰`, {
            fontSize: '13px', color: atMax ? '#55efc4' : '#f1c40f'
        }).setOrigin(0, 0.5);

        const { btn, hitArea } = this.createUpgradeButton(355, y, canAfford, () => this.buyBombRadiusUpgrade());
        this.bombRadiusBtn = btn;
        this.bombRadiusBtnHit = hitArea;

        this.add.text(355, y, '+1', { fontSize: '12px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

        return y + 38;
    }

    createColorUpgrades(startY) {
        const colorCount = GameSettings.colorCount;
        const rowHeight = 38;
        this.upgradeItems = [];

        for (let i = 0; i < colorCount; i++) {
            const y = startY + i * rowHeight;
            const multiplier = PlayerData.colorMultipliers[i] || 1;
            const cost = getUpgradeCost(i);
            const canAfford = PlayerData.currency >= cost;

            // Color gem preview
            const preview = this.add.graphics();
            preview.fillStyle(ALL_GEM_COLORS[i], 1);
            preview.fillRoundedRect(40, y - 12, 24, 24, 5);
            preview.lineStyle(1, 0xffffff, 0.3);
            preview.strokeRoundedRect(40, y - 12, 24, 24, 5);

            // Color name
            this.add.text(75, y, COLOR_NAMES[i], {
                fontSize: '13px', color: '#aaaaaa'
            }).setOrigin(0, 0.5);

            // Multiplier
            const multText = this.add.text(180, y, `x${multiplier}`, {
                fontSize: '15px', color: '#55efc4', fontStyle: 'bold'
            }).setOrigin(0, 0.5);

            // Cost
            const costText = this.add.text(230, y, `${cost}💰`, {
                fontSize: '12px', color: '#f1c40f'
            }).setOrigin(0, 0.5);

            // Button
            const colorIndex = i;
            const { btn, hitArea } = this.createUpgradeButton(355, y, canAfford, () => this.buyUpgrade(colorIndex));

            this.add.text(355, y, '+1', {
                fontSize: '12px', color: '#ffffff', fontStyle: 'bold'
            }).setOrigin(0.5);

            this.upgradeItems.push({ colorIndex: i, multText, costText, btn, hitArea });
        }
    }

    createCloseButton(x, y) {
        const btn = this.add.graphics();
        btn.fillStyle(0xe74c3c, 1);
        btn.fillRoundedRect(x - 70, y - 18, 140, 36, 10);

        this.add.rectangle(x, y, 140, 36, 0x000000, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                btn.clear().fillStyle(0xc0392b, 1).fillRoundedRect(x - 70, y - 18, 140, 36, 10);
            })
            .on('pointerout', () => {
                btn.clear().fillStyle(0xe74c3c, 1).fillRoundedRect(x - 70, y - 18, 140, 36, 10);
            })
            .on('pointerdown', () => this.scene.stop());

        this.add.text(x, y, '✕ ЗАКРЫТЬ', {
            fontSize: '14px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    buyAutoMoveUpgrade() {
        if (upgradeAutoMove()) this.refreshUI();
    }

    buyBombChanceUpgrade() {
        if (upgradeBombChance()) this.refreshUI();
    }

    buyBombRadiusUpgrade() {
        if (upgradeBombRadius()) this.refreshUI();
    }

    buyUpgrade(colorIndex) {
        if (upgradeColor(colorIndex)) this.refreshUI();
    }

    refreshUI() {
        this.currencyText.setText(`${PlayerData.currency}`);

        // Auto-move
        const seconds = (PlayerData.autoMoveDelay / 1000).toFixed(1);
        const atMin = PlayerData.autoMoveDelay <= 100;
        const autoMoveCost = getAutoMoveUpgradeCost();
        const autoMoveAfford = PlayerData.currency >= autoMoveCost && !atMin;
        const step = getAutoMoveStep();

        this.autoMoveText.setText(`${seconds}с`);
        this.autoMoveCostText.setText(atMin ? 'MAX' : `${autoMoveCost}💰`);
        this.autoMoveCostText.setColor(atMin ? '#55efc4' : '#f1c40f');
        this.updateButtonState(this.autoMoveBtn, this.autoMoveBtnHit, autoMoveAfford, 355, this.autoMoveText.y);
        this.autoMoveBtnText.setText(`-${step / 1000}с`);

        // Bomb chance
        const atMaxChance = PlayerData.bombChance >= 50;
        const chanceCost = getBombChanceUpgradeCost();
        const canAffordChance = PlayerData.currency >= chanceCost && !atMaxChance;

        this.bombChanceText.setText(`${PlayerData.bombChance}%`);
        this.bombChanceCostText.setText(atMaxChance ? 'MAX' : `${chanceCost}💰`);
        this.bombChanceCostText.setColor(atMaxChance ? '#55efc4' : '#f1c40f');
        this.updateButtonState(this.bombChanceBtn, this.bombChanceBtnHit, canAffordChance, 355, this.bombChanceText.y);

        // Bomb radius
        const atMaxRadius = PlayerData.bombRadius >= 3;
        const radiusCost = getBombRadiusUpgradeCost();
        const canAffordRadius = PlayerData.currency >= radiusCost && !atMaxRadius;

        this.bombRadiusText.setText(`${PlayerData.bombRadius}`);
        this.bombRadiusCostText.setText(atMaxRadius ? 'MAX' : `${radiusCost}💰`);
        this.bombRadiusCostText.setColor(atMaxRadius ? '#55efc4' : '#f1c40f');
        this.updateButtonState(this.bombRadiusBtn, this.bombRadiusBtnHit, canAffordRadius, 355, this.bombRadiusText.y);

        // Color upgrades
        for (const item of this.upgradeItems) {
            const multiplier = PlayerData.colorMultipliers[item.colorIndex] || 1;
            const cost = getUpgradeCost(item.colorIndex);
            const canAfford = PlayerData.currency >= cost;

            item.multText.setText(`x${multiplier}`);
            item.costText.setText(`${cost}💰`);
            this.updateButtonState(item.btn, item.hitArea, canAfford, 355, item.multText.y);
        }
    }

    updateButtonState(btn, hitArea, canAfford, x, y) {
        const color = canAfford ? 0x27ae60 : 0x444444;
        btn.clear().fillStyle(color, 1).fillRoundedRect(x - 32, y - 14, 64, 28, 6);
        hitArea.setInteractive({ useHandCursor: canAfford });
    }
}
