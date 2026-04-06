/**
 * Buttonコンポーネントのテスト
 * TASK-0018 Phase 2 共通UIコンポーネント基盤
 * Issue #450: rexUI Label → Phaserネイティブ実装への移行
 */

import { Button, ButtonType } from '@presentation/ui/components/Button';
import type Phaser from 'phaser';
import { beforeEach, describe, expect, test, vi } from 'vitest';

interface MockContainer {
  setVisible: ReturnType<typeof vi.fn>;
  setPosition: ReturnType<typeof vi.fn>;
  setAlpha: ReturnType<typeof vi.fn>;
  setSize: ReturnType<typeof vi.fn>;
  setInteractive: ReturnType<typeof vi.fn>;
  add: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
  x: number;
  y: number;
  visible: boolean;
  name: string;
}

describe('Button', () => {
  let scene: Phaser.Scene;
  let mockCallback: () => void;
  let mockContainer: MockContainer;
  let mockRect: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(() => {
    mockCallback = vi.fn() as () => void;

    mockContainer = {
      setVisible: vi.fn().mockReturnThis(),
      setPosition: vi.fn().mockReturnThis(),
      setAlpha: vi.fn().mockReturnThis(),
      setSize: vi.fn().mockReturnThis(),
      setInteractive: vi.fn().mockReturnThis(),
      add: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
      off: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
      x: 100,
      y: 200,
      visible: true,
      name: '',
    };

    mockRect = {
      setOrigin: vi.fn().mockReturnThis(),
      setFillStyle: vi.fn().mockReturnThis(),
      setInteractive: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
      off: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
    };

    const mockText = {
      setOrigin: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
    };

    scene = {
      add: {
        container: vi.fn().mockReturnValue(mockContainer),
        rectangle: vi.fn().mockReturnValue(mockRect),
        text: vi.fn().mockReturnValue(mockText),
      },
      children: {
        remove: vi.fn(),
      },
      tweens: {
        add: vi.fn().mockReturnThis(),
      },
      rexUI: undefined,
    } as unknown as Phaser.Scene;

    // Phaser.Geom.Rectangleのモック
    globalThis.Phaser = {
      Geom: {
        Rectangle: vi.fn(),
      },
    } as unknown as typeof Phaser;
    globalThis.Phaser.Geom.Rectangle.Contains = vi.fn();
  });

  describe('T-0018-BTN-01: プライマリボタンの生成と表示', () => {
    test('プライマリボタンが正しく生成される', () => {
      const button = new Button(scene, 100, 200, {
        text: '確定',
        type: ButtonType.PRIMARY,
        onClick: mockCallback,
      });

      expect(button).toBeDefined();
      // container.addが呼ばれている（bg + text）
      expect(mockContainer.add).toHaveBeenCalled();
    });

    test('テキストが正しく設定されている', () => {
      new Button(scene, 100, 200, {
        text: '確定',
        type: ButtonType.PRIMARY,
        onClick: mockCallback,
      });

      expect(scene.add.text).toHaveBeenCalledWith(0, 0, '確定', expect.anything());
    });

    test('クリックイベントが登録されている', () => {
      new Button(scene, 100, 200, {
        text: '確定',
        type: ButtonType.PRIMARY,
        onClick: mockCallback,
      });

      expect(mockRect.on).toHaveBeenCalledWith('pointerdown', expect.any(Function));
    });
  });

  describe('T-0018-BTN-02: セカンダリボタンの生成と表示', () => {
    test('セカンダリボタンが正しく生成される', () => {
      const button = new Button(scene, 100, 200, {
        text: 'キャンセル',
        type: ButtonType.SECONDARY,
        onClick: mockCallback,
      });

      expect(button).toBeDefined();
    });
  });

  describe('T-0018-BTN-03: テキストボタンの生成と表示', () => {
    test('テキストボタンが正しく生成される', () => {
      const button = new Button(scene, 100, 200, {
        text: '詳細を見る',
        type: ButtonType.TEXT,
        onClick: mockCallback,
      });

      expect(button).toBeDefined();
    });
  });

  describe('T-0018-BTN-04: アイコンボタンの生成と表示', () => {
    test('アイコンボタンが正しく生成される', () => {
      const button = new Button(scene, 100, 200, {
        text: '×',
        type: ButtonType.ICON,
        onClick: mockCallback,
      });

      expect(button).toBeDefined();
    });
  });

  describe('T-0018-BTN-05: ボタンのクリックイベント実行', () => {
    test('クリック時にonClickが呼ばれる', () => {
      new Button(scene, 100, 200, {
        text: '確定',
        onClick: mockCallback,
      });

      // pointerdownハンドラを取得して呼ぶ
      const pointerdownCall = mockRect.on.mock.calls.find((call) => call[0] === 'pointerdown');
      expect(pointerdownCall).toBeDefined();
      pointerdownCall[1]();

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('T-0018-BTN-06: メソッドチェーンの動作確認', () => {
    test('setVisibleがメソッドチェーンをサポートする', () => {
      const button = new Button(scene, 100, 200, {
        text: '確定',
        onClick: mockCallback,
      });

      const result = button.setVisible(false);
      expect(result).toBe(button);
    });

    test('setEnabledがメソッドチェーンをサポートする', () => {
      const button = new Button(scene, 100, 200, {
        text: '確定',
        onClick: mockCallback,
      });

      const result = button.setEnabled(false);
      expect(result).toBe(button);
    });
  });

  describe('T-0018-BTN-07: 空文字列のテキストでボタン生成', () => {
    test('空文字列のテキストでエラーが発生する', () => {
      expect(() => {
        new Button(scene, 100, 200, {
          text: '',
          onClick: mockCallback,
        });
      }).toThrow('text is required for non-icon buttons');
    });

    test('ICONタイプは空文字列でもエラーにならない', () => {
      expect(() => {
        new Button(scene, 100, 200, {
          text: '',
          type: ButtonType.ICON,
          onClick: mockCallback,
        });
      }).not.toThrow();
    });
  });

  describe('T-0018-BTN-08: onClickコールバックがnullの場合', () => {
    test('onClickがnullでエラーが発生する', () => {
      expect(() => {
        new Button(scene, 100, 200, {
          text: '確定',
          onClick: null as unknown as () => void,
        });
      }).toThrow('onClick callback is required');
    });
  });

  describe('T-0018-BTN-09: 無効化されたボタンのクリック', () => {
    test('無効化時はクリックが動作しない', () => {
      new Button(scene, 100, 200, {
        text: '確定',
        onClick: mockCallback,
        enabled: false,
      });

      // pointerdownハンドラを取得して呼ぶ
      const pointerdownCall = mockRect.on.mock.calls.find((call) => call[0] === 'pointerdown');
      pointerdownCall[1]();

      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('T-0018-BTN-11: カスタムサイズのボタン生成', () => {
    test('widthとheightを指定してボタンを生成できる', () => {
      const button = new Button(scene, 100, 200, {
        text: '小',
        onClick: mockCallback,
        width: 60,
        height: 30,
      });

      expect(button).toBeDefined();
      expect(scene.add.rectangle).toHaveBeenCalledWith(0, 0, 60, 30, expect.any(Number));
    });
  });

  describe('T-0018-BTN-12: 非常に長いテキストのボタン生成', () => {
    test('長いテキストでもエラーにならない', () => {
      const longText = 'あ'.repeat(100);
      expect(() => {
        new Button(scene, 100, 200, {
          text: longText,
          onClick: mockCallback,
        });
      }).not.toThrow();
    });
  });

  describe('T-0018-BTN-13: ボタンの無効化と再有効化', () => {
    test('再有効化後にクリックが動作する', () => {
      const button = new Button(scene, 100, 200, {
        text: '確定',
        onClick: mockCallback,
      });

      button.setEnabled(false);
      expect(button.isEnabled()).toBe(false);

      button.setEnabled(true);
      expect(button.isEnabled()).toBe(true);

      // pointerdownハンドラを取得して呼ぶ
      const pointerdownCall = mockRect.on.mock.calls.find((call) => call[0] === 'pointerdown');
      pointerdownCall[1]();

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('destroy', () => {
    test('destroy()でリソースが解放される', () => {
      const button = new Button(scene, 100, 200, {
        text: '確定',
        onClick: mockCallback,
      });

      expect(() => button.destroy()).not.toThrow();
      expect(mockContainer.destroy).toHaveBeenCalled();
    });
  });
});
