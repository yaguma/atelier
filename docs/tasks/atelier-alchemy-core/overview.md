# atelier-alchemy-core タスク概要

**作成日**: 2026-07-12
**プロジェクト期間**: 着手日から約31営業日（約6.5週間）
**推定工数**: 248時間
**総タスク数**: 39件

## 関連文書

- **要件定義書**: [📋 requirements.md](../../spec/atelier-alchemy-core/requirements.md)
- **ユーザストーリー**: [📖 user-stories.md](../../spec/atelier-alchemy-core/user-stories.md)
- **受け入れ基準**: [✅ acceptance-criteria.md](../../spec/atelier-alchemy-core/acceptance-criteria.md)
- **設計文書（アーキテクチャ）**: [📐 architecture.md](../../design/atelier-alchemy-core/architecture.md)
- **データフロー図**: [🔄 dataflow.md](../../design/atelier-alchemy-core/dataflow.md)
- **データモデル**: [🗄️ data-model.md](../../design/atelier-alchemy-core/data-model.md)
- **コンテキストノート**: [📝 note.md](../../spec/atelier-alchemy-core/note.md)
- **ヒアリング記録（設計）**: [💬 design-interview.md](../../design/atelier-alchemy-core/design-interview.md)

> **前提**: 本プロジェクトはGodot 4.x + GDScriptへの技術スタック移行（NFR-301, 2026-07-09確定）を前提とする新規実装です。現行 `atelier-guild-rank`（Phaser3+TS）は継続開発せず、新規Godotプロジェクトとして構築します。

## フェーズ構成

| フェーズ | 目安期間 | 成果物 | タスク数 | 工数 | ファイル |
|---------|------|--------|----------|------|----------|
| Phase 1 | 4営業日 | Godotプロジェクト基盤・環境構築 | 7 | 32h | [TASK-0001~0007](#phase-1-基盤構築環境構築) |
| Phase 2 | 3営業日 | 調合コアの面白さ仮説検証プロトタイプ | 3 | 18h | [TASK-0008~0010](#phase-2-プロトタイプ検証) |
| Phase 3 | 9営業日 | 調合コアロジック（Functional Core）★核心 | 10 | 72h | [TASK-0011~0020](#phase-3-調合コアロジック核心) |
| Phase 4 | 5営業日 | 庭（仕込み層）システム | 6 | 40h | [TASK-0021~0026](#phase-4-庭仕込み層) |
| Phase 5 | 5営業日 | ギルド納品・ランク進行システム | 6 | 40h | [TASK-0027~0032](#phase-5-ギルド納品ランク進行) |
| Phase 6 | 6営業日 | 工房強化・段階的開示・統合検証 | 7 | 46h | [TASK-0033~0039](#phase-6-工房強化段階的開示統合検証) |

**フェーズ順序の根拠**: `acceptance-criteria.md`の「テスト実施計画」（Phase 0: プロトタイプ検証 → Phase 1: 調合コアロジック → Phase 2: 庭 → Phase 3: 納品・ランク進行 → Phase 4: 工房強化・段階的開示）の優先順位をそのままタスクフェーズ順序として採用（ヒアリングで確定）。ただしGodotプロジェクト自体が未スキャフォールディングのため、その前段として「Phase 1: 基盤構築」を追加している。

## タスク番号管理

**使用済みタスク番号**: TASK-0001 ～ TASK-0039
**次回開始番号**: TASK-0040

## 全体進捗

- [x] Phase 1: 基盤構築（環境構築）
- [ ] Phase 2: プロトタイプ検証
- [ ] Phase 3: 調合コアロジック（★核心）
- [ ] Phase 4: 庭（仕込み層）
- [ ] Phase 5: ギルド納品・ランク進行
- [ ] Phase 6: 工房強化・段階的開示・統合検証

## マイルストーン

- **M1: 基盤完成**: Godotプロジェクト・GUT・共通定数（game_balance.gd/theme.gd）の構築完了（Phase 1完了時）
- **M2: 仮説検証完了**: 1画面プロトタイプで「調合で一瞬迷うか」の観察結果が得られる（Phase 2完了時）。NOの場合は特性の相反ボーナス設計を見直す必要があり、以降のフェーズに影響しうる
- **M3: 調合コア完成**: 品質計算・特性発現・系統排他・貢献度/報酬算出のFunctional Coreとその結合UIが完成（Phase 3完了時）
- **M4: コアループ一巡可能**: 庭→調合→納品→ランク進行→工房強化の全ループを手動プレイで通しでプレイできる（Phase 6完了時）

## 依存関係（フェーズ間）

```
Phase 1（基盤構築）
  → Phase 2（プロトタイプ検証） ※TASK-0008はTASK-0005に依存
  → Phase 3（調合コアロジック） ※TASK-0011はTASK-0002に依存
      → Phase 4（庭） ※TASK-0023はTASK-0011, TASK-0004に依存
      → Phase 5（ギルド納品・ランク進行） ※TASK-0028はTASK-0011, TASK-0029はTASK-0019に依存
          → Phase 6（工房強化・段階的開示・統合検証） ※TASK-0034はTASK-0031、TASK-0037はTASK-0014, TASK-0020, TASK-0031に依存
```

---

## Phase 1: 基盤構築（環境構築）

**目安期間**: 4営業日（32時間）
**目標**: Godot 4.xプロジェクトの新規スキャフォールディングと、Functional Core/Imperative Shellの土台となる共通基盤を整備する
**成果物**: `project.godot`、Feature-Basedディレクトリ構造、GUT導入済みテスト基盤、RngService、共通定数（GAME_CONFIG/THEME相当）

### タスク一覧

- [x] [TASK-0001: Godotプロジェクト新規作成](TASK-0001.md) - 4h (DIRECT) 🔵 ✅ 完了 (2026-07-14)
- [x] [TASK-0002: Feature-Basedディレクトリ構造構築](TASK-0002.md) - 4h (DIRECT) 🟡 ✅ 完了 (2026-07-20)
- [x] [TASK-0003: GUT（Godot Unit Test）導入・設定](TASK-0003.md) - 6h (DIRECT) 🟡 ✅ 完了 (2026-07-20)
- [x] [TASK-0004: RngService Autoload実装](TASK-0004.md) - 8h (TDD) 🔵 ✅ 完了 (2026-07-21)
- [x] [TASK-0005: game_balance.gd（GAME_CONFIG相当）定数クラス作成](TASK-0005.md) - 4h (DIRECT) 🔵 ✅ 完了 (2026-07-21)
- [x] [TASK-0006: theme.gd（THEME相当）基本テーマ定数作成](TASK-0006.md) - 4h (DIRECT) 🟡 ✅ 完了 (2026-07-21)
- [x] [TASK-0007: CLAUDE.md技術スタック記載の更新](TASK-0007.md) - 2h (DIRECT) 🔵 ✅ 完了 (2026-07-21)

### 依存関係

```
TASK-0001 → TASK-0002 → TASK-0003
TASK-0002 → TASK-0004
TASK-0002 → TASK-0005
TASK-0002 → TASK-0006
TASK-0001 → TASK-0007
```

---

## Phase 2: プロトタイプ検証

**目安期間**: 3営業日（18時間）
**目標**: コンセプト文書6章「検証すべき最優先の仮説」（調合で一瞬迷うか）を、庭・時間経過等を作り込む前に低コストで検証する
**成果物**: 1画面プロトタイプ（`features/prototype/ui/alchemy_prototype.tscn`）、観察記録

### タスク一覧

- [ ] [TASK-0008: プロトタイプ用ダミーマスターデータ作成](TASK-0008.md) - 6h (DIRECT) 🔵
- [ ] [TASK-0009: 1画面プロトタイプUI実装](TASK-0009.md) - 8h (TDD) 🔵
- [ ] [TASK-0010: プロトタイプ手動検証実施・観察記録](TASK-0010.md) - 4h (DIRECT) 🔵

### 依存関係

```
TASK-0005 → TASK-0008 → TASK-0009 → TASK-0010
```

---

## Phase 3: 調合コアロジック（★核心）

**目安期間**: 9営業日（72時間）
**目標**: 品質計算・特性発現閾値判定・品質ペナルティ・貢献度系/報酬系の系統排他制御・貢献度/報酬算出という、ゲームデザインレビューで複数回の仕様改訂を経た最重要ロジック群をFunctional Coreとして実装し、UIと結合する
**成果物**: `features/alchemy/logic/*.gd`（QualityCalculator, TraitActivation, ValueCalculator, AlchemyResolver）、`features/alchemy/data/*.gd`、`GameState.craft()`、AlchemyBench UI

### タスク一覧

- [ ] [TASK-0011: データモデル実装: TraitDefinition, MaterialInstance](TASK-0011.md) - 6h (TDD) 🔵
- [ ] [TASK-0012: データモデル実装: RecipeDefinition, CraftResult](TASK-0012.md) - 6h (TDD) 🔵
- [ ] [TASK-0013: QualityCalculator.calculate_base_quality実装](TASK-0013.md) - 6h (TDD) 🔵
- [ ] [TASK-0014: TraitActivation.resolve_activated_traits実装](TASK-0014.md) - 8h (TDD) 🔵
- [ ] [TASK-0015: TraitActivation.resolve_category_conflict実装](TASK-0015.md) - 8h (TDD) 🔵
- [ ] [TASK-0016: QualityCalculator.apply_trait_penalty実装](TASK-0016.md) - 6h (TDD) 🔵
- [ ] [TASK-0017: ValueCalculator（貢献度/報酬算出）実装](TASK-0017.md) - 8h (TDD) 🟡
- [ ] [TASK-0018: AlchemyResolver.craft オーケストレーター実装](TASK-0018.md) - 8h (TDD) 🔵
- [ ] [TASK-0019: GameState.craft()連携実装](TASK-0019.md) - 8h (TDD) 🔵
- [ ] [TASK-0020: AlchemyBench UI実装（調合台画面）](TASK-0020.md) - 8h (TDD) 🔵

### 依存関係

```
TASK-0011 → TASK-0012
TASK-0011 → TASK-0013
TASK-0011, TASK-0012 → TASK-0014 → TASK-0015
TASK-0013, TASK-0015 → TASK-0016
TASK-0012, TASK-0016 → TASK-0017
TASK-0013, TASK-0014, TASK-0015, TASK-0016, TASK-0017 → TASK-0018 → TASK-0019 → TASK-0020
```

**申し送り事項（TASK-0019/TASK-0020より）**: `dataflow.md`（機能2は`consume_materials`/`add_completed_item`のみ、rank_hp/gold更新は機能3側）と`data-model.md`の`GameState.craft()`定義（craft()単体でrank_hp/gold更新まで行う）に設計上の不整合があることが実装調査で判明した。Phase 5（ギルド納品）着手前に、rank_hp/gold更新の責務をcraft()単体で完結させるか、納品処理側に委ねるかを確定させる必要がある。

---

## Phase 4: 庭（仕込み層）

**目安期間**: 5営業日（40時間）
**目標**: 調合への素材供給層である庭システムを実装する。空間配置パズルは廃止済みで、スロット数のみで植栽数を制限するシンプルな設計
**成果物**: `features/garden/logic/*.gd`（GrowthCalculator, TraitRoll）、`features/garden/data/seed_definition.gd`、GameState庭状態管理、GardenPanel UI

### タスク一覧

- [ ] [TASK-0021: SeedDefinitionデータモデル実装](TASK-0021.md) - 4h (TDD) 🔵
- [ ] [TASK-0022: GrowthCalculator（成熟/枯死判定）実装](TASK-0022.md) - 8h (TDD) 🔵
- [ ] [TASK-0023: TraitRoll（特性乱数付与）実装](TASK-0023.md) - 6h (TDD) 🔵
- [ ] [TASK-0024: GameState庭状態管理実装](TASK-0024.md) - 8h (TDD) 🔵
- [ ] [TASK-0025: GardenPanel UI実装](TASK-0025.md) - 8h (TDD) 🔵
- [ ] [TASK-0026: 注文生産（逆算種選択）実装](TASK-0026.md) - 6h (TDD) 🟡

### 依存関係

```
TASK-0021 → TASK-0022
TASK-0021, TASK-0011 → TASK-0023
TASK-0022, TASK-0023 → TASK-0024 → TASK-0025 → TASK-0026
```

---

## Phase 5: ギルド納品・ランク進行

**目安期間**: 5営業日（40時間）
**目標**: 調合完了品の自動納品と、HPを持つ「敵」としてのギルドランクの進行・勝敗判定を実装する
**成果物**: `features/guild/logic/delivery_calculator.gd`、`features/guild/data/*.gd`（RankDefinition, DailyRequest）、GameState納品・ランク判定処理、DailyRequestBanner UI

### タスク一覧

- [ ] [TASK-0027: RankDefinition, DailyRequestデータモデル実装](TASK-0027.md) - 4h (TDD) 🟡
- [ ] [TASK-0028: DeliveryCalculator（指定合致判定）実装](TASK-0028.md) - 6h (TDD) 🔵
- [ ] [TASK-0029: GameState納品処理実装](TASK-0029.md) - 8h (TDD) 🔵
- [ ] [TASK-0030: ランクHP/制限ターン判定実装](TASK-0030.md) - 8h (TDD) 🟡
- [ ] [TASK-0031: ランク進行順序管理実装](TASK-0031.md) - 6h (TDD) 🟡
- [ ] [TASK-0032: DailyRequestBanner・ランク進行UI実装](TASK-0032.md) - 8h (TDD) 🔵

### 依存関係

```
TASK-0027 → TASK-0028 → TASK-0029 → TASK-0030
TASK-0027 → TASK-0031
TASK-0019 → TASK-0029
TASK-0029, TASK-0030, TASK-0031 → TASK-0032
```

---

## Phase 6: 工房強化・段階的開示・統合検証

**目安期間**: 6営業日（46時間）
**目標**: 金の使い道（恒久投資・消耗投資）と特性の段階的開示を実装し、最後に庭→調合→納品→ランク進行→工房強化の全体ループを結合・手動検証する
**成果物**: `features/workshop/*`（UpgradeDefinition, 恒久/消耗投資UI）、段階的開示のUI/ロジック結線、`scenes/main.tscn`、統合検証結果

### タスク一覧

- [ ] [TASK-0033: UpgradeDefinitionデータモデル実装](TASK-0033.md) - 4h (TDD) 🔵
- [ ] [TASK-0034: 恒久投資ロジック・PermanentUpgradeScreen実装](TASK-0034.md) - 8h (TDD) 🔵
- [ ] [TASK-0035: 消耗投資ロジック・ConsumableShopPanel実装](TASK-0035.md) - 8h (TDD) 🔵
- [ ] [TASK-0036: ターン延長不可の保証・検証](TASK-0036.md) - 4h (TDD) 🔵
- [ ] [TASK-0037: 段階的開示のUI/ロジック結線](TASK-0037.md) - 8h (TDD) 🔵
- [ ] [TASK-0038: main.tscn工房メイン画面の結線・シーン遷移実装](TASK-0038.md) - 8h (TDD) 🟡
- [ ] [TASK-0039: 全体ループ統合検証](TASK-0039.md) - 6h (DIRECT) 🟡

### 依存関係

```
TASK-0033 → TASK-0034
TASK-0033 → TASK-0035
TASK-0031 → TASK-0034
TASK-0034, TASK-0035 → TASK-0036
TASK-0014, TASK-0031, TASK-0020 → TASK-0037
TASK-0020, TASK-0025, TASK-0032, TASK-0034, TASK-0035, TASK-0037 → TASK-0038 → TASK-0039
```

---

## 信頼性レベルサマリー

### 全タスク統計（全39タスクファイルの実装詳細・単体テスト・統合テスト・UI/UX要件項目を集計）

- **総項目数**: 311項目
- 🔵 **青信号**: 186項目 (60%)
- 🟡 **黄信号**: 123項目 (40%)
- 🔴 **赤信号**: 2項目 (1%)

### フェーズ別信頼性（項目集計）

| フェーズ | 🔵 青 | 🟡 黄 | 🔴 赤 | 合計 |
|---------|-------|-------|-------|------|
| Phase 1 | 27 | 15 | 0 | 42 |
| Phase 2 | 11 | 10 | 0 | 21 |
| Phase 3 | 45 | 41 | 1 | 87 |
| Phase 4 | 26 | 24 | 0 | 50 |
| Phase 5 | 25 | 17 | 1 | 43 |
| Phase 6 | 52 | 16 | 0 | 68 |

### タスク単位の総合信頼性レベル分布

- 🔵 青信号タスク: 29件（74%）— TASK-0001, 0004, 0005, 0007, 0008, 0009, 0010, 0011, 0012, 0013, 0014, 0015, 0016, 0018, 0019, 0020, 0021, 0022, 0023, 0024, 0025, 0028, 0029, 0032, 0033, 0034, 0035, 0036, 0037
- 🟡 黄信号タスク: 10件（26%）— TASK-0002, 0003, 0006, 0017, 0026, 0027, 0030, 0031, 0038, 0039
- 🔴 赤信号タスク: なし

**品質評価**: 高品質。要件定義書・受け入れ基準・データモデル・アーキテクチャ設計が非常に詳細（特にPhase 3の調合コアロジックはゲームデザインレビュー・Godotアーキテクトレビューを経て複数回改訂済み）なため、全体の60%が🔵で裏付けられている。🟡の主因は (1) 未確定のバランス数値（基礎貢献度・報酬係数、制限ターン数、恒久投資価格等、要件定義書側もTBDと明記）、(2) Godot固有の実装詳細（ディレクトリ構造・GUT導入手順・main.tscn結線方法）の妥当な推測、の2点に集約される。🔴はTASK-0017（報酬計算式の一部係数）とTASK-0031（ランク進行順序、正式名称未確定）内の各1項目のみで、いずれも要件定義書で明示的にTBDとされている数値そのものであり、構造面での懸念ではない。

**残存する要確認事項（次フェーズへの申し送り）**:
- Phase 3完了時点で判明した「rank_hp/gold更新の責務分担」のdataflow.md/data-model.md間の不整合（TASK-0019, TASK-0020参照）は、Phase 5着手前に設計レベルで確定させること
- バランス数値TBD項目（REQ-109/110の係数、REQ-205の制限ターン数、REQ-206の降格ペナルティ、REQ-123の追加特性種類、REQ-306の価格、REQ-403のランク区分）は、`balance-tuning-cycle`スキル等で本タスク群の実装完了後に確定させること

## クリティカルパス

```
TASK-0001 → TASK-0002 → TASK-0011 → TASK-0012 → TASK-0014 → TASK-0015 → TASK-0016 → TASK-0017 → TASK-0018 → TASK-0019 → TASK-0020
  → TASK-0029（Phase5, TASK-0019依存） → TASK-0030 → TASK-0032
  → TASK-0037（Phase6, TASK-0014/0020依存） → TASK-0038 → TASK-0039
```

**クリティカルパス工数**: 約120時間（Phase 1土台〜Phase 3調合コア〜Phase 5納品判定〜Phase 6統合、概算）
**並行作業可能工数**: 約128時間（Phase 2プロトタイプ検証、Phase 4庭システム、Phase 6の恒久/消耗投資まわりはクリティカルパス外で並行実施可能）

## 次のステップ

タスクを実装するには:
- 全タスク順番に実装: `/tsumiki:kairo-implement`
- 特定タスクを実装: `/tsumiki:kairo-implement TASK-0001`

推奨着手順序: TASK-0001（Godotプロジェクト作成）から開始し、Phase 1完了後にPhase 2（プロトタイプ検証）でコンセプトの中核仮説を検証してからPhase 3（調合コア）に進むこと。
