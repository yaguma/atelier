# TASK-0009 Redフェーズ記録: 1画面調合プロトタイプ

**機能名**: 1画面調合プロトタイプ（alchemy-prototype）
**タスクID**: TASK-0009
**要件名**: atelier-alchemy-core
**フェーズ**: Red（失敗するテスト作成）
**作成日**: 2026-07-21

---

## 1. 作成したテストファイル

- パス: `atelier-godot/tests/unit/features/prototype/prototype_alchemy_resolver_test.gd`
- テスト対象: `PrototypeAlchemyResolver.resolve(materials)`（`atelier-godot/features/prototype/logic/prototype_alchemy_resolver.gd`、未実装）
- テストフレームワーク: GUT (Godot Unit Test) 9.6.1
- 配置理由: `atelier-godot/tests/unit/features/` 配下は `garden/`, `alchemy/`, `guild/`, `workshop/` の機能別サブディレクトリで構成されている既存の実ディレクトリ規約（Feature-Based Architecture）に合わせ、`prototype/` サブディレクトリを新設して配置した。

## 2. 実装したテストケース一覧（10件）

`alchemy-prototype-testcases.md` のTC1〜TC6, TC8〜TC11に対応（TC7はUI/シーンレベルテストのため対象外、TASK-0010または手動確認でカバー）。

| No | テスト関数名 | 分類 | 参照要件 | 信頼性 |
|----|-------------|------|---------|--------|
| TC1 | `test_基礎品質の平均値計算` | 正常系 | REQ-105簡略 | 🟡 |
| TC2 | `test_特性の閾値発現_同一タグ2個で発現` | 正常系 | REQ-106, EDGE-101 | 🔵 |
| TC3 | `test_特性1個のみでは不発` | 正常系 | REQ-106 | 🔵 |
| TC4 | `test_特性発現による品質ペナルティ` | 正常系 | REQ-111簡略 | 🟡 |
| TC11 | `test_異なる系統の特性が各2個で同時発現` | 正常系 | REQ-106独立判定 | 🟡 |
| TC6 | `test_投入枠が空の場合の調合拒否` | 異常系 | EDGE-001 | 🟡 |
| TC5 | `test_最終品質はDを下回らない` | 境界値 | REQ-111, EDGE-102 | 🔵 |
| TC8 | `test_基礎品質平均の端数切り捨て` | 境界値 | note.md端数処理 | 🟡 |
| TC9 | `test_traitsが空の素材のみでは発現なし` | 境界値 | REQ-106裏面確認 | 🟡 |
| TC10 | `test_投入枠フル4枠での調合成立` | 境界値 | REQ-101 | 🟡 |

正常系6件・異常系1件・境界値4件（テストケース定義書のTC7除く10件を全て実装、目標の10件以上を達成）。

## 3. テストコード全文

`atelier-godot/tests/unit/features/prototype/prototype_alchemy_resolver_test.gd` を参照。

冒頭抜粋:

```gdscript
extends GutTest
# TASK-0009: プロトタイプ調合ロジック PrototypeAlchemyResolver.resolve() のユニットテスト。
# 対象: features/prototype/logic/prototype_alchemy_resolver.gd（未実装。Redフェーズ用）

const PrototypeAlchemyResolverScript := preload("res://features/prototype/logic/prototype_alchemy_resolver.gd")

func test_基礎品質の平均値計算() -> void:
	var materials: Array = [
		{"quality": 3, "traits": []},
		{"quality": 1, "traits": []},
	]
	var result: Dictionary = PrototypeAlchemyResolverScript.resolve(materials)
	assert_eq(result["quality"], 2, "BとDの平均品質はスコア2であるべき")
	assert_eq(result["traits"], [], "特性タグなしのため発現特性は空であるべき")
	assert_true(result["success"], "素材が投入されているため調合は成立するべき")

# ... 以下 TC2〜TC11 相当のテストケースが続く（詳細は本体ファイル参照）
```

## 4. 実行結果（失敗の確認）

### 実行コマンド

```bash
Godot_v4.7-stable_win64_console.exe --headless --path . \
  -s res://addons/gut/gut_cmdln.gd \
  -gdir=res://tests/unit/features/prototype -gexit
```

### 実行結果ログ（抜粋）

```
SCRIPT ERROR: Parse Error: Preload file "res://features/prototype/logic/prototype_alchemy_resolver.gd" does not exist.
   at: GDScript::reload (res://tests/unit/features/prototype/prototype_alchemy_resolver_test.gd:9)
SCRIPT ERROR: Parse Error: Cannot infer the type of "PrototypeAlchemyResolverScript" constant because the value doesn't have a set type.
ERROR: Failed to load script "res://tests/unit/features/prototype/prototype_alchemy_resolver_test.gd" with error "Parse error".
[WARNING]: Ignoring script res://tests/unit/features/prototype/prototype_alchemy_resolver_test.gd because it does not extend GutTest

[ERROR]: Nothing was run.
On the one hand nothing failed, on the other hand nothing did anything.
```

### 失敗の確認

- `PrototypeAlchemyResolverScript` の`preload`対象ファイル（`features/prototype/logic/prototype_alchemy_resolver.gd`）が存在しないため、GDScriptパーサの段階でスクリプトロードに失敗する。
- 結果としてGUTはこのテストスクリプトをGutTest派生として認識できず「Nothing was run」となる。これは意図通りの失敗（実装未着手によりテストスイート自体が成立しない状態）である。
- Greenフェーズで`prototype_alchemy_resolver.gd`を実装しresolve()が定義されれば、preloadが解決し10件のテストが実行可能になる。

## 5. Greenフェーズで実装すべき内容

`atelier-godot/features/prototype/logic/prototype_alchemy_resolver.gd` に以下を実装する。

- `class_name` なしの`RefCounted`継承スクリプト、または`class_name PrototypeAlchemyResolver`を付与（`res://`パスでのpreload運用に合わせいずれか選択）
- `static func resolve(materials: Array) -> Dictionary`
  1. `materials`が空配列の場合、計算を行わず`{"quality": 0, "traits": [], "success": false}`相当を返す（TC6）
  2. 基礎品質 = `materials`の`quality`合計 / `materials.size()`（int除算で切り捨て、TC1, TC8, TC10）
  3. 特性集計: 全素材の`traits`配列を走査し、タグごとの出現回数をカウント
  4. 出現回数2以上のタグのみ発現特性として`traits`に含める（TC2, TC3, TC9, TC11）
  5. 最終品質 = 基礎品質 − 発現特性数（1個につき1減算、下限1でクランプ、TC4, TC5, TC11）
  6. `success: true`（空でない場合）
  7. REQ-112（同一系統内の複数特性同時発現のペナルティ加算）、REQ-115（系統排他制御）は実装せず、`# 簡略化: ...スコープ外` コメントで明記する

---

**次のフェーズ**: `/tsumiki:tdd-green` で最小実装を行う。
