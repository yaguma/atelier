/**
 * Alchemy Feature - 調合機能公開API
 *
 * TASK-0079: features/alchemy/index.ts公開API作成
 *
 * @description
 * 調合機能の公開APIを定義。
 * types、services、componentsを一元的にエクスポートする。
 * 外部からのアクセスはこのindex.ts経由で行うこと。
 */

// =============================================================================
// Types
// =============================================================================

// 調合サービス関連型
// 調合済みアイテム関連型
// レシピ関連型
export type {
  IAlchemyService,
  IAttributeValue,
  ICraftedItem,
  IEffectValue,
  IRecipeCardMaster,
  IRecipeRequiredMaterial,
  IUsedMaterial,
  RecipeCheckResult,
} from './types';
// 品質関連定数
export { QUALITY_THRESHOLDS } from './types';

// =============================================================================
// Services（純粋関数）
// =============================================================================

export type { CraftedItemData, CraftResult } from './services';
export { calculateQuality, checkRecipeRequirements, craft } from './services';

// =============================================================================
// Components
// =============================================================================

export { AlchemyPhaseUI, RecipeListUI } from './components';
