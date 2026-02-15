/**
 * alchemy-service.ts - AlchemyService実装
 *
 * TASK-0012: アイテムエンティティ・AlchemyService実装
 *
 * @description
 * 調合サービスの実装。
 * 調合実行、調合可能チェック、品質プレビュー、レシピ取得、レシピ要件チェック機能を提供する。
 *
 * @信頼性レベル 🔵
 * - note.mdに基づいた実装
 * - 品質計算はMaterialServiceのcalculateAverageQualityを使用
 * - 調合完了時にALCHEMY_COMPLETEDイベントを発行
 */

import { ItemInstance } from '@domain/entities/ItemInstance';
import type { MaterialInstance } from '@domain/entities/MaterialInstance';
import type {
  IAlchemyService,
  RecipeCheckResult,
} from '@domain/interfaces/alchemy-service.interface';
import type { IMasterDataRepository } from '@domain/interfaces/master-data-repository.interface';
import type { IMaterialService } from '@domain/interfaces/material-service.interface';
import { compareQuality } from '@domain/value-objects/Quality';
import type { IEventBus } from '@shared/services/event-bus';
import type { CardId, Quality } from '@shared/types';
import { ApplicationError, ErrorCodes } from '@shared/types/errors';
import { GameEventType } from '@shared/types/events';
import { toItemId } from '@shared/types/ids';
import type { IRecipeCardMaster, IRecipeRequiredMaterial } from '@shared/types/master-data';
import { isRecipeCardMaster } from '@shared/types/master-data';
import { generateUniqueId } from '@shared/utils';

/**
 * 拡張されたMasterDataRepositoryインターフェース
 * テストで使用されるgetRecipeCardByIdメソッドを追加
 */
interface IExtendedMasterDataRepository extends IMasterDataRepository {
  getRecipeCardById?(id: CardId): IRecipeCardMaster | undefined;
}

/**
 * 【機能概要】: AlchemyServiceクラス
 * 【実装方針】: 調合実行、調合可能チェック、品質プレビュー、レシピ取得、レシピ要件チェック機能を提供
 * 🔵 信頼性レベル: note.md・設計文書に明記
 */
export class AlchemyService implements IAlchemyService {
  /**
   * 【機能概要】: AlchemyServiceのコンストラクタ
   * 【実装方針】: 依存性注入でMasterDataRepository、MaterialService、EventBusを受け取る
   * 🔵 信頼性レベル: note.md・設計文書に明記
   *
   * @param masterDataRepo - マスターデータリポジトリ
   * @param materialService - 素材サービス
   * @param eventBus - イベントバス
   */
  constructor(
    private readonly masterDataRepo: IExtendedMasterDataRepository,
    private readonly materialService: IMaterialService,
    private readonly eventBus: IEventBus,
  ) {
    // 【実装内容】: 依存性注入のみ
    // 🔵 信頼性レベル: note.md・設計文書に明記
  }

  // =============================================================================
  // レシピ取得ヘルパー
  // =============================================================================

  /**
   * 【機能概要】: レシピカードをIDで取得
   * 【実装方針】: getRecipeCardByIdがあればそれを使用、なければgetCardByIdで取得して型判定
   * 🔵 信頼性レベル: note.md・設計文書に明記
   *
   * @param recipeId - レシピカードID
   * @returns レシピカードマスター（見つからない場合undefined）
   */
  private getRecipeCard(recipeId: CardId): IRecipeCardMaster | undefined {
    // テスト用のgetRecipeCardByIdがあれば使用
    if (this.masterDataRepo.getRecipeCardById) {
      return this.masterDataRepo.getRecipeCardById(recipeId);
    }

    // なければgetCardByIdで取得して型判定
    const card = this.masterDataRepo.getCardById(recipeId);
    if (card && isRecipeCardMaster(card)) {
      return card;
    }
    return undefined;
  }

  /**
   * 【機能概要】: 全レシピカードを取得
   * 【実装方針】: getCardsByTypeでRECIPE種別のカードを取得
   * 🔵 信頼性レベル: note.md・設計文書に明記
   *
   * @returns レシピカードマスターの配列
   */
  private getAllRecipeCards(): IRecipeCardMaster[] {
    const cards = this.masterDataRepo.getCardsByType('RECIPE');
    return cards.filter(isRecipeCardMaster);
  }

  // =============================================================================
  // 調合メソッド
  // =============================================================================

  /**
   * 【機能概要】: 調合を実行
   * 【実装方針】: レシピと素材を検証し、アイテムインスタンスを生成してイベントを発行
   * 【エラー処理】: レシピ不正、素材不足、出力アイテム不正の場合はエラー
   * 🔵 信頼性レベル: note.md・設計文書に明記
   */
  craft(recipeId: CardId, materials: MaterialInstance[]): ItemInstance {
    // 【レシピ取得】: レシピマスターを取得
    // 🔵 信頼性レベル: note.md・設計文書に明記
    const recipe = this.getRecipeCard(recipeId);
    if (!recipe) {
      throw new ApplicationError(ErrorCodes.INVALID_RECIPE, `Recipe not found: ${recipeId}`);
    }

    // 【調合可能チェック】: レシピ要件を満たしているか確認
    // 🔵 信頼性レベル: note.md・設計文書に明記
    const checkResult = this.checkRecipeRequirements(recipeId, materials);
    if (!checkResult.canCraft) {
      throw new ApplicationError(
        ErrorCodes.INSUFFICIENT_MATERIALS,
        'Cannot craft: insufficient materials',
      );
    }

    // 【出力アイテム取得】: レシピの出力アイテムマスターを取得
    // 🔵 信頼性レベル: note.md・設計文書に明記
    const itemMaster = this.masterDataRepo.getItemById(toItemId(recipe.outputItemId));
    if (!itemMaster) {
      throw new ApplicationError(
        ErrorCodes.INVALID_RECIPE,
        `Output item not found: ${recipe.outputItemId}`,
      );
    }

    // 【品質計算】: マッチした素材の平均品質を計算
    // 🔵 信頼性レベル: note.md・設計文書に明記
    const quality = this.materialService.calculateAverageQuality(checkResult.matchedMaterials);

    // 【アイテムインスタンス生成】: 一意なIDで生成
    // 🔵 信頼性レベル: note.md・設計文書に明記
    const instanceId = generateUniqueId('item');
    const itemInstance = new ItemInstance(
      instanceId,
      itemMaster,
      quality,
      checkResult.matchedMaterials,
    );

    // 【イベント発行】: ALCHEMY_COMPLETEDイベントを発行
    // 🔵 信頼性レベル: note.md・設計文書に明記
    this.eventBus.emit(GameEventType.ALCHEMY_COMPLETED, {
      craftedItem: itemInstance,
    });

    return itemInstance;
  }

  // =============================================================================
  // 調合可能チェックメソッド
  // =============================================================================

  /**
   * 【機能概要】: 調合可能かどうかをチェック
   * 【実装方針】: checkRecipeRequirementsの結果を使用
   * 🔵 信頼性レベル: note.md・設計文書に明記
   */
  canCraft(recipeId: CardId, availableMaterials: MaterialInstance[]): boolean {
    // 【チェック実行】: checkRecipeRequirementsを使用
    // 🔵 信頼性レベル: note.md・設計文書に明記
    const result = this.checkRecipeRequirements(recipeId, availableMaterials);
    return result.canCraft;
  }

  // =============================================================================
  // 品質プレビューメソッド
  // =============================================================================

  /**
   * 【機能概要】: 調合前に品質をプレビュー
   * 【実装方針】: マッチした素材の平均品質を計算して返す
   * 【エラー処理】: レシピ不正、素材不足の場合はエラー
   * 🔵 信頼性レベル: note.md・設計文書に明記
   */
  previewQuality(recipeId: CardId, materials: MaterialInstance[]): Quality {
    // 【レシピ取得】: レシピマスターを取得
    // 🔵 信頼性レベル: note.md・設計文書に明記
    const recipe = this.getRecipeCard(recipeId);
    if (!recipe) {
      throw new ApplicationError(ErrorCodes.INVALID_RECIPE, `Recipe not found: ${recipeId}`);
    }

    // 【調合可能チェック】: レシピ要件を満たしているか確認
    // 🔵 信頼性レベル: note.md・設計文書に明記
    const checkResult = this.checkRecipeRequirements(recipeId, materials);
    if (!checkResult.canCraft) {
      throw new ApplicationError(
        ErrorCodes.INSUFFICIENT_MATERIALS,
        'Cannot preview quality: insufficient materials',
      );
    }

    // 【品質計算】: マッチした素材の平均品質を計算
    // 🔵 信頼性レベル: note.md・設計文書に明記
    return this.materialService.calculateAverageQuality(checkResult.matchedMaterials);
  }

  // =============================================================================
  // 利用可能レシピ取得メソッド
  // =============================================================================

  /**
   * 【機能概要】: 利用可能なレシピリストを取得
   * 【実装方針】: 全レシピをフィルタリングして調合可能なものを返す
   * 🔵 信頼性レベル: note.md・設計文書に明記
   */
  getAvailableRecipes(materials: MaterialInstance[]): IRecipeCardMaster[] {
    // 【全レシピ取得】: 全てのレシピカードを取得
    // 🔵 信頼性レベル: note.md・設計文書に明記
    const allRecipes = this.getAllRecipeCards();

    // 【フィルタリング】: 調合可能なレシピのみを抽出
    // 取得済みのレシピを直接使用して要件チェック（再取得を避ける）
    // 🔵 信頼性レベル: note.md・設計文書に明記
    return allRecipes.filter((recipe) => {
      const checkResult = this.checkRecipeRequirementsWithRecipe(recipe, materials);
      return checkResult.canCraft;
    });
  }

  /**
   * 【機能概要】: レシピオブジェクトを直接使用してレシピ要件をチェック
   * 【実装方針】: 再取得せずに渡されたレシピを使用
   * 🔵 信頼性レベル: note.md・設計文書に明記
   *
   * @param recipe - レシピカードマスター
   * @param materials - 利用可能な素材インスタンスリスト
   * @returns レシピ要件チェック結果
   */
  private checkRecipeRequirementsWithRecipe(
    recipe: IRecipeCardMaster,
    materials: MaterialInstance[],
  ): RecipeCheckResult {
    // 【初期化】: 不足素材リストとマッチした素材リストを初期化
    // 🔵 信頼性レベル: note.md・設計文書に明記
    const missingMaterials: IRecipeRequiredMaterial[] = [];
    const matchedMaterials: MaterialInstance[] = [];
    const usedIndices = new Set<number>();

    // 【各必要素材についてチェック】
    // 🔵 信頼性レベル: note.md・設計文書に明記
    for (const required of recipe.requiredMaterials) {
      let foundCount = 0;

      // 【素材検索】: 利用可能な素材から条件に合うものを検索
      for (let i = 0; i < materials.length; i++) {
        // 既に使用済みの素材はスキップ
        if (usedIndices.has(i)) continue;

        const material = materials[i];

        // 【素材IDマッチ】: 素材IDが一致するか確認
        if (material.materialId !== required.materialId) continue;

        // 【最低品質チェック】: 最低品質条件が指定されている場合
        if (required.minQuality) {
          if (compareQuality(material.quality, required.minQuality) < 0) {
            continue;
          }
        }

        // 【マッチ】: 条件を満たす素材が見つかった
        matchedMaterials.push(material);
        usedIndices.add(i);
        foundCount++;

        // 【数量チェック】: 必要数量に達したら次の必要素材へ
        if (foundCount >= required.quantity) break;
      }

      // 【不足チェック】: 必要数量に満たない場合
      if (foundCount < required.quantity) {
        missingMaterials.push({
          ...required,
          quantity: required.quantity - foundCount,
        });
      }
    }

    // 【結果を返す】
    // 🔵 信頼性レベル: note.md・設計文書に明記
    return {
      canCraft: missingMaterials.length === 0,
      missingMaterials,
      matchedMaterials,
    };
  }

  // =============================================================================
  // レシピ要件チェックメソッド
  // =============================================================================

  /**
   * 【機能概要】: レシピ要件をチェック
   * 【実装方針】: 必要素材と利用可能素材を比較し、過不足を確認
   * 【素材マッチング】: 必要素材リストの順番で素材をマッチング、同一素材を複数回使用しない
   * 🔵 信頼性レベル: note.md・設計文書に明記
   */
  checkRecipeRequirements(recipeId: CardId, materials: MaterialInstance[]): RecipeCheckResult {
    // 【レシピ取得】: レシピマスターを取得
    // 🔵 信頼性レベル: note.md・設計文書に明記
    const recipe = this.getRecipeCard(recipeId);
    if (!recipe) {
      // 存在しないレシピの場合は調合不可
      return {
        canCraft: false,
        missingMaterials: [],
        matchedMaterials: [],
      };
    }

    // 【内部実装に委譲】: レシピオブジェクトが取得できたら共通処理を呼び出し
    // 🔵 信頼性レベル: note.md・設計文書に明記
    return this.checkRecipeRequirementsWithRecipe(recipe, materials);
  }
}
