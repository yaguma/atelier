/**
 * DeliveryContainer単体テスト
 *
 * TASK-0232: DeliveryContainer設計のテスト
 * 納品フェーズコンテナの基本機能をテストする
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GamePhase, QuestType, Quality } from '../../../../../src/domain/common/types';
import { DeliveryContainer } from '../../../../../src/game/ui/phase/DeliveryContainer';
import type { DeliveryContainerOptions } from '../../../../../src/game/ui/phase/IDeliveryContainer';
import type { IActiveQuest } from '../../../../../src/domain/quest/QuestEntity';
import type { CraftedItem } from '../../../../../src/domain/item/ItemEntity';
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
      off: vi.fn().mockReturnThis(),
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
 * テスト用のモック依頼を作成
 */
function createMockActiveQuest(overrides: Partial<IActiveQuest> = {}): IActiveQuest {
  const defaultQuest = {
    id: 'quest-1',
    clientId: 'client-1',
    condition: {
      type: QuestType.SPECIFIC,
      itemId: 'item-potion',
      quantity: 1,
    },
    contribution: 10,
    gold: 100,
    deadline: 7,
    difficulty: 'normal' as const,
    flavorText: 'テスト依頼',
  };

  // quest内のプロパティをマージ（overridesにquestがあれば上書き）
  const mergedQuest = overrides.quest
    ? { ...defaultQuest, ...overrides.quest }
    : defaultQuest;

  // overridesからquestを除いたものをマージ
  const { quest: _quest, ...restOverrides } = overrides;

  return {
    quest: mergedQuest,
    remainingDays: 5,
    acceptedDay: 1,
    ...restOverrides,
  } as IActiveQuest;
}

/**
 * テスト用のモック調合済みアイテムを作成
 */
function createMockCraftedItem(overrides: Partial<CraftedItem> = {}): CraftedItem {
  const defaultItem = {
    id: 'crafted-1',
    itemId: 'item-potion',
    quality: Quality.C,
    attributeValues: [],
    effectValues: [],
    usedMaterials: [],
    getQuality: () => Quality.C,
    calculateSellPrice: () => 50,
    getEffectValues: () => [],
    getAttributeValues: () => [],
    getAttributeValue: () => 0,
    getEffectValue: () => 0,
    getUsedMaterials: () => [],
    usedRareMaterial: () => false,
    countRareMaterials: () => 0,
    usedMaterial: () => false,
    ...overrides,
  };

  return defaultItem as unknown as CraftedItem;
}

describe('DeliveryContainer', () => {
  let mockScene: Phaser.Scene;
  let eventBus: EventBus;

  beforeEach(() => {
    mockScene = createMockScene();
    EventBus.resetInstance();
    eventBus = EventBus.getInstance();
  });

  // ========================================
  // 1. コンストラクタ・初期化
  // ========================================

  describe('初期化', () => {
    it('コンテナが正しく初期化される', () => {
      const options: DeliveryContainerOptions = {
        scene: mockScene,
        eventBus,
      };

      const container = new DeliveryContainer(options);

      expect(container).toBeDefined();
      expect(container.container).toBeDefined();
      expect(container.phase).toBe(GamePhase.DELIVERY);
    });

    it('位置を指定できる', () => {
      const options: DeliveryContainerOptions = {
        scene: mockScene,
        eventBus,
        x: 100,
        y: 200,
      };

      const container = new DeliveryContainer(options);

      expect(container.container).toBeDefined();
    });

    it('コールバックを設定できる', () => {
      const onComplete = vi.fn();
      const onSkip = vi.fn();

      const options: DeliveryContainerOptions = {
        scene: mockScene,
        eventBus,
        onDeliveryComplete: onComplete,
        onSkip: onSkip,
      };

      const container = new DeliveryContainer(options);

      expect(container).toBeDefined();
    });
  });

  // ========================================
  // 2. 依頼設定
  // ========================================

  describe('依頼設定', () => {
    it('setAcceptedQuestsで依頼を設定できる', () => {
      const container = new DeliveryContainer({
        scene: mockScene,
        eventBus,
      });
      const quests = [createMockActiveQuest()];

      container.setAcceptedQuests(quests);

      expect(container.getAcceptedQuests()).toHaveLength(1);
    });

    it('getAcceptedQuestsで依頼リストを取得できる', () => {
      const container = new DeliveryContainer({
        scene: mockScene,
        eventBus,
      });
      const quest1 = createMockActiveQuest({ quest: { id: 'quest-1' } as any });
      const quest2 = createMockActiveQuest({ quest: { id: 'quest-2' } as any });

      container.setAcceptedQuests([quest1, quest2]);

      expect(container.getAcceptedQuests()).toHaveLength(2);
    });

    it('初期状態では依頼が選択されていない', () => {
      const container = new DeliveryContainer({
        scene: mockScene,
        eventBus,
      });

      expect(container.getSelectedQuest()).toBeNull();
    });
  });

  // ========================================
  // 3. インベントリ設定
  // ========================================

  describe('インベントリ設定', () => {
    it('setInventoryでインベントリを設定できる', () => {
      const container = new DeliveryContainer({
        scene: mockScene,
        eventBus,
      });
      const items = [createMockCraftedItem()];

      container.setInventory(items);

      // インベントリが設定されている（内部状態のため直接確認できないが、エラーなく動作する）
      expect(container).toBeDefined();
    });
  });

  // ========================================
  // 4. 依頼選択
  // ========================================

  describe('依頼選択', () => {
    it('selectQuestで依頼を選択できる', () => {
      const container = new DeliveryContainer({
        scene: mockScene,
        eventBus,
      });
      const quest = createMockActiveQuest();
      container.setAcceptedQuests([quest]);

      container.selectQuest(quest);

      expect(container.getSelectedQuest()).toBe(quest);
    });

    it('依頼選択時にイベントが発火する', () => {
      const selectHandler = vi.fn();
      eventBus.on('delivery:quest:selected' as any, selectHandler);

      const container = new DeliveryContainer({
        scene: mockScene,
        eventBus,
      });
      const quest = createMockActiveQuest();
      container.setAcceptedQuests([quest]);

      container.selectQuest(quest);

      expect(selectHandler).toHaveBeenCalledWith({ quest });
    });

    it('getSelectedQuestで選択中の依頼を取得できる', () => {
      const container = new DeliveryContainer({
        scene: mockScene,
        eventBus,
      });
      const quest = createMockActiveQuest();
      container.setAcceptedQuests([quest]);
      container.selectQuest(quest);

      const selected = container.getSelectedQuest();

      expect(selected).toBe(quest);
    });
  });

  // ========================================
  // 5. 納品可否判定
  // ========================================

  describe('納品可否判定', () => {
    it('依頼未選択時はcanDeliverがfalseを返す', () => {
      const container = new DeliveryContainer({
        scene: mockScene,
        eventBus,
      });
      const quest = createMockActiveQuest();

      // 依頼を設定したがまだ選択していない
      container.setAcceptedQuests([quest]);

      // canDeliverは特定の依頼に対して判定する
      expect(container.canDeliver(quest)).toBe(false);
    });

    it('インベントリに必要アイテムがあればcanDeliverがtrueを返す', () => {
      const container = new DeliveryContainer({
        scene: mockScene,
        eventBus,
      });
      const quest = createMockActiveQuest({
        quest: {
          id: 'quest-1',
          clientId: 'client-1',
          condition: {
            type: QuestType.SPECIFIC,
            itemId: 'item-potion',
            quantity: 1,
          },
          contribution: 10,
          gold: 100,
          deadline: 7,
          difficulty: 'normal',
          flavorText: 'テスト依頼',
        },
      });
      const item = createMockCraftedItem({ itemId: 'item-potion' });

      container.setAcceptedQuests([quest]);
      container.setInventory([item]);

      expect(container.canDeliver(quest)).toBe(true);
    });

    it('インベントリに必要アイテムがなければcanDeliverがfalseを返す', () => {
      const container = new DeliveryContainer({
        scene: mockScene,
        eventBus,
      });
      const quest = createMockActiveQuest({
        quest: {
          id: 'quest-1',
          clientId: 'client-1',
          condition: {
            type: QuestType.SPECIFIC,
            itemId: 'item-potion',
            quantity: 1,
          },
          contribution: 10,
          gold: 100,
          deadline: 7,
          difficulty: 'normal',
          flavorText: 'テスト依頼',
        },
      });
      const item = createMockCraftedItem({ itemId: 'item-bomb' }); // 違うアイテム

      container.setAcceptedQuests([quest]);
      container.setInventory([item]);

      expect(container.canDeliver(quest)).toBe(false);
    });

    it('getDeliverableQuestsで納品可能な依頼リストを取得できる', () => {
      const container = new DeliveryContainer({
        scene: mockScene,
        eventBus,
      });
      const quest1 = createMockActiveQuest({
        quest: {
          id: 'quest-1',
          clientId: 'client-1',
          condition: {
            type: QuestType.SPECIFIC,
            itemId: 'item-potion',
            quantity: 1,
          },
          contribution: 10,
          gold: 100,
          deadline: 7,
          difficulty: 'normal',
          flavorText: 'テスト依頼1',
        },
      });
      const quest2 = createMockActiveQuest({
        quest: {
          id: 'quest-2',
          clientId: 'client-1',
          condition: {
            type: QuestType.SPECIFIC,
            itemId: 'item-bomb',
            quantity: 1,
          },
          contribution: 15,
          gold: 150,
          deadline: 5,
          difficulty: 'hard',
          flavorText: 'テスト依頼2',
        },
      });
      const item = createMockCraftedItem({ itemId: 'item-potion' });

      container.setAcceptedQuests([quest1, quest2]);
      container.setInventory([item]);

      const deliverable = container.getDeliverableQuests();

      expect(deliverable).toHaveLength(1);
      expect(deliverable[0]).toBe(quest1);
    });
  });

  // ========================================
  // 6. 納品実行
  // ========================================

  describe('納品実行', () => {
    it('納品可能な状態でdeliver()を呼ぶと完了コールバックが呼ばれる', async () => {
      const onComplete = vi.fn();
      const container = new DeliveryContainer({
        scene: mockScene,
        eventBus,
        onDeliveryComplete: onComplete,
      });
      const quest = createMockActiveQuest({
        quest: {
          id: 'quest-1',
          clientId: 'client-1',
          condition: {
            type: QuestType.SPECIFIC,
            itemId: 'item-potion',
            quantity: 1,
          },
          contribution: 10,
          gold: 100,
          deadline: 7,
          difficulty: 'normal',
          flavorText: 'テスト依頼',
        },
      });
      const item = createMockCraftedItem({ itemId: 'item-potion' });

      container.setAcceptedQuests([quest]);
      container.setInventory([item]);
      container.selectQuest(quest);

      await container.deliver();

      expect(onComplete).toHaveBeenCalled();
    });

    it('納品時にdelivery:completeイベントが発火する', async () => {
      const deliverHandler = vi.fn();
      eventBus.on('delivery:complete' as any, deliverHandler);

      const container = new DeliveryContainer({
        scene: mockScene,
        eventBus,
      });
      const quest = createMockActiveQuest({
        quest: {
          id: 'quest-1',
          clientId: 'client-1',
          condition: {
            type: QuestType.SPECIFIC,
            itemId: 'item-potion',
            quantity: 1,
          },
          contribution: 10,
          gold: 100,
          deadline: 7,
          difficulty: 'normal',
          flavorText: 'テスト依頼',
        },
      });
      const item = createMockCraftedItem({ itemId: 'item-potion' });

      container.setAcceptedQuests([quest]);
      container.setInventory([item]);
      container.selectQuest(quest);

      await container.deliver();

      expect(deliverHandler).toHaveBeenCalled();
    });

    it('納品不可能な状態ではdeliver()が何もしない', async () => {
      const onComplete = vi.fn();
      const container = new DeliveryContainer({
        scene: mockScene,
        eventBus,
        onDeliveryComplete: onComplete,
      });

      await container.deliver();

      expect(onComplete).not.toHaveBeenCalled();
    });
  });

  // ========================================
  // 7. スキップ操作
  // ========================================

  describe('スキップ操作', () => {
    it('cancelでphase:cancelイベントが発火する', () => {
      const cancelHandler = vi.fn();
      eventBus.on('phase:cancel' as any, cancelHandler);

      const container = new DeliveryContainer({
        scene: mockScene,
        eventBus,
      });

      container.cancel();

      expect(cancelHandler).toHaveBeenCalled();
    });
  });

  // ========================================
  // 8. 完了可能判定
  // ========================================

  describe('完了可能判定', () => {
    it('納品可能な依頼がある場合canCompleteがtrueを返す', () => {
      const container = new DeliveryContainer({
        scene: mockScene,
        eventBus,
      });
      const quest = createMockActiveQuest({
        quest: {
          id: 'quest-1',
          clientId: 'client-1',
          condition: {
            type: QuestType.SPECIFIC,
            itemId: 'item-potion',
            quantity: 1,
          },
          contribution: 10,
          gold: 100,
          deadline: 7,
          difficulty: 'normal',
          flavorText: 'テスト依頼',
        },
      });
      const item = createMockCraftedItem({ itemId: 'item-potion' });

      container.setAcceptedQuests([quest]);
      container.setInventory([item]);

      expect(container.canComplete()).toBe(true);
    });

    it('納品可能な依頼がない場合canCompleteがfalseを返す', () => {
      const container = new DeliveryContainer({
        scene: mockScene,
        eventBus,
      });
      const quest = createMockActiveQuest({
        quest: {
          id: 'quest-1',
          clientId: 'client-1',
          condition: {
            type: QuestType.SPECIFIC,
            itemId: 'item-potion',
            quantity: 1,
          },
          contribution: 10,
          gold: 100,
          deadline: 7,
          difficulty: 'normal',
          flavorText: 'テスト依頼',
        },
      });

      container.setAcceptedQuests([quest]);
      container.setInventory([]); // 空のインベントリ

      expect(container.canComplete()).toBe(false);
    });
  });

  // ========================================
  // 9. 表示制御
  // ========================================

  describe('表示制御', () => {
    it('setVisibleで表示/非表示を切り替えられる', () => {
      const container = new DeliveryContainer({
        scene: mockScene,
        eventBus,
      });

      container.setVisible(false);

      expect(container.container.setVisible).toHaveBeenCalledWith(false);
    });

    it('setEnabledで有効/無効を切り替えられる', () => {
      const container = new DeliveryContainer({
        scene: mockScene,
        eventBus,
      });

      container.setEnabled(false);

      expect(container.container.setAlpha).toHaveBeenCalledWith(0.5);
    });
  });

  // ========================================
  // 10. 破棄
  // ========================================

  describe('破棄', () => {
    it('destroyでコンテナが破棄される', () => {
      const container = new DeliveryContainer({
        scene: mockScene,
        eventBus,
      });

      container.destroy();

      expect(container.container.destroy).toHaveBeenCalled();
    });
  });

  // ========================================
  // 11. IDeliveryContainerインターフェース準拠
  // ========================================

  describe('IDeliveryContainerインターフェース準拠', () => {
    it('IDeliveryContainerの全メソッドが実装されている', () => {
      const container = new DeliveryContainer({
        scene: mockScene,
        eventBus,
      });

      // 依頼設定
      expect(typeof container.setAcceptedQuests).toBe('function');
      expect(typeof container.getAcceptedQuests).toBe('function');

      // インベントリ設定
      expect(typeof container.setInventory).toBe('function');

      // 選択操作
      expect(typeof container.getSelectedQuest).toBe('function');
      expect(typeof container.selectQuest).toBe('function');

      // 納品判定
      expect(typeof container.canDeliver).toBe('function');
      expect(typeof container.getDeliverableQuests).toBe('function');

      // 納品操作
      expect(typeof container.deliver).toBe('function');

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

  // ========================================
  // 12. 非SPECIFICタイプの依頼
  // ========================================

  describe('非SPECIFICタイプの依頼', () => {
    it('CATEGORYタイプの依頼は常に納品可能', () => {
      const container = new DeliveryContainer({
        scene: mockScene,
        eventBus,
      });
      const quest = createMockActiveQuest({
        quest: {
          id: 'quest-1',
          clientId: 'client-1',
          condition: {
            type: QuestType.CATEGORY,
            quantity: 1,
          },
          contribution: 10,
          gold: 100,
          deadline: 7,
          difficulty: 'normal',
          flavorText: 'テスト依頼',
        },
      });

      container.setAcceptedQuests([quest]);

      expect(container.canDeliver(quest)).toBe(true);
    });

    it('QUALITYタイプの依頼は常に納品可能', () => {
      const container = new DeliveryContainer({
        scene: mockScene,
        eventBus,
      });
      const quest = createMockActiveQuest({
        quest: {
          id: 'quest-1',
          clientId: 'client-1',
          condition: {
            type: QuestType.QUALITY,
            quantity: 1,
          },
          contribution: 10,
          gold: 100,
          deadline: 7,
          difficulty: 'normal',
          flavorText: 'テスト依頼',
        },
      });

      container.setAcceptedQuests([quest]);

      expect(container.canDeliver(quest)).toBe(true);
    });
  });
});
