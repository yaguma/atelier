/**
 * FooterUI - 視覚実装テスト
 * TASK-0047 共通UIコンポーネント視覚実装
 *
 * @description
 * フッターUIの視覚要素（フェーズインジケーター、手札表示、次へボタン）をテストする
 *
 * @信頼性レベル 🔵 testcases.md セクション5に基づく
 */

import { FooterUI } from '@presentation/ui/components/FooterUI';
import { GamePhase } from '@shared/types/common';
import type Phaser from 'phaser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// =============================================================================
// カラー定数
// =============================================================================

const PHASE_COLORS = {
  /** 未到達（グレー） */
  PENDING: 0x6b7280,
  /** 現在（プライマリ） */
  CURRENT: 0x6366f1,
  /** 完了（緑） */
  COMPLETED: 0x10b981,
} as const;

const BUTTON_COLORS = {
  /** プライマリ（有効時） */
  PRIMARY: 0x6366f1,
  /** 無効時（グレー） */
  DISABLED: 0x4b5563,
} as const;

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
 * Circleモックインターフェース
 */
interface MockCircle {
  setFillStyle: ReturnType<typeof vi.fn>;
  setStrokeStyle: ReturnType<typeof vi.fn>;
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
  mockCircle: MockCircle;
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

  const mockCircle: MockCircle = {
    setFillStyle: vi.fn().mockReturnThis(),
    setStrokeStyle: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  };

  const mockContainer: MockContainer = {
    add: vi.fn().mockReturnThis(),
    setPosition: vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis(),
    setDepth: vi.fn().mockReturnThis(),
    getAt: vi.fn((index) => {
      // インデックス0は背景、インデックス1はテキストを返す
      if (index === 0) {
        return mockRectangle;
      }
      return mockText;
    }),
    destroy: vi.fn(),
  };

  const scene = {
    add: {
      container: vi.fn().mockReturnValue(mockContainer),
      text: vi.fn().mockReturnValue(mockText),
      graphics: vi.fn().mockReturnValue(mockGraphics),
      rectangle: vi.fn().mockReturnValue(mockRectangle),
      circle: vi.fn().mockReturnValue(mockCircle),
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

  return { scene, mockContainer, mockText, mockGraphics, mockRectangle, mockCircle };
};

// =============================================================================
// テストスイート
// =============================================================================

describe('FooterUI 視覚実装テスト', () => {
  let scene: MockScene;
  let footerUI: FooterUI;
  let mockText: MockText;
  let mockRectangle: MockRectangle;
  let mockCircle: MockCircle;

  beforeEach(() => {
    const mocks = createMockScene();
    scene = mocks.scene;
    mockText = mocks.mockText;
    mockRectangle = mocks.mockRectangle;
    mockCircle = mocks.mockCircle;

    // FooterUIを初期化（x: 0, y: 0で作成）
    footerUI = new FooterUI(scene, 0, 0);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // フェーズインジケーターテスト
  // ===========================================================================

  describe('フェーズインジケーター', () => {
    describe('FUI-V-01: create()でフェーズインジケーターが4つ生成されること', () => {
      // 【テスト目的】: create()メソッド呼び出し後に4つのフェーズインジケーターが生成されることを確認
      // 【対応要件】: REQ-047-14

      it('FUI-V-01: フェーズインジケーターが4つ生成される', () => {
        // Given: FooterUIが初期化済み
        // When: create()を呼び出す
        footerUI.create();

        // Then:
        // - getPhaseIndicators()の長さが4
        const phaseIndicators = footerUI.getPhaseIndicators();
        expect(phaseIndicators).toHaveLength(4);
        // - scene.add.circleが4回呼び出される（各フェーズ用）
        // Note: 現在の実装では視覚要素は生成されないため、このテストは失敗する
        expect(scene.add.circle).toHaveBeenCalledTimes(4);
      });
    });

    describe('FUI-V-02: 現在フェーズのインジケーターがハイライトされること', () => {
      // 【テスト目的】: 現在のフェーズがハイライト色で表示されることを確認
      // 【対応要件】: REQ-047-15

      it('FUI-V-02: 現在フェーズ(GATHERING)がハイライトされる', () => {
        // Given: FooterUIが初期化済み
        footerUI.create();

        // When: フェーズをGATHERINGに更新する
        footerUI.updatePhaseIndicator(GamePhase.GATHERING, []);

        // Then:
        // - getPhaseIndicatorState(GATHERING)がCURRENTを返す
        expect(footerUI.getPhaseIndicatorState(GamePhase.GATHERING)).toBe('CURRENT');
        // - 視覚要素のsetFillStyleがCURRENT色(0x6366F1)で呼び出される
        // Note: 現在の実装では視覚要素は更新されないため、このテストは失敗する
        expect(mockCircle.setFillStyle).toHaveBeenCalledWith(PHASE_COLORS.CURRENT);
      });
    });

    describe('FUI-V-03: 完了フェーズのインジケーターが完了スタイルになること', () => {
      // 【テスト目的】: 完了したフェーズが完了色で表示されることを確認
      // 【対応要件】: REQ-047-16

      it('FUI-V-03: 完了フェーズ(QUEST_ACCEPT)が完了スタイルになる', () => {
        // Given: FooterUIが初期化済み
        footerUI.create();

        // When: QUEST_ACCEPTを完了してGATHERINGに移行する
        footerUI.updatePhaseIndicator(GamePhase.GATHERING, [GamePhase.QUEST_ACCEPT]);

        // Then:
        // - getPhaseIndicatorState(QUEST_ACCEPT)がCOMPLETEDを返す
        expect(footerUI.getPhaseIndicatorState(GamePhase.QUEST_ACCEPT)).toBe('COMPLETED');
        // - 視覚要素のsetFillStyleがCOMPLETED色(0x10B981)で呼び出される
        // Note: 現在の実装では視覚要素は更新されないため、このテストは失敗する
        expect(mockCircle.setFillStyle).toHaveBeenCalledWith(PHASE_COLORS.COMPLETED);
      });
    });

    describe('FUI-V-04: 未到達フェーズのインジケーターがグレーアウトされること', () => {
      // 【テスト目的】: 未到達のフェーズがグレー色で表示されることを確認
      // 【対応要件】: REQ-047-16

      it('FUI-V-04: 未到達フェーズ(ALCHEMY, DELIVERY)がグレーアウトされる', () => {
        // Given: FooterUIが初期化済み
        footerUI.create();

        // When: QUEST_ACCEPTフェーズで更新する
        footerUI.updatePhaseIndicator(GamePhase.QUEST_ACCEPT, []);

        // Then:
        // - getPhaseIndicatorState(ALCHEMY)がPENDINGを返す
        expect(footerUI.getPhaseIndicatorState(GamePhase.ALCHEMY)).toBe('PENDING');
        // - getPhaseIndicatorState(DELIVERY)がPENDINGを返す
        expect(footerUI.getPhaseIndicatorState(GamePhase.DELIVERY)).toBe('PENDING');
        // - 視覚要素のsetFillStyleがPENDING色(0x6B7280)で呼び出される
        // Note: 現在の実装では視覚要素は更新されないため、このテストは失敗する
        expect(mockCircle.setFillStyle).toHaveBeenCalledWith(PHASE_COLORS.PENDING);
      });
    });
  });

  // ===========================================================================
  // 手札表示エリアテスト
  // ===========================================================================

  describe('手札表示エリア', () => {
    describe('FUI-V-05: create()で手札プレースホルダーが5つ生成されること', () => {
      // 【テスト目的】: create()メソッド呼び出し後に5つの手札プレースホルダーが生成されることを確認
      // 【対応要件】: REQ-047-17

      it('FUI-V-05: 手札プレースホルダーが5つ生成される', () => {
        // Given: FooterUIが初期化済み
        // When: create()を呼び出す
        footerUI.create();

        // Then:
        // - getHandDisplayAreaCapacity()が5を返す
        expect(footerUI.getHandDisplayAreaCapacity()).toBe(5);
        // - scene.add.rectangleが少なくとも5回呼び出される
        //   Note: 手札プレースホルダー5回 + 次へボタン背景1回 = 6回
        expect(scene.add.rectangle).toHaveBeenCalledTimes(6);
      });
    });
  });

  // ===========================================================================
  // 次へボタンテスト
  // ===========================================================================

  describe('次へボタン', () => {
    describe('FUI-V-06: create()で次へボタンが生成されること', () => {
      // 【テスト目的】: create()メソッド呼び出し後に次へボタンが生成されることを確認
      // 【対応要件】: REQ-047-18

      it('FUI-V-06: 次へボタンが生成される', () => {
        // Given: FooterUIが初期化済み
        // When: create()を呼び出す
        footerUI.create();

        // Then:
        // - getNextButtonLabel()で値が取得できる
        const nextButtonLabel = footerUI.getNextButtonLabel();
        expect(nextButtonLabel).toBeDefined();
        // - scene.add.containerがボタン用に呼び出される
        // Note: 現在の実装では視覚要素は生成されないため、このテストは失敗する
        expect(scene.add.container).toHaveBeenCalled();
      });
    });

    describe('FUI-V-07: 次へボタンがクリック可能であること', () => {
      // 【テスト目的】: 次へボタンにインタラクティブ領域が設定されていることを確認
      // 【対応要件】: REQ-047-18

      it('FUI-V-07: 次へボタンがクリック可能である', () => {
        // Given: FooterUIが初期化済み
        footerUI.create();

        // Then:
        // - setInteractiveが呼び出されている
        // Note: 現在の実装では視覚要素は生成されないため、このテストは失敗する
        expect(mockRectangle.setInteractive).toHaveBeenCalled();
      });
    });

    describe('FUI-V-08: QUEST_ACCEPTフェーズでボタンラベルが「採取へ」になること', () => {
      // 【テスト目的】: QUEST_ACCEPTフェーズ時にボタンラベルが「採取へ」であることを確認
      // 【対応要件】: REQ-047-19

      it('FUI-V-08: QUEST_ACCEPTフェーズでボタンラベルが「採取へ」になる', () => {
        // Given: FooterUIが初期化済み
        footerUI.create();

        // When: QUEST_ACCEPTフェーズで次へボタンを更新する
        footerUI.updateNextButton('採取へ', true);

        // Then:
        // - getNextButtonLabel()が「採取へ」を返す
        expect(footerUI.getNextButtonLabel()).toBe('採取へ');
        // - 視覚要素のsetTextが「採取へ」で呼び出される
        // Note: 現在の実装では視覚要素は更新されないため、このテストは失敗する
        expect(mockText.setText).toHaveBeenCalledWith('採取へ');
      });
    });

    describe('FUI-V-09: GATHERINGフェーズでボタンラベルが「調合へ」になること', () => {
      // 【テスト目的】: GATHERINGフェーズ時にボタンラベルが「調合へ」であることを確認
      // 【対応要件】: REQ-047-19

      it('FUI-V-09: GATHERINGフェーズでボタンラベルが「調合へ」になる', () => {
        // Given: FooterUIが初期化済み
        footerUI.create();

        // When: GATHERINGフェーズで次へボタンを更新する
        footerUI.updateNextButton('調合へ', true);

        // Then:
        // - getNextButtonLabel()が「調合へ」を返す
        expect(footerUI.getNextButtonLabel()).toBe('調合へ');
        // - 視覚要素のsetTextが「調合へ」で呼び出される
        // Note: 現在の実装では視覚要素は更新されないため、このテストは失敗する
        expect(mockText.setText).toHaveBeenCalledWith('調合へ');
      });

      it('FUI-V-09b: ALCHEMYフェーズでボタンラベルが「納品へ」になる', () => {
        // Given: FooterUIが初期化済み
        footerUI.create();

        // When: ALCHEMYフェーズで次へボタンを更新する
        footerUI.updateNextButton('納品へ', true);

        // Then:
        // - getNextButtonLabel()が「納品へ」を返す
        expect(footerUI.getNextButtonLabel()).toBe('納品へ');
        // - 視覚要素のsetTextが「納品へ」で呼び出される
        // Note: 現在の実装では視覚要素は更新されないため、このテストは失敗する
        expect(mockText.setText).toHaveBeenCalledWith('納品へ');
      });

      it('FUI-V-09c: DELIVERYフェーズでボタンラベルが「日終了」になる', () => {
        // Given: FooterUIが初期化済み
        footerUI.create();

        // When: DELIVERYフェーズで次へボタンを更新する
        footerUI.updateNextButton('日終了', true);

        // Then:
        // - getNextButtonLabel()が「日終了」を返す
        expect(footerUI.getNextButtonLabel()).toBe('日終了');
        // - 視覚要素のsetTextが「日終了」で呼び出される
        // Note: 現在の実装では視覚要素は更新されないため、このテストは失敗する
        expect(mockText.setText).toHaveBeenCalledWith('日終了');
      });
    });

    describe('FUI-V-10: setNextButtonEnabled(false)でボタンがグレーアウトされること', () => {
      // 【テスト目的】: ボタン無効時にグレーアウト表示されることを確認
      // 【対応要件】: REQ-047-19

      it('FUI-V-10: ボタン無効時にグレーアウトされる', () => {
        // Given: FooterUIが初期化済み
        footerUI.create();

        // When: ボタンを無効化する
        footerUI.updateNextButton('採取へ', false);

        // Then:
        // - 視覚要素の背景色がdisabled色(0x4B5563)になる
        // Note: 現在の実装では視覚要素は更新されないため、このテストは失敗する
        expect(mockRectangle.setFillStyle).toHaveBeenCalledWith(BUTTON_COLORS.DISABLED);
      });

      it('FUI-V-10b: ボタン有効時に通常色になる', () => {
        // Given: FooterUIが初期化済み、ボタンが無効化されている
        footerUI.create();
        footerUI.updateNextButton('採取へ', false);

        // When: ボタンを有効化する
        footerUI.updateNextButton('採取へ', true);

        // Then:
        // - 視覚要素の背景色がprimary色(0x6366F1)になる
        // Note: 現在の実装では視覚要素は更新されないため、このテストは失敗する
        expect(mockRectangle.setFillStyle).toHaveBeenCalledWith(BUTTON_COLORS.PRIMARY);
      });
    });
  });

  // ===========================================================================
  // 次へボタンクリックテスト
  // ===========================================================================

  describe('次へボタンクリック', () => {
    it('有効時にクリックでコールバックが呼び出される', () => {
      // Given: FooterUIが初期化済み、コールバックが設定済み
      footerUI.create();
      const callback = vi.fn();
      footerUI.onNextClick(callback);
      footerUI.updateNextButton('採取へ', true);

      // When: ボタンをクリックする（シミュレート）
      footerUI.simulateNextButtonClick();

      // Then:
      // - コールバックが呼び出される
      expect(callback).toHaveBeenCalled();
    });

    it('無効時にクリックでコールバックが呼び出されない', () => {
      // Given: FooterUIが初期化済み、コールバックが設定済み、ボタンが無効
      footerUI.create();
      const callback = vi.fn();
      footerUI.onNextClick(callback);
      footerUI.updateNextButton('採取へ', false);

      // When: ボタンをクリックする（シミュレート）
      footerUI.simulateNextButtonClick();

      // Then:
      // - コールバックが呼び出されない
      expect(callback).not.toHaveBeenCalled();
    });
  });
});
