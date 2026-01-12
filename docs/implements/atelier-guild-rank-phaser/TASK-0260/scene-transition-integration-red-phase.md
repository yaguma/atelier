# TDD Red Phase: 全シーン遷移統合テスト

**タスクID**: TASK-0260
**作成日時**: 2026-01-12
**フェーズ**: Red（失敗するテスト作成）

---

## 作成したテストケース一覧

### 実装済みテストケース数: 17個

| カテゴリ | テストケース | ファイル | 行数 | 信頼性 |
|---------|------------|---------|------|--------|
| TC-01 | BootSceneからTitleSceneへ自動遷移する | SceneTransitionIntegration.test.ts | 168-190 | 🔵 |
| TC-02-01 | 新規ゲーム開始でMainSceneへ遷移する | SceneTransitionIntegration.test.ts | 192-227 | 🔵 |
| TC-02-02 | コンティニューでMainSceneへ遷移する | SceneTransitionIntegration.test.ts | 229-263 | 🔵 |
| TC-03-01 | MainSceneからShopSceneへオーバーレイ表示する | SceneTransitionIntegration.test.ts | 272-299 | 🔵 |
| TC-03-02 | ShopSceneからMainSceneへ戻る | SceneTransitionIntegration.test.ts | 301-333 | 🔵 |
| TC-03-03 | MainSceneからRankUpSceneへオーバーレイ表示する | SceneTransitionIntegration.test.ts | 335-362 | 🔵 |
| TC-03-04 | RankUpSceneからMainSceneへ戻る | SceneTransitionIntegration.test.ts | 364-396 | 🔵 |
| TC-04-01 | MainSceneからGameOverSceneへ遷移する（日数切れ） | SceneTransitionIntegration.test.ts | 405-433 | 🔵 |
| TC-04-02 | MainSceneからGameClearSceneへ遷移する（Sランク到達） | SceneTransitionIntegration.test.ts | 435-462 | 🔵 |
| TC-04-03 | GameOverSceneからTitleSceneへ遷移する | SceneTransitionIntegration.test.ts | 464-492 | 🔵 |
| TC-04-04 | GameClearSceneからTitleSceneへ遷移する | SceneTransitionIntegration.test.ts | 494-522 | 🔵 |
| TC-05-01 | 遷移中に二重遷移要求が無視される | SceneTransitionIntegration.test.ts | 531-554 | 🔵 |
| TC-05-02 | 存在しないシーンへの遷移要求がエラーを出す | SceneTransitionIntegration.test.ts | 556-582 | 🔵 |
| TC-05-03 | オーバーレイシーン表示中も背景シーンの状態が保持される | SceneTransitionIntegration.test.ts | 584-618 | 🔵 |
| TC-05-04 | メモリリークが発生しないことを確認する | SceneTransitionIntegration.test.ts | 620-659 | 🔵 |
| TC-06-01 | 遷移時にフェードアニメーションが実行される | SceneTransitionIntegration.test.ts | 668-690 | 🟡 |
| TC-06-02 | シーン遷移完了イベントが正しいペイロードで発火される | SceneTransitionIntegration.test.ts | 692-719 | 🔵 |

---

## テストコード全文

**ファイルパス**: `atelier-guild-rank-html/tests/integration/phaser/phase5/SceneTransitionIntegration.test.ts`

```typescript
/**
 * Phase5 全シーン遷移統合テスト
 *
 * TASK-0260: 全シーン遷移統合テスト
 * 全シーン間の遷移が正しく動作することを検証する統合テスト。
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SceneKeys } from '@game/config/SceneKeys';
import {
  createMockEventBus,
  createMockStateManager,
} from '../../../utils/phaserTestUtils';

// Phaserをモック
// ... (完全なコードは省略)

describe('🔴 Phase5: 全シーン遷移統合テスト', () => {
  // 17個のテストケースを実装
  // ... (詳細は省略)
});
```

---

## 期待される失敗内容

### 実際の失敗メッセージ

```
× TC-01-01: BootSceneからTitleSceneへ自動遷移する 🔵 5010ms
  → Test timed out in 5000ms.

× TC-02-01: 新規ゲーム開始でMainSceneへ遷移する 🔵 5003ms
  → Test timed out in 5000ms.

... (全17テストケースが同様にタイムアウト)
```

### 失敗理由

1. **SceneManagerの実装が存在しない**
   - `createTestGame()`で`sceneManager = null`を設定している
   - シーン遷移のロジックが実装されていない

2. **EventBusとシーン遷移の連携がない**
   - `ui:game:start:requested`などのイベントを発火しても、シーン遷移が発生しない
   - イベントハンドラが登録されていない

3. **waitForScene()がタイムアウトする**
   - `game.scene.isActive()`が常に`false`を返す（モックの初期状態）
   - シーン遷移が発生しないため、5秒待機後にタイムアウト

### 期待される失敗のパターン

**パターン1: タイムアウトエラー**
- 原因: シーン遷移が発生しない
- エラー: `Test timed out in 5000ms.`
- 発生箇所: `waitForScene()`関数

**パターン2: Nullエラー**
- 原因: SceneManagerが`null`
- エラー: `Cannot read properties of null (reading 'goTo')`
- 発生箇所: TC-05-02（存在しないシーンへの遷移テスト）

**パターン3: メソッド未実装エラー**
- 原因: StateManagerのメソッドが存在しない
- エラー: `stateManager.updatePlayer is not a function`
- 発生箇所: TC-05-03（状態引き継ぎテスト）

---

## Greenフェーズで実装すべき内容

### 1. SceneManager実装

**ファイル**: `atelier-guild-rank-html/src/game/managers/SceneManager.ts`

**必要な機能**:
- `goTo(sceneKey, data?, transition?)`: シーン遷移
- `replace(sceneKey, data?, transition?)`: 置き換え遷移
- `goBack(transition?)`: 前のシーンへ戻る
- `openOverlay(sceneKey, data?, transition?)`: オーバーレイ表示
- `closeOverlay(sceneKey, transition?)`: オーバーレイ終了
- `getCurrentScene()`: 現在のシーン取得
- `isTransitioning()`: 遷移中フラグ確認
- `getHistory()`: 遷移履歴取得

**重要な仕様**:
- 二重遷移防止機能（`transitioning`フラグ）
- 履歴管理（最大50件）
- アニメーション対応（フェードイン/アウト）
- イベント発火（`scene:transition:complete`等）

### 2. EventBusとの連携実装

**EventBus → SceneManager**の連携:

```typescript
// ui:game:start:requested → MainSceneへ遷移
eventBus.on('ui:game:start:requested', async ({ isNewGame }) => {
  if (isNewGame) {
    // 新規ゲーム初期化
    stateManager.reset();
    stateManager.initialize();
  }
  await sceneManager.goTo(SceneKeys.MAIN, { isNewGame });
});

// ui:game:continue:requested → セーブロード → MainSceneへ遷移
eventBus.on('ui:game:continue:requested', async ({ slotId }) => {
  // セーブデータロード
  const saveData = loadSaveData(slotId);
  stateManager.deserialize(saveData.state);
  await sceneManager.goTo(SceneKeys.MAIN, { isNewGame: false });
});

// ui:shop:open:requested → ShopSceneをオーバーレイ表示
eventBus.on('ui:shop:open:requested', async () => {
  await sceneManager.openOverlay(SceneKeys.SHOP);
});

// ui:shop:close:requested → ShopSceneを終了
eventBus.on('ui:shop:close:requested', async () => {
  await sceneManager.closeOverlay(SceneKeys.SHOP);
});

// ... その他のイベントハンドラ
```

### 3. StateManager実装

**必要なメソッド**:
- `getProgressData()`: 進行状況データ取得
- `getPlayerData()`: プレイヤーデータ取得
- `updateProgress(data)`: 進行状況更新
- `updatePlayer(data)`: プレイヤーデータ更新
- `reset()`: リセット
- `initialize()`: 初期化
- `serialize()`: シリアライズ
- `deserialize(data)`: デシリアライズ

### 4. Phaserシーンクラス実装

**必要なシーン**:
- BootScene: アセットプリロード、初期化
- TitleScene: タイトル画面
- MainScene: メインゲームプレイ
- ShopScene: ショップ（オーバーレイ）
- RankUpScene: 昇格試験
- GameOverScene: ゲームオーバー画面
- GameClearScene: ゲームクリア画面

### 5. シーン遷移ロジック実装

**BootScene → TitleScene**:
```typescript
// BootScene.ts
create() {
  // アセット読み込み完了後
  this.events.on('complete', () => {
    const sceneManager = this.registry.get('sceneManager');
    sceneManager.goTo(SceneKeys.TITLE);
  });
}
```

**ゲームオーバー/クリア判定**:
```typescript
// MainScene.ts or FlowManager.ts
if (currentDay >= maxDay && rank < 'S') {
  // ゲームオーバー
  eventBus.emit('game:over', { reason: 'day_limit' });
  sceneManager.goTo(SceneKeys.GAME_OVER);
}

if (rank === 'S') {
  // ゲームクリア
  eventBus.emit('game:clear', { reason: 'rank_s' });
  sceneManager.goTo(SceneKeys.GAME_CLEAR);
}
```

---

## 品質判定結果

### ✅ 高品質

- **テスト実行**: 成功（全17テストが失敗することを確認）
- **期待値**: 明確で具体的（各テストケースで期待する動作を詳細にコメント）
- **アサーション**: 適切（シーンのアクティブ状態、イベント発火、状態保持を検証）
- **実装方針**: 明確（Greenフェーズで実装すべき内容を詳細に記載）
- **信頼性レベル**: 🔵（青信号）が16個、🟡（黄信号）が1個

### 信頼性レベル分布

| レベル | 数 | 割合 | 説明 |
|-------|---|------|------|
| 🔵 青信号 | 16 | 94% | 設計文書に明確な記載あり |
| 🟡 黄信号 | 1 | 6% | 妥当な推測に基づく（アニメーション詳細） |
| 🔴 赤信号 | 0 | 0% | 推測なし |
| **合計** | **17** | **100%** | - |

### テストカバレッジ目標

| カテゴリ | テスト数 | カバレッジ目標 | 達成見込み |
|---------|---------|--------------|----------|
| Boot to Title | 1 | 100% | ✅ |
| Title to Main | 2 | 100% | ✅ |
| Main to SubScenes | 4 | 100% | ✅ |
| Game End Transitions | 4 | 100% | ✅ |
| Edge Cases | 4 | 90% | ✅ |
| Transition Animations | 2 | 80% | ✅ |
| **合計** | **17** | **80%以上** | ✅ |

---

## 次のステップ

**推奨コマンド**: `/tsumiki:tdd-green atelier-guild-rank-phaser TASK-0260`

### Greenフェーズで実装する内容

1. **SceneManager.ts**の実装
   - シーン遷移ロジック
   - 二重遷移防止
   - 履歴管理
   - オーバーレイ管理

2. **EventBus連携**の実装
   - イベントハンドラの登録
   - シーン遷移トリガー

3. **StateManager.ts**の実装（未実装の場合）
   - 状態管理ロジック
   - シリアライズ/デシリアライズ

4. **Phaserシーンクラス**の実装（未実装の場合）
   - BootScene, TitleScene, MainScene等

5. **テスト実行**
   - 全テストがパスすることを確認
   - カバレッジ80%以上を確認

---

**最終更新**: 2026-01-12
