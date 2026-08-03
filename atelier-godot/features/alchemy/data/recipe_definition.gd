## TASK-0012: 調合レシピの静的定義（マスターデータ）
##
## 【機能概要】: 調合レシピの静的定義データモデル。投入枠数・基礎貢献度・基礎報酬を保持する
## 【実装方針】: Resource継承のマスターデータとして全プロパティを@exportで公開し、
## 　　　　　　 Godot Editor / .tresファイルから編集可能にする。副作用・ロジックは持たない。
## 　　　　　　 slot_countの初期値4はREQ-101に対応し、工房強化による加算はGameState側の責務とする
## 【テスト対応】: recipe_definition_test.gd の N-1, N-2, N-3, B-3 を通すための実装
## 🔵 信頼性レベル: data-model.md・requirements.md（TASK-0012）の型定義に基づく
class_name RecipeDefinition
extends Resource

## 【一意識別子】: レシピを一意に識別するID 🔵
@export var id: StringName

## 【UI表示名】: プレイヤー向けに表示するレシピ名 🔵
@export var display_name: String

## 【投入枠数】: 初期値4（REQ-101）。工房強化による+1・最大5枠はGameState側の責務 🔵
@export var slot_count: int = 4

## 【基礎貢献度】: 品質ペナルティ・触媒補正適用前の基礎値（REQ-109）。具体値はTBD 🟡
@export var base_contribution: float = 0.0

## 【基礎報酬】: 品質ペナルティ・触媒補正適用前の基礎値（REQ-110）。具体値はTBD 🟡
@export var base_reward: float = 0.0
