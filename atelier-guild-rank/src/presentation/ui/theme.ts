/**
 * UIテーマ定義
 * TASK-0018 共通UIコンポーネント基盤
 *
 * @description
 * ゲーム全体で使用するUIテーマ（カラー、フォント、サイズ、スペーシング）を定義
 * 錬金術をテーマにしたデザインで、茶色とベージュを基調とする
 *
 * @remarks
 * - `as const`により型レベルでreadonlyとして扱われる
 * - 実行時の不変性が必要な場合は、Object.freeze()の使用を検討
 * - UI設計概要（docs/design/atelier-guild-rank/ui-design/overview.md）に基づく
 */

export const THEME = {
  // 🔵 カラーパレット定義
  // 錬金術をテーマにした茶色とベージュを基調としたデザイン
  // 参照: docs/design/atelier-guild-rank/ui-design/overview.md セクション7.1
  colors: {
    primary: 0x8b4513, // SaddleBrown - プライマリアクション用（ボタン、重要なUI要素）
    primaryHover: 0x9b5523, // primary より明るい色 - ホバー時のプライマリボタン
    secondary: 0xd2691e, // Chocolate - セカンダリアクション用（サブボタン、補助UI要素）
    secondaryHover: 0xe2792e, // secondary より明るい色 - ホバー時のセカンダリボタン
    background: 0xf5f5dc, // Beige - 背景色（柔らかく温かみのある印象）
    text: 0x333333, // ダークグレー - テキスト色（高い可読性）
    textLight: 0x666666, // ミディアムグレー - ライトテキスト色（補足情報用）
    textOnPrimary: '#FFFFFF', // 白 - プライマリボタン上のテキスト色
    textOnSecondary: '#FFFFFF', // 白 - セカンダリボタン上のテキスト色
    success: 0x228b22, // ForestGreen - 成功状態（錬金成功、クエスト達成など）
    warning: 0xdaa520, // Goldenrod - 警告状態（注意喚起、確認ダイアログなど）
    error: 0x8b0000, // DarkRed - エラー状態（錬金失敗、エラーメッセージなど）
    disabled: 0xcccccc, // ライトグレー - 無効状態（非アクティブなUI要素）
  },

  // 🔵 フォント設定
  // 日本語対応のNoto Sans JPをプライマリフォントとして使用
  // 参照: docs/design/atelier-guild-rank/ui-design/overview.md セクション7.4
  fonts: {
    primary: 'Noto Sans JP', // プライマリフォント（日本語対応、読みやすさ重視）
    secondary: 'sans-serif', // フォールバック用セカンダリフォント（クロスプラットフォーム対応）
  },

  // 🔵 フォントサイズ定義
  // 階層的な情報設計を実現するための4段階のサイズ設定
  // 参照: docs/design/atelier-guild-rank/ui-design/overview.md セクション7.4
  sizes: {
    small: 14, // 小さいテキスト用（キャプション、補足情報）
    medium: 16, // 標準テキスト用（本文、一般的なUI要素）
    large: 20, // 中見出し用（セクション見出し、ダイアログタイトル）
    xlarge: 24, // 大見出し用（メインタイトル、画面見出し）
  },

  // 🔵 スペーシング定義
  // 8pxベースのスペーシングシステムで統一感のあるレイアウトを実現
  // 参照: docs/design/atelier-guild-rank/ui-design/overview.md セクション7.4
  spacing: {
    xs: 4, // 最小スペーシング（密接な要素間）
    sm: 8, // 小スペーシング（関連要素のグループ内）
    md: 16, // 中スペーシング（セクション間、カード内の余白）
    lg: 24, // 大スペーシング（大きなセクション間）
    xl: 32, // 最大スペーシング（画面レベルの余白）
  },

  // 🔵 品質ごとの色定義
  // TASK-0044: 品質に応じた視覚効果
  // 参照: docs/tasks/atelier-guild-rank/phase-5/TASK-0044.md
  qualityColors: {
    D: 0x808080, // グレー
    C: 0x00ff00, // 緑
    B: 0x0080ff, // 青
    A: 0xffd700, // ゴールド
    S: 0xff00ff, // マゼンタ(紫)
  },

  // 🟡 品質ごとの光彩効果設定
  // TASK-0044: 品質に応じた視覚効果
  qualityGlow: {
    D: null, // なし
    C: null, // なし
    B: { intensity: 0.3 }, // 弱い光彩
    A: { intensity: 0.6 }, // 中程度の光彩
    S: { intensity: 1.0, particles: true }, // 強い光彩+パーティクル
  },
} as const;
