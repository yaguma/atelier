/**
 * Quest エンティティ テストケース
 * TASK-0013 依頼エンティティ・QuestService実装
 *
 * @description
 * T-0013-E01 〜 T-0013-E16: Questエンティティの単体テスト
 */

import { ItemInstance } from '@domain/entities/ItemInstance';
import { MaterialInstance } from '@domain/entities/MaterialInstance';
import { QUALITY_ORDER, QUEST_TYPE_MULTIPLIER, Quest } from '@domain/entities/Quest';
import type { IClient, IItem, IQuest, IQuestCondition } from '@shared/types';
import { ItemCategory, Quality, toClientId, toItemId, toQuestId } from '@shared/types';
import type { QuestDifficulty } from '@shared/types/quests';
import { describe, expect, it } from 'vitest';

// =============================================================================
// モックデータ
// =============================================================================

/**
 * モック依頼者を作成
 */
function createMockClient(
  id: string,
  type: 'VILLAGER' | 'ADVENTURER' | 'MERCHANT' | 'NOBLE' | 'GUILD' = 'VILLAGER',
  contributionMultiplier = 1.0,
  goldMultiplier = 1.0,
): IClient {
  return {
    id: toClientId(id),
    name: `依頼者_${id}`,
    type,
    contributionMultiplier,
    goldMultiplier,
    flavorText: `依頼者${id}のフレーバーテキスト`,
  };
}

/**
 * モック依頼を作成
 */
function createMockQuest(
  id: string,
  clientId: string,
  condition: IQuestCondition,
  contribution = 100,
  gold = 50,
  deadline = 7,
  difficulty: QuestDifficulty = 'NORMAL',
): IQuest {
  return {
    id: toQuestId(id),
    clientId: toClientId(clientId),
    condition,
    contribution,
    gold,
    deadline,
    difficulty,
    flavorText: `依頼${id}のフレーバーテキスト`,
  };
}

/**
 * モックアイテムマスターを作成
 */
function createMockItemMaster(
  id: string,
  name: string,
  category: ItemCategory = ItemCategory.MEDICINE,
  attributes?: string[],
  effects?: string[],
): IItem {
  return {
    id: toItemId(id),
    name,
    category,
    description: `${name}の説明`,
    attributes,
    effects,
  } as IItem;
}

/**
 * モックアイテムインスタンスを作成
 */
function createMockItemInstance(
  itemId: string,
  quality: Quality,
  category: ItemCategory = ItemCategory.MEDICINE,
  attributes?: string[],
  effects?: string[],
): ItemInstance {
  const master = createMockItemMaster(itemId, `${itemId}の名前`, category, attributes, effects);
  // 属性がある場合は、その属性を持つモック素材を usedMaterials に含める
  const usedMaterials: MaterialInstance[] = [];
  if (attributes && attributes.length > 0) {
    const mockMaterialMaster = {
      id: toItemId('mock_material'),
      name: 'モック素材',
      baseQuality: quality,
      attributes: attributes as unknown as import('@shared/types').Attribute[],
      description: 'テスト用モック素材',
    };
    usedMaterials.push(
      new MaterialInstance(
        `material_${Date.now()}_${Math.random()}`,
        mockMaterialMaster as unknown as import('@shared/types').IMaterial,
        quality,
      ),
    );
  }
  return new ItemInstance(`item_${Date.now()}_${Math.random()}`, master, quality, usedMaterials);
}

// =============================================================================
// テスト
// =============================================================================

describe('Quest', () => {
  // =============================================================================
  // T-0013-E01〜E03: コンストラクタ・基本プロパティ
  // =============================================================================

  describe('コンストラクタ', () => {
    it('T-0013-E01: Questインスタンスが正しいプロパティで生成されること', () => {
      // 【テスト目的】: Questが正しく生成されること
      // 【テスト内容】: data, clientが正しく設定される
      // 【期待される動作】: すべてのプロパティが正しく保持される
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const condition: IQuestCondition = { type: 'SPECIFIC', itemId: toItemId('potion') };
      const questData = createMockQuest('quest_001', 'client_001', condition);
      const client = createMockClient('client_001');

      // Act
      const quest = new Quest(questData, client);

      // Assert
      expect(quest.data).toBe(questData);
      expect(quest.client).toBe(client);
    });

    it('T-0013-E02: 基本getterが正しく動作すること', () => {
      // 【テスト目的】: 各getterが正しい値を返すこと
      // 【テスト内容】: id, clientId, condition, baseContribution, baseGold, deadline, difficulty, flavorText
      // 【期待される動作】: data.xxxをそのまま返す
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const condition: IQuestCondition = { type: 'CATEGORY', category: ItemCategory.MEDICINE };
      const questData = createMockQuest('quest_002', 'client_002', condition, 200, 100, 10, 'HARD');
      const client = createMockClient('client_002');

      // Act
      const quest = new Quest(questData, client);

      // Assert
      expect(quest.id).toBe(questData.id);
      expect(quest.clientId).toBe(questData.clientId);
      expect(quest.condition).toBe(questData.condition);
      expect(quest.baseContribution).toBe(200);
      expect(quest.baseGold).toBe(100);
      expect(quest.deadline).toBe(10);
      expect(quest.difficulty).toBe('HARD');
      expect(quest.flavorText).toBe(questData.flavorText);
    });

    it('T-0013-E03: 依頼タイプ補正・依頼者補正getterが正しく動作すること', () => {
      // 【テスト目的】: typeMultiplier, clientContributionMultiplier, clientGoldMultiplierが正しい値を返すこと
      // 【テスト内容】: SPECIFIC依頼タイプ、MERCHANT依頼者
      // 【期待される動作】: 各補正値が正しく返される
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const condition: IQuestCondition = { type: 'SPECIFIC', itemId: toItemId('potion') };
      const questData = createMockQuest('quest_003', 'client_003', condition);
      const client = createMockClient('client_003', 'MERCHANT', 0.8, 1.5);

      // Act
      const quest = new Quest(questData, client);

      // Assert
      expect(quest.typeMultiplier).toBe(QUEST_TYPE_MULTIPLIER.SPECIFIC);
      expect(quest.clientContributionMultiplier).toBe(0.8);
      expect(quest.clientGoldMultiplier).toBe(1.5);
    });
  });

  // =============================================================================
  // T-0013-E04〜E11: 条件判定テスト
  // =============================================================================

  describe('checkCondition', () => {
    it('T-0013-E04: SPECIFIC条件 - アイテムIDが一致する場合true', () => {
      // 【テスト目的】: SPECIFIC条件が正しく判定されること
      // 【テスト内容】: 指定したitemIdと一致するアイテムを納品
      // 【期待される動作】: true
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const condition: IQuestCondition = { type: 'SPECIFIC', itemId: toItemId('potion') };
      const questData = createMockQuest('quest_004', 'client_004', condition);
      const client = createMockClient('client_004');
      const quest = new Quest(questData, client);
      const item = createMockItemInstance('potion', Quality.B);

      // Act & Assert
      expect(quest.checkCondition(condition, item)).toBe(true);
    });

    it('T-0013-E05: SPECIFIC条件 - アイテムIDが一致しない場合false', () => {
      // 【テスト目的】: SPECIFIC条件が正しく判定されること
      // 【テスト内容】: 異なるitemIdのアイテムを納品
      // 【期待される動作】: false
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const condition: IQuestCondition = { type: 'SPECIFIC', itemId: toItemId('potion') };
      const questData = createMockQuest('quest_005', 'client_005', condition);
      const client = createMockClient('client_005');
      const quest = new Quest(questData, client);
      const item = createMockItemInstance('elixir', Quality.B);

      // Act & Assert
      expect(quest.checkCondition(condition, item)).toBe(false);
    });

    it('T-0013-E06: CATEGORY条件 - カテゴリが一致する場合true', () => {
      // 【テスト目的】: CATEGORY条件が正しく判定されること
      // 【テスト内容】: 指定したcategoryと一致するアイテムを納品
      // 【期待される動作】: true
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const condition: IQuestCondition = { type: 'CATEGORY', category: ItemCategory.MEDICINE };
      const questData = createMockQuest('quest_006', 'client_006', condition);
      const client = createMockClient('client_006');
      const quest = new Quest(questData, client);
      const item = createMockItemInstance('potion', Quality.B, ItemCategory.MEDICINE);

      // Act & Assert
      expect(quest.checkCondition(condition, item)).toBe(true);
    });

    it('T-0013-E07: CATEGORY条件 - カテゴリが一致しない場合false', () => {
      // 【テスト目的】: CATEGORY条件が正しく判定されること
      // 【テスト内容】: 異なるcategoryのアイテムを納品
      // 【期待される動作】: false
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const condition: IQuestCondition = { type: 'CATEGORY', category: ItemCategory.MEDICINE };
      const questData = createMockQuest('quest_007', 'client_007', condition);
      const client = createMockClient('client_007');
      const quest = new Quest(questData, client);
      const item = createMockItemInstance('sword', Quality.B, ItemCategory.WEAPON);

      // Act & Assert
      expect(quest.checkCondition(condition, item)).toBe(false);
    });

    it('T-0013-E08: QUALITY条件 - 品質以上の場合true', () => {
      // 【テスト目的】: QUALITY条件が正しく判定されること
      // 【テスト内容】: minQuality=Bに対してA品質のアイテムを納品
      // 【期待される動作】: true
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const condition: IQuestCondition = { type: 'QUALITY', minQuality: Quality.B };
      const questData = createMockQuest('quest_008', 'client_008', condition);
      const client = createMockClient('client_008');
      const quest = new Quest(questData, client);
      const item = createMockItemInstance('potion', Quality.A);

      // Act & Assert
      expect(quest.checkCondition(condition, item)).toBe(true);
    });

    it('T-0013-E09: QUALITY条件 - 品質未満の場合false', () => {
      // 【テスト目的】: QUALITY条件が正しく判定されること
      // 【テスト内容】: minQuality=Bに対してC品質のアイテムを納品
      // 【期待される動作】: false
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const condition: IQuestCondition = { type: 'QUALITY', minQuality: Quality.B };
      const questData = createMockQuest('quest_009', 'client_009', condition);
      const client = createMockClient('client_009');
      const quest = new Quest(questData, client);
      const item = createMockItemInstance('potion', Quality.C);

      // Act & Assert
      expect(quest.checkCondition(condition, item)).toBe(false);
    });

    it('T-0013-E10: QUALITY条件 - minQualityがundefinedの場合true', () => {
      // 【テスト目的】: QUALITY条件でminQualityが未指定の場合
      // 【テスト内容】: minQualityなしの条件で任意のアイテムを納品
      // 【期待される動作】: true
      // 🟡 信頼性レベル: 設計文書から妥当に推測

      // Arrange
      const condition: IQuestCondition = { type: 'QUALITY' };
      const questData = createMockQuest('quest_010', 'client_010', condition);
      const client = createMockClient('client_010');
      const quest = new Quest(questData, client);
      const item = createMockItemInstance('potion', Quality.D);

      // Act & Assert
      expect(quest.checkCondition(condition, item)).toBe(true);
    });

    it('T-0013-E11: QUANTITY条件 - 常にtrue', () => {
      // 【テスト目的】: QUANTITY条件が正しく判定されること
      // 【テスト内容】: 単品判定では常にtrue（複数アイテムの判定は呼び出し元で行う）
      // 【期待される動作】: true
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const condition: IQuestCondition = { type: 'QUANTITY', requiredQuantity: 5 };
      const questData = createMockQuest('quest_011', 'client_011', condition);
      const client = createMockClient('client_011');
      const quest = new Quest(questData, client);
      const item = createMockItemInstance('potion', Quality.B);

      // Act & Assert
      expect(quest.checkCondition(condition, item)).toBe(true);
    });

    it('T-0013-E12: ATTRIBUTE条件 - 属性が存在する場合true', () => {
      // 【テスト目的】: ATTRIBUTE条件が正しく判定されること
      // 【テスト内容】: 属性を持つアイテムを納品
      // 【期待される動作】: true
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const condition: IQuestCondition = { type: 'ATTRIBUTE', requiredAttribute: 'fire' };
      const questData = createMockQuest('quest_012', 'client_012', condition);
      const client = createMockClient('client_012');
      const quest = new Quest(questData, client);
      const item = createMockItemInstance('fire_potion', Quality.B, ItemCategory.MEDICINE, [
        'fire',
      ]);

      // Act & Assert
      expect(quest.checkCondition(condition, item)).toBe(true);
    });

    it('T-0013-E13: EFFECT条件 - 効果が存在する場合true', () => {
      // 【テスト目的】: EFFECT条件が正しく判定されること
      // 【テスト内容】: 効果を持つアイテムを納品
      // 【期待される動作】: true
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const condition: IQuestCondition = { type: 'EFFECT', requiredEffect: 'heal' };
      const questData = createMockQuest('quest_013', 'client_013', condition);
      const client = createMockClient('client_013');
      const quest = new Quest(questData, client);
      const item = createMockItemInstance(
        'heal_potion',
        Quality.B,
        ItemCategory.MEDICINE,
        undefined,
        ['heal'],
      );

      // Act & Assert
      expect(quest.checkCondition(condition, item)).toBe(true);
    });

    it('T-0013-E14: MATERIAL条件 - 常にtrue（将来実装）', () => {
      // 【テスト目的】: MATERIAL条件が正しく判定されること
      // 【テスト内容】: レア素材使用数判定は将来実装のため常にtrue
      // 【期待される動作】: true
      // 🟡 信頼性レベル: 設計文書から妥当に推測

      // Arrange
      const condition: IQuestCondition = { type: 'MATERIAL', requiredRareMaterials: 3 };
      const questData = createMockQuest('quest_014', 'client_014', condition);
      const client = createMockClient('client_014');
      const quest = new Quest(questData, client);
      const item = createMockItemInstance('potion', Quality.B);

      // Act & Assert
      expect(quest.checkCondition(condition, item)).toBe(true);
    });

    it('T-0013-E15: COMPOUND条件 - すべての子条件を満たす場合true', () => {
      // 【テスト目的】: COMPOUND条件が正しく判定されること
      // 【テスト内容】: 複数の子条件をすべて満たすアイテムを納品
      // 【期待される動作】: true
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const condition: IQuestCondition = {
        type: 'COMPOUND',
        subConditions: [
          { type: 'CATEGORY', category: ItemCategory.MEDICINE },
          { type: 'QUALITY', minQuality: Quality.B },
        ],
      };
      const questData = createMockQuest('quest_015', 'client_015', condition);
      const client = createMockClient('client_015');
      const quest = new Quest(questData, client);
      const item = createMockItemInstance('potion', Quality.A, ItemCategory.MEDICINE);

      // Act & Assert
      expect(quest.checkCondition(condition, item)).toBe(true);
    });

    it('T-0013-E16: COMPOUND条件 - 子条件を1つでも満たさない場合false', () => {
      // 【テスト目的】: COMPOUND条件が正しく判定されること
      // 【テスト内容】: 複数の子条件のうち1つを満たさないアイテムを納品
      // 【期待される動作】: false
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const condition: IQuestCondition = {
        type: 'COMPOUND',
        subConditions: [
          { type: 'CATEGORY', category: ItemCategory.MEDICINE },
          { type: 'QUALITY', minQuality: Quality.A },
        ],
      };
      const questData = createMockQuest('quest_016', 'client_016', condition);
      const client = createMockClient('client_016');
      const quest = new Quest(questData, client);
      const item = createMockItemInstance('potion', Quality.C, ItemCategory.MEDICINE);

      // Act & Assert
      expect(quest.checkCondition(condition, item)).toBe(false);
    });
  });

  // =============================================================================
  // T-0013-E17〜E18: canDeliver
  // =============================================================================

  describe('canDeliver', () => {
    it('T-0013-E17: 条件を満たすアイテムで納品可能', () => {
      // 【テスト目的】: canDeliverが正しく動作すること
      // 【テスト内容】: 条件を満たすアイテムを渡す
      // 【期待される動作】: true
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const condition: IQuestCondition = { type: 'SPECIFIC', itemId: toItemId('potion') };
      const questData = createMockQuest('quest_017', 'client_017', condition);
      const client = createMockClient('client_017');
      const quest = new Quest(questData, client);
      const item = createMockItemInstance('potion', Quality.B);

      // Act & Assert
      expect(quest.canDeliver(item)).toBe(true);
    });

    it('T-0013-E18: 条件を満たさないアイテムで納品不可', () => {
      // 【テスト目的】: canDeliverが正しく動作すること
      // 【テスト内容】: 条件を満たさないアイテムを渡す
      // 【期待される動作】: false
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const condition: IQuestCondition = { type: 'SPECIFIC', itemId: toItemId('potion') };
      const questData = createMockQuest('quest_018', 'client_018', condition);
      const client = createMockClient('client_018');
      const quest = new Quest(questData, client);
      const item = createMockItemInstance('elixir', Quality.B);

      // Act & Assert
      expect(quest.canDeliver(item)).toBe(false);
    });
  });

  // =============================================================================
  // T-0013-E19〜E24: 報酬計算テスト
  // =============================================================================

  describe('calculateContribution', () => {
    it('T-0013-E19: D品質での貢献度計算（係数0.5）', () => {
      // 【テスト目的】: D品質の貢献度計算が正しく動作すること
      // 【テスト内容】: baseContribution=100, quality=D, typeMultiplier=1.0, clientMultiplier=1.0
      // 【期待される動作】: 50（100 × 0.5 × 1.0 × 1.0）
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const condition: IQuestCondition = { type: 'SPECIFIC', itemId: toItemId('potion') };
      const questData = createMockQuest('quest_019', 'client_019', condition, 100);
      const client = createMockClient('client_019', 'VILLAGER', 1.0, 1.0);
      const quest = new Quest(questData, client);
      const item = createMockItemInstance('potion', Quality.D);

      // Act
      const contribution = quest.calculateContribution(item);

      // Assert
      expect(contribution).toBe(50);
    });

    it('T-0013-E20: S品質での貢献度計算（係数3.0）', () => {
      // 【テスト目的】: S品質の貢献度計算が正しく動作すること
      // 【テスト内容】: baseContribution=100, quality=S, typeMultiplier=1.0, clientMultiplier=1.0
      // 【期待される動作】: 300（100 × 3.0 × 1.0 × 1.0）
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const condition: IQuestCondition = { type: 'SPECIFIC', itemId: toItemId('potion') };
      const questData = createMockQuest('quest_020', 'client_020', condition, 100);
      const client = createMockClient('client_020', 'VILLAGER', 1.0, 1.0);
      const quest = new Quest(questData, client);
      const item = createMockItemInstance('potion', Quality.S);

      // Act
      const contribution = quest.calculateContribution(item);

      // Assert
      expect(contribution).toBe(300);
    });

    it('T-0013-E21: 依頼タイプ補正込みの貢献度計算', () => {
      // 【テスト目的】: 依頼タイプ補正が適用されること
      // 【テスト内容】: COMPOUND依頼タイプ（係数1.8）
      // 【期待される動作】: 180（100 × 1.0 × 1.8 × 1.0）
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const condition: IQuestCondition = {
        type: 'COMPOUND',
        subConditions: [{ type: 'QUALITY', minQuality: Quality.C }],
      };
      const questData = createMockQuest('quest_021', 'client_021', condition, 100);
      const client = createMockClient('client_021', 'VILLAGER', 1.0, 1.0);
      const quest = new Quest(questData, client);
      const item = createMockItemInstance('potion', Quality.C);

      // Act
      const contribution = quest.calculateContribution(item);

      // Assert
      expect(contribution).toBe(180); // 100 × 1.0 × 1.8 × 1.0
    });

    it('T-0013-E22: 依頼者補正込みの貢献度計算', () => {
      // 【テスト目的】: 依頼者補正が適用されること
      // 【テスト内容】: clientContributionMultiplier=1.5
      // 【期待される動作】: 150（100 × 1.0 × 1.0 × 1.5）
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const condition: IQuestCondition = { type: 'SPECIFIC', itemId: toItemId('potion') };
      const questData = createMockQuest('quest_022', 'client_022', condition, 100);
      const client = createMockClient('client_022', 'GUILD', 1.5, 1.0);
      const quest = new Quest(questData, client);
      const item = createMockItemInstance('potion', Quality.C);

      // Act
      const contribution = quest.calculateContribution(item);

      // Assert
      expect(contribution).toBe(150); // 100 × 1.0 × 1.0 × 1.5
    });
  });

  describe('calculateGold', () => {
    it('T-0013-E23: D品質でのゴールド計算（係数0.5）', () => {
      // 【テスト目的】: D品質のゴールド計算が正しく動作すること
      // 【テスト内容】: baseGold=100, quality=D, clientGoldMultiplier=1.0
      // 【期待される動作】: 50（100 × 0.5 × 1.0）
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const condition: IQuestCondition = { type: 'SPECIFIC', itemId: toItemId('potion') };
      const questData = createMockQuest('quest_023', 'client_023', condition, 100, 100);
      const client = createMockClient('client_023', 'VILLAGER', 1.0, 1.0);
      const quest = new Quest(questData, client);
      const item = createMockItemInstance('potion', Quality.D);

      // Act
      const gold = quest.calculateGold(item);

      // Assert
      expect(gold).toBe(50);
    });

    it('T-0013-E24: 依頼者補正込みのゴールド計算', () => {
      // 【テスト目的】: 依頼者補正がゴールド計算に適用されること
      // 【テスト内容】: clientGoldMultiplier=2.0
      // 【期待される動作】: 200（100 × 1.0 × 2.0）
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const condition: IQuestCondition = { type: 'SPECIFIC', itemId: toItemId('potion') };
      const questData = createMockQuest('quest_024', 'client_024', condition, 100, 100);
      const client = createMockClient('client_024', 'NOBLE', 1.0, 2.0);
      const quest = new Quest(questData, client);
      const item = createMockItemInstance('potion', Quality.C);

      // Act
      const gold = quest.calculateGold(item);

      // Assert
      expect(gold).toBe(200); // 100 × 1.0 × 2.0
    });
  });

  // =============================================================================
  // TC-CONST: 定数テスト
  // =============================================================================

  describe('定数', () => {
    it('TC-QUEST-CONST-001: QUALITY_ORDERが正しく定義されていること', () => {
      // 【テスト目的】: QUALITY_ORDER定数が正しく定義されていること
      // 【テスト内容】: 各品質の順序値を確認
      // 【期待される動作】: D=1, C=2, B=3, A=4, S=5
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      expect(QUALITY_ORDER.D).toBe(1);
      expect(QUALITY_ORDER.C).toBe(2);
      expect(QUALITY_ORDER.B).toBe(3);
      expect(QUALITY_ORDER.A).toBe(4);
      expect(QUALITY_ORDER.S).toBe(5);
    });

    it('TC-QUEST-CONST-002: QUEST_TYPE_MULTIPLIERが正しく定義されていること', () => {
      // 【テスト目的】: QUEST_TYPE_MULTIPLIER定数が正しく定義されていること
      // 【テスト内容】: 各依頼タイプの補正値を確認
      // 【期待される動作】: 設計文書通りの値
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      expect(QUEST_TYPE_MULTIPLIER.SPECIFIC).toBe(1.0);
      expect(QUEST_TYPE_MULTIPLIER.CATEGORY).toBe(0.8);
      expect(QUEST_TYPE_MULTIPLIER.QUALITY).toBe(1.2);
      expect(QUEST_TYPE_MULTIPLIER.QUANTITY).toBe(0.7);
      expect(QUEST_TYPE_MULTIPLIER.ATTRIBUTE).toBe(1.3);
      expect(QUEST_TYPE_MULTIPLIER.EFFECT).toBe(1.3);
      expect(QUEST_TYPE_MULTIPLIER.MATERIAL).toBe(1.5);
      expect(QUEST_TYPE_MULTIPLIER.COMPOUND).toBe(1.8);
    });
  });
});
