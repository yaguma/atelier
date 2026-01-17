/**
 * UIテーマ定義
 * TASK-0018 共通UIコンポーネント基盤
 *
 * @description
 * ゲーム全体で使用するUIテーマ（カラー、フォント、サイズ、スペーシング）を定義
 * 錬金術をテーマにしたデザインで、茶色とベージュを基調とする
 */

export const THEME = {
  colors: {
    primary: 0x8b4513, // SaddleBrown - プライマリアクション用
    secondary: 0xd2691e, // Chocolate - セカンダリアクション用
    background: 0xf5f5dc, // Beige - 背景色
    text: 0x333333, // ダークグレー - テキスト色
    textLight: 0x666666, // ミディアムグレー - ライトテキスト色
    success: 0x228b22, // ForestGreen - 成功状態
    warning: 0xdaa520, // Goldenrod - 警告状態
    error: 0x8b0000, // DarkRed - エラー状態
    disabled: 0xcccccc, // ライトグレー - 無効状態
  },
  fonts: {
    primary: 'Noto Sans JP', // プライマリフォント（日本語対応）
    secondary: 'sans-serif', // フォールバック用セカンダリフォント
  },
  sizes: {
    small: 14, // 小さいテキスト用
    medium: 16, // 標準テキスト用
    large: 20, // 中見出し用
    xlarge: 24, // 大見出し用
  },
  spacing: {
    xs: 4, // 最小スペーシング
    sm: 8, // 小スペーシング
    md: 16, // 中スペーシング
    lg: 24, // 大スペーシング
    xl: 32, // 最大スペーシング
  },
} as const;
