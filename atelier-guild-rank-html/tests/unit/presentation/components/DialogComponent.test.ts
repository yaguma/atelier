/**
 * ダイアログコンポーネントテスト
 * @description TASK-0134 ダイアログコンポーネント
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  DialogComponent,
  DialogType,
  DialogConfig,
  DialogResult,
} from '../../../../src/presentation/components/DialogComponent';

describe('DialogComponent', () => {
  let dialog: DialogComponent;
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    dialog?.destroy();
    document.body.removeChild(container);
  });

  describe('確認ダイアログ', () => {
    it('確認ダイアログを表示できる', () => {
      // Arrange
      const config: DialogConfig = {
        type: 'confirm',
        title: '確認',
        message: '本当に実行しますか？',
      };
      dialog = new DialogComponent(config);
      dialog.mount(container);

      // Assert
      const dialogElement = container.querySelector('.dialog');
      expect(dialogElement).not.toBeNull();
      expect(dialogElement?.classList.contains('dialog-confirm')).toBe(true);
    });

    it('確認ダイアログにタイトルとメッセージが表示される', () => {
      // Arrange
      const config: DialogConfig = {
        type: 'confirm',
        title: '確認タイトル',
        message: '確認メッセージです',
      };
      dialog = new DialogComponent(config);
      dialog.mount(container);

      // Assert
      const title = container.querySelector('.dialog-title');
      const message = container.querySelector('.dialog-message');
      expect(title?.textContent).toContain('確認タイトル');
      expect(message?.textContent).toContain('確認メッセージです');
    });

    it('確認ダイアログにOKとキャンセルボタンがある', () => {
      // Arrange
      const config: DialogConfig = {
        type: 'confirm',
        title: '確認',
        message: '確認メッセージ',
      };
      dialog = new DialogComponent(config);
      dialog.mount(container);

      // Assert
      const okBtn = container.querySelector('.dialog-ok-btn');
      const cancelBtn = container.querySelector('.dialog-cancel-btn');
      expect(okBtn).not.toBeNull();
      expect(cancelBtn).not.toBeNull();
    });
  });

  describe('情報ダイアログ', () => {
    it('情報ダイアログを表示できる', () => {
      // Arrange
      const config: DialogConfig = {
        type: 'info',
        title: '情報',
        message: 'お知らせです',
      };
      dialog = new DialogComponent(config);
      dialog.mount(container);

      // Assert
      const dialogElement = container.querySelector('.dialog');
      expect(dialogElement).not.toBeNull();
      expect(dialogElement?.classList.contains('dialog-info')).toBe(true);
    });

    it('情報ダイアログにはOKボタンのみある', () => {
      // Arrange
      const config: DialogConfig = {
        type: 'info',
        title: '情報',
        message: 'お知らせです',
      };
      dialog = new DialogComponent(config);
      dialog.mount(container);

      // Assert
      const okBtn = container.querySelector('.dialog-ok-btn');
      const cancelBtn = container.querySelector('.dialog-cancel-btn');
      expect(okBtn).not.toBeNull();
      expect(cancelBtn).toBeNull();
    });
  });

  describe('選択ダイアログ', () => {
    it('選択ダイアログを表示できる', () => {
      // Arrange
      const config: DialogConfig = {
        type: 'choice',
        title: '選択',
        message: '選んでください',
        choices: [
          { id: 'opt1', label: '選択肢1' },
          { id: 'opt2', label: '選択肢2' },
          { id: 'opt3', label: '選択肢3' },
        ],
      };
      dialog = new DialogComponent(config);
      dialog.mount(container);

      // Assert
      const dialogElement = container.querySelector('.dialog');
      expect(dialogElement).not.toBeNull();
      expect(dialogElement?.classList.contains('dialog-choice')).toBe(true);
    });

    it('選択ダイアログに選択肢が表示される', () => {
      // Arrange
      const config: DialogConfig = {
        type: 'choice',
        title: '選択',
        message: '選んでください',
        choices: [
          { id: 'opt1', label: '選択肢1' },
          { id: 'opt2', label: '選択肢2' },
          { id: 'opt3', label: '選択肢3' },
        ],
      };
      dialog = new DialogComponent(config);
      dialog.mount(container);

      // Assert
      const choiceItems = container.querySelectorAll('.dialog-choice-item');
      expect(choiceItems.length).toBe(3);
      expect(choiceItems[0].textContent).toContain('選択肢1');
      expect(choiceItems[1].textContent).toContain('選択肢2');
      expect(choiceItems[2].textContent).toContain('選択肢3');
    });

    it('選択肢をクリックすると選択される', () => {
      // Arrange
      const onResult = vi.fn();
      const config: DialogConfig = {
        type: 'choice',
        title: '選択',
        message: '選んでください',
        choices: [
          { id: 'opt1', label: '選択肢1' },
          { id: 'opt2', label: '選択肢2' },
        ],
      };
      dialog = new DialogComponent(config);
      dialog.onResult(onResult);
      dialog.mount(container);

      // Act
      const secondChoice = container.querySelectorAll(
        '.dialog-choice-item'
      )[1] as HTMLElement;
      secondChoice?.click();

      // Assert
      expect(onResult).toHaveBeenCalledWith({
        confirmed: true,
        selectedChoiceId: 'opt2',
      });
    });
  });

  describe('OKボタンで閉じる', () => {
    it('OKボタンクリックでコールバックが呼ばれる', () => {
      // Arrange
      const onResult = vi.fn();
      const config: DialogConfig = {
        type: 'confirm',
        title: '確認',
        message: 'テスト',
      };
      dialog = new DialogComponent(config);
      dialog.onResult(onResult);
      dialog.mount(container);

      // Act
      const okBtn = container.querySelector('.dialog-ok-btn') as HTMLElement;
      okBtn?.click();

      // Assert
      expect(onResult).toHaveBeenCalledWith({ confirmed: true });
    });

    it('OKボタンクリックでダイアログが非表示になる', () => {
      // Arrange
      const config: DialogConfig = {
        type: 'info',
        title: '情報',
        message: 'テスト',
      };
      dialog = new DialogComponent(config);
      dialog.mount(container);

      // Act
      const okBtn = container.querySelector('.dialog-ok-btn') as HTMLElement;
      okBtn?.click();

      // Assert
      const dialogElement = container.querySelector('.dialog-overlay');
      expect(dialogElement?.classList.contains('hidden')).toBe(true);
    });
  });

  describe('キャンセルボタンで閉じる', () => {
    it('キャンセルボタンクリックでコールバックが呼ばれる', () => {
      // Arrange
      const onResult = vi.fn();
      const config: DialogConfig = {
        type: 'confirm',
        title: '確認',
        message: 'テスト',
      };
      dialog = new DialogComponent(config);
      dialog.onResult(onResult);
      dialog.mount(container);

      // Act
      const cancelBtn = container.querySelector(
        '.dialog-cancel-btn'
      ) as HTMLElement;
      cancelBtn?.click();

      // Assert
      expect(onResult).toHaveBeenCalledWith({ confirmed: false });
    });

    it('キャンセルボタンクリックでダイアログが非表示になる', () => {
      // Arrange
      const config: DialogConfig = {
        type: 'confirm',
        title: '確認',
        message: 'テスト',
      };
      dialog = new DialogComponent(config);
      dialog.mount(container);

      // Act
      const cancelBtn = container.querySelector(
        '.dialog-cancel-btn'
      ) as HTMLElement;
      cancelBtn?.click();

      // Assert
      const dialogElement = container.querySelector('.dialog-overlay');
      expect(dialogElement?.classList.contains('hidden')).toBe(true);
    });
  });

  describe('オーバーレイクリックで閉じる', () => {
    it('オーバーレイクリックで閉じる（設定時）', () => {
      // Arrange
      const onResult = vi.fn();
      const config: DialogConfig = {
        type: 'confirm',
        title: '確認',
        message: 'テスト',
        closeOnOverlayClick: true,
      };
      dialog = new DialogComponent(config);
      dialog.onResult(onResult);
      dialog.mount(container);

      // Act
      const overlay = container.querySelector(
        '.dialog-overlay'
      ) as HTMLElement;
      overlay?.click();

      // Assert
      expect(onResult).toHaveBeenCalledWith({ confirmed: false });
    });

    it('オーバーレイクリックで閉じない（デフォルト）', () => {
      // Arrange
      const onResult = vi.fn();
      const config: DialogConfig = {
        type: 'confirm',
        title: '確認',
        message: 'テスト',
      };
      dialog = new DialogComponent(config);
      dialog.onResult(onResult);
      dialog.mount(container);

      // Act
      const overlay = container.querySelector(
        '.dialog-overlay'
      ) as HTMLElement;
      overlay?.click();

      // Assert
      expect(onResult).not.toHaveBeenCalled();
    });
  });

  describe('ESCキーで閉じる', () => {
    it('ESCキーでダイアログが閉じる', () => {
      // Arrange
      const onResult = vi.fn();
      const config: DialogConfig = {
        type: 'confirm',
        title: '確認',
        message: 'テスト',
      };
      dialog = new DialogComponent(config);
      dialog.onResult(onResult);
      dialog.mount(container);

      // Act
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);

      // Assert
      expect(onResult).toHaveBeenCalledWith({ confirmed: false });
    });

    it('ESCキーで閉じない設定も可能', () => {
      // Arrange
      const onResult = vi.fn();
      const config: DialogConfig = {
        type: 'confirm',
        title: '確認',
        message: 'テスト',
        closeOnEsc: false,
      };
      dialog = new DialogComponent(config);
      dialog.onResult(onResult);
      dialog.mount(container);

      // Act
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);

      // Assert
      expect(onResult).not.toHaveBeenCalled();
    });
  });

  describe('ダイアログ表示・非表示', () => {
    it('show()でダイアログが表示される', () => {
      // Arrange
      const config: DialogConfig = {
        type: 'info',
        title: '情報',
        message: 'テスト',
      };
      dialog = new DialogComponent(config);
      dialog.mount(container);
      dialog.close();

      // Act
      dialog.show();

      // Assert
      const overlay = container.querySelector('.dialog-overlay');
      expect(overlay?.classList.contains('hidden')).toBe(false);
    });

    it('close()でダイアログが非表示になる', () => {
      // Arrange
      const config: DialogConfig = {
        type: 'info',
        title: '情報',
        message: 'テスト',
      };
      dialog = new DialogComponent(config);
      dialog.mount(container);

      // Act
      dialog.close();

      // Assert
      const overlay = container.querySelector('.dialog-overlay');
      expect(overlay?.classList.contains('hidden')).toBe(true);
    });
  });
});
