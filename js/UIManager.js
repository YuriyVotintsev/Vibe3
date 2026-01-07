// UIManager.js - Handles UI elements for MainScene
import {
    BOARD_TOTAL_SIZE,
    BOARD_OFFSET_Y,
    JS_VERSION,
    PlayerData,
    ENHANCEMENT
} from './config.js';

/**
 * Manages UI elements:
 * - Header with currency display
 * - Bottom buttons
 * - Messages and floating text
 */
export class UIManager {
    /**
     * @param {Phaser.Scene} scene - The scene to create UI in
     */
    constructor(scene) {
        this.scene = scene;
        this.currencyText = null;
        this.messageText = null;
    }

    /**
     * Create all UI elements
     */
    create() {
        const scene = this.scene;
        const cx = scene.cameras.main.width / 2;

        // Header panel background
        const headerBg = scene.add.graphics();
        headerBg.fillStyle(0x16213e, 0.95);
        headerBg.fillRoundedRect(10, 8, scene.cameras.main.width - 20, 100, 15);
        headerBg.lineStyle(2, 0x3498db, 0.5);
        headerBg.strokeRoundedRect(10, 8, scene.cameras.main.width - 20, 100, 15);

        // Title
        scene.add.text(cx, 35, 'MATCH-3', {
            fontSize: '32px',
            fontFamily: 'Arial Black',
            color: '#ffffff'
        }).setOrigin(0.5).setShadow(2, 2, '#000000', 4);

        // Currency stat card (centered)
        const statY = 80;
        const statWidth = 180;
        scene.add.graphics()
            .fillStyle(0xf39c12, 0.25)
            .fillRoundedRect(cx - statWidth / 2, statY - 22, statWidth, 44, 10);
        scene.add.text(cx - 50, statY, '💰', { fontSize: '28px' }).setOrigin(0.5);
        this.currencyText = scene.add.text(cx + 5, statY, `${PlayerData.currency}`, {
            fontSize: '26px', color: '#f1c40f', fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        // Message text
        this.messageText = scene.add.text(cx, BOARD_OFFSET_Y + BOARD_TOTAL_SIZE + 25, '', {
            fontSize: '18px',
            color: '#55efc4',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Bottom buttons
        this.createButtons();

        // Version text
        scene.add.text(10, scene.cameras.main.height - 10, JS_VERSION, {
            fontSize: '14px', color: '#888888', fontStyle: 'bold'
        }).setOrigin(0, 1);
    }

    /**
     * Create bottom panel buttons
     */
    createButtons() {
        const scene = this.scene;
        const cx = scene.cameras.main.width / 2;
        const btnY = BOARD_OFFSET_Y + BOARD_TOTAL_SIZE + 70;
        const btnWidth = 140;
        const btnHeight = 48;
        const btnSpacing = 80;

        const createButton = (x, color, hoverColor, label, callback) => {
            const bg = scene.add.graphics();
            bg.fillStyle(color, 1);
            bg.fillRoundedRect(x - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 12);

            scene.add.rectangle(x, btnY, btnWidth, btnHeight, 0x000000, 0)
                .setInteractive({ useHandCursor: true })
                .on('pointerover', () => {
                    bg.clear();
                    bg.fillStyle(hoverColor, 1);
                    bg.fillRoundedRect(x - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 12);
                })
                .on('pointerout', () => {
                    bg.clear();
                    bg.fillStyle(color, 1);
                    bg.fillRoundedRect(x - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 12);
                })
                .on('pointerdown', callback);

            scene.add.text(x, btnY, label, {
                fontSize: '18px', color: '#ffffff', fontStyle: 'bold'
            }).setOrigin(0.5);
        };

        createButton(cx - btnSpacing, 0x9b59b6, 0x8e44ad, '⬆️ Апгрейд', () => scene.scene.launch('UpgradesScene'));
        createButton(cx + btnSpacing, 0x3498db, 0x2980b9, '⚙️ Опции', () => scene.scene.launch('SettingsScene'));
    }

    /**
     * Update currency display
     */
    updateCurrency() {
        this.currencyText.setText(`${PlayerData.currency}`);
    }

    /**
     * Show a temporary message
     * @param {string} text - Message text
     */
    showMessage(text) {
        this.messageText.setText(text);
        this.messageText.setAlpha(1);

        this.scene.tweens.add({
            targets: this.messageText,
            alpha: 0,
            delay: 1000,
            duration: 500
        });
    }

    /**
     * Show floating currency text at position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} amount - Currency amount
     * @param {string} enhancement - Enhancement type
     */
    showFloatingCurrency(x, y, amount, enhancement = ENHANCEMENT.NONE) {
        // Color based on enhancement
        let color = '#ffffff';
        let fontSize = '14px';
        if (enhancement === ENHANCEMENT.BRONZE) {
            color = '#cd7f32';
            fontSize = '15px';
        } else if (enhancement === ENHANCEMENT.SILVER) {
            color = '#c0c0c0';
            fontSize = '16px';
        } else if (enhancement === ENHANCEMENT.GOLD) {
            color = '#ffd700';
            fontSize = '18px';
        } else if (enhancement === ENHANCEMENT.CRYSTAL) {
            color = '#88ffff';
            fontSize = '22px';
        } else if (enhancement === ENHANCEMENT.RAINBOW) {
            color = '#ff88ff';
            fontSize = '26px';
        } else if (enhancement === ENHANCEMENT.PRISMATIC) {
            color = '#ffff88';
            fontSize = '30px';
        } else if (enhancement === ENHANCEMENT.CELESTIAL) {
            color = '#aaddff';
            fontSize = '34px';
        }

        const text = this.scene.add.text(x, y, `+${amount}💰`, {
            fontSize: fontSize,
            color: color,
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(200);

        this.scene.tweens.add({
            targets: text,
            scale: { from: 1, to: 1.5 },
            duration: 1500,
            ease: 'Power2',
            onComplete: () => text.destroy()
        });
    }
}
