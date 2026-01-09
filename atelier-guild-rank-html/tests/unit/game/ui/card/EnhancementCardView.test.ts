/**
 * EnhancementCardViewテスト
 *
 * 強化カードビューの動作テスト
 */

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';

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

import { EnhancementCardView, EnhancementCardViewOptions } from '../../../../../src/game/ui/card/EnhancementCardView';
import { IEnhancementCard } from '../../../../../src/domain/card/Card';
import { CardType, GuildRank, Rarity, EffectType, EnhancementTarget } from '../../../../../src/domain/common/types';
import { CardSize } from '../../../../../src/game/ui/card/CardConstants';
import { CardStateStyles } from '../../../../../src/game/ui/card/CardState';

// Phaserモック
const createMockScene = () => {
  const mockContainer = {
    add: vi.fn(),
    setPosition: vi.fn(),
    setScale: vi.fn(),
    setAlpha: vi.fn(),
    setInteractive: vi.fn(),
    disableInteractive: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    destroy: vi.fn(),
  };

  const mockGraphics = {
    clear: vi.fn().mockReturnThis(),
    fillStyle: vi.fn().mockReturnThis(),
    fillRoundedRect: vi.fn().mockReturnThis(),
    lineStyle: vi.fn().mockReturnThis(),
    strokeRoundedRect: vi.fn().mockReturnThis(),
  };

  const mockText = {
    setOrigin: vi.fn().mockReturnThis(),
    setText: vi.fn().mockReturnThis(),
  };

  return {
    add: {
      container: vi.fn(() => mockContainer),
      graphics: vi.fn(() => mockGraphics),
      text: vi.fn(() => mockText),
    },
    _mockContainer: mockContainer,
    _mockGraphics: mockGraphics,
    _mockText: mockText,
  };
};

// テスト用の強化カードデータ
const createTestEnhancementCard = (overrides?: Partial<IEnhancementCard>): IEnhancementCard => ({
  id: 'test-enhancement-001',
  name: 'テスト強化',
  type: CardType.ENHANCEMENT,
  rarity: Rarity.COMMON,
  unlockRank: GuildRank.G,
  description: '品質を+5する',
  cost: 0,
  effect: {
    type: EffectType.QUALITY_UP,
    value: 5,
  },
  targetAction: EnhancementTarget.ALCHEMY,
  ...overrides,
});

describe('EnhancementCardView', () => {
  let mockScene: ReturnType<typeof createMockScene>;

  beforeEach(() => {
    mockScene = createMockScene();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('コンストラクタ', () => {
    it('正しく初期化される', () => {
      const card = createTestEnhancementCard();
      const options: EnhancementCardViewOptions = {
        x: 100,
        y: 200,
        card,
      };

      const view = new EnhancementCardView(mockScene as any, options);

      expect(view).toBeDefined();
      expect(view.card).toBe(card);
      expect(view.container).toBe(mockScene._mockContainer);
    });

    it('コンテナが正しい位置に作成される', () => {
      const card = createTestEnhancementCard();
      const options: EnhancementCardViewOptions = {
        x: 150,
        y: 250,
        card,
      };

      new EnhancementCardView(mockScene as any, options);

      expect(mockScene.add.container).toHaveBeenCalledWith(150, 250);
    });

    it('背景グラフィックスが作成される', () => {
      const card = createTestEnhancementCard();
      const options: EnhancementCardViewOptions = {
        x: 0,
        y: 0,
        card,
      };

      new EnhancementCardView(mockScene as any, options);

      expect(mockScene.add.graphics).toHaveBeenCalled();
    });

    it('テキスト要素が作成される', () => {
      const card = createTestEnhancementCard();
      const options: EnhancementCardViewOptions = {
        x: 0,
        y: 0,
        card,
      };

      new EnhancementCardView(mockScene as any, options);

      // 種別ラベル、コスト、カード名、効果アイコン、効果説明の5つ
      expect(mockScene.add.text).toHaveBeenCalledTimes(5);
    });

    it('デフォルト状態はnormal', () => {
      const card = createTestEnhancementCard();
      const options: EnhancementCardViewOptions = {
        x: 0,
        y: 0,
        card,
      };

      const view = new EnhancementCardView(mockScene as any, options);

      expect(view.getState()).toBe('normal');
    });

    it('指定したサイズで作成できる', () => {
      const card = createTestEnhancementCard();
      const options: EnhancementCardViewOptions = {
        x: 0,
        y: 0,
        card,
        size: 'LARGE',
      };

      const view = new EnhancementCardView(mockScene as any, options);

      expect(view).toBeDefined();
    });

    it('指定した状態で作成できる', () => {
      const card = createTestEnhancementCard();
      const options: EnhancementCardViewOptions = {
        x: 0,
        y: 0,
        card,
        state: 'disabled',
      };

      const view = new EnhancementCardView(mockScene as any, options);

      expect(view.getState()).toBe('disabled');
    });
  });

  describe('状態管理', () => {
    it('getState()で現在の状態を取得できる', () => {
      const card = createTestEnhancementCard();
      const view = new EnhancementCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
        state: 'selected',
      });

      expect(view.getState()).toBe('selected');
    });

    it('setState()で状態を変更できる', () => {
      const card = createTestEnhancementCard();
      const view = new EnhancementCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
      });

      view.setState('hover');

      expect(view.getState()).toBe('hover');
    });

    it('状態変更時に表示が更新される', () => {
      const card = createTestEnhancementCard();
      const view = new EnhancementCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
      });

      // 初期描画でclearが呼ばれている
      const initialClearCount = (mockScene._mockGraphics.clear as Mock).mock.calls.length;

      view.setState('selected');

      // 状態変更で再度clearが呼ばれる
      expect(mockScene._mockGraphics.clear).toHaveBeenCalledTimes(initialClearCount + 1);
    });

    it('同じ状態に変更しても再描画されない', () => {
      const card = createTestEnhancementCard();
      const view = new EnhancementCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
        state: 'normal',
      });

      const initialClearCount = (mockScene._mockGraphics.clear as Mock).mock.calls.length;

      view.setState('normal');

      // 同じ状態なので再描画されない
      expect(mockScene._mockGraphics.clear).toHaveBeenCalledTimes(initialClearCount);
    });
  });

  describe('表示更新', () => {
    it('setPosition()で位置を変更できる', () => {
      const card = createTestEnhancementCard();
      const view = new EnhancementCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
      });

      view.setPosition(300, 400);

      expect(mockScene._mockContainer.setPosition).toHaveBeenCalledWith(300, 400);
    });

    it('setScale()でスケールを変更できる', () => {
      const card = createTestEnhancementCard();
      const view = new EnhancementCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
      });

      view.setScale(1.5);

      expect(mockScene._mockContainer.setScale).toHaveBeenCalledWith(1.5);
    });

    it('setAlpha()で透明度を変更できる', () => {
      const card = createTestEnhancementCard();
      const view = new EnhancementCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
      });

      view.setAlpha(0.5);

      expect(mockScene._mockContainer.setAlpha).toHaveBeenCalledWith(0.5);
    });
  });

  describe('インタラクション', () => {
    it('デフォルトでインタラクティブが有効', () => {
      const card = createTestEnhancementCard();
      new EnhancementCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
      });

      expect(mockScene._mockContainer.setInteractive).toHaveBeenCalled();
    });

    it('interactive: falseでインタラクティブが無効', () => {
      const card = createTestEnhancementCard();
      new EnhancementCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
        interactive: false,
      });

      expect(mockScene._mockContainer.setInteractive).not.toHaveBeenCalled();
    });

    it('setInteractive(false)でインタラクティブを無効化できる', () => {
      const card = createTestEnhancementCard();
      const view = new EnhancementCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
      });

      view.setInteractive(false);

      expect(mockScene._mockContainer.disableInteractive).toHaveBeenCalled();
    });

    it('setSelected(true)で選択状態になる', () => {
      const card = createTestEnhancementCard();
      const view = new EnhancementCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
      });

      view.setSelected(true);

      expect(view.getState()).toBe('selected');
    });

    it('setSelected(false)で通常状態に戻る', () => {
      const card = createTestEnhancementCard();
      const view = new EnhancementCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
        state: 'selected',
      });

      view.setSelected(false);

      expect(view.getState()).toBe('normal');
    });

    it('イベントハンドラが登録される', () => {
      const card = createTestEnhancementCard();
      new EnhancementCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
      });

      expect(mockScene._mockContainer.on).toHaveBeenCalledWith('pointerover', expect.any(Function), expect.anything());
      expect(mockScene._mockContainer.on).toHaveBeenCalledWith('pointerout', expect.any(Function), expect.anything());
      expect(mockScene._mockContainer.on).toHaveBeenCalledWith('pointerdown', expect.any(Function), expect.anything());
    });
  });

  describe('破棄', () => {
    it('destroy()でコンテナが破棄される', () => {
      const card = createTestEnhancementCard();
      const view = new EnhancementCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
      });

      view.destroy();

      expect(mockScene._mockContainer.destroy).toHaveBeenCalled();
    });

    it('destroy()でイベントハンドラが解除される', () => {
      const card = createTestEnhancementCard();
      const view = new EnhancementCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
      });

      view.destroy();

      expect(mockScene._mockContainer.off).toHaveBeenCalledWith('pointerover', expect.any(Function), expect.anything());
      expect(mockScene._mockContainer.off).toHaveBeenCalledWith('pointerout', expect.any(Function), expect.anything());
      expect(mockScene._mockContainer.off).toHaveBeenCalledWith('pointerdown', expect.any(Function), expect.anything());
    });
  });

  describe('効果表示', () => {
    it('QUALITY_UPのアイコンが表示される', () => {
      const card = createTestEnhancementCard({
        effect: {
          type: EffectType.QUALITY_UP,
          value: 10,
        },
      });

      new EnhancementCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
      });

      // テキスト作成時にアイコンが含まれる
      const textCalls = (mockScene.add.text as Mock).mock.calls;
      const iconTextCall = textCalls.find((call: unknown[]) =>
        typeof call[2] === 'string' && call[2].includes('⬆️')
      );
      expect(iconTextCall).toBeDefined();
    });

    it('COST_REDUCTIONのアイコンが表示される', () => {
      const card = createTestEnhancementCard({
        effect: {
          type: EffectType.COST_REDUCTION,
          value: 1,
        },
      });

      new EnhancementCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
      });

      // テキスト作成時にアイコンが含まれる
      const textCalls = (mockScene.add.text as Mock).mock.calls;
      const iconTextCall = textCalls.find((call: unknown[]) =>
        typeof call[2] === 'string' && call[2].includes('⚡')
      );
      expect(iconTextCall).toBeDefined();
    });

    it('GOLD_BONUSのアイコンが表示される', () => {
      const card = createTestEnhancementCard({
        effect: {
          type: EffectType.GOLD_BONUS,
          value: 100,
        },
      });

      new EnhancementCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
      });

      // テキスト作成時にアイコンが含まれる
      const textCalls = (mockScene.add.text as Mock).mock.calls;
      const iconTextCall = textCalls.find((call: unknown[]) =>
        typeof call[2] === 'string' && call[2].includes('💰')
      );
      expect(iconTextCall).toBeDefined();
    });

    it('説明文が表示される', () => {
      const card = createTestEnhancementCard({
        description: '調合品質+10',
      });

      new EnhancementCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
      });

      // テキスト作成時に説明文が含まれる
      const textCalls = (mockScene.add.text as Mock).mock.calls;
      const descTextCall = textCalls.find((call: unknown[]) =>
        typeof call[2] === 'string' && call[2].includes('調合品質+10')
      );
      expect(descTextCall).toBeDefined();
    });

    it('説明文がない場合は効果から生成される', () => {
      const card = createTestEnhancementCard({
        description: undefined,
        effect: {
          type: EffectType.QUALITY_UP,
          value: 5,
        },
      });

      new EnhancementCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
      });

      // テキスト作成時に生成された説明文が含まれる
      const textCalls = (mockScene.add.text as Mock).mock.calls;
      const descTextCall = textCalls.find((call: unknown[]) =>
        typeof call[2] === 'string' && call[2].includes('品質アップ')
      );
      expect(descTextCall).toBeDefined();
    });
  });

  describe('コスト表示', () => {
    it('コスト0が表示される', () => {
      const card = createTestEnhancementCard({
        cost: 0,
      });

      new EnhancementCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
      });

      // テキスト作成時にコスト0が含まれる
      const textCalls = (mockScene.add.text as Mock).mock.calls;
      const costTextCall = textCalls.find((call: unknown[]) =>
        call[2] === '0'
      );
      expect(costTextCall).toBeDefined();
    });
  });

  describe('カードサイズ', () => {
    it('STANDARDサイズで正しく描画される', () => {
      const card = createTestEnhancementCard();
      new EnhancementCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
        size: 'STANDARD',
      });

      const { width, height } = CardSize.STANDARD;
      expect(mockScene._mockGraphics.fillRoundedRect).toHaveBeenCalledWith(
        -width / 2,
        -height / 2,
        width,
        height,
        expect.any(Number)
      );
    });

    it('SMALLサイズで正しく描画される', () => {
      const card = createTestEnhancementCard();
      new EnhancementCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
        size: 'SMALL',
      });

      const { width, height } = CardSize.SMALL;
      expect(mockScene._mockGraphics.fillRoundedRect).toHaveBeenCalledWith(
        -width / 2,
        -height / 2,
        width,
        height,
        expect.any(Number)
      );
    });

    it('LARGEサイズで正しく描画される', () => {
      const card = createTestEnhancementCard();
      new EnhancementCardView(mockScene as any, {
        x: 0,
        y: 0,
        card,
        size: 'LARGE',
      });

      const { width, height } = CardSize.LARGE;
      expect(mockScene._mockGraphics.fillRoundedRect).toHaveBeenCalledWith(
        -width / 2,
        -height / 2,
        width,
        height,
        expect.any(Number)
      );
    });
  });
});
