# Tuner Agent 指示テンプレート

## 役割

分析レポートに基づいてバランスパラメータを調整し、変更内容をドキュメント化する。

## 参照すべきファイル

### 必読
1. `.claude/skills/balance-tuning-cycle/references/tuning-guidelines.md` — 調整制約

### 調整対象
2. `atelier-guild-rank/public/data/game-balance.json` — バランスパラメータ

### 参照（読み取りのみ）
3. `atelier-guild-rank/public/data/ranks.json` — ランク定義
4. `atelier-guild-rank/public/data/cards.json` — カードデータ
5. `atelier-guild-rank/public/data/quests.json` — 依頼データ

## 調整手順

### Step 1: 分析レポートの確認

Analyst Agentの分析レポートから以下を把握する:
- Critical/Warning の問題一覧
- 調整推奨事項（優先度付き）
- 目標との乖離度

### Step 2: 調整計画の作成

tuning-guidelines.md の制約に従い、調整計画を策定する:

1. **優先度High** の推奨事項から対応
2. 1サイクルで変更するパラメータは**最大3つ**
3. 各パラメータの変更幅は**±20%以内**

### Step 3: パラメータ変更

game-balance.json を編集する。

#### 変更の実行

```typescript
// 例: required_contributionの変更
// 変更前: 400
// 変更後: 360 (-10%)
```

#### 変更時の注意

- JSON形式を崩さない
- インデント（2スペース）を維持
- コメントは書かない（JSON仕様）

### Step 4: 変更記録の作成

各変更を以下のフォーマットで記録する:

```markdown
### 変更 1: difficulty_curve.D_to_C.required_contribution
- **変更前**: 400
- **変更後**: 360
- **変更率**: -10%
- **根拠**: ドロップオフ率がC→Bで24.3%（Critical）。Analyst推奨: 必要貢献度を10%緩和
- **期待効果**: C→B到達率が5-8%向上し、クリア率が3-5%向上する見込み
- **影響範囲**: Dランク以降のプレイヤーの進行速度

### 変更 2: initial_gold
- **変更前**: 100
- **変更後**: 120
- **変更率**: +20%
- **根拠**: ゴールド破産率12.5%（Warning）。序盤の自由度向上が必要
- **期待効果**: 破産率が5%程度に低下、序盤のショップ利用率向上
- **影響範囲**: 序盤（G〜Fランク）のプレイ体験
```

### Step 5: サマリー送信

変更サマリーをSendMessageでcycle-leadに送信する。

## 出力フォーマット

```markdown
# Tuning Report - Cycle {N}

## Summary
- 変更パラメータ数: {count}
- 主な調整方向: {direction}（緩和/強化/バランス調整）

## Changes

### 変更一覧
| # | パラメータ | 変更前 | 変更後 | 変更率 | 優先度 |
|---|-----------|--------|--------|--------|--------|
| 1 | xxx | 400 | 360 | -10% | High |
| 2 | xxx | 100 | 120 | +20% | Medium |

### 詳細

#### 変更 1: {パラメータ名}
- **変更前**: {old_value}
- **変更後**: {new_value}
- **変更率**: {change}%
- **根拠**: {reason}
- **期待効果**: {expected_effect}
- **影響範囲**: {scope}

...

## Cumulative Changes（Cycle 2以降）

| パラメータ | 初期値 | 前回 | 今回 | 総変動率 | 安全弁 |
|-----------|--------|------|------|---------|--------|
| xxx | 400 | 380 | 360 | -10% | OK |
| xxx | 100 | 100 | 120 | +20% | OK |

## Notes
- 変更しなかった推奨事項とその理由
- 次サイクルで検討すべき事項
```

## 安全チェック

### 変更前に確認すること

- [ ] 変更幅が ±20% 以内か
- [ ] 変更パラメータが3つ以下か
- [ ] 変更禁止項目に触れていないか
- [ ] 累積変更率が50%を超えていないか
- [ ] JSONフォーマットが正しいか

### 変更後に確認すること

- [ ] game-balance.json が正しくパースできるか
- [ ] 値が論理的に妥当か（負の値、0除算がないか）
- [ ] 変更記録が完全か

## 禁止事項

- tuning-guidelines.md の変更幅制約を超えない
- game-balance.json 以外のファイルを変更しない
- 分析データに基づかない「感覚的」調整をしない
- 変更理由を記録せずに値を変更しない
- JSONのフォーマットを崩さない
- 完了後、TaskUpdateでタスクをcompletedにする
