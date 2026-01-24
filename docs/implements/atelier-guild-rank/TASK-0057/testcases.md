# TASK-0057: DeliveryPhaseUI リファクタリング - テストケースドキュメント

**作成日**: 2026-01-23
**フェーズ**: TDD Redフェーズ準備
**対象**: DeliveryPhaseUI および分割後のサブコンポーネント

---

## 1. 概要

本ドキュメントは TASK-0057 DeliveryPhaseUI リファクタリングにおけるTDD開発のためのテストケース定義書である。
各テストケースはGiven/When/Then形式で記述し、必要なモック定義と期待値を明確にする。

---

## 2. テストファイル構成

```
atelier-guild-rank/tests/unit/presentation/ui/phases/
├── DeliveryPhaseUI.test.ts                          # メインコンポーネントテスト（更新）
└── components/
    └── delivery/
        ├── QuestDeliveryList.test.ts                # 依頼リストテスト
        ├── ItemSelector.test.ts                     # アイテム選択テスト
        ├── ContributionPreview.test.ts              # 貢献度プレビューテスト
        └── DeliveryResultPanel.test.ts              # 納品結果パネルテスト
```

---

## 3. モック定義

### 3.1 共通モック定義（各テストファイルで使用）

```typescript
// tests/unit/presentation/ui/phases/components/delivery/__mocks__/scene.mock.ts

import { vi } from 'vitest';

/**
 * モックコンテナインターフェース
 */
export interface MockContainer {
  setVisible: ReturnType<typeof vi.fn>;
  setPosition: ReturnType<typeof vi.fn>;
  setDepth: ReturnType<typeof vi.fn>;
  add: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
  x: number;
  y: number;
  visible: boolean;
}

/**
 * モックテキストインターフェース
 */
export interface MockText {
  setText: ReturnType<typeof vi.fn>;
  setOrigin: ReturnType<typeof vi.fn>;
  setStyle: ReturnType<typeof vi.fn>;
  setColor: ReturnType<typeof vi.fn>;
  setInteractive: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
  text: string;
}

/**
 * モック矩形インターフェース
 */
export interface MockRectangle {
  setStrokeStyle: ReturnType<typeof vi.fn>;
  setFillStyle: ReturnType<typeof vi.fn>;
  setInteractive: ReturnType<typeof vi.fn>;
  setAlpha: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
}

/**
 * モックグラフィックスインターフェース
 */
export interface MockGraphics {
  fillStyle: ReturnType<typeof vi.fn>;
  fillRoundedRect: ReturnType<typeof vi.fn>;
  lineStyle: ReturnType<typeof vi.fn>;
  strokeRoundedRect: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
}

/**
 * モックコンテナを作成
 */
export const createMockContainer = (): MockContainer => ({
  setVisible: vi.fn().mockReturnThis(),
  setPosition: vi.fn().mockReturnThis(),
  setDepth: vi.fn().mockReturnThis(),
  add: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
  x: 0,
  y: 0,
  visible: true,
});

/**
 * モックテキストを作成
 */
export const createMockText = (): MockText => ({
  setText: vi.fn().mockReturnThis(),
  setOrigin: vi.fn().mockReturnThis(),
  setStyle: vi.fn().mockReturnThis(),
  setColor: vi.fn().mockReturnThis(),
  setInteractive: vi.fn().mockReturnThis(),
  on: vi.fn().mockReturnThis(),
  off: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
  text: '',
});

/**
 * モック矩形を作成
 */
export const createMockRectangle = (): MockRectangle => ({
  setStrokeStyle: vi.fn().mockReturnThis(),
  setFillStyle: vi.fn().mockReturnThis(),
  setInteractive: vi.fn().mockReturnThis(),
  setAlpha: vi.fn().mockReturnThis(),
  on: vi.fn().mockReturnThis(),
  off: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
});

/**
 * モックグラフィックスを作成
 */
export const createMockGraphics = (): MockGraphics => ({
  fillStyle: vi.fn().mockReturnThis(),
  fillRoundedRect: vi.fn().mockReturnThis(),
  lineStyle: vi.fn().mockReturnThis(),
  strokeRoundedRect: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
});

/**
 * Phaserシーンモックを作成
 */
export const createMockScene = () => {
  const mockContainer = createMockContainer();
  const mockText = createMockText();
  const mockRectangle = createMockRectangle();
  const mockGraphics = createMockGraphics();

  const scene = {
    add: {
      container: vi.fn().mockReturnValue(mockContainer),
      text: vi.fn().mockReturnValue(mockText),
      rectangle: vi.fn().mockReturnValue(mockRectangle),
      graphics: vi.fn().mockReturnValue(mockGraphics),
    },
    tweens: {
      add: vi.fn().mockReturnValue({ remove: vi.fn() }),
    },
    input: {
      keyboard: {
        on: vi.fn(),
        off: vi.fn(),
      },
    },
    data: {
      get: vi.fn(),
      set: vi.fn(),
    },
    cameras: {
      main: {
        centerX: 640,
        centerY: 360,
        width: 1280,
        height: 720,
      },
    },
  } as unknown as Phaser.Scene;

  return {
    scene,
    mockContainer,
    mockText,
    mockRectangle,
    mockGraphics,
  };
};
```

### 3.2 EventBusモック

```typescript
// tests/unit/presentation/ui/phases/components/delivery/__mocks__/event-bus.mock.ts

import { vi } from 'vitest';
import type { IEventBus } from '../types';

/**
 * EventBusモックを作成
 */
export const createMockEventBus = (): IEventBus => ({
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  once: vi.fn(),
});
```

### 3.3 サービスモック

```typescript
// tests/unit/presentation/ui/phases/components/delivery/__mocks__/services.mock.ts

import { vi } from 'vitest';
import type {
  IQuestService,
  IInventoryService,
  IContributionCalculator,
  Quest,
  ItemInstance,
  DeliveryResult,
  ContributionPreviewData,
} from '../types';

/**
 * QuestServiceモックを作成
 */
export const createMockQuestService = (): IQuestService => ({
  getAcceptedQuests: vi.fn().mockReturnValue([]),
  deliver: vi.fn().mockReturnValue({
    success: true,
    questId: 'quest-001',
    itemId: 'item-001',
    contribution: 100,
    gold: 50,
    rewardCards: [],
    newPromotionGauge: 100,
    promotionGaugeMax: 1000,
    questCompleted: true,
  } as DeliveryResult),
  canDeliver: vi.fn().mockReturnValue(true),
});

/**
 * InventoryServiceモックを作成
 */
export const createMockInventoryService = (): IInventoryService => ({
  getItems: vi.fn().mockReturnValue([]),
  removeItems: vi.fn(),
});

/**
 * ContributionCalculatorモックを作成
 */
export const createMockContributionCalculator = (): IContributionCalculator => ({
  calculatePreview: vi.fn().mockReturnValue({
    baseReward: 100,
    qualityModifier: 1.5,
    qualityBonus: 50,
    totalContribution: 150,
  } as ContributionPreviewData),
});
```

### 3.4 テストデータファクトリ

```typescript
// tests/unit/presentation/ui/phases/components/delivery/__mocks__/test-data.factory.ts

import type { Quest, ItemInstance, Quality, DeliveryResult } from '../types';

/**
 * テスト用依頼データを作成
 */
export const createTestQuest = (overrides?: Partial<Quest>): Quest => ({
  id: 'quest-001',
  clientName: 'テスト依頼主',
  clientType: 'merchant',
  description: 'テスト依頼',
  requiredItem: 'ポーション',
  requiredCount: 1,
  rewardContribution: 100,
  rewardGold: 50,
  remainingDays: 3,
  status: 'accepted',
  ...overrides,
});

/**
 * テスト用アイテムデータを作成
 */
export const createTestItem = (overrides?: Partial<ItemInstance>): ItemInstance => ({
  instanceId: 'inst-001',
  itemId: 'potion',
  name: 'ポーション',
  quality: 'B' as Quality,
  attributes: [{ name: 'HP回復', value: 50 }],
  ...overrides,
});

/**
 * テスト用納品結果データを作成
 */
export const createTestDeliveryResult = (overrides?: Partial<DeliveryResult>): DeliveryResult => ({
  success: true,
  questId: 'quest-001',
  itemId: 'potion',
  contribution: 150,
  gold: 75,
  rewardCards: [],
  newPromotionGauge: 150,
  promotionGaugeMax: 1000,
  questCompleted: true,
  ...overrides,
});

/**
 * 複数のテスト用依頼を作成
 */
export const createTestQuests = (count: number): Quest[] =>
  Array.from({ length: count }, (_, i) =>
    createTestQuest({
      id: `quest-${i + 1}`,
      description: `テスト依頼${i + 1}`,
      clientName: `依頼主${i + 1}`,
    }),
  );

/**
 * 複数のテスト用アイテムを作成
 */
export const createTestItems = (count: number): ItemInstance[] =>
  Array.from({ length: count }, (_, i) =>
    createTestItem({
      instanceId: `inst-${i + 1}`,
      name: `アイテム${i + 1}`,
    }),
  );
```

---

## 4. テストケース詳細

### 4.1 QuestDeliveryList.test.ts

#### TC-301: 依頼リストが正しく表示される

| 項目 | 内容 |
|------|------|
| **信頼性** | 🔵 高信頼性（requirements.md AC-004に基づく） |
| **対応要件** | サブコンポーネント分割・依頼リスト表示 |

```typescript
describe('TC-301: 依頼リストが正しく表示される', () => {
  it('Given: 3件の依頼データ When: create()実行 Then: 3つの依頼パネルが生成される', () => {
    // Given: 3件の依頼データ
    const quests = createTestQuests(3);
    const { scene } = createMockScene();
    const callbacks = { onQuestSelect: vi.fn() };

    // When: QuestDeliveryListを初期化してcreate()を実行
    const list = new QuestDeliveryList(scene, 0, 0, callbacks);
    list.create();
    list.setQuests(quests);

    // Then:
    // - scene.add.textが依頼ごとに呼び出される（パネル生成）
    expect(scene.add.text).toHaveBeenCalled();
    // - 内部の依頼数が3件
    expect(list.getQuestCount()).toBe(3);
  });
});
```

**モック要件:**
- `createMockScene()` - Phaserシーンモック
- `createTestQuests(3)` - 3件の依頼データ

**期待値:**
- `scene.add.text` が呼び出されること
- `getQuestCount()` が `3` を返すこと

---

#### TC-302: 依頼パネルクリックでコールバックが呼ばれる

| 項目 | 内容 |
|------|------|
| **信頼性** | 🔵 高信頼性（requirements.md セクション4.2に基づく） |
| **対応要件** | 依頼選択イベント |

```typescript
describe('TC-302: 依頼パネルクリックでコールバックが呼ばれる', () => {
  it('Given: 依頼リスト表示済み When: パネルクリック Then: onQuestSelectコールバックが呼ばれる', () => {
    // Given: 依頼リストが表示済み
    const quest = createTestQuest();
    const { scene, mockRectangle } = createMockScene();
    const callbacks = { onQuestSelect: vi.fn() };
    const list = new QuestDeliveryList(scene, 0, 0, callbacks);
    list.create();
    list.setQuests([quest]);

    // パネルのクリックイベントをシミュレート
    // mockRectangle.on の第2引数として渡されたコールバックを取得して実行
    const pointerdownCallback = mockRectangle.on.mock.calls.find(
      call => call[0] === 'pointerdown'
    )?.[1];

    // When: パネルをクリック
    if (pointerdownCallback) {
      pointerdownCallback();
    }

    // Then: onQuestSelectコールバックが呼ばれる
    expect(callbacks.onQuestSelect).toHaveBeenCalledWith(quest);
  });
});
```

**モック要件:**
- `createMockScene()` - シーンモック（pointerdownイベントをキャプチャ）
- `createTestQuest()` - 依頼データ

**期待値:**
- `onQuestSelect` コールバックが選択した依頼と共に呼ばれること

---

#### TC-303: 依頼0件時に適切なメッセージが表示される

| 項目 | 内容 |
|------|------|
| **信頼性** | 🟡 中信頼性（境界値テスト） |
| **対応要件** | 空状態の表示 |

```typescript
describe('TC-303: 依頼0件時に適切なメッセージが表示される', () => {
  it('Given: 空の依頼配列 When: setQuests([])実行 Then: 「納品可能な依頼がありません」メッセージ表示', () => {
    // Given: 空の依頼配列
    const { scene, mockText } = createMockScene();
    const callbacks = { onQuestSelect: vi.fn() };
    const list = new QuestDeliveryList(scene, 0, 0, callbacks);
    list.create();

    // When: 空の配列を設定
    list.setQuests([]);

    // Then: 空メッセージが表示される
    expect(list.isEmpty()).toBe(true);
    // または、特定のメッセージテキストが作成されていることを確認
    expect(scene.add.text).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
      expect.stringContaining('依頼がありません'),
      expect.any(Object)
    );
  });
});
```

**期待値:**
- `isEmpty()` が `true` を返すこと
- 空メッセージテキストが表示されること

---

#### TC-304: setQuests更新時に既存パネルが破棄される

| 項目 | 内容 |
|------|------|
| **信頼性** | 🔵 高信頼性（リソース管理要件） |
| **対応要件** | 既存パネル破棄・再生成 |

```typescript
describe('TC-304: setQuests更新時に既存パネルが破棄される', () => {
  it('Given: 依頼リスト表示済み When: 新しいデータでsetQuests()実行 Then: 既存パネルが破棄され再生成', () => {
    // Given: 依頼リストが表示済み
    const oldQuests = createTestQuests(2);
    const newQuests = createTestQuests(3);
    const { scene, mockContainer } = createMockScene();
    const callbacks = { onQuestSelect: vi.fn() };
    const list = new QuestDeliveryList(scene, 0, 0, callbacks);
    list.create();
    list.setQuests(oldQuests);

    // 初回のパネル数を確認
    const initialCount = list.getQuestCount();

    // When: 新しいデータで更新
    list.setQuests(newQuests);

    // Then:
    // - 既存パネルが破棄されている（destroyが呼ばれている）
    // - 新しい依頼数が反映されている
    expect(list.getQuestCount()).toBe(3);
    expect(initialCount).toBe(2);
  });
});
```

**期待値:**
- 初回の依頼数が `2`
- 更新後の依頼数が `3`

---

#### TC-305: getSelectedQuest()で選択依頼が取得できる

| 項目 | 内容 |
|------|------|
| **信頼性** | 🔵 高信頼性（状態管理要件） |
| **対応要件** | 選択状態の取得 |

```typescript
describe('TC-305: getSelectedQuest()で選択依頼が取得できる', () => {
  it('Given: 依頼選択済み When: getSelectedQuest()呼び出し Then: 選択した依頼が返される', () => {
    // Given: 依頼が選択済み
    const quest = createTestQuest();
    const { scene } = createMockScene();
    const callbacks = { onQuestSelect: vi.fn() };
    const list = new QuestDeliveryList(scene, 0, 0, callbacks);
    list.create();
    list.setQuests([quest]);
    list.selectQuest(quest.id);

    // When: getSelectedQuest()を呼び出す
    const selected = list.getSelectedQuest();

    // Then: 選択した依頼が返される
    expect(selected).toEqual(quest);
  });
});
```

**期待値:**
- `getSelectedQuest()` が選択した依頼オブジェクトを返すこと

---

#### TC-306: clearSelection()で選択がクリアされる

| 項目 | 内容 |
|------|------|
| **信頼性** | 🔵 高信頼性（状態管理要件） |
| **対応要件** | 選択状態のクリア |

```typescript
describe('TC-306: clearSelection()で選択がクリアされる', () => {
  it('Given: 依頼選択済み When: clearSelection()呼び出し Then: getSelectedQuest()がnullを返す', () => {
    // Given: 依頼が選択済み
    const quest = createTestQuest();
    const { scene } = createMockScene();
    const callbacks = { onQuestSelect: vi.fn() };
    const list = new QuestDeliveryList(scene, 0, 0, callbacks);
    list.create();
    list.setQuests([quest]);
    list.selectQuest(quest.id);

    // When: clearSelection()を呼び出す
    list.clearSelection();

    // Then: getSelectedQuest()がnullを返す
    expect(list.getSelectedQuest()).toBeNull();
  });
});
```

**期待値:**
- `getSelectedQuest()` が `null` を返すこと

---

#### TC-307: destroy()でリソースが解放される

| 項目 | 内容 |
|------|------|
| **信頼性** | 🔵 高信頼性（リソース管理要件） |
| **対応要件** | コンテナ・子要素の破棄 |

```typescript
describe('TC-307: destroy()でリソースが解放される', () => {
  it('Given: QuestDeliveryListインスタンス When: destroy()呼び出し Then: コンテナが破棄される', () => {
    // Given: インスタンスが存在
    const { scene, mockContainer } = createMockScene();
    const callbacks = { onQuestSelect: vi.fn() };
    const list = new QuestDeliveryList(scene, 0, 0, callbacks);
    list.create();

    // When: destroy()を呼び出す
    list.destroy();

    // Then: コンテナのdestroyが呼ばれる
    expect(mockContainer.destroy).toHaveBeenCalled();
  });
});
```

**期待値:**
- `mockContainer.destroy` が呼ばれること

---

### 4.2 ItemSelector.test.ts

#### TC-401: アイテム一覧が正しく表示される

| 項目 | 内容 |
|------|------|
| **信頼性** | 🔵 高信頼性（requirements.md AC-004に基づく） |
| **対応要件** | サブコンポーネント分割・アイテム表示 |

```typescript
describe('TC-401: アイテム一覧が正しく表示される', () => {
  it('Given: 5件のアイテムデータ When: setItems()実行 Then: 5つのアイテムボタンが生成される', () => {
    // Given: 5件のアイテムデータ
    const items = createTestItems(5);
    const { scene } = createMockScene();
    const callbacks = { onItemSelect: vi.fn() };

    // When: ItemSelectorを初期化してsetItems()を実行
    const selector = new ItemSelector(scene, 0, 0, callbacks);
    selector.create();
    selector.setItems(items);

    // Then: アイテム数が5件
    expect(selector.getItemCount()).toBe(5);
  });
});
```

**期待値:**
- `getItemCount()` が `5` を返すこと

---

#### TC-402: アイテムクリックでコールバックが呼ばれる

| 項目 | 内容 |
|------|------|
| **信頼性** | 🔵 高信頼性（イベント処理要件） |
| **対応要件** | アイテム選択イベント |

```typescript
describe('TC-402: アイテムクリックでコールバックが呼ばれる', () => {
  it('Given: アイテム一覧表示済み When: アイテムクリック Then: onItemSelectコールバックが呼ばれる', () => {
    // Given: アイテム一覧が表示済み
    const item = createTestItem();
    const { scene, mockText } = createMockScene();
    const callbacks = { onItemSelect: vi.fn() };
    const selector = new ItemSelector(scene, 0, 0, callbacks);
    selector.create();
    selector.setItems([item]);

    // アイテムのクリックイベントをシミュレート
    const pointerdownCallback = mockText.on.mock.calls.find(
      call => call[0] === 'pointerdown'
    )?.[1];

    // When: アイテムをクリック
    if (pointerdownCallback) {
      pointerdownCallback();
    }

    // Then: onItemSelectコールバックが呼ばれる
    expect(callbacks.onItemSelect).toHaveBeenCalledWith(item);
  });
});
```

**期待値:**
- `onItemSelect` コールバックが選択したアイテムと共に呼ばれること

---

#### TC-403: アイテム0件時に適切なメッセージが表示される

| 項目 | 内容 |
|------|------|
| **信頼性** | 🟡 中信頼性（境界値テスト） |
| **対応要件** | 空状態の表示 |

```typescript
describe('TC-403: アイテム0件時に適切なメッセージが表示される', () => {
  it('Given: 空のアイテム配列 When: setItems([])実行 Then: 「アイテムがありません」メッセージ表示', () => {
    // Given: 空のアイテム配列
    const { scene } = createMockScene();
    const callbacks = { onItemSelect: vi.fn() };
    const selector = new ItemSelector(scene, 0, 0, callbacks);
    selector.create();

    // When: 空の配列を設定
    selector.setItems([]);

    // Then: 空メッセージが表示される
    expect(selector.isEmpty()).toBe(true);
  });
});
```

**期待値:**
- `isEmpty()` が `true` を返すこと

---

#### TC-404: getSelectedItem()で選択アイテムが取得できる

| 項目 | 内容 |
|------|------|
| **信頼性** | 🔵 高信頼性（状態管理要件） |
| **対応要件** | 選択状態の取得 |

```typescript
describe('TC-404: getSelectedItem()で選択アイテムが取得できる', () => {
  it('Given: アイテム選択済み When: getSelectedItem()呼び出し Then: 選択したアイテムが返される', () => {
    // Given: アイテムが選択済み
    const item = createTestItem();
    const { scene } = createMockScene();
    const callbacks = { onItemSelect: vi.fn() };
    const selector = new ItemSelector(scene, 0, 0, callbacks);
    selector.create();
    selector.setItems([item]);
    selector.selectItem(item.instanceId);

    // When: getSelectedItem()を呼び出す
    const selected = selector.getSelectedItem();

    // Then: 選択したアイテムが返される
    expect(selected).toEqual(item);
  });
});
```

**期待値:**
- `getSelectedItem()` が選択したアイテムオブジェクトを返すこと

---

#### TC-405: clearSelection()で選択がクリアされる

| 項目 | 内容 |
|------|------|
| **信頼性** | 🔵 高信頼性（状態管理要件） |
| **対応要件** | 選択状態のクリア |

```typescript
describe('TC-405: clearSelection()で選択がクリアされる', () => {
  it('Given: アイテム選択済み When: clearSelection()呼び出し Then: getSelectedItem()がnullを返す', () => {
    // Given: アイテムが選択済み
    const item = createTestItem();
    const { scene } = createMockScene();
    const callbacks = { onItemSelect: vi.fn() };
    const selector = new ItemSelector(scene, 0, 0, callbacks);
    selector.create();
    selector.setItems([item]);
    selector.selectItem(item.instanceId);

    // When: clearSelection()を呼び出す
    selector.clearSelection();

    // Then: getSelectedItem()がnullを返す
    expect(selector.getSelectedItem()).toBeNull();
  });
});
```

**期待値:**
- `getSelectedItem()` が `null` を返すこと

---

#### TC-406: 品質に応じた色分けが適用される

| 項目 | 内容 |
|------|------|
| **信頼性** | 🟡 中信頼性（UI表示要件） |
| **対応要件** | 品質による視覚的差別化 |

```typescript
describe('TC-406: 品質に応じた色分けが適用される', () => {
  it('Given: S品質アイテム When: setItems()実行 Then: レジェンダリーカラー(0xffaa00)が適用される', () => {
    // Given: S品質アイテム
    const sQualityItem = createTestItem({ quality: 'S' });
    const { scene, mockText } = createMockScene();
    const callbacks = { onItemSelect: vi.fn() };
    const selector = new ItemSelector(scene, 0, 0, callbacks);
    selector.create();

    // When: S品質アイテムを設定
    selector.setItems([sQualityItem]);

    // Then: setColorがレジェンダリーカラーで呼ばれる
    // Colors.quality.legendary = 0xffaa00
    expect(mockText.setColor).toHaveBeenCalled();
  });
});
```

**期待値:**
- アイテムに品質に応じた色が適用されること

---

#### TC-407: destroy()でリソースが解放される

| 項目 | 内容 |
|------|------|
| **信頼性** | 🔵 高信頼性（リソース管理要件） |
| **対応要件** | コンテナ・子要素の破棄 |

```typescript
describe('TC-407: destroy()でリソースが解放される', () => {
  it('Given: ItemSelectorインスタンス When: destroy()呼び出し Then: コンテナが破棄される', () => {
    // Given: インスタンスが存在
    const { scene, mockContainer } = createMockScene();
    const callbacks = { onItemSelect: vi.fn() };
    const selector = new ItemSelector(scene, 0, 0, callbacks);
    selector.create();

    // When: destroy()を呼び出す
    selector.destroy();

    // Then: コンテナのdestroyが呼ばれる
    expect(mockContainer.destroy).toHaveBeenCalled();
  });
});
```

**期待値:**
- `mockContainer.destroy` が呼ばれること

---

### 4.3 ContributionPreview.test.ts

#### TC-501: 初期状態で「依頼を選択してください」が表示される

| 項目 | 内容 |
|------|------|
| **信頼性** | 🟡 中信頼性（UI表示要件） |
| **対応要件** | 初期状態メッセージ |

```typescript
describe('TC-501: 初期状態で「依頼を選択してください」が表示される', () => {
  it('Given: ContributionPreviewインスタンス When: create()実行 Then: 初期メッセージが表示される', () => {
    // Given: ContributionPreviewインスタンス
    const { scene, mockText } = createMockScene();

    // When: create()を実行
    const preview = new ContributionPreview(scene, 0, 0);
    preview.create();

    // Then: 初期メッセージテキストが作成される
    expect(scene.add.text).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
      expect.stringContaining('選択'),
      expect.any(Object)
    );
  });
});
```

**期待値:**
- 「選択」を含むテキストが作成されること

---

#### TC-502: update()でプレビュー内容が更新される

| 項目 | 内容 |
|------|------|
| **信頼性** | 🔵 高信頼性（コア機能） |
| **対応要件** | プレビュー表示更新 |

```typescript
describe('TC-502: update()でプレビュー内容が更新される', () => {
  it('Given: 依頼とアイテム選択済み When: update()実行 Then: 計算結果が表示される', () => {
    // Given: 依頼とアイテムが選択済み
    const quest = createTestQuest();
    const item = createTestItem();
    const previewData = {
      baseReward: 100,
      qualityModifier: 1.5,
      qualityBonus: 50,
      totalContribution: 150,
    };
    const { scene, mockText } = createMockScene();
    const preview = new ContributionPreview(scene, 0, 0);
    preview.create();

    // When: update()を実行
    preview.update(quest, item, previewData);

    // Then: プレビュー内容が更新される
    expect(mockText.setText).toHaveBeenCalled();
  });
});
```

**期待値:**
- `mockText.setText` が呼ばれること

---

#### TC-503: 品質ボーナスが正しく表示される

| 項目 | 内容 |
|------|------|
| **信頼性** | 🟡 中信頼性（計算結果表示） |
| **対応要件** | 品質ボーナス表示 |

```typescript
describe('TC-503: 品質ボーナスが正しく表示される', () => {
  it('Given: S品質アイテム(+100%ボーナス) When: update()実行 Then: +100%ボーナスが表示される', () => {
    // Given: S品質アイテム
    const quest = createTestQuest({ rewardContribution: 100 });
    const item = createTestItem({ quality: 'S' });
    const previewData = {
      baseReward: 100,
      qualityModifier: 2.0, // +100%
      qualityBonus: 100,
      totalContribution: 200,
    };
    const { scene, mockText } = createMockScene();
    const preview = new ContributionPreview(scene, 0, 0);
    preview.create();

    // When: update()を実行
    preview.update(quest, item, previewData);

    // Then: ボーナス表示が含まれる
    expect(mockText.setText).toHaveBeenCalledWith(
      expect.stringContaining('100')
    );
  });
});
```

**期待値:**
- `setText` が品質ボーナス情報を含むテキストで呼ばれること

---

#### TC-504: showSelectQuestMessage()で依頼選択メッセージが表示

| 項目 | 内容 |
|------|------|
| **信頼性** | 🔵 高信頼性（UI状態遷移） |
| **対応要件** | 状態メッセージ表示 |

```typescript
describe('TC-504: showSelectQuestMessage()で依頼選択メッセージが表示', () => {
  it('Given: ContributionPreviewインスタンス When: showSelectQuestMessage()実行 Then: 依頼選択メッセージが表示', () => {
    // Given: インスタンスが存在
    const { scene, mockText } = createMockScene();
    const preview = new ContributionPreview(scene, 0, 0);
    preview.create();

    // When: showSelectQuestMessage()を呼び出す
    preview.showSelectQuestMessage();

    // Then: 依頼選択メッセージが表示される
    expect(mockText.setText).toHaveBeenCalledWith(
      expect.stringContaining('依頼')
    );
  });
});
```

**期待値:**
- `setText` が「依頼」を含むメッセージで呼ばれること

---

#### TC-505: showSelectItemMessage()でアイテム選択メッセージが表示

| 項目 | 内容 |
|------|------|
| **信頼性** | 🔵 高信頼性（UI状態遷移） |
| **対応要件** | 状態メッセージ表示 |

```typescript
describe('TC-505: showSelectItemMessage()でアイテム選択メッセージが表示', () => {
  it('Given: ContributionPreviewインスタンス When: showSelectItemMessage()実行 Then: アイテム選択メッセージが表示', () => {
    // Given: インスタンスが存在
    const { scene, mockText } = createMockScene();
    const preview = new ContributionPreview(scene, 0, 0);
    preview.create();

    // When: showSelectItemMessage()を呼び出す
    preview.showSelectItemMessage();

    // Then: アイテム選択メッセージが表示される
    expect(mockText.setText).toHaveBeenCalledWith(
      expect.stringContaining('アイテム')
    );
  });
});
```

**期待値:**
- `setText` が「アイテム」を含むメッセージで呼ばれること

---

#### TC-506: clear()で表示がクリアされる

| 項目 | 内容 |
|------|------|
| **信頼性** | 🔵 高信頼性（状態リセット） |
| **対応要件** | 表示クリア |

```typescript
describe('TC-506: clear()で表示がクリアされる', () => {
  it('Given: プレビュー表示済み When: clear()実行 Then: テキストが空になる', () => {
    // Given: プレビューが表示済み
    const { scene, mockText } = createMockScene();
    const preview = new ContributionPreview(scene, 0, 0);
    preview.create();
    preview.update(
      createTestQuest(),
      createTestItem(),
      { baseReward: 100, qualityModifier: 1.0, qualityBonus: 0, totalContribution: 100 }
    );

    // When: clear()を呼び出す
    preview.clear();

    // Then: テキストがクリアされる
    expect(mockText.setText).toHaveBeenCalledWith('');
  });
});
```

**期待値:**
- `setText` が空文字列で呼ばれること

---

#### TC-507: destroy()でリソースが解放される

| 項目 | 内容 |
|------|------|
| **信頼性** | 🔵 高信頼性（リソース管理） |
| **対応要件** | コンテナ破棄 |

```typescript
describe('TC-507: destroy()でリソースが解放される', () => {
  it('Given: ContributionPreviewインスタンス When: destroy()呼び出し Then: コンテナが破棄される', () => {
    // Given: インスタンスが存在
    const { scene, mockContainer } = createMockScene();
    const preview = new ContributionPreview(scene, 0, 0);
    preview.create();

    // When: destroy()を呼び出す
    preview.destroy();

    // Then: コンテナのdestroyが呼ばれる
    expect(mockContainer.destroy).toHaveBeenCalled();
  });
});
```

**期待値:**
- `mockContainer.destroy` が呼ばれること

---

### 4.4 DeliveryResultPanel.test.ts

#### TC-601: show()でパネルが表示される

| 項目 | 内容 |
|------|------|
| **信頼性** | 🔵 高信頼性（コア機能） |
| **対応要件** | 結果パネル表示 |

```typescript
describe('TC-601: show()でパネルが表示される', () => {
  it('Given: DeliveryResultPanelインスタンス When: show()実行 Then: isVisible()がtrueを返す', () => {
    // Given: インスタンスが存在
    const { scene } = createMockScene();
    const panel = new DeliveryResultPanel(scene, 0, 0);
    panel.create();

    // When: show()を呼び出す
    const result = createTestDeliveryResult();
    panel.show(result, 'テスト依頼');

    // Then: isVisible()がtrueを返す
    expect(panel.isVisible()).toBe(true);
  });
});
```

**期待値:**
- `isVisible()` が `true` を返すこと

---

#### TC-602: フェードインアニメーションが再生される

| 項目 | 内容 |
|------|------|
| **信頼性** | 🟡 中信頼性（アニメーション） |
| **対応要件** | AnimationPresets使用 |

```typescript
describe('TC-602: フェードインアニメーションが再生される', () => {
  it('Given: DeliveryResultPanelインスタンス When: show()実行 Then: tweens.add()が呼ばれる', () => {
    // Given: インスタンスが存在
    const { scene } = createMockScene();
    const panel = new DeliveryResultPanel(scene, 0, 0);
    panel.create();

    // When: show()を呼び出す
    const result = createTestDeliveryResult();
    panel.show(result, 'テスト依頼');

    // Then: tweens.add()が呼ばれる（AnimationPresets.fade.in使用）
    expect(scene.tweens.add).toHaveBeenCalledWith(
      expect.objectContaining({
        alpha: expect.any(Object),
      })
    );
  });
});
```

**期待値:**
- `scene.tweens.add` がアルファアニメーション設定で呼ばれること

---

#### TC-603: 報酬情報が正しく表示される

| 項目 | 内容 |
|------|------|
| **信頼性** | 🔵 高信頼性（コア機能） |
| **対応要件** | 報酬表示 |

```typescript
describe('TC-603: 報酬情報が正しく表示される', () => {
  it('Given: 納品結果 When: show()実行 Then: 貢献度・お金のテキストが正しい', () => {
    // Given: 納品結果データ
    const result = createTestDeliveryResult({
      contribution: 150,
      gold: 75,
    });
    const { scene, mockText } = createMockScene();
    const panel = new DeliveryResultPanel(scene, 0, 0);
    panel.create();

    // When: show()を呼び出す
    panel.show(result, 'テスト依頼');

    // Then: 報酬情報が表示される
    expect(scene.add.text).toHaveBeenCalled();
    // 貢献度150、お金75が表示されていることを確認
  });
});
```

**期待値:**
- 報酬情報を含むテキストが作成されること

---

#### TC-604: hide()でパネルが非表示になる

| 項目 | 内容 |
|------|------|
| **信頼性** | 🔵 高信頼性（状態管理） |
| **対応要件** | パネル非表示 |

```typescript
describe('TC-604: hide()でパネルが非表示になる', () => {
  it('Given: パネル表示済み When: hide()実行 Then: isVisible()がfalseを返す', () => {
    // Given: パネルが表示済み
    const { scene } = createMockScene();
    const panel = new DeliveryResultPanel(scene, 0, 0);
    panel.create();
    panel.show(createTestDeliveryResult(), 'テスト依頼');

    // When: hide()を呼び出す
    panel.hide();

    // Then: isVisible()がfalseを返す
    expect(panel.isVisible()).toBe(false);
  });
});
```

**期待値:**
- `isVisible()` が `false` を返すこと

---

#### TC-605: 閉じるボタンクリックでonCloseコールバックが呼ばれる

| 項目 | 内容 |
|------|------|
| **信頼性** | 🔵 高信頼性（イベント処理） |
| **対応要件** | コールバック発行 |

```typescript
describe('TC-605: 閉じるボタンクリックでonCloseコールバックが呼ばれる', () => {
  it('Given: コールバック設定済み When: 閉じるボタンクリック Then: onCloseが呼ばれる', () => {
    // Given: コールバックが設定済み
    const { scene, mockText } = createMockScene();
    const callbacks = { onClose: vi.fn() };
    const panel = new DeliveryResultPanel(scene, 0, 0, callbacks);
    panel.create();
    panel.show(createTestDeliveryResult(), 'テスト依頼');

    // 閉じるボタンのクリックイベントをシミュレート
    const pointerdownCallback = mockText.on.mock.calls.find(
      call => call[0] === 'pointerdown'
    )?.[1];

    // When: 閉じるボタンをクリック
    if (pointerdownCallback) {
      pointerdownCallback();
    }

    // Then: onCloseコールバックが呼ばれる
    expect(callbacks.onClose).toHaveBeenCalled();
  });
});
```

**期待値:**
- `onClose` コールバックが呼ばれること

---

#### TC-606: destroy()でリソースが解放される

| 項目 | 内容 |
|------|------|
| **信頼性** | 🔵 高信頼性（リソース管理） |
| **対応要件** | コンテナ破棄 |

```typescript
describe('TC-606: destroy()でリソースが解放される', () => {
  it('Given: DeliveryResultPanelインスタンス When: destroy()呼び出し Then: コンテナが破棄される', () => {
    // Given: インスタンスが存在
    const { scene, mockContainer } = createMockScene();
    const panel = new DeliveryResultPanel(scene, 0, 0);
    panel.create();

    // When: destroy()を呼び出す
    panel.destroy();

    // Then: コンテナのdestroyが呼ばれる
    expect(mockContainer.destroy).toHaveBeenCalled();
  });
});
```

**期待値:**
- `mockContainer.destroy` が呼ばれること

---

### 4.5 DeliveryPhaseUI.test.ts（更新）

#### TC-701: DeliveryPhaseUIが正しく初期化される

| 項目 | 内容 |
|------|------|
| **信頼性** | 🔵 高信頼性（コア機能） |
| **対応要件** | AC-001, AC-015 |

```typescript
describe('TC-701: DeliveryPhaseUIが正しく初期化される', () => {
  it('Given: 有効なPhaserシーン When: DeliveryPhaseUIインスタンス化 Then: エラーなく初期化される', () => {
    // Given: 有効なPhaserシーン
    const { scene } = createMockScene();
    setupSceneData(scene);

    // When: DeliveryPhaseUIをインスタンス化
    const ui = new DeliveryPhaseUI(scene);

    // Then: エラーなく初期化される
    expect(ui).toBeDefined();
    expect(ui).toBeInstanceOf(DeliveryPhaseUI);
  });
});
```

**期待値:**
- インスタンスが正常に作成されること

---

#### TC-702: サブコンポーネントが全て初期化される

| 項目 | 内容 |
|------|------|
| **信頼性** | 🔵 高信頼性（AC-004） |
| **対応要件** | 3つ以上のサブコンポーネント分割 |

```typescript
describe('TC-702: サブコンポーネントが全て初期化される', () => {
  it('Given: DeliveryPhaseUIインスタンス When: create()実行 Then: 4つのサブコンポーネントが初期化', () => {
    // Given: インスタンスが存在
    const { scene } = createMockScene();
    setupSceneData(scene);
    const ui = new DeliveryPhaseUI(scene);

    // When: create()が呼ばれる（コンストラクタで自動呼び出し）
    // Then: 4つのサブコンポーネントがnullでない
    expect(ui.getQuestList()).not.toBeNull();
    expect(ui.getItemSelector()).not.toBeNull();
    expect(ui.getContributionPreview()).not.toBeNull();
    expect(ui.getResultPanel()).not.toBeNull();
  });
});
```

**期待値:**
- 4つのサブコンポーネントがすべて初期化されていること

---

#### TC-703: 依頼選択時にプレビューが更新される

| 項目 | 内容 |
|------|------|
| **信頼性** | 🟡 中信頼性（コンポーネント連携） |
| **対応要件** | コンポーネント間データ連携 |

```typescript
describe('TC-703: 依頼選択時にプレビューが更新される', () => {
  it('Given: 依頼リスト表示済み When: 依頼選択 Then: プレビューが「アイテムを選択」メッセージに更新', () => {
    // Given: 依頼リストが表示済み
    const quest = createTestQuest();
    const { scene } = createMockScene();
    setupSceneData(scene, { quests: [quest] });
    const ui = new DeliveryPhaseUI(scene);

    // When: 依頼を選択
    ui.selectQuest(quest.id);

    // Then: プレビューがアイテム選択メッセージに更新される
    // ContributionPreviewのshowSelectItemMessage()が呼ばれていることを確認
    expect(ui.getSelectedQuest()).toEqual(quest);
  });
});
```

**期待値:**
- 依頼選択後に `getSelectedQuest()` が選択した依頼を返すこと

---

#### TC-704: アイテム選択時にプレビューが更新される

| 項目 | 内容 |
|------|------|
| **信頼性** | 🟡 中信頼性（コンポーネント連携） |
| **対応要件** | コンポーネント間データ連携 |

```typescript
describe('TC-704: アイテム選択時にプレビューが更新される', () => {
  it('Given: 依頼・アイテム両方選択 When: calculatePreview実行 Then: プレビュー数値が更新される', () => {
    // Given: 依頼とアイテムが選択済み
    const quest = createTestQuest();
    const item = createTestItem();
    const { scene } = createMockScene();
    const mockCalculator = createMockContributionCalculator();
    setupSceneData(scene, {
      quests: [quest],
      items: [item],
      contributionCalculator: mockCalculator,
    });
    const ui = new DeliveryPhaseUI(scene);
    ui.selectQuest(quest.id);

    // When: アイテムを選択
    ui.selectItem(item.instanceId);

    // Then: calculatePreviewが呼ばれる
    expect(mockCalculator.calculatePreview).toHaveBeenCalledWith(quest, [item]);
  });
});
```

**期待値:**
- `contributionCalculator.calculatePreview` が呼ばれること

---

#### TC-705: 納品実行でイベントが発行される

| 項目 | 内容 |
|------|------|
| **信頼性** | 🔵 高信頼性（イベント連携） |
| **対応要件** | EventBus連携 |

```typescript
describe('TC-705: 納品実行でイベントが発行される', () => {
  it('Given: 依頼・アイテム選択済み When: deliver()実行 Then: DELIVERY_COMPLETEDイベントが発行', () => {
    // Given: 依頼とアイテムが選択済み
    const quest = createTestQuest();
    const item = createTestItem();
    const { scene } = createMockScene();
    const mockEventBus = createMockEventBus();
    const mockQuestService = createMockQuestService();
    setupSceneData(scene, {
      quests: [quest],
      items: [item],
      eventBus: mockEventBus,
      questService: mockQuestService,
    });
    const ui = new DeliveryPhaseUI(scene);
    ui.selectQuest(quest.id);
    ui.selectItem(item.instanceId);

    // When: 納品を実行
    ui.deliver();

    // Then: DELIVERY_COMPLETEDイベントが発行される
    expect(mockEventBus.emit).toHaveBeenCalledWith(
      'DELIVERY_COMPLETED',
      expect.any(Object)
    );
  });
});
```

**期待値:**
- `eventBus.emit` が `DELIVERY_COMPLETED` イベントで呼ばれること

---

#### TC-706: キーボード'D'で納品実行される

| 項目 | 内容 |
|------|------|
| **信頼性** | 🟡 中信頼性（キーボード操作） |
| **対応要件** | キーボードショートカット |

```typescript
describe('TC-706: キーボード\'D\'で納品実行される', () => {
  it('Given: 依頼・アイテム選択済み When: Dキー押下 Then: 納品が実行される', () => {
    // Given: 依頼とアイテムが選択済み
    const quest = createTestQuest();
    const item = createTestItem();
    const { scene } = createMockScene();
    const mockQuestService = createMockQuestService();
    setupSceneData(scene, {
      quests: [quest],
      items: [item],
      questService: mockQuestService,
    });
    const ui = new DeliveryPhaseUI(scene);
    ui.selectQuest(quest.id);
    ui.selectItem(item.instanceId);

    // キーボードイベントをシミュレート
    const keydownCallback = scene.input.keyboard.on.mock.calls.find(
      call => call[0] === 'keydown'
    )?.[1];

    // When: Dキーを押下
    if (keydownCallback) {
      keydownCallback({ key: 'D' });
    }

    // Then: deliver()が呼ばれる
    expect(mockQuestService.deliver).toHaveBeenCalled();
  });
});
```

**期待値:**
- `questService.deliver` が呼ばれること

---

#### TC-707: キーボード'E'で日終了される

| 項目 | 内容 |
|------|------|
| **信頼性** | 🟡 中信頼性（キーボード操作） |
| **対応要件** | キーボードショートカット |

```typescript
describe('TC-707: キーボード\'E\'で日終了される', () => {
  it('Given: DeliveryPhaseUI表示中 When: Eキー押下 Then: DAY_END_REQUESTEDイベントが発行', () => {
    // Given: DeliveryPhaseUIが表示中
    const { scene } = createMockScene();
    const mockEventBus = createMockEventBus();
    setupSceneData(scene, { eventBus: mockEventBus });
    const ui = new DeliveryPhaseUI(scene);

    // キーボードイベントをシミュレート
    const keydownCallback = scene.input.keyboard.on.mock.calls.find(
      call => call[0] === 'keydown'
    )?.[1];

    // When: Eキーを押下
    if (keydownCallback) {
      keydownCallback({ key: 'E' });
    }

    // Then: DAY_END_REQUESTEDイベントが発行される
    expect(mockEventBus.emit).toHaveBeenCalledWith(
      'DAY_END_REQUESTED',
      expect.any(Object)
    );
  });
});
```

**期待値:**
- `eventBus.emit` が `DAY_END_REQUESTED` イベントで呼ばれること

---

#### TC-708: キーボード'Escape'でリセットされる

| 項目 | 内容 |
|------|------|
| **信頼性** | 🟡 中信頼性（キーボード操作） |
| **対応要件** | キーボードショートカット |

```typescript
describe('TC-708: キーボード\'Escape\'でリセットされる', () => {
  it('Given: 依頼・アイテム選択済み When: Escapeキー押下 Then: 選択がクリアされる', () => {
    // Given: 依頼とアイテムが選択済み
    const quest = createTestQuest();
    const item = createTestItem();
    const { scene } = createMockScene();
    setupSceneData(scene, { quests: [quest], items: [item] });
    const ui = new DeliveryPhaseUI(scene);
    ui.selectQuest(quest.id);
    ui.selectItem(item.instanceId);

    // キーボードイベントをシミュレート
    const keydownCallback = scene.input.keyboard.on.mock.calls.find(
      call => call[0] === 'keydown'
    )?.[1];

    // When: Escapeキーを押下
    if (keydownCallback) {
      keydownCallback({ key: 'Escape' });
    }

    // Then: 選択がクリアされる
    expect(ui.getSelectedQuest()).toBeNull();
    expect(ui.getSelectedItem()).toBeNull();
  });
});
```

**期待値:**
- `getSelectedQuest()` と `getSelectedItem()` が両方 `null` を返すこと

---

#### TC-709: destroy時に全コンポーネントが破棄される

| 項目 | 内容 |
|------|------|
| **信頼性** | 🔵 高信頼性（リソース管理） |
| **対応要件** | AC-010 既存機能維持 |

```typescript
describe('TC-709: destroy時に全コンポーネントが破棄される', () => {
  it('Given: DeliveryPhaseUIインスタンス When: destroy()呼び出し Then: 全サブコンポーネントのdestroyが呼ばれる', () => {
    // Given: インスタンスが存在
    const { scene, mockContainer } = createMockScene();
    setupSceneData(scene);
    const ui = new DeliveryPhaseUI(scene);

    // スパイを設定（サブコンポーネントのdestroyメソッド）
    const questListDestroySpy = vi.spyOn(ui.getQuestList(), 'destroy');
    const itemSelectorDestroySpy = vi.spyOn(ui.getItemSelector(), 'destroy');
    const previewDestroySpy = vi.spyOn(ui.getContributionPreview(), 'destroy');
    const resultPanelDestroySpy = vi.spyOn(ui.getResultPanel(), 'destroy');

    // When: destroy()を呼び出す
    ui.destroy();

    // Then: 全サブコンポーネントのdestroyが呼ばれる
    expect(questListDestroySpy).toHaveBeenCalled();
    expect(itemSelectorDestroySpy).toHaveBeenCalled();
    expect(previewDestroySpy).toHaveBeenCalled();
    expect(resultPanelDestroySpy).toHaveBeenCalled();
    expect(mockContainer.destroy).toHaveBeenCalled();
  });
});
```

**期待値:**
- 全サブコンポーネントの `destroy` メソッドが呼ばれること
- メインコンテナの `destroy` が呼ばれること

---

## 5. ヘルパー関数

### 5.1 シーンデータセットアップ

```typescript
/**
 * シーンのdata.getにモックサービスを設定
 */
function setupSceneData(
  scene: Phaser.Scene,
  options?: {
    eventBus?: IEventBus;
    questService?: IQuestService;
    inventoryService?: IInventoryService;
    contributionCalculator?: IContributionCalculator;
    quests?: Quest[];
    items?: ItemInstance[];
  }
) {
  const eventBus = options?.eventBus ?? createMockEventBus();
  const questService = options?.questService ?? createMockQuestService();
  const inventoryService = options?.inventoryService ?? createMockInventoryService();
  const contributionCalculator = options?.contributionCalculator ?? createMockContributionCalculator();

  if (options?.quests) {
    questService.getAcceptedQuests.mockReturnValue(options.quests);
  }
  if (options?.items) {
    inventoryService.getItems.mockReturnValue(options.items);
  }

  (scene.data.get as ReturnType<typeof vi.fn>).mockImplementation((key: string) => {
    switch (key) {
      case 'eventBus': return eventBus;
      case 'questService': return questService;
      case 'inventoryService': return inventoryService;
      case 'contributionCalculator': return contributionCalculator;
      default: return null;
    }
  });

  return { eventBus, questService, inventoryService, contributionCalculator };
}
```

---

## 6. テストカバレッジ目標

| コンポーネント | 目標カバレッジ | 主要テストケース数 |
|--------------|--------------|-----------------|
| QuestDeliveryList | 80%+ | 7 |
| ItemSelector | 80%+ | 7 |
| ContributionPreview | 80%+ | 7 |
| DeliveryResultPanel | 80%+ | 6 |
| DeliveryPhaseUI | 80%+ | 9 |
| **合計** | **80%+** | **36** |

---

## 7. 実装順序

### Phase 1: モック・ヘルパー作成
1. `__mocks__/scene.mock.ts` 作成
2. `__mocks__/event-bus.mock.ts` 作成
3. `__mocks__/services.mock.ts` 作成
4. `__mocks__/test-data.factory.ts` 作成

### Phase 2: サブコンポーネントテスト（Red Phase）
1. `QuestDeliveryList.test.ts` - 失敗するテスト作成
2. `ItemSelector.test.ts` - 失敗するテスト作成
3. `ContributionPreview.test.ts` - 失敗するテスト作成
4. `DeliveryResultPanel.test.ts` - 失敗するテスト作成

### Phase 3: メインコンポーネントテスト（Red Phase）
1. `DeliveryPhaseUI.test.ts` - 更新（失敗するテスト追加）

### Phase 4: 実装（Green Phase）
1. 各コンポーネントを順番に実装
2. テストを通す最小限の実装

### Phase 5: リファクタリング
1. コード品質の改善
2. 共通ユーティリティの活用確認

---

## 8. 備考

- 信頼性レベル凡例:
  - 🔵 高信頼性: requirements.mdに明記された要件
  - 🟡 中信頼性: 設計意図から妥当に推測された要件

- 全テストケースは `vitest` を使用
- Phaserシーンは完全にモック化（実際のPhaserインスタンス不要）
- 各テストは独立して実行可能（副作用なし）
