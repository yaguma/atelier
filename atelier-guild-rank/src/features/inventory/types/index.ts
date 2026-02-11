/**
 * Inventory Types - インベントリ機能の型定義バレルエクスポート
 *
 * TASK-0084: features/inventory/types作成
 */

// --- アイテム関連型 ---
export type { IItem, IItemEffect } from './item';
export { ItemInstance } from './item';

// --- 素材関連型 ---
export type { IMaterial, IMaterialInstance } from './material';
export { MaterialInstance } from './material';

// --- サービスインターフェース ---
export type { IInventoryService, IMaterialService } from './service-interfaces';
