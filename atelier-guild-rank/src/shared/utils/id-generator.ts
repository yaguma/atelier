/**
 * id-generator.ts - ユニークID生成ユーティリティ
 *
 * TASK-0010: 素材エンティティ・MaterialService実装
 *
 * @description
 * エンティティインスタンスのユニークIDを生成する
 *
 * @信頼性レベル 🔵
 * - タイムスタンプとランダム値によるユニークID生成
 */

/**
 * 【機能概要】: ユニークIDを生成
 * 【実装方針】: タイムスタンプ + ランダム値で一意性を保証
 * 【形式】: `{prefix}_{timestamp}_{random}`
 * 🔵 信頼性レベル: note.md・設計文書に明記
 *
 * @param prefix - プレフィックス（例: 'material', 'item', 'card'）
 * @returns ユニークID文字列
 *
 * @example
 * ```typescript
 * const id = generateUniqueId('material');
 * // => "material_1705401234567_8934"
 * ```
 */
export function generateUniqueId(prefix: string): string {
  // 【タイムスタンプ取得】: ミリ秒単位の現在時刻
  // 【用途】: 時系列での一意性を保証
  // 🔵 信頼性レベル: note.md・設計文書に明記
  const timestamp = Date.now();

  // 【ランダム値生成】: 0〜9999のランダムな整数
  // 【用途】: 同一タイムスタンプ内での一意性を保証
  // 🔵 信頼性レベル: note.md・設計文書に明記
  const random = Math.floor(Math.random() * 10000);

  // 【ID生成】: プレフィックス、タイムスタンプ、ランダム値を結合
  // 【形式】: `{prefix}_{timestamp}_{random}`
  // 🔵 信頼性レベル: note.md・設計文書に明記
  return `${prefix}_${timestamp}_${random}`;
}
