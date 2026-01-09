/**
 * DeckViewConstants テスト
 *
 * デッキビュー定数のテスト
 */

import { describe, it, expect } from 'vitest';
import {
  DeckViewLayout,
  DeckColors,
} from '../../../../../src/game/ui/deck/DeckViewConstants';

describe('DeckViewConstants', () => {
  describe('DeckViewLayout', () => {
    it('位置が定義されている', () => {
      expect(DeckViewLayout.X).toBeTypeOf('number');
      expect(DeckViewLayout.Y).toBeTypeOf('number');
    });

    it('カードサイズが正の数', () => {
      expect(DeckViewLayout.CARD_WIDTH).toBeGreaterThan(0);
      expect(DeckViewLayout.CARD_HEIGHT).toBeGreaterThan(0);
    });

    it('スタックオフセットが定義されている', () => {
      expect(DeckViewLayout.STACK_OFFSET).toBeGreaterThanOrEqual(0);
    });

    it('最大表示スタック数が正の数', () => {
      expect(DeckViewLayout.MAX_VISIBLE_STACK).toBeGreaterThan(0);
    });

    it('アニメーション時間が定義されている', () => {
      expect(DeckViewLayout.DRAW_DURATION).toBeGreaterThan(0);
      expect(DeckViewLayout.SHUFFLE_DURATION).toBeGreaterThan(0);
    });

    it('カードが画面左下に配置される', () => {
      // 画面幅1280の左側
      expect(DeckViewLayout.X).toBeLessThan(640);
      // 画面下部
      expect(DeckViewLayout.Y).toBeGreaterThan(400);
    });
  });

  describe('DeckColors', () => {
    it('カード背面色が定義されている', () => {
      expect(DeckColors.CARD_BACK).toBeTypeOf('number');
      expect(DeckColors.CARD_BORDER).toBeTypeOf('number');
      expect(DeckColors.CARD_PATTERN).toBeTypeOf('number');
    });

    it('枚数バッジ背景色が定義されている', () => {
      expect(DeckColors.COUNT_BG).toBeTypeOf('number');
    });

    it('背面色とボーダー色は異なる', () => {
      expect(DeckColors.CARD_BACK).not.toBe(DeckColors.CARD_BORDER);
    });
  });
});
