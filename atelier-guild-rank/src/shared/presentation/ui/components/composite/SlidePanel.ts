/**
 * SlidePanel - 右からスライドインする詳細パネル composite
 * Issue #456: UI刷新 Phase 2
 * Issue #470: 閉じるアニメーションと destroy 所有権制御を追加
 */

import { BaseComponent, type BaseComponentOptions } from '@shared/components';
import { Colors, DesignTokens } from '@shared/theme';
import type Phaser from 'phaser';

export interface SlidePanelOptions extends BaseComponentOptions {
  width?: number;
  height?: number;
}

/**
 * `close()` に渡すオプション。
 * - `animate`: `true` の場合は alpha 1→0 の tween を走らせ、完了時に非表示化する。
 *   既存呼び出しとの互換性のため省略時は従来どおり同期的に `setVisible(false)` する。
 * - `onComplete`: アニメーション完了後に呼ばれるコールバック。`animate=false` の場合は同期的に呼ばれる。
 */
export interface SlidePanelCloseOptions {
  animate?: boolean;
  onComplete?: () => void;
}

export class SlidePanel extends BaseComponent {
  private width: number;
  private height: number;
  private opened = false;
  private bg?: Phaser.GameObjects.Rectangle;
  private tween?: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, x: number, y: number, options: SlidePanelOptions = {}) {
    super(scene, x, y, options);
    this.width = options.width ?? 320;
    this.height = options.height ?? 480;
  }

  create(): void {
    const bg = this.scene.add.rectangle(0, 0, this.width, this.height, Colors.background.dark);
    bg.setStrokeStyle(DesignTokens.border.thin, Colors.border.primary);
    bg.setOrigin(0, 0);
    this.bg = bg;
    this.container.add(bg);
    this.container.setDepth(DesignTokens.zIndex.slidePanel);
    this.container.setVisible(false);
  }

  open(): this {
    this.opened = true;
    this.container.setVisible(true);
    this.container.setAlpha(0);
    this.tween?.stop();
    this.tween = this.scene.tweens.add({
      targets: this.container,
      alpha: { from: 0, to: 1 },
      duration: DesignTokens.motion.duration.base,
      ease: DesignTokens.motion.easing.decelerate,
    }) as Phaser.Tweens.Tween | undefined;
    return this;
  }

  /**
   * SlidePanel を閉じる。
   *
   * - `options.animate === true` の場合、alpha 1→0 の tween を発行し、完了時に非表示化して `onComplete` を呼ぶ。
   * - それ以外は従来どおり同期的に `setVisible(false)` し、即座に `onComplete` を呼ぶ。
   *
   * Issue #470: QuestDetailModal 合成時にオーバーレイの tween と同期させるため animate オプションを追加した。
   */
  close(options: SlidePanelCloseOptions = {}): this {
    this.opened = false;
    this.tween?.stop();

    if (!options.animate) {
      this.container.setVisible(false);
      options.onComplete?.();
      return this;
    }

    this.tween = this.scene.tweens.add({
      targets: this.container,
      alpha: { from: 1, to: 0 },
      duration: DesignTokens.motion.duration.base,
      ease: DesignTokens.motion.easing.accelerate,
      onComplete: () => {
        this.container.setVisible(false);
        options.onComplete?.();
      },
    }) as Phaser.Tweens.Tween | undefined;

    return this;
  }

  isOpen(): boolean {
    return this.opened;
  }

  /**
   * コンテンツコンテナを取得する。
   * SlidePanel を合成して使う詳細パネル実装から、子 GameObject を追加するために公開する。
   */
  getContentContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  /**
   * 子 GameObject を SlidePanel のコンテナに追加する。
   */
  addContent(child: Phaser.GameObjects.GameObject): this {
    this.container.add(child);
    return this;
  }

  /**
   * SlidePanel を破棄する。
   *
   * @param destroyContainer - `true`（既定）の場合は内部コンテナも破棄する。
   *   合成先（親コンテナ）が先に container を破棄している場合は `false` を渡して二重破棄を避ける。
   *
   * Issue #470: QuestDetailModal と合成した場合に `parent.container.destroy(true)` で
   * SlidePanel の container まで連鎖破棄されるため、呼び出し側がコンテナ破棄を所有する経路を設ける。
   */
  destroy(destroyContainer = true): void {
    this.tween?.stop();
    this.tween = undefined;

    if (destroyContainer) {
      this.bg?.destroy();
      this.container.destroy(true);
    }

    this.bg = undefined;
  }
}
