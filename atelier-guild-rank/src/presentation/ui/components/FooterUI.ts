/**
 * フッターUIコンポーネント
 * TASK-0046 MainScene共通レイアウト実装
 *
 * @description
 * フェーズインジケーター、手札表示エリア、次へボタンを表示するフッター
 *
 * @信頼性レベル 🔵 requirements.md セクション2.4に基づく
 */

import { GamePhase, VALID_GAME_PHASES } from '@shared/types/common';
import { BaseComponent } from './BaseComponent';

// =============================================================================
// 定数
// =============================================================================

/**
 * 手札表示エリアの最大表示数
 */
const HAND_DISPLAY_CAPACITY = 5;

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
  // ライフサイクルメソッド
  // ===========================================================================

  /**
   * コンポーネントの初期化処理
   */
  create(): void {
    // 4つのフェーズインジケーターを作成
    this._phaseIndicators = VALID_GAME_PHASES.map(() => ({}));
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

    // 全フェーズの状態をリセット
    for (const phase of VALID_GAME_PHASES) {
      if (completedPhases.includes(phase)) {
        this._phaseStates[phase] = 'COMPLETED';
      } else if (phase === currentPhase) {
        this._phaseStates[phase] = 'CURRENT';
      } else {
        this._phaseStates[phase] = 'PENDING';
      }
    }
  }

  /**
   * 次へボタンを更新
   *
   * @param label - ボタンラベル
   * @param enabled - 有効/無効状態
   */
  updateNextButton(label: string, enabled: boolean): void {
    this._nextButtonLabel = label;
    this._nextButtonEnabled = enabled;
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
