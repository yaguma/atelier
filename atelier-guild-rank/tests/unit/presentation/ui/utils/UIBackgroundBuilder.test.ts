/**
 * UIBackgroundBuilderのテスト
 * TASK-0053 Phase 7 共通UIユーティリティ基盤作成
 *
 * @description
 * TC-BG-001 ~ TC-BG-007: 正常系テストケース
 * TC-BG-101: 異常系テストケース
 * TC-BG-201 ~ TC-BG-202: 境界値テストケース
 */

import { UIBackgroundBuilder } from '@presentation/ui/utils/UIBackgroundBuilder';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// モック用インターフェース
interface MockGraphics {
  fillStyle: ReturnType<typeof vi.fn>;
  fillRoundedRect: ReturnType<typeof vi.fn>;
  lineStyle: ReturnType<typeof vi.fn>;
  strokeRoundedRect: ReturnType<typeof vi.fn>;
  setPosition: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
}

interface MockScene {
  add: {
    graphics: ReturnType<typeof vi.fn>;
  };
}

/**
 * モックGraphicsを作成する
 */
const createMockGraphics = (): MockGraphics => ({
  fillStyle: vi.fn().mockReturnThis(),
  fillRoundedRect: vi.fn().mockReturnThis(),
  lineStyle: vi.fn().mockReturnThis(),
  strokeRoundedRect: vi.fn().mockReturnThis(),
  setPosition: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
});

/**
 * モックシーンを作成する
 */
const createMockScene = (mockGraphics: MockGraphics): MockScene => ({
  add: {
    graphics: vi.fn().mockReturnValue(mockGraphics),
  },
});

describe('UIBackgroundBuilder', () => {
  let mockGraphics: MockGraphics;
  let mockScene: MockScene;

  beforeEach(() => {
    mockGraphics = createMockGraphics();
    mockScene = createMockScene(mockGraphics);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ========================================
  // 1. 正常系テストケース
  // ========================================

  describe('正常系', () => {
    describe('TC-BG-001: デフォルト設定でGraphicsオブジェクトが生成される', () => {
      // 【テスト目的】: build()でデフォルト設定のGraphicsオブジェクトが生成されることを確認
      // 【対応要件】: REQ-UI-001
      // 🟡 信頼性レベル: コードベース調査から妥当な推測

      it('TC-BG-001: build()でGraphicsオブジェクトが返される', () => {
        // Given: UIBackgroundBuilderインスタンス
        const builder = new UIBackgroundBuilder(mockScene as unknown as Phaser.Scene);

        // When: build()を呼び出す
        const result = builder.build();

        // Then: Graphicsオブジェクトが返される
        expect(result).toBeDefined();
        expect(mockScene.add.graphics).toHaveBeenCalled();
        // デフォルトのfillStyle設定が適用される
        expect(mockGraphics.fillStyle).toHaveBeenCalledWith(0x2a2a3d, 0.95);
        // デフォルトのfillRoundedRect設定が適用される
        expect(mockGraphics.fillRoundedRect).toHaveBeenCalledWith(0, 0, 100, 100, 8);
      });
    });

    describe('TC-BG-002: setPosition()で位置が設定される', () => {
      // 【テスト目的】: setPosition()で位置が正しく設定されることを確認
      // 【対応要件】: REQ-UI-001
      // 🟡 信頼性レベル: コードベース調査から妥当な推測

      it('TC-BG-002: setPosition()でX, Y座標が設定される', () => {
        // Given: UIBackgroundBuilderインスタンス
        const builder = new UIBackgroundBuilder(mockScene as unknown as Phaser.Scene);

        // When: setPosition(50, 100)とbuild()を呼び出す
        builder.setPosition(50, 100).build();

        // Then: 指定位置でfillRoundedRectが呼び出される
        expect(mockGraphics.fillRoundedRect).toHaveBeenCalledWith(50, 100, 100, 100, 8);
      });
    });

    describe('TC-BG-003: setSize()でサイズが設定される', () => {
      // 【テスト目的】: setSize()でサイズが正しく設定されることを確認
      // 【対応要件】: REQ-UI-001
      // 🟡 信頼性レベル: コードベース調査から妥当な推測

      it('TC-BG-003: setSize()で幅と高さが設定される', () => {
        // Given: UIBackgroundBuilderインスタンス
        const builder = new UIBackgroundBuilder(mockScene as unknown as Phaser.Scene);

        // When: setSize(200, 150)とbuild()を呼び出す
        builder.setSize(200, 150).build();

        // Then: 指定サイズでfillRoundedRectが呼び出される
        expect(mockGraphics.fillRoundedRect).toHaveBeenCalledWith(0, 0, 200, 150, 8);
      });
    });

    describe('TC-BG-004: setFill()で塗り色が設定される', () => {
      // 【テスト目的】: setFill()で塗り色とアルファが正しく設定されることを確認
      // 【対応要件】: REQ-UI-001
      // 🟡 信頼性レベル: コードベース調査から妥当な推測

      it('TC-BG-004: setFill()で色とアルファが設定される', () => {
        // Given: UIBackgroundBuilderインスタンス
        const builder = new UIBackgroundBuilder(mockScene as unknown as Phaser.Scene);

        // When: setFill(0xff0000, 0.8)とbuild()を呼び出す
        builder.setFill(0xff0000, 0.8).build();

        // Then: 指定色でfillStyleが呼び出される
        expect(mockGraphics.fillStyle).toHaveBeenCalledWith(0xff0000, 0.8);
      });

      it('TC-BG-004b: setFill()でアルファ省略時はデフォルト0.95', () => {
        // Given: UIBackgroundBuilderインスタンス
        const builder = new UIBackgroundBuilder(mockScene as unknown as Phaser.Scene);

        // When: setFill(0x00ff00)とbuild()を呼び出す（アルファ省略）
        builder.setFill(0x00ff00).build();

        // Then: アルファは0.95でfillStyleが呼び出される
        expect(mockGraphics.fillStyle).toHaveBeenCalledWith(0x00ff00, 0.95);
      });
    });

    describe('TC-BG-005: setBorder()でボーダーが設定される', () => {
      // 【テスト目的】: setBorder()でボーダー色と幅が正しく設定されることを確認
      // 【対応要件】: REQ-UI-001
      // 🟡 信頼性レベル: コードベース調査から妥当な推測

      it('TC-BG-005: setBorder()でボーダーが描画される', () => {
        // Given: UIBackgroundBuilderインスタンス
        const builder = new UIBackgroundBuilder(mockScene as unknown as Phaser.Scene);

        // When: setBorder(0xffd700, 3)とbuild()を呼び出す
        builder.setBorder(0xffd700, 3).build();

        // Then: lineStyleとstrokeRoundedRectが呼び出される
        expect(mockGraphics.lineStyle).toHaveBeenCalledWith(3, 0xffd700, 1);
        expect(mockGraphics.strokeRoundedRect).toHaveBeenCalled();
      });

      it('TC-BG-005b: setBorder()で幅省略時はデフォルト2', () => {
        // Given: UIBackgroundBuilderインスタンス
        const builder = new UIBackgroundBuilder(mockScene as unknown as Phaser.Scene);

        // When: setBorder(0x0000ff)とbuild()を呼び出す（幅省略）
        builder.setBorder(0x0000ff).build();

        // Then: 幅2でlineStyleが呼び出される
        expect(mockGraphics.lineStyle).toHaveBeenCalledWith(2, 0x0000ff, 1);
      });
    });

    describe('TC-BG-006: setRadius()で角丸半径が設定される', () => {
      // 【テスト目的】: setRadius()で角丸半径が正しく設定されることを確認
      // 【対応要件】: REQ-UI-001
      // 🟡 信頼性レベル: コードベース調査から妥当な推測

      it('TC-BG-006: setRadius()で角丸半径が設定される', () => {
        // Given: UIBackgroundBuilderインスタンス
        const builder = new UIBackgroundBuilder(mockScene as unknown as Phaser.Scene);

        // When: setRadius(16)とbuild()を呼び出す
        builder.setRadius(16).build();

        // Then: 指定半径でfillRoundedRectが呼び出される
        expect(mockGraphics.fillRoundedRect).toHaveBeenCalledWith(0, 0, 100, 100, 16);
      });
    });

    describe('TC-BG-007: メソッドチェーンが機能する', () => {
      // 【テスト目的】: 全メソッドをチェーンで呼び出せることを確認
      // 【対応要件】: REQ-UI-001
      // 🔵 信頼性レベル: 標準的なBuilderパターン

      it('TC-BG-007: 全メソッドをチェーンで呼び出せる', () => {
        // Given: UIBackgroundBuilderインスタンス
        const builder = new UIBackgroundBuilder(mockScene as unknown as Phaser.Scene);

        // When: 全メソッドをチェーンで呼び出す
        const result = builder
          .setPosition(10, 20)
          .setSize(300, 200)
          .setFill(0x123456, 0.9)
          .setBorder(0x654321, 4)
          .setRadius(12)
          .build();

        // Then: Graphicsオブジェクトが返される
        expect(result).toBeDefined();
        // 全設定が適用される
        expect(mockGraphics.fillStyle).toHaveBeenCalledWith(0x123456, 0.9);
        expect(mockGraphics.fillRoundedRect).toHaveBeenCalledWith(10, 20, 300, 200, 12);
        expect(mockGraphics.lineStyle).toHaveBeenCalledWith(4, 0x654321, 1);
        expect(mockGraphics.strokeRoundedRect).toHaveBeenCalledWith(10, 20, 300, 200, 12);
      });
    });
  });

  // ========================================
  // 2. 異常系テストケース
  // ========================================

  describe('異常系', () => {
    describe('TC-BG-101: nullシーンでエラーがスローされる', () => {
      // 【テスト目的】: コンストラクタにnullを渡した場合にエラーがスローされることを確認
      // 【対応要件】: REQ-UI-001
      // 🟡 信頼性レベル: 妥当な推測

      it('TC-BG-101: nullシーンでエラーがスローされる', () => {
        // Given & When & Then: nullシーンでコンストラクタを呼び出すとエラー
        expect(() => new UIBackgroundBuilder(null as unknown as Phaser.Scene)).toThrow();
      });

      it('TC-BG-101b: undefinedシーンでエラーがスローされる', () => {
        // Given & When & Then: undefinedシーンでコンストラクタを呼び出すとエラー
        expect(() => new UIBackgroundBuilder(undefined as unknown as Phaser.Scene)).toThrow();
      });
    });
  });

  // ========================================
  // 3. 境界値テストケース
  // ========================================

  describe('境界値', () => {
    describe('TC-BG-201: サイズ0でも生成される', () => {
      // 【テスト目的】: サイズ0でもGraphicsオブジェクトが生成されることを確認
      // 【対応要件】: REQ-UI-001
      // 🟡 信頼性レベル: 妥当な推測

      it('TC-BG-201: サイズ0でも生成される', () => {
        // Given: UIBackgroundBuilderインスタンス
        const builder = new UIBackgroundBuilder(mockScene as unknown as Phaser.Scene);

        // When: setSize(0, 0)とbuild()を呼び出す
        const result = builder.setSize(0, 0).build();

        // Then: Graphicsオブジェクトが返される
        expect(result).toBeDefined();
        expect(mockGraphics.fillRoundedRect).toHaveBeenCalledWith(0, 0, 0, 0, 8);
      });
    });

    describe('TC-BG-202: 負のサイズは0として扱われる', () => {
      // 【テスト目的】: 負のサイズが0として扱われることを確認
      // 【対応要件】: REQ-UI-001
      // 🟡 信頼性レベル: 妥当な推測

      it('TC-BG-202: 負のサイズは0として扱われる', () => {
        // Given: UIBackgroundBuilderインスタンス
        const builder = new UIBackgroundBuilder(mockScene as unknown as Phaser.Scene);

        // When: setSize(-100, -50)とbuild()を呼び出す
        const result = builder.setSize(-100, -50).build();

        // Then: Graphicsオブジェクトが返される（サイズは0以上に正規化）
        expect(result).toBeDefined();
        // 負の値は0に正規化される
        expect(mockGraphics.fillRoundedRect).toHaveBeenCalledWith(0, 0, 0, 0, 8);
      });
    });
  });
});
