/**
 * インベントリドメインサービスのテスト
 * TASK-0091: インベントリドメインサービス
 *
 * 素材・アイテムの保管・管理をテストする
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  InventoryService,
  createInventory,
  type Inventory,
} from '../../../../src/domain/services/InventoryService';
import {
  MaterialInstance,
  createMaterialInstance,
} from '../../../../src/domain/material/MaterialEntity';
import {
  CraftedItem,
  createCraftedItem,
} from '../../../../src/domain/item/ItemEntity';
import {
  Quality,
  ItemEffectType,
  Attribute,
} from '../../../../src/domain/common/types';
import type { IMaterialInstance } from '../../../../src/domain/material/Material';
import type { ICraftedItem } from '../../../../src/domain/item/Item';

describe('InventoryService', () => {
  // テスト用素材データ
  const sampleMaterialData: IMaterialInstance = {
    materialId: 'herb',
    quality: Quality.C,
    quantity: 5,
  };

  const sampleMaterialData2: IMaterialInstance = {
    materialId: 'ore',
    quality: Quality.B,
    quantity: 3,
  };

  // テスト用アイテムデータ
  const sampleCraftedItemData: ICraftedItem = {
    itemId: 'healing_potion',
    quality: Quality.B,
    attributeValues: [{ attribute: Attribute.GRASS, value: 10 }],
    effectValues: [{ type: ItemEffectType.HP_RECOVERY, value: 50 }],
    usedMaterials: [{ materialId: 'herb', quantity: 2, quality: Quality.C, isRare: false }],
  };

  const sampleCraftedItemData2: ICraftedItem = {
    itemId: 'bomb',
    quality: Quality.A,
    attributeValues: [{ attribute: Attribute.FIRE, value: 20 }],
    effectValues: [{ type: ItemEffectType.EXPLOSION, value: 100 }],
    usedMaterials: [{ materialId: 'ore', quantity: 3, quality: Quality.B, isRare: false }],
  };

  let inventoryService: InventoryService;

  beforeEach(() => {
    inventoryService = new InventoryService();
  });

  describe('Inventory（インベントリデータ構造）', () => {
    it('空のインベントリを生成できる', () => {
      const inventory = createInventory();

      expect(inventory.materials).toEqual([]);
      expect(inventory.items).toEqual([]);
      expect(inventory.materialCapacity).toBe(50); // デフォルト上限
    });

    it('素材上限を指定してインベントリを生成できる', () => {
      const inventory = createInventory([], [], 100);

      expect(inventory.materialCapacity).toBe(100);
    });
  });

  describe('addMaterial（素材追加）', () => {
    it('素材を追加できる', () => {
      const inventory = createInventory();
      const material = createMaterialInstance(sampleMaterialData);

      const result = inventoryService.addMaterial(inventory, material);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.materials).toHaveLength(1);
        expect(result.value.materials[0].materialId).toBe('herb');
        expect(result.value.materials[0].quantity).toBe(5);
      }
    });

    it('同じ素材ID・品質の素材は数量が合算される', () => {
      const material1 = createMaterialInstance({ materialId: 'herb', quality: Quality.C, quantity: 3 });
      const material2 = createMaterialInstance({ materialId: 'herb', quality: Quality.C, quantity: 2 });
      const inventory = createInventory([material1]);

      const result = inventoryService.addMaterial(inventory, material2);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.materials).toHaveLength(1);
        expect(result.value.materials[0].quantity).toBe(5);
      }
    });

    it('同じ素材IDでも品質が異なれば別々に保管される', () => {
      const material1 = createMaterialInstance({ materialId: 'herb', quality: Quality.C, quantity: 3 });
      const material2 = createMaterialInstance({ materialId: 'herb', quality: Quality.B, quantity: 2 });
      const inventory = createInventory([material1]);

      const result = inventoryService.addMaterial(inventory, material2);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.materials).toHaveLength(2);
      }
    });

    it('素材保管上限を超えると追加できない', () => {
      const existingMaterials = [
        createMaterialInstance({ materialId: 'herb', quality: Quality.C, quantity: 50 }),
      ];
      const inventory = createInventory(existingMaterials, [], 50);

      const material = createMaterialInstance({ materialId: 'ore', quality: Quality.B, quantity: 1 });
      const result = inventoryService.addMaterial(inventory, material);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('素材保管上限を超えています');
      }
    });

    it('上限まで追加して上限に達する場合は成功する', () => {
      const existingMaterials = [
        createMaterialInstance({ materialId: 'herb', quality: Quality.C, quantity: 45 }),
      ];
      const inventory = createInventory(existingMaterials, [], 50);

      const material = createMaterialInstance({ materialId: 'ore', quality: Quality.B, quantity: 5 });
      const result = inventoryService.addMaterial(inventory, material);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(inventoryService.getTotalMaterialCount(result.value)).toBe(50);
      }
    });
  });

  describe('consumeMaterial（素材消費）', () => {
    it('素材を消費できる', () => {
      const materials = [createMaterialInstance(sampleMaterialData)]; // quantity: 5
      const inventory = createInventory(materials);

      const result = inventoryService.consumeMaterial(inventory, 'herb', Quality.C, 3);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.materials[0].quantity).toBe(2);
      }
    });

    it('全数量を消費するとリストから削除される', () => {
      const materials = [createMaterialInstance(sampleMaterialData)]; // quantity: 5
      const inventory = createInventory(materials);

      const result = inventoryService.consumeMaterial(inventory, 'herb', Quality.C, 5);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.materials).toHaveLength(0);
      }
    });

    it('所持数より多く消費しようとするとエラー', () => {
      const materials = [createMaterialInstance(sampleMaterialData)]; // quantity: 5
      const inventory = createInventory(materials);

      const result = inventoryService.consumeMaterial(inventory, 'herb', Quality.C, 10);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('素材が不足しています');
      }
    });

    it('存在しない素材を消費しようとするとエラー', () => {
      const inventory = createInventory();

      const result = inventoryService.consumeMaterial(inventory, 'herb', Quality.C, 1);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('指定された素材が見つかりません');
      }
    });

    it('品質が異なる素材は消費できない', () => {
      const materials = [createMaterialInstance({ materialId: 'herb', quality: Quality.C, quantity: 5 })];
      const inventory = createInventory(materials);

      // Quality.Bのherbは存在しない
      const result = inventoryService.consumeMaterial(inventory, 'herb', Quality.B, 3);

      expect(result.success).toBe(false);
    });
  });

  describe('addItem（アイテム追加）', () => {
    it('アイテムを追加できる', () => {
      const inventory = createInventory();
      const item = createCraftedItem(sampleCraftedItemData);

      const result = inventoryService.addItem(inventory, item);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.items).toHaveLength(1);
        expect(result.value.items[0].itemId).toBe('healing_potion');
      }
    });

    it('複数のアイテムを追加できる', () => {
      const item1 = createCraftedItem(sampleCraftedItemData);
      const item2 = createCraftedItem(sampleCraftedItemData2);
      let inventory = createInventory();

      const result1 = inventoryService.addItem(inventory, item1);
      expect(result1.success).toBe(true);
      if (result1.success) {
        inventory = result1.value;
      }

      const result2 = inventoryService.addItem(inventory, item2);
      expect(result2.success).toBe(true);
      if (result2.success) {
        expect(result2.value.items).toHaveLength(2);
      }
    });
  });

  describe('consumeItem（アイテム消費）', () => {
    it('アイテムを消費できる', () => {
      const items = [createCraftedItem(sampleCraftedItemData)];
      const inventory = createInventory([], items);

      const result = inventoryService.consumeItem(inventory, 'healing_potion', Quality.B);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.inventory.items).toHaveLength(0);
        expect(result.value.consumedItem.itemId).toBe('healing_potion');
      }
    });

    it('同じIDで複数の品質がある場合、指定した品質のものを消費する', () => {
      const items = [
        createCraftedItem({ ...sampleCraftedItemData, quality: Quality.C }),
        createCraftedItem({ ...sampleCraftedItemData, quality: Quality.B }),
        createCraftedItem({ ...sampleCraftedItemData, quality: Quality.A }),
      ];
      const inventory = createInventory([], items);

      const result = inventoryService.consumeItem(inventory, 'healing_potion', Quality.B);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.inventory.items).toHaveLength(2);
        expect(result.value.consumedItem.quality).toBe(Quality.B);
      }
    });

    it('存在しないアイテムを消費しようとするとエラー', () => {
      const inventory = createInventory();

      const result = inventoryService.consumeItem(inventory, 'healing_potion', Quality.B);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('指定されたアイテムが見つかりません');
      }
    });
  });

  describe('getMaterialCount（素材所持数取得）', () => {
    it('素材の所持数を取得できる', () => {
      const materials = [createMaterialInstance(sampleMaterialData)]; // quantity: 5
      const inventory = createInventory(materials);

      const count = inventoryService.getMaterialCount(inventory, 'herb', Quality.C);

      expect(count).toBe(5);
    });

    it('品質を指定しない場合は全品質の合計を取得', () => {
      const materials = [
        createMaterialInstance({ materialId: 'herb', quality: Quality.C, quantity: 5 }),
        createMaterialInstance({ materialId: 'herb', quality: Quality.B, quantity: 3 }),
        createMaterialInstance({ materialId: 'herb', quality: Quality.A, quantity: 2 }),
      ];
      const inventory = createInventory(materials);

      const count = inventoryService.getMaterialCount(inventory, 'herb');

      expect(count).toBe(10);
    });

    it('存在しない素材の所持数は0', () => {
      const inventory = createInventory();

      const count = inventoryService.getMaterialCount(inventory, 'herb', Quality.C);

      expect(count).toBe(0);
    });
  });

  describe('getItemCount（アイテム所持数取得）', () => {
    it('アイテムの所持数を取得できる', () => {
      const items = [
        createCraftedItem(sampleCraftedItemData),
        createCraftedItem(sampleCraftedItemData),
        createCraftedItem(sampleCraftedItemData2),
      ];
      const inventory = createInventory([], items);

      const count = inventoryService.getItemCount(inventory, 'healing_potion');

      expect(count).toBe(2);
    });

    it('品質を指定した場合はその品質のアイテム数を取得', () => {
      const items = [
        createCraftedItem({ ...sampleCraftedItemData, quality: Quality.C }),
        createCraftedItem({ ...sampleCraftedItemData, quality: Quality.B }),
        createCraftedItem({ ...sampleCraftedItemData, quality: Quality.B }),
      ];
      const inventory = createInventory([], items);

      const count = inventoryService.getItemCount(inventory, 'healing_potion', Quality.B);

      expect(count).toBe(2);
    });

    it('存在しないアイテムの所持数は0', () => {
      const inventory = createInventory();

      const count = inventoryService.getItemCount(inventory, 'healing_potion');

      expect(count).toBe(0);
    });
  });

  describe('getTotalMaterialCount（総素材数取得）', () => {
    it('インベントリ内の総素材数を取得できる', () => {
      const materials = [
        createMaterialInstance({ materialId: 'herb', quality: Quality.C, quantity: 5 }),
        createMaterialInstance({ materialId: 'ore', quality: Quality.B, quantity: 3 }),
        createMaterialInstance({ materialId: 'crystal', quality: Quality.A, quantity: 2 }),
      ];
      const inventory = createInventory(materials);

      const count = inventoryService.getTotalMaterialCount(inventory);

      expect(count).toBe(10);
    });
  });

  describe('hasMaterial（素材所持判定）', () => {
    it('素材を所持しているか判定できる', () => {
      const materials = [createMaterialInstance(sampleMaterialData)];
      const inventory = createInventory(materials);

      expect(inventoryService.hasMaterial(inventory, 'herb', Quality.C, 3)).toBe(true);
      expect(inventoryService.hasMaterial(inventory, 'herb', Quality.C, 5)).toBe(true);
      expect(inventoryService.hasMaterial(inventory, 'herb', Quality.C, 10)).toBe(false);
    });
  });

  describe('hasItem（アイテム所持判定）', () => {
    it('アイテムを所持しているか判定できる', () => {
      const items = [createCraftedItem(sampleCraftedItemData)];
      const inventory = createInventory([], items);

      expect(inventoryService.hasItem(inventory, 'healing_potion')).toBe(true);
      expect(inventoryService.hasItem(inventory, 'healing_potion', Quality.B)).toBe(true);
      expect(inventoryService.hasItem(inventory, 'healing_potion', Quality.A)).toBe(false);
      expect(inventoryService.hasItem(inventory, 'bomb')).toBe(false);
    });
  });

  describe('不変性', () => {
    it('addMaterialは元のインベントリを変更しない', () => {
      const inventory = createInventory();
      const originalMaterialsLength = inventory.materials.length;

      const result = inventoryService.addMaterial(
        inventory,
        createMaterialInstance(sampleMaterialData)
      );

      expect(inventory.materials).toHaveLength(originalMaterialsLength);
      if (result.success) {
        expect(result.value.materials).not.toBe(inventory.materials);
      }
    });

    it('consumeMaterialは元のインベントリを変更しない', () => {
      const materials = [createMaterialInstance(sampleMaterialData)];
      const inventory = createInventory(materials);
      const originalQuantity = inventory.materials[0].quantity;

      const result = inventoryService.consumeMaterial(inventory, 'herb', Quality.C, 2);

      expect(inventory.materials[0].quantity).toBe(originalQuantity);
      if (result.success) {
        expect(result.value.materials).not.toBe(inventory.materials);
      }
    });

    it('addItemは元のインベントリを変更しない', () => {
      const inventory = createInventory();
      const originalItemsLength = inventory.items.length;

      const result = inventoryService.addItem(
        inventory,
        createCraftedItem(sampleCraftedItemData)
      );

      expect(inventory.items).toHaveLength(originalItemsLength);
      if (result.success) {
        expect(result.value.items).not.toBe(inventory.items);
      }
    });
  });
});
