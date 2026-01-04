# TASK-0102: ゲームフローマネージャー 要件定義書

**タスクID**: TASK-0102
**機能名**: ゲームフローマネージャー（GameFlowManager）
**種別**: TDD
**作成日**: 2026-01-05
**要件名**: atelier-guild-rank

---

## 信頼性レベル凡例

- 🔵 **青信号**: EARS要件定義書・設計文書を参考にしてほぼ推測していない
- 🟡 **黄信号**: EARS要件定義書・設計文書から妥当な推測
- 🔴 **赤信号**: EARS要件定義書・設計文書にない推測

---

## 1. 機能の概要

### 1.1 何をする機能か 🔵

**GameFlowManager**は、ゲーム全体のフロー制御を担当するApplication層のマネージャークラスである。

主な責務:
- **ゲームの初期化**: 新規ゲーム開始時のGameState・PlayerStateの初期化
- **フェーズ遷移管理**: QUEST_ACCEPT → GATHERING → ALCHEMY → DELIVERY の順序でフェーズを進行
- **日数経過処理**: 1日の終了処理（日数進行、行動ポイントリセット、手札補充）
- **ゲーム終了判定**: 昇格ゲージ満タン/日数切れ/Sランク到達の監視
- **昇格試験モード切替**: 昇格ゲージ満タン時に昇格試験モードへ切替

### 1.2 どのような問題を解決するか 🔵

- ゲームの進行状態を一元管理し、複雑なフェーズ遷移ロジックを集約
- 各ドメインサービスの呼び出し順序を制御し、ゲームルールの整合性を保証
- イベントバスを通じて状態変更を通知し、UIや他コンポーネントとの疎結合を実現

### 1.3 想定されるユーザー 🔵

- **Application層ユースケース**: フェーズ遷移、日終了処理などのゲームフロー制御
- **Presentation層UI**: イベント購読によるUI更新トリガー

### 1.4 システム内での位置づけ 🔵

```
Application層
├── GameFlowManager ← このタスク
├── StateManager（TASK-0103）
└── 各種ユースケース（TASK-0104〜）
```

**依存関係**:
- GameState（TASK-0099）: ゲーム進行状態の管理
- PlayerState（TASK-0100）: プレイヤー状態の管理
- EventBus（TASK-0101）: イベント発行

**参照したEARS要件**: REQ-001〜REQ-003（プレイサイクル）
**参照した設計文書**: `docs/design/atelier-guild-rank/architecture.md`, `docs/design/atelier-guild-rank/core-systems.md`

---

## 2. 入力・出力の仕様

### 2.1 GameFlowManagerインターフェース 🔵

```typescript
interface IGameFlowManager {
  // ゲーム初期化
  initializeGame(options?: GameInitOptions): void;

  // フェーズ遷移
  advanceToNextPhase(): void;
  getCurrentPhase(): GamePhase;

  // 日数経過
  endDay(): void;
  getCurrentDay(): number;

  // ゲーム終了判定
  checkGameEndCondition(): GameEndCondition | null;

  // 昇格試験
  canStartPromotionTest(): boolean;
  startPromotionTest(): void;
  isInPromotionTest(): boolean;

  // 状態取得
  getGameState(): GameState;
  getPlayerState(): PlayerState;
}
```

### 2.2 入力パラメータ 🔵

| パラメータ | 型 | 説明 | 制約 |
|-----------|-----|------|------|
| GameInitOptions.rank | GuildRank | 開始ランク | 任意（デフォルト: G） |
| GameInitOptions.gold | number | 初期ゴールド | 任意（デフォルト: 100） |
| GameInitOptions.day | number | 開始日数 | 任意（デフォルト: 1） |

### 2.3 出力値 🔵

| 出力 | 型 | 説明 |
|------|-----|------|
| GameState | GameState | 現在のゲーム状態 |
| PlayerState | PlayerState | 現在のプレイヤー状態 |
| GameEndCondition | 'GAME_CLEAR' \| 'GAME_OVER' \| 'PROMOTION_READY' \| null | ゲーム終了条件 |

### 2.4 発行イベント 🔵

| イベント | 発行タイミング | ペイロード |
|---------|--------------|-----------|
| PHASE_CHANGED | フェーズ遷移時 | { phase: GamePhase } |
| DAY_ADVANCED | 日数進行時 | { day: number } |
| RANK_UP_TEST_STARTED | 昇格試験開始時 | { fromRank, toRank } |
| GAME_CLEAR | Sランク到達時 | {} |
| GAME_OVER | 日数切れ時 | { reason: string } |

**参照した設計文書**: `atelier-guild-rank-html/src/domain/events/GameEvents.ts`

---

## 3. 制約条件

### 3.1 アーキテクチャ制約 🔵

- **配置場所**: `atelier-guild-rank-html/src/application/managers/GameFlowManager.ts`
- **レイヤー依存**: Application層 → Domain層（一方向のみ）
- **イミュータブル設計**: GameState/PlayerStateは新しいインスタンスを返す

### 3.2 フェーズ遷移制約 🔵

- **フェーズ順序は固定**: QUEST_ACCEPT → GATHERING → ALCHEMY → DELIVERY
- **DELIVERYフェーズ後**: 自動的に日終了処理が実行され、QUEST_ACCEPTに戻る
- **逆方向遷移は不可**: フェーズのスキップや巻き戻しは許可しない

### 3.3 日終了処理の実行順序 🔵

```
1. 日数を進める（currentDay + 1）
2. 行動ポイントをリセット（actionPoints = max）
3. ランク残り日数を減らす（rankDaysRemaining - 1）
4. 昇格試験中の場合、試験残り日数を減らす
5. ゲーム終了条件を判定
6. DAY_ADVANCEDイベントを発行
```

### 3.4 ゲーム終了条件 🔵

| 条件 | 判定 | 結果 |
|------|------|------|
| Sランク到達 | rank === GuildRank.S | GAME_CLEAR |
| 昇格ゲージ満タン | promotionGauge >= promotionGaugeMax | PROMOTION_READY |
| ランク維持日数切れ | rankDaysRemaining <= 0 | GAME_OVER |
| 昇格試験日数切れ | isInPromotionTest && promotionTestDaysRemaining <= 0 | GAME_OVER |

### 3.5 パフォーマンス要件 🟡

- 状態更新は同期的に完了すること
- イベント発行は非ブロッキングであること

**参照したEARS要件**: REQ-001（フェーズ制）, REQ-002（日数制限）, NFR-001（パフォーマンス）
**参照した設計文書**: `docs/design/atelier-guild-rank/architecture.md`

---

## 4. 想定される使用例

### 4.1 基本的な使用パターン 🔵

#### ゲーム初期化

```typescript
const eventBus = createEventBus();
const manager = createGameFlowManager({ eventBus });
manager.initializeGame();

// 初期状態確認
expect(manager.getCurrentPhase()).toBe(GamePhase.QUEST_ACCEPT);
expect(manager.getCurrentDay()).toBe(1);
```

#### フェーズ遷移

```typescript
// QUEST_ACCEPT → GATHERING
manager.advanceToNextPhase();
expect(manager.getCurrentPhase()).toBe(GamePhase.GATHERING);

// GATHERING → ALCHEMY
manager.advanceToNextPhase();
expect(manager.getCurrentPhase()).toBe(GamePhase.ALCHEMY);

// ALCHEMY → DELIVERY
manager.advanceToNextPhase();
expect(manager.getCurrentPhase()).toBe(GamePhase.DELIVERY);
```

#### 日終了処理

```typescript
// DELIVERYフェーズ後に日終了
manager.endDay();
expect(manager.getCurrentPhase()).toBe(GamePhase.QUEST_ACCEPT);
expect(manager.getCurrentDay()).toBe(2);
```

### 4.2 イベント購読パターン 🔵

```typescript
eventBus.subscribe(GameEventType.PHASE_CHANGED, (event) => {
  console.log(`フェーズ変更: ${event.payload.phase}`);
});

eventBus.subscribe(GameEventType.DAY_ADVANCED, (event) => {
  console.log(`日数進行: ${event.payload.day}日目`);
});
```

### 4.3 昇格試験モード 🔵

```typescript
// 昇格ゲージ満タン状態で確認
expect(manager.canStartPromotionTest()).toBe(true);

// 昇格試験開始
manager.startPromotionTest();
expect(manager.isInPromotionTest()).toBe(true);
```

### 4.4 エッジケース 🟡

| ケース | 入力 | 期待される動作 |
|--------|------|---------------|
| 初期化前のフェーズ遷移 | advanceToNextPhase() | エラーまたは無視 |
| 昇格試験中の通常日終了 | endDay() | 試験日数も減少 |
| ランク残り日数0での日終了 | endDay() | GAME_OVERイベント発行 |
| 昇格試験日数0での日終了 | endDay() | GAME_OVERイベント発行 |

**参照したEARS要件**: EDGE-001（境界条件）
**参照した設計文書**: `docs/design/atelier-guild-rank/core-systems.md`

---

## 5. EARS要件・設計文書との対応関係

### 5.1 参照した要件定義書

- **参照した機能要件**:
  - REQ-001: フェーズ制（依頼受注→採取→調合→納品）
  - REQ-002: 日数制限システム
  - REQ-003: 昇格試験システム

- **参照した非機能要件**:
  - NFR-001: パフォーマンス（同期的状態更新）

- **参照したEdgeケース**:
  - EDGE-001: 日数切れ時のゲームオーバー
  - EDGE-002: 昇格試験日数切れ

### 5.2 参照した設計文書

| 文書 | 該当セクション |
|------|--------------|
| architecture.md | GameFlowManager設計、システム間依存関係図 |
| core-systems.md | システム一覧、フェーズ遷移フロー |
| GameState.ts | ゲーム状態インターフェース、フェーズ遷移関数 |
| PlayerState.ts | プレイヤー状態インターフェース、状態更新関数 |
| GameEvents.ts | イベントタイプ定義、EventBusインターフェース |

---

## 6. テストケース概要 🔵

タスク定義書に記載されたテストケースに基づく：

```typescript
describe('GameFlowManager', () => {
  it('ゲームを初期化できる');
  it('フェーズを順番に進行できる');
  it('フェーズ遷移時にイベントを発行する');
  it('日数経過を管理できる');
  it('ゲーム終了条件を監視できる');
  it('昇格試験モードに切り替えできる');
});
```

### 追加推奨テストケース 🟡

```typescript
describe('GameFlowManager - 追加テスト', () => {
  describe('ゲーム開始', () => {
    it('初期状態が正しく設定される');
    it('オプションで初期値をカスタマイズできる');
  });

  describe('フェーズ遷移', () => {
    it('QUEST_ACCEPT → GATHERING → ALCHEMY → DELIVERY の順序で遷移する');
    it('DELIVERYフェーズ後にQUEST_ACCEPTに戻る');
  });

  describe('日終了処理', () => {
    it('日数が進む');
    it('行動ポイントがリセットされる');
    it('ランク残り日数が減る');
    it('昇格試験中は試験日数も減る');
  });

  describe('ゲーム終了判定', () => {
    it('昇格ゲージMAXでPROMOTION_READYを返す');
    it('ランク維持日数切れでGAME_OVERイベントを発行する');
    it('Sランク到達でGAME_CLEARイベントを発行する');
    it('昇格試験日数切れでGAME_OVERイベントを発行する');
  });
});
```

---

## 7. 完了条件

- [ ] GameFlowManagerが実装されている
- [ ] ゲームの初期化が正しく動作する
- [ ] フェーズ遷移（QUEST_ACCEPT→GATHERING→ALCHEMY→DELIVERY）が正しく動作する
- [ ] フェーズ遷移時のイベント発行が正しく動作する
- [ ] 日数経過処理が正しく動作する
- [ ] ゲーム終了条件の監視が正しく動作する
- [ ] 昇格試験モード切替が正しく動作する
- [ ] 全テストケースが通過する

---

## 変更履歴

| 日付 | 変更内容 |
|------|---------|
| 2026-01-05 | 初版作成 |
