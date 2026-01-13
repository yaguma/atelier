# TASK-0262: 1ターンサイクル統合テスト（後半） - テストケース定義書

**タスクID**: TASK-0262
**機能名**: 1ターンサイクル統合テスト（後半）
**タスクタイプ**: TDD
**作成日**: 2026-01-13

---

## 1. テスト対象の概要

### 1.1 機能概要 🔵

1ターン（1日）のゲームサイクルの後半部分（調合フェーズ、納品フェーズ、ターン終了処理）が正しく動作することを検証する統合テストを実装する。

**信頼性レベル**: 🔵 青信号（要件定義書に明確な記載あり）

**参照元**:
- `docs/implements/atelier-guild-rank-phaser/TASK-0262/turn-cycle-second-half-requirements.md`
- `docs/tasks/atelier-guild-rank-phaser/TASK-0262.md`

---

## 2. テスト環境・技術スタック

### 2.1 使用技術 🔵

- **プログラミング言語**: TypeScript 5.0+
  - **言語選択の理由**: 型安全性が高く、大規模なゲーム開発に適している
  - **テストに適した機能**: 型推論によるテストコードの補完、インターフェースによる契約定義

- **テストフレームワーク**: Vitest
  - **フレームワーク選択の理由**: Viteベースで高速、TypeScript完全対応、ESM対応
  - **テスト実行環境**: Node.js環境（jsdom）、ヘッドレスモード

- **テストユーティリティ**: `tests/utils/phaserTestUtils.ts`
  - `createTestGame()`: テストゲームインスタンス作成
  - `waitForPhase()`: フェーズ遷移待機
  - `createMockEventBus()`: モックEventBus作成
  - `createMockStateManager()`: モックStateManager作成

**信頼性レベル**: 🔵 青信号（note.md に明確な記載あり）

**参照元**:
- `docs/implements/atelier-guild-rank-phaser/TASK-0262/note.md` (1. 技術スタック)
- `tests/utils/phaserTestUtils.ts`

### 2.2 テストファイル配置 🔵

- **テストファイルパス**: `tests/integration/phaser/phase5/TurnCycleSecondHalf.test.ts`
- **テストファイル形式**: `{TestName}.test.ts`
- **テストディレクトリ**: `tests/integration/phaser/phase5/`

**信頼性レベル**: 🔵 青信号（note.md に明確な記載あり）

**参照元**:
- `docs/implements/atelier-guild-rank-phaser/TASK-0262/note.md` (2. 開発ルール)

---

## 3. 正常系テストケース（基本的な動作）

### 3.1 調合フェーズ - 正常系テストケース

#### TC-01: レシピカードが手札に表示される 🔵

- **テスト名**: レシピカードが手札に表示される
  - **何をテストするか**: 調合フェーズに遷移すると、手札にレシピカード（type === 'recipe'）が存在することを確認する
  - **期待される動作**: 手札の中にレシピカードが1枚以上存在する

- **入力値**: なし（StateManagerの初期状態に依存）
  - **入力データの意味**: 調合フェーズ開始時のデッキ状態
  - **初期状態**: `beforeEach()` で調合フェーズに遷移済み、手札にレシピカードを設定

- **期待される結果**: `deck.hand.filter(c => c.type === 'recipe').length > 0`
  - **期待結果の理由**: 調合フェーズではプレイヤーがレシピカードを使用してアイテムを作成するため、手札にレシピカードが存在する必要がある
  - **確認ポイント**: 手札配列の中にtype === 'recipe'のカードが存在する

- **テストの目的**: 調合フェーズでレシピカードが正しく表示されることを確認する
  - **確認ポイント**: デッキシステムとフェーズ遷移が正常に連携していること

- 🔵 **信頼性レベル**: 青信号（要件定義書・タスクファイルに明確な記載あり）

**参照元**:
- `docs/implements/atelier-guild-rank-phaser/TASK-0262/turn-cycle-second-half-requirements.md` (4.1.1 調合フェーズのテストケース)
- `docs/tasks/atelier-guild-rank-phaser/TASK-0262.md` (Alchemy Phase - TC-103)

---

#### TC-02: アイテムを調合できる 🔵

- **テスト名**: アイテムを調合できる
  - **何をテストするか**: レシピカードと素材を選択して調合を実行すると、インベントリに新規アイテムが追加されることを確認する
  - **期待される動作**: `craftedItems` に新規アイテムが追加される

- **入力値**:
  ```typescript
  {
    recipeCardId: 'recipe_potion_001',
    materialIds: ['herb_001', 'herb_001', 'water_001']
  }
  ```
  - **入力データの意味**: 使用するレシピカードIDと、選択した素材IDのリスト
  - **レシピ要件**: `herb_001` x2個、`water_001` x1個 → `potion_001`（回復薬）を作成

- **期待される結果**: `inventory.craftedItems.length > initialCraftedItems`
  - **期待結果の理由**: 調合が成功すると、レシピに基づいて新しいアイテムがインベントリに追加される
  - **確認ポイント**: 調合前後でcraftedItemsの要素数が増加している

- **テストの目的**: 調合システムが正常に動作し、アイテムが作成されることを確認する
  - **確認ポイント**: EventBus → AlchemyUseCase → AlchemyService → StateManagerの一連のデータフローが正常に動作する

- 🔵 **信頼性レベル**: 青信号（要件定義書・タスクファイルに詳細なコード例あり）

**参照元**:
- `docs/implements/atelier-guild-rank-phaser/TASK-0262/turn-cycle-second-half-requirements.md` (4.1.1 調合フェーズのテストケース)
- `docs/tasks/atelier-guild-rank-phaser/TASK-0262.md` (Alchemy Phase - TC-110)
- `docs/design/atelier-guild-rank-phaser/dataflow.md` (2.3 調合フロー)

---

#### TC-03: 調合で素材が消費される 🔵

- **テスト名**: 調合で素材が消費される
  - **何をテストするか**: 調合を実行すると、使用した素材がインベントリから減少することを確認する
  - **期待される動作**: 指定した素材が `materials` から削除または数量が減少する

- **入力値**:
  ```typescript
  {
    recipeCardId: 'recipe_potion_001',
    materialIds: ['herb_001', 'herb_001', 'water_001']
  }
  ```
  - **入力データの意味**: 調合で消費する素材のリスト
  - **消費量**: `herb_001` を2個、`water_001` を1個消費

- **期待される結果**: `herb.quantity === initialHerb.quantity - 2`
  - **期待結果の理由**: 調合には素材が必要であり、使用した素材はインベントリから消費される
  - **確認ポイント**: 調合前後で素材の数量が正確に減少している

- **テストの目的**: リソース管理が正常に動作し、素材が適切に消費されることを確認する
  - **確認ポイント**: インベントリの整合性が保たれる

- 🔵 **信頼性レベル**: 青信号（要件定義書・タスクファイルに詳細なコード例あり）

**参照元**:
- `docs/implements/atelier-guild-rank-phaser/TASK-0262/turn-cycle-second-half-requirements.md` (4.1.1 調合フェーズのテストケース)
- `docs/tasks/atelier-guild-rank-phaser/TASK-0262.md` (Alchemy Phase - TC-127)

---

#### TC-04: 調合結果に品質が反映される 🔵

- **テスト名**: 調合結果に品質が反映される
  - **何をテストするか**: 調合で作成されたアイテムに品質値が設定されることを確認する
  - **期待される動作**: 作成されたアイテムの `quality` プロパティが0より大きい

- **入力値**:
  ```typescript
  {
    recipeCardId: 'recipe_potion_001',
    materialIds: ['herb_001', 'herb_001', 'water_001']
  }
  ```
  - **入力データの意味**: 品質を持つ素材を使用して調合する
  - **素材品質**: `herb_001` (quality: 80), `water_001` (quality: 70)

- **期待される結果**: `craftedItem.quality > 0`
  - **期待結果の理由**: 素材の品質がアイテムの品質に影響を与えるため、調合結果には品質値が設定される
  - **確認ポイント**: 作成されたアイテムのqualityプロパティが存在し、0より大きい

- **テストの目的**: 品質システムが正常に動作し、素材の品質がアイテムに反映されることを確認する
  - **確認ポイント**: AlchemyServiceの品質計算ロジックが正しく実行される

- 🔵 **信頼性レベル**: 青信号（要件定義書・タスクファイルに詳細なコード例あり）

**参照元**:
- `docs/implements/atelier-guild-rank-phaser/TASK-0262/turn-cycle-second-half-requirements.md` (4.1.1 調合フェーズのテストケース)
- `docs/tasks/atelier-guild-rank-phaser/TASK-0262.md` (Alchemy Phase - TC-167)

---

#### TC-05: 調合フェーズ完了で納品フェーズに遷移する 🔵

- **テスト名**: 調合フェーズ完了で納品フェーズに遷移する
  - **何をテストするか**: 調合フェーズ完了イベントを発火すると、納品フェーズに遷移することを確認する
  - **期待される動作**: 現在のフェーズが `delivery` に変更される

- **入力値**:
  ```typescript
  eventBus.emit('ui:phase:complete', { phase: 'alchemy' });
  ```
  - **入力データの意味**: フェーズ完了を通知するイベント
  - **実行タイミング**: 調合フェーズのすべての操作が完了した後

- **期待される結果**: `stateManager.getProgress().currentPhase === 'delivery'`
  - **期待結果の理由**: ゲームフローに従い、調合フェーズの次は納品フェーズである
  - **確認ポイント**: フェーズ遷移が設計通りに動作する

- **テストの目的**: フェーズ遷移システムが正常に動作することを確認する
  - **確認ポイント**: EventBusイベントによるフェーズ制御が正しく機能する

- 🔵 **信頼性レベル**: 青信号（要件定義書・タスクファイルに詳細なコード例あり）

**参照元**:
- `docs/implements/atelier-guild-rank-phaser/TASK-0262/turn-cycle-second-half-requirements.md` (4.1.1 調合フェーズのテストケース)
- `docs/tasks/atelier-guild-rank-phaser/TASK-0262.md` (Alchemy Phase - TC-183)
- `docs/design/atelier-guild-rank-phaser/dataflow.md` (5. フェーズ遷移フロー)

---

### 3.2 納品フェーズ - 正常系テストケース

#### TC-06: 受注中の依頼が表示される 🔵

- **テスト名**: 受注中の依頼が表示される
  - **何をテストするか**: 納品フェーズに遷移すると、受注済み依頼リストが表示されることを確認する
  - **期待される動作**: `quests.accepted.length > 0`

- **入力値**: なし（StateManagerの初期状態に依存）
  - **入力データの意味**: 納品フェーズ開始時の依頼状態
  - **初期状態**: `beforeEach()` で受注済み依頼を設定

- **期待される結果**: `quests.accepted.length > 0`
  - **期待結果の理由**: 納品フェーズでは受注済みの依頼を完了するため、受注済みリストに依頼が存在する必要がある
  - **確認ポイント**: accepted配列に依頼オブジェクトが含まれている

- **テストの目的**: 納品フェーズで依頼が正しく表示されることを確認する
  - **確認ポイント**: クエストシステムとフェーズ遷移が正常に連携している

- 🔵 **信頼性レベル**: 青信号（要件定義書・タスクファイルに詳細なコード例あり）

**参照元**:
- `docs/implements/atelier-guild-rank-phaser/TASK-0262/turn-cycle-second-half-requirements.md` (4.2.1 納品フェーズのテストケース)
- `docs/tasks/atelier-guild-rank-phaser/TASK-0262.md` (Delivery Phase - TC-223)

---

#### TC-07: 依頼を納品できる 🔵

- **テスト名**: 依頼を納品できる
  - **何をテストするか**: 依頼を選択して納品を実行すると、依頼が `accepted` から `completed` に移動することを確認する
  - **期待される動作**: 依頼が受注済みリストから削除され、完了済みリストに追加される

- **入力値**:
  ```typescript
  {
    questId: 'quest_001',
    itemIds: ['potion_001']
  }
  ```
  - **入力データの意味**: 納品する依頼IDと、提出するアイテムIDのリスト
  - **依頼要件**: `potion_001`（回復薬）x1個を納品

- **期待される結果**:
  - `quests.completed` に `quest_001` が含まれる
  - `quests.accepted` から `quest_001` が削除される
  - **期待結果の理由**: 納品が成功すると、依頼は完了状態になり、リストが更新される
  - **確認ポイント**: 依頼状態の遷移が正確に行われる

- **テストの目的**: 納品システムが正常に動作し、依頼が完了することを確認する
  - **確認ポイント**: EventBus → QuestUseCase → QuestService → StateManagerの一連のデータフローが正常に動作する

- 🔵 **信頼性レベル**: 青信号（要件定義書・タスクファイルに詳細なコード例あり）

**参照元**:
- `docs/implements/atelier-guild-rank-phaser/TASK-0262/turn-cycle-second-half-requirements.md` (4.2.1 納品フェーズのテストケース)
- `docs/tasks/atelier-guild-rank-phaser/TASK-0262.md` (Delivery Phase - TC-229)
- `docs/design/atelier-guild-rank-phaser/dataflow.md` (2.4 納品フロー)

---

#### TC-08: 納品で報酬を獲得する 🔵

- **テスト名**: 納品で報酬を獲得する
  - **何をテストするか**: 依頼を納品すると、報酬（ゴールド・経験値）が獲得されることを確認する
  - **期待される動作**: プレイヤーの `gold` と `exp` が増加する

- **入力値**:
  ```typescript
  {
    questId: 'quest_001',
    itemIds: ['potion_001']
  }
  ```
  - **入力データの意味**: 納品する依頼（報酬: gold 100, exp 50）
  - **報酬内容**: ゴールド +100、経験値 +50

- **期待される結果**:
  - `player.gold === initialGold + 100`
  - `player.exp === initialExp + 50`
  - **期待結果の理由**: 依頼を完了すると、報酬が自動的にプレイヤーに付与される
  - **確認ポイント**: 報酬の計算と付与が正確に行われる

- **テストの目的**: 報酬システムが正常に動作し、プレイヤーが報酬を獲得できることを確認する
  - **確認ポイント**: QuestServiceの報酬付与ロジックが正しく実行される

- 🔵 **信頼性レベル**: 青信号（要件定義書・タスクファイルに詳細なコード例あり）

**参照元**:
- `docs/implements/atelier-guild-rank-phaser/TASK-0262/turn-cycle-second-half-requirements.md` (4.2.1 納品フェーズのテストケース)
- `docs/tasks/atelier-guild-rank-phaser/TASK-0262.md` (Delivery Phase - TC-251)

---

#### TC-09: 納品でアイテムが消費される 🔵

- **テスト名**: 納品でアイテムが消費される
  - **何をテストするか**: 依頼を納品すると、提出したアイテムがインベントリから削除されることを確認する
  - **期待される動作**: 指定したアイテムが `craftedItems` から削除される

- **入力値**:
  ```typescript
  {
    questId: 'quest_001',
    itemIds: ['potion_001']
  }
  ```
  - **入力データの意味**: 納品で消費するアイテムのリスト
  - **消費量**: `potion_001` を1個消費

- **期待される結果**: `inventory.craftedItems.find(i => i.id === 'potion_001') === undefined`
  - **期待結果の理由**: 依頼にアイテムを納品すると、そのアイテムはインベントリから削除される
  - **確認ポイント**: 納品後にcraftedItemsから該当アイテムが存在しない

- **テストの目的**: リソース管理が正常に動作し、アイテムが適切に消費されることを確認する
  - **確認ポイント**: インベントリの整合性が保たれる

- 🔵 **信頼性レベル**: 青信号（要件定義書・タスクファイルに詳細なコード例あり）

**参照元**:
- `docs/implements/atelier-guild-rank-phaser/TASK-0262/turn-cycle-second-half-requirements.md` (4.2.1 納品フェーズのテストケース)
- `docs/tasks/atelier-guild-rank-phaser/TASK-0262.md` (Delivery Phase - TC-270)

---

### 3.3 ターン終了 - 正常系テストケース

#### TC-10: フェーズ完了でターンが終了する 🔵

- **テスト名**: フェーズ完了でターンが終了する
  - **何をテストするか**: 納品フェーズ完了イベントを発火すると、ターンが終了し日数が進むことを確認する
  - **期待される動作**: `currentDay` が +1 増加する

- **入力値**:
  ```typescript
  eventBus.emit('ui:phase:complete', { phase: 'delivery' });
  ```
  - **入力データの意味**: 納品フェーズの完了を通知するイベント
  - **実行タイミング**: 納品フェーズのすべての操作が完了した後

- **期待される結果**: `stateManager.getProgress().currentDay === initialDay + 1`
  - **期待結果の理由**: 1ターン（1日）のすべてのフェーズが完了すると、次の日に進む
  - **確認ポイント**: ターン管理システムが正常に動作する

- **テストの目的**: ターン終了処理が正常に動作することを確認する
  - **確認ポイント**: 日数の進行が正確に行われる

- 🔵 **信頼性レベル**: 青信号（要件定義書・タスクファイルに詳細なコード例あり）

**参照元**:
- `docs/implements/atelier-guild-rank-phaser/TASK-0262/turn-cycle-second-half-requirements.md` (4.3.1 ターン終了のテストケース)
- `docs/tasks/atelier-guild-rank-phaser/TASK-0262.md` (Turn End - TC-311)
- `docs/design/atelier-guild-rank-phaser/dataflow.md` (5. フェーズ遷移フロー)

---

#### TC-11: ターン終了でAPが回復する 🔵

- **テスト名**: ターン終了でAPが回復する
  - **何をテストするか**: ターンが終了すると、APが最大値まで回復することを確認する
  - **期待される動作**: `ap.current` が `ap.max` と等しくなる

- **入力値**:
  ```typescript
  // 初期状態: ap.current = 0, ap.max = 3
  eventBus.emit('ui:phase:complete', { phase: 'delivery' });
  ```
  - **入力データの意味**: AP消費済みの状態でターンを終了する
  - **実行タイミング**: ターン終了処理時

- **期待される結果**: `player.ap.current === player.ap.max`
  - **期待結果の理由**: ターン終了時にAPが全回復するのはゲームデザインの一部
  - **確認ポイント**: AP回復処理が正確に行われる

- **テストの目的**: リソース回復システムが正常に動作することを確認する
  - **確認ポイント**: ターン終了時のAP回復ロジックが正しく実行される

- 🔵 **信頼性レベル**: 青信号（要件定義書・タスクファイルに詳細なコード例あり）

**参照元**:
- `docs/implements/atelier-guild-rank-phaser/TASK-0262/turn-cycle-second-half-requirements.md` (4.3.1 ターン終了のテストケース)
- `docs/tasks/atelier-guild-rank-phaser/TASK-0262.md` (Turn End - TC-324)

---

#### TC-12: ターン終了で依頼受注フェーズに戻る 🔵

- **テスト名**: ターン終了で依頼受注フェーズに戻る
  - **何をテストするか**: ターンが終了すると、次の日の依頼受注フェーズに遷移することを確認する
  - **期待される動作**: `currentPhase` が `quest-accept` に変更される

- **入力値**:
  ```typescript
  eventBus.emit('ui:phase:complete', { phase: 'delivery' });
  ```
  - **入力データの意味**: ターン終了を通知するイベント
  - **実行タイミング**: 納品フェーズ完了後

- **期待される結果**: `stateManager.getProgress().currentPhase === 'quest-accept'`
  - **期待結果の理由**: 1日のサイクルが終わると、次の日は依頼受注フェーズから始まる
  - **確認ポイント**: フェーズが循環する

- **テストの目的**: フェーズ循環システムが正常に動作することを確認する
  - **確認ポイント**: ターン終了後のフェーズ初期化が正しく行われる

- 🔵 **信頼性レベル**: 青信号（要件定義書・タスクファイルに詳細なコード例あり）

**参照元**:
- `docs/implements/atelier-guild-rank-phaser/TASK-0262/turn-cycle-second-half-requirements.md` (4.3.1 ターン終了のテストケース)
- `docs/tasks/atelier-guild-rank-phaser/TASK-0262.md` (Turn End - TC-338)
- `docs/design/atelier-guild-rank-phaser/dataflow.md` (5. フェーズ遷移フロー)

---

#### TC-13: ターン終了サマリーが表示される 🔵

- **テスト名**: ターン終了サマリーが表示される
  - **何をテストするか**: ターンが終了すると、日終了サマリーイベントが発火されることを確認する
  - **期待される動作**: `app:day:ended` イベントが発火される

- **入力値**:
  ```typescript
  eventBus.emit('ui:phase:complete', { phase: 'delivery' });
  ```
  - **入力データの意味**: ターン終了を通知するイベント
  - **実行タイミング**: 納品フェーズ完了後、日数更新前

- **期待される結果**: `dayEndedCallback` が呼ばれ、ペイロードに `newDay` と `summary` が含まれる
  - **期待結果の理由**: プレイヤーにその日の成果を表示するため、ターン終了時にサマリーイベントが発火される
  - **確認ポイント**: サマリーイベントのペイロードが正しいフォーマットである

- **テストの目的**: UI更新イベントが正常に発火されることを確認する
  - **確認ポイント**: EventBusによるUI通知が正しく機能する

- 🔵 **信頼性レベル**: 青信号（要件定義書・タスクファイルに詳細なコード例あり）

**参照元**:
- `docs/implements/atelier-guild-rank-phaser/TASK-0262/turn-cycle-second-half-requirements.md` (4.3.1 ターン終了のテストケース)
- `docs/tasks/atelier-guild-rank-phaser/TASK-0262.md` (Turn End - TC-347)
- `docs/design/atelier-guild-rank-phaser/core-systems.md` (2.3 イベント定義)

---

#### TC-14: 報酬カード選択ダイアログが表示される（依頼完了時） 🔵

- **テスト名**: 報酬カード選択ダイアログが表示される（依頼完了時）
  - **何をテストするか**: 依頼を完了した後、報酬カード選択イベントが発火されることを確認する
  - **期待される動作**: `app:reward:card:selection` イベントが発火される

- **入力値**:
  ```typescript
  {
    questId: 'quest_002',
    itemIds: ['item_001'],
    // quest_002には報酬カードが設定されている
    rewardCards: ['card_option_1', 'card_option_2', 'card_option_3']
  }
  ```
  - **入力データの意味**: 報酬カードを含む依頼を納品する
  - **実行タイミング**: 納品完了後

- **期待される結果**: `rewardCardCallback` が呼ばれ、ペイロードに `cards` 配列が含まれる
  - **期待結果の理由**: 依頼完了時にプレイヤーが報酬カードを選択できるようにするため
  - **確認ポイント**: 報酬カード選択イベントのペイロードが正しいフォーマットである

- **テストの目的**: 報酬カード選択システムが正常に動作することを確認する
  - **確認ポイント**: デッキビルディング要素が正しく機能する

- 🔵 **信頼性レベル**: 青信号（要件定義書・タスクファイルに詳細なコード例あり）

**参照元**:
- `docs/implements/atelier-guild-rank-phaser/TASK-0262/turn-cycle-second-half-requirements.md` (4.3.1 ターン終了のテストケース)
- `docs/tasks/atelier-guild-rank-phaser/TASK-0262.md` (Turn End - TC-366)
- `docs/design/atelier-guild-rank-phaser/core-systems.md` (2.3 イベント定義)

---

### 3.4 フルサイクル - 正常系テストケース

#### TC-15: 1ターン全体が正常に完了する 🔵

- **テスト名**: 1ターン全体が正常に完了する
  - **何をテストするか**: すべてのフェーズを順番に進行し、1ターンサイクル全体が正常に完了することを確認する
  - **期待される動作**: 依頼受注 → 採取 → 調合 → 納品 → 次の日（依頼受注）の順に遷移する

- **入力値**:
  ```typescript
  // 各フェーズで ui:phase:complete イベントを発火
  const phases = ['quest-accept', 'gathering', 'alchemy', 'delivery'];
  ```
  - **入力データの意味**: 1ターンのすべてのフェーズを順番に完了する
  - **実行タイミング**: 各フェーズの完了時

- **期待される結果**:
  - すべてのフェーズが設計通りに遷移する
  - ターン終了後、`currentDay === 2` かつ `currentPhase === 'quest-accept'`
  - **期待結果の理由**: 1ターンサイクル全体が正しく実装されていることを検証する
  - **確認ポイント**: フェーズ遷移の一貫性とターン管理の正確性

- **テストの目的**: ゲームサイクル全体が統合的に動作することを確認する
  - **確認ポイント**: すべてのシステム（EventBus、StateManager、各種サービス）が連携して動作する

- 🔵 **信頼性レベル**: 青信号（要件定義書・タスクファイルに詳細なコード例あり）

**参照元**:
- `docs/implements/atelier-guild-rank-phaser/TASK-0262/turn-cycle-second-half-requirements.md` (4.4.1 フルサイクルテスト)
- `docs/tasks/atelier-guild-rank-phaser/TASK-0262.md` (Full Turn Cycle - TC-404)
- `docs/design/atelier-guild-rank-phaser/dataflow.md` (5. フェーズ遷移フロー)

---

## 4. 異常系テストケース（エラーハンドリング）

### 4.1 調合フェーズ - 異常系テストケース

#### TC-16: 素材不足時は調合できない 🔵

- **テスト名**: 素材不足時は調合できない
  - **エラーケースの概要**: 必要な素材が不足している状態で調合を実行しようとする
  - **エラー処理の重要性**: プレイヤーに適切なフィードバックを与え、不正な操作を防ぐため

- **入力値**:
  ```typescript
  // インベントリに素材がない状態
  stateManager.updateInventory({ materials: [] });

  {
    recipeCardId: 'recipe_potion_001',
    materialIds: ['herb_001', 'herb_001', 'water_001']
  }
  ```
  - **不正な理由**: レシピに必要な素材がインベントリに存在しない
  - **実際の発生シナリオ**: プレイヤーが採取を行わずに調合を試みた場合

- **期待される結果**: `app:error:occurred` イベントが発火され、メッセージに「素材」が含まれる
  - **エラーメッセージの内容**: 「素材が不足しています」など、プレイヤーが理解しやすいメッセージ
  - **システムの安全性**: エラー時にインベントリやデッキの状態が破壊されない

- **テストの目的**: エラーハンドリングが適切に動作することを確認する
  - **品質保証の観点**: 不正な操作からシステムを保護し、プレイヤー体験を向上させる

- 🔵 **信頼性レベル**: 青信号（要件定義書・タスクファイルに詳細なコード例あり）

**参照元**:
- `docs/implements/atelier-guild-rank-phaser/TASK-0262/turn-cycle-second-half-requirements.md` (4.1.2 調合フェーズのエッジケース)
- `docs/tasks/atelier-guild-rank-phaser/TASK-0262.md` (Alchemy Phase - TC-144)
- `docs/design/atelier-guild-rank-phaser/dataflow.md` (9. エラーハンドリングフロー)

---

### 4.2 納品フェーズ - 異常系テストケース

#### TC-17: 必要アイテム不足時は納品できない 🔵

- **テスト名**: 必要アイテム不足時は納品できない
  - **エラーケースの概要**: 依頼に必要なアイテムが不足している状態で納品を実行しようとする
  - **エラー処理の重要性**: 不正な納品を防ぎ、ゲームバランスを保つため

- **入力値**:
  ```typescript
  // インベントリにアイテムがない状態
  stateManager.updateInventory({ craftedItems: [], materials: [], artifacts: [] });

  {
    questId: 'quest_001',
    itemIds: []
  }
  ```
  - **不正な理由**: 依頼に必要なアイテムがインベントリに存在しない
  - **実際の発生シナリオ**: プレイヤーが調合を行わずに納品を試みた場合

- **期待される結果**: `app:error:occurred` イベントが発火される
  - **エラーメッセージの内容**: 「必要なアイテムが不足しています」など
  - **システムの安全性**: エラー時に依頼状態が変更されない

- **テストの目的**: エラーハンドリングが適切に動作することを確認する
  - **品質保証の観点**: 不正な納品からシステムを保護し、ゲームの整合性を維持する

- 🔵 **信頼性レベル**: 青信号（要件定義書・タスクファイルに詳細なコード例あり）

**参照元**:
- `docs/implements/atelier-guild-rank-phaser/TASK-0262/turn-cycle-second-half-requirements.md` (4.2.2 納品フェーズのエッジケース)
- `docs/tasks/atelier-guild-rank-phaser/TASK-0262.md` (Delivery Phase - TC-284)
- `docs/design/atelier-guild-rank-phaser/dataflow.md` (9. エラーハンドリングフロー)

---

## 5. 境界値テストケース（最小値、最大値、null等）

### 5.1 調合フェーズ - 境界値テストケース

#### TC-18: 素材ちょうど0個の状態で調合できない 🔵

- **テスト名**: 素材ちょうど0個の状態で調合できない
  - **境界値の意味**: 素材数量の最小値（0個）での動作確認
  - **境界値での動作保証**: 0個の状態で適切にエラーが発生する

- **入力値**:
  ```typescript
  // 素材を全て使い切った状態
  stateManager.updateInventory({ materials: [] });

  {
    recipeCardId: 'recipe_potion_001',
    materialIds: ['herb_001', 'herb_001', 'water_001']
  }
  ```
  - **境界値選択の根拠**: 素材数量が0の時に調合が防がれることを確認する
  - **実際の使用場面**: プレイヤーが全ての素材を消費した後

- **期待される結果**: `app:error:occurred` イベントが発火される
  - **境界での正確性**: 0個の境界で正しくエラーが発生する
  - **一貫した動作**: 素材不足エラーと同じエラーハンドリングが適用される

- **テストの目的**: 境界条件でのエラーハンドリングを確認する
  - **堅牢性の確認**: 極端な条件下でもシステムが安定動作する

- 🔵 **信頼性レベル**: 青信号（TC-16と同様のエラーハンドリング）

**参照元**:
- `docs/implements/atelier-guild-rank-phaser/TASK-0262/turn-cycle-second-half-requirements.md` (4.1.2 調合フェーズのエッジケース)
- `docs/tasks/atelier-guild-rank-phaser/TASK-0262.md` (Alchemy Phase - TC-144)

---

## 6. テストケース実装時の日本語コメント指針

### 6.1 テストケース開始時のコメント

```typescript
// 【テスト目的】: このテストで何を確認するかを日本語で明記
// 【テスト内容】: 具体的にどのような処理をテストするかを説明
// 【期待される動作】: 正常に動作した場合の結果を説明
// 🔵 信頼性レベル: 青信号（理由を記載）
```

### 6.2 Given（準備フェーズ）のコメント

```typescript
// 【テストデータ準備】: なぜこのデータを用意するかの理由
// 【初期条件設定】: テスト実行前の状態を説明
// 【前提条件確認】: テスト実行に必要な前提条件を明記
```

### 6.3 When（実行フェーズ）のコメント

```typescript
// 【実際の処理実行】: どの機能/メソッドを呼び出すかを説明
// 【処理内容】: 実行される処理の内容を日本語で説明
// 【実行タイミング】: なぜこのタイミングで実行するかを説明
```

### 6.4 Then（検証フェーズ）のコメント

```typescript
// 【結果検証】: 何を検証するかを具体的に説明
// 【期待値確認】: 期待される結果とその理由を説明
// 【品質保証】: この検証がシステム品質にどう貢献するかを説明
```

### 6.5 各expectステートメントのコメント

```typescript
// 【検証項目】: この検証で確認している具体的な項目
// 🔵 信頼性レベル: 青信号
expect(result.craftedItems).toHaveLength(1); // 【確認内容】: アイテムが1つ作成されることを確認
expect(result.materials).not.toContain('herb_001'); // 【確認内容】: 素材が消費されることを確認
```

### 6.6 セットアップ・クリーンアップのコメント

```typescript
beforeEach(async () => {
  // 【テスト前準備】: 各テスト実行前にテスト環境を初期化し、一貫したテスト条件を保証
  // 【環境初期化】: 前のテストの影響を受けないよう、ゲームインスタンスを新規作成
  const testSetup = await createTestGame();
  game = testSetup.game;
  eventBus = testSetup.eventBus;
  stateManager = game.registry.get('stateManager');
});

afterEach(() => {
  // 【テスト後処理】: テスト実行後に作成されたゲームインスタンスを破棄
  // 【状態復元】: 次のテストに影響しないよう、システムを元の状態に戻す
  if (game) {
    game.destroy(true);
  }
  if (eventBus) {
    eventBus.clear();
  }
});
```

---

## 7. テストケース実装の参考コード例

### 7.1 調合フェーズのセットアップ例

```typescript
beforeEach(() => {
  // 【初期状態設定】: 調合フェーズの開始条件を整える

  // 【素材準備】: インベントリに素材を追加
  stateManager.updateInventory({
    materials: [
      { id: 'herb_001', name: '薬草', quantity: 5, quality: 80 },
      { id: 'water_001', name: '水', quantity: 3, quality: 70 },
      { id: 'crystal_001', name: 'クリスタル', quantity: 2, quality: 90 },
    ],
  });

  // 【レシピカード準備】: 手札にレシピカードを追加
  stateManager.updateDeck({
    hand: [
      {
        id: 'recipe_potion_001',
        type: 'recipe',
        name: '回復薬',
        requirements: [
          { itemId: 'herb_001', quantity: 2 },
          { itemId: 'water_001', quantity: 1 },
        ],
        output: { id: 'potion_001', name: '回復薬' },
      },
    ],
    cards: [],
    discard: [],
  });
});
```

### 7.2 納品フェーズのセットアップ例

```typescript
beforeEach(async () => {
  // 【初期状態設定】: 納品フェーズの開始条件を整える

  // 【依頼準備】: 受注済み依頼を設定
  stateManager.updateQuests({
    available: [],
    accepted: [
      {
        id: 'quest_001',
        name: '回復薬の納品',
        requirements: [{ itemId: 'potion_001', quantity: 1 }],
        rewards: { gold: 100, exp: 50 },
      },
    ],
    completed: [],
  });

  // 【アイテム準備】: 納品可能なアイテムを用意
  stateManager.updateInventory({
    craftedItems: [
      { id: 'potion_001', name: '回復薬', quantity: 1, quality: 80 },
    ],
    materials: [],
    artifacts: [],
  });

  // 【フェーズ遷移】: 納品フェーズへ遷移
  eventBus.emit('ui:phase:complete', { phase: 'alchemy' });
  await waitForPhase(game, 'delivery');
});
```

---

## 8. テストケース一覧サマリー

### 8.1 テストケース分類

| 分類 | テストケース数 | 信頼性レベル |
|------|--------------|------------|
| 調合フェーズ - 正常系 | 5 | 🔵🔵🔵🔵🔵 |
| 納品フェーズ - 正常系 | 4 | 🔵🔵🔵🔵 |
| ターン終了 - 正常系 | 5 | 🔵🔵🔵🔵🔵 |
| フルサイクル - 正常系 | 1 | 🔵 |
| 調合フェーズ - 異常系 | 1 | 🔵 |
| 納品フェーズ - 異常系 | 1 | 🔵 |
| 調合フェーズ - 境界値 | 1 | 🔵 |
| **合計** | **18** | **18 x 🔵** |

### 8.2 カバレッジ目標

| テスト対象 | 目標カバレッジ | 関連テストケース |
|-----------|---------------|----------------|
| 調合フェーズ | 90% | TC-01 ~ TC-05, TC-16, TC-18 |
| 納品フェーズ | 90% | TC-06 ~ TC-09, TC-17 |
| ターン終了処理 | 100% | TC-10 ~ TC-14 |
| フルサイクル | 100% | TC-15 |

---

## 9. 信頼性レベルサマリー

### 9.1 全体評価

- **総テストケース数**: 18項目
- 🔵 **青信号**: 18項目 (100%)
- 🟡 **黄信号**: 0項目 (0%)
- 🔴 **赤信号**: 0項目 (0%)

**品質評価**: ✅ 高品質

### 9.2 高品質の理由

1. **要件定義の明確性**: すべてのテストケースが要件定義書・タスクファイルに詳細に記載されている
2. **具体的なコード例**: タスクファイルに実装可能なコード例が含まれている
3. **設計文書の充実**: dataflow.md、core-systems.mdに詳細なイベント定義とフローが記載されている
4. **既存パターンの活用**: 前半テスト（TASK-0261）と同様のパターンを踏襲できる
5. **テストユーティリティ完備**: phaserTestUtils.ts で必要なモック・ヘルパーが実装済み

---

## 10. 実装可能性の評価

### 10.1 技術的実現性 ✅

- **Vitest**: すべてのテストケースがVitestで実装可能
- **モック**: EventBusとStateManagerのモックが既に実装済み
- **非同期処理**: `vi.waitFor()` を使用して状態変更を待機できる
- **フェーズ遷移**: `waitForPhase()` ヘルパーでフェーズ遷移を検証できる

### 10.2 テスト実装の難易度

| テストケース | 難易度 | 理由 |
|------------|-------|------|
| TC-01 ~ TC-05 | 低 | 既存パターンを踏襲できる |
| TC-06 ~ TC-09 | 低 | 既存パターンを踏襲できる |
| TC-10 ~ TC-14 | 中 | ターン終了処理の実装が必要 |
| TC-15 | 中 | 複数フェーズの統合テスト |
| TC-16 ~ TC-18 | 低 | エラーハンドリングのテスト |

---

## 11. 次のステップ

### 11.1 推奨される次のアクション

次のコマンドで**Redフェーズ（失敗するテスト作成）**を開始してください：

```bash
/tdd-red atelier-guild-rank-phaser TASK-0262
```

### 11.2 実装順序の推奨

1. **調合フェーズ - 正常系**（TC-01 ~ TC-05）
2. **納品フェーズ - 正常系**（TC-06 ~ TC-09）
3. **ターン終了 - 正常系**（TC-10 ~ TC-14）
4. **フルサイクル - 正常系**（TC-15）
5. **異常系・境界値**（TC-16 ~ TC-18）

---

## 12. 関連文書

- **タスクファイル**: `docs/tasks/atelier-guild-rank-phaser/TASK-0262.md`
- **要件定義書**: `docs/implements/atelier-guild-rank-phaser/TASK-0262/turn-cycle-second-half-requirements.md`
- **タスクノート**: `docs/implements/atelier-guild-rank-phaser/TASK-0262/note.md`
- **データフロー設計**: `docs/design/atelier-guild-rank-phaser/dataflow.md`
- **コアシステム設計**: `docs/design/atelier-guild-rank-phaser/core-systems.md`
- **テストユーティリティ**: `tests/utils/phaserTestUtils.ts`
- **前半テスト参考**: `tests/integration/phaser/phase5/TurnCycleFirstHalf.test.ts`

---

## 13. 変更履歴

| 日付 | バージョン | 変更内容 |
|------|----------|---------|
| 2026-01-13 | 1.0.0 | 初版作成（TDDテストケース定義） |
