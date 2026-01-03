/**
 * インベントリドメインサービス
 * TASK-0091: インベントリドメインサービス
 *
 * 素材・アイテムの保管・管理を行う
 */

import {
  MaterialInstance,
  createMaterialInstance,
} from '@domain/material/MaterialEntity';
import {
  CraftedItem,
  createCraftedItem,
} from '@domain/item/ItemEntity';
import { Quality } from '@domain/common/types';

/**
 * 操作結果型
 */
export type Result<T> =
  | { success: true; value: T }
  | { success: false; error: string };

/**
 * インベントリデータ構造
 */
export interface Inventory {
  /** 所持素材リスト */
  materials: MaterialInstance[];
  /** 所持アイテムリスト */
  items: CraftedItem[];
  /** 素材保管上限 */
  materialCapacity: number;
}

/**
 * デフォルトの素材保管上限
 */
const DEFAULT_MATERIAL_CAPACITY = 50;

/**
 * 空のインベントリを生成する
 * @param materials 初期素材（オプション）
 * @param items 初期アイテム（オプション）
 * @param materialCapacity 素材上限（オプション）
 * @returns 新しいインベントリ
 */
export function createInventory(
  materials: MaterialInstance[] = [],
  items: CraftedItem[] = [],
  materialCapacity: number = DEFAULT_MATERIAL_CAPACITY
): Inventory {
  return {
    materials: [...materials],
    items: [...items],
    materialCapacity,
  };
}

/**
 * インベントリドメインサービス
 * 素材・アイテムの管理に関するビジネスロジックを提供する
 */
export class InventoryService {
  /**
   * 素材を追加する
   * @param inventory 対象インベントリ
   * @param material 追加する素材
   * @returns 操作結果
   */
  addMaterial(inventory: Inventory, material: MaterialInstance): Result<Inventory> {
    const currentTotal = this.getTotalMaterialCount(inventory);
    const newTotal = currentTotal + material.quantity;

    if (newTotal > inventory.materialCapacity) {
      return { success: false, error: '素材保管上限を超えています' };
    }

    // 同じ素材ID・品質のものを探す
    const existingIndex = inventory.materials.findIndex(
      (m) => m.materialId === material.materialId && m.quality === material.quality
    );

    let newMaterials: MaterialInstance[];

    if (existingIndex !== -1) {
      // 既存の素材に数量を追加
      newMaterials = inventory.materials.map((m, index) => {
        if (index === existingIndex) {
          return m.addQuantity(material.quantity);
        }
        return m;
      });
    } else {
      // 新しい素材として追加
      newMaterials = [...inventory.materials, material];
    }

    return {
      success: true,
      value: {
        ...inventory,
        materials: newMaterials,
      },
    };
  }

  /**
   * 素材を消費する
   * @param inventory 対象インベントリ
   * @param materialId 素材ID
   * @param quality 品質
   * @param quantity 消費数
   * @returns 操作結果
   */
  consumeMaterial(
    inventory: Inventory,
    materialId: string,
    quality: Quality,
    quantity: number
  ): Result<Inventory> {
    const existingIndex = inventory.materials.findIndex(
      (m) => m.materialId === materialId && m.quality === quality
    );

    if (existingIndex === -1) {
      return { success: false, error: '指定された素材が見つかりません' };
    }

    const existingMaterial = inventory.materials[existingIndex];

    if (existingMaterial.quantity < quantity) {
      return { success: false, error: '素材が不足しています' };
    }

    let newMaterials: MaterialInstance[];

    if (existingMaterial.quantity === quantity) {
      // 全数量を消費する場合はリストから削除
      newMaterials = inventory.materials.filter((_, index) => index !== existingIndex);
    } else {
      // 数量を減らす
      newMaterials = inventory.materials.map((m, index) => {
        if (index === existingIndex) {
          return m.subtractQuantity(quantity);
        }
        return m;
      });
    }

    return {
      success: true,
      value: {
        ...inventory,
        materials: newMaterials,
      },
    };
  }

  /**
   * アイテムを追加する
   * @param inventory 対象インベントリ
   * @param item 追加するアイテム
   * @returns 操作結果
   */
  addItem(inventory: Inventory, item: CraftedItem): Result<Inventory> {
    return {
      success: true,
      value: {
        ...inventory,
        items: [...inventory.items, item],
      },
    };
  }

  /**
   * アイテムを消費する
   * @param inventory 対象インベントリ
   * @param itemId アイテムID
   * @param quality 品質
   * @returns 操作結果（インベントリと消費したアイテム）
   */
  consumeItem(
    inventory: Inventory,
    itemId: string,
    quality: Quality
  ): Result<{ inventory: Inventory; consumedItem: CraftedItem }> {
    const existingIndex = inventory.items.findIndex(
      (i) => i.itemId === itemId && i.quality === quality
    );

    if (existingIndex === -1) {
      return { success: false, error: '指定されたアイテムが見つかりません' };
    }

    const consumedItem = inventory.items[existingIndex];
    const newItems = inventory.items.filter((_, index) => index !== existingIndex);

    return {
      success: true,
      value: {
        inventory: {
          ...inventory,
          items: newItems,
        },
        consumedItem,
      },
    };
  }

  /**
   * 素材の所持数を取得する
   * @param inventory 対象インベントリ
   * @param materialId 素材ID
   * @param quality 品質（省略時は全品質の合計）
   * @returns 所持数
   */
  getMaterialCount(inventory: Inventory, materialId: string, quality?: Quality): number {
    if (quality !== undefined) {
      const material = inventory.materials.find(
        (m) => m.materialId === materialId && m.quality === quality
      );
      return material?.quantity ?? 0;
    }

    // 品質指定なしの場合は全品質の合計
    return inventory.materials
      .filter((m) => m.materialId === materialId)
      .reduce((sum, m) => sum + m.quantity, 0);
  }

  /**
   * アイテムの所持数を取得する
   * @param inventory 対象インベントリ
   * @param itemId アイテムID
   * @param quality 品質（省略時は全品質の合計）
   * @returns 所持数
   */
  getItemCount(inventory: Inventory, itemId: string, quality?: Quality): number {
    if (quality !== undefined) {
      return inventory.items.filter(
        (i) => i.itemId === itemId && i.quality === quality
      ).length;
    }

    return inventory.items.filter((i) => i.itemId === itemId).length;
  }

  /**
   * 総素材数を取得する
   * @param inventory 対象インベントリ
   * @returns 総素材数
   */
  getTotalMaterialCount(inventory: Inventory): number {
    return inventory.materials.reduce((sum, m) => sum + m.quantity, 0);
  }

  /**
   * 素材を所持しているか判定する
   * @param inventory 対象インベントリ
   * @param materialId 素材ID
   * @param quality 品質
   * @param quantity 必要数
   * @returns 所持している場合true
   */
  hasMaterial(
    inventory: Inventory,
    materialId: string,
    quality: Quality,
    quantity: number
  ): boolean {
    const count = this.getMaterialCount(inventory, materialId, quality);
    return count >= quantity;
  }

  /**
   * アイテムを所持しているか判定する
   * @param inventory 対象インベントリ
   * @param itemId アイテムID
   * @param quality 品質（省略時は任意品質）
   * @returns 所持している場合true
   */
  hasItem(inventory: Inventory, itemId: string, quality?: Quality): boolean {
    if (quality !== undefined) {
      return inventory.items.some((i) => i.itemId === itemId && i.quality === quality);
    }
    return inventory.items.some((i) => i.itemId === itemId);
  }
}
