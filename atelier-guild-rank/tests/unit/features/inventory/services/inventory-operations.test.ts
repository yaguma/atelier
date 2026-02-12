/**
 * inventory-operations テスト
 * TASK-0085: features/inventory/services作成
 */

import type { ItemInstance } from '@domain/entities/ItemInstance';
import type { MaterialInstance } from '@domain/entities/MaterialInstance';
import type { InventoryState } from '@features/inventory/services/inventory-operations';
import {
  addArtifact,
  addItem,
  addMaterial,
  addMaterials,
  clearInventory,
  createEmptyInventory,
  findItemById,
  findMaterialById,
  getArtifactRemainingCapacity,
  getItemRemainingCapacity,
  getMaterialRemainingCapacity,
  hasArtifact,
  MAX_ARTIFACTS,
  MAX_ITEMS,
  MAX_MATERIALS,
  removeArtifact,
  removeItem,
  removeMaterial,
  removeMaterials,
} from '@features/inventory/services/inventory-operations';
import type { ArtifactId, ItemId, MaterialId } from '@shared/types';
import { describe, expect, it } from 'vitest';

// =============================================================================
// テストヘルパー
// =============================================================================

function createMockMaterial(
  instanceId: string,
  materialId = 'mat-001' as MaterialId,
): MaterialInstance {
  return {
    instanceId,
    materialId,
    master: {
      id: materialId,
      name: 'テスト素材',
      baseQuality: 'B',
      attributes: ['FIRE', 'WATER'],
    },
    quality: 'B',
    name: 'テスト素材',
    baseQuality: 'B',
    attributes: ['FIRE', 'WATER'],
  } as unknown as MaterialInstance;
}

function createMockItem(instanceId: string, itemId = 'item-001' as ItemId): ItemInstance {
  return {
    instanceId,
    itemId,
    master: { id: itemId, name: 'テストアイテム', category: 'CONSUMABLE', effects: [] },
    quality: 'B',
    name: 'テストアイテム',
    usedMaterials: [],
    basePrice: 100,
    calculatePrice: () => 100,
  } as unknown as ItemInstance;
}

// =============================================================================
// テスト
// =============================================================================

describe('inventory-operations', () => {
  describe('createEmptyInventory', () => {
    it('空のインベントリ状態を作成する', () => {
      const state = createEmptyInventory();
      expect(state.materials).toEqual([]);
      expect(state.items).toEqual([]);
      expect(state.artifacts).toEqual([]);
    });
  });

  // ===========================================================================
  // 素材操作
  // ===========================================================================

  describe('addMaterial', () => {
    it('新しい素材を追加した新しいインベントリを返す', () => {
      const state = createEmptyInventory();
      const material = createMockMaterial('inst-001');

      const result = addMaterial(state, material);

      expect(result).not.toBeNull();
      expect(result!.materials).toHaveLength(1);
      expect(result!.materials[0]).toBe(material);
    });

    it('既存のインベントリを変更しない', () => {
      const state = createEmptyInventory();
      const material = createMockMaterial('inst-001');

      addMaterial(state, material);

      expect(state.materials).toHaveLength(0);
    });

    it('容量上限の場合はnullを返す', () => {
      const materials = Array.from({ length: MAX_MATERIALS }, (_, i) =>
        createMockMaterial(`inst-${i}`),
      );
      const state: InventoryState = {
        ...createEmptyInventory(),
        materials,
      };

      const result = addMaterial(state, createMockMaterial('inst-new'));

      expect(result).toBeNull();
    });

    it('既存の素材を保持したまま新しい素材を追加する', () => {
      const material1 = createMockMaterial('inst-001');
      const material2 = createMockMaterial('inst-002');
      const state: InventoryState = {
        ...createEmptyInventory(),
        materials: [material1],
      };

      const result = addMaterial(state, material2);

      expect(result!.materials).toHaveLength(2);
      expect(result!.materials[0]).toBe(material1);
      expect(result!.materials[1]).toBe(material2);
    });
  });

  describe('addMaterials', () => {
    it('複数の素材を追加した新しいインベントリを返す', () => {
      const state = createEmptyInventory();
      const materials = [createMockMaterial('inst-001'), createMockMaterial('inst-002')];

      const result = addMaterials(state, materials);

      expect(result).not.toBeNull();
      expect(result!.materials).toHaveLength(2);
    });

    it('容量を超える場合はnullを返す', () => {
      const existing = Array.from({ length: MAX_MATERIALS - 1 }, (_, i) =>
        createMockMaterial(`inst-${i}`),
      );
      const state: InventoryState = { ...createEmptyInventory(), materials: existing };

      const result = addMaterials(state, [
        createMockMaterial('new-1'),
        createMockMaterial('new-2'),
      ]);

      expect(result).toBeNull();
    });

    it('既存のインベントリを変更しない', () => {
      const state = createEmptyInventory();
      addMaterials(state, [createMockMaterial('inst-001')]);
      expect(state.materials).toHaveLength(0);
    });
  });

  describe('removeMaterial', () => {
    it('素材を削除した新しいインベントリを返す', () => {
      const material = createMockMaterial('inst-001');
      const state: InventoryState = { ...createEmptyInventory(), materials: [material] };

      const result = removeMaterial(state, 'inst-001');

      expect(result.state.materials).toHaveLength(0);
      expect(result.data).toBe(material);
    });

    it('既存のインベントリを変更しない', () => {
      const material = createMockMaterial('inst-001');
      const state: InventoryState = { ...createEmptyInventory(), materials: [material] };

      removeMaterial(state, 'inst-001');

      expect(state.materials).toHaveLength(1);
    });

    it('存在しないIDの場合は元の状態とnullを返す', () => {
      const state: InventoryState = {
        ...createEmptyInventory(),
        materials: [createMockMaterial('inst-001')],
      };

      const result = removeMaterial(state, 'nonexistent');

      expect(result.state).toBe(state);
      expect(result.data).toBeNull();
    });
  });

  describe('removeMaterials', () => {
    it('複数の素材を削除した新しいインベントリを返す', () => {
      const m1 = createMockMaterial('inst-001');
      const m2 = createMockMaterial('inst-002');
      const m3 = createMockMaterial('inst-003');
      const state: InventoryState = { ...createEmptyInventory(), materials: [m1, m2, m3] };

      const result = removeMaterials(state, ['inst-001', 'inst-003']);

      expect(result.state.materials).toHaveLength(1);
      expect(result.state.materials[0]).toBe(m2);
      expect(result.data).toHaveLength(2);
      expect(result.data).toContain(m1);
      expect(result.data).toContain(m3);
    });

    it('既存のインベントリを変更しない', () => {
      const state: InventoryState = {
        ...createEmptyInventory(),
        materials: [createMockMaterial('inst-001')],
      };

      removeMaterials(state, ['inst-001']);

      expect(state.materials).toHaveLength(1);
    });

    it('存在しないIDは無視される', () => {
      const m1 = createMockMaterial('inst-001');
      const state: InventoryState = { ...createEmptyInventory(), materials: [m1] };

      const result = removeMaterials(state, ['nonexistent']);

      expect(result.state.materials).toHaveLength(1);
      expect(result.data).toHaveLength(0);
    });
  });

  // ===========================================================================
  // アイテム操作
  // ===========================================================================

  describe('addItem', () => {
    it('新しいアイテムを追加した新しいインベントリを返す', () => {
      const state = createEmptyInventory();
      const item = createMockItem('item-inst-001');

      const result = addItem(state, item);

      expect(result).not.toBeNull();
      expect(result!.items).toHaveLength(1);
      expect(result!.items[0]).toBe(item);
    });

    it('既存のインベントリを変更しない', () => {
      const state = createEmptyInventory();
      addItem(state, createMockItem('item-inst-001'));
      expect(state.items).toHaveLength(0);
    });

    it('容量上限の場合はnullを返す', () => {
      const items = Array.from({ length: MAX_ITEMS }, (_, i) => createMockItem(`item-inst-${i}`));
      const state: InventoryState = { ...createEmptyInventory(), items };

      const result = addItem(state, createMockItem('item-new'));

      expect(result).toBeNull();
    });
  });

  describe('removeItem', () => {
    it('アイテムを削除した新しいインベントリを返す', () => {
      const item = createMockItem('item-inst-001');
      const state: InventoryState = { ...createEmptyInventory(), items: [item] };

      const result = removeItem(state, 'item-inst-001');

      expect(result.state.items).toHaveLength(0);
      expect(result.data).toBe(item);
    });

    it('既存のインベントリを変更しない', () => {
      const state: InventoryState = {
        ...createEmptyInventory(),
        items: [createMockItem('item-inst-001')],
      };

      removeItem(state, 'item-inst-001');

      expect(state.items).toHaveLength(1);
    });

    it('存在しないIDの場合は元の状態とnullを返す', () => {
      const state: InventoryState = {
        ...createEmptyInventory(),
        items: [createMockItem('item-inst-001')],
      };

      const result = removeItem(state, 'nonexistent');

      expect(result.state).toBe(state);
      expect(result.data).toBeNull();
    });
  });

  // ===========================================================================
  // アーティファクト操作
  // ===========================================================================

  describe('addArtifact', () => {
    it('アーティファクトを追加した新しいインベントリを返す', () => {
      const state = createEmptyInventory();
      const artifactId = 'artifact-001' as ArtifactId;

      const result = addArtifact(state, artifactId);

      expect(result).not.toBeNull();
      expect(result!.artifacts).toHaveLength(1);
      expect(result!.artifacts[0]).toBe(artifactId);
    });

    it('既存のインベントリを変更しない', () => {
      const state = createEmptyInventory();
      addArtifact(state, 'artifact-001' as ArtifactId);
      expect(state.artifacts).toHaveLength(0);
    });

    it('重複するアーティファクトの場合はnullを返す', () => {
      const artifactId = 'artifact-001' as ArtifactId;
      const state: InventoryState = { ...createEmptyInventory(), artifacts: [artifactId] };

      const result = addArtifact(state, artifactId);

      expect(result).toBeNull();
    });

    it('容量上限の場合はnullを返す', () => {
      const artifacts = Array.from(
        { length: MAX_ARTIFACTS },
        (_, i) => `artifact-${i}` as ArtifactId,
      );
      const state: InventoryState = { ...createEmptyInventory(), artifacts };

      const result = addArtifact(state, 'artifact-new' as ArtifactId);

      expect(result).toBeNull();
    });
  });

  describe('removeArtifact', () => {
    it('アーティファクトを削除した新しいインベントリを返す', () => {
      const artifactId = 'artifact-001' as ArtifactId;
      const state: InventoryState = { ...createEmptyInventory(), artifacts: [artifactId] };

      const result = removeArtifact(state, artifactId);

      expect(result.state.artifacts).toHaveLength(0);
      expect(result.data).toBe(true);
    });

    it('既存のインベントリを変更しない', () => {
      const artifactId = 'artifact-001' as ArtifactId;
      const state: InventoryState = { ...createEmptyInventory(), artifacts: [artifactId] };

      removeArtifact(state, artifactId);

      expect(state.artifacts).toHaveLength(1);
    });

    it('存在しないアーティファクトの場合はfalseを返す', () => {
      const state = createEmptyInventory();

      const result = removeArtifact(state, 'nonexistent' as ArtifactId);

      expect(result.state).toBe(state);
      expect(result.data).toBe(false);
    });
  });

  // ===========================================================================
  // クリア
  // ===========================================================================

  describe('clearInventory', () => {
    it('空のインベントリ状態を返す', () => {
      const state = clearInventory();

      expect(state.materials).toHaveLength(0);
      expect(state.items).toHaveLength(0);
      expect(state.artifacts).toHaveLength(0);
    });
  });

  // ===========================================================================
  // 検索
  // ===========================================================================

  describe('findMaterialById', () => {
    it('インスタンスIDで素材を検索できる', () => {
      const material = createMockMaterial('inst-001');
      const state: InventoryState = { ...createEmptyInventory(), materials: [material] };

      expect(findMaterialById(state, 'inst-001')).toBe(material);
    });

    it('見つからない場合はnullを返す', () => {
      const state = createEmptyInventory();

      expect(findMaterialById(state, 'nonexistent')).toBeNull();
    });
  });

  describe('findItemById', () => {
    it('インスタンスIDでアイテムを検索できる', () => {
      const item = createMockItem('item-inst-001');
      const state: InventoryState = { ...createEmptyInventory(), items: [item] };

      expect(findItemById(state, 'item-inst-001')).toBe(item);
    });

    it('見つからない場合はnullを返す', () => {
      const state = createEmptyInventory();

      expect(findItemById(state, 'nonexistent')).toBeNull();
    });
  });

  describe('hasArtifact', () => {
    it('所持しているアーティファクトの場合trueを返す', () => {
      const artifactId = 'artifact-001' as ArtifactId;
      const state: InventoryState = { ...createEmptyInventory(), artifacts: [artifactId] };

      expect(hasArtifact(state, artifactId)).toBe(true);
    });

    it('所持していない場合falseを返す', () => {
      const state = createEmptyInventory();

      expect(hasArtifact(state, 'nonexistent' as ArtifactId)).toBe(false);
    });
  });

  // ===========================================================================
  // 容量
  // ===========================================================================

  describe('容量関連', () => {
    it('素材の残り容量を取得できる', () => {
      const materials = [createMockMaterial('inst-001'), createMockMaterial('inst-002')];
      const state: InventoryState = { ...createEmptyInventory(), materials };

      expect(getMaterialRemainingCapacity(state)).toBe(MAX_MATERIALS - 2);
    });

    it('アイテムの残り容量を取得できる', () => {
      const items = [createMockItem('item-001')];
      const state: InventoryState = { ...createEmptyInventory(), items };

      expect(getItemRemainingCapacity(state)).toBe(MAX_ITEMS - 1);
    });

    it('アーティファクトの残り容量を取得できる', () => {
      const artifacts = ['a1' as ArtifactId, 'a2' as ArtifactId, 'a3' as ArtifactId];
      const state: InventoryState = { ...createEmptyInventory(), artifacts };

      expect(getArtifactRemainingCapacity(state)).toBe(MAX_ARTIFACTS - 3);
    });
  });

  // ===========================================================================
  // 純粋関数検証
  // ===========================================================================

  describe('純粋関数検証', () => {
    it('同じ入力に対して同じ出力を返す', () => {
      const state = createEmptyInventory();
      const material = createMockMaterial('inst-001');

      const result1 = addMaterial(state, material);
      const result2 = addMaterial(state, material);

      expect(result1!.materials).toEqual(result2!.materials);
    });

    it('入力の状態を変更しない（素材追加）', () => {
      const state = createEmptyInventory();
      const originalLength = state.materials.length;

      addMaterial(state, createMockMaterial('inst-001'));

      expect(state.materials.length).toBe(originalLength);
    });

    it('入力の状態を変更しない（素材削除）', () => {
      const material = createMockMaterial('inst-001');
      const state: InventoryState = { ...createEmptyInventory(), materials: [material] };
      const originalLength = state.materials.length;

      removeMaterial(state, 'inst-001');

      expect(state.materials.length).toBe(originalLength);
    });

    it('入力の状態を変更しない（アイテム追加）', () => {
      const state = createEmptyInventory();
      const originalLength = state.items.length;

      addItem(state, createMockItem('item-inst-001'));

      expect(state.items.length).toBe(originalLength);
    });

    it('入力の状態を変更しない（アーティファクト追加）', () => {
      const state = createEmptyInventory();
      const originalLength = state.artifacts.length;

      addArtifact(state, 'artifact-001' as ArtifactId);

      expect(state.artifacts.length).toBe(originalLength);
    });
  });
});
