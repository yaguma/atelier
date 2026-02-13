/**
 * MainScene.ts - メインゲームシーン
 * TASK-0095: MainSceneをsrc/scenes/に移行
 * TASK-0046: MainScene共通レイアウト実装
 * Issue #111: MainSceneで本日の依頼が表示されない問題を修正
 *
 * @description
 * ゲームのメイン画面を表示するシーン。
 * ヘッダー、サイドバー、フッター、コンテンツエリアの4分割レイアウトを構築。
 *
 * @信頼性レベル 🔵 requirements.md セクション2.1に基づく
 */

import { Card } from '@domain/entities/Card';
import { Quest } from '@domain/entities/Quest';
import type { IAlchemyService } from '@domain/interfaces/alchemy-service.interface';
import type { IGatheringService } from '@domain/interfaces/gathering-service.interface';
import type { IMasterDataRepository } from '@domain/interfaces/master-data-repository.interface';
import type { IQuestService } from '@domain/interfaces/quest-service.interface';
import { Container, ServiceKeys } from '@infrastructure/di/container';
import { FooterUI } from '@presentation/ui/components/FooterUI';
import { HeaderUI } from '@presentation/ui/components/HeaderUI';
import { SidebarUI } from '@presentation/ui/components/SidebarUI';
import { AlchemyPhaseUI } from '@presentation/ui/phases/AlchemyPhaseUI';
import { DeliveryPhaseUI } from '@presentation/ui/phases/DeliveryPhaseUI';
import { GatheringPhaseUI } from '@presentation/ui/phases/GatheringPhaseUI';
import { QuestAcceptPhaseUI } from '@presentation/ui/phases/QuestAcceptPhaseUI';
import { GamePhase, type GuildRank, VALID_GAME_PHASES } from '@shared/types/common';
import type { IPhaseChangedEvent } from '@shared/types/events';
import { GameEventType } from '@shared/types/events';
import { toCardId } from '@shared/types/ids';
import type { IClient, IQuest } from '@shared/types/quests';
import { generateUniqueId } from '@shared/utils';
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
    currentRank: GuildRank;
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
  // biome-ignore lint/suspicious/noExplicitAny: セーブデータは任意の型を許容（ISaveData）
  continueGame(saveData: any): void;
  startDay(): void;
  endDay(): void;
  skipPhase(): void;
}

/**
 * BasePhaseUI インターフェース（フェーズUIの共通インターフェース）
 */
interface IBasePhaseUI {
  setVisible(visible: boolean): IBasePhaseUI;
  destroy(): void;
}

/**
 * EventBus インターフェース（依存注入用）
 */
interface IEventBus {
  emit(event: string, data: unknown): void;
  on(event: string, handler: (...args: unknown[]) => void): void;
  off(event: string, handler?: (...args: unknown[]) => void): void;
}

/**
 * MainSceneのシーンデータ型
 * Issue #111: TitleSceneからのシーン遷移時にゲーム開始フラグを受け取る
 */
interface MainSceneData {
  /** 新規ゲーム開始フラグ（TitleSceneから渡される） */
  isNewGame?: boolean;
  /** セーブデータ（コンティニュー時に渡される） */
  // biome-ignore lint/suspicious/noExplicitAny: セーブデータは任意の型を許容
  saveData?: any;
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

  /** フェーズUIマップ */
  private phaseUIs: Map<GamePhase, IBasePhaseUI> = new Map();

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
   * Issue #111: シーンデータを受け取り、新規ゲーム開始時はstartNewGame()を呼ぶ
   * Issue #115: EventBusをシーンデータに設定（UIコンポーネントからアクセス可能にする）
   *
   * @param data - TitleSceneから渡されるシーンデータ
   * @throws {Error} StateManagerが未初期化の場合
   * @throws {Error} GameFlowManagerが未初期化の場合
   * @throws {Error} EventBusが未初期化の場合
   */
  create(data?: MainSceneData): void {
    // DIコンテナからサービスを取得
    this.initializeServicesFromContainer();

    // サービスの検証
    this.validateServices();

    // Issue #115: EventBusをシーンデータに設定
    // QuestAcceptPhaseUI等のUIコンポーネントがthis.scene.data.get('eventBus')でアクセスできるようにする
    this.data.set('eventBus', this.eventBus);

    // UIコンポーネントの作成
    this.createLayoutComponents();

    // フェーズUIの作成
    this.createPhaseUIs();

    // イベント購読の設定
    // Issue #111: startNewGame()よりも先にイベント購読を設定することで、
    // QUEST_GENERATEDイベントを確実に受信できるようにする
    this.setupEventSubscriptions();

    // Footerの「次へ」ボタンにコールバック設定
    this.setupFooterNextButtonCallback();

    // Issue #111: 新規ゲーム開始の場合、イベント購読後にstartNewGame()を呼ぶ
    // これにより、QUEST_GENERATEDイベントが正しくハンドリングされる
    if (data?.isNewGame) {
      this.gameFlowManager.startNewGame();
    } else if (data?.saveData) {
      // コンティニュー: セーブデータからゲーム状態を復元
      this.gameFlowManager.continueGame(data.saveData);
    }

    // 初期状態の反映
    this.updateHeader();
    const initialPhase = this.stateManager.getState().currentPhase;
    this.updateFooterForPhase(initialPhase);

    // 初期フェーズUIを表示
    this.showPhase(initialPhase);
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
    if (!this.questService) {
      throw new Error('QuestService is required');
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
   * フェーズUIを作成
   * TASK-0052: 各フェーズUIインスタンスを作成してphaseUIsマップに登録
   */
  private createPhaseUIs(): void {
    const container = Container.getInstance();

    // QuestAcceptPhaseUI
    const questAcceptUI = new QuestAcceptPhaseUI(this);
    this._contentContainer.add(questAcceptUI.getContainer());
    this.phaseUIs.set(GamePhase.QUEST_ACCEPT, questAcceptUI);

    // GatheringPhaseUI
    // GatheringServiceを取得（オプショナル）
    let gatheringService: IGatheringService | null = null;
    if (container.has(ServiceKeys.GatheringService)) {
      gatheringService = container.resolve<IGatheringService>(ServiceKeys.GatheringService);
    }
    if (gatheringService) {
      const gatheringUI = new GatheringPhaseUI(this, gatheringService);
      gatheringUI.create();
      this._contentContainer.add(gatheringUI.getContainer());
      this.phaseUIs.set(GamePhase.GATHERING, gatheringUI);
    } else {
      // GatheringServiceが利用できない場合はダミーUIを作成
      const dummyUI = this.createDummyPhaseUI('採取フェーズ');
      this.phaseUIs.set(GamePhase.GATHERING, dummyUI);
    }

    // AlchemyPhaseUI
    // AlchemyServiceを取得（オプショナル）
    let alchemyService: IAlchemyService | null = null;
    if (container.has(ServiceKeys.AlchemyService)) {
      alchemyService = container.resolve<IAlchemyService>(ServiceKeys.AlchemyService);
    }
    if (alchemyService) {
      const alchemyUI = new AlchemyPhaseUI(this, alchemyService);
      alchemyUI.create();
      this._contentContainer.add(alchemyUI.getContainer());
      this.phaseUIs.set(GamePhase.ALCHEMY, alchemyUI);
    } else {
      // AlchemyServiceが利用できない場合はダミーUIを作成
      const dummyUI = this.createDummyPhaseUI('調合フェーズ');
      this.phaseUIs.set(GamePhase.ALCHEMY, dummyUI);
    }

    // DeliveryPhaseUI
    const deliveryUI = new DeliveryPhaseUI(this);
    this._contentContainer.add(deliveryUI.getContainer());
    this.phaseUIs.set(GamePhase.DELIVERY, deliveryUI);

    // 全てのフェーズUIを非表示に初期化
    for (const ui of this.phaseUIs.values()) {
      ui.setVisible(false);
    }
  }

  /**
   * ダミーフェーズUIを作成（サービスが利用できない場合の代替）
   *
   * @param phaseName - フェーズ名
   * @returns ダミーフェーズUI
   */
  private createDummyPhaseUI(phaseName: string): IBasePhaseUI {
    const container = this.add.container(0, 0);
    const text = this.add.text(200, 150, phaseName, {
      fontSize: '24px',
      color: '#ffffff',
    });
    container.add(text);
    this._contentContainer.add(container);

    return {
      setVisible: (visible: boolean) => {
        container.setVisible(visible);
        return this as unknown as IBasePhaseUI;
      },
      destroy: () => {
        container.destroy();
      },
    };
  }

  /**
   * Footerの「次へ」ボタンにコールバックを設定
   * TASK-0052: フェーズ遷移連携
   */
  private setupFooterNextButtonCallback(): void {
    this.footerUI.onNextClick(() => {
      this.onNextPhaseButtonClick();
    });
  }

  /**
   * 「次へ」ボタンクリック時の処理
   * TASK-0052: GameFlowManagerと連携してフェーズを進める
   */
  private onNextPhaseButtonClick(): void {
    // GameFlowManagerでフェーズを終了
    this.gameFlowManager.endPhase();
  }

  /**
   * イベント購読を設定
   * Issue #111: EventBusはIBusEvent形式（{ type, payload, timestamp }）でイベントを渡すため、
   * payloadプロパティからデータを取得する必要がある
   */
  private setupEventSubscriptions(): void {
    // PHASE_CHANGEDイベント
    // biome-ignore lint/suspicious/noExplicitAny: EventBusのIBusEvent型に対応
    this.eventBus.on(GameEventType.PHASE_CHANGED, (busEvent: any) => {
      const event = busEvent.payload as IPhaseChangedEvent;
      this.handlePhaseChanged(event);
    });

    // DAY_STARTEDイベント
    // biome-ignore lint/suspicious/noExplicitAny: EventBusのIBusEvent型に対応
    this.eventBus.on(GameEventType.DAY_STARTED, (busEvent: any) => {
      const event = busEvent.payload as { remainingDays: number };
      this.handleDayStarted(event);
    });

    // QUEST_GENERATEDイベント（依頼生成時）
    // biome-ignore lint/suspicious/noExplicitAny: EventBusのIBusEvent型に対応
    this.eventBus.on(GameEventType.QUEST_GENERATED, (busEvent: any) => {
      const event = busEvent.payload as { quests: import('@shared/types/quests').IQuest[] };
      this.handleQuestGenerated(event);
    });

    // QUEST_ACCEPTEDイベント（依頼受注時）
    // Issue #137: UIから発行された受注イベントをQuestServiceに伝達
    // biome-ignore lint/suspicious/noExplicitAny: EventBusのIBusEvent型に対応
    this.eventBus.on(GameEventType.QUEST_ACCEPTED, (busEvent: any) => {
      const event = busEvent.payload as { quest: import('@shared/types/quests').IQuest };
      this.handleQuestAccepted(event);
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

  /**
   * QUEST_ACCEPTEDイベントハンドラ
   * UIから受注された依頼をQuestServiceに伝達
   * Issue #137: 受注ボタンを押しても受注できない問題を修正
   *
   * @param event - 依頼受注イベント
   */
  private handleQuestAccepted(event: { quest: IQuest }): void {
    try {
      // QuestServiceで依頼を受注
      this.questService.acceptQuest(event.quest.id);

      // サイドバーの受注済み依頼リストを更新
      const activeQuests = this.questService.getActiveQuests();
      this.sidebarUI.updateAcceptedQuests(activeQuests);

      // QuestAcceptPhaseUIの依頼リストを更新（受注済み依頼を除外）
      const availableQuests = this.questService.getAvailableQuests();
      const questAcceptUI = this.phaseUIs.get(GamePhase.QUEST_ACCEPT);
      if (questAcceptUI && 'updateQuests' in questAcceptUI) {
        // IQuestからQuestエンティティに変換
        const quests = availableQuests.map((q) => {
          // クライアント情報はダミーで作成（UIでは表示のみなので問題なし）
          const client: IClient = {
            id: q.clientId,
            name: '依頼者',
            type: 'VILLAGER',
            contributionMultiplier: 1.0,
            goldMultiplier: 1.0,
            deadlineModifier: 0,
            preferredQuestTypes: ['QUANTITY'],
            unlockRank: 'G',
          };
          return new Quest(q, client);
        });
        (questAcceptUI as QuestAcceptPhaseUI).updateQuests(quests);
      }
    } catch (error) {
      console.error('Failed to accept quest:', error);
    }
  }

  /**
   * QUEST_GENERATEDイベントハンドラ
   * 依頼生成時にQuestAcceptPhaseUIに依頼リストを渡す
   *
   * @param event - 依頼生成イベント
   */
  private handleQuestGenerated(event: { quests: IQuest[]; clients?: IClient[] }): void {
    // QuestAcceptPhaseUIを取得して依頼リストを更新
    const questAcceptUI = this.phaseUIs.get(GamePhase.QUEST_ACCEPT);
    if (questAcceptUI && 'updateQuests' in questAcceptUI) {
      // Quest エンティティに変換して渡す
      const quests = event.quests.map((q) => {
        // クライアント情報を取得（なければダミー）
        const client: IClient = event.clients?.find((c) => c.id === q.clientId) ?? {
          id: q.clientId,
          name: '依頼者',
          type: 'VILLAGER',
          contributionMultiplier: 1.0,
          goldMultiplier: 1.0,
          deadlineModifier: 0,
          preferredQuestTypes: ['QUANTITY'],
          unlockRank: 'G',
        };
        return new Quest(q, client);
      });
      (questAcceptUI as QuestAcceptPhaseUI).updateQuests(quests);
    }
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
   * TASK-0052: 実際のフェーズUIの表示/非表示を切り替え
   * Issue #119: GATHERINGフェーズ遷移時にセッションを初期化
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

    // 全フェーズUIを非表示に
    for (const p of VALID_GAME_PHASES) {
      this._phaseUIVisibility[p] = false;
      const ui = this.phaseUIs.get(p);
      if (ui) {
        ui.setVisible(false);
      }
    }

    // 指定フェーズのUIのみ表示
    this._phaseUIVisibility[phase] = true;
    const targetUI = this.phaseUIs.get(phase);
    if (targetUI) {
      targetUI.setVisible(true);
    }

    // Issue #119: GATHERINGフェーズ遷移時にセッションを初期化
    if (phase === GamePhase.GATHERING) {
      this.initializeGatheringSession();
    }

    this._currentVisiblePhase = phase;
  }

  /**
   * Issue #119: 採取セッションを初期化
   * GatheringServiceでセッションを開始し、GatheringPhaseUIに渡す
   */
  private initializeGatheringSession(): void {
    const container = Container.getInstance();

    // GatheringServiceを取得
    if (!container.has(ServiceKeys.GatheringService)) {
      console.warn('GatheringService is not available');
      return;
    }
    const gatheringService = container.resolve<IGatheringService>(ServiceKeys.GatheringService);

    // MasterDataRepositoryから採取地カードを取得
    if (!container.has(ServiceKeys.MasterDataRepository)) {
      console.warn('MasterDataRepository is not available');
      return;
    }
    const masterDataRepo = container.resolve<IMasterDataRepository>(
      ServiceKeys.MasterDataRepository,
    );

    // デフォルトの採取地カードを取得（最初の採取地カード）
    const gatheringCardMasters = masterDataRepo.getCardsByType('GATHERING');
    if (gatheringCardMasters.length === 0) {
      console.warn('No gathering cards available');
      return;
    }

    // Cardエンティティを作成
    const cardId = toCardId(generateUniqueId('card'));
    const defaultCard = new Card(cardId, gatheringCardMasters[0]);

    try {
      // 採取セッションを開始
      const session = gatheringService.startDraftGathering(defaultCard);

      // GatheringPhaseUIにセッションを渡す
      const gatheringUI = this.phaseUIs.get(GamePhase.GATHERING);
      if (gatheringUI && 'updateSession' in gatheringUI) {
        (gatheringUI as GatheringPhaseUI).updateSession(session);
      }
    } catch (error) {
      console.error('Failed to initialize gathering session:', error);
    }
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
