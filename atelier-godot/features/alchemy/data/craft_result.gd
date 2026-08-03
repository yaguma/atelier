## TASK-0012: 調合結果の実行時値オブジェクト
##
## 【機能概要】: 調合1回分の結果を保持する実行時データモデル。品質ペナルティ適用前後の品質、
## 　　　　　　 発現した特性、系統排他制御で不発になった分類、最終貢献度・報酬を保持する
## 【実装方針】: RefCounted継承で副作用を持たない純粋データとして実装する。
## 　　　　　　 base_quality/final_qualityを分離保持することで「なぜこの結果か」を説明可能にする（REQ-105, REQ-111）。
## 　　　　　　 activated_traitsの個数制約はデータモデル層では強制せず、拒否責務はロジック層（TASK-0015）に委譲する。
## 　　　　　　 rejected_categoryは型定義のみとし、「不発なし」を表す無効値表現はTASK-0015で確定する
## 【テスト対応】: craft_result_test.gd の N-4, N-5, E-1, B-1, B-2, B-4 を通すための実装
## 🔵 信頼性レベル: data-model.md・requirements.md（TASK-0012）の型定義に基づく
class_name CraftResult
extends RefCounted

## 【基礎品質】: 品質ペナルティ適用前の品質（REQ-105）。
## 　data-model.mdに意味のあるデフォルト値の定義がないため初期値を持たない
## 　（AlchemyResolver.craft()が生成時に必ず設定する契約。REQ-109/110のcontribution/reward=0.0とは異なり中立値が存在しない） 🔵
var base_quality: MaterialInstance.Quality

## 【最終品質】: 品質ペナルティ・触媒補正適用後の品質。下限D=1のクランプはロジック層の責務（REQ-111）。
## 　base_quality同様、意味のあるデフォルト値が存在しないため初期値を持たない 🔵
var final_quality: MaterialInstance.Quality

## 【発現特性配列】: 同一系統内の複数同時発現に対応する（REQ-112）。個数制約は強制しない 🔵
var activated_traits: Array[TraitDefinition] = []

## 【不発分類】: 系統排他制御で不発となった分類（REQ-115）。型定義のみでTASK-0015で無効値表現を確定 🟡
var rejected_category: TraitDefinition.Category

## 【最終貢献度】: 基礎貢献度に各種補正を適用した最終値（REQ-109）。具体値はTBD 🟡
var contribution: float = 0.0

## 【最終報酬】: 基礎報酬に各種補正を適用した最終値（REQ-110）。具体値はTBD 🟡
var reward: float = 0.0
