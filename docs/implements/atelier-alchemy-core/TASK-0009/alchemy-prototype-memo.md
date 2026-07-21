# TDD開発メモ: 1画面調合プロトタイプ（alchemy-prototype）

## 概要

- 機能名: 1画面調合プロトタイプ（alchemy-prototype）
- 開発開始: 2026-07-21
- 現在のフェーズ: 完了（Refactor済み）

## 関連ファイル

- 元タスクファイル: `docs/tasks/atelier-alchemy-core/TASK-0009.md`
- 要件定義: `docs/implements/atelier-alchemy-core/TASK-0009/alchemy-prototype-requirements.md`
- テストケース定義: `docs/implements/atelier-alchemy-core/TASK-0009/alchemy-prototype-testcases.md`
- Redフェーズ記録: `docs/implements/atelier-alchemy-core/TASK-0009/alchemy-prototype-red-phase.md`
- Greenフェーズ記録: `docs/implements/atelier-alchemy-core/TASK-0009/alchemy-prototype-green-phase.md`
- 実装ファイル: `atelier-godot/features/prototype/logic/prototype_alchemy_resolver.gd`
- テストファイル: `atelier-godot/tests/unit/features/prototype/prototype_alchemy_resolver_test.gd`
- UI層: `atelier-godot/features/prototype/ui/alchemy_prototype.gd`, `atelier-godot/features/prototype/ui/alchemy_prototype.tscn`

## Redフェーズ（失敗するテスト作成）

### 作成日時

2026-07-21

### テストケース

テストケース定義書（TC1〜TC11、TC7除く）のうち10件をGUT形式で実装。

- 正常系: TC1（平均計算）, TC2（閾値発現）, TC3（1個不発）, TC4（品質ペナルティ）, TC11（異系統同時発現）
- 異常系: TC6（空投入拒否）
- 境界値: TC5（品質下限クランプ）, TC8（端数切り捨て）, TC9（traits空）, TC10（4枠フル投入）

TC7（素材入手ボタンのUI即時反映）はUI/シーンレベルテストのため本純粋関数テストスイートの対象外（TASK-0010または手動確認でカバー、テストケース定義書の方針通り）。

### テストコード

`atelier-godot/tests/unit/features/prototype/prototype_alchemy_resolver_test.gd` に実装済み（詳細はRedフェーズ記録参照）。

### 期待される失敗

`PrototypeAlchemyResolver`（`features/prototype/logic/prototype_alchemy_resolver.gd`）が未実装のため、テストファイル冒頭の`preload()`がパースエラーとなり、GUTはテストスクリプトをGutTest派生として認識できず「Nothing was run」という形で失敗する。実行ログはRedフェーズ記録ファイルに記載。

### 次のフェーズへの要求事項

- `prototype_alchemy_resolver.gd`に`static func resolve(materials: Array) -> Dictionary`を実装
- 基礎品質平均（int除算切り捨て）、特性発現判定（同一タグ2個以上）、品質ペナルティ（発現数分減算、下限1）、空投入時`success: false`を実装
- REQ-112, REQ-115はスコープ外である旨をコード内コメントで明記
- Node/Scene非依存のstatic funcとして実装し、副作用を持たないこと

## Greenフェーズ（最小実装）

### 実装日時

2026-07-21

### 実装方針

- `PrototypeAlchemyResolver.resolve(materials)`をNode/Scene非依存の`static func`として実装。基礎品質平均（int除算切り捨て）、特性発現（同一タグ2個以上）、品質ペナルティ（発現数分減算、下限1）、空投入時`{"quality":0,"traits":[],"success":false}`を返す最小ロジック
- REQ-112（同系統複数特性の加算ペナルティ）、REQ-115（排他制御）はコード内コメント（`# 簡略化: ...スコープ外`）で明記し未実装
- UI層`alchemy_prototype.gd`/`.tscn`を新規実装。素材入手→投入枠配置→調合実行→完成品表示を1画面で完結。調合ボタンは投入枠が空の場合`disabled=true`かつ押下ハンドラでも早期returnする二重防御（EDGE-001）

### 実装コード

詳細は `docs/implements/atelier-alchemy-core/TASK-0009/alchemy-prototype-green-phase.md` を参照。

### テスト結果

GUT実行: `10/10 passed.`（`prototype_alchemy_resolver_test.gd` TC1〜TC6, TC8〜TC11）。TC7はUIレベルテストのため対象外（方針通り）。
`alchemy_prototype.tscn`は一時チェックスクリプトで`load()`→`instantiate()`が正常動作することを確認済み。

### 課題・改善点

- `_format_material`/`_display_result`の品質ラベル・特性テキスト整形ロジックに一部重複あり（Refactorフェーズで統合検討）
- `SLOT_COUNT`定数がプロトタイプ内に直接保持され`GameBalance.RECIPE_DEFAULT_SLOT_COUNT`と値が重複（features/alchemy/を汚染しない制約による意図的な分離）

## Refactorフェーズ（品質改善）

### 実施日時

2026-07-21

### リファクタリング内容

- `alchemy_prototype.gd`にて`_quality_label(quality)`ヘルパーを新設し、`_format_material`/`_display_result`が個別に呼んでいた`QUALITY_LABELS.get(x, "?")`を統合（DRY原則）
- `_refresh_list(list, materials)`ヘルパーを新設し、`_refresh_inventory_list`/`_refresh_slot_list`のclear+ループ処理を統合
- `prototype_alchemy_resolver.gd`（Functional Core）は既に十分整理済みと判断し、追加変更なし
- `SLOT_COUNT`とGameBalanceの重複、`QUALITY_LABELS`の非共有は意図的な設計判断のため見送り（詳細は`alchemy-prototype-refactor-phase.md` 2.3）

### セキュリティレビュー結果

外部入力・DB・ネットワークアクセスなし。重大な脆弱性なし。

### パフォーマンスレビュー結果

投入枠は最大4件固定で計算量は実質定数時間。重大な性能課題なし。

### 最終テスト結果

GUT実行: `10/10 passed.`（リファクタリング前後で変化なし）。`alchemy_prototype.tscn`のロード・インスタンス化も再確認済み。

### 品質評価

✅ 高品質（詳細は`docs/implements/atelier-alchemy-core/TASK-0009/alchemy-prototype-refactor-phase.md`を参照）

## Verify-Completeフェーズ（完全性検証）

### 実施日時

2026-07-21

### 検証内容

- GUT実行（スコープ内）: `prototype_alchemy_resolver_test.gd` 10/10 passed
- GUT実行（プロジェクト全体）: `tests/unit` 配下 16/16 passed。スコープ外の失敗なし（`rng_service_test.gd`の`push_error`出力は`assert_push_error`テスト内の意図的な検証であり失敗ではない）
- 完了条件6項目を実装コード照合＋一時検証スクリプト（`_verify_scene_check.gd`、確認後削除済み）による実際のボタン操作シミュレーションで全て確認:
  1. 素材入手ボタン2回押下 → `inventory_list.item_count == 2`（即時反映を確認）
  2. インベントリ選択→投入枠配置ボタン → `slot_list.item_count == 1`
  3. 調合ボタン押下 → `result_label.text == "完成品 品質: S / 発現特性: 特性なし"`（1画面内表示を確認）
  4. 初期状態および調合後（投入枠再び空）で`craft_button.disabled == true`（EDGE-001の二重防御を実機確認）
  5. `PrototypeAlchemyResolver.resolve()`がstatic funcの純粋関数としてGUTテスト可能（10件で検証済み）
  6. `alchemy_prototype.tscn`のload→instantiateおよび上記操作フロー全体が実機で正常動作

### 要件網羅率

テストケース定義書（TC1〜TC11、11件）のうちTC1〜TC6, TC8〜TC11（10件）は`prototype_alchemy_resolver_test.gd`で実装・全通過。TC7（UI即時反映）は方針通り純粋関数テストスイート対象外だが、本フェーズの実機操作確認で実質的にカバー。要件網羅率100%。

### 最終判定

✅ **OK（テストケース不足なし・実装不足なし）**。TASK-0009の完了条件6項目・要件定義・テストケース定義を全て満たすことを確認した。
