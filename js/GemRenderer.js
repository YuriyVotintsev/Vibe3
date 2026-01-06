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
