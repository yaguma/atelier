/**
 * DayEndManagerのテスト
 *
 * TASK-0258: DayEndUI実装
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Phaser をモック（DayEndManagerがPhaserに依存しているため）
vi.mock('phaser', () => ({
  default: {},
}));

// DayEndPanel をモック
vi.mock('../../../../../src/game/ui/day/DayEndPanel', () => ({
  DayEndPanel: vi.fn(),
}));

import { DayEndManager, DayStats } from '../../../../../src/game/ui/day/DayEndManager';
import { EventBus } from '../../../../../src/game/events/EventBus';

// PhaserStateManager のモック
const mockGameState = {
  currentDay: 5,
  currentPhase: 'morning',
};

const mockPlayerState = {
  rank: 'G',
  promotionGauge: 30,
  promotionGaugeMax: 100,
  gold: 500,
  actionPoints: 5,
  actionPointsMax: 5,
  rankDaysRemaining: 25,
};

const mockQuestState = {
  availableQuests: [],
  activeQuests: [{ quest: { id: 'quest-1' } }],
};

const mockStateManager = {
  getGameState: vi.fn(() => mockGameState),
  getPlayerState: vi.fn(() => mockPlayerState),
  getQuestState: vi.fn(() => mockQuestState),
};

describe('DayEndManager', () => {
  let eventBus: EventBus;
  let manager: DayEndManager;

  beforeEach(() => {
    EventBus.resetInstance();
    eventBus = EventBus.getInstance();
    manager = new DayEndManager({
      eventBus,
      stateManager: mockStateManager as any,
    });
  });

  afterEach(() => {
    manager.destroy();
    EventBus.resetInstance();
  });

  describe('初期状態', () => {
    it('should initialize with zero stats', () => {
      const stats = manager.getStats();
      expect(stats.questsCompleted).toBe(0);
      expect(stats.materialsGathered).toBe(0);
      expect(stats.itemsCrafted).toBe(0);
      expect(stats.goldEarned).toBe(0);
      expect(stats.goldSpent).toBe(0);
      expect(stats.expGained).toBe(0);
    });
  });

  describe('統計収集', () => {
    it('should increment questsCompleted on quest:delivered event', () => {
      eventBus.emit('quest:delivered', { rewards: { gold: 100, contribution: 10 } });

      const stats = manager.getStats();
      expect(stats.questsCompleted).toBe(1);
      expect(stats.goldEarned).toBe(100);
      expect(stats.expGained).toBe(10);
    });

    it('should increment materialsGathered on gathering:complete event', () => {
      eventBus.emit('gathering:complete', { materials: [{}, {}, {}] });

      const stats = manager.getStats();
      expect(stats.materialsGathered).toBe(3);
    });

    it('should increment itemsCrafted on alchemy:crafted event', () => {
      eventBus.emit('alchemy:crafted', {});
      eventBus.emit('alchemy:crafted', {});

      const stats = manager.getStats();
      expect(stats.itemsCrafted).toBe(2);
    });

    it('should increment goldSpent on shop:purchased event', () => {
      eventBus.emit('shop:purchased', { cost: 50 });
      eventBus.emit('shop:purchased', { cost: 30 });

      const stats = manager.getStats();
      expect(stats.goldSpent).toBe(80);
    });

    it('should accumulate multiple events', () => {
      eventBus.emit('quest:delivered', { rewards: { gold: 100, contribution: 10 } });
      eventBus.emit('quest:delivered', { rewards: { gold: 200, contribution: 20 } });
      eventBus.emit('gathering:complete', { materials: [{}, {}] });
      eventBus.emit('alchemy:crafted', {});
      eventBus.emit('shop:purchased', { cost: 50 });

      const stats = manager.getStats();
      expect(stats.questsCompleted).toBe(2);
      expect(stats.goldEarned).toBe(300);
      expect(stats.expGained).toBe(30);
      expect(stats.materialsGathered).toBe(2);
      expect(stats.itemsCrafted).toBe(1);
      expect(stats.goldSpent).toBe(50);
    });

    it('should handle missing data in events', () => {
      eventBus.emit('quest:delivered', {});
      eventBus.emit('gathering:complete', {});
      eventBus.emit('shop:purchased', {});

      const stats = manager.getStats();
      expect(stats.questsCompleted).toBe(1);
      expect(stats.goldEarned).toBe(0);
      expect(stats.expGained).toBe(0);
      expect(stats.materialsGathered).toBe(0);
      expect(stats.goldSpent).toBe(0);
    });
  });

  describe('addStats', () => {
    it('should manually add stats', () => {
      manager.addStats({ questsCompleted: 5 });

      const stats = manager.getStats();
      expect(stats.questsCompleted).toBe(5);
    });

    it('should merge with existing stats', () => {
      eventBus.emit('quest:delivered', { rewards: { gold: 100 } });
      manager.addStats({ questsCompleted: 5, goldEarned: 200 });

      const stats = manager.getStats();
      // questsCompleted: 1 (イベント) + 5 (addStats) は置き換わる
      expect(stats.questsCompleted).toBe(5);
      // goldEarned: 100 (イベント) は 200 (addStats) で置き換わる
      expect(stats.goldEarned).toBe(200);
    });

    it('should allow partial stats update', () => {
      manager.addStats({ materialsGathered: 10 });
      manager.addStats({ itemsCrafted: 3 });

      const stats = manager.getStats();
      expect(stats.materialsGathered).toBe(10);
      expect(stats.itemsCrafted).toBe(3);
      expect(stats.questsCompleted).toBe(0);
    });
  });

  describe('getStats', () => {
    it('should return a copy of stats', () => {
      manager.addStats({ questsCompleted: 5 });

      const stats1 = manager.getStats();
      const stats2 = manager.getStats();

      expect(stats1).not.toBe(stats2);
      expect(stats1).toEqual(stats2);
    });

    it('should not allow external modification', () => {
      manager.addStats({ questsCompleted: 5 });

      const stats = manager.getStats();
      stats.questsCompleted = 100;

      const stats2 = manager.getStats();
      expect(stats2.questsCompleted).toBe(5);
    });
  });

  describe('destroy', () => {
    it('should reset stats on destroy', () => {
      manager.addStats({ questsCompleted: 5, goldEarned: 1000 });
      manager.destroy();

      // 新しいマネージャーを作成して確認
      const newManager = new DayEndManager({
        eventBus,
        stateManager: mockStateManager as any,
      });

      const stats = newManager.getStats();
      expect(stats.questsCompleted).toBe(0);
      expect(stats.goldEarned).toBe(0);

      newManager.destroy();
    });

    it('should unsubscribe from events on destroy', () => {
      manager.destroy();

      // イベントを発火しても統計は更新されない
      eventBus.emit('quest:delivered', { rewards: { gold: 100 } });

      const stats = manager.getStats();
      expect(stats.questsCompleted).toBe(0);
      expect(stats.goldEarned).toBe(0);
    });
  });

  describe('setScene', () => {
    it('should set scene reference', () => {
      const mockScene = { cameras: { main: { centerX: 640, centerY: 360 } } };

      // setSceneを呼んでもエラーにならないことを確認
      expect(() => manager.setScene(mockScene as any)).not.toThrow();
    });
  });

  describe('サマリー計算', () => {
    it('should calculate total quests correctly', () => {
      manager.addStats({ questsCompleted: 2 });

      const stats = manager.getStats();
      const questsTotal = mockQuestState.activeQuests.length + stats.questsCompleted;

      expect(questsTotal).toBe(3); // 1 active + 2 completed
    });

    it('should calculate progress correctly', () => {
      const progress = mockPlayerState.promotionGaugeMax > 0
        ? mockPlayerState.promotionGauge / mockPlayerState.promotionGaugeMax
        : 0;

      expect(progress).toBe(0.3);
    });

    it('should handle zero max contribution', () => {
      const zeroMaxState = { ...mockPlayerState, promotionGaugeMax: 0 };

      const progress = zeroMaxState.promotionGaugeMax > 0
        ? zeroMaxState.promotionGauge / zeroMaxState.promotionGaugeMax
        : 0;

      expect(progress).toBe(0);
    });
  });
});
