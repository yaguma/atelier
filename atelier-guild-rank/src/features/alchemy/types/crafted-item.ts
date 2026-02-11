/**
 * crafted-item.ts - 調合済みアイテム関連の型定義
 *
 * TASK-0076: features/alchemy/types作成
 *
 * shared/typesの調合済みアイテム型を再エクスポートし、
 * features/alchemy経由でアクセスできるようにする。
 */

export type {
  IAttributeValue,
  ICraftedItem,
  IEffectValue,
  IUsedMaterial,
} from '@shared/types';
