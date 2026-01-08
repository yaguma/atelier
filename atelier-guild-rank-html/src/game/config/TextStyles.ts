/**
 * テキストスタイル定義
 *
 * ゲーム内で使用するテキストスタイル（フォント、サイズ、色）を一元管理する。
 * 設計文書: docs/design/atelier-guild-rank-phaser/ui-design/overview.md
 */
import Phaser from 'phaser';

/** 基本フォント設定（日本語対応） */
const BASE_FONT = '"Noto Sans JP", "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif';

/**
 * テキストスタイル定義オブジェクト
 */
export const TextStyles = {
  /** タイトル（大） - ゲームタイトル等 */
  titleLarge: {
    fontFamily: BASE_FONT,
    fontSize: '48px',
    fontStyle: 'bold',
    color: '#ffffff',
    stroke: '#000000',
    strokeThickness: 2,
  } as Phaser.Types.GameObjects.Text.TextStyle,

  /** タイトル（中） - セクションタイトル等 */
  titleMedium: {
    fontFamily: BASE_FONT,
    fontSize: '36px',
    fontStyle: 'bold',
    color: '#ffffff',
  } as Phaser.Types.GameObjects.Text.TextStyle,

  /** タイトル（小） - サブセクションタイトル等 */
  titleSmall: {
    fontFamily: BASE_FONT,
    fontSize: '24px',
    fontStyle: 'bold',
    color: '#ffffff',
  } as Phaser.Types.GameObjects.Text.TextStyle,

  /** 本文 - 通常のテキスト */
  body: {
    fontFamily: BASE_FONT,
    fontSize: '16px',
    color: '#e0e0e0',
  } as Phaser.Types.GameObjects.Text.TextStyle,

  /** 本文（小） - 補足説明等 */
  bodySmall: {
    fontFamily: BASE_FONT,
    fontSize: '14px',
    color: '#b0b0b0',
  } as Phaser.Types.GameObjects.Text.TextStyle,

  /** ラベル - UI項目名 */
  label: {
    fontFamily: BASE_FONT,
    fontSize: '14px',
    fontStyle: 'bold',
    color: '#a0a0a0',
  } as Phaser.Types.GameObjects.Text.TextStyle,

  /** 数値（大） - 重要な数値表示 */
  numberLarge: {
    fontFamily: BASE_FONT,
    fontSize: '32px',
    fontStyle: 'bold',
    color: '#ffd700',
  } as Phaser.Types.GameObjects.Text.TextStyle,

  /** 数値 - 通常の数値表示 */
  number: {
    fontFamily: BASE_FONT,
    fontSize: '20px',
    fontStyle: 'bold',
    color: '#ffffff',
  } as Phaser.Types.GameObjects.Text.TextStyle,

  /** ボタン - ボタン内テキスト */
  button: {
    fontFamily: BASE_FONT,
    fontSize: '18px',
    fontStyle: 'bold',
    color: '#ffffff',
  } as Phaser.Types.GameObjects.Text.TextStyle,

  /** カード名 */
  cardName: {
    fontFamily: BASE_FONT,
    fontSize: '14px',
    fontStyle: 'bold',
    color: '#ffffff',
  } as Phaser.Types.GameObjects.Text.TextStyle,

  /** カード説明 */
  cardDescription: {
    fontFamily: BASE_FONT,
    fontSize: '11px',
    color: '#c0c0c0',
    wordWrap: { width: 140 },
  } as Phaser.Types.GameObjects.Text.TextStyle,

  /** カードコスト */
  cardCost: {
    fontFamily: BASE_FONT,
    fontSize: '16px',
    fontStyle: 'bold',
    color: '#ffd700',
  } as Phaser.Types.GameObjects.Text.TextStyle,

  /** ランク表示 */
  rank: {
    fontFamily: BASE_FONT,
    fontSize: '28px',
    fontStyle: 'bold',
    color: '#ffd700',
    stroke: '#8b4513',
    strokeThickness: 2,
  } as Phaser.Types.GameObjects.Text.TextStyle,

  /** 日数表示 */
  dayCount: {
    fontFamily: BASE_FONT,
    fontSize: '20px',
    fontStyle: 'bold',
    color: '#ffffff',
  } as Phaser.Types.GameObjects.Text.TextStyle,

  /** ゴールド表示 */
  gold: {
    fontFamily: BASE_FONT,
    fontSize: '20px',
    fontStyle: 'bold',
    color: '#ffd700',
  } as Phaser.Types.GameObjects.Text.TextStyle,

  /** AP表示 */
  ap: {
    fontFamily: BASE_FONT,
    fontSize: '20px',
    fontStyle: 'bold',
    color: '#66ccff',
  } as Phaser.Types.GameObjects.Text.TextStyle,

  /** 依頼名 */
  questName: {
    fontFamily: BASE_FONT,
    fontSize: '16px',
    fontStyle: 'bold',
    color: '#ffffff',
  } as Phaser.Types.GameObjects.Text.TextStyle,

  /** 依頼詳細 */
  questDetail: {
    fontFamily: BASE_FONT,
    fontSize: '14px',
    color: '#c0c0c0',
    wordWrap: { width: 280 },
  } as Phaser.Types.GameObjects.Text.TextStyle,

  /** 報酬表示 */
  reward: {
    fontFamily: BASE_FONT,
    fontSize: '16px',
    fontStyle: 'bold',
    color: '#90ee90',
  } as Phaser.Types.GameObjects.Text.TextStyle,

  /** 警告・エラー */
  warning: {
    fontFamily: BASE_FONT,
    fontSize: '16px',
    fontStyle: 'bold',
    color: '#ff6b6b',
  } as Phaser.Types.GameObjects.Text.TextStyle,

  /** 成功メッセージ */
  success: {
    fontFamily: BASE_FONT,
    fontSize: '16px',
    fontStyle: 'bold',
    color: '#90ee90',
  } as Phaser.Types.GameObjects.Text.TextStyle,
} as const;

/**
 * テキストスタイルキーの型定義
 */
export type TextStyleKey = keyof typeof TextStyles;

/**
 * 指定されたキーのテキストスタイルを取得する
 * @param key テキストスタイルキー
 * @returns テキストスタイルオブジェクト（複製）
 */
export const getTextStyle = (key: TextStyleKey): Phaser.Types.GameObjects.Text.TextStyle => {
  return { ...TextStyles[key] };
};

/**
 * ベーススタイルにカスタムスタイルをマージする
 * @param base ベースとなるテキストスタイルキー
 * @param overrides 上書きするスタイルプロパティ
 * @returns マージされたテキストスタイル
 */
export const mergeTextStyle = (
  base: TextStyleKey,
  overrides: Partial<Phaser.Types.GameObjects.Text.TextStyle>
): Phaser.Types.GameObjects.Text.TextStyle => {
  return { ...TextStyles[base], ...overrides };
};
