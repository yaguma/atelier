/**
 * alchemy-service.interface.ts - 調合サービスインターフェース
 *
 * TASK-0012: アイテムエンティティ・AlchemyService実装
 *
 * @description
 * 調合機能を提供するサービスのインターフェース。
 * 調合実行、調合可能チェック、品質プレビュー、レシピ取得などの機能を定義。
 *
 * @信頼性レベル 🔵
 * - note.mdに基づいた定義
 */

import type { ItemInstance } from '@domain/entities/ItemInstance';
import type { MaterialInstance } from '@domain/entities/MaterialInstance';
import type { CardId, Quality } from '@shared/types';
import type { IRecipeCardMaster, IRecipeRequiredMaterial } from '@shared/types/master-data';

/**
 * 【機能概要】: レシピ要件チェック結果インターフェース
 * 【実装方針】: 調合可否、不足素材、マッチした素材を保持
 * 🔵 信頼性レベル: note.md・設計文書に明記
 */
export interface RecipeCheckResult {
  /** 調合可能かどうか */
  canCraft: boolean;
  /** 不足している素材リスト（不足数量で調整済み） */
  missingMaterials: IRecipeRequiredMaterial[];
  /** マッチした素材インスタンスリスト */
  matchedMaterials: MaterialInstance[];
}

/**
 * 【機能概要】: 調合サービスインターフェース
 * 【実装方針】: 調合実行、調合可能チェック、品質プレビュー、レシピ取得、レシピ要件チェックを定義
 * 🔵 信頼性レベル: note.md・設計文書に明記
 */
export interface IAlchemyService {
  /**
   * 【機能概要】: 調合を実行
   * 【実装方針】: レシピと素材からアイテムインスタンスを生成
   * 🔵 信頼性レベル: note.md・設計文書に明記
   *
   * @param recipeId - レシピカードID
   * @param materials - 使用する素材インスタンスリスト
   * @returns 生成されたアイテムインスタンス
   * @throws ApplicationError(INVALID_RECIPE) - 存在しないレシピID
   * @throws ApplicationError(INSUFFICIENT_MATERIALS) - 素材不足
   */
  craft(recipeId: CardId, materials: MaterialInstance[]): ItemInstance;

  /**
   * 【機能概要】: 調合可能かどうかをチェック
   * 【実装方針】: レシピ要件と素材を比較して可否を返す
   * 🔵 信頼性レベル: note.md・設計文書に明記
   *
   * @param recipeId - レシピカードID
   * @param availableMaterials - 利用可能な素材インスタンスリスト
   * @returns 調合可能ならtrue
   */
  canCraft(recipeId: CardId, availableMaterials: MaterialInstance[]): boolean;

  /**
   * 【機能概要】: 調合前に品質をプレビュー
   * 【実装方針】: 素材の平均品質を計算して返す
   * 🔵 信頼性レベル: note.md・設計文書に明記
   *
   * @param recipeId - レシピカードID
   * @param materials - 使用する素材インスタンスリスト
   * @returns プレビュー品質
   * @throws ApplicationError(INVALID_RECIPE) - 存在しないレシピID
   * @throws ApplicationError(INSUFFICIENT_MATERIALS) - 素材不足
   */
  previewQuality(recipeId: CardId, materials: MaterialInstance[]): Quality;

  /**
   * 【機能概要】: 全レシピリストを取得
   * 【実装方針】: フィルタリングなしで全レシピカードを返す
   * 🔵 信頼性レベル: note.md・設計文書に明記
   *
   * @returns 全レシピマスターリスト
   */
  getAllRecipes(): IRecipeCardMaster[];

  /**
   * 【機能概要】: 利用可能なレシピリストを取得
   * 【実装方針】: 与えられた素材で調合可能なレシピをフィルタリング
   * 🔵 信頼性レベル: note.md・設計文書に明記
   *
   * @param materials - 利用可能な素材インスタンスリスト
   * @returns 調合可能なレシピマスターリスト
   */
  getAvailableRecipes(materials: MaterialInstance[]): IRecipeCardMaster[];

  /**
   * 【機能概要】: レシピ要件をチェック
   * 【実装方針】: 必要素材と利用可能素材を比較し、過不足を確認
   * 🔵 信頼性レベル: note.md・設計文書に明記
   *
   * @param recipeId - レシピカードID
   * @param materials - 利用可能な素材インスタンスリスト
   * @returns レシピ要件チェック結果
   */
  checkRecipeRequirements(recipeId: CardId, materials: MaterialInstance[]): RecipeCheckResult;
}
