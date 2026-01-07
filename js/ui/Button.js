// Button.js - Reusable button component
import { COLORS, FONT_SIZE, RADIUS, BUTTON_STYLE } from '../styles.js';

/**
 * Creates a styled button with hover effects
 */
export class Button {
    /**
     * @param {Phaser.Scene} scene - The scene to add button to
     * @param {Object} config - Button configuration
     * @param {number} config.x - Center X position
     * @param {number} config.y - Center Y position
     * @param {number} config.width - Button width
     * @param {number} config.height - Button height
     * @param {string} config.text - Button label
     * @param {string} [config.style='default'] - Style preset (primary, secondary, success, warning, danger, disabled, default)
     * @param {Function} [config.onClick] - Click handler
     * @param {Object} [config.container] - Optional container to add elements to
     * @param {number} [config.fontSize] - Override font size
     * @param {number} [config.radius] - Override border radius
     */
    constructor(scene, config) {
        this.scene = scene;
        this.config = config;
        this.enabled = true;

        const {
            x, y, width, height, text,
            style = 'default',
            onClick,
            container,
            fontSize = FONT_SIZE.base,
            radius = RADIUS.lg
        } = config;

        // Get style preset
        this.stylePreset = BUTTON_STYLE[style] || BUTTON_STYLE.default;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.radius = radius;

        // Create graphics for background
        this.bg = scene.add.graphics();
        this.drawBackground(this.stylePreset.bg);

        // Create hit area
        this.hitArea = scene.add.rectangle(x, y, width, height, 0x000000, 0)
            .setInteractive({ useHandCursor: style !== 'disabled' });

        // Create text
        this.label = scene.add.text(x, y, text, {
            fontSize: fontSize,
            color: this.stylePreset.text,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Setup events
        this.setupEvents(onClick);

        // Add to container if provided
        if (container) {
            container.add(this.bg);
            container.add(this.hitArea);
            container.add(this.label);
        }
    }

    /**
     * Draw button background
     */
    drawBackground(color, border = null) {
        const { x, y, width, height, radius } = this;
        const left = x - width / 2;
        const top = y - height / 2;

        this.bg.clear();
        this.bg.fillStyle(color, 1);
        this.bg.fillRoundedRect(left, top, width, height, radius);

        if (border || this.stylePreset.border) {
            this.bg.lineStyle(2, border || this.stylePreset.border, 1);
            this.bg.strokeRoundedRect(left, top, width, height, radius);
        }
    }

    /**
     * Setup hover and click events
     */
    setupEvents(onClick) {
        this.hitArea
            .on('pointerover', () => {
                if (this.enabled) {
                    this.drawBackground(this.stylePreset.bgHover);
                }
            })
            .on('pointerout', () => {
                if (this.enabled) {
                    this.drawBackground(this.stylePreset.bg);
                }
            })
            .on('pointerdown', () => {
                if (this.enabled && onClick) {
                    onClick();
                }
            });
    }

    /**
     * Update button text
     */
    setText(text) {
        this.label.setText(text);
        return this;
    }

    /**
     * Update button style
     */
    setStyle(styleName) {
        this.stylePreset = BUTTON_STYLE[styleName] || BUTTON_STYLE.default;
        this.drawBackground(this.stylePreset.bg);
        this.label.setColor(this.stylePreset.text);
        this.hitArea.setInteractive({ useHandCursor: styleName !== 'disabled' });
        return this;
    }

    /**
     * Enable/disable button
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.drawBackground(BUTTON_STYLE.disabled.bg);
            this.label.setColor(BUTTON_STYLE.disabled.text);
            this.hitArea.setInteractive({ useHandCursor: false });
        } else {
            this.drawBackground(this.stylePreset.bg);
            this.label.setColor(this.stylePreset.text);
            this.hitArea.setInteractive({ useHandCursor: true });
        }
        return this;
    }

    /**
     * Destroy button and all its components
     */
    destroy() {
        this.bg.destroy();
        this.hitArea.destroy();
        this.label.destroy();
    }
}

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
     * @param {Object} config.upgrade - Upgrade data object
     * @param {Function} config.upgrade.getName - Returns display name
     * @param {Function} config.upgrade.getValue - Returns current value string
     * @param {Function} config.upgrade.getLevel - Returns level string (e.g. "3/10")
     * @param {Function} config.upgrade.getCost - Returns cost or null if maxed
     * @param {Function} config.upgrade.canAfford - Returns boolean
     * @param {Function} config.upgrade.onBuy - Buy handler, returns boolean
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

/**
 * Creates an auto-buy toggle button
 */
export class AutoBuyButton {
    /**
     * @param {Phaser.Scene} scene
     * @param {Object} config
     */
    constructor(scene, config) {
        this.scene = scene;

        const {
            x, y, width, height,
            name,
            isOwned,
            cost,
            canAfford,
            onBuy,
            container
        } = config;

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isOwned = isOwned;
        this.cost = cost;
        this.canAfford = canAfford;

        // Background
        this.bg = scene.add.graphics();
        this.drawBackground();

        // Name
        this.nameText = scene.add.text(x + width / 2, y + 18, name, {
            fontSize: FONT_SIZE.md,
            color: isOwned ? COLORS.text.green : COLORS.text.white,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Status/cost
        this.statusText = scene.add.text(x + width / 2, y + 38, '', {
            fontSize: FONT_SIZE.base,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        if (isOwned) {
            this.statusText.setText('✓ ВКЛ');
            this.statusText.setColor(COLORS.text.green);
        } else {
            this.statusText.setText(`${cost}👑`);
            this.statusText.setColor(canAfford ? COLORS.text.gold : COLORS.text.goldDark);
        }

        // Add to container
        if (container) {
            container.add(this.bg);
            container.add(this.nameText);
            container.add(this.statusText);
        }

        // Hit area and events (only if not owned)
        if (!isOwned) {
            this.hitArea = scene.add.rectangle(x + width / 2, y + height / 2, width, height, 0x000000, 0)
                .setInteractive({ useHandCursor: canAfford })
                .on('pointerover', () => {
                    if (canAfford) {
                        this.drawBackground(true);
                    }
                })
                .on('pointerout', () => {
                    this.drawBackground(false);
                })
                .on('pointerdown', () => {
                    if (canAfford && onBuy) {
                        onBuy();
                    }
                });

            if (container) {
                container.add(this.hitArea);
            }
        }
    }

    drawBackground(hover = false) {
        const { x, y, width, height, isOwned, canAfford } = this;

        let bgColor;
        let alpha = 1;

        if (isOwned) {
            bgColor = COLORS.success;
            alpha = 0.6;
        } else if (hover && canAfford) {
            bgColor = COLORS.bgButtonHover;
        } else {
            bgColor = canAfford ? COLORS.bgButton : 0x222233;
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
        if (this.hitArea) {
            this.hitArea.destroy();
        }
    }
}
