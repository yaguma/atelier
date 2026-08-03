# TASK-0011 Greenフェーズ記録: データモデル実装（TraitDefinition, MaterialInstance）

**機能名**: trait-definition-material-instance
**タスクID**: TASK-0011
**フェーズ**: Green（最小実装）
**作成日**: 2026-07-22

---

## 1. 実装方針

- Redフェーズで確認した「未実装によるpreloadエラー」を解消するため、テストケース定義書・要件定義書の型定義をそのまま実装した。
- `TraitDefinition` は `Resource` 継承・`@export`プロパティのみで構成し、ロジック（計算・変換）は一切含めない。
- `MaterialInstance` は `RefCounted` 継承・`_init()`で明示引数とデフォルト引数の双方に対応する。
- `traits` の個数（0〜2個）制約はデータモデル層では強制せず、E-1テスト（3個投入時も拒否しない）を満たすため代入のみを行う。
- 全プロパティ・実装判断に🔵🟡の信頼性レベルをコメントで付与済み（要件定義書・data-model.mdの型定義に準拠）。

---

## 2. 実装コード

### `atelier-godot/features/alchemy/data/trait_definition.gd`

```gdscript
## TASK-0011: 特性タグの静的定義（マスターデータ）
##
## 【機能概要】: 特性タグの静的定義データモデル。貢献度系/報酬系/補助系の3分類、
## 　　　　　　 段階的開示の解禁ランク情報を保持する
## 【実装方針】: Resource継承のマスターデータとして全プロパティを@exportで公開し、
## 　　　　　　 Godot Editor / .tresファイルから編集可能にする。副作用・ロジックは持たない
## 【テスト対応】: trait_definition_test.gd の N-1, N-2, N-3 を通すための実装
## 🔵 信頼性レベル: data-model.md・requirements.md（TASK-0011）の型定義に基づく
class_name TraitDefinition
extends Resource

## 【enum定義】: 特性タグの3分類（貢献度系/報酬系/補助系）
## 　REQ-107（貢献度系/報酬系の分類）、REQ-108（補助系の分離）に対応 🔵
enum Category { CONTRIBUTION, REWARD, SUPPORT }

## 【一意識別子】: 特性タグを一意に識別するID 🔵
@export var id: StringName

## 【UI表示名】: プレイヤー向けに表示する特性名 🔵
@export var display_name: String

## 【分類】: CONTRIBUTION/REWARD/SUPPORT のいずれか。系統排他制御(REQ-115)の判定基盤 🔵
@export var category: Category

## 【解禁ランクID】: 段階的開示（REQ-121〜124）で参照する解禁ランク（例: "E", "D"） 🔵
@export var min_rank_to_reveal: StringName

## 【ボーナス倍率】: デフォルト1.0（倍率を上書きしない中立値） 🔵
@export var bonus_multiplier: float = 1.0
```

### `atelier-godot/features/alchemy/data/material_instance.gd`

```gdscript
## TASK-0011: 素材の実行時インスタンス（在庫個体）
##
## 【機能概要】: 素材の実行時インスタンス。品質値D〜S・特性タグ0〜2個を保持する在庫個体
## 【実装方針】: RefCounted継承で副作用を持たない純粋データとして実装する。
## 　　　　　　 traitsの個数制約（0〜2個）はデータモデル層では強制せず、
## 　　　　　　 拒否責務はロジック層（REQ-111/REQ-115, TASK-0015・0016）に委譲する
## 【テスト対応】: material_instance_test.gd の N-4, N-5, E-1, B-1, B-2, B-3, B-4 を通すための実装
## 🔵 信頼性レベル: data-model.md・requirements.md（TASK-0011）の型定義に基づく
class_name MaterialInstance
extends RefCounted

## 【enum定義】: 品質値D〜S。整数評価でスコア1〜5に一致する（REQ-103） 🔵
enum Quality { D = 1, C = 2, B = 3, A = 4, S = 5 }

## 【個体識別子】: 在庫管理用のID 🔵
var id: String

## 【由来種ID】: 庭からの収穫元の種ID。_init非対象で後付け代入される 🟡
var seed_id: StringName

## 【品質】: D〜Sの5段階 🔵
var quality: Quality

## 【特性タグ配列】: TraitDefinition.idを参照するStringNameの配列。0〜2個を想定するが
## 　データモデル層では個数を機械的に拒否しない（E-1） 🔵
var traits: Array[StringName] = []


## 【機能概要】: MaterialInstanceの初期化処理
## 【実装方針】: デフォルト引数付きで、明示引数省略時も安全に初期化されるようにする
## 【テスト対応】: N-4（明示引数）, B-2（省略時デフォルト）を通すための実装
## 🔵 信頼性レベル: data-model.mdの_initシグネチャに基づく
## @param p_id - 個体識別用ID（省略時は空文字列）
## @param p_quality - 品質（省略時はQuality.D）
## @param p_traits - 特性タグ配列（省略時は空配列）
func _init(p_id: String = "", p_quality: Quality = Quality.D, p_traits: Array[StringName] = []) -> void:
	# 【初期化処理】: 引数をそのままプロパティへ代入する。個数制約の検証は行わない
	id = p_id
	quality = p_quality
	traits = p_traits
```

---

## 3. テスト実行結果

実行コマンド:

```bash
cd atelier-godot
"/c/Users/syagu/AppData/Local/Microsoft/WinGet/Packages/GodotEngine.GodotEngine_Microsoft.Winget.Source_8wekyb3d8bbwe/Godot_v4.7-stable_win64_console.exe" \
  --headless -s addons/gut/gut_cmdln.gd -gdir=res://tests/unit/features/alchemy -gexit
```

結果:

```
res://tests/unit/features/alchemy/material_instance_test.gd
7/7 passed.

res://tests/unit/features/alchemy/trait_definition_test.gd
3/3 passed.

Totals
------
Scripts               2
Tests                10
Passing Tests        10
Asserts              27
Time              0.821s

---- All tests passed! ----
```

全10件（正常系5・異常系1・境界値4）がGreenになったことを確認した。

---

## 4. 品質判定

✅ **高品質**:
- テスト結果: 全10件成功（アサーション27件）
- 実装品質: シンプル。データ保持のみでロジックを含まない
- リファクタ箇所: 現時点で明確な重複・複雑箇所なし（プロパティ定義とコンストラクタのみ）
- 機能的問題: なし
- ファイルサイズ: trait_definition.gd 27行、material_instance.gd 34行（800行制限に対し余裕あり）
- モック使用: 実装コードにモック・スタブは含まれていない（純粋なデータモデル定義のみ）

**Refactorフェーズでの検討候補**:
- 現状は要件定義書の型定義をそのまま実装したのみでリファクタの必要性は低い。コメントの整理（信頼性レベル表記の一貫性）を軽微に見直す余地はある。

---

**次のお勧めステップ**: `/tsumiki:tdd-refactor atelier-alchemy-core TASK-0011` でRefactorフェーズ（品質改善）を開始します。
