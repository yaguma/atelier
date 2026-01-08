/**
 * DialogManager テスト
 *
 * ダイアログマネージャーのテストを行う。
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DialogManager } from '@game/managers/DialogManager';

describe('DialogManager', () => {
  let mockScene: any;
  let mockUIFactory: any;
  let mockDialog: any;
  let mockClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // 毎回インスタンスをリセット
    DialogManager.resetInstance();

    mockScene = {
      add: {
        rectangle: vi.fn().mockReturnValue({
          setInteractive: vi.fn().mockReturnThis(),
          setDepth: vi.fn().mockReturnThis(),
          on: vi.fn().mockReturnThis(),
          destroy: vi.fn(),
        }),
        text: vi.fn().mockReturnValue({
          setOrigin: vi.fn().mockReturnThis(),
        }),
      },
      cameras: {
        main: { centerX: 640, centerY: 360, width: 1280, height: 720 },
      },
      input: {
        keyboard: {
          once: vi.fn(),
          off: vi.fn(),
        },
      },
    };

    mockDialog = {
      layout: vi.fn().mockReturnThis(),
      setDepth: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
    };

    mockClose = vi.fn();

    mockUIFactory = {
      createDialog: vi.fn().mockReturnValue({
        dialog: mockDialog,
        close: mockClose,
      }),
    };
  });

  afterEach(() => {
    DialogManager.resetInstance();
  });

  describe('シングルトン', () => {
    it('getInstance()でインスタンスを取得できる', () => {
      const instance1 = DialogManager.getInstance();
      const instance2 = DialogManager.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('resetInstance()でインスタンスがリセットされる', () => {
      const instance1 = DialogManager.getInstance();
      DialogManager.resetInstance();
      const instance2 = DialogManager.getInstance();

      expect(instance1).not.toBe(instance2);
    });
  });

  describe('コンテキスト設定', () => {
    it('setContext()でシーンとUIFactoryを設定できる', () => {
      const manager = DialogManager.getInstance();
      manager.setContext(mockScene, mockUIFactory);

      // エラーなく設定できることを確認
      expect(manager).toBeDefined();
    });

    it('コンテキスト未設定でshow()を呼ぶとエラーログが出る', async () => {
      const manager = DialogManager.getInstance();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await manager.show({ title: 'Test', content: 'Test' });

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('UIFactory not set'));
      consoleSpy.mockRestore();
    });
  });

  describe('show()', () => {
    it('show()でダイアログを表示できる', async () => {
      const manager = DialogManager.getInstance();
      manager.setContext(mockScene, mockUIFactory);

      // ボタンクリックでPromiseをresolve
      mockUIFactory.createDialog.mockImplementation((options: any) => {
        // ボタンのonClickを即座に呼び出す
        setTimeout(() => {
          options.buttons?.[0]?.onClick();
        }, 0);
        return { dialog: mockDialog, close: mockClose };
      });

      await manager.show({
        title: 'テスト',
        content: 'テスト内容',
        buttons: [{ text: 'OK', onClick: () => {}, primary: true }],
      });

      expect(mockUIFactory.createDialog).toHaveBeenCalled();
    });

    it('ダイアログ表示中にshow()を呼ぶとキューに追加される', () => {
      const manager = DialogManager.getInstance();
      manager.setContext(mockScene, mockUIFactory);

      // 最初のダイアログ
      manager.show({ title: 'Dialog 1', content: 'Content 1' });
      expect(manager.isShowing()).toBe(true);
      expect(manager.getQueueLength()).toBe(0);

      // 2つ目のダイアログ（キューに追加）
      manager.show({ title: 'Dialog 2', content: 'Content 2' });
      expect(manager.getQueueLength()).toBe(1);
      expect(manager.hasQueued()).toBe(true);
    });
  });

  describe('confirm()', () => {
    it('confirm()で確認ダイアログを表示できる', async () => {
      const manager = DialogManager.getInstance();
      manager.setContext(mockScene, mockUIFactory);

      // 確認ボタンをクリック
      mockUIFactory.createDialog.mockImplementation((options: any) => {
        setTimeout(() => {
          // 2番目のボタン（確認）をクリック
          options.buttons?.[1]?.onClick();
        }, 0);
        return { dialog: mockDialog, close: mockClose };
      });

      const result = await manager.confirm('確認', 'よろしいですか？');

      expect(result).toBe(true);
      expect(mockUIFactory.createDialog).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '確認',
          content: 'よろしいですか？',
        })
      );
    });

    it('confirm()でキャンセルするとfalseを返す', async () => {
      const manager = DialogManager.getInstance();
      manager.setContext(mockScene, mockUIFactory);

      // キャンセルボタンをクリック
      mockUIFactory.createDialog.mockImplementation((options: any) => {
        setTimeout(() => {
          // 1番目のボタン（キャンセル）をクリック
          options.buttons?.[0]?.onClick();
        }, 0);
        return { dialog: mockDialog, close: mockClose };
      });

      const result = await manager.confirm('確認', 'よろしいですか？');

      expect(result).toBe(false);
    });

    it('confirm()でカスタムボタンテキストを設定できる', async () => {
      const manager = DialogManager.getInstance();
      manager.setContext(mockScene, mockUIFactory);

      mockUIFactory.createDialog.mockImplementation((options: any) => {
        setTimeout(() => {
          options.buttons?.[1]?.onClick();
        }, 0);
        return { dialog: mockDialog, close: mockClose };
      });

      await manager.confirm('確認', 'よろしいですか？', '削除する', 'やめる');

      expect(mockUIFactory.createDialog).toHaveBeenCalledWith(
        expect.objectContaining({
          buttons: expect.arrayContaining([
            expect.objectContaining({ text: 'やめる' }),
            expect.objectContaining({ text: '削除する' }),
          ]),
        })
      );
    });
  });

  describe('alert()', () => {
    it('alert()でアラートダイアログを表示できる', async () => {
      const manager = DialogManager.getInstance();
      manager.setContext(mockScene, mockUIFactory);

      mockUIFactory.createDialog.mockImplementation((options: any) => {
        setTimeout(() => {
          options.buttons?.[0]?.onClick();
        }, 0);
        return { dialog: mockDialog, close: mockClose };
      });

      await manager.alert('お知らせ', '処理が完了しました');

      expect(mockUIFactory.createDialog).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'お知らせ',
          content: '処理が完了しました',
        })
      );
    });

    it('alert()でカスタムボタンテキストを設定できる', async () => {
      const manager = DialogManager.getInstance();
      manager.setContext(mockScene, mockUIFactory);

      mockUIFactory.createDialog.mockImplementation((options: any) => {
        setTimeout(() => {
          options.buttons?.[0]?.onClick();
        }, 0);
        return { dialog: mockDialog, close: mockClose };
      });

      await manager.alert('情報', 'メッセージ', '了解');

      expect(mockUIFactory.createDialog).toHaveBeenCalledWith(
        expect.objectContaining({
          buttons: expect.arrayContaining([
            expect.objectContaining({ text: '了解' }),
          ]),
        })
      );
    });
  });

  describe('close()', () => {
    it('close()で現在のダイアログを閉じる', () => {
      const manager = DialogManager.getInstance();
      manager.setContext(mockScene, mockUIFactory);

      manager.show({ title: 'Test', content: 'Test' });
      expect(manager.isShowing()).toBe(true);

      manager.close();
      expect(mockClose).toHaveBeenCalled();
    });

    it('close()でキューの次のダイアログが表示される', () => {
      const manager = DialogManager.getInstance();
      manager.setContext(mockScene, mockUIFactory);

      // 2つのダイアログを追加
      manager.show({ title: 'Dialog 1', content: 'Content 1' });
      manager.show({ title: 'Dialog 2', content: 'Content 2' });
      expect(manager.getQueueLength()).toBe(1);

      // 最初のダイアログを閉じる
      manager.close();

      // 2つ目のダイアログが表示される
      expect(mockUIFactory.createDialog).toHaveBeenCalledTimes(2);
      expect(manager.getQueueLength()).toBe(0);
    });
  });

  describe('closeAll()', () => {
    it('closeAll()ですべてのダイアログを閉じる', () => {
      const manager = DialogManager.getInstance();
      manager.setContext(mockScene, mockUIFactory);

      // ダイアログとキューを追加
      manager.show({ title: 'Dialog 1', content: 'Content 1' });
      manager.show({ title: 'Dialog 2', content: 'Content 2' });
      manager.show({ title: 'Dialog 3', content: 'Content 3' });

      expect(manager.isShowing()).toBe(true);
      expect(manager.getQueueLength()).toBe(2);

      manager.closeAll();

      expect(mockClose).toHaveBeenCalled();
      expect(manager.isShowing()).toBe(false);
      expect(manager.hasQueued()).toBe(false);
      expect(manager.getQueueLength()).toBe(0);
    });
  });

  describe('状態確認メソッド', () => {
    it('isShowing()でダイアログ表示状態を確認できる', () => {
      const manager = DialogManager.getInstance();
      manager.setContext(mockScene, mockUIFactory);

      expect(manager.isShowing()).toBe(false);

      manager.show({ title: 'Test', content: 'Test' });
      expect(manager.isShowing()).toBe(true);

      manager.close();
      expect(manager.isShowing()).toBe(false);
    });

    it('hasQueued()でキュー状態を確認できる', () => {
      const manager = DialogManager.getInstance();
      manager.setContext(mockScene, mockUIFactory);

      expect(manager.hasQueued()).toBe(false);

      manager.show({ title: 'Dialog 1', content: 'Content 1' });
      manager.show({ title: 'Dialog 2', content: 'Content 2' });

      expect(manager.hasQueued()).toBe(true);
    });

    it('getQueueLength()でキュー内のダイアログ数を取得できる', () => {
      const manager = DialogManager.getInstance();
      manager.setContext(mockScene, mockUIFactory);

      expect(manager.getQueueLength()).toBe(0);

      manager.show({ title: 'Dialog 1', content: 'Content 1' });
      expect(manager.getQueueLength()).toBe(0);

      manager.show({ title: 'Dialog 2', content: 'Content 2' });
      expect(manager.getQueueLength()).toBe(1);

      manager.show({ title: 'Dialog 3', content: 'Content 3' });
      expect(manager.getQueueLength()).toBe(2);
    });
  });
});
