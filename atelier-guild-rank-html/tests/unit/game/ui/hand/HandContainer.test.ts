/**
 * HandContainerテスト
 *
 * 手札コンテナの動作テスト
 */

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';

// Phaserのモック
vi.mock('phaser', () => {
  const Rectangle = function (
    this: { x: number; y: number; width: number; height: number },
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  };
  Rectangle.Contains = vi.fn(() => true);

  return {
    default: {
      Geom: {
        Rectangle,
      },
    },
    Geom: {
      Rectangle,
    },
  };
});

import { HandContainer } from '../../../../../src/game/ui/hand/HandContainer';
import { HandContainerOptions } from '../../../../../src/game/ui/hand/IHandContainer';
import { Card, IGatheringCard } from '../../../../../src/domain/card/Card';
import { CardType, GuildRank, Rarity } from '../../../../../src/domain/common/types';
import { HandLayout } from '../../../../../src/game/ui/hand/HandConstants';

// モックシーン作成
const createMockScene = () => {
  const mockContainer = {
    add: vi.fn(),
    setPosition: vi.fn().mockReturnThis(),
    setScale: vi.fn().mockReturnThis(),
    setAlpha: vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis(),
    setDepth: vi.fn().mockReturnThis(),
    setRotation: vi.fn().mockReturnThis(),
    setSize: vi.fn().mockReturnThis(),
    setInteractive: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    off: vi.fn().mockReturnThis(),
    removeInteractive: vi.fn().mockReturnThis(),
    disableInteractive: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    x: 0,
    y: 0,
  };

  const mockGraphics = {
    clear: vi.fn().mockReturnThis(),
    fillStyle: vi.fn().mockReturnThis(),
    fillRoundedRect: vi.fn().mockReturnThis(),
    lineStyle: vi.fn().mockReturnThis(),
    strokeRoundedRect: vi.fn().mockReturnThis(),
    fillRect: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  };

  const mockText = {
    setOrigin: vi.fn().mockReturnThis(),
    setText: vi.fn().mockReturnThis(),
    setWordWrapWidth: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    height: 20,
  };

  return {
    add: {
      container: vi.fn(() => ({ ...mockContainer })),
      graphics: vi.fn(() => ({ ...mockGraphics })),
      text: vi.fn(() => ({ ...mockText })),
      image: vi.fn(() => ({
        setOrigin: vi.fn().mockReturnThis(),
        setScale: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
      })),
    },
    tweens: {
      add: vi.fn((config: { onComplete?: () => void }) => {
        // onCompleteを即座に実行
        if (config.onComplete) {
          config.onComplete();
        }
        return config;
      }),
    },
    cameras: {
      main: {
        width: 1280,
        height: 720,
      },
    },
    input: {
      setDraggable: vi.fn(),
      keyboard: {
        on: vi.fn().mockReturnThis(),
        off: vi.fn().mockReturnThis(),
      },
    },
  };
};

// テスト用カード作成
const createTestCard = (id: string = 'test-001'): IGatheringCard => ({
  id: `test-${id}`,
  name: `テストカード${id}`,
  type: CardType.GATHERING,
  rarity: Rarity.COMMON,
  unlockRank: GuildRank.G,
  description: 'テスト用カード',
  cost: 1,
  materials: [],
});

describe('HandContainer', () => {
  let mockScene: ReturnType<typeof createMockScene>;

  beforeEach(() => {
    mockScene = createMockScene();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('コンストラクタ', () => {
    it('正しく初期化される', () => {
      const container = new HandContainer(mockScene as any);

      expect(container).toBeDefined();
      expect(container.container).toBeDefined();
      expect(mockScene.add.container).toHaveBeenCalled();
    });

    it('デフォルトオプションで初期化される', () => {
      const container = new HandContainer(mockScene as any);

      expect(container.getLayoutType()).toBe('horizontal');
      expect(container.getCardCount()).toBe(0);
      expect(container.getSelectedIndex()).toBe(-1);
    });

    it('カスタムオプションで初期化できる', () => {
      const options: HandContainerOptions = {
        x: 400,
        y: 500,
        layoutType: 'fan',
      };
      const container = new HandContainer(mockScene as any, options);

      expect(container.getLayoutType()).toBe('fan');
    });
  });

  describe('setCards()', () => {
    it('カードを設定できる', () => {
      const container = new HandContainer(mockScene as any);
      const cards = [createTestCard('001'), createTestCard('002')];

      container.setCards(cards);

      expect(container.getCardCount()).toBe(2);
      expect(container.getCards()).toHaveLength(2);
    });

    it('既存のカードを置き換える', () => {
      const container = new HandContainer(mockScene as any);
      container.setCards([createTestCard('001')]);
      container.setCards([createTestCard('002'), createTestCard('003')]);

      expect(container.getCardCount()).toBe(2);
    });

    it('選択状態がリセットされる', () => {
      const container = new HandContainer(mockScene as any);
      const cards = [createTestCard('001')];
      container.setCards(cards);
      container.selectCard(0);

      container.setCards([createTestCard('002')]);

      expect(container.getSelectedIndex()).toBe(-1);
    });
  });

  describe('addCard()', () => {
    it('カードを追加できる', () => {
      const container = new HandContainer(mockScene as any);

      container.addCard(createTestCard('001'));

      expect(container.getCardCount()).toBe(1);
    });

    it('複数のカードを順番に追加できる', () => {
      const container = new HandContainer(mockScene as any);

      container.addCard(createTestCard('001'));
      container.addCard(createTestCard('002'));
      container.addCard(createTestCard('003'));

      expect(container.getCardCount()).toBe(3);
    });

    it('アニメーション付きで追加できる', () => {
      const container = new HandContainer(mockScene as any);

      container.addCard(createTestCard('001'), true);

      expect(mockScene.tweens.add).toHaveBeenCalled();
    });

    it('アニメーションなしで追加できる', () => {
      const container = new HandContainer(mockScene as any);

      container.addCard(createTestCard('001'), false);

      expect(container.getCardCount()).toBe(1);
    });
  });

  describe('removeCard()', () => {
    it('インデックスでカードを削除できる', () => {
      const container = new HandContainer(mockScene as any);
      container.setCards([createTestCard('001'), createTestCard('002')]);

      container.removeCard(0);

      expect(container.getCardCount()).toBe(1);
    });

    it('カードオブジェクトで削除できる', () => {
      const container = new HandContainer(mockScene as any);
      const card1 = createTestCard('001');
      const card2 = createTestCard('002');
      container.setCards([card1, card2]);

      container.removeCard(card1);

      expect(container.getCardCount()).toBe(1);
    });

    it('存在しないインデックスでは何も起こらない', () => {
      const container = new HandContainer(mockScene as any);
      container.setCards([createTestCard('001')]);

      container.removeCard(5);

      expect(container.getCardCount()).toBe(1);
    });

    it('削除後にレイアウトが再調整される', () => {
      const container = new HandContainer(mockScene as any);
      container.setCards([
        createTestCard('001'),
        createTestCard('002'),
        createTestCard('003'),
      ]);

      container.removeCard(1);

      expect(container.getCardCount()).toBe(2);
    });
  });

  describe('getCards()', () => {
    it('カードの配列を取得できる', () => {
      const container = new HandContainer(mockScene as any);
      const cards = [createTestCard('001'), createTestCard('002')];
      container.setCards(cards);

      const result = container.getCards();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('test-001');
    });

    it('空の場合は空配列を返す', () => {
      const container = new HandContainer(mockScene as any);

      const result = container.getCards();

      expect(result).toEqual([]);
    });

    it('返された配列を変更しても元の配列に影響しない', () => {
      const container = new HandContainer(mockScene as any);
      container.setCards([createTestCard('001')]);

      const result = container.getCards();
      result.push(createTestCard('002'));

      expect(container.getCardCount()).toBe(1);
    });
  });

  describe('selectCard()', () => {
    it('インデックスでカードを選択できる', () => {
      const container = new HandContainer(mockScene as any);
      container.setCards([createTestCard('001')]);

      container.selectCard(0);

      expect(container.getSelectedIndex()).toBe(0);
    });

    it('カードオブジェクトで選択できる', () => {
      const container = new HandContainer(mockScene as any);
      const card = createTestCard('001');
      container.setCards([card]);

      container.selectCard(card);

      expect(container.getSelectedIndex()).toBe(0);
    });

    it('選択コールバックが呼ばれる', () => {
      const onCardSelect = vi.fn();
      const container = new HandContainer(mockScene as any, { onCardSelect });
      container.setCards([createTestCard('001')]);

      container.selectCard(0);

      expect(onCardSelect).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'test-001' }),
        0
      );
    });

    it('存在しないインデックスでは選択されない', () => {
      const container = new HandContainer(mockScene as any);
      container.setCards([createTestCard('001')]);

      container.selectCard(5);

      expect(container.getSelectedIndex()).toBe(-1);
    });

    it('selectable=falseの場合は選択できない', () => {
      const container = new HandContainer(mockScene as any);
      container.setCards([createTestCard('001')]);
      container.setSelectable(false);

      container.selectCard(0);

      expect(container.getSelectedIndex()).toBe(-1);
    });
  });

  describe('deselectCard()', () => {
    it('選択を解除できる', () => {
      const container = new HandContainer(mockScene as any);
      container.setCards([createTestCard('001')]);
      container.selectCard(0);

      container.deselectCard();

      expect(container.getSelectedIndex()).toBe(-1);
    });

    it('解除コールバックが呼ばれる', () => {
      const onCardDeselect = vi.fn();
      const container = new HandContainer(mockScene as any, { onCardDeselect });
      container.setCards([createTestCard('001')]);
      container.selectCard(0);

      container.deselectCard();

      expect(onCardDeselect).toHaveBeenCalled();
    });

    it('未選択時は何も起こらない', () => {
      const onCardDeselect = vi.fn();
      const container = new HandContainer(mockScene as any, { onCardDeselect });
      container.setCards([createTestCard('001')]);

      container.deselectCard();

      expect(onCardDeselect).not.toHaveBeenCalled();
    });
  });

  describe('getSelectedCard()', () => {
    it('選択中のカードを取得できる', () => {
      const container = new HandContainer(mockScene as any);
      const card = createTestCard('001');
      container.setCards([card]);
      container.selectCard(0);

      const result = container.getSelectedCard();

      expect(result).not.toBeNull();
      expect(result?.id).toBe('test-001');
    });

    it('未選択時はnullを返す', () => {
      const container = new HandContainer(mockScene as any);
      container.setCards([createTestCard('001')]);

      const result = container.getSelectedCard();

      expect(result).toBeNull();
    });
  });

  describe('setSelectable()', () => {
    it('選択可能状態を設定できる', () => {
      const container = new HandContainer(mockScene as any);
      container.setCards([createTestCard('001')]);

      container.setSelectable(false);
      container.selectCard(0);

      expect(container.getSelectedIndex()).toBe(-1);
    });
  });

  describe('setLayoutType()', () => {
    it('レイアウトタイプを変更できる', () => {
      const container = new HandContainer(mockScene as any);

      container.setLayoutType('fan');

      expect(container.getLayoutType()).toBe('fan');
    });

    it('変更時にレイアウトが再適用される', () => {
      const container = new HandContainer(mockScene as any);
      container.setCards([createTestCard('001'), createTestCard('002')]);

      const initialCallCount = (mockScene.tweens.add as Mock).mock.calls.length;
      container.setLayoutType('fan');

      expect((mockScene.tweens.add as Mock).mock.calls.length).toBeGreaterThan(
        initialCallCount
      );
    });
  });

  describe('setVisible()', () => {
    it('表示/非表示を切り替えられる', () => {
      const container = new HandContainer(mockScene as any);

      container.setVisible(false);

      expect(container.container.setVisible).toHaveBeenCalledWith(false);
    });
  });

  describe('setPosition()', () => {
    it('位置を設定できる', () => {
      const container = new HandContainer(mockScene as any);
      container.setCards([createTestCard('001')]);

      container.setPosition(400, 500);

      // レイアウトが再適用される
      expect(container.getCardCount()).toBe(1);
    });
  });

  describe('refresh()', () => {
    it('レイアウトを更新できる', () => {
      const container = new HandContainer(mockScene as any);
      container.setCards([createTestCard('001')]);

      container.refresh();

      // エラーなく実行される
      expect(container.getCardCount()).toBe(1);
    });
  });

  describe('destroy()', () => {
    it('コンテナを破棄できる', () => {
      const container = new HandContainer(mockScene as any);
      container.setCards([createTestCard('001')]);

      container.destroy();

      expect(container.container.destroy).toHaveBeenCalled();
    });
  });

  describe('カード選択の切り替え', () => {
    it('別のカードを選択すると前の選択が解除される', () => {
      const container = new HandContainer(mockScene as any);
      container.setCards([createTestCard('001'), createTestCard('002')]);

      container.selectCard(0);
      expect(container.getSelectedIndex()).toBe(0);

      container.selectCard(1);
      expect(container.getSelectedIndex()).toBe(1);
    });
  });

  describe('削除時の選択インデックス調整', () => {
    it('選択中のカードが削除されると選択が解除される', () => {
      const container = new HandContainer(mockScene as any);
      container.setCards([createTestCard('001'), createTestCard('002')]);
      container.selectCard(0);

      container.removeCard(0);

      expect(container.getSelectedIndex()).toBe(-1);
    });

    it('選択カードより前のカードが削除されるとインデックスが調整される', () => {
      const container = new HandContainer(mockScene as any);
      container.setCards([
        createTestCard('001'),
        createTestCard('002'),
        createTestCard('003'),
      ]);
      container.selectCard(2);

      container.removeCard(0);

      expect(container.getSelectedIndex()).toBe(1);
    });
  });

  // ========================================
  // TASK-0197: カード選択機能強化
  // ========================================

  describe('選択フィルター機能', () => {
    it('setSelectableFilterでフィルターを設定できる', () => {
      const container = new HandContainer(mockScene as any);
      const card1 = { ...createTestCard('001'), cost: 1 };
      const card2 = { ...createTestCard('002'), cost: 3 };
      container.setCards([card1, card2]);

      // コスト2以下のみ選択可能
      container.setSelectableFilter((card) => card.cost <= 2);

      // コスト1のカードは選択可能
      container.selectCard(0);
      expect(container.getSelectedIndex()).toBe(0);

      // コスト3のカードは選択不可
      container.deselectCard();
      container.selectCard(1);
      expect(container.getSelectedIndex()).toBe(-1);
    });

    it('clearSelectableFilterでフィルターを解除できる', () => {
      const container = new HandContainer(mockScene as any);
      const card1 = { ...createTestCard('001'), cost: 1 };
      const card2 = { ...createTestCard('002'), cost: 3 };
      container.setCards([card1, card2]);

      container.setSelectableFilter((card) => card.cost <= 2);
      container.clearSelectableFilter();

      // フィルター解除後はすべてのカードが選択可能
      container.selectCard(1);
      expect(container.getSelectedIndex()).toBe(1);
    });

    it('フィルター変更時に既存の選択が無効な場合は解除される', () => {
      const container = new HandContainer(mockScene as any);
      const card1 = { ...createTestCard('001'), cost: 1 };
      const card2 = { ...createTestCard('002'), cost: 3 };
      container.setCards([card1, card2]);

      container.selectCard(1);
      expect(container.getSelectedIndex()).toBe(1);

      // フィルター適用で選択中カードが無効になる
      container.setSelectableFilter((card) => card.cost <= 2);
      expect(container.getSelectedIndex()).toBe(-1);
    });

    it('isCardSelectable()で選択可否を確認できる', () => {
      const container = new HandContainer(mockScene as any);
      const card1 = { ...createTestCard('001'), cost: 1 };
      const card2 = { ...createTestCard('002'), cost: 3 };
      container.setCards([card1, card2]);

      container.setSelectableFilter((card) => card.cost <= 2);

      expect(container.isCardSelectable(0)).toBe(true);
      expect(container.isCardSelectable(1)).toBe(false);
    });
  });

  describe('キーボード操作', () => {
    let mockKeyboard: {
      on: ReturnType<typeof vi.fn>;
      off: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
      mockKeyboard = {
        on: vi.fn().mockReturnThis(),
        off: vi.fn().mockReturnThis(),
      };
      mockScene.input.keyboard = mockKeyboard;
    });

    it('enableKeyboardNavigation()でキーボード操作を有効化できる', () => {
      const container = new HandContainer(mockScene as any);
      container.setCards([createTestCard('001'), createTestCard('002')]);

      container.enableKeyboardNavigation();

      expect(mockKeyboard.on).toHaveBeenCalledWith(
        'keydown-LEFT',
        expect.any(Function),
        expect.anything()
      );
      expect(mockKeyboard.on).toHaveBeenCalledWith(
        'keydown-RIGHT',
        expect.any(Function),
        expect.anything()
      );
      expect(mockKeyboard.on).toHaveBeenCalledWith(
        'keydown-ENTER',
        expect.any(Function),
        expect.anything()
      );
      expect(mockKeyboard.on).toHaveBeenCalledWith(
        'keydown-ESC',
        expect.any(Function),
        expect.anything()
      );
    });

    it('disableKeyboardNavigation()でキーボード操作を無効化できる', () => {
      const container = new HandContainer(mockScene as any);
      container.enableKeyboardNavigation();
      container.disableKeyboardNavigation();

      expect(mockKeyboard.off).toHaveBeenCalledWith(
        'keydown-LEFT',
        expect.any(Function),
        expect.anything()
      );
    });

    it('左キーで前のカードを選択できる', () => {
      const container = new HandContainer(mockScene as any);
      container.setCards([createTestCard('001'), createTestCard('002'), createTestCard('003')]);
      container.selectCard(1);
      container.enableKeyboardNavigation();

      // キーボードイベントをシミュレート
      const leftHandler = mockKeyboard.on.mock.calls.find(
        (call) => call[0] === 'keydown-LEFT'
      )?.[1];
      leftHandler?.();

      expect(container.getSelectedIndex()).toBe(0);
    });

    it('右キーで次のカードを選択できる', () => {
      const container = new HandContainer(mockScene as any);
      container.setCards([createTestCard('001'), createTestCard('002'), createTestCard('003')]);
      container.selectCard(1);
      container.enableKeyboardNavigation();

      // キーボードイベントをシミュレート
      const rightHandler = mockKeyboard.on.mock.calls.find(
        (call) => call[0] === 'keydown-RIGHT'
      )?.[1];
      rightHandler?.();

      expect(container.getSelectedIndex()).toBe(2);
    });

    it('左端で左キーを押すと右端に移動する', () => {
      const container = new HandContainer(mockScene as any);
      container.setCards([createTestCard('001'), createTestCard('002'), createTestCard('003')]);
      container.selectCard(0);
      container.enableKeyboardNavigation();

      const leftHandler = mockKeyboard.on.mock.calls.find(
        (call) => call[0] === 'keydown-LEFT'
      )?.[1];
      leftHandler?.();

      expect(container.getSelectedIndex()).toBe(2);
    });

    it('右端で右キーを押すと左端に移動する', () => {
      const container = new HandContainer(mockScene as any);
      container.setCards([createTestCard('001'), createTestCard('002'), createTestCard('003')]);
      container.selectCard(2);
      container.enableKeyboardNavigation();

      const rightHandler = mockKeyboard.on.mock.calls.find(
        (call) => call[0] === 'keydown-RIGHT'
      )?.[1];
      rightHandler?.();

      expect(container.getSelectedIndex()).toBe(0);
    });

    it('ESCキーで選択を解除できる', () => {
      const container = new HandContainer(mockScene as any);
      container.setCards([createTestCard('001')]);
      container.selectCard(0);
      container.enableKeyboardNavigation();

      const escHandler = mockKeyboard.on.mock.calls.find(
        (call) => call[0] === 'keydown-ESC'
      )?.[1];
      escHandler?.();

      expect(container.getSelectedIndex()).toBe(-1);
    });

    it('ENTERキーでonCardConfirmコールバックが呼ばれる', () => {
      const onCardConfirm = vi.fn();
      const container = new HandContainer(mockScene as any, { onCardConfirm });
      const card = createTestCard('001');
      container.setCards([card]);
      container.selectCard(0);
      container.enableKeyboardNavigation();

      const enterHandler = mockKeyboard.on.mock.calls.find(
        (call) => call[0] === 'keydown-ENTER'
      )?.[1];
      enterHandler?.();

      expect(onCardConfirm).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'test-001' }),
        0
      );
    });

    it('未選択時に左右キーを押すと最初のカードを選択する', () => {
      const container = new HandContainer(mockScene as any);
      container.setCards([createTestCard('001'), createTestCard('002')]);
      container.enableKeyboardNavigation();

      const rightHandler = mockKeyboard.on.mock.calls.find(
        (call) => call[0] === 'keydown-RIGHT'
      )?.[1];
      rightHandler?.();

      expect(container.getSelectedIndex()).toBe(0);
    });
  });
});
