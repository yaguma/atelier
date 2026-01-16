/**
 * events.ts テストケース
 * イベント関連型の型安全性テスト
 *
 * @description
 * TC-EVT-001 〜 TC-EVT-040 を実装
 */

// 型インポート（TDD Red: これらの型はまだ存在しない）
import type {
  IAlchemyCompletedEvent,
  ICraftedItem,
  IGameClearedEvent,
  IGameEvent,
  IGameOverEvent,
  IGatheringCompletedEvent,
  IMaterialInstance,
  IPhaseChangedEvent,
  IQuest,
  IQuestCompletedEvent,
  IRankDamagedEvent,
  IRankUpEvent,
} from '@shared/types';
// 列挙型インポート
import {
  GameEventType,
  GamePhase,
  GuildRank,
  Quality,
  QuestType,
  toClientId,
  toItemId,
  toMaterialId,
  toQuestId,
} from '@shared/types';
import { describe, expect, it } from 'vitest';

// =============================================================================
// 8.1 GameEventType列挙型
// =============================================================================

describe('events.ts', () => {
  describe('GameEventType列挙型', () => {
    // TC-EVT-001
    it('GameEventType型がインポート可能', () => {
      expect(GameEventType).toBeDefined();
    });

    // TC-EVT-002
    it('GameEventType.PHASE_CHANGEDが使用可能', () => {
      expect(GameEventType.PHASE_CHANGED).toBe('PHASE_CHANGED');
    });

    // TC-EVT-003
    it('GameEventType.DAY_ENDEDが使用可能', () => {
      expect(GameEventType.DAY_ENDED).toBe('DAY_ENDED');
    });

    // TC-EVT-004
    it('GameEventType.DAY_STARTEDが使用可能', () => {
      expect(GameEventType.DAY_STARTED).toBe('DAY_STARTED');
    });

    // TC-EVT-005
    it('GameEventType.QUEST_ACCEPTEDが使用可能', () => {
      expect(GameEventType.QUEST_ACCEPTED).toBe('QUEST_ACCEPTED');
    });

    // TC-EVT-006
    it('GameEventType.QUEST_COMPLETEDが使用可能', () => {
      expect(GameEventType.QUEST_COMPLETED).toBe('QUEST_COMPLETED');
    });

    // TC-EVT-007
    it('GameEventType.QUEST_FAILEDが使用可能', () => {
      expect(GameEventType.QUEST_FAILED).toBe('QUEST_FAILED');
    });

    // TC-EVT-008
    it('GameEventType.GATHERING_COMPLETEDが使用可能', () => {
      expect(GameEventType.GATHERING_COMPLETED).toBe('GATHERING_COMPLETED');
    });

    // TC-EVT-009
    it('GameEventType.ALCHEMY_COMPLETEDが使用可能', () => {
      expect(GameEventType.ALCHEMY_COMPLETED).toBe('ALCHEMY_COMPLETED');
    });

    // TC-EVT-010
    it('GameEventType.RANK_DAMAGEDが使用可能', () => {
      expect(GameEventType.RANK_DAMAGED).toBe('RANK_DAMAGED');
    });

    // TC-EVT-011
    it('GameEventType.RANK_UPが使用可能', () => {
      expect(GameEventType.RANK_UP).toBe('RANK_UP');
    });

    // TC-EVT-012
    it('GameEventType.GAME_OVERが使用可能', () => {
      expect(GameEventType.GAME_OVER).toBe('GAME_OVER');
    });

    // TC-EVT-013
    it('GameEventType.GAME_CLEAREDが使用可能', () => {
      expect(GameEventType.GAME_CLEARED).toBe('GAME_CLEARED');
    });
  });

  // =============================================================================
  // 8.2 IGameEventインターフェース
  // =============================================================================

  describe('IGameEventインターフェース', () => {
    // TC-EVT-014
    it('IGameEvent型がインポート可能', () => {
      const event: IGameEvent = {
        type: GameEventType.PHASE_CHANGED,
        timestamp: Date.now(),
      };
      expect(event).toBeDefined();
    });

    // TC-EVT-015
    it('IGameEvent.typeがGameEventType型', () => {
      // @ts-expect-error - 不正な値で型エラー
      const invalid: IGameEvent = {
        type: 'INVALID_EVENT',
        timestamp: Date.now(),
      };
      expect(invalid).toBeDefined();
    });

    // TC-EVT-016
    it('IGameEvent.timestampがnumber型', () => {
      // @ts-expect-error - 文字列で型エラー
      const invalid: IGameEvent = {
        type: GameEventType.PHASE_CHANGED,
        timestamp: 'not-a-number',
      };
      expect(invalid).toBeDefined();
    });
  });

  // =============================================================================
  // 8.3 IPhaseChangedEventインターフェース
  // =============================================================================

  describe('IPhaseChangedEventインターフェース', () => {
    // TC-EVT-017
    it('IPhaseChangedEvent型がインポート可能', () => {
      const event: IPhaseChangedEvent = {
        type: GameEventType.PHASE_CHANGED,
        timestamp: Date.now(),
        previousPhase: GamePhase.QUEST_ACCEPT,
        newPhase: GamePhase.GATHERING,
      };
      expect(event).toBeDefined();
    });

    // TC-EVT-018
    it('IPhaseChangedEventがIGameEventを拡張', () => {
      const event: IPhaseChangedEvent = {
        type: GameEventType.PHASE_CHANGED,
        timestamp: Date.now(),
        previousPhase: GamePhase.QUEST_ACCEPT,
        newPhase: GamePhase.GATHERING,
      };
      // 基底プロパティアクセス可能
      expect(event.type).toBe(GameEventType.PHASE_CHANGED);
      expect(event.timestamp).toBeDefined();
    });

    // TC-EVT-019
    it('IPhaseChangedEvent.typeがGameEventType.PHASE_CHANGEDに限定', () => {
      // @ts-expect-error - 他の値で型エラー
      const invalid: IPhaseChangedEvent = {
        type: GameEventType.DAY_ENDED,
        timestamp: Date.now(),
        previousPhase: GamePhase.QUEST_ACCEPT,
        newPhase: GamePhase.GATHERING,
      };
      expect(invalid).toBeDefined();
    });

    // TC-EVT-020
    it('IPhaseChangedEvent.previousPhaseがGamePhase型', () => {
      // @ts-expect-error - 不正な値で型エラー
      const invalid: IPhaseChangedEvent = {
        type: GameEventType.PHASE_CHANGED,
        timestamp: Date.now(),
        previousPhase: 'INVALID_PHASE',
        newPhase: GamePhase.GATHERING,
      };
      expect(invalid).toBeDefined();
    });

    // TC-EVT-021
    it('IPhaseChangedEvent.newPhaseがGamePhase型', () => {
      // @ts-expect-error - 不正な値で型エラー
      const invalid: IPhaseChangedEvent = {
        type: GameEventType.PHASE_CHANGED,
        timestamp: Date.now(),
        previousPhase: GamePhase.QUEST_ACCEPT,
        newPhase: 'INVALID_PHASE',
      };
      expect(invalid).toBeDefined();
    });
  });

  // =============================================================================
  // 8.4 IQuestCompletedEventインターフェース
  // =============================================================================

  describe('IQuestCompletedEventインターフェース', () => {
    const sampleQuest: IQuest = {
      id: toQuestId('quest-001'),
      clientId: toClientId('client-001'),
      condition: { type: QuestType.SPECIFIC },
      contribution: 100,
      gold: 500,
      deadline: 7,
      difficulty: 'normal',
      flavorText: 'Test',
    };

    const sampleCraftedItem: ICraftedItem = {
      itemId: toItemId('item-001'),
      quality: Quality.A,
      attributeValues: [],
      effectValues: [],
      usedMaterials: [],
    };

    // TC-EVT-022
    it('IQuestCompletedEvent型がインポート可能', () => {
      const event: IQuestCompletedEvent = {
        type: GameEventType.QUEST_COMPLETED,
        timestamp: Date.now(),
        quest: sampleQuest,
        deliveredItem: sampleCraftedItem,
      };
      expect(event).toBeDefined();
    });

    // TC-EVT-023
    it('IQuestCompletedEvent.typeがGameEventType.QUEST_COMPLETEDに限定', () => {
      // @ts-expect-error - 他の値で型エラー
      const invalid: IQuestCompletedEvent = {
        type: GameEventType.QUEST_FAILED,
        timestamp: Date.now(),
        quest: sampleQuest,
        deliveredItem: sampleCraftedItem,
      };
      expect(invalid).toBeDefined();
    });

    // TC-EVT-024
    it('IQuestCompletedEvent.questがIQuest型', () => {
      // @ts-expect-error - 型違いで型エラー
      const invalid: IQuestCompletedEvent = {
        type: GameEventType.QUEST_COMPLETED,
        timestamp: Date.now(),
        quest: 'not-a-quest',
        deliveredItem: sampleCraftedItem,
      };
      expect(invalid).toBeDefined();
    });

    // TC-EVT-025
    it('IQuestCompletedEvent.deliveredItemがICraftedItem型', () => {
      // @ts-expect-error - 型違いで型エラー
      const invalid: IQuestCompletedEvent = {
        type: GameEventType.QUEST_COMPLETED,
        timestamp: Date.now(),
        quest: sampleQuest,
        deliveredItem: 'not-an-item',
      };
      expect(invalid).toBeDefined();
    });
  });

  // =============================================================================
  // 8.5 IGatheringCompletedEvent, IAlchemyCompletedEventインターフェース
  // =============================================================================

  describe('IGatheringCompletedEvent, IAlchemyCompletedEventインターフェース', () => {
    // TC-EVT-026
    it('IGatheringCompletedEvent型がインポート可能', () => {
      const event: IGatheringCompletedEvent = {
        type: GameEventType.GATHERING_COMPLETED,
        timestamp: Date.now(),
        obtainedMaterials: [],
      };
      expect(event).toBeDefined();
    });

    // TC-EVT-027
    it('IGatheringCompletedEvent.obtainedMaterialsがIMaterialInstance[]型', () => {
      // @ts-expect-error - 型違いで型エラー
      const invalid: IGatheringCompletedEvent = {
        type: GameEventType.GATHERING_COMPLETED,
        timestamp: Date.now(),
        obtainedMaterials: 'not-an-array',
      };
      expect(invalid).toBeDefined();
    });

    // TC-EVT-028
    it('IAlchemyCompletedEvent型がインポート可能', () => {
      const event: IAlchemyCompletedEvent = {
        type: GameEventType.ALCHEMY_COMPLETED,
        timestamp: Date.now(),
        craftedItem: {
          itemId: toItemId('item-001'),
          quality: Quality.B,
          attributeValues: [],
          effectValues: [],
          usedMaterials: [],
        },
      };
      expect(event).toBeDefined();
    });

    // TC-EVT-029
    it('IAlchemyCompletedEvent.craftedItemがICraftedItem型', () => {
      // @ts-expect-error - 型違いで型エラー
      const invalid: IAlchemyCompletedEvent = {
        type: GameEventType.ALCHEMY_COMPLETED,
        timestamp: Date.now(),
        craftedItem: 'not-an-item',
      };
      expect(invalid).toBeDefined();
    });
  });

  // =============================================================================
  // 8.6 IRankDamagedEvent, IRankUpEventインターフェース
  // =============================================================================

  describe('IRankDamagedEvent, IRankUpEventインターフェース', () => {
    // TC-EVT-030
    it('IRankDamagedEvent型がインポート可能', () => {
      const event: IRankDamagedEvent = {
        type: GameEventType.RANK_DAMAGED,
        timestamp: Date.now(),
        damage: 10,
        remainingHp: 90,
        currentRank: GuildRank.G,
      };
      expect(event).toBeDefined();
    });

    // TC-EVT-031
    it('IRankDamagedEvent.damageがnumber型', () => {
      // @ts-expect-error - 文字列で型エラー
      const invalid: IRankDamagedEvent = {
        type: GameEventType.RANK_DAMAGED,
        timestamp: Date.now(),
        damage: '10',
        remainingHp: 90,
        currentRank: GuildRank.G,
      };
      expect(invalid).toBeDefined();
    });

    // TC-EVT-032
    it('IRankUpEvent型がインポート可能', () => {
      const event: IRankUpEvent = {
        type: GameEventType.RANK_UP,
        timestamp: Date.now(),
        previousRank: GuildRank.G,
        newRank: GuildRank.F,
      };
      expect(event).toBeDefined();
    });

    // TC-EVT-033
    it('IRankUpEvent.previousRankがGuildRank型', () => {
      // @ts-expect-error - 不正な値で型エラー
      const invalid: IRankUpEvent = {
        type: GameEventType.RANK_UP,
        timestamp: Date.now(),
        previousRank: 'INVALID_RANK',
        newRank: GuildRank.F,
      };
      expect(invalid).toBeDefined();
    });

    // TC-EVT-034
    it('IRankUpEvent.newRankがGuildRank型', () => {
      // @ts-expect-error - 不正な値で型エラー
      const invalid: IRankUpEvent = {
        type: GameEventType.RANK_UP,
        timestamp: Date.now(),
        previousRank: GuildRank.G,
        newRank: 'INVALID_RANK',
      };
      expect(invalid).toBeDefined();
    });
  });

  // =============================================================================
  // 8.7 IGameOverEvent, IGameClearedEventインターフェース
  // =============================================================================

  describe('IGameOverEvent, IGameClearedEventインターフェース', () => {
    // TC-EVT-035
    it('IGameOverEvent型がインポート可能', () => {
      const event: IGameOverEvent = {
        type: GameEventType.GAME_OVER,
        timestamp: Date.now(),
        reason: 'day_limit_exceeded',
        finalRank: GuildRank.F,
      };
      expect(event).toBeDefined();
    });

    // TC-EVT-036
    it('IGameOverEvent.reasonが有効なリテラル型', () => {
      // @ts-expect-error - 不正な値で型エラー
      const invalid: IGameOverEvent = {
        type: GameEventType.GAME_OVER,
        timestamp: Date.now(),
        reason: 'invalid_reason',
        finalRank: GuildRank.F,
      };
      expect(invalid).toBeDefined();
    });

    // TC-EVT-037
    it('IGameOverEvent.finalRankがGuildRank型', () => {
      // @ts-expect-error - 不正な値で型エラー
      const invalid: IGameOverEvent = {
        type: GameEventType.GAME_OVER,
        timestamp: Date.now(),
        reason: 'day_limit_exceeded',
        finalRank: 'INVALID_RANK',
      };
      expect(invalid).toBeDefined();
    });

    // TC-EVT-038
    it('IGameClearedEvent型がインポート可能', () => {
      const event: IGameClearedEvent = {
        type: GameEventType.GAME_CLEARED,
        timestamp: Date.now(),
        totalDays: 100,
        finalScore: 50000,
      };
      expect(event).toBeDefined();
    });

    // TC-EVT-039
    it('IGameClearedEvent.totalDaysがnumber型', () => {
      // @ts-expect-error - 文字列で型エラー
      const invalid: IGameClearedEvent = {
        type: GameEventType.GAME_CLEARED,
        timestamp: Date.now(),
        totalDays: '100',
        finalScore: 50000,
      };
      expect(invalid).toBeDefined();
    });

    // TC-EVT-040
    it('IGameClearedEvent.finalScoreがnumber型', () => {
      // @ts-expect-error - 文字列で型エラー
      const invalid: IGameClearedEvent = {
        type: GameEventType.GAME_CLEARED,
        timestamp: Date.now(),
        totalDays: 100,
        finalScore: '50000',
      };
      expect(invalid).toBeDefined();
    });
  });
});
