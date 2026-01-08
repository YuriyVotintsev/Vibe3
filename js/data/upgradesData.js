// upgradesData.js - Upgrade definitions for UI (ETC + Tell Don't Ask version)
// Generates upgrade objects from UPGRADE_CONFIGS - single source of truth

import { PlayerData } from './playerData.js';
import { isTierUnlocked, getUnlockedTiers } from './enhancements.js';
import { UPGRADE_CONFIGS, AUTO_BUY_KEYS, createUpgradeForUI } from './upgrades.js';
import {
    getMoneyMultiplier,
    getBoardSize,
    getColorCount,
    getPrestigeTiersCost,
    upgradePrestigeTiers,
    getPrestigeColorsCost,
    upgradePrestigeColors,
    getPrestigeArenaCost,
    upgradePrestigeArena,
    getStartingCapital,
    getStartingCapitalCost,
    upgradeStartingCapital,
    getCostReductionMultiplier,
    getCostReductionCost,
    upgradeCostReduction,
    getGrowthReductionAmount,
    getGrowthReductionCost,
    upgradeGrowthReduction,
    getComboGainBonus,
    getComboGainCost,
    upgradeComboGain,
    getComboEffectMultiplier,
    getComboEffectCost,
    upgradeComboEffect,
    getAutoBuyCost,
    buyAutoBuyAutoMove,
    buyAutoBuyBombChance,
    buyAutoBuyBombRadius,
    buyAutoBuyBronze,
    buyAutoBuySilver,
    buyAutoBuyGold,
    buyAutoBuyCrystal,
    buyAutoBuyRainbow,
    buyAutoBuyPrismatic,
    buyAutoBuyCelestial,
    buyAutoBuyComboDecay
} from './prestige.js';

// Order of upgrades in UI with separators
// 'separator' marks a visual gap between groups
const REGULAR_UPGRADE_ORDER = [
    'autoMove', 'comboDecay', 'bombChance', 'bombRadius',
    'separator',
    'bronze', 'silver', 'gold', 'crystal',
    'rainbow', 'prismatic', 'celestial'
];

/**
 * Get all regular upgrades for UpgradesScene
 * Uses factory function - no duplication of logic
 * Returns array with upgrade objects and 'separator' strings for visual gaps
 */
export function getRegularUpgrades() {
    const result = [];
    for (const key of REGULAR_UPGRADE_ORDER) {
        if (key === 'separator') {
            result.push('separator');
            continue;
        }
        const config = UPGRADE_CONFIGS[key];
        // Show if no enhancement required or tier is unlocked
        if (config.enhancement === null || isTierUnlocked(config.enhancement)) {
            result.push(createUpgradeForUI(key));
        }
    }
    return result;
}

// Starting capital values by level
const STARTING_CAPITAL_VALUES = [0, 100, 500, 2000];
// Cost reduction percentages by level
const COST_REDUCTION_VALUES = [0, 10, 20, 30];
// Growth reduction values by level
const GROWTH_REDUCTION_VALUES = [0, 1, 2, 3];
// Combo gain bonus by level
const COMBO_GAIN_VALUES = [0, 0.5, 1.0, 1.5];
// Combo effect multiplier by level
const COMBO_EFFECT_VALUES = [1.0, 1.25, 1.5, 1.75];
// Tiers unlocked by level
const TIERS_VALUES = [1, 2, 3, 5, 7];
// Colors by level
const COLORS_VALUES = [5, 8, 12, 20];
// Board size by level
const BOARD_SIZE_VALUES = [6, 7, 8, 9, 10];

/**
 * Get prestige upgrades for PrestigeScene
 * These have special logic so defined manually
 * Returns array with upgrade objects and 'separator' strings
 */
export function getPrestigeUpgrades() {
    const prestigeCurrency = () => PlayerData.prestigeCurrency;

    return [
        // Economy & Combo upgrades
        {
            getName: () => 'Старт. капитал',
            getValue: () => {
                const current = getStartingCapital();
                const level = PlayerData.prestigeStartingCapital;
                if (level >= 3) return `+${current}💰`;
                const next = STARTING_CAPITAL_VALUES[level + 1];
                return `+${current}💰 (→${next}💰)`;
            },
            getLevel: () => `${PlayerData.prestigeStartingCapital}/3`,
            getCost: () => getStartingCapitalCost(),
            canAfford() {
                const cost = this.getCost();
                return cost !== null && prestigeCurrency() >= cost;
            },
            onBuy: () => upgradeStartingCapital()
        },
        {
            getName: () => 'Скидка на цены',
            getValue: () => {
                const current = Math.round((1 - getCostReductionMultiplier()) * 100);
                const level = PlayerData.prestigeCostReduction;
                if (level >= 3) return `-${current}%`;
                const next = COST_REDUCTION_VALUES[level + 1];
                return `-${current}% (→${next}%)`;
            },
            getLevel: () => `${PlayerData.prestigeCostReduction}/3`,
            getCost: () => getCostReductionCost(),
            canAfford() {
                const cost = this.getCost();
                return cost !== null && prestigeCurrency() >= cost;
            },
            onBuy: () => upgradeCostReduction()
        },
        {
            getName: () => 'Рост цен↓',
            getValue: () => {
                const current = (getGrowthReductionAmount() * 100).toFixed(0);
                const level = PlayerData.prestigeGrowthReduction;
                if (level >= 3) return `-${current}%`;
                const next = GROWTH_REDUCTION_VALUES[level + 1];
                return `-${current}% (→${next}%)`;
            },
            getLevel: () => `${PlayerData.prestigeGrowthReduction}/3`,
            getCost: () => getGrowthReductionCost(),
            canAfford() {
                const cost = this.getCost();
                return cost !== null && prestigeCurrency() >= cost;
            },
            onBuy: () => upgradeGrowthReduction()
        },
        {
            getName: () => 'Комбо набор',
            getValue: () => {
                const current = getComboGainBonus().toFixed(1);
                const level = PlayerData.prestigeComboGain;
                if (level >= 3) return `+${current}`;
                const next = COMBO_GAIN_VALUES[level + 1].toFixed(1);
                return `+${current} (→+${next})`;
            },
            getLevel: () => `${PlayerData.prestigeComboGain}/3`,
            getCost: () => getComboGainCost(),
            canAfford() {
                const cost = this.getCost();
                return cost !== null && prestigeCurrency() >= cost;
            },
            onBuy: () => upgradeComboGain()
        },
        {
            getName: () => 'Сила комбо',
            getValue: () => {
                const current = getComboEffectMultiplier().toFixed(2);
                const level = PlayerData.prestigeComboEffect;
                if (level >= 3) return `×${current}`;
                const next = COMBO_EFFECT_VALUES[level + 1].toFixed(2);
                return `×${current} (→×${next})`;
            },
            getLevel: () => `${PlayerData.prestigeComboEffect}/3`,
            getCost: () => getComboEffectCost(),
            canAfford() {
                const cost = this.getCost();
                return cost !== null && prestigeCurrency() >= cost;
            },
            onBuy: () => upgradeComboEffect()
        },
        'separator',
        // Board & Gem upgrades
        {
            getName: () => 'Тиры гемов',
            getValue: () => {
                const current = getUnlockedTiers();
                const level = PlayerData.prestigeTiers;
                if (level >= 4) return `${current}/7`;
                const next = TIERS_VALUES[level + 1];
                return `${current}/7 (→${next}/7)`;
            },
            getLevel: () => `${PlayerData.prestigeTiers}/4`,
            getCost: () => PlayerData.prestigeTiers >= 4 ? null : getPrestigeTiersCost(),
            canAfford() {
                const cost = this.getCost();
                return cost !== null && prestigeCurrency() >= cost;
            },
            onBuy: () => upgradePrestigeTiers()
        },
        {
            getName: () => 'Кол-во цветов',
            getValue: () => {
                const current = getColorCount();
                const level = PlayerData.prestigeColors;
                if (level >= 3) return `${current} шт`;
                const next = COLORS_VALUES[level + 1];
                return `${current} шт (→${next} шт)`;
            },
            getLevel: () => `${PlayerData.prestigeColors}/3`,
            getCost: () => PlayerData.prestigeColors >= 3 ? null : getPrestigeColorsCost(),
            canAfford() {
                const cost = this.getCost();
                return cost !== null && prestigeCurrency() >= cost;
            },
            onBuy: () => upgradePrestigeColors()
        },
        {
            getName: () => 'Размер поля',
            getValue: () => {
                const current = getBoardSize();
                const level = PlayerData.prestigeArena;
                if (level >= 4) return `${current}×${current}`;
                const next = BOARD_SIZE_VALUES[level + 1];
                return `${current}×${current} (→${next}×${next})`;
            },
            getLevel: () => `${PlayerData.prestigeArena}/4`,
            getCost: () => PlayerData.prestigeArena >= 4 ? null : getPrestigeArenaCost(),
            canAfford() {
                const cost = this.getCost();
                return cost !== null && prestigeCurrency() >= cost;
            },
            onBuy: () => upgradePrestigeArena()
        }
    ];
}

// Auto-buy item definitions with buy functions
// 'separator' marks visual gap between groups
const AUTO_BUY_ITEMS = [
    { key: 'autoMove', name: 'Скорость', buy: buyAutoBuyAutoMove },
    { key: 'comboDecay', name: 'Стойк. комбо', buy: buyAutoBuyComboDecay },
    { key: 'bombChance', name: 'Шанс💣', buy: buyAutoBuyBombChance },
    { key: 'bombRadius', name: 'Радиус💣', buy: buyAutoBuyBombRadius },
    'separator',
    { key: 'bronze', name: '→бронза', buy: buyAutoBuyBronze },
    { key: 'silver', name: '→серебро', buy: buyAutoBuySilver },
    { key: 'gold', name: '→золото', buy: buyAutoBuyGold },
    { key: 'crystal', name: '→кристалл', buy: buyAutoBuyCrystal },
    { key: 'rainbow', name: '→радуга', buy: buyAutoBuyRainbow },
    { key: 'prismatic', name: '→призма', buy: buyAutoBuyPrismatic },
    { key: 'celestial', name: '→небесный', buy: buyAutoBuyCelestial }
];

/**
 * Get auto-buy items for PrestigeScene
 * Returns "Tell, Don't Ask" style objects and 'separator' strings
 * v3: Each auto-buy has different cost based on usefulness
 */
export function getAutoBuyItems() {
    const result = [];
    for (const item of AUTO_BUY_ITEMS) {
        if (item === 'separator') {
            result.push('separator');
            continue;
        }
        const autoBuyKey = AUTO_BUY_KEYS[item.key];
        const cost = getAutoBuyCost(autoBuyKey);
        result.push({
            key: item.key,
            name: item.name,
            cost: cost,
            isOwned: () => PlayerData[autoBuyKey],
            canAfford: () => !PlayerData[autoBuyKey] && PlayerData.prestigeCurrency >= cost,
            onBuy: item.buy
        });
    }
    return result;
}
