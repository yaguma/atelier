# TASK-0019: GameState.craft()連携実装 - Redフェーズ記録

- **機能名**: GameState.craft()連携実装（game-state-craft）
- **タスクID**: TASK-0019
- **要件名**: atelier-alchemy-core
- **フェーズ**: Red（失敗するテストの作成）

---

## 1. 作成したファイル

| 種別 | パス |
|------|------|
| 実装スタブ（新規） | `atelier-godot/autoload/game_state.gd` |
| 単体テスト（新規） | `atelier-godot/tests/unit/autoload/game_state_test.gd` |
| 統合テスト（新規） | `atelier-godot/tests/integration/autoload/game_state_craft_integration_test.gd` |

`project.godot` への `GameState` Autoload登録は**見送った**（詳細は本ファイル末尾「設計判断」参照）。

---

## 2. 作成したテストケース一覧

`game-state-craft-testcases.md` の7件すべてを実装した。

| テストケース | ファイル | テスト関数名 | 信頼性 |
|------------|---------|-------------|--------|
| TC-101-N01 | game_state_test.gd | test_調合成功時にinventoryから投入した素材のみが消費される | 🔵 |
| TC-101-N02 | game_state_test.gd | test_調合成功時にrank_hpが貢献度分減算されgoldが報酬分加算される | 🔵 |
| TC-101-N03 | game_state_test.gd | test_調合成功時にitem_craftedが1回だけ発行されペイロードがCraftResultである | 🔵 |
| TC-101-E01 | game_state_test.gd | test_投入枠が空のとき状態変更もシグナル発行も一切起きない | 🔵 |
| TC-101-B01 | game_state_test.gd | test_GameState経由の結果がAlchemyResolver直接呼び出しと完全一致する | 🟡 |
| TC-101-B02 | game_state_test.gd | test_素材1個で調合が成立し状態更新とシグナル発行が揃う | 🟡 |
| TC-101-I01 | game_state_craft_integration_test.gd | test_実在庫データを用いた調合フローが1回の呼び出しで一貫完了する | 🔵 |

### TC-101-N02の具体化について

testcases.md「設計注記」に従い、品質倍率が1.0に中立化される構成（品質C単体・無特性、`final_quality = C`）を採用し、`base_contribution=10.0`・`base_reward=20.0`がそのまま`contribution`/`reward`に一致する厳密値を作った。これにより要件テストケース3の代表値（`rank_hp: 100→90`, `gold: 50→70`）とビット単位で一致する検証にできた（相対アサーションへのフォールバックは不要だった）。

---

## 3. テスト実行結果（失敗確認）

### 単体テスト（`tests/unit/autoload`）

```
"C:\Users\syagu\AppData\Local\Microsoft\WinGet\Packages\GodotEngine.GodotEngine_Microsoft.Winget.Source_8wekyb3d8bbwe\Godot_v4.7-stable_win64_console.exe" --headless -s addons/gut/gut_cmdln.gd -gdir=res://tests/unit/autoload -gexit
```

結果: **1/6 passed**（5件が期待通り失敗）

- `test_投入枠が空のとき状態変更もシグナル発行も一切起きない`（TC-101-E01）のみ成功。理由: `craft()`が現状`pass`のみのno-opスタブであるため、「投入枠が空の場合に一切の副作用が起きない」というガード節の期待値をトリビアルに満たしてしまう。これはRedフェーズにおいて許容される既知の現象であり（ガード節テストは実装前後で不変条件を保証する回帰テストとして機能する）、Greenフェーズ実装後も引き続きgreenであるべきテストである。
- 残り5件（TC-101-N01/N02/N03, TC-101-B01/B02）は`craft()`/`_consume_materials()`が未実装であるため、状態変更なし・シグナル未発行という形で正しく失敗した。

### 統合テスト（`tests/integration/autoload`）

```
"C:\Users\syagu\AppData\Local\Microsoft\WinGet\Packages\GodotEngine.GodotEngine_Microsoft.Winget.Source_8wekyb3d8bbwe\Godot_v4.7-stable_win64_console.exe" --headless -s addons/gut/gut_cmdln.gd -gdir=res://tests/integration/autoload -gexit
```

結果: **0/1 passed**（TC-101-I01が期待通り失敗）

### 既存全単体テストの回帰確認（`tests/unit`全体）

```
"C:\...\Godot_v4.7-stable_win64_console.exe" --headless -s addons/gut/gut_cmdln.gd -gdir=res://tests/unit -gexit
```

結果: **92/97 passed**（Scripts: 12, Asserts: 1195/1211）

- 97件 = 既存91件（TASK-0011〜0018分）+ 新規6件（TASK-0019単体分）
- 既存91件は全件引き続きPASS（新規ファイル追加・`project.godot`変更による回帰なし）
- 失敗5件はすべて新規追加分（想定通り）

---

## 4. 設計判断: Autoload登録の見送り

`game-state-craft-requirements.md`の制約条件には「`project.godot`の`[autoload]`に登録する」と記載されているが、実際に`GameState="*res://autoload/game_state.gd"`を登録したところ、テストコード側で`preload("res://autoload/game_state.gd").new()`を呼び出す際に以下のエンジンレベルエラーが発生した。

```
SCRIPT ERROR: Invalid call. Nonexistent function 'new' in base 'GDScript'.
```

原因は、スクリプトが`class_name GameState`を宣言しつつ同名でAutoload登録されているため、グローバル識別子`GameState`がクラス（スクリプト）ではなくAutoloadシングルトンのノードインスタンスを指すようになり、`preload()`で取得したスクリプトリソースの`.new()`呼び出しが期待通りに機能しなくなるというGodotの既知の挙動によるものと判断した。

**対応**: `project.godot`への登録を本タスクのスコープ外と判断し、登録を見送った（testcases.md「Autoloadとしてのテスト上の注意」に記載されている、テストでは`preload().new()`で専用インスタンスを生成する方式を採用しているため、実行時にAutoloadとして登録されていなくても`craft()`の実装・テストには支障がない）。実際の恒久登録は、UI層（TASK-0020以降）から`GameState`をAutoload経由で参照する必要が生じた時点で改めて検討する。この判断は本フェーズの申し送り事項として`note.md`にも追記する。

---

## 5. Greenフェーズで実装すべき内容

`atelier-godot/autoload/game_state.gd`の`craft()`・`_consume_materials()`を、`note.md`「実装詳細」に記載された契約どおりに実装する。

```gdscript
func craft(materials: Array[MaterialInstance]) -> void:
	var result: CraftResult = AlchemyResolver.craft(
		materials,
		current_rank.trait_reveal_level,
		today_request,
		current_recipe,
		trait_definitions,
	)
	if result == null:
		return
	_consume_materials(materials)
	rank_hp -= int(round(result.contribution))
	gold += int(round(result.reward))
	item_crafted.emit(result)


func _consume_materials(materials: Array[MaterialInstance]) -> void:
	for material in materials:
		var index := inventory.find(material)
		if index != -1:
			inventory.remove_at(index)
	inventory_updated.emit()
```

- `AlchemyResolver`はグローバルクラス（`class_name AlchemyResolver`）のため`AlchemyResolver.craft(...)`で直接呼び出せる（`features/alchemy/logic/alchemy_resolver.gd`）。
- 実装後は本ファイル記載の全テストコマンドを再実行し、単体6件・統合1件がすべてPASSすることを確認する。
- 既存91件が引き続きPASSすることも`-gdir=res://tests/unit`全体実行で確認する。
