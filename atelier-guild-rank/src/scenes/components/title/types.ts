/**
 * Title関連型定義
 * TASK-0058 TitleSceneリファクタリング
 *
 * @description
 * TitleScene関連コンポーネントで使用する型定義、レイアウト定数、スタイル定数を定義
 */

import { Colors, toColorStr } from '@shared/theme';

// =============================================================================
// コールバック型定義
// =============================================================================

/**
 * 新規ゲームコールバック型
 */
export type OnNewGameCallback = () => void;

/**
 * コンティニューコールバック型
 */
export type OnContinueCallback = () => void;

/**
 * 設定コールバック型
 */
export type OnSettingsCallback = () => void;

/**
 * ダイアログ閉じるコールバック型
 */
export type OnDialogCloseCallback = () => void;

/**
 * ダイアログ確認コールバック型
 */
export type OnDialogConfirmCallback = () => void;

// =============================================================================
// 設定インターフェース
// =============================================================================

/**
 * TitleLogo設定インターフェース
 */
export interface ITitleLogoConfig {
  /** タイトルテキスト */
  title: string;
  /** サブタイトルテキスト */
  subtitle: string;
}

/**
 * TitleMenu設定インターフェース
 */
export interface ITitleMenuConfig {
  /** セーブデータが存在するか */
  hasSaveData: boolean;
  /** 新規ゲームコールバック */
  onNewGame: OnNewGameCallback;
  /** コンティニューコールバック */
  onContinue: OnContinueCallback;
  /** 設定コールバック */
  onSettings: OnSettingsCallback;
}

/**
 * ダイアログタイプ
 */
export type DialogType = 'confirm' | 'settings' | 'error';

/**
 * TitleDialog設定インターフェース
 */
export interface ITitleDialogConfig {
  /** ダイアログタイプ */
  type: DialogType;
  /** ダイアログタイトル */
  title: string;
  /** ダイアログ内容 */
  content: string;
  /** 確認コールバック（confirm型のみ） */
  onConfirm?: OnDialogConfirmCallback;
  /** 閉じるコールバック */
  onClose: OnDialogCloseCallback;
}

// =============================================================================
// レイアウト定数
// =============================================================================

/**
 * タイトルシーンのレイアウト定数
 * @信頼性レベル 🔵 設計文書に基づく座標値
 */
export const TITLE_LAYOUT = {
  /** タイトルロゴのY座標 */
  TITLE_Y: 200,
  /** サブタイトルのY座標 */
  SUBTITLE_Y: 260,
  /** メニューボタンの開始Y座標 */
  BUTTON_START_Y: 400,
  /** メニューボタン間のスペーシング */
  BUTTON_SPACING: 60,
  /** バージョン情報の右下からのオフセット */
  VERSION_OFFSET: 20,
} as const;

// =============================================================================
// スタイル定数
// =============================================================================

/**
 * タイトルシーンのスタイル定数
 * @信頼性レベル 🔵 設計文書に基づくスタイル値
 */
export const TITLE_STYLES = {
  /** タイトルロゴのフォントサイズ */
  TITLE_FONT_SIZE: '48px',
  /** タイトルロゴの色（ブランドセカンダリ） */
  TITLE_COLOR: toColorStr(Colors.brand.secondary),
  /** サブタイトルのフォントサイズ */
  SUBTITLE_FONT_SIZE: '24px',
  /** サブタイトルの色 */
  SUBTITLE_COLOR: toColorStr(Colors.text.secondary),
  /** バージョン情報のフォントサイズ */
  VERSION_FONT_SIZE: '14px',
  /** バージョン情報の色 */
  VERSION_COLOR: toColorStr(Colors.text.muted),
  /** ボタンのフォントサイズ */
  BUTTON_FONT_SIZE: '16px',
  /** ダイアログタイトルのフォントサイズ */
  DIALOG_TITLE_FONT_SIZE: '20px',
  /** ダイアログ内容のフォントサイズ */
  DIALOG_CONTENT_FONT_SIZE: '16px',
} as const;

// =============================================================================
// テキスト定数
// =============================================================================

/**
 * タイトルシーンのテキスト定数
 * @信頼性レベル 🔵 設計文書に基づく文字列
 */
export const TITLE_TEXT = {
  /** タイトル */
  TITLE: 'ATELIER GUILD',
  /** サブタイトル */
  SUBTITLE: '錬金術師ギルド',
  /** バージョン */
  VERSION: 'Version 1.0.0',
  /** 新規ゲーム */
  NEW_GAME: '新規ゲーム',
  /** コンティニュー */
  CONTINUE: 'コンティニュー',
  /** 設定 */
  SETTINGS: '設定',
  /** 確認タイトル */
  CONFIRM_TITLE: '確認',
  /** 確認メッセージ */
  CONFIRM_MESSAGE: 'セーブデータを削除して新規ゲームを開始しますか？',
  /** はい */
  YES: 'はい',
  /** いいえ */
  NO: 'いいえ',
  /** OK */
  OK: 'OK',
  /** 設定タイトル */
  SETTINGS_TITLE: '設定',
  /** 設定スタブ */
  SETTINGS_STUB: '準備中です',
  /** エラータイトル */
  ERROR_TITLE: 'エラー',
} as const;

// =============================================================================
// サイズ定数
// =============================================================================

/**
 * ボタン・ダイアログのサイズ定数
 * @信頼性レベル 🔵 設計文書に基づくサイズ値
 */
export const TITLE_SIZES = {
  /** ボタンの幅 */
  BUTTON_WIDTH: 200,
  /** ボタンの高さ */
  BUTTON_HEIGHT: 50,
  /** ボタンの角丸半径 */
  BUTTON_RADIUS: 8,
  /** ダイアログボタンの幅 */
  DIALOG_BUTTON_WIDTH: 100,
  /** ダイアログボタンの高さ */
  DIALOG_BUTTON_HEIGHT: 40,
  /** ダイアログの角丸半径 */
  DIALOG_RADIUS: 12,
  /** 確認ダイアログの幅 */
  CONFIRM_DIALOG_WIDTH: 400,
  /** 確認ダイアログの高さ */
  CONFIRM_DIALOG_HEIGHT: 200,
  /** 設定ダイアログの幅 */
  SETTINGS_DIALOG_WIDTH: 300,
  /** 設定ダイアログの高さ */
  SETTINGS_DIALOG_HEIGHT: 150,
  /** エラーダイアログの幅 */
  ERROR_DIALOG_WIDTH: 400,
  /** エラーダイアログの高さ */
  ERROR_DIALOG_HEIGHT: 150,
} as const;

// =============================================================================
// アニメーション定数
// =============================================================================

/**
 * アニメーション定数
 * @信頼性レベル 🟡 実装者が決定
 */
export const TITLE_ANIMATION = {
  /** ダイアログポップアップの時間（ミリ秒） */
  DIALOG_POPUP_DURATION: 300,
  /** 無効化時のアルファ値 */
  DISABLED_ALPHA: 0.5,
  /** オーバーレイのアルファ値 */
  OVERLAY_ALPHA: 0.7,
  /** フェードイン・アウトの時間（ミリ秒） */
  FADE_DURATION: 500,
} as const;

// =============================================================================
// 深度定数
// =============================================================================

/**
 * Z-index（描画順序）定数
 * @信頼性レベル 🔵 設計文書に基づく値
 */
export const TITLE_DEPTH = {
  /** オーバーレイの描画深度 */
  OVERLAY: 300,
  /** ダイアログの描画深度 */
  DIALOG: 400,
} as const;

// =============================================================================
// テスト用のエクスポート（型チェック用）
// =============================================================================

// テスト用のエクスポート
export const TitleLogoConfig = {} as ITitleLogoConfig;
export const TitleMenuConfig = {} as ITitleMenuConfig;
export const TitleDialogConfig = {} as ITitleDialogConfig;
export const OnNewGameCallback = (() => {}) as OnNewGameCallback;
export const OnContinueCallback = (() => {}) as OnContinueCallback;
export const OnSettingsCallback = (() => {}) as OnSettingsCallback;
export const OnDialogCloseCallback = (() => {}) as OnDialogCloseCallback;
export const OnDialogConfirmCallback = (() => {}) as OnDialogConfirmCallback;
