/**
 * ゲームイベント定義のテスト
 * TASK-0101: ゲームイベント定義
 *
 * イベントバス/パブサブパターンをテストする
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  GameEvent,
  GameEventType,
  EventBus,
  createEventBus,
  PhaseChangedEvent,
  DayAdvancedEvent,
  QuestAcceptedEvent,
  QuestCompletedEvent,
  ItemCraftedEvent,
  RankUpTestStartedEvent,
  RankUpEvent,
  GameClearEvent,
  GameOverEvent,
} from '../../../../src/domain/events/GameEvents';
import { GamePhase, GuildRank, Quality, ItemCategory } from '../../../../src/domain/common/types';

describe('GameEvents', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = createEventBus();
  });

  describe('イベントを発行できる', () => {
    it('PHASE_CHANGEDイベントを発行できる', () => {
      const handler = vi.fn();
      eventBus.subscribe(GameEventType.PHASE_CHANGED, handler);

      const event: PhaseChangedEvent = {
        type: GameEventType.PHASE_CHANGED,
        payload: { phase: GamePhase.GATHERING },
      };
      eventBus.publish(event);

      expect(handler).toHaveBeenCalledWith(event);
    });

    it('DAY_ADVANCEDイベントを発行できる', () => {
      const handler = vi.fn();
      eventBus.subscribe(GameEventType.DAY_ADVANCED, handler);

      const event: DayAdvancedEvent = {
        type: GameEventType.DAY_ADVANCED,
        payload: { day: 5 },
      };
      eventBus.publish(event);

      expect(handler).toHaveBeenCalledWith(event);
    });

    it('QUEST_ACCEPTEDイベントを発行できる', () => {
      const handler = vi.fn();
      eventBus.subscribe(GameEventType.QUEST_ACCEPTED, handler);

      const event: QuestAcceptedEvent = {
        type: GameEventType.QUEST_ACCEPTED,
        payload: { questId: 'quest_001' },
      };
      eventBus.publish(event);

      expect(handler).toHaveBeenCalledWith(event);
    });

    it('QUEST_COMPLETEDイベントを発行できる', () => {
      const handler = vi.fn();
      eventBus.subscribe(GameEventType.QUEST_COMPLETED, handler);

      const event: QuestCompletedEvent = {
        type: GameEventType.QUEST_COMPLETED,
        payload: {
          questId: 'quest_001',
          reward: { gold: 100, contribution: 50 },
        },
      };
      eventBus.publish(event);

      expect(handler).toHaveBeenCalledWith(event);
    });

    it('ITEM_CRAFTEDイベントを発行できる', () => {
      const handler = vi.fn();
      eventBus.subscribe(GameEventType.ITEM_CRAFTED, handler);

      const event: ItemCraftedEvent = {
        type: GameEventType.ITEM_CRAFTED,
        payload: {
          item: {
            itemId: 'healing_potion',
            name: '回復薬',
            quality: Quality.B,
            category: ItemCategory.MEDICINE,
          },
        },
      };
      eventBus.publish(event);

      expect(handler).toHaveBeenCalledWith(event);
    });

    it('RANK_UP_TEST_STARTEDイベントを発行できる', () => {
      const handler = vi.fn();
      eventBus.subscribe(GameEventType.RANK_UP_TEST_STARTED, handler);

      const event: RankUpTestStartedEvent = {
        type: GameEventType.RANK_UP_TEST_STARTED,
        payload: { fromRank: GuildRank.G, toRank: GuildRank.F },
      };
      eventBus.publish(event);

      expect(handler).toHaveBeenCalledWith(event);
    });

    it('RANK_UPイベントを発行できる', () => {
      const handler = vi.fn();
      eventBus.subscribe(GameEventType.RANK_UP, handler);

      const event: RankUpEvent = {
        type: GameEventType.RANK_UP,
        payload: { newRank: GuildRank.F },
      };
      eventBus.publish(event);

      expect(handler).toHaveBeenCalledWith(event);
    });

    it('GAME_CLEARイベントを発行できる', () => {
      const handler = vi.fn();
      eventBus.subscribe(GameEventType.GAME_CLEAR, handler);

      const event: GameClearEvent = {
        type: GameEventType.GAME_CLEAR,
        payload: {},
      };
      eventBus.publish(event);

      expect(handler).toHaveBeenCalledWith(event);
    });

    it('GAME_OVERイベントを発行できる', () => {
      const handler = vi.fn();
      eventBus.subscribe(GameEventType.GAME_OVER, handler);

      const event: GameOverEvent = {
        type: GameEventType.GAME_OVER,
        payload: { reason: 'ランク維持日数超過' },
      };
      eventBus.publish(event);

      expect(handler).toHaveBeenCalledWith(event);
    });
  });

  describe('イベントを購読できる', () => {
    it('特定のイベントタイプを購読できる', () => {
      const handler = vi.fn();

      eventBus.subscribe(GameEventType.PHASE_CHANGED, handler);

      const event: PhaseChangedEvent = {
        type: GameEventType.PHASE_CHANGED,
        payload: { phase: GamePhase.ALCHEMY },
      };
      eventBus.publish(event);

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('購読していないイベントは受け取らない', () => {
      const handler = vi.fn();

      eventBus.subscribe(GameEventType.PHASE_CHANGED, handler);

      const event: DayAdvancedEvent = {
        type: GameEventType.DAY_ADVANCED,
        payload: { day: 3 },
      };
      eventBus.publish(event);

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('イベント購読を解除できる', () => {
    it('購読解除するとイベントを受け取らない', () => {
      const handler = vi.fn();

      const unsubscribe = eventBus.subscribe(GameEventType.PHASE_CHANGED, handler);

      // 最初のイベントは受け取る
      eventBus.publish({
        type: GameEventType.PHASE_CHANGED,
        payload: { phase: GamePhase.GATHERING },
      });
      expect(handler).toHaveBeenCalledTimes(1);

      // 購読解除
      unsubscribe();

      // 解除後のイベントは受け取らない
      eventBus.publish({
        type: GameEventType.PHASE_CHANGED,
        payload: { phase: GamePhase.ALCHEMY },
      });
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('複数のリスナーに通知できる', () => {
    it('同じイベントタイプに対して複数のリスナーが呼ばれる', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const handler3 = vi.fn();

      eventBus.subscribe(GameEventType.PHASE_CHANGED, handler1);
      eventBus.subscribe(GameEventType.PHASE_CHANGED, handler2);
      eventBus.subscribe(GameEventType.PHASE_CHANGED, handler3);

      const event: PhaseChangedEvent = {
        type: GameEventType.PHASE_CHANGED,
        payload: { phase: GamePhase.DELIVERY },
      };
      eventBus.publish(event);

      expect(handler1).toHaveBeenCalledWith(event);
      expect(handler2).toHaveBeenCalledWith(event);
      expect(handler3).toHaveBeenCalledWith(event);
    });

    it('異なるイベントタイプのリスナーは独立している', () => {
      const phaseHandler = vi.fn();
      const dayHandler = vi.fn();

      eventBus.subscribe(GameEventType.PHASE_CHANGED, phaseHandler);
      eventBus.subscribe(GameEventType.DAY_ADVANCED, dayHandler);

      eventBus.publish({
        type: GameEventType.PHASE_CHANGED,
        payload: { phase: GamePhase.GATHERING },
      });

      expect(phaseHandler).toHaveBeenCalledTimes(1);
      expect(dayHandler).not.toHaveBeenCalled();
    });

    it('部分的に購読解除しても他のリスナーは動作する', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      const unsubscribe1 = eventBus.subscribe(GameEventType.PHASE_CHANGED, handler1);
      eventBus.subscribe(GameEventType.PHASE_CHANGED, handler2);

      // handler1を解除
      unsubscribe1();

      eventBus.publish({
        type: GameEventType.PHASE_CHANGED,
        payload: { phase: GamePhase.ALCHEMY },
      });

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledTimes(1);
    });
  });

  describe('全購読解除', () => {
    it('特定タイプの全リスナーを解除できる', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const dayHandler = vi.fn();

      eventBus.subscribe(GameEventType.PHASE_CHANGED, handler1);
      eventBus.subscribe(GameEventType.PHASE_CHANGED, handler2);
      eventBus.subscribe(GameEventType.DAY_ADVANCED, dayHandler);

      eventBus.unsubscribeAll(GameEventType.PHASE_CHANGED);

      eventBus.publish({
        type: GameEventType.PHASE_CHANGED,
        payload: { phase: GamePhase.GATHERING },
      });
      eventBus.publish({
        type: GameEventType.DAY_ADVANCED,
        payload: { day: 5 },
      });

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
      expect(dayHandler).toHaveBeenCalledTimes(1);
    });

    it('全タイプの全リスナーを解除できる', () => {
      const phaseHandler = vi.fn();
      const dayHandler = vi.fn();

      eventBus.subscribe(GameEventType.PHASE_CHANGED, phaseHandler);
      eventBus.subscribe(GameEventType.DAY_ADVANCED, dayHandler);

      eventBus.unsubscribeAll();

      eventBus.publish({
        type: GameEventType.PHASE_CHANGED,
        payload: { phase: GamePhase.GATHERING },
      });
      eventBus.publish({
        type: GameEventType.DAY_ADVANCED,
        payload: { day: 5 },
      });

      expect(phaseHandler).not.toHaveBeenCalled();
      expect(dayHandler).not.toHaveBeenCalled();
    });
  });

  describe('型安全性', () => {
    it('イベントタイプに応じたペイロードを持つ', () => {
      // TypeScriptの型チェックによりコンパイル時に検証される
      const phaseEvent: PhaseChangedEvent = {
        type: GameEventType.PHASE_CHANGED,
        payload: { phase: GamePhase.GATHERING },
      };
      expect(phaseEvent.type).toBe(GameEventType.PHASE_CHANGED);
      expect(phaseEvent.payload.phase).toBe(GamePhase.GATHERING);

      const dayEvent: DayAdvancedEvent = {
        type: GameEventType.DAY_ADVANCED,
        payload: { day: 10 },
      };
      expect(dayEvent.type).toBe(GameEventType.DAY_ADVANCED);
      expect(dayEvent.payload.day).toBe(10);
    });

    it('GameEvent型はすべてのイベントを含む', () => {
      // discriminated unionとして機能することを確認
      const events: GameEvent[] = [
        { type: GameEventType.PHASE_CHANGED, payload: { phase: GamePhase.QUEST_ACCEPT } },
        { type: GameEventType.DAY_ADVANCED, payload: { day: 1 } },
        { type: GameEventType.QUEST_ACCEPTED, payload: { questId: 'q1' } },
        { type: GameEventType.QUEST_COMPLETED, payload: { questId: 'q1', reward: { gold: 10, contribution: 5 } } },
        { type: GameEventType.ITEM_CRAFTED, payload: { item: { itemId: 'i1', name: 'アイテム', quality: Quality.C, category: ItemCategory.MEDICINE } } },
        { type: GameEventType.RANK_UP_TEST_STARTED, payload: { fromRank: GuildRank.G, toRank: GuildRank.F } },
        { type: GameEventType.RANK_UP, payload: { newRank: GuildRank.F } },
        { type: GameEventType.GAME_CLEAR, payload: {} },
        { type: GameEventType.GAME_OVER, payload: { reason: 'test' } },
      ];

      expect(events).toHaveLength(9);
    });
  });
});
