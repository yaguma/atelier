# Pipeline Lead ワークフロー詳細

## 概要

Pipeline Lead が実行する全手順。コンテンツ生成パイプラインの統括・ID管理・統合・検証を担当する。

---

## Phase 1: 準備

### 1.1 既存データの把握

以下のファイルを読み込み、既存IDの最大番号を確認する:

```
atelier-guild-rank/public/data/cards.json
atelier-guild-rank/public/data/materials.json
atelier-guild-rank/public/data/recipes.json
atelier-guild-rank/public/data/quests.json
atelier-guild-rank/public/data/ranks.json
atelier-guild-rank/public/data/artifacts.json
atelier-guild-rank/public/data/game-balance.json
```

### 1.2 ID割当表の作成

各エージェントにIDの衝突が起きないよう、プレフィックスとレンジを割り当てる。

#### IDプレフィックス規則

| カテゴリ | プレフィックス | 例 |
|---------|--------------|-----|
| 採取カード | `gathering_` | `gathering_crystal_cave` |
| レシピカード | `recipe_` | `recipe_flame_sword` |
| 強化カード | `enhance_` | `enhance_wind_blessing` |
| 素材 | `mat_` | `mat_fire_crystal` |
| アイテム | `item_` | `item_healing_salve` |
| 依頼者 | `client_` | `client_merchant_gale` |
| 依頼テンプレート | `quest_` | `quest_herb_delivery` |
| アーティファクト | `artifact_` | `artifact_golden_mortar` |

#### 割当の例

```markdown
## ID割当表

### Card Agent
- 採取カード: gathering_new_001 〜 gathering_new_050
- レシピカード: recipe_new_001 〜 recipe_new_050
- 強化カード: enhance_new_001 〜 enhance_new_020

### Material & Item Agent
- 素材: mat_new_001 〜 mat_new_100
- アイテム: item_new_001 〜 item_new_050
- レシピJSON: recipes.json の更新

### Quest & Client Agent
- 依頼者: client_new_001 〜 client_new_020
- 依頼テンプレート: quest_new_001 〜 quest_new_050
```

### 1.3 チーム作成

```
TeamCreate: team_name="content-gen-{YYYYMMDD-HHMM}"
```

### 1.4 タスク作成

| タスクID | 担当 | 内容 |
|---------|------|------|
| 1 | card-agent | カードデータ生成 |
| 2 | material-item-agent | 素材・アイテム・レシピデータ生成 |
| 3 | quest-client-agent | 依頼者・依頼テンプレートデータ生成 |
| 4 | validator-agent | 全データ整合性検証 |

タスク4はタスク1〜3に `blockedBy` を設定する。

### 1.5 エージェントスポーン

3つのTask toolを**並列**で呼び出し、各生成エージェントをスポーンする。

---

## Phase 2: 並列生成

3エージェントが同時にデータを生成し、結果をSendMessageで報告。

Pipeline Leadは以下を行う:
- 各エージェントからのメッセージを受信（自動配信）
- 全3エージェントの報告が揃うまで待機

### 生成エージェントの動作フロー

1. 指示テンプレートとガイドを読み込む
2. 既存データを読み込み、衝突回避を確認
3. ID割当表に従いデータを生成
4. JSONファイルに書き込み
5. 生成サマリーをSendMessageで送信
6. TaskUpdateでタスクをcompletedに

---

## Phase 3: 統合

### 3.1 生成結果の確認

各エージェントが更新したJSONファイルを読み込み、以下を確認:
- JSONとしてパース可能か
- 期待される構造になっているか
- 重複IDがないか

### 3.2 フォーマット統一

- インデント: 2スペース
- キー順序: 型定義の宣言順に統一
- 配列ソート: ID昇順

---

## Phase 4: 検証

### 4.1 Validator Agentスポーン

Validator Agentをスポーンし、以下の検証を依頼:

1. **スキーマ検証**: 全JSONが `src/shared/types/master-data.ts` の型定義に準拠
2. **参照整合性**:
   - カードの `materialPool` が `materials.json` に存在するか
   - レシピカードの `requiredMaterials.materialId` が `materials.json` に存在するか
   - レシピカードの `outputItemId` が `recipes.json` に存在するか
   - 依頼テンプレートの `clientId` が `quests.json`（clients部分）に存在するか
   - ランクの `unlockedGatheringCards` / `unlockedRecipeCards` が `cards.json` に存在するか
3. **バランス偏り**: レアリティ・属性・カテゴリの分布
4. **ID一意性**: 全データでIDが重複していないこと

### 4.2 検証結果の受信

Validator Agentからの報告を受信し、問題の重要度を確認。

---

## Phase 5: 修正

Validator Agentの報告にCriticalがある場合:

1. 問題のあるカテゴリの担当エージェントを特定
2. 該当エージェントにSendMessageで修正指示を送信
3. 修正完了報告を受信
4. 必要に応じて再度Validator Agentで検証

### 修正が不要な場合

Warning/Infoのみの場合は、Pipeline Leadが判断し:
- 軽微な修正は自身で対応
- 許容範囲内ならそのまま進行

---

## Phase 6: テスト実行 & クリーンアップ

### 6.1 テスト実行

```bash
pnpm --filter atelier-guild-rank test -- --run
```

テスト失敗時は原因を調査し、データまたはテストを修正。

### 6.2 クリーンアップ

1. 全エージェントに `shutdown_request` を送信
2. 全エージェントのシャットダウン確認後、`TeamDelete` を実行
3. VOICEVOXで完了通知

### 6.3 サマリー報告

ユーザーに以下を報告:
- 生成件数（カテゴリ別）
- 検証結果サマリー
- 修正があった場合はその内容
- テスト結果

---

## エラーハンドリング

### エージェントが応答しない場合
- 60秒以上応答がない場合、再度メッセージを送信
- それでも応答がない場合、そのエージェントの生成結果なしで続行

### JSONパースエラーの場合
- エラー内容を特定し、該当エージェントに再生成を指示
- 2回失敗した場合はPipeline Lead自身で修正

### テスト失敗の場合
- エラー内容を確認し、データの問題かテストの問題かを判定
- データの問題: 該当エージェントに修正指示
- テストの問題: Pipeline Lead自身で対応
