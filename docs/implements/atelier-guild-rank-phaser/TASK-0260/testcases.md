# TASK-0260: 全シーン遷移統合テスト - テストケース定義書

**タスクID**: TASK-0260
**タスク名**: 全シーン遷移統合テスト
**タスクタイプ**: TDD
**推定工数**: 4時間
**作成日**: 2026-01-12

---

## 1. テストファイル情報

### テストファイルパス

```
tests/integration/phaser/phase5/SceneTransitionIntegration.test.ts
```

### テストフレームワーク

- **Vitest** 2.1.0+
- **jsdom** (DOMエミュレーション)
- **@vitest/coverage-v8** (カバレッジ計測)

### テストユーティリティ

- `tests/utils/phaserTestUtils.ts`
  - `createTestGame()`: Phaserゲームインスタンス作成
  - `waitForScene()`: シーン遷移完了待機

---

## 2. テストカテゴリ一覧

| カテゴリID | カテゴリ名 | テストケース数 | 優先度 | カバレッジ目標 |
|-----------|----------|--------------|-------|--------------|
| TC-01 | Boot to Title | 1 | 🔴 最高 | 100% |
| TC-02 | Title to Main | 2 | 🔴 最高 | 100% |
| TC-03 | Main to SubScenes | 4 | 🔴 最高 | 100% |
| TC-04 | Game End Transitions | 4 | 🔴 最高 | 100% |
| TC-05 | Edge Cases | 4 | 🟡 高 | 90% |
| TC-06 | Transition Animations | 2 | 🟢 中 | 80% |
| **合計** | - | **17** | - | **80%以上** |

**参照元**:
- docs/implements/atelier-guild-rank-phaser/TASK-0260/requirements.md - 6. テスト方針
- docs/implements/atelier-guild-rank-phaser/TASK-0260/note.md - 6. テスト実装方針

---

## 3. 正常系テストケース

### TC-01: Boot to Title（起動→タイトル遷移）

#### TC-01-01: BootSceneからTitleSceneへ自動遷移する

**優先度**: 🔴 最高

**テスト目的**: ゲーム起動時のアセット読み込み完了後、自動的にタイトル画面へ遷移することを検証する

**前提条件**:
- Phaserゲームインスタンスが正常に作成されていること
- BootSceneが正常に起動していること

**テスト手順**:
1. ゲームインスタンスを作成する
2. BootSceneの起動を待機する
3. BootSceneの`complete`イベントを発火させる（アセット読み込み完了をシミュレート）
4. TitleSceneへの遷移を待機する

**期待される結果**:
- TitleSceneがアクティブになること
- BootSceneが停止していること
- シーン遷移完了イベント（`scene:transition:complete`）が発火されること

**エラー条件**:
- 5秒以内に遷移が完了しない場合、タイムアウトエラー

**参照元**:
- docs/implements/atelier-guild-rank-phaser/TASK-0260/requirements.md - 4.1 Boot → Title遷移テスト
- docs/design/atelier-guild-rank-phaser/architecture.md - 4.3 シーン遷移図

```typescript
it('TC-01-01: BootSceneからTitleSceneへ自動遷移する', async () => {
  // Arrange
  await waitForScene(game, SceneKeys.BOOT);

  // Act - アセット読み込み完了をシミュレート
  const bootScene = game.scene.getScene(SceneKeys.BOOT);
  bootScene.events.emit('complete');

  // Assert
  await waitForScene(game, SceneKeys.TITLE);
  expect(game.scene.isActive(SceneKeys.TITLE)).toBe(true);
  expect(game.scene.isActive(SceneKeys.BOOT)).toBe(false);
});
```

---

### TC-02: Title to Main（タイトル→メインゲーム遷移）

#### TC-02-01: 新規ゲーム開始でMainSceneへ遷移する

**優先度**: 🔴 最高

**テスト目的**: タイトル画面から「新規ゲーム」を選択したときにメインゲームへ遷移することを検証する

**前提条件**:
- TitleSceneがアクティブであること
- EventBusが正常に動作していること

**テスト手順**:
1. TitleSceneの起動を待機する
2. `ui:game:start:requested`イベントを発火する（isNewGame: true）
3. MainSceneへの遷移を待機する

**期待される結果**:
- MainSceneがアクティブになること
- TitleSceneが停止していること
- 新規ゲーム用の初期状態が設定されていること（日数1、ゴールド100、ランクG）
- シーン遷移完了イベント（`scene:transition:complete`）が発火されること

**エラー条件**:
- 5秒以内に遷移が完了しない場合、タイムアウトエラー

**参照元**:
- docs/implements/atelier-guild-rank-phaser/TASK-0260/requirements.md - 4.2 Title → Main遷移テスト（新規ゲーム）
- docs/design/atelier-guild-rank-phaser/core-systems.md - 2.3 イベント定義

```typescript
it('TC-02-01: 新規ゲーム開始でMainSceneへ遷移する', async () => {
  // Arrange
  await waitForScene(game, SceneKeys.TITLE);

  // Act
  eventBus.emit('ui:game:start:requested', { isNewGame: true });

  // Assert
  await waitForScene(game, SceneKeys.MAIN);
  expect(game.scene.isActive(SceneKeys.MAIN)).toBe(true);
  expect(game.scene.isActive(SceneKeys.TITLE)).toBe(false);

  // 初期状態の確認
  const stateManager = game.registry.get('stateManager');
  const progress = stateManager.getProgressData();
  expect(progress.currentDay).toBe(1);
  expect(stateManager.getPlayerData().gold).toBe(100);
  expect(stateManager.getPlayerData().rank).toBe('G');
});
```

#### TC-02-02: コンティニューでMainSceneへ遷移する

**優先度**: 🔴 最高

**テスト目的**: タイトル画面から「コンティニュー」を選択したときにセーブデータを読み込んでメインゲームへ遷移することを検証する

**前提条件**:
- TitleSceneがアクティブであること
- セーブデータがlocalStorageに保存されていること
- EventBusが正常に動作していること

**テスト手順**:
1. セーブデータをlocalStorageに作成する（日数5のセーブデータ）
2. TitleSceneの起動を待機する
3. `ui:game:continue:requested`イベントを発火する（slotId: 1）
4. MainSceneへの遷移を待機する

**期待される結果**:
- MainSceneがアクティブになること
- TitleSceneが停止していること
- セーブデータの状態が正しく復元されていること（日数5）
- シーン遷移完了イベント（`scene:transition:complete`）が発火されること

**エラー条件**:
- 5秒以内に遷移が完了しない場合、タイムアウトエラー
- セーブデータが不正な場合、エラーイベント発火

**参照元**:
- docs/implements/atelier-guild-rank-phaser/TASK-0260/requirements.md - 4.3 Title → Main遷移テスト（コンティニュー）
- docs/design/atelier-guild-rank-phaser/dataflow.md - 4.2 ロードフロー

```typescript
it('TC-02-02: コンティニューでMainSceneへ遷移する', async () => {
  // Arrange - セーブデータを作成
  const saveData = {
    version: '1.0.0',
    timestamp: Date.now(),
    playtime: 0,
    state: JSON.stringify({ progress: { currentDay: 5 } }),
  };
  localStorage.setItem('atelier_guild_rank_save_1', JSON.stringify(saveData));

  await waitForScene(game, SceneKeys.TITLE);

  // Act
  eventBus.emit('ui:game:continue:requested', { slotId: 1 });

  // Assert
  await waitForScene(game, SceneKeys.MAIN);
  expect(game.scene.isActive(SceneKeys.MAIN)).toBe(true);
  expect(game.scene.isActive(SceneKeys.TITLE)).toBe(false);

  // セーブデータの復元確認
  const stateManager = game.registry.get('stateManager');
  const progress = stateManager.getProgressData();
  expect(progress.currentDay).toBe(5);
});
```

---

### TC-03: Main to SubScenes（メイン→サブシーン遷移）

#### TC-03-01: MainSceneからShopSceneへオーバーレイ表示する

**優先度**: 🔴 最高

**テスト目的**: メインゲームからショップをオーバーレイ表示できることを検証する

**前提条件**:
- MainSceneがアクティブであること
- ショップフェーズ（買い物フェーズ）であること
- EventBusが正常に動作していること

**テスト手順**:
1. MainSceneの起動を待機する
2. `ui:shop:open:requested`イベントを発火する
3. ShopSceneへの遷移を待機する

**期待される結果**:
- ShopSceneがアクティブになること
- MainSceneも引き続きアクティブであること（オーバーレイのため）
- オーバーレイ開始イベント（`scene:overlay:opened`）が発火されること

**エラー条件**:
- 5秒以内に遷移が完了しない場合、タイムアウトエラー

**参照元**:
- docs/implements/atelier-guild-rank-phaser/TASK-0260/note.md - 3. 関連実装 - SceneManager
- docs/design/atelier-guild-rank-phaser/architecture.md - 4.1 シーン一覧

```typescript
it('TC-03-01: MainSceneからShopSceneへオーバーレイ表示する', async () => {
  // Arrange
  await waitForScene(game, SceneKeys.TITLE);
  eventBus.emit('ui:game:start:requested', { isNewGame: true });
  await waitForScene(game, SceneKeys.MAIN);

  const overlaySpy = vi.fn();
  eventBus.on('scene:overlay:opened', overlaySpy);

  // Act
  eventBus.emit('ui:shop:open:requested');

  // Assert
  await waitForScene(game, SceneKeys.SHOP);
  expect(game.scene.isActive(SceneKeys.SHOP)).toBe(true);
  expect(game.scene.isActive(SceneKeys.MAIN)).toBe(true); // オーバーレイなので両方アクティブ
  expect(overlaySpy).toHaveBeenCalledWith(
    expect.objectContaining({ sceneKey: SceneKeys.SHOP })
  );
});
```

#### TC-03-02: ShopSceneからMainSceneへ戻る

**優先度**: 🔴 最高

**テスト目的**: ショップを閉じてメインゲームへ戻ることができることを検証する

**前提条件**:
- MainSceneとShopSceneがアクティブであること
- EventBusが正常に動作していること

**テスト手順**:
1. ShopSceneがアクティブな状態にする
2. `ui:shop:close:requested`イベントを発火する
3. ShopSceneが停止することを確認する

**期待される結果**:
- MainSceneがアクティブのまま残ること
- ShopSceneが停止すること
- オーバーレイ終了イベント（`scene:overlay:closed`）が発火されること

**エラー条件**:
- 5秒以内に遷移が完了しない場合、タイムアウトエラー

**参照元**:
- docs/implements/atelier-guild-rank-phaser/TASK-0260/note.md - 3. 関連実装 - SceneManager
- docs/design/atelier-guild-rank-phaser/architecture.md - 4.3 シーン遷移図

```typescript
it('TC-03-02: ShopSceneからMainSceneへ戻る', async () => {
  // Arrange
  await waitForScene(game, SceneKeys.TITLE);
  eventBus.emit('ui:game:start:requested', { isNewGame: true });
  await waitForScene(game, SceneKeys.MAIN);
  eventBus.emit('ui:shop:open:requested');
  await waitForScene(game, SceneKeys.SHOP);

  const overlayClosedSpy = vi.fn();
  eventBus.on('scene:overlay:closed', overlayClosedSpy);

  // Act
  eventBus.emit('ui:shop:close:requested');

  // Assert
  await vi.waitFor(() => {
    expect(game.scene.isActive(SceneKeys.SHOP)).toBe(false);
  });
  expect(game.scene.isActive(SceneKeys.MAIN)).toBe(true);
  expect(overlayClosedSpy).toHaveBeenCalledWith(
    expect.objectContaining({ sceneKey: SceneKeys.SHOP })
  );
});
```

#### TC-03-03: MainSceneからRankUpSceneへオーバーレイ表示する

**優先度**: 🔴 最高

**テスト目的**: メインゲームから昇格試験をオーバーレイ表示できることを検証する

**前提条件**:
- MainSceneがアクティブであること
- 昇格ゲージが満タンであること
- EventBusが正常に動作していること

**テスト手順**:
1. MainSceneの起動を待機する
2. `ui:rankup:open:requested`イベントを発火する
3. RankUpSceneへの遷移を待機する

**期待される結果**:
- RankUpSceneがアクティブになること
- MainSceneも引き続きアクティブであること（オーバーレイのため）
- オーバーレイ開始イベント（`scene:overlay:opened`）が発火されること

**エラー条件**:
- 5秒以内に遷移が完了しない場合、タイムアウトエラー

**参照元**:
- docs/design/atelier-guild-rank-phaser/architecture.md - 4.1 シーン一覧
- docs/design/atelier-guild-rank-phaser/ui-design/overview.md - 画面遷移仕様

```typescript
it('TC-03-03: MainSceneからRankUpSceneへオーバーレイ表示する', async () => {
  // Arrange
  await waitForScene(game, SceneKeys.TITLE);
  eventBus.emit('ui:game:start:requested', { isNewGame: true });
  await waitForScene(game, SceneKeys.MAIN);

  const overlaySpy = vi.fn();
  eventBus.on('scene:overlay:opened', overlaySpy);

  // Act
  eventBus.emit('ui:rankup:open:requested');

  // Assert
  await waitForScene(game, SceneKeys.RANK_UP);
  expect(game.scene.isActive(SceneKeys.RANK_UP)).toBe(true);
  expect(game.scene.isActive(SceneKeys.MAIN)).toBe(true); // オーバーレイなので両方アクティブ
  expect(overlaySpy).toHaveBeenCalledWith(
    expect.objectContaining({ sceneKey: SceneKeys.RANK_UP })
  );
});
```

#### TC-03-04: RankUpSceneからMainSceneへ戻る

**優先度**: 🔴 最高

**テスト目的**: 昇格試験を終了してメインゲームへ戻ることができることを検証する

**前提条件**:
- MainSceneとRankUpSceneがアクティブであること
- EventBusが正常に動作していること

**テスト手順**:
1. RankUpSceneがアクティブな状態にする
2. `ui:rankup:close:requested`イベントを発火する
3. RankUpSceneが停止することを確認する

**期待される結果**:
- MainSceneがアクティブのまま残ること
- RankUpSceneが停止すること
- オーバーレイ終了イベント（`scene:overlay:closed`）が発火されること

**エラー条件**:
- 5秒以内に遷移が完了しない場合、タイムアウトエラー

**参照元**:
- docs/design/atelier-guild-rank-phaser/architecture.md - 4.3 シーン遷移図
- docs/design/atelier-guild-rank-phaser/ui-design/overview.md - 画面遷移仕様

```typescript
it('TC-03-04: RankUpSceneからMainSceneへ戻る', async () => {
  // Arrange
  await waitForScene(game, SceneKeys.TITLE);
  eventBus.emit('ui:game:start:requested', { isNewGame: true });
  await waitForScene(game, SceneKeys.MAIN);
  eventBus.emit('ui:rankup:open:requested');
  await waitForScene(game, SceneKeys.RANK_UP);

  const overlayClosedSpy = vi.fn();
  eventBus.on('scene:overlay:closed', overlayClosedSpy);

  // Act
  eventBus.emit('ui:rankup:close:requested');

  // Assert
  await vi.waitFor(() => {
    expect(game.scene.isActive(SceneKeys.RANK_UP)).toBe(false);
  });
  expect(game.scene.isActive(SceneKeys.MAIN)).toBe(true);
  expect(overlayClosedSpy).toHaveBeenCalledWith(
    expect.objectContaining({ sceneKey: SceneKeys.RANK_UP })
  );
});
```

---

### TC-04: Game End Transitions（ゲーム終了遷移）

#### TC-04-01: MainSceneからGameOverSceneへ遷移する（日数切れ）

**優先度**: 🔴 最高

**テスト目的**: 日数切れでゲームオーバー画面へ遷移することを検証する

**前提条件**:
- MainSceneがアクティブであること
- 日数が最大日数に達していること
- ランクがS未満であること
- EventBusが正常に動作していること

**テスト手順**:
1. MainSceneの起動を待機する
2. 日数を最大日数（60日）に設定する
3. `ui:day:end:requested`イベントを発火する
4. GameOverSceneへの遷移を待機する

**期待される結果**:
- GameOverSceneがアクティブになること
- MainSceneが停止していること
- シーン遷移完了イベント（`scene:transition:complete`）が発火されること
- ゲームオーバー理由が「日数切れ」であること

**エラー条件**:
- 5秒以内に遷移が完了しない場合、タイムアウトエラー

**参照元**:
- docs/design/atelier-guild-rank-phaser/architecture.md - 4.3 シーン遷移図
- docs/design/atelier-guild-rank-phaser/ui-design/overview.md - 画面遷移仕様

```typescript
it('TC-04-01: MainSceneからGameOverSceneへ遷移する（日数切れ）', async () => {
  // Arrange
  await waitForScene(game, SceneKeys.TITLE);
  eventBus.emit('ui:game:start:requested', { isNewGame: true });
  await waitForScene(game, SceneKeys.MAIN);

  const stateManager = game.registry.get('stateManager');
  stateManager.updateProgress({ currentDay: 60, maxDay: 60 });

  // Act
  eventBus.emit('ui:day:end:requested');

  // Assert
  await waitForScene(game, SceneKeys.GAME_OVER);
  expect(game.scene.isActive(SceneKeys.GAME_OVER)).toBe(true);
  expect(game.scene.isActive(SceneKeys.MAIN)).toBe(false);
});
```

#### TC-04-02: MainSceneからGameClearSceneへ遷移する（Sランク到達）

**優先度**: 🔴 最高

**テスト目的**: Sランク到達でゲームクリア画面へ遷移することを検証する

**前提条件**:
- MainSceneがアクティブであること
- ランクがSに到達したこと
- EventBusが正常に動作していること

**テスト手順**:
1. MainSceneの起動を待機する
2. ランクをSに設定する
3. `ui:rank:updated`イベントを発火する
4. GameClearSceneへの遷移を待機する

**期待される結果**:
- GameClearSceneがアクティブになること
- MainSceneが停止していること
- シーン遷移完了イベント（`scene:transition:complete`）が発火されること
- クリア理由が「Sランク到達」であること

**エラー条件**:
- 5秒以内に遷移が完了しない場合、タイムアウトエラー

**参照元**:
- docs/design/atelier-guild-rank-phaser/architecture.md - 4.3 シーン遷移図
- docs/design/atelier-guild-rank-phaser/ui-design/overview.md - 画面遷移仕様

```typescript
it('TC-04-02: MainSceneからGameClearSceneへ遷移する（Sランク到達）', async () => {
  // Arrange
  await waitForScene(game, SceneKeys.TITLE);
  eventBus.emit('ui:game:start:requested', { isNewGame: true });
  await waitForScene(game, SceneKeys.MAIN);

  const stateManager = game.registry.get('stateManager');
  stateManager.updatePlayer({ rank: 'S' });

  // Act
  eventBus.emit('ui:rank:updated', { newRank: 'S' });

  // Assert
  await waitForScene(game, SceneKeys.GAME_CLEAR);
  expect(game.scene.isActive(SceneKeys.GAME_CLEAR)).toBe(true);
  expect(game.scene.isActive(SceneKeys.MAIN)).toBe(false);
});
```

#### TC-04-03: GameOverSceneからTitleSceneへ遷移する

**優先度**: 🔴 最高

**テスト目的**: ゲームオーバー画面からタイトル画面へ戻ることができることを検証する

**前提条件**:
- GameOverSceneがアクティブであること
- EventBusが正常に動作していること

**テスト手順**:
1. GameOverSceneがアクティブな状態にする
2. `ui:title:return:requested`イベントを発火する
3. TitleSceneへの遷移を待機する

**期待される結果**:
- TitleSceneがアクティブになること
- GameOverSceneが停止していること
- シーン遷移完了イベント（`scene:transition:complete`）が発火されること

**エラー条件**:
- 5秒以内に遷移が完了しない場合、タイムアウトエラー

**参照元**:
- docs/design/atelier-guild-rank-phaser/architecture.md - 4.3 シーン遷移図
- docs/design/atelier-guild-rank-phaser/ui-design/overview.md - 画面遷移仕様

```typescript
it('TC-04-03: GameOverSceneからTitleSceneへ遷移する', async () => {
  // Arrange - GameOverSceneまで遷移
  await waitForScene(game, SceneKeys.TITLE);
  eventBus.emit('ui:game:start:requested', { isNewGame: true });
  await waitForScene(game, SceneKeys.MAIN);

  const stateManager = game.registry.get('stateManager');
  stateManager.updateProgress({ currentDay: 60, maxDay: 60 });
  eventBus.emit('ui:day:end:requested');
  await waitForScene(game, SceneKeys.GAME_OVER);

  // Act
  eventBus.emit('ui:title:return:requested');

  // Assert
  await waitForScene(game, SceneKeys.TITLE);
  expect(game.scene.isActive(SceneKeys.TITLE)).toBe(true);
  expect(game.scene.isActive(SceneKeys.GAME_OVER)).toBe(false);
});
```

#### TC-04-04: GameClearSceneからTitleSceneへ遷移する

**優先度**: 🔴 最高

**テスト目的**: ゲームクリア画面からタイトル画面へ戻ることができることを検証する

**前提条件**:
- GameClearSceneがアクティブであること
- EventBusが正常に動作していること

**テスト手順**:
1. GameClearSceneがアクティブな状態にする
2. `ui:title:return:requested`イベントを発火する
3. TitleSceneへの遷移を待機する

**期待される結果**:
- TitleSceneがアクティブになること
- GameClearSceneが停止していること
- シーン遷移完了イベント（`scene:transition:complete`）が発火されること

**エラー条件**:
- 5秒以内に遷移が完了しない場合、タイムアウトエラー

**参照元**:
- docs/design/atelier-guild-rank-phaser/architecture.md - 4.3 シーン遷移図
- docs/design/atelier-guild-rank-phaser/ui-design/overview.md - 画面遷移仕様

```typescript
it('TC-04-04: GameClearSceneからTitleSceneへ遷移する', async () => {
  // Arrange - GameClearSceneまで遷移
  await waitForScene(game, SceneKeys.TITLE);
  eventBus.emit('ui:game:start:requested', { isNewGame: true });
  await waitForScene(game, SceneKeys.MAIN);

  const stateManager = game.registry.get('stateManager');
  stateManager.updatePlayer({ rank: 'S' });
  eventBus.emit('ui:rank:updated', { newRank: 'S' });
  await waitForScene(game, SceneKeys.GAME_CLEAR);

  // Act
  eventBus.emit('ui:title:return:requested');

  // Assert
  await waitForScene(game, SceneKeys.TITLE);
  expect(game.scene.isActive(SceneKeys.TITLE)).toBe(true);
  expect(game.scene.isActive(SceneKeys.GAME_CLEAR)).toBe(false);
});
```

---

## 4. 異常系テストケース

### TC-05: Edge Cases（エッジケース・境界値）

#### TC-05-01: 遷移中に二重遷移要求が無視される

**優先度**: 🟡 高

**テスト目的**: シーン遷移中に別の遷移要求が来た場合、二重遷移を防止できることを検証する

**前提条件**:
- TitleSceneがアクティブであること
- EventBusが正常に動作していること

**テスト手順**:
1. TitleSceneの起動を待機する
2. console.warnをスパイする
3. `ui:game:start:requested`イベントを2回連続で発火する
4. 警告メッセージが出力されることを確認する

**期待される結果**:
- MainSceneへ遷移すること
- 2回目の遷移要求が無視されること
- console.warnに「transition」を含むメッセージが出力されること

**エラー条件**:
- 二重遷移が発生してしまう場合

**参照元**:
- docs/implements/atelier-guild-rank-phaser/TASK-0260/note.md - 5. 注意事項 - 二重遷移防止
- docs/implements/atelier-guild-rank-phaser/TASK-0260/requirements.md - 4. エッジケース - 1. 二重遷移防止テスト

```typescript
it('TC-05-01: 遷移中に二重遷移要求が無視される', async () => {
  // Arrange
  await waitForScene(game, SceneKeys.TITLE);
  const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

  // Act - 同時に複数遷移要求
  eventBus.emit('ui:game:start:requested', { isNewGame: true });
  eventBus.emit('ui:game:start:requested', { isNewGame: true });

  // Assert
  await waitForScene(game, SceneKeys.MAIN);
  expect(game.scene.isActive(SceneKeys.MAIN)).toBe(true);
  expect(consoleSpy).toHaveBeenCalledWith(
    expect.stringContaining('transition')
  );

  consoleSpy.mockRestore();
});
```

#### TC-05-02: 存在しないシーンへの遷移要求がエラーを出す

**優先度**: 🟡 高

**テスト目的**: 未定義のシーンキーへの遷移要求時にエラーが正しく処理されることを検証する

**前提条件**:
- TitleSceneがアクティブであること
- EventBusが正常に動作していること

**テスト手順**:
1. TitleSceneの起動を待機する
2. `app:error:occurred`イベントのコールバックを登録する
3. 存在しないシーンへの遷移を試みる（'NonExistentScene'）
4. エラーイベントが発火されることを確認する

**期待される結果**:
- エラーイベント（`app:error:occurred`）が発火されること
- エラーメッセージに「scene」や「not found」が含まれること
- 現在のシーン（TitleScene）がアクティブのまま残ること

**エラー条件**:
- エラーが適切に処理されず、アプリケーションがクラッシュする場合

**参照元**:
- docs/implements/atelier-guild-rank-phaser/TASK-0260/requirements.md - 4. エッジケース - 2. 存在しないシーンへの遷移エラーテスト
- docs/design/atelier-guild-rank-phaser/dataflow.md - 9. エラーハンドリングフロー

```typescript
it('TC-05-02: 存在しないシーンへの遷移要求がエラーを出す', async () => {
  // Arrange
  await waitForScene(game, SceneKeys.TITLE);
  const errorCallback = vi.fn();
  eventBus.on('app:error:occurred', errorCallback);

  // Act
  const sceneManager = game.registry.get('sceneManager');
  await sceneManager.goTo('NonExistentScene' as any);

  // Assert
  expect(errorCallback).toHaveBeenCalled();
  expect(errorCallback).toHaveBeenCalledWith(
    expect.objectContaining({
      message: expect.stringMatching(/scene|not found/i),
    })
  );
  expect(game.scene.isActive(SceneKeys.TITLE)).toBe(true);
});
```

#### TC-05-03: オーバーレイシーン表示中も背景シーンの状態が保持される

**優先度**: 🟡 高

**テスト目的**: ショップなどのオーバーレイシーン表示中も、背景のメインシーンの状態が正しく保持されることを検証する

**前提条件**:
- MainSceneがアクティブであること
- EventBusが正常に動作していること

**テスト手順**:
1. MainSceneの起動を待機する
2. プレイヤーのゴールドを999に設定する
3. ShopSceneをオーバーレイ表示する
4. ShopSceneを閉じる
5. プレイヤーのゴールドが999のまま保持されていることを確認する

**期待される結果**:
- オーバーレイ表示前後でプレイヤーの状態（ゴールド）が保持されること
- MainSceneの状態が変更されていないこと

**エラー条件**:
- 状態がリセットされてしまう場合
- 状態が不正な値になってしまう場合

**参照元**:
- docs/implements/atelier-guild-rank-phaser/TASK-0260/note.md - 5. 注意事項 - 状態の引き継ぎ検証
- docs/implements/atelier-guild-rank-phaser/TASK-0260/requirements.md - 4. エッジケース - 3. 状態引き継ぎテスト

```typescript
it('TC-05-03: オーバーレイシーン表示中も背景シーンの状態が保持される', async () => {
  // Arrange
  await waitForScene(game, SceneKeys.TITLE);
  eventBus.emit('ui:game:start:requested', { isNewGame: true });
  await waitForScene(game, SceneKeys.MAIN);

  const stateManager = game.registry.get('stateManager');
  stateManager.updatePlayer({ gold: 999 });

  // Act - ショップへ遷移して戻る
  eventBus.emit('ui:shop:open:requested');
  await waitForScene(game, SceneKeys.SHOP);
  eventBus.emit('ui:shop:close:requested');
  await vi.waitFor(() => {
    expect(game.scene.isActive(SceneKeys.SHOP)).toBe(false);
  });

  // Assert
  const player = stateManager.getPlayerData();
  expect(player.gold).toBe(999);
  expect(game.scene.isActive(SceneKeys.MAIN)).toBe(true);
});
```

#### TC-05-04: メモリリークが発生しないことを確認する

**優先度**: 🟡 高

**テスト目的**: シーン遷移後にイベントリスナーが正しく解放され、メモリリークが発生しないことを検証する

**前提条件**:
- ゲームインスタンスが正常に作成されていること
- EventBusが正常に動作していること

**テスト手順**:
1. ゲームインスタンスを作成する
2. 複数のシーン遷移を行う（Title → Main → Shop → Main → GameOver → Title）
3. ゲームインスタンスを破棄する
4. EventBusをクリアする
5. イベントリスナーが0件であることを確認する

**期待される結果**:
- afterEach()後にEventBusのリスナー数が0になること
- console.errorやconsole.warnにメモリ関連の警告が出ないこと

**エラー条件**:
- リスナーが残っている場合
- メモリリークの警告が出る場合

**参照元**:
- docs/implements/atelier-guild-rank-phaser/TASK-0260/note.md - 5. 注意事項 - メモリリークの確認
- docs/implements/atelier-guild-rank-phaser/TASK-0260/requirements.md - 4. エラーケース - 1. メモリリーク検証

```typescript
it('TC-05-04: メモリリークが発生しないことを確認する', async () => {
  // Arrange & Act - 複数のシーン遷移を実行
  await waitForScene(game, SceneKeys.TITLE);
  eventBus.emit('ui:game:start:requested', { isNewGame: true });
  await waitForScene(game, SceneKeys.MAIN);
  eventBus.emit('ui:shop:open:requested');
  await waitForScene(game, SceneKeys.SHOP);
  eventBus.emit('ui:shop:close:requested');
  await vi.waitFor(() => {
    expect(game.scene.isActive(SceneKeys.SHOP)).toBe(false);
  });

  // ゲームオーバーへ遷移
  const stateManager = game.registry.get('stateManager');
  stateManager.updateProgress({ currentDay: 60, maxDay: 60 });
  eventBus.emit('ui:day:end:requested');
  await waitForScene(game, SceneKeys.GAME_OVER);

  // タイトルへ戻る
  eventBus.emit('ui:title:return:requested');
  await waitForScene(game, SceneKeys.TITLE);

  // Assert - クリーンアップはafterEach()で行われる
  // ここでは遷移が正常に完了したことだけを確認
  expect(game.scene.isActive(SceneKeys.TITLE)).toBe(true);
});

// afterEach()でメモリリーク確認
afterEach(() => {
  // シーン破棄
  game.destroy(true);

  // イベントバスクリア
  eventBus.clear();

  // リスナーが残っていないことを確認
  const listenerCount = eventBus.listenerCount();
  expect(listenerCount).toBe(0);
});
```

---

## 5. 境界値テストケース

### TC-06: Transition Animations（遷移アニメーション）

#### TC-06-01: 遷移時にフェードアニメーションが実行される

**優先度**: 🟢 中

**テスト目的**: シーン遷移時にフェードアニメーションが正しく実行されることを検証する

**前提条件**:
- TitleSceneがアクティブであること
- SceneManagerが正常に動作していること

**テスト手順**:
1. TitleSceneの起動を待機する
2. SceneManagerのgoToメソッドをスパイする
3. `ui:game:start:requested`イベントを発火する
4. goToメソッドがtransitionパラメータ付きで呼ばれることを確認する

**期待される結果**:
- SceneManagerのgoToメソッドがtransitionパラメータを含む引数で呼ばれること
- transitionパラメータが有効な文字列（'fade'など）であること

**エラー条件**:
- transitionパラメータが渡されていない場合

**参照元**:
- docs/implements/atelier-guild-rank-phaser/TASK-0260/requirements.md - 4. エラーケース - 2. 遷移アニメーション確認
- docs/design/atelier-guild-rank-phaser/core-systems.md - 3.3 シーン遷移パターン

```typescript
it('TC-06-01: 遷移時にフェードアニメーションが実行される', async () => {
  // Arrange
  await waitForScene(game, SceneKeys.TITLE);
  const sceneManager = game.registry.get('sceneManager');
  const goToSpy = vi.spyOn(sceneManager, 'goTo');

  // Act
  eventBus.emit('ui:game:start:requested', { isNewGame: true });

  // Assert
  await waitForScene(game, SceneKeys.MAIN);
  expect(goToSpy).toHaveBeenCalledWith(
    SceneKeys.MAIN,
    expect.any(Object),
    expect.objectContaining({ transition: expect.any(String) })
  );
});
```

#### TC-06-02: シーン遷移完了イベントが正しいペイロードで発火される

**優先度**: 🟢 中

**テスト目的**: シーン遷移完了時にイベントが正しいペイロード（from/toシーン情報）で発火されることを検証する

**前提条件**:
- TitleSceneがアクティブであること
- EventBusが正常に動作していること

**テスト手順**:
1. TitleSceneの起動を待機する
2. `scene:transition:complete`イベントのコールバックを登録する
3. `ui:game:start:requested`イベントを発火する
4. `scene:transition:complete`イベントが正しいペイロードで発火されることを確認する

**期待される結果**:
- `scene:transition:complete`イベントが発火されること
- ペイロードに`from: SceneKeys.TITLE`が含まれること
- ペイロードに`to: SceneKeys.MAIN`が含まれること

**エラー条件**:
- イベントが発火されない場合
- ペイロードが不正な場合

**参照元**:
- docs/implements/atelier-guild-rank-phaser/TASK-0260/note.md - 3. 関連実装 - イベント駆動通信（EventBus）
- docs/design/atelier-guild-rank-phaser/core-systems.md - 2.3 イベント定義

```typescript
it('TC-06-02: シーン遷移完了イベントが正しいペイロードで発火される', async () => {
  // Arrange
  await waitForScene(game, SceneKeys.TITLE);
  const transitionCompleteSpy = vi.fn();
  eventBus.on('scene:transition:complete', transitionCompleteSpy);

  // Act
  eventBus.emit('ui:game:start:requested', { isNewGame: true });

  // Assert
  await waitForScene(game, SceneKeys.MAIN);
  expect(transitionCompleteSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      from: SceneKeys.TITLE,
      to: SceneKeys.MAIN,
    })
  );
});
```

---

## 6. テスト優先度マトリクス

| 優先度 | テストケース数 | カテゴリ | 実装順序 |
|-------|--------------|---------|---------|
| 🔴 最高 | 11 | TC-01, TC-02, TC-03, TC-04 | 1. 正常系から実装 |
| 🟡 高 | 4 | TC-05 | 2. エッジケースを実装 |
| 🟢 中 | 2 | TC-06 | 3. アニメーション確認を実装 |
| **合計** | **17** | - | - |

**実装方針**:
1. **第1優先**: 正常系テストケース（TC-01〜TC-04）を完全に実装
   - Boot → Title → Main → SubScenes → GameEnd の一連の遷移を確認
2. **第2優先**: エッジケーステストケース（TC-05）を実装
   - 二重遷移防止、存在しないシーン、状態引き継ぎ、メモリリークを確認
3. **第3優先**: アニメーション確認テストケース（TC-06）を実装
   - フェードアニメーション、イベントペイロードを確認

**参照元**:
- docs/implements/atelier-guild-rank-phaser/TASK-0260/requirements.md - 6. テスト方針 - テスト実装順序
- docs/implements/atelier-guild-rank-phaser/TASK-0260/note.md - 6. テスト実装方針

---

## 7. カバレッジ目標

### 全体カバレッジ目標

| 指標 | 目標値 | 説明 |
|-----|-------|------|
| Lines | 80%以上 | コード行カバレッジ |
| Functions | 80%以上 | 関数カバレッジ |
| Branches | 80%以上 | 分岐カバレッジ |
| Statements | 80%以上 | ステートメントカバレッジ |

### カテゴリ別カバレッジ目標

| カテゴリ | 目標カバレッジ | 理由 |
|---------|--------------|------|
| Boot to Title | 100% | 起動時の必須フロー |
| Title to Main | 100% | ゲーム開始の必須フロー |
| Main to SubScenes | 100% | オーバーレイの必須フロー |
| Game End Transitions | 100% | ゲーム終了の必須フロー |
| Edge Cases | 90% | エッジケース網羅 |
| Transition Animations | 80% | UI/UX確認 |

**参照元**:
- docs/implements/atelier-guild-rank-phaser/TASK-0260/requirements.md - 6. テスト方針 - カバレッジ計測
- docs/implements/atelier-guild-rank-phaser/TASK-0260/note.md - 1. 技術スタック - テスト環境設定

---

## 8. テストセットアップ

### beforeEach() - 各テスト前の準備

```typescript
describe('Scene Transition Integration', () => {
  let game: Phaser.Game;
  let eventBus: EventBus;
  let sceneManager: SceneManager;
  let stateManager: StateManager;

  beforeEach(async () => {
    // ゲームインスタンス作成
    const testSetup = await createTestGame();
    game = testSetup.game;
    eventBus = testSetup.eventBus;
    sceneManager = game.registry.get('sceneManager');
    stateManager = game.registry.get('stateManager');

    // BootSceneの起動を待つ
    await waitForScene(game, SceneKeys.BOOT);
  });

  // テストケースはここに記述
});
```

### afterEach() - 各テスト後のクリーンアップ

```typescript
afterEach(() => {
  // ゲームインスタンス破棄
  if (game) {
    game.destroy(true);
  }

  // イベントバスクリア
  if (eventBus) {
    eventBus.clear();
  }

  // localStorage クリア
  localStorage.clear();

  // スパイのモック解除
  vi.restoreAllMocks();
});
```

**参照元**:
- docs/implements/atelier-guild-rank-phaser/TASK-0260/requirements.md - 6. テスト方針 - クリーンアップ戦略
- atelier-guild-rank-html/tests/integration/phaser/phase4/SubSceneIntegration.test.ts

---

## 9. ヘルパー関数

### waitForScene() - シーン遷移完了待機

```typescript
/**
 * 指定したシーンがアクティブになるまで待機する
 * @param game Phaserゲームインスタンス
 * @param sceneKey 待機するシーンキー
 * @param timeout タイムアウト時間（ミリ秒）
 * @returns Promise<void>
 */
async function waitForScene(
  game: Phaser.Game,
  sceneKey: string,
  timeout: number = 5000
): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (game.scene.isActive(sceneKey)) {
        clearInterval(checkInterval);
        resolve();
      }
      if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        reject(new Error(`Timeout waiting for scene: ${sceneKey}`));
      }
    }, 100);
  });
}
```

### createTestGame() - テスト用ゲームインスタンス作成

```typescript
/**
 * テスト用のPhaserゲームインスタンスを作成する
 * @returns Promise<{ game: Phaser.Game; eventBus: EventBus }>
 */
async function createTestGame(): Promise<{
  game: Phaser.Game;
  eventBus: EventBus;
}> {
  const eventBus = EventBus.getInstance();
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.HEADLESS,
    width: 800,
    height: 600,
    scene: [BootScene, TitleScene, MainScene, ShopScene, RankUpScene, GameOverScene, GameClearScene],
    parent: 'phaser-game',
  };

  const game = new Phaser.Game(config);

  // SceneManagerを登録
  const sceneManager = new SceneManager(game, eventBus);
  game.registry.set('sceneManager', sceneManager);

  // StateManagerを登録
  const stateManager = new StateManager();
  game.registry.set('stateManager', stateManager);

  return { game, eventBus };
}
```

**参照元**:
- docs/implements/atelier-guild-rank-phaser/TASK-0260/requirements.md - 6. テスト方針 - 非同期処理の待機
- atelier-guild-rank-html/tests/utils/phaserTestUtils.ts

---

## 10. テスト実行コマンド

### 単一ファイル実行

```bash
cd atelier-guild-rank-html
npm run test tests/integration/phaser/phase5/SceneTransitionIntegration.test.ts
```

### カバレッジ付きテスト

```bash
cd atelier-guild-rank-html
npm run test:coverage tests/integration/phaser/phase5/SceneTransitionIntegration.test.ts
```

### ウォッチモード

```bash
cd atelier-guild-rank-html
npm run test -- --watch tests/integration/phaser/phase5/SceneTransitionIntegration.test.ts
```

**参照元**:
- CLAUDE.md - HTML版 開発コマンド
- docs/implements/atelier-guild-rank-phaser/TASK-0260/note.md - 1. 技術スタック

---

## 11. 完了条件

### テスト実装完了の定義

- [ ] 全17テストケースが実装されている
- [ ] すべてのテストが成功する
- [ ] カバレッジ80%以上を達成している
- [ ] ESLint/Prettierエラーがない
- [ ] TypeScriptコンパイルエラーがない

### 品質確認完了の定義

- [ ] メモリリークが発生しないことを確認
- [ ] 非同期処理の競合状態が発生しないことを確認
- [ ] 状態の引き継ぎが正しく動作することを確認
- [ ] エラーハンドリングが適切に動作することを確認

**参照元**:
- docs/implements/atelier-guild-rank-phaser/TASK-0260/requirements.md - 7. 実装チェックリスト
- docs/implements/atelier-guild-rank-phaser/TASK-0260/note.md - 8. 実装チェックリスト

---

## 12. 参照ファイル一覧

### 設計文書

- docs/design/atelier-guild-rank-phaser/architecture.md
- docs/design/atelier-guild-rank-phaser/core-systems.md
- docs/design/atelier-guild-rank-phaser/dataflow.md
- docs/design/atelier-guild-rank-phaser/ui-design/overview.md

### タスク文書

- docs/tasks/atelier-guild-rank-phaser/TASK-0260.md
- docs/implements/atelier-guild-rank-phaser/TASK-0260/note.md
- docs/implements/atelier-guild-rank-phaser/TASK-0260/requirements.md

### 実装ファイル（テスト対象）

- atelier-guild-rank-html/src/game/managers/SceneManager.ts
- atelier-guild-rank-html/src/game/events/EventBus.ts
- atelier-guild-rank-html/src/game/config/SceneKeys.ts
- atelier-guild-rank-html/src/game/scenes/*.ts

### テストユーティリティ

- atelier-guild-rank-html/tests/utils/phaserTestUtils.ts

### 既存テストコード（参考）

- atelier-guild-rank-html/tests/integration/phaser/phase4/SubSceneIntegration.test.ts
- atelier-guild-rank-html/tests/integration/phaser/phase4/ApplicationLayerIntegration.test.ts
- atelier-guild-rank-html/tests/integration/phaser/phase4/SaveLoadIntegration.test.ts

### 設定ファイル

- atelier-guild-rank-html/package.json
- atelier-guild-rank-html/vitest.config.ts
- CLAUDE.md

---

## 13. 次のステップ

1. **次のTDDフェーズ**: `/tsumiki:tdd-red atelier-guild-rank-phaser TASK-0260`
   - このテストケース定義書に基づいて失敗するテストを作成する
2. **Green**: テストを通す最小実装
3. **Refactor**: リファクタリング
4. **Review**: コードレビュー
5. **Verify**: 完了確認

**参照元**:
- CLAUDE.md - TDD開発フロー
- docs/implements/atelier-guild-rank-phaser/TASK-0260/note.md - 9. 備考 - 開発の進め方

---

**最終更新**: 2026-01-12
