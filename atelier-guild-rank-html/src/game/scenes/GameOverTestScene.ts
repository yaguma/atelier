/**
 * GameOverScene 視覚的テストシーン
 *
 * TASK-0247: GameOverScene実装
 * GameOverSceneの視覚的テストと手動検証を行うためのシーン。
 * 各種失敗理由、統計情報、演出を検証できる。
 */

import Phaser from 'phaser';
import { BaseGameScene, SceneInitData } from './BaseGameScene';
import { GameOverSceneLayout } from './GameOverSceneConstants';
import { SceneKeys } from '../config/SceneKeys';
import type { GameOverScene, GameOverSceneData } from './GameOverScene';

/**
 * GameOverTestScene
 *
 * 機能：
 * - GameOverSceneの起動とテスト
 * - 各種失敗理由パターンのテスト（期限切れ/資金不足/ランク降格/その他）
 * - 統計情報の表示テスト
 */
export class GameOverTestScene extends BaseGameScene {
  // テストパネル
  private testPanel!: Phaser.GameObjects.Container;
  private logPanel!: Phaser.GameObjects.Container;
  private logTexts: Phaser.GameObjects.Text[] = [];
  private logIndex = 0;

  constructor() {
    super('GameOverTestScene');
  }

  protected onInit(_data?: SceneInitData): void {
    // 初期化
  }

  protected onPreload(): void {
    // アセット読み込み
  }

  protected onCreate(_data?: SceneInitData): void {
    this.createBackground();
    this.createTestControls();
    this.createLogPanel();

    // GameOverSceneを起動（期限切れデータ）
    this.launchGameOverScene('deadline');

    this.log('GameOverTestScene: 初期化完了');
  }

  protected setupEventListeners(): void {
    // game:restart イベントを監視
    const unsubscribe = this.eventBus.onVoid('game:restart', () => {
      this.log('game:restart イベント受信');
    });
    this.subscribe(unsubscribe);
  }

  // =====================================================
  // UI構築
  // =====================================================

  private createBackground(): void {
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, GameOverSceneLayout.SCREEN_WIDTH, GameOverSceneLayout.SCREEN_HEIGHT);
  }

  private createTestControls(): void {
    const panel = this.add.container(10, 10);
    this.testPanel = panel;

    // パネル背景
    const bg = this.add.graphics();
    bg.fillStyle(0x333355, 0.95);
    bg.fillRoundedRect(0, 0, 220, 320, 8);
    bg.lineStyle(2, 0x6666aa, 1);
    bg.strokeRoundedRect(0, 0, 220, 320, 8);
    panel.add(bg);

    // タイトル
    const title = this.add
      .text(110, 15, 'GameOver Test Controls', {
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    panel.add(title);

    // テストボタン
    const buttons = [
      { label: '期限切れ', action: () => this.launchGameOverScene('deadline') },
      { label: '資金不足', action: () => this.launchGameOverScene('bankruptcy') },
      { label: 'ランク降格', action: () => this.launchGameOverScene('rankDown') },
      { label: 'その他', action: () => this.launchGameOverScene('other') },
      { label: '高統計データ', action: () => this.launchGameOverScene('highStats') },
      { label: 'リロード', action: () => this.reloadScene() },
      { label: 'ログクリア', action: () => this.clearLog() },
    ];

    buttons.forEach((btn, index) => {
      const y = 50 + index * 38;
      const button = this.createTestButton(btn.label, 110, y, btn.action);
      panel.add(button);
    });

    panel.setDepth(1000);
  }

  private createTestButton(
    label: string,
    x: number,
    y: number,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const btn = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x555577, 1);
    bg.fillRoundedRect(-90, -15, 180, 30, 4);
    btn.add(bg);

    const text = this.add
      .text(0, 0, label, {
        fontSize: '12px',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    btn.add(text);

    btn.setSize(180, 30);
    btn.setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x7777aa, 1);
      bg.fillRoundedRect(-90, -15, 180, 30, 4);
    });

    btn.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x555577, 1);
      bg.fillRoundedRect(-90, -15, 180, 30, 4);
    });

    btn.on('pointerdown', onClick);

    return btn;
  }

  private createLogPanel(): void {
    const panel = this.add.container(10, 340);
    this.logPanel = panel;

    // パネル背景
    const bg = this.add.graphics();
    bg.fillStyle(0x222233, 0.9);
    bg.fillRoundedRect(0, 0, 220, 330, 8);
    bg.lineStyle(1, 0x444466, 1);
    bg.strokeRoundedRect(0, 0, 220, 330, 8);
    panel.add(bg);

    // タイトル
    const title = this.add
      .text(110, 15, 'Event Log', {
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#aaaacc',
      })
      .setOrigin(0.5);
    panel.add(title);

    // ログテキストを準備
    for (let i = 0; i < 14; i++) {
      const logText = this.add.text(10, 35 + i * 20, '', {
        fontSize: '10px',
        color: '#888899',
        wordWrap: { width: 200 },
      });
      this.logTexts.push(logText);
      panel.add(logText);
    }

    panel.setDepth(1000);
  }

  // =====================================================
  // GameOverScene操作
  // =====================================================

  private launchGameOverScene(
    type: 'deadline' | 'bankruptcy' | 'rankDown' | 'other' | 'highStats'
  ): void {
    this.scene.stop(SceneKeys.GAME_OVER);

    let testData: GameOverSceneData;

    switch (type) {
      case 'deadline':
        testData = {
          reason: '期限内にS級に到達できませんでした',
          finalDay: 100,
          finalRank: 'D',
          totalQuests: 45,
          totalAlchemy: 78,
        };
        break;
      case 'bankruptcy':
        testData = {
          reason: '所持金が底をつきました',
          finalDay: 35,
          finalRank: 'F',
          totalQuests: 12,
          totalAlchemy: 20,
        };
        break;
      case 'rankDown':
        testData = {
          reason: 'ランク降格により除名されました',
          finalDay: 50,
          finalRank: 'G',
          totalQuests: 8,
          totalAlchemy: 15,
        };
        break;
      case 'other':
        testData = {
          reason: '予期せぬ事態が発生しました',
          finalDay: 20,
          finalRank: 'G',
          totalQuests: 5,
          totalAlchemy: 10,
        };
        break;
      case 'highStats':
        testData = {
          reason: '惜しい！あと少しで期限切れでした',
          finalDay: 99,
          finalRank: 'A',
          totalQuests: 150,
          totalAlchemy: 300,
        };
        break;
    }

    this.scene.launch(SceneKeys.GAME_OVER, testData);
    this.log(`GameOverScene起動: ${type}`);
  }

  private getGameOverScene(): GameOverScene | null {
    return this.scene.get(SceneKeys.GAME_OVER) as GameOverScene | null;
  }

  private reloadScene(): void {
    this.scene.stop(SceneKeys.GAME_OVER);
    this.launchGameOverScene('deadline');
    this.log('GameOverSceneをリロード');
  }

  // =====================================================
  // ログ機能
  // =====================================================

  private log(message: string): void {
    console.log(`[GameOverTest] ${message}`);

    // ログをシフト
    for (let i = this.logTexts.length - 1; i > 0; i--) {
      this.logTexts[i].setText(this.logTexts[i - 1].text);
      this.logTexts[i].setColor(this.logTexts[i - 1].style.color as string);
    }

    // 新しいログを追加
    this.logTexts[0].setText(message);
    this.logTexts[0].setColor('#ffffff');

    this.logIndex++;
  }

  private clearLog(): void {
    this.logTexts.forEach((text) => text.setText(''));
    this.logIndex = 0;
    this.log('ログをクリア');
  }
}
