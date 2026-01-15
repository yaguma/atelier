/**
 * アトリエ錬金術ゲーム TypeScriptインターフェース定義
 *
 * @version 1.0.0
 * @description ギルドランク制デッキ構築RPGのドメインモデル型定義
 * @see docs/spec/atelier-guild-rank-requirements.md
 */

// ============================================================================

/**
 * 依頼・ランク・アーティファクト・ショップ・ゲーム状態関連の型定義
 * このファイルは interfaces.ts から分割されたのだ
 * @see interfaces/core.ts
 */

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

