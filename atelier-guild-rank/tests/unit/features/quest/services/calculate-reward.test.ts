/**
 * calculate-reward.test.ts - 報酬計算の純粋関数テスト
 *
 * TASK-0081: features/quest/services作成
 */

import type { RewardableItem } from '@features/quest/services/calculate-reward';
import {
  calculateAverageQualityMultiplier,
  calculateReward,
} from '@features/quest/services/calculate-reward';
import { QUALITY_REWARD_MULTIPLIER, QUEST_TYPE_CONTRIBUTION_MULTIPLIER } from '@shared/constants';
import type { Quality, QuestType } from '@shared/types';
import {
  ClientType,
  GuildRank,
  QuestType as QuestTypeEnum,
  toClientId,
  toQuestId,
} from '@shared/types';
import type { IClient, IQuest } from '@shared/types/quests';
import { describe, expect, it } from 'vitest';

// =============================================================================
// テスト用モックデータ
// =============================================================================

function createQuest(overrides: Partial<IQuest> = {}): IQuest {
  return {
    id: toQuestId('quest-001'),
    clientId: toClientId('client-001'),
    condition: { type: 'QUANTITY', quantity: 1 },
    contribution: 100,
    gold: 200,
    deadline: 5,
    difficulty: 'normal',
    flavorText: 'テスト依頼',
    ...overrides,
  };
}

function createClient(overrides: Partial<IClient> = {}): IClient {
  return {
    id: toClientId('client-001'),
    name: 'テスト依頼者',
    type: ClientType.VILLAGER,
    contributionMultiplier: 1.0,
    goldMultiplier: 1.0,
    deadlineModifier: 0,
    preferredQuestTypes: [QuestTypeEnum.QUANTITY],
    unlockRank: GuildRank.G,
    ...overrides,
  };
}

function createRewardableItem(overrides: Partial<RewardableItem> = {}): RewardableItem {
  return {
    quality: 'B',
    ...overrides,
  };
}

// =============================================================================
// テスト
// =============================================================================

describe('calculateReward', () => {
  describe('基本的な報酬計算', () => {
    it('品質B、補正なしの場合は基本報酬×1.5になる', () => {
      const quest = createQuest({ gold: 200, contribution: 100 });
      const client = createClient();
      const item = createRewardableItem({ quality: 'B' });

      const result = calculateReward(quest, client, item);

      expect(result.baseGold).toBe(200);
      expect(result.baseContribution).toBe(100);
      expect(result.qualityMultiplier).toBe(1.5);
      expect(result.totalGold).toBe(Math.floor(200 * 1.5));
      expect(result.totalContribution).toBe(Math.floor(100 * 1.5 * 0.7)); // QUANTITY補正
    });

    it('品質Dの場合は基本報酬×0.5になる', () => {
      const quest = createQuest({ gold: 100, contribution: 50 });
      const client = createClient();
      const item = createRewardableItem({ quality: 'D' });

      const result = calculateReward(quest, client, item);

      expect(result.totalGold).toBe(Math.floor(100 * 0.5));
    });

    it('品質Sの場合は基本報酬×3.0になる', () => {
      const quest = createQuest({ gold: 100, contribution: 50 });
      const client = createClient();
      const item = createRewardableItem({ quality: 'S' });

      const result = calculateReward(quest, client, item);

      expect(result.totalGold).toBe(Math.floor(100 * 3.0));
    });
  });

  describe('依頼者補正', () => {
    it('依頼者のゴールド補正が適用される', () => {
      const quest = createQuest({ gold: 100 });
      const client = createClient({ goldMultiplier: 1.5 });
      const item = createRewardableItem({ quality: 'C' }); // 品質C = 1.0倍

      const result = calculateReward(quest, client, item);

      expect(result.clientGoldMultiplier).toBe(1.5);
      expect(result.totalGold).toBe(Math.floor(100 * 1.0 * 1.5));
    });

    it('依頼者の貢献度補正が適用される', () => {
      const quest = createQuest({
        contribution: 100,
        condition: { type: 'SPECIFIC', itemId: 'item-001' },
      });
      const client = createClient({ contributionMultiplier: 1.3 });
      const item = createRewardableItem({ quality: 'C' }); // 品質C = 1.0倍

      const result = calculateReward(quest, client, item);

      expect(result.clientContributionMultiplier).toBe(1.3);
      // SPECIFIC = 1.0倍
      expect(result.totalContribution).toBe(Math.floor(100 * 1.0 * 1.0 * 1.3));
    });
  });

  describe('依頼タイプ補正', () => {
    it.each([
      ['SPECIFIC', 1.0],
      ['CATEGORY', 0.8],
      ['QUALITY', 1.2],
      ['QUANTITY', 0.7],
      ['ATTRIBUTE', 1.3],
      ['EFFECT', 1.3],
      ['MATERIAL', 1.5],
      ['COMPOUND', 1.8],
    ] as [
      QuestType,
      number,
    ][])('依頼タイプ%sの補正値は%fである', (questType, expectedMultiplier) => {
      const quest = createQuest({
        contribution: 100,
        condition: { type: questType },
      });
      const client = createClient();
      const item = createRewardableItem({ quality: 'C' }); // 品質C = 1.0倍

      const result = calculateReward(quest, client, item);

      expect(result.typeMultiplier).toBe(expectedMultiplier);
      expect(result.totalContribution).toBe(Math.floor(100 * 1.0 * expectedMultiplier * 1.0));
    });
  });

  describe('品質ごとの補正値', () => {
    it.each([
      ['D', 0.5],
      ['C', 1.0],
      ['B', 1.5],
      ['A', 2.0],
      ['S', 3.0],
    ] as [Quality, number][])('品質%sの補正値は%fである', (quality, expectedMultiplier) => {
      const quest = createQuest({ gold: 100 });
      const client = createClient();
      const item = createRewardableItem({ quality });

      const result = calculateReward(quest, client, item);

      expect(result.qualityMultiplier).toBe(expectedMultiplier);
      expect(result.totalGold).toBe(Math.floor(100 * expectedMultiplier));
    });
  });

  describe('端数処理', () => {
    it('端数は切り捨てられる', () => {
      const quest = createQuest({ gold: 33, contribution: 33 });
      const client = createClient({ goldMultiplier: 1.1 });
      const item = createRewardableItem({ quality: 'C' }); // 1.0

      const result = calculateReward(quest, client, item);

      // 33 * 1.0 * 1.1 = 36.3 → 36
      expect(result.totalGold).toBe(36);
    });
  });
});

describe('calculateAverageQualityMultiplier', () => {
  it('単一アイテムの場合はその品質の補正値を返す', () => {
    const items: RewardableItem[] = [{ quality: 'A' }];
    expect(calculateAverageQualityMultiplier(items)).toBe(2.0);
  });

  it('複数アイテムの場合は平均補正値を返す', () => {
    const items: RewardableItem[] = [
      { quality: 'D' }, // 0.5
      { quality: 'S' }, // 3.0
    ];
    expect(calculateAverageQualityMultiplier(items)).toBe(1.75); // (0.5 + 3.0) / 2
  });

  it('空配列の場合は0を返す', () => {
    expect(calculateAverageQualityMultiplier([])).toBe(0);
  });

  it('同じ品質のアイテムの場合はその品質の補正値を返す', () => {
    const items: RewardableItem[] = [{ quality: 'B' }, { quality: 'B' }, { quality: 'B' }];
    expect(calculateAverageQualityMultiplier(items)).toBe(1.5);
  });
});

describe('定数テーブル', () => {
  it('QUALITY_REWARD_MULTIPLIERが全品質に値を持つ', () => {
    const qualities: Quality[] = ['D', 'C', 'B', 'A', 'S'];
    for (const quality of qualities) {
      expect(QUALITY_REWARD_MULTIPLIER[quality]).toBeGreaterThan(0);
    }
  });

  it('QUALITY_REWARD_MULTIPLIERが品質の順に増加する', () => {
    expect(QUALITY_REWARD_MULTIPLIER.D).toBeLessThan(QUALITY_REWARD_MULTIPLIER.C);
    expect(QUALITY_REWARD_MULTIPLIER.C).toBeLessThan(QUALITY_REWARD_MULTIPLIER.B);
    expect(QUALITY_REWARD_MULTIPLIER.B).toBeLessThan(QUALITY_REWARD_MULTIPLIER.A);
    expect(QUALITY_REWARD_MULTIPLIER.A).toBeLessThan(QUALITY_REWARD_MULTIPLIER.S);
  });

  it('QUEST_TYPE_CONTRIBUTION_MULTIPLIERが全依頼タイプに値を持つ', () => {
    const types: QuestType[] = [
      'SPECIFIC',
      'CATEGORY',
      'QUALITY',
      'QUANTITY',
      'ATTRIBUTE',
      'EFFECT',
      'MATERIAL',
      'COMPOUND',
    ];
    for (const type of types) {
      expect(QUEST_TYPE_CONTRIBUTION_MULTIPLIER[type]).toBeGreaterThan(0);
    }
  });
});
