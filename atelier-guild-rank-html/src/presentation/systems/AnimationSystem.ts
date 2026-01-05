/**
 * アニメーションシステム
 * @description UIアニメーションの統一管理システム
 * @module presentation/systems
 */

/**
 * アニメーションタイプ
 */
export type AnimationType =
  | 'fadeIn'
  | 'fadeOut'
  | 'slideIn'
  | 'slideOut'
  | 'scale'
  | 'shake'
  | 'countUp';

/**
 * イージング関数タイプ
 */
export type EasingType = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';

/**
 * スライド方向
 */
export type SlideDirection = 'left' | 'right' | 'up' | 'down';

/**
 * アニメーション設定
 */
export interface AnimationConfig {
  /** 継続時間（ミリ秒） */
  duration: number;
  /** イージング関数 */
  easing?: EasingType;
  /** 遅延（ミリ秒） */
  delay?: number;
}

/**
 * フェードアニメーション設定
 */
export interface FadeConfig extends AnimationConfig {}

/**
 * スライドアニメーション設定
 */
export interface SlideConfig extends AnimationConfig {
  /** 方向 */
  direction: SlideDirection;
  /** 移動距離 */
  distance?: number;
}

/**
 * スケールアニメーション設定
 */
export interface ScaleConfig extends AnimationConfig {
  /** 開始スケール */
  from: number;
  /** 終了スケール */
  to: number;
}

/**
 * シェイクアニメーション設定
 */
export interface ShakeConfig extends AnimationConfig {
  /** 振幅 */
  intensity: number;
}

/**
 * カウントアップアニメーション設定
 */
export interface CountUpConfig extends AnimationConfig {
  /** 開始値 */
  from: number;
  /** 終了値 */
  to: number;
  /** 更新コールバック */
  onUpdate: (value: number) => void;
}

/**
 * アニメーション状態
 */
export interface AnimationState {
  /** アニメーション中かどうか */
  isAnimating: boolean;
  /** 現在の進捗（0〜1） */
  progress: number;
  /** キャンセルフラグ */
  cancelled: boolean;
}

/**
 * 実行中のアニメーション情報
 */
interface RunningAnimation {
  element: HTMLElement | null;
  state: AnimationState;
  reject: (error: Error) => void;
}

/**
 * アニメーションシステムクラス
 */
export class AnimationSystem {
  /** シングルトンインスタンス */
  private static _instance: AnimationSystem | null = null;

  /** 実行中のアニメーション */
  private _runningAnimations: Map<HTMLElement, RunningAnimation> = new Map();

  private constructor() {}

  /**
   * シングルトンインスタンスを取得
   */
  static getInstance(): AnimationSystem {
    if (!AnimationSystem._instance) {
      AnimationSystem._instance = new AnimationSystem();
    }
    return AnimationSystem._instance;
  }

  /**
   * イージング関数を取得
   */
  private getEasingFunction(
    type: EasingType = 'easeInOut'
  ): (t: number) => number {
    switch (type) {
      case 'linear':
        return (t) => t;
      case 'easeIn':
        return (t) => t * t;
      case 'easeOut':
        return (t) => t * (2 - t);
      case 'easeInOut':
        return (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
      default:
        return (t) => t;
    }
  }

  /**
   * アニメーションを実行
   */
  private animate(
    element: HTMLElement,
    config: AnimationConfig,
    updateFn: (progress: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const duration = config.duration;
      const delay = config.delay || 0;
      const easing = this.getEasingFunction(config.easing);

      const state: AnimationState = {
        isAnimating: true,
        progress: 0,
        cancelled: false,
      };

      this._runningAnimations.set(element, { element, state, reject });

      const tick = () => {
        if (state.cancelled) {
          return;
        }

        const currentTime = Date.now();
        const elapsed = currentTime - startTime - delay;

        if (elapsed < 0) {
          setTimeout(tick, 16);
          return;
        }

        const rawProgress = Math.min(elapsed / duration, 1);
        const easedProgress = easing(rawProgress);

        state.progress = rawProgress;
        updateFn(easedProgress);

        if (rawProgress < 1) {
          setTimeout(tick, 16);
        } else {
          state.isAnimating = false;
          this._runningAnimations.delete(element);
          resolve();
        }
      };

      setTimeout(tick, delay);
    });
  }

  /**
   * フェードインアニメーション
   */
  fadeIn(element: HTMLElement, config: FadeConfig): Promise<void> {
    element.style.opacity = '0';
    return this.animate(element, config, (progress) => {
      element.style.opacity = String(progress);
    });
  }

  /**
   * フェードアウトアニメーション
   */
  fadeOut(element: HTMLElement, config: FadeConfig): Promise<void> {
    element.style.opacity = '1';
    return this.animate(element, config, (progress) => {
      element.style.opacity = String(1 - progress);
    });
  }

  /**
   * スライドインアニメーション
   */
  slideIn(element: HTMLElement, config: SlideConfig): Promise<void> {
    const distance = config.distance || 100;
    const isHorizontal =
      config.direction === 'left' || config.direction === 'right';
    const isNegative =
      config.direction === 'left' || config.direction === 'up';

    const startOffset = isNegative ? -distance : distance;

    if (isHorizontal) {
      element.style.transform = `translateX(${startOffset}px)`;
    } else {
      element.style.transform = `translateY(${startOffset}px)`;
    }

    return this.animate(element, config, (progress) => {
      const currentOffset = startOffset * (1 - progress);
      if (isHorizontal) {
        element.style.transform = `translateX(${currentOffset}px)`;
      } else {
        element.style.transform = `translateY(${currentOffset}px)`;
      }
    });
  }

  /**
   * スライドアウトアニメーション
   */
  slideOut(element: HTMLElement, config: SlideConfig): Promise<void> {
    const distance = config.distance || 100;
    const isHorizontal =
      config.direction === 'left' || config.direction === 'right';
    const isNegative =
      config.direction === 'left' || config.direction === 'up';

    const endOffset = isNegative ? -distance : distance;

    element.style.transform = isHorizontal
      ? 'translateX(0px)'
      : 'translateY(0px)';

    return this.animate(element, config, (progress) => {
      const currentOffset = endOffset * progress;
      if (isHorizontal) {
        element.style.transform = `translateX(${currentOffset}px)`;
      } else {
        element.style.transform = `translateY(${currentOffset}px)`;
      }
    });
  }

  /**
   * スケールアニメーション
   */
  scale(element: HTMLElement, config: ScaleConfig): Promise<void> {
    const { from, to } = config;

    element.style.transform = `scale(${from})`;

    return this.animate(element, config, (progress) => {
      const currentScale = from + (to - from) * progress;
      element.style.transform = `scale(${currentScale})`;
    });
  }

  /**
   * シェイクアニメーション
   */
  shake(element: HTMLElement, config: ShakeConfig): Promise<void> {
    const { intensity } = config;

    return this.animate(element, config, (progress) => {
      // 進捗に応じて振幅を減衰させる
      const decay = 1 - progress;
      const offset = Math.sin(progress * Math.PI * 8) * intensity * decay;
      element.style.transform = `translateX(${offset}px)`;
    });
  }

  /**
   * カウントアップアニメーション
   */
  countUp(config: CountUpConfig): Promise<void> {
    const { from, to, onUpdate, ...animConfig } = config;
    const dummyElement = document.createElement('div');

    return this.animate(dummyElement, animConfig, (progress) => {
      const currentValue = Math.round(from + (to - from) * progress);
      onUpdate(currentValue);
    });
  }

  /**
   * アニメーションをキャンセル
   */
  cancel(element: HTMLElement): void {
    const running = this._runningAnimations.get(element);
    if (running) {
      running.state.cancelled = true;
      running.state.isAnimating = false;
      running.reject(new Error('Animation cancelled'));
      this._runningAnimations.delete(element);
    }
  }

  /**
   * 連続アニメーション
   */
  async sequence(animations: (() => Promise<void>)[]): Promise<void> {
    for (const animation of animations) {
      await animation();
    }
  }

  /**
   * 並列アニメーション
   */
  async parallel(animations: Promise<void>[]): Promise<void> {
    await Promise.all(animations);
  }

  /**
   * 指定要素がアニメーション中かどうか
   */
  isAnimating(element: HTMLElement): boolean {
    const running = this._runningAnimations.get(element);
    return running?.state.isAnimating ?? false;
  }

  /**
   * 全てのアニメーションをキャンセル
   */
  cancelAll(): void {
    for (const [element] of this._runningAnimations) {
      this.cancel(element);
    }
  }
}
