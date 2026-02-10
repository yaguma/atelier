/**
 * features/deck/components インポートテスト
 * TASK-0070: features/deck/components作成
 *
 * @description
 * デッキ機能コンポーネントが正しくエクスポートされていることを確認する
 */

import {
  CardUI,
  type CardUIConfig,
  type DraggableCardConfig,
  DraggableCardUI,
  HandDisplay,
  type HandDisplayConfig,
} from '@features/deck/components';
import { describe, expect, it } from 'vitest';

describe('features/deck/components', () => {
  describe('CardUI', () => {
    it('@features/deck/componentsからCardUIがインポートできること', () => {
      expect(CardUI).toBeDefined();
      expect(typeof CardUI).toBe('function');
    });

    it('CardUIConfigの型がエクスポートされていること', () => {
      // 型テスト - コンパイルエラーがなければ成功
      const config: CardUIConfig = {
        card: {} as never,
        x: 0,
        y: 0,
      };
      expect(config).toBeDefined();
    });
  });

  describe('HandDisplay', () => {
    it('@features/deck/componentsからHandDisplayがインポートできること', () => {
      expect(HandDisplay).toBeDefined();
      expect(typeof HandDisplay).toBe('function');
    });

    it('HandDisplayConfigの型がエクスポートされていること', () => {
      // 型テスト - コンパイルエラーがなければ成功
      const config: HandDisplayConfig = {
        x: 0,
        y: 0,
        cards: [],
      };
      expect(config).toBeDefined();
    });
  });

  describe('DraggableCardUI', () => {
    it('@features/deck/componentsからDraggableCardUIがインポートできること', () => {
      expect(DraggableCardUI).toBeDefined();
      expect(typeof DraggableCardUI).toBe('function');
    });

    it('DraggableCardConfigの型がエクスポートされていること', () => {
      // 型テスト - コンパイルエラーがなければ成功
      const config: DraggableCardConfig = {
        card: {} as never,
        x: 0,
        y: 0,
      };
      expect(config).toBeDefined();
    });
  });
});
