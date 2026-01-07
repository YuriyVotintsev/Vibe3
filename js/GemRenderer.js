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
 * Create enhancement overlay textures (bronze, silver, gold, crystal, rainbow, prismatic, celestial)
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {number} cellSize - Size of a cell
 */
export function createEnhancementTextures(scene, cellSize) {
    const size = cellSize - 8;

    // Bronze overlay - copper/brown color
    createBronzeOverlay(scene, 'overlay_bronze', size);

    // Silver overlay - visible shine with border
    createSilverOverlay(scene, 'overlay_silver', size);

    // Gold overlay - golden border with sparkles
    createGoldOverlay(scene, 'overlay_gold', size);

    // Crystal overlay - cyan effect
    createCrystalOverlay(scene, 'overlay_crystal', size);

    // Rainbow overlay - multicolor effect
    createRainbowOverlay(scene, 'overlay_rainbow', size);

    // Prismatic overlay - star/sparkle effect
    createPrismaticOverlay(scene, 'overlay_prismatic', size);

    // Celestial overlay - divine blue/white glow
    createCelestialOverlay(scene, 'overlay_celestial', size);
}

/**
 * Create bronze overlay - copper/brown rounded square with border and shadow
 */
function createBronzeOverlay(scene, key, size) {
    if (scene.textures.exists(key)) {
        scene.textures.remove(key);
    }

    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    const squareSize = size * 0.4;
    const offset = (size - squareSize) / 2;

    // Shadow
    graphics.fillStyle(0x000000, 0.4);
    graphics.fillRoundedRect(offset + 2, offset + 2, squareSize, squareSize, 6);

    // Main square - bronze/copper color
    graphics.fillStyle(0xcd7f32, 1);
    graphics.fillRoundedRect(offset, offset, squareSize, squareSize, 6);

    // Border - darker bronze
    graphics.lineStyle(2, 0x8b4513, 1);
    graphics.strokeRoundedRect(offset, offset, squareSize, squareSize, 6);

    graphics.generateTexture(key, size, size);
    graphics.destroy();
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
 * Create rainbow overlay - multicolor rounded square with gradient-like effect
 */
function createRainbowOverlay(scene, key, size) {
    if (scene.textures.exists(key)) {
        scene.textures.remove(key);
    }

    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    const squareSize = size * 0.4;
    const offset = (size - squareSize) / 2;

    // Shadow
    graphics.fillStyle(0x000000, 0.4);
    graphics.fillRoundedRect(offset + 2, offset + 2, squareSize, squareSize, 6);

    // Main square - magenta/pink base
    graphics.fillStyle(0xff00ff, 1);
    graphics.fillRoundedRect(offset, offset, squareSize, squareSize, 6);

    // Border - purple
    graphics.lineStyle(2, 0x8800ff, 1);
    graphics.strokeRoundedRect(offset, offset, squareSize, squareSize, 6);

    graphics.generateTexture(key, size, size);
    graphics.destroy();
}

/**
 * Create prismatic overlay - golden star with sparkle effect
 */
function createPrismaticOverlay(scene, key, size) {
    if (scene.textures.exists(key)) {
        scene.textures.remove(key);
    }

    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    const cx = size / 2;
    const cy = size / 2;

    // Shadow
    graphics.fillStyle(0x000000, 0.4);
    drawStar(graphics, cx + 2, cy + 2, size * 0.25, size * 0.12, 5);

    // Main star - bright yellow/white
    graphics.fillStyle(0xffff88, 1);
    drawStar(graphics, cx, cy, size * 0.25, size * 0.12, 5);

    // Border star
    graphics.lineStyle(2, 0xffaa00, 1);
    drawStarStroke(graphics, cx, cy, size * 0.25, size * 0.12, 5);

    graphics.generateTexture(key, size, size);
    graphics.destroy();
}

/**
 * Draw a simple star shape (filled)
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

/**
 * Draw a simple star shape (stroke only)
 */
function drawStarStroke(graphics, cx, cy, outerRadius, innerRadius, points) {
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
    graphics.strokePath();
}

/**
 * Create celestial overlay - divine blue/white diamond shape
 */
function createCelestialOverlay(scene, key, size) {
    if (scene.textures.exists(key)) {
        scene.textures.remove(key);
    }

    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    const cx = size / 2;
    const cy = size / 2;
    const diamondSize = size * 0.22;

    // Shadow
    graphics.fillStyle(0x000000, 0.4);
    drawDiamond(graphics, cx + 2, cy + 2, diamondSize);

    // Main diamond - bright white/blue
    graphics.fillStyle(0xaaddff, 1);
    drawDiamond(graphics, cx, cy, diamondSize);

    // Border - celestial blue
    graphics.lineStyle(2, 0x4488ff, 1);
    drawDiamondStroke(graphics, cx, cy, diamondSize);

    graphics.generateTexture(key, size, size);
    graphics.destroy();
}

/**
 * Draw a diamond shape (filled)
 */
function drawDiamond(graphics, cx, cy, size) {
    graphics.beginPath();
    graphics.moveTo(cx, cy - size);
    graphics.lineTo(cx + size, cy);
    graphics.lineTo(cx, cy + size);
    graphics.lineTo(cx - size, cy);
    graphics.closePath();
    graphics.fillPath();
}

/**
 * Draw a diamond shape (stroke only)
 */
function drawDiamondStroke(graphics, cx, cy, size) {
    graphics.beginPath();
    graphics.moveTo(cx, cy - size);
    graphics.lineTo(cx + size, cy);
    graphics.lineTo(cx, cy + size);
    graphics.lineTo(cx - size, cy);
    graphics.closePath();
    graphics.strokePath();
}
