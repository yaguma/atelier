/**
 * inventory-filters テスト
 * TASK-0085: features/inventory/services作成
 */

import type { ItemInstance } from '@domain/entities/ItemInstance';
import type { MaterialInstance } from '@domain/entities/MaterialInstance';
import {
  filterItemsByQuality,
  filterItemsByType,
  filterMaterialsByAttribute,
  filterMaterialsById,
  filterMaterialsByQuality,
} from '@features/inventory/services/inventory-filters';
import type { InventoryState } from '@features/inventory/services/inventory-operations';
import { createEmptyInventory } from '@features/inventory/services/inventory-operations';
import type { Attribute, ItemId, MaterialId, Quality } from '@shared/types';
import { describe, expect, it } from 'vitest';

// =============================================================================
// テストヘルパー
// =============================================================================

function createMockMaterial(
  instanceId: string,
  options: {
    materialId?: MaterialId;
    quality?: Quality;
    attributes?: Attribute[];
  } = {},
): MaterialInstance {
  const materialId = options.materialId ?? ('mat-001' as MaterialId);
  const quality = options.quality ?? 'B';
  const attributes = options.attributes ?? ['FIRE'];

  return {
    instanceId,
    materialId,
    master: {
      id: materialId,
      name: 'テスト素材',
      baseQuality: quality,
      attributes,
    },
    quality,
    name: 'テスト素材',
    baseQuality: quality,
    attributes,
  } as unknown as MaterialInstance;
}

function createMockItem(
  instanceId: string,
  options: {
    itemId?: ItemId;
    quality?: Quality;
  } = {},
): ItemInstance {
  const itemId = options.itemId ?? ('item-001' as ItemId);
  const quality = options.quality ?? 'B';

  return {
    instanceId,
    itemId,
    master: { id: itemId, name: 'テストアイテム', category: 'CONSUMABLE', effects: [] },
    quality,
    name: 'テストアイテム',
    usedMaterials: [],
  } as unknown as ItemInstance;
}

function createStateWithMaterials(materials: MaterialInstance[]): InventoryState {
  return { ...createEmptyInventory(), materials };
}

function createStateWithItems(items: ItemInstance[]): InventoryState {
  return { ...createEmptyInventory(), items };
}

// =============================================================================
// テスト
// =============================================================================

describe('inventory-filters', () => {
  // ===========================================================================
  // 素材フィルタリング
  // ===========================================================================

  describe('filterMaterialsByAttribute', () => {
    it('指定属性を持つ素材のみを返す', () => {
      const fireMaterial = createMockMaterial('inst-001', { attributes: ['FIRE'] });
      const waterMaterial = createMockMaterial('inst-002', { attributes: ['WATER'] });
      const bothMaterial = createMockMaterial('inst-003', { attributes: ['FIRE', 'WATER'] });
      const state = createStateWithMaterials([fireMaterial, waterMaterial, bothMaterial]);

      const result = filterMaterialsByAttribute(state, 'FIRE' as Attribute);

      expect(result).toHaveLength(2);
      expect(result).toContain(fireMaterial);
      expect(result).toContain(bothMaterial);
    });

    it('該当する素材がない場合は空配列を返す', () => {
      const material = createMockMaterial('inst-001', { attributes: ['FIRE'] });
      const state = createStateWithMaterials([material]);

      const result = filterMaterialsByAttribute(state, 'EARTH' as Attribute);

      expect(result).toHaveLength(0);
    });

    it('空のインベントリの場合は空配列を返す', () => {
      const state = createEmptyInventory();

      const result = filterMaterialsByAttribute(state, 'FIRE' as Attribute);

      expect(result).toHaveLength(0);
    });
  });

  describe('filterMaterialsByQuality', () => {
    it('指定品質の素材のみを返す', () => {
      const qualityA = createMockMaterial('inst-001', { quality: 'A' });
      const qualityB = createMockMaterial('inst-002', { quality: 'B' });
      const qualityB2 = createMockMaterial('inst-003', { quality: 'B' });
      const state = createStateWithMaterials([qualityA, qualityB, qualityB2]);

      const result = filterMaterialsByQuality(state, 'B');

      expect(result).toHaveLength(2);
      expect(result).toContain(qualityB);
      expect(result).toContain(qualityB2);
    });

    it('該当する素材がない場合は空配列を返す', () => {
      const material = createMockMaterial('inst-001', { quality: 'B' });
      const state = createStateWithMaterials([material]);

      const result = filterMaterialsByQuality(state, 'S');

      expect(result).toHaveLength(0);
    });
  });

  describe('filterMaterialsById', () => {
    it('指定素材IDの素材のみを返す', () => {
      const mat1 = createMockMaterial('inst-001', { materialId: 'mat-001' as MaterialId });
      const mat2 = createMockMaterial('inst-002', { materialId: 'mat-002' as MaterialId });
      const mat3 = createMockMaterial('inst-003', { materialId: 'mat-001' as MaterialId });
      const state = createStateWithMaterials([mat1, mat2, mat3]);

      const result = filterMaterialsById(state, 'mat-001');

      expect(result).toHaveLength(2);
      expect(result).toContain(mat1);
      expect(result).toContain(mat3);
    });

    it('該当する素材がない場合は空配列を返す', () => {
      const material = createMockMaterial('inst-001', { materialId: 'mat-001' as MaterialId });
      const state = createStateWithMaterials([material]);

      const result = filterMaterialsById(state, 'mat-999');

      expect(result).toHaveLength(0);
    });
  });

  // ===========================================================================
  // アイテムフィルタリング
  // ===========================================================================

  describe('filterItemsByType', () => {
    it('指定アイテムIDのアイテムのみを返す', () => {
      const item1 = createMockItem('inst-001', { itemId: 'item-001' as ItemId });
      const item2 = createMockItem('inst-002', { itemId: 'item-002' as ItemId });
      const item3 = createMockItem('inst-003', { itemId: 'item-001' as ItemId });
      const state = createStateWithItems([item1, item2, item3]);

      const result = filterItemsByType(state, 'item-001' as ItemId);

      expect(result).toHaveLength(2);
      expect(result).toContain(item1);
      expect(result).toContain(item3);
    });

    it('該当するアイテムがない場合は空配列を返す', () => {
      const item = createMockItem('inst-001', { itemId: 'item-001' as ItemId });
      const state = createStateWithItems([item]);

      const result = filterItemsByType(state, 'item-999' as ItemId);

      expect(result).toHaveLength(0);
    });
  });

  describe('filterItemsByQuality', () => {
    it('指定品質のアイテムのみを返す', () => {
      const itemA = createMockItem('inst-001', { quality: 'A' });
      const itemB = createMockItem('inst-002', { quality: 'B' });
      const itemA2 = createMockItem('inst-003', { quality: 'A' });
      const state = createStateWithItems([itemA, itemB, itemA2]);

      const result = filterItemsByQuality(state, 'A');

      expect(result).toHaveLength(2);
      expect(result).toContain(itemA);
      expect(result).toContain(itemA2);
    });

    it('該当するアイテムがない場合は空配列を返す', () => {
      const item = createMockItem('inst-001', { quality: 'B' });
      const state = createStateWithItems([item]);

      const result = filterItemsByQuality(state, 'S');

      expect(result).toHaveLength(0);
    });
  });

  // ===========================================================================
  // 純粋関数検証
  // ===========================================================================

  describe('純粋関数検証', () => {
    it('フィルタリングが元のインベントリを変更しない', () => {
      const materials = [
        createMockMaterial('inst-001', { attributes: ['FIRE'] }),
        createMockMaterial('inst-002', { attributes: ['WATER'] }),
      ];
      const state = createStateWithMaterials(materials);
      const originalLength = state.materials.length;

      filterMaterialsByAttribute(state, 'FIRE' as Attribute);

      expect(state.materials.length).toBe(originalLength);
    });

    it('同じ入力に対して同じ出力を返す', () => {
      const materials = [
        createMockMaterial('inst-001', { quality: 'A' }),
        createMockMaterial('inst-002', { quality: 'B' }),
      ];
      const state = createStateWithMaterials(materials);

      const result1 = filterMaterialsByQuality(state, 'A');
      const result2 = filterMaterialsByQuality(state, 'A');

      expect(result1).toEqual(result2);
    });
  });
});
