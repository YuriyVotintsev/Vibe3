import {
    PlayerData,
    getPrestigeCoinsFromCurrency,
    getProgressToNextCoin
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
}
