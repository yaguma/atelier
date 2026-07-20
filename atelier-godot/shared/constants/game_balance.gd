# res://shared/constants/game_balance.gd
# ゲームバランスパラメータの一元管理(TypeScript版 GAME_CONFIG 相当)。
# 値は要件定義書「未確定数値一覧」に基づきTBD。balance-tuning-cycleスキルで確定させる。
class_name GameBalance
extends RefCounted

# --- 調合(investment slots / recipe) REQ-101, REQ-102 ---
const RECIPE_DEFAULT_SLOT_COUNT: int = 4   # 🔵 REQ-101で確定済み
const RECIPE_MAX_SLOT_COUNT: int = 5       # 🔵 REQ-102で確定済み(工房強化で+1)

# --- 貢献度・報酬の基礎値/係数 REQ-109, REQ-110(TBD) ---
const BASE_CONTRIBUTION: float = 0.0       # 🟡 TBD、balance-tuning-cycleで確定
const BASE_REWARD: float = 0.0             # 🟡 TBD、balance-tuning-cycleで確定
const QUALITY_MULTIPLIER_TABLE: Dictionary = {
	# MaterialInstance.Quality (D=1..S=5) -> 品質倍率。TBD
	1: 1.0, 2: 1.0, 3: 1.0, 4: 1.0, 5: 1.0,  # 🟡 TBD、balance-tuning-cycleで確定
}

# --- ギルド納品・ランク制限 REQ-205, REQ-206(TBD) ---
const RANK_TURN_LIMIT_DEFAULT: int = 10    # 🟡 TBD、balance-tuning-cycleで確定
const DEMOTION_PENALTY_GOLD_RATIO: float = 0.0  # 🟡 TBD、降格ペナルティの具体内容未確定

# --- 段階的開示 REQ-123(TBD) ---
const RANK_D_ADDITIONAL_TRAIT_IDS: Array[StringName] = []  # 🟡 TBD、Dランクで追加解禁される特性種類

# --- 工房強化 価格序列 REQ-306(TBD) ---
# 序列: 投入枠+1 ≫ 庭拡張 ≒ レシピ解禁 ＞ 触媒 ＞ 種の指名買い(REQ-306で確定済み)
const UPGRADE_PRICE_SLOT_PLUS_ONE: int = 0     # 🟡 TBD(序列上、最高額)
const UPGRADE_PRICE_GARDEN_EXPAND: int = 0     # 🟡 TBD
const UPGRADE_PRICE_RECIPE_UNLOCK: int = 0     # 🟡 TBD(庭拡張と概ね同額)
const UPGRADE_PRICE_CATALYST: int = 0          # 🟡 TBD
const UPGRADE_PRICE_SEED_PICK: int = 0         # 🟡 TBD(序列上、最低額)

# --- ランク区分 REQ-403(TBD) ---
const RANK_ORDER: Array[StringName] = [&"G", &"F", &"E", &"D", &"C", &"B", &"A", &"S"]
	# 🟡 TBD、コンセプト文書4章の体験カーブ表からの推測。正式名称・数は未確定
