/**
 * 採取2段階化 統合テスト
 * TASK-0120: 統合テスト - 採取2段階化
 *
 * @description
 * LocationSelectUI、GatheringPhaseUI（GatheringStage状態機械）、GatheringServiceの
 * 連携を検証する。場所選択→ドラフト採取→採取結果までの一連のフローをテスト。
 *
 * @信頼性レベル 🔵 REQ-002, EDGE-103, 設計文書architecture.mdより
 */

import type { IGatheringService } from '@domain/interfaces/gathering-service.interface';
import type { IGatheringLocation, ILocationSelectResult } from '@features/gathering';
import {
  GATHERING_LOCATIONS,
  GatheringStage,
  getAvailableLocations,
  getLocationDetail,
  getSelectableLocations,
} from '@features/gathering';
import type { Card, IGatheringCard } from '@shared/types';
import { CardType, toCardId } from '@shared/types';
import { describe, expect, it, vi } from 'vitest';

// =============================================================================
// テスト用ヘルパー
// =============================================================================

/**
 * 採取地カードを作成するヘルパー関数
 * @param locationKey - GATHERING_LOCATIONSのcardIdに対応するキー (e.g. 'gathering-forest')
 */
const createGatheringCard = (locationKey: string): IGatheringCard => ({
  id: toCardId(locationKey),
  name: `テスト採取地: ${locationKey}`,
  type: CardType.GATHERING,
  rarity: 'Common' as Card['rarity'],
  unlockRank: 'G' as Card['unlockRank'],
  cost: 1,
  materials: [],
});

/**
 * 非採取カード（レシピカード）を作成するヘルパー関数
 */
const createRecipeCard = (id: string): Card =>
  ({
    id: toCardId(id),
    name: `テストレシピ: ${id}`,
    type: CardType.RECIPE,
    rarity: 'Common',
    unlockRank: 'G',
    requiredMaterials: [],
    resultItem: { itemId: 'test-item', category: 'material' },
  }) as Card;

/**
 * モックGatheringServiceの作成
 */
const createMockGatheringService = (): IGatheringService =>
  ({
    startDraftGathering: vi.fn(() => ({
      sessionId: 'test-session-001',
      card: createGatheringCard('gathering-forest'),
      currentRound: 1,
      maxRounds: 3,
      selectedMaterials: [],
      currentOptions: [],
      isComplete: false,
    })),
    selectMaterial: vi.fn(),
    skipSelection: vi.fn(),
    endGathering: vi.fn(() => ({
      materials: [],
      cost: { actionPointCost: 1, extraDays: 0 },
    })),
    getCurrentSession: vi.fn(() => null),
    canGather: vi.fn(() => true),
    calculateGatheringCost: vi.fn(() => ({ actionPointCost: 1, extraDays: 0 })),
  }) as unknown as IGatheringService;

// =============================================================================
// テスト
// =============================================================================

describe('採取2段階化 統合テスト（TASK-0120）', () => {
  // ===========================================================================
  // テストケース1: 場所選択フロー（純粋関数連携）
  // ===========================================================================

  describe('場所選択フロー - getAvailableLocations連携', () => {
    it('T-0120-LOC-01: 手札の採取地カードに基づいて場所がフィルタリングされる', () => {
      // 【テスト目的】: 手札に採取地カードがある場所はisSelectable=trueになること
      // 🔵 REQ-002-04: 手札カード連動フィルタリング

      const hand: Card[] = [
        createGatheringCard('gathering_nearby_forest'),
        createGatheringCard('gathering_mountain_trail'),
      ];

      const locations = getAvailableLocations(hand, GATHERING_LOCATIONS);

      // 全8場所が返される
      expect(locations).toHaveLength(8);

      // 手札にある場所はisSelectable=true
      const forest = locations.find((l) => l.cardId === toCardId('gathering_nearby_forest'));
      expect(forest?.isSelectable).toBe(true);

      const mountain = locations.find((l) => l.cardId === toCardId('gathering_mountain_trail'));
      expect(mountain?.isSelectable).toBe(true);

      // 手札にない場所はisSelectable=false
      const riverside = locations.find((l) => l.cardId === toCardId('gathering_riverside'));
      expect(riverside?.isSelectable).toBe(false);

      const ancientForest = locations.find(
        (l) => l.cardId === toCardId('gathering_ancient_forest'),
      );
      expect(ancientForest?.isSelectable).toBe(false);

      const volcanic = locations.find((l) => l.cardId === toCardId('gathering_volcanic_area'));
      expect(volcanic?.isSelectable).toBe(false);
    });

    it('T-0120-LOC-02: getSelectableLocationsで選択可能な場所のみ取得できる', () => {
      // 【テスト目的】: getSelectableLocationsが手札にある場所のみ返すこと
      // 🔵 REQ-002-05: 選択可能場所フィルタリング

      const hand: Card[] = [
        createGatheringCard('gathering_nearby_forest'),
        createGatheringCard('gathering_ancient_forest'),
      ];

      const selectableLocations = getSelectableLocations(hand, GATHERING_LOCATIONS);

      expect(selectableLocations).toHaveLength(2);
      expect(selectableLocations.map((l) => l.cardId)).toContain(
        toCardId('gathering_nearby_forest'),
      );
      expect(selectableLocations.map((l) => l.cardId)).toContain(
        toCardId('gathering_ancient_forest'),
      );
      // 全てisSelectable=true
      expect(selectableLocations.every((l) => l.isSelectable)).toBe(true);
    });

    it('T-0120-LOC-03: 非採取カードはフィルタリングに影響しない', () => {
      // 【テスト目的】: レシピカード等の非採取カードが場所フィルタリングに影響しないこと
      // 🔵 REQ-002-04

      const hand: Card[] = [
        createRecipeCard('recipe-001'),
        createGatheringCard('gathering_riverside'),
        createRecipeCard('recipe-002'),
      ];

      const locations = getAvailableLocations(hand, GATHERING_LOCATIONS);
      const selectableCount = locations.filter((l) => l.isSelectable).length;

      // 採取地カードは1枚だけ（gathering_riverside）
      expect(selectableCount).toBe(1);
      const riverside = locations.find((l) => l.cardId === toCardId('gathering_riverside'));
      expect(riverside?.isSelectable).toBe(true);
    });

    it('T-0120-LOC-04: 全8採取地カードを持つ場合、全場所が選択可能', () => {
      // 【テスト目的】: 全カードが手札にある場合、全場所が選択可能になること
      // 🔵 REQ-002-04

      const hand: Card[] = GATHERING_LOCATIONS.map((loc) =>
        createGatheringCard(loc.cardId as string),
      );

      const selectableLocations = getSelectableLocations(hand, GATHERING_LOCATIONS);

      expect(selectableLocations).toHaveLength(8);
    });
  });

  // ===========================================================================
  // テストケース2: 場所詳細・APコスト表示
  // ===========================================================================

  describe('場所詳細・APコスト連携', () => {
    it('T-0120-DETAIL-01: getLocationDetailで場所の詳細を取得できる', () => {
      // 【テスト目的】: cardIdから場所詳細を取得できること
      // 🔵 REQ-002-02: 場所詳細表示

      const forestDetail = getLocationDetail(
        toCardId('gathering_nearby_forest'),
        GATHERING_LOCATIONS,
      );
      expect(forestDetail).toBeDefined();
      expect(forestDetail?.name).toBe('近くの森');
      expect(forestDetail?.movementAPCost).toBe(0);

      const ancientDetail = getLocationDetail(
        toCardId('gathering_ancient_forest'),
        GATHERING_LOCATIONS,
      );
      expect(ancientDetail).toBeDefined();
      expect(ancientDetail?.name).toBe('古代の森');
      expect(ancientDetail?.movementAPCost).toBe(0);
    });

    it('T-0120-DETAIL-02: 各場所の素材プレビューが正しく設定されている', () => {
      // 【テスト目的】: 各場所に素材プレビューが設定されていること
      // 🔵 REQ-002-03: 素材プレビュー表示

      for (const location of GATHERING_LOCATIONS) {
        expect(location.availableMaterials.length).toBeGreaterThanOrEqual(2);

        for (const material of location.availableMaterials) {
          expect(['high', 'medium', 'low']).toContain(material.dropRate);
        }
      }
    });

    it('T-0120-DETAIL-03: 全場所のAPコストがマスターデータのbaseCostと一致する', () => {
      // 【テスト目的】: 全場所のAPコストがマスターデータに準拠していること
      // 🔵 REQ-002-02: 場所ごとのAPコスト

      // マスターデータでは全場所のbaseCostが0
      for (const location of GATHERING_LOCATIONS) {
        expect(location.movementAPCost).toBe(0);
      }

      // 全8箇所の場所名を確認
      const locationNames = GATHERING_LOCATIONS.map((l) => l.name);
      expect(locationNames).toContain('裏庭');
      expect(locationNames).toContain('近くの森');
      expect(locationNames).toContain('川辺');
      expect(locationNames).toContain('火山地帯');
    });

    it('T-0120-DETAIL-04: 存在しないcardIdでundefinedが返る', () => {
      // 【テスト目的】: 不正なcardIdに対するエラーハンドリング
      // 🟡 EDGE-103: 不正入力への防御

      const result = getLocationDetail(toCardId('gathering-nonexistent'), GATHERING_LOCATIONS);
      expect(result).toBeUndefined();
    });
  });

  // ===========================================================================
  // テストケース3: GatheringStage状態遷移
  // ===========================================================================

  describe('GatheringStage状態遷移', () => {
    it('T-0120-STAGE-01: GatheringStage定数に4つのステージが定義されている', () => {
      // 【テスト目的】: GatheringStageが正しく定義されていること
      // 🔵 architecture.md GatheringPhaseUI変更点

      expect(GatheringStage.LOCATION_SELECT).toBe('LOCATION_SELECT');
      expect(GatheringStage.LOCATION_DETAIL).toBe('LOCATION_DETAIL');
      expect(GatheringStage.DRAFT_SESSION).toBe('DRAFT_SESSION');
      expect(GatheringStage.GATHER_RESULT).toBe('GATHER_RESULT');
    });

    it('T-0120-STAGE-02: GatheringPhaseUI初期状態はLOCATION_SELECT', async () => {
      // 【テスト目的】: GatheringPhaseUI作成直後のステージがLOCATION_SELECTであること
      // 🔵 architecture.md: 採取フェーズ開始時は場所選択から

      // GatheringPhaseUIをモックシーンで作成
      const mockScene = createMockPhaserScene();
      const mockGatheringService = createMockGatheringService();

      const { GatheringPhaseUI } = await import('@features/gathering/components/GatheringPhaseUI');
      const phaseUI = new GatheringPhaseUI(mockScene, mockGatheringService);

      expect(phaseUI.getCurrentStage()).toBe(GatheringStage.LOCATION_SELECT);
    });

    it('T-0120-STAGE-03: show()でLOCATION_SELECTステージが設定される', async () => {
      // 【テスト目的】: show()呼び出しでLOCATION_SELECTにリセットされること
      // 🔵 TASK-0114完了条件

      const mockScene = createMockPhaserScene();
      const mockGatheringService = createMockGatheringService();

      const { GatheringPhaseUI } = await import('@features/gathering/components/GatheringPhaseUI');
      const phaseUI = new GatheringPhaseUI(mockScene, mockGatheringService);
      phaseUI.create();
      phaseUI.show();

      expect(phaseUI.getCurrentStage()).toBe(GatheringStage.LOCATION_SELECT);
    });

    it('T-0120-STAGE-04: handleLocationSelected()でDRAFT_SESSIONに遷移する', async () => {
      // 【テスト目的】: 場所選択完了時にDRAFT_SESSIONステージに遷移すること
      // 🔵 architecture.md LOCATION_SELECT→DRAFT_SESSION遷移

      const mockScene = createMockPhaserScene();
      const mockGatheringService = createMockGatheringService();

      const { GatheringPhaseUI } = await import('@features/gathering/components/GatheringPhaseUI');
      const phaseUI = new GatheringPhaseUI(mockScene, mockGatheringService);
      phaseUI.create();
      phaseUI.show();

      const locationResult: ILocationSelectResult = {
        cardId: toCardId('gathering-forest'),
        locationName: '近くの森',
        movementAPCost: 1,
      };

      phaseUI.handleLocationSelected(locationResult);

      expect(phaseUI.getCurrentStage()).toBe(GatheringStage.DRAFT_SESSION);
      expect(phaseUI.hasActiveSession()).toBe(true);
    });

    it('T-0120-STAGE-05: discardSession()でLOCATION_SELECTに戻る', async () => {
      // 【テスト目的】: セッション破棄時にLOCATION_SELECTにリセットされること
      // 🔵 TASK-0114完了条件: セッション破棄→LOCATION_SELECT

      const mockScene = createMockPhaserScene();
      const mockGatheringService = createMockGatheringService();

      const { GatheringPhaseUI } = await import('@features/gathering/components/GatheringPhaseUI');
      const phaseUI = new GatheringPhaseUI(mockScene, mockGatheringService);
      phaseUI.create();
      phaseUI.show();

      // DRAFT_SESSIONに遷移
      phaseUI.handleLocationSelected({
        cardId: toCardId('gathering-forest'),
        locationName: '近くの森',
        movementAPCost: 1,
      });
      expect(phaseUI.getCurrentStage()).toBe(GatheringStage.DRAFT_SESSION);

      // セッション破棄でLOCATION_SELECTに戻る
      phaseUI.discardSession();

      expect(phaseUI.getCurrentStage()).toBe(GatheringStage.LOCATION_SELECT);
      expect(phaseUI.hasActiveSession()).toBe(false);
    });

    it('T-0120-STAGE-06: handleLocationSelected()でGatheringServiceが呼ばれる', async () => {
      // 【テスト目的】: 場所選択時にstartDraftGatheringが呼ばれること
      // 🔵 dataflow.md セクション4.2: 場所選択→セッション開始

      const mockScene = createMockPhaserScene();
      const mockGatheringService = createMockGatheringService();

      const { GatheringPhaseUI } = await import('@features/gathering/components/GatheringPhaseUI');
      const phaseUI = new GatheringPhaseUI(mockScene, mockGatheringService);
      phaseUI.create();
      phaseUI.show();

      phaseUI.handleLocationSelected({
        cardId: toCardId('gathering-mine'),
        locationName: '鉱山',
        movementAPCost: 1,
      });

      expect(mockGatheringService.startDraftGathering).toHaveBeenCalledTimes(1);
    });
  });

  // ===========================================================================
  // テストケース4: フェーズ離脱確認
  // ===========================================================================

  describe('フェーズ離脱確認', () => {
    it('T-0120-LEAVE-01: セッション未開始時はrequestLeavePhaseが即確認する', async () => {
      // 【テスト目的】: アクティブセッションがない場合、即座にonConfirmが呼ばれること
      // 🔵 TASK-0114: セッション未開始時は確認不要

      const mockScene = createMockPhaserScene();
      const mockGatheringService = createMockGatheringService();

      const { GatheringPhaseUI } = await import('@features/gathering/components/GatheringPhaseUI');
      const phaseUI = new GatheringPhaseUI(mockScene, mockGatheringService);
      phaseUI.create();

      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      const needsConfirmation = phaseUI.requestLeavePhase(onConfirm, onCancel);

      expect(needsConfirmation).toBe(false);
      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(onCancel).not.toHaveBeenCalled();
    });

    it('T-0120-LEAVE-02: アクティブセッション中はrequestLeavePhaseが確認を要求する', async () => {
      // 【テスト目的】: ドラフトセッション中はフェーズ離脱に確認が必要なこと
      // 🔵 TASK-0114: アクティブセッション時の確認ダイアログ

      const mockScene = createMockPhaserScene();
      const mockGatheringService = createMockGatheringService();

      const { GatheringPhaseUI } = await import('@features/gathering/components/GatheringPhaseUI');
      const phaseUI = new GatheringPhaseUI(mockScene, mockGatheringService);
      phaseUI.create();
      phaseUI.show();

      // セッションを開始
      phaseUI.handleLocationSelected({
        cardId: toCardId('gathering-forest'),
        locationName: '近くの森',
        movementAPCost: 1,
      });

      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      const needsConfirmation = phaseUI.requestLeavePhase(onConfirm, onCancel);

      expect(needsConfirmation).toBe(true);
      expect(onConfirm).not.toHaveBeenCalled();
      expect(onCancel).not.toHaveBeenCalled();
    });

    it('T-0120-LEAVE-03: confirmLeavePhase()でセッション破棄＋確認コールバック実行', async () => {
      // 【テスト目的】: 中断確認でonConfirmが呼ばれ、セッションが破棄されること
      // 🔵 TASK-0114: confirmLeavePhaseの動作

      const mockScene = createMockPhaserScene();
      const mockGatheringService = createMockGatheringService();

      const { GatheringPhaseUI } = await import('@features/gathering/components/GatheringPhaseUI');
      const phaseUI = new GatheringPhaseUI(mockScene, mockGatheringService);
      phaseUI.create();
      phaseUI.show();

      // セッションを開始
      phaseUI.handleLocationSelected({
        cardId: toCardId('gathering-forest'),
        locationName: '近くの森',
        movementAPCost: 1,
      });

      const onConfirm = vi.fn();
      const onCancel = vi.fn();
      phaseUI.requestLeavePhase(onConfirm, onCancel);

      // 中断確認
      phaseUI.confirmLeavePhase();

      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(phaseUI.hasActiveSession()).toBe(false);
      expect(phaseUI.getCurrentStage()).toBe(GatheringStage.LOCATION_SELECT);
    });

    it('T-0120-LEAVE-04: cancelLeavePhase()でキャンセルコールバック実行', async () => {
      // 【テスト目的】: キャンセル時にonCancelが呼ばれ、セッションが維持されること
      // 🔵 TASK-0114: cancelLeavePhaseの動作

      const mockScene = createMockPhaserScene();
      const mockGatheringService = createMockGatheringService();

      const { GatheringPhaseUI } = await import('@features/gathering/components/GatheringPhaseUI');
      const phaseUI = new GatheringPhaseUI(mockScene, mockGatheringService);
      phaseUI.create();
      phaseUI.show();

      // セッションを開始
      phaseUI.handleLocationSelected({
        cardId: toCardId('gathering-forest'),
        locationName: '近くの森',
        movementAPCost: 1,
      });

      const onConfirm = vi.fn();
      const onCancel = vi.fn();
      phaseUI.requestLeavePhase(onConfirm, onCancel);

      // キャンセル
      phaseUI.cancelLeavePhase();

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onConfirm).not.toHaveBeenCalled();
      expect(phaseUI.hasActiveSession()).toBe(true);
      expect(phaseUI.getCurrentStage()).toBe(GatheringStage.DRAFT_SESSION);
    });
  });

  // ===========================================================================
  // テストケース5: 空手札状態（エッジケース）
  // ===========================================================================

  describe('空手札状態（エッジケース）', () => {
    it('T-0120-EMPTY-01: 手札が空の場合、全場所がisSelectable=false', () => {
      // 【テスト目的】: 採取地カード0枚時に全場所が選択不可になること
      // 🟡 EDGE-103: 空手札状態

      const hand: Card[] = [];
      const locations = getAvailableLocations(hand, GATHERING_LOCATIONS);

      expect(locations).toHaveLength(8);
      expect(locations.every((l) => !l.isSelectable)).toBe(true);
    });

    it('T-0120-EMPTY-02: レシピカードのみの手札では採取地選択不可', () => {
      // 【テスト目的】: 非採取カードのみの手札では全場所が選択不可になること
      // 🟡 EDGE-103

      const hand: Card[] = [createRecipeCard('recipe-001'), createRecipeCard('recipe-002')];

      const selectableLocations = getSelectableLocations(hand, GATHERING_LOCATIONS);
      expect(selectableLocations).toHaveLength(0);
    });

    it('T-0120-EMPTY-03: 空手札時にgetSelectableLocationsが空配列を返す', () => {
      // 【テスト目的】: 空手札でgetSelectableLocationsが空配列を返すこと
      // 🟡 EDGE-103

      const hand: Card[] = [];
      const result = getSelectableLocations(hand, GATHERING_LOCATIONS);

      expect(result).toEqual([]);
    });
  });

  // ===========================================================================
  // テストケース6: 場所選択→ドラフト採取 E2E連携
  // ===========================================================================

  describe('場所選択→ドラフト採取 E2E連携', () => {
    it('T-0120-E2E-01: 手札から利用可能場所を取得→場所選択→セッション開始の一連フロー', async () => {
      // 【テスト目的】: getAvailableLocations → handleLocationSelected → DRAFT_SESSION の流れ
      // 🔵 REQ-002 全体フロー

      const hand: Card[] = [createGatheringCard('gathering_nearby_forest')];

      // Step 1: 利用可能場所を取得
      const availableLocations = getAvailableLocations(hand, GATHERING_LOCATIONS);
      const selectableLocations = availableLocations.filter((l) => l.isSelectable);
      expect(selectableLocations).toHaveLength(1);

      // Step 2: 場所詳細を取得
      const selectedLocation = selectableLocations[0] as IGatheringLocation;
      const detail = getLocationDetail(selectedLocation.cardId, GATHERING_LOCATIONS);
      expect(detail).toBeDefined();
      expect(detail?.name).toBe('近くの森');
      expect(detail?.movementAPCost).toBe(0);

      // Step 3: GatheringPhaseUIで場所選択→DRAFT_SESSION遷移
      const mockScene = createMockPhaserScene();
      const mockGatheringService = createMockGatheringService();

      const { GatheringPhaseUI } = await import('@features/gathering/components/GatheringPhaseUI');
      const phaseUI = new GatheringPhaseUI(mockScene, mockGatheringService);
      phaseUI.create();
      phaseUI.show();

      const locationResult: ILocationSelectResult = {
        cardId: selectedLocation.cardId,
        locationName: detail?.name,
        movementAPCost: detail?.movementAPCost,
      };

      phaseUI.handleLocationSelected(locationResult);

      expect(phaseUI.getCurrentStage()).toBe(GatheringStage.DRAFT_SESSION);
      expect(phaseUI.hasActiveSession()).toBe(true);
      expect(mockGatheringService.startDraftGathering).toHaveBeenCalledTimes(1);
    });

    it('T-0120-E2E-02: セッション開始→破棄→再場所選択の往復フロー', async () => {
      // 【テスト目的】: LOCATION_SELECT → DRAFT_SESSION → LOCATION_SELECT の往復
      // 🔵 architecture.md GatheringStage遷移図

      const mockScene = createMockPhaserScene();
      const mockGatheringService = createMockGatheringService();

      const { GatheringPhaseUI } = await import('@features/gathering/components/GatheringPhaseUI');
      const phaseUI = new GatheringPhaseUI(mockScene, mockGatheringService);
      phaseUI.create();
      phaseUI.show();

      // 1回目: 場所選択→セッション開始
      phaseUI.handleLocationSelected({
        cardId: toCardId('gathering_nearby_forest'),
        locationName: '近くの森',
        movementAPCost: 0,
      });
      expect(phaseUI.getCurrentStage()).toBe(GatheringStage.DRAFT_SESSION);

      // セッション破棄→場所選択に戻る
      phaseUI.discardSession();
      expect(phaseUI.getCurrentStage()).toBe(GatheringStage.LOCATION_SELECT);

      // 2回目: 別の場所を選択→セッション開始
      phaseUI.handleLocationSelected({
        cardId: toCardId('gathering_mountain_trail'),
        locationName: '山道',
        movementAPCost: 0,
      });
      expect(phaseUI.getCurrentStage()).toBe(GatheringStage.DRAFT_SESSION);
      expect(mockGatheringService.startDraftGathering).toHaveBeenCalledTimes(2);
    });
  });
});

// =============================================================================
// Phaserモック
// =============================================================================

/**
 * テスト用のモックPhaserシーンを作成する
 *
 * GatheringPhaseUI（BaseComponent継承）が必要とする最低限のシーンAPIをモック。
 * scene.make.text/container、scene.add.container、Buttonなどで必要。
 */
function createMockPhaserScene(): Phaser.Scene {
  const createMockGameObject = () => ({
    setOrigin: vi.fn().mockReturnThis(),
    setText: vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis(),
    setPosition: vi.fn().mockReturnThis(),
    setDepth: vi.fn().mockReturnThis(),
    setAlpha: vi.fn().mockReturnThis(),
    setScale: vi.fn().mockReturnThis(),
    setInteractive: vi.fn().mockReturnThis(),
    setStyle: vi.fn().mockReturnThis(),
    setFillStyle: vi.fn().mockReturnThis(),
    setStrokeStyle: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    off: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    disableInteractive: vi.fn().mockReturnThis(),
    text: '',
    x: 0,
    y: 0,
    visible: true,
    name: '',
    width: 100,
    height: 40,
  });

  const createMockContainer = () => ({
    add: vi.fn().mockReturnThis(),
    remove: vi.fn().mockReturnThis(),
    removeAll: vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis(),
    setPosition: vi.fn().mockReturnThis(),
    setDepth: vi.fn().mockReturnThis(),
    setAlpha: vi.fn().mockReturnThis(),
    setScale: vi.fn().mockReturnThis(),
    setInteractive: vi.fn().mockReturnThis(),
    removeInteractive: vi.fn().mockReturnThis(),
    removeAllListeners: vi.fn().mockReturnThis(),
    disableInteractive: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    off: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    getAll: vi.fn().mockReturnValue([]),
    list: [],
    x: 0,
    y: 0,
    visible: true,
    name: '',
  });

  // rexUIモック: Button.create()等で使用される
  const createMockRexLabel = () => ({
    ...createMockGameObject(),
    layout: vi.fn().mockReturnThis(),
    setMinSize: vi.fn().mockReturnThis(),
    setOrigin: vi.fn().mockReturnThis(),
    resetDisplayContent: vi.fn().mockReturnThis(),
    getElement: vi.fn(() => createMockGameObject()),
  });

  const mockRexUI = {
    add: {
      roundRectangle: vi.fn(() => createMockGameObject()),
      label: vi.fn(() => createMockRexLabel()),
      sizer: vi.fn(() => ({
        ...createMockGameObject(),
        layout: vi.fn().mockReturnThis(),
        add: vi.fn().mockReturnThis(),
      })),
      scrollablePanel: vi.fn(() => ({
        ...createMockGameObject(),
        layout: vi.fn().mockReturnThis(),
      })),
    },
  };

  return {
    rexUI: mockRexUI,
    add: {
      container: vi.fn(() => createMockContainer()),
      text: vi.fn(() => createMockGameObject()),
      rectangle: vi.fn(() => createMockGameObject()),
      graphics: vi.fn(() => ({
        fillStyle: vi.fn().mockReturnThis(),
        fillRect: vi.fn().mockReturnThis(),
        lineStyle: vi.fn().mockReturnThis(),
        strokeRect: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
      })),
      existing: vi.fn((obj: unknown) => obj),
    },
    make: {
      text: vi.fn(() => createMockGameObject()),
      container: vi.fn(() => createMockContainer()),
    },
    tweens: {
      add: vi.fn(() => ({ stop: vi.fn(), destroy: vi.fn() })),
      killAll: vi.fn(),
    },
    time: {
      removeAllEvents: vi.fn(),
      delayedCall: vi.fn(),
    },
    input: {
      keyboard: {
        on: vi.fn(),
        off: vi.fn(),
        removeListener: vi.fn(),
      },
      on: vi.fn(),
      off: vi.fn(),
    },
    plugins: {
      get: vi.fn(() => null),
    },
    children: {
      remove: vi.fn(),
    },
    data: {
      get: vi.fn(),
      set: vi.fn(),
    },
    events: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    },
    scene: {
      key: 'MockScene',
    },
    sys: {
      displayList: { add: vi.fn() },
      updateList: { add: vi.fn() },
    },
  } as unknown as Phaser.Scene;
}
