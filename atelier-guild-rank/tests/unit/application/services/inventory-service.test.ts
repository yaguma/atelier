/**
 * InventoryService テストケース
 * TASK-0015 InventoryService実装
 *
 * @description
 * T-0015-01 〜 T-0015-06: InventoryServiceの単体テスト
 */

import { InventoryService } from '@application/services/inventory-service';
import { ItemInstance } from '@domain/entities/ItemInstance';
import { MaterialInstance } from '@domain/entities/MaterialInstance';
import type { IInventoryService } from '@domain/interfaces/inventory-service.interface';
import type { IItem, IMaterial } from '@shared/types';
import { Attribute, Quality, toArtifactId, toItemId, toMaterialId } from '@shared/types';
import { beforeEach, describe, expect, it } from 'vitest';

// =============================================================================
// モックデータ
// =============================================================================

/**
 * モック素材マスターを作成
 */
function createMockMaterialMaster(
  id: string,
  name: string,
  attributes: Attribute[] = [],
): IMaterial {
  return {
    id: toMaterialId(id),
    name,
    baseQuality: Quality.C,
    attributes,
    description: `${name}の説明`,
  };
}

/**
 * モック素材インスタンスを作成
 */
function createMockMaterialInstance(
  id: string,
  quality: Quality = Quality.C,
  attributes: Attribute[] = [],
): MaterialInstance {
  const master = createMockMaterialMaster(id, `${id}_name`, attributes);
  return new MaterialInstance(`material_${id}_${Date.now()}`, master, quality);
}

/**
 * モックアイテムマスターを作成
 */
function createMockItemMaster(id: string, name: string): IItem {
  return {
    id: toItemId(id),
    name,
    category: 'MEDICINE',
    description: `${name}の説明`,
    effects: [],
  } as IItem;
}

// 一意なインスタンスIDを生成するためのカウンタ
let itemInstanceCounter = 0;

/**
 * モックアイテムインスタンスを作成
 */
function createMockItemInstance(id: string, quality: Quality = Quality.C): ItemInstance {
  const master = createMockItemMaster(id, `${id}_name`);
  itemInstanceCounter++;
  return new ItemInstance(`item_${id}_${Date.now()}_${itemInstanceCounter}`, master, quality, []);
}

// =============================================================================
// テスト
// =============================================================================

describe('InventoryService', () => {
  let service: IInventoryService;

  beforeEach(() => {
    service = new InventoryService();
  });

  // =============================================================================
  // 初期状態
  // =============================================================================

  describe('初期状態', () => {
    it('初期状態では素材・アイテム・アーティファクトが空', () => {
      expect(service.getMaterials()).toHaveLength(0);
      expect(service.getItems()).toHaveLength(0);
      expect(service.getArtifacts()).toHaveLength(0);
    });

    it('初期の各カウントは0', () => {
      expect(service.getMaterialCount()).toBe(0);
      expect(service.getItemCount()).toBe(0);
      expect(service.getArtifactCount()).toBe(0);
    });
  });

  // =============================================================================
  // T-0015-01: 素材追加
  // =============================================================================

  describe('素材追加', () => {
    it('T-0015-01: 素材追加成功、カウント増加', () => {
      // 【テスト目的】: 素材をインベントリに追加できる
      // 【テスト内容】: 素材を1つ追加してカウントを確認
      // 【期待される動作】: カウントが1になる
      // 🔵 信頼性レベル: 設計文書に明記

      // Arrange
      const material = createMockMaterialInstance('herb');

      // Act
      service.addMaterial(material);

      // Assert
      expect(service.getMaterialCount()).toBe(1);
      expect(service.getMaterials()).toContain(material);
    });

    it('複数の素材を一度に追加できる', () => {
      // Arrange
      const materials = [
        createMockMaterialInstance('herb1'),
        createMockMaterialInstance('herb2'),
        createMockMaterialInstance('herb3'),
      ];

      // Act
      service.addMaterials(materials);

      // Assert
      expect(service.getMaterialCount()).toBe(3);
    });
  });

  // =============================================================================
  // T-0015-02: 素材削除
  // =============================================================================

  describe('素材削除', () => {
    it('T-0015-02: 素材削除成功、インスタンス返却', () => {
      // 【テスト目的】: 素材をインベントリから削除できる
      // 【テスト内容】: 追加した素材を削除してインスタンスを確認
      // 【期待される動作】: 削除されたインスタンスが返る
      // 🔵 信頼性レベル: 設計文書に明記

      // Arrange
      const material = createMockMaterialInstance('herb');
      service.addMaterial(material);

      // Act
      const removed = service.removeMaterial(material.instanceId);

      // Assert
      expect(removed).toBe(material);
      expect(service.getMaterialCount()).toBe(0);
    });

    it('存在しない素材を削除するとnullを返す', () => {
      // Act
      const removed = service.removeMaterial('non_existent');

      // Assert
      expect(removed).toBeNull();
    });

    it('複数の素材を一度に削除できる', () => {
      // Arrange
      const mat1 = createMockMaterialInstance('herb1');
      const mat2 = createMockMaterialInstance('herb2');
      const mat3 = createMockMaterialInstance('herb3');
      service.addMaterials([mat1, mat2, mat3]);

      // Act
      const removed = service.removeMaterials([mat1.instanceId, mat2.instanceId]);

      // Assert
      expect(removed).toHaveLength(2);
      expect(service.getMaterialCount()).toBe(1);
    });
  });

  // =============================================================================
  // T-0015-03: 容量超過
  // =============================================================================

  describe('容量超過', () => {
    it('T-0015-03: 素材容量超過でエラー発生', () => {
      // 【テスト目的】: 素材インベントリの容量制限が機能する
      // 【テスト内容】: 最大容量まで追加後、さらに追加を試みる
      // 【期待される動作】: エラーがスローされる
      // 🔵 信頼性レベル: 設計文書に明記

      // Arrange
      const capacity = service.getMaterialCapacity();
      for (let i = 0; i < capacity; i++) {
        service.addMaterial(createMockMaterialInstance(`herb_${i}`));
      }

      // Act & Assert
      expect(() => {
        service.addMaterial(createMockMaterialInstance('overflow'));
      }).toThrow();
    });

    it('アイテム容量超過でエラー発生', () => {
      // Arrange
      const capacity = service.getItemCapacity();
      for (let i = 0; i < capacity; i++) {
        service.addItem(createMockItemInstance(`item_${i}`));
      }

      // Act & Assert
      expect(() => {
        service.addItem(createMockItemInstance('overflow'));
      }).toThrow();
    });

    it('アーティファクト容量超過でエラー発生', () => {
      // Arrange
      const capacity = service.getArtifactCapacity();
      for (let i = 0; i < capacity; i++) {
        service.addArtifact(toArtifactId(`artifact_${i}`));
      }

      // Act & Assert
      expect(() => {
        service.addArtifact(toArtifactId('overflow'));
      }).toThrow();
    });
  });

  // =============================================================================
  // T-0015-04: カテゴリフィルタ
  // =============================================================================

  describe('フィルタリング', () => {
    it('T-0015-04: 属性で素材をフィルタリングできる', () => {
      // 【テスト目的】: 属性で素材をフィルタリングできる
      // 【テスト内容】: 異なる属性の素材を追加し、特定属性でフィルタリング
      // 【期待される動作】: 該当属性の素材のみ返却
      // 🔵 信頼性レベル: 設計文書に明記

      // Arrange
      const fireMat = createMockMaterialInstance('fire_herb', Quality.C, [Attribute.FIRE]);
      const waterMat = createMockMaterialInstance('water_herb', Quality.C, [Attribute.WATER]);
      const mixMat = createMockMaterialInstance('mix_herb', Quality.C, [
        Attribute.FIRE,
        Attribute.WATER,
      ]);
      service.addMaterials([fireMat, waterMat, mixMat]);

      // Act
      const fireResults = service.getMaterialsByAttribute(Attribute.FIRE);
      const waterResults = service.getMaterialsByAttribute(Attribute.WATER);

      // Assert
      expect(fireResults).toHaveLength(2); // fireMat, mixMat
      expect(waterResults).toHaveLength(2); // waterMat, mixMat
    });

    it('アイテムIDでアイテムをフィルタリングできる', () => {
      // Arrange
      const potion1 = createMockItemInstance('potion');
      const potion2 = createMockItemInstance('potion');
      const antidote = createMockItemInstance('antidote');
      service.addItem(potion1);
      service.addItem(potion2);
      service.addItem(antidote);

      // Act
      const potions = service.getItemsByType(toItemId('potion'));

      // Assert
      expect(potions).toHaveLength(2);
    });
  });

  // =============================================================================
  // T-0015-05: アーティファクト追加
  // =============================================================================

  describe('アーティファクト管理', () => {
    it('T-0015-05: アーティファクト追加成功', () => {
      // 【テスト目的】: アーティファクトを追加できる
      // 【テスト内容】: アーティファクトを追加して確認
      // 【期待される動作】: アーティファクトが追加される
      // 🔵 信頼性レベル: 設計文書に明記

      // Arrange
      const artifactId = toArtifactId('artifact_glasses');

      // Act
      service.addArtifact(artifactId);

      // Assert
      expect(service.hasArtifact(artifactId)).toBe(true);
      expect(service.getArtifactCount()).toBe(1);
    });

    it('同じアーティファクトを重複追加するとエラー', () => {
      // Arrange
      const artifactId = toArtifactId('artifact_glasses');
      service.addArtifact(artifactId);

      // Act & Assert
      expect(() => {
        service.addArtifact(artifactId);
      }).toThrow();
    });

    it('アーティファクトを削除できる', () => {
      // Arrange
      const artifactId = toArtifactId('artifact_glasses');
      service.addArtifact(artifactId);

      // Act
      const result = service.removeArtifact(artifactId);

      // Assert
      expect(result).toBe(true);
      expect(service.hasArtifact(artifactId)).toBe(false);
    });

    it('存在しないアーティファクトを削除するとfalseを返す', () => {
      // Act
      const result = service.removeArtifact(toArtifactId('non_existent'));

      // Assert
      expect(result).toBe(false);
    });
  });

  // =============================================================================
  // T-0015-06: クリア
  // =============================================================================

  describe('クリア', () => {
    it('T-0015-06: クリアで全アイテム削除', () => {
      // 【テスト目的】: インベントリをクリアできる
      // 【テスト内容】: 素材・アイテム・アーティファクトを追加後クリア
      // 【期待される動作】: 全て削除される
      // 🔵 信頼性レベル: 設計文書に明記

      // Arrange
      service.addMaterial(createMockMaterialInstance('herb'));
      service.addItem(createMockItemInstance('potion'));
      service.addArtifact(toArtifactId('artifact_glasses'));

      // Act
      service.clear();

      // Assert
      expect(service.getMaterialCount()).toBe(0);
      expect(service.getItemCount()).toBe(0);
      expect(service.getArtifactCount()).toBe(0);
    });
  });

  // =============================================================================
  // 検索
  // =============================================================================

  describe('検索', () => {
    it('インスタンスIDで素材を検索できる', () => {
      // Arrange
      const material = createMockMaterialInstance('herb');
      service.addMaterial(material);

      // Act
      const found = service.findMaterialById(material.instanceId);

      // Assert
      expect(found).toBe(material);
    });

    it('存在しない素材を検索するとnullを返す', () => {
      // Act
      const found = service.findMaterialById('non_existent');

      // Assert
      expect(found).toBeNull();
    });

    it('インスタンスIDでアイテムを検索できる', () => {
      // Arrange
      const item = createMockItemInstance('potion');
      service.addItem(item);

      // Act
      const found = service.findItemById(item.instanceId);

      // Assert
      expect(found).toBe(item);
    });

    it('存在しないアイテムを検索するとnullを返す', () => {
      // Act
      const found = service.findItemById('non_existent');

      // Assert
      expect(found).toBeNull();
    });
  });

  // =============================================================================
  // 容量管理
  // =============================================================================

  describe('容量管理', () => {
    it('素材の残り容量が正しく計算される', () => {
      // Arrange
      const capacity = service.getMaterialCapacity();
      service.addMaterial(createMockMaterialInstance('herb1'));
      service.addMaterial(createMockMaterialInstance('herb2'));

      // Act
      const remaining = service.getMaterialRemainingCapacity();

      // Assert
      expect(remaining).toBe(capacity - 2);
    });

    it('アイテムの残り容量が正しく計算される', () => {
      // Arrange
      const capacity = service.getItemCapacity();
      service.addItem(createMockItemInstance('potion'));

      // Act
      const remaining = service.getItemRemainingCapacity();

      // Assert
      expect(remaining).toBe(capacity - 1);
    });

    it('アーティファクトの残り容量が正しく計算される', () => {
      // Arrange
      const capacity = service.getArtifactCapacity();
      service.addArtifact(toArtifactId('artifact_1'));
      service.addArtifact(toArtifactId('artifact_2'));

      // Act
      const remaining = service.getArtifactRemainingCapacity();

      // Assert
      expect(remaining).toBe(capacity - 2);
    });
  });
});
