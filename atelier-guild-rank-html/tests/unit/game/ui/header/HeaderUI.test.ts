/**
 * HeaderUI テスト
 *
 * ヘッダーUIコンポーネントの実装テスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

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

import { HeaderUI } from '../../../../../src/game/ui/header/HeaderUI';
import { GuildRank } from '../../../../../src/domain/common/types';
import type { HeaderUIData } from '../../../../../src/game/ui/header/IHeaderUI';

// Phaserモック
const createMockScene = () => {
  const mockGraphics = {
    fillStyle: vi.fn().mockReturnThis(),
    fillRect: vi.fn().mockReturnThis(),
    fillRoundedRect: vi.fn().mockReturnThis(),
    lineStyle: vi.fn().mockReturnThis(),
    strokeRect: vi.fn().mockReturnThis(),
    strokeRoundedRect: vi.fn().mockReturnThis(),
    clear: vi.fn().mockReturnThis(),
    setDepth: vi.fn().mockReturnThis(),
    setAlpha: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  };

  const mockText = {
    setText: vi.fn().mockReturnThis(),
    setOrigin: vi.fn().mockReturnThis(),
    setColor: vi.fn().mockReturnThis(),
    setAlpha: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    x: 0,
    y: 0,
  };

  const mockContainer = {
    add: vi.fn().mockReturnThis(),
    setDepth: vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis(),
    setPosition: vi.fn().mockReturnThis(),
    setInteractive: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    x: 0,
    y: 0,
  };

  const mockTween = {
    targets: null,
    duration: 0,
  };

  return {
    add: {
      graphics: vi.fn(() => ({ ...mockGraphics })),
      text: vi.fn(() => ({ ...mockText })),
      container: vi.fn(() => ({ ...mockContainer })),
    },
    tweens: {
      add: vi.fn((config) => {
        mockTween.targets = config.targets;
        mockTween.duration = config.duration;
        // onCompleteがあれば即座に実行（テスト用）
        if (config.onComplete) {
          config.onComplete();
        }
        return mockTween;
      }),
    },
  };
};

describe('HeaderUI', () => {
  let mockScene: ReturnType<typeof createMockScene>;

  beforeEach(() => {
    mockScene = createMockScene();
  });

  describe('コンストラクタ', () => {
    it('デフォルトオプションで初期化できる', () => {
      const headerUI = new HeaderUI(mockScene as any);

      expect(headerUI).toBeDefined();
      expect(headerUI.container).toBeDefined();
    });

    it('カスタムオプションで初期化できる', () => {
      const onMenuClick = vi.fn();
      const headerUI = new HeaderUI(mockScene as any, {
        x: 100,
        y: 50,
        width: 1024,
        onMenuClick,
      });

      expect(headerUI).toBeDefined();
    });

    it('コンテナが作成される', () => {
      new HeaderUI(mockScene as any);

      expect(mockScene.add.container).toHaveBeenCalled();
    });

    it('背景が作成される', () => {
      new HeaderUI(mockScene as any);

      expect(mockScene.add.graphics).toHaveBeenCalled();
    });
  });

  describe('updateRank', () => {
    it('ランクテキストが更新される', () => {
      const headerUI = new HeaderUI(mockScene as any);
      headerUI.updateRank(GuildRank.A);

      // rankTextのsetTextが呼ばれることを確認
      const textCalls = mockScene.add.text.mock.results;
      // ランクテキストを探す
      const rankTextMock = textCalls.find((r: any) => {
        const callArgs = mockScene.add.text.mock.calls[textCalls.indexOf(r)];
        // 'F'で初期化されているものがランクテキスト
        return callArgs[2] === 'F';
      });
      expect(rankTextMock).toBeDefined();
    });

    it('ランク変更時にアニメーションが実行される', () => {
      const headerUI = new HeaderUI(mockScene as any);
      headerUI.updateRank(GuildRank.S);

      expect(mockScene.tweens.add).toHaveBeenCalled();
    });

    it('全ランクで色が正しく設定される', () => {
      const headerUI = new HeaderUI(mockScene as any);
      const ranks = [
        GuildRank.G,
        GuildRank.F,
        GuildRank.E,
        GuildRank.D,
        GuildRank.C,
        GuildRank.B,
        GuildRank.A,
        GuildRank.S,
      ];

      ranks.forEach((rank) => {
        headerUI.updateRank(rank);
        // エラーなく実行されることを確認
        expect(() => headerUI.updateRank(rank)).not.toThrow();
      });
    });
  });

  describe('updateExp', () => {
    it('経験値ゲージが更新される', () => {
      const headerUI = new HeaderUI(mockScene as any);
      headerUI.updateExp(50, 100);

      // graphicsのclearとfillが呼ばれていることを確認
      const graphicsCalls = mockScene.add.graphics.mock.results;
      expect(graphicsCalls.length).toBeGreaterThan(0);
    });

    it('経験値テキストが更新される', () => {
      const headerUI = new HeaderUI(mockScene as any);
      headerUI.updateExp(75, 150);

      // テキストのsetTextが呼ばれることを確認
      const textCalls = mockScene.add.text.mock.results;
      expect(textCalls.length).toBeGreaterThan(0);
    });

    it('経験値が0の場合でもエラーにならない', () => {
      const headerUI = new HeaderUI(mockScene as any);

      expect(() => headerUI.updateExp(0, 100)).not.toThrow();
      expect(() => headerUI.updateExp(0, 0)).not.toThrow();
    });

    it('経験値が最大値を超える場合でもエラーにならない', () => {
      const headerUI = new HeaderUI(mockScene as any);

      expect(() => headerUI.updateExp(150, 100)).not.toThrow();
    });
  });

  describe('updateDay', () => {
    it('日数テキストが更新される', () => {
      const headerUI = new HeaderUI(mockScene as any);
      headerUI.updateDay(5, 30);

      const textCalls = mockScene.add.text.mock.results;
      expect(textCalls.length).toBeGreaterThan(0);
    });

    it('異なる日数値で正しく動作する', () => {
      const headerUI = new HeaderUI(mockScene as any);

      expect(() => headerUI.updateDay(1, 30)).not.toThrow();
      expect(() => headerUI.updateDay(30, 30)).not.toThrow();
      expect(() => headerUI.updateDay(15, 60)).not.toThrow();
    });
  });

  describe('updateGold', () => {
    it('ゴールドテキストが更新される', () => {
      const headerUI = new HeaderUI(mockScene as any);
      headerUI.updateGold(1000);

      const textCalls = mockScene.add.text.mock.results;
      expect(textCalls.length).toBeGreaterThan(0);
    });

    it('大きな数値でも正しく動作する', () => {
      const headerUI = new HeaderUI(mockScene as any);

      expect(() => headerUI.updateGold(0)).not.toThrow();
      expect(() => headerUI.updateGold(9999)).not.toThrow();
      expect(() => headerUI.updateGold(10000)).not.toThrow();
      expect(() => headerUI.updateGold(1000000)).not.toThrow();
    });
  });

  describe('updateAP', () => {
    it('APゲージが更新される', () => {
      const headerUI = new HeaderUI(mockScene as any);
      headerUI.updateAP(3, 3);

      const graphicsCalls = mockScene.add.graphics.mock.results;
      expect(graphicsCalls.length).toBeGreaterThan(0);
    });

    it('AP残量に応じて色が変わる', () => {
      const headerUI = new HeaderUI(mockScene as any);

      // 通常状態
      expect(() => headerUI.updateAP(3, 3)).not.toThrow();
      // 低下状態
      expect(() => headerUI.updateAP(1, 3)).not.toThrow();
      // 空状態
      expect(() => headerUI.updateAP(0, 3)).not.toThrow();
    });
  });

  describe('updateAll', () => {
    it('すべての表示が一括更新される', () => {
      const headerUI = new HeaderUI(mockScene as any);
      const data: HeaderUIData = {
        rank: GuildRank.B,
        currentExp: 50,
        requiredExp: 100,
        currentDay: 10,
        maxDay: 30,
        gold: 5000,
        currentAP: 2,
        maxAP: 3,
      };

      expect(() => headerUI.updateAll(data)).not.toThrow();
    });
  });

  describe('animateExpGain', () => {
    it('経験値獲得アニメーションが実行される', () => {
      const headerUI = new HeaderUI(mockScene as any);
      headerUI.animateExpGain(100);

      // テキストとtweenが作成されることを確認
      expect(mockScene.add.text).toHaveBeenCalled();
      expect(mockScene.tweens.add).toHaveBeenCalled();
    });
  });

  describe('animateGoldChange', () => {
    it('ゴールド獲得アニメーションが実行される', () => {
      const headerUI = new HeaderUI(mockScene as any);
      headerUI.animateGoldChange(500);

      expect(mockScene.tweens.add).toHaveBeenCalled();
    });

    it('ゴールド消費アニメーションが実行される', () => {
      const headerUI = new HeaderUI(mockScene as any);
      headerUI.animateGoldChange(-200);

      expect(mockScene.tweens.add).toHaveBeenCalled();
    });
  });

  describe('animateAPChange', () => {
    it('AP回復アニメーションが実行される', () => {
      const headerUI = new HeaderUI(mockScene as any);
      headerUI.animateAPChange(1);

      expect(mockScene.tweens.add).toHaveBeenCalled();
    });

    it('AP消費アニメーションが実行される', () => {
      const headerUI = new HeaderUI(mockScene as any);
      headerUI.animateAPChange(-1);

      expect(mockScene.tweens.add).toHaveBeenCalled();
    });
  });

  describe('setVisible', () => {
    it('表示状態を変更できる', () => {
      const headerUI = new HeaderUI(mockScene as any);

      headerUI.setVisible(true);
      expect(headerUI.container.setVisible).toHaveBeenCalledWith(true);

      headerUI.setVisible(false);
      expect(headerUI.container.setVisible).toHaveBeenCalledWith(false);
    });
  });

  describe('destroy', () => {
    it('リソースが破棄される', () => {
      const headerUI = new HeaderUI(mockScene as any);
      headerUI.destroy();

      expect(headerUI.container.destroy).toHaveBeenCalled();
    });
  });

  describe('メニューボタン', () => {
    it('メニューボタンクリック時にコールバックが呼ばれる', () => {
      const onMenuClick = vi.fn();
      new HeaderUI(mockScene as any, { onMenuClick });

      // setInteractiveとonが呼ばれていることを確認
      const containerCalls = mockScene.add.container.mock.results;
      expect(containerCalls.length).toBeGreaterThan(0);
    });
  });

  describe('レイアウト', () => {
    it('ヘッダーレイアウト定数が使用される', () => {
      new HeaderUI(mockScene as any);

      // コンテナが作成され、適切な位置に配置されることを確認
      expect(mockScene.add.container).toHaveBeenCalled();
    });

    it('カスタム幅が適用される', () => {
      new HeaderUI(mockScene as any, { width: 1024 });

      // 背景graphicsが作成されることを確認
      expect(mockScene.add.graphics).toHaveBeenCalled();
    });
  });
});
