/**
 * inventory-types.test.ts - features/inventory/types エクスポートテスト
 *
 * TASK-0084: features/inventory/types作成
 * 型定義が正しくエクスポートされていることを確認する
 */

import type {
  IInventoryService,
  IItem,
  IItemEffect,
  IMaterial,
  IMaterialInstance,
  IMaterialService,
  ItemInstance,
  MaterialInstance,
} from '@features/inventory/types';
import {
  Attribute,
  ItemCategory,
  ItemEffectType,
  Quality,
  toItemId,
  toMaterialId,
} from '@shared/types';
import { describe, expect, it } from 'vitest';

describe('features/inventory/types', () => {
  describe('MaterialInstance型', () => {
    it('@features/inventory/typesからMaterialInstanceがインポートできること', () => {
      const _typeCheck: MaterialInstance | undefined = undefined;
      expect(_typeCheck).toBeUndefined();
    });
  });

  describe('ItemInstance型', () => {
    it('@features/inventory/typesからItemInstanceがインポートできること', () => {
      const _typeCheck: ItemInstance | undefined = undefined;
      expect(_typeCheck).toBeUndefined();
    });
  });

  describe('IMaterial型', () => {
    it('IMaterialオブジェクトを作成できること', () => {
      const material: IMaterial = {
        id: toMaterialId('mat-001'),
        name: 'テスト素材',
        baseQuality: Quality.C,
        attributes: [Attribute.FIRE],
      };
      expect(material.id).toBe('mat-001');
      expect(material.name).toBe('テスト素材');
      expect(material.baseQuality).toBe(Quality.C);
      expect(material.attributes).toContain(Attribute.FIRE);
    });

    it('descriptionがオプションであること', () => {
      const material: IMaterial = {
        id: toMaterialId('mat-002'),
        name: '説明付き素材',
        baseQuality: Quality.B,
        attributes: [],
        description: 'これはテスト素材です',
      };
      expect(material.description).toBe('これはテスト素材です');
    });
  });

  describe('IMaterialInstance型', () => {
    it('IMaterialInstanceオブジェクトを作成できること', () => {
      const instance: IMaterialInstance = {
        materialId: toMaterialId('mat-001'),
        quality: Quality.B,
        quantity: 3,
      };
      expect(instance.materialId).toBe('mat-001');
      expect(instance.quality).toBe(Quality.B);
      expect(instance.quantity).toBe(3);
    });
  });

  describe('IItem型', () => {
    it('IItemオブジェクトを作成できること', () => {
      const item: IItem = {
        id: toItemId('item-001'),
        name: 'テストアイテム',
        category: ItemCategory.MEDICINE,
        effects: [{ type: ItemEffectType.HP_RECOVERY, baseValue: 50 }],
      };
      expect(item.id).toBe('item-001');
      expect(item.name).toBe('テストアイテム');
      expect(item.category).toBe(ItemCategory.MEDICINE);
      expect(item.effects).toHaveLength(1);
    });

    it('descriptionがオプションであること', () => {
      const item: IItem = {
        id: toItemId('item-002'),
        name: '説明付きアイテム',
        category: ItemCategory.WEAPON,
        effects: [],
        description: 'テスト用のアイテム',
      };
      expect(item.description).toBe('テスト用のアイテム');
    });
  });

  describe('IItemEffect型', () => {
    it('IItemEffectオブジェクトを作成できること', () => {
      const effect: IItemEffect = {
        type: ItemEffectType.ATTACK_UP,
        baseValue: 30,
      };
      expect(effect.type).toBe(ItemEffectType.ATTACK_UP);
      expect(effect.baseValue).toBe(30);
    });
  });

  describe('IInventoryService型', () => {
    it('@features/inventory/typesからIInventoryServiceがインポートできること', () => {
      const _typeCheck: IInventoryService | undefined = undefined;
      expect(_typeCheck).toBeUndefined();
    });
  });

  describe('IMaterialService型', () => {
    it('@features/inventory/typesからIMaterialServiceがインポートできること', () => {
      const _typeCheck: IMaterialService | undefined = undefined;
      expect(_typeCheck).toBeUndefined();
    });
  });

  describe('index.tsバレルエクスポート', () => {
    it('すべての型が@features/inventory/typesから一括インポートできること', async () => {
      const mod = await import('@features/inventory/types');
      expect(mod).toBeDefined();
    });
  });
});
