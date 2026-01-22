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
import type Phaser from 'phaser';
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
  /** 無効時（グレー） */
  DISABLED: 0x4b5563,
} as const;

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

  // ===========================================================================
  // ライフサイクルメソッド
  // ===========================================================================

  /**
   * コンポーネントの初期化処理
   * TASK-0047: 視覚要素を生成
   */
  create(): void {
    // 4つのフェーズインジケーター（円）を作成
    this._phaseIndicatorCircles = VALID_GAME_PHASES.map((_, index) => {
      const circle = this.scene.add.circle(50 + index * 80, 20, 15, PHASE_COLORS.PENDING);
      this.container.add(circle);
      return circle;
    });
    this._phaseIndicators = this._phaseIndicatorCircles;

    // 5つの手札プレースホルダー（矩形）を作成
    this._handPlaceholders = [];
    for (let i = 0; i < HAND_DISPLAY_CAPACITY; i++) {
      const placeholder = this.scene.add.rectangle(400 + i * 80, 40, 60, 80, 0x374151);
      this.container.add(placeholder);
      this._handPlaceholders.push(placeholder);
    }
    this._handDisplayArea = this._handPlaceholders;

    // 次へボタンコンテナを作成
    this._nextButtonContainer = this.scene.add.container(900, 40);
    this.container.add(this._nextButtonContainer);

    // 次へボタン背景を作成
    this._nextButtonBackground = this.scene.add.rectangle(0, 0, 120, 40, BUTTON_COLORS.PRIMARY);
    this._nextButtonBackground.setInteractive();
    this._nextButtonBackground.on('pointerdown', () => {
      if (this._onNextClickCallback && this._nextButtonEnabled) {
        this._onNextClickCallback();
      }
    });
    this._nextButtonContainer.add(this._nextButtonBackground);

    // 次へボタンテキストを作成
    this._nextButtonText = this.scene.add.text(-30, -10, '', {
      fontSize: '16px',
      color: '#FFFFFF',
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
