/**
 * GatheringPhaseUI.spec.ts - 採取フェーズUIコンポーネントのテスト
 * TASK-0023 採取フェーズUI（ドラフト採取）
 *
 * @description
 * TC-201〜TC-250: GatheringPhaseUIコンポーネントのユニットテスト
 * - 正常系（TC-201〜TC-210）: 初期化、セッション開始、素材選択、スキップ、終了
 * - 異常系（TC-221〜TC-226）: EventBus未初期化、GatheringService未設定、無効インデックス
 * - 境界値（TC-231〜TC-237）: コスト計算、最大提示回数
 * - 統合（TC-241〜TC-250）: 完全フロー、途中終了、偵察のみ
 */

import type Phaser from 'phaser';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { GatheringPhaseUI } from '../../../../../src/presentation/ui/phases/GatheringPhaseUI';

// =============================================================================
// モック用の型定義
// =============================================================================

/**
 * GameEventType定義（モック用）
 */
const GameEventType = {
  GATHERING_STARTED: 'GATHERING_STARTED',
  MATERIAL_PRESENTED: 'MATERIAL_PRESENTED',
  MATERIAL_SELECTED: 'MATERIAL_SELECTED',
  ROUND_SKIPPED: 'ROUND_SKIPPED',
  GATHERING_COMPLETED: 'GATHERING_COMPLETED',
  GATHERING_CANCELLED: 'GATHERING_CANCELLED',
  ACTION_POINTS_CHANGED: 'ACTION_POINTS_CHANGED',
} as const;

/**
 * 品質タイプ
 */
type Quality = 'C' | 'B' | 'A' | 'S';

/**
 * 警告レベルタイプ
 */
type WarningLevel = 'none' | 'warning' | 'danger';

/**
 * DraftSessionインターフェース
 */
interface DraftSession {
  sessionId: string;
  card: GatheringCard;
  currentRound: number;
  maxRounds: number;
  selectedMaterials: MaterialInstance[];
  currentOptions: MaterialOption[];
  isComplete: boolean;
}

/**
 * MaterialOptionインターフェース
 */
interface MaterialOption {
  materialId: string;
  name: string;
  icon: string;
  quality: Quality;
  isRare: boolean;
}

/**
 * MaterialInstanceインターフェース
 */
interface MaterialInstance {
  instanceId: string;
  materialId: string;
  name: string;
  quality: Quality;
  isRare: boolean;
}

/**
 * GatheringCardインターフェース
 */
interface GatheringCard {
  id: string;
  name: string;
  type: string;
  baseCost: number;
  maxRounds: number;
  rareRate: number;
  materials: string[];
}

/**
 * GatheringResultインターフェース
 */
interface GatheringResult {
  locationId: string;
  materials: MaterialInstance[];
  baseCost: number;
  additionalCost: number;
  totalCost: number;
  extraDay: boolean;
}

/**
 * GatheringCostResultインターフェース
 */
interface GatheringCostResult {
  baseCost: number;
  additionalCost: number;
  totalCost: number;
  extraDay: boolean;
  warningLevel: WarningLevel;
}

// =============================================================================
// モックヘルパー関数
// =============================================================================

/**
 * Phaserシーンのモックを作成
 */
function createMockScene(): Phaser.Scene {
  const mockScene = {
    add: {
      container: vi.fn().mockReturnValue({
        add: vi.fn(),
        setDepth: vi.fn(),
        destroy: vi.fn(),
        x: 0,
        y: 0,
        active: true,
        setVisible: vi.fn(),
        setPosition: vi.fn(),
      }),
      text: vi.fn().mockReturnValue({
        setOrigin: vi.fn().mockReturnThis(),
        setText: vi.fn().mockReturnThis(),
        setStyle: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
        text: '',
        active: true,
      }),
      rectangle: vi.fn().mockReturnValue({
        setOrigin: vi.fn().mockReturnThis(),
        setInteractive: vi.fn().mockReturnThis(),
        setFillStyle: vi.fn().mockReturnThis(),
        on: vi.fn().mockReturnThis(),
        off: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
        emit: vi.fn(),
        listenerCount: vi.fn().mockReturnValue(0),
        active: true,
      }),
    },
    tweens: {
      add: vi.fn().mockReturnValue({
        on: vi.fn().mockReturnThis(),
      }),
    },
    input: {
      keyboard: {
        on: vi.fn(),
        off: vi.fn(),
      },
    },
    data: {
      get: vi.fn().mockReturnValue(null),
    },
    plugins: {
      get: vi.fn().mockReturnValue({
        add: {
          sizer: vi.fn(),
        },
      }),
    },
  } as unknown as Phaser.Scene;

  return mockScene;
}

/**
 * EventBusのモックを作成
 */
function createMockEventBus() {
  return {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    once: vi.fn(),
  };
}

/**
 * GatheringServiceのモックを作成
 */
function createMockGatheringService() {
  return {
    startDraftGathering: vi.fn().mockReturnValue(createMockDraftSession()),
    selectMaterial: vi.fn().mockReturnValue(createMockMaterialInstance()),
    skipSelection: vi.fn(),
    endGathering: vi.fn().mockReturnValue(createMockGatheringResult()),
    getCurrentSession: vi.fn().mockReturnValue(null),
    canGather: vi.fn().mockReturnValue(true),
    calculateGatheringCost: vi.fn().mockReturnValue({
      baseCost: 2,
      additionalCost: 1,
      totalCost: 3,
      extraDay: false,
      warningLevel: 'none' as WarningLevel,
    }),
  };
}

/**
 * 採取地カードモックを作成
 */
function createMockGatheringCard(overrides?: Partial<GatheringCard>): GatheringCard {
  return {
    id: 'LOC001',
    name: '深緑の森',
    type: 'location',
    baseCost: 2,
    maxRounds: 5,
    rareRate: 0.1,
    materials: ['M001', 'M002', 'M003'],
    ...overrides,
  };
}

/**
 * DraftSessionモックを作成
 */
function createMockDraftSession(overrides?: Partial<DraftSession>): DraftSession {
  return {
    sessionId: 'SESSION001',
    card: createMockGatheringCard(),
    currentRound: 1,
    maxRounds: 5,
    selectedMaterials: [],
    currentOptions: [
      { materialId: 'M001', name: '森の雫', icon: '💧', quality: 'B', isRare: false },
      { materialId: 'M002', name: '薬草', icon: '🌿', quality: 'C', isRare: false },
      { materialId: 'M003', name: '輝石', icon: '💎', quality: 'A', isRare: true },
    ],
    isComplete: false,
    ...overrides,
  };
}

/**
 * MaterialInstanceモックを作成
 */
function createMockMaterialInstance(overrides?: Partial<MaterialInstance>): MaterialInstance {
  return {
    instanceId: 'INST001',
    materialId: 'M001',
    name: '森の雫',
    quality: 'B',
    isRare: false,
    ...overrides,
  };
}

/**
 * GatheringResultモックを作成
 */
function createMockGatheringResult(overrides?: Partial<GatheringResult>): GatheringResult {
  return {
    locationId: 'LOC001',
    materials: [],
    baseCost: 2,
    additionalCost: 0,
    totalCost: 2,
    extraDay: false,
    ...overrides,
  };
}

/**
 * 強化カードモックを作成
 */
function createMockEnhancementCard(): unknown {
  return {
    id: 'ENH001',
    name: '採取効率アップ',
    type: 'enhancement',
  };
}

// =============================================================================
// セットアップヘルパー関数
// =============================================================================

/**
 * アクティブなセッションをセットアップ
 */
function setupActiveSession(
  phaseUI: GatheringPhaseUI,
  mockGatheringService: ReturnType<typeof createMockGatheringService>,
): void {
  const mockCard = createMockGatheringCard();
  (phaseUI as unknown as { gatheringService: unknown }).gatheringService = mockGatheringService;
  phaseUI.startGathering(mockCard);
}

/**
 * 指定数の素材が選択されたセッションをセットアップ
 */
function setupActiveSessionWithMaterials(
  phaseUI: GatheringPhaseUI,
  count: number,
  mockGatheringService: ReturnType<typeof createMockGatheringService>,
): void {
  const selectedMaterials = Array.from({ length: count }, (_, i) => ({
    instanceId: `INST00${i + 1}`,
    materialId: `M00${i + 1}`,
    name: `素材${i + 1}`,
    quality: 'B' as Quality,
    isRare: false,
  }));

  const mockSession = createMockDraftSession({ selectedMaterials });
  mockGatheringService.getCurrentSession.mockReturnValue(mockSession);
  mockGatheringService.startDraftGathering.mockReturnValue(mockSession);

  (phaseUI as unknown as { gatheringService: unknown }).gatheringService = mockGatheringService;
  (phaseUI as unknown as { currentSession: DraftSession }).currentSession = mockSession;
}

/**
 * 最終ラウンドのセッションをセットアップ
 */
function setupActiveSessionAtFinalRound(
  phaseUI: GatheringPhaseUI,
  mockGatheringService: ReturnType<typeof createMockGatheringService>,
): void {
  const mockSession = createMockDraftSession({
    currentRound: 5,
    maxRounds: 5,
  });
  mockGatheringService.getCurrentSession.mockReturnValue(mockSession);
  mockGatheringService.startDraftGathering.mockReturnValue(mockSession);
  mockGatheringService.selectMaterial.mockImplementation(() => {
    mockSession.isComplete = true;
    return createMockMaterialInstance();
  });
  mockGatheringService.skipSelection.mockImplementation(() => {
    mockSession.isComplete = true;
  });

  (phaseUI as unknown as { gatheringService: unknown }).gatheringService = mockGatheringService;
  (phaseUI as unknown as { currentSession: DraftSession }).currentSession = mockSession;
}

/**
 * 素材未選択のセッションをセットアップ
 */
function setupActiveSessionWithNoSelections(
  phaseUI: GatheringPhaseUI,
  mockGatheringService: ReturnType<typeof createMockGatheringService>,
): void {
  const mockSession = createMockDraftSession({
    selectedMaterials: [],
  });
  mockGatheringService.getCurrentSession.mockReturnValue(mockSession);

  (phaseUI as unknown as { gatheringService: unknown }).gatheringService = mockGatheringService;
  (phaseUI as unknown as { currentSession: DraftSession }).currentSession = mockSession;
}

// =============================================================================
// テストスイート
// =============================================================================

describe('GatheringPhaseUI', () => {
  let mockScene: Phaser.Scene;
  let mockEventBus: ReturnType<typeof createMockEventBus>;
  let mockGatheringService: ReturnType<typeof createMockGatheringService>;

  beforeEach(() => {
    // 各テスト実行前にモックを初期化
    mockScene = createMockScene();
    mockEventBus = createMockEventBus();
    mockGatheringService = createMockGatheringService();
    mockScene.data.get = vi.fn().mockReturnValue(mockEventBus);
  });

  // ===========================================================================
  // 正常系テストケース
  // ===========================================================================

  describe('TC-201: フェーズUI初期化', () => {
    // 【テスト目的】: GatheringPhaseUIが正しく初期化されること
    // 【信頼性】: 🔵

    test('TC-201-1: GatheringPhaseUIがエラーなく初期化される', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);

      expect(phaseUI).toBeDefined();
      expect(phaseUI.getContainer()).toBeDefined();
    });

    test('TC-201-2: container.x = 160, container.y = 80 に配置される', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);

      expect(mockScene.add.container).toHaveBeenCalledWith(160, 80);
    });

    test('TC-201-3: タイトル「🌿 採取フェーズ」が表示される', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);

      expect(mockScene.add.text).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        expect.stringContaining('採取'),
        expect.any(Object),
      );
    });

    test('TC-201-4: ラウンドインジケーターが作成される', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);

      expect((phaseUI as unknown as { roundIndicator: unknown }).roundIndicator).toBeDefined();
    });

    test('TC-201-5: コスト表示パネルが作成される', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);

      expect((phaseUI as unknown as { costDisplay: unknown }).costDisplay).toBeDefined();
    });
  });

  describe('TC-202: 採取セッション開始', () => {
    // 【テスト目的】: ドラフト採取セッションが正しく開始されること
    // 【信頼性】: 🔵

    test('TC-202-1: startGathering()でDraftSessionが開始される', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      (phaseUI as unknown as { gatheringService: unknown }).gatheringService = mockGatheringService;
      const mockCard = createMockGatheringCard();

      phaseUI.startGathering(mockCard);

      expect(mockGatheringService.startDraftGathering).toHaveBeenCalledWith(mockCard, undefined);
    });

    test('TC-202-2: GATHERING_STARTEDイベントが発行される', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      (phaseUI as unknown as { gatheringService: unknown }).gatheringService = mockGatheringService;
      const mockCard = createMockGatheringCard();

      phaseUI.startGathering(mockCard);

      expect(mockEventBus.emit).toHaveBeenCalledWith(
        GameEventType.GATHERING_STARTED,
        expect.objectContaining({
          locationId: expect.any(String),
          presentationCount: expect.any(Number),
        }),
      );
    });

    test('TC-202-3: 素材選択肢が3つ表示される', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      (phaseUI as unknown as { gatheringService: unknown }).gatheringService = mockGatheringService;
      const mockCard = createMockGatheringCard();

      phaseUI.startGathering(mockCard);

      expect(
        (phaseUI as unknown as { materialCards: unknown[] }).materialCards.length,
      ).toBe(3);
    });

    test('TC-202-4: ラウンドインジケーターに「ラウンド 1/5」が表示される', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      (phaseUI as unknown as { gatheringService: unknown }).gatheringService = mockGatheringService;
      const mockCard = createMockGatheringCard({ maxRounds: 5 });

      phaseUI.startGathering(mockCard);

      const session = (phaseUI as unknown as { currentSession: DraftSession }).currentSession;
      expect(session.currentRound).toBe(1);
      expect(session.maxRounds).toBe(5);
    });

    test('TC-202-5: 強化カード付きでstartDraftGathering()が呼ばれる', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      (phaseUI as unknown as { gatheringService: unknown }).gatheringService = mockGatheringService;
      const mockCard = createMockGatheringCard();
      const enhancementCards = [createMockEnhancementCard()];

      phaseUI.startGathering(mockCard, enhancementCards as unknown[]);

      expect(mockGatheringService.startDraftGathering).toHaveBeenCalledWith(
        mockCard,
        enhancementCards,
      );
    });
  });

  describe('TC-203: 素材選択', () => {
    // 【テスト目的】: 素材選択が正しく動作すること
    // 【信頼性】: 🔵

    test('TC-203-1: インデックス0の素材を選択できる', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSession(phaseUI, mockGatheringService);

      (phaseUI as unknown as { onMaterialSelected: (index: number) => void }).onMaterialSelected(0);

      expect(mockGatheringService.selectMaterial).toHaveBeenCalledWith(
        expect.any(String),
        0,
      );
    });

    test('TC-203-2: インデックス1の素材を選択できる', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSession(phaseUI, mockGatheringService);

      (phaseUI as unknown as { onMaterialSelected: (index: number) => void }).onMaterialSelected(1);

      expect(mockGatheringService.selectMaterial).toHaveBeenCalledWith(
        expect.any(String),
        1,
      );
    });

    test('TC-203-3: インデックス2の素材を選択できる', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSession(phaseUI, mockGatheringService);

      (phaseUI as unknown as { onMaterialSelected: (index: number) => void }).onMaterialSelected(2);

      expect(mockGatheringService.selectMaterial).toHaveBeenCalledWith(
        expect.any(String),
        2,
      );
    });

    test('TC-203-4: 素材選択時にMATERIAL_SELECTEDイベントが発行される', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSession(phaseUI, mockGatheringService);

      (phaseUI as unknown as { onMaterialSelected: (index: number) => void }).onMaterialSelected(0);

      expect(mockEventBus.emit).toHaveBeenCalledWith(
        GameEventType.MATERIAL_SELECTED,
        expect.objectContaining({
          round: expect.any(Number),
          materialId: expect.any(String),
        }),
      );
    });

    test('TC-203-5: 選択後に次のラウンドの選択肢が表示される', () => {
      const mockSession = createMockDraftSession({ currentRound: 1 });
      mockGatheringService.startDraftGathering.mockReturnValue(mockSession);
      mockGatheringService.selectMaterial.mockImplementation(() => {
        mockSession.currentRound = 2;
        return createMockMaterialInstance();
      });

      const phaseUI = new GatheringPhaseUI(mockScene);
      (phaseUI as unknown as { gatheringService: unknown }).gatheringService = mockGatheringService;
      phaseUI.startGathering(createMockGatheringCard());

      (phaseUI as unknown as { onMaterialSelected: (index: number) => void }).onMaterialSelected(0);

      expect(
        (phaseUI as unknown as { currentSession: DraftSession }).currentSession.currentRound,
      ).toBe(2);
    });

    test('TC-203-6: 選択した素材が獲得済みリストに追加される', () => {
      const mockSession = createMockDraftSession({ selectedMaterials: [] });
      mockGatheringService.startDraftGathering.mockReturnValue(mockSession);
      mockGatheringService.selectMaterial.mockImplementation(() => {
        const material = createMockMaterialInstance();
        mockSession.selectedMaterials.push(material);
        return material;
      });

      const phaseUI = new GatheringPhaseUI(mockScene);
      (phaseUI as unknown as { gatheringService: unknown }).gatheringService = mockGatheringService;
      phaseUI.startGathering(createMockGatheringCard());

      (phaseUI as unknown as { onMaterialSelected: (index: number) => void }).onMaterialSelected(0);

      expect(
        (phaseUI as unknown as { currentSession: DraftSession }).currentSession.selectedMaterials
          .length,
      ).toBe(1);
    });
  });

  describe('TC-204: ラウンドスキップ', () => {
    // 【テスト目的】: ラウンドスキップが正しく動作すること
    // 【信頼性】: 🔵

    test('TC-204-1: onSkipRound()でskipSelection()が呼ばれる', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSession(phaseUI, mockGatheringService);

      (phaseUI as unknown as { onSkipRound: () => void }).onSkipRound();

      expect(mockGatheringService.skipSelection).toHaveBeenCalledWith(expect.any(String));
    });

    test('TC-204-2: スキップ時にROUND_SKIPPEDイベントが発行される', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSession(phaseUI, mockGatheringService);

      (phaseUI as unknown as { onSkipRound: () => void }).onSkipRound();

      expect(mockEventBus.emit).toHaveBeenCalledWith(
        GameEventType.ROUND_SKIPPED,
        expect.objectContaining({
          round: expect.any(Number),
        }),
      );
    });

    test('TC-204-3: スキップ後に次のラウンドへ進む', () => {
      const mockSession = createMockDraftSession({ currentRound: 1 });
      mockGatheringService.startDraftGathering.mockReturnValue(mockSession);
      mockGatheringService.skipSelection.mockImplementation(() => {
        mockSession.currentRound = 2;
      });

      const phaseUI = new GatheringPhaseUI(mockScene);
      (phaseUI as unknown as { gatheringService: unknown }).gatheringService = mockGatheringService;
      phaseUI.startGathering(createMockGatheringCard());

      const initialRound = (phaseUI as unknown as { currentSession: DraftSession }).currentSession
        .currentRound;

      (phaseUI as unknown as { onSkipRound: () => void }).onSkipRound();

      expect(
        (phaseUI as unknown as { currentSession: DraftSession }).currentSession.currentRound,
      ).toBe(initialRound + 1);
    });

    test('TC-204-4: スキップしても獲得済み素材数は増えない', () => {
      const mockSession = createMockDraftSession({ selectedMaterials: [] });
      mockGatheringService.startDraftGathering.mockReturnValue(mockSession);
      mockGatheringService.skipSelection.mockImplementation(() => {
        mockSession.currentRound++;
      });

      const phaseUI = new GatheringPhaseUI(mockScene);
      (phaseUI as unknown as { gatheringService: unknown }).gatheringService = mockGatheringService;
      phaseUI.startGathering(createMockGatheringCard());

      const initialCount = (phaseUI as unknown as { currentSession: DraftSession }).currentSession
        .selectedMaterials.length;

      (phaseUI as unknown as { onSkipRound: () => void }).onSkipRound();

      expect(
        (phaseUI as unknown as { currentSession: DraftSession }).currentSession.selectedMaterials
          .length,
      ).toBe(initialCount);
    });
  });

  describe('TC-205: 採取終了', () => {
    // 【テスト目的】: 採取終了が正しく動作し、コストが計算されること
    // 【信頼性】: 🔵

    test('TC-205-1: onEndGathering()でendGathering()が呼ばれる', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSession(phaseUI, mockGatheringService);

      (phaseUI as unknown as { onEndGathering: () => unknown }).onEndGathering();

      expect(mockGatheringService.endGathering).toHaveBeenCalledWith(expect.any(String));
    });

    test('TC-205-2: 採取終了時にGATHERING_COMPLETEDイベントが発行される', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSession(phaseUI, mockGatheringService);

      (phaseUI as unknown as { onEndGathering: () => unknown }).onEndGathering();

      expect(mockEventBus.emit).toHaveBeenCalledWith(
        GameEventType.GATHERING_COMPLETED,
        expect.objectContaining({
          locationId: expect.any(String),
          materials: expect.any(Array),
          totalCost: expect.any(Number),
          extraDay: expect.any(Boolean),
        }),
      );
    });

    test('TC-205-3: 採取終了時にGatheringResultが返される', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSession(phaseUI, mockGatheringService);

      const result = (phaseUI as unknown as { onEndGathering: () => GatheringResult }).onEndGathering();

      expect(result).toHaveProperty('materials');
      expect(result).toHaveProperty('totalCost');
      expect(result).toHaveProperty('extraDay');
    });

    test('TC-205-4: コスト計算が正しく行われる（3個選択 → 追加コスト2）', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSessionWithMaterials(phaseUI, 3, mockGatheringService);

      (phaseUI as unknown as { onEndGathering: () => unknown }).onEndGathering();

      expect(mockGatheringService.calculateGatheringCost).toHaveBeenCalled();
    });
  });

  describe('TC-206: 全ラウンド完了', () => {
    // 【テスト目的】: 全ラウンド完了時にisCompleteがtrueになること
    // 【信頼性】: 🔵

    test('TC-206-1: 最終ラウンドで選択するとisCompleteがtrueになる', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSessionAtFinalRound(phaseUI, mockGatheringService);

      (phaseUI as unknown as { onMaterialSelected: (index: number) => void }).onMaterialSelected(0);

      expect(
        (phaseUI as unknown as { currentSession: DraftSession }).currentSession.isComplete,
      ).toBe(true);
    });

    test('TC-206-2: 最終ラウンドでスキップするとisCompleteがtrueになる', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSessionAtFinalRound(phaseUI, mockGatheringService);

      (phaseUI as unknown as { onSkipRound: () => void }).onSkipRound();

      expect(
        (phaseUI as unknown as { currentSession: DraftSession }).currentSession.isComplete,
      ).toBe(true);
    });

    test('TC-206-3: isComplete時に自動的に採取終了処理が行われる', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSessionAtFinalRound(phaseUI, mockGatheringService);

      (phaseUI as unknown as { onMaterialSelected: (index: number) => void }).onMaterialSelected(0);

      expect(mockGatheringService.endGathering).toHaveBeenCalled();
    });
  });

  describe('TC-207: 獲得済み素材リスト表示', () => {
    // 【テスト目的】: 獲得済み素材が正しく表示されること
    // 【信頼性】: 🔵

    test('TC-207-1: 素材選択後に獲得済みリストが更新される', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSession(phaseUI, mockGatheringService);
      const updateSpy = vi.spyOn(
        phaseUI as unknown as { updateSelectedMaterialsDisplay: () => void },
        'updateSelectedMaterialsDisplay',
      );

      (phaseUI as unknown as { onMaterialSelected: (index: number) => void }).onMaterialSelected(0);

      expect(updateSpy).toHaveBeenCalled();
    });

    test('TC-207-2: 素材名と品質が表示される', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSessionWithMaterials(phaseUI, 1, mockGatheringService);

      const displayText = (
        phaseUI as unknown as { getSelectedMaterialsDisplayText: () => string }
      ).getSelectedMaterialsDisplayText();

      expect(displayText).toContain('素材1');
      expect(displayText).toMatch(/[CBAS]/);
    });
  });

  describe('TC-208: コスト表示パネル', () => {
    // 【テスト目的】: コストがリアルタイムで表示されること
    // 【信頼性】: 🔵

    test('TC-208-1: 基本コストが表示される', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      (phaseUI as unknown as { gatheringService: unknown }).gatheringService = mockGatheringService;
      const mockCard = createMockGatheringCard({ baseCost: 2 });

      phaseUI.startGathering(mockCard);

      expect((phaseUI as unknown as { costDisplay: unknown }).costDisplay).toBeDefined();
    });

    test('TC-208-2: 素材選択でコスト表示が更新される', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSession(phaseUI, mockGatheringService);
      const updateCostSpy = vi.spyOn(
        phaseUI as unknown as { updateCostDisplay: (count: number) => void },
        'updateCostDisplay',
      );

      (phaseUI as unknown as { onMaterialSelected: (index: number) => void }).onMaterialSelected(0);

      expect(updateCostSpy).toHaveBeenCalled();
    });
  });

  describe('TC-209: キーボードショートカット', () => {
    // 【テスト目的】: キーボードショートカットが正しく動作すること
    // 【信頼性】: 🔵

    test('TC-209-1: キー「1」で左の素材（インデックス0）を選択', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSession(phaseUI, mockGatheringService);

      (
        phaseUI as unknown as { handleKeyboardInput: (event: { key: string }) => void }
      ).handleKeyboardInput({ key: '1' });

      expect(mockGatheringService.selectMaterial).toHaveBeenCalledWith(expect.any(String), 0);
    });

    test('TC-209-2: キー「2」で中央の素材（インデックス1）を選択', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSession(phaseUI, mockGatheringService);

      (
        phaseUI as unknown as { handleKeyboardInput: (event: { key: string }) => void }
      ).handleKeyboardInput({ key: '2' });

      expect(mockGatheringService.selectMaterial).toHaveBeenCalledWith(expect.any(String), 1);
    });

    test('TC-209-3: キー「3」で右の素材（インデックス2）を選択', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSession(phaseUI, mockGatheringService);

      (
        phaseUI as unknown as { handleKeyboardInput: (event: { key: string }) => void }
      ).handleKeyboardInput({ key: '3' });

      expect(mockGatheringService.selectMaterial).toHaveBeenCalledWith(expect.any(String), 2);
    });

    test('TC-209-4: キー「S」でラウンドをスキップ', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSession(phaseUI, mockGatheringService);

      (
        phaseUI as unknown as { handleKeyboardInput: (event: { key: string }) => void }
      ).handleKeyboardInput({ key: 'S' });

      expect(mockGatheringService.skipSelection).toHaveBeenCalled();
    });

    test('TC-209-5: キー「0」でラウンドをスキップ', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSession(phaseUI, mockGatheringService);

      (
        phaseUI as unknown as { handleKeyboardInput: (event: { key: string }) => void }
      ).handleKeyboardInput({ key: '0' });

      expect(mockGatheringService.skipSelection).toHaveBeenCalled();
    });

    test('TC-209-6: キー「E」で採取を終了', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSession(phaseUI, mockGatheringService);

      (
        phaseUI as unknown as { handleKeyboardInput: (event: { key: string }) => void }
      ).handleKeyboardInput({ key: 'E' });

      expect(mockGatheringService.endGathering).toHaveBeenCalled();
    });

    test('TC-209-7: キー「Escape」でキャンセル（素材未選択時のみ）', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSessionWithNoSelections(phaseUI, mockGatheringService);

      (
        phaseUI as unknown as { handleKeyboardInput: (event: { key: string }) => void }
      ).handleKeyboardInput({ key: 'Escape' });

      expect(mockEventBus.emit).toHaveBeenCalledWith(
        GameEventType.GATHERING_CANCELLED,
        expect.any(Object),
      );
    });
  });

  describe('TC-210: リソース解放', () => {
    // 【テスト目的】: destroy()でリソースが正しく解放されること
    // 【信頼性】: 🔵

    test('TC-210-1: すべてのMaterialCardUIのdestroy()が呼ばれる', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSession(phaseUI, mockGatheringService);

      const cards = [...(phaseUI as unknown as { materialCards: { destroy: () => void }[] }).materialCards];
      const destroySpies = cards.map((card) => vi.spyOn(card, 'destroy'));

      phaseUI.destroy();

      for (const spy of destroySpies) {
        expect(spy).toHaveBeenCalledTimes(1);
      }
    });

    test('TC-210-2: container.destroy()が呼ばれる', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);

      phaseUI.destroy();

      expect(phaseUI.getContainer().destroy).toHaveBeenCalledTimes(1);
    });

    test('TC-210-3: キーボードリスナーが解除される', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);

      phaseUI.destroy();

      expect(mockScene.input.keyboard.off).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // 異常系テストケース
  // ===========================================================================

  describe('TC-221: EventBus未初期化', () => {
    // 【テスト目的】: EventBus未初期化時に警告が出て処理が継続すること
    // 【信頼性】: 🔵

    test('TC-221-1: EventBus未初期化でもエラーはスローされない', () => {
      const sceneWithoutEventBus = createMockScene();
      sceneWithoutEventBus.data.get = vi.fn().mockReturnValue(null);

      const createPhaseUI = () => {
        const phaseUI = new GatheringPhaseUI(sceneWithoutEventBus);
        phaseUI.create();
      };

      expect(createPhaseUI).not.toThrow();
    });

    test('TC-221-2: EventBus未初期化時にconsole.warnが呼ばれる', () => {
      const sceneWithoutEventBus = createMockScene();
      sceneWithoutEventBus.data.get = vi.fn().mockReturnValue(null);
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const phaseUI = new GatheringPhaseUI(sceneWithoutEventBus);
      phaseUI.create();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('EventBus is not available'),
      );

      consoleWarnSpy.mockRestore();
    });

    test('TC-221-3: EventBus未初期化でもUI処理は継続される', () => {
      const sceneWithoutEventBus = createMockScene();
      sceneWithoutEventBus.data.get = vi.fn().mockReturnValue(null);

      const phaseUI = new GatheringPhaseUI(sceneWithoutEventBus);
      phaseUI.create();

      expect(phaseUI.getContainer()).toBeDefined();
    });
  });

  describe('TC-222: GatheringService未設定', () => {
    // 【テスト目的】: GatheringService未設定時に適切なフォールバックが行われること
    // 【信頼性】: 🟡

    test('TC-222-1: GatheringService未設定時にエラーログが出力される', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      (phaseUI as unknown as { gatheringService: null }).gatheringService = null;
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      phaseUI.startGathering(createMockGatheringCard());

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('GatheringService is not available'),
      );

      consoleErrorSpy.mockRestore();
    });

    test('TC-222-2: GatheringService未設定でもアプリケーションが停止しない', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      (phaseUI as unknown as { gatheringService: null }).gatheringService = null;

      const startGathering = () => phaseUI.startGathering(createMockGatheringCard());

      expect(startGathering).not.toThrow();
    });
  });

  describe('TC-223: 無効な素材インデックス', () => {
    // 【テスト目的】: 無効なインデックスでApplicationErrorがスローされること
    // 【信頼性】: 🟡

    test('TC-223-1: インデックス-1でエラー', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSession(phaseUI, mockGatheringService);

      expect(() =>
        (phaseUI as unknown as { onMaterialSelected: (index: number) => void }).onMaterialSelected(
          -1,
        ),
      ).toThrow();
    });

    test('TC-223-2: インデックス3でエラー', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSession(phaseUI, mockGatheringService);

      expect(() =>
        (phaseUI as unknown as { onMaterialSelected: (index: number) => void }).onMaterialSelected(
          3,
        ),
      ).toThrow();
    });
  });

  describe('TC-224: セッション未開始時の操作', () => {
    // 【テスト目的】: セッション未開始時の操作が適切に処理されること
    // 【信頼性】: 🟡

    test('TC-224-1: セッション未開始時に素材選択が無視される', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);

      const selectMaterial = () =>
        (phaseUI as unknown as { onMaterialSelected: (index: number) => void }).onMaterialSelected(
          0,
        );

      expect(selectMaterial).not.toThrow();
      expect(mockGatheringService.selectMaterial).not.toHaveBeenCalled();
    });

    test('TC-224-2: セッション未開始時にスキップが無視される', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);

      const skipRound = () =>
        (phaseUI as unknown as { onSkipRound: () => void }).onSkipRound();

      expect(skipRound).not.toThrow();
      expect(mockGatheringService.skipSelection).not.toHaveBeenCalled();
    });
  });

  describe('TC-225: イベント発行失敗', () => {
    // 【テスト目的】: EventBus.emit()でエラーが発生しても処理が継続すること
    // 【信頼性】: 🟡

    test('TC-225-1: EventBus.emit()エラーがキャッチされる', () => {
      const mockEventBusWithError = createMockEventBus();
      mockEventBusWithError.emit = vi.fn().mockImplementation(() => {
        throw new Error('EventBus error');
      });
      mockScene.data.get = vi.fn().mockReturnValue(mockEventBusWithError);

      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSession(phaseUI, mockGatheringService);

      const selectMaterial = () =>
        (phaseUI as unknown as { onMaterialSelected: (index: number) => void }).onMaterialSelected(
          0,
        );

      expect(selectMaterial).not.toThrow();
    });

    test('TC-225-2: EventBus.emit()エラー時にconsole.errorが呼ばれる', () => {
      const mockEventBusWithError = createMockEventBus();
      mockEventBusWithError.emit = vi.fn().mockImplementation(() => {
        throw new Error('EventBus error');
      });
      mockScene.data.get = vi.fn().mockReturnValue(mockEventBusWithError);
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSession(phaseUI, mockGatheringService);

      (phaseUI as unknown as { onMaterialSelected: (index: number) => void }).onMaterialSelected(0);

      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('TC-226: Escapeキーでのキャンセル制限', () => {
    // 【テスト目的】: 素材選択後はEscapeでキャンセルできないこと
    // 【信頼性】: 🔵

    test('TC-226-1: 素材選択後はEscapeキーでキャンセルできない', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSessionWithMaterials(phaseUI, 1, mockGatheringService);

      (
        phaseUI as unknown as { handleKeyboardInput: (event: { key: string }) => void }
      ).handleKeyboardInput({ key: 'Escape' });

      expect(mockEventBus.emit).not.toHaveBeenCalledWith(
        GameEventType.GATHERING_CANCELLED,
        expect.any(Object),
      );
    });
  });

  // ===========================================================================
  // 境界値テストケース
  // ===========================================================================

  describe('TC-231: 0個選択（偵察のみ）', () => {
    // 【テスト目的】: 0個選択時のコスト計算が正しいこと
    // 【信頼性】: 🔵

    test('TC-231-1: 0個選択時の追加コストは0', () => {
      mockGatheringService.endGathering.mockReturnValue(
        createMockGatheringResult({ additionalCost: 0 }),
      );

      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSessionWithMaterials(phaseUI, 0, mockGatheringService);

      const result = (phaseUI as unknown as { onEndGathering: () => GatheringResult }).onEndGathering();

      expect(result.additionalCost).toBe(0);
    });

    test('TC-231-2: 0個選択時の追加日数は0', () => {
      mockGatheringService.endGathering.mockReturnValue(
        createMockGatheringResult({ extraDay: false }),
      );

      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSessionWithMaterials(phaseUI, 0, mockGatheringService);

      const result = (phaseUI as unknown as { onEndGathering: () => GatheringResult }).onEndGathering();

      expect(result.extraDay).toBe(false);
    });

    test('TC-231-3: 0個選択時の警告レベルはnone', () => {
      mockGatheringService.calculateGatheringCost.mockReturnValue({
        baseCost: 2,
        additionalCost: 0,
        totalCost: 2,
        extraDay: false,
        warningLevel: 'none' as WarningLevel,
      });

      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSessionWithMaterials(phaseUI, 0, mockGatheringService);

      const costResult = (
        phaseUI as unknown as { calculateCurrentCost: () => GatheringCostResult }
      ).calculateCurrentCost();

      expect(costResult.warningLevel).toBe('none');
    });
  });

  describe('TC-232: 1〜2個選択', () => {
    // 【テスト目的】: 1〜2個選択時のコスト計算が正しいこと
    // 【信頼性】: 🔵

    test('TC-232-1: 1個選択時の追加コストは1', () => {
      mockGatheringService.calculateGatheringCost.mockReturnValue({
        baseCost: 2,
        additionalCost: 1,
        totalCost: 3,
        extraDay: false,
        warningLevel: 'none' as WarningLevel,
      });

      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSessionWithMaterials(phaseUI, 1, mockGatheringService);

      const costResult = (
        phaseUI as unknown as { calculateCurrentCost: () => GatheringCostResult }
      ).calculateCurrentCost();

      expect(costResult.additionalCost).toBe(1);
    });

    test('TC-232-2: 2個選択時の追加コストは1', () => {
      mockGatheringService.calculateGatheringCost.mockReturnValue({
        baseCost: 2,
        additionalCost: 1,
        totalCost: 3,
        extraDay: false,
        warningLevel: 'none' as WarningLevel,
      });

      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSessionWithMaterials(phaseUI, 2, mockGatheringService);

      const costResult = (
        phaseUI as unknown as { calculateCurrentCost: () => GatheringCostResult }
      ).calculateCurrentCost();

      expect(costResult.additionalCost).toBe(1);
    });
  });

  describe('TC-233: 3〜4個選択', () => {
    // 【テスト目的】: 3〜4個選択時のコスト計算が正しいこと
    // 【信頼性】: 🔵

    test('TC-233-1: 3個選択時の追加コストは2', () => {
      mockGatheringService.calculateGatheringCost.mockReturnValue({
        baseCost: 2,
        additionalCost: 2,
        totalCost: 4,
        extraDay: false,
        warningLevel: 'none' as WarningLevel,
      });

      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSessionWithMaterials(phaseUI, 3, mockGatheringService);

      const costResult = (
        phaseUI as unknown as { calculateCurrentCost: () => GatheringCostResult }
      ).calculateCurrentCost();

      expect(costResult.additionalCost).toBe(2);
    });

    test('TC-233-2: 4個選択時の追加コストは2', () => {
      mockGatheringService.calculateGatheringCost.mockReturnValue({
        baseCost: 2,
        additionalCost: 2,
        totalCost: 4,
        extraDay: false,
        warningLevel: 'none' as WarningLevel,
      });

      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSessionWithMaterials(phaseUI, 4, mockGatheringService);

      const costResult = (
        phaseUI as unknown as { calculateCurrentCost: () => GatheringCostResult }
      ).calculateCurrentCost();

      expect(costResult.additionalCost).toBe(2);
    });
  });

  describe('TC-234: 5〜6個選択（ペナルティなし上限）', () => {
    // 【テスト目的】: 5〜6個選択時のコスト計算が正しいこと
    // 【信頼性】: 🔵

    test('TC-234-1: 5個選択時の追加コストは3', () => {
      mockGatheringService.calculateGatheringCost.mockReturnValue({
        baseCost: 2,
        additionalCost: 3,
        totalCost: 5,
        extraDay: false,
        warningLevel: 'warning' as WarningLevel,
      });

      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSessionWithMaterials(phaseUI, 5, mockGatheringService);

      const costResult = (
        phaseUI as unknown as { calculateCurrentCost: () => GatheringCostResult }
      ).calculateCurrentCost();

      expect(costResult.additionalCost).toBe(3);
    });

    test('TC-234-2: 6個選択時の追加コストは3、追加日数0', () => {
      mockGatheringService.calculateGatheringCost.mockReturnValue({
        baseCost: 2,
        additionalCost: 3,
        totalCost: 5,
        extraDay: false,
        warningLevel: 'warning' as WarningLevel,
      });

      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSessionWithMaterials(phaseUI, 6, mockGatheringService);

      const costResult = (
        phaseUI as unknown as { calculateCurrentCost: () => GatheringCostResult }
      ).calculateCurrentCost();

      expect(costResult.additionalCost).toBe(3);
      expect(costResult.extraDay).toBe(false);
    });

    test('TC-234-3: 5〜6個選択時の警告レベルはwarning', () => {
      mockGatheringService.calculateGatheringCost.mockReturnValue({
        baseCost: 2,
        additionalCost: 3,
        totalCost: 5,
        extraDay: false,
        warningLevel: 'warning' as WarningLevel,
      });

      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSessionWithMaterials(phaseUI, 5, mockGatheringService);

      const costResult = (
        phaseUI as unknown as { calculateCurrentCost: () => GatheringCostResult }
      ).calculateCurrentCost();

      expect(costResult.warningLevel).toBe('warning');
    });
  });

  describe('TC-235: 7個選択（翌日持越しペナルティ）', () => {
    // 【テスト目的】: 7個以上選択時に翌日持越しペナルティが適用されること
    // 【信頼性】: 🔵

    test('TC-235-1: 7個選択時の追加日数は+1', () => {
      mockGatheringService.calculateGatheringCost.mockReturnValue({
        baseCost: 2,
        additionalCost: 3,
        totalCost: 5,
        extraDay: true,
        warningLevel: 'danger' as WarningLevel,
      });

      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSessionWithMaterials(phaseUI, 7, mockGatheringService);

      const costResult = (
        phaseUI as unknown as { calculateCurrentCost: () => GatheringCostResult }
      ).calculateCurrentCost();

      expect(costResult.extraDay).toBe(true);
    });

    test('TC-235-2: 7個選択時の警告レベルはdanger', () => {
      mockGatheringService.calculateGatheringCost.mockReturnValue({
        baseCost: 2,
        additionalCost: 3,
        totalCost: 5,
        extraDay: true,
        warningLevel: 'danger' as WarningLevel,
      });

      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSessionWithMaterials(phaseUI, 7, mockGatheringService);

      const costResult = (
        phaseUI as unknown as { calculateCurrentCost: () => GatheringCostResult }
      ).calculateCurrentCost();

      expect(costResult.warningLevel).toBe('danger');
    });

    test('TC-235-3: 7個選択時に「翌日持越し」警告が表示される', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSessionWithMaterials(phaseUI, 7, mockGatheringService);

      (phaseUI as unknown as { updateCostDisplay: (count: number) => void }).updateCostDisplay(7);

      expect((phaseUI as unknown as { costDisplay: unknown }).costDisplay).toBeDefined();
    });
  });

  describe('TC-236: 最大提示回数（5回）', () => {
    // 【テスト目的】: 最大提示回数（5回）まで正常動作すること
    // 【信頼性】: 🔵

    test('TC-236-1: 5ラウンド全てで素材選択肢が表示される', () => {
      let currentRound = 1;
      const mockSession = createMockDraftSession({ currentRound: 1, maxRounds: 5 });
      mockGatheringService.startDraftGathering.mockReturnValue(mockSession);
      mockGatheringService.selectMaterial.mockImplementation(() => {
        currentRound++;
        mockSession.currentRound = currentRound;
        if (currentRound > 5) {
          mockSession.isComplete = true;
        }
        return createMockMaterialInstance();
      });

      const phaseUI = new GatheringPhaseUI(mockScene);
      (phaseUI as unknown as { gatheringService: unknown }).gatheringService = mockGatheringService;
      const mockCard = createMockGatheringCard({ maxRounds: 5 });

      phaseUI.startGathering(mockCard);

      for (let i = 0; i < 4; i++) {
        expect(
          (phaseUI as unknown as { materialCards: unknown[] }).materialCards.length,
        ).toBe(3);
        (phaseUI as unknown as { onMaterialSelected: (index: number) => void }).onMaterialSelected(0);
      }

      expect(
        (phaseUI as unknown as { materialCards: unknown[] }).materialCards.length,
      ).toBe(3);
    });

    test('TC-236-2: ラウンドインジケーターが1/5から5/5まで正しく更新される', () => {
      let currentRound = 1;
      const mockSession = createMockDraftSession({ currentRound: 1, maxRounds: 5 });
      mockGatheringService.startDraftGathering.mockReturnValue(mockSession);
      mockGatheringService.selectMaterial.mockImplementation(() => {
        currentRound++;
        mockSession.currentRound = Math.min(currentRound, 5);
        if (currentRound > 5) {
          mockSession.isComplete = true;
        }
        return createMockMaterialInstance();
      });

      const phaseUI = new GatheringPhaseUI(mockScene);
      (phaseUI as unknown as { gatheringService: unknown }).gatheringService = mockGatheringService;
      const mockCard = createMockGatheringCard({ maxRounds: 5 });

      phaseUI.startGathering(mockCard);
      expect(
        (phaseUI as unknown as { currentSession: DraftSession }).currentSession.currentRound,
      ).toBe(1);

      for (let i = 1; i < 5; i++) {
        (phaseUI as unknown as { onMaterialSelected: (index: number) => void }).onMaterialSelected(0);
        if (i < 4) {
          expect(
            (phaseUI as unknown as { currentSession: DraftSession }).currentSession.currentRound,
          ).toBe(i + 1);
        }
      }
    });
  });

  describe('TC-237: 行動ポイント不足', () => {
    // 【テスト目的】: 行動ポイント不足時に開始ボタンが非活性になること
    // 【信頼性】: 🔵

    test('TC-237-1: 行動ポイント不足時に開始ボタンが非活性になる', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      const mockCard = createMockGatheringCard({ baseCost: 5 });

      (phaseUI as unknown as { currentActionPoints: number }).currentActionPoints = 2;
      phaseUI.showLocationDetail(mockCard);

      expect(
        (phaseUI as unknown as { startButton: { isEnabled: () => boolean } }).startButton.isEnabled(),
      ).toBe(false);
    });
  });

  // ===========================================================================
  // 統合テストケース
  // ===========================================================================

  describe('TC-241: 完全な採取フロー', () => {
    // 【テスト目的】: 開始→選択→終了の完全なフローが動作すること
    // 【信頼性】: 🔵

    test('TC-241-1: 完全なフロー: 開始→選択→選択→スキップ→終了', () => {
      let currentRound = 1;
      const selectedMaterials: MaterialInstance[] = [];
      const mockSession = createMockDraftSession({
        currentRound: 1,
        maxRounds: 3,
        selectedMaterials,
      });

      mockGatheringService.startDraftGathering.mockReturnValue(mockSession);
      mockGatheringService.selectMaterial.mockImplementation(() => {
        currentRound++;
        mockSession.currentRound = currentRound;
        const material = createMockMaterialInstance();
        selectedMaterials.push(material);
        if (currentRound > 3) {
          mockSession.isComplete = true;
        }
        return material;
      });
      mockGatheringService.skipSelection.mockImplementation(() => {
        currentRound++;
        mockSession.currentRound = currentRound;
        if (currentRound > 3) {
          mockSession.isComplete = true;
        }
      });

      const phaseUI = new GatheringPhaseUI(mockScene);
      (phaseUI as unknown as { gatheringService: unknown }).gatheringService = mockGatheringService;
      const mockCard = createMockGatheringCard({ maxRounds: 3 });

      // セッション開始
      phaseUI.startGathering(mockCard);
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        GameEventType.GATHERING_STARTED,
        expect.any(Object),
      );

      // ラウンド1: 素材選択
      (phaseUI as unknown as { onMaterialSelected: (index: number) => void }).onMaterialSelected(0);
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        GameEventType.MATERIAL_SELECTED,
        expect.any(Object),
      );

      // ラウンド2: 素材選択
      (phaseUI as unknown as { onMaterialSelected: (index: number) => void }).onMaterialSelected(1);

      // ラウンド3: スキップ
      (phaseUI as unknown as { onSkipRound: () => void }).onSkipRound();
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        GameEventType.ROUND_SKIPPED,
        expect.any(Object),
      );

      // 終了
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        GameEventType.GATHERING_COMPLETED,
        expect.objectContaining({
          materials: expect.any(Array),
          totalCost: expect.any(Number),
        }),
      );
    });
  });

  describe('TC-242: 途中終了フロー', () => {
    // 【テスト目的】: 全ラウンド完了前に終了できること
    // 【信頼性】: 🔵

    test('TC-242-1: ラウンド2/5で手動終了できる', () => {
      let currentRound = 1;
      const mockSession = createMockDraftSession({ currentRound: 1, maxRounds: 5 });
      mockGatheringService.startDraftGathering.mockReturnValue(mockSession);
      mockGatheringService.selectMaterial.mockImplementation(() => {
        currentRound++;
        mockSession.currentRound = currentRound;
        return createMockMaterialInstance();
      });

      const phaseUI = new GatheringPhaseUI(mockScene);
      (phaseUI as unknown as { gatheringService: unknown }).gatheringService = mockGatheringService;
      const mockCard = createMockGatheringCard({ maxRounds: 5 });

      phaseUI.startGathering(mockCard);
      (phaseUI as unknown as { onMaterialSelected: (index: number) => void }).onMaterialSelected(0);
      (phaseUI as unknown as { onEndGathering: () => unknown }).onEndGathering();

      expect(mockGatheringService.endGathering).toHaveBeenCalled();
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        GameEventType.GATHERING_COMPLETED,
        expect.any(Object),
      );
    });
  });

  describe('TC-243: 偵察のみフロー', () => {
    // 【テスト目的】: 0個選択（偵察のみ）で終了できること
    // 【信頼性】: 🔵

    test('TC-243-1: 全ラウンドスキップで偵察のみ終了', () => {
      let currentRound = 1;
      const mockSession = createMockDraftSession({
        currentRound: 1,
        maxRounds: 3,
        selectedMaterials: [],
      });

      mockGatheringService.startDraftGathering.mockReturnValue(mockSession);
      mockGatheringService.skipSelection.mockImplementation(() => {
        currentRound++;
        mockSession.currentRound = currentRound;
        if (currentRound > 3) {
          mockSession.isComplete = true;
        }
      });
      mockGatheringService.endGathering.mockReturnValue(
        createMockGatheringResult({
          materials: [],
          totalCost: 2,
          extraDay: false,
        }),
      );

      const phaseUI = new GatheringPhaseUI(mockScene);
      (phaseUI as unknown as { gatheringService: unknown }).gatheringService = mockGatheringService;
      const mockCard = createMockGatheringCard({ maxRounds: 3 });

      phaseUI.startGathering(mockCard);
      (phaseUI as unknown as { onSkipRound: () => void }).onSkipRound();
      (phaseUI as unknown as { onSkipRound: () => void }).onSkipRound();
      (phaseUI as unknown as { onSkipRound: () => void }).onSkipRound();

      expect(
        (phaseUI as unknown as { currentSession: DraftSession }).currentSession.selectedMaterials
          .length,
      ).toBe(0);
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        GameEventType.GATHERING_COMPLETED,
        expect.objectContaining({
          materials: [],
          totalCost: expect.any(Number),
          extraDay: false,
        }),
      );
    });
  });

  describe('TC-244: 最大選択フロー', () => {
    // 【テスト目的】: 7個以上選択時のペナルティ適用を確認
    // 【信頼性】: 🔵

    test('TC-244-1: 7個選択で翌日持越しペナルティが適用される', () => {
      let currentRound = 1;
      const selectedMaterials: MaterialInstance[] = [];
      const mockSession = createMockDraftSession({
        currentRound: 1,
        maxRounds: 7,
        selectedMaterials,
      });

      mockGatheringService.startDraftGathering.mockReturnValue(mockSession);
      mockGatheringService.selectMaterial.mockImplementation(() => {
        currentRound++;
        mockSession.currentRound = currentRound;
        const material = createMockMaterialInstance();
        selectedMaterials.push(material);
        if (currentRound > 7) {
          mockSession.isComplete = true;
        }
        return material;
      });
      mockGatheringService.endGathering.mockReturnValue(
        createMockGatheringResult({
          extraDay: true,
        }),
      );

      const phaseUI = new GatheringPhaseUI(mockScene);
      (phaseUI as unknown as { gatheringService: unknown }).gatheringService = mockGatheringService;
      const mockCard = createMockGatheringCard({ maxRounds: 7 });

      phaseUI.startGathering(mockCard);
      for (let i = 0; i < 7; i++) {
        (phaseUI as unknown as { onMaterialSelected: (index: number) => void }).onMaterialSelected(0);
      }

      expect(mockEventBus.emit).toHaveBeenCalledWith(
        GameEventType.GATHERING_COMPLETED,
        expect.objectContaining({
          extraDay: true,
        }),
      );
    });
  });

  describe('TC-245: キーボード操作のみでの完全フロー', () => {
    // 【テスト目的】: キーボードのみで採取を完了できること
    // 【信頼性】: 🔵

    test('TC-245-1: キーボード操作のみで採取を完了できる', () => {
      let currentRound = 1;
      const selectedMaterials: MaterialInstance[] = [];
      const mockSession = createMockDraftSession({
        currentRound: 1,
        maxRounds: 3,
        selectedMaterials,
      });

      mockGatheringService.startDraftGathering.mockReturnValue(mockSession);
      mockGatheringService.selectMaterial.mockImplementation(() => {
        currentRound++;
        mockSession.currentRound = currentRound;
        const material = createMockMaterialInstance();
        selectedMaterials.push(material);
        return material;
      });
      mockGatheringService.skipSelection.mockImplementation(() => {
        currentRound++;
        mockSession.currentRound = currentRound;
      });

      const phaseUI = new GatheringPhaseUI(mockScene);
      (phaseUI as unknown as { gatheringService: unknown }).gatheringService = mockGatheringService;
      const mockCard = createMockGatheringCard({ maxRounds: 3 });

      // 採取地詳細表示後、Enterで開始
      phaseUI.showLocationDetail(mockCard);
      (
        phaseUI as unknown as { handleKeyboardInput: (event: { key: string }) => void }
      ).handleKeyboardInput({ key: 'Enter' });

      // 1キーで選択
      (
        phaseUI as unknown as { handleKeyboardInput: (event: { key: string }) => void }
      ).handleKeyboardInput({ key: '1' });

      // 2キーで選択
      (
        phaseUI as unknown as { handleKeyboardInput: (event: { key: string }) => void }
      ).handleKeyboardInput({ key: '2' });

      // Sキーでスキップ
      (
        phaseUI as unknown as { handleKeyboardInput: (event: { key: string }) => void }
      ).handleKeyboardInput({ key: 'S' });

      // Eキーで終了
      (
        phaseUI as unknown as { handleKeyboardInput: (event: { key: string }) => void }
      ).handleKeyboardInput({ key: 'E' });

      expect(mockGatheringService.endGathering).toHaveBeenCalled();
    });
  });

  describe('TC-246: UIコンポーネント連携', () => {
    // 【テスト目的】: MaterialCardUIとの連携が正しく動作すること
    // 【信頼性】: 🟡

    test('TC-246-1: MaterialCardUIが正しいデータで作成される', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      (phaseUI as unknown as { gatheringService: unknown }).gatheringService = mockGatheringService;
      const mockCard = createMockGatheringCard();

      phaseUI.startGathering(mockCard);

      const materialCards = (phaseUI as unknown as { materialCards: { material: MaterialOption }[] })
        .materialCards;
      expect(materialCards[0].material.name).toBeDefined();
      expect(materialCards[0].material.quality).toBeDefined();
    });
  });

  describe('TC-247: 状態遷移の検証', () => {
    // 【テスト目的】: 状態遷移が正しく行われること
    // 【信頼性】: 🟡

    test('TC-247-1: 状態遷移: MaterialPresent → MaterialSelect → SessionEnd', () => {
      const mockSession = createMockDraftSession({ currentRound: 1, maxRounds: 1 });
      mockGatheringService.startDraftGathering.mockReturnValue(mockSession);
      mockGatheringService.selectMaterial.mockImplementation(() => {
        mockSession.isComplete = true;
        return createMockMaterialInstance();
      });

      const phaseUI = new GatheringPhaseUI(mockScene);
      (phaseUI as unknown as { gatheringService: unknown }).gatheringService = mockGatheringService;
      const mockCard = createMockGatheringCard({ maxRounds: 1 });

      phaseUI.startGathering(mockCard);
      expect((phaseUI as unknown as { currentState: string }).currentState).toBe('MaterialSelect');

      (phaseUI as unknown as { onMaterialSelected: (index: number) => void }).onMaterialSelected(0);
      expect((phaseUI as unknown as { currentState: string }).currentState).toBe('SessionEnd');
    });
  });

  describe('TC-248: イベント購読の検証', () => {
    // 【テスト目的】: 外部イベントの購読が正しく行われること
    // 【信頼性】: 🟡

    test('TC-248-1: ACTION_POINTS_CHANGEDイベントを購読する', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);

      expect(mockEventBus.on).toHaveBeenCalledWith(
        GameEventType.ACTION_POINTS_CHANGED,
        expect.any(Function),
      );
    });
  });

  describe('TC-249: 採取地詳細表示', () => {
    // 【テスト目的】: 採取地詳細が正しく表示されること
    // 【信頼性】: 🔵

    test('TC-249-1: 採取地詳細パネルが表示される', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      const mockCard = createMockGatheringCard({
        name: '深緑の森',
        baseCost: 2,
        maxRounds: 5,
      });

      phaseUI.showLocationDetail(mockCard);

      expect(
        (phaseUI as unknown as { locationDetailPanel: { isVisible: () => boolean } })
          .locationDetailPanel,
      ).toBeDefined();
      expect(
        (phaseUI as unknown as { locationDetailPanel: { isVisible: () => boolean } })
          .locationDetailPanel.isVisible(),
      ).toBe(true);
    });

    test('TC-249-2: 採取地名、基本コスト、提示回数が表示される', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      const mockCard = createMockGatheringCard({
        name: '深緑の森',
        baseCost: 2,
        maxRounds: 5,
      });

      phaseUI.showLocationDetail(mockCard);

      const displayText = (
        phaseUI as unknown as { getLocationDetailText: () => string }
      ).getLocationDetailText();
      expect(displayText).toContain('深緑の森');
      expect(displayText).toContain('2');
      expect(displayText).toContain('5');
    });
  });

  describe('TC-250: 採取完了画面', () => {
    // 【テスト目的】: 採取完了画面が正しく表示されること
    // 【信頼性】: 🔵

    test('TC-250-1: 採取完了後に結果画面が表示される', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSessionWithMaterials(phaseUI, 3, mockGatheringService);

      (phaseUI as unknown as { onEndGathering: () => unknown }).onEndGathering();

      expect(
        (phaseUI as unknown as { resultPanel: { isVisible: () => boolean } }).resultPanel,
      ).toBeDefined();
      expect(
        (phaseUI as unknown as { resultPanel: { isVisible: () => boolean } }).resultPanel.isVisible(),
      ).toBe(true);
    });

    test('TC-250-2: 獲得素材一覧が結果画面に表示される', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSessionWithMaterials(phaseUI, 3, mockGatheringService);

      (phaseUI as unknown as { onEndGathering: () => unknown }).onEndGathering();

      const resultText = (
        phaseUI as unknown as { getResultDisplayText: () => string }
      ).getResultDisplayText();
      expect(resultText).toContain('獲得素材');
    });

    test('TC-250-3: 消費コスト詳細が結果画面に表示される', () => {
      const phaseUI = new GatheringPhaseUI(mockScene);
      setupActiveSessionWithMaterials(phaseUI, 3, mockGatheringService);

      (phaseUI as unknown as { onEndGathering: () => unknown }).onEndGathering();

      const resultText = (
        phaseUI as unknown as { getResultDisplayText: () => string }
      ).getResultDisplayText();
      expect(resultText).toContain('コスト');
    });
  });
});
