# TASK-0015 TDD開発コンテキストノート

**タスクID**: TASK-0015  
**機能名**: TraitActivation.resolve_category_conflict実装  
**実装言語**: GDScript（Godot 4.x）  
**テストフレームワーク**: GUT（Godot Unit Test）  
**作成日**: 2026-07-31

---

## 1. 技術スタック

- **エンジン**: Godot 4.7
- **言語**: GDScript 
- **テストツール**: GUT (Godot Unit Test Framework) 9.6.1
- **アーキテクチャパターン**: Functional Core / Imperative Shell
  - 実装対象 `resolve_category_conflict` は純粋関数（static func、副作用なし）
  - 外部状態参照・変更禁止
- **参照元**: `docs/design/atelier-alchemy-core/architecture.md`

---

## 2. 開発ルール

### TDD実装ルール（Godot向け）
- **Red**: `tests/unit/features/alchemy/trait_activation_test.gd` にテストケース記述
- **Green**: `features/alchemy/logic/trait_activation.gd` で最小実装
- **Refactor**: 型安全性・DRY原則・命名規約を確認
- 参照元: `docs/rule/tdd/` ディレクトリ配下のGDScript向けルール、TASK-0014の実装パターン

### GDScriptコーディング規約
- 型注釈は必須（`func func_name(arg: Type) -> ReturnType:`）
- 定数は大文字アンダースコア（`const MAX_VALUE = 10`）
- 関数名はスネークケース（`resolve_category_conflict`）
- クラス名はパスカルケース（`TraitActivation`）
- static funcのみ使用（外部状態参照なし）

### テスト規約（GUT）
- テストクラス名: `Test<TargetClass><FunctionName>`
- テストメソッド名: `test_<scenario>()` または `test_<given_when_then>()`
- beforeEach/afterEachで状態リセット
- `assert_*` メソッドで検証
- 参照元: `tests/unit/features/alchemy/trait_activation_test.gd` (TASK-0014の実装パターンを継承)

---

## 3. 関連実装

### 前提実装（TASK-0014 完了済み）
- `TraitActivation.resolve_activated_traits()`: 特性発現候補を生成
- `TraitDefinition.Category` enum: CONTRIBUTION / REWARD / SUPPORT の分類
- 実装ファイル: `features/alchemy/logic/trait_activation.gd`

### 後続実装（参考）
- TASK-0018: `AlchemyResolver.craft()` が `resolve_category_conflict()` の戻り値を `CraftResult` に格納
- TASK-0020: UI層が `CraftResult.rejected_category` と `has_rejected_category` フラグで排他制御を表示

### 既存テストパターン
- ディレクトリ: `tests/unit/features/alchemy/`
- 命名規則: `{対象}.test.gd`
- 依存モック: MaterialInstance, TraitDefinition 型定義（TASK-0011以前で定義済み）

---

## 4. 設計文書・データモデル

### コアドキュメント
- **要件**: `docs/spec/atelier-alchemy-core/requirements.md` - REQ-115 (2026-07-09新設)
  - 貢献度系・報酬系が同時発現条件を満たす場合の排他制御ルール
  - 同数不発、SUPPORT対象外が核
- **設計**: `docs/design/atelier-alchemy-core/architecture.md`
  - TraitActivation のシグネチャ例
  - 系統別（category）の処理フロー
- **データフロー**: `docs/design/atelier-alchemy-core/dataflow.md` - 機能2ステップ3
  - `resolve_category_conflict(発現特性) — REQ-115`
- **データモデル**: `docs/design/atelier-alchemy-core/data-model.md`
  - MaterialInstance, TraitDefinition, TraitDefinition.Category 定義
  - CraftResult 型（rejected_category フィールドは本タスクで無効値表現を確定）

### 受け入れ基準（重要）
- `docs/spec/atelier-alchemy-core/acceptance-criteria.md`
  - **TC-101-04**: 同数（2vs2）で両方不発 🔵 Critical
  - **TC-101-05**: 不均衡（3vs2）で多い方のみ発現 🔵
  - **TC-101-07**: 1素材が2タグ同時保持でも無条件両取りできない 🔵 Critical（支配戦略防止の最終防線）

---

## 5. テスト関連情報

### テストファイル
- **ファイル**: `tests/unit/features/alchemy/trait_activation_test.gd`
- **テストケース数**: 5個（必須3個 + 補助2個）
  1. **TC-101-04** (MUST): 同数不発（2vs2） → `activated_traits.is_empty() == true`, `has_rejected_category == false`
  2. **TC-101-05** (MUST): 不均衡（3vs2） → `activated_traits.size() == 1`, `rejected_category == REWARD`
  3. **TC-101-07** (MUST): 1素材2タグ同時保持 → TC-101-04と同じ同数不発
  4. **補助系除外検証** (SHOULD): SUPPORT系は排他対象外
  5. **片系統のみ** (SHOULD): 一方の系統がなければ排他制御なし

### GUTテストフレームワーク設定
- ファイル: `tests/unit/gut/gut_configuration.gd` (存在する場合)
- テスト実行: `godot --headless -d res://tests/gut_runner.tscn` または IDE統合実行
- カバレッジ目標: 90%+（Functional Core）

### モック・テストデータ
- MaterialInstance型: `features/alchemy/entities/material_instance.gd`
- TraitDefinition型: `features/alchemy/entities/trait_definition.gd`
- テスト用ファクトリ: `tests/unit/fixtures/` 配下に素材・特性定義の生成ヘルパを実装

---

## 6. 実装チェックリスト

### 関数シグネチャ
```gdscript
static func resolve_category_conflict(
    materials: Array[MaterialInstance],
    activated_traits: Array[TraitDefinition],
) -> Dictionary:
    # 戻り値: {
    #   "activated_traits": Array[TraitDefinition],  # 排他制御後の最終発現特性
    #   "rejected_category": TraitDefinition.Category,  # 不発とされた系統（無効値の可能性）
    #   "has_rejected_category": bool,  # rejected_categoryが有効な値かどうか
    # }
```

### アルゴリズム
1. **グループ化**: `activated_traits` を `category` で CONTRIBUTION / REWARD / SUPPORT に分類
2. **枚数集計**: CONTRIBUTION群・REWARD群それぞれで、各特性タグを持つ `materials` の個数を合計
3. **比較・排他**:
   - 一方が多い → 多い方のみ残す、少ない方を除外、`has_rejected_category = true`
   - 同数（両方とも>0） → 両方除外、`has_rejected_category = false`
   - 一方が0 → 存在する方をそのまま残す（排他対象外）
4. **SUPPORT処理**: SUPPORT群は常に結果に残す（排他制御対象外）

### 品質・テスト
- [ ] `resolve_category_conflict()` が純粋関数として実装されているか（副作用なし）
- [ ] TC-101-04, 05, 07 が全てPass するか
- [ ] 補助系・片系統のケースでも正常動作するか
- [ ] `has_rejected_category` フラグが正確に返されるか
- [ ] GUT実行で全テストPass、カバレッジ90%+達成

---

## 7. 注意事項・重要ポイント

### 🔴 最重要：支配戦略防止
- **ゲームデザインレビュー背景** (2026-07-09):
  - 旧設計では「1品で貢献度系・報酬系の両方を無条件に発現させる」支配戦略が成立していた
  - REQ-115・TC-101-04/07 はこの支配戦略を **数式レベルで防ぐ** ための要件
  - TC-101-04（同数不発）と TC-101-07（1素材2タグ不発）を軽視すると、ゲームデザイン上のCritical不具合が再発する
- **実装時の検証**: 両ケースで「activated_traits が空になる」ことを **必ず確認** すること

### 🟡 CraftResult.rejected_category の無効値表現
- **問題**: 同数不発の場合「不発とされた系統」が両方のため、単一のenum値では表現不可
- **解決**: 本タスクは `has_rejected_category: bool` フラグ付きDictionaryで戻す
- **後続への影響** (TASK-0018):
  - `CraftResult` 型に `has_rejected_category` フィールド追加が必要な可能性あり
  - UI層 (TASK-0020) は `has_rejected_category` を **必ず確認** してから `rejected_category` を参照

### 🔵 系統内複数発現 (REQ-112) との処理順序
- **混同注意**: REQ-112（同一系統内の複数特性同時発現、TASK-0014完了）と REQ-115（系統間排他、本タスク）は別処理
- **処理フロー**: TASK-0014で系統内の複数発現を確定 → TASK-0015で系統間の排他比較
- **再評価禁止**: 本タスクは系統内の個別特性を再評価しない（TASK-0014の結果をそのまま使用）

### 🟡 `materials` 引数の妥当性
- **設計文書未記載**: architecture.md のシグネチャ例に `materials` 明記なし（TASK-0014と同様の実装判断）
- **必要理由**: REQ-115「投入枠内で条件を満たしている枚数（同一タグの重複投入数の合計）」計算に元の投入素材が必須
- **実装確認**: TASK-0014のシグネチャと一貫性を保つこと

---

## 参考：TASK-0014実装例（継承すべきパターン）
- ファイル: `features/alchemy/logic/trait_activation.gd`
- パターン: static func、型注釈完全、テスト0-100検証、GUT統合テスト実行確認
