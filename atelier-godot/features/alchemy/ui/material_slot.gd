## TASK-0020: AlchemyBench UI実装（調合台画面） - 投入枠1つの状態管理
##
## 【機能概要】: 調合台の投入枠1つ分の状態（配置済み素材の有無）を管理するUIコンポーネント。
## 【実装方針（Redフェーズ）】: 各メソッドは未実装スタブ（pass）。Greenフェーズで実装する。
## 　　AlchemyBenchから配置/解除操作を受け、品質表示・特性タグ表示は独立した関数として
## 　　分離する（TASK-0037での段階的開示の追記に備える。要件定義書「段階的開示との責務分離」）。
## 【アーキテクチャ制約（Warning#2）】: 本スクリプトはAlchemyBenchと同じくImperative Shell
## 　　（操作UI）側の薄い実装であり、この枠が「空か・埋まっているか」という状態の保持と
## 　　選択操作の受け皿以外の計算ロジックを一切持たない。
## 　　⚠️ 将来の注意: 品質値の加工表示（グレード変換・色分けの閾値計算等）や特性発現の
## 　　可否判定をこのファイルに書き足さないこと。それらはFunctional Core
## 　　（AlchemyResolver / TraitActivation）の責務であり、UI側に持たせるとWarning#2に回帰する。
## 【段階的開示（reveal_level）との責務分離】: 本タスク（TASK-0020）時点では特性情報を
## 　　常時表示するプレースホルダ実装である（reveal_levelによる表示制御は行わない）。
## 　　Gランクでの特性非表示・Eランク以降の解禁表示（REQ-121〜123）は、
## 　　GameState.current_rank.trait_reveal_levelを参照する表示制御としてTASK-0037で
## 　　本ファイルおよびalchemy_bench.gdに追記される予定であり、本タスクではその前提となる
## 　　「素材の配置状態を保持する」土台のみを実装する（docs/tasks/atelier-alchemy-core/TASK-0037.md
## 　　「1. reveal_levelのランクからUIへの結線」を参照）。
## 【テスト対応】: 本タスクのalchemy_bench_test.gdでは直接テストしないが、
## 　　AlchemyBench.place_material()の内部実装で利用される想定
## 🟡 信頼性レベル: alchemy-bench-requirements.md 実装対象ファイル一覧より
class_name MaterialSlot
extends Control

## 【配置済み素材】: この枠に配置されている素材。空の場合はnull 🟡
var material: MaterialInstance = null


## 【機能概要】: この枠が空かどうかを判定する
## 【実装方針（Greenフェーズ）】: material == nullを返すのみ。計算ロジックは持たない
## 🟡 信頼性レベル: AlchemyBench.place_material()の重複防止ロジックが利用する想定
func is_empty() -> bool:
	return material == null


## 【機能概要】: この枠に素材を配置する
## 【実装方針（Greenフェーズ）】: materialへ代入するのみ。表示更新（品質アイコン・特性タグ）は
## 　　TASK-0037（段階的開示）で独立した関数として追記する想定のため、本タスクでは行わない
## 🟡 信頼性レベル: alchemy-bench-requirements.md 実装対象ファイル一覧より
## @param p_material - 配置する素材個体
func place(p_material: MaterialInstance) -> void:
	material = p_material


## 【機能概要】: この枠を空にする
## 【実装方針（Greenフェーズ）】: materialをnullに戻すのみ
## 🟡 信頼性レベル: alchemy-bench-requirements.md 実装対象ファイル一覧より
func clear() -> void:
	material = null
