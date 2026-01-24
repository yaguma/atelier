# TASK-0057: DeliveryPhaseUI リファクタリング - 要件定義書

**作成日**: 2026-01-23
**フェーズ**: Phase 7 - Presentation層リファクタリング
**開発手法**: TDD (Test-Driven Development)

---

## 1. 概要

### 1.1 目的

現在884行あるDeliveryPhaseUI.tsを、責務ごとに分割し、保守性・再利用性を向上させる。

### 1.2 対象ファイル

- **現在**: `atelier-guild-rank/src/presentation/ui/phases/DeliveryPhaseUI.ts` (884行)
- **分割後**: メインファイル + 4つのサブコンポーネント + 型定義

### 1.3 背景

DeliveryPhaseUI.tsは以下の複数の責務を持っており、単一責任の原則に違反している:

1. 依頼リスト表示・選択
2. アイテムインベントリ表示・選択
3. 貢献度プレビュー計算・表示
4. 納品結果表示
5. ボタン管理
6. キーボード入力管理
7. イベント発行

---

## 2. 受け入れ基準 (Acceptance Criteria)

### 2.1 行数制限

| 条件 | 基準 | 必須 |
|------|------|------|
| AC-001 | DeliveryPhaseUI.ts が 400行以下 | 必須 |
| AC-002 | 各サブコンポーネントが 400行以下 | 必須 |
| AC-003 | types.ts が 150行以下 | 必須 |

### 2.2 コンポーネント分割

| 条件 | 基準 | 必須 |
|------|------|------|
| AC-004 | 3つ以上のサブコンポーネントに分割 | 必須 |
| AC-005 | 型定義が types.ts に集約 | 必須 |
| AC-006 | バレルエクスポート (index.ts) を提供 | 必須 |

### 2.3 共通ユーティリティ使用

| 条件 | 基準 | 必須 |
|------|------|------|
| AC-007 | UIBackgroundBuilder を使用 | 必須 |
| AC-008 | AnimationPresets を使用 | 必須 |
| AC-009 | Colors テーマ定数を使用 | 必須 |

### 2.4 テスト要件

| 条件 | 基準 | 必須 |
|------|------|------|
| AC-010 | 既存の機能が全て正常動作 | 必須 |
| AC-011 | 新規コンポーネントのテストカバレッジ 80%以上 | 必須 |
| AC-012 | 全ユニットテストがパス | 必須 |

### 2.5 品質要件

| 条件 | 基準 | 必須 |
|------|------|------|
| AC-013 | Biome lintエラーなし | 必須 |
| AC-014 | TypeScript型エラーなし | 必須 |
| AC-015 | 既存のAPIインターフェースを維持 | 必須 |

---

## 3. 分割後のディレクトリ構造

```
atelier-guild-rank/src/presentation/ui/phases/
├── DeliveryPhaseUI.ts                    # メイン統合コンポーネント（~200行）
└── components/
    └── delivery/
        ├── index.ts                      # バレルエクスポート（~20行）
        ├── types.ts                      # 型定義（~100行）
        ├── QuestDeliveryList.ts          # 依頼リスト表示・選択（~150行）
        ├── ItemSelector.ts               # アイテム選択UI（~150行）
        ├── ContributionPreview.ts        # 貢献度プレビュー（~100行）
        └── DeliveryResultPanel.ts        # 納品結果表示（~120行）
```

---

## 4. 各コンポーネント詳細仕様

### 4.1 types.ts - 型定義モジュール

**ファイルパス**: `components/delivery/types.ts`
**想定行数**: ~100行

#### 4.1.1 責務

- DeliveryPhaseUIおよびサブコンポーネントで使用するローカル型の一元管理
- 共有インターフェースの定義
- コールバック型の定義

#### 4.1.2 エクスポート型一覧

```typescript
// 品質タイプ
export type Quality = 'C' | 'B' | 'A' | 'S';

// 依頼データ
export interface Quest {
  id: string;
  clientName: string;
  clientType: string;
  description: string;
  requiredItem: string;
  requiredCount: number;
  rewardContribution: number;
  rewardGold: number;
  remainingDays: number;
  status: 'available' | 'accepted' | 'completed' | 'failed';
}

// アイテムインスタンス
export interface ItemInstance {
  instanceId: string;
  itemId: string;
  name: string;
  quality: Quality;
  attributes: { name: string; value: number }[];
}

// 納品結果
export interface DeliveryResult {
  success: boolean;
  questId: string;
  itemId: string;
  contribution: number;
  gold: number;
  rewardCards: RewardCard[];
  newPromotionGauge: number;
  promotionGaugeMax: number;
  questCompleted: boolean;
}

// 報酬カード
export interface RewardCard {
  id: string;
  name: string;
  rarity: 'common' | 'uncommon' | 'rare';
  cardType: 'gathering' | 'recipe' | 'enhancement';
  description: string;
  effectDescription: string;
}

// 貢献度プレビュー
export interface ContributionPreviewData {
  baseReward: number;
  qualityModifier: number;
  qualityBonus: number;
  totalContribution: number;
}

// サービスインターフェース
export interface IQuestService {
  getAcceptedQuests(): Quest[];
  deliver(questId: string, items: ItemInstance[]): DeliveryResult;
  canDeliver(questId: string, items: ItemInstance[]): boolean;
}

export interface IInventoryService {
  getItems(): ItemInstance[];
  removeItems(itemIds: string[]): void;
}

export interface IContributionCalculator {
  calculatePreview(quest: Quest, items: ItemInstance[]): ContributionPreviewData;
}

// コールバック型
export interface QuestDeliveryListCallbacks {
  onQuestSelect: (quest: Quest) => void;
}

export interface ItemSelectorCallbacks {
  onItemSelect: (item: ItemInstance) => void;
}

export interface DeliveryResultPanelCallbacks {
  onClose: () => void;
}

// EventBusインターフェース
export interface IEventBus {
  emit(event: string, payload?: unknown): void;
  on(event: string, callback: (payload?: unknown) => void): void;
  off(event: string, callback: (payload?: unknown) => void): void;
  once(event: string, callback: (payload?: unknown) => void): void;
}
```

#### 4.1.3 テストケース

| TC番号 | テスト名 | 説明 |
|--------|---------|------|
| TC-101 | 全ての型がエクスポートされている | types.tsの全型が正しくエクスポートされていることを確認 |

---

### 4.2 QuestDeliveryList.ts - 依頼リスト表示・選択

**ファイルパス**: `components/delivery/QuestDeliveryList.ts`
**想定行数**: ~150行

#### 4.2.1 責務

- 納品対象の依頼一覧表示
- 依頼パネルの生成・破棄
- 依頼選択イベントのコールバック発行
- 依頼リストの動的更新

#### 4.2.2 クラス定義

```typescript
export class QuestDeliveryList {
  constructor(scene: Phaser.Scene, x: number, y: number, callbacks: QuestDeliveryListCallbacks);

  // 公開メソッド
  public create(): void;
  public setQuests(quests: Quest[]): void;
  public getSelectedQuest(): Quest | null;
  public clearSelection(): void;
  public getContainer(): Phaser.GameObjects.Container;
  public setVisible(visible: boolean): this;
  public setPosition(x: number, y: number): this;
  public destroy(): void;
}
```

#### 4.2.3 主要機能

| 機能 | 説明 |
|------|------|
| 依頼パネル表示 | 各依頼のパネルを背景・テキスト付きで生成 |
| 選択ハイライト | 選択された依頼パネルを視覚的に強調 |
| クリックイベント | パネルクリック時にコールバック発行 |
| 空表示 | 依頼0件時に「納品可能な依頼がありません」表示 |
| 動的更新 | setQuests()で既存パネル破棄→再生成 |

#### 4.2.4 共通ユーティリティ使用

- `UIBackgroundBuilder`: パネル背景の生成
- `Colors`: テーマカラーの適用

#### 4.2.5 テストケース

| TC番号 | テスト名 | 説明 | 信頼性 |
|--------|---------|------|--------|
| TC-201 | 依頼リストが正しく表示される | 3件の依頼でパネルが3つ生成される | 🔵 |
| TC-202 | 依頼パネルクリックでコールバックが呼ばれる | クリック時にonQuestSelectが呼ばれる | 🔵 |
| TC-203 | 依頼0件時に適切なメッセージが表示される | 空配列で「依頼なし」メッセージ表示 | 🟡 |
| TC-204 | setQuests更新時に既存パネルが破棄される | 新しいデータで既存パネルが破棄・再生成 | 🔵 |
| TC-205 | getSelectedQuest()で選択依頼が取得できる | 選択後に正しい依頼オブジェクトを返す | 🔵 |
| TC-206 | clearSelection()で選択がクリアされる | クリア後はnullを返す | 🔵 |
| TC-207 | destroy()でリソースが解放される | コンテナが破棄される | 🔵 |

---

### 4.3 ItemSelector.ts - アイテム選択UI

**ファイルパス**: `components/delivery/ItemSelector.ts`
**想定行数**: ~150行

#### 4.3.1 責務

- 納品可能アイテムの一覧表示
- アイテム選択イベントのコールバック発行
- 選択状態の管理
- アイテムの品質に応じた色分け表示

#### 4.3.2 クラス定義

```typescript
export class ItemSelector {
  constructor(scene: Phaser.Scene, x: number, y: number, callbacks: ItemSelectorCallbacks);

  // 公開メソッド
  public create(): void;
  public setItems(items: ItemInstance[]): void;
  public getSelectedItem(): ItemInstance | null;
  public clearSelection(): void;
  public getContainer(): Phaser.GameObjects.Container;
  public setVisible(visible: boolean): this;
  public setPosition(x: number, y: number): this;
  public destroy(): void;
}
```

#### 4.3.3 主要機能

| 機能 | 説明 |
|------|------|
| アイテム表示 | 各アイテムをボタン形式で表示 |
| 品質色分け | アイテム品質に応じてColors.quality使用 |
| 選択ハイライト | 選択されたアイテムを視覚的に強調 |
| クリックイベント | アイテムクリック時にコールバック発行 |
| 空表示 | アイテム0件時に「アイテムなし」表示 |

#### 4.3.4 共通ユーティリティ使用

- `UIBackgroundBuilder`: アイテムパネル背景
- `Colors`: 品質色・テーマカラー

#### 4.3.5 テストケース

| TC番号 | テスト名 | 説明 | 信頼性 |
|--------|---------|------|--------|
| TC-301 | アイテム一覧が正しく表示される | 5件のアイテムでボタンが5つ生成される | 🔵 |
| TC-302 | アイテムクリックでコールバックが呼ばれる | クリック時にonItemSelectが呼ばれる | 🔵 |
| TC-303 | アイテム0件時に適切なメッセージが表示される | 空配列で「アイテムなし」メッセージ表示 | 🟡 |
| TC-304 | getSelectedItem()で選択アイテムが取得できる | 選択後に正しいアイテムを返す | 🔵 |
| TC-305 | clearSelection()で選択がクリアされる | クリア後はnullを返す | 🔵 |
| TC-306 | 品質に応じた色分けが適用される | S品質アイテムにgold色が適用 | 🟡 |
| TC-307 | destroy()でリソースが解放される | コンテナが破棄される | 🔵 |

---

### 4.4 ContributionPreview.ts - 貢献度プレビュー

**ファイルパス**: `components/delivery/ContributionPreview.ts`
**想定行数**: ~100行

#### 4.4.1 責務

- 貢献度計算結果のプレビュー表示
- 基本報酬・品質ボーナス・合計の可視化
- 選択状態に応じたメッセージ表示

#### 4.4.2 クラス定義

```typescript
export class ContributionPreview {
  constructor(scene: Phaser.Scene, x: number, y: number);

  // 公開メソッド
  public create(): void;
  public update(quest: Quest | null, item: ItemInstance | null, preview: ContributionPreviewData | null): void;
  public showSelectQuestMessage(): void;
  public showSelectItemMessage(): void;
  public clear(): void;
  public getContainer(): Phaser.GameObjects.Container;
  public setVisible(visible: boolean): this;
  public setPosition(x: number, y: number): this;
  public destroy(): void;
}
```

#### 4.4.3 主要機能

| 機能 | 説明 |
|------|------|
| プレビュー表示 | 基本報酬、品質ボーナス、合計貢献度を表示 |
| 状態メッセージ | 依頼未選択/アイテム未選択のガイドメッセージ |
| 動的更新 | 選択変更時にリアルタイム更新 |

#### 4.4.4 共通ユーティリティ使用

- `Colors`: テキスト色の適用

#### 4.4.5 テストケース

| TC番号 | テスト名 | 説明 | 信頼性 |
|--------|---------|------|--------|
| TC-401 | 初期状態で「依頼を選択してください」が表示される | create()後のデフォルトメッセージ | 🟡 |
| TC-402 | update()でプレビュー内容が更新される | 計算結果が正しく表示される | 🔵 |
| TC-403 | 品質ボーナスが正しく表示される | S品質で+100%ボーナス表示 | 🟡 |
| TC-404 | showSelectQuestMessage()で依頼選択メッセージが表示 | メッセージテキストが正しい | 🔵 |
| TC-405 | showSelectItemMessage()でアイテム選択メッセージが表示 | メッセージテキストが正しい | 🔵 |
| TC-406 | clear()で表示がクリアされる | テキストが空になる | 🔵 |
| TC-407 | destroy()でリソースが解放される | コンテナが破棄される | 🔵 |

---

### 4.5 DeliveryResultPanel.ts - 納品結果表示

**ファイルパス**: `components/delivery/DeliveryResultPanel.ts`
**想定行数**: ~120行

#### 4.5.1 責務

- 納品成功時の結果パネル表示
- 報酬情報（貢献度、お金）の表示
- フェードインアニメーション
- 閉じる処理

#### 4.5.2 クラス定義

```typescript
export class DeliveryResultPanel {
  constructor(scene: Phaser.Scene, x: number, y: number, callbacks?: DeliveryResultPanelCallbacks);

  // 公開メソッド
  public create(): void;
  public show(result: DeliveryResult, questDescription: string): void;
  public hide(): void;
  public isVisible(): boolean;
  public getContainer(): Phaser.GameObjects.Container;
  public setPosition(x: number, y: number): this;
  public destroy(): void;
}
```

#### 4.5.3 主要機能

| 機能 | 説明 |
|------|------|
| 結果表示 | 納品成功時の報酬情報をパネル表示 |
| アニメーション | フェードインで出現 |
| 自動非表示 | 一定時間後または閉じるボタンで非表示 |

#### 4.5.4 共通ユーティリティ使用

- `UIBackgroundBuilder`: パネル背景
- `AnimationPresets`: フェードインアニメーション
- `Colors`: テーマカラー

#### 4.5.5 テストケース

| TC番号 | テスト名 | 説明 | 信頼性 |
|--------|---------|------|--------|
| TC-501 | show()でパネルが表示される | isVisible()がtrueを返す | 🔵 |
| TC-502 | フェードインアニメーションが再生される | tweens.add()が呼ばれる | 🟡 |
| TC-503 | 報酬情報が正しく表示される | 貢献度・お金のテキストが正しい | 🔵 |
| TC-504 | hide()でパネルが非表示になる | isVisible()がfalseを返す | 🔵 |
| TC-505 | 閉じるボタンクリックでonCloseコールバックが呼ばれる | コールバック発行を確認 | 🔵 |
| TC-506 | destroy()でリソースが解放される | コンテナが破棄される | 🔵 |

---

### 4.6 DeliveryPhaseUI.ts - メイン統合コンポーネント

**ファイルパス**: `DeliveryPhaseUI.ts`
**想定行数**: ~200行

#### 4.6.1 責務

- サブコンポーネントの初期化・破棄
- コンポーネント間のデータ連携
- キーボード入力のディスパッチ
- EventBusへのイベント発行
- 全体フェーズ管理

#### 4.6.2 クラス定義（既存APIを維持）

```typescript
export class DeliveryPhaseUI extends BaseComponent {
  constructor(scene: Phaser.Scene);

  // 公開メソッド（既存API）
  public create(): void;
  public destroy(): void;
  public getContainer(): Phaser.GameObjects.Container;
  public setVisible(visible: boolean): this;
  public setPosition(x: number, y: number): this;
}
```

#### 4.6.3 内部構成

```typescript
// サブコンポーネント
private questList: QuestDeliveryList;
private itemSelector: ItemSelector;
private contributionPreview: ContributionPreview;
private resultPanel: DeliveryResultPanel;

// コールバック定義
private onQuestSelect(quest: Quest): void;
private onItemSelect(item: ItemInstance): void;
private updatePreview(): void;
private onDeliver(): void;
private onEndDay(): void;
```

#### 4.6.4 テストケース

| TC番号 | テスト名 | 説明 | 信頼性 |
|--------|---------|------|--------|
| TC-601 | DeliveryPhaseUIが正しく初期化される | create()でエラーなし | 🔵 |
| TC-602 | サブコンポーネントが全て初期化される | 4つのサブコンポーネントがnullでない | 🔵 |
| TC-603 | 依頼選択時にプレビューが更新される | questList選択→preview更新 | 🟡 |
| TC-604 | アイテム選択時にプレビューが更新される | itemSelector選択→preview更新 | 🟡 |
| TC-605 | 納品実行でイベントが発行される | eventBus.emit()が呼ばれる | 🔵 |
| TC-606 | キーボード'D'で納品実行される | 選択済み状態でDキー押下 | 🟡 |
| TC-607 | キーボード'E'で日終了される | Eキー押下でイベント発行 | 🟡 |
| TC-608 | キーボード'Escape'でリセットされる | Escキー押下で選択クリア | 🟡 |
| TC-609 | destroy時に全コンポーネントが破棄される | 全サブコンポーネントのdestroyが呼ばれる | 🔵 |

---

### 4.7 index.ts - バレルエクスポート

**ファイルパス**: `components/delivery/index.ts`
**想定行数**: ~20行

#### 4.7.1 エクスポート内容

```typescript
// コンポーネント
export { QuestDeliveryList } from './QuestDeliveryList';
export { ItemSelector } from './ItemSelector';
export { ContributionPreview } from './ContributionPreview';
export { DeliveryResultPanel } from './DeliveryResultPanel';

// 型定義
export type {
  Quality,
  Quest,
  ItemInstance,
  DeliveryResult,
  RewardCard,
  ContributionPreviewData,
  IQuestService,
  IInventoryService,
  IContributionCalculator,
  QuestDeliveryListCallbacks,
  ItemSelectorCallbacks,
  DeliveryResultPanelCallbacks,
  IEventBus,
} from './types';
```

---

## 5. 共通ユーティリティ使用ガイド

### 5.1 UIBackgroundBuilder

```typescript
import { UIBackgroundBuilder } from '@presentation/ui/utils/UIBackgroundBuilder';
import { Colors } from '@presentation/ui/theme';

// パネル背景の生成
const background = new UIBackgroundBuilder(scene)
  .setPosition(0, 0)
  .setSize(400, 100)
  .setFill(Colors.background.card, 0.95)
  .setBorder(Colors.border.primary, 2)
  .setRadius(8)
  .build();
```

### 5.2 AnimationPresets

```typescript
import { AnimationPresets } from '@presentation/ui/utils/AnimationPresets';

// フェードイン
scene.tweens.add({
  targets: container,
  ...AnimationPresets.fade.in,
});

// スケールポップ
scene.tweens.add({
  targets: panel,
  ...AnimationPresets.scale.pop,
});
```

### 5.3 Colors

```typescript
import { Colors } from '@presentation/ui/theme';

// 背景色
Colors.background.primary  // 0x2a2a3d
Colors.background.card     // 0x3a3a4d

// ボーダー色
Colors.border.primary      // 0x4a4a5d
Colors.border.gold         // 0xffd700

// 品質色
Colors.quality.common      // 0xcccccc (C)
Colors.quality.rare        // 0x4444ff (B)
Colors.quality.epic        // 0xaa44ff (A)
Colors.quality.legendary   // 0xffaa00 (S)
```

---

## 6. テスト戦略

### 6.1 テストファイル構成

```
atelier-guild-rank/tests/unit/presentation/ui/phases/
└── components/
    └── delivery/
        ├── QuestDeliveryList.test.ts
        ├── ItemSelector.test.ts
        ├── ContributionPreview.test.ts
        └── DeliveryResultPanel.test.ts

atelier-guild-rank/tests/unit/presentation/ui/phases/
└── DeliveryPhaseUI.test.ts
```

### 6.2 モック戦略

```typescript
// Phaserシーンモック
function createMockScene(): Phaser.Scene {
  return {
    add: {
      container: vi.fn().mockReturnValue({
        add: vi.fn(),
        setVisible: vi.fn().mockReturnThis(),
        setPosition: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
      }),
      text: vi.fn().mockReturnValue({
        setOrigin: vi.fn().mockReturnThis(),
        setText: vi.fn().mockReturnThis(),
        setInteractive: vi.fn().mockReturnThis(),
        on: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
      }),
      rectangle: vi.fn().mockReturnValue({
        setStrokeStyle: vi.fn().mockReturnThis(),
        setInteractive: vi.fn().mockReturnThis(),
        on: vi.fn().mockReturnThis(),
        setAlpha: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
      }),
      graphics: vi.fn().mockReturnValue({
        fillStyle: vi.fn().mockReturnThis(),
        fillRoundedRect: vi.fn().mockReturnThis(),
        lineStyle: vi.fn().mockReturnThis(),
        strokeRoundedRect: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
      }),
    },
    tweens: {
      add: vi.fn().mockReturnValue({ remove: vi.fn() }),
    },
    data: {
      get: vi.fn(),
    },
    input: {
      keyboard: {
        on: vi.fn(),
        off: vi.fn(),
      },
    },
  } as unknown as Phaser.Scene;
}

// EventBusモック
function createMockEventBus(): IEventBus {
  return {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    once: vi.fn(),
  };
}

// QuestServiceモック
function createMockQuestService(): IQuestService {
  return {
    getAcceptedQuests: vi.fn().mockReturnValue([]),
    deliver: vi.fn().mockReturnValue({
      success: true,
      questId: 'q1',
      itemId: 'i1',
      contribution: 100,
      gold: 50,
      rewardCards: [],
      newPromotionGauge: 100,
      promotionGaugeMax: 1000,
      questCompleted: true,
    }),
    canDeliver: vi.fn().mockReturnValue(true),
  };
}

// InventoryServiceモック
function createMockInventoryService(): IInventoryService {
  return {
    getItems: vi.fn().mockReturnValue([]),
    removeItems: vi.fn(),
  };
}

// ContributionCalculatorモック
function createMockContributionCalculator(): IContributionCalculator {
  return {
    calculatePreview: vi.fn().mockReturnValue({
      baseReward: 100,
      qualityModifier: 1.5,
      qualityBonus: 50,
      totalContribution: 150,
    }),
  };
}
```

### 6.3 テストデータファクトリ

```typescript
// テスト用依頼データ
function createTestQuest(overrides?: Partial<Quest>): Quest {
  return {
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
  };
}

// テスト用アイテムデータ
function createTestItem(overrides?: Partial<ItemInstance>): ItemInstance {
  return {
    instanceId: 'inst-001',
    itemId: 'potion',
    name: 'ポーション',
    quality: 'B',
    attributes: [{ name: 'HP回復', value: 50 }],
    ...overrides,
  };
}
```

---

## 7. 実装順序

### Phase 1: 準備（型定義・基盤）

1. `types.ts` - ローカルインターフェースを移動
2. `index.ts` - バレルエクスポート作成

### Phase 2: サブコンポーネント実装（TDD）

1. `QuestDeliveryList.ts` - Red → Green → Refactor
2. `ItemSelector.ts` - Red → Green → Refactor
3. `ContributionPreview.ts` - Red → Green → Refactor
4. `DeliveryResultPanel.ts` - Red → Green → Refactor

### Phase 3: メインコンポーネントリファクタリング

1. `DeliveryPhaseUI.ts` - サブコンポーネント統合
2. 既存テストの確認・更新

### Phase 4: 品質確認

1. 全テスト実行
2. カバレッジ確認（80%以上）
3. 行数確認（各ファイル400行以下）
4. Biome lint実行

---

## 8. リスクと対策

| リスク | 影響度 | 対策 |
|--------|--------|------|
| 既存APIの変更 | 高 | 公開メソッドのシグネチャを維持 |
| コンポーネント間連携の複雑化 | 中 | コールバックパターンで疎結合に |
| テストカバレッジ不足 | 中 | TDDで事前にテストケース定義 |
| Phaserモックの不備 | 低 | 既存モックパターンを参考に拡張 |

---

## 9. 完了チェックリスト

- [ ] types.ts が作成され、全型がエクスポートされている
- [ ] QuestDeliveryList.ts が 150行以下
- [ ] ItemSelector.ts が 150行以下
- [ ] ContributionPreview.ts が 100行以下
- [ ] DeliveryResultPanel.ts が 120行以下
- [ ] DeliveryPhaseUI.ts が 200行以下（合計400行以下）
- [ ] index.ts が作成され、全コンポーネントがエクスポートされている
- [ ] UIBackgroundBuilder を使用している
- [ ] AnimationPresets を使用している
- [ ] Colors テーマ定数を使用している
- [ ] 全テストケースがパス
- [ ] テストカバレッジ 80%以上
- [ ] Biome lintエラーなし
- [ ] TypeScript型エラーなし

---

## 10. 参考資料

- TASK-0055 RankUpSceneリファクタリング（類似タスク）
- `atelier-guild-rank/src/presentation/ui/scenes/components/rankup/` ディレクトリ構造
- `atelier-guild-rank/src/presentation/ui/utils/UIBackgroundBuilder.ts`
- `atelier-guild-rank/src/presentation/ui/utils/AnimationPresets.ts`
- `atelier-guild-rank/src/presentation/ui/theme.ts`
