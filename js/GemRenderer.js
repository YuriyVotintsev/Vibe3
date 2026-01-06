// GemRenderer.js - Gem texture generation
import { ALL_GEM_COLORS, ENHANCEMENT } from './config.js';
import { getCellSize } from './utils.js';

/**
 * Create all gem textures for the game
 * @param {Phaser.Scene} scene - The Phaser scene to create textures in
 */
export function createGemTextures(scene) {
    const cellSize = getCellSize();
    const size = cellSize - 8;
    const radius = 10;

    // Create gem textures for each color
    for (let i = 0; i < ALL_GEM_COLORS.length; i++) {
        const key = `gem_${i}`;
        if (scene.textures.exists(key)) {
            scene.textures.remove(key);
        }

        const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

        // Main gem body
        graphics.fillStyle(ALL_GEM_COLORS[i], 1);
        graphics.fillRoundedRect(0, 0, size, size, radius);

        // Highlight (top-left)
        graphics.fillStyle(0xffffff, 0.3);
        graphics.fillRoundedRect(4, 4, size - 20, size - 20, radius - 2);

        // Shadow (bottom)
        graphics.fillStyle(0x000000, 0.2);
        graphics.fillRoundedRect(8, size - 16, size - 16, 8, 4);

        graphics.generateTexture(key, size, size);
        graphics.destroy();
    }

    // Create selection indicator texture
    createSelectionTexture(scene, cellSize);

    // Create bomb texture
    createBombTexture(scene, cellSize);

    // Create enhancement overlay textures
    createEnhancementTextures(scene, cellSize);
}

/**
 * Create the selection indicator texture
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {number} cellSize - Size of a cell
 */
export function createSelectionTexture(scene, cellSize) {
    if (scene.textures.exists('selection')) {
        scene.textures.remove('selection');
    }

    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    graphics.lineStyle(4, 0xffffff, 1);
    graphics.strokeRoundedRect(2, 2, cellSize - 4, cellSize - 4, 12);
    graphics.generateTexture('selection', cellSize, cellSize);
    graphics.destroy();
}

/**
 * Create the bomb texture (gem-style rounded rectangle with bomb design)
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {number} cellSize - Size of a cell
 */
export function createBombTexture(scene, cellSize) {
    if (scene.textures.exists('bomb')) {
        scene.textures.remove('bomb');
    }

    const size = cellSize - 8;
    const radius = 10;
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    const cx = size / 2;
    const cy = size / 2;

    // Main body - dark red/maroon like a gem
    graphics.fillStyle(0x8b0000, 1);
    graphics.fillRoundedRect(0, 0, size, size, radius);

    // Highlight (top-left) - same style as gems
    graphics.fillStyle(0xff4444, 0.4);
    graphics.fillRoundedRect(4, 4, size - 20, size - 20, radius - 2);

    // Shadow (bottom) - same style as gems
    graphics.fillStyle(0x000000, 0.3);
    graphics.fillRoundedRect(8, size - 16, size - 16, 8, 4);

    // Bomb circle in center
    const bombRadius = size * 0.28;
    graphics.fillStyle(0x1a1a1a, 1);
    graphics.fillCircle(cx, cy + 2, bombRadius);

    // Bomb shine
    graphics.fillStyle(0x444444, 1);
    graphics.fillCircle(cx - bombRadius * 0.3, cy - bombRadius * 0.2, bombRadius * 0.35);

    // Fuse
    graphics.lineStyle(3, 0xffaa00, 1);
    graphics.beginPath();
    graphics.moveTo(cx + bombRadius * 0.5, cy - bombRadius * 0.5);
    graphics.lineTo(cx + bombRadius * 0.9, cy - bombRadius * 1.1);
    graphics.strokePath();

    // Spark/flame at fuse tip
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(cx + bombRadius * 0.9, cy - bombRadius * 1.2, 4);
    graphics.fillStyle(0xff6600, 1);
    graphics.fillCircle(cx + bombRadius * 0.9, cy - bombRadius * 1.2, 2.5);

    graphics.generateTexture('bomb', size, size);
    graphics.destroy();
}

/**
 * Create enhancement overlay textures (silver, gold, crystal)
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {number} cellSize - Size of a cell
 */
export function createEnhancementTextures(scene, cellSize) {
    const size = cellSize - 8;

    // Silver overlay - simple shine effect
    createEnhancementOverlay(scene, 'overlay_silver', size, {
        borderColor: 0xc0c0c0,
        borderAlpha: 0.9,
        shineColor: 0xffffff,
        shineAlpha: 0.4,
        starCount: 0
    });

    // Gold overlay - golden border with sparkle
    createEnhancementOverlay(scene, 'overlay_gold', size, {
        borderColor: 0xffd700,
        borderAlpha: 1,
        shineColor: 0xffff88,
        shineAlpha: 0.5,
        starCount: 2
    });

    // Crystal overlay - rainbow/prismatic effect with stars
    createEnhancementOverlay(scene, 'overlay_crystal', size, {
        borderColor: 0x88ffff,
        borderAlpha: 1,
        shineColor: 0xffffff,
        shineAlpha: 0.6,
        starCount: 4,
        rainbow: true
    });
}

/**
 * Create a single enhancement overlay texture
 */
function createEnhancementOverlay(scene, key, size, options) {
    if (scene.textures.exists(key)) {
        scene.textures.remove(key);
    }

    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    const radius = 10;
    const cx = size / 2;
    const cy = size / 2;

    // Border glow
    graphics.lineStyle(3, options.borderColor, options.borderAlpha);
    graphics.strokeRoundedRect(2, 2, size - 4, size - 4, radius);

    // Inner shine (top-left corner)
    graphics.fillStyle(options.shineColor, options.shineAlpha);
    graphics.fillTriangle(4, 4, 4, size * 0.4, size * 0.4, 4);

    // Rainbow effect for crystal
    if (options.rainbow) {
        graphics.lineStyle(2, 0xff88ff, 0.5);
        graphics.strokeRoundedRect(4, 4, size - 8, size - 8, radius - 2);
    }

    // Stars/sparkles
    if (options.starCount > 0) {
        const starPositions = [
            { x: size * 0.2, y: size * 0.2 },
            { x: size * 0.8, y: size * 0.25 },
            { x: size * 0.75, y: size * 0.8 },
            { x: size * 0.15, y: size * 0.75 }
        ];

        graphics.fillStyle(0xffffff, 0.9);
        for (let i = 0; i < options.starCount && i < starPositions.length; i++) {
            const star = starPositions[i];
            drawStar(graphics, star.x, star.y, 4, 2, 4);
        }
    }

    graphics.generateTexture(key, size, size);
    graphics.destroy();
}

/**
 * Draw a simple star shape
 */
function drawStar(graphics, cx, cy, outerRadius, innerRadius, points) {
    const step = Math.PI / points;
    graphics.beginPath();
    for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = i * step - Math.PI / 2;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        if (i === 0) {
            graphics.moveTo(x, y);
        } else {
            graphics.lineTo(x, y);
        }
    }
    graphics.closePath();
    graphics.fillPath();
}
