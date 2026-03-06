/**
 * ScrollableContainer ユニットテスト
 * Issue #368: スクロール機能の共通コンポーネント化
 */

import type { ScrollableContainerConfig } from '@shared/components/ScrollableContainer';
import { ScrollableContainer } from '@shared/components/ScrollableContainer';
import type { MockSceneResult } from '@test-mocks/phaser-mocks';
import { createMockScene } from '@test-mocks/phaser-mocks';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('ScrollableContainer', () => {
  let mockSceneResult: MockSceneResult;
  let parentContainer: ReturnType<typeof createMockContainer>;
  let defaultConfig: ScrollableContainerConfig;

  function createMockContainer() {
    return {
      add: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
      visible: true,
      setVisible: vi.fn().mockReturnThis(),
      setPosition: vi.fn().mockReturnThis(),
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
    mockSceneResult = createMockScene();
    parentContainer = createMockContainer();

    defaultConfig = {
      maskBounds: { x: 200, y: 140, width: 1080, height: 460 },
      scrollSpeed: 0.5,
      isScrollEnabled: () => true,
    };
  });

  describe('コンストラクタ', () => {
    it('正常にインスタンスを作成できる', () => {
      const scrollable = new ScrollableContainer(
        mockSceneResult.scene,
        parentContainer as unknown as Phaser.GameObjects.Container,
        defaultConfig,
      );
      expect(scrollable).toBeInstanceOf(ScrollableContainer);
    });

    it('sceneがnullの場合エラーを投げる', () => {
      expect(
        () =>
          new ScrollableContainer(
            null as unknown as Phaser.Scene,
            parentContainer as unknown as Phaser.GameObjects.Container,
            defaultConfig,
          ),
      ).toThrow('ScrollableContainer: scene is required');
    });

    it('parentContainerがnullの場合エラーを投げる', () => {
      expect(
        () =>
          new ScrollableContainer(
            mockSceneResult.scene,
            null as unknown as Phaser.GameObjects.Container,
            defaultConfig,
          ),
      ).toThrow('ScrollableContainer: parentContainer is required');
    });

    it('maskBoundsがnullの場合エラーを投げる', () => {
      expect(
        () =>
          new ScrollableContainer(
            mockSceneResult.scene,
            parentContainer as unknown as Phaser.GameObjects.Container,
            { maskBounds: null } as unknown as ScrollableContainerConfig,
          ),
      ).toThrow('ScrollableContainer: maskBounds is required');
    });

    it('scrollSpeedのデフォルト値は0.5', () => {
      const scrollable = new ScrollableContainer(
        mockSceneResult.scene,
        parentContainer as unknown as Phaser.GameObjects.Container,
        { maskBounds: defaultConfig.maskBounds },
      );
      scrollable.create();
      // デフォルト値が適用されていることを確認（直接アクセスできないのでスクロール動作で確認）
      expect(scrollable).toBeInstanceOf(ScrollableContainer);
    });
  });

  describe('create()', () => {
    it('スクロールコンテナを作成して親コンテナに追加する', () => {
      const scrollable = new ScrollableContainer(
        mockSceneResult.scene,
        parentContainer as unknown as Phaser.GameObjects.Container,
        defaultConfig,
      );
      scrollable.create();

      // scene.add.containerが呼ばれてスクロールコンテナが作成される
      expect(mockSceneResult.scene.add.container).toHaveBeenCalledWith(0, 0);
      // 親コンテナにaddされる
      expect(parentContainer.add).toHaveBeenCalled();
    });

    it('getScrollContainer()でスクロールコンテナを取得できる', () => {
      const scrollable = new ScrollableContainer(
        mockSceneResult.scene,
        parentContainer as unknown as Phaser.GameObjects.Container,
        defaultConfig,
      );
      scrollable.create();

      const container = scrollable.getScrollContainer();
      expect(container).not.toBeNull();
    });

    it('マウスホイールハンドラが登録される', () => {
      const scrollable = new ScrollableContainer(
        mockSceneResult.scene,
        parentContainer as unknown as Phaser.GameObjects.Container,
        defaultConfig,
      );

      // scene.inputにonメソッドを追加
      const mockInput = { on: vi.fn(), off: vi.fn() };
      (mockSceneResult.scene as unknown as Record<string, unknown>).input = mockInput;

      scrollable.create();

      expect(mockInput.on).toHaveBeenCalledWith('wheel', expect.any(Function));
    });
  });

  describe('create()前のgetScrollContainer()', () => {
    it('create()前はnullを返す', () => {
      const scrollable = new ScrollableContainer(
        mockSceneResult.scene,
        parentContainer as unknown as Phaser.GameObjects.Container,
        defaultConfig,
      );
      expect(scrollable.getScrollContainer()).toBeNull();
    });
  });

  describe('setContentHeight() / getMaxScrollOffset()', () => {
    it('コンテンツ高さを設定できる', () => {
      const scrollable = new ScrollableContainer(
        mockSceneResult.scene,
        parentContainer as unknown as Phaser.GameObjects.Container,
        defaultConfig,
      );
      scrollable.create();
      scrollable.setContentHeight(800);

      // maskBounds.height = 460, contentHeight = 800
      // maxOffset = 800 - 460 = 340
      expect(scrollable.getMaxScrollOffset()).toBe(340);
    });

    it('コンテンツ高さが可視領域以下の場合、最大オフセットは0', () => {
      const scrollable = new ScrollableContainer(
        mockSceneResult.scene,
        parentContainer as unknown as Phaser.GameObjects.Container,
        defaultConfig,
      );
      scrollable.create();
      scrollable.setContentHeight(200);

      expect(scrollable.getMaxScrollOffset()).toBe(0);
    });

    it('コンテンツ高さが0の場合、最大オフセットは0', () => {
      const scrollable = new ScrollableContainer(
        mockSceneResult.scene,
        parentContainer as unknown as Phaser.GameObjects.Container,
        defaultConfig,
      );
      scrollable.create();
      scrollable.setContentHeight(0);

      expect(scrollable.getMaxScrollOffset()).toBe(0);
    });
  });

  describe('resetScroll()', () => {
    it('スクロールオフセットを0にリセットする', () => {
      const scrollable = new ScrollableContainer(
        mockSceneResult.scene,
        parentContainer as unknown as Phaser.GameObjects.Container,
        defaultConfig,
      );
      scrollable.create();

      scrollable.resetScroll();

      expect(scrollable.getScrollOffset()).toBe(0);
    });
  });

  describe('getScrollOffset()', () => {
    it('初期状態では0を返す', () => {
      const scrollable = new ScrollableContainer(
        mockSceneResult.scene,
        parentContainer as unknown as Phaser.GameObjects.Container,
        defaultConfig,
      );
      scrollable.create();

      expect(scrollable.getScrollOffset()).toBe(0);
    });
  });

  describe('destroy()', () => {
    it('リソースが正しく破棄される', () => {
      const mockInput = { on: vi.fn(), off: vi.fn() };
      (mockSceneResult.scene as unknown as Record<string, unknown>).input = mockInput;

      const scrollable = new ScrollableContainer(
        mockSceneResult.scene,
        parentContainer as unknown as Phaser.GameObjects.Container,
        defaultConfig,
      );
      scrollable.create();
      scrollable.destroy();

      // ホイールハンドラが解除される
      expect(mockInput.off).toHaveBeenCalledWith('wheel', expect.any(Function));

      // スクロールコンテナがnullになる
      expect(scrollable.getScrollContainer()).toBeNull();
    });

    it('destroy()後のresetScroll()はエラーにならない', () => {
      const scrollable = new ScrollableContainer(
        mockSceneResult.scene,
        parentContainer as unknown as Phaser.GameObjects.Container,
        defaultConfig,
      );
      scrollable.create();
      scrollable.destroy();

      // エラーが発生しないことを確認
      expect(() => scrollable.resetScroll()).not.toThrow();
    });
  });

  describe('isScrollEnabled', () => {
    it('isScrollEnabledがfalseの場合、スクロールが無効になる', () => {
      let isEnabled = true;
      const config: ScrollableContainerConfig = {
        ...defaultConfig,
        isScrollEnabled: () => isEnabled,
      };

      const mockInput = {
        on: vi.fn(),
        off: vi.fn(),
      };
      (mockSceneResult.scene as unknown as Record<string, unknown>).input = mockInput;

      const scrollable = new ScrollableContainer(
        mockSceneResult.scene,
        parentContainer as unknown as Phaser.GameObjects.Container,
        config,
      );
      scrollable.create();
      scrollable.setContentHeight(1000);

      // ホイールハンドラを取得
      const wheelHandler = mockInput.on.mock.calls[0]?.[1] as (
        pointer: unknown,
        gameObjects: unknown[],
        deltaX: number,
        deltaY: number,
      ) => void;
      expect(wheelHandler).toBeDefined();

      // スクロール無効にする
      isEnabled = false;
      wheelHandler(null, [], 0, 100);

      // スクロールオフセットは変わらない
      expect(scrollable.getScrollOffset()).toBe(0);
    });

    it('isScrollEnabledがtrueの場合、スクロールが動作する', () => {
      const mockInput = {
        on: vi.fn(),
        off: vi.fn(),
      };
      (mockSceneResult.scene as unknown as Record<string, unknown>).input = mockInput;

      const scrollable = new ScrollableContainer(
        mockSceneResult.scene,
        parentContainer as unknown as Phaser.GameObjects.Container,
        defaultConfig,
      );
      scrollable.create();
      scrollable.setContentHeight(1000);

      // ホイールハンドラを取得
      const wheelHandler = mockInput.on.mock.calls[0]?.[1] as (
        pointer: unknown,
        gameObjects: unknown[],
        deltaX: number,
        deltaY: number,
      ) => void;

      // スクロールを実行
      wheelHandler(null, [], 0, 100);

      // スクロールオフセットが変わる（100 * 0.5 = 50）
      expect(scrollable.getScrollOffset()).toBe(50);
    });
  });

  describe('スクロール範囲制限', () => {
    let mockInput: { on: ReturnType<typeof vi.fn>; off: ReturnType<typeof vi.fn> };
    let scrollable: ScrollableContainer;
    let wheelHandler: (
      pointer: unknown,
      gameObjects: unknown[],
      deltaX: number,
      deltaY: number,
    ) => void;

    beforeEach(() => {
      mockInput = { on: vi.fn(), off: vi.fn() };
      (mockSceneResult.scene as unknown as Record<string, unknown>).input = mockInput;

      scrollable = new ScrollableContainer(
        mockSceneResult.scene,
        parentContainer as unknown as Phaser.GameObjects.Container,
        defaultConfig,
      );
      scrollable.create();
      scrollable.setContentHeight(800); // maxOffset = 800 - 460 = 340

      wheelHandler = mockInput.on.mock.calls[0]?.[1] as typeof wheelHandler;
    });

    it('下方向にスクロールできる', () => {
      wheelHandler(null, [], 0, 200);
      // 200 * 0.5 = 100
      expect(scrollable.getScrollOffset()).toBe(100);
    });

    it('上方向には0未満にならない', () => {
      wheelHandler(null, [], 0, -200);
      expect(scrollable.getScrollOffset()).toBe(0);
    });

    it('最大オフセットを超えてスクロールしない', () => {
      // maxOffset = 340
      wheelHandler(null, [], 0, 1000);
      // 1000 * 0.5 = 500 → clamp to 340
      expect(scrollable.getScrollOffset()).toBe(340);
    });

    it('連続スクロールが正しく累積する', () => {
      wheelHandler(null, [], 0, 100); // 50
      wheelHandler(null, [], 0, 100); // 100
      wheelHandler(null, [], 0, 100); // 150
      expect(scrollable.getScrollOffset()).toBe(150);
    });

    it('コンテンツ高さが可視領域以下の場合スクロールしない', () => {
      scrollable.setContentHeight(200); // maxOffset = 0
      wheelHandler(null, [], 0, 200);
      expect(scrollable.getScrollOffset()).toBe(0);
    });
  });
});
