import { GameSettings, resetPlayerData } from './config.js';
import { Button } from './ui/Button.js';
import { COLORS, FONT_SIZE, RADIUS, FONT_FAMILY } from './styles.js';

export class SettingsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SettingsScene' });
    }

    create() {
        this.scene.pause('MainScene');

        // Store original values
        this.originalSettings = {
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
        this.add.rectangle(cx, H / 2, W, H, COLORS.bgOverlay, 0.85);

        // Panel (smaller, doesn't include buttons)
        const panel = this.add.graphics();
        panel.fillStyle(COLORS.bgPanel, 1);
        panel.fillRoundedRect(15, panelTop, W - 30, panelHeight, RADIUS['2xl']);
        panel.lineStyle(3, COLORS.danger, 1);
        panel.strokeRoundedRect(15, panelTop, W - 30, panelHeight, RADIUS['2xl']);

        // Title
        this.add.text(cx, 55, 'НАСТРОЙКИ', {
            fontSize: FONT_SIZE['4xl'],
            fontFamily: FONT_FAMILY.bold,
            color: COLORS.text.white
        }).setOrigin(0.5).setShadow(2, 2, '#000000', 4);

        // Settings rows - fixed positions inside panel
        const ROW_HEIGHT = 90;
        const START_Y = 120;

        // Row 1: Fall speed
        this.createSettingRow(START_Y, 'Скорость', 1, 20, GameSettings.fallSpeed, 1, false,
            val => { GameSettings.fallSpeed = val; });

        // Row 2: Price multiplier
        this.createSettingRow(START_Y + ROW_HEIGHT, 'Множитель цен', 0.1, 1, GameSettings.priceMultiplier, 0.1, true,
            val => { GameSettings.priceMultiplier = val; });

        // Buttons outside panel (on overlay)
        this.createBottomButtons();
    }

    createSettingRow(y, label, min, max, value, step, isDecimal, onChange) {
        const W = this.cameras.main.width;
        const cx = W / 2;

        // Row background
        const rowBg = this.add.graphics();
        rowBg.fillStyle(COLORS.bgButton, 0.5);
        rowBg.fillRoundedRect(25, y - 5, W - 50, 80, RADIUS.lg);

        // Label at top
        this.add.text(cx, y + 12, label, {
            fontSize: FONT_SIZE.xl,
            color: COLORS.text.white,
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
            fontSize: FONT_SIZE['4xl'],
            color: COLORS.text.green,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Minus button (left of center)
        new Button(this, {
            x: cx - spacing, y: controlY, width: btnSize, height: btnSize,
            text: '−', style: 'default', fontSize: FONT_SIZE['5xl'],
            onClick: () => {
                let newVal = parseFloat(valueText.text) - step;
                newVal = Math.round(newVal * 10) / 10;
                if (newVal >= min - 0.001) {
                    valueText.setText(format(newVal));
                    onChange(newVal);
                }
            }
        });

        // Plus button (right of center)
        new Button(this, {
            x: cx + spacing, y: controlY, width: btnSize, height: btnSize,
            text: '+', style: 'default', fontSize: FONT_SIZE['5xl'],
            onClick: () => {
                let newVal = parseFloat(valueText.text) + step;
                newVal = Math.round(newVal * 10) / 10;
                if (newVal <= max + 0.001) {
                    valueText.setText(format(newVal));
                    onChange(newVal);
                }
            }
        });
    }

    createBottomButtons() {
        const W = this.cameras.main.width;
        const H = this.cameras.main.height;
        const cx = W / 2;
        const btnWidth = W - 60;
        const btnHeight = 50;

        // Apply button
        new Button(this, {
            x: cx, y: H - 170, width: btnWidth, height: btnHeight,
            text: '✓ ПРИМЕНИТЬ', style: 'success', fontSize: FONT_SIZE.xl,
            onClick: () => this.applySettings()
        });

        // Cancel button
        new Button(this, {
            x: cx, y: H - 110, width: btnWidth, height: btnHeight,
            text: '✕ ОТМЕНА', style: 'danger', fontSize: FONT_SIZE.xl,
            onClick: () => this.cancelSettings()
        });

        // Reset button with two-click confirmation
        this.resetConfirm = false;
        const resetBtn = new Button(this, {
            x: cx, y: H - 50, width: btnWidth, height: btnHeight,
            text: '🗑️ СБРОСИТЬ ПРОГРЕСС', style: 'default', fontSize: FONT_SIZE.lg,
            onClick: () => {
                if (this.resetConfirm) {
                    resetPlayerData();
                    this.scene.stop();
                    this.scene.stop('MainScene');
                    this.scene.start('MainScene');
                } else {
                    this.resetConfirm = true;
                    resetBtn.setStyle('danger');
                    resetBtn.setText('⚠️ НАЖМИТЕ ЕЩЁ РАЗ');
                    this.time.delayedCall(3000, () => {
                        if (this.resetConfirm) {
                            this.resetConfirm = false;
                            resetBtn.setStyle('default');
                            resetBtn.setText('🗑️ СБРОСИТЬ ПРОГРЕСС');
                        }
                    });
                }
            }
        });
    }

    applySettings() {
        this.scene.stop();
        this.scene.stop('MainScene');
        this.scene.start('MainScene');
    }

    cancelSettings() {
        GameSettings.fallSpeed = this.originalSettings.fallSpeed;
        GameSettings.priceMultiplier = this.originalSettings.priceMultiplier;
        this.scene.resume('MainScene');
        this.scene.stop();
    }
}
