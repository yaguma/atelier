/**
 * MainScene.ts - メインゲームシーン
 * TASK-0046: MainScene共通レイアウト実装
 *
 * @description
 * ゲームのメイン画面を表示するシーン。
 * ヘッダー、サイドバー、フッター、コンテンツエリアの4分割レイアウトを構築。
 *
 * @信頼性レベル 🔵 requirements.md セクション2.1に基づく
 */

import { FooterUI } from '@presentation/ui/components/FooterUI';
import { HeaderUI } from '@presentation/ui/components/HeaderUI';
import { SidebarUI } from '@presentation/ui/components/SidebarUI';
import { GamePhase, VALID_GAME_PHASES } from '@shared/types/common';
import type { IPhaseChangedEvent } from '@shared/types/events';
import { GameEventType } from '@shared/types/events';
import Phaser from 'phaser';

// =============================================================================
// 定数
// =============================================================================

/**
 * レイアウト定数
 */
const LAYOUT = {
  /** サイドバー幅 */
  SIDEBAR_WIDTH: 200,
  /** ヘッダー高さ */
  HEADER_HEIGHT: 60,
  /** フッター高さ */
  FOOTER_HEIGHT: 120,
} as const;

/**
 * フェーズごとのボタンラベルマッピング
 */
const PHASE_BUTTON_LABELS: Record<GamePhase, string> = {
  [GamePhase.QUEST_ACCEPT]: '採取へ',
  [GamePhase.GATHERING]: '調合へ',
  [GamePhase.ALCHEMY]: '納品へ',
  [GamePhase.DELIVERY]: '日終了',
};

// =============================================================================
// 型定義
// =============================================================================

/**
 * StateManager インターフェース（依存注入用）
 */
interface IStateManager {
  getState(): {
    currentRank: string;
    promotionGauge: number;
    remainingDays: number;
    currentDay: number;
    currentPhase: GamePhase;
    gold: number;
    actionPoints: number;
    comboCount: number;
    rankHp: number;
    isPromotionTest: boolean;
  };
  updateState(state: Partial<ReturnType<IStateManager['getState']>>): void;
  setPhase(phase: GamePhase): void;
  canTransitionTo(phase: GamePhase): boolean;
  addGold(amount: number): void;
  spendGold(amount: number): boolean;
  addContribution(amount: number): void;
}

/**
 * GameFlowManager インターフェース（依存注入用）
 */
interface IGameFlowManager {
  getCurrentPhase(): GamePhase;
  canAdvancePhase(): boolean;
  startPhase(phase: GamePhase): void;
  endPhase(): void;
  startNewGame(): void;
  continueGame(): void;
  startDay(): void;
  endDay(): void;
  skipPhase(): void;
}

/**
 * EventBus インターフェース（依存注入用）
 */
interface IEventBus {
  emit(event: string, data: unknown): void;
  on(event: string, handler: (...args: unknown[]) => void): void;
  off(event: string, handler?: (...args: unknown[]) => void): void;
}

// =============================================================================
// MainSceneクラス
// =============================================================================

/**
 * MainScene - メインゲーム画面シーン
 *
 * 【責務】:
 * - ゲームのメイン画面を表示
 * - 4分割レイアウト（ヘッダー、サイドバー、フッター、コンテンツ）の管理
 * - イベント購読とUI更新
 *
 * @信頼性レベル 🔵 requirements.md セクション2.1に基づく
 */
export class MainScene extends Phaser.Scene {
  // ===========================================================================
  // 依存サービス
  // ===========================================================================

  /** 状態管理サービス */
  private stateManager!: IStateManager;

  /** ゲームフロー管理サービス */
  private gameFlowManager!: IGameFlowManager;

  /** イベントバス */
  private eventBus!: IEventBus;

  // ===========================================================================
  // UIコンポーネント
  // ===========================================================================

  /** ヘッダーUI */
  private headerUI!: HeaderUI;

  /** サイドバーUI */
  private sidebarUI!: SidebarUI;

  /** フッターUI */
  private footerUI!: FooterUI;

  /** コンテンツコンテナ（各フェーズUIの親コンテナとして将来使用予定） */
  // biome-ignore lint/correctness/noUnusedPrivateClassMembers: 将来のフェーズUI実装で使用予定
  private _contentContainer!: Phaser.GameObjects.Container;

  // ===========================================================================
  // 内部状態
  // ===========================================================================

  /** 現在表示中のフェーズ */
  private _currentVisiblePhase: GamePhase | null = null;

  /** フェーズUIの可視性マップ */
  private _phaseUIVisibility: Record<GamePhase, boolean> = {
    [GamePhase.QUEST_ACCEPT]: false,
    [GamePhase.GATHERING]: false,
    [GamePhase.ALCHEMY]: false,
    [GamePhase.DELIVERY]: false,
  };

  /** 完了したフェーズの配列 */
  private _completedPhases: GamePhase[] = [];

  // ===========================================================================
  // コンストラクタ
  // ===========================================================================

  constructor() {
    super({ key: 'MainScene' });
  }

  // ===========================================================================
  // ライフサイクルメソッド
  // ===========================================================================

  /**
   * create() - メイン画面の生成
   *
   * @throws {Error} StateManagerが未初期化の場合
   * @throws {Error} GameFlowManagerが未初期化の場合
   * @throws {Error} EventBusが未初期化の場合
   */
  create(): void {
    // サービスの検証
    this.validateServices();

    // UIコンポーネントの作成
    this.createLayoutComponents();

    // イベント購読の設定
    this.setupEventSubscriptions();

    // 初期状態の反映
    this.updateHeader();
    this.updateFooterForPhase(this.stateManager.getState().currentPhase);
  }

  // ===========================================================================
  // プライベートメソッド - 初期化
  // ===========================================================================

  /**
   * サービスの存在を検証
   *
   * @throws {Error} 必要なサービスが未初期化の場合
   */
  private validateServices(): void {
    if (!this.stateManager) {
      throw new Error('StateManager is required');
    }
    if (!this.gameFlowManager) {
      throw new Error('GameFlowManager is required');
    }
    if (!this.eventBus) {
      throw new Error('EventBus is required');
    }
  }

  /**
   * レイアウトコンポーネントを作成
   */
  private createLayoutComponents(): void {
    // ヘッダーUI（画面上部、サイドバー右側から開始）
    this.headerUI = new HeaderUI(this, LAYOUT.SIDEBAR_WIDTH, 0);
    this.headerUI.create();

    // サイドバーUI（画面左側、ヘッダー下から開始）
    this.sidebarUI = new SidebarUI(this, 0, LAYOUT.HEADER_HEIGHT);
    this.sidebarUI.create();

    // フッターUI（画面下部、サイドバー右側から開始）
    const footerY = this.cameras.main.height - LAYOUT.FOOTER_HEIGHT;
    this.footerUI = new FooterUI(this, LAYOUT.SIDEBAR_WIDTH, footerY);
    this.footerUI.create();

    // コンテンツコンテナ（中央エリア）
    this._contentContainer = this.add.container(LAYOUT.SIDEBAR_WIDTH, LAYOUT.HEADER_HEIGHT);
  }

  /**
   * イベント購読を設定
   */
  private setupEventSubscriptions(): void {
    // PHASE_CHANGEDイベント
    this.eventBus.on(GameEventType.PHASE_CHANGED, (data: unknown) => {
      const event = data as IPhaseChangedEvent;
      this.handlePhaseChanged(event);
    });

    // DAY_STARTEDイベント
    this.eventBus.on(GameEventType.DAY_STARTED, (data: unknown) => {
      const event = data as { remainingDays: number };
      this.handleDayStarted(event);
    });
  }

  // ===========================================================================
  // イベントハンドラ
  // ===========================================================================

  /**
   * PHASE_CHANGEDイベントハンドラ
   *
   * @param event - フェーズ変更イベント
   */
  private handlePhaseChanged(event: IPhaseChangedEvent): void {
    // 完了フェーズの追加
    if (!this._completedPhases.includes(event.previousPhase)) {
      this._completedPhases.push(event.previousPhase);
    }

    // フェーズインジケーターの更新
    this.footerUI.updatePhaseIndicator(event.newPhase, this._completedPhases);

    // フェーズUIの表示切り替え
    this.showPhase(event.newPhase);

    // 次へボタンの更新
    this.updateFooterForPhase(event.newPhase);
  }

  /**
   * DAY_STARTEDイベントハンドラ
   *
   * @param event - 日開始イベント
   */
  private handleDayStarted(event: { remainingDays: number }): void {
    // 完了フェーズをリセット
    this._completedPhases = [];

    // ヘッダーの更新（残り日数を反映）
    const state = this.stateManager.getState();
    this.headerUI.update({
      currentRank: state.currentRank,
      promotionGauge: state.promotionGauge,
      remainingDays: event.remainingDays,
      gold: state.gold,
      actionPoints: state.actionPoints,
      maxActionPoints: 3, // 固定値（将来的にはStateManagerから取得）
    });
  }

  // ===========================================================================
  // 更新メソッド
  // ===========================================================================

  /**
   * ヘッダーを更新
   */
  updateHeader(): void {
    const state = this.stateManager.getState();
    this.headerUI.update({
      currentRank: state.currentRank,
      promotionGauge: state.promotionGauge,
      remainingDays: state.remainingDays,
      gold: state.gold,
      actionPoints: state.actionPoints,
      maxActionPoints: 3, // 固定値（将来的にはStateManagerから取得）
    });
  }

  /**
   * フッターをフェーズに応じて更新
   *
   * @param phase - 現在のフェーズ
   */
  private updateFooterForPhase(phase: GamePhase): void {
    const label = PHASE_BUTTON_LABELS[phase];
    this.footerUI.updateNextButton(label, true);
    this.footerUI.updatePhaseIndicator(phase, this._completedPhases);
  }

  // ===========================================================================
  // フェーズUI管理
  // ===========================================================================

  /**
   * 指定フェーズのUIを表示
   *
   * @param phase - 表示するフェーズ
   * @throws {Error} 無効なフェーズが指定された場合
   */
  showPhase(phase: GamePhase): void {
    // 無効なフェーズのチェック
    if (!VALID_GAME_PHASES.includes(phase)) {
      throw new Error(`Invalid phase: ${phase}`);
    }

    // 同じフェーズなら何もしない
    if (this._currentVisiblePhase === phase) {
      return;
    }

    // 全フェーズを非表示に
    for (const p of VALID_GAME_PHASES) {
      this._phaseUIVisibility[p] = false;
    }

    // 指定フェーズのみ表示
    this._phaseUIVisibility[phase] = true;
    this._currentVisiblePhase = phase;
  }

  /**
   * 指定フェーズのUIが表示されているか
   *
   * @param phase - 確認するフェーズ
   * @returns 表示中の場合true
   */
  isPhaseUIVisible(phase: GamePhase): boolean {
    return this._phaseUIVisibility[phase];
  }

  /**
   * コンテンツコンテナを取得（フェーズUI配置用）
   *
   * @returns コンテンツコンテナ
   */
  getContentContainer(): Phaser.GameObjects.Container {
    return this._contentContainer;
  }
}
