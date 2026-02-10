/**
 * Application Services
 * アプリケーションサービスの公開エクスポート
 */

export type { IInventoryService } from '@domain/interfaces/inventory-service.interface';
export type { IQuestService } from '@domain/interfaces/quest-service.interface';
export type { IRankService } from '@domain/interfaces/rank-service.interface';
// @deprecated: @shared/services から直接インポートしてください (TASK-0066)
export type { IStateManager } from '@shared/services/state-manager';
export {
  INITIAL_GAME_STATE,
  MAX_ACTION_POINTS,
  StateManager,
  VALID_PHASE_TRANSITIONS,
} from '@shared/services/state-manager';
export { AlchemyService } from './alchemy-service';
export { ArtifactService } from './artifact-service';
export { DeckService } from './deck-service';
export { GameFlowManager } from './game-flow-manager';
export type { GameEndCondition, IGameFlowManager } from './game-flow-manager.interface';
export { GatheringService } from './gathering-service';
export { InventoryService } from './inventory-service';
export { MaterialService } from './material-service';
export { QuestService } from './quest-service';
export { RankService } from './rank-service';
export type { ISaveLoadService } from './save-load-service';
export { SaveLoadService } from './save-load-service';
export { ShopService } from './shop-service';
