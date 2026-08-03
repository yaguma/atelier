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
