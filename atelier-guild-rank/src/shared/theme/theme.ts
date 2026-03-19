/**
 * UIテーマ定義
 * TASK-0067: shared/theme移行
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
 * 統一カラーパレット（WARM系）
 *
 * @description
 * UI設計書（docs/design/atelier-guild-rank/ui-design/overview.md セクション7.1）に基づく
 * 錬金術テーマのWARM系カラーパレット。茶色・ベージュを基調とする。
 *
 * 使い分けガイド:
 * - Colors: 構造的・カテゴリ別のカラー定義（背景、ボーダー、テキスト、品質、カードタイプ、UI要素）
 * - THEME.colors: 意味的カラー定義（primary, secondary, success, warning, error等）
 */
export const Colors = {
  // 背景色（WARM系: ベージュ・クリーム基調）
  background: {
    primary: 0xf5f0e0, // メイン背景（温かみのあるクリーム）
    secondary: 0xede3d0, // サブ背景（やや濃いクリーム）
    overlay: 0x000000, // オーバーレイ（共通: 半透明黒）
    card: 0xfff8dc, // カード背景（Cornsilk: UI設計書 #FFF8DC）
    parchment: 0xfffde7, // 依頼カード背景（Parchment風）
  },

  // ボーダー色（WARM系: タン・ブラウン基調）
  border: {
    primary: 0xc4a882, // メインボーダー（ウォームタン）
    secondary: 0xd2b48c, // サブボーダー（タン）
    highlight: 0xb8860b, // ハイライトボーダー（ダークゴールデンロッド）
    gold: 0xffd700, // ゴールドボーダー
    quest: 0xffd54f, // 依頼カードボーダー
    dark: 0x8b7355, // ダークボーダー（ウォームブラウン）
  },

  // テキスト色（WARM背景上での可読性を確保）
  text: {
    primary: 0x333333, // メインテキスト（UI設計書 #333333）
    secondary: 0x666666, // サブテキスト（UI設計書 #666666）
    muted: 0x999999, // 薄いテキスト
    accent: 0xdaa520, // アクセントテキスト（Goldenrod: UI設計書 #DAA520）
    error: 0xb22222, // エラーテキスト（Firebrick: UI設計書 #B22222）
    success: 0x228b22, // 成功テキスト（ForestGreen: UI設計書 #228B22）
    dark: 0x333333, // ダークテキスト（primaryと同値）
    darkGray: 0x666666, // ダークグレーテキスト（secondaryと同値）
    light: 0xffffff, // ライトテキスト（着色ボタン上のテキスト用）
  },

  // 品質色（アイテム・素材レアリティ: UI設計書 セクション7.2）
  quality: {
    common: 0x808080, // コモン（グレー: UI設計書 #808080）
    uncommon: 0x32cd32, // アンコモン（LimeGreen: UI設計書 #32CD32）
    rare: 0x4169e1, // レア（RoyalBlue: UI設計書 #4169E1）
    epic: 0x9932cc, // エピック（DarkOrchid: UI設計書 #9932CC）
    legendary: 0xffd700, // レジェンダリー（Gold: UI設計書 #FFD700）
  },

  // カードタイプ色（UI設計書 セクション7.1）
  cardType: {
    gathering: 0x90ee90, // 採取カード（LightGreen: UI設計書 #90EE90）
    recipe: 0x87ceeb, // レシピカード（SkyBlue: UI設計書 #87CEEB）
    enhancement: 0xdda0dd, // 強化カード（Plum: UI設計書 #DDA0DD）
    default: 0xffffff, // デフォルト（白）
  },

  // UI要素色（WARM系: ブラウン基調のボタン・プログレス）
  ui: {
    button: {
      normal: 0x8b4513, // 通常状態（SaddleBrown: THEME.colors.primary準拠）
      hover: 0x9b5523, // ホバー状態（THEME.colors.primaryHover準拠）
      active: 0xd2691e, // アクティブ状態（Chocolate: THEME.colors.secondary準拠）
      disabled: 0xcccccc, // 無効状態（THEME.colors.disabled準拠）
      accept: 0x4caf50, // 受注ボタン（緑）
      acceptBorder: 0x388e3c, // 受注ボタンボーダー
    },
    progress: {
      background: 0xe0d5c0, // プログレスバー背景（ウォームベージュ）
      fill: 0xdaa520, // プログレスバー塗り（Goldenrod: UI設計書 #DAA520）
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
  // カラーパレット定義
  // 錬金術をテーマにした茶色とベージュを基調としたデザイン
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
    error: 0xb22222, // Firebrick - エラー状態（UI設計書 #B22222）
    disabled: 0xcccccc, // ライトグレー - 無効状態（非アクティブなUI要素）
  },

  // フォント設定
  // 日本語対応のM PLUS Rounded 1cをプライマリフォントとして使用
  fonts: {
    primary: '"M PLUS Rounded 1c", sans-serif', // プライマリフォント（日本語対応、丸ゴシック）
    secondary: 'sans-serif', // フォールバック用セカンダリフォント（クロスプラットフォーム対応）
  },

  // フォントサイズ定義
  // 階層的な情報設計を実現するための4段階のサイズ設定
  sizes: {
    small: 14, // 小さいテキスト用（キャプション、補足情報）
    medium: 16, // 標準テキスト用（本文、一般的なUI要素）
    large: 20, // 中見出し用（セクション見出し、ダイアログタイトル）
    xlarge: 24, // 大見出し用（メインタイトル、画面見出し）
  },

  // スペーシング定義
  // 8pxベースのスペーシングシステムで統一感のあるレイアウトを実現
  spacing: {
    xs: 4, // 最小スペーシング（密接な要素間）
    sm: 8, // 小スペーシング（関連要素のグループ内）
    md: 16, // 中スペーシング（セクション間、カード内の余白）
    lg: 24, // 大スペーシング（大きなセクション間）
    xl: 32, // 最大スペーシング（画面レベルの余白）
  },

  // 品質グレードごとの色定義（UI設計書 セクション7.3）
  qualityColors: {
    D: 0x808080, // グレー（UI設計書 #808080）
    C: 0xffffff, // 白（UI設計書 #FFFFFF）
    B: 0x32cd32, // LimeGreen（UI設計書 #32CD32）
    A: 0x4169e1, // RoyalBlue（UI設計書 #4169E1）
    S: 0xffd700, // Gold（UI設計書 #FFD700）
  },

  // 品質ごとの光彩効果設定
  qualityGlow: {
    D: null, // なし
    C: null, // なし
    B: { intensity: 0.3 }, // 弱い光彩
    A: { intensity: 0.6 }, // 中程度の光彩
    S: { intensity: 1.0, particles: true }, // 強い光彩+パーティクル
  },
} as const;
