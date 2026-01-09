/**
 * HandConstantsテスト
 *
 * 手札レイアウト定数のテスト
 */

import { describe, it, expect } from 'vitest';
import {
  HandLayout,
  HandLayoutType,
} from '../../../../../src/game/ui/hand/HandConstants';

describe('HandConstants', () => {
  describe('HandLayout', () => {
    it('位置が定義されている', () => {
      expect(HandLayout.X).toBeTypeOf('number');
      expect(HandLayout.Y).toBeTypeOf('number');
    });

    it('表示設定が定義されている', () => {
      expect(HandLayout.MAX_VISIBLE_CARDS).toBeGreaterThan(0);
      expect(HandLayout.CARD_SPACING).toBeGreaterThan(0);
      expect(HandLayout.CARD_OVERLAP).toBeGreaterThan(0);
    });

    it('扇形配置設定が定義されている', () => {
      expect(HandLayout.FAN_ANGLE_RANGE).toBeGreaterThan(0);
      expect(HandLayout.FAN_RADIUS).toBeGreaterThan(0);
    });

    it('アニメーション設定が定義されている', () => {
      expect(HandLayout.CARD_MOVE_DURATION).toBeGreaterThan(0);
      expect(HandLayout.CARD_HOVER_OFFSET).toBeLessThan(0);
    });

    it('位置が画面下部に設定されている', () => {
      // 720ピクセル画面で下部付近
      expect(HandLayout.Y).toBeGreaterThan(500);
    });

    it('最大表示カード数が適切', () => {
      // 7枚程度が適切
      expect(HandLayout.MAX_VISIBLE_CARDS).toBeGreaterThanOrEqual(5);
      expect(HandLayout.MAX_VISIBLE_CARDS).toBeLessThanOrEqual(10);
    });
  });

  describe('HandLayoutType', () => {
    it('horizontal型が有効', () => {
      const type: HandLayoutType = 'horizontal';
      expect(type).toBe('horizontal');
    });

    it('fan型が有効', () => {
      const type: HandLayoutType = 'fan';
      expect(type).toBe('fan');
    });
  });
});
