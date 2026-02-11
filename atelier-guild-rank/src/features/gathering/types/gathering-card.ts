/**
 * gathering-card.ts - 採取カード関連の型定義
 *
 * TASK-0072: features/gathering/types作成
 *
 * shared/typesの採取カード型を再エクスポートし、
 * features/gathering経由でアクセスできるようにする。
 */

export type { IGatheringCard, IGatheringMaterial } from '@shared/types';
export { isGatheringCard } from '@shared/types';
