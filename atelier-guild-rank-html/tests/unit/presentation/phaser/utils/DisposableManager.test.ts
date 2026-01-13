import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  DisposableManager,
  IDisposable,
} from '@/presentation/phaser/utils/DisposableManager';

describe('DisposableManager', () => {
  let manager: DisposableManager;

  beforeEach(() => {
    manager = new DisposableManager();
  });

  describe('register', () => {
    it('破棄可能オブジェクトを登録できる', () => {
      const disposable: IDisposable = { dispose: vi.fn() };

      manager.register(disposable);

      expect(manager.count).toBe(1);
    });

    it('複数の破棄可能オブジェクトを登録できる', () => {
      const disposable1: IDisposable = { dispose: vi.fn() };
      const disposable2: IDisposable = { dispose: vi.fn() };

      manager.register(disposable1);
      manager.register(disposable2);

      expect(manager.count).toBe(2);
    });

    it('破棄済みの場合は登録と同時に破棄される', () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const disposable: IDisposable = { dispose: vi.fn() };

      manager.dispose();
      manager.register(disposable);

      expect(disposable.dispose).toHaveBeenCalled();
      expect(manager.count).toBe(0);
      consoleWarn.mockRestore();
    });
  });

  describe('onCleanup', () => {
    it('クリーンアップコールバックを登録できる', () => {
      const callback = vi.fn();

      manager.onCleanup(callback);

      expect(manager.callbackCount).toBe(1);
    });

    it('破棄済みの場合はコールバックが即時実行される', () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const callback = vi.fn();

      manager.dispose();
      manager.onCleanup(callback);

      expect(callback).toHaveBeenCalled();
      consoleWarn.mockRestore();
    });
  });

  describe('unregister', () => {
    it('登録済みオブジェクトを解除できる', () => {
      const disposable: IDisposable = { dispose: vi.fn() };

      manager.register(disposable);
      manager.unregister(disposable);

      expect(manager.count).toBe(0);
    });
  });

  describe('dispose', () => {
    it('全ての登録オブジェクトのdisposeを呼び出す', () => {
      const disposable1: IDisposable = { dispose: vi.fn() };
      const disposable2: IDisposable = { dispose: vi.fn() };

      manager.register(disposable1);
      manager.register(disposable2);
      manager.dispose();

      expect(disposable1.dispose).toHaveBeenCalled();
      expect(disposable2.dispose).toHaveBeenCalled();
    });

    it('クリーンアップコールバックを実行する', () => {
      const callback = vi.fn();

      manager.onCleanup(callback);
      manager.dispose();

      expect(callback).toHaveBeenCalled();
    });

    it('逆順で破棄される（LIFO）', () => {
      const order: number[] = [];
      const disposable1: IDisposable = {
        dispose: () => order.push(1),
      };
      const disposable2: IDisposable = {
        dispose: () => order.push(2),
      };

      manager.register(disposable1);
      manager.register(disposable2);
      manager.dispose();

      expect(order).toEqual([2, 1]);
    });

    it('二重破棄を防ぐ', () => {
      const disposable: IDisposable = { dispose: vi.fn() };

      manager.register(disposable);
      manager.dispose();
      manager.dispose();

      expect(disposable.dispose).toHaveBeenCalledTimes(1);
    });

    it('dispose時にエラーが発生しても他のオブジェクトを破棄する', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const disposable1: IDisposable = {
        dispose: () => {
          throw new Error('Test error');
        },
      };
      const disposable2: IDisposable = { dispose: vi.fn() };

      manager.register(disposable1);
      manager.register(disposable2);
      manager.dispose();

      expect(disposable2.dispose).toHaveBeenCalled();
      consoleError.mockRestore();
    });

    it('破棄後はdisposedがtrueになる', () => {
      expect(manager.disposed).toBe(false);

      manager.dispose();

      expect(manager.disposed).toBe(true);
    });
  });
});
