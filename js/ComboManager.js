// ComboManager.js - Manages combo state (runtime only, not persisted)

import { PlayerData } from './config.js';
import { getComboGainBonus, getComboEffectMultiplier } from './data/prestige.js';

// Base decay rate: 25% per second
const BASE_DECAY_RATE = 0.25;
// Base combo effect: +20% income per combo
const BASE_COMBO_EFFECT = 0.2;

/**
 * Manages combo system:
 * - Float value internally, integer for display/calculations
 * - Decays 25% per second (reduced by comboDecayReduction upgrade)
 * - Match 3: +1, Match 4: +2, Match 5+: +3 (plus prestige bonus)
 * - Each combo point gives +20% income (multiplied by prestige effect)
 */
export class ComboManager {
    constructor() {
        this.comboFloat = 0;  // Internal float value
    }

    /**
     * Get the integer combo value for display and calculations
     */
    getCombo() {
        return Math.floor(this.comboFloat);
    }

    /**
     * Get the combo multiplier for income
     * Formula: 1 + (combo * effect_multiplier * BASE_COMBO_EFFECT)
     * At combo 10 with base effect: 1 + 10 * 1.0 * 0.2 = 3.0x
     */
    getMultiplier() {
        const combo = this.getCombo();
        if (combo <= 0) return 1;
        const effectMult = getComboEffectMultiplier();
        return 1 + combo * effectMult * BASE_COMBO_EFFECT;
    }

    /**
     * Add combo based on match size
     * @param {number} matchSize - Number of gems in match
     */
    addCombo(matchSize) {
        let gain = 1;  // Base: +1 for match 3
        if (matchSize === 4) gain = 2;
        else if (matchSize >= 5) gain = 3;

        // Add prestige bonus
        gain += getComboGainBonus();

        this.comboFloat += gain;
    }

    /**
     * Update combo decay each frame
     * @param {number} delta - Time since last frame in ms
     */
    update(delta) {
        if (this.comboFloat <= 0) return;

        // Calculate decay rate: base × 0.9^level (asymptotically approaches 0)
        const level = PlayerData.comboDecayReduction / 10;
        const decayRate = BASE_DECAY_RATE * Math.pow(0.9, level);

        // Decay per frame: rate * (delta / 1000)
        const decay = this.comboFloat * decayRate * (delta / 1000);
        this.comboFloat = Math.max(0, this.comboFloat - decay);
    }

    /**
     * Reset combo (on game restart)
     */
    reset() {
        this.comboFloat = 0;
    }
}
