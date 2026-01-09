/**
 * IPhaseIndicatorインターフェーステスト
 *
 * IPhaseIndicatorインターフェースの型定義テスト
 */

import { describe, it, expect } from 'vitest';
import type {
  IPhaseIndicator,
  PhaseIndicatorOptions,
} from '../../../../../src/game/ui/phases/IPhaseIndicator';
import { GamePhase } from '../../../../../src/domain/common/types';

describe('IPhaseIndicator インターフェース', () => {
  describe('PhaseIndicatorOptions', () => {
    it('空のオプションを作成できる', () => {
      const options: PhaseIndicatorOptions = {};
      expect(options).toBeDefined();
    });

    it('すべてのオプションを指定できる', () => {
      const onPhaseClick = () => {};
      const options: PhaseIndicatorOptions = {
        x: 200,
        y: 100,
        onPhaseClick,
        clickable: true,
      };

      expect(options.x).toBe(200);
      expect(options.y).toBe(100);
      expect(options.onPhaseClick).toBe(onPhaseClick);
      expect(options.clickable).toBe(true);
    });

    it('部分的なオプションを指定できる', () => {
      const options: PhaseIndicatorOptions = {
        clickable: false,
      };

      expect(options.clickable).toBe(false);
      expect(options.x).toBeUndefined();
      expect(options.y).toBeUndefined();
    });
  });

  describe('IPhaseIndicator', () => {
    it('インターフェースが正しく定義されている（型チェック）', () => {
      const mockPhaseIndicator: IPhaseIndicator = {
        container: {} as any,
        setCurrentPhase: () => {},
        getCurrentPhase: () => GamePhase.QUEST_ACCEPT,
        markPhaseCompleted: () => {},
        clearCompletedPhases: () => {},
        setPhaseEnabled: () => {},
        setVisible: () => {},
        destroy: () => {},
      };

      expect(mockPhaseIndicator).toBeDefined();
      expect(typeof mockPhaseIndicator.setCurrentPhase).toBe('function');
      expect(typeof mockPhaseIndicator.getCurrentPhase).toBe('function');
      expect(typeof mockPhaseIndicator.markPhaseCompleted).toBe('function');
      expect(typeof mockPhaseIndicator.clearCompletedPhases).toBe('function');
      expect(typeof mockPhaseIndicator.setPhaseEnabled).toBe('function');
      expect(typeof mockPhaseIndicator.setVisible).toBe('function');
      expect(typeof mockPhaseIndicator.destroy).toBe('function');
    });

    it('getCurrentPhaseが正しい型を返す', () => {
      const mockPhaseIndicator: IPhaseIndicator = {
        container: {} as any,
        setCurrentPhase: () => {},
        getCurrentPhase: () => GamePhase.GATHERING,
        markPhaseCompleted: () => {},
        clearCompletedPhases: () => {},
        setPhaseEnabled: () => {},
        setVisible: () => {},
        destroy: () => {},
      };

      const phase = mockPhaseIndicator.getCurrentPhase();
      expect(phase).toBe(GamePhase.GATHERING);
    });
  });
});
