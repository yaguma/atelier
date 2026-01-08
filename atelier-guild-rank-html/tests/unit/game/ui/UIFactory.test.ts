/**
 * UIFactory テスト
 *
 * UIFactory基盤クラスのテストを行う。
 * Phaserはcanvas環境を必要とするため、モックを使用する。
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Phaserをモック
vi.mock('phaser', () => {
  return {
    default: {
      Scene: class MockScene {},
    },
    Scene: class MockScene {},
  };
});

// UIFactoryをモック後にインポート
import { UIFactory, DefaultUIStyles } from '@game/ui/UIFactory';
import { Colors } from '@game/config/ColorPalette';

describe('UIFactory', () => {
  let mockScene: any;
  let mockRexUI: any;
  let uiFactory: UIFactory;

  beforeEach(() => {
    mockScene = {
      add: {
        graphics: vi.fn().mockReturnValue({
          fillStyle: vi.fn().mockReturnThis(),
          fillRoundedRect: vi.fn().mockReturnThis(),
          lineStyle: vi.fn().mockReturnThis(),
          strokeRoundedRect: vi.fn().mockReturnThis(),
        }),
        text: vi.fn().mockReturnValue({
          setOrigin: vi.fn().mockReturnThis(),
        }),
      },
    };

    mockRexUI = {
      add: {
        label: vi.fn(),
        buttons: vi.fn(),
        dialog: vi.fn(),
      },
    };

    uiFactory = new UIFactory(mockScene, mockRexUI);
  });

  describe('コンストラクタ', () => {
    it('UIFactoryインスタンスを生成できる', () => {
      expect(uiFactory).toBeDefined();
      expect(uiFactory).toBeInstanceOf(UIFactory);
    });

    it('getScene()でシーンを取得できる', () => {
      expect(uiFactory.getScene()).toBe(mockScene);
    });

    it('getRexUI()でrexUIプラグインを取得できる', () => {
      expect(uiFactory.getRexUI()).toBe(mockRexUI);
    });
  });

  describe('DefaultUIStyles', () => {
    it('buttonスタイルが定義されている', () => {
      expect(DefaultUIStyles.button).toBeDefined();
      expect(DefaultUIStyles.button.backgroundColor).toBe(Colors.primary);
      expect(DefaultUIStyles.button.cornerRadius).toBe(8);
    });

    it('panelスタイルが定義されている', () => {
      expect(DefaultUIStyles.panel).toBeDefined();
      expect(DefaultUIStyles.panel.backgroundColor).toBe(Colors.panelBackground);
      expect(DefaultUIStyles.panel.borderWidth).toBe(2);
    });

    it('dialogスタイルが定義されている', () => {
      expect(DefaultUIStyles.dialog).toBeDefined();
      expect(DefaultUIStyles.dialog.borderColor).toBe(Colors.accent);
    });

    it('progressBarスタイルが定義されている', () => {
      expect(DefaultUIStyles.progressBar).toBeDefined();
      expect(DefaultUIStyles.progressBar.backgroundColor).toBe(Colors.progressBackground);
    });
  });

  describe('未実装メソッド', () => {
    it('createButton()はエラーをスローする', () => {
      expect(() => {
        uiFactory.createButton({ x: 0, y: 0, text: 'Test' });
      }).toThrow('Not implemented - see TASK-0173');
    });

    it('createLabel()はエラーをスローする', () => {
      expect(() => {
        uiFactory.createLabel({ x: 0, y: 0, text: 'Test' });
      }).toThrow('Not implemented - see TASK-0174');
    });

    it('createPanel()はエラーをスローする', () => {
      expect(() => {
        uiFactory.createPanel({ x: 0, y: 0, width: 100, height: 100 });
      }).toThrow('Not implemented - see TASK-0175');
    });

    it('createDialog()はエラーをスローする', () => {
      expect(() => {
        uiFactory.createDialog({ title: 'Test', content: 'Content' });
      }).toThrow('Not implemented - see TASK-0176');
    });

    it('createProgressBar()はエラーをスローする', () => {
      expect(() => {
        uiFactory.createProgressBar({
          x: 0,
          y: 0,
          width: 100,
          height: 20,
          value: 50,
          maxValue: 100,
        });
      }).toThrow('Not implemented - see TASK-0177');
    });

    it('createScrollPanel()はエラーをスローする', () => {
      expect(() => {
        uiFactory.createScrollPanel({
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          content: [],
        });
      }).toThrow('Not implemented - see TASK-0178');
    });

    it('createGridButtons()はエラーをスローする', () => {
      expect(() => {
        uiFactory.createGridButtons({
          x: 0,
          y: 0,
          items: [],
          columns: 4,
          cellWidth: 100,
          cellHeight: 100,
        });
      }).toThrow('Not implemented - see TASK-0179');
    });

    it('showToast()はエラーをスローする', () => {
      expect(() => {
        uiFactory.showToast({ message: 'Test' });
      }).toThrow('Not implemented - see TASK-0180');
    });

    it('addTooltip()はエラーをスローする', () => {
      expect(() => {
        uiFactory.addTooltip({ target: {} as any, text: 'Test' });
      }).toThrow('Not implemented - see TASK-0180');
    });
  });

  describe('ユーティリティメソッド', () => {
    it('createRoundedRect()で角丸四角形を生成できる', () => {
      const result = uiFactory.createRoundedRect(100, 100, 200, 50, 0x333333, 10);

      expect(mockScene.add.graphics).toHaveBeenCalled();
      expect(result.fillStyle).toHaveBeenCalledWith(0x333333);
      expect(result.fillRoundedRect).toHaveBeenCalledWith(0, 75, 200, 50, 10);
    });

    it('createRoundedRect()のradiusはデフォルトで8', () => {
      uiFactory.createRoundedRect(100, 100, 200, 50, 0x333333);

      const graphics = mockScene.add.graphics();
      expect(graphics.fillRoundedRect).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        expect.any(Number),
        expect.any(Number),
        8
      );
    });

    it('createRoundedRectWithStroke()で枠線付き角丸四角形を生成できる', () => {
      const result = uiFactory.createRoundedRectWithStroke(
        100,
        100,
        200,
        50,
        0x333333,
        0x666666,
        2,
        10
      );

      expect(mockScene.add.graphics).toHaveBeenCalled();
      expect(result.fillStyle).toHaveBeenCalledWith(0x333333);
      expect(result.lineStyle).toHaveBeenCalledWith(2, 0x666666);
    });

    it('createText()でテキストを生成できる', () => {
      const result = uiFactory.createText(100, 100, 'Hello', 'body');

      expect(mockScene.add.text).toHaveBeenCalled();
      expect(result.setOrigin).toHaveBeenCalledWith(0.5);
    });
  });
});
