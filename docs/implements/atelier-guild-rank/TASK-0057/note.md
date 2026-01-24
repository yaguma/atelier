# TASK-0057: DeliveryPhaseUI リファクタリング - タスクノート

**作成日**: 2026-01-23
**タスクタイプ**: TDD
**フェーズ**: Phase 7 - Presentation層リファクタリング

---

## 1. コンテキスト情報

### 1.1 技術スタック

| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| ゲームFW | Phaser | 3.87+ |
| UIプラグイン | rexUI | 最新 |
| 言語 | TypeScript | 5.x |
| ビルド | Vite | 5.x |
| テスト | Vitest | 最新 |
| Lint/Format | Biome | 2.x |

### 1.2 開発ルール

- **アーキテクチャ**: Clean Architecture（4層構造）
- **対象層**: Presentation層のリファクタリング
- **目標**: 884行 → 400行以下（各分割ファイルも400行以下）
- **コンポーネント分割数**: 最低3つ以上

---

## 2. 既存コード構造分析

### 2.1 現在のDeliveryPhaseUI.ts（884行）

**ファイルパス**: `atelier-guild-rank/src/presentation/ui/phases/DeliveryPhaseUI.ts`

#### ローカルインターフェース定義（行89-230）

| インターフェース | 行数 | 用途 |
|-----------------|------|------|
| `IEventBus` | 89-97 | イベントバス |
| `Quality` | 102 | 品質タイプ |
| `Quest` | 107-118 | 依頼データ |
| `ItemInstance` | 123-129 | アイテムインスタンス |
| `DeliveryResult` | 134-144 | 納品結果 |
| `RewardCard` | 149-156 | 報酬カード |
| `ContributionPreview` | 161-166 | 貢献度プレビュー |
| `IQuestService` | 171-175 | 依頼サービス |
| `IInventoryService` | 180-183 | インベントリサービス |
| `IContributionCalculator` | 188-190 | 貢献度計算 |
| `DeliveryQuestPanel` | 195-198 | 依頼パネル |
| `ItemInventoryUI` | 203-205 | アイテムインベントリUI |
| `Button` | 210-214 | ボタン |
| `GameEventType` | 219-230 | イベント定数 |

#### 定数定義（行17-87）

| 定数グループ | 内容 |
|------------|------|
| `UI_LAYOUT` | X/Y座標、ボタン位置 |
| `ERROR_MESSAGES` | エラーメッセージ |
| `UI_TEXT` | UIテキスト定数 |
| `UI_STYLES` | フォントスタイル |
| `KEYBOARD_KEYS` | キーボードショートカット |

#### BaseComponentクラス（行236-261）

- 抽象基底クラス（別ファイルに既存）
- `create()`, `destroy()`, `setVisible()`, `setPosition()`

#### DeliveryPhaseUIメインクラス（行269-884）

| 責務カテゴリ | メソッド | 行数（概算） |
|------------|---------|------------|
| 初期化 | `constructor`, `initializeServices`, `create` | 50行 |
| タイトル | `createTitle` | 10行 |
| 依頼パネル | `createQuestPanels`, `createQuestPanel`, `destroyQuestPanels`, `updateQuestPanels` | 100行 |
| アイテムインベントリ | `createItemInventory` | 40行 |
| プレビューエリア | `createPreviewArea`, `updatePreview` | 50行 |
| ボタン | `createButtons` | 70行 |
| キーボード | `setupKeyboardListener`, `handleKeyboardInput`, `removeKeyboardListener` | 40行 |
| 依頼選択 | `onQuestSelect` | 15行 |
| アイテム選択 | `onItemSelect` | 15行 |
| 納品処理 | `onDeliver`, `canDeliver` | 50行 |
| 結果表示 | `showDeliveryResult` | 20行 |
| 日終了 | `onEndDay` | 15行 |
| イベント | `emitEvent` | 15行 |
| リセット | `reset` | 15行 |
| 破棄 | `destroy` | 25行 |

### 2.2 分割対象の責務分析

```
DeliveryPhaseUI（現状）
├── 依頼リスト表示・選択
├── アイテムインベントリ表示・選択
├── 貢献度プレビュー計算・表示
├── 納品結果表示
├── ボタン管理
├── キーボード入力管理
└── イベント発行
```

---

## 3. 使用する共通ユーティリティ一覧

### 3.1 UIBackgroundBuilder
**パス**: `@presentation/ui/utils/UIBackgroundBuilder`

```typescript
// 使用例: パネル背景
new UIBackgroundBuilder(scene)
  .setPosition(0, 0)
  .setSize(400, 300)
  .setFill(Colors.background.primary, 0.95)
  .setBorder(Colors.border.primary, 2)
  .setRadius(8)
  .build();
```

### 3.2 AnimationPresets
**パス**: `@presentation/ui/utils/AnimationPresets`

```typescript
// 使用例: フェードイン
scene.tweens.add({
  targets: container,
  ...AnimationPresets.fade.in,
});

// 使用例: スケールポップ
scene.tweens.add({
  targets: panel,
  ...AnimationPresets.scale.pop,
});
```

### 3.3 HoverAnimationMixin
**パス**: `@presentation/ui/utils/HoverAnimationMixin`

```typescript
// 使用例: ホバーアニメーション適用
applyHoverAnimation(button, scene, { scaleUp: 1.05, duration: 100 });

// 使用例: ホバーアニメーション解除
removeHoverAnimation(button);
```

### 3.4 BorderLineFactory
**パス**: `@presentation/ui/utils/BorderLineFactory`

```typescript
// 使用例: 水平線
createHorizontalLine(scene, x, y, width, Colors.border.primary, 2);

// 使用例: 角丸ボーダー
createRoundedBorder(scene, x, y, width, height, 8, Colors.border.primary);
```

### 3.5 Colors（テーマ定数）
**パス**: `@presentation/ui/theme`

```typescript
// 背景色
Colors.background.primary  // 0x2a2a3d
Colors.background.card     // 0x3a3a4d

// ボーダー色
Colors.border.primary      // 0x4a4a5d
Colors.border.gold         // 0xffd700

// テキスト色
Colors.text.primary        // 0xffffff
Colors.text.secondary      // 0xcccccc

// 品質色
Colors.quality.common      // 0xcccccc
```

---

## 4. 分割後のコンポーネント構成案

### 4.1 ディレクトリ構造

```
atelier-guild-rank/src/presentation/ui/phases/
├── DeliveryPhaseUI.ts                    # メイン（~200行）
└── components/
    └── delivery/
        ├── index.ts                      # バレルエクスポート
        ├── types.ts                      # 型定義（~80行）
        ├── QuestDeliveryList.ts          # 依頼リスト（~150行）
        ├── ItemSelector.ts               # アイテム選択（~150行）
        ├── ContributionPreview.ts        # 貢献度プレビュー（~100行）
        └── DeliveryResultPanel.ts        # 納品結果表示（~120行）
```

### 4.2 各コンポーネントの責務

#### DeliveryPhaseUI.ts（メイン: ~200行）

```typescript
// 責務: 全体統合、フェーズ管理、イベント連携
export class DeliveryPhaseUI extends BaseComponent {
  - サブコンポーネント初期化
  - コンポーネント間のデータ連携
  - キーボード入力のディスパッチ
  - イベントバス連携
}
```

#### types.ts（型定義: ~80行）

```typescript
// DeliveryPhaseUIで使用するローカル型を集約
export type Quality = 'C' | 'B' | 'A' | 'S';

export interface Quest { ... }
export interface ItemInstance { ... }
export interface DeliveryResult { ... }
export interface RewardCard { ... }
export interface ContributionPreview { ... }
export interface QuestDeliveryListCallbacks { ... }
export interface ItemSelectorCallbacks { ... }
```

#### QuestDeliveryList.ts（依頼リスト: ~150行）

```typescript
// 責務: 納品対象の依頼一覧表示と選択
export class QuestDeliveryList extends BaseComponent {
  - 依頼パネルの生成・破棄
  - 依頼選択イベント
  - 依頼リストの更新
}
```

#### ItemSelector.ts（アイテム選択: ~150行）

```typescript
// 責務: 納品するアイテムの表示と選択
export class ItemSelector extends BaseComponent {
  - アイテム一覧表示
  - アイテム選択イベント
  - 選択状態の管理
}
```

#### ContributionPreview.ts（貢献度プレビュー: ~100行）

```typescript
// 責務: 納品時の貢献度計算結果のプレビュー表示
export class ContributionPreview extends BaseComponent {
  - プレビュー計算結果の表示
  - 品質ボーナスの可視化
  - プレビューテキスト更新
}
```

#### DeliveryResultPanel.ts（納品結果: ~120行）

```typescript
// 責務: 納品成功時の結果表示と演出
export class DeliveryResultPanel extends BaseComponent {
  - 成功演出（アニメーション）
  - 報酬表示
  - 閉じる処理
}
```

### 4.3 コンポーネント間の依存関係

```
DeliveryPhaseUI
├── QuestDeliveryList
│   └── (callback) onQuestSelect → DeliveryPhaseUI
├── ItemSelector
│   └── (callback) onItemSelect → DeliveryPhaseUI
├── ContributionPreview
│   └── (method) update(quest, item, preview)
└── DeliveryResultPanel
    └── (method) show(result)
```

---

## 5. テスト方針

### 5.1 テストファイル構成

```
atelier-guild-rank/src/presentation/ui/phases/
├── DeliveryPhaseUI.spec.ts
└── components/
    └── delivery/
        ├── QuestDeliveryList.spec.ts
        ├── ItemSelector.spec.ts
        ├── ContributionPreview.spec.ts
        └── DeliveryResultPanel.spec.ts
```

### 5.2 テストケース一覧

#### DeliveryPhaseUI.spec.ts

| TC番号 | テスト名 | 信頼性 |
|--------|---------|--------|
| TC-201 | DeliveryPhaseUIが正しく初期化される | 🔵 |
| TC-202 | サブコンポーネントが全て初期化される | 🔵 |
| TC-203 | 依頼選択時にプレビューが更新される | 🟡 |
| TC-204 | アイテム選択時にプレビューが更新される | 🟡 |
| TC-205 | 納品実行でイベントが発行される | 🔵 |
| TC-206 | destroy時に全コンポーネントが破棄される | 🔵 |

#### QuestDeliveryList.spec.ts

| TC番号 | テスト名 | 信頼性 |
|--------|---------|--------|
| TC-301 | 依頼リストが正しく表示される | 🔵 |
| TC-302 | 依頼パネルクリックでコールバックが呼ばれる | 🔵 |
| TC-303 | 依頼0件時に適切なメッセージが表示される | 🟡 |
| TC-304 | setQuests更新時に既存パネルが破棄される | 🔵 |

#### ItemSelector.spec.ts

| TC番号 | テスト名 | 信頼性 |
|--------|---------|--------|
| TC-401 | アイテム一覧が正しく表示される | 🔵 |
| TC-402 | アイテムクリックでコールバックが呼ばれる | 🔵 |
| TC-403 | アイテム0件時に適切なメッセージが表示される | 🟡 |
| TC-404 | getSelectedItem()で選択アイテムが取得できる | 🔵 |

#### ContributionPreview.spec.ts

| TC番号 | テスト名 | 信頼性 |
|--------|---------|--------|
| TC-501 | 初期状態で適切なメッセージが表示される | 🟡 |
| TC-502 | update()でプレビュー内容が更新される | 🔵 |
| TC-503 | 品質ボーナスが正しく表示される | 🟡 |

#### DeliveryResultPanel.spec.ts

| TC番号 | テスト名 | 信頼性 |
|--------|---------|--------|
| TC-601 | show()でパネルが表示される | 🔵 |
| TC-602 | フェードインアニメーションが再生される | 🟡 |
| TC-603 | 報酬情報が正しく表示される | 🔵 |
| TC-604 | hide()でパネルが非表示になる | 🔵 |

### 5.3 モック戦略

```typescript
// Phaserシーンモック
function createMockScene(): Phaser.Scene {
  return {
    add: {
      container: vi.fn().mockReturnValue({ ... }),
      text: vi.fn().mockReturnValue({ ... }),
      rectangle: vi.fn().mockReturnValue({ ... }),
      graphics: vi.fn().mockReturnValue({ ... }),
    },
    tweens: { add: vi.fn() },
    data: { get: vi.fn() },
  } as any;
}

// EventBusモック
function createMockEventBus() {
  return {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  };
}

// サービスモック
function createMockQuestService(): IQuestService {
  return {
    getAcceptedQuests: vi.fn().mockReturnValue([]),
    deliver: vi.fn().mockReturnValue({ success: true, ... }),
    canDeliver: vi.fn().mockReturnValue(true),
  };
}
```

---

## 6. 実装順序

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

---

## 7. 参考情報

### 7.1 類似リファクタリング例（TASK-0055）

**RankUpScene構成**:
- `RankUpScene.ts` (291行)
- `components/rankup/RankUpHeader.ts`
- `components/rankup/RankUpRequirements.ts`
- `components/rankup/RankUpRewards.ts`
- `components/rankup/RankUpTestPanel.ts`
- `components/rankup/types.ts`
- `components/rankup/index.ts`

### 7.2 BaseComponent継承パターン

```typescript
import { BaseComponent } from '@presentation/ui/scenes/components/BaseComponent';

export class MyComponent extends BaseComponent {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
  }

  public create(): void {
    // UI要素を作成してthis.containerに追加
  }

  public destroy(): void {
    // リソース解放
    this.container.destroy();
  }
}
```

---

## 8. 完了条件チェックリスト

- [ ] DeliveryPhaseUI.tsが400行以下
- [ ] 3つ以上のサブコンポーネントに分割
- [ ] ローカルインターフェースがtypes.tsに移動
- [ ] 共通ユーティリティ（UIBackgroundBuilder, AnimationPresets等）を使用
- [ ] 既存テストが全て通過
- [ ] 新規コンポーネントのテストカバレッジ80%以上
- [ ] Biome lintエラーなし
