/**
 * 手札レイアウトユーティリティ
 *
 * カードの配置位置を計算するユーティリティ関数を提供する。
 * 設計文書: docs/tasks/atelier-guild-rank-phaser/TASK-0195.md
 */

import { HandLayout, HandLayoutType } from './HandConstants';

/**
 * カードの位置情報
 */
export interface CardPosition {
  /** X座標 */
  x: number;
  /** Y座標 */
  y: number;
  /** 回転角度（ラジアン） */
  rotation: number;
  /** スケール値 */
  scale: number;
  /** 深度（描画順序） */
  depth: number;
}

/**
 * カードの配置位置を計算する
 *
 * @param cardCount カードの枚数
 * @param layoutType レイアウトタイプ
 * @param centerX 中心X座標（デフォルト: HandLayout.X）
 * @param centerY 中心Y座標（デフォルト: HandLayout.Y）
 * @returns カード位置の配列
 */
export const calculateCardPositions = (
  cardCount: number,
  layoutType: HandLayoutType,
  centerX: number = HandLayout.X,
  centerY: number = HandLayout.Y
): CardPosition[] => {
  if (cardCount === 0) {
    return [];
  }

  if (cardCount === 1) {
    return [{ x: centerX, y: centerY, rotation: 0, scale: 1, depth: 0 }];
  }

  if (layoutType === 'horizontal') {
    return calculateHorizontalLayout(cardCount, centerX, centerY);
  } else {
    return calculateFanLayout(cardCount, centerX, centerY);
  }
};

/**
 * 水平配置のレイアウトを計算する
 *
 * @param cardCount カードの枚数
 * @param centerX 中心X座標
 * @param centerY 中心Y座標
 * @returns カード位置の配列
 */
const calculateHorizontalLayout = (
  cardCount: number,
  centerX: number,
  centerY: number
): CardPosition[] => {
  const positions: CardPosition[] = [];
  const totalWidth = (cardCount - 1) * HandLayout.CARD_SPACING;
  const startX = centerX - totalWidth / 2;

  for (let i = 0; i < cardCount; i++) {
    positions.push({
      x: startX + i * HandLayout.CARD_SPACING,
      y: centerY,
      rotation: 0,
      scale: 1,
      depth: i,
    });
  }

  return positions;
};

/**
 * 扇形配置のレイアウトを計算する
 *
 * @param cardCount カードの枚数
 * @param centerX 中心X座標
 * @param centerY 中心Y座標
 * @returns カード位置の配列
 */
const calculateFanLayout = (
  cardCount: number,
  centerX: number,
  centerY: number
): CardPosition[] => {
  const positions: CardPosition[] = [];

  // 角度範囲をラジアンに変換
  const angleRange = HandLayout.FAN_ANGLE_RANGE * (Math.PI / 180);
  const startAngle = -angleRange / 2;
  const angleStep = angleRange / (cardCount - 1);
  const radius = HandLayout.FAN_RADIUS;

  for (let i = 0; i < cardCount; i++) {
    const angle = startAngle + i * angleStep;
    positions.push({
      x: centerX + Math.sin(angle) * radius,
      y: centerY - Math.cos(angle) * radius + radius,
      rotation: angle,
      scale: 1,
      depth: i,
    });
  }

  return positions;
};
