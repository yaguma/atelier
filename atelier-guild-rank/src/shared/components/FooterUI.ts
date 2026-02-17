/**
 * フッターUIコンポーネント
 * TASK-0046 MainScene共通レイアウト実装
 * TASK-0047 共通UIコンポーネント視覚実装
 *
 * @description
 * フェーズインジケーター、手札表示エリア、次へボタンを表示するフッター
 *
 * @信頼性レベル 🔵 requirements.md セクション2.4に基づく
 */

import { GamePhase, VALID_GAME_PHASES } from '@shared/types/common';
import Phaser from 'phaser';
import { BaseComponent } from './BaseComponent';

// =============================================================================
// 定数
// =============================================================================

/**
 * 手札表示エリアの最大表示数
 */
const HAND_DISPLAY_CAPACITY = 5;

/**
 * フェーズインジケーター用カラー定数
 */
const PHASE_COLORS = {
  /** 未到達（グレー） */
  PENDING: 0x6b7280,
  /** 現在（プライマリ） */
  CURRENT: 0x6366f1,
  /** 完了（緑） */
  COMPLETED: 0x10b981,
} as const;

/**
 * ボタン用カラー定数
 */
const BUTTON_COLORS = {
  /** プライマリ（有効時） */
  PRIMARY: 0x6366f1,
  /** プライマリホバー */
  PRIMARY_HOVER: 0x818cf8,
  /** 無効時（グレー） */
  DISABLED: 0x4b5563,
} as const;

/**
 * フッター用カラー定数
 */
const FOOTER_COLORS = {
  /** 背景色（半透明ダークグレー） */
  BACKGROUND: 0x1f2937,
  /** ボーダー色 */
  BORDER: 0x374151,
  /** カードプレースホルダー */
  CARD_PLACEHOLDER: 0x374151,
  /** カードプレースホルダーボーダー */
  CARD_PLACEHOLDER_BORDER: 0x4b5563,
} as const;

/**
 * フッターレイアウト定数
 */
const FOOTER_LAYOUT = {
  /** フッター幅（画面幅 - サイドバー幅） */
  WIDTH: 1024 - 200,
  /** フッター高さ */
  HEIGHT: 120,
  /** パディング */
  PADDING: 16,
} as const;

/**
 * フェーズ名ラベル
 */
const PHASE_LABELS: Record<string, string> = {
  [GamePhase.QUEST_ACCEPT]: '依頼',
  [GamePhase.GATHERING]: '採取',
  [GamePhase.ALCHEMY]: '調合',
  [GamePhase.DELIVERY]: '納品',
};

// =============================================================================
// 型定義
// =============================================================================

/**
 * フェーズインジケーターの状態
 */
export type PhaseIndicatorState = 'PENDING' | 'CURRENT' | 'COMPLETED';

// =============================================================================
// FooterUIクラス
// =============================================================================

/**
 * フッターUIコンポーネント
 *
 * 画面下部に配置され、以下の情報を表示する:
 * - フェーズインジケーター（4フェーズ）
 * - 手札表示エリア
 * - 次へボタン（フェーズ遷移用）
 *
 * @信頼性レベル 🔵 requirements.md セクション2.4に基づく
 */
export class FooterUI extends BaseComponent {
  // ===========================================================================
  // 内部状態
  // ===========================================================================

  /** フェーズインジケーター（4つ） */
  private _phaseIndicators: object[] = [];

  /** 各フェーズの状態 */
  private _phaseStates: Record<GamePhase, PhaseIndicatorState> = {
    [GamePhase.QUEST_ACCEPT]: 'PENDING',
    [GamePhase.GATHERING]: 'PENDING',
    [GamePhase.ALCHEMY]: 'PENDING',
    [GamePhase.DELIVERY]: 'PENDING',
  };

  /** 現在のフェーズ */
  private _currentPhase: GamePhase | null = null;

  /** 手札表示エリア（ダミー） */
  private _handDisplayArea = {};

  /** 次へボタンラベル */
  private _nextButtonLabel = '';

  /** 次へボタン有効状態 */
  private _nextButtonEnabled = true;

  /** 次へボタンクリックコールバック */
  private _onNextClickCallback: (() => void) | null = null;

  // ===========================================================================
  // 視覚要素（Phaserオブジェクト）
  // ===========================================================================

  /** フェーズインジケーター円（視覚要素） */
  // biome-ignore lint/suspicious/noExplicitAny: Phaser.GameObjects.Arcの型定義が複雑なためanyを使用
  private _phaseIndicatorCircles: any[] = [];

  /** 手札プレースホルダー（視覚要素） */
  private _handPlaceholders: Phaser.GameObjects.Rectangle[] = [];

  /** 次へボタンコンテナ */
  private _nextButtonContainer: Phaser.GameObjects.Container | null = null;

  /** 次へボタン背景 */
  private _nextButtonBackground: Phaser.GameObjects.Rectangle | null = null;

  /** 次へボタンテキスト */
  private _nextButtonText: Phaser.GameObjects.Text | null = null;

  /** 背景パネル */
  private _backgroundPanel: Phaser.GameObjects.Rectangle | null = null;

  /** フェーズラベルテキスト */
  private _phaseLabels: Phaser.GameObjects.Text[] = [];

  // ===========================================================================
  // ライフサイクルメソッド
  // ===========================================================================

  /**
   * コンポーネントの初期化処理
   * TASK-0047: 視覚要素を生成
   */
  create(): void {
    // 背景パネルを生成（半透明のダークグレー）
    this._backgroundPanel = new Phaser.GameObjects.Rectangle(
      this.scene,
      FOOTER_LAYOUT.WIDTH / 2,
      FOOTER_LAYOUT.HEIGHT / 2,
      FOOTER_LAYOUT.WIDTH,
      FOOTER_LAYOUT.HEIGHT,
      FOOTER_COLORS.BACKGROUND,
      0.95,
    );
    this.container.add(this._backgroundPanel);

    // 上部ボーダーライン
    const borderLine = new Phaser.GameObjects.Rectangle(
      this.scene,
      FOOTER_LAYOUT.WIDTH / 2,
      1,
      FOOTER_LAYOUT.WIDTH,
      2,
      FOOTER_COLORS.BORDER,
      1,
    );
    this.container.add(borderLine);

    // フェーズインジケーターセクション
    const phaseIndicatorStartX = FOOTER_LAYOUT.PADDING + 30;
    const phaseIndicatorY = 30;
    const phaseSpacing = 70;

    // 4つのフェーズインジケーター（円）を作成
    this._phaseIndicatorCircles = VALID_GAME_PHASES.map((phase, index) => {
      const x = phaseIndicatorStartX + index * phaseSpacing;

      // 円形インジケーター
      const circle = new Phaser.GameObjects.Arc(
        this.scene,
        x,
        phaseIndicatorY,
        12,
        0,
        360,
        false,
        PHASE_COLORS.PENDING,
      );
      circle.setStrokeStyle(2, 0x4b5563);
      this.container.add(circle);

      // フェーズラベル
      const label = this.scene.make.text({
        x: x - 12,
        y: phaseIndicatorY + 18,
        text: PHASE_LABELS[phase],
        style: { fontSize: '11px', color: '#9CA3AF' },
        add: false,
      });
      this.container.add(label);
      this._phaseLabels.push(label);

      return circle;
    });
    this._phaseIndicators = this._phaseIndicatorCircles;

    // 接続線を描画
    const connectionLine = new Phaser.GameObjects.Graphics(this.scene);
    connectionLine.lineStyle(2, 0x4b5563);
    connectionLine.beginPath();
    connectionLine.moveTo(phaseIndicatorStartX + 15, phaseIndicatorY);
    connectionLine.lineTo(
      phaseIndicatorStartX + (VALID_GAME_PHASES.length - 1) * phaseSpacing - 15,
      phaseIndicatorY,
    );
    connectionLine.strokePath();
    this.container.add(connectionLine);
    // 円を前面に
    for (const circle of this._phaseIndicatorCircles) {
      this.container.bringToTop(circle);
    }

    // 5つの手札プレースホルダー（矩形）を作成
    const handStartX = 320;
    const handY = FOOTER_LAYOUT.HEIGHT / 2;
    const cardWidth = 50;
    const cardHeight = 70;
    const cardSpacing = 60;

    this._handPlaceholders = [];
    for (let i = 0; i < HAND_DISPLAY_CAPACITY; i++) {
      // カードプレースホルダー背景
      const placeholder = new Phaser.GameObjects.Rectangle(
        this.scene,
        handStartX + i * cardSpacing,
        handY,
        cardWidth,
        cardHeight,
        FOOTER_COLORS.CARD_PLACEHOLDER,
        0.5,
      );
      placeholder.setStrokeStyle(2, FOOTER_COLORS.CARD_PLACEHOLDER_BORDER);
      this.container.add(placeholder);
      this._handPlaceholders.push(placeholder);
    }
    this._handDisplayArea = this._handPlaceholders;

    // 次へボタンコンテナを作成
    const buttonX = FOOTER_LAYOUT.WIDTH - 80;
    const buttonY = FOOTER_LAYOUT.HEIGHT / 2;
    this._nextButtonContainer = this.scene.make.container({ x: buttonX, y: buttonY, add: false });
    this._nextButtonContainer.name = 'FooterUI.nextButton';
    this.container.add(this._nextButtonContainer);

    // 次へボタン背景を作成（角丸風）
    this._nextButtonBackground = new Phaser.GameObjects.Rectangle(
      this.scene,
      0,
      0,
      120,
      44,
      BUTTON_COLORS.PRIMARY,
    );
    this._nextButtonBackground.setInteractive({ useHandCursor: true });
    this._nextButtonBackground.on('pointerover', () => {
      if (this._nextButtonEnabled) {
        this._nextButtonBackground?.setFillStyle(BUTTON_COLORS.PRIMARY_HOVER);
      }
    });
    this._nextButtonBackground.on('pointerout', () => {
      const color = this._nextButtonEnabled ? BUTTON_COLORS.PRIMARY : BUTTON_COLORS.DISABLED;
      this._nextButtonBackground?.setFillStyle(color);
    });
    this._nextButtonBackground.on('pointerdown', () => {
      if (this._onNextClickCallback && this._nextButtonEnabled) {
        this._onNextClickCallback();
      }
    });
    this._nextButtonContainer.add(this._nextButtonBackground);

    // 次へボタンテキストを作成
    this._nextButtonText = this.scene.make.text({
      x: -24,
      y: -10,
      text: '',
      style: { fontSize: '16px', color: '#FFFFFF', fontStyle: 'bold' },
      add: false,
    });
    this._nextButtonContainer.add(this._nextButtonText);
  }

  /**
   * コンポーネントの破棄処理
   */
  destroy(): void {
    this.container.destroy();
  }

  // ===========================================================================
  // ゲッターメソッド
  // ===========================================================================

  /**
   * フェーズインジケーターを取得
   *
   * @returns 4つのフェーズインジケーター
   */
  // biome-ignore lint/suspicious/noExplicitAny: UI要素の配列の戻り値型は複雑なためanyを使用
  getPhaseIndicators(): any[] {
    return this._phaseIndicators;
  }

  /**
   * 手札表示エリアを取得
   *
   * @returns 手札表示エリア
   */
  // biome-ignore lint/suspicious/noExplicitAny: UI要素の戻り値型は複雑なためanyを使用
  getHandDisplayArea(): any {
    return this._handDisplayArea;
  }

  /**
   * 手札表示エリアの最大表示数を取得
   *
   * @returns 最大表示数（5）
   */
  getHandDisplayAreaCapacity(): number {
    return HAND_DISPLAY_CAPACITY;
  }

  /**
   * 現在のフェーズインジケーター状態を取得
   *
   * @returns 現在のフェーズの状態
   */
  getCurrentPhaseIndicatorState(): PhaseIndicatorState {
    if (this._currentPhase === null) {
      return 'PENDING';
    }
    return this._phaseStates[this._currentPhase];
  }

  /**
   * 指定フェーズのインジケーター状態を取得
   *
   * @param phase - 対象フェーズ
   * @returns フェーズの状態
   * @throws {Error} 無効なフェーズが指定された場合
   */
  getPhaseIndicatorState(phase: GamePhase): PhaseIndicatorState {
    if (!this.isValidPhase(phase)) {
      throw new Error(`Invalid phase: ${phase}`);
    }
    return this._phaseStates[phase];
  }

  /**
   * 次へボタンのラベルを取得
   *
   * @returns ボタンラベル
   */
  getNextButtonLabel(): string {
    return this._nextButtonLabel;
  }

  // ===========================================================================
  // 更新メソッド
  // ===========================================================================

  /**
   * フェーズインジケーターを更新
   * TASK-0047: 視覚要素を更新
   *
   * @param currentPhase - 現在のフェーズ
   * @param completedPhases - 完了したフェーズの配列
   * @throws {Error} 無効なフェーズが指定された場合
   */
  updatePhaseIndicator(currentPhase: GamePhase, completedPhases: GamePhase[]): void {
    // 無効なフェーズのチェック
    if (!this.isValidPhase(currentPhase)) {
      throw new Error(`Invalid phase: ${currentPhase}`);
    }

    this._currentPhase = currentPhase;

    // 全フェーズの状態をリセットし、視覚要素を更新
    for (let i = 0; i < VALID_GAME_PHASES.length; i++) {
      const phase = VALID_GAME_PHASES[i];
      let color: number = PHASE_COLORS.PENDING;

      if (completedPhases.includes(phase)) {
        this._phaseStates[phase] = 'COMPLETED';
        color = PHASE_COLORS.COMPLETED;
      } else if (phase === currentPhase) {
        this._phaseStates[phase] = 'CURRENT';
        color = PHASE_COLORS.CURRENT;
      } else {
        this._phaseStates[phase] = 'PENDING';
        color = PHASE_COLORS.PENDING;
      }

      // TASK-0047: 視覚要素の色を更新
      if (this._phaseIndicatorCircles[i]?.setFillStyle) {
        this._phaseIndicatorCircles[i].setFillStyle(color);
      }
    }
  }

  /**
   * 次へボタンを更新
   * TASK-0047: 視覚要素を更新
   *
   * @param label - ボタンラベル
   * @param enabled - 有効/無効状態
   */
  updateNextButton(label: string, enabled: boolean): void {
    this._nextButtonLabel = label;
    this._nextButtonEnabled = enabled;

    // TASK-0047: 視覚要素の更新
    // ボタンテキスト更新
    if (this._nextButtonText) {
      this._nextButtonText.setText(label);
    }

    // ボタン背景色更新
    if (this._nextButtonBackground) {
      const color = enabled ? BUTTON_COLORS.PRIMARY : BUTTON_COLORS.DISABLED;
      this._nextButtonBackground.setFillStyle(color);
    }
  }

  // ===========================================================================
  // イベントハンドラ
  // ===========================================================================

  /**
   * 次へボタンのクリックハンドラを設定
   *
   * @param callback - クリック時に呼ばれるコールバック関数
   */
  onNextClick(callback: () => void): void {
    this._onNextClickCallback = callback;
  }

  /**
   * 次へボタンのクリックをシミュレート（テスト用）
   */
  simulateNextButtonClick(): void {
    if (this._onNextClickCallback && this._nextButtonEnabled) {
      this._onNextClickCallback();
    }
  }

  // ===========================================================================
  // プライベートメソッド
  // ===========================================================================

  /**
   * 有効なフェーズかどうかを検証
   *
   * @param phase - 検証対象のフェーズ
   * @returns 有効な場合true
   */
  private isValidPhase(phase: GamePhase): boolean {
    return VALID_GAME_PHASES.includes(phase);
  }
}
