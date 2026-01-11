/**
 * RankUpScene 視覚的テストシーン
 *
 * TASK-0246: RankUpSceneテスト
 * RankUpSceneの視覚的テストと手動検証を行うためのシーン。
 * 要件達成状況、試験フロー、演出を検証できる。
 */

import Phaser from 'phaser';
import { BaseGameScene, SceneInitData } from './BaseGameScene';
import { RankUpSceneLayout, RankExamRequirement, RankUpReward } from './RankUpSceneConstants';
import { SceneKeys } from '../config/SceneKeys';
import type { RankUpScene, RankUpSceneData } from './RankUpScene';

/**
 * RankUpTestScene
 *
 * 機能：
 * - RankUpSceneの起動とテスト
 * - 各種データパターンのテスト（未達成/部分達成/全達成）
 * - 成功/失敗演出のテスト
 * - 要件更新テスト
 */
export class RankUpTestScene extends BaseGameScene {
  // テストパネル
  private testPanel!: Phaser.GameObjects.Container;
  private logPanel!: Phaser.GameObjects.Container;
  private logTexts: Phaser.GameObjects.Text[] = [];
  private logIndex = 0;

  constructor() {
    super('RankUpTestScene');
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

    // RankUpSceneを起動（部分達成データ）
    this.launchRankUpScene('partial');

    this.log('RankUpTestScene: 初期化完了');
  }

  protected setupEventListeners(): void {
    // 試験完了イベントを監視
    // 注: rankup:exam:complete はEventPayloadMapに未登録のため型アサーション使用
    const eventBus = this.eventBus as unknown as {
      on: (
        event: string,
        callback: (payload: { newRank: string; rewards: RankUpReward[] }) => void
      ) => { unsubscribe: () => void };
    };

    const subscription = eventBus.on('rankup:exam:complete', (payload) => {
      this.log(`試験完了: ${payload.newRank}ランク昇格`);
      this.log(`報酬: ${payload.rewards.length}件`);
    });
    this.subscribe(subscription.unsubscribe);
  }

  // =====================================================
  // UI構築
  // =====================================================

  private createBackground(): void {
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, RankUpSceneLayout.SCREEN_WIDTH, RankUpSceneLayout.SCREEN_HEIGHT);
  }

  private createTestControls(): void {
    const panel = this.add.container(10, 10);
    this.testPanel = panel;

    // パネル背景
    const bg = this.add.graphics();
    bg.fillStyle(0x333355, 0.95);
    bg.fillRoundedRect(0, 0, 220, 400, 8);
    bg.lineStyle(2, 0x6666aa, 1);
    bg.strokeRoundedRect(0, 0, 220, 400, 8);
    panel.add(bg);

    // タイトル
    const title = this.add.text(110, 15, 'RankUp Test Controls', {
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);
    panel.add(title);

    // テストボタン
    const buttons = [
      { label: '未達成データ', action: () => this.launchRankUpScene('notMet') },
      { label: '部分達成データ', action: () => this.launchRankUpScene('partial') },
      { label: '全達成データ', action: () => this.launchRankUpScene('allMet') },
      { label: '成功演出', action: () => this.testSuccess() },
      { label: '失敗演出', action: () => this.testFailure() },
      { label: '要件+1更新', action: () => this.testUpdateRequirement() },
      { label: '全要件達成', action: () => this.testMeetAllRequirements() },
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

    const text = this.add.text(0, 0, label, {
      fontSize: '12px',
      color: '#ffffff',
    }).setOrigin(0.5);
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
    const panel = this.add.container(10, 420);
    this.logPanel = panel;

    // パネル背景
    const bg = this.add.graphics();
    bg.fillStyle(0x222233, 0.9);
    bg.fillRoundedRect(0, 0, 220, 330, 8);
    bg.lineStyle(1, 0x444466, 1);
    bg.strokeRoundedRect(0, 0, 220, 330, 8);
    panel.add(bg);

    // タイトル
    const title = this.add.text(110, 15, 'Event Log', {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#aaaacc',
    }).setOrigin(0.5);
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
  // RankUpScene操作
  // =====================================================

  private launchRankUpScene(type: 'notMet' | 'partial' | 'allMet'): void {
    this.scene.stop(SceneKeys.RANK_UP);

    let requirements: RankExamRequirement[];

    switch (type) {
      case 'notMet':
        requirements = [
          { type: 'quest', description: '依頼を10件完了', targetValue: 10, currentValue: 3 },
          { type: 'alchemy', description: '調合を20回実行', targetValue: 20, currentValue: 5 },
          { type: 'gold', description: '所持金1000G', targetValue: 1000, currentValue: 500 },
        ];
        break;
      case 'partial':
        requirements = [
          { type: 'quest', description: '依頼を10件完了', targetValue: 10, currentValue: 10 },
          { type: 'alchemy', description: '調合を20回実行', targetValue: 20, currentValue: 15 },
          { type: 'gold', description: '所持金1000G', targetValue: 1000, currentValue: 1500 },
        ];
        break;
      case 'allMet':
        requirements = [
          { type: 'quest', description: '依頼を10件完了', targetValue: 10, currentValue: 12 },
          { type: 'alchemy', description: '調合を20回実行', targetValue: 20, currentValue: 25 },
          { type: 'gold', description: '所持金1000G', targetValue: 1000, currentValue: 2000 },
          { type: 'item', description: 'ヒールポーションを5個作成', targetValue: 5, currentValue: 8 },
        ];
        break;
    }

    const rewards: RankUpReward[] = [
      { type: 'card', name: '上級森の採取地', description: 'レア素材が出やすい' },
      { type: 'artifact', name: '錬金術師の指輪', description: '調合成功率+5%' },
      { type: 'unlock', name: '上級レシピ解放' },
    ];

    const testData: RankUpSceneData = {
      currentRank: 'E',
      targetRank: 'D',
      examTitle: 'D級昇格試験',
      examDescription: 'D級錬金術師として認められるための試験です。\n基本的な調合技術と依頼遂行能力が問われます。',
      requirements,
      rewards,
      returnScene: 'RankUpTestScene',
    };

    this.scene.launch(SceneKeys.RANK_UP, testData);
    this.log(`RankUpScene起動: ${type}`);
  }

  private getRankUpScene(): RankUpScene | null {
    return this.scene.get(SceneKeys.RANK_UP) as RankUpScene | null;
  }

  private testSuccess(): void {
    const rankUpScene = this.getRankUpScene();
    if (rankUpScene) {
      rankUpScene.showExamSuccess('D');
      this.log('成功演出テスト開始');
    } else {
      this.log('エラー: RankUpSceneが見つかりません');
    }
  }

  private testFailure(): void {
    const rankUpScene = this.getRankUpScene();
    if (rankUpScene) {
      rankUpScene.showExamFailure('調合回数が不足しています（現在15回/必要20回）');
      this.log('失敗演出テスト開始');
    } else {
      this.log('エラー: RankUpSceneが見つかりません');
    }
  }

  private testUpdateRequirement(): void {
    const rankUpScene = this.getRankUpScene();
    if (rankUpScene) {
      // 調合回数を+1更新
      const reqs = rankUpScene.getDisplayedRequirements();
      if (reqs.length > 1) {
        const current = reqs[1].currentValue;
        rankUpScene.updateRequirement(1, current + 1);
        this.log(`要件更新: 調合 ${current} → ${current + 1}`);
      }
    } else {
      this.log('エラー: RankUpSceneが見つかりません');
    }
  }

  private testMeetAllRequirements(): void {
    const rankUpScene = this.getRankUpScene();
    if (rankUpScene) {
      const reqs = rankUpScene.getDisplayedRequirements();
      reqs.forEach((req, index) => {
        rankUpScene.updateRequirement(index, req.targetValue);
      });
      this.log('全要件を達成状態に更新');
    } else {
      this.log('エラー: RankUpSceneが見つかりません');
    }
  }

  private reloadScene(): void {
    this.scene.stop(SceneKeys.RANK_UP);
    this.launchRankUpScene('partial');
    this.log('RankUpSceneをリロード');
  }

  // =====================================================
  // ログ機能
  // =====================================================

  private log(message: string): void {
    console.log(`[RankUpTest] ${message}`);

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
