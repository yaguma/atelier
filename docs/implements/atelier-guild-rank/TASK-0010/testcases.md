# TASK-0010: 素材エンティティ・MaterialService実装 - テストケース定義書

**作成日**: 2026-01-16
**タスクID**: TASK-0010
**要件名**: atelier-guild-rank

---

## 1. テスト概要

### 1.1 目的
TASK-0010「素材エンティティ・MaterialService実装」の機能が要件定義書に従って正しく動作することを検証する。

### 1.2 テスト対象
- MaterialInstanceエンティティ
- Quality値オブジェクト（ユーティリティ関数）
- MaterialService（素材生成・品質計算）

### 1.3 テスト環境
- **テストフレームワーク**: Vitest 4.x
- **モック**: vi.fn()を使用
- **カバレッジ目標**: 80%以上（ライン、ブランチ、関数）

### 1.4 テストファイル構成
- `tests/unit/domain/entities/MaterialInstance.test.ts`
- `tests/unit/domain/value-objects/Quality.test.ts`
- `tests/unit/application/services/material-service.test.ts`

---

## 2. テストケース一覧

### 2.1 MaterialInstanceエンティティのテスト

#### 正常系

**T-0010-E01: 素材インスタンス生成（正常）**
- **カテゴリ**: 正常系
- **テスト内容**: 素材インスタンスが正しいプロパティで生成されること
- **入力**:
  - instanceId: "material_1234567890_1234"
  - master: { id: "herb", name: "薬草", baseQuality: "B", attributes: ["GRASS"], category: "PLANT", unlockRank: "F" }
  - quality: "B"
- **期待結果**:
  - instanceIdが設定されていること
  - masterが参照されていること
  - qualityが"B"であること
  - materialIdが"herb"であること
  - nameが"薬草"であること
  - baseQualityが"B"であること
  - attributesが["GRASS"]であること
- **関連要件**: FR-0010-E01, FR-0010-E02, FR-0010-E03, FR-0010-E05

**T-0010-E02: 素材インスタンスの不変性**
- **カテゴリ**: 正常系
- **テスト内容**: 素材インスタンスのプロパティが変更不可能であること
- **入力**: 生成された素材インスタンス
- **期待結果**:
  - instanceIdがreadonly属性であること
  - masterがreadonly属性であること
  - qualityがreadonly属性であること
- **関連要件**: FR-0010-E04, NFR-0010-I01

#### 境界値

**T-0010-E03: 品質が最小値（D）で生成**
- **カテゴリ**: 境界値
- **テスト内容**: 品質Dの素材インスタンスが正しく生成されること
- **入力**: quality="D"
- **期待結果**: qualityが"D"であること
- **関連要件**: FR-0010-E03, NFR-0010-B01

**T-0010-E04: 品質が最大値（S）で生成**
- **カテゴリ**: 境界値
- **テスト内容**: 品質Sの素材インスタンスが正しく生成されること
- **入力**: quality="S"
- **期待結果**: qualityが"S"であること
- **関連要件**: FR-0010-E03, NFR-0010-B01

#### 異常系

**T-0010-E05: 存在しないmaterialIdでエラー**
- **カテゴリ**: 異常系
- **テスト内容**: 存在しない素材IDで生成しようとするとエラーがスローされること
- **入力**: materialId="invalid_material"
- **期待結果**:
  - ApplicationErrorがスローされること
  - ErrorCodes.INVALID_MATERIAL_IDが設定されていること
- **関連要件**: FR-0010-S02, NFR-0010-B02

---

### 2.2 Quality値オブジェクトのテスト

#### 正常系

**T-0010-Q01: QUALITY_ORDER定数の定義**
- **カテゴリ**: 正常系
- **テスト内容**: QUALITY_ORDER定数が正しく定義されていること
- **期待結果**:
  - QUALITY_ORDER['D'] === 1
  - QUALITY_ORDER['C'] === 2
  - QUALITY_ORDER['B'] === 3
  - QUALITY_ORDER['A'] === 4
  - QUALITY_ORDER['S'] === 5
- **関連要件**: FR-0010-Q01

**T-0010-Q02: 品質比較（S > A）**
- **カテゴリ**: 正常系
- **テスト内容**: compareQuality()でS > Aが正しく比較されること
- **入力**: compareQuality("S", "A")
- **期待結果**: 正の数（1）が返されること
- **関連要件**: FR-0010-Q02

**T-0010-Q03: 品質比較（同値 B == B）**
- **カテゴリ**: 正常系
- **テスト内容**: compareQuality()でB == Bが正しく比較されること
- **入力**: compareQuality("B", "B")
- **期待結果**: 0が返されること
- **関連要件**: FR-0010-Q02

**T-0010-Q04: 品質比較（C < B）**
- **カテゴリ**: 正常系
- **テスト内容**: compareQuality()でC < Bが正しく比較されること
- **入力**: compareQuality("C", "B")
- **期待結果**: 負の数（-1）が返されること
- **関連要件**: FR-0010-Q02

**T-0010-Q05: より高い品質を取得（A vs C → A）**
- **カテゴリ**: 正常系
- **テスト内容**: getHigherQuality()で高い方の品質が返されること
- **入力**: getHigherQuality("A", "C")
- **期待結果**: "A"が返されること
- **関連要件**: FR-0010-Q03

**T-0010-Q06: より高い品質を取得（同値 B vs B → B）**
- **カテゴリ**: 正常系
- **テスト内容**: getHigherQuality()で同じ品質の場合、最初の引数が返されること
- **入力**: getHigherQuality("B", "B")
- **期待結果**: "B"が返されること
- **関連要件**: FR-0010-Q03

**T-0010-Q07: より低い品質を取得（A vs C → C）**
- **カテゴリ**: 正常系
- **テスト内容**: getLowerQuality()で低い方の品質が返されること
- **入力**: getLowerQuality("A", "C")
- **期待結果**: "C"が返されること
- **関連要件**: FR-0010-Q04

#### 境界値

**T-0010-Q08: 最小値と最大値の比較（D < S）**
- **カテゴリ**: 境界値
- **テスト内容**: 最小値Dと最大値Sが正しく比較されること
- **入力**: compareQuality("D", "S")
- **期待結果**: 負の数（-4）が返されること
- **関連要件**: FR-0010-Q02, NFR-0010-B01

**T-0010-Q09: より高い品質を取得（D vs S → S）**
- **カテゴリ**: 境界値
- **テスト内容**: 最小値と最大値でgetHigherQuality()が正しく動作すること
- **入力**: getHigherQuality("D", "S")
- **期待結果**: "S"が返されること
- **関連要件**: FR-0010-Q03, NFR-0010-B01

---

### 2.3 MaterialService createInstanceのテスト

#### 正常系

**T-0010-S01: 素材インスタンス生成（通常品質）**
- **カテゴリ**: 正常系
- **テスト内容**: createInstance()で素材インスタンスが正しく生成されること
- **入力**:
  - materialId: "herb"
  - quality: "B"
- **期待結果**:
  - instanceIdが生成されていること（material_で始まる）
  - master.idが"herb"であること
  - qualityが"B"であること
  - nameが"薬草"であること
- **関連要件**: FR-0010-S01, AC-0010-01

#### 境界値

**T-0010-S02: 最小品質（D）で生成**
- **カテゴリ**: 境界値
- **テスト内容**: 品質Dでインスタンスが生成できること
- **入力**:
  - materialId: "herb"
  - quality: "D"
- **期待結果**: qualityが"D"であること
- **関連要件**: FR-0010-S01, NFR-0010-B01

**T-0010-S03: 最大品質（S）で生成**
- **カテゴリ**: 境界値
- **テスト内容**: 品質Sでインスタンスが生成できること
- **入力**:
  - materialId: "herb"
  - quality: "S"
- **期待結果**: qualityが"S"であること
- **関連要件**: FR-0010-S01, NFR-0010-B01

#### 異常系

**T-0010-S04: 存在しないmaterialIdでエラー**
- **カテゴリ**: 異常系
- **テスト内容**: 存在しない素材IDでエラーがスローされること
- **入力**:
  - materialId: "invalid_material"
  - quality: "B"
- **期待結果**:
  - ApplicationErrorがスローされること
  - ErrorCodes.INVALID_MATERIAL_IDが設定されていること
  - エラーメッセージに"Material not found"が含まれること
- **関連要件**: FR-0010-S02, AC-0010-01, NFR-0010-B02

**T-0010-S05: 無効な品質でエラー**
- **カテゴリ**: 異常系
- **テスト内容**: 無効な品質値でエラーがスローされること
- **入力**:
  - materialId: "herb"
  - quality: "Z" (無効な品質)
- **期待結果**:
  - TypeScriptの型チェックでコンパイルエラーが発生すること
  - または実行時にApplicationErrorがスローされること
- **関連要件**: NFR-0010-T01, NFR-0010-B02

---

### 2.4 MaterialService generateRandomQualityのテスト

#### 正常系

**T-0010-S06: ランダム品質生成（基準B → A, B, Cのいずれか）**
- **カテゴリ**: 正常系
- **テスト内容**: 基準品質Bから±1段階の品質が生成されること
- **入力**: baseQuality="B"
- **期待結果**:
  - 100回実行して、全て A, B, C のいずれかであること
  - D や S は生成されないこと
- **関連要件**: FR-0010-S03, AC-0010-04

#### 境界値

**T-0010-S07: 最小品質（D）からの生成 → D or Cのみ**
- **カテゴリ**: 境界値
- **テスト内容**: 品質Dから生成すると、D または C のみが生成されること
- **入力**: baseQuality="D"
- **期待結果**:
  - 100回実行して、全て D または C のいずれかであること
  - B, A, S は生成されないこと
  - クランプ処理により範囲を超えないこと
- **関連要件**: FR-0010-S04, AC-0010-04, NFR-0010-B01

**T-0010-S08: 最大品質（S）からの生成 → S or Aのみ**
- **カテゴリ**: 境界値
- **テスト内容**: 品質Sから生成すると、A または S のみが生成されること
- **入力**: baseQuality="S"
- **期待結果**:
  - 100回実行して、全て A または S のいずれかであること
  - D, C, B は生成されないこと
  - クランプ処理により範囲を超えないこと
- **関連要件**: FR-0010-S04, AC-0010-04, NFR-0010-B01

**T-0010-S09: 品質C → D, C, Bのいずれか**
- **カテゴリ**: 境界値
- **テスト内容**: 品質Cから生成すると、D, C, B のいずれかが生成されること
- **入力**: baseQuality="C"
- **期待結果**:
  - 100回実行して、全て D, C, B のいずれかであること
  - A, S は生成されないこと
- **関連要件**: FR-0010-S03, FR-0010-S04

**T-0010-S10: 品質A → B, A, Sのいずれか**
- **カテゴリ**: 境界値
- **テスト内容**: 品質Aから生成すると、B, A, S のいずれかが生成されること
- **入力**: baseQuality="A"
- **期待結果**:
  - 100回実行して、全て B, A, S のいずれかであること
  - D, C は生成されないこと
- **関連要件**: FR-0010-S03, FR-0010-S04

#### 統計検証

**T-0010-S11: 確率分布の検証（1000回実行）**
- **カテゴリ**: 統計検証
- **テスト内容**: 1000回実行して、±1段階の範囲内が90%以上であること
- **入力**: baseQuality="B"
- **期待結果**:
  - 1000回実行して、A, B, C の割合がそれぞれ20%～45%程度であること（理論値33.3%±許容誤差）
  - 統計的に均等な確率分布であること
- **関連要件**: FR-0010-S03

---

### 2.5 MaterialService calculateAverageQualityのテスト

#### 正常系

**T-0010-S12: 平均品質計算（同一品質 B, B, B → B）**
- **カテゴリ**: 正常系
- **テスト内容**: 同じ品質の素材の平均が元の品質と同じになること
- **入力**: [B, B, B]
- **期待結果**: "B"が返されること
- **関連要件**: FR-0010-S05, AC-0010-03

**T-0010-S13: 平均品質計算（混合品質 A, C, B → B）**
- **カテゴリ**: 正常系
- **テスト内容**: 異なる品質の素材の平均が正しく計算されること
- **入力**: [A(4), C(2), B(3)] → 平均3.0
- **期待結果**: "B"が返されること（四捨五入で3 → B）
- **関連要件**: FR-0010-S05, AC-0010-03

**T-0010-S14: 平均品質計算（四捨五入 A, A, C → B）**
- **カテゴリ**: 正常系
- **テスト内容**: 平均が小数の場合、四捨五入で正しく計算されること
- **入力**: [A(4), A(4), C(2)] → 平均3.33
- **期待結果**: "B"が返されること（Math.round(3.33) = 3 → B）
- **関連要件**: FR-0010-S05, AC-0010-03

**T-0010-S15: 平均品質計算（切り上げ C, C, B → C）**
- **カテゴリ**: 正常系
- **テスト内容**: 平均2.33が四捨五入で2になること
- **入力**: [C(2), C(2), B(3)] → 平均2.33
- **期待結果**: "C"が返されること（Math.round(2.33) = 2 → C）
- **関連要件**: FR-0010-S05

**T-0010-S16: 平均品質計算（切り上げ B, B, A → B）**
- **カテゴリ**: 正常系
- **テスト内容**: 平均3.33が四捨五入で3になること
- **入力**: [B(3), B(3), A(4)] → 平均3.33
- **期待結果**: "B"が返されること（Math.round(3.33) = 3 → B）
- **関連要件**: FR-0010-S05

**T-0010-S17: 平均品質計算（切り下げ B, B, C → B）**
- **カテゴリ**: 正常系
- **テスト内容**: 平均2.67が四捨五入で3になること
- **入力**: [B(3), B(3), C(2)] → 平均2.67
- **期待結果**: "B"が返されること（Math.round(2.67) = 3 → B）
- **関連要件**: FR-0010-S05

#### 境界値

**T-0010-S18: 空配列 → エラー**
- **カテゴリ**: 境界値
- **テスト内容**: 空配列の場合、エラーがスローされること
- **入力**: []
- **期待結果**:
  - ApplicationErrorがスローされること
  - ErrorCodes.INVALID_MATERIALSが設定されていること
  - エラーメッセージに"Cannot calculate average quality of empty array"が含まれること
- **関連要件**: FR-0010-S06, AC-0010-03, NFR-0010-B02

**T-0010-S19: 1つの素材 → その品質**
- **カテゴリ**: 境界値
- **テスト内容**: 1つの素材の平均がその品質と同じになること
- **入力**: [A]
- **期待結果**: "A"が返されること
- **関連要件**: FR-0010-S05

**T-0010-S20: 最小品質のみ [D, D, D] → D**
- **カテゴリ**: 境界値
- **テスト内容**: 最小品質Dのみの平均がDになること
- **入力**: [D(1), D(1), D(1)] → 平均1.0
- **期待結果**: "D"が返されること
- **関連要件**: FR-0010-S05, NFR-0010-B01

**T-0010-S21: 最大品質のみ [S, S, S] → S**
- **カテゴリ**: 境界値
- **テスト内容**: 最大品質Sのみの平均がSになること
- **入力**: [S(5), S(5), S(5)] → 平均5.0
- **期待結果**: "S"が返されること
- **関連要件**: FR-0010-S05, NFR-0010-B01

**T-0010-S22: 最小と最大の混合 [D, S] → B**
- **カテゴリ**: 境界値
- **テスト内容**: 最小Dと最大Sの平均が正しく計算されること
- **入力**: [D(1), S(5)] → 平均3.0
- **期待結果**: "B"が返されること（Math.round(3.0) = 3 → B）
- **関連要件**: FR-0010-S05, NFR-0010-B01

**T-0010-S23: 四捨五入境界値 [B, C] → C**
- **カテゴリ**: 境界値
- **テスト内容**: 平均2.5が四捨五入で3になること（Math.round()の動作）
- **入力**: [B(3), C(2)] → 平均2.5
- **期待結果**: "B"が返されること（Math.round(2.5) = 3 → B）
- **注記**: JavaScriptのMath.round()は正の数で0.5の場合、切り上げる
- **関連要件**: FR-0010-S05

**T-0010-S24: 四捨五入境界値 [A, B] → B**
- **カテゴリ**: 境界値
- **テスト内容**: 平均3.5が四捨五入で4になること
- **入力**: [A(4), B(3)] → 平均3.5
- **期待結果**: "A"が返されること（Math.round(3.5) = 4 → A）
- **関連要件**: FR-0010-S05

#### 異常系

**T-0010-S25: nullや undefined の配列でエラー**
- **カテゴリ**: 異常系
- **テスト内容**: null や undefined の配列でエラーがスローされること
- **入力**: null または undefined
- **期待結果**:
  - ApplicationErrorがスローされること
  - または TypeScript の型チェックでコンパイルエラーが発生すること
- **関連要件**: NFR-0010-T01, NFR-0010-B02

---

### 2.6 統合テスト

#### 統合シナリオ

**T-0010-I01: 素材生成→品質比較→平均品質計算の一連の流れ**
- **カテゴリ**: 統合テスト
- **テスト内容**: 素材生成から平均計算までの一連の操作が正しく動作すること
- **入力**:
  1. 3つの素材インスタンス生成（herb:B, ore:A, liquid:C）
  2. 品質比較（A > B > C）
  3. 平均品質計算
- **期待結果**:
  - 3つの素材が正しく生成されること
  - 品質比較が正しく動作すること（A > B, B > C）
  - 平均品質が"B"になること（(4+3+2)/3 = 3.0 → B）
- **関連要件**: AC-0010-01, AC-0010-02, AC-0010-03

**T-0010-I02: ランダム品質生成→素材生成→平均計算**
- **カテゴリ**: 統合テスト
- **テスト内容**: ランダム品質生成を使って複数の素材を生成し、平均を計算する
- **入力**:
  1. baseQuality="B"でランダム品質生成×3回
  2. 生成された品質で素材インスタンス作成×3個
  3. 平均品質計算
- **期待結果**:
  - ランダム品質が全て A, B, C の範囲内であること
  - 素材インスタンスが正しく生成されること
  - 平均品質が A, B, C, または B（構成により）になること
- **関連要件**: AC-0010-04, AC-0010-01, AC-0010-03

**T-0010-I03: 大量素材の平均品質計算（10個）**
- **カテゴリ**: 統合テスト
- **テスト内容**: 多数の素材の平均品質が正しく計算されること
- **入力**: [B, B, B, C, C, A, A, D, S, B] → 平均3.0
- **期待結果**: "B"が返されること
- **関連要件**: FR-0010-S05

#### パフォーマンステスト

**T-0010-P01: 1000個の素材生成が1秒以内に完了**
- **カテゴリ**: パフォーマンステスト
- **テスト内容**: 大量の素材インスタンス生成が高速に実行されること
- **入力**: createInstance() × 1000回実行
- **期待結果**:
  - 1000個の素材が1秒以内に生成されること
  - メモリリークが発生しないこと
- **関連要件**: CON-0010-07

**T-0010-P02: 1000個の素材の平均品質計算が100ms以内**
- **カテゴリ**: パフォーマンステスト
- **テスト内容**: 大量の素材の平均計算が高速に実行されること
- **入力**: calculateAverageQuality(materials × 1000)
- **期待結果**: 100ms以内に計算が完了すること
- **関連要件**: CON-0010-07

---

## 3. テストカバレッジ目標

### 3.1 カバレッジ目標値
- **ライン**: 80%以上
- **ブランチ**: 80%以上
- **関数**: 80%以上
- **ステートメント**: 80%以上

### 3.2 カバレッジ対象
- MaterialInstanceエンティティ
  - コンストラクタ
  - getterメソッド（materialId, name, baseQuality, attributes）
- Quality値オブジェクト
  - QUALITY_ORDER定数
  - compareQuality()関数
  - getHigherQuality()関数
  - getLowerQuality()関数
- MaterialService
  - createInstance()メソッド
  - generateRandomQuality()メソッド
  - calculateAverageQuality()メソッド

### 3.3 除外対象
- コンストラクタの依存注入部分（モックでカバー）
- イベント発行部分（将来実装のため現時点では省略可）

---

## 4. テストデータ

### 4.1 モックデータ

#### 素材マスターデータ
```typescript
const mockMaterialMaster: IMaterial = {
  id: "herb" as MaterialId,
  name: "薬草",
  baseQuality: Quality.B,
  attributes: [Attribute.GRASS],
  category: "PLANT",
  unlockRank: "F",
};
```

#### 複数の素材マスター
```typescript
const mockMaterials: IMaterial[] = [
  { id: "herb", name: "薬草", baseQuality: "B", attributes: ["GRASS"], category: "PLANT", unlockRank: "F" },
  { id: "ore", name: "鉱石", baseQuality: "A", attributes: ["EARTH"], category: "MINERAL", unlockRank: "E" },
  { id: "liquid", name: "清水", baseQuality: "C", attributes: ["WATER"], category: "LIQUID", unlockRank: "F" },
];
```

### 4.2 モック作成ヘルパー

#### MasterDataRepositoryのモック
```typescript
function createMockMasterDataRepository(materials: IMaterial[]): IMasterDataRepository {
  const materialMap = new Map(materials.map(m => [m.id, m]));

  return {
    getMaterialById: vi.fn((id: MaterialId) => materialMap.get(id) || null),
    // 他のメソッド...
  };
}
```

#### EventBusのモック
```typescript
function createMockEventBus(): IEventBus {
  return {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  };
}
```

---

## 5. テスト実装ガイドライン

### 5.1 テスト構造
```typescript
describe('MaterialService', () => {
  let materialService: IMaterialService;
  let mockMasterDataRepo: IMasterDataRepository;
  let mockEventBus: IEventBus;

  beforeEach(() => {
    mockMasterDataRepo = createMockMasterDataRepository([mockMaterialMaster]);
    mockEventBus = createMockEventBus();
    materialService = new MaterialService(mockMasterDataRepo, mockEventBus);
  });

  describe('createInstance', () => {
    it('T-0010-S01: 素材インスタンス生成（通常品質）', () => {
      // Arrange
      const materialId = toMaterialId("herb");
      const quality = Quality.B;

      // Act
      const instance = materialService.createInstance(materialId, quality);

      // Assert
      expect(instance.instanceId).toMatch(/^material_\d+_\d+$/);
      expect(instance.materialId).toBe(materialId);
      expect(instance.quality).toBe(quality);
      expect(instance.name).toBe("薬草");
    });
  });
});
```

### 5.2 Arrange-Act-Assert パターン
- **Arrange**: テストデータとモックを準備
- **Act**: テスト対象のメソッドを実行
- **Assert**: 期待結果を検証

### 5.3 テスト名規則
- テストIDを含める（例: T-0010-S01）
- 日本語でテスト内容を記述
- 簡潔で分かりやすい説明

### 5.4 エラーテスト
```typescript
it('T-0010-S04: 存在しないmaterialIdでエラー', () => {
  const invalidId = toMaterialId("invalid_material");
  const quality = Quality.B;

  expect(() => {
    materialService.createInstance(invalidId, quality);
  }).toThrow(ApplicationError);

  expect(() => {
    materialService.createInstance(invalidId, quality);
  }).toThrow(/Material not found/);
});
```

### 5.5 統計テスト
```typescript
it('T-0010-S11: 確率分布の検証（1000回実行）', () => {
  const counts = { A: 0, B: 0, C: 0 };
  const iterations = 1000;

  for (let i = 0; i < iterations; i++) {
    const quality = materialService.generateRandomQuality(Quality.B);
    counts[quality]++;
  }

  // 各品質が20%～45%の範囲内であることを確認（理論値33.3%）
  expect(counts.A).toBeGreaterThan(200);
  expect(counts.A).toBeLessThan(450);
  expect(counts.B).toBeGreaterThan(200);
  expect(counts.B).toBeLessThan(450);
  expect(counts.C).toBeGreaterThan(200);
  expect(counts.C).toBeLessThan(450);

  // 合計が1000であること
  expect(counts.A + counts.B + counts.C).toBe(1000);
});
```

---

## 6. テストケースサマリー

### 6.1 カテゴリ別テストケース数

| カテゴリ | 件数 |
|---------|------|
| MaterialInstanceエンティティ | 5件 |
| Quality値オブジェクト | 9件 |
| MaterialService createInstance | 5件 |
| MaterialService generateRandomQuality | 6件 |
| MaterialService calculateAverageQuality | 14件 |
| 統合テスト | 3件 |
| パフォーマンステスト | 2件 |
| **合計** | **44件** |

### 6.2 テスト種別

| 種別 | 件数 |
|-----|------|
| 正常系 | 17件 |
| 境界値 | 19件 |
| 異常系 | 3件 |
| 統合テスト | 3件 |
| パフォーマンステスト | 2件 |
| **合計** | **44件** |

---

## 7. 受け入れ基準マッピング

| 受け入れ基準 | 対応テストケース |
|------------|----------------|
| AC-0010-01: 素材インスタンスが生成できる | T-0010-E01, T-0010-S01, T-0010-S02, T-0010-S03, T-0010-S04 |
| AC-0010-02: 品質比較が正しく動作する | T-0010-Q01～Q09 |
| AC-0010-03: 平均品質計算が正しい | T-0010-S12～S24 |
| AC-0010-04: ランダム品質生成が基準±1以内 | T-0010-S06～S11 |
| AC-0010-05: 品質変動ロジックのカスタマイズが可能 | （将来実装） |
| AC-0010-06: 単体テストカバレッジ80%以上 | 全テストケース |
| AC-0010-07: エラーハンドリングが適切 | T-0010-E05, T-0010-S04, T-0010-S05, T-0010-S18, T-0010-S25 |

---

## 8. 実装優先順位

### Phase 1: 必須テスト（信頼性レベル: 🔵）
1. **Quality値オブジェクトのテスト**（T-0010-Q01～Q09）
2. **MaterialInstanceエンティティのテスト**（T-0010-E01～E04）
3. **MaterialService createInstance**（T-0010-S01～S03）
4. **MaterialService calculateAverageQuality**（T-0010-S12～S17）
5. **MaterialService generateRandomQuality**（T-0010-S06～S08）

### Phase 2: 推奨テスト（信頼性レベル: 🟡）
1. **境界値テスト**（T-0010-S18～S24）
2. **異常系テスト**（T-0010-E05, T-0010-S04, T-0010-S05, T-0010-S25）
3. **統計検証テスト**（T-0010-S11）

### Phase 3: 拡張テスト（信頼性レベル: 🟢）
1. **統合テスト**（T-0010-I01～I03）
2. **パフォーマンステスト**（T-0010-P01～P02）

---

## 9. 参照文書

- [要件定義書](./requirements.md)
- [開発ノート](./note.md)
- [TASK-0010定義](../../../tasks/atelier-guild-rank/phase-2/TASK-0010.md)
- [アーキテクチャ設計](../../../design/atelier-guild-rank/architecture-overview.md)

---

**作成者**: Claude (ずんだもん)
**最終更新**: 2026-01-16
**バージョン**: 1.0
