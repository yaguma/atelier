/**
 * TestScene - テスト用シーン
 *
 * BaseGameSceneの動作確認用シーン。
 * 開発中のテストおよびデバッグに使用する。
 */

import Phaser from 'phaser';
import { BaseGameScene, SceneInitData } from './BaseGameScene';
import { SCENE_KEYS } from '../config/SceneKeys';

/**
 * テスト用シーンクラス
 *
 * BaseGameSceneの継承パターンと主要機能のデモンストレーションを行う：
 * - ライフサイクルフックの確認
 * - EventBusイベント購読と発行
 * - UIコンポーネントの作成
 */
export class TestScene extends BaseGameScene {
  /**
   * テスト用テキストラベル
   */
  private testLabel!: Phaser.GameObjects.Text;

  /**
   * ゴールド表示ラベル
   */
  private goldLabel!: Phaser.GameObjects.Text;

  /**
   * フレームカウンター（デバッグ用）
   */
  private frameCount = 0;

  constructor() {
    super(SCENE_KEYS.TEST);
  }

  /**
   * 初期化処理
   */
  protected onInit(data?: SceneInitData): void {
    // console.log('TestScene: onInit', data);
    this.frameCount = 0;
  }

  /**
   * アセット読み込み
   */
  protected onPreload(): void {
    // console.log('TestScene: onPreload');
    // テストシーンでは特にアセット読み込みなし
  }

  /**
   * UI構築
   */
  protected onCreate(data?: SceneInitData): void {
    // console.log('TestScene: onCreate', data);

    // 背景色設定
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // タイトルラベル
    this.testLabel = this.add
      .text(640, 200, 'Test Scene', {
        fontSize: '48px',
        color: '#ffffff',
        fontFamily: 'Arial',
      })
      .setOrigin(0.5);

    // ゴールド表示ラベル
    this.goldLabel = this.add
      .text(640, 280, 'Gold: 0', {
        fontSize: '32px',
        color: '#ffd700',
        fontFamily: 'Arial',
      })
      .setOrigin(0.5);

    // ゴールド増加ボタン（Phaser標準テキストをボタン代わりに使用）
    const addGoldBtn = this.add
      .text(640, 380, '[ +100 Gold ]', {
        fontSize: '24px',
        color: '#4CAF50',
        fontFamily: 'Arial',
        backgroundColor: '#333',
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    addGoldBtn.on('pointerover', () => {
      addGoldBtn.setStyle({ color: '#8BC34A' });
    });

    addGoldBtn.on('pointerout', () => {
      addGoldBtn.setStyle({ color: '#4CAF50' });
    });

    addGoldBtn.on('pointerdown', () => {
      // ゴールド変更イベントを発行
      const currentGold = parseInt(this.goldLabel.text.replace('Gold: ', ''), 10) || 0;
      const newGold = currentGold + 100;
      this.eventBus.emit('state:gold:changed', {
        gold: newGold,
        delta: 100,
      });
    });

    // 新規ゲームイベント発行ボタン
    const newGameBtn = this.add
      .text(640, 460, '[ New Game Event ]', {
        fontSize: '24px',
        color: '#2196F3',
        fontFamily: 'Arial',
        backgroundColor: '#333',
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    newGameBtn.on('pointerover', () => {
      newGameBtn.setStyle({ color: '#64B5F6' });
    });

    newGameBtn.on('pointerout', () => {
      newGameBtn.setStyle({ color: '#2196F3' });
    });

    newGameBtn.on('pointerdown', () => {
      // console.log('New Game button clicked!');
      this.eventBus.emitVoid('ui:newGame:clicked');
    });

    // 説明テキスト
    this.add
      .text(640, 550, 'This scene demonstrates BaseGameScene functionality', {
        fontSize: '16px',
        color: '#888',
        fontFamily: 'Arial',
      })
      .setOrigin(0.5);
  }

  /**
   * イベントリスナー設定
   */
  protected setupEventListeners(): void {
    // ゴールド変更イベントを購読
    const goldUnsub = this.eventBus.on('state:gold:changed', payload => {
      // console.log('Gold changed:', payload);
      this.goldLabel.setText(`Gold: ${payload.gold}`);
    });
    this.subscribe(goldUnsub);

    // 新規ゲームイベントを購読（デモ用）
    const newGameUnsub = this.eventBus.onVoid('ui:newGame:clicked', () => {
      // console.log('New Game clicked event received!');
      this.testLabel.setText('New Game Started!');
      // 3秒後に元に戻す
      this.time.delayedCall(3000, () => {
        if (this.testLabel && this.testLabel.active) {
          this.testLabel.setText('Test Scene');
        }
      });
    });
    this.subscribe(newGameUnsub);
  }

  /**
   * フレーム更新処理
   */
  protected onUpdate(_time: number, _delta: number): void {
    this.frameCount++;
    // 特にフレーム更新処理なし
  }

  /**
   * シャットダウン処理
   */
  protected onShutdown(): void {
    // console.log('TestScene: onShutdown');
    this.frameCount = 0;
  }

  /**
   * フレームカウントを取得（テスト用）
   */
  public getFrameCount(): number {
    return this.frameCount;
  }
}
