# TDD開発メモ: 調合オーケストレーター（AlchemyResolver.craft）

## 概要

- 機能名: 調合オーケストレーター（AlchemyResolver.craft）
- 開発開始: 2026-08-02
- 現在のフェーズ: 完了

## 関連ファイル

- 元タスクファイル: `docs/tasks/atelier-alchemy-core/TASK-0018.md`
- 要件定義: `docs/implements/atelier-alchemy-core/TASK-0018/alchemy-resolver-craft-requirements.md`
- テストケース定義: `docs/implements/atelier-alchemy-core/TASK-0018/alchemy-resolver-craft-testcases.md`
- Redフェーズ記録: `docs/implements/atelier-alchemy-core/TASK-0018/alchemy-resolver-craft-red-phase.md`
- Greenフェーズ記録: `docs/implements/atelier-alchemy-core/TASK-0018/alchemy-resolver-craft-green-phase.md`
- Refactorフェーズ記録: `docs/implements/atelier-alchemy-core/TASK-0018/alchemy-resolver-craft-refactor-phase.md`
- 実装ファイル: `atelier-godot/features/alchemy/logic/alchemy_resolver.gd`
- テストファイル（単体）: `atelier-godot/tests/unit/features/alchemy/alchemy_resolver_test.gd`
- テストファイル（統合）: `atelier-godot/tests/integration/features/alchemy/alchemy_resolver_integration_test.gd`

## Redフェーズ（失敗するテスト作成）

### 作成日時

2026-08-02

### テストケース

単体4件（TC-U01〜U04）・統合2件（TC-I01〜I02）を作成。`alchemy_resolver.gd` は常に `null` を返すスタブとした。

### 期待される失敗

単体: 75テスト中72passing/3failing（TC-U01/U02/U04が`Expected anything but NULL`等で失敗、TC-U03はスタブのnull返却がEDGE-001期待値と一致し偶然成功）。統合: 2テストとも失敗。既存71件（TASK-0011〜0017分）は回帰なし。

### 次のフェーズへの要求事項

Greenフェーズで5ステップ合成（`calculate_base_quality → resolve_activated_traits → resolve_category_conflict → apply_trait_penalty → calculate_contribution/calculate_reward`）を実装する。

## Greenフェーズ（最小実装）

### 実装日時

2026-08-03

### 実装方針

`craft()` にEDGE-001ガード（`materials.is_empty()`で`null`短絡）を最優先で配置し、続けて5ステップを順番に呼び出して`CraftResult`の全6フィールドを設定した。`base_quality`はfloat→enum変換を`round()`で行い、既存`apply_trait_penalty`の丸め方式と統一した。`rejected_category`は`has_rejected_category`契約に従い、trueの場合のみ明示的に上書きする方針とした。詳細は `alchemy-resolver-craft-green-phase.md` を参照。

### テスト結果

- 単体（`tests/unit/features/alchemy`）: 75/75 パス（新規4 + 既存71）
- 統合（`tests/integration/features/alchemy`）: 2/2 パス（TC-I01支配戦略防止・TC-I02 reveal_level境界とも成功）
- 全体回帰（`tests/unit`）: 91/91 パス（デグレなし）

### トラブルシューティング

Green実装直後、`QualityCalculator`/`TraitActivation`等のグローバルクラス名がGDScriptパーサーに認識されず `Identifier "QualityCalculator" not declared in the current scope` で全滅した。原因は `.godot/global_script_class_cache.cfg` にRedフェーズ以降追加された`class_name`宣言が未反映だったこと。`godot --headless --editor --quit` を1回実行してプロジェクト全体スキャンを行いキャッシュを更新したところ解消した。実装コード自体の修正は不要だった。

### 課題・改善点（Refactorフェーズで対応）

- コメントの信頼性レベル注記（🔵🟡）の粒度をTASK-0013〜0017の既存ファイルと完全に揃えるか検討
- `rejected_category`設定部分のコメントをより明確にし、`has_rejected_category`契約の重要性を強調できるか検討
- requirements.mdとの型差異（`rejected_category`のString想定 vs 実物Category enum、`contribution`/`reward`のint想定 vs 実物float）は別途要件定義書への反映を申し送り

## Refactorフェーズ（品質改善）

### 実施日時

2026-08-03

### 改善内容

機能・アルゴリズムの変更は一切行わず、ファイル冒頭のヘッダーコメントをTASK-0013〜0017の既存ファイル規約（⚠️設計判断ブロック形式）に揃える形で拡充した。

1. **Critical#1対応の明示**: `static func`のみで構成しGameState等のAutoloadを一切参照しない純粋関数であることを明記（trait_activation.gdの記述方針を踏襲）。
2. **Warning#2対応の明示と将来への注意喚起**: 旧設計（UIが個別関数を直接呼び出す）の設計上の欠陥を明記し、🚨マークで「UI（TASK-0020）や他機能から`QualityCalculator`/`TraitActivation`/`ValueCalculator`を個別に直接呼び出すコードを新たに書かないこと」と明示的に注意喚起した。`craft()`関数ドキュメントにも「呼び出し契約」を追記。
3. **申し送り事項4論点の統合明示**: float→int変換ポイント、trait_definitions/recipe引数の追加、rejected_categoryの無効値表現、指定合致ボーナスの二重適用疑義（value_calculator.gd「設計判断1」参照）を番号付きで列挙し、本ファイルが持ち越し事項の統合地点であることを明文化。ステップ5コメントにも「二重適用は本関数内では発生しない」ことの確認注記を追加。

### セキュリティレビュー結果

純粋関数であり外部入力を直接受け付けない。重大な脆弱性なし。

### パフォーマンスレビュー結果

5ステップいずれもO(n)の単純合成のみ。オブジェクト生成は`CraftResult.new()`の1回のみ。重大な性能課題なし。

### テスト結果

- 単体（`tests/unit/features/alchemy`）: 75/75 パス（変化なし）
- 統合（`tests/integration/features/alchemy`）: 2/2 パス（変化なし）
- 全体回帰（`tests/unit`）: 91/91 パス（デグレなし）

### 品質評価

高品質。詳細は`alchemy-resolver-craft-refactor-phase.md`参照。
