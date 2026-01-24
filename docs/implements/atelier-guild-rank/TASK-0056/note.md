# TASK-0056 TDD開発コンテキストノート

## タスク概要

- **タスクID**: TASK-0056
- **タスク名**: ShopSceneリファクタリング
- **概要**: 890行のShopScene.tsを責務ごとにコンポーネント分割する。any型を適切な型定義に置き換え、共通ユーティリティを活用してコード重複を削減する。
- **推定工数**: 4時間
- **フェーズ**: Phase 7 - Presentation層リファクタリング

---

## 1. 技術スタック

### フレームワーク・ライブラリ

| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| ゲームフレームワーク | Phaser 3 | 3.87+ |
| UIプラグイン | rexUI | - |
| 言語 | TypeScript | 5.x |
| ビルドツール | Vite | 5.x |
| テストフレームワーク | Vitest | - |
| リンター | Biome | 2.x |

### アーキテクチャパターン

```
src/
├── domain/          # ビジネスロジック・エンティティ（依存なし）
├── application/     # ゲームフロー制御・状態管理・イベント調整
├── infrastructure/  # データ永続化・外部連携
├── presentation/    # Phaser Scenes・UI Components ← 対象
└── shared/          # 共通ユーティリティ・型定義
```

**依存方向**: Presentation → Application → Domain → Infrastructure(IF)

### パスエイリアス

```typescript
import { Card } from '@domain/entities/Card';
import { StateManager } from '@application/state/StateManager';
import { Colors } from '@presentation/ui/theme';
import { UIBackgroundBuilder } from '@presentation/ui/utils';
```

---

## 2. 開発ルール

### Biome設定（コーディング規約）

```json
{
  "linter": {
    "rules": {
      "suspicious": {
        "noExplicitAny": "warn"  // any型は警告
      }
    }
  },
  "formatter": {
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "always",
      "trailingCommas": "all"
    }
  }
}
```

### テスト要件

- **カバレッジ閾値**: Global 80%+ (branches, functions, lines, statements)
- **テスト配置**: `tests/unit/presentation/ui/scenes/components/`
- **設定ファイル**: `tests/setup.ts`

### テスト実行コマンド

```bash
pnpm test                           # 全テスト実行
pnpm test tests/unit/xxx.test.ts    # 特定ファイル
pnpm test:coverage                  # カバレッジ付き
```

---

## 3. 関連実装パターン

### 3.1 BaseComponentクラス（継承パターン）

**ファイル**: `src/presentation/ui/components/BaseComponent.ts`

```typescript
export abstract class BaseComponent {
  protected scene: Phaser.Scene;
  protected container: Phaser.GameObjects.Container;
  // biome-ignore lint/suspicious/noExplicitAny: rexUIプラグインは型定義が複雑
  protected rexUI: any;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    if (!scene) {
      throw new Error('BaseComponent: scene is required');
    }
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      throw new Error(`Invalid position: x=${x}, y=${y}`);
    }
    this.scene = scene;
    this.container = scene.add.container(x, y);
    // @ts-expect-error - rexUIはプラグイン
    this.rexUI = scene.rexUI;
  }

  abstract create(): void;
  abstract destroy(): void;

  setVisible(visible: boolean): this { /* ... */ }
  setPosition(x: number, y: number): this { /* ... */ }
  getContainer(): Phaser.GameObjects.Container { /* ... */ }
}
```

### 3.2 CardUIコンポーネント（参考パターン）

**ファイル**: `src/presentation/ui/components/CardUI.ts`

```typescript
import { Colors } from '../theme';
import { AnimationPresets } from '../utils/AnimationPresets';
import { BaseComponent } from './BaseComponent';

export interface CardUIConfig {
  card: Card;
  x: number;
  y: number;
  interactive?: boolean;
  onClick?: (card: Card) => void;
}

export class CardUI extends BaseComponent {
  private static readonly CARD_WIDTH = 120;
  private static readonly CARD_HEIGHT = 160;

  constructor(scene: Phaser.Scene, config: CardUIConfig) {
    super(scene, config.x, config.y);
    if (!config.card) {
      throw new Error('CardUI: card is required');
    }
    // ...
  }

  private setupInteraction(): void {
    this.background.on('pointerover', () => {
      this.scene.tweens.add({
        targets: this.container,
        ...AnimationPresets.scale.hoverLarge,
      });
    });
    // ...
  }
}
```

### 3.3 Dialogコンポーネント（モーダルパターン）

**ファイル**: `src/presentation/ui/components/Dialog.ts`

```typescript
export class Dialog extends BaseComponent {
  // biome-ignore lint/suspicious/noExplicitAny: rexUI Dialogコンポーネント
  private dialog: any | null = null;
  // biome-ignore lint/suspicious/noExplicitAny: Phaser Rectangleオブジェクト
  private overlay: any | null = null;
  private _visible: boolean = false;

  show(duration: number = 300): this { /* ... */ }
  hide(duration: number = 300): this { /* ... */ }
  isVisible(): boolean { return this._visible; }

  destroy(): void {
    if (this.dialog !== null) {
      this.dialog.destroy();
      this.dialog = null;
    }
    // ...
  }
}
```

### 3.4 Buttonコンポーネント（インタラクションパターン）

**ファイル**: `src/presentation/ui/components/Button.ts`

```typescript
export class Button extends BaseComponent {
  private onPointerOver(): void {
    if (!this._enabled) return;
    this.scene.tweens.add({
      targets: this.label,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 100,
      ease: 'Power2',
    });
    this.setHighlight(true);
  }

  setEnabled(enabled: boolean): this {
    this._enabled = enabled;
    this.updateEnabledState();
    return this;
  }
}
```

---

## 4. 共通ユーティリティ（TASK-0053, TASK-0054）

### 4.1 UIBackgroundBuilder

**ファイル**: `src/presentation/ui/utils/UIBackgroundBuilder.ts`

```typescript
export class UIBackgroundBuilder {
  constructor(scene: Phaser.Scene) { /* ... */ }

  setPosition(x: number, y: number): this { /* ... */ }
  setSize(width: number, height: number): this { /* ... */ }
  setFill(color: number, alpha?: number): this { /* ... */ }
  setBorder(color: number, width?: number): this { /* ... */ }
  setRadius(radius: number): this { /* ... */ }
  build(): Phaser.GameObjects.Graphics { /* ... */ }
}

// 使用例
const bg = new UIBackgroundBuilder(this.scene)
  .setPosition(0, 0)
  .setSize(500, 120)
  .setFill(Colors.background.primary, 0.95)
  .setBorder(Colors.border.primary, 2)
  .setRadius(8)
  .build();
```

### 4.2 AnimationPresets

**ファイル**: `src/presentation/ui/utils/AnimationPresets.ts`

```typescript
export const AnimationPresets = {
  fade: {
    in: { alpha: { from: 0, to: 1 }, duration: 300, ease: 'Power2' },
    out: { alpha: { from: 1, to: 0 }, duration: 300, ease: 'Power2' },
  },
  scale: {
    hover: { scale: 1.05, duration: 150, ease: 'Quad.Out' },
    hoverLarge: { scaleX: 1.1, scaleY: 1.1, duration: 100, ease: 'Power2' },
    press: { scale: 0.95, duration: 100, ease: 'Power2' },
    reset: { scale: 1.0, duration: 100, ease: 'Power2' },
    resetXY: { scaleX: 1, scaleY: 1, duration: 100, ease: 'Power2' },
  },
  button: {
    hover: { scale: 1.05, duration: 100, ease: 'Power2' },
    click: { scale: 0.95, duration: 50, ease: 'Power2' },
    release: { scale: 1, duration: 100, ease: 'Power2' },
  },
  timing: {
    fast: 100,
    normal: 200,
    slow: 400,
  },
};
```

### 4.3 HoverAnimationMixin

**ファイル**: `src/presentation/ui/utils/HoverAnimationMixin.ts`

```typescript
export function applyHoverAnimation(
  gameObject: Phaser.GameObjects.GameObject,
  scene: Phaser.Scene,
  config?: HoverAnimationConfig,
): void {
  // ホバー時の拡大・縮小アニメーションを自動適用
}

export function removeHoverAnimation(
  gameObject: Phaser.GameObjects.GameObject,
): void {
  // ホバーアニメーションを解除
}
```

### 4.4 BorderLineFactory

**ファイル**: `src/presentation/ui/utils/BorderLineFactory.ts`

```typescript
export function createHorizontalLine(scene, x, y, width, color?, thickness?): Graphics;
export function createVerticalLine(scene, x, y, height, color?, thickness?): Graphics;
export function createRoundedBorder(scene, x, y, width, height, radius?, color?): Graphics;
```

---

## 5. テーマ定数

### 5.1 統一カラーパレット（Colors）

**ファイル**: `src/presentation/ui/theme.ts`

```typescript
export const Colors = {
  background: {
    primary: 0x2a2a3d,    // メイン背景
    secondary: 0x1a1a2e,  // サブ背景
    overlay: 0x000000,    // オーバーレイ
    card: 0x3a3a4d,       // カード背景
  },
  border: {
    primary: 0x4a4a5d,    // メインボーダー
    secondary: 0x5a5a6d,  // サブボーダー
    highlight: 0x6a6a7d,  // ハイライトボーダー
    gold: 0xffd700,       // ゴールドボーダー
  },
  text: {
    primary: 0xffffff,    // メインテキスト（白）
    secondary: 0xcccccc,  // サブテキスト
    muted: 0x888888,      // 薄いテキスト
    accent: 0xffd700,     // アクセント（ゴールド）
    error: 0xff4444,      // エラー
    success: 0x44ff44,    // 成功
  },
  ui: {
    button: {
      normal: 0x4a4a5d,
      hover: 0x5a5a6d,
      active: 0x6a6a7d,
      disabled: 0x2a2a3d,
    },
  },
};
```

### 5.2 THEME定数

```typescript
export const THEME = {
  colors: {
    primary: 0x8b4513,       // SaddleBrown
    primaryHover: 0x9b5523,
    secondary: 0xd2691e,     // Chocolate
    background: 0xf5f5dc,    // Beige
    text: 0x333333,
    success: 0x228b22,       // ForestGreen
    warning: 0xdaa520,       // Goldenrod
    error: 0x8b0000,         // DarkRed
    disabled: 0xcccccc,
  },
  sizes: {
    small: 14,
    medium: 16,
    large: 20,
    xlarge: 24,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};
```

---

## 6. 現在のShopScene分析

### 6.1 ファイル情報

- **ファイル**: `src/presentation/ui/scenes/ShopScene.ts`
- **行数**: 890行
- **問題点**:
  - 巨大な単一ファイル（400行以下が目標）
  - 責務の混在（UI生成、イベント処理、状態管理）
  - ローカル型定義の重複（IEventBus, ShopItem等）
  - any型の使用（Button, ItemCardUI等のインターフェース内）

### 6.2 現在の構造

```typescript
// ローカル定義（移動または削除対象）
const UI_LAYOUT = { /* ... */ };
const ITEM_GRID = { /* ... */ };
const ERROR_MESSAGES = { /* ... */ };
const UI_TEXT = { /* ... */ };
const UI_STYLES = { /* ... */ };
const KEYBOARD_KEYS = { /* ... */ };
const ShopCategory = { /* ... */ };
interface IEventBus { /* ... */ }
interface ShopItem { /* ... */ }
interface IShopService { /* ... */ }
interface IInventoryService { /* ... */ }

// クラス定義
export abstract class BaseComponent { /* ... */ }  // ← 重複（既存あり）
export class ShopScene extends BaseComponent {
  // 責務が混在
  - タイトル・所持金表示
  - カテゴリサイドバー
  - 商品グリッド
  - 商品カード生成
  - 詳細パネル
  - 購入ボタン
  - 閉じるボタン
  - キーボード入力
  - イベント購読
}
```

### 6.3 分割計画

| コンポーネント | 責務 | 推定行数 |
|---------------|------|---------|
| ShopScene.ts | シーン管理・コンポーネント統合 | 200行 |
| ShopHeader.ts | ヘッダー表示（所持金・タイトル） | 100行 |
| ShopCategorySidebar.ts | カテゴリサイドバー | 100行 |
| ShopItemGrid.ts | 商品グリッド表示 | 150行 |
| ShopItemCard.ts | 個別商品カード表示 | 120行 |
| ShopDetailPanel.ts | 詳細パネル・購入ボタン | 150行 |

---

## 7. イベントシステム

### GameEventType

**ファイル**: `src/shared/types/events.ts`

```typescript
export const GameEventType = {
  PHASE_CHANGED: 'PHASE_CHANGED',
  QUEST_COMPLETED: 'QUEST_COMPLETED',
  CARD_DRAWN: 'CARD_DRAWN',
  CARD_PLAYED: 'CARD_PLAYED',
  GAME_SAVED: 'GAME_SAVED',
  // etc.
};
```

### ShopScene固有イベント

```typescript
// ShopScene内で定義されているイベント（共有型に移動検討）
const GameEventType = {
  SHOP_OPENED: 'SHOP_OPENED',
  SHOP_CLOSED: 'SHOP_CLOSED',
  CATEGORY_CHANGED: 'CATEGORY_CHANGED',
  ITEM_SELECTED: 'ITEM_SELECTED',
  ITEM_PURCHASED: 'ITEM_PURCHASED',
  ITEM_SOLD: 'ITEM_SOLD',
  GOLD_CHANGED: 'GOLD_CHANGED',
};
```

---

## 8. テストパターン

### 8.1 既存テストファイル

**ファイル**: `tests/unit/presentation/scenes/shop-scene.test.ts`

```typescript
// モック作成パターン
const createMockContainer = () => ({
  setVisible: vi.fn().mockReturnThis(),
  setPosition: vi.fn().mockReturnThis(),
  add: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
});

const createMockScene = () => ({
  add: {
    container: vi.fn().mockImplementation((x, y) => createMockContainer()),
    text: vi.fn().mockReturnValue(createMockText()),
    graphics: vi.fn().mockReturnValue(createMockGraphics()),
    rectangle: vi.fn().mockReturnValue({ /* ... */ }),
  },
  cameras: { main: { /* ... */ } },
  rexUI: createMockRexUI(),
  tweens: { add: vi.fn() },
  scene: { start: vi.fn() },
});
```

### 8.2 共通ユーティリティテスト

**参考ファイル**: `tests/unit/presentation/ui/utils/UIBackgroundBuilder.test.ts`

```typescript
describe('UIBackgroundBuilder', () => {
  it('Sceneが必須であること', () => {
    expect(() => new UIBackgroundBuilder(null as unknown as Phaser.Scene))
      .toThrow('Scene is required');
  });

  it('メソッドチェーンが機能すること', () => {
    const builder = new UIBackgroundBuilder(mockScene);
    const result = builder
      .setPosition(10, 20)
      .setSize(100, 200)
      .setFill(0xff0000);
    expect(result).toBe(builder);
  });
});
```

---

## 9. 完了条件チェックリスト

- [ ] ShopScene.tsが400行以下になっている
- [ ] 3つ以上のサブコンポーネントに分割されている
- [ ] any型が全て適切な型に置き換わっている
- [ ] 共通ユーティリティ（TASK-0053, 0054）を使用している
  - [ ] UIBackgroundBuilder
  - [ ] AnimationPresets
  - [ ] Colors / THEME
  - [ ] applyHoverAnimation
- [ ] 既存テストが全て通過する
- [ ] 新規コンポーネントのテストカバレッジが80%以上

---

## 10. 注意事項

### 技術的制約

1. **rexUIプラグインの型定義**
   - rexUIは複雑な型のため、必要に応じて `biome-ignore` コメントを使用
   - 例: `// biome-ignore lint/suspicious/noExplicitAny: rexUIプラグイン`

2. **BaseComponentの継承**
   - 既存の `src/presentation/ui/components/BaseComponent.ts` を継承
   - ShopScene.ts内のローカルBaseComponentは削除

3. **イベントバスの型定義**
   - `src/shared/types/events.ts` に定義されている型を使用
   - ショップ固有のイベントは追加定義が必要

### パフォーマンス要件

1. **商品カードの遅延生成**
   - 表示領域外のカードは遅延生成を検討
   - スクロール時のパフォーマンスに注意

2. **メモリリーク防止**
   - destroy()で全てのリソースを解放
   - イベントリスナーの解除を忘れない

### セキュリティ要件

- なし（フロントエンドUI層のため）

---

## 11. 関連ファイル一覧

### 対象ファイル

| ファイル | 役割 |
|---------|------|
| `src/presentation/ui/scenes/ShopScene.ts` | リファクタリング対象（890行） |

### 参考ファイル

| ファイル | 役割 |
|---------|------|
| `src/presentation/ui/components/BaseComponent.ts` | 基底クラス |
| `src/presentation/ui/components/CardUI.ts` | カードUIパターン |
| `src/presentation/ui/components/Dialog.ts` | ダイアログパターン |
| `src/presentation/ui/components/Button.ts` | ボタンパターン |
| `src/presentation/ui/theme.ts` | カラー・スタイル定数 |
| `src/presentation/ui/utils/index.ts` | 共通ユーティリティ |
| `tests/unit/presentation/scenes/shop-scene.test.ts` | 既存テスト |

### 出力予定ファイル

| ファイル | 役割 |
|---------|------|
| `src/presentation/ui/scenes/components/shop/ShopHeader.ts` | ヘッダーコンポーネント |
| `src/presentation/ui/scenes/components/shop/ShopCategorySidebar.ts` | カテゴリサイドバー |
| `src/presentation/ui/scenes/components/shop/ShopItemGrid.ts` | 商品グリッド |
| `src/presentation/ui/scenes/components/shop/ShopItemCard.ts` | 商品カード |
| `src/presentation/ui/scenes/components/shop/ShopDetailPanel.ts` | 詳細パネル |
| `src/presentation/ui/scenes/components/shop/types.ts` | 型定義 |
| `tests/unit/presentation/ui/scenes/components/shop/*.test.ts` | テスト |

---

## 12. TDD開発フロー

1. `/tsumiki:tdd-requirements TASK-0056` - 詳細要件定義
2. `/tsumiki:tdd-testcases` - テストケース作成
3. `/tsumiki:tdd-red` - テスト実装（失敗）
4. `/tsumiki:tdd-green` - 最小実装
5. `/tsumiki:tdd-refactor` - リファクタリング
6. `/tsumiki:tdd-verify-complete` - 品質確認

---

*生成日時: 2026-01-23*
*タスクID: TASK-0056*
