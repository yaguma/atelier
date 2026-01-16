# TASK-0003: 共通型定義のTDDコンテキスト

## タスク概要

設計文書（docs/design/atelier-guild-rank/interfaces.ts）に定義された型定義を`src/shared/types/`に実装する。

## 関連ドキュメント

- 設計文書: `docs/design/atelier-guild-rank/interfaces.ts`
- 作業ディレクトリ: `atelier-guild-rank`

---

## コンテキスト情報

### 1. 既存ディレクトリ構造

```
atelier-guild-rank/
├── src/
│   ├── application/        # アプリケーション層（空）
│   ├── domain/             # ドメイン層（空）
│   ├── infrastructure/     # インフラ層（空）
│   ├── presentation/       # プレゼンテーション層（空）
│   ├── shared/             # 共有レイヤー
│   │   ├── constants/      # 定数定義
│   │   │   └── index.ts    # プレースホルダー
│   │   ├── types/          # 型定義 ★ここに実装
│   │   │   └── index.ts    # プレースホルダー
│   │   ├── utils/          # ユーティリティ
│   │   │   └── index.ts    # プレースホルダー
│   │   └── index.ts        # 公開エクスポート
│   └── main.ts             # エントリーポイント
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### 2. 技術スタック

| 項目 | バージョン/設定 |
|------|----------------|
| TypeScript | ^5.7.0 |
| strict mode | true |
| noUnusedLocals | true |
| noUnusedParameters | true |
| noImplicitReturns | true |
| テストフレームワーク | vitest ^2.1.0 |
| パスエイリアス | @shared/* → src/shared/* |

### 3. tsconfig.json 設定

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "noImplicitOverride": true,
    "paths": {
      "@shared/*": ["src/shared/*"]
    }
  }
}
```

---

## 設計文書の型定義一覧

### 実装すべきファイルと型

#### 1. `common.ts` - 基本型・列挙型

| 型名 | 種類 | 説明 |
|------|------|------|
| RankId | Type Alias | ランクID（G〜S） |
| Phase | Type Alias | フェーズ種別 |
| CardType | Type Alias | カード種別 |
| QuestType | Type Alias | 依頼種別 |
| ClientType | Type Alias | 依頼者種別 |
| Quality | Type Alias | アイテム品質 |
| Attribute | Type Alias | 素材属性 |
| EnhancementEffectType | Type Alias | 強化効果種別 |
| ArtifactEffectType | Type Alias | アーティファクト効果種別 |
| GameOverReason | Type Alias | ゲームオーバー理由 |

#### 2. `ids.ts` - エンティティID型

| 型名 | 種類 | 説明 |
|------|------|------|
| CardId | Type Alias | カードID |
| MaterialId | Type Alias | 素材ID |
| ItemId | Type Alias | アイテムID |
| QuestId | Type Alias | 依頼ID |
| ArtifactId | Type Alias | アーティファクトID |
| ClientId | Type Alias | 依頼者ID |
| RecipeId | Type Alias | レシピID |

#### 3. `entities.ts` - エンティティ型

**カード関連**
| 型名 | 種類 | 説明 |
|------|------|------|
| GatheringCardMaster | Interface | 採取地カードマスター |
| RecipeCardMaster | Interface | レシピカードマスター |
| EnhancementCardMaster | Interface | 強化カードマスター |
| CardMaster | Union Type | カードマスター統合型 |

**素材・アイテム関連**
| 型名 | 種類 | 説明 |
|------|------|------|
| MaterialMaster | Interface | 素材マスター |
| MaterialInstance | Interface | 素材インスタンス |
| ItemMaster | Interface | アイテムマスター |
| ItemInstance | Interface | アイテムインスタンス |

**依頼関連**
| 型名 | 種類 | 説明 |
|------|------|------|
| QuestMaster | Interface | 依頼マスター |
| Quest | Interface | 依頼インスタンス |
| ClientMaster | Interface | 依頼者マスター |

**ランク・アーティファクト関連**
| 型名 | 種類 | 説明 |
|------|------|------|
| RankMaster | Interface | ランクマスター |
| ArtifactMaster | Interface | アーティファクトマスター |

#### 4. `game-state.ts` - ゲーム状態型

| 型名 | 種類 | 説明 |
|------|------|------|
| GameState | Interface | ゲーム状態（StateManager管理） |
| ActiveEnhancement | Interface | アクティブな強化効果 |
| PromotionTestState | Interface | 昇格試験状態 |
| MaterialOption | Interface | 素材提示オプション |
| DraftGatheringState | Interface | ドラフト採取の状態 |

#### 5. `events.ts` - イベントペイロード型

| 型名 | 種類 | 説明 |
|------|------|------|
| StateUpdatedPayload | Interface | 状態更新イベント |
| PhaseChangedPayload | Interface | フェーズ変更イベント |
| QuestAcceptedPayload | Interface | 依頼受注イベント |
| GatheringCompletedPayload | Interface | 採取完了イベント |
| ItemCraftedPayload | Interface | アイテム調合イベント |
| QuestDeliveredPayload | Interface | 依頼納品イベント |
| RankUpTriggeredPayload | Interface | 昇格トリガーイベント |
| GameOverPayload | Interface | ゲームオーバーイベント |
| GameClearPayload | Interface | ゲームクリアイベント |

#### 6. `save-data.ts` - セーブデータ型

| 型名 | 種類 | 説明 |
|------|------|------|
| SaveData | Interface | セーブデータ |
| SaveSlotInfo | Interface | セーブスロット情報 |
| GameStatistics | Interface | ゲーム統計 |

#### 7. `errors.ts` - エラー型

| 型名 | 種類 | 説明 |
|------|------|------|
| DomainError | Class | ドメインエラー |
| ApplicationError | Class | アプリケーションエラー |
| ErrorCodes | Const Object | エラーコード定義 |
| ErrorCode | Type Alias | エラーコード型 |

#### 8. `utils.ts` - ユーティリティ型

| 型名 | 種類 | 説明 |
|------|------|------|
| DeepReadonly<T> | Type Alias | 深い読み取り専用型 |
| RequiredFields<T, K> | Type Alias | 部分的に必須な型 |
| NonNullableFields<T> | Type Alias | Nullableを除外した型 |

---

## ファイル構成と依存関係

```
src/shared/types/
├── index.ts          # 全型のエクスポート（更新必要）
├── common.ts         # 基本型（依存なし）
├── ids.ts            # ID型（依存なし）
├── entities.ts       # エンティティ型（common.ts, ids.tsに依存）
├── game-state.ts     # ゲーム状態型（entities.ts, common.ts, ids.tsに依存）
├── events.ts         # イベント型（game-state.ts, entities.ts, common.ts, ids.tsに依存）
├── save-data.ts      # セーブデータ型（game-state.ts, common.tsに依存）
├── errors.ts         # エラー型（依存なし）
└── utils.ts          # ユーティリティ型（依存なし）
```

### 実装順序（依存関係に基づく）

1. `common.ts` - 基本型（依存なし）
2. `ids.ts` - ID型（依存なし）
3. `errors.ts` - エラー型（依存なし）
4. `utils.ts` - ユーティリティ型（依存なし）
5. `entities.ts` - エンティティ型（1,2に依存）
6. `game-state.ts` - ゲーム状態型（1,2,5に依存）
7. `events.ts` - イベント型（1,2,5,6に依存）
8. `save-data.ts` - セーブデータ型（1,6に依存）
9. `index.ts` - エクスポート更新

---

## TDD実装方針

### テスト対象

型定義はランタイムでの動作を持たないため、以下の観点でテストを実施する：

1. **型の正当性検証**
   - TypeScriptコンパイラによる型チェック
   - 型推論の正確性

2. **型ガード関数（必要に応じて追加）**
   - `isGatheringCard(card): card is GatheringCardMaster`
   - `isRecipeCard(card): card is RecipeCardMaster`
   - `isEnhancementCard(card): card is EnhancementCardMaster`

3. **エラークラスのテスト**
   - `DomainError`のインスタンス化
   - `ApplicationError`のインスタンス化
   - エラーコードの正確性

### テストファイル構成

```
src/shared/types/
├── __tests__/
│   ├── common.test.ts       # 型の利用テスト
│   ├── ids.test.ts          # ID型テスト
│   ├── entities.test.ts     # エンティティ型テスト
│   ├── game-state.test.ts   # ゲーム状態型テスト
│   ├── events.test.ts       # イベント型テスト
│   ├── save-data.test.ts    # セーブデータ型テスト
│   ├── errors.test.ts       # エラー型テスト
│   └── utils.test.ts        # ユーティリティ型テスト
```

---

## 注意事項

1. **strictモード対応**
   - すべての型定義は`strict: true`に準拠
   - `undefined`と`null`の扱いを明確に

2. **命名規則**
   - Interface: PascalCase
   - Type Alias: PascalCase
   - Const: UPPER_SNAKE_CASE

3. **ドキュメントコメント**
   - すべての公開型にJSDocコメントを付与
   - 設計文書の説明を転記

4. **循環参照の回避**
   - ファイル間の依存関係を明確に管理
   - 必要に応じて型のみのインポートを使用（`import type`）

---

## チェックリスト

- [ ] common.ts の実装
- [ ] ids.ts の実装
- [ ] errors.ts の実装
- [ ] utils.ts の実装
- [ ] entities.ts の実装
- [ ] game-state.ts の実装
- [ ] events.ts の実装
- [ ] save-data.ts の実装
- [ ] index.ts の更新
- [ ] テストファイルの作成
- [ ] TypeScriptコンパイル確認
- [ ] ESLintチェック通過

---

## 作成日時

2026-01-16
