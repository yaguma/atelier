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
import { GATHERING_LOCATIONS, GatheringPhaseUI } from '@features/gathering';
import type { IQuestService } from '@features/quest';
import type { SidebarUI } from '@presentation/ui/components/SidebarUI';
import { DeliveryPhaseUI } from '@presentation/ui/phases/DeliveryPhaseUI';
import { QuestAcceptPhaseUI } from '@presentation/ui/phases/QuestAcceptPhaseUI';
import { Container, ServiceKeys } from '@shared/services/di/container';
import { GamePhase, VALID_GAME_PHASES } from '@shared/types/common';
import { toMaterialId } from '@shared/types/ids';
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
  // フェーズUI作成
  // ===========================================================================

  /**
   * フェーズUIを作成
   * TASK-0052: 各フェーズUIインスタンスを作成してphaseUIsマップに登録
   */
  createPhaseUIs(): void {
    const container = Container.getInstance();

    // QuestAcceptPhaseUI
    const questAcceptUI = new QuestAcceptPhaseUI(this.scene);
    this.contentContainer.add(questAcceptUI.getContainer());
    this.phaseUIs.set(GamePhase.QUEST_ACCEPT, questAcceptUI);

    // GatheringPhaseUI
    this.createGatheringUI(container);

    // AlchemyPhaseUI
    this.createAlchemyUI(container);

    // DeliveryPhaseUI
    const deliveryUI = new DeliveryPhaseUI(this.scene);
    this.contentContainer.add(deliveryUI.getContainer());
    this.phaseUIs.set(GamePhase.DELIVERY, deliveryUI);

    // 全てのフェーズUIを非表示に初期化
    for (const ui of this.phaseUIs.values()) {
      ui.setVisible(false);
    }
  }

  private createGatheringUI(container: ReturnType<typeof Container.getInstance>): void {
    let gatheringService: IGatheringService | null = null;
    if (container.has(ServiceKeys.GatheringService)) {
      gatheringService = container.resolve<IGatheringService>(ServiceKeys.GatheringService);
    }
    if (gatheringService) {
      const gatheringUI = new GatheringPhaseUI(this.scene, gatheringService);
      gatheringUI.create();
      this.contentContainer.add(gatheringUI.getContainer());
      this.phaseUIs.set(GamePhase.GATHERING, gatheringUI);
    } else {
      const dummyUI = this.createDummyPhaseUI('採取フェーズ');
      this.phaseUIs.set(GamePhase.GATHERING, dummyUI);
    }
  }

  private createAlchemyUI(container: ReturnType<typeof Container.getInstance>): void {
    let alchemyService: IAlchemyService | null = null;
    if (container.has(ServiceKeys.AlchemyService)) {
      alchemyService = container.resolve<IAlchemyService>(ServiceKeys.AlchemyService);
    }
    if (alchemyService) {
      let materialNameResolver: ((materialId: string) => string) | undefined;
      if (container.has(ServiceKeys.MasterDataRepository)) {
        const masterDataRepo = container.resolve<IMasterDataRepository>(
          ServiceKeys.MasterDataRepository,
        );
        materialNameResolver = (materialId: string) => {
          const material = masterDataRepo.getMaterialById(toMaterialId(materialId));
          return material?.name ?? materialId;
        };
      }
      const alchemyUI = new AlchemyPhaseUI(
        this.scene,
        alchemyService,
        undefined,
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
    if (phase === GamePhase.GATHERING) {
      this.initializeGatheringSession();
    }
    if (phase === GamePhase.ALCHEMY) {
      this.initializeAlchemyPhase();
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
   * 採取フェーズを初期化（場所選択ステージ）
   *
   * Issue #354: 手札カードから選択可能な採取場所を計算し、
   * LocationSelectUIに反映して場所選択ステージを表示する。
   */
  private initializeGatheringSession(): void {
    const container = Container.getInstance();

    const gatheringUI = this.phaseUIs.get(GamePhase.GATHERING);
    if (!gatheringUI || !('show' in gatheringUI)) {
      return;
    }

    // 手札カードIDから選択可能な採取場所を計算
    if (container.has(ServiceKeys.DeckService)) {
      const deckService = container.resolve<IDeckService>(ServiceKeys.DeckService);
      const hand = deckService.getHand();
      const gatheringCardIds = new Set(
        hand.filter((card) => card.type === 'GATHERING').map((card) => card.id),
      );
      const locations: IGatheringLocation[] = GATHERING_LOCATIONS.map((loc) => ({
        ...loc,
        isSelectable: gatheringCardIds.has(loc.cardId),
      }));
      (gatheringUI as GatheringPhaseUI).setAvailableLocations(locations);
    }

    // LOCATION_SELECTステージで表示開始
    (gatheringUI as GatheringPhaseUI).show();
  }

  /**
   * 採取セッションを終了し、獲得素材をインベントリに保存する
   */
  private finalizeGatheringSession(): void {
    const container = Container.getInstance();

    if (!container.has(ServiceKeys.GatheringService)) return;
    const gatheringService = container.resolve<IGatheringService>(ServiceKeys.GatheringService);

    const session = gatheringService.getCurrentSession();
    if (!session) return;

    try {
      const result = gatheringService.endGathering(session.sessionId);

      if (container.has(ServiceKeys.InventoryService)) {
        const inventoryService = container.resolve<
          import('@shared/domain/interfaces/inventory-service.interface').IInventoryService
        >(ServiceKeys.InventoryService);
        inventoryService.addMaterials(result.materials);
      }
    } catch (error) {
      console.error('Failed to finalize gathering session:', error);
    }
  }

  /**
   * 調合フェーズを初期化
   */
  private initializeAlchemyPhase(): void {
    const container = Container.getInstance();

    if (!container.has(ServiceKeys.InventoryService)) {
      console.warn('InventoryService is not available');
      return;
    }
    const inventoryService = container.resolve<
      import('@shared/domain/interfaces/inventory-service.interface').IInventoryService
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
    const container = Container.getInstance();

    if (!container.has(ServiceKeys.InventoryService)) return;
    const inventoryService = container.resolve<
      import('@shared/domain/interfaces/inventory-service.interface').IInventoryService
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

      const availableQuests = this.questService.getAvailableQuests();
      const questAcceptUI = this.phaseUIs.get(GamePhase.QUEST_ACCEPT);
      if (questAcceptUI && 'updateQuests' in questAcceptUI) {
        const quests = availableQuests.map((q) => {
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
