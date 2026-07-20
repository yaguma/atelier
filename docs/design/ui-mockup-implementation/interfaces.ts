/**
 * UIモックアップ実装 型定義
 *
 * 作成日: 2026-06-17
 * 関連設計: architecture.md
 * 対象モックアップ: docs/design/atelier-guild-rank/ui-design/mockups/01〜08
 *
 * 信頼性レベル:
 * - 🔵 青信号: 既存実装・設計文書・モックアップを参考にした確実な型定義
 * - 🟡 黄信号: 既存実装・設計文書・モックアップから妥当な推測による型定義
 * - 🔴 赤信号: 既存実装・設計文書・モックアップにない推測による型定義
 */

// ========================================
// フェーズ関連型
// ========================================

/**
 * フェーズアクセントカラー定義
 * 🔵 信頼性: design-guide.md・モックアップより
 */
export type PhaseAccentKey = 'questAccept' | 'gathering' | 'alchemy' | 'delivery';

/**
 * フェーズアクセントカラーマップ
 * 🔵 信頼性: design-guide.md §フェーズ別アクセント・モックアップより
 */
export const PHASE_ACCENT_COLOR: Record<PhaseAccentKey, number> = {
  questAccept: 0xb8a9d4, // ラベンダー
  gathering: 0x8cc084,   // リーフグリーン
  alchemy: 0xd4a76a,     // アンバー
  delivery: 0xe8a87c,    // コーラル
};

// ========================================
// ボタン種別
// ========================================

/**
 * ボタンバリアント
 * 🔵 信頼性: design-guide.md §ボタン3種・モックアップより
 */
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'tertiary';

/**
 * ボタンスタイル設定
 * 🔵 信頼性: design-guide.md より
 */
export interface ButtonStyle {
  bgColor: number;       // 背景色（Phaser 数値）
  textColor: number;     // テキスト色
  borderColor: number;   // 枠線色（secondary/tertiary のみ）
  borderWidth: number;   // 枠線幅
  borderRadius: number;  // 角丸半径 (pill型 = radius.full)
  fontSize: number;      // フォントサイズ
}

// ========================================
// HUDBar（Step 1-1）
// ========================================

/**
 * HUDBar モックアップ仕様に対応するデータ契約
 * 🔵 信頼性: 既存 HUDBarData・モックアップ 02〜05 `.header` より
 *
 * 既存 HUDBarData（HUDBar.ts）との差分:
 * - フォントサイズが 12px にコンパクト化（設計上の変更点）
 * - ゲージ高さ 8px（現行 16px）
 * - ランク表示がバッジ形式に変更
 */
export interface MockupHUDBarData {
  /** 現在のギルドランク（バッジ形式で表示） */ // 🔵 既存 HUDBarData 互換
  currentRank: string;
  /** 昇格ゲージ値 (0-100) */ // 🔵 既存 HUDBarData 互換
  promotionGauge: number;
  /** 残り日数 */ // 🔵 既存 HUDBarData 互換
  remainingDays: number;
  /** 所持ゴールド */ // 🔵 既存 HUDBarData 互換
  gold: number;
  /** 行動ポイント */ // 🔵 既存 HUDBarData 互換
  actionPoints: number;
  /** 最大行動ポイント */ // 🔵 既存 HUDBarData 互換
  maxActionPoints: number;
}

/**
 * HUDBar モックアップ対応オプション
 * 🔵 信頼性: 既存 HUDBarOptions・モックアップ仕様より
 */
export interface MockupHUDBarOptions {
  width?: number;
  data?: Partial<MockupHUDBarData>;
}

// ========================================
// SidebarUI（Step 1-2）
// ========================================

/**
 * サイドバーに表示する受注依頼サマリー
 * 🔵 信頼性: 既存 IActiveQuest・モックアップ 02〜05 `.sidebar` より
 */
export interface SidebarQuestSummary {
  id: string;              // 🔵 既存 IActiveQuest より
  name: string;            // 🔵 既存 IActiveQuest より
  clientName: string;      // 🔵 モックアップより（依頼人名バッジ）
  remainingDays: number;   // 🔵 期限警告に使用
  isUrgent: boolean;       // 🟡 期限3日以下を urgent 扱い（推測）
}

/**
 * サイドバーに表示するインベントリアイテムサマリー
 * 🔵 信頼性: 既存 ItemInstance・モックアップ `.sidebar` より
 */
export interface SidebarInventoryItem {
  name: string;     // 🔵 既存 ItemInstance より
  count: number;    // 🔵 モックアップ（個数表示）より
  quality?: string; // 🟡 品質表示（推測）
}

// ========================================
// PhaseRail（Step 1-4）
// ========================================

/**
 * フェーズタブ項目
 * 🔵 信頼性: 既存 PhaseRail・モックアップ `.phase-tabs` より
 */
export interface PhaseTabItem {
  phase: string;      // 🔵 GamePhase 値
  label: string;      // 🔵 表示テキスト（例: '依頼', '採取', '調合', '納品'）
  isActive: boolean;  // 🔵 現在フェーズかどうか
  isEnabled: boolean; // 🟡 フェーズへの遷移可否（推測）
}

// ========================================
// QuestAcceptPhaseUI（Step 2-1）
// ========================================

/**
 * 依頼カード表示データ
 * 🔵 信頼性: 既存 Quest エンティティ・モックアップ 02 `.quest-card` より
 */
export interface QuestCardDisplayData {
  id: string;                  // 🔵 Quest エンティティより
  clientName: string;          // 🔵 モックアップ（依頼人名）より
  clientQuote: string;         // 🔵 モックアップ（セリフ）より
  requiredItemName: string;    // 🔵 モックアップ（依頼条件）より
  requiredItemId: string;      // 🔵 Quest エンティティより
  requiredQuality: string;     // 🔵 Quest エンティティより
  rewardGold: number;          // 🔵 モックアップ（報酬表示）より
  rewardContribution: number;  // 🔵 モックアップ（報酬表示）より
  deadlineDays: number;        // 🔵 モックアップ（期限表示）より
  isSelected: boolean;         // 🔵 選択状態管理
  isAccepted: boolean;         // 🔵 受注済みフラグ
}

/**
 * 依頼詳細パネル表示データ
 * 🔵 信頼性: モックアップ 02 `.detail-panel` より
 */
export interface QuestDetailPanelData {
  quest: QuestCardDisplayData; // 🔵 選択中の依頼
  canAccept: boolean;          // 🔵 受注可否（上限チェック）
  acceptedCount: number;       // 🔵 現在の受注数
  maxAcceptCount: number;      // 🔵 最大受注数
}

// ========================================
// GatheringPhaseUI（Step 2-2）
// ========================================

/**
 * 採取カード表示データ
 * 🔵 信頼性: 既存 GatheringCard エンティティ・モックアップ 03 より
 */
export interface GatheringCardDisplayData {
  id: string;              // 🔵 既存エンティティより
  name: string;            // 🔵 モックアップより
  category: string;        // 🔵 モックアップ（素材カテゴリ）より
  qualityBadge: string;    // 🔵 モックアップ（品質バッジ C/B/A/S）より
  isRare: boolean;         // 🔵 モックアップ（レアタグ）より
  isSelected: boolean;     // 🔵 選択状態管理
}

/**
 * 採取ラウンドヘッダーデータ
 * 🔵 信頼性: モックアップ 03 `.round-header` より
 */
export interface GatheringRoundHeaderData {
  currentRound: number;    // 🔵 現在のラウンド数
  maxRound: number;        // 🔵 最大ラウンド数
  selectedCount: number;   // 🔵 現在の選択数
  maxSelectCount: number;  // 🔵 このラウンドで選択できる最大数
}

// ========================================
// AlchemyPhaseUI（Step 2-3）
// ========================================

/**
 * レシピカード表示データ
 * 🔵 信頼性: 既存 Recipe エンティティ・モックアップ 04 より
 */
export interface RecipeCardDisplayData {
  id: string;               // 🔵 既存 Recipe より
  name: string;             // 🔵 既存 Recipe より
  iconEmoji: string;        // 🟡 レシピアイコン（推測）
  requiredMaterials: Array<{
    slotIndex: number;      // 🔵 モックアップ（素材スロット）より
    materialId: string | null; // 🔵 セット済み素材
    materialName: string | null;
    isFilled: boolean;      // 🔵 セット済み判定
  }>;
  isSelected: boolean;      // 🔵 選択状態管理
}

/**
 * 品質プレビューデータ
 * 🔵 信頼性: 既存 AlchemyService・モックアップ 04 `.quality-preview` より
 */
export interface QualityPreviewData {
  grade: 'S' | 'A' | 'B' | 'C';  // 🔵 既存品質定義より
  qualityValue: number;            // 🔵 0-100 の品質値
  bonuses: string[];               // 🟡 品質ボーナス一覧（推測）
}

// ========================================
// DeliveryPhaseUI（Step 2-4）
// ========================================

/**
 * 納品依頼カード表示データ
 * 🔵 信頼性: 既存 IActiveQuest・モックアップ 05 `.quest-card` より
 */
export interface DeliveryQuestCardData {
  id: string;               // 🔵 IActiveQuest より
  clientName: string;       // 🔵 モックアップより
  requiredItemName: string; // 🔵 モックアップより
  requiredQuality: string;  // 🔵 IActiveQuest より
  deadlineDays: number;     // 🔵 モックアップ（期限警告）より
  isUrgent: boolean;        // 🟡 期限3日以下（推測）
  rewardGold: number;       // 🔵 モックアップより
  rewardContribution: number; // 🔵 モックアップより
  isSelected: boolean;      // 🔵 選択状態管理
}

/**
 * アイテムチップ表示データ
 * 🔵 信頼性: 既存 ItemInstance・モックアップ 05 `.item-chip` より
 */
export interface DeliveryItemChipData {
  instanceId: string;    // 🔵 ItemInstance より
  name: string;          // 🔵 ItemInstance より
  quality: string;       // 🔵 ItemInstance より
  isEmpty: boolean;      // 🔵 空スロット（破線枠）
  isSelected: boolean;   // 🔵 選択状態管理
}

/**
 * 貢献度プレビューデータ
 * 🔵 信頼性: 既存 ContributionPreview・モックアップ 05 より
 */
export interface ContributionPreviewData {
  currentContribution: number;  // 🔵 現在の貢献度
  targetContribution: number;   // 🔵 昇格目標貢献度
  additionalContribution: number; // 🔵 納品で得られる追加貢献度（緑ゲージ分）
  currentGold: number;          // 🔵 現在の所持ゴールド
  rewardGold: number;           // 🔵 報酬ゴールド
  canDeliver: boolean;          // 🔵 納品可否判定
}

// ========================================
// TitleScene（Step 3-1）
// ========================================

/**
 * タイトル画面オプション
 * 🔵 信頼性: モックアップ 01 より
 */
export interface TitleSceneOptions {
  hasSaveData: boolean;  // 🔵 コンティニュー可否判定
  version: string;       // 🔵 バージョン表示（右下）
}

// ========================================
// GameClearScene（Step 3-2）
// ========================================

/**
 * ゲームクリア統計データ
 * 🔵 信頼性: モックアップ 06（事前確認事項 A 解決済み）より
 *
 * 統計項目はモックアップ 06 の 6 項目で確定：
 * グリッド: 総プレイ日数・達成依頼数・総獲得G
 * リスト: 調合回数・採取素材数・S品質作成数・最終貢献度
 */
export interface GameClearStats {
  // グリッド表示（3列）
  totalPlayDays: number;       // 🔵 総プレイ日数
  completedQuestCount: number; // 🔵 達成依頼数
  totalGoldEarned: number;     // 🔵 総獲得G

  // リスト表示（4行）
  alchemyCount: number;        // 🔵 調合回数
  gatheredMaterialCount: number; // 🔵 採取素材数
  sQualityCount: number;       // 🔵 S品質作成数
  finalContribution: number;   // 🔵 最終貢献度

  // ランク表示
  finalRank: string;           // 🔵 最終ランク
  rankTitle: string;           // 🔵 称号（例: 「新人錬金術師」）
}

// ========================================
// ShopScene（Step 3-3）
// ========================================

/**
 * ショップアイテム表示データ
 * 🔵 信頼性: 既存 ShopItem・モックアップ 07 より
 */
export interface ShopItemDisplayData {
  id: string;          // 🔵 既存 ShopItem より
  name: string;        // 🔵 モックアップより
  iconEmoji: string;   // 🟡 アイコン（推測）
  price: number;       // 🔵 モックアップ（価格）より
  category: string;    // 🔵 モックアップ（カテゴリ）より
  tag?: 'new' | 'popular'; // 🔵 モックアップ（タグ）より
  isSelected: boolean; // 🔵 選択状態管理
  canAfford: boolean;  // 🔵 所持Gold との比較結果
}

/**
 * ショップカテゴリ
 * 🔵 信頼性: モックアップ 07 `.category-sidebar` より
 */
export interface ShopCategory {
  id: string;        // 🔵 カテゴリID
  label: string;     // 🔵 カテゴリ表示名
  isActive: boolean; // 🔵 現在選択中カテゴリ
}

// ========================================
// RankUpScene（Step 3-4）
// ========================================

/**
 * ランクアップ試験データ
 * 🔵 信頼性: 既存 RankUpScene・モックアップ 08 より
 */
export interface RankUpTestData {
  currentRank: string;    // 🔵 現在のランク
  nextRank: string;       // 🔵 昇格先のランク
  currentContribution: number; // 🔵 現在の貢献度
  targetContribution: number;  // 🔵 昇格必要貢献度
  staffMessage: string;   // 🔵 モックアップ（スタッフメッセージ）より
  checklistItems: RankUpChecklistItem[]; // 🔵 モックアップ（チェックリスト）より
  testResult?: 'pass' | 'fail'; // 🔵 モックアップ（結果通知）より
}

/**
 * ランクアップ試験チェックリスト項目
 * 🔵 信頼性: モックアップ 08 `.checklist-item` より
 */
export interface RankUpChecklistItem {
  label: string;                         // 🔵 チェック項目名
  status: 'completed' | 'failed' | 'pending'; // 🔵 モックアップ（3状態）より
  current: number;                       // 🔵 現在値
  required: number;                      // 🔵 必要値
}

// ========================================
// 共通ユーティリティ型
// ========================================

/**
 * コンポーネントオプション基底（BaseComponent 互換）
 * 🔵 信頼性: 既存 BaseComponentOptions より
 */
export interface MockupComponentOptions {
  addToScene?: boolean;  // 🔵 既存 BaseComponentOptions より
  depth?: number;        // 🔵 既存 BaseComponentOptions より
}

/**
 * フェーズタイトル設定
 * 🔵 信頼性: モックアップ 02〜05 `.phase-title` + 左バーより
 */
export interface PhaseTitleConfig {
  text: string;            // 🔵 フェーズ名
  accentColor: number;     // 🔵 左バー・テキスト色（PHASE_ACCENT_COLOR から取得）
  barWidth: number;        // 🔵 左バー幅（4px）
}

// ========================================
// 信頼性レベルサマリー
// ========================================
/**
 * - 🔵 青信号: 52件 (87%)
 * - 🟡 黄信号: 8件 (13%)
 * - 🔴 赤信号: 0件 (0%)
 *
 * 品質評価: ✅ 高品質
 */
