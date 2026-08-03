# TASK-0018 テストケース定義書: AlchemyResolver.craft オーケストレーター実装

**機能名**: AlchemyResolver.craft（調合オーケストレーター）
**タスクID**: TASK-0018
**要件名**: atelier-alchemy-core
**タスクタイプ**: TDD
**作成日**: 2026-08-02
**参照**: `docs/implements/atelier-alchemy-core/TASK-0018/alchemy-resolver-craft-requirements.md`, `docs/tasks/atelier-alchemy-core/TASK-0018.md`, `docs/implements/atelier-alchemy-core/TASK-0018/note.md`

---

## 0. 開発言語・フレームワーク

- **プログラミング言語**: GDScript（Godot 4.7）
  - **言語選択の理由**: プロジェクトのメイン開発スタック（CLAUDE.md技術スタック移行決定、architecture.md NFR-301）。前提タスクTASK-0013〜0017もGDScriptで実装済みのため、合成対象と同一言語で統一する。
  - **テストに適した機能**: `static func` による純粋関数と `preload` によるスクリプト直接参照でインスタンス生成なしにロジックを検証できる。Array/Dictionaryの型付き宣言で戻り値構造を厳密に検証可能。
- **テストフレームワーク**: GUT (Godot Unit Test) 9.6.1
  - **フレームワーク選択の理由**: note.md「1. 技術スタック」で確定済み。前提タスクの既存テスト（`trait_activation_test.gd`・`value_calculator_test.gd`等）がすべてGUTで書かれており、`assert_null`/`assert_not_null`/`assert_eq`/`assert_true`/`assert_almost_eq` を踏襲できる。
  - **テスト実行環境**: `godot --headless -d -s addons/gut/gut_cmdline.gd -gtest="res://tests/..."`（note.md「5. テスト関連情報」）。
- 🔵 信頼性レベル: note.md・既存テストファイル実物に基づき確定

### テストファイル配置

| 種別 | 配置パス（プロジェクトルート相対） |
|------|-----------------------------------|
| 単体テスト | `atelier-godot/tests/unit/features/alchemy/alchemy_resolver_test.gd` |
| 統合テスト | `atelier-godot/tests/integration/features/alchemy/alchemy_resolver_integration_test.gd` |
| 被テスト対象（未実装・Redフェーズ用） | `atelier-godot/features/alchemy/logic/alchemy_resolver.gd` |

---

## ★ 実装シグネチャと合成仕様（テスト設計の前提）

### 対象関数

```gdscript
class_name AlchemyResolver
extends RefCounted

static func craft(
    materials: Array[MaterialInstance],
    reveal_level: int,
    daily_request: DailyRequest,
    recipe: RecipeDefinition,
    trait_definitions: Dictionary,
) -> CraftResult:
```

### 5ステップ合成（dataflow.md「機能2: 調合」）

1. `QualityCalculator.calculate_base_quality(materials) -> float`（REQ-105）
2. `TraitActivation.resolve_activated_traits(materials, reveal_level, trait_definitions) -> Array[TraitDefinition]`（REQ-106, REQ-112）
3. `TraitActivation.resolve_category_conflict(materials, candidate_traits) -> Dictionary`（REQ-115）
   → `{"activated_traits": Array[TraitDefinition], "rejected_category": TraitDefinition.Category, "has_rejected_category": bool}`
4. `QualityCalculator.apply_trait_penalty(base_quality: float, final_traits) -> MaterialInstance.Quality`（REQ-111）
5. `ValueCalculator.calculate_contribution(recipe, final_quality, final_traits, daily_request) -> float` / `calculate_reward(...) -> float`（REQ-109, REQ-110）

### ★ 実装で確定している型・変換仕様（実物コードから確認済み）

| 論点 | 実物の仕様 | テスト設計への影響 |
|------|-----------|-------------------|
| `CraftResult.base_quality` の型 | `MaterialInstance.Quality`（enum） 🔵 | ステップ1の `float` を **enum へ変換**して格納する（申し送り「float→int変換」）。素材が全品質A(4)なら平均4.0→`Quality.A`。 |
| `CraftResult.final_quality` の型 | `MaterialInstance.Quality`（enum） 🔵 | ステップ4の戻り値がそのままenum。ValueCalculatorへもこのenumを渡す。 |
| `CraftResult.activated_traits` の要素型 | `Array[TraitDefinition]`（enumやString配列ではない） 🔵 | 発現特性の検証は `result.activated_traits[i].id == &"holy"` で行う（note.md擬似コードの `"聖" in ...` は誤り。TraitDefinition配列に文字列は含まれない）。 |
| `CraftResult.rejected_category` の型 | `TraitDefinition.Category`（enum） 🟡 | requirements.md本文は「無い場合は空文字列」とStringを想定するが、**実物のCraftResultはCategory enum**。`resolve_category_conflict` の `rejected_category`（enum）＋`has_rejected_category`（bool）を格納する。テストはenumで検証し、「不発なし」表現の差異を注意事項として記録する。 |
| `CraftResult.contribution` / `reward` の型 | `float`（初期値0.0） 🟡 | requirements.md本文は `int` を想定するが、**実物はfloat**。ValueCalculatorの戻り値（float）をそのまま格納する。テストは `assert_almost_eq` で検証する。 |
| `ValueCalculator.calculate_*` の `final_quality` 引数 | `MaterialInstance.Quality`（enum） 🔵 | ステップ5にはステップ4のenum出力を渡す。 |

> ⚠️ **要件定義書との差異記録（🟡）**: `rejected_category`（String vs Category enum）と `contribution`/`reward`（int vs float）で、requirements.md本文の記述と実物のCraftResult型定義が食い違う。本テストケースは**実物のCraftResult型定義を正**として設計する（データモデル層TASK-0012の確定実装が優先）。この差異はGreen実装時にrequirements.mdへ反映すべき申し送り事項としてnote.mdに追記する。

---

## 1. 単体テストケース（`tests/unit/features/alchemy/alchemy_resolver_test.gd`）

> 前提: 各テストは `preload` で `AlchemyResolver`/`QualityCalculator`/`TraitActivation`/`ValueCalculator`/各データ型を参照する。`trait_definitions` 辞書・`recipe`・`daily_request` は `before_each` または各テスト内でヘルパーにより構築する。`daily_request` はTASK-0017同様、未実装の場合はテスト専用 `DummyDailyRequest`（`required_recipe_id`/`bonus_multiplier` の2フィールド）で代替する。

### 1-1. 正常系テストケース

#### TC-U01: 5ステップが正しい順序で合成され結果が整合する（★必須） 🔵

- **テスト名**: 5ステップが正しい順序で合成され、base_quality・final_quality・activated_traitsが整合する
  - **何をテストするか**: `craft()` がdataflow.mdの5ステップ（基礎品質→発現判定→系統排他→品質ペナルティ→貢献度/報酬）を正しい順序で合成し、各ステップの出力が矛盾なく `CraftResult` に反映されること。
  - **期待される動作**: 基礎品質A(4)平均→「聖」発現→系統排他で片系統のため保持→ペナルティ1段減→最終品質B(3)、という一連の計算がフィールド間で整合して格納される。
- **入力値**:
  - `materials`: 「聖」(holy, CONTRIBUTION)タグ素材2個 + 無特性素材2個（すべて品質A=4）
  - `reveal_level`: `1`
  - `daily_request`: 指定不一致のダミー（`required_recipe_id = &"other"`）
  - `recipe`: `base_contribution=10.0, base_reward=20.0` のダミーレシピ
  - `trait_definitions`: `holy`(CONTRIBUTION)を含む特性マスター辞書
  - **入力データの意味**: 「聖」ちょうど2個で発現閾値を満たし、片系統のみのため系統排他で除外されず1特性が残る最小構成。品質A統一により基礎品質＝4.0と一意に決まり、ペナルティ後の値を厳密に予測できる。TASK-0018.md単体テスト要件2・note.md「TC 5ステップ統合」に対応。
- **期待される結果**:
  - `result != null`
  - `result.base_quality == MaterialInstance.Quality.A`（平均4.0→enum A=4）
  - `result.final_quality == MaterialInstance.Quality.B`（4.0 - 1段(聖) = 3.0 → B=3）
  - `result.activated_traits.size() == 1` かつ `result.activated_traits[0].id == &"holy"`
  - `result.final_quality < result.base_quality`（ペナルティが確実に効いている）
  - **期待結果の理由**: 基礎品質はQualityCalculator.calculate_base_quality=4.0（enum A）。聖はCONTRIBUTIONで減算対象1個→apply_trait_penaltyで4.0-1.0=3.0→round→B。系統排他は貢献度系のみ（報酬系0）で片系統のため保持（trait_activation_test「片系統のみのとき排他せずそのまま残す」で実証済み）。
- **テストの目的**: オーケストレーターが個別純粋関数を正しい順序・正しい引数で連結していることの検証（Warning#2対応の中核）。
  - **確認ポイント**: base_quality（ペナルティ前）とfinal_quality（ペナルティ後）が別物として保持されているか。ステップ3の系統排他結果がステップ4のペナルティ計算に渡されているか（activated_traits経由の連結）。
- 🔵 信頼性レベル: dataflow.md「機能2」5ステップ順序・quality_calculator.gd/trait_activation.gd実物の挙動から期待値を算出（推測なし）

#### TC-U02: nullを返さないケースでCraftResultの全6フィールドが埋まっている 🟡

- **テスト名**: 有効な投入構成でCraftResultの全6フィールドが未初期化のまま放置されない
  - **何をテストするか**: `craft()` が `null` でない `CraftResult` を返す場合、`base_quality`/`final_quality`/`activated_traits`/`rejected_category`/`contribution`/`reward` の6フィールドすべてが `craft()` によって設定されていること。
  - **期待される動作**: 各フィールドが型に応じた有効値を持ち、「代入し忘れ」のフィールドが存在しない。
- **入力値**:
  - `materials`: 「聖」タグ素材2個 + 無特性素材2個（品質A）
  - `reveal_level`: `1`、`daily_request`: 指定一致のダミー（`required_recipe_id = recipe.id`, `bonus_multiplier=1.5`）
  - `recipe`: `base_contribution=10.0, base_reward=20.0`
  - `trait_definitions`: `holy` を含む辞書
  - **入力データの意味**: 指定合致ボーナスも有効化して、contribution/rewardが基礎値0.0のまま放置されていないこと（＝ステップ5が実行されていること）を確実に検出できる構成。TASK-0018.md単体テスト要件3・note.md「TC CraftResult全フィールド埋め込み」に対応。
- **期待される結果**:
  - `result != null`
  - `result.base_quality` が有効なQuality enum値（1〜5の範囲）である
  - `result.final_quality` が有効なQuality enum値（1〜5の範囲）である
  - `result.activated_traits != null`（配列として初期化されている。空配列でも可）
  - `result.contribution > 0.0`（基礎値10.0に品質・特性・指定合致の各倍率が乗算され0.0でない）
  - `result.reward > 0.0`（同上、基礎値20.0ベース）
  - `result.rejected_category` が `TraitDefinition.Category` の有効値（enum範囲内）である
  - **期待結果の理由**: CraftResult.contribution/rewardの初期値は0.0（craft_result.gd実物）。ステップ5が呼ばれれば必ず0.0超になる（recipe基礎値が正、各倍率が正）。contribution/rewardが0.0のままなら「ステップ5未実行」のバグを検出できる。
- **テストの目的**: 戻り値の完全性（全フィールドが `craft()` の責務として埋められること）の保証。
  - **品質保証の観点**: 後続TASK-0019（GameState.craft）・TASK-0020（UI表示）が全フィールドを参照するため、いずれかが未設定だと下流でnull/0表示バグを引き起こす。この検証がその予防になる。
- 🟡 信頼性レベル: data-model.md CraftResult型定義・craft_result.gd実物の初期値から妥当に推測（「>0.0」判定はrecipe基礎値が正である前提の派生）

### 1-2. 異常系テストケース

#### TC-U03: 投入枠が空の場合に調合が成立しない（TC-101-E01 / EDGE-001） 🟡

- **テスト名**: 投入素材が空配列のとき調合が成立せずnullを返す
  - **エラーケースの概要**: `materials = []`（投入枠が空）で `craft()` を呼び出す退化入力。
  - **エラー処理の重要性**: EDGE-001はUI側でボタン非活性化により予防される想定だが、`craft()` 自身も防御的にガードすることでUI制御漏れに対する二重の安全策となる（note.md「6. 注意事項 EDGE-001ガード実装方針」）。
- **入力値**:
  - `materials`: `[]`（空のArray[MaterialInstance]）
  - `reveal_level`: `1`、`daily_request`: 任意のダミー、`recipe`: 任意のダミー、`trait_definitions`: 任意の辞書
  - **不正な理由**: 投入素材ゼロでは基礎品質が算出不能（0除算相当）で、調合という行為自体が成立しない。
  - **実際の発生シナリオ**: 調合前の初期状態、素材未選択のままボタンが誤って有効化された場合、TASK-0019からの誤呼び出し。
- **期待される結果**:
  - `result == null`（`assert_null`）
  - **エラーメッセージの内容**: 例外ではなく `null` 返却で「調合不成立」を表現。呼び出し元（TASK-0019）が `null` チェックで判別する契約。
  - **システムの安全性**: 例外を投げずに `null` を返すため、呼び出し元がクラッシュせず安全に「調合できなかった」状態を扱える。
- **テストの目的**: EDGE-001ガードが `craft()` の入口で最優先に働くこと（他ステップに到達する前に短絡すること）の確認。
  - **品質保証の観点**: 空配列で `QualityCalculator.calculate_base_quality` は0.0を返す（クラッシュはしない）が、意味のない `CraftResult`（品質D固定等）を生成させないため、resolver層で明示的に短絡することを保証する。
- 🟡 信頼性レベル: acceptance-criteria.md TC-101-E01・dataflow.md「エラーハンドリングフロー」より妥当な推測（null返却方式はnote.mdで暫定確定）

### 1-3. 境界値テストケース

#### TC-U04: 素材1個の最小有効構成でnullを返さず調合が成立する 🟡

- **テスト名**: 投入素材1個（EDGE-001の直上の境界）で調合が成立しnullを返さない
  - **境界値の意味**: EDGE-001（空=不成立）と有効入力の境界。`materials.size() == 0` で `null`、`== 1` で成立、という境界の内外の一貫性を確認する。
  - **境界値での動作保証**: 「1個以上なら成立」という契約（requirements.md「2. 入出力の関係性: 有効な入力（1個以上）」）が境界ちょうどで守られる。
- **入力値**:
  - `materials`: 無特性素材1個（品質A=4）
  - `reveal_level`: `1`、`daily_request`: 指定不一致ダミー、`recipe`: `base_contribution=10.0, base_reward=20.0`、`trait_definitions`: 任意
  - **境界値選択の根拠**: `size()==1` は不成立(0)の直上の最小成立ケース。オフバイワン（`<=0` を `<=1` と誤る等）でガードが1個を誤って弾かないことを検出する。
  - **実際の使用場面**: 単一素材のみでの簡易調合（特性を狙わず品質のみで納品するプレイ）。
- **期待される結果**:
  - `result != null`
  - `result.activated_traits.is_empty()`（無特性1個では発現しない＝閾値2未満）
  - `result.base_quality == MaterialInstance.Quality.A`（平均4.0）
  - **境界での正確性**: 1個でも基礎品質が正しく算出され（平均＝その素材の品質）、ガードで弾かれない。
  - **一貫した動作**: 0個→null、1個→有効なCraftResult、と境界の内外で挙動が一貫する。
- **テストの目的**: EDGE-001ガードの境界条件（`is_empty()` 判定）が過剰に働かないことの確認。
  - **堅牢性の確認**: 最小構成でも5ステップが破綻せず完走する。
- 🟡 信頼性レベル: requirements.md「入出力の関係性（1個以上で成立）」・EDGE-001境界からの妥当な推測（対応TC-IDは明示なし）

---

## 2. 統合テストケース（`tests/integration/features/alchemy/alchemy_resolver_integration_test.gd`）

> 統合テストは `craft()` を経由してTASK-0013〜0017のロジックが正しく合成されることを検証する回帰テスト。個別関数のロジックそのものは各単体テストで検証済みのため、ここでは**オーケストレーター経由でも同じ結果になること**に焦点を当てる。

### 2-1. 異常系テストケース（支配戦略防止）

#### TC-I01: TC-101-07シナリオがcraft()経由でも支配戦略を許さない（★Critical） 🔵

- **テスト名**: 聖・金両タグ素材2個＋高品質無特性2個でactivated_traitsが空配列になる（系統排他の同数不発がオーケストレーター経由でも適用される）
  - **エラーケースの概要**: 1素材が「聖」(CONTRIBUTION)「金」(REWARD)の両タグを持ち、これを2個投入することで貢献度系・報酬系を同数(2対2)で条件充足させ、「高品質＋両系統特性の両取り」という支配戦略を狙う入力。
  - **エラー処理の重要性**: TASK-0015の `resolve_category_conflict` が個別関数として同数不発を実装済み（trait_activation_test「1素材が2タグ同時保持でも同数不発で両取りできない」）だが、オーケストレーター経由で候補特性の受け渡しを誤ると抜け穴が再発する。ゲーム設計の根幹（支配戦略防止）を守る回帰テスト。
- **入力値**:
  - `materials`: 「聖」「金」両タグを持つ素材2個 + 高品質（S=5）無特性素材2個
  - `reveal_level`: `1`
  - `daily_request`: 指定不一致ダミー、`recipe`: ダミーレシピ、`trait_definitions`: `holy`(CONTRIBUTION)・`gold`(REWARD)を含む辞書
  - **不正な理由**: 両タグ素材2個により holy出現2回・gold出現2回で両系統が閾値を満たすが、系統合計が2対2で同数となり、REQ-115の同数不発ルールで両方却下されるべき構成。
  - **実際の発生シナリオ**: プレイヤーが希少な両タグ素材を集めて「両系統ボーナスと高品質を同時取り」を狙う最適化プレイ。
- **期待される結果**:
  - `result != null`
  - `result.activated_traits.is_empty() == true`（両系統とも不発）
  - **エラーメッセージの内容**: 例外ではなく、発現特性ゼロという結果で支配戦略を数式レベルで無効化する。
  - **システムの安全性**: 高品質2個は残るため調合自体は成立し品質評価は受けられるが、特性ボーナスは一切乗らない（両取り不可）。
- **テストの目的**: TASK-0015の系統排他ロジックが `craft()` のステップ2→3の連結（`resolve_activated_traits` の出力を `resolve_category_conflict` に正しく渡す）を通じて正しく機能することの統合検証。
  - **品質保証の観点**: acceptance-criteria.md TC-101-07（Critical）がオーケストレーター経由でも成立することを保証。個別関数テスト（trait_activation_test）とは別に、合成後の回帰を検出する。
- 🔵 信頼性レベル: acceptance-criteria.md TC-101-07（Critical）・TASK-0018.md統合テスト要件1・trait_activation_test実物の同挙動から確定

### 2-2. 境界値テストケース（reveal_level境界）

#### TC-I02: Gランク（reveal_level=0）では貢献度・報酬に特性ボーナスが一切かからない（TC-121-01） 🟡

- **テスト名**: reveal_level=0では特性が全不発となり、貢献度・報酬が品質のみに基づく値になる
  - **境界値の意味**: reveal_level=0（Gランク非開示）と1以上（開示）を分ける境界。0では `craft()` 全体を通して特性発現がゼロになり、下流の貢献度/報酬計算にも特性ボーナスが伝播しないことを確認する。
  - **境界値での動作保証**: 「Gランクは品質のみで評価」という初期難易度設計（REQ-121）が、個別関数だけでなくcraft()の最終出力（contribution/reward）まで一貫して守られる。
- **入力値**:
  - `materials`: 「聖」タグ素材2個以上（発現閾値を満たす構成）+ 必要に応じ無特性素材（品質は統一、例: 全A=4）
  - `reveal_level`: `0`
  - `daily_request`: 指定不一致ダミー、`recipe`: `base_contribution=10.0, base_reward=20.0`、`trait_definitions`: `holy` を含む辞書
  - **境界値選択の根拠**: 「聖」2個は reveal_level=1 なら確実に発現する構成（trait_activation_test で実証済み）。reveal_level=0 のみを変数として、発現有無が切り替わる境界を検証する。
  - **実際の使用場面**: ゲーム開始直後のGランク。特性システムが未解禁の状態での調合。
- **期待される結果**:
  - `result != null`
  - `result.activated_traits.is_empty() == true`（reveal_level=0で特性フィルタが最優先に働く）
  - `result.contribution` が「特性ボーナスなし」で計算した値と一致する
    （= `ValueCalculator.calculate_contribution(recipe, result.final_quality, [], daily_request)` と `assert_almost_eq`）
  - `result.reward` が「特性ボーナスなし」で計算した値と一致する（同様に `calculate_reward(...)` と照合）
  - `result.contribution > 0.0` かつ `result.reward > 0.0`（品質のみでも正の値は出る）
  - **境界での正確性**: reveal_level=0では特性ボーナス倍率が乗算されず、品質倍率＋基礎値のみでcontribution/rewardが決まる。
  - **一貫した動作**: reveal_level=1（TC-U01で特性発現）と reveal_level=0（本ケースで不発）で結果が明確に切り替わる。
- **テストの目的**: reveal_level引数が `craft()` のステップ2（resolve_activated_traits）を通じて、最終的なステップ5（貢献度/報酬）の値にまで影響が伝播することの統合検証。
  - **堅牢性の確認**: 特性発現ゼロが下流計算で正しく「ボーナス1.0（無効化）」として扱われ、価値計算が破綻しない（value_calculator_test「空配列時は特性ボーナス1.0で無効化される」の合成後版）。
- 🟡 信頼性レベル: REQ-121・acceptance-criteria.md TC-121-01・TASK-0018.md統合テスト要件2より妥当な推測（craft()全体を通した貢献度/報酬への影響確認は本統合テストで新規に検証）

---

## 3. テストケース実装時の日本語コメント指針（GDScript/GUT版）

各テストは既存テスト（`trait_activation_test.gd`・`value_calculator_test.gd`）のコメント様式を踏襲し、以下を必ず含める。

### テスト関数冒頭のコメント

```gdscript
func test_5ステップが正しい順序で合成される() -> void:
    # 【テスト目的】: craft()が5ステップを正しい順序・引数で連結することを確認する
    # 【テスト内容】: 「聖」2個+無特性2個（品質A）、reveal_level=1 で craft を実行
    # 【期待される動作】: base_quality=A、final_quality=B（1段減）、activated_traitsに聖が含まれる
    # 🔵 信頼性: dataflow.md「機能2」5ステップ / TASK-0018.md単体テスト要件2
```

### Given（準備フェーズ）のコメント

```gdscript
    # 【テストデータ準備】: 発現閾値ちょうどの「聖」2個と、基礎品質を4.0に固定する無特性2個を用意
    # 【初期条件設定】: reveal_level=1で貢献度系が解禁、指定不一致で合致ボーナスを無効化
    # 【前提条件確認】: trait_definitionsにholy(CONTRIBUTION)が登録済みであること
```

### When（実行フェーズ）のコメント

```gdscript
    # 【実際の処理実行】: AlchemyResolver.craft() を1回だけ呼び出す（オーケストレーター集約）
    # 【処理内容】: 基礎品質→発現判定→系統排他→ペナルティ→貢献度/報酬の5ステップ合成
    # 【実行タイミング】: 全引数を準備した後、単一の入口で調合を実行する
```

### Then（検証フェーズ）のコメント

```gdscript
    # 【結果検証】: base_quality/final_quality/activated_traitsの整合を検証する
    # 【期待値確認】: base=A(4)、final=B(3)、聖1件。ペナルティが確実に効いている
    # 【品質保証】: 個別関数の合成が矛盾なく行われることを保証する
    assert_eq(result.base_quality, MaterialInstance.Quality.A, "基礎品質がAである") # 【検証項目】: ステップ1の結果反映 🔵
    assert_eq(result.final_quality, MaterialInstance.Quality.B, "最終品質がBである") # 【検証項目】: ステップ4の結果反映 🔵
    assert_eq(result.activated_traits[0].id, &"holy", "発現特性が聖である")       # 【検証項目】: ステップ2-3の結果反映 🔵
```

### セットアップ・ヘルパーのコメント

```gdscript
func before_each() -> void:
    # 【テスト前準備】: 特性マスター辞書・レシピ・ダミー依頼を毎回クリーンに構築する
    # 【環境初期化】: 前テストの状態を持ち越さないため before_each で再生成する

# 【ヘルパー】: 指定品質・特性タグの素材個体を生成するファクトリ
func _make_material(quality, trait_ids: Array[StringName]) -> MaterialInstance:
    return MaterialInstanceScript.new("", quality, trait_ids)
```

---

## 4. 要件定義との対応関係

| テストケース | 参照した機能概要 | 参照した入出力仕様 | 参照した制約条件 | 参照した使用例 |
|-------------|-----------------|-------------------|-----------------|---------------|
| TC-U01（5ステップ合成） | requirements.md §4「基本フロー（5ステップ順序）」 | §2 CraftResult全フィールド | §3 オーケストレーション集約（Warning#2） | dataflow.md「機能2」シーケンス |
| TC-U02（全フィールド埋め込み） | requirements.md §2「出力値: CraftResult」 | §2「入出力の関係性」 | §6-4 rejected_category無効値・§6-1 float→int | data-model.md CraftResult型 |
| TC-U03（空投入枠null） | requirements.md §4「EDGE-001」 | §2「EDGE-001時の出力: null」 | note.md「EDGE-001ガード実装方針」 | acceptance-criteria.md TC-101-E01 |
| TC-U04（素材1個境界） | requirements.md §2「有効な入力（1個以上）」 | §2「入出力の関係性」 | §3 純粋関数制約 | EDGE-001境界の直上 |
| TC-I01（TC-101-07支配戦略） | requirements.md §4「系統排他による支配戦略防止」 | §2 activated_traits | §3 オーケストレーション集約 | acceptance-criteria.md TC-101-07（Critical） |
| TC-I02（Gランク非開示） | requirements.md §4「Gランク非開示（TC-121-01）」 | §2 contribution/reward | REQ-121 reveal_level制御 | acceptance-criteria.md TC-121-01 |

- **参照したEARS要件**: REQ-105, REQ-106, REQ-109, REQ-110, REQ-111, REQ-112, REQ-115, REQ-121
- **参照したEdgeケース**: EDGE-001
- **参照した受け入れ基準**: TC-101-E01, TC-101-07, TC-121-01
- **参照した設計文書**: dataflow.md「機能2: 調合」、architecture.md「Godotアーキテクトレビュー Critical#1 / Warning#2」、data-model.md「CraftResult型」

---

## 5. テストケース一覧サマリー

| No | 種別 | テストケース名 | 分類 | 信頼性 | 対応TC-ID |
|----|------|--------------|------|--------|-----------|
| TC-U01 | 単体 | 5ステップが正しい順序で合成され結果が整合する | 正常系 | 🔵 | TASK-0018 単体要件2 |
| TC-U02 | 単体 | CraftResultの全6フィールドが埋まっている | 正常系 | 🟡 | TASK-0018 単体要件3 |
| TC-U03 | 単体 | 投入枠が空の場合にnullを返す | 異常系 | 🟡 | TC-101-E01 |
| TC-U04 | 単体 | 素材1個の最小有効構成で成立する | 境界値 | 🟡 | EDGE-001境界 |
| TC-I01 | 統合 | TC-101-07シナリオで支配戦略を許さない | 異常系 | 🔵 | TC-101-07（Critical） |
| TC-I02 | 統合 | Gランク(reveal_level=0)で特性ボーナスがかからない | 境界値 | 🟡 | TC-121-01 |

### 信頼性レベル分布

| 信頼性 | 件数 | 割合 |
|--------|------|------|
| 🔵 青信号 | 2 | 33% |
| 🟡 黄信号 | 4 | 67% |
| 🔴 赤信号 | 0 | 0% |

**合計6ケース**（単体4 + 統合2）。TASK-0018.md指定の必須5ケース（単体3 + 統合2）に加え、EDGE-001の境界確認としてTC-U04を補強。

### テストケース分類の網羅性

- **正常系**: TC-U01（5ステップ合成の中核）、TC-U02（全フィールド完全性） ✅
- **異常系**: TC-U03（空投入枠ガード）、TC-I01（支配戦略防止・Critical） ✅
- **境界値**: TC-U04（素材数0/1境界）、TC-I02（reveal_level 0/1境界） ✅

---

## 6. Green実装への申し送り事項

1. **rejected_category型の差異** 🟡: requirements.mdは「空文字列」（String）を想定するが、実物 `CraftResult.rejected_category` は `TraitDefinition.Category`（enum）。実装は `resolve_category_conflict` の `rejected_category`（enum）＋`has_rejected_category`（bool）を格納する。requirements.md本文をenum前提に修正する申し送りが必要。
2. **contribution/reward型の差異** 🟡: requirements.mdは `int` を想定するが、実物は `float`。ValueCalculatorの戻り値（float）をそのまま格納する。テストは `assert_almost_eq` で検証。
3. **base_qualityのfloat→enum変換** 🟡: `calculate_base_quality` はfloatを返すが `CraftResult.base_quality` はQuality enum。変換の丸め方式（round採用済み＝apply_trait_penaltyと整合）を明確にすること。
4. **activated_traitsの検証方法** 🔵: 要素は `TraitDefinition` オブジェクト。note.md擬似コードの `"聖" in result.activated_traits` は誤り。`result.activated_traits[i].id == &"holy"` で検証すること。
5. **DailyRequest未実装時の代替** 🟡: value_calculator_test同様、`DummyDailyRequest`（`required_recipe_id`/`bonus_multiplier`）でduck typing代替する必要がある可能性。実装時にDailyRequest型の存在を確認すること。
