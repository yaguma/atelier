/**
 * タイトル画面テスト
 * @description TASK-0122 タイトル画面UI
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TitleScreen } from '../../../../src/presentation/screens/TitleScreen';

describe('TitleScreen', () => {
  let titleScreen: TitleScreen;
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    titleScreen = new TitleScreen();
  });

  afterEach(() => {
    titleScreen.destroy();
    document.body.removeChild(container);
  });

  describe('表示', () => {
    it('タイトルロゴが表示される', () => {
      // Arrange
      titleScreen.mount(container);

      // Assert
      const logo = container.querySelector('.title-logo');
      expect(logo).not.toBeNull();
      expect(logo?.textContent).toContain('アトリエ錬金術');
    });

    it('サブタイトルが表示される', () => {
      // Arrange
      titleScreen.mount(container);

      // Assert
      const subtitle = container.querySelector('.title-subtitle');
      expect(subtitle).not.toBeNull();
      expect(subtitle?.textContent).toContain('ギルドランク制');
    });

    it('「はじめから」ボタンが表示される', () => {
      // Arrange
      titleScreen.mount(container);

      // Assert
      const newGameBtn = container.querySelector('[data-action="new-game"]');
      expect(newGameBtn).not.toBeNull();
      expect(newGameBtn?.textContent).toContain('はじめから');
    });

    it('「つづきから」ボタンが表示される', () => {
      // Arrange
      titleScreen.mount(container);

      // Assert
      const continueBtn = container.querySelector('[data-action="continue"]');
      expect(continueBtn).not.toBeNull();
      expect(continueBtn?.textContent).toContain('つづきから');
    });
  });

  describe('セーブデータ状態', () => {
    it('セーブデータがない場合「つづきから」は非活性', () => {
      // Arrange
      titleScreen.setSaveDataExists(false);
      titleScreen.mount(container);

      // Assert
      const continueBtn = container.querySelector('[data-action="continue"]') as HTMLButtonElement;
      expect(continueBtn?.disabled).toBe(true);
      expect(continueBtn?.classList.contains('disabled')).toBe(true);
    });

    it('セーブデータがある場合「つづきから」は活性', () => {
      // Arrange
      titleScreen.setSaveDataExists(true);
      titleScreen.mount(container);

      // Assert
      const continueBtn = container.querySelector('[data-action="continue"]') as HTMLButtonElement;
      expect(continueBtn?.disabled).toBe(false);
      expect(continueBtn?.classList.contains('disabled')).toBe(false);
    });
  });

  describe('ボタン操作', () => {
    it('「はじめから」クリックで新規ゲーム開始イベントが発火する', () => {
      // Arrange
      const onNewGame = vi.fn();
      titleScreen.onNewGame(onNewGame);
      titleScreen.mount(container);

      // Act
      const newGameBtn = container.querySelector('[data-action="new-game"]') as HTMLButtonElement;
      newGameBtn?.click();

      // Assert
      expect(onNewGame).toHaveBeenCalled();
    });

    it('「つづきから」クリックでゲーム再開イベントが発火する', () => {
      // Arrange
      const onContinue = vi.fn();
      titleScreen.setSaveDataExists(true);
      titleScreen.onContinue(onContinue);
      titleScreen.mount(container);

      // Act
      const continueBtn = container.querySelector('[data-action="continue"]') as HTMLButtonElement;
      continueBtn?.click();

      // Assert
      expect(onContinue).toHaveBeenCalled();
    });

    it('非活性の「つづきから」をクリックしてもイベントは発火しない', () => {
      // Arrange
      const onContinue = vi.fn();
      titleScreen.setSaveDataExists(false);
      titleScreen.onContinue(onContinue);
      titleScreen.mount(container);

      // Act
      const continueBtn = container.querySelector('[data-action="continue"]') as HTMLButtonElement;
      continueBtn?.click();

      // Assert
      expect(onContinue).not.toHaveBeenCalled();
    });
  });

  describe('キーボード操作', () => {
    it('初期状態で「はじめから」が選択されている', () => {
      // Arrange
      titleScreen.mount(container);

      // Assert
      const newGameBtn = container.querySelector('[data-action="new-game"]');
      expect(newGameBtn?.classList.contains('selected')).toBe(true);
    });

    it('下キーでメニュー選択が移動する', () => {
      // Arrange
      titleScreen.setSaveDataExists(true);
      titleScreen.mount(container);

      // Act
      titleScreen.selectNext();

      // Assert
      const newGameBtn = container.querySelector('[data-action="new-game"]');
      const continueBtn = container.querySelector('[data-action="continue"]');
      expect(newGameBtn?.classList.contains('selected')).toBe(false);
      expect(continueBtn?.classList.contains('selected')).toBe(true);
    });

    it('上キーでメニュー選択が移動する', () => {
      // Arrange
      titleScreen.setSaveDataExists(true);
      titleScreen.mount(container);
      titleScreen.selectNext(); // 一度下に移動

      // Act
      titleScreen.selectPrev();

      // Assert
      const newGameBtn = container.querySelector('[data-action="new-game"]');
      expect(newGameBtn?.classList.contains('selected')).toBe(true);
    });

    it('選択中のメニューでEnterを押すとイベントが発火する', () => {
      // Arrange
      const onNewGame = vi.fn();
      titleScreen.onNewGame(onNewGame);
      titleScreen.mount(container);

      // Act
      titleScreen.confirmSelection();

      // Assert
      expect(onNewGame).toHaveBeenCalled();
    });
  });

  describe('Screen インターフェース', () => {
    it('画面IDが正しい', () => {
      expect(titleScreen.id).toBe('title');
    });

    it('画面名が正しい', () => {
      expect(titleScreen.name).toBe('タイトル画面');
    });

    it('onEnter/onExitが呼び出し可能', () => {
      // Assert - エラーなく呼び出せることを確認
      expect(() => titleScreen.onEnter()).not.toThrow();
      expect(() => titleScreen.onExit()).not.toThrow();
    });
  });
});
