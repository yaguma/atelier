extends Node
# シード管理付き乱数生成Autoload。architecture.md「autoload/rng_service.gd」対応。
# REQ-006: 収穫時の特性乱数は「分散のみで期待値は変えない」ことを保証する基盤。

var _rng: RandomNumberGenerator = RandomNumberGenerator.new()


func _ready() -> void:
	# シード未指定時は起動ごとに非決定的な乱数となるよう、OSの時刻ベースで初期化する
	randomize_seed()


## シードを明示的に指定せず、OSの時刻ベースでシードを初期化する
func randomize_seed() -> void:
	_rng.randomize()


## シードを明示的に指定して乱数生成器を初期化する。テストの再現性確保に使用する。
func set_seed(seed_value: int) -> void:
	_rng.seed = seed_value


## 現在のシード値を取得する（デバッグ・テスト検証用）
func get_seed() -> int:
	return _rng.seed


## [min_inclusive, max_inclusive] の範囲で一様分布の整数を返す
func next_int(min_inclusive: int, max_inclusive: int) -> int:
	return _rng.randi_range(min_inclusive, max_inclusive)


## 配列から要素を1つ、一様分布でランダムに選択する（REQ-006の特性タグ抽選等に使用）
## candidatesが空の場合はnullを返し、不正な状態のまま処理を継続しない
func pick_one(candidates: Array) -> Variant:
	if candidates.is_empty():
		push_error("RngService.pick_one: candidatesが空です")
		return null
	var index: int = next_int(0, candidates.size() - 1)
	return candidates[index]
