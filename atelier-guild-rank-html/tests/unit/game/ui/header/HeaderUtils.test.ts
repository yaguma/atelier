/**
 * HeaderUtils テスト
 *
 * ヘッダーUIユーティリティ関数のテスト
 */

import { describe, it, expect } from 'vitest';
import {
  getRankColor,
  formatGold,
  formatDay,
  formatAP,
  formatExp,
  getRankName,
} from '../../../../../src/game/ui/header/HeaderUtils';
import { RankColors } from '../../../../../src/game/ui/header/HeaderConstants';
import { GuildRank } from '../../../../../src/domain/common/types';

describe('HeaderUtils', () => {
  describe('getRankColor', () => {
    it('各ランクに対応する色を返す', () => {
      expect(getRankColor(GuildRank.G)).toBe(RankColors[GuildRank.G]);
      expect(getRankColor(GuildRank.F)).toBe(RankColors[GuildRank.F]);
      expect(getRankColor(GuildRank.E)).toBe(RankColors[GuildRank.E]);
      expect(getRankColor(GuildRank.D)).toBe(RankColors[GuildRank.D]);
      expect(getRankColor(GuildRank.C)).toBe(RankColors[GuildRank.C]);
      expect(getRankColor(GuildRank.B)).toBe(RankColors[GuildRank.B]);
      expect(getRankColor(GuildRank.A)).toBe(RankColors[GuildRank.A]);
      expect(getRankColor(GuildRank.S)).toBe(RankColors[GuildRank.S]);
    });

    it('Sランクはルビー色', () => {
      expect(getRankColor(GuildRank.S)).toBe(0xff4500);
    });
  });

  describe('formatGold', () => {
    it('10000未満はそのまま表示', () => {
      expect(formatGold(0)).toBe('0');
      expect(formatGold(100)).toBe('100');
      expect(formatGold(1000)).toBe('1,000');
      expect(formatGold(9999)).toBe('9,999');
    });

    it('10000以上100万未満はK単位で表示', () => {
      expect(formatGold(10000)).toBe('10.0K');
      expect(formatGold(12345)).toBe('12.3K');
      expect(formatGold(50000)).toBe('50.0K');
      expect(formatGold(999999)).toBe('1000.0K');
    });

    it('100万以上はM単位で表示', () => {
      expect(formatGold(1000000)).toBe('1.0M');
      expect(formatGold(1500000)).toBe('1.5M');
      expect(formatGold(10000000)).toBe('10.0M');
    });
  });

  describe('formatDay', () => {
    it('現在日数/最大日数の形式で表示', () => {
      expect(formatDay(1, 30)).toBe('Day 1/30');
      expect(formatDay(5, 30)).toBe('Day 5/30');
      expect(formatDay(30, 30)).toBe('Day 30/30');
    });

    it('最大日数が異なっても正しく表示', () => {
      expect(formatDay(10, 60)).toBe('Day 10/60');
      expect(formatDay(1, 7)).toBe('Day 1/7');
    });
  });

  describe('formatAP', () => {
    it('AP 現在/最大の形式で表示', () => {
      expect(formatAP(3, 3)).toBe('AP 3/3');
      expect(formatAP(0, 3)).toBe('AP 0/3');
      expect(formatAP(5, 5)).toBe('AP 5/5');
    });
  });

  describe('formatExp', () => {
    it('現在/必要の形式で表示', () => {
      expect(formatExp(0, 100)).toBe('0/100');
      expect(formatExp(50, 100)).toBe('50/100');
      expect(formatExp(100, 100)).toBe('100/100');
    });
  });

  describe('getRankName', () => {
    it('ランク名を返す', () => {
      expect(getRankName(GuildRank.G)).toBe('ランク G');
      expect(getRankName(GuildRank.F)).toBe('ランク F');
      expect(getRankName(GuildRank.S)).toBe('ランク S');
    });
  });
});
