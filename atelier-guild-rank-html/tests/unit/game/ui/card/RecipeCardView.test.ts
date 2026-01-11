/**
 * RecipeCardViewテスト
 *
 * レシピカードビューの動作テスト
 */

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';

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
    },
  };
});

import { RecipeCardView, RecipeCardViewOptions } from '../../../../../src/game/ui/card/RecipeCardView';
import { IRecipeCard } from '../../../../../src/domain/card/Card';
import { CardType, GuildRank, Rarity, Quality, ItemCategory } from '../../../../../src/domain/common/types';
import { CardSize } from '../../../../../src/game/ui/card/CardConstants';
import { CardStateStyles } from '../../../../../src/game/ui/card/CardState';

// Phaserモック
const createMockScene = () => {
  const mockContainer = {
    add: vi.fn(),
    setPosition: vi.fn(),
    setScale: vi.fn(),
    setAlpha: vi.fn(),
    setInteractive: vi.fn(),
    disableInteractive: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
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
  };

  return {
    add: {
      container: vi.fn(() => mockContainer),
      graphics: vi.fn(() => mockGraphics),
      text: vi.fn(() => mockText),
    },
    _mockContainer: mockContainer,
    _mockGraphics: mockGraphics,
    _mockText: mockText,
  };
};

// テスト用のレシピカードデータ
const createTestRecipeCard = (overrides?: Partial<IRecipeCard>): IRecipeCard => ({
  id: 'test-recipe-001',
  name: 'テストレシピ',
  type: CardType.RECIPE,
  rarity: Rarity.COMMON,
  unlockRank: GuildRank.G,
  description: 'テスト用のレシピカード',
  cost: 2,
  requiredMaterials: [
    { materialId: 'mat-001', quantity: 2 },
    { materialId: 'mat-002', quantity: 1, minQuality: Quality.C },
  ],
  outputItemId: 'item-001',
  category: ItemCategory.MEDICINE,
  ...overrides,
});

describe('RecipeCardView', () => {
  let mockScene: ReturnType<typeof createMockScene>;

  beforeEach(() => {
    mockScene = createMockScene();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('コンストラクタ', () => {
    it('正しく初期化される', () => {
      const card = createTestRecipeCard();
      const options: RecipeCardViewOptions = {
        x: 100,
        y: 200,
        card,
      };

      const view = new RecipeCardView(mockScene as any, options);

      expect(view).toBeDefined();
      expect(view.card).toBe(card);
      expect(view.container).toBe(mockScene._mockContainer);
    });

    it('コンテナが正しい位置に作成される', () => {
      const card = createTestRecipeCard();
      const options: RecipeCardViewOptions = {
        x: 150,
        y: 250,
        card,
      };

      new RecipeCardView(mockScene as any, options);

      expect(mockScene.add.container).toHaveBeenCalledWith(150, 250);
    });

    it('背景グラフィックスが作成される', () => {
      const card = createTestRecipeCard();
      const options: RecipeCardViewOptions = {
        x: 0,
        y: 0,
        card,
      };

      new RecipeCardView(mockScene as any, options);

      expect(mockScene.add.graphics).toHaveBeenCalled();
    });

    it('テキスト要素が作成される', () => {
      const card = createTestRecipeCard();
      const options: RecipeCardViewOptions = {
        x: 0,
        y: 0,
        card,
      };

      new RecipeCardView(mockScene as any, options);

      // 種別ラベル、コスト、カード名、必要素材ラベル、必要素材リスト、出力アイテムの6つ
      expect(mockScene.add.text).toHaveBeenCalledTimes(6);
    });

    it('デフォルト状態はnormal', () => {
      const card = createTestRecipeCard();
      const options: RecipeCardViewOptions = {
        x: 0,
        y: 0,
        card,
      };

      const view = new RecipeCardView(mockScene as any, options);

      expect(view.getState()).toBe('normal');
    });

    it('指定したサイズで作成できる', () => {
      const card = createTestRecipeCard();
      const options: RecipeCardViewOptions = {
        x: 0,
        y: 0,
        card,
        size: 'LARGE',
      };

      const view = new RecipeCardView(mockScene as any, options);

      expect(view).toBeDefined();
    });

    it('指定した状態で作成できる', () => {
      const card = createTestRecipeCard();
      const options: RecipeCardViewOptions = {
        x: 0,
        y: 0,
        card,
        state: 'disabled',
      };

      const view = new RecipeCardView(mockScene as any, options);

      expect(view.getState()).toBe('disabled');
    });
  });

  describe('状態管理', () => {
    it('getState()で現在の状態を取得できる', () => {
      const card = createTestRecipeCard();
      const view = new RecipeCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
        state: 'selected',
      });

      expect(view.getState()).toBe('selected');
    });

    it('setState()で状態を変更できる', () => {
      const card = createTestRecipeCard();
      const view = new RecipeCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
      });

      view.setState('hover');

      expect(view.getState()).toBe('hover');
    });

    it('状態変更時に表示が更新される', () => {
      const card = createTestRecipeCard();
      const view = new RecipeCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
      });

      // 初期描画でclearが呼ばれている
      const initialClearCount = (mockScene._mockGraphics.clear as Mock).mock.calls.length;

      view.setState('selected');

      // 状態変更で再度clearが呼ばれる
      expect(mockScene._mockGraphics.clear).toHaveBeenCalledTimes(initialClearCount + 1);
    });

    it('同じ状態に変更しても再描画されない', () => {
      const card = createTestRecipeCard();
      const view = new RecipeCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
        state: 'normal',
      });

      const initialClearCount = (mockScene._mockGraphics.clear as Mock).mock.calls.length;

      view.setState('normal');

      // 同じ状態なので再描画されない
      expect(mockScene._mockGraphics.clear).toHaveBeenCalledTimes(initialClearCount);
    });
  });

  describe('表示更新', () => {
    it('setPosition()で位置を変更できる', () => {
      const card = createTestRecipeCard();
      const view = new RecipeCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
      });

      view.setPosition(300, 400);

      expect(mockScene._mockContainer.setPosition).toHaveBeenCalledWith(300, 400);
    });

    it('setScale()でスケールを変更できる', () => {
      const card = createTestRecipeCard();
      const view = new RecipeCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
      });

      view.setScale(1.5);

      expect(mockScene._mockContainer.setScale).toHaveBeenCalledWith(1.5);
    });

    it('setAlpha()で透明度を変更できる', () => {
      const card = createTestRecipeCard();
      const view = new RecipeCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
      });

      view.setAlpha(0.5);

      expect(mockScene._mockContainer.setAlpha).toHaveBeenCalledWith(0.5);
    });
  });

  describe('インタラクション', () => {
    it('デフォルトでインタラクティブが有効', () => {
      const card = createTestRecipeCard();
      new RecipeCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
      });

      expect(mockScene._mockContainer.setInteractive).toHaveBeenCalled();
    });

    it('interactive: falseでインタラクティブが無効', () => {
      const card = createTestRecipeCard();
      new RecipeCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
        interactive: false,
      });

      expect(mockScene._mockContainer.setInteractive).not.toHaveBeenCalled();
    });

    it('setInteractive(false)でインタラクティブを無効化できる', () => {
      const card = createTestRecipeCard();
      const view = new RecipeCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
      });

      view.setInteractive(false);

      expect(mockScene._mockContainer.disableInteractive).toHaveBeenCalled();
    });

    it('setSelected(true)で選択状態になる', () => {
      const card = createTestRecipeCard();
      const view = new RecipeCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
      });

      view.setSelected(true);

      expect(view.getState()).toBe('selected');
    });

    it('setSelected(false)で通常状態に戻る', () => {
      const card = createTestRecipeCard();
      const view = new RecipeCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
        state: 'selected',
      });

      view.setSelected(false);

      expect(view.getState()).toBe('normal');
    });

    it('イベントハンドラが登録される', () => {
      const card = createTestRecipeCard();
      new RecipeCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
      });

      expect(mockScene._mockContainer.on).toHaveBeenCalledWith('pointerover', expect.any(Function), expect.anything());
      expect(mockScene._mockContainer.on).toHaveBeenCalledWith('pointerout', expect.any(Function), expect.anything());
      expect(mockScene._mockContainer.on).toHaveBeenCalledWith('pointerdown', expect.any(Function), expect.anything());
    });
  });

  describe('破棄', () => {
    it('destroy()でコンテナが破棄される', () => {
      const card = createTestRecipeCard();
      const view = new RecipeCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
      });

      view.destroy();

      expect(mockScene._mockContainer.destroy).toHaveBeenCalled();
    });

    it('destroy()でイベントハンドラが解除される', () => {
      const card = createTestRecipeCard();
      const view = new RecipeCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
      });

      view.destroy();

      expect(mockScene._mockContainer.off).toHaveBeenCalledWith('pointerover', expect.any(Function), expect.anything());
      expect(mockScene._mockContainer.off).toHaveBeenCalledWith('pointerout', expect.any(Function), expect.anything());
      expect(mockScene._mockContainer.off).toHaveBeenCalledWith('pointerdown', expect.any(Function), expect.anything());
    });
  });

  describe('必要素材表示', () => {
    it('必要素材が表示される', () => {
      const card = createTestRecipeCard({
        requiredMaterials: [
          { materialId: 'herb', quantity: 3 },
        ],
      });

      new RecipeCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
      });

      // テキスト作成時に素材情報が含まれる
      const textCalls = (mockScene.add.text as Mock).mock.calls;
      const materialsTextCall = textCalls.find((call: unknown[]) =>
        typeof call[2] === 'string' && call[2].includes('herb')
      );
      expect(materialsTextCall).toBeDefined();
    });

    it('素材名解決関数が使用される', () => {
      const card = createTestRecipeCard({
        requiredMaterials: [
          { materialId: 'herb', quantity: 3 },
        ],
      });

      const getMaterialName = vi.fn((id: string) => id === 'herb' ? '薬草' : id);

      new RecipeCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
        getMaterialName,
      });

      expect(getMaterialName).toHaveBeenCalledWith('herb');
    });

    it('素材が3つを超える場合は省略される', () => {
      const card = createTestRecipeCard({
        requiredMaterials: [
          { materialId: 'mat-1', quantity: 1 },
          { materialId: 'mat-2', quantity: 1 },
          { materialId: 'mat-3', quantity: 1 },
          { materialId: 'mat-4', quantity: 1 },
          { materialId: 'mat-5', quantity: 1 },
        ],
      });

      new RecipeCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
      });

      // テキスト作成時に「...」が含まれる
      const textCalls = (mockScene.add.text as Mock).mock.calls;
      const materialsTextCall = textCalls.find((call: unknown[]) =>
        typeof call[2] === 'string' && call[2].includes('...')
      );
      expect(materialsTextCall).toBeDefined();
    });

    it('最低品質が表示される', () => {
      const card = createTestRecipeCard({
        requiredMaterials: [
          { materialId: 'herb', quantity: 1, minQuality: Quality.B },
        ],
      });

      new RecipeCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
      });

      // テキスト作成時に品質情報が含まれる
      const textCalls = (mockScene.add.text as Mock).mock.calls;
      const materialsTextCall = textCalls.find((call: unknown[]) =>
        typeof call[2] === 'string' && call[2].includes('以上')
      );
      expect(materialsTextCall).toBeDefined();
    });
  });

  describe('出力アイテム表示', () => {
    it('アイテム名解決関数が使用される', () => {
      const card = createTestRecipeCard({
        outputItemId: 'potion',
      });

      const getItemName = vi.fn((id: string) => id === 'potion' ? '回復薬' : id);

      new RecipeCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
        getItemName,
      });

      expect(getItemName).toHaveBeenCalledWith('potion');
    });

    it('カテゴリが表示される', () => {
      const card = createTestRecipeCard({
        category: ItemCategory.MEDICINE,
      });

      new RecipeCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
      });

      // テキスト作成時にカテゴリ情報が含まれる
      const textCalls = (mockScene.add.text as Mock).mock.calls;
      const categoryTextCall = textCalls.find((call: unknown[]) =>
        typeof call[2] === 'string' && call[2].includes('カテゴリ')
      );
      expect(categoryTextCall).toBeDefined();
    });
  });

  describe('カードサイズ', () => {
    it('STANDARDサイズで正しく描画される', () => {
      const card = createTestRecipeCard();
      new RecipeCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
        size: 'STANDARD',
      });

      const { width, height } = CardSize.STANDARD;
      expect(mockScene._mockGraphics.fillRoundedRect).toHaveBeenCalledWith(
        -width / 2,
        -height / 2,
        width,
        height,
        expect.any(Number)
      );
    });

    it('SMALLサイズで正しく描画される', () => {
      const card = createTestRecipeCard();
      new RecipeCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
        size: 'SMALL',
      });

      const { width, height } = CardSize.SMALL;
      expect(mockScene._mockGraphics.fillRoundedRect).toHaveBeenCalledWith(
        -width / 2,
        -height / 2,
        width,
        height,
        expect.any(Number)
      );
    });

    it('LARGEサイズで正しく描画される', () => {
      const card = createTestRecipeCard();
      new RecipeCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
        size: 'LARGE',
      });

      const { width, height } = CardSize.LARGE;
      expect(mockScene._mockGraphics.fillRoundedRect).toHaveBeenCalledWith(
        -width / 2,
        -height / 2,
        width,
        height,
        expect.any(Number)
      );
    });
  });
});
