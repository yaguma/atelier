/**
 * item.ts - アイテム関連の型定義
 *
 * TASK-0084: features/inventory/types作成
 *
 * shared/typesのアイテム型とdomain/entitiesのItemInstanceクラスを
 * 再エクスポートし、features/inventory経由でアクセスできるようにする。
 */

export { ItemInstance } from '@domain/entities/ItemInstance';
export type { IItem, IItemEffect } from '@shared/types/materials';
