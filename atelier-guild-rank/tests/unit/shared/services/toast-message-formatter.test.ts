import {
  formatApInsufficientMessage,
  formatDeliverySuccessMessage,
  formatGoldChangedMessage,
} from '@shared/services/toast-message-formatter';
import { describe, expect, it } from 'vitest';

describe('toast-message-formatter', () => {
  describe('formatDeliverySuccessMessage', () => {
    describe('正常系', () => {
      it('ゴールドと貢献度を含むメッセージを返す', () => {
        const result = formatDeliverySuccessMessage(150, 30);
        expect(result).toBe('納品成功！ +150G 貢献度+30');
      });

      it('ゴールド0の場合でもメッセージを返す', () => {
        const result = formatDeliverySuccessMessage(0, 10);
        expect(result).toBe('納品成功！ +0G 貢献度+10');
      });
    });
  });

  describe('formatGoldChangedMessage', () => {
    describe('正常系', () => {
      it('正のdeltaで加算メッセージを返す', () => {
        const result = formatGoldChangedMessage(100);
        expect(result).toBe('+100G');
      });

      it('負のdeltaで減算メッセージを返す', () => {
        const result = formatGoldChangedMessage(-50);
        expect(result).toBe('-50G');
      });
    });

    describe('境界値', () => {
      it('delta=0でnullを返す', () => {
        const result = formatGoldChangedMessage(0);
        expect(result).toBeNull();
      });
    });
  });

  describe('formatApInsufficientMessage', () => {
    it('AP不足メッセージを返す', () => {
      const result = formatApInsufficientMessage();
      expect(result).toBe('APが不足しています');
    });
  });
});
