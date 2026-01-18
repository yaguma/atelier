/**
 * FooterUI - フッターUIコンポーネント
 * TASK-0020 MainScene共通レイアウト
 *
 * @description
 * フッター領域のUIコンポーネント。
 * フェーズインジケーター、手札表示エリア、休憩ボタン、次へボタンを表示する。
 *
 * TDD Refactorフェーズ: 定数抽出とリソース管理改善
 */

import type Phaser from 'phaser';
import type { GamePhase } from '../../../shared/types/common';
import type { IGameState } from '../../../shared/types/game-state';
import { BaseComponent } from '../components/BaseComponent';
import { THEME } from '../theme';

// =============================================================================
// レイアウト定数定義
// =============================================================================

/** フッターのX座標 */
const FOOTER_X = 0;

/** フッターのY座標（720 - 160 = 560） */
const FOOTER_Y = 560;

/** フッターの高さ */
const FOOTER_HEIGHT = 160;

/** 手札エリアの高さ */
const HAND_AREA_HEIGHT = 120;

/** フェーズインジケーターの高さ */
const PHASE_INDICATOR_HEIGHT = 40;

// =============================================================================
// フェーズラベル定義
// =============================================================================

/**
 * フェーズラベル定義
 * 各ゲームフェーズの日本語表示名
 */
const PHASE_LABELS: Record<GamePhase, string> = {
  QUEST_ACCEPT: '依頼受注フェーズ',
  GATHERING: '採集フェーズ',
  ALCHEMY: '調合フェーズ',
  DELIVERY: '納品フェーズ',
} as const;

/**
 * フェーズカラー定義
 * 各ゲームフェーズの識別色
 */
const PHASE_COLORS: Record<GamePhase, number> = {
  QUEST_ACCEPT: THEME.colors.primary,
  GATHERING: THEME.colors.success,
  ALCHEMY: THEME.colors.secondary,
  DELIVERY: THEME.colors.warning,
} as const;

// =============================================================================
// フッターUIクラス
// =============================================================================

/**
 * フッターUIコンポーネントクラス
 *
 * 画面下部に配置され、フェーズ進行と手札を表示する
 */
export class FooterUI extends BaseComponent {
  // =========================================================================
  // プライベートフィールド
  // =========================================================================

  /** 背景Graphics */
  private background: Phaser.GameObjects.Graphics | null = null;

  /** フェーズインジケーター背景 */
  private phaseIndicatorBackground: Phaser.GameObjects.Graphics | null = null;

  /** フェーズラベルテキスト */
  private phaseLabel: Phaser.GameObjects.Text | null = null;

  /** 手札エリアコンテナ */
  private handArea: Phaser.GameObjects.Container | null = null;

  /** 休憩ボタン */
  private restButton: Phaser.GameObjects.Container | null = null;

  /** 次へボタン */
  private nextButton: Phaser.GameObjects.Container | null = null;

  /** 現在のフェーズ */
  private currentPhase: GamePhase | null = null;

  // =========================================================================
  // コンストラクタ
  // =========================================================================

  /**
   * コンストラクタ
   *
   * @param scene - Phaserシーンインスタンス
   * @throws {Error} sceneがnullまたはundefinedの場合
   */
  constructor(scene: Phaser.Scene) {
    super(scene, FOOTER_X, FOOTER_Y);
  }

  // =========================================================================
  // パブリックメソッド
  // =========================================================================

  /**
   * UIを初期化して生成する
   */
  create(): void {
    this.container.setDepth(200);
    this.container.add([]);
  }

  /**
   * リソースを解放する
   */
  destroy(): void {
    // プライベートフィールドのGameObjectsを解放
    this.destroyGameObjects();

    // コンテナを破棄
    this.container.destroy();
  }

  /**
   * ゲーム状態に基づいてUIを更新する
   *
   * @param state - ゲーム状態
   */
  update(state: IGameState): void {
    // フェーズが変わった場合のみ更新
    if (this.currentPhase !== state.currentPhase) {
      this.currentPhase = state.currentPhase;
      this.updatePhaseIndicator(state.currentPhase);
    }
  }

  // =========================================================================
  // プライベートメソッド
  // =========================================================================

  /**
   * フェーズインジケーターを更新する
   *
   * @param _phase - 現在のゲームフェーズ
   */
  private updatePhaseIndicator(_phase: GamePhase): void {
    // 将来の実装でフェーズラベルとカラーを更新する
  }

  /**
   * 保持しているGameObjectsを解放する
   */
  private destroyGameObjects(): void {
    if (this.background) {
      this.background.destroy();
      this.background = null;
    }
    if (this.phaseIndicatorBackground) {
      this.phaseIndicatorBackground.destroy();
      this.phaseIndicatorBackground = null;
    }
    if (this.phaseLabel) {
      this.phaseLabel.destroy();
      this.phaseLabel = null;
    }
    if (this.handArea) {
      this.handArea.destroy();
      this.handArea = null;
    }
    if (this.restButton) {
      this.restButton.destroy();
      this.restButton = null;
    }
    if (this.nextButton) {
      this.nextButton.destroy();
      this.nextButton = null;
    }
  }
}

// =============================================================================
// エクスポート（テスト用）
// =============================================================================

/** テスト用にフッター定数をエクスポート */
export { FOOTER_HEIGHT, HAND_AREA_HEIGHT, PHASE_INDICATOR_HEIGHT, PHASE_LABELS, PHASE_COLORS };
