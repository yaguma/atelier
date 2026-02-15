/**
 * RankUpTestPanel コンポーネント
 * TASK-0055 RankUpSceneリファクタリング
 *
 * @description
 * 昇格試験のアクションパネルを担当するコンポーネント。
 * 試験開始、辞退、状態表示を行う。
 */

import { applyHoverAnimation } from '@presentation/ui/utils';
import type { TestPanelCallbacks, TestState } from './types';

// =============================================================================
// 定数定義
// =============================================================================

/** UIテキスト定数 */
const UI_TEXT = {
  START_TEST_BUTTON: '試験を受ける',
  DECLINE_TEST_BUTTON: '後で受ける',
  TEST_IN_PROGRESS: '【昇格試験中】',
  TEST_CLEAR_TITLE: '昇格試験クリア！',
  TEST_FAILED_TITLE: '昇格試験失敗...',
  GAME_OVER: 'ゲームオーバー',
  TO_TITLE_BUTTON: 'タイトルへ',
} as const;

/** スタイル定数 */
const UI_STYLES = {
  BUTTON_TEXT: {
    fontSize: '18px',
    color: '#ffffff',
  },
  STATUS_TEXT: {
    fontSize: '18px',
    color: '#ffffff',
  },
  CLEAR_TEXT: {
    fontSize: '24px',
    color: '#ffd700',
  },
  FAILED_TEXT: {
    fontSize: '24px',
    color: '#ff4444',
  },
} as const;

/** レイアウト定数 */
const LAYOUT = {
  BUTTON_WIDTH: 150,
  BUTTON_HEIGHT: 50,
  BUTTON_SPACING: 160,
} as const;

/** カラー定数 */
const BUTTON_COLORS = {
  START: 0xff9800,
  DECLINE: 0x666666,
  TO_TITLE: 0x666666,
} as const;

// =============================================================================
// RankUpTestPanel クラス
// =============================================================================

/**
 * RankUpTestPanel - 試験パネルコンポーネント
 *
 * 【責務】
 * - 試験開始ボタン/辞退ボタンの表示
 * - 試験状態に応じた表示切り替え
 * - ボタンクリックイベントのハンドリング
 */
export class RankUpTestPanel {
  /** Phaserシーン */
  private scene: Phaser.Scene;

  /** メインコンテナ */
  private container: Phaser.GameObjects.Container;

  /** コールバック関数 */
  private callbacks: TestPanelCallbacks;

  /** 試験開始ボタン */
  private startButton: Phaser.GameObjects.Rectangle | null = null;
  private startButtonText: Phaser.GameObjects.Text | null = null;

  /** 辞退ボタン */
  private declineButton: Phaser.GameObjects.Rectangle | null = null;
  private declineButtonText: Phaser.GameObjects.Text | null = null;

  /** タイトルへボタン */
  private toTitleButton: Phaser.GameObjects.Rectangle | null = null;
  private toTitleButtonText: Phaser.GameObjects.Text | null = null;

  /** ステータステキスト */
  private statusText: Phaser.GameObjects.Text | null = null;

  /**
   * コンストラクタ
   * @param scene - Phaserシーンインスタンス
   * @param x - X座標
   * @param y - Y座標
   * @param callbacks - コールバック関数
   */
  constructor(scene: Phaser.Scene, x: number, y: number, callbacks: TestPanelCallbacks) {
    this.scene = scene;
    this.container = scene.add.container(x, y);
    this.callbacks = callbacks;
  }

  /**
   * UIコンポーネントを作成
   */
  public create(): void {
    // 初期状態は空
  }

  /**
   * 状態を設定
   * @param state - 試験状態
   */
  public setState(state: TestState): void {
    this.clearContent();

    switch (state) {
      case 'NotStarted':
        this.createNotStartedUI();
        break;
      case 'InProgress':
        this.createInProgressUI();
        break;
      case 'Completed':
        this.createCompletedUI();
        break;
      case 'Failed':
        this.createFailedUI();
        break;
    }
  }

  /**
   * コンテンツをクリア
   */
  private clearContent(): void {
    if (this.startButton) {
      this.startButton.destroy();
      this.startButton = null;
    }
    if (this.startButtonText) {
      this.startButtonText.destroy();
      this.startButtonText = null;
    }
    if (this.declineButton) {
      this.declineButton.destroy();
      this.declineButton = null;
    }
    if (this.declineButtonText) {
      this.declineButtonText.destroy();
      this.declineButtonText = null;
    }
    if (this.toTitleButton) {
      this.toTitleButton.destroy();
      this.toTitleButton = null;
    }
    if (this.toTitleButtonText) {
      this.toTitleButtonText.destroy();
      this.toTitleButtonText = null;
    }
    if (this.statusText) {
      this.statusText.destroy();
      this.statusText = null;
    }
  }

  /**
   * NotStarted状態のUIを作成
   */
  private createNotStartedUI(): void {
    // 試験開始ボタン
    const startX = -LAYOUT.BUTTON_SPACING / 2;
    this.startButton = this.scene.add.rectangle(
      startX,
      0,
      LAYOUT.BUTTON_WIDTH,
      LAYOUT.BUTTON_HEIGHT,
      BUTTON_COLORS.START,
    );
    this.startButton.setInteractive({ useHandCursor: true });
    this.startButton.on('pointerdown', () => this.handleStartTest());
    applyHoverAnimation(this.startButton, this.scene);
    this.container.add(this.startButton);

    this.startButtonText = this.scene.add.text(
      startX,
      0,
      UI_TEXT.START_TEST_BUTTON,
      UI_STYLES.BUTTON_TEXT,
    );
    this.startButtonText.setOrigin(0.5);
    this.container.add(this.startButtonText);

    // 辞退ボタン
    const declineX = LAYOUT.BUTTON_SPACING / 2;
    this.declineButton = this.scene.add.rectangle(
      declineX,
      0,
      LAYOUT.BUTTON_WIDTH,
      LAYOUT.BUTTON_HEIGHT,
      BUTTON_COLORS.DECLINE,
    );
    this.declineButton.setInteractive({ useHandCursor: true });
    this.declineButton.on('pointerdown', () => this.handleDeclineTest());
    applyHoverAnimation(this.declineButton, this.scene);
    this.container.add(this.declineButton);

    this.declineButtonText = this.scene.add.text(
      declineX,
      0,
      UI_TEXT.DECLINE_TEST_BUTTON,
      UI_STYLES.BUTTON_TEXT,
    );
    this.declineButtonText.setOrigin(0.5);
    this.container.add(this.declineButtonText);
  }

  /**
   * InProgress状態のUIを作成
   */
  private createInProgressUI(): void {
    this.statusText = this.scene.add.text(0, 0, UI_TEXT.TEST_IN_PROGRESS, UI_STYLES.STATUS_TEXT);
    this.statusText.setOrigin(0.5);
    this.container.add(this.statusText);
  }

  /**
   * Completed状態のUIを作成
   */
  private createCompletedUI(): void {
    this.statusText = this.scene.add.text(0, 0, UI_TEXT.TEST_CLEAR_TITLE, UI_STYLES.CLEAR_TEXT);
    this.statusText.setOrigin(0.5);
    this.container.add(this.statusText);
  }

  /**
   * Failed状態のUIを作成
   */
  private createFailedUI(): void {
    // 失敗テキスト
    this.statusText = this.scene.add.text(0, -30, UI_TEXT.TEST_FAILED_TITLE, UI_STYLES.FAILED_TEXT);
    this.statusText.setOrigin(0.5);
    this.container.add(this.statusText);

    // ゲームオーバーテキスト
    const gameOverText = this.scene.add.text(0, 10, UI_TEXT.GAME_OVER, UI_STYLES.STATUS_TEXT);
    gameOverText.setOrigin(0.5);
    this.container.add(gameOverText);

    // タイトルへボタン
    this.toTitleButton = this.scene.add.rectangle(
      0,
      60,
      LAYOUT.BUTTON_WIDTH,
      LAYOUT.BUTTON_HEIGHT,
      BUTTON_COLORS.TO_TITLE,
    );
    this.toTitleButton.setInteractive({ useHandCursor: true });
    this.toTitleButton.on('pointerdown', () => this.handleToTitle());
    applyHoverAnimation(this.toTitleButton, this.scene);
    this.container.add(this.toTitleButton);

    this.toTitleButtonText = this.scene.add.text(
      0,
      60,
      UI_TEXT.TO_TITLE_BUTTON,
      UI_STYLES.BUTTON_TEXT,
    );
    this.toTitleButtonText.setOrigin(0.5);
    this.container.add(this.toTitleButtonText);
  }

  /**
   * 試験開始ハンドラ（公開メソッド - テスト用）
   */
  public handleStartTest(): void {
    this.callbacks.onStartTest();
  }

  /**
   * 辞退ハンドラ（公開メソッド - テスト用）
   */
  public handleDeclineTest(): void {
    this.callbacks.onDeclineTest();
  }

  /**
   * タイトルへハンドラ
   */
  private handleToTitle(): void {
    this.callbacks.onToTitle();
  }

  /**
   * コンテナを取得
   * @returns コンテナオブジェクト
   */
  public getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  /**
   * 表示状態を設定
   * @param visible - 表示状態
   */
  public setVisible(visible: boolean): this {
    this.container.setVisible(visible);
    return this;
  }

  /**
   * 位置を設定
   * @param x - X座標
   * @param y - Y座標
   */
  public setPosition(x: number, y: number): this {
    this.container.setPosition(x, y);
    return this;
  }

  /**
   * リソースを解放
   */
  public destroy(): void {
    this.clearContent();
    if (this.container) {
      this.container.destroy();
    }
  }
}
