# TASK-0019: TitleScene実装 - TDD開発ノート

**タスクID**: TASK-0019
**タスク名**: TitleScene実装
**フェーズ**: Phase 3 - UI層
**作成日**: 2026-01-17

---

## 1. 技術スタック

### 1.1 使用技術・フレームワーク

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **Phaser** | ^3.87.0 | ゲームエンジン |
| **phaser3-rex-plugins** | ^1.80.0 | UI拡張（rexUI） |
| **TypeScript** | ^5.7.0 | 開発言語 |
| **Vite** | ^5.4.0 | ビルドツール |
| **Vitest** | ^4.0.17 | テストフレームワーク |
| **Biome** | ^2.0.0 | リンター・フォーマッター |

### 1.2 アーキテクチャパターン

- **Clean Architecture**: ドメイン / アプリケーション / インフラストラクチャ / プレゼンテーション層
- **Phaser Scene**: シーン単位での画面管理
- **UIコンポーネント**: BaseComponentを継承したカスタムUIコンポーネント

### 1.3 パス別名（tsconfig.json）

```typescript
"@domain/*": ["src/domain/*"]
"@application/*": ["src/application/*"]
"@infrastructure/*": ["src/infrastructure/*"]
"@presentation/*": ["src/presentation/*"]
"@shared/*": ["src/shared/*"]
```

---

## 2. 開発ルール

### 2.1 コーディング規約

- **リンター**: Biome（ESLint/Prettierの代替）
- **コマンド**: `pnpm lint`, `pnpm lint:fix`, `pnpm format`
- **strictモード**: 有効
- **noUnusedLocals/Parameters**: 有効

### 2.2 テスト要件

| コマンド | 用途 |
|---------|------|
| `pnpm test` | 全テスト実行 |
| `pnpm test:watch` | ウォッチモード |
| `pnpm test:coverage` | カバレッジ付き |
| `pnpm test:ui` | UIモード |
| `pnpm test:e2e` | E2Eテスト（Playwright） |

### 2.3 コメント規約

- 信頼性レベルの明記
  - 🔵 **青信号**: 設計文書に記載
  - 🟡 **黄信号**: 設計文書から妥当な推測
  - 🔴 **赤信号**: 設計文書にない推測

---

## 3. 関連実装

### 3.1 現在のTitleScene（仮実装）

**ファイル**: `src/presentation/scenes/TitleScene.ts`

```typescript
export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create(): void {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // タイトルテキスト表示（仮実装）
    this.add
      .text(centerX, centerY - 50, 'Atelier Guild Rank', {
        fontSize: '48px',
        color: '#8B4513',
      })
      .setOrigin(0.5);

    // スタート案内テキスト表示（仮実装）
    this.add
      .text(centerX, centerY + 50, 'Press SPACE to start', {
        fontSize: '24px',
        color: '#666666',
      })
      .setOrigin(0.5);

    // スペースキーでMainSceneへ遷移（仮実装）
    this.input.keyboard?.once('keydown-SPACE', () => {
      this.scene.start('MainScene');
    });
  }
}
```

### 3.2 BootSceneからの遷移

**ファイル**: `src/presentation/scenes/BootScene.ts`

- preload(): マスターデータ6種類を読み込み、プログレスバー表示
- create(): `this.scene.start('TitleScene')` でTitleSceneへ遷移

### 3.3 UIテーマ定義

**ファイル**: `src/presentation/ui/theme.ts`

```typescript
export const THEME = {
  colors: {
    primary: 0x8b4513,      // SaddleBrown
    secondary: 0xd2691e,    // Chocolate
    background: 0xf5f5dc,   // Beige
    text: 0x333333,         // ダークグレー
    textLight: 0x666666,    // ミディアムグレー
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#FFFFFF',
    success: 0x228b22,
    warning: 0xdaa520,
    error: 0x8b0000,
    disabled: 0xcccccc,
  },
  fonts: {
    primary: 'Noto Sans JP',
    secondary: 'sans-serif',
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
} as const;
```

### 3.4 Buttonコンポーネント

**ファイル**: `src/presentation/ui/components/Button.ts`

```typescript
export enum ButtonType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  TEXT = 'text',
  ICON = 'icon',
}

export interface ButtonConfig {
  text: string;
  onClick: () => void;
  type?: ButtonType;
  icon?: string;
  enabled?: boolean;
  width?: number;
  height?: number;
}

export class Button extends BaseComponent {
  // rexUI Labelをラップ
  // setEnabled(enabled: boolean): this
  // isEnabled(): boolean
}
```

### 3.5 Dialogコンポーネント

**ファイル**: `src/presentation/ui/components/Dialog.ts`

```typescript
export enum DialogType {
  CONFIRM = 'confirm',
  INFO = 'info',
  CHOICE = 'choice',
}

export interface DialogConfig {
  title: string;
  content: string;
  type?: DialogType;
  actions?: DialogAction[];
  width?: number;
  height?: number;
  onClose?: () => void;
}

export class Dialog extends BaseComponent {
  // rexUI Dialogをラップ
  // show(duration?: number): this
  // hide(duration?: number): this
  // isVisible(): boolean
}
```

### 3.6 BaseComponent

**ファイル**: `src/presentation/ui/components/BaseComponent.ts`

```typescript
export abstract class BaseComponent {
  protected scene: Phaser.Scene;
  protected container: Phaser.GameObjects.Container;
  protected rexUI: any; // rexUIプラグイン

  constructor(scene: Phaser.Scene, x: number, y: number) {
    // scene、rexUI、containerの初期化
    // 入力値バリデーション
  }

  abstract create(): void;
  abstract destroy(): void;
  setVisible(visible: boolean): this;
  setPosition(x: number, y: number): this;
}
```

---

## 4. 設計文書

### 4.1 TitleScene画面設計

**参照**: `docs/design/atelier-guild-rank/ui-design/screens/title.md`

#### 画面レイアウト

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    ╔═══════════════════╗                    │
│                    ║   ATELIER GUILD   ║                    │
│                    ║   錬金術師ギルド   ║                    │
│                    ╚═══════════════════╝                    │
│                                                             │
│                    ┌─────────────────┐                      │
│                    │   新規ゲーム    │                      │
│                    └─────────────────┘                      │
│                    ┌─────────────────┐                      │
│                    │  コンティニュー │  ← セーブデータ無時は │
│                    └─────────────────┘    グレーアウト      │
│                    ┌─────────────────┐                      │
│                    │     設定        │                      │
│                    └─────────────────┘                      │
│                                                             │
│                                           Version 1.0.0     │
└─────────────────────────────────────────────────────────────┘
```

#### UI要素

| 要素ID | 種類 | 説明 |
|--------|------|------|
| `logo` | テキスト | タイトルロゴ「ATELIER GUILD」 |
| `subtitle` | テキスト | サブタイトル「錬金術師ギルド」 |
| `btn-new-game` | プライマリボタン | 新規ゲーム開始（常に有効） |
| `btn-continue` | セカンダリボタン | コンティニュー（セーブデータ有無で有効/無効） |
| `btn-settings` | セカンダリボタン | 設定画面へ（常に有効） |
| `txt-version` | テキスト | バージョン表示「Version 1.0.0」 |

### 4.2 ディレクトリ構造

```
atelier-guild-rank/
├── src/
│   ├── presentation/
│   │   ├── scenes/
│   │   │   ├── index.ts
│   │   │   ├── BootScene.ts
│   │   │   ├── TitleScene.ts  ← 実装対象
│   │   │   └── MainScene.ts
│   │   └── ui/
│   │       ├── theme.ts
│   │       └── components/
│   │           ├── BaseComponent.ts
│   │           ├── Button.ts
│   │           └── Dialog.ts
├── tests/
│   └── unit/
│       └── presentation/
│           └── scenes/
│               └── BootScene.test.ts  ← 参考テスト
└── docs/
    └── design/
        └── atelier-guild-rank/
            └── ui-design/
                └── screens/
                    └── title.md  ← 設計文書
```

---

## 5. 注意事項

### 5.1 技術的制約

- **Phaser Scene**: `Phaser.Scene`を継承し、`constructor`で`super({ key: 'TitleScene' })`を呼び出す
- **rexUIプラグイン**: `this.rexUI`経由でアクセス（シーン初期化時に自動注入）
- **コンポーネント使用**: Button、Dialogは既存コンポーネントを使用
- **テストモック**: Phaserは`vi.mock('phaser')`でモック化してテスト

### 5.2 実装すべき機能

#### 必須条件 🔵
- [ ] タイトルロゴが表示される
- [ ] 3つのボタンが表示される（新規ゲーム、コンティニュー、設定）
- [ ] 新規ゲームでMainSceneへ遷移
- [ ] セーブデータ無時はコンティニュー無効

#### 推奨条件 🟡
- [ ] フェードイン・アウトアニメーション
- [ ] ボタンホバーエフェクト

### 5.3 テストケース

| テストID | テスト内容 | 期待結果 |
|---------|----------|----------|
| T-0019-01 | 画面表示 | 全要素表示 |
| T-0019-02 | 新規ゲームボタン | MainSceneへ遷移 |
| T-0019-03 | コンティニュー（セーブあり） | ゲーム再開 |
| T-0019-04 | コンティニュー（セーブなし） | ボタン無効 |

### 5.4 UIレイヤー深度

| レイヤー | 深度(depth) |
|---------|------------|
| Background | 0 |
| Content | 100 |
| Overlay | 300 |
| Dialog | 400 |

### 5.5 アニメーション設定

| トリガー | アニメーション | 時間 | イージング |
|----------|---------------|------|-----------|
| 画面表示時 | フェードイン | 0.5s | ease-out |
| ボタン群表示 | 下からスライドイン | 0.3s (遅延あり) | ease-out |
| ボタンホバー | スケール拡大 (1.05倍) | 0.1s | ease-in-out |
| 画面遷移開始 | フェードアウト | 0.3s | ease-in |

### 5.6 確認ダイアログ仕様（新規ゲーム時）

| 項目 | 内容 |
|------|------|
| **タイトル** | 新規ゲーム開始 |
| **メッセージ** | 既存のセーブデータは削除されます。よろしいですか？ |
| **ボタン1** | はい（プライマリ） |
| **ボタン2** | いいえ（セカンダリ） |
| **デフォルトフォーカス** | いいえ |

---

## 6. 参考ファイル一覧

| ファイルパス | 内容 |
|-------------|------|
| `docs/tasks/atelier-guild-rank/phase-3/TASK-0019.md` | タスク定義書 |
| `docs/design/atelier-guild-rank/ui-design/screens/title.md` | タイトル画面設計 |
| `docs/design/atelier-guild-rank/ui-design/overview.md` | UI設計概要 |
| `src/presentation/scenes/TitleScene.ts` | 現在の仮実装 |
| `src/presentation/scenes/BootScene.ts` | 参考シーン実装 |
| `src/presentation/ui/theme.ts` | UIテーマ定義 |
| `src/presentation/ui/components/Button.ts` | ボタンコンポーネント |
| `src/presentation/ui/components/Dialog.ts` | ダイアログコンポーネント |
| `src/presentation/ui/components/BaseComponent.ts` | 基底コンポーネント |
| `tests/unit/presentation/scenes/BootScene.test.ts` | 参考テストファイル |

---

## 7. 依存タスク

- **TASK-0008**: Phaser基本設定とBootScene（完了済み）
- **TASK-0018**: 共通UIコンポーネント基盤（完了済み）

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|----------|---------|
| 2026-01-17 | 1.0.0 | 初版作成 |
