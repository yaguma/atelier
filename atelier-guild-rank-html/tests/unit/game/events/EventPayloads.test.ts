/**
 * EventPayloads テスト
 *
 * イベントペイロード型の定義とマッピングを検証する。
 */

import { describe, it, expect } from 'vitest';
import type {
  EventPayloadMap,
  PayloadEventKey,
  VoidEventKey,
  GamePhase,
  GuildRank,
  GameState,
  QuestSelectedPayload,
  PhaseChangedPayload,
  GoldChangedPayload,
} from '@game/events/EventPayloads';

describe('EventPayloads', () => {
  describe('型定義', () => {
    it('GamePhaseは6種類のフェーズを持つ', () => {
      const phases: GamePhase[] = [
        'QUEST_ACCEPT',
        'GATHERING',
        'ALCHEMY',
        'DELIVERY',
        'DAY_END',
        'SHOP',
      ];
      expect(phases.length).toBe(6);
    });

    it('GuildRankは8種類のランクを持つ', () => {
      const ranks: GuildRank[] = ['G', 'F', 'E', 'D', 'C', 'B', 'A', 'S'];
      expect(ranks.length).toBe(8);
    });

    it('GameStateは4種類の状態を持つ', () => {
      const states: GameState[] = [
        'title',
        'playing',
        'gameOver',
        'gameClear',
      ];
      expect(states.length).toBe(4);
    });
  });

  describe('ペイロード型', () => {
    it('QuestSelectedPayloadはquestIdを持つ', () => {
      const payload: QuestSelectedPayload = { questId: 'quest-001' };
      expect(payload.questId).toBe('quest-001');
    });

    it('PhaseChangedPayloadはphaseとオプショナルなpreviousPhaseを持つ', () => {
      const payload1: PhaseChangedPayload = { phase: 'GATHERING' };
      expect(payload1.phase).toBe('GATHERING');
      expect(payload1.previousPhase).toBeUndefined();

      const payload2: PhaseChangedPayload = {
        phase: 'ALCHEMY',
        previousPhase: 'GATHERING',
      };
      expect(payload2.phase).toBe('ALCHEMY');
      expect(payload2.previousPhase).toBe('GATHERING');
    });

    it('GoldChangedPayloadはgoldとdeltaを持つ', () => {
      const payload: GoldChangedPayload = { gold: 1000, delta: 100 };
      expect(payload.gold).toBe(1000);
      expect(payload.delta).toBe(100);
    });
  });

  describe('EventPayloadMap', () => {
    it('型マッピングが正しく定義されている', () => {
      // 型チェックのみ（実行時の検証はしない）
      const _testPayloadMapping = (): void => {
        // ペイロードありイベント
        const questSelected: EventPayloadMap['ui:quest:selected'] = {
          questId: 'q1',
        };
        const phaseChanged: EventPayloadMap['state:phase:changed'] = {
          phase: 'GATHERING',
        };
        const goldChanged: EventPayloadMap['state:gold:changed'] = {
          gold: 100,
          delta: 50,
        };

        // ペイロードなしイベント
        const newGame: EventPayloadMap['ui:newGame:clicked'] = undefined;
        const sceneReady: EventPayloadMap['scene:ready'] = undefined;

        // 使用しないが型チェックのため
        void questSelected;
        void phaseChanged;
        void goldChanged;
        void newGame;
        void sceneReady;
      };

      // 型チェックが通ればOK
      expect(typeof _testPayloadMapping).toBe('function');
    });
  });

  describe('PayloadEventKey / VoidEventKey', () => {
    it('型が正しく分離されている（コンパイル時チェック）', () => {
      // PayloadEventKeyはペイロードありイベントのみ
      const _testPayloadKey = (): void => {
        const payloadKeys: PayloadEventKey[] = [
          'ui:quest:selected',
          'state:phase:changed',
          'state:gold:changed',
        ];
        void payloadKeys;
      };

      // VoidEventKeyはペイロードなしイベントのみ
      const _testVoidKey = (): void => {
        const voidKeys: VoidEventKey[] = [
          'ui:newGame:clicked',
          'ui:gathering:confirmed',
          'scene:ready',
        ];
        void voidKeys;
      };

      expect(typeof _testPayloadKey).toBe('function');
      expect(typeof _testVoidKey).toBe('function');
    });
  });
});
