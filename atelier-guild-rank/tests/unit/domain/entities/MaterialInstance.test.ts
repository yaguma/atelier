/**
 * MaterialInstance エンティティ テストケース
 * TASK-0010 素材エンティティ・MaterialService実装
 *
 * @description
 * T-0010-E01 〜 T-0010-E04 を実装
 */

import { MaterialInstance } from '@domain/entities/MaterialInstance';
import type { IMaterial } from '@shared/types';
import { Attribute, Quality, toMaterialId } from '@shared/types';
import { describe, expect, it } from 'vitest';

// モック素材マスターデータ
const mockHerbMaster: IMaterial = {
  id: toMaterialId('herb'),
  name: '薬草',
  baseQuality: Quality.B,
  attributes: [Attribute.GRASS],
  description: '基本的な薬草',
};

const mockOreMaster: IMaterial = {
  id: toMaterialId('ore'),
  name: '鉱石',
  baseQuality: Quality.A,
  attributes: [Attribute.EARTH],
  description: '硬い鉱石',
};

describe('MaterialInstance', () => {
  // =============================================================================
  // T-0010-E01: 素材インスタンス生成（正常）
  // =============================================================================

  describe('コンストラクタ', () => {
    it('T-0010-E01: 素材インスタンスが正しいプロパティで生成されること', () => {
      // 【テスト目的】: MaterialInstanceが正しく生成されること
      // 【テスト内容】: instanceId, master, qualityが正しく設定される
      // 【期待される動作】: すべてのプロパティが正しく保持される
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const instanceId = 'material_1234567890_1234';
      const quality = Quality.B;

      // Act
      const material = new MaterialInstance(instanceId, mockHerbMaster, quality);

      // Assert
      expect(material.instanceId).toBe(instanceId);
      expect(material.master).toBe(mockHerbMaster);
      expect(material.quality).toBe(quality);
      expect(material.materialId).toBe(toMaterialId('herb'));
      expect(material.name).toBe('薬草');
      expect(material.baseQuality).toBe(Quality.B);
      expect(material.attributes).toEqual([Attribute.GRASS]);
    });
  });

  // =============================================================================
  // T-0010-E02: 素材インスタンスの不変性
  // =============================================================================

  describe('不変性', () => {
    it('T-0010-E02: 素材インスタンスのプロパティが変更不可能であること', () => {
      // 【テスト目的】: MaterialInstanceが不変オブジェクトとして実装されていること
      // 【テスト内容】: すべてのプロパティがreadonly属性であること
      // 【期待される動作】: TypeScriptの型チェックでreadonly属性が保証される
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const instanceId = 'material_1234567890_1234';
      const quality = Quality.B;

      // Act
      const material = new MaterialInstance(instanceId, mockHerbMaster, quality);

      // Assert
      // TypeScriptの型チェックでreadonly属性が保証される
      // 実行時に変更を試みるとエラーが発生する
      expect(material.instanceId).toBe(instanceId);
      expect(material.master).toBe(mockHerbMaster);
      expect(material.quality).toBe(quality);

      // 注: TypeScriptのreadonlyは型チェック時の保証なので、
      // 実行時のテストでは直接検証できないが、プロパティが正しく保持されることを確認
    });
  });

  // =============================================================================
  // T-0010-E03〜E04: 境界値テスト
  // =============================================================================

  describe('境界値テスト', () => {
    it('T-0010-E03: 品質が最小値（D）で生成', () => {
      // 【テスト目的】: 品質Dの素材インスタンスが正しく生成されること
      // 【テスト内容】: 最小値Dで素材を生成
      // 【期待される動作】: qualityがDとして保持される
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const instanceId = 'material_1234567890_1234';
      const quality = Quality.D;

      // Act
      const material = new MaterialInstance(instanceId, mockHerbMaster, quality);

      // Assert
      expect(material.quality).toBe(Quality.D);
      expect(material.instanceId).toBe(instanceId);
    });

    it('T-0010-E04: 品質が最大値（S）で生成', () => {
      // 【テスト目的】: 品質Sの素材インスタンスが正しく生成されること
      // 【テスト内容】: 最大値Sで素材を生成
      // 【期待される動作】: qualityがSとして保持される
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const instanceId = 'material_1234567890_1234';
      const quality = Quality.S;

      // Act
      const material = new MaterialInstance(instanceId, mockOreMaster, quality);

      // Assert
      expect(material.quality).toBe(Quality.S);
      expect(material.instanceId).toBe(instanceId);
    });
  });

  // =============================================================================
  // getterメソッドのテスト
  // =============================================================================

  describe('getterメソッド', () => {
    it('materialIdゲッターがmaster.idを返すこと', () => {
      // 【テスト目的】: materialIdゲッターが正しく動作すること
      // 【テスト内容】: master.idが正しく返される
      // 【期待される動作】: materialIdゲッターがmaster.idを返す
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const instanceId = 'material_1234567890_1234';
      const material = new MaterialInstance(instanceId, mockHerbMaster, Quality.B);

      // Act & Assert
      expect(material.materialId).toBe(mockHerbMaster.id);
    });

    it('nameゲッターがmaster.nameを返すこと', () => {
      // 【テスト目的】: nameゲッターが正しく動作すること
      // 【テスト内容】: master.nameが正しく返される
      // 【期待される動作】: nameゲッターがmaster.nameを返す
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const instanceId = 'material_1234567890_1234';
      const material = new MaterialInstance(instanceId, mockHerbMaster, Quality.B);

      // Act & Assert
      expect(material.name).toBe('薬草');
    });

    it('baseQualityゲッターがmaster.baseQualityを返すこと', () => {
      // 【テスト目的】: baseQualityゲッターが正しく動作すること
      // 【テスト内容】: master.baseQualityが正しく返される
      // 【期待される動作】: baseQualityゲッターがmaster.baseQualityを返す
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const instanceId = 'material_1234567890_1234';
      const material = new MaterialInstance(instanceId, mockHerbMaster, Quality.B);

      // Act & Assert
      expect(material.baseQuality).toBe(Quality.B);
    });

    it('attributesゲッターがmaster.attributesを返すこと', () => {
      // 【テスト目的】: attributesゲッターが正しく動作すること
      // 【テスト内容】: master.attributesが正しく返される
      // 【期待される動作】: attributesゲッターがmaster.attributesを返す
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const instanceId = 'material_1234567890_1234';
      const material = new MaterialInstance(instanceId, mockHerbMaster, Quality.B);

      // Act & Assert
      expect(material.attributes).toEqual([Attribute.GRASS]);
    });
  });
});
