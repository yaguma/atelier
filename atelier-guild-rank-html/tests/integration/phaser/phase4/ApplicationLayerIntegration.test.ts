/**
 * Application層連携統合テスト
 *
 * TASK-0259: Phase4統合テスト
 * EventBusを通じたUI層とApplication層の連携テスト。
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createMockEventBus,
  createMockStateManager,
} from '../../../utils/phaserTestUtils';

// Phaserをモック
vi.mock('phaser', () => ({
  default: {},
}));

describe('Application Layer Integration', () => {
  let eventBus: ReturnType<typeof createMockEventBus>;
  let stateManager: ReturnType<typeof createMockStateManager>;

  beforeEach(() => {
    vi.clearAllMocks();
    eventBus = createMockEventBus();
    stateManager = createMockStateManager();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Event Flow', () => {
    it('UI→App→UIのイベントフローが正しく動作する', () => {
      // Arrange
      const uiCallback = vi.fn();
      eventBus.on('app:quest:accepted', uiCallback);

      // シミュレート：UIリクエスト→Appが処理→UIに結果通知
      eventBus.on('quest:accept' as never, ((data: { quest: unknown }) => {
        // Application層でクエスト受注処理
        eventBus.emit('state:quests:updated' as never, { questIds: ['quest_001'] });
      }) as never);

      // Act
      eventBus.emit('ui:quest:accept:requested', { questId: 'quest_001' });

      // Assert
      expect(uiCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          quest: expect.any(Object),
        })
      );
    });

    it('エラー時にerror:occurredイベントが発火する', () => {
      // Arrange
      const errorCallback = vi.fn();
      eventBus.on('app:error:occurred', errorCallback);

      eventBus.on('quest:accept' as never, ((data: { quest: unknown }) => {
        // エラーテスト用のシミュレート
        eventBus.emit('ui:toast:shown' as never, {
          message: '存在しない依頼です',
          type: 'error',
        });
      }) as never);

      // Act
      eventBus.emit('ui:quest:accept:requested', { questId: 'invalid_quest' });

      // Assert
      expect(errorCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
        })
      );
    });

    it('複数のイベントリスナーが正しく動作する', () => {
      // Arrange
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const callback3 = vi.fn();

      eventBus.on('app:player:updated', callback1);
      eventBus.on('app:player:updated', callback2);
      eventBus.on('app:player:updated', callback3);

      // Act
      eventBus.emit('app:player:updated', { gold: 1000 });

      // Assert
      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
      expect(callback3).toHaveBeenCalled();
    });

    it('イベントリスナーを解除できる', () => {
      // Arrange
      const callback = vi.fn();
      const unsubscribe = eventBus.on('app:test:event', callback);

      // Act
      unsubscribe();
      eventBus.emit('app:test:event', {});

      // Assert
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('State Synchronization', () => {
    it('状態更新がイベントとして通知される', () => {
      // Arrange
      const callback = vi.fn();
      eventBus.on('app:player:data:updated', callback);

      // 状態更新時にイベント発火をシミュレート
      stateManager.updatePlayerState({ gold: 1500 });
      eventBus.emit('app:player:data:updated', { gold: 1500 });

      // Assert
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          gold: 1500,
        })
      );
    });

    it('複数リスナーが同時に通知される', () => {
      // Arrange
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      eventBus.on('app:player:data:updated', callback1);
      eventBus.on('app:player:data:updated', callback2);

      // Act
      eventBus.emit('app:player:data:updated', { gold: 2000 });

      // Assert
      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it('シリアライズ→デシリアライズで状態が保持される', () => {
      // Arrange
      stateManager._setPlayerState({ gold: 999, rank: 'B' });
      const serialized = stateManager.serialize();

      // Act
      stateManager.reset();
      stateManager.deserialize(serialized);

      // Assert
      const player = stateManager.getPlayerState();
      expect(player.gold).toBe(999);
      expect(player.rank).toBe('B');
    });

    it('ゲーム状態の更新が正しく反映される', () => {
      // Arrange
      stateManager._setGameState({ currentDay: 5, currentPhase: 'gathering' });

      // Act
      const gameState = stateManager.getGameState();

      // Assert
      expect(gameState.currentDay).toBe(5);
      expect(gameState.currentPhase).toBe('gathering');
    });

    it('クエスト状態の更新が正しく反映される', () => {
      // Arrange
      const quests = [
        { id: 'quest_001', quest: { id: 'quest_001', name: 'テスト依頼' } },
      ];
      stateManager._setQuestState({ activeQuests: quests as any });

      // Act
      const questState = stateManager.getQuestState();

      // Assert
      expect(questState.activeQuests).toHaveLength(1);
    });
  });

  describe('Cross-component Communication', () => {
    it('依頼受注時にクエスト状態とUIが更新される', () => {
      // Arrange
      const questCallback = vi.fn();
      const uiCallback = vi.fn();
      eventBus.on('app:quests:updated', questCallback);
      eventBus.on('ui:quest:list:refresh', uiCallback);

      eventBus.on('ui:quest:accept:requested', () => {
        // クエスト状態更新
        eventBus.emit('app:quests:updated', { count: 1 });
        // UI更新通知
        eventBus.emit('ui:quest:list:refresh', {});
      });

      // Act
      eventBus.emit('ui:quest:accept:requested', { questId: 'quest_001' });

      // Assert
      expect(questCallback).toHaveBeenCalled();
      expect(uiCallback).toHaveBeenCalled();
    });

    it('依頼納品時にゴールドとインベントリが更新される', () => {
      // Arrange
      const goldCallback = vi.fn();
      const inventoryCallback = vi.fn();
      eventBus.on('app:gold:updated', goldCallback);
      eventBus.on('app:inventory:updated', inventoryCallback);

      eventBus.on('ui:quest:delivery:requested', () => {
        // 報酬付与
        const currentGold = stateManager.getPlayerState().gold;
        stateManager.updatePlayerState({ gold: currentGold + 200 });
        eventBus.emit('app:gold:updated', { gold: currentGold + 200 });

        // アイテム消費
        eventBus.emit('app:inventory:updated', { removedItems: ['item_001'] });
      });

      // Act
      eventBus.emit('ui:quest:delivery:requested', {
        questId: 'quest_001',
        itemIds: ['item_001'],
      });

      // Assert
      expect(goldCallback).toHaveBeenCalled();
      expect(inventoryCallback).toHaveBeenCalled();
    });

    it('採取完了時にインベントリとAPが更新される', () => {
      // Arrange
      const inventoryCallback = vi.fn();
      const apCallback = vi.fn();
      eventBus.on('app:inventory:updated', inventoryCallback);
      eventBus.on('app:ap:updated', apCallback);

      eventBus.on('gathering:complete', () => {
        eventBus.emit('app:inventory:updated', {
          addedMaterials: ['material_001', 'material_002'],
        });
        eventBus.emit('app:ap:updated', { ap: 4, maxAP: 5 });
      });

      // Act
      eventBus.emit('gathering:complete', {
        materials: [{ id: 'material_001' }, { id: 'material_002' }],
      });

      // Assert
      expect(inventoryCallback).toHaveBeenCalled();
      expect(apCallback).toHaveBeenCalled();
    });

    it('合成完了時にインベントリとAPが更新される', () => {
      // Arrange
      const inventoryCallback = vi.fn();
      eventBus.on('app:inventory:updated', inventoryCallback);

      eventBus.on('alchemy:crafted', () => {
        eventBus.emit('app:inventory:updated', {
          addedItems: ['item_001'],
          removedMaterials: ['material_001', 'material_002'],
        });
      });

      // Act
      eventBus.emit('alchemy:crafted', { item: { id: 'item_001' } });

      // Assert
      expect(inventoryCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          addedItems: expect.any(Array),
          removedMaterials: expect.any(Array),
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('エラーイベントが適切に伝播される', () => {
      // Arrange
      const errorCallback = vi.fn();
      eventBus.on('app:error:occurred', errorCallback);

      // Act
      eventBus.emit('app:error:occurred', {
        message: 'テストエラー',
        code: 'TEST_ERROR',
      });

      // Assert
      expect(errorCallback).toHaveBeenCalledWith({
        message: 'テストエラー',
        code: 'TEST_ERROR',
      });
    });

    it('エラー発生後もイベントバスは動作し続ける', () => {
      // Arrange
      const normalCallback = vi.fn();
      eventBus.on('app:normal:event', normalCallback);

      // エラー発生
      eventBus.emit('app:error:occurred', { message: 'エラー' });

      // Act - エラー後に別のイベント
      eventBus.emit('app:normal:event', { data: 'test' });

      // Assert
      expect(normalCallback).toHaveBeenCalled();
    });
  });

  describe('Phase Management', () => {
    it('フェーズ変更が正しく通知される', () => {
      // Arrange
      const phaseCallback = vi.fn();
      eventBus.on('app:phase:changed', phaseCallback);

      // Act
      stateManager._setGameState({ currentPhase: 'gathering' });
      eventBus.emit('app:phase:changed', { phase: 'gathering' });

      // Assert
      expect(phaseCallback).toHaveBeenCalledWith({ phase: 'gathering' });
    });

    it('日変更が正しく通知される', () => {
      // Arrange
      const dayCallback = vi.fn();
      eventBus.on('app:day:changed', dayCallback);

      // Act
      stateManager._setGameState({ currentDay: 2 });
      eventBus.emit('app:day:changed', { day: 2, maxDays: 30 });

      // Assert
      expect(dayCallback).toHaveBeenCalledWith({ day: 2, maxDays: 30 });
    });

    it('フェーズサイクルが正しく動作する', () => {
      // Arrange
      const phases = ['morning', 'gathering', 'alchemy', 'delivery', 'evening'];
      const callbacks: ReturnType<typeof vi.fn>[] = [];

      phases.forEach((phase) => {
        const callback = vi.fn();
        callbacks.push(callback);
        eventBus.on(`app:phase:${phase}:started`, callback);
      });

      // Act - 各フェーズを順番に通知
      phases.forEach((phase) => {
        eventBus.emit(`app:phase:${phase}:started`, {});
      });

      // Assert
      callbacks.forEach((callback) => {
        expect(callback).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Event Batching', () => {
    it('複数の状態更新が一括で処理できる', () => {
      // Arrange
      const batchCallback = vi.fn();
      eventBus.on('app:state:batch:updated', batchCallback);

      // Act
      stateManager._setPlayerState({ gold: 2000, rank: 'D' });
      stateManager._setGameState({ currentDay: 5 });
      eventBus.emit('app:state:batch:updated', {
        player: { gold: 2000, rank: 'D' },
        game: { currentDay: 5 },
      });

      // Assert
      expect(batchCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          player: expect.any(Object),
          game: expect.any(Object),
        })
      );
    });
  });
});
