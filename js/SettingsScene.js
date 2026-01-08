// SettingsScene.js - Settings menu scene (redesigned)

import { GameSettings, resetPlayerData } from './config.js';
import { Button } from './ui/Button.js';
import { COLORS, FONT_SIZE, RADIUS } from './styles.js';

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
        const padding = 15;

        // Dark overlay
        this.add.rectangle(cx, H / 2, W, H, COLORS.bgOverlay, 0.92);

        // Main panel
        const panel = this.add.graphics();
        panel.fillStyle(COLORS.bgPanel, 1);
        panel.fillRoundedRect(padding, 15, W - padding * 2, H - 30, RADIUS['2xl']);
        panel.lineStyle(2, COLORS.danger, 0.8);
        panel.strokeRoundedRect(padding, 15, W - padding * 2, H - 30, RADIUS['2xl']);

        // === HEADER ===
        this.add.text(cx, 38, '⚙️ НАСТРОЙКИ', {
            fontSize: FONT_SIZE['3xl'],
            fontFamily: 'Arial Black',
            color: '#ffffff'
        }).setOrigin(0.5);

        // === SETTINGS ROWS ===
        const startY = 80;
        const rowHeight = 100;

        // Row 1: Fall speed
        this.createSettingRow(startY, W, cx, 'Скорость падения', 1, 20, GameSettings.fallSpeed, 1, false,
            val => { GameSettings.fallSpeed = val; });

        // Row 2: Price multiplier
        this.createSettingRow(startY + rowHeight, W, cx, 'Множитель цен', 0.1, 1, GameSettings.priceMultiplier, 0.1, true,
            val => { GameSettings.priceMultiplier = val; });

        // === BUTTONS ===
        this.createBottomButtons(W, H, cx, padding);
    }

    createSettingRow(y, W, cx, label, min, max, value, step, isDecimal, onChange) {
        // Row background card
        const rowBg = this.add.graphics();
        rowBg.fillStyle(0x2a2a3e, 1);
        rowBg.fillRoundedRect(25, y, W - 50, 90, RADIUS.lg);
        rowBg.lineStyle(2, COLORS.borderLight, 0.5);
        rowBg.strokeRoundedRect(25, y, W - 50, 90, RADIUS.lg);

        // Label
        this.add.text(cx, y + 22, label, {
            fontSize: FONT_SIZE.xl,
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Controls row
        const controlY = y + 60;
        const btnSize = 50;
        const spacing = 90;

        // Format function
        const format = (v) => isDecimal ? v.toFixed(1) : v.toString();

        // Value text (center) - bright green
        const valueText = this.add.text(cx, controlY, format(value), {
            fontSize: FONT_SIZE['4xl'],
            color: '#55efc4',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Minus button
        new Button(this, {
            x: cx - spacing, y: controlY, width: btnSize, height: btnSize,
            text: '−', style: 'default', fontSize: FONT_SIZE['4xl'],
            onClick: () => {
                let newVal = parseFloat(valueText.text) - step;
                newVal = Math.round(newVal * 10) / 10;
                if (newVal >= min - 0.001) {
                    valueText.setText(format(newVal));
                    onChange(newVal);
                }
            }
        });

        // Plus button
        new Button(this, {
            x: cx + spacing, y: controlY, width: btnSize, height: btnSize,
            text: '+', style: 'default', fontSize: FONT_SIZE['4xl'],
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

    createBottomButtons(W, H, cx, padding) {
        const btnWidth = W - padding * 2 - 20;
        const btnHeight = 52;

        // Apply button
        new Button(this, {
            x: cx, y: H - 225, width: btnWidth, height: btnHeight,
            text: '✓ ПРИМЕНИТЬ', style: 'success',
            radius: RADIUS.xl, fontSize: FONT_SIZE['2xl'],
            onClick: () => this.applySettings()
        });

        // Cancel button
        new Button(this, {
            x: cx, y: H - 165, width: btnWidth, height: btnHeight,
            text: '← ОТМЕНА', style: 'secondary',
            radius: RADIUS.xl, fontSize: FONT_SIZE['2xl'],
            onClick: () => this.cancelSettings()
        });

        // Reset button with confirmation
        this.resetConfirm = false;
        const resetBtn = new Button(this, {
            x: cx, y: H - 105, width: btnWidth, height: btnHeight,
            text: '🗑️ СБРОСИТЬ ПРОГРЕСС', style: 'default',
            radius: RADIUS.xl, fontSize: FONT_SIZE.xl,
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

        // Close button
        new Button(this, {
            x: cx, y: H - 45, width: btnWidth, height: btnHeight,
            text: '← НАЗАД', style: 'secondary',
            radius: RADIUS.xl, fontSize: FONT_SIZE['2xl'],
            onClick: () => this.cancelSettings()
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
