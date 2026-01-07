// enhancements.js - Gem enhancement types and logic

import { PlayerData } from './playerData.js';

// Enhanced gem types (7 tiers total)
export const ENHANCEMENT = {
    NONE: 'none',
    BRONZE: 'bronze',
    SILVER: 'silver',
    GOLD: 'gold',
    CRYSTAL: 'crystal',
    RAINBOW: 'rainbow',
    PRISMATIC: 'prismatic',
    CELESTIAL: 'celestial'
};

// Tier index for unlock checking (0-based)
export const ENHANCEMENT_TIER = {
    [ENHANCEMENT.BRONZE]: 0,
    [ENHANCEMENT.SILVER]: 1,
    [ENHANCEMENT.GOLD]: 2,
    [ENHANCEMENT.CRYSTAL]: 3,
    [ENHANCEMENT.RAINBOW]: 4,
    [ENHANCEMENT.PRISMATIC]: 5,
    [ENHANCEMENT.CELESTIAL]: 6
};

// Multipliers for each enhancement tier
export const ENHANCEMENT_MULTIPLIERS = {
    [ENHANCEMENT.NONE]: 1,
    [ENHANCEMENT.BRONZE]: 2,
    [ENHANCEMENT.SILVER]: 5,
    [ENHANCEMENT.GOLD]: 15,
    [ENHANCEMENT.CRYSTAL]: 50,
    [ENHANCEMENT.RAINBOW]: 200,
    [ENHANCEMENT.PRISMATIC]: 1000,
    [ENHANCEMENT.CELESTIAL]: 5000
};

// Display names for enhancements
export const ENHANCEMENT_NAMES = {
    [ENHANCEMENT.BRONZE]: 'Бронзовый',
    [ENHANCEMENT.SILVER]: 'Серебряный',
    [ENHANCEMENT.GOLD]: 'Золотой',
    [ENHANCEMENT.CRYSTAL]: 'Кристальный',
    [ENHANCEMENT.RAINBOW]: 'Радужный',
    [ENHANCEMENT.PRISMATIC]: 'Призматический',
    [ENHANCEMENT.CELESTIAL]: 'Небесный'
};

// Get number of unlocked tiers (3 base + prestigeTiers upgrades, max 7)
export function getUnlockedTiers() {
    return Math.min(7, 3 + PlayerData.prestigeTiers);
}

// Check if a tier is unlocked
export function isTierUnlocked(tier) {
    return ENHANCEMENT_TIER[tier] < getUnlockedTiers();
}

// Roll for gem enhancement when spawning (CASCADING system)
// Each tier can only upgrade from the previous tier
// e.g., if bronze=50%, silver=50%, actual silver chance = 25% (50% * 50%)
export function rollEnhancement() {
    const unlockedTiers = getUnlockedTiers();

    // Roll for bronze (tier 0) - from normal gem
    if (unlockedTiers < 1 || Phaser.Math.Between(1, 100) > PlayerData.bronzeChance) {
        return ENHANCEMENT.NONE;
    }

    // Got bronze! Roll for silver upgrade (tier 1)
    if (unlockedTiers < 2 || PlayerData.silverChance <= 0 || Phaser.Math.Between(1, 100) > PlayerData.silverChance) {
        return ENHANCEMENT.BRONZE;
    }

    // Got silver! Roll for gold upgrade (tier 2)
    if (unlockedTiers < 3 || PlayerData.goldChance <= 0 || Phaser.Math.Between(1, 100) > PlayerData.goldChance) {
        return ENHANCEMENT.SILVER;
    }

    // Got gold! Roll for crystal upgrade (tier 3)
    if (unlockedTiers < 4 || PlayerData.crystalChance <= 0 || Phaser.Math.Between(1, 100) > PlayerData.crystalChance) {
        return ENHANCEMENT.GOLD;
    }

    // Got crystal! Roll for rainbow upgrade (tier 4)
    if (unlockedTiers < 5 || PlayerData.rainbowChance <= 0 || Phaser.Math.Between(1, 100) > PlayerData.rainbowChance) {
        return ENHANCEMENT.CRYSTAL;
    }

    // Got rainbow! Roll for prismatic upgrade (tier 5)
    if (unlockedTiers < 6 || PlayerData.prismaticChance <= 0 || Phaser.Math.Between(1, 100) > PlayerData.prismaticChance) {
        return ENHANCEMENT.RAINBOW;
    }

    // Got prismatic! Roll for celestial upgrade (tier 6)
    if (unlockedTiers < 7 || PlayerData.celestialChance <= 0 || Phaser.Math.Between(1, 100) > PlayerData.celestialChance) {
        return ENHANCEMENT.PRISMATIC;
    }

    // Got celestial!
    return ENHANCEMENT.CELESTIAL;
}
