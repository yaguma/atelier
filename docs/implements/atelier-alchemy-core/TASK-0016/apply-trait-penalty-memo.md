# TDD開発メモ: apply-trait-penalty

## 概要

- 機能名: QualityCalculator.apply_trait_penalty（品質ペナルティ適用）
- 開発開始: 2026-08-02
- 現在のフェーズ: 完了（Refactor済み）

## 関連ファイル

- 元タスクファイル: `docs/tasks/atelier-alchemy-core/TASK-0016.md`
- 要件定義: `docs/implements/atelier-alchemy-core/TASK-0016/apply-trait-penalty-requirements.md`
- テストケース定義: `docs/implements/atelier-alchemy-core/TASK-0016/apply-trait-penalty-testcases.md`
- Redフェーズ記録: `docs/implements/atelier-alchemy-core/TASK-0016/apply-trait-penalty-red-phase.md`
- 実装ファイル: `atelier-godot/features/alchemy/logic/quality_calculator.gd`
- テストファイル: `atelier-godot/tests/unit/features/alchemy/quality_calculator_test.gd`

## Redフェーズ（失敗するテスト作成）

### 作成日時

2026-08-02

### テストケース

テストケース定義書の9件全てを実装した。
- 正常系4件（TC-16-N01〜N04）: 1段減算・加算的積重・SUPPORT加算・REWARD減算
- 異常系1件（TC-16-E01）: 発現特性0個時の非変化
- 境界値4件（TC-16-B01〜B04）: 下限クランプ（Critical）・上限クランプ・round丸め・複合境界

既存の`calculate_base_quality`テスト8件はそのまま維持し、`quality_calculator_test.gd`の末尾に追記する形で実装した。ヘルパーとして`const TraitDefinitionScript`（preload）と`_make_trait(p_id, p_cat)`を追加（`trait_activation_test.gd`の`_make_trait`パターンを踏襲）。

### テストコード

`atelier-godot/tests/unit/features/alchemy/quality_calculator_test.gd` の
`# TASK-0016: QualityCalculator.apply_trait_penalty（品質ペナルティ適用）` セクション以降を参照。

### 期待される失敗

`apply_trait_penalty`が未実装（型注釈を満たすダミー値`MaterialInstance.Quality.D`のみを返すスタブ）のため、9件中7件は期待値と不一致でFailする。残り2件（TC-16-B01, TC-16-B04）は「下限保証によりD(1)へクランプされる」ケースであり、期待値がスタブのダミー値と偶然一致するためPassするが、これは実装ロジックの正しさを示すものではない（TASK-0015のRedフェーズで確認済みの既知現象）。

### 次のフェーズへの要求事項

Greenフェーズで以下のアルゴリズムを`apply_trait_penalty`に実装する。

1. `activated_traits`のうち`category != SUPPORT`の件数 → `penalty_count`
2. `quality_after_penalty = base_quality - penalty_count`
3. `activated_traits`のうち`category == SUPPORT`の件数 → `support_bonus_count`
4. `quality_after_penalty += support_bonus_count`
5. 下限クランプ: `max(quality_after_penalty, 1.0)`
6. 上限クランプ: `min(quality_after_penalty, 5.0)`
7. `round()`で丸め → `MaterialInstance.Quality`にキャストして返却

実装後、新規9件全てがPass、既存8件も引き続きPassすることをGUTで確認する。

## Greenフェーズ（最小実装）

### 実装日時

2026-08-02

### 実装方針

要件定義書§2・テストケース定義書のアルゴリズム7ステップをそのまま実装した。ユーザー提示のロジックは仕様と完全一致していたため、差異なく採用した。

1. `activated_traits`をループし、`category == SUPPORT`なら`support_bonus_count`、それ以外（CONTRIBUTION/REWARD）なら`penalty_count`をインクリメント
2. `base_quality - penalty_count`で減算
3. 減算「後」に`support_bonus_count`を加算（触媒の事後加算というREQ-108/REQ-111の処理順序を厳守）
4. `max(x, 1.0)`で下限クランプ（Critical / TC-101-B02）
5. `min(x, 5.0)`で上限クランプ（防御的実装）
6. `round()`で四捨五入し`int()`変換後、`MaterialInstance.Quality`にキャストして返却

### 実装コード

```gdscript
static func apply_trait_penalty(
	base_quality: float,
	activated_traits: Array[TraitDefinition],
) -> MaterialInstance.Quality:
	var penalty_count := 0
	var support_bonus_count := 0
	for trait_def in activated_traits:
		if trait_def.category == TraitDefinition.Category.SUPPORT:
			support_bonus_count += 1
		else:
			penalty_count += 1

	var quality_after_penalty := base_quality - float(penalty_count)
	quality_after_penalty += float(support_bonus_count)

	quality_after_penalty = max(quality_after_penalty, 1.0)
	quality_after_penalty = min(quality_after_penalty, 5.0)

	var rounded := int(round(quality_after_penalty))
	return rounded as MaterialInstance.Quality
```

（実装ファイル上には各行に🔵🟡信頼性コメントと日本語説明を付与済み）

### テスト実行結果

```
res://tests/unit/features/alchemy/quality_calculator_test.gd
17/17 passed.（既存calculate_base_quality 8件 + 新規apply_trait_penalty 9件、全件Pass）

alchemy feature全体: 58/58 passed（craft_result / material_instance / quality_calculator /
recipe_definition / trait_activation / trait_definition の6スクリプト、デグレなし）
```

### 品質判定

```
✅ 高品質:
- テスト結果: 58/58 全て成功（Taskツール相当のGUT実行で確認）
- 実装品質: シンプル、要件定義のアルゴリズム7ステップと1:1対応
- 機能的問題: なし
- コンパイルエラー: なし
- ファイルサイズ: quality_calculator.gd 全体で約110行（800行制限内）
- モック使用: 実装コードにモック・スタブなし（実処理のみ）
```

### 課題・改善点（Refactorフェーズ候補）

- `TraitDefinition.Category.SUPPORT`等のenum参照は既存コードと一貫しており、現時点で大きなリファクタ対象は見当たらない
- コメント量がやや多いため、Refactorフェーズで冗長箇所を整理する余地がある（TASK-0013のリファクタ時と同様の方針）

## Refactorフェーズ（品質改善）

### 実施日時

2026-08-02

### リファクタリング方針

ロジック自体（アルゴリズム7ステップ）に改善点はなく、**機能的な変更は行わない**方針とし、コメントの構造化・強化のみを実施した。`calculate_base_quality`（TASK-0013リファクタ）で採用済みの「⚠️ 設計判断」形式に倣い、以下3点を独立ブロックとして明文化した。

1. **設計判断1**: 品質スコアへの直接減算方式は2026-07-09のゲームデザインレビューで確定した仕様であり、旧版（枠数ベースの食い合い＝1素材が複数特性を同時保有し品質・特性・貢献度・報酬を無条件に両取りできる支配戦略の抜け穴）に戻さないよう🚨マーク付きで警告
2. **設計判断2**: SUPPORT（触媒）複数投入時の「件数分単純加算」モデルはREQ-108本文に明記のない暫定実装であり、バランス調整フェーズでの再検討が必要な可能性があると📝マーク付きで申し送り
3. **設計判断3**: round()（四捨五入）による丸め方式は、TASK-0013由来の設計文書間の不整合（architecture.mdのint想定 vs acceptance-criteria.mdの非整数期待値）に対する暫定対応であり、正式決定時にはTC-16-B03と合わせて見直す旨を📝マーク付きで申し送り

関数本体側にも、penalty_countの加算箇所（回帰防止）、support_bonus_countの加算箇所（暫定実装）、round()呼び出し箇所（丸め方式・暫定対応）にそれぞれ対応するインラインコメントを追加し、コメントブロックと実装コードの両方から参照できるようにした。

### テスト実行結果

```
alchemy feature全体: 58/58 passed（リファクタ前後で変化なし、デグレなし）
実行時間: 約1.6秒（2秒未満）
```

### 品質判定

```
✅ 高品質:
- テスト結果: 58/58 全て継続成功
- セキュリティ: 重大な脆弱性なし（純粋関数、外部I/Oなし）
- パフォーマンス: 重大な性能課題なし（O(n)の単純計算のみ）
- リファクタ品質: 目標達成（3つの申し送り事項を明文化、機能変更なし）
- コード品質: calculate_base_qualityと同一形式でコメントスタイルの一貫性を確保
- ファイルサイズ: quality_calculator.gd 全体で140行（500行制限内）
```

詳細は `docs/implements/atelier-alchemy-core/TASK-0016/apply-trait-penalty-refactor-phase.md` を参照。

次のお勧めステップ: `/tsumiki:tdd-verify-complete` で完全性検証を実行する。
