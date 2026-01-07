// UIManager.js - Handles UI elements for MainScene

import {
    BOARD_TOTAL_SIZE,
    BOARD_OFFSET_Y,
    JS_VERSION,
    PlayerData,
    ENHANCEMENT,
    getPrestigeCoinsFromCurrency,
    formatNumber
} from './config.js';
import { COLORS, FONT_SIZE, RADIUS, DURATION } from './styles.js';
import { Button } from './ui/Button.js';

// Enhancement color mapping for floating text
const ENHANCEMENT_TEXT_STYLES = {
    [ENHANCEMENT.NONE]: { color: COLORS.text.white, fontSize: FONT_SIZE.base },
    [ENHANCEMENT.BRONZE]: { color: COLORS.text.bronze, fontSize: FONT_SIZE.lg },
    [ENHANCEMENT.SILVER]: { color: COLORS.text.silver, fontSize: FONT_SIZE.lg },
    [ENHANCEMENT.GOLD]: { color: COLORS.text.goldGem, fontSize: FONT_SIZE.xl },
    [ENHANCEMENT.CRYSTAL]: { color: COLORS.text.crystal, fontSize: FONT_SIZE['2xl'] },
    [ENHANCEMENT.RAINBOW]: { color: COLORS.text.rainbow, fontSize: FONT_SIZE['3xl'] },
    [ENHANCEMENT.PRISMATIC]: { color: COLORS.text.prismatic, fontSize: FONT_SIZE['4xl'] },
    [ENHANCEMENT.CELESTIAL]: { color: COLORS.text.celestial, fontSize: FONT_SIZE['6xl'] }
};

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
        this.prestigeText = null;
    }

    /**
     * Create all UI elements
     */
    create() {
        const scene = this.scene;
        const cx = scene.cameras.main.width / 2;

        this.createHeader(cx);
        this.createMessageText(cx);
        this.createButtons(cx);
        this.createVersionText();
    }

    /**
     * Create header panel with currency
     */
    createHeader(cx) {
        const scene = this.scene;

        // Header panel background
        const headerBg = scene.add.graphics();
        headerBg.fillStyle(0x16213e, 0.95);
        headerBg.fillRoundedRect(10, 8, scene.cameras.main.width - 20, 100, 15);
        headerBg.lineStyle(2, COLORS.secondary, 0.5);
        headerBg.strokeRoundedRect(10, 8, scene.cameras.main.width - 20, 100, 15);

        // Title
        scene.add.text(cx, 35, 'MATCH-3', {
            fontSize: FONT_SIZE['5xl'],
            fontFamily: 'Arial Black',
            color: COLORS.text.white
        }).setOrigin(0.5).setShadow(2, 2, '#000000', 4);

        // Currency stat card
        const statY = 80;
        const statWidth = 180;
        scene.add.graphics()
            .fillStyle(COLORS.warning, 0.25)
            .fillRoundedRect(cx - statWidth / 2, statY - 22, statWidth, 44, RADIUS.lg);

        scene.add.text(cx - 50, statY, '💰', { fontSize: FONT_SIZE['4xl'] }).setOrigin(0.5);

        this.currencyText = scene.add.text(cx + 5, statY, formatNumber(PlayerData.currency), {
            fontSize: FONT_SIZE['3xl'],
            color: COLORS.text.gold,
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
    }

    /**
     * Create message text area
     */
    createMessageText(cx) {
        this.messageText = this.scene.add.text(cx, BOARD_OFFSET_Y + BOARD_TOTAL_SIZE + 25, '', {
            fontSize: FONT_SIZE.xl,
            color: COLORS.text.green,
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    /**
     * Create bottom panel buttons
     */
    createButtons(cx) {
        const scene = this.scene;
        const btnY = BOARD_OFFSET_Y + BOARD_TOTAL_SIZE + 70;
        const btnWidth = 100;
        const btnHeight = 48;
        const btnSpacing = 110;

        // Upgrades button
        new Button(scene, {
            x: cx - btnSpacing,
            y: btnY,
            width: btnWidth,
            height: btnHeight,
            text: '⬆️ Апгрейд',
            style: 'primary',
            fontSize: FONT_SIZE.base,
            onClick: () => {
                if (!scene.scene.isActive('UpgradesScene')) {
                    scene.scene.launch('UpgradesScene');
                }
            }
        });

        // Prestige button
        const prestigeBtn = new Button(scene, {
            x: cx,
            y: btnY,
            width: btnWidth,
            height: btnHeight,
            text: this.getPrestigeButtonText(),
            style: 'warning',
            fontSize: FONT_SIZE.base,
            onClick: () => {
                if (!scene.scene.isActive('PrestigeScene')) {
                    scene.scene.launch('PrestigeScene');
                }
            }
        });
        this.prestigeText = prestigeBtn.label;

        // Settings button
        new Button(scene, {
            x: cx + btnSpacing,
            y: btnY,
            width: btnWidth,
            height: btnHeight,
            text: '⚙️ Опции',
            style: 'secondary',
            fontSize: FONT_SIZE.base,
            onClick: () => {
                if (!scene.scene.isActive('SettingsScene')) {
                    scene.scene.launch('SettingsScene');
                }
            }
        });
    }

    /**
     * Create version text
     */
    createVersionText() {
        this.scene.add.text(10, this.scene.cameras.main.height - 10, JS_VERSION, {
            fontSize: FONT_SIZE.base,
            color: COLORS.text.muted,
            fontStyle: 'bold'
        }).setOrigin(0, 1);
    }

    /**
     * Get prestige button text showing coins and potential gain
     */
    getPrestigeButtonText() {
        const current = PlayerData.prestigeCurrency;
        const potential = getPrestigeCoinsFromCurrency(PlayerData.currency);
        if (potential > 0) {
            return `👑 ${current}(+${potential})`;
        }
        return `👑 ${current}`;
    }

    /**
     * Update prestige button text
     */
    updatePrestige() {
        if (this.prestigeText) {
            this.prestigeText.setText(this.getPrestigeButtonText());
        }
    }

    /**
     * Update currency display
     */
    updateCurrency() {
        this.currencyText.setText(formatNumber(PlayerData.currency));
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
            delay: DURATION.message,
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
        const style = ENHANCEMENT_TEXT_STYLES[enhancement] || ENHANCEMENT_TEXT_STYLES[ENHANCEMENT.NONE];

        const text = this.scene.add.text(x, y, `+${formatNumber(amount)}💰`, {
            fontSize: style.fontSize,
            color: style.color,
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
