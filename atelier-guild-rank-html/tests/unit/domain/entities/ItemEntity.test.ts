/**
 * アイテムエンティティのテスト
 * TASK-0086: アイテムエンティティ
 *
 * アイテムマスターデータエンティティと調合済みアイテムエンティティをテストする
 */

import { describe, it, expect } from 'vitest';
import {
  Item,
  CraftedItem,
  createItem,
  createCraftedItem,
} from '../../../../src/domain/item/ItemEntity';
import {
  ItemCategory,
  ItemEffectType,
  Quality,
  Attribute,
} from '../../../../src/domain/common/types';
import type { IItemEffect, IAttributeValue, IEffectValue, IUsedMaterial } from '../../../../src/domain/item/Item';

describe('Item Entity', () => {
  // テスト用データ
  const sampleEffects: IItemEffect[] = [
    { type: ItemEffectType.HP_RECOVERY, baseValue: 30 },
  ];

  const sampleItemData = {
    id: 'item_healing_potion',
    name: '回復薬',
    category: ItemCategory.MEDICINE,
    effects: sampleEffects,
    basePrice: 50,
    description: 'テスト用の回復薬',
  };

  const multiEffectItemData = {
    id: 'item_elixir',
    name: 'エリクシル',
    category: ItemCategory.MEDICINE,
    effects: [
      { type: ItemEffectType.HP_RECOVERY, baseValue: 150 },
      { type: ItemEffectType.CURE_POISON, baseValue: 1 },
    ],
    basePrice: 500,
    description: '万能薬',
  };

  const weaponItemData = {
    id: 'item_iron_sword',
    name: '鉄の剣',
    category: ItemCategory.WEAPON,
    effects: [{ type: ItemEffectType.ATTACK_UP, baseValue: 10 }],
    basePrice: 120,
    description: '武器',
  };

  describe('Item（アイテムマスターデータ）', () => {
    it('アイテムを生成できる', () => {
      const item = createItem(sampleItemData);

      expect(item).toBeInstanceOf(Item);
      expect(item.id).toBe('item_healing_potion');
      expect(item.name).toBe('回復薬');
    });

    it('カテゴリを取得できる', () => {
      const medicineItem = createItem(sampleItemData);
      const weaponItem = createItem(weaponItemData);

      expect(medicineItem.getCategory()).toBe(ItemCategory.MEDICINE);
      expect(weaponItem.getCategory()).toBe(ItemCategory.WEAPON);
    });

    it('対応依頼カテゴリを取得できる', () => {
      const medicineItem = createItem(sampleItemData);
      const weaponItem = createItem(weaponItemData);

      // カテゴリがそのまま対応依頼カテゴリになる
      expect(medicineItem.getCategory()).toBe(ItemCategory.MEDICINE);
      expect(weaponItem.getCategory()).toBe(ItemCategory.WEAPON);
    });

    it('効果リストを取得できる', () => {
      const item = createItem(multiEffectItemData);

      const effects = item.getEffects();

      expect(effects).toHaveLength(2);
      expect(effects[0].type).toBe(ItemEffectType.HP_RECOVERY);
      expect(effects[0].baseValue).toBe(150);
      expect(effects[1].type).toBe(ItemEffectType.CURE_POISON);
    });

    it('基本売却価格を取得できる', () => {
      const item = createItem(sampleItemData);

      expect(item.getBasePrice()).toBe(50);
    });

    it('基本売却価格が未設定の場合は0を返す', () => {
      const itemWithoutPrice = createItem({
        ...sampleItemData,
        basePrice: undefined,
      });

      expect(itemWithoutPrice.getBasePrice()).toBe(0);
    });

    it('不変オブジェクトとして設計されている', () => {
      const item = createItem(multiEffectItemData);

      // effectsを変更しても元のアイテムには影響しない
      const effects = item.getEffects();
      effects.push({ type: ItemEffectType.DEFENSE_UP, baseValue: 5 });

      expect(item.getEffects()).toHaveLength(2);
    });
  });

  describe('CraftedItem（調合済みアイテム）', () => {
    const sampleUsedMaterials: IUsedMaterial[] = [
      { materialId: 'mat_herb', quantity: 2, quality: Quality.C, isRare: false },
      { materialId: 'mat_water', quantity: 1, quality: Quality.B, isRare: false },
    ];

    const sampleAttributeValues: IAttributeValue[] = [
      { attribute: Attribute.GRASS, value: 10 },
      { attribute: Attribute.WATER, value: 5 },
    ];

    const sampleEffectValues: IEffectValue[] = [
      { type: ItemEffectType.HP_RECOVERY, value: 45 }, // 品質Bなので1.5倍
    ];

    const sampleCraftedItemData = {
      id: 'crafted_1',
      itemId: 'item_healing_potion',
      quality: Quality.B,
      attributeValues: sampleAttributeValues,
      effectValues: sampleEffectValues,
      usedMaterials: sampleUsedMaterials,
    };

    it('調合済みアイテムを生成できる', () => {
      const craftedItem = createCraftedItem(sampleCraftedItemData);

      expect(craftedItem).toBeInstanceOf(CraftedItem);
      expect(craftedItem.itemId).toBe('item_healing_potion');
      expect(craftedItem.quality).toBe(Quality.B);
    });

    it('品質を取得できる', () => {
      const craftedItemC = createCraftedItem({ ...sampleCraftedItemData, quality: Quality.C });
      const craftedItemS = createCraftedItem({ ...sampleCraftedItemData, quality: Quality.S });

      expect(craftedItemC.getQuality()).toBe(Quality.C);
      expect(craftedItemS.getQuality()).toBe(Quality.S);
    });

    it('売却価格を計算できる', () => {
      // 品質補正: D=0.5, C=1.0, B=1.5, A=2.0, S=3.0
      const craftedItemB = createCraftedItem(sampleCraftedItemData);
      // 基本価格50 * 品質補正1.5 = 75 (Item側の計算)
      // CraftedItemは基本価格を知らないので、effectValuesから計算する
      // または外部で計算するケースも考えられる

      // CraftedItemはbasePriceを持たないため、外部から基本価格を渡す必要がある
      const basePrice = 50;
      const sellPrice = craftedItemB.calculateSellPrice(basePrice);

      expect(sellPrice).toBe(75); // 50 * 1.5 = 75
    });

    it('品質による効果補正を取得できる', () => {
      const craftedItem = createCraftedItem(sampleCraftedItemData);

      const effectValues = craftedItem.getEffectValues();

      expect(effectValues).toHaveLength(1);
      expect(effectValues[0].type).toBe(ItemEffectType.HP_RECOVERY);
      expect(effectValues[0].value).toBe(45);
    });

    it('属性値を取得できる', () => {
      const craftedItem = createCraftedItem(sampleCraftedItemData);

      const attributeValues = craftedItem.getAttributeValues();

      expect(attributeValues).toHaveLength(2);
      expect(attributeValues[0].attribute).toBe(Attribute.GRASS);
      expect(attributeValues[0].value).toBe(10);
    });

    it('特定の属性値を取得できる', () => {
      const craftedItem = createCraftedItem(sampleCraftedItemData);

      expect(craftedItem.getAttributeValue(Attribute.GRASS)).toBe(10);
      expect(craftedItem.getAttributeValue(Attribute.WATER)).toBe(5);
      expect(craftedItem.getAttributeValue(Attribute.FIRE)).toBe(0);
    });

    it('特定の効果値を取得できる', () => {
      const craftedItem = createCraftedItem(sampleCraftedItemData);

      expect(craftedItem.getEffectValue(ItemEffectType.HP_RECOVERY)).toBe(45);
      expect(craftedItem.getEffectValue(ItemEffectType.ATTACK_UP)).toBe(0);
    });

    it('使用素材情報を取得できる', () => {
      const craftedItem = createCraftedItem(sampleCraftedItemData);

      const usedMaterials = craftedItem.getUsedMaterials();

      expect(usedMaterials).toHaveLength(2);
      expect(usedMaterials[0].materialId).toBe('mat_herb');
      expect(usedMaterials[0].quantity).toBe(2);
    });

    it('レア素材を使用したかどうかを判定できる', () => {
      const craftedWithRare = createCraftedItem({
        ...sampleCraftedItemData,
        usedMaterials: [
          ...sampleUsedMaterials,
          { materialId: 'mat_dragon_scale', quantity: 1, quality: Quality.S, isRare: true },
        ],
      });
      const craftedWithoutRare = createCraftedItem(sampleCraftedItemData);

      expect(craftedWithRare.usedRareMaterial()).toBe(true);
      expect(craftedWithoutRare.usedRareMaterial()).toBe(false);
    });

    it('使用したレア素材の数をカウントできる', () => {
      const craftedWithRare = createCraftedItem({
        ...sampleCraftedItemData,
        usedMaterials: [
          ...sampleUsedMaterials,
          { materialId: 'mat_dragon_scale', quantity: 1, quality: Quality.S, isRare: true },
          { materialId: 'mat_magic_stone', quantity: 2, quality: Quality.A, isRare: true },
        ],
      });

      expect(craftedWithRare.countRareMaterials()).toBe(3); // 1 + 2
    });

    it('特定の素材を使用したかどうかを判定できる', () => {
      const craftedItem = createCraftedItem(sampleCraftedItemData);

      expect(craftedItem.usedMaterial('mat_herb')).toBe(true);
      expect(craftedItem.usedMaterial('mat_dragon_scale')).toBe(false);
    });

    it('不変オブジェクトとして設計されている', () => {
      const craftedItem = createCraftedItem(sampleCraftedItemData);

      // 配列を変更しても元のオブジェクトには影響しない
      const usedMaterials = craftedItem.getUsedMaterials();
      usedMaterials.push({ materialId: 'mat_new', quantity: 1, quality: Quality.C, isRare: false });

      expect(craftedItem.getUsedMaterials()).toHaveLength(2);
    });
  });
});
