/**
 * SidebarUI テスト
 *
 * サイドバーUIコンポーネントの実装テスト
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

import { SidebarUI } from '../../../../../src/game/ui/sidebar/SidebarUI';
import type {
  QuestDisplayData,
  InventoryDisplayData,
} from '../../../../../src/game/ui/sidebar/ISidebarUI';

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
    setX: vi.fn().mockReturnThis(),
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
    setAlpha: vi.fn().mockReturnThis(),
    setData: vi.fn().mockReturnThis(),
    getData: vi.fn((key: string) => {
      if (key === 'bg') return { ...mockGraphics };
      if (key === 'text') return { ...mockText };
      return undefined;
    }),
    on: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    x: 0,
    y: 0,
  };

  return {
    add: {
      graphics: vi.fn(() => ({ ...mockGraphics })),
      text: vi.fn(() => ({ ...mockText })),
      container: vi.fn(() => ({ ...mockContainer })),
    },
    tweens: {
      add: vi.fn(() => ({ stop: vi.fn() })),
    },
  };
};

describe('SidebarUI', () => {
  let mockScene: ReturnType<typeof createMockScene>;

  beforeEach(() => {
    mockScene = createMockScene();
  });

  describe('コンストラクタ', () => {
    it('デフォルトオプションで初期化できる', () => {
      const sidebarUI = new SidebarUI(mockScene as any);

      expect(sidebarUI).toBeDefined();
      expect(sidebarUI.container).toBeDefined();
    });

    it('カスタムオプションで初期化できる', () => {
      const onQuestSelect = vi.fn();
      const onItemSelect = vi.fn();
      const sidebarUI = new SidebarUI(mockScene as any, {
        x: 1000,
        y: 100,
        width: 300,
        height: 600,
        onQuestSelect,
        onItemSelect,
      });

      expect(sidebarUI).toBeDefined();
    });

    it('コンテナが作成される', () => {
      new SidebarUI(mockScene as any);

      expect(mockScene.add.container).toHaveBeenCalled();
    });

    it('背景が作成される', () => {
      new SidebarUI(mockScene as any);

      expect(mockScene.add.graphics).toHaveBeenCalled();
    });
  });

  describe('タブ切り替え', () => {
    it('初期タブは依頼タブ', () => {
      const sidebarUI = new SidebarUI(mockScene as any);

      expect(sidebarUI.getActiveTab()).toBe('quests');
    });

    it('インベントリタブに切り替えできる', () => {
      const sidebarUI = new SidebarUI(mockScene as any);
      sidebarUI.setActiveTab('inventory');

      expect(sidebarUI.getActiveTab()).toBe('inventory');
    });

    it('依頼タブに戻せる', () => {
      const sidebarUI = new SidebarUI(mockScene as any);
      sidebarUI.setActiveTab('inventory');
      sidebarUI.setActiveTab('quests');

      expect(sidebarUI.getActiveTab()).toBe('quests');
    });
  });

  describe('依頼リスト', () => {
    const createQuestData = (id: string, name: string): QuestDisplayData => ({
      id,
      name,
      description: 'テスト依頼',
      difficulty: 1,
      rewardGold: 100,
      rewardExp: 50,
      requiredItems: [],
      canComplete: false,
    });

    it('依頼リストを設定できる', () => {
      const sidebarUI = new SidebarUI(mockScene as any);
      const quests = [
        createQuestData('q1', '依頼1'),
        createQuestData('q2', '依頼2'),
      ];

      expect(() => sidebarUI.setQuests(quests)).not.toThrow();
    });

    it('空の依頼リストを設定できる', () => {
      const sidebarUI = new SidebarUI(mockScene as any);

      expect(() => sidebarUI.setQuests([])).not.toThrow();
    });

    it('依頼をハイライトできる', () => {
      const sidebarUI = new SidebarUI(mockScene as any);
      const quests = [
        createQuestData('q1', '依頼1'),
        createQuestData('q2', '依頼2'),
      ];
      sidebarUI.setQuests(quests);

      expect(() => sidebarUI.highlightQuest('q1')).not.toThrow();
    });

    it('依頼のハイライトをクリアできる', () => {
      const sidebarUI = new SidebarUI(mockScene as any);
      const quests = [createQuestData('q1', '依頼1')];
      sidebarUI.setQuests(quests);
      sidebarUI.highlightQuest('q1');

      expect(() => sidebarUI.clearQuestHighlight()).not.toThrow();
    });

    it('依頼選択コールバックが呼ばれる', () => {
      const onQuestSelect = vi.fn();
      const sidebarUI = new SidebarUI(mockScene as any, { onQuestSelect });
      const quests = [createQuestData('q1', '依頼1')];
      sidebarUI.setQuests(quests);

      // highlightQuestでは直接コールバックは呼ばれない
      // （クリック時に呼ばれる）
      sidebarUI.highlightQuest('q1');
      expect(onQuestSelect).not.toHaveBeenCalled();
    });
  });

  describe('インベントリ', () => {
    const createItemData = (
      id: string,
      name: string,
      category: 'material' | 'item' | 'artifact' = 'material'
    ): InventoryDisplayData => ({
      id,
      name,
      description: 'テストアイテム',
      count: 5,
      category,
    });

    it('インベントリを設定できる', () => {
      const sidebarUI = new SidebarUI(mockScene as any);
      const items = [
        createItemData('i1', 'アイテム1'),
        createItemData('i2', 'アイテム2'),
      ];

      expect(() => sidebarUI.setInventory(items)).not.toThrow();
    });

    it('空のインベントリを設定できる', () => {
      const sidebarUI = new SidebarUI(mockScene as any);

      expect(() => sidebarUI.setInventory([])).not.toThrow();
    });

    it('アイテムをハイライトできる', () => {
      const sidebarUI = new SidebarUI(mockScene as any);
      const items = [
        createItemData('i1', 'アイテム1'),
        createItemData('i2', 'アイテム2'),
      ];
      sidebarUI.setInventory(items);

      expect(() => sidebarUI.highlightItem('i1')).not.toThrow();
    });

    it('アイテムのハイライトをクリアできる', () => {
      const sidebarUI = new SidebarUI(mockScene as any);
      const items = [createItemData('i1', 'アイテム1')];
      sidebarUI.setInventory(items);
      sidebarUI.highlightItem('i1');

      expect(() => sidebarUI.clearItemHighlight()).not.toThrow();
    });
  });

  // ========================================
  // TASK-0207: インベントリグリッド・フィルター機能テスト
  // ========================================

  describe('インベントリフィルター (TASK-0207)', () => {
    const createItemData = (
      id: string,
      name: string,
      category: 'material' | 'item' | 'artifact' = 'material'
    ): InventoryDisplayData => ({
      id,
      name,
      description: 'テストアイテム',
      count: 5,
      category,
    });

    it('初期フィルターは全て(all)である', () => {
      const sidebarUI = new SidebarUI(mockScene as any);

      expect(sidebarUI.getInventoryFilter()).toBe('all');
    });

    it('フィルターをmaterialに設定できる', () => {
      const sidebarUI = new SidebarUI(mockScene as any);
      sidebarUI.setInventoryFilter('material');

      expect(sidebarUI.getInventoryFilter()).toBe('material');
    });

    it('フィルターをitemに設定できる', () => {
      const sidebarUI = new SidebarUI(mockScene as any);
      sidebarUI.setInventoryFilter('item');

      expect(sidebarUI.getInventoryFilter()).toBe('item');
    });

    it('フィルターをartifactに設定できる', () => {
      const sidebarUI = new SidebarUI(mockScene as any);
      sidebarUI.setInventoryFilter('artifact');

      expect(sidebarUI.getInventoryFilter()).toBe('artifact');
    });

    it('フィルターをallに戻せる', () => {
      const sidebarUI = new SidebarUI(mockScene as any);
      sidebarUI.setInventoryFilter('material');
      sidebarUI.setInventoryFilter('all');

      expect(sidebarUI.getInventoryFilter()).toBe('all');
    });

    it('フィルター適用後にgetFilteredInventoryCountが正しい数を返す', () => {
      const sidebarUI = new SidebarUI(mockScene as any);
      const items = [
        createItemData('m1', '素材1', 'material'),
        createItemData('m2', '素材2', 'material'),
        createItemData('m3', '素材3', 'material'),
        createItemData('i1', 'アイテム1', 'item'),
        createItemData('i2', 'アイテム2', 'item'),
        createItemData('a1', 'アーティファクト1', 'artifact'),
      ];
      sidebarUI.setInventory(items);

      // 全て表示
      sidebarUI.setInventoryFilter('all');
      expect(sidebarUI.getFilteredInventoryCount()).toBe(6);

      // 素材のみ
      sidebarUI.setInventoryFilter('material');
      expect(sidebarUI.getFilteredInventoryCount()).toBe(3);

      // アイテムのみ
      sidebarUI.setInventoryFilter('item');
      expect(sidebarUI.getFilteredInventoryCount()).toBe(2);

      // アーティファクトのみ
      sidebarUI.setInventoryFilter('artifact');
      expect(sidebarUI.getFilteredInventoryCount()).toBe(1);
    });

    it('フィルター変更後も選択状態が維持される', () => {
      const sidebarUI = new SidebarUI(mockScene as any);
      const items = [
        createItemData('m1', '素材1', 'material'),
        createItemData('i1', 'アイテム1', 'item'),
      ];
      sidebarUI.setInventory(items);

      sidebarUI.highlightItem('m1');
      sidebarUI.setInventoryFilter('material');

      // 選択状態が維持されていることを確認（エラーなく実行される）
      expect(() => sidebarUI.highlightItem('m1')).not.toThrow();
    });
  });

  describe('インベントリグリッド表示 (TASK-0207)', () => {
    const createItemData = (
      id: string,
      name: string,
      category: 'material' | 'item' | 'artifact' = 'material',
      count: number = 5
    ): InventoryDisplayData => ({
      id,
      name,
      description: 'テストアイテム',
      count,
      category,
    });

    it('素材5個、アイテム3個を設定するとgetFilteredInventoryCountが8を返す', () => {
      const sidebarUI = new SidebarUI(mockScene as any);
      const items = [
        createItemData('m1', '素材1', 'material'),
        createItemData('m2', '素材2', 'material'),
        createItemData('m3', '素材3', 'material'),
        createItemData('m4', '素材4', 'material'),
        createItemData('m5', '素材5', 'material'),
        createItemData('i1', 'アイテム1', 'item'),
        createItemData('i2', 'アイテム2', 'item'),
        createItemData('i3', 'アイテム3', 'item'),
      ];

      sidebarUI.setInventory(items);
      sidebarUI.setInventoryFilter('all');

      expect(sidebarUI.getFilteredInventoryCount()).toBe(8);
    });

    it('materialフィルターで素材のみ(5個)が返される', () => {
      const sidebarUI = new SidebarUI(mockScene as any);
      const items = [
        createItemData('m1', '素材1', 'material'),
        createItemData('m2', '素材2', 'material'),
        createItemData('m3', '素材3', 'material'),
        createItemData('m4', '素材4', 'material'),
        createItemData('m5', '素材5', 'material'),
        createItemData('i1', 'アイテム1', 'item'),
        createItemData('i2', 'アイテム2', 'item'),
        createItemData('i3', 'アイテム3', 'item'),
      ];

      sidebarUI.setInventory(items);
      sidebarUI.setInventoryFilter('material');

      expect(sidebarUI.getFilteredInventoryCount()).toBe(5);
    });

    it('アイテムをクリックするとハイライトされる', () => {
      const sidebarUI = new SidebarUI(mockScene as any);
      const items = [createItemData('i1', 'アイテム1', 'material')];
      sidebarUI.setInventory(items);

      // highlightItemがエラーなく動作
      expect(() => sidebarUI.highlightItem('i1')).not.toThrow();
    });

    it('個数1のアイテムも正しく表示される', () => {
      const sidebarUI = new SidebarUI(mockScene as any);
      const items = [createItemData('i1', 'アイテム1', 'material', 1)];

      expect(() => sidebarUI.setInventory(items)).not.toThrow();
    });

    it('個数99のアイテムも正しく表示される', () => {
      const sidebarUI = new SidebarUI(mockScene as any);
      const items = [createItemData('i1', 'アイテム1', 'material', 99)];

      expect(() => sidebarUI.setInventory(items)).not.toThrow();
    });
  });

  describe('表示制御', () => {
    it('表示状態を変更できる', () => {
      const sidebarUI = new SidebarUI(mockScene as any);

      sidebarUI.setVisible(true);
      expect(sidebarUI.container.setVisible).toHaveBeenCalledWith(true);

      sidebarUI.setVisible(false);
      expect(sidebarUI.container.setVisible).toHaveBeenCalledWith(false);
    });

    it('有効状態を変更できる', () => {
      const sidebarUI = new SidebarUI(mockScene as any);

      sidebarUI.setEnabled(true);
      expect(sidebarUI.container.setAlpha).toHaveBeenCalledWith(1);

      sidebarUI.setEnabled(false);
      expect(sidebarUI.container.setAlpha).toHaveBeenCalledWith(0.5);
    });
  });

  describe('スクロール', () => {
    it('scrollToTopがエラーにならない', () => {
      const sidebarUI = new SidebarUI(mockScene as any);

      expect(() => sidebarUI.scrollToTop()).not.toThrow();
    });

    it('scrollToItemがエラーにならない', () => {
      const sidebarUI = new SidebarUI(mockScene as any);

      expect(() => sidebarUI.scrollToItem(0)).not.toThrow();
      expect(() => sidebarUI.scrollToItem(5)).not.toThrow();
    });
  });

  describe('destroy', () => {
    it('リソースが破棄される', () => {
      const sidebarUI = new SidebarUI(mockScene as any);
      sidebarUI.destroy();

      expect(sidebarUI.container.destroy).toHaveBeenCalled();
    });
  });
});
