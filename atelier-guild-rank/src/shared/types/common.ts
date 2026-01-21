/**
 * common.ts - 基本型・列挙型定義
 *
 * ゲーム全体で使用される基本的な列挙型を定義する
 */

// =============================================================================
// 2.1 GamePhase列挙型
// =============================================================================

/** ゲームフェーズ */
export const GamePhase = {
  QUEST_ACCEPT: 'QUEST_ACCEPT',
  GATHERING: 'GATHERING',
  ALCHEMY: 'ALCHEMY',
  DELIVERY: 'DELIVERY',
} as const;

export type GamePhase = (typeof GamePhase)[keyof typeof GamePhase];

/**
 * 有効なGamePhaseの配列（フェーズ順）
 * - QUEST_ACCEPT → GATHERING → ALCHEMY → DELIVERY
 */
export const VALID_GAME_PHASES: readonly GamePhase[] = [
  GamePhase.QUEST_ACCEPT,
  GamePhase.GATHERING,
  GamePhase.ALCHEMY,
  GamePhase.DELIVERY,
] as const;

// =============================================================================
// 2.2 GuildRank列挙型
// =============================================================================

/** ギルドランク（G〜S） */
export const GuildRank = {
  G: 'G',
  F: 'F',
  E: 'E',
  D: 'D',
  C: 'C',
  B: 'B',
  A: 'A',
  S: 'S',
} as const;

export type GuildRank = (typeof GuildRank)[keyof typeof GuildRank];

// =============================================================================
// 2.3 CardType列挙型
// =============================================================================

/** カード種別 */
export const CardType = {
  GATHERING: 'GATHERING',
  RECIPE: 'RECIPE',
  ENHANCEMENT: 'ENHANCEMENT',
} as const;

export type CardType = (typeof CardType)[keyof typeof CardType];

// =============================================================================
// 2.4 Quality列挙型
// =============================================================================

/** アイテム品質 */
export const Quality = {
  D: 'D',
  C: 'C',
  B: 'B',
  A: 'A',
  S: 'S',
} as const;

export type Quality = (typeof Quality)[keyof typeof Quality];

// =============================================================================
// 2.5 Attribute列挙型
// =============================================================================

/** 素材属性 */
export const Attribute = {
  FIRE: 'FIRE',
  WATER: 'WATER',
  EARTH: 'EARTH',
  WIND: 'WIND',
  GRASS: 'GRASS',
} as const;

export type Attribute = (typeof Attribute)[keyof typeof Attribute];

// =============================================================================
// 2.6 QuestType列挙型
// =============================================================================

/** 依頼種別 */
export const QuestType = {
  SPECIFIC: 'SPECIFIC',
  CATEGORY: 'CATEGORY',
  QUALITY: 'QUALITY',
  QUANTITY: 'QUANTITY',
  ATTRIBUTE: 'ATTRIBUTE',
  EFFECT: 'EFFECT',
  MATERIAL: 'MATERIAL',
  COMPOUND: 'COMPOUND',
} as const;

export type QuestType = (typeof QuestType)[keyof typeof QuestType];

// =============================================================================
// 2.7 ClientType列挙型
// =============================================================================

/** 依頼者種別 */
export const ClientType = {
  VILLAGER: 'VILLAGER',
  ADVENTURER: 'ADVENTURER',
  MERCHANT: 'MERCHANT',
  NOBLE: 'NOBLE',
  GUILD: 'GUILD',
} as const;

export type ClientType = (typeof ClientType)[keyof typeof ClientType];

// =============================================================================
// 2.8 Rarity列挙型
// =============================================================================

/** レアリティ */
export const Rarity = {
  COMMON: 'COMMON',
  UNCOMMON: 'UNCOMMON',
  RARE: 'RARE',
  EPIC: 'EPIC',
  LEGENDARY: 'LEGENDARY',
} as const;

export type Rarity = (typeof Rarity)[keyof typeof Rarity];

// =============================================================================
// 2.9 EnhancementTarget列挙型
// =============================================================================

/** 強化対象 */
export const EnhancementTarget = {
  GATHERING: 'GATHERING',
  ALCHEMY: 'ALCHEMY',
  DELIVERY: 'DELIVERY',
  ALL: 'ALL',
} as const;

export type EnhancementTarget = (typeof EnhancementTarget)[keyof typeof EnhancementTarget];

// =============================================================================
// 2.10 EffectType列挙型
// =============================================================================

/** 効果種別 */
export const EffectType = {
  QUALITY_UP: 'QUALITY_UP',
  MATERIAL_SAVE: 'MATERIAL_SAVE',
  GATHERING_BONUS: 'GATHERING_BONUS',
  RARE_CHANCE_UP: 'RARE_CHANCE_UP',
  GOLD_BONUS: 'GOLD_BONUS',
  CONTRIBUTION_BONUS: 'CONTRIBUTION_BONUS',
  COST_REDUCTION: 'COST_REDUCTION',
  STORAGE_EXPANSION: 'STORAGE_EXPANSION',
  ACTION_POINT_BONUS: 'ACTION_POINT_BONUS',
  ALCHEMY_COST_REDUCTION: 'ALCHEMY_COST_REDUCTION',
  ALL_BONUS: 'ALL_BONUS',
} as const;

export type EffectType = (typeof EffectType)[keyof typeof EffectType];

// =============================================================================
// 2.11 ItemCategory列挙型
// =============================================================================

/** アイテムカテゴリ */
export const ItemCategory = {
  MEDICINE: 'MEDICINE',
  WEAPON: 'WEAPON',
  MAGIC: 'MAGIC',
  ADVENTURE: 'ADVENTURE',
  LUXURY: 'LUXURY',
} as const;

export type ItemCategory = (typeof ItemCategory)[keyof typeof ItemCategory];

// =============================================================================
// 2.12 ItemEffectType列挙型
// =============================================================================

/** アイテム効果種別 */
export const ItemEffectType = {
  HP_RECOVERY: 'HP_RECOVERY',
  ATTACK_UP: 'ATTACK_UP',
  DEFENSE_UP: 'DEFENSE_UP',
  CURE_POISON: 'CURE_POISON',
  EXPLOSION: 'EXPLOSION',
} as const;

export type ItemEffectType = (typeof ItemEffectType)[keyof typeof ItemEffectType];

// =============================================================================
// 2.13 SpecialRuleType列挙型
// =============================================================================

/** 特殊ルール種別 */
export const SpecialRuleType = {
  QUEST_LIMIT: 'QUEST_LIMIT',
  QUALITY_PENALTY: 'QUALITY_PENALTY',
  DEADLINE_REDUCTION: 'DEADLINE_REDUCTION',
  QUALITY_REQUIRED: 'QUALITY_REQUIRED',
} as const;

export type SpecialRuleType = (typeof SpecialRuleType)[keyof typeof SpecialRuleType];
