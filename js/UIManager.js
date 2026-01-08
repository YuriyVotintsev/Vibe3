// UIManager.js - Handles UI elements for MainScene

import {
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
        this.fullscreenBtn = null;
        this.comboText = null;
    }

    /**
     * Create all UI elements
     */
    create() {
        const layout = this.scene.layout;

        this.createHeader(layout);
        this.createMessageText(layout);
        this.createButtons(layout);
        this.createVersionText(layout);
    }

    /**
     * Create header panel with currency
     */
    createHeader(layout) {
        const scene = this.scene;
        const cx = layout.centerX;
        const W = layout.canvasWidth;
        const padding = 15;

        // Header panel background - styled dark with colored border
        const headerBg = scene.add.graphics();
        headerBg.fillStyle(COLORS.bgPanel, 0.98);
        headerBg.fillRoundedRect(padding, padding, W - padding * 2, 100, RADIUS['2xl']);
        headerBg.lineStyle(2, COLORS.primary, 0.8);
        headerBg.strokeRoundedRect(padding, padding, W - padding * 2, 100, RADIUS['2xl']);

        // Title - prominent
        scene.add.text(cx, 42, '💎 MATCH-3', {
            fontSize: FONT_SIZE['4xl'],
            fontFamily: 'Arial Black',
            color: COLORS.text.white
        }).setOrigin(0.5);

        // Combo display (left side of header)
        this.comboText = scene.add.text(45, 42, '', {
            fontSize: FONT_SIZE['2xl'],
            color: '#ff6b6b',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5).setAlpha(0);

        // Currency card - same size as UpgradesScene (25px padding, 55px height)
        const cardY = 75;
        const currencyCard = scene.add.graphics();
        currencyCard.fillStyle(0x1a3a2a, 1); // dark green like UpgradesScene
        currencyCard.fillRoundedRect(25, cardY - 5, W - 50, 55, RADIUS.lg);
        currencyCard.lineStyle(2, COLORS.success, 0.6);
        currencyCard.strokeRoundedRect(25, cardY - 5, W - 50, 55, RADIUS.lg);

        // Currency text - centered, bright gold
        this.currencyText = scene.add.text(cx, cardY + 20, `💰 ${formatNumber(PlayerData.currency)}`, {
            fontSize: FONT_SIZE['4xl'],
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Fullscreen toggle button (right side of header)
        this.fullscreenBtn = new Button(scene, {
            x: W - 50,
            y: 42,
            width: 44,
            height: 44,
            text: '⛶',
            style: 'default',
            fontSize: FONT_SIZE['2xl'],
            onClick: () => this.toggleFullscreen()
        });
    }

    /**
     * Toggle fullscreen mode
     */
    toggleFullscreen() {
        if (this.scene.scale.isFullscreen) {
            this.scene.scale.stopFullscreen();
            this.fullscreenBtn.setText('⛶');
        } else {
            this.scene.scale.startFullscreen();
            this.fullscreenBtn.setText('✕');
        }
    }

    /**
     * Create message text area
     */
    createMessageText(layout) {
        this.messageText = this.scene.add.text(layout.centerX, layout.messageY, '', {
            fontSize: FONT_SIZE.xl,
            color: COLORS.text.green,
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    /**
     * Create bottom panel buttons
     */
    createButtons(layout) {
        const scene = this.scene;
        const W = layout.canvasWidth;
        const H = layout.canvasHeight;
        const padding = 15;

        // Bottom panel background - equal padding on all sides
        const panelHeight = 70;
        const panelY = H - padding - panelHeight;
        const btnY = panelY + panelHeight / 2;

        const bottomPanel = scene.add.graphics();
        bottomPanel.fillStyle(COLORS.bgPanel, 0.95);
        bottomPanel.fillRoundedRect(padding, panelY, W - padding * 2, panelHeight, RADIUS['2xl']);
        bottomPanel.lineStyle(2, COLORS.borderLight, 0.5);
        bottomPanel.strokeRoundedRect(padding, panelY, W - padding * 2, panelHeight, RADIUS['2xl']);

        // Button sizing - larger, touch-friendly
        const gap = 10;
        const totalWidth = W - 60;
        const btnWidth = Math.floor((totalWidth - gap * 2) / 3);
        const btnHeight = 52;
        const startX = 30;

        // Upgrades button
        new Button(scene, {
            x: startX + btnWidth / 2,
            y: btnY,
            width: btnWidth,
            height: btnHeight,
            text: '⬆️ Апгрейд',
            style: 'primary',
            radius: RADIUS.xl,
            fontSize: FONT_SIZE.xl,
            onClick: () => {
                if (!scene.scene.isActive('UpgradesScene')) {
                    scene.scene.launch('UpgradesScene');
                }
            }
        });

        // Prestige button
        const prestigeBtn = new Button(scene, {
            x: startX + btnWidth + gap + btnWidth / 2,
            y: btnY,
            width: btnWidth,
            height: btnHeight,
            text: this.getPrestigeButtonText(),
            style: 'warning',
            radius: RADIUS.xl,
            fontSize: FONT_SIZE.xl,
            onClick: () => {
                if (!scene.scene.isActive('PrestigeScene')) {
                    scene.scene.launch('PrestigeScene');
                }
            }
        });
        this.prestigeText = prestigeBtn.label;

        // Settings button
        new Button(scene, {
            x: startX + (btnWidth + gap) * 2 + btnWidth / 2,
            y: btnY,
            width: btnWidth,
            height: btnHeight,
            text: '⚙️ Опции',
            style: 'secondary',
            radius: RADIUS.xl,
            fontSize: FONT_SIZE.xl,
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
    createVersionText(layout) {
        this.scene.add.text(10, layout.canvasHeight - 10, JS_VERSION, {
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
        this.currencyText.setText(`💰 ${formatNumber(PlayerData.currency)}`);
    }

    /**
     * Update combo display
     * @param {ComboManager} comboManager - The combo manager
     */
    updateCombo(comboManager) {
        const combo = comboManager.getCombo();
        if (combo > 0) {
            const mult = comboManager.getMultiplier();
            this.comboText.setText(`🔥${combo} ×${mult.toFixed(1)}`);
            this.comboText.setAlpha(1);
        } else {
            this.comboText.setAlpha(0);
        }
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
