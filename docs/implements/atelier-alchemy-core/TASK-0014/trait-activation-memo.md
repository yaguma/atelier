# TDD開発メモ: trait-activation

## 概要

- 機能名: 特性発現判定ロジック（TraitActivation.resolve_activated_traits）
- 開発開始: 2026-07-31
- 現在のフェーズ: 完了（Refactor済み）

## 関連ファイル

- 元タスクファイル: `docs/tasks/atelier-alchemy-core/TASK-0014.md`
- 要件定義: `docs/implements/atelier-alchemy-core/TASK-0014/trait-activation-requirements.md`
- テストケース定義: `docs/implements/atelier-alchemy-core/TASK-0014/trait-activation-testcases.md`
- 実装ファイル: `atelier-godot/features/alchemy/logic/trait_activation.gd`（Greenフェーズで作成済み）
- テストファイル: `atelier-godot/tests/unit/features/alchemy/trait_activation_test.gd`

## Redフェーズ（失敗するテスト作成）

### 作成日時

2026-07-31

### テストケース

`trait-activation-testcases.md` の全11ケースを実装（正常系3・異常系5・境界値3）。

- TC-101-02（正常）: 同一特性2個＋無特性2個で発現
- TC-121-02（正常）: reveal_level=1で貢献度系特性が発現
- TC-101-06（正常）: 同一系統内で複数特性が同時発現
- TC-101-03（異常）: 同一特性1個のみでは不発
- TC-121-01（異常）: reveal_level=0で発現しない
- TC-121-E01（異常）: reveal_level=0で未解禁特性混入時も発現しない（二重の安全策）
- TC-101-EMPTY（異常）: 空配列で空配列を返す
- TC-101-NOTRAIT（異常）: 全て無特性で空配列を返す
- TC-101-B01（境界）: 閾値ちょうど2個の境界値
- TC-121-B02（境界）: reveal_level 0/1の境界
- TC-123-B03（境界）: reveal_level>=2はlevel>=1と同じ扱い（暫定実装）

### テストコード

`atelier-godot/tests/unit/features/alchemy/trait_activation_test.gd` を参照（11テスト関数、GUT形式）。

主な構造:
- `preload()` で `TraitActivation`（未実装） / `MaterialInstance` / `TraitDefinition`（実装済み）を参照
- `before_each()` で `trait_defs`（holy/cleanse/heal/gold）を再構築
- `_make_trait()` / `_make_material()` の2ヘルパーでテストデータ生成
- 全アサーションに日本語コメントと信頼性レベル（🔵🟡）を付与

### 期待される失敗

`features/alchemy/logic/trait_activation.gd` が存在しないため、テストファイル内の
`preload("res://features/alchemy/logic/trait_activation.gd")` でロードエラーが発生。
GUTはこのスクリプトを「GutTestを継承していない」と判定して実行対象から除外し、
`[ERROR]: Could not find script: trait_activation_test.gd` を報告する（Errors: 1）。
他の既存テスト（28件）には影響なく全てPassing。

### 次のフェーズへの要求事項

- `atelier-godot/features/alchemy/logic/trait_activation.gd` を新規作成
- `class_name TraitActivation extends RefCounted`
- `static func resolve_activated_traits(materials, reveal_level, trait_definitions) -> Array[TraitDefinition]`
- 実装順序:
  1. reveal_level == 0 → 即座に空配列（最優先フィルタ）
  2. materials内のtraits出現回数を集計
  3. 出現回数 >= 2 の特性タグのみ候補化
  4. reveal_level >= 2 は暫定的に >= 1 と同じ扱い
  5. 候補タグを trait_definitions 辞書から TraitDefinition に解決して返す
  6. 系統排他は行わない（TASK-0015の責務）
- 純粋関数原則を厳守（GameState/Autoload参照禁止）
- 実行コマンド:
  `cd atelier-godot && godot --headless -s addons/gut/gut_cmdln.gd -gdir=res://tests/unit/features/alchemy -gtest=trait_activation_test.gd -gexit`

## Greenフェーズ（最小実装）

### 実装日時

2026-07-31

### 実装方針

- Redフェーズの想定通り、`reveal_level <= 0`を最優先の早期returnとし、以降で
  traits出現回数集計 → 閾値(2)判定 → `trait_definitions`辞書解決の順に処理。
- `reveal_level >= 2`個別分岐は設けず、`<= 0`ガードのみで暫定実装（TC-123-B03）を満たす構造にした。
- マジックナンバー`2`は`ACTIVATION_THRESHOLD`定数として命名（coding-style.md準拠）。
- 詳細は `trait-activation-green-phase.md` を参照。

### テスト結果

`trait_activation_test.gd`: **11/11 passed**。既存28件（craft_result/material_instance/
quality_calculator/recipe_definition/trait_definition）もデグレなく全てPassing。
合計 **39/39 passed**。

### 課題・改善点

- 明確なリファクタリング対象なし。Refactorフェーズではコメント整理・型注釈の厳密化を確認予定。

## Refactorフェーズ（品質改善）

### 実施日時

2026-07-31

### リファクタリング内容

機能的な変更は行わず、日本語コメントの明示性強化のみを実施（詳細は
`trait-activation-refactor-phase.md`参照）。

1. **Godotアーキテクトレビュー Critical#1対応の明示**: ファイル冒頭のドキュメントコメントに、
   旧設計案（`GameState.current_rank`直接参照）の問題点と修正内容、禁止事項3点
   （GameState参照・`Engine.get_main_loop()`経由Autoload取得・シングルトン参照）を明記。
2. **「二重の安全策」の設計意図を明示**: `reveal_level <= 0`の早期returnコメントに、
   なぜこのガードをtraits集計より前に置くのか（UI側の入手制限漏れへの二重防御、
   非開示最優先の仕様を制御フローで表現）を追記。
3. **REQ-123暫定実装の申し送りを強化**: `TODO(REQ-123確定後の再設計)`マーカーを追加し、
   再設計対象（`min_rank_to_reveal`変換ロジック、フィルタ条件）と関連回帰テスト
   （TC-123-B03）を明記。

### セキュリティ・パフォーマンスレビュー結果

- セキュリティ: 重大な脆弱性なし（型付き引数・防御的な`has()`ガードあり・副作用なし）
- パフォーマンス: 重大な性能課題なし（O(n*k)、投入枠規模では事実上定数時間）

### テスト結果

リファクタ前後とも **39/39 passed**（Asserts 76）。コメントのみの変更のためロジック・
実行時間に変化なし。

### 品質評価

✅ 高品質（テスト全成功・セキュリティ問題なし・パフォーマンス問題なし・
ファイルサイズ91行で500行制限に余裕・ドキュメント完成）

### 最終コード

`trait-activation-refactor-phase.md`の「改善後コード全文」を参照
（実体: `atelier-godot/features/alchemy/logic/trait_activation.gd`）。
