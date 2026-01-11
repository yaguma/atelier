/**
 * GameClearScene 視覚的テストシーン
 *
 * TASK-0248: GameClearScene実装
 * GameClearSceneの視覚的テストと手動検証を行うためのシーン。
 * 各種統計データ、演出を検証できる。
 */

import Phaser from 'phaser';
import { BaseGameScene, SceneInitData } from './BaseGameScene';
import { GameClearSceneLayout } from './GameClearSceneConstants';
import { SceneKeys } from '../config/SceneKeys';
import type { GameClearScene, GameClearSceneData } from './GameClearScene';

/**
 * GameClearTestScene
 *
 * 機能：
 * - GameClearSceneの起動とテスト
 * - 各種統計データパターンのテスト
 * - レアアイテム数のテスト
 */
export class GameClearTestScene extends BaseGameScene {
  // テストパネル
  private testPanel!: Phaser.GameObjects.Container;
  private logPanel!: Phaser.GameObjects.Container;
  private logTexts: Phaser.GameObjects.Text[] = [];
  private logIndex = 0;

  constructor() {
    super('GameClearTestScene');
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

    // GameClearSceneを起動（標準データ）
    this.launchGameClearScene('standard');

    this.log('GameClearTestScene: 初期化完了');
  }

  protected setupEventListeners(): void {
    // イベント監視は不要
  }

  // =====================================================
  // UI構築
  // =====================================================

  private createBackground(): void {
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, GameClearSceneLayout.SCREEN_WIDTH, GameClearSceneLayout.SCREEN_HEIGHT);
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
      .text(110, 15, 'GameClear Test Controls', {
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    panel.add(title);

    // テストボタン
    const buttons = [
      { label: '標準クリア', action: () => this.launchGameClearScene('standard') },
      { label: '速攻クリア', action: () => this.launchGameClearScene('speedrun') },
      { label: '完全コンプ', action: () => this.launchGameClearScene('completionist') },
      { label: 'レアアイテム多', action: () => this.launchGameClearScene('manyRareItems') },
      { label: '長時間プレイ', action: () => this.launchGameClearScene('longPlay') },
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
  // GameClearScene操作
  // =====================================================

  private launchGameClearScene(
    type: 'standard' | 'speedrun' | 'completionist' | 'manyRareItems' | 'longPlay'
  ): void {
    this.scene.stop(SceneKeys.GAME_CLEAR);

    let testData: GameClearSceneData;

    switch (type) {
      case 'standard':
        testData = {
          clearDay: 80,
          finalRank: 'S',
          totalQuests: 100,
          totalAlchemy: 200,
          totalGold: 50000,
          rareItems: ['賢者の石', '万能薬'],
          playTime: 7200, // 2時間
        };
        break;
      case 'speedrun':
        testData = {
          clearDay: 50,
          finalRank: 'S',
          totalQuests: 60,
          totalAlchemy: 100,
          totalGold: 30000,
          rareItems: [],
          playTime: 2400, // 40分
        };
        break;
      case 'completionist':
        testData = {
          clearDay: 99,
          finalRank: 'S',
          totalQuests: 200,
          totalAlchemy: 500,
          totalGold: 999999,
          rareItems: ['賢者の石', '万能薬', '究極の触媒', '伝説の宝石', '錬金術の極意'],
          playTime: 36000, // 10時間
        };
        break;
      case 'manyRareItems':
        testData = {
          clearDay: 90,
          finalRank: 'S',
          totalQuests: 150,
          totalAlchemy: 300,
          totalGold: 75000,
          rareItems: [
            '賢者の石',
            '万能薬',
            '究極の触媒',
            '伝説の宝石',
            '錬金術の極意',
            '神秘の結晶',
            '虹色のエッセンス',
            '星屑の粉',
          ],
          playTime: 18000, // 5時間
        };
        break;
      case 'longPlay':
        testData = {
          clearDay: 100,
          finalRank: 'S',
          totalQuests: 180,
          totalAlchemy: 400,
          totalGold: 120000,
          rareItems: ['賢者の石'],
          playTime: 72000, // 20時間
        };
        break;
    }

    this.scene.launch(SceneKeys.GAME_CLEAR, testData);
    this.log(`GameClearScene起動: ${type}`);
  }

  private getGameClearScene(): GameClearScene | null {
    return this.scene.get(SceneKeys.GAME_CLEAR) as GameClearScene | null;
  }

  private reloadScene(): void {
    this.scene.stop(SceneKeys.GAME_CLEAR);
    this.launchGameClearScene('standard');
    this.log('GameClearSceneをリロード');
  }

  // =====================================================
  // ログ機能
  // =====================================================

  private log(message: string): void {
    console.log(`[GameClearTest] ${message}`);

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
