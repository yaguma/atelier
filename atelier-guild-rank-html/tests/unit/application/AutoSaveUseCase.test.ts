/**
 * AutoSaveUseCaseテスト
 * TASK-0117: オートセーブユースケース
 *
 * オートセーブ処理をテストする
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  AutoSaveUseCase,
  createAutoSaveUseCase,
  AutoSaveResult,
  AutoSaveTrigger,
} from '@application/AutoSaveUseCase';
import { StateManager, createStateManager } from '@application/StateManager';
import { EventBus, createEventBus, GameEventType } from '@domain/events/GameEvents';
import { ISaveDataRepository } from '@infrastructure/repository/ISaveDataRepository';
import { ISaveData } from '@domain/save/SaveData';
import { GamePhase, GuildRank } from '@domain/common/types';
import { GameProgress } from '@domain/game/GameState';

/**
 * モックリポジトリを作成する
 */
function createMockRepository(): ISaveDataRepository & {
  savedData: ISaveData | null;
  saveError: Error | null;
} {
  return {
    savedData: null,
    saveError: null,
    create(initialData: ISaveData): void {
      this.savedData = initialData;
    },
    load(): ISaveData | null {
      return this.savedData;
    },
    save(data: ISaveData): void {
      if (this.saveError) {
        throw this.saveError;
      }
      this.savedData = data;
    },
    delete(): void {
      this.savedData = null;
    },
    exists(): boolean {
      return this.savedData !== null;
    },
    getVersion(): string | null {
      return this.savedData?.version ?? null;
    },
  };
}

describe('AutoSaveUseCase', () => {
  let autoSaveUseCase: AutoSaveUseCase;
  let stateManager: StateManager;
  let eventBus: EventBus;
  let mockRepository: ReturnType<typeof createMockRepository>;

  beforeEach(() => {
    // イベントバスを生成
    eventBus = createEventBus();
    // ステートマネージャーを生成
    stateManager = createStateManager();
    // モックリポジトリを生成
    mockRepository = createMockRepository();

    // 初期状態を設定
    const playerState = stateManager.getPlayerState();
    stateManager.updatePlayerState({
      ...playerState,
      rank: GuildRank.F,
      gold: 1000,
      promotionGauge: 50,
      rankDaysRemaining: 20,
    });

    // ゲーム状態を設定
    const gameState = stateManager.getGameState();
    stateManager.updateGameState({
      ...gameState,
      currentPhase: GamePhase.ALCHEMY,
      currentDay: 15,
      gameProgress: GameProgress.IN_PROGRESS,
    });

    // ユースケースを生成
    autoSaveUseCase = createAutoSaveUseCase(
      stateManager,
      eventBus,
      mockRepository
    );
  });

  describe('フェーズ終了時のオートセーブ', () => {
    it('フェーズ終了時にオートセーブ', async () => {
      const result = await autoSaveUseCase.execute(AutoSaveTrigger.PHASE_END);

      expect(result.success).toBe(true);
      expect(mockRepository.savedData).not.toBeNull();
    });

    it('セーブデータにゲーム状態が含まれる', async () => {
      await autoSaveUseCase.execute(AutoSaveTrigger.PHASE_END);

      expect(mockRepository.savedData?.gameState.currentPhase).toBe(GamePhase.ALCHEMY);
      expect(mockRepository.savedData?.gameState.currentDay).toBe(15);
    });
  });

  describe('日数経過時のオートセーブ', () => {
    it('日数経過時にオートセーブ', async () => {
      const result = await autoSaveUseCase.execute(AutoSaveTrigger.DAY_ADVANCE);

      expect(result.success).toBe(true);
      expect(mockRepository.savedData).not.toBeNull();
    });
  });

  describe('ショップ購入後のオートセーブ', () => {
    it('ショップ購入後にオートセーブ', async () => {
      const result = await autoSaveUseCase.execute(AutoSaveTrigger.SHOP_PURCHASE);

      expect(result.success).toBe(true);
      expect(mockRepository.savedData).not.toBeNull();
    });
  });

  describe('タイムスタンプ', () => {
    it('セーブデータにタイムスタンプが記録される', async () => {
      const beforeSave = new Date();

      await autoSaveUseCase.execute(AutoSaveTrigger.PHASE_END);

      const afterSave = new Date();
      const savedTimestamp = mockRepository.savedData?.lastSaved;

      expect(savedTimestamp).toBeDefined();

      // ISO8601形式の日時文字列を検証
      const savedDate = new Date(savedTimestamp!);
      expect(savedDate.getTime()).toBeGreaterThanOrEqual(beforeSave.getTime());
      expect(savedDate.getTime()).toBeLessThanOrEqual(afterSave.getTime());
    });
  });

  describe('エラーハンドリング', () => {
    it('セーブ失敗時にエラーハンドリング', async () => {
      // セーブエラーを設定
      mockRepository.saveError = new Error('Storage full');

      const result = await autoSaveUseCase.execute(AutoSaveTrigger.PHASE_END);

      expect(result.success).toBe(false);
      expect(result.error).toBe('SAVE_FAILED');
    });

    it('セーブ失敗時にエラーイベントが発行される', async () => {
      const eventHandler = vi.fn();
      eventBus.subscribe(GameEventType.SAVE_ERROR, eventHandler);

      // セーブエラーを設定
      mockRepository.saveError = new Error('Storage full');

      await autoSaveUseCase.execute(AutoSaveTrigger.PHASE_END);

      expect(eventHandler).toHaveBeenCalled();
      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: GameEventType.SAVE_ERROR,
        })
      );
    });
  });

  describe('各種トリガー', () => {
    it('昇格試験開始時にオートセーブ', async () => {
      const result = await autoSaveUseCase.execute(AutoSaveTrigger.PROMOTION_TEST_START);

      expect(result.success).toBe(true);
      expect(mockRepository.savedData).not.toBeNull();
    });

    it('昇格試験終了時にオートセーブ', async () => {
      const result = await autoSaveUseCase.execute(AutoSaveTrigger.PROMOTION_TEST_END);

      expect(result.success).toBe(true);
      expect(mockRepository.savedData).not.toBeNull();
    });
  });

  describe('セーブデータの完全性', () => {
    it('プレイヤー状態が正しく保存される', async () => {
      await autoSaveUseCase.execute(AutoSaveTrigger.PHASE_END);

      expect(mockRepository.savedData?.gameState.currentRank).toBe(GuildRank.F);
      expect(mockRepository.savedData?.gameState.gold).toBe(1000);
      expect(mockRepository.savedData?.gameState.promotionGauge).toBe(50);
      expect(mockRepository.savedData?.gameState.remainingDays).toBe(20);
    });

    it('バージョン情報が含まれる', async () => {
      await autoSaveUseCase.execute(AutoSaveTrigger.PHASE_END);

      expect(mockRepository.savedData?.version).toBeDefined();
      expect(typeof mockRepository.savedData?.version).toBe('string');
    });
  });
});
