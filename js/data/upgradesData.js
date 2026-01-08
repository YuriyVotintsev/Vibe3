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

// Order of upgrades in UI
const REGULAR_UPGRADE_ORDER = [
    'autoMove', 'comboDecay', 'bombChance', 'bombRadius',
    'bronze', 'silver', 'gold', 'crystal',
    'rainbow', 'prismatic', 'celestial'
];

/**
 * Get all regular upgrades for UpgradesScene
 * Uses factory function - no duplication of logic
 */
export function getRegularUpgrades() {
    return REGULAR_UPGRADE_ORDER
        .filter(key => {
            const config = UPGRADE_CONFIGS[key];
            // Show if no enhancement required or tier is unlocked
            return config.enhancement === null || isTierUnlocked(config.enhancement);
        })
        .map(key => createUpgradeForUI(key));
}

/**
 * Get prestige upgrades for PrestigeScene
 * These have special logic so defined manually
 */
export function getPrestigeUpgrades() {
    const prestigeCurrency = () => PlayerData.prestigeCurrency;

    return [
        // New early-game upgrades first
        {
            getName: () => 'Капитал',
            getValue: () => `+${getStartingCapital()}`,
            getLevel: () => `${PlayerData.prestigeStartingCapital}/3`,
            getCost: () => getStartingCapitalCost(),
            canAfford() {
                const cost = this.getCost();
                return cost !== null && prestigeCurrency() >= cost;
            },
            onBuy: () => upgradeStartingCapital()
        },
        {
            getName: () => 'Скидка',
            getValue: () => `-${Math.round((1 - getCostReductionMultiplier()) * 100)}%`,
            getLevel: () => `${PlayerData.prestigeCostReduction}/3`,
            getCost: () => getCostReductionCost(),
            canAfford() {
                const cost = this.getCost();
                return cost !== null && prestigeCurrency() >= cost;
            },
            onBuy: () => upgradeCostReduction()
        },
        {
            getName: () => 'Рост цен',
            getValue: () => `-${(getGrowthReductionAmount() * 100).toFixed(0)}%`,
            getLevel: () => `${PlayerData.prestigeGrowthReduction}/3`,
            getCost: () => getGrowthReductionCost(),
            canAfford() {
                const cost = this.getCost();
                return cost !== null && prestigeCurrency() >= cost;
            },
            onBuy: () => upgradeGrowthReduction()
        },
        // Combo upgrades
        {
            getName: () => 'Комбо+',
            getValue: () => `+${getComboGainBonus().toFixed(1)}`,
            getLevel: () => `${PlayerData.prestigeComboGain}/3`,
            getCost: () => getComboGainCost(),
            canAfford() {
                const cost = this.getCost();
                return cost !== null && prestigeCurrency() >= cost;
            },
            onBuy: () => upgradeComboGain()
        },
        {
            getName: () => 'Комбо×',
            getValue: () => `×${getComboEffectMultiplier().toFixed(2)}`,
            getLevel: () => `${PlayerData.prestigeComboEffect}/3`,
            getCost: () => getComboEffectCost(),
            canAfford() {
                const cost = this.getCost();
                return cost !== null && prestigeCurrency() >= cost;
            },
            onBuy: () => upgradeComboEffect()
        },
        // Original upgrades
        {
            getName: () => 'Тиры',
            getValue: () => `${getUnlockedTiers()}/7`,
            getLevel: () => `${PlayerData.prestigeTiers}/4`,
            getCost: () => PlayerData.prestigeTiers >= 4 ? null : getPrestigeTiersCost(),
            canAfford() {
                const cost = this.getCost();
                return cost !== null && prestigeCurrency() >= cost;
            },
            onBuy: () => upgradePrestigeTiers()
        },
        {
            getName: () => 'Цветов',
            getValue: () => `${getColorCount()}`,
            getLevel: () => `${PlayerData.prestigeColors}/3`,
            getCost: () => PlayerData.prestigeColors >= 3 ? null : getPrestigeColorsCost(),
            canAfford() {
                const cost = this.getCost();
                return cost !== null && prestigeCurrency() >= cost;
            },
            onBuy: () => upgradePrestigeColors()
        },
        {
            getName: () => 'Поле',
            getValue: () => `${getBoardSize()}x${getBoardSize()}`,
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
const AUTO_BUY_ITEMS = [
    { key: 'autoMove', name: 'Авто-мув', buy: buyAutoBuyAutoMove },
    { key: 'bombChance', name: 'Шанс бомб', buy: buyAutoBuyBombChance },
    { key: 'bombRadius', name: 'Радиус', buy: buyAutoBuyBombRadius },
    { key: 'bronze', name: 'Бронза', buy: buyAutoBuyBronze },
    { key: 'silver', name: 'Серебро', buy: buyAutoBuySilver },
    { key: 'gold', name: 'Золото', buy: buyAutoBuyGold },
    { key: 'crystal', name: 'Кристалл', buy: buyAutoBuyCrystal },
    { key: 'rainbow', name: 'Радуга', buy: buyAutoBuyRainbow },
    { key: 'prismatic', name: 'Призма', buy: buyAutoBuyPrismatic },
    { key: 'celestial', name: 'Небесный', buy: buyAutoBuyCelestial },
    { key: 'comboDecay', name: 'Комбо', buy: buyAutoBuyComboDecay }
];

/**
 * Get auto-buy items for PrestigeScene
 * Returns "Tell, Don't Ask" style objects
 * v3: Each auto-buy has different cost based on usefulness
 */
export function getAutoBuyItems() {
    return AUTO_BUY_ITEMS.map(item => {
        const autoBuyKey = AUTO_BUY_KEYS[item.key];
        const cost = getAutoBuyCost(autoBuyKey);
        return {
            key: item.key,
            name: item.name,
            cost: cost,  // v3: variable cost per item
            // Tell, Don't Ask methods
            isOwned: () => PlayerData[autoBuyKey],
            canAfford: () => !PlayerData[autoBuyKey] && PlayerData.prestigeCurrency >= cost,
            onBuy: item.buy
        };
    });
}
