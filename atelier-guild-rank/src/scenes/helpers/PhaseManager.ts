/**
 * PhaseManager - フェーズUI管理クラス
 * Issue #266: MainScene分割リファクタリング
 *
 * @description
 * MainSceneからフェーズUI関連のロジックを抽出。
 * フェーズUIの作成・表示切り替え・初期化・終了処理を担当する。
 */

import { Quest } from '@domain/entities/Quest';
import type { IMasterDataRepository } from '@domain/interfaces/master-data-repository.interface';
import type { IAlchemyService } from '@features/alchemy';
import { AlchemyPhaseUI } from '@features/alchemy';
import type { IDeckService } from '@features/deck';
import type { IGatheringLocation, IGatheringService } from '@features/gathering';
import { calculateOverflow, GATHERING_LOCATIONS, GatheringPhaseUI } from '@features/gathering';
import type { IQuestService } from '@features/quest';
import type { SidebarUI } from '@presentation/ui/components/SidebarUI';
import { DeliveryPhaseUI } from '@presentation/ui/phases/DeliveryPhaseUI';
import { QuestAcceptPhaseUI } from '@presentation/ui/phases/QuestAcceptPhaseUI';
import { Container, ServiceKeys } from '@shared/services/di/container';
import type { IGameFlowManager } from '@shared/services/game-flow';
import type { IStateManager } from '@shared/services/state-manager';
import { GamePhase, VALID_GAME_PHASES } from '@shared/types/common';
import { toItemId, toMaterialId } from '@shared/types/ids';
import type { IAttributeValue, IEffectValue, IUsedMaterial } from '@shared/types/materials';
import type { IClient, IQuest } from '@shared/types/quests';
import type Phaser from 'phaser';
import type { IBasePhaseUI } from '../types/main-scene-types';

// =============================================================================
// PhaseManagerクラス
// =============================================================================

/**
 * PhaseManager - フェーズUI管理
 *
 * 【責務】:
 * - フェーズUIの作成・登録
 * - フェーズUIの表示/非表示切り替え
 * - 各フェーズ固有の初期化・終了処理
 * - サイドバー更新
 */
export class PhaseManager {
  private readonly scene: Phaser.Scene;
  private readonly contentContainer: Phaser.GameObjects.Container;
  private readonly questService: IQuestService;

  /** フェーズUIマップ */
  private phaseUIs: Map<GamePhase, IBasePhaseUI> = new Map();

  /** 現在表示中のフェーズ */
  private _currentVisiblePhase: GamePhase | null = null;

  /** フェーズUIの可視性マップ */
  private _phaseUIVisibility: Record<GamePhase, boolean> = {
    [GamePhase.QUEST_ACCEPT]: false,
    [GamePhase.GATHERING]: false,
    [GamePhase.ALCHEMY]: false,
    [GamePhase.DELIVERY]: false,
  };

  /** 採取セッション終了処理の二重呼び出し防止フラグ */
  private _isFinalizingGathering = false;

  constructor(
    scene: Phaser.Scene,
    contentContainer: Phaser.GameObjects.Container,
    questService: IQuestService,
  ) {
    this.scene = scene;
    this.contentContainer = contentContainer;
    this.questService = questService;
  }

  // ===========================================================================
  // リゾルバ生成（DRY原則: 全箇所で共通化）
  // ===========================================================================

  /**
   * 素材名リゾルバを生成する
   * IMasterDataRepository経由でmaterialIdから日本語名を解決する
   */
  createMaterialNameResolver(): ((materialId: string) => string) | undefined {
    const diContainer = Container.getInstance();
    if (!diContainer.has(ServiceKeys.MasterDataRepository)) return undefined;

    const masterDataRepo = diContainer.resolve<IMasterDataRepository>(
      ServiceKeys.MasterDataRepository,
    );
    return (materialId: string) => {
      const material = masterDataRepo.getMaterialById(toMaterialId(materialId));
      return material?.name ?? materialId;
    };
  }

  /**
   * アイテム名リゾルバを生成する
   * IMasterDataRepository経由でitemIdから日本語名を解決する
   */
  createItemNameResolver(): ((itemId: string) => string) | undefined {
    const diContainer = Container.getInstance();
    if (!diContainer.has(ServiceKeys.MasterDataRepository)) return undefined;

    const masterDataRepo = diContainer.resolve<IMasterDataRepository>(
      ServiceKeys.MasterDataRepository,
    );
    return (itemId: string) => {
      const item = masterDataRepo.getItemById(toItemId(itemId));
      return item?.name ?? itemId;
    };
  }

  // ===========================================================================
  // フェーズUI作成
  // ===========================================================================

  /**
   * フェーズUIを作成
   * TASK-0052: 各フェーズUIインスタンスを作成してphaseUIsマップに登録
   */
  createPhaseUIs(): void {
    const diContainer = Container.getInstance();

    // QuestAcceptPhaseUI
    // Issue #424: IMasterDataRepository経由でアイテム名を日本語解決
    const itemNameResolver = this.createItemNameResolver();
    const questAcceptUI = new QuestAcceptPhaseUI(this.scene, { itemNameResolver });
    this.contentContainer.add(questAcceptUI.getContainer());
    this.phaseUIs.set(GamePhase.QUEST_ACCEPT, questAcceptUI);

    // GatheringPhaseUI
    this.createGatheringUI(diContainer);

    // AlchemyPhaseUI
    this.createAlchemyUI(diContainer);

    // DeliveryPhaseUI
    const deliveryUI = new DeliveryPhaseUI(this.scene);
    this.contentContainer.add(deliveryUI.getContainer());
    this.phaseUIs.set(GamePhase.DELIVERY, deliveryUI);

    // 全てのフェーズUIを非表示に初期化
    for (const ui of this.phaseUIs.values()) {
      ui.setVisible(false);
    }
  }

  private createGatheringUI(diContainer: ReturnType<typeof Container.getInstance>): void {
    let gatheringService: IGatheringService | null = null;
    if (diContainer.has(ServiceKeys.GatheringService)) {
      gatheringService = diContainer.resolve<IGatheringService>(ServiceKeys.GatheringService);
    }
    let deckService: IDeckService | undefined;
    if (diContainer.has(ServiceKeys.DeckService)) {
      deckService = diContainer.resolve<IDeckService>(ServiceKeys.DeckService);
    }
    if (gatheringService) {
      const materialNameResolver = this.createMaterialNameResolver();
      const onEnd = (): void => {
        this.finalizeGatheringSession();
      };

      const gatheringUI = new GatheringPhaseUI(
        this.scene,
        gatheringService,
        deckService,
        materialNameResolver,
        onEnd,
      );
      gatheringUI.create();

      // Issue #445: リロール時のAP即時消費コールバックを設定
      // AP超過時は日数消費で対応（採取の追加ラウンドと同じパターン）
      if (diContainer.has(ServiceKeys.StateManager)) {
        const stateManager = diContainer.resolve<IStateManager>(ServiceKeys.StateManager);
        gatheringUI.onReroll((apCost: number): boolean => {
          const currentAP = stateManager.getState().actionPoints;
          const overflowResult = calculateOverflow({ currentAP, consumeAP: apCost });

          if (overflowResult.hasOverflow) {
            // AP超過: 日数消費を伴うAP処理
            stateManager.updateState({ actionPoints: 0 });
            if (diContainer.has(ServiceKeys.GameFlowManager)) {
              const gameFlowManager = diContainer.resolve<IGameFlowManager>(
                ServiceKeys.GameFlowManager,
              );
              gameFlowManager.processAPOverflow(overflowResult);
            }
          } else {
            // AP超過なし: 通常のAP消費
            stateManager.spendActionPoints(apCost);
          }

          // ヘッダーのAP表示を即時更新
          const mainScene = this.scene as { updateHeader?: () => void };
          mainScene.updateHeader?.();
          return true;
        });
      }

      this.contentContainer.add(gatheringUI.getContainer());
      this.phaseUIs.set(GamePhase.GATHERING, gatheringUI);
    } else {
      const dummyUI = this.createDummyPhaseUI('採取フェーズ');
      this.phaseUIs.set(GamePhase.GATHERING, dummyUI);
    }
  }

  private createAlchemyUI(diContainer: ReturnType<typeof Container.getInstance>): void {
    let alchemyService: IAlchemyService | null = null;
    if (diContainer.has(ServiceKeys.AlchemyService)) {
      alchemyService = diContainer.resolve<IAlchemyService>(ServiceKeys.AlchemyService);
    }
    if (alchemyService) {
      const materialNameResolver = this.createMaterialNameResolver();
      // Issue #413: onCraftCompleteコールバックを接続
      // 調合完了後にインベントリにアイテムを追加し、使用素材を削除する
      const onCraftComplete = (item: import('@domain/entities/ItemInstance').ItemInstance) => {
        const craftContainer = Container.getInstance();
        if (craftContainer.has(ServiceKeys.InventoryService)) {
          const invService = craftContainer.resolve<
            import('@domain/interfaces/inventory-service.interface').IInventoryService
          >(ServiceKeys.InventoryService);

          // 使用素材をインベントリから削除（アイテム追加前に実施）
          if (item.usedMaterials.length > 0) {
            const instanceIds = item.usedMaterials.map((m) => m.instanceId);
            invService.removeMaterials(instanceIds);
          }

          // 調合で生成されたアイテムをインベントリに追加
          invService.addItem(item);
        }
      };

      const alchemyUI = new AlchemyPhaseUI(
        this.scene,
        alchemyService,
        onCraftComplete,
        materialNameResolver,
      );
      alchemyUI.create();
      this.contentContainer.add(alchemyUI.getContainer());
      this.phaseUIs.set(GamePhase.ALCHEMY, alchemyUI);
    } else {
      const dummyUI = this.createDummyPhaseUI('調合フェーズ');
      this.phaseUIs.set(GamePhase.ALCHEMY, dummyUI);
    }
  }

  /**
   * ダミーフェーズUIを作成（サービスが利用できない場合の代替）
   */
  private createDummyPhaseUI(phaseName: string): IBasePhaseUI {
    const container = this.scene.add.container(0, 0);
    container.name = 'MainScene.dummyPhase';
    const text = this.scene.add.text(200, 150, phaseName, {
      fontSize: '24px',
      color: '#ffffff',
    });
    container.add(text);
    this.contentContainer.add(container);

    const dummyUI: IBasePhaseUI = {
      setVisible(visible: boolean): IBasePhaseUI {
        container.setVisible(visible);
        return dummyUI;
      },
      destroy(): void {
        container.destroy();
      },
    };
    return dummyUI;
  }

  // ===========================================================================
  // フェーズ表示管理
  // ===========================================================================

  /**
   * 指定フェーズのUIを表示
   * Issue #119: GATHERINGフェーズ遷移時にセッションを初期化
   */
  showPhase(phase: GamePhase): void {
    if (!VALID_GAME_PHASES.includes(phase)) {
      throw new Error(`Invalid phase: ${phase}`);
    }

    if (this._currentVisiblePhase === phase) {
      return;
    }

    // GATHERINGフェーズから離脱する場合、採取セッションを終了
    if (this._currentVisiblePhase === GamePhase.GATHERING) {
      this.finalizeGatheringSession();
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

    // フェーズ固有の初期化
    if (phase === GamePhase.QUEST_ACCEPT) {
      this.initializeQuestAcceptPhase();
    }
    if (phase === GamePhase.GATHERING) {
      this.initializeGatheringSession();
    }
    if (phase === GamePhase.ALCHEMY) {
      this.initializeAlchemyPhase();
    }
    // Issue #453: 納品フェーズ遷移時に受注依頼・所持アイテムを最新化する
    if (phase === GamePhase.DELIVERY) {
      const deliveryUI = this.phaseUIs.get(GamePhase.DELIVERY);
      if (deliveryUI && 'refreshData' in deliveryUI) {
        (deliveryUI as unknown as { refreshData: () => void }).refreshData();
      }
    }

    this._currentVisiblePhase = phase;
  }

  /**
   * フェーズUIの可視性を取得
   */
  isPhaseUIVisible(phase: GamePhase): boolean {
    return this._phaseUIVisibility[phase];
  }

  /**
   * フェーズUIを取得
   */
  getPhaseUI(phase: GamePhase): IBasePhaseUI | undefined {
    return this.phaseUIs.get(phase);
  }

  // ===========================================================================
  // フェーズ固有の初期化・終了処理
  // ===========================================================================

  /**
   * 依頼受注フェーズを初期化
   * Issue #431: 受注済み依頼をメインコンテンツエリアに表示
   */
  private initializeQuestAcceptPhase(): void {
    const questAcceptUI = this.phaseUIs.get(GamePhase.QUEST_ACCEPT);
    if (questAcceptUI && 'updateAcceptedQuests' in questAcceptUI) {
      const activeQuests = this.questService.getActiveQuests();
      (questAcceptUI as QuestAcceptPhaseUI).updateAcceptedQuests(activeQuests);
    }
  }

  /**
   * 採取フェーズを初期化（場所選択ステージ）
   *
   * Issue #354: 手札カードから選択可能な採取場所を計算し、
   * LocationSelectUIに反映して場所選択ステージを表示する。
   */
  private initializeGatheringSession(): void {
    const diContainer = Container.getInstance();

    const gatheringUI = this.phaseUIs.get(GamePhase.GATHERING);
    if (!(gatheringUI instanceof GatheringPhaseUI)) {
      return;
    }

    // 手札カードIDから選択可能な採取場所を計算
    if (diContainer.has(ServiceKeys.DeckService)) {
      const deckService = diContainer.resolve<IDeckService>(ServiceKeys.DeckService);
      const hand = deckService.getHand();
      const gatheringCardIds = new Set(
        hand.filter((card) => card.type === 'GATHERING').map((card) => card.id),
      );
      const locations: IGatheringLocation[] = GATHERING_LOCATIONS.map((loc) => ({
        ...loc,
        isSelectable: gatheringCardIds.has(loc.cardId),
      }));
      gatheringUI.setAvailableLocations(locations);
    }

    // LOCATION_SELECTステージで表示開始
    gatheringUI.show();
  }

  /**
   * 採取セッションを終了し、獲得素材をインベントリに保存する
   *
   * onEndコールバック経由とshowPhase()経由の2箇所から呼ばれる可能性があるため、
   * ガードフラグで二重呼び出しを防止する。
   */
  private finalizeGatheringSession(): void {
    if (this._isFinalizingGathering) return;
    this._isFinalizingGathering = true;

    try {
      const diContainer = Container.getInstance();

      if (!diContainer.has(ServiceKeys.GatheringService)) return;
      const gatheringService = diContainer.resolve<IGatheringService>(ServiceKeys.GatheringService);

      const session = gatheringService.getCurrentSession();
      if (!session) return;

      const result = gatheringService.endGathering(session.sessionId);

      // AP消費処理: calculateOverflowでAP超過を計算し、適切に処理
      // Issue #443: spendActionPoints()はAP不足時にfalseを返すだけで消費しないため、
      // AP超過時はprocessAPOverflow()で日数消費も含めて処理する
      if (result.cost.actionPointCost > 0 && diContainer.has(ServiceKeys.StateManager)) {
        const stateManager = diContainer.resolve<IStateManager>(ServiceKeys.StateManager);
        const currentAP = stateManager.getState().actionPoints;

        const overflowResult = calculateOverflow({
          currentAP,
          consumeAP: result.cost.actionPointCost,
        });

        if (overflowResult.hasOverflow) {
          // AP超過: 日数消費を伴うAP処理
          // APを0にしてからprocessAPOverflowで日進行処理
          stateManager.updateState({ actionPoints: 0 });
          if (diContainer.has(ServiceKeys.GameFlowManager)) {
            const gameFlowManager = diContainer.resolve<IGameFlowManager>(
              ServiceKeys.GameFlowManager,
            );
            gameFlowManager.processAPOverflow(overflowResult);
          }
        } else {
          // AP超過なし: 通常のAP消費
          stateManager.spendActionPoints(result.cost.actionPointCost);
        }
      }

      if (diContainer.has(ServiceKeys.InventoryService)) {
        const inventoryService = diContainer.resolve<
          import('@domain/interfaces/inventory-service.interface').IInventoryService
        >(ServiceKeys.InventoryService);
        inventoryService.addMaterials(result.materials);
      }
    } catch (error) {
      console.error('Failed to finalize gathering session:', error);
    } finally {
      this._isFinalizingGathering = false;
    }
  }

  /**
   * 調合フェーズを初期化
   */
  private initializeAlchemyPhase(): void {
    const diContainer = Container.getInstance();

    if (!diContainer.has(ServiceKeys.InventoryService)) {
      console.warn('InventoryService is not available');
      return;
    }
    const inventoryService = diContainer.resolve<
      import('@domain/interfaces/inventory-service.interface').IInventoryService
    >(ServiceKeys.InventoryService);

    const materials = inventoryService.getMaterials();
    const alchemyUI = this.phaseUIs.get(GamePhase.ALCHEMY);
    if (alchemyUI && 'setAvailableMaterials' in alchemyUI) {
      (alchemyUI as AlchemyPhaseUI).setAvailableMaterials(materials);
      (alchemyUI as AlchemyPhaseUI).refresh();
    }
  }

  // ===========================================================================
  // サイドバー更新
  // ===========================================================================

  /**
   * サイドバーを更新
   * InventoryServiceとQuestServiceから最新データを取得して表示する
   */
  updateSidebar(sidebarUI: SidebarUI): void {
    const diContainer = Container.getInstance();

    if (!diContainer.has(ServiceKeys.InventoryService)) return;
    const inventoryService = diContainer.resolve<
      import('@domain/interfaces/inventory-service.interface').IInventoryService
    >(ServiceKeys.InventoryService);

    const materials = inventoryService.getMaterials().map((m) => ({
      materialId: m.materialId,
      quality: m.quality,
      quantity: 1,
    }));

    const craftedItems = inventoryService.getItems().map((i) => ({
      itemId: i.itemId,
      quality: i.quality,
      attributeValues: [] as IAttributeValue[],
      effectValues: [] as IEffectValue[],
      usedMaterials: [] as IUsedMaterial[],
    }));

    const activeQuests = this.questService.getActiveQuests();

    sidebarUI.update({
      activeQuests,
      materials,
      craftedItems,
      currentStorage: materials.length + craftedItems.length,
      maxStorage: inventoryService.getMaterialCapacity(),
    });
  }

  /**
   * 依頼受注処理
   * UIから受注された依頼をQuestServiceに伝達してUI更新
   */
  handleQuestAccepted(event: { quest: IQuest }, sidebarUI: SidebarUI): void {
    try {
      this.questService.acceptQuest(event.quest.id);

      const activeQuests = this.questService.getActiveQuests();
      sidebarUI.updateAcceptedQuests(activeQuests);

      // Issue #356: 受注した依頼を表示リストから除外する
      // getAvailableQuests()は掲示板・訪問・日次を混在して返すため使用しない
      const questAcceptUI = this.phaseUIs.get(GamePhase.QUEST_ACCEPT);
      if (questAcceptUI && 'removeAcceptedQuest' in questAcceptUI) {
        (questAcceptUI as QuestAcceptPhaseUI).removeAcceptedQuest(event.quest.id);
      }

      // Issue #431: 受注済み依頼リストをメインコンテンツエリアに表示更新
      if (questAcceptUI && 'updateAcceptedQuests' in questAcceptUI) {
        (questAcceptUI as QuestAcceptPhaseUI).updateAcceptedQuests(activeQuests);
      }
    } catch (error) {
      console.error('Failed to accept quest:', error);
    }
  }

  /**
   * 依頼生成イベント処理
   */
  handleQuestGenerated(event: { quests: IQuest[]; clients?: IClient[] }): void {
    const questAcceptUI = this.phaseUIs.get(GamePhase.QUEST_ACCEPT);
    if (questAcceptUI && 'updateQuests' in questAcceptUI) {
      const quests = event.quests.map((q) => {
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

  /**
   * 全フェーズUIを破棄
   */
  destroy(): void {
    for (const ui of this.phaseUIs.values()) {
      ui.destroy();
    }
    this.phaseUIs.clear();
  }
}
