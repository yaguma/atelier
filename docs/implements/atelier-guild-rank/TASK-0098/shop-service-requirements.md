# ショップドメインサービス 要件定義書

**タスクID**: TASK-0098
**機能名**: ShopService
**作成日**: 2026-01-04
**バージョン**: 1.0.0

---

## 1. 機能の概要

### 1.1 機能の説明

**🔵 青信号**: 要件定義書 Section 4.9 に詳細記載

ショップでのカード・素材・アーティファクト購入処理を担当するドメインサービス。プレイヤーはゴールドを消費して、ランクに応じた商品を購入できる。

- **何をする機能か**: ショップシステムにおける購入処理のビジネスロジックを提供する
- **どのような問題を解決するか**: ゲームの経済システムを管理し、プレイヤーがゴールドでデッキ強化できる手段を提供する
- **想定されるユーザー**: ゲームプレイヤー（錬金術師）
- **システム内での位置づけ**: Domain Layer - ショップの購入ビジネスロジックを担当

### 1.2 参照した要件・設計文書

- **参照したEARS要件**:
  - Section 4.9 ショップシステム
  - Section 3.5 共通操作（買い物する）
  - Section 1.3 フェーズ別行動コスト（買い物: 1コスト）
- **参照した設計文書**:
  - [core-systems.md Section 8 ShopService](../design/atelier-guild-rank/core-systems.md)
  - [shop.md ショップ画面 詳細設計](../design/atelier-guild-rank/ui-design/screens/shop.md)
  - [architecture.md Section 3 レイヤー構造](../design/atelier-guild-rank/architecture.md)

---

## 2. 入力・出力の仕様

### 2.1 主要インターフェース

**🔵 青信号**: core-systems.md Section 8.2 に詳細記載

```typescript
interface IShopService {
  /**
   * 購入可能な商品リストを取得
   * @returns 購入可能な商品一覧
   */
  getAvailableItems(): IShopItem[];

  /**
   * 商品を購入する
   * @param itemId 商品ID
   * @returns 購入結果
   */
  purchase(itemId: string): IPurchaseResult;

  /**
   * 商品を購入可能か判定
   * @param itemId 商品ID
   * @returns 購入可能ならtrue
   */
  canPurchase(itemId: string): boolean;

  /**
   * 商品の価格を取得
   * @param itemId 商品ID
   * @returns 価格（ゴールド）
   */
  getItemPrice(itemId: string): number;
}
```

### 2.2 データ構造

**🔵 青信号**: interfaces.ts と shop.md から抽出

```typescript
/**
 * ショップ商品アイテム
 */
interface IShopItem {
  /** 商品ID */
  id: string;
  /** 商品名 */
  name: string;
  /** 商品カテゴリ */
  category: ShopCategory;
  /** 価格（ゴールド） */
  price: number;
  /** 解放ランク */
  unlockRank: GuildRank;
  /** 在庫数（-1: 無制限） */
  stock: number;
  /** 購入時に得られるカードID（カテゴリがCARDの場合） */
  cardId?: string;
  /** 購入時に得られる素材ID（カテゴリがMATERIALの場合） */
  materialId?: string;
  /** 購入時に得られる素材品質（カテゴリがMATERIALの場合） */
  materialQuality?: Quality;
  /** 購入時に得られるアーティファクトID（カテゴリがARTIFACTの場合） */
  artifactId?: string;
}

/**
 * ショップカテゴリ
 */
enum ShopCategory {
  /** カードショップ */
  CARD = 'CARD',
  /** 素材ショップ */
  MATERIAL = 'MATERIAL',
  /** 強化カードショップ */
  ENHANCEMENT = 'ENHANCEMENT',
  /** アーティファクトショップ */
  ARTIFACT = 'ARTIFACT',
}

/**
 * 購入結果
 */
interface IPurchaseResult {
  /** 購入成功フラグ */
  success: boolean;
  /** 購入した商品 */
  item?: IShopItem;
  /** エラーメッセージ */
  error?: string;
  /** 購入後の所持金 */
  remainingGold: number;
}
```

### 2.3 入出力の関係性

**🔵 青信号**: core-systems.md から抽出

| メソッド | 入力 | 出力 | 説明 |
|---------|------|------|------|
| `getAvailableItems()` | なし | `IShopItem[]` | 現在ランクで購入可能な商品一覧 |
| `purchase(itemId)` | 商品ID | `IPurchaseResult` | 購入処理の実行結果 |
| `canPurchase(itemId)` | 商品ID | `boolean` | ゴールド・在庫・ランクチェック |
| `getItemPrice(itemId)` | 商品ID | `number` | 商品価格（ゴールド） |

### 2.4 データフロー

**🔵 青信号**: core-systems.md Section 8 から抽出

```
[UI] → getAvailableItems() → [ShopService] → [MasterDataLoader] → 商品データ
                                            → [GameState] → 現在ランク

[UI] → purchase(itemId) → [ShopService] → [GameState] → ゴールド確認
                                       → [MasterDataLoader] → 商品データ確認
                                       → [DeckService] → カード追加（カテゴリ=CARD）
                                       → [InventoryService] → 素材/アーティファクト追加
                                       → [GameState] → ゴールド減算
                                       → [ShopService] → 在庫減少
```

---

## 3. 制約条件

### 3.1 パフォーマンス要件

**🟡 黄信号**: 一般的なゲームシステムから妥当な推測

- 商品リスト取得は50ms以内に完了する
- 購入処理は100ms以内に完了する

### 3.2 ビジネスルール制約

**🔵 青信号**: 要件定義書 Section 4.9, shop.md から抽出

#### 購入可能条件
1. **ゴールド不足チェック**: 所持金 >= 商品価格
2. **在庫チェック**: stock > 0 または stock === -1（無制限）
3. **ランク解放チェック**: 現在ランク >= 商品のunlockRank
4. **デッキ上限チェック（カード購入時）**: デッキ枚数 < 30
5. **素材保管上限チェック（素材購入時）**: 素材枠に空きがある

#### 購入時の処理
1. ゴールドを商品価格分減算
2. カテゴリに応じた処理:
   - `CARD` → DeckServiceでデッキに追加
   - `ENHANCEMENT` → DeckServiceでデッキに追加
   - `MATERIAL` → InventoryServiceで素材追加
   - `ARTIFACT` → InventoryServiceでアーティファクト追加
3. 在庫が有限の場合は在庫を1減らす

### 3.3 アーキテクチャ制約

**🔵 青信号**: architecture.md Section 3 から抽出

- Clean Architecture 4層構造に準拠
- Domain層として実装（Presentation, Application層に依存しない）
- インターフェースを通じてInfrastructure層（MasterDataLoader）を参照

### 3.4 価格設定

**🔵 青信号**: 要件定義書 Section 4.9, Section 5.3 から抽出

| 商品種別 | 価格帯 | 詳細 |
|---------|--------|------|
| 基本採取地カード | 50〜100G | 初期ランク向け |
| 上級採取地カード | 150〜300G | 中級ランク以上 |
| 基本レシピカード | 80〜150G | 初期ランク向け |
| 上級レシピカード | 200〜400G | 中級ランク以上 |
| 基本強化カード | 80〜120G | 初期ランク向け |
| 上級強化カード | 150〜200G | 中級ランク以上 |
| 基本素材 | 10〜30G | 薬草、水、石など |
| 中級素材 | 30〜60G | 鉱石、キノコなど |
| レア素材 | 50〜100G | 火山石、魔法素材など |
| アーティファクト（コモン） | 300G | 錬金術師の眼鏡など |
| アーティファクト（レア） | 400G | 時の砂時計など |
| アーティファクト（エピック） | 500G | 伝説の釜など |

---

## 4. 想定される使用例

### 4.1 基本的な使用パターン

**🔵 青信号**: 要件定義書 Section 3.5, shop.md Section 7, 9 から抽出

#### シナリオ1: ショップ画面表示時

```typescript
// ショップ画面を開いたとき
const shopService = new ShopService(deckService, inventoryService, gameState, masterDataLoader);

// 購入可能な商品一覧を取得
const availableItems = shopService.getAvailableItems();

// 商品をカテゴリ別に表示
const cardItems = availableItems.filter(item => item.category === ShopCategory.CARD);
const materialItems = availableItems.filter(item => item.category === ShopCategory.MATERIAL);
// ...
```

#### シナリオ2: 商品購入

```typescript
// プレイヤーが「近くの森」カードを購入しようとする
const itemId = 'gathering_forest_basic';

// 購入可能かチェック
if (shopService.canPurchase(itemId)) {
  // 購入実行
  const result = shopService.purchase(itemId);

  if (result.success) {
    console.log(`購入成功！残りゴールド: ${result.remainingGold}G`);
    // UI更新処理
  } else {
    console.error(`購入失敗: ${result.error}`);
  }
}
```

#### シナリオ3: 素材購入

```typescript
// 素材「薬草(C)」を購入
const materialItemId = 'material_herb_c';

const result = shopService.purchase(materialItemId);

if (result.success) {
  // インベントリに素材が追加されている
  console.log('薬草を購入しました');
}
```

### 4.2 エッジケース

**🟡 黄信号**: 要件定義書と設計文書から妥当な推測

#### エッジケース1: ゴールド不足

```typescript
// 所持金: 50G、商品価格: 100Gの場合
const result = shopService.purchase('expensive_item');

// result.success === false
// result.error === 'ゴールドが不足しています'
```

#### エッジケース2: デッキ上限到達

```typescript
// デッキ枚数: 30枚の状態でカード購入
const result = shopService.purchase('card_item');

// result.success === false
// result.error === 'デッキが満杯です'
```

#### エッジケース3: ランク未解放

```typescript
// 現在ランク: G、商品解放ランク: Eの場合
const availableItems = shopService.getAvailableItems();

// 解放ランクE以上の商品は含まれない
```

#### エッジケース4: 在庫切れ

```typescript
// stock === 0 の商品を購入しようとする
const result = shopService.purchase('sold_out_item');

// result.success === false
// result.error === '在庫がありません'
```

### 4.3 エラーケース

**🟡 黄信号**: 一般的なエラーハンドリングから推測

```typescript
// 存在しない商品IDを指定
const result = shopService.purchase('non_existent_item');
// result.success === false
// result.error === '商品が見つかりません'

// 価格取得時に存在しない商品IDを指定
const price = shopService.getItemPrice('non_existent_item');
// 例外をスローまたは-1を返す（実装時に決定）
```

---

## 5. EARS要件・設計文書との対応関係

### 5.1 参照したユーザストーリー

**🔵 青信号**: 要件定義書 Section 3.5 共通操作

> プレイヤーはどのフェーズでも、行動ポイント1を消費してショップで買い物ができる

### 5.2 参照した機能要件

- **Section 4.9 ショップシステム**: カードショップ、素材ショップ、強化カードショップ、アーティファクトショップの4カテゴリ
- **Section 1.3 フェーズ別行動コスト**: 買い物は1コスト
- **Section 5.3 経済バランス**: 商品価格一覧

### 5.3 参照した非機能要件

**🟡 黄信号**: 一般的なゲームシステムから推測

- パフォーマンス: 商品リスト取得は50ms以内、購入処理は100ms以内
- 堅牢性: 不正な購入を防ぐバリデーション実装

### 5.4 参照したEdgeケース

**🟡 黄信号**: 設計文書 shop.md Section 5.2 から推測

- ゴールド不足
- ランク未到達
- 在庫切れ
- デッキ満杯

### 5.5 参照した受け入れ基準

**🔵 青信号**: TASK-0098 から抽出

- [x] 全テストケースが通過する
- [x] ショップのビジネスルールが正しく実装されている
- [x] ランクに応じた商品フィルタリングが正しく動作する
- [x] 購入処理（ゴールド消費、アイテム追加）が正しく動作する
- [x] ゴールド不足チェックが正しく動作する

### 5.6 参照した設計文書

- **アーキテクチャ**: [architecture.md Section 3 レイヤー構造]
- **データフロー**: [core-systems.md Section 12 システム間の依存関係図]
- **型定義**: [interfaces.ts IShopItem, ShopCategory定義]
- **UI設計**: [shop.md ショップ画面 詳細設計]
- **コアシステム**: [core-systems.md Section 8 ShopService]

---

## 6. 実装時の注意事項

### 6.1 依存サービス

**🔵 青信号**: core-systems.md Section 12 から抽出

ShopServiceは以下のサービスに依存する:

- `IDeckService`: カード購入時にデッキへ追加
- `IInventoryService`: 素材・アーティファクト購入時にインベントリへ追加
- `IGameState`: 現在ランク、所持金の参照・更新
- `IMasterDataLoader`: 商品マスターデータの読み込み

### 6.2 イミュータブル設計

**🟡 黄信号**: 既存実装パターン（DeckService, InventoryService）から推測

- GameStateは直接変更せず、新しい状態を返す
- 購入処理は副作用として他サービスを呼び出すが、結果は明示的に返す

### 6.3 在庫管理

**🔵 青信号**: shop.md Section 4 から推測

- 在庫数 `-1` は無制限在庫を表す
- 購入時、在庫が有限(`stock > 0`)の場合は`stock--`

---

## 品質判定

### チェックリスト

- ✅ 要件の曖昧さ: なし（EARS要件定義書と設計文書に明確に記載）
- ✅ 入出力定義: 完全（interfaces.ts, core-systems.mdに詳細定義）
- ✅ 制約条件: 明確（購入可能条件、価格設定が明記）
- ✅ 実装可能性: 確実（既存サービスのパターンを踏襲可能）

### 判定結果

**✅ 高品質**

すべての要件がEARS要件定義書・設計文書に明確に定義されており、実装に必要な情報がすべて揃っている。

---

## 次のステップ

次のお勧めステップ: `/tdd-testcases` でテストケースの洗い出しを行います。
