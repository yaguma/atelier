/**
 * QuestService テストケース
 * TASK-0013: 依頼エンティティ・QuestService実装
 *
 * @description
 * T-0013-S01 〜 T-0013-S08: 正常系テストケース（8件）
 * T-0013-SE01 〜 T-0013-SE04: 異常系テストケース（4件）
 * T-0013-SB01 〜 T-0013-SB04: 境界値テストケース（4件）
 * 合計: 16件
 */

import { ItemInstance } from '@domain/entities/ItemInstance';
import type { IMasterDataRepository } from '@domain/interfaces/master-data-repository.interface';
import type { IQuestService } from '@domain/interfaces/quest-service.interface';
import type { IEventBus } from '@shared/services/event-bus';
import { QuestService } from '@shared/services/quest-service';
import type {
  CardMaster,
  ClientMaster,
  GuildRank,
  IItem,
  Quality,
  QuestMaster,
} from '@shared/types';
import {
  type Attribute,
  ItemCategory,
  ItemEffectType,
  toCardId,
  toClientId,
  toItemId,
  toQuestId,
} from '@shared/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// =============================================================================
// モックデータ
// =============================================================================

// モック依頼者マスターデータ
const mockClients: ClientMaster[] = [
  {
    id: toClientId('client_villager_01'),
    name: '村人A',
    type: 'VILLAGER',
    contributionMultiplier: 1.0,
    goldMultiplier: 1.0,
    deadlineModifier: 0,
    preferredQuestTypes: ['SPECIFIC', 'QUANTITY'],
    unlockRank: 'G' as GuildRank,
  },
  {
    id: toClientId('client_merchant_01'),
    name: '商人B',
    type: 'MERCHANT',
    contributionMultiplier: 0.8,
    goldMultiplier: 1.5,
    deadlineModifier: -1,
    preferredQuestTypes: ['CATEGORY', 'QUANTITY'],
    unlockRank: 'F' as GuildRank,
  },
  {
    id: toClientId('client_noble_01'),
    name: '貴族C',
    type: 'NOBLE',
    contributionMultiplier: 1.5,
    goldMultiplier: 2.0,
    deadlineModifier: 1,
    preferredQuestTypes: ['QUALITY', 'SPECIFIC'],
    unlockRank: 'D' as GuildRank,
  },
];

// モック依頼テンプレートマスターデータ
const mockQuestTemplates: QuestMaster[] = [
  {
    id: toQuestId('quest_template_01'),
    clientId: toClientId('client_villager_01'),
    condition: { type: 'SPECIFIC', itemId: 'item_potion' },
    contribution: 100,
    gold: 50,
    deadline: 5,
    difficulty: 'normal',
    flavorText: 'ポーションが必要です',
  },
  {
    id: toQuestId('quest_template_02'),
    clientId: toClientId('client_merchant_01'),
    condition: { type: 'CATEGORY', category: ItemCategory.MEDICINE },
    contribution: 80,
    gold: 40,
    deadline: 3,
    difficulty: 'easy',
    flavorText: '薬を探しています',
  },
  {
    id: toQuestId('quest_template_03'),
    clientId: toClientId('client_noble_01'),
    condition: { type: 'QUALITY', minQuality: 'A' as Quality },
    contribution: 200,
    gold: 100,
    deadline: 7,
    difficulty: 'hard',
    flavorText: '最高品質のアイテムを',
  },
];

// モックカードマスターデータ
const mockCards: CardMaster[] = [
  {
    id: toCardId('card_gathering_01'),
    name: '近くの森',
    type: 'GATHERING',
    baseCost: 0,
    presentationCount: 3,
    rareRate: 10,
    materialPool: ['herb', 'mushroom'],
    rarity: 'COMMON',
    unlockRank: 'G' as GuildRank,
    description: '自宅近くの森',
  },
  {
    id: toCardId('card_recipe_01'),
    name: 'ポーション',
    type: 'RECIPE',
    cost: 1,
    requiredMaterials: [],
    outputItemId: 'item_potion',
    category: ItemCategory.MEDICINE,
    rarity: 'COMMON',
    unlockRank: 'G' as GuildRank,
    description: '基本的な回復薬',
  },
];

// モックアイテムマスターデータ
const mockItems: Record<string, IItem> = {
  item_potion: {
    id: toItemId('item_potion'),
    name: 'ポーション',
    category: ItemCategory.MEDICINE,
    description: '基本的な回復薬',
    baseEffects: [{ type: ItemEffectType.HEAL, value: 50 }],
  },
  item_elixir: {
    id: toItemId('item_elixir'),
    name: 'エリクサー',
    category: ItemCategory.MEDICINE,
    description: '高級回復薬',
    baseEffects: [{ type: ItemEffectType.HEAL, value: 100 }],
  },
};

// =============================================================================
// モッククラス
// =============================================================================

// モックMasterDataRepository
class MockMasterDataRepository implements Partial<IMasterDataRepository> {
  private loaded = true;
  private clients = mockClients;
  private quests = mockQuestTemplates;
  private cards = mockCards;

  getAllClients(): ClientMaster[] {
    return this.clients;
  }

  getClientById(id: unknown): ClientMaster | undefined {
    return this.clients.find((c) => c.id === id);
  }

  getAllQuests(): QuestMaster[] {
    return this.quests;
  }

  getQuestById(id: unknown): QuestMaster | undefined {
    return this.quests.find((q) => q.id === id);
  }

  getAllCards(): CardMaster[] {
    return this.cards;
  }

  getCardById(id: unknown): CardMaster | undefined {
    return this.cards.find((c) => c.id === id);
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  setLoaded(loaded: boolean): void {
    this.loaded = loaded;
  }

  setClients(clients: ClientMaster[]): void {
    this.clients = clients;
  }

  setQuests(quests: QuestMaster[]): void {
    this.quests = quests;
  }

  setCards(cards: CardMaster[]): void {
    this.cards = cards;
  }
}

// モックEventBus
class MockEventBus implements Partial<IEventBus> {
  emit = vi.fn();
  on = vi.fn();
  off = vi.fn();
  once = vi.fn();
}

// ヘルパー関数：テスト用ItemInstanceを作成
function createMockItemInstance(
  itemId: string,
  quality: Quality,
  category: ItemCategory = ItemCategory.MEDICINE,
  attributes: Attribute[] = [],
  effects: { type: string; value: number }[] = [],
): ItemInstance {
  const item = mockItems[itemId] || {
    id: toItemId(itemId),
    name: `Item ${itemId}`,
    category,
    description: 'テストアイテム',
    baseEffects: effects.map((e) => ({ type: e.type as unknown, value: e.value })),
  };
  return new ItemInstance(`instance_${Date.now()}`, item as IItem, quality, attributes, effects);
}

// =============================================================================
// テストスイート
// =============================================================================

describe('QuestService', () => {
  let questService: IQuestService;
  let mockMasterDataRepo: MockMasterDataRepository;
  let mockEventBus: IEventBus;

  beforeEach(() => {
    // 【テスト前準備】: 各テスト実行前にQuestServiceを初期化
    mockMasterDataRepo = new MockMasterDataRepository();
    mockEventBus = new MockEventBus() as IEventBus;
    questService = new QuestService(
      mockMasterDataRepo as unknown as IMasterDataRepository,
      mockEventBus,
    );
  });

  // =============================================================================
  // T-0013-S01〜T-0013-S08: 正常系テストケース
  // =============================================================================

  describe('正常系テストケース', () => {
    describe('T-0013-S01: 日次依頼生成（基本動作）', () => {
      it('generateDailyQuests()で依頼者と依頼が生成される', () => {
        // 【テスト目的】: ランクに応じた依頼者と依頼が生成されること
        // 【テスト内容】: Gランクで日次依頼を生成
        // 【期待される動作】: 依頼者2人、依頼3件が生成される
        // 🔵 信頼性レベル: 設計文書に明記

        // 【実際の処理実行】
        const result = questService.generateDailyQuests('G');

        // 【結果検証】
        expect(result.clients).toHaveLength(2); // Gランクでは依頼者2人
        expect(result.quests).toHaveLength(3); // Gランクでは依頼3件
        expect(mockEventBus.emit).toHaveBeenCalledWith(
          'QUEST_GENERATED',
          expect.objectContaining({
            clients: expect.any(Array),
            quests: expect.any(Array),
          }),
        );
      });
    });

    describe('T-0013-S02: 依頼受注（基本動作）', () => {
      it('acceptQuest()で依頼を受注できる', () => {
        // 【テスト目的】: 利用可能な依頼を受注できること
        // 【テスト内容】: 依頼を生成して受注
        // 【期待される動作】: 依頼がアクティブリストに追加される
        // 🔵 信頼性レベル: 設計文書に明記

        // 【テストデータ準備】: 依頼を生成
        const result = questService.generateDailyQuests('G');
        const questId = result.quests[0].id;

        // 【実際の処理実行】
        const accepted = questService.acceptQuest(questId);

        // 【結果検証】
        expect(accepted).toBe(true);
        expect(questService.getActiveQuests()).toHaveLength(1);
        expect(questService.getActiveQuests()[0].quest.id).toBe(questId);
        // Note: QUEST_ACCEPTEDイベントはUI層（QuestAcceptPhaseUI）から発行されるため、
        // QuestServiceではイベント発行しない (Issue #137)
      });
    });

    describe('T-0013-S03: 依頼キャンセル（基本動作）', () => {
      it('cancelQuest()で依頼をキャンセルできる', () => {
        // 【テスト目的】: 受注中の依頼をキャンセルできること
        // 【テスト内容】: 依頼を受注してからキャンセル
        // 【期待される動作】: 依頼がアクティブリストから削除される
        // 🔵 信頼性レベル: 設計文書に明記

        // 【テストデータ準備】: 依頼を生成して受注
        const result = questService.generateDailyQuests('G');
        const questId = result.quests[0].id;
        questService.acceptQuest(questId);

        // 【実際の処理実行】
        questService.cancelQuest(questId);

        // 【結果検証】
        expect(questService.getActiveQuests()).toHaveLength(0);
        expect(mockEventBus.emit).toHaveBeenCalledWith(
          'QUEST_CANCELLED',
          expect.objectContaining({ questId }),
        );
      });
    });

    describe('T-0013-S04: 納品判定（canDeliver）', () => {
      it('canDeliver()でアイテムが条件を満たすか判定できる', () => {
        // 【テスト目的】: アイテムが依頼条件を満たすか判定できること
        // 【テスト内容】: SPECIFIC条件の依頼に対して正しいアイテムで判定
        // 【期待される動作】: 条件を満たす場合true、満たさない場合falseを返す
        // 🔵 信頼性レベル: 設計文書に明記

        // 【テストデータ準備】: SPECIFIC条件の依頼を設定
        mockMasterDataRepo.setQuests([
          {
            id: toQuestId('quest_specific'),
            clientId: toClientId('client_villager_01'),
            condition: { type: 'SPECIFIC', itemId: 'item_potion' },
            contribution: 100,
            gold: 50,
            deadline: 5,
            difficulty: 'normal',
            flavorText: 'ポーションが必要',
          },
        ]);
        const result = questService.generateDailyQuests('G');
        const questId = result.quests[0].id;
        questService.acceptQuest(questId);

        // 正しいアイテム
        const correctItem = createMockItemInstance('item_potion', 'B');
        // 間違ったアイテム
        const wrongItem = createMockItemInstance('item_elixir', 'B');

        // 【結果検証】
        expect(questService.canDeliver(questId, correctItem)).toBe(true);
        expect(questService.canDeliver(questId, wrongItem)).toBe(false);
      });
    });

    describe('T-0013-S05: 納品実行（deliver）', () => {
      it('deliver()で納品して報酬を受け取れる', () => {
        // 【テスト目的】: 条件を満たすアイテムを納品して報酬を受け取れること
        // 【テスト内容】: QUANTITY条件の依頼に対してアイテムを納品
        // 【期待される動作】: 貢献度とゴールドが計算され、依頼が完了する
        // 🔵 信頼性レベル: 設計文書に明記

        // 【テストデータ準備】: QUANTITY条件の依頼を設定
        mockMasterDataRepo.setQuests([
          {
            id: toQuestId('quest_quantity'),
            clientId: toClientId('client_villager_01'),
            condition: { type: 'QUANTITY', quantity: 1 },
            contribution: 100,
            gold: 50,
            deadline: 5,
            difficulty: 'normal',
            flavorText: 'アイテムが必要',
          },
        ]);
        const result = questService.generateDailyQuests('G');
        const questId = result.quests[0].id;
        questService.acceptQuest(questId);

        const item = createMockItemInstance('item_potion', 'B');

        // 【実際の処理実行】
        const deliveryResult = questService.deliver(questId, item);

        // 【結果検証】
        expect(deliveryResult.success).toBe(true);
        expect(deliveryResult.contribution).toBeGreaterThan(0);
        expect(deliveryResult.gold).toBeGreaterThan(0);
        expect(questService.getActiveQuests()).toHaveLength(0);
        expect(mockEventBus.emit).toHaveBeenCalledWith(
          'QUEST_COMPLETED',
          expect.objectContaining({
            quest: expect.any(Object),
            contribution: expect.any(Number),
            gold: expect.any(Number),
          }),
        );
      });
    });

    describe('T-0013-S06: 期限更新（updateDeadlines）', () => {
      it('updateDeadlines()で期限が更新され、期限切れが検出される', () => {
        // 【テスト目的】: 日終了処理で期限が更新されること
        // 【テスト内容】: 期限1日の依頼を受注して期限更新
        // 【期待される動作】: 期限切れで依頼が失敗する
        // 🔵 信頼性レベル: 設計文書に明記

        // 【テストデータ準備】: 期限1日の依頼を設定
        mockMasterDataRepo.setQuests([
          {
            id: toQuestId('quest_short'),
            clientId: toClientId('client_villager_01'),
            condition: { type: 'QUANTITY', quantity: 1 },
            contribution: 100,
            gold: 50,
            deadline: 1,
            difficulty: 'normal',
            flavorText: '急ぎの依頼',
          },
        ]);
        const result = questService.generateDailyQuests('G');
        const questId = result.quests[0].id;
        questService.acceptQuest(questId);

        // 【実際の処理実行】
        const failedQuests = questService.updateDeadlines();

        // 【結果検証】
        expect(failedQuests).toHaveLength(1);
        expect(failedQuests[0].reason).toBe('deadline_expired');
        expect(questService.getActiveQuests()).toHaveLength(0);
        expect(mockEventBus.emit).toHaveBeenCalledWith(
          'QUEST_FAILED',
          expect.objectContaining({
            quest: expect.any(Object),
            reason: 'deadline_expired',
          }),
        );
      });
    });

    describe('T-0013-S07: 依頼上限取得（getQuestLimit）', () => {
      it('getQuestLimit()でランクに応じた上限を取得できる', () => {
        // 【テスト目的】: ランクに応じた依頼受注上限を取得できること
        // 【テスト内容】: 各ランクで上限を確認
        // 【期待される動作】: ランクに応じた上限が返される
        // 🔵 信頼性レベル: 設計文書に明記

        // 各ランクの上限を確認
        questService.generateDailyQuests('G');
        expect(questService.getQuestLimit()).toBe(2);

        questService.generateDailyQuests('E');
        expect(questService.getQuestLimit()).toBe(3);

        questService.generateDailyQuests('S');
        expect(questService.getQuestLimit()).toBe(5);
      });
    });

    describe('T-0013-S08: 依頼上限設定（setQuestLimit）', () => {
      it('setQuestLimit()で上限を上書きできる', () => {
        // 【テスト目的】: 特殊ルールによる上限変更ができること
        // 【テスト内容】: 上限を手動で設定
        // 【期待される動作】: 設定した上限が使用される
        // 🔵 信頼性レベル: 設計文書に明記

        questService.generateDailyQuests('G');
        expect(questService.getQuestLimit()).toBe(2); // デフォルト

        questService.setQuestLimit(10);
        expect(questService.getQuestLimit()).toBe(10); // 上書き
      });
    });
  });

  // =============================================================================
  // T-0013-SE01〜T-0013-SE04: 異常系テストケース
  // =============================================================================

  describe('異常系テストケース', () => {
    describe('T-0013-SE01: マスターデータ未読み込み時に依頼生成', () => {
      it('generateDailyQuests()でマスターデータ未読み込み時にエラー', () => {
        // 【テスト目的】: マスターデータ未読み込み時のエラーハンドリングを確認
        // 【テスト内容】: マスターデータが読み込まれていない状態で依頼生成を試みる
        // 【期待される動作】: ApplicationErrorがスローされる
        // 🟡 信頼性レベル: 要件定義書に記載あり

        mockMasterDataRepo.setLoaded(false);

        expect(() => {
          questService.generateDailyQuests('G');
        }).toThrow(/Master data not loaded/);
      });
    });

    describe('T-0013-SE02: 存在しない依頼IDで受注', () => {
      it('acceptQuest()で存在しない依頼IDを指定するとfalseを返す', () => {
        // 【テスト目的】: 存在しない依頼IDの処理を確認
        // 【テスト内容】: 存在しない依頼IDで受注を試みる
        // 【期待される動作】: falseを返す（イベント重複発行時の堅牢性のため）
        // Issue #137: イベント重複発行による二重受注を防止

        questService.generateDailyQuests('G');

        const result = questService.acceptQuest(toQuestId('invalid_quest_id'));
        expect(result).toBe(false);
      });
    });

    describe('T-0013-SE03: 依頼上限超過で受注', () => {
      it('acceptQuest()で上限超過時にエラー', () => {
        // 【テスト目的】: 依頼上限超過時のエラーハンドリングを確認
        // 【テスト内容】: 上限を超えて依頼を受注しようとする
        // 【期待される動作】: ApplicationErrorがスローされる
        // 🔵 信頼性レベル: 設計文書に明記

        // 上限を1に設定
        questService.setQuestLimit(1);
        const result = questService.generateDailyQuests('G');

        // 1つ目は成功
        questService.acceptQuest(result.quests[0].id);

        // 2つ目は失敗
        expect(() => {
          questService.acceptQuest(result.quests[1].id);
        }).toThrow(/Quest limit exceeded/);
      });
    });

    describe('T-0013-SE04: 存在しない依頼IDでキャンセル', () => {
      it('cancelQuest()で存在しない依頼IDを指定するとエラー', () => {
        // 【テスト目的】: 存在しないアクティブ依頼のエラーハンドリングを確認
        // 【テスト内容】: 存在しない依頼IDでキャンセルを試みる
        // 【期待される動作】: ApplicationErrorがスローされる
        // 🔵 信頼性レベル: 設計文書に明記

        expect(() => {
          questService.cancelQuest(toQuestId('invalid_quest_id'));
        }).toThrow(/Active quest not found/);
      });
    });
  });

  // =============================================================================
  // T-0013-SB01〜T-0013-SB04: 境界値テストケース
  // =============================================================================

  describe('境界値テストケース', () => {
    describe('T-0013-SB01: 最小ランク（G）での依頼生成', () => {
      it('Gランクで最小の依頼者と依頼が生成される', () => {
        // 【テスト目的】: 最小ランクでの動作を確認
        // 【テスト内容】: Gランクで依頼生成
        // 【期待される動作】: 依頼者2人、依頼3件が生成される
        // 🔵 信頼性レベル: 設計文書に明記

        const result = questService.generateDailyQuests('G');

        expect(result.clients).toHaveLength(2);
        expect(result.quests).toHaveLength(3);
        expect(questService.getQuestLimit()).toBe(2);
      });
    });

    describe('T-0013-SB02: 最大ランク（S）での依頼生成', () => {
      it('Sランクで最大の依頼者と依頼が生成される', () => {
        // 【テスト目的】: 最大ランクでの動作を確認
        // 【テスト内容】: Sランクで依頼生成
        // 【期待される動作】: 依頼者5人、依頼7件が生成される
        // 🔵 信頼性レベル: 設計文書に明記

        // 十分な依頼者を追加
        const moreClients: ClientMaster[] = [];
        for (let i = 0; i < 10; i++) {
          moreClients.push({
            id: toClientId(`client_${i}`),
            name: `依頼者${i}`,
            type: 'VILLAGER',
            contributionMultiplier: 1.0,
            goldMultiplier: 1.0,
            flavorText: '',
          });
        }
        mockMasterDataRepo.setClients(moreClients);

        // 十分な依頼テンプレートを追加
        const moreQuests: QuestMaster[] = [];
        for (let i = 0; i < 10; i++) {
          moreQuests.push({
            id: toQuestId(`quest_${i}`),
            clientId: toClientId(`client_${i % 10}`),
            condition: { type: 'QUANTITY', quantity: 1 },
            contribution: 100,
            gold: 50,
            deadline: 5,
            difficulty: 'normal',
            flavorText: '',
          });
        }
        mockMasterDataRepo.setQuests(moreQuests);

        const result = questService.generateDailyQuests('S');

        expect(result.clients).toHaveLength(5);
        expect(result.quests).toHaveLength(7);
        expect(questService.getQuestLimit()).toBe(5);
      });
    });

    describe('T-0013-SB03: 期限ちょうど1日で更新', () => {
      it('期限が1日の依頼は1回のupdateDeadlines()で失敗する', () => {
        // 【テスト目的】: 期限境界値での動作を確認
        // 【テスト内容】: 期限1日の依頼で更新
        // 【期待される動作】: 1回の更新で失敗する
        // 🔵 信頼性レベル: 設計文書に明記

        mockMasterDataRepo.setQuests([
          {
            id: toQuestId('quest_1day'),
            clientId: toClientId('client_villager_01'),
            condition: { type: 'QUANTITY', quantity: 1 },
            contribution: 100,
            gold: 50,
            deadline: 1,
            difficulty: 'normal',
            flavorText: '',
          },
        ]);

        const result = questService.generateDailyQuests('G');
        questService.acceptQuest(result.quests[0].id);

        expect(questService.getActiveQuests()).toHaveLength(1);

        const failedQuests = questService.updateDeadlines();

        expect(failedQuests).toHaveLength(1);
        expect(questService.getActiveQuests()).toHaveLength(0);
      });
    });

    describe('T-0013-SB04: 空の依頼者・依頼テンプレートでの生成', () => {
      it('マスターデータが空でもフォールバックで依頼が生成される', () => {
        // 【テスト目的】: マスターデータ空時のフォールバック動作を確認
        // 【テスト内容】: 空のマスターデータで依頼生成
        // 【期待される動作】: デフォルト依頼者・依頼が生成される
        // 🟡 信頼性レベル: 設計文書から妥当に推測

        mockMasterDataRepo.setClients([]);
        mockMasterDataRepo.setQuests([]);

        const result = questService.generateDailyQuests('G');

        // フォールバックで生成される
        expect(result.clients.length).toBeGreaterThan(0);
        expect(result.quests.length).toBeGreaterThan(0);
      });
    });
  });
});
