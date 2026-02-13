/**
 * craft.ts - 調合処理純粋関数
 *
 * TASK-0077: features/alchemy/services作成
 *
 * 調合処理のメインロジックを純粋関数として実装。
 * レシピ検証、品質計算、アイテム生成を行う。
 * ID生成は引数として注入することで副作用を排除。
 */

import type { MaterialInstance } from '@domain/entities/MaterialInstance';
import type { Quality } from '@shared/types';
import type { IRecipeCardMaster, IRecipeRequiredMaterial } from '@shared/types/master-data';
import type { RecipeCheckResult } from '../types';
import { calculateQuality } from './calculate-quality';
import { checkRecipeRequirements } from './check-recipe-requirements';

/**
 * 調合結果
 */
export interface CraftResult {
  /** 調合成功かどうか */
  success: boolean;
  /** 成功時: 調合されたアイテム情報 */
  item?: CraftedItemData;
  /** 失敗時: エラーメッセージ */
  error?: string;
  /** マッチした素材リスト */
  matchedMaterials: MaterialInstance[];
}

/**
 * 調合されたアイテムデータ（純粋な値）
 */
export interface CraftedItemData {
  /** アイテムID */
  id: string;
  /** レシピカードID */
  recipeId: string;
  /** 出力アイテムID */
  outputItemId: string;
  /** 品質 */
  quality: Quality;
  /** 使用素材 */
  usedMaterials: MaterialInstance[];
}

/**
 * 調合を実行する純粋関数
 *
 * レシピと素材を検証し、品質を計算してアイテムデータを生成する。
 * ID生成関数を引数として受け取ることで副作用を排除。
 *
 * @param recipe - レシピカードマスター
 * @param materials - 利用可能な素材リスト
 * @param generateId - ID生成関数（副作用の注入）
 * @returns 調合結果
 */
export function craft(
  recipe: IRecipeCardMaster,
  materials: readonly MaterialInstance[],
  generateId: () => string,
): CraftResult {
  // レシピ要件チェック
  const checkResult: RecipeCheckResult = checkRecipeRequirements(
    recipe.requiredMaterials as readonly IRecipeRequiredMaterial[],
    materials,
  );

  if (!checkResult.canCraft) {
    return {
      success: false,
      error: 'Cannot craft: insufficient materials',
      matchedMaterials: [],
    };
  }

  // マッチした素材の品質から結果品質を算出
  const qualities = checkResult.matchedMaterials.map((m) => m.quality);
  const quality = calculateQuality(qualities);

  // アイテムデータ生成
  const item: CraftedItemData = {
    id: generateId(),
    recipeId: recipe.id,
    outputItemId: recipe.outputItemId,
    quality,
    usedMaterials: checkResult.matchedMaterials,
  };

  return {
    success: true,
    item,
    matchedMaterials: checkResult.matchedMaterials,
  };
}
