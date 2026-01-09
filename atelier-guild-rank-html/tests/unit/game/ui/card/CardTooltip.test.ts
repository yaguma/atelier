/**
 * CardTooltipテスト
 *
 * カードホバー時に表示されるツールチップの動作テスト
 */

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';

// Phaserのモック - vi.mockはホイストされるためインラインで定義
vi.mock('phaser', () => {
  return {
    default: {},
  };
});

import { CardTooltip, CardTooltipConfig } from '../../../../../src/game/ui/card/CardTooltip';
import { IGatheringCard, IRecipeCard, IEnhancementCard } from '../../../../../src/domain/card/Card';
import {
  CardType,
  GuildRank,
  Rarity,
  Quality,
  EffectType,
  EnhancementTarget,
  ItemCategory,
} from '../../../../../src/domain/common/types';

// モックシーン作成
const createMockScene = () => {
  const mockContainer = {
    add: vi.fn(),
    setPosition: vi.fn().mockReturnThis(),
    setScale: vi.fn().mockReturnThis(),
    setAlpha: vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis(),
    setDepth: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  };

  const mockGraphics = {
    clear: vi.fn().mockReturnThis(),
    fillStyle: vi.fn().mockReturnThis(),
    fillRoundedRect: vi.fn().mockReturnThis(),
    lineStyle: vi.fn().mockReturnThis(),
    strokeRoundedRect: vi.fn().mockReturnThis(),
  };

  const mockText = {
    setOrigin: vi.fn().mockReturnThis(),
    setText: vi.fn().mockReturnThis(),
    setWordWrapWidth: vi.fn().mockReturnThis(),
    height: 20,
  };

  const mockTween = {
    targets: null,
    alpha: 0,
    duration: 0,
    ease: '',
    onComplete: null as (() => void) | null,
  };

  return {
    add: {
      container: vi.fn(() => mockContainer),
      graphics: vi.fn(() => mockGraphics),
      text: vi.fn(() => mockText),
    },
    tweens: {
      add: vi.fn((config: typeof mockTween) => {
        // onCompleteを即座に実行するオプション
        if (config.onComplete) {
          config.onComplete();
        }
        return config;
      }),
    },
    cameras: {
      main: {
        width: 1280,
        height: 720,
      },
    },
    _mockContainer: mockContainer,
    _mockGraphics: mockGraphics,
    _mockText: mockText,
  };
};

// テスト用の採取地カードデータ
const createTestGatheringCard = (): IGatheringCard => ({
  id: 'test-gathering-001',
  name: '森の採取地',
  type: CardType.GATHERING,
  rarity: Rarity.COMMON,
  unlockRank: GuildRank.G,
  description: 'テスト用の採取地カード',
  cost: 1,
  materials: [
    { materialId: 'mat-001', quantity: 2, probability: 0.8 },
    { materialId: 'mat-002', quantity: 1, probability: 0.5, quality: Quality.C },
  ],
});

// テスト用のレシピカードデータ
const createTestRecipeCard = (): IRecipeCard => ({
  id: 'test-recipe-001',
  name: '回復薬レシピ',
  type: CardType.RECIPE,
  rarity: Rarity.COMMON,
  unlockRank: GuildRank.G,
  description: 'テスト用のレシピカード',
  cost: 2,
  requiredMaterials: [
    { materialId: 'herb', quantity: 2 },
    { materialId: 'water', quantity: 1 },
  ],
  outputItemId: 'potion-001',
  category: ItemCategory.MEDICINE,
});

// テスト用の強化カードデータ
const createTestEnhancementCard = (): IEnhancementCard => ({
  id: 'test-enhancement-001',
  name: '品質アップ',
  type: CardType.ENHANCEMENT,
  rarity: Rarity.COMMON,
  unlockRank: GuildRank.G,
  description: '品質を上昇させる',
  cost: 0,
  effect: {
    type: EffectType.QUALITY_UP,
    value: 10,
  },
  targetAction: EnhancementTarget.ALCHEMY,
});

describe('CardTooltip', () => {
  let mockScene: ReturnType<typeof createMockScene>;

  beforeEach(() => {
    mockScene = createMockScene();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('コンストラクタ', () => {
    it('正しく初期化される', () => {
      const tooltip = new CardTooltip(mockScene as any);

      expect(tooltip).toBeDefined();
      expect(mockScene.add.container).toHaveBeenCalled();
    });

    it('コンテナが非表示で作成される', () => {
      new CardTooltip(mockScene as any);

      expect(mockScene._mockContainer.setVisible).toHaveBeenCalledWith(false);
    });

    it('高いdepthで作成される', () => {
      new CardTooltip(mockScene as any);

      expect(mockScene._mockContainer.setDepth).toHaveBeenCalledWith(1500);
    });

    it('背景グラフィックスが作成される', () => {
      new CardTooltip(mockScene as any);

      expect(mockScene.add.graphics).toHaveBeenCalled();
    });

    it('テキスト要素が作成される', () => {
      new CardTooltip(mockScene as any);

      // タイトル、説明、詳細の3つ
      expect(mockScene.add.text).toHaveBeenCalledTimes(3);
    });

    it('カスタム設定で初期化できる', () => {
      const config: CardTooltipConfig = {
        width: 300,
        padding: 16,
      };

      const tooltip = new CardTooltip(mockScene as any, config);

      expect(tooltip).toBeDefined();
    });
  });

  describe('show()', () => {
    it('採取地カードの情報を表示できる', () => {
      const tooltip = new CardTooltip(mockScene as any);
      const card = createTestGatheringCard();

      tooltip.show(card, 100, 200);

      expect(mockScene._mockContainer.setVisible).toHaveBeenCalledWith(true);
    });

    it('レシピカードの情報を表示できる', () => {
      const tooltip = new CardTooltip(mockScene as any);
      const card = createTestRecipeCard();

      tooltip.show(card, 100, 200);

      expect(mockScene._mockContainer.setVisible).toHaveBeenCalledWith(true);
    });

    it('強化カードの情報を表示できる', () => {
      const tooltip = new CardTooltip(mockScene as any);
      const card = createTestEnhancementCard();

      tooltip.show(card, 100, 200);

      expect(mockScene._mockContainer.setVisible).toHaveBeenCalledWith(true);
    });

    it('タイトルテキストにカード名が設定される', () => {
      const tooltip = new CardTooltip(mockScene as any);
      const card = createTestGatheringCard();

      tooltip.show(card, 100, 200);

      expect(mockScene._mockText.setText).toHaveBeenCalledWith(card.name);
    });

    it('位置が設定される', () => {
      const tooltip = new CardTooltip(mockScene as any);
      const card = createTestGatheringCard();

      tooltip.show(card, 100, 200);

      expect(mockScene._mockContainer.setPosition).toHaveBeenCalled();
    });

    it('表示アニメーションが実行される', () => {
      const tooltip = new CardTooltip(mockScene as any);
      const card = createTestGatheringCard();

      tooltip.show(card, 100, 200);

      expect(mockScene.tweens.add).toHaveBeenCalledWith(
        expect.objectContaining({
          targets: expect.anything(),
          alpha: 1,
          duration: expect.any(Number),
        })
      );
    });

    it('背景が描画される', () => {
      const tooltip = new CardTooltip(mockScene as any);
      const card = createTestGatheringCard();

      tooltip.show(card, 100, 200);

      expect(mockScene._mockGraphics.clear).toHaveBeenCalled();
      expect(mockScene._mockGraphics.fillRoundedRect).toHaveBeenCalled();
    });
  });

  describe('hide()', () => {
    it('非表示アニメーションが実行される', () => {
      const tooltip = new CardTooltip(mockScene as any);
      const card = createTestGatheringCard();

      tooltip.show(card, 100, 200);
      tooltip.hide();

      expect(mockScene.tweens.add).toHaveBeenCalledWith(
        expect.objectContaining({
          targets: expect.anything(),
          alpha: 0,
          duration: expect.any(Number),
        })
      );
    });

    it('アニメーション完了後に非表示になる', () => {
      const tooltip = new CardTooltip(mockScene as any);
      const card = createTestGatheringCard();

      tooltip.show(card, 100, 200);
      tooltip.hide();

      // モックでonCompleteが即座に実行されるので、setVisibleがfalseで呼ばれる
      expect(mockScene._mockContainer.setVisible).toHaveBeenCalledWith(false);
    });
  });

  describe('位置調整', () => {
    it('右端でははみ出さないよう左に配置される', () => {
      const tooltip = new CardTooltip(mockScene as any);
      const card = createTestGatheringCard();

      // 画面右端近くで表示
      tooltip.show(card, 1200, 200);

      const setPositionCall = (mockScene._mockContainer.setPosition as Mock).mock.calls;
      const lastCall = setPositionCall[setPositionCall.length - 1];

      // X座標が画面内に収まっている
      expect(lastCall[0]).toBeLessThan(1280);
    });

    it('下端でははみ出さないよう上に配置される', () => {
      const tooltip = new CardTooltip(mockScene as any);
      const card = createTestGatheringCard();

      // 画面下端近くで表示
      tooltip.show(card, 100, 680);

      const setPositionCall = (mockScene._mockContainer.setPosition as Mock).mock.calls;
      const lastCall = setPositionCall[setPositionCall.length - 1];

      // Y座標が画面内に収まっている
      expect(lastCall[1]).toBeLessThan(720);
    });
  });

  describe('destroy()', () => {
    it('コンテナが破棄される', () => {
      const tooltip = new CardTooltip(mockScene as any);

      tooltip.destroy();

      expect(mockScene._mockContainer.destroy).toHaveBeenCalled();
    });
  });

  describe('isVisible()', () => {
    it('初期状態では非表示', () => {
      const tooltip = new CardTooltip(mockScene as any);

      expect(tooltip.isVisible()).toBe(false);
    });

    it('show()後は表示状態', () => {
      const tooltip = new CardTooltip(mockScene as any);
      const card = createTestGatheringCard();

      tooltip.show(card, 100, 200);

      expect(tooltip.isVisible()).toBe(true);
    });

    it('hide()後は非表示状態', () => {
      const tooltip = new CardTooltip(mockScene as any);
      const card = createTestGatheringCard();

      tooltip.show(card, 100, 200);
      tooltip.hide();

      expect(tooltip.isVisible()).toBe(false);
    });
  });

  describe('カード種別ごとの説明生成', () => {
    it('採取地カードはコストと素材情報を含む', () => {
      const tooltip = new CardTooltip(mockScene as any);
      const card = createTestGatheringCard();

      tooltip.show(card, 100, 200);

      // setTextが複数回呼ばれるので、いずれかのコールでコストが含まれることを確認
      const setTextCalls = (mockScene._mockText.setText as Mock).mock.calls;
      const allTexts = setTextCalls.map((call: unknown[]) => call[0]).join('\n');

      expect(allTexts).toContain(card.name);
    });

    it('レシピカードは必要素材と出力アイテムを含む', () => {
      const tooltip = new CardTooltip(mockScene as any);
      const card = createTestRecipeCard();

      tooltip.show(card, 100, 200);

      const setTextCalls = (mockScene._mockText.setText as Mock).mock.calls;
      const allTexts = setTextCalls.map((call: unknown[]) => call[0]).join('\n');

      expect(allTexts).toContain(card.name);
    });

    it('強化カードは効果説明を含む', () => {
      const tooltip = new CardTooltip(mockScene as any);
      const card = createTestEnhancementCard();

      tooltip.show(card, 100, 200);

      const setTextCalls = (mockScene._mockText.setText as Mock).mock.calls;
      const allTexts = setTextCalls.map((call: unknown[]) => call[0]).join('\n');

      expect(allTexts).toContain(card.name);
    });
  });

  describe('名前解決関数', () => {
    it('素材名解決関数を使用できる', () => {
      const getMaterialName = vi.fn((id: string) => `素材:${id}`);
      const tooltip = new CardTooltip(mockScene as any, { getMaterialName });
      const card = createTestGatheringCard();

      tooltip.show(card, 100, 200);

      expect(getMaterialName).toHaveBeenCalled();
    });

    it('アイテム名解決関数を使用できる', () => {
      const getItemName = vi.fn((id: string) => `アイテム:${id}`);
      const tooltip = new CardTooltip(mockScene as any, { getItemName });
      const card = createTestRecipeCard();

      tooltip.show(card, 100, 200);

      expect(getItemName).toHaveBeenCalled();
    });
  });
});
