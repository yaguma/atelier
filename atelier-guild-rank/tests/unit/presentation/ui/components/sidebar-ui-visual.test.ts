/**
 * SidebarUI - 視覚実装テスト
 * TASK-0047 共通UIコンポーネント視覚実装
 *
 * @description
 * サイドバーUIの視覚要素（セクションヘッダー、保管容量、ショップボタン）をテストする
 *
 * @信頼性レベル 🔵 testcases.md セクション4に基づく
 */

import { SidebarUI } from '@presentation/ui/components/SidebarUI';
import type Phaser from 'phaser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// =============================================================================
// モック定義
// =============================================================================

/**
 * Textモックインターフェース
 */
interface MockText {
  setText: ReturnType<typeof vi.fn>;
  setStyle: ReturnType<typeof vi.fn>;
  setColor: ReturnType<typeof vi.fn>;
  setAlpha: ReturnType<typeof vi.fn>;
  setPosition: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
  text: string;
}

/**
 * Graphicsモックインターフェース
 */
interface MockGraphics {
  fillStyle: ReturnType<typeof vi.fn>;
  fillRect: ReturnType<typeof vi.fn>;
  clear: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
}

/**
 * Rectangleモックインターフェース
 */
interface MockRectangle {
  setFillStyle: ReturnType<typeof vi.fn>;
  setStrokeStyle: ReturnType<typeof vi.fn>;
  setInteractive: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
}

/**
 * Containerモックインターフェース
 */
interface MockContainer {
  add: ReturnType<typeof vi.fn>;
  setPosition: ReturnType<typeof vi.fn>;
  setVisible: ReturnType<typeof vi.fn>;
  setDepth: ReturnType<typeof vi.fn>;
  getAt: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
}

/**
 * Sceneモックインターフェース
 */
interface MockScene extends Phaser.Scene {
  add: {
    container: ReturnType<typeof vi.fn>;
    text: ReturnType<typeof vi.fn>;
    graphics: ReturnType<typeof vi.fn>;
    rectangle: ReturnType<typeof vi.fn>;
    circle: ReturnType<typeof vi.fn>;
  };
  tweens: {
    add: ReturnType<typeof vi.fn>;
    killTweensOf: ReturnType<typeof vi.fn>;
  };
  cameras: {
    main: {
      width: number;
      height: number;
    };
  };
}

/**
 * Phaserシーンのモックを作成する
 */
const createMockScene = (): {
  scene: MockScene;
  mockContainer: MockContainer;
  mockText: MockText;
  mockGraphics: MockGraphics;
  mockRectangle: MockRectangle;
} => {
  const mockText: MockText = {
    setText: vi.fn().mockReturnThis(),
    setStyle: vi.fn().mockReturnThis(),
    setColor: vi.fn().mockReturnThis(),
    setAlpha: vi.fn().mockReturnThis(),
    setPosition: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    text: '',
  };

  const mockGraphics: MockGraphics = {
    fillStyle: vi.fn().mockReturnThis(),
    fillRect: vi.fn().mockReturnThis(),
    clear: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  };

  const mockRectangle: MockRectangle = {
    setFillStyle: vi.fn().mockReturnThis(),
    setStrokeStyle: vi.fn().mockReturnThis(),
    setInteractive: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  };

  const mockContainer: MockContainer = {
    add: vi.fn().mockReturnThis(),
    setPosition: vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis(),
    setDepth: vi.fn().mockReturnThis(),
    getAt: vi.fn(),
    destroy: vi.fn(),
  };

  const scene = {
    add: {
      container: vi.fn().mockReturnValue(mockContainer),
      text: vi.fn().mockReturnValue(mockText),
      graphics: vi.fn().mockReturnValue(mockGraphics),
      rectangle: vi.fn().mockReturnValue(mockRectangle),
      circle: vi.fn().mockReturnValue({
        setFillStyle: vi.fn().mockReturnThis(),
        setStrokeStyle: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
      }),
    },
    tweens: {
      add: vi.fn().mockReturnValue({ stop: vi.fn() }),
      killTweensOf: vi.fn(),
    },
    cameras: {
      main: {
        width: 1280,
        height: 720,
      },
    },
  } as unknown as MockScene;

  return { scene, mockContainer, mockText, mockGraphics, mockRectangle };
};

// =============================================================================
// テストスイート
// =============================================================================

describe('SidebarUI 視覚実装テスト', () => {
  let scene: MockScene;
  let sidebarUI: SidebarUI;
  let mockText: MockText;
  let mockRectangle: MockRectangle;

  beforeEach(() => {
    const mocks = createMockScene();
    scene = mocks.scene;
    mockText = mocks.mockText;
    mockRectangle = mocks.mockRectangle;

    // SidebarUIを初期化（x: 0, y: 0で作成）
    sidebarUI = new SidebarUI(scene, 0, 0);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // セクションヘッダーテスト
  // ===========================================================================

  describe('セクションヘッダー', () => {
    describe('SUI-V-01: create()で受注依頼セクションヘッダーが生成されること', () => {
      // 【テスト目的】: create()メソッド呼び出し後に受注依頼セクションヘッダーが生成されることを確認
      // 【対応要件】: REQ-047-08

      it('SUI-V-01: 受注依頼セクションヘッダーが生成される', () => {
        // Given: SidebarUIが初期化済み
        // When: create()を呼び出す
        sidebarUI.create();

        // Then:
        // - getQuestsSection()でセクションが取得できる
        const questSection = sidebarUI.getQuestsSection();
        expect(questSection).not.toBeNull();
        // - scene.add.textが「受注依頼」タイトル用に呼び出される
        // Note: 現在の実装では視覚要素は生成されないため、このテストは失敗する
        expect(scene.add.text).toHaveBeenCalledWith(
          expect.any(Number),
          expect.any(Number),
          expect.stringContaining('受注依頼'),
          expect.any(Object),
        );
      });
    });

    describe('SUI-V-02: create()で素材セクションヘッダーが生成されること', () => {
      // 【テスト目的】: create()メソッド呼び出し後に素材セクションヘッダーが生成されることを確認
      // 【対応要件】: REQ-047-09

      it('SUI-V-02: 素材セクションヘッダーが生成される', () => {
        // Given: SidebarUIが初期化済み
        // When: create()を呼び出す
        sidebarUI.create();

        // Then:
        // - getMaterialsSection()でセクションが取得できる
        const materialSection = sidebarUI.getMaterialsSection();
        expect(materialSection).not.toBeNull();
        // - scene.add.textが「素材」タイトル用に呼び出される
        // Note: 現在の実装では視覚要素は生成されないため、このテストは失敗する
        expect(scene.add.text).toHaveBeenCalledWith(
          expect.any(Number),
          expect.any(Number),
          expect.stringContaining('素材'),
          expect.any(Object),
        );
      });
    });

    describe('SUI-V-03: create()で完成品セクションヘッダーが生成されること', () => {
      // 【テスト目的】: create()メソッド呼び出し後に完成品セクションヘッダーが生成されることを確認
      // 【対応要件】: REQ-047-10

      it('SUI-V-03: 完成品セクションヘッダーが生成される', () => {
        // Given: SidebarUIが初期化済み
        // When: create()を呼び出す
        sidebarUI.create();

        // Then:
        // - getCraftedItemsSection()でセクションが取得できる
        const itemSection = sidebarUI.getCraftedItemsSection();
        expect(itemSection).not.toBeNull();
        // - scene.add.textが「完成品」タイトル用に呼び出される
        // Note: 現在の実装では視覚要素は生成されないため、このテストは失敗する
        expect(scene.add.text).toHaveBeenCalledWith(
          expect.any(Number),
          expect.any(Number),
          expect.stringContaining('完成品'),
          expect.any(Object),
        );
      });
    });

    describe('SUI-V-04: toggleSection()でアイコンが変化すること', () => {
      // 【テスト目的】: セクションの折りたたみ/展開時にアイコンが変化することを確認
      // 【対応要件】: REQ-047-11

      it('SUI-V-04: セクション折りたたみ時にアイコンが変化する', () => {
        // Given: SidebarUIが初期化済み
        sidebarUI.create();

        // 初期状態は展開（isSectionCollapsedがfalse）
        expect(sidebarUI.isSectionCollapsed('quests')).toBe(false);

        // When: セクションを折りたたむ
        sidebarUI.toggleSection('quests');

        // Then:
        // - isSectionCollapsed('quests')がtrueになる
        expect(sidebarUI.isSectionCollapsed('quests')).toBe(true);
        // - 視覚要素のアイコンが▶に変化する（setText('▶')が呼び出される）
        // Note: 現在の実装では視覚要素は更新されないため、このテストは失敗する
        expect(mockText.setText).toHaveBeenCalledWith('▶');
      });

      it('SUI-V-04b: セクション展開時にアイコンが変化する', () => {
        // Given: SidebarUIが初期化済み、セクションが折りたたまれている
        sidebarUI.create();
        sidebarUI.toggleSection('quests'); // 折りたたむ

        // When: セクションを展開する
        sidebarUI.toggleSection('quests');

        // Then:
        // - isSectionCollapsed('quests')がfalseになる
        expect(sidebarUI.isSectionCollapsed('quests')).toBe(false);
        // - 視覚要素のアイコンが▼に変化する（setText('▼')が呼び出される）
        // Note: 現在の実装では視覚要素は更新されないため、このテストは失敗する
        expect(mockText.setText).toHaveBeenCalledWith('▼');
      });
    });
  });

  // ===========================================================================
  // 保管容量テスト
  // ===========================================================================

  describe('保管容量', () => {
    describe('SUI-V-05: create()で保管容量テキストが生成されること', () => {
      // 【テスト目的】: create()メソッド呼び出し後に保管容量テキストが生成されることを確認
      // 【対応要件】: REQ-047-12

      it('SUI-V-05: 保管容量テキストが生成される', () => {
        // Given: SidebarUIが初期化済み
        // When: create()を呼び出す
        sidebarUI.create();

        // Then:
        // - getStorageText()で値が取得できる
        const storageText = sidebarUI.getStorageText();
        expect(storageText).toBeDefined();
        // - scene.add.textが保管容量用に呼び出される
        // Note: 現在の実装では視覚要素は生成されないため、このテストは失敗する
        expect(scene.add.text).toHaveBeenCalledWith(
          expect.any(Number),
          expect.any(Number),
          expect.stringContaining('保管'),
          expect.any(Object),
        );
      });
    });

    describe('SUI-V-06: update()で保管容量テキストが更新されること', () => {
      // 【テスト目的】: update()呼び出し時に保管容量テキストが正しく更新されることを確認
      // 【対応要件】: REQ-047-12

      it('SUI-V-06: 保管容量更新時にテキストが変更される', () => {
        // Given: SidebarUIが初期化済み
        sidebarUI.create();

        // When: 保管容量を10/20に更新する
        sidebarUI.update({
          activeQuests: [],
          materials: [],
          craftedItems: [],
          currentStorage: 10,
          maxStorage: 20,
        });

        // Then:
        // - getStorageText()で更新された値が取得できる
        expect(sidebarUI.getStorageText()).toBe('保管: 10/20');
        // - 視覚要素のsetTextが「保管: 10/20」形式で呼び出される
        // Note: 現在の実装では視覚要素は更新されないため、このテストは失敗する
        expect(mockText.setText).toHaveBeenCalledWith('保管: 10/20');
      });

      it('SUI-V-06b: 保管容量80%以上で警告色になる', () => {
        // Given: SidebarUIが初期化済み
        sidebarUI.create();

        // When: 保管容量を16/20（80%）に更新する
        sidebarUI.update({
          activeQuests: [],
          materials: [],
          craftedItems: [],
          currentStorage: 16,
          maxStorage: 20,
        });

        // Then:
        // - 視覚要素のsetColorが警告色で呼び出される
        // Note: 現在の実装では視覚要素は更新されないため、このテストは失敗する
        expect(mockText.setColor).toHaveBeenCalledWith('#FFD93D');
      });
    });
  });

  // ===========================================================================
  // ショップボタンテスト
  // ===========================================================================

  describe('ショップボタン', () => {
    describe('SUI-V-07: create()でショップボタンが生成されること', () => {
      // 【テスト目的】: create()メソッド呼び出し後にショップボタンが生成されることを確認
      // 【対応要件】: REQ-047-13

      it('SUI-V-07: ショップボタンが生成される', () => {
        // Given: SidebarUIが初期化済み
        // When: create()を呼び出す
        sidebarUI.create();

        // Then:
        // - getShopButton()でボタンが取得できる
        const shopButton = sidebarUI.getShopButton();
        expect(shopButton).not.toBeNull();
        // - scene.add.rectangleがボタン背景用に呼び出される
        // Note: 現在の実装では視覚要素は生成されないため、このテストは失敗する
        expect(scene.add.rectangle).toHaveBeenCalled();
      });
    });

    describe('SUI-V-08: ショップボタンがクリック可能であること', () => {
      // 【テスト目的】: ショップボタンにインタラクティブ領域が設定されていることを確認
      // 【対応要件】: REQ-047-13

      it('SUI-V-08: ショップボタンがクリック可能である', () => {
        // Given: SidebarUIが初期化済み
        sidebarUI.create();

        // Then:
        // - setInteractiveが呼び出されている
        // Note: 現在の実装では視覚要素は生成されないため、このテストは失敗する
        expect(mockRectangle.setInteractive).toHaveBeenCalled();
      });
    });
  });
});
