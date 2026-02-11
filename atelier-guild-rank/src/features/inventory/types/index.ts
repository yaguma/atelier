/**
 * Inventory Types - インベントリ機能の型定義バレルエクスポート
 *
 * TASK-0084: features/inventory/types作成
 */

// --- エンティティクラス ---
export { ItemInstance } from '@domain/entities/ItemInstance';
export { MaterialInstance } from '@domain/entities/MaterialInstance';

// --- サービスインターフェース ---
export type { IInventoryService } from '@domain/interfaces/inventory-service.interface';
export type { IMaterialService } from '@domain/interfaces/material-service.interface';

// --- 素材・アイテム関連型 ---
export type { IItem, IItemEffect, IMaterial, IMaterialInstance } from '@shared/types';
