# TASK-0020 AlchemyBench UI テストケース定義書

**機能名**: AlchemyBench UI（調合台画面）
**タスクID**: TASK-0020
**要件名**: atelier-alchemy-core
**タスクタイプ**: TDD
**フェーズ**: Phase 3 - 調合コアロジック（★核心）
**作成日**: 2026-08-03
**テストファイル**: `tests/unit/features/alchemy/alchemy_bench_test.gd`
**出力ファイル**: `docs/implements/atelier-alchemy-core/TASK-0020/alchemy-bench-testcases.md`

---

## 0. 前提: テスト設計上の最重要方針（GameStateのDI注入）

### 課題

`GameState`（`atelier-godot/autoload/game_state.gd`）は **`class_name GameState` を持つが、`project.godot` の `[autoload]` セクションには登録されていない**。これは TASK-0019 の設計判断（game_state.gd 44-59行目）で、Autoload登録するとグローバル識別子 `GameState` がクラスではなくAutoloadシングルトンのノードインスタンスを指すようになり、テスト側の `preload("res://autoload/game_state.gd").new()` が `Invalid call. Nonexistent function 'new' in base 'GDScript'` で失敗するためである。

TASK-0020 のタスク定義コード例では `GameState.recipe_slot_count` / `GameState.item_crafted` のように **グローバルなシングルトン参照**を前提に書かれているが、Autoload未登録の現状ではこの参照方法はテスト不能（かつ実行時も解決不能）である。🔴 *requirements.md 制約条件「Autoload参照方法の未確定」*

### 本タスクでの設計方針（テスト可能性の担保）

**`AlchemyBench` は `GameState` インスタンスを DI（依存性注入）で受け取る設計とする。** Autoloadグローバル参照に依存しない。

- **注入方式**: セッターメソッド `set_game_state(gs: GameState) -> void`（または `_ready()` 前に代入可能な公開フィールド `game_state`）を用意する。コンストラクタ引数は Godot の `Control` ノードとシーンインスタンス化の都合上使いにくいため、**セッター注入 + 明示的初期化メソッド**を推奨する。
- **初期化順序**: シーンをテストでインスタンス化した後に `set_game_state(test_game_state)` を呼び、続いて初期化（`_build_slots()` / シグナル接続）を行える構造にする。`_ready()` 内で無条件に `GameState.xxx` を触ると注入前にクラッシュするため、初期化を「注入後に呼ぶ明示メソッド」または「game_state 非null時のみ実行するガード」で分離する。
- **テストでの利用**: 既存 `game_state_test.gd` と同じく、`preload("res://autoload/game_state.gd").new()` でテスト専用インスタンスを生成し `add_child_autofree()` でツリーに追加、それを `AlchemyBench` に注入する。シングルトン状態の共有汚染を回避できる。
- 🔵 *game_state_test.gd 65-69行目の `preload().new()` + `add_child_autofree()` パターン、requirements.md「Autoload参照方法の未確定（🔴）」より*

### テスト全体の共通セットアップ（before_each 雛形）

```gdscript
extends GutTest

const AlchemyBenchScript := preload("res://features/alchemy/ui/alchemy_bench.gd")
const GameStateScript := preload("res://autoload/game_state.gd")
const MaterialInstanceScript := preload("res://features/alchemy/data/material_instance.gd")
const CraftResultScript := preload("res://features/alchemy/data/craft_result.gd")

var game_state       # テスト専用 GameState インスタンス（Autoloadを使わない）
var bench            # テスト対象 AlchemyBench インスタンス

func before_each() -> void:
    # 【テストデータ準備】: Autoload汚染を避けるためGameStateを都度新規生成する
    # 【初期条件設定】: recipe_slot_count はデフォルト（4）を利用。テストごとに必要なら上書きする
    # 【前提条件確認】: GameStateはAutoload未登録のためインスタンスをDIで注入する
    game_state = GameStateScript.new()
    add_child_autofree(game_state)

    # 【初期条件設定】: AlchemyBench をインスタンス化し、GameState を注入する
    bench = AlchemyBenchScript.new()
    bench.set_game_state(game_state)   # ← DI注入。Autoloadグローバル参照に依存しない
    add_child_autofree(bench)          # _ready() 相当の初期化はここで走る想定

func _make_material(p_id: String, quality: int, trait_ids: Array[StringName] = [] as Array[StringName]) -> MaterialInstance:
    # 【テストデータ準備】: 在庫個体の生成ヘルパー（game_state_test.gd と同一方針）
    return MaterialInstanceScript.new(p_id, quality, trait_ids)
```

> **注意（Redフェーズ実装者向け）**: `AlchemyBench.new()` 単体でノード生成する場合、`@onready var slot_container: HBoxContainer = %SlotContainer` 等の `%`（一意名）参照は **`.tscn` を `instantiate()` しないと解決されない**。テストでは (A) `.tscn` を `preload().instantiate()` してから注入する、または (B) UIノード参照を注入前に生成/差し替え可能にする設計のいずれかを取る。テストの焦点は「投入枠数・ボタン活性・craft委譲・結果保持」というロジックであるため、UIノードは最小構成の `.tscn` インスタンス化で用意するのが堅実。

---

## 1. 正常系テストケース（基本的な動作）

### TC-2: 投入枠に素材が1個以上配置されると調合実行ボタンが活性化される

- **テスト名**: 投入枠に素材1個以上配置でcraft_buttonが活性化される
  - **何をテストするか**: `_placed_materials` に1件以上素材がある状態で `_update_craft_button_state()` を呼ぶと、`craft_button.disabled` が `false` になること
  - **期待される動作**: 素材が配置された時点で調合実行ボタンが押下可能になる
- **入力値**: `_placed_materials = [material_A]`（品質B・無特性の素材1個）を設定後 `_update_craft_button_state()` を呼ぶ
  - **入力データの意味**: 「1個配置」は調合が成立する最小構成（EDGE-001の直上の境界の内側）を代表する
- **期待される結果**: `bench.craft_button.disabled == false`
  - **期待結果の理由**: 完了条件「投入枠に1つ以上素材が配置されると調合実行ボタンが活性化される」より
- **テストの目的**: ボタン活性化ロジックの正常動作を確認する
  - **確認ポイント**: 素材が1件でも入れば活性化される（0件との切替が正しい）
- 🟡 *TASK-0020.md 単体テスト要件テストケース2、完了条件より（TC-101-E01の裏返しとして妥当な推測）*

### TC-3a: 投入枠数が GameState.recipe_slot_count（初期値4）を参照して生成される

- **テスト名**: recipe_slot_countが4のとき投入枠が4個生成される
  - **何をテストするか**: `game_state.recipe_slot_count == 4` の状態で `_build_slots(game_state.recipe_slot_count)` を呼ぶと、`MaterialSlot` が4個生成され `slots.size() == 4` になること
  - **期待される動作**: GameStateの投入枠数フィールドを唯一の情報源として枠を構築する
- **入力値**: `game_state.recipe_slot_count = 4`（初期値）→ `bench._build_slots(4)`
  - **入力データの意味**: REQ-101「投入枠は初期4枠」を代表する初期状態
- **期待される結果**: `bench.slots.size() == 4` かつ `slot_container` の子ノード数が4
  - **期待結果の理由**: REQ-101・data-model.md `GameState.recipe_slot_count`（初期値4）より
- **テストの目的**: 枠数がGameStateを正しく参照していることを確認する
  - **確認ポイント**: 枠数がハードコードされておらず `recipe_slot_count` から算出される
- 🔵 *TASK-0020.md 単体テスト要件テストケース3、data-model.md `GameState.recipe_slot_count`（初期値4）より*

### TC-5: 調合実行時、投入素材がUI側で加工されず GameState.craft() にそのまま渡される（Warning#2境界）

- **テスト名**: craft実行時に投入素材が改変されずGameState.craftへ渡る
  - **何をテストするか**: `_on_craft_pressed()` 実行時に `game_state.craft()` が、`_placed_materials` と **順序・個数・同一インスタンス参照**が完全に一致する配列を引数として、ちょうど1回呼ばれること。UI側でソート・フィルタ・複製・要素追加/削除を行わないこと
  - **期待される動作**: UIは選択済み素材配列を無加工で渡すだけ（品質計算・特性判定・貢献度/報酬算出を一切行わない）
- **入力値**: `_placed_materials = [mat_A(品質A), mat_B(品質C, 特性holy)]` を配置後、`_on_craft_pressed()` を呼ぶ。`game_state.craft` の呼び出しを spy/監視で捕捉する
  - **入力データの意味**: 品質差・特性有無を含む複数素材で「UIが余計な加工をしていないか」を検出しやすくする
- **期待される結果**: `craft` に渡された配列が `_placed_materials` と要素数・順序・各要素の同一参照で一致（`captured[i] == _placed_materials[i]`）。呼び出し回数=1
  - **期待結果の理由**: 完了条件「`GameState.craft(投入素材)` が投入枠の `MaterialInstance` 配列をそのまま引数として呼び出される（UI側での加工・計算を行わない）」、architecture.md Warning#2境界より
  - **検証手段の補足**: GUTには `spy` が無いため、(A) `game_state` を `partial_double()` 化して `assert_called` + `get_call_parameters` で捕捉、または (B) テスト専用サブクラスで `craft()` をオーバーライドして引数を記録するダブルを注入する。DI設計であるため後者が容易
- **テストの目的**: Warning#2境界（UIがビジネスロジックを持たない）の回帰防止
  - **確認ポイント**: 渡された配列が入力と完全同値であること（1要素でも改変されたら失敗）
- 🟡 *TASK-0020.md 単体テスト要件テストケース5、architecture.md「Warning#2対応」より妥当な推測（回帰防止として重要）*

### TC-6: item_crafted 受信時、結果表示が CraftResult の値をそのまま保持する（Warning#2回帰防止）

- **テスト名**: item_crafted受信で結果がCraftResultの値そのまま反映される
  - **何をテストするか**: `game_state.item_crafted` シグナルを既知値の `CraftResult` で発行したとき、`AlchemyBench` の結果表示状態（`result_panel` に渡される値、または `bench` が保持する最終結果）が、`CraftResult` の各フィールドと完全一致すること。UI側で再計算・補正・丸め直しをしないこと
  - **期待される動作**: 受信した `CraftResult` の `final_quality` / `activated_traits` / `rejected_category` / `contribution` / `reward` をそのまま表示に反映する
- **入力値**: 既知値を持つ `CraftResult`（`final_quality = Quality.A(=4)`、`activated_traits = [TraitDefinition(holy)]`、`contribution = 12.0`、`reward = 34.0`）を生成し `game_state.item_crafted.emit(result)` する
  - **入力データの意味**: UI側が誤って再計算した場合に元値とズレが出る、境界的でない代表値を選定
  - **型の注意**: 実装上 `CraftResult.activated_traits` は `Array[TraitDefinition]`、`rejected_category` は `TraitDefinition.Category`（enum）、`contribution`/`reward` は `float`。要件ノートの「activated_traits: Array[String]」表記と実装が異なるため、テストは **実装の型（TraitDefinition配列・float）** に合わせる
- **期待される結果**: `bench` の保持する結果の各フィールドが入力 `CraftResult` と一致（`held.final_quality == 4`、`held.contribution == 12.0`、`held.reward == 34.0`、`held.activated_traits.size() == 1`）
  - **期待結果の理由**: 完了条件「`result` の最終品質・発現特性・貢献度・報酬をそのまま結果表示に反映する（UI側で値を再計算しない）」より
- **テストの目的**: Warning#2境界を「結果表示」側でも守っていることの回帰防止
  - **確認ポイント**: 表示値が受信値と完全一致（1フィールドでも再計算されたら失敗）
- 🟡 *TASK-0020.md 単体テスト要件テストケース6、data-model.md CraftResult定義・craft_result.gd 実装より妥当な推測*

---

## 2. 異常系テストケース（エラーハンドリング）

### TC-1: 投入枠が空の場合、調合実行ボタンが非活性化される（EDGE-001）

- **テスト名**: 投入枠が空のときcraft_buttonが非活性化される
  - **エラーケースの概要**: 投入枠が1つも埋まっていない（`_placed_materials` が空）状態で調合を成立させてはならない
  - **エラー処理の重要性**: 空投入で `GameState.craft([])` を呼ぶと無意味な処理になる。UI側のボタン非活性化が第一の防御線（GameState側のnullガードと合わせた二重の安全策）
- **入力値**: `_placed_materials = []`（空）の状態で `_update_craft_button_state()` を呼ぶ
  - **不正な理由**: 素材ゼロでは調合が成立しない（EDGE-001）
  - **実際の発生シナリオ**: 画面初期表示直後、または全素材を枠から取り除いた直後
- **期待される結果**: `bench.craft_button.disabled == true`。モーダルエラーダイアログは表示しない
  - **エラーメッセージの内容**: 明示的エラーメッセージは出さず、ボタン非活性化のみで「実行不可の状態」を表現する（TC-101-E01の表現に沿う）
  - **システムの安全性**: ボタンが押せないため `craft([])` が呼ばれず、安全な状態を保つ
- **テストの目的**: EDGE-001のUI側防御（ボタン非活性化）の確認
  - **品質保証の観点**: 空投入という退化入力に対しUIが破綻せず操作不能状態を正しく提示する
- 🟡 *TASK-0020.md 単体テスト要件テストケース1、acceptance-criteria.md TC-101-E01、EDGE-001より*

### TC-4: 同一の在庫アイテムを複数の投入枠に重複配置できない

- **テスト名**: 同一素材を別枠へ重複配置しても_placed_materialsに重複が生じない
  - **エラーケースの概要**: 個体管理された同一在庫アイテム（`MaterialInstance.id` で一意）を、複数の投入枠に二重投入しようとする操作
  - **エラー処理の重要性**: 二重投入を許すと在庫消費（`_consume_materials` は同一参照を1回だけ除去）と投入数に不整合が生じる。UI側で重複を防ぐ必要がある
- **入力値**: 素材A（`id="mat_a"`）を枠0に配置後、同じ素材A（同一インスタンス）を枠1に配置しようとする
  - **不正な理由**: 同一個体を2枠占有すると、在庫1個に対し投入2個という物理的にありえない状態になる
  - **実際の発生シナリオ**: プレイヤーが誤って同じ在庫アイテムを連続タップ/ドラッグする
- **期待される結果**: `_placed_materials` 内に同一 `id`（かつ同一インスタンス参照）が重複して含まれない。実装方針は「2枠目への配置を拒否」または「元の枠0から取り除いて枠1へ移動」のどちらでもよいが、いずれの場合も `_placed_materials` に素材Aは高々1件
  - **エラーメッセージの内容**: 明示的エラーは不要（無言で拒否 or 移動）
  - **システムの安全性**: 在庫と投入の整合性が保たれる
- **テストの目的**: 重複配置防止ロジックの確認
  - **品質保証の観点**: 個体管理の一意性がUI操作でも破られないことを保証
- 🟡 *TASK-0020.md 単体テスト要件テストケース4、在庫の個体管理（MaterialInstance.idで一意）から導かれる妥当なUI制約（設計文書に明記なし）*

---

## 3. 境界値テストケース（最小値、最大値、拡張時等）

### TC-3b: 投入枠数が拡張後（recipe_slot_count=5）で5個生成される（枠数拡張境界）

- **テスト名**: recipe_slot_countが5のとき投入枠が5個生成される
  - **境界値の意味**: 工房強化（REQ-102, TASK-0034相当）で枠数が4→5に増える境界。初期値4とは別の値でも参照が正しく反映されるかを確認する
  - **境界値での動作保証**: `_build_slots()` がハードコード4ではなく `recipe_slot_count` の実値に追従する
- **入力値**: `game_state.recipe_slot_count = 5` に設定 → `bench._build_slots(5)`
  - **境界値選択の根拠**: REQ-102「工房強化後は5枠」の上限側の値
  - **実際の使用場面**: 恒久投資で投入枠を拡張したプレイヤーの調合台表示
- **期待される結果**: `bench.slots.size() == 5` かつ `slot_container` の子ノード数が5。TC-3aの4枠と合わせ、`recipe_slot_count` の値に一致して枠数が変わる
  - **境界での正確性**: 4→5の変化が過不足なく反映される
  - **一貫した動作**: 初期値4・拡張値5のどちらでも同じロジックで正しい枠数になる
- **テストの目的**: 枠数拡張境界（REQ-102）での枠生成の正確性を確認
  - **堅牢性の確認**: 枠数がGameState依存で可変であることを保証
- 🔵 *TASK-0020.md 単体テスト要件テストケース3（4個・5個両方確認）、REQ-102・data-model.md（恒久投資で+1）より*

### TC-1b/2b: 配置数 0→1 の境界でボタン活性状態が切り替わる（活性/非活性境界）

- **テスト名**: 配置数が0から1に増える境界でdisabledがtrueからfalseへ切り替わる
  - **境界値の意味**: 「調合実行可否」の境界は投入素材数 0（不可）/ 1以上（可）。この 0↔1 の境目が正確に切り替わることを一貫確認する
  - **境界値での動作保証**: 0件で `disabled=true`、1件配置直後に `disabled=false`、再び全解除で `disabled=true` に戻る
- **入力値**: (1) `_placed_materials=[]` → `_update_craft_button_state()`、(2) 素材1個を配置し `_update_craft_button_state()`、(3) その素材を解除し `_update_craft_button_state()`
  - **境界値選択の根拠**: EDGE-001の成立/不成立を分ける唯一の境界が「素材0個 vs 1個」であるため
  - **実際の使用場面**: 素材を入れる/取り出す操作のたびにボタン状態が追従する
- **期待される結果**: (1) `disabled==true`、(2) `disabled==false`、(3) `disabled==true`（状態が可逆に追従する）
  - **境界での正確性**: 0件と1件で挙動が破綻しない
  - **一貫した動作**: 配置・解除の双方向で境界が正しく機能する
- **テストの目的**: ボタン活性状態の境界（0/1）が可逆に正しく切り替わることを確認
  - **堅牢性の確認**: TC-1（0件）とTC-2（1件）を連続操作の境界として統合検証する
- 🟡 *TC-1（EDGE-001）・TC-2（活性化）の境界統合。TASK-0020.md 単体テスト要件より妥当な推測*

### TC-4b: 同一idの重複が投入配列にゼロ件であること（重複個数の境界）

- **テスト名**: 重複配置操作後も同一idの出現回数が高々1件である
  - **境界値の意味**: 同一 `id` の投入配列内出現回数の許容境界は「0または1」であり、2件以上は不正。この上限（1件）を超えないことを確認する
  - **境界値での動作保証**: 何度同じ素材を配置操作しても、投入配列内の同一idカウントが1を超えない
- **入力値**: 素材A（同一インスタンス）を枠0・枠1・枠2へと3回連続で配置操作する
  - **境界値選択の根拠**: 重複の下限（0件＝未配置）と上限（1件＝配置済み）の境目を、複数回操作で越えようとする最も厳しいケース
  - **実際の使用場面**: 素材を何度も同じものに割り当てようとする誤操作の連打
- **期待される結果**: `_placed_materials` 内で `id=="mat_a"` の要素数が正確に1（0でも2でもない）
  - **境界での正確性**: 3回操作しても投入は1件に収束する
  - **一貫した動作**: TC-4（2枠目拒否/移動）を回数方向に強化した境界確認
- **テストの目的**: 重複防止の上限（1件）が連続操作でも破られないことを確認
  - **堅牢性の確認**: 個体一意性の不変条件（同一idは投入配列内に高々1件）を保証
- 🟡 *TC-4の境界強化。個体管理の一意性（MaterialInstance.id）より妥当な推測*

---

## 4. 開発言語・フレームワーク

- **プログラミング言語**: GDScript（Godot 4.7）
  - **言語選択の理由**: プロジェクトのメイン開発スタックが Godot 4.x + GDScript に移行済み（CLAUDE.md・architecture.md NFR-301）。`AlchemyBench` は `Control` 継承のシーンスクリプトとして実装する
  - **テストに適した機能**: シグナル（`item_crafted` / `inventory_updated`）の発行・購読、`Control` ノードのツリー追加、`@onready`/`%`一意名参照など、UI層のテストに必要な機能を標準提供する
- **テストフレームワーク**: GUT (Godot Unit Test) 9.6.1
  - **フレームワーク選択の理由**: プロジェクト標準のGodot単体テストフレームワーク（CLAUDE.md Tech Stack）。`watch_signals` / `assert_signal_emit_count` / `get_signal_parameters` / `assert_signal_not_emitted` / `partial_double` / `add_child_autofree` 等、シグナル検証とノードライフサイクル管理のAPIが揃う
  - **テスト実行環境**: Godotエディタ内のGUTパネル、またはGUT CLI（`docs/rule/tdd/` 参照）。テストは `tests/unit/features/alchemy/alchemy_bench_test.gd` に配置する
- 🔵 *note.md「技術スタック」「GUTフレームワーク（9.6.1）」、game_state_test.gd の実パターンより*

---

## 5. テストケース実装時の日本語コメント指針

### テストケース開始時のコメント

```gdscript
# 【テスト目的】: [このテストで何を確認するかを日本語で明記]
# 【テスト内容】: [具体的にどのような処理をテストするかを説明]
# 【期待される動作】: [正常に動作した場合の結果を説明]
# 🔵🟡🔴 この内容の信頼性レベルを記載
```

### Given（準備フェーズ）のコメント

```gdscript
# 【テストデータ準備】: [なぜこのデータを用意するかの理由]
# 【初期条件設定】: [テスト実行前の状態を説明。GameStateのDI注入もここで行う]
# 【前提条件確認】: [GameStateがAutoload未登録のため注入済みであること等]
```

### When（実行フェーズ）のコメント

```gdscript
# 【実際の処理実行】: [_update_craft_button_state / _build_slots / _on_craft_pressed 等どのメソッドを呼ぶか]
# 【処理内容】: [実行される処理の内容を日本語で説明]
# 【実行タイミング】: [なぜこのタイミングで実行するかを説明]
```

### Then（検証フェーズ）のコメント

```gdscript
# 【結果検証】: [何を検証するかを具体的に説明]
# 【期待値確認】: [期待される結果とその理由を説明]
# 【品質保証】: [この検証がWarning#2境界/EDGE-001等の品質にどう貢献するかを説明]
```

### 各assertステートメントのコメント

```gdscript
assert_true(bench.craft_button.disabled) # 【確認内容】: 空投入時にボタンが非活性である 🟡
assert_eq(bench.slots.size(), 4) # 【確認内容】: recipe_slot_count=4に一致した枠数 🔵
```

### セットアップ・クリーンアップのコメント

```gdscript
func before_each() -> void:
    # 【テスト前準備】: GameStateとAlchemyBenchを都度新規生成しDI注入する
    # 【環境初期化】: Autoloadシングルトン汚染を避け、テスト専用インスタンスを用いる

func after_each() -> void:
    # 【テスト後処理】: add_child_autofree により自動解放。追加のクリーンアップは原則不要
    # 【状態復元】: 次テストへ状態を持ち越さない（GameStateを共有しない）
```

---

## 6. 要件定義との対応関係

- **参照した機能概要**: requirements.md「1. 機能の概要」（`AlchemyBench: Control` が在庫参照→投入枠操作→`craft()`→`item_crafted`購読→結果表示のみを行う）
- **参照した入力・出力仕様**: requirements.md「2. 入力・出力の仕様」（`get_inventory()`、`recipe_slot_count`、`craft(_placed_materials)`、`CraftResult`型）
- **参照した制約条件**: requirements.md「3. 制約条件」（Warning#2・EDGE-001・NFR-101同期処理・Autoload参照方法の未確定🔴）
- **参照した使用例**: requirements.md「4. 想定される使用例」（基本フロー・枠数拡張・重複配置防止・EDGE-001空投入）
- **参照したEARS要件**: REQ-101（投入枠初期4）、REQ-102（工房強化で5）、REQ-103（品質D〜S）、REQ-104（特性タグ0〜2個）、EDGE-001（空投入で調合不成立）
- **参照した受け入れ基準**: acceptance-criteria.md TC-101-E01（投入枠空→実行不可）
- **参照した実装/型定義**:
  - `atelier-godot/autoload/game_state.gd`（`craft()`/`item_crafted`/`inventory_updated`実装済み、`recipe_slot_count`/`get_inventory()`は本タスクで追加、Autoload未登録）
  - `atelier-godot/features/alchemy/data/craft_result.gd`（`activated_traits: Array[TraitDefinition]`、`rejected_category: TraitDefinition.Category`、`contribution/reward: float`）
  - `atelier-godot/features/alchemy/data/material_instance.gd`（`id: String`、`quality: Quality`、`traits: Array[StringName]`）
  - `atelier-godot/tests/unit/autoload/game_state_test.gd`（`preload().new()` + `add_child_autofree()` テストパターン）

---

## 7. テストケース一覧サマリー

| TC # | 分類 | テストケース | 信頼度 | 対象メソッド |
|------|------|---------|--------|----------|
| TC-1 | 異常系 | 投入枠が空→ボタン非活性化（EDGE-001） | 🟡 | `_update_craft_button_state()` |
| TC-2 | 正常系 | 素材1個以上配置→ボタン活性化 | 🟡 | `_update_craft_button_state()` |
| TC-3a | 正常系 | recipe_slot_count=4→枠4個生成 | 🔵 | `_build_slots()` |
| TC-3b | 境界値 | recipe_slot_count=5→枠5個生成（拡張境界） | 🔵 | `_build_slots()` |
| TC-4 | 異常系 | 同一素材の重複配置防止 | 🟡 | `place()` / 配置ロジック |
| TC-4b | 境界値 | 連続配置でも同一id出現回数が高々1件 | 🟡 | `place()` / 配置ロジック |
| TC-5 | 正常系 | 投入素材を無加工で`craft()`へ委譲（Warning#2境界） | 🟡 | `_on_craft_pressed()` |
| TC-6 | 正常系 | `item_crafted`受信で結果をそのまま保持（Warning#2回帰防止） | 🟡 | `_on_item_crafted()` |
| TC-1b/2b | 境界値 | 配置数0↔1でボタン活性状態が可逆に切替 | 🟡 | `_update_craft_button_state()` |

- **合計テストケース数**: 9件（元の6件を境界値方向へ拡張）
  - 正常系: 4件（TC-2, TC-3a, TC-5, TC-6）
  - 異常系: 2件（TC-1, TC-4）
  - 境界値: 3件（TC-3b, TC-4b, TC-1b/2b）
- **信頼性分布**: 🔵 2件、🟡 7件、🔴 0件（🔴のAutoload参照方法は「0. 前提」でDI注入方針として解消済み）

---

## 8. 品質判定結果

```
✅ 高品質:
- テストケース分類: 正常系4・異常系2・境界値3で網羅（活性/非活性・枠数4/5・重複防止・Warning#2委譲/結果保持）
- 期待値定義: 各TCの期待値が具体的（disabled真偽・slots.size()・craft引数の同値性・CraftResult各フィールド値）
- 技術選択: GDScript(Godot 4.7) + GUT 9.6.1 で確定。既存 game_state_test.gd と同一テストパターン
- 実装可能性: 確実。GameStateのDI注入方針で🔴（Autoload未確定）を解消済み
- 信頼性レベル: 🔵2・🟡7・🔴0。核心（枠数参照・EDGE-001・Warning#2境界）は設計文書裏付けあり
```

**総評**: 元タスクの6テストケースを正常系/異常系/境界値に再分類し、枠数拡張境界（TC-3b）・重複個数境界（TC-4b）・活性状態の可逆境界（TC-1b/2b）を追加して9件に拡張した。最重要の設計判断は **GameStateをAutoloadグローバル参照ではなくDI（`set_game_state()`セッター注入）で受け取る方針**であり、これにより `preload().new()` + `add_child_autofree()` の既存テストパターンと整合し、requirements.md で🔴だった「Autoload参照方法の未確定」をテスト可能な形で確定させた。また `CraftResult.activated_traits` が実装上 `Array[TraitDefinition]`（要件ノートの `Array[String]` ではない）である点をTC-6の型注意として明記した。

---

## 9. 追記: 解除操作テストケース（verify-completeフェーズで検出、2026-08-03追加）

初回実装のverify-completeフェーズで、完了条件3「プレイヤーが在庫の素材を投入枠に配置・解除できる」のうち「解除」操作に対応するテストケースが本ドキュメントに欠落していたことが判明した。`place_material()`の対になる`remove_material()`のテストケースを追加する。

| ID | 分類 | 内容 | 信頼性 | 対象メソッド |
|---|---|---|---|---|
| TC-7 | 正常系 | 配置済みの枠から`remove_material()`で素材を解除できる | 🟡 | `remove_material()` |
| TC-7b | 異常系 | 空枠への解除操作は`false`を返し状態が変化しない | 🟡 | `remove_material()` |
| TC-7c | 境界値 | 範囲外インデックス（負の値・上限超過）での解除操作は`false`を返す | 🟡 | `remove_material()` |

### TC-7: 配置済みの枠から素材を解除できる 🟡

**Given**: 投入枠4個を構築し、枠0へ素材Aを配置済み
**When**: `remove_material(0)`を呼び出す
**Then**: 戻り値が`true`、`slots[0]`が`null`に戻り、`_placed_materials`から素材Aが消える

### TC-7b: 空枠への解除操作 🟡

**Given**: 投入枠4個を構築した直後（全枠空）
**When**: `remove_material(0)`を呼び出す
**Then**: 戻り値が`false`、`_placed_materials`は空のまま変化しない（`place_material()`の重複防止ガードと対称の防御的実装）

### TC-7c: 範囲外インデックスでの解除操作 🟡

**Given**: 投入枠4個を構築済み
**When**: `remove_material(-1)`および`remove_material(slots.size())`を呼び出す
**Then**: いずれも戻り値が`false`（`place_material()`の範囲外ガードと対称）

**合計テストケース数（更新後）**: 12件（9件 + 追記3件）
```
