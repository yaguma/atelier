# テストベースライン

リファクタリング前のテスト状態を記録したドキュメント。

## 実行日時

2026-02-11 00:46:39 JST

## テスト結果サマリー

| 項目 | 値 |
|------|-----|
| テスト総数 | 1,599件 |
| パス | 1,595件 |
| 失敗 | 0件 |
| スキップ | 4件 |
| テストファイル数 | 82ファイル |
| 実行時間 | 約16秒 |

## カバレッジサマリー

| メトリクス | カバレッジ |
|-----------|-----------|
| Statements | 73.66% |
| Branches | 57.69% |
| Functions | 73.38% |
| Lines | 74.49% |

### 主要ディレクトリ別カバレッジ

| ディレクトリ | Statements | Branches | Functions | Lines |
|-------------|------------|----------|-----------|-------|
| application/events | 100% | 100% | 100% | 100% |
| application/services | 95.23% | 87.06% | 97.14% | 95.09% |
| domain/entities | 98.27% | 90.04% | 95.34% | 98.27% |
| domain/services | 92.85% | 75% | 100% | 93.33% |
| domain/value-objects | 95.45% | 94.44% | 100% | 95.23% |
| infrastructure | 94.63% | 83.12% | 96.87% | 94.51% |
| presentation/ui | 100% | 100% | 100% | 100% |
| presentation/ui/components | 68.44% | 66.78% | 59.18% | 69.26% |
| presentation/ui/phases | 46.69% | 23.79% | 53.47% | 48.2% |
| shared/types | 97.72% | 100% | 93.33% | 97.72% |

## テストファイル一覧

### 統合テスト (3ファイル)

- tests/integration/di/setup.test.ts
- tests/integration/quest-accept-phase.spec.ts
- tests/integration/save-load-service.test.ts

### ユニットテスト - Application層 (11ファイル)

- tests/unit/application/events/event-bus.test.ts
- tests/unit/application/services/alchemy-service.test.ts
- tests/unit/application/services/artifact-service.test.ts
- tests/unit/application/services/deck-service.test.ts
- tests/unit/application/services/game-flow-manager.test.ts
- tests/unit/application/services/gathering-service.test.ts
- tests/unit/application/services/inventory-service.test.ts
- tests/unit/application/services/material-service.test.ts
- tests/unit/application/services/quest-service.test.ts
- tests/unit/application/services/rank-service.test.ts
- tests/unit/application/services/shop-service.test.ts
- tests/unit/application/services/state-manager.test.ts

### ユニットテスト - Domain層 (6ファイル)

- tests/unit/domain/entities/Card.test.ts
- tests/unit/domain/entities/ItemInstance.test.ts
- tests/unit/domain/entities/MaterialInstance.test.ts
- tests/unit/domain/entities/Quest.test.ts
- tests/unit/domain/services/contribution-calculator.test.ts
- tests/unit/domain/value-objects/Quality.test.ts

### ユニットテスト - Infrastructure層 (3ファイル)

- tests/unit/infrastructure/loaders/json-loader.test.ts
- tests/unit/infrastructure/repositories/local-storage-save-repository.test.ts
- tests/unit/infrastructure/repositories/master-data-repository.test.ts

### ユニットテスト - Presentation層 (47ファイル)

- tests/unit/presentation/main-scene.test.ts
- tests/unit/presentation/scenes/BootScene.test.ts
- tests/unit/presentation/scenes/components/rankup/*.test.ts (4ファイル)
- tests/unit/presentation/scenes/components/shop/*.test.ts (6ファイル)
- tests/unit/presentation/scenes/components/title/*.test.ts (6ファイル)
- tests/unit/presentation/scenes/GameClearScene.spec.ts
- tests/unit/presentation/scenes/GameOverScene.spec.ts
- tests/unit/presentation/scenes/rank-up-scene.test.ts
- tests/unit/presentation/scenes/shop-scene.test.ts
- tests/unit/presentation/scenes/TitleScene.spec.ts
- tests/unit/presentation/ui/components/*.spec.ts (15ファイル)
- tests/unit/presentation/ui/phases/*.test.ts (6ファイル)
- tests/unit/presentation/ui/theme.spec.ts
- tests/unit/presentation/ui/utils/*.test.ts (3ファイル)

### ユニットテスト - Shared層 (12ファイル)

- tests/unit/shared/types/cards.test.ts
- tests/unit/shared/types/common.test.ts
- tests/unit/shared/types/constants.test.ts
- tests/unit/shared/types/errors.test.ts
- tests/unit/shared/types/events.test.ts
- tests/unit/shared/types/game-state.test.ts
- tests/unit/shared/types/ids.test.ts
- tests/unit/shared/types/index.test.ts
- tests/unit/shared/types/materials.test.ts
- tests/unit/shared/types/quests.test.ts
- tests/unit/shared/types/save-data.test.ts
- tests/unit/shared/types/utils.test.ts

### その他 (1ファイル)

- tests/unit/debug-tools.test.ts

## スキップされているテスト

4件のテストがスキップされている。これらは既知の問題または未実装機能に関連するテスト。

## 備考

### カバレッジ目標との比較

- **目標**: 80%以上
- **現状**: 73.66% (Statements)

presentation/ui/phases ディレクトリのカバレッジが低い（46.69%）ため、全体のカバレッジが目標に達していない。

### リファクタリング後の期待

Feature-Based Architecture移行後も、同等以上のテストカバレッジとパス率を維持することが目標。

---

## 変更履歴

| 日付 | 変更内容 |
|------|---------|
| 2026-02-11 | 初版作成（TASK-0063） |
