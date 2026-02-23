# Simulator Agent 指示テンプレート

## 役割

ゲームプレイのシミュレーションスクリプトを作成・実行し、バランス分析の基礎データを生成する。

## 参照すべきファイル

### 必読
1. `.claude/skills/balance-tuning-cycle/references/simulation-spec.md` — シミュレーション仕様

### マスターデータ
2. `atelier-guild-rank/public/data/game-balance.json` — バランスパラメータ
3. `atelier-guild-rank/public/data/cards.json` — カードマスター
4. `atelier-guild-rank/public/data/materials.json` — 素材マスター
5. `atelier-guild-rank/public/data/recipes.json` — レシピ・アイテムマスター
6. `atelier-guild-rank/public/data/quests.json` — 依頼者・依頼マスター
7. `atelier-guild-rank/public/data/ranks.json` — ランクマスター

### 純粋関数（再利用対象）
8. `atelier-guild-rank/src/features/quest/services/generate-quests.ts`
9. `atelier-guild-rank/src/features/quest/services/calculate-reward.ts`
10. `atelier-guild-rank/src/features/alchemy/services/calculate-quality.ts`
11. `atelier-guild-rank/src/features/alchemy/services/craft.ts`
12. `atelier-guild-rank/src/features/alchemy/services/check-recipe-requirements.ts`

### 型定義
13. `atelier-guild-rank/src/shared/types/common.ts`
14. `atelier-guild-rank/src/shared/types/master-data.ts`
15. `atelier-guild-rank/src/shared/types/quests.ts`
16. `atelier-guild-rank/src/shared/types/materials.ts`

## 作業手順

### Step 1: 純粋関数の分析

既存の純粋関数のシグネチャと依存関係を確認する。
関数が期待する引数の型と戻り値の型を把握する。

### Step 2: シミュレーションスクリプト作成

`atelier-guild-rank/tests/simulation/game-simulation.test.ts` に作成する。

#### スクリプトの基本構造

```typescript
import { describe, it, expect } from 'vitest';
// 既存関数のインポート
// マスターデータの読み込み
// シミュレーションロジック
// 結果集計
```

#### 実装する関数

1. **`createSimulationState(seed: number)`**: 初期ゲーム状態を生成
2. **`simulateDay(state, day)`**: 1日のプレイサイクルをシミュレーション
3. **`simulateQuestAccept(state)`**: 依頼受注フェーズ
4. **`simulateGathering(state)`**: 採取フェーズ
5. **`simulateAlchemy(state)`**: 調合フェーズ
6. **`simulateDelivery(state)`**: 納品フェーズ
7. **`checkPromotion(state)`**: 昇格判定
8. **`runSingleSimulation(seed)`**: 1ゲームの完全シミュレーション
9. **`runSimulations(count)`**: N回シミュレーション実行と結果集計

### Step 3: AI戦略の実装

「平均的なプレイヤー」を模擬する戦略:

- **依頼選択**: 達成可能性 × 報酬効率でスコアリング、上位から選択（20%のランダム性）
- **採取**: 必要素材の優先度でカード選択
- **調合**: 依頼条件に合うレシピを優先
- **納品**: 期限が近い依頼から優先

### Step 4: シミュレーション実行

```bash
pnpm --filter atelier-guild-rank test -- --run tests/simulation/game-simulation.test.ts
```

### Step 5: 結果報告

結果をJSON形式でまとめ、SendMessageでcycle-leadに送信する。

## 出力形式

### テスト出力（コンソール）

```
✓ シミュレーション 1000回実行 (Xms)
  - クリア率: 32.5%
  - 平均最終日: 24.3日
  - ランク到達率: F:98.5% E:90.2% D:75.1% ...
```

### SendMessage内容

```markdown
# Simulation Report - Cycle {N}

## 実行結果
- 実行回数: 1000
- 実行時間: X秒
- エラー: 0件

## サマリー
- クリア率: 32.5%
- 平均最終日: 24.3日
- 中央値最終日: 25日

## ランク到達率
| ランク | 到達率 | 平均到達日 |
|--------|--------|-----------|
| F | 98.5% | 4.2日 |
| E | 90.2% | 8.5日 |
| ... | | |

## 経済サマリー
- 平均総獲得ゴールド: 1150
- 平均総消費ゴールド: 820
- ゴールド破産率: 8.5%

## 結果JSONパス
tests/simulation/results/cycle-{N}-results.json
```

## 注意事項

### 既存関数が使えない場合

純粋関数のシグネチャが複雑で直接呼び出せない場合は:
1. 関数のロジックを読み取り、同等の簡略版を実装
2. 簡略化した箇所を明記
3. 実際のゲームとの乖離を報告

### パフォーマンス

- 1000回のシミュレーションが5分以内に完了すること
- 遅い場合は runs を減らすか、ロジックを簡略化

### デバッグ

- 最初の5回は詳細ログを出力して動作確認
- その後は結果のみ集計

## 禁止事項

- 既存の純粋関数のシグネチャを変更しない
- マスターデータファイルを変更しない
- game-balance.json を変更しない（読み取りのみ）
- src/ 配下のファイルを変更しない
