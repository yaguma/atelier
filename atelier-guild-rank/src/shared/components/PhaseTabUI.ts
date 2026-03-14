/**
 * フェーズタブUIコンポーネント
 * TASK-0111: PhaseTabUI実装
 *
 * @description
 * フェーズ切り替え用のタブUIコンポーネント。
 * 依頼・採取・調合・納品の4タブ、アクティブタブ強調、クリックによるフェーズ切り替え、
 * 日終了ボタンを含む。
 *
 * @信頼性レベル 🔵 REQ-006・architecture.mdより
 */

import type { IEventBus } from '@shared/services/event-bus/types';
import type { IGameFlowManager } from '@shared/services/game-flow/game-flow-manager.interface';
import type { GamePhase, IPhaseChangedEvent, IPhaseSwitchRequest } from '@shared/types';
import { VALID_GAME_PHASES } from '@shared/types/common';
import { GameEventType } from '@shared/types/events';
import Phaser from 'phaser';
import type { BaseComponentOptions } from './BaseComponent';
import { BaseComponent } from './BaseComponent';

// =============================================================================
// 定数
// =============================================================================

/**
 * タブ用フェーズカラー定数
 * 🔵 信頼性レベル: REQ-006-02・既存PHASE_COLORSより
 */
const TAB_COLORS = {
  /** アクティブタブ背景 */
  ACTIVE: 0x6366f1,
  /** 非アクティブタブ背景 */
  INACTIVE: 0x374151,
  /** アクティブタブテキスト */
  ACTIVE_TEXT: '#FFFFFF',
  /** 非アクティブタブテキスト */
  INACTIVE_TEXT: '#9CA3AF',
  /** 日終了ボタン背景 */
  END_DAY_BUTTON: 0xef4444,
  /** 日終了ボタンホバー */
  END_DAY_BUTTON_HOVER: 0xf87171,
  /** 休憩ボタン背景 */
  REST_BUTTON: 0x3b82f6,
  /** 休憩ボタンホバー */
  REST_BUTTON_HOVER: 0x60a5fa,
} as const;

/**
 * タブレイアウト定数
 */
const TAB_LAYOUT = {
  /** タブ幅 */
  TAB_WIDTH: 100,
  /** タブ高さ */
  TAB_HEIGHT: 40,
  /** タブ間のスペース */
  TAB_SPACING: 8,
  /** タブ開始X座標 */
  TAB_START_X: 16,
  /** タブY座標 */
  TAB_Y: 20,
  /** テキストX方向オフセット（タブ中心からの補正） */
  TEXT_OFFSET_X: 12,
  /** テキストY方向オフセット（タブ中心からの補正） */
  TEXT_OFFSET_Y: 8,
  /** 日終了ボタン幅 */
  END_DAY_WIDTH: 80,
  /** 日終了ボタン高さ */
  END_DAY_HEIGHT: 36,
  /** 日終了ボタンマージン */
  END_DAY_MARGIN: 16,
  /** 日終了テキストX方向オフセット */
  END_DAY_TEXT_OFFSET_X: 24,
  /** 休憩ボタン幅 */
  REST_WIDTH: 80,
  /** 休憩ボタン高さ */
  REST_HEIGHT: 36,
  /** 休憩ボタンマージン */
  REST_MARGIN: 8,
  /** 休憩テキストX方向オフセット */
  REST_TEXT_OFFSET_X: 16,
} as const;

/**
 * フェーズ名ラベル
 * 🔵 信頼性レベル: 既存FooterUIから流用
 */
const PHASE_LABELS: Record<GamePhase, string> = {
  QUEST_ACCEPT: '依頼',
  GATHERING: '採取',
  ALCHEMY: '調合',
  DELIVERY: '納品',
};

// =============================================================================
// PhaseTabUIクラス
// =============================================================================

/**
 * フェーズタブUIコンポーネント
 *
 * 画面上部に配置され、以下の機能を提供する:
 * - 4つのフェーズタブ（依頼・採取・調合・納品）
 * - アクティブタブの視覚的強調
 * - タブクリックによるフェーズ切り替え
 * - 日終了ボタン
 *
 * @信頼性レベル 🔵 REQ-006-01〜REQ-006-03・architecture.md「PhaseTabUI」より
 */
export class PhaseTabUI extends BaseComponent {
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

  /** 現在のアクティブフェーズ */
  private _activePhase: GamePhase;

  /** EventBus購読解除関数 */
  private _unsubscribePhaseChanged: (() => void) | null = null;

  /** 破棄済みフラグ */
  private _isDestroyed = false;

  // ===========================================================================
  // 視覚要素
  // ===========================================================================

  /** タブ背景の配列 */
  private _tabBackgrounds: Phaser.GameObjects.Rectangle[] = [];

  /** タブテキストの配列 */
  private _tabTexts: Phaser.GameObjects.Text[] = [];

  /** 日終了ボタン背景 */
  private _endDayBackground: Phaser.GameObjects.Rectangle | null = null;

  /** 日終了ボタンテキスト */
  private _endDayText: Phaser.GameObjects.Text | null = null;

  /** 休憩ボタン背景 */
  private _restBackground: Phaser.GameObjects.Rectangle | null = null;

  /** 休憩ボタンテキスト */
  private _restText: Phaser.GameObjects.Text | null = null;

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
    options?: BaseComponentOptions,
  ) {
    super(scene, x, y, options);
    this.gameFlowManager = gameFlowManager;
    this.eventBus = eventBus;
    this._activePhase = initialPhase;
  }

  // ===========================================================================
  // ライフサイクルメソッド
  // ===========================================================================

  /**
   * コンポーネントの初期化処理
   * 🔵 信頼性レベル: REQ-006-01より
   */
  create(): void {
    // 4つのフェーズタブを生成
    this._tabBackgrounds = [];
    this._tabTexts = [];

    for (let i = 0; i < VALID_GAME_PHASES.length; i++) {
      const phase = VALID_GAME_PHASES[i];
      const tabX =
        TAB_LAYOUT.TAB_START_X +
        i * (TAB_LAYOUT.TAB_WIDTH + TAB_LAYOUT.TAB_SPACING) +
        TAB_LAYOUT.TAB_WIDTH / 2;
      const isActive = phase === this._activePhase;

      // タブ背景
      const bg = new Phaser.GameObjects.Rectangle(
        this.scene,
        tabX,
        TAB_LAYOUT.TAB_Y,
        TAB_LAYOUT.TAB_WIDTH,
        TAB_LAYOUT.TAB_HEIGHT,
        isActive ? TAB_COLORS.ACTIVE : TAB_COLORS.INACTIVE,
      ).setName(`PhaseTabUI.tabBg${i}`);
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerdown', () => this.handleTabClick(phase));
      this.container.add(bg);
      this._tabBackgrounds.push(bg);

      // タブテキスト
      const label = PHASE_LABELS[phase] ?? phase;
      const text = this.scene.make.text({
        x: tabX - TAB_LAYOUT.TEXT_OFFSET_X,
        y: TAB_LAYOUT.TAB_Y - TAB_LAYOUT.TEXT_OFFSET_Y,
        text: label,
        style: {
          fontSize: '14px',
          color: isActive ? TAB_COLORS.ACTIVE_TEXT : TAB_COLORS.INACTIVE_TEXT,
          fontStyle: isActive ? 'bold' : 'normal',
        },
        add: false,
      });
      text.setName(`PhaseTabUI.tabText${i}`);
      this.container.add(text);
      this._tabTexts.push(text);
    }

    // 日終了ボタン
    const endDayX =
      TAB_LAYOUT.TAB_START_X +
      VALID_GAME_PHASES.length * (TAB_LAYOUT.TAB_WIDTH + TAB_LAYOUT.TAB_SPACING) +
      TAB_LAYOUT.END_DAY_WIDTH / 2 +
      TAB_LAYOUT.END_DAY_MARGIN;

    this._endDayBackground = new Phaser.GameObjects.Rectangle(
      this.scene,
      endDayX,
      TAB_LAYOUT.TAB_Y,
      TAB_LAYOUT.END_DAY_WIDTH,
      TAB_LAYOUT.END_DAY_HEIGHT,
      TAB_COLORS.END_DAY_BUTTON,
    ).setName('PhaseTabUI.endDayBg');
    this._endDayBackground.setInteractive({ useHandCursor: true });
    this._endDayBackground.on('pointerover', () => {
      this._endDayBackground?.setFillStyle(TAB_COLORS.END_DAY_BUTTON_HOVER);
    });
    this._endDayBackground.on('pointerout', () => {
      this._endDayBackground?.setFillStyle(TAB_COLORS.END_DAY_BUTTON);
    });
    this._endDayBackground.on('pointerdown', () => this.handleEndDayClick());
    this.container.add(this._endDayBackground);

    this._endDayText = this.scene.make.text({
      x: endDayX - TAB_LAYOUT.END_DAY_TEXT_OFFSET_X,
      y: TAB_LAYOUT.TAB_Y - TAB_LAYOUT.TEXT_OFFSET_Y,
      text: '日終了',
      style: { fontSize: '14px', color: '#FFFFFF', fontStyle: 'bold' },
      add: false,
    });
    this._endDayText.setName('PhaseTabUI.endDayText');
    this.container.add(this._endDayText);

    // 休憩ボタン
    const restX =
      endDayX + TAB_LAYOUT.END_DAY_WIDTH / 2 + TAB_LAYOUT.REST_MARGIN + TAB_LAYOUT.REST_WIDTH / 2;

    this._restBackground = new Phaser.GameObjects.Rectangle(
      this.scene,
      restX,
      TAB_LAYOUT.TAB_Y,
      TAB_LAYOUT.REST_WIDTH,
      TAB_LAYOUT.REST_HEIGHT,
      TAB_COLORS.REST_BUTTON,
    ).setName('PhaseTabUI.restBg');
    this._restBackground.setInteractive({ useHandCursor: true });
    this._restBackground.on('pointerover', () => {
      this._restBackground?.setFillStyle(TAB_COLORS.REST_BUTTON_HOVER);
    });
    this._restBackground.on('pointerout', () => {
      this._restBackground?.setFillStyle(TAB_COLORS.REST_BUTTON);
    });
    this._restBackground.on('pointerdown', () => this.handleRestClick());
    this.container.add(this._restBackground);

    this._restText = this.scene.make.text({
      x: restX - TAB_LAYOUT.REST_TEXT_OFFSET_X,
      y: TAB_LAYOUT.TAB_Y - TAB_LAYOUT.TEXT_OFFSET_Y,
      text: '休憩',
      style: { fontSize: '14px', color: '#FFFFFF', fontStyle: 'bold' },
      add: false,
    });
    this._restText.setName('PhaseTabUI.restText');
    this.container.add(this._restText);

    // PHASE_CHANGEDイベントの購読
    this._unsubscribePhaseChanged = this.eventBus.on<IPhaseChangedEvent>(
      GameEventType.PHASE_CHANGED,
      (event) => {
        this.updateActiveTab(event.payload.newPhase);
      },
    );
  }

  /**
   * コンポーネントの破棄処理
   * EventBus購読を確実に解除する
   */
  destroy(): void {
    if (this._isDestroyed) {
      return;
    }
    this._isDestroyed = true;

    // EventBus購読解除
    this._unsubscribePhaseChanged?.();
    this._unsubscribePhaseChanged = null;

    // コンテナ破棄
    this.container.destroy(true);
  }

  // ===========================================================================
  // 公開メソッド
  // ===========================================================================

  /**
   * 現在のアクティブフェーズを取得
   *
   * @returns 現在のアクティブフェーズ
   */
  getActivePhase(): GamePhase {
    return this._activePhase;
  }

  /**
   * タブ数を取得
   *
   * @returns タブ数
   */
  getTabCount(): number {
    return this._tabBackgrounds.length;
  }

  /**
   * タブクリックをシミュレート（テスト用）
   *
   * @param phase - クリックするフェーズ
   */
  simulateTabClick(phase: GamePhase): void {
    this.handleTabClick(phase);
  }

  /**
   * 日終了ボタンクリックをシミュレート（テスト用）
   */
  simulateEndDayClick(): void {
    this.handleEndDayClick();
  }

  /**
   * 休憩ボタンクリックをシミュレート（テスト用）
   */
  simulateRestClick(): void {
    this.handleRestClick();
  }

  // ===========================================================================
  // プライベートメソッド
  // ===========================================================================

  /**
   * タブクリック時の処理
   * 🔵 信頼性レベル: REQ-006-03「タブクリックで即座にフェーズ切り替え」より
   *
   * @param targetPhase - 遷移先フェーズ
   */
  private handleTabClick(targetPhase: GamePhase): void {
    // 同じフェーズへの遷移はスキップ
    if (targetPhase === this._activePhase) {
      return;
    }

    const request: IPhaseSwitchRequest = { targetPhase };
    this.gameFlowManager.switchPhase(request).catch(() => {
      // フェーズ切り替え失敗時は何もしない（PHASE_CHANGEDイベントが発行されないため状態は変わらない）
    });
  }

  /**
   * 日終了ボタンクリック時の処理
   * 🔵 信頼性レベル: REQ-004・REQ-004-01「残りAP破棄→日終了」より
   */
  private handleEndDayClick(): void {
    this.gameFlowManager.requestEndDay();
  }

  /**
   * 休憩ボタンクリック時の処理
   * GameFlowManagerに休憩アクションを委譲する
   */
  private handleRestClick(): void {
    this.gameFlowManager.rest();
  }

  /**
   * アクティブタブを更新
   * 🔵 信頼性レベル: 既存EventBusパターンより
   *
   * @param newPhase - 新しいアクティブフェーズ
   */
  private updateActiveTab(newPhase: GamePhase): void {
    this._activePhase = newPhase;

    for (let i = 0; i < VALID_GAME_PHASES.length; i++) {
      const phase = VALID_GAME_PHASES[i];
      const isActive = phase === newPhase;
      const bg = this._tabBackgrounds[i];
      const text = this._tabTexts[i];

      // 背景色の更新
      if (bg?.setFillStyle) {
        bg.setFillStyle(isActive ? TAB_COLORS.ACTIVE : TAB_COLORS.INACTIVE);
      }

      // テキストスタイルの更新
      if (text?.setStyle) {
        text.setStyle({
          fontSize: '14px',
          color: isActive ? TAB_COLORS.ACTIVE_TEXT : TAB_COLORS.INACTIVE_TEXT,
          fontStyle: isActive ? 'bold' : 'normal',
        });
      }
    }
  }
}
