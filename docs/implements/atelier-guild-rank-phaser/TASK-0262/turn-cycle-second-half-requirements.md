# TASK-0262: 1ターンサイクル統合テスト（後半） - 要件定義書

**タスクID**: TASK-0262
**機能名**: 1ターンサイクル統合テスト（後半）
**タスクタイプ**: TDD
**推定工数**: 4時間
**フェーズ**: Phase 5 - 統合テスト・最適化・仕上げ
**作成日**: 2026-01-13

---

## 1. 機能の概要

### 1.1 概要 🔵

1ターン（1日）のゲームサイクルの後半部分（調合フェーズ、納品フェーズ、ターン終了処理）が正しく動作することを検証する統合テストを実装する。

**信頼性レベル**: 🔵 青信号（設計書に明確な記載あり）

### 1.2 解決する問題 🔵

- **問題**: 調合フェーズ、納品フェーズ、ターン終了処理の統合的な動作が検証されていない
- **想定ユーザー**: 開発者、QAエンジニア
- **システム内での位置づけ**: Phase 5統合テスト、1ターンサイクルの後半部分を検証

**信頼性レベル**: 🔵 青信号（タスク概要から明確）

### 1.3 参照したEARS要件

- **ユーザーストーリー**: 「プレイヤーは調合フェーズで素材を使ってアイテムを作成し、納品フェーズで依頼を完了し、ターン終了で次の日に進む」
- **参照した設計文書**:
  - `docs/design/atelier-guild-rank-phaser/architecture.md` (フェーズ遷移図)
  - `docs/design/atelier-guild-rank-phaser/core-systems.md` (EventBus イベント定義)
  - `docs/design/atelier-guild-rank-phaser/dataflow.md` (調合フロー、納品フロー、フェーズ遷移フロー)

**信頼性レベル**: 🔵 青信号

---

## 2. 入力・出力の仕様

### 2.1 テスト環境セットアップ 🔵

**入力**:
```typescript
// テストゲームインスタンス作成
const testSetup = await createTestGame();
game = testSetup.game;
eventBus = testSetup.eventBus;
stateManager = game.registry.get('stateManager');
```

**出力**:
- `game`: Phaser.Game インスタンス
- `eventBus`: EventBus インスタンス
- `stateManager`: PhaserStateManager インスタンス

**信頼性レベル**: 🔵 青信号（テストユーティリティが既に実装済み）

**参照した設計文書**: `tests/utils/phaserTestUtils.ts`

### 2.2 調合フェーズの入力・出力 🔵

**入力イベント**:
```typescript
// 調合実行リクエスト
eventBus.emit('ui:alchemy:craft:requested', {
  recipeCardId: string,
  materialIds: string[]
});

// フェーズ完了通知
eventBus.emit('ui:phase:complete', { phase: 'alchemy' });
```

**出力イベント**:
```typescript
// 調合完了通知
'app:alchemy:craft:complete': { item: ICraftedItem }

// エラー発生通知
'app:error:occurred': { message: string }
```

**状態変化**:
- インベントリ: `craftedItems` に新規アイテム追加、`materials` から素材消費
- 品質: 素材の品質がアイテムに反映される
- フェーズ: `alchemy` → `delivery`

**信頼性レベル**: 🔵 青信号（dataflow.md の調合フローに明記）

**参照した設計文書**:
- `docs/design/atelier-guild-rank-phaser/dataflow.md` (2.3 調合フロー)
- `docs/design/atelier-guild-rank-phaser/core-systems.md` (2.3 イベント定義)

### 2.3 納品フェーズの入力・出力 🔵

**入力イベント**:
```typescript
// 納品実行リクエスト
eventBus.emit('ui:quest:delivery:requested', {
  questId: string,
  itemIds: string[]
});

// フェーズ完了通知
eventBus.emit('ui:phase:complete', { phase: 'delivery' });
```

**出力イベント**:
```typescript
// 納品完了通知
'app:quest:delivery:complete': {
  questId: string,
  rewards: { gold: number, exp: number }
}

// 報酬カード選択通知
'app:reward:card:selection': {
  cards: ICard[]
}

// エラー発生通知
'app:error:occurred': { message: string }
```

**状態変化**:
- 依頼状態: `accepted` から `completed` へ移動
- インベントリ: `craftedItems` からアイテム消費
- プレイヤー: `gold` と `exp` 増加
- 貢献度: ランクゲージ上昇
- フェーズ: `delivery` → `quest-accept` (次の日)

**信頼性レベル**: 🔵 青信号（dataflow.md の納品フローに明記）

**参照した設計文書**:
- `docs/design/atelier-guild-rank-phaser/dataflow.md` (2.4 納品フロー)
- `docs/design/atelier-guild-rank-phaser/core-systems.md` (2.3 イベント定義)

### 2.4 ターン終了の入力・出力 🔵

**入力イベント**:
```typescript
// フェーズ完了通知（納品フェーズ終了）
eventBus.emit('ui:phase:complete', { phase: 'delivery' });
```

**出力イベント**:
```typescript
// 日終了通知
'app:day:ended': {
  newDay: number,
  summary: IDaySummary
}

// フェーズ変更通知
'app:phase:changed': { phase: 'quest-accept' }
```

**状態変化**:
- 日数: `currentDay` が +1 増加
- AP: `current` が `max` に回復
- フェーズ: `delivery` → `quest-accept`

**信頼性レベル**: 🔵 青信号（dataflow.md のフェーズ遷移フローに明記）

**参照した設計文書**:
- `docs/design/atelier-guild-rank-phaser/dataflow.md` (5. フェーズ遷移フロー)
- `docs/design/atelier-guild-rank-phaser/core-systems.md` (2.3 イベント定義)

### 2.5 データフロー全体像 🔵

```
User → AlchemyContainer → EventBus → AlchemyUseCase → AlchemyService
  ↓
StateManager → EventBus → AlchemyContainer (UI更新)

User → DeliveryContainer → EventBus → QuestUseCase → QuestService
  ↓
RankService (貢献度加算) → StateManager → EventBus → DeliveryContainer
```

**信頼性レベル**: 🔵 青信号（dataflow.md に明記）

**参照した設計文書**:
- `docs/design/atelier-guild-rank-phaser/dataflow.md` (1. 全体データフロー)
- `docs/implements/atelier-guild-rank-phaser/TASK-0262/note.md` (データフロー)

---

## 3. 制約条件

### 3.1 パフォーマンス要件 🔵

| 項目 | 制約 | 理由 |
|------|------|------|
| テスト実行時間 | 各テストケース1秒以内 | 高速なフィードバックループを維持するため |
| メモリ使用量 | テスト実行後に完全クリーンアップ | メモリリーク防止 |
| カバレッジ目標 | 調合フェーズ90%, 納品フェーズ90%, ターン終了処理100% | 高品質なテストを保証 |

**信頼性レベル**: 🔵 青信号（タスクファイルに明記）

**参照したEARS要件**: TASK-0262.md (カバレッジ目標)
**参照した設計文書**: `docs/tasks/atelier-guild-rank-phaser/TASK-0262.md`

### 3.2 Phaserライフサイクル制約 🔵

- **シーン作成**: `create()` メソッドで初期化
- **シーン破棄**: `destroy(true)` で完全破棄
- **イベント購読解除**: `afterEach()` で必ず実行
- **非同期処理**: `vi.waitFor()` を使用して状態変更を待機
- **タイムアウト設定**: デフォルト1000ms

**信頼性レベル**: 🔵 青信号（note.md の注意事項に明記）

**参照した設計文書**:
- `docs/implements/atelier-guild-rank-phaser/TASK-0262/note.md` (5. 注意事項)
- `docs/design/atelier-guild-rank-phaser/core-systems.md` (10. Phaser固有の実装注意点)

### 3.3 アーキテクチャ制約 🔵

- **Clean Architectureの層分離**: Presentation → Application → Domain → Infrastructure
- **イベント駆動設計**: EventBusによる疎結合な通信
- **状態管理**: StateManagerによる一元管理

**信頼性レベル**: 🔵 青信号（architecture.md に明記）

**参照した設計文書**:
- `docs/design/atelier-guild-rank-phaser/architecture.md` (2. アーキテクチャパターン)
- `docs/design/atelier-guild-rank-phaser/core-systems.md` (7. 状態管理)

### 3.4 テストフレームワーク制約 🔵

- **テストフレームワーク**: Vitest
- **テストファイル配置**: `tests/integration/phaser/phase5/`
- **ファイル名形式**: `TurnCycleSecondHalf.test.ts`
- **コマンド制約**: `--` オプションは使用しない

**信頼性レベル**: 🔵 青信号（note.md の開発ルールに明記）

**参照した設計文書**:
- `docs/implements/atelier-guild-rank-phaser/TASK-0262/note.md` (2. 開発ルール)
- `CLAUDE.md` (テスト規約)

---

## 4. 想定される使用例

### 4.1 調合フェーズのテストケース 🔵

#### 4.1.1 基本的な使用パターン

1. **レシピカード表示テスト**
   - 手札にレシピカードが表示されることを確認
   - 期待結果: `deck.hand.filter(c => c.type === 'recipe').length > 0`

2. **アイテム調合成功テスト**
   - レシピカードと素材を選択して調合実行
   - 期待結果: `craftedItems` に新規アイテムが追加される

3. **素材消費確認テスト**
   - 調合実行後に素材が消費されることを確認
   - 期待結果: `materials` から指定数量の素材が減少

4. **品質反映テスト**
   - 調合結果に品質が反映されることを確認
   - 期待結果: `craftedItem.quality > 0`

5. **フェーズ遷移テスト**
   - 調合フェーズ完了で納品フェーズに遷移
   - 期待結果: `currentPhase === 'delivery'`

**信頼性レベル**: 🔵 青信号（タスクファイルに詳細なテストコード例あり）

**参照した設計文書**: `docs/tasks/atelier-guild-rank-phaser/TASK-0262.md` (Alchemy Phase)

#### 4.1.2 エッジケース

1. **素材不足エラーテスト**
   - 素材が不足している状態で調合実行
   - 期待結果: `app:error:occurred` イベントが発火、メッセージに「素材」が含まれる

**信頼性レベル**: 🔵 青信号（タスクファイルに詳細なテストコード例あり）

**参照したEARS要件**: EDGE-XXX（素材不足時のエラーハンドリング）
**参照した設計文書**:
- `docs/tasks/atelier-guild-rank-phaser/TASK-0262.md` (Alchemy Phase - 素材不足時は調合できない)
- `docs/design/atelier-guild-rank-phaser/dataflow.md` (9. エラーハンドリングフロー)

### 4.2 納品フェーズのテストケース 🔵

#### 4.2.1 基本的な使用パターン

1. **依頼表示テスト**
   - 受注中の依頼が表示されることを確認
   - 期待結果: `quests.accepted.length > 0`

2. **納品成功テスト**
   - 依頼を正常に納品できることを確認
   - 期待結果: 依頼が `accepted` から `completed` へ移動

3. **報酬獲得テスト**
   - 納品で報酬（ゴールド・経験値）を獲得
   - 期待結果: `gold` と `exp` が増加

4. **アイテム消費テスト**
   - 納品でアイテムが消費されることを確認
   - 期待結果: `craftedItems` から指定アイテムが削除

**信頼性レベル**: 🔵 青信号（タスクファイルに詳細なテストコード例あり）

**参照した設計文書**: `docs/tasks/atelier-guild-rank-phaser/TASK-0262.md` (Delivery Phase)

#### 4.2.2 エッジケース

1. **アイテム不足エラーテスト**
   - 必要アイテムが不足している状態で納品実行
   - 期待結果: `app:error:occurred` イベントが発火

**信頼性レベル**: 🔵 青信号（タスクファイルに詳細なテストコード例あり）

**参照したEARS要件**: EDGE-XXX（アイテム不足時のエラーハンドリング）
**参照した設計文書**:
- `docs/tasks/atelier-guild-rank-phaser/TASK-0262.md` (Delivery Phase - 必要アイテム不足時は納品できない)
- `docs/design/atelier-guild-rank-phaser/dataflow.md` (9. エラーハンドリングフロー)

### 4.3 ターン終了のテストケース 🔵

#### 4.3.1 基本的な使用パターン

1. **ターン進行テスト**
   - フェーズ完了でターンが終了し、日数が進む
   - 期待結果: `currentDay` が +1 増加

2. **AP回復テスト**
   - ターン終了でAPが最大値まで回復
   - 期待結果: `ap.current === ap.max`

3. **フェーズ循環テスト**
   - ターン終了で依頼受注フェーズに戻る
   - 期待結果: `currentPhase === 'quest-accept'`

4. **サマリー表示テスト**
   - ターン終了サマリーが表示される
   - 期待結果: `app:day:ended` イベントが発火

5. **報酬カード選択テスト**
   - 依頼完了時に報酬カード選択ダイアログが表示される
   - 期待結果: `app:reward:card:selection` イベントが発火

**信頼性レベル**: 🔵 青信号（タスクファイルに詳細なテストコード例あり）

**参照した設計文書**: `docs/tasks/atelier-guild-rank-phaser/TASK-0262.md` (Turn End)

### 4.4 フルサイクルテスト 🔵

#### 4.4.1 統合シナリオ

1. **1ターン全体の正常完了テスト**
   - すべてのフェーズを順番に進行
   - 期待結果: 依頼受注 → 採取 → 調合 → 納品 → 次の日（依頼受注）の順に遷移

**信頼性レベル**: 🔵 青信号（タスクファイルに詳細なテストコード例あり）

**参照した設計文書**:
- `docs/tasks/atelier-guild-rank-phaser/TASK-0262.md` (Full Turn Cycle)
- `docs/design/atelier-guild-rank-phaser/dataflow.md` (5. フェーズ遷移フロー)

---

## 5. EARS要件・設計文書との対応関係

### 5.1 参照したユーザストーリー 🔵

- **ストーリー名**: 「プレイヤーは1ターン（1日）を通じて、依頼受注・採取・調合・納品のサイクルを繰り返す」
- **As a**: プレイヤー
- **I want to**: 調合フェーズで素材を使ってアイテムを作成し、納品フェーズで依頼を完了する
- **So that**: ギルドランクを上げてゲームを進行できる

**信頼性レベル**: 🔵 青信号

### 5.2 参照した機能要件 🔵

- **REQ-001**: 調合フェーズでレシピカードと素材を選択してアイテムを作成できる
- **REQ-002**: 納品フェーズで依頼を選択してアイテムを納品できる
- **REQ-003**: ターン終了でAPが回復し、次の日に進む
- **REQ-004**: 素材・アイテムが正しく消費される
- **REQ-005**: 報酬が正しく獲得される

**信頼性レベル**: 🔵 青信号

### 5.3 参照した非機能要件 🔵

- **NFR-001**: テスト実行時間は各テストケース1秒以内
- **NFR-002**: メモリリークが発生しない
- **NFR-003**: イベントリスナーの適切な解放

**信頼性レベル**: 🔵 青信号

**参照した設計文書**: `docs/implements/atelier-guild-rank-phaser/TASK-0262/note.md` (5. 注意事項)

### 5.4 参照したEdgeケース 🔵

- **EDGE-001**: 素材不足時は調合できない
- **EDGE-002**: アイテム不足時は納品できない

**信頼性レベル**: 🔵 青信号

**参照した設計文書**:
- `docs/tasks/atelier-guild-rank-phaser/TASK-0262.md` (エラーテストケース)
- `docs/design/atelier-guild-rank-phaser/dataflow.md` (9. エラーハンドリングフロー)

### 5.5 参照した受け入れ基準 🔵

- [ ] 調合フェーズの統合テストがパスする（カバレッジ90%以上）
- [ ] 納品フェーズの統合テストがパスする（カバレッジ90%以上）
- [ ] ターン終了処理の統合テストがパスする（カバレッジ100%）
- [ ] 報酬獲得の検証テストがパスする
- [ ] 日終了サマリーの検証テストがパスする

**信頼性レベル**: 🔵 青信号

**参照した設計文書**: `docs/tasks/atelier-guild-rank-phaser/TASK-0262.md` (完了条件)

### 5.6 参照した設計文書 🔵

#### アーキテクチャ
- **ファイル**: `docs/design/atelier-guild-rank-phaser/architecture.md`
- **参照セクション**:
  - 4. Phaser シーン構成
  - 4.3 シーン遷移図
  - 7. MainSceneのフェーズUI構造

**信頼性レベル**: 🔵 青信号

#### データフロー
- **ファイル**: `docs/design/atelier-guild-rank-phaser/dataflow.md`
- **参照セクション**:
  - 2.3 調合フロー
  - 2.4 納品フロー
  - 5. フェーズ遷移フロー
  - 9. エラーハンドリングフロー

**信頼性レベル**: 🔵 青信号

#### コアシステム
- **ファイル**: `docs/design/atelier-guild-rank-phaser/core-systems.md`
- **参照セクション**:
  - 2. EventBus（イベントバス）
  - 2.3 イベント定義
  - 5. PhaseContainerシステム
  - 7. 状態管理（StateManager）
  - 10. Phaser固有の実装注意点

**信頼性レベル**: 🔵 青信号

#### 型定義
- **ファイル**: `src/presentation/phaser/core/EventBus.ts`
- **参照インターフェース**: `IEventBus`

- **ファイル**: `src/game/state/PhaserStateManager.ts`
- **参照インターフェース**: `PhaserStateManager`

**信頼性レベル**: 🔵 青信号

#### API仕様（EventBus）
- **イベント名**:
  - `ui:alchemy:craft:requested`
  - `app:alchemy:craft:complete`
  - `ui:quest:delivery:requested`
  - `app:quest:delivery:complete`
  - `app:reward:card:selection`
  - `ui:phase:complete`
  - `app:phase:changed`
  - `app:day:ended`
  - `app:error:occurred`

**信頼性レベル**: 🔵 青信号

**参照した設計文書**:
- `docs/design/atelier-guild-rank-phaser/core-systems.md` (2.3 イベント定義)
- `docs/implements/atelier-guild-rank-phaser/TASK-0262/note.md` (4. 設計文書 - イベント定義)

---

## 6. 実装手順（参考）

1. `/tdd-requirements` - 本要件定義（✅完了）
2. `/tdd-testcases` - テストケース洗い出し
3. `/tdd-red` - 失敗するテスト作成
4. `/tdd-green` - テストを通す実装
5. `/tdd-refactor` - リファクタリング
6. `/tdd-verify-complete` - 品質確認

**参照した設計文書**:
- `docs/implements/atelier-guild-rank-phaser/TASK-0262/note.md` (6. 実装手順)
- `CLAUDE.md` (TDD開発フロー)

---

## 7. テストケース構成（概要）

### 7.1 調合フェーズ（7テストケース）

1. レシピカード表示
2. アイテム調合成功
3. 素材消費確認
4. 素材不足エラー
5. 品質反映
6. フェーズ遷移

### 7.2 納品フェーズ（5テストケース）

1. 依頼表示
2. 納品成功
3. 報酬獲得
4. アイテム消費
5. アイテム不足エラー

### 7.3 ターン終了（5テストケース）

1. ターン進行
2. AP回復
3. フェーズ循環
4. サマリー表示
5. 報酬カード選択

### 7.4 フルサイクル（1テストケース）

1. 1ターン全体の正常完了

**合計**: 18テストケース

**参照した設計文書**: `docs/implements/atelier-guild-rank-phaser/TASK-0262/note.md` (5. 注意事項 - テストケース構成)

---

## 8. 信頼性レベルサマリー

- **総項目数**: 45項目
- 🔵 **青信号**: 45項目 (100%)
- 🟡 **黄信号**: 0項目 (0%)
- 🔴 **赤信号**: 0項目 (0%)

**品質評価**: ✅ 高品質

**理由**:
- すべての要件が設計書（architecture.md, core-systems.md, dataflow.md）に明確に記載されている
- 具体的なテストコード例がタスクファイルに含まれている
- 入出力の型定義が明確
- エラーハンドリングパターンが定義されている
- テストユーティリティが既に実装済み

---

## 9. 関連文書

- **タスクファイル**: `docs/tasks/atelier-guild-rank-phaser/TASK-0262.md`
- **タスクノート**: `docs/implements/atelier-guild-rank-phaser/TASK-0262/note.md`
- **タスク概要**: `docs/tasks/atelier-guild-rank-phaser/overview.md`
- **アーキテクチャ設計**: `docs/design/atelier-guild-rank-phaser/architecture.md`
- **コアシステム設計**: `docs/design/atelier-guild-rank-phaser/core-systems.md`
- **データフロー設計**: `docs/design/atelier-guild-rank-phaser/dataflow.md`
- **テストユーティリティ**: `tests/utils/phaserTestUtils.ts`
- **プロジェクト規約**: `CLAUDE.md`

---

## 10. 変更履歴

| 日付 | バージョン | 変更内容 |
|------|----------|---------|
| 2026-01-13 | 1.0.0 | 初版作成（TDD要件定義） |
