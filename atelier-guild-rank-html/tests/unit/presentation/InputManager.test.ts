/**
 * 入力システムテスト
 * @description TASK-0120 入力システム（InputManager）
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { InputManager, InputEvent, InputAction } from '../../../src/presentation/InputManager';

describe('InputManager', () => {
  let inputManager: InputManager;

  beforeEach(() => {
    inputManager = new InputManager();
  });

  afterEach(() => {
    inputManager.destroy();
  });

  describe('キーボード入力検知', () => {
    it('Enterキー入力を検知できる', () => {
      // Arrange
      const handler = vi.fn();
      inputManager.subscribe('confirm', handler);

      // Act
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      document.dispatchEvent(event);

      // Assert
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'confirm',
          source: 'keyboard',
        })
      );
    });

    it('Spaceキー入力を検知できる', () => {
      // Arrange
      const handler = vi.fn();
      inputManager.subscribe('confirm', handler);

      // Act
      const event = new KeyboardEvent('keydown', { key: ' ' });
      document.dispatchEvent(event);

      // Assert
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'confirm',
          source: 'keyboard',
        })
      );
    });

    it('Escapeキー入力を検知できる', () => {
      // Arrange
      const handler = vi.fn();
      inputManager.subscribe('cancel', handler);

      // Act
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);

      // Assert
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'cancel',
          source: 'keyboard',
        })
      );
    });

    it('矢印キー入力を検知できる', () => {
      // Arrange
      const upHandler = vi.fn();
      const downHandler = vi.fn();
      const leftHandler = vi.fn();
      const rightHandler = vi.fn();
      inputManager.subscribe('up', upHandler);
      inputManager.subscribe('down', downHandler);
      inputManager.subscribe('left', leftHandler);
      inputManager.subscribe('right', rightHandler);

      // Act
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));

      // Assert
      expect(upHandler).toHaveBeenCalled();
      expect(downHandler).toHaveBeenCalled();
      expect(leftHandler).toHaveBeenCalled();
      expect(rightHandler).toHaveBeenCalled();
    });

    it('数字キー（1-9）入力を検知できる', () => {
      // Arrange
      const handlers = Array.from({ length: 9 }, () => vi.fn());
      for (let i = 1; i <= 9; i++) {
        inputManager.subscribe(`shortcut${i}` as InputAction, handlers[i - 1]);
      }

      // Act
      for (let i = 1; i <= 9; i++) {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: String(i) }));
      }

      // Assert
      handlers.forEach((handler) => {
        expect(handler).toHaveBeenCalled();
      });
    });

    it('Tabキー入力を検知できる', () => {
      // Arrange
      const handler = vi.fn();
      inputManager.subscribe('focusNext', handler);

      // Act
      const event = new KeyboardEvent('keydown', { key: 'Tab' });
      document.dispatchEvent(event);

      // Assert
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'focusNext',
          source: 'keyboard',
        })
      );
    });

    it('Shift+Tabキー入力を検知できる', () => {
      // Arrange
      const handler = vi.fn();
      inputManager.subscribe('focusPrev', handler);

      // Act
      const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true });
      document.dispatchEvent(event);

      // Assert
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'focusPrev',
          source: 'keyboard',
        })
      );
    });
  });

  describe('マウス入力検知', () => {
    it('マウスクリックを検知できる', () => {
      // Arrange
      const handler = vi.fn();
      inputManager.subscribe('click', handler);

      // Act
      const event = new MouseEvent('click', { bubbles: true });
      document.body.dispatchEvent(event);

      // Assert
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'click',
          source: 'mouse',
        })
      );
    });

    it('ホバー状態を検知できる', () => {
      // Arrange
      const element = document.createElement('div');
      document.body.appendChild(element);
      const handler = vi.fn();
      inputManager.subscribe('hover', handler);

      // Act
      const event = new MouseEvent('mouseover', { bubbles: true });
      element.dispatchEvent(event);

      // Assert
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'hover',
          source: 'mouse',
        })
      );

      // Cleanup
      document.body.removeChild(element);
    });
  });

  describe('イベント購読', () => {
    it('入力イベントを購読できる', () => {
      // Arrange
      const handler = vi.fn();

      // Act
      const unsubscribe = inputManager.subscribe('confirm', handler);

      // Assert
      expect(typeof unsubscribe).toBe('function');
    });

    it('入力イベント購読を解除できる', () => {
      // Arrange
      const handler = vi.fn();
      const unsubscribe = inputManager.subscribe('confirm', handler);

      // Act
      unsubscribe();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      // Assert
      expect(handler).not.toHaveBeenCalled();
    });

    it('複数のハンドラーを同じアクションに登録できる', () => {
      // Arrange
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      inputManager.subscribe('confirm', handler1);
      inputManager.subscribe('confirm', handler2);

      // Act
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      // Assert
      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });
  });

  describe('入力無効化', () => {
    it('入力を一時的に無効化できる', () => {
      // Arrange
      const handler = vi.fn();
      inputManager.subscribe('confirm', handler);

      // Act
      inputManager.disable();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      // Assert
      expect(handler).not.toHaveBeenCalled();
    });

    it('無効化を解除すると入力を検知できる', () => {
      // Arrange
      const handler = vi.fn();
      inputManager.subscribe('confirm', handler);
      inputManager.disable();

      // Act
      inputManager.enable();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      // Assert
      expect(handler).toHaveBeenCalled();
    });

    it('特定のアクションのみ無効化できる', () => {
      // Arrange
      const confirmHandler = vi.fn();
      const cancelHandler = vi.fn();
      inputManager.subscribe('confirm', confirmHandler);
      inputManager.subscribe('cancel', cancelHandler);

      // Act
      inputManager.disableAction('confirm');
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      // Assert
      expect(confirmHandler).not.toHaveBeenCalled();
      expect(cancelHandler).toHaveBeenCalled();
    });
  });

  describe('キーバインド設定', () => {
    it('キーバインド設定を変更できる', () => {
      // Arrange
      const handler = vi.fn();
      inputManager.subscribe('confirm', handler);

      // Act - 'z'キーをconfirmにバインド
      inputManager.setKeyBinding('z', 'confirm');
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'z' }));

      // Assert
      expect(handler).toHaveBeenCalled();
    });

    it('既存のキーバインドを上書きできる', () => {
      // Arrange
      const confirmHandler = vi.fn();
      const cancelHandler = vi.fn();
      inputManager.subscribe('confirm', confirmHandler);
      inputManager.subscribe('cancel', cancelHandler);

      // Act - Enterをcancelにバインド
      inputManager.setKeyBinding('Enter', 'cancel');
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      // Assert
      expect(confirmHandler).not.toHaveBeenCalled();
      expect(cancelHandler).toHaveBeenCalled();
    });
  });

  describe('破棄', () => {
    it('destroyでイベントリスナーが解除される', () => {
      // Arrange
      const handler = vi.fn();
      inputManager.subscribe('confirm', handler);

      // Act
      inputManager.destroy();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      // Assert
      expect(handler).not.toHaveBeenCalled();
    });
  });
});
