/**
 * HoverAnimationMixinのテスト
 * TASK-0053 Phase 7 共通UIユーティリティ基盤作成
 *
 * @description
 * TC-HV-001 ~ TC-HV-006: 正常系テストケース
 * TC-HV-101 ~ TC-HV-102: 異常系テストケース
 * TC-HV-201 ~ TC-HV-202: 境界値テストケース
 */

import {
  applyHoverAnimation,
  type HoverAnimationConfig,
  removeHoverAnimation,
} from '@presentation/ui/utils/HoverAnimationMixin';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// モック用インターフェース
interface MockGameObject {
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
  setInteractive: ReturnType<typeof vi.fn>;
  input?: { enabled: boolean };
  scaleX: number;
  scaleY: number;
}

interface MockTween {
  play: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
}

interface MockScene {
  tweens: {
    add: ReturnType<typeof vi.fn>;
    killTweensOf: ReturnType<typeof vi.fn>;
  };
}

/**
 * モックゲームオブジェクトを作成する
 */
const createMockGameObject = (interactive = true): MockGameObject => ({
  on: vi.fn().mockReturnThis(),
  off: vi.fn().mockReturnThis(),
  setInteractive: vi.fn().mockReturnThis(),
  input: interactive ? { enabled: true } : undefined,
  scaleX: 1,
  scaleY: 1,
});

/**
 * モックシーンを作成する
 */
const createMockScene = (): MockScene => ({
  tweens: {
    add: vi.fn().mockReturnValue({ play: vi.fn(), stop: vi.fn() }),
    killTweensOf: vi.fn(),
  },
});

describe('HoverAnimationMixin', () => {
  let mockGameObject: MockGameObject;
  let mockScene: MockScene;

  beforeEach(() => {
    mockGameObject = createMockGameObject();
    mockScene = createMockScene();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ========================================
  // 1. 正常系テストケース
  // ========================================

  describe('正常系', () => {
    describe('TC-HV-001: applyHoverAnimationでイベントが設定される', () => {
      // 【テスト目的】: applyHoverAnimationでpointerover/pointeroutイベントが設定されることを確認
      // 【対応要件】: REQ-UI-002
      // 🟡 信頼性レベル: コードベース調査から妥当な推測

      it('TC-HV-001: pointeroverとpointeroutイベントが設定される', () => {
        // Given: モックゲームオブジェクトとシーン

        // When: applyHoverAnimation()を呼び出す
        applyHoverAnimation(
          mockGameObject as unknown as Phaser.GameObjects.GameObject,
          mockScene as unknown as Phaser.Scene,
        );

        // Then: onメソッドがpointeroverとpointeroutで呼び出される
        expect(mockGameObject.on).toHaveBeenCalledWith('pointerover', expect.any(Function));
        expect(mockGameObject.on).toHaveBeenCalledWith('pointerout', expect.any(Function));
      });
    });

    describe('TC-HV-002: デフォルト設定でホバーアニメーションが実行される', () => {
      // 【テスト目的】: デフォルト設定でホバーアニメーションが正しく設定されることを確認
      // 【対応要件】: REQ-UI-002
      // 🟡 信頼性レベル: コードベース調査から妥当な推測

      it('TC-HV-002: デフォルトスケール1.05、duration 100msが適用される', () => {
        // Given: モックゲームオブジェクトとシーン

        // When: applyHoverAnimation()を呼び出す
        applyHoverAnimation(
          mockGameObject as unknown as Phaser.GameObjects.GameObject,
          mockScene as unknown as Phaser.Scene,
        );

        // Then: pointeroverイベントハンドラを取得して実行
        const pointeroverHandler = mockGameObject.on.mock.calls.find(
          (call) => call[0] === 'pointerover',
        )?.[1];
        expect(pointeroverHandler).toBeDefined();
        pointeroverHandler();

        // tweens.addがデフォルト設定で呼び出される
        expect(mockScene.tweens.add).toHaveBeenCalledWith(
          expect.objectContaining({
            targets: mockGameObject,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 100,
            ease: 'Power2',
          }),
        );
      });
    });

    describe('TC-HV-003: カスタムscaleUpが適用される', () => {
      // 【テスト目的】: カスタムscaleUp値が正しく適用されることを確認
      // 【対応要件】: REQ-UI-002
      // 🟡 信頼性レベル: コードベース調査から妥当な推測

      it('TC-HV-003: カスタムscaleUp 1.2が適用される', () => {
        // Given: カスタム設定
        const config: HoverAnimationConfig = { scaleUp: 1.2 };

        // When: applyHoverAnimation()を呼び出す
        applyHoverAnimation(
          mockGameObject as unknown as Phaser.GameObjects.GameObject,
          mockScene as unknown as Phaser.Scene,
          config,
        );

        // Then: pointeroverハンドラを実行
        const pointeroverHandler = mockGameObject.on.mock.calls.find(
          (call) => call[0] === 'pointerover',
        )?.[1];
        pointeroverHandler();

        // カスタムスケールが適用される
        expect(mockScene.tweens.add).toHaveBeenCalledWith(
          expect.objectContaining({
            scaleX: 1.2,
            scaleY: 1.2,
          }),
        );
      });
    });

    describe('TC-HV-004: カスタムdurationが適用される', () => {
      // 【テスト目的】: カスタムduration値が正しく適用されることを確認
      // 【対応要件】: REQ-UI-002
      // 🟡 信頼性レベル: コードベース調査から妥当な推測

      it('TC-HV-004: カスタムduration 200msが適用される', () => {
        // Given: カスタム設定
        const config: HoverAnimationConfig = { duration: 200 };

        // When: applyHoverAnimation()を呼び出す
        applyHoverAnimation(
          mockGameObject as unknown as Phaser.GameObjects.GameObject,
          mockScene as unknown as Phaser.Scene,
          config,
        );

        // Then: pointeroverハンドラを実行
        const pointeroverHandler = mockGameObject.on.mock.calls.find(
          (call) => call[0] === 'pointerover',
        )?.[1];
        pointeroverHandler();

        // カスタムdurationが適用される
        expect(mockScene.tweens.add).toHaveBeenCalledWith(
          expect.objectContaining({
            duration: 200,
          }),
        );
      });
    });

    describe('TC-HV-005: カスタムeaseが適用される', () => {
      // 【テスト目的】: カスタムease値が正しく適用されることを確認
      // 【対応要件】: REQ-UI-002
      // 🟡 信頼性レベル: コードベース調査から妥当な推測

      it('TC-HV-005: カスタムease Quad.Outが適用される', () => {
        // Given: カスタム設定
        const config: HoverAnimationConfig = { ease: 'Quad.Out' };

        // When: applyHoverAnimation()を呼び出す
        applyHoverAnimation(
          mockGameObject as unknown as Phaser.GameObjects.GameObject,
          mockScene as unknown as Phaser.Scene,
          config,
        );

        // Then: pointeroverハンドラを実行
        const pointeroverHandler = mockGameObject.on.mock.calls.find(
          (call) => call[0] === 'pointerover',
        )?.[1];
        pointeroverHandler();

        // カスタムeaseが適用される
        expect(mockScene.tweens.add).toHaveBeenCalledWith(
          expect.objectContaining({
            ease: 'Quad.Out',
          }),
        );
      });
    });

    describe('TC-HV-006: removeHoverAnimationでイベントが解除される', () => {
      // 【テスト目的】: removeHoverAnimationでイベントが解除されることを確認
      // 【対応要件】: REQ-UI-002
      // 🟡 信頼性レベル: コードベース調査から妥当な推測

      it('TC-HV-006: pointeroverとpointeroutイベントが解除される', () => {
        // Given: ホバーアニメーションが適用されたオブジェクト
        applyHoverAnimation(
          mockGameObject as unknown as Phaser.GameObjects.GameObject,
          mockScene as unknown as Phaser.Scene,
        );

        // When: removeHoverAnimation()を呼び出す
        removeHoverAnimation(mockGameObject as unknown as Phaser.GameObjects.GameObject);

        // Then: offメソッドがpointeroverとpointeroutで呼び出される
        expect(mockGameObject.off).toHaveBeenCalledWith('pointerover');
        expect(mockGameObject.off).toHaveBeenCalledWith('pointerout');
      });
    });
  });

  // ========================================
  // 2. 異常系テストケース
  // ========================================

  describe('異常系', () => {
    describe('TC-HV-101: nullオブジェクトでエラーなく処理される', () => {
      // 【テスト目的】: nullオブジェクトでもエラーがスローされないことを確認
      // 【対応要件】: REQ-UI-002
      // 🟡 信頼性レベル: 妥当な推測

      it('TC-HV-101: nullオブジェクトでエラーがスローされない', () => {
        // Given & When & Then: nullオブジェクトでもエラーなし
        expect(() =>
          applyHoverAnimation(
            null as unknown as Phaser.GameObjects.GameObject,
            mockScene as unknown as Phaser.Scene,
          ),
        ).not.toThrow();
      });

      it('TC-HV-101b: undefinedオブジェクトでエラーがスローされない', () => {
        // Given & When & Then: undefinedオブジェクトでもエラーなし
        expect(() =>
          applyHoverAnimation(
            undefined as unknown as Phaser.GameObjects.GameObject,
            mockScene as unknown as Phaser.Scene,
          ),
        ).not.toThrow();
      });
    });

    describe('TC-HV-102: interactiveでないオブジェクトでも安全に処理', () => {
      // 【テスト目的】: interactiveでないオブジェクトでも安全に処理されることを確認
      // 【対応要件】: REQ-UI-002
      // 🟡 信頼性レベル: 妥当な推測

      it('TC-HV-102: interactiveでないオブジェクトでも安全に処理される', () => {
        // Given: interactiveでないオブジェクト
        const nonInteractiveObject = createMockGameObject(false);

        // When & Then: エラーなく処理される
        expect(() =>
          applyHoverAnimation(
            nonInteractiveObject as unknown as Phaser.GameObjects.GameObject,
            mockScene as unknown as Phaser.Scene,
          ),
        ).not.toThrow();

        // イベントは設定される（setInteractiveが呼ばれる可能性）
        expect(nonInteractiveObject.on).toHaveBeenCalled();
      });
    });
  });

  // ========================================
  // 3. 境界値テストケース
  // ========================================

  describe('境界値', () => {
    describe('TC-HV-201: scaleUp: 1でアニメーションなし', () => {
      // 【テスト目的】: scaleUp: 1でアニメーションが実質無効化されることを確認
      // 【対応要件】: REQ-UI-002
      // 🟡 信頼性レベル: 妥当な推測

      it('TC-HV-201: scaleUp: 1でもtweenは作成される', () => {
        // Given: scaleUp: 1の設定
        const config: HoverAnimationConfig = { scaleUp: 1 };

        // When: applyHoverAnimation()を呼び出す
        applyHoverAnimation(
          mockGameObject as unknown as Phaser.GameObjects.GameObject,
          mockScene as unknown as Phaser.Scene,
          config,
        );

        // Then: pointeroverハンドラを実行
        const pointeroverHandler = mockGameObject.on.mock.calls.find(
          (call) => call[0] === 'pointerover',
        )?.[1];
        pointeroverHandler();

        // scaleUp: 1でもtweenは作成される（変化なしだが）
        expect(mockScene.tweens.add).toHaveBeenCalledWith(
          expect.objectContaining({
            scaleX: 1,
            scaleY: 1,
          }),
        );
      });
    });

    describe('TC-HV-202: duration: 0で即時適用', () => {
      // 【テスト目的】: duration: 0で即時適用されることを確認
      // 【対応要件】: REQ-UI-002
      // 🟡 信頼性レベル: 妥当な推測

      it('TC-HV-202: duration: 0でtweenが作成される', () => {
        // Given: duration: 0の設定
        const config: HoverAnimationConfig = { duration: 0 };

        // When: applyHoverAnimation()を呼び出す
        applyHoverAnimation(
          mockGameObject as unknown as Phaser.GameObjects.GameObject,
          mockScene as unknown as Phaser.Scene,
          config,
        );

        // Then: pointeroverハンドラを実行
        const pointeroverHandler = mockGameObject.on.mock.calls.find(
          (call) => call[0] === 'pointerover',
        )?.[1];
        pointeroverHandler();

        // duration: 0でもtweenは作成される
        expect(mockScene.tweens.add).toHaveBeenCalledWith(
          expect.objectContaining({
            duration: 0,
          }),
        );
      });
    });
  });
});
