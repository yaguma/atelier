/**
 * Domain Interfaces
 * リポジトリインターフェースの公開エクスポート
 */

export type {
  IAlchemyService,
  RecipeCheckResult,
} from './alchemy-service.interface';
export type { IDeckService } from './deck-service.interface';
export type {
  DraftSession,
  GatheringCostResult,
  GatheringResult,
  IGatheringService,
  MaterialOption,
} from './gathering-service.interface';
export type { IMasterDataRepository } from './master-data-repository.interface';
export type { IMaterialService } from './material-service.interface';
export type {
  DailyQuestResult,
  DeliveryResult,
  FailedQuest,
  IQuestService,
  RewardCardCandidate,
} from './quest-service.interface';
export type {
  IRankService,
  PromotionResult,
  PromotionTest,
  PromotionTestRequirement,
} from './rank-service.interface';
export type { ISaveDataRepository } from './save-data-repository.interface';
