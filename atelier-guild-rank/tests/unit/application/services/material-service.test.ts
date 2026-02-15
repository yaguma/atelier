/**
 * MaterialService テストケース
 * TASK-0010 素材エンティティ・MaterialService実装
 *
 * @description
 * T-0010-S01 〜 T-0010-S24 を実装（Phase 1 必須のみ）
 */

import type { IMasterDataRepository } from '@domain/interfaces/master-data-repository.interface';
import type { IMaterialService } from '@domain/interfaces/material-service.interface';
import type { IEventBus } from '@shared/services/event-bus';
import { MaterialService } from '@shared/services/material-service';
import type { IMaterial } from '@shared/types';
import { Attribute, Quality, toMaterialId } from '@shared/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// モック素材マスターデータ
const mockMaterials: Record<string, IMaterial> = {
  herb: {
    id: toMaterialId('herb'),
    name: '薬草',
    baseQuality: Quality.B,
    attributes: [Attribute.GRASS],
    description: '基本的な薬草',
  },
  ore: {
    id: toMaterialId('ore'),
    name: '鉱石',
    baseQuality: Quality.A,
    attributes: [Attribute.EARTH],
    description: '硬い鉱石',
  },
  water: {
    id: toMaterialId('water'),
    name: '清水',
    baseQuality: Quality.C,
    attributes: [Attribute.WATER],
    description: 'きれいな水',
  },
};

// モックMasterDataRepository
class MockMasterDataRepository implements Partial<IMasterDataRepository> {
  getMaterialById(id: unknown): IMaterial | undefined {
    const idStr = String(id);
    return mockMaterials[idStr];
  }

  isLoaded(): boolean {
    return true;
  }
}

// モックEventBus
class MockEventBus implements Partial<IEventBus> {
  emit = vi.fn();
  on = vi.fn();
  off = vi.fn();
  once = vi.fn();
}

describe('MaterialService', () => {
  let materialService: IMaterialService;
  let mockMasterDataRepo: IMasterDataRepository;
  let mockEventBus: IEventBus;

  beforeEach(() => {
    // 各テスト実行前にMaterialServiceを初期化
    mockMasterDataRepo = new MockMasterDataRepository() as IMasterDataRepository;
    mockEventBus = new MockEventBus() as IEventBus;
    materialService = new MaterialService(mockMasterDataRepo, mockEventBus);
  });

  // =============================================================================
  // T-0010-S01〜S03: createInstance のテスト
  // =============================================================================

  describe('createInstance', () => {
    it('T-0010-S01: 素材インスタンス生成（通常品質）', () => {
      // 【テスト目的】: createInstance()で素材インスタンスが正しく生成されること
      // 【テスト内容】: materialIdとqualityを指定してインスタンスを生成
      // 【期待される動作】: MaterialInstanceが正しく生成される
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const materialId = toMaterialId('herb');
      const quality = Quality.B;

      // Act
      const instance = materialService.createInstance(materialId, quality);

      // Assert
      expect(instance.instanceId).toMatch(/^material_\d+_\d+$/);
      expect(instance.materialId).toBe(materialId);
      expect(instance.quality).toBe(quality);
      expect(instance.name).toBe('薬草');
    });

    it('T-0010-S02: 最小品質（D）で生成', () => {
      // 【テスト目的】: 品質Dでインスタンスが生成できること
      // 【テスト内容】: 最小値Dで素材を生成
      // 【期待される動作】: qualityがDのインスタンスが生成される
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const materialId = toMaterialId('herb');
      const quality = Quality.D;

      // Act
      const instance = materialService.createInstance(materialId, quality);

      // Assert
      expect(instance.quality).toBe(Quality.D);
      expect(instance.materialId).toBe(materialId);
    });

    it('T-0010-S03: 最大品質（S）で生成', () => {
      // 【テスト目的】: 品質Sでインスタンスが生成できること
      // 【テスト内容】: 最大値Sで素材を生成
      // 【期待される動作】: qualityがSのインスタンスが生成される
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const materialId = toMaterialId('ore');
      const quality = Quality.S;

      // Act
      const instance = materialService.createInstance(materialId, quality);

      // Assert
      expect(instance.quality).toBe(Quality.S);
      expect(instance.materialId).toBe(materialId);
    });

    it('T-0010-S04: 存在しないmaterialIdでエラー', () => {
      // 【テスト目的】: 存在しない素材IDでエラーがスローされること
      // 【テスト内容】: 存在しないmaterialIdでcreateInstance()を呼び出す
      // 【期待される動作】: ApplicationErrorがスローされる
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const invalidMaterialId = toMaterialId('invalid_material');
      const quality = Quality.B;

      // Act & Assert
      expect(() => {
        materialService.createInstance(invalidMaterialId, quality);
      }).toThrow(/Material not found/);
    });
  });

  // =============================================================================
  // T-0010-S06〜S10: generateRandomQuality のテスト
  // =============================================================================

  describe('generateRandomQuality', () => {
    it('T-0010-S06: ランダム品質生成（基準B → A, B, Cのいずれか）', () => {
      // 【テスト目的】: 基準品質Bから±1段階の品質が生成されること
      // 【テスト内容】: 100回実行して、全てA, B, Cのいずれかであること
      // 【期待される動作】: A, B, Cのみが生成される
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const baseQuality = Quality.B;
      const validQualities = [Quality.A, Quality.B, Quality.C];

      // Act & Assert
      for (let i = 0; i < 100; i++) {
        const generated = materialService.generateRandomQuality(baseQuality);
        expect(validQualities).toContain(generated);
      }
    });

    it('T-0010-S07: 最小品質（D）からの生成 → D or Cのみ', () => {
      // 【テスト目的】: 品質Dから生成すると、D または C のみが生成されること
      // 【テスト内容】: 100回実行して、全てD, Cのいずれかであること
      // 【期待される動作】: D, Cのみが生成される（クランプ処理）
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const baseQuality = Quality.D;
      const validQualities = [Quality.D, Quality.C];

      // Act & Assert
      for (let i = 0; i < 100; i++) {
        const generated = materialService.generateRandomQuality(baseQuality);
        expect(validQualities).toContain(generated);
      }
    });

    it('T-0010-S08: 最大品質（S）からの生成 → S or Aのみ', () => {
      // 【テスト目的】: 品質Sから生成すると、A または S のみが生成されること
      // 【テスト内容】: 100回実行して、全てA, Sのいずれかであること
      // 【期待される動作】: A, Sのみが生成される（クランプ処理）
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const baseQuality = Quality.S;
      const validQualities = [Quality.A, Quality.S];

      // Act & Assert
      for (let i = 0; i < 100; i++) {
        const generated = materialService.generateRandomQuality(baseQuality);
        expect(validQualities).toContain(generated);
      }
    });

    it('T-0010-S09: 品質C → D, C, Bのいずれか', () => {
      // 【テスト目的】: 品質Cから生成すると、D, C, B のいずれかが生成されること
      // 【テスト内容】: 100回実行して、全てD, C, Bのいずれかであること
      // 【期待される動作】: D, C, Bのみが生成される
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const baseQuality = Quality.C;
      const validQualities = [Quality.D, Quality.C, Quality.B];

      // Act & Assert
      for (let i = 0; i < 100; i++) {
        const generated = materialService.generateRandomQuality(baseQuality);
        expect(validQualities).toContain(generated);
      }
    });

    it('T-0010-S10: 品質A → B, A, Sのいずれか', () => {
      // 【テスト目的】: 品質Aから生成すると、B, A, S のいずれかが生成されること
      // 【テスト内容】: 100回実行して、全てB, A, Sのいずれかであること
      // 【期待される動作】: B, A, Sのみが生成される
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const baseQuality = Quality.A;
      const validQualities = [Quality.B, Quality.A, Quality.S];

      // Act & Assert
      for (let i = 0; i < 100; i++) {
        const generated = materialService.generateRandomQuality(baseQuality);
        expect(validQualities).toContain(generated);
      }
    });
  });

  // =============================================================================
  // T-0010-S12〜S24: calculateAverageQuality のテスト
  // =============================================================================

  describe('calculateAverageQuality', () => {
    it('T-0010-S12: 平均品質計算（同一品質 B, B, B → B）', () => {
      // 【テスト目的】: 同じ品質の素材の平均が元の品質と同じになること
      // 【テスト内容】: B, B, Bの平均を計算
      // 【期待される動作】: Bが返される
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const materials = [
        materialService.createInstance(toMaterialId('herb'), Quality.B),
        materialService.createInstance(toMaterialId('herb'), Quality.B),
        materialService.createInstance(toMaterialId('herb'), Quality.B),
      ];

      // Act
      const average = materialService.calculateAverageQuality(materials);

      // Assert
      expect(average).toBe(Quality.B);
    });

    it('T-0010-S13: 平均品質計算（混合品質 A, C, B → B）', () => {
      // 【テスト目的】: 異なる品質の素材の平均が正しく計算されること
      // 【テスト内容】: A(4), C(2), B(3)の平均を計算 → 平均3.0
      // 【期待される動作】: Bが返される（四捨五入で3 → B）
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const materials = [
        materialService.createInstance(toMaterialId('ore'), Quality.A),
        materialService.createInstance(toMaterialId('water'), Quality.C),
        materialService.createInstance(toMaterialId('herb'), Quality.B),
      ];

      // Act
      const average = materialService.calculateAverageQuality(materials);

      // Assert
      expect(average).toBe(Quality.B);
    });

    it('T-0010-S14: 平均品質計算（四捨五入 A, A, C → B）', () => {
      // 【テスト目的】: 平均が小数の場合、四捨五入で正しく計算されること
      // 【テスト内容】: A(4), A(4), C(2)の平均を計算 → 平均3.33
      // 【期待される動作】: Bが返される（Math.round(3.33) = 3 → B）
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const materials = [
        materialService.createInstance(toMaterialId('ore'), Quality.A),
        materialService.createInstance(toMaterialId('ore'), Quality.A),
        materialService.createInstance(toMaterialId('water'), Quality.C),
      ];

      // Act
      const average = materialService.calculateAverageQuality(materials);

      // Assert
      expect(average).toBe(Quality.B);
    });

    it('T-0010-S15: 平均品質計算（切り上げ C, C, B → C）', () => {
      // 【テスト目的】: 平均2.33が四捨五入で2になること
      // 【テスト内容】: C(2), C(2), B(3)の平均を計算 → 平均2.33
      // 【期待される動作】: Cが返される（Math.round(2.33) = 2 → C）
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const materials = [
        materialService.createInstance(toMaterialId('water'), Quality.C),
        materialService.createInstance(toMaterialId('water'), Quality.C),
        materialService.createInstance(toMaterialId('herb'), Quality.B),
      ];

      // Act
      const average = materialService.calculateAverageQuality(materials);

      // Assert
      expect(average).toBe(Quality.C);
    });

    it('T-0010-S16: 平均品質計算（切り上げ B, B, A → B）', () => {
      // 【テスト目的】: 平均3.33が四捨五入で3になること
      // 【テスト内容】: B(3), B(3), A(4)の平均を計算 → 平均3.33
      // 【期待される動作】: Bが返される（Math.round(3.33) = 3 → B）
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const materials = [
        materialService.createInstance(toMaterialId('herb'), Quality.B),
        materialService.createInstance(toMaterialId('herb'), Quality.B),
        materialService.createInstance(toMaterialId('ore'), Quality.A),
      ];

      // Act
      const average = materialService.calculateAverageQuality(materials);

      // Assert
      expect(average).toBe(Quality.B);
    });

    it('T-0010-S17: 平均品質計算（切り下げ B, B, C → B）', () => {
      // 【テスト目的】: 平均2.67が四捨五入で3になること
      // 【テスト内容】: B(3), B(3), C(2)の平均を計算 → 平均2.67
      // 【期待される動作】: Bが返される（Math.round(2.67) = 3 → B）
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const materials = [
        materialService.createInstance(toMaterialId('herb'), Quality.B),
        materialService.createInstance(toMaterialId('herb'), Quality.B),
        materialService.createInstance(toMaterialId('water'), Quality.C),
      ];

      // Act
      const average = materialService.calculateAverageQuality(materials);

      // Assert
      expect(average).toBe(Quality.B);
    });

    it('T-0010-S18: 空配列 → エラー', () => {
      // 【テスト目的】: 空配列の場合、エラーがスローされること
      // 【テスト内容】: 空配列で平均を計算
      // 【期待される動作】: ApplicationErrorがスローされる
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const materials: ReturnType<typeof materialService.createInstance>[] = [];

      // Act & Assert
      expect(() => {
        materialService.calculateAverageQuality(materials);
      }).toThrow(/Cannot calculate average quality of empty array/);
    });

    it('T-0010-S19: 1つの素材 → その品質', () => {
      // 【テスト目的】: 1つの素材の平均がその品質と同じになること
      // 【テスト内容】: Aの素材1つで平均を計算
      // 【期待される動作】: Aが返される
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const materials = [materialService.createInstance(toMaterialId('ore'), Quality.A)];

      // Act
      const average = materialService.calculateAverageQuality(materials);

      // Assert
      expect(average).toBe(Quality.A);
    });

    it('T-0010-S20: 最小品質のみ [D, D, D] → D', () => {
      // 【テスト目的】: 最小品質Dのみの平均がDになること
      // 【テスト内容】: D(1), D(1), D(1)の平均を計算 → 平均1.0
      // 【期待される動作】: Dが返される
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const materials = [
        materialService.createInstance(toMaterialId('herb'), Quality.D),
        materialService.createInstance(toMaterialId('herb'), Quality.D),
        materialService.createInstance(toMaterialId('herb'), Quality.D),
      ];

      // Act
      const average = materialService.calculateAverageQuality(materials);

      // Assert
      expect(average).toBe(Quality.D);
    });

    it('T-0010-S21: 最大品質のみ [S, S, S] → S', () => {
      // 【テスト目的】: 最大品質Sのみの平均がSになること
      // 【テスト内容】: S(5), S(5), S(5)の平均を計算 → 平均5.0
      // 【期待される動作】: Sが返される
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const materials = [
        materialService.createInstance(toMaterialId('ore'), Quality.S),
        materialService.createInstance(toMaterialId('ore'), Quality.S),
        materialService.createInstance(toMaterialId('ore'), Quality.S),
      ];

      // Act
      const average = materialService.calculateAverageQuality(materials);

      // Assert
      expect(average).toBe(Quality.S);
    });

    it('T-0010-S22: 最小と最大の混合 [D, S] → B', () => {
      // 【テスト目的】: 最小Dと最大Sの平均が正しく計算されること
      // 【テスト内容】: D(1), S(5)の平均を計算 → 平均3.0
      // 【期待される動作】: Bが返される（Math.round(3.0) = 3 → B）
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const materials = [
        materialService.createInstance(toMaterialId('herb'), Quality.D),
        materialService.createInstance(toMaterialId('ore'), Quality.S),
      ];

      // Act
      const average = materialService.calculateAverageQuality(materials);

      // Assert
      expect(average).toBe(Quality.B);
    });

    it('T-0010-S23: 四捨五入境界値 [B, C] → B', () => {
      // 【テスト目的】: 平均2.5が四捨五入で3になること（Math.round()の動作）
      // 【テスト内容】: B(3), C(2)の平均を計算 → 平均2.5
      // 【期待される動作】: Bが返される（Math.round(2.5) = 3 → B）
      // 【注記】: JavaScriptのMath.round()は正の数で0.5の場合、切り上げる
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const materials = [
        materialService.createInstance(toMaterialId('herb'), Quality.B),
        materialService.createInstance(toMaterialId('water'), Quality.C),
      ];

      // Act
      const average = materialService.calculateAverageQuality(materials);

      // Assert
      expect(average).toBe(Quality.B);
    });

    it('T-0010-S24: 四捨五入境界値 [A, B] → A', () => {
      // 【テスト目的】: 平均3.5が四捨五入で4になること
      // 【テスト内容】: A(4), B(3)の平均を計算 → 平均3.5
      // 【期待される動作】: Aが返される（Math.round(3.5) = 4 → A）
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      // Arrange
      const materials = [
        materialService.createInstance(toMaterialId('ore'), Quality.A),
        materialService.createInstance(toMaterialId('herb'), Quality.B),
      ];

      // Act
      const average = materialService.calculateAverageQuality(materials);

      // Assert
      expect(average).toBe(Quality.A);
    });
  });
});
