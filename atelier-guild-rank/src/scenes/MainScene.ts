/**
 * MainScene.ts - メインゲームシーン
 * TASK-0095: MainSceneをsrc/scenes/に移行
 * TASK-0046: MainScene共通レイアウト実装
 * Issue #111: MainSceneで本日の依頼が表示されない問題を修正
 * Issue #266: MainScene分割リファクタリング（PhaseManager抽出）
 *
 * @description
 * ゲームのメイン画面を表示するシーン。
 * ヘッダー、サイドバー、フッター、コンテンツエリアの4分割レイアウトを構築。
 * フェーズUI管理はPhaseManagerに委譲。
 *
 * @信頼性レベル 🔵 requirements.md セクション2.1に基づく
 */

import type { IQuestService } from '@features/quest';
import { FooterUI } from '@presentation/ui/components/FooterUI';
import { HeaderUI } from '@presentation/ui/components/HeaderUI';
import { SidebarUI } from '@presentation/ui/components/SidebarUI';
import { Container, ServiceKeys } from '@shared/services/di/container';
import { GamePhase } from '@shared/types/common';
import type { IPhaseChangedEvent } from '@shared/types/events';
import { GameEventType } from '@shared/types/events';
import type { IQuest } from '@shared/types/quests';
import Phaser from 'phaser';
import { PhaseManager } from './helpers/PhaseManager';
import type {
  IBasePhaseUI,
  IMainSceneEventBus,
  IMainSceneGameFlowManager,
  IMainSceneStateManager,
  MainSceneData,
} from './types/main-scene-types';

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
 * - フェーズUI管理はPhaseManagerに委譲
 *
 * @信頼性レベル 🔵 requirements.md セクション2.1に基づく
 */
export class MainScene extends Phaser.Scene {
  // ===========================================================================
  // 依存サービス
  // ===========================================================================

  /** 状態管理サービス */
  private stateManager!: IMainSceneStateManager;

  /** ゲームフロー管理サービス */
  private gameFlowManager!: IMainSceneGameFlowManager;

  /** イベントバス */
  private eventBus!: IMainSceneEventBus;

  /** 依頼管理サービス */
  private questService!: IQuestService;

  // ===========================================================================
  // UIコンポーネント
  // ===========================================================================

  /** ヘッダーUI */
  private headerUI!: HeaderUI;

  /** サイドバーUI */
  private sidebarUI!: SidebarUI;

  /** フッターUI */
  private footerUI!: FooterUI;

  /** コンテンツコンテナ（各フェーズUIの親コンテナとして使用） */
  private _contentContainer!: Phaser.GameObjects.Container;

  /** フェーズUI管理 */
  private phaseManager!: PhaseManager;

  /** イベント購読解除関数 */
  private unsubscribeHandlers: Array<() => void> = [];

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
   * Issue #111: シーンデータを受け取り、新規ゲーム開始時はstartNewGame()を呼ぶ
   * Issue #115: EventBusをシーンデータに設定（UIコンポーネントからアクセス可能にする）
   *
   * @param data - TitleSceneから渡されるシーンデータ
   */
  create(data?: MainSceneData): void {
    // DIコンテナからサービスを取得
    this.initializeServicesFromContainer();

    // サービスの検証
    this.validateServices();

    // Issue #115: EventBusをシーンデータに設定
    this.data.set('eventBus', this.eventBus);

    // UIコンポーネントの作成
    this.createLayoutComponents();

    // フェーズUI管理を初期化
    this.phaseManager = new PhaseManager(this, this._contentContainer, this.questService);
    this.phaseManager.createPhaseUIs();

    // イベント購読の設定
    this.setupEventSubscriptions();

    // Issue #111: 新規ゲーム開始の場合、イベント購読後にstartNewGame()を呼ぶ
    if (data?.isNewGame) {
      this.gameFlowManager.startNewGame();
    } else if (data?.saveData) {
      this.gameFlowManager.continueGame(data.saveData);
    }

    // 初期状態の反映
    this.updateHeader();
    const initialPhase = this.stateManager.getState().currentPhase;

    // 初期フェーズUIを表示
    this.phaseManager.showPhase(initialPhase);

    // サイドバーの初期更新
    this.phaseManager.updateSidebar(this.sidebarUI);
  }

  // ===========================================================================
  // プライベートメソッド - 初期化
  // ===========================================================================

  /**
   * DIコンテナからサービスを取得
   */
  private initializeServicesFromContainer(): void {
    const container = Container.getInstance();
    this.stateManager = container.resolve(ServiceKeys.StateManager);
    this.gameFlowManager = container.resolve(ServiceKeys.GameFlowManager);
    this.eventBus = container.resolve(ServiceKeys.EventBus);
    this.questService = container.resolve(ServiceKeys.QuestService);
  }

  /**
   * サービスの存在を検証
   */
  private validateServices(): void {
    if (!this.stateManager) throw new Error('StateManager is required');
    if (!this.gameFlowManager) throw new Error('GameFlowManager is required');
    if (!this.eventBus) throw new Error('EventBus is required');
    if (!this.questService) throw new Error('QuestService is required');
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
    this.footerUI = new FooterUI(
      this,
      LAYOUT.SIDEBAR_WIDTH,
      footerY,
      this
        .gameFlowManager as unknown as import('@shared/services/game-flow/game-flow-manager.interface').IGameFlowManager,
      this.eventBus as unknown as import('@shared/services/event-bus/types').IEventBus,
      GamePhase.QUEST_ACCEPT,
    );
    this.footerUI.create();

    // コンテンツコンテナ（中央エリア）
    this._contentContainer = this.add.container(LAYOUT.SIDEBAR_WIDTH, LAYOUT.HEADER_HEIGHT);
    this._contentContainer.name = 'MainScene.contentContainer';
  }

  // ===========================================================================
  // イベント管理
  // ===========================================================================

  /**
   * イベント購読を設定
   */
  private setupEventSubscriptions(): void {
    this.unsubscribeHandlers = [];

    this.unsubscribeHandlers.push(
      // biome-ignore lint/suspicious/noExplicitAny: EventBusのIBusEvent型に対応
      this.eventBus.on(GameEventType.PHASE_CHANGED, (busEvent: any) => {
        const event = busEvent.payload as IPhaseChangedEvent;
        this.phaseManager.showPhase(event.newPhase);
        this.phaseManager.updateSidebar(this.sidebarUI);
      }),
    );

    this.unsubscribeHandlers.push(
      // biome-ignore lint/suspicious/noExplicitAny: EventBusのIBusEvent型に対応
      this.eventBus.on(GameEventType.DAY_STARTED, (busEvent: any) => {
        const event = busEvent.payload as { remainingDays: number };
        this.handleDayStarted(event);
      }),
    );

    this.unsubscribeHandlers.push(
      // biome-ignore lint/suspicious/noExplicitAny: EventBusのIBusEvent型に対応
      this.eventBus.on(GameEventType.QUEST_GENERATED, (busEvent: any) => {
        const event = busEvent.payload as { quests: IQuest[] };
        this.phaseManager.handleQuestGenerated(event);
      }),
    );

    this.unsubscribeHandlers.push(
      // biome-ignore lint/suspicious/noExplicitAny: EventBusのIBusEvent型に対応
      this.eventBus.on(GameEventType.QUEST_ACCEPTED, (busEvent: any) => {
        const event = busEvent.payload as { quest: IQuest };
        this.phaseManager.handleQuestAccepted(event, this.sidebarUI);
      }),
    );
  }

  /**
   * シーン終了時のクリーンアップ
   * イベント購読解除とPhaseManager破棄を行う
   */
  shutdown(): void {
    for (const unsub of this.unsubscribeHandlers) {
      unsub();
    }
    this.unsubscribeHandlers = [];

    this.phaseManager?.destroy();
  }

  /**
   * DAY_STARTEDイベントハンドラ
   */
  private handleDayStarted(event: { remainingDays: number }): void {
    const state = this.stateManager.getState();
    this.headerUI.update({
      currentRank: state.currentRank,
      promotionGauge: state.promotionGauge,
      remainingDays: event.remainingDays,
      gold: state.gold,
      actionPoints: state.actionPoints,
      maxActionPoints: 3,
    });
  }

  // ===========================================================================
  // 公開メソッド
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
      maxActionPoints: 3,
    });
  }

  /**
   * 指定フェーズのUIを表示（PhaseManagerに委譲）
   */
  showPhase(phase: GamePhase): void {
    this.phaseManager.showPhase(phase);
  }

  /**
   * 指定フェーズのUIが表示されているか
   */
  isPhaseUIVisible(phase: GamePhase): boolean {
    return this.phaseManager.isPhaseUIVisible(phase);
  }

  /**
   * フェーズUIマップを取得（PhaseManagerに委譲）
   */
  get phaseUIs(): { get(phase: GamePhase): IBasePhaseUI | undefined } {
    return {
      get: (phase: GamePhase) => this.phaseManager.getPhaseUI(phase),
    };
  }

  /**
   * コンテンツコンテナを取得（フェーズUI配置用）
   */
  getContentContainer(): Phaser.GameObjects.Container {
    return this._contentContainer;
  }
}
