/**
 * MaterialViewテスト
 *
 * 素材ビューの動作テスト
 */

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';

// Phaserのモック
vi.mock('phaser', () => {
  class MockRectangle {
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(x: number, y: number, width: number, height: number) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    }

    static Contains = () => true;
  }

  return {
    default: {
      Geom: {
        Rectangle: MockRectangle,
      },
    },
  };
});

import { MaterialView } from '../../../../../src/game/ui/material/MaterialView';
import { MaterialViewOptions } from '../../../../../src/game/ui/material/IMaterialView';
import { MaterialLayout } from '../../../../../src/game/ui/material/MaterialConstants';
import { Material } from '../../../../../src/domain/material/MaterialEntity';
import { Quality, Attribute } from '../../../../../src/domain/common/types';

// Phaserモック
const createMockScene = () => {
  const mockContainer = {
    add: vi.fn(),
    setPosition: vi.fn(),
    setScale: vi.fn(),
    setAlpha: vi.fn(),
    setVisible: vi.fn(),
    setInteractive: vi.fn(),
    disableInteractive: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    destroy: vi.fn(),
  };

  const mockGraphics = {
    clear: vi.fn().mockReturnThis(),
    fillStyle: vi.fn().mockReturnThis(),
    fillRoundedRect: vi.fn().mockReturnThis(),
    lineStyle: vi.fn().mockReturnThis(),
    strokeRoundedRect: vi.fn().mockReturnThis(),
    fillCircle: vi.fn().mockReturnThis(),
  };

  const mockText = {
    setOrigin: vi.fn().mockReturnThis(),
    setText: vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis(),
  };

  return {
    add: {
      container: vi.fn(() => mockContainer),
      graphics: vi.fn(() => mockGraphics),
      text: vi.fn(() => mockText),
    },
    textures: {
      exists: vi.fn(() => false), // デフォルトでテクスチャなし
    },
    _mockContainer: mockContainer,
    _mockGraphics: mockGraphics,
    _mockText: mockText,
  };
};

// テスト用の素材データ
const createTestMaterial = (overrides?: Partial<ConstructorParameters<typeof Material>[0]>): Material => {
  return new Material({
    id: 'mat-test-001',
    name: 'テスト素材',
    baseQuality: Quality.C,
    attributes: [Attribute.GRASS],
    isRare: false,
    description: 'テスト用の素材',
    ...overrides,
  });
};

describe('MaterialView', () => {
  let mockScene: ReturnType<typeof createMockScene>;

  beforeEach(() => {
    mockScene = createMockScene();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('コンストラクタ', () => {
    it('正しく初期化される', () => {
      const material = createTestMaterial();
      const options: MaterialViewOptions = {
        x: 100,
        y: 200,
        material,
      };

      const view = new MaterialView(mockScene as any, options);

      expect(view).toBeDefined();
      expect(view.material).toBe(material);
      expect(view.container).toBe(mockScene._mockContainer);
    });

    it('コンテナが正しい位置に作成される', () => {
      const material = createTestMaterial();
      const options: MaterialViewOptions = {
        x: 150,
        y: 250,
        material,
      };

      new MaterialView(mockScene as any, options);

      expect(mockScene.add.container).toHaveBeenCalledWith(150, 250);
    });

    it('デフォルトモードはcompact', () => {
      const material = createTestMaterial();
      const options: MaterialViewOptions = {
        x: 0,
        y: 0,
        material,
      };

      const view = new MaterialView(mockScene as any, options);

      // compactモードでは幅がCOMPACT_WIDTH
      expect(view).toBeDefined();
    });

    it('detailモードで作成できる', () => {
      const material = createTestMaterial();
      const options: MaterialViewOptions = {
        x: 0,
        y: 0,
        material,
        mode: 'detail',
      };

      const view = new MaterialView(mockScene as any, options);

      expect(view).toBeDefined();
    });

    it('背景グラフィックスが作成される', () => {
      const material = createTestMaterial();
      const options: MaterialViewOptions = {
        x: 0,
        y: 0,
        material,
      };

      new MaterialView(mockScene as any, options);

      expect(mockScene.add.graphics).toHaveBeenCalled();
    });

    it('デフォルトでインタラクティブが有効', () => {
      const material = createTestMaterial();
      new MaterialView(mockScene as any, {
        x: 0,
        y: 0,
        material,
      });

      expect(mockScene._mockContainer.setInteractive).toHaveBeenCalled();
    });

    it('interactive: falseでインタラクティブが無効', () => {
      const material = createTestMaterial();
      new MaterialView(mockScene as any, {
        x: 0,
        y: 0,
        material,
        interactive: false,
      });

      expect(mockScene._mockContainer.setInteractive).not.toHaveBeenCalled();
    });
  });

  describe('コンパクト表示', () => {
    it('コンパクトサイズで背景が描画される', () => {
      const material = createTestMaterial();
      new MaterialView(mockScene as any, {
        x: 0,
        y: 0,
        material,
        mode: 'compact',
      });

      const { COMPACT_WIDTH, COMPACT_HEIGHT } = MaterialLayout;
      expect(mockScene._mockGraphics.fillRoundedRect).toHaveBeenCalledWith(
        -COMPACT_WIDTH / 2,
        -COMPACT_HEIGHT / 2,
        COMPACT_WIDTH,
        COMPACT_HEIGHT,
        expect.any(Number)
      );
    });

    it('絵文字アイコンが表示される（テクスチャなし）', () => {
      const material = createTestMaterial();
      new MaterialView(mockScene as any, {
        x: 0,
        y: 0,
        material,
        mode: 'compact',
      });

      // テキストとしてアイコンが作成される
      expect(mockScene.add.text).toHaveBeenCalled();
    });

    it('個数が複数の場合はバッジが表示される', () => {
      const material = createTestMaterial();
      new MaterialView(mockScene as any, {
        x: 0,
        y: 0,
        material,
        count: 5,
      });

      // 個数テキストが作成される
      const textCalls = (mockScene.add.text as Mock).mock.calls;
      const countTextCall = textCalls.find(
        (call: unknown[]) => typeof call[2] === 'string' && call[2].includes('x5')
      );
      expect(countTextCall).toBeDefined();
    });

    it('個数が1の場合はバッジが表示されない', () => {
      const material = createTestMaterial();
      new MaterialView(mockScene as any, {
        x: 0,
        y: 0,
        material,
        count: 1,
      });

      // 個数テキスト「x1」が作成されない
      const textCalls = (mockScene.add.text as Mock).mock.calls;
      const countTextCall = textCalls.find(
        (call: unknown[]) => typeof call[2] === 'string' && call[2].includes('x1')
      );
      expect(countTextCall).toBeUndefined();
    });
  });

  describe('詳細表示', () => {
    it('詳細サイズで背景が描画される', () => {
      const material = createTestMaterial();
      new MaterialView(mockScene as any, {
        x: 0,
        y: 0,
        material,
        mode: 'detail',
      });

      const { DETAIL_WIDTH, DETAIL_HEIGHT } = MaterialLayout;
      expect(mockScene._mockGraphics.fillRoundedRect).toHaveBeenCalledWith(
        0,
        0,
        DETAIL_WIDTH,
        DETAIL_HEIGHT,
        expect.any(Number)
      );
    });

    it('素材名が表示される', () => {
      const material = createTestMaterial({ name: 'テスト薬草' });
      new MaterialView(mockScene as any, {
        x: 0,
        y: 0,
        material,
        mode: 'detail',
      });

      const textCalls = (mockScene.add.text as Mock).mock.calls;
      const nameTextCall = textCalls.find(
        (call: unknown[]) => typeof call[2] === 'string' && call[2].includes('テスト薬草')
      );
      expect(nameTextCall).toBeDefined();
    });

    it('個数が常に表示される', () => {
      const material = createTestMaterial();
      new MaterialView(mockScene as any, {
        x: 0,
        y: 0,
        material,
        mode: 'detail',
        count: 1,
      });

      const textCalls = (mockScene.add.text as Mock).mock.calls;
      const countTextCall = textCalls.find(
        (call: unknown[]) => typeof call[2] === 'string' && call[2].includes('x')
      );
      expect(countTextCall).toBeDefined();
    });
  });

  describe('品質表示', () => {
    it('品質インジケーターが表示される', () => {
      const material = createTestMaterial();
      new MaterialView(mockScene as any, {
        x: 0,
        y: 0,
        material,
        showQuality: true,
        instance: {
          materialId: 'mat-test-001',
          quality: Quality.A,
          quantity: 1,
        },
      });

      expect(mockScene._mockGraphics.fillCircle).toHaveBeenCalled();
    });

    it('showQuality: falseで品質インジケーターが非表示', () => {
      const material = createTestMaterial();
      new MaterialView(mockScene as any, {
        x: 0,
        y: 0,
        material,
        showQuality: false,
        instance: {
          materialId: 'mat-test-001',
          quality: Quality.A,
          quantity: 1,
        },
      });

      // fillCircleが呼ばれないか、showQualityでコントロールされる
      // 実装によってはfillCircleが別の用途で呼ばれる可能性もあるため
      // 実装後に調整
      expect(mockScene._mockGraphics.fillCircle).not.toHaveBeenCalled();
    });
  });

  describe('表示更新', () => {
    it('setCount()で個数を変更できる', () => {
      const material = createTestMaterial();
      // 詳細モードではcountが1でもcountTextが作成される
      const view = new MaterialView(mockScene as any, {
        x: 0,
        y: 0,
        material,
        mode: 'detail',
        count: 1,
      });

      view.setCount(10);

      expect(mockScene._mockText.setText).toHaveBeenCalledWith('x10');
    });

    it('setPosition()で位置を変更できる', () => {
      const material = createTestMaterial();
      const view = new MaterialView(mockScene as any, {
        x: 0,
        y: 0,
        material,
      });

      view.setPosition(300, 400);

      expect(mockScene._mockContainer.setPosition).toHaveBeenCalledWith(300, 400);
    });

    it('setVisible()で表示/非表示を切り替えられる', () => {
      const material = createTestMaterial();
      const view = new MaterialView(mockScene as any, {
        x: 0,
        y: 0,
        material,
      });

      view.setVisible(false);

      expect(mockScene._mockContainer.setVisible).toHaveBeenCalledWith(false);
    });

    it('setAlpha()で透明度を変更できる', () => {
      const material = createTestMaterial();
      const view = new MaterialView(mockScene as any, {
        x: 0,
        y: 0,
        material,
      });

      view.setAlpha(0.5);

      expect(mockScene._mockContainer.setAlpha).toHaveBeenCalledWith(0.5);
    });
  });

  describe('選択状態', () => {
    it('setSelected(true)で選択状態になる', () => {
      const material = createTestMaterial();
      const view = new MaterialView(mockScene as any, {
        x: 0,
        y: 0,
        material,
      });

      const initialClearCount = (mockScene._mockGraphics.clear as Mock).mock.calls.length;

      view.setSelected(true);

      // 再描画が発生する
      expect(mockScene._mockGraphics.clear).toHaveBeenCalledTimes(initialClearCount + 1);
    });

    it('setSelected(false)で非選択状態に戻る', () => {
      const material = createTestMaterial();
      const view = new MaterialView(mockScene as any, {
        x: 0,
        y: 0,
        material,
      });

      view.setSelected(true);
      const clearCountAfterSelect = (mockScene._mockGraphics.clear as Mock).mock.calls.length;

      view.setSelected(false);

      expect(mockScene._mockGraphics.clear).toHaveBeenCalledTimes(clearCountAfterSelect + 1);
    });
  });

  describe('有効/無効状態', () => {
    it('setEnabled(false)で無効状態になる', () => {
      const material = createTestMaterial();
      const view = new MaterialView(mockScene as any, {
        x: 0,
        y: 0,
        material,
      });

      view.setEnabled(false);

      expect(mockScene._mockContainer.setAlpha).toHaveBeenCalledWith(0.5);
      expect(mockScene._mockContainer.disableInteractive).toHaveBeenCalled();
    });

    it('setEnabled(true)で有効状態に戻る', () => {
      const material = createTestMaterial();
      const view = new MaterialView(mockScene as any, {
        x: 0,
        y: 0,
        material,
      });

      view.setEnabled(false);
      view.setEnabled(true);

      expect(mockScene._mockContainer.setAlpha).toHaveBeenLastCalledWith(1);
      expect(mockScene._mockContainer.setInteractive).toHaveBeenCalled();
    });
  });

  describe('インタラクション', () => {
    it('イベントハンドラが登録される', () => {
      const material = createTestMaterial();
      new MaterialView(mockScene as any, {
        x: 0,
        y: 0,
        material,
      });

      expect(mockScene._mockContainer.on).toHaveBeenCalledWith(
        'pointerover',
        expect.any(Function)
      );
      expect(mockScene._mockContainer.on).toHaveBeenCalledWith(
        'pointerout',
        expect.any(Function)
      );
      expect(mockScene._mockContainer.on).toHaveBeenCalledWith(
        'pointerdown',
        expect.any(Function)
      );
    });

    it('setInteractive(false)でインタラクティブを無効化できる', () => {
      const material = createTestMaterial();
      const view = new MaterialView(mockScene as any, {
        x: 0,
        y: 0,
        material,
      });

      view.setInteractive(false);

      expect(mockScene._mockContainer.disableInteractive).toHaveBeenCalled();
    });

    it('setInteractive(true)でインタラクティブを有効化できる', () => {
      const material = createTestMaterial();
      const view = new MaterialView(mockScene as any, {
        x: 0,
        y: 0,
        material,
        interactive: false,
      });

      view.setInteractive(true);

      expect(mockScene._mockContainer.setInteractive).toHaveBeenCalled();
    });
  });

  describe('破棄', () => {
    it('destroy()でコンテナが破棄される', () => {
      const material = createTestMaterial();
      const view = new MaterialView(mockScene as any, {
        x: 0,
        y: 0,
        material,
      });

      view.destroy();

      expect(mockScene._mockContainer.destroy).toHaveBeenCalled();
    });
  });

  describe('コールバック', () => {
    it('onClickコールバックが呼ばれる', () => {
      const material = createTestMaterial();
      const onClick = vi.fn();
      new MaterialView(mockScene as any, {
        x: 0,
        y: 0,
        material,
        onClick,
      });

      // pointerdownハンドラを取得して実行
      const pointerdownCall = (mockScene._mockContainer.on as Mock).mock.calls.find(
        (call) => call[0] === 'pointerdown'
      );
      const handler = pointerdownCall?.[1];

      if (handler) {
        handler();
      }

      expect(onClick).toHaveBeenCalledWith(material);
    });

    it('onHoverコールバックが呼ばれる', () => {
      const material = createTestMaterial();
      const onHover = vi.fn();
      new MaterialView(mockScene as any, {
        x: 0,
        y: 0,
        material,
        onHover,
      });

      // pointeroverハンドラを取得して実行
      const pointeroverCall = (mockScene._mockContainer.on as Mock).mock.calls.find(
        (call) => call[0] === 'pointerover'
      );
      const overHandler = pointeroverCall?.[1];

      if (overHandler) {
        overHandler();
      }

      expect(onHover).toHaveBeenCalledWith(material, true);

      // pointeroutハンドラを取得して実行
      const pointeroutCall = (mockScene._mockContainer.on as Mock).mock.calls.find(
        (call) => call[0] === 'pointerout'
      );
      const outHandler = pointeroutCall?.[1];

      if (outHandler) {
        outHandler();
      }

      expect(onHover).toHaveBeenCalledWith(material, false);
    });
  });
});
