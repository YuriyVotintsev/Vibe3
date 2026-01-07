// Button.js - Base button component

import { FONT_SIZE, RADIUS, BUTTON_STYLE } from '../styles.js';

// Re-export other button components for backward compatibility
export { UpgradeButton } from './UpgradeButton.js';
export { AutoBuyButton } from './AutoBuyButton.js';

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
     * @param {string} [config.style='default'] - Style preset
     * @param {Function} [config.onClick] - Click handler
     * @param {Object} [config.container] - Optional container
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

        this.stylePreset = BUTTON_STYLE[style] || BUTTON_STYLE.default;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.radius = radius;

        // Background
        this.bg = scene.add.graphics();
        this.drawBackground(this.stylePreset.bg);

        // Hit area
        this.hitArea = scene.add.rectangle(x, y, width, height, 0x000000, 0)
            .setInteractive({ useHandCursor: style !== 'disabled' });

        // Label
        this.label = scene.add.text(x, y, text, {
            fontSize: fontSize,
            color: this.stylePreset.text,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.setupEvents(onClick);

        if (container) {
            container.add(this.bg);
            container.add(this.hitArea);
            container.add(this.label);
        }
    }

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

    setText(text) {
        this.label.setText(text);
        return this;
    }

    setStyle(styleName) {
        this.stylePreset = BUTTON_STYLE[styleName] || BUTTON_STYLE.default;
        this.drawBackground(this.stylePreset.bg);
        this.label.setColor(this.stylePreset.text);
        this.hitArea.setInteractive({ useHandCursor: styleName !== 'disabled' });
        return this;
    }

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

    destroy() {
        this.bg.destroy();
        this.hitArea.destroy();
        this.label.destroy();
    }
}
