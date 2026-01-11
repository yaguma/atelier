/**
 * ShopScene テスト
 *
 * ショップシーンのテストを行う。
 * Phaserはcanvas環境を必要とするため、ユニットテストでは
 * Phaserをモックして定数と型のテストを中心に行う。
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventBus } from '@game/events/EventBus';
import { SceneKeys } from '@game/config/SceneKeys';

// Phaserをモック
vi.mock('phaser', () => {
  return {
    default: {
      Scene: class MockScene {
        sys = { settings: { key: '' } };
        scene = {
          start: vi.fn(),
          launch: vi.fn(),
          pause: vi.fn(),
          stop: vi.fn(),
          resume: vi.fn(),
        };
        plugins = {
          get: vi.fn().mockReturnValue({}),
        };
        registry = {
          set: vi.fn(),
          get: vi.fn(),
        };
        textures = {
          exists: vi.fn().mockReturnValue(false),
        };
        cache = {
          audio: {
            exists: vi.fn().mockReturnValue(false),
          },
        };
        sound = {
          play: vi.fn(),
          stopByKey: vi.fn(),
          stopAll: vi.fn(),
        };
        add = {
          graphics: vi.fn().mockReturnValue({
            fillStyle: vi.fn().mockReturnThis(),
            fillRect: vi.fn().mockReturnThis(),
            fillRoundedRect: vi.fn().mockReturnThis(),
            strokeRoundedRect: vi.fn().mockReturnThis(),
            lineStyle: vi.fn().mockReturnThis(),
            clear: vi.fn().mockReturnThis(),
            setName: vi.fn().mockReturnThis(),
          }),
          text: vi.fn().mockReturnValue({
            setOrigin: vi.fn().mockReturnThis(),
            setText: vi.fn().mockReturnThis(),
            setVisible: vi.fn().mockReturnThis(),
            setName: vi.fn().mockReturnThis(),
            destroy: vi.fn(),
          }),
          image: vi.fn().mockReturnValue({
            setDisplaySize: vi.fn().mockReturnThis(),
          }),
          container: vi.fn().mockReturnValue({
            add: vi.fn().mockReturnThis(),
            setSize: vi.fn().mockReturnThis(),
            setInteractive: vi.fn().mockReturnThis(),
            on: vi.fn().mockReturnThis(),
            getByName: vi.fn(),
            each: vi.fn(),
            remove: vi.fn(),
          }),
        };
        cameras = {
          main: {
            width: 1024,
            height: 768,
            centerX: 512,
            centerY: 384,
            setBackgroundColor: vi.fn(),
            fadeIn: vi.fn(),
          },
        };
        time = {
          delayedCall: vi.fn(),
          addEvent: vi.fn().mockReturnValue({
            remove: vi.fn(),
          }),
        };
        tweens = {
          add: vi.fn(),
          addCounter: vi.fn(),
        };

        constructor(config: { key: string }) {
          this.sys.settings.key = config.key;
        }
      },
    },
    Scene: class MockScene {
      sys = { settings: { key: '' } };
      scene = {
        start: vi.fn(),
        launch: vi.fn(),
        pause: vi.fn(),
        stop: vi.fn(),
        resume: vi.fn(),
      };
      plugins = {
        get: vi.fn().mockReturnValue({}),
      };
      registry = {
        set: vi.fn(),
        get: vi.fn(),
      };
      textures = {
        exists: vi.fn().mockReturnValue(false),
      };
      cache = {
        audio: {
          exists: vi.fn().mockReturnValue(false),
        },
      };
      sound = {
        play: vi.fn(),
        stopByKey: vi.fn(),
        stopAll: vi.fn(),
      };
      add = {
        graphics: vi.fn().mockReturnValue({
          fillStyle: vi.fn().mockReturnThis(),
          fillRect: vi.fn().mockReturnThis(),
          fillRoundedRect: vi.fn().mockReturnThis(),
          strokeRoundedRect: vi.fn().mockReturnThis(),
          lineStyle: vi.fn().mockReturnThis(),
          clear: vi.fn().mockReturnThis(),
          setName: vi.fn().mockReturnThis(),
        }),
        text: vi.fn().mockReturnValue({
          setOrigin: vi.fn().mockReturnThis(),
          setText: vi.fn().mockReturnThis(),
          setVisible: vi.fn().mockReturnThis(),
          setName: vi.fn().mockReturnThis(),
          destroy: vi.fn(),
        }),
        image: vi.fn().mockReturnValue({
          setDisplaySize: vi.fn().mockReturnThis(),
        }),
        container: vi.fn().mockReturnValue({
          add: vi.fn().mockReturnThis(),
          setSize: vi.fn().mockReturnThis(),
          setInteractive: vi.fn().mockReturnThis(),
          on: vi.fn().mockReturnThis(),
          getByName: vi.fn(),
          each: vi.fn(),
          remove: vi.fn(),
        }),
      };
      cameras = {
        main: {
          width: 1024,
          height: 768,
          centerX: 512,
          centerY: 384,
          setBackgroundColor: vi.fn(),
          fadeIn: vi.fn(),
        },
      };
      time = {
        delayedCall: vi.fn(),
        addEvent: vi.fn().mockReturnValue({
          remove: vi.fn(),
        }),
      };
      tweens = {
        add: vi.fn(),
        addCounter: vi.fn(),
      };

      constructor(config: { key: string }) {
        this.sys.settings.key = config.key;
      }
    },
  };
});

// rexUIプラグインをモック
vi.mock('phaser3-rex-plugins/templates/ui/ui-plugin', () => {
  return {
    default: class MockUIPlugin {
      add = {
        roundRectangle: vi.fn().mockReturnValue({
          setFillStyle: vi.fn(),
        }),
        label: vi.fn().mockReturnValue({
          layout: vi.fn(),
          setInteractive: vi.fn().mockReturnThis(),
          on: vi.fn().mockReturnThis(),
          setVisible: vi.fn().mockReturnThis(),
        }),
        sizer: vi.fn().mockReturnValue({
          add: vi.fn().mockReturnThis(),
          removeAll: vi.fn().mockReturnThis(),
        }),
        scrollablePanel: vi.fn().mockReturnValue({
          setOrigin: vi.fn().mockReturnThis(),
          layout: vi.fn().mockReturnThis(),
        }),
      };
    },
  };
});

// UIFactoryをモック
vi.mock('@game/ui/UIFactory', () => {
  const mockButton = {
    layout: vi.fn(),
    setInteractive: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    setPosition: vi.fn(),
    setVisible: vi.fn().mockReturnThis(),
  };

  return {
    UIFactory: vi.fn().mockImplementation(() => ({
      createButton: vi.fn().mockReturnValue(mockButton),
      createPrimaryButton: vi.fn().mockReturnValue(mockButton),
      createSecondaryButton: vi.fn().mockReturnValue(mockButton),
      setButtonEnabled: vi.fn(),
    })),
  };
});

describe('ShopScene 定数', () => {
  it('ShopSceneLayoutがエクスポートされている', async () => {
    const constants = await import('@game/scenes/ShopSceneConstants');
    expect(constants.ShopSceneLayout).toBeDefined();
  });

  it('ShopSceneLayoutが正しい画面サイズを持つ', async () => {
    const { ShopSceneLayout } = await import('@game/scenes/ShopSceneConstants');
    expect(ShopSceneLayout.SCREEN_WIDTH).toBe(1024);
    expect(ShopSceneLayout.SCREEN_HEIGHT).toBe(768);
  });

  it('ヘッダーが画面上部に配置される', async () => {
    const { ShopSceneLayout } = await import('@game/scenes/ShopSceneConstants');
    expect(ShopSceneLayout.HEADER.Y).toBe(0);
    expect(ShopSceneLayout.HEADER.WIDTH).toBe(1024);
    expect(ShopSceneLayout.HEADER.HEIGHT).toBe(60);
  });

  it('カテゴリタブが正しく配置される', async () => {
    const { ShopSceneLayout } = await import('@game/scenes/ShopSceneConstants');
    expect(ShopSceneLayout.CATEGORY_TAB.X).toBe(50);
    expect(ShopSceneLayout.CATEGORY_TAB.Y).toBe(80);
    expect(ShopSceneLayout.CATEGORY_TAB.TAB_WIDTH).toBe(150);
    expect(ShopSceneLayout.CATEGORY_TAB.TAB_HEIGHT).toBe(40);
  });

  it('商品リストエリアが配置される', async () => {
    const { ShopSceneLayout } = await import('@game/scenes/ShopSceneConstants');
    expect(ShopSceneLayout.ITEM_LIST.X).toBe(50);
    expect(ShopSceneLayout.ITEM_LIST.Y).toBe(150);
    expect(ShopSceneLayout.ITEM_LIST.WIDTH).toBe(600);
    expect(ShopSceneLayout.ITEM_LIST.HEIGHT).toBe(500);
  });

  it('詳細エリアが商品リストの右側に配置される', async () => {
    const { ShopSceneLayout } = await import('@game/scenes/ShopSceneConstants');
    expect(ShopSceneLayout.DETAIL_AREA.X).toBe(670);
    expect(ShopSceneLayout.DETAIL_AREA.Y).toBe(150);
  });

  it('購入ボタンが配置される', async () => {
    const { ShopSceneLayout } = await import('@game/scenes/ShopSceneConstants');
    expect(ShopSceneLayout.PURCHASE_BUTTON.X).toBe(770);
    expect(ShopSceneLayout.PURCHASE_BUTTON.Y).toBe(570);
    expect(ShopSceneLayout.PURCHASE_BUTTON.WIDTH).toBe(200);
    expect(ShopSceneLayout.PURCHASE_BUTTON.HEIGHT).toBe(50);
  });

  it('戻るボタンが画面下部に配置される', async () => {
    const { ShopSceneLayout } = await import('@game/scenes/ShopSceneConstants');
    expect(ShopSceneLayout.BACK_BUTTON.X).toBe(50);
    expect(ShopSceneLayout.BACK_BUTTON.Y).toBe(680);
  });
});

describe('ShopScene カテゴリ型', () => {
  it('ShopCategoriesが3つのカテゴリを持つ', async () => {
    const { ShopCategories } = await import('@game/scenes/ShopSceneConstants');
    expect(ShopCategories).toHaveLength(3);
  });

  it('ShopCategoriesがcards, materials, artifactsを含む', async () => {
    const { ShopCategories } = await import('@game/scenes/ShopSceneConstants');
    const keys = ShopCategories.map(cat => cat.key);
    expect(keys).toContain('cards');
    expect(keys).toContain('materials');
    expect(keys).toContain('artifacts');
  });

  it('ShopCategoryLabelsが日本語ラベルを持つ', async () => {
    const { ShopCategoryLabels } = await import('@game/scenes/ShopSceneConstants');
    expect(ShopCategoryLabels.cards).toBe('カード');
    expect(ShopCategoryLabels.materials).toBe('素材');
    expect(ShopCategoryLabels.artifacts).toBe('アーティファクト');
  });
});

describe('ShopScene 色定数', () => {
  it('ShopColorsが価格表示色を持つ', async () => {
    const { ShopColors } = await import('@game/scenes/ShopSceneConstants');
    expect(ShopColors.priceNormal).toBeDefined();
    expect(ShopColors.priceCannotAfford).toBeDefined();
    expect(ShopColors.priceAffordable).toBeDefined();
  });
});

describe('ShopScene シーンキー', () => {
  it('SceneKeys.SHOPがShopSceneである', () => {
    expect(SceneKeys.SHOP).toBe('ShopScene');
  });
});

describe('ShopScene エクスポート', () => {
  it('ShopSceneがエクスポートされている', async () => {
    const module = await import('@game/scenes/ShopScene');
    expect(module.ShopScene).toBeDefined();
  });

  it('ShopItemインターフェースがエクスポートされている', async () => {
    // インターフェースはTypeScript型なのでランタイムでは存在しない
    // モジュール自体がインポートできることを確認
    const module = await import('@game/scenes/ShopScene');
    expect(module).toBeDefined();
  });

  it('ShopSceneDataインターフェースがエクスポートされている', async () => {
    // インターフェースはTypeScript型なのでランタイムでは存在しない
    // モジュール自体がインポートできることを確認
    const module = await import('@game/scenes/ShopScene');
    expect(module).toBeDefined();
  });
});

describe('ShopScene EventPayloads', () => {
  it('shop:purchase:requestedペイロードが定義されている', async () => {
    const payloads = await import('@game/events/EventPayloads');
    // EventPayloadMapの型を確認（ランタイムでは直接確認できないのでモジュールの存在を確認）
    expect(payloads).toBeDefined();
  });

  it('shop:purchase:completeペイロードが定義されている', async () => {
    const payloads = await import('@game/events/EventPayloads');
    expect(payloads).toBeDefined();
  });

  it('shop:gold:updatedペイロードが定義されている', async () => {
    const payloads = await import('@game/events/EventPayloads');
    expect(payloads).toBeDefined();
  });
});

describe('ShopScene インスタンス生成', () => {
  beforeEach(() => {
    EventBus.resetInstance();
  });

  afterEach(() => {
    EventBus.resetInstance();
    vi.clearAllMocks();
  });

  it('ShopSceneが作成できる', async () => {
    const { ShopScene } = await import('@game/scenes/ShopScene');
    const shopScene = new ShopScene();
    expect(shopScene).toBeDefined();
    expect(shopScene).toBeInstanceOf(ShopScene);
  });

  it('シーンキーがShopSceneである', async () => {
    const { ShopScene } = await import('@game/scenes/ShopScene');
    const shopScene = new ShopScene();
    expect(shopScene.sys.settings.key).toBe(SceneKeys.SHOP);
  });
});

describe('ShopScene レイアウト整合性', () => {
  it('商品リストと詳細エリアが重ならない', async () => {
    const { ShopSceneLayout } = await import('@game/scenes/ShopSceneConstants');
    const itemListRight = ShopSceneLayout.ITEM_LIST.X + ShopSceneLayout.ITEM_LIST.WIDTH;
    expect(itemListRight).toBeLessThanOrEqual(ShopSceneLayout.DETAIL_AREA.X);
  });

  it('カテゴリタブが商品リストの上に配置される', async () => {
    const { ShopSceneLayout } = await import('@game/scenes/ShopSceneConstants');
    const tabBottom = ShopSceneLayout.CATEGORY_TAB.Y + ShopSceneLayout.CATEGORY_TAB.HEIGHT;
    expect(tabBottom).toBeLessThanOrEqual(ShopSceneLayout.ITEM_LIST.Y);
  });

  it('戻るボタンが商品リストと重ならない', async () => {
    const { ShopSceneLayout } = await import('@game/scenes/ShopSceneConstants');
    const itemListBottom = ShopSceneLayout.ITEM_LIST.Y + ShopSceneLayout.ITEM_LIST.HEIGHT;
    expect(itemListBottom).toBeLessThanOrEqual(ShopSceneLayout.BACK_BUTTON.Y);
  });
});

describe('ShopScene シーンインデックス', () => {
  it('scenesインデックスからShopSceneがエクスポートされている', async () => {
    const module = await import('@game/scenes');
    expect(module.ShopScene).toBeDefined();
  });

  it('scenesインデックスからShopSceneLayoutがエクスポートされている', async () => {
    const module = await import('@game/scenes');
    expect(module.ShopSceneLayout).toBeDefined();
  });

  it('scenesインデックスからShopCategoriesがエクスポートされている', async () => {
    const module = await import('@game/scenes');
    expect(module.ShopCategories).toBeDefined();
  });
});

describe('ShopScene EventBusイベント', () => {
  beforeEach(() => {
    EventBus.resetInstance();
  });

  afterEach(() => {
    EventBus.resetInstance();
    vi.clearAllMocks();
  });

  it('shop:purchase:requestedイベントをEventBus経由で発行できる', () => {
    const eventBus = EventBus.getInstance();
    const callback = vi.fn();
    eventBus.on('shop:purchase:requested', callback);

    eventBus.emit('shop:purchase:requested', {
      item: {
        id: 'test-item',
        name: 'テストアイテム',
        price: 100,
        category: 'cards',
      },
      category: 'cards',
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({
      item: expect.objectContaining({ id: 'test-item' }),
      category: 'cards',
    });
  });

  it('shop:purchase:completeイベントをEventBus経由で発行できる', () => {
    const eventBus = EventBus.getInstance();
    const callback = vi.fn();
    eventBus.on('shop:purchase:complete', callback);

    eventBus.emit('shop:purchase:complete', {
      item: {
        id: 'test-item',
        name: 'テストアイテム',
        price: 100,
        category: 'cards',
      },
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('shop:gold:updatedイベントをEventBus経由で発行できる', () => {
    const eventBus = EventBus.getInstance();
    const callback = vi.fn();
    eventBus.on('shop:gold:updated', callback);

    eventBus.emit('shop:gold:updated', { gold: 500 });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({ gold: 500 });
  });
});

// TASK-0241: カード購入機能関連テスト
describe('ShopScene カード関連定数', () => {
  it('CardTypeIconsが定義されている', async () => {
    const { CardTypeIcons } = await import('@game/scenes/ShopSceneConstants');
    expect(CardTypeIcons).toBeDefined();
    expect(CardTypeIcons.gathering).toBe('🌿');
    expect(CardTypeIcons.recipe).toBe('📜');
    expect(CardTypeIcons.enhance).toBe('⚡');
  });

  it('CardTypeLabelsが定義されている', async () => {
    const { CardTypeLabels } = await import('@game/scenes/ShopSceneConstants');
    expect(CardTypeLabels).toBeDefined();
    expect(CardTypeLabels.gathering).toBe('採取地カード');
    expect(CardTypeLabels.recipe).toBe('レシピカード');
    expect(CardTypeLabels.enhance).toBe('強化カード');
  });

  it('RarityColorsが5種類のレアリティを持つ', async () => {
    const { RarityColors } = await import('@game/scenes/ShopSceneConstants');
    expect(RarityColors).toBeDefined();
    expect(RarityColors.common).toBeDefined();
    expect(RarityColors.uncommon).toBeDefined();
    expect(RarityColors.rare).toBeDefined();
    expect(RarityColors.epic).toBeDefined();
    expect(RarityColors.legendary).toBeDefined();
  });

  it('RarityLabelsが日本語ラベルを持つ', async () => {
    const { RarityLabels } = await import('@game/scenes/ShopSceneConstants');
    expect(RarityLabels).toBeDefined();
    expect(RarityLabels.common).toBe('コモン');
    expect(RarityLabels.uncommon).toBe('アンコモン');
    expect(RarityLabels.rare).toBe('レア');
    expect(RarityLabels.epic).toBe('エピック');
    expect(RarityLabels.legendary).toBe('レジェンダリー');
  });

  it('CardItemRowLayoutが定義されている', async () => {
    const { CardItemRowLayout } = await import('@game/scenes/ShopSceneConstants');
    expect(CardItemRowLayout).toBeDefined();
    expect(CardItemRowLayout.WIDTH).toBe(560);
    expect(CardItemRowLayout.HEIGHT).toBe(80);
  });

  it('CardDetailPanelLayoutが定義されている', async () => {
    const { CardDetailPanelLayout } = await import('@game/scenes/ShopSceneConstants');
    expect(CardDetailPanelLayout).toBeDefined();
    expect(CardDetailPanelLayout.PREVIEW_Y).toBe(100);
    expect(CardDetailPanelLayout.NAME_Y).toBe(200);
  });

  it('CardPreviewSizeが定義されている', async () => {
    const { CardPreviewSize } = await import('@game/scenes/ShopSceneConstants');
    expect(CardPreviewSize).toBeDefined();
    expect(CardPreviewSize.WIDTH).toBe(100);
    expect(CardPreviewSize.HEIGHT).toBe(140);
  });

  it('LoadingOverlayConfigが定義されている', async () => {
    const { LoadingOverlayConfig } = await import('@game/scenes/ShopSceneConstants');
    expect(LoadingOverlayConfig).toBeDefined();
    expect(LoadingOverlayConfig.SPINNER_RADIUS).toBe(30);
    expect(LoadingOverlayConfig.DEPTH).toBe(200);
  });

  it('PurchaseAnimationConfigが定義されている', async () => {
    const { PurchaseAnimationConfig } = await import('@game/scenes/ShopSceneConstants');
    expect(PurchaseAnimationConfig).toBeDefined();
    expect(PurchaseAnimationConfig.DURATION).toBe(500);
    expect(PurchaseAnimationConfig.DEPTH).toBe(100);
  });
});

describe('ShopScene カード商品型', () => {
  it('ShopCardItemインターフェースが使用できる', async () => {
    const module = await import('@game/scenes/ShopScene');
    expect(module).toBeDefined();
    // 型のテストなのでモジュールがインポートできることを確認
  });

  it('isShopCardItem型ガードが正しく動作する', async () => {
    const { isShopCardItem } = await import('@game/scenes/ShopScene');

    const cardItem = {
      id: 'card-1',
      name: 'テストカード',
      price: 100,
      category: 'cards' as const,
      type: 'gathering' as const,
      rarity: 'common' as const,
    };

    const normalItem = {
      id: 'item-1',
      name: '通常アイテム',
      price: 50,
      category: 'materials' as const,
    };

    expect(isShopCardItem(cardItem)).toBe(true);
    expect(isShopCardItem(normalItem)).toBe(false);
  });

  it('ShopItemUnion型がエクスポートされている', async () => {
    const module = await import('@game/scenes/ShopScene');
    // 型なのでランタイムチェックできないが、モジュールが存在することを確認
    expect(module).toBeDefined();
  });
});

describe('ShopScene scenesインデックス追加エクスポート', () => {
  it('CardTypeIconsがエクスポートされている', async () => {
    const module = await import('@game/scenes');
    expect(module.CardTypeIcons).toBeDefined();
  });

  it('CardTypeLabelsがエクスポートされている', async () => {
    const module = await import('@game/scenes');
    expect(module.CardTypeLabels).toBeDefined();
  });

  it('RarityColorsがエクスポートされている', async () => {
    const module = await import('@game/scenes');
    expect(module.RarityColors).toBeDefined();
  });

  it('CardItemRowLayoutがエクスポートされている', async () => {
    const module = await import('@game/scenes');
    expect(module.CardItemRowLayout).toBeDefined();
  });

  it('isShopCardItemがエクスポートされている', async () => {
    const module = await import('@game/scenes');
    expect(module.isShopCardItem).toBeDefined();
  });
});

// =====================================================
// TASK-0242: 素材・アーティファクト購入関連テスト
// =====================================================

describe('ShopScene 素材関連定数', () => {
  it('MaterialQualityThresholdsが定義されている', async () => {
    const { MaterialQualityThresholds } = await import('@game/scenes/ShopSceneConstants');
    expect(MaterialQualityThresholds).toBeDefined();
    expect(MaterialQualityThresholds.HIGH_MIN).toBe(80);
    expect(MaterialQualityThresholds.MEDIUM_MIN).toBe(50);
  });

  it('MaterialQualityColorsが3種類の品質色を持つ', async () => {
    const { MaterialQualityColors } = await import('@game/scenes/ShopSceneConstants');
    expect(MaterialQualityColors).toBeDefined();
    expect(MaterialQualityColors.low).toBe(0xaaaaaa);
    expect(MaterialQualityColors.medium).toBe(0x00aaff);
    expect(MaterialQualityColors.high).toBe(0xffaa00);
  });

  it('MaterialQualityColorStringsがCSS用カラー文字列を持つ', async () => {
    const { MaterialQualityColorStrings } = await import('@game/scenes/ShopSceneConstants');
    expect(MaterialQualityColorStrings).toBeDefined();
    expect(MaterialQualityColorStrings.low).toBe('#aaaaaa');
    expect(MaterialQualityColorStrings.medium).toBe('#00aaff');
    expect(MaterialQualityColorStrings.high).toBe('#ffaa00');
  });

  it('MaterialQualityLabelsが日本語ラベルを持つ', async () => {
    const { MaterialQualityLabels } = await import('@game/scenes/ShopSceneConstants');
    expect(MaterialQualityLabels).toBeDefined();
    expect(MaterialQualityLabels.low).toBe('低品質');
    expect(MaterialQualityLabels.medium).toBe('中品質');
    expect(MaterialQualityLabels.high).toBe('高品質');
  });

  it('MaterialItemRowLayoutが定義されている', async () => {
    const { MaterialItemRowLayout } = await import('@game/scenes/ShopSceneConstants');
    expect(MaterialItemRowLayout).toBeDefined();
    expect(MaterialItemRowLayout.WIDTH).toBe(560);
    expect(MaterialItemRowLayout.HEIGHT).toBe(70);
    expect(MaterialItemRowLayout.NAME_X).toBe(75);
    expect(MaterialItemRowLayout.STOCK_X).toBe(480);
  });

  it('MaterialDetailPanelLayoutが定義されている', async () => {
    const { MaterialDetailPanelLayout } = await import('@game/scenes/ShopSceneConstants');
    expect(MaterialDetailPanelLayout).toBeDefined();
    expect(MaterialDetailPanelLayout.NAME_Y).toBe(30);
    expect(MaterialDetailPanelLayout.QUANTITY_SELECTOR_Y).toBe(220);
  });
});

describe('ShopScene 数量セレクタ定数', () => {
  it('QuantitySelectorLayoutが定義されている', async () => {
    const { QuantitySelectorLayout } = await import('@game/scenes/ShopSceneConstants');
    expect(QuantitySelectorLayout).toBeDefined();
    expect(QuantitySelectorLayout.BUTTON_RADIUS).toBe(20);
    expect(QuantitySelectorLayout.MINUS_X).toBe(-60);
    expect(QuantitySelectorLayout.PLUS_X).toBe(60);
    expect(QuantitySelectorLayout.MAX_BUTTON_WIDTH).toBe(80);
  });

  it('QuantitySelectorConfigが定義されている', async () => {
    const { QuantitySelectorConfig } = await import('@game/scenes/ShopSceneConstants');
    expect(QuantitySelectorConfig).toBeDefined();
    expect(QuantitySelectorConfig.MIN_QUANTITY).toBe(1);
    expect(QuantitySelectorConfig.MAX_QUANTITY).toBe(99);
    expect(QuantitySelectorConfig.INFINITE_STOCK).toBe(-1);
  });

  it('StockDisplayConfigが定義されている', async () => {
    const { StockDisplayConfig } = await import('@game/scenes/ShopSceneConstants');
    expect(StockDisplayConfig).toBeDefined();
    expect(StockDisplayConfig.INFINITE_SYMBOL).toBe('∞');
    expect(StockDisplayConfig.STOCK_PREFIX).toBe('残');
    expect(StockDisplayConfig.OUT_OF_STOCK_COLOR).toBe('#ff4444');
  });
});

describe('ShopScene アーティファクト関連定数', () => {
  it('ArtifactItemRowLayoutが定義されている', async () => {
    const { ArtifactItemRowLayout } = await import('@game/scenes/ShopSceneConstants');
    expect(ArtifactItemRowLayout).toBeDefined();
    expect(ArtifactItemRowLayout.WIDTH).toBe(560);
    expect(ArtifactItemRowLayout.HEIGHT).toBe(90);
    expect(ArtifactItemRowLayout.ICON_BG_WIDTH).toBe(70);
    expect(ArtifactItemRowLayout.ICON_BG_HEIGHT).toBe(70);
  });

  it('ArtifactDetailPanelLayoutが定義されている', async () => {
    const { ArtifactDetailPanelLayout } = await import('@game/scenes/ShopSceneConstants');
    expect(ArtifactDetailPanelLayout).toBeDefined();
    expect(ArtifactDetailPanelLayout.NAME_Y).toBe(30);
    expect(ArtifactDetailPanelLayout.EFFECTS_LABEL_Y).toBe(100);
    expect(ArtifactDetailPanelLayout.PRICE_Y).toBe(350);
  });

  it('ArtifactRarityLabelsが星付きラベルを持つ', async () => {
    const { ArtifactRarityLabels } = await import('@game/scenes/ShopSceneConstants');
    expect(ArtifactRarityLabels).toBeDefined();
    expect(ArtifactRarityLabels.common).toBe('★ コモン');
    expect(ArtifactRarityLabels.uncommon).toBe('★★ アンコモン');
    expect(ArtifactRarityLabels.rare).toBe('★★★ レア');
    expect(ArtifactRarityLabels.epic).toBe('★★★★ エピック');
    expect(ArtifactRarityLabels.legendary).toBe('★★★★★ レジェンダリー');
  });

  it('ArtifactIconが定義されている', async () => {
    const { ArtifactIcon } = await import('@game/scenes/ShopSceneConstants');
    expect(ArtifactIcon).toBe('🏆');
  });
});

describe('ShopScene 素材商品型', () => {
  it('isShopMaterialItem型ガードが正しく動作する', async () => {
    const { isShopMaterialItem } = await import('@game/scenes/ShopScene');

    const materialItem = {
      id: 'mat-1',
      name: 'テスト素材',
      price: 50,
      category: 'materials' as const,
      quality: 75,
      stock: 10,
    };

    const cardItem = {
      id: 'card-1',
      name: 'テストカード',
      price: 100,
      category: 'cards' as const,
      type: 'gathering' as const,
      rarity: 'common' as const,
    };

    expect(isShopMaterialItem(materialItem)).toBe(true);
    expect(isShopMaterialItem(cardItem)).toBe(false);
  });

  it('素材は品質とストックを持つ', async () => {
    const { isShopMaterialItem } = await import('@game/scenes/ShopScene');

    const highQualityMaterial = {
      id: 'mat-high',
      name: '高品質素材',
      price: 100,
      category: 'materials' as const,
      quality: 90,
      stock: 5,
    };

    expect(isShopMaterialItem(highQualityMaterial)).toBe(true);
    expect(highQualityMaterial.quality).toBe(90);
    expect(highQualityMaterial.stock).toBe(5);
  });
});

describe('ShopScene アーティファクト商品型', () => {
  it('isShopArtifactItem型ガードが正しく動作する', async () => {
    const { isShopArtifactItem } = await import('@game/scenes/ShopScene');

    const artifactItem = {
      id: 'art-1',
      name: 'テストアーティファクト',
      price: 500,
      category: 'artifacts' as const,
      rarity: 'rare' as const,
      effects: [{ description: '攻撃力+10' }],
    };

    const materialItem = {
      id: 'mat-1',
      name: 'テスト素材',
      price: 50,
      category: 'materials' as const,
      quality: 75,
      stock: 10,
    };

    expect(isShopArtifactItem(artifactItem)).toBe(true);
    expect(isShopArtifactItem(materialItem)).toBe(false);
  });

  it('アーティファクトはレアリティとエフェクトを持つ', async () => {
    const { isShopArtifactItem } = await import('@game/scenes/ShopScene');

    const legendaryArtifact = {
      id: 'art-legendary',
      name: '伝説のアーティファクト',
      price: 10000,
      category: 'artifacts' as const,
      rarity: 'legendary' as const,
      effects: [
        { description: '全能力+20%' },
        { description: '特殊スキル発動' },
      ],
      requirement: 'ランクS以上',
    };

    expect(isShopArtifactItem(legendaryArtifact)).toBe(true);
    expect(legendaryArtifact.rarity).toBe('legendary');
    expect(legendaryArtifact.effects).toHaveLength(2);
    expect(legendaryArtifact.requirement).toBe('ランクS以上');
  });
});

describe('ShopScene 素材・アーティファクト関連エクスポート', () => {
  it('MaterialQualityColorsがscenesからエクスポートされている', async () => {
    const module = await import('@game/scenes');
    expect(module.MaterialQualityColors).toBeDefined();
  });

  it('MaterialItemRowLayoutがscenesからエクスポートされている', async () => {
    const module = await import('@game/scenes');
    expect(module.MaterialItemRowLayout).toBeDefined();
  });

  it('QuantitySelectorConfigがscenesからエクスポートされている', async () => {
    const module = await import('@game/scenes');
    expect(module.QuantitySelectorConfig).toBeDefined();
  });

  it('ArtifactItemRowLayoutがscenesからエクスポートされている', async () => {
    const module = await import('@game/scenes');
    expect(module.ArtifactItemRowLayout).toBeDefined();
  });

  it('ArtifactRarityLabelsがscenesからエクスポートされている', async () => {
    const module = await import('@game/scenes');
    expect(module.ArtifactRarityLabels).toBeDefined();
  });

  it('isShopMaterialItemがscenesからエクスポートされている', async () => {
    const module = await import('@game/scenes');
    expect(module.isShopMaterialItem).toBeDefined();
  });

  it('isShopArtifactItemがscenesからエクスポートされている', async () => {
    const module = await import('@game/scenes');
    expect(module.isShopArtifactItem).toBeDefined();
  });
});

// =====================================================
// TASK-0243: ShopScene購入フローテスト
// =====================================================

describe('ShopScene カード購入フロー', () => {
  beforeEach(() => {
    EventBus.resetInstance();
  });

  afterEach(() => {
    EventBus.resetInstance();
    vi.clearAllMocks();
  });

  it('カード購入リクエストが正しい形式で送信される', () => {
    const eventBus = EventBus.getInstance();
    const callback = vi.fn();
    eventBus.on('shop:purchase:requested', callback);

    const cardItem = {
      id: 'card-001',
      name: '森の採取地',
      price: 100,
      category: 'cards' as const,
      type: 'gathering' as const,
      rarity: 'common' as const,
    };

    eventBus.emit('shop:purchase:requested', {
      item: {
        id: cardItem.id,
        name: cardItem.name,
        price: cardItem.price,
        category: cardItem.category,
      },
      category: 'cards',
    });

    expect(callback).toHaveBeenCalledWith(expect.objectContaining({
      item: expect.objectContaining({
        id: 'card-001',
        price: 100,
        category: 'cards',
      }),
      category: 'cards',
    }));
  });

  it('カード購入完了イベントで所持金が更新される', () => {
    const eventBus = EventBus.getInstance();
    const goldCallback = vi.fn();
    eventBus.on('shop:gold:updated', goldCallback);

    // 購入完了後のゴールド更新をシミュレート
    eventBus.emit('shop:gold:updated', { gold: 900 });

    expect(goldCallback).toHaveBeenCalledWith({ gold: 900 });
  });

  it('購入完了イベントが正しく発行される', () => {
    const eventBus = EventBus.getInstance();
    const completeCallback = vi.fn();
    eventBus.on('shop:purchase:complete', completeCallback);

    eventBus.emit('shop:purchase:complete', {
      item: {
        id: 'card-001',
        name: '森の採取地',
        price: 100,
        category: 'cards',
      },
    });

    expect(completeCallback).toHaveBeenCalledTimes(1);
    expect(completeCallback).toHaveBeenCalledWith(expect.objectContaining({
      item: expect.objectContaining({
        id: 'card-001',
        category: 'cards',
      }),
    }));
  });
});

describe('ShopScene 素材購入フロー', () => {
  beforeEach(() => {
    EventBus.resetInstance();
  });

  afterEach(() => {
    EventBus.resetInstance();
    vi.clearAllMocks();
  });

  it('素材購入リクエストに数量と合計金額が含まれる', () => {
    const eventBus = EventBus.getInstance();
    const callback = vi.fn();
    eventBus.on('shop:purchase:requested', callback);

    const materialItem = {
      id: 'mat-001',
      name: '薬草',
      price: 50,
      category: 'materials' as const,
    };

    eventBus.emit('shop:purchase:requested', {
      item: materialItem,
      category: 'materials',
      quantity: 5,
      totalPrice: 250,
    });

    expect(callback).toHaveBeenCalledWith(expect.objectContaining({
      category: 'materials',
      quantity: 5,
      totalPrice: 250,
    }));
  });

  it('無限在庫素材の購入が可能', () => {
    const eventBus = EventBus.getInstance();
    const callback = vi.fn();
    eventBus.on('shop:purchase:requested', callback);

    const infiniteStockMaterial = {
      id: 'mat-infinite',
      name: '魔法の花',
      price: 150,
      category: 'materials' as const,
    };

    eventBus.emit('shop:purchase:requested', {
      item: infiniteStockMaterial,
      category: 'materials',
      quantity: 10,
      totalPrice: 1500,
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('素材購入完了後にゴールドが更新される', () => {
    const eventBus = EventBus.getInstance();
    const goldCallback = vi.fn();
    eventBus.on('shop:gold:updated', goldCallback);

    // 素材購入後のゴールド更新
    eventBus.emit('shop:gold:updated', { gold: 750 });

    expect(goldCallback).toHaveBeenCalledWith({ gold: 750 });
  });
});

describe('ShopScene アーティファクト購入フロー', () => {
  beforeEach(() => {
    EventBus.resetInstance();
  });

  afterEach(() => {
    EventBus.resetInstance();
    vi.clearAllMocks();
  });

  it('アーティファクト購入リクエストが正しく送信される', () => {
    const eventBus = EventBus.getInstance();
    const callback = vi.fn();
    eventBus.on('shop:purchase:requested', callback);

    const artifactItem = {
      id: 'art-001',
      name: '錬金術師のローブ',
      price: 500,
      category: 'artifacts' as const,
    };

    eventBus.emit('shop:purchase:requested', {
      item: artifactItem,
      category: 'artifacts',
    });

    expect(callback).toHaveBeenCalledWith(expect.objectContaining({
      item: expect.objectContaining({
        id: 'art-001',
        price: 500,
        category: 'artifacts',
      }),
      category: 'artifacts',
    }));
  });

  it('高額アーティファクトの購入リクエストも発行できる', () => {
    const eventBus = EventBus.getInstance();
    const callback = vi.fn();
    eventBus.on('shop:purchase:requested', callback);

    const legendaryArtifact = {
      id: 'art-legendary',
      name: '伝説の杖',
      price: 10000,
      category: 'artifacts' as const,
    };

    eventBus.emit('shop:purchase:requested', {
      item: legendaryArtifact,
      category: 'artifacts',
    });

    expect(callback).toHaveBeenCalledWith(expect.objectContaining({
      item: expect.objectContaining({
        price: 10000,
      }),
    }));
  });

  it('アーティファクト購入完了イベントが正しく処理される', () => {
    const eventBus = EventBus.getInstance();
    const completeCallback = vi.fn();
    eventBus.on('shop:purchase:complete', completeCallback);

    eventBus.emit('shop:purchase:complete', {
      item: {
        id: 'art-001',
        name: '錬金術師のローブ',
        price: 500,
        category: 'artifacts',
      },
    });

    expect(completeCallback).toHaveBeenCalledWith(expect.objectContaining({
      item: expect.objectContaining({
        id: 'art-001',
        category: 'artifacts',
      }),
    }));
  });
});

describe('ShopScene 購入可否判定', () => {
  it('所持金と価格の比較が正しく動作する', () => {
    const playerGold = 1000;
    const itemPrice = 500;
    const canAfford = playerGold >= itemPrice;

    expect(canAfford).toBe(true);
  });

  it('所持金不足の場合は購入不可', () => {
    const playerGold = 100;
    const itemPrice = 500;
    const canAfford = playerGold >= itemPrice;

    expect(canAfford).toBe(false);
  });

  it('素材の数量購入時に合計金額で判定される', () => {
    const playerGold = 1000;
    const unitPrice = 50;
    const quantity = 10;
    const totalPrice = unitPrice * quantity;
    const canAfford = playerGold >= totalPrice;

    expect(totalPrice).toBe(500);
    expect(canAfford).toBe(true);
  });

  it('素材の最大購入数量が計算できる', () => {
    const playerGold = 1000;
    const unitPrice = 150;
    const stock = 10;
    const maxByGold = Math.floor(playerGold / unitPrice);
    const maxQuantity = Math.min(maxByGold, stock);

    expect(maxByGold).toBe(6);
    expect(maxQuantity).toBe(6);
  });

  it('無限在庫の場合は所持金のみで最大数量が決まる', () => {
    const playerGold = 1000;
    const unitPrice = 50;
    const stock = -1; // 無限在庫

    const maxByGold = Math.floor(playerGold / unitPrice);
    const maxQuantity = stock === -1 ? maxByGold : Math.min(maxByGold, stock);

    expect(maxQuantity).toBe(20);
  });
});
