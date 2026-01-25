# TASK-0058 TDD開発コンテキストノート

## タスク概要

- **タスクID**: TASK-0058
- **タスク名**: TitleSceneリファクタリング
- **概要**: 819行のTitleScene.tsを責務ごとにコンポーネント分割する。共通UIユーティリティ（TASK-0053, TASK-0054）を活用してコード重複を削減し、保守性を向上させる。
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
import { Colors, THEME } from '@presentation/ui/theme';
import { UIBackgroundBuilder, AnimationPresets } from '@presentation/ui/utils';
import { BaseComponent } from '@presentation/ui/components/BaseComponent';
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
- **Domain層**: 90%+
- **テスト配置**: `tests/unit/presentation/ui/scenes/components/title/`
- **設定ファイル**: `tests/setup.ts`

### テスト実行コマンド

```bash
pnpm test                           # 全テスト実行
pnpm test tests/unit/xxx.test.ts    # 特定ファイル
pnpm test:coverage                  # カバレッジ付き
```

---

## 3. 現在のTitleScene分析

### 3.1 ファイル情報

- **ファイル**: `src/presentation/scenes/TitleScene.ts`
- **行数**: 819行（目標: 400行以下）
- **問題点**:
  - 巨大な単一ファイル
  - 責務の混在（UI生成、ダイアログ表示、アニメーション、セーブデータ管理）
  - ローカル定数が多い（シーン固有で再利用が困難）
  - rexUIプラグインのany型使用

### 3.2 現在の構造分析

```
TitleScene.ts (819行)
├── 定数定義（〜160行）
│   ├── LAYOUT（レイアウト座標）
│   ├── STYLES（フォントサイズ・色）
│   ├── SIZES（ボタン・ダイアログサイズ）
│   ├── DEPTH（Z-index）
│   ├── ANIMATION（アニメーション設定）
│   ├── DEFAULT_SCREEN（画面サイズ）
│   └── TEXT（テキスト定数）
│
├── 型定義（〜80行）
│   ├── ISaveDataRepository（インターフェース）
│   ├── SaveData（型）
│   └── DialogConfig（設定型）
│
└── TitleSceneクラス（〜580行）
    ├── プロパティ（rexUI, saveDataRepository, buttons, continueButton, continueEnabled）
    ├── コンストラクタ
    ├── ライフサイクルメソッド
    │   ├── create() - タイトル画面生成
    │   └── shutdown() - リソース解放
    ├── UI生成メソッド
    │   ├── createTitleLogo()
    │   ├── createSubtitle()
    │   ├── createVersionInfo()
    │   ├── createMenuButtons()
    │   └── createButton()
    ├── イベントハンドラ
    │   ├── onNewGameClick()
    │   ├── onContinueClick()
    │   └── onSettingsClick()
    ├── ダイアログ表示
    │   ├── showConfirmDialog()
    │   ├── showSettingsDialog()
    │   ├── showErrorDialog()
    │   ├── createDialogOverlay()
    │   └── createDialog()
    ├── ユーティリティ
    │   └── checkSaveDataIntegrity()
    └── アニメーション
        ├── fadeIn()
        └── fadeOutToScene()
```

### 3.3 責務別分割計画

| コンポーネント | 責務 | 推定行数 |
|---------------|------|---------|
| TitleScene.ts | シーン管理・コンポーネント統合 | 200行 |
| TitleLogo.ts | タイトルロゴ・サブタイトル表示 | 100行 |
| TitleMenu.ts | メインメニュー（新規/続き/設定ボタン） | 150行 |
| TitleDialog.ts | 確認/設定/エラーダイアログ | 200行 |
| types.ts | 型定義・インターフェース | 80行 |

---

## 4. 共通ユーティリティ（TASK-0053, TASK-0054）

### 4.1 UIBackgroundBuilder

**ファイル**: `src/presentation/ui/utils/UIBackgroundBuilder.ts`

```typescript
// 使用例
const bg = new UIBackgroundBuilder(this.scene)
  .setPosition(0, 0)
  .setSize(200, 50)
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
): void;

export function removeHoverAnimation(
  gameObject: Phaser.GameObjects.GameObject,
): void;
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
  },
  border: {
    primary: 0x4a4a5d,    // メインボーダー
    gold: 0xffd700,       // ゴールドボーダー
  },
  text: {
    primary: 0xffffff,    // メインテキスト（白）
    secondary: 0xcccccc,  // サブテキスト
    muted: 0x888888,      // 薄いテキスト
    accent: 0xffd700,     // アクセント（ゴールド）
  },
  ui: {
    button: {
      normal: 0x4a4a5d,
      hover: 0x5a5a6d,
      disabled: 0x2a2a3d,
    },
  },
};
```

### 5.2 THEME定数

```typescript
export const THEME = {
  colors: {
    primary: 0x8b4513,       // SaddleBrown - タイトルシーンで使用
    secondary: 0xd2691e,     // Chocolate
    background: 0xf5f5dc,    // Beige
    error: 0x8b0000,         // DarkRed
    textOnPrimary: '#FFFFFF',
  },
  fonts: {
    primary: '"M PLUS Rounded 1c", sans-serif',
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

## 6. 関連実装パターン

### 6.1 BaseComponentクラス（継承パターン）

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

### 6.2 ShopHeaderコンポーネント（参考パターン - TASK-0056）

**ファイル**: `src/presentation/ui/scenes/components/shop/ShopHeader.ts`

```typescript
export class ShopHeader extends BaseComponent {
  private goldText: Phaser.GameObjects.Text | null = null;
  private currentGold: number = 0;
  private options: ShopHeaderOptions;
  // biome-ignore lint/suspicious/noExplicitAny: rexUIのラベルコンポーネント
  private backButton: any = null;

  constructor(scene: Phaser.Scene, x: number, y: number, options?: ShopHeaderOptions) {
    super(scene, x, y);
    this.options = options || {};
  }

  create(): void { /* UI要素を作成 */ }
  setGold(gold: number): void { /* 所持金を更新 */ }
  destroy(): void { /* リソースを解放 */ }
}
```

### 6.3 RankUpコンポーネント型定義（参考パターン - TASK-0055）

**ファイル**: `src/presentation/ui/scenes/components/rankup/types.ts`

```typescript
export type Quality = 'C' | 'B' | 'A' | 'S';
export type Rank = 'G' | 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
export type TestState = 'NotStarted' | 'InProgress' | 'Completed' | 'Failed';

export interface TestPanelCallbacks {
  onStartTest: () => void;
  onDeclineTest: () => void;
  onToTitle: () => void;
}
```

---

## 7. ディレクトリ構造

### 7.1 出力予定ファイル

```
src/presentation/
├── scenes/
│   └── TitleScene.ts                    # メインシーン（統合・管理）約200行
└── ui/
    └── scenes/
        └── components/
            └── title/
                ├── index.ts             # バレルエクスポート
                ├── types.ts             # 型定義・インターフェース
                ├── TitleLogo.ts         # ロゴ・サブタイトルコンポーネント
                ├── TitleMenu.ts         # メニューボタンコンポーネント
                └── TitleDialog.ts       # ダイアログコンポーネント

tests/unit/presentation/ui/scenes/components/title/
├── types.test.ts
├── TitleLogo.test.ts
├── TitleMenu.test.ts
├── TitleDialog.test.ts
└── TitleScene.integration.test.ts
```

---

## 8. テストパターン

### 8.1 モック作成ヘルパー

```typescript
/**
 * モックコンテナを作成
 */
const createMockContainer = () => ({
  setVisible: vi.fn().mockReturnThis(),
  setPosition: vi.fn().mockReturnThis(),
  add: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
  x: 0,
  y: 0,
});

/**
 * モックテキストを作成
 */
const createMockText = () => ({
  setText: vi.fn().mockReturnThis(),
  setOrigin: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
  text: '',
});

/**
 * モックrexUIを作成
 */
const createMockRexUI = () => ({
  add: {
    label: vi.fn().mockReturnValue({
      setInteractive: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
      layout: vi.fn().mockReturnThis(),
    }),
    roundRectangle: vi.fn().mockReturnValue({
      setFillStyle: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
    }),
    dialog: vi.fn().mockReturnValue({
      layout: vi.fn().mockReturnThis(),
      setDepth: vi.fn().mockReturnThis(),
      popUp: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
    }),
  },
});

/**
 * モックシーンを作成
 */
const createMockScene = () => {
  const mockContainer = createMockContainer();
  const mockText = createMockText();
  const mockRexUI = createMockRexUI();

  return {
    scene: {
      add: {
        container: vi.fn().mockReturnValue(mockContainer),
        text: vi.fn().mockReturnValue(mockText),
        graphics: vi.fn().mockReturnValue(createMockGraphics()),
        rectangle: vi.fn().mockReturnValue(createMockRectangle()),
      },
      cameras: {
        main: {
          centerX: 640,
          centerY: 360,
          width: 1280,
          height: 720,
          fadeIn: vi.fn(),
          fadeOut: vi.fn(),
          once: vi.fn(),
        },
      },
      rexUI: mockRexUI,
      tweens: { add: vi.fn() },
      scene: { start: vi.fn() },
      scale: { width: 1280, height: 720 },
      data: { get: vi.fn() },
    } as unknown as Phaser.Scene,
    mockContainer,
    mockText,
    mockRexUI,
  };
};
```

---

## 9. 完了条件チェックリスト

- [ ] TitleScene.tsが400行以下になっている
- [ ] 3つ以上のサブコンポーネントに分割されている
  - [ ] TitleLogo.ts
  - [ ] TitleMenu.ts
  - [ ] TitleDialog.ts
  - [ ] types.ts
- [ ] 共通ユーティリティ（TASK-0053, 0054）を使用している
  - [ ] UIBackgroundBuilder（ボタン背景など）
  - [ ] AnimationPresets（フェードイン/アウトなど）
  - [ ] Colors / THEME（統一カラー）
  - [ ] applyHoverAnimation（ボタンホバー）
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
   - ただし、TitleSceneはPhaser.Sceneを継承する必要があるため、サブコンポーネントのみBaseComponentを継承

3. **セーブデータリポジトリ**
   - `ISaveDataRepository` インターフェースは既存のものを維持
   - リポジトリ実装との互換性を保つ

### パフォーマンス要件

1. **メモリリーク防止**
   - destroy()で全てのリソースを解放
   - イベントリスナーの解除を忘れない

2. **アニメーション設定の統一**
   - AnimationPresetsを使用して一貫性を保つ
   - ローカル定数ANIMATIONは必要最小限に

### セキュリティ要件

- なし（フロントエンドUI層のため）

---

## 11. TDD開発フロー

1. `/tsumiki:tdd-requirements TASK-0058` - 詳細要件定義
2. `/tsumiki:tdd-testcases` - テストケース作成
3. `/tsumiki:tdd-red` - テスト実装（失敗）
4. `/tsumiki:tdd-green` - 最小実装
5. `/tsumiki:tdd-refactor` - リファクタリング
6. `/tsumiki:tdd-verify-complete` - 品質確認

---

*生成日時: 2026-01-24*
*タスクID: TASK-0058*
