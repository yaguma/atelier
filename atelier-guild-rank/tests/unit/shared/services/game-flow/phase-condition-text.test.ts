/**
 * phase-condition-text テスト
 * Issue #471: フェーズ到達条件テキストの純粋関数テスト
 * Issue #498: 説明テキストは不要のため常に空文字を返す
 */
import { getPhaseConditionText } from '@shared/services/game-flow/phase-condition-text';
import { describe, expect, it } from 'vitest';

describe('getPhaseConditionText', () => {
  describe('Issue #498: 全フェーズで空文字を返す', () => {
    it.each([
      ['QUEST_ACCEPT', false],
      ['QUEST_ACCEPT', true],
      ['GATHERING', false],
      ['ALCHEMY', false],
      ['DELIVERY', false],
      ['UNKNOWN_PHASE', false],
    ] as const)('フェーズ %s (hasActiveQuests=%s) で空文字を返す', (phase, hasActiveQuests) => {
      expect(getPhaseConditionText(phase, hasActiveQuests)).toBe('');
    });
  });
});
