import { GameSettings, resetPlayerData } from './config.js';

export class SettingsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SettingsScene' });
    }

    create() {
        this.scene.pause('MainScene');

        // Store original values
        this.originalSettings = {
            boardSize: GameSettings.boardSize,
            colorCount: GameSettings.colorCount,
            fallSpeed: GameSettings.fallSpeed,
            priceMultiplier: GameSettings.priceMultiplier
        };

        const W = this.cameras.main.width;
        const H = this.cameras.main.height;
        const cx = W / 2;

        // Panel bounds (buttons are outside, below panel)
        const panelTop = 20;
        const panelBottom = H - 200;
        const panelHeight = panelBottom - panelTop;

        // Dark overlay (covers entire screen)
        this.add.rectangle(cx, H / 2, W, H, 0x000000, 0.85);

        // Panel (smaller, doesn't include buttons)
        const panel = this.add.graphics();
        panel.fillStyle(0x1e1e2e, 1);
        panel.fillRoundedRect(15, panelTop, W - 30, panelHeight, 16);
        panel.lineStyle(3, 0xe94560, 1);
        panel.strokeRoundedRect(15, panelTop, W - 30, panelHeight, 16);

        // Title
        this.add.text(cx, 55, 'НАСТРОЙКИ', {
            fontSize: '28px',
            fontFamily: 'Arial Black',
            color: '#ffffff'
        }).setOrigin(0.5).setShadow(2, 2, '#000000', 4);

        // Settings rows - fixed positions inside panel
        const ROW_HEIGHT = 90;
        const START_Y = 100;

        // Row 1: Board size
        this.createSettingRow(START_Y, 'Размер поля', 4, 12, GameSettings.boardSize, 1, false,
            val => { GameSettings.boardSize = val; });

        // Row 2: Color count
        this.createSettingRow(START_Y + ROW_HEIGHT, 'Кол-во цветов', 3, 20, GameSettings.colorCount, 1, false,
            val => { GameSettings.colorCount = val; });

        // Row 3: Fall speed
        this.createSettingRow(START_Y + ROW_HEIGHT * 2, 'Скорость', 1, 20, GameSettings.fallSpeed, 1, false,
            val => { GameSettings.fallSpeed = val; });

        // Row 4: Price multiplier
        this.createSettingRow(START_Y + ROW_HEIGHT * 3, 'Множитель цен', 0.1, 1, GameSettings.priceMultiplier, 0.1, true,
            val => { GameSettings.priceMultiplier = val; });

        // Buttons outside panel (on overlay)
        this.createBottomButtons();
    }

    createSettingRow(y, label, min, max, value, step, isDecimal, onChange) {
        const W = this.cameras.main.width;
        const cx = W / 2;

        // Row background
        const rowBg = this.add.graphics();
        rowBg.fillStyle(0x2a2a3e, 0.5);
        rowBg.fillRoundedRect(25, y - 5, W - 50, 80, 10);

        // Label at top
        this.add.text(cx, y + 12, label, {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Controls row
        const controlY = y + 50;
        const btnSize = 50;
        const spacing = 100;

        // Format function
        const format = (v) => isDecimal ? v.toFixed(1) : v.toString();

        // Value text (center)
        const valueText = this.add.text(cx, controlY, format(value), {
            fontSize: '28px',
            color: '#55efc4',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Minus button (left of center)
        this.createControlButton(cx - spacing, controlY, btnSize, '−', () => {
            let newVal = parseFloat(valueText.text) - step;
            newVal = Math.round(newVal * 10) / 10;
            if (newVal >= min - 0.001) {
                valueText.setText(format(newVal));
                onChange(newVal);
            }
        });

        // Plus button (right of center)
        this.createControlButton(cx + spacing, controlY, btnSize, '+', () => {
            let newVal = parseFloat(valueText.text) + step;
            newVal = Math.round(newVal * 10) / 10;
            if (newVal <= max + 0.001) {
                valueText.setText(format(newVal));
                onChange(newVal);
            }
        });
    }

    createControlButton(x, y, size, text, onClick) {
        const btn = this.add.graphics();
        btn.fillStyle(0x555555, 1);
        btn.fillRoundedRect(x - size / 2, y - size / 2, size, size, 12);

        this.add.rectangle(x, y, size, size, 0x000000, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                btn.clear();
                btn.fillStyle(0x777777, 1);
                btn.fillRoundedRect(x - size / 2, y - size / 2, size, size, 12);
            })
            .on('pointerout', () => {
                btn.clear();
                btn.fillStyle(0x555555, 1);
                btn.fillRoundedRect(x - size / 2, y - size / 2, size, size, 12);
            })
            .on('pointerdown', onClick);

        this.add.text(x, y, text, {
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    createBottomButtons() {
        const W = this.cameras.main.width;
        const H = this.cameras.main.height;
        const cx = W / 2;
        const btnWidth = W - 60;
        const btnHeight = 50;

        // Apply button (outside panel)
        const applyY = H - 170;
        this.createActionButton(cx, applyY, btnWidth, btnHeight, '✓ ПРИМЕНИТЬ', 0x27ae60, 0x2ecc71, () => {
            this.applySettings();
        });

        // Cancel button (outside panel)
        const cancelY = H - 110;
        this.createActionButton(cx, cancelY, btnWidth, btnHeight, '✕ ОТМЕНА', 0xe74c3c, 0xc0392b, () => {
            this.cancelSettings();
        });

        // Reset button (outside panel)
        const resetY = H - 50;
        this.resetConfirm = false;

        const resetBtn = this.add.graphics();
        resetBtn.fillStyle(0x666666, 1);
        resetBtn.fillRoundedRect(cx - btnWidth / 2, resetY - btnHeight / 2, btnWidth, btnHeight, 12);

        const resetText = this.add.text(cx, resetY, '🗑️ СБРОСИТЬ ПРОГРЕСС', {
            fontSize: '16px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.rectangle(cx, resetY, btnWidth, btnHeight, 0x000000, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                const color = this.resetConfirm ? 0xc0392b : 0x888888;
                resetBtn.clear().fillStyle(color, 1).fillRoundedRect(cx - btnWidth / 2, resetY - btnHeight / 2, btnWidth, btnHeight, 12);
            })
            .on('pointerout', () => {
                const color = this.resetConfirm ? 0xe74c3c : 0x666666;
                resetBtn.clear().fillStyle(color, 1).fillRoundedRect(cx - btnWidth / 2, resetY - btnHeight / 2, btnWidth, btnHeight, 12);
            })
            .on('pointerdown', () => {
                if (this.resetConfirm) {
                    resetPlayerData();
                    this.scene.stop();
                    this.scene.stop('MainScene');
                    this.scene.start('MainScene');
                } else {
                    this.resetConfirm = true;
                    resetBtn.clear().fillStyle(0xe74c3c, 1).fillRoundedRect(cx - btnWidth / 2, resetY - btnHeight / 2, btnWidth, btnHeight, 12);
                    resetText.setText('⚠️ НАЖМИТЕ ЕЩЁ РАЗ');
                    this.time.delayedCall(3000, () => {
                        if (this.resetConfirm) {
                            this.resetConfirm = false;
                            resetBtn.clear().fillStyle(0x666666, 1).fillRoundedRect(cx - btnWidth / 2, resetY - btnHeight / 2, btnWidth, btnHeight, 12);
                            resetText.setText('🗑️ СБРОСИТЬ ПРОГРЕСС');
                        }
                    });
                }
            });
    }

    createActionButton(x, y, width, height, text, color, hoverColor, onClick) {
        const btn = this.add.graphics();
        btn.fillStyle(color, 1);
        btn.fillRoundedRect(x - width / 2, y - height / 2, width, height, 12);

        this.add.rectangle(x, y, width, height, 0x000000, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                btn.clear().fillStyle(hoverColor, 1).fillRoundedRect(x - width / 2, y - height / 2, width, height, 12);
            })
            .on('pointerout', () => {
                btn.clear().fillStyle(color, 1).fillRoundedRect(x - width / 2, y - height / 2, width, height, 12);
            })
            .on('pointerdown', onClick);

        this.add.text(x, y, text, {
            fontSize: '18px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    applySettings() {
        this.scene.stop();
        this.scene.stop('MainScene');
        this.scene.start('MainScene');
    }

    cancelSettings() {
        GameSettings.boardSize = this.originalSettings.boardSize;
        GameSettings.colorCount = this.originalSettings.colorCount;
        GameSettings.fallSpeed = this.originalSettings.fallSpeed;
        GameSettings.priceMultiplier = this.originalSettings.priceMultiplier;
        this.scene.resume('MainScene');
        this.scene.stop();
    }
}
