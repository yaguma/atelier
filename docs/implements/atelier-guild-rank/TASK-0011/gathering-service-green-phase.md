# GatheringService Green-phaseファイル

**作成日**: 2026-01-16
**タスクID**: TASK-0011
**要件名**: atelier-guild-rank
**機能名**: GatheringService（ドラフト採取）
**フェーズ**: Green（最小実装でテストを通す）

---

## 概要

GatheringServiceのTDD開発におけるGreenフェーズとして、16件のテストケース全てを通す最小実装を完成させました。

### 実装したファイル

1. **エラーコード追加**: `atelier-guild-rank/src/shared/types/errors.ts`
   - `SESSION_NOT_FOUND`: 存在しないセッションID
   - `INVALID_SELECTION`: 無効な選択
   - `INVALID_CARD_TYPE`: 採取地カード以外のカード

2. **イベントタイプ追加**: `atelier-guild-rank/src/shared/types/events.ts`
   - `GATHERING_STARTED`: 採取開始
   - `MATERIAL_SELECTED`: 素材選択
   - `GATHERING_ENDED`: 採取終了

3. **インターフェース定義**: `atelier-guild-rank/src/domain/interfaces/gathering-service.interface.ts`
   - `IGatheringService`: GatheringServiceのインターフェース
   - `DraftSession`: ドラフト採取セッション
   - `MaterialOption`: 素材オプション
   - `GatheringResult`: 採取結果
   - `GatheringCostResult`: 採取コスト

4. **サービス実装**: `atelier-guild-rank/src/application/services/gathering-service.ts`
   - GatheringServiceクラス
   - 全メソッドの実装

---

## 実装方針

### 1. エラーコードとイベントタイプの追加

既存のエラーコードとイベントタイプに、GatheringService用のものを追加しました。

### 2. インターフェース定義

note.mdと要件定義書に基づいて、IGatheringServiceインターフェースと関連する型を定義しました。

**主要メソッド**:
- `startDraftGathering()`: ドラフト採取セッション開始
- `selectMaterial()`: 素材選択
- `skipSelection()`: 素材選択スキップ
- `endGathering()`: 採取終了
- `getCurrentSession()`: 現在のセッション取得
- `canGather()`: 採取可能か判定
- `calculateGatheringCost()`: 採取コスト計算

### 3. GatheringServiceの実装

#### コンストラクタ
依存性注入で以下のサービスを受け取る：
- `IMaterialService`: 素材インスタンス生成
- `IMasterDataRepository`: マスターデータ参照
- `IEventBus`: イベント発行

#### 主要プロパティ
- `activeSessions`: アクティブなセッションを管理する`Map<string, DraftSession>`
- `currentSessionId`: 現在のセッションID（1つのみ想定）

#### startDraftGathering()の実装
1. マスターデータ読み込みチェック
2. カードタイプチェック（採取地カードか）
3. セッションID生成（`generateUniqueId('draft_session')`）
4. 提示回数決定（`card.master.presentationCount`）
5. 素材オプション生成（`generateMaterialOptions()`）
6. DraftSession作成
7. セッション保存
8. `GATHERING_STARTED`イベント発行

#### selectMaterial()の実装
1. セッション存在チェック
2. インデックス範囲チェック（0〜2）
3. MaterialServiceで素材インスタンス生成
4. セッションに素材追加
5. ラウンド進行（`currentRound++`）
6. 最終ラウンド判定（`currentRound > maxRounds`）
7. 次のラウンドの素材オプション生成（最終ラウンドでない場合）
8. `MATERIAL_SELECTED`イベント発行

#### skipSelection()の実装
1. セッション存在チェック
2. ラウンド進行（`currentRound++`）
3. 最終ラウンド判定
4. 次のラウンドの素材オプション生成（最終ラウンドでない場合）

#### endGathering()の実装
1. セッション存在チェック
2. コスト計算（`calculateGatheringCost()`）
3. セッション削除（`activeSessions.delete()`）
4. `GATHERING_ENDED`イベント発行
5. GatheringResult返却

#### calculateGatheringCost()の実装
選択個数に応じた追加コストを計算：
- 0個: +0
- 1〜2個: +1
- 3〜4個: +2
- 5〜6個: +3
- 7個以上: +3、extraDays: +1

#### generateMaterialOptions()の実装（プライベート）
1. 素材プール取得（`card.master.materialPool`）
2. 3つの素材オプションをランダム生成
3. MaterialServiceでランダム品質を生成

---

## テスト結果

### 実行コマンド
```bash
cd /home/user/atelier/atelier-guild-rank && pnpm test tests/unit/application/services/gathering-service.test.ts
```

### 結果
```
✓ tests/unit/application/services/gathering-service.test.ts (16 tests) 16ms

Test Files  1 passed (1)
     Tests  16 passed (16)
  Start at  13:11:28
  Duration  4.57s (transform 193ms, setup 74ms, import 193ms, tests 16ms, environment 3.80s)
```

**全16件のテストケースが成功しました！**

### テストケース内訳

#### 正常系テストケース（6件）
1. ✅ T-0011-01: ドラフト採取開始（基本動作）
2. ✅ T-0011-02: 素材選択（基本動作）
3. ✅ T-0011-03: 素材スキップ（基本動作）
4. ✅ T-0011-04: 採取終了（獲得素材リスト返却、コスト計算）
5. ✅ T-0011-05: カード効果適用（提示回数が効果通り）
6. ✅ T-0011-06: 選択回数上限到達

#### 異常系テストケース（4件）
7. ✅ T-0011-E01: 存在しないセッションIDで素材選択
8. ✅ T-0011-E02: 無効な素材インデックスで素材選択
9. ✅ T-0011-E03: 採取地カード以外のカードで採取開始
10. ✅ T-0011-E04: マスターデータ未読み込み時に採取開始

#### 境界値テストケース（6件）
11. ✅ T-0011-B01: 最小提示回数（2回）での採取
12. ✅ T-0011-B02: 最大提示回数（5回）での採取
13. ✅ T-0011-B03: 0個選択（偵察のみ）でのコスト計算
14. ✅ T-0011-B04: 7個選択（翌日持越しペナルティ）でのコスト計算
15. ✅ T-0011-B05: 6個選択（ペナルティなし上限）でのコスト計算
16. ✅ T-0011-B06: nullセッションでgetCurrentSession()を実行

---

## 実装の特徴

### 1. シンプルな実装
- テストを通すための最小限の実装に留める
- 複雑なロジックは後のRefactorフェーズで改善
- 可読性を重視

### 2. 日本語コメントの充実
- 全ての関数・メソッドに日本語コメントを記載
- 機能概要、実装方針、テスト対応を明記
- 信頼性レベル（🔵🟡🔴）を記載

### 3. エラーハンドリング
- `ApplicationError`を使用
- `ErrorCodes`で定義されたコードを使用
- エラーメッセージは英語で記載

### 4. イベント駆動
- `EventBus`を使用したイベント発行
- `GATHERING_STARTED`, `MATERIAL_SELECTED`, `GATHERING_ENDED`イベント

### 5. 型安全性
- TypeScriptの厳密な型定義
- `IGatheringService`インターフェースの実装
- 型ガード（`card.isGatheringCard()`）の活用

---

## 課題・改善点（Refactorフェーズで対応）

### 1. 強化カード効果の実装
現在の実装では強化カード（`enhancementCards`）を受け取っているが、効果は未実装。
- 「精霊の導き」: 提示回数+1
- 「幸運のお守り」: レア出現率+30%

### 2. アーティファクト効果の実装
アーティファクト効果も未実装。
- 「古代の地図」: 提示回数+1

### 3. レア素材の判定
`generateMaterialOptions()`でレア素材の判定ロジックは未実装。
現在は素材プールからランダムに選択するのみ。

### 4. セッション管理の拡張
現在は1つのセッションのみを想定しているが、複数セッションの同時進行も可能な設計。

### 5. コメントの整理
日本語コメントが非常に詳細だが、一部冗長な部分がある。

---

## ファイルサイズチェック

### 実装ファイル
- `gathering-service.ts`: 約550行（コメント含む）
  - 800行制限以下で問題なし ✅

### モック使用確認
- 実装コードにモック・スタブは含まれていない ✅
- モックはテストコード内でのみ使用 ✅

---

## 品質判定結果

### テスト実行
- ✅ テスト実行: 成功（16件全て成功）
- ✅ 期待される動作: 全テストが通ることを確認

### 期待値
- ✅ 期待値: 明確で具体的
- ✅ アサーション: 適切
- ✅ 実装方針: 明確

### ファイルサイズ
- ✅ ファイルサイズ: 800行以下

### モック使用
- ✅ モック使用: 実装コードにモック・スタブが含まれていない

### 信頼性レベルの分布
- **🔵 青信号（推測なし）**: 95%以上
  - 要件定義書、タスクノート、設計文書に明記されている実装
- **🟡 黄信号（妥当な推測）**: 5%未満
  - マスターデータ未読み込みエラーチェック

### 総合評価

**✅ 高品質**

- テスト実行: 成功（16件全て成功）
- 実装品質: シンプルかつ動作する
- リファクタ箇所: 明確に特定可能（強化カード効果、レア素材判定）
- 機能的問題: なし
- コンパイルエラー: なし
- ファイルサイズ: 800行以下
- モック使用: 実装コードにモック・スタブが含まれていない

---

## 次のステップ

次のお勧めステップ: `/tsumiki:tdd-refactor atelier-guild-rank TASK-0011` でRefactorフェーズ（品質改善）を開始します。

**Refactorフェーズで改善すべき点**:
1. 強化カード効果の実装
2. アーティファクト効果の実装
3. レア素材判定の実装
4. コメントの整理
5. コードの可読性向上

---

**最終更新**: 2026-01-16
