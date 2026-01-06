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

    // Silver overlay - visible shine with border
    createSilverOverlay(scene, 'overlay_silver', size);

    // Gold overlay - golden border with sparkles
    createGoldOverlay(scene, 'overlay_gold', size);

    // Crystal overlay - rainbow/prismatic effect with stars
    createCrystalOverlay(scene, 'overlay_crystal', size);
}

/**
 * Create silver overlay - white rounded square with border and shadow
 */
function createSilverOverlay(scene, key, size) {
    if (scene.textures.exists(key)) {
        scene.textures.remove(key);
    }

    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    const squareSize = size * 0.4;
    const offset = (size - squareSize) / 2;

    // Shadow
    graphics.fillStyle(0x000000, 0.4);
    graphics.fillRoundedRect(offset + 2, offset + 2, squareSize, squareSize, 6);

    // Main square
    graphics.fillStyle(0xffffff, 0.95);
    graphics.fillRoundedRect(offset, offset, squareSize, squareSize, 6);

    // Border
    graphics.lineStyle(2, 0x888888, 1);
    graphics.strokeRoundedRect(offset, offset, squareSize, squareSize, 6);

    graphics.generateTexture(key, size, size);
    graphics.destroy();
}

/**
 * Create gold overlay - yellow rounded square with border and shadow
 */
function createGoldOverlay(scene, key, size) {
    if (scene.textures.exists(key)) {
        scene.textures.remove(key);
    }

    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    const squareSize = size * 0.4;
    const offset = (size - squareSize) / 2;

    // Shadow
    graphics.fillStyle(0x000000, 0.4);
    graphics.fillRoundedRect(offset + 2, offset + 2, squareSize, squareSize, 6);

    // Main square
    graphics.fillStyle(0xffd700, 1);
    graphics.fillRoundedRect(offset, offset, squareSize, squareSize, 6);

    // Border
    graphics.lineStyle(2, 0xb8860b, 1);
    graphics.strokeRoundedRect(offset, offset, squareSize, squareSize, 6);

    graphics.generateTexture(key, size, size);
    graphics.destroy();
}

/**
 * Create crystal overlay - cyan rounded square with border and shadow
 */
function createCrystalOverlay(scene, key, size) {
    if (scene.textures.exists(key)) {
        scene.textures.remove(key);
    }

    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    const squareSize = size * 0.4;
    const offset = (size - squareSize) / 2;

    // Shadow
    graphics.fillStyle(0x000000, 0.4);
    graphics.fillRoundedRect(offset + 2, offset + 2, squareSize, squareSize, 6);

    // Main square
    graphics.fillStyle(0x00ffff, 1);
    graphics.fillRoundedRect(offset, offset, squareSize, squareSize, 6);

    // Border
    graphics.lineStyle(2, 0x008888, 1);
    graphics.strokeRoundedRect(offset, offset, squareSize, squareSize, 6);

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
