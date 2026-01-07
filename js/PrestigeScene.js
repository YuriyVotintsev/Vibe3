import {
    PlayerData,
    getPrestigeCoinsFromCurrency,
    getProgressToNextCoin,
    getMoneyMultiplier,
    getBoardSize,
    getColorCount,
    getUnlockedTiers,
    getPrestigeMoneyMultCost,
    upgradePrestigeMoneyMult,
    getPrestigeTiersCost,
    upgradePrestigeTiers,
    getPrestigeColorsCost,
    upgradePrestigeColors,
    getPrestigeArenaCost,
    upgradePrestigeArena,
    performPrestige
} from './config.js';

export class PrestigeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PrestigeScene' });
    }

    create() {
        console.log('[PrestigeScene] create() START');
        try {
            const W = this.cameras.main.width;
            const H = this.cameras.main.height;
            const cx = W / 2;
            console.log('[PrestigeScene] dimensions:', W, H);

            // Dark overlay
            this.add.rectangle(cx, H / 2, W, H, 0x000000, 0.9);
            console.log('[PrestigeScene] overlay done');

            // Panel background
            const panelTop = 20;
            const panelBottom = H - 90;
            const panelHeight = panelBottom - panelTop;

            const panel = this.add.graphics();
            panel.fillStyle(0x1e1e2e, 1);
            panel.fillRoundedRect(15, panelTop, W - 30, panelHeight, 16);
            panel.lineStyle(3, 0xf1c40f, 1);
            panel.strokeRoundedRect(15, panelTop, W - 30, panelHeight, 16);
            console.log('[PrestigeScene] panel done');

            // Title
            this.add.text(cx, 50, 'ПРЕСТИЖ (ТЕСТ)', {
                fontSize: '28px',
                fontFamily: 'Arial Black',
                color: '#f1c40f'
            }).setOrigin(0.5);
            console.log('[PrestigeScene] title done');

            // Simple text - no calculations
            this.add.text(cx, 150, 'Минимальная версия для теста', {
                fontSize: '16px', color: '#ffffff'
            }).setOrigin(0.5);
            console.log('[PrestigeScene] text1 done');

            this.add.text(cx, 200, `Монеты: ${PlayerData.prestigeCurrency}`, {
                fontSize: '20px', color: '#e056fd', fontStyle: 'bold'
            }).setOrigin(0.5);
            console.log('[PrestigeScene] text2 done');

            this.add.text(cx, 250, `Валюта: ${PlayerData.currency}`, {
                fontSize: '20px', color: '#f1c40f', fontStyle: 'bold'
            }).setOrigin(0.5);
            console.log('[PrestigeScene] text3 done');

            // Progress bar section
            const potential = getPrestigeCoinsFromCurrency(PlayerData.currency);
            console.log('[PrestigeScene] potential coins:', potential);

            this.add.text(cx, 310, potential > 0 ? `Можно получить: +${potential} монет` : 'Копите валюту для монет', {
                fontSize: '16px', color: potential > 0 ? '#55efc4' : '#888888'
            }).setOrigin(0.5);
            console.log('[PrestigeScene] potential text done');

            // Progress bar background
            const barWidth = W - 80;
            const barHeight = 20;
            const barY = 350;

            const barBg = this.add.graphics();
            barBg.fillStyle(0x333333, 1);
            barBg.fillRoundedRect(cx - barWidth / 2, barY, barWidth, barHeight, 8);
            console.log('[PrestigeScene] bar bg done');

            // Progress bar fill
            const progress = getProgressToNextCoin();
            console.log('[PrestigeScene] progress:', progress);

            if (progress > 0) {
                const barFill = this.add.graphics();
                barFill.fillStyle(0xf1c40f, 1);
                barFill.fillRoundedRect(cx - barWidth / 2, barY, barWidth * progress, barHeight, 8);
            }
            console.log('[PrestigeScene] bar fill done');

            this.add.text(cx, barY + barHeight + 15, `${Math.floor(progress * 100)}% до следующей монеты`, {
                fontSize: '14px', color: '#aaaaaa'
            }).setOrigin(0.5);
            console.log('[PrestigeScene] progress text done');

            // Upgrade rows
            let upgradeY = 420;
            console.log('[PrestigeScene] starting upgrade rows');

            // Money multiplier upgrade
            upgradeY = this.createUpgradeRow(upgradeY, '💰', 'Множитель',
                `x${getMoneyMultiplier()}`,
                getPrestigeMoneyMultCost(),
                () => {
                    if (upgradePrestigeMoneyMult()) this.scene.restart();
                });
            console.log('[PrestigeScene] row 1 done');

            // Tiers upgrade
            const maxTiers = PlayerData.prestigeTiers >= 4;
            upgradeY = this.createUpgradeRow(upgradeY, '⭐', 'Тиры гемов',
                `${getUnlockedTiers()}/7`,
                maxTiers ? 'MAX' : getPrestigeTiersCost(),
                maxTiers ? null : () => {
                    if (upgradePrestigeTiers()) this.scene.restart();
                });
            console.log('[PrestigeScene] row 2 done');

            // Colors upgrade
            const maxColors = PlayerData.prestigeColors >= 3;
            upgradeY = this.createUpgradeRow(upgradeY, '🎨', 'Цветов',
                `${getColorCount()}`,
                maxColors ? 'MAX' : getPrestigeColorsCost(),
                maxColors ? null : () => {
                    if (upgradePrestigeColors()) this.scene.restart();
                });
            console.log('[PrestigeScene] row 3 done');

            // Arena size upgrade
            const maxArena = PlayerData.prestigeArena >= 4;
            upgradeY = this.createUpgradeRow(upgradeY, '📐', 'Размер поля',
                `${getBoardSize()}x${getBoardSize()}`,
                maxArena ? 'MAX' : getPrestigeArenaCost(),
                maxArena ? null : () => {
                    if (upgradePrestigeArena()) this.scene.restart();
                });
            console.log('[PrestigeScene] row 4 done');

            // Close button
            this.createCloseButton();
            console.log('[PrestigeScene] create() END - success');
        } catch (e) {
            console.error('[PrestigeScene] create() ERROR:', e.message, e.stack);
        }
    }

    createCloseButton() {
        console.log('[PrestigeScene] createCloseButton() START');
        const W = this.cameras.main.width;
        const H = this.cameras.main.height;
        const cx = W / 2;
        const btnY = H - 45;
        const btnWidth = W - 60;
        const btnHeight = 50;

        const btn = this.add.graphics();
        btn.fillStyle(0xe74c3c, 1);
        btn.fillRoundedRect(cx - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 12);
        console.log('[PrestigeScene] button bg done');

        this.add.rectangle(cx, btnY, btnWidth, btnHeight, 0x000000, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.scene.stop());
        console.log('[PrestigeScene] button interactive done');

        this.add.text(cx, btnY, 'ЗАКРЫТЬ', {
            fontSize: '18px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);
        console.log('[PrestigeScene] createCloseButton() END');
    }

    createUpgradeRow(y, icon, name, value, cost, onBuy) {
        const W = this.cameras.main.width;
        const cx = W / 2;
        const rowHeight = 45;

        // Row background
        const rowBg = this.add.graphics();
        rowBg.fillStyle(0x2a2a3e, 0.5);
        rowBg.fillRoundedRect(25, y, W - 50, rowHeight, 8);

        // Icon and name
        this.add.text(35, y + rowHeight / 2, icon, { fontSize: '18px' }).setOrigin(0, 0.5);
        this.add.text(60, y + rowHeight / 2, name, {
            fontSize: '14px', color: '#ffffff'
        }).setOrigin(0, 0.5);

        // Value
        this.add.text(160, y + rowHeight / 2, value, {
            fontSize: '14px', color: '#55efc4', fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        // Cost or MAX
        const costStr = typeof cost === 'number' ? `${cost}👑` : cost;
        const canAfford = typeof cost === 'number' && PlayerData.prestigeCurrency >= cost;

        this.add.text(220, y + rowHeight / 2, costStr, {
            fontSize: '12px', color: canAfford ? '#f1c40f' : '#888888'
        }).setOrigin(0, 0.5);

        // Buy button (if not maxed)
        if (onBuy) {
            const btnX = W - 55;
            const btnSize = 35;

            const btn = this.add.graphics();
            btn.fillStyle(canAfford ? 0x27ae60 : 0x555555, 1);
            btn.fillRoundedRect(btnX - btnSize / 2, y + rowHeight / 2 - btnSize / 2, btnSize, btnSize, 6);

            this.add.rectangle(btnX, y + rowHeight / 2, btnSize, btnSize, 0x000000, 0)
                .setInteractive({ useHandCursor: canAfford })
                .on('pointerdown', () => {
                    if (canAfford) onBuy();
                });

            this.add.text(btnX, y + rowHeight / 2, '+', {
                fontSize: '20px', color: '#ffffff', fontStyle: 'bold'
            }).setOrigin(0.5);
        }

        return y + rowHeight + 5;
    }
}
