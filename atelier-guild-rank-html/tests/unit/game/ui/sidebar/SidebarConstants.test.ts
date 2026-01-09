/**
 * SidebarConstants テスト
 *
 * サイドバーUI定数のテスト
 */

import { describe, it, expect } from 'vitest';
import {
  SidebarLayout,
  SidebarColors,
  type SidebarTab,
  type InventoryFilter,
} from '../../../../../src/game/ui/sidebar/SidebarConstants';

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

    // TASK-0208: 追加テスト
    it('アクティブタブは非アクティブより明るい（数値が大きい）', () => {
      expect(SidebarColors.TAB_ACTIVE).toBeGreaterThan(SidebarColors.TAB_INACTIVE);
    });

    it('ホバー色と選択色は背景色と異なる', () => {
      expect(SidebarColors.ITEM_HOVER).not.toBe(SidebarColors.ITEM_BACKGROUND);
      expect(SidebarColors.ITEM_SELECTED).not.toBe(SidebarColors.ITEM_BACKGROUND);
    });
  });

  // TASK-0208: 型テスト
  describe('SidebarTab 型', () => {
    it('quests は有効な値', () => {
      const tab: SidebarTab = 'quests';
      expect(tab).toBe('quests');
    });

    it('inventory は有効な値', () => {
      const tab: SidebarTab = 'inventory';
      expect(tab).toBe('inventory');
    });
  });

  describe('InventoryFilter 型 (TASK-0207)', () => {
    it('all は有効な値', () => {
      const filter: InventoryFilter = 'all';
      expect(filter).toBe('all');
    });

    it('material は有効な値', () => {
      const filter: InventoryFilter = 'material';
      expect(filter).toBe('material');
    });

    it('item は有効な値', () => {
      const filter: InventoryFilter = 'item';
      expect(filter).toBe('item');
    });

    it('artifact は有効な値', () => {
      const filter: InventoryFilter = 'artifact';
      expect(filter).toBe('artifact');
    });
  });

  describe('SidebarLayout 追加検証 (TASK-0208)', () => {
    it('位置が画面右側に設定されている（1280幅の画面で右側）', () => {
      expect(SidebarLayout.X).toBeGreaterThan(640);
    });

    it('サイドバーの基本サイズが適切', () => {
      expect(SidebarLayout.WIDTH).toBeGreaterThanOrEqual(200);
      expect(SidebarLayout.WIDTH).toBeLessThanOrEqual(400);
      expect(SidebarLayout.HEIGHT).toBeGreaterThanOrEqual(400);
    });

    it('コンテンツY位置がタブ高さより大きい', () => {
      expect(SidebarLayout.CONTENT_Y).toBeGreaterThanOrEqual(SidebarLayout.TAB_HEIGHT);
    });

    it('コンテンツ高さが全体高さ内に収まる', () => {
      const contentEnd = SidebarLayout.CONTENT_Y + SidebarLayout.CONTENT_HEIGHT;
      expect(contentEnd).toBeLessThanOrEqual(SidebarLayout.HEIGHT);
    });
  });
});
