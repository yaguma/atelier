/**
 * RankUpScene ユニットテスト
 * TASK-0051 RankUpScene実装
 *
 * @description
 * 昇格試験画面のテストケース
 *
 * テストカテゴリ:
 * - 正常系: シーン初期化、ランク情報表示、試験処理
 * - 異常系: サービス未初期化
 * - シーン遷移: MainSceneへの戻り
 */

import type {
  IRankService,
  PromotionResult,
  PromotionTest,
} from '@domain/interfaces/rank-service.interface';
import type { IEventBus } from '@shared/services/event-bus';
import type { IStateManager } from '@shared/services/state-manager';
import { GuildRank } from '@shared/types/common';
import type { IGuildRankMaster } from '@shared/types/master-data';
import {
  createMockDIContainer,
  createMockEventBus,
  createMockScene,
  createMockStateManager,
  type MockEventBusWithListeners,
} from '@test-mocks/phaser-mocks';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// =============================================================================
// モック定義
// =============================================================================

/**
 * Phaserモック
 */
vi.mock('phaser', () => {
  return {
    default: {
      Scene: class MockScene {},
      GameObjects: {
        Container: class MockContainer {},
        Text: class MockText {},
        Graphics: class MockGraphics {},
      },
    },
  };
});

// DIコンテナのモックインスタンス（型安全）
let mockStateManagerInstance: Partial<IStateManager>;
let mockRankServiceInstance: IRankService;
let mockEventBusInstance: MockEventBusWithListeners;

let mockContainerInstance: ReturnType<typeof createMockDIContainer>;

vi.mock('@shared/services/di/container', () => ({
  Container: {
    getInstance: vi.fn(() => mockContainerInstance),
  },
  ServiceKeys: {
    StateManager: 'StateManager',
    RankService: 'RankService',
    EventBus: 'EventBus',
  },
}));

/**
 * RankServiceモックを作成
 */
const createMockRankService = (): IRankService => ({
  getCurrentRank: vi.fn().mockReturnValue(GuildRank.E),
  getNextRank: vi.fn().mockReturnValue(GuildRank.D),
  getPromotionGauge: vi.fn().mockReturnValue(100),
  getAccumulatedContribution: vi.fn().mockReturnValue(1000),
  getRemainingContribution: vi.fn().mockReturnValue(0),
  canPromote: vi.fn().mockReturnValue(true),
  addContribution: vi.fn(),
  setRank: vi.fn(),
  promote: vi.fn().mockReturnValue({
    previousRank: GuildRank.E,
    newRank: GuildRank.D,
    bonusReward: 300,
  } as PromotionResult),
  isInPromotionTest: vi.fn().mockReturnValue(false),
  startPromotionTest: vi.fn().mockReturnValue({
    targetRank: GuildRank.D,
    requirements: [{ itemId: 'potion', quantity: 3, minQuality: 'C' }],
    remainingDays: 5,
    completedRequirements: [],
  } as PromotionTest),
  getCurrentPromotionTest: vi.fn().mockReturnValue(null),
  completePromotionTestRequirement: vi.fn(),
  completePromotionTest: vi.fn().mockReturnValue({
    previousRank: GuildRank.E,
    newRank: GuildRank.D,
    bonusReward: 300,
  } as PromotionResult),
  decrementPromotionTestDays: vi.fn().mockReturnValue(false),
  getRankRequirements: vi.fn().mockReturnValue({
    id: 'rank-e',
    rank: GuildRank.E,
    requiredContribution: 1000,
    promotionTest: {
      requirements: [{ itemId: 'potion', quantity: 3, minQuality: 'C' }],
      dayLimit: 5,
    },
    specialRules: [],
  } as IGuildRankMaster),
});

// EventBusモックは共通モック（@test-mocks/phaser-mocks）のcreateMockEventBusを使用

// =============================================================================
// テストスイート
// =============================================================================

describe('RankUpScene', () => {
  beforeEach(() => {
    mockStateManagerInstance = createMockStateManager({ promotionGauge: 100 });
    mockRankServiceInstance = createMockRankService();
    mockEventBusInstance = createMockEventBus();
    mockContainerInstance = createMockDIContainer({
      StateManager: mockStateManagerInstance,
      RankService: mockRankServiceInstance,
      EventBus: mockEventBusInstance,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // 基本テスト - create()
  // ===========================================================================

  describe('create()', () => {
    it('TC-0051-001: シーンが正しく初期化されること', async () => {
      // 【テスト目的】: RankUpScene生成時にレイアウトコンポーネントが正しく作成されることを確認
      // 【対応要件】: REQ-051-01
      // 🔵 信頼性レベル: TASK-0051.md セクション2に明記

      const { RankUpScene } = await import('@presentation/scenes/RankUpScene');
      const { scene: mockScene } = createMockScene();

      const rankUpScene = new RankUpScene();

      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.add = mockScene.add;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.cameras = mockScene.cameras;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.rexUI = mockScene.rexUI;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.scene = mockScene.scene;

      rankUpScene.create();

      // シーンが初期化されていることを確認
      expect(mockScene.add.graphics).toHaveBeenCalled();
    });

    it('TC-0051-002: 現在のランクが表示されること', async () => {
      // 【テスト目的】: RankUpSceneで現在のランクが正しく表示されることを確認
      // 【対応要件】: REQ-051-02
      // 🔵 信頼性レベル: TASK-0051.md セクション2に明記

      const { RankUpScene } = await import('@presentation/scenes/RankUpScene');
      const { scene: mockScene } = createMockScene();

      const rankUpScene = new RankUpScene();

      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.add = mockScene.add;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.cameras = mockScene.cameras;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.rexUI = mockScene.rexUI;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.scene = mockScene.scene;

      rankUpScene.create();

      // getCurrentRankが呼ばれていることを確認
      expect(mockRankServiceInstance.getCurrentRank).toHaveBeenCalled();
    });

    it('TC-0051-003: 次のランクが表示されること', async () => {
      // 【テスト目的】: RankUpSceneで次のランクが正しく表示されることを確認
      // 【対応要件】: REQ-051-02
      // 🔵 信頼性レベル: TASK-0051.md セクション2に明記

      const { RankUpScene } = await import('@presentation/scenes/RankUpScene');
      const { scene: mockScene } = createMockScene();

      const rankUpScene = new RankUpScene();

      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.add = mockScene.add;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.cameras = mockScene.cameras;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.rexUI = mockScene.rexUI;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.scene = mockScene.scene;

      rankUpScene.create();

      // getNextRankが呼ばれていることを確認
      expect(mockRankServiceInstance.getNextRank).toHaveBeenCalled();
    });

    it('TC-0051-004: 昇格条件が表示されること', async () => {
      // 【テスト目的】: RankUpSceneで昇格条件が表示されることを確認
      // 【対応要件】: REQ-051-03
      // 🔵 信頼性レベル: TASK-0051.md セクション2に明記

      const { RankUpScene } = await import('@presentation/scenes/RankUpScene');
      const { scene: mockScene } = createMockScene();

      const rankUpScene = new RankUpScene();

      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.add = mockScene.add;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.cameras = mockScene.cameras;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.rexUI = mockScene.rexUI;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.scene = mockScene.scene;

      rankUpScene.create();

      // getRankRequirementsが呼ばれていることを確認
      expect(mockRankServiceInstance.getRankRequirements).toHaveBeenCalled();
    });

    it('TC-0051-005: 試験開始ボタンが表示されること', async () => {
      // 【テスト目的】: RankUpSceneで試験開始ボタンが表示されることを確認
      // 【対応要件】: REQ-051-04
      // 🔵 信頼性レベル: TASK-0051.md セクション2に明記

      const { RankUpScene } = await import('@presentation/scenes/RankUpScene');
      const { scene: mockScene } = createMockScene();

      const rankUpScene = new RankUpScene();

      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.add = mockScene.add;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.cameras = mockScene.cameras;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.rexUI = mockScene.rexUI;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.scene = mockScene.scene;

      rankUpScene.create();

      // 試験開始ボタンが生成されていることを確認
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      expect(rankUpScene.startTestButton).toBeDefined();
    });
  });

  // ===========================================================================
  // 昇格試験テスト
  // ===========================================================================

  describe('昇格試験', () => {
    it('TC-0051-006: 試験開始ボタンクリックで試験が開始されること', async () => {
      // 【テスト目的】: 試験開始ボタンクリック時にRankService.startPromotionTest()が呼ばれることを確認
      // 【対応要件】: REQ-051-04
      // 🔵 信頼性レベル: TASK-0051.md セクション2に明記

      const { RankUpScene } = await import('@presentation/scenes/RankUpScene');
      const { scene: mockScene } = createMockScene();

      const rankUpScene = new RankUpScene();

      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.add = mockScene.add;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.cameras = mockScene.cameras;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.rexUI = mockScene.rexUI;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.scene = mockScene.scene;

      rankUpScene.create();

      // 試験開始処理を実行
      // @ts-expect-error - テストのためにprivateメソッドにアクセス
      rankUpScene.onStartTestClick();

      // startPromotionTest()が呼ばれていることを確認
      expect(mockRankServiceInstance.startPromotionTest).toHaveBeenCalled();
    });

    it('TC-0051-007: 合格条件を満たした場合に合格判定されること', async () => {
      // 【テスト目的】: 合格条件を満たした場合にcompletePromotionTest(true)が呼ばれることを確認
      // 【対応要件】: REQ-051-05
      // 🔵 信頼性レベル: TASK-0051.md セクション2に明記

      const { RankUpScene } = await import('@presentation/scenes/RankUpScene');
      const { scene: mockScene } = createMockScene();

      const rankUpScene = new RankUpScene();

      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.add = mockScene.add;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.cameras = mockScene.cameras;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.rexUI = mockScene.rexUI;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.scene = mockScene.scene;

      rankUpScene.create();

      // 合格処理を実行
      // @ts-expect-error - テストのためにprivateメソッドにアクセス
      rankUpScene.handleTestResult(true);

      // completePromotionTest(true)が呼ばれていることを確認
      expect(mockRankServiceInstance.completePromotionTest).toHaveBeenCalledWith(true);
    });

    it('TC-0051-008: 合格条件を満たさない場合に不合格判定されること', async () => {
      // 【テスト目的】: 不合格時にcompletePromotionTest(false)が呼ばれることを確認
      // 【対応要件】: REQ-051-05
      // 🔵 信頼性レベル: TASK-0051.md セクション2に明記

      // completePromotionTest(false)はnullを返す
      mockRankServiceInstance.completePromotionTest = vi.fn().mockReturnValue(null);

      const { RankUpScene } = await import('@presentation/scenes/RankUpScene');
      const { scene: mockScene } = createMockScene();

      const rankUpScene = new RankUpScene();

      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.add = mockScene.add;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.cameras = mockScene.cameras;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.rexUI = mockScene.rexUI;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.scene = mockScene.scene;

      rankUpScene.create();

      // 不合格処理を実行
      // @ts-expect-error - テストのためにprivateメソッドにアクセス
      rankUpScene.handleTestResult(false);

      // completePromotionTest(false)が呼ばれていることを確認
      expect(mockRankServiceInstance.completePromotionTest).toHaveBeenCalledWith(false);
    });

    it('TC-0051-009: 合格時にランクが更新されること', async () => {
      // 【テスト目的】: 合格時にランクがEからDに更新されることを確認
      // 【対応要件】: REQ-051-06
      // 🔵 信頼性レベル: TASK-0051.md セクション2に明記

      const { RankUpScene } = await import('@presentation/scenes/RankUpScene');
      const { scene: mockScene } = createMockScene();

      const rankUpScene = new RankUpScene();

      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.add = mockScene.add;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.cameras = mockScene.cameras;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.rexUI = mockScene.rexUI;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.scene = mockScene.scene;

      rankUpScene.create();

      // 合格処理を実行
      // @ts-expect-error - テストのためにprivateメソッドにアクセス
      const result = rankUpScene.handleTestResult(true);

      // 結果を確認
      expect(result?.newRank).toBe(GuildRank.D);
    });

    it('TC-0051-010: 合格時にRANK_UPイベントが発火すること', async () => {
      // 【テスト目的】: 合格時にEventBusでRANK_UPイベントが発火することを確認
      // 【対応要件】: REQ-051-08
      // 🟡 信頼性レベル: TASK-0051.md セクション2に明記（推奨）

      const { RankUpScene } = await import('@presentation/scenes/RankUpScene');
      const { scene: mockScene } = createMockScene();

      const rankUpScene = new RankUpScene();

      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.add = mockScene.add;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.cameras = mockScene.cameras;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.rexUI = mockScene.rexUI;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.scene = mockScene.scene;

      rankUpScene.create();

      // 合格処理を実行
      // @ts-expect-error - テストのためにprivateメソッドにアクセス
      rankUpScene.handleTestResult(true);

      // RANK_UPイベントが発火していることを確認
      expect(mockEventBusInstance.emit).toHaveBeenCalledWith(
        'RANK_UP',
        expect.objectContaining({
          previousRank: GuildRank.E,
          newRank: GuildRank.D,
        }),
      );
    });
  });

  // ===========================================================================
  // シーン遷移テスト
  // ===========================================================================

  describe('シーン遷移', () => {
    it('TC-0051-011: 合格後「次へ」ボタンクリックでMainSceneに戻ること', async () => {
      // 【テスト目的】: 合格後に次へボタンクリックでMainSceneに遷移することを確認
      // 【対応要件】: REQ-051-07
      // 🔵 信頼性レベル: TASK-0051.md セクション2に明記

      const { RankUpScene } = await import('@presentation/scenes/RankUpScene');
      const { scene: mockScene } = createMockScene();

      const rankUpScene = new RankUpScene();

      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.add = mockScene.add;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.cameras = mockScene.cameras;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.rexUI = mockScene.rexUI;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.scene = mockScene.scene;

      rankUpScene.create();

      // 「次へ」ボタンクリック処理を実行
      // @ts-expect-error - テストのためにprivateメソッドにアクセス
      rankUpScene.onNextButtonClick();

      // MainSceneへの遷移を確認（フェードアウト後）
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(mockScene.scene.start).toHaveBeenCalledWith('MainScene');
    });

    it('TC-0051-012: 不合格後「戻る」ボタンクリックでMainSceneに戻ること', async () => {
      // 【テスト目的】: 不合格後に戻るボタンクリックでMainSceneに遷移することを確認
      // 【対応要件】: REQ-051-07
      // 🔵 信頼性レベル: TASK-0051.md セクション2に明記

      const { RankUpScene } = await import('@presentation/scenes/RankUpScene');
      const { scene: mockScene } = createMockScene();

      const rankUpScene = new RankUpScene();

      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.add = mockScene.add;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.cameras = mockScene.cameras;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.rexUI = mockScene.rexUI;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.scene = mockScene.scene;

      rankUpScene.create();

      // 「戻る」ボタンクリック処理を実行
      // @ts-expect-error - テストのためにprivateメソッドにアクセス
      rankUpScene.onBackButtonClick();

      // MainSceneへの遷移を確認（フェードアウト後）
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(mockScene.scene.start).toHaveBeenCalledWith('MainScene');
    });
  });

  // ===========================================================================
  // エラーハンドリングテスト
  // ===========================================================================

  describe('Error Handling', () => {
    it('TC-0051-E01: StateManager未初期化時にエラー処理される', async () => {
      // 【テスト目的】: StateManager未初期化時のエラーハンドリングを確認
      // 【対応要件】: REQ-051-01（異常系）

      const { RankUpScene } = await import('@presentation/scenes/RankUpScene');
      const { scene: mockScene } = createMockScene();

      // StateManagerがundefinedを返すDIコンテナに差し替え
      const savedContainer = mockContainerInstance;
      mockContainerInstance = createMockDIContainer({
        StateManager: undefined,
        RankService: mockRankServiceInstance,
        EventBus: mockEventBusInstance,
      });

      try {
        const rankUpScene = new RankUpScene();
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        rankUpScene.add = mockScene.add;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        rankUpScene.cameras = mockScene.cameras;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        rankUpScene.rexUI = mockScene.rexUI;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        rankUpScene.scene = mockScene.scene;

        expect(() => rankUpScene.create()).toThrow('StateManager is required');
      } finally {
        mockContainerInstance = savedContainer;
      }
    });

    it('TC-0051-E02: RankService未初期化時にエラー処理される', async () => {
      // 【テスト目的】: RankService未初期化時のエラーハンドリングを確認
      // 【対応要件】: REQ-051-01（異常系）

      const { RankUpScene } = await import('@presentation/scenes/RankUpScene');
      const { scene: mockScene } = createMockScene();

      // RankServiceがundefinedを返すDIコンテナに差し替え
      const savedContainer = mockContainerInstance;
      mockContainerInstance = createMockDIContainer({
        StateManager: mockStateManagerInstance,
        RankService: undefined,
        EventBus: mockEventBusInstance,
      });

      try {
        const rankUpScene = new RankUpScene();
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        rankUpScene.add = mockScene.add;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        rankUpScene.cameras = mockScene.cameras;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        rankUpScene.rexUI = mockScene.rexUI;
        // @ts-expect-error - テストのためにprivateプロパティにアクセス
        rankUpScene.scene = mockScene.scene;

        expect(() => rankUpScene.create()).toThrow('RankService is required');
      } finally {
        mockContainerInstance = savedContainer;
      }
    });

    it('TC-0051-E03: 最高ランク時に昇格不可であること', async () => {
      // 【テスト目的】: Sランク時に昇格ボタンが無効化されることを確認
      // 【対応要件】: REQ-051-02（境界条件）

      // 最高ランク設定
      mockRankServiceInstance.getCurrentRank = vi.fn().mockReturnValue(GuildRank.S);
      mockRankServiceInstance.getNextRank = vi.fn().mockReturnValue(null);
      mockRankServiceInstance.canPromote = vi.fn().mockReturnValue(false);

      const { RankUpScene } = await import('@presentation/scenes/RankUpScene');
      const { scene: mockScene } = createMockScene();

      const rankUpScene = new RankUpScene();

      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.add = mockScene.add;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.cameras = mockScene.cameras;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.rexUI = mockScene.rexUI;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.scene = mockScene.scene;

      rankUpScene.create();

      // canPromote()がfalseを返すことを確認
      expect(mockRankServiceInstance.canPromote()).toBe(false);
    });
  });

  // ===========================================================================
  // 公開メソッドテスト
  // ===========================================================================

  describe('公開メソッド', () => {
    it('TC-0051-013: getCurrentRankDisplay()が現在ランクを返すこと', async () => {
      // 【テスト目的】: 現在ランク表示用メソッドが正しく動作することを確認

      const { RankUpScene } = await import('@presentation/scenes/RankUpScene');
      const { scene: mockScene } = createMockScene();

      const rankUpScene = new RankUpScene();

      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.add = mockScene.add;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.cameras = mockScene.cameras;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.rexUI = mockScene.rexUI;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.scene = mockScene.scene;

      rankUpScene.create();

      // 現在ランク表示を確認
      const currentRank = rankUpScene.getCurrentRankDisplay();
      expect(currentRank).toBe('E');
    });

    it('TC-0051-014: getNextRankDisplay()が次ランクを返すこと', async () => {
      // 【テスト目的】: 次ランク表示用メソッドが正しく動作することを確認

      const { RankUpScene } = await import('@presentation/scenes/RankUpScene');
      const { scene: mockScene } = createMockScene();

      const rankUpScene = new RankUpScene();

      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.add = mockScene.add;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.cameras = mockScene.cameras;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.rexUI = mockScene.rexUI;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.scene = mockScene.scene;

      rankUpScene.create();

      // 次ランク表示を確認
      const nextRank = rankUpScene.getNextRankDisplay();
      expect(nextRank).toBe('D');
    });

    it('TC-0051-015: canStartTest()が昇格可能かを返すこと', async () => {
      // 【テスト目的】: 昇格可能判定メソッドが正しく動作することを確認

      const { RankUpScene } = await import('@presentation/scenes/RankUpScene');
      const { scene: mockScene } = createMockScene();

      const rankUpScene = new RankUpScene();

      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.add = mockScene.add;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.cameras = mockScene.cameras;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.rexUI = mockScene.rexUI;
      // @ts-expect-error - テストのためにprivateプロパティにアクセス
      rankUpScene.scene = mockScene.scene;

      rankUpScene.create();

      // 昇格可能かを確認
      const canStart = rankUpScene.canStartTest();
      expect(canStart).toBe(true);
    });
  });
});
