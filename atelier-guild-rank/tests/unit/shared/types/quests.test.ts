/**
 * quests.ts テストケース
 * 依頼関連型の型安全性テスト
 *
 * @description
 * TC-QUEST-001 〜 TC-QUEST-029 を実装
 */

// 型インポート（TDD Red: これらの型はまだ存在しない）
import type { IActiveQuest, IClient, IQuest, IQuestCondition } from '@shared/types';
// 列挙型・ID型インポート
import {
  ClientType,
  GuildRank,
  ItemCategory,
  Quality,
  QuestType,
  toClientId,
  toQuestId,
} from '@shared/types';
import { describe, expect, it } from 'vitest';

// =============================================================================
// 6.1 IClientインターフェース
// =============================================================================

describe('quests.ts', () => {
  describe('IClientインターフェース', () => {
    // TC-QUEST-001
    it('IClient型がインポート可能', () => {
      const client: IClient = {
        id: toClientId('client-001'),
        name: 'Test Client',
        type: ClientType.VILLAGER,
        contributionMultiplier: 1.0,
        goldMultiplier: 1.0,
        deadlineModifier: 0,
        preferredQuestTypes: [QuestType.SPECIFIC],
        unlockRank: GuildRank.G,
      };
      expect(client).toBeDefined();
    });

    // TC-QUEST-002
    it('IClient.idが必須でstring型', () => {
      // @ts-expect-error - undefined不可
      const invalid: IClient = {
        name: 'Test Client',
        type: ClientType.VILLAGER,
        contributionMultiplier: 1.0,
        goldMultiplier: 1.0,
        deadlineModifier: 0,
        preferredQuestTypes: [QuestType.SPECIFIC],
        unlockRank: GuildRank.G,
      };
      expect(invalid).toBeDefined();
    });

    // TC-QUEST-003
    it('IClient.typeがClientType型', () => {
      // @ts-expect-error - 不正な値で型エラー
      const invalid: IClient = {
        id: toClientId('client-001'),
        name: 'Test Client',
        type: 'INVALID_TYPE',
        contributionMultiplier: 1.0,
        goldMultiplier: 1.0,
        deadlineModifier: 0,
        preferredQuestTypes: [QuestType.SPECIFIC],
        unlockRank: GuildRank.G,
      };
      expect(invalid).toBeDefined();
    });

    // TC-QUEST-004
    it('IClient.contributionMultiplierがnumber型', () => {
      // @ts-expect-error - 文字列で型エラー
      const invalid: IClient = {
        id: toClientId('client-001'),
        name: 'Test Client',
        type: ClientType.VILLAGER,
        contributionMultiplier: '1.0',
        goldMultiplier: 1.0,
        deadlineModifier: 0,
        preferredQuestTypes: [QuestType.SPECIFIC],
        unlockRank: GuildRank.G,
      };
      expect(invalid).toBeDefined();
    });

    // TC-QUEST-005
    it('IClient.goldMultiplierがnumber型', () => {
      // @ts-expect-error - 文字列で型エラー
      const invalid: IClient = {
        id: toClientId('client-001'),
        name: 'Test Client',
        type: ClientType.VILLAGER,
        contributionMultiplier: 1.0,
        goldMultiplier: '1.0',
        deadlineModifier: 0,
        preferredQuestTypes: [QuestType.SPECIFIC],
        unlockRank: GuildRank.G,
      };
      expect(invalid).toBeDefined();
    });

    // TC-QUEST-006
    it('IClient.deadlineModifierがnumber型', () => {
      // @ts-expect-error - 文字列で型エラー
      const invalid: IClient = {
        id: toClientId('client-001'),
        name: 'Test Client',
        type: ClientType.VILLAGER,
        contributionMultiplier: 1.0,
        goldMultiplier: 1.0,
        deadlineModifier: '0',
        preferredQuestTypes: [QuestType.SPECIFIC],
        unlockRank: GuildRank.G,
      };
      expect(invalid).toBeDefined();
    });

    // TC-QUEST-007
    it('IClient.preferredQuestTypesがQuestType[]型', () => {
      // @ts-expect-error - 型違いで型エラー
      const invalid: IClient = {
        id: toClientId('client-001'),
        name: 'Test Client',
        type: ClientType.VILLAGER,
        contributionMultiplier: 1.0,
        goldMultiplier: 1.0,
        deadlineModifier: 0,
        preferredQuestTypes: 'not-an-array',
        unlockRank: GuildRank.G,
      };
      expect(invalid).toBeDefined();
    });

    // TC-QUEST-008
    it('IClient.unlockRankがGuildRank型', () => {
      // @ts-expect-error - 不正な値で型エラー
      const invalid: IClient = {
        id: toClientId('client-001'),
        name: 'Test Client',
        type: ClientType.VILLAGER,
        contributionMultiplier: 1.0,
        goldMultiplier: 1.0,
        deadlineModifier: 0,
        preferredQuestTypes: [QuestType.SPECIFIC],
        unlockRank: 'INVALID_RANK',
      };
      expect(invalid).toBeDefined();
    });

    // TC-QUEST-009
    it('IClient.dialoguePatternsがオプショナル', () => {
      const withDialogue: IClient = {
        id: toClientId('client-001'),
        name: 'Test Client',
        type: ClientType.VILLAGER,
        contributionMultiplier: 1.0,
        goldMultiplier: 1.0,
        deadlineModifier: 0,
        preferredQuestTypes: [QuestType.SPECIFIC],
        unlockRank: GuildRank.G,
        dialoguePatterns: ['Hello!', 'Thank you!'],
      };
      const withoutDialogue: IClient = {
        id: toClientId('client-002'),
        name: 'Test Client 2',
        type: ClientType.MERCHANT,
        contributionMultiplier: 1.5,
        goldMultiplier: 1.2,
        deadlineModifier: -1,
        preferredQuestTypes: [QuestType.QUANTITY],
        unlockRank: GuildRank.F,
      };
      expect(withDialogue.dialoguePatterns).toBeDefined();
      expect(withoutDialogue.dialoguePatterns).toBeUndefined();
    });
  });

  // =============================================================================
  // 6.2 IQuestConditionインターフェース
  // =============================================================================

  describe('IQuestConditionインターフェース', () => {
    // TC-QUEST-010
    it('IQuestCondition型がインポート可能', () => {
      const condition: IQuestCondition = {
        type: QuestType.SPECIFIC,
      };
      expect(condition).toBeDefined();
    });

    // TC-QUEST-011
    it('IQuestCondition.typeが必須でQuestType型', () => {
      // @ts-expect-error - undefined/不正値で型エラー
      const invalid: IQuestCondition = {
        type: 'INVALID_TYPE',
      };
      expect(invalid).toBeDefined();
    });

    // TC-QUEST-012
    it('IQuestCondition.itemIdがオプショナル', () => {
      const withItemId: IQuestCondition = {
        type: QuestType.SPECIFIC,
        itemId: 'item-001',
      };
      const withoutItemId: IQuestCondition = {
        type: QuestType.CATEGORY,
      };
      expect(withItemId.itemId).toBeDefined();
      expect(withoutItemId.itemId).toBeUndefined();
    });

    // TC-QUEST-013
    it('IQuestCondition.categoryがオプショナルでItemCategory型', () => {
      const withCategory: IQuestCondition = {
        type: QuestType.CATEGORY,
        category: ItemCategory.MEDICINE,
      };
      const withoutCategory: IQuestCondition = {
        type: QuestType.SPECIFIC,
      };
      expect(withCategory.category).toBe(ItemCategory.MEDICINE);
      expect(withoutCategory.category).toBeUndefined();
    });

    // TC-QUEST-014
    it('IQuestCondition.minQualityがオプショナルでQuality型', () => {
      const withQuality: IQuestCondition = {
        type: QuestType.QUALITY,
        minQuality: Quality.A,
      };
      const withoutQuality: IQuestCondition = {
        type: QuestType.QUANTITY,
      };
      expect(withQuality.minQuality).toBe(Quality.A);
      expect(withoutQuality.minQuality).toBeUndefined();
    });

    // TC-QUEST-015
    it('IQuestCondition.quantityがオプショナルでnumber型', () => {
      const withQuantity: IQuestCondition = {
        type: QuestType.QUANTITY,
        quantity: 5,
      };
      const withoutQuantity: IQuestCondition = {
        type: QuestType.SPECIFIC,
      };
      expect(withQuantity.quantity).toBe(5);
      expect(withoutQuantity.quantity).toBeUndefined();
    });

    // TC-QUEST-016
    it('IQuestCondition.subConditionsが再帰的にIQuestCondition[]型', () => {
      const compound: IQuestCondition = {
        type: QuestType.COMPOUND,
        subConditions: [
          { type: QuestType.SPECIFIC, itemId: 'item-001' },
          { type: QuestType.QUALITY, minQuality: Quality.B },
        ],
      };
      expect(compound.subConditions).toBeDefined();
      expect(compound.subConditions?.length).toBe(2);
    });
  });

  // =============================================================================
  // 6.3 IQuestインターフェース
  // =============================================================================

  describe('IQuestインターフェース', () => {
    // TC-QUEST-017
    it('IQuest型がインポート可能', () => {
      const quest: IQuest = {
        id: toQuestId('quest-001'),
        clientId: toClientId('client-001'),
        condition: { type: QuestType.SPECIFIC },
        contribution: 100,
        gold: 500,
        deadline: 7,
        difficulty: 'normal',
        flavorText: 'Test flavor text',
      };
      expect(quest).toBeDefined();
    });

    // TC-QUEST-018
    it('IQuest.idが必須でstring型', () => {
      // @ts-expect-error - undefined不可
      const invalid: IQuest = {
        clientId: toClientId('client-001'),
        condition: { type: QuestType.SPECIFIC },
        contribution: 100,
        gold: 500,
        deadline: 7,
        difficulty: 'normal',
        flavorText: 'Test flavor text',
      };
      expect(invalid).toBeDefined();
    });

    // TC-QUEST-019
    it('IQuest.clientIdが必須でstring型', () => {
      // @ts-expect-error - undefined不可
      const invalid: IQuest = {
        id: toQuestId('quest-001'),
        condition: { type: QuestType.SPECIFIC },
        contribution: 100,
        gold: 500,
        deadline: 7,
        difficulty: 'normal',
        flavorText: 'Test flavor text',
      };
      expect(invalid).toBeDefined();
    });

    // TC-QUEST-020
    it('IQuest.conditionがIQuestCondition型', () => {
      // @ts-expect-error - 型違いで型エラー
      const invalid: IQuest = {
        id: toQuestId('quest-001'),
        clientId: toClientId('client-001'),
        condition: 'not-a-condition',
        contribution: 100,
        gold: 500,
        deadline: 7,
        difficulty: 'normal',
        flavorText: 'Test flavor text',
      };
      expect(invalid).toBeDefined();
    });

    // TC-QUEST-021
    it('IQuest.contributionがnumber型', () => {
      // @ts-expect-error - 文字列で型エラー
      const invalid: IQuest = {
        id: toQuestId('quest-001'),
        clientId: toClientId('client-001'),
        condition: { type: QuestType.SPECIFIC },
        contribution: '100',
        gold: 500,
        deadline: 7,
        difficulty: 'normal',
        flavorText: 'Test flavor text',
      };
      expect(invalid).toBeDefined();
    });

    // TC-QUEST-022
    it('IQuest.goldがnumber型', () => {
      // @ts-expect-error - 文字列で型エラー
      const invalid: IQuest = {
        id: toQuestId('quest-001'),
        clientId: toClientId('client-001'),
        condition: { type: QuestType.SPECIFIC },
        contribution: 100,
        gold: '500',
        deadline: 7,
        difficulty: 'normal',
        flavorText: 'Test flavor text',
      };
      expect(invalid).toBeDefined();
    });

    // TC-QUEST-023
    it('IQuest.deadlineがnumber型', () => {
      // @ts-expect-error - 文字列で型エラー
      const invalid: IQuest = {
        id: toQuestId('quest-001'),
        clientId: toClientId('client-001'),
        condition: { type: QuestType.SPECIFIC },
        contribution: 100,
        gold: 500,
        deadline: '7',
        difficulty: 'normal',
        flavorText: 'Test flavor text',
      };
      expect(invalid).toBeDefined();
    });

    // TC-QUEST-024
    it('IQuest.difficultyが有効なリテラル型', () => {
      // @ts-expect-error - 不正な値で型エラー
      const invalid: IQuest = {
        id: toQuestId('quest-001'),
        clientId: toClientId('client-001'),
        condition: { type: QuestType.SPECIFIC },
        contribution: 100,
        gold: 500,
        deadline: 7,
        difficulty: 'invalid_difficulty',
        flavorText: 'Test flavor text',
      };
      expect(invalid).toBeDefined();
    });

    // TC-QUEST-025
    it('IQuest.flavorTextがstring型', () => {
      // @ts-expect-error - 数値で型エラー
      const invalid: IQuest = {
        id: toQuestId('quest-001'),
        clientId: toClientId('client-001'),
        condition: { type: QuestType.SPECIFIC },
        contribution: 100,
        gold: 500,
        deadline: 7,
        difficulty: 'normal',
        flavorText: 12345,
      };
      expect(invalid).toBeDefined();
    });
  });

  // =============================================================================
  // 6.4 IActiveQuestインターフェース
  // =============================================================================

  describe('IActiveQuestインターフェース', () => {
    // TC-QUEST-026
    it('IActiveQuest型がインポート可能', () => {
      const activeQuest: IActiveQuest = {
        quest: {
          id: toQuestId('quest-001'),
          clientId: toClientId('client-001'),
          condition: { type: QuestType.SPECIFIC },
          contribution: 100,
          gold: 500,
          deadline: 7,
          difficulty: 'normal',
          flavorText: 'Test flavor text',
        },
        remainingDays: 5,
        acceptedDay: 2,
      };
      expect(activeQuest).toBeDefined();
    });

    // TC-QUEST-027
    it('IActiveQuest.questがIQuest型', () => {
      // @ts-expect-error - 型違いで型エラー
      const invalid: IActiveQuest = {
        quest: 'not-a-quest',
        remainingDays: 5,
        acceptedDay: 2,
      };
      expect(invalid).toBeDefined();
    });

    // TC-QUEST-028
    it('IActiveQuest.remainingDaysがnumber型', () => {
      // @ts-expect-error - 文字列で型エラー
      const invalid: IActiveQuest = {
        quest: {
          id: toQuestId('quest-001'),
          clientId: toClientId('client-001'),
          condition: { type: QuestType.SPECIFIC },
          contribution: 100,
          gold: 500,
          deadline: 7,
          difficulty: 'normal',
          flavorText: 'Test flavor text',
        },
        remainingDays: '5',
        acceptedDay: 2,
      };
      expect(invalid).toBeDefined();
    });

    // TC-QUEST-029
    it('IActiveQuest.acceptedDayがnumber型', () => {
      // @ts-expect-error - 文字列で型エラー
      const invalid: IActiveQuest = {
        quest: {
          id: toQuestId('quest-001'),
          clientId: toClientId('client-001'),
          condition: { type: QuestType.SPECIFIC },
          contribution: 100,
          gold: 500,
          deadline: 7,
          difficulty: 'normal',
          flavorText: 'Test flavor text',
        },
        remainingDays: 5,
        acceptedDay: '2',
      };
      expect(invalid).toBeDefined();
    });
  });
});
