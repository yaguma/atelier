# シミュレーション仕様書

## 概要

ゲームプレイをシミュレーションし、バランス調整の基礎データを生成する。
既存の純粋関数を最大限再利用し、実際のゲームロジックに近いシミュレーションを実現する。

---

## シミュレーション対象

### ゲームフロー

1日のプレイサイクル:
```
依頼受注 → 採取 → 調合 → 納品 → （日終了）
```

ゲーム全体:
```
G ランクから開始 → 各ランクで活動 → S ランク到達でクリア
30日以内にSランクに到達できなければゲームオーバー
```

### シミュレーションする要素

| 要素 | 使用する純粋関数 | パス |
|------|----------------|------|
| 依頼生成 | `generateQuests` | `src/features/quest/services/generate-quests.ts` |
| 報酬計算 | `calculateReward` | `src/features/quest/services/calculate-reward.ts` |
| 品質計算 | `calculateQuality` | `src/features/alchemy/services/calculate-quality.ts` |
| 調合実行 | `craft` | `src/features/alchemy/services/craft.ts` |
| レシピ要件確認 | `checkRecipeRequirements` | `src/features/alchemy/services/check-recipe-requirements.ts` |

### シミュレーションしない要素（簡略化）

| 要素 | 簡略化方法 |
|------|-----------|
| UI操作 | 自動選択（ランダム or 最適戦略） |
| デッキドロー | シード付き乱数でシャッフル |
| ショップ購入 | 資金に応じて確率的に購入 |
| アーティファクト選択 | ランダム選択 |

---

## シミュレーションスクリプトの仕様

### 配置場所

```
atelier-guild-rank/tests/simulation/game-simulation.test.ts
```

### 使用技術

- Vitest（テストフレームワーク）
- 既存の純粋関数をインポート
- シード付き乱数で再現可能

### スクリプト構造

```typescript
import { describe, it, expect } from 'vitest';
// 既存の純粋関数をインポート
import { generateQuests } from '@features/quest/services/generate-quests';
import { calculateReward } from '@features/quest/services/calculate-reward';
// ... 他の純粋関数

interface SimulationResult {
  seed: number;
  cleared: boolean;
  finalRank: GuildRank;
  finalDay: number;
  finalGold: number;
  rankHistory: { rank: GuildRank; reachedDay: number }[];
  questsCompleted: number;
  questsFailed: number;
  itemsCrafted: number;
  goldEarned: number;
  goldSpent: number;
}

interface SimulationSummary {
  totalRuns: number;
  clearRate: number;
  averageFinalDay: number;
  rankReachRates: Record<GuildRank, number>;
  averageGoldEarned: number;
  averageQuestsCompleted: number;
  // ... 他のメトリクス
}

function runSimulation(seed: number, balanceParams: GameBalance): SimulationResult {
  // 1ゲームのシミュレーション
}

function aggregateResults(results: SimulationResult[]): SimulationSummary {
  // 結果の集計
}
```

### AI戦略（プレイヤーの行動モデル）

シミュレーションでは「平均的なプレイヤー」を模擬する。

#### 依頼選択戦略

```
1. 達成可能な依頼を優先（必要素材が手元にある or 入手可能）
2. 報酬効率（貢献度/日数）が高い依頼を選択
3. 残り日数を考慮（期限切れリスクを避ける）
4. ランダム要素: 20%の確率で次善の選択をする（ヒューマンエラー模擬）
```

#### 採取戦略

```
1. 受注中の依頼に必要な素材の採取地を優先
2. レア素材チャンスがある場所を重み付け
3. APコストを考慮
```

#### 調合戦略

```
1. 依頼の納品に必要なアイテムを優先
2. 素材が揃っているレシピから実行
3. 品質を最大化する素材の組み合わせを選択
```

#### 納品戦略

```
1. 期限が近い依頼から優先
2. 品質条件を満たすアイテムがあれば即納品
```

---

## 出力形式

### 個別結果（JSON）

```json
{
  "seed": 12345,
  "cleared": true,
  "finalRank": "S",
  "finalDay": 28,
  "finalGold": 450,
  "rankHistory": [
    { "rank": "G", "reachedDay": 1 },
    { "rank": "F", "reachedDay": 4 },
    { "rank": "E", "reachedDay": 8 }
  ],
  "questsCompleted": 25,
  "questsFailed": 3,
  "itemsCrafted": 30,
  "goldEarned": 1200,
  "goldSpent": 750
}
```

### 集計結果（JSON）

```json
{
  "totalRuns": 1000,
  "clearRate": 32.5,
  "averageFinalDay": 24.3,
  "medianFinalDay": 25,
  "rankReachRates": {
    "F": 98.5,
    "E": 90.2,
    "D": 75.1,
    "C": 60.3,
    "B": 45.8,
    "A": 38.2,
    "S": 32.5
  },
  "averageGoldEarned": 1150,
  "averageGoldSpent": 820,
  "averageQuestsCompleted": 22.5,
  "averageQuestsFailed": 2.1,
  "averageItemsCrafted": 28.3,
  "rankBottlenecks": [
    { "rank": "C", "dropRate": 14.8, "reason": "insufficient_materials" },
    { "rank": "A", "dropRate": 7.6, "reason": "time_pressure" }
  ]
}
```

---

## 注意事項

### 再現性

- 全シミュレーションはシード値を使用し、再現可能にする
- シード値は 1 から runs までの連番を使用

### パフォーマンス

- 1000回のシミュレーションが5分以内に完了すること
- 純粋関数の呼び出しは同期的に行う（非同期不要）

### 既存コードとの互換性

- 純粋関数のシグネチャを変更しない
- 必要な型定義は既存のものをインポートする
- マスターデータはJSONファイルから直接読み込む
