import { GameSettings, resetPlayerData } from './config.js';

export class SettingsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SettingsScene' });
    }

    create() {
        // Pause MainScene while settings are open
        this.scene.pause('MainScene');

        // Store original values for cancel
        this.originalSettings = {
            boardSize: GameSettings.boardSize,
            colorCount: GameSettings.colorCount,
            fallSpeed: GameSettings.fallSpeed,
            priceMultiplier: GameSettings.priceMultiplier
        };

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
        panel.lineStyle(3, 0xe94560, 1);
        panel.strokeRoundedRect(20, 30, panelWidth, panelHeight, 20);

        // Title bar
        const titleBar = this.add.graphics();
        titleBar.fillStyle(0xe94560, 0.3);
        titleBar.fillRoundedRect(20, 30, panelWidth, 50, { tl: 20, tr: 20, bl: 0, br: 0 });

        this.add.text(cx, 55, 'НАСТРОЙКИ', {
            fontSize: '22px', fontFamily: 'Arial Black', color: '#ffffff'
        }).setOrigin(0.5).setShadow(1, 1, '#000000', 2);

        // Content area
        let yPos = 100;
        const rowHeight = 75;

        // Section: Game settings
        yPos = this.createSectionHeader('Игра', yPos);

        // Board size
        this.createSlider('Размер поля', yPos, 4, 12, GameSettings.boardSize, val => {
            GameSettings.boardSize = val;
        });
        yPos += rowHeight;

        // Color count
        this.createSlider('Количество цветов', yPos, 3, 20, GameSettings.colorCount, val => {
            GameSettings.colorCount = val;
        });
        yPos += rowHeight;

        // Section: Gameplay
        yPos = this.createSectionHeader('Геймплей', yPos);

        // Fall speed
        this.createSlider('Скорость падения', yPos, 1, 20, GameSettings.fallSpeed, val => {
            GameSettings.fallSpeed = val;
        }, 1);
        yPos += rowHeight;

        // Price multiplier
        this.createSlider('Множитель цен', yPos, 0.1, 1, GameSettings.priceMultiplier, val => {
            GameSettings.priceMultiplier = val;
        }, 0.1, true);
        yPos += rowHeight + 20;

        // Buttons
        this.createButtons(yPos);
    }

    createSectionHeader(title, y) {
        this.add.text(35, y + 8, title.toUpperCase(), {
            fontSize: '11px', color: '#888888', fontStyle: 'bold'
        });
        this.add.graphics().lineStyle(1, 0x333333).lineBetween(35, y + 24, this.cameras.main.width - 35, y + 24);
        return y + 32;
    }

    createSlider(label, y, min, max, currentValue, onChange, step = 1, isDecimal = false) {
        const cx = this.cameras.main.width / 2;
        const barWidth = 100;

        // Label
        this.add.text(45, y + 5, label, {
            fontSize: '14px', color: '#cccccc'
        }).setOrigin(0, 0.5);

        // Value display
        const formatValue = (val) => isDecimal ? val.toFixed(1) : val.toString();
        const valueText = this.add.text(cx + 90, y + 5, formatValue(currentValue), {
            fontSize: '18px', color: '#55efc4', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Progress bar background
        const barBg = this.add.graphics();
        barBg.fillStyle(0x333333, 1);
        barBg.fillRoundedRect(cx - 70, y + 25, barWidth, 10, 5);

        // Progress bar fill
        const progressBar = this.add.graphics();
        const updateBar = (val) => {
            const progress = (val - min) / (max - min);
            const fillWidth = Math.max(10, barWidth * progress);
            progressBar.clear();
            progressBar.fillStyle(0xe94560, 1);
            progressBar.fillRoundedRect(cx - 70, y + 25, fillWidth, 10, 5);
        };
        updateBar(currentValue);

        // Minus button
        const minusBtnGraphics = this.add.graphics();
        this.drawRoundedButton(minusBtnGraphics, cx - 120, y + 15, 36, 36, 0x444444);

        const minusBtn = this.add.rectangle(cx - 120, y + 15, 36, 36, 0x000000, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => this.drawRoundedButton(minusBtnGraphics, cx - 120, y + 15, 36, 36, 0x555555))
            .on('pointerout', () => this.drawRoundedButton(minusBtnGraphics, cx - 120, y + 15, 36, 36, 0x444444))
            .on('pointerdown', () => {
                let val = parseFloat(valueText.text) - step;
                val = Math.round(val * 10) / 10;
                if (val >= min - 0.001) {
                    valueText.setText(formatValue(val));
                    onChange(val);
                    updateBar(val);
                }
            });

        this.add.text(cx - 120, y + 15, '−', {
            fontSize: '22px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Plus button
        const plusBtnGraphics = this.add.graphics();
        this.drawRoundedButton(plusBtnGraphics, cx + 40, y + 15, 36, 36, 0x444444);

        const plusBtn = this.add.rectangle(cx + 40, y + 15, 36, 36, 0x000000, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => this.drawRoundedButton(plusBtnGraphics, cx + 40, y + 15, 36, 36, 0x555555))
            .on('pointerout', () => this.drawRoundedButton(plusBtnGraphics, cx + 40, y + 15, 36, 36, 0x444444))
            .on('pointerdown', () => {
                let val = parseFloat(valueText.text) + step;
                val = Math.round(val * 10) / 10;
                if (val <= max + 0.001) {
                    valueText.setText(formatValue(val));
                    onChange(val);
                    updateBar(val);
                }
            });

        this.add.text(cx + 40, y + 15, '+', {
            fontSize: '22px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    drawRoundedButton(graphics, x, y, width, height, color) {
        graphics.clear();
        graphics.fillStyle(color, 1);
        graphics.fillRoundedRect(x - width / 2, y - height / 2, width, height, 8);
    }

    createButtons(startY) {
        const cx = this.cameras.main.width / 2;
        const btnWidth = 160;
        const btnHeight = 40;
        const btnSpacing = 50;

        // Apply button
        const applyBtnGraphics = this.add.graphics();
        applyBtnGraphics.fillStyle(0x27ae60, 1);
        applyBtnGraphics.fillRoundedRect(cx - btnWidth / 2, startY - btnHeight / 2, btnWidth, btnHeight, 10);

        this.add.rectangle(cx, startY, btnWidth, btnHeight, 0x000000, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                applyBtnGraphics.clear().fillStyle(0x2ecc71, 1).fillRoundedRect(cx - btnWidth / 2, startY - btnHeight / 2, btnWidth, btnHeight, 10);
            })
            .on('pointerout', () => {
                applyBtnGraphics.clear().fillStyle(0x27ae60, 1).fillRoundedRect(cx - btnWidth / 2, startY - btnHeight / 2, btnWidth, btnHeight, 10);
            })
            .on('pointerdown', () => this.applySettings());

        this.add.text(cx, startY, '✓ ПРИМЕНИТЬ', {
            fontSize: '14px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Cancel button
        const cancelY = startY + btnSpacing;
        const cancelBtnGraphics = this.add.graphics();
        cancelBtnGraphics.fillStyle(0xe74c3c, 1);
        cancelBtnGraphics.fillRoundedRect(cx - btnWidth / 2, cancelY - btnHeight / 2, btnWidth, btnHeight, 10);

        this.add.rectangle(cx, cancelY, btnWidth, btnHeight, 0x000000, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                cancelBtnGraphics.clear().fillStyle(0xc0392b, 1).fillRoundedRect(cx - btnWidth / 2, cancelY - btnHeight / 2, btnWidth, btnHeight, 10);
            })
            .on('pointerout', () => {
                cancelBtnGraphics.clear().fillStyle(0xe74c3c, 1).fillRoundedRect(cx - btnWidth / 2, cancelY - btnHeight / 2, btnWidth, btnHeight, 10);
            })
            .on('pointerdown', () => {
                GameSettings.boardSize = this.originalSettings.boardSize;
                GameSettings.colorCount = this.originalSettings.colorCount;
                GameSettings.fallSpeed = this.originalSettings.fallSpeed;
                GameSettings.priceMultiplier = this.originalSettings.priceMultiplier;
                this.scene.resume('MainScene');
                this.scene.stop();
            });

        this.add.text(cx, cancelY, '✕ ОТМЕНА', {
            fontSize: '14px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Reset progress button
        const resetY = cancelY + btnSpacing + 10;
        this.resetConfirm = false;

        const resetBtnGraphics = this.add.graphics();
        resetBtnGraphics.fillStyle(0x7f8c8d, 1);
        resetBtnGraphics.fillRoundedRect(cx - btnWidth / 2, resetY - btnHeight / 2, btnWidth, btnHeight, 10);

        const resetText = this.add.text(cx, resetY, '🗑️ СБРОС', {
            fontSize: '13px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.rectangle(cx, resetY, btnWidth, btnHeight, 0x000000, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                const color = this.resetConfirm ? 0xc0392b : 0x95a5a6;
                resetBtnGraphics.clear().fillStyle(color, 1).fillRoundedRect(cx - btnWidth / 2, resetY - btnHeight / 2, btnWidth, btnHeight, 10);
            })
            .on('pointerout', () => {
                const color = this.resetConfirm ? 0xc0392b : 0x7f8c8d;
                resetBtnGraphics.clear().fillStyle(color, 1).fillRoundedRect(cx - btnWidth / 2, resetY - btnHeight / 2, btnWidth, btnHeight, 10);
            })
            .on('pointerdown', () => {
                if (this.resetConfirm) {
                    resetPlayerData();
                    this.scene.stop();
                    this.scene.stop('MainScene');
                    this.scene.start('MainScene');
                } else {
                    this.resetConfirm = true;
                    resetBtnGraphics.clear().fillStyle(0xc0392b, 1).fillRoundedRect(cx - btnWidth / 2, resetY - btnHeight / 2, btnWidth, btnHeight, 10);
                    resetText.setText('⚠️ ПОДТВЕРДИТЬ?');
                    this.time.delayedCall(3000, () => {
                        if (this.resetConfirm) {
                            this.resetConfirm = false;
                            resetBtnGraphics.clear().fillStyle(0x7f8c8d, 1).fillRoundedRect(cx - btnWidth / 2, resetY - btnHeight / 2, btnWidth, btnHeight, 10);
                            resetText.setText('🗑️ СБРОС');
                        }
                    });
                }
            });
    }

    applySettings() {
        this.scene.stop();
        this.scene.stop('MainScene');
        this.scene.start('MainScene');
    }
}
