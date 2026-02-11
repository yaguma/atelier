/**
 * quest-types.test.ts - features/quest/types エクスポートテスト
 *
 * TASK-0080: features/quest/types作成
 * 型定義が正しくエクスポートされていることを確認する
 */

import type {
  Client,
  ClientDialogue,
  ClientPersonality,
  DailyQuestResult,
  DeliveryResult,
  FailedQuest,
  IActiveQuest,
  IClient,
  IQuest,
  IQuestCondition,
  IQuestService,
  QuestDifficulty,
  RewardCardCandidate,
} from '@features/quest/types';
import {
  ClientType,
  GuildRank,
  Quality,
  QuestType,
  Rarity,
  toCardId,
  toClientId,
  toQuestId,
} from '@shared/types';
import { describe, expect, it } from 'vitest';

describe('features/quest/types', () => {
  describe('IQuest型', () => {
    it('@features/quest/typesからIQuestがインポートできること', () => {
      const quest: IQuest = {
        id: toQuestId('quest-001'),
        clientId: toClientId('client-001'),
        condition: {
          type: QuestType.SPECIFIC,
          itemId: 'item-001',
        },
        contribution: 100,
        gold: 200,
        deadline: 3,
        difficulty: 'normal',
        flavorText: 'テスト依頼',
      };
      expect(quest.id).toBe('quest-001');
      expect(quest.clientId).toBe('client-001');
      expect(quest.contribution).toBe(100);
      expect(quest.gold).toBe(200);
    });
  });

  describe('IQuestCondition型', () => {
    it('SPECIFIC条件を作成できること', () => {
      const condition: IQuestCondition = {
        type: QuestType.SPECIFIC,
        itemId: 'item-001',
      };
      expect(condition.type).toBe(QuestType.SPECIFIC);
      expect(condition.itemId).toBe('item-001');
    });

    it('QUALITY条件を作成できること', () => {
      const condition: IQuestCondition = {
        type: QuestType.QUALITY,
        minQuality: Quality.B,
      };
      expect(condition.type).toBe(QuestType.QUALITY);
      expect(condition.minQuality).toBe(Quality.B);
    });

    it('COMPOUND条件（サブ条件付き）を作成できること', () => {
      const condition: IQuestCondition = {
        type: QuestType.COMPOUND,
        subConditions: [
          { type: QuestType.SPECIFIC, itemId: 'item-001' },
          { type: QuestType.QUALITY, minQuality: Quality.A },
        ],
      };
      expect(condition.type).toBe(QuestType.COMPOUND);
      expect(condition.subConditions).toHaveLength(2);
    });
  });

  describe('QuestDifficulty型', () => {
    it('有効な難易度値を設定できること', () => {
      const difficulties: QuestDifficulty[] = ['easy', 'normal', 'hard'];
      expect(difficulties).toHaveLength(3);
      expect(difficulties).toContain('easy');
      expect(difficulties).toContain('normal');
      expect(difficulties).toContain('hard');
    });
  });

  describe('IActiveQuest型', () => {
    it('IActiveQuestオブジェクトを作成できること', () => {
      const activeQuest: IActiveQuest = {
        quest: {
          id: toQuestId('quest-001'),
          clientId: toClientId('client-001'),
          condition: { type: QuestType.SPECIFIC, itemId: 'item-001' },
          contribution: 100,
          gold: 200,
          deadline: 3,
          difficulty: 'normal',
          flavorText: 'テスト',
        },
        client: {
          id: toClientId('client-001'),
          name: 'テスト依頼者',
          type: ClientType.VILLAGER,
          contributionMultiplier: 1.0,
          goldMultiplier: 1.0,
          deadlineModifier: 0,
          preferredQuestTypes: [QuestType.SPECIFIC],
          unlockRank: GuildRank.G,
        },
        remainingDays: 2,
        acceptedDay: 1,
      };
      expect(activeQuest.remainingDays).toBe(2);
      expect(activeQuest.acceptedDay).toBe(1);
    });
  });

  describe('IClient型', () => {
    it('IClientオブジェクトを作成できること', () => {
      const client: IClient = {
        id: toClientId('client-001'),
        name: 'テスト依頼者',
        type: ClientType.MERCHANT,
        contributionMultiplier: 1.2,
        goldMultiplier: 0.8,
        deadlineModifier: 1,
        preferredQuestTypes: [QuestType.QUALITY, QuestType.SPECIFIC],
        unlockRank: GuildRank.E,
      };
      expect(client.id).toBe('client-001');
      expect(client.name).toBe('テスト依頼者');
      expect(client.type).toBe(ClientType.MERCHANT);
      expect(client.contributionMultiplier).toBe(1.2);
    });

    it('dialoguePatternsがオプションであること', () => {
      const clientWithDialogue: IClient = {
        id: toClientId('client-002'),
        name: '話す依頼者',
        type: ClientType.NOBLE,
        contributionMultiplier: 1.5,
        goldMultiplier: 1.5,
        deadlineModifier: -1,
        preferredQuestTypes: [QuestType.QUALITY],
        unlockRank: GuildRank.C,
        dialoguePatterns: ['こんにちは', 'ありがとう'],
      };
      expect(clientWithDialogue.dialoguePatterns).toHaveLength(2);
    });
  });

  describe('Client型', () => {
    it('Client型オブジェクトを作成できること', () => {
      const client: Client = {
        id: toClientId('client-001'),
        name: 'テスト依頼者',
        title: '村人',
        portrait: 'villager.png',
        personality: 'easygoing',
        preferredQualities: ['B', 'A'],
      };
      expect(client.id).toBe('client-001');
      expect(client.title).toBe('村人');
      expect(client.portrait).toBe('villager.png');
      expect(client.personality).toBe('easygoing');
    });
  });

  describe('ClientPersonality型', () => {
    it('有効な性格値を設定できること', () => {
      const personalities: ClientPersonality[] = ['demanding', 'generous', 'picky', 'easygoing'];
      expect(personalities).toHaveLength(4);
    });
  });

  describe('ClientDialogue型', () => {
    it('ClientDialogueオブジェクトを作成できること', () => {
      const dialogue: ClientDialogue = {
        greeting: 'こんにちは！',
        accept: 'よろしくお願いします',
        reject: '残念です',
        deliverySuccess: 'ありがとう！',
        deliveryFail: 'これでは困ります',
      };
      expect(dialogue.greeting).toBe('こんにちは！');
      expect(dialogue.deliverySuccess).toBe('ありがとう！');
    });
  });

  describe('IQuestService型', () => {
    it('@features/quest/typesからIQuestServiceがインポートできること', () => {
      const _typeCheck: IQuestService | undefined = undefined;
      expect(_typeCheck).toBeUndefined();
    });
  });

  describe('DeliveryResult型', () => {
    it('DeliveryResultオブジェクトを作成できること', () => {
      const result: DeliveryResult = {
        success: true,
        contribution: 150,
        gold: 300,
        rewardCards: [],
        consumedItems: [],
      };
      expect(result.success).toBe(true);
      expect(result.contribution).toBe(150);
      expect(result.gold).toBe(300);
    });

    it('RewardCardCandidate付きDeliveryResultを作成できること', () => {
      const result: DeliveryResult = {
        success: true,
        contribution: 200,
        gold: 400,
        rewardCards: [
          {
            cardId: toCardId('card-001'),
            rarity: Rarity.RARE,
            reason: 'quest_type',
          },
        ],
        consumedItems: [],
      };
      expect(result.rewardCards).toHaveLength(1);
      expect(result.rewardCards[0]?.reason).toBe('quest_type');
    });
  });

  describe('RewardCardCandidate型', () => {
    it('RewardCardCandidateオブジェクトを作成できること', () => {
      const candidate: RewardCardCandidate = {
        cardId: toCardId('card-001'),
        rarity: Rarity.UNCOMMON,
        reason: 'client_type',
      };
      expect(candidate.cardId).toBe('card-001');
      expect(candidate.rarity).toBe(Rarity.UNCOMMON);
      expect(candidate.reason).toBe('client_type');
    });
  });

  describe('DailyQuestResult型', () => {
    it('DailyQuestResultオブジェクトを作成できること', () => {
      const result: DailyQuestResult = {
        clients: [],
        quests: [],
      };
      expect(result.clients).toEqual([]);
      expect(result.quests).toEqual([]);
    });
  });

  describe('FailedQuest型', () => {
    it('FailedQuestオブジェクトを作成できること', () => {
      const failed: FailedQuest = {
        quest: {
          id: toQuestId('quest-001'),
          clientId: toClientId('client-001'),
          condition: { type: QuestType.SPECIFIC, itemId: 'item-001' },
          contribution: 100,
          gold: 200,
          deadline: 0,
          difficulty: 'normal',
          flavorText: '期限切れ',
        },
        reason: 'deadline_expired',
      };
      expect(failed.reason).toBe('deadline_expired');
      expect(failed.quest.deadline).toBe(0);
    });
  });

  describe('index.tsバレルエクスポート', () => {
    it('すべての型が@features/quest/typesから一括インポートできること', async () => {
      const mod = await import('@features/quest/types');
      // モジュールが正常にインポートできることを確認
      expect(mod).toBeDefined();
    });
  });
});
