/**
 * ランクマスターデータのテスト
 */

import { describe, it, expect } from 'vitest';
import { IGuildRank } from '@domain/rank/Rank';
import { GuildRank, SpecialRuleType, Quality } from '@domain/common/types';

// テスト用にJSONファイルを直接インポート
import ranksData from '../../../data/master/ranks.json';

describe('RankMaster', () => {
  const ranks = ranksData as IGuildRank[];

  it('全8ランクが定義されている', () => {
    expect(ranks).toHaveLength(8);
  });

  it('ランクのスキーマが正しい', () => {
    for (const rank of ranks) {
      expect(rank).toHaveProperty('id');
      expect(rank).toHaveProperty('name');
      expect(rank).toHaveProperty('maxPromotionGauge');
      expect(rank).toHaveProperty('dayLimit');
      expect(rank).toHaveProperty('specialRules');
      expect(rank).toHaveProperty('promotionTest');
      expect(rank).toHaveProperty('unlockedGatheringCards');
      expect(rank).toHaveProperty('unlockedRecipeCards');
    }
  });

  it('ランクIDが正しい順序で定義されている', () => {
    const expectedRanks = [
      GuildRank.G,
      GuildRank.F,
      GuildRank.E,
      GuildRank.D,
      GuildRank.C,
      GuildRank.B,
      GuildRank.A,
      GuildRank.S,
    ];
    for (let i = 0; i < expectedRanks.length; i++) {
      expect(ranks[i].id).toBe(expectedRanks[i]);
    }
  });

  it('昇格ゲージ最大値が正の数である', () => {
    for (const rank of ranks) {
      expect(rank.maxPromotionGauge).toBeGreaterThan(0);
    }
  });

  it('制限日数が正の数である', () => {
    for (const rank of ranks) {
      expect(rank.dayLimit).toBeGreaterThan(0);
    }
  });

  it('ランクが上がるほど昇格ゲージ最大値が増加する傾向にある', () => {
    // GからSに向かって基本的に昇格ゲージが増加または同値
    for (let i = 0; i < ranks.length - 1; i++) {
      expect(ranks[i + 1].maxPromotionGauge).toBeGreaterThanOrEqual(
        ranks[i].maxPromotionGauge
      );
    }
  });

  describe('特殊ルール', () => {
    it('特殊ルールが配列である', () => {
      for (const rank of ranks) {
        expect(Array.isArray(rank.specialRules)).toBe(true);
      }
    });

    it('特殊ルールのスキーマが正しい', () => {
      for (const rank of ranks) {
        for (const rule of rank.specialRules) {
          expect(rule).toHaveProperty('type');
          expect(rule).toHaveProperty('description');
          expect(Object.values(SpecialRuleType)).toContain(rule.type);
        }
      }
    });

    it('QUALITY_PENALTYルールにはconditionが設定されている', () => {
      for (const rank of ranks) {
        for (const rule of rank.specialRules) {
          if (rule.type === SpecialRuleType.QUALITY_PENALTY) {
            expect(rule.condition).toBeDefined();
            expect(Object.values(Quality)).toContain(rule.condition);
          }
        }
      }
    });
  });

  describe('昇格試験', () => {
    it('Sランク以外は昇格試験が設定されている', () => {
      const nonSRanks = ranks.filter((r) => r.id !== GuildRank.S);
      for (const rank of nonSRanks) {
        expect(rank.promotionTest).not.toBeNull();
      }
    });

    it('Sランクは昇格試験がnullである', () => {
      const sRank = ranks.find((r) => r.id === GuildRank.S);
      expect(sRank?.promotionTest).toBeNull();
    });

    it('昇格試験の要件が正しいスキーマを持つ', () => {
      const ranksWithTest = ranks.filter((r) => r.promotionTest !== null);
      for (const rank of ranksWithTest) {
        expect(rank.promotionTest?.requirements).toBeDefined();
        expect(Array.isArray(rank.promotionTest?.requirements)).toBe(true);
        expect(rank.promotionTest?.dayLimit).toBeGreaterThan(0);

        for (const req of rank.promotionTest!.requirements) {
          expect(req).toHaveProperty('itemId');
          expect(req).toHaveProperty('quantity');
          expect(req.quantity).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('解放カード', () => {
    it('解放採取地カードが配列である', () => {
      for (const rank of ranks) {
        expect(Array.isArray(rank.unlockedGatheringCards)).toBe(true);
      }
    });

    it('解放レシピカードが配列である', () => {
      for (const rank of ranks) {
        expect(Array.isArray(rank.unlockedRecipeCards)).toBe(true);
      }
    });

    it('Gランクには初期採取地カードが解放されている', () => {
      const gRank = ranks.find((r) => r.id === GuildRank.G);
      expect(gRank?.unlockedGatheringCards.length).toBeGreaterThan(0);
    });

    it('Gランクには初期レシピカードが解放されている', () => {
      const gRank = ranks.find((r) => r.id === GuildRank.G);
      expect(gRank?.unlockedRecipeCards.length).toBeGreaterThan(0);
    });
  });

  it('全ランクの名前がユニークである', () => {
    const names = ranks.map((r) => r.name);
    const uniqueNames = [...new Set(names)];
    expect(uniqueNames).toHaveLength(names.length);
  });
});
