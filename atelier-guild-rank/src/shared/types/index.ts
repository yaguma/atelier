/**
 * Shared Types
 * 型定義の公開エクスポート
 */

// =============================================================================
// カード型
// =============================================================================
export type {
  Card,
  ICard,
  ICardEffect,
  IEnhancementCard,
  IGatheringCard,
  IGatheringMaterial,
  IRecipeCard,
  IRequiredMaterial,
} from './cards';
export { isEnhancementCard, isGatheringCard, isRecipeCard } from './cards';
// =============================================================================
// 基本型・列挙型
// =============================================================================
export {
  Attribute,
  CardType,
  ClientType,
  EffectType,
  EnhancementTarget,
  GamePhase,
  GuildRank,
  ItemCategory,
  ItemEffectType,
  Quality,
  QuestType,
  Rarity,
  SpecialRuleType,
  VALID_GAME_PHASES,
} from './common';
// =============================================================================
// 定数
// =============================================================================
export { InitialParameters, QualityMultiplier, QualityValue, RankOrder } from './constants';
export type { ErrorCode } from './errors';
// =============================================================================
// エラー型
// =============================================================================
export { ApplicationError, DomainError, ErrorCodes } from './errors';
export type {
  GameEndStats,
  GameOverReason,
  IAlchemyCompletedEvent,
  IContributionAddedEvent,
  IGameClearedEvent,
  IGameEvent,
  IGameLoadedEvent,
  IGameOverEvent,
  IGameSavedEvent,
  IGatheringCompletedEvent,
  IPhaseChangedEvent,
  IQuestCompletedEvent,
  IRankDamagedEvent,
  IRankUpEvent,
} from './events';
// =============================================================================
// イベント型
// =============================================================================
export { GameEventType } from './events';
// =============================================================================
// ゲーム状態型
// =============================================================================
export type {
  IBoardQuest,
  IDeckState,
  IGameState,
  IInventoryState,
  IQuestBoardState,
  IQuestState,
  IVisitorQuest,
} from './game-state';
// =============================================================================
// ID型
// =============================================================================
export type {
  ArtifactId,
  CardId,
  ClientId,
  ItemId,
  MaterialId,
  QuestId,
  RecipeId,
} from './ids';
export {
  toArtifactId,
  toCardId,
  toClientId,
  toItemId,
  toMaterialId,
  toQuestId,
  toRecipeId,
} from './ids';
// =============================================================================
// マスターデータ型
// =============================================================================
export type {
  CardMaster,
  ClientMaster,
  IArtifactEffect,
  IArtifactMaster,
  IEnhancementCardMaster,
  IEnhancementEffect,
  IGatheringCardMaster,
  IGuildRankMaster,
  IPromotionRequirement,
  IPromotionTest,
  IRecipeCardMaster,
  IRecipeRequiredMaterial,
  ISpecialRule,
  ItemMaster,
  MaterialMaster,
  QuestMaster,
} from './master-data';
export {
  isEnhancementCardMaster,
  isGatheringCardMaster,
  isRecipeCardMaster,
} from './master-data';
// =============================================================================
// 素材・アイテム型
// =============================================================================
export type {
  IAttributeValue,
  ICraftedItem,
  IEffectValue,
  IItem,
  IItemEffect,
  IMaterial,
  IMaterialInstance,
  IUsedMaterial,
} from './materials';
// =============================================================================
// フェーズ切り替え型
// =============================================================================
export type { IPhaseSwitchRequest, IPhaseSwitchResult } from './phase-switch';
export { PhaseSwitchFailureReason } from './phase-switch';
// =============================================================================
// 依頼型
// =============================================================================
export type {
  IActiveQuest,
  IClient,
  IQuest,
  IQuestCondition,
  QuestDifficulty,
} from './quests';
// =============================================================================
// セーブデータ型
// =============================================================================
export type { ISaveData } from './save-data';
// =============================================================================
// ユーティリティ型
// =============================================================================
export type { DeepReadonly, NonNullableFields, RequiredFields } from './utils';
