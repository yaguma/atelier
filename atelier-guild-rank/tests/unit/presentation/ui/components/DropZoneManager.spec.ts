// @ts-nocheck
/**
 * DropZoneManagerのテスト
 * TASK-0042 カードドラッグ＆ドロップ機能
 *
 * @description
 * TC-009〜TC-014: DropZoneの正常系テスト
 * TC-103〜TC-104: 異常系テスト
 * TC-203〜TC-205: 境界値テスト
 * TC-303: 統合テスト
 */

import { Card } from '@domain/entities/Card';
import type { DropZone } from '@presentation/ui/components/DropZone';
import { DropZoneManager } from '@presentation/ui/components/DropZoneManager';
import type { CardId } from '@shared/types';
import { CardType } from '@shared/types/common';
import type { CardMaster } from '@shared/types/master-data';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

// Phaser.Geom.Rectangleのモック
const createMockRectangle = (x: number, y: number, width: number, height: number) => ({
  x,
  y,
  width,
  height,
  contains: vi.fn().mockImplementation((px: number, py: number) => {
    return px >= x && px < x + width && py >= y && py < y + height;
  }),
});

describe('DropZoneManager', () => {
  let gatheringCard: Card;
  let recipeCard: Card;

  beforeEach(() => {
    // DropZoneManagerをリセット
    DropZoneManager.resetInstance();

    // テスト用カードマスターデータ
    // @ts-expect-error - テスト用の簡易的なCardMaster定義
    const gatheringMaster: CardMaster = {
      id: 'gather_001',
      name: '採取カード',
      type: CardType.GATHERING,
      baseCost: 1,
      materialPool: ['herb', 'stone', 'wood'],
      baseQuantity: 3,
      rarity: 'COMMON',
    };

    // @ts-expect-error - テスト用の簡易的なCardMaster定義
    const recipeMaster: CardMaster = {
      id: 'recipe_001',
      name: 'レシピカード',
      type: CardType.RECIPE,
      cost: 2,
      requiredMaterials: ['herb', 'stone'],
      resultItemId: 'potion_001',
      rarity: 'COMMON',
    };

    gatheringCard = new Card('card_001' as CardId, gatheringMaster as CardMaster);
    recipeCard = new Card('card_002' as CardId, recipeMaster as CardMaster);
  });

  afterEach(() => {
    DropZoneManager.resetInstance();
    vi.clearAllMocks();
  });

  describe('シングルトンパターン', () => {
    test('getInstance()で同一インスタンスが返される', () => {
      const instance1 = DropZoneManager.getInstance();
      const instance2 = DropZoneManager.getInstance();

      expect(instance1).toBe(instance2);
    });

    test('resetInstance()でインスタンスがリセットされる', () => {
      const instance1 = DropZoneManager.getInstance();
      DropZoneManager.resetInstance();
      const instance2 = DropZoneManager.getInstance();

      expect(instance1).not.toBe(instance2);
    });
  });

  describe('TC-009: DropZoneの登録', () => {
    test('ゾーンが正常に登録される', () => {
      const manager = DropZoneManager.getInstance();
      const mockZone: DropZone = {
        id: 'play-area',
        bounds: createMockRectangle(100, 100, 200, 200) as unknown as Phaser.Geom.Rectangle,
        accepts: vi.fn().mockReturnValue(true),
        onDrop: vi.fn(),
      };

      manager.registerZone(mockZone);

      const foundZone = manager.findZoneAt(150, 150);
      expect(foundZone).toBe(mockZone);
    });
  });

  describe('TC-010: DropZoneの解除', () => {
    test('ゾーンが削除される', () => {
      const manager = DropZoneManager.getInstance();
      const mockZone: DropZone = {
        id: 'play-area',
        bounds: createMockRectangle(100, 100, 200, 200) as unknown as Phaser.Geom.Rectangle,
        accepts: vi.fn().mockReturnValue(true),
        onDrop: vi.fn(),
      };

      manager.registerZone(mockZone);
      manager.unregisterZone('play-area');

      const foundZone = manager.findZoneAt(150, 150);
      expect(foundZone).toBeNull();
    });
  });

  describe('TC-011: 座標からDropZoneの検索', () => {
    test('登録されたゾーンが返される', () => {
      const manager = DropZoneManager.getInstance();
      const mockZone: DropZone = {
        id: 'play-area',
        bounds: createMockRectangle(100, 100, 200, 200) as unknown as Phaser.Geom.Rectangle,
        accepts: vi.fn().mockReturnValue(true),
        onDrop: vi.fn(),
      };

      manager.registerZone(mockZone);

      const foundZone = manager.findZoneAt(150, 150);
      expect(foundZone).toBe(mockZone);
    });
  });

  describe('TC-012: 座標がゾーン外の場合', () => {
    test('nullが返される', () => {
      const manager = DropZoneManager.getInstance();
      const mockZone: DropZone = {
        id: 'play-area',
        bounds: createMockRectangle(100, 100, 200, 200) as unknown as Phaser.Geom.Rectangle,
        accepts: vi.fn().mockReturnValue(true),
        onDrop: vi.fn(),
      };

      manager.registerZone(mockZone);

      const foundZone = manager.findZoneAt(50, 50);
      expect(foundZone).toBeNull();
    });
  });

  describe('TC-013: accepts関数による受け入れ判定', () => {
    test('GATHERINGカードが受け入れられる', () => {
      const manager = DropZoneManager.getInstance();
      const mockZone: DropZone = {
        id: 'gathering-area',
        bounds: createMockRectangle(100, 100, 200, 200) as unknown as Phaser.Geom.Rectangle,
        accepts: vi.fn().mockImplementation((card: Card) => card.isGatheringCard()),
        onDrop: vi.fn(),
      };

      manager.registerZone(mockZone);

      const foundZone = manager.findZoneAt(150, 150);
      expect(foundZone?.accepts(gatheringCard)).toBe(true);
    });
  });

  describe('TC-014: accepts関数で拒否される場合', () => {
    test('RECIPEカードが拒否される', () => {
      const manager = DropZoneManager.getInstance();
      const mockZone: DropZone = {
        id: 'gathering-area',
        bounds: createMockRectangle(100, 100, 200, 200) as unknown as Phaser.Geom.Rectangle,
        accepts: vi.fn().mockImplementation((card: Card) => card.isGatheringCard()),
        onDrop: vi.fn(),
      };

      manager.registerZone(mockZone);

      const foundZone = manager.findZoneAt(150, 150);
      expect(foundZone?.accepts(recipeCard)).toBe(false);
    });
  });

  describe('TC-103: DropZoneManagerが未初期化の場合', () => {
    test('findZoneAt()がnullを返す', () => {
      DropZoneManager.resetInstance();
      const manager = DropZoneManager.getInstance();
      // ゾーンを登録しない

      const foundZone = manager.findZoneAt(150, 150);
      expect(foundZone).toBeNull();
    });
  });

  describe('TC-104: 重複するzone idの登録', () => {
    test('新しいゾーンで上書きされる', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const manager = DropZoneManager.getInstance();
      const mockZone1: DropZone = {
        id: 'zone1',
        bounds: createMockRectangle(100, 100, 100, 100) as unknown as Phaser.Geom.Rectangle,
        accepts: vi.fn().mockReturnValue(true),
        onDrop: vi.fn(),
      };

      const mockZone2: DropZone = {
        id: 'zone1', // 同じID
        bounds: createMockRectangle(200, 200, 100, 100) as unknown as Phaser.Geom.Rectangle,
        accepts: vi.fn().mockReturnValue(false),
        onDrop: vi.fn(),
      };

      manager.registerZone(mockZone1);
      manager.registerZone(mockZone2);

      // 警告ログが出力される
      expect(consoleSpy).toHaveBeenCalled();

      // 新しいゾーンで上書きされている
      const foundZone = manager.findZoneAt(250, 250);
      expect(foundZone).toBe(mockZone2);

      consoleSpy.mockRestore();
    });
  });

  describe('TC-203: 複数のDropZoneが重なっている場合', () => {
    test('最初に見つかったゾーンが返される', () => {
      const manager = DropZoneManager.getInstance();
      const mockZone1: DropZone = {
        id: 'zone1',
        bounds: createMockRectangle(100, 100, 200, 200) as unknown as Phaser.Geom.Rectangle,
        accepts: vi.fn().mockReturnValue(true),
        onDrop: vi.fn(),
      };

      const mockZone2: DropZone = {
        id: 'zone2',
        bounds: createMockRectangle(150, 150, 200, 200) as unknown as Phaser.Geom.Rectangle,
        accepts: vi.fn().mockReturnValue(true),
        onDrop: vi.fn(),
      };

      manager.registerZone(mockZone1);
      manager.registerZone(mockZone2);

      // 重なっている位置で検索
      const foundZone = manager.findZoneAt(175, 175);
      // 最初に登録されたゾーン（zone1）が返される
      expect(foundZone?.id).toBe('zone1');
    });
  });

  describe('TC-204: ゾーン境界上の座標', () => {
    test('ゾーンが見つかる（左上角）', () => {
      const manager = DropZoneManager.getInstance();
      const mockZone: DropZone = {
        id: 'zone',
        bounds: createMockRectangle(100, 100, 100, 100) as unknown as Phaser.Geom.Rectangle,
        accepts: vi.fn().mockReturnValue(true),
        onDrop: vi.fn(),
      };

      manager.registerZone(mockZone);

      const foundZone = manager.findZoneAt(100, 100);
      expect(foundZone).toBe(mockZone);
    });
  });

  describe('TC-205: ゾーン境界外の1px外側', () => {
    test('nullが返される', () => {
      const manager = DropZoneManager.getInstance();
      const mockZone: DropZone = {
        id: 'zone',
        bounds: createMockRectangle(100, 100, 100, 100) as unknown as Phaser.Geom.Rectangle,
        accepts: vi.fn().mockReturnValue(true),
        onDrop: vi.fn(),
      };

      manager.registerZone(mockZone);

      const foundZone = manager.findZoneAt(99, 100);
      expect(foundZone).toBeNull();
    });
  });

  describe('TC-303: DropZoneManagerのライフサイクル', () => {
    test('複数ゾーンの登録と解除', () => {
      const manager = DropZoneManager.getInstance();
      const zone1: DropZone = {
        id: 'zone1',
        bounds: createMockRectangle(0, 0, 100, 100) as unknown as Phaser.Geom.Rectangle,
        accepts: vi.fn().mockReturnValue(true),
        onDrop: vi.fn(),
      };

      const zone2: DropZone = {
        id: 'zone2',
        bounds: createMockRectangle(100, 0, 100, 100) as unknown as Phaser.Geom.Rectangle,
        accepts: vi.fn().mockReturnValue(true),
        onDrop: vi.fn(),
      };

      const zone3: DropZone = {
        id: 'zone3',
        bounds: createMockRectangle(200, 0, 100, 100) as unknown as Phaser.Geom.Rectangle,
        accepts: vi.fn().mockReturnValue(true),
        onDrop: vi.fn(),
      };

      // 3つのゾーンを登録
      manager.registerZone(zone1);
      manager.registerZone(zone2);
      manager.registerZone(zone3);

      // すべてのゾーンが見つかることを確認
      expect(manager.findZoneAt(50, 50)).toBe(zone1);
      expect(manager.findZoneAt(150, 50)).toBe(zone2);
      expect(manager.findZoneAt(250, 50)).toBe(zone3);

      // zone2を解除
      manager.unregisterZone('zone2');

      // zone2が見つからなくなることを確認
      expect(manager.findZoneAt(50, 50)).toBe(zone1);
      expect(manager.findZoneAt(150, 50)).toBeNull();
      expect(manager.findZoneAt(250, 50)).toBe(zone3);
    });
  });

  describe('clearAllZones', () => {
    test('すべてのゾーンが削除される', () => {
      const manager = DropZoneManager.getInstance();
      const zone1: DropZone = {
        id: 'zone1',
        bounds: createMockRectangle(0, 0, 100, 100) as unknown as Phaser.Geom.Rectangle,
        accepts: vi.fn().mockReturnValue(true),
        onDrop: vi.fn(),
      };

      const zone2: DropZone = {
        id: 'zone2',
        bounds: createMockRectangle(100, 0, 100, 100) as unknown as Phaser.Geom.Rectangle,
        accepts: vi.fn().mockReturnValue(true),
        onDrop: vi.fn(),
      };

      manager.registerZone(zone1);
      manager.registerZone(zone2);

      manager.clearAllZones();

      expect(manager.findZoneAt(50, 50)).toBeNull();
      expect(manager.findZoneAt(150, 50)).toBeNull();
    });
  });
});
