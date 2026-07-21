# TASK-0010 設定作業実行

## 作業概要

- **タスクID**: TASK-0010
- **作業内容**: プロトタイプ手動検証（プレイテスト）の実施手順策定、および人間の検証対象者が確保できない制約下でのAIによる自己検証（擬似プレイテスト）の実施
- **実行日時**: 2026-07-21
- **実行者**: Claude Code（task0010-setupエージェント）

## 重要な前提

TASK-0010は本来「複数人（2〜3名以上）の**人間の**検証対象者によるプレイテストと観察記録」を完了条件とするタスクである。本セッションではAIエージェント単独で作業を進めているため、実際の人間による検証は実施できない。そのため本作業では、

1. 人間の検証対象者向けのプレイテスト実施手順・観察記録テンプレートを策定する
2. AIエージェントによる自己検証（擬似プレイテスト）でプロトタイプを実際に操作し、構造的な観察（品質重視/特性重視の選択が実際に異なる結果を生むか）を記録として残す
3. 人間による正式な検証が別途必要であることを明記する

の3点を実施した。詳細な位置づけの注意事項は `docs/design/atelier-alchemy-core/prototype-validation-report.md` の冒頭に明記している。

## 設計文書参照

- **参照文書**: `docs/tasks/atelier-alchemy-core/TASK-0010.md`、`docs/implements/atelier-alchemy-core/TASK-0009/*`（前提タスクの実装記録）
- **関連要件**: REQ-501, TC-501-H01

## 実行した作業

### 1. プレイテスト実施手順の策定

TASK-0010.mdの「実装詳細 1. プレイテスト実施手順の策定」を踏まえ、事前準備・タスク実施フロー・観察ポイント・記録項目を具体化した。`docs/design/atelier-alchemy-core/prototype-validation-report.md` の「1. プレイテスト実施手順（人間の検証対象者向け）」として記載。

### 2. 観察記録テンプレートの用意

検証対象者ごとに記入する観察記録テンプレートを作成した（同ファイル「2. 観察記録テンプレート」）。「検証対象者ID」は今後の人間による検証実施時に「検証者1」「検証者2」のように匿名IDへ差し替えて使用する想定。

### 3. Godotプロジェクトでのプロトタイプ動作確認（AI自己検証）

TASK-0009のGreenフェーズで使われた手法（`_scene_check.gd`による一時チェックスクリプト、ヘッドレスGodot実行）を参考に、以下の一時スクリプトを作成し実行した。

```bash
Godot_v4.7-stable_win64_console.exe --headless --path . -s res://_task0010_playtest_sim.gd
```

**確認内容**:

- `alchemy_prototype.tscn`を実際にシーンツリーへ`add_child`し、ボタン押下時と同じ内部処理（`_on_gather_button_pressed()` / `_on_add_to_slot_button_pressed()` / `_on_craft_button_pressed()`）を呼び出すことで、プロトタイプをResolver単体テストとは異なる「UI層を含めた実際の操作」として動作させた
- 3パターン（品質最優先／特性発現優先／拮抗）の素材選択を実行し、それぞれの完成品結果を記録

**実行結果**:

| パターン | 結果 |
|---------|------|
| A: 品質最優先 | 品質A / 発現特性なし |
| B: 特性発現優先 | 品質D / 発現特性: contribution_holy, reward_gold |
| C: 拮抗（中間） | 品質C / 発現特性: contribution_holy |

3パターンとも設計通りに動作し、最終実行ではエラー出力なし。品質重視と特性重視の選択が構造的に異なる結果（品質A⇄D、特性なし⇄2個）を生むことを確認した。詳細は `docs/design/atelier-alchemy-core/prototype-validation-report.md` の「3. AI自己検証（擬似プレイテスト）記録」を参照。

一時スクリプト（`atelier-godot/_task0010_playtest_sim.gd`）は確認完了後に削除済み。

### 4. 観察記録文書の作成

`docs/design/atelier-alchemy-core/prototype-validation-report.md` を新規作成し、上記1〜3の内容と、次フェーズへの申し送り事項（人間による正式なプレイテストが未実施であること、NO判定時の特性の相反ボーナス設計見直しの要否）を記載した。

## 作業結果

- [x] プレイテスト実施手順の策定完了
- [x] 観察記録テンプレートの用意完了
- [x] プロトタイプの実際の動作確認完了（AI自己検証、3パターン）
- [x] 観察記録文書（`docs/design/atelier-alchemy-core/prototype-validation-report.md`）の作成完了
- [ ] 人間の検証対象者（2〜3名以上）による正式なプレイテストは**未実施**（本タスクのAI単独実行という制約による。次のステップ・申し送り事項を参照）

## 遭遇した問題と解決方法

### 問題1: 一時実行スクリプトで`@onready`変数がnullになる

- **発生状況**: `SceneTree._init()`内で`alchemy_prototype.tscn`を`instantiate()`し`root.add_child()`した直後にボタン処理を呼び出したところ、`inventory_list`等の`@onready`変数がnullとなり`SCRIPT ERROR: Cannot call method 'clear' on a null value`が発生した
- **エラーメッセージ**: `Cannot call method 'clear' on a null value. at: AlchemyPrototype._refresh_list`
- **解決方法**: `_init()`ではなく`SceneTree._initialize()`から非同期処理を開始し、`add_child()`直後に`await process_frame`を挟むことで、ノードのツリー参入に伴う`@onready`初期化が完了してから後続処理を実行するよう修正した。修正後は3パターンとも正常に動作した。

## 次のステップ

- `/tsumiki:direct-verify` を実行し、本作業内容（手順・テンプレート・AI自己検証記録）の整合性を確認する
- 人間の検証対象者（2〜3名以上、可能であれば開発チーム外を含む）による正式なプレイテストを別途実施し、`docs/design/atelier-alchemy-core/prototype-validation-report.md` の観察記録テンプレートへ結果を追記する
- 正式な検証結果がNOの場合、特性の相反ボーナス設計の見直しを別タスクとして切り出す
