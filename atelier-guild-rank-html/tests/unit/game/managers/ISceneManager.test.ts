/**
 * ISceneManager インターフェーステスト
 *
 * ISceneManagerインターフェースの型チェックを行う。
 * インターフェースなので実装ではなく型の整合性をテストする。
 */

import { describe, it, expect, vi } from 'vitest';
import type { ISceneManager } from '@game/managers/ISceneManager';
import type { TransitionConfig, SceneTransitionData } from '@game/managers/SceneTransition';
import { SceneKeys, type SceneKey } from '@game/config/SceneKeys';
import { DefaultTransitions } from '@game/managers/SceneTransition';

/**
 * ISceneManagerのモック実装（型チェック用）
 */
class MockSceneManager implements ISceneManager {
  private currentScene: SceneKey | null = null;
  private transitioning = false;
  private overlays: SceneKey[] = [];
  private history: SceneTransitionData[] = [];

  getCurrentScene(): SceneKey | null {
    return this.currentScene;
  }

  isTransitioning(): boolean {
    return this.transitioning;
  }

  async goTo(
    sceneKey: SceneKey,
    _data?: Record<string, unknown>,
    _transition?: TransitionConfig
  ): Promise<void> {
    this.currentScene = sceneKey;
  }

  async replace(
    sceneKey: SceneKey,
    _data?: Record<string, unknown>,
    _transition?: TransitionConfig
  ): Promise<void> {
    this.currentScene = sceneKey;
  }

  async goBack(_transition?: TransitionConfig): Promise<boolean> {
    if (this.history.length === 0) return false;
    this.history.pop();
    return true;
  }

  async openOverlay(
    sceneKey: SceneKey,
    _data?: Record<string, unknown>,
    _transition?: TransitionConfig
  ): Promise<void> {
    this.overlays.push(sceneKey);
  }

  async closeOverlay(
    sceneKey: SceneKey,
    _transition?: TransitionConfig
  ): Promise<void> {
    const index = this.overlays.indexOf(sceneKey);
    if (index !== -1) {
      this.overlays.splice(index, 1);
    }
  }

  async closeAllOverlays(): Promise<void> {
    this.overlays = [];
  }

  isOverlayOpen(sceneKey: SceneKey): boolean {
    return this.overlays.includes(sceneKey);
  }

  getOpenOverlays(): SceneKey[] {
    return [...this.overlays];
  }

  getHistory(): SceneTransitionData[] {
    return [...this.history];
  }

  clearHistory(): void {
    this.history = [];
  }

  canGoBack(): boolean {
    return this.history.length > 0;
  }
}

describe('ISceneManager', () => {
  describe('インターフェース実装', () => {
    it('ISceneManagerを実装したクラスを作成できる', () => {
      const manager: ISceneManager = new MockSceneManager();
      expect(manager).toBeDefined();
    });
  });

  describe('状態取得メソッド', () => {
    it('getCurrentScene()で現在のシーンを取得できる', async () => {
      const manager: ISceneManager = new MockSceneManager();

      expect(manager.getCurrentScene()).toBeNull();

      await manager.goTo(SceneKeys.TITLE);
      expect(manager.getCurrentScene()).toBe(SceneKeys.TITLE);
    });

    it('isTransitioning()で遷移状態を取得できる', () => {
      const manager: ISceneManager = new MockSceneManager();
      expect(manager.isTransitioning()).toBe(false);
    });
  });

  describe('通常遷移メソッド', () => {
    it('goTo()でシーン遷移ができる', async () => {
      const manager: ISceneManager = new MockSceneManager();

      await manager.goTo(SceneKeys.MAIN, { test: 'data' });
      expect(manager.getCurrentScene()).toBe(SceneKeys.MAIN);
    });

    it('goTo()で遷移設定を指定できる', async () => {
      const manager: ISceneManager = new MockSceneManager();

      await manager.goTo(SceneKeys.MAIN, undefined, DefaultTransitions.standard);
      expect(manager.getCurrentScene()).toBe(SceneKeys.MAIN);
    });

    it('replace()でシーンを置き換えられる', async () => {
      const manager: ISceneManager = new MockSceneManager();

      await manager.replace(SceneKeys.TITLE);
      expect(manager.getCurrentScene()).toBe(SceneKeys.TITLE);
    });

    it('goBack()で前のシーンに戻れる', async () => {
      const manager: ISceneManager = new MockSceneManager();

      // 履歴がない場合はfalse
      const result = await manager.goBack();
      expect(result).toBe(false);
    });
  });

  describe('オーバーレイ管理メソッド', () => {
    it('openOverlay()でオーバーレイを開ける', async () => {
      const manager: ISceneManager = new MockSceneManager();

      await manager.openOverlay(SceneKeys.SHOP);
      expect(manager.isOverlayOpen(SceneKeys.SHOP)).toBe(true);
    });

    it('closeOverlay()でオーバーレイを閉じられる', async () => {
      const manager: ISceneManager = new MockSceneManager();

      await manager.openOverlay(SceneKeys.SHOP);
      await manager.closeOverlay(SceneKeys.SHOP);
      expect(manager.isOverlayOpen(SceneKeys.SHOP)).toBe(false);
    });

    it('closeAllOverlays()ですべてのオーバーレイを閉じられる', async () => {
      const manager: ISceneManager = new MockSceneManager();

      await manager.openOverlay(SceneKeys.SHOP);
      await manager.openOverlay(SceneKeys.RANK_UP);
      await manager.closeAllOverlays();

      expect(manager.getOpenOverlays()).toHaveLength(0);
    });

    it('getOpenOverlays()で開いているオーバーレイ一覧を取得できる', async () => {
      const manager: ISceneManager = new MockSceneManager();

      await manager.openOverlay(SceneKeys.SHOP);
      await manager.openOverlay(SceneKeys.RANK_UP);

      const overlays = manager.getOpenOverlays();
      expect(overlays).toContain(SceneKeys.SHOP);
      expect(overlays).toContain(SceneKeys.RANK_UP);
    });
  });

  describe('履歴管理メソッド', () => {
    it('getHistory()で遷移履歴を取得できる', () => {
      const manager: ISceneManager = new MockSceneManager();
      const history = manager.getHistory();
      expect(Array.isArray(history)).toBe(true);
    });

    it('clearHistory()で履歴をクリアできる', () => {
      const manager: ISceneManager = new MockSceneManager();
      manager.clearHistory();
      expect(manager.getHistory()).toHaveLength(0);
    });

    it('canGoBack()で戻れるかどうかを確認できる', () => {
      const manager: ISceneManager = new MockSceneManager();
      expect(manager.canGoBack()).toBe(false);
    });
  });
});
