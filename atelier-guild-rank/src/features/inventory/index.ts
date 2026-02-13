/**
 * @module features/inventory
 * @description インベントリ機能モジュール
 *
 * 素材・アイテムのインベントリ管理、フィルタリング、
 * およびUI表示コンポーネントを提供する。
 *
 * TASK-0087: features/inventory/index.ts公開API作成
 *
 * @example
 * ```typescript
 * import {
 *   addMaterial,
 *   filterMaterialsByQuality,
 *   createEmptyInventory,
 *   ItemInventoryUI,
 *   MaterialListUI,
 * } from '@features/inventory';
 *
 * // インベントリ操作
 * const inventory = createEmptyInventory();
 * const result = addMaterial(inventory, material);
 *
 * // フィルタリング
 * const filtered = filterMaterialsByQuality(materials, 'A');
 * ```
 */

// =============================================================================
// Types - インベントリ関連の型定義
// =============================================================================

export type {
  IInventoryService,
  IItem,
  IItemEffect,
  IMaterial,
  IMaterialInstance,
  IMaterialService,
} from './types';
export { ItemInstance, MaterialInstance } from './types';

// =============================================================================
// Services - インベントリ関連のビジネスロジック（純粋関数）
// =============================================================================

export type { InventoryOperationResult, InventoryState } from './services';
export {
  addArtifact,
  addItem,
  addMaterial,
  addMaterials,
  clearInventory,
  createEmptyInventory,
  filterItemsByQuality,
  filterItemsByType,
  filterMaterialsByAttribute,
  filterMaterialsById,
  filterMaterialsByQuality,
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
} from './services';

// =============================================================================
// Components - インベントリ関連UIコンポーネント
// =============================================================================

export type {
  ItemInventoryUIConfig,
  MaterialDetailUIConfig,
  MaterialListUIConfig,
} from './components';
export { ItemInventoryUI, MaterialDetailUI, MaterialListUI } from './components';
