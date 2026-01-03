/**
 * 昇格試験ドメインサービスのテスト
 * TASK-0097: 昇格試験ドメインサービス
 *
 * 昇格試験の課題達成判定、報酬取得をテストする
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  PromotionTestService,
} from '../../../../src/domain/services/PromotionTestService';
import { Quality, GuildRank } from '../../../../src/domain/common/types';
import type { IPromotionTest, IPromotionRequirement } from '../../../../src/domain/rank/Rank';
import type { ICraftedItem } from '../../../../src/domain/item/Item';

describe('PromotionTestService', () => {
  // テスト用昇格試験データ
  const samplePromotionTest: IPromotionTest = {
    requirements: [
      { itemId: 'healing_potion', quantity: 2, minQuality: Quality.C },
      { itemId: 'bomb', quantity: 1, minQuality: Quality.B },
    ],
    dayLimit: 7,
  };

  // テスト用アイテムデータ
  const sampleItemHealing: ICraftedItem = {
    id: 'item_001',
    itemId: 'healing_potion',
    quality: Quality.C,
    attributeValues: [],
    effectValues: [],
    usedMaterials: [],
  };

  const sampleItemBomb: ICraftedItem = {
    id: 'item_003',
    itemId: 'bomb',
    quality: Quality.B,
    attributeValues: [],
    effectValues: [],
    usedMaterials: [],
  };

  let promotionTestService: PromotionTestService;

  beforeEach(() => {
    promotionTestService = new PromotionTestService();
  });

  describe('checkRequirement（課題達成判定）', () => {
    it('要件を満たすアイテムを判定できる', () => {
      const requirement: IPromotionRequirement = {
        itemId: 'healing_potion',
        quantity: 1,
        minQuality: Quality.C,
      };

      const result = promotionTestService.checkRequirement(requirement, [sampleItemHealing]);

      expect(result).toBe(true);
    });

    it('品質が不足している場合は要件を満たさない', () => {
      const requirement: IPromotionRequirement = {
        itemId: 'healing_potion',
        quantity: 1,
        minQuality: Quality.A,
      };

      const result = promotionTestService.checkRequirement(requirement, [sampleItemHealing]);

      expect(result).toBe(false);
    });

    it('数量が不足している場合は要件を満たさない', () => {
      const requirement: IPromotionRequirement = {
        itemId: 'healing_potion',
        quantity: 3,
        minQuality: Quality.C,
      };

      const result = promotionTestService.checkRequirement(requirement, [
        sampleItemHealing,
        sampleItemHealing,
      ]);

      expect(result).toBe(false);
    });

    it('異なるアイテムは要件を満たさない', () => {
      const requirement: IPromotionRequirement = {
        itemId: 'healing_potion',
        quantity: 1,
        minQuality: Quality.C,
      };

      const result = promotionTestService.checkRequirement(requirement, [sampleItemBomb]);

      expect(result).toBe(false);
    });
  });

  describe('checkAllRequirements（全課題達成判定）', () => {
    it('全要件を満たす場合、合格となる', () => {
      const items = [
        { ...sampleItemHealing, id: 'item_001' },
        { ...sampleItemHealing, id: 'item_002' },
        sampleItemBomb,
      ];

      const result = promotionTestService.checkAllRequirements(samplePromotionTest, items);

      expect(result).toBe(true);
    });

    it('一部の要件が不足している場合、不合格となる', () => {
      const items = [
        sampleItemHealing,
        // bombが足りない
      ];

      const result = promotionTestService.checkAllRequirements(samplePromotionTest, items);

      expect(result).toBe(false);
    });

    it('アイテムが空の場合、不合格となる', () => {
      const result = promotionTestService.checkAllRequirements(samplePromotionTest, []);

      expect(result).toBe(false);
    });
  });

  describe('calculateReward（報酬計算）', () => {
    it('Gランクから昇格時の報酬を計算できる', () => {
      const reward = promotionTestService.calculateReward(GuildRank.G);

      expect(reward.gold).toBe(100);
      expect(reward.artifactChoices).toHaveLength(3);
    });

    it('Fランクから昇格時の報酬を計算できる', () => {
      const reward = promotionTestService.calculateReward(GuildRank.F);

      expect(reward.gold).toBe(200);
      expect(reward.artifactChoices).toHaveLength(3);
    });

    it('Eランクから昇格時の報酬を計算できる', () => {
      const reward = promotionTestService.calculateReward(GuildRank.E);

      expect(reward.gold).toBe(300);
      expect(reward.artifactChoices).toHaveLength(3);
    });

    it('より高いランクほど報酬が増える', () => {
      const rewardG = promotionTestService.calculateReward(GuildRank.G);
      const rewardF = promotionTestService.calculateReward(GuildRank.F);
      const rewardE = promotionTestService.calculateReward(GuildRank.E);

      expect(rewardF.gold).toBeGreaterThan(rewardG.gold);
      expect(rewardE.gold).toBeGreaterThan(rewardF.gold);
    });
  });

  describe('getProgress（進捗取得）', () => {
    it('課題の進捗状況を取得できる', () => {
      const items = [
        { ...sampleItemHealing, id: 'item_001' },
        sampleItemBomb,
      ];

      const progress = promotionTestService.getProgress(samplePromotionTest, items);

      expect(progress).toHaveLength(2);
      expect(progress[0].requirement.itemId).toBe('healing_potion');
      expect(progress[0].currentCount).toBe(1);
      expect(progress[0].requiredCount).toBe(2);
      expect(progress[0].isCompleted).toBe(false);

      expect(progress[1].requirement.itemId).toBe('bomb');
      expect(progress[1].currentCount).toBe(1);
      expect(progress[1].requiredCount).toBe(1);
      expect(progress[1].isCompleted).toBe(true);
    });

    it('該当アイテムがない場合、カウントは0', () => {
      const progress = promotionTestService.getProgress(samplePromotionTest, []);

      expect(progress).toHaveLength(2);
      expect(progress[0].currentCount).toBe(0);
      expect(progress[0].isCompleted).toBe(false);
      expect(progress[1].currentCount).toBe(0);
      expect(progress[1].isCompleted).toBe(false);
    });
  });

  describe('consumeItems（アイテム消費）', () => {
    it('試験に使用したアイテムを消費リストに追加できる', () => {
      const items = [
        { ...sampleItemHealing, id: 'item_001' },
        { ...sampleItemHealing, id: 'item_002' },
        sampleItemBomb,
      ];

      const consumed = promotionTestService.consumeItems(samplePromotionTest, items);

      expect(consumed).toHaveLength(3);
      expect(consumed.map((i) => i.id)).toContain('item_001');
      expect(consumed.map((i) => i.id)).toContain('item_002');
      expect(consumed.map((i) => i.id)).toContain('item_003');
    });

    it('要件を満たさないアイテムは消費されない', () => {
      const items = [
        { ...sampleItemHealing, id: 'item_001', quality: Quality.D }, // 品質不足
        sampleItemBomb,
      ];

      const consumed = promotionTestService.consumeItems(samplePromotionTest, items);

      // bombのみ消費される
      expect(consumed).toHaveLength(1);
      expect(consumed[0].id).toBe('item_003');
    });
  });
});
