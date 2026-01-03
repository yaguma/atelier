/**
 * 調合ドメインサービス
 * TASK-0093: 調合ドメインサービス
 *
 * 調合フェーズのビジネスロジックを管理する
 */

import {
  RecipeCard,
  EnhancementCard,
} from '@domain/card/CardEntity';
import {
  MaterialInstance,
} from '@domain/material/MaterialEntity';
import {
  CraftedItem,
  createCraftedItem,
} from '@domain/item/ItemEntity';
import {
  type Inventory,
  InventoryService,
} from '@domain/services/InventoryService';
import { Quality, EffectType, EnhancementTarget } from '@domain/common/types';

/**
 * 操作結果型
 */
export type Result<T> =
  | { success: true; value: T }
  | { success: false; error: string };

/**
 * 不足素材情報
 */
export interface MissingMaterial {
  /** 素材ID */
  materialId: string;
  /** 必要数 */
  required: number;
  /** 所持数 */
  available: number;
  /** 不足数 */
  shortage: number;
}

/**
 * 調合可否判定結果
 */
export interface CanCraftResult {
  /** 調合可能かどうか */
  canCraft: boolean;
  /** 不足素材リスト */
  missingMaterials: MissingMaterial[];
}

/**
 * 調合結果
 */
export interface CraftResult {
  /** 生成されたアイテム */
  craftedItem: CraftedItem;
  /** 更新後のインベントリ */
  inventory: Inventory;
}

/**
 * 強化付き調合結果
 */
export interface CraftWithEnhancementsResult extends CraftResult {
  /** 適用された効果タイプリスト */
  appliedEffects: EffectType[];
}

/**
 * 品質の数値マップ（高いほど高品質）
 */
const QualityValue: Record<Quality, number> = {
  [Quality.E]: 10,
  [Quality.D]: 30,
  [Quality.C]: 50,
  [Quality.B]: 70,
  [Quality.A]: 90,
  [Quality.S]: 100,
};

/**
 * 数値から品質への変換
 */
function valueToQuality(value: number): Quality {
  if (value >= 95) return Quality.S;
  if (value >= 80) return Quality.A;
  if (value >= 60) return Quality.B;
  if (value >= 40) return Quality.C;
  if (value >= 20) return Quality.D;
  return Quality.E;
}

/**
 * 品質の比較（q1がq2以上かどうか）
 */
function isQualityAtLeast(q1: Quality, q2: Quality): boolean {
  return QualityValue[q1] >= QualityValue[q2];
}

/**
 * 調合ドメインサービス
 * 調合に関するビジネスロジックを提供する
 */
export class AlchemyService {
  private inventoryService: InventoryService;

  constructor() {
    this.inventoryService = new InventoryService();
  }

  /**
   * 調合可否を判定する
   * @param inventory インベントリ
   * @param recipe レシピカード
   * @returns 調合可否判定結果
   */
  canCraft(inventory: Inventory, recipe: RecipeCard): CanCraftResult {
    const missingMaterials: MissingMaterial[] = [];
    const requiredMaterials = recipe.getRequiredMaterials();

    for (const required of requiredMaterials) {
      const minQuality = required.minQuality;

      // 指定品質以上の素材をカウント
      let availableCount = 0;
      if (minQuality) {
        // 品質指定がある場合、その品質以上の素材のみカウント
        for (const material of inventory.materials) {
          if (
            material.materialId === required.materialId &&
            isQualityAtLeast(material.quality, minQuality)
          ) {
            availableCount += material.quantity;
          }
        }
      } else {
        // 品質指定がない場合、すべての素材をカウント
        availableCount = this.inventoryService.getMaterialCount(
          inventory,
          required.materialId
        );
      }

      if (availableCount < required.quantity) {
        missingMaterials.push({
          materialId: required.materialId,
          required: required.quantity,
          available: availableCount,
          shortage: required.quantity - availableCount,
        });
      }
    }

    return {
      canCraft: missingMaterials.length === 0,
      missingMaterials,
    };
  }

  /**
   * 調合を実行する
   * @param inventory インベントリ
   * @param recipe レシピカード
   * @returns 調合結果
   */
  craft(inventory: Inventory, recipe: RecipeCard): Result<CraftResult> {
    // 調合可否チェック
    const canCraftResult = this.canCraft(inventory, recipe);
    if (!canCraftResult.canCraft) {
      return { success: false, error: '素材が不足しています' };
    }

    // 素材を消費
    const { newInventory, usedMaterials } = this.consumeMaterials(
      inventory,
      recipe
    );

    // 品質を計算
    const baseQuality = this.calculateBaseQuality(usedMaterials);
    const quality = valueToQuality(baseQuality);

    // アイテムを生成
    const craftedItem = createCraftedItem({
      itemId: recipe.getOutputItemId(),
      quality,
      attributeValues: [],
      effectValues: [],
      usedMaterials: usedMaterials.map((m) => ({
        materialId: m.materialId,
        quality: m.quality,
        quantity: m.quantity,
        isRare: false,
      })),
    });

    return {
      success: true,
      value: {
        craftedItem,
        inventory: newInventory,
      },
    };
  }

  /**
   * 強化カード付きで調合を実行する
   * @param inventory インベントリ
   * @param recipe レシピカード
   * @param enhancements 強化カードリスト
   * @returns 調合結果
   */
  craftWithEnhancements(
    inventory: Inventory,
    recipe: RecipeCard,
    enhancements: EnhancementCard[]
  ): Result<CraftWithEnhancementsResult> {
    // 調合可否チェック
    const canCraftResult = this.canCraft(inventory, recipe);
    if (!canCraftResult.canCraft) {
      return { success: false, error: '素材が不足しています' };
    }

    // 調合対象の強化カードをフィルタリング
    const applicableEnhancements = enhancements.filter(
      (e) => e.getTargetAction() === EnhancementTarget.ALCHEMY
    );

    // 適用された効果を記録
    const appliedEffects: EffectType[] = [];

    // 素材節約効果を確認
    let materialSaved = false;
    const materialSaveEnhancement = applicableEnhancements.find(
      (e) => e.getEffectType() === EffectType.MATERIAL_SAVE
    );
    if (materialSaveEnhancement) {
      const saveChance = materialSaveEnhancement.getEffectValue() / 100;
      if (Math.random() < saveChance) {
        materialSaved = true;
      }
      appliedEffects.push(EffectType.MATERIAL_SAVE);
    }

    // 素材を消費（節約効果がある場合は消費しない）
    let newInventory: Inventory;
    let usedMaterials: MaterialInstance[];

    if (materialSaved) {
      // 素材を消費しない
      newInventory = { ...inventory, materials: [...inventory.materials] };
      // 使用する素材の情報は取得（品質計算用）
      usedMaterials = this.getUsedMaterials(inventory, recipe);
    } else {
      const consumeResult = this.consumeMaterials(inventory, recipe);
      newInventory = consumeResult.newInventory;
      usedMaterials = consumeResult.usedMaterials;
    }

    // 品質向上効果を計算
    let qualityBonus = 0;
    const qualityUpEnhancement = applicableEnhancements.find(
      (e) => e.getEffectType() === EffectType.QUALITY_UP
    );
    if (qualityUpEnhancement) {
      qualityBonus = qualityUpEnhancement.getEffectValue();
      appliedEffects.push(EffectType.QUALITY_UP);
    }

    // 品質を計算
    const baseQuality = this.calculateBaseQuality(usedMaterials);
    const adjustedQuality = Math.min(100, baseQuality + qualityBonus);
    const quality = valueToQuality(adjustedQuality);

    // アイテムを生成
    const craftedItem = createCraftedItem({
      itemId: recipe.getOutputItemId(),
      quality,
      attributeValues: [],
      effectValues: [],
      usedMaterials: usedMaterials.map((m) => ({
        materialId: m.materialId,
        quality: m.quality,
        quantity: m.quantity,
        isRare: false,
      })),
    });

    return {
      success: true,
      value: {
        craftedItem,
        inventory: newInventory,
        appliedEffects,
      },
    };
  }

  /**
   * 基本品質を計算する
   * @param materials 使用素材リスト
   * @returns 基本品質値（0-100）
   */
  calculateBaseQuality(materials: MaterialInstance[]): number {
    if (materials.length === 0) {
      return QualityValue[Quality.C]; // デフォルトC品質
    }

    let totalValue = 0;
    let totalWeight = 0;

    for (const material of materials) {
      const value = QualityValue[material.quality];
      const weight = material.quantity;
      totalValue += value * weight;
      totalWeight += weight;
    }

    if (totalWeight === 0) {
      return QualityValue[Quality.C];
    }

    return totalValue / totalWeight;
  }

  /**
   * 素材を消費する
   * @param inventory インベントリ
   * @param recipe レシピカード
   * @returns 新しいインベントリと使用した素材
   */
  private consumeMaterials(
    inventory: Inventory,
    recipe: RecipeCard
  ): { newInventory: Inventory; usedMaterials: MaterialInstance[] } {
    let currentInventory = { ...inventory, materials: [...inventory.materials] };
    const usedMaterials: MaterialInstance[] = [];
    const requiredMaterials = recipe.getRequiredMaterials();

    for (const required of requiredMaterials) {
      let remaining = required.quantity;
      const minQuality = required.minQuality;

      // 新しいmaterials配列を作成
      const newMaterials: MaterialInstance[] = [];

      for (const material of currentInventory.materials) {
        if (remaining <= 0) {
          newMaterials.push(material);
          continue;
        }

        const matchesMaterial = material.materialId === required.materialId;
        const matchesQuality = minQuality
          ? isQualityAtLeast(material.quality, minQuality)
          : true;

        if (matchesMaterial && matchesQuality) {
          const toConsume = Math.min(remaining, material.quantity);
          remaining -= toConsume;

          // 使用した素材を記録
          usedMaterials.push({
            ...material,
            quantity: toConsume,
          } as MaterialInstance);

          // 残りがある場合は残す
          if (material.quantity > toConsume) {
            newMaterials.push({
              ...material,
              quantity: material.quantity - toConsume,
            } as MaterialInstance);
          }
        } else {
          newMaterials.push(material);
        }
      }

      currentInventory = { ...currentInventory, materials: newMaterials };
    }

    return {
      newInventory: currentInventory,
      usedMaterials,
    };
  }

  /**
   * 使用する素材を取得する（消費せずに）
   * @param inventory インベントリ
   * @param recipe レシピカード
   * @returns 使用する素材リスト
   */
  private getUsedMaterials(
    inventory: Inventory,
    recipe: RecipeCard
  ): MaterialInstance[] {
    const usedMaterials: MaterialInstance[] = [];
    const requiredMaterials = recipe.getRequiredMaterials();
    const materialsCopy = [...inventory.materials];

    for (const required of requiredMaterials) {
      let remaining = required.quantity;
      const minQuality = required.minQuality;

      for (let i = 0; i < materialsCopy.length && remaining > 0; i++) {
        const material = materialsCopy[i];
        const matchesMaterial = material.materialId === required.materialId;
        const matchesQuality = minQuality
          ? isQualityAtLeast(material.quality, minQuality)
          : true;

        if (matchesMaterial && matchesQuality) {
          const toUse = Math.min(remaining, material.quantity);
          remaining -= toUse;

          usedMaterials.push({
            ...material,
            quantity: toUse,
          } as MaterialInstance);

          // コピーから減らす
          if (material.quantity > toUse) {
            materialsCopy[i] = {
              ...material,
              quantity: material.quantity - toUse,
            } as MaterialInstance;
          } else {
            materialsCopy.splice(i, 1);
            i--;
          }
        }
      }
    }

    return usedMaterials;
  }
}
