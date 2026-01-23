/**
 * BorderLineFactory
 * ボーダーライン生成のFactoryモジュール
 *
 * TASK-0053 Phase 7 共通UIユーティリティ基盤
 */

/** デフォルト設定 */
const DEFAULTS = {
  color: 0x4a4a5d,
  thickness: 2,
  radius: 8,
} as const;

/**
 * 水平線を生成する
 * @param scene Phaserシーン
 * @param x 開始X座標
 * @param y Y座標
 * @param width 線の長さ
 * @param color 線の色（デフォルト: 0x4a4a5d）
 * @param thickness 線の太さ（デフォルト: 2）
 * @returns Phaser.GameObjects.Graphics
 * @throws シーンがnull/undefinedの場合エラー
 */
export function createHorizontalLine(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  color: number = DEFAULTS.color,
  thickness: number = DEFAULTS.thickness,
): Phaser.GameObjects.Graphics {
  if (!scene) {
    throw new Error('Scene is required');
  }

  const graphics = scene.add.graphics();
  graphics.lineStyle(thickness, color, 1);
  graphics.lineBetween(x, y, x + width, y);

  return graphics;
}

/**
 * 垂直線を生成する
 * @param scene Phaserシーン
 * @param x X座標
 * @param y 開始Y座標
 * @param height 線の長さ
 * @param color 線の色（デフォルト: 0x4a4a5d）
 * @param thickness 線の太さ（デフォルト: 2）
 * @returns Phaser.GameObjects.Graphics
 * @throws シーンがnull/undefinedの場合エラー
 */
export function createVerticalLine(
  scene: Phaser.Scene,
  x: number,
  y: number,
  height: number,
  color: number = DEFAULTS.color,
  thickness: number = DEFAULTS.thickness,
): Phaser.GameObjects.Graphics {
  if (!scene) {
    throw new Error('Scene is required');
  }

  const graphics = scene.add.graphics();
  graphics.lineStyle(thickness, color, 1);
  graphics.lineBetween(x, y, x, y + height);

  return graphics;
}

/**
 * 角丸ボーダーを生成する
 * @param scene Phaserシーン
 * @param x X座標
 * @param y Y座標
 * @param width 幅
 * @param height 高さ
 * @param radius 角丸半径（デフォルト: 8）
 * @param color 線の色（デフォルト: 0x4a4a5d）
 * @returns Phaser.GameObjects.Graphics
 * @throws シーンがnull/undefinedの場合エラー
 */
export function createRoundedBorder(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number = DEFAULTS.radius,
  color: number = DEFAULTS.color,
): Phaser.GameObjects.Graphics {
  if (!scene) {
    throw new Error('Scene is required');
  }

  const graphics = scene.add.graphics();
  graphics.lineStyle(DEFAULTS.thickness, color, 1);
  graphics.strokeRoundedRect(x, y, width, height, radius);

  return graphics;
}

/**
 * BorderLineFactory
 * 後方互換性のためのクラスラッパー
 * @deprecated 代わりに createHorizontalLine, createVerticalLine, createRoundedBorder を直接使用してください
 */
export const BorderLineFactory = {
  createHorizontalLine,
  createVerticalLine,
  createRoundedBorder,
};
