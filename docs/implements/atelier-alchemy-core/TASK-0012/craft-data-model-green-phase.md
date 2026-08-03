# TASK-0012 データモデル（RecipeDefinition / CraftResult）Greenフェーズ記録

**機能名**: 調合データモデル（RecipeDefinition / CraftResult）
**タスクID**: TASK-0012
**要件名**: atelier-alchemy-core
**フェーズ**: Green（最小実装）
**作成日**: 2026-07-25

---

## 実装ファイル

### `atelier-godot/features/alchemy/data/recipe_definition.gd`

```gdscript
## TASK-0012: 調合レシピの静的定義（マスターデータ）
##
## 【機能概要】: 調合レシピの静的定義データモデル。投入枠数・基礎貢献度・基礎報酬を保持する
## 【実装方針】: Resource継承のマスターデータとして全プロパティを@exportで公開し、
## 　　　　　　 Godot Editor / .tresファイルから編集可能にする。副作用・ロジックは持たない。
## 　　　　　　 slot_countの初期値4はREQ-101に対応し、工房強化による加算はGameState側の責務とする
## 【テスト対応】: recipe_definition_test.gd の N-1, N-2, N-3, B-3 を通すための実装
## 🔵 信頼性レベル: data-model.md・requirements.md（TASK-0012）の型定義に基づく
class_name RecipeDefinition
extends Resource

## 【一意識別子】: レシピを一意に識別するID 🔵
@export var id: StringName

## 【UI表示名】: プレイヤー向けに表示するレシピ名 🔵
@export var display_name: String

## 【投入枠数】: 初期値4（REQ-101）。工房強化による+1・最大5枠はGameState側の責務 🔵
@export var slot_count: int = 4

## 【基礎貢献度】: 品質ペナルティ・触媒補正適用前の基礎値（REQ-109）。具体値はTBD 🟡
@export var base_contribution: float = 0.0

## 【基礎報酬】: 品質ペナルティ・触媒補正適用前の基礎値（REQ-110）。具体値はTBD 🟡
@export var base_reward: float = 0.0
```

### `atelier-godot/features/alchemy/data/craft_result.gd`

```gdscript
## TASK-0012: 調合結果の実行時値オブジェクト
##
## 【機能概要】: 調合1回分の結果を保持する実行時データモデル。品質ペナルティ適用前後の品質、
## 　　　　　　 発現した特性、系統排他制御で不発になった分類、最終貢献度・報酬を保持する
## 【実装方針】: RefCounted継承で副作用を持たない純粋データとして実装する。
## 　　　　　　 base_quality/final_qualityを分離保持することで「なぜこの結果か」を説明可能にする（REQ-105, REQ-111）。
## 　　　　　　 activated_traitsの個数制約はデータモデル層では強制せず、拒否責務はロジック層（TASK-0015）に委譲する。
## 　　　　　　 rejected_categoryは型定義のみとし、「不発なし」を表す無効値表現はTASK-0015で確定する
## 【テスト対応】: craft_result_test.gd の N-4, N-5, E-1, B-1, B-2, B-4 を通すための実装
## 🔵 信頼性レベル: data-model.md・requirements.md（TASK-0012）の型定義に基づく
class_name CraftResult
extends RefCounted

## 【基礎品質】: 品質ペナルティ適用前の品質（REQ-105） 🔵
var base_quality: MaterialInstance.Quality

## 【最終品質】: 品質ペナルティ・触媒補正適用後の品質。下限D=1のクランプはロジック層の責務（REQ-111） 🔵
var final_quality: MaterialInstance.Quality

## 【発現特性配列】: 同一系統内の複数同時発現に対応する（REQ-112）。個数制約は強制しない 🔵
var activated_traits: Array[TraitDefinition] = []

## 【不発分類】: 系統排他制御で不発となった分類（REQ-115）。型定義のみでTASK-0015で無効値表現を確定 🟡
var rejected_category: TraitDefinition.Category

## 【最終貢献度】: 基礎貢献度に各種補正を適用した最終値（REQ-109）。具体値はTBD 🟡
var contribution: float = 0.0

## 【最終報酬】: 基礎報酬に各種補正を適用した最終値（REQ-110）。具体値はTBD 🟡
var reward: float = 0.0
```

---

## 実装方針と判断理由

- Redフェーズ記録（`craft-data-model-red-phase.md`）に記載された「Greenフェーズで実装すべき内容」をそのまま最小実装として反映した。data-model.md記載の型定義を忠実に器として実装するのみで、計算ロジックは一切含めない（TASK-0014/0015/0017/0018に委譲）。
- `rejected_category` はテストケース定義書・note.mdの注記どおり型定義のみとし、無効値表現（`Category.NONE`追加 or `has_rejected_category`フラグ）はTASK-0015で確定する方針を踏襲した。テストファイルもこのフィールドの値を直接検証していないため、Greenフェーズでの追加判断は不要だった。
- コメントスタイルはTASK-0011実装（`trait_definition.gd`, `material_instance.gd`）の `##` ドキュメンテーションコメント形式に統一し、各プロパティに信頼性レベル（🔵🟡）を付与した。

---

## テスト実行結果

### 実行コマンド

```bash
cd atelier-godot
"C:\Users\syagu\AppData\Local\Microsoft\WinGet\Packages\GodotEngine.GodotEngine_Microsoft.Winget.Source_8wekyb3d8bbwe\Godot_v4.7-stable_win64_console.exe" --headless -s addons/gut/gut_cmdln.gd -gdir=res://tests/unit/features/alchemy -gexit
```

### 発生した問題と対処

初回実行時、`craft_result_test.gd` の `Array[TraitDefinition]` 型注釈で `Parse Error: Could not find type "TraitDefinition" in the current scope.` が発生した。原因は `.godot/global_script_class_cache.cfg`（Godotのグローバルclass_nameキャッシュ）に新規実装した `RecipeDefinition`/`CraftResult`（および実装済みだが未スキャンの `TraitDefinition`/`MaterialInstance` の一部参照）が未登録だったこと。ヘッドレスのGUT実行だけではエディタのプロジェクトスキャンが走らずキャッシュが更新されない。

対処として `godot --headless --editor --quit` を一度実行し、エディタのプロジェクトスキャンを強制してキャッシュ（`global_script_class_cache.cfg`）に `CraftResult`, `RecipeDefinition`, `MaterialInstance`, `TraitDefinition` の4クラスが登録されたことを確認した上で再実行し、全テストが成功した。

### 実行結果（最終）

```
res://tests/unit/features/alchemy/craft_result_test.gd    6/6 passed.
res://tests/unit/features/alchemy/material_instance_test.gd 7/7 passed.
res://tests/unit/features/alchemy/recipe_definition_test.gd 4/4 passed.
res://tests/unit/features/alchemy/trait_definition_test.gd  3/3 passed.

Totals
Scripts  4
Tests    20
Passing Tests 20
Asserts  49
---- All tests passed! ----
```

TASK-0011の既存テスト（`material_instance_test.gd` 7件, `trait_definition_test.gd` 3件）も引き続き全件パスし、デグレなしを確認した。

---

## 課題・改善点（Refactorフェーズで対応）

- 現状はdata-model.mdの型定義をそのまま列挙しただけであり、リファクタ対象となる重複や複雑な分岐は存在しない。Refactorフェーズでは主にコメント表現・信頼性レベル注記の精査を行う程度で十分と想定する。
- `rejected_category` の無効値表現はTASK-0015で対応予定（本タスクのスコープ外）。
