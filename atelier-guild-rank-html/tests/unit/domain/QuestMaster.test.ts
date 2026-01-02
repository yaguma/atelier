import { describe, it, expect } from 'vitest';
import { QuestType, GuildRank } from '../../../src/domain/common/types';
import { IQuestTemplate } from '../../../src/domain/quest/Quest';

// テスト用にJSONファイルを直接インポート
import quests from '../../../data/master/quests.json';

describe('QuestMaster', () => {
  const questList = quests as IQuestTemplate[];

  it('依頼が定義されている', () => {
    expect(questList.length).toBeGreaterThan(0);
  });

  it('依頼のスキーマが正しい', () => {
    questList.forEach((quest) => {
      // 必須フィールドの存在チェック
      expect(quest.id).toBeDefined();
      expect(typeof quest.id).toBe('string');
      expect(Object.values(QuestType)).toContain(quest.type);
      expect(['easy', 'normal', 'hard', 'extreme']).toContain(quest.difficulty);
      expect(typeof quest.baseContribution).toBe('number');
      expect(typeof quest.baseGold).toBe('number');
      expect(typeof quest.baseDeadline).toBe('number');
      expect(Object.values(GuildRank)).toContain(quest.unlockRank);
    });
  });

  it('難易度が1-5相当の範囲である（easy/normal/hard/extreme）', () => {
    const validDifficulties = ['easy', 'normal', 'hard', 'extreme'];
    questList.forEach((quest) => {
      expect(validDifficulties).toContain(quest.difficulty);
    });
  });

  it('必要アイテムが正しく定義されている（conditionTemplate）', () => {
    questList.forEach((quest) => {
      expect(quest.conditionTemplate).toBeDefined();
      // SPECIFIC typeの場合はitemIdが必要
      if (quest.type === QuestType.SPECIFIC) {
        expect(quest.conditionTemplate.itemId).toBeDefined();
      }
    });
  });

  it('報酬（ゴールド）が正の数である', () => {
    questList.forEach((quest) => {
      expect(quest.baseGold).toBeGreaterThan(0);
    });
  });

  it('報酬（貢献度）が正の数である', () => {
    questList.forEach((quest) => {
      expect(quest.baseContribution).toBeGreaterThan(0);
    });
  });

  it('解放ランクが正しい', () => {
    questList.forEach((quest) => {
      expect(Object.values(GuildRank)).toContain(quest.unlockRank);
    });
  });

  describe('ランク別依頼', () => {
    it('Gランク依頼が存在する', () => {
      const gRankQuests = questList.filter((q) => q.unlockRank === GuildRank.G);
      expect(gRankQuests.length).toBeGreaterThan(0);
    });

    it('Fランク依頼が存在する', () => {
      const fRankQuests = questList.filter((q) => q.unlockRank === GuildRank.F);
      expect(fRankQuests.length).toBeGreaterThan(0);
    });

    it('Eランク依頼が存在する', () => {
      const eRankQuests = questList.filter((q) => q.unlockRank === GuildRank.E);
      expect(eRankQuests.length).toBeGreaterThan(0);
    });
  });

  describe('依頼タイプ', () => {
    it('複数の依頼タイプが存在する', () => {
      const questTypes = new Set(questList.map((q) => q.type));
      expect(questTypes.size).toBeGreaterThanOrEqual(2);
    });
  });

  it('全依頼のIDがユニークである', () => {
    const ids = questList.map((q) => q.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('期限（日数）が正の数である', () => {
    questList.forEach((quest) => {
      expect(quest.baseDeadline).toBeGreaterThan(0);
    });
  });
});
