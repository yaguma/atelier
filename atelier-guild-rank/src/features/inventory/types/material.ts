/**
 * material.ts - 素材関連の型定義
 *
 * TASK-0084: features/inventory/types作成
 *
 * shared/typesの素材型とdomain/entitiesのMaterialInstanceクラスを
 * 再エクスポートし、features/inventory経由でアクセスできるようにする。
 */

export { MaterialInstance } from '@domain/entities/MaterialInstance';
export type { IMaterial, IMaterialInstance } from '@shared/types';
