# GatheringService Red-phaseファイル

**作成日**: 2026-01-16
**タスクID**: TASK-0011
**要件名**: atelier-guild-rank
**機能名**: GatheringService（ドラフト採取）
**フェーズ**: Red（失敗するテスト作成）

---

## 概要

GatheringServiceのTDD開発におけるRedフェーズとして、16件の失敗するテストケースを作成しました。

### 作成したテストケース

- **正常系テストケース**: 6件（T-0011-01〜T-0011-06）
- **異常系テストケース**: 4件（T-0011-E01〜T-0011-E04）
- **境界値テストケース**: 6件（T-0011-B01〜T-0011-B06）
- **合計**: 16件

---

## テストコードの全文

### テストファイルパス

- **テストファイル**: `atelier-guild-rank/tests/unit/application/services/gathering-service.test.ts`

### テストコードの詳細

テストコードは以下の構成で作成しました：

#### モックデータ

- **素材マスターデータ**: 7種類（薬草、キノコ、木材、清水、鉱石、雑草、水）
- **採取地カードマスターデータ**: 4種類（裏庭、近くの森、山麓の岩場、古代遺跡）
- **レシピカードマスターデータ**: 1種類（エラーケース用）

#### モックサービス

- **MockMasterDataRepository**: マスターデータの取得をモック化
- **MockEventBus**: イベント発行をモック化
- **MockMaterialService**: 素材インスタンス生成をモック化

---

## 作成したテストケース一覧

### 1. 正常系テストケース（6件）

#### T-0011-01: ドラフト採取開始（基本動作）
- **テスト目的**: 採取地カードを指定して採取セッションを開始できること
- **期待される動作**: DraftSessionが生成され、3つの素材オプションが提示され、提示回数が設定される
- **信頼性レベル**: 🔵（タスクノート・要件定義書に明記）

#### T-0011-02: 素材選択（基本動作）
- **テスト目的**: 提示された素材オプションから1つを選択し、獲得できること
- **期待される動作**: 選択した素材がインスタンス化され、セッションに追加される
- **信頼性レベル**: 🔵（タスクノート・要件定義書に明記）

#### T-0011-03: 素材スキップ（基本動作）
- **テスト目的**: 素材を選ばずに次のラウンドに進めること
- **期待される動作**: 素材を獲得せずにラウンドが進行する
- **信頼性レベル**: 🔵（タスクノート・要件定義書に明記）

#### T-0011-04: 採取終了（獲得素材リスト返却、コスト計算）
- **テスト目的**: 採取セッションを終了し、獲得した素材とコストを計算できること
- **期待される動作**: 獲得した素材リストとコスト情報が返される
- **信頼性レベル**: 🔵（タスクノート・要件定義書に明記）

#### T-0011-05: カード効果適用（提示回数が効果通り）
- **テスト目的**: 強化カードの効果により提示回数が増加すること
- **期待される動作**: 基本提示回数に強化カードの効果が加算される
- **信頼性レベル**: 🔵（タスクノート・要件定義書に明記）
- **注意**: 強化カードの実装は後回しとし、現時点では基本提示回数のテストのみ

#### T-0011-06: 選択回数上限到達
- **テスト目的**: 提示回数の上限に達したら自動的に採取が完了すること
- **期待される動作**: currentRoundがmaxRoundsを超えたらisCompleteがtrueになる
- **信頼性レベル**: 🔵（タスクノート・要件定義書に明記）

### 2. 異常系テストケース（4件）

#### T-0011-E01: 存在しないセッションIDで素材選択
- **テスト目的**: 存在しないセッションIDのエラーハンドリングを確認
- **期待される動作**: `ApplicationError`がスローされる（エラーコード: `SESSION_NOT_FOUND`）
- **信頼性レベル**: 🔵（要件定義書に明記）
- **注意**: エラーコード`SESSION_NOT_FOUND`は`errors.ts`に追加する必要がある

#### T-0011-E02: 無効な素材インデックスで素材選択
- **テスト目的**: 無効なインデックスのエラーハンドリングを確認
- **期待される動作**: `ApplicationError`がスローされる（エラーコード: `INVALID_SELECTION`）
- **信頼性レベル**: 🔵（要件定義書に明記）
- **注意**: エラーコード`INVALID_SELECTION`は`errors.ts`に追加する必要がある

#### T-0011-E03: 採取地カード以外のカードで採取開始
- **テスト目的**: 不正なカードタイプのエラーハンドリングを確認
- **期待される動作**: `ApplicationError`がスローされる（エラーコード: `INVALID_CARD_TYPE`）
- **信頼性レベル**: 🔵（要件定義書に明記）
- **注意**: エラーコード`INVALID_CARD_TYPE`は`errors.ts`に追加する必要がある

#### T-0011-E04: マスターデータ未読み込み時に採取開始
- **テスト目的**: マスターデータ未読み込み時のエラーハンドリングを確認
- **期待される動作**: `ApplicationError`がスローされる（エラーコード: `DATA_NOT_LOADED`）
- **信頼性レベル**: 🟡（要件定義書に記載あり、エラーコードは既存定義を使用）

### 3. 境界値テストケース（6件）

#### T-0011-B01: 最小提示回数（2回）での採取
- **テスト目的**: 最小提示回数での動作を確認
- **期待される動作**: 2回の素材選択後、isCompleteがtrueになる
- **信頼性レベル**: 🔵（要件定義書に明記）

#### T-0011-B02: 最大提示回数（5回）での採取
- **テスト目的**: 最大提示回数での動作を確認
- **期待される動作**: 5回の素材選択後、isCompleteがtrueになる
- **信頼性レベル**: 🔵（要件定義書に明記）

#### T-0011-B03: 0個選択（偵察のみ）でのコスト計算
- **テスト目的**: 0個選択時のコスト計算を確認
- **期待される動作**: actionPointCostが基本コストのみ、extraDaysが0
- **信頼性レベル**: 🔵（要件定義書に明記）

#### T-0011-B04: 7個選択（翌日持越しペナルティ）でのコスト計算
- **テスト目的**: 翌日持越しペナルティの境界値を確認
- **期待される動作**: extraDaysが1になる
- **信頼性レベル**: 🔵（要件定義書に明記）

#### T-0011-B05: 6個選択（ペナルティなし上限）でのコスト計算
- **テスト目的**: ペナルティなし上限値を確認
- **期待される動作**: extraDaysが0のまま
- **信頼性レベル**: 🔵（要件定義書に明記）

#### T-0011-B06: nullセッションでgetCurrentSession()を実行
- **テスト目的**: nullセッション時の動作を確認
- **期待される動作**: nullが返される
- **信頼性レベル**: 🔵（要件定義書に明記）

---

## 期待される失敗

### テスト実行結果

```
Test Files  1 failed (1)
     Tests  16 failed (16)
  Start at  13:02:11
  Duration  4.39s
```

### 失敗理由

全てのテストが`TypeError: Cannot read properties of undefined`エラーで失敗しました。これは、GatheringServiceがまだ実装されていないためです。

具体的なエラー：
- `Cannot read properties of undefined (reading 'startDraftGathering')`
- `Cannot read properties of undefined (reading 'selectMaterial')`
- `Cannot read properties of undefined (reading 'skipSelection')`
- `Cannot read properties of undefined (reading 'endGathering')`
- `Cannot read properties of undefined (reading 'calculateGatheringCost')`
- `Cannot read properties of undefined (reading 'getCurrentSession')`

---

## Greenフェーズで実装すべき内容

### 1. インターフェース定義

**ファイル**: `atelier-guild-rank/src/domain/interfaces/gathering-service.interface.ts`

以下のインターフェースと型を定義する必要があります：

- `IGatheringService`: GatheringServiceのインターフェース
  - `startDraftGathering(card: Card, enhancementCards?: Card[]): DraftSession`
  - `selectMaterial(sessionId: string, materialIndex: number): MaterialInstance`
  - `skipSelection(sessionId: string): void`
  - `endGathering(sessionId: string): GatheringResult`
  - `getCurrentSession(): DraftSession | null`
  - `canGather(card: Card): boolean`
  - `calculateGatheringCost(baseCost: number, selectedCount: number): GatheringCostResult`
- `DraftSession`: ドラフト採取セッション
  - `sessionId: string`
  - `card: Card`
  - `currentRound: number`
  - `maxRounds: number`
  - `selectedMaterials: MaterialInstance[]`
  - `currentOptions: MaterialOption[]`
  - `isComplete: boolean`
- `MaterialOption`: 素材オプション
  - `materialId: MaterialId`
  - `quality: Quality`
  - `quantity: number`
- `GatheringResult`: 採取結果
  - `materials: MaterialInstance[]`
  - `cost: GatheringCostResult`
- `GatheringCostResult`: 採取コスト
  - `actionPointCost: number`
  - `extraDays: number`

### 2. GatheringServiceの実装

**ファイル**: `atelier-guild-rank/src/application/services/gathering-service.ts`

以下のメソッドを実装する必要があります：

1. **startDraftGathering()**
   - セッションIDを生成（`generateUniqueId('draft_session')`）
   - 提示回数を決定（カード基本値 + 強化カード効果）
   - 素材オプション3つを生成
   - DraftSessionを作成してactiveSessionsに保存
   - `GATHERING_STARTED`イベントを発行

2. **selectMaterial()**
   - セッション存在チェック（存在しない場合はエラー）
   - インデックス範囲チェック（0〜2、範囲外はエラー）
   - MaterialServiceで素材インスタンスを生成
   - セッションに素材を追加
   - ラウンドを進める
   - 次のラウンドの素材オプションを生成（最終ラウンドでない場合）
   - `MATERIAL_SELECTED`イベントを発行

3. **skipSelection()**
   - セッション存在チェック
   - ラウンドを進める
   - 次のラウンドの素材オプションを生成

4. **endGathering()**
   - セッション存在チェック
   - コスト計算（`calculateGatheringCost()`）
   - セッションを削除
   - `GATHERING_ENDED`イベントを発行
   - GatheringResultを返す

5. **calculateGatheringCost()**
   - 選択個数に応じた追加コストを計算
     - 0個: +0
     - 1〜2個: +1
     - 3〜4個: +2
     - 5〜6個: +3
     - 7個以上: +3、extraDays: +1
   - 基本コスト + 追加コストを計算

6. **getCurrentSession()**
   - 現在のアクティブセッションを返す
   - セッションがない場合はnullを返す

### 3. エラーコードの追加

**ファイル**: `atelier-guild-rank/src/shared/types/errors.ts`

以下のエラーコードを追加する必要があります：

```typescript
export const ErrorCodes = {
  // ... 既存のエラーコード

  // GatheringService関連
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
  INVALID_SELECTION: 'INVALID_SELECTION',
  INVALID_CARD_TYPE: 'INVALID_CARD_TYPE',

  // ... 以下略
} as const;
```

### 4. イベントタイプの追加

**ファイル**: `atelier-guild-rank/src/shared/types/events.ts`

以下のイベントタイプを追加する必要があります：

```typescript
export const GameEventType = {
  // ... 既存のイベントタイプ

  // GatheringService関連
  GATHERING_STARTED: 'GATHERING_STARTED',
  MATERIAL_SELECTED: 'MATERIAL_SELECTED',
  GATHERING_ENDED: 'GATHERING_ENDED',

  // ... 以下略
} as const;
```

---

## 品質判定結果

### テスト実行

- ✅ テスト実行: 成功（16件全て失敗することを確認）
- ✅ 期待される失敗: GatheringServiceが未実装のため、全テストが失敗

### 期待値

- ✅ 期待値: 明確で具体的
- ✅ アサーション: 適切
- ✅ 実装方針: 明確

### 信頼性レベルの分布

- **🔵 青信号（推測なし）**: 15件（93.8%）
  - 要件定義書、タスクノート、設計文書に明記されているテストケース
- **🟡 黄信号（妥当な推測）**: 1件（6.2%）
  - マスターデータ未読み込みエラーのテストケース（既存のエラーコードを使用）
- **🔴 赤信号（推測）**: 0件（0%）

### 総合評価

**✅ 高品質**

- テスト実行: 成功（失敗することを確認）
- 期待値: 明確で具体的
- アサーション: 適切
- 実装方針: 明確
- 信頼性レベル: 🔵（青信号）が93.8%と高い

---

## 次のステップ

次のお勧めステップ: `/tsumiki:tdd-green atelier-guild-rank TASK-0011` でGreenフェーズ（最小実装）を開始します。

---

**最終更新**: 2026-01-16
