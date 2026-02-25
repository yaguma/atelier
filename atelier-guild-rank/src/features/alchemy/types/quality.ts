/**
 * quality.ts - 品質関連の型定義と定数
 *
 * TASK-0076: features/alchemy/types作成
 *
 * 調合機能で使用する品質閾値定数を定義する。
 * Quality型自体は@shared/typesで定義されているため再エクスポートする。
 *
 * @deprecated QUALITY_THRESHOLDSは @shared/constants/game-config に移動。
 * 後方互換性のため再エクスポートする。
 */

export { QUALITY_THRESHOLDS } from '@shared/constants';
