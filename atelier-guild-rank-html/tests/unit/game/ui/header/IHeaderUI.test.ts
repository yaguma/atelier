/**
 * IHeaderUIインターフェーステスト
 *
 * IHeaderUIインターフェースの型定義テスト
 */

import { describe, it, expect } from 'vitest';
import type {
  IHeaderUI,
  HeaderUIData,
  HeaderUIOptions,
} from '../../../../../src/game/ui/header/IHeaderUI';
import { GuildRank } from '../../../../../src/domain/common/types';

describe('IHeaderUI インターフェース', () => {
  describe('HeaderUIData', () => {
    it('必須フィールドを含むデータを作成できる', () => {
      const data: HeaderUIData = {
        rank: GuildRank.G,
        currentExp: 50,
        requiredExp: 100,
        currentDay: 1,
        maxDay: 30,
        gold: 1000,
        currentAP: 3,
        maxAP: 3,
      };

      expect(data.rank).toBe(GuildRank.G);
      expect(data.currentExp).toBe(50);
      expect(data.requiredExp).toBe(100);
      expect(data.currentDay).toBe(1);
      expect(data.maxDay).toBe(30);
      expect(data.gold).toBe(1000);
      expect(data.currentAP).toBe(3);
      expect(data.maxAP).toBe(3);
    });

    it('すべてのギルドランクで作成できる', () => {
      const ranks = [
        GuildRank.G,
        GuildRank.F,
        GuildRank.E,
        GuildRank.D,
        GuildRank.C,
        GuildRank.B,
        GuildRank.A,
        GuildRank.S,
      ];

      ranks.forEach((rank) => {
        const data: HeaderUIData = {
          rank,
          currentExp: 0,
          requiredExp: 100,
          currentDay: 1,
          maxDay: 30,
          gold: 0,
          currentAP: 3,
          maxAP: 3,
        };
        expect(data.rank).toBe(rank);
      });
    });
  });

  describe('HeaderUIOptions', () => {
    it('空のオプションを作成できる', () => {
      const options: HeaderUIOptions = {};
      expect(options).toBeDefined();
    });

    it('すべてのオプションを指定できる', () => {
      const onMenuClick = () => {};
      const options: HeaderUIOptions = {
        x: 0,
        y: 0,
        width: 1280,
        onMenuClick,
      };

      expect(options.x).toBe(0);
      expect(options.y).toBe(0);
      expect(options.width).toBe(1280);
      expect(options.onMenuClick).toBe(onMenuClick);
    });

    it('部分的なオプションを指定できる', () => {
      const options: HeaderUIOptions = {
        width: 1024,
      };

      expect(options.width).toBe(1024);
      expect(options.x).toBeUndefined();
      expect(options.y).toBeUndefined();
    });
  });

  describe('IHeaderUI', () => {
    it('インターフェースが正しく定義されている（型チェック）', () => {
      const mockHeaderUI: IHeaderUI = {
        container: {} as any,
        updateAll: () => {},
        updateRank: () => {},
        updateExp: () => {},
        updateDay: () => {},
        updateGold: () => {},
        updateAP: () => {},
        animateExpGain: () => {},
        animateGoldChange: () => {},
        animateAPChange: () => {},
        animateDayAdvance: () => Promise.resolve(),
        showAPInsufficient: () => {},
        setVisible: () => {},
        destroy: () => {},
      };

      expect(mockHeaderUI).toBeDefined();
      expect(typeof mockHeaderUI.updateAll).toBe('function');
      expect(typeof mockHeaderUI.updateRank).toBe('function');
      expect(typeof mockHeaderUI.updateExp).toBe('function');
      expect(typeof mockHeaderUI.updateDay).toBe('function');
      expect(typeof mockHeaderUI.updateGold).toBe('function');
      expect(typeof mockHeaderUI.updateAP).toBe('function');
      expect(typeof mockHeaderUI.animateExpGain).toBe('function');
      expect(typeof mockHeaderUI.animateGoldChange).toBe('function');
      expect(typeof mockHeaderUI.animateAPChange).toBe('function');
      expect(typeof mockHeaderUI.animateDayAdvance).toBe('function');
      expect(typeof mockHeaderUI.showAPInsufficient).toBe('function');
      expect(typeof mockHeaderUI.setVisible).toBe('function');
      expect(typeof mockHeaderUI.destroy).toBe('function');
    });
  });
});
