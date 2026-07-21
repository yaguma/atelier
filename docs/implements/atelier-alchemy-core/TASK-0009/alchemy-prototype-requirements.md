# TASK-0009 要件定義書: 1画面調合プロトタイプ

**機能名**: 1画面調合プロトタイプ（alchemy-prototype）
**タスクID**: TASK-0009
**要件名**: atelier-alchemy-core
**タスクタイプ**: TDD
**作成日**: 2026-07-21

---

## 概要

本タスクは、正式な`AlchemyResolver`（Phase 3）を待たず、プロトタイプ専用の簡易調合ロジックと1画面UIを実装し、REQ-501の仮説「素材の品質・特性の組み合わせによって成果物が変わることが、プレイヤーに"一瞬迷う"感覚を与えるか」を検証する。実装は`features/prototype/`配下に隔離し、正式実装（`features/alchemy/`）を汚染しない。

TDDの主対象は純粋関数`PrototypeAlchemyResolver.resolve(materials)`（Functional Core）である。UI層（Imperative Shell）は動作確認要件として扱う。

---

## 1. 機能の概要（EARS要件定義書・設計文書ベース）

- 🔵 **何をする機能か**: 品質・特性の異なるダミー素材をボタン操作で即時入手し、投入枠（初期4枠）へ配置し、簡易計算ロジックで完成品の品質・発現特性を1画面内に算出・表示する。*参照: REQ-501, REQ-502, REQ-503*
- 🔵 **どのような問題を解決するか**: 正式な調合コアロジック（Phase 3）の実装前に、「素材の組み合わせで成果物が変わる」体験が"一瞬迷う"感覚を生むかを最短で検証する。庭・時間経過・演出の作り込みを排し、仮説検証にフォーカスする。*参照: REQ-501, REQ-502*
- 🔵 **想定されるユーザー**: プロトタイプ操作者（開発者・ゲームデザイン検証者）。TASK-0010でこのプロトタイプを操作し「迷うか」を観察記録する。*参照: user-stories.md ストーリー5.1, TASK-0010*
- 🔵 **システム内での位置づけ**: Functional Core / Imperative Shell分離に基づき、計算ロジックを`static func`の純粋関数として分離し、UI層と切り離す。Feature-Based Architectureに従い`features/prototype/`に隔離する。*参照: architecture.md「Functional Core」「Feature-Based Architecture」*

- **参照したEARS要件**: REQ-501, REQ-502, REQ-503, REQ-101
- **参照した設計文書**: architecture.md（Functional Core方針, `features/prototype/ui/alchemy_prototype.tscn`）

---

## 2. 入力・出力の仕様

### 2.1 純粋関数 `PrototypeAlchemyResolver.resolve(materials)`（Functional Core）

- 🔵 **入力**: `materials: Array`（投入枠に配置された素材の配列）。各要素は`Dictionary`で、少なくとも以下を持つ。*参照: note.md テストテンプレート, prototype_material_definitions.gd*
  - `quality: int` — 品質スコア（D=1, C=2, B=3, A=4, S=5）
  - `traits: Array`（特性タグIDの配列。特性なし素材は空配列）
  - 制約: 配列長は0〜4（投入枠数、REQ-101）を想定。空配列は「投入枠が空」を意味する。

- 🔵🟡 **出力**: `Dictionary`。*参照: note.md テストテンプレート（`result["quality"]`）, TASK-0009.md テストケース*
  - `quality: int` — 最終品質スコア（1〜5、Dを下回らない）🔵
  - `traits: Array` — 発現特性タグIDの配列（同一タグ2個以上のもののみ）🔵
  - `success: bool` — 調合成立可否（空投入時は`false`）🟡 *EDGE-001の実装表現としての妥当な推測*

### 2.2 計算仕様（プロトタイプ専用の簡易ロジック）

- 🟡 **基礎品質**: 投入素材の`quality`スコアの平均値。端数は**切り捨て**（`int`除算）。*参照: REQ-105を簡略化。端数処理は切り捨てと明記（TASK-0009.md 実装詳細1）*
- 🔵 **特性発現判定**: 投入枠内で同一特性タグが**2個以上**あれば発現。1個のみは不発。*参照: REQ-106, EDGE-101*
- 🟡 **最終品質**: 発現特性1個につき基礎品質スコアを**1段階減算**。ただし**D（スコア1）を下回らない**。*参照: REQ-111を簡略化（TASK-0009.md 実装詳細1）*
- 🟡 **スコープ外（省略・コード内コメントで明記）**: REQ-112（同一系統内の複数特性同時発現のペナルティ加算）、REQ-115（貢献度系/報酬系の排他制御）は本タスクでは実装しない。*参照: TASK-0009.md 注意事項, note.md 6章*

### 2.3 UI層 `alchemy_prototype.gd/.tscn`（Imperative Shell）

- 🔵 **入力（ユーザー操作）**: 素材入手ボタン押下、インベントリ→投入枠への配置操作（クリックまたはドラッグ）、調合実行ボタン押下。*参照: REQ-502, REQ-503, TC-501-01, TC-501-02*
- 🔵 **出力（画面表示）**: インベントリ一覧、投入枠状態、完成品の品質・発現特性。すべて1画面内に表示。*参照: REQ-503, TC-501-02*
- 🔵 **データフロー**: 素材入手ボタン → `prototype_material_definitions.gd`のダミーデータからインベントリへ追加 → 投入枠へ配置 → 調合実行で`PrototypeAlchemyResolver.resolve()`を呼び出し → 完成品表示。*参照: architecture.md, TASK-0009.md 実装詳細2〜3*

- **参照したEARS要件**: REQ-105, REQ-106, REQ-111, REQ-501, REQ-502, REQ-503
- **参照した設計文書**: architecture.md（Functional Core / Imperative Shell）, prototype_material_definitions.gd（Quality/TraitCategory enum, MATERIALS）

---

## 3. 制約条件

- 🔵 **アーキテクチャ制約（純粋関数）**: `PrototypeAlchemyResolver`はNode/Sceneに依存しない`static func`として実装し、副作用を持たず、同じ入力に対し常に同じ出力を返す。GUTでユニットテスト可能にする。*参照: architecture.md「Functional Core」, note.md 2章*
- 🔵 **ファイル隔離制約**: 実装・テストは`features/prototype/`配下に配置し、正式実装ディレクトリ`features/alchemy/`へ移動・統合しない。*参照: TASK-0009.md 注意事項, note.md 6章*
- 🔵 **投入枠数制約**: 投入枠は初期値4枠（REQ-101）。定数は`shared/constants/game_balance.gd`の`RECIPE_DEFAULT_SLOT_COUNT = 4`を参照可能。*参照: REQ-101, note.md 3章*
- 🔵 **品質下限制約**: 最終品質はD（スコア1）を下回ってはならない。*参照: REQ-111*
- 🟡 **UX作り込み禁止制約**: アニメーション・装飾・非同期ローディング・エラーダイアログは実装しない。空投入時はボタン非活性化またはボタン押下無視で最小対応。*参照: TASK-0009.md UI/UX要件, REQ-502*
- 🔵 **スコープ外明記制約**: REQ-112, REQ-115の省略をコード内コメント（`# 簡略化: ...スコープ外`）で明記し、TASK-0010の観察記録者が誤解しないようにする。*参照: TASK-0009.md 注意事項*
- 🟡 **技術スタック**: Godot 4.7 / GDScript / GUT 9.6.1。テストは`tests/unit/features/`配下に`prototype_alchemy_resolver_test.gd`として配置。*参照: note.md 1章, 5章*

- **参照したEARS要件**: REQ-101, REQ-111, REQ-502, REQ-112, REQ-115
- **参照した設計文書**: architecture.md, game_balance.gd, note.md（開発ルール・注意事項）

---

## 4. 想定される使用例

### 4.1 基本的な使用パターン（通常フロー）

- 🔵 素材入手ボタンを押すと、品質・特性の異なる素材がインベントリへ即時追加される。*参照: REQ-502, TC-501-01（テストケース7）*
- 🔵 インベントリの素材を投入枠（4枠）へ配置し、調合実行で完成品の品質・発現特性が1画面内に表示される。*参照: REQ-503, TC-501-02*

### 4.2 計算例（純粋関数の入出力）

- 🟡 **平均品質**: 品質B(3)とD(1) → 基礎品質 = (3+1)/2 = 2（C相当）。*参照: REQ-105簡略版, テストケース1*
- 🔵 **閾値発現**: 同一特性タグを持つ素材がちょうど2個 → 当該特性が発現。*参照: REQ-106, EDGE-101, テストケース2*
- 🔵 **不発**: 同一特性タグが1個のみ → 発現しない。*参照: REQ-106, テストケース3*
- 🟡 **品質ペナルティ**: 基礎品質B(3)で特性1個発現 → 最終品質C(2)。*参照: REQ-111簡略版, テストケース4*

### 4.3 エッジケース・境界値

- 🔵 **境界値（品質下限）**: 基礎品質D(1)で特性が発現 → 最終品質はD(1)のまま（1未満にならない）。*参照: REQ-111, EDGE-102, テストケース5*
- 🟡 **空投入拒否**: 投入枠に素材が1つもない状態で調合実行 → 調合は成立せず完成品は生成されない（`success: false` またはボタン非活性）。*参照: EDGE-001, テストケース6*
- 🟡 **端数**: 品質スコア平均が小数 → 切り捨て。*参照: note.md エッジケース処理*

- **参照したEARS要件**: REQ-105, REQ-106, REQ-111, REQ-502, REQ-503, EDGE-001, EDGE-101, EDGE-102
- **参照した設計文書**: architecture.md（データフロー）, acceptance-criteria.md（TC-501-01, TC-501-02）

---

## 5. EARS要件・設計文書との対応関係

- **参照したユーザストーリー**: user-stories.md ストーリー5.1（プロトタイプでの仮説検証）
- **参照した機能要件**:
  - REQ-101（投入枠4枠）, REQ-105（基礎品質=平均）, REQ-106（同一特性2個以上で発現）, REQ-111（発現特性ごとに品質-1段、D下限）
  - REQ-501（1画面プロトタイプ提供）, REQ-502（庭・時間経過・演出はダミー、即時入手）, REQ-503（レシピ投入〜完成品出力を1画面完結）
- **参照した非機能要件**: NFR-301（Godot移行。技術スタック前提）
- **参照したEdgeケース**: EDGE-001（空投入は調合不成立）, EDGE-101（閾値ちょうどで発現）, EDGE-102（同一特性のみで品質低下）
- **スコープ外（本タスクで意図的に省略）**: REQ-112（複数特性同時発現のペナルティ加算）, REQ-115（貢献度系/報酬系の排他制御）
- **参照した受け入れ基準**: TC-501-01（ボタン即時入手）, TC-501-02（完成品の品質・発現特性の1画面表示）
- **参照した設計文書**:
  - **アーキテクチャ**: architecture.md（Functional Core / Imperative Shell, Feature-Based Architecture）
  - **データ定義**: features/prototype/data/prototype_material_definitions.gd（Quality enum, TraitCategory enum, MATERIALS）
  - **定数**: shared/constants/game_balance.gd（RECIPE_DEFAULT_SLOT_COUNT=4）
  - **テストパターン**: tests/unit/features/rng_service_test.gd（GUT記法）

---

## 6. 実装ファイル（予定）

| 区分 | ファイルパス | 内容 |
|------|-------------|------|
| Functional Core | `atelier-godot/features/prototype/logic/prototype_alchemy_resolver.gd` | 簡易調合計算（static func resolve） |
| テスト | `atelier-godot/tests/unit/features/prototype_alchemy_resolver_test.gd` | GUTテスト（7ケース） |
| Imperative Shell | `atelier-godot/features/prototype/ui/alchemy_prototype.gd` | UI制御 |
| Imperative Shell | `atelier-godot/features/prototype/ui/alchemy_prototype.tscn` | UIシーン |

---

## 7. 品質判定

```
⚠️ 要改善（ただし正当な範囲切り分け）:
- 要件の曖昧さ: なし（入出力・計算仕様・スコープ外が明確）
- 入出力定義: 完全（resolve の入力型・出力型・計算式を定義）
- 制約条件: 明確（純粋関数・ファイル隔離・品質下限・スコープ外明記）
- 実装可能性: 確実（前提TASK-0008完了済み、GUTパターン確立済み）
- 信頼性レベル: 🔵青多数。🟡黄は正式REQ-105/111を意図的に簡略化した箇所およびEDGE-001の実装表現に集中（タスク発注元の指示による正当な切り分け）
```

**信頼性レベル分布**:
- 🔵 青信号: 概要・特性発現判定・アーキテクチャ制約・境界値など（EARS/設計文書に明記）
- 🟡 黄信号: 基礎品質の端数切り捨て・最終品質減算・空投入のsuccessフラグ表現（簡略化・妥当な推測）
- 🔴 赤信号: なし
