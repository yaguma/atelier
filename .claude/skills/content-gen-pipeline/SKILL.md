---
name: content-gen-pipeline
description: |
  マスターデータを4エージェントで並列生成するコンテンツ生成パイプライン。
  カード・素材/アイテム・依頼/依頼者の3カテゴリを並列で生成し、検証エージェントで整合性を確認する。
  使用タイミング:
  (1) 「マスターデータを生成」「コンテンツを追加」と言われた時
  (2) 「/content-gen-pipeline」コマンドが実行された時
  (3) 新ランク追加や大規模コンテンツ拡張が必要な時
  引数: [対象カテゴリ]（省略時: 全カテゴリ）
  オプション: --cards-only, --materials-only, --quests-only, --dry-run
---

# Content Generation Pipeline

4エージェントによるマスターデータ並列生成パイプラインを実行する。

## チーム構成

| 役割 | エージェント名 | 専門領域 | subagent_type |
|------|--------------|----------|---------------|
| Pipeline Lead | pipeline-lead | 統括・ID割当・統合・最終検証 | （自分） |
| Card Agent | card-agent | 採取/レシピ/強化カード生成 | general-purpose |
| Material & Item Agent | material-item-agent | 素材/アイテム/レシピJSON生成 | general-purpose |
| Quest & Client Agent | quest-client-agent | 依頼者/依頼テンプレート生成 | general-purpose |
| Validator Agent | validator-agent | 全データの整合性検証 | general-purpose |

## 引数の解析

ユーザー入力から以下を抽出:
- **対象カテゴリ**: 省略時は全カテゴリ
  - `--cards-only`: カードのみ生成
  - `--materials-only`: 素材・アイテムのみ生成
  - `--quests-only`: 依頼・依頼者のみ生成
- **--dry-run**: 実行計画を表示するのみ（実際のファイル生成は行わない）
- **自由テキスト**: 生成テーマや追加指示（例: 「Bランク用の水属性カードを追加」）

## ワークフロー

詳細は [references/pipeline-workflow.md](references/pipeline-workflow.md) を参照。

### Phase 1: 準備（Pipeline Lead自身が実行）

1. 現在のマスターデータを読み込み、既存IDを把握する

```bash
# 既存データの確認
ls atelier-guild-rank/public/data/
```

2. 以下のファイルを読み込む:
   - `atelier-guild-rank/public/data/cards.json` — 既存カード一覧
   - `atelier-guild-rank/public/data/materials.json` — 既存素材一覧
   - `atelier-guild-rank/public/data/recipes.json` — 既存レシピ一覧
   - `atelier-guild-rank/public/data/quests.json` — 既存依頼一覧
   - `atelier-guild-rank/public/data/ranks.json` — ランク定義
   - `atelier-guild-rank/public/data/artifacts.json` — アーティファクト一覧
   - `atelier-guild-rank/public/data/game-balance.json` — バランスパラメータ

3. ID割当表を作成する
   - 各エージェントに割り当てるIDプレフィックスとレンジを決定
   - ID衝突を防ぐため、既存IDの最大番号を基準にする

4. TeamCreateでチームを作成する

```
TeamCreate: team_name = "content-gen-{timestamp}"
```

5. TaskCreateで各エージェントのタスクを作成する

6. `--dry-run` の場合: 実行計画を表示して終了

### Phase 2: 並列生成（3エージェント同時）

Task toolで3つの生成エージェントを**並列で**スポーンする。

各エージェントには以下を渡す:
- ID割当表（担当範囲のIDプレフィックス・レンジ）
- 既存データの概要（衝突回避用）
- ユーザーの追加指示（テーマ等）
- 対応するagent-promptのパス
- data-schema-guide.md のパス
- agent-output-format.md のパス
- 「生成完了後、SendMessageでpipeline-leadに結果を送信」の指示

#### エージェントスポーン時の指示テンプレート

```
あなたは「{role_name}」として、マスターデータの生成を担当する。
チーム名: content-gen-{timestamp}
あなたの名前: {agent_name}

## 生成指示
1. まず以下のファイルを読み込む:
   - .claude/skills/content-gen-pipeline/references/data-schema-guide.md
   - .claude/skills/content-gen-pipeline/references/agent-output-format.md
   - .claude/skills/content-gen-pipeline/references/agent-prompts/{prompt_file}
2. 既存データを確認する（衝突回避）
3. ID割当表に従いデータを生成する
4. 生成したJSONデータを対象ファイルに書き込む
5. SendMessage で pipeline-lead に結果サマリーを送信する

## ID割当表
{id_assignment_table}

## 追加指示
{user_instructions}

## 厳守事項
- ID割当表の範囲内でIDを振る（他エージェントの範囲に侵入しない）
- data-schema-guide.md の型定義に厳密に従う
- 既存データとの整合性を確保する（参照先IDの存在確認）
- 生成完了後、TaskUpdateでタスクをcompletedにする
```

#### エージェントと対応プロンプト

| agent_name | role_name | prompt_file |
|------------|-----------|-------------|
| card-agent | Card Agent | card-agent.md |
| material-item-agent | Material & Item Agent | material-item-agent.md |
| quest-client-agent | Quest & Client Agent | quest-client-agent.md |

### Phase 3: 統合（Pipeline Leadが実行）

全3エージェントの報告を受信後:

1. 各エージェントが生成・編集したJSONファイルを読み込む
2. フォーマット統一（インデント、ソート順）
3. 明らかな問題があれば修正

### Phase 4: 検証（Validator Agent）

Validator Agentをスポーンし、以下を検証:

1. **スキーマ検証**: 全JSONが型定義に準拠しているか
2. **参照整合性**: IDの相互参照が壊れていないか
3. **バランス偏り**: レアリティ・属性・カテゴリの分布が偏りすぎていないか
4. **ID一意性**: 全データでIDが一意であるか

```
あなたは「Validator Agent」として、生成されたマスターデータの整合性検証を担当する。
チーム名: content-gen-{timestamp}
あなたの名前: validator-agent

## 検証手順
1. .claude/skills/content-gen-pipeline/references/agent-prompts/validator-agent.md を読み込む
2. .claude/skills/content-gen-pipeline/references/data-schema-guide.md を読み込む
3. 全JSONファイルを読み込み検証する
4. SendMessage で pipeline-lead に検証結果を送信する

## 厳守事項
- ファイル編集は禁止（Read/Glob/Grepのみ使用）
- 問題は重要度別（Critical/Warning/Info）に分類する
- 検証完了後、TaskUpdateでタスクをcompletedにする
```

### Phase 5: 修正（必要に応じて）

Validator Agentの検証結果にCriticalがある場合:
1. 該当するエージェントに修正指示を送信
2. 修正完了後、再度Validator Agentで検証

### Phase 6: テスト実行 & クリーンアップ

1. テスト実行

```bash
pnpm --filter atelier-guild-rank test -- --run
```

2. 全エージェントに `shutdown_request` を送信
3. `TeamDelete` でチーム解散
4. VOICEVOXで完了通知

## 出力

### 生成・更新されるファイル

| ファイル | 内容 |
|---------|------|
| `atelier-guild-rank/public/data/cards.json` | カードマスターデータ |
| `atelier-guild-rank/public/data/materials.json` | 素材マスターデータ |
| `atelier-guild-rank/public/data/recipes.json` | レシピマスターデータ |
| `atelier-guild-rank/public/data/quests.json` | 依頼テンプレートデータ |
| `atelier-guild-rank/public/data/artifacts.json` | アーティファクトデータ |

### 生成レポート

パイプライン完了後、以下のサマリーをユーザーに報告:
- 生成件数（カテゴリ別）
- 検証結果サマリー
- 修正があった場合はその内容
