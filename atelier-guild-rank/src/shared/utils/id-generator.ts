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

import type { RandomFn } from './random';
import { defaultRandomFn } from './random';

/**
 * 【機能概要】: ユニークIDを生成
 * 【実装方針】: タイムスタンプ + ランダム値で一意性を保証
 * 【形式】: `{prefix}_{timestamp}_{random}`
 * 🔵 信頼性レベル: note.md・設計文書に明記
 *
 * @param prefix - プレフィックス（例: 'material', 'item', 'card'）
 * @param randomFn - ランダム関数（テスト用に差し替え可能）
 * @returns ユニークID文字列
 *
 * @example
 * ```typescript
 * const id = generateUniqueId('material');
 * // => "material_1705401234567_8934"
 * ```
 */
export function generateUniqueId(prefix: string, randomFn: RandomFn = defaultRandomFn): string {
  const timestamp = Date.now();
  const random = Math.floor(randomFn() * 10000);
  return `${prefix}_${timestamp}_${random}`;
}
