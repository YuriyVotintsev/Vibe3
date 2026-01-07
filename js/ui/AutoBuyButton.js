// AutoBuyButton.js - Auto-buy toggle button component

import { COLORS, FONT_SIZE, RADIUS } from '../styles.js';

/**
 * Creates an auto-buy toggle button
 * Uses "Tell, Don't Ask" - receives item object and calls its methods
 */
export class AutoBuyButton {
    /**
     * @param {Phaser.Scene} scene
     * @param {Object} config
     * @param {number} config.x - Left X position
     * @param {number} config.y - Top Y position
     * @param {number} config.width
     * @param {number} config.height
     * @param {Object} config.item - Auto-buy item object with:
     *   - name: string - Display name
     *   - cost: number - Cost to unlock
     *   - isOwned(): boolean
     *   - canAfford(): boolean
     *   - onBuy(): boolean
     * @param {Object} [config.container] - Optional container
     * @param {Function} [config.onPurchase] - Called after successful purchase
     */
    constructor(scene, config) {
        this.scene = scene;
        this.item = config.item;

        const { x, y, width, height, container, onPurchase } = config;

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.onPurchase = onPurchase;

        // Background
        this.bg = scene.add.graphics();

        // Name
        this.nameText = scene.add.text(x + width / 2, y + 18, this.item.name, {
            fontSize: FONT_SIZE.md,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Status/cost
        this.statusText = scene.add.text(x + width / 2, y + 38, '', {
            fontSize: FONT_SIZE.base,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Hit area
        this.hitArea = scene.add.rectangle(x + width / 2, y + height / 2, width, height, 0x000000, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => this.refresh(true))
            .on('pointerout', () => this.refresh(false))
            .on('pointerdown', () => this.handleClick());

        // Add to container
        if (container) {
            container.add(this.bg);
            container.add(this.nameText);
            container.add(this.statusText);
            container.add(this.hitArea);
        }

        // Initial render
        this.refresh(false);
    }

    /**
     * Handle click - Tell the item to buy itself
     */
    handleClick() {
        if (this.item.canAfford() && this.item.onBuy()) {
            if (this.onPurchase) {
                this.onPurchase();
            }
        }
    }

    /**
     * Refresh display based on current item state
     */
    refresh(hover = false) {
        const isOwned = this.item.isOwned();
        const canAfford = this.item.canAfford();

        // Update name color
        this.nameText.setColor(isOwned ? COLORS.text.green : COLORS.text.white);

        // Update status
        if (isOwned) {
            this.statusText.setText('✓ ВКЛ');
            this.statusText.setColor(COLORS.text.green);
        } else {
            this.statusText.setText(`${this.item.cost}👑`);
            this.statusText.setColor(canAfford ? COLORS.text.gold : COLORS.text.goldDark);
        }

        // Update cursor
        this.hitArea.setInteractive({ useHandCursor: !isOwned && canAfford });

        // Draw background
        this.drawBackground(isOwned, canAfford, hover);
    }

    drawBackground(isOwned, canAfford, hover) {
        const { x, y, width, height } = this;

        let bgColor;
        let alpha = 1;

        if (isOwned) {
            bgColor = COLORS.success;
            alpha = 0.6;
        } else if (hover && canAfford) {
            bgColor = COLORS.bgButtonHover;
        } else {
            bgColor = canAfford ? COLORS.bgButton : COLORS.bgDisabledDark;
        }

        this.bg.clear();
        this.bg.fillStyle(bgColor, alpha);
        this.bg.fillRoundedRect(x, y, width, height, RADIUS.md);

        if (!isOwned) {
            const borderColor = canAfford ? COLORS.successBright : COLORS.bgDisabled;
            this.bg.lineStyle(2, borderColor, 1);
            this.bg.strokeRoundedRect(x, y, width, height, RADIUS.md);
        }
    }

    destroy() {
        this.bg.destroy();
        this.nameText.destroy();
        this.statusText.destroy();
        this.hitArea.destroy();
    }
}
