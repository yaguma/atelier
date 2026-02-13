/**
 * validate-quest.ts - 依頼バリデーションの純粋関数
 *
 * TASK-0081: features/quest/services作成
 *
 * 依頼の納品条件を検証し、アイテムが条件を満たすかどうかを判定する。
 * ItemInstanceクラスに依存せず、プレーンなデータ型で動作する。
 */

import type { ItemId, Quality } from '@shared/types';
import type { IQuestCondition } from '@shared/types/quests';

// =============================================================================
// 型定義
// =============================================================================

/** バリデーション対象のアイテム情報（純粋関数用） */
export interface ValidatableItem {
  /** アイテムID */
  itemId: ItemId;
  /** 品質 */
  quality: Quality;
  /** カテゴリ */
  category?: string;
  /** 属性を持つかどうか */
  hasAttributes: boolean;
  /** 効果を持つかどうか */
  hasEffects: boolean;
}

/** バリデーション結果 */
export interface ValidationResult {
  /** すべての条件を満たしたかどうか */
  valid: boolean;
  /** エラーリスト */
  errors: ValidationError[];
}

/** バリデーションエラー */
export interface ValidationError {
  /** 失敗した条件 */
  condition: IQuestCondition;
  /** エラーメッセージ */
  message: string;
}

// =============================================================================
// 品質順序
// =============================================================================

const QUALITY_ORDER: Record<Quality, number> = {
  D: 1,
  C: 2,
  B: 3,
  A: 4,
  S: 5,
};

// =============================================================================
// メイン関数
// =============================================================================

/**
 * 依頼条件に対してアイテムを検証する（純粋関数）
 *
 * @param condition - 依頼条件
 * @param item - 検証対象のアイテム
 * @returns バリデーション結果
 */
export function validateQuest(condition: IQuestCondition, item: ValidatableItem): ValidationResult {
  const errors: ValidationError[] = [];

  const isValid = checkCondition(condition, item, errors);

  return {
    valid: isValid,
    errors,
  };
}

/**
 * 複数アイテムに対して依頼条件を検証する（純粋関数）
 *
 * @param condition - 依頼条件
 * @param items - 検証対象のアイテムリスト
 * @returns バリデーション結果
 */
export function validateQuestWithMultipleItems(
  condition: IQuestCondition,
  items: readonly ValidatableItem[],
): ValidationResult {
  const errors: ValidationError[] = [];

  // QUANTITY条件の場合は数量チェック
  if (condition.type === 'QUANTITY') {
    const requiredQuantity = condition.quantity ?? 1;
    if (items.length < requiredQuantity) {
      errors.push({
        condition,
        message: `数量が不足しています: ${items.length}/${requiredQuantity}`,
      });
      return { valid: false, errors };
    }
    return { valid: true, errors: [] };
  }

  // COMPOUND条件の場合は各サブ条件を検証
  if (condition.type === 'COMPOUND' && condition.subConditions) {
    for (const subCondition of condition.subConditions) {
      const subResult = validateQuestWithMultipleItems(subCondition, items);
      if (!subResult.valid) {
        errors.push(...subResult.errors);
      }
    }
    return { valid: errors.length === 0, errors };
  }

  // 単品条件: いずれかのアイテムが条件を満たせばOK
  const anyValid = items.some((item) => {
    const result = validateQuest(condition, item);
    return result.valid;
  });

  if (!anyValid && items.length > 0) {
    errors.push({
      condition,
      message: `条件を満たすアイテムがありません: ${condition.type}`,
    });
  } else if (items.length === 0) {
    errors.push({
      condition,
      message: 'アイテムが指定されていません',
    });
  }

  return { valid: anyValid, errors };
}

// =============================================================================
// 内部ヘルパー
// =============================================================================

/**
 * 単一条件のチェック
 */
function checkCondition(
  condition: IQuestCondition,
  item: ValidatableItem,
  errors: ValidationError[],
): boolean {
  switch (condition.type) {
    case 'SPECIFIC':
      return checkSpecific(condition, item, errors);
    case 'CATEGORY':
      return checkCategory(condition, item, errors);
    case 'QUALITY':
      return checkQuality(condition, item, errors);
    case 'QUANTITY':
      // 単品チェックでは数量条件は常にtrue
      return true;
    case 'ATTRIBUTE':
      return checkAttribute(condition, item, errors);
    case 'EFFECT':
      return checkEffect(condition, item, errors);
    case 'MATERIAL':
      // 素材消費条件は将来実装（現在は常にtrue）
      return true;
    case 'COMPOUND':
      return checkCompound(condition, item, errors);
    default:
      errors.push({
        condition,
        message: `不明な条件タイプ: ${condition.type}`,
      });
      return false;
  }
}

function checkSpecific(
  condition: IQuestCondition,
  item: ValidatableItem,
  errors: ValidationError[],
): boolean {
  if (item.itemId !== condition.itemId) {
    errors.push({
      condition,
      message: `指定アイテムと一致しません: 要求=${condition.itemId}, 実際=${item.itemId}`,
    });
    return false;
  }
  return true;
}

function checkCategory(
  condition: IQuestCondition,
  item: ValidatableItem,
  errors: ValidationError[],
): boolean {
  if (item.category !== condition.category) {
    errors.push({
      condition,
      message: `カテゴリが一致しません: 要求=${condition.category}, 実際=${item.category}`,
    });
    return false;
  }
  return true;
}

function checkQuality(
  condition: IQuestCondition,
  item: ValidatableItem,
  errors: ValidationError[],
): boolean {
  if (!condition.minQuality) {
    return true;
  }
  const itemOrder = QUALITY_ORDER[item.quality];
  const requiredOrder = QUALITY_ORDER[condition.minQuality];
  if (itemOrder < requiredOrder) {
    errors.push({
      condition,
      message: `品質が不足しています: 要求=${condition.minQuality}, 実際=${item.quality}`,
    });
    return false;
  }
  return true;
}

function checkAttribute(
  condition: IQuestCondition,
  item: ValidatableItem,
  errors: ValidationError[],
): boolean {
  if (!item.hasAttributes) {
    errors.push({
      condition,
      message: '属性を持つアイテムが必要です',
    });
    return false;
  }
  return true;
}

function checkEffect(
  condition: IQuestCondition,
  item: ValidatableItem,
  errors: ValidationError[],
): boolean {
  if (!item.hasEffects) {
    errors.push({
      condition,
      message: '効果を持つアイテムが必要です',
    });
    return false;
  }
  return true;
}

function checkCompound(
  condition: IQuestCondition,
  item: ValidatableItem,
  errors: ValidationError[],
): boolean {
  if (!condition.subConditions || condition.subConditions.length === 0) {
    errors.push({
      condition,
      message: '複合条件にサブ条件がありません',
    });
    return false;
  }

  let allValid = true;
  for (const subCondition of condition.subConditions) {
    const subErrors: ValidationError[] = [];
    const isValid = checkCondition(subCondition, item, subErrors);
    if (!isValid) {
      allValid = false;
      errors.push(...subErrors);
    }
  }
  return allValid;
}
