# TASK-0012: アイテムエンティティ・AlchemyService実装 - 要件定義書

**バージョン**: 1.0.0
**作成日**: 2026-01-17
**タスクID**: TASK-0012
**要件名**: atelier-guild-rank

---

## 1. 概要

本文書はTASK-0012「アイテムエンティティ・AlchemyService実装」のTDD開発に必要な詳細要件を定義する。

### 1.1 目的

- ItemInstanceエンティティ: 調合で生成されたアイテムインスタンスを表現する不変オブジェクト
- IAlchemyServiceインターフェース: 調合サービスの契約を定義
- AlchemyService実装: レシピに基づいた調合処理を提供

### 1.2 信頼性レベル

- 🔵 **青信号**: 設計文書に明記されている仕様
- 🟡 **黄信号**: 設計文書から妥当に推測される仕様
- 🔴 **赤信号**: 設計文書にない推測

---

## 2. ItemInstanceエンティティ仕様 🔵

### 2.1 概要

調合によって生成されたアイテムの実体を表す不変エンティティ。

### 2.2 クラス定義

```typescript
export class ItemInstance {
  constructor(
    public readonly instanceId: string,
    public readonly master: ItemMaster,
    public readonly quality: Quality,
    public readonly usedMaterials: MaterialInstance[],
  ) {}
}
```

### 2.3 プロパティ一覧

| プロパティ | 型 | 説明 | 信頼性 |
|-----------|-----|------|--------|
| instanceId | string | アイテムインスタンスの一意なID（形式: `item_{timestamp}_{random}`） | 🔵 |
| master | ItemMaster | アイテムマスターデータへの参照 | 🔵 |
| quality | Quality | アイテムの品質（D, C, B, A, S） | 🔵 |
| usedMaterials | MaterialInstance[] | 調合に使用した素材リスト | 🔵 |

### 2.4 getterメソッド一覧

| メソッド | 戻り値 | 説明 | 信頼性 |
|---------|--------|------|--------|
| itemId | ItemId | master.idを返す | 🔵 |
| name | string | master.nameを返す | 🔵 |
| basePrice | number | master.basePriceを返す（未定義の場合は0） | 🟡 |

### 2.5 メソッド一覧

#### calculatePrice(): number 🔵

**目的**: 品質に応じた売却価格を計算する

**入力**: なし（インスタンスのbasePrice、qualityを使用）

**出力**: 品質係数を適用した価格（端数切り捨て）

**計算式**:
```
最終価格 = Math.floor(basePrice × QUALITY_PRICE_MULTIPLIER[quality])
```

**品質価格係数（QUALITY_PRICE_MULTIPLIER）**:

| 品質 | 係数 | 計算例（基本価格100G） |
|-----|------|----------------------|
| D | 0.5 | 50G |
| C | 0.75 | 75G |
| B | 1.0 | 100G |
| A | 1.5 | 150G |
| S | 2.0 | 200G |

**テストケース**:

| テストID | 入力 | 期待出力 |
|---------|------|---------|
| TC-ITEM-001 | basePrice=100, quality=D | 50 |
| TC-ITEM-002 | basePrice=100, quality=C | 75 |
| TC-ITEM-003 | basePrice=100, quality=B | 100 |
| TC-ITEM-004 | basePrice=100, quality=A | 150 |
| TC-ITEM-005 | basePrice=100, quality=S | 200 |
| TC-ITEM-006 | basePrice=150, quality=B | 150 |
| TC-ITEM-007 | basePrice=99, quality=C | 74（端数切捨） |
| TC-ITEM-008 | basePrice=0, quality=S | 0 |
| TC-ITEM-009 | basePriceなし（undefined）, quality=B | 0 |

### 2.6 不変性要件 🔵

- 全プロパティは`readonly`として宣言
- コンストラクタ以外での状態変更は不可
- usedMaterials配列自体は参照が不変（内部要素は変更不可）

---

## 3. IAlchemyServiceインターフェース仕様 🔵

### 3.1 概要

調合処理のサービスインターフェース定義。

### 3.2 インターフェース定義

```typescript
export interface IAlchemyService {
  craft(recipeId: CardId, materials: MaterialInstance[]): ItemInstance;
  canCraft(recipeId: CardId, availableMaterials: MaterialInstance[]): boolean;
  previewQuality(recipeId: CardId, materials: MaterialInstance[]): Quality;
  getAvailableRecipes(materials: MaterialInstance[]): IRecipeCardMaster[];
  checkRecipeRequirements(
    recipeId: CardId,
    materials: MaterialInstance[]
  ): RecipeCheckResult;
}
```

### 3.3 RecipeCheckResultインターフェース 🔵

```typescript
export interface RecipeCheckResult {
  /** 調合可能かどうか */
  canCraft: boolean;
  /** 不足している素材リスト */
  missingMaterials: IRecipeRequiredMaterial[];
  /** マッチした素材リスト */
  matchedMaterials: MaterialInstance[];
}
```

---

## 4. AlchemyServiceメソッド詳細仕様

### 4.1 craft(recipeId, materials): ItemInstance 🔵

**目的**: レシピと素材を使用してアイテムを調合する

**入力**:
| 引数 | 型 | 説明 |
|------|-----|------|
| recipeId | CardId | レシピカードのID |
| materials | MaterialInstance[] | 使用する素材リスト |

**出力**: ItemInstance（生成されたアイテムインスタンス）

**処理フロー**:
1. レシピマスター取得（存在チェック）
2. checkRecipeRequirementsで素材チェック
3. アイテムマスター取得（outputItemId）
4. MaterialServiceで平均品質計算
5. ItemInstance生成
6. ALCHEMY_COMPLETEDイベント発行
7. ItemInstance返却

**エラー条件**:
| エラー条件 | エラーコード | メッセージ |
|-----------|-------------|----------|
| レシピが存在しない | INVALID_RECIPE | `Recipe not found: ${recipeId}` |
| 素材が不足 | INSUFFICIENT_MATERIALS | `Cannot craft: insufficient materials` |
| 出力アイテムが存在しない | INVALID_RECIPE | `Output item not found: ${outputItemId}` |

**テストケース**:

| テストID | シナリオ | 期待結果 |
|---------|---------|---------|
| TC-CRAFT-001 | 有効なレシピ・十分な素材 | ItemInstance生成成功 |
| TC-CRAFT-002 | 存在しないレシピID | ApplicationError(INVALID_RECIPE) |
| TC-CRAFT-003 | 素材不足 | ApplicationError(INSUFFICIENT_MATERIALS) |
| TC-CRAFT-004 | 出力アイテムが存在しないレシピ | ApplicationError(INVALID_RECIPE) |
| TC-CRAFT-005 | 調合成功時イベント発行 | ALCHEMY_COMPLETEDイベント |

### 4.2 canCraft(recipeId, availableMaterials): boolean 🔵

**目的**: 指定のレシピで調合可能かチェックする

**入力**:
| 引数 | 型 | 説明 |
|------|-----|------|
| recipeId | CardId | レシピカードのID |
| availableMaterials | MaterialInstance[] | 利用可能な素材リスト |

**出力**: boolean（調合可能ならtrue）

**処理フロー**:
1. checkRecipeRequirementsを呼び出し
2. result.canCraftを返す

**テストケース**:

| テストID | シナリオ | 期待結果 |
|---------|---------|---------|
| TC-CANCRAFT-001 | 十分な素材あり | true |
| TC-CANCRAFT-002 | 素材不足 | false |
| TC-CANCRAFT-003 | 存在しないレシピID | false |
| TC-CANCRAFT-004 | 空の素材リスト | false |

### 4.3 previewQuality(recipeId, materials): Quality 🔵

**目的**: 調合前に完成品の品質をプレビューする

**入力**:
| 引数 | 型 | 説明 |
|------|-----|------|
| recipeId | CardId | レシピカードのID |
| materials | MaterialInstance[] | 使用予定の素材リスト |

**出力**: Quality（予想される品質）

**処理フロー**:
1. checkRecipeRequirementsでマッチング
2. matchedMaterialsの平均品質を計算（MaterialService.calculateAverageQuality使用）

**注意**: 素材がマッチしない場合、空配列になるため適切にエラー処理する

**テストケース**:

| テストID | シナリオ | 期待結果 |
|---------|---------|---------|
| TC-PREVIEW-001 | 全てC品質素材 | Quality.C |
| TC-PREVIEW-002 | B, C, D混合素材 | Quality.C（平均2.67→3→B？確認必要） |
| TC-PREVIEW-003 | 全てS品質素材 | Quality.S |
| TC-PREVIEW-004 | 存在しないレシピID | エラーまたはデフォルト品質 |

### 4.4 getAvailableRecipes(materials): IRecipeCardMaster[] 🔵

**目的**: 現在の素材で作成可能なレシピ一覧を取得する

**入力**:
| 引数 | 型 | 説明 |
|------|-----|------|
| materials | MaterialInstance[] | 利用可能な素材リスト |

**出力**: IRecipeCardMaster[]（作成可能なレシピの配列）

**処理フロー**:
1. 全レシピカードを取得（masterDataRepo.getCardsByType('RECIPE')）
2. 各レシピに対してcheckRecipeRequirementsでチェック
3. canCraft=trueのレシピのみフィルタして返却

**テストケース**:

| テストID | シナリオ | 期待結果 |
|---------|---------|---------|
| TC-AVAILABLE-001 | 複数レシピ作成可能 | 該当レシピの配列 |
| TC-AVAILABLE-002 | 作成可能レシピなし | 空配列 |
| TC-AVAILABLE-003 | 空の素材リスト | 空配列 |
| TC-AVAILABLE-004 | 1つだけ作成可能 | 1要素の配列 |

### 4.5 checkRecipeRequirements(recipeId, materials): RecipeCheckResult 🔵

**目的**: レシピの必要素材要件をチェックする

**入力**:
| 引数 | 型 | 説明 |
|------|-----|------|
| recipeId | CardId | レシピカードのID |
| materials | MaterialInstance[] | チェック対象の素材リスト |

**出力**: RecipeCheckResult

**処理フロー**:
1. レシピマスター取得
2. レシピが存在しない場合: `{ canCraft: false, missingMaterials: [], matchedMaterials: [] }`
3. 各requiredMaterialについてマッチング処理
4. 結果を集計して返却

**素材マッチングロジック** 🔵:

```typescript
for (const required of recipe.requiredMaterials) {
  let foundCount = 0;

  for (let i = 0; i < materials.length; i++) {
    if (usedIndices.has(i)) continue; // 使用済み素材はスキップ

    const material = materials[i];

    // 素材IDマッチ
    if (material.materialId !== required.materialId) continue;

    // 最低品質チェック（指定されている場合）
    if (required.minQuality) {
      if (compareQuality(material.quality, required.minQuality) < 0) continue;
    }

    // マッチ成功
    matchedMaterials.push(material);
    usedIndices.add(i);
    foundCount++;

    if (foundCount >= required.quantity) break;
  }

  // 不足分をmissingMaterialsに追加
  if (foundCount < required.quantity) {
    missingMaterials.push({
      ...required,
      quantity: required.quantity - foundCount,
    });
  }
}
```

**マッチング条件**:
1. materialIdが一致
2. minQualityが指定されている場合、素材品質が条件以上
3. 同一素材を複数回使用しない（usedIndicesで管理）

**テストケース**:

| テストID | シナリオ | 期待結果 |
|---------|---------|---------|
| TC-CHECK-001 | 全素材マッチ | canCraft=true, missing=[], matched=[...] |
| TC-CHECK-002 | 一部素材不足 | canCraft=false, missing=[不足分], matched=[マッチ分] |
| TC-CHECK-003 | 全素材不足 | canCraft=false, missing=[全必要素材], matched=[] |
| TC-CHECK-004 | 存在しないレシピID | canCraft=false, missing=[], matched=[] |
| TC-CHECK-005 | 品質条件未達 | canCraft=false, missing=[該当素材] |
| TC-CHECK-006 | 複数個必要な素材 | 必要数量分マッチ |
| TC-CHECK-007 | 余剰素材あり | 必要分のみマッチ |

---

## 5. 品質計算ロジック 🔵

### 5.1 概要

調合品質はMaterialService.calculateAverageQuality()を使用して計算する。

### 5.2 計算式

```
平均品質 = Σ(素材の品質数値) / 素材数
最終品質 = orderToQuality(Math.round(平均品質))
```

### 5.3 品質数値マッピング

| 品質 | 数値 |
|-----|------|
| D | 1 |
| C | 2 |
| B | 3 |
| A | 4 |
| S | 5 |

### 5.4 計算例

| 素材品質 | 計算 | 結果 |
|---------|------|------|
| [C, C, C] | (2+2+2)/3 = 2.0 → round(2.0) = 2 | C |
| [B, C, D] | (3+2+1)/3 = 2.0 → round(2.0) = 2 | C |
| [B, B, C] | (3+3+2)/3 = 2.67 → round(2.67) = 3 | B |
| [A, C, B] | (4+2+3)/3 = 3.0 → round(3.0) = 3 | B |
| [S, A, B] | (5+4+3)/3 = 4.0 → round(4.0) = 4 | A |

---

## 6. レシピ要件マッチングロジック 🔵

### 6.1 概要

レシピの必要素材と所持素材のマッチングを行う。

### 6.2 マッチング条件

1. **素材ID一致**: required.materialId === material.materialId
2. **品質条件**: required.minQualityが指定されている場合、compareQuality(material.quality, required.minQuality) >= 0
3. **数量条件**: 同一素材が必要数量分存在すること
4. **重複禁止**: 同じ素材インスタンスを複数の要件で使用しない

### 6.3 マッチング順序

- requiredMaterialsの配列順序でマッチング
- 各required内では、materialsの配列順序でマッチング

### 6.4 IRecipeRequiredMaterial構造

```typescript
interface IRecipeRequiredMaterial {
  materialId: string;      // 素材ID
  quantity: number;        // 必要数量
  minQuality?: Quality;    // 最低品質（オプション）
}
```

---

## 7. イベント発行仕様 🔵

### 7.1 ALCHEMY_COMPLETEDイベント

**発行タイミング**: craft()メソッドで調合が成功した直後

**イベント構造**:
```typescript
{
  type: GameEventType.ALCHEMY_COMPLETED,
  timestamp: number,
  craftedItem: ICraftedItem
}
```

**ICraftedItem変換**:
ItemInstanceからICraftedItemへの変換が必要な場合、以下の形式:
```typescript
{
  itemId: instance.itemId,
  quality: instance.quality,
  attributeValues: [],      // 将来実装
  effectValues: [],         // 将来実装
  usedMaterials: []         // IUsedMaterial形式に変換
}
```

---

## 8. エラーハンドリング仕様 🔵

### 8.1 使用するエラーコード

| エラーコード | 使用場面 |
|-------------|---------|
| INVALID_RECIPE | レシピが存在しない、または出力アイテムが未定義 |
| INSUFFICIENT_MATERIALS | 調合に必要な素材が不足 |

### 8.2 エラー発生パターン

| メソッド | エラー条件 | エラーコード |
|---------|-----------|-------------|
| craft | レシピ未存在 | INVALID_RECIPE |
| craft | 素材不足 | INSUFFICIENT_MATERIALS |
| craft | 出力アイテム未存在 | INVALID_RECIPE |

### 8.3 エラークラス

ApplicationErrorを使用:
```typescript
throw new ApplicationError(
  ErrorCodes.INVALID_RECIPE,
  `Recipe not found: ${recipeId}`,
);
```

---

## 9. 依存関係 🔵

### 9.1 インポート依存

#### ItemInstance.ts
```typescript
import type { ItemId, Quality } from '@shared/types';
import type { ItemMaster } from '@shared/types/master-data';
import type { MaterialInstance } from './MaterialInstance';
```

#### alchemy-service.interface.ts
```typescript
import type { ItemInstance } from '@domain/entities/ItemInstance';
import type { MaterialInstance } from '@domain/entities/MaterialInstance';
import type { CardId, Quality } from '@shared/types';
import type { IRecipeCardMaster, IRecipeRequiredMaterial } from '@shared/types/master-data';
```

#### alchemy-service.ts
```typescript
import type { IAlchemyService, RecipeCheckResult } from '@domain/interfaces/alchemy-service.interface';
import type { IMasterDataRepository } from '@domain/interfaces/master-data-repository.interface';
import type { IMaterialService } from '@domain/interfaces/material-service.interface';
import type { IEventBus } from '@application/events/event-bus.interface';
import { ItemInstance, QUALITY_PRICE_MULTIPLIER } from '@domain/entities/ItemInstance';
import { MaterialInstance } from '@domain/entities/MaterialInstance';
import { compareQuality } from '@domain/value-objects/Quality';
import { ApplicationError, ErrorCodes } from '@shared/types/errors';
import { GameEventType } from '@shared/types/events';
import { generateUniqueId } from '@shared/utils';
import { toItemId } from '@shared/types/ids';
import type { CardId, Quality, ItemId } from '@shared/types';
import type { IRecipeCardMaster } from '@shared/types/master-data';
```

### 9.2 タスク依存

- TASK-0003: 共通型定義（完了済み）
- TASK-0004: EventBus実装（完了済み）
- TASK-0006: マスターデータローダー実装（完了済み）
- TASK-0010: 素材エンティティ・MaterialService実装（完了済み）

---

## 10. 受け入れ基準詳細 🔵

### 10.1 必須条件

| ID | 条件 | 検証方法 |
|----|------|---------|
| AC-001 | レシピに基づいた調合ができる | T-0012-01 |
| AC-002 | 素材不足時は調合不可 | T-0012-02 |
| AC-003 | 品質が素材品質から決定される | T-0012-03, T-0012-04 |
| AC-004 | 調合結果がアイテムインスタンスとして返る | T-0012-01 |
| AC-005 | ItemInstance.calculatePrice()が正しく動作する | TC-ITEM-001〜009 |

### 10.2 推奨条件

| ID | 条件 | 検証方法 |
|----|------|---------|
| AC-006 | 調合プレビュー機能 | TC-PREVIEW-001〜004 |
| AC-007 | 単体テストカバレッジ80%以上 | カバレッジレポート |
| AC-008 | ALCHEMY_COMPLETEDイベント発行 | TC-CRAFT-005 |

---

## 11. テストケース一覧

### 11.1 ItemInstanceエンティティ

| テストID | テスト内容 | 期待結果 |
|---------|----------|----------|
| TC-ITEM-001 | D品質で価格計算 | basePrice × 0.5 |
| TC-ITEM-002 | C品質で価格計算 | basePrice × 0.75 |
| TC-ITEM-003 | B品質で価格計算 | basePrice × 1.0 |
| TC-ITEM-004 | A品質で価格計算 | basePrice × 1.5 |
| TC-ITEM-005 | S品質で価格計算 | basePrice × 2.0 |
| TC-ITEM-006 | 端数切捨て確認 | Math.floor適用 |
| TC-ITEM-007 | basePrice=0の場合 | 0を返す |
| TC-ITEM-008 | getter動作確認 | itemId, name, basePrice正常取得 |

### 11.2 AlchemyService

| テストID | テスト内容 | 期待結果 |
|---------|----------|----------|
| T-0012-01 | 調合成功 | アイテムインスタンス生成 |
| T-0012-02 | 素材不足時の調合 | ApplicationError発生 |
| T-0012-03 | 品質計算（全てC品質） | C品質アイテム |
| T-0012-04 | 品質計算（混合品質） | 平均品質 |
| T-0012-05 | 調合可能レシピ取得 | 該当レシピリスト |
| TC-CRAFT-002 | 存在しないレシピID | ApplicationError(INVALID_RECIPE) |
| TC-CRAFT-004 | 出力アイテム未存在 | ApplicationError(INVALID_RECIPE) |
| TC-CRAFT-005 | イベント発行確認 | ALCHEMY_COMPLETED発行 |
| TC-CANCRAFT-001 | 調合可能チェック成功 | true |
| TC-CANCRAFT-002 | 調合可能チェック失敗 | false |
| TC-CHECK-001 | 全素材マッチ | canCraft=true |
| TC-CHECK-002 | 一部素材不足 | canCraft=false, missing有り |
| TC-CHECK-005 | 品質条件未達 | canCraft=false |
| TC-PREVIEW-001 | 品質プレビュー | 期待品質 |
| TC-AVAILABLE-001 | 利用可能レシピ取得 | 該当レシピ配列 |

---

## 12. ファイル構成

| 成果物 | パス |
|--------|------|
| ItemInstanceエンティティ | `atelier-guild-rank/src/domain/entities/ItemInstance.ts` |
| IAlchemyServiceインターフェース | `atelier-guild-rank/src/domain/interfaces/alchemy-service.interface.ts` |
| AlchemyService実装 | `atelier-guild-rank/src/application/services/alchemy-service.ts` |
| ItemInstanceテスト | `atelier-guild-rank/tests/unit/domain/entities/ItemInstance.test.ts` |
| AlchemyServiceテスト | `atelier-guild-rank/tests/unit/application/services/alchemy-service.test.ts` |

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|----------|---------|
| 2026-01-17 | 1.0.0 | 初版作成 |
