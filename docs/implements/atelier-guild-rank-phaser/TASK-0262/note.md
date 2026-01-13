# TASK-0262 TDD開発ノート

**タスク名**: 1ターンサイクル統合テスト（後半）
**タスクID**: TASK-0262
**タスクタイプ**: TDD
**推定工数**: 4時間
**フェーズ**: Phase 5 - 統合テスト・最適化・仕上げ

---

## 1. 技術スタック

### 使用技術・フレームワーク
- **フレームワーク**: Phaser 3.87+
- **UIプラグイン**: rexUI
- **言語**: TypeScript 5.0+
- **ビルドツール**: Vite 5.0+
- **テストフレームワーク**: Vitest
- **アーキテクチャ**: Clean Architecture（4層構造）

### テスト環境
- テストユーティリティ: `tests/utils/phaserTestUtils.ts`
- テストヘルパー: `createTestGame`, `waitForPhase`, `setupGameState`

**参照元**:
- docs/design/atelier-guild-rank-phaser/architecture.md
- docs/tasks/atelier-guild-rank-phaser/overview.md
- CLAUDE.md

---

## 2. 開発ルール

### テスト規約
- テストファイル配置: `tests/integration/phaser/phase5/`
- ファイル名形式: `{TestName}.test.ts`
- Vitestを使用したTDD開発
- カバレッジ目標: 調合フェーズ90%, 納品フェーズ90%, ターン終了処理100%

### コーディング規約
- TypeScript Strict Mode有効
- ESLintルールに従う
- 日本語コメント推奨
- Clean Architectureの層分離を厳守

### テスト実行コマンド
```bash
cd atelier-guild-rank-html

# 全テスト実行
npm run test

# 単一テストファイル実行
npm run test tests/integration/phaser/phase5/TurnCycleSecondHalf.test.ts

# カバレッジ付きテスト
npm run test:coverage
```

**注意**: `--`オプションは使用しない

**参照元**:
- CLAUDE.md
- docs/tasks/atelier-guild-rank-phaser/TASK-0262.md

---

## 3. 関連実装

### 既存の統合テストパターン
- 全シーン遷移統合テスト: TASK-0260
- 1ターン前半統合テスト: TASK-0261（依頼受注・採取フェーズ）

### 依存するコンテナ実装
- **AlchemyContainer**: TASK-0230で実装済み
  - レシピカード選択機能
  - 素材選択機能
  - 調合実行機能
  - 品質プレビュー機能

- **DeliveryContainer**: TASK-0234で実装済み
  - 依頼一覧表示
  - 納品アイテム選択
  - 納品実行機能
  - 報酬カード選択機能

### イベントバス実装
- EventBus: TASK-0165で実装済み
- イベント購読・発行パターン確立済み

### 状態管理
- StateManager: 既存Application層で実装済み
- PhaserStateManager: Phaser用のラッパー実装済み

**参照元**:
- docs/tasks/atelier-guild-rank-phaser/overview.md (Phase 1-4のタスク一覧)
- docs/design/atelier-guild-rank-phaser/core-systems.md (EventBus設計)

---

## 4. 設計文書

### システムアーキテクチャ
- **レイヤー構造**: Presentation(Phaser) → Application → Domain → Infrastructure
- **Phaserシーン構成**:
  - BootScene: アセットプリロード
  - TitleScene: タイトル画面
  - MainScene: メインゲーム（4フェーズ切替）
  - ShopScene, RankUpScene, GameOverScene, GameClearScene

### データフロー（調合フェーズ）
```
User → AlchemyContainer → EventBus → AlchemyUseCase → AlchemyService
  ↓
StateManager → EventBus → AlchemyContainer (UI更新)
```

### データフロー（納品フェーズ）
```
User → DeliveryContainer → EventBus → QuestUseCase → QuestService
  ↓
RankService (貢献度加算) → StateManager → EventBus → DeliveryContainer
```

### フェーズ遷移
```
依頼受注 → 採取 → 調合 → 納品 → 日終了 → 次の日（依頼受注）
```

### イベント定義
- **調合関連**:
  - `ui:alchemy:craft:requested`: 調合実行リクエスト
  - `app:alchemy:craft:complete`: 調合完了
  - `app:error:occurred`: エラー発生

- **納品関連**:
  - `ui:quest:delivery:requested`: 納品実行リクエスト
  - `app:quest:delivery:complete`: 納品完了
  - `app:reward:card:selection`: 報酬カード選択

- **フェーズ遷移**:
  - `ui:phase:complete`: フェーズ完了通知
  - `app:phase:changed`: フェーズ変更通知
  - `app:day:ended`: 日終了通知

**参照元**:
- docs/design/atelier-guild-rank-phaser/architecture.md
- docs/design/atelier-guild-rank-phaser/core-systems.md (EventBus イベント定義)
- docs/design/atelier-guild-rank-phaser/dataflow.md

---

## 5. 注意事項

### 技術的制約
- Phaserのライフサイクル管理が必要
  - シーン作成: `create()`
  - シーン破棄: `destroy(true)`
  - イベント購読解除を忘れずに実行

- 非同期処理の扱い
  - `vi.waitFor()` を使用して状態変更を待機
  - タイムアウト設定に注意（デフォルト1000ms）

### テスト実装のポイント
1. **セットアップ**
   - `createTestGame()` でPhaserゲームインスタンス作成
   - EventBusとStateManagerの取得
   - `setupGameState()` で初期状態設定

2. **フェーズ進行**
   - `waitForPhase()` を使用してフェーズ遷移を待機
   - `eventBus.emit('ui:phase:complete', { phase })` でフェーズ完了通知

3. **状態検証**
   - `stateManager.getInventory()` で在庫確認
   - `stateManager.getQuests()` で依頼状態確認
   - `stateManager.getPlayerData()` でプレイヤー情報確認

4. **クリーンアップ**
   - `afterEach()` で `game.destroy(true)` を必ず実行
   - メモリリーク防止

### セキュリティ・パフォーマンス要件
- テスト実行時間: 各テストケース1秒以内
- メモリ使用量: テスト実行後に完全クリーンアップ
- イベントリスナーの適切な解放

### テストケース構成
本タスクでテストする内容:
1. **調合フェーズ**（7テストケース）
   - レシピカード表示
   - アイテム調合成功
   - 素材消費確認
   - 素材不足エラー
   - 品質反映
   - フェーズ遷移

2. **納品フェーズ**（5テストケース）
   - 依頼表示
   - 納品成功
   - 報酬獲得
   - アイテム消費
   - アイテム不足エラー

3. **ターン終了**（5テストケース）
   - ターン進行
   - AP回復
   - フェーズ循環
   - サマリー表示
   - 報酬カード選択

4. **フルサイクル**（1テストケース）
   - 1ターン全体の正常完了

**参照元**:
- docs/tasks/atelier-guild-rank-phaser/TASK-0262.md
- docs/design/atelier-guild-rank-phaser/core-systems.md (メモリ管理)

---

## 6. 実装手順（TDDフロー）

1. `/tsumiki:tdd-requirements TASK-0262` - 詳細要件定義
2. `/tsumiki:tdd-testcases` - テストケース作成
3. `/tsumiki:tdd-red` - テスト実装（失敗）
4. `/tsumiki:tdd-green` - 最小実装
5. `/tsumiki:tdd-refactor` - リファクタリング
6. `/tsumiki:tdd-verify-complete` - 品質確認

**参照元**:
- docs/tasks/atelier-guild-rank-phaser/TASK-0262.md
- CLAUDE.md

---

## 7. 依存タスク

### 前提タスク（完了済み）
- TASK-0230: AlchemyContainerテスト
- TASK-0234: DeliveryContainerテスト
- TASK-0165: EventBus実装
- TASK-0258: DayEndUI実装

### 後続タスク
- TASK-0263: 複数日進行統合テスト

**参照元**:
- docs/tasks/atelier-guild-rank-phaser/TASK-0262.md
- docs/tasks/atelier-guild-rank-phaser/overview.md

---

## 8. 追加情報

### プロジェクト構造
```
atelier-guild-rank-html/
├── src/
│   ├── presentation/         # UI層（Phaser実装予定）
│   ├── application/          # ユースケース層
│   ├── domain/               # ドメイン層
│   ├── infrastructure/       # インフラ層
│   └── game/                 # Phaser関連（既存実装）
│       ├── scenes/           # Phaserシーン
│       ├── ui/               # UIコンポーネント
│       ├── state/            # 状態管理
│       └── managers/         # マネージャー
└── tests/
    ├── unit/                 # ユニットテスト
    ├── integration/          # 統合テスト
    │   └── phaser/
    │       └── phase5/       # Phase5統合テスト（本タスク）
    └── utils/                # テストユーティリティ
```

### 関連ファイル
- テストファイル: `tests/integration/phaser/phase5/TurnCycleSecondHalf.test.ts`
- テストユーティリティ: `tests/utils/phaserTestUtils.ts`
- AlchemyContainer: `src/game/ui/alchemy/AlchemyContainer.ts`
- DeliveryContainer: `src/game/ui/delivery/DeliveryContainer.ts`
- EventBus: `src/presentation/phaser/core/EventBus.ts`
- PhaserStateManager: `src/game/state/PhaserStateManager.ts`

**参照元**:
- CLAUDE.md
- atelier-guild-rank-html/src/ (実装済みソースコード)

---

## 作成日時
2026-01-13

## 最終更新
2026-01-13
