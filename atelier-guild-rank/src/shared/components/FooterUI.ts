/**
 * フッターUIコンポーネント
 * TASK-0046 MainScene共通レイアウト実装
 * TASK-0047 共通UIコンポーネント視覚実装
 * TASK-0112 FooterUI変更（フェーズタブ統合）
 *
 * @description
 * PhaseTabUI（フェーズタブ＋日終了ボタン）と手札表示エリアを含むフッター。
 * TASK-0112でプログレスバーと「次へ」ボタンを廃止し、PhaseTabUIを統合。
 *
 * @信頼性レベル 🔵 REQ-006・architecture.md「FooterUI変更」より
 */

import type { IEventBus } from '@shared/services/event-bus/types';
import type { IGameFlowManager } from '@shared/services/game-flow/game-flow-manager.interface';
import type { GamePhase } from '@shared/types';
import Phaser from 'phaser';
import { BaseComponent } from './BaseComponent';
import { PhaseTabUI } from './PhaseTabUI';

// =============================================================================
// 定数
// =============================================================================

/**
 * 手札表示エリアの最大表示数
 */
const HAND_DISPLAY_CAPACITY = 5;

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
  /** PhaseTabUIのY座標オフセット */
  PHASE_TAB_Y: 0,
  /** 手札表示開始X座標 */
  HAND_START_X: 320,
  /** カード幅 */
  CARD_WIDTH: 50,
  /** カード高さ */
  CARD_HEIGHT: 70,
  /** カード間のスペース */
  CARD_SPACING: 60,
} as const;

// =============================================================================
// FooterUIクラス
// =============================================================================

/**
 * フッターUIコンポーネント
 *
 * 画面下部に配置され、以下の情報を表示する:
 * - PhaseTabUI（フェーズタブ＋日終了ボタン）
 * - 手札表示エリア
 *
 * @信頼性レベル 🔵 REQ-006・architecture.md「FooterUI変更」より
 */
export class FooterUI extends BaseComponent {
  // ===========================================================================
  // 依存サービス
  // ===========================================================================

  /** GameFlowManagerへの参照 */
  private readonly gameFlowManager: IGameFlowManager;

  /** EventBusへの参照 */
  private readonly eventBus: IEventBus;

  // ===========================================================================
  // 内部状態
  // ===========================================================================

  /** PhaseTabUIインスタンス */
  private _phaseTabUI: PhaseTabUI | null = null;

  /** 手札表示エリア（プレースホルダー矩形の配列） */
  private _handDisplayArea: Phaser.GameObjects.Rectangle[] = [];

  /** 背景パネル */
  private _backgroundPanel: Phaser.GameObjects.Rectangle | null = null;

  /** 初期フェーズ */
  private readonly _initialPhase: GamePhase;

  // ===========================================================================
  // コンストラクタ
  // ===========================================================================

  /**
   * コンストラクタ
   *
   * @param scene - Phaserシーンインスタンス
   * @param x - X座標
   * @param y - Y座標
   * @param gameFlowManager - GameFlowManagerインスタンス
   * @param eventBus - EventBusインスタンス
   * @param initialPhase - 初期フェーズ
   */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    gameFlowManager: IGameFlowManager,
    eventBus: IEventBus,
    initialPhase: GamePhase,
  ) {
    super(scene, x, y);
    this.gameFlowManager = gameFlowManager;
    this.eventBus = eventBus;
    this._initialPhase = initialPhase;
  }

  // ===========================================================================
  // ライフサイクルメソッド
  // ===========================================================================

  /**
   * コンポーネントの初期化処理
   * 🔵 信頼性レベル: REQ-006・architecture.md「FooterUI変更」より
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

    // PhaseTabUIを作成・統合
    this._phaseTabUI = new PhaseTabUI(
      this.scene,
      0,
      FOOTER_LAYOUT.PHASE_TAB_Y,
      this.gameFlowManager,
      this.eventBus,
      this._initialPhase,
      { addToScene: false },
    );
    this._phaseTabUI.create();
    this.container.add(this._phaseTabUI.getContainer());

    // 5つの手札プレースホルダー（矩形）を作成
    const handY = FOOTER_LAYOUT.HEIGHT / 2;

    for (let i = 0; i < HAND_DISPLAY_CAPACITY; i++) {
      const placeholder = new Phaser.GameObjects.Rectangle(
        this.scene,
        FOOTER_LAYOUT.HAND_START_X + i * FOOTER_LAYOUT.CARD_SPACING,
        handY,
        FOOTER_LAYOUT.CARD_WIDTH,
        FOOTER_LAYOUT.CARD_HEIGHT,
        FOOTER_COLORS.CARD_PLACEHOLDER,
        0.5,
      );
      placeholder.setStrokeStyle(2, FOOTER_COLORS.CARD_PLACEHOLDER_BORDER);
      this.container.add(placeholder);
      this._handDisplayArea.push(placeholder);
    }
  }

  /**
   * コンポーネントの破棄処理
   */
  destroy(): void {
    // PhaseTabUIの破棄
    this._phaseTabUI?.destroy();
    this._phaseTabUI = null;

    // コンテナ破棄
    this.container.destroy(true);
  }

  // ===========================================================================
  // ゲッターメソッド
  // ===========================================================================

  /**
   * PhaseTabUIインスタンスを取得
   *
   * @returns PhaseTabUIインスタンス
   */
  getPhaseTabUI(): PhaseTabUI | null {
    return this._phaseTabUI;
  }

  /**
   * 手札表示エリアを取得
   *
   * @returns 手札表示エリア
   */
  getHandDisplayArea(): Phaser.GameObjects.Rectangle[] {
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
}
