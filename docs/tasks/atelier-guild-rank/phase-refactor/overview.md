# Feature-Based Architecture リファクタリング タスク概要

**作成日**: 2026-02-09
**プロジェクト期間**: 約20.5日（164時間）
**推定工数**: 164時間
**総タスク数**: 41件
**タスク粒度**: 半日（4時間）単位

## 目的

現在のClean Architecture（application/domain/infrastructure/presentation層）構造から、Feature-Based Architecture + Functional Core, Imperative Shell（FCIS）へリファクタリングする。

## 関連文書

- **アーキテクチャルール**: [📋 .claude/rules/architecture.md](../../../../.claude/rules/architecture.md)
- **UIコンポーネントルール**: [📋 .claude/rules/ui-components.md](../../../../.claude/rules/ui-components.md)
- **状態管理ルール**: [📋 .claude/rules/state-management.md](../../../../.claude/rules/state-management.md)
- **Phaserベストプラクティス**: [📋 .claude/rules/phaser-best-practices.md](../../../../.claude/rules/phaser-best-practices.md)
- **設計概要**: [📐 architecture-overview.md](../../design/atelier-guild-rank/architecture-overview.md)

## フェーズ構成

| フェーズ | 期間 | 成果物 | タスク数 | 工数 |
|---------|------|--------|----------|------|
| Phase 1 | 1.5日 | 基盤構築（ディレクトリ、設定） | 3件 | 12h |
| Phase 2 | 2日 | shared/移行完了 | 4件 | 16h |
| Phase 3 | 2日 | features/deck完了 | 4件 | 16h |
| Phase 4 | 2日 | features/gathering完了 | 4件 | 16h |
| Phase 5 | 2日 | features/alchemy完了 | 4件 | 16h |
| Phase 6 | 2日 | features/quest完了 | 4件 | 16h |
| Phase 7 | 2日 | features/inventory完了 | 4件 | 16h |
| Phase 8 | 1.5日 | features/shop完了 | 3件 | 12h |
| Phase 9 | 1.5日 | features/rank完了 | 3件 | 12h |
| Phase 10 | 2日 | scenes/移行完了 | 4件 | 16h |
| Phase 11 | 2日 | クリーンアップ・検証完了 | 4件 | 16h |

## タスク番号管理

**使用済みタスク番号**: TASK-0061 ~ TASK-0101
**次回開始番号**: TASK-0102

---

## Phase 1: 基盤構築

**期間**: 1.5日（12時間）
**目標**: リファクタリングの基盤を整備

### タスク一覧

- [ ] [TASK-0061: 新ディレクトリ構造の作成](TASK-0061.md) - 4h (DIRECT) 🔵
- [ ] [TASK-0062: tsconfigパスエイリアス設定更新](TASK-0062.md) - 4h (DIRECT) 🔵
- [ ] [TASK-0063: 既存テストのベースライン確認](TASK-0063.md) - 4h (DIRECT) 🔵

### 依存関係

```
TASK-0061 → TASK-0062
TASK-0063 (独立)
```

---

## Phase 2: shared移行

**期間**: 2日（16時間）
**目標**: 共通コードをshared/に移行

### タスク一覧

- [ ] [TASK-0064: shared/types移行と整理](TASK-0064.md) - 4h (TDD) 🔵
- [ ] [TASK-0065: shared/utils移行](TASK-0065.md) - 4h (TDD) 🔵
- [ ] [TASK-0066: shared/services作成（EventBus, StateManager移行）](TASK-0066.md) - 4h (TDD) 🔵
- [ ] [TASK-0067: shared/components作成（共通UIコンポーネント）](TASK-0067.md) - 4h (TDD) 🔵

### 依存関係

```
TASK-0062 → TASK-0064, TASK-0065
TASK-0064 → TASK-0066
TASK-0066 → TASK-0067
```

---

## Phase 3: features/deck機能

**期間**: 2日（16時間）
**目標**: デッキ機能をfeature moduleとして整理

### タスク一覧

- [ ] [TASK-0068: features/deck/types作成](TASK-0068.md) - 4h (TDD) 🔵
- [ ] [TASK-0069: features/deck/services作成（DeckService純粋関数化）](TASK-0069.md) - 4h (TDD) 🔵
- [ ] [TASK-0070: features/deck/components作成](TASK-0070.md) - 4h (TDD) 🔵
- [ ] [TASK-0071: features/deck/index.ts公開API作成](TASK-0071.md) - 4h (DIRECT) 🔵

### 依存関係

```
TASK-0064 → TASK-0068
TASK-0068 → TASK-0069
TASK-0067, TASK-0069 → TASK-0070
TASK-0070 → TASK-0071
```

---

## Phase 4: features/gathering機能

**期間**: 2日（16時間）
**目標**: 採取機能をfeature moduleとして整理

### タスク一覧

- [ ] [TASK-0072: features/gathering/types作成](TASK-0072.md) - 4h (TDD) 🔵
- [ ] [TASK-0073: features/gathering/services作成](TASK-0073.md) - 4h (TDD) 🔵
- [ ] [TASK-0074: features/gathering/components作成](TASK-0074.md) - 4h (TDD) 🔵
- [ ] [TASK-0075: features/gathering/index.ts公開API作成](TASK-0075.md) - 4h (DIRECT) 🔵

### 依存関係

```
TASK-0064 → TASK-0072
TASK-0072 → TASK-0073
TASK-0067, TASK-0073 → TASK-0074
TASK-0074 → TASK-0075
```

---

## Phase 5: features/alchemy機能

**期間**: 2日（16時間）
**目標**: 調合機能をfeature moduleとして整理

### タスク一覧

- [ ] [TASK-0076: features/alchemy/types作成](TASK-0076.md) - 4h (TDD) 🔵
- [ ] [TASK-0077: features/alchemy/services作成](TASK-0077.md) - 4h (TDD) 🔵
- [ ] [TASK-0078: features/alchemy/components作成](TASK-0078.md) - 4h (TDD) 🔵
- [ ] [TASK-0079: features/alchemy/index.ts公開API作成](TASK-0079.md) - 4h (DIRECT) 🔵

### 依存関係

```
TASK-0064 → TASK-0076
TASK-0076 → TASK-0077
TASK-0067, TASK-0077 → TASK-0078
TASK-0078 → TASK-0079
```

---

## Phase 6: features/quest機能

**期間**: 2日（16時間）
**目標**: 依頼機能をfeature moduleとして整理

### タスク一覧

- [ ] [TASK-0080: features/quest/types作成](TASK-0080.md) - 4h (TDD) 🔵
- [ ] [TASK-0081: features/quest/services作成](TASK-0081.md) - 4h (TDD) 🔵
- [ ] [TASK-0082: features/quest/components作成](TASK-0082.md) - 4h (TDD) 🔵
- [ ] [TASK-0083: features/quest/index.ts公開API作成](TASK-0083.md) - 4h (DIRECT) 🔵

### 依存関係

```
TASK-0064 → TASK-0080
TASK-0080 → TASK-0081
TASK-0067, TASK-0081 → TASK-0082
TASK-0082 → TASK-0083
```

---

## Phase 7: features/inventory機能

**期間**: 2日（16時間）
**目標**: インベントリ・素材管理機能をfeature moduleとして整理

### タスク一覧

- [ ] [TASK-0084: features/inventory/types作成](TASK-0084.md) - 4h (TDD) 🔵
- [ ] [TASK-0085: features/inventory/services作成](TASK-0085.md) - 4h (TDD) 🔵
- [ ] [TASK-0086: features/inventory/components作成](TASK-0086.md) - 4h (TDD) 🔵
- [ ] [TASK-0087: features/inventory/index.ts公開API作成](TASK-0087.md) - 4h (DIRECT) 🔵

### 依存関係

```
TASK-0064 → TASK-0084
TASK-0084 → TASK-0085
TASK-0067, TASK-0085 → TASK-0086
TASK-0086 → TASK-0087
```

---

## Phase 8: features/shop機能

**期間**: 1.5日（12時間）
**目標**: ショップ機能をfeature moduleとして整理

### タスク一覧

- [ ] [TASK-0088: features/shop/types作成](TASK-0088.md) - 4h (TDD) 🔵
- [ ] [TASK-0089: features/shop/services作成](TASK-0089.md) - 4h (TDD) 🔵
- [ ] [TASK-0090: features/shop/components and index.ts作成](TASK-0090.md) - 4h (TDD) 🔵

### 依存関係

```
TASK-0064 → TASK-0088
TASK-0088 → TASK-0089
TASK-0067, TASK-0089 → TASK-0090
```

---

## Phase 9: features/rank機能

**期間**: 1.5日（12時間）
**目標**: ランク機能をfeature moduleとして整理

### タスク一覧

- [ ] [TASK-0091: features/rank/types作成](TASK-0091.md) - 4h (TDD) 🔵
- [ ] [TASK-0092: features/rank/services作成](TASK-0092.md) - 4h (TDD) 🔵
- [ ] [TASK-0093: features/rank/components and index.ts作成](TASK-0093.md) - 4h (TDD) 🔵

### 依存関係

```
TASK-0064 → TASK-0091
TASK-0091 → TASK-0092
TASK-0067, TASK-0092 → TASK-0093
```

---

## Phase 10: scenes移行

**期間**: 2日（16時間）
**目標**: Phaserシーンをscenes/に移行

### タスク一覧

- [ ] [TASK-0094: scenes/ディレクトリ作成とBootScene移行](TASK-0094.md) - 4h (TDD) 🔵
- [ ] [TASK-0095: scenes/MainScene移行](TASK-0095.md) - 4h (TDD) 🔵
- [ ] [TASK-0096: scenes/その他シーン移行（RankUp, Shop等）](TASK-0096.md) - 4h (TDD) 🔵
- [ ] [TASK-0097: scene間のインポート整理](TASK-0097.md) - 4h (DIRECT) 🔵

### 依存関係

```
TASK-0066 → TASK-0094
TASK-0094, TASK-0071, TASK-0075, TASK-0079, TASK-0083 → TASK-0095
TASK-0095, TASK-0090, TASK-0093 → TASK-0096
TASK-0096 → TASK-0097
```

---

## Phase 11: クリーンアップと統合

**期間**: 2日（16時間）
**目標**: 旧コード削除、最終検証

### タスク一覧

- [ ] [TASK-0098: 旧ディレクトリ削除](TASK-0098.md) - 4h (DIRECT) 🔵
- [ ] [TASK-0099: 全体インポートパス最終確認](TASK-0099.md) - 4h (DIRECT) 🔵
- [ ] [TASK-0100: テストの最終確認とカバレッジ検証](TASK-0100.md) - 4h (DIRECT) 🔵
- [ ] [TASK-0101: ドキュメント更新](TASK-0101.md) - 4h (DIRECT) 🔵

### 依存関係

```
TASK-0097 → TASK-0098
TASK-0098 → TASK-0099
TASK-0099 → TASK-0100
TASK-0100 → TASK-0101
```

---

## 信頼性レベルサマリー

### 全タスク統計

- **総タスク数**: 41件
- 🔵 **青信号**: 41件 (100%)
- 🟡 **黄信号**: 0件 (0%)
- 🔴 **赤信号**: 0件 (0%)

### フェーズ別信頼性

| フェーズ | 🔵 青 | 🟡 黄 | 🔴 赤 | 合計 |
|---------|-------|-------|-------|------|
| Phase 1 | 3 | 0 | 0 | 3 |
| Phase 2 | 4 | 0 | 0 | 4 |
| Phase 3 | 4 | 0 | 0 | 4 |
| Phase 4 | 4 | 0 | 0 | 4 |
| Phase 5 | 4 | 0 | 0 | 4 |
| Phase 6 | 4 | 0 | 0 | 4 |
| Phase 7 | 4 | 0 | 0 | 4 |
| Phase 8 | 3 | 0 | 0 | 3 |
| Phase 9 | 3 | 0 | 0 | 3 |
| Phase 10 | 4 | 0 | 0 | 4 |
| Phase 11 | 4 | 0 | 0 | 4 |

**品質評価**: ✅ 高品質（全タスクが設計文書に基づいており、信頼性が高い）

---

## クリティカルパス

```
TASK-0061 → TASK-0062 → TASK-0064 → TASK-0068 → TASK-0069 → TASK-0070 → TASK-0071 → TASK-0095 → TASK-0096 → TASK-0097 → TASK-0098 → TASK-0099 → TASK-0100 → TASK-0101
```

**クリティカルパス工数**: 約56時間（14タスク）
**並行作業可能工数**: 約108時間

---

## ディレクトリ構造変更サマリー

### Before（Clean Architecture）
```
src/
├── application/    # → 削除
├── domain/         # → 削除
├── infrastructure/ # → 削除
├── presentation/   # → 削除
└── shared/         # → 維持・拡張
```

### After（Feature-Based Architecture）
```
src/
├── features/
│   ├── quest/
│   ├── alchemy/
│   ├── gathering/
│   ├── deck/
│   ├── inventory/
│   ├── shop/
│   └── rank/
├── shared/
│   ├── components/
│   ├── services/
│   ├── types/
│   └── utils/
├── scenes/
└── main.ts
```

---

## 次のステップ

タスクを実装するには:
- 全タスク順番に実装: `/tsumiki:kairo-implement`
- 特定タスクを実装: `/tsumiki:kairo-implement TASK-0061`

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|----------|---------|
| 2026-02-09 | 1.0.0 | 初版作成 |
