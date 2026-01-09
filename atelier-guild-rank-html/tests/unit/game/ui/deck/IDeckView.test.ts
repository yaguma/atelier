/**
 * IDeckViewインターフェーステスト
 *
 * IDeckViewインターフェースの型定義テスト
 */

import { describe, it, expect } from 'vitest';
import type {
  IDeckView,
  DeckViewOptions,
} from '../../../../../src/game/ui/deck/IDeckView';

describe('IDeckView インターフェース', () => {
  describe('DeckViewOptions', () => {
    it('空のオプションを作成できる', () => {
      const options: DeckViewOptions = {};
      expect(options).toBeDefined();
    });

    it('すべてのオプションを指定できる', () => {
      const onClick = () => {};
      const options: DeckViewOptions = {
        x: 100,
        y: 550,
        onClick,
      };

      expect(options.x).toBe(100);
      expect(options.y).toBe(550);
      expect(options.onClick).toBe(onClick);
    });

    it('部分的なオプションを指定できる', () => {
      const options: DeckViewOptions = {
        x: 200,
      };

      expect(options.x).toBe(200);
      expect(options.y).toBeUndefined();
      expect(options.onClick).toBeUndefined();
    });
  });

  describe('IDeckView', () => {
    it('インターフェースが正しく定義されている（型チェック）', () => {
      const mockDeckView: IDeckView = {
        container: {} as any,
        setCount: () => {},
        getCount: () => 0,
        animateDraw: async () => ({} as any),
        animateShuffle: async () => {},
        animateAddCard: async () => {},
        setInteractive: () => {},
        setVisible: () => {},
        destroy: () => {},
      };

      expect(mockDeckView).toBeDefined();
      expect(typeof mockDeckView.setCount).toBe('function');
      expect(typeof mockDeckView.getCount).toBe('function');
      expect(typeof mockDeckView.animateDraw).toBe('function');
      expect(typeof mockDeckView.animateShuffle).toBe('function');
      expect(typeof mockDeckView.animateAddCard).toBe('function');
      expect(typeof mockDeckView.setInteractive).toBe('function');
      expect(typeof mockDeckView.setVisible).toBe('function');
      expect(typeof mockDeckView.destroy).toBe('function');
    });

    it('getCountが数値を返す', () => {
      const mockDeckView: IDeckView = {
        container: {} as any,
        setCount: () => {},
        getCount: () => 20,
        animateDraw: async () => ({} as any),
        animateShuffle: async () => {},
        animateAddCard: async () => {},
        setInteractive: () => {},
        setVisible: () => {},
        destroy: () => {},
      };

      expect(mockDeckView.getCount()).toBe(20);
    });
  });
});
