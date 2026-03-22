/**
 * format-condition.ts - 依頼条件フォーマットユーティリティ
 *
 * Issue #424: QuestCardUIとQuestDetailModalで重複していたformatConditionを共通化
 *
 * @description
 * IQuestConditionから表示用テキストを生成する純粋関数。
 * プレフィックス（「条件: 」）の付与はオプションで制御する。
 */

// =============================================================================
// 型定義
// =============================================================================

/** formatConditionに渡す条件オブジェクトの型 */
export interface FormatConditionInput {
  type: string;
  itemId?: string;
  category?: string;
  minQuality?: string;
  quantity?: number;
}

/** formatConditionのオプション */
export interface FormatConditionOptions {
  /** アイテム名解決関数（itemId -> 日本語名） */
  itemNameResolver?: (itemId: string) => string;
  /** プレフィックスを付与するか（デフォルト: false） */
  withPrefix?: boolean;
}

// =============================================================================
// 関数
// =============================================================================

/**
 * 依頼条件から表示用テキストを生成する
 *
 * @param condition - 依頼条件
 * @param options - フォーマットオプション
 * @returns フォーマット済み条件テキスト
 */
export function formatCondition(
  condition: FormatConditionInput,
  options: FormatConditionOptions = {},
): string {
  const { itemNameResolver, withPrefix = false } = options;
  const body = formatConditionBody(condition, itemNameResolver);
  return withPrefix ? `条件: ${body}` : body;
}

/**
 * 条件本体のテキストを生成する（プレフィックスなし）
 */
function formatConditionBody(
  condition: FormatConditionInput,
  itemNameResolver?: (itemId: string) => string,
): string {
  switch (condition.type) {
    case 'SPECIFIC': {
      const itemName = condition.itemId
        ? (itemNameResolver?.(condition.itemId) ?? condition.itemId)
        : '指定品';
      return `${itemName}を納品`;
    }
    case 'CATEGORY':
      return `${condition.category ?? 'カテゴリ'}の品を納品`;
    case 'QUALITY':
      return `品質${condition.minQuality ?? 'D'}以上`;
    case 'QUANTITY':
      return `${condition.quantity ?? 1}個納品`;
    case 'ATTRIBUTE':
      return '特定属性が必要';
    case 'EFFECT':
      return '特定効果が必要';
    case 'MATERIAL':
      return 'レア素材を使用';
    case 'COMPOUND':
      return '複合条件';
    default:
      return condition.type;
  }
}
