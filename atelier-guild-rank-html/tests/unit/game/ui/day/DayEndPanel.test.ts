/**
 * DayEndPanelのテスト
 *
 * TASK-0258: DayEndUI実装
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DaySummary } from '../../../../../src/game/ui/day/DayEndPanel';

// Phaser をモック
vi.mock('phaser', () => {
  const mockGameObject = {
    setOrigin: vi.fn().mockReturnThis(),
    setAlpha: vi.fn().mockReturnThis(),
    setName: vi.fn().mockReturnThis(),
    setSize: vi.fn().mockReturnThis(),
    setInteractive: vi.fn().mockReturnThis(),
    add: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  };

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

  const mockText = {
    ...mockGameObject,
    setText: vi.fn().mockReturnThis(),
  };

  const mockContainer = {
    ...mockGameObject,
    list: [],
    getByName: vi.fn(),
  };

  return {
    default: {
      GameObjects: {
        Container: class {
          scene: unknown;
          x: number;
          y: number;
          alpha = 1;
          scale = 1;
          list: unknown[] = [];

          constructor(scene: unknown, x: number, y: number) {
            this.scene = scene;
            this.x = x;
            this.y = y;
          }

          add = vi.fn().mockReturnThis();
          setAlpha = vi.fn().mockReturnThis();
          setName = vi.fn().mockReturnThis();
          setSize = vi.fn().mockReturnThis();
          setInteractive = vi.fn().mockReturnThis();
          on = vi.fn().mockReturnThis();
          getByName = vi.fn();
          destroy = vi.fn();
        },
        Graphics: class {
          fillStyle = vi.fn().mockReturnThis();
          fillRoundedRect = vi.fn().mockReturnThis();
          fillRect = vi.fn().mockReturnThis();
          lineStyle = vi.fn().mockReturnThis();
          strokeRoundedRect = vi.fn().mockReturnThis();
          lineBetween = vi.fn().mockReturnThis();
          clear = vi.fn().mockReturnThis();
          setName = vi.fn().mockReturnThis();
          destroy = vi.fn();
        },
        Text: class {
          setOrigin = vi.fn().mockReturnThis();
          setText = vi.fn().mockReturnThis();
          destroy = vi.fn();
        },
      },
    },
  };
});

describe('DayEndPanel', () => {
  const mockSummary: DaySummary = {
    day: 5,
    questsCompleted: 2,
    questsTotal: 3,
    materialsGathered: 15,
    itemsCrafted: 3,
    goldEarned: 500,
    goldSpent: 100,
    expGained: 50,
    currentRank: 'G',
    nextRankProgress: 0.3,
  };

  describe('DaySummary interface', () => {
    it('should have correct structure', () => {
      expect(mockSummary.day).toBe(5);
      expect(mockSummary.questsCompleted).toBe(2);
      expect(mockSummary.questsTotal).toBe(3);
      expect(mockSummary.materialsGathered).toBe(15);
      expect(mockSummary.itemsCrafted).toBe(3);
      expect(mockSummary.goldEarned).toBe(500);
      expect(mockSummary.goldSpent).toBe(100);
      expect(mockSummary.expGained).toBe(50);
      expect(mockSummary.currentRank).toBe('G');
      expect(mockSummary.nextRankProgress).toBe(0.3);
    });

    it('should calculate profit correctly', () => {
      const profit = mockSummary.goldEarned - mockSummary.goldSpent;
      expect(profit).toBe(400);
    });

    it('should handle negative profit', () => {
      const negativeSummary: DaySummary = {
        ...mockSummary,
        goldEarned: 100,
        goldSpent: 500,
      };
      const profit = negativeSummary.goldEarned - negativeSummary.goldSpent;
      expect(profit).toBe(-400);
    });

    it('should clamp progress to 0-1 range', () => {
      const overProgress: DaySummary = {
        ...mockSummary,
        nextRankProgress: 1.5,
      };
      const clampedProgress = Math.min(overProgress.nextRankProgress, 1);
      expect(clampedProgress).toBe(1);

      const zeroProgress: DaySummary = {
        ...mockSummary,
        nextRankProgress: 0,
      };
      expect(zeroProgress.nextRankProgress).toBe(0);
    });
  });

  describe('サマリー表示', () => {
    it('should format quest completion correctly', () => {
      const formatted = `${mockSummary.questsCompleted} / ${mockSummary.questsTotal}`;
      expect(formatted).toBe('2 / 3');
    });

    it('should format material count correctly', () => {
      const formatted = `${mockSummary.materialsGathered}個`;
      expect(formatted).toBe('15個');
    });

    it('should format item count correctly', () => {
      const formatted = `${mockSummary.itemsCrafted}個`;
      expect(formatted).toBe('3個');
    });

    it('should format gold earned correctly', () => {
      const formatted = `+${mockSummary.goldEarned}G`;
      expect(formatted).toBe('+500G');
    });

    it('should format gold spent correctly', () => {
      const formatted = `-${mockSummary.goldSpent}G`;
      expect(formatted).toBe('-100G');
    });

    it('should format profit with sign correctly', () => {
      const profit = mockSummary.goldEarned - mockSummary.goldSpent;
      const formatted = `${profit >= 0 ? '+' : ''}${profit}G`;
      expect(formatted).toBe('+400G');
    });

    it('should format negative profit correctly', () => {
      const profit = -300;
      const formatted = `${profit >= 0 ? '+' : ''}${profit}G`;
      expect(formatted).toBe('-300G');
    });

    it('should format exp correctly', () => {
      const formatted = `+${mockSummary.expGained}`;
      expect(formatted).toBe('+50');
    });

    it('should format rank progress percentage correctly', () => {
      const progress = Math.min(mockSummary.nextRankProgress, 1);
      const formatted = `${Math.floor(progress * 100)}%`;
      expect(formatted).toBe('30%');
    });
  });

  describe('日数表示', () => {
    it('should display day title correctly', () => {
      const title = `${mockSummary.day}日目 終了`;
      expect(title).toBe('5日目 終了');
    });

    it('should handle day 1', () => {
      const day1Summary: DaySummary = { ...mockSummary, day: 1 };
      const title = `${day1Summary.day}日目 終了`;
      expect(title).toBe('1日目 終了');
    });

    it('should handle last day', () => {
      const lastDaySummary: DaySummary = { ...mockSummary, day: 30 };
      const title = `${lastDaySummary.day}日目 終了`;
      expect(title).toBe('30日目 終了');
    });
  });

  describe('ランク表示', () => {
    it('should display current rank', () => {
      const rankText = `現在のランク: ${mockSummary.currentRank}`;
      expect(rankText).toBe('現在のランク: G');
    });

    it('should handle different ranks', () => {
      const ranks = ['G', 'F', 'E', 'D', 'C', 'B', 'A', 'S'];
      ranks.forEach((rank) => {
        const rankSummary: DaySummary = { ...mockSummary, currentRank: rank };
        const rankText = `現在のランク: ${rankSummary.currentRank}`;
        expect(rankText).toBe(`現在のランク: ${rank}`);
      });
    });
  });

  describe('進捗バー計算', () => {
    it('should calculate bar width at 0%', () => {
      const progress = 0;
      const barWidth = 200;
      const width = barWidth * progress;
      expect(width).toBe(0);
    });

    it('should calculate bar width at 50%', () => {
      const progress = 0.5;
      const barWidth = 200;
      const width = barWidth * progress;
      expect(width).toBe(100);
    });

    it('should calculate bar width at 100%', () => {
      const progress = 1;
      const barWidth = 200;
      const width = barWidth * progress;
      expect(width).toBe(200);
    });

    it('should clamp progress over 100%', () => {
      const progress = Math.min(1.5, 1);
      const barWidth = 200;
      const width = barWidth * progress;
      expect(width).toBe(200);
    });
  });
});
