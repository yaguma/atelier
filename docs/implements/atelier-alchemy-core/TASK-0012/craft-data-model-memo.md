# TDD開発メモ: 調合データモデル（RecipeDefinition / CraftResult）

## 概要

- 機能名: 調合データモデル（RecipeDefinition / CraftResult）
- 開発開始: 2026-07-22
- 現在のフェーズ: 完了

## 関連ファイル

- 元タスクファイル: `docs/tasks/atelier-alchemy-core/TASK-0012.md`
- 要件定義: `docs/implements/atelier-alchemy-core/TASK-0012/craft-data-model-requirements.md`
- テストケース定義: `docs/implements/atelier-alchemy-core/TASK-0012/craft-data-model-testcases.md`
- 実装ファイル（未実装）:
  - `atelier-godot/features/alchemy/data/recipe_definition.gd`
  - `atelier-godot/features/alchemy/data/craft_result.gd`
- テストファイル:
  - `atelier-godot/tests/unit/features/alchemy/recipe_definition_test.gd`
  - `atelier-godot/tests/unit/features/alchemy/craft_result_test.gd`

## Redフェーズ（失敗するテスト作成）

### 作成日時

2026-07-22

### テストケース

テストケース定義書の10件すべてを実装。
- `recipe_definition_test.gd`: N-1, N-2, N-3, B-3（4件）
- `craft_result_test.gd`: N-4, N-5, E-1, B-1, B-2, B-4（6件）

### テストコード

`atelier-godot/tests/unit/features/alchemy/recipe_definition_test.gd`, `atelier-godot/tests/unit/features/alchemy/craft_result_test.gd` を参照（詳細は `craft-data-model-red-phase.md`）。

### 期待される失敗

`RecipeDefinition`/`CraftResult` の実装ファイルが存在しないため、`preload()` の解決に失敗し `Parse Error: Preload file ... does not exist` でテストスクリプトのロード自体が失敗する（GUTがスクリプトを"Ignoring"としてスキップ）。実装クラス未存在による確実な失敗であることを確認済み。

### 次のフェーズへの要求事項

- `recipe_definition.gd`: `class_name RecipeDefinition extends Resource`。`id`, `display_name`, `slot_count(=4)`, `base_contribution(=0.0)`, `base_reward(=0.0)` を `@export` で宣言。
- `craft_result.gd`: `class_name CraftResult extends RefCounted`。`base_quality`, `final_quality`（`MaterialInstance.Quality`）、`activated_traits: Array[TraitDefinition] = []`、`rejected_category`（`TraitDefinition.Category`、型定義のみ）、`contribution(=0.0)`, `reward(=0.0)`。
- data-model.md記載の型定義どおりの最小実装でテストが通る見込み。

## Greenフェーズ（最小実装）

### 実装日時

2026-07-25

### 実装方針

Redフェーズ記録の「Greenフェーズで実装すべき内容」をそのまま最小実装として反映。data-model.md記載の型定義を忠実に器として実装するのみで、計算ロジックは含めない（TASK-0014/0015/0017/0018に委譲）。詳細は `craft-data-model-green-phase.md` を参照。

### 実装コード

- `atelier-godot/features/alchemy/data/recipe_definition.gd`: `class_name RecipeDefinition extends Resource`。`id`, `display_name`, `slot_count(=4)`, `base_contribution(=0.0)`, `base_reward(=0.0)` を `@export` で宣言。
- `atelier-godot/features/alchemy/data/craft_result.gd`: `class_name CraftResult extends RefCounted`。`base_quality`, `final_quality`（`MaterialInstance.Quality`）、`activated_traits: Array[TraitDefinition] = []`、`rejected_category`（`TraitDefinition.Category`、型定義のみ）、`contribution(=0.0)`, `reward(=0.0)`。

### テスト結果

全20件パス（`recipe_definition_test.gd` 4/4, `craft_result_test.gd` 6/6, 既存の `material_instance_test.gd` 7/7・`trait_definition_test.gd` 3/3もデグレなし）。

### 課題・改善点

- 初回実行時、`.godot/global_script_class_cache.cfg` に新規class_nameが未登録で `Could not find type "TraitDefinition"` エラーが発生。`godot --headless --editor --quit` でキャッシュを強制更新して解消（実装バグではなく実行環境側の注意点）。
- 型定義をそのまま実装しただけのため、大きなリファクタ対象はなし。`rejected_category` の無効値表現はTASK-0015で対応予定。

## Refactorフェーズ（品質改善）

### 実施日時

2026-07-25

### リファクタ内容

型定義をそのまま実装しただけのデータモデルであり、重複コード・複雑な分岐は存在しなかったため、機能的な変更は行っていない。`craft_result.gd` の `base_quality`/`final_quality` について、他フィールド（`contribution`/`reward`=0.0, `activated_traits`=[]）と異なりデフォルト値を持たない設計意図（Quality enumに中立値が存在せず、AlchemyResolver.craft()が必ず設定する契約であること）をコメントに追記した。詳細は `craft-data-model-refactor-phase.md` を参照。

### セキュリティレビュー結果

純粋データモデルのみで外部入力処理・I/O・コード実行を含まないため、重大な脆弱性なし。

### パフォーマンスレビュー結果

全プロパティがO(1)のset/getのみで、ループ・再帰・I/Oを含まないため重大な性能課題なし。

### テスト結果

全20件パス（リファクタ前後で回帰なし。`recipe_definition_test.gd` 4/4, `craft_result_test.gd` 6/6, `material_instance_test.gd` 7/7, `trait_definition_test.gd` 3/3）。実行時間は約1秒未満で遅いテストなし。

### 品質評価

✅ 高品質（テスト全件パス・セキュリティ/パフォーマンス課題なし・ファイルサイズ26行/32行で500行制限に余裕・コメントによる設計意図の明文化を達成）

## 🎯 最終検証結果（tdd-verify-complete, 2026-07-25）

- **実装率**: 100%（テストケース定義書10件すべて実装・全20テスト中に包含）
- **成功率**: 100%（20/20パス。recipe_definition_test.gd 4/4, craft_result_test.gd 6/6, 既存material_instance_test.gd 7/7・trait_definition_test.gd 3/3もデグレなし）
- **要件網羅率**: 100%（完了条件5項目すべて充足を実コード・実行結果で確認）
- **品質判定**: 合格（高品質）
- **TODO更新**: 元タスクファイル（TASK-0012.md）の完了条件チェックボックスを全て`[x]`に更新、タイトルに完了マーク追加済み
- **スコープ外failure**: なし
