# TASK-0003: 共通型定義 TDD要件定義書

**バージョン**: 1.0.0
**作成日**: 2026-01-16
**フェーズ**: 1 - 基盤構築
**EARS記法**: Easy Approach to Requirements Syntax

---

## 1. 概要

本書は、設計文書（docs/design/atelier-guild-rank/interfaces/）に定義された型定義を `src/shared/types/` に実装するための要件定義書である。

### 1.1 スコープ

| 項目 | 内容 |
|------|------|
| **対象** | 共通型定義の実装 |
| **実装先** | `atelier-guild-rank/src/shared/types/` |
| **設計文書** | `docs/design/atelier-guild-rank/interfaces/` 配下 |

### 1.2 参照文書

| 文書 | パス |
|------|------|
| interfaces.ts（統合版） | `docs/design/atelier-guild-rank/interfaces.ts` |
| core.ts（列挙型定義） | `docs/design/atelier-guild-rank/interfaces/core.ts` |
| cards.ts（カード型定義） | `docs/design/atelier-guild-rank/interfaces/cards.ts` |
| materials.ts（素材型定義） | `docs/design/atelier-guild-rank/interfaces/materials.ts` |
| quests.ts（依頼型定義） | `docs/design/atelier-guild-rank/interfaces/quests.ts` |
| game-state.ts（状態型定義） | `docs/design/atelier-guild-rank/interfaces/game-state.ts` |

---

## 2. 要件定義（EARS記法）

### 2.1 基本型定義（REQ-COMMON）

#### REQ-COMMON-001: ゲームフェーズ列挙型

**EARS形式**: Ubiquitous
**要件**: システムは `GamePhase` 列挙型を提供しなければならない。この列挙型は `QUEST_ACCEPT`, `GATHERING`, `ALCHEMY`, `DELIVERY` の4つの値を持つこと。

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| GamePhase型が定義されている | TypeScriptコンパイル成功 |
| 4つの値すべてが使用可能 | 型テストで各値を使用 |
| 他の値は型エラーになる | 型テストで無効値を検証 |

#### REQ-COMMON-002: ギルドランク列挙型

**EARS形式**: Ubiquitous
**要件**: システムは `GuildRank` 列挙型を提供しなければならない。この列挙型は `G`, `F`, `E`, `D`, `C`, `B`, `A`, `S` の8つの値を持つこと。

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| GuildRank型が定義されている | TypeScriptコンパイル成功 |
| 8つの値すべてが使用可能 | 型テストで各値を使用 |
| ランクの順序付けが可能 | RankOrder定数との連携確認 |

#### REQ-COMMON-003: カード種別列挙型

**EARS形式**: Ubiquitous
**要件**: システムは `CardType` 列挙型を提供しなければならない。この列挙型は `GATHERING`, `RECIPE`, `ENHANCEMENT` の3つの値を持つこと。

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| CardType型が定義されている | TypeScriptコンパイル成功 |
| 3つの値すべてが使用可能 | 型テストで各値を使用 |

#### REQ-COMMON-004: 品質ランク列挙型

**EARS形式**: Ubiquitous
**要件**: システムは `Quality` 列挙型を提供しなければならない。この列挙型は `D`, `C`, `B`, `A`, `S` の5つの値を持つこと。

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| Quality型が定義されている | TypeScriptコンパイル成功 |
| 5つの値すべてが使用可能 | 型テストで各値を使用 |
| QualityValue定数との連携が可能 | 数値変換テスト |

#### REQ-COMMON-005: 属性列挙型

**EARS形式**: Ubiquitous
**要件**: システムは `Attribute` 列挙型を提供しなければならない。この列挙型は `FIRE`, `WATER`, `EARTH`, `WIND`, `GRASS` の5つの値を持つこと。

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| Attribute型が定義されている | TypeScriptコンパイル成功 |
| 5つの値すべてが使用可能 | 型テストで各値を使用 |

#### REQ-COMMON-006: 依頼タイプ列挙型

**EARS形式**: Ubiquitous
**要件**: システムは `QuestType` 列挙型を提供しなければならない。この列挙型は `SPECIFIC`, `CATEGORY`, `QUALITY`, `QUANTITY`, `ATTRIBUTE`, `EFFECT`, `MATERIAL`, `COMPOUND` の8つの値を持つこと。

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| QuestType型が定義されている | TypeScriptコンパイル成功 |
| 8つの値すべてが使用可能 | 型テストで各値を使用 |

#### REQ-COMMON-007: 依頼者タイプ列挙型

**EARS形式**: Ubiquitous
**要件**: システムは `ClientType` 列挙型を提供しなければならない。この列挙型は `VILLAGER`, `ADVENTURER`, `MERCHANT`, `NOBLE`, `GUILD` の5つの値を持つこと。

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| ClientType型が定義されている | TypeScriptコンパイル成功 |
| 5つの値すべてが使用可能 | 型テストで各値を使用 |

#### REQ-COMMON-008: レアリティ列挙型

**EARS形式**: Ubiquitous
**要件**: システムは `Rarity` 列挙型を提供しなければならない。この列挙型は `COMMON`, `UNCOMMON`, `RARE`, `EPIC`, `LEGENDARY` の5つの値を持つこと。

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| Rarity型が定義されている | TypeScriptコンパイル成功 |
| 5つの値すべてが使用可能 | 型テストで各値を使用 |

#### REQ-COMMON-009: 強化対象列挙型

**EARS形式**: Ubiquitous
**要件**: システムは `EnhancementTarget` 列挙型を提供しなければならない。この列挙型は `GATHERING`, `ALCHEMY`, `DELIVERY`, `ALL` の4つの値を持つこと。

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| EnhancementTarget型が定義されている | TypeScriptコンパイル成功 |
| 4つの値すべてが使用可能 | 型テストで各値を使用 |

#### REQ-COMMON-010: 効果タイプ列挙型

**EARS形式**: Ubiquitous
**要件**: システムは `EffectType` 列挙型を提供しなければならない。この列挙型は少なくとも `QUALITY_UP`, `MATERIAL_SAVE`, `GATHERING_BONUS`, `RARE_CHANCE_UP`, `GOLD_BONUS`, `CONTRIBUTION_BONUS`, `COST_REDUCTION`, `STORAGE_EXPANSION`, `ACTION_POINT_BONUS`, `ALCHEMY_COST_REDUCTION`, `ALL_BONUS` の値を持つこと。

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| EffectType型が定義されている | TypeScriptコンパイル成功 |
| 全ての値が使用可能 | 型テストで各値を使用 |

#### REQ-COMMON-011: アイテムカテゴリ列挙型

**EARS形式**: Ubiquitous
**要件**: システムは `ItemCategory` 列挙型を提供しなければならない。この列挙型は `MEDICINE`, `WEAPON`, `MAGIC`, `ADVENTURE`, `LUXURY` の5つの値を持つこと。

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| ItemCategory型が定義されている | TypeScriptコンパイル成功 |
| 5つの値すべてが使用可能 | 型テストで各値を使用 |

#### REQ-COMMON-012: 特殊ルールタイプ列挙型

**EARS形式**: Ubiquitous
**要件**: システムは `SpecialRuleType` 列挙型を提供しなければならない。この列挙型は `QUEST_LIMIT`, `QUALITY_PENALTY`, `DEADLINE_REDUCTION`, `QUALITY_REQUIRED` の4つの値を持つこと。

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| SpecialRuleType型が定義されている | TypeScriptコンパイル成功 |
| 4つの値すべてが使用可能 | 型テストで各値を使用 |

---

### 2.2 エンティティID型定義（REQ-IDS）

#### REQ-IDS-001: ブランド型によるID定義

**EARS形式**: Ubiquitous
**要件**: システムは以下のブランド型IDを提供しなければならない。各ID型は文字列ベースだが、型レベルで区別可能であること。

- `CardId` - カードID
- `MaterialId` - 素材ID
- `ItemId` - アイテムID
- `QuestId` - 依頼ID
- `ArtifactId` - アーティファクトID
- `ClientId` - 依頼者ID
- `RecipeId` - レシピID

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| 各ID型が定義されている | TypeScriptコンパイル成功 |
| 異なるID型間の代入が型エラーになる | 型テストで誤用検出 |
| 文字列からの変換関数が提供されている | 関数テスト |

#### REQ-IDS-002: ID型ヘルパー関数

**EARS形式**: Ubiquitous
**要件**: システムは各ID型への変換を行うヘルパー関数を提供しなければならない。

```typescript
function toCardId(value: string): CardId
function toMaterialId(value: string): MaterialId
function toItemId(value: string): ItemId
function toQuestId(value: string): QuestId
function toArtifactId(value: string): ArtifactId
function toClientId(value: string): ClientId
function toRecipeId(value: string): RecipeId
```

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| 各変換関数が定義されている | 関数存在確認テスト |
| 変換関数が正しい型を返す | 型テスト |
| 変換関数が入力値をそのまま返す | 単体テスト |

---

### 2.3 カード型定義（REQ-CARDS）

#### REQ-CARDS-001: カード基底インターフェース

**EARS形式**: Ubiquitous
**要件**: システムは `ICard` インターフェースを提供しなければならない。このインターフェースは以下のプロパティを持つこと。

| プロパティ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| id | string | Yes | カードID |
| name | string | Yes | カード名 |
| type | CardType | Yes | カード種別 |
| rarity | Rarity | Yes | レアリティ |
| unlockRank | GuildRank | Yes | 解放ランク |
| description | string | No | フレーバーテキスト |

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| ICard型が定義されている | TypeScriptコンパイル成功 |
| 全プロパティが正しく型付けされている | 型テスト |

#### REQ-CARDS-002: 採取地カードインターフェース

**EARS形式**: Ubiquitous
**要件**: システムは `IGatheringCard` インターフェースを提供しなければならない。このインターフェースは `ICard` を拡張し、以下の追加プロパティを持つこと。

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| type | CardType.GATHERING | 固定値 |
| cost | number | 行動コスト（0〜3） |
| materials | IGatheringMaterial[] | 獲得可能な素材リスト |

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| IGatheringCard型が定義されている | TypeScriptコンパイル成功 |
| ICardを正しく拡張している | 継承テスト |
| type属性がCardType.GATHERINGに限定されている | 型テスト |

#### REQ-CARDS-003: レシピカードインターフェース

**EARS形式**: Ubiquitous
**要件**: システムは `IRecipeCard` インターフェースを提供しなければならない。このインターフェースは `ICard` を拡張し、以下の追加プロパティを持つこと。

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| type | CardType.RECIPE | 固定値 |
| cost | number | 行動コスト（1〜3） |
| requiredMaterials | IRequiredMaterial[] | 必要素材リスト |
| outputItemId | string | 出力アイテムID |
| category | ItemCategory | アイテムカテゴリ |

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| IRecipeCard型が定義されている | TypeScriptコンパイル成功 |
| ICardを正しく拡張している | 継承テスト |

#### REQ-CARDS-004: 強化カードインターフェース

**EARS形式**: Ubiquitous
**要件**: システムは `IEnhancementCard` インターフェースを提供しなければならない。このインターフェースは `ICard` を拡張し、以下の追加プロパティを持つこと。

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| type | CardType.ENHANCEMENT | 固定値 |
| cost | 0 | 固定値（コストなし） |
| effect | ICardEffect | 効果 |
| targetAction | EnhancementTarget | 対象行動 |

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| IEnhancementCard型が定義されている | TypeScriptコンパイル成功 |
| costが0に固定されている | 型テスト |

#### REQ-CARDS-005: カードユニオン型

**EARS形式**: Ubiquitous
**要件**: システムは `Card` ユニオン型を提供しなければならない。この型は `IGatheringCard | IRecipeCard | IEnhancementCard` のユニオンであること。

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| Card型が定義されている | TypeScriptコンパイル成功 |
| 型の絞り込みが正しく動作する | 型ガードテスト |

---

### 2.4 素材・アイテム型定義（REQ-MATERIALS）

#### REQ-MATERIALS-001: 素材マスターインターフェース

**EARS形式**: Ubiquitous
**要件**: システムは `IMaterial` インターフェースを提供しなければならない。

| プロパティ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| id | string | Yes | 素材ID |
| name | string | Yes | 素材名 |
| baseQuality | Quality | Yes | 基本品質 |
| attributes | Attribute[] | Yes | 属性リスト |
| description | string | No | 説明 |

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| IMaterial型が定義されている | TypeScriptコンパイル成功 |
| 全プロパティが正しく型付けされている | 型テスト |

#### REQ-MATERIALS-002: 素材インスタンスインターフェース

**EARS形式**: Ubiquitous
**要件**: システムは `IMaterialInstance` インターフェースを提供しなければならない。

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| materialId | string | 素材ID（IMaterial.idを参照） |
| quality | Quality | 実際の品質 |
| quantity | number | 所持数 |

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| IMaterialInstance型が定義されている | TypeScriptコンパイル成功 |

#### REQ-MATERIALS-003: アイテムマスターインターフェース

**EARS形式**: Ubiquitous
**要件**: システムは `IItem` インターフェースを提供しなければならない。

| プロパティ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| id | string | Yes | アイテムID |
| name | string | Yes | アイテム名 |
| category | ItemCategory | Yes | カテゴリ |
| effects | IItemEffect[] | Yes | 効果リスト |
| description | string | No | 説明 |

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| IItem型が定義されている | TypeScriptコンパイル成功 |

#### REQ-MATERIALS-004: 調合済みアイテムインターフェース

**EARS形式**: Ubiquitous
**要件**: システムは `ICraftedItem` インターフェースを提供しなければならない。

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| itemId | string | アイテムID |
| quality | Quality | 品質 |
| attributeValues | IAttributeValue[] | 実際の属性値 |
| effectValues | IEffectValue[] | 実際の効果値 |
| usedMaterials | IUsedMaterial[] | 使用した素材情報 |

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| ICraftedItem型が定義されている | TypeScriptコンパイル成功 |

---

### 2.5 依頼型定義（REQ-QUESTS）

#### REQ-QUESTS-001: 依頼者インターフェース

**EARS形式**: Ubiquitous
**要件**: システムは `IClient` インターフェースを提供しなければならない。

| プロパティ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| id | string | Yes | 依頼者ID |
| name | string | Yes | 依頼者名 |
| type | ClientType | Yes | 依頼者タイプ |
| contributionMultiplier | number | Yes | 貢献度補正 |
| goldMultiplier | number | Yes | 報酬金補正 |
| deadlineModifier | number | Yes | 期限補正 |
| preferredQuestTypes | QuestType[] | Yes | 好む依頼タイプ |
| unlockRank | GuildRank | Yes | 登場ランク |
| dialoguePatterns | string[] | No | セリフパターン |

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| IClient型が定義されている | TypeScriptコンパイル成功 |

#### REQ-QUESTS-002: 依頼条件インターフェース

**EARS形式**: Ubiquitous
**要件**: システムは `IQuestCondition` インターフェースを提供しなければならない。この型は8種類の依頼タイプに対応した条件を表現できること。

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| IQuestCondition型が定義されている | TypeScriptコンパイル成功 |
| 各依頼タイプの条件が表現可能 | 型テスト |
| 複合条件（subConditions）が表現可能 | 再帰型テスト |

#### REQ-QUESTS-003: 依頼インターフェース

**EARS形式**: Ubiquitous
**要件**: システムは `IQuest` インターフェースを提供しなければならない。

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| id | string | 依頼ID |
| clientId | string | 依頼者ID |
| condition | IQuestCondition | 依頼条件 |
| contribution | number | 貢献度 |
| gold | number | 報酬金 |
| deadline | number | 期限 |
| difficulty | 'easy' \| 'normal' \| 'hard' \| 'extreme' | 難易度 |
| flavorText | string | フレーバーテキスト |

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| IQuest型が定義されている | TypeScriptコンパイル成功 |

#### REQ-QUESTS-004: 受注中依頼インターフェース

**EARS形式**: Ubiquitous
**要件**: システムは `IActiveQuest` インターフェースを提供しなければならない。

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| quest | IQuest | 依頼データ |
| remainingDays | number | 残り日数 |
| acceptedDay | number | 受注日 |

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| IActiveQuest型が定義されている | TypeScriptコンパイル成功 |

---

### 2.6 ゲーム状態型定義（REQ-STATE）

#### REQ-STATE-001: ゲーム状態インターフェース

**EARS形式**: Ubiquitous
**要件**: システムは `IGameState` インターフェースを提供しなければならない。

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| currentRank | GuildRank | 現在のランク |
| rankHp | number | 現在のランクHP |
| remainingDays | number | 残り日数 |
| currentDay | number | 現在の日数 |
| currentPhase | GamePhase | 現在のフェーズ |
| gold | number | 所持金 |
| comboCount | number | コンボカウント |
| actionPoints | number | 残り行動ポイント |
| isPromotionTest | boolean | 昇格試験中フラグ |
| promotionTestRemainingDays | number \| undefined | 昇格試験の残り日数 |

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| IGameState型が定義されている | TypeScriptコンパイル成功 |
| 全プロパティが正しく型付けされている | 型テスト |

#### REQ-STATE-002: デッキ状態インターフェース

**EARS形式**: Ubiquitous
**要件**: システムは `IDeckState` インターフェースを提供しなければならない。

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| deck | string[] | 山札 |
| hand | string[] | 手札 |
| discard | string[] | 捨て札 |
| ownedCards | string[] | 所持している全カード |

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| IDeckState型が定義されている | TypeScriptコンパイル成功 |

#### REQ-STATE-003: インベントリ状態インターフェース

**EARS形式**: Ubiquitous
**要件**: システムは `IInventoryState` インターフェースを提供しなければならない。

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| materials | IMaterialInstance[] | 素材リスト |
| craftedItems | ICraftedItem[] | 調合済みアイテムリスト |
| storageLimit | number | 素材保管上限 |

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| IInventoryState型が定義されている | TypeScriptコンパイル成功 |

#### REQ-STATE-004: 依頼状態インターフェース

**EARS形式**: Ubiquitous
**要件**: システムは `IQuestState` インターフェースを提供しなければならない。

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| activeQuests | IActiveQuest[] | 受注中の依頼リスト |
| todayClients | string[] | 今日の依頼者リスト |
| todayQuests | IQuest[] | 今日の依頼リスト |
| questLimit | number | 同時受注上限 |

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| IQuestState型が定義されている | TypeScriptコンパイル成功 |

---

### 2.7 イベント型定義（REQ-EVENTS）

#### REQ-EVENTS-001: ゲームイベントタイプ列挙型

**EARS形式**: Ubiquitous
**要件**: システムは `GameEventType` 列挙型を提供しなければならない。この列挙型は以下のカテゴリのイベントを含むこと。

- フェーズ関連: `PHASE_CHANGED`, `DAY_ENDED`, `DAY_STARTED`
- 依頼関連: `QUEST_ACCEPTED`, `QUEST_COMPLETED`, `QUEST_FAILED`, `QUEST_CANCELLED`
- 採取関連: `GATHERING_STARTED`, `GATHERING_COMPLETED`
- 調合関連: `ALCHEMY_STARTED`, `ALCHEMY_COMPLETED`
- カード関連: `CARD_DRAWN`, `CARD_PLAYED`, `CARD_DISCARDED`, `CARD_ADDED`
- ランク関連: `RANK_DAMAGED`, `RANK_HP_ZERO`, `PROMOTION_TEST_STARTED`, `PROMOTION_TEST_COMPLETED`, `RANK_UP`
- 経済関連: `GOLD_CHANGED`, `ITEM_PURCHASED`
- ゲーム進行関連: `GAME_STARTED`, `GAME_OVER`, `GAME_CLEARED`, `GAME_SAVED`, `GAME_LOADED`

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| GameEventType型が定義されている | TypeScriptコンパイル成功 |
| 全イベントタイプが使用可能 | 型テスト |

#### REQ-EVENTS-002: イベントペイロードインターフェース群

**EARS形式**: Ubiquitous
**要件**: システムは以下のイベントペイロードインターフェースを提供しなければならない。

- `IGameEvent` - 基底イベント
- `IPhaseChangedEvent` - フェーズ変更イベント
- `IQuestCompletedEvent` - 依頼完了イベント
- `IGatheringCompletedEvent` - 採取完了イベント
- `IAlchemyCompletedEvent` - 調合完了イベント
- `IRankDamagedEvent` - ランクダメージイベント
- `IRankUpEvent` - ランクアップイベント
- `IGameOverEvent` - ゲームオーバーイベント
- `IGameClearedEvent` - ゲームクリアイベント

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| 全イベント型が定義されている | TypeScriptコンパイル成功 |
| 各イベントが基底イベントを拡張している | 継承テスト |

---

### 2.8 セーブデータ型定義（REQ-SAVE）

#### REQ-SAVE-001: セーブデータインターフェース

**EARS形式**: Ubiquitous
**要件**: システムは `ISaveData` インターフェースを提供しなければならない。

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| version | string | セーブデータバージョン |
| lastSaved | string | 最終保存日時（ISO8601） |
| gameState | IGameState | ゲーム状態 |
| deckState | IDeckState | デッキ状態 |
| inventoryState | IInventoryState | インベントリ状態 |
| questState | IQuestState | 依頼状態 |
| artifacts | string[] | 所持アーティファクト |

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| ISaveData型が定義されている | TypeScriptコンパイル成功 |
| 全状態を包含している | 型テスト |

---

### 2.9 エラー型定義（REQ-ERRORS）

#### REQ-ERRORS-001: ドメインエラークラス

**EARS形式**: Ubiquitous
**要件**: システムは `DomainError` クラスを提供しなければならない。このクラスは `Error` を継承し、`code`, `message`, `details` プロパティを持つこと。

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| DomainErrorクラスが定義されている | コンパイル成功 |
| Errorクラスを継承している | インスタンステスト |
| codeプロパティが取得可能 | 単体テスト |

#### REQ-ERRORS-002: アプリケーションエラークラス

**EARS形式**: Ubiquitous
**要件**: システムは `ApplicationError` クラスを提供しなければならない。このクラスは `Error` を継承し、`userMessage`, `originalError` プロパティを持つこと。

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| ApplicationErrorクラスが定義されている | コンパイル成功 |
| Errorクラスを継承している | インスタンステスト |

#### REQ-ERRORS-003: エラーコード定義

**EARS形式**: Ubiquitous
**要件**: システムは `ErrorCodes` 定数オブジェクトを提供しなければならない。この定数は以下のカテゴリのエラーコードを含むこと。

- デッキ関連: `DECK_EMPTY`, `CARD_NOT_IN_HAND`
- 採取関連: `INSUFFICIENT_ACTION_POINTS`, `INVALID_GATHERING_STATE`
- 調合関連: `INSUFFICIENT_MATERIALS`, `INVALID_RECIPE`
- 依頼関連: `QUEST_NOT_FOUND`, `QUEST_EXPIRED`, `INVALID_DELIVERY`
- ショップ関連: `INSUFFICIENT_GOLD`, `ITEM_NOT_AVAILABLE`
- セーブ関連: `SAVE_FAILED`, `LOAD_FAILED`, `INVALID_SAVE_DATA`
- 状態関連: `INVALID_PHASE_TRANSITION`, `INVALID_STATE`

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| ErrorCodes定数が定義されている | コンパイル成功 |
| ErrorCode型が派生している | 型テスト |

---

### 2.10 ユーティリティ型定義（REQ-UTILS）

#### REQ-UTILS-001: DeepReadonly型

**EARS形式**: Ubiquitous
**要件**: システムは `DeepReadonly<T>` 型を提供しなければならない。この型はネストされたオブジェクトすべてを読み取り専用にすること。

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| DeepReadonly型が定義されている | コンパイル成功 |
| ネストされたプロパティが読み取り専用になる | 型テスト |
| 変更操作が型エラーになる | 型テスト |

#### REQ-UTILS-002: RequiredFields型

**EARS形式**: Ubiquitous
**要件**: システムは `RequiredFields<T, K>` 型を提供しなければならない。この型は指定したキーのみを必須にすること。

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| RequiredFields型が定義されている | コンパイル成功 |
| 指定キーのみが必須になる | 型テスト |

#### REQ-UTILS-003: NonNullableFields型

**EARS形式**: Ubiquitous
**要件**: システムは `NonNullableFields<T>` 型を提供しなければならない。この型はすべてのプロパティから `null | undefined` を除外すること。

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| NonNullableFields型が定義されている | コンパイル成功 |
| nullableが除外される | 型テスト |

---

### 2.11 定数定義（REQ-CONSTANTS）

#### REQ-CONSTANTS-001: 品質数値マップ

**EARS形式**: Ubiquitous
**要件**: システムは `QualityValue` 定数を提供しなければならない。この定数は `Quality` から数値へのマッピングを提供すること。

```typescript
QualityValue[Quality.D] === 1
QualityValue[Quality.C] === 2
QualityValue[Quality.B] === 3
QualityValue[Quality.A] === 4
QualityValue[Quality.S] === 5
```

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| QualityValue定数が定義されている | コンパイル成功 |
| 全品質レベルがマッピングされている | 単体テスト |

#### REQ-CONSTANTS-002: 品質補正マップ

**EARS形式**: Ubiquitous
**要件**: システムは `QualityMultiplier` 定数を提供しなければならない。この定数は `Quality` から補正値へのマッピングを提供すること。

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| QualityMultiplier定数が定義されている | コンパイル成功 |
| 全品質レベルがマッピングされている | 単体テスト |

#### REQ-CONSTANTS-003: ランク順序マップ

**EARS形式**: Ubiquitous
**要件**: システムは `RankOrder` 定数を提供しなければならない。この定数は `GuildRank` から順序値（0-7）へのマッピングを提供すること。

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| RankOrder定数が定義されている | コンパイル成功 |
| 全ランクがマッピングされている | 単体テスト |
| GからSへ昇順になっている | 単体テスト |

#### REQ-CONSTANTS-004: 初期パラメータ

**EARS形式**: Ubiquitous
**要件**: システムは `InitialParameters` 定数を提供しなければならない。この定数は以下のゲーム初期値を含むこと。

| パラメータ | 値 |
|-----------|-----|
| INITIAL_DECK_SIZE | 15 |
| DECK_LIMIT | 30 |
| HAND_LIMIT | 7 |
| ACTION_POINTS_PER_DAY | 3 |
| INITIAL_GOLD | 100 |
| INITIAL_STORAGE_LIMIT | 20 |
| MAX_ACTIVE_QUESTS | 3 |
| HAND_REFILL_COUNT | 5 |

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| InitialParameters定数が定義されている | コンパイル成功 |
| 全パラメータが正しい値を持つ | 単体テスト |
| as constで読み取り専用になっている | 型テスト |

---

### 2.12 エクスポート要件（REQ-EXPORT）

#### REQ-EXPORT-001: index.tsでの再エクスポート

**EARS形式**: Ubiquitous
**要件**: システムは `src/shared/types/index.ts` で全ての公開型を再エクスポートしなければならない。

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| index.tsが存在する | ファイル存在確認 |
| 全型・定数がエクスポートされている | インポートテスト |
| @shared/types からインポート可能 | パスエイリアステスト |

---

## 3. 非機能要件

### 3.1 コード品質要件

#### NFR-001: TypeScript厳格モード対応

**要件**: すべての型定義は `strict: true` モードでエラーなくコンパイルできること。

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| tsc --noEmit でエラーなし | CIパイプライン |
| strictNullChecks対応 | 型テスト |

#### NFR-002: JSDocコメント

**要件**: すべての公開型・インターフェース・列挙型にはJSDocコメントを付与すること。

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| 全公開シンボルにJSDocがある | コードレビュー |
| 設計文書の説明が転記されている | コードレビュー |

#### NFR-003: ESLint準拠

**要件**: すべてのコードがプロジェクトのESLint設定に準拠すること。

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| npm run lint でエラーなし | CIパイプライン |

### 3.2 保守性要件

#### NFR-004: 循環参照回避

**要件**: ファイル間の循環参照を避けること。必要に応じて `import type` を使用すること。

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| 循環参照エラーが発生しない | コンパイルテスト |

#### NFR-005: 単一責任

**要件**: 各ファイルは単一のドメイン概念に関する型のみを定義すること。

| 受け入れ基準 | 検証方法 |
|-------------|----------|
| ファイル分割が適切 | コードレビュー |

---

## 4. テスト戦略

### 4.1 テストカテゴリ

| カテゴリ | 内容 | ファイル |
|---------|------|----------|
| 型テスト | TypeScriptコンパイラによる型検証 | `*.test.ts` (tsd) |
| 単体テスト | エラークラス・定数のテスト | `*.test.ts` (vitest) |
| 統合テスト | インポート・エクスポートの検証 | `index.test.ts` |

### 4.2 テストファイル構成

```
src/shared/types/
├── __tests__/
│   ├── common.test.ts
│   ├── ids.test.ts
│   ├── cards.test.ts
│   ├── materials.test.ts
│   ├── quests.test.ts
│   ├── game-state.test.ts
│   ├── events.test.ts
│   ├── save-data.test.ts
│   ├── errors.test.ts
│   ├── utils.test.ts
│   └── index.test.ts
```

---

## 5. 実装順序

依存関係に基づく推奨実装順序:

1. **Phase 1: 依存なし**
   - `common.ts` - 列挙型
   - `ids.ts` - ID型
   - `errors.ts` - エラー型
   - `utils.ts` - ユーティリティ型

2. **Phase 2: 列挙型・ID型に依存**
   - `cards.ts` - カード型
   - `materials.ts` - 素材・アイテム型

3. **Phase 3: エンティティ型に依存**
   - `quests.ts` - 依頼型
   - `game-state.ts` - ゲーム状態型

4. **Phase 4: 全型に依存**
   - `events.ts` - イベント型
   - `save-data.ts` - セーブデータ型
   - `constants.ts` - 定数

5. **Phase 5: 統合**
   - `index.ts` - 再エクスポート

---

## 6. 変更履歴

| 日付 | バージョン | 変更内容 | 担当者 |
|------|----------|---------|--------|
| 2026-01-16 | 1.0.0 | 初版作成 | ずんだもん |

---

## 7. 付録

### 7.1 EARS記法について

本書では以下のEARS記法を使用している:

| 種類 | パターン | 説明 |
|------|---------|------|
| Ubiquitous | システムは〜しなければならない | 常に成り立つ要件 |
| Event-driven | 〜の場合、システムは〜する | イベントトリガー要件 |
| State-driven | 〜の状態において、システムは〜する | 状態依存要件 |
| Optional | 〜がある場合、システムは〜できる | オプション機能 |
| Complex | 上記の組み合わせ | 複合要件 |

### 7.2 用語集

| 用語 | 説明 |
|------|------|
| ブランド型 | TypeScriptで型レベルの区別を実現するテクニック |
| 型ガード | ユニオン型を絞り込むための関数 |
| EARS | Easy Approach to Requirements Syntax |
