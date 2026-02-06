/**
 * キーボードショートカット定義
 *
 * @description
 * ゲーム内で使用可能なキーボードショートカットを定義する。
 * キーボード操作テストで使用するキーマッピングを一元管理。
 */

/**
 * 全シーン共通のキー
 */
export const COMMON_KEYS = {
  /** 決定・次へ */
  CONFIRM: 'Enter',
  /** キャンセル・戻る */
  CANCEL: 'Escape',
  /** 選択・実行 */
  SELECT: 'Space',
  /** フォーカス移動（順方向） */
  NEXT_FOCUS: 'Tab',
  /** フォーカス移動（逆方向） */
  PREV_FOCUS: 'Shift+Tab',
} as const;

/**
 * 方向キー
 */
export const DIRECTION_KEYS = {
  UP: 'ArrowUp',
  DOWN: 'ArrowDown',
  LEFT: 'ArrowLeft',
  RIGHT: 'ArrowRight',
} as const;

/**
 * 依頼受注フェーズのキー
 */
export const QUEST_ACCEPT_KEYS = {
  /** 依頼カード1を選択 */
  CARD_1: '1',
  /** 依頼カード2を選択 */
  CARD_2: '2',
  /** 依頼カード3を選択 */
  CARD_3: '3',
  /** 依頼カード4を選択 */
  CARD_4: '4',
  /** 依頼カード5を選択 */
  CARD_5: '5',
} as const;

/**
 * 採取フェーズのキー
 */
export const GATHERING_KEYS = {
  /** ドラフトカード1を選択 */
  DRAFT_1: '1',
  /** ドラフトカード2を選択 */
  DRAFT_2: '2',
  /** ドラフトカード3を選択 */
  DRAFT_3: '3',
} as const;

/**
 * 調合フェーズのキー
 */
export const ALCHEMY_KEYS = {
  /** レシピ1を選択 */
  RECIPE_1: '1',
  /** レシピ2を選択 */
  RECIPE_2: '2',
  /** レシピ3を選択 */
  RECIPE_3: '3',
  /** 調合実行 */
  SYNTHESIZE: 'Enter',
} as const;

/**
 * 納品フェーズのキー
 */
export const DELIVERY_KEYS = {
  /** 依頼1を選択 */
  QUEST_1: '1',
  /** 依頼2を選択 */
  QUEST_2: '2',
  /** 依頼3を選択 */
  QUEST_3: '3',
  /** 納品実行 */
  DELIVER: 'Enter',
  /** 日終了 */
  END_DAY: 'E',
} as const;

/**
 * デバッグ用キー（開発環境のみ）
 */
export const DEBUG_KEYS = {
  /** デバッグコンソール表示 */
  TOGGLE_DEBUG: 'F12',
  /** 状態ログ出力 */
  LOG_STATE: 'F11',
  /** フェーズスキップ */
  SKIP_PHASE: 'F9',
  /** 日スキップ */
  SKIP_DAY: 'F8',
} as const;

/**
 * キーシーケンス（コンボ入力）
 */
export const KEY_SEQUENCES = {
  /** コナミコマンド（イースターエッグ用） */
  KONAMI: [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'KeyB',
    'KeyA',
  ],
} as const;

/**
 * キーボードショートカットの全エクスポート
 */
export const KEYBOARD_SHORTCUTS = {
  common: COMMON_KEYS,
  direction: DIRECTION_KEYS,
  questAccept: QUEST_ACCEPT_KEYS,
  gathering: GATHERING_KEYS,
  alchemy: ALCHEMY_KEYS,
  delivery: DELIVERY_KEYS,
  debug: DEBUG_KEYS,
  sequences: KEY_SEQUENCES,
} as const;

/**
 * キー名からPlaywright用のキー文字列に変換
 *
 * @param key - キー名
 * @returns Playwright用のキー文字列
 */
export function toPlaywrightKey(key: string): string {
  // 修飾キーの組み合わせを分解
  if (key.includes('+')) {
    const parts = key.split('+');
    return parts.join('+');
  }
  return key;
}

/**
 * フェーズに応じたカード選択キーを取得
 *
 * @param phase - 現在のフェーズ
 * @param index - カードインデックス（0始まり）
 * @returns キー文字列
 */
export function getCardSelectionKey(phase: string, index: number): string {
  const keyNum = (index + 1).toString();

  switch (phase) {
    case 'QUEST_ACCEPT':
      if (index < 5) return keyNum;
      break;
    case 'GATHERING':
      if (index < 3) return keyNum;
      break;
    case 'ALCHEMY':
    case 'DELIVERY':
      return keyNum;
  }

  return keyNum;
}
