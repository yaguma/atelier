/**
 * IHandContainerテスト
 *
 * 手札コンテナインターフェースの型テスト
 */

import { describe, it, expect, vi } from 'vitest';
import {
  IHandContainer,
  HandContainerOptions,
} from '../../../../../src/game/ui/hand/IHandContainer';
import { Card } from '../../../../../src/domain/card/Card';
import { CardType, GuildRank, Rarity } from '../../../../../src/domain/common/types';

// モックカード作成
const createMockCard = (): Card => ({
  id: 'test-card-001',
  name: 'テストカード',
  type: CardType.GATHERING,
  rarity: Rarity.COMMON,
  unlockRank: GuildRank.G,
  description: 'テスト用カード',
  cost: 1,
});

describe('IHandContainer', () => {
  describe('HandContainerOptions', () => {
    it('全てのオプションを持つオブジェクトが作成できる', () => {
      const options: HandContainerOptions = {
        x: 640,
        y: 650,
        layoutType: 'horizontal',
        maxVisibleCards: 7,
        onCardSelect: vi.fn(),
        onCardDeselect: vi.fn(),
      };

      expect(options.x).toBe(640);
      expect(options.y).toBe(650);
      expect(options.layoutType).toBe('horizontal');
      expect(options.maxVisibleCards).toBe(7);
      expect(options.onCardSelect).toBeDefined();
      expect(options.onCardDeselect).toBeDefined();
    });

    it('オプションなしでも作成できる', () => {
      const options: HandContainerOptions = {};

      expect(options.x).toBeUndefined();
      expect(options.y).toBeUndefined();
    });
  });

  describe('IHandContainer インターフェース', () => {
    it('モック実装が型チェックを通る', () => {
      const mockCards: Card[] = [createMockCard()];
      let selectedCard: Card | null = null;
      let selectedIndex = -1;
      let layoutType: 'horizontal' | 'fan' = 'horizontal';

      const mockContainer: IHandContainer = {
        container: {} as Phaser.GameObjects.Container,

        setCards: vi.fn((cards: Card[]) => {
          mockCards.length = 0;
          mockCards.push(...cards);
        }),
        addCard: vi.fn(),
        removeCard: vi.fn(),
        getCards: vi.fn(() => mockCards),
        getCardCount: vi.fn(() => mockCards.length),

        getSelectedCard: vi.fn(() => selectedCard),
        getSelectedIndex: vi.fn(() => selectedIndex),
        selectCard: vi.fn((cardOrIndex: Card | number) => {
          if (typeof cardOrIndex === 'number') {
            selectedIndex = cardOrIndex;
            selectedCard = mockCards[cardOrIndex] ?? null;
          } else {
            selectedCard = cardOrIndex;
            selectedIndex = mockCards.indexOf(cardOrIndex);
          }
        }),
        deselectCard: vi.fn(() => {
          selectedCard = null;
          selectedIndex = -1;
        }),
        setSelectable: vi.fn(),

        setLayoutType: vi.fn((type: 'horizontal' | 'fan') => {
          layoutType = type;
        }),
        getLayoutType: vi.fn(() => layoutType),
        refresh: vi.fn(),

        setVisible: vi.fn(),
        setPosition: vi.fn(),

        destroy: vi.fn(),
      };

      // 手札管理
      expect(mockContainer.getCards()).toEqual(mockCards);
      expect(mockContainer.getCardCount()).toBe(1);

      mockContainer.setCards([createMockCard(), createMockCard()]);
      expect(mockCards.length).toBe(2);

      // 選択管理
      expect(mockContainer.getSelectedCard()).toBeNull();
      expect(mockContainer.getSelectedIndex()).toBe(-1);

      mockContainer.selectCard(0);
      expect(selectedIndex).toBe(0);
      expect(selectedCard).not.toBeNull();

      mockContainer.deselectCard();
      expect(selectedCard).toBeNull();
      expect(selectedIndex).toBe(-1);

      // レイアウト
      expect(mockContainer.getLayoutType()).toBe('horizontal');
      mockContainer.setLayoutType('fan');
      expect(layoutType).toBe('fan');
    });

    it('手札操作メソッドが存在する', () => {
      const mockContainer: IHandContainer = {
        container: {} as Phaser.GameObjects.Container,
        setCards: vi.fn(),
        addCard: vi.fn(),
        removeCard: vi.fn(),
        getCards: vi.fn(() => []),
        getCardCount: vi.fn(() => 0),
        getSelectedCard: vi.fn(() => null),
        getSelectedIndex: vi.fn(() => -1),
        selectCard: vi.fn(),
        deselectCard: vi.fn(),
        setSelectable: vi.fn(),
        setLayoutType: vi.fn(),
        getLayoutType: vi.fn(() => 'horizontal'),
        refresh: vi.fn(),
        setVisible: vi.fn(),
        setPosition: vi.fn(),
        destroy: vi.fn(),
      };

      // メソッドが存在することを確認
      expect(typeof mockContainer.setCards).toBe('function');
      expect(typeof mockContainer.addCard).toBe('function');
      expect(typeof mockContainer.removeCard).toBe('function');
      expect(typeof mockContainer.getCards).toBe('function');
      expect(typeof mockContainer.getCardCount).toBe('function');
      expect(typeof mockContainer.getSelectedCard).toBe('function');
      expect(typeof mockContainer.getSelectedIndex).toBe('function');
      expect(typeof mockContainer.selectCard).toBe('function');
      expect(typeof mockContainer.deselectCard).toBe('function');
      expect(typeof mockContainer.setSelectable).toBe('function');
      expect(typeof mockContainer.setLayoutType).toBe('function');
      expect(typeof mockContainer.getLayoutType).toBe('function');
      expect(typeof mockContainer.refresh).toBe('function');
      expect(typeof mockContainer.setVisible).toBe('function');
      expect(typeof mockContainer.setPosition).toBe('function');
      expect(typeof mockContainer.destroy).toBe('function');
    });
  });
});
