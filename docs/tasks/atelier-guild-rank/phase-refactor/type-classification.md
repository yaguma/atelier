# 型定義分類ドキュメント

Feature-Based Architectureへの移行に向けた型定義の分類結果。

## 分類基準

| 分類 | 説明 | 配置先 |
|------|------|--------|
| 共通型 | 複数の機能で使用される基本的な型 | `src/shared/types/` |
| 機能固有型 | 特定の機能にのみ関連する型 | `src/features/{機能名}/types/` |

---

## 共通型（shared/typesに残す）

### 基本列挙型（common.ts）

| 型名 | 用途 | 使用機能 |
|------|------|---------|
| `Attribute` | 属性（火・水・風・土等） | deck, gathering, alchemy |
| `CardType` | カードタイプ | deck |
| `EffectType` | 効果タイプ | deck, alchemy |
| `EnhancementTarget` | 強化対象 | deck |
| `GamePhase` | ゲームフェーズ | 全機能 |
| `GuildRank` | ギルドランク | rank, quest |
| `ItemCategory` | アイテムカテゴリ | inventory, alchemy |
| `ItemEffectType` | アイテム効果タイプ | inventory |
| `Quality` | 品質 | alchemy, inventory |
| `QuestType` | 依頼タイプ | quest |
| `Rarity` | レアリティ | deck, inventory |
| `SpecialRuleType` | 特殊ルールタイプ | quest |
| `ClientType` | クライアントタイプ | quest |

### ID型（ids.ts）

| 型名 | 用途 |
|------|------|
| `CardId` | カードID |
| `MaterialId` | 素材ID |
| `ItemId` | アイテムID |
| `QuestId` | 依頼ID |
| `ClientId` | クライアントID |
| `RecipeId` | レシピID |
| `ArtifactId` | アーティファクトID |

### 定数（constants.ts）

| 定数名 | 用途 |
|--------|------|
| `QualityValue` | 品質値定義 |
| `QualityMultiplier` | 品質倍率 |
| `RankOrder` | ランク順序 |
| `InitialParameters` | 初期パラメータ |

### エラー型（errors.ts）

| 型名 | 用途 |
|------|------|
| `ErrorCode` | エラーコード |
| `ErrorCodes` | エラーコード定義 |
| `DomainError` | ドメインエラー |
| `ApplicationError` | アプリケーションエラー |

### ゲーム状態型（game-state.ts）

| 型名 | 用途 |
|------|------|
| `IGameState` | ゲーム全体の状態 |
| `IDeckState` | デッキ状態 |
| `IInventoryState` | インベントリ状態 |
| `IQuestState` | 依頼状態 |

### イベント型（events.ts）

| 型名 | 用途 |
|------|------|
| `GameEventType` | イベント種別 |
| `IGameEvent` | ゲームイベント基底 |
| `IPhaseChangedEvent` | フェーズ変更イベント |
| その他イベント型 | 各種イベント |

### ユーティリティ型（utils.ts）

| 型名 | 用途 |
|------|------|
| `DeepReadonly` | 深い読み取り専用 |
| `NonNullableFields` | Null許容なしフィールド |
| `RequiredFields` | 必須フィールド |

---

## 機能固有型（各featureに移動予定）

### deck機能（cards.ts → features/deck/types/）

| 型名 | 説明 |
|------|------|
| `ICard` | カード基底インターフェース |
| `Card` | カード型 |
| `IGatheringCard` | 採取カード |
| `IRecipeCard` | レシピカード |
| `IEnhancementCard` | 強化カード |
| `ICardEffect` | カード効果 |
| `IGatheringMaterial` | 採取素材 |
| `IRequiredMaterial` | 必要素材 |
| `isGatheringCard` | 型ガード |
| `isRecipeCard` | 型ガード |
| `isEnhancementCard` | 型ガード |

### gathering機能（materials.ts → features/gathering/types/）

| 型名 | 説明 |
|------|------|
| `IMaterial` | 素材インターフェース |
| `IMaterialInstance` | 素材インスタンス |
| `IAttributeValue` | 属性値 |
| `IUsedMaterial` | 使用素材 |

### alchemy機能（materials.ts → features/alchemy/types/）

| 型名 | 説明 |
|------|------|
| `IItem` | アイテムインターフェース |
| `ICraftedItem` | 調合アイテム |
| `IItemEffect` | アイテム効果 |
| `IEffectValue` | 効果値 |

### quest機能（quests.ts → features/quest/types/）

| 型名 | 説明 |
|------|------|
| `IQuest` | 依頼インターフェース |
| `IActiveQuest` | アクティブな依頼 |
| `IClient` | クライアント |
| `IQuestCondition` | 依頼条件 |
| `QuestDifficulty` | 依頼難易度 |

### inventory機能

素材とアイテムの管理は `gathering` と `alchemy` に分散するため、
`inventory` は両者を組み合わせて使用する。

### shop機能（master-data.ts から一部）

| 型名 | 説明 |
|------|------|
| `IArtifactMaster` | アーティファクトマスター |
| `IArtifactEffect` | アーティファクト効果 |

### rank機能（master-data.ts から一部）

| 型名 | 説明 |
|------|------|
| `IGuildRankMaster` | ギルドランクマスター |
| `IPromotionRequirement` | 昇格要件 |
| `IPromotionTest` | 昇格試験 |

---

## マスターデータ型の扱い（master-data.ts）

マスターデータ型は複数機能で使用されるため、以下の方針を取る：

1. **共通マスターデータ型**（shared/typesに残す）
   - `CardMaster`, `MaterialMaster`, `ItemMaster` など
   - 複数機能で参照される基本的なマスターデータ型

2. **機能固有マスターデータ型**（各featureに移動）
   - 各機能でのみ使用される詳細な型
   - 移動は段階的に行う

---

## 移行戦略

### Phase 2-9での移行計画

| Phase | 移動対象 | 移動先 |
|-------|---------|--------|
| Phase 3 | cards.ts の型 | features/deck/types/ |
| Phase 4 | materials.ts の素材型 | features/gathering/types/ |
| Phase 5 | materials.ts のアイテム型 | features/alchemy/types/ |
| Phase 6 | quests.ts の型 | features/quest/types/ |
| Phase 7 | inventory関連 | features/inventory/types/ |
| Phase 8 | shop関連 | features/shop/types/ |
| Phase 9 | rank関連 | features/rank/types/ |

### 移行時の注意点

1. **後方互換性の維持**
   - 移行中は `src/shared/types/index.ts` から再エクスポートを維持
   - 既存のインポートパスが動作することを確認

2. **循環参照の回避**
   - 各featureは `shared/types` のみを参照
   - feature間の直接参照は禁止

3. **テストの維持**
   - 既存テストがパスすることを常に確認
   - 移行後も型のテストを維持

---

## 現時点での結論

TASK-0064の方針：

1. **既存の`src/shared/types/`はそのまま維持する**
2. **上記分類リストを作成・文書化する**
3. **移行は各機能のタスク（TASK-0068〜TASK-0093）で段階的に実施**
4. **現時点では型の移動は行わない**

---

## 変更履歴

| 日付 | 変更内容 |
|------|---------|
| 2026-02-11 | 初版作成（TASK-0064） |
