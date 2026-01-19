/**
 * TooltipManagerコンポーネントのテスト
 * TASK-0041 Phase 5 ツールチップ表示システム
 *
 * @description
 * TC-001 ~ TC-014: 正常系テストケース
 * TC-101 ~ TC-108: 異常系テストケース
 * TC-201 ~ TC-206: 境界値テストケース
 * TC-301 ~ TC-304: 統合テストケース
 */

import { TooltipManager } from '@presentation/ui/components/TooltipManager';
import type Phaser from 'phaser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// モック用インターフェース
interface MockContainer {
  setPosition: ReturnType<typeof vi.fn>;
  setVisible: ReturnType<typeof vi.fn>;
  setDepth: ReturnType<typeof vi.fn>;
  add: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
  getBounds: ReturnType<typeof vi.fn>;
  x: number;
  y: number;
  visible: boolean;
}

interface MockRectangle {
  setOrigin: ReturnType<typeof vi.fn>;
  setFillStyle: ReturnType<typeof vi.fn>;
  setSize: ReturnType<typeof vi.fn>;
}

interface MockText {
  setOrigin: ReturnType<typeof vi.fn>;
  setStyle: ReturnType<typeof vi.fn>;
  setText: ReturnType<typeof vi.fn>;
  setWordWrapWidth: ReturnType<typeof vi.fn>;
  setPosition: ReturnType<typeof vi.fn>;
  getBounds: ReturnType<typeof vi.fn>;
}

interface MockScene extends Phaser.Scene {
  add: {
    container: ReturnType<typeof vi.fn>;
    rectangle: ReturnType<typeof vi.fn>;
    text: ReturnType<typeof vi.fn>;
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
const createMockScene = (
  width = 800,
  height = 600,
): {
  scene: MockScene;
  mockContainer: MockContainer;
  mockRectangle: MockRectangle;
  mockText: MockText;
} => {
  const mockContainer: MockContainer = {
    setPosition: vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis(),
    setDepth: vi.fn().mockReturnThis(),
    add: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    getBounds: vi.fn().mockReturnValue({ width: 200, height: 100 }),
    x: 0,
    y: 0,
    visible: false,
  };

  const mockRectangle: MockRectangle = {
    setOrigin: vi.fn().mockReturnThis(),
    setFillStyle: vi.fn().mockReturnThis(),
    setSize: vi.fn().mockReturnThis(),
  };

  const mockText: MockText = {
    setOrigin: vi.fn().mockReturnThis(),
    setStyle: vi.fn().mockReturnThis(),
    setText: vi.fn().mockReturnThis(),
    setWordWrapWidth: vi.fn().mockReturnThis(),
    setPosition: vi.fn().mockReturnThis(),
    getBounds: vi.fn().mockReturnValue({ width: 180, height: 80 }),
  };

  const scene = {
    add: {
      container: vi.fn().mockReturnValue(mockContainer),
      rectangle: vi.fn().mockReturnValue(mockRectangle),
      text: vi.fn().mockReturnValue(mockText),
    },
    cameras: {
      main: {
        width,
        height,
      },
    },
  } as unknown as MockScene;

  return { scene, mockContainer, mockRectangle, mockText };
};

describe('TooltipManager', () => {
  let manager: TooltipManager;
  let scene: MockScene;
  let mockContainer: MockContainer;
  let mockText: MockText;

  beforeEach(() => {
    // 各テスト前にシングルトンをリセット
    TooltipManager.resetInstance();

    // モックシーンを作成
    const mocks = createMockScene();
    scene = mocks.scene;
    mockContainer = mocks.mockContainer;
    mockText = mocks.mockText;

    // Fake Timersを使用
    vi.useFakeTimers();
  });

  afterEach(() => {
    // タイマーを実時間に戻す
    vi.useRealTimers();

    // モックをリセット
    vi.clearAllMocks();
  });

  // ========================================
  // 1. 正常系テストケース
  // ========================================

  describe('正常系', () => {
    describe('TC-001: シングルトンインスタンスの取得', () => {
      // 【テスト目的】: TooltipManagerがシングルトンパターンで実装されていることを確認
      // 【対応要件】: FR-001, AC-001
      // 🔵 信頼性レベル: requirements.md セクション3 FR-001に明記

      it('TC-001: getInstance()でインスタンスが取得できる', () => {
        // Given: TooltipManagerが未初期化の状態
        // When: getInstance()を呼び出す
        const instance = TooltipManager.getInstance();

        // Then: インスタンスが返される
        expect(instance).toBeDefined();
        expect(instance).not.toBeNull();
        expect(instance).toBeInstanceOf(TooltipManager);
      });
    });

    describe('TC-002: シングルトンインスタンスの同一性確認', () => {
      // 【テスト目的】: 複数回のgetInstance()呼び出しで同一インスタンスが返されることを確認
      // 【対応要件】: FR-001, AC-001
      // 🔵 信頼性レベル: requirements.md セクション3 FR-001に明記

      it('TC-002: 複数回の呼び出しで同一インスタンスが返される', () => {
        // Given: TooltipManagerが未初期化の状態
        // When: getInstance()を3回呼び出す
        const instance1 = TooltipManager.getInstance();
        const instance2 = TooltipManager.getInstance();
        const instance3 = TooltipManager.getInstance();

        // Then: すべてのインスタンスが同一
        expect(instance1).toBe(instance2);
        expect(instance2).toBe(instance3);
        expect(instance1 === instance3).toBe(true);
      });
    });

    describe('TC-003: シングルトンのリセット', () => {
      // 【テスト目的】: resetInstance()でインスタンスがリセットされることを確認
      // 【対応要件】: FR-001, NFR-004
      // 🔵 信頼性レベル: requirements.md セクション4 NFR-004に明記

      it('TC-003: リセット後は新しいインスタンスが返される', () => {
        // Given: getInstance()でインスタンスが取得済み
        const instanceBefore = TooltipManager.getInstance();

        // When: resetInstance()を呼び出し、再度getInstance()を呼び出す
        TooltipManager.resetInstance();
        const instanceAfter = TooltipManager.getInstance();

        // Then: リセット前後のインスタンスは異なる
        expect(instanceBefore).not.toBe(instanceAfter);
      });
    });

    describe('TC-004: シーン初期化', () => {
      // 【テスト目的】: initialize()でツールチップコンテナが作成されることを確認
      // 【対応要件】: FR-002, AC-002
      // 🔵 信頼性レベル: requirements.md セクション3 FR-002に明記

      it('TC-004: initialize()でコンテナが作成される', () => {
        // Given: TooltipManagerインスタンスが取得済み、有効なPhaserシーンモック
        manager = TooltipManager.getInstance();

        // When: initialize(scene)を呼び出す
        manager.initialize(scene);

        // Then:
        // - isInitialized()がtrueを返す
        expect(manager.isInitialized()).toBe(true);
        // - scene.add.containerが呼び出される
        expect(scene.add.container).toHaveBeenCalled();
      });
    });

    describe('TC-005: シーン再初期化時のコンテナ破棄', () => {
      // 【テスト目的】: 再初期化時に前のコンテナが破棄されることを確認
      // 【対応要件】: FR-002
      // 🔵 信頼性レベル: requirements.md セクション3 FR-002に明記

      it('TC-005: 再初期化時に前のコンテナが破棄される', () => {
        // Given: TooltipManagerが既に初期化済み
        manager = TooltipManager.getInstance();
        manager.initialize(scene);

        // 新しいシーンモックを作成
        const newMocks = createMockScene();
        const newScene = newMocks.scene;

        // When: 再度initialize(newScene)を呼び出す
        manager.initialize(newScene);

        // Then:
        // - 前のコンテナのdestroy()が呼び出される
        expect(mockContainer.destroy).toHaveBeenCalled();
        // - isInitialized()がtrueを返す
        expect(manager.isInitialized()).toBe(true);
      });
    });

    describe('TC-006: ツールチップ表示（遅延なし）', () => {
      // 【テスト目的】: delay: 0でツールチップが即座に表示されることを確認
      // 【対応要件】: FR-003, AC-003
      // 🔵 信頼性レベル: requirements.md セクション3 FR-003に明記

      it('TC-006: delay: 0で即座に表示される', () => {
        // Given: TooltipManagerが初期化済み
        manager = TooltipManager.getInstance();
        manager.initialize(scene);

        // When: show({ content: 'テスト', x: 100, y: 100, delay: 0 })を呼び出す
        manager.show({ content: 'テスト', x: 100, y: 100, delay: 0 });

        // Then:
        // - ツールチップが即座に表示される
        // - isVisible()がtrueを返す
        expect(manager.isVisible()).toBe(true);
        // - 指定された座標にツールチップが配置される
        expect(mockContainer.setPosition).toHaveBeenCalled();
      });
    });

    describe('TC-007: ツールチップ表示（遅延あり）', () => {
      // 【テスト目的】: 遅延付きで表示が遅れることを確認
      // 【対応要件】: FR-003, AC-003
      // 🔵 信頼性レベル: requirements.md セクション3 FR-003に明記

      it('TC-007: 遅延後にツールチップが表示される', () => {
        // Given: TooltipManagerが初期化済み、vi.useFakeTimers()でタイマーをモック
        manager = TooltipManager.getInstance();
        manager.initialize(scene);

        // When: show({ content: 'テスト', x: 100, y: 100, delay: 500 })を呼び出す
        manager.show({ content: 'テスト', x: 100, y: 100, delay: 500 });

        // Then:
        // - 500ms経過前はisVisible()がfalse
        expect(manager.isVisible()).toBe(false);

        // - 500ms経過後はisVisible()がtrue
        vi.advanceTimersByTime(500);
        expect(manager.isVisible()).toBe(true);
      });
    });

    describe('TC-008: デフォルト遅延の適用', () => {
      // 【テスト目的】: delayを省略した場合にデフォルト500msが適用されることを確認
      // 【対応要件】: FR-003
      // 🔵 信頼性レベル: requirements.md セクション3 FR-003に明記

      it('TC-008: デフォルト遅延500msが適用される', () => {
        // Given: TooltipManagerが初期化済み、vi.useFakeTimers()でタイマーをモック
        manager = TooltipManager.getInstance();
        manager.initialize(scene);

        // When: show({ content: 'テスト', x: 100, y: 100 })を呼び出す（delayを省略）
        manager.show({ content: 'テスト', x: 100, y: 100 });

        // Then:
        // - デフォルト遅延500msが適用される
        // - 499ms経過後はまだ非表示
        vi.advanceTimersByTime(499);
        expect(manager.isVisible()).toBe(false);

        // - 500ms経過後にツールチップが表示される
        vi.advanceTimersByTime(1);
        expect(manager.isVisible()).toBe(true);
      });
    });

    describe('TC-009: ツールチップ非表示', () => {
      // 【テスト目的】: hide()でツールチップが非表示になることを確認
      // 【対応要件】: FR-004
      // 🔵 信頼性レベル: requirements.md セクション3 FR-004に明記

      it('TC-009: hide()でツールチップが非表示になる', () => {
        // Given: TooltipManagerが初期化済み、ツールチップが表示中
        manager = TooltipManager.getInstance();
        manager.initialize(scene);
        manager.show({ content: 'テスト', x: 100, y: 100, delay: 0 });
        expect(manager.isVisible()).toBe(true);

        // When: hide()を呼び出す
        manager.hide();

        // Then:
        // - ツールチップが非表示になる
        // - isVisible()がfalseを返す
        expect(manager.isVisible()).toBe(false);
      });
    });

    describe('TC-010: 表示遅延のキャンセル', () => {
      // 【テスト目的】: 遅延中にhide()を呼び出すとタイマーがキャンセルされることを確認
      // 【対応要件】: FR-004, AC-004
      // 🔵 信頼性レベル: requirements.md セクション3 FR-004に明記

      it('TC-010: 遅延中にhide()でタイマーがキャンセルされる', () => {
        // Given: TooltipManagerが初期化済み、show()が呼び出され遅延中
        manager = TooltipManager.getInstance();
        manager.initialize(scene);
        manager.show({ content: 'テスト', x: 100, y: 100, delay: 500 });

        // When: 遅延時間（500ms）経過前にhide()を呼び出す
        vi.advanceTimersByTime(200);
        manager.hide();

        // - 時間を進める
        vi.advanceTimersByTime(1000);

        // Then:
        // - ツールチップは表示されない
        // - isVisible()がfalseを返す
        expect(manager.isVisible()).toBe(false);
      });
    });

    describe('TC-011: show()連続呼び出しでのタイマーリセット', () => {
      // 【テスト目的】: show()を連続呼び出しした場合に前のタイマーがキャンセルされることを確認
      // 【対応要件】: FR-003
      // 🔵 信頼性レベル: requirements.md セクション3 FR-003に明記

      it('TC-011: 連続呼び出しで前のタイマーがキャンセルされる', () => {
        // Given: TooltipManagerが初期化済み、vi.useFakeTimers()でタイマーをモック
        manager = TooltipManager.getInstance();
        manager.initialize(scene);

        // When:
        // - show({ content: 'テスト1', x: 100, y: 100, delay: 500 })を呼び出す
        manager.show({ content: 'テスト1', x: 100, y: 100, delay: 500 });
        // - 200ms経過
        vi.advanceTimersByTime(200);
        // - show({ content: 'テスト2', x: 200, y: 200, delay: 500 })を呼び出す
        manager.show({ content: 'テスト2', x: 200, y: 200, delay: 500 });
        // - さらに400ms経過（合計600ms、最初から700ms）
        vi.advanceTimersByTime(400);

        // Then:
        // - まだ非表示（2回目のshow()から500ms経過していない）
        expect(manager.isVisible()).toBe(false);

        // - さらに100ms経過（2回目のshow()から500ms経過）
        vi.advanceTimersByTime(100);
        // - ツールチップが表示される
        expect(manager.isVisible()).toBe(true);
        // - 表示内容は'テスト2'
        expect(mockText.setText).toHaveBeenLastCalledWith('テスト2');
      });
    });

    describe('TC-012: コンテンツ更新', () => {
      // 【テスト目的】: 表示中にshow()を呼び出すとコンテンツが更新されることを確認
      // 【対応要件】: FR-006
      // 🔵 信頼性レベル: requirements.md セクション3 FR-006に明記

      it('TC-012: 表示中にshow()でコンテンツが更新される', () => {
        // Given: TooltipManagerが初期化済み、ツールチップが表示中
        manager = TooltipManager.getInstance();
        manager.initialize(scene);
        manager.show({ content: '最初のテキスト', x: 100, y: 100, delay: 0 });

        // When: 新しいコンテンツでshow()を呼び出す
        manager.show({ content: '更新されたテキスト', x: 100, y: 100, delay: 0 });

        // Then:
        // - テキスト内容が更新される
        expect(mockText.setText).toHaveBeenCalledWith('更新されたテキスト');
      });
    });

    describe('TC-013: リソース破棄', () => {
      // 【テスト目的】: destroy()でリソースが解放されることを確認
      // 【対応要件】: FR-007, AC-007
      // 🔵 信頼性レベル: requirements.md セクション3 FR-007に明記

      it('TC-013: destroy()でリソースが解放される', () => {
        // Given: TooltipManagerが初期化済み、ツールチップが表示中
        manager = TooltipManager.getInstance();
        manager.initialize(scene);
        manager.show({ content: 'テスト', x: 100, y: 100, delay: 0 });

        // When: destroy()を呼び出す
        manager.destroy();

        // Then:
        // - コンテナのdestroy()が呼び出される
        expect(mockContainer.destroy).toHaveBeenCalled();
        // - isInitialized()がfalseを返す
        expect(manager.isInitialized()).toBe(false);
      });
    });

    describe('TC-014: 再初期化可能性', () => {
      // 【テスト目的】: destroy()後に再初期化できることを確認
      // 【対応要件】: FR-007
      // 🔵 信頼性レベル: requirements.md セクション3 FR-007に明記

      it('TC-014: destroy()後に再初期化できる', () => {
        // Given: TooltipManagerが初期化済み、destroy()が呼び出された後
        manager = TooltipManager.getInstance();
        manager.initialize(scene);
        manager.destroy();

        // 新しいシーンモックを作成
        const newMocks = createMockScene();
        const newScene = newMocks.scene;

        // When: 再度initialize(scene)を呼び出す
        manager.initialize(newScene);

        // Then:
        // - isInitialized()がtrueを返す
        expect(manager.isInitialized()).toBe(true);
        // - ツールチップの表示/非表示が正常に動作する
        manager.show({ content: 'テスト', x: 100, y: 100, delay: 0 });
        expect(manager.isVisible()).toBe(true);
        manager.hide();
        expect(manager.isVisible()).toBe(false);
      });
    });
  });

  // ========================================
  // 2. 異常系テストケース
  // ========================================

  describe('異常系', () => {
    describe('TC-101: null sceneでの初期化', () => {
      // 【テスト目的】: initialize()にnullを渡した場合にエラーがスローされることを確認
      // 【対応要件】: ERR-001
      // 🔵 信頼性レベル: requirements.md セクション6 ERR-001に明記

      it('TC-101: initialize(null)でエラーがスローされる', () => {
        // Given: TooltipManagerインスタンスが取得済み
        manager = TooltipManager.getInstance();

        // When & Then: initialize(null)を呼び出すとErrorがスローされる
        expect(() => manager.initialize(null as unknown as Phaser.Scene)).toThrow();
        // - エラーメッセージに'scene'が含まれる
        expect(() => manager.initialize(null as unknown as Phaser.Scene)).toThrow(/scene/i);
      });
    });

    describe('TC-102: undefined sceneでの初期化', () => {
      // 【テスト目的】: initialize()にundefinedを渡した場合にエラーがスローされることを確認
      // 【対応要件】: ERR-001
      // 🔵 信頼性レベル: requirements.md セクション6 ERR-001に明記

      it('TC-102: initialize(undefined)でエラーがスローされる', () => {
        // Given: TooltipManagerインスタンスが取得済み
        manager = TooltipManager.getInstance();

        // When & Then: initialize(undefined)を呼び出すとErrorがスローされる
        expect(() => manager.initialize(undefined as unknown as Phaser.Scene)).toThrow();
        // - エラーメッセージに'scene'が含まれる
        expect(() => manager.initialize(undefined as unknown as Phaser.Scene)).toThrow(/scene/i);
      });
    });

    describe('TC-103: containerメソッドがないsceneでの初期化', () => {
      // 【テスト目的】: scene.add.containerがない場合にエラーがスローされることを確認
      // 【対応要件】: ERR-002
      // 🔵 信頼性レベル: requirements.md セクション6 ERR-002に明記

      it('TC-103: containerがないsceneでエラーがスローされる', () => {
        // Given: TooltipManagerインスタンスが取得済み、scene.add.containerがundefined
        manager = TooltipManager.getInstance();
        const invalidScene = {
          add: {
            container: undefined,
          },
          cameras: {
            main: {
              width: 800,
              height: 600,
            },
          },
        } as unknown as Phaser.Scene;

        // When & Then: initialize(invalidScene)を呼び出すとErrorがスローされる
        expect(() => manager.initialize(invalidScene)).toThrow();
        // - エラーメッセージに'container'が含まれる
        expect(() => manager.initialize(invalidScene)).toThrow(/container/i);
      });
    });

    describe('TC-104: 初期化前のshow()呼び出し', () => {
      // 【テスト目的】: 初期化前にshow()を呼び出しても安全であることを確認
      // 【対応要件】: ERR-003
      // 🔵 信頼性レベル: requirements.md セクション6 ERR-003に明記

      it('TC-104: 初期化前のshow()はエラーを投げない', () => {
        // Given: TooltipManagerが未初期化（initialize()未呼び出し）
        manager = TooltipManager.getInstance();

        // When: show()を呼び出す
        // Then: エラーがスローされない
        expect(() => manager.show({ content: 'テスト', x: 100, y: 100 })).not.toThrow();

        // - 何も表示されない
        // - isVisible()がfalseを返す
        expect(manager.isVisible()).toBe(false);
      });
    });

    describe('TC-105: 初期化前のhide()呼び出し', () => {
      // 【テスト目的】: 初期化前にhide()を呼び出しても安全であることを確認
      // 【対応要件】: ERR-004
      // 🔵 信頼性レベル: requirements.md セクション6 ERR-004に明記

      it('TC-105: 初期化前のhide()はエラーを投げない', () => {
        // Given: TooltipManagerが未初期化
        manager = TooltipManager.getInstance();

        // When: hide()を呼び出す
        // Then: エラーがスローされない、正常に処理が完了する
        expect(() => manager.hide()).not.toThrow();
      });
    });

    describe('TC-106: 空文字コンテンツでの表示', () => {
      // 【テスト目的】: 空文字コンテンツでも表示されることを確認
      // 【対応要件】: ERR-005
      // 🟡 信頼性レベル: requirements.md セクション6 ERR-005に明記

      it('TC-106: 空文字コンテンツでもエラーなく表示される', () => {
        // Given: TooltipManagerが初期化済み
        manager = TooltipManager.getInstance();
        manager.initialize(scene);

        // When: show({ content: '', x: 100, y: 100, delay: 0 })を呼び出す
        // Then: エラーがスローされない
        expect(() => manager.show({ content: '', x: 100, y: 100, delay: 0 })).not.toThrow();

        // - 空のツールチップが表示される
        expect(manager.isVisible()).toBe(true);
      });
    });

    describe('TC-107: NaN座標での表示', () => {
      // 【テスト目的】: NaN座標の場合に0, 0として扱われることを確認
      // 【対応要件】: ERR-006
      // 🟡 信頼性レベル: requirements.md セクション6 ERR-006に明記

      it('TC-107: NaN座標は0, 0として扱われる', () => {
        // Given: TooltipManagerが初期化済み、console.warnをモック
        manager = TooltipManager.getInstance();
        manager.initialize(scene);
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        // When: show({ content: 'テスト', x: NaN, y: NaN, delay: 0 })を呼び出す
        manager.show({ content: 'テスト', x: NaN, y: NaN, delay: 0 });

        // Then:
        // - 警告ログが出力される
        expect(warnSpy).toHaveBeenCalled();
        // - ツールチップが表示される
        expect(manager.isVisible()).toBe(true);

        warnSpy.mockRestore();
      });
    });

    describe('TC-108: Infinity座標での表示', () => {
      // 【テスト目的】: Infinity座標の場合に0, 0として扱われることを確認
      // 【対応要件】: ERR-006
      // 🟡 信頼性レベル: requirements.md セクション6 ERR-006に明記

      it('TC-108: Infinity座標は0, 0として扱われる', () => {
        // Given: TooltipManagerが初期化済み、console.warnをモック
        manager = TooltipManager.getInstance();
        manager.initialize(scene);
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        // When: show({ content: 'テスト', x: Infinity, y: -Infinity, delay: 0 })を呼び出す
        manager.show({ content: 'テスト', x: Infinity, y: -Infinity, delay: 0 });

        // Then:
        // - 警告ログが出力される
        expect(warnSpy).toHaveBeenCalled();
        // - ツールチップが表示される
        expect(manager.isVisible()).toBe(true);

        warnSpy.mockRestore();
      });
    });
  });

  // ========================================
  // 3. 境界値テストケース
  // ========================================

  describe('境界値', () => {
    describe('TC-201: 画面右端での位置調整', () => {
      // 【テスト目的】: 画面右端でツールチップが左にシフトされることを確認
      // 【対応要件】: FR-005, AC-005
      // 🔵 信頼性レベル: requirements.md セクション3 FR-005に明記

      it('TC-201: 画面右端で左方向にシフトされる', () => {
        // Given: TooltipManagerが初期化済み（画面幅: 800px、ツールチップ幅: 200px）
        manager = TooltipManager.getInstance();
        manager.initialize(scene);

        // When: show({ content: 'テスト', x: 750, y: 100, delay: 0 })を呼び出す
        manager.show({ content: 'テスト', x: 750, y: 100, delay: 0 });

        // Then:
        // - ツールチップが左方向にシフトされる
        // - setPositionが呼び出され、X座標が調整される
        expect(mockContainer.setPosition).toHaveBeenCalled();
        // - 最終X座標が590以下（800 - 200 - 10 = 590）
        const lastCall =
          mockContainer.setPosition.mock.calls[mockContainer.setPosition.mock.calls.length - 1];
        expect(lastCall[0]).toBeLessThanOrEqual(590);
      });
    });

    describe('TC-202: 画面下端での位置調整', () => {
      // 【テスト目的】: 画面下端でツールチップが上にシフトされることを確認
      // 【対応要件】: FR-005, AC-006
      // 🔵 信頼性レベル: requirements.md セクション3 FR-005に明記

      it('TC-202: 画面下端で上方向にシフトされる', () => {
        // Given: TooltipManagerが初期化済み（画面高さ: 600px、ツールチップ高さ: 100px）
        manager = TooltipManager.getInstance();
        manager.initialize(scene);

        // When: show({ content: 'テスト', x: 100, y: 550, delay: 0 })を呼び出す
        manager.show({ content: 'テスト', x: 100, y: 550, delay: 0 });

        // Then:
        // - ツールチップが上方向にシフトされる
        // - setPositionが呼び出され、Y座標が調整される
        expect(mockContainer.setPosition).toHaveBeenCalled();
        // - 最終Y座標が490以下（600 - 100 - 10 = 490）
        const lastCall =
          mockContainer.setPosition.mock.calls[mockContainer.setPosition.mock.calls.length - 1];
        expect(lastCall[1]).toBeLessThanOrEqual(490);
      });
    });

    describe('TC-203: 画面左上隅（最小値）での表示', () => {
      // 【テスト目的】: 座標(0, 0)でも最小マージンが適用されることを確認
      // 【対応要件】: FR-005
      // 🔵 信頼性レベル: requirements.md セクション3 FR-005に明記

      it('TC-203: 座標(0, 0)で最小マージン10pxが適用される', () => {
        // Given: TooltipManagerが初期化済み
        manager = TooltipManager.getInstance();
        manager.initialize(scene);

        // When: show({ content: 'テスト', x: 0, y: 0, delay: 0 })を呼び出す
        manager.show({ content: 'テスト', x: 0, y: 0, delay: 0 });

        // Then:
        // - setPositionが呼び出される
        expect(mockContainer.setPosition).toHaveBeenCalled();
        // - X座標が10以上、Y座標が10以上
        const lastCall =
          mockContainer.setPosition.mock.calls[mockContainer.setPosition.mock.calls.length - 1];
        expect(lastCall[0]).toBeGreaterThanOrEqual(10);
        expect(lastCall[1]).toBeGreaterThanOrEqual(10);
      });
    });

    describe('TC-204: 負の座標での表示', () => {
      // 【テスト目的】: 負の座標でも最小マージンが適用されることを確認
      // 【対応要件】: FR-005
      // 🔵 信頼性レベル: requirements.md セクション3 FR-005に明記

      it('TC-204: 負の座標で最小マージン10pxが適用される', () => {
        // Given: TooltipManagerが初期化済み
        manager = TooltipManager.getInstance();
        manager.initialize(scene);

        // When: show({ content: 'テスト', x: -50, y: -30, delay: 0 })を呼び出す
        manager.show({ content: 'テスト', x: -50, y: -30, delay: 0 });

        // Then:
        // - X座標が10になる、Y座標が10になる
        const lastCall =
          mockContainer.setPosition.mock.calls[mockContainer.setPosition.mock.calls.length - 1];
        expect(lastCall[0]).toBe(10);
        expect(lastCall[1]).toBe(10);
      });
    });

    describe('TC-205: 遅延0msでの表示', () => {
      // 【テスト目的】: delay: 0でタイマーが使用されないことを確認
      // 【対応要件】: FR-003
      // 🔵 信頼性レベル: requirements.md セクション3 FR-003に明記

      it('TC-205: delay: 0でタイマーが使用されない', () => {
        // Given: TooltipManagerが初期化済み
        manager = TooltipManager.getInstance();
        manager.initialize(scene);

        // When: show({ content: 'テスト', x: 100, y: 100, delay: 0 })を呼び出す
        manager.show({ content: 'テスト', x: 100, y: 100, delay: 0 });

        // Then:
        // - ツールチップが即座に表示される
        expect(manager.isVisible()).toBe(true);
        // - タイマーを進めなくても表示されている
      });
    });

    describe('TC-206: 最大幅でのテキスト折り返し', () => {
      // 【テスト目的】: maxWidthを指定した場合にテキストが折り返されることを確認
      // 【対応要件】: FR-006
      // 🔵 信頼性レベル: requirements.md セクション3 FR-006に明記

      it('TC-206: maxWidth指定でテキストが折り返される', () => {
        // Given: TooltipManagerが初期化済み、長いテキストコンテンツ
        manager = TooltipManager.getInstance();
        manager.initialize(scene);
        const longText = '非常に長いテキストコンテンツがここに入ります。これは折り返しテストです。';

        // When: show({ content: ..., x: 100, y: 100, maxWidth: 150, delay: 0 })を呼び出す
        manager.show({
          content: longText,
          x: 100,
          y: 100,
          maxWidth: 150,
          delay: 0,
        });

        // Then:
        // - setWordWrapWidthが呼び出される
        expect(mockText.setWordWrapWidth).toHaveBeenCalledWith(150);
      });
    });
  });

  // ========================================
  // 4. 統合テストケース
  // ========================================

  describe('統合', () => {
    describe('TC-301: 表示→非表示→再表示の一連の動作', () => {
      // 【テスト目的】: 表示/非表示の一連の動作が正常に機能することを確認
      // 【対応要件】: FR-003, FR-004
      // 🔵 信頼性レベル: requirements.md セクション3 FR-003, FR-004に明記

      it('TC-301: 表示→非表示→再表示が正常に動作する', () => {
        // Given: TooltipManagerが初期化済み
        manager = TooltipManager.getInstance();
        manager.initialize(scene);

        // When & Then:
        // 1. show()を呼び出してツールチップを表示
        manager.show({ content: 'テスト', x: 100, y: 100, delay: 0 });
        expect(manager.isVisible()).toBe(true);

        // 2. hide()を呼び出して非表示
        manager.hide();
        expect(manager.isVisible()).toBe(false);

        // 3. 再度show()を呼び出して表示
        manager.show({ content: '再表示', x: 200, y: 200, delay: 0 });
        expect(manager.isVisible()).toBe(true);
      });
    });

    describe('TC-302: シーン初期化→使用→破棄→再初期化の一連の動作', () => {
      // 【テスト目的】: ライフサイクル全体が正常に機能することを確認
      // 【対応要件】: FR-002, FR-007
      // 🔵 信頼性レベル: requirements.md セクション3 FR-002, FR-007に明記

      it('TC-302: 初期化→使用→破棄→再初期化が正常に動作する', () => {
        // Given: TooltipManagerインスタンスが取得済み、複数のPhaserシーンモック
        manager = TooltipManager.getInstance();
        const mocks1 = createMockScene();
        const mocks2 = createMockScene();

        // 1. initialize(scene1)を呼び出す
        manager.initialize(mocks1.scene);
        expect(manager.isInitialized()).toBe(true);

        // 2. show()、hide()を実行
        manager.show({ content: 'テスト1', x: 100, y: 100, delay: 0 });
        expect(manager.isVisible()).toBe(true);
        manager.hide();
        expect(manager.isVisible()).toBe(false);

        // 3. destroy()を呼び出す
        manager.destroy();
        expect(manager.isInitialized()).toBe(false);
        // - scene1のコンテナは破棄される
        expect(mocks1.mockContainer.destroy).toHaveBeenCalled();

        // 4. initialize(scene2)を呼び出す
        manager.initialize(mocks2.scene);
        expect(manager.isInitialized()).toBe(true);

        // 5. show()、hide()を実行
        manager.show({ content: 'テスト2', x: 200, y: 200, delay: 0 });
        expect(manager.isVisible()).toBe(true);
        manager.hide();
        expect(manager.isVisible()).toBe(false);
      });
    });

    describe('TC-303: 深度（depth）の確認', () => {
      // 【テスト目的】: コンテナのdepthが1000に設定されることを確認
      // 【対応要件】: NFR-002
      // 🔵 信頼性レベル: requirements.md セクション4 NFR-002に明記

      it('TC-303: コンテナのdepthが1000に設定される', () => {
        // Given: TooltipManagerが初期化済み
        manager = TooltipManager.getInstance();
        manager.initialize(scene);

        // When: show()を呼び出してツールチップを表示
        manager.show({ content: 'テスト', x: 100, y: 100, delay: 0 });

        // Then:
        // - コンテナのdepthが1000に設定される
        expect(mockContainer.setDepth).toHaveBeenCalledWith(1000);
      });
    });

    describe('TC-304: 複数のshow()呼び出しでの排他制御', () => {
      // 【テスト目的】: 連続したshow()呼び出しで最新のものだけが表示されることを確認
      // 【対応要件】: FR-003
      // 🔵 信頼性レベル: requirements.md セクション3 FR-003に明記

      it('TC-304: 連続show()で最新のコンテンツのみ表示される', () => {
        // Given: TooltipManagerが初期化済み
        manager = TooltipManager.getInstance();
        manager.initialize(scene);

        // When:
        // 1. show({ content: 'ツールチップ1', x: 100, y: 100, delay: 0 })を呼び出す
        manager.show({ content: 'ツールチップ1', x: 100, y: 100, delay: 0 });
        // 2. 即座にshow({ content: 'ツールチップ2', x: 200, y: 200, delay: 0 })を呼び出す
        manager.show({ content: 'ツールチップ2', x: 200, y: 200, delay: 0 });

        // Then:
        // - 最新のshow()の内容のみが表示される
        // - ツールチップ2の内容が表示される
        expect(mockText.setText).toHaveBeenLastCalledWith('ツールチップ2');
      });
    });
  });
});
