// GemRenderer.js - Gem texture generation (config-driven)

import { ALL_GEM_COLORS } from './config.js';
import { getCellSize } from './utils.js';
import { COLORS } from './styles.js';

// ========== OVERLAY CONFIGURATIONS ==========

const OVERLAY_CONFIGS = {
    bronze: {
        shape: 'roundedRect',
        fill: 0xcd7f32,
        border: 0x8b4513
    },
    silver: {
        shape: 'roundedRect',
        fill: 0xffffff,
        fillAlpha: 0.95,
        border: 0x888888
    },
    gold: {
        shape: 'roundedRect',
        fill: 0xffd700,
        border: 0xb8860b
    },
    crystal: {
        shape: 'roundedRect',
        fill: 0x00ffff,
        border: 0x008888
    },
    rainbow: {
        shape: 'roundedRect',
        fill: 0xff00ff,
        border: 0x8800ff
    },
    prismatic: {
        shape: 'star',
        fill: 0xffff88,
        border: 0xffaa00,
        points: 5
    },
    celestial: {
        shape: 'diamond',
        fill: 0xaaddff,
        border: 0x4488ff
    }
};

/**
 * Create all gem textures for the game
 */
export function createGemTextures(scene) {
    const cellSize = getCellSize();
    const size = cellSize - 8;
    const radius = 10;

    // Create gem textures for each color
    for (let i = 0; i < ALL_GEM_COLORS.length; i++) {
        createGemTexture(scene, `gem_${i}`, size, radius, ALL_GEM_COLORS[i]);
    }

    // Selection indicator
    createSelectionTexture(scene, cellSize);

    // Bomb
    createBombTexture(scene, cellSize);

    // Enhancement overlays (config-driven)
    for (const [key, config] of Object.entries(OVERLAY_CONFIGS)) {
        createOverlayTexture(scene, `overlay_${key}`, size, config);
    }
}

/**
 * Create a single gem texture
 */
function createGemTexture(scene, key, size, radius, color) {
    if (scene.textures.exists(key)) {
        scene.textures.remove(key);
    }

    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

    // Main body
    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(0, 0, size, size, radius);

    // Highlight
    graphics.fillStyle(COLORS.highlight, 0.3);
    graphics.fillRoundedRect(4, 4, size - 20, size - 20, radius - 2);

    // Shadow
    graphics.fillStyle(COLORS.shadow, 0.2);
    graphics.fillRoundedRect(8, size - 16, size - 16, 8, 4);

    graphics.generateTexture(key, size, size);
    graphics.destroy();
}

/**
 * Create selection indicator texture
 */
export function createSelectionTexture(scene, cellSize) {
    if (scene.textures.exists('selection')) {
        scene.textures.remove('selection');
    }

    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    graphics.lineStyle(4, COLORS.selection, 1);
    graphics.strokeRoundedRect(2, 2, cellSize - 4, cellSize - 4, 12);
    graphics.generateTexture('selection', cellSize, cellSize);
    graphics.destroy();
}

/**
 * Create bomb texture
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

    // Main body
    graphics.fillStyle(COLORS.bombBody, 1);
    graphics.fillRoundedRect(0, 0, size, size, radius);

    // Highlight
    graphics.fillStyle(COLORS.bombHighlight, 0.4);
    graphics.fillRoundedRect(4, 4, size - 20, size - 20, radius - 2);

    // Shadow
    graphics.fillStyle(COLORS.shadow, 0.3);
    graphics.fillRoundedRect(8, size - 16, size - 16, 8, 4);

    // Bomb circle
    const bombRadius = size * 0.28;
    graphics.fillStyle(COLORS.bombCircle, 1);
    graphics.fillCircle(cx, cy + 2, bombRadius);

    // Bomb shine
    graphics.fillStyle(COLORS.bombShine, 1);
    graphics.fillCircle(cx - bombRadius * 0.3, cy - bombRadius * 0.2, bombRadius * 0.35);

    // Fuse
    graphics.lineStyle(3, COLORS.bombFuse, 1);
    graphics.beginPath();
    graphics.moveTo(cx + bombRadius * 0.5, cy - bombRadius * 0.5);
    graphics.lineTo(cx + bombRadius * 0.9, cy - bombRadius * 1.1);
    graphics.strokePath();

    // Spark
    graphics.fillStyle(COLORS.bombSparkOuter, 1);
    graphics.fillCircle(cx + bombRadius * 0.9, cy - bombRadius * 1.2, 4);
    graphics.fillStyle(COLORS.bombSparkInner, 1);
    graphics.fillCircle(cx + bombRadius * 0.9, cy - bombRadius * 1.2, 2.5);

    graphics.generateTexture('bomb', size, size);
    graphics.destroy();
}

/**
 * Create overlay texture based on config
 */
function createOverlayTexture(scene, key, size, config) {
    if (scene.textures.exists(key)) {
        scene.textures.remove(key);
    }

    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    const cx = size / 2;
    const cy = size / 2;

    switch (config.shape) {
        case 'roundedRect':
            drawRoundedRectOverlay(graphics, size, config);
            break;
        case 'star':
            drawStarOverlay(graphics, cx, cy, size, config);
            break;
        case 'diamond':
            drawDiamondOverlay(graphics, cx, cy, size, config);
            break;
    }

    graphics.generateTexture(key, size, size);
    graphics.destroy();
}

/**
 * Draw rounded rectangle overlay (bronze, silver, gold, crystal, rainbow)
 */
function drawRoundedRectOverlay(graphics, size, config) {
    const squareSize = size * 0.4;
    const offset = (size - squareSize) / 2;
    const fillAlpha = config.fillAlpha || 1;

    // Shadow
    graphics.fillStyle(COLORS.shadow, 0.4);
    graphics.fillRoundedRect(offset + 2, offset + 2, squareSize, squareSize, 6);

    // Main
    graphics.fillStyle(config.fill, fillAlpha);
    graphics.fillRoundedRect(offset, offset, squareSize, squareSize, 6);

    // Border
    graphics.lineStyle(2, config.border, 1);
    graphics.strokeRoundedRect(offset, offset, squareSize, squareSize, 6);
}

/**
 * Draw star overlay (prismatic)
 */
function drawStarOverlay(graphics, cx, cy, size, config) {
    const outerRadius = size * 0.25;
    const innerRadius = size * 0.12;
    const points = config.points || 5;

    // Shadow
    graphics.fillStyle(COLORS.shadow, 0.4);
    drawStarPath(graphics, cx + 2, cy + 2, outerRadius, innerRadius, points, true);

    // Main
    graphics.fillStyle(config.fill, 1);
    drawStarPath(graphics, cx, cy, outerRadius, innerRadius, points, true);

    // Border
    graphics.lineStyle(2, config.border, 1);
    drawStarPath(graphics, cx, cy, outerRadius, innerRadius, points, false);
}

/**
 * Draw diamond overlay (celestial)
 */
function drawDiamondOverlay(graphics, cx, cy, size, config) {
    const diamondSize = size * 0.22;

    // Shadow
    graphics.fillStyle(COLORS.shadow, 0.4);
    drawDiamondPath(graphics, cx + 2, cy + 2, diamondSize, true);

    // Main
    graphics.fillStyle(config.fill, 1);
    drawDiamondPath(graphics, cx, cy, diamondSize, true);

    // Border
    graphics.lineStyle(2, config.border, 1);
    drawDiamondPath(graphics, cx, cy, diamondSize, false);
}

/**
 * Draw star path
 */
function drawStarPath(graphics, cx, cy, outerRadius, innerRadius, points, fill) {
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
    fill ? graphics.fillPath() : graphics.strokePath();
}

/**
 * Draw diamond path
 */
function drawDiamondPath(graphics, cx, cy, size, fill) {
    graphics.beginPath();
    graphics.moveTo(cx, cy - size);
    graphics.lineTo(cx + size, cy);
    graphics.lineTo(cx, cy + size);
    graphics.lineTo(cx - size, cy);
    graphics.closePath();
    fill ? graphics.fillPath() : graphics.strokePath();
}
