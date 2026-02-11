/**
 * gathering-service.interface.ts - GatheringServiceインターフェース（後方互換性）
 *
 * TASK-0072: features/gathering/typesへ移行済み
 * このファイルは後方互換性のための再エクスポート。
 * 新しいコードでは @features/gathering/types からインポートすること。
 */

export type {
  DraftSession,
  GatheringCostResult,
  GatheringResult,
  IGatheringService,
  MaterialOption,
} from '@features/gathering/types';
