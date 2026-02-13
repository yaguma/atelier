/**
 * check-recipe-requirements.ts - レシピ要件チェック純粋関数
 *
 * TASK-0077: features/alchemy/services作成
 *
 * レシピの必要素材と利用可能な素材を比較し、
 * 調合可否・不足素材・マッチした素材を返す純粋関数。
 */

import type { MaterialInstance } from '@domain/entities/MaterialInstance';
import { compareQuality } from '@domain/value-objects/Quality';
import type { IRecipeRequiredMaterial } from '@shared/types/master-data';
import type { RecipeCheckResult } from '../types';

/**
 * レシピの必要素材と利用可能素材を照合し、調合可否を判定する
 *
 * 各必要素材について、利用可能な素材から条件（素材ID一致、最低品質）を
 * 満たすものを検索する。同一素材を複数回使用することはできない。
 *
 * @param requiredMaterials - レシピの必要素材リスト
 * @param availableMaterials - 利用可能な素材インスタンスリスト
 * @returns レシピ要件チェック結果
 */
export function checkRecipeRequirements(
  requiredMaterials: readonly IRecipeRequiredMaterial[],
  availableMaterials: readonly MaterialInstance[],
): RecipeCheckResult {
  const missingMaterials: IRecipeRequiredMaterial[] = [];
  const matchedMaterials: MaterialInstance[] = [];
  const usedIndices = new Set<number>();

  for (const required of requiredMaterials) {
    let foundCount = 0;

    for (let i = 0; i < availableMaterials.length; i++) {
      if (usedIndices.has(i)) continue;

      const material = availableMaterials[i];

      // 素材IDマッチ
      if (material.materialId !== required.materialId) continue;

      // 最低品質チェック
      if (required.minQuality) {
        if (compareQuality(material.quality, required.minQuality) < 0) {
          continue;
        }
      }

      // マッチ成立
      matchedMaterials.push(material);
      usedIndices.add(i);
      foundCount++;

      if (foundCount >= required.quantity) break;
    }

    // 不足分を記録
    if (foundCount < required.quantity) {
      missingMaterials.push({
        ...required,
        quantity: required.quantity - foundCount,
      });
    }
  }

  return {
    canCraft: missingMaterials.length === 0,
    missingMaterials,
    matchedMaterials,
  };
}
