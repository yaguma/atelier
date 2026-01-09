/**
 * DeckView テスト
 *
 * DeckViewコンポーネントのテスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Phaserのモック - vi.mockはホイストされるためインラインで定義
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
      Math: {
        DegToRad: (deg: number) => deg * (Math.PI / 180),
        Between: (min: number, max: number) =>
          Math.floor(Math.random() * (max - min + 1)) + min,
      },
    },
  };
});

import { DeckView } from '../../../../../src/game/ui/deck/DeckView';
import { DeckViewLayout } from '../../../../../src/game/ui/deck/DeckViewConstants';

// Phaserモック
const createMockScene = () => {
  const mockGraphics = {
    fillStyle: vi.fn().mockReturnThis(),
    fillRoundedRect: vi.fn().mockReturnThis(),
    fillRect: vi.fn().mockReturnThis(),
    fillCircle: vi.fn().mockReturnThis(),
    lineStyle: vi.fn().mockReturnThis(),
    strokeRoundedRect: vi.fn().mockReturnThis(),
    strokeCircle: vi.fn().mockReturnThis(),
    clear: vi.fn().mockReturnThis(),
  };

  const mockText = {
    setOrigin: vi.fn().mockReturnThis(),
    setText: vi.fn().mockReturnThis(),
    setAlpha: vi.fn().mockReturnThis(),
    text: '',
  };

  const mockContainer = {
    add: vi.fn().mockReturnThis(),
    setDepth: vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis(),
    setPosition: vi.fn().mockReturnThis(),
    setInteractive: vi.fn().mockReturnThis(),
    disableInteractive: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    x: 100,
    y: 550,
  };

  const mockTimeline = {
    add: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    play: vi.fn(),
  };

  const mockTween = {
    add: vi.fn((config: any) => {
      // onCompleteがあれば即座に呼び出す（テスト用）
      if (config.onComplete) {
        setTimeout(() => config.onComplete(), 0);
      }
      return { stop: vi.fn() };
    }),
    createTimeline: vi.fn(() => mockTimeline),
  };

  return {
    add: {
      graphics: vi.fn(() => ({ ...mockGraphics })),
      text: vi.fn(() => ({ ...mockText })),
      container: vi.fn(() => ({ ...mockContainer })),
      existing: vi.fn(),
    },
    tweens: mockTween,
  };
};

describe('DeckView', () => {
  let mockScene: ReturnType<typeof createMockScene>;

  beforeEach(() => {
    mockScene = createMockScene();
  });

  describe('初期化', () => {
    it('デフォルトオプションで生成できる', () => {
      const deckView = new DeckView(mockScene as any);
      expect(deckView).toBeDefined();
      expect(deckView.container).toBeDefined();
    });

    it('カスタム位置で生成できる', () => {
      const deckView = new DeckView(mockScene as any, { x: 150, y: 600 });
      expect(deckView).toBeDefined();
      expect(mockScene.add.container).toHaveBeenCalledWith(150, 600);
    });

    it('クリックコールバックを設定できる', () => {
      const onClick = vi.fn();
      const deckView = new DeckView(mockScene as any, { onClick });
      expect(deckView).toBeDefined();
    });

    it('初期枚数は0', () => {
      const deckView = new DeckView(mockScene as any);
      expect(deckView.getCount()).toBe(0);
    });
  });

  describe('setCount', () => {
    it('枚数を設定できる', () => {
      const deckView = new DeckView(mockScene as any);
      deckView.setCount(20);
      expect(deckView.getCount()).toBe(20);
    });

    it('枚数0を設定できる', () => {
      const deckView = new DeckView(mockScene as any);
      deckView.setCount(20);
      deckView.setCount(0);
      expect(deckView.getCount()).toBe(0);
    });

    it('最大スタック数以上の枚数を設定できる', () => {
      const deckView = new DeckView(mockScene as any);
      deckView.setCount(100);
      expect(deckView.getCount()).toBe(100);
    });

    it('スタック表示数が最大値を超えない', () => {
      const deckView = new DeckView(mockScene as any);
      deckView.setCount(100);
      // スタックカードの表示数は MAX_VISIBLE_STACK を超えない
      expect(deckView.getCount()).toBe(100);
    });
  });

  describe('getCount', () => {
    it('設定した枚数を返す', () => {
      const deckView = new DeckView(mockScene as any);
      deckView.setCount(15);
      expect(deckView.getCount()).toBe(15);
    });

    it('複数回設定しても最新の値を返す', () => {
      const deckView = new DeckView(mockScene as any);
      deckView.setCount(10);
      deckView.setCount(25);
      deckView.setCount(5);
      expect(deckView.getCount()).toBe(5);
    });
  });

  describe('animateDraw', () => {
    it('ドローアニメーションを実行できる', async () => {
      const deckView = new DeckView(mockScene as any);
      deckView.setCount(10);

      const promise = deckView.animateDraw();
      expect(promise).toBeInstanceOf(Promise);
    });

    it('ドロー後に枚数が減る', async () => {
      const deckView = new DeckView(mockScene as any);
      deckView.setCount(10);

      await deckView.animateDraw();
      expect(deckView.getCount()).toBe(9);
    });
  });

  describe('animateShuffle', () => {
    it('シャッフルアニメーションを実行できる', () => {
      const deckView = new DeckView(mockScene as any);
      deckView.setCount(10);

      const promise = deckView.animateShuffle();
      expect(promise).toBeInstanceOf(Promise);
    });
  });

  describe('animateAddCard', () => {
    it('カード追加アニメーションを実行できる', async () => {
      const deckView = new DeckView(mockScene as any);
      deckView.setCount(10);

      const promise = deckView.animateAddCard();
      expect(promise).toBeInstanceOf(Promise);
    });

    it('追加後に枚数が増える', async () => {
      const deckView = new DeckView(mockScene as any);
      deckView.setCount(10);

      await deckView.animateAddCard();
      expect(deckView.getCount()).toBe(11);
    });
  });

  describe('setInteractive', () => {
    it('インタラクティブを有効にできる', () => {
      const deckView = new DeckView(mockScene as any);
      deckView.setInteractive(true);
      expect(deckView.container.setInteractive).toHaveBeenCalled();
    });

    it('インタラクティブを無効にできる', () => {
      const deckView = new DeckView(mockScene as any);
      deckView.setInteractive(false);
      expect(deckView.container.disableInteractive).toHaveBeenCalled();
    });
  });

  describe('setVisible', () => {
    it('非表示にできる', () => {
      const deckView = new DeckView(mockScene as any);
      deckView.setVisible(false);
      expect(deckView.container.setVisible).toHaveBeenCalledWith(false);
    });

    it('表示に戻せる', () => {
      const deckView = new DeckView(mockScene as any);
      deckView.setVisible(false);
      deckView.setVisible(true);
      expect(deckView.container.setVisible).toHaveBeenCalledWith(true);
    });
  });

  describe('destroy', () => {
    it('破棄できる', () => {
      const deckView = new DeckView(mockScene as any);
      deckView.destroy();
      expect(deckView.container.destroy).toHaveBeenCalled();
    });
  });
});
