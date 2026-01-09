/**
 * PhaseIndicator テスト
 *
 * PhaseIndicatorコンポーネントのテスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Phaserのモック - vi.mockはホイストされるためインラインで定義
vi.mock('phaser', () => {
  class MockRectangle {
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(x: number, y: number, width: number, height: number) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    }

    static Contains = () => true;
  }

  return {
    default: {
      Geom: {
        Rectangle: MockRectangle,
      },
    },
  };
});

import { PhaseIndicator } from '../../../../../src/game/ui/phases/PhaseIndicator';
import { GamePhase } from '../../../../../src/domain/common/types';

// Phaserモック
const createMockScene = () => {
  const mockGraphics = {
    fillStyle: vi.fn().mockReturnThis(),
    fillRoundedRect: vi.fn().mockReturnThis(),
    fillRect: vi.fn().mockReturnThis(),
    lineStyle: vi.fn().mockReturnThis(),
    strokeRoundedRect: vi.fn().mockReturnThis(),
    clear: vi.fn().mockReturnThis(),
  };

  const mockText = {
    setOrigin: vi.fn().mockReturnThis(),
    setAlpha: vi.fn().mockReturnThis(),
    text: '',
  };

  const mockContainer = {
    add: vi.fn().mockReturnThis(),
    setDepth: vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis(),
    setInteractive: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  };

  const mockTween = {
    add: vi.fn(),
  };

  return {
    add: {
      graphics: vi.fn(() => ({ ...mockGraphics })),
      text: vi.fn(() => ({ ...mockText })),
      container: vi.fn(() => ({ ...mockContainer })),
    },
    tweens: mockTween,
  };
};

describe('PhaseIndicator', () => {
  let mockScene: ReturnType<typeof createMockScene>;

  beforeEach(() => {
    mockScene = createMockScene();
  });

  describe('初期化', () => {
    it('デフォルトオプションで生成できる', () => {
      const indicator = new PhaseIndicator(mockScene as any);
      expect(indicator).toBeDefined();
      expect(indicator.container).toBeDefined();
    });

    it('カスタム位置で生成できる', () => {
      const indicator = new PhaseIndicator(mockScene as any, { x: 300, y: 150 });
      expect(indicator).toBeDefined();
      expect(mockScene.add.container).toHaveBeenCalledWith(300, 150);
    });

    it('初期フェーズはQUEST_ACCEPT', () => {
      const indicator = new PhaseIndicator(mockScene as any);
      expect(indicator.getCurrentPhase()).toBe(GamePhase.QUEST_ACCEPT);
    });

    it('クリック可能オプションを設定できる', () => {
      const onPhaseClick = vi.fn();
      const indicator = new PhaseIndicator(mockScene as any, {
        clickable: true,
        onPhaseClick,
      });
      expect(indicator).toBeDefined();
    });
  });

  describe('setCurrentPhase', () => {
    it('GATHERINGフェーズに変更できる', () => {
      const indicator = new PhaseIndicator(mockScene as any);
      indicator.setCurrentPhase(GamePhase.GATHERING);
      expect(indicator.getCurrentPhase()).toBe(GamePhase.GATHERING);
    });

    it('ALCHEMYフェーズに変更できる', () => {
      const indicator = new PhaseIndicator(mockScene as any);
      indicator.setCurrentPhase(GamePhase.ALCHEMY);
      expect(indicator.getCurrentPhase()).toBe(GamePhase.ALCHEMY);
    });

    it('DELIVERYフェーズに変更できる', () => {
      const indicator = new PhaseIndicator(mockScene as any);
      indicator.setCurrentPhase(GamePhase.DELIVERY);
      expect(indicator.getCurrentPhase()).toBe(GamePhase.DELIVERY);
    });

    it('アニメーションなしでフェーズを変更できる', () => {
      const indicator = new PhaseIndicator(mockScene as any);
      indicator.setCurrentPhase(GamePhase.GATHERING, false);
      expect(indicator.getCurrentPhase()).toBe(GamePhase.GATHERING);
    });

    it('アニメーション付きでフェーズを変更できる', () => {
      const indicator = new PhaseIndicator(mockScene as any);
      indicator.setCurrentPhase(GamePhase.GATHERING, true);
      expect(indicator.getCurrentPhase()).toBe(GamePhase.GATHERING);
      expect(mockScene.tweens.add).toHaveBeenCalled();
    });
  });

  describe('markPhaseCompleted', () => {
    it('フェーズを完了としてマークできる', () => {
      const indicator = new PhaseIndicator(mockScene as any);
      indicator.markPhaseCompleted(GamePhase.QUEST_ACCEPT);
      // 内部状態の確認は困難なため、エラーが起きないことを確認
      expect(indicator.getCurrentPhase()).toBe(GamePhase.QUEST_ACCEPT);
    });

    it('複数フェーズを完了としてマークできる', () => {
      const indicator = new PhaseIndicator(mockScene as any);
      indicator.markPhaseCompleted(GamePhase.QUEST_ACCEPT);
      indicator.markPhaseCompleted(GamePhase.GATHERING);
      expect(indicator).toBeDefined();
    });
  });

  describe('clearCompletedPhases', () => {
    it('完了フェーズをクリアできる', () => {
      const indicator = new PhaseIndicator(mockScene as any);
      indicator.markPhaseCompleted(GamePhase.QUEST_ACCEPT);
      indicator.clearCompletedPhases();
      expect(indicator).toBeDefined();
    });
  });

  describe('setPhaseEnabled', () => {
    it('フェーズを無効化できる', () => {
      const indicator = new PhaseIndicator(mockScene as any);
      indicator.setPhaseEnabled(GamePhase.GATHERING, false);
      expect(indicator).toBeDefined();
    });

    it('フェーズを有効化できる', () => {
      const indicator = new PhaseIndicator(mockScene as any);
      indicator.setPhaseEnabled(GamePhase.GATHERING, false);
      indicator.setPhaseEnabled(GamePhase.GATHERING, true);
      expect(indicator).toBeDefined();
    });
  });

  describe('setVisible', () => {
    it('非表示にできる', () => {
      const indicator = new PhaseIndicator(mockScene as any);
      indicator.setVisible(false);
      expect(indicator.container.setVisible).toHaveBeenCalledWith(false);
    });

    it('表示に戻せる', () => {
      const indicator = new PhaseIndicator(mockScene as any);
      indicator.setVisible(false);
      indicator.setVisible(true);
      expect(indicator.container.setVisible).toHaveBeenCalledWith(true);
    });
  });

  describe('destroy', () => {
    it('破棄できる', () => {
      const indicator = new PhaseIndicator(mockScene as any);
      indicator.destroy();
      expect(indicator.container.destroy).toHaveBeenCalled();
    });
  });
});
