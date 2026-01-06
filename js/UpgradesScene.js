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
        const panelWidth = this.cameras.main.width - 30;
        const panelHeight = this.cameras.main.height - 40;

        // Dark overlay
        this.add.rectangle(cx, cy, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.9);

        // Main panel
        const panel = this.add.graphics();
        panel.fillStyle(0x1a1a2e, 1);
        panel.fillRoundedRect(15, 20, panelWidth, panelHeight, 16);
        panel.lineStyle(3, 0x9b59b6, 1);
        panel.strokeRoundedRect(15, 20, panelWidth, panelHeight, 16);

        // Title bar
        const titleBar = this.add.graphics();
        titleBar.fillStyle(0x9b59b6, 0.4);
        titleBar.fillRoundedRect(15, 20, panelWidth, 55, { tl: 16, tr: 16, bl: 0, br: 0 });

        this.add.text(cx, 48, 'АПГРЕЙДЫ', {
            fontSize: '26px', fontFamily: 'Arial Black', color: '#ffffff'
        }).setOrigin(0.5).setShadow(2, 2, '#000000', 3);

        // Currency display
        const currencyBg = this.add.graphics();
        currencyBg.fillStyle(0xf39c12, 0.3);
        currencyBg.fillRoundedRect(cx - 90, 82, 180, 42, 10);
        this.add.text(cx - 55, 103, '💰', { fontSize: '24px' }).setOrigin(0.5);
        this.currencyText = this.add.text(cx + 5, 103, `${PlayerData.currency}`, {
            fontSize: '24px', color: '#f1c40f', fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        // Upgrades section
        this.createUpgradeRows();

        // Close button
        this.createCloseButton(cx, this.cameras.main.height - 50);
    }

    createUpgradeRows() {
        const startY = 140;
        const rowHeight = 48;
        let currentY = startY;

        // Section: General
        currentY = this.createSectionHeader('Общие', currentY);
        currentY = this.createAutoMoveRow(currentY);
        currentY += 8;

        // Section: Bombs
        currentY = this.createSectionHeader('Бомбы', currentY);
        currentY = this.createBombChanceRow(currentY);
        currentY = this.createBombRadiusRow(currentY);
        currentY += 8;

        // Section: Colors
        currentY = this.createSectionHeader('Множители', currentY);
        this.createColorUpgrades(currentY);
    }

    createSectionHeader(title, y) {
        this.add.text(30, y + 10, title.toUpperCase(), {
            fontSize: '14px', color: '#9b59b6', fontStyle: 'bold'
        });
        this.add.graphics().lineStyle(1, 0x444444).lineBetween(30, y + 30, this.cameras.main.width - 30, y + 30);
        return y + 40;
    }

    createUpgradeButton(x, y, canAfford, onBuy) {
        const btn = this.add.graphics();
        const color = canAfford ? 0x27ae60 : 0x555555;
        btn.fillStyle(color, 1);
        btn.fillRoundedRect(x - 38, y - 16, 76, 32, 8);

        const hitArea = this.add.rectangle(x, y, 76, 32, 0x000000, 0)
            .setInteractive({ useHandCursor: canAfford })
            .on('pointerover', () => {
                if (canAfford) {
                    btn.clear().fillStyle(0x2ecc71, 1).fillRoundedRect(x - 38, y - 16, 76, 32, 8);
                }
            })
            .on('pointerout', () => {
                const col = canAfford ? 0x27ae60 : 0x555555;
                btn.clear().fillStyle(col, 1).fillRoundedRect(x - 38, y - 16, 76, 32, 8);
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

        this.add.text(35, y, '⏱️', { fontSize: '22px' }).setOrigin(0, 0.5);
        this.add.text(70, y, 'Авто-ход', { fontSize: '18px', color: '#ffffff' }).setOrigin(0, 0.5);

        this.autoMoveText = this.add.text(190, y, `${seconds}с`, {
            fontSize: '18px', color: '#55efc4', fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        this.autoMoveCostText = this.add.text(260, y, atMin ? 'MAX' : `${cost}💰`, {
            fontSize: '16px', color: atMin ? '#55efc4' : '#f1c40f'
        }).setOrigin(0, 0.5);

        const { btn, hitArea } = this.createUpgradeButton(370, y, canAfford, () => this.buyAutoMoveUpgrade());
        this.autoMoveBtn = btn;
        this.autoMoveBtnHit = hitArea;

        this.autoMoveBtnText = this.add.text(370, y, `-${step / 1000}с`, {
            fontSize: '15px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        return y + 44;
    }

    createBombChanceRow(y) {
        const atMax = PlayerData.bombChance >= 50;
        const cost = getBombChanceUpgradeCost();
        const canAfford = PlayerData.currency >= cost && !atMax;

        this.add.text(35, y, '💣', { fontSize: '22px' }).setOrigin(0, 0.5);
        this.add.text(70, y, 'Шанс бомбы', { fontSize: '18px', color: '#ffffff' }).setOrigin(0, 0.5);

        this.bombChanceText = this.add.text(210, y, `${PlayerData.bombChance}%`, {
            fontSize: '18px', color: '#55efc4', fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        this.bombChanceCostText = this.add.text(260, y, atMax ? 'MAX' : `${cost}💰`, {
            fontSize: '16px', color: atMax ? '#55efc4' : '#f1c40f'
        }).setOrigin(0, 0.5);

        const { btn, hitArea } = this.createUpgradeButton(370, y, canAfford, () => this.buyBombChanceUpgrade());
        this.bombChanceBtn = btn;
        this.bombChanceBtnHit = hitArea;

        this.add.text(370, y, '+5%', { fontSize: '15px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

        return y + 44;
    }

    createBombRadiusRow(y) {
        const atMax = PlayerData.bombRadius >= 3;
        const cost = getBombRadiusUpgradeCost();
        const canAfford = PlayerData.currency >= cost && !atMax;

        this.add.text(35, y, '💥', { fontSize: '22px' }).setOrigin(0, 0.5);
        this.add.text(70, y, 'Радиус бомбы', { fontSize: '18px', color: '#ffffff' }).setOrigin(0, 0.5);

        this.bombRadiusText = this.add.text(220, y, `${PlayerData.bombRadius}`, {
            fontSize: '18px', color: '#55efc4', fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        this.bombRadiusCostText = this.add.text(260, y, atMax ? 'MAX' : `${cost}💰`, {
            fontSize: '16px', color: atMax ? '#55efc4' : '#f1c40f'
        }).setOrigin(0, 0.5);

        const { btn, hitArea } = this.createUpgradeButton(370, y, canAfford, () => this.buyBombRadiusUpgrade());
        this.bombRadiusBtn = btn;
        this.bombRadiusBtnHit = hitArea;

        this.add.text(370, y, '+1', { fontSize: '15px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

        return y + 44;
    }

    createColorUpgrades(startY) {
        const colorCount = GameSettings.colorCount;
        const rowHeight = 42;
        this.upgradeItems = [];

        for (let i = 0; i < colorCount; i++) {
            const y = startY + i * rowHeight;
            const multiplier = PlayerData.colorMultipliers[i] || 1;
            const cost = getUpgradeCost(i);
            const canAfford = PlayerData.currency >= cost;

            // Color gem preview
            const preview = this.add.graphics();
            preview.fillStyle(ALL_GEM_COLORS[i], 1);
            preview.fillRoundedRect(32, y - 14, 28, 28, 6);
            preview.lineStyle(2, 0xffffff, 0.4);
            preview.strokeRoundedRect(32, y - 14, 28, 28, 6);

            // Color name
            this.add.text(70, y, COLOR_NAMES[i], {
                fontSize: '16px', color: '#e0e0e0'
            }).setOrigin(0, 0.5);

            // Multiplier
            const multText = this.add.text(190, y, `x${multiplier}`, {
                fontSize: '17px', color: '#55efc4', fontStyle: 'bold'
            }).setOrigin(0, 0.5);

            // Cost
            const costText = this.add.text(240, y, `${cost}💰`, {
                fontSize: '15px', color: '#f1c40f'
            }).setOrigin(0, 0.5);

            // Button
            const colorIndex = i;
            const { btn, hitArea } = this.createUpgradeButton(370, y, canAfford, () => this.buyUpgrade(colorIndex));

            this.add.text(370, y, '+1', {
                fontSize: '15px', color: '#ffffff', fontStyle: 'bold'
            }).setOrigin(0.5);

            this.upgradeItems.push({ colorIndex: i, multText, costText, btn, hitArea });
        }
    }

    createCloseButton(x, y) {
        const btn = this.add.graphics();
        btn.fillStyle(0xe74c3c, 1);
        btn.fillRoundedRect(x - 80, y - 22, 160, 44, 12);

        this.add.rectangle(x, y, 160, 44, 0x000000, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                btn.clear().fillStyle(0xc0392b, 1).fillRoundedRect(x - 80, y - 22, 160, 44, 12);
            })
            .on('pointerout', () => {
                btn.clear().fillStyle(0xe74c3c, 1).fillRoundedRect(x - 80, y - 22, 160, 44, 12);
            })
            .on('pointerdown', () => this.scene.stop());

        this.add.text(x, y, '✕ ЗАКРЫТЬ', {
            fontSize: '18px', color: '#ffffff', fontStyle: 'bold'
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
        this.updateButtonState(this.autoMoveBtn, this.autoMoveBtnHit, autoMoveAfford, 370, this.autoMoveText.y);
        this.autoMoveBtnText.setText(`-${step / 1000}с`);

        // Bomb chance
        const atMaxChance = PlayerData.bombChance >= 50;
        const chanceCost = getBombChanceUpgradeCost();
        const canAffordChance = PlayerData.currency >= chanceCost && !atMaxChance;

        this.bombChanceText.setText(`${PlayerData.bombChance}%`);
        this.bombChanceCostText.setText(atMaxChance ? 'MAX' : `${chanceCost}💰`);
        this.bombChanceCostText.setColor(atMaxChance ? '#55efc4' : '#f1c40f');
        this.updateButtonState(this.bombChanceBtn, this.bombChanceBtnHit, canAffordChance, 370, this.bombChanceText.y);

        // Bomb radius
        const atMaxRadius = PlayerData.bombRadius >= 3;
        const radiusCost = getBombRadiusUpgradeCost();
        const canAffordRadius = PlayerData.currency >= radiusCost && !atMaxRadius;

        this.bombRadiusText.setText(`${PlayerData.bombRadius}`);
        this.bombRadiusCostText.setText(atMaxRadius ? 'MAX' : `${radiusCost}💰`);
        this.bombRadiusCostText.setColor(atMaxRadius ? '#55efc4' : '#f1c40f');
        this.updateButtonState(this.bombRadiusBtn, this.bombRadiusBtnHit, canAffordRadius, 370, this.bombRadiusText.y);

        // Color upgrades
        for (const item of this.upgradeItems) {
            const multiplier = PlayerData.colorMultipliers[item.colorIndex] || 1;
            const cost = getUpgradeCost(item.colorIndex);
            const canAfford = PlayerData.currency >= cost;

            item.multText.setText(`x${multiplier}`);
            item.costText.setText(`${cost}💰`);
            this.updateButtonState(item.btn, item.hitArea, canAfford, 370, item.multText.y);
        }
    }

    updateButtonState(btn, hitArea, canAfford, x, y) {
        const color = canAfford ? 0x27ae60 : 0x555555;
        btn.clear().fillStyle(color, 1).fillRoundedRect(x - 38, y - 16, 76, 32, 8);
        hitArea.setInteractive({ useHandCursor: canAfford });
    }
}
