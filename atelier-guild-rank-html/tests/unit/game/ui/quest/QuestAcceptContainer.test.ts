/**
 * QuestAcceptContainer単体テスト
 *
 * TASK-0216: QuestAcceptContainer設計のテスト
 * TASK-0217: QuestAcceptContainer依頼表示実装のテスト
 * TASK-0218: QuestAcceptContainer受注操作実装のテスト
 * TASK-0219: QuestAcceptContainerテスト（統合テスト）
 * 依頼受注フェーズのコンテナをテストする
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GamePhase } from '../../../../../src/domain/common/types';
import { Quest } from '../../../../../src/domain/quest/QuestEntity';
import { QuestAcceptContainer } from '../../../../../src/game/ui/quest/QuestAcceptContainer';
import type { QuestAcceptContainerConfig } from '../../../../../src/game/ui/quest/QuestAcceptContainer';
import { EventBus } from '../../../../../src/game/events/EventBus';

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
      setData: vi.fn().mockImplementation(function (this: any, key: string, value: unknown) {
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

  const mockTween = {
    add: vi.fn().mockImplementation((config: any) => {
      // 即座にonCompleteを呼び出す
      if (config.onComplete) {
        config.onComplete();
      }
      return { remove: vi.fn() };
    }),
  };

  return {
    add: {
      container: vi.fn().mockImplementation(() => createMockContainer()),
      graphics: vi.fn().mockReturnValue(mockGraphics),
      text: vi.fn().mockImplementation(() => createMockText()),
    },
    tweens: mockTween,
  } as unknown as Phaser.Scene;
}

/**
 * テスト用のモック依頼を作成
 */
function createMockQuest(overrides: Partial<Quest> = {}): Quest {
  const defaultQuest = {
    id: 'quest-1',
    clientId: 'client-1',
    condition: {
      itemId: 'item-1',
      quantity: 1,
    },
    contribution: 100,
    gold: 500,
    deadline: 5,
    difficulty: 'normal' as const,
    flavorText: 'テスト依頼',
  };

  return new Quest({ ...defaultQuest, ...overrides });
}

describe('QuestAcceptContainer', () => {
  let mockScene: Phaser.Scene;
  let eventBus: EventBus;
  let container: QuestAcceptContainer;

  beforeEach(() => {
    mockScene = createMockScene();
    EventBus.resetInstance();
    eventBus = EventBus.getInstance();

    const config: QuestAcceptContainerConfig = {
      scene: mockScene,
      eventBus,
      x: 200,
      y: 150,
      width: 800,
      height: 500,
    };

    container = new QuestAcceptContainer(config);
  });

  afterEach(() => {
    EventBus.resetInstance();
  });

  describe('コンストラクタ', () => {
    it('コンテナが正しく初期化される', () => {
      expect(container).toBeDefined();
      expect(container.phase).toBe(GamePhase.QUEST_ACCEPT);
      expect(container.container).toBeDefined();
    });

    it('初期状態で依頼リストが空', () => {
      expect(container.getSelectedQuest()).toBeNull();
    });
  });

  describe('依頼リスト表示', () => {
    it('setAvailableQuestsで依頼リストを設定できる', () => {
      const quests = [
        createMockQuest({ id: 'quest-1', flavorText: '依頼1' }),
        createMockQuest({ id: 'quest-2', flavorText: '依頼2' }),
      ];

      container.setAvailableQuests(quests);

      // 依頼リストが設定されたことを確認
      // UIの更新は内部で行われる
      expect(container.getSelectedQuest()).toBeNull();
    });

    it('空の依頼リストを設定できる', () => {
      container.setAvailableQuests([]);
      expect(container.getSelectedQuest()).toBeNull();
    });
  });

  describe('依頼選択', () => {
    it('依頼を選択できる', () => {
      const quests = [
        createMockQuest({ id: 'quest-1', flavorText: '依頼1' }),
        createMockQuest({ id: 'quest-2', flavorText: '依頼2' }),
      ];

      container.setAvailableQuests(quests);
      container.selectQuest(quests[0]);

      expect(container.getSelectedQuest()).toBe(quests[0]);
    });

    it('選択した依頼を変更できる', () => {
      const quests = [
        createMockQuest({ id: 'quest-1', flavorText: '依頼1' }),
        createMockQuest({ id: 'quest-2', flavorText: '依頼2' }),
      ];

      container.setAvailableQuests(quests);
      container.selectQuest(quests[0]);
      container.selectQuest(quests[1]);

      expect(container.getSelectedQuest()).toBe(quests[1]);
    });
  });

  describe('コールバック', () => {
    it('依頼受注時にonQuestAcceptedが呼ばれる', () => {
      const onQuestAccepted = vi.fn();
      const config: QuestAcceptContainerConfig = {
        scene: mockScene,
        eventBus,
        onQuestAccepted,
      };

      const containerWithCallback = new QuestAcceptContainer(config);
      const quest = createMockQuest();

      containerWithCallback.setAvailableQuests([quest]);
      containerWithCallback.selectQuest(quest);
      containerWithCallback.acceptSelectedQuest();

      expect(onQuestAccepted).toHaveBeenCalledWith(quest);
    });

    it('スキップ時にonSkipが呼ばれる', () => {
      const onSkip = vi.fn();
      const config: QuestAcceptContainerConfig = {
        scene: mockScene,
        eventBus,
        onSkip,
      };

      const containerWithCallback = new QuestAcceptContainer(config);
      containerWithCallback.skip();

      expect(onSkip).toHaveBeenCalled();
    });
  });

  describe('完了条件', () => {
    it('canCompleteは常にtrueを返す（スキップも可能なため）', () => {
      expect(container.canComplete()).toBe(true);
    });
  });

  describe('ライフサイクル', () => {
    it('enter()で選択状態がリセットされる', async () => {
      const quests = [createMockQuest()];
      container.setAvailableQuests(quests);
      container.selectQuest(quests[0]);

      await container.enter();

      expect(container.getSelectedQuest()).toBeNull();
    });

    it('exit()で状態がクリアされる', async () => {
      const quests = [createMockQuest()];
      container.setAvailableQuests(quests);
      container.selectQuest(quests[0]);

      await container.enter();
      await container.exit();

      expect(container.getSelectedQuest()).toBeNull();
    });
  });

  describe('完了結果', () => {
    it('依頼を選択して完了した場合、選択した依頼が結果に含まれる', async () => {
      const callback = vi.fn();
      eventBus.on('phase:complete' as any, callback);

      const quests = [createMockQuest()];
      container.setAvailableQuests(quests);
      container.selectQuest(quests[0]);
      container.acceptSelectedQuest();
      container.complete();

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          phase: GamePhase.QUEST_ACCEPT,
          result: expect.objectContaining({
            acceptedQuest: quests[0],
          }),
        })
      );
    });

    it('スキップした場合、acceptedQuestがnullになる', async () => {
      const callback = vi.fn();
      eventBus.on('phase:complete' as any, callback);

      container.skip();
      container.complete();

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          phase: GamePhase.QUEST_ACCEPT,
          result: expect.objectContaining({
            acceptedQuest: null,
          }),
        })
      );
    });
  });

  // =====================================================
  // TASK-0217: 依頼表示実装テスト
  // =====================================================

  describe('ソート機能', () => {
    it('期限順でソートできる', () => {
      const quests = [
        createMockQuest({ id: 'quest-1', deadline: 5 }),
        createMockQuest({ id: 'quest-2', deadline: 2 }),
        createMockQuest({ id: 'quest-3', deadline: 8 }),
      ];

      container.setAvailableQuests(quests);
      container.setSortType('deadline');

      const sorted = container.getDisplayQuests();
      expect(sorted[0].deadline).toBe(2);
      expect(sorted[1].deadline).toBe(5);
      expect(sorted[2].deadline).toBe(8);
    });

    it('報酬順でソートできる', () => {
      const quests = [
        createMockQuest({ id: 'quest-1', gold: 500 }),
        createMockQuest({ id: 'quest-2', gold: 1000 }),
        createMockQuest({ id: 'quest-3', gold: 300 }),
      ];

      container.setAvailableQuests(quests);
      container.setSortType('reward');

      const sorted = container.getDisplayQuests();
      expect(sorted[0].gold).toBe(1000);
      expect(sorted[1].gold).toBe(500);
      expect(sorted[2].gold).toBe(300);
    });

    it('難易度順でソートできる', () => {
      const quests = [
        createMockQuest({ id: 'quest-1', difficulty: 'hard' }),
        createMockQuest({ id: 'quest-2', difficulty: 'easy' }),
        createMockQuest({ id: 'quest-3', difficulty: 'expert' }),
        createMockQuest({ id: 'quest-4', difficulty: 'normal' }),
      ];

      container.setAvailableQuests(quests);
      container.setSortType('difficulty');

      const sorted = container.getDisplayQuests();
      expect(sorted[0].difficulty).toBe('easy');
      expect(sorted[1].difficulty).toBe('normal');
      expect(sorted[2].difficulty).toBe('hard');
      expect(sorted[3].difficulty).toBe('expert');
    });
  });

  describe('フィルター機能', () => {
    it('難易度でフィルターできる', () => {
      const quests = [
        createMockQuest({ id: 'quest-1', difficulty: 'easy' }),
        createMockQuest({ id: 'quest-2', difficulty: 'hard' }),
        createMockQuest({ id: 'quest-3', difficulty: 'hard' }),
        createMockQuest({ id: 'quest-4', difficulty: 'normal' }),
      ];

      container.setAvailableQuests(quests);
      container.setDifficultyFilter('hard');

      const filtered = container.getDisplayQuests();
      expect(filtered.length).toBe(2);
      expect(filtered.every((q) => q.difficulty === 'hard')).toBe(true);
    });

    it('フィルターをnullにすると全件表示される', () => {
      const quests = [
        createMockQuest({ id: 'quest-1', difficulty: 'easy' }),
        createMockQuest({ id: 'quest-2', difficulty: 'hard' }),
        createMockQuest({ id: 'quest-3', difficulty: 'normal' }),
      ];

      container.setAvailableQuests(quests);
      container.setDifficultyFilter('hard');
      container.setDifficultyFilter(null);

      const filtered = container.getDisplayQuests();
      expect(filtered.length).toBe(3);
    });
  });

  describe('受注済み依頼の除外', () => {
    it('受注済み依頼が除外される', () => {
      const quests = [
        createMockQuest({ id: 'quest-1' }),
        createMockQuest({ id: 'quest-2' }),
        createMockQuest({ id: 'quest-3' }),
      ];

      container.setAvailableQuests(quests);
      container.setAcceptedQuestIds(['quest-2']);

      const displayed = container.getDisplayQuests();
      expect(displayed.length).toBe(2);
      expect(displayed.find((q) => q.id === 'quest-2')).toBeUndefined();
    });

    it('複数の受注済み依頼が除外される', () => {
      const quests = [
        createMockQuest({ id: 'quest-1' }),
        createMockQuest({ id: 'quest-2' }),
        createMockQuest({ id: 'quest-3' }),
      ];

      container.setAvailableQuests(quests);
      container.setAcceptedQuestIds(['quest-1', 'quest-3']);

      const displayed = container.getDisplayQuests();
      expect(displayed.length).toBe(1);
      expect(displayed[0].id).toBe('quest-2');
    });
  });

  describe('ソートとフィルターの組み合わせ', () => {
    it('フィルターとソートが同時に適用される', () => {
      const quests = [
        createMockQuest({ id: 'quest-1', difficulty: 'hard', gold: 500 }),
        createMockQuest({ id: 'quest-2', difficulty: 'easy', gold: 1000 }),
        createMockQuest({ id: 'quest-3', difficulty: 'hard', gold: 800 }),
        createMockQuest({ id: 'quest-4', difficulty: 'hard', gold: 300 }),
      ];

      container.setAvailableQuests(quests);
      container.setDifficultyFilter('hard');
      container.setSortType('reward');

      const result = container.getDisplayQuests();
      expect(result.length).toBe(3);
      expect(result[0].gold).toBe(800);
      expect(result[1].gold).toBe(500);
      expect(result[2].gold).toBe(300);
    });

    it('フィルター、ソート、受注済み除外が全て適用される', () => {
      const quests = [
        createMockQuest({ id: 'quest-1', difficulty: 'hard', deadline: 5 }),
        createMockQuest({ id: 'quest-2', difficulty: 'hard', deadline: 2 }),
        createMockQuest({ id: 'quest-3', difficulty: 'easy', deadline: 1 }),
        createMockQuest({ id: 'quest-4', difficulty: 'hard', deadline: 8 }),
      ];

      container.setAvailableQuests(quests);
      container.setDifficultyFilter('hard');
      container.setAcceptedQuestIds(['quest-2']);
      container.setSortType('deadline');

      const result = container.getDisplayQuests();
      expect(result.length).toBe(2);
      expect(result[0].deadline).toBe(5);
      expect(result[1].deadline).toBe(8);
    });
  });

  // =====================================================
  // TASK-0218: 受注操作実装テスト
  // =====================================================

  describe('受注上限', () => {
    it('受注上限を設定できる', () => {
      container.setAcceptedQuestCount(3, 5);
      expect(container.getAcceptedQuestCount()).toBe(3);
      expect(container.getMaxAcceptedQuests()).toBe(5);
    });

    it('受注上限に達していない場合、追加受注できる', () => {
      container.setAcceptedQuestCount(2, 5);
      expect(container.canAcceptMoreQuests()).toBe(true);
    });

    it('受注上限に達している場合、追加受注できない', () => {
      container.setAcceptedQuestCount(5, 5);
      expect(container.canAcceptMoreQuests()).toBe(false);
    });

    it('受注上限を超えている場合も追加受注できない', () => {
      container.setAcceptedQuestCount(6, 5);
      expect(container.canAcceptMoreQuests()).toBe(false);
    });
  });

  describe('依頼受注イベント', () => {
    it('依頼受注時にquest:acceptイベントが発火する', () => {
      const callback = vi.fn();
      eventBus.on('quest:accept', callback);

      const quest = createMockQuest({ id: 'quest-1' });
      container.setAvailableQuests([quest]);
      container.selectQuest(quest);
      container.executeQuestAcceptDirect(quest);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          quest: quest,
        })
      );
    });

    it('受注後に受注済みカウントが増加する', () => {
      container.setAcceptedQuestCount(2, 5);
      const quest = createMockQuest({ id: 'quest-1' });

      container.setAvailableQuests([quest]);
      container.executeQuestAcceptDirect(quest);

      expect(container.getAcceptedQuestCount()).toBe(3);
    });

    it('受注後に該当依頼が除外リストに追加される', () => {
      const quests = [
        createMockQuest({ id: 'quest-1' }),
        createMockQuest({ id: 'quest-2' }),
      ];

      container.setAvailableQuests(quests);
      container.executeQuestAcceptDirect(quests[0]);

      const displayed = container.getDisplayQuests();
      expect(displayed.length).toBe(1);
      expect(displayed[0].id).toBe('quest-2');
    });
  });
});
