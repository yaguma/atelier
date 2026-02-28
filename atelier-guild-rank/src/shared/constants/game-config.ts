/**
 * game-config.ts - ゲームバランス定数の一元管理
 *
 * TASK(#312): ゲームバランスに影響するすべてのパラメータを一元管理する。
 *
 * @description
 * バランス設計書 (docs/design/atelier-guild-rank/balance-design.md) に基づき、
 * ゲーム内の数値パラメータを定数として定義する。
 *
 * THEMEとの住み分け:
 * - GAME_CONFIG: ゲームバランスに影響するパラメータ（報酬、コスト、制限値等）
 * - THEME: UIの見た目に関するパラメータ（色、フォント、サイズ、スペーシング等）
 *
 * @remarks
 * - `as const` により型レベルで readonly として扱われる
 * - 各定数にはバランス設計書のセクション番号をコメントで対応付ける
 * - マスターデータ（JSON）で管理すべき大規模テーブルはここに含めない
 */

/**
 * @remarks
 * 循環参照を避けるため、型は@shared/types/commonから直接インポートする。
 * （@shared/types/constants が @shared/constants を参照するため）
 */
import type { ClientType, GuildRank, Quality, QuestType } from '@shared/types/common';

// =============================================================================
// ランク関連定数（バランス設計書 2.2）
// =============================================================================

/**
 * ランク別パラメータ
 *
 * 各ランクの必要貢献度と日数制限。
 * バランス設計書 セクション 2.2「ランク別難易度パラメータ」に基づく。
 */
export const RANK_CONFIG: Record<
  GuildRank,
  {
    /** 昇格に必要な貢献度 */
    readonly requiredContribution: number;
    /** 制限日数 */
    readonly dayLimit: number;
  }
> = {
  G: { requiredContribution: 100, dayLimit: 20 },
  F: { requiredContribution: 200, dayLimit: 25 },
  E: { requiredContribution: 350, dayLimit: 35 },
  D: { requiredContribution: 500, dayLimit: 35 },
  C: { requiredContribution: 700, dayLimit: 35 },
  B: { requiredContribution: 1000, dayLimit: 35 },
  A: { requiredContribution: 1500, dayLimit: 40 },
  S: { requiredContribution: 0, dayLimit: Infinity },
} as const;

// =============================================================================
// 初期パラメータ（バランス設計書 3.1）
// =============================================================================

/**
 * プレイヤー初期パラメータ
 *
 * バランス設計書 セクション 3.1「初期パラメータ」に基づく。
 */
export const PLAYER_INITIAL = {
  /** 初期デッキサイズ（15枚） */
  DECK_SIZE: 15,
  /** デッキ上限（30枚） */
  DECK_LIMIT: 30,
  /** 手札上限（7枚） */
  HAND_LIMIT: 7,
  /** 初期手札ドロー枚数（5枚） */
  HAND_REFILL_COUNT: 5,
  /** 1日あたりの行動ポイント（3AP） */
  ACTION_POINTS_PER_DAY: 3,
  /** 初期所持金（100G） */
  INITIAL_GOLD: 100,
  /** 素材保管上限（20枠） */
  STORAGE_LIMIT: 20,
  /** 同時依頼受注上限（3件） */
  MAX_ACTIVE_QUESTS: 3,
  /** 初期ランクHP */
  RANK_HP: 3,
} as const;

// =============================================================================
// 採取関連定数（バランス設計書 3.2）
// =============================================================================

/**
 * 採取コスト閾値
 *
 * 「基本コスト（移動）+ 追加コスト（採取量）」の2段階計算システム。
 * バランス設計書 セクション 3.2「行動コスト設計」に基づく。
 *
 * @remarks
 * thresholds配列は昇順に並べること（maxCount: Infinityが最後）。
 * 最初にマッチしたエントリが適用される。
 */
export const GATHERING_COST = {
  /** 追加コスト閾値テーブル（選択個数 → 追加コスト） */
  thresholds: [
    { maxCount: 0, additionalCost: 0 },
    { maxCount: 2, additionalCost: 1 },
    { maxCount: 4, additionalCost: 2 },
    { maxCount: 6, additionalCost: 3 },
    { maxCount: Infinity, additionalCost: 4 },
  ],
} as const;

/**
 * 品質変動パラメータ
 *
 * 採取時の素材品質が基本品質から上下する確率閾値。
 * - 0.0〜QUALITY_DOWN_THRESHOLD: 1段階ダウン
 * - QUALITY_DOWN_THRESHOLD〜QUALITY_UP_THRESHOLD: 変動なし
 * - QUALITY_UP_THRESHOLD〜1.0: 1段階アップ
 */
export const GATHERING_QUALITY = {
  /** 品質が1段階下がる乱数閾値 */
  QUALITY_DOWN_THRESHOLD: 0.2,
  /** 品質が1段階上がる乱数閾値 */
  QUALITY_UP_THRESHOLD: 0.8,
} as const;

// =============================================================================
// 調合関連定数（バランス設計書 3.2、3.4）
// =============================================================================

/**
 * 調合コスト
 *
 * バランス設計書 セクション 3.2「その他の行動コスト」に基づく。
 */
export const ALCHEMY_COST = {
  /** 基本レシピ調合コスト */
  BASIC: 1,
  /** 中級レシピ調合コスト */
  INTERMEDIATE: 2,
  /** 高級レシピ調合コスト */
  ADVANCED: 3,
} as const;

/**
 * 品質スコア閾値（パーセンテージ）
 *
 * 調合時の素材品質スコアから品質ランクを決定するための閾値。
 * スコア(1〜5)を0〜100にマッピング後、この閾値と比較する。
 *
 * バランス設計書 セクション 3.4「品質パラメータ」に基づく。
 */
export const QUALITY_THRESHOLDS: Record<Quality, number> = {
  D: 0,
  C: 20,
  B: 40,
  A: 60,
  S: 80,
} as const;

// =============================================================================
// 依頼関連定数（バランス設計書 5.1）
// =============================================================================

/**
 * 難易度ごとの基本報酬
 *
 * バランス設計書 セクション 5.1「依頼パラメータ」に基づく。
 */
export const QUEST_DIFFICULTY_REWARDS = {
  easy: { gold: 30, contribution: 30 },
  normal: { gold: 60, contribution: 60 },
  hard: { gold: 100, contribution: 100 },
} as const;

/**
 * 難易度ごとの基本期限（日数）
 *
 * バランス設計書 セクション 5.1「依頼パラメータ」に基づく。
 * 依頼者の deadlineModifier で最終期限が増減する。
 */
export const QUEST_DIFFICULTY_DEADLINES = {
  easy: 7,
  normal: 5,
  hard: 3,
} as const;

/**
 * 掲示板関連定数
 */
export const QUEST_BOARD = {
  /** 掲示板の最大依頼数 */
  DEFAULT_CAPACITY: 5,
  /** 訪問依頼の更新間隔（日数） */
  VISITOR_UPDATE_INTERVAL: 3,
  /** 掲示板依頼の有効期間（日数） */
  QUEST_DURATION: 5,
} as const;

/**
 * ランク別日次依頼生成数
 */
export const DAILY_QUEST_COUNT_BY_RANK: Record<GuildRank, number> = {
  G: 3,
  F: 4,
  E: 4,
  D: 5,
  C: 5,
  B: 6,
  A: 6,
  S: 7,
} as const;

/**
 * ランク別同時受注上限
 */
export const QUEST_LIMIT_BY_RANK: Record<GuildRank, number> = {
  G: 2,
  F: 2,
  E: 3,
  D: 3,
  C: 4,
  B: 4,
  A: 5,
  S: 5,
} as const;

/**
 * ランク別依頼者出現数
 */
export const CLIENT_COUNT_BY_RANK: Record<GuildRank, number> = {
  G: 2,
  F: 2,
  E: 3,
  D: 3,
  C: 3,
  B: 4,
  A: 4,
  S: 5,
} as const;

// =============================================================================
// 報酬関連定数（バランス設計書 5.2）
// =============================================================================

/**
 * 品質に応じた報酬補正値
 *
 * バランス設計書 セクション 3.4「品質パラメータ」の貢献度補正に基づく。
 */
export const QUALITY_REWARD_MULTIPLIER: Record<Quality, number> = {
  D: 0.5,
  C: 1.0,
  B: 1.5,
  A: 2.0,
  S: 3.0,
} as const;

/**
 * 依頼タイプに応じた貢献度補正値
 *
 * バランス設計書 セクション 5.2「依頼タイプ別貢献度効率」に基づく。
 */
export const QUEST_TYPE_CONTRIBUTION_MULTIPLIER: Record<QuestType, number> = {
  SPECIFIC: 1.0,
  CATEGORY: 0.8,
  QUALITY: 1.2,
  QUANTITY: 0.7,
  ATTRIBUTE: 1.3,
  EFFECT: 1.3,
  MATERIAL: 1.5,
  COMPOUND: 1.8,
} as const;

/**
 * 品質に応じた貢献度補正値（contribution-calculator用）
 *
 * バランス設計書 セクション 3.4「品質パラメータ」の貢献度補正列に基づく。
 *
 * QUALITY_REWARD_MULTIPLIERとは別の補正テーブル。
 * - QUALITY_REWARD_MULTIPLIER: 依頼報酬計算で使用（高品質への動機付け）
 * - CONTRIBUTION_QUALITY_MODIFIERS: 納品時の貢献度計算で使用（ランク進行速度の制御）
 *
 * 貢献度補正を報酬補正より控えめに設定することで、貢献度のインフレを防止する。
 */
export const CONTRIBUTION_QUALITY_MODIFIERS: Record<Quality, number> = {
  D: 0.5,
  C: 0.75,
  B: 1.0,
  A: 1.5,
  S: 2.0,
} as const;

/**
 * 依頼者タイプに応じた貢献度補正値
 */
export const CLIENT_TYPE_MODIFIERS: Record<ClientType, number> = {
  VILLAGER: 1.0,
  ADVENTURER: 1.1,
  MERCHANT: 1.2,
  NOBLE: 1.3,
  GUILD: 1.5,
} as const;

/**
 * コンボ補正の増加率（1回あたり+10%）
 *
 * バランス設計書 セクション 5.3「コンボシステムのバランス」に基づく。
 *
 * @deprecated COMBO_THRESHOLDS に移行。既存コードの互換性のために残す。
 */
export const COMBO_MODIFIER_RATE = 0.1;

/**
 * コンボ段階別補正テーブル
 *
 * 連続成功回数に応じた補正値を段階的に定義する。
 * 旧方式（線形+0.1/回）では10連続(x2.0)が実質到達不可能だったため、
 * 段階的な閾値方式に変更して到達可能性を改善する。
 *
 * バランス設計書 セクション 5.3「コンボシステムのバランス」に基づく。
 *
 * @remarks
 * thresholds配列は昇順に並べること（minCount が小さい順）。
 * 連続成功回数が閾値以上の最後のエントリが適用される。
 */
export const COMBO_THRESHOLDS = [
  { minCount: 1, modifier: 1.0 },
  { minCount: 2, modifier: 1.1 },
  { minCount: 3, modifier: 1.3 },
  { minCount: 5, modifier: 1.5 },
  { minCount: 7, modifier: 2.0 },
] as const;

// =============================================================================
// ランク昇格関連定数（バランス設計書 7.1）
// =============================================================================

/**
 * 昇格ボーナス報酬の基礎値（ゴールド）
 *
 * 最終ボーナス = PROMOTION_BONUS_BASE * (ランクインデックス + 1)
 */
export const PROMOTION_BONUS_BASE = 100;

// =============================================================================
// ショップ関連定数（バランス設計書 4.1）
// =============================================================================

/**
 * ショップ行動コスト
 *
 * バランス設計書 セクション 3.2「その他の行動コスト」に基づく。
 */
export const SHOP_COST = {
  /** 買い物のAP消費 */
  PURCHASE_AP: 1,
} as const;

// =============================================================================
// AP超過関連定数（バランス設計書 3.2.1）
// =============================================================================

/**
 * AP超過パラメータ
 *
 * バランス設計書 セクション 3.2.1「AP超過バランス設計」に基づく。
 */
export const AP_OVERFLOW = {
  /** AP超過上限（MAX_AP * 2） */
  MAX_OVERFLOW_MULTIPLIER: 2,
} as const;

// =============================================================================
// 品質関連マッピング定数
// =============================================================================

/**
 * 品質値マッピング（品質→数値）
 *
 * バランス設計書 セクション 3.4「品質パラメータ」の数値換算に基づく。
 */
export const QUALITY_VALUE: Record<Quality, number> = {
  D: 1,
  C: 2,
  B: 3,
  A: 4,
  S: 5,
} as const;

// =============================================================================
// ランク難易度重み（依頼生成用）
// =============================================================================

/** 難易度の型 */
type QuestDifficulty = 'easy' | 'normal' | 'hard';

/**
 * ランクと難易度の対応（各ランクで出現可能な難易度と重み）
 */
export const RANK_DIFFICULTY_WEIGHTS: Record<
  GuildRank,
  readonly { readonly difficulty: QuestDifficulty; readonly weight: number }[]
> = {
  G: [
    { difficulty: 'easy', weight: 3 },
    { difficulty: 'normal', weight: 1 },
  ],
  F: [
    { difficulty: 'easy', weight: 2 },
    { difficulty: 'normal', weight: 2 },
  ],
  E: [
    { difficulty: 'easy', weight: 1 },
    { difficulty: 'normal', weight: 3 },
  ],
  D: [
    { difficulty: 'easy', weight: 1 },
    { difficulty: 'normal', weight: 2 },
    { difficulty: 'hard', weight: 1 },
  ],
  C: [
    { difficulty: 'normal', weight: 2 },
    { difficulty: 'hard', weight: 2 },
  ],
  B: [
    { difficulty: 'normal', weight: 1 },
    { difficulty: 'hard', weight: 3 },
  ],
  A: [
    { difficulty: 'normal', weight: 1 },
    { difficulty: 'hard', weight: 4 },
  ],
  S: [{ difficulty: 'hard', weight: 1 }],
} as const;
