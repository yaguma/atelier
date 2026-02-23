---
name: balance-tuning-cycle
description: |
  シミュレーション→分析→調整のループで定量的バランス調整を行うサイクル。
  既存の純粋関数（依頼生成、報酬計算、品質計算）を活用してゲームプレイをシミュレーションし、
  統計分析に基づいてバランスパラメータを調整する。
  使用タイミング:
  (1) 「バランス調整」「ゲームバランスを確認」と言われた時
  (2) 「/balance-tuning-cycle」コマンドが実行された時
  (3) マスターデータ追加後のバランス検証が必要な時
  引数: [目標クリア率]（デフォルト: 30%）
  オプション: --max-cycles N（デフォルト: 5）, --runs N（シミュレーション回数、デフォルト: 1000）
---

# Balance Tuning Cycle

シミュレーション→分析→調整の反復サイクルで定量的バランス調整を行う。

## チーム構成

| 役割 | エージェント名 | 専門領域 | subagent_type |
|------|--------------|----------|---------------|
| Cycle Lead | cycle-lead | サイクル管理・収束判定 | （自分） |
| Simulator Agent | simulator-agent | シミュレーションスクリプト作成・実行 | general-purpose |
| Analyst Agent | analyst-agent | 結果統計分析・問題特定 | general-purpose |
| Tuner Agent | tuner-agent | パラメータ調整・ドキュメント化 | general-purpose |

## 引数の解析

ユーザー入力から以下を抽出:
- **目標クリア率**: 数値（デフォルト: 30）— ゲームクリア率の目標パーセンテージ
- **--max-cycles N**: 最大サイクル数（デフォルト: 5）
- **--runs N**: 1サイクルあたりのシミュレーション実行回数（デフォルト: 1000）
- **自由テキスト**: 調整の焦点（例: 「序盤の難易度を下げたい」「Bランク以降が難しすぎる」）

## ワークフロー

詳細は [references/cycle-workflow.md](references/cycle-workflow.md) を参照。

### Phase 1: 準備（Cycle Lead自身が実行）

1. 目標値を設定する

```
目標クリア率: {target_clear_rate}%
最大サイクル数: {max_cycles}
シミュレーション回数: {runs}
```

2. 現在のバランスパラメータを読み込む

```
atelier-guild-rank/public/data/game-balance.json
atelier-guild-rank/public/data/ranks.json
atelier-guild-rank/public/data/cards.json
atelier-guild-rank/public/data/materials.json
atelier-guild-rank/public/data/recipes.json
atelier-guild-rank/public/data/quests.json
```

3. 純粋関数のパスを確認する

```
atelier-guild-rank/src/features/quest/services/generate-quests.ts
atelier-guild-rank/src/features/quest/services/calculate-reward.ts
atelier-guild-rank/src/features/alchemy/services/calculate-quality.ts
atelier-guild-rank/src/features/alchemy/services/craft.ts
atelier-guild-rank/src/features/alchemy/services/check-recipe-requirements.ts
```

4. TeamCreateでチームを作成する

```
TeamCreate: team_name = "balance-tuning-{timestamp}"
```

5. TaskCreateでサイクルタスクを作成する

### Phase 2: シミュレーション（Simulator Agent）

Simulator Agentをスポーンし、シミュレーションスクリプトの作成・実行を依頼する。

```
あなたは「Simulator Agent」として、ゲームプレイのシミュレーションを担当する。
チーム名: balance-tuning-{timestamp}
あなたの名前: simulator-agent

## シミュレーション手順
1. .claude/skills/balance-tuning-cycle/references/simulation-spec.md を読み込む
2. .claude/skills/balance-tuning-cycle/references/agent-prompts/simulator-agent.md を読み込む
3. 既存の純粋関数とマスターデータを確認する
4. シミュレーションスクリプトを作成する（TypeScript / Vitest）
5. シミュレーションを実行する
6. 結果JSONをSendMessageでcycle-leadに送信する

## パラメータ
- シミュレーション回数: {runs}
- サイクル番号: {cycle_number}

## 厳守事項
- 既存の純粋関数を可能な限り再利用する
- シミュレーション結果はJSON形式で出力する
- 完了後、TaskUpdateでタスクをcompletedにする
```

### Phase 3: 分析（Analyst Agent）

Analyst Agentをスポーンし、シミュレーション結果の統計分析を依頼する。

```
あなたは「Analyst Agent」として、シミュレーション結果の統計分析を担当する。
チーム名: balance-tuning-{timestamp}
あなたの名前: analyst-agent

## 分析手順
1. .claude/skills/balance-tuning-cycle/references/analysis-metrics.md を読み込む
2. .claude/skills/balance-tuning-cycle/references/agent-prompts/analyst-agent.md を読み込む
3. シミュレーション結果を読み込む
4. メトリクスを計算する
5. 問題点を特定する
6. 分析レポートをSendMessageでcycle-leadに送信する

## 目標値
- クリア率: {target_clear_rate}%

## 厳守事項
- ファイル編集は禁止（Read/Glob/Grepのみ使用）
- 分析は定量的に行う（主観的な判断を避ける）
- 完了後、TaskUpdateでタスクをcompletedにする
```

### Phase 4: 調整（Tuner Agent）

Tuner Agentをスポーンし、パラメータ調整を依頼する。

```
あなたは「Tuner Agent」として、バランスパラメータの調整を担当する。
チーム名: balance-tuning-{timestamp}
あなたの名前: tuner-agent

## 調整手順
1. .claude/skills/balance-tuning-cycle/references/tuning-guidelines.md を読み込む
2. .claude/skills/balance-tuning-cycle/references/agent-prompts/tuner-agent.md を読み込む
3. 分析レポートを確認する
4. パラメータ調整を実施する
5. 変更内容をドキュメント化する
6. 変更サマリーをSendMessageでcycle-leadに送信する

## 厳守事項
- 1回の変更幅は既存値の±20%以内
- game-balance.json 以外のファイルは変更しない（原則）
- 変更理由を必ずドキュメント化する
- 完了後、TaskUpdateでタスクをcompletedにする
```

### Phase 5: 収束判定（Cycle Leadが実行）

1. Tuner Agentの調整結果を確認
2. 目標達成チェック:
   - クリア率が目標範囲内（±5%）であれば**収束**
   - 最大サイクル数に達していれば**終了**
   - それ以外は**Phase 2に戻る**

### Phase 6: テスト実行 & 最終レポート

1. テスト実行

```bash
pnpm --filter atelier-guild-rank test -- --run
```

2. 最終レポート作成
   - 初期パラメータと最終パラメータの比較
   - 各サイクルのメトリクス推移
   - 調整履歴

3. レポートを保存

```
docs/balance-reports/{YYYYMMDD}-balance-tuning-report.md
```

4. 全エージェントに `shutdown_request` を送信
5. `TeamDelete` でチーム解散
6. VOICEVOXで完了通知

## 出力

### 更新されるファイル

| ファイル | 内容 |
|---------|------|
| `atelier-guild-rank/public/data/game-balance.json` | バランスパラメータ |
| `docs/balance-reports/{YYYYMMDD}-balance-tuning-report.md` | 調整レポート |

### シミュレーションスクリプト

| ファイル | 内容 |
|---------|------|
| `atelier-guild-rank/tests/simulation/game-simulation.test.ts` | シミュレーションテスト |

## 再利用する純粋関数

| 関数 | パス | 用途 |
|------|------|------|
| `generateQuests` | `src/features/quest/services/generate-quests.ts` | 依頼生成 |
| `calculateReward` | `src/features/quest/services/calculate-reward.ts` | 報酬計算 |
| `calculateQuality` | `src/features/alchemy/services/calculate-quality.ts` | 品質計算 |
| `craft` | `src/features/alchemy/services/craft.ts` | 調合実行 |
| `checkRecipeRequirements` | `src/features/alchemy/services/check-recipe-requirements.ts` | レシピ要件確認 |
| `createSeededRandom` | `src/features/quest/services/generate-quests.ts` | シード付き乱数 |
