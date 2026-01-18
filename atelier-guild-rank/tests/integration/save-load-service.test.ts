/**
 * save-load-service.test.ts - SaveLoadService統合テスト
 *
 * TASK-0029: セーブ/ロード機能統合
 * TDD Red Phase: 失敗するテストを実装
 *
 * テスト対象:
 * - save(): セーブ実行
 * - load(): ロード実行
 * - hasSaveData(): セーブデータ存在確認
 * - deleteSaveData(): セーブデータ削除
 * - バージョン互換性チェック
 */

import type { IEventBus } from '@application/events/event-bus.interface';
import { SaveLoadService } from '@application/services/save-load-service';
import type { IStateManager } from '@application/services/state-manager.interface';
import type { IDeckService } from '@domain/interfaces/deck-service.interface';
import type { IInventoryService } from '@domain/interfaces/inventory-service.interface';
import type { IQuestService } from '@domain/interfaces/quest-service.interface';
import type { ISaveDataRepository } from '@domain/interfaces/save-data-repository.interface';
import type { IGameState, ISaveData } from '@shared/types';
import { ApplicationError, ErrorCodes, GameEventType } from '@shared/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// =============================================================================
// モック定義
// =============================================================================

/**
 * ISaveDataRepositoryモック作成
 */
const createMockSaveRepo = (): ISaveDataRepository => ({
  save: vi.fn().mockResolvedValue(undefined),
  load: vi.fn().mockResolvedValue(null),
  exists: vi.fn().mockReturnValue(false),
  delete: vi.fn().mockResolvedValue(undefined),
  getLastSavedTime: vi.fn().mockReturnValue(null),
});

/**
 * IStateManagerモック作成
 */
const createMockStateManager = (): Partial<IStateManager> => ({
  getState: vi.fn().mockReturnValue({
    currentRank: 'G',
    rankHp: 3,
    promotionGauge: 35,
    remainingDays: 28,
    currentDay: 3,
    currentPhase: 'GATHERING',
    gold: 150,
    comboCount: 2,
    actionPoints: 2,
    isPromotionTest: false,
    promotionTestRemainingDays: undefined,
  } as IGameState),
  loadFromSaveData: vi.fn(),
});

/**
 * IDeckServiceモック作成
 */
const createMockDeckService = (): Partial<IDeckService> => ({
  getDeck: vi.fn().mockReturnValue([{ id: 'card_001' }, { id: 'card_002' }]),
  getHand: vi.fn().mockReturnValue([{ id: 'card_003' }]),
  getDiscard: vi.fn().mockReturnValue([]),
  // loadFromSaveDataは既存インターフェースにないため、拡張が必要
});

/**
 * IInventoryServiceモック作成
 */
const createMockInventoryService = (): Partial<IInventoryService> => ({
  getMaterials: vi.fn().mockReturnValue([]),
  getItems: vi.fn().mockReturnValue([]),
  getArtifacts: vi.fn().mockReturnValue([]),
  getMaterialCapacity: vi.fn().mockReturnValue(20),
  // loadFromSaveDataは既存インターフェースにないため、拡張が必要
});

/**
 * IQuestServiceモック作成
 */
const createMockQuestService = (): Partial<IQuestService> => ({
  getActiveQuests: vi.fn().mockReturnValue([]),
  getAvailableQuests: vi.fn().mockReturnValue([]),
  getQuestLimit: vi.fn().mockReturnValue(3),
  // loadFromSaveDataは既存インターフェースにないため、拡張が必要
});

/**
 * IEventBusモック作成
 */
const createMockEventBus = (): Partial<IEventBus> => ({
  emit: vi.fn(),
  on: vi.fn().mockReturnValue(() => {}),
  off: vi.fn(),
});

/**
 * 有効なセーブデータのサンプル作成
 */
const createValidSaveData = (overrides?: Partial<ISaveData>): ISaveData => ({
  version: '1.0.0',
  lastSaved: new Date().toISOString(),
  gameState: {
    currentRank: 'G',
    rankHp: 3,
    promotionGauge: 35,
    remainingDays: 28,
    currentDay: 3,
    currentPhase: 'GATHERING',
    gold: 150,
    comboCount: 2,
    actionPoints: 2,
    isPromotionTest: false,
  },
  deckState: {
    deck: ['card_001', 'card_002'],
    hand: ['card_003'],
    discard: [],
    ownedCards: ['card_001', 'card_002', 'card_003'],
  },
  inventoryState: {
    materials: [],
    craftedItems: [],
    storageLimit: 20,
  },
  questState: {
    activeQuests: [],
    todayClients: ['villager'],
    todayQuests: [],
    questLimit: 3,
  },
  artifacts: [],
  ...overrides,
});

// =============================================================================
// テストスイート
// =============================================================================

describe('SaveLoadService', () => {
  let mockSaveRepo: ISaveDataRepository;
  let mockStateManager: Partial<IStateManager>;
  let mockDeckService: Partial<IDeckService>;
  let mockInventoryService: Partial<IInventoryService>;
  let mockQuestService: Partial<IQuestService>;
  let mockEventBus: Partial<IEventBus>;
  let saveLoadService: SaveLoadService;

  beforeEach(() => {
    // モックを初期化
    mockSaveRepo = createMockSaveRepo();
    mockStateManager = createMockStateManager();
    mockDeckService = createMockDeckService();
    mockInventoryService = createMockInventoryService();
    mockQuestService = createMockQuestService();
    mockEventBus = createMockEventBus();

    // SaveLoadServiceをインスタンス化
    saveLoadService = new SaveLoadService(
      mockSaveRepo,
      mockStateManager as IStateManager,
      mockDeckService as IDeckService,
      mockInventoryService as IInventoryService,
      mockQuestService as IQuestService,
      mockEventBus as IEventBus,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // save()メソッドのテスト
  // ===========================================================================

  describe('save()', () => {
    describe('正常系', () => {
      /**
       * TC-SAVE-001: セーブ実行 - 基本動作
       */
      it('TC-SAVE-001: save()がSaveDataRepository.save()を呼び出す', async () => {
        await saveLoadService.save();

        expect(mockSaveRepo.save).toHaveBeenCalledTimes(1);
      });

      /**
       * TC-SAVE-002: セーブデータにバージョン情報が含まれる
       */
      it('TC-SAVE-002: セーブデータにバージョン情報"1.0.0"が含まれる', async () => {
        await saveLoadService.save();

        expect(mockSaveRepo.save).toHaveBeenCalledWith(
          expect.objectContaining({
            version: '1.0.0',
          }),
        );
      });

      /**
       * TC-SAVE-003: セーブデータにlastSavedが含まれる
       */
      it('TC-SAVE-003: セーブデータにlastSavedがISO8601形式で含まれる', async () => {
        await saveLoadService.save();

        const savedData = vi.mocked(mockSaveRepo.save).mock.calls[0][0];
        expect(savedData.lastSaved).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      });

      /**
       * TC-SAVE-004: StateManagerから状態を取得する
       */
      it('TC-SAVE-004: StateManager.getState()が呼び出される', async () => {
        await saveLoadService.save();

        expect(mockStateManager.getState).toHaveBeenCalled();
      });

      /**
       * TC-SAVE-005: DeckServiceから状態を取得する
       */
      it('TC-SAVE-005: DeckServiceの取得メソッドが呼び出される', async () => {
        await saveLoadService.save();

        expect(mockDeckService.getDeck).toHaveBeenCalled();
        expect(mockDeckService.getHand).toHaveBeenCalled();
        expect(mockDeckService.getDiscard).toHaveBeenCalled();
      });

      /**
       * TC-SAVE-006: InventoryServiceから状態を取得する
       */
      it('TC-SAVE-006: InventoryServiceの取得メソッドが呼び出される', async () => {
        await saveLoadService.save();

        expect(mockInventoryService.getMaterials).toHaveBeenCalled();
        expect(mockInventoryService.getItems).toHaveBeenCalled();
        expect(mockInventoryService.getArtifacts).toHaveBeenCalled();
      });

      /**
       * TC-SAVE-007: QuestServiceから状態を取得する
       */
      it('TC-SAVE-007: QuestServiceの取得メソッドが呼び出される', async () => {
        await saveLoadService.save();

        expect(mockQuestService.getActiveQuests).toHaveBeenCalled();
        expect(mockQuestService.getAvailableQuests).toHaveBeenCalled();
      });

      /**
       * TC-SAVE-008: セーブ完了後にイベント発火
       */
      it('TC-SAVE-008: セーブ完了後にGAME_SAVEDイベントが発火される', async () => {
        await saveLoadService.save();

        expect(mockEventBus.emit).toHaveBeenCalledWith(GameEventType.GAME_SAVED, expect.anything());
      });
    });

    describe('異常系', () => {
      /**
       * TC-SAVE-E001: セーブ失敗 - リポジトリエラー
       */
      it('TC-SAVE-E001: リポジトリエラー時にApplicationErrorがスローされる', async () => {
        vi.mocked(mockSaveRepo.save).mockRejectedValueOnce(new Error('Storage error'));

        const promise = saveLoadService.save();
        await expect(promise).rejects.toThrow(ApplicationError);
        await expect(promise).rejects.toMatchObject({
          code: ErrorCodes.SAVE_FAILED,
        });
      });
    });
  });

  // ===========================================================================
  // load()メソッドのテスト
  // ===========================================================================

  describe('load()', () => {
    describe('正常系', () => {
      /**
       * TC-LOAD-001: ロード実行 - 基本動作
       */
      it('TC-LOAD-001: セーブデータが存在する場合、trueを返す', async () => {
        vi.mocked(mockSaveRepo.load).mockResolvedValueOnce(createValidSaveData());

        const result = await saveLoadService.load();

        expect(result).toBe(true);
      });

      /**
       * TC-LOAD-002: StateManagerに状態を復元する
       */
      it('TC-LOAD-002: StateManager.loadFromSaveData()が呼び出される', async () => {
        const saveData = createValidSaveData();
        vi.mocked(mockSaveRepo.load).mockResolvedValueOnce(saveData);

        await saveLoadService.load();

        expect(mockStateManager.loadFromSaveData).toHaveBeenCalledWith(saveData);
      });

      /**
       * TC-LOAD-006: ロード完了後にイベント発火
       */
      it('TC-LOAD-006: ロード完了後にGAME_LOADEDイベントが発火される', async () => {
        vi.mocked(mockSaveRepo.load).mockResolvedValueOnce(createValidSaveData());

        await saveLoadService.load();

        expect(mockEventBus.emit).toHaveBeenCalledWith(
          GameEventType.GAME_LOADED,
          expect.anything(),
        );
      });

      /**
       * TC-LOAD-008: バージョン互換チェック通過 - マイナーバージョン違い
       */
      it('TC-LOAD-008: マイナーバージョン違い(1.1.0)でも正常にロードできる', async () => {
        const saveData = createValidSaveData({ version: '1.1.0' });
        vi.mocked(mockSaveRepo.load).mockResolvedValueOnce(saveData);

        const result = await saveLoadService.load();

        expect(result).toBe(true);
      });

      /**
       * TC-LOAD-009: バージョン互換チェック通過 - パッチバージョン違い
       */
      it('TC-LOAD-009: パッチバージョン違い(1.0.5)でも正常にロードできる', async () => {
        const saveData = createValidSaveData({ version: '1.0.5' });
        vi.mocked(mockSaveRepo.load).mockResolvedValueOnce(saveData);

        const result = await saveLoadService.load();

        expect(result).toBe(true);
      });
    });

    describe('異常系', () => {
      /**
       * TC-LOAD-E001: ロード失敗 - セーブデータなし
       */
      it('TC-LOAD-E001: セーブデータが存在しない場合、falseを返す', async () => {
        vi.mocked(mockSaveRepo.load).mockResolvedValueOnce(null);

        const result = await saveLoadService.load();

        expect(result).toBe(false);
      });

      /**
       * TC-LOAD-E002: ロード失敗 - 非互換バージョン
       */
      it('TC-LOAD-E002: 非互換バージョン(2.0.0)でApplicationErrorがスローされる', async () => {
        const saveData = createValidSaveData({ version: '2.0.0' });
        vi.mocked(mockSaveRepo.load).mockResolvedValueOnce(saveData);

        const promise = saveLoadService.load();
        await expect(promise).rejects.toThrow(ApplicationError);
        await expect(promise).rejects.toMatchObject({
          code: ErrorCodes.INVALID_SAVE_DATA,
        });
      });

      /**
       * TC-LOAD-E003: ロード失敗 - 非互換バージョン（メジャー3）
       */
      it('TC-LOAD-E003: 非互換バージョン(3.5.0)でApplicationErrorがスローされる', async () => {
        const saveData = createValidSaveData({ version: '3.5.0' });
        vi.mocked(mockSaveRepo.load).mockResolvedValueOnce(saveData);

        await expect(saveLoadService.load()).rejects.toThrow(ApplicationError);
      });

      /**
       * TC-LOAD-E006: ロード失敗時 - イベント発火なし
       */
      it('TC-LOAD-E006: セーブデータなしの場合、GAME_LOADEDイベントは発火されない', async () => {
        vi.mocked(mockSaveRepo.load).mockResolvedValueOnce(null);

        await saveLoadService.load();

        expect(mockEventBus.emit).not.toHaveBeenCalledWith(
          GameEventType.GAME_LOADED,
          expect.anything(),
        );
      });

      /**
       * TC-LOAD-E007: ロード失敗時 - サービス状態変更なし
       */
      it('TC-LOAD-E007: セーブデータなしの場合、loadFromSaveData()は呼び出されない', async () => {
        vi.mocked(mockSaveRepo.load).mockResolvedValueOnce(null);

        await saveLoadService.load();

        expect(mockStateManager.loadFromSaveData).not.toHaveBeenCalled();
      });
    });
  });

  // ===========================================================================
  // hasSaveData()メソッドのテスト
  // ===========================================================================

  describe('hasSaveData()', () => {
    /**
     * TC-EXISTS-001: 存在チェック - セーブデータあり
     */
    it('TC-EXISTS-001: セーブデータが存在する場合、trueを返す', () => {
      vi.mocked(mockSaveRepo.exists).mockReturnValueOnce(true);

      const result = saveLoadService.hasSaveData();

      expect(result).toBe(true);
    });

    /**
     * TC-EXISTS-002: 存在チェック - セーブデータなし
     */
    it('TC-EXISTS-002: セーブデータが存在しない場合、falseを返す', () => {
      vi.mocked(mockSaveRepo.exists).mockReturnValueOnce(false);

      const result = saveLoadService.hasSaveData();

      expect(result).toBe(false);
    });

    /**
     * TC-EXISTS-003: リポジトリのexists()を呼び出す
     */
    it('TC-EXISTS-003: SaveDataRepository.exists()が呼び出される', () => {
      saveLoadService.hasSaveData();

      expect(mockSaveRepo.exists).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // deleteSaveData()メソッドのテスト
  // ===========================================================================

  describe('deleteSaveData()', () => {
    /**
     * TC-DELETE-001: 削除実行 - 基本動作
     */
    it('TC-DELETE-001: SaveDataRepository.delete()が呼び出される', async () => {
      await saveLoadService.deleteSaveData();

      expect(mockSaveRepo.delete).toHaveBeenCalled();
    });

    /**
     * TC-DELETE-002: 削除後の存在チェック
     */
    it('TC-DELETE-002: 削除後、hasSaveData()がfalseを返す', async () => {
      vi.mocked(mockSaveRepo.exists).mockReturnValueOnce(true);
      expect(saveLoadService.hasSaveData()).toBe(true);

      await saveLoadService.deleteSaveData();
      vi.mocked(mockSaveRepo.exists).mockReturnValueOnce(false);

      expect(saveLoadService.hasSaveData()).toBe(false);
    });
  });

  // ===========================================================================
  // バージョン互換性テスト
  // ===========================================================================

  describe('バージョン互換性', () => {
    /**
     * TC-VER-001: 現行バージョン
     */
    it('TC-VER-001: バージョン"1.0.0"は互換性あり', async () => {
      const saveData = createValidSaveData({ version: '1.0.0' });
      vi.mocked(mockSaveRepo.load).mockResolvedValueOnce(saveData);

      const result = await saveLoadService.load();

      expect(result).toBe(true);
    });

    /**
     * TC-VER-002: マイナーバージョンアップ
     */
    it('TC-VER-002: バージョン"1.1.0"は互換性あり', async () => {
      const saveData = createValidSaveData({ version: '1.1.0' });
      vi.mocked(mockSaveRepo.load).mockResolvedValueOnce(saveData);

      const result = await saveLoadService.load();

      expect(result).toBe(true);
    });

    /**
     * TC-VER-003: パッチバージョンアップ
     */
    it('TC-VER-003: バージョン"1.0.99"は互換性あり', async () => {
      const saveData = createValidSaveData({ version: '1.0.99' });
      vi.mocked(mockSaveRepo.load).mockResolvedValueOnce(saveData);

      const result = await saveLoadService.load();

      expect(result).toBe(true);
    });

    /**
     * TC-VER-004: メジャーバージョンダウン
     */
    it('TC-VER-004: バージョン"0.9.0"は互換性なし', async () => {
      const saveData = createValidSaveData({ version: '0.9.0' });
      vi.mocked(mockSaveRepo.load).mockResolvedValueOnce(saveData);

      await expect(saveLoadService.load()).rejects.toThrow(ApplicationError);
    });

    /**
     * TC-VER-005: メジャーバージョンアップ
     */
    it('TC-VER-005: バージョン"2.0.0"は互換性なし', async () => {
      const saveData = createValidSaveData({ version: '2.0.0' });
      vi.mocked(mockSaveRepo.load).mockResolvedValueOnce(saveData);

      await expect(saveLoadService.load()).rejects.toThrow(ApplicationError);
    });
  });
});
