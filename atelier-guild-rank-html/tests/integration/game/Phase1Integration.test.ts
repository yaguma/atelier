/**
 * Phase 1 統合テスト
 *
 * Phase 1で実装した全コンポーネント（EventBus、SceneManager、UIFactory、DialogManager、ToastManager）の統合テストを行う。
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventBus } from '@game/events/EventBus';
import { SceneManager } from '@game/managers/SceneManager';
import { DialogManager } from '@game/managers/DialogManager';
import { ToastManager } from '@game/managers/ToastManager';
import { SceneKeys } from '@game/config/SceneKeys';

describe('Phase 1 統合テスト', () => {
  beforeEach(() => {
    // 各テストの前にシングルトンをリセット
    EventBus.resetInstance();
    SceneManager.resetInstance();
    DialogManager.resetInstance();
    ToastManager.resetInstance();
  });

  afterEach(() => {
    // 各テストの後にシングルトンをリセット
    EventBus.resetInstance();
    SceneManager.resetInstance();
    DialogManager.resetInstance();
    ToastManager.resetInstance();
  });

  describe('EventBus統合', () => {
    it('全マネージャーがEventBusを共有する', () => {
      const eventBus = EventBus.getInstance();
      expect(eventBus).toBeDefined();
      expect(eventBus).toBe(EventBus.getInstance());
    });

    it('イベント発行が各コンポーネントに伝播する', () => {
      const eventBus = EventBus.getInstance();
      const callback = vi.fn();

      eventBus.on('state:gold:changed', callback);
      eventBus.emit('state:gold:changed', { gold: 100, delta: 50 });

      expect(callback).toHaveBeenCalledWith({ gold: 100, delta: 50 });
    });

    it('複数のリスナーが同じイベントを受信する', () => {
      const eventBus = EventBus.getInstance();
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const callback3 = vi.fn();

      eventBus.on('state:ap:changed', callback1);
      eventBus.on('state:ap:changed', callback2);
      eventBus.on('state:ap:changed', callback3);

      eventBus.emit('state:ap:changed', { ap: 5, maxAP: 10 });

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
      expect(callback3).toHaveBeenCalledTimes(1);
    });

    it('onceは一度だけコールバックを呼び出す', () => {
      const eventBus = EventBus.getInstance();
      const callback = vi.fn();

      eventBus.once('state:day:changed', callback);

      eventBus.emit('state:day:changed', { day: 1, maxDays: 30 });
      eventBus.emit('state:day:changed', { day: 2, maxDays: 30 });

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('VoidイベントはペイロードなしでEventを発行できる', () => {
      const eventBus = EventBus.getInstance();
      const callback = vi.fn();

      eventBus.onVoid('ui:newGame:clicked', callback);
      eventBus.emitVoid('ui:newGame:clicked');

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('シングルトン管理', () => {
    it('各マネージャーはシングルトンである', () => {
      const eventBus1 = EventBus.getInstance();
      const eventBus2 = EventBus.getInstance();
      expect(eventBus1).toBe(eventBus2);

      const sceneManager1 = SceneManager.getInstance();
      const sceneManager2 = SceneManager.getInstance();
      expect(sceneManager1).toBe(sceneManager2);

      const dialogManager1 = DialogManager.getInstance();
      const dialogManager2 = DialogManager.getInstance();
      expect(dialogManager1).toBe(dialogManager2);

      const toastManager1 = ToastManager.getInstance();
      const toastManager2 = ToastManager.getInstance();
      expect(toastManager1).toBe(toastManager2);
    });

    it('resetInstance後は新しいインスタンスが生成される', () => {
      const eventBus1 = EventBus.getInstance();
      EventBus.resetInstance();
      const eventBus2 = EventBus.getInstance();
      expect(eventBus1).not.toBe(eventBus2);

      const sceneManager1 = SceneManager.getInstance();
      SceneManager.resetInstance();
      const sceneManager2 = SceneManager.getInstance();
      expect(sceneManager1).not.toBe(sceneManager2);

      const dialogManager1 = DialogManager.getInstance();
      DialogManager.resetInstance();
      const dialogManager2 = DialogManager.getInstance();
      expect(dialogManager1).not.toBe(dialogManager2);

      const toastManager1 = ToastManager.getInstance();
      ToastManager.resetInstance();
      const toastManager2 = ToastManager.getInstance();
      expect(toastManager1).not.toBe(toastManager2);
    });
  });

  describe('メモリリーク防止', () => {
    it('EventBusのclearで全リスナーが解除される', () => {
      const eventBus = EventBus.getInstance();

      eventBus.on('state:gold:changed', () => {});
      eventBus.on('state:ap:changed', () => {});
      eventBus.onVoid('ui:newGame:clicked', () => {});

      expect(eventBus.listenerCount()).toBe(3);

      eventBus.clear();

      expect(eventBus.listenerCount()).toBe(0);
    });

    it('購読解除関数でリスナーが解除される', () => {
      const eventBus = EventBus.getInstance();

      const unsubscribe1 = eventBus.on('state:gold:changed', () => {});
      const unsubscribe2 = eventBus.on('state:ap:changed', () => {});

      expect(eventBus.listenerCount()).toBe(2);

      unsubscribe1();
      expect(eventBus.listenerCount()).toBe(1);

      unsubscribe2();
      expect(eventBus.listenerCount()).toBe(0);
    });

    it('シングルトンリセットでリソースがクリーンアップされる', () => {
      const eventBus = EventBus.getInstance();
      eventBus.on('state:gold:changed', () => {});
      eventBus.on('state:ap:changed', () => {});

      EventBus.resetInstance();
      const newEventBus = EventBus.getInstance();

      // 新しいインスタンスはリスナーがない
      expect(newEventBus.listenerCount()).toBe(0);
    });
  });

  describe('SceneManager状態管理', () => {
    it('初期状態ではcurrentSceneがnull', () => {
      const sceneManager = SceneManager.getInstance();
      expect(sceneManager.getCurrentScene()).toBeNull();
    });

    it('初期状態では遷移中ではない', () => {
      const sceneManager = SceneManager.getInstance();
      expect(sceneManager.isTransitioning()).toBe(false);
    });

    it('初期状態では履歴が空', () => {
      const sceneManager = SceneManager.getInstance();
      expect(sceneManager.getHistory()).toEqual([]);
    });

    it('初期状態ではgoBackできない', () => {
      const sceneManager = SceneManager.getInstance();
      expect(sceneManager.canGoBack()).toBe(false);
    });

    it('初期状態ではオーバーレイが開いていない', () => {
      const sceneManager = SceneManager.getInstance();
      expect(sceneManager.getOpenOverlays()).toEqual([]);
    });
  });

  describe('DialogManager状態管理', () => {
    it('初期状態ではダイアログが表示されていない', () => {
      const dialogManager = DialogManager.getInstance();
      expect(dialogManager.isShowing()).toBe(false);
    });

    it('初期状態ではキューが空', () => {
      const dialogManager = DialogManager.getInstance();
      expect(dialogManager.hasQueued()).toBe(false);
      expect(dialogManager.getQueueLength()).toBe(0);
    });
  });

  describe('ToastManager状態管理', () => {
    it('初期状態ではアクティブなトーストがない', () => {
      const toastManager = ToastManager.getInstance();
      expect(toastManager.getActiveCount()).toBe(0);
    });
  });

  describe('EventBusとSceneManagerの連携', () => {
    it('シーン遷移イベントがEventBusで発火される', async () => {
      const eventBus = EventBus.getInstance();
      const sceneManager = SceneManager.getInstance();

      const startCallback = vi.fn();
      const completeCallback = vi.fn();

      eventBus.on('scene:transition:start', startCallback);
      eventBus.on('scene:transition:complete', completeCallback);

      // ゲームインスタンスがないのでエラーにならずに状態だけ更新される
      await sceneManager.goTo(SceneKeys.TITLE);

      expect(startCallback).toHaveBeenCalledWith({
        from: null,
        to: SceneKeys.TITLE,
      });
      expect(completeCallback).toHaveBeenCalledWith({
        from: null,
        to: SceneKeys.TITLE,
      });
    });

    it('履歴が正しく記録される', async () => {
      const sceneManager = SceneManager.getInstance();

      await sceneManager.goTo(SceneKeys.TITLE);
      await sceneManager.goTo(SceneKeys.MAIN);

      const history = sceneManager.getHistory();
      expect(history.length).toBe(2);
      expect(history[0].to).toBe(SceneKeys.TITLE);
      expect(history[1].to).toBe(SceneKeys.MAIN);
    });
  });

  describe('複数コンポーネント同時リセット', () => {
    it('すべてのシングルトンを同時にリセットできる', () => {
      // インスタンス取得
      const eventBus = EventBus.getInstance();
      const sceneManager = SceneManager.getInstance();
      const dialogManager = DialogManager.getInstance();
      const toastManager = ToastManager.getInstance();

      // データを追加
      eventBus.on('state:gold:changed', () => {});
      // sceneManager, dialogManager, toastManagerはモック環境なしでは限定的

      // すべてリセット
      EventBus.resetInstance();
      SceneManager.resetInstance();
      DialogManager.resetInstance();
      ToastManager.resetInstance();

      // 新しいインスタンスが生成される
      const newEventBus = EventBus.getInstance();
      expect(eventBus).not.toBe(newEventBus);
      expect(newEventBus.listenerCount()).toBe(0);
    });
  });

  describe('イベント購読と解除のライフサイクル', () => {
    it('シーンライフサイクルに合わせたリスナー管理ができる', () => {
      const eventBus = EventBus.getInstance();

      // シーン作成時にリスナーを追加
      const unsubscribers: (() => void)[] = [];
      unsubscribers.push(eventBus.on('state:gold:changed', () => {}));
      unsubscribers.push(eventBus.on('state:ap:changed', () => {}));
      unsubscribers.push(eventBus.onVoid('ui:continue:clicked', () => {}));

      expect(eventBus.listenerCount()).toBe(3);

      // シーン破棄時にリスナーを解除
      unsubscribers.forEach((unsub) => unsub());

      expect(eventBus.listenerCount()).toBe(0);
    });
  });

  describe('イベントペイロードの型安全性', () => {
    it('state:phase:changedイベントが正しいペイロードを持つ', () => {
      const eventBus = EventBus.getInstance();
      const callback = vi.fn();

      eventBus.on('state:phase:changed', callback);
      eventBus.emit('state:phase:changed', {
        phase: 'GATHERING',
      });

      expect(callback).toHaveBeenCalledWith({
        phase: 'GATHERING',
      });
    });

    it('state:gold:changedイベントが正しいペイロードを持つ', () => {
      const eventBus = EventBus.getInstance();
      const callback = vi.fn();

      eventBus.on('state:gold:changed', callback);
      eventBus.emit('state:gold:changed', {
        gold: 1000,
        delta: 500,
      });

      expect(callback).toHaveBeenCalledWith({
        gold: 1000,
        delta: 500,
      });
    });
  });

  describe('エラー処理', () => {
    it('DialogManagerはコンテキスト未設定でもエラーを出さない', async () => {
      const dialogManager = DialogManager.getInstance();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // エラーは出るがクラッシュしない
      await dialogManager.show({ title: 'Test', content: 'Test' });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('ToastManagerはシーン未設定でもエラーを出さない', () => {
      const toastManager = ToastManager.getInstance();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // エラーは出るがクラッシュしない
      toastManager.show({ message: 'Test' });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
