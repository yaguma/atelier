# TDD Greenフェーズ記録: カードエンティティ・DeckService

**機能名**: カードエンティティ・DeckService
**タスクID**: TASK-0009
**要件名**: atelier-guild-rank
**作成日**: 2026-01-16
**フェーズ**: Green（最小実装）

---

## 1. 実装したファイル一覧

### 1.1 新規作成ファイル

| ファイルパス | 概要 | 行数 |
|------------|------|------|
| `atelier-guild-rank/src/domain/entities/Card.ts` | Cardエンティティ | 142行 |
| `atelier-guild-rank/src/domain/interfaces/deck-service.interface.ts` | IDeckServiceインターフェース | 163行 |
| `atelier-guild-rank/src/application/services/deck-service.ts` | DeckService実装 | 368行 |

### 1.2 更新ファイル

| ファイルパス | 変更内容 |
|------------|----------|
| `atelier-guild-rank/src/domain/entities/index.ts` | Cardエクスポート追加 |
| `atelier-guild-rank/src/domain/interfaces/index.ts` | IDeckServiceエクスポート追加 |
| `atelier-guild-rank/src/application/services/index.ts` | DeckServiceエクスポート追加 |

---

## 2. テスト実行結果

### 2.1 全テスト成功

```bash
$ pnpm test tests/unit/domain/entities/Card.test.ts tests/unit/application/services/deck-service.test.ts

 ✓ tests/unit/domain/entities/Card.test.ts (8 tests) 6ms
 ✓ tests/unit/application/services/deck-service.test.ts (10 tests) 8ms

Test Files  2 passed (2)
Tests  18 passed (18)
Start at  11:24:08
Duration  4.86s
```

### 2.2 テストケース詳細

#### Cardエンティティ（8個全て成功）

| テストID | テスト内容 | 結果 |
|---------|----------|------|
| T-CARD-01 | コンストラクタでCardインスタンスを生成 | ✅ |
| T-CARD-02 | get name()でカード名を取得 | ✅ |
| T-CARD-03 | get type()でカード種別を取得 | ✅ |
| T-CARD-04 | get cost()でコストを取得 | ✅ |
| T-CARD-05 | isGatheringCard()で採取地カード判定 | ✅ |
| T-CARD-06 | isRecipeCard()でレシピカード判定 | ✅ |
| T-CARD-07 | isEnhancementCard()で強化カード判定 | ✅ |
| T-CARD-08 | 異なる種別のカードでは型ガードがfalseを返す | ✅ |

#### DeckService（10個全て成功）

| テストID | テスト内容 | 結果 |
|---------|----------|------|
| T-0009-01 | initialize()で初期デッキ構築 | ✅ |
| T-DECK-01 | reset()で状態リセット | ✅ |
| T-0009-02 | shuffle()でランダムにシャッフル | ✅ |
| T-0009-03 | draw()で手札にカードが追加される | ✅ |
| T-0009-04 | デッキ枯渇時のドロー（捨て札をシャッフル） | ✅ |
| T-0009-05 | playCard()で手札から捨て札に移動 | ✅ |
| T-DECK-02 | discardHand()で手札を全て捨て札に移動 | ✅ |
| T-0009-06 | refillHand()で手札を5枚まで補充 | ✅ |
| T-DECK-04 | addCard()でカードをデッキに追加 | ✅ |
| T-DECK-05 | removeCard()でカードをデッキから削除 | ✅ |

---

## 3. 実装方針

### 3.1 Cardエンティティ

**実装方針**: 🔵 青信号
- CardIDとCardMasterをreadonly プロパティとして保持
- getterメソッドでname、type、costを公開
- GATHERINGカードはbaseCost、それ以外はcostを返す
- 型ガードメソッドで型安全性を確保

**主要実装内容**:
```typescript
export class Card {
  constructor(
    public readonly id: CardId,
    public readonly master: CardMaster,
  ) {}

  get name(): string {
    return this.master.name;
  }

  get type(): string {
    return this.master.type;
  }

  get cost(): number {
    if (this.master.type === 'GATHERING') {
      return this.master.baseCost;
    }
    return this.master.cost;
  }

  isGatheringCard(): this is Card & { master: IGatheringCardMaster } {
    return this.master.type === 'GATHERING';
  }

  isRecipeCard(): this is Card & { master: IRecipeCardMaster } {
    return this.master.type === 'RECIPE';
  }

  isEnhancementCard(): this is Card & { master: IEnhancementCardMaster } {
    return this.master.type === 'ENHANCEMENT';
  }
}
```

### 3.2 IDeckServiceインターフェース

**実装方針**: 🔵 青信号
- デッキ操作メソッド: initialize, reset, shuffle, draw, playCard, discardHand, refillHand
- 状態取得メソッド: getDeck, getHand, getDiscard, getHandSize
- デッキ構築メソッド: addCard, removeCard

### 3.3 DeckService実装

**実装方針**: 🔵 青信号
- Fisher-Yatesアルゴリズムでシャッフル
- デッキ枯渇時に自動的に捨て札をシャッフルして山札に戻す
- 手札上限は5枚（HAND_SIZE定数）
- readonly配列で不変性を保証

**主要実装内容**:
```typescript
export class DeckService implements IDeckService {
  private readonly HAND_SIZE = 5;
  private deck: Card[] = [];
  private hand: Card[] = [];
  private discard: Card[] = [];

  constructor(
    private readonly masterDataRepo: IMasterDataRepository,
    private readonly _eventBus: IEventBus,
  ) {}

  // Fisher-Yatesシャッフル
  shuffle(): void {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  // デッキ枯渇時の自動リシャッフル対応
  draw(count: number): Card[] {
    const drawn: Card[] = [];
    for (let i = 0; i < count; i++) {
      if (this.deck.length === 0 && this.discard.length > 0) {
        this.reshuffleDiscard();
      }
      if (this.deck.length === 0) {
        break;
      }
      const card = this.deck.pop();
      if (card) {
        this.hand.push(card);
        drawn.push(card);
      }
    }
    return drawn;
  }

  // 捨て札を山札にシャッフル
  private reshuffleDiscard(): void {
    this.deck = [...this.discard];
    this.discard = [];
    this.shuffle();
  }

  // 不変性を保証（readonly配列を返す）
  getDeck(): readonly Card[] {
    return [...this.deck];
  }

  getHand(): readonly Card[] {
    return [...this.hand];
  }

  getDiscard(): readonly Card[] {
    return [...this.discard];
  }
}
```

---

## 4. コード品質チェック

### 4.1 Lint結果

```bash
$ pnpm lint --write

Checked 79 files in 116ms. Fixed 6 files.
Found 9 warnings.
```

**修正内容**:
- 未使用のインポートを削除
- `any`型を`unknown`型に変更
- インポートの並び順を修正

**残りの警告**:
- `_eventBus`が未使用（将来的にイベント発行機能で使用予定）
- 他のファイルの既存警告（本タスクとは無関係）

### 4.2 TypeScript型チェック

- 全ての型が正しく定義されている
- 型ガードが正しく機能している
- readonly配列で不変性が保証されている

---

## 5. 実装の特徴

### 5.1 優れている点

✅ **テストが全て成功**
- 18個のテストケースが全て通過
- Cardエンティティの型ガードが正しく動作
- DeckServiceの全機能が期待通りに動作

✅ **シンプルで読みやすい実装**
- 必要最小限の機能のみを実装
- 日本語コメントで実装意図が明確
- 信頼性レベル（🔵）をコメントで明記

✅ **不変性の保証**
- getDeck(), getHand(), getDiscard()がreadonly配列を返す
- 外部からの変更を防ぐ

✅ **Fisher-Yatesアルゴリズム**
- 公平なランダムシャッフル
- 時間計算量O(n)、空間計算量O(1)

✅ **デッキ枯渇時の自動リシャッフル**
- 捨て札が自動的にシャッフルされて山札に戻る
- プレイヤー体験を維持

### 5.2 改善候補（Refactorフェーズで対応）

🔄 **イベント発行機能**
- 現在は`_eventBus`が未使用
- CARD_DRAWN、CARD_PLAYED、CARD_DISCARDEDイベントの発行

🔄 **エラーハンドリング**
- 存在しないカードIDの追加時にエラー
- デッキ上限超過時にエラー
- 手札にないカードをプレイ時にエラー

🔄 **ファイルサイズ**
- deck-service.ts: 368行（800行以下なので問題なし）

---

## 6. 課題・改善点

### 6.1 Greenフェーズで対応しなかった項目

以下の項目はRefactorフェーズで対応する予定：

1. **イベント発行機能**（🟡 黄信号）
   - CARD_DRAWNイベント（ドロー時）
   - CARD_PLAYEDイベント（カードプレイ時）
   - CARD_DISCARDEDイベント（手札破棄時）
   - HAND_REFILLEDイベント（手札補充時）

2. **エラーハンドリング**（🟡 黄信号）
   - `ErrorCodes.INVALID_CARD_ID`: 存在しないカードID
   - `ErrorCodes.DECK_FULL`: デッキ上限超過
   - `ErrorCodes.CARD_NOT_IN_HAND`: 手札にないカードをプレイ
   - `ErrorCodes.DATA_NOT_LOADED`: マスターデータ未読み込み

3. **境界値テスト**（🟡 黄信号）
   - デッキ上限30枚のチェック
   - draw(0)、draw(-1)の動作確認

### 6.2 実装時の判断

**最小限の実装を優先**
- テストを通すことを最優先
- イベント発行、エラーハンドリングは後回し
- シンプルで理解しやすいコードを心がけた

---

## 7. 品質判定結果

### 7.1 判定基準

| 項目 | 状態 | 評価 |
|------|------|------|
| テスト結果 | 18個全て成功 | ✅ |
| 実装品質 | シンプルかつ動作する | ✅ |
| リファクタ箇所 | 明確に特定可能 | ✅ |
| 機能的問題 | なし | ✅ |
| コンパイルエラー | なし | ✅ |
| ファイルサイズ | 800行以下 | ✅ |
| モック使用 | 実装コードに含まれていない | ✅ |

### 7.2 総合評価

**✅ 高品質**

- テストが全て成功（18/18）
- 実装がシンプルで理解しやすい
- リファクタリング箇所が明確
- 機能的な問題がない
- コンパイルエラーがない
- ファイルサイズが800行以下
- 実装コードにモック・スタブが含まれていない

---

## 8. 次のステップ

### 8.1 Refactorフェーズで実施する内容

1. **イベント発行機能の実装**
   - EventBusを使用してCARD_DRAWN、CARD_PLAYED、CARD_DISCARDEDイベントを発行
   - テストケースでイベント発行を確認

2. **エラーハンドリングの実装**
   - ApplicationErrorを使用してエラーを投げる
   - ErrorCodesで定義されたコードを使用
   - テストケースでエラーハンドリングを確認

3. **境界値テストの追加**
   - デッキ上限30枚のテスト
   - draw(0)、draw(-1)のテスト

4. **コード品質の改善**
   - コメントの見直し
   - パフォーマンスの最適化

### 8.2 推奨コマンド

```bash
# 次のステップ: Refactorフェーズ（品質改善）
/tsumiki:tdd-refactor atelier-guild-rank TASK-0009

# テスト実行（確認用）
pnpm test tests/unit/domain/entities/Card.test.ts
pnpm test tests/unit/application/services/deck-service.test.ts

# 全テスト実行
pnpm test

# カバレッジ確認
pnpm test:coverage
```

---

**最終更新**: 2026-01-16
**次のお勧めステップ**: `/tsumiki:tdd-refactor atelier-guild-rank TASK-0009` でRefactorフェーズ（品質改善）を開始します。
