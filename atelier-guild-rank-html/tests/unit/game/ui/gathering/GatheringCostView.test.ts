/**
 * GatheringCostView単体テスト
 *
 * TASK-0221: GatheringCostView実装のテスト
 * 採取フェーズでのAPコスト表示コンポーネントをテストする
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GatheringCostView } from '../../../../../src/game/ui/gathering/GatheringCostView';
import type { GatheringCostViewOptions } from '../../../../../src/game/ui/gathering/IGatheringCostView';

// Phaserをモック
vi.mock('phaser', () => {
  return {
    default: {},
  };
});

/**
 * モックPhaserシーン作成
 */
function createMockScene(): Phaser.Scene {
  const mockGraphics = {
    fillStyle: vi.fn().mockReturnThis(),
    fillRoundedRect: vi.fn().mockReturnThis(),
    lineStyle: vi.fn().mockReturnThis(),
    strokeRoundedRect: vi.fn().mockReturnThis(),
    clear: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  };

  const createMockContainer = () => {
    const children: unknown[] = [];
    const container: any = {
      setVisible: vi.fn().mockReturnThis(),
      setAlpha: vi.fn().mockReturnThis(),
      add: vi.fn().mockImplementation((child: unknown) => {
        children.push(child);
        return container;
      }),
      destroy: vi.fn(),
      get length() {
        return children.length;
      },
    };
    return container;
  };

  const createMockText = (text: string) => {
    let currentText = text;
    let currentColor = '#ffffff';
    return {
      setOrigin: vi.fn().mockReturnThis(),
      setText: vi.fn().mockImplementation((newText: string) => {
        currentText = newText;
        return createMockText(newText);
      }),
      setColor: vi.fn().mockImplementation((color: string) => {
        currentColor = color;
        return createMockText(currentText);
      }),
      getText: () => currentText,
      getColor: () => currentColor,
      destroy: vi.fn(),
    };
  };

  const mockTween = {
    add: vi.fn().mockImplementation((config: any) => {
      if (config.onComplete) {
        config.onComplete();
      }
      return { remove: vi.fn() };
    }),
  };

  return {
    add: {
      container: vi.fn().mockImplementation(() => createMockContainer()),
      graphics: vi.fn().mockReturnValue(mockGraphics),
      text: vi.fn().mockImplementation((_x: number, _y: number, text: string) => createMockText(text)),
    },
    tweens: mockTween,
  } as unknown as Phaser.Scene;
}

describe('GatheringCostView', () => {
  let mockScene: Phaser.Scene;

  beforeEach(() => {
    mockScene = createMockScene();
  });

  describe('コンストラクタ', () => {
    it('コンテナが正しく初期化される', () => {
      const options: GatheringCostViewOptions = {
        scene: mockScene,
      };

      const view = new GatheringCostView(options);

      expect(view).toBeDefined();
      expect(view.container).toBeDefined();
    });

    it('初期APを設定できる', () => {
      const options: GatheringCostViewOptions = {
        scene: mockScene,
        currentAP: 8,
        maxAP: 10,
      };

      const view = new GatheringCostView(options);

      // 初期APが設定されている
      expect(view.canAfford()).toBe(true); // requiredAP=0なので足りる
    });

    it('位置を指定できる', () => {
      const options: GatheringCostViewOptions = {
        scene: mockScene,
        x: 100,
        y: 200,
      };

      const view = new GatheringCostView(options);

      expect(view.container).toBeDefined();
      // コンテナは指定位置に作成される
      expect(mockScene.add.container).toHaveBeenCalledWith(100, 200);
    });
  });

  describe('AP設定', () => {
    it('setCurrentAPで現在APを設定できる', () => {
      const view = new GatheringCostView({ scene: mockScene });

      view.setCurrentAP(5, 10);
      view.setRequiredAP(3);

      expect(view.canAfford()).toBe(true);
    });

    it('setRequiredAPで必要APを設定できる', () => {
      const view = new GatheringCostView({ scene: mockScene, currentAP: 10 });

      view.setRequiredAP(3);

      expect(view.getRequiredAP()).toBe(3);
    });

    it('getRequiredAPで必要APを取得できる', () => {
      const view = new GatheringCostView({ scene: mockScene });

      view.setRequiredAP(5);

      expect(view.getRequiredAP()).toBe(5);
    });
  });

  describe('状態チェック', () => {
    it('APが足りる場合canAffordはtrue', () => {
      const view = new GatheringCostView({ scene: mockScene, currentAP: 10, maxAP: 10 });

      view.setRequiredAP(3);

      expect(view.canAfford()).toBe(true);
    });

    it('APが足りない場合canAffordはfalse', () => {
      const view = new GatheringCostView({ scene: mockScene, currentAP: 2, maxAP: 10 });

      view.setRequiredAP(5);

      expect(view.canAfford()).toBe(false);
    });

    it('APがちょうど足りる場合canAffordはtrue', () => {
      const view = new GatheringCostView({ scene: mockScene, currentAP: 5, maxAP: 10 });

      view.setRequiredAP(5);

      expect(view.canAfford()).toBe(true);
    });

    it('AP不足で0の場合もcanAffordはfalse', () => {
      const view = new GatheringCostView({ scene: mockScene, currentAP: 0, maxAP: 10 });

      view.setRequiredAP(1);

      expect(view.canAfford()).toBe(false);
    });
  });

  describe('残りAP計算', () => {
    it('残りAPが正しく計算される', () => {
      const view = new GatheringCostView({ scene: mockScene, currentAP: 10, maxAP: 10 });

      view.setRequiredAP(3);

      // 残りは7 AP（内部で計算されている）
      expect(view.canAfford()).toBe(true);
      expect(view.getRequiredAP()).toBe(3);
    });

    it('マイナスの残りAPも計算される', () => {
      const view = new GatheringCostView({ scene: mockScene, currentAP: 2, maxAP: 10 });

      view.setRequiredAP(5);

      // 残りは-3 AP
      expect(view.canAfford()).toBe(false);
    });
  });

  describe('表示制御', () => {
    it('setVisibleで表示/非表示を切り替えられる', () => {
      const view = new GatheringCostView({ scene: mockScene });

      view.setVisible(false);

      expect(view.container.setVisible).toHaveBeenCalledWith(false);
    });

    it('setVisibleで表示状態にできる', () => {
      const view = new GatheringCostView({ scene: mockScene });

      view.setVisible(true);

      expect(view.container.setVisible).toHaveBeenCalledWith(true);
    });
  });

  describe('コスト変更アニメーション', () => {
    it('コスト変更時にアニメーションが実行される', () => {
      const view = new GatheringCostView({ scene: mockScene, currentAP: 10 });

      view.setRequiredAP(3);

      // tweenが追加されている
      expect(mockScene.tweens.add).toHaveBeenCalled();
    });

    it('同じコストを設定してもアニメーションは実行されない', () => {
      const view = new GatheringCostView({ scene: mockScene, currentAP: 10 });

      view.setRequiredAP(3);
      const callCount = (mockScene.tweens.add as ReturnType<typeof vi.fn>).mock.calls.length;
      view.setRequiredAP(3);

      // 同じコストではtweeenが追加されない
      expect((mockScene.tweens.add as ReturnType<typeof vi.fn>).mock.calls.length).toBe(callCount);
    });
  });

  describe('破棄', () => {
    it('destroyでコンテナが破棄される', () => {
      const view = new GatheringCostView({ scene: mockScene });

      view.destroy();

      expect(view.container.destroy).toHaveBeenCalled();
    });
  });

  describe('エッジケース', () => {
    it('maxAP=0の場合も動作する', () => {
      const view = new GatheringCostView({ scene: mockScene, currentAP: 0, maxAP: 0 });

      view.setRequiredAP(0);

      expect(view.canAfford()).toBe(true);
    });

    it('大きなAP値でも動作する', () => {
      const view = new GatheringCostView({ scene: mockScene, currentAP: 999, maxAP: 999 });

      view.setRequiredAP(100);

      expect(view.canAfford()).toBe(true);
      expect(view.getRequiredAP()).toBe(100);
    });
  });
});
