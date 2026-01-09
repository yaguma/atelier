/**
 * SidebarConstants テスト
 *
 * サイドバーUI定数のテスト
 */

import { describe, it, expect } from 'vitest';
import { SidebarLayout, SidebarColors } from '../../../../../src/game/ui/sidebar/SidebarConstants';

describe('SidebarConstants', () => {
  describe('SidebarLayout', () => {
    it('基本レイアウト定数が定義されている', () => {
      expect(SidebarLayout.X).toBeTypeOf('number');
      expect(SidebarLayout.Y).toBeTypeOf('number');
      expect(SidebarLayout.WIDTH).toBeTypeOf('number');
      expect(SidebarLayout.HEIGHT).toBeTypeOf('number');
    });

    it('幅が正の数', () => {
      expect(SidebarLayout.WIDTH).toBeGreaterThan(0);
    });

    it('高さが正の数', () => {
      expect(SidebarLayout.HEIGHT).toBeGreaterThan(0);
    });

    it('パディングが定義されている', () => {
      expect(SidebarLayout.PADDING).toBeGreaterThanOrEqual(0);
    });

    it('タブサイズが定義されている', () => {
      expect(SidebarLayout.TAB_HEIGHT).toBeGreaterThan(0);
      expect(SidebarLayout.TAB_WIDTH).toBeGreaterThan(0);
    });

    it('コンテンツエリアが定義されている', () => {
      expect(SidebarLayout.CONTENT_Y).toBeTypeOf('number');
      expect(SidebarLayout.CONTENT_HEIGHT).toBeGreaterThan(0);
    });

    it('リストアイテムサイズが定義されている', () => {
      expect(SidebarLayout.ITEM_HEIGHT).toBeGreaterThan(0);
      expect(SidebarLayout.ITEM_SPACING).toBeGreaterThanOrEqual(0);
    });

    it('2つのタブが横並びで収まる', () => {
      const totalTabWidth = SidebarLayout.TAB_WIDTH * 2;
      expect(totalTabWidth).toBeLessThanOrEqual(SidebarLayout.WIDTH);
    });
  });

  describe('SidebarColors', () => {
    it('背景色が定義されている', () => {
      expect(SidebarColors.BACKGROUND).toBeTypeOf('number');
      expect(SidebarColors.BACKGROUND_ALPHA).toBeTypeOf('number');
      expect(SidebarColors.BORDER).toBeTypeOf('number');
    });

    it('アルファ値が0-1の範囲', () => {
      expect(SidebarColors.BACKGROUND_ALPHA).toBeGreaterThan(0);
      expect(SidebarColors.BACKGROUND_ALPHA).toBeLessThanOrEqual(1);
    });

    it('タブ色が定義されている', () => {
      expect(SidebarColors.TAB_ACTIVE).toBeTypeOf('number');
      expect(SidebarColors.TAB_INACTIVE).toBeTypeOf('number');
    });

    it('アクティブタブと非アクティブタブは異なる色', () => {
      expect(SidebarColors.TAB_ACTIVE).not.toBe(SidebarColors.TAB_INACTIVE);
    });

    it('リストアイテム色が定義されている', () => {
      expect(SidebarColors.ITEM_BACKGROUND).toBeTypeOf('number');
      expect(SidebarColors.ITEM_HOVER).toBeTypeOf('number');
      expect(SidebarColors.ITEM_SELECTED).toBeTypeOf('number');
    });
  });
});
