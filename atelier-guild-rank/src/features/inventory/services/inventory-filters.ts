/**
 * inventory-filters.ts - インベントリフィルタリングの純粋関数
 *
 * TASK-0085: features/inventory/services作成
 *
 * 素材・アイテムのフィルタリングをイミュータブルな純粋関数として提供する。
 */

import type { ItemInstance } from '@domain/entities/ItemInstance';
import type { MaterialInstance } from '@domain/entities/MaterialInstance';
import type { Attribute, ItemId, Quality } from '@shared/types';

import type { InventoryState } from './inventory-operations';

// =============================================================================
// 素材フィルタリング（純粋関数）
// =============================================================================

/**
 * 属性で素材をフィルタリングする
 *
 * @param state - インベントリ状態
 * @param attribute - フィルタリングする属性
 * @returns フィルタリングされた素材の配列
 */
export function filterMaterialsByAttribute(
  state: InventoryState,
  attribute: Attribute,
): MaterialInstance[] {
  return state.materials.filter((m) => m.attributes.includes(attribute));
}

/**
 * 品質で素材をフィルタリングする
 *
 * @param state - インベントリ状態
 * @param quality - フィルタリングする品質
 * @returns フィルタリングされた素材の配列
 */
export function filterMaterialsByQuality(
  state: InventoryState,
  quality: Quality,
): MaterialInstance[] {
  return state.materials.filter((m) => m.quality === quality);
}

/**
 * 素材IDで素材をフィルタリングする
 *
 * @param state - インベントリ状態
 * @param materialId - フィルタリングする素材ID
 * @returns フィルタリングされた素材の配列
 */
export function filterMaterialsById(state: InventoryState, materialId: string): MaterialInstance[] {
  return state.materials.filter((m) => m.materialId === materialId);
}

// =============================================================================
// アイテムフィルタリング（純粋関数）
// =============================================================================

/**
 * アイテムIDでアイテムをフィルタリングする
 *
 * @param state - インベントリ状態
 * @param itemId - フィルタリングするアイテムID
 * @returns フィルタリングされたアイテムの配列
 */
export function filterItemsByType(state: InventoryState, itemId: ItemId): ItemInstance[] {
  return state.items.filter((i) => i.itemId === itemId);
}

/**
 * 品質でアイテムをフィルタリングする
 *
 * @param state - インベントリ状態
 * @param quality - フィルタリングする品質
 * @returns フィルタリングされたアイテムの配列
 */
export function filterItemsByQuality(state: InventoryState, quality: Quality): ItemInstance[] {
  return state.items.filter((i) => i.quality === quality);
}
