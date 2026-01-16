/**
 * materials.ts テストケース
 * 素材・アイテム関連型の型安全性テスト
 *
 * @description
 * TC-MAT-001 〜 TC-MAT-033 を実装
 */

// 型インポート（TDD Red: これらの型はまだ存在しない）
import type {
  IAttributeValue,
  ICraftedItem,
  IEffectValue,
  IItem,
  IItemEffect,
  IMaterial,
  IMaterialInstance,
  IUsedMaterial,
} from '@shared/types';
// 列挙型・ID型インポート
import {
  Attribute,
  ItemCategory,
  ItemEffectType,
  Quality,
  toItemId,
  toMaterialId,
} from '@shared/types';
import { describe, expect, it } from 'vitest';

// =============================================================================
// 5.1 IMaterialインターフェース
// =============================================================================

describe('materials.ts', () => {
  describe('IMaterialインターフェース', () => {
    // TC-MAT-001
    it('IMaterial型がインポート可能', () => {
      const material: IMaterial = {
        id: toMaterialId('mat-001'),
        name: 'Test Material',
        baseQuality: Quality.C,
        attributes: [Attribute.FIRE],
      };
      expect(material).toBeDefined();
    });

    // TC-MAT-002
    it('IMaterial.idが必須でstring型', () => {
      // @ts-expect-error - undefined/数値で型エラー
      const invalid: IMaterial = {
        name: 'Test Material',
        baseQuality: Quality.C,
        attributes: [Attribute.FIRE],
      };
      expect(invalid).toBeDefined();
    });

    // TC-MAT-003
    it('IMaterial.nameが必須でstring型', () => {
      // @ts-expect-error - undefined/数値で型エラー
      const invalid: IMaterial = {
        id: toMaterialId('mat-001'),
        baseQuality: Quality.C,
        attributes: [Attribute.FIRE],
      };
      expect(invalid).toBeDefined();
    });

    // TC-MAT-004
    it('IMaterial.baseQualityがQuality型', () => {
      // @ts-expect-error - 不正な値で型エラー
      const invalid: IMaterial = {
        id: toMaterialId('mat-001'),
        name: 'Test Material',
        baseQuality: 'INVALID_QUALITY',
        attributes: [Attribute.FIRE],
      };
      expect(invalid).toBeDefined();
    });

    // TC-MAT-005
    it('IMaterial.attributesがAttribute[]型', () => {
      // @ts-expect-error - 型違いで型エラー
      const invalid: IMaterial = {
        id: toMaterialId('mat-001'),
        name: 'Test Material',
        baseQuality: Quality.C,
        attributes: 'not-an-array',
      };
      expect(invalid).toBeDefined();
    });

    // TC-MAT-006
    it('IMaterial.descriptionがオプショナル', () => {
      const withDesc: IMaterial = {
        id: toMaterialId('mat-001'),
        name: 'Test Material',
        baseQuality: Quality.C,
        attributes: [Attribute.FIRE],
        description: 'Optional description',
      };
      const withoutDesc: IMaterial = {
        id: toMaterialId('mat-002'),
        name: 'Test Material 2',
        baseQuality: Quality.B,
        attributes: [Attribute.WATER],
      };
      expect(withDesc.description).toBeDefined();
      expect(withoutDesc.description).toBeUndefined();
    });
  });

  // =============================================================================
  // 5.2 IMaterialInstanceインターフェース
  // =============================================================================

  describe('IMaterialInstanceインターフェース', () => {
    // TC-MAT-007
    it('IMaterialInstance型がインポート可能', () => {
      const materialInstance: IMaterialInstance = {
        materialId: toMaterialId('mat-001'),
        quality: Quality.B,
        quantity: 3,
      };
      expect(materialInstance).toBeDefined();
    });

    // TC-MAT-008
    it('IMaterialInstance.materialIdが必須', () => {
      // @ts-expect-error - undefined不可
      const invalid: IMaterialInstance = {
        quality: Quality.B,
        quantity: 3,
      };
      expect(invalid).toBeDefined();
    });

    // TC-MAT-009
    it('IMaterialInstance.qualityがQuality型', () => {
      // @ts-expect-error - 不正な値で型エラー
      const invalid: IMaterialInstance = {
        materialId: toMaterialId('mat-001'),
        quality: 'INVALID_QUALITY',
        quantity: 3,
      };
      expect(invalid).toBeDefined();
    });

    // TC-MAT-010
    it('IMaterialInstance.quantityがnumber型', () => {
      // @ts-expect-error - 文字列で型エラー
      const invalid: IMaterialInstance = {
        materialId: toMaterialId('mat-001'),
        quality: Quality.B,
        quantity: '3',
      };
      expect(invalid).toBeDefined();
    });
  });

  // =============================================================================
  // 5.3 IItemインターフェース
  // =============================================================================

  describe('IItemインターフェース', () => {
    // TC-MAT-011
    it('IItem型がインポート可能', () => {
      const item: IItem = {
        id: toItemId('item-001'),
        name: 'Test Item',
        category: ItemCategory.MEDICINE,
        effects: [],
      };
      expect(item).toBeDefined();
    });

    // TC-MAT-012
    it('IItem.idが必須でstring型', () => {
      // @ts-expect-error - undefined/数値で型エラー
      const invalid: IItem = {
        name: 'Test Item',
        category: ItemCategory.MEDICINE,
        effects: [],
      };
      expect(invalid).toBeDefined();
    });

    // TC-MAT-013
    it('IItem.nameが必須でstring型', () => {
      // @ts-expect-error - undefined/数値で型エラー
      const invalid: IItem = {
        id: toItemId('item-001'),
        category: ItemCategory.MEDICINE,
        effects: [],
      };
      expect(invalid).toBeDefined();
    });

    // TC-MAT-014
    it('IItem.categoryがItemCategory型', () => {
      // @ts-expect-error - 不正な値で型エラー
      const invalid: IItem = {
        id: toItemId('item-001'),
        name: 'Test Item',
        category: 'INVALID_CATEGORY',
        effects: [],
      };
      expect(invalid).toBeDefined();
    });

    // TC-MAT-015
    it('IItem.effectsがIItemEffect[]型', () => {
      // @ts-expect-error - 型違いで型エラー
      const invalid: IItem = {
        id: toItemId('item-001'),
        name: 'Test Item',
        category: ItemCategory.MEDICINE,
        effects: 'not-an-array',
      };
      expect(invalid).toBeDefined();
    });

    // TC-MAT-016
    it('IItem.descriptionがオプショナル', () => {
      const withDesc: IItem = {
        id: toItemId('item-001'),
        name: 'Test Item',
        category: ItemCategory.MEDICINE,
        effects: [],
        description: 'Optional description',
      };
      const withoutDesc: IItem = {
        id: toItemId('item-002'),
        name: 'Test Item 2',
        category: ItemCategory.WEAPON,
        effects: [],
      };
      expect(withDesc.description).toBeDefined();
      expect(withoutDesc.description).toBeUndefined();
    });
  });

  // =============================================================================
  // 5.4 IItemEffectインターフェース
  // =============================================================================

  describe('IItemEffectインターフェース', () => {
    // TC-MAT-017
    it('IItemEffect型がインポート可能', () => {
      const itemEffect: IItemEffect = {
        type: ItemEffectType.HP_RECOVERY,
        baseValue: 50,
      };
      expect(itemEffect).toBeDefined();
    });

    // TC-MAT-018
    it('IItemEffect.typeがItemEffectType型', () => {
      // @ts-expect-error - 不正な値で型エラー
      const invalid: IItemEffect = {
        type: 'INVALID_EFFECT',
        baseValue: 50,
      };
      expect(invalid).toBeDefined();
    });

    // TC-MAT-019
    it('IItemEffect.baseValueがnumber型', () => {
      // @ts-expect-error - 文字列で型エラー
      const invalid: IItemEffect = {
        type: ItemEffectType.HP_RECOVERY,
        baseValue: '50',
      };
      expect(invalid).toBeDefined();
    });
  });

  // =============================================================================
  // 5.5 ICraftedItemインターフェース
  // =============================================================================

  describe('ICraftedItemインターフェース', () => {
    // TC-MAT-020
    it('ICraftedItem型がインポート可能', () => {
      const craftedItem: ICraftedItem = {
        itemId: toItemId('item-001'),
        quality: Quality.A,
        attributeValues: [],
        effectValues: [],
        usedMaterials: [],
      };
      expect(craftedItem).toBeDefined();
    });

    // TC-MAT-021
    it('ICraftedItem.itemIdが必須でstring型', () => {
      // @ts-expect-error - undefined不可
      const invalid: ICraftedItem = {
        quality: Quality.A,
        attributeValues: [],
        effectValues: [],
        usedMaterials: [],
      };
      expect(invalid).toBeDefined();
    });

    // TC-MAT-022
    it('ICraftedItem.qualityがQuality型', () => {
      // @ts-expect-error - 不正な値で型エラー
      const invalid: ICraftedItem = {
        itemId: toItemId('item-001'),
        quality: 'INVALID_QUALITY',
        attributeValues: [],
        effectValues: [],
        usedMaterials: [],
      };
      expect(invalid).toBeDefined();
    });

    // TC-MAT-023
    it('ICraftedItem.attributeValuesがIAttributeValue[]型', () => {
      // @ts-expect-error - 型違いで型エラー
      const invalid: ICraftedItem = {
        itemId: toItemId('item-001'),
        quality: Quality.A,
        attributeValues: 'not-an-array',
        effectValues: [],
        usedMaterials: [],
      };
      expect(invalid).toBeDefined();
    });

    // TC-MAT-024
    it('ICraftedItem.effectValuesがIEffectValue[]型', () => {
      // @ts-expect-error - 型違いで型エラー
      const invalid: ICraftedItem = {
        itemId: toItemId('item-001'),
        quality: Quality.A,
        attributeValues: [],
        effectValues: 'not-an-array',
        usedMaterials: [],
      };
      expect(invalid).toBeDefined();
    });

    // TC-MAT-025
    it('ICraftedItem.usedMaterialsがIUsedMaterial[]型', () => {
      // @ts-expect-error - 型違いで型エラー
      const invalid: ICraftedItem = {
        itemId: toItemId('item-001'),
        quality: Quality.A,
        attributeValues: [],
        effectValues: [],
        usedMaterials: 'not-an-array',
      };
      expect(invalid).toBeDefined();
    });
  });

  // =============================================================================
  // 5.6 IAttributeValue, IEffectValue, IUsedMaterialインターフェース
  // =============================================================================

  describe('IAttributeValue, IEffectValue, IUsedMaterialインターフェース', () => {
    // TC-MAT-026
    it('IAttributeValue型がインポート可能', () => {
      const attributeValue: IAttributeValue = {
        attribute: Attribute.FIRE,
        value: 10,
      };
      expect(attributeValue).toBeDefined();
    });

    // TC-MAT-027
    it('IAttributeValue.attributeがAttribute型', () => {
      // @ts-expect-error - 不正な値で型エラー
      const invalid: IAttributeValue = {
        attribute: 'INVALID_ATTRIBUTE',
        value: 10,
      };
      expect(invalid).toBeDefined();
    });

    // TC-MAT-028
    it('IAttributeValue.valueがnumber型', () => {
      // @ts-expect-error - 文字列で型エラー
      const invalid: IAttributeValue = {
        attribute: Attribute.FIRE,
        value: '10',
      };
      expect(invalid).toBeDefined();
    });

    // TC-MAT-029
    it('IEffectValue型がインポート可能', () => {
      const effectValue: IEffectValue = {
        type: ItemEffectType.HP_RECOVERY,
        value: 50,
      };
      expect(effectValue).toBeDefined();
    });

    // TC-MAT-030
    it('IEffectValue.typeがItemEffectType型', () => {
      // @ts-expect-error - 不正な値で型エラー
      const invalid: IEffectValue = {
        type: 'INVALID_EFFECT',
        value: 50,
      };
      expect(invalid).toBeDefined();
    });

    // TC-MAT-031
    it('IEffectValue.valueがnumber型', () => {
      // @ts-expect-error - 文字列で型エラー
      const invalid: IEffectValue = {
        type: ItemEffectType.HP_RECOVERY,
        value: '50',
      };
      expect(invalid).toBeDefined();
    });

    // TC-MAT-032
    it('IUsedMaterial型がインポート可能', () => {
      const usedMaterial: IUsedMaterial = {
        materialId: toMaterialId('mat-001'),
        quality: Quality.B,
        quantity: 2,
        isRare: false,
      };
      expect(usedMaterial).toBeDefined();
    });

    // TC-MAT-033
    it('IUsedMaterial.isRareがboolean型', () => {
      // @ts-expect-error - 文字列で型エラー
      const invalid: IUsedMaterial = {
        materialId: toMaterialId('mat-001'),
        quality: Quality.B,
        quantity: 2,
        isRare: 'true',
      };
      expect(invalid).toBeDefined();
    });
  });
});
