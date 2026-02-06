/**
 * キーバインド定数定義
 * Issue #135: ゲーム全体のキーボード操作を実装
 *
 * @description
 * ゲーム内で使用するキーバインドを一元管理する定数ファイル。
 * 各コンポーネントはこの定数を参照してキーボード入力を処理する。
 */

/**
 * キーバインド定数
 * 各アクションに対応するキーを配列で定義（複数キーサポート）
 */
export const KEYBINDINGS = {
  // =============================================================================
  // 共通操作
  // =============================================================================

  /** 決定・確認 */
  CONFIRM: ['Enter', ' '] as readonly string[],

  /** キャンセル・戻る */
  CANCEL: ['Escape'] as readonly string[],

  /** 次のフェーズへ進む */
  NEXT_PHASE: ['n', 'N'] as readonly string[],

  // =============================================================================
  // ナビゲーション
  // =============================================================================

  /** 上方向に移動 */
  UP: ['ArrowUp', 'w', 'W'] as readonly string[],

  /** 下方向に移動 */
  DOWN: ['ArrowDown', 's', 'S'] as readonly string[],

  /** 左方向に移動 */
  LEFT: ['ArrowLeft', 'a', 'A'] as readonly string[],

  /** 右方向に移動 */
  RIGHT: ['ArrowRight', 'd', 'D'] as readonly string[],

  // =============================================================================
  // 数字キー選択（1-9）
  // =============================================================================

  /** 1番目を選択 */
  SELECT_1: ['1', 'Numpad1'] as readonly string[],

  /** 2番目を選択 */
  SELECT_2: ['2', 'Numpad2'] as readonly string[],

  /** 3番目を選択 */
  SELECT_3: ['3', 'Numpad3'] as readonly string[],

  /** 4番目を選択 */
  SELECT_4: ['4', 'Numpad4'] as readonly string[],

  /** 5番目を選択 */
  SELECT_5: ['5', 'Numpad5'] as readonly string[],

  /** 6番目を選択 */
  SELECT_6: ['6', 'Numpad6'] as readonly string[],

  /** 7番目を選択 */
  SELECT_7: ['7', 'Numpad7'] as readonly string[],

  /** 8番目を選択 */
  SELECT_8: ['8', 'Numpad8'] as readonly string[],

  /** 9番目を選択 */
  SELECT_9: ['9', 'Numpad9'] as readonly string[],

  // =============================================================================
  // 納品フェーズ専用（既存実装との互換性維持）
  // =============================================================================

  /** 納品実行 */
  DELIVER: ['d', 'D', 'Enter'] as readonly string[],

  /** 日を終了 */
  END_DAY: ['e', 'E'] as readonly string[],
} as const;

/**
 * キーバインド型定義
 */
export type KeybindingAction = keyof typeof KEYBINDINGS;

/**
 * キーがアクションに対応するかチェック
 *
 * @param key - チェックするキー（KeyboardEvent.key）
 * @param action - 対応するアクション
 * @returns キーがアクションに対応する場合true
 */
export function isKeyForAction(key: string, action: KeybindingAction): boolean {
  return KEYBINDINGS[action].includes(key);
}

/**
 * 数字キーから選択インデックスを取得
 *
 * @param key - チェックするキー
 * @returns 選択インデックス（1-9）、無効なキーの場合はnull
 */
export function getSelectionIndexFromKey(key: string): number | null {
  for (let i = 1; i <= 9; i++) {
    const action = `SELECT_${i}` as KeybindingAction;
    if (isKeyForAction(key, action)) {
      return i;
    }
  }
  return null;
}
