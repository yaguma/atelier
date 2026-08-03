# TDD開発メモ: AlchemyBench UI（調合台画面）

## 概要

- 機能名: AlchemyBench UI（調合台画面）
- 開発開始: 2026-08-03
- 現在のフェーズ: Refactor（完了）

## 関連ファイル

- 元タスクファイル: `docs/tasks/atelier-alchemy-core/TASK-0020.md`
- 要件定義: `docs/implements/atelier-alchemy-core/TASK-0020/alchemy-bench-requirements.md`
- テストケース定義: `docs/implements/atelier-alchemy-core/TASK-0020/alchemy-bench-testcases.md`
- Redフェーズ記録: `docs/implements/atelier-alchemy-core/TASK-0020/alchemy-bench-red-phase.md`
- Greenフェーズ記録: `docs/implements/atelier-alchemy-core/TASK-0020/alchemy-bench-green-phase.md`
- 実装ファイル: `atelier-godot/features/alchemy/ui/alchemy_bench.gd`, `atelier-godot/features/alchemy/ui/material_slot.gd`
- 追記ファイル: `atelier-godot/autoload/game_state.gd`（`recipe_slot_count`, `get_inventory()`追加）
- テストファイル: `atelier-godot/tests/unit/features/alchemy/alchemy_bench_test.gd`

## Redフェーズ（失敗するテスト作成）

### 作成日時

2026-08-03

### テストケース

9件（正常系4・異常系2・境界値3）。詳細は `alchemy-bench-red-phase.md` および `alchemy-bench-testcases.md` を参照。

### 期待される失敗

- `_update_craft_button_state()` / `place_material()` / `_on_craft_pressed()` / `_on_item_crafted()` / `_build_slots()` はすべて `pass` のみのスタブのため、`null`が返る、または`slots`/`_placed_materials`/`last_result`が更新されず、アサーションが失敗する。

### 実行結果

- Scripts 13、Tests 106、Passing 97、Failing 9（新規9件が想定通り失敗、既存97件は回帰なし）

### 次のフェーズへの要求事項

- Greenフェーズで `alchemy_bench.gd` / `material_slot.gd` の各スタブメソッドを最小実装する
- Warning#2境界（UIは計算ロジックを持たない）を厳守すること
- `docs/implements/atelier-alchemy-core/TASK-0020/alchemy-bench-red-phase.md` 「5. Greenフェーズで実装すべき内容」を参照

## Greenフェーズ（最小実装）

### 実装日時

2026-08-03

### 実装方針

- `_build_slots(count)`: 呼び出しのたびに`slots`をリセットし、count個の空枠(null)で再構築（ハードコード禁止）
- `place_material(slot_index, material)`: 同一参照の重複配置を拒否。指定枠が埋まっていれば入れ替え
- `_update_craft_button_state()`: `_placed_materials.is_empty()`を戻り値として返す（UIノード非依存）
- `_on_craft_pressed()`: `_game_state.craft(_placed_materials)`を無加工でそのまま呼び出す（Warning#2境界）
- `_on_item_crafted(result)`: `result`を`last_result`へ無加工で保持（Warning#2境界）
- `MaterialSlot.is_empty()/place()/clear()`: 素朴な状態管理のみ実装

詳細な実装コードは `alchemy-bench-green-phase.md` を参照。

### テスト結果

- Scripts 13、Tests 106、Passing 106、Failing 0（新規9件PASS、既存97件も回帰なし）

### 課題・改善点（Refactorフェーズで対応）

- `place_material()`内の枠入れ替えロジックの可読性向上（ヘルパー切り出し検討）
- `_ready()`と`_on_craft_pressed()`のGameState未注入ガード節の重複を共通化検討

## Refactorフェーズ（コード品質改善）

### 実施日時

2026-08-03

### 実施内容

機能ロジックは変更せず、コメント追加のみ実施。詳細は `alchemy-bench-refactor-phase.md` を参照。

- Warning#2対応の境界と将来の注意喚起をファイル冒頭コメントに明示
- GameStateのAutoload未登録の理由（class_name衝突によるGUTテスト失敗回避）を明示
- 段階的開示（reveal_level）との責務分離をTASK-0037への申し送りとして明示
- `last_result`（craft結果）は`GameState.craft()`内部で既にreveal_levelフィルタ済みである旨を追記し、結果表示側に追加フィルタが不要であることを明確化

### テスト結果

- Scripts 13、Tests 106、Passing 106、Failing 0（全パス、デグレなし）

## 🎯 Verify-Completeフェーズ 最終結果（2026-08-03、1回目）

- **スコープ内テスト（testcases.md 9件）**: 9/9 PASS
- **全体テスト**: 106/106 PASS（スコープ外失敗なし）
- **品質判定**: ⚠️ 要改善（タスク未完了） — 完了条件3が部分未充足のため元タスクファイルのチェックボックスは更新していない

### ⚠️ 未充足だった完了条件（追加TDDサイクルで解消済み、下記参照）

- **完了条件3「プレイヤーが在庫の素材を投入枠に配置・解除できる」の"解除"側が未実装**
  - `alchemy_bench.gd` には `place_material()`（配置・別枠への入れ替え）のみが実装されており、素材を枠から取り除いて空に戻す明示的なAPI（例: `remove_material(slot_index)` / `clear_slot(slot_index)`）が存在しない
  - `material_slot.gd` の `clear()` は実装されているが、`AlchemyBench` はスロットを `MaterialSlot` インスタンスではなく生の配列（`null` または `MaterialInstance`）で管理しており、`clear()` は呼び出されず未結線（デッドコード状態）
  - `place_material(index, null)` を代用として呼ぶと `_placed_materials` に `null` が追加される副作用があり、暫定代用にもならない（`craft()` へ `null` を含む配列が渡るリスクを新たに生む）
  - `alchemy-bench-testcases.md` にも「解除」単体を検証するテストケースが存在しない（TC-1b/2bは`_placed_materials`を直接代入して境界を検証しており、実際の解除APIを経由していない）

## 追加TDDサイクル: remove_material()実装（2026-08-03、2回目）

verify-completeフェーズで検出された未充足の完了条件3に対応するため、追加でRed→Green→Verifyサイクルを実施した。

### Red

- `alchemy_bench_test.gd`にテストケース3件を追加: 正常系1件（配置済み枠からの解除）、異常系1件（空枠への解除操作）、境界値1件（範囲外インデックス）
- 実装は`remove_material(slot_index: int) -> bool`スタブ（`return false`固定）で失敗を確認
- **学び**: GUTの静的型チェッカーは`:=`（型推論代入）でメソッド呼び出し結果を受けると、スタブ実装の戻り値型が確定していても`Cannot infer the type`エラーでスクリプト全体をロード不能にすることがある（TASK-0015のRedフェーズと同種の問題）。既存コードの慣例に合わせ`=`（型推論なし代入）を使うことで回避した

### Green

- `remove_material(slot_index)`を実装: 範囲外インデックス・空枠はfalseを返す防御的ガード、有効な枠は`slots[index]`をnullに戻し`_placed_materials`から対応素材を除去してtrueを返す

### 検証結果

- `tests/unit`全体: Scripts 13、Tests 109、Passing 109（新規3件含む）
- `tests/unit` + `tests/integration`全体: Scripts 15、Tests 112、Passing 112
- 完了条件3が完全充足。`docs/tasks/atelier-alchemy-core/TASK-0020.md`の該当チェックボックスは元々`[x]`だったが、これで実態と一致した

## 💡 重要な技術学習（統合）

### 実装パターン
- GameStateはAutoload未登録（`class_name`衝突回避のため）。UI層は`set_game_state()`セッターDIで受け取る設計が、GUTの`preload().new()`パターンと整合する
- ボタンの活性/非活性はUIノード（`craft_button.disabled`）へ直接書き込まず、`_update_craft_button_state() -> bool`の戻り値として返すことで、UIノード非依存のテスト容易性を確保できる

### テスト設計
- Warning#2境界（UIは計算ロジックを持たない）の回帰防止には、`partial_double`ではなくDIを活かした`craft()`オーバーライド用サブクラス（`SpyGameState`）が有効
- 「配置」の境界（0↔1件）と「重複防止」の境界（連続操作でも高々1件）を別テストケースとして分離すると、境界値の意図が明確になる

### 品質保証
- 完了条件チェックリストは「配置」だけでなく「解除」など対になる操作の有無を個別に確認すること。テストケース定義書がテスト対象メソッドの単位で作られていると、対になる操作の欠落に気づきにくい
