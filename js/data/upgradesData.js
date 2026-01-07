// upgradesData.js - Upgrade definitions for UI
// Separates upgrade configuration from scene code

import { PlayerData } from './playerData.js';
import { ENHANCEMENT, isTierUnlocked } from './enhancements.js';
import {
    getAutoMoveUpgradeCost,
    upgradeAutoMove,
    getBombChanceUpgradeCost,
    upgradeBombChance,
    getBombRadiusUpgradeCost,
    upgradeBombRadius,
    getBronzeUpgradeCost,
    upgradeBronze,
    getSilverUpgradeCost,
    upgradeSilver,
    getGoldUpgradeCost,
    upgradeGold,
    getCrystalUpgradeCost,
    upgradeCrystal,
    getRainbowUpgradeCost,
    upgradeRainbow,
    getPrismaticUpgradeCost,
    upgradePrismatic,
    getCelestialUpgradeCost,
    upgradeCelestial
} from './upgrades.js';
import {
    getMoneyMultiplier,
    getUnlockedTiers,
    getBoardSize,
    getColorCount,
    getPrestigeMoneyMultCost,
    upgradePrestigeMoneyMult,
    getPrestigeTiersCost,
    upgradePrestigeTiers,
    getPrestigeColorsCost,
    upgradePrestigeColors,
    getPrestigeArenaCost,
    upgradePrestigeArena,
    AUTO_BUY_COST,
    buyAutoBuyAutoMove,
    buyAutoBuyBombChance,
    buyAutoBuyBombRadius,
    buyAutoBuyBronze,
    buyAutoBuySilver,
    buyAutoBuyGold,
    buyAutoBuyCrystal,
    buyAutoBuyRainbow,
    buyAutoBuyPrismatic,
    buyAutoBuyCelestial
} from './prestige.js';

/**
 * Get all regular upgrades for UpgradesScene
 * @returns {Array} Array of upgrade configurations
 */
export function getRegularUpgrades() {
    const upgrades = [];

    // Auto-move: 5000ms -> 100ms
    upgrades.push({
        getName: () => 'Авто-ход',
        getValue: () => `${(PlayerData.autoMoveDelay / 1000).toFixed(1)}с`,
        getLevel: () => {
            const current = Math.round((5000 - PlayerData.autoMoveDelay) / 100);
            return `${current}/49`;
        },
        getCost: () => PlayerData.autoMoveDelay <= 100 ? null : getAutoMoveUpgradeCost(),
        canAfford: () => PlayerData.autoMoveDelay > 100 && PlayerData.currency >= getAutoMoveUpgradeCost(),
        onBuy: () => upgradeAutoMove()
    });

    // Bomb chance: 10% -> 50%
    upgrades.push({
        getName: () => 'Шанс бомбы',
        getValue: () => `${PlayerData.bombChance}%`,
        getLevel: () => {
            const current = (PlayerData.bombChance - 10) / 5;
            return `${current}/8`;
        },
        getCost: () => PlayerData.bombChance >= 50 ? null : getBombChanceUpgradeCost(),
        canAfford: () => PlayerData.bombChance < 50 && PlayerData.currency >= getBombChanceUpgradeCost(),
        onBuy: () => upgradeBombChance()
    });

    // Bomb radius: 1 -> 3
    upgrades.push({
        getName: () => 'Радиус',
        getValue: () => `${PlayerData.bombRadius}`,
        getLevel: () => {
            const current = PlayerData.bombRadius - 1;
            return `${current}/2`;
        },
        getCost: () => PlayerData.bombRadius >= 3 ? null : getBombRadiusUpgradeCost(),
        canAfford: () => PlayerData.bombRadius < 3 && PlayerData.currency >= getBombRadiusUpgradeCost(),
        onBuy: () => upgradeBombRadius()
    });

    // Bronze: 5% -> 100%
    if (isTierUnlocked(ENHANCEMENT.BRONZE)) {
        upgrades.push({
            getName: () => 'Бронза',
            getValue: () => `${PlayerData.bronzeChance}%`,
            getLevel: () => {
                const current = (PlayerData.bronzeChance - 5) / 5;
                return `${current}/19`;
            },
            getCost: () => PlayerData.bronzeChance >= 100 ? null : getBronzeUpgradeCost(),
            canAfford: () => PlayerData.bronzeChance < 100 && PlayerData.currency >= getBronzeUpgradeCost(),
            onBuy: () => upgradeBronze()
        });
    }

    // Silver: 1% -> 100%
    if (isTierUnlocked(ENHANCEMENT.SILVER)) {
        upgrades.push({
            getName: () => 'Серебро',
            getValue: () => `${PlayerData.silverChance}%`,
            getLevel: () => {
                const current = Math.floor(PlayerData.silverChance / 4);
                return `${current}/25`;
            },
            getCost: () => PlayerData.silverChance >= 100 ? null : getSilverUpgradeCost(),
            canAfford: () => PlayerData.silverChance < 100 && PlayerData.currency >= getSilverUpgradeCost(),
            onBuy: () => upgradeSilver()
        });
    }

    // Gold: 0% -> 100%
    if (isTierUnlocked(ENHANCEMENT.GOLD)) {
        upgrades.push({
            getName: () => 'Золото',
            getValue: () => `${PlayerData.goldChance}%`,
            getLevel: () => {
                const current = Math.floor(PlayerData.goldChance / 3);
                return `${current}/34`;
            },
            getCost: () => PlayerData.goldChance >= 100 ? null : getGoldUpgradeCost(),
            canAfford: () => PlayerData.goldChance < 100 && PlayerData.currency >= getGoldUpgradeCost(),
            onBuy: () => upgradeGold()
        });
    }

    // Crystal: 0% -> 100%
    if (isTierUnlocked(ENHANCEMENT.CRYSTAL)) {
        upgrades.push({
            getName: () => 'Кристалл',
            getValue: () => `${PlayerData.crystalChance}%`,
            getLevel: () => {
                const current = Math.floor(PlayerData.crystalChance / 2);
                return `${current}/50`;
            },
            getCost: () => PlayerData.crystalChance >= 100 ? null : getCrystalUpgradeCost(),
            canAfford: () => PlayerData.crystalChance < 100 && PlayerData.currency >= getCrystalUpgradeCost(),
            onBuy: () => upgradeCrystal()
        });
    }

    // Rainbow: 0% -> 100%
    if (isTierUnlocked(ENHANCEMENT.RAINBOW)) {
        upgrades.push({
            getName: () => 'Радуга',
            getValue: () => `${PlayerData.rainbowChance}%`,
            getLevel: () => `${PlayerData.rainbowChance}/100`,
            getCost: () => PlayerData.rainbowChance >= 100 ? null : getRainbowUpgradeCost(),
            canAfford: () => PlayerData.rainbowChance < 100 && PlayerData.currency >= getRainbowUpgradeCost(),
            onBuy: () => upgradeRainbow()
        });
    }

    // Prismatic: 0% -> 100%
    if (isTierUnlocked(ENHANCEMENT.PRISMATIC)) {
        upgrades.push({
            getName: () => 'Призма',
            getValue: () => `${PlayerData.prismaticChance}%`,
            getLevel: () => `${PlayerData.prismaticChance}/100`,
            getCost: () => PlayerData.prismaticChance >= 100 ? null : getPrismaticUpgradeCost(),
            canAfford: () => PlayerData.prismaticChance < 100 && PlayerData.currency >= getPrismaticUpgradeCost(),
            onBuy: () => upgradePrismatic()
        });
    }

    // Celestial: 0% -> 100%
    if (isTierUnlocked(ENHANCEMENT.CELESTIAL)) {
        upgrades.push({
            getName: () => 'Небесный',
            getValue: () => `${PlayerData.celestialChance}%`,
            getLevel: () => `${PlayerData.celestialChance}/100`,
            getCost: () => PlayerData.celestialChance >= 100 ? null : getCelestialUpgradeCost(),
            canAfford: () => PlayerData.celestialChance < 100 && PlayerData.currency >= getCelestialUpgradeCost(),
            onBuy: () => upgradeCelestial()
        });
    }

    return upgrades;
}

/**
 * Get prestige upgrades for PrestigeScene
 * @returns {Array} Array of prestige upgrade configurations
 */
export function getPrestigeUpgrades() {
    return [
        {
            getName: () => 'Множитель',
            getValue: () => `x${getMoneyMultiplier()}`,
            getLevel: () => `${PlayerData.prestigeMoneyMult}/∞`,
            getCost: () => getPrestigeMoneyMultCost(),
            canAfford: () => PlayerData.prestigeCurrency >= getPrestigeMoneyMultCost(),
            onBuy: () => upgradePrestigeMoneyMult()
        },
        {
            getName: () => 'Тиры гемов',
            getValue: () => `${getUnlockedTiers()}/7`,
            getLevel: () => `${PlayerData.prestigeTiers}/4`,
            getCost: () => PlayerData.prestigeTiers >= 4 ? null : getPrestigeTiersCost(),
            canAfford: () => PlayerData.prestigeTiers < 4 && PlayerData.prestigeCurrency >= getPrestigeTiersCost(),
            onBuy: () => upgradePrestigeTiers()
        },
        {
            getName: () => 'Цветов',
            getValue: () => `${getColorCount()}`,
            getLevel: () => `${PlayerData.prestigeColors}/3`,
            getCost: () => PlayerData.prestigeColors >= 3 ? null : getPrestigeColorsCost(),
            canAfford: () => PlayerData.prestigeColors < 3 && PlayerData.prestigeCurrency >= getPrestigeColorsCost(),
            onBuy: () => upgradePrestigeColors()
        },
        {
            getName: () => 'Размер поля',
            getValue: () => `${getBoardSize()}x${getBoardSize()}`,
            getLevel: () => `${PlayerData.prestigeArena}/4`,
            getCost: () => PlayerData.prestigeArena >= 4 ? null : getPrestigeArenaCost(),
            canAfford: () => PlayerData.prestigeArena < 4 && PlayerData.prestigeCurrency >= getPrestigeArenaCost(),
            onBuy: () => upgradePrestigeArena()
        }
    ];
}

/**
 * Get auto-buy items for PrestigeScene
 * @returns {Array} Array of auto-buy configurations
 */
export function getAutoBuyItems() {
    return [
        { name: 'Авто-мув', key: 'autoBuyAutoMove', buy: buyAutoBuyAutoMove },
        { name: 'Шанс бомб', key: 'autoBuyBombChance', buy: buyAutoBuyBombChance },
        { name: 'Радиус', key: 'autoBuyBombRadius', buy: buyAutoBuyBombRadius },
        { name: 'Бронза', key: 'autoBuyBronze', buy: buyAutoBuyBronze },
        { name: 'Серебро', key: 'autoBuySilver', buy: buyAutoBuySilver },
        { name: 'Золото', key: 'autoBuyGold', buy: buyAutoBuyGold },
        { name: 'Кристалл', key: 'autoBuyCrystal', buy: buyAutoBuyCrystal },
        { name: 'Радуга', key: 'autoBuyRainbow', buy: buyAutoBuyRainbow },
        { name: 'Призма', key: 'autoBuyPrismatic', buy: buyAutoBuyPrismatic },
        { name: 'Небесный', key: 'autoBuyCelestial', buy: buyAutoBuyCelestial }
    ].map(item => ({
        ...item,
        isOwned: () => PlayerData[item.key],
        cost: AUTO_BUY_COST,
        canAfford: () => PlayerData.prestigeCurrency >= AUTO_BUY_COST
    }));
}
