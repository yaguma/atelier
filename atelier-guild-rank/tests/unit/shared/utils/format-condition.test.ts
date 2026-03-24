/**
 * format-condition テスト
 * Issue #428: リゾルバ注入時のユニットテスト追加
 *
 * @description
 * formatCondition の各条件タイプとオプション動作を検証する。
 */

import { type FormatConditionInput, formatCondition } from '@shared/utils/format-condition';
import { describe, expect, it } from 'vitest';

describe('formatCondition', () => {
  describe('条件タイプ別フォーマット', () => {
    it('SPECIFIC: itemIdとリゾルバがある場合、解決された日本語名を使用する', () => {
      const condition: FormatConditionInput = { type: 'SPECIFIC', itemId: 'item_001' };
      const resolver = (id: string) => (id === 'item_001' ? '癒しの軟膏' : id);

      const result = formatCondition(condition, { itemNameResolver: resolver });

      expect(result).toBe('癒しの軟膏を納品');
    });

    it('SPECIFIC: itemIdがあるがリゾルバがない場合、itemIdをそのまま使用する', () => {
      const condition: FormatConditionInput = { type: 'SPECIFIC', itemId: 'item_001' };

      const result = formatCondition(condition);

      expect(result).toBe('item_001を納品');
    });

    it('SPECIFIC: itemIdがない場合、「指定品」を使用する', () => {
      const condition: FormatConditionInput = { type: 'SPECIFIC' };

      const result = formatCondition(condition);

      expect(result).toBe('指定品を納品');
    });

    it('CATEGORY: カテゴリ名を使用する', () => {
      const condition: FormatConditionInput = { type: 'CATEGORY', category: '薬品' };

      const result = formatCondition(condition);

      expect(result).toBe('薬品の品を納品');
    });

    it('CATEGORY: カテゴリがない場合、デフォルト値を使用する', () => {
      const condition: FormatConditionInput = { type: 'CATEGORY' };

      const result = formatCondition(condition);

      expect(result).toBe('カテゴリの品を納品');
    });

    it('QUALITY: 品質閾値を表示する', () => {
      const condition: FormatConditionInput = { type: 'QUALITY', minQuality: 'B' };

      const result = formatCondition(condition);

      expect(result).toBe('品質B以上');
    });

    it('QUALITY: minQualityがない場合、デフォルト値Dを使用する', () => {
      const condition: FormatConditionInput = { type: 'QUALITY' };

      const result = formatCondition(condition);

      expect(result).toBe('品質D以上');
    });

    it('QUANTITY: 数量を表示する', () => {
      const condition: FormatConditionInput = { type: 'QUANTITY', quantity: 3 };

      const result = formatCondition(condition);

      expect(result).toBe('3個納品');
    });

    it('QUANTITY: quantityがない場合、デフォルト値1を使用する', () => {
      const condition: FormatConditionInput = { type: 'QUANTITY' };

      const result = formatCondition(condition);

      expect(result).toBe('1個納品');
    });

    it('ATTRIBUTE: 固定テキストを返す', () => {
      const condition: FormatConditionInput = { type: 'ATTRIBUTE' };

      const result = formatCondition(condition);

      expect(result).toBe('特定属性が必要');
    });

    it('EFFECT: 固定テキストを返す', () => {
      const condition: FormatConditionInput = { type: 'EFFECT' };

      const result = formatCondition(condition);

      expect(result).toBe('特定効果が必要');
    });

    it('MATERIAL: 固定テキストを返す', () => {
      const condition: FormatConditionInput = { type: 'MATERIAL' };

      const result = formatCondition(condition);

      expect(result).toBe('レア素材を使用');
    });

    it('COMPOUND: 固定テキストを返す', () => {
      const condition: FormatConditionInput = { type: 'COMPOUND' };

      const result = formatCondition(condition);

      expect(result).toBe('複合条件');
    });

    it('未知の条件タイプの場合、タイプ文字列をそのまま返す', () => {
      const condition: FormatConditionInput = { type: 'UNKNOWN_TYPE' };

      const result = formatCondition(condition);

      expect(result).toBe('UNKNOWN_TYPE');
    });
  });

  describe('withPrefixオプション', () => {
    it('withPrefix=trueの場合、「条件: 」プレフィックスが付与される', () => {
      const condition: FormatConditionInput = { type: 'QUANTITY', quantity: 5 };

      const result = formatCondition(condition, { withPrefix: true });

      expect(result).toBe('条件: 5個納品');
    });

    it('withPrefix=falseの場合、プレフィックスは付与されない', () => {
      const condition: FormatConditionInput = { type: 'QUANTITY', quantity: 5 };

      const result = formatCondition(condition, { withPrefix: false });

      expect(result).toBe('5個納品');
    });

    it('withPrefixが未指定の場合、プレフィックスは付与されない', () => {
      const condition: FormatConditionInput = { type: 'QUANTITY', quantity: 5 };

      const result = formatCondition(condition);

      expect(result).toBe('5個納品');
    });

    it('withPrefix=trueとitemNameResolverを組み合わせて使用できる', () => {
      const condition: FormatConditionInput = { type: 'SPECIFIC', itemId: 'item_002' };
      const resolver = (id: string) => (id === 'item_002' ? '火の結晶' : id);

      const result = formatCondition(condition, {
        itemNameResolver: resolver,
        withPrefix: true,
      });

      expect(result).toBe('条件: 火の結晶を納品');
    });
  });

  describe('itemNameResolver', () => {
    it('リゾルバが名前を解決できない場合、itemIdがフォールバックとして使用される', () => {
      const condition: FormatConditionInput = { type: 'SPECIFIC', itemId: 'unknown_item' };
      // リゾルバがそのまま返す場合（マスターデータに存在しない場合のシミュレーション）
      const resolver = (id: string) => id;

      const result = formatCondition(condition, { itemNameResolver: resolver });

      expect(result).toBe('unknown_itemを納品');
    });

    it('SPECIFIC以外の条件タイプではリゾルバは使用されない', () => {
      let resolverCalled = false;
      const resolver = (id: string) => {
        resolverCalled = true;
        return id;
      };

      formatCondition({ type: 'QUANTITY', quantity: 3 }, { itemNameResolver: resolver });

      expect(resolverCalled).toBe(false);
    });
  });
});
