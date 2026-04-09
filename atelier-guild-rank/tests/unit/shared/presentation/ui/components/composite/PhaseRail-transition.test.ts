/**
 * PhaseRail - フェーズ遷移自動化関連テスト
 * Issue #471: PhaseRail の到達条件テキスト表示・逆行対応
 */
import { PhaseRail } from '@shared/presentation/ui/components/composite/PhaseRail';
import type Phaser from 'phaser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createComponentMockScene } from '../test-helpers';

describe('PhaseRail - フェーズ遷移自動化', () => {
  let scene: Phaser.Scene;

  beforeEach(() => {
    scene = createComponentMockScene();
  });

  describe('到達条件テキスト', () => {
    it('setConditionText でテキストが設定される', () => {
      const rail = new PhaseRail(scene, 0, 0);
      rail.create();

      rail.setConditionText('依頼を受注すると採取に進めます');
      expect(rail.getConditionText()).toBe('依頼を受注すると採取に進めます');
    });

    it('setConditionText で空文字を設定するとテキストがクリアされる', () => {
      const rail = new PhaseRail(scene, 0, 0);
      rail.create();

      rail.setConditionText('テスト条件');
      rail.setConditionText('');
      expect(rail.getConditionText()).toBe('');
    });

    it('create 前に setConditionText を呼んでもエラーにならない', () => {
      const rail = new PhaseRail(scene, 0, 0);
      expect(() => rail.setConditionText('テスト')).not.toThrow();
    });
  });

  describe('逆行（前フェーズへの遷移）', () => {
    it('onPhaseClick コールバックはどのフェーズからでも呼ばれる', () => {
      const clickHandler = vi.fn();
      const rail = new PhaseRail(scene, 0, 0, {
        current: 'ALCHEMY',
        onPhaseClick: clickHandler,
      });
      rail.create();

      // QUEST_ACCEPT（前方向）へのクリックが通る
      rail.simulateTabClick('QUEST_ACCEPT');
      expect(clickHandler).toHaveBeenCalledWith('QUEST_ACCEPT');
    });

    it('採取セッション中は逆行もブロックされる', () => {
      const clickHandler = vi.fn();
      const rail = new PhaseRail(scene, 0, 0, {
        current: 'GATHERING',
        onPhaseClick: clickHandler,
      });
      rail.create();
      rail.setTabsDisabled(true);

      rail.simulateTabClick('QUEST_ACCEPT');
      expect(clickHandler).not.toHaveBeenCalled();
    });
  });
});
