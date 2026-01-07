import { PlayerData } from './config.js';

export class PrestigeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PrestigeScene' });
    }

    create() {
        const W = this.cameras.main.width;
        const H = this.cameras.main.height;
        const cx = W / 2;

        // Dark overlay
        this.add.rectangle(cx, H / 2, W, H, 0x000000, 0.9);

        // Panel background
        const panelTop = 20;
        const panelBottom = H - 90;
        const panelHeight = panelBottom - panelTop;

        const panel = this.add.graphics();
        panel.fillStyle(0x1e1e2e, 1);
        panel.fillRoundedRect(15, panelTop, W - 30, panelHeight, 16);
        panel.lineStyle(3, 0xf1c40f, 1);
        panel.strokeRoundedRect(15, panelTop, W - 30, panelHeight, 16);

        // Title
        this.add.text(cx, 50, 'ПРЕСТИЖ (ТЕСТ)', {
            fontSize: '28px',
            fontFamily: 'Arial Black',
            color: '#f1c40f'
        }).setOrigin(0.5);

        // Simple text - no calculations
        this.add.text(cx, 150, 'Минимальная версия для теста', {
            fontSize: '16px', color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(cx, 200, `Монеты: ${PlayerData.prestigeCurrency}`, {
            fontSize: '20px', color: '#e056fd', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(cx, 250, `Валюта: ${PlayerData.currency}`, {
            fontSize: '20px', color: '#f1c40f', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Close button
        this.createCloseButton();
    }

    createCloseButton() {
        const W = this.cameras.main.width;
        const H = this.cameras.main.height;
        const cx = W / 2;
        const btnY = H - 45;
        const btnWidth = W - 60;
        const btnHeight = 50;

        const btn = this.add.graphics();
        btn.fillStyle(0xe74c3c, 1);
        btn.fillRoundedRect(cx - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 12);

        this.add.rectangle(cx, btnY, btnWidth, btnHeight, 0x000000, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.scene.stop());

        this.add.text(cx, btnY, 'ЗАКРЫТЬ', {
            fontSize: '18px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);
    }
}
