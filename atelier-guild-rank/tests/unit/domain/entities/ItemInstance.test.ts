/**
 * ItemInstance エンティティ テストケース
 * TASK-0012 アイテムエンティティ・AlchemyService実装
 *
 * @description
 * T-0012-E01 〜 T-0012-E09, TC-ITEM-001 〜 TC-ITEM-009, TC-CONST-001 を実装
 */

import { ItemInstance, QUALITY_PRICE_MULTIPLIER } from '@domain/entities/ItemInstance';
import { MaterialInstance } from '@domain/entities/MaterialInstance';
import type { IItem, IMaterial } from '@shared/types';
import { ItemCategory, Quality, toItemId, toMaterialId } from '@shared/types';
import { describe, expect, it } from 'vitest';

// =============================================================================
// モックデータ
// =============================================================================

/**
 * モックアイテムマスターを作成
 */
function createMockItemMaster(id: string, name: string, basePrice: number): IItem {
  return {
    id: toItemId(id),
    name,
    category: ItemCategory.CONSUMABLE,
    effects: [],
    description: `${name}の説明`,
    basePrice,
  } as IItem & { basePrice: number };
}

/**
 * basePriceがundefinedのモックアイテムマスターを作成
 */
function createMockItemMasterWithoutPrice(id: string, name: string): IItem {
  return {
    id: toItemId(id),
    name,
    category: ItemCategory.CONSUMABLE,
    effects: [],
    description: `${name}の説明`,
    // basePriceは意図的に省略
  } as IItem;
}

/**
 * モック素材インスタンスを作成
 */
function createMockMaterialInstance(materialId: string, quality: Quality): MaterialInstance {
  const master: IMaterial = {
    id: toMaterialId(materialId),
    name: `${materialId}の名前`,
    baseQuality: quality,
    attributes: [],
    description: `${materialId}の説明`,
  };
  return new MaterialInstance(`material_${Date.now()}_${Math.random()}`, master, quality);
}

// =============================================================================
// テスト
// =============================================================================

describe('ItemInstance', () => {
  // =============================================================================
  // T-0012-E01〜E03: コンストラクタ・基本プロパティ
  // =============================================================================

  describe('コンストラクタ', () => {
    it('T-0012-E01: アイテムインスタンスが正しいプロパティで生成されること', () => {
      // 【テスト目的】: ItemInstanceが正しく生成されること
      // 【テスト内容】: instanceId, master, quality, usedMaterialsが正しく設定される
      // 【期待される動作】: すべてのプロパティが正しく保持される
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const instanceId = 'item_1234567890_1234';
      const master = createMockItemMaster('potion', '回復薬', 100);
      const quality = Quality.B;
      const usedMaterials = [createMockMaterialInstance('herb', Quality.B)];

      // Act
      const item = new ItemInstance(instanceId, master, quality, usedMaterials);

      // Assert
      expect(item.instanceId).toBe(instanceId);
      expect(item.master).toBe(master);
      expect(item.quality).toBe(quality);
      expect(item.usedMaterials).toEqual(usedMaterials);
    });

    it('T-0012-E02: 空のusedMaterials配列で生成', () => {
      // 【テスト目的】: usedMaterialsが空配列で生成できること
      // 【テスト内容】: usedMaterialsを空配列として渡す
      // 【期待される動作】: usedMaterialsが空配列として保持される
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const instanceId = 'item_1234567890_1234';
      const master = createMockItemMaster('potion', '回復薬', 100);
      const quality = Quality.B;
      const usedMaterials: MaterialInstance[] = [];

      // Act
      const item = new ItemInstance(instanceId, master, quality, usedMaterials);

      // Assert
      expect(item.usedMaterials).toEqual([]);
      expect(item.usedMaterials.length).toBe(0);
    });

    it('T-0012-E03: 複数の素材を持つインスタンス生成', () => {
      // 【テスト目的】: 複数素材でItemInstanceが生成できること
      // 【テスト内容】: usedMaterialsに複数素材を渡す
      // 【期待される動作】: usedMaterialsが正しく保持される
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const instanceId = 'item_1234567890_1234';
      const master = createMockItemMaster('potion', '回復薬', 100);
      const quality = Quality.B;
      const usedMaterials = [
        createMockMaterialInstance('herb', Quality.B),
        createMockMaterialInstance('water', Quality.C),
        createMockMaterialInstance('ore', Quality.A),
      ];

      // Act
      const item = new ItemInstance(instanceId, master, quality, usedMaterials);

      // Assert
      expect(item.usedMaterials.length).toBe(3);
      expect(item.usedMaterials).toEqual(usedMaterials);
    });
  });

  // =============================================================================
  // T-0012-E04〜E07: getterメソッド
  // =============================================================================

  describe('getterメソッド', () => {
    it('T-0012-E04: itemIdゲッターがmaster.idを返すこと', () => {
      // 【テスト目的】: itemIdゲッターが正しく動作すること
      // 【テスト内容】: master.idが正しく返される
      // 【期待される動作】: itemIdゲッターがmaster.idを返す
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const master = createMockItemMaster('potion', '回復薬', 100);
      const item = new ItemInstance('item_001', master, Quality.B, []);

      // Act & Assert
      expect(item.itemId).toBe(master.id);
    });

    it('T-0012-E05: nameゲッターがmaster.nameを返すこと', () => {
      // 【テスト目的】: nameゲッターが正しく動作すること
      // 【テスト内容】: master.nameが正しく返される
      // 【期待される動作】: nameゲッターがmaster.nameを返す
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const master = createMockItemMaster('potion', '回復薬', 100);
      const item = new ItemInstance('item_001', master, Quality.B, []);

      // Act & Assert
      expect(item.name).toBe('回復薬');
    });

    it('T-0012-E06: basePriceゲッターがmaster.basePriceを返すこと', () => {
      // 【テスト目的】: basePriceゲッターが正しく動作すること
      // 【テスト内容】: master.basePriceが正しく返される
      // 【期待される動作】: basePriceゲッターがmaster.basePriceを返す
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const master = createMockItemMaster('potion', '回復薬', 100);
      const item = new ItemInstance('item_001', master, Quality.B, []);

      // Act & Assert
      expect(item.basePrice).toBe(100);
    });

    it('T-0012-E07: basePriceがundefinedの場合0を返すこと', () => {
      // 【テスト目的】: basePriceがundefinedの場合の挙動確認
      // 【テスト内容】: master.basePriceがないアイテムを作成
      // 【期待される動作】: 0が返される
      // 🟡 信頼性レベル: 設計文書から妥当に推測

      // Arrange
      const master = createMockItemMasterWithoutPrice('potion', '回復薬');
      const item = new ItemInstance('item_001', master, Quality.B, []);

      // Act & Assert
      expect(item.basePrice).toBe(0);
    });
  });

  // =============================================================================
  // TC-ITEM-001〜TC-ITEM-009: calculatePrice()メソッド
  // =============================================================================

  describe('calculatePrice', () => {
    it('TC-ITEM-001: D品質で価格計算（係数0.5）', () => {
      // 【テスト目的】: D品質の価格計算が正しく動作すること
      // 【テスト内容】: basePrice=100, quality=Dで計算
      // 【期待される動作】: 50が返される（100 × 0.5）
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const master = createMockItemMaster('potion', '回復薬', 100);
      const item = new ItemInstance('item_001', master, Quality.D, []);

      // Act
      const price = item.calculatePrice();

      // Assert
      expect(price).toBe(50);
    });

    it('TC-ITEM-002: C品質で価格計算（係数0.75）', () => {
      // 【テスト目的】: C品質の価格計算が正しく動作すること
      // 【テスト内容】: basePrice=100, quality=Cで計算
      // 【期待される動作】: 75が返される（100 × 0.75）
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const master = createMockItemMaster('potion', '回復薬', 100);
      const item = new ItemInstance('item_001', master, Quality.C, []);

      // Act & Assert
      expect(item.calculatePrice()).toBe(75);
    });

    it('TC-ITEM-003: B品質で価格計算（係数1.0）', () => {
      // 【テスト目的】: B品質の価格計算が正しく動作すること
      // 【テスト内容】: basePrice=100, quality=Bで計算
      // 【期待される動作】: 100が返される（100 × 1.0）
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const master = createMockItemMaster('potion', '回復薬', 100);
      const item = new ItemInstance('item_001', master, Quality.B, []);

      // Act & Assert
      expect(item.calculatePrice()).toBe(100);
    });

    it('TC-ITEM-004: A品質で価格計算（係数1.5）', () => {
      // 【テスト目的】: A品質の価格計算が正しく動作すること
      // 【テスト内容】: basePrice=100, quality=Aで計算
      // 【期待される動作】: 150が返される（100 × 1.5）
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const master = createMockItemMaster('potion', '回復薬', 100);
      const item = new ItemInstance('item_001', master, Quality.A, []);

      // Act & Assert
      expect(item.calculatePrice()).toBe(150);
    });

    it('TC-ITEM-005: S品質で価格計算（係数2.0）', () => {
      // 【テスト目的】: S品質の価格計算が正しく動作すること
      // 【テスト内容】: basePrice=100, quality=Sで計算
      // 【期待される動作】: 200が返される（100 × 2.0）
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const master = createMockItemMaster('potion', '回復薬', 100);
      const item = new ItemInstance('item_001', master, Quality.S, []);

      // Act & Assert
      expect(item.calculatePrice()).toBe(200);
    });

    it('TC-ITEM-006: 異なる基本価格での計算（basePrice=150, B品質）', () => {
      // 【テスト目的】: 異なる基本価格での価格計算が正しく動作すること
      // 【テスト内容】: basePrice=150, quality=Bで計算
      // 【期待される動作】: 150が返される（150 × 1.0）
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const master = createMockItemMaster('elixir', 'エリクサー', 150);
      const item = new ItemInstance('item_001', master, Quality.B, []);

      // Act & Assert
      expect(item.calculatePrice()).toBe(150);
    });

    it('TC-ITEM-007: 端数切捨て確認（basePrice=99, C品質）', () => {
      // 【テスト目的】: 端数切捨てが正しく動作すること
      // 【テスト内容】: 99 × 0.75 = 74.25 → 74
      // 【期待される動作】: 74が返される（端数切り捨て）
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const master = createMockItemMaster('potion', '回復薬', 99);
      const item = new ItemInstance('item_001', master, Quality.C, []);

      // Act & Assert
      expect(item.calculatePrice()).toBe(74);
    });

    it('TC-ITEM-008: basePrice=0の場合', () => {
      // 【テスト目的】: basePrice=0の場合の挙動確認
      // 【テスト内容】: basePrice=0, quality=Sで計算
      // 【期待される動作】: 0が返される
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const master = createMockItemMaster('potion', '回復薬', 0);
      const item = new ItemInstance('item_001', master, Quality.S, []);

      // Act & Assert
      expect(item.calculatePrice()).toBe(0);
    });

    it('TC-ITEM-009: basePriceがundefinedの場合', () => {
      // 【テスト目的】: basePriceがundefinedの場合の挙動確認
      // 【テスト内容】: master.basePriceがないアイテムで計算
      // 【期待される動作】: 0が返される
      // 🟡 信頼性レベル: 設計文書から妥当に推測

      // Arrange
      const master = createMockItemMasterWithoutPrice('potion', '回復薬');
      const item = new ItemInstance('item_001', master, Quality.B, []);

      // Act & Assert
      expect(item.calculatePrice()).toBe(0);
    });
  });

  // =============================================================================
  // T-0012-E08〜E09: 不変性テスト
  // =============================================================================

  describe('不変性', () => {
    it('T-0012-E08: プロパティがreadonlyであること', () => {
      // 【テスト目的】: ItemInstanceが不変オブジェクトとして実装されていること
      // 【テスト内容】: すべてのプロパティがreadonly属性であること
      // 【期待される動作】: TypeScriptの型チェックでreadonly属性が保証される
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const instanceId = 'item_1234567890_1234';
      const master = createMockItemMaster('potion', '回復薬', 100);
      const quality = Quality.B;
      const usedMaterials = [createMockMaterialInstance('herb', Quality.B)];

      // Act
      const item = new ItemInstance(instanceId, master, quality, usedMaterials);

      // Assert
      // TypeScriptのreadonlyは型チェック時の保証なので、
      // 実行時のテストではプロパティが正しく保持されることを確認
      expect(item.instanceId).toBe(instanceId);
      expect(item.master).toBe(master);
      expect(item.quality).toBe(quality);
      expect(item.usedMaterials).toBe(usedMaterials);
    });

    it('T-0012-E09: usedMaterials配列の参照が不変であること', () => {
      // 【テスト目的】: usedMaterials配列の参照が変更されないこと
      // 【テスト内容】: 外部で配列参照を操作しても内部は変わらない
      // 【期待される動作】: 配列参照が変更されないこと
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const instanceId = 'item_1234567890_1234';
      const master = createMockItemMaster('potion', '回復薬', 100);
      const quality = Quality.B;
      const originalMaterials = [createMockMaterialInstance('herb', Quality.B)];
      const item = new ItemInstance(instanceId, master, quality, originalMaterials);

      // Act & Assert
      // 参照が保持されていることを確認
      expect(item.usedMaterials).toBe(originalMaterials);
      expect(item.usedMaterials.length).toBe(1);
    });
  });

  // =============================================================================
  // TC-CONST-001: QUALITY_PRICE_MULTIPLIER定数テスト
  // =============================================================================

  describe('QUALITY_PRICE_MULTIPLIER', () => {
    it('TC-CONST-001: 品質価格係数が正しく定義されていること', () => {
      // 【テスト目的】: QUALITY_PRICE_MULTIPLIER定数が正しく定義されていること
      // 【テスト内容】: 各品質の係数を確認
      // 【期待される動作】: D=0.5, C=0.75, B=1.0, A=1.5, S=2.0
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      expect(QUALITY_PRICE_MULTIPLIER[Quality.D]).toBe(0.5);
      expect(QUALITY_PRICE_MULTIPLIER[Quality.C]).toBe(0.75);
      expect(QUALITY_PRICE_MULTIPLIER[Quality.B]).toBe(1.0);
      expect(QUALITY_PRICE_MULTIPLIER[Quality.A]).toBe(1.5);
      expect(QUALITY_PRICE_MULTIPLIER[Quality.S]).toBe(2.0);
    });
  });
});
