/**
 * Inventory Services - インベントリ機能サービスのバレルエクスポート
 *
 * TASK-0085: features/inventory/services作成
 */

// --- インベントリフィルタリング ---
export {
  filterItemsByQuality,
  filterItemsByType,
  filterMaterialsByAttribute,
  filterMaterialsById,
  filterMaterialsByQuality,
} from './inventory-filters';
// --- インベントリ操作 ---
export type {
  InventoryOperationResult,
  InventoryState,
} from './inventory-operations';
export {
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
} from './inventory-operations';
