extends GutTest
# TASK-0011: TraitDefinition（特性タグ定義）のユニットテスト
# 対象: features/alchemy/data/trait_definition.gd（未実装。Redフェーズ用）
# 参照: docs/implements/trait-definition-material-instance/TASK-0011/trait-definition-material-instance-testcases.md
#
# 【備考】: TraitDefinitionはResource継承のデータモデルであり副作用を持たないため、
#          before_each相当の状態初期化は不要。各テストはローカル変数のみで完結する。

const TraitDefinitionScript := preload("res://features/alchemy/data/trait_definition.gd")


# ============================================================
# 正常系
# ============================================================

func test_categoryの3分類が区別できる() -> void:
	# 【テスト目的】: TraitDefinition.category が CONTRIBUTION/REWARD/SUPPORT の3系統を区別保持できることを確認する
	# 【テスト内容】: 3種の category を設定した TraitDefinition をそれぞれ生成し、各値と相互不一致を検証する
	# 【期待される動作】: 設定値がそのまま保持され、3値が互いに異なる
	# 🔵 信頼性: REQ-107/REQ-108、data-model.md、テストケース定義書 N-1 より

	# 【テストデータ準備】: 貢献度系・報酬系・補助系の3系統を代表させるため各Categoryを1つずつ設定する
	# 【初期条件設定】: Resource継承のTraitDefinitionをnew()で生成しcategoryのみ差し替える
	var contribution := TraitDefinitionScript.new()
	contribution.category = TraitDefinitionScript.Category.CONTRIBUTION

	var reward := TraitDefinitionScript.new()
	reward.category = TraitDefinitionScript.Category.REWARD

	var support := TraitDefinitionScript.new()
	support.category = TraitDefinitionScript.Category.SUPPORT

	# 【実際の処理実行】: category プロパティへアクセスする（データ保持の検証のみ、ロジック呼び出しなし）
	# 【処理内容】: 設定済みのcategory値を読み取る

	# 【結果検証】: 各categoryが設定値と一致し、かつ3値が相互に不一致であることを確認する
	# 【期待値確認】: CONTRIBUTION/REWARD/SUPPORTが別々のenum値であること
	assert_eq(contribution.category, TraitDefinitionScript.Category.CONTRIBUTION, "貢献度系が保持されるべき") # 【確認内容】: CONTRIBUTIONの保持
	assert_eq(reward.category, TraitDefinitionScript.Category.REWARD, "報酬系が保持されるべき") # 【確認内容】: REWARDの保持
	assert_eq(support.category, TraitDefinitionScript.Category.SUPPORT, "補助系が保持されるべき") # 【確認内容】: SUPPORTの保持
	assert_ne(contribution.category, reward.category, "貢献度系と報酬系は別値であるべき") # 【確認内容】: 系統の相互区別(1)
	assert_ne(reward.category, support.category, "報酬系と補助系は別値であるべき") # 【確認内容】: 系統の相互区別(2)
	assert_ne(contribution.category, support.category, "貢献度系と補助系は別値であるべき") # 【確認内容】: 系統の相互区別(3)


func test_bonus_multiplierのデフォルト値は1_0である() -> void:
	# 【テスト目的】: bonus_multiplierの宣言時デフォルト値(float=1.0)が正しく適用されることを確認する
	# 【テスト内容】: id/display_name/min_rank_to_revealのみ設定しbonus_multiplierを触らずに生成する
	# 【期待される動作】: bonus_multiplierが1.0のままになる
	# 🔵 信頼性: data-model.mdの型定義、テストケース定義書 N-2 より

	# 【テストデータ準備】: 「倍率を上書きしない通常の特性」を代表するケースを用意する
	# 【初期条件設定】: bonus_multiplier以外のプロパティのみ設定する
	var trait_def := TraitDefinitionScript.new()
	trait_def.id = &"seiketsu"
	trait_def.display_name = "聖潔"
	trait_def.min_rank_to_reveal = &"E"

	# 【実際の処理実行】: bonus_multiplierプロパティを読み取る
	# 【処理内容】: 未設定時の既定値を確認する

	# 【結果検証】: bonus_multiplierが1.0と完全一致することを確認する
	# 【期待値確認】: data-model.mdで@export var bonus_multiplier: float = 1.0と定義済み
	assert_eq(trait_def.bonus_multiplier, 1.0, "bonus_multiplierを設定しない場合デフォルト1.0であるべき") # 【確認内容】: デフォルト値の適用


func test_全プロパティが指定値を保持する() -> void:
	# 【テスト目的】: @exportされた各プロパティが代入した値をそのまま保持することを確認する
	# 【テスト内容】: id/display_name/category/min_rank_to_revealを設定し、値の一致を検証する
	# 【期待される動作】: 各プロパティが設定値と一致し、型が崩れない
	# 🟡 信頼性: data-model.mdの型定義に基づく妥当な推測、テストケース定義書 N-3 より

	# 【テストデータ準備】: .tresマスターデータとして定義される特性1件を代表する現実的な値を用意する
	# 【初期条件設定】: 4プロパティすべてに具体値を設定する
	var trait_def := TraitDefinitionScript.new()
	trait_def.id = &"seiketsu"
	trait_def.display_name = "聖潔"
	trait_def.category = TraitDefinitionScript.Category.CONTRIBUTION
	trait_def.min_rank_to_reveal = &"E"

	# 【実際の処理実行】: 設定済みの各プロパティを読み取る
	# 【処理内容】: マスターデータ編集後の値保持を確認する

	# 【結果検証】: 全プロパティが設定値と一致することを確認する
	# 【期待値確認】: マスターデータはEditor/.tresからの編集値を欠落なく保持する必要がある
	assert_eq(trait_def.id, &"seiketsu", "idが保持されるべき") # 【確認内容】: idのStringName保持
	assert_eq(trait_def.display_name, "聖潔", "display_nameが保持されるべき") # 【確認内容】: display_nameのString保持
	assert_eq(trait_def.category, TraitDefinitionScript.Category.CONTRIBUTION, "categoryが保持されるべき") # 【確認内容】: categoryのenum保持
	assert_eq(trait_def.min_rank_to_reveal, &"E", "min_rank_to_revealが保持されるべき") # 【確認内容】: min_rank_to_revealのStringName保持
