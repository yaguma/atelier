import Phaser from 'phaser';

/**
 * メインシーン - ゲームの基本シーン
 */
class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  create(): void {
    // 画面中央にテキストを表示
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    this.add
      .text(centerX, centerY - 50, 'Atelier Guild Rank', {
        fontSize: '48px',
        color: '#ffffff',
        fontFamily: 'Arial',
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, centerY + 20, '錬金術師ギルドランク制デッキ構築RPG', {
        fontSize: '24px',
        color: '#aaaaaa',
        fontFamily: 'Arial',
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, centerY + 80, 'Phaser 3 + rexUI + TypeScript', {
        fontSize: '18px',
        color: '#666666',
        fontFamily: 'Arial',
      })
      .setOrigin(0.5);
  }
}

/**
 * Phaserゲーム設定
 */
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'game-container',
  backgroundColor: '#1a1a2e',
  scene: [MainScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

// ゲームインスタンスを作成
new Phaser.Game(config);
