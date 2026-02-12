/**
 * validate-quest.test.ts - 依頼バリデーションの純粋関数テスト
 *
 * TASK-0081: features/quest/services作成
 */

import type { ValidatableItem } from '@features/quest/services/validate-quest';
import {
  validateQuest,
  validateQuestWithMultipleItems,
} from '@features/quest/services/validate-quest';
import { toItemId } from '@shared/types';
import type { IQuestCondition } from '@shared/types/quests';
import { describe, expect, it } from 'vitest';

// =============================================================================
// テスト用モックデータ
// =============================================================================

function createItem(overrides: Partial<ValidatableItem> = {}): ValidatableItem {
  return {
    itemId: toItemId('item-001'),
    quality: 'B',
    category: 'MEDICINE',
    hasAttributes: true,
    hasEffects: true,
    ...overrides,
  };
}

// =============================================================================
// テスト
// =============================================================================

describe('validateQuest', () => {
  describe('SPECIFIC条件', () => {
    it('アイテムIDが一致する場合はvalidがtrueになる', () => {
      const condition: IQuestCondition = { type: 'SPECIFIC', itemId: 'item-001' };
      const item = createItem({ itemId: toItemId('item-001') });

      const result = validateQuest(condition, item);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('アイテムIDが一致しない場合はvalidがfalseになる', () => {
      const condition: IQuestCondition = { type: 'SPECIFIC', itemId: 'item-001' };
      const item = createItem({ itemId: toItemId('item-999') });

      const result = validateQuest(condition, item);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.message).toContain('指定アイテムと一致しません');
    });
  });

  describe('CATEGORY条件', () => {
    it('カテゴリが一致する場合はvalidがtrueになる', () => {
      const condition: IQuestCondition = { type: 'CATEGORY', category: 'MEDICINE' };
      const item = createItem({ category: 'MEDICINE' });

      const result = validateQuest(condition, item);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('カテゴリが一致しない場合はvalidがfalseになる', () => {
      const condition: IQuestCondition = { type: 'CATEGORY', category: 'WEAPON' };
      const item = createItem({ category: 'MEDICINE' });

      const result = validateQuest(condition, item);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.message).toContain('カテゴリが一致しません');
    });
  });

  describe('QUALITY条件', () => {
    it('品質が条件以上の場合はvalidがtrueになる', () => {
      const condition: IQuestCondition = { type: 'QUALITY', minQuality: 'C' };
      const item = createItem({ quality: 'A' });

      const result = validateQuest(condition, item);

      expect(result.valid).toBe(true);
    });

    it('品質が条件と同じ場合はvalidがtrueになる', () => {
      const condition: IQuestCondition = { type: 'QUALITY', minQuality: 'B' };
      const item = createItem({ quality: 'B' });

      const result = validateQuest(condition, item);

      expect(result.valid).toBe(true);
    });

    it('品質が条件未満の場合はvalidがfalseになる', () => {
      const condition: IQuestCondition = { type: 'QUALITY', minQuality: 'A' };
      const item = createItem({ quality: 'C' });

      const result = validateQuest(condition, item);

      expect(result.valid).toBe(false);
      expect(result.errors[0]?.message).toContain('品質が不足しています');
    });

    it('minQualityが未指定の場合はvalidがtrueになる', () => {
      const condition: IQuestCondition = { type: 'QUALITY' };
      const item = createItem({ quality: 'D' });

      const result = validateQuest(condition, item);

      expect(result.valid).toBe(true);
    });
  });

  describe('QUANTITY条件', () => {
    it('単品チェックでは常にvalidがtrueになる', () => {
      const condition: IQuestCondition = { type: 'QUANTITY', quantity: 3 };
      const item = createItem();

      const result = validateQuest(condition, item);

      expect(result.valid).toBe(true);
    });
  });

  describe('ATTRIBUTE条件', () => {
    it('属性を持つアイテムの場合はvalidがtrueになる', () => {
      const condition: IQuestCondition = { type: 'ATTRIBUTE' };
      const item = createItem({ hasAttributes: true });

      const result = validateQuest(condition, item);

      expect(result.valid).toBe(true);
    });

    it('属性を持たないアイテムの場合はvalidがfalseになる', () => {
      const condition: IQuestCondition = { type: 'ATTRIBUTE' };
      const item = createItem({ hasAttributes: false });

      const result = validateQuest(condition, item);

      expect(result.valid).toBe(false);
      expect(result.errors[0]?.message).toContain('属性を持つアイテムが必要です');
    });
  });

  describe('EFFECT条件', () => {
    it('効果を持つアイテムの場合はvalidがtrueになる', () => {
      const condition: IQuestCondition = { type: 'EFFECT' };
      const item = createItem({ hasEffects: true });

      const result = validateQuest(condition, item);

      expect(result.valid).toBe(true);
    });

    it('効果を持たないアイテムの場合はvalidがfalseになる', () => {
      const condition: IQuestCondition = { type: 'EFFECT' };
      const item = createItem({ hasEffects: false });

      const result = validateQuest(condition, item);

      expect(result.valid).toBe(false);
      expect(result.errors[0]?.message).toContain('効果を持つアイテムが必要です');
    });
  });

  describe('MATERIAL条件', () => {
    it('現在は常にvalidがtrueになる（将来実装）', () => {
      const condition: IQuestCondition = { type: 'MATERIAL' };
      const item = createItem();

      const result = validateQuest(condition, item);

      expect(result.valid).toBe(true);
    });
  });

  describe('COMPOUND条件', () => {
    it('すべてのサブ条件を満たす場合はvalidがtrueになる', () => {
      const condition: IQuestCondition = {
        type: 'COMPOUND',
        subConditions: [
          { type: 'QUALITY', minQuality: 'C' },
          { type: 'CATEGORY', category: 'MEDICINE' },
        ],
      };
      const item = createItem({ quality: 'A', category: 'MEDICINE' });

      const result = validateQuest(condition, item);

      expect(result.valid).toBe(true);
    });

    it('いずれかのサブ条件を満たさない場合はvalidがfalseになる', () => {
      const condition: IQuestCondition = {
        type: 'COMPOUND',
        subConditions: [
          { type: 'QUALITY', minQuality: 'A' },
          { type: 'CATEGORY', category: 'WEAPON' },
        ],
      };
      const item = createItem({ quality: 'C', category: 'MEDICINE' });

      const result = validateQuest(condition, item);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(1);
    });

    it('サブ条件が空の場合はvalidがfalseになる', () => {
      const condition: IQuestCondition = {
        type: 'COMPOUND',
        subConditions: [],
      };
      const item = createItem();

      const result = validateQuest(condition, item);

      expect(result.valid).toBe(false);
    });

    it('subConditionsがundefinedの場合はvalidがfalseになる', () => {
      const condition: IQuestCondition = { type: 'COMPOUND' };
      const item = createItem();

      const result = validateQuest(condition, item);

      expect(result.valid).toBe(false);
    });
  });
});

describe('validateQuestWithMultipleItems', () => {
  describe('QUANTITY条件', () => {
    it('アイテム数が要求数以上の場合はvalidがtrueになる', () => {
      const condition: IQuestCondition = { type: 'QUANTITY', quantity: 2 };
      const items = [createItem(), createItem()];

      const result = validateQuestWithMultipleItems(condition, items);

      expect(result.valid).toBe(true);
    });

    it('アイテム数が要求数未満の場合はvalidがfalseになる', () => {
      const condition: IQuestCondition = { type: 'QUANTITY', quantity: 3 };
      const items = [createItem(), createItem()];

      const result = validateQuestWithMultipleItems(condition, items);

      expect(result.valid).toBe(false);
      expect(result.errors[0]?.message).toContain('数量が不足しています');
    });
  });

  describe('単品条件', () => {
    it('いずれかのアイテムが条件を満たせばvalidがtrueになる', () => {
      const condition: IQuestCondition = { type: 'SPECIFIC', itemId: 'item-001' };
      const items = [
        createItem({ itemId: toItemId('item-999') }),
        createItem({ itemId: toItemId('item-001') }),
      ];

      const result = validateQuestWithMultipleItems(condition, items);

      expect(result.valid).toBe(true);
    });

    it('どのアイテムも条件を満たさない場合はvalidがfalseになる', () => {
      const condition: IQuestCondition = { type: 'SPECIFIC', itemId: 'item-001' };
      const items = [
        createItem({ itemId: toItemId('item-888') }),
        createItem({ itemId: toItemId('item-999') }),
      ];

      const result = validateQuestWithMultipleItems(condition, items);

      expect(result.valid).toBe(false);
    });

    it('空の配列の場合はvalidがfalseになる', () => {
      const condition: IQuestCondition = { type: 'SPECIFIC', itemId: 'item-001' };

      const result = validateQuestWithMultipleItems(condition, []);

      expect(result.valid).toBe(false);
    });
  });

  describe('COMPOUND条件', () => {
    it('各サブ条件について検証する', () => {
      const condition: IQuestCondition = {
        type: 'COMPOUND',
        subConditions: [
          { type: 'QUALITY', minQuality: 'B' },
          { type: 'QUANTITY', quantity: 2 },
        ],
      };
      const items = [createItem({ quality: 'A' }), createItem({ quality: 'B' })];

      const result = validateQuestWithMultipleItems(condition, items);

      expect(result.valid).toBe(true);
    });
  });
});
