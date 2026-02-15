/**
 * Shared Services Input
 * KeyboardManagerの公開エクスポート
 *
 * TASK-0105: presentation/input層からshared/servicesに移動
 */

export {
  type ActionHandler,
  type FocusableElement,
  type KeyboardEventHandler,
  KeyboardManager,
  type SelectionHandler,
} from './KeyboardManager';
