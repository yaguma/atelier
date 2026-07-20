# UIモックアップ実装 タスク概要

**作成日**: 2026-06-17
**推定工数**: 87時間
**総タスク数**: 13件

## 関連文書

- **設計文書**: [📐 architecture.md](../../design/ui-mockup-implementation/architecture.md)
- **データフロー図**: [🔄 dataflow.md](../../design/ui-mockup-implementation/dataflow.md)
- **インターフェース定義**: [📝 interfaces.ts](../../design/ui-mockup-implementation/interfaces.ts)
- **ヒアリング記録**: [📋 design-interview.md](../../design/ui-mockup-implementation/design-interview.md)
- **モックアップ計画**: [mockup-implementation-plan.md](../../design/atelier-guild-rank/ui-design/mockup-implementation-plan.md)

## フェーズ構成

| フェーズ | 成果物 | タスク数 | 工数 | タスク |
|---------|--------|----------|------|--------|
| Phase 1 | 共通コンポーネント基盤 | 5 | 25h | TASK-0001~0005 |
| Phase 2 | フェーズワークスペース | 4 | 32h | TASK-0006~0009 |
| Phase 3 | 独立シーン | 4 | 30h | TASK-0010~0013 |

## タスク番号管理

**使用済みタスク番号**: TASK-0001 ~ TASK-0013
**次回開始番号**: TASK-0014

## 全体進捗

- [ ] Phase 1: 共通コンポーネント基盤
- [ ] Phase 2: フェーズワークスペース
- [ ] Phase 3: 独立シーン

## マイルストーン

- **M1: 共通基盤完成**: HUD/サイドバー/フッター/タブの作り直し完了
- **M2: フェーズUI完成**: 4フェーズワークスペースの作り直し完了
- **M3: 全画面完成**: 独立4シーンの作り直し完了

---

## Phase 1: 共通コンポーネント基盤

**目標**: 全フェーズ画面で使用する常駐UIをモックアップに合わせる
**成果物**: HUDBar / SidebarUI / FooterUI / PhaseRail + トークン拡張

### タスク一覧

- [ ] [TASK-0001: デザイントークン拡張（第3ボタン・フェーズアクセント）](TASK-0001.md) - 3h (DIRECT) 🟡
- [ ] [TASK-0002: HUDBar 作り直し](TASK-0002.md) - 6h (TDD) 🔵
- [ ] [TASK-0003: SidebarUI 作り直し](TASK-0003.md) - 6h (TDD) 🔵
- [ ] [TASK-0004: FooterUI 作り直し](TASK-0004.md) - 6h (TDD) 🔵
- [ ] [TASK-0005: PhaseRail 作り直し](TASK-0005.md) - 4h (TDD) 🔵

### 依存関係

```
TASK-0001 → TASK-0002
TASK-0001 → TASK-0003
TASK-0001 → TASK-0004 → TASK-0005
```

---

## Phase 2: フェーズワークスペース

**目標**: 4ゲームフェーズのワークスペースUIをモックアップに合わせる
**成果物**: QuestAccept / Gathering / Alchemy / DeliveryPhaseUI

### タスク一覧

- [ ] [TASK-0006: QuestAcceptPhaseUI 作り直し](TASK-0006.md) - 8h (TDD) 🔵
- [ ] [TASK-0007: GatheringPhaseUI 作り直し](TASK-0007.md) - 8h (TDD) 🔵
- [ ] [TASK-0008: AlchemyPhaseUI 作り直し](TASK-0008.md) - 8h (TDD) 🔵
- [ ] [TASK-0009: DeliveryPhaseUI 作り直し](TASK-0009.md) - 8h (TDD) 🔵

### 依存関係

```
TASK-0002,0003,0004,0005 → TASK-0006 → TASK-0007 → TASK-0008 → TASK-0009
```

---

## Phase 3: 独立シーン

**目標**: タイトル/クリア/ショップ/ランクアップの独立シーンをモックアップに合わせる
**成果物**: TitleScene / GameClearScene / ShopScene / RankUpScene

### タスク一覧

- [ ] [TASK-0010: TitleScene 作り直し](TASK-0010.md) - 8h (TDD) 🔵
- [ ] [TASK-0011: GameClearScene 作り直し](TASK-0011.md) - 6h (TDD) 🟡
- [ ] [TASK-0012: ShopScene 作り直し](TASK-0012.md) - 8h (TDD) 🔵
- [ ] [TASK-0013: RankUpScene 作り直し](TASK-0013.md) - 8h (TDD) 🔵

### 依存関係

```
TASK-0001,0009 → TASK-0010 → TASK-0011 → TASK-0012 → TASK-0013
```

---

## 信頼性レベルサマリー

### 全タスク統計

- **総タスク数**: 13件
- 🔵 青信号: 11件 (85%)
- 🟡 黄信号: 2件 (15%)
- 🔴 赤信号: 0件 (0%)

### フェーズ別信頼性

| フェーズ | 🔵 青 | 🟡 黄 | 🔴 赤 | 合計 |
|---------|-------|-------|-------|------|
| Phase 1 | 4 | 1 | 0 | 5 |
| Phase 2 | 4 | 0 | 0 | 4 |
| Phase 3 | 3 | 1 | 0 | 4 |

**品質評価**: ✅ 高品質

## クリティカルパス

```
TASK-0001 → TASK-0004 → TASK-0005 → TASK-0006 → TASK-0007 → TASK-0008 → TASK-0009 → TASK-0010 → TASK-0011 → TASK-0012 → TASK-0013
```

**クリティカルパス工数**: 約77時間
**並行作業可能**: TASK-0002/0003 は TASK-0004/0005 と並行可能

## 次のステップ

タスクを実装するには:
- 全タスク順番に実装: `/tsumiki:kairo-implement`
- 特定タスクを実装: `/tsumiki:kairo-implement TASK-0001`
