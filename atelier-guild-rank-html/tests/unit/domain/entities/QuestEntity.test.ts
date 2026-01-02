/**
 * 依頼エンティティのテスト
 * TASK-0087: 依頼エンティティ
 *
 * 依頼テンプレートエンティティ、依頼エンティティ、受注中依頼エンティティをテストする
 */

import { describe, it, expect } from 'vitest';
import {
  QuestTemplate,
  Quest,
  ActiveQuest,
  createQuestTemplate,
  createQuest,
  createActiveQuest,
} from '../../../../src/domain/quest/QuestEntity';
import {
  GuildRank,
  ItemCategory,
  Quality,
  QuestType,
} from '../../../../src/domain/common/types';
import type { IQuestCondition } from '../../../../src/domain/quest/Quest';

describe('Quest Entity', () => {
  // テスト用データ
  const sampleConditionTemplate: Partial<IQuestCondition> = {
    type: QuestType.SPECIFIC,
    itemId: 'item_healing_potion',
    quantity: 1,
  };

  const sampleQuestTemplateData = {
    id: 'quest_g_healing_potion',
    type: QuestType.SPECIFIC,
    difficulty: 'easy' as const,
    baseContribution: 10,
    baseGold: 50,
    baseDeadline: 3,
    conditionTemplate: sampleConditionTemplate,
    unlockRank: GuildRank.G,
    flavorTextTemplate: '回復薬を1つ作ってほしいのだ。',
  };

  const hardQuestTemplateData = {
    id: 'quest_e_quality_medicine',
    type: QuestType.QUALITY,
    difficulty: 'hard' as const,
    baseContribution: 30,
    baseGold: 150,
    baseDeadline: 5,
    conditionTemplate: {
      type: QuestType.QUALITY,
      category: ItemCategory.MEDICINE,
      minQuality: Quality.B,
      quantity: 1,
    },
    unlockRank: GuildRank.E,
    flavorTextTemplate: '品質Bランク以上の薬を作れるかね？',
  };

  describe('QuestTemplate（依頼テンプレート）', () => {
    it('依頼テンプレートを生成できる', () => {
      const template = createQuestTemplate(sampleQuestTemplateData);

      expect(template).toBeInstanceOf(QuestTemplate);
      expect(template.id).toBe('quest_g_healing_potion');
      expect(template.type).toBe(QuestType.SPECIFIC);
    });

    it('難易度を取得できる', () => {
      const easyTemplate = createQuestTemplate(sampleQuestTemplateData);
      const hardTemplate = createQuestTemplate(hardQuestTemplateData);

      expect(easyTemplate.getDifficulty()).toBe('easy');
      expect(hardTemplate.getDifficulty()).toBe('hard');
    });

    it('基本報酬（ゴールド）を取得できる', () => {
      const template = createQuestTemplate(sampleQuestTemplateData);

      expect(template.getBaseGold()).toBe(50);
    });

    it('基本報酬（貢献度）を取得できる', () => {
      const template = createQuestTemplate(sampleQuestTemplateData);

      expect(template.getBaseContribution()).toBe(10);
    });

    it('基本期限を取得できる', () => {
      const template = createQuestTemplate(sampleQuestTemplateData);

      expect(template.getBaseDeadline()).toBe(3);
    });

    it('解放ランクを取得できる', () => {
      const template = createQuestTemplate(sampleQuestTemplateData);

      expect(template.unlockRank).toBe(GuildRank.G);
    });

    it('不変オブジェクトとして設計されている', () => {
      const template = createQuestTemplate(sampleQuestTemplateData);

      const conditionTemplate1 = template.getConditionTemplate();
      const conditionTemplate2 = template.getConditionTemplate();

      // 異なるオブジェクトが返される（コピーされている）
      expect(conditionTemplate1).not.toBe(conditionTemplate2);
      // 値は同じ
      expect(conditionTemplate1.quantity).toBe(conditionTemplate2.quantity);
    });
  });

  describe('Quest（生成された依頼）', () => {
    const sampleCondition: IQuestCondition = {
      type: QuestType.SPECIFIC,
      itemId: 'item_healing_potion',
      quantity: 1,
    };

    const sampleQuestData = {
      id: 'quest_runtime_001',
      clientId: 'client_villager',
      condition: sampleCondition,
      contribution: 12, // 補正後
      gold: 55, // 補正後
      deadline: 4, // 補正後
      difficulty: 'easy' as const,
      flavorText: '回復薬を1つ作ってほしいのだ。',
    };

    it('依頼を生成できる', () => {
      const quest = createQuest(sampleQuestData);

      expect(quest).toBeInstanceOf(Quest);
      expect(quest.id).toBe('quest_runtime_001');
      expect(quest.clientId).toBe('client_villager');
    });

    it('難易度を取得できる', () => {
      const quest = createQuest(sampleQuestData);

      expect(quest.getDifficulty()).toBe('easy');
    });

    it('必要アイテムリストを取得できる', () => {
      const quest = createQuest(sampleQuestData);

      const condition = quest.getCondition();

      expect(condition.type).toBe(QuestType.SPECIFIC);
      expect(condition.itemId).toBe('item_healing_potion');
      expect(condition.quantity).toBe(1);
    });

    it('報酬（ゴールド）を取得できる', () => {
      const quest = createQuest(sampleQuestData);

      expect(quest.getGold()).toBe(55);
    });

    it('報酬（貢献度）を取得できる', () => {
      const quest = createQuest(sampleQuestData);

      expect(quest.getContribution()).toBe(12);
    });

    it('期限を取得できる', () => {
      const quest = createQuest(sampleQuestData);

      expect(quest.getDeadline()).toBe(4);
    });

    it('カテゴリ条件の依頼を処理できる', () => {
      const categoryQuest = createQuest({
        ...sampleQuestData,
        condition: {
          type: QuestType.CATEGORY,
          category: ItemCategory.MEDICINE,
          quantity: 3,
        },
      });

      const condition = categoryQuest.getCondition();
      expect(condition.type).toBe(QuestType.CATEGORY);
      expect(condition.category).toBe(ItemCategory.MEDICINE);
    });

    it('品質条件の依頼を処理できる', () => {
      const qualityQuest = createQuest({
        ...sampleQuestData,
        condition: {
          type: QuestType.QUALITY,
          category: ItemCategory.MEDICINE,
          minQuality: Quality.B,
          quantity: 1,
        },
      });

      const condition = qualityQuest.getCondition();
      expect(condition.type).toBe(QuestType.QUALITY);
      expect(condition.minQuality).toBe(Quality.B);
    });

    it('不変オブジェクトとして設計されている', () => {
      const quest = createQuest(sampleQuestData);

      const condition1 = quest.getCondition();
      const condition2 = quest.getCondition();

      // 異なるオブジェクトが返される（コピーされている）
      expect(condition1).not.toBe(condition2);
      // 値は同じ
      expect(condition1.quantity).toBe(condition2.quantity);
    });
  });

  describe('ActiveQuest（受注中の依頼）', () => {
    const sampleCondition: IQuestCondition = {
      type: QuestType.SPECIFIC,
      itemId: 'item_healing_potion',
      quantity: 1,
    };

    const sampleQuestData = {
      id: 'quest_runtime_001',
      clientId: 'client_villager',
      condition: sampleCondition,
      contribution: 12,
      gold: 55,
      deadline: 4,
      difficulty: 'easy' as const,
      flavorText: '回復薬を1つ作ってほしいのだ。',
    };

    const sampleActiveQuestData = {
      quest: sampleQuestData,
      remainingDays: 3,
      acceptedDay: 1,
    };

    it('受注中の依頼を生成できる', () => {
      const activeQuest = createActiveQuest(sampleActiveQuestData);

      expect(activeQuest).toBeInstanceOf(ActiveQuest);
      expect(activeQuest.getQuest().id).toBe('quest_runtime_001');
    });

    it('残り日数を取得できる', () => {
      const activeQuest = createActiveQuest(sampleActiveQuestData);

      expect(activeQuest.getRemainingDays()).toBe(3);
    });

    it('受注日を取得できる', () => {
      const activeQuest = createActiveQuest(sampleActiveQuestData);

      expect(activeQuest.getAcceptedDay()).toBe(1);
    });

    it('期限切れ判定ができる', () => {
      const activeQuest = createActiveQuest(sampleActiveQuestData);
      const expiredQuest = createActiveQuest({
        ...sampleActiveQuestData,
        remainingDays: 0,
      });
      const overdueQuest = createActiveQuest({
        ...sampleActiveQuestData,
        remainingDays: -1,
      });

      expect(activeQuest.isExpired()).toBe(false);
      expect(expiredQuest.isExpired()).toBe(true);
      expect(overdueQuest.isExpired()).toBe(true);
    });

    it('残り日数を減らした新しいインスタンスを作成できる', () => {
      const activeQuest = createActiveQuest(sampleActiveQuestData);
      const nextDay = activeQuest.advanceDay();

      // 元のインスタンスは変更されない
      expect(activeQuest.getRemainingDays()).toBe(3);
      // 新しいインスタンスは残り日数が減っている
      expect(nextDay.getRemainingDays()).toBe(2);
      // 他のプロパティは維持される
      expect(nextDay.getQuest().id).toBe('quest_runtime_001');
      expect(nextDay.getAcceptedDay()).toBe(1);
    });

    it('不変オブジェクトとして設計されている', () => {
      const activeQuest = createActiveQuest(sampleActiveQuestData);

      expect(activeQuest.getRemainingDays()).toBe(3);
    });
  });
});
