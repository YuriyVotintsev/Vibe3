// upgrades.js - Regular upgrades logic

import { PlayerData, savePlayerData } from './playerData.js';
import { GameSettings } from './gameSettings.js';

// ========== BRONZE UPGRADE ==========
// 5% -> 100%, +5% per upgrade = 19 upgrades

export function getBronzeLevel() {
    return (PlayerData.bronzeChance - 5) / 5;
}

export function getBronzeUpgradeCost() {
    const level = getBronzeLevel();
    return Math.floor(100 * Math.pow(1.15, level) * GameSettings.priceMultiplier);
}

export function upgradeBronze() {
    const cost = getBronzeUpgradeCost();
    if (PlayerData.currency >= cost && PlayerData.bronzeChance < 100) {
        PlayerData.currency -= cost;
        PlayerData.bronzeChance += 5;
        savePlayerData();
        return true;
    }
    return false;
}

// ========== SILVER UPGRADE ==========
// 1% -> 100%, +4% per upgrade = 25 upgrades

export function getSilverLevel() {
    return Math.floor((PlayerData.silverChance - 1) / 4);
}

export function getSilverUpgradeCost() {
    const level = getSilverLevel();
    return Math.floor(150 * Math.pow(1.18, level) * GameSettings.priceMultiplier);
}

export function upgradeSilver() {
    const cost = getSilverUpgradeCost();
    if (PlayerData.currency >= cost && PlayerData.silverChance < 100) {
        PlayerData.currency -= cost;
        PlayerData.silverChance = Math.min(100, PlayerData.silverChance + 4);
        savePlayerData();
        return true;
    }
    return false;
}

// ========== GOLD UPGRADE ==========
// 0% -> 100%, +3% per upgrade = 34 upgrades

export function getGoldLevel() {
    return Math.floor(PlayerData.goldChance / 3);
}

export function getGoldUpgradeCost() {
    const level = getGoldLevel();
    return Math.floor(250 * Math.pow(1.20, level) * GameSettings.priceMultiplier);
}

export function upgradeGold() {
    const cost = getGoldUpgradeCost();
    if (PlayerData.currency >= cost && PlayerData.goldChance < 100) {
        PlayerData.currency -= cost;
        PlayerData.goldChance = Math.min(100, PlayerData.goldChance + 3);
        savePlayerData();
        return true;
    }
    return false;
}

// ========== CRYSTAL UPGRADE ==========
// 0% -> 100%, +2% per upgrade = 50 upgrades

export function getCrystalLevel() {
    return Math.floor(PlayerData.crystalChance / 2);
}

export function getCrystalUpgradeCost() {
    const level = getCrystalLevel();
    return Math.floor(500 * Math.pow(1.22, level) * GameSettings.priceMultiplier);
}

export function upgradeCrystal() {
    const cost = getCrystalUpgradeCost();
    if (PlayerData.currency >= cost && PlayerData.crystalChance < 100) {
        PlayerData.currency -= cost;
        PlayerData.crystalChance = Math.min(100, PlayerData.crystalChance + 2);
        savePlayerData();
        return true;
    }
    return false;
}

// ========== RAINBOW UPGRADE ==========
// 0% -> 100%, +1% per upgrade = 100 upgrades

export function getRainbowLevel() {
    return PlayerData.rainbowChance;
}

export function getRainbowUpgradeCost() {
    const level = getRainbowLevel();
    return Math.floor(1000 * Math.pow(1.25, level) * GameSettings.priceMultiplier);
}

export function upgradeRainbow() {
    const cost = getRainbowUpgradeCost();
    if (PlayerData.currency >= cost && PlayerData.rainbowChance < 100) {
        PlayerData.currency -= cost;
        PlayerData.rainbowChance = Math.min(100, PlayerData.rainbowChance + 1);
        savePlayerData();
        return true;
    }
    return false;
}

// ========== PRISMATIC UPGRADE ==========
// 0% -> 100%, +1% per upgrade = 100 upgrades

export function getPrismaticLevel() {
    return PlayerData.prismaticChance;
}

export function getPrismaticUpgradeCost() {
    const level = getPrismaticLevel();
    return Math.floor(2500 * Math.pow(1.28, level) * GameSettings.priceMultiplier);
}

export function upgradePrismatic() {
    const cost = getPrismaticUpgradeCost();
    if (PlayerData.currency >= cost && PlayerData.prismaticChance < 100) {
        PlayerData.currency -= cost;
        PlayerData.prismaticChance = Math.min(100, PlayerData.prismaticChance + 1);
        savePlayerData();
        return true;
    }
    return false;
}

// ========== CELESTIAL UPGRADE ==========
// 0% -> 100%, +1% per upgrade = 100 upgrades

export function getCelestialLevel() {
    return PlayerData.celestialChance;
}

export function getCelestialUpgradeCost() {
    const level = getCelestialLevel();
    return Math.floor(5000 * Math.pow(1.30, level) * GameSettings.priceMultiplier);
}

export function upgradeCelestial() {
    const cost = getCelestialUpgradeCost();
    if (PlayerData.currency >= cost && PlayerData.celestialChance < 100) {
        PlayerData.currency -= cost;
        PlayerData.celestialChance = Math.min(100, PlayerData.celestialChance + 1);
        savePlayerData();
        return true;
    }
    return false;
}

// ========== AUTO-MOVE UPGRADE ==========
// 5000ms -> 100ms

export function getAutoMoveLevel() {
    if (PlayerData.autoMoveDelay >= 500) {
        return Math.round((5000 - PlayerData.autoMoveDelay) / 500);
    } else {
        // After 0.5s, levels continue with 0.1s steps
        return 9 + Math.round((500 - PlayerData.autoMoveDelay) / 100);
    }
}

export function getAutoMoveUpgradeCost() {
    const level = getAutoMoveLevel();
    return Math.floor(500 * Math.pow(2.0, level) * GameSettings.priceMultiplier);
}

export function getAutoMoveStep() {
    // 0.5s steps until 0.5s, then 0.1s steps
    return PlayerData.autoMoveDelay > 500 ? 500 : 100;
}

export function upgradeAutoMove() {
    const cost = getAutoMoveUpgradeCost();
    const step = getAutoMoveStep();
    if (PlayerData.currency >= cost && PlayerData.autoMoveDelay > 100) {
        PlayerData.currency -= cost;
        PlayerData.autoMoveDelay -= step;
        savePlayerData();
        return true;
    }
    return false;
}

// ========== BOMB CHANCE UPGRADE ==========
// 10% -> 50%, +5% per upgrade = 8 upgrades

export function getBombChanceLevel() {
    return (PlayerData.bombChance - 10) / 5;
}

export function getBombChanceUpgradeCost() {
    const level = getBombChanceLevel();
    return Math.floor(600 * Math.pow(1.8, level) * GameSettings.priceMultiplier);
}

export function upgradeBombChance() {
    const cost = getBombChanceUpgradeCost();
    if (PlayerData.currency >= cost && PlayerData.bombChance < 50) {
        PlayerData.currency -= cost;
        PlayerData.bombChance += 5;
        savePlayerData();
        return true;
    }
    return false;
}

// ========== BOMB RADIUS UPGRADE ==========
// 1 -> 3, max 3 = 2 upgrades

export function getBombRadiusLevel() {
    return PlayerData.bombRadius - 1;
}

export function getBombRadiusUpgradeCost() {
    const level = getBombRadiusLevel();
    return Math.floor(1500 * Math.pow(3.0, level) * GameSettings.priceMultiplier);
}

export function upgradeBombRadius() {
    const cost = getBombRadiusUpgradeCost();
    if (PlayerData.currency >= cost && PlayerData.bombRadius < 3) {
        PlayerData.currency -= cost;
        PlayerData.bombRadius += 1;
        savePlayerData();
        return true;
    }
    return false;
}

// ========== AUTO-BUY PROCESSOR ==========

// Process all auto-buys (call this periodically)
export function processAutoBuys() {
    let purchased = false;

    if (PlayerData.autoBuyAutoMove && PlayerData.autoMoveDelay > 100) {
        if (PlayerData.currency >= getAutoMoveUpgradeCost()) {
            upgradeAutoMove();
            purchased = true;
        }
    }

    if (PlayerData.autoBuyBombChance && PlayerData.bombChance < 50) {
        if (PlayerData.currency >= getBombChanceUpgradeCost()) {
            upgradeBombChance();
            purchased = true;
        }
    }

    if (PlayerData.autoBuyBombRadius && PlayerData.bombRadius < 3) {
        if (PlayerData.currency >= getBombRadiusUpgradeCost()) {
            upgradeBombRadius();
            purchased = true;
        }
    }

    if (PlayerData.autoBuyBronze && PlayerData.bronzeChance < 100) {
        if (PlayerData.currency >= getBronzeUpgradeCost()) {
            upgradeBronze();
            purchased = true;
        }
    }

    if (PlayerData.autoBuySilver && PlayerData.silverChance < 100) {
        if (PlayerData.currency >= getSilverUpgradeCost()) {
            upgradeSilver();
            purchased = true;
        }
    }

    if (PlayerData.autoBuyGold && PlayerData.goldChance < 100) {
        if (PlayerData.currency >= getGoldUpgradeCost()) {
            upgradeGold();
            purchased = true;
        }
    }

    if (PlayerData.autoBuyCrystal && PlayerData.crystalChance < 100) {
        if (PlayerData.currency >= getCrystalUpgradeCost()) {
            upgradeCrystal();
            purchased = true;
        }
    }

    if (PlayerData.autoBuyRainbow && PlayerData.rainbowChance < 100) {
        if (PlayerData.currency >= getRainbowUpgradeCost()) {
            upgradeRainbow();
            purchased = true;
        }
    }

    if (PlayerData.autoBuyPrismatic && PlayerData.prismaticChance < 100) {
        if (PlayerData.currency >= getPrismaticUpgradeCost()) {
            upgradePrismatic();
            purchased = true;
        }
    }

    if (PlayerData.autoBuyCelestial && PlayerData.celestialChance < 100) {
        if (PlayerData.currency >= getCelestialUpgradeCost()) {
            upgradeCelestial();
            purchased = true;
        }
    }

    return purchased;
}
