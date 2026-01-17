# TDDタスクノート: TASK-0016 ShopService・ArtifactService実装

**作成日**: 2026-01-18
**タスクID**: TASK-0016
**フェーズ**: 2 - ドメイン層・コアサービス

---

## 1. 技術スタック

| 項目 | 内容 |
|------|------|
| **言語** | TypeScript 5.x |
| **フレームワーク** | Phaser 3.87+ |
| **テストフレームワーク** | Vitest |
| **アーキテクチャ** | Clean Architecture（4層） |
| **パッケージマネージャ** | pnpm |

---

## 2. 開発ルール

- コーディング規約: Biome（lint + format）
- 型チェック: strictモード有効
- テスト要件: カバレッジ80%以上
- コメント規約: JSDoc形式
- 信頼性レベル: 🔵🟡🔴 マーキング

---

## 3. 依存タスク

| タスクID | タスク名 | 状態 |
|---------|---------|------|
| TASK-0005 | StateManager実装 | ✅ 完了 |
| TASK-0015 | InventoryService実装 | ✅ 完了 |

---

## 4. 関連ファイル

### 4.1 参照ファイル（既存）

| ファイル | 説明 |
|---------|------|
| `src/domain/interfaces/inventory-service.interface.ts` | InventoryServiceインターフェース（参考） |
| `src/application/services/inventory-service.ts` | InventoryService実装（参考） |
| `src/shared/types/index.ts` | 共通型定義 |
| `src/shared/types/master-data.ts` | マスターデータ型定義 |

### 4.2 作成ファイル

| ファイル | 説明 |
|---------|------|
| `src/domain/interfaces/shop-service.interface.ts` | ShopServiceインターフェース |
| `src/application/services/shop-service.ts` | ShopService実装 |
| `src/domain/interfaces/artifact-service.interface.ts` | ArtifactServiceインターフェース |
| `src/application/services/artifact-service.ts` | ArtifactService実装 |
| `tests/unit/application/services/shop-service.test.ts` | ShopServiceテスト |
| `tests/unit/application/services/artifact-service.test.ts` | ArtifactServiceテスト |

---

## 5. 設計概要

### 5.1 ShopService 🔵

**責務**: ショップでの購入処理を担当

**主要メソッド**:
- `getAvailableItems(): IShopItem[]` - 購入可能なアイテム一覧を取得
- `purchase(itemId: string): IPurchaseResult` - 購入を実行
- `canPurchase(itemId: string): boolean` - 購入可能か判定（ゴールド・在庫）
- `getItemPrice(itemId: string): number` - 価格を取得

**依存関係**:
- IDeckService（カード追加）
- IInventoryService（素材追加・アーティファクト追加）
- IGameState（ゴールド管理）
- IMasterDataRepository（ショップアイテムデータ）

### 5.2 ArtifactService 🔵

**責務**: アーティファクトの管理とボーナス計算を担当

**主要メソッド**:
- `getOwnedArtifacts(): string[]` - 所持アーティファクト一覧
- `addArtifact(artifactId: string): void` - アーティファクト追加
- `getQualityBonus(): number` - 品質ボーナス計算
- `getGatheringBonus(): number` - 採取ボーナス計算
- `getContributionBonus(): number` - 貢献度ボーナス計算
- `getGoldBonus(): number` - ゴールドボーナス計算
- `getStorageBonus(): number` - 倉庫拡張ボーナス計算
- `getActionPointBonus(): number` - 行動ポイントボーナス計算
- `getRareChanceBonus(): number` - レア確率ボーナス計算
- `getAlchemyCostReduction(): number` - 調合コスト削減計算
- `getPresentationBonus(): number` - 提示回数ボーナス計算

**依存関係**:
- IInventoryService（アーティファクト管理）
- IMasterDataRepository（アーティファクトデータ）

---

## 6. データ構造

### 6.1 ショップアイテム (shop_items.json) 🟡

```typescript
interface IShopItem {
  type: 'card' | 'material' | 'artifact';
  itemId: string;
  price: number;
  stock: number;  // -1は無制限
  unlockRank: GuildRank;
}
```

### 6.2 アーティファクト効果

```typescript
type ArtifactEffectType =
  | 'QUALITY_UP'           // 品質+N
  | 'STORAGE_EXPANSION'    // 素材保管+N枠
  | 'GOLD_BONUS'           // 報酬金+N%
  | 'RARE_CHANCE_UP'       // レア確率+N%
  | 'ACTION_POINT_BONUS'   // 行動ポイント+N/日
  | 'CONTRIBUTION_BONUS'   // 貢献度+N%
  | 'ALCHEMY_COST_REDUCTION' // 調合コスト-N
  | 'PRESENTATION_BONUS'   // 採取提示回数+N
  | 'ALL_BONUS';           // 全効果+N%

interface IArtifactEffect {
  type: ArtifactEffectType;
  value: number;
}
```

---

## 7. 注意事項

### 7.1 技術的制約

- ゴールド管理はStateManagerを通じて行う
- アーティファクトは重複所持不可
- ショップ在庫は購入後に減少
- ランクによる商品解放制限

### 7.2 テストにおける注意

- モックを使用してStateManager・InventoryServiceをテスト
- 購入処理のトランザクション的な動作を確認
- ゴールド不足時のエラーハンドリング

---

## 8. 受け入れ基準

### 8.1 必須条件 🔵

- [ ] カードの購入ができる
- [ ] ゴールド不足時は購入不可
- [ ] アイテム・素材の販売ができる
- [ ] アーティファクト効果が適用される

### 8.2 推奨条件 🟡

- [ ] ランクに応じた商品解放
- [ ] 単体テストカバレッジ80%以上

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|----------|---------|
| 2026-01-18 | 1.0.0 | 初版作成 |
