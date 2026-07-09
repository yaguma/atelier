# atelier-alchemy-core データモデル定義

**作成日**: 2026-07-09
**関連設計**: [architecture.md](architecture.md)

**【信頼性レベル凡例】**:
- 🔵 **青信号**: 要件定義書・設計文書を参考にした確実な型定義
- 🟡 **黄信号**: 要件定義書・設計文書から妥当な推測による型定義
- 🔴 **赤信号**: 要件定義書・設計文書にない推測による型定義

> Godotでは1スクリプトにつき1 `class_name` が原則のため、TypeScript版の `interfaces.ts` のような単一ファイル集約はしません。
> 以下は `res://features/{feature}/data/*.gd` に配置するリソースクラスの定義一覧です（実装時は1クラス1ファイルに分割してください）。

---

## 特性タグ（TraitDefinition）🔵

**信頼性**: 🔵 *要件定義REQ-104, REQ-107, REQ-108より*

```gdscript
# res://features/alchemy/data/trait_definition.gd
class_name TraitDefinition
extends Resource

enum Category {
	CONTRIBUTION,  # 貢献度系（例: 聖・浄・癒） 🔵 REQ-107
	REWARD,        # 報酬系（例: 金・華・稀） 🔵 REQ-107
	SUPPORT,       # 補助系（例: 触媒＝品質+1段） 🔵 REQ-108
}

@export var id: StringName          # 🔵 一意識別子
@export var display_name: String    # 🔵 UI表示名
@export var category: Category      # 🔵 REQ-107, REQ-108
@export var min_rank_to_reveal: StringName
	# 🔵 この特性が解禁されるランク（例: "E", "D"）。REQ-121〜124の段階的開示・REQ-124の入手制限より確定
	# 確定(2026-07-09): 未解禁の特性を持つ種・素材は庭/ショップの選択肢に一切表示しない（発現しないだけでなく入手自体を防ぐ）
@export var bonus_multiplier: float = 1.0
	# 🟡 発現時のボーナス倍率。REQ-109/110の計算式より。具体値はTBD
```

## 素材インスタンス（MaterialInstance）🔵

**信頼性**: 🔵 *要件定義REQ-103, REQ-104より*

```gdscript
# res://features/alchemy/data/material_instance.gd
class_name MaterialInstance
extends RefCounted
# Resourceではなくインスタンスごとに生成される実行時データのためRefCountedとする 🟡

enum Quality { D = 1, C = 2, B = 3, A = 4, S = 5 }  # 🔵 REQ-103「D〜S、スコア1〜5相当」

var id: String                      # 🔵 個体識別用（在庫管理）
var seed_id: StringName              # 🟡 由来する種のID（庭からの収穫の場合）
var quality: Quality                 # 🔵 REQ-103
var traits: Array[StringName] = []   # 🔵 REQ-104「特性タグ0〜2個」。TraitDefinition.idの配列

func _init(p_id: String = "", p_quality: Quality = Quality.D, p_traits: Array[StringName] = []) -> void:
	id = p_id
	quality = p_quality
	traits = p_traits
```

## 種の定義（SeedDefinition）🔵

**信頼性**: 🔵 *要件定義REQ-001〜REQ-008「庭（仕込み層）の仕組み」より*

```gdscript
# res://features/garden/data/seed_definition.gd
class_name SeedDefinition
extends Resource

@export var id: StringName                # 🔵
@export var display_name: String          # 🔵
@export var maturity_turns: int = 3       # 🔵 REQ-003「素材ごとに固有の成熟ターン数」。具体値はTBD
@export var wither_grace_turns: int = 1   # 🔵 成熟後、枯死するまでの猶予ターン数。確定(2026-07-09/EDGE-103): 放置ターン数がこの値にちょうど達した時点で枯死（境界値は猶予側ではなく枯死側に倒れる）
@export var possible_traits: Array[StringName] = []
	# 🔵 REQ-006「収穫時に特性が1つ乱数で付与」。分散のみで期待値は変えない候補一覧
@export var base_quality: MaterialInstance.Quality = MaterialInstance.Quality.C
	# 🟡 放置ターン数に応じて品質が上昇する際の基準値。REQ-004より妥当な推測
```

## レシピ定義（RecipeDefinition）🔵

**信頼性**: 🔵 *要件定義REQ-101, REQ-102より*

```gdscript
# res://features/alchemy/data/recipe_definition.gd
class_name RecipeDefinition
extends Resource

@export var id: StringName                # 🔵
@export var display_name: String          # 🔵
@export var slot_count: int = 4           # 🔵 REQ-101「投入枠4枠」
	# 工房強化により実行時に +1 されうる（REQ-102）。この値は基本値でありGameState側で加算する 🟡
@export var base_contribution: float = 0.0  # 🟡 REQ-109の基礎貢献度。具体値はTBD
@export var base_reward: float = 0.0        # 🟡 REQ-110の基礎報酬。具体値はTBD
```

## 調合結果（CraftResult）🔵

**信頼性**: 🔵 **新設（2026-07-09、ゲームデザイン・Godotアーキテクト両レビューへの対応）** *REQ-105, REQ-109〜REQ-112, REQ-115より*

`AlchemyResolver.craft()`（純粋関数）の戻り値。品質ペナルティ適用前後の値と、系統排他制御（REQ-115）の結果を明示的に保持する。

```gdscript
# res://features/alchemy/data/craft_result.gd
class_name CraftResult
extends RefCounted

var base_quality: MaterialInstance.Quality      # 🔵 REQ-105。ペナルティ適用前
var final_quality: MaterialInstance.Quality     # 🔵 REQ-111。品質ペナルティ・触媒補正適用後（下限はD=1）
var activated_traits: Array[TraitDefinition] = []
	# 🔵 REQ-106, REQ-112。同一系統内の複数同時発現を含む、最終的に発現した特性一覧
var rejected_category: TraitDefinition.Category
	# 🔵 REQ-115。貢献度系/報酬系が同時に条件を満たした場合に不発とされた側（不発なしの場合は無効値）
var contribution: float = 0.0   # 🔵 REQ-109
var reward: float = 0.0         # 🔵 REQ-110
```

## ランク定義（RankDefinition）🟡

**信頼性**: 🟡 *要件定義REQ-401〜REQ-403より。正式なランク区分・数値はTBD*

```gdscript
# res://features/guild/data/rank_definition.gd
class_name RankDefinition
extends Resource

@export var id: StringName            # 🟡 例: "G", "F", "E"... REQ-403より。正式名称はTBD
@export var max_hp: int = 100         # 🟡 REQ-401。具体値はTBD
@export var turn_limit: int = 10      # 🟡 REQ-205「制限ターン」。具体値はTBD
@export var trait_reveal_level: int = 0
	# 🔵 REQ-121〜123の段階的開示に使用（0=特性なし, 1=貢献度/報酬解禁, 2=種類追加）
```

## 日替わり指定調合物（DailyRequest）🔵

**信頼性**: 🔵 *要件定義REQ-203, REQ-204より*

```gdscript
# res://features/guild/data/daily_request.gd
class_name DailyRequest
extends RefCounted

var required_recipe_id: StringName       # 🔵 REQ-203
var preferred_category: TraitDefinition.Category  # 🟡 貢献度系/報酬系どちら向きを指定するか。REQ-204より妥当な推測
var bonus_multiplier: float = 1.5        # 🟡 REQ-204の指定合致ボーナス。具体値はTBD

func _init(p_recipe_id: StringName = &"") -> void:
	required_recipe_id = p_recipe_id
```

## 工房強化定義（UpgradeDefinition）🔵

**信頼性**: 🔵 *要件定義REQ-301〜REQ-306より*

```gdscript
# res://features/workshop/data/upgrade_definition.gd
class_name UpgradeDefinition
extends Resource

enum Kind {
	PERMANENT,   # 恒久投資: ランク間強化画面でのみ購入可 🔵 REQ-301, REQ-304
	CONSUMABLE,  # 消耗投資: ターン中いつでも購入可 🔵 REQ-302, REQ-305
}

@export var id: StringName            # 🔵 例: "slot_plus_one", "garden_expand", "recipe_unlock", "catalyst", "seed_pick"
@export var kind: Kind                # 🔵
@export var price: int = 0            # 🟡 REQ-306の価格序列より。具体値はTBD
@export var display_name: String      # 🔵
```

## GameState Autoload の状態構造（概略） 🟡

**信頼性**: 🟡 *上記の各データモデルを保持する実行時状態として妥当な推測*

```gdscript
# res://autoload/game_state.gd
extends Node

signal garden_updated
signal inventory_updated
signal item_crafted(result: CraftResult)
signal guild_delivered(contribution: float, reward: float)
signal rank_hp_depleted
signal rank_failed
signal upgrades_updated

var current_rank: RankDefinition
var rank_hp: int
var remaining_turns: int
var gold: int = 0

var garden_slots: Array[SeedDefinition] = []
	# 🔵 REQ-002のスロット制限。修正(2026-07-09、Godotアーキテクトレビュー Warning#4対応): 無型Arrayは型安全性の抜け穴になるため型付けした
	# （Godot 4のtyped Arrayはオブジェクト要素のnullを許容するため「空きスロット」はnull要素として表現できる）
var inventory: Array[MaterialInstance] = []
var recipe_slot_count: int = 4   # 🔵 REQ-101。恒久投資で+1（REQ-102）
var permanent_upgrades: Array[StringName] = []  # 🔵 REQ-301
var today_request: DailyRequest  # 🔵 REQ-203

func craft(materials: Array[MaterialInstance]) -> CraftResult:
	# 🔵 新設（2026-07-09、Godotアーキテクトレビュー Warning#2対応）
	# GameState（Imperative Shell）がcurrent_rank.trait_reveal_levelとtoday_requestを引数として
	# AlchemyResolver.craft()（Functional Core, static func）に渡す。Autoload参照を純粋関数側に漏らさない。
	# 戻り値のCraftResultを用いてinventory/rank_hp/goldを更新し、item_craftedをemitする。
	return AlchemyResolver.craft(materials, current_rank.trait_reveal_level, today_request)

# セーブ/ロードは本設計のスコープ外（design-interview.md Q3） 🔴
```

## 信頼性レベルサマリー

- 🔵 青信号: 26件 (70%)
- 🟡 黄信号: 10件 (27%)
- 🔴 赤信号: 1件（セーブ非対応の明記、3%）

**品質評価**: 高品質。2026-07-09の追補ヒアリングで枯死境界・上位特性の入手制限が確定。残る🟡は具体的な数値（価格・ターン数等）のTBDと、Godot翻訳上の技術的判断（RefCounted選択等）のみ。
