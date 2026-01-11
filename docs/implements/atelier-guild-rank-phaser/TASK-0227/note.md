# TASK-0227: AlchemyContainer設計 - タスクノート

## 技術スタック

| 項目 | バージョン/詳細 |
|------|----------------|
| ゲームエンジン | Phaser 3.87+ |
| 言語 | TypeScript 5.0+ |
| テストフレームワーク | Vitest |
| プロジェクトルート | `atelier-guild-rank-html/` |

## コーディング規約

### ファイル命名規則
- インターフェース: `I{ComponentName}.ts`（例: `IAlchemyContainer.ts`）
- 実装: `{ComponentName}.ts`（例: `AlchemyContainer.ts`）
- 定数: `{ComponentName}Constants.ts`（例: `AlchemyContainerConstants.ts`）
- テスト: `{ComponentName}.test.ts`（テストディレクトリ配下）

### コンポーネント設計パターン
```typescript
// インターフェースファイル（IAlchemyContainer.ts）
export interface IAlchemyContainer extends IPhaseContainer {
  // レシピカード設定
  setRecipeCards(cards: RecipeCard[]): void;
  getSelectedRecipe(): RecipeCard | null;
  // ... メソッド定義
}

// 実装ファイル（AlchemyContainer.ts）
export class AlchemyContainer extends BasePhaseContainer implements IAlchemyContainer {
  public readonly phase = GamePhase.ALCHEMY;

  constructor(options: AlchemyContainerOptions) {
    super({
      scene: options.scene,
      eventBus: options.eventBus,
      x: options.x ?? 0,
      y: options.y ?? 0,
      width: AlchemyContainerLayout.WIDTH,
      height: AlchemyContainerLayout.HEIGHT,
    });
    // 初期化
  }
}
```

### JSDocコメント
- ファイル先頭に概要とタスクIDを記載
- 公開メソッドには必ずJSDocを付与
- 設計文書への参照を含める

## 参考となる既存実装パターン

### 1. GatheringContainer（最も近い参考実装）
**ファイル**: `src/game/ui/phase/GatheringContainer.ts`

**採用すべきパターン**:
- `BasePhaseContainer`を継承
- `IGatheringContainer`インターフェースを実装
- コンストラクタでのオプション設定
- `createContent()`で内部UI構築
- `createLayout()`でエリア分割
- `createActions()`でアクションボタン作成
- `onEnter()` / `onExit()` / `onUpdate()` のライフサイクル実装
- 素材選択状態の管理
- イベントバス経由でのイベント発火

```typescript
// 構造例
export class GatheringContainer extends BasePhaseContainer implements IGatheringContainer {
  public readonly phase = GamePhase.GATHERING;

  protected createContent(): void {
    this.createTitle('🌿 採取フェーズ');
    this.createLayout();
    this.createActions();
  }

  private createLayout(): void {
    // エリアごとにラベルとコンポーネントを配置
  }

  protected async onEnter(): Promise<void> {
    this.resetSelection();
    this.updateConfirmButtonState();
  }
}
```

### 2. IGatheringContainer（インターフェース参考）
**ファイル**: `src/game/ui/phase/IGatheringContainer.ts`

**採用すべきパターン**:
- `IPhaseContainer`を継承
- 結果インターフェース（`GatheringResult`相当）の定義
- オプションインターフェース（`GatheringContainerOptions`相当）の定義
- メソッドシグネチャの明確な定義

```typescript
// インターフェース構造
export interface GatheringResult {
  selectedMaterials: Material[];
  totalAPCost: number;
  gatheringCard: GatheringCard;
}

export interface GatheringContainerOptions {
  scene: Phaser.Scene;
  eventBus: EventBus;
  x?: number;
  y?: number;
  onGatheringComplete?: (result: GatheringResult) => void;
  onSkip?: () => void;
}

export interface IGatheringContainer extends IPhaseContainer {
  // 設定メソッド
  setGatheringCard(card: GatheringCard): void;
  getGatheringCard(): GatheringCard | null;
  // 選択管理
  getSelectedMaterials(): Material[];
  // 操作
  confirmGathering(): void | Promise<void>;
  resetSelection(): void;
}
```

### 3. GatheringContainerConstants（レイアウト定数参考）
**ファイル**: `src/game/ui/phase/GatheringContainerConstants.ts`

**採用すべきパターン**:
- `as const`アサーションで定数化
- エリア別にX, Y, WIDTH, HEIGHTを定義
- 全体サイズ、各エリアサイズ、アクションエリアを分離

```typescript
export const GatheringContainerLayout = {
  WIDTH: 800,
  HEIGHT: 500,
  PADDING: 20,

  CARD_AREA: { X: 20, Y: 60, WIDTH: 220, HEIGHT: 350 },
  MATERIAL_AREA: { X: 260, Y: 60, WIDTH: 380, HEIGHT: 350 },
  SIDE_PANEL: { X: 660, Y: 60, WIDTH: 120, HEIGHT: 350 },
  ACTION_AREA: { Y: 430, BUTTON_SPACING: 20 },
} as const;
```

### 4. HandContainer（手札管理参考）
**ファイル**: `src/game/ui/hand/HandContainer.ts`

**再利用ポイント**:
- カード配列の管理（`setCards()`, `addCard()`, `removeCard()`）
- 選択状態の管理（`selectCard()`, `deselectCard()`, `getSelectedCard()`）
- レイアウト適用（`applyLayout()`）
- キーボードナビゲーション（`enableKeyboardNavigation()`）
- コールバックパターン（`onCardSelect`, `onCardDeselect`, `onCardConfirm`）

### 5. MaterialOptionView（素材選択参考）
**ファイル**: `src/game/ui/material/MaterialOptionView.ts`

**再利用ポイント**:
- グリッド表示でのオプション配置
- 選択上限管理（`maxSelections`, `canSelectMore()`）
- 選択/解除コールバック（`onSelect`, `onDeselect`）
- アイテム背景の状態表示（hover, selected）

### 6. AlchemyPreviewPanel（プレビューパネル参考）
**ファイル**: `src/game/ui/alchemy/AlchemyPreviewPanel.ts`

**再利用ポイント**:
- プレビュー情報の設定（`setPreview()`）
- 空状態表示（`showEmptyState()`）
- 品質表示とゲージ
- 素材リストの動的更新（`addMaterial()`, `removeMaterial()`）
- ステータスインジケーター（調合可能/不可表示）

## 必要なインポートパス

```typescript
// Phaser
import Phaser from 'phaser';

// ドメインエンティティ
import { GamePhase } from '../../../domain/common/types';
import { RecipeCard } from '../../../domain/card/CardEntity';
import { Material } from '../../../domain/material/MaterialEntity';
import { Item } from '../../../domain/item/ItemEntity';

// フェーズコンテナ基盤
import { BasePhaseContainer } from './BasePhaseContainer';
import type { IPhaseContainer, PhaseContainerConfig } from './IPhaseContainer';
import type { EventBus } from '../../events/EventBus';

// UIコンポーネント
import { HandContainer } from '../hand/HandContainer';
import { MaterialOptionView } from '../material/MaterialOptionView';
import type { MaterialOption } from '../material/IMaterialOptionView';
import { AlchemyPreviewPanel } from '../alchemy/AlchemyPreviewPanel';
import type { AlchemyPreview } from '../alchemy/IAlchemyPreviewPanel';

// 設定
import { Colors } from '../../config/ColorPalette';
import { TextStyles } from '../../config/TextStyles';
```

### パスエイリアス
- `@domain/` → `src/domain/`
- 相対パスは階層に応じて調整

## 設計上の注意点

### 1. AlchemyContainerの責務
調合フェーズのメインコンテナとして以下を管理:
- レシピカード手札（`HandContainer`経由）
- 素材選択（`MaterialOptionView`経由）
- 調合プレビュー（`AlchemyPreviewPanel`経由）
- 調合実行と結果生成

### 2. AlchemyResult型の定義
```typescript
export interface AlchemyResult {
  /** 使用したレシピカード */
  recipe: RecipeCard;
  /** 使用した素材リスト */
  usedMaterials: Material[];
  /** 調合結果アイテム */
  craftedItem: Item;
  /** 結果品質 */
  quality: string;
  /** 継承した特性 */
  traits: string[];
}
```

### 3. AlchemyContainerOptions型の定義
```typescript
export interface AlchemyContainerOptions {
  /** Phaserシーン */
  scene: Phaser.Scene;
  /** EventBus */
  eventBus: EventBus;
  /** X座標 */
  x?: number;
  /** Y座標 */
  y?: number;
  /** 調合完了時のコールバック */
  onAlchemyComplete?: (result: AlchemyResult) => void;
  /** スキップ時のコールバック */
  onSkip?: () => void;
}
```

### 4. レイアウト仕様
タスク定義書のレイアウト:
```
┌────────────────────────────────────────────────────────────┐
│                     ⚗️ 調合フェーズ                         │
├────────────────────────────────────────┬───────────────────┤
│ 📋 レシピを選択                         │                   │
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐         │  🔮 調合プレビュー │
│ │   │ │   │ │   │ │   │ │   │         │  [レシピ名]       │
│ └───┘ └───┘ └───┘ └───┘ └───┘         │  予測品質: ...    │
├────────────────────────────────────────┤  素材: ...        │
│ 🧪 素材を選択                           │  特性: ...        │
│ ┌─────┐ ┌─────┐ ┌─────┐               │  ✅調合可能       │
│ │素材1│ │素材2│ │素材3│               │                   │
│ └─────┘ └─────┘ └─────┘               │                   │
├────────────────────────────────────────┴───────────────────┤
│      [スキップ]    [⚗️ 調合する]           [🔄 リセット]   │
└────────────────────────────────────────────────────────────┘
```

### 5. 状態遷移
1. 初期状態: レシピ未選択、素材未選択
2. レシピ選択: 対応する素材のみ表示
3. 素材選択: プレビューパネルをリアルタイム更新
4. 調合可能判定: 必要素材数を満たしたら調合ボタン有効化
5. 調合実行: アニメーション → 結果表示 → コールバック

### 6. BasePhaseContainerから継承するメソッド
実装必須の抽象メソッド:
- `createContent(): void` - UI構築
- `onEnter(): Promise<void>` - フェーズ開始時処理
- `onExit(): Promise<void>` - フェーズ終了時処理
- `onUpdate(delta: number): void` - 毎フレーム更新
- `getCompletionResult(): unknown` - 完了結果取得
- `canComplete(): boolean` - 完了可能判定

継承で使えるヘルパー:
- `createTitle(title: string)` - タイトル作成
- `createButton(...)` - ボタン作成
- `setButtonEnabled(button, enabled)` - ボタン有効/無効
- `showLoading(message)` / `hideLoading()` - ローディング表示
- `showError(message, onDismiss)` - エラー表示
- `emitAction(action, data)` - イベント発火

## ディレクトリ構成

作成が必要なファイル:
```
src/game/ui/phase/
├── IAlchemyContainer.ts         # インターフェース定義（新規）
├── AlchemyContainer.ts          # 実装（新規）
└── AlchemyContainerConstants.ts # 定数（新規）
```

テストファイル配置:
```
tests/unit/game/ui/phase/
└── AlchemyContainer.test.ts
```

## レイアウト定数仕様

```typescript
export const AlchemyContainerLayout = {
  // 全体サイズ
  WIDTH: 800,
  HEIGHT: 550,
  PADDING: 20,

  // 手札エリア（レシピカード）
  HAND_AREA: {
    X: 20,
    Y: 60,
    WIDTH: 500,
    HEIGHT: 180,
  },

  // 素材選択エリア
  MATERIAL_AREA: {
    X: 20,
    Y: 260,
    WIDTH: 500,
    HEIGHT: 180,
  },

  // プレビューパネル
  PREVIEW_PANEL: {
    X: 540,
    Y: 60,
    WIDTH: 240,
    HEIGHT: 380,
  },

  // アクションエリア
  ACTION_AREA: {
    Y: 480,
    BUTTON_SPACING: 20,
  },
} as const;
```

## テスト観点

1. **コンテナ初期化テスト**
   - `AlchemyContainer`がインスタンス化できる
   - オプションが正しく反映される
   - 各子コンポーネントが作成される

2. **レシピカード設定テスト**
   - `setRecipeCards(cards)` でカードが設定される
   - `getSelectedRecipe()` で選択中のレシピを取得できる
   - レシピ選択でイベントが発火される

3. **素材選択テスト**
   - `setAvailableMaterials(materials)` で素材が設定される
   - `selectMaterial()` / `deselectMaterial()` で選択操作
   - `getSelectedMaterials()` で選択中の素材を取得
   - `clearMaterials()` で選択をリセット

4. **プレビュー連携テスト**
   - レシピ選択時にプレビューが更新される
   - 素材選択時にプレビューが更新される
   - 品質予測が正しく計算される

5. **調合可否判定テスト**
   - `canCraft()` が正しく判定する
   - 調合ボタンの有効/無効が連動する

6. **ライフサイクルテスト**
   - `enter()` で初期化される
   - `exit()` でクリーンアップされる
   - `destroy()` でリソースが破棄される

## 依存タスク関係

### 前提タスク
- **TASK-0213**: BasePhaseContainer実装
- **TASK-0195**: HandContainer実装
- **TASK-0226**: AlchemyPreviewPanel実装

### 後続タスク
- **TASK-0228**: AlchemyContainer操作実装（素材選択・調合実行）

## 参照ドキュメント

- タスク定義: `docs/tasks/atelier-guild-rank-phaser/TASK-0227.md`
- UI設計概要: `docs/design/atelier-guild-rank-phaser/ui-design/overview.md`
- GatheringContainer設計: `docs/tasks/atelier-guild-rank-phaser/TASK-0222.md`
- HandContainer設計: `docs/tasks/atelier-guild-rank-phaser/TASK-0195.md`
- AlchemyPreviewPanel設計: `docs/tasks/atelier-guild-rank-phaser/TASK-0226.md`
