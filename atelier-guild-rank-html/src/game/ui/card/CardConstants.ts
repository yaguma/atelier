/**
 * カードサイズ・レイアウト定数
 *
 * カードの表示サイズとレイアウト設定を定義する。
 * 設計文書: docs/design/atelier-guild-rank-phaser/ui-design/overview.md
 */

/**
 * カードサイズ定義
 * 標準、小、大の3種類のサイズを提供
 */
export const CardSize = {
  /** 標準サイズ（メイン画面の手札表示用） */
  STANDARD: { width: 120, height: 160 },
  /** 小サイズ（リスト表示、一覧表示用） */
  SMALL: { width: 90, height: 120 },
  /** 大サイズ（詳細表示、選択時拡大表示用） */
  LARGE: { width: 150, height: 200 },
} as const;

/**
 * カードサイズタイプ
 */
export type CardSizeType = keyof typeof CardSize;

/**
 * カードサイズオブジェクト型
 */
export interface CardSizeValue {
  width: number;
  height: number;
}

/**
 * カード内レイアウト定数（STANDARD基準）
 * 各要素の相対位置を定義
 */
export const CardLayout = {
  /** アイコンのY座標（中央から） */
  ICON_Y: 45,
  /** アイコンサイズ */
  ICON_SIZE: 48,
  /** カード名のY座標 */
  NAME_Y: 85,
  /** コスト表示のX座標（右上） */
  COST_X: 100,
  /** コスト表示のY座標（右上） */
  COST_Y: 15,
  /** 説明文のY座標 */
  DESCRIPTION_Y: 110,
  /** 説明文の幅 */
  DESCRIPTION_WIDTH: 100,
  /** 角丸の半径 */
  CORNER_RADIUS: 8,
  /** 内側のパディング */
  PADDING: 8,
  /** ボーダー幅 */
  BORDER_WIDTH: 2,
} as const;

/**
 * 指定サイズのスケール比率を計算する
 * @param sizeType カードサイズタイプ
 * @returns STANDARDサイズに対するスケール比率
 */
export const getCardScale = (sizeType: CardSizeType): number => {
  const standardWidth = CardSize.STANDARD.width;
  const targetWidth = CardSize[sizeType].width;
  return targetWidth / standardWidth;
};

/**
 * カードサイズを取得する
 * @param sizeType カードサイズタイプ
 * @returns カードサイズオブジェクト
 */
export const getCardSize = (sizeType: CardSizeType): CardSizeValue => {
  return { ...CardSize[sizeType] };
};
