# テストケース一覧: ツールチップ表示システム

**タスクID**: TASK-0041
**作成日**: 2026-01-20
**要件名**: atelier-guild-rank

## 概要

| カテゴリ | テストケース数 |
|---------|--------------|
| 正常系 | 14 |
| 異常系 | 8 |
| 境界値 | 6 |
| 統合 | 4 |
| **合計** | **32** |

---

## 1. 正常系テストケース

### TC-001: シングルトンインスタンスの取得

**対応要件**: FR-001, AC-001

**Given（前提条件）**:
- TooltipManagerが未初期化の状態

**When（操作）**:
- getInstance()を呼び出す

**Then（期待結果）**:
- TooltipManagerのインスタンスが返される
- インスタンスはnullまたはundefinedではない

**優先度**: 高

---

### TC-002: シングルトンインスタンスの同一性確認

**対応要件**: FR-001, AC-001

**Given（前提条件）**:
- TooltipManagerが未初期化の状態

**When（操作）**:
- getInstance()を複数回（3回以上）呼び出す

**Then（期待結果）**:
- 全ての呼び出しで同一のインスタンスが返される
- 厳密等価（===）で比較してtrue

**優先度**: 高

---

### TC-003: シングルトンのリセット

**対応要件**: FR-001, NFR-004

**Given（前提条件）**:
- getInstance()でインスタンスが取得済み

**When（操作）**:
- resetInstance()を呼び出す
- 再度getInstance()を呼び出す

**Then（期待結果）**:
- リセット前後のインスタンスは異なる
- 新しいインスタンスが返される

**優先度**: 高

---

### TC-004: シーン初期化

**対応要件**: FR-002, AC-002

**Given（前提条件）**:
- TooltipManagerインスタンスが取得済み
- 有効なPhaserシーンモックが準備されている

**When（操作）**:
- initialize(scene)を呼び出す

**Then（期待結果）**:
- isInitialized()がtrueを返す
- scene.add.containerが呼び出される
- ツールチップコンテナが作成される

**優先度**: 高

---

### TC-005: シーン再初期化時のコンテナ破棄

**対応要件**: FR-002

**Given（前提条件）**:
- TooltipManagerが既に初期化済み
- 新しいPhaserシーンモックが準備されている

**When（操作）**:
- 再度initialize(newScene)を呼び出す

**Then（期待結果）**:
- 前のコンテナのdestroy()が呼び出される
- 新しいコンテナが作成される
- isInitialized()がtrueを返す

**優先度**: 中

---

### TC-006: ツールチップ表示（遅延なし）

**対応要件**: FR-003, AC-003

**Given（前提条件）**:
- TooltipManagerが初期化済み

**When（操作）**:
- show({ content: 'テスト', x: 100, y: 100, delay: 0 })を呼び出す

**Then（期待結果）**:
- ツールチップが即座に表示される
- isVisible()がtrueを返す
- 指定された座標にツールチップが配置される

**優先度**: 高

---

### TC-007: ツールチップ表示（遅延あり）

**対応要件**: FR-003, AC-003

**Given（前提条件）**:
- TooltipManagerが初期化済み
- vi.useFakeTimers()でタイマーをモック

**When（操作）**:
- show({ content: 'テスト', x: 100, y: 100, delay: 500 })を呼び出す
- vi.advanceTimersByTime(500)で時間を進める

**Then（期待結果）**:
- 500ms経過前はisVisible()がfalse
- 500ms経過後はisVisible()がtrue
- ツールチップが表示される

**優先度**: 高

---

### TC-008: デフォルト遅延の適用

**対応要件**: FR-003

**Given（前提条件）**:
- TooltipManagerが初期化済み
- vi.useFakeTimers()でタイマーをモック

**When（操作）**:
- show({ content: 'テスト', x: 100, y: 100 })を呼び出す（delayを省略）
- vi.advanceTimersByTime(500)で時間を進める

**Then（期待結果）**:
- デフォルト遅延500msが適用される
- 500ms経過後にツールチップが表示される

**優先度**: 中

---

### TC-009: ツールチップ非表示

**対応要件**: FR-004

**Given（前提条件）**:
- TooltipManagerが初期化済み
- ツールチップが表示中

**When（操作）**:
- hide()を呼び出す

**Then（期待結果）**:
- ツールチップが非表示になる
- isVisible()がfalseを返す

**優先度**: 高

---

### TC-010: 表示遅延のキャンセル

**対応要件**: FR-004, AC-004

**Given（前提条件）**:
- TooltipManagerが初期化済み
- vi.useFakeTimers()でタイマーをモック
- show()が呼び出され、遅延中

**When（操作）**:
- 遅延時間（500ms）経過前にhide()を呼び出す
- vi.advanceTimersByTime(1000)で時間を進める

**Then（期待結果）**:
- ツールチップは表示されない
- isVisible()がfalseを返す
- タイマーがキャンセルされる

**優先度**: 高

---

### TC-011: show()連続呼び出しでのタイマーリセット

**対応要件**: FR-003

**Given（前提条件）**:
- TooltipManagerが初期化済み
- vi.useFakeTimers()でタイマーをモック

**When（操作）**:
- show({ content: 'テスト1', x: 100, y: 100, delay: 500 })を呼び出す
- 200ms経過
- show({ content: 'テスト2', x: 200, y: 200, delay: 500 })を呼び出す
- さらに500ms経過

**Then（期待結果）**:
- 最初のshow()のタイマーはキャンセルされる
- 2回目のshow()から500ms後にツールチップが表示される
- 表示内容は'テスト2'

**優先度**: 中

---

### TC-012: コンテンツ更新

**対応要件**: FR-006

**Given（前提条件）**:
- TooltipManagerが初期化済み
- ツールチップが表示中

**When（操作）**:
- 新しいコンテンツでshow()を呼び出す

**Then（期待結果）**:
- テキスト内容が更新される
- 背景サイズがテキストに合わせて調整される

**優先度**: 中

---

### TC-013: リソース破棄

**対応要件**: FR-007, AC-007

**Given（前提条件）**:
- TooltipManagerが初期化済み
- ツールチップが表示中

**When（操作）**:
- destroy()を呼び出す

**Then（期待結果）**:
- コンテナのdestroy()が呼び出される
- isInitialized()がfalseを返す
- シーンへの参照がnullになる

**優先度**: 高

---

### TC-014: 再初期化可能性

**対応要件**: FR-007

**Given（前提条件）**:
- TooltipManagerが初期化済み
- destroy()が呼び出された後

**When（操作）**:
- 再度initialize(scene)を呼び出す

**Then（期待結果）**:
- isInitialized()がtrueを返す
- 新しいコンテナが作成される
- ツールチップの表示/非表示が正常に動作する

**優先度**: 中

---

## 2. 異常系テストケース

### TC-101: null sceneでの初期化

**対応要件**: ERR-001

**Given（前提条件）**:
- TooltipManagerインスタンスが取得済み

**When（操作）**:
- initialize(null)を呼び出す

**Then（期待結果）**:
- Errorがスローされる
- エラーメッセージに'scene'が含まれる

**優先度**: 高

---

### TC-102: undefined sceneでの初期化

**対応要件**: ERR-001

**Given（前提条件）**:
- TooltipManagerインスタンスが取得済み

**When（操作）**:
- initialize(undefined)を呼び出す

**Then（期待結果）**:
- Errorがスローされる
- エラーメッセージに'scene'が含まれる

**優先度**: 高

---

### TC-103: containerメソッドがないsceneでの初期化

**対応要件**: ERR-002

**Given（前提条件）**:
- TooltipManagerインスタンスが取得済み
- scene.add.containerがundefinedのモック

**When（操作）**:
- initialize(invalidScene)を呼び出す

**Then（期待結果）**:
- Errorがスローされる
- エラーメッセージに'container'が含まれる

**優先度**: 中

---

### TC-104: 初期化前のshow()呼び出し

**対応要件**: ERR-003

**Given（前提条件）**:
- TooltipManagerが未初期化（initialize()未呼び出し）

**When（操作）**:
- show({ content: 'テスト', x: 100, y: 100 })を呼び出す

**Then（期待結果）**:
- エラーがスローされない
- 何も表示されない
- isVisible()がfalseを返す

**優先度**: 高

---

### TC-105: 初期化前のhide()呼び出し

**対応要件**: ERR-004

**Given（前提条件）**:
- TooltipManagerが未初期化

**When（操作）**:
- hide()を呼び出す

**Then（期待結果）**:
- エラーがスローされない
- 正常に処理が完了する

**優先度**: 中

---

### TC-106: 空文字コンテンツでの表示

**対応要件**: ERR-005

**Given（前提条件）**:
- TooltipManagerが初期化済み

**When（操作）**:
- show({ content: '', x: 100, y: 100, delay: 0 })を呼び出す

**Then（期待結果）**:
- 空のツールチップが表示される
- エラーがスローされない

**優先度**: 低

---

### TC-107: NaN座標での表示

**対応要件**: ERR-006

**Given（前提条件）**:
- TooltipManagerが初期化済み
- console.warnをモック

**When（操作）**:
- show({ content: 'テスト', x: NaN, y: NaN, delay: 0 })を呼び出す

**Then（期待結果）**:
- 座標が0, 0として扱われる
- 警告ログが出力される
- ツールチップが表示される

**優先度**: 低

---

### TC-108: Infinity座標での表示

**対応要件**: ERR-006

**Given（前提条件）**:
- TooltipManagerが初期化済み
- console.warnをモック

**When（操作）**:
- show({ content: 'テスト', x: Infinity, y: -Infinity, delay: 0 })を呼び出す

**Then（期待結果）**:
- 座標が0, 0として扱われる
- 警告ログが出力される
- ツールチップが表示される

**優先度**: 低

---

## 3. 境界値テストケース

### TC-201: 画面右端での位置調整

**対応要件**: FR-005, AC-005

**Given（前提条件）**:
- TooltipManagerが初期化済み
- 画面幅: 800px
- ツールチップ幅: 200px

**When（操作）**:
- show({ content: 'テスト', x: 750, y: 100, delay: 0 })を呼び出す

**Then（期待結果）**:
- ツールチップが左方向にシフトされる
- 右端から10px以上のマージンが確保される
- 最終X座標が590以下

**優先度**: 高

---

### TC-202: 画面下端での位置調整

**対応要件**: FR-005, AC-006

**Given（前提条件）**:
- TooltipManagerが初期化済み
- 画面高さ: 600px
- ツールチップ高さ: 100px

**When（操作）**:
- show({ content: 'テスト', x: 100, y: 550, delay: 0 })を呼び出す

**Then（期待結果）**:
- ツールチップが上方向にシフトされる
- 下端から10px以上のマージンが確保される
- 最終Y座標が490以下

**優先度**: 高

---

### TC-203: 画面左上隅（最小値）での表示

**対応要件**: FR-005

**Given（前提条件）**:
- TooltipManagerが初期化済み

**When（操作）**:
- show({ content: 'テスト', x: 0, y: 0, delay: 0 })を呼び出す

**Then（期待結果）**:
- 最小マージン10pxが適用される
- X座標が10以上
- Y座標が10以上

**優先度**: 中

---

### TC-204: 負の座標での表示

**対応要件**: FR-005

**Given（前提条件）**:
- TooltipManagerが初期化済み

**When（操作）**:
- show({ content: 'テスト', x: -50, y: -30, delay: 0 })を呼び出す

**Then（期待結果）**:
- 最小マージン10pxが適用される
- X座標が10になる
- Y座標が10になる

**優先度**: 中

---

### TC-205: 遅延0msでの表示

**対応要件**: FR-003

**Given（前提条件）**:
- TooltipManagerが初期化済み

**When（操作）**:
- show({ content: 'テスト', x: 100, y: 100, delay: 0 })を呼び出す

**Then（期待結果）**:
- ツールチップが即座に表示される
- タイマーが使用されない

**優先度**: 中

---

### TC-206: 最大幅でのテキスト折り返し

**対応要件**: FR-006

**Given（前提条件）**:
- TooltipManagerが初期化済み
- 長いテキストコンテンツを準備

**When（操作）**:
- show({ content: '非常に長いテキストコンテンツ...', x: 100, y: 100, maxWidth: 150, delay: 0 })を呼び出す

**Then（期待結果）**:
- テキストが150pxで折り返される
- wordWrapが適用される
- 背景サイズが適切に調整される

**優先度**: 中

---

## 4. 統合テストケース

### TC-301: 表示→非表示→再表示の一連の動作

**対応要件**: FR-003, FR-004

**Given（前提条件）**:
- TooltipManagerが初期化済み

**When（操作）**:
1. show()を呼び出してツールチップを表示
2. hide()を呼び出して非表示
3. 再度show()を呼び出して表示

**Then（期待結果）**:
- 各ステップで正しい表示状態になる
- リソースリークがない
- isVisible()が正しい値を返す

**優先度**: 高

---

### TC-302: シーン初期化→使用→破棄→再初期化の一連の動作

**対応要件**: FR-002, FR-007

**Given（前提条件）**:
- TooltipManagerインスタンスが取得済み
- 複数のPhaserシーンモックが準備されている

**When（操作）**:
1. initialize(scene1)を呼び出す
2. show()、hide()を実行
3. destroy()を呼び出す
4. initialize(scene2)を呼び出す
5. show()、hide()を実行

**Then（期待結果）**:
- 全てのステップで正常に動作する
- scene1のコンテナは破棄される
- scene2で新しいコンテナが作成される

**優先度**: 高

---

### TC-303: 深度（depth）の確認

**対応要件**: NFR-002

**Given（前提条件）**:
- TooltipManagerが初期化済み

**When（操作）**:
- show()を呼び出してツールチップを表示

**Then（期待結果）**:
- コンテナのdepthが1000に設定される
- 他のUI要素（depth 500以下）より前面に表示される

**優先度**: 中

---

### TC-304: 複数のshow()呼び出しでの排他制御

**対応要件**: FR-003

**Given（前提条件）**:
- TooltipManagerが初期化済み

**When（操作）**:
1. show({ content: 'ツールチップ1', x: 100, y: 100, delay: 0 })を呼び出す
2. 即座にshow({ content: 'ツールチップ2', x: 200, y: 200, delay: 0 })を呼び出す

**Then（期待結果）**:
- 最新のshow()の内容のみが表示される
- ツールチップ2の内容が表示される
- ツールチップ1は非表示にされる

**優先度**: 中

---

## テストデータ

### 正常系テストデータ

```typescript
const validConfig = {
  content: 'これはテスト用のツールチップです',
  x: 100,
  y: 100,
  delay: 500,
  maxWidth: 200,
};

const minimalConfig = {
  content: 'シンプルなテキスト',
  x: 50,
  y: 50,
};
```

### 異常系テストデータ

```typescript
const emptyContentConfig = {
  content: '',
  x: 100,
  y: 100,
};

const invalidCoordinatesConfig = {
  content: 'テスト',
  x: NaN,
  y: Infinity,
};
```

### 境界値テストデータ

```typescript
const edgeCaseConfigs = {
  rightEdge: { content: 'テスト', x: 750, y: 100, delay: 0 },
  bottomEdge: { content: 'テスト', x: 100, y: 550, delay: 0 },
  topLeftCorner: { content: 'テスト', x: 0, y: 0, delay: 0 },
  negativeCoords: { content: 'テスト', x: -50, y: -30, delay: 0 },
  zeroDelay: { content: 'テスト', x: 100, y: 100, delay: 0 },
};
```

---

## モック定義

### Phaserシーンモック

```typescript
const createMockScene = () => {
  const mockContainer = {
    setPosition: vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis(),
    setDepth: vi.fn().mockReturnThis(),
    add: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    getBounds: vi.fn().mockReturnValue({ width: 200, height: 100 }),
  };

  const mockRectangle = {
    setOrigin: vi.fn().mockReturnThis(),
    setFillStyle: vi.fn().mockReturnThis(),
    setSize: vi.fn().mockReturnThis(),
  };

  const mockText = {
    setOrigin: vi.fn().mockReturnThis(),
    setStyle: vi.fn().mockReturnThis(),
    setText: vi.fn().mockReturnThis(),
    setWordWrapWidth: vi.fn().mockReturnThis(),
    setPosition: vi.fn().mockReturnThis(),
    getBounds: vi.fn().mockReturnValue({ width: 180, height: 80 }),
  };

  return {
    add: {
      container: vi.fn().mockReturnValue(mockContainer),
      rectangle: vi.fn().mockReturnValue(mockRectangle),
      text: vi.fn().mockReturnValue(mockText),
    },
    cameras: {
      main: {
        width: 800,
        height: 600,
      },
    },
  };
};
```

### タイマーモック

```typescript
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});
```

---

## テスト実行順序

1. **シングルトンパターンのテスト** (TC-001〜TC-003)
   - 基本的なインスタンス管理の確認

2. **初期化処理のテスト** (TC-004〜TC-005, TC-101〜TC-103)
   - 正常な初期化と異常系の確認

3. **表示/非表示のテスト** (TC-006〜TC-012, TC-104〜TC-108)
   - 基本的なshow/hide動作の確認

4. **境界値テスト** (TC-201〜TC-206)
   - 画面端や特殊値の処理確認

5. **リソース管理のテスト** (TC-013〜TC-014)
   - destroy()と再初期化の確認

6. **統合テスト** (TC-301〜TC-304)
   - 一連のワークフロー確認

---

## 注意事項

- **Phaserモックの使用**: 実際のPhaserエンジンは使用せず、モックを使用してテスト
- **タイマーモック**: vi.useFakeTimers()を使用して遅延処理をテスト
- **シングルトンのリセット**: 各テストケースの前にresetInstance()を呼び出す
- **メモリリーク確認**: destroy()後にコンテナ参照がnullになることを確認
- **テストの独立性**: 各テストは他のテストに依存しないように設計
- **カバレッジ目標**: 80%以上（NFR-004準拠）
