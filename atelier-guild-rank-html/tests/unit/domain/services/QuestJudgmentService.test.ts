/**
 * 依頼判定ドメインサービスのテスト
 * TASK-0095: 依頼判定ドメインサービス
 *
 * 依頼の納品判定と報酬計算のビジネスロジックをテストする
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  QuestJudgmentService,
} from '../../../../src/domain/services/QuestJudgmentService';
import {
  createQuest,
  createActiveQuest,
} from '../../../../src/domain/quest/QuestEntity';
import {
  createCraftedItem,
} from '../../../../src/domain/item/ItemEntity';
import {
  createInventory,
  type Inventory,
} from '../../../../src/domain/services/InventoryService';
import {
  Quality,
  QuestType,
  ItemCategory,
  Attribute,
  ItemEffectType,
} from '../../../../src/domain/common/types';
import type { IQuest } from '../../../../src/domain/quest/QuestEntity';
import type { ICraftedItem } from '../../../../src/domain/item/Item';

describe('QuestJudgmentService', () => {
  let judgmentService: QuestJudgmentService;

  // テスト用依頼データ
  const specificItemQuest: IQuest = {
    id: 'quest_specific_1',
    clientId: 'client_1',
    condition: {
      type: QuestType.SPECIFIC,
      itemId: 'healing_potion',
      quantity: 2,
    },
    contribution: 100,
    gold: 500,
    deadline: 3,
    difficulty: 'normal',
    flavorText: 'ポーションを届けてくれ',
  };

  const categoryQuest: IQuest = {
    id: 'quest_category_1',
    clientId: 'client_2',
    condition: {
      type: QuestType.CATEGORY,
      category: ItemCategory.MEDICINE,
      quantity: 1,
      minQuality: Quality.B,
    },
    contribution: 150,
    gold: 700,
    deadline: 5,
    difficulty: 'hard',
    flavorText: '高品質な薬が必要だ',
  };

  const attributeQuest: IQuest = {
    id: 'quest_attribute_1',
    clientId: 'client_3',
    condition: {
      type: QuestType.ATTRIBUTE,
      attribute: Attribute.FIRE,
      minAttributeValue: 50,
      quantity: 1,
    },
    contribution: 200,
    gold: 1000,
    deadline: 7,
    difficulty: 'extreme',
    flavorText: '炎の力を持つアイテムが欲しい',
  };

  const effectQuest: IQuest = {
    id: 'quest_effect_1',
    clientId: 'client_4',
    condition: {
      type: QuestType.EFFECT,
      effectType: ItemEffectType.HEAL,
      minEffectValue: 100,
      quantity: 1,
    },
    contribution: 120,
    gold: 600,
    deadline: 4,
    difficulty: 'normal',
    flavorText: '回復効果の高いアイテムを',
  };

  // テスト用アイテムデータ
  const healingPotionItem: ICraftedItem = {
    itemId: 'healing_potion',
    quality: Quality.B,
    attributeValues: [],
    effectValues: [{ type: ItemEffectType.HEAL, value: 120 }],
    usedMaterials: [],
  };

  const medicineItem: ICraftedItem = {
    itemId: 'medicine_1',
    quality: Quality.A,
    attributeValues: [],
    effectValues: [{ type: ItemEffectType.HEAL, value: 80 }],
    usedMaterials: [],
  };

  const fireItem: ICraftedItem = {
    itemId: 'fire_item_1',
    quality: Quality.B,
    attributeValues: [{ attribute: Attribute.FIRE, value: 60 }],
    effectValues: [],
    usedMaterials: [],
  };

  beforeEach(() => {
    judgmentService = new QuestJudgmentService();
  });

  describe('canDeliver（納品可否判定）', () => {
    it('必要アイテムが揃っていれば納品できる', () => {
      const quest = createQuest(specificItemQuest);
      const items = [
        createCraftedItem(healingPotionItem),
        createCraftedItem(healingPotionItem),
      ];
      const inventory = createInventory([], items);

      const result = judgmentService.canDeliver(inventory, quest);

      expect(result.canDeliver).toBe(true);
      expect(result.missingItems).toHaveLength(0);
    });

    it('必要アイテムが不足していると納品できない', () => {
      const quest = createQuest(specificItemQuest); // 2個必要
      const items = [createCraftedItem(healingPotionItem)]; // 1個しかない
      const inventory = createInventory([], items);

      const result = judgmentService.canDeliver(inventory, quest);

      expect(result.canDeliver).toBe(false);
      expect(result.missingItems.length).toBeGreaterThan(0);
    });

    it('品質要件を満たしているか判定できる', () => {
      const quest = createQuest(categoryQuest); // B品質以上必要
      const lowQualityItem: ICraftedItem = {
        ...medicineItem,
        quality: Quality.C, // 品質が足りない
      };
      const items = [createCraftedItem(lowQualityItem)];
      const inventory = createInventory([], items);

      const result = judgmentService.canDeliver(inventory, quest);

      expect(result.canDeliver).toBe(false);
    });

    it('カテゴリ条件で納品可能か判定できる', () => {
      // medicineItemはMEDICINEカテゴリとして扱う（実際にはcategoryの情報が必要）
      // このテストではカテゴリ判定のロジックを確認
      const quest = createQuest(categoryQuest);
      const highQualityMedicine: ICraftedItem = {
        ...medicineItem,
        quality: Quality.A,
      };
      const items = [createCraftedItem(highQualityMedicine)];
      // カテゴリマッピングが必要なため、このテストは実装詳細に依存
      const inventory = createInventory([], items);

      // カテゴリが一致すれば納品可能
      const result = judgmentService.canDeliver(inventory, quest, {
        itemCategories: { 'medicine_1': ItemCategory.MEDICINE },
      });

      expect(result.canDeliver).toBe(true);
    });

    it('属性条件で納品可能か判定できる', () => {
      const quest = createQuest(attributeQuest); // FIRE属性50以上
      const items = [createCraftedItem(fireItem)]; // FIRE属性60
      const inventory = createInventory([], items);

      const result = judgmentService.canDeliver(inventory, quest);

      expect(result.canDeliver).toBe(true);
    });

    it('効果条件で納品可能か判定できる', () => {
      const quest = createQuest(effectQuest); // HEAL効果100以上
      const items = [createCraftedItem(healingPotionItem)]; // HEAL効果120
      const inventory = createInventory([], items);

      const result = judgmentService.canDeliver(inventory, quest);

      expect(result.canDeliver).toBe(true);
    });
  });

  describe('deliver（納品実行）', () => {
    it('納品成功時に報酬を計算できる', () => {
      const quest = createQuest(specificItemQuest);
      const items = [
        createCraftedItem(healingPotionItem),
        createCraftedItem(healingPotionItem),
      ];
      const inventory = createInventory([], items);

      const result = judgmentService.deliver(inventory, quest);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.reward.gold).toBeGreaterThan(0);
        expect(result.value.reward.contribution).toBeGreaterThan(0);
      }
    });

    it('納品時にアイテムが消費される', () => {
      const quest = createQuest(specificItemQuest); // 2個必要
      const items = [
        createCraftedItem(healingPotionItem),
        createCraftedItem(healingPotionItem),
        createCraftedItem(healingPotionItem), // 余分に1個
      ];
      const inventory = createInventory([], items);

      const result = judgmentService.deliver(inventory, quest);

      expect(result.success).toBe(true);
      if (result.success) {
        // 2個消費されて1個残る
        const remainingItems = result.value.inventory.items.filter(
          (i) => i.itemId === 'healing_potion'
        );
        expect(remainingItems.length).toBe(1);
      }
    });

    it('アイテム不足時は納品できない', () => {
      const quest = createQuest(specificItemQuest);
      const items = [createCraftedItem(healingPotionItem)]; // 1個しかない
      const inventory = createInventory([], items);

      const result = judgmentService.deliver(inventory, quest);

      expect(result.success).toBe(false);
    });
  });

  describe('calculateReward（報酬計算）', () => {
    it('基本報酬を計算できる', () => {
      const quest = createQuest(specificItemQuest);
      // C品質のアイテムを使用（基準品質なのでボーナスなし）
      const cQualityItem: ICraftedItem = {
        ...healingPotionItem,
        quality: Quality.C,
      };
      const items = [
        createCraftedItem(cQualityItem),
        createCraftedItem(cQualityItem),
      ];

      const reward = judgmentService.calculateReward(quest, items);

      expect(reward.gold).toBe(specificItemQuest.gold);
      expect(reward.contribution).toBe(specificItemQuest.contribution);
      expect(reward.qualityBonus).toBe(0);
    });

    it('品質ボーナスを計算できる', () => {
      const quest = createQuest(specificItemQuest);
      const highQualityItems = [
        createCraftedItem({ ...healingPotionItem, quality: Quality.S }),
        createCraftedItem({ ...healingPotionItem, quality: Quality.S }),
      ];

      const reward = judgmentService.calculateReward(quest, highQualityItems);

      // 高品質アイテムで納品するとボーナスがつく
      expect(reward.gold).toBeGreaterThan(specificItemQuest.gold);
      expect(reward.qualityBonus).toBeGreaterThan(0);
    });

    it('低品質でもペナルティはない（基本報酬のみ）', () => {
      const quest = createQuest(specificItemQuest);
      const lowQualityItems = [
        createCraftedItem({ ...healingPotionItem, quality: Quality.D }),
        createCraftedItem({ ...healingPotionItem, quality: Quality.D }),
      ];

      const reward = judgmentService.calculateReward(quest, lowQualityItems);

      // 低品質でも最低限の報酬はもらえる
      expect(reward.gold).toBeGreaterThanOrEqual(Math.floor(specificItemQuest.gold * 0.5));
      expect(reward.contribution).toBeGreaterThanOrEqual(Math.floor(specificItemQuest.contribution * 0.5));
    });
  });

  describe('期限切れ処理', () => {
    it('期限切れ依頼はペナルティが発生する', () => {
      const quest = createQuest(specificItemQuest);
      const activeQuest = createActiveQuest({
        quest,
        remainingDays: 0, // 期限切れ
        acceptedDay: 1,
      });

      const penalty = judgmentService.calculateExpiredPenalty(activeQuest);

      expect(penalty.gold).toBeLessThan(0); // ゴールドペナルティ
      expect(penalty.contribution).toBeLessThan(0); // 貢献度ペナルティ
    });

    it('期限内の依頼はペナルティなし', () => {
      const quest = createQuest(specificItemQuest);
      const activeQuest = createActiveQuest({
        quest,
        remainingDays: 2, // まだ期限内
        acceptedDay: 1,
      });

      const penalty = judgmentService.calculateExpiredPenalty(activeQuest);

      expect(penalty.gold).toBe(0);
      expect(penalty.contribution).toBe(0);
    });
  });

  describe('不変性', () => {
    it('deliverは元のインベントリを変更しない', () => {
      const quest = createQuest(specificItemQuest);
      const items = [
        createCraftedItem(healingPotionItem),
        createCraftedItem(healingPotionItem),
      ];
      const inventory = createInventory([], items);
      const originalItemCount = inventory.items.length;

      judgmentService.deliver(inventory, quest);

      expect(inventory.items.length).toBe(originalItemCount);
    });
  });
});
