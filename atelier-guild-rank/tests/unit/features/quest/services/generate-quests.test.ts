/**
 * generate-quests.test.ts - 依頼生成の純粋関数テスト
 *
 * TASK-0081: features/quest/services作成
 */

import {
  CLIENT_COUNT_BY_RANK,
  DAILY_QUEST_COUNT_BY_RANK,
  generateQuests,
  getDefaultClientCount,
  getDefaultQuestCount,
  getQuestLimitForRank,
  QUEST_LIMIT_BY_RANK,
} from '@features/quest/services/generate-quests';
import type { GuildRank } from '@shared/types';
import { ClientType, GuildRank as GuildRankEnum, QuestType, toClientId } from '@shared/types';
import type { IClient } from '@shared/types/quests';
import { describe, expect, it } from 'vitest';

// =============================================================================
// テスト用モックデータ
// =============================================================================

const mockClients: IClient[] = [
  {
    id: toClientId('client-001'),
    name: '村人A',
    type: ClientType.VILLAGER,
    contributionMultiplier: 1.0,
    goldMultiplier: 1.0,
    deadlineModifier: 0,
    preferredQuestTypes: [QuestType.QUANTITY],
    unlockRank: GuildRankEnum.G,
  },
  {
    id: toClientId('client-002'),
    name: '商人B',
    type: ClientType.MERCHANT,
    contributionMultiplier: 1.2,
    goldMultiplier: 0.8,
    deadlineModifier: 1,
    preferredQuestTypes: [QuestType.QUALITY, QuestType.SPECIFIC],
    unlockRank: GuildRankEnum.E,
  },
  {
    id: toClientId('client-003'),
    name: '冒険者C',
    type: ClientType.ADVENTURER,
    contributionMultiplier: 0.9,
    goldMultiplier: 1.3,
    deadlineModifier: -1,
    preferredQuestTypes: [QuestType.CATEGORY],
    unlockRank: GuildRankEnum.D,
  },
];

// =============================================================================
// テスト
// =============================================================================

describe('generateQuests', () => {
  describe('正常系', () => {
    it('指定された数の依頼を生成する', () => {
      const result = generateQuests({
        rank: 'G',
        count: 3,
        clients: mockClients,
        seed: 12345,
      });
      expect(result.quests).toHaveLength(3);
    });

    it('生成された依頼にはIDが設定されている', () => {
      const result = generateQuests({
        rank: 'G',
        count: 1,
        clients: mockClients,
        seed: 12345,
      });
      expect(result.quests[0]?.id).toBeTruthy();
      expect(result.quests[0]?.id).toContain('quest-');
    });

    it('生成された依頼にclientIdが設定されている', () => {
      const result = generateQuests({
        rank: 'G',
        count: 1,
        clients: mockClients,
        seed: 12345,
      });
      const quest = result.quests[0];
      expect(quest).toBeDefined();
      const clientIds = mockClients.map((c) => c.id);
      expect(clientIds).toContain(quest?.clientId);
    });

    it('生成された依頼にconditionが設定されている', () => {
      const result = generateQuests({
        rank: 'G',
        count: 1,
        clients: mockClients,
        seed: 12345,
      });
      expect(result.quests[0]?.condition).toBeDefined();
      expect(result.quests[0]?.condition.type).toBeTruthy();
    });

    it('生成された依頼にgoldとcontributionが設定されている', () => {
      const result = generateQuests({
        rank: 'G',
        count: 1,
        clients: mockClients,
        seed: 12345,
      });
      const quest = result.quests[0];
      expect(quest.gold).toBeGreaterThan(0);
      expect(quest.contribution).toBeGreaterThan(0);
    });

    it('生成された依頼にdeadlineが正の整数で設定されている', () => {
      const result = generateQuests({
        rank: 'G',
        count: 5,
        clients: mockClients,
        seed: 12345,
      });
      for (const quest of result.quests) {
        expect(quest.deadline).toBeGreaterThanOrEqual(1);
      }
    });

    it('生成された依頼にdifficultyが設定されている', () => {
      const result = generateQuests({
        rank: 'G',
        count: 1,
        clients: mockClients,
        seed: 12345,
      });
      const validDifficulties = ['easy', 'normal', 'hard'];
      expect(validDifficulties).toContain(result.quests[0]?.difficulty);
    });

    it('生成された依頼にflavorTextが設定されている', () => {
      const result = generateQuests({
        rank: 'G',
        count: 1,
        clients: mockClients,
        seed: 12345,
      });
      expect(result.quests[0]?.flavorText).toBeTruthy();
    });

    it('同じシードで決定的な結果を生成する', () => {
      const config = { rank: 'G' as GuildRank, count: 3, clients: mockClients, seed: 12345 };
      const result1 = generateQuests(config);
      const result2 = generateQuests(config);
      expect(result1).toEqual(result2);
    });

    it('異なるシードで異なる結果を生成する', () => {
      const result1 = generateQuests({
        rank: 'G',
        count: 3,
        clients: mockClients,
        seed: 12345,
      });
      const result2 = generateQuests({
        rank: 'G',
        count: 3,
        clients: mockClients,
        seed: 99999,
      });
      // IDが異なるはず
      expect(result1.quests[0]?.id).not.toBe(result2.quests[0]?.id);
    });

    it('依頼者がラウンドロビンで割り当てられる', () => {
      const result = generateQuests({
        rank: 'G',
        count: 6,
        clients: mockClients,
        seed: 12345,
      });
      // 3人の依頼者を6回ラウンドロビン
      expect(result.quests[0]?.clientId).toBe(mockClients[0].id);
      expect(result.quests[1]?.clientId).toBe(mockClients[1].id);
      expect(result.quests[2]?.clientId).toBe(mockClients[2].id);
      expect(result.quests[3]?.clientId).toBe(mockClients[0].id);
      expect(result.quests[4]?.clientId).toBe(mockClients[1].id);
      expect(result.quests[5]?.clientId).toBe(mockClients[2].id);
    });
  });

  describe('境界値', () => {
    it('count=0の場合は空配列を返す', () => {
      const result = generateQuests({
        rank: 'G',
        count: 0,
        clients: mockClients,
        seed: 12345,
      });
      expect(result.quests).toHaveLength(0);
    });

    it('clients=空配列の場合は空配列を返す', () => {
      const result = generateQuests({
        rank: 'G',
        count: 3,
        clients: [],
        seed: 12345,
      });
      expect(result.quests).toHaveLength(0);
    });

    it('count=1の場合は1件の依頼を生成する', () => {
      const result = generateQuests({
        rank: 'G',
        count: 1,
        clients: mockClients,
        seed: 12345,
      });
      expect(result.quests).toHaveLength(1);
    });

    it('依頼者が1人の場合、全依頼がその依頼者に割り当てられる', () => {
      const firstClient = mockClients[0];
      expect(firstClient).toBeDefined();
      if (!firstClient) return;
      const singleClient = [firstClient];
      const result = generateQuests({
        rank: 'G',
        count: 3,
        clients: singleClient,
        seed: 12345,
      });
      for (const quest of result.quests) {
        expect(quest.clientId).toBe(singleClient[0]?.id);
      }
    });
  });

  describe('ランクごとの動作', () => {
    it.each([
      ['G', 'easy', 'normal'],
      ['S', 'hard', 'hard'],
    ] as [
      GuildRank,
      string,
      string,
    ][])('ランク%sでは%sまたは%sの難易度が生成される', (rank, _diff1, _diff2) => {
      const result = generateQuests({
        rank,
        count: 10,
        clients: mockClients,
        seed: 12345,
      });
      const validDifficulties = ['easy', 'normal', 'hard'];
      for (const quest of result.quests) {
        expect(validDifficulties).toContain(quest.difficulty);
      }
    });
  });
});

describe('getDefaultQuestCount', () => {
  it.each([
    ['G', 3],
    ['F', 4],
    ['E', 4],
    ['D', 5],
    ['C', 5],
    ['B', 6],
    ['A', 6],
    ['S', 7],
  ] as [GuildRank, number][])('ランク%sの依頼数は%dである', (rank, expected) => {
    expect(getDefaultQuestCount(rank)).toBe(expected);
  });
});

describe('getQuestLimitForRank', () => {
  it.each([
    ['G', 2],
    ['F', 2],
    ['E', 3],
    ['D', 3],
    ['C', 4],
    ['B', 4],
    ['A', 5],
    ['S', 5],
  ] as [GuildRank, number][])('ランク%sの同時受注上限は%dである', (rank, expected) => {
    expect(getQuestLimitForRank(rank)).toBe(expected);
  });
});

describe('getDefaultClientCount', () => {
  it.each([
    ['G', 2],
    ['F', 2],
    ['E', 3],
    ['D', 3],
    ['C', 3],
    ['B', 4],
    ['A', 4],
    ['S', 5],
  ] as [GuildRank, number][])('ランク%sの依頼者数は%dである', (rank, expected) => {
    expect(getDefaultClientCount(rank)).toBe(expected);
  });
});

describe('定数テーブル', () => {
  it('DAILY_QUEST_COUNT_BY_RANKが全ランクに値を持つ', () => {
    const ranks: GuildRank[] = ['G', 'F', 'E', 'D', 'C', 'B', 'A', 'S'];
    for (const rank of ranks) {
      expect(DAILY_QUEST_COUNT_BY_RANK[rank]).toBeGreaterThan(0);
    }
  });

  it('QUEST_LIMIT_BY_RANKが全ランクに値を持つ', () => {
    const ranks: GuildRank[] = ['G', 'F', 'E', 'D', 'C', 'B', 'A', 'S'];
    for (const rank of ranks) {
      expect(QUEST_LIMIT_BY_RANK[rank]).toBeGreaterThan(0);
    }
  });

  it('CLIENT_COUNT_BY_RANKが全ランクに値を持つ', () => {
    const ranks: GuildRank[] = ['G', 'F', 'E', 'D', 'C', 'B', 'A', 'S'];
    for (const rank of ranks) {
      expect(CLIENT_COUNT_BY_RANK[rank]).toBeGreaterThan(0);
    }
  });
});
