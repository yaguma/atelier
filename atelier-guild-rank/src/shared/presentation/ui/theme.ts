/**
 * UIテーマ定義
 * TASK-0018 共通UIコンポーネント基盤
 *
 * @deprecated TASK-0067: @shared/theme からインポートしてください
 */

// 後方互換性のため再エクスポート
export type {
  BackgroundColorKey,
  BorderColorKey,
  CardTypeColorKey,
  ColorKey,
  TextColorKey,
} from '@shared/theme';
export { Colors, THEME } from '@shared/theme';
