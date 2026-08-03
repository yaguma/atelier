# TASK-0019: GameState.craft()連携実装 - TDDテストケース定義書

- **機能名**: GameState.craft()連携実装（game-state-craft）
- **タスクID**: TASK-0019
- **要件名**: atelier-alchemy-core
- **フェーズ**: Phase 3 - 調合コアロジック（★核心）
- **参照**: `docs/implements/atelier-alchemy-core/TASK-0019/game-state-craft-requirements.md`, `docs/tasks/atelier-alchemy-core/TASK-0019.md`, `note.md`

---

## 0. 前提事実（テスト設計上の重要事項）

- 🔵 **`autoload/game_state.gd` は未実装**。本タスクで新規作成する。テストはこの新規スクリプトを対象とする。
- 🔵 **依存 `AlchemyResolver.craft()`（`features/alchemy/logic/alchemy_resolver.gd`）と `CraftResult`（`features/alchemy/data/craft_result.gd`）は実装済み**。テストではこれらを実物のまま利用する（モック不要）。
- 🔵 **`GameState.craft()` の呼び出しシグネチャ（実コード準拠）**:
  ```gdscript
  AlchemyResolver.craft(materials, current_rank.trait_reveal_level, today_request, current_recipe, trait_definitions)
  ```
- 🔵 **`CraftResult` の状態反映契約**: `rank_hp -= int(round(result.contribution))` / `gold += int(round(result.reward))`。丸めは `round()`（四捨五入）。
- 🟡 **`RankDefinition` 型は未実装**（`find` で該当ファイルなし）。`current_rank.trait_reveal_level: int` を供給するため、テストでは `DummyDailyRequest` と同じ方式で **`current_rank` 用のダミーstubクラス**（`trait_reveal_level` フィールドのみを持つ RefCounted）を定義して代替する。
- 🟡 **`DailyRequest` 型は未実装**。`AlchemyResolver.craft()` は `daily_request` を Duck typing（型注釈なし）で受けるため、既存 `alchemy_resolver_test.gd` の `DummyDailyRequest`（`required_recipe_id` / `bonus_multiplier`）方式を踏襲する。
- 🟡 **`item_crafted` シグナルの検証**: GUT の `watch_signals(game_state)` + `assert_signal_emitted` / `assert_signal_not_emitted` / `assert_signal_emit_count` を用いる。ペイロード取得は `get_signal_parameters()` を利用する。

### GameState 最小限必要フィールド（本タスクで新規定義するもの）

TASK-0019 のテストを成立させるために `autoload/game_state.gd` が最低限保持・公開すべき要素を以下に明記する（data-model.md「GameState Autoloadの状態構造」＋TASK-0018拡張引数）。

| 要素 | 型 | 用途 | 信頼性 |
|------|----|------|--------|
| `signal item_crafted(result: CraftResult)` | signal | 調合成功時に `CraftResult` を通知 | 🔵 data-model.md |
| `signal inventory_updated()` | signal | `_consume_materials` 内で在庫変更を通知 | 🟡 note.md 実装例 |
| `current_rank` | `RankDefinition`（未実装のためテストはstub） | `trait_reveal_level` の供給元 | 🔵 |
| `rank_hp` | `int` | 貢献度分を減算される対象（`-= round(contribution)`） | 🔵 |
| `gold` | `int`（初期値0） | 報酬分を加算される対象（`+= round(reward)`） | 🔵 |
| `inventory` | `Array[MaterialInstance]` | 投入素材の消費対象 | 🔵 |
| `today_request` | `DailyRequest`（未実装のためテストはstub/null） | 指定合致ボーナス判定用に純粋関数へ委譲 | 🔵 |
| `current_recipe` | `RecipeDefinition` | 貢献度/報酬基礎値。TASK-0018拡張引数 | 🟡 |
| `trait_definitions` | `Dictionary` | 特性系統判定マスタ。TASK-0018拡張引数 | 🟡 |
| `func craft(materials: Array[MaterialInstance]) -> void` | method | 本タスクの実装対象 | 🔵 |
| `func _consume_materials(materials) -> void` | method(private) | 在庫消費ヘルパー | 🟡 |

---

## 1. 正常系テストケース

### TC-101-N01: 調合成功時にinventoryから投入素材が消費される

- **テスト名**: 調合成功時にinventoryから投入した素材のみが消費される
  - **何をテストするか**: `craft()` 成功時に、投入した `materials` に一致する在庫個体だけが `inventory` から除去され、非投入分は残ることを確認する
  - **期待される動作**: 4個の在庫から投入2個が除去され、残り2個が保持される
- **入力値**:
  - `inventory` = 素材4個（うち投入予定2個を含む）
  - `materials` = そのうちの2個（同一インスタンス参照）
  - `current_rank.trait_reveal_level = 1`, `current_recipe` = 有効レシピ, `trait_definitions` = 有効マスタ, `today_request` = 不一致stub
  - **入力データの意味**: 「一部を投入し一部を残す」という調合の典型操作を代表する。`inventory.find()` が同一インスタンス参照で除去する契約を検証するため、投入素材は在庫内の同一オブジェクトを渡す
- **期待される結果**: `inventory.size() == 2`、残った2個は非投入素材と一致する
  - **期待結果の理由**: data-model.md「戻り値のCraftResultを用いてinventoryを更新」＋ note.md `_consume_materials` 実装（`find`→`remove_at`）に従う
- **テストの目的**: 在庫消費ロジックが投入分だけを正確に消費することの確認
  - **確認ポイント**: 過剰消費（残0）・過少消費（残4）が起きないこと。同一 `id` を持つ複数個体があっても投入した参照分のみ消費されること
- 🔵 信頼性レベル: 単体テスト要件テストケース2、data-model.md craft()定義より

### TC-101-N02: 調合成功時にrank_hp・goldがCraftResultの値に応じて更新される

- **テスト名**: 調合成功時にrank_hpが貢献度分減算されgoldが報酬分加算される
  - **何をテストするか**: `CraftResult.contribution` / `reward` が `int(round())` を経て `rank_hp` / `gold` に反映されることを確認する
  - **期待される動作**: `rank_hp = 100 - round(contribution)`、`gold = 50 + round(reward)`
- **入力値**:
  - `rank_hp = 100`, `gold = 50`
  - `CraftResult.contribution = 10.0`, `CraftResult.reward = 20.0` を返す調合構成（材料・レシピ・特性を実 `AlchemyResolver.craft()` が上記値を返すよう構成、または後述の設計注記に従う）
  - **入力データの意味**: 要件記載の代表値（rank_hp=100,gold=50 → 90,70）を再現し、減算・加算の符号方向を明確に検証する
- **期待される結果**: `rank_hp == 90`、`gold == 70`
  - **期待結果の理由**: 単体テスト要件テストケース3の明示的期待値（100-10=90, 50+20=70）
- **テストの目的**: HP減算・ゴールド加算の演算方向と丸め契約の確認
  - **確認ポイント**: 減算と加算を取り違えていないこと、`round()` の四捨五入が効いていること
- 🔵 信頼性レベル: 単体テスト要件テストケース3、data-model.md craft()定義より

> **設計注記（テスト実装者向け）**: `contribution=10.0`/`reward=20.0` を厳密に得るには `AlchemyResolver.craft()` の内部計算（ValueCalculator）に依存する。厳密値制御が難しい場合は、(a) contribution/reward が算出される構成で `rank_hp` の変化量が `int(round(result.contribution))` と一致すること・`gold` の変化量が `int(round(result.reward))` と一致することを、`item_crafted` ペイロードの実値を基準に検証する相対アサーション方式を採用してよい（TC-101-N02 の意図は「値の反映方向と丸め契約」であり、絶対値90/70は代表例）。🟡

### TC-101-N03: 調合成功時にitem_craftedシグナルがCraftResultとともに1回発行される

- **テスト名**: 調合成功時にitem_craftedが1回だけ発行されペイロードがCraftResultである
  - **何をテストするか**: `craft()` 成功後に `item_crafted` が **ちょうど1回** 発行され、そのペイロードが `AlchemyResolver.craft()` の戻り値 `CraftResult` と同一であることを確認する
  - **期待される動作**: シグナル発行回数=1、ペイロードが非nullの `CraftResult` インスタンス
- **入力値**:
  - 有効な調合構成（`materials` 2個以上、有効レシピ・特性マスタ）
  - テスト開始時に `watch_signals(game_state)` で購読
  - **入力データの意味**: シグナル発行の副作用が「成功時に1回」という契約を代表する
- **期待される結果**: `assert_signal_emit_count(game_state, "item_crafted", 1)`、ペイロードが `CraftResult` 型で `contribution`/`reward` フィールドを持つ
  - **期待結果の理由**: data-model.md シグナル定義 `item_crafted(result: CraftResult)` に従う
- **テストの目的**: シグナル発行の有無・回数・ペイロード型の確認
  - **確認ポイント**: 二重発行が起きないこと、ペイロードが `null` でないこと
- 🔵 信頼性レベル: 単体テスト要件テストケース4、data-model.mdシグナル定義より

---

## 2. 異常系テストケース

### TC-101-E01: EDGE-001時に状態変更・シグナル発行が一切発生しない

- **テスト名**: 投入枠が空のとき状態変更もシグナル発行も一切起きない
  - **エラーケースの概要**: `materials = []` で `craft([])` を呼ぶと `AlchemyResolver.craft()` が `null` を返す。この `null` を受けて `GameState.craft()` が即 `return` し、いかなる副作用も発生させないことを確認する
  - **エラー処理の重要性**: UI側のボタン非活性化に対する二重の安全策。空投入で在庫やHPが破壊されると復旧不能なゲーム状態バグになる
- **入力値**:
  - `materials = []`
  - 事前状態: `inventory` = 素材2個, `rank_hp = 100`, `gold = 50`
  - `watch_signals(game_state)` で `item_crafted` / `inventory_updated` を購読
  - **不正な理由**: 投入枠ゼロは調合が成立しない退化入力
  - **実際の発生シナリオ**: プレイヤーが素材を1つも選ばず調合ボタンを（何らかの経路で）押下した場合
- **期待される結果**:
  - `inventory.size() == 2`（不変）、`rank_hp == 100`（不変）、`gold == 50`（不変）
  - `assert_signal_not_emitted(game_state, "item_crafted")`
  - `assert_signal_not_emitted(game_state, "inventory_updated")`（`_consume_materials` に到達しないため）
  - `craft()` は例外を投げず正常に `void` を返す
  - **エラーメッセージの内容**: エラーメッセージは不要（サイレントに何もしない契約）
  - **システムの安全性**: いかなる状態も破壊されず、次の操作に安全に進める
- **テストの目的**: EDGE-001ガード（`null`早期return）が全副作用を抑止することの確認
  - **品質保証の観点**: 「調合不成立時は完全に無副作用」というImperative Shellの安全契約を保証する。最重要テストの1つ
- 🔵 信頼性レベル: 単体テスト要件テストケース1、TC-101-E01、完了条件より

---

## 3. 境界値・構造テストケース

### TC-101-B01: GameState.craft()が計算ロジックを持たず単純委譲であることの構造的確認

- **テスト名**: GameState.craft()経由の結果がAlchemyResolver.craft()直接呼び出しと完全一致する
  - **境界値の意味**: 「Imperative Shellが計算ロジックを一切持たない」というアーキテクチャ境界（Functional Core / Imperative Shell）の回帰防止テスト。将来 `GameState` 内に計算を書き足す誘惑への防波堤
  - **境界値での動作保証**: 複数の異なる調合シナリオで、両経路の `CraftResult` が常に一致すること
- **入力値**:
  - 品質・特性発現条件の異なる複数シナリオ（例: 発現あり構成 / 発現なし構成 / 指定合致あり構成）
  - 各シナリオで、同一の `materials`・`reveal_level`・`today_request`・`current_recipe`・`trait_definitions` を用いる
  - **境界値選択の根拠**: 単一シナリオでは偶然一致の可能性があるため、計算経路が分岐する複数シナリオで委譲の純粋性を担保する
  - **実際の使用場面**: リファクタリングやUI連携追加時に、誤って `GameState` 側へロジックを混入させた回帰を検知する
- **期待される結果**: 各シナリオで、`AlchemyResolver.craft(...)` 直接呼び出しの `CraftResult` と、`GameState.craft()` 実行後に `item_crafted` ペイロードで得た `CraftResult` の全比較対象フィールド（`base_quality` / `final_quality` / `activated_traits` / `contribution` / `reward` / `rejected_category`）が一致する
  - **境界での正確性**: 委譲のみであれば両者は必ず同値
  - **一貫した動作**: どのシナリオでも一致が崩れないこと
- **テストの目的**: `GameState.craft()` が独自計算を持たないことの構造的裏付け（Warning#2回帰防止）
  - **堅牢性の確認**: アーキテクチャ境界が壊れていないことの継続的保証
- 🟡 信頼性レベル: 単体テスト要件テストケース5、architecture.md「Warning#2対応」より妥当な推測

> **設計注記**: 直接呼び出しと `GameState` 経由で `today_request` 等の参照を同一にする必要がある。`GameState.today_request` に設定した同じstubインスタンスを直接呼び出しにも渡すこと。`activated_traits` の比較は要素の `id` 配列比較でよい。

### TC-101-B02（境界・任意追加）: 素材1個の最小成立構成で正常に状態更新される

- **テスト名**: 素材1個（EDGE-001境界直上）で調合が成立し状態更新・シグナル発行される
  - **境界値の意味**: 0個（不成立・TC-101-E01）と1個（成立）の境界が一貫していることを、Imperative Shell 側からも確認する
  - **境界値での動作保証**: 1個投入時に `inventory` から1個消費、`rank_hp`/`gold` 更新、`item_crafted` 1回発行が揃うこと
- **入力値**: `materials` = 無特性素材1個、`inventory` = その1個のみ、`rank_hp`/`gold` 任意初期値
  - **境界値選択の根拠**: `AlchemyResolver` 側 TC-U04 と対をなす、Shell 側の最小成立ケース
  - **実際の使用場面**: 素材を1つだけ投入する最小プレイ操作
- **期待される結果**: `inventory.is_empty()`（1個消費）、`rank_hp`/`gold` が `round()` 済み値で更新、`item_crafted` 1回発行
  - **境界での正確性**: 0個と1個で挙動が破綻しないこと
- **テストの目的**: EDGE-001境界の内側（成立側）でShellの全副作用が正しく揃うことの確認
  - **堅牢性の確認**: 境界付近での副作用の一貫性
- 🟡 信頼性レベル: EDGE-001境界・alchemy_resolver_test TC-U04からの妥当な推測（要件明示外の補強ケース）

---

## 4. 統合テストケース

### TC-101-I01: TASK-0018〜0019を通した調合フロー全体の一貫性

- **テスト名**: 実在庫データを用いた調合フローが1回の呼び出しで一貫完了する
  - **何をテストするか**: `inventory` に品質・特性の異なる素材が複数ある実データ状態で `GameState.craft(materials)` を呼び、`AlchemyResolver.craft()` の内部5ステップ（TASK-0018）を経由した `CraftResult` が返り、在庫更新・`rank_hp`/`gold` 更新・`item_crafted` 発行までが1呼び出しで一貫完了することを確認する
  - **期待される動作**: 5ステップ合成→Shell側3副作用（在庫消費・HP/ゴールド更新・シグナル）が矛盾なく連結する
- **入力値**:
  - `inventory` = 品質・特性の異なる素材複数（例: 同一特性タグ2個で発現する構成 + 無特性数個）
  - `current_rank.trait_reveal_level = 1`, `current_recipe` = 有効レシピ, `trait_definitions` = 発現特性を含む有効マスタ, `today_request` = stub
  - `materials` = 在庫の一部（発現条件を満たす組合せ）
  - **入力データの意味**: 実運用に近い複合データで、TASK-0018の5ステップとTASK-0019のShell副作用の結合を検証する
- **期待される結果**:
  - `item_crafted` が1回発行され、ペイロード `CraftResult` は `final_quality`（ペナルティ反映済）・`activated_traits`（発現あり）・`contribution>0`・`reward>0` を持つ
  - `inventory` から投入分が消費され残数が正しい
  - `rank_hp` が `int(round(contribution))` 減算、`gold` が `int(round(reward))` 加算された値になっている
  - **期待結果の理由**: dataflow.md「機能2: 調合」シーケンス図全体の帰結
- **テストの目的**: Functional Core と Imperative Shell の結合が end-to-end で破綻しないことの確認
  - **確認ポイント**: 5ステップの結果（特に品質ペナルティと発現特性）がShell側の副作用に正しく波及していること
- 🔵 信頼性レベル: 統合テスト要件、dataflow.md「機能2: 調合」より

---

## 5. 開発言語・テストフレームワーク

- **プログラミング言語**: GDScript 4.x（Godot 4.7）
  - **言語選択の理由**: プロジェクトはGodotへ全面移行済み。`GameState` はAutoload（Node）でありGDScriptが必須
  - **テストに適した機能**: 動的型付けによるDuck typing stub（`DummyDailyRequest`/`current_rank` stub）の容易さ、`signal` の組込サポート
- **テストフレームワーク**: GUT (Godot Unit Test) v9.6.1
  - **フレームワーク選択の理由**: プロジェクト標準のGodot向けユニットテストフレームワーク。既存 `alchemy_resolver_test.gd` 等と同一
  - **テスト実行環境**: `godot --headless -s res://addons/gut/gut_cmdline.gd`（CLI）
  - **シグナル検証API**: `watch_signals()`, `assert_signal_emitted()`, `assert_signal_not_emitted()`, `assert_signal_emit_count()`, `get_signal_parameters()`
- 🔵 信頼性レベル: note.md「テスト関連情報」・既存テスト実装より

### テストファイル配置

| 種別 | パス |
|------|------|
| 単体テスト | `atelier-godot/tests/unit/autoload/game_state_test.gd` |
| 統合テスト | `atelier-godot/tests/integration/autoload/game_state_craft_integration_test.gd` |

### Autoload としてのテスト上の注意 🟡

- `GameState` は Autoload（本番は `project.godot` の `[autoload]` に `GameState="*res://autoload/game_state.gd"` で登録）。
- ただしユニットテストでは、シングルトン状態の共有汚染を避けるため、`before_each()` で `preload("res://autoload/game_state.gd").new()` により **テスト専用インスタンスを生成**し、`add_child_autofree()` でツリーに追加して検証する方式を推奨する（`current_rank`/`inventory`/`rank_hp`/`gold`/`today_request`/`current_recipe`/`trait_definitions` を各テストで明示セット）。

---

## 6. 要件定義との対応関係

| テストケース | 参照した要件・受け入れ基準 | 種別 | 信頼性 |
|------------|--------------------------|------|--------|
| TC-101-N01 | 単体テスト要件2 / data-model.md craft()「inventory更新」 | 正常系 | 🔵 |
| TC-101-N02 | 単体テスト要件3 / data-model.md craft()「rank_hp/gold更新」 | 正常系 | 🔵 |
| TC-101-N03 | 単体テスト要件4 / data-model.md シグナル定義 | 正常系 | 🔵 |
| TC-101-E01 | 単体テスト要件1 / TC-101-E01 / EDGE-001 | 異常系 | 🔵 |
| TC-101-B01 | 単体テスト要件5 / architecture.md Warning#2 | 構造 | 🟡 |
| TC-101-B02 | EDGE-001境界補強（要件明示外） | 境界 | 🟡 |
| TC-101-I01 | 統合テスト要件1 / dataflow.md 機能2 | 統合 | 🔵 |

- **参照した機能概要**: requirements.md §1（Functional Core / Imperative Shell 境界の実接続）
- **参照した入力・出力仕様**: requirements.md §2（materials入力、void戻り＋副作用出力）
- **参照した制約条件**: requirements.md §3（GameState.craft()は計算ロジックを持たない）
- **参照した使用例**: requirements.md §4（通常調合・EDGE-001）

---

## 7. テストケース総括

- **総テストケース数**: 7件
  - 正常系: 3件（TC-101-N01/N02/N03）
  - 異常系: 1件（TC-101-E01）
  - 境界・構造: 2件（TC-101-B01 構造委譲確認 / TC-101-B02 素材1個境界）
  - 統合: 1件（TC-101-I01）
- **信頼性分布**: 🔵 5件 / 🟡 2件 / 🔴 0件
- **網羅性**: EDGE-001（異常系）・在庫消費・HP/ゴールド更新・シグナル発行・アーキテクチャ境界（委譲純粋性）・end-to-end結合を網羅。

> 補足: 要件で提示された必須5単体＋1統合をすべて含み、境界補強として TC-101-B02 を1件追加した。TC-101-B02 は要件明示外のため任意（実装コスト次第で省略可）。
