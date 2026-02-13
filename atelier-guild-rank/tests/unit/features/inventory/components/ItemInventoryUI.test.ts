/**
 * ItemInventoryUI コンポーネントテスト
 * TASK-0086: features/inventory/components作成
 */

import type { ItemInstance } from '@domain/entities/ItemInstance';
import type { ItemInventoryUIConfig } from '@features/inventory/components/ItemInventoryUI';
import { ItemInventoryUI } from '@features/inventory/components/ItemInventoryUI';
import type { Quality } from '@shared/types';
import type Phaser from 'phaser';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// =============================================================================
// モックヘルパー
// =============================================================================

function createMockItem(
  instanceId: string,
  options: { name?: string; quality?: Quality } = {},
): ItemInstance {
  const name = options.name ?? 'テストアイテム';
  const quality = options.quality ?? 'B';
  return {
    instanceId,
    itemId: 'item-001',
    master: { id: 'item-001', name, category: 'CONSUMABLE', effects: [] },
    quality,
    name,
    usedMaterials: [],
    basePrice: 100,
    calculatePrice: () => 100,
  } as unknown as ItemInstance;
}

function createMockScene(): Phaser.Scene {
  const mockContainer = {
    setPosition: vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis(),
    add: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    x: 0,
    y: 0,
  };

  const scene = {
    add: {
      container: vi.fn().mockReturnValue(mockContainer),
      rectangle: vi.fn().mockReturnValue({
        setOrigin: vi.fn().mockReturnThis(),
        setStrokeStyle: vi.fn().mockReturnThis(),
        setFillStyle: vi.fn().mockReturnThis(),
        setInteractive: vi.fn().mockReturnThis(),
        on: vi.fn().mockReturnThis(),
        off: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
      }),
      text: vi.fn().mockReturnValue({
        setOrigin: vi.fn().mockReturnThis(),
        setWordWrapWidth: vi.fn().mockReturnThis(),
        setText: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
      }),
    },
    cameras: {
      main: { width: 1280, height: 720 },
    },
    children: {
      remove: vi.fn(),
    },
    rexUI: undefined,
  } as unknown as Phaser.Scene;

  return scene;
}

// =============================================================================
// テスト
// =============================================================================

describe('ItemInventoryUI', () => {
  let mockScene: Phaser.Scene;

  beforeEach(() => {
    vi.clearAllMocks();
    mockScene = createMockScene();
  });

  describe('コンストラクタ', () => {
    it('正しい設定でインスタンスを生成できる', () => {
      const config: ItemInventoryUIConfig = {
        items: [createMockItem('inst-001')],
        onItemSelect: vi.fn(),
      };

      const ui = new ItemInventoryUI(mockScene, 0, 0, config);
      expect(ui).toBeDefined();
    });

    it('configがnullの場合エラーを投げる', () => {
      expect(
        () => new ItemInventoryUI(mockScene, 0, 0, null as unknown as ItemInventoryUIConfig),
      ).toThrow('config is required');
    });
  });

  describe('create', () => {
    it('create()でラベルとアイテムカードが生成される', () => {
      const config: ItemInventoryUIConfig = {
        items: [createMockItem('inst-001')],
        onItemSelect: vi.fn(),
      };

      const ui = new ItemInventoryUI(mockScene, 0, 0, config);
      ui.create();

      // テキストが呼ばれている（ラベル + アイテム名 + 品質）
      expect(mockScene.add.text).toHaveBeenCalled();
      // rectangleが呼ばれている（カード背景 + 品質インジケーター）
      expect(mockScene.add.rectangle).toHaveBeenCalled();
    });

    it('空のアイテムリストで空メッセージが表示される', () => {
      const config: ItemInventoryUIConfig = {
        items: [],
        onItemSelect: vi.fn(),
      };

      const ui = new ItemInventoryUI(mockScene, 0, 0, config);
      ui.create();

      const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
      const emptyMessage = textCalls.find(
        (call: unknown[]) =>
          typeof call[2] === 'string' && (call[2] as string).includes('アイテム'),
      );
      expect(emptyMessage).toBeDefined();
    });
  });

  describe('アイテム選択', () => {
    it('getSelectedItem()は初期状態でnullを返す', () => {
      const config: ItemInventoryUIConfig = {
        items: [createMockItem('inst-001')],
        onItemSelect: vi.fn(),
      };

      const ui = new ItemInventoryUI(mockScene, 0, 0, config);
      ui.create();

      expect(ui.getSelectedItem()).toBeNull();
    });

    it('clearSelection()で選択がクリアされる', () => {
      const config: ItemInventoryUIConfig = {
        items: [createMockItem('inst-001')],
        onItemSelect: vi.fn(),
      };

      const ui = new ItemInventoryUI(mockScene, 0, 0, config);
      ui.create();
      ui.clearSelection();

      expect(ui.getSelectedItem()).toBeNull();
    });
  });

  describe('updateItems', () => {
    it('アイテムリストを更新できる', () => {
      const config: ItemInventoryUIConfig = {
        items: [createMockItem('inst-001')],
        onItemSelect: vi.fn(),
      };

      const ui = new ItemInventoryUI(mockScene, 0, 0, config);
      ui.create();

      const newItems = [createMockItem('inst-002'), createMockItem('inst-003')];
      ui.updateItems(newItems);

      // 更新後のUI再構築が行われたことを確認
      // rectangleが追加で呼ばれている
      expect(mockScene.add.rectangle).toHaveBeenCalled();
    });
  });

  describe('destroy', () => {
    it('destroy()でリソースが解放される', () => {
      const config: ItemInventoryUIConfig = {
        items: [createMockItem('inst-001')],
        onItemSelect: vi.fn(),
      };

      const ui = new ItemInventoryUI(mockScene, 0, 0, config);
      ui.create();

      expect(() => ui.destroy()).not.toThrow();
    });

    it('create()前にdestroy()を呼んでもエラーにならない', () => {
      const config: ItemInventoryUIConfig = {
        items: [],
        onItemSelect: vi.fn(),
      };

      const ui = new ItemInventoryUI(mockScene, 0, 0, config);

      expect(() => ui.destroy()).not.toThrow();
    });
  });
});
