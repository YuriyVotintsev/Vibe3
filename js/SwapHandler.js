// SwapHandler.js - Handles gem selection and swapping (click and swipe)
import { GameSettings, SWAP_DURATION, GEM_STATE } from './config.js';
import { checkMatchAt } from './BoardLogic.js';

/**
 * Manages gem selection and swap operations:
 * - Click handling and selection state
 * - Swap animation with tween
 * - Match validation and swap reversal
 */
export class SwapHandler {
    /**
     * @param {Object} context - Reference to scene context
     */
    constructor(context) {
        this.ctx = context;
        this.selectedGem = null;

        // Swipe tracking
        this.dragStartGem = null;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.minSwipeDistance = 30; // minimum pixels to register as swipe
    }

    /**
     * Handle gem click - select or swap
     * @param {Phaser.Input.Pointer} pointer
     * @param {Phaser.GameObjects.Image} gem
     */
    onGemClick(pointer, gem) {
        if (gem.getData('state') !== GEM_STATE.IDLE) return;
        // Don't select bombs (they're handled separately)
        if (gem.getData('isBomb')) return;

        const { scene } = this.ctx;
        const row = gem.getData('row');
        const col = gem.getData('col');

        if (this.selectedGem === null) {
            this.selectedGem = { row, col, gem };
            const pos = scene.getGemPosition(row, col);
            scene.selectionIndicator.setPosition(pos.x, pos.y);
            scene.selectionIndicator.setVisible(true);

            scene.tweens.killTweensOf(scene.selectionIndicator);
            scene.tweens.add({
                targets: scene.selectionIndicator,
                scale: { from: 1, to: 1.1 },
                duration: 300,
                yoyo: true,
                repeat: -1
            });
        } else {
            const { row: prevRow, col: prevCol, gem: prevGem } = this.selectedGem;

            if (!prevGem || prevGem.getData('state') !== GEM_STATE.IDLE) {
                this.clearSelection();
                return;
            }

            if (this.areAdjacent(prevRow, prevCol, row, col)) {
                this.clearSelection();
                this.swapGems(prevRow, prevCol, row, col);
            } else {
                this.selectedGem = { row, col, gem };
                const pos = scene.getGemPosition(row, col);
                scene.selectionIndicator.setPosition(pos.x, pos.y);
            }
        }
    }

    /**
     * Clear current selection
     */
    clearSelection() {
        const { scene } = this.ctx;
        this.selectedGem = null;
        scene.selectionIndicator.setVisible(false);
        scene.tweens.killTweensOf(scene.selectionIndicator);
        scene.selectionIndicator.setScale(1);
    }

    /**
     * Handle pointer down on gem - start tracking for swipe
     * @param {Phaser.Input.Pointer} pointer
     * @param {Phaser.GameObjects.Image} gem
     */
    onGemPointerDown(pointer, gem) {
        if (gem.getData('state') !== GEM_STATE.IDLE) return;
        if (gem.getData('isBomb')) return;

        this.dragStartGem = gem;
        this.dragStartX = pointer.x;
        this.dragStartY = pointer.y;
    }

    /**
     * Handle pointer up - detect swipe or fall back to click
     * @param {Phaser.Input.Pointer} pointer
     */
    onPointerUp(pointer) {
        if (!this.dragStartGem) return;

        const gem = this.dragStartGem;
        const deltaX = pointer.x - this.dragStartX;
        const deltaY = pointer.y - this.dragStartY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Reset drag state
        this.dragStartGem = null;

        // Check if this was a swipe (moved enough distance)
        if (distance >= this.minSwipeDistance) {
            // Determine swipe direction
            const row = gem.getData('row');
            const col = gem.getData('col');

            let targetRow = row;
            let targetCol = col;

            // Determine dominant direction
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                targetCol = deltaX > 0 ? col + 1 : col - 1;
            } else {
                // Vertical swipe
                targetRow = deltaY > 0 ? row + 1 : row - 1;
            }

            // Check bounds
            const boardSize = GameSettings.boardSize;
            if (targetRow >= 0 && targetRow < boardSize &&
                targetCol >= 0 && targetCol < boardSize) {
                // Clear any existing selection and perform swipe swap
                this.clearSelection();
                this.swapGems(row, col, targetRow, targetCol);
                return;
            }
        }

        // If not a valid swipe, treat as click
        this.onGemClick(pointer, gem);
    }

    /**
     * Check if two positions are adjacent
     */
    areAdjacent(row1, col1, row2, col2) {
        const rowDiff = Math.abs(row1 - row2);
        const colDiff = Math.abs(col1 - col2);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    /**
     * Perform gem swap with animation
     */
    swapGems(row1, col1, row2, col2) {
        const { scene, board, gems, pendingMatches } = this.ctx;
        const gem1 = gems[row1][col1];
        const gem2 = gems[row2][col2];
        const wasAutoMove = scene.isAutoMoving;

        if (!gem1 || !gem2) return;
        if (gem1.getData('state') !== GEM_STATE.IDLE) return;
        if (gem2.getData('state') !== GEM_STATE.IDLE) return;
        // Can't swap bombs
        if (gem1.getData('isBomb') || gem2.getData('isBomb')) return;

        gem1.setData('state', GEM_STATE.SWAPPING);
        gem2.setData('state', GEM_STATE.SWAPPING);

        const pos1 = scene.getGemPosition(row1, col1);
        const pos2 = scene.getGemPosition(row2, col2);

        // Swap in data structures
        [board[row1][col1], board[row2][col2]] = [board[row2][col2], board[row1][col1]];
        [gems[row1][col1], gems[row2][col2]] = [gems[row2][col2], gems[row1][col1]];

        gem1.setData('row', row2);
        gem1.setData('col', col2);
        gem2.setData('row', row1);
        gem2.setData('col', col1);

        // Check match IMMEDIATELY after board swap (before animation)
        // This prevents issues where board changes during animation
        const boardSize = GameSettings.boardSize;
        const willMatch = checkMatchAt(board, row1, col1, boardSize) ||
                          checkMatchAt(board, row2, col2, boardSize);

        // Animate gem1
        scene.tweens.add({
            targets: gem1,
            x: pos2.x,
            y: pos2.y,
            duration: SWAP_DURATION,
            ease: 'Power2'
        });

        // Animate gem2 and use pre-calculated match result
        scene.tweens.add({
            targets: gem2,
            x: pos1.x,
            y: pos1.y,
            duration: SWAP_DURATION,
            ease: 'Power2',
            onComplete: () => {
                gem1.setData('state', GEM_STATE.IDLE);
                gem2.setData('state', GEM_STATE.IDLE);
                gem1.setData('targetY', pos2.y);
                gem2.setData('targetY', pos1.y);

                if (willMatch) {
                    scene.isAutoMoving = false;

                    // Mark if this was a manual move (for bomb spawning)
                    scene.lastMatchWasManual = !wasAutoMove;

                    pendingMatches.push({ row: row2, col: col2 });
                    pendingMatches.push({ row: row1, col: col1 });
                } else {
                    // No match - reverse the swap
                    this.reverseSwap(gem1, gem2, row1, col1, row2, col2, pos1, pos2, wasAutoMove);
                }
            }
        });
    }

    /**
     * Reverse a swap that didn't create a match
     */
    reverseSwap(gem1, gem2, row1, col1, row2, col2, pos1, pos2, wasAutoMove) {
        const { scene, board, gems } = this.ctx;

        gem1.setData('state', GEM_STATE.SWAPPING);
        gem2.setData('state', GEM_STATE.SWAPPING);

        [board[row1][col1], board[row2][col2]] = [board[row2][col2], board[row1][col1]];
        [gems[row1][col1], gems[row2][col2]] = [gems[row2][col2], gems[row1][col1]];

        gem1.setData('row', row1);
        gem1.setData('col', col1);
        gem2.setData('row', row2);
        gem2.setData('col', col2);

        scene.tweens.add({
            targets: gem1,
            x: pos1.x,
            y: pos1.y,
            duration: SWAP_DURATION,
            ease: 'Power2'
        });

        scene.tweens.add({
            targets: gem2,
            x: pos2.x,
            y: pos2.y,
            duration: SWAP_DURATION,
            ease: 'Power2',
            onComplete: () => {
                gem1.setData('state', GEM_STATE.IDLE);
                gem2.setData('state', GEM_STATE.IDLE);
                gem1.setData('targetY', pos1.y);
                gem2.setData('targetY', pos2.y);
                scene.isAutoMoving = false;
            }
        });

        if (!wasAutoMove) {
            scene.showMessage('Нет совпадений!');
        }
        scene.isAutoMoving = false;
    }
}
