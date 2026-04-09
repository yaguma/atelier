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

import { GatheringPhaseUI } from '@features/gathering';
import type { IQuestService } from '@features/quest';
import { FooterUI } from '@presentation/ui/components/FooterUI';
import { HeaderUI } from '@presentation/ui/components/HeaderUI';
import { SidebarUI } from '@presentation/ui/components/SidebarUI';
import { MAIN_LAYOUT } from '@shared/constants';
import type { GameEndCondition } from '@shared/services';
import {
  createContributionCalculatorAdapter,
  createDeckServiceAdapter,
  createInventoryServiceAdapter,
  createQuestServiceAdapter,
} from '@shared/services/delivery-phase-adapters';
import { Container, ServiceKeys } from '@shared/services/di/container';
import { GamePhase } from '@shared/types/common';
import type { GameEndStats, IPhaseChangedEvent } from '@shared/types/events';
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
 * レイアウト定数（共通定数から参照）
 */
const LAYOUT = MAIN_LAYOUT;

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

    // Issue #453: DeliveryPhaseUI が scene.data 経由で取得するサービスを登録する。
    // DeliveryPhaseUI が期待するインターフェースと実サービスのシグネチャが食い違うため、
    // delivery-phase-adapters でラップした上で登録する。
    // テスト環境では DI 未登録のため、resolve 失敗時は null を許容する。
    const diContainer = Container.getInstance();
    const tryResolve = <T>(key: string): T | null => {
      try {
        return diContainer.resolve<T>(key);
      } catch (e) {
        console.warn(`[MainScene] Failed to resolve ${key} for scene.data:`, e);
        return null;
      }
    };
    const realInventory = tryResolve<import('@shared/services/inventory-service').InventoryService>(
      ServiceKeys.InventoryService,
    );
    const realContribution = tryResolve<
      import('@shared/domain/services/contribution-calculator').ContributionCalculator
    >(ServiceKeys.ContributionCalculator);
    const realDeck = tryResolve<import('@shared/services/deck-service').DeckService>(
      ServiceKeys.DeckService,
    );
    this.data.set('questService', createQuestServiceAdapter(this.questService));
    this.data.set(
      'inventoryService',
      realInventory ? createInventoryServiceAdapter(realInventory) : null,
    );
    this.data.set(
      'contributionCalculator',
      realContribution ? createContributionCalculatorAdapter(realContribution) : null,
    );
    this.data.set('deckService', realDeck ? createDeckServiceAdapter(realDeck) : null);

    // コンテンツコンテナを先に作成（PhaseManagerのコンストラクタで必要）
    this._contentContainer = this.add.container(LAYOUT.SIDEBAR_WIDTH, LAYOUT.HEADER_HEIGHT);
    this._contentContainer.name = 'MainScene.contentContainer';

    // フェーズUI管理を初期化（リゾルバ生成メソッドをレイアウト作成時に使用するため先に作成）
    this.phaseManager = new PhaseManager(this, this._contentContainer, this.questService);

    // UIコンポーネントの作成
    this.createLayoutComponents();

    // フェーズUIを作成
    this.phaseManager.createPhaseUIs();

    // Issue #434: 採取セッション状態変更とPhaseTabUIの連携を設定
    this.setupGatheringSessionCallback();

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
    const diContainer = Container.getInstance();
    this.stateManager = diContainer.resolve(ServiceKeys.StateManager);
    this.gameFlowManager = diContainer.resolve(ServiceKeys.GameFlowManager);
    this.eventBus = diContainer.resolve(ServiceKeys.EventBus);
    this.questService = diContainer.resolve(ServiceKeys.QuestService);
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
    // Issue #424: PhaseManagerのリゾルバ生成メソッド経由で日本語名を解決
    const materialNameResolver = this.phaseManager.createMaterialNameResolver();
    const itemNameResolver = this.phaseManager.createItemNameResolver();
    this.sidebarUI = new SidebarUI(this, 0, LAYOUT.HEADER_HEIGHT, {
      materialNameResolver,
      itemNameResolver,
    });
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
  }

  /**
   * 採取セッション状態変更とPhaseTabUIの連携を設定（Issue #434）
   * GatheringPhaseUIのセッション状態が変わった時にPhaseTabUIのタブを無効化/有効化する
   */
  private setupGatheringSessionCallback(): void {
    const gatheringUI = this.phaseManager.getPhaseUI(GamePhase.GATHERING);
    if (!(gatheringUI instanceof GatheringPhaseUI)) return;

    const phaseTabUI = this.footerUI.getPhaseTabUI();
    if (!phaseTabUI) return;

    gatheringUI.onSessionStateChange((hasActiveSession: boolean) => {
      phaseTabUI.setTabsDisabled(hasActiveSession);
    });
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
      this.eventBus.on<IPhaseChangedEvent>(GameEventType.PHASE_CHANGED, (busEvent) => {
        this.phaseManager.showPhase(busEvent.payload.newPhase);
        this.phaseManager.updateSidebar(this.sidebarUI);
        // Issue #443: フェーズ切替時にヘッダーを更新（AP/ゴールド等の最新状態を反映）
        this.updateHeader();
      }),
    );

    this.unsubscribeHandlers.push(
      this.eventBus.on<{ remainingDays: number }>(GameEventType.DAY_STARTED, (busEvent) => {
        this.handleDayStarted(busEvent.payload);
      }),
    );

    this.unsubscribeHandlers.push(
      this.eventBus.on<{ quests: IQuest[] }>(GameEventType.QUEST_GENERATED, (busEvent) => {
        this.phaseManager.handleQuestGenerated(busEvent.payload);
      }),
    );

    this.unsubscribeHandlers.push(
      this.eventBus.on<{ quest: IQuest }>(GameEventType.QUEST_ACCEPTED, (busEvent) => {
        this.phaseManager.handleQuestAccepted(busEvent.payload, this.sidebarUI);
      }),
    );

    // Issue #443: 採取終了時にヘッダーのAP表示を更新
    this.unsubscribeHandlers.push(
      this.eventBus.on(GameEventType.GATHERING_ENDED, () => {
        this.updateHeader();
      }),
    );

    // Issue #443: AP超過による自動日進行時にヘッダーを更新
    this.unsubscribeHandlers.push(
      this.eventBus.on(GameEventType.DAY_ENDED, () => {
        this.updateHeader();
      }),
    );

    // Issue #361: ゲーム終了イベントの購読
    this.unsubscribeHandlers.push(
      this.eventBus.on<GameEndCondition>(GameEventType.GAME_OVER, (busEvent) => {
        this.handleGameOver(busEvent.payload);
      }),
    );

    this.unsubscribeHandlers.push(
      this.eventBus.on<GameEndCondition>(GameEventType.GAME_CLEARED, (busEvent) => {
        this.handleGameCleared(busEvent.payload);
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

  /**
   * GameEndConditionからGameEndStatsを構築する
   * Issue #361: GAME_OVER/GAME_CLEARED共通のstats構築ロジック
   */
  private buildGameEndStats(condition: GameEndCondition): GameEndStats {
    const state = this.stateManager.getState();
    return {
      finalRank: condition.finalRank,
      totalDays: condition.totalDays,
      totalDeliveries: 0, // TODO: 実際の納品数をStateから取得
      totalGold: state.gold,
    };
  }

  /**
   * GAME_OVERイベントハンドラ
   * Issue #361: ゲームオーバー時にGameOverSceneへ遷移
   */
  private handleGameOver(condition: GameEndCondition): void {
    this.scene.start('GameOverScene', { stats: this.buildGameEndStats(condition) });
  }

  /**
   * GAME_CLEAREDイベントハンドラ
   * Issue #361: ゲームクリア時にGameClearSceneへ遷移
   */
  private handleGameCleared(condition: GameEndCondition): void {
    this.scene.start('GameClearScene', { stats: this.buildGameEndStats(condition) });
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
