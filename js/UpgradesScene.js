import {
    PlayerData,
    formatNumber,
    getAutoMoveUpgradeCost,
    getAutoMoveStep,
    upgradeAutoMove,
    getBombChanceUpgradeCost,
    upgradeBombChance,
    getBombRadiusUpgradeCost,
    upgradeBombRadius,
    getBronzeUpgradeCost,
    upgradeBronze,
    getSilverUpgradeCost,
    upgradeSilver,
    getGoldUpgradeCost,
    upgradeGold,
    getCrystalUpgradeCost,
    upgradeCrystal,
    getRainbowUpgradeCost,
    upgradeRainbow,
    getPrismaticUpgradeCost,
    upgradePrismatic,
    getCelestialUpgradeCost,
    upgradeCelestial,
    isTierUnlocked,
    ENHANCEMENT
} from './config.js';

export class UpgradesScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UpgradesScene' });
    }

    create() {
        const W = this.cameras.main.width;
        const H = this.cameras.main.height;
        const cx = W / 2;

        // Panel bounds
        const panelTop = 20;
        const panelBottom = H - 90;
        const panelHeight = panelBottom - panelTop;

        // Scroll area bounds
        this.scrollTop = 150;
        this.scrollBottom = panelBottom - 15;
        this.scrollHeight = this.scrollBottom - this.scrollTop;

        // Track last currency for live updates
        this.lastCurrency = PlayerData.currency;

        // Dark overlay
        this.add.rectangle(cx, H / 2, W, H, 0x000000, 0.85);

        // Panel background
        const panel = this.add.graphics();
        panel.fillStyle(0x1e1e2e, 1);
        panel.fillRoundedRect(15, panelTop, W - 30, panelHeight, 16);
        panel.lineStyle(3, 0x9b59b6, 1);
        panel.strokeRoundedRect(15, panelTop, W - 30, panelHeight, 16);

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
        this.currencyText = this.add.text(cx + 10, 110, formatNumber(PlayerData.currency), {
            fontSize: '28px', color: '#f1c40f', fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        // Create scrollable container
        this.scrollContainer = this.add.container(0, 0);

        // Create mask for scroll area
        const maskShape = this.make.graphics();
        maskShape.fillRect(20, this.scrollTop, W - 40, this.scrollHeight);
        const mask = maskShape.createGeometryMask();
        this.scrollContainer.setMask(mask);

        // Build upgrade grid inside container
        this.contentHeight = this.createUpgradeGrid();
        this.scrollY = 0;
        this.maxScroll = Math.max(0, this.contentHeight - this.scrollHeight);

        // Setup scroll input
        this.setupScrollInput();

        // Close button
        this.createCloseButton();

        // Scroll indicator
        this.createScrollIndicator();
    }

    update() {
        if (PlayerData.currency !== this.lastCurrency) {
            this.lastCurrency = PlayerData.currency;
            this.currencyText.setText(formatNumber(PlayerData.currency));
            this.refreshAllButtons();
        }
    }

    createUpgradeGrid() {
        const W = this.cameras.main.width;
        let y = this.scrollTop;

        this.upgradeButtons = [];

        // Grid settings
        const padding = 25;
        const gap = 8;
        const cols = 3;
        const btnWidth = Math.floor((W - padding * 2 - gap * (cols - 1)) / cols);
        const btnHeight = 70;

        // Collect all upgrades
        const upgrades = [];

        // Auto-move: 5000ms -> 100ms, step varies (500ms until 500ms, then 100ms)
        // Levels: 0-9 (500ms steps) + 0-4 (100ms steps) = ~13 max
        upgrades.push({
            name: 'Авто-ход',
            getValue: () => {
                const seconds = (PlayerData.autoMoveDelay / 1000).toFixed(1);
                return `${seconds}с`;
            },
            getLevel: () => {
                const current = Math.round((5000 - PlayerData.autoMoveDelay) / 100);
                return `${current}/49`;
            },
            getCost: () => {
                const atMin = PlayerData.autoMoveDelay <= 100;
                return atMin ? null : getAutoMoveUpgradeCost();
            },
            canAfford: () => {
                const atMin = PlayerData.autoMoveDelay <= 100;
                return !atMin && PlayerData.currency >= getAutoMoveUpgradeCost();
            },
            onBuy: () => upgradeAutoMove()
        });

        // Bomb chance: 10% -> 50%, +5% per level = 8 levels
        upgrades.push({
            name: 'Шанс бомбы',
            getValue: () => `${PlayerData.bombChance}%`,
            getLevel: () => {
                const current = (PlayerData.bombChance - 10) / 5;
                return `${current}/8`;
            },
            getCost: () => {
                const atMax = PlayerData.bombChance >= 50;
                return atMax ? null : getBombChanceUpgradeCost();
            },
            canAfford: () => {
                const atMax = PlayerData.bombChance >= 50;
                return !atMax && PlayerData.currency >= getBombChanceUpgradeCost();
            },
            onBuy: () => upgradeBombChance()
        });

        // Bomb radius: 1 -> 3 = 2 levels
        upgrades.push({
            name: 'Радиус',
            getValue: () => `${PlayerData.bombRadius}`,
            getLevel: () => {
                const current = PlayerData.bombRadius - 1;
                return `${current}/2`;
            },
            getCost: () => {
                const atMax = PlayerData.bombRadius >= 3;
                return atMax ? null : getBombRadiusUpgradeCost();
            },
            canAfford: () => {
                const atMax = PlayerData.bombRadius >= 3;
                return !atMax && PlayerData.currency >= getBombRadiusUpgradeCost();
            },
            onBuy: () => upgradeBombRadius()
        });

        // Bronze: 5% -> 100%, +5% = 19 levels
        if (isTierUnlocked(ENHANCEMENT.BRONZE)) {
            upgrades.push({
                name: 'Бронза',
                getValue: () => `${PlayerData.bronzeChance}%`,
                getLevel: () => {
                    const current = (PlayerData.bronzeChance - 5) / 5;
                    return `${current}/19`;
                },
                getCost: () => PlayerData.bronzeChance >= 100 ? null : getBronzeUpgradeCost(),
                canAfford: () => PlayerData.bronzeChance < 100 && PlayerData.currency >= getBronzeUpgradeCost(),
                onBuy: () => upgradeBronze()
            });
        }

        // Silver: 0% -> 100%, +4% = 25 levels
        if (isTierUnlocked(ENHANCEMENT.SILVER)) {
            upgrades.push({
                name: 'Серебро',
                getValue: () => `${PlayerData.silverChance}%`,
                getLevel: () => {
                    const current = Math.floor(PlayerData.silverChance / 4);
                    return `${current}/25`;
                },
                getCost: () => PlayerData.silverChance >= 100 ? null : getSilverUpgradeCost(),
                canAfford: () => PlayerData.silverChance < 100 && PlayerData.currency >= getSilverUpgradeCost(),
                onBuy: () => upgradeSilver()
            });
        }

        // Gold: 0% -> 100%, +3% = 34 levels
        if (isTierUnlocked(ENHANCEMENT.GOLD)) {
            upgrades.push({
                name: 'Золото',
                getValue: () => `${PlayerData.goldChance}%`,
                getLevel: () => {
                    const current = Math.floor(PlayerData.goldChance / 3);
                    return `${current}/34`;
                },
                getCost: () => PlayerData.goldChance >= 100 ? null : getGoldUpgradeCost(),
                canAfford: () => PlayerData.goldChance < 100 && PlayerData.currency >= getGoldUpgradeCost(),
                onBuy: () => upgradeGold()
            });
        }

        // Crystal: 0% -> 100%, +2% = 50 levels
        if (isTierUnlocked(ENHANCEMENT.CRYSTAL)) {
            upgrades.push({
                name: 'Кристалл',
                getValue: () => `${PlayerData.crystalChance}%`,
                getLevel: () => {
                    const current = Math.floor(PlayerData.crystalChance / 2);
                    return `${current}/50`;
                },
                getCost: () => PlayerData.crystalChance >= 100 ? null : getCrystalUpgradeCost(),
                canAfford: () => PlayerData.crystalChance < 100 && PlayerData.currency >= getCrystalUpgradeCost(),
                onBuy: () => upgradeCrystal()
            });
        }

        // Rainbow: 0% -> 100%, +1% = 100 levels
        if (isTierUnlocked(ENHANCEMENT.RAINBOW)) {
            upgrades.push({
                name: 'Радуга',
                getValue: () => `${PlayerData.rainbowChance}%`,
                getLevel: () => `${PlayerData.rainbowChance}/100`,
                getCost: () => PlayerData.rainbowChance >= 100 ? null : getRainbowUpgradeCost(),
                canAfford: () => PlayerData.rainbowChance < 100 && PlayerData.currency >= getRainbowUpgradeCost(),
                onBuy: () => upgradeRainbow()
            });
        }

        // Prismatic: 0% -> 100%, +1% = 100 levels
        if (isTierUnlocked(ENHANCEMENT.PRISMATIC)) {
            upgrades.push({
                name: 'Призма',
                getValue: () => `${PlayerData.prismaticChance}%`,
                getLevel: () => `${PlayerData.prismaticChance}/100`,
                getCost: () => PlayerData.prismaticChance >= 100 ? null : getPrismaticUpgradeCost(),
                canAfford: () => PlayerData.prismaticChance < 100 && PlayerData.currency >= getPrismaticUpgradeCost(),
                onBuy: () => upgradePrismatic()
            });
        }

        // Celestial: 0% -> 100%, +1% = 100 levels
        if (isTierUnlocked(ENHANCEMENT.CELESTIAL)) {
            upgrades.push({
                name: 'Небесный',
                getValue: () => `${PlayerData.celestialChance}%`,
                getLevel: () => `${PlayerData.celestialChance}/100`,
                getCost: () => PlayerData.celestialChance >= 100 ? null : getCelestialUpgradeCost(),
                canAfford: () => PlayerData.celestialChance < 100 && PlayerData.currency >= getCelestialUpgradeCost(),
                onBuy: () => upgradeCelestial()
            });
        }

        // Create grid of buttons
        for (let i = 0; i < upgrades.length; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = padding + col * (btnWidth + gap);
            const btnY = y + row * (btnHeight + gap);

            this.createUpgradeButton(x, btnY, btnWidth, btnHeight, upgrades[i]);
        }

        const rows = Math.ceil(upgrades.length / cols);
        return rows * (btnHeight + gap) + 20;
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
        this.scrollContainer.add(btn);

        // Name
        const nameText = this.add.text(x + width / 2, y + 12, name, {
            fontSize: '12px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.scrollContainer.add(nameText);

        // Level indicator
        const levelText = this.add.text(x + width / 2, y + 26, getLevel(), {
            fontSize: '10px', color: '#d0d0d0'
        }).setOrigin(0.5);
        this.scrollContainer.add(levelText);

        // Value
        const valueText = this.add.text(x + width / 2, y + 43, getValue(), {
            fontSize: '15px', color: '#55efc4', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.scrollContainer.add(valueText);

        // Cost
        const costStr = isMaxed ? 'MAX' : formatNumber(cost) + '💰';
        const costText = this.add.text(x + width / 2, y + 59, costStr, {
            fontSize: '11px', color: isMaxed ? '#999999' : (affordable ? '#f1c40f' : '#cc9900')
        }).setOrigin(0.5);
        this.scrollContainer.add(costText);

        // Hit area
        const hitArea = this.add.rectangle(x + width / 2, y + height / 2, width, height, 0x000000, 0)
            .setInteractive({ useHandCursor: !isMaxed && affordable })
            .on('pointerover', () => {
                if (!isMaxed) {
                    const hoverColor = canAfford() ? 0x2ecc71 : 0x3a3a4e;
                    btn.clear();
                    btn.fillStyle(hoverColor, 1);
                    btn.fillRoundedRect(x, y, width, height, 8);
                    btn.lineStyle(2, canAfford() ? 0x55efc4 : 0x555555, 1);
                    btn.strokeRoundedRect(x, y, width, height, 8);
                }
            })
            .on('pointerout', () => {
                this.redrawButton(btn, x, y, width, height, getCost, canAfford);
            })
            .on('pointerdown', () => {
                if (canAfford() && onBuy()) {
                    this.currencyText.setText(formatNumber(PlayerData.currency));
                    this.refreshAllButtons();
                }
            });
        this.scrollContainer.add(hitArea);

        this.upgradeButtons.push({
            btn, valueText, levelText, costText, hitArea,
            x, y, width, height,
            getValue, getLevel, getCost, canAfford
        });
    }

    redrawButton(btn, x, y, width, height, getCost, canAfford) {
        const cost = getCost();
        const isMaxed = cost === null;
        const affordable = !isMaxed && canAfford();
        const bgColor = isMaxed ? 0x444444 : (affordable ? 0x27ae60 : 0x2a2a3e);
        btn.clear();
        btn.fillStyle(bgColor, 1);
        btn.fillRoundedRect(x, y, width, height, 8);
        if (!isMaxed) {
            btn.lineStyle(2, affordable ? 0x55efc4 : 0x555555, 1);
            btn.strokeRoundedRect(x, y, width, height, 8);
        }
    }

    setupScrollInput() {
        this.isDragging = false;
        this.lastPointerY = 0;

        this.input.on('pointerdown', (pointer) => {
            this.isDragging = true;
            this.lastPointerY = pointer.y;
        });

        this.input.on('pointermove', (pointer) => {
            if (this.isDragging && pointer.isDown && this.maxScroll > 0) {
                const dy = this.lastPointerY - pointer.y;
                this.lastPointerY = pointer.y;
                this.scrollBy(dy);
            }
        });

        this.input.on('pointerup', () => {
            this.isDragging = false;
        });

        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            this.scrollBy(deltaY * 0.5);
        });
    }

    scrollBy(delta) {
        this.scrollY = Phaser.Math.Clamp(this.scrollY + delta, 0, this.maxScroll);
        this.scrollContainer.y = -this.scrollY;
        this.updateScrollIndicator();
    }

    createScrollIndicator() {
        if (this.maxScroll <= 0) return;

        const W = this.cameras.main.width;
        const trackX = W - 25;
        const trackTop = this.scrollTop + 5;
        const trackHeight = this.scrollHeight - 10;

        this.scrollTrack = this.add.graphics();
        this.scrollTrack.fillStyle(0x333333, 0.5);
        this.scrollTrack.fillRoundedRect(trackX - 3, trackTop, 6, trackHeight, 3);

        const thumbHeight = Math.max(30, (this.scrollHeight / this.contentHeight) * trackHeight);
        this.scrollThumb = this.add.graphics();
        this.scrollThumbHeight = thumbHeight;
        this.scrollTrackTop = trackTop;
        this.scrollTrackHeight = trackHeight;
        this.scrollTrackX = trackX;

        this.updateScrollIndicator();
    }

    updateScrollIndicator() {
        if (!this.scrollThumb || this.maxScroll <= 0) return;

        const progress = this.scrollY / this.maxScroll;
        const thumbY = this.scrollTrackTop + progress * (this.scrollTrackHeight - this.scrollThumbHeight);

        this.scrollThumb.clear();
        this.scrollThumb.fillStyle(0x9b59b6, 0.8);
        this.scrollThumb.fillRoundedRect(this.scrollTrackX - 3, thumbY, 6, this.scrollThumbHeight, 3);
    }

    refreshAllButtons() {
        for (const b of this.upgradeButtons) {
            b.valueText.setText(b.getValue());
            b.levelText.setText(b.getLevel());
            const cost = b.getCost();
            const isMaxed = cost === null;
            const affordable = !isMaxed && b.canAfford();
            b.costText.setText(isMaxed ? 'MAX' : formatNumber(cost) + '💰');
            b.costText.setColor(isMaxed ? '#999999' : (affordable ? '#f1c40f' : '#cc9900'));
            b.hitArea.setInteractive({ useHandCursor: affordable });
            this.redrawButton(b.btn, b.x, b.y, b.width, b.height, b.getCost, b.canAfford);
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
