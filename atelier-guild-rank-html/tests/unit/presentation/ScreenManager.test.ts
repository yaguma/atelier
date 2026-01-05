/**
 * 画面遷移システムテスト
 * @description TASK-0121 画面遷移システム（ScreenManager）
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  ScreenManager,
  Screen,
  ScreenId,
  ScreenTransition,
} from '../../../src/presentation/ScreenManager';
import { UIComponent } from '../../../src/presentation/UIComponent';

/**
 * テスト用の画面コンポーネント
 */
class TestScreen extends UIComponent implements Screen {
  readonly id: ScreenId;
  readonly name: string;
  private _screenName: string;

  constructor(id: ScreenId, name: string) {
    // 注意: superを呼ぶ前にプロパティを設定できないため、
    // createElementで使う値は別途設定
    super();
    this.id = id;
    this.name = name;
    this._screenName = name;
    // createElementが呼ばれた後にtextContentを設定
    this.getElement().textContent = name;
  }

  protected createElement(): HTMLElement {
    const element = document.createElement('div');
    element.className = 'screen';
    return element;
  }

  onEnter(): void {
    // 画面表示時の処理
  }

  onExit(): void {
    // 画面非表示時の処理
  }
}

describe('ScreenManager', () => {
  let screenManager: ScreenManager;
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'screen-container';
    document.body.appendChild(container);
    screenManager = new ScreenManager(container);
  });

  afterEach(() => {
    screenManager.destroy();
    document.body.removeChild(container);
  });

  describe('画面登録', () => {
    it('画面を登録できる', () => {
      // Arrange
      const titleScreen = new TestScreen('title', 'タイトル画面');

      // Act
      screenManager.registerScreen(titleScreen);

      // Assert
      expect(screenManager.hasScreen('title')).toBe(true);
    });

    it('複数の画面を登録できる', () => {
      // Arrange
      const titleScreen = new TestScreen('title', 'タイトル画面');
      const mainScreen = new TestScreen('main', 'メイン画面');
      const shopScreen = new TestScreen('shop', 'ショップ画面');

      // Act
      screenManager.registerScreen(titleScreen);
      screenManager.registerScreen(mainScreen);
      screenManager.registerScreen(shopScreen);

      // Assert
      expect(screenManager.hasScreen('title')).toBe(true);
      expect(screenManager.hasScreen('main')).toBe(true);
      expect(screenManager.hasScreen('shop')).toBe(true);
    });

    it('同じIDで再登録すると上書きされる', async () => {
      // Arrange
      const screen1 = new TestScreen('title', '旧タイトル');
      const screen2 = new TestScreen('title', '新タイトル');

      // Act
      screenManager.registerScreen(screen1);
      screenManager.registerScreen(screen2);

      // Assert
      expect(screenManager.hasScreen('title')).toBe(true);
      // 実際に上書きされているか確認するため画面遷移
      await screenManager.goTo('title');
      expect(container.textContent).toContain('新タイトル');
    });
  });

  describe('画面切替', () => {
    it('画面を切り替えられる', async () => {
      // Arrange
      const titleScreen = new TestScreen('title', 'タイトル画面');
      const mainScreen = new TestScreen('main', 'メイン画面');
      screenManager.registerScreen(titleScreen);
      screenManager.registerScreen(mainScreen);

      // Act
      await screenManager.goTo('title');

      // Assert
      expect(screenManager.getCurrentScreenId()).toBe('title');
      expect(container.textContent).toContain('タイトル画面');
    });

    it('別の画面に切り替えると前の画面が非表示になる', async () => {
      // Arrange
      const titleScreen = new TestScreen('title', 'タイトル画面');
      const mainScreen = new TestScreen('main', 'メイン画面');
      screenManager.registerScreen(titleScreen);
      screenManager.registerScreen(mainScreen);
      await screenManager.goTo('title');

      // Act
      await screenManager.goTo('main');

      // Assert
      expect(screenManager.getCurrentScreenId()).toBe('main');
      expect(container.textContent).toContain('メイン画面');
      expect(container.textContent).not.toContain('タイトル画面');
    });

    it('存在しない画面に遷移しようとするとエラー', async () => {
      // Arrange & Act & Assert
      await expect(screenManager.goTo('nonexistent' as ScreenId)).rejects.toThrow();
    });
  });

  describe('画面遷移アニメーション', () => {
    it('画面遷移時にアニメーションが実行される', async () => {
      // Arrange
      const titleScreen = new TestScreen('title', 'タイトル画面');
      const mainScreen = new TestScreen('main', 'メイン画面');
      screenManager.registerScreen(titleScreen);
      screenManager.registerScreen(mainScreen);
      await screenManager.goTo('title');

      // Act
      const transitionPromise = screenManager.goTo('main', 'fade');

      // Assert - 遷移中はアニメーションクラスが付与される
      expect(container.classList.contains('transitioning')).toBe(true);

      // 遷移完了を待つ
      await transitionPromise;
      expect(container.classList.contains('transitioning')).toBe(false);
    });

    it('フェードアニメーションが正しく実行される', async () => {
      // Arrange
      const titleScreen = new TestScreen('title', 'タイトル画面');
      const mainScreen = new TestScreen('main', 'メイン画面');
      screenManager.registerScreen(titleScreen);
      screenManager.registerScreen(mainScreen);
      await screenManager.goTo('title');

      // Act
      await screenManager.goTo('main', 'fade');

      // Assert
      expect(screenManager.getCurrentScreenId()).toBe('main');
    });

    it('スライドアニメーションが正しく実行される', async () => {
      // Arrange
      const titleScreen = new TestScreen('title', 'タイトル画面');
      const mainScreen = new TestScreen('main', 'メイン画面');
      screenManager.registerScreen(titleScreen);
      screenManager.registerScreen(mainScreen);
      await screenManager.goTo('title');

      // Act
      await screenManager.goTo('main', 'slide');

      // Assert
      expect(screenManager.getCurrentScreenId()).toBe('main');
    });

    it('アニメーションなしで即時遷移できる', async () => {
      // Arrange
      const titleScreen = new TestScreen('title', 'タイトル画面');
      const mainScreen = new TestScreen('main', 'メイン画面');
      screenManager.registerScreen(titleScreen);
      screenManager.registerScreen(mainScreen);
      await screenManager.goTo('title');

      // Act
      await screenManager.goTo('main', 'none');

      // Assert
      expect(screenManager.getCurrentScreenId()).toBe('main');
      expect(container.classList.contains('transitioning')).toBe(false);
    });
  });

  describe('画面履歴管理', () => {
    it('画面履歴を管理できる', async () => {
      // Arrange
      const titleScreen = new TestScreen('title', 'タイトル画面');
      const mainScreen = new TestScreen('main', 'メイン画面');
      const shopScreen = new TestScreen('shop', 'ショップ画面');
      screenManager.registerScreen(titleScreen);
      screenManager.registerScreen(mainScreen);
      screenManager.registerScreen(shopScreen);

      // Act
      await screenManager.goTo('title');
      await screenManager.goTo('main');
      await screenManager.goTo('shop');

      // Assert
      expect(screenManager.getHistory()).toEqual(['title', 'main', 'shop']);
    });

    it('前の画面に戻れる', async () => {
      // Arrange
      const titleScreen = new TestScreen('title', 'タイトル画面');
      const mainScreen = new TestScreen('main', 'メイン画面');
      screenManager.registerScreen(titleScreen);
      screenManager.registerScreen(mainScreen);
      await screenManager.goTo('title');
      await screenManager.goTo('main');

      // Act
      await screenManager.goBack();

      // Assert
      expect(screenManager.getCurrentScreenId()).toBe('title');
    });

    it('履歴がない場合はgoBackで何も起きない', async () => {
      // Arrange
      const titleScreen = new TestScreen('title', 'タイトル画面');
      screenManager.registerScreen(titleScreen);
      await screenManager.goTo('title');

      // Act - 戻る履歴がない状態でgoBack
      await screenManager.goBack();

      // Assert - 現在の画面が維持される
      expect(screenManager.getCurrentScreenId()).toBe('title');
    });

    it('履歴をクリアできる', async () => {
      // Arrange
      const titleScreen = new TestScreen('title', 'タイトル画面');
      const mainScreen = new TestScreen('main', 'メイン画面');
      screenManager.registerScreen(titleScreen);
      screenManager.registerScreen(mainScreen);
      await screenManager.goTo('title');
      await screenManager.goTo('main');

      // Act
      screenManager.clearHistory();

      // Assert
      expect(screenManager.getHistory()).toEqual(['main']); // 現在の画面のみ
    });
  });

  describe('現在の画面取得', () => {
    it('現在の画面IDを取得できる', async () => {
      // Arrange
      const titleScreen = new TestScreen('title', 'タイトル画面');
      screenManager.registerScreen(titleScreen);
      await screenManager.goTo('title');

      // Act
      const currentId = screenManager.getCurrentScreenId();

      // Assert
      expect(currentId).toBe('title');
    });

    it('画面が表示されていない場合はnullを返す', () => {
      // Arrange - 画面は登録するが遷移しない
      const titleScreen = new TestScreen('title', 'タイトル画面');
      screenManager.registerScreen(titleScreen);

      // Act
      const currentId = screenManager.getCurrentScreenId();

      // Assert
      expect(currentId).toBeNull();
    });

    it('現在の画面インスタンスを取得できる', async () => {
      // Arrange
      const titleScreen = new TestScreen('title', 'タイトル画面');
      screenManager.registerScreen(titleScreen);
      await screenManager.goTo('title');

      // Act
      const currentScreen = screenManager.getCurrentScreen();

      // Assert
      expect(currentScreen).toBe(titleScreen);
    });
  });

  describe('画面ライフサイクル', () => {
    it('画面表示時にonEnterが呼ばれる', async () => {
      // Arrange
      const titleScreen = new TestScreen('title', 'タイトル画面');
      const onEnterSpy = vi.spyOn(titleScreen, 'onEnter');
      screenManager.registerScreen(titleScreen);

      // Act
      await screenManager.goTo('title');

      // Assert
      expect(onEnterSpy).toHaveBeenCalled();
    });

    it('画面非表示時にonExitが呼ばれる', async () => {
      // Arrange
      const titleScreen = new TestScreen('title', 'タイトル画面');
      const mainScreen = new TestScreen('main', 'メイン画面');
      const onExitSpy = vi.spyOn(titleScreen, 'onExit');
      screenManager.registerScreen(titleScreen);
      screenManager.registerScreen(mainScreen);
      await screenManager.goTo('title');

      // Act
      await screenManager.goTo('main');

      // Assert
      expect(onExitSpy).toHaveBeenCalled();
    });
  });

  describe('破棄', () => {
    it('destroyで全画面が破棄される', async () => {
      // Arrange
      const titleScreen = new TestScreen('title', 'タイトル画面');
      const mainScreen = new TestScreen('main', 'メイン画面');
      screenManager.registerScreen(titleScreen);
      screenManager.registerScreen(mainScreen);
      await screenManager.goTo('title');

      // Act
      screenManager.destroy();

      // Assert
      expect(container.children.length).toBe(0);
    });
  });
});
