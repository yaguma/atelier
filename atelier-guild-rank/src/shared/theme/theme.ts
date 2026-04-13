/**
 * UIテーマ定義
 * TASK-0067: shared/theme移行
 * Issue #508: 水彩ファンタジースタイルへ更新
 *
 * @description
 * ゲーム全体で使用するUIテーマ（カラー、フォント、サイズ、スペーシング）を定義
 * 水彩ファンタジースタイル: 草色＋ゴールデンベージュ＋クリーム背景を基調とする
 *
 * @remarks
 * - design-guide.md（docs/design/atelier-guild-rank/ui-design/design-guide.md）に基づく
 * - `as const`により型レベルでreadonlyとして扱われる
 */

/**
 * 統一カラーパレット（水彩ファンタジー）
 *
 * @description
 * デザインガイド（design-guide.md）に基づく水彩ファンタジースタイルのカラーパレット。
 * クリーム・パステル基調＋草色＋ゴールデンベージュ。
 *
 * 使い分けガイド:
 * - Colors: 構造的・カテゴリ別のカラー定義（背景、ボーダー、テキスト、品質、カードタイプ、UI要素）
 * - THEME.colors: 意味的カラー定義（primary, secondary, success, warning, error等）
 */
export const Colors = {
  // 背景色 — design-guide.md §2.1
  background: {
    primary: 0xfff8f0, // メイン背景（温かみのあるオフホワイト: surface.base）
    secondary: 0xf5efe6, // サブ背景（やや暗めのクリーム: surface.sidebar）
    overlay: 0x000000, // オーバーレイ（半透明黒: surface.overlay）
    card: 0xffffff, // カード背景（ピュアホワイト: surface.card）
    parchment: 0xffffff, // 依頼カード背景（cardと統一）
    dark: 0x333333, // ダーク背景（後方互換用）
  },

  // 面色（Surface） — design-guide.md §2.1
  surface: {
    base: 0xfff8f0, // 画面全体の背景
    card: 0xffffff, // カード・パネル
    elevated: 0xffffff, // 浮き上がった要素（モーダル等）
    sidebar: 0xf5efe6, // サイドバー
    header: 0xfdfaf5, // ヘッダー / PhaseRail
    footer: 0xf0ebe3, // フッター
  },

  // ボーダー色 — design-guide.md §2.5
  border: {
    primary: 0xd9cfc2, // メインボーダー（default と同値）
    secondary: 0xe8e0d6, // サブボーダー（subtle と同値）
    highlight: 0xb8a99a, // ハイライトボーダー（strong と同値）
    gold: 0xd4a76a, // ゴールドボーダー（brand.secondary）
    quest: 0xd9cfc2, // 依頼カードボーダー（default と統一）
    dark: 0x8b7355, // ダークボーダー（後方互換用）
    default: 0xd9cfc2, // 標準の枠線
    subtle: 0xe8e0d6, // 薄い区切り線
    strong: 0xb8a99a, // 強調された枠線
    focus: 0x7bae7f, // フォーカスリング（brand.primary）
  },

  // テキスト色 — design-guide.md §2.3
  text: {
    primary: 0x3d3d3d, // メインテキスト（コントラスト10.2:1）
    secondary: 0x5a5a5a, // サブテキスト（コントラスト6.8:1）
    muted: 0x8a8a8a, // 薄いテキスト（tertiary と同値）
    accent: 0xd4a76a, // アクセントテキスト（ゴールデンベージュ）
    error: 0xd46b6b, // エラーテキスト（status.error）
    success: 0x6aaf6a, // 成功テキスト（status.success）
    dark: 0x3d3d3d, // ダークテキスト（primaryと同値）
    darkGray: 0x5a5a5a, // ダークグレーテキスト（secondaryと同値）
    light: 0xffffff, // ライトテキスト（着色ボタン上のテキスト用）
    gold: 0xe0a84b, // ゴールドテキスト（status.warning）
    bonus: 0x6aaf6a, // ボーナステキスト（status.success）
    dimGray: 0x8a8a8a, // 淡いグレーテキスト（mutedと同値）
    softGray: 0xb0b0b0, // ソフトグレーテキスト（disabled）
    tertiary: 0x8a8a8a, // 補助・ヒント（mutedと同値）
    disabled: 0xb0b0b0, // 無効状態テキスト
    onPrimary: 0xffffff, // brand.primary上の白文字
    onSecondary: 0x3d3d3d, // brand.secondary上の文字
    link: 0x5b8cb8, // リンク・インタラクティブ
  },

  // ブランドカラー — design-guide.md §2.2
  brand: {
    primary: 0x7bae7f, // 草色（錬金術のハーブ）
    primaryHover: 0x6a9d6e, // ホバー時
    secondary: 0xd4a76a, // ゴールデンベージュ（調合の琥珀）
    secondaryHover: 0xc49a5c, // ホバー時
    accent: 0xe8a87c, // コーラルピーチ
  },

  // ステータスカラー — design-guide.md §2.4
  status: {
    success: 0x6aaf6a,
    warning: 0xe0a84b,
    error: 0xd46b6b,
    info: 0x6b9fcc,
  },

  // フェーズアクセントカラー — design-guide.md §2.7
  phase: {
    questAccept: 0xb8a9d4, // ラベンダー
    gathering: 0x8cc084, // リーフグリーン
    alchemy: 0xd4a76a, // アンバー
    delivery: 0xe8a87c, // コーラル
  },

  // 品質色（アイテム・素材レアリティ）— design-guide.md §2.6
  quality: {
    common: 0xa0a0a0, // コモン（グレー: D品質）
    uncommon: 0x6aaf6a, // アンコモン（グリーン: B品質）
    rare: 0x6b9fcc, // レア（ブルー: A品質）
    epic: 0x9932cc, // エピック（パープル）
    legendary: 0xe0a84b, // レジェンダリー（ゴールド: S品質）
  },

  // カードタイプ色（維持）
  cardType: {
    gathering: 0x8cc084, // 採取カード（リーフグリーン）
    recipe: 0x87ceeb, // レシピカード（スカイブルー）
    enhancement: 0xdda0dd, // 強化カード（プラム）
    default: 0xffffff, // デフォルト（白）
  },

  // UI要素色（水彩ファンタジースタイル）
  ui: {
    button: {
      normal: 0x7bae7f, // 通常状態（草色: brand.primary）
      hover: 0x6a9d6e, // ホバー状態（brand.primaryHover）
      active: 0xd4a76a, // アクティブ状態（brand.secondary）
      disabled: 0xd0d0d0, // 無効状態
      accept: 0x7bae7f, // 受注ボタン（brand.primaryと統一）
      acceptBorder: 0x6a9d6e, // 受注ボタンボーダー
    },
    progress: {
      background: 0xe8e0d6, // プログレスバー背景（border.subtle）
      fill: 0xd4a76a, // プログレスバー塗り（brand.secondary）
      success: 0x6aaf6a, // 成功（status.success）
      info: 0x6b9fcc, // 情報（status.info）
      warning: 0xe0a84b, // 警告（status.warning）
      danger: 0xd46b6b, // 危険（status.error）
    },
    placeholder: 0xd0d0d0, // プレースホルダー色
  },
} as const;

/**
 * 数値カラー(0xRRGGBB)をCSS文字列(#RRGGBB)に変換する
 *
 * @param color - 数値カラー値
 * @returns CSS色文字列
 *
 * @example
 * toColorStr(Colors.text.primary) // '#333333'
 * toColorStr(0xff0000)            // '#ff0000'
 */
export function toColorStr(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}

/** カラーキーの型定義 */
export type ColorKey = keyof typeof Colors;

/** 背景色キーの型定義 */
export type BackgroundColorKey = keyof typeof Colors.background;

/** Surface色キーの型定義 */
export type SurfaceColorKey = keyof typeof Colors.surface;

/** ボーダー色キーの型定義 */
export type BorderColorKey = keyof typeof Colors.border;

/** テキスト色キーの型定義 */
export type TextColorKey = keyof typeof Colors.text;

/** ブランドカラーキーの型定義 */
export type BrandColorKey = keyof typeof Colors.brand;

/** ステータスカラーキーの型定義 */
export type StatusColorKey = keyof typeof Colors.status;

/** フェーズカラーキーの型定義 */
export type PhaseColorKey = keyof typeof Colors.phase;

/** カードタイプ色キーの型定義 */
export type CardTypeColorKey = keyof typeof Colors.cardType;

export const THEME = {
  // カラーパレット定義 — design-guide.md §2 準拠
  // 水彩ファンタジースタイル: 草色＋ゴールデンベージュ＋クリーム背景
  colors: {
    primary: 0x7bae7f, // 草色 - プライマリアクション用（ボタン、受注・決定）
    primaryHover: 0x6a9d6e, // やや暗い草色 - ホバー時
    secondary: 0xd4a76a, // ゴールデンベージュ - セカンダリ（調合の琥珀）
    secondaryHover: 0xc49a5c, // やや暗いベージュ - ホバー時
    background: 0xfff8f0, // 温かみのあるオフホワイト（surface.base）
    text: 0x3d3d3d, // ダークグレー - テキスト色（コントラスト10.2:1）
    textLight: 0x5a5a5a, // ミディアムグレー - ライトテキスト色（コントラスト6.8:1）
    textOnPrimary: '#FFFFFF', // 白 - プライマリボタン上のテキスト色
    textOnSecondary: '#3D3D3D', // ダーク - セカンダリボタン上のテキスト色
    success: 0x6aaf6a, // 成功（status.success）
    warning: 0xe0a84b, // 警告（status.warning）
    error: 0xd46b6b, // エラー（status.error）
    disabled: 0xd0d0d0, // 無効状態
  },

  // フォント設定 — design-guide.md §3 準拠
  fonts: {
    primary: '"M PLUS Rounded 1c", sans-serif', // 丸ゴシック（水彩・絵本の柔らかい印象）
    secondary: 'sans-serif', // フォールバック
  },

  // フォントサイズ定義 — design-guide.md §3.2 準拠
  sizes: {
    small: 14, // キャプション、注釈（text.sm）
    medium: 16, // 本文、カード内テキスト（text.md）
    large: 20, // セクション見出し（text.lg）
    xlarge: 24, // フェーズタイトル（text.xl）
  },

  // スペーシング定義 — design-guide.md §7 準拠（8pxベース）
  spacing: {
    xs: 4, // 極小間隔（アイコンとテキストの間）
    sm: 8, // 小間隔（カード内要素間）
    md: 16, // 標準間隔（カード間、セクション内パディング）
    lg: 24, // 大間隔（セクション間）
    xl: 32, // 極大間隔（画面レベルの余白）
  },

  // 品質グレードごとの色定義 — design-guide.md §2.6 準拠
  qualityColors: {
    D: 0xa0a0a0, // グレー
    C: 0xffffff, // 白
    B: 0x6aaf6a, // グリーン（brand.primaryに寄せる）
    A: 0x6b9fcc, // ブルー（status.infoに寄せる）
    S: 0xe0a84b, // ゴールド（status.warningに寄せる）
  },

  // 品質ごとの光彩効果設定
  qualityGlow: {
    D: null, // なし
    C: null, // なし
    B: { intensity: 0.3 }, // 弱い光彩
    A: { intensity: 0.6 }, // 中程度の光彩
    S: { intensity: 1.0, particles: true }, // 強い光彩+パーティクル
  },

  /**
   * 品質グレードのテキストラベル（色非依存の情報表現）
   * Issue #460: A11y - 色だけに頼らず必ずテキストラベルを併記する
   */
  qualityLabels: {
    D: 'D',
    C: 'C',
    B: 'B',
    A: 'A',
    S: 'S',
  },
} as const;

/**
 * 品質グレード型
 */
export type QualityGrade = keyof typeof THEME.qualityLabels;
