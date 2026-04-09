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
import { ContextPanel, HUDBar, PhaseRail } from '@presentation/ui/components/composite';
import { FooterUI } from '@presentation/ui/components/FooterUI';
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
import { getPhaseConditionText } from '@shared/services/game-flow/phase-condition-text';
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

/**
 * Issue #458 Phase 4 A: 3カラムレイアウト拡張定数
 * - HUDBar: 画面上部 (y=0, height=HEADER_HEIGHT=60)
 * - PhaseRail: HUDBar直下 (y=HEADER_HEIGHT, height=PHASE_RAIL_HEIGHT)
 * - ContextPanel: 右カラム（Workspaceの右側に固定幅で配置）
 */
const PHASE_RAIL_HEIGHT = 48;
const CONTEXT_PANEL_WIDTH = 260;
const CONTEXT_PANEL_PADDING = 8;

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

  /** HUDバー（Issue #458 Phase 4 A: HeaderUI 置換） */
  private hudBar!: HUDBar;

  /** フェーズレール（Issue #458 Phase 4 A: PhaseTabUI 置換・上部昇格） */
  private phaseRail!: PhaseRail;

  /** コンテキストパネル（Issue #458 Phase 4 A: 右カラム新設） */
  private contextPanel!: ContextPanel;

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
    // Issue #458 Phase 4 A: PhaseRailを上部に昇格配置するため、contentY を HEADER_HEIGHT + PHASE_RAIL_HEIGHT に下げる
    this._contentContainer = this.add.container(
      LAYOUT.SIDEBAR_WIDTH,
      LAYOUT.HEADER_HEIGHT + PHASE_RAIL_HEIGHT,
    );
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

    // Issue #471: 到達条件テキストの初期設定
    this.updatePhaseConditionText(initialPhase);
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
   * Issue #458 Phase 4 A: 3カラム構造
   * - 上段: HUDBar → PhaseRail
   * - 中段: Sidebar(左) | Workspace(中) | ContextPanel(右)
   * - 下段: FooterUI（日終了/休憩ボタン。内部のPhaseTabUIは非表示化）
   */
  private createLayoutComponents(): void {
    const screenWidth = this.cameras.main.width;
    const workspaceWidth = screenWidth - LAYOUT.SIDEBAR_WIDTH;

    // HUDBar（画面上部、サイドバー右側から開始、幅 = Workspace + ContextPanel 全体）
    this.hudBar = new HUDBar(this, LAYOUT.SIDEBAR_WIDTH, 0, {
      width: workspaceWidth,
    });
    this.hudBar.create();

    // PhaseRail（HUDBar直下、サイドバー右側から開始）
    this.phaseRail = new PhaseRail(this, LAYOUT.SIDEBAR_WIDTH, LAYOUT.HEADER_HEIGHT, {
      width: workspaceWidth,
      height: PHASE_RAIL_HEIGHT,
      current: this.stateManager.getState().currentPhase,
      onPhaseClick: (phase) => {
        // IMainSceneGameFlowManager には switchPhase が無いため、
        // PhaseTabUI と同じく IGameFlowManager 経由で呼び出す
        const realGFM = this
          .gameFlowManager as unknown as import('@shared/services/game-flow/game-flow-manager.interface').IGameFlowManager;
        realGFM.switchPhase({ targetPhase: phase as GamePhase }).catch(() => {
          // フェーズ切り替え失敗時は何もしない（PHASE_CHANGEDイベントが発行されないため状態は変わらない）
        });
      },
    });
    this.phaseRail.create();

    // サイドバーUI（画面左側、ヘッダー下から開始）
    // Issue #424: PhaseManagerのリゾルバ生成メソッド経由で日本語名を解決
    const materialNameResolver = this.phaseManager.createMaterialNameResolver();
    const itemNameResolver = this.phaseManager.createItemNameResolver();
    this.sidebarUI = new SidebarUI(this, 0, LAYOUT.HEADER_HEIGHT, {
      materialNameResolver,
      itemNameResolver,
    });
    this.sidebarUI.create();

    // ContextPanel（右カラム、Workspace 右端にオーバーレイ配置）
    // 中心基準で描画されるので、右端から CONTEXT_PANEL_WIDTH/2 + padding を引いた位置に配置
    const contextPanelCenterX = screenWidth - CONTEXT_PANEL_WIDTH / 2 - CONTEXT_PANEL_PADDING;
    const contextPanelHeight =
      this.cameras.main.height -
      LAYOUT.HEADER_HEIGHT -
      PHASE_RAIL_HEIGHT -
      LAYOUT.FOOTER_HEIGHT -
      CONTEXT_PANEL_PADDING * 2;
    const contextPanelCenterY =
      LAYOUT.HEADER_HEIGHT + PHASE_RAIL_HEIGHT + CONTEXT_PANEL_PADDING + contextPanelHeight / 2;
    this.contextPanel = new ContextPanel(this, contextPanelCenterX, contextPanelCenterY, {
      width: CONTEXT_PANEL_WIDTH,
      height: Math.max(120, contextPanelHeight),
    });
    this.contextPanel.create();

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

    // Issue #458 Phase 4 A: FooterUI内部のPhaseTabUIはPhaseRailに置き換えられたため非表示化
    // （将来的にはFooterUI本体のリファクタリングで除去予定）
    const phaseTabUI = this.footerUI.getPhaseTabUI();
    phaseTabUI?.getContainer().setVisible(false);
  }

  /**
   * 採取セッション状態変更とPhaseTabUIの連携を設定（Issue #434）
   * GatheringPhaseUIのセッション状態が変わった時にPhaseTabUIのタブを無効化/有効化する
   */
  private setupGatheringSessionCallback(): void {
    const gatheringUI = this.phaseManager.getPhaseUI(GamePhase.GATHERING);
    if (!(gatheringUI instanceof GatheringPhaseUI)) return;

    // Issue #458 Phase 4 A: PhaseTabUIの代わりにPhaseRailでタブ無効化を制御
    gatheringUI.onSessionStateChange((hasActiveSession: boolean) => {
      this.phaseRail.setTabsDisabled(hasActiveSession);
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
        // Issue #458 Phase 4 A: PhaseRailのアクティブタブを更新
        this.phaseRail.setCurrent(busEvent.payload.newPhase);
        // Issue #471: 到達条件テキストを更新
        this.updatePhaseConditionText(busEvent.payload.newPhase);
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
        // Issue #471: 受注後にGATHERINGフェーズへ自動遷移
        this.autoTransitionToGathering();
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
    this.hudBar.updateFromHeader({
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
  // フェーズ遷移自動化 (Issue #471)
  // ===========================================================================

  /**
   * 受注後にGATHERINGフェーズへ自動遷移する
   * 現在QUEST_ACCEPTフェーズの場合のみ遷移する
   */
  private autoTransitionToGathering(): void {
    const currentPhase = this.stateManager.getState().currentPhase;
    if (currentPhase !== GamePhase.QUEST_ACCEPT) return;

    const realGFM = this
      .gameFlowManager as unknown as import('@shared/services/game-flow/game-flow-manager.interface').IGameFlowManager;
    realGFM.switchPhase({ targetPhase: GamePhase.GATHERING }).catch(() => {
      // 遷移失敗時は何もしない（採取セッション中など）
    });
  }

  /**
   * 到達条件テキストを更新する
   */
  private updatePhaseConditionText(phase: GamePhase): void {
    const hasActiveQuests = this.questService.getActiveQuests().length > 0;
    const conditionText = getPhaseConditionText(phase, hasActiveQuests);
    this.phaseRail.setConditionText(conditionText);
  }

  // ===========================================================================
  // 公開メソッド
  // ===========================================================================

  /**
   * ヘッダーを更新
   */
  updateHeader(): void {
    const state = this.stateManager.getState();
    this.hudBar.updateFromHeader({
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
