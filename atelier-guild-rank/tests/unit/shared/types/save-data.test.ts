/**
 * save-data.ts テストケース
 * セーブデータ関連型の型安全性テスト
 *
 * @description
 * TC-SAVE-001 〜 TC-SAVE-008 を実装
 */

// 型インポート（TDD Red: これらの型はまだ存在しない）
import type {
  IDeckState,
  IGameState,
  IInventoryState,
  IQuestState,
  ISaveData,
} from '@shared/types';
// 列挙型インポート
import { GamePhase, GuildRank, toArtifactId, toCardId, toClientId } from '@shared/types';
import { describe, expect, it } from 'vitest';

// =============================================================================
// 9.1 ISaveDataインターフェース
// =============================================================================

describe('save-data.ts', () => {
  describe('ISaveDataインターフェース', () => {
    // テスト用のサンプルデータ
    const sampleGameState: IGameState = {
      currentRank: GuildRank.G,
      rankHp: 100,
      remainingDays: 30,
      currentDay: 1,
      currentPhase: GamePhase.QUEST_ACCEPT,
      gold: 1000,
      comboCount: 0,
      actionPoints: 3,
      isPromotionTest: false,
    };

    const sampleDeckState: IDeckState = {
      deck: [toCardId('card-001')],
      hand: [],
      discard: [],
      ownedCards: [toCardId('card-001')],
    };

    const sampleInventoryState: IInventoryState = {
      materials: [],
      craftedItems: [],
      storageLimit: 20,
    };

    const sampleQuestState: IQuestState = {
      activeQuests: [],
      todayClients: [toClientId('client-001')],
      todayQuests: [],
      questLimit: 3,
    };

    // TC-SAVE-001
    it('ISaveData型がインポート可能', () => {
      const saveData: ISaveData = {
        version: '1.0.0',
        lastSaved: new Date().toISOString(),
        gameState: sampleGameState,
        deckState: sampleDeckState,
        inventoryState: sampleInventoryState,
        questState: sampleQuestState,
        artifacts: [toArtifactId('artifact-001')],
      };
      expect(saveData).toBeDefined();
    });

    // TC-SAVE-002
    it('ISaveData.versionがstring型', () => {
      // @ts-expect-error - 数値で型エラー
      const invalid: ISaveData = {
        version: 100,
        lastSaved: new Date().toISOString(),
        gameState: sampleGameState,
        deckState: sampleDeckState,
        inventoryState: sampleInventoryState,
        questState: sampleQuestState,
        artifacts: [],
      };
      expect(invalid).toBeDefined();
    });

    // TC-SAVE-003
    it('ISaveData.lastSavedがstring型', () => {
      // @ts-expect-error - 数値で型エラー
      const invalid: ISaveData = {
        version: '1.0.0',
        lastSaved: Date.now(),
        gameState: sampleGameState,
        deckState: sampleDeckState,
        inventoryState: sampleInventoryState,
        questState: sampleQuestState,
        artifacts: [],
      };
      expect(invalid).toBeDefined();
    });

    // TC-SAVE-004
    it('ISaveData.gameStateがIGameState型', () => {
      // @ts-expect-error - 型違いで型エラー
      const invalid: ISaveData = {
        version: '1.0.0',
        lastSaved: new Date().toISOString(),
        gameState: 'not-a-game-state',
        deckState: sampleDeckState,
        inventoryState: sampleInventoryState,
        questState: sampleQuestState,
        artifacts: [],
      };
      expect(invalid).toBeDefined();
    });

    // TC-SAVE-005
    it('ISaveData.deckStateがIDeckState型', () => {
      // @ts-expect-error - 型違いで型エラー
      const invalid: ISaveData = {
        version: '1.0.0',
        lastSaved: new Date().toISOString(),
        gameState: sampleGameState,
        deckState: 'not-a-deck-state',
        inventoryState: sampleInventoryState,
        questState: sampleQuestState,
        artifacts: [],
      };
      expect(invalid).toBeDefined();
    });

    // TC-SAVE-006
    it('ISaveData.inventoryStateがIInventoryState型', () => {
      // @ts-expect-error - 型違いで型エラー
      const invalid: ISaveData = {
        version: '1.0.0',
        lastSaved: new Date().toISOString(),
        gameState: sampleGameState,
        deckState: sampleDeckState,
        inventoryState: 'not-an-inventory-state',
        questState: sampleQuestState,
        artifacts: [],
      };
      expect(invalid).toBeDefined();
    });

    // TC-SAVE-007
    it('ISaveData.questStateがIQuestState型', () => {
      // @ts-expect-error - 型違いで型エラー
      const invalid: ISaveData = {
        version: '1.0.0',
        lastSaved: new Date().toISOString(),
        gameState: sampleGameState,
        deckState: sampleDeckState,
        inventoryState: sampleInventoryState,
        questState: 'not-a-quest-state',
        artifacts: [],
      };
      expect(invalid).toBeDefined();
    });

    // TC-SAVE-008
    it('ISaveData.artifactsがstring[]型', () => {
      // @ts-expect-error - 型違いで型エラー
      const invalid: ISaveData = {
        version: '1.0.0',
        lastSaved: new Date().toISOString(),
        gameState: sampleGameState,
        deckState: sampleDeckState,
        inventoryState: sampleInventoryState,
        questState: sampleQuestState,
        artifacts: 'not-an-array',
      };
      expect(invalid).toBeDefined();
    });
  });
});
