## TASK-0011: 特性タグの静的定義（マスターデータ）
##
## 【機能概要】: 特性タグの静的定義データモデル。貢献度系/報酬系/補助系の3分類、
## 　　　　　　 段階的開示の解禁ランク情報を保持する
## 【実装方針】: Resource継承のマスターデータとして全プロパティを@exportで公開し、
## 　　　　　　 Godot Editor / .tresファイルから編集可能にする。副作用・ロジックは持たない
## 【テスト対応】: trait_definition_test.gd の N-1, N-2, N-3 を通すための実装
## 🔵 信頼性レベル: data-model.md・requirements.md（TASK-0011）の型定義に基づく
class_name TraitDefinition
extends Resource

## 【enum定義】: 特性タグの3分類（貢献度系/報酬系/補助系）
## 　REQ-107（貢献度系/報酬系の分類）、REQ-108（補助系の分離）に対応 🔵
enum Category { CONTRIBUTION, REWARD, SUPPORT }

## 【一意識別子】: 特性タグを一意に識別するID 🔵
@export var id: StringName

## 【UI表示名】: プレイヤー向けに表示する特性名 🔵
@export var display_name: String

## 【分類】: CONTRIBUTION/REWARD/SUPPORT のいずれか。系統排他制御(REQ-115)の判定基盤 🔵
@export var category: Category

## 【解禁ランクID】: 段階的開示（REQ-121〜124）で参照する解禁ランク（例: "E", "D"） 🔵
@export var min_rank_to_reveal: StringName

## 【ボーナス倍率】: デフォルト1.0（倍率を上書きしない中立値） 🔵
@export var bonus_multiplier: float = 1.0
