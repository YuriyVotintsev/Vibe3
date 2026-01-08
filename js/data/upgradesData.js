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

// Starting capital values by level (нелинейные, нужен массив)
const STARTING_CAPITAL_VALUES = [0, 100, 500, 2000];

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
                const nextMult = Math.pow(0.9, PlayerData.prestigeCostReduction + 1);
                const next = Math.round((1 - nextMult) * 100);
                return `-${current}% (→${next}%)`;
            },
            getLevel: () => `${PlayerData.prestigeCostReduction}/∞`,
            getCost: () => getCostReductionCost(),
            canAfford() {
                const cost = this.getCost();
                return cost !== null && prestigeCurrency() >= cost;
            },
            onBuy: () => upgradeCostReduction()
        },
        {
            getName: () => 'Рост на шанс гемов',
            getValue: () => {
                const current = getGrowthReductionAmount().toFixed(2);
                const level = PlayerData.prestigeGrowthReduction;
                if (level >= 3) return `-${current}`;
                const next = ((level + 1) * 0.01).toFixed(2);
                return `-${current} (→-${next})`;
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
                const next = ((level + 1) * 0.5).toFixed(1);
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
                const nextMult = Math.pow(1.1, PlayerData.prestigeComboEffect + 1);
                const next = nextMult.toFixed(2);
                return `×${current} (→×${next})`;
            },
            getLevel: () => `${PlayerData.prestigeComboEffect}/∞`,
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
                if (level >= 4) return `${current}`;
                const next = current + 1; // 3 + level → 3 + level + 1
                return `${current} (→${next})`;
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
                if (level >= 3) return `${current}`;
                const next = current - 1; // 6 - level → 6 - level - 1
                return `${current} (→${next})`;
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
                const next = current + 1;
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
// Names are taken from UPGRADE_CONFIGS to match regular upgrades
const AUTO_BUY_ITEMS = [
    { key: 'autoMove', buy: buyAutoBuyAutoMove },
    { key: 'comboDecay', buy: buyAutoBuyComboDecay },
    { key: 'bombChance', buy: buyAutoBuyBombChance },
    { key: 'bombRadius', buy: buyAutoBuyBombRadius },
    'separator',
    { key: 'bronze', buy: buyAutoBuyBronze },
    { key: 'silver', buy: buyAutoBuySilver },
    { key: 'gold', buy: buyAutoBuyGold },
    { key: 'crystal', buy: buyAutoBuyCrystal },
    { key: 'rainbow', buy: buyAutoBuyRainbow },
    { key: 'prismatic', buy: buyAutoBuyPrismatic },
    { key: 'celestial', buy: buyAutoBuyCelestial }
];

/**
 * Get auto-buy items for PrestigeScene
 * Returns "Tell, Don't Ask" style objects and 'separator' strings
 * Names match regular upgrades from UPGRADE_CONFIGS
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
        // Get name from UPGRADE_CONFIGS to match regular upgrades
        const name = UPGRADE_CONFIGS[item.key].name;
        result.push({
            key: item.key,
            name: name,
            cost: cost,
            isOwned: () => PlayerData[autoBuyKey],
            canAfford: () => !PlayerData[autoBuyKey] && PlayerData.prestigeCurrency >= cost,
            onBuy: item.buy
        });
    }
    return result;
}
