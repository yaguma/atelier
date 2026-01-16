# TDD Redフェーズ記録: カードエンティティ・DeckService

**機能名**: カードエンティティ・DeckService
**タスクID**: TASK-0009
**要件名**: atelier-guild-rank
**作成日**: 2026-01-16
**フェーズ**: Red（失敗するテスト作成）

---

## 1. 作成したテストケース一覧

### 1.1 Cardエンティティ（8個）

| テストID | テスト内容 | 信頼性 | 実装ファイル |
|---------|----------|--------|------------|
| T-CARD-01 | コンストラクタでCardインスタンスを生成 | 🔵 | `tests/unit/domain/entities/Card.test.ts` |
| T-CARD-02 | get name()でカード名を取得 | 🔵 | `tests/unit/domain/entities/Card.test.ts` |
| T-CARD-03 | get type()でカード種別を取得 | 🔵 | `tests/unit/domain/entities/Card.test.ts` |
| T-CARD-04 | get cost()でコストを取得 | 🔵 | `tests/unit/domain/entities/Card.test.ts` |
| T-CARD-05 | isGatheringCard()で採取地カード判定 | 🔵 | `tests/unit/domain/entities/Card.test.ts` |
| T-CARD-06 | isRecipeCard()でレシピカード判定 | 🔵 | `tests/unit/domain/entities/Card.test.ts` |
| T-CARD-07 | isEnhancementCard()で強化カード判定 | 🔵 | `tests/unit/domain/entities/Card.test.ts` |
| T-CARD-08 | 異なる種別のカードでは型ガードがfalseを返す | 🔵 | `tests/unit/domain/entities/Card.test.ts` |

### 1.2 DeckService（10個）

| テストID | テスト内容 | 信頼性 | 実装ファイル |
|---------|----------|--------|------------|
| T-0009-01 | initialize()で初期デッキ構築 | 🔵 | `tests/unit/application/services/deck-service.test.ts` |
| T-DECK-01 | reset()で状態リセット | 🔵 | `tests/unit/application/services/deck-service.test.ts` |
| T-0009-02 | shuffle()でランダムにシャッフル | 🔵 | `tests/unit/application/services/deck-service.test.ts` |
| T-0009-03 | draw()で手札にカードが追加される | 🔵 | `tests/unit/application/services/deck-service.test.ts` |
| T-0009-04 | デッキ枯渇時のドロー（捨て札をシャッフル） | 🔵 | `tests/unit/application/services/deck-service.test.ts` |
| T-0009-05 | playCard()で手札から捨て札に移動 | 🔵 | `tests/unit/application/services/deck-service.test.ts` |
| T-DECK-02 | discardHand()で手札を全て捨て札に移動 | 🔵 | `tests/unit/application/services/deck-service.test.ts` |
| T-0009-06 | refillHand()で手札を5枚まで補充 | 🔵 | `tests/unit/application/services/deck-service.test.ts` |
| T-DECK-04 | addCard()でカードをデッキに追加 | 🔵 | `tests/unit/application/services/deck-service.test.ts` |
| T-DECK-05 | removeCard()でカードをデッキから削除 | 🔵 | `tests/unit/application/services/deck-service.test.ts` |

### 1.3 統計

- **合計テストケース数**: 18個
- **信頼性レベル**: 🔵（青信号）18個（100%）
- **テストケース追加目標数**: 10以上 → ✅ 達成（18個）

---

## 2. テストファイルの配置

### 2.1 作成したファイル

- `atelier-guild-rank/tests/unit/domain/entities/Card.test.ts` - **新規作成**
- `atelier-guild-rank/tests/unit/application/services/deck-service.test.ts` - **新規作成**

### 2.2 必要な実装ファイル（未作成）

以下のファイルは実装が必要（Greenフェーズで作成）：
- `atelier-guild-rank/src/domain/entities/Card.ts` - **Cardエンティティ**
- `atelier-guild-rank/src/domain/interfaces/deck-service.interface.ts` - **IDeckServiceインターフェース**
- `atelier-guild-rank/src/application/services/deck-service.ts` - **DeckService実装**

---

## 3. 期待される失敗内容

### 3.1 Cardエンティティのテスト

**エラーメッセージ**:
```
Error: Failed to resolve import "@domain/entities/Card" from "tests/unit/domain/entities/Card.test.ts". Does the file exist?
```

**失敗の理由**:
- `src/domain/entities/Card.ts` が存在しないため、インポートに失敗

**期待される動作**:
- Cardエンティティが実装されると、全8個のテストケースが実行可能になる

### 3.2 DeckServiceのテスト

**エラーメッセージ**:
```
Error: Failed to resolve import "@application/services/deck-service" from "tests/unit/application/services/deck-service.test.ts". Does the file exist?
```

**失敗の理由**:
- `src/application/services/deck-service.ts` が存在しないため、インポートに失敗

**期待される動作**:
- DeckServiceが実装されると、全10個のテストケースが実行可能になる

### 3.3 テスト実行結果

```bash
# Cardエンティティのテスト実行
$ pnpm test tests/unit/domain/entities/Card.test.ts

Test Files  1 failed (1)
Tests  no tests
Start at  11:14:39
Duration  4.02s (transform 34ms, setup 66ms, import 0ms, tests 0ms, environment 3.49s)

# DeckServiceのテスト実行
$ pnpm test tests/unit/application/services/deck-service.test.ts

Test Files  1 failed (1)
Tests  no tests
Start at  11:14:55
Duration  4.16s (transform 35ms, setup 68ms, import 0ms, tests 0ms, environment 3.60s)
```

---

## 4. Greenフェーズで実装すべき内容

### 4.1 Cardエンティティ

#### 4.1.1 実装ファイル
- `atelier-guild-rank/src/domain/entities/Card.ts`

#### 4.1.2 実装要件
- **コンストラクタ**: `id: CardId` と `master: CardMaster` を受け取る
- **getterメソッド**:
  - `get name(): string` - master.nameを返す
  - `get type(): CardType` - master.typeを返す
  - `get cost(): number` - master.costまたはbaseCostを返す
- **型ガードメソッド**:
  - `isGatheringCard(): this is Card & { master: IGatheringCardMaster }` - type === 'GATHERING'を判定
  - `isRecipeCard(): this is Card & { master: IRecipeCardMaster }` - type === 'RECIPE'を判定
  - `isEnhancementCard(): this is Card & { master: IEnhancementCardMaster }` - type === 'ENHANCEMENT'を判定

### 4.2 IDeckServiceインターフェース

#### 4.2.1 実装ファイル
- `atelier-guild-rank/src/domain/interfaces/deck-service.interface.ts`

#### 4.2.2 実装要件
- **デッキ操作メソッド**:
  - `initialize(cardIds: CardId[]): void` - 初期デッキ構築
  - `reset(): void` - 状態リセット
  - `shuffle(): void` - シャッフル
  - `draw(count: number): Card[]` - ドロー
  - `playCard(card: Card): void` - カードプレイ
  - `discardHand(): void` - 手札破棄
  - `refillHand(): void` - 手札補充
  - `addCard(cardId: CardId): void` - カード追加
  - `removeCard(cardId: CardId): void` - カード削除
- **状態取得メソッド**:
  - `getDeck(): readonly Card[]` - 山札取得
  - `getHand(): readonly Card[]` - 手札取得
  - `getDiscard(): readonly Card[]` - 捨て札取得
  - `getHandSize(): number` - 手札枚数取得

### 4.3 DeckService実装

#### 4.3.1 実装ファイル
- `atelier-guild-rank/src/application/services/deck-service.ts`

#### 4.3.2 実装要件
- **依存注入**:
  - `masterDataRepo: IMasterDataRepository` - マスターデータ取得
  - `eventBus: IEventBus` - イベント発行
- **プライベートプロパティ**:
  - `deck: Card[]` - 山札
  - `hand: Card[]` - 手札
  - `discard: Card[]` - 捨て札
  - `HAND_SIZE = 5` - 手札上限
  - `MAX_DECK_SIZE = 30` - デッキ上限
- **主要メソッド実装**:
  - `initialize()` - カードIDからCardインスタンスを生成し、シャッフル
  - `reset()` - 全配列をクリア
  - `shuffle()` - Fisher-Yatesアルゴリズムで山札をシャッフル
  - `draw()` - 山札から手札にカードを移動（デッキ枯渇時は捨て札をシャッフル）
  - `playCard()` - 手札から捨て札にカードを移動
  - `discardHand()` - 手札を全て捨て札に移動
  - `refillHand()` - 手札が5枚になるまでドロー
  - `addCard()` - マスターデータからCardインスタンスを生成し、デッキに追加
  - `removeCard()` - デッキから指定カードIDの最初の1枚を削除

---

## 5. 次のステップ

### 5.1 推奨アクション

Redフェーズが完了しました。次のステップは以下の通りです：

1. **Greenフェーズ（最小実装）**: `/tsumiki:tdd-green atelier-guild-rank TASK-0009`
   - テストをパスする最小限の実装を作成
   - Cardエンティティ、IDeckServiceインターフェース、DeckServiceを実装

2. **Refactorフェーズ（リファクタリング）**: `/tsumiki:tdd-refactor atelier-guild-rank TASK-0009`
   - テストが通る状態を保ちながら、コード品質を改善
   - コードの整理、最適化、ドキュメント追加

### 5.2 参考コマンド

```bash
# 次のステップ: Greenフェーズ（最小実装）
/tsumiki:tdd-green atelier-guild-rank TASK-0009

# テスト実行（実装後）
pnpm test tests/unit/domain/entities/Card.test.ts
pnpm test tests/unit/application/services/deck-service.test.ts

# 全テスト実行
pnpm test

# カバレッジ確認
pnpm test:coverage
```

---

## 6. 品質判定結果

### 6.1 判定基準

| 項目 | 状態 | 評価 |
|------|------|------|
| テスト実行 | 実行可能で失敗する | ✅ |
| 期待値 | 明確で具体的 | ✅ |
| アサーション | 適切 | ✅ |
| 実装方針 | 明確 | ✅ |
| 信頼性レベル | 🔵（青信号）100% | ✅ |

### 6.2 総合評価

**✅ 高品質**

- テストケースが明確で具体的
- Given-When-Thenパターンに従った構造化
- 日本語コメントで目的・内容・期待動作を明記
- 信頼性レベルが全て🔵（青信号）
- 実装方針が明確で、次のステップに進める状態

---

## 7. 補足情報

### 7.1 テスト構造

#### Given-When-Thenパターン

すべてのテストケースで以下のパターンを採用：

```typescript
it('テストケース名', () => {
  // 【テスト目的】: ...
  // 【テスト内容】: ...
  // 【期待される動作】: ...
  // 🔵 信頼性レベル: ...

  // Given: 【テストデータ準備】
  const input = ...;

  // When: 【実際の処理実行】
  const result = functionUnderTest(input);

  // Then: 【結果検証】
  expect(result).toBe(...); // 【確認内容】: ...
});
```

### 7.2 モックデータ

テストで使用するモックデータ：

```typescript
// Cardエンティティテスト用
const mockGatheringCardMaster: CardMaster = {
  id: toCardId('gathering_backyard'),
  name: '裏庭',
  type: 'GATHERING',
  baseCost: 0,
  // ...
};

// DeckServiceテスト用
const mockCardMasters: Record<string, CardMaster> = {
  'card-001': { /* ... */ },
  'card-002': { /* ... */ },
  'card-003': { /* ... */ },
};
```

---

**最終更新**: 2026-01-16
**次のお勧めステップ**: `/tsumiki:tdd-green atelier-guild-rank TASK-0009` でGreenフェーズ（最小実装）を開始します。
