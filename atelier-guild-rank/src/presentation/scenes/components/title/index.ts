/**
 * Title Components（後方互換性用再エクスポート）
 *
 * @description
 * 実体は scenes/components/title/ に移動済み。
 * 後方互換性のため再エクスポートを提供する。
 *
 * 新規コードでは @scenes/components/title を使用すること。
 */
export { TitleDialog } from '@scenes/components/title/TitleDialog';
export { TitleLogo } from '@scenes/components/title/TitleLogo';
export { TitleMenu } from '@scenes/components/title/TitleMenu';

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
} from '@scenes/components/title/types';

export {
  TITLE_ANIMATION,
  TITLE_DEPTH,
  TITLE_LAYOUT,
  TITLE_SIZES,
  TITLE_STYLES,
  TITLE_TEXT,
} from '@scenes/components/title/types';
