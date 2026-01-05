/**
 * アニメーションシステムテスト
 * @description TASK-0135 アニメーションシステム
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  AnimationSystem,
  AnimationType,
  AnimationConfig,
  AnimationState,
} from '../../../../src/presentation/systems/AnimationSystem';

describe('AnimationSystem', () => {
  let animationSystem: AnimationSystem;
  let element: HTMLElement;
  let container: HTMLElement;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement('div');
    document.body.appendChild(container);
    element = document.createElement('div');
    container.appendChild(element);
    animationSystem = AnimationSystem.getInstance();
  });

  afterEach(() => {
    animationSystem.cancelAll();
    document.body.removeChild(container);
    vi.useRealTimers();
  });

  describe('フェードインアニメーション', () => {
    it('フェードインアニメーションを実行できる', () => {
      // Arrange & Act
      const promise = animationSystem.fadeIn(element, { duration: 300 });

      // Assert - アニメーションが開始されている
      expect(animationSystem.isAnimating(element)).toBe(true);
      expect(element.style.opacity).toBe('0');

      // Cleanup - 同期的にキャンセルし、Promiseはcatchで処理
      animationSystem.cancel(element);
      promise.catch(() => {}); // rejectを適切に処理（awaitしない）
    });

    it('フェードイン開始時にopacityが0から始まる', () => {
      // Arrange
      element.style.opacity = '1';

      // Act
      const promise = animationSystem.fadeIn(element, { duration: 300 });

      // Assert
      expect(element.style.opacity).toBe('0');

      // Cleanup
      animationSystem.cancel(element);
      promise.catch(() => {}); // rejectを適切に処理（awaitしない）
    });
  });

  describe('フェードアウトアニメーション', () => {
    it('フェードアウトアニメーションを実行できる', () => {
      // Arrange & Act
      const promise = animationSystem.fadeOut(element, { duration: 300 });

      // Assert
      expect(animationSystem.isAnimating(element)).toBe(true);
      expect(element.style.opacity).toBe('1');

      // Cleanup
      animationSystem.cancel(element);
      promise.catch(() => {}); // rejectを適切に処理
    });

    it('フェードアウト開始時にopacityが1から始まる', () => {
      // Arrange
      element.style.opacity = '0';

      // Act
      const promise = animationSystem.fadeOut(element, { duration: 300 });

      // Assert
      expect(element.style.opacity).toBe('1');

      // Cleanup
      animationSystem.cancel(element);
      promise.catch(() => {}); // rejectを適切に処理
    });
  });

  describe('スライドアニメーション', () => {
    it('スライドインアニメーションを実行できる', () => {
      // Arrange & Act
      const promise = animationSystem.slideIn(element, {
        duration: 300,
        direction: 'left',
      });

      // Assert
      expect(animationSystem.isAnimating(element)).toBe(true);
      expect(element.style.transform).toContain('translateX');

      // Cleanup
      animationSystem.cancel(element);
      promise.catch(() => {}); // rejectを適切に処理
    });

    it('スライドアウトアニメーションを実行できる', () => {
      // Arrange & Act
      const promise = animationSystem.slideOut(element, {
        duration: 300,
        direction: 'right',
        distance: 100,
      });

      // Assert
      expect(animationSystem.isAnimating(element)).toBe(true);
      expect(element.style.transform).toContain('translateX');

      // Cleanup
      animationSystem.cancel(element);
      promise.catch(() => {}); // rejectを適切に処理
    });

    it('上方向へのスライドを実行できる', () => {
      // Arrange & Act
      const promise = animationSystem.slideIn(element, {
        duration: 300,
        direction: 'up',
      });

      // Assert
      expect(animationSystem.isAnimating(element)).toBe(true);
      expect(element.style.transform).toContain('translateY');

      // Cleanup
      animationSystem.cancel(element);
      promise.catch(() => {}); // rejectを適切に処理
    });
  });

  describe('スケールアニメーション', () => {
    it('スケールアニメーションを実行できる', () => {
      // Arrange & Act
      const promise = animationSystem.scale(element, {
        duration: 300,
        from: 1,
        to: 1.2,
      });

      // Assert
      expect(animationSystem.isAnimating(element)).toBe(true);
      expect(element.style.transform).toContain('scale(1)');

      // Cleanup
      animationSystem.cancel(element);
      promise.catch(() => {}); // rejectを適切に処理
    });

    it('スケールダウンアニメーションを実行できる', () => {
      // Arrange & Act
      const promise = animationSystem.scale(element, {
        duration: 300,
        from: 1,
        to: 0.8,
      });

      // Assert
      expect(animationSystem.isAnimating(element)).toBe(true);
      expect(element.style.transform).toContain('scale(1)');

      // Cleanup
      animationSystem.cancel(element);
      promise.catch(() => {}); // rejectを適切に処理
    });
  });

  describe('シェイクアニメーション', () => {
    it('シェイクアニメーションを実行できる', () => {
      // Arrange & Act
      const promise = animationSystem.shake(element, {
        duration: 300,
        intensity: 5,
      });

      // Assert
      expect(animationSystem.isAnimating(element)).toBe(true);

      // Cleanup
      animationSystem.cancel(element);
      promise.catch(() => {}); // rejectを適切に処理
    });
  });

  describe('アニメーション完了待機', () => {
    it('アニメーション完了を待機できる', async () => {
      // Arrange
      const promise = animationSystem.fadeIn(element, { duration: 100 });

      // Assert
      expect(animationSystem.isAnimating(element)).toBe(true);

      // Act - タイマーを進めて完了を待機
      await vi.advanceTimersByTimeAsync(150);

      // Assert - 完了
      expect(animationSystem.isAnimating(element)).toBe(false);
      expect(element.style.opacity).toBe('1');
    });
  });

  describe('アニメーションキャンセル', () => {
    it('アニメーションをキャンセルできる', () => {
      // Arrange
      element.style.opacity = '0';
      const promise = animationSystem.fadeIn(element, { duration: 500 });

      // Act
      animationSystem.cancel(element);

      // Assert
      expect(animationSystem.isAnimating(element)).toBe(false);

      // Cleanup
      promise.catch(() => {});
    });

    it('キャンセル後にPromiseがrejectされる', async () => {
      // Arrange
      const promise = animationSystem.fadeIn(element, { duration: 500 });

      // Act
      animationSystem.cancel(element);

      // Assert
      await expect(promise).rejects.toThrow('Animation cancelled');
    });
  });

  describe('複数アニメーション連鎖', () => {
    it('複数アニメーションを連鎖できる', async () => {
      // Arrange
      const results: string[] = [];

      // Act
      const sequencePromise = animationSystem.sequence([
        async () => {
          results.push('first');
          await animationSystem.fadeIn(element, { duration: 50 });
        },
        async () => {
          results.push('second');
          await animationSystem.fadeOut(element, { duration: 50 });
        },
        async () => {
          results.push('third');
          await animationSystem.fadeIn(element, { duration: 50 });
        },
      ]);

      // タイマーを進めてすべてのアニメーションを完了
      await vi.advanceTimersByTimeAsync(200);

      // Assert
      expect(results).toEqual(['first', 'second', 'third']);
    });

    it('並列アニメーションを実行できる', async () => {
      // Arrange
      const element2 = document.createElement('div');
      container.appendChild(element2);

      // Act
      const promise = animationSystem.parallel([
        animationSystem.fadeIn(element, { duration: 50 }),
        animationSystem.fadeIn(element2, { duration: 50 }),
      ]);

      // タイマーを進めて完了を待機
      await vi.advanceTimersByTimeAsync(100);

      // Assert
      expect(element.style.opacity).toBe('1');
      expect(element2.style.opacity).toBe('1');
    });
  });

  describe('イージング関数', () => {
    it('linear イージングを適用できる', () => {
      // Arrange & Act
      const promise = animationSystem.fadeIn(element, {
        duration: 300,
        easing: 'linear',
      });

      // Assert
      expect(animationSystem.isAnimating(element)).toBe(true);

      // Cleanup
      animationSystem.cancel(element);
      promise.catch(() => {}); // rejectを適切に処理
    });

    it('easeInOut イージングを適用できる', () => {
      // Arrange & Act
      const promise = animationSystem.fadeIn(element, {
        duration: 300,
        easing: 'easeInOut',
      });

      // Assert
      expect(animationSystem.isAnimating(element)).toBe(true);

      // Cleanup
      animationSystem.cancel(element);
      promise.catch(() => {}); // rejectを適切に処理
    });
  });

  describe('カウントアップアニメーション', () => {
    it('数値をカウントアップできる', async () => {
      // Arrange
      const values: number[] = [];
      const onUpdate = (value: number) => values.push(value);

      // Act
      const promise = animationSystem.countUp({
        from: 0,
        to: 100,
        duration: 100,
        onUpdate,
      });

      // タイマーを進めて完了を待機
      await vi.advanceTimersByTimeAsync(150);

      // Assert
      expect(values.length).toBeGreaterThan(0);
      expect(values[values.length - 1]).toBe(100);
    });
  });

  describe('シングルトン', () => {
    it('シングルトンインスタンスを取得できる', () => {
      // Act
      const instance1 = AnimationSystem.getInstance();
      const instance2 = AnimationSystem.getInstance();

      // Assert
      expect(instance1).toBe(instance2);
    });
  });

  describe('cancelAll', () => {
    it('全てのアニメーションをキャンセルできる', () => {
      // Arrange
      const element2 = document.createElement('div');
      container.appendChild(element2);

      const promise1 = animationSystem.fadeIn(element, { duration: 500 });
      const promise2 = animationSystem.fadeIn(element2, { duration: 500 });

      expect(animationSystem.isAnimating(element)).toBe(true);
      expect(animationSystem.isAnimating(element2)).toBe(true);

      // Act
      animationSystem.cancelAll();

      // Assert
      expect(animationSystem.isAnimating(element)).toBe(false);
      expect(animationSystem.isAnimating(element2)).toBe(false);

      // Cleanup - rejectを適切に処理
      promise1.catch(() => {});
      promise2.catch(() => {});
    });
  });
});
