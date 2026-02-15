/**
 * UIBackgroundBuilder
 * 背景パネル生成のBuilderクラス
 *
 * TASK-0053 Phase 7 共通UIユーティリティ基盤
 */

/** デフォルト設定 */
const DEFAULTS = {
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  fillColor: 0x2a2a3d,
  fillAlpha: 0.95,
  borderRadius: 8,
  borderColor: 0x4a4a5d,
  borderWidth: 2,
} as const;

/**
 * 背景パネル生成のBuilderクラス
 * Graphicsオブジェクトを使用した背景パネルをメソッドチェーンで生成する
 */
export class UIBackgroundBuilder {
  private scene: Phaser.Scene;
  private x: number = DEFAULTS.x;
  private y: number = DEFAULTS.y;
  private width: number = DEFAULTS.width;
  private height: number = DEFAULTS.height;
  private fillColor: number = DEFAULTS.fillColor;
  private fillAlpha: number = DEFAULTS.fillAlpha;
  private borderRadius: number = DEFAULTS.borderRadius;
  private borderColor: number | null = null;
  private borderWidth: number = DEFAULTS.borderWidth;

  /**
   * コンストラクタ
   * @param scene Phaserシーン
   * @throws シーンがnull/undefinedの場合エラー
   */
  constructor(scene: Phaser.Scene) {
    if (!scene) {
      throw new Error('Scene is required');
    }
    this.scene = scene;
  }

  /**
   * 位置を設定する
   * @param x X座標
   * @param y Y座標
   * @returns this（メソッドチェーン用）
   */
  setPosition(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }

  /**
   * サイズを設定する
   * @param width 幅
   * @param height 高さ
   * @returns this（メソッドチェーン用）
   */
  setSize(width: number, height: number): this {
    // 負の値は0に正規化
    this.width = Math.max(0, width);
    this.height = Math.max(0, height);
    return this;
  }

  /**
   * 塗り色を設定する
   * @param color 色（16進数）
   * @param alpha 透明度（デフォルト: 0.95）
   * @returns this（メソッドチェーン用）
   */
  setFill(color: number, alpha: number = DEFAULTS.fillAlpha): this {
    this.fillColor = color;
    this.fillAlpha = alpha;
    return this;
  }

  /**
   * ボーダーを設定する
   * @param color ボーダー色（16進数）
   * @param width ボーダー幅（デフォルト: 2）
   * @returns this（メソッドチェーン用）
   */
  setBorder(color: number, width: number = DEFAULTS.borderWidth): this {
    this.borderColor = color;
    this.borderWidth = width;
    return this;
  }

  /**
   * 角丸半径を設定する
   * @param radius 角丸半径
   * @returns this（メソッドチェーン用）
   */
  setRadius(radius: number): this {
    this.borderRadius = radius;
    return this;
  }

  /**
   * Graphicsオブジェクトを生成する
   * @returns Phaser.GameObjects.Graphics
   */
  build(): Phaser.GameObjects.Graphics {
    const graphics = this.scene.add.graphics();

    // 塗りつぶし
    graphics.fillStyle(this.fillColor, this.fillAlpha);
    graphics.fillRoundedRect(this.x, this.y, this.width, this.height, this.borderRadius);

    // ボーダー（設定されている場合）
    if (this.borderColor !== null) {
      graphics.lineStyle(this.borderWidth, this.borderColor, 1);
      graphics.strokeRoundedRect(this.x, this.y, this.width, this.height, this.borderRadius);
    }

    return graphics;
  }
}
