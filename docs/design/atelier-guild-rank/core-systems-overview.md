# コアシステム設計書

**バージョン**: 1.5.0
**作成日**: 2026-01-01
**更新日**: 2026-02-24
**対象**: アトリエ錬金術ゲーム（ギルドランク制）Phaser版

---

## 概要

本ドキュメントは、ゲームの核となるシステム（サービス）の詳細設計を定義する。
ドメインレイヤーのサービスはHTML版・Phaser版で共通であり、Phaser版固有のGame層とイベント連携も含める。

### 信頼性レベル凡例

- 🔵 **青信号**: 要件定義書に詳細記載
- 🟡 **黄信号**: 要件定義書から妥当な推測
- 🔴 **赤信号**: 要件定義書にない推測

---

## 1. システム構成概要

### 1.1 レイヤー構成

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  (Phaser Scenes, UI Components, EventBus) / (React/HTML)    │
├─────────────────────────────────────────────────────────────┤
│                    Application Layer                         │
│  (GameFlowManager, PhaseManager, UseCases, StateManager)    │
├─────────────────────────────────────────────────────────────┤
│                      Domain Layer                            │
│  (DeckService, GatheringService, AlchemyService, etc.)      │
├─────────────────────────────────────────────────────────────┤
│                   Infrastructure Layer                       │
│  (MasterDataLoader, SaveDataRepository, RandomGenerator)    │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 システム一覧

| システム名 | 責務 | レイヤー | Phaser連携 | 依存システム |
|-----------|------|---------|-----------|-------------|
| **Phaser固有** |||||
| SceneManager | シーン遷移管理 | Presentation | ○ | - |
| EventBus | イベント配信 | Presentation | ○ | - |
| UIFactory | UIコンポーネント生成 | Presentation | ○ | - |
| **Application** |||||
| GameFlowManager | ゲーム進行制御 | Application | EventBus経由 | PhaseManager, StateManager |
| PhaseManager | フェーズ遷移制御 | Application | EventBus経由 | DeckService, GatheringService, AlchemyService |
| StateManager | ゲーム状態管理 | Application | EventBus経由 | - |
| **Domain（共通）** |||||
| DeckService | デッキ操作・管理 | Domain | - | RandomGenerator |
| GatheringService | 採取処理 | Domain | - | DeckService, MaterialService, InventoryService, ArtifactService |
| AlchemyService | 調合処理 | Domain | - | DeckService, MaterialService, InventoryService, ArtifactService |
| QuestService | 依頼管理 | Domain | - | InventoryService, ContributionCalculator |
| ContributionCalculator | 貢献度計算 | Domain | - | ArtifactService |
| RankService | ランク管理 | Domain | - | QuestService |
| ShopService | ショップ機能 | Domain | - | DeckService, InventoryService |
| ArtifactService | アーティファクト管理 | Domain | - | MasterDataLoader |
| MaterialService | 素材の品質・属性計算 | Domain | - | MasterDataLoader, RandomGenerator |
| InventoryService | インベントリ管理 | Domain | - | ArtifactService |

---

## 2. アーキテクチャビューの関係

本プロジェクトには2つのアーキテクチャ設計ドキュメントが存在する。それぞれの視点と関係を以下に整理する。

### 2.1 2つのビューの概要

| ビュー | ドキュメント | 視点 | 目的 |
|--------|-------------|------|------|
| **レイヤードアーキテクチャ** | 本ドキュメント（core-systems-overview.md） | 技術的責務による分類 | サービス間の依存方向と責務境界の定義 |
| **Feature-Based + FC/IS** | architecture-overview.md | 機能単位の配置 + 純粋関数分離 | コードの配置ルールとテスト戦略の定義 |

### 2.2 レイヤーとFC/ISの対応

| レイヤー（本ドキュメント） | FC/IS分類 | コード配置（architecture-overview.md） | 説明 |
|---------------------------|-----------|--------------------------------------|------|
| **Presentation Layer** | Imperative Shell | `src/scenes/`, `src/features/*/components/` | Phaserシーン、UIコンポーネント |
| **Application Layer** | Imperative Shell | `src/shared/services/` (StateManager, GameFlowManager) | 状態管理、フロー制御（副作用を含む） |
| **Domain Layer（純粋計算）** | Functional Core | `src/shared/domain/services/`, `src/features/*/services/` | ContributionCalculator等の純粋計算 |
| **Domain Layer（ステートフル）** | Imperative Shell | `src/shared/services/` | DeckService, GatheringService等（内部状態を保持） |
| **Infrastructure Layer** | Imperative Shell | `src/shared/services/repositories/` | データ永続化、外部I/O |

### 2.3 なぜ2つのビューが必要か

- **レイヤードアーキテクチャビュー**は、サービス間の**依存方向**を制約する（上位レイヤーのみが下位レイヤーに依存可能）
- **Feature-Based + FC/ISビュー**は、**コードの物理的な配置**と**テスト戦略**を定義する
- 両ビューは矛盾するものではなく、異なる関心事を扱う補完的な設計指針である

---

## 3. ドメインサービスの設計分類

### 3.1 概要

Domain層のサービスは「純粋計算」と「ステートフルオーケストレーション」の2種類に分かれる。FC/IS原則において、Domain層のすべてが純粋関数であるわけではない。

### 3.2 分類表

| サービス | 分類 | 内部状態 | 副作用 | FC/IS分類 | 説明 |
|---------|------|---------|--------|-----------|------|
| ContributionCalculator | 純粋計算 | なし | なし | Functional Core | 入力のみに依存する計算ロジック |
| MaterialService | 準純粋計算 | なし（MasterData参照のみ） | EventBus通知 | Imperative Shell寄り | 品質計算は純粋だがEventBus依存あり |
| DeckService | ステートフル | deck[], hand[], discard[] | EventBus通知 | Imperative Shell | 山札・手札・捨て札の状態を管理 |
| GatheringService | ステートフル | activeSessions Map | EventBus通知 | Imperative Shell | ドラフト採取セッションの状態を管理 |
| AlchemyService | ステートフル | なし（都度計算） | EventBus通知 | Imperative Shell寄り | 調合処理のオーケストレーション |
| QuestService | ステートフル | 内部で依頼状態管理 | EventBus通知 | Imperative Shell | 依頼の生成・受注・期限管理 |
| InventoryService | ステートフル | materials[], items[] | なし | Imperative Shell | インベントリの状態管理 |
| RankService | 参照のみ | なし（MasterData参照のみ） | なし | Functional Core寄り | ランクデータの読み取り |
| ShopService | ステートフル | shopItems[] | なし | Imperative Shell | ショップ状態の管理 |
| ArtifactService | ステートフル | 所持アーティファクト | なし | Imperative Shell | アーティファクト所持状態の管理 |

### 3.3 設計判断の理由

ステートフルなサービスをDomain層に配置している理由:

1. **ビジネスルールの集約**: デッキ操作、採取、調合のルールはドメイン知識であり、Domain層に集約すべき
2. **状態管理の局所化**: 各サービスが自身の責務に関する状態のみを管理し、グローバル状態を減らす
3. **テスト容易性**: コンストラクタ注入により、モックを使った単体テストが容易

> **注意**: FC/IS原則の厳密な適用では、ステートフルなサービスは本来Imperative Shellに分類される。本プロジェクトではDomain層の「ビジネスルール集約」というメリットを優先し、レイヤード構造上はDomain層に配置しつつ、FC/ISの観点ではImperative Shellとして扱う実用的なアプローチを採用している。

---

## 4. DIコンテナ設計

### 4.1 概要

本プロジェクトでは、独自実装の軽量DIコンテナ（`Container`クラス）を使用してサービスの依存注入を管理する。tsyringe等の外部ライブラリは使用していない。

### 4.2 Containerクラス

**配置**: `src/shared/services/di/container.ts`

```typescript
// シングルトンパターンで実装
const container = Container.getInstance();

// サービスの登録
container.register(ServiceKeys.EventBus, eventBus);

// サービスの解決
const eventBus = container.resolve<IEventBus>(ServiceKeys.EventBus);
```

### 4.3 ServiceKeys（サービスキー定数）

**配置**: `src/shared/services/di/container.ts`

| キー | 型 | 説明 |
|------|-----|------|
| `EventBus` | IEventBus | イベントバス |
| `StateManager` | StateManager | ゲーム状態管理 |
| `MasterDataRepository` | MasterDataRepository | マスターデータ |
| `SaveDataRepository` | ISaveDataRepository | セーブデータ |
| `DeckService` | IDeckService | デッキ操作 |
| `MaterialService` | IMaterialService | 素材計算 |
| `GatheringService` | IGatheringService | 採取処理 |
| `AlchemyService` | AlchemyService | 調合処理 |
| `QuestService` | QuestService | 依頼管理 |
| `InventoryService` | InventoryService | インベントリ |
| `ShopService` | ShopService | ショップ |
| `ArtifactService` | ArtifactService | アーティファクト |
| `RankService` | RankService | ランク管理 |
| `GameFlowManager` | GameFlowManager | ゲーム進行制御 |
| `ContributionCalculator` | ContributionCalculator | 貢献度計算 |

### 4.4 初期化順序

**配置**: `src/shared/services/di/setup.ts`

`initializeServices()` 関数が以下の順序で全サービスを初期化する。依存関係により順序は厳密に定義されている。

```
 1. EventBus                    ← 依存なし
 2. MasterDataRepository        ← 非同期ロード（リトライ付き）
 3. SaveDataRepository           ← 依存なし
 4. StateManager                 ← EventBus
 5. ContributionCalculator       ← 依存なし
 6. DeckService                  ← MasterDataRepository, EventBus
 7. MaterialService              ← MasterDataRepository, EventBus
 8. GatheringService             ← MaterialService, MasterDataRepository, EventBus
 9. AlchemyService               ← MasterDataRepository, MaterialService, EventBus
10. QuestService                 ← MasterDataRepository, EventBus
11. InventoryService             ← 依存なし
12. RankService                  ← MasterDataRepository
13. ArtifactService              ← InventoryService, MasterDataRepository
14. ShopService                  ← DeckService, InventoryService, MasterDataRepository, StateManager(関数参照)
15. GameFlowManager              ← StateManager, DeckService, QuestService, EventBus
```

### 4.5 利用パターン

```typescript
// BootSceneでの初期化
const container = await initializeServices();

// シーンやコンポーネントでの利用
const eventBus = container.resolve<IEventBus>(ServiceKeys.EventBus);
const stateManager = container.resolve<StateManager>(ServiceKeys.StateManager);
```

### 4.6 テスト時のリセット

```typescript
import { resetServices } from '@shared/services/di/setup';

beforeEach(() => {
  resetServices(); // Container.reset() を呼び出し、全サービスをクリア
});
```

---

## 5. EventBusの使用パターン

### 5.1 現在の正しいパターン: DI注入

EventBusは**DIコンテナ経由で注入**する。シングルトン参照（`EventBus.emit()`のような静的呼び出し）は使用しない。

```typescript
// 正しい: DIコンテナから取得して注入
const eventBus = container.resolve<IEventBus>(ServiceKeys.EventBus);
const stateManager = new StateManager(eventBus);

// 正しい: コンストラクタ注入でサービスに渡す
class DeckService {
  constructor(
    private readonly masterDataRepo: IMasterDataRepository,
    private readonly eventBus: IEventBus,
  ) {}
}
```

### 5.2 非推奨パターン: シングルトン参照

以下のパターンは旧設計書（core-systems-infrastructure.md等）に記載が残っているが、現在のコードベースでは使用していない。

```typescript
// 非推奨: グローバルシングルトン参照
EventBus.emit('phase:change', { phase: 'GATHERING' });
EventBus.on('phase:change', handler, this);
```

### 5.3 旧設計書との差異

| 項目 | 旧設計（core-systems-infrastructure.md） | 現在の実装 |
|------|----------------------------------------|-----------|
| EventBusのアクセス | `EventBus.emit()` （シングルトン静的呼出し） | `container.resolve<IEventBus>(ServiceKeys.EventBus)` （DI注入） |
| EventBusのクラス設計 | `Phaser.Events.EventEmitter` のラッパー | 独自実装（`Map<GameEventType, Set<EventHandler>>`） |
| イベント名の形式 | 文字列（`'phase:change'`） | `GameEventType` enum |
| 購読解除 | `EventBus.off(event, handler, context)` | `eventBus.on()` が返す購読解除関数を呼ぶ |

> **注意**: core-systems-infrastructure.md のEventBusセクションは旧設計のまま残っている。新規実装はすべてDI注入パターンに従うこと。

---


## 関連文書

- [インフラストラクチャシステム](core-systems-infrastructure.md)
- [コアサービス](core-systems-core-services.md)
- [サポートサービス](core-systems-support-services.md)
- [データスキーマ設計 - セーブデータ](data-schema-save.md)
- [データスキーマ設計 - マスターデータ（カード）](data-schema-master-cards.md)
- [データスキーマ設計 - マスターデータ（ゲーム）](data-schema-master-game.md)
- [データスキーマ設計 - データフロー](data-schema-flow.md)
- [アーキテクチャ設計 - 概要](architecture-overview.md)
- [アーキテクチャ設計 - コンポーネント](architecture-components.md)
- [アーキテクチャ設計 - Phaser実装](architecture-phaser.md)
