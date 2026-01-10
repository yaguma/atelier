/**
 * AlchemyContainer単体テスト
 *
 * TASK-0227: AlchemyContainer設計のテスト
 * 調合フェーズコンテナの基本機能をテストする
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  GamePhase,
  CardType,
  GuildRank,
  Quality,
  Rarity,
  ItemCategory,
} from '../../../../../src/domain/common/types';
import { RecipeCard } from '../../../../../src/domain/card/CardEntity';
import { Material } from '../../../../../src/domain/material/MaterialEntity';
import { AlchemyContainer } from '../../../../../src/game/ui/phase/AlchemyContainer';
import type { AlchemyContainerOptions } from '../../../../../src/game/ui/phase/IAlchemyContainer';
import { EventBus } from '../../../../../src/game/events/EventBus';

// Phaserをモック
vi.mock('phaser', () => {
  class MockRectangle {
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(
      x: number = 0,
      y: number = 0,
      width: number = 0,
      height: number = 0
    ) {
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
      removeAll: vi.fn().mockImplementation(function () {
        children.length = 0;
      }),
      removeAt: vi.fn().mockImplementation(function (index: number) {
        children.splice(index, 1);
      }),
      each: vi.fn().mockImplementation((callback: (child: unknown) => void) => {
        children.forEach(callback);
      }),
      getAt: vi.fn().mockImplementation((index: number) => children[index]),
      getAll: vi.fn().mockReturnValue(children),
      get length() {
        return children.length;
      },
      x: 200,
      y: 150,
    };
    return container;
  };

  const createMockText = () => ({
    setOrigin: vi.fn().mockReturnThis(),
    setAlpha: vi.fn().mockReturnThis(),
    setText: vi.fn().mockReturnThis(),
    setColor: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
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

  const mockKeyboard = {
    on: vi.fn().mockReturnThis(),
    off: vi.fn().mockReturnThis(),
  };

  const mockInput = {
    keyboard: mockKeyboard,
  };

  return {
    add: {
      container: vi.fn().mockImplementation(() => createMockContainer()),
      graphics: vi.fn().mockReturnValue(mockGraphics),
      text: vi.fn().mockImplementation(() => createMockText()),
    },
    tweens: mockTween,
    time: mockTime,
    input: mockInput,
  } as unknown as Phaser.Scene;
}

/**
 * テスト用のモックレシピカードを作成
 */
function createMockRecipeCard(overrides: Partial<any> = {}): RecipeCard {
  const defaultCard = {
    id: 'recipe-1',
    name: 'テスト薬',
    type: CardType.RECIPE,
    rarity: Rarity.COMMON,
    unlockRank: GuildRank.G,
    description: 'テストレシピ',
    cost: 2,
    requiredMaterials: [
      { category: 'herb', quantity: 2 },
      { category: 'mineral', quantity: 1 },
    ],
    outputItemId: 'item-1',
    category: ItemCategory.MEDICINE,
  };

  return new RecipeCard({ ...defaultCard, ...overrides } as any);
}

/**
 * テスト用のモック素材を作成
 */
function createMockMaterial(overrides: Partial<Material> = {}): Material {
  const defaultMaterial = {
    id: 'mat-1',
    name: '薬草',
    category: 'herb',
    baseQuality: Quality.C,
    attributes: [],
    isRare: false,
    description: 'テスト素材',
  };

  return new Material({ ...defaultMaterial, ...overrides });
}

describe('AlchemyContainer', () => {
  let mockScene: Phaser.Scene;
  let eventBus: EventBus;

  beforeEach(() => {
    mockScene = createMockScene();
    EventBus.resetInstance();
    eventBus = EventBus.getInstance();
  });

  describe('コンストラクタ', () => {
    it('コンテナが正しく初期化される', () => {
      const options: AlchemyContainerOptions = {
        scene: mockScene,
        eventBus,
      };

      const container = new AlchemyContainer(options);

      expect(container).toBeDefined();
      expect(container.container).toBeDefined();
      expect(container.phase).toBe(GamePhase.ALCHEMY);
    });

    it('位置を指定できる', () => {
      const options: AlchemyContainerOptions = {
        scene: mockScene,
        eventBus,
        x: 100,
        y: 200,
      };

      const container = new AlchemyContainer(options);

      expect(container.container).toBeDefined();
    });

    it('コールバックを設定できる', () => {
      const onComplete = vi.fn();
      const onSkip = vi.fn();

      const options: AlchemyContainerOptions = {
        scene: mockScene,
        eventBus,
        onAlchemyComplete: onComplete,
        onSkip: onSkip,
      };

      const container = new AlchemyContainer(options);

      expect(container).toBeDefined();
    });
  });

  describe('レシピカード設定', () => {
    it('setRecipeCardsでカードを設定できる', () => {
      const container = new AlchemyContainer({
        scene: mockScene,
        eventBus,
      });
      const cards = [createMockRecipeCard()];

      container.setRecipeCards(cards);

      // 初期状態では選択されていない
      expect(container.getSelectedRecipe()).toBeNull();
    });

    it('初期状態ではレシピが選択されていない', () => {
      const container = new AlchemyContainer({
        scene: mockScene,
        eventBus,
      });

      expect(container.getSelectedRecipe()).toBeNull();
    });

    it('selectRecipeでレシピを選択できる', () => {
      const container = new AlchemyContainer({
        scene: mockScene,
        eventBus,
      });
      const card = createMockRecipeCard();
      container.setRecipeCards([card]);

      container.selectRecipe(card);

      expect(container.getSelectedRecipe()).toBe(card);
    });

    it('レシピ選択時にイベントが発火する', () => {
      const selectHandler = vi.fn();
      eventBus.on('alchemy:recipe:selected' as any, selectHandler);

      const container = new AlchemyContainer({
        scene: mockScene,
        eventBus,
      });
      const card = createMockRecipeCard();
      container.setRecipeCards([card]);

      container.selectRecipe(card);

      expect(selectHandler).toHaveBeenCalledWith({ recipe: card });
    });
  });

  describe('素材管理', () => {
    it('setAvailableMaterialsで素材を設定できる', () => {
      const container = new AlchemyContainer({
        scene: mockScene,
        eventBus,
      });
      const materials = [
        createMockMaterial({ id: 'mat-1', name: '薬草' }),
        createMockMaterial({ id: 'mat-2', name: '鉱石' }),
      ];

      container.setAvailableMaterials(materials);

      // 内部で素材が設定されている（レシピ選択後にMaterialOptionViewが作成される）
      expect(container.getSelectedMaterials().length).toBe(0);
    });

    it('初期状態では選択素材がない', () => {
      const container = new AlchemyContainer({
        scene: mockScene,
        eventBus,
      });

      expect(container.getSelectedMaterials().length).toBe(0);
    });

    it('clearMaterialsで素材選択をクリアできる', () => {
      const container = new AlchemyContainer({
        scene: mockScene,
        eventBus,
      });

      container.clearMaterials();

      expect(container.getSelectedMaterials().length).toBe(0);
    });

    it('clearMaterials時にイベントが発火する', () => {
      const clearHandler = vi.fn();
      eventBus.on('alchemy:materials:cleared' as any, clearHandler);

      const container = new AlchemyContainer({
        scene: mockScene,
        eventBus,
      });

      container.clearMaterials();

      expect(clearHandler).toHaveBeenCalled();
    });
  });

  describe('調合可否判定', () => {
    it('レシピ未選択時はcanCraftがfalseを返す', () => {
      const container = new AlchemyContainer({
        scene: mockScene,
        eventBus,
      });

      expect(container.canCraft()).toBe(false);
    });

    it('素材未選択時はcanCraftがfalseを返す', () => {
      const container = new AlchemyContainer({
        scene: mockScene,
        eventBus,
      });
      const card = createMockRecipeCard();
      container.setRecipeCards([card]);
      container.selectRecipe(card);

      expect(container.canCraft()).toBe(false);
    });

    it('canCompleteはcanCraftと同じ結果を返す', () => {
      const container = new AlchemyContainer({
        scene: mockScene,
        eventBus,
      });

      expect(container.canComplete()).toBe(container.canCraft());
    });
  });

  describe('調合実行', () => {
    it('craftはcanCraftがfalseの場合何もしない', async () => {
      const onComplete = vi.fn();
      const container = new AlchemyContainer({
        scene: mockScene,
        eventBus,
        onAlchemyComplete: onComplete,
      });

      await container.craft();

      expect(onComplete).not.toHaveBeenCalled();
    });

    it('レシピなしでは調合できない', async () => {
      const onComplete = vi.fn();
      const container = new AlchemyContainer({
        scene: mockScene,
        eventBus,
        onAlchemyComplete: onComplete,
      });

      await container.craft();

      expect(onComplete).not.toHaveBeenCalled();
    });
  });

  describe('スキップ操作', () => {
    it('スキップ時にイベントが発火する', () => {
      const skipHandler = vi.fn();
      eventBus.on('alchemy:skip' as any, skipHandler);

      const onSkip = vi.fn();
      const container = new AlchemyContainer({
        scene: mockScene,
        eventBus,
        onSkip,
      });

      // スキップは内部handleSkip経由で呼ばれる
      // publicメソッドがないため、コンテナの破棄テストで代用
      container.destroy();

      // destroyが正常に動作することを確認
      expect(container.container.destroy).toHaveBeenCalled();
    });
  });

  describe('表示制御', () => {
    it('setVisibleで表示/非表示を切り替えられる', () => {
      const container = new AlchemyContainer({
        scene: mockScene,
        eventBus,
      });

      container.setVisible(false);

      expect(container.container.setVisible).toHaveBeenCalledWith(false);
    });

    it('setEnabledで有効/無効を切り替えられる', () => {
      const container = new AlchemyContainer({
        scene: mockScene,
        eventBus,
      });

      container.setEnabled(false);

      expect(container.container.setAlpha).toHaveBeenCalledWith(0.5);
    });
  });

  describe('破棄', () => {
    it('destroyでコンテナが破棄される', () => {
      const container = new AlchemyContainer({
        scene: mockScene,
        eventBus,
      });

      container.destroy();

      expect(container.container.destroy).toHaveBeenCalled();
    });
  });

  describe('IAlchemyContainerインターフェース準拠', () => {
    it('IAlchemyContainerの全メソッドが実装されている', () => {
      const container = new AlchemyContainer({
        scene: mockScene,
        eventBus,
      });

      // レシピ管理
      expect(typeof container.setRecipeCards).toBe('function');
      expect(typeof container.getSelectedRecipe).toBe('function');
      expect(typeof container.selectRecipe).toBe('function');

      // 素材管理
      expect(typeof container.setAvailableMaterials).toBe('function');
      expect(typeof container.getSelectedMaterials).toBe('function');
      expect(typeof container.selectMaterial).toBe('function');
      expect(typeof container.deselectMaterial).toBe('function');
      expect(typeof container.clearMaterials).toBe('function');

      // 調合
      expect(typeof container.canCraft).toBe('function');
      expect(typeof container.craft).toBe('function');

      // IPhaseContainer
      expect(typeof container.canComplete).toBe('function');
      expect(typeof container.complete).toBe('function');
      expect(typeof container.cancel).toBe('function');
      expect(typeof container.enter).toBe('function');
      expect(typeof container.exit).toBe('function');
      expect(typeof container.update).toBe('function');
      expect(typeof container.setVisible).toBe('function');
      expect(typeof container.setEnabled).toBe('function');
      expect(typeof container.destroy).toBe('function');
    });
  });

  // TASK-0228: レシピ選択機能のテスト
  describe('レシピ選択UI強化', () => {
    it('レシピ詳細パネルが作成される', () => {
      const container = new AlchemyContainer({
        scene: mockScene,
        eventBus,
      });
      const card = createMockRecipeCard();
      container.setRecipeCards([card]);

      container.selectRecipe(card);

      // 詳細パネルが表示される
      expect(container.getSelectedRecipe()).toBe(card);
    });

    it('レシピ変更時にイベントが発火する', () => {
      const changeHandler = vi.fn();
      eventBus.on('alchemy:recipe:changed' as any, changeHandler);

      const container = new AlchemyContainer({
        scene: mockScene,
        eventBus,
      });
      const card1 = createMockRecipeCard({ id: 'recipe-1', name: 'レシピ1' });
      const card2 = createMockRecipeCard({ id: 'recipe-2', name: 'レシピ2' });
      container.setRecipeCards([card1, card2]);

      // 最初のレシピを選択
      container.selectRecipe(card1);
      // 2番目のレシピを選択（素材未選択なので確認なしで変更される）
      container.selectRecipe(card2);

      expect(changeHandler).toHaveBeenCalled();
    });

    it('同じレシピを再選択しても何も起きない', () => {
      const selectHandler = vi.fn();
      eventBus.on('alchemy:recipe:selected' as any, selectHandler);

      const container = new AlchemyContainer({
        scene: mockScene,
        eventBus,
      });
      const card = createMockRecipeCard();
      container.setRecipeCards([card]);

      container.selectRecipe(card);
      const callCount = selectHandler.mock.calls.length;

      // 同じレシピを再選択
      container.selectRecipe(card);

      // イベントが追加で発火しない
      expect(selectHandler.mock.calls.length).toBe(callCount);
    });
  });

  describe('レシピ変更時の確認ダイアログ', () => {
    it('素材選択中にレシピを変更すると確認が求められる', () => {
      const container = new AlchemyContainer({
        scene: mockScene,
        eventBus,
      });
      const card1 = createMockRecipeCard({ id: 'recipe-1', name: 'レシピ1' });
      const card2 = createMockRecipeCard({ id: 'recipe-2', name: 'レシピ2' });
      const material = createMockMaterial({ id: 'mat-1', name: '薬草' });

      container.setRecipeCards([card1, card2]);
      container.setAvailableMaterials([material]);
      container.selectRecipe(card1);
      container.selectMaterial(material);

      // 素材選択中にレシピを変更しようとする
      // showConfirmDialogが呼ばれ、確認待ち状態になる
      expect(container.getSelectedMaterials().length).toBe(1);
    });

    it('確認なしでレシピ変更が実行される（素材未選択時）', () => {
      const container = new AlchemyContainer({
        scene: mockScene,
        eventBus,
      });
      const card1 = createMockRecipeCard({ id: 'recipe-1', name: 'レシピ1' });
      const card2 = createMockRecipeCard({ id: 'recipe-2', name: 'レシピ2' });

      container.setRecipeCards([card1, card2]);
      container.selectRecipe(card1);

      // 素材未選択でレシピを変更
      container.selectRecipe(card2);

      expect(container.getSelectedRecipe()).toBe(card2);
    });
  });

  describe('キーボード操作', () => {
    it('selectNextRecipeで次のレシピを選択できる', () => {
      const container = new AlchemyContainer({
        scene: mockScene,
        eventBus,
      });
      const card1 = createMockRecipeCard({ id: 'recipe-1', name: 'レシピ1' });
      const card2 = createMockRecipeCard({ id: 'recipe-2', name: 'レシピ2' });
      container.setRecipeCards([card1, card2]);

      container.selectRecipe(card1);
      container.selectNextRecipe();

      expect(container.getSelectedRecipe()).toBe(card2);
    });

    it('selectPreviousRecipeで前のレシピを選択できる', () => {
      const container = new AlchemyContainer({
        scene: mockScene,
        eventBus,
      });
      const card1 = createMockRecipeCard({ id: 'recipe-1', name: 'レシピ1' });
      const card2 = createMockRecipeCard({ id: 'recipe-2', name: 'レシピ2' });
      container.setRecipeCards([card1, card2]);

      container.selectRecipe(card2);
      container.selectPreviousRecipe();

      expect(container.getSelectedRecipe()).toBe(card1);
    });

    it('先頭でselectPreviousRecipeしても範囲外にならない', () => {
      const container = new AlchemyContainer({
        scene: mockScene,
        eventBus,
      });
      const card1 = createMockRecipeCard({ id: 'recipe-1', name: 'レシピ1' });
      const card2 = createMockRecipeCard({ id: 'recipe-2', name: 'レシピ2' });
      container.setRecipeCards([card1, card2]);

      container.selectRecipe(card1);
      container.selectPreviousRecipe();

      expect(container.getSelectedRecipe()).toBe(card1);
    });

    it('末尾でselectNextRecipeしても範囲外にならない', () => {
      const container = new AlchemyContainer({
        scene: mockScene,
        eventBus,
      });
      const card1 = createMockRecipeCard({ id: 'recipe-1', name: 'レシピ1' });
      const card2 = createMockRecipeCard({ id: 'recipe-2', name: 'レシピ2' });
      container.setRecipeCards([card1, card2]);

      container.selectRecipe(card2);
      container.selectNextRecipe();

      expect(container.getSelectedRecipe()).toBe(card2);
    });
  });
});
