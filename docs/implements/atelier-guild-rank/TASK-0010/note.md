# TASK-0010: 素材エンティティ・MaterialService実装 - 開発ノート

**作成日**: 2026-01-16
**タスクID**: TASK-0010
**要件名**: atelier-guild-rank

---

## 1. 技術スタック

### 使用技術・フレームワーク
- **言語**: TypeScript 5.x
- **ゲームFW**: Phaser 3.87+
- **UIプラグイン**: rexUI（phaser3-rex-plugins 1.80+）
- **スタイリング**: Tailwind CSS 4.x
- **ビルド**: Vite 5.4.0
- **パッケージ管理**: pnpm 9.15.0
- **Lint/Format**: Biome 2.x
- **テスト**: Vitest 4.x（ユニットテスト）
- **E2Eテスト**: Playwright（最新）
- **Git Hooks**: Lefthook 2.x

### アーキテクチャパターン
- **Clean Architecture**: 4層構造（Presentation/Application/Domain/Infrastructure）
- **Entity-Based Design**: ドメインエンティティによるビジネスロジックのカプセル化
- **Value Object Pattern**: 品質値オブジェクトによる品質比較ロジックのカプセル化
- **Repository Pattern**: データアクセスの抽象化
- **イベント駆動設計**: EventBusによる疎結合な通信

### 参照元
- `docs/design/atelier-guild-rank/architecture-overview.md`
- `docs/design/atelier-guild-rank/data-schema-master-game.md`
- `atelier-guild-rank/package.json`

---

## 2. 開発ルール

### プロジェクト固有ルール
- **応答は日本語で行う**
- **ずんだもん口調で喋る**（語尾は「なのだ。」）
- **Clean Architectureの原則に従う**
  - Domain/Application層はPhaserに依存しない
  - ビジネスロジックはフレームワークに依存しない
  - エンティティはドメイン層に配置
  - サービスはApplication層に配置
  - 値オブジェクトはdomain/value-objectsに配置
- **Biomeによる一貫したコードスタイル**
- **Lefthookによるコミット前の品質チェック自動化**

### コーディング規約
- **エクスポート形式**: 名前付きエクスポートを使用
- **エラーハンドリング**: ApplicationErrorを使用し、ErrorCodesで定義されたコードを使う
- **型安全性**: 厳密な型定義、unknown型の使用
- **不変性**: 状態更新時は新しいオブジェクトを作成（配列のスプレッド演算子など）
- **クラス名**: PascalCase（例: `MaterialInstance`, `MaterialService`）
- **インターフェース名**: `I`プレフィックスを使用（例: `IMaterialService`）
- **型定義の場所**: `src/shared/types/` に集約
- **エンティティ**: 不変オブジェクトとして設計、getterで属性を公開

### 参照元
- `CLAUDE.md`
- `docs/design/atelier-guild-rank/architecture-overview.md`
- `docs/design/atelier-guild-rank/data-schema-master-game.md`

---

## 3. 関連実装

### 類似機能の実装例

#### TASK-0009: カードエンティティ・DeckService実装（完了済み、参考にできる）
- **エンティティ実装**: `atelier-guild-rank/src/domain/entities/Card.ts`
  - 不変オブジェクトとして設計
  - マスターデータへの参照を保持
  - getterメソッドで属性を公開
  - 型ガードメソッドを実装
- **サービス実装**: `atelier-guild-rank/src/application/services/deck-service.ts`
  - インターフェースを実装
  - コンストラクタで依存注入
  - イベント発行によるUI連携

#### 既存のEventBus実装（参考パターン）
- **ファイル**: `atelier-guild-rank/src/application/events/event-bus.ts`
- **実装パターン**:
  - インターフェースを`src/application/events/event-bus.interface.ts`に定義
  - 実装を`src/application/events/event-bus.ts`に配置
  - 型安全なイベント発行・購読

#### 既存のマスターデータリポジトリ（参考パターン）
- **ファイル**: `atelier-guild-rank/src/infrastructure/repositories/master-data-repository.ts`
- **実装パターン**:
  - コンストラクタで依存を受け取る
  - `Map`を使ったインデックスでO(1)アクセス
  - 読み込み済みフラグで二重読み込み防止

#### 既存の型定義
- **素材型**: `atelier-guild-rank/src/shared/types/materials.ts`
  - `IMaterial`インターフェース（素材マスター）
  - `IMaterialInstance`インターフェース（素材インスタンス）
- **共通型**: `atelier-guild-rank/src/shared/types/common.ts`
  - `Quality`列挙型（D, C, B, A, S）
  - `Attribute`列挙型（FIRE, WATER, EARTH, WIND, GRASS）
- **ID型**: `atelier-guild-rank/src/shared/types/ids.ts`
  - `MaterialId`ブランド型、`toMaterialId()`変換関数
- **エラー型**: `atelier-guild-rank/src/shared/types/errors.ts`
  - `ApplicationError`クラス
  - `ErrorCodes`定数

### 参照元
- `atelier-guild-rank/src/domain/entities/Card.ts`
- `atelier-guild-rank/src/application/services/deck-service.ts`
- `atelier-guild-rank/src/shared/types/materials.ts`
- `atelier-guild-rank/src/shared/types/common.ts`
- `atelier-guild-rank/src/shared/types/ids.ts`
- `atelier-guild-rank/src/shared/types/errors.ts`

---

## 4. 設計文書

### MaterialInstanceエンティティ設計

#### 責務
- 素材インスタンスID、素材マスター、品質を保持
- 素材の属性（materialId, name, baseQuality, attributes）をgetterで公開
- マスターデータへの参照を保持

#### MaterialInstanceエンティティの構造
```typescript
export class MaterialInstance {
  constructor(
    public readonly instanceId: string,
    public readonly master: IMaterial,
    public readonly quality: Quality,
  ) {}

  get materialId(): MaterialId {
    return this.master.id;
  }

  get name(): string {
    return this.master.name;
  }

  get baseQuality(): Quality {
    return this.master.baseQuality;
  }

  get attributes(): Attribute[] {
    return this.master.attributes;
  }
}
```

### 品質値オブジェクト設計

#### 責務
- 品質間の大小比較
- 品質の順序付け（D < C < B < A < S）
- 品質の算術演算補助

#### Qualityユーティリティ関数
```typescript
export const QUALITY_ORDER: Record<Quality, number> = {
  'D': 1,
  'C': 2,
  'B': 3,
  'A': 4,
  'S': 5,
};

export function compareQuality(a: Quality, b: Quality): number {
  return QUALITY_ORDER[a] - QUALITY_ORDER[b];
}

export function getHigherQuality(a: Quality, b: Quality): Quality {
  return compareQuality(a, b) >= 0 ? a : b;
}

export function getLowerQuality(a: Quality, b: Quality): Quality {
  return compareQuality(a, b) <= 0 ? a : b;
}
```

### MaterialServiceインターフェース設計

#### 責務
- 素材インスタンス生成（ユニークID付与）
- 品質のランダム生成（基準±1段階の変動）
- 平均品質計算（四捨五入で品質ランクを決定）
- 素材検索

#### IMaterialServiceメソッド定義
```typescript
export interface IMaterialService {
  // 素材生成
  createInstance(materialId: MaterialId, quality: Quality): MaterialInstance;
  generateRandomQuality(baseQuality: Quality): Quality;

  // 品質計算
  calculateAverageQuality(materials: MaterialInstance[]): Quality;

  // 検索（将来実装）
  getMaterialsByRank?(rank: GuildRank): IMaterial[];
}
```

### MaterialService実装設計

#### 主要プロパティ
| プロパティ | 型 | 説明 |
|-----------|-----|------|
| masterDataRepo | IMasterDataRepository | マスターデータ参照 |
| eventBus | IEventBus | イベント発行（将来拡張用） |

#### 素材インスタンス生成ロジック
```typescript
createInstance(materialId: MaterialId, quality: Quality): MaterialInstance {
  const master = this.masterDataRepo.getMaterialById(materialId);
  if (!master) {
    throw new ApplicationError(
      ErrorCodes.INVALID_MATERIAL_ID,
      `Material not found: ${materialId}`,
    );
  }

  const instanceId = generateUniqueId('material');
  return new MaterialInstance(instanceId, master, quality);
}
```

#### ランダム品質生成ロジック（基準±1段階の変動）
```typescript
generateRandomQuality(baseQuality: Quality): Quality {
  const baseOrder = QUALITY_ORDER[baseQuality];
  const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
  const newOrder = Math.max(1, Math.min(5, baseOrder + variation));

  const qualities: Quality[] = ['D', 'C', 'B', 'A', 'S'];
  return qualities[newOrder - 1];
}
```

#### 平均品質計算ロジック（四捨五入）
```typescript
calculateAverageQuality(materials: MaterialInstance[]): Quality {
  if (materials.length === 0) {
    throw new ApplicationError(
      ErrorCodes.INVALID_MATERIALS,
      'Cannot calculate average quality of empty array',
    );
  }

  const sum = materials.reduce((acc, m) => acc + QUALITY_ORDER[m.quality], 0);
  const average = sum / materials.length;
  const rounded = Math.round(average);

  const qualities: Quality[] = ['D', 'C', 'B', 'A', 'S'];
  return qualities[Math.max(0, Math.min(4, rounded - 1))];
}
```

### 参照元
- `docs/design/atelier-guild-rank/data-schema-master-game.md` (素材マスター定義)
- `docs/design/atelier-guild-rank/interfaces/materials.ts` (素材インターフェース)
- `docs/tasks/atelier-guild-rank/phase-2/TASK-0010.md`

---

## 5. 注意事項

### 技術的制約
- **品質は5段階**: D, C, B, A, S（定数: `QUALITY_ORDER`）
- **品質比較**: 数値による順序付け（D=1, C=2, B=3, A=4, S=5）
- **ランダム品質生成**: 基準±1段階の変動（例: B → A, B, C のいずれか）
- **平均品質計算**: 四捨五入で品質ランクを決定
- **素材インスタンスID**: 一意なID生成（`generateUniqueId('material')`）

### エラーハンドリング
- **存在しない素材ID**: `createInstance()`で存在しないMaterialIdを渡された場合はエラー
- **空配列での平均計算**: `calculateAverageQuality()`で空配列を渡された場合はエラー
- **エラーコード**:
  - `ErrorCodes.INVALID_MATERIAL_ID`: 存在しない素材ID
  - `ErrorCodes.INVALID_MATERIALS`: 無効な素材配列
  - `ErrorCodes.DATA_NOT_LOADED`: マスターデータ未読み込み

### 実装上の注意
- **不変性**: MaterialInstanceは不変オブジェクト、全プロパティ`readonly`
- **品質変動の公平性**: ランダム品質生成は均等な確率分布（-1, 0, 1が同じ確率）
- **境界値処理**: 品質の最小値（D）と最大値（S）を超えないようにクランプ処理
- **イベント発行**: 素材生成時のイベント発行は将来拡張用（現時点では省略可）
- **テストカバレッジ**: 80%以上を目標
- **テストパターン**: vitestを使用、`vi.fn()`でモック作成

### テスト要件（タスク定義より）
| テストID | テスト内容 | 期待結果 |
|---------|----------|----------|
| T-0010-01 | 素材インスタンス生成 | 正しいプロパティ |
| T-0010-02 | 品質比較 | S > A > B > C > D |
| T-0010-03 | 平均品質（同一品質） | 入力と同じ品質 |
| T-0010-04 | 平均品質（混合） | 正しい平均 |
| T-0010-05 | ランダム品質生成 | 基準±1以内 |

### 参照元
- `docs/design/atelier-guild-rank/data-schema-master-game.md`
- `docs/tasks/atelier-guild-rank/phase-2/TASK-0010.md`

---

## 6. 実装ファイル一覧

### 作成するファイル

#### エンティティ
- `atelier-guild-rank/src/domain/entities/MaterialInstance.ts` - **新規**

#### 値オブジェクト
- `atelier-guild-rank/src/domain/value-objects/Quality.ts` - **新規**

#### インターフェース
- `atelier-guild-rank/src/domain/interfaces/material-service.interface.ts` - **新規**

#### 実装
- `atelier-guild-rank/src/application/services/material-service.ts` - **新規**

#### インデックスファイル
- `atelier-guild-rank/src/domain/entities/index.ts` - **更新**（MaterialInstanceエクスポート追加）
- `atelier-guild-rank/src/domain/value-objects/index.ts` - **新規または更新**（Qualityユーティリティエクスポート追加）
- `atelier-guild-rank/src/domain/interfaces/index.ts` - **更新**（IMaterialServiceエクスポート追加）
- `atelier-guild-rank/src/application/services/index.ts` - **更新**（MaterialServiceエクスポート追加）

#### テスト
- `atelier-guild-rank/tests/unit/domain/entities/MaterialInstance.test.ts` - **新規**（推奨）
- `atelier-guild-rank/tests/unit/domain/value-objects/Quality.test.ts` - **新規**（推奨）
- `atelier-guild-rank/tests/unit/application/services/material-service.test.ts` - **新規**

### 参照元
- `docs/tasks/atelier-guild-rank/phase-2/TASK-0010.md`

---

## 7. 依存関係

### タスク依存
- **依存元**:
  - TASK-0003（共通型定義） - 完了済み
  - TASK-0004（EventBus実装） - 完了済み
  - TASK-0006（マスターデータローダー実装） - 完了済み（推測）

### インポート依存
```typescript
// エンティティ（MaterialInstance.ts）
import type { MaterialId, Quality, Attribute } from '@shared/types';
import type { IMaterial } from '@shared/types';

// 値オブジェクト（Quality.ts）
import type { Quality } from '@shared/types';

// インターフェース（material-service.interface.ts）
import type { MaterialInstance } from '@domain/entities/MaterialInstance';
import type { MaterialId, Quality, GuildRank } from '@shared/types';
import type { IMaterial } from '@shared/types';

// 実装（material-service.ts）
import type { IMaterialService } from '@domain/interfaces/material-service.interface';
import type { IMasterDataRepository } from '@domain/interfaces/master-data-repository.interface';
import type { IEventBus } from '@application/events/event-bus.interface';
import { MaterialInstance } from '@domain/entities/MaterialInstance';
import type { MaterialId, Quality, GuildRank } from '@shared/types';
import { QUALITY_ORDER, compareQuality } from '@domain/value-objects/Quality';
import { ApplicationError, ErrorCodes } from '@shared/types';
```

### 参照元
- `docs/tasks/atelier-guild-rank/phase-2/TASK-0010.md`

---

## 8. 実装チェックリスト

### 必須実装（信頼性レベル: 🔵）
- [ ] MaterialInstanceエンティティ実装
  - [ ] コンストラクタ（instanceId, master, quality）
  - [ ] getterメソッド（materialId, name, baseQuality, attributes）
- [ ] Quality値オブジェクト実装
  - [ ] QUALITY_ORDER定数
  - [ ] compareQuality()関数
  - [ ] getHigherQuality()関数
  - [ ] getLowerQuality()関数
- [ ] IMaterialServiceインターフェース定義
  - [ ] createInstance()メソッド
  - [ ] generateRandomQuality()メソッド
  - [ ] calculateAverageQuality()メソッド
- [ ] MaterialService実装
  - [ ] コンストラクタ（masterDataRepo, eventBus依存注入）
  - [ ] createInstance()メソッド（素材インスタンス生成）
  - [ ] generateRandomQuality()メソッド（±1段階の変動）
  - [ ] calculateAverageQuality()メソッド（四捨五入）
- [ ] 単体テスト
  - [ ] T-0010-01: 素材インスタンス生成
  - [ ] T-0010-02: 品質比較
  - [ ] T-0010-03: 平均品質（同一品質）
  - [ ] T-0010-04: 平均品質（混合）
  - [ ] T-0010-05: ランダム品質生成

### 推奨実装（信頼性レベル: 🟡）
- [ ] イベント発行（将来拡張用）
  - [ ] `MATERIAL_CREATED`イベント
- [ ] エラーハンドリング
  - [ ] 存在しない素材ID時のエラー
  - [ ] 空配列での平均計算時のエラー
  - [ ] マスターデータ未読み込み時のエラー
- [ ] テストカバレッジ80%以上

---

## 9. 実装の流れ

1. **MaterialInstanceエンティティの実装**
   - `src/domain/entities/MaterialInstance.ts`を作成
   - コンストラクタとgetterメソッドを実装
   - `src/domain/entities/index.ts`にエクスポート追加

2. **Quality値オブジェクトの実装**
   - `src/domain/value-objects/Quality.ts`を作成
   - QUALITY_ORDER定数を定義
   - 品質比較関数を実装
   - `src/domain/value-objects/index.ts`にエクスポート追加（またはファイル新規作成）

3. **IMaterialServiceインターフェースの定義**
   - `src/domain/interfaces/material-service.interface.ts`を作成
   - メソッドシグネチャを定義
   - `src/domain/interfaces/index.ts`にエクスポート追加

4. **MaterialServiceの実装**
   - `src/application/services/material-service.ts`を作成
   - コンストラクタと依存注入
   - 各メソッドを実装
     1. createInstance()
     2. generateRandomQuality()
     3. calculateAverageQuality()
   - `src/application/services/index.ts`にエクスポート追加

5. **テストの実装**
   - `tests/unit/domain/entities/MaterialInstance.test.ts`を作成（推奨）
   - `tests/unit/domain/value-objects/Quality.test.ts`を作成（推奨）
   - `tests/unit/application/services/material-service.test.ts`を作成
   - 全テストケース実装
   - カバレッジ確認

6. **動作確認**
   - `pnpm test`でユニットテスト実行
   - `pnpm lint`でコード品質確認

---

## 10. 参考リンク

### 設計文書
- データスキーマ設計（素材マスター）: `docs/design/atelier-guild-rank/data-schema-master-game.md`
- アーキテクチャ設計（概要）: `docs/design/atelier-guild-rank/architecture-overview.md`
- 素材インターフェース: `docs/design/atelier-guild-rank/interfaces/materials.ts`

### タスク定義
- TASK-0010定義: `docs/tasks/atelier-guild-rank/phase-2/TASK-0010.md`

### 要件定義
- 要件定義書: `docs/spec/atelier-guild-rank-requirements.md`

### 既存実装
- Cardエンティティ: `atelier-guild-rank/src/domain/entities/Card.ts`
- DeckService: `atelier-guild-rank/src/application/services/deck-service.ts`
- EventBus: `atelier-guild-rank/src/application/events/event-bus.ts`
- マスターデータリポジトリ: `atelier-guild-rank/src/infrastructure/repositories/master-data-repository.ts`
- 素材型定義: `atelier-guild-rank/src/shared/types/materials.ts`
- 共通型定義: `atelier-guild-rank/src/shared/types/common.ts`
- ID型定義: `atelier-guild-rank/src/shared/types/ids.ts`

### テスト参考
- DeckServiceテスト: `atelier-guild-rank/tests/unit/application/services/deck-service.test.ts`
- EventBusテスト: `atelier-guild-rank/tests/unit/application/events/event-bus.test.ts`

---

## 11. 補足情報

### 品質比較の実装例

品質を数値にマッピングすることで、簡単に比較演算が可能になります。

```typescript
/**
 * 品質順序定義
 * D=1, C=2, B=3, A=4, S=5
 */
export const QUALITY_ORDER: Record<Quality, number> = {
  'D': 1,
  'C': 2,
  'B': 3,
  'A': 4,
  'S': 5,
};

/**
 * 品質比較
 * @returns 正: a > b, 0: a == b, 負: a < b
 */
export function compareQuality(a: Quality, b: Quality): number {
  return QUALITY_ORDER[a] - QUALITY_ORDER[b];
}

/**
 * より高い品質を取得
 */
export function getHigherQuality(a: Quality, b: Quality): Quality {
  return compareQuality(a, b) >= 0 ? a : b;
}

/**
 * より低い品質を取得
 */
export function getLowerQuality(a: Quality, b: Quality): Quality {
  return compareQuality(a, b) <= 0 ? a : b;
}
```

### ランダム品質生成の処理フロー

```mermaid
flowchart TD
    Start[generateRandomQuality<br/>baseQuality] --> GetOrder[品質を数値に変換<br/>baseOrder = QUALITY_ORDER[baseQuality]]
    GetOrder --> Random[ランダムな変動を生成<br/>variation = -1, 0, 1]
    Random --> Calculate[新しい順序を計算<br/>newOrder = baseOrder + variation]
    Calculate --> Clamp[範囲制限<br/>1 <= newOrder <= 5]
    Clamp --> Convert[数値を品質に変換<br/>qualities[newOrder - 1]]
    Convert --> End[品質を返す]
```

### 平均品質計算の実装例

```typescript
/**
 * 平均品質計算（四捨五入）
 * @param materials 素材インスタンスの配列
 * @returns 平均品質
 */
calculateAverageQuality(materials: MaterialInstance[]): Quality {
  if (materials.length === 0) {
    throw new ApplicationError(
      ErrorCodes.INVALID_MATERIALS,
      'Cannot calculate average quality of empty array',
    );
  }

  // 各品質を数値に変換して合計
  const sum = materials.reduce((acc, m) => acc + QUALITY_ORDER[m.quality], 0);

  // 平均を計算して四捨五入
  const average = sum / materials.length;
  const rounded = Math.round(average);

  // 1-5の範囲に制限
  const clamped = Math.max(1, Math.min(5, rounded));

  // 数値を品質に変換
  const qualities: Quality[] = ['D', 'C', 'B', 'A', 'S'];
  return qualities[clamped - 1];
}
```

### 平均品質計算の具体例

| 素材構成 | 数値合計 | 平均 | 四捨五入 | 結果品質 |
|---------|---------|------|---------|---------|
| C, C, C | 2+2+2=6 | 2.0 | 2 | C |
| B, B, C | 3+3+2=8 | 2.67 | 3 | B |
| A, B, C | 4+3+2=9 | 3.0 | 3 | B |
| S, A, B | 5+4+3=12 | 4.0 | 4 | A |
| S, S, A | 5+5+4=14 | 4.67 | 5 | S |
| D, C, B | 1+2+3=6 | 2.0 | 2 | C |

### MaterialInstanceエンティティの実装例

```typescript
import type { Attribute, MaterialId, Quality } from '@shared/types';
import type { IMaterial } from '@shared/types';

/**
 * 素材インスタンスエンティティ
 * 実際にプレイヤーが所持している素材
 */
export class MaterialInstance {
  constructor(
    /** インスタンスID（一意） */
    public readonly instanceId: string,
    /** 素材マスターへの参照 */
    public readonly master: IMaterial,
    /** 実際の品質 */
    public readonly quality: Quality,
  ) {}

  /** 素材ID */
  get materialId(): MaterialId {
    return this.master.id;
  }

  /** 素材名 */
  get name(): string {
    return this.master.name;
  }

  /** 基本品質 */
  get baseQuality(): Quality {
    return this.master.baseQuality;
  }

  /** 属性リスト */
  get attributes(): Attribute[] {
    return this.master.attributes;
  }
}
```

### ユニークID生成の実装例

```typescript
/**
 * ユニークIDを生成
 * @param prefix プレフィックス（例: 'material', 'item'）
 */
function generateUniqueId(prefix: string): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${prefix}_${timestamp}_${random}`;
}
```

### テストの実装例

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MaterialService } from '@application/services/material-service';
import type { IMaterialService } from '@domain/interfaces/material-service.interface';
import type { IMasterDataRepository } from '@domain/interfaces/master-data-repository.interface';
import type { IEventBus } from '@application/events/event-bus.interface';
import { Quality } from '@shared/types';
import { QUALITY_ORDER } from '@domain/value-objects/Quality';

describe('MaterialService', () => {
  let materialService: IMaterialService;
  let mockMasterDataRepo: IMasterDataRepository;
  let mockEventBus: IEventBus;

  beforeEach(() => {
    mockMasterDataRepo = createMockMasterDataRepository();
    mockEventBus = createMockEventBus();
    materialService = new MaterialService(mockMasterDataRepo, mockEventBus);
  });

  describe('T-0010-02: 品質比較', () => {
    it('S > A > B > C > D の順序で比較できる', () => {
      expect(QUALITY_ORDER['S']).toBeGreaterThan(QUALITY_ORDER['A']);
      expect(QUALITY_ORDER['A']).toBeGreaterThan(QUALITY_ORDER['B']);
      expect(QUALITY_ORDER['B']).toBeGreaterThan(QUALITY_ORDER['C']);
      expect(QUALITY_ORDER['C']).toBeGreaterThan(QUALITY_ORDER['D']);
    });
  });

  describe('T-0010-03: 平均品質（同一品質）', () => {
    it('同じ品質の素材の平均は元の品質と同じ', () => {
      const materials = [
        createMaterialInstance(Quality.B),
        createMaterialInstance(Quality.B),
        createMaterialInstance(Quality.B),
      ];

      const average = materialService.calculateAverageQuality(materials);
      expect(average).toBe(Quality.B);
    });
  });

  describe('T-0010-05: ランダム品質生成', () => {
    it('基準±1段階以内の品質が生成される', () => {
      const baseQuality = Quality.B;
      const validQualities = [Quality.A, Quality.B, Quality.C];

      // 100回試行してすべて基準±1以内か確認
      for (let i = 0; i < 100; i++) {
        const generated = materialService.generateRandomQuality(baseQuality);
        expect(validQualities).toContain(generated);
      }
    });
  });
});
```

---

**最終更新**: 2026-01-16
