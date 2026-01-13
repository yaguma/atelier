import Phaser from 'phaser';
import { PoolableContainer, ObjectPool, PoolStats } from '../utils/ObjectPool';

/**
 * エフェクトタイプ
 */
export type EffectType = 'sparkle' | 'flash' | 'glow' | 'burst';

/**
 * エフェクト設定
 */
export interface EffectConfig {
  duration?: number;
  color?: number;
  alpha?: number;
  scale?: number;
}

/**
 * プール対応スパークルエフェクト
 */
export class PoolableSparkle extends PoolableContainer {
  private graphics: Phaser.GameObjects.Graphics;
  private particles: Array<{ x: number; y: number; angle: number; speed: number; alpha: number }> = [];
  private timer?: Phaser.Time.TimerEvent;
  private updateEvent?: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);

    this.graphics = scene.add.graphics();
    this.add(this.graphics);
  }

  /**
   * エフェクトを再生
   */
  play(config: EffectConfig = {}): this {
    const {
      duration = 500,
      color = 0xffcc00,
      alpha = 1,
      scale = 1,
    } = config;

    this.setAlpha(alpha);
    this.setScale(scale);

    // パーティクルを生成
    this.particles = [];
    const particleCount = 8;
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: 0,
        y: 0,
        angle: (i / particleCount) * Math.PI * 2,
        speed: 50 + Math.random() * 50,
        alpha: 1,
      });
    }

    // 更新イベント
    this.updateEvent = this.scene.time.addEvent({
      delay: 16,
      callback: () => this.updateParticles(color),
      loop: true,
    });

    // 終了タイマー
    this.timer = this.scene.time.addEvent({
      delay: duration,
      callback: () => this.stop(),
    });

    return this;
  }

  /**
   * パーティクルを更新
   */
  private updateParticles(color: number): void {
    this.graphics.clear();

    this.particles.forEach((p) => {
      p.x += Math.cos(p.angle) * p.speed * 0.016;
      p.y += Math.sin(p.angle) * p.speed * 0.016;
      p.alpha -= 0.02;

      if (p.alpha > 0) {
        this.graphics.fillStyle(color, p.alpha);
        this.graphics.fillCircle(p.x, p.y, 3);
      }
    });
  }

  /**
   * エフェクトを停止
   */
  stop(): void {
    this.timer?.destroy();
    this.updateEvent?.destroy();
    this.timer = undefined;
    this.updateEvent = undefined;
    this.particles = [];
    this.graphics.clear();
  }

  reset(): void {
    this.resetBase();
    this.stop();
  }
}

/**
 * プール対応フラッシュエフェクト
 */
export class PoolableFlash extends PoolableContainer {
  private graphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);

    this.graphics = scene.add.graphics();
    this.add(this.graphics);
  }

  /**
   * フラッシュを再生
   */
  play(config: EffectConfig = {}): this {
    const {
      duration = 200,
      color = 0xffffff,
      alpha = 0.8,
      scale = 1,
    } = config;

    this.setScale(scale);

    // 円形フラッシュを描画
    this.graphics.clear();
    this.graphics.fillStyle(color, alpha);
    this.graphics.fillCircle(0, 0, 50);

    // フェードアウト
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: scale * 1.5,
      scaleY: scale * 1.5,
      duration,
      ease: 'Power2',
      onComplete: () => {
        this.graphics.clear();
      },
    });

    return this;
  }

  reset(): void {
    this.resetBase();
    this.scene.tweens.killTweensOf(this);
    this.graphics.clear();
  }
}

/**
 * プール対応グローエフェクト
 */
export class PoolableGlow extends PoolableContainer {
  private graphics: Phaser.GameObjects.Graphics;
  private glowTween?: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);

    this.graphics = scene.add.graphics();
    this.add(this.graphics);
  }

  /**
   * グローを開始
   */
  play(config: EffectConfig = {}): this {
    const {
      color = 0xffcc00,
      alpha = 0.5,
      scale = 1,
    } = config;

    this.setScale(scale);

    // グラデーション円を描画
    this.graphics.clear();
    for (let i = 5; i > 0; i--) {
      this.graphics.fillStyle(color, alpha * (i / 5) * 0.3);
      this.graphics.fillCircle(0, 0, 30 + i * 10);
    }

    // パルスアニメーション
    this.glowTween = this.scene.tweens.add({
      targets: this,
      scaleX: scale * 1.1,
      scaleY: scale * 1.1,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    return this;
  }

  /**
   * グローを停止
   */
  stop(): void {
    this.glowTween?.stop();
    this.glowTween = undefined;
    this.graphics.clear();
  }

  reset(): void {
    this.resetBase();
    this.stop();
  }
}

/**
 * エフェクトプール管理クラス
 */
export class EffectPoolManager {
  private scene: Phaser.Scene;
  private sparklePool: ObjectPool<PoolableSparkle>;
  private flashPool: ObjectPool<PoolableFlash>;
  private glowPool: ObjectPool<PoolableGlow>;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // スパークルプール
    this.sparklePool = new ObjectPool<PoolableSparkle>({
      scene,
      factory: () => new PoolableSparkle(scene),
      initialSize: 5,
      maxSize: 20,
      autoExpand: true,
    });

    // フラッシュプール
    this.flashPool = new ObjectPool<PoolableFlash>({
      scene,
      factory: () => new PoolableFlash(scene),
      initialSize: 5,
      maxSize: 20,
      autoExpand: true,
    });

    // グロープール
    this.glowPool = new ObjectPool<PoolableGlow>({
      scene,
      factory: () => new PoolableGlow(scene),
      initialSize: 3,
      maxSize: 10,
      autoExpand: true,
    });
  }

  /**
   * スパークルエフェクトを再生
   */
  playSparkle(x: number, y: number, config?: EffectConfig): PoolableSparkle | null {
    const effect = this.sparklePool.acquire();
    if (effect) {
      effect.setPosition(x, y);
      effect.play(config);

      // 自動返却
      const duration = config?.duration ?? 500;
      this.scene.time.delayedCall(duration + 100, () => {
        if (!effect.isPooled()) {
          this.sparklePool.release(effect);
        }
      });
    }
    return effect;
  }

  /**
   * フラッシュエフェクトを再生
   */
  playFlash(x: number, y: number, config?: EffectConfig): PoolableFlash | null {
    const effect = this.flashPool.acquire();
    if (effect) {
      effect.setPosition(x, y);
      effect.play(config);

      // 自動返却
      const duration = config?.duration ?? 200;
      this.scene.time.delayedCall(duration + 100, () => {
        if (!effect.isPooled()) {
          this.flashPool.release(effect);
        }
      });
    }
    return effect;
  }

  /**
   * グローエフェクトを開始
   */
  startGlow(x: number, y: number, config?: EffectConfig): PoolableGlow | null {
    const effect = this.glowPool.acquire();
    if (effect) {
      effect.setPosition(x, y);
      effect.play(config);
    }
    return effect;
  }

  /**
   * グローエフェクトを停止・返却
   */
  stopGlow(effect: PoolableGlow): void {
    effect.stop();
    this.glowPool.release(effect);
  }

  /**
   * 全エフェクトを返却
   */
  releaseAll(): void {
    this.sparklePool.releaseAll();
    this.flashPool.releaseAll();
    this.glowPool.releaseAll();
  }

  /**
   * 統計情報を取得
   */
  getStats(): { sparkle: PoolStats; flash: PoolStats; glow: PoolStats } {
    return {
      sparkle: this.sparklePool.getStats(),
      flash: this.flashPool.getStats(),
      glow: this.glowPool.getStats(),
    };
  }

  /**
   * 破棄
   */
  destroy(): void {
    this.sparklePool.destroy();
    this.flashPool.destroy();
    this.glowPool.destroy();
  }
}
