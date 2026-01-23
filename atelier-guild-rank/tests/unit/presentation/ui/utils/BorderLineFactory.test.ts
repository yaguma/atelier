/**
 * BorderLineFactoryのテスト
 * TASK-0053 Phase 7 共通UIユーティリティ基盤作成
 *
 * @description
 * TC-BL-001 ~ TC-BL-006: 正常系テストケース
 * TC-BL-101: 異常系テストケース
 * TC-BL-201 ~ TC-BL-202: 境界値テストケース
 */

import { BorderLineFactory } from '@presentation/ui/utils/BorderLineFactory';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// モック用インターフェース
interface MockGraphics {
  lineStyle: ReturnType<typeof vi.fn>;
  lineBetween: ReturnType<typeof vi.fn>;
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
  lineStyle: vi.fn().mockReturnThis(),
  lineBetween: vi.fn().mockReturnThis(),
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

describe('BorderLineFactory', () => {
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
    describe('TC-BL-001: createHorizontalLineで水平線が生成される', () => {
      // 【テスト目的】: createHorizontalLineで水平線が正しく生成されることを確認
      // 【対応要件】: REQ-UI-003
      // 🟡 信頼性レベル: コードベース調査から妥当な推測

      it('TC-BL-001: 水平線のGraphicsが返される', () => {
        // Given: モックシーンと座標

        // When: createHorizontalLine()を呼び出す
        const result = BorderLineFactory.createHorizontalLine(
          mockScene as unknown as Phaser.Scene,
          10,
          20,
          200,
        );

        // Then: Graphicsオブジェクトが返される
        expect(result).toBeDefined();
        expect(mockScene.add.graphics).toHaveBeenCalled();
        // lineStyleがデフォルト設定で呼び出される
        expect(mockGraphics.lineStyle).toHaveBeenCalledWith(2, 0x4a4a5d, 1);
        // lineBetweenが呼び出される
        expect(mockGraphics.lineBetween).toHaveBeenCalledWith(10, 20, 210, 20);
      });
    });

    describe('TC-BL-002: createVerticalLineで垂直線が生成される', () => {
      // 【テスト目的】: createVerticalLineで垂直線が正しく生成されることを確認
      // 【対応要件】: REQ-UI-003
      // 🟡 信頼性レベル: コードベース調査から妥当な推測

      it('TC-BL-002: 垂直線のGraphicsが返される', () => {
        // Given: モックシーンと座標

        // When: createVerticalLine()を呼び出す
        const result = BorderLineFactory.createVerticalLine(
          mockScene as unknown as Phaser.Scene,
          30,
          40,
          150,
        );

        // Then: Graphicsオブジェクトが返される
        expect(result).toBeDefined();
        expect(mockScene.add.graphics).toHaveBeenCalled();
        // lineStyleがデフォルト設定で呼び出される
        expect(mockGraphics.lineStyle).toHaveBeenCalledWith(2, 0x4a4a5d, 1);
        // lineBetweenが呼び出される（垂直線）
        expect(mockGraphics.lineBetween).toHaveBeenCalledWith(30, 40, 30, 190);
      });
    });

    describe('TC-BL-003: createRoundedBorderで角丸ボーダーが生成される', () => {
      // 【テスト目的】: createRoundedBorderで角丸ボーダーが正しく生成されることを確認
      // 【対応要件】: REQ-UI-003
      // 🟡 信頼性レベル: コードベース調査から妥当な推測

      it('TC-BL-003: 角丸ボーダーのGraphicsが返される', () => {
        // Given: モックシーンと座標・サイズ

        // When: createRoundedBorder()を呼び出す
        const result = BorderLineFactory.createRoundedBorder(
          mockScene as unknown as Phaser.Scene,
          50,
          60,
          300,
          200,
        );

        // Then: Graphicsオブジェクトが返される
        expect(result).toBeDefined();
        expect(mockScene.add.graphics).toHaveBeenCalled();
        // lineStyleがデフォルト設定で呼び出される
        expect(mockGraphics.lineStyle).toHaveBeenCalledWith(2, 0x4a4a5d, 1);
        // strokeRoundedRectが呼び出される
        expect(mockGraphics.strokeRoundedRect).toHaveBeenCalledWith(50, 60, 300, 200, 8);
      });
    });

    describe('TC-BL-004: カスタムカラーが適用される', () => {
      // 【テスト目的】: カスタムカラーが正しく適用されることを確認
      // 【対応要件】: REQ-UI-003
      // 🟡 信頼性レベル: コードベース調査から妥当な推測

      it('TC-BL-004: createHorizontalLineでカスタムカラーが適用される', () => {
        // Given: モックシーンとカスタムカラー

        // When: createHorizontalLine()をカスタムカラーで呼び出す
        BorderLineFactory.createHorizontalLine(
          mockScene as unknown as Phaser.Scene,
          0,
          0,
          100,
          0xff0000,
        );

        // Then: カスタムカラーでlineStyleが呼び出される
        expect(mockGraphics.lineStyle).toHaveBeenCalledWith(2, 0xff0000, 1);
      });

      it('TC-BL-004b: createVerticalLineでカスタムカラーが適用される', () => {
        // Given: モックシーンとカスタムカラー

        // When: createVerticalLine()をカスタムカラーで呼び出す
        BorderLineFactory.createVerticalLine(
          mockScene as unknown as Phaser.Scene,
          0,
          0,
          100,
          0x00ff00,
        );

        // Then: カスタムカラーでlineStyleが呼び出される
        expect(mockGraphics.lineStyle).toHaveBeenCalledWith(2, 0x00ff00, 1);
      });

      it('TC-BL-004c: createRoundedBorderでカスタムカラーが適用される', () => {
        // Given: モックシーンとカスタムカラー

        // When: createRoundedBorder()をカスタムカラーで呼び出す
        BorderLineFactory.createRoundedBorder(
          mockScene as unknown as Phaser.Scene,
          0,
          0,
          100,
          100,
          8,
          0x0000ff,
        );

        // Then: カスタムカラーでlineStyleが呼び出される
        expect(mockGraphics.lineStyle).toHaveBeenCalledWith(2, 0x0000ff, 1);
      });
    });

    describe('TC-BL-005: カスタム太さが適用される', () => {
      // 【テスト目的】: カスタム太さが正しく適用されることを確認
      // 【対応要件】: REQ-UI-003
      // 🟡 信頼性レベル: コードベース調査から妥当な推測

      it('TC-BL-005: createHorizontalLineでカスタム太さが適用される', () => {
        // Given: モックシーンとカスタム太さ

        // When: createHorizontalLine()をカスタム太さで呼び出す
        BorderLineFactory.createHorizontalLine(
          mockScene as unknown as Phaser.Scene,
          0,
          0,
          100,
          0x4a4a5d,
          5,
        );

        // Then: カスタム太さでlineStyleが呼び出される
        expect(mockGraphics.lineStyle).toHaveBeenCalledWith(5, 0x4a4a5d, 1);
      });

      it('TC-BL-005b: createVerticalLineでカスタム太さが適用される', () => {
        // Given: モックシーンとカスタム太さ

        // When: createVerticalLine()をカスタム太さで呼び出す
        BorderLineFactory.createVerticalLine(
          mockScene as unknown as Phaser.Scene,
          0,
          0,
          100,
          0x4a4a5d,
          3,
        );

        // Then: カスタム太さでlineStyleが呼び出される
        expect(mockGraphics.lineStyle).toHaveBeenCalledWith(3, 0x4a4a5d, 1);
      });
    });

    describe('TC-BL-006: カスタム角丸半径が適用される', () => {
      // 【テスト目的】: カスタム角丸半径が正しく適用されることを確認
      // 【対応要件】: REQ-UI-003
      // 🟡 信頼性レベル: コードベース調査から妥当な推測

      it('TC-BL-006: createRoundedBorderでカスタム角丸半径が適用される', () => {
        // Given: モックシーンとカスタム角丸半径

        // When: createRoundedBorder()をカスタム角丸半径で呼び出す
        BorderLineFactory.createRoundedBorder(
          mockScene as unknown as Phaser.Scene,
          0,
          0,
          100,
          100,
          16,
        );

        // Then: カスタム角丸半径でstrokeRoundedRectが呼び出される
        expect(mockGraphics.strokeRoundedRect).toHaveBeenCalledWith(0, 0, 100, 100, 16);
      });
    });
  });

  // ========================================
  // 2. 異常系テストケース
  // ========================================

  describe('異常系', () => {
    describe('TC-BL-101: nullシーンでエラーがスローされる', () => {
      // 【テスト目的】: nullシーンでエラーがスローされることを確認
      // 【対応要件】: REQ-UI-003
      // 🟡 信頼性レベル: 妥当な推測

      it('TC-BL-101: createHorizontalLineでnullシーンはエラー', () => {
        // Given & When & Then: nullシーンでエラー
        expect(() =>
          BorderLineFactory.createHorizontalLine(null as unknown as Phaser.Scene, 0, 0, 100),
        ).toThrow();
      });

      it('TC-BL-101b: createVerticalLineでnullシーンはエラー', () => {
        // Given & When & Then: nullシーンでエラー
        expect(() =>
          BorderLineFactory.createVerticalLine(null as unknown as Phaser.Scene, 0, 0, 100),
        ).toThrow();
      });

      it('TC-BL-101c: createRoundedBorderでnullシーンはエラー', () => {
        // Given & When & Then: nullシーンでエラー
        expect(() =>
          BorderLineFactory.createRoundedBorder(null as unknown as Phaser.Scene, 0, 0, 100, 100),
        ).toThrow();
      });
    });
  });

  // ========================================
  // 3. 境界値テストケース
  // ========================================

  describe('境界値', () => {
    describe('TC-BL-201: 幅/高さ0でも生成される', () => {
      // 【テスト目的】: 幅/高さ0でもGraphicsオブジェクトが生成されることを確認
      // 【対応要件】: REQ-UI-003
      // 🟡 信頼性レベル: 妥当な推測

      it('TC-BL-201: createHorizontalLineで幅0でも生成される', () => {
        // Given: モックシーン

        // When: createHorizontalLine()を幅0で呼び出す
        const result = BorderLineFactory.createHorizontalLine(
          mockScene as unknown as Phaser.Scene,
          0,
          0,
          0,
        );

        // Then: Graphicsオブジェクトが返される
        expect(result).toBeDefined();
        expect(mockGraphics.lineBetween).toHaveBeenCalledWith(0, 0, 0, 0);
      });

      it('TC-BL-201b: createVerticalLineで高さ0でも生成される', () => {
        // Given: モックシーン

        // When: createVerticalLine()を高さ0で呼び出す
        const result = BorderLineFactory.createVerticalLine(
          mockScene as unknown as Phaser.Scene,
          0,
          0,
          0,
        );

        // Then: Graphicsオブジェクトが返される
        expect(result).toBeDefined();
        expect(mockGraphics.lineBetween).toHaveBeenCalledWith(0, 0, 0, 0);
      });

      it('TC-BL-201c: createRoundedBorderでサイズ0でも生成される', () => {
        // Given: モックシーン

        // When: createRoundedBorder()をサイズ0で呼び出す
        const result = BorderLineFactory.createRoundedBorder(
          mockScene as unknown as Phaser.Scene,
          0,
          0,
          0,
          0,
        );

        // Then: Graphicsオブジェクトが返される
        expect(result).toBeDefined();
        expect(mockGraphics.strokeRoundedRect).toHaveBeenCalledWith(0, 0, 0, 0, 8);
      });
    });

    describe('TC-BL-202: 太さ0でも生成される', () => {
      // 【テスト目的】: 太さ0でもGraphicsオブジェクトが生成されることを確認
      // 【対応要件】: REQ-UI-003
      // 🟡 信頼性レベル: 妥当な推測

      it('TC-BL-202: createHorizontalLineで太さ0でも生成される', () => {
        // Given: モックシーン

        // When: createHorizontalLine()を太さ0で呼び出す
        const result = BorderLineFactory.createHorizontalLine(
          mockScene as unknown as Phaser.Scene,
          0,
          0,
          100,
          0x4a4a5d,
          0,
        );

        // Then: Graphicsオブジェクトが返される
        expect(result).toBeDefined();
        expect(mockGraphics.lineStyle).toHaveBeenCalledWith(0, 0x4a4a5d, 1);
      });
    });
  });
});
