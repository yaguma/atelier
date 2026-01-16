/**
 * game-state.ts テストケース
 * ゲーム状態関連型の型安全性テスト
 *
 * @description
 * TC-STATE-001 〜 TC-STATE-025 を実装
 */

// 型インポート（TDD Red: これらの型はまだ存在しない）
import type {
  IActiveQuest,
  ICraftedItem,
  IDeckState,
  IGameState,
  IInventoryState,
  IMaterialInstance,
  IQuest,
  IQuestState,
} from '@shared/types';
// 列挙型インポート
import {
  GamePhase,
  GuildRank,
  Quality,
  QuestType,
  toCardId,
  toClientId,
  toItemId,
  toMaterialId,
  toQuestId,
} from '@shared/types';
import { describe, expect, it } from 'vitest';

// =============================================================================
// 7.1 IGameStateインターフェース
// =============================================================================

describe('game-state.ts', () => {
  describe('IGameStateインターフェース', () => {
    // TC-STATE-001
    it('IGameState型がインポート可能', () => {
      const gameState: IGameState = {
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
      expect(gameState).toBeDefined();
    });

    // TC-STATE-002
    it('IGameState.currentRankがGuildRank型', () => {
      // @ts-expect-error - 不正な値で型エラー
      const invalid: IGameState = {
        currentRank: 'INVALID_RANK',
        rankHp: 100,
        remainingDays: 30,
        currentDay: 1,
        currentPhase: GamePhase.QUEST_ACCEPT,
        gold: 1000,
        comboCount: 0,
        actionPoints: 3,
        isPromotionTest: false,
      };
      expect(invalid).toBeDefined();
    });

    // TC-STATE-003
    it('IGameState.rankHpがnumber型', () => {
      // @ts-expect-error - 文字列で型エラー
      const invalid: IGameState = {
        currentRank: GuildRank.G,
        rankHp: '100',
        remainingDays: 30,
        currentDay: 1,
        currentPhase: GamePhase.QUEST_ACCEPT,
        gold: 1000,
        comboCount: 0,
        actionPoints: 3,
        isPromotionTest: false,
      };
      expect(invalid).toBeDefined();
    });

    // TC-STATE-004
    it('IGameState.remainingDaysがnumber型', () => {
      // @ts-expect-error - 文字列で型エラー
      const invalid: IGameState = {
        currentRank: GuildRank.G,
        rankHp: 100,
        remainingDays: '30',
        currentDay: 1,
        currentPhase: GamePhase.QUEST_ACCEPT,
        gold: 1000,
        comboCount: 0,
        actionPoints: 3,
        isPromotionTest: false,
      };
      expect(invalid).toBeDefined();
    });

    // TC-STATE-005
    it('IGameState.currentDayがnumber型', () => {
      // @ts-expect-error - 文字列で型エラー
      const invalid: IGameState = {
        currentRank: GuildRank.G,
        rankHp: 100,
        remainingDays: 30,
        currentDay: '1',
        currentPhase: GamePhase.QUEST_ACCEPT,
        gold: 1000,
        comboCount: 0,
        actionPoints: 3,
        isPromotionTest: false,
      };
      expect(invalid).toBeDefined();
    });

    // TC-STATE-006
    it('IGameState.currentPhaseがGamePhase型', () => {
      // @ts-expect-error - 不正な値で型エラー
      const invalid: IGameState = {
        currentRank: GuildRank.G,
        rankHp: 100,
        remainingDays: 30,
        currentDay: 1,
        currentPhase: 'INVALID_PHASE',
        gold: 1000,
        comboCount: 0,
        actionPoints: 3,
        isPromotionTest: false,
      };
      expect(invalid).toBeDefined();
    });

    // TC-STATE-007
    it('IGameState.goldがnumber型', () => {
      // @ts-expect-error - 文字列で型エラー
      const invalid: IGameState = {
        currentRank: GuildRank.G,
        rankHp: 100,
        remainingDays: 30,
        currentDay: 1,
        currentPhase: GamePhase.QUEST_ACCEPT,
        gold: '1000',
        comboCount: 0,
        actionPoints: 3,
        isPromotionTest: false,
      };
      expect(invalid).toBeDefined();
    });

    // TC-STATE-008
    it('IGameState.comboCountがnumber型', () => {
      // @ts-expect-error - 文字列で型エラー
      const invalid: IGameState = {
        currentRank: GuildRank.G,
        rankHp: 100,
        remainingDays: 30,
        currentDay: 1,
        currentPhase: GamePhase.QUEST_ACCEPT,
        gold: 1000,
        comboCount: '0',
        actionPoints: 3,
        isPromotionTest: false,
      };
      expect(invalid).toBeDefined();
    });

    // TC-STATE-009
    it('IGameState.actionPointsがnumber型', () => {
      // @ts-expect-error - 文字列で型エラー
      const invalid: IGameState = {
        currentRank: GuildRank.G,
        rankHp: 100,
        remainingDays: 30,
        currentDay: 1,
        currentPhase: GamePhase.QUEST_ACCEPT,
        gold: 1000,
        comboCount: 0,
        actionPoints: '3',
        isPromotionTest: false,
      };
      expect(invalid).toBeDefined();
    });

    // TC-STATE-010
    it('IGameState.isPromotionTestがboolean型', () => {
      // @ts-expect-error - 文字列で型エラー
      const invalid: IGameState = {
        currentRank: GuildRank.G,
        rankHp: 100,
        remainingDays: 30,
        currentDay: 1,
        currentPhase: GamePhase.QUEST_ACCEPT,
        gold: 1000,
        comboCount: 0,
        actionPoints: 3,
        isPromotionTest: 'false',
      };
      expect(invalid).toBeDefined();
    });

    // TC-STATE-011
    it('IGameState.promotionTestRemainingDaysがオプショナルでnumber型', () => {
      const withPromotionDays: IGameState = {
        currentRank: GuildRank.G,
        rankHp: 100,
        remainingDays: 30,
        currentDay: 1,
        currentPhase: GamePhase.QUEST_ACCEPT,
        gold: 1000,
        comboCount: 0,
        actionPoints: 3,
        isPromotionTest: true,
        promotionTestRemainingDays: 5,
      };
      const withoutPromotionDays: IGameState = {
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
      expect(withPromotionDays.promotionTestRemainingDays).toBe(5);
      expect(withoutPromotionDays.promotionTestRemainingDays).toBeUndefined();
    });
  });

  // =============================================================================
  // 7.2 IDeckStateインターフェース
  // =============================================================================

  describe('IDeckStateインターフェース', () => {
    // TC-STATE-012
    it('IDeckState型がインポート可能', () => {
      const deckState: IDeckState = {
        deck: [toCardId('card-001'), toCardId('card-002')],
        hand: [toCardId('card-003')],
        discard: [],
        ownedCards: [toCardId('card-001'), toCardId('card-002'), toCardId('card-003')],
      };
      expect(deckState).toBeDefined();
    });

    // TC-STATE-013
    it('IDeckState.deckがstring[]型', () => {
      // @ts-expect-error - 型違いで型エラー
      const invalid: IDeckState = {
        deck: 'not-an-array',
        hand: [],
        discard: [],
        ownedCards: [],
      };
      expect(invalid).toBeDefined();
    });

    // TC-STATE-014
    it('IDeckState.handがstring[]型', () => {
      // @ts-expect-error - 型違いで型エラー
      const invalid: IDeckState = {
        deck: [],
        hand: 'not-an-array',
        discard: [],
        ownedCards: [],
      };
      expect(invalid).toBeDefined();
    });

    // TC-STATE-015
    it('IDeckState.discardがstring[]型', () => {
      // @ts-expect-error - 型違いで型エラー
      const invalid: IDeckState = {
        deck: [],
        hand: [],
        discard: 'not-an-array',
        ownedCards: [],
      };
      expect(invalid).toBeDefined();
    });

    // TC-STATE-016
    it('IDeckState.ownedCardsがstring[]型', () => {
      // @ts-expect-error - 型違いで型エラー
      const invalid: IDeckState = {
        deck: [],
        hand: [],
        discard: [],
        ownedCards: 'not-an-array',
      };
      expect(invalid).toBeDefined();
    });
  });

  // =============================================================================
  // 7.3 IInventoryStateインターフェース
  // =============================================================================

  describe('IInventoryStateインターフェース', () => {
    // TC-STATE-017
    it('IInventoryState型がインポート可能', () => {
      const inventoryState: IInventoryState = {
        materials: [],
        craftedItems: [],
        storageLimit: 20,
      };
      expect(inventoryState).toBeDefined();
    });

    // TC-STATE-018
    it('IInventoryState.materialsがIMaterialInstance[]型', () => {
      // @ts-expect-error - 型違いで型エラー
      const invalid: IInventoryState = {
        materials: 'not-an-array',
        craftedItems: [],
        storageLimit: 20,
      };
      expect(invalid).toBeDefined();
    });

    // TC-STATE-019
    it('IInventoryState.craftedItemsがICraftedItem[]型', () => {
      // @ts-expect-error - 型違いで型エラー
      const invalid: IInventoryState = {
        materials: [],
        craftedItems: 'not-an-array',
        storageLimit: 20,
      };
      expect(invalid).toBeDefined();
    });

    // TC-STATE-020
    it('IInventoryState.storageLimitがnumber型', () => {
      // @ts-expect-error - 文字列で型エラー
      const invalid: IInventoryState = {
        materials: [],
        craftedItems: [],
        storageLimit: '20',
      };
      expect(invalid).toBeDefined();
    });
  });

  // =============================================================================
  // 7.4 IQuestStateインターフェース
  // =============================================================================

  describe('IQuestStateインターフェース', () => {
    // TC-STATE-021
    it('IQuestState型がインポート可能', () => {
      const questState: IQuestState = {
        activeQuests: [],
        todayClients: [toClientId('client-001')],
        todayQuests: [],
        questLimit: 3,
      };
      expect(questState).toBeDefined();
    });

    // TC-STATE-022
    it('IQuestState.activeQuestsがIActiveQuest[]型', () => {
      // @ts-expect-error - 型違いで型エラー
      const invalid: IQuestState = {
        activeQuests: 'not-an-array',
        todayClients: [],
        todayQuests: [],
        questLimit: 3,
      };
      expect(invalid).toBeDefined();
    });

    // TC-STATE-023
    it('IQuestState.todayClientsがstring[]型', () => {
      // @ts-expect-error - 型違いで型エラー
      const invalid: IQuestState = {
        activeQuests: [],
        todayClients: 'not-an-array',
        todayQuests: [],
        questLimit: 3,
      };
      expect(invalid).toBeDefined();
    });

    // TC-STATE-024
    it('IQuestState.todayQuestsがIQuest[]型', () => {
      // @ts-expect-error - 型違いで型エラー
      const invalid: IQuestState = {
        activeQuests: [],
        todayClients: [],
        todayQuests: 'not-an-array',
        questLimit: 3,
      };
      expect(invalid).toBeDefined();
    });

    // TC-STATE-025
    it('IQuestState.questLimitがnumber型', () => {
      // @ts-expect-error - 文字列で型エラー
      const invalid: IQuestState = {
        activeQuests: [],
        todayClients: [],
        todayQuests: [],
        questLimit: '3',
      };
      expect(invalid).toBeDefined();
    });
  });
});
