/**
 * HeaderUI - 視覚実装テスト
 * TASK-0047 共通UIコンポーネント視覚実装
 *
 * @description
 * ヘッダーUIの視覚要素（テキスト生成、色変化、ゲージ更新）をテストする
 *
 * @信頼性レベル 🔵 testcases.md セクション3に基づく
 */

import { HeaderUI } from '@presentation/ui/components/HeaderUI';
import type Phaser from 'phaser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// =============================================================================
// カラー定数
// =============================================================================

const UI_COLORS = {
  /** 赤系（危険） */
  RED: 0xff6b6b,
  /** 黄系（警告） */
  YELLOW: 0xffd93d,
  /** 緑系（安全） */
  GREEN: 0x6bcb77,
  /** 水色（達成） */
  CYAN: 0x4ecdc4,
  /** 白 */
  WHITE: 0xffffff,
  /** 明るい赤（点滅用） */
  BRIGHT_RED: 0xff0000,
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
  fillRoundedRect: ReturnType<typeof vi.fn>;
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
    fillRoundedRect: vi.fn().mockReturnThis(),
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

describe('HeaderUI 視覚実装テスト', () => {
  let scene: MockScene;
  let headerUI: HeaderUI;
  let mockText: MockText;
  let mockGraphics: MockGraphics;

  beforeEach(() => {
    const mocks = createMockScene();
    scene = mocks.scene;
    mockText = mocks.mockText;
    mockGraphics = mocks.mockGraphics;

    // HeaderUIを初期化（x: 0, y: 0で作成）
    headerUI = new HeaderUI(scene, 0, 0);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // ランク表示テスト
  // ===========================================================================

  describe('ランク表示', () => {
    describe('HUI-V-01: create()でランク表示テキストが生成されること', () => {
      // 【テスト目的】: create()メソッド呼び出し後にランク表示テキストが生成されることを確認
      // 【対応要件】: REQ-047-01

      it('HUI-V-01: ランク表示テキストが生成される', () => {
        // Given: HeaderUIが初期化済み
        // When: create()を呼び出す
        headerUI.create();

        // Then:
        // - getRankText()で値が取得できる（初期値は空文字）
        const rankText = headerUI.getRankText();
        expect(rankText).toBeDefined();
        // - scene.add.textが呼び出される（視覚要素として生成される）
        // Note: 現在の実装では視覚要素は生成されないため、このテストは失敗する
        expect(scene.add.text).toHaveBeenCalled();
      });
    });

    describe('HUI-V-02: update()でランクテキストが更新されること', () => {
      // 【テスト目的】: update()呼び出し時にランクテキストが正しく更新されることを確認
      // 【対応要件】: REQ-047-01

      it('HUI-V-02: ランク更新時にテキストが変更される', () => {
        // Given: HeaderUIが初期化済み
        headerUI.create();

        // When: ランクをFに更新する
        headerUI.update({
          currentRank: 'F',
          promotionGauge: 0,
          remainingDays: 30,
          gold: 100,
          actionPoints: 3,
          maxActionPoints: 3,
        });

        // Then:
        // - getRankText()で更新された値が取得できる
        expect(headerUI.getRankText()).toBe('ランク: F');
        // - 視覚要素のsetTextが呼び出される
        // Note: 現在の実装では視覚要素は更新されないため、このテストは失敗する
        expect(mockText.setText).toHaveBeenCalledWith(expect.stringContaining('F'));
      });
    });
  });

  // ===========================================================================
  // 昇格ゲージテスト
  // ===========================================================================

  describe('昇格ゲージ', () => {
    describe('HUI-V-03: create()で昇格ゲージ背景バーが生成されること', () => {
      // 【テスト目的】: create()メソッド呼び出し後に昇格ゲージ背景バーが生成されることを確認
      // 【対応要件】: REQ-047-02

      it('HUI-V-03: 昇格ゲージの背景バーが生成される', () => {
        // Given: HeaderUIが初期化済み
        // When: create()を呼び出す
        headerUI.create();

        // Then:
        // - scene.add.graphicsが呼び出される（背景バー用）
        // Note: 現在の実装では視覚要素は生成されないため、このテストは失敗する
        expect(scene.add.graphics).toHaveBeenCalled();
      });
    });

    describe('HUI-V-04: create()で昇格ゲージフィルバーが生成されること', () => {
      // 【テスト目的】: create()メソッド呼び出し後に昇格ゲージフィルバーが生成されることを確認
      // 【対応要件】: REQ-047-02

      it('HUI-V-04: 昇格ゲージのフィルバーが生成される', () => {
        // Given: HeaderUIが初期化済み
        // When: create()を呼び出す
        headerUI.create();

        // Then:
        // - scene.add.graphicsが少なくとも2回呼び出される（背景バー + フィルバー）
        // Note: 現在の実装では視覚要素は生成されないため、このテストは失敗する
        expect(scene.add.graphics).toHaveBeenCalledTimes(2);
      });
    });

    describe('HUI-V-05: update()で昇格ゲージ幅が変更されること', () => {
      // 【テスト目的】: update()呼び出し時にゲージ幅が正しく変更されることを確認
      // 【対応要件】: REQ-047-02

      it('HUI-V-05: 昇格ゲージ更新時にバー幅が変更される', () => {
        // Given: HeaderUIが初期化済み
        headerUI.create();

        // When: 昇格ゲージを50%に更新する
        headerUI.update({
          currentRank: 'G',
          promotionGauge: 50,
          remainingDays: 30,
          gold: 100,
          actionPoints: 3,
          maxActionPoints: 3,
        });

        // Then:
        // - getPromotionGaugeValue()で更新された値が取得できる
        expect(headerUI.getPromotionGaugeValue()).toBe(50);
        // - 視覚要素のclear()とfillRect()が呼び出される
        // Note: 現在の実装では視覚要素は更新されないため、このテストは失敗する
        expect(mockGraphics.clear).toHaveBeenCalled();
        expect(mockGraphics.fillRect).toHaveBeenCalled();
      });
    });

    describe('HUI-V-06: 昇格ゲージ30%未満で赤色になること', () => {
      // 【テスト目的】: 昇格ゲージが30%未満の時に赤色で表示されることを確認
      // 【対応要件】: REQ-047-03

      it('HUI-V-06: 昇格ゲージ20%で赤色(0xFF6B6B)になる', () => {
        // Given: HeaderUIが初期化済み
        headerUI.create();

        // When: 昇格ゲージを20%に更新する
        headerUI.update({
          currentRank: 'G',
          promotionGauge: 20,
          remainingDays: 30,
          gold: 100,
          actionPoints: 3,
          maxActionPoints: 3,
        });

        // Then:
        // - getPromotionGaugeColor()が赤色(0xFF6B6B)を返す
        expect(headerUI.getPromotionGaugeColor()).toBe(UI_COLORS.RED);
        // - 視覚要素のfillStyleが赤色で呼び出される
        // Note: 現在の実装では視覚要素は更新されないため、このテストは失敗する
        expect(mockGraphics.fillStyle).toHaveBeenCalledWith(UI_COLORS.RED, expect.any(Number));
      });
    });

    describe('HUI-V-07: 昇格ゲージ30-59%で黄色になること', () => {
      // 【テスト目的】: 昇格ゲージが30-59%の時に黄色で表示されることを確認
      // 【対応要件】: REQ-047-03

      it('HUI-V-07: 昇格ゲージ45%で黄色(0xFFD93D)になる', () => {
        // Given: HeaderUIが初期化済み
        headerUI.create();

        // When: 昇格ゲージを45%に更新する
        headerUI.update({
          currentRank: 'G',
          promotionGauge: 45,
          remainingDays: 30,
          gold: 100,
          actionPoints: 3,
          maxActionPoints: 3,
        });

        // Then:
        // - getPromotionGaugeColor()が黄色(0xFFD93D)を返す
        expect(headerUI.getPromotionGaugeColor()).toBe(UI_COLORS.YELLOW);
        // - 視覚要素のfillStyleが黄色で呼び出される
        // Note: 現在の実装では視覚要素は更新されないため、このテストは失敗する
        expect(mockGraphics.fillStyle).toHaveBeenCalledWith(UI_COLORS.YELLOW, expect.any(Number));
      });
    });

    describe('HUI-V-08: 昇格ゲージ60-99%で緑色になること', () => {
      // 【テスト目的】: 昇格ゲージが60-99%の時に緑色で表示されることを確認
      // 【対応要件】: REQ-047-03

      it('HUI-V-08: 昇格ゲージ75%で緑色(0x6BCB77)になる', () => {
        // Given: HeaderUIが初期化済み
        headerUI.create();

        // When: 昇格ゲージを75%に更新する
        headerUI.update({
          currentRank: 'G',
          promotionGauge: 75,
          remainingDays: 30,
          gold: 100,
          actionPoints: 3,
          maxActionPoints: 3,
        });

        // Then:
        // - getPromotionGaugeColor()が緑色(0x6BCB77)を返す
        expect(headerUI.getPromotionGaugeColor()).toBe(UI_COLORS.GREEN);
        // - 視覚要素のfillStyleが緑色で呼び出される
        // Note: 現在の実装では視覚要素は更新されないため、このテストは失敗する
        expect(mockGraphics.fillStyle).toHaveBeenCalledWith(UI_COLORS.GREEN, expect.any(Number));
      });
    });

    describe('HUI-V-09: 昇格ゲージ100%で水色になること', () => {
      // 【テスト目的】: 昇格ゲージが100%の時に水色で表示されることを確認
      // 【対応要件】: REQ-047-03

      it('HUI-V-09: 昇格ゲージ100%で水色(0x4ECDC4)になる', () => {
        // Given: HeaderUIが初期化済み
        headerUI.create();

        // When: 昇格ゲージを100%に更新する
        headerUI.update({
          currentRank: 'G',
          promotionGauge: 100,
          remainingDays: 30,
          gold: 100,
          actionPoints: 3,
          maxActionPoints: 3,
        });

        // Then:
        // - getPromotionGaugeColor()が水色(0x4ECDC4)を返す
        expect(headerUI.getPromotionGaugeColor()).toBe(UI_COLORS.CYAN);
        // - 視覚要素のfillStyleが水色で呼び出される
        // Note: 現在の実装では視覚要素は更新されないため、このテストは失敗する
        expect(mockGraphics.fillStyle).toHaveBeenCalledWith(UI_COLORS.CYAN, expect.any(Number));
      });
    });
  });

  // ===========================================================================
  // 残り日数テスト
  // ===========================================================================

  describe('残り日数', () => {
    describe('HUI-V-10: create()で残り日数テキストが生成されること', () => {
      // 【テスト目的】: create()メソッド呼び出し後に残り日数テキストが生成されることを確認
      // 【対応要件】: REQ-047-04

      it('HUI-V-10: 残り日数テキストが生成される', () => {
        // Given: HeaderUIが初期化済み
        // When: create()を呼び出す
        headerUI.create();

        // Then:
        // - getRemainingDaysText()で値が取得できる
        const daysText = headerUI.getRemainingDaysText();
        expect(daysText).toBeDefined();
        // - scene.add.textが残り日数用に呼び出される
        // Note: 現在の実装では視覚要素は生成されないため、このテストは失敗する
        expect(scene.add.text).toHaveBeenCalled();
      });
    });

    describe('HUI-V-11: 残り日数11日以上で白色になること', () => {
      // 【テスト目的】: 残り日数が11日以上の時に白色で表示されることを確認
      // 【対応要件】: REQ-047-04

      it('HUI-V-11: 残り日数15日で白色(0xFFFFFF)になる', () => {
        // Given: HeaderUIが初期化済み
        headerUI.create();

        // When: 残り日数を15日に更新する
        headerUI.update({
          currentRank: 'G',
          promotionGauge: 0,
          remainingDays: 15,
          gold: 100,
          actionPoints: 3,
          maxActionPoints: 3,
        });

        // Then:
        // - getRemainingDaysColor()が白色(0xFFFFFF)を返す
        expect(headerUI.getRemainingDaysColor()).toBe(UI_COLORS.WHITE);
        // - 視覚要素のsetColorが白色で呼び出される
        // Note: 現在の実装では視覚要素は更新されないため、このテストは失敗する
        expect(mockText.setColor).toHaveBeenCalledWith('#FFFFFF');
      });
    });

    describe('HUI-V-12: 残り日数6-10日で黄色になること', () => {
      // 【テスト目的】: 残り日数が6-10日の時に黄色で表示されることを確認
      // 【対応要件】: REQ-047-04

      it('HUI-V-12: 残り日数8日で黄色になる', () => {
        // Given: HeaderUIが初期化済み
        headerUI.create();

        // When: 残り日数を8日に更新する
        headerUI.update({
          currentRank: 'G',
          promotionGauge: 0,
          remainingDays: 8,
          gold: 100,
          actionPoints: 3,
          maxActionPoints: 3,
        });

        // Then:
        // - getRemainingDaysColor()が黄色(0xFFD93D)を返す
        expect(headerUI.getRemainingDaysColor()).toBe(UI_COLORS.YELLOW);
        // - 視覚要素のsetColorが黄色で呼び出される
        // Note: 現在の実装では視覚要素は更新されないため、このテストは失敗する
        expect(mockText.setColor).toHaveBeenCalledWith('#FFD93D');
      });
    });

    describe('HUI-V-13: 残り日数4-5日で赤色になること', () => {
      // 【テスト目的】: 残り日数が4-5日の時に赤色で表示されることを確認
      // 【対応要件】: REQ-047-04

      it('HUI-V-13: 残り日数5日で赤色になる', () => {
        // Given: HeaderUIが初期化済み
        headerUI.create();

        // When: 残り日数を5日に更新する
        headerUI.update({
          currentRank: 'G',
          promotionGauge: 0,
          remainingDays: 5,
          gold: 100,
          actionPoints: 3,
          maxActionPoints: 3,
        });

        // Then:
        // - getRemainingDaysColor()が赤色(0xFF6B6B)を返す
        expect(headerUI.getRemainingDaysColor()).toBe(UI_COLORS.RED);
        // - 視覚要素のsetColorが赤色で呼び出される
        // Note: 現在の実装では視覚要素は更新されないため、このテストは失敗する
        expect(mockText.setColor).toHaveBeenCalledWith('#FF6B6B');
      });
    });

    describe('HUI-V-14: 残り日数3日以下で点滅Tweenが開始されること', () => {
      // 【テスト目的】: 残り日数が3日以下の時に点滅アニメーションが開始されることを確認
      // 【対応要件】: REQ-047-05

      it('HUI-V-14: 残り日数3日で点滅Tweenが開始される', () => {
        // Given: HeaderUIが初期化済み
        headerUI.create();

        // When: 残り日数を3日に更新する
        headerUI.update({
          currentRank: 'G',
          promotionGauge: 0,
          remainingDays: 3,
          gold: 100,
          actionPoints: 3,
          maxActionPoints: 3,
        });

        // Then:
        // - isRemainingDaysBlinking()がtrueを返す
        expect(headerUI.isRemainingDaysBlinking()).toBe(true);
        // - scene.tweens.addが呼び出される
        // Note: 現在の実装では視覚要素は更新されないため、このテストは失敗する
        expect(scene.tweens.add).toHaveBeenCalled();
      });

      it('HUI-V-14b: 残り日数4日以上で点滅が停止される', () => {
        // Given: HeaderUIが初期化済み、残り日数3日で点滅中
        headerUI.create();
        headerUI.update({
          currentRank: 'G',
          promotionGauge: 0,
          remainingDays: 3,
          gold: 100,
          actionPoints: 3,
          maxActionPoints: 3,
        });

        // When: 残り日数を5日に更新する
        headerUI.update({
          currentRank: 'G',
          promotionGauge: 0,
          remainingDays: 5,
          gold: 100,
          actionPoints: 3,
          maxActionPoints: 3,
        });

        // Then:
        // - isRemainingDaysBlinking()がfalseを返す
        expect(headerUI.isRemainingDaysBlinking()).toBe(false);
        // - killTweensOfが呼び出される
        // Note: 現在の実装では視覚要素は更新されないため、このテストは失敗する
        expect(scene.tweens.killTweensOf).toHaveBeenCalled();
      });
    });
  });

  // ===========================================================================
  // 所持金・行動ポイントテスト
  // ===========================================================================

  describe('所持金・行動ポイント', () => {
    describe('HUI-V-15: create()で所持金テキストが生成されること', () => {
      // 【テスト目的】: create()メソッド呼び出し後に所持金テキストが生成されることを確認
      // 【対応要件】: REQ-047-06

      it('HUI-V-15: 所持金テキストが生成される', () => {
        // Given: HeaderUIが初期化済み
        // When: create()を呼び出す
        headerUI.create();

        // Then:
        // - getGoldText()で値が取得できる
        const goldText = headerUI.getGoldText();
        expect(goldText).toBeDefined();
        // - scene.add.textが所持金用に呼び出される
        // Note: 現在の実装では視覚要素は生成されないため、このテストは失敗する
        expect(scene.add.text).toHaveBeenCalled();
      });

      it('HUI-V-15b: 所持金更新時にテキストが変更される', () => {
        // Given: HeaderUIが初期化済み
        headerUI.create();

        // When: 所持金を500に更新する
        headerUI.update({
          currentRank: 'G',
          promotionGauge: 0,
          remainingDays: 30,
          gold: 500,
          actionPoints: 3,
          maxActionPoints: 3,
        });

        // Then:
        // - getGoldText()で更新された値が取得できる
        expect(headerUI.getGoldText()).toBe('500G');
        // - 視覚要素のsetTextが呼び出される
        // Note: 現在の実装では視覚要素は更新されないため、このテストは失敗する
        expect(mockText.setText).toHaveBeenCalledWith(expect.stringContaining('500'));
      });
    });

    describe('HUI-V-16: create()で行動ポイントテキストが生成されること', () => {
      // 【テスト目的】: create()メソッド呼び出し後に行動ポイントテキストが生成されることを確認
      // 【対応要件】: REQ-047-07

      it('HUI-V-16: 行動ポイントテキストが生成される', () => {
        // Given: HeaderUIが初期化済み
        // When: create()を呼び出す
        headerUI.create();

        // Then:
        // - getActionPointsText()で値が取得できる
        const actionPointsText = headerUI.getActionPointsText();
        expect(actionPointsText).toBeDefined();
        // - scene.add.textが行動ポイント用に呼び出される
        // Note: 現在の実装では視覚要素は生成されないため、このテストは失敗する
        expect(scene.add.text).toHaveBeenCalled();
      });

      it('HUI-V-16b: 行動ポイント更新時にテキストが変更される', () => {
        // Given: HeaderUIが初期化済み
        headerUI.create();

        // When: 行動ポイントを2/3に更新する
        headerUI.update({
          currentRank: 'G',
          promotionGauge: 0,
          remainingDays: 30,
          gold: 100,
          actionPoints: 2,
          maxActionPoints: 3,
        });

        // Then:
        // - getActionPointsText()で更新された値が取得できる
        expect(headerUI.getActionPointsText()).toBe('2/3 AP');
        // - 視覚要素のsetTextが「2/3 AP」形式で呼び出される
        // Note: 現在の実装では視覚要素は更新されないため、このテストは失敗する
        expect(mockText.setText).toHaveBeenCalledWith('2/3 AP');
      });
    });
  });

  // ===========================================================================
  // 境界値テスト
  // ===========================================================================

  describe('境界値テスト', () => {
    describe('昇格ゲージ境界値', () => {
      it('HUI-BV-01: 昇格ゲージ0%で赤色', () => {
        headerUI.create();
        headerUI.update({
          currentRank: 'G',
          promotionGauge: 0,
          remainingDays: 30,
          gold: 100,
          actionPoints: 3,
          maxActionPoints: 3,
        });
        expect(headerUI.getPromotionGaugeColor()).toBe(UI_COLORS.RED);
      });

      it('HUI-BV-02: 昇格ゲージ29%で赤色', () => {
        headerUI.create();
        headerUI.update({
          currentRank: 'G',
          promotionGauge: 29,
          remainingDays: 30,
          gold: 100,
          actionPoints: 3,
          maxActionPoints: 3,
        });
        expect(headerUI.getPromotionGaugeColor()).toBe(UI_COLORS.RED);
      });

      it('HUI-BV-03: 昇格ゲージ30%で黄色', () => {
        headerUI.create();
        headerUI.update({
          currentRank: 'G',
          promotionGauge: 30,
          remainingDays: 30,
          gold: 100,
          actionPoints: 3,
          maxActionPoints: 3,
        });
        expect(headerUI.getPromotionGaugeColor()).toBe(UI_COLORS.YELLOW);
      });

      it('HUI-BV-04: 昇格ゲージ59%で黄色', () => {
        headerUI.create();
        headerUI.update({
          currentRank: 'G',
          promotionGauge: 59,
          remainingDays: 30,
          gold: 100,
          actionPoints: 3,
          maxActionPoints: 3,
        });
        expect(headerUI.getPromotionGaugeColor()).toBe(UI_COLORS.YELLOW);
      });

      it('HUI-BV-05: 昇格ゲージ60%で緑色', () => {
        headerUI.create();
        headerUI.update({
          currentRank: 'G',
          promotionGauge: 60,
          remainingDays: 30,
          gold: 100,
          actionPoints: 3,
          maxActionPoints: 3,
        });
        expect(headerUI.getPromotionGaugeColor()).toBe(UI_COLORS.GREEN);
      });

      it('HUI-BV-06: 昇格ゲージ99%で緑色', () => {
        headerUI.create();
        headerUI.update({
          currentRank: 'G',
          promotionGauge: 99,
          remainingDays: 30,
          gold: 100,
          actionPoints: 3,
          maxActionPoints: 3,
        });
        expect(headerUI.getPromotionGaugeColor()).toBe(UI_COLORS.GREEN);
      });

      it('HUI-BV-07: 昇格ゲージ100%で水色', () => {
        headerUI.create();
        headerUI.update({
          currentRank: 'G',
          promotionGauge: 100,
          remainingDays: 30,
          gold: 100,
          actionPoints: 3,
          maxActionPoints: 3,
        });
        expect(headerUI.getPromotionGaugeColor()).toBe(UI_COLORS.CYAN);
      });
    });

    describe('残り日数境界値', () => {
      it('HUI-BV-08: 残り日数11日で白色', () => {
        headerUI.create();
        headerUI.update({
          currentRank: 'G',
          promotionGauge: 0,
          remainingDays: 11,
          gold: 100,
          actionPoints: 3,
          maxActionPoints: 3,
        });
        expect(headerUI.getRemainingDaysColor()).toBe(UI_COLORS.WHITE);
        expect(headerUI.isRemainingDaysBlinking()).toBe(false);
      });

      it('HUI-BV-09: 残り日数10日で黄色', () => {
        headerUI.create();
        headerUI.update({
          currentRank: 'G',
          promotionGauge: 0,
          remainingDays: 10,
          gold: 100,
          actionPoints: 3,
          maxActionPoints: 3,
        });
        expect(headerUI.getRemainingDaysColor()).toBe(UI_COLORS.YELLOW);
        expect(headerUI.isRemainingDaysBlinking()).toBe(false);
      });

      it('HUI-BV-10: 残り日数6日で黄色', () => {
        headerUI.create();
        headerUI.update({
          currentRank: 'G',
          promotionGauge: 0,
          remainingDays: 6,
          gold: 100,
          actionPoints: 3,
          maxActionPoints: 3,
        });
        expect(headerUI.getRemainingDaysColor()).toBe(UI_COLORS.YELLOW);
        expect(headerUI.isRemainingDaysBlinking()).toBe(false);
      });

      it('HUI-BV-11: 残り日数5日で赤色', () => {
        headerUI.create();
        headerUI.update({
          currentRank: 'G',
          promotionGauge: 0,
          remainingDays: 5,
          gold: 100,
          actionPoints: 3,
          maxActionPoints: 3,
        });
        expect(headerUI.getRemainingDaysColor()).toBe(UI_COLORS.RED);
        expect(headerUI.isRemainingDaysBlinking()).toBe(false);
      });

      it('HUI-BV-12: 残り日数4日で赤色', () => {
        headerUI.create();
        headerUI.update({
          currentRank: 'G',
          promotionGauge: 0,
          remainingDays: 4,
          gold: 100,
          actionPoints: 3,
          maxActionPoints: 3,
        });
        expect(headerUI.getRemainingDaysColor()).toBe(UI_COLORS.RED);
        expect(headerUI.isRemainingDaysBlinking()).toBe(false);
      });

      it('HUI-BV-13: 残り日数3日で明るい赤色+点滅', () => {
        headerUI.create();
        headerUI.update({
          currentRank: 'G',
          promotionGauge: 0,
          remainingDays: 3,
          gold: 100,
          actionPoints: 3,
          maxActionPoints: 3,
        });
        expect(headerUI.getRemainingDaysColor()).toBe(UI_COLORS.BRIGHT_RED);
        expect(headerUI.isRemainingDaysBlinking()).toBe(true);
      });

      it('HUI-BV-14: 残り日数1日で明るい赤色+点滅', () => {
        headerUI.create();
        headerUI.update({
          currentRank: 'G',
          promotionGauge: 0,
          remainingDays: 1,
          gold: 100,
          actionPoints: 3,
          maxActionPoints: 3,
        });
        expect(headerUI.getRemainingDaysColor()).toBe(UI_COLORS.BRIGHT_RED);
        expect(headerUI.isRemainingDaysBlinking()).toBe(true);
      });
    });
  });
});
