// GemRenderer.js - Gem texture generation
import { ALL_GEM_COLORS } from './config.js';
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
 * Create the bomb texture
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {number} cellSize - Size of a cell
 */
export function createBombTexture(scene, cellSize) {
    if (scene.textures.exists('bomb')) {
        scene.textures.remove('bomb');
    }

    const size = cellSize - 8;
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    const cx = size / 2;
    const cy = size / 2;
    const bombRadius = size * 0.35;

    // Bomb body (dark circle)
    graphics.fillStyle(0x2c3e50, 1);
    graphics.fillCircle(cx, cy, bombRadius);

    // Bomb highlight
    graphics.fillStyle(0x34495e, 1);
    graphics.fillCircle(cx - bombRadius * 0.25, cy - bombRadius * 0.25, bombRadius * 0.5);

    // Fuse (top)
    graphics.lineStyle(3, 0x8b4513, 1);
    graphics.beginPath();
    graphics.moveTo(cx, cy - bombRadius);
    graphics.lineTo(cx + 4, cy - bombRadius - 8);
    graphics.strokePath();

    // Spark at fuse tip
    graphics.fillStyle(0xff6600, 1);
    graphics.fillCircle(cx + 4, cy - bombRadius - 10, 4);
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(cx + 4, cy - bombRadius - 10, 2);

    // "Danger" stripes
    graphics.fillStyle(0xe74c3c, 1);
    graphics.fillRect(cx - bombRadius * 0.5, cy - 2, bombRadius, 4);

    graphics.generateTexture('bomb', size, size);
    graphics.destroy();
}
