extends GutTest
# RngService (autoload/rng_service.gd) のユニットテスト。
# TASK-0004: シード管理付き乱数生成Autoloadの検証。

const RngServiceScript := preload("res://autoload/rng_service.gd")


func test_同一シードなら乱数列が再現される() -> void:
	var a := RngServiceScript.new()
	var b := RngServiceScript.new()

	a.set_seed(12345)
	b.set_seed(12345)

	var sequence_a: Array = []
	var sequence_b: Array = []
	for i in range(5):
		sequence_a.append(a.next_int(1, 100))
	for i in range(5):
		sequence_b.append(b.next_int(1, 100))

	assert_eq(sequence_a, sequence_b, "同一シードなら5回分の乱数列が完全一致するべき")

	a.free()
	b.free()


func test_シード未指定時は非決定的なシード値になる() -> void:
	var a := RngServiceScript.new()
	var b := RngServiceScript.new()

	a.randomize_seed()
	b.randomize_seed()

	assert_ne(a.get_seed(), b.get_seed(), "シード未指定の場合、2つのインスタンスのシード値は一致しないはず")

	a.free()
	b.free()


func test_pick_oneは一様分布で候補内の値のみ返す() -> void:
	var rng := RngServiceScript.new()
	rng.set_seed(999)

	var candidates: Array = ["A", "B", "C"]
	var counts := {"A": 0, "B": 0, "C": 0}
	var trials := 1000

	for i in range(trials):
		var picked: Variant = rng.pick_one(candidates)
		assert_true(candidates.has(picked), "pick_oneは候補配列内の値のみ返すべき")
		counts[picked] += 1

	var expected: float = trials / 3.0
	for key in counts.keys():
		var ratio: float = counts[key] / expected
		assert_between(ratio, 0.7, 1.3, "候補 '%s' の出現比率が理論値から大きく外れている: %s" % [key, counts[key]])

	rng.free()


func test_pick_oneは空配列で不正な値を返さない() -> void:
	var rng := RngServiceScript.new()

	var result: Variant = rng.pick_one([])
	assert_push_error("candidatesが空です", "空配列に対してpush_errorが発生するべき")
	assert_null(result, "空配列に対するpick_oneはnullを返し、不正な状態のまま処理を継続しないべき")

	rng.free()


func test_next_intは範囲が1点のみでも例外なく動作する() -> void:
	var rng := RngServiceScript.new()
	rng.set_seed(1)

	for i in range(10):
		assert_eq(rng.next_int(5, 5), 5, "min==maxの場合は常に同じ値が返るべき")

	rng.free()
