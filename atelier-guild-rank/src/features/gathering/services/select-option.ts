/**
 * select-option.ts - ドラフト選択の純粋関数
 *
 * TASK-0073: features/gathering/services作成
 *
 * @description
 * ドラフト採取の素材オプションから選択する純粋関数。
 * Result型パターンでエラーを値として返す。
 */

import type { MaterialOption } from '@features/gathering/types';

/**
 * 選択エラーの種別
 */
export type SelectionError = 'INVALID_INDEX' | 'NO_OPTIONS';

/**
 * 選択結果のResult型
 * 成功時はvalue、失敗時はerrorを保持
 */
export type SelectionResult =
  | { readonly success: true; readonly value: MaterialOption }
  | { readonly success: false; readonly error: SelectionError };

/**
 * ドラフト選択肢から素材を選択する純粋関数
 *
 * @param options - 選択可能な素材オプション
 * @param selectedIndex - 選択するインデックス
 * @returns 選択結果（Result型）
 *
 * @example
 * ```typescript
 * const result = selectGatheringOption(options, 1);
 * if (result.success) {
 *   console.log(result.value.materialId);
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */
export function selectGatheringOption(
  options: readonly MaterialOption[],
  selectedIndex: number,
): SelectionResult {
  if (options.length === 0) {
    return { success: false, error: 'NO_OPTIONS' };
  }

  if (selectedIndex < 0 || selectedIndex >= options.length) {
    return { success: false, error: 'INVALID_INDEX' };
  }

  const selected = options[selectedIndex];
  if (!selected) {
    return { success: false, error: 'INVALID_INDEX' };
  }

  return { success: true, value: selected };
}
