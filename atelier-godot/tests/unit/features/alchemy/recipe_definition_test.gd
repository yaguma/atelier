extends GutTest
# TASK-0012: RecipeDefinition（調合レシピ静的定義）のユニットテスト
# 対象: features/alchemy/data/recipe_definition.gd（未実装。Redフェーズ用）
# 参照: docs/implements/atelier-alchemy-core/TASK-0012/craft-data-model-testcases.md
#
# 【備考】: RecipeDefinitionはResource継承かつ副作用を持たないデータモデルのため、
#          before_each相当の状態初期化は不要。各テストはローカル変数のみで完結する。

const RecipeDefinitionScript := preload("res://features/alchemy/data/recipe_definition.gd")


# ============================================================
# 正常系
# ============================================================

func test_slot_countのデフォルト値がREQ_101に従い4である() -> void:
	# 【テスト目的】: slot_countを明示設定せず生成したときのデフォルト値を確認する
	# 【テスト内容】: RecipeDefinition.new()（引数・プロパティ設定なし）を生成する
	# 【期待される動作】: slot_count == 4が取得できる
	# 🔵 信頼性: TASK-0012.md 単体テスト要件テストケース1 / REQ-101 より

	# 【テストデータ準備】: 投入枠初期値を検証する最小生成ケースを用意する
	# 【初期条件設定】: プロパティ未設定でRecipeDefinitionを生成する
	var recipe := RecipeDefinitionScript.new()

	# 【実際の処理実行】: 生成直後のslot_countプロパティを読み取る
	# 【処理内容】: デフォルト値の初期化結果を確認する

	# 【結果検証】: slot_countがREQ-101のとおり4であることを確認する
	# 【期待値確認】: 工房強化による加算前の基本値は4で固定される
	assert_eq(recipe.slot_count, 4, "slot_countはデフォルト4であるべき") # 【確認内容】: REQ-101のデフォルト値契約


func test_base_contributionとbase_rewardが設定値をそのまま取得できる() -> void:
	# 【テスト目的】: 基礎貢献度・基礎報酬プロパティのset→getの同一性を確認する
	# 【テスト内容】: base_contribution=10.0, base_reward=20.0を設定して取得する
	# 【期待される動作】: 設定した値がそのまま読み出せる
	# 🟡 信頼性: TASK-0012.md 単体テスト要件テストケース2 / REQ-109, REQ-110 より（具体値はTBD）

	# 【テストデータ準備】: 値の妥当性ではなく保持動作を検証する代表値を用意する
	# 【初期条件設定】: RecipeDefinitionを生成する
	var recipe := RecipeDefinitionScript.new()

	# 【実際の処理実行】: base_contribution/base_rewardへ値を代入する
	# 【処理内容】: データモデルへの直接代入を実行する
	recipe.base_contribution = 10.0
	recipe.base_reward = 20.0

	# 【結果検証】: 代入値がそのまま取得できることを確認する
	# 【期待値確認】: データモデルは変換を行わず値をそのまま保持する
	assert_eq(recipe.base_contribution, 10.0, "base_contributionは設定値をそのまま保持するべき") # 【確認内容】: 基礎貢献度の保持動作
	assert_eq(recipe.base_reward, 20.0, "base_rewardは設定値をそのまま保持するべき") # 【確認内容】: 基礎報酬の保持動作


func test_idとdisplay_nameが設定値を保持する() -> void:
	# 【テスト目的】: 識別子・表示名プロパティのset→getの同一性を確認する
	# 【テスト内容】: id=&"recipe_healing_potion", display_name="回復薬"を設定して取得する
	# 【期待される動作】: 設定したStringName/Stringがそのまま取得できる
	# 🔵 信頼性: data-model.md「レシピ定義」/ requirements.md 2.1表（id, display_name） より

	# 【テストデータ準備】: レシピを一意識別するID（StringName）とUI表示名（String）の代表値を用意する
	# 【初期条件設定】: RecipeDefinitionを生成する
	var recipe := RecipeDefinitionScript.new()

	# 【実際の処理実行】: id/display_nameへ値を代入する
	# 【処理内容】: 日本語表示名を含めた代入を実行する
	recipe.id = &"recipe_healing_potion"
	recipe.display_name = "回復薬"

	# 【結果検証】: 代入値がそのまま取得できることを確認する
	# 【期待値確認】: StringNameとStringの型差異が保持動作に影響しないこと
	assert_eq(recipe.id, &"recipe_healing_potion", "idが指定値と一致するべき") # 【確認内容】: 識別子フィールドの保持
	assert_eq(recipe.display_name, "回復薬", "display_nameが指定値と一致するべき") # 【確認内容】: 表示名フィールドの保持


# ============================================================
# 境界値
# ============================================================

func test_base_contributionとbase_rewardのデフォルトが0_0である() -> void:
	# 【テスト目的】: レシピ基礎値の未設定時の下限（デフォルト0.0）を確認する
	# 【テスト内容】: RecipeDefinition.new()（基礎値未設定）を生成する
	# 【期待される動作】: base_contribution == 0.0 かつ base_reward == 0.0
	# 🔵 信頼性: data-model.md「レシピ定義」`base_contribution/base_reward = 0.0` / requirements.md 2.1表 より

	# 【テストデータ準備】: 基礎値未指定のレシピ雛形生成時を再現する
	# 【初期条件設定】: 基礎値を設定せずRecipeDefinitionを生成する
	var recipe := RecipeDefinitionScript.new()

	# 【実際の処理実行】: 生成直後のbase_contribution/base_rewardを読み取る
	# 【処理内容】: 未初期化状態でのデフォルト値を確認する

	# 【結果検証】: 両プロパティがfloatの0.0で初期化されていることを確認する
	# 【期待値確認】: N-2の明示設定と初期化契約が矛盾しないこと
	assert_eq(recipe.base_contribution, 0.0, "base_contributionはデフォルト0.0であるべき") # 【確認内容】: 基礎貢献度のデフォルト値
	assert_eq(recipe.base_reward, 0.0, "base_rewardはデフォルト0.0であるべき") # 【確認内容】: 基礎報酬のデフォルト値
