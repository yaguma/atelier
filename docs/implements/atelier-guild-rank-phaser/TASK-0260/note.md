# TASK-0260: 全シーン遷移統合テスト - 開発ノート

**作成日**: 2026-01-12
**タスクID**: TASK-0260
**タスクタイプ**: TDD
**推定工数**: 4時間
**フェーズ**: Phase 5 - 統合テスト・最適化・仕上げ

---

## 1. 技術スタック

### 使用技術・フレームワーク

| 技術 | バージョン | 用途 |
|------|-----------|------|
| TypeScript | 5.7.0+ | メイン言語 |
| Phaser | 3.90.0+ | ゲームフレームワーク |
| phaser3-rex-plugins | 1.80.17+ | UIコンポーネント（ダイアログ、ボタン等） |
| Vitest | 2.1.0+ | テストフレームワーク |
| jsdom | 25.0.0+ | DOMエミュレーション |
| @vitest/coverage-v8 | 2.1.0+ | カバレッジ計測 |

**参照元**: atelier-guild-rank-html/package.json

### アーキテクチャパターン

- **Clean Architecture**: 既存4層構造を維持（責務分離）
- **Scene-based Architecture**: Phaserのシーン管理を活用
- **イベント駆動設計**: EventBusによる疎結合な通信
- **Singleton Pattern**: EventBus, SceneManagerで使用

**参照元**:
- docs/design/atelier-guild-rank-phaser/architecture.md
- docs/design/atelier-guild-rank-phaser/core-systems.md

### テスト環境設定

```typescript
// vitest.config.ts
{
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
}
```

**参照元**: atelier-guild-rank-html/vitest.config.ts

---

## 2. 開発ルール

### プロジェクト固有のルール

#### TDD開発フロー

1. **Red**: 失敗するテストを作成
2. **Green**: テストを通す最小実装
3. **Refactor**: リファクタリング
4. **Review**: コードレビュー
5. **Verify**: 完了確認

**参照元**: CLAUDE.md

#### テスト駆動開発規約

- テストファイルは `tests/integration/phaser/phase5/` 配下に配置
- ファイル名: `SceneTransitionIntegration.test.ts`
- カバレッジ目標: **80%以上**
- すべてのテストケースが成功することを確認

**参照元**:
- CLAUDE.md
- docs/tasks/atelier-guild-rank-phaser/TASK-0260.md

#### コーディング規約

- TypeScript Strict Mode有効
- ESLint + Prettier による自動フォーマット
- 命名規則:
  - クラス: PascalCase
  - メソッド/変数: camelCase
  - 定数: UPPER_SNAKE_CASE
  - インターフェース: IPrefixPascalCase

**参照元**:
- atelier-guild-rank-html/package.json
- 既存実装パターン

---

## 3. 関連実装

### シーン管理 (SceneManager)

**ファイル**: atelier-guild-rank-html/src/game/managers/SceneManager.ts

#### 主要機能

```typescript
class SceneManager {
  // 通常遷移
  async goTo(sceneKey: SceneKey, data?, transition?): Promise<void>

  // 置き換え（履歴なし）
  async replace(sceneKey: SceneKey, data?, transition?): Promise<void>

  // 前のシーンへ戻る
  async goBack(transition?): Promise<boolean>

  // オーバーレイ管理
  async openOverlay(sceneKey: SceneKey, data?, transition?): Promise<void>
  async closeOverlay(sceneKey: SceneKey, transition?): Promise<void>

  // 状態取得
  getCurrentScene(): SceneKey | null
  isTransitioning(): boolean
  getHistory(): SceneTransitionData[]
}
```

#### 遷移制御の特徴

- **二重遷移防止**: `transitioning`フラグで制御
- **履歴管理**: 最大50件の遷移履歴を保持
- **アニメーション**: フェードイン/アウトをサポート
- **オーバーレイ**: ショップなどのオーバーレイシーン対応

**参照元**: atelier-guild-rank-html/src/game/managers/SceneManager.ts

### イベント駆動通信 (EventBus)

**ファイル**: atelier-guild-rank-html/src/game/events/EventBus.ts

#### 主要機能

```typescript
class EventBus {
  // ペイロードありイベント
  emit<K>(event: K, payload: EventPayloadMap[K]): void
  on<K>(event: K, callback: EventCallback): UnsubscribeFn
  once<K>(event: K, callback: EventCallback): UnsubscribeFn

  // ペイロードなしイベント
  emitVoid(event: VoidEventKey): void
  onVoid(event: VoidEventKey, callback: VoidEventCallback): UnsubscribeFn

  // 購読解除
  off(event: string, callback?): void
  clear(): void
}
```

#### シーン遷移関連イベント

- `scene:transition:start` - 遷移開始
- `scene:transition:complete` - 遷移完了
- `scene:overlay:opened` - オーバーレイ開始
- `scene:overlay:closed` - オーバーレイ終了

**参照元**: atelier-guild-rank-html/src/game/events/EventBus.ts

### シーンキー定義 (SceneKeys)

**ファイル**: atelier-guild-rank-html/src/game/config/SceneKeys.ts

```typescript
export const SceneKeys = {
  BOOT: 'BootScene',
  TITLE: 'TitleScene',
  MAIN: 'MainScene',
  SHOP: 'ShopScene',
  RANK_UP: 'RankUpScene',
  GAME_OVER: 'GameOverScene',
  GAME_CLEAR: 'GameClearScene',
  TEST: 'TestScene',
  ALCHEMY_TEST: 'AlchemyTestScene',
} as const;
```

**参照元**: atelier-guild-rank-html/src/game/config/SceneKeys.ts

### テストユーティリティ

**ファイル**: atelier-guild-rank-html/tests/utils/phaserTestUtils.ts

#### モック作成関数

```typescript
// EventBusモック
createMockEventBus()

// StateManagerモック
createMockStateManager()

// FlowManagerモック
createMockFlowManager()

// Sceneモック
createMockScene()

// LocalStorageモック
createMockStorage()
```

**参照元**: atelier-guild-rank-html/tests/utils/phaserTestUtils.ts

### 既存統合テスト

**参考実装**:
- atelier-guild-rank-html/tests/integration/phaser/phase4/SubSceneIntegration.test.ts
- atelier-guild-rank-html/tests/integration/phaser/phase4/ApplicationLayerIntegration.test.ts
- atelier-guild-rank-html/tests/integration/phaser/phase4/SaveLoadIntegration.test.ts

**参照元**: TASK-0259実装

---

## 4. 設計文書

### システムアーキテクチャ

**ファイル**: docs/design/atelier-guild-rank-phaser/architecture.md

#### シーン一覧

| シーンキー | クラス名 | 説明 | 依存シーン |
|-----------|---------|------|-----------|
| `Boot` | BootScene | アセットプリロード、初期化 | - |
| `Title` | TitleScene | タイトル画面 | Boot |
| `Main` | MainScene | メインゲームプレイ（4フェーズ） | Title |
| `Shop` | ShopScene | ショップ（オーバーレイ） | Main |
| `RankUp` | RankUpScene | 昇格試験 | Main |
| `GameOver` | GameOverScene | ゲームオーバー画面 | Main |
| `GameClear` | GameClearScene | ゲームクリア画面 | Main |

#### シーン遷移図

```
Boot → Title → Main → {Shop, RankUp, GameOver, GameClear}
                ↑←────────────────┘
Shop → Main (戻る)
RankUp → Main (試験クリア)
RankUp → GameOver (試験失敗)
GameOver/GameClear → Title
```

**参照元**: docs/design/atelier-guild-rank-phaser/architecture.md

### データフロー設計

**ファイル**: docs/design/atelier-guild-rank-phaser/dataflow.md

#### シーン遷移フロー

```typescript
// 1. ユーザー操作
User → UI Component → EventBus.emit('ui:game:start:requested')

// 2. イベント処理
EventBus → SceneManager.goTo('MainScene')

// 3. 遷移実行
SceneManager → Phaser.Scene.stop(from)
SceneManager → Phaser.Scene.start(to, data)

// 4. 完了通知
SceneManager → EventBus.emit('scene:transition:complete')
```

**参照元**: docs/design/atelier-guild-rank-phaser/dataflow.md

### UI設計

**ファイル**: docs/design/atelier-guild-rank-phaser/ui-design/overview.md

#### 画面遷移仕様

- **Boot → Title**: アセット読み込み完了後、自動遷移
- **Title → Main**: 「新規ゲーム」または「コンティニュー」ボタン
- **Main → Shop**: 買い物アクション選択時、オーバーレイ表示
- **Main → RankUp**: 昇格ゲージ満タン時、昇格試験解放
- **Main → GameOver**: 日数切れ時
- **Main → GameClear**: Sランク到達時
- **GameOver/GameClear → Title**: タイトルへ戻るボタン

**参照元**: docs/design/atelier-guild-rank-phaser/ui-design/overview.md

### コアシステム設計

**ファイル**: docs/design/atelier-guild-rank-phaser/core-systems.md

#### SceneManagerの責務

- シーン間の遷移管理
- 遷移履歴の保持
- 遷移アニメーションの制御
- オーバーレイシーンの管理

#### EventBusの役割

- Phaser UIとApplication層の疎結合な連携
- イベント駆動のデータフロー
- 型安全なイベント発行・購読

**参照元**: docs/design/atelier-guild-rank-phaser/core-systems.md

---

## 5. 注意事項

### 非同期遷移のタイミング

#### 問題点

Phaserのシーン遷移は非同期で実行されるため、遷移完了を待たずに次の操作が行われるとエラーが発生する可能性がある。

#### 対応策

1. **遷移中フラグの確認**
   ```typescript
   if (sceneManager.isTransitioning()) {
     console.warn('Scene transition in progress');
     return;
   }
   ```

2. **Promiseの活用**
   ```typescript
   await sceneManager.goTo('MainScene', data);
   // 遷移完了後の処理
   ```

3. **イベント購読による待機**
   ```typescript
   eventBus.once('scene:transition:complete', ({ to }) => {
     if (to === 'MainScene') {
       // 処理
     }
   });
   ```

**参照元**:
- docs/tasks/atelier-guild-rank-phaser/TASK-0260.md
- atelier-guild-rank-html/src/game/managers/SceneManager.ts

### 状態の引き継ぎ検証

#### 重要ポイント

- シーン遷移時に状態が正しく保持されること
- オーバーレイ表示中も背景のシーンの状態が維持されること
- セーブ・ロードを経由しても状態が保持されること

#### テスト観点

```typescript
// 状態設定
stateManager.updatePlayer({ gold: 999 });

// ショップへ遷移
await sceneManager.openOverlay('ShopScene');
await sceneManager.closeOverlay('ShopScene');

// 状態確認
const player = stateManager.getPlayerData();
expect(player.gold).toBe(999); // 維持されていること
```

**参照元**:
- docs/tasks/atelier-guild-rank-phaser/TASK-0260.md
- docs/design/atelier-guild-rank-phaser/dataflow.md

### メモリリークの確認

#### 問題点

- イベントリスナーの購読解除忘れ
- Phaserオブジェクトの破棄忘れ
- タイマーの停止忘れ

#### 対応策

1. **購読解除の徹底**
   ```typescript
   shutdown(): void {
     this.unsubscribe(); // EventBus購読解除
     this.phaseContainers.forEach(c => c.destroy());
     this.tweens.killAll();
     this.time.removeAllEvents();
   }
   ```

2. **テストでの確認**
   ```typescript
   afterEach(() => {
     scene.destroy(); // シーン破棄
     eventBus.clear(); // リスナークリア
     expect(eventBus.listenerCount()).toBe(0);
   });
   ```

3. **Phaserオブジェクトのライフサイクル管理**
   - `create()`: オブジェクト生成
   - `shutdown()`: クリーンアップ
   - `destroy()`: 完全破棄

**参照元**:
- docs/tasks/atelier-guild-rank-phaser/TASK-0260.md
- docs/design/atelier-guild-rank-phaser/core-systems.md

### 二重遷移防止

#### 実装確認ポイント

```typescript
// SceneManager内部
if (this.transitioning) {
  console.warn('Transition already in progress');
  return; // 二重遷移を無視
}
```

#### テストケース

```typescript
it('遷移中に二重遷移要求が無視される', async () => {
  // 同時に複数遷移要求
  eventBus.emit('ui:game:start:requested', { isNewGame: true });
  eventBus.emit('ui:game:start:requested', { isNewGame: true });

  // 警告が出ることを確認
  expect(console.warn).toHaveBeenCalledWith(
    expect.stringContaining('transition')
  );
});
```

**参照元**: docs/tasks/atelier-guild-rank-phaser/TASK-0260.md

---

## 6. テスト実装方針

### テストファイル構成

```
tests/integration/phaser/phase5/
└── SceneTransitionIntegration.test.ts
```

### テストカテゴリ

1. **Boot to Title**: 起動時の初期遷移
2. **Title to Main**: ゲーム開始遷移
3. **Main to SubScenes**: オーバーレイ遷移
4. **Game End Transitions**: ゲーム終了遷移
5. **Edge Cases**: エッジケース・異常系
6. **Transition Animations**: アニメーション確認

### カバレッジ目標

| テスト種別 | 目標カバレッジ |
|-----------|---------------|
| 正常遷移パス | 100% |
| エッジケース | 90% |
| エラー復旧 | 85% |
| **全体** | **80%以上** |

**参照元**: docs/tasks/atelier-guild-rank-phaser/TASK-0260.md

---

## 7. 参照ファイル一覧

### 設計文書

- docs/design/atelier-guild-rank-phaser/architecture.md
- docs/design/atelier-guild-rank-phaser/core-systems.md
- docs/design/atelier-guild-rank-phaser/dataflow.md
- docs/design/atelier-guild-rank-phaser/ui-design/overview.md

### タスク文書

- docs/tasks/atelier-guild-rank-phaser/TASK-0260.md
- docs/tasks/atelier-guild-rank-phaser/TASK-0259.md

### 実装ファイル

- atelier-guild-rank-html/src/game/managers/SceneManager.ts
- atelier-guild-rank-html/src/game/events/EventBus.ts
- atelier-guild-rank-html/src/game/config/SceneKeys.ts

### テストユーティリティ

- atelier-guild-rank-html/tests/utils/phaserTestUtils.ts

### 設定ファイル

- atelier-guild-rank-html/package.json
- atelier-guild-rank-html/vitest.config.ts
- CLAUDE.md

---

## 8. 実装チェックリスト

### テスト実装

- [ ] Boot → Title遷移テスト
- [ ] Title → Main遷移テスト（新規ゲーム）
- [ ] Title → Main遷移テスト（コンティニュー）
- [ ] Main → Shop → Main往復遷移テスト
- [ ] Main → RankUp → Main往復遷移テスト
- [ ] Main → GameOver遷移テスト
- [ ] Main → GameClear遷移テスト
- [ ] GameOver → Title遷移テスト
- [ ] GameClear → Title遷移テスト
- [ ] 二重遷移防止テスト
- [ ] 存在しないシーンへの遷移エラーテスト
- [ ] 状態引き継ぎテスト
- [ ] 遷移アニメーション確認テスト

### 品質確認

- [ ] すべてのテストが成功
- [ ] カバレッジ80%以上達成
- [ ] メモリリークがないことを確認
- [ ] ESLint/Prettierエラーなし
- [ ] TypeScriptコンパイルエラーなし

---

## 9. 備考

### 開発の進め方

1. `/tdd-requirements TASK-0260` - 詳細要件定義
2. `/tdd-testcases` - テストケース作成
3. `/tdd-red` - テスト実装（失敗）
4. `/tdd-green` - 最小実装
5. `/tdd-refactor` - リファクタリング
6. `/tdd-verify-complete` - 品質確認

### トラブルシューティング

#### Phaserシーンが見つからない

```typescript
// SceneManagerにゲームインスタンスを設定
const game = new Phaser.Game(config);
sceneManager.setGame(game);
```

#### イベントが発火しない

```typescript
// EventBusのシングルトンインスタンスを使用
const eventBus = EventBus.getInstance();
```

#### テストでの非同期待機

```typescript
// waitForScene ヘルパー関数を使用
await waitForScene(game, SceneKeys.MAIN);
```

**参照元**: 既存テストコード、開発経験

---

**最終更新**: 2026-01-12
