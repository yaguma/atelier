/**
 * alchemy-service.ts - 調合サービス関連の型定義
 *
 * TASK-0076: features/alchemy/types作成
 *
 * domain/interfaces/alchemy-service.interface.tsから移行。
 * 調合サービスのインターフェースと関連型を定義する。
 */

import type { ItemInstance } from '@domain/entities/ItemInstance';
import type { MaterialInstance } from '@domain/entities/MaterialInstance';
import type { CardId, Quality } from '@shared/types';
import type { IRecipeCardMaster, IRecipeRequiredMaterial } from '@shared/types/master-data';

/**
 * レシピ要件チェック結果
 * 調合可否、不足素材、マッチした素材を保持
 */
export interface RecipeCheckResult {
  /** 調合可能かどうか */
  canCraft: boolean;
  /** 不足している素材リスト */
  missingMaterials: IRecipeRequiredMaterial[];
  /** マッチした素材インスタンスリスト */
  matchedMaterials: MaterialInstance[];
}

/**
 * 調合サービスインターフェース
 * 調合実行、調合可能チェック、品質プレビュー、レシピ取得、レシピ要件チェックを提供
 */
export interface IAlchemyService {
  /** 調合を実行 */
  craft(recipeId: CardId, materials: MaterialInstance[]): ItemInstance;

  /** 調合可能かどうかをチェック */
  canCraft(recipeId: CardId, availableMaterials: MaterialInstance[]): boolean;

  /** 調合前に品質をプレビュー */
  previewQuality(recipeId: CardId, materials: MaterialInstance[]): Quality;

  /** 全レシピリストを取得 */
  getAllRecipes(): IRecipeCardMaster[];

  /** 利用可能なレシピリストを取得 */
  getAvailableRecipes(materials: MaterialInstance[]): IRecipeCardMaster[];

  /** レシピ要件をチェック */
  checkRecipeRequirements(recipeId: CardId, materials: MaterialInstance[]): RecipeCheckResult;
}
