/**
 * RewardCardSelector単体テスト
 *
 * TASK-0231: RewardCardSelector設計・実装のテスト
 * 報酬カード選択UIの各機能をテストする。
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CardType, Rarity, GuildRank } from '../../../../../src/domain/common/types';
import { GatheringCard, RecipeCard } from '../../../../../src/domain/card/CardEntity';
import { RewardCardSelector } from '../../../../../src/game/ui/reward/RewardCardSelector';
import type { RewardCardSelectorOptions } from '../../../../../src/game/ui/reward/IRewardCardSelector';

// Phaserをモック
vi.mock('phaser', () => {
  class MockRectangle {
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(x: number = 0, y: number = 0, width: number = 0, height: number = 0) {
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
    Geom: {
      Rectangle: MockRectangle,
    },
  };
});

/**
 * モックPhaserシーン作成
 */
function createMockScene(): Phaser.Scene {
  const mockGraphics = {
    fillStyle: vi.fn().mockReturnThis(),
    fillRoundedRect: vi.fn().mockReturnThis(),
    fillRect: vi.fn().mockReturnThis(),
    fillCircle: vi.fn().mockReturnThis(),
    lineStyle: vi.fn().mockReturnThis(),
    strokeRoundedRect: vi.fn().mockReturnThis(),
    lineBetween: vi.fn().mockReturnThis(),
    clear: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  };

  const createMockContainer = () => {
    const data: Record<string, unknown> = {};
    const children: unknown[] = [];
    const container: any = {
      setDepth: vi.fn().mockReturnThis(),
      setVisible: vi.fn().mockReturnThis(),
      setAlpha: vi.fn().mockReturnThis(),
      setY: vi.fn().mockReturnThis(),
      setScale: vi.fn().mockReturnThis(),
      add: vi.fn().mockImplementation((child: unknown) => {
        children.push(child);
        return container;
      }),
      destroy: vi.fn(),
      setData: vi.fn().mockImplementation(function (key: string, value: unknown) {
        data[key] = value;
        return container;
      }),
      getData: vi.fn().mockImplementation((key: string) => {
        return data[key];
      }),
      setInteractive: vi.fn().mockReturnThis(),
      disableInteractive: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
      off: vi.fn().mockReturnThis(),
      removeAll: vi.fn().mockImplementation(function () {
        children.length = 0;
      }),
      getAll: vi.fn().mockReturnValue(children),
      each: vi.fn().mockImplementation((callback: (child: unknown) => void) => {
        children.forEach(callback);
      }),
      getAt: vi.fn().mockImplementation((index: number) => children[index]),
      get length() {
        return children.length;
      },
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
    };
    return container;
  };

  const createMockText = () => ({
    setOrigin: vi.fn().mockReturnThis(),
    setAlpha: vi.fn().mockReturnThis(),
    setText: vi.fn().mockReturnThis(),
    setColor: vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    text: '',
  });

  const mockTime = {
    delayedCall: vi.fn().mockImplementation((_delay: number, callback: () => void) => {
      callback();
      return { remove: vi.fn() };
    }),
  };

  const mockTween = {
    add: vi.fn().mockImplementation((config: any) => {
      // 即座にonCompleteを呼び出す
      if (config.onComplete) {
        config.onComplete();
      }
      return { remove: vi.fn() };
    }),
    killTweensOf: vi.fn(),
  };

  const mockCamera = {
    width: 800,
    height: 600,
  };

  return {
    add: {
      container: vi.fn().mockImplementation(() => createMockContainer()),
      graphics: vi.fn().mockReturnValue(mockGraphics),
      text: vi.fn().mockImplementation(() => createMockText()),
    },
    tweens: mockTween,
    time: mockTime,
    cameras: {
      main: mockCamera,
    },
    textures: {
      exists: vi.fn().mockReturnValue(false),
    },
  } as unknown as Phaser.Scene;
}

/**
 * テスト用のモックカードを作成
 */
function createMockCard(overrides: Partial<any> = {}): GatheringCard {
  const defaultCard = {
    id: overrides.id ?? 'card-1',
    name: overrides.name ?? 'テストカード',
    type: CardType.GATHERING,
    rarity: Rarity.COMMON,
    unlockRank: GuildRank.G,
    description: 'テスト用カード',
    cost: 1,
    locationId: 'loc-1',
    materials: [
      { materialId: 'mat-1', dropRate: 100, isRare: false },
    ],
  };

  return new GatheringCard({ ...defaultCard, ...overrides } as any);
}

describe('RewardCardSelector', () => {
  let mockScene: Phaser.Scene;

  beforeEach(() => {
    mockScene = createMockScene();
  });

  // ========================================
  // 1. コンストラクタ・初期化
  // ========================================

  describe('初期化', () => {
    it('オプションを渡してインスタンス化できる', () => {
      const cards = [createMockCard({ id: 'card-1' })];
      const options: RewardCardSelectorOptions = {
        scene: mockScene,
        cards,
      };

      const selector = new RewardCardSelector(options);

      expect(selector).toBeDefined();
      expect(selector.container).toBeDefined();
    });

    it('カードが設定される', () => {
      const cards = [
        createMockCard({ id: 'card-1' }),
        createMockCard({ id: 'card-2' }),
        createMockCard({ id: 'card-3' }),
      ];
      const options: RewardCardSelectorOptions = {
        scene: mockScene,
        cards,
      };

      const selector = new RewardCardSelector(options);

      expect(selector.getCards()).toHaveLength(3);
    });

    it('初期状態では選択されていない', () => {
      const cards = [createMockCard()];
      const selector = new RewardCardSelector({
        scene: mockScene,
        cards,
      });

      expect(selector.getSelectedCard()).toBeNull();
    });

    it('カスタムタイトルを設定できる', () => {
      const cards = [createMockCard()];
      const selector = new RewardCardSelector({
        scene: mockScene,
        cards,
        title: 'カスタムタイトル',
      });

      expect(selector).toBeDefined();
    });
  });

  // ========================================
  // 2. カード表示
  // ========================================

  describe('カード表示', () => {
    it('3枚のカードが表示される', () => {
      const cards = [
        createMockCard({ id: 'card-1', name: 'カード1' }),
        createMockCard({ id: 'card-2', name: 'カード2' }),
        createMockCard({ id: 'card-3', name: 'カード3' }),
      ];
      const selector = new RewardCardSelector({
        scene: mockScene,
        cards,
      });

      expect(selector.getCards()).toHaveLength(3);
      expect(selector.getCards()[0].id).toBe('card-1');
      expect(selector.getCards()[1].id).toBe('card-2');
      expect(selector.getCards()[2].id).toBe('card-3');
    });

    it('setCardsでカードを更新できる', () => {
      const initialCards = [createMockCard({ id: 'card-1' })];
      const selector = new RewardCardSelector({
        scene: mockScene,
        cards: initialCards,
      });

      const newCards = [
        createMockCard({ id: 'card-new-1' }),
        createMockCard({ id: 'card-new-2' }),
      ];
      selector.setCards(newCards);

      expect(selector.getCards()).toHaveLength(2);
      expect(selector.getCards()[0].id).toBe('card-new-1');
    });
  });

  // ========================================
  // 3. カード選択
  // ========================================

  describe('カード選択', () => {
    it('selectCardでカードを選択できる', () => {
      const card1 = createMockCard({ id: 'card-1' });
      const card2 = createMockCard({ id: 'card-2' });
      const selector = new RewardCardSelector({
        scene: mockScene,
        cards: [card1, card2],
      });

      selector.selectCard(card1);

      expect(selector.getSelectedCard()).toBe(card1);
    });

    it('getSelectedCardで選択中のカードを取得できる', () => {
      const card = createMockCard({ id: 'card-1' });
      const selector = new RewardCardSelector({
        scene: mockScene,
        cards: [card],
      });

      selector.selectCard(card);
      const selected = selector.getSelectedCard();

      expect(selected).toBe(card);
    });

    it('別のカードを選択すると前の選択が解除される', () => {
      const card1 = createMockCard({ id: 'card-1' });
      const card2 = createMockCard({ id: 'card-2' });
      const selector = new RewardCardSelector({
        scene: mockScene,
        cards: [card1, card2],
      });

      selector.selectCard(card1);
      selector.selectCard(card2);

      expect(selector.getSelectedCard()).toBe(card2);
    });

    it('存在しないカードを選択しても何も起きない', () => {
      const card1 = createMockCard({ id: 'card-1' });
      const card2 = createMockCard({ id: 'card-2' });
      const nonExistentCard = createMockCard({ id: 'card-not-exist' });
      const selector = new RewardCardSelector({
        scene: mockScene,
        cards: [card1],
      });

      selector.selectCard(card1);
      selector.selectCard(nonExistentCard);

      // 前の選択が維持される
      expect(selector.getSelectedCard()).toBe(card1);
    });
  });

  // ========================================
  // 4. 選択確定
  // ========================================

  describe('選択確定', () => {
    it('confirmでonSelectコールバックが呼ばれる', () => {
      const onSelect = vi.fn();
      const card = createMockCard({ id: 'card-1' });
      const selector = new RewardCardSelector({
        scene: mockScene,
        cards: [card],
        onSelect,
      });

      selector.selectCard(card);
      selector.confirm();

      expect(onSelect).toHaveBeenCalledWith(card);
    });

    it('未選択時にconfirmしても何も起きない', () => {
      const onSelect = vi.fn();
      const card = createMockCard({ id: 'card-1' });
      const selector = new RewardCardSelector({
        scene: mockScene,
        cards: [card],
        onSelect,
      });

      selector.confirm();

      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  // ========================================
  // 5. キャンセル
  // ========================================

  describe('キャンセル', () => {
    it('cancelでonCancelコールバックが呼ばれる', () => {
      const onCancel = vi.fn();
      const card = createMockCard({ id: 'card-1' });
      const selector = new RewardCardSelector({
        scene: mockScene,
        cards: [card],
        onCancel,
      });

      selector.cancel();

      expect(onCancel).toHaveBeenCalled();
    });

    it('onCancelが未設定でもエラーにならない', () => {
      const card = createMockCard({ id: 'card-1' });
      const selector = new RewardCardSelector({
        scene: mockScene,
        cards: [card],
      });

      expect(() => selector.cancel()).not.toThrow();
    });
  });

  // ========================================
  // 6. 表示制御
  // ========================================

  describe('表示制御', () => {
    it('showでダイアログが表示される', () => {
      const card = createMockCard({ id: 'card-1' });
      const selector = new RewardCardSelector({
        scene: mockScene,
        cards: [card],
      });

      selector.show();

      expect(selector.container.setVisible).toHaveBeenCalledWith(true);
    });

    it('hideでダイアログが非表示になる', () => {
      const card = createMockCard({ id: 'card-1' });
      const selector = new RewardCardSelector({
        scene: mockScene,
        cards: [card],
      });

      selector.hide();

      expect(selector.container.setVisible).toHaveBeenCalledWith(false);
    });
  });

  // ========================================
  // 7. 破棄
  // ========================================

  describe('破棄', () => {
    it('destroyでリソースが解放される', () => {
      const card = createMockCard({ id: 'card-1' });
      const selector = new RewardCardSelector({
        scene: mockScene,
        cards: [card],
      });

      selector.destroy();

      expect(selector.container.destroy).toHaveBeenCalled();
    });
  });

  // ========================================
  // 8. IRewardCardSelectorインターフェース準拠
  // ========================================

  describe('IRewardCardSelectorインターフェース準拠', () => {
    it('全てのメソッドが実装されている', () => {
      const card = createMockCard({ id: 'card-1' });
      const selector = new RewardCardSelector({
        scene: mockScene,
        cards: [card],
      });

      // カード設定
      expect(typeof selector.setCards).toBe('function');
      expect(typeof selector.getCards).toBe('function');

      // 選択操作
      expect(typeof selector.getSelectedCard).toBe('function');
      expect(typeof selector.selectCard).toBe('function');

      // 操作
      expect(typeof selector.confirm).toBe('function');
      expect(typeof selector.cancel).toBe('function');

      // 表示制御
      expect(typeof selector.show).toBe('function');
      expect(typeof selector.hide).toBe('function');
      expect(typeof selector.destroy).toBe('function');
    });
  });
});
