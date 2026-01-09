/**
 * ISidebarUIインターフェーステスト
 *
 * ISidebarUIインターフェースの型定義テスト
 */

import { describe, it, expect } from 'vitest';
import type {
  ISidebarUI,
  SidebarUIOptions,
  QuestDisplayData,
  InventoryDisplayData,
} from '../../../../../src/game/ui/sidebar/ISidebarUI';
import type { SidebarTab } from '../../../../../src/game/ui/sidebar/SidebarConstants';

describe('ISidebarUI インターフェース', () => {
  describe('QuestDisplayData', () => {
    it('必須フィールドを含むデータを作成できる', () => {
      const quest: QuestDisplayData = {
        id: 'quest-001',
        name: '薬草を集めろ',
        description: '薬草を5個集めてください',
        difficulty: 1,
        rewardGold: 100,
        rewardExp: 50,
        requiredItems: [{ itemId: 'herb', itemName: '薬草', count: 5 }],
        canComplete: false,
      };

      expect(quest.id).toBe('quest-001');
      expect(quest.name).toBe('薬草を集めろ');
      expect(quest.description).toBe('薬草を5個集めてください');
      expect(quest.difficulty).toBe(1);
      expect(quest.rewardGold).toBe(100);
      expect(quest.rewardExp).toBe(50);
      expect(quest.requiredItems).toHaveLength(1);
      expect(quest.canComplete).toBe(false);
    });

    it('完了可能な依頼を作成できる', () => {
      const quest: QuestDisplayData = {
        id: 'quest-002',
        name: '完了可能依頼',
        description: '完了できます',
        difficulty: 2,
        rewardGold: 200,
        rewardExp: 100,
        requiredItems: [],
        canComplete: true,
      };

      expect(quest.canComplete).toBe(true);
    });
  });

  describe('InventoryDisplayData', () => {
    it('素材アイテムを作成できる', () => {
      const item: InventoryDisplayData = {
        id: 'material-001',
        name: '薬草',
        description: '一般的な薬草',
        count: 10,
        category: 'material',
      };

      expect(item.id).toBe('material-001');
      expect(item.name).toBe('薬草');
      expect(item.description).toBe('一般的な薬草');
      expect(item.count).toBe(10);
      expect(item.category).toBe('material');
    });

    it('アイテムを作成できる', () => {
      const item: InventoryDisplayData = {
        id: 'item-001',
        name: '回復薬',
        description: 'HPを回復する',
        count: 3,
        category: 'item',
        rarity: 2,
      };

      expect(item.category).toBe('item');
      expect(item.rarity).toBe(2);
    });

    it('アーティファクトを作成できる', () => {
      const item: InventoryDisplayData = {
        id: 'artifact-001',
        name: '賢者の杖',
        description: '強力な魔法の杖',
        count: 1,
        category: 'artifact',
        rarity: 5,
      };

      expect(item.category).toBe('artifact');
      expect(item.rarity).toBe(5);
    });
  });

  describe('SidebarUIOptions', () => {
    it('空のオプションを作成できる', () => {
      const options: SidebarUIOptions = {};
      expect(options).toBeDefined();
    });

    it('すべてのオプションを指定できる', () => {
      const onQuestSelect = () => {};
      const onItemSelect = () => {};
      const options: SidebarUIOptions = {
        x: 1000,
        y: 80,
        width: 280,
        height: 640,
        onQuestSelect,
        onItemSelect,
      };

      expect(options.x).toBe(1000);
      expect(options.y).toBe(80);
      expect(options.width).toBe(280);
      expect(options.height).toBe(640);
      expect(options.onQuestSelect).toBe(onQuestSelect);
      expect(options.onItemSelect).toBe(onItemSelect);
    });

    it('部分的なオプションを指定できる', () => {
      const options: SidebarUIOptions = {
        width: 300,
      };

      expect(options.width).toBe(300);
      expect(options.x).toBeUndefined();
      expect(options.y).toBeUndefined();
    });
  });

  describe('ISidebarUI', () => {
    it('インターフェースが正しく定義されている（型チェック）', () => {
      const mockSidebarUI: ISidebarUI = {
        container: {} as any,
        setActiveTab: () => {},
        getActiveTab: () => 'quests' as SidebarTab,
        setQuests: () => {},
        highlightQuest: () => {},
        clearQuestHighlight: () => {},
        setInventory: () => {},
        highlightItem: () => {},
        clearItemHighlight: () => {},
        setVisible: () => {},
        setEnabled: () => {},
        scrollToTop: () => {},
        scrollToItem: () => {},
        destroy: () => {},
      };

      expect(mockSidebarUI).toBeDefined();
      expect(typeof mockSidebarUI.setActiveTab).toBe('function');
      expect(typeof mockSidebarUI.getActiveTab).toBe('function');
      expect(typeof mockSidebarUI.setQuests).toBe('function');
      expect(typeof mockSidebarUI.highlightQuest).toBe('function');
      expect(typeof mockSidebarUI.clearQuestHighlight).toBe('function');
      expect(typeof mockSidebarUI.setInventory).toBe('function');
      expect(typeof mockSidebarUI.highlightItem).toBe('function');
      expect(typeof mockSidebarUI.clearItemHighlight).toBe('function');
      expect(typeof mockSidebarUI.setVisible).toBe('function');
      expect(typeof mockSidebarUI.setEnabled).toBe('function');
      expect(typeof mockSidebarUI.scrollToTop).toBe('function');
      expect(typeof mockSidebarUI.scrollToItem).toBe('function');
      expect(typeof mockSidebarUI.destroy).toBe('function');
    });
  });
});
