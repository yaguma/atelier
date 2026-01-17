# TDD要件定義書: TASK-0016 ShopService・ArtifactService実装

**作成日**: 2026-01-18
**タスクID**: TASK-0016
**フェーズ**: 2 - ドメイン層・コアサービス

---

## 1. 機能要件

### 1.1 ShopService

#### REQ-SHOP-001: ショップアイテム一覧取得 🔵

**機能**: 購入可能なアイテム一覧を取得する

**入力**:
- 現在のギルドランク

**出力**:
- 購入可能なショップアイテムの配列

**処理**:
1. マスターデータからショップアイテムを取得
2. ランクによる解放条件でフィルタリング
3. 在庫切れアイテムを除外

#### REQ-SHOP-002: 購入可能判定 🔵

**機能**: 指定アイテムが購入可能か判定する

**入力**:
- itemId: ショップアイテムID
- 現在のゴールド
- 現在のランク

**出力**:
- boolean: 購入可能かどうか

**処理**:
1. アイテムが存在するか確認
2. ランクによる解放条件を確認
3. ゴールドが十分か確認
4. 在庫があるか確認

#### REQ-SHOP-003: 購入処理 🔵

**機能**: ショップアイテムを購入する

**入力**:
- itemId: ショップアイテムID

**出力**:
- IPurchaseResult: 購入結果

**処理**:
1. 購入可能判定
2. ゴールド消費
3. アイテム種別に応じた処理:
   - card: デッキに追加
   - material: インベントリに追加
   - artifact: アーティファクト追加
4. 在庫を減らす（有限の場合）

**例外**:
- ゴールド不足
- 在庫切れ
- ランク不足

#### REQ-SHOP-004: 価格取得 🔵

**機能**: アイテムの価格を取得する

**入力**:
- itemId: ショップアイテムID

**出力**:
- number: 価格

---

### 1.2 ArtifactService

#### REQ-ART-001: 所持アーティファクト取得 🔵

**機能**: 所持しているアーティファクトのリストを取得する

**入力**: なし

**出力**:
- string[]: アーティファクトIDの配列

#### REQ-ART-002: アーティファクト追加 🔵

**機能**: アーティファクトを所持リストに追加する

**入力**:
- artifactId: アーティファクトID

**処理**:
1. 既に所持しているか確認（重複不可）
2. インベントリに追加

**例外**:
- 既に所持している場合

#### REQ-ART-003: 品質ボーナス計算 🔵

**機能**: 調合時の品質ボーナスを計算する

**入力**: なし

**出力**:
- number: 品質ボーナス値

**処理**:
1. 所持アーティファクトを取得
2. QUALITY_UP効果を持つアーティファクトの値を合計
3. ALL_BONUS効果も加算

#### REQ-ART-004: 採取ボーナス計算 🟡

**機能**: 採取時のボーナスを計算する

**入力**: なし

**出力**:
- number: 採取ボーナス値

#### REQ-ART-005: 貢献度ボーナス計算 🔵

**機能**: 納品時の貢献度ボーナスを計算する

**入力**: なし

**出力**:
- number: 貢献度ボーナス（%）

#### REQ-ART-006: ゴールドボーナス計算 🔵

**機能**: 報酬金のボーナスを計算する

**入力**: なし

**出力**:
- number: ゴールドボーナス（%）

#### REQ-ART-007: 倉庫拡張ボーナス計算 🔵

**機能**: 素材保管枠の拡張ボーナスを計算する

**入力**: なし

**出力**:
- number: 倉庫拡張枠数

#### REQ-ART-008: 行動ポイントボーナス計算 🔵

**機能**: 1日あたりの追加行動ポイントを計算する

**入力**: なし

**出力**:
- number: 追加行動ポイント

#### REQ-ART-009: レア確率ボーナス計算 🔵

**機能**: レア素材の出現確率ボーナスを計算する

**入力**: なし

**出力**:
- number: レア確率ボーナス（%）

#### REQ-ART-010: 調合コスト削減計算 🔵

**機能**: 調合コストの削減値を計算する

**入力**: なし

**出力**:
- number: 調合コスト削減値

#### REQ-ART-011: 提示回数ボーナス計算 🔵

**機能**: 採取時の提示回数ボーナスを計算する

**入力**: なし

**出力**:
- number: 提示回数ボーナス

---

## 2. 受け入れ基準

### 2.1 ShopService

| 基準ID | 説明 | 必須/推奨 |
|--------|------|----------|
| AC-SHOP-01 | カードの購入ができる | 必須 |
| AC-SHOP-02 | 素材の購入ができる | 必須 |
| AC-SHOP-03 | アーティファクトの購入ができる | 必須 |
| AC-SHOP-04 | ゴールド不足時は購入不可 | 必須 |
| AC-SHOP-05 | 在庫切れ時は購入不可 | 必須 |
| AC-SHOP-06 | ランク不足時は購入不可 | 推奨 |
| AC-SHOP-07 | 購入後ゴールドが正しく減少する | 必須 |
| AC-SHOP-08 | 購入後在庫が正しく減少する | 必須 |

### 2.2 ArtifactService

| 基準ID | 説明 | 必須/推奨 |
|--------|------|----------|
| AC-ART-01 | 品質ボーナスが正しく計算される | 必須 |
| AC-ART-02 | 貢献度ボーナスが正しく計算される | 必須 |
| AC-ART-03 | ゴールドボーナスが正しく計算される | 必須 |
| AC-ART-04 | 倉庫拡張ボーナスが正しく計算される | 必須 |
| AC-ART-05 | 行動ポイントボーナスが正しく計算される | 必須 |
| AC-ART-06 | レア確率ボーナスが正しく計算される | 必須 |
| AC-ART-07 | 調合コスト削減が正しく計算される | 必須 |
| AC-ART-08 | 提示回数ボーナスが正しく計算される | 必須 |
| AC-ART-09 | ALL_BONUS効果が全効果に適用される | 必須 |
| AC-ART-10 | 複数アーティファクトの効果が累積する | 必須 |

---

## 3. エラーハンドリング

### 3.1 ShopService

| エラー | コード | 条件 |
|--------|-------|------|
| INSUFFICIENT_GOLD | INVALID_OPERATION | ゴールド不足 |
| OUT_OF_STOCK | INVALID_OPERATION | 在庫切れ |
| RANK_REQUIRED | INVALID_OPERATION | ランク不足 |
| ITEM_NOT_FOUND | NOT_FOUND | アイテムが存在しない |

### 3.2 ArtifactService

| エラー | コード | 条件 |
|--------|-------|------|
| ALREADY_OWNED | INVALID_OPERATION | 既に所持している |
| ARTIFACT_NOT_FOUND | NOT_FOUND | アーティファクトが存在しない |

---

## 4. インターフェース設計

### 4.1 IShopService

```typescript
interface IShopService {
  // ショップアイテム一覧取得
  getAvailableItems(currentRank: GuildRank): IShopItem[];

  // 購入可能判定
  canPurchase(itemId: string, currentGold: number, currentRank: GuildRank): boolean;

  // 購入処理
  purchase(itemId: string): IPurchaseResult;

  // 価格取得
  getItemPrice(itemId: string): number;
}

interface IShopItem {
  id: string;
  type: 'card' | 'material' | 'artifact';
  itemId: string;
  name: string;
  price: number;
  stock: number;
  unlockRank: GuildRank;
  description: string;
}

interface IPurchaseResult {
  success: boolean;
  itemId: string;
  remainingGold: number;
  remainingStock: number;
  errorMessage?: string;
}
```

### 4.2 IArtifactService

```typescript
interface IArtifactService {
  // 所持アーティファクト取得
  getOwnedArtifacts(): ArtifactId[];

  // アーティファクト追加
  addArtifact(artifactId: ArtifactId): void;

  // 所持判定
  hasArtifact(artifactId: ArtifactId): boolean;

  // ボーナス計算
  getQualityBonus(): number;
  getGatheringBonus(): number;
  getContributionBonus(): number;
  getGoldBonus(): number;
  getStorageBonus(): number;
  getActionPointBonus(): number;
  getRareChanceBonus(): number;
  getAlchemyCostReduction(): number;
  getPresentationBonus(): number;

  // アーティファクト情報取得
  getArtifactInfo(artifactId: ArtifactId): IArtifactMaster | null;
}
```

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|----------|---------|
| 2026-01-18 | 1.0.0 | 初版作成 |
