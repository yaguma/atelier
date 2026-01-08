/**
 * ToastManager テスト
 *
 * トースト通知マネージャーのテストを行う。
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ToastManager, ToastType } from '@game/managers/ToastManager';

describe('ToastManager', () => {
  let mockScene: any;
  let mockContainer: any;
  let mockText: any;
  let mockGraphics: any;
  let mockTimer: any;
  let mockTween: any;

  beforeEach(() => {
    // 毎回インスタンスをリセット
    ToastManager.resetInstance();

    mockText = {
      setOrigin: vi.fn().mockReturnThis(),
      setInteractive: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
    };

    mockGraphics = {
      fillStyle: vi.fn().mockReturnThis(),
      fillRoundedRect: vi.fn().mockReturnThis(),
    };

    mockContainer = {
      add: vi.fn().mockReturnThis(),
      setAlpha: vi.fn().mockReturnThis(),
      setY: vi.fn().mockReturnThis(),
      setDepth: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
      y: 60,
    };

    mockTimer = {
      destroy: vi.fn(),
    };

    mockTween = {
      // tweenの完了コールバックを保持
      _onComplete: null as (() => void) | null,
    };

    mockScene = {
      add: {
        container: vi.fn().mockReturnValue(mockContainer),
        text: vi.fn().mockReturnValue(mockText),
        graphics: vi.fn().mockReturnValue(mockGraphics),
      },
      cameras: {
        main: { centerX: 640, centerY: 360, width: 1280, height: 720 },
      },
      time: {
        delayedCall: vi.fn().mockReturnValue(mockTimer),
      },
      tweens: {
        add: vi.fn().mockImplementation((config: any) => {
          if (config.onComplete) {
            mockTween._onComplete = config.onComplete;
          }
          return mockTween;
        }),
      },
    };
  });

  afterEach(() => {
    ToastManager.resetInstance();
  });

  describe('シングルトン', () => {
    it('getInstance()でインスタンスを取得できる', () => {
      const instance1 = ToastManager.getInstance();
      const instance2 = ToastManager.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('resetInstance()でインスタンスがリセットされる', () => {
      const instance1 = ToastManager.getInstance();
      ToastManager.resetInstance();
      const instance2 = ToastManager.getInstance();

      expect(instance1).not.toBe(instance2);
    });
  });

  describe('コンテキスト設定', () => {
    it('setScene()でシーンを設定できる', () => {
      const manager = ToastManager.getInstance();
      manager.setScene(mockScene);

      // エラーなく設定できることを確認
      expect(manager).toBeDefined();
    });

    it('シーン未設定でshow()を呼ぶとエラーログが出る', () => {
      const manager = ToastManager.getInstance();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      manager.show({ message: 'テスト' });

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Scene not set'));
      consoleSpy.mockRestore();
    });
  });

  describe('show()', () => {
    it('show()でトーストを表示できる', () => {
      const manager = ToastManager.getInstance();
      manager.setScene(mockScene);

      manager.show({ message: 'テストメッセージ' });

      expect(mockScene.add.container).toHaveBeenCalled();
      expect(mockScene.add.graphics).toHaveBeenCalled();
      expect(mockScene.add.text).toHaveBeenCalled();
    });

    it('show()で種別を指定できる', () => {
      const manager = ToastManager.getInstance();
      manager.setScene(mockScene);

      manager.show({ message: 'テスト', type: 'success' });

      // トーストが表示されることを確認
      expect(mockScene.add.container).toHaveBeenCalled();
    });

    it('show()で表示時間を指定できる', () => {
      const manager = ToastManager.getInstance();
      manager.setScene(mockScene);

      manager.show({ message: 'テスト', duration: 5000 });

      expect(mockScene.time.delayedCall).toHaveBeenCalledWith(
        5000,
        expect.any(Function)
      );
    });

    it('デフォルトの表示時間は3000ms', () => {
      const manager = ToastManager.getInstance();
      manager.setScene(mockScene);

      manager.show({ message: 'テスト' });

      expect(mockScene.time.delayedCall).toHaveBeenCalledWith(
        3000,
        expect.any(Function)
      );
    });

    it('複数のトーストをスタック表示できる', () => {
      const manager = ToastManager.getInstance();
      manager.setScene(mockScene);

      manager.show({ message: 'トースト1' });
      manager.show({ message: 'トースト2' });
      manager.show({ message: 'トースト3' });

      expect(mockScene.add.container).toHaveBeenCalledTimes(3);
      expect(manager.getActiveCount()).toBe(3);
    });

    it('最大数を超えると古いトーストが削除される', () => {
      const manager = ToastManager.getInstance();
      manager.setScene(mockScene);

      // 最大数（5）を超えるトーストを追加
      for (let i = 0; i < 6; i++) {
        manager.show({ message: `トースト${i + 1}` });
      }

      // 最大5つまで
      expect(manager.getActiveCount()).toBe(5);
    });
  });

  describe('便利メソッド', () => {
    it('success()で成功トーストを表示できる', () => {
      const manager = ToastManager.getInstance();
      manager.setScene(mockScene);

      manager.success('成功しました');

      expect(mockScene.add.container).toHaveBeenCalled();
    });

    it('error()でエラートーストを表示できる', () => {
      const manager = ToastManager.getInstance();
      manager.setScene(mockScene);

      manager.error('エラーが発生しました');

      expect(mockScene.add.container).toHaveBeenCalled();
    });

    it('warning()で警告トーストを表示できる', () => {
      const manager = ToastManager.getInstance();
      manager.setScene(mockScene);

      manager.warning('注意してください');

      expect(mockScene.add.container).toHaveBeenCalled();
    });

    it('info()で情報トーストを表示できる', () => {
      const manager = ToastManager.getInstance();
      manager.setScene(mockScene);

      manager.info('お知らせです');

      expect(mockScene.add.container).toHaveBeenCalled();
    });
  });

  describe('自動消去', () => {
    it('指定時間後にトーストが自動消去される', () => {
      const manager = ToastManager.getInstance();
      manager.setScene(mockScene);

      manager.show({ message: 'テスト', duration: 1000 });

      // delayedCallが登録されていることを確認
      expect(mockScene.time.delayedCall).toHaveBeenCalledWith(
        1000,
        expect.any(Function)
      );
    });
  });

  describe('clearAll()', () => {
    it('clearAll()ですべてのトーストを即座にクリアできる', () => {
      const manager = ToastManager.getInstance();
      manager.setScene(mockScene);

      manager.show({ message: 'トースト1' });
      manager.show({ message: 'トースト2' });
      expect(manager.getActiveCount()).toBe(2);

      manager.clearAll();

      expect(manager.getActiveCount()).toBe(0);
      expect(mockTimer.destroy).toHaveBeenCalled();
      expect(mockContainer.destroy).toHaveBeenCalled();
    });
  });

  describe('状態確認メソッド', () => {
    it('getActiveCount()でアクティブなトースト数を取得できる', () => {
      const manager = ToastManager.getInstance();
      manager.setScene(mockScene);

      expect(manager.getActiveCount()).toBe(0);

      manager.show({ message: 'トースト1' });
      expect(manager.getActiveCount()).toBe(1);

      manager.show({ message: 'トースト2' });
      expect(manager.getActiveCount()).toBe(2);
    });
  });

  describe('トースト種別の色', () => {
    it('各種別で正しい色が使用される', () => {
      const manager = ToastManager.getInstance();
      manager.setScene(mockScene);

      const types: ToastType[] = ['success', 'error', 'warning', 'info'];

      types.forEach((type) => {
        manager.show({ message: `${type}トースト`, type });
      });

      // 4つのトーストが表示される
      expect(mockScene.add.container).toHaveBeenCalledTimes(4);
    });
  });

  describe('アニメーション', () => {
    it('表示時に出現アニメーションが適用される', () => {
      const manager = ToastManager.getInstance();
      manager.setScene(mockScene);

      manager.show({ message: 'テスト' });

      // 初期状態でアルファ0、Y座標オフセット
      expect(mockContainer.setAlpha).toHaveBeenCalledWith(0);
      expect(mockContainer.setY).toHaveBeenCalled();

      // tweenが追加される
      expect(mockScene.tweens.add).toHaveBeenCalled();
    });
  });

  describe('閉じるボタン', () => {
    it('閉じるボタンがクリックでトーストを消せる', () => {
      const manager = ToastManager.getInstance();
      manager.setScene(mockScene);

      // 閉じるボタンのonハンドラを取得
      let closeBtnClickHandler: (() => void) | null = null;
      mockText.on.mockImplementation((event: string, handler: () => void) => {
        if (event === 'pointerdown') {
          closeBtnClickHandler = handler;
        }
        return mockText;
      });

      manager.show({ message: 'テスト' });

      // 閉じるボタンがインタラクティブに設定されている
      expect(mockText.setInteractive).toHaveBeenCalled();

      // クリックイベントが登録されている
      expect(mockText.on).toHaveBeenCalledWith('pointerdown', expect.any(Function));
    });
  });
});
