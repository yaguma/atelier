/**
 * アトリエ錬金術ゲーム（ギルドランク制）Phaser版
 * TypeScript型定義ファイル
 *
 * @version 1.0.0
 * @created 2026-01-16
 *
 * このファイルは設計ドキュメントの一部として、
 * ゲーム全体で使用される型定義を提供する。
 */

// =============================================================================
// 基本型・列挙型
// =============================================================================

/** ランクID（G〜S） */
export type RankId = 'G' | 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

/** フェーズ種別 */
export type Phase =
  | 'QUEST_ACCEPT'   // 依頼受注フェーズ
  | 'GATHERING'      // 採取フェーズ
  | 'ALCHEMY'        // 調合フェーズ
  | 'DELIVERY';      // 納品フェーズ

/** カード種別 */
export type CardType =
  | 'GATHERING'      // 採取地カード
  | 'RECIPE'         // レシピカード
  | 'ENHANCEMENT';   // 強化カード

/** 依頼種別 */
export type QuestType =
  | 'DELIVERY'           // 納品依頼（指定アイテム）
  | 'HIGH_QUALITY'       // 高品質納品
  | 'BULK_ORDER'         // 大量発注
  | 'URGENT'             // 緊急依頼
  | 'MATERIAL_DELIVERY'  // 素材納品
  | 'ATTRIBUTE_DELIVERY' // 属性指定
  | 'CONTINUOUS'         // 継続依頼
  | 'CHALLENGE';         // チャレンジ

/** 依頼者種別 */
export type ClientType =
  | 'GUILD_STAFF'    // ギルド職員
  | 'MERCHANT'       // 商人
  | 'NOBLE'          // 貴族
  | 'ADVENTURER'     // 冒険者
  | 'ALCHEMIST';     // 錬金術師

/** アイテム品質 */
export type Quality = 'LOW' | 'NORMAL' | 'HIGH' | 'EXCELLENT';

/** 素材属性 */
export type Attribute = 'FIRE' | 'WATER' | 'EARTH' | 'WIND' | 'LIGHT' | 'DARK';

/** 強化効果種別 */
export type EnhancementEffectType =
  | 'QUALITY_BONUS'         // 品質ボーナス
  | 'COST_REDUCTION'        // コスト軽減
  | 'CONTRIBUTION_BONUS'    // 貢献度ボーナス
  | 'MATERIAL_BONUS'        // 素材獲得ボーナス
  | 'PRESENTATION_BONUS'    // 提示回数ボーナス
  | 'ATTRIBUTE_BONUS';      // 属性ボーナス

/** アーティファクト効果種別 */
export type ArtifactEffectType =
  | 'CONTRIBUTION_MULTIPLIER'  // 貢献度倍率
  | 'QUALITY_BONUS'            // 品質ボーナス
  | 'COST_REDUCTION'           // コスト軽減
  | 'PRESENTATION_BONUS'       // 提示回数ボーナス
  | 'MATERIAL_BONUS'           // 素材獲得ボーナス
  | 'GOLD_BONUS';              // ゴールドボーナス

/** ゲームオーバー理由 */
export type GameOverReason =
  | 'DAY_LIMIT_EXCEEDED'   // 日数切れ
  | 'PROMOTION_TEST_FAILED'; // 昇格試験失敗

// =============================================================================
// エンティティ型
// =============================================================================

/** カードID */
export type CardId = string;

/** 素材ID */
export type MaterialId = string;

/** アイテムID */
export type ItemId = string;

/** 依頼ID */
export type QuestId = string;

/** アーティファクトID */
export type ArtifactId = string;

/** 依頼者ID */
export type ClientId = string;

/** レシピID */
export type RecipeId = string;

// -----------------------------------------------------------------------------
// カード関連
// -----------------------------------------------------------------------------

/** 採取地カードマスター */
export interface GatheringCardMaster {
  id: CardId;
  type: 'GATHERING';
  name: string;
  description: string;
  baseCost: number;           // 基本コスト（行動ポイント）
  presentationCount: number;  // 素材提示回数
  rareRate: number;           // レア素材出現率（0-1）
  materialPool: MaterialId[]; // 出現可能素材プール
  unlockRank?: RankId;        // 解禁ランク
}

/** レシピカードマスター */
export interface RecipeCardMaster {
  id: CardId;
  type: 'RECIPE';
  name: string;
  description: string;
  resultItem: ItemId;           // 生成アイテム
  requiredMaterials: {
    materialId: MaterialId;
    quantity: number;
  }[];
  baseQuality: number;          // 基本品質値
  attributeBonus?: {
    attribute: Attribute;
    bonus: number;
  };
  unlockRank?: RankId;
}

/** 強化カードマスター */
export interface EnhancementCardMaster {
  id: CardId;
  type: 'ENHANCEMENT';
  name: string;
  description: string;
  effect: {
    type: EnhancementEffectType;
    value: number;
    duration?: 'TURN' | 'DAY' | 'PERMANENT';
  };
  unlockRank?: RankId;
}

/** カードマスター（ユニオン型） */
export type CardMaster =
  | GatheringCardMaster
  | RecipeCardMaster
  | EnhancementCardMaster;

// -----------------------------------------------------------------------------
// 素材・アイテム関連
// -----------------------------------------------------------------------------

/** 素材マスター */
export interface MaterialMaster {
  id: MaterialId;
  name: string;
  description: string;
  baseQuality: number;
  possibleAttributes: Attribute[];
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE';
}

/** 素材インスタンス（所持素材） */
export interface MaterialInstance {
  materialId: MaterialId;
  quality: number;              // 実際の品質値（0-100）
  attribute?: Attribute;        // 付与された属性
  acquiredDay: number;          // 取得日
}

/** アイテムマスター */
export interface ItemMaster {
  id: ItemId;
  name: string;
  description: string;
  category: string;
  basePrice: number;
}

/** アイテムインスタンス（所持アイテム） */
export interface ItemInstance {
  itemId: ItemId;
  quality: Quality;
  qualityValue: number;         // 品質数値（0-100）
  attribute?: Attribute;
  craftedDay: number;           // 調合日
}

// -----------------------------------------------------------------------------
// 依頼関連
// -----------------------------------------------------------------------------

/** 依頼マスター */
export interface QuestMaster {
  id: QuestId;
  type: QuestType;
  name: string;
  description: string;
  clientType: ClientType;
  targetItem?: ItemId;
  targetMaterial?: MaterialId;
  targetAttribute?: Attribute;
  requiredQuantity: number;
  requiredQuality?: Quality;
  baseReward: {
    gold: number;
    contribution: number;
  };
  timeLimit: number;            // 期限（日数）
  availableRanks: RankId[];     // 出現可能ランク
}

/** 依頼インスタンス（受注済み依頼） */
export interface Quest {
  questId: QuestId;
  clientId: ClientId;
  acceptedDay: number;
  deadline: number;             // 期限日
  deliveredQuantity: number;    // 納品済み数量
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
}

/** 依頼者マスター */
export interface ClientMaster {
  id: ClientId;
  type: ClientType;
  name: string;
  description: string;
  preferredQuestTypes: QuestType[];
  contributionMultiplier: number; // 貢献度倍率
}

// -----------------------------------------------------------------------------
// ランク関連
// -----------------------------------------------------------------------------

/** ランクマスター */
export interface RankMaster {
  id: RankId;
  name: string;
  requiredContribution: number; // 昇格に必要な貢献度
  dayLimit: number;             // 次ランクまでの日数制限
  unlockCards: CardId[];        // 解禁カード
  promotionTest: {
    type: 'ITEM_DELIVERY' | 'QUALITY_CHECK' | 'QUANTITY_CHECK';
    targetItem?: ItemId;
    requiredQuality?: Quality;
    requiredQuantity?: number;
  };
}

// -----------------------------------------------------------------------------
// アーティファクト関連
// -----------------------------------------------------------------------------

/** アーティファクトマスター */
export interface ArtifactMaster {
  id: ArtifactId;
  name: string;
  description: string;
  effect: {
    type: ArtifactEffectType;
    value: number;
    condition?: string;
  };
  price: number;
  unlockRank?: RankId;
}

// =============================================================================
// ゲーム状態型
// =============================================================================

/** ゲーム状態（StateManager管理） */
export interface GameState {
  // 進行状態
  currentDay: number;
  maxDays: number;
  currentPhase: Phase;
  currentRank: RankId;

  // プレイヤーリソース
  gold: number;
  promotionGauge: number;
  requiredContribution: number;

  // デッキ状態
  deck: CardId[];
  hand: CardId[];
  discardPile: CardId[];

  // インベントリ
  materials: MaterialInstance[];
  items: ItemInstance[];
  artifacts: ArtifactId[];

  // 依頼状態
  availableQuests: Quest[];
  acceptedQuests: Quest[];

  // 昇格試験状態
  promotionTest?: PromotionTestState;

  // アクティブな強化効果
  activeEnhancements: ActiveEnhancement[];
}

/** アクティブな強化効果 */
export interface ActiveEnhancement {
  cardId: CardId;
  effect: {
    type: EnhancementEffectType;
    value: number;
  };
  expiresAt: 'END_OF_TURN' | 'END_OF_DAY' | number; // 日数
}

/** 昇格試験状態 */
export interface PromotionTestState {
  targetRank: RankId;
  requirement: {
    type: 'ITEM_DELIVERY' | 'QUALITY_CHECK' | 'QUANTITY_CHECK';
    targetItem?: ItemId;
    requiredQuality?: Quality;
    requiredQuantity?: number;
  };
  currentProgress: number;
  maxAttempts: number;
  attemptsUsed: number;
}

// =============================================================================
// ドラフト採取関連型
// =============================================================================

/** 素材提示オプション */
export interface MaterialOption {
  material: MaterialInstance;
  slot: number;
}

/** ドラフト採取の状態 */
export interface DraftGatheringState {
  gatheringCard: GatheringCardMaster;
  presentedOptions: MaterialOption[][];  // 各回の提示素材
  currentRound: number;
  maxRounds: number;
  selectedMaterials: MaterialInstance[];
  remainingCost: number;
}

// =============================================================================
// イベントペイロード型
// =============================================================================

/** 状態更新イベント */
export interface StateUpdatedPayload {
  state: GameState;
  changedFields: (keyof GameState)[];
}

/** フェーズ変更イベント */
export interface PhaseChangedPayload {
  from: Phase;
  to: Phase;
  day: number;
}

/** 依頼受注イベント */
export interface QuestAcceptedPayload {
  quest: Quest;
  clientId: ClientId;
}

/** 採取完了イベント */
export interface GatheringCompletedPayload {
  cardUsed: CardId;
  materialsGained: MaterialInstance[];
  costSpent: number;
}

/** アイテム調合イベント */
export interface ItemCraftedPayload {
  item: ItemInstance;
  recipeUsed: CardId;
  materialsUsed: MaterialInstance[];
}

/** 依頼納品イベント */
export interface QuestDeliveredPayload {
  questId: QuestId;
  itemsDelivered: ItemInstance[];
  reward: {
    gold: number;
    contribution: number;
  };
  bonusApplied?: {
    type: string;
    multiplier: number;
  };
}

/** 昇格トリガーイベント */
export interface RankUpTriggeredPayload {
  fromRank: RankId;
  toRank: RankId;
  testRequirement: PromotionTestState['requirement'];
}

/** ゲームオーバーイベント */
export interface GameOverPayload {
  reason: GameOverReason;
  finalStats: {
    daysPlayed: number;
    finalRank: RankId;
    totalGoldEarned: number;
    questsCompleted: number;
  };
}

/** ゲームクリアイベント */
export interface GameClearPayload {
  finalStats: {
    daysPlayed: number;
    totalGoldEarned: number;
    questsCompleted: number;
    itemsCrafted: number;
    cardsCollected: number;
  };
}

// =============================================================================
// サービスインターフェース
// =============================================================================

// -----------------------------------------------------------------------------
// Infrastructure層
// -----------------------------------------------------------------------------

/** ストレージアダプター */
export interface IStorageAdapter {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
  has(key: string): boolean;
}

/** マスターデータローダー */
export interface IMasterDataLoader {
  loadCards(): Promise<CardMaster[]>;
  loadMaterials(): Promise<MaterialMaster[]>;
  loadItems(): Promise<ItemMaster[]>;
  loadQuests(): Promise<QuestMaster[]>;
  loadClients(): Promise<ClientMaster[]>;
  loadRanks(): Promise<RankMaster[]>;
  loadArtifacts(): Promise<ArtifactMaster[]>;
  loadInitialDeck(): Promise<CardId[]>;
}

/** 乱数生成器 */
export interface IRandomGenerator {
  next(): number;
  nextInt(min: number, max: number): number;
  shuffle<T>(array: T[]): T[];
  pick<T>(array: T[]): T;
  pickWeighted<T>(items: T[], weights: number[]): T;
  setSeed(seed: number): void;
}

/** セーブデータリポジトリ */
export interface ISaveDataRepository {
  save(slot: number, data: SaveData): Promise<void>;
  load(slot: number): Promise<SaveData | null>;
  delete(slot: number): Promise<void>;
  exists(slot: number): Promise<boolean>;
  listSlots(): Promise<SaveSlotInfo[]>;
}

// -----------------------------------------------------------------------------
// Domain層
// -----------------------------------------------------------------------------

/** デッキサービス */
export interface IDeckService {
  createInitialDeck(cardIds: CardId[]): CardId[];
  shuffle(deck: CardId[]): CardId[];
  draw(deck: CardId[], hand: CardId[], count: number): {
    deck: CardId[];
    hand: CardId[];
    drawnCards: CardId[];
  };
  discard(hand: CardId[], discardPile: CardId[], cardIds: CardId[]): {
    hand: CardId[];
    discardPile: CardId[];
  };
  reshuffleDiscardIntoDeck(deck: CardId[], discardPile: CardId[]): {
    deck: CardId[];
    discardPile: CardId[];
  };
  addCard(deck: CardId[], cardId: CardId): CardId[];
  removeCard(deck: CardId[], cardId: CardId): CardId[];
}

/** 採取サービス */
export interface IGatheringService {
  startDraftGathering(
    card: GatheringCardMaster,
    artifacts: ArtifactMaster[]
  ): DraftGatheringState;
  presentMaterials(state: DraftGatheringState): MaterialOption[];
  selectMaterial(
    state: DraftGatheringState,
    selectedIndex: number
  ): DraftGatheringState;
  completeDraftGathering(state: DraftGatheringState): MaterialInstance[];
  calculateGatheringCost(
    card: GatheringCardMaster,
    enhancements: ActiveEnhancement[]
  ): number;
}

/** 調合サービス */
export interface IAlchemyService {
  canCraft(
    recipe: RecipeCardMaster,
    materials: MaterialInstance[]
  ): boolean;
  craft(
    recipe: RecipeCardMaster,
    selectedMaterials: MaterialInstance[],
    enhancements: ActiveEnhancement[]
  ): ItemInstance;
  calculateQuality(
    recipe: RecipeCardMaster,
    materials: MaterialInstance[],
    enhancements: ActiveEnhancement[]
  ): number;
  determineQualityGrade(qualityValue: number): Quality;
}

/** 依頼サービス */
export interface IQuestService {
  generateAvailableQuests(
    rank: RankId,
    day: number,
    existingQuests: Quest[]
  ): Quest[];
  acceptQuest(quest: Quest, currentDay: number): Quest;
  checkDeliverable(
    quest: Quest,
    item: ItemInstance
  ): boolean;
  deliver(
    quest: Quest,
    items: ItemInstance[]
  ): {
    quest: Quest;
    reward: { gold: number; contribution: number };
  };
  checkExpired(quests: Quest[], currentDay: number): {
    active: Quest[];
    expired: Quest[];
  };
}

/** 貢献度計算サービス */
export interface IContributionCalculator {
  calculate(
    baseContribution: number,
    quality: Quality,
    client: ClientMaster,
    artifacts: ArtifactMaster[],
    enhancements: ActiveEnhancement[]
  ): number;
  calculateBonus(
    quest: Quest,
    deliveryResult: { quality: Quality; quantity: number }
  ): number;
}

/** ランクサービス */
export interface IRankService {
  checkPromotionReady(
    promotionGauge: number,
    requiredContribution: number
  ): boolean;
  getNextRank(currentRank: RankId): RankId | null;
  createPromotionTest(targetRank: RankId): PromotionTestState;
  evaluatePromotionTest(
    test: PromotionTestState,
    deliveredItem: ItemInstance
  ): { passed: boolean; progress: number };
  promoteRank(currentRank: RankId): RankId;
}

/** ショップサービス */
export interface IShopService {
  getAvailableCards(rank: RankId): CardMaster[];
  getAvailableArtifacts(rank: RankId): ArtifactMaster[];
  purchaseCard(
    cardId: CardId,
    gold: number
  ): { success: boolean; remainingGold: number; card?: CardMaster };
  purchaseArtifact(
    artifactId: ArtifactId,
    gold: number
  ): { success: boolean; remainingGold: number; artifact?: ArtifactMaster };
  getCardPrice(card: CardMaster): number;
}

/** アーティファクトサービス */
export interface IArtifactService {
  getActiveEffects(artifactIds: ArtifactId[]): ArtifactMaster[];
  applyEffect<T>(
    effectType: ArtifactEffectType,
    baseValue: T,
    artifacts: ArtifactMaster[]
  ): T;
}

/** 素材サービス */
export interface IMaterialService {
  generateMaterial(
    materialId: MaterialId,
    rareRate: number
  ): MaterialInstance;
  calculateQuality(baseMaterial: MaterialMaster): number;
  assignAttribute(
    material: MaterialInstance,
    possibleAttributes: Attribute[]
  ): MaterialInstance;
}

/** インベントリサービス */
export interface IInventoryService {
  addMaterial(
    inventory: MaterialInstance[],
    material: MaterialInstance
  ): MaterialInstance[];
  removeMaterial(
    inventory: MaterialInstance[],
    material: MaterialInstance
  ): MaterialInstance[];
  addItem(
    inventory: ItemInstance[],
    item: ItemInstance
  ): ItemInstance[];
  removeItem(
    inventory: ItemInstance[],
    item: ItemInstance
  ): ItemInstance[];
  findMaterials(
    inventory: MaterialInstance[],
    materialId: MaterialId
  ): MaterialInstance[];
  sortByQuality(materials: MaterialInstance[]): MaterialInstance[];
}

// -----------------------------------------------------------------------------
// Application層
// -----------------------------------------------------------------------------

/** イベントバス */
export interface IEventBus {
  publish<T>(event: string, payload: T): void;
  subscribe<T>(event: string, handler: (payload: T) => void): () => void;
  unsubscribe(event: string, handler: Function): void;
  unsubscribeAll(): void;
}

/** 状態マネージャー */
export interface IStateManager {
  getState(): Readonly<GameState>;
  updateState(changes: Partial<GameState>): void;
  resetState(): void;
  subscribe(handler: (state: GameState) => void): () => void;
}

/** フェーズマネージャー */
export interface IPhaseManager {
  getCurrentPhase(): Phase;
  canTransitionTo(phase: Phase): boolean;
  transitionTo(phase: Phase): void;
  skipPhase(): void;
  resetToQuestAccept(): void;
}

/** ゲームフローマネージャー */
export interface IGameFlowManager {
  startNewGame(): Promise<void>;
  continueGame(slot: number): Promise<void>;
  advanceDay(): void;
  checkGameOver(): GameOverReason | null;
  checkGameClear(): boolean;
  triggerPromotionTest(): void;
  handlePromotionResult(passed: boolean): void;
  saveGame(slot: number): Promise<void>;
}

// =============================================================================
// セーブデータ型
// =============================================================================

/** セーブデータ */
export interface SaveData {
  version: string;
  timestamp: number;
  gameState: GameState;
  statistics: GameStatistics;
  checksum?: string;
}

/** セーブスロット情報 */
export interface SaveSlotInfo {
  slot: number;
  exists: boolean;
  timestamp?: number;
  rank?: RankId;
  day?: number;
}

/** ゲーム統計 */
export interface GameStatistics {
  totalPlayTime: number;
  questsCompleted: number;
  questsFailed: number;
  itemsCrafted: number;
  materialsGathered: number;
  goldEarned: number;
  goldSpent: number;
  cardsCollected: number;
  artifactsCollected: number;
  highestRankAchieved: RankId;
}

// =============================================================================
// エラー型
// =============================================================================

/** ドメインエラー */
export class DomainError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

/** アプリケーションエラー */
export class ApplicationError extends Error {
  constructor(
    public readonly userMessage: string,
    public readonly originalError?: Error
  ) {
    super(userMessage);
    this.name = 'ApplicationError';
  }
}

/** エラーコード定義 */
export const ErrorCodes = {
  // デッキ関連
  DECK_EMPTY: 'DECK_EMPTY',
  CARD_NOT_IN_HAND: 'CARD_NOT_IN_HAND',

  // 採取関連
  INSUFFICIENT_ACTION_POINTS: 'INSUFFICIENT_ACTION_POINTS',
  INVALID_GATHERING_STATE: 'INVALID_GATHERING_STATE',

  // 調合関連
  INSUFFICIENT_MATERIALS: 'INSUFFICIENT_MATERIALS',
  INVALID_RECIPE: 'INVALID_RECIPE',

  // 依頼関連
  QUEST_NOT_FOUND: 'QUEST_NOT_FOUND',
  QUEST_EXPIRED: 'QUEST_EXPIRED',
  INVALID_DELIVERY: 'INVALID_DELIVERY',

  // ショップ関連
  INSUFFICIENT_GOLD: 'INSUFFICIENT_GOLD',
  ITEM_NOT_AVAILABLE: 'ITEM_NOT_AVAILABLE',

  // セーブ関連
  SAVE_FAILED: 'SAVE_FAILED',
  LOAD_FAILED: 'LOAD_FAILED',
  INVALID_SAVE_DATA: 'INVALID_SAVE_DATA',

  // 状態関連
  INVALID_PHASE_TRANSITION: 'INVALID_PHASE_TRANSITION',
  INVALID_STATE: 'INVALID_STATE',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

// =============================================================================
// ユーティリティ型
// =============================================================================

/** 深い読み取り専用型 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/** 部分的に必須な型 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/** Nullableを除外した型 */
export type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};
