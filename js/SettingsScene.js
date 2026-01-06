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
        const panelWidth = this.cameras.main.width - 30;
        const panelHeight = this.cameras.main.height - 40;

        // Dark overlay
        this.add.rectangle(cx, cy, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.9);

        // Main panel
        const panel = this.add.graphics();
        panel.fillStyle(0x1a1a2e, 1);
        panel.fillRoundedRect(15, 20, panelWidth, panelHeight, 16);
        panel.lineStyle(3, 0xe94560, 1);
        panel.strokeRoundedRect(15, 20, panelWidth, panelHeight, 16);

        // Title bar
        const titleBar = this.add.graphics();
        titleBar.fillStyle(0xe94560, 0.4);
        titleBar.fillRoundedRect(15, 20, panelWidth, 55, { tl: 16, tr: 16, bl: 0, br: 0 });

        this.add.text(cx, 48, 'НАСТРОЙКИ', {
            fontSize: '26px', fontFamily: 'Arial Black', color: '#ffffff'
        }).setOrigin(0.5).setShadow(2, 2, '#000000', 3);

        // Content area
        let yPos = 90;
        const rowHeight = 85;

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
        yPos += rowHeight + 10;

        // Buttons
        this.createButtons(yPos);
    }

    createSectionHeader(title, y) {
        this.add.text(30, y + 10, title.toUpperCase(), {
            fontSize: '14px', color: '#e94560', fontStyle: 'bold'
        });
        this.add.graphics().lineStyle(1, 0x444444).lineBetween(30, y + 30, this.cameras.main.width - 30, y + 30);
        return y + 40;
    }

    createSlider(label, y, min, max, currentValue, onChange, step = 1, isDecimal = false) {
        const cx = this.cameras.main.width / 2;
        const barWidth = 100;

        // Label on top, centered
        this.add.text(cx, y, label, {
            fontSize: '18px', color: '#ffffff'
        }).setOrigin(0.5);

        // Controls row below label
        const controlY = y + 35;

        // Minus button on left
        const minusBtnGraphics = this.add.graphics();
        this.drawRoundedButton(minusBtnGraphics, 50, controlY, 44, 44, 0x555555);

        // Value display
        const formatValue = (val) => isDecimal ? val.toFixed(1) : val.toString();
        const valueText = this.add.text(cx, controlY, formatValue(currentValue), {
            fontSize: '24px', color: '#55efc4', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Plus button on right
        const plusBtnGraphics = this.add.graphics();
        this.drawRoundedButton(plusBtnGraphics, this.cameras.main.width - 50, controlY, 44, 44, 0x555555);

        // Progress bar at bottom
        const barY = controlY + 30;
        const barBg = this.add.graphics();
        barBg.fillStyle(0x444444, 1);
        barBg.fillRoundedRect(cx - barWidth / 2, barY, barWidth, 10, 5);

        const progressBar = this.add.graphics();
        const updateBar = (val) => {
            const progress = (val - min) / (max - min);
            const fillWidth = Math.max(10, barWidth * progress);
            progressBar.clear();
            progressBar.fillStyle(0xe94560, 1);
            progressBar.fillRoundedRect(cx - barWidth / 2, barY, fillWidth, 10, 5);
        };
        updateBar(currentValue);

        // Minus button interactivity
        this.add.rectangle(50, controlY, 44, 44, 0x000000, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => this.drawRoundedButton(minusBtnGraphics, 50, controlY, 44, 44, 0x666666))
            .on('pointerout', () => this.drawRoundedButton(minusBtnGraphics, 50, controlY, 44, 44, 0x555555))
            .on('pointerdown', () => {
                let val = parseFloat(valueText.text) - step;
                val = Math.round(val * 10) / 10;
                if (val >= min - 0.001) {
                    valueText.setText(formatValue(val));
                    onChange(val);
                    updateBar(val);
                }
            });

        this.add.text(50, controlY, '−', {
            fontSize: '28px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Plus button interactivity
        this.add.rectangle(this.cameras.main.width - 50, controlY, 44, 44, 0x000000, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => this.drawRoundedButton(plusBtnGraphics, this.cameras.main.width - 50, controlY, 44, 44, 0x666666))
            .on('pointerout', () => this.drawRoundedButton(plusBtnGraphics, this.cameras.main.width - 50, controlY, 44, 44, 0x555555))
            .on('pointerdown', () => {
                let val = parseFloat(valueText.text) + step;
                val = Math.round(val * 10) / 10;
                if (val <= max + 0.001) {
                    valueText.setText(formatValue(val));
                    onChange(val);
                    updateBar(val);
                }
            });

        this.add.text(this.cameras.main.width - 50, controlY, '+', {
            fontSize: '28px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    drawRoundedButton(graphics, x, y, width, height, color) {
        graphics.clear();
        graphics.fillStyle(color, 1);
        graphics.fillRoundedRect(x - width / 2, y - height / 2, width, height, 10);
    }

    createButtons(startY) {
        const cx = this.cameras.main.width / 2;
        const btnWidth = 180;
        const btnHeight = 48;
        const btnSpacing = 58;

        // Apply button
        const applyBtnGraphics = this.add.graphics();
        applyBtnGraphics.fillStyle(0x27ae60, 1);
        applyBtnGraphics.fillRoundedRect(cx - btnWidth / 2, startY - btnHeight / 2, btnWidth, btnHeight, 12);

        this.add.rectangle(cx, startY, btnWidth, btnHeight, 0x000000, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                applyBtnGraphics.clear().fillStyle(0x2ecc71, 1).fillRoundedRect(cx - btnWidth / 2, startY - btnHeight / 2, btnWidth, btnHeight, 12);
            })
            .on('pointerout', () => {
                applyBtnGraphics.clear().fillStyle(0x27ae60, 1).fillRoundedRect(cx - btnWidth / 2, startY - btnHeight / 2, btnWidth, btnHeight, 12);
            })
            .on('pointerdown', () => this.applySettings());

        this.add.text(cx, startY, '✓ ПРИМЕНИТЬ', {
            fontSize: '18px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Cancel button
        const cancelY = startY + btnSpacing;
        const cancelBtnGraphics = this.add.graphics();
        cancelBtnGraphics.fillStyle(0xe74c3c, 1);
        cancelBtnGraphics.fillRoundedRect(cx - btnWidth / 2, cancelY - btnHeight / 2, btnWidth, btnHeight, 12);

        this.add.rectangle(cx, cancelY, btnWidth, btnHeight, 0x000000, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                cancelBtnGraphics.clear().fillStyle(0xc0392b, 1).fillRoundedRect(cx - btnWidth / 2, cancelY - btnHeight / 2, btnWidth, btnHeight, 12);
            })
            .on('pointerout', () => {
                cancelBtnGraphics.clear().fillStyle(0xe74c3c, 1).fillRoundedRect(cx - btnWidth / 2, cancelY - btnHeight / 2, btnWidth, btnHeight, 12);
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
            fontSize: '18px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Reset progress button
        const resetY = cancelY + btnSpacing + 10;
        this.resetConfirm = false;

        const resetBtnGraphics = this.add.graphics();
        resetBtnGraphics.fillStyle(0x7f8c8d, 1);
        resetBtnGraphics.fillRoundedRect(cx - btnWidth / 2, resetY - btnHeight / 2, btnWidth, btnHeight, 12);

        const resetText = this.add.text(cx, resetY, '🗑️ СБРОС', {
            fontSize: '16px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.rectangle(cx, resetY, btnWidth, btnHeight, 0x000000, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                const color = this.resetConfirm ? 0xc0392b : 0x95a5a6;
                resetBtnGraphics.clear().fillStyle(color, 1).fillRoundedRect(cx - btnWidth / 2, resetY - btnHeight / 2, btnWidth, btnHeight, 12);
            })
            .on('pointerout', () => {
                const color = this.resetConfirm ? 0xc0392b : 0x7f8c8d;
                resetBtnGraphics.clear().fillStyle(color, 1).fillRoundedRect(cx - btnWidth / 2, resetY - btnHeight / 2, btnWidth, btnHeight, 12);
            })
            .on('pointerdown', () => {
                if (this.resetConfirm) {
                    resetPlayerData();
                    this.scene.stop();
                    this.scene.stop('MainScene');
                    this.scene.start('MainScene');
                } else {
                    this.resetConfirm = true;
                    resetBtnGraphics.clear().fillStyle(0xc0392b, 1).fillRoundedRect(cx - btnWidth / 2, resetY - btnHeight / 2, btnWidth, btnHeight, 12);
                    resetText.setText('⚠️ ПОДТВЕРДИТЬ?');
                    this.time.delayedCall(3000, () => {
                        if (this.resetConfirm) {
                            this.resetConfirm = false;
                            resetBtnGraphics.clear().fillStyle(0x7f8c8d, 1).fillRoundedRect(cx - btnWidth / 2, resetY - btnHeight / 2, btnWidth, btnHeight, 12);
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
