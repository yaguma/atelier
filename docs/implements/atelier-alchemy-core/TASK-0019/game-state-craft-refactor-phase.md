# TASK-0019: GameState.craft()連携実装 - Refactorフェーズ記録

- **機能名**: GameState.craft()連携実装（game-state-craft）
- **タスクID**: TASK-0019
- **要件名**: atelier-alchemy-core
- **フェーズ**: Refactor（品質改善・コメント強化）

---

## 1. リファクタリング方針

Greenフェーズの実装（`atelier-godot/autoload/game_state.gd`）は以下の理由から、
ロジック自体を変更するリファクタリングは不要と判断した。

- `craft()` は「純粋関数への委譲 → EDGE-001ガード → 在庫消費 → rank_hp/gold更新 → シグナル発行」の
  5行程度のシンプルな構造で、重複コード・複雑な分岐・マジックナンバーが存在しない。
- ファイルサイズは133行（500行制限を大きく下回る）。
- 単体テスト97/97・統合テスト1/1がGreenフェーズ時点で全件成功しており、機能的な問題は検出されていない。

そのため、本フェーズでは **コメントによる設計意図・申し送り事項の明示** に絞って改善を行った。
機能ロジックの変更は一切行っていない。

---

## 2. 実施した改善（コメント追加）

### 2-1. Imperative Shell / Functional Core 境界の明示（最重要事項）

クラス冒頭のコメントブロックを拡張し、`craft()`が担う4ステップ
（①状態読み取り→②純粋関数への引数渡し→③戻り値を用いた状態更新→④シグナル発行）を
明示した。あわせて、この境界を破る変更（craft()内での計算ロジック追加等）は
TC-101-B01（AlchemyResolver直接呼び出し結果との完全一致検証）で検知されることを明記した。

- 信頼性レベル: 🔵（architecture.md「Warning#2対応」・note.md「最重要: Functional Core / Imperative Shell 分離」に基づく）

### 2-2. dataflow.mdとの責務分担の不整合の申し送り

`docs/design/atelier-alchemy-core/dataflow.md`の「機能2: 調合」シーケンス図（96-101行目）を確認したところ、
craft()内では`consume_materials`と`item_crafted`発行のみを行い、rank_hp/gold更新は
別シーケンス「機能3: ギルド納品」（item_crafted購読 → `DeliveryCalculator.check_daily_request_match()` →
合致ボーナス適用 → rank_hp/gold更新）に分離する設計になっていることを確認した。

一方、`docs/design/atelier-alchemy-core/data-model.md`はcraft()単体でrank_hp/gold更新まで
完結させる契約を記載しており、本実装（Green フェーズ）はdata-model.md側を採用している。

現状はAlchemyResolver.craft()に`today_request`を渡して合致ボーナスを既に織り込み済みであり、
dataflow.mdの「機能3」ステップを後から追加すると二重計算になるリスクがあることをコメントで明記し、
Phase 4（ギルド納品機能）着手前に責務分担を設計レベルで確定する必要があることを申し送りとして残した。

- 信頼性レベル: 🔴（両設計文書間の不整合はどちらの文書にも解決策が明記されておらず、本タスクで新たに指摘した内容のため）

### 2-3. current_recipe・trait_definitionsの読み込みタイミング前提の明示

`docs/design/atelier-alchemy-core/data-model.md`を`grep`で確認したところ、
`current_recipe`・`trait_definitions`という語は一切登場せず、これらのフィールドの
読み込みタイミング（いつ・どこで`.tres`ファイルから読み込むか）に関する記載が
設計文書に存在しないことを確認した。

該当フィールドの宣言部にコメントを追加し、本実装は「起動時に一括読み込み済みで
フィールドにセット済み」であることを前提としているに過ぎず、実際のロード処理
（MasterDataRepository等からの`.tres`読み込み）は本タスクのスコープ外であり、
別タスクでの依存関係再確認が必要であることを明記した。

- 信頼性レベル: 🔴（data-model.mdに記載がないことをgrepで確認した上での申し送りのため）

### 2-4. project.godotへのAutoload登録を見送った設計判断の明示

これまでRedフェーズ記録・note.mdにのみ記載されていた「Autoload登録を見送った理由」を、
実装コード（`game_state.gd`）のクラス冒頭コメントにも明示した。理由の要旨は以下のとおり。

- `class_name GameState` を持つスクリプトを同名で`project.godot`の`[autoload]`に登録すると、
  グローバル識別子`GameState`がクラスではなくAutoloadシングルトンのノードインスタンスを
  指すようになり（Godotの既知の挙動）、テスト側の`preload("res://autoload/game_state.gd").new()`が
  `Invalid call. Nonexistent function 'new' in base 'GDScript'`で失敗する。
- 現行テストは`preload().new()` + `add_child_autofree()`でテスト専用インスタンスを生成する方式を
  採っており、Autoload未登録でも支障がないため、本タスクでは意図的に登録を見送った。
- UI層（TASK-0020以降）が`GameState`をAutoload経由で参照する必要が生じた時点で、
  登録方法（別名登録・DIコンテナ経由の参照渡し等）を改めて検討する必要がある旨をあわせて明記した。

ドキュメント（note.md・red-phase.md）だけでなく実装コード自体にこの設計判断の理由を
残すことで、将来この関数に触れる開発者がAutoload登録を安易に追加してテストを
破壊するリスクを低減する狙いがある。

- 信頼性レベル: 🔵（game-state-craft-red-phase.md「4. 設計判断」・note.md「Redフェーズでの申し送り事項」に基づく既存決定のコード内明示化）

---

## 3. レビュー結果

### セキュリティレビュー

- 外部入力（ユーザー入力・ネットワーク通信）を扱わないローカルAutoloadのため、
  XSS/インジェクション等の一般的な脆弱性は該当なし。
- `inventory.find(material)`は参照同一性比較であり、意図しない別インスタンスの誤消費は起きない。
- 重大な脆弱性は発見されなかった。

### パフォーマンスレビュー

- `_consume_materials()`はO(n×m)（n=投入素材数≦5, m=在庫数）だが、投入素材数の上限が
  小さいゲーム設計（1調合あたり最大5枠）であるため実用上問題なし。
- `craft()`自体はO(1)の状態更新のみで、毎フレーム呼ばれる処理でもないためパフォーマンス課題なし。

---

## 4. テスト実行結果（リファクタ後）

コメント追加のみの変更のため、コード実行パスに変更はない。念のため全テストを再実行し、
Greenフェーズと同じ結果であることを確認した。

### 単体テスト（`tests/unit`全体）

```
"C:\...\Godot_v4.7-stable_win64_console.exe" --headless -s addons/gut/gut_cmdln.gd -gdir=res://tests/unit -gexit
```

結果: **97/97 passed**（Scripts: 12, Asserts: 1226）— デグレなし

### 統合テスト（`tests/integration/autoload`）

```
"C:\...\Godot_v4.7-stable_win64_console.exe" --headless -s addons/gut/gut_cmdln.gd -gdir=res://tests/integration/autoload -gexit
```

結果: **1/1 passed**（Asserts: 11）— デグレなし

---

## 5. 品質判定

```
✅ 高品質:
- テスト結果: 単体97/97・統合1/1 すべて継続成功（コメント追加のみで機能変更なし）
- セキュリティ: 重大な脆弱性なし
- パフォーマンス: 重大な性能課題なし
- リファクタ品質: コメントによる設計意図・申し送り事項の明示という目標を達成
- ファイルサイズ: 133行（500行制限を大きく下回る）
- コメント品質: Imperative Shell/Functional Core境界・dataflow.mdとの不整合・
  マスターデータ読み込み前提の3点を新たに明示。信頼性レベル(🔵🔴)を付与済み
```

---

## 6. 今後の申し送り事項（変更なし・継続）

- dataflow.md vs data-model.mdの責務分担不整合はPhase 4（ギルド納品機能）着手前に設計レベルで確定が必要。
- `current_recipe`/`trait_definitions`のロードタイミング・実装は別タスク依存。
- `DailyRequest`/`RankDefinition`型は未実装（Duck typing想定のまま）。
- `project.godot`へのAutoload登録はUI層実装（TASK-0020以降）で必要になった時点で再検討。
