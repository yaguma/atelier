/**
 * CardViewFactoryテスト
 *
 * カード種別に応じたCardView生成のテスト
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Phaserのモック
vi.mock('phaser', () => {
  const Rectangle = function (
    this: { x: number; y: number; width: number; height: number },
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  };
  Rectangle.Contains = vi.fn(() => true);

  return {
    default: {
      Geom: {
        Rectangle,
      },
    },
    Geom: {
      Rectangle,
    },
  };
});

import { createCardView, getCardViewClass } from '../../../../../src/game/ui/card/CardViewFactory';
import { CardViewOptions } from '../../../../../src/game/ui/card/ICardView';
import {
  Card,
  IGatheringCard,
  IRecipeCard,
  IEnhancementCard,
} from '../../../../../src/domain/card/Card';
import {
  CardType,
  GuildRank,
  Rarity,
  EffectType,
  EnhancementTarget,
  ItemCategory,
} from '../../../../../src/domain/common/types';
import { GatheringCardView } from '../../../../../src/game/ui/card/GatheringCardView';
import { RecipeCardView } from '../../../../../src/game/ui/card/RecipeCardView';
import { EnhancementCardView } from '../../../../../src/game/ui/card/EnhancementCardView';

// モックシーン作成
const createMockScene = () => {
  const mockContainer = {
    add: vi.fn(),
    setPosition: vi.fn().mockReturnThis(),
    setScale: vi.fn().mockReturnThis(),
    setAlpha: vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis(),
    setDepth: vi.fn().mockReturnThis(),
    setSize: vi.fn().mockReturnThis(),
    setInteractive: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    off: vi.fn().mockReturnThis(),
    removeInteractive: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    x: 0,
    y: 0,
  };

  const mockGraphics = {
    clear: vi.fn().mockReturnThis(),
    fillStyle: vi.fn().mockReturnThis(),
    fillRoundedRect: vi.fn().mockReturnThis(),
    lineStyle: vi.fn().mockReturnThis(),
    strokeRoundedRect: vi.fn().mockReturnThis(),
    fillRect: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  };

  const mockText = {
    setOrigin: vi.fn().mockReturnThis(),
    setText: vi.fn().mockReturnThis(),
    setWordWrapWidth: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    height: 20,
  };

  return {
    add: {
      container: vi.fn(() => ({ ...mockContainer })),
      graphics: vi.fn(() => ({ ...mockGraphics })),
      text: vi.fn(() => ({ ...mockText })),
      image: vi.fn(() => ({
        setOrigin: vi.fn().mockReturnThis(),
        setScale: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
      })),
    },
    tweens: {
      add: vi.fn(),
    },
    cameras: {
      main: {
        width: 1280,
        height: 720,
      },
    },
    textures: {
      exists: vi.fn(() => false),
    },
  };
};

// テスト用カードデータ
const createGatheringCard = (): IGatheringCard => ({
  id: 'gathering-001',
  name: '森の採取地',
  type: CardType.GATHERING,
  rarity: Rarity.COMMON,
  unlockRank: GuildRank.G,
  description: 'テスト用採取地カード',
  cost: 1,
  materials: [],
});

const createRecipeCard = (): IRecipeCard => ({
  id: 'recipe-001',
  name: '回復薬レシピ',
  type: CardType.RECIPE,
  rarity: Rarity.COMMON,
  unlockRank: GuildRank.G,
  description: 'テスト用レシピカード',
  cost: 2,
  requiredMaterials: [],
  outputItemId: 'potion-001',
  category: ItemCategory.MEDICINE,
});

const createEnhancementCard = (): IEnhancementCard => ({
  id: 'enhancement-001',
  name: '品質アップ',
  type: CardType.ENHANCEMENT,
  rarity: Rarity.COMMON,
  unlockRank: GuildRank.G,
  description: 'テスト用強化カード',
  cost: 0,
  effect: {
    type: EffectType.QUALITY_UP,
    value: 10,
  },
  targetAction: EnhancementTarget.ALCHEMY,
});

describe('CardViewFactory', () => {
  let mockScene: ReturnType<typeof createMockScene>;

  beforeEach(() => {
    mockScene = createMockScene();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createCardView()', () => {
    it('採取地カードからGatheringCardViewを生成する', () => {
      const card = createGatheringCard();
      const options: CardViewOptions = {
        x: 100,
        y: 200,
        card,
      };

      const view = createCardView(mockScene as any, options);

      expect(view).toBeInstanceOf(GatheringCardView);
    });

    it('レシピカードからRecipeCardViewを生成する', () => {
      const card = createRecipeCard();
      const options: CardViewOptions = {
        x: 100,
        y: 200,
        card,
      };

      const view = createCardView(mockScene as any, options);

      expect(view).toBeInstanceOf(RecipeCardView);
    });

    it('強化カードからEnhancementCardViewを生成する', () => {
      const card = createEnhancementCard();
      const options: CardViewOptions = {
        x: 100,
        y: 200,
        card,
      };

      const view = createCardView(mockScene as any, options);

      expect(view).toBeInstanceOf(EnhancementCardView);
    });

    it('オプションが正しく渡される', () => {
      const card = createGatheringCard();
      const onClick = vi.fn();
      const options: CardViewOptions = {
        x: 100,
        y: 200,
        card,
        size: 'SMALL',
        state: 'selected',
        interactive: true,
        onClick,
      };

      const view = createCardView(mockScene as any, options);

      expect(view.card).toBe(card);
    });
  });

  describe('getCardViewClass()', () => {
    it('GATHERING型のクラスを取得できる', () => {
      const ViewClass = getCardViewClass(CardType.GATHERING);

      expect(ViewClass).toBe(GatheringCardView);
    });

    it('RECIPE型のクラスを取得できる', () => {
      const ViewClass = getCardViewClass(CardType.RECIPE);

      expect(ViewClass).toBe(RecipeCardView);
    });

    it('ENHANCEMENT型のクラスを取得できる', () => {
      const ViewClass = getCardViewClass(CardType.ENHANCEMENT);

      expect(ViewClass).toBe(EnhancementCardView);
    });

    it('不明な型の場合はGatheringCardViewを返す', () => {
      const ViewClass = getCardViewClass('unknown' as CardType);

      expect(ViewClass).toBe(GatheringCardView);
    });
  });
});
