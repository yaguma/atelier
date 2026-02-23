# Cycle Lead ワークフロー詳細

## 概要

Cycle Lead が実行する全手順。バランス調整サイクルの統括・収束判定・最終レポート作成を担当する。

---

## Phase 1: 準備

### 1.1 目標値の設定

ユーザー入力から以下を決定:

```
目標クリア率: {target_clear_rate}%（デフォルト: 30%）
許容範囲: ±5%（つまり25%〜35%が目標範囲）
最大サイクル数: {max_cycles}（デフォルト: 5）
シミュレーション回数: {runs}（デフォルト: 1000）
```

### 1.2 現在のパラメータ読み込み

以下のファイルを読み込む:

```
atelier-guild-rank/public/data/game-balance.json
atelier-guild-rank/public/data/ranks.json
atelier-guild-rank/public/data/cards.json
atelier-guild-rank/public/data/materials.json
atelier-guild-rank/public/data/recipes.json
atelier-guild-rank/public/data/quests.json
```

### 1.3 純粋関数の確認

シミュレーションで再利用する純粋関数のパスを確認:

```
src/features/quest/services/generate-quests.ts
src/features/quest/services/calculate-reward.ts
src/features/alchemy/services/calculate-quality.ts
src/features/alchemy/services/craft.ts
src/features/alchemy/services/check-recipe-requirements.ts
```

### 1.4 チーム作成

```
TeamCreate: team_name="balance-tuning-{YYYYMMDD-HHMM}"
```

### 1.5 タスク作成（サイクル1回分）

| タスクID | 担当 | 内容 |
|---------|------|------|
| 1 | simulator-agent | シミュレーション実行（Cycle N） |
| 2 | analyst-agent | 結果分析（Cycle N） |
| 3 | tuner-agent | パラメータ調整（Cycle N） |

タスク2は1に `blockedBy`、タスク3は2に `blockedBy` を設定。

---

## Phase 2: シミュレーション

### 2.1 Simulator Agentスポーン

```
Task tool:
  subagent_type: general-purpose
  team_name: balance-tuning-{timestamp}
  name: simulator-agent
```

指示内容:
- simulation-spec.md を読み込む
- 既存の純粋関数を再利用するシミュレーションスクリプトを作成
- {runs}回のシミュレーションを実行
- 結果JSONを出力
- 結果サマリーをSendMessageで送信

### 2.2 シミュレーション結果の受信

Simulator AgentからのSendMessageを待機。以下の情報を受信:
- 総実行回数
- クリア率
- 各ランク到達率
- 平均プレイ日数
- エラーがあれば詳細

---

## Phase 3: 分析

### 3.1 Analyst Agentスポーン

Simulator Agentの完了後にスポーン。

指示内容:
- analysis-metrics.md を読み込む
- シミュレーション結果を読み込む
- メトリクスを計算
- 問題点を特定
- 分析レポートをSendMessageで送信

### 3.2 分析結果の受信

Analyst AgentからのSendMessageを待機。以下の情報を受信:
- メトリクスサマリー
- 目標との乖離
- ボトルネック特定
- 調整推奨事項

---

## Phase 4: 調整

### 4.1 Tuner Agentスポーン

Analyst Agentの完了後にスポーン。

指示内容:
- tuning-guidelines.md を読み込む
- 分析レポートを確認
- game-balance.json のパラメータを調整
- 変更理由をドキュメント化
- 変更サマリーをSendMessageで送信

### 4.2 調整結果の受信

Tuner AgentからのSendMessageを待機。以下の情報を受信:
- 変更パラメータ一覧
- 変更理由
- 期待される効果

---

## Phase 5: 収束判定

### 5.1 判定基準

以下の条件を確認:

1. **収束**: クリア率が目標範囲内（target ± 5%）
2. **最大サイクル到達**: サイクル数が max_cycles に達した
3. **改善停滞**: 前回サイクルとの改善幅が1%未満

### 5.2 判定結果に応じた動作

| 条件 | 動作 |
|------|------|
| 収束 | Phase 6 へ進む |
| 最大サイクル到達 | Phase 6 へ進む（警告付き） |
| 改善停滞 | Phase 6 へ進む（警告付き） |
| それ以外 | Phase 2 に戻る（新サイクル開始） |

### 5.3 新サイクル開始時

1. サイクル番号をインクリメント
2. 新しいタスクを作成（前サイクルの完了タスクとは別に）
3. Phase 2 から再開

---

## Phase 6: テスト実行 & 最終レポート

### 6.1 テスト実行

```bash
pnpm --filter atelier-guild-rank test -- --run
```

テスト失敗時は原因を調査し修正。

### 6.2 最終レポート作成

以下の内容を含むレポートを作成:

```markdown
# バランス調整レポート

## 実行概要
- 実行日時: {datetime}
- 目標クリア率: {target}%
- 実行サイクル数: {actual_cycles}/{max_cycles}
- 収束状態: 収束/未収束

## パラメータ変更サマリー

### 初期値 → 最終値
| パラメータ | 初期値 | 最終値 | 変動率 |
|-----------|--------|--------|--------|
| initial_gold | 100 | 120 | +20% |
| ... | | | |

## メトリクス推移

### クリア率
| サイクル | クリア率 | 目標との差 |
|---------|---------|-----------|
| 初期 | X% | -Y% |
| Cycle 1 | X% | -Y% |
| ... | | |

### ランク到達率
| サイクル | F | E | D | C | B | A | S |
|---------|---|---|---|---|---|---|---|
| 初期 | X% | X% | ... |
| ... | | | | | | | |

## 各サイクルの調整内容
### Cycle 1
- 変更: ...
- 理由: ...
- 効果: ...

## 結論と推奨事項
- ...
```

### 6.3 レポート保存

```
docs/balance-reports/{YYYYMMDD}-balance-tuning-report.md
```

### 6.4 クリーンアップ

1. 全エージェントに `shutdown_request` を送信
2. 全エージェントのシャットダウン確認後、`TeamDelete` を実行
3. VOICEVOXで完了通知

---

## エラーハンドリング

### シミュレーションスクリプトがコンパイルエラーの場合
- エラー内容を Simulator Agent に伝えて修正を依頼
- 2回失敗した場合は Cycle Lead 自身で修正

### シミュレーション実行が途中で停止した場合
- タイムアウト設定（5分）を超えた場合は中断
- 実行回数を減らして再実行

### 分析結果が不完全な場合
- Analyst Agent に再分析を依頼
- 必要なメトリクスを明示的に指定

### 調整幅が制限を超えた場合
- Tuner Agent に制限内での調整を再依頼
- 制限を超える必要がある場合はユーザーに確認
