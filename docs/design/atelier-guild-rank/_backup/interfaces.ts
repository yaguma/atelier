/**
 * アトリエ錬金術ゲーム TypeScriptインターフェース定義
 *
 * @version 1.0.0
 * @description ギルドランク制デッキ構築RPGのドメインモデル型定義
 * @see docs/spec/atelier-guild-rank-requirements.md
 */

// ============================================================================
// 列挙型定義
// ============================================================================

/**
 * ゲームフェーズ
 * 1日の流れを4つのフェーズで管理
 * 🔵 青信号: 要件定義書 Section 1.2 に詳細記載
 */
export enum GamePhase {
  /** 依頼受注フェーズ */
  QUEST_ACCEPT = 'QUEST_ACCEPT',
  /** 採取フェーズ */
  GATHERING = 'GATHERING',
  /** 調合フェーズ */
  ALCHEMY = 'ALCHEMY',
  /** 納品フェーズ */
  DELIVERY = 'DELIVERY',
}

/**
 * ギルドランク
 * G（見習い）からS（伝説）までの8段階
 * 🔵 青信号: 要件定義書 Section 4.7 に詳細記載
 */
export enum GuildRank {
  G = 'G',
  F = 'F',
  E = 'E',
  D = 'D',
  C = 'C',
  B = 'B',
  A = 'A',
  S = 'S',
}

/**
 * カード種別
 * 3系統のカードシステム
 * 🔵 青信号: 要件定義書 Section 4.1 に詳細記載
 */
export enum CardType {
  /** 採取地カード */
  GATHERING = 'GATHERING',
  /** レシピカード */
  RECIPE = 'RECIPE',
  /** 強化カード */
  ENHANCEMENT = 'ENHANCEMENT',
}

/**
 * 品質ランク
 * 素材・アイテムの品質を表す
 * 🔵 青信号: 要件定義書 Section 4.5 に詳細記載
 */
export enum Quality {
  D = 'D',
  C = 'C',
  B = 'B',
  A = 'A',
  S = 'S',
}

/**
 * 属性
 * 素材・アイテムが持つ属性
 * 🔵 青信号: 要件定義書 Section 4.5 に詳細記載
 */
export enum Attribute {
  FIRE = 'FIRE',
  WATER = 'WATER',
  EARTH = 'EARTH',
  WIND = 'WIND',
  /** 草属性（薬草など） */
  GRASS = 'GRASS',
}

/**
 * 依頼タイプ
 * 8種類の依頼条件
 * 🔵 青信号: 要件定義書 Section 4.6, 4.12 に詳細記載
 */
export enum QuestType {
  /** 具体的指定: 特定アイテムを指定 */
  SPECIFIC = 'SPECIFIC',
  /** カテゴリ: カテゴリで指定 */
  CATEGORY = 'CATEGORY',
  /** 品質条件: 品質値で指定 */
  QUALITY = 'QUALITY',
  /** 数量重視: 数量で指定 */
  QUANTITY = 'QUANTITY',
  /** 属性条件: 属性値で指定 */
  ATTRIBUTE = 'ATTRIBUTE',
  /** 効果ベース: 効果で指定 */
  EFFECT = 'EFFECT',
  /** 素材消費: 使用素材で指定 */
  MATERIAL = 'MATERIAL',
  /** 複合条件: 複数条件を組み合わせ */
  COMPOUND = 'COMPOUND',
}

/**
 * 依頼者タイプ
 * 5種類の依頼者
 * 🔵 青信号: 要件定義書 Section 4.11 に詳細記載
 */
export enum ClientType {
  /** 村人: 日常的な依頼 */
  VILLAGER = 'VILLAGER',
  /** 冒険者: 武器・爆弾系 */
  ADVENTURER = 'ADVENTURER',
  /** 商人: 品質重視 */
  MERCHANT = 'MERCHANT',
  /** 貴族: 高品質・レア品 */
  NOBLE = 'NOBLE',
  /** ギルド: 昇格試験用 */
  GUILD = 'GUILD',
}

/**
 * レアリティ
 * カード・アーティファクトのレア度
 * 🔵 青信号: 要件定義書 Section 4.10 に詳細記載
 */
export enum Rarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
}

/**
 * 強化カードの対象行動
 * 🔵 青信号: 要件定義書 Section 4.4 に詳細記載
 */
export enum EnhancementTarget {
  /** 採取行動を強化 */
  GATHERING = 'GATHERING',
  /** 調合行動を強化 */
  ALCHEMY = 'ALCHEMY',
  /** 納品行動を強化 */
  DELIVERY = 'DELIVERY',
  /** 全行動を強化 */
  ALL = 'ALL',
}

/**
 * 効果タイプ
 * 強化カード・アーティファクトの効果種別
 * 🔵 青信号: 要件定義書 Section 4.4, 4.10 に詳細記載
 */
export enum EffectType {
  /** 品質アップ */
  QUALITY_UP = 'QUALITY_UP',
  /** 素材節約 */
  MATERIAL_SAVE = 'MATERIAL_SAVE',
  /** 獲得素材+1 */
  GATHERING_BONUS = 'GATHERING_BONUS',
  /** レア素材確率アップ */
  RARE_CHANCE_UP = 'RARE_CHANCE_UP',
  /** 報酬金アップ */
  GOLD_BONUS = 'GOLD_BONUS',
  /** 貢献度アップ */
  CONTRIBUTION_BONUS = 'CONTRIBUTION_BONUS',
  /** 行動コスト軽減 */
  COST_REDUCTION = 'COST_REDUCTION',
  /** 素材保管上限アップ */
  STORAGE_EXPANSION = 'STORAGE_EXPANSION',
  /** 行動ポイント追加 */
  ACTION_POINT_BONUS = 'ACTION_POINT_BONUS',
  /** 調合コスト軽減 */
  ALCHEMY_COST_REDUCTION = 'ALCHEMY_COST_REDUCTION',
  /** 全効果アップ */
  ALL_BONUS = 'ALL_BONUS',
}

/**
 * アイテムカテゴリ
 * 調合品のカテゴリ分類
 * 🔵 青信号: 要件定義書 Section 4.3, 4.12 に詳細記載
 */
export enum ItemCategory {
  /** 医療系（回復薬、解毒剤など） */
  MEDICINE = 'MEDICINE',
  /** 武具系（鋼の剣など） */
  WEAPON = 'WEAPON',
  /** 魔法系（魔法の杖など） */
  MAGIC = 'MAGIC',
  /** 冒険者向け（爆弾など） */
  ADVENTURE = 'ADVENTURE',
  /** 高級品 */
  LUXURY = 'LUXURY',
}

/**
 * アイテム効果タイプ
 * 調合品が持つ効果の種別
 * 🔵 青信号: 要件定義書 Section 4.12 に詳細記載
 */
export enum ItemEffectType {
  /** HP回復 */
  HP_RECOVERY = 'HP_RECOVERY',
  /** 攻撃力アップ */
  ATTACK_UP = 'ATTACK_UP',
  /** 防御力アップ */
  DEFENSE_UP = 'DEFENSE_UP',
  /** 解毒 */
  CURE_POISON = 'CURE_POISON',
  /** 爆発ダメージ */
  EXPLOSION = 'EXPLOSION',
}

/**
 * 特殊ルールタイプ
 * ランクごとの特殊ルール
 * 🔵 青信号: 要件定義書 Section 4.7 に詳細記載
 */
export enum SpecialRuleType {
  /** 同時受注上限制限 */
  QUEST_LIMIT = 'QUEST_LIMIT',
  /** 品質制限（貢献度半減） */
  QUALITY_PENALTY = 'QUALITY_PENALTY',
  /** 期限短縮 */
  DEADLINE_REDUCTION = 'DEADLINE_REDUCTION',
  /** 品質必須 */
  QUALITY_REQUIRED = 'QUALITY_REQUIRED',
}

/**
 * 画面種別
 * ゲーム内の各画面
 * 🟡 黄信号: アーキテクチャ設計として妥当な推測
 */
export enum ScreenType {
  TITLE = 'TITLE',
  MAIN = 'MAIN',
  SHOP = 'SHOP',
  RANK_UP = 'RANK_UP',
  RESULT = 'RESULT',
}

// ============================================================================
// カード関連インターフェース
// ============================================================================

/**
 * カード基底インターフェース
 * すべてのカードが持つ共通プロパティ
 */
export interface ICard {
  /** カードID */
  id: string;
  /** カード名 */
  name: string;
  /** カード種別 */
  type: CardType;
  /** レアリティ */
  rarity: Rarity;
  /** 解放ランク */
  unlockRank: GuildRank;
  /** フレーバーテキスト */
  description?: string;
}

/**
 * 採取地カード
 * 🔵 青信号: 要件定義書 Section 4.2 に詳細記載
 */
export interface IGatheringCard extends ICard {
  type: CardType.GATHERING;
  /** 行動コスト（0〜3） */
  cost: number;
  /** 獲得可能な素材リスト */
  materials: IGatheringMaterial[];
}

/**
 * 採取で獲得できる素材情報
 */
export interface IGatheringMaterial {
  /** 素材ID */
  materialId: string;
  /** 獲得数 */
  quantity: number;
  /** 獲得確率（0.0〜1.0） */
  probability: number;
  /** 品質（指定がなければ素材のbaseQualityを使用） */
  quality?: Quality;
}

/**
 * レシピカード
 * 🔵 青信号: 要件定義書 Section 4.3 に詳細記載
 */
export interface IRecipeCard extends ICard {
  type: CardType.RECIPE;
  /** 行動コスト（1〜3） */
  cost: number;
  /** 必要素材リスト */
  requiredMaterials: IRequiredMaterial[];
  /** 出力アイテムID */
  outputItemId: string;
  /** アイテムカテゴリ */
  category: ItemCategory;
}

/**
 * レシピに必要な素材情報
 */
export interface IRequiredMaterial {
  /** 素材ID */
  materialId: string;
  /** 必要数 */
  quantity: number;
  /** 最低品質（指定がなければ任意品質でOK） */
  minQuality?: Quality;
}

/**
 * 強化カード
 * 🔵 青信号: 要件定義書 Section 4.4 に詳細記載
 */
export interface IEnhancementCard extends ICard {
  type: CardType.ENHANCEMENT;
  /** コストは常に0 */
  cost: 0;
  /** 効果 */
  effect: ICardEffect;
  /** 対象行動 */
  targetAction: EnhancementTarget;
}

/**
 * カード効果
 */
export interface ICardEffect {
  /** 効果タイプ */
  type: EffectType;
  /** 効果値 */
  value: number;
}

/**
 * カードのユニオン型
 */
export type Card = IGatheringCard | IRecipeCard | IEnhancementCard;

// ============================================================================
// 素材・アイテム関連インターフェース
// ============================================================================

/**
 * 素材マスターデータ
 * 🔵 青信号: 要件定義書 Section 4.5 に詳細記載
 */
export interface IMaterial {
  /** 素材ID */
  id: string;
  /** 素材名 */
  name: string;
  /** 基本品質 */
  baseQuality: Quality;
  /** 属性リスト */
  attributes: Attribute[];
  /** 説明 */
  description?: string;
}

/**
 * 素材インスタンス（インベントリ内）
 * 品質と数量を持つ実際の素材
 */
export interface IMaterialInstance {
  /** 素材ID（IMaterial.idを参照） */
  materialId: string;
  /** 実際の品質 */
  quality: Quality;
  /** 所持数 */
  quantity: number;
}

/**
 * アイテムマスターデータ
 * 調合で作成できるアイテムの定義
 */
export interface IItem {
  /** アイテムID */
  id: string;
  /** アイテム名 */
  name: string;
  /** カテゴリ */
  category: ItemCategory;
  /** 効果リスト */
  effects: IItemEffect[];
  /** 説明 */
  description?: string;
}

/**
 * アイテム効果
 */
export interface IItemEffect {
  /** 効果タイプ */
  type: ItemEffectType;
  /** 効果値（品質で補正される基本値） */
  baseValue: number;
}

/**
 * 調合済みアイテム（インベントリ内）
 */
export interface ICraftedItem {
  /** アイテムID（IItem.idを参照） */
  itemId: string;
  /** 品質 */
  quality: Quality;
  /** 実際の属性値（調合時に決定） */
  attributeValues: IAttributeValue[];
  /** 実際の効果値（品質補正適用済み） */
  effectValues: IEffectValue[];
  /** 使用した素材情報（素材消費依頼の判定用） */
  usedMaterials: IUsedMaterial[];
}

/**
 * 属性値
 */
export interface IAttributeValue {
  attribute: Attribute;
  value: number;
}

/**
 * 効果値
 */
export interface IEffectValue {
  type: ItemEffectType;
  value: number;
}

/**
 * 使用した素材情報
 */
export interface IUsedMaterial {
  materialId: string;
  quantity: number;
  quality: Quality;
  /** レア素材フラグ */
  isRare: boolean;
}

// ============================================================================
// 依頼関連インターフェース
// ============================================================================

/**
 * 依頼者マスターデータ
 * 🔵 青信号: 要件定義書 Section 4.11 に詳細記載
 */
export interface IClient {
  /** 依頼者ID */
  id: string;
  /** 依頼者名 */
  name: string;
  /** 依頼者タイプ */
  type: ClientType;
  /** 貢献度補正 */
  contributionMultiplier: number;
  /** 報酬金補正 */
  goldMultiplier: number;
  /** 期限補正（+1なら1日延長、-1なら1日短縮） */
  deadlineModifier: number;
  /** 好む依頼タイプ */
  preferredQuestTypes: QuestType[];
  /** 登場ランク */
  unlockRank: GuildRank;
  /** セリフパターン */
  dialoguePatterns?: string[];
}

/**
 * 依頼条件
 * 依頼タイプに応じた条件を表現
 * 🔵 青信号: 要件定義書 Section 4.12 に詳細記載
 */
export interface IQuestCondition {
  /** 依頼タイプ */
  type: QuestType;
  /** 具体的指定: アイテムID */
  itemId?: string;
  /** カテゴリ: アイテムカテゴリ */
  category?: ItemCategory;
  /** 品質条件: 最低品質 */
  minQuality?: Quality;
  /** 数量条件: 必要数 */
  quantity?: number;
  /** 属性条件: 属性 */
  attribute?: Attribute;
  /** 属性条件: 最低属性値 */
  minAttributeValue?: number;
  /** 効果条件: 効果タイプ */
  effectType?: ItemEffectType;
  /** 効果条件: 最低効果値 */
  minEffectValue?: number;
  /** 素材消費: レア素材使用数 */
  rareMaterialCount?: number;
  /** 素材消費: 特定素材ID */
  requiredMaterialId?: string;
  /** 複合条件: 子条件リスト */
  subConditions?: IQuestCondition[];
}

/**
 * 依頼マスターデータ
 * 依頼のテンプレート
 */
export interface IQuestTemplate {
  /** 依頼テンプレートID */
  id: string;
  /** 依頼タイプ */
  type: QuestType;
  /** 難易度（簡単/普通/難しい/最難関） */
  difficulty: 'easy' | 'normal' | 'hard' | 'extreme';
  /** 基本貢献度 */
  baseContribution: number;
  /** 基本報酬金 */
  baseGold: number;
  /** 基本期限（日） */
  baseDeadline: number;
  /** 条件テンプレート */
  conditionTemplate: Partial<IQuestCondition>;
  /** 解放ランク */
  unlockRank: GuildRank;
  /** フレーバーテキストテンプレート */
  flavorTextTemplate?: string;
}

/**
 * 生成された依頼
 * 依頼者と依頼テンプレートから生成される実際の依頼
 */
export interface IQuest {
  /** 依頼ID（ランタイムで生成） */
  id: string;
  /** 依頼者ID */
  clientId: string;
  /** 依頼条件 */
  condition: IQuestCondition;
  /** 貢献度（依頼者補正適用済み） */
  contribution: number;
  /** 報酬金（依頼者補正適用済み） */
  gold: number;
  /** 期限（依頼者補正適用済み） */
  deadline: number;
  /** 難易度 */
  difficulty: 'easy' | 'normal' | 'hard' | 'extreme';
  /** フレーバーテキスト */
  flavorText: string;
}

/**
 * 受注中の依頼
 */
export interface IActiveQuest {
  /** 依頼データ */
  quest: IQuest;
  /** 残り日数 */
  remainingDays: number;
  /** 受注日 */
  acceptedDay: number;
}

/**
 * 報酬カード候補
 * 🔵 青信号: 要件定義書 Section 4.6 に詳細記載
 */
export interface IRewardCardCandidate {
  /** カードID */
  cardId: string;
  /** レアリティ */
  rarity: Rarity;
  /** 候補タイプ（依頼者関連/依頼タイプ関連/ランダム） */
  sourceType: 'client' | 'questType' | 'random';
}

// ============================================================================
// ギルドランク関連インターフェース
// ============================================================================

/**
 * 特殊ルール
 * 🔵 青信号: 要件定義書 Section 4.7 に詳細記載
 */
export interface ISpecialRule {
  /** ルールタイプ */
  type: SpecialRuleType;
  /** ルールの値（例: QUEST_LIMITなら上限数） */
  value?: number;
  /** 適用条件（例: QUALITY_PENALTYなら対象品質） */
  condition?: Quality;
  /** 説明文 */
  description: string;
}

/**
 * 昇格試験の要件
 * 🔵 青信号: 要件定義書 Section 4.7 に詳細記載
 */
export interface IPromotionRequirement {
  /** アイテムID */
  itemId: string;
  /** 必要数 */
  quantity: number;
  /** 最低品質 */
  minQuality?: Quality;
}

/**
 * 昇格試験
 */
export interface IPromotionTest {
  /** 試験要件リスト */
  requirements: IPromotionRequirement[];
  /** 制限日数 */
  dayLimit: number;
}

/**
 * ギルドランクマスターデータ
 * 🔵 青信号: 要件定義書 Section 4.7 に詳細記載
 */
export interface IGuildRank {
  /** ランクID */
  id: GuildRank;
  /** ランク名 */
  name: string;
  /** HP */
  hp: number;
  /** 制限日数 */
  dayLimit: number;
  /** 特殊ルールリスト */
  specialRules: ISpecialRule[];
  /** 昇格試験（Sランクはnull） */
  promotionTest: IPromotionTest | null;
  /** 解放される採取地カードID */
  unlockedGatheringCards: string[];
  /** 解放されるレシピカードID */
  unlockedRecipeCards: string[];
}

// ============================================================================
// アーティファクト関連インターフェース
// ============================================================================

/**
 * アーティファクトマスターデータ
 * 🔵 青信号: 要件定義書 Section 4.10 に詳細記載
 */
export interface IArtifact {
  /** アーティファクトID */
  id: string;
  /** 名前 */
  name: string;
  /** 効果 */
  effect: ICardEffect;
  /** レアリティ */
  rarity: Rarity;
  /** 説明 */
  description?: string;
}

// ============================================================================
// ショップ関連インターフェース
// ============================================================================

/**
 * ショップアイテム
 * 🔵 青信号: 要件定義書 Section 4.9 に詳細記載
 */
export interface IShopItem {
  /** アイテムタイプ */
  type: 'card' | 'material' | 'artifact';
  /** 対象ID（カードID/素材ID/アーティファクトID） */
  itemId: string;
  /** 価格 */
  price: number;
  /** 在庫数（-1は無制限） */
  stock: number;
  /** 解放ランク */
  unlockRank: GuildRank;
}

// ============================================================================
// ゲーム状態インターフェース
// ============================================================================

/**
 * ゲーム進行状態
 * 🔵 青信号: 要件定義書 Section 5.1 に詳細記載
 */
export interface IGameState {
  /** 現在のランク */
  currentRank: GuildRank;
  /** 現在のランクHP */
  rankHp: number;
  /** 残り日数 */
  remainingDays: number;
  /** 現在の日数（1日目から開始） */
  currentDay: number;
  /** 現在のフェーズ */
  currentPhase: GamePhase;
  /** 所持金 */
  gold: number;
  /** コンボカウント */
  comboCount: number;
  /** 残り行動ポイント */
  actionPoints: number;
  /** 昇格試験中フラグ */
  isPromotionTest: boolean;
  /** 昇格試験の残り日数 */
  promotionTestRemainingDays?: number;
}

/**
 * デッキ状態
 * 🔵 青信号: 要件定義書 Section 5.1 に詳細記載
 */
export interface IDeckState {
  /** 山札（カードIDの配列） */
  deck: string[];
  /** 手札（カードIDの配列） */
  hand: string[];
  /** 捨て札（カードIDの配列） */
  discard: string[];
  /** 所持している全カード（カードIDの配列） */
  ownedCards: string[];
}

/**
 * インベントリ状態
 */
export interface IInventoryState {
  /** 素材リスト */
  materials: IMaterialInstance[];
  /** 調合済みアイテムリスト */
  craftedItems: ICraftedItem[];
  /** 素材保管上限 */
  storageLimit: number;
}

/**
 * 依頼状態
 */
export interface IQuestState {
  /** 受注中の依頼リスト */
  activeQuests: IActiveQuest[];
  /** 今日の依頼者リスト（依頼者ID） */
  todayClients: string[];
  /** 今日の依頼リスト */
  todayQuests: IQuest[];
  /** 同時受注上限 */
  questLimit: number;
}

/**
 * セーブデータ全体
 */
export interface ISaveData {
  /** セーブデータバージョン */
  version: string;
  /** 最終保存日時（ISO8601） */
  lastSaved: string;
  /** ゲーム状態 */
  gameState: IGameState;
  /** デッキ状態 */
  deckState: IDeckState;
  /** インベントリ状態 */
  inventoryState: IInventoryState;
  /** 依頼状態 */
  questState: IQuestState;
  /** 所持アーティファクト（アーティファクトIDの配列） */
  artifacts: string[];
}

// ============================================================================
// イベント関連インターフェース
// ============================================================================

/**
 * ゲームイベントタイプ
 * 🟡 黄信号: イベント駆動設計として妥当な推測
 */
export enum GameEventType {
  // フェーズ関連
  PHASE_CHANGED = 'PHASE_CHANGED',
  DAY_ENDED = 'DAY_ENDED',
  DAY_STARTED = 'DAY_STARTED',

  // 依頼関連
  QUEST_ACCEPTED = 'QUEST_ACCEPTED',
  QUEST_COMPLETED = 'QUEST_COMPLETED',
  QUEST_FAILED = 'QUEST_FAILED',
  QUEST_CANCELLED = 'QUEST_CANCELLED',

  // 採取関連
  GATHERING_STARTED = 'GATHERING_STARTED',
  GATHERING_COMPLETED = 'GATHERING_COMPLETED',

  // 調合関連
  ALCHEMY_STARTED = 'ALCHEMY_STARTED',
  ALCHEMY_COMPLETED = 'ALCHEMY_COMPLETED',

  // カード関連
  CARD_DRAWN = 'CARD_DRAWN',
  CARD_PLAYED = 'CARD_PLAYED',
  CARD_DISCARDED = 'CARD_DISCARDED',
  CARD_ADDED = 'CARD_ADDED',

  // ランク関連
  RANK_DAMAGED = 'RANK_DAMAGED',
  RANK_HP_ZERO = 'RANK_HP_ZERO',
  PROMOTION_TEST_STARTED = 'PROMOTION_TEST_STARTED',
  PROMOTION_TEST_COMPLETED = 'PROMOTION_TEST_COMPLETED',
  RANK_UP = 'RANK_UP',

  // 経済関連
  GOLD_CHANGED = 'GOLD_CHANGED',
  ITEM_PURCHASED = 'ITEM_PURCHASED',

  // ゲーム進行関連
  GAME_STARTED = 'GAME_STARTED',
  GAME_OVER = 'GAME_OVER',
  GAME_CLEARED = 'GAME_CLEARED',
  GAME_SAVED = 'GAME_SAVED',
  GAME_LOADED = 'GAME_LOADED',
}

/**
 * ゲームイベント基底
 */
export interface IGameEvent {
  type: GameEventType;
  timestamp: number;
}

/**
 * フェーズ変更イベント
 */
export interface IPhaseChangedEvent extends IGameEvent {
  type: GameEventType.PHASE_CHANGED;
  previousPhase: GamePhase;
  newPhase: GamePhase;
}

/**
 * 依頼完了イベント
 */
export interface IQuestCompletedEvent extends IGameEvent {
  type: GameEventType.QUEST_COMPLETED;
  quest: IQuest;
  deliveredItem: ICraftedItem;
  earnedContribution: number;
  earnedGold: number;
  comboCount: number;
  rewardCardCandidates: IRewardCardCandidate[];
}

/**
 * 採取完了イベント
 */
export interface IGatheringCompletedEvent extends IGameEvent {
  type: GameEventType.GATHERING_COMPLETED;
  gatheringCardId: string;
  obtainedMaterials: IMaterialInstance[];
  usedEnhancementCards: string[];
}

/**
 * 調合完了イベント
 */
export interface IAlchemyCompletedEvent extends IGameEvent {
  type: GameEventType.ALCHEMY_COMPLETED;
  recipeCardId: string;
  craftedItem: ICraftedItem;
  usedEnhancementCards: string[];
}

/**
 * ランクダメージイベント
 */
export interface IRankDamagedEvent extends IGameEvent {
  type: GameEventType.RANK_DAMAGED;
  damage: number;
  remainingHp: number;
}

/**
 * ランクアップイベント
 */
export interface IRankUpEvent extends IGameEvent {
  type: GameEventType.RANK_UP;
  previousRank: GuildRank;
  newRank: GuildRank;
  artifactCandidates: string[];
}

/**
 * ゲームオーバーイベント
 */
export interface IGameOverEvent extends IGameEvent {
  type: GameEventType.GAME_OVER;
  reason: 'day_limit_exceeded';
  finalRank: GuildRank;
  totalDays: number;
}

/**
 * ゲームクリアイベント
 */
export interface IGameClearedEvent extends IGameEvent {
  type: GameEventType.GAME_CLEARED;
  totalDays: number;
  finalScore: number;
}

// ============================================================================
// サービスインターフェース
// ============================================================================

/**
 * デッキサービスインターフェース
 * 🟡 黄信号: アーキテクチャ設計として妥当な推測
 */
export interface IDeckService {
  /** デッキをシャッフル */
  shuffle(): void;
  /** カードをドロー */
  draw(count: number): string[];
  /** 手札からカードを使用 */
  playCard(cardId: string): void;
  /** カードを捨てる */
  discardCard(cardId: string): void;
  /** デッキにカードを追加 */
  addCard(cardId: string): void;
  /** 手札を補充（上限まで） */
  refillHand(): void;
  /** 捨て札を山札に戻してシャッフル */
  reshuffleDiscard(): void;
}

/**
 * 採取サービスインターフェース
 */
export interface IGatheringService {
  /** 採取を実行 */
  gather(
    gatheringCardId: string,
    enhancementCardIds?: string[]
  ): IMaterialInstance[];
  /** 採取可能かチェック */
  canGather(gatheringCardId: string): boolean;
}

/**
 * 調合サービスインターフェース
 */
export interface IAlchemyService {
  /** 調合を実行 */
  craft(
    recipeCardId: string,
    selectedMaterials: IMaterialInstance[],
    enhancementCardIds?: string[]
  ): ICraftedItem;
  /** 調合可能かチェック */
  canCraft(recipeCardId: string): boolean;
  /** 必要素材を所持しているかチェック */
  hasMaterials(recipeCardId: string): boolean;
}

/**
 * 依頼サービスインターフェース
 */
export interface IQuestService {
  /** 今日の依頼者と依頼を生成 */
  generateDailyQuests(): { clients: IClient[]; quests: IQuest[] };
  /** 依頼を受注 */
  acceptQuest(questId: string): boolean;
  /** 依頼をキャンセル */
  cancelQuest(questId: string): void;
  /** 納品可能かチェック */
  canDeliver(questId: string, item: ICraftedItem): boolean;
  /** 納品を実行 */
  deliver(
    questId: string,
    item: ICraftedItem,
    enhancementCardIds?: string[]
  ): { contribution: number; gold: number; rewardCards: IRewardCardCandidate[] };
}

/**
 * 貢献度計算サービスインターフェース
 * 🔵 青信号: 要件定義書 Section 4.6 に計算式記載
 */
export interface IContributionCalculator {
  /** 貢献度を計算 */
  calculate(
    baseContribution: number,
    quality: Quality,
    questType: QuestType,
    comboCount: number,
    artifacts: IArtifact[],
    enhancementCards: IEnhancementCard[]
  ): number;
}

/**
 * セーブデータリポジトリインターフェース
 * 🟡 黄信号: アーキテクチャ設計として妥当な推測
 */
export interface ISaveDataRepository {
  /** セーブデータを保存 */
  save(data: ISaveData): void;
  /** セーブデータを読み込み */
  load(): ISaveData | null;
  /** セーブデータが存在するかチェック */
  exists(): boolean;
  /** セーブデータを削除 */
  delete(): void;
}

/**
 * マスターデータローダーインターフェース
 */
export interface IMasterDataLoader {
  /** 採取地カードを読み込み */
  loadGatheringCards(): IGatheringCard[];
  /** レシピカードを読み込み */
  loadRecipeCards(): IRecipeCard[];
  /** 強化カードを読み込み */
  loadEnhancementCards(): IEnhancementCard[];
  /** 素材マスターを読み込み */
  loadMaterials(): IMaterial[];
  /** アイテムマスターを読み込み */
  loadItems(): IItem[];
  /** ギルドランクマスターを読み込み */
  loadGuildRanks(): IGuildRank[];
  /** 依頼者マスターを読み込み */
  loadClients(): IClient[];
  /** アーティファクトマスターを読み込み */
  loadArtifacts(): IArtifact[];
  /** ショップアイテムを読み込み */
  loadShopItems(): IShopItem[];
}

// ============================================================================
// ユーティリティ型
// ============================================================================

/**
 * 品質の数値変換マップ
 */
export const QualityValue: Record<Quality, number> = {
  [Quality.D]: 1,
  [Quality.C]: 2,
  [Quality.B]: 3,
  [Quality.A]: 4,
  [Quality.S]: 5,
};

/**
 * 品質補正マップ
 * 🔵 青信号: 要件定義書 Section 4.6 に詳細記載
 */
export const QualityMultiplier: Record<Quality, number> = {
  [Quality.D]: 0.5,
  [Quality.C]: 1.0,
  [Quality.B]: 1.5,
  [Quality.A]: 2.0,
  [Quality.S]: 3.0,
};

/**
 * 依頼タイプ補正マップ
 * 🔵 青信号: 要件定義書 Section 4.6 に詳細記載
 */
export const QuestTypeMultiplier: Record<QuestType, number> = {
  [QuestType.SPECIFIC]: 1.0,
  [QuestType.CATEGORY]: 0.8,
  [QuestType.QUALITY]: 1.2,
  [QuestType.QUANTITY]: 0.7,
  [QuestType.ATTRIBUTE]: 1.3,
  [QuestType.EFFECT]: 1.3,
  [QuestType.MATERIAL]: 1.5,
  [QuestType.COMPOUND]: 1.8,
};

/**
 * コンボ補正マップ
 * 🔵 青信号: 要件定義書 Section 4.6 に詳細記載
 */
export const ComboMultiplier: Record<number, number> = {
  0: 1.0,
  1: 1.0,
  2: 1.1,
  3: 1.2,
  4: 1.2,
  5: 1.5,
  6: 1.5,
  7: 1.5,
  8: 1.5,
  9: 1.5,
  10: 2.0, // 10連続以上はフィーバー
};

/**
 * ランク順序（比較用）
 */
export const RankOrder: Record<GuildRank, number> = {
  [GuildRank.G]: 0,
  [GuildRank.F]: 1,
  [GuildRank.E]: 2,
  [GuildRank.D]: 3,
  [GuildRank.C]: 4,
  [GuildRank.B]: 5,
  [GuildRank.A]: 6,
  [GuildRank.S]: 7,
};

/**
 * 初期パラメータ
 * 🔵 青信号: 要件定義書 Section 5.1 に詳細記載
 */
export const InitialParameters = {
  INITIAL_DECK_SIZE: 15,
  DECK_LIMIT: 30,
  HAND_LIMIT: 7,
  ACTION_POINTS_PER_DAY: 3,
  INITIAL_GOLD: 100,
  INITIAL_STORAGE_LIMIT: 20,
  MAX_ACTIVE_QUESTS: 3,
  HAND_REFILL_COUNT: 5,
} as const;
