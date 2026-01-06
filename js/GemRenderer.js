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
 * Create silver overlay - visible border with shimmer
 */
function createSilverOverlay(scene, key, size) {
    if (scene.textures.exists(key)) {
        scene.textures.remove(key);
    }

    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    const radius = 10;

    // Outer glow (thick, semi-transparent)
    graphics.lineStyle(6, 0xe0e0e0, 0.5);
    graphics.strokeRoundedRect(1, 1, size - 2, size - 2, radius + 2);

    // Main silver border (bright)
    graphics.lineStyle(4, 0xffffff, 0.9);
    graphics.strokeRoundedRect(3, 3, size - 6, size - 6, radius);

    // Corner accents
    graphics.fillStyle(0xffffff, 0.8);
    // Top-left
    graphics.fillTriangle(5, 5, 5, 18, 18, 5);
    // Bottom-right
    graphics.fillTriangle(size - 5, size - 5, size - 5, size - 18, size - 18, size - 5);

    // Shine stripe diagonal
    graphics.fillStyle(0xffffff, 0.3);
    graphics.fillTriangle(0, 0, 0, size * 0.5, size * 0.5, 0);

    graphics.generateTexture(key, size, size);
    graphics.destroy();
}

/**
 * Create gold overlay - prominent golden border with sparkles
 */
function createGoldOverlay(scene, key, size) {
    if (scene.textures.exists(key)) {
        scene.textures.remove(key);
    }

    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    const radius = 10;

    // Outer golden glow
    graphics.lineStyle(7, 0xffaa00, 0.5);
    graphics.strokeRoundedRect(0, 0, size, size, radius + 2);

    // Main gold border (thick)
    graphics.lineStyle(5, 0xffd700, 1);
    graphics.strokeRoundedRect(3, 3, size - 6, size - 6, radius);

    // Inner bright line
    graphics.lineStyle(2, 0xffff88, 0.8);
    graphics.strokeRoundedRect(6, 6, size - 12, size - 12, radius - 2);

    // Golden corner accents
    graphics.fillStyle(0xffd700, 0.9);
    graphics.fillTriangle(5, 5, 5, 22, 22, 5);
    graphics.fillTriangle(size - 5, size - 5, size - 5, size - 22, size - 22, size - 5);

    // Sparkles at all corners
    graphics.fillStyle(0xffffff, 1);
    drawStar(graphics, size * 0.15, size * 0.15, 6, 2.5, 4);
    drawStar(graphics, size * 0.85, size * 0.15, 5, 2, 4);
    drawStar(graphics, size * 0.85, size * 0.85, 6, 2.5, 4);
    drawStar(graphics, size * 0.15, size * 0.85, 5, 2, 4);

    graphics.generateTexture(key, size, size);
    graphics.destroy();
}

/**
 * Create crystal overlay - rainbow prismatic effect
 */
function createCrystalOverlay(scene, key, size) {
    if (scene.textures.exists(key)) {
        scene.textures.remove(key);
    }

    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    const radius = 10;

    // Multi-color rainbow borders
    graphics.lineStyle(4, 0xff88ff, 0.6); // Pink outer
    graphics.strokeRoundedRect(0, 0, size, size, radius + 2);

    graphics.lineStyle(4, 0x88ffff, 0.8); // Cyan
    graphics.strokeRoundedRect(3, 3, size - 6, size - 6, radius);

    graphics.lineStyle(3, 0xffff88, 0.7); // Yellow inner
    graphics.strokeRoundedRect(6, 6, size - 12, size - 12, radius - 2);

    graphics.lineStyle(2, 0xffffff, 0.9); // White innermost
    graphics.strokeRoundedRect(8, 8, size - 16, size - 16, radius - 3);

    // Bright corner flares
    graphics.fillStyle(0xffffff, 0.9);
    graphics.fillTriangle(4, 4, 4, 25, 25, 4);
    graphics.fillTriangle(size - 4, size - 4, size - 4, size - 25, size - 25, size - 4);

    // Colored corner accents
    graphics.fillStyle(0x88ffff, 0.7);
    graphics.fillTriangle(size - 4, 4, size - 4, 20, size - 20, 4);
    graphics.fillStyle(0xff88ff, 0.7);
    graphics.fillTriangle(4, size - 4, 4, size - 20, 20, size - 4);

    // Stars at all corners (bigger and brighter)
    graphics.fillStyle(0xffffff, 1);
    drawStar(graphics, size * 0.15, size * 0.15, 7, 3, 4);
    drawStar(graphics, size * 0.85, size * 0.15, 7, 3, 4);
    drawStar(graphics, size * 0.85, size * 0.85, 7, 3, 4);
    drawStar(graphics, size * 0.15, size * 0.85, 7, 3, 4);

    // Center diamond sparkle
    drawStar(graphics, size / 2, size / 2, 8, 3, 4);

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
