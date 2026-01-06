import { GameSettings } from './config.js';

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

        // Darken background
        this.add.rectangle(cx, cy, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.85);

        // Title
        this.add.text(cx, 50, '⚙️ Настройки', { fontSize: '28px', color: '#e94560' }).setOrigin(0.5);

        let yPos = 130;
        const spacing = 80;

        // Board size
        this.createSlider('Размер поля', yPos, 4, 12, GameSettings.boardSize, val => {
            GameSettings.boardSize = val;
        });
        yPos += spacing;

        // Color count
        this.createSlider('Количество цветов', yPos, 3, 20, GameSettings.colorCount, val => {
            GameSettings.colorCount = val;
        });
        yPos += spacing;

        // Fall speed (cells per second)
        this.createSlider('Скорость (клеток/сек)', yPos, 1, 20, GameSettings.fallSpeed, val => {
            GameSettings.fallSpeed = val;
        }, 1);
        yPos += spacing;

        // Price multiplier
        this.createSlider('Множитель цен', yPos, 0.1, 1, GameSettings.priceMultiplier, val => {
            GameSettings.priceMultiplier = val;
        }, 0.1, true);
        yPos += spacing + 30;

        // Apply button
        const applyBtn = this.add.rectangle(cx, yPos, 200, 50, 0x27ae60)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => applyBtn.setFillStyle(0x2ecc71))
            .on('pointerout', () => applyBtn.setFillStyle(0x27ae60))
            .on('pointerdown', () => this.applySettings());

        this.add.text(cx, yPos, '✓ Применить', { fontSize: '18px', color: '#ffffff' }).setOrigin(0.5);

        // Cancel button
        const cancelBtn = this.add.rectangle(cx, yPos + 60, 200, 50, 0xe74c3c)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => cancelBtn.setFillStyle(0xc0392b))
            .on('pointerout', () => cancelBtn.setFillStyle(0xe74c3c))
            .on('pointerdown', () => {
                // Restore original settings
                GameSettings.boardSize = this.originalSettings.boardSize;
                GameSettings.colorCount = this.originalSettings.colorCount;
                GameSettings.fallSpeed = this.originalSettings.fallSpeed;
                GameSettings.priceMultiplier = this.originalSettings.priceMultiplier;
                this.scene.resume('MainScene');
                this.scene.stop();
            });

        this.add.text(cx, yPos + 60, '✕ Отмена', { fontSize: '18px', color: '#ffffff' }).setOrigin(0.5);
    }

    createSlider(label, y, min, max, currentValue, onChange, step = 1, isDecimal = false) {
        const cx = this.cameras.main.width / 2;
        const barWidth = 100;

        this.add.text(cx, y, label, { fontSize: '16px', color: '#aaaaaa' }).setOrigin(0.5);

        // Value display
        const formatValue = (val) => isDecimal ? val.toFixed(1) : val.toString();
        const valueText = this.add.text(cx + 130, y + 30, formatValue(currentValue), {
            fontSize: '20px', color: '#e94560', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Progress bar background
        this.add.rectangle(cx - 20, y + 30, barWidth, 8, 0x333333);

        // Progress bar fill (dynamic)
        const progressBar = this.add.rectangle(cx - 20, y + 30, barWidth, 8, 0xe94560);
        progressBar.setOrigin(0.5);

        const updateBar = (val) => {
            const progress = (val - min) / (max - min);
            progressBar.setScale(progress, 1);
        };
        updateBar(currentValue);

        // Minus button
        const minusBtn = this.add.rectangle(cx - 120, y + 30, 40, 40, 0x444444)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => minusBtn.setFillStyle(0x555555))
            .on('pointerout', () => minusBtn.setFillStyle(0x444444))
            .on('pointerdown', () => {
                let val = parseFloat(valueText.text) - step;
                val = Math.round(val * 10) / 10; // Fix floating point
                if (val >= min - 0.001) {
                    valueText.setText(formatValue(val));
                    onChange(val);
                    updateBar(val);
                }
            });
        this.add.text(cx - 120, y + 30, '−', { fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);

        // Plus button
        const plusBtn = this.add.rectangle(cx + 80, y + 30, 40, 40, 0x444444)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => plusBtn.setFillStyle(0x555555))
            .on('pointerout', () => plusBtn.setFillStyle(0x444444))
            .on('pointerdown', () => {
                let val = parseFloat(valueText.text) + step;
                val = Math.round(val * 10) / 10; // Fix floating point
                if (val <= max + 0.001) {
                    valueText.setText(formatValue(val));
                    onChange(val);
                    updateBar(val);
                }
            });
        this.add.text(cx + 80, y + 30, '+', { fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);
    }

    applySettings() {
        this.scene.stop();
        this.scene.stop('MainScene');
        this.scene.start('MainScene');
    }
}
