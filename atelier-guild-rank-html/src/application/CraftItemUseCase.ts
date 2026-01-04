/**
 * 調合実行ユースケース
 * TASK-0108: 調合実行ユースケース
 *
 * レシピカードを使用した調合処理を担当するユースケース
 * 素材消費、品質計算、アイテム生成を行う
 */

import { StateManager } from '@application/StateManager';
import { EventBus, GameEventType, CraftedItemInfo } from '@domain/events/GameEvents';
import { RecipeCard, EnhancementCard } from '@domain/card/CardEntity';
import { CraftedItem, createCraftedItem } from '@domain/item/ItemEntity';
import { CardType, Quality, EnhancementTarget, EffectType } from '@domain/common/types';
import { IUsedMaterial, IEffectValue, IAttributeValue } from '@domain/item/Item';
import { InventoryService } from '@domain/services/InventoryService';

/**
 * 素材選択情報
 */
export interface MaterialSelection {
  materialId: string;
  quality: Quality;
  quantity: number;
}

/**
 * 調合リクエスト
 */
export interface CraftItemRequest {
  /** レシピカードID */
  recipeCardId: string;
  /** 使用する素材の選択 */
  materialSelections: MaterialSelection[];
  /** 使用する強化カードID（オプション） */
  enhancementCardIds?: string[];
}

/**
 * 調合結果
 */
export interface CraftItemResult {
  /** 成功したかどうか */
  success: boolean;
  /** 作成されたアイテム */
  craftedItem?: CraftedItem;
  /** エラータイプ */
  error?: 'RECIPE_NOT_FOUND' | 'INSUFFICIENT_MATERIALS' | 'INSUFFICIENT_ACTION_POINTS' | 'INVALID_ENHANCEMENT';
}

/**
 * 調合実行ユースケースインターフェース
 */
export interface CraftItemUseCase {
  /**
   * 調合を実行する
   * @param request 調合リクエスト
   * @returns 調合結果
   */
  execute(request: CraftItemRequest): Promise<CraftItemResult>;
}

/**
 * 品質の数値変換マップ
 */
const QualityValue: Record<Quality, number> = {
  [Quality.D]: 1,
  [Quality.C]: 2,
  [Quality.B]: 3,
  [Quality.A]: 4,
  [Quality.S]: 5,
};

/**
 * 数値から品質への変換
 */
function valueToQuality(value: number): Quality {
  if (value >= 5) return Quality.S;
  if (value >= 4) return Quality.A;
  if (value >= 3) return Quality.B;
  if (value >= 2) return Quality.C;
  return Quality.D;
}

/**
 * ユニークIDを生成する
 */
function generateUniqueId(): string {
  return `crafted_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 調合実行ユースケースを生成する
 * @param stateManager ステートマネージャー
 * @param eventBus イベントバス
 * @returns 調合実行ユースケース
 */
export function createCraftItemUseCase(
  stateManager: StateManager,
  eventBus: EventBus
): CraftItemUseCase {
  const inventoryService = new InventoryService();

  /**
   * デッキからレシピカードを取得する
   */
  const getRecipeCard = (recipeCardId: string): RecipeCard | undefined => {
    const deckState = stateManager.getDeckState();
    const card = deckState.cards.find(
      (c) => c.id === recipeCardId && c.type === CardType.RECIPE
    );
    return card as RecipeCard | undefined;
  };

  /**
   * デッキから強化カードを取得する
   */
  const getEnhancementCards = (enhancementCardIds: string[]): EnhancementCard[] => {
    const deckState = stateManager.getDeckState();
    const cards: EnhancementCard[] = [];

    for (const cardId of enhancementCardIds) {
      const card = deckState.cards.find(
        (c) => c.id === cardId && c.type === CardType.ENHANCEMENT
      );
      if (card) {
        cards.push(card as EnhancementCard);
      }
    }

    return cards;
  };

  /**
   * 素材が十分にあるかチェックする
   */
  const checkMaterialsAvailable = (selections: MaterialSelection[]): boolean => {
    const inventory = stateManager.getInventoryState();

    for (const selection of selections) {
      const count = inventoryService.getMaterialCount(
        inventory,
        selection.materialId,
        selection.quality
      );
      if (count < selection.quantity) {
        return false;
      }
    }

    return true;
  };

  /**
   * 素材を消費する
   */
  const consumeMaterials = (selections: MaterialSelection[]): void => {
    let inventory = stateManager.getInventoryState();

    for (const selection of selections) {
      const result = inventoryService.consumeMaterial(
        inventory,
        selection.materialId,
        selection.quality,
        selection.quantity
      );
      if (result.success) {
        inventory = result.value;
      }
    }

    stateManager.updateInventoryState(inventory);
  };

  /**
   * 品質を計算する
   */
  const calculateQuality = (
    selections: MaterialSelection[],
    enhancementCards: EnhancementCard[]
  ): Quality => {
    // 素材の平均品質を計算
    let totalQualityValue = 0;
    let totalQuantity = 0;

    for (const selection of selections) {
      const qualityValue = QualityValue[selection.quality];
      totalQualityValue += qualityValue * selection.quantity;
      totalQuantity += selection.quantity;
    }

    let averageQuality = totalQuantity > 0 ? totalQualityValue / totalQuantity : 2;

    // 強化カードの品質ブースト効果を適用
    for (const enhCard of enhancementCards) {
      if (enhCard.canApplyTo(EnhancementTarget.CRAFT)) {
        const effect = enhCard.getEffect();
        if (effect.type === EffectType.QUALITY_BOOST) {
          // 品質ブーストは0.1単位で上昇
          averageQuality += effect.value / 100;
        }
      }
    }

    return valueToQuality(averageQuality);
  };

  /**
   * 使用素材情報を作成する
   */
  const createUsedMaterials = (selections: MaterialSelection[]): IUsedMaterial[] => {
    return selections.map((s) => ({
      materialId: s.materialId,
      quantity: s.quantity,
      quality: s.quality,
      isRare: false, // TODO: 素材マスターデータから取得
    }));
  };

  /**
   * アイテムを生成する
   */
  const createItem = (
    recipeCard: RecipeCard,
    quality: Quality,
    usedMaterials: IUsedMaterial[]
  ): CraftedItem => {
    // 効果値（簡易実装：品質に応じた効果値を設定）
    const effectValues: IEffectValue[] = [];

    // 属性値（簡易実装：空配列）
    const attributeValues: IAttributeValue[] = [];

    return createCraftedItem({
      id: generateUniqueId(),
      itemId: recipeCard.getOutputItemId(),
      quality,
      attributeValues,
      effectValues,
      usedMaterials,
    });
  };

  /**
   * アイテムをインベントリに追加する
   */
  const addItemToInventory = (item: CraftedItem): void => {
    const inventory = stateManager.getInventoryState();
    const result = inventoryService.addItem(inventory, item);
    if (result.success) {
      stateManager.updateInventoryState(result.value);
    }
  };

  return {
    async execute(request: CraftItemRequest): Promise<CraftItemResult> {
      const playerState = stateManager.getPlayerState();

      // レシピカードを取得
      const recipeCard = getRecipeCard(request.recipeCardId);
      if (!recipeCard) {
        return {
          success: false,
          error: 'RECIPE_NOT_FOUND',
        };
      }

      // 行動ポイントチェック
      if (playerState.actionPoints < recipeCard.getCost()) {
        return {
          success: false,
          error: 'INSUFFICIENT_ACTION_POINTS',
        };
      }

      // 素材チェック
      if (!checkMaterialsAvailable(request.materialSelections)) {
        return {
          success: false,
          error: 'INSUFFICIENT_MATERIALS',
        };
      }

      // 強化カードを取得
      const enhancementCards = request.enhancementCardIds
        ? getEnhancementCards(request.enhancementCardIds)
        : [];

      // 素材を消費
      consumeMaterials(request.materialSelections);

      // 品質を計算
      const quality = calculateQuality(request.materialSelections, enhancementCards);

      // 使用素材情報を作成
      const usedMaterials = createUsedMaterials(request.materialSelections);

      // アイテムを生成
      const craftedItem = createItem(recipeCard, quality, usedMaterials);

      // インベントリに追加
      addItemToInventory(craftedItem);

      // 行動ポイントを消費
      stateManager.updatePlayerState({
        ...playerState,
        actionPoints: playerState.actionPoints - recipeCard.getCost(),
      });

      // イベントを発行
      const itemInfo: CraftedItemInfo = {
        itemId: craftedItem.itemId,
        name: recipeCard.name,
        quality: craftedItem.quality,
        category: recipeCard.getCategory(),
      };
      eventBus.publish({
        type: GameEventType.ITEM_CRAFTED,
        payload: {
          item: itemInfo,
        },
      });

      return {
        success: true,
        craftedItem,
      };
    },
  };
}
