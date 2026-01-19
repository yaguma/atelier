# テストケース一覧: カードドラッグ＆ドロップ機能

**タスクID**: TASK-0042
**作成日**: 2026-01-20
**要件名**: atelier-guild-rank

## 概要

| カテゴリ | テストケース数 |
|---------|--------------|
| 正常系 | 18 |
| 異常系 | 8 |
| 境界値 | 6 |
| 統合 | 5 |
| **合計** | **37** |

---

## 1. 正常系テストケース

### DraggableCardUI

#### TC-001: DraggableCardUIのインスタンス生成

**対応要件**: FR-001

**Given（前提条件）**:
- 有効なPhaserシーンモックが準備されている
- 有効なCardエンティティが準備されている

**When（操作）**:
- new DraggableCardUI(scene, config)を呼び出す

**Then（期待結果）**:
- インスタンスが正常に生成される
- CardUIを継承している
- getCard()でカードが取得できる

**優先度**: 高

---

#### TC-002: ドラッグ開始時のonDragStartコールバック呼び出し

**対応要件**: FR-002, AC-001

**Given（前提条件）**:
- DraggableCardUIが生成されている
- onDragStartコールバックが設定されている

**When（操作）**:
- カードをドラッグ開始する（pointerdownイベント）

**Then（期待結果）**:
- onDragStartコールバックが呼び出される
- カードエンティティがコールバックに渡される

**優先度**: 高

---

#### TC-003: ドラッグ開始時の視覚効果適用

**対応要件**: FR-003, AC-002

**Given（前提条件）**:
- DraggableCardUIが生成されている
- interactive: trueが設定されている

**When（操作）**:
- カードをドラッグ開始する

**Then（期待結果）**:
- コンテナのスケールが1.1になる
- コンテナの透明度が0.8になる
- コンテナの深度が100に設定される

**優先度**: 高

---

#### TC-004: ドラッグ中の位置更新

**対応要件**: FR-004

**Given（前提条件）**:
- DraggableCardUIがドラッグ中の状態

**When（操作）**:
- ポインターを移動する（dragイベント）

**Then（期待結果）**:
- カードの位置がポインター位置に追従する
- onDragコールバックが呼び出される
- 現在の座標がコールバックに渡される

**優先度**: 高

---

#### TC-005: ドラッグ中のonDragコールバック呼び出し

**対応要件**: FR-004, AC-003

**Given（前提条件）**:
- DraggableCardUIがドラッグ中
- onDragコールバックが設定されている

**When（操作）**:
- ポインターを移動する

**Then（期待結果）**:
- onDragコールバックが呼び出される
- 引数にcard, x, yが渡される

**優先度**: 高

---

#### TC-006: ドラッグ終了時の視覚効果リセット

**対応要件**: FR-005, AC-004

**Given（前提条件）**:
- DraggableCardUIがドラッグ中の状態

**When（操作）**:
- ドラッグを終了する（pointerupイベント）

**Then（期待結果）**:
- コンテナのスケールが1.0に戻る
- コンテナの透明度が1.0に戻る
- コンテナの深度が0に戻る

**優先度**: 高

---

#### TC-007: ドラッグ開始位置の保存

**対応要件**: FR-006

**Given（前提条件）**:
- DraggableCardUIが位置(100, 200)に配置されている

**When（操作）**:
- ドラッグを開始する

**Then（期待結果）**:
- startPosition.xが100に設定される
- startPosition.yが200に設定される

**優先度**: 高

---

#### TC-008: isDragging状態の管理

**対応要件**: FR-007

**Given（前提条件）**:
- DraggableCardUIが生成されている

**When（操作）**:
1. ドラッグ開始
2. ドラッグ終了

**Then（期待結果）**:
- ドラッグ開始後、isDraggingがtrueになる
- ドラッグ終了後、isDraggingがfalseになる

**優先度**: 中

---

### DropZone

#### TC-009: DropZoneの登録

**対応要件**: FR-008, AC-005

**Given（前提条件）**:
- DropZoneManagerが初期化されている

**When（操作）**:
- registerZone(zone)を呼び出す

**Then（期待結果）**:
- ゾーンが正常に登録される
- findZoneAt()でゾーンを検索できる

**優先度**: 高

---

#### TC-010: DropZoneの解除

**対応要件**: FR-009

**Given（前提条件）**:
- DropZoneManagerにゾーンが登録されている

**When（操作）**:
- unregisterZone(id)を呼び出す

**Then（期待結果）**:
- ゾーンが削除される
- findZoneAt()でゾーンが見つからなくなる

**優先度**: 高

---

#### TC-011: 座標からDropZoneの検索

**対応要件**: FR-010, AC-006

**Given（前提条件）**:
- DropZoneManagerにゾーン（bounds: 100,100,200,200）が登録されている

**When（操作）**:
- findZoneAt(150, 150)を呼び出す

**Then（期待結果）**:
- 登録されたゾーンが返される

**優先度**: 高

---

#### TC-012: 座標がゾーン外の場合

**対応要件**: FR-010

**Given（前提条件）**:
- DropZoneManagerにゾーン（bounds: 100,100,200,200）が登録されている

**When（操作）**:
- findZoneAt(50, 50)を呼び出す

**Then（期待結果）**:
- nullが返される

**優先度**: 高

---

#### TC-013: accepts関数による受け入れ判定

**対応要件**: FR-011, AC-007

**Given（前提条件）**:
- DropZoneにaccepts関数（GATHERINGカードのみ受け入れ）が設定されている
- GATHERINGタイプのカードが準備されている

**When（操作）**:
- zone.accepts(gatheringCard)を呼び出す

**Then（期待結果）**:
- trueが返される

**優先度**: 高

---

#### TC-014: accepts関数で拒否される場合

**対応要件**: FR-011

**Given（前提条件）**:
- DropZoneにaccepts関数（GATHERINGカードのみ受け入れ）が設定されている
- RECIPEタイプのカードが準備されている

**When（操作）**:
- zone.accepts(recipeCard)を呼び出す

**Then（期待結果）**:
- falseが返される

**優先度**: 高

---

### ドロップ処理

#### TC-015: 有効なドロップゾーンへのドロップ成功

**対応要件**: FR-012, AC-008

**Given（前提条件）**:
- DraggableCardUIがドラッグ中
- 有効なDropZoneが存在する
- ドロップ位置がゾーン内

**When（操作）**:
- ドラッグを終了する

**Then（期待結果）**:
- onDropコールバックがゾーン情報と共に呼ばれる
- zone.onDrop(card)が呼ばれる

**優先度**: 高

---

#### TC-016: ドロップゾーン外でのドロップ

**対応要件**: FR-013, AC-009

**Given（前提条件）**:
- DraggableCardUIがドラッグ中
- ドロップ位置がゾーン外

**When（操作）**:
- ドラッグを終了する

**Then（期待結果）**:
- onDropコールバックがnullと共に呼ばれる
- カードが元の位置にアニメーションで戻る

**優先度**: 高

---

#### TC-017: 元の位置に戻るアニメーション

**対応要件**: FR-014, AC-010

**Given（前提条件）**:
- DraggableCardUIが位置(100, 200)から位置(300, 400)にドラッグされた
- ドロップ位置がゾーン外

**When（操作）**:
- ドラッグを終了する

**Then（期待結果）**:
- Tweenアニメーションが開始される
- 200ms、Power2イージングで元の位置に戻る
- アニメーション後、位置が(100, 200)になる

**優先度**: 高

---

#### TC-018: destroy時のイベントリスナー削除

**対応要件**: FR-015, NFR-001

**Given（前提条件）**:
- DraggableCardUIが生成されている
- イベントリスナーが登録されている

**When（操作）**:
- destroy()を呼び出す

**Then（期待結果）**:
- dragstartリスナーが削除される
- dragリスナーが削除される
- dragendリスナーが削除される
- コンテナが破棄される

**優先度**: 高

---

## 2. 異常系テストケース

#### TC-101: cardがnullの場合のコンストラクタ

**対応要件**: ERR-001

**Given（前提条件）**:
- 有効なPhaserシーンモックが準備されている

**When（操作）**:
- new DraggableCardUI(scene, { card: null, x: 0, y: 0 })を呼び出す

**Then（期待結果）**:
- Errorがスローされる
- エラーメッセージに'card'が含まれる

**優先度**: 高

---

#### TC-102: sceneがnullの場合のコンストラクタ

**対応要件**: ERR-002

**Given（前提条件）**:
- 有効なCardエンティティが準備されている

**When（操作）**:
- new DraggableCardUI(null, config)を呼び出す

**Then（期待結果）**:
- Errorがスローされる

**優先度**: 高

---

#### TC-103: DropZoneManagerが未初期化の場合

**対応要件**: ERR-003

**Given（前提条件）**:
- DropZoneManagerが初期化されていない

**When（操作）**:
- findZoneAt()を呼び出す

**Then（期待結果）**:
- nullが返される
- エラーがスローされない

**優先度**: 中

---

#### TC-104: 重複するzone idの登録

**対応要件**: ERR-004

**Given（前提条件）**:
- DropZoneManagerにid='zone1'のゾーンが登録されている

**When（操作）**:
- 同じid='zone1'で別のゾーンを登録する

**Then（期待結果）**:
- 警告ログが出力される
- 新しいゾーンで上書きされる

**優先度**: 低

---

#### TC-105: interactive: falseの場合

**対応要件**: ERR-005

**Given（前提条件）**:
- interactive: falseでDraggableCardUIが生成されている

**When（操作）**:
- ドラッグ操作を試みる

**Then（期待結果）**:
- ドラッグイベントが発火しない
- onDragStartが呼ばれない

**優先度**: 中

---

#### TC-106: ドラッグ中にコンポーネントが破棄される

**対応要件**: ERR-006, NFR-002

**Given（前提条件）**:
- DraggableCardUIがドラッグ中

**When（操作）**:
- destroy()を呼び出す

**Then（期待結果）**:
- メモリリークが発生しない
- イベントリスナーが削除される
- 進行中のTweenがキャンセルされる

**優先度**: 高

---

#### TC-107: onDropコールバックが未設定の場合

**対応要件**: ERR-007

**Given（前提条件）**:
- onDropコールバックが設定されていない
- ドラッグを終了する

**When（操作）**:
- ドロップ処理を実行

**Then（期待結果）**:
- エラーがスローされない
- デフォルトの動作（元の位置に戻る）が実行される

**優先度**: 中

---

#### TC-108: accepts関数がエラーをスローする場合

**対応要件**: ERR-008

**Given（前提条件）**:
- accepts関数が例外をスローするように設定されている

**When（操作）**:
- ゾーンの受け入れ判定を実行

**Then（期待結果）**:
- エラーがキャッチされる
- falseが返される（安全側に倒す）

**優先度**: 低

---

## 3. 境界値テストケース

#### TC-201: ドラッグオフセットの計算（カード中央をドラッグ）

**対応要件**: FR-016

**Given（前提条件）**:
- カードサイズが120x160
- カード位置が(100, 200)
- ポインター位置が(100, 200)（カード中央）

**When（操作）**:
- ドラッグを開始する

**Then（期待結果）**:
- dragOffsetが(0, 0)に設定される
- カードがポインターに正確に追従する

**優先度**: 中

---

#### TC-202: ドラッグオフセットの計算（カード端をドラッグ）

**対応要件**: FR-016

**Given（前提条件）**:
- カードサイズが120x160
- カード位置が(100, 200)
- ポインター位置が(50, 150)（カードの左上付近）

**When（操作）**:
- ドラッグを開始する

**Then（期待結果）**:
- dragOffsetが(50, 50)に設定される
- ドラッグ中のカード位置が適切に計算される

**優先度**: 中

---

#### TC-203: 複数のDropZoneが重なっている場合

**対応要件**: FR-017

**Given（前提条件）**:
- zone1（bounds: 100,100,200,200）が登録されている
- zone2（bounds: 150,150,200,200）が登録されている
- zone2がzone1より後に登録されている

**When（操作）**:
- findZoneAt(175, 175)を呼び出す

**Then（期待結果）**:
- 最初に見つかったゾーン（zone1）が返される

**優先度**: 中

---

#### TC-204: ゾーン境界上の座標

**対応要件**: FR-010

**Given（前提条件）**:
- zone（bounds: 100,100,100,100）が登録されている

**When（操作）**:
- findZoneAt(100, 100)を呼び出す（左上角）

**Then（期待結果）**:
- ゾーンが見つかる

**優先度**: 中

---

#### TC-205: ゾーン境界外の1px外側

**対応要件**: FR-010

**Given（前提条件）**:
- zone（bounds: 100,100,100,100）が登録されている

**When（操作）**:
- findZoneAt(99, 100)を呼び出す（1px左）

**Then（期待結果）**:
- nullが返される

**優先度**: 中

---

#### TC-206: 深度の変更と復元

**対応要件**: FR-018

**Given（前提条件）**:
- カードの初期深度が10に設定されている

**When（操作）**:
1. ドラッグを開始する
2. ドラッグを終了する

**Then（期待結果）**:
- ドラッグ中は深度が100に変更される
- ドラッグ終了後は深度が10に戻る

**優先度**: 中

---

## 4. 統合テストケース

#### TC-301: ドラッグ開始→移動→ドロップ成功の一連の流れ

**対応要件**: FR-001〜FR-015

**Given（前提条件）**:
- DraggableCardUIが(100, 200)に配置されている
- DropZoneが(300, 300, 200, 200)に登録されている
- 全コールバックが設定されている

**When（操作）**:
1. (100, 200)でドラッグ開始
2. (400, 400)に移動
3. ドラッグ終了

**Then（期待結果）**:
- onDragStartが1回呼ばれる
- onDragが複数回呼ばれる
- onDropがゾーン情報と共に呼ばれる
- zone.onDropが呼ばれる

**優先度**: 高

---

#### TC-302: ドラッグ開始→移動→ドロップ失敗（ゾーン外）の一連の流れ

**対応要件**: FR-001〜FR-014

**Given（前提条件）**:
- DraggableCardUIが(100, 200)に配置されている
- DropZoneが(300, 300, 200, 200)に登録されている

**When（操作）**:
1. (100, 200)でドラッグ開始
2. (50, 50)に移動（ゾーン外）
3. ドラッグ終了

**Then（期待結果）**:
- onDropがnullと共に呼ばれる
- カードが(100, 200)にアニメーションで戻る
- 200msのTweenアニメーションが実行される

**優先度**: 高

---

#### TC-303: DropZoneManagerのライフサイクル

**対応要件**: FR-008, FR-009

**Given（前提条件）**:
- DropZoneManagerが初期化されている

**When（操作）**:
1. 3つのゾーンを登録
2. 1つのゾーンを解除
3. 全ゾーンを検索

**Then（期待結果）**:
- 2つのゾーンのみが見つかる
- 解除されたゾーンは見つからない

**優先度**: 中

---

#### TC-304: 複数カードのドラッグ管理

**対応要件**: NFR-003

**Given（前提条件）**:
- 3つのDraggableCardUIが配置されている

**When（操作）**:
1. カード1をドラッグ開始
2. カード2をドラッグ開始しようとする

**Then（期待結果）**:
- 一度に1つのカードのみドラッグ可能
- カード1がドラッグ中はカード2のドラッグが開始しない

**優先度**: 中

---

#### TC-305: DropZoneのハイライト表示

**対応要件**: FR-019, AC-011

**Given（前提条件）**:
- 複数のDropZoneが登録されている
- accepts関数がGATHERINGカードのみを受け入れる

**When（操作）**:
- GATHERINGカードをドラッグ開始する

**Then（期待結果）**:
- 受け入れ可能なゾーンが緑色（0x00FF00）でハイライトされる
- 受け入れ不可のゾーンが赤色（0xFF0000）でハイライトされる
- ドラッグ終了後、ハイライトが消える

**優先度**: 中

---

## テストデータ

### 正常系テストデータ

```typescript
const validCard = createMockCard({
  id: 'card-001',
  name: 'テストカード',
  type: 'GATHERING',
  cost: 1,
});

const validConfig: DraggableCardConfig = {
  card: validCard,
  x: 100,
  y: 200,
  interactive: true,
  onDragStart: vi.fn(),
  onDrag: vi.fn(),
  onDrop: vi.fn(),
};

const validDropZone: DropZone = {
  id: 'play-area',
  bounds: new Phaser.Geom.Rectangle(300, 300, 200, 200),
  accepts: (card) => card.type === 'GATHERING',
  onDrop: vi.fn(),
};
```

### 異常系テストデータ

```typescript
const invalidCardConfig = {
  card: null,
  x: 100,
  y: 200,
};

const duplicateIdZone: DropZone = {
  id: 'play-area', // 既存と同じID
  bounds: new Phaser.Geom.Rectangle(0, 0, 100, 100),
  accepts: () => true,
  onDrop: vi.fn(),
};
```

### 境界値テストデータ

```typescript
const edgeCaseData = {
  cardCenterDrag: {
    cardPosition: { x: 100, y: 200 },
    pointerPosition: { x: 100, y: 200 },
    expectedOffset: { x: 0, y: 0 },
  },
  cardEdgeDrag: {
    cardPosition: { x: 100, y: 200 },
    pointerPosition: { x: 50, y: 150 },
    expectedOffset: { x: 50, y: 50 },
  },
  zoneBoundary: {
    zone: { x: 100, y: 100, width: 100, height: 100 },
    insidePoint: { x: 100, y: 100 },
    outsidePoint: { x: 99, y: 100 },
  },
};
```

---

## モック定義

### Phaserシーンモック

```typescript
const createMockScene = () => {
  const mockContainer = {
    x: 0,
    y: 0,
    setPosition: vi.fn().mockImplementation(function(x, y) {
      this.x = x;
      this.y = y;
      return this;
    }),
    setScale: vi.fn().mockReturnThis(),
    setAlpha: vi.fn().mockReturnThis(),
    setDepth: vi.fn().mockReturnThis(),
    add: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  };

  const mockRectangle = {
    setInteractive: vi.fn().mockReturnThis(),
    setStrokeStyle: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
  };

  const mockTweens = {
    add: vi.fn().mockImplementation((config) => {
      // 即座にonCompleteを呼び出す
      config.onComplete?.();
      return { stop: vi.fn() };
    }),
  };

  return {
    add: {
      container: vi.fn().mockReturnValue(mockContainer),
      rectangle: vi.fn().mockReturnValue(mockRectangle),
      text: vi.fn().mockReturnValue({ setOrigin: vi.fn().mockReturnThis() }),
    },
    input: {
      on: vi.fn(),
      off: vi.fn(),
    },
    tweens: mockTweens,
  };
};
```

### Cardエンティティモック

```typescript
const createMockCard = (overrides = {}) => ({
  id: 'card-001',
  name: 'テストカード',
  type: 'GATHERING',
  cost: 1,
  master: { materialPool: [] },
  isGatheringCard: vi.fn().mockReturnValue(true),
  isRecipeCard: vi.fn().mockReturnValue(false),
  isEnhancementCard: vi.fn().mockReturnValue(false),
  ...overrides,
});
```

### DropZoneManagerモック

```typescript
const createMockDropZoneManager = () => {
  const zones = new Map<string, DropZone>();

  return {
    registerZone: vi.fn().mockImplementation((zone) => {
      zones.set(zone.id, zone);
    }),
    unregisterZone: vi.fn().mockImplementation((id) => {
      zones.delete(id);
    }),
    findZoneAt: vi.fn().mockImplementation((x, y) => {
      for (const zone of zones.values()) {
        if (zone.bounds.contains(x, y)) {
          return zone;
        }
      }
      return null;
    }),
    highlightValidZones: vi.fn(),
    clearHighlights: vi.fn(),
  };
};
```

---

## テスト実行順序

1. **インスタンス生成のテスト** (TC-001〜TC-002, TC-101〜TC-102)
   - DraggableCardUIの基本的な生成確認

2. **ドラッグ開始のテスト** (TC-003〜TC-004, TC-007〜TC-008)
   - ドラッグ開始時の状態変更と視覚効果

3. **ドラッグ中のテスト** (TC-004〜TC-005)
   - ドラッグ中の位置更新とコールバック

4. **DropZoneのテスト** (TC-009〜TC-014, TC-103〜TC-104)
   - DropZoneManagerの登録・検索機能

5. **ドロップ処理のテスト** (TC-015〜TC-017, TC-105〜TC-108)
   - ドロップ成功/失敗の処理

6. **境界値テスト** (TC-201〜TC-206)
   - オフセット計算、ゾーン境界判定

7. **クリーンアップのテスト** (TC-018, TC-106)
   - destroy時のリソース解放

8. **統合テスト** (TC-301〜TC-305)
   - 一連のワークフロー確認

---

## 注意事項

- **Phaserモックの使用**: 実際のPhaserエンジンは使用せず、モックを使用してテスト
- **イベントシミュレーション**: ポインターイベントをモックで発火させる
- **Tweenアニメーション**: vi.useFakeTimers()でアニメーション完了を制御
- **シングルトンのリセット**: 各テストケース後にDropZoneManagerをリセット
- **メモリリーク確認**: destroy()後にリスナーが削除されることを確認
- **テストの独立性**: 各テストは他のテストに依存しないように設計
- **カバレッジ目標**: 80%以上

---

**最終更新**: 2026-01-20
**作成者**: Claude (Zundamon)
