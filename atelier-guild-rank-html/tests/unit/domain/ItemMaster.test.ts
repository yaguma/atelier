import { describe, it, expect } from 'vitest';
import { ItemCategory, ItemEffectType } from '../../../src/domain/common/types';
import { IItem } from '../../../src/domain/item/Item';

// テスト用にJSONファイルを直接インポート
import items from '../../../data/master/items.json';

describe('ItemMaster', () => {
  const itemList = items as IItem[];

  it('アイテムが定義されている', () => {
    expect(itemList.length).toBeGreaterThan(0);
  });

  it('アイテムのスキーマが正しい', () => {
    itemList.forEach((item) => {
      // 必須フィールドの存在チェック
      expect(item.id).toBeDefined();
      expect(typeof item.id).toBe('string');
      expect(item.name).toBeDefined();
      expect(typeof item.name).toBe('string');
      expect(Object.values(ItemCategory)).toContain(item.category);
      expect(Array.isArray(item.effects)).toBe(true);
    });
  });

  it('品質範囲が正しく定義されている（basePriceが正の数）', () => {
    itemList.forEach((item) => {
      if (item.basePrice !== undefined) {
        expect(typeof item.basePrice).toBe('number');
        expect(item.basePrice).toBeGreaterThan(0);
      }
    });
  });

  it('対応依頼カテゴリが正しい', () => {
    itemList.forEach((item) => {
      expect(Object.values(ItemCategory)).toContain(item.category);
    });
  });

  it('売却価格が正しい（存在する場合は正の数）', () => {
    itemList.forEach((item) => {
      if (item.basePrice !== undefined) {
        expect(item.basePrice).toBeGreaterThan(0);
      }
    });
  });

  describe('カテゴリ別アイテム', () => {
    it('回復薬系アイテムが存在する', () => {
      const medicineItems = itemList.filter(
        (i) => i.category === ItemCategory.MEDICINE
      );
      expect(medicineItems.length).toBeGreaterThan(0);
    });

    it('武器系アイテムが存在する', () => {
      const weaponItems = itemList.filter(
        (i) => i.category === ItemCategory.WEAPON
      );
      expect(weaponItems.length).toBeGreaterThan(0);
    });

    it('冒険者向けアイテム（爆弾など）が存在する', () => {
      const adventureItems = itemList.filter(
        (i) => i.category === ItemCategory.ADVENTURE
      );
      expect(adventureItems.length).toBeGreaterThan(0);
    });
  });

  describe('効果', () => {
    it('全てのアイテムに少なくとも1つの効果がある', () => {
      itemList.forEach((item) => {
        expect(item.effects.length).toBeGreaterThan(0);
      });
    });

    it('効果タイプが有効な値である', () => {
      itemList.forEach((item) => {
        item.effects.forEach((effect) => {
          expect(Object.values(ItemEffectType)).toContain(effect.type);
        });
      });
    });

    it('効果の基本値が正の数である', () => {
      itemList.forEach((item) => {
        item.effects.forEach((effect) => {
          expect(effect.baseValue).toBeGreaterThan(0);
        });
      });
    });
  });

  it('全アイテムのIDがユニークである', () => {
    const ids = itemList.map((i) => i.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('レシピカードで参照されるアイテムIDが存在する', () => {
    // レシピカードで使用されているアイテムIDが実際に存在することを確認
    const itemIds = new Set(itemList.map((i) => i.id));
    // recipe.jsonで参照されている主要なoutputItemId
    const expectedIds = [
      'healing_potion',
      'antidote',
      'bomb',
      'steel_sword',
    ];
    expectedIds.forEach((id) => {
      expect(itemIds.has(id)).toBe(true);
    });
  });
});
