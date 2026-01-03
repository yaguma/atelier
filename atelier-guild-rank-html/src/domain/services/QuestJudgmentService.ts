/**
 * 依頼判定ドメインサービス
 * TASK-0095: 依頼判定ドメインサービス
 *
 * 依頼の納品判定と報酬計算のビジネスロジックを管理する
 */

import { Quest, ActiveQuest } from '@domain/quest/QuestEntity';
import type { IQuestCondition } from '@domain/quest/Quest';
import { CraftedItem } from '@domain/item/ItemEntity';
import {
  type Inventory,
  InventoryService,
} from '@domain/services/InventoryService';
import {
  Quality,
  QuestType,
  ItemCategory,
  Attribute,
  ItemEffectType,
} from '@domain/common/types';

/**
 * 操作結果型
 */
export type Result<T> =
  | { success: true; value: T }
  | { success: false; error: string };

/**
 * 不足アイテム情報
 */
export interface MissingItem {
  /** 条件説明 */
  description: string;
  /** 必要数 */
  required: number;
  /** 所持数 */
  available: number;
}

/**
 * 納品可否判定結果
 */
export interface CanDeliverResult {
  /** 納品可能かどうか */
  canDeliver: boolean;
  /** 不足アイテムリスト */
  missingItems: MissingItem[];
}

/**
 * 報酬情報
 */
export interface Reward {
  /** 報酬ゴールド */
  gold: number;
  /** 報酬貢献度 */
  contribution: number;
  /** 品質ボーナス */
  qualityBonus: number;
}

/**
 * 納品結果
 */
export interface DeliveryResult {
  /** 報酬 */
  reward: Reward;
  /** 更新後のインベントリ */
  inventory: Inventory;
  /** 納品したアイテム */
  deliveredItems: CraftedItem[];
}

/**
 * ペナルティ情報
 */
export interface Penalty {
  /** ゴールドペナルティ（負の値） */
  gold: number;
  /** 貢献度ペナルティ（負の値） */
  contribution: number;
}

/**
 * 納品オプション
 */
export interface DeliveryOptions {
  /** アイテムIDからカテゴリへのマッピング */
  itemCategories?: Record<string, ItemCategory>;
}

/**
 * 品質の数値マップ
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
 * 品質ボーナス係数（S品質で1.5倍）
 */
const QUALITY_BONUS_MULTIPLIER = 0.005;

/**
 * 期限切れペナルティ係数
 */
const EXPIRED_PENALTY_RATE = 0.3;

/**
 * 依頼判定ドメインサービス
 * 依頼の納品判定と報酬計算に関するビジネスロジックを提供する
 */
export class QuestJudgmentService {
  private inventoryService: InventoryService;

  constructor() {
    this.inventoryService = new InventoryService();
  }

  /**
   * 納品可否を判定する
   * @param inventory インベントリ
   * @param quest 依頼
   * @param options オプション
   * @returns 納品可否判定結果
   */
  canDeliver(
    inventory: Inventory,
    quest: Quest,
    options: DeliveryOptions = {}
  ): CanDeliverResult {
    const condition = quest.getCondition();
    const missingItems: MissingItem[] = [];

    // 条件を満たすアイテムを検索
    const matchingItems = this.findMatchingItems(
      inventory.items,
      condition,
      options
    );
    const requiredQuantity = condition.quantity ?? 1;

    if (matchingItems.length < requiredQuantity) {
      missingItems.push({
        description: this.getConditionDescription(condition),
        required: requiredQuantity,
        available: matchingItems.length,
      });
    }

    return {
      canDeliver: missingItems.length === 0,
      missingItems,
    };
  }

  /**
   * 納品を実行する
   * @param inventory インベントリ
   * @param quest 依頼
   * @param options オプション
   * @returns 納品結果
   */
  deliver(
    inventory: Inventory,
    quest: Quest,
    options: DeliveryOptions = {}
  ): Result<DeliveryResult> {
    // 納品可否チェック
    const canDeliverResult = this.canDeliver(inventory, quest, options);
    if (!canDeliverResult.canDeliver) {
      return { success: false, error: '納品に必要なアイテムが不足しています' };
    }

    const condition = quest.getCondition();
    const requiredQuantity = condition.quantity ?? 1;

    // 条件を満たすアイテムを取得
    const matchingItems = this.findMatchingItems(
      inventory.items,
      condition,
      options
    );

    // 納品するアイテムを選択（品質の低い順に選択）
    const sortedItems = [...matchingItems].sort(
      (a, b) => QualityValue[a.quality] - QualityValue[b.quality]
    );
    const deliveredItems = sortedItems.slice(0, requiredQuantity);

    // インベントリからアイテムを消費
    let newInventory = { ...inventory, items: [...inventory.items] };
    for (const item of deliveredItems) {
      const itemIndex = newInventory.items.findIndex(
        (i) => i === item || (i.itemId === item.itemId && i.quality === item.quality)
      );
      if (itemIndex !== -1) {
        const newItems = [...newInventory.items];
        newItems.splice(itemIndex, 1);
        newInventory = { ...newInventory, items: newItems };
      }
    }

    // 報酬を計算
    const reward = this.calculateReward(quest, deliveredItems);

    return {
      success: true,
      value: {
        reward,
        inventory: newInventory,
        deliveredItems,
      },
    };
  }

  /**
   * 報酬を計算する
   * @param quest 依頼
   * @param items 納品アイテムリスト
   * @returns 報酬
   */
  calculateReward(quest: Quest, items: CraftedItem[]): Reward {
    const baseGold = quest.getGold();
    const baseContribution = quest.getContribution();

    // 平均品質を計算
    const avgQuality = this.calculateAverageQuality(items);

    // 品質ボーナスを計算（C品質を基準として）
    const qualityDiff = avgQuality - QualityValue[Quality.C];
    const qualityBonus = Math.max(0, Math.floor(baseGold * qualityDiff * QUALITY_BONUS_MULTIPLIER));

    // 低品質の場合は基本報酬の50%〜100%
    const qualityMultiplier = Math.max(0.5, avgQuality / QualityValue[Quality.C]);

    return {
      gold: Math.floor(baseGold * Math.min(1, qualityMultiplier)) + qualityBonus,
      contribution: Math.floor(baseContribution * Math.min(1, qualityMultiplier)),
      qualityBonus,
    };
  }

  /**
   * 期限切れペナルティを計算する
   * @param activeQuest 受注中の依頼
   * @returns ペナルティ
   */
  calculateExpiredPenalty(activeQuest: ActiveQuest): Penalty {
    if (!activeQuest.isExpired()) {
      return { gold: 0, contribution: 0 };
    }

    const quest = activeQuest.getQuest();
    const baseGold = quest.getGold();
    const baseContribution = quest.getContribution();

    return {
      gold: -Math.floor(baseGold * EXPIRED_PENALTY_RATE),
      contribution: -Math.floor(baseContribution * EXPIRED_PENALTY_RATE),
    };
  }

  /**
   * 条件を満たすアイテムを検索する
   * @param items アイテムリスト
   * @param condition 依頼条件
   * @param options オプション
   * @returns 条件を満たすアイテムリスト
   */
  private findMatchingItems(
    items: CraftedItem[],
    condition: IQuestCondition,
    options: DeliveryOptions
  ): CraftedItem[] {
    return items.filter((item) => this.checkItemCondition(item, condition, options));
  }

  /**
   * アイテムが条件を満たすか判定する
   * @param item アイテム
   * @param condition 依頼条件
   * @param options オプション
   * @returns 条件を満たす場合true
   */
  private checkItemCondition(
    item: CraftedItem,
    condition: IQuestCondition,
    options: DeliveryOptions
  ): boolean {
    const type = condition.type;

    switch (type) {
      case QuestType.SPECIFIC:
        // 具体的なアイテムID指定
        if (condition.itemId && item.itemId !== condition.itemId) {
          return false;
        }
        break;

      case QuestType.CATEGORY:
        // カテゴリ指定
        if (condition.category && options.itemCategories) {
          const itemCategory = options.itemCategories[item.itemId];
          if (itemCategory !== condition.category) {
            return false;
          }
        }
        break;

      case QuestType.ATTRIBUTE:
        // 属性条件
        if (condition.attribute !== undefined) {
          const attrValue = item.getAttributeValue(condition.attribute);
          if (attrValue < (condition.minAttributeValue ?? 0)) {
            return false;
          }
        }
        break;

      case QuestType.EFFECT:
        // 効果条件
        if (condition.effectType !== undefined) {
          const effectValue = item.getEffectValue(condition.effectType);
          if (effectValue < (condition.minEffectValue ?? 0)) {
            return false;
          }
        }
        break;

      default:
        // 複合条件やその他の場合
        break;
    }

    // 品質チェック（共通）
    if (condition.minQuality) {
      if (QualityValue[item.quality] < QualityValue[condition.minQuality]) {
        return false;
      }
    }

    return true;
  }

  /**
   * 条件の説明文を生成する
   * @param condition 依頼条件
   * @returns 説明文
   */
  private getConditionDescription(condition: IQuestCondition): string {
    switch (condition.type) {
      case QuestType.SPECIFIC:
        return `アイテム: ${condition.itemId}`;
      case QuestType.CATEGORY:
        return `カテゴリ: ${condition.category}`;
      case QuestType.ATTRIBUTE:
        return `属性: ${condition.attribute} (${condition.minAttributeValue}以上)`;
      case QuestType.EFFECT:
        return `効果: ${condition.effectType} (${condition.minEffectValue}以上)`;
      default:
        return '条件を満たすアイテム';
    }
  }

  /**
   * アイテムの平均品質を計算する
   * @param items アイテムリスト
   * @returns 平均品質値
   */
  private calculateAverageQuality(items: CraftedItem[]): number {
    if (items.length === 0) {
      return QualityValue[Quality.C];
    }

    const totalQuality = items.reduce(
      (sum, item) => sum + QualityValue[item.quality],
      0
    );
    return totalQuality / items.length;
  }
}
