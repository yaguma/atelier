/**
 * UIテーマ定義
 * TASK-0018 共通UIコンポーネント基盤
 * TASK-0054 テーマ定数統一（カラー・アニメーション）
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

/**
 * 統一カラーパレット
 * TASK-0054: テーマ定数統一
 *
 * 🟡 信頼性レベル: コードベース調査から妥当な推測
 *
 * @description
 * 各UIコンポーネントで分散定義されていたカラー定数を一元化。
 * 背景色、ボーダー色、テキスト色、品質色、UI要素色を体系的に定義。
 */
export const Colors = {
  // 背景色
  background: {
    primary: 0x2a2a3d, // メイン背景（UIBackgroundBuilder デフォルト）
    secondary: 0x1a1a2e, // サブ背景
    overlay: 0x000000, // オーバーレイ
    card: 0x3a3a4d, // カード背景
    parchment: 0xfffde7, // 依頼カード背景（Parchment風）
  },

  // ボーダー色
  border: {
    primary: 0x4a4a5d, // メインボーダー（UIBackgroundBuilder デフォルト）
    secondary: 0x5a5a6d, // サブボーダー
    highlight: 0x6a6a7d, // ハイライトボーダー
    gold: 0xffd700, // ゴールドボーダー
    quest: 0xffd54f, // 依頼カードボーダー
    dark: 0x333333, // ダークボーダー
  },

  // テキスト色
  text: {
    primary: 0xffffff, // メインテキスト（白）
    secondary: 0xcccccc, // サブテキスト
    muted: 0x888888, // 薄いテキスト
    accent: 0xffd700, // アクセントテキスト（ゴールド）
    error: 0xff4444, // エラーテキスト
    success: 0x44ff44, // 成功テキスト
    dark: 0x333333, // ダークテキスト
    darkGray: 0x666666, // ダークグレーテキスト
  },

  // 品質色（アイテム・素材）
  quality: {
    common: 0xcccccc, // コモン（灰色）
    uncommon: 0x44ff44, // アンコモン（緑）
    rare: 0x4444ff, // レア（青）
    epic: 0xaa44ff, // エピック（紫）
    legendary: 0xffaa00, // レジェンダリー（オレンジ）
  },

  // カードタイプ色
  cardType: {
    gathering: 0x90ee90, // 採取カード（LightGreen）
    recipe: 0xffb6c1, // レシピカード（LightPink）
    enhancement: 0xadd8e6, // 強化カード（LightBlue）
    default: 0xffffff, // デフォルト（白）
  },

  // UI要素色
  ui: {
    button: {
      normal: 0x4a4a5d, // 通常状態
      hover: 0x5a5a6d, // ホバー状態
      active: 0x6a6a7d, // アクティブ状態
      disabled: 0x2a2a3d, // 無効状態
      accept: 0x4caf50, // 受注ボタン（緑）
      acceptBorder: 0x388e3c, // 受注ボタンボーダー
    },
    progress: {
      background: 0x2a2a3d, // プログレスバー背景
      fill: 0x4a9eff, // プログレスバー塗り
      warning: 0xffaa00, // 警告状態
      danger: 0xff4444, // 危険状態
    },
    placeholder: 0xcccccc, // プレースホルダー色
  },
} as const;

/** カラーキーの型定義 */
export type ColorKey = keyof typeof Colors;

/** 背景色キーの型定義 */
export type BackgroundColorKey = keyof typeof Colors.background;

/** ボーダー色キーの型定義 */
export type BorderColorKey = keyof typeof Colors.border;

/** テキスト色キーの型定義 */
export type TextColorKey = keyof typeof Colors.text;

/** カードタイプ色キーの型定義 */
export type CardTypeColorKey = keyof typeof Colors.cardType;

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
  // 日本語対応のM PLUS Rounded 1cをプライマリフォントとして使用
  // 参照: docs/design/atelier-guild-rank/ui-design/overview.md セクション7.4
  fonts: {
    primary: '"M PLUS Rounded 1c", sans-serif', // プライマリフォント（日本語対応、丸ゴシック）+ フォールバック
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
