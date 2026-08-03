# TDD開発メモ: 特性系統間排他制御（TraitActivation.resolve_category_conflict）

## 概要

- 機能名: 特性系統間排他制御（TraitActivation.resolve_category_conflict）
- 開発開始: 2026-08-01
- 現在のフェーズ: Refactor（完了）

## 関連ファイル

- 元タスクファイル: `docs/tasks/atelier-alchemy-core/TASK-0015.md`
- 要件定義: `docs/implements/atelier-alchemy-core/TASK-0015/trait-category-conflict-requirements.md`
- テストケース定義: `docs/implements/atelier-alchemy-core/TASK-0015/trait-category-conflict-testcases.md`
- 実装ファイル: `atelier-godot/features/alchemy/logic/trait_activation.gd`
- テストファイル: `atelier-godot/tests/unit/features/alchemy/trait_activation_test.gd`

## Redフェーズ（失敗するテスト作成）

### 作成日時

2026-08-01

### テストケース

要件定義書のテストケース10件（正常系4・異常系3・境界値3）を `trait_activation_test.gd` に追記した。TASK-0014の既存11件（`resolve_activated_traits`）は変更せず、`before_each` に補助系検証用の `catalyst`（SUPPORT）特性定義のみを追加した。

- 正常系: 不均衡3対2、不均衡（対称性）、片系統のみ、補助系混在
- 異常系: 同数2対2不発（TC-101-04 Critical）、1素材2タグ同時保持不発（TC-101-07 Critical）、候補空
- 境界値: 差分1の最小不均衡、SUPPORT単独、系統内複数特性の一括存置/除去

### テストコード

`atelier-godot/tests/unit/features/alchemy/trait_activation_test.gd` 末尾に追記（詳細は同ファイル参照）。

### 期待される失敗

`features/alchemy/logic/trait_activation.gd` に `resolve_category_conflict` のスタブ（`return {}`）のみ追加した状態で実行し、新規10件は以下のエラーで失敗することを確認した。

```
SCRIPT ERROR: Invalid access to property or key 'activated_traits' on a base object of type 'Dictionary'.
```

既存のTASK-0014テスト11件は引き続き全てパスすることを確認した（6スクリプト・49テスト中 Passing 39 / Failing 10）。

### 次のフェーズへの要求事項

Greenフェーズで `resolve_category_conflict` を本実装する。

1. `activated_traits` を `category` でグループ化（CONTRIBUTION/REWARD/SUPPORT）
2. CONTRIBUTION群・REWARD群それぞれで、各特性タグを持つ `materials` の出現回数を合計
3. 比較・排他（多い方のみ残す／同数は両方除外／片方0なら排他なし）
4. SUPPORT群は常に結果に残す
5. `{"activated_traits", "rejected_category", "has_rejected_category"}` の3キー構造を必ず維持する
6. 純粋関数として実装（`static func`、外部状態参照・変更禁止）

## Greenフェーズ（最小実装）

### 実装日時

2026-08-01

### 実装方針

`resolve_category_conflict` を、系統別グループ化 → タグ出現回数集計 → 比較・排他判定 → SUPPORT常時保持、の順で実装した。詳細は `trait-category-conflict-green-phase.md` を参照。

### テスト結果

`trait_activation_test.gd` 21/21 パス（既存11 + 新規10）。全体6スクリプト・49テストで Passing 49 / Failing 0。TC-101-04（同数不発）・TC-101-07（1素材2タグ同時保持不発）を含め全ケースGreen。

### 課題・改善点

- `_count_materials_for_traits` の線形探索はRefactor候補（現状は許容範囲）
- `rejected_category` のデフォルト値表現についてコメント拡充の余地あり

## Refactorフェーズ（品質改善）

### リファクタリング日時

2026-08-01

### 改善内容

ロジック（分岐・アルゴリズム）は一切変更せず、コメントのみを強化した（機能的変更なし）。

1. `resolve_category_conflict` 関数ヘッダに「ゲームデザインレビュー対応」節を追加し、
   2026-07-09のゲームデザインレビューCritical指摘（貢献度系・報酬系の無条件両取り＝支配戦略）
   への直接対応であることを明示した。
2. 「最重要ケースに関する注意」節を追加し、TC-101-04（同数2vs2不発）・TC-101-07（1素材2タグ
   同時保持でも不発）が支配戦略防止の生命線であること、将来の改変時にこの2ケースを壊しては
   ならないことを明示的に警告するコメントを残した。
3. 「同数の場合」分岐の直前コメントを拡充し、この分岐に手を加える際は必ずTC-101-04/07を
   実行して確認するよう明記した。
4. `rejected_category`/`has_rejected_category` の無効値表現について、TASK-0012
   （craft-data-model）からの申し送り内容（案A: `Category.NONE`追加 / 案B: `has_rejected_category`
   bool併設）と、本タスクが案Bを採用した理由（Category enumの意味論を汚さないため）を
   コメントとして明記した。
5. 関数のDoc comment（`@returns`）に、`rejected_category`は`has_rejected_category`確認後に
   参照すべき契約を追記した。

### セキュリティレビュー結果

- 外部入力（materials/activated_traits）はすべて型付き配列で受け取り、`static func`の
  純粋関数として実装済み。DB・ファイルI/O・ネットワーク通信なし。
- 実装コード内にモック・スタブ・インメモリDB代替は存在しない（禁止事項に抵触なし）。
- 重大な脆弱性なし。

### パフォーマンスレビュー結果

- `_count_materials_for_traits`はO(materials数 × traits数)の線形探索。特性種類・投入枠数は
  ゲーム仕様上少数（数枠程度）であり、現状のデータ規模では問題なし。Green phase時点の
  課題（Dictionary化での高速化余地）は将来必要になった際の改善候補として据え置く
  （過度な最適化を避ける方針、YAGNI）。
- ループ・再帰・アロケーションの増加なし（コメント追加のみのため計算量に変化なし）。

### テスト実行結果

`atelier-godot/`から以下を実行。

```
Godot_v4.7-stable_win64_console.exe --headless -s addons/gut/gut_cmdln.gd -gdir=res://tests/unit/features/alchemy -gexit
```

- 全体（6スクリプト・49テスト）: **Passing 49 / Failing 0**（リファクタ前と同じ、デグレなし）
- `test_同数2対2で両系統とも不発になり空配列を返す`（TC-101-04・Critical）: Pass
- `test_1素材が2タグ同時保持でも同数不発で両取りできない`（TC-101-07・Critical）: Pass

### コメント改善内容

- 日本語コメントに「なぜ」（ゲームデザイン上の理由・TASK-0012からの申し送り経緯）を追加し、
  「何を」だけでなく設計判断の背景が追えるようにした。
- 改変を禁じる箇所には🔴信号を付与し、軽率な変更を抑止する警告コメントとして機能させた。

### ファイルサイズ

`features/alchemy/logic/trait_activation.gd`: 約240行（500行制限内）。

### 品質判定

✅ 高品質（テスト全件継続成功・セキュリティ問題なし・パフォーマンス問題なし・
コメント品質向上・機能的変更なし）
