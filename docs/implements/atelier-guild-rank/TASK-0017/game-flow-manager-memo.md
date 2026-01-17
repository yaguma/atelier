# TDD開発メモ: GameFlowManager

## 概要

- **機能名**: GameFlowManager（ゲームフロー管理）
- **開発開始**: 2026-01-17
- **現在のフェーズ**: Red（失敗するテスト作成）完了

## 関連ファイル

- **元タスクファイル**: `docs/tasks/atelier-guild-rank/phase-2/TASK-0017.md`
- **要件定義**: `docs/implements/atelier-guild-rank/TASK-0017/game-flow-manager-requirements.md`
- **テストケース定義**: `docs/implements/atelier-guild-rank/TASK-0017/game-flow-manager-testcases.md`
- **実装ファイル**: `atelier-guild-rank/src/application/services/game-flow-manager.ts` (未作成)
- **インターフェース**: `atelier-guild-rank/src/application/services/game-flow-manager.interface.ts` (未作成)
- **テストファイル**: `atelier-guild-rank/tests/unit/application/services/game-flow-manager.test.ts`

## Redフェーズ（失敗するテスト作成）

### 作成日時

2026-01-17

### テストケース

14件のテストケースを作成しました：

- **正常系**: 10件
  - T-0017-01: 新規ゲーム開始時の初期化処理が正しく実行される 🔵
  - T-0017-02: 日開始処理が正しく実行される 🔵
  - T-0017-03: フェーズが順番に進行する 🔵
  - T-0017-04: endPhase()で次のフェーズに遷移する 🟡
  - T-0017-05: 日終了処理が正しく実行される 🔵
  - T-0017-06: ゲームクリア条件の判定が正しい 🔵
  - T-0017-07: ゲームクリア後に次の日に進まない 🟡
  - T-0017-08: getCurrentPhase()で現在のフェーズを取得できる 🟡
  - T-0017-09: skipPhase()でフェーズをスキップできる 🟡
  - T-0017-10: rest()でAP消費なしで日が進む 🟡

- **異常系**: 2件
  - T-0017-E01: 無効なフェーズ遷移でエラーをスローする 🟡
  - T-0017-E02: 不正なセーブデータでエラーをスローする 🟡

- **境界値**: 2件
  - T-0017-B01: 残り日数が0でSランク未到達の場合、ゲームオーバー判定 🔵
  - T-0017-B02: 残り日数が1でSランク未到達の場合、ゲームは継続 🟡

### テストコード

**テストファイル**: `atelier-guild-rank/tests/unit/application/services/game-flow-manager.test.ts`

- **テストフレームワーク**: Vitest 4.x
- **モック対象**: IStateManager, IDeckService, IQuestService, IEventBus
- **日本語コメント**: すべてのテストケースに適切な日本語コメントを記載
- **Given-When-Then パターン**: テスト構造を明確化

### 期待される失敗

すべてのテストが期待通り失敗しました（14件中14件失敗）。

**失敗理由**: GameFlowManagerクラスが未実装のため、すべてのメソッド呼び出しが`TypeError: Cannot read properties of undefined`エラーで失敗。

```
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
```

### 次のフェーズへの要求事項

Greenフェーズで以下を実装する必要があります：

1. **インターフェース定義**: `game-flow-manager.interface.ts`
   - IGameFlowManagerインターフェース
   - GameEndCondition型定義

2. **GameFlowManager実装**: `game-flow-manager.ts`
   - コンストラクタ（依存注入）
   - startNewGame(): 初期化→日開始
   - startDay(): AP回復→依頼生成→イベント発行→フェーズ遷移
   - endDay(): 期限処理→日数更新→イベント発行→終了判定
   - startPhase(): フェーズ遷移
   - endPhase(): 次のフェーズへ自動遷移
   - skipPhase(): フェーズスキップ
   - checkGameOver(): ゲームオーバー判定
   - checkGameClear(): ゲームクリア判定
   - rest(): 休憩アクション
   - getCurrentPhase(): 現在フェーズ取得
   - canAdvancePhase(): フェーズ進行可否判定

3. **エクスポート追加**: `src/application/services/index.ts`
   - IGameFlowManagerのエクスポート
   - GameFlowManagerのエクスポート

### 品質評価

- ✅ **テスト実行**: 実行可能で失敗することを確認済み
- ✅ **期待値**: 明確で具体的（14件すべてのテストケースで明確な期待値を定義）
- ✅ **アサーション**: 適切（各テストケースで複数のアサーションを使用）
- ✅ **実装方針**: 明確（各メソッドの実装方針を明示）
- ✅ **信頼性レベル**: 🔵（青信号）が6件、🟡（黄信号）が8件

**品質判定**: ✅ 高品質

---

## Greenフェーズ（最小実装）

### 実装日時

（未実施）

### 実装方針

（未実施）

### 実装コード

（未実施）

### テスト結果

（未実施）

### 課題・改善点

（未実施）

---

## Refactorフェーズ（品質改善）

### リファクタ日時

（未実施）

### 改善内容

（未実施）

### セキュリティレビュー

（未実施）

### パフォーマンスレビュー

（未実施）

### 最終コード

（未実施）

### 品質評価

（未実施）

---

**最終更新**: 2026-01-17
