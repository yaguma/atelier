/**
 * recipe.ts - レシピ関連の型定義
 *
 * TASK-0076: features/alchemy/types作成
 *
 * shared/typesのレシピ型を再エクスポートし、
 * features/alchemy経由でアクセスできるようにする。
 */

export type { IRecipeCardMaster, IRecipeRequiredMaterial } from '@shared/types/master-data';
