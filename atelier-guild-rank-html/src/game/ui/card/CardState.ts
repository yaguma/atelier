/**
 * カード状態定義
 *
 * カードの表示状態とそれに対応するスタイルを定義する。
 * 設計文書: docs/design/atelier-guild-rank-phaser/ui-design/overview.md
 */

/**
 * カード状態タイプ
 * - normal: 通常状態
 * - selected: 選択中
 * - disabled: 無効（使用不可）
 * - hover: ホバー中
 * - used: 使用済み
 */
export type CardState = 'normal' | 'selected' | 'disabled' | 'hover' | 'used';

/**
 * カード状態ごとのスタイル定義
 */
export interface CardStateStyle {
  /** 背景色（数値形式） */
  backgroundColor: number;
  /** ボーダー色（数値形式） */
  borderColor: number;
  /** ボーダー幅 */
  borderWidth: number;
  /** 透明度（0-1） */
  alpha: number;
  /** スケール（1が標準） */
  scale: number;
}

/**
 * 各状態に対応するスタイル定義
 */
export const CardStateStyles: Record<CardState, CardStateStyle> = {
  /** 通常状態: 標準表示 */
  normal: {
    backgroundColor: 0x2a2a4e,
    borderColor: 0x4a4a7e,
    borderWidth: 2,
    alpha: 1,
    scale: 1,
  },
  /** 選択状態: ハイライト表示 */
  selected: {
    backgroundColor: 0x3a3a6e,
    borderColor: 0x4a90d9,
    borderWidth: 3,
    alpha: 1,
    scale: 1.05,
  },
  /** 無効状態: 暗く半透明 */
  disabled: {
    backgroundColor: 0x1a1a2e,
    borderColor: 0x3a3a5e,
    borderWidth: 2,
    alpha: 0.5,
    scale: 1,
  },
  /** ホバー状態: わずかにハイライト */
  hover: {
    backgroundColor: 0x3a3a5e,
    borderColor: 0x5a5a8e,
    borderWidth: 2,
    alpha: 1,
    scale: 1.02,
  },
  /** 使用済み状態: 暗くわずかに縮小 */
  used: {
    backgroundColor: 0x1a1a2e,
    borderColor: 0x2a2a3e,
    borderWidth: 2,
    alpha: 0.6,
    scale: 0.95,
  },
} as const;

/**
 * カード状態からスタイルを取得する
 * @param state カード状態
 * @returns 対応するスタイル
 */
export const getCardStateStyle = (state: CardState): CardStateStyle => {
  return { ...CardStateStyles[state] };
};

/**
 * カード状態が有効（操作可能）かどうかを判定する
 * @param state カード状態
 * @returns 有効な場合true
 */
export const isCardInteractive = (state: CardState): boolean => {
  return state !== 'disabled' && state !== 'used';
};
