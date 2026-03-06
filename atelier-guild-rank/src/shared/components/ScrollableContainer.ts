/**
 * ScrollableContainer - スクロール可能なコンテナコンポーネント
 * Issue #368: QuestAcceptPhaseUI/AlchemyPhaseUIの共通スクロールパターンを抽出
 *
 * @description
 * GeometryMask + マウスホイールスクロールの共通パターンを提供する。
 * コンテンツをマスク範囲内にクリッピングし、ホイール操作でスクロールできる。
 */

import type Phaser from 'phaser';

/**
 * マスク領域の矩形定義（ワールド座標）
 */
export interface ScrollMaskBounds {
  /** マスク左上X座標 */
  x: number;
  /** マスク左上Y座標 */
  y: number;
  /** マスク幅 */
  width: number;
  /** マスク高さ */
  height: number;
}

/**
 * ScrollableContainerの設定
 */
export interface ScrollableContainerConfig {
  /** マスク領域の矩形（ワールド座標） */
  maskBounds: ScrollMaskBounds;
  /** スクロール速度係数（デフォルト: 0.5） */
  scrollSpeed?: number;
  /** スクロール可能かを判定するコールバック（デフォルト: 常にtrue） */
  isScrollEnabled?: () => boolean;
}

/** デフォルトのスクロール速度 */
const DEFAULT_SCROLL_SPEED = 0.5;

/**
 * スクロール可能なコンテナコンポーネント
 *
 * GeometryMaskによるクリッピングとマウスホイールスクロールを提供する。
 * 利用側は getScrollContainer() で内部コンテナを取得し、コンテンツを追加する。
 *
 * @example
 * ```typescript
 * const scrollable = new ScrollableContainer(scene, parentContainer, {
 *   maskBounds: { x: 200, y: 140, width: 1080, height: 460 },
 *   scrollSpeed: 0.5,
 *   isScrollEnabled: () => this.container.visible,
 * });
 * scrollable.create();
 *
 * // コンテンツを追加
 * scrollable.getScrollContainer().add(someGameObject);
 *
 * // コンテンツ高さを更新
 * scrollable.setContentHeight(800);
 *
 * // 破棄
 * scrollable.destroy();
 * ```
 */
export class ScrollableContainer {
  private readonly scene: Phaser.Scene;
  private readonly parentContainer: Phaser.GameObjects.Container;
  private readonly config: Required<ScrollableContainerConfig>;

  /** スクロール用サブコンテナ */
  private scrollContainer: Phaser.GameObjects.Container | null = null;

  /** マスク用Graphicsオブジェクト */
  private maskGraphics: Phaser.GameObjects.Graphics | null = null;

  /** 現在のスクロールオフセット（px） */
  private scrollOffset = 0;

  /** マウスホイールハンドラ参照 */
  private wheelHandler:
    | ((
        pointer: Phaser.Input.Pointer,
        gameObjects: Phaser.GameObjects.GameObject[],
        deltaX: number,
        deltaY: number,
      ) => void)
    | null = null;

  /** コンテンツの総高さ */
  private contentHeight = 0;

  /**
   * @param scene - Phaserシーン
   * @param parentContainer - スクロールコンテナを追加する親コンテナ
   * @param config - スクロール設定
   */
  constructor(
    scene: Phaser.Scene,
    parentContainer: Phaser.GameObjects.Container,
    config: ScrollableContainerConfig,
  ) {
    if (!scene) {
      throw new Error('ScrollableContainer: scene is required');
    }
    if (!parentContainer) {
      throw new Error('ScrollableContainer: parentContainer is required');
    }
    if (!config.maskBounds) {
      throw new Error('ScrollableContainer: maskBounds is required');
    }

    this.scene = scene;
    this.parentContainer = parentContainer;
    this.config = {
      maskBounds: config.maskBounds,
      scrollSpeed: config.scrollSpeed ?? DEFAULT_SCROLL_SPEED,
      isScrollEnabled: config.isScrollEnabled ?? (() => true),
    };
  }

  /**
   * スクロールエリアを作成
   * マスク付きコンテナとホイールハンドラをセットアップする
   */
  create(): void {
    this.scrollContainer = this.scene.add.container(0, 0);
    this.parentContainer.add(this.scrollContainer);
    this.applyMask();
    this.setupWheelHandler();
  }

  /**
   * スクロール用コンテナを取得
   * コンテンツはこのコンテナに追加する
   */
  getScrollContainer(): Phaser.GameObjects.Container | null {
    return this.scrollContainer;
  }

  /**
   * コンテンツの総高さを設定
   * スクロール上限の計算に使用される
   *
   * @param height - コンテンツの総高さ（px）
   */
  setContentHeight(height: number): void {
    this.contentHeight = height;
  }

  /**
   * スクロール位置を先頭にリセット
   */
  resetScroll(): void {
    this.scrollOffset = 0;
    if (this.scrollContainer) {
      this.scrollContainer.y = 0;
    }
  }

  /**
   * 現在のスクロールオフセットを取得
   */
  getScrollOffset(): number {
    return this.scrollOffset;
  }

  /**
   * 最大スクロールオフセットを取得
   */
  getMaxScrollOffset(): number {
    return Math.max(0, this.contentHeight - this.config.maskBounds.height);
  }

  /**
   * リソースを破棄
   */
  destroy(): void {
    this.removeWheelHandler();
    if (this.maskGraphics) {
      this.maskGraphics.destroy();
      this.maskGraphics = null;
    }
    this.scrollContainer = null;
  }

  /**
   * GeometryMaskを適用してマスク範囲外をクリッピング
   */
  private applyMask(): void {
    if (!this.scrollContainer) return;

    const { x, y, width, height } = this.config.maskBounds;

    try {
      this.maskGraphics = this.scene.make.graphics({});
      this.maskGraphics.fillStyle(0xffffff);
      this.maskGraphics.fillRect(x, y, width, height);

      const mask = this.maskGraphics.createGeometryMask();
      this.scrollContainer.setMask(mask);
    } catch {
      // make.graphicsが使用できない場合はマスクなしで動作
    }
  }

  /**
   * マウスホイールハンドラを設定
   */
  private setupWheelHandler(): void {
    this.wheelHandler = (
      _pointer: Phaser.Input.Pointer,
      _gameObjects: Phaser.GameObjects.GameObject[],
      _deltaX: number,
      deltaY: number,
    ) => {
      if (!this.config.isScrollEnabled()) return;
      this.applyScroll(deltaY);
    };
    this.scene.input?.on?.('wheel', this.wheelHandler);
  }

  /**
   * deltaYに基づいてスクロールオフセットを更新
   */
  private applyScroll(deltaY: number): void {
    if (!this.scrollContainer) return;

    const maxOffset = this.getMaxScrollOffset();
    if (maxOffset <= 0) return;

    this.scrollOffset += deltaY * this.config.scrollSpeed;
    this.scrollOffset = Math.max(0, Math.min(this.scrollOffset, maxOffset));
    this.scrollContainer.y = -this.scrollOffset;
  }

  /**
   * マウスホイールハンドラを解除
   */
  private removeWheelHandler(): void {
    if (this.wheelHandler) {
      this.scene.input?.off?.('wheel', this.wheelHandler);
      this.wheelHandler = null;
    }
  }
}
