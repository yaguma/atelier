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
