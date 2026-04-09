/**
 * phase-condition-text テスト
 * Issue #471: フェーズ到達条件テキストの純粋関数テスト
 */
import { getPhaseConditionText } from '@shared/services/game-flow/phase-condition-text';
import { describe, expect, it } from 'vitest';

describe('getPhaseConditionText', () => {
  describe('正常系', () => {
    it('QUEST_ACCEPT で受注なしの場合、受注を促すテキストを返す', () => {
      const text = getPhaseConditionText('QUEST_ACCEPT', false);
      expect(text).toBe('→ 依頼を受注すると採取に進めます');
    });

    it('QUEST_ACCEPT で受注済みの場合、採取に進めるテキストを返す', () => {
      const text = getPhaseConditionText('QUEST_ACCEPT', true);
      expect(text).toBe('→ 依頼を受注済み。採取に進めます');
    });

    it('GATHERING の場合、調合への条件テキストを返す', () => {
      const text = getPhaseConditionText('GATHERING', false);
      expect(text).toBe('→ 素材を集めたら調合に進めます');
    });

    it('ALCHEMY の場合、納品への条件テキストを返す', () => {
      const text = getPhaseConditionText('ALCHEMY', false);
      expect(text).toBe('→ アイテムを調合したら納品に進めます');
    });

    it('DELIVERY の場合、空文字を返す', () => {
      const text = getPhaseConditionText('DELIVERY', false);
      expect(text).toBe('');
    });
  });

  describe('異常系', () => {
    it('未知のフェーズの場合、空文字を返す', () => {
      const text = getPhaseConditionText('UNKNOWN_PHASE', false);
      expect(text).toBe('');
    });
  });
});
