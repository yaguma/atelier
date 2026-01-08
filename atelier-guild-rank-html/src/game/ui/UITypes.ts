/**
 * UI型定義
 *
 * UIコンポーネントの共通型とオプションを定義する。
 * 設計文書: docs/design/atelier-guild-rank-phaser/ui-design/overview.md
 */

import Phaser from 'phaser';

// =====================================================
// 基本型
// =====================================================

/**
 * UI位置
 */
export interface UIPosition {
  /** X座標 */
  x: number;
  /** Y座標 */
  y: number;
}

/**
 * UIサイズ
 */
export interface UISize {
  /** 幅 */
  width: number;
  /** 高さ */
  height: number;
}

/**
 * UI境界（位置+サイズ）
 */
export interface UIBounds extends UIPosition, UISize {}

/**
 * パディング設定
 */
export interface UIPadding {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

/**
 * スペース設定
 */
export interface UISpace {
  column?: number;
  row?: number;
}

// =====================================================
// スタイル型
// =====================================================

/**
 * 基本スタイル
 */
export interface UIBaseStyle {
  /** 背景色 */
  backgroundColor?: number;
  /** 背景アルファ */
  backgroundAlpha?: number;
  /** 境界線色 */
  borderColor?: number;
  /** 境界線幅 */
  borderWidth?: number;
  /** 角丸半径 */
  cornerRadius?: number;
  /** パディング */
  padding?: number | UIPadding;
}

/**
 * ボタン状態スタイル
 */
export interface ButtonStateStyle {
  /** 通常時の背景色 */
  normal?: number;
  /** ホバー時の背景色 */
  hover?: number;
  /** プレス時の背景色 */
  pressed?: number;
  /** 無効時の背景色 */
  disabled?: number;
}

// =====================================================
// コンポーネントオプション
// =====================================================

/**
 * ボタンオプション
 */
export interface ButtonOptions extends UIPosition {
  /** ボタンテキスト */
  text: string;
  /** 幅（省略時は自動） */
  width?: number;
  /** 高さ（省略時は自動） */
  height?: number;
  /** スタイル設定 */
  style?: UIBaseStyle & ButtonStateStyle;
  /** テキストスタイル */
  textStyle?: Phaser.Types.GameObjects.Text.TextStyle;
  /** クリックハンドラ */
  onClick?: () => void;
  /** 無効状態 */
  disabled?: boolean;
  /** アイコン（アセットキー） */
  icon?: string;
  /** アイコンサイズ */
  iconSize?: number;
}

/**
 * ラベルオプション
 */
export interface LabelOptions extends UIPosition {
  /** ラベルテキスト */
  text: string;
  /** アイコン（アセットキー） */
  icon?: string;
  /** アイコンサイズ */
  iconSize?: number;
  /** テキストスタイル */
  textStyle?: Phaser.Types.GameObjects.Text.TextStyle;
  /** 配置方向 */
  orientation?: 'horizontal' | 'vertical';
  /** アイコンとテキストの間隔 */
  space?: number;
  /** 配置アンカー */
  align?: 'left' | 'center' | 'right';
}

/**
 * パネルオプション
 */
export interface PanelOptions extends UIBounds {
  /** スタイル設定 */
  style?: UIBaseStyle;
  /** タイトル */
  title?: string;
  /** タイトルスタイル */
  titleStyle?: Phaser.Types.GameObjects.Text.TextStyle;
  /** コンテンツ */
  content?: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[];
}

/**
 * ダイアログボタン設定
 */
export interface DialogButton {
  /** ボタンテキスト */
  text: string;
  /** クリックハンドラ */
  onClick: () => void;
  /** プライマリボタンかどうか */
  primary?: boolean;
}

/**
 * ダイアログオプション
 */
export interface DialogOptions {
  /** ダイアログタイトル */
  title: string;
  /** コンテンツ（テキストまたはGameObject） */
  content: string | Phaser.GameObjects.GameObject;
  /** ボタン設定 */
  buttons?: DialogButton[];
  /** ダイアログ幅 */
  width?: number;
  /** モーダル表示（背景暗転） */
  modal?: boolean;
  /** 背景クリックで閉じる */
  closeOnBackgroundClick?: boolean;
}

/**
 * プログレスバーオプション
 */
export interface ProgressBarOptions extends UIPosition {
  /** 幅 */
  width: number;
  /** 高さ */
  height: number;
  /** 現在値 */
  value: number;
  /** 最大値 */
  maxValue: number;
  /** バー色 */
  barColor?: number;
  /** 背景色 */
  backgroundColor?: number;
  /** テキスト表示 */
  showText?: boolean;
  /** テキストフォーマット */
  textFormat?: (value: number, maxValue: number) => string;
}

/**
 * スクロールパネルオプション
 */
export interface ScrollPanelOptions extends UIBounds {
  /** コンテンツ */
  content: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[];
  /** スクロールモード */
  scrollMode?: 'vertical' | 'horizontal' | 'both';
  /** スタイル設定 */
  style?: UIBaseStyle;
  /** スクロールバー表示 */
  showScrollbar?: boolean;
}

/**
 * グリッドアイテム設定
 */
export interface GridItem {
  /** アイテムID */
  id: string;
  /** コンテンツ（GameObjectまたはテキスト） */
  content: Phaser.GameObjects.GameObject | string;
  /** 追加データ */
  data?: unknown;
  /** 選択状態 */
  selected?: boolean;
  /** 無効状態 */
  disabled?: boolean;
}

/**
 * グリッドボタンオプション
 */
export interface GridButtonsOptions extends UIPosition {
  /** グリッドアイテム */
  items: GridItem[];
  /** 列数 */
  columns: number;
  /** セル幅 */
  cellWidth: number;
  /** セル高さ */
  cellHeight: number;
  /** セル間隔 */
  space?: UISpace;
  /** アイテムクリックハンドラ */
  onItemClick?: (id: string, data?: unknown) => void;
  /** アイテムホバーハンドラ */
  onItemHover?: (id: string, data?: unknown) => void;
  /** スタイル設定 */
  style?: UIBaseStyle;
}

/**
 * トーストオプション
 */
export interface ToastOptions {
  /** メッセージ */
  message: string;
  /** 表示時間（ミリ秒） */
  duration?: number;
  /** 位置 */
  position?: 'top' | 'center' | 'bottom';
  /** タイプ */
  type?: 'info' | 'success' | 'warning' | 'error';
}

/**
 * ツールチップオプション
 */
export interface TooltipOptions {
  /** ターゲット要素 */
  target: Phaser.GameObjects.GameObject;
  /** ツールチップテキスト */
  text: string;
  /** 表示遅延（ミリ秒） */
  delay?: number;
  /** 位置 */
  position?: 'top' | 'bottom' | 'left' | 'right';
}
