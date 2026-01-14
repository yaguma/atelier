/**
 * アトリエ錬金術ゲーム TypeScriptインターフェース定義
 *
 * @version 1.0.0
 * @description ギルドランク制デッキ構築RPGのドメインモデル型定義
 * @see docs/spec/atelier-guild-rank-requirements.md
 */

// ============================================================================

/**
 * ゲーム状態・イベント・サービス関連の型定義
 * このファイルは interfaces.ts から分割されたのだ
 * @see interfaces/core.ts
 */

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
