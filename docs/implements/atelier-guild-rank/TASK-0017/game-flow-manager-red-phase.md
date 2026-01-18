# GameFlowManager - Redフェーズ記録

**作成日**: 2026-01-17
**タスクID**: TASK-0017
**要件名**: atelier-guild-rank
**機能名**: GameFlowManager（ゲームフロー管理）
**フェーズ**: Red（失敗するテスト作成）

---

## 1. 作成したテストケース一覧

### 正常系テストケース（10件）

| テストID | テスト内容 | 信頼性 |
|---------|----------|--------|
| T-0017-01 | 新規ゲーム開始時の初期化処理が正しく実行される | 🔵 |
| T-0017-02 | 日開始処理が正しく実行される | 🔵 |
| T-0017-03 | フェーズが順番に進行する | 🔵 |
| T-0017-04 | endPhase()で次のフェーズに遷移する | 🟡 |
| T-0017-05 | 日終了処理が正しく実行される | 🔵 |
| T-0017-06 | ゲームクリア条件の判定が正しい | 🔵 |
| T-0017-07 | ゲームクリア後に次の日に進まない | 🟡 |
| T-0017-08 | getCurrentPhase()で現在のフェーズを取得できる | 🟡 |
| T-0017-09 | skipPhase()でフェーズをスキップできる | 🟡 |
| T-0017-10 | rest()でAP消費なしで日が進む | 🟡 |

### 異常系テストケース（2件）

| テストID | テスト内容 | 信頼性 |
|---------|----------|--------|
| T-0017-E01 | 無効なフェーズ遷移でエラーをスローする | 🟡 |
| T-0017-E02 | 不正なセーブデータでエラーをスローする | 🟡 |

### 境界値テストケース（2件）

| テストID | テスト内容 | 信頼性 |
|---------|----------|--------|
| T-0017-B01 | 残り日数が0でSランク未到達の場合、ゲームオーバー判定 | 🔵 |
| T-0017-B02 | 残り日数が1でSランク未到達の場合、ゲームは継続 | 🟡 |

**合計**: 14件のテストケース

---

## 2. テストコードの全文

**テストファイルパス**: `atelier-guild-rank/tests/unit/application/services/game-flow-manager.test.ts`

### テストコードの特徴

- **テストフレームワーク**: Vitest 4.x
- **モック戦略**: Vitestの組み込みモック機能を使用
- **モック対象**: IStateManager, IDeckService, IQuestService, IEventBus
- **日本語コメント**: テスト目的、内容、期待動作、信頼性レベルを記載
- **Given-When-Then パターン**: テスト構造を明確化

### 主要なテストケースの説明

#### T-0017-01: 新規ゲーム開始（🔵）

```typescript
it('T-0017-01: 新規ゲーム開始時の初期化処理が正しく実行される', () => {
  gameFlowManager.startNewGame();

  expect(mockStateManager.initialize).toHaveBeenCalledTimes(1);
  expect(mockDeckService.initialize).toHaveBeenCalledTimes(1);
  expect(mockEventBus.emit).toHaveBeenCalledWith(
    GameEventType.DAY_STARTED,
    expect.objectContaining({ day: 1 }),
  );
});
```

**検証内容**:
- StateManager.initialize()が1回呼び出される
- DeckService.initialize()が1回呼び出される
- DAY_STARTEDイベントが発行される

#### T-0017-02: 日開始処理（🔵）

```typescript
it('T-0017-02: 日開始処理が正しく実行される', () => {
  gameFlowManager.startDay();

  expect(mockStateManager.updateState).toHaveBeenCalledWith(
    expect.objectContaining({ actionPoints: 3 }),
  );
  expect(mockQuestService.generateDailyQuests).toHaveBeenCalledTimes(1);
  expect(mockEventBus.emit).toHaveBeenCalledWith(
    GameEventType.DAY_STARTED,
    expect.objectContaining({ day: 1 }),
  );
  expect(mockStateManager.setPhase).toHaveBeenCalledWith(GamePhase.QUEST_ACCEPT);
});
```

**検証内容**:
- APが3に回復される
- 日次依頼が生成される
- DAY_STARTEDイベントが発行される
- 依頼受注フェーズに遷移する

#### T-0017-05: 日終了処理（🔵）

```typescript
it('T-0017-05: 日終了処理が正しく実行される', () => {
  mockStateManager.getState = vi.fn(() => ({
    // ... ゲーム継続状態
  }));

  gameFlowManager.endDay();

  expect(mockQuestService.updateDeadlines).toHaveBeenCalledTimes(1);
  expect(mockStateManager.updateState).toHaveBeenCalledWith(
    expect.objectContaining({
      remainingDays: 149,
      currentDay: 2,
    }),
  );
  expect(mockEventBus.emit).toHaveBeenCalledWith(
    GameEventType.DAY_ENDED,
    expect.objectContaining({
      failedQuests: [],
      remainingDays: 149,
    }),
  );
});
```

**検証内容**:
- 期限切れ依頼が処理される
- 残り日数が-1、現在の日が+1される
- DAY_ENDEDイベントが発行される

#### T-0017-06: ゲームクリア判定（🔵）

```typescript
it('T-0017-06: ゲームクリア条件の判定が正しい', () => {
  mockStateManager.getState = vi.fn(() => ({
    currentRank: GuildRank.S,
    // ... Sランク到達状態
  }));

  const result = gameFlowManager.checkGameClear();

  expect(result).not.toBeNull();
  expect(result?.type).toBe('game_clear');
  expect(result?.reason).toBe('s_rank_achieved');
  expect(result?.finalRank).toBe(GuildRank.S);
  expect(result?.totalDays).toBe(100);
});
```

**検証内容**:
- Sランク到達時にGameEndConditionを返す
- typeが'game_clear'である
- reasonが's_rank_achieved'である
- finalRankがSである

#### T-0017-B01: ゲームオーバー判定（🔵）

```typescript
it('T-0017-B01: 残り日数が0でSランク未到達の場合、ゲームオーバー判定', () => {
  mockStateManager.getState = vi.fn(() => ({
    currentRank: GuildRank.A,
    remainingDays: 0,
    currentDay: 150,
    // ... 時間切れ状態
  }));

  const result = gameFlowManager.checkGameOver();

  expect(result).not.toBeNull();
  expect(result?.type).toBe('game_over');
  expect(result?.reason).toBe('time_expired');
  expect(result?.finalRank).toBe(GuildRank.A);
  expect(result?.totalDays).toBe(150);
});
```

**検証内容**:
- 残り日数0でSランク未到達時にGameEndConditionを返す
- typeが'game_over'である
- reasonが'time_expired'である
- finalRankがAである

---

## 3. 期待される失敗内容

### テスト実行結果

```
> atelier-guild-rank@0.1.0 test /home/user/atelier/atelier-guild-rank
> vitest "game-flow-manager.test.ts"

 ❯ tests/unit/application/services/game-flow-manager.test.ts (14 tests | 14 failed)
       × T-0017-01: 新規ゲーム開始時の初期化処理が正しく実行される
       × T-0017-02: 日開始処理が正しく実行される
       × T-0017-03: フェーズが順番に進行する
       × T-0017-04: endPhase()で次のフェーズに遷移する
       × T-0017-05: 日終了処理が正しく実行される
       × T-0017-06: ゲームクリア条件の判定が正しい
       × T-0017-07: ゲームクリア後に次の日に進まない
       × T-0017-08: getCurrentPhase()で現在のフェーズを取得できる
       × T-0017-09: skipPhase()でフェーズをスキップできる
       × T-0017-10: rest()でAP消費なしで日が進む
       × T-0017-E01: 無効なフェーズ遷移でエラーをスローする
       × T-0017-E02: 不正なセーブデータでエラーをスローする
       × T-0017-B01: 残り日数が0でSランク未到達の場合、ゲームオーバー判定
       × T-0017-B02: 残り日数が1でSランク未到達の場合、ゲームは継続

 FAIL  tests/unit/application/services/game-flow-manager.test.ts > GameFlowManager > 正常系テストケース > T-0017-01: 新規ゲーム開始時の初期化処理が正しく実行される
TypeError: Cannot read properties of undefined (reading 'startNewGame')
```

### 失敗理由

すべてのテストが失敗しています。これは**期待通りの動作**です。

- **原因**: GameFlowManagerクラスが未実装
- **エラー内容**: `TypeError: Cannot read properties of undefined (reading 'メソッド名')`
- **理由**: `gameFlowManager`がundefinedであるため、すべてのメソッド呼び出しが失敗

この失敗は、TDD Redフェーズの目的である「失敗するテストを作成する」を達成しています。

---

## 4. Greenフェーズで実装すべき内容

### 4.1 インターフェース定義

**ファイル**: `atelier-guild-rank/src/application/services/game-flow-manager.interface.ts`

```typescript
export interface IGameFlowManager {
  // ゲーム開始
  startNewGame(): void;
  continueGame(saveData: ISaveData): void;

  // 日の進行
  startDay(): void;
  endDay(): void;

  // フェーズ進行
  startPhase(phase: GamePhase): void;
  endPhase(): void;
  skipPhase(): void;

  // ゲーム終了判定
  checkGameOver(): GameEndCondition | null;
  checkGameClear(): GameEndCondition | null;

  // アクション
  rest(): void;

  // 状態取得
  getCurrentPhase(): GamePhase;
  canAdvancePhase(): boolean;
}

export interface GameEndCondition {
  type: 'game_over' | 'game_clear';
  reason: string;
  finalRank: GuildRank;
  totalDays: number;
}
```

### 4.2 実装クラス

**ファイル**: `atelier-guild-rank/src/application/services/game-flow-manager.ts`

#### コンストラクタ

```typescript
export class GameFlowManager implements IGameFlowManager {
  constructor(
    private stateManager: IStateManager,
    private deckService: IDeckService,
    private questService: IQuestService,
    private eventBus: IEventBus,
  ) {}
}
```

#### 新規ゲーム開始

```typescript
startNewGame(): void {
  this.stateManager.initialize();
  this.deckService.initialize(INITIAL_DECK);
  this.startDay();
}
```

#### 日開始処理

```typescript
startDay(): void {
  this.stateManager.updateState({
    actionPoints: this.stateManager.getState().maxActionPoints,
  });
  this.questService.generateDailyQuests(
    this.stateManager.getState().currentRank
  );
  this.eventBus.emit(GameEventType.DAY_STARTED, {
    day: this.stateManager.getState().currentDay,
  });
  this.startPhase(GamePhase.QUEST_ACCEPT);
}
```

#### 日終了処理

```typescript
endDay(): void {
  const failedQuests = this.questService.updateDeadlines();

  const state = this.stateManager.getState();
  this.stateManager.updateState({
    remainingDays: state.remainingDays - 1,
    currentDay: state.currentDay + 1,
  });

  this.eventBus.emit(GameEventType.DAY_ENDED, {
    failedQuests,
    remainingDays: state.remainingDays - 1,
  });

  const gameOver = this.checkGameOver();
  const gameClear = this.checkGameClear();

  if (gameOver) {
    this.eventBus.emit(GameEventType.GAME_OVER, gameOver);
  } else if (gameClear) {
    this.eventBus.emit(GameEventType.GAME_CLEAR, gameClear);
  } else {
    this.startDay();
  }
}
```

#### ゲーム終了判定

```typescript
checkGameOver(): GameEndCondition | null {
  const state = this.stateManager.getState();

  if (state.remainingDays <= 0 && state.currentRank !== GuildRank.S) {
    return {
      type: 'game_over',
      reason: 'time_expired',
      finalRank: state.currentRank,
      totalDays: state.currentDay,
    };
  }

  return null;
}

checkGameClear(): GameEndCondition | null {
  const state = this.stateManager.getState();

  if (state.currentRank === GuildRank.S) {
    return {
      type: 'game_clear',
      reason: 's_rank_achieved',
      finalRank: GuildRank.S,
      totalDays: state.currentDay,
    };
  }

  return null;
}
```

### 4.3 その他のメソッド

- **startPhase(phase: GamePhase)**: StateManager.setPhase()を呼び出す
- **endPhase()**: 現在のフェーズから次のフェーズに遷移
- **skipPhase()**: endPhase()と同様だが、スキップとして記録
- **rest()**: AP消費なしでendDay()を呼び出す
- **getCurrentPhase()**: StateManagerから現在のフェーズを取得
- **canAdvancePhase()**: 現在のフェーズの必須アクションが完了しているかをチェック

---

## 5. 品質判定結果

### 品質判定: ✅ 高品質

- ✅ **テスト実行**: 実行可能で失敗することを確認済み
- ✅ **期待値**: 明確で具体的（14件すべてのテストケースで明確な期待値を定義）
- ✅ **アサーション**: 適切（各テストケースで複数のアサーションを使用）
- ✅ **実装方針**: 明確（各メソッドの実装方針を明示）
- ✅ **信頼性レベル**: 🔵（青信号）が6件、🟡（黄信号）が8件

### 信頼性レベル分布

- **🔵 青信号**: 6件（43%）- 要件定義書・設計文書に明確に記載
  - T-0017-01, T-0017-02, T-0017-03, T-0017-05, T-0017-06, T-0017-B01
- **🟡 黄信号**: 8件（57%）- 要件定義書から妥当に推測
  - T-0017-04, T-0017-07, T-0017-08, T-0017-09, T-0017-10, T-0017-E01, T-0017-E02, T-0017-B02
- **🔴 赤信号**: 0件（0%）

### テストカバレッジ目標

- **正常系テストケース**: 10件
- **異常系テストケース**: 2件
- **境界値テストケース**: 2件
- **合計**: 14件（目標10件以上を達成）

### コード品質

- **日本語コメント**: すべてのテストケースに適切な日本語コメントを記載
- **Given-When-Then**: テスト構造を明確化
- **モック戦略**: 依存サービスをモックし、GameFlowManagerの動作のみをテスト
- **アサーション**: 各テストケースで複数の検証ポイントを設定

---

## 6. 次のステップ

Redフェーズが完了しました。次のお勧めステップ:

```bash
/tsumiki:tdd-green atelier-guild-rank TASK-0017
```

でGreenフェーズ（最小実装）を開始します。

---

**最終更新**: 2026-01-17
