// UpgradeButton.js - Upgrade-style button component

import { COLORS, FONT_SIZE, RADIUS } from '../styles.js';

/**
 * Creates an upgrade-style button with name, value, level, and cost
 */
export class UpgradeButton {
    /**
     * @param {Phaser.Scene} scene
     * @param {Object} config
     * @param {number} config.x - Left X position
     * @param {number} config.y - Top Y position
     * @param {number} config.width
     * @param {number} config.height
     * @param {Object} config.upgrade - Upgrade data object with methods:
     *   - getName(): string
     *   - getValue(): string
     *   - getLevel(): string (e.g. "3/10")
     *   - getCost(): number|null (null if maxed)
     *   - canAfford(): boolean
     *   - onBuy(): boolean
     * @param {Function} config.formatCost - Format cost for display
     * @param {Object} [config.container] - Optional container
     * @param {Function} [config.onPurchase] - Called after successful purchase
     */
    constructor(scene, config) {
        this.scene = scene;
        this.config = config;
        this.upgrade = config.upgrade;

        const {
            x, y, width, height,
            container,
            formatCost = (c) => c,
            onPurchase
        } = config;

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.formatCost = formatCost;
        this.onPurchase = onPurchase;

        // Create elements
        this.bg = scene.add.graphics();
        this.elements = [];

        // Name text
        this.nameText = scene.add.text(x + width / 2, y + 12, this.upgrade.getName(), {
            fontSize: FONT_SIZE.md,
            color: COLORS.text.white,
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.elements.push(this.nameText);

        // Level text
        this.levelText = scene.add.text(x + width / 2, y + 26, '', {
            fontSize: FONT_SIZE.xs,
            color: COLORS.text.light
        }).setOrigin(0.5);
        this.elements.push(this.levelText);

        // Value text
        this.valueText = scene.add.text(x + width / 2, y + 43, '', {
            fontSize: FONT_SIZE.lg,
            color: COLORS.text.green,
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.elements.push(this.valueText);

        // Cost text
        this.costText = scene.add.text(x + width / 2, y + 59, '', {
            fontSize: FONT_SIZE.sm,
            color: COLORS.text.gold
        }).setOrigin(0.5);
        this.elements.push(this.costText);

        // Hit area
        this.hitArea = scene.add.rectangle(x + width / 2, y + height / 2, width, height, 0x000000, 0);
        this.elements.push(this.hitArea);

        // Add to container
        if (container) {
            container.add(this.bg);
            this.elements.forEach(el => container.add(el));
        }

        // Setup events
        this.setupEvents();

        // Initial render
        this.refresh();
    }

    /**
     * Get current button state
     */
    getState() {
        const cost = this.upgrade.getCost();
        const isMaxed = cost === null;
        const canAfford = !isMaxed && this.upgrade.canAfford();
        return { cost, isMaxed, canAfford };
    }

    /**
     * Draw background based on state
     */
    drawBackground(hover = false) {
        const { x, y, width, height } = this;
        const { isMaxed, canAfford } = this.getState();

        let bgColor;
        if (isMaxed) {
            bgColor = COLORS.bgDisabled;
        } else if (canAfford) {
            bgColor = hover ? COLORS.successHover : COLORS.success;
        } else {
            bgColor = hover ? COLORS.bgButtonHover : COLORS.bgButton;
        }

        this.bg.clear();
        this.bg.fillStyle(bgColor, 1);
        this.bg.fillRoundedRect(x, y, width, height, RADIUS.md);

        if (!isMaxed) {
            const borderColor = canAfford ? COLORS.successBright : COLORS.borderLight;
            this.bg.lineStyle(2, borderColor, 1);
            this.bg.strokeRoundedRect(x, y, width, height, RADIUS.md);
        }
    }

    /**
     * Setup events
     */
    setupEvents() {
        this.hitArea
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                const { isMaxed } = this.getState();
                if (!isMaxed) {
                    this.drawBackground(true);
                }
            })
            .on('pointerout', () => {
                this.drawBackground(false);
            })
            .on('pointerdown', () => {
                const { canAfford } = this.getState();
                if (canAfford && this.upgrade.onBuy()) {
                    if (this.onPurchase) {
                        this.onPurchase();
                    }
                }
            });
    }

    /**
     * Refresh button display
     */
    refresh() {
        const { cost, isMaxed, canAfford } = this.getState();

        this.levelText.setText(this.upgrade.getLevel());
        this.valueText.setText(this.upgrade.getValue());

        if (isMaxed) {
            this.costText.setText('MAX');
            this.costText.setColor(COLORS.text.muted);
        } else {
            this.costText.setText(this.formatCost(cost));
            this.costText.setColor(canAfford ? COLORS.text.gold : COLORS.text.goldDark);
        }

        this.hitArea.setInteractive({ useHandCursor: canAfford });
        this.drawBackground(false);
    }

    /**
     * Destroy all elements
     */
    destroy() {
        this.bg.destroy();
        this.elements.forEach(el => el.destroy());
    }
}
