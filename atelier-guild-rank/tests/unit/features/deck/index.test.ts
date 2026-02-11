/**
 * features/deck 公開APIテスト
 * TASK-0071: features/deck/index.ts公開API作成
 *
 * @description
 * デッキ機能の公開APIが正しくエクスポートされていることを確認する。
 * 外部モジュールは @features/deck からのみインポートすべき。
 */

import type {
  CardUIConfig,
  DeckState,
  DraggableCardConfig,
  HandDisplayConfig,
  PlayCardError,
  PlayCardErrorCode,
  Result,
} from '@features/deck';
import {
  CardUI,
  createSeededRandom,
  DraggableCardUI,
  draw,
  HandDisplay,
  playCard,
  shuffle,
} from '@features/deck';
import type { Card } from '@shared/types';
import { toCardId } from '@shared/types';
import { describe, expect, it } from 'vitest';

const mockCard: Card = {
  id: toCardId('test-card-1'),
  name: 'テストカード',
  type: 'GATHERING',
  rarity: 'COMMON',
  unlockRank: 'G',
  cost: 1,
  materials: [],
};

describe('features/deck 公開API', () => {
  describe('サービス関数のエクスポート', () => {
    it('shuffle関数がエクスポートされていること', () => {
      expect(shuffle).toBeDefined();
      expect(typeof shuffle).toBe('function');
    });

    it('createSeededRandom関数がエクスポートされていること', () => {
      expect(createSeededRandom).toBeDefined();
      expect(typeof createSeededRandom).toBe('function');
    });

    it('draw関数がエクスポートされていること', () => {
      expect(draw).toBeDefined();
      expect(typeof draw).toBe('function');
    });

    it('playCard関数がエクスポートされていること', () => {
      expect(playCard).toBeDefined();
      expect(typeof playCard).toBe('function');
    });
  });

  describe('コンポーネントのエクスポート', () => {
    it('CardUIがエクスポートされていること', () => {
      expect(CardUI).toBeDefined();
      expect(typeof CardUI).toBe('function');
    });

    it('DraggableCardUIがエクスポートされていること', () => {
      expect(DraggableCardUI).toBeDefined();
      expect(typeof DraggableCardUI).toBe('function');
    });

    it('HandDisplayがエクスポートされていること', () => {
      expect(HandDisplay).toBeDefined();
      expect(typeof HandDisplay).toBe('function');
    });
  });

  describe('型定義のエクスポート', () => {
    it('DeckState型がエクスポートされていること', () => {
      const state: DeckState = {
        hand: [],
        deck: [],
        discard: [],
      };
      expect(state).toBeDefined();
    });

    it('PlayCardError型がエクスポートされていること', () => {
      const error: PlayCardError = {
        code: 'CARD_NOT_IN_HAND',
        message: 'test',
      };
      expect(error).toBeDefined();
    });

    it('PlayCardErrorCode型がエクスポートされていること', () => {
      const code: PlayCardErrorCode = 'CARD_NOT_IN_HAND';
      expect(code).toBe('CARD_NOT_IN_HAND');
    });

    it('Result型がエクスポートされていること', () => {
      const success: Result<number, string> = { ok: true, value: 42 };
      const failure: Result<number, string> = { ok: false, error: 'error' };
      expect(success.ok).toBe(true);
      expect(failure.ok).toBe(false);
    });

    it('CardUIConfig型がエクスポートされていること', () => {
      const config: CardUIConfig = {
        card: mockCard,
        x: 0,
        y: 0,
      };
      expect(config).toBeDefined();
    });

    it('DraggableCardConfig型がエクスポートされていること', () => {
      const config: DraggableCardConfig = {
        card: mockCard,
        x: 0,
        y: 0,
      };
      expect(config).toBeDefined();
    });

    it('HandDisplayConfig型がエクスポートされていること', () => {
      const config: HandDisplayConfig = {
        x: 0,
        y: 0,
        cards: [],
      };
      expect(config).toBeDefined();
    });
  });

  describe('公開APIの動作確認', () => {
    it('shuffle関数が正しく動作すること', () => {
      const deck = [1, 2, 3, 4, 5];
      const shuffled = shuffle(deck, 12345);
      expect(shuffled).toHaveLength(5);
      expect(shuffled).not.toBe(deck);
      expect([...shuffled].sort()).toEqual([...deck].sort());
    });

    it('draw関数が正しく動作すること', () => {
      const deck = [1, 2, 3, 4, 5];
      const [drawn, remaining] = draw(deck, 2);
      expect(drawn).toHaveLength(2);
      expect(remaining).toHaveLength(3);
    });

    it('createSeededRandom関数が決定的な乱数を返すこと', () => {
      const random1 = createSeededRandom(42);
      const random2 = createSeededRandom(42);
      expect(random1()).toBe(random2());
    });
  });
});
