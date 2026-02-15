/**
 * KeyboardManager（後方互換性用再エクスポート）
 *
 * @description
 * 実体は shared/services/input/KeyboardManager.ts に移動済み。
 * 後方互換性のため再エクスポートを提供する。
 *
 * 新規コードでは @shared/services を使用すること。
 */
export {
  type ActionHandler,
  type FocusableElement,
  type KeyboardEventHandler,
  KeyboardManager,
  type SelectionHandler,
} from '@shared/services/input/KeyboardManager';
