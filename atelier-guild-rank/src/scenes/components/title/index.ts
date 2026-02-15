/**
 * Title Components エクスポート
 * TASK-0058 TitleSceneリファクタリング
 *
 * @description
 * TitleScene関連コンポーネントの一括エクスポート
 */

// コンポーネントのエクスポート
export { TitleDialog } from './TitleDialog';
export { TitleLogo } from './TitleLogo';
export { TitleMenu } from './TitleMenu';

// 型定義のエクスポート
export type {
  DialogType,
  ITitleDialogConfig,
  ITitleLogoConfig,
  ITitleMenuConfig,
  OnContinueCallback,
  OnDialogCloseCallback,
  OnDialogConfirmCallback,
  OnNewGameCallback,
  OnSettingsCallback,
} from './types';

// 定数のエクスポート
export {
  TITLE_ANIMATION,
  TITLE_DEPTH,
  TITLE_LAYOUT,
  TITLE_SIZES,
  TITLE_STYLES,
  TITLE_TEXT,
} from './types';
