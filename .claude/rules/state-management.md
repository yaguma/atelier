# 状態管理ルール

## 概要

本プロジェクトでは以下の2つの仕組みで状態管理とコンポーネント間通信を行う。

| 仕組み | 責務 |
|--------|------|
| StateManager | ゲーム状態の一元管理（Single Source of Truth） |
| EventBus | コンポーネント間のイベント駆動通信 |

## StateManager

### 基本原則

- **イミュータブル更新**: 状態は直接変更せず、新しいオブジェクトで置き換える
- **単一の情報源**: ゲーム状態はStateManagerのみが保持
- **読み取り専用公開**: `getState()`は`Readonly<IGameState>`を返す

### 状態取得

```typescript
// DIコンテナから取得
const stateManager = container.resolve<IStateManager>(DI_TOKENS.StateManager);

// 状態取得（イミュータブルなコピー）
const state = stateManager.getState();
console.log(state.currentPhase, state.gold, state.currentDay);
```

### 状態更新

状態更新は専用メソッドを使用する。直接的な状態変更は禁止。

```typescript
// フェーズ変更
stateManager.setPhase(GamePhase.GATHERING);

// リソース操作
stateManager.addGold(100);
stateManager.spendGold(50);
stateManager.spendActionPoints(1);

// 日進行
stateManager.advanceDay();

// 部分更新（必要な場合のみ）
stateManager.updateState({ contribution: 150 });
```

### フェーズ遷移ルール

フェーズ遷移には制約がある。`VALID_PHASE_TRANSITIONS`で定義された遷移のみ許可。

```typescript
// 遷移可能か確認
if (stateManager.canTransitionTo(GamePhase.ALCHEMY)) {
  stateManager.setPhase(GamePhase.ALCHEMY);
}
```

遷移図:
```
QUEST_ACCEPT → GATHERING → ALCHEMY → DELIVERY → QUEST_ACCEPT
                                         ↓
                                    DAY_END
```

## EventBus

### 基本原則

- **疎結合通信**: 発行者は購読者を知らない（Pub/Subパターン）
- **型安全**: `GameEventType`で定義されたイベントのみ使用
- **購読解除必須**: 登録したハンドラーは必ず解除する

### イベント発行

```typescript
// DIコンテナから取得
const eventBus = container.resolve<IEventBus>(DI_TOKENS.EventBus);

// イベント発行
eventBus.emit(GameEventType.PHASE_CHANGED, {
  previousPhase: GamePhase.GATHERING,
  newPhase: GamePhase.ALCHEMY,
});

eventBus.emit(GameEventType.GOLD_CHANGED, {
  previousAmount: 100,
  newAmount: 150,
  delta: 50,
});
```

### イベント購読

```typescript
// 購読（購読解除関数を受け取る）
const unsubscribe = eventBus.on(GameEventType.PHASE_CHANGED, (event) => {
  console.log('Phase changed:', event.payload.newPhase);
});

// 1回だけ購読
eventBus.once(GameEventType.DAY_STARTED, (event) => {
  console.log('Day started:', event.payload.day);
});

// 購読解除
unsubscribe();
```

### イベント種別

主要なイベント種別（`GameEventType`）:

| イベント | 発行タイミング | ペイロード |
|---------|---------------|-----------|
| `PHASE_CHANGED` | フェーズ変更時 | `{ previousPhase, newPhase }` |
| `DAY_STARTED` | 日開始時 | `{ day }` |
| `DAY_ENDED` | 日終了時 | `{ day }` |
| `GOLD_CHANGED` | ゴールド変動時 | `{ previousAmount, newAmount, delta }` |
| `QUEST_ACCEPTED` | 依頼受注時 | `{ quest }` |
| `QUEST_COMPLETED` | 依頼完了時 | `{ quest, reward }` |
| `ITEM_CRAFTED` | アイテム調合時 | `{ item, quality }` |

## シーン間のデータ受け渡し

### 方法1: Phaserのシーンデータ（推奨）

小さなデータはシーン遷移時に渡す。

```typescript
// 遷移元
this.scene.start('ResultScene', {
  stats: { gold: 1000, day: 25 }
});

// 遷移先
init(data: { stats: GameEndStats }): void {
  this.stats = data.stats;
}
```

### 方法2: StateManager経由

ゲーム全体で共有する状態はStateManagerで管理。

```typescript
// 保存
stateManager.updateState({ selectedQuestId: questId });

// 別シーンで取得
const state = stateManager.getState();
const questId = state.selectedQuestId;
```

### 方法3: EventBus経由

非同期通知が必要な場合。

```typescript
// 発行側
eventBus.emit(GameEventType.QUEST_SELECTED, { questId });

// 購読側
eventBus.on(GameEventType.QUEST_SELECTED, (event) => {
  this.showQuestDetail(event.payload.questId);
});
```

## UIコンポーネントでの状態監視

UIコンポーネントはEventBusで状態変更を監視し、表示を更新する。

```typescript
class GoldDisplay extends BaseComponent {
  private unsubscribe?: () => void;

  create(): void {
    // 初期表示
    this.updateDisplay(stateManager.getState().gold);

    // 変更監視
    this.unsubscribe = eventBus.on(GameEventType.GOLD_CHANGED, (event) => {
      this.updateDisplay(event.payload.newAmount);
    });
  }

  destroy(): void {
    // 購読解除（必須）
    this.unsubscribe?.();
    this.container.destroy();
  }
}
```

## 禁止事項

- StateManagerの状態を直接変更する（`state.gold = 100`）
- EventBusの購読を解除せずにコンポーネントを破棄
- シーン間でグローバル変数を使ったデータ共有
- UIコンポーネントから直接StateManagerを更新（Application層経由で行う）
