# TASK-0058 TitleSceneリファクタリング 要件定義書

## 1. 概要

### 1.1 タスク情報

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0058 |
| タスク名 | TitleSceneリファクタリング |
| 対象ファイル | `src/presentation/scenes/TitleScene.ts` (819行) |
| 目標行数 | 400行以下 |
| 推定工数 | 4時間 |
| フェーズ | Phase 7 - Presentation層リファクタリング |
| 依存タスク | TASK-0053 (共通UIユーティリティ), TASK-0054 (テーマ定数統一) |

### 1.2 目的

819行の巨大な`TitleScene.ts`を責務ごとにコンポーネント分割し、以下を達成する:
- コードの可読性・保守性の向上
- 共通ユーティリティ（TASK-0053, TASK-0054）の活用によるコード重複削減
- 単一責任の原則（SRP）に基づく明確な責務分離
- テスト容易性の向上

---

## 2. 現状分析

### 2.1 TitleScene.tsの現在の構造（819行）

```
TitleScene.ts (819行)
├── 定数定義（〜160行）
│   ├── LAYOUT（レイアウト座標）: 7行
│   ├── STYLES（フォントサイズ・色）: 20行
│   ├── SIZES（ボタン・ダイアログサイズ）: 26行
│   ├── DEPTH（Z-index）: 7行
│   ├── ANIMATION（アニメーション設定）: 13行
│   ├── DEFAULT_SCREEN（画面サイズ）: 4行
│   └── TEXT（テキスト定数）: 18行
│
├── 型定義（〜80行）
│   ├── ISaveDataRepository（インターフェース）: 25行
│   ├── SaveData（型）: 9行
│   └── DialogConfig（設定型）: 18行
│
└── TitleSceneクラス（〜580行）
    ├── プロパティ: 25行
    │   ├── rexUI: any
    │   ├── saveDataRepository: ISaveDataRepository | null
    │   ├── buttons: any[]
    │   ├── continueButton: any | null
    │   └── continueEnabled: boolean
    │
    ├── コンストラクタ: 4行
    │
    ├── ライフサイクルメソッド: 40行
    │   ├── create()
    │   └── shutdown()
    │
    ├── UI生成メソッド: 90行
    │   ├── createTitleLogo()
    │   ├── createSubtitle()
    │   ├── createVersionInfo()
    │   ├── createMenuButtons()
    │   └── createButton()
    │
    ├── イベントハンドラ: 35行
    │   ├── onNewGameClick()
    │   ├── onContinueClick()
    │   └── onSettingsClick()
    │
    ├── ダイアログ表示: 200行
    │   ├── showConfirmDialog()
    │   ├── showSettingsDialog()
    │   ├── showErrorDialog()
    │   ├── createDialogOverlay()
    │   └── createDialog()
    │
    ├── ユーティリティ: 20行
    │   └── checkSaveDataIntegrity()
    │
    └── アニメーション: 45行
        ├── fadeIn()
        └── fadeOutToScene()
```

### 2.2 識別された問題点

1. **巨大な単一ファイル**: 819行は保守性を損なう
2. **責務の混在**: UI生成、ダイアログ管理、アニメーション、セーブデータ管理が混在
3. **ローカル定数**: シーン固有の定数が多く再利用が困難
4. **テスト困難**: モノリシック構造でユニットテストが困難
5. **rexUIのany型**: 型安全性の欠如

---

## 3. 分割計画

### 3.1 コンポーネント構成

| コンポーネント | 責務 | 推定行数 | 優先度 |
|---------------|------|---------|--------|
| TitleScene.ts | シーン管理・コンポーネント統合・アニメーション | 200行 | 必須 |
| TitleLogo.ts | タイトルロゴ・サブタイトル・バージョン表示 | 80行 | 必須 |
| TitleMenu.ts | メニューボタン（新規/続き/設定） | 120行 | 必須 |
| TitleDialog.ts | 確認/設定/エラーダイアログ表示 | 180行 | 必須 |
| types.ts | 型定義・インターフェース・定数 | 100行 | 必須 |
| index.ts | バレルエクスポート | 10行 | 必須 |

### 3.2 ディレクトリ構造

```
src/presentation/
├── scenes/
│   └── TitleScene.ts                    # メインシーン（統合・管理）
└── ui/
    └── scenes/
        └── components/
            └── title/
                ├── index.ts             # バレルエクスポート
                ├── types.ts             # 型定義・インターフェース
                ├── TitleLogo.ts         # ロゴコンポーネント
                ├── TitleMenu.ts         # メニューコンポーネント
                └── TitleDialog.ts       # ダイアログコンポーネント

tests/unit/presentation/ui/scenes/components/title/
├── types.test.ts
├── TitleLogo.test.ts
├── TitleMenu.test.ts
├── TitleDialog.test.ts
└── TitleScene.integration.test.ts
```

---

## 4. コンポーネント詳細設計

### 4.1 types.ts

**責務**: 型定義・インターフェース・定数の一元管理

```typescript
// 既存定義を移動
export interface ISaveDataRepository {
  exists(): boolean;
  load(): Promise<SaveData | null>;
  save(data: SaveData): Promise<void>;
  delete(): Promise<void>;
}

export interface SaveData {
  playerName: string;
  rank: string;
  day: number;
}

// ダイアログコールバック型
export type DialogCallback = () => void;

// メニューコールバック型
export interface TitleMenuCallbacks {
  onNewGame: () => void;
  onContinue: () => void;
  onSettings: () => void;
}

// ダイアログ設定型
export interface DialogConfig {
  title: string;
  content: string;
  width: number;
  height: number;
  actions: DialogAction[];
  backgroundColor?: number;
}

export interface DialogAction {
  text: string;
  color: number;
  onClick: DialogCallback;
}

// タイトルシーンレイアウト定数
export const TITLE_LAYOUT = {
  TITLE_Y: 200,
  SUBTITLE_Y: 260,
  BUTTON_START_Y: 400,
  BUTTON_SPACING: 60,
  VERSION_OFFSET: 20,
} as const;

// タイトルシーンスタイル定数
export const TITLE_STYLES = {
  TITLE_FONT_SIZE: '48px',
  TITLE_COLOR: '#8B4513',
  SUBTITLE_FONT_SIZE: '24px',
  SUBTITLE_COLOR: '#666666',
  VERSION_FONT_SIZE: '14px',
  VERSION_COLOR: '#999999',
} as const;

// タイトルシーンサイズ定数
export const TITLE_SIZES = {
  BUTTON_WIDTH: 200,
  BUTTON_HEIGHT: 50,
  BUTTON_RADIUS: 8,
  DIALOG_BUTTON_WIDTH: 100,
  DIALOG_BUTTON_HEIGHT: 40,
  DIALOG_RADIUS: 12,
  CONFIRM_DIALOG_WIDTH: 400,
  CONFIRM_DIALOG_HEIGHT: 200,
  SETTINGS_DIALOG_WIDTH: 300,
  SETTINGS_DIALOG_HEIGHT: 150,
  ERROR_DIALOG_WIDTH: 400,
  ERROR_DIALOG_HEIGHT: 150,
} as const;

// テキスト定数
export const TITLE_TEXT = {
  TITLE: 'ATELIER GUILD',
  SUBTITLE: '錬金術師ギルド',
  VERSION: 'Version 1.0.0',
  NEW_GAME: '新規ゲーム',
  CONTINUE: 'コンティニュー',
  SETTINGS: '設定',
  CONFIRM_TITLE: '確認',
  CONFIRM_MESSAGE: 'セーブデータを削除して新規ゲームを開始しますか？',
  YES: 'はい',
  NO: 'いいえ',
  OK: 'OK',
  SETTINGS_TITLE: '設定',
  SETTINGS_STUB: '準備中です',
  ERROR_TITLE: 'エラー',
} as const;
```

### 4.2 TitleLogo.ts

**責務**: タイトルロゴ、サブタイトル、バージョン情報の表示

```typescript
import { BaseComponent } from '@presentation/ui/components/BaseComponent';
import { THEME } from '@presentation/ui/theme';
import { TITLE_LAYOUT, TITLE_STYLES, TITLE_TEXT } from './types';

export class TitleLogo extends BaseComponent {
  private titleText: Phaser.GameObjects.Text | null = null;
  private subtitleText: Phaser.GameObjects.Text | null = null;
  private versionText: Phaser.GameObjects.Text | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
  }

  create(): void {
    // タイトルロゴ
    this.titleText = this.scene.add.text(
      0,
      TITLE_LAYOUT.TITLE_Y,
      TITLE_TEXT.TITLE,
      { fontFamily: THEME.fonts.primary, fontSize: TITLE_STYLES.TITLE_FONT_SIZE, color: TITLE_STYLES.TITLE_COLOR }
    ).setOrigin(0.5);
    this.container.add(this.titleText);

    // サブタイトル
    this.subtitleText = this.scene.add.text(
      0,
      TITLE_LAYOUT.SUBTITLE_Y,
      TITLE_TEXT.SUBTITLE,
      { fontFamily: THEME.fonts.primary, fontSize: TITLE_STYLES.SUBTITLE_FONT_SIZE, color: TITLE_STYLES.SUBTITLE_COLOR }
    ).setOrigin(0.5);
    this.container.add(this.subtitleText);

    // バージョン情報（右下固定）
    this.createVersionInfo();
  }

  private createVersionInfo(): void {
    const cameraWidth = this.scene.cameras.main.width;
    const cameraHeight = this.scene.cameras.main.height;
    this.versionText = this.scene.add.text(
      cameraWidth - TITLE_LAYOUT.VERSION_OFFSET - this.container.x,
      cameraHeight - TITLE_LAYOUT.VERSION_OFFSET - this.container.y,
      TITLE_TEXT.VERSION,
      { fontFamily: THEME.fonts.primary, fontSize: TITLE_STYLES.VERSION_FONT_SIZE, color: TITLE_STYLES.VERSION_COLOR }
    ).setOrigin(1, 1);
    this.container.add(this.versionText);
  }

  destroy(): void {
    this.titleText?.destroy();
    this.subtitleText?.destroy();
    this.versionText?.destroy();
    this.container.destroy();
  }
}
```

### 4.3 TitleMenu.ts

**責務**: メニューボタンの表示と操作

```typescript
import { BaseComponent } from '@presentation/ui/components/BaseComponent';
import { THEME } from '@presentation/ui/theme';
import { AnimationPresets } from '@presentation/ui/utils/AnimationPresets';
import { applyHoverAnimation } from '@presentation/ui/utils/HoverAnimationMixin';
import { TITLE_LAYOUT, TITLE_SIZES, TITLE_TEXT, type TitleMenuCallbacks } from './types';

export class TitleMenu extends BaseComponent {
  private buttons: any[] = [];
  private continueButton: any | null = null;
  private callbacks: TitleMenuCallbacks;
  private continueEnabled: boolean;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    callbacks: TitleMenuCallbacks,
    continueEnabled: boolean = false
  ) {
    super(scene, x, y);
    this.callbacks = callbacks;
    this.continueEnabled = continueEnabled;
  }

  create(): void {
    this.createNewGameButton();
    this.createContinueButton();
    this.createSettingsButton();
  }

  setContinueEnabled(enabled: boolean): void {
    this.continueEnabled = enabled;
    if (this.continueButton) {
      this.continueButton.setAlpha(enabled ? 1 : AnimationPresets.timing.fast / 1000);
    }
  }

  private createNewGameButton(): void {
    // 新規ゲームボタン作成
  }

  private createContinueButton(): void {
    // コンティニューボタン作成（有効/無効制御付き）
  }

  private createSettingsButton(): void {
    // 設定ボタン作成
  }

  private createButton(
    x: number,
    y: number,
    text: string,
    backgroundColor: number,
    onClick: () => void
  ): any {
    // 共通ボタン作成ロジック
    // UIBackgroundBuilder、applyHoverAnimationを活用
  }

  destroy(): void {
    for (const button of this.buttons) {
      button?.destroy();
    }
    this.buttons = [];
    this.continueButton = null;
    this.container.destroy();
  }
}
```

### 4.4 TitleDialog.ts

**責務**: 各種ダイアログの表示と管理

```typescript
import { BaseComponent } from '@presentation/ui/components/BaseComponent';
import { Colors, THEME } from '@presentation/ui/theme';
import { AnimationPresets } from '@presentation/ui/utils/AnimationPresets';
import { TITLE_SIZES, TITLE_TEXT, type DialogConfig, type DialogCallback } from './types';

const DEPTH = {
  OVERLAY: 300,
  DIALOG: 400,
} as const;

export class TitleDialog extends BaseComponent {
  private overlay: Phaser.GameObjects.Rectangle | null = null;
  private dialog: any | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
  }

  create(): void {
    // 初期化のみ（ダイアログは表示時に作成）
  }

  showConfirmDialog(onConfirm: DialogCallback, onCancel: DialogCallback): void {
    const config: DialogConfig = {
      title: TITLE_TEXT.CONFIRM_TITLE,
      content: TITLE_TEXT.CONFIRM_MESSAGE,
      width: TITLE_SIZES.CONFIRM_DIALOG_WIDTH,
      height: TITLE_SIZES.CONFIRM_DIALOG_HEIGHT,
      actions: [
        { text: TITLE_TEXT.YES, color: THEME.colors.primary, onClick: () => this.closeAndExecute(onConfirm) },
        { text: TITLE_TEXT.NO, color: THEME.colors.secondary, onClick: () => this.closeAndExecute(onCancel) },
      ],
    };
    this.showDialog(config);
  }

  showSettingsDialog(onClose: DialogCallback): void {
    const config: DialogConfig = {
      title: TITLE_TEXT.SETTINGS_TITLE,
      content: TITLE_TEXT.SETTINGS_STUB,
      width: TITLE_SIZES.SETTINGS_DIALOG_WIDTH,
      height: TITLE_SIZES.SETTINGS_DIALOG_HEIGHT,
      actions: [
        { text: TITLE_TEXT.OK, color: THEME.colors.primary, onClick: () => this.closeAndExecute(onClose) },
      ],
    };
    this.showDialog(config);
  }

  showErrorDialog(message: string, onClose: DialogCallback): void {
    const config: DialogConfig = {
      title: TITLE_TEXT.ERROR_TITLE,
      content: message,
      width: TITLE_SIZES.ERROR_DIALOG_WIDTH,
      height: TITLE_SIZES.ERROR_DIALOG_HEIGHT,
      backgroundColor: THEME.colors.error,
      actions: [
        { text: TITLE_TEXT.OK, color: THEME.colors.primary, onClick: () => this.closeAndExecute(onClose) },
      ],
    };
    this.showDialog(config);
  }

  private showDialog(config: DialogConfig): void {
    this.createOverlay();
    this.createDialogContent(config);
  }

  private createOverlay(): void {
    // オーバーレイ作成
  }

  private createDialogContent(config: DialogConfig): void {
    // ダイアログ本体作成（rexUI使用）
  }

  private closeAndExecute(callback: DialogCallback): void {
    this.closeDialog();
    callback();
  }

  closeDialog(): void {
    this.overlay?.destroy();
    this.dialog?.destroy();
    this.overlay = null;
    this.dialog = null;
  }

  destroy(): void {
    this.closeDialog();
    this.container.destroy();
  }
}
```

### 4.5 TitleScene.ts（リファクタリング後）

**責務**: シーン管理、コンポーネント統合、アニメーション、セーブデータ管理

```typescript
import Phaser from 'phaser';
import { AnimationPresets } from '@presentation/ui/utils/AnimationPresets';
import { TitleLogo, TitleMenu, TitleDialog } from '@presentation/ui/scenes/components/title';
import type { ISaveDataRepository } from '@presentation/ui/scenes/components/title';

export class TitleScene extends Phaser.Scene {
  protected rexUI: any;
  protected saveDataRepository: ISaveDataRepository | null = null;

  private logoComponent: TitleLogo | null = null;
  private menuComponent: TitleMenu | null = null;
  private dialogComponent: TitleDialog | null = null;

  constructor() {
    super({ key: 'TitleScene' });
  }

  create(): void {
    const centerX = this.cameras.main.centerX;
    const hasSaveData = this.saveDataRepository?.exists() ?? false;

    // コンポーネント初期化
    this.initializeComponents(centerX, hasSaveData);

    // セーブデータ整合性チェック
    this.checkSaveDataIntegrity();

    // フェードイン
    this.fadeIn();
  }

  private initializeComponents(centerX: number, hasSaveData: boolean): void {
    // ロゴコンポーネント
    this.logoComponent = new TitleLogo(this, centerX, 0);
    this.logoComponent.create();

    // メニューコンポーネント
    this.menuComponent = new TitleMenu(
      this,
      centerX,
      0,
      {
        onNewGame: () => this.handleNewGame(),
        onContinue: () => this.handleContinue(),
        onSettings: () => this.handleSettings(),
      },
      hasSaveData
    );
    this.menuComponent.create();

    // ダイアログコンポーネント
    this.dialogComponent = new TitleDialog(this, centerX, this.cameras.main.centerY);
    this.dialogComponent.create();
  }

  // イベントハンドラ
  private handleNewGame(): void { /* ... */ }
  private async handleContinue(): Promise<void> { /* ... */ }
  private handleSettings(): void { /* ... */ }

  // アニメーション
  private fadeIn(): void { /* AnimationPresetsを使用 */ }
  private fadeOutToScene(targetScene: string, sceneData?: any): void { /* ... */ }

  // ユーティリティ
  private async checkSaveDataIntegrity(): Promise<void> { /* ... */ }

  shutdown(): void {
    this.logoComponent?.destroy();
    this.menuComponent?.destroy();
    this.dialogComponent?.destroy();
  }
}
```

---

## 5. 共通ユーティリティ活用計画

### 5.1 UIBackgroundBuilder（TASK-0053）

**使用箇所**:
- `TitleMenu.ts`: ボタン背景
- `TitleDialog.ts`: ダイアログ背景・ボタン背景

```typescript
// 使用例
import { UIBackgroundBuilder } from '@presentation/ui/utils/UIBackgroundBuilder';

const buttonBg = new UIBackgroundBuilder(this.scene)
  .setPosition(0, 0)
  .setSize(TITLE_SIZES.BUTTON_WIDTH, TITLE_SIZES.BUTTON_HEIGHT)
  .setFill(THEME.colors.primary, 1)
  .setRadius(TITLE_SIZES.BUTTON_RADIUS)
  .build();
```

### 5.2 AnimationPresets（TASK-0054）

**使用箇所**:
- `TitleScene.ts`: フェードイン/アウト
- `TitleDialog.ts`: ダイアログポップアップ
- `TitleMenu.ts`: ボタンホバー

```typescript
// 使用例
import { AnimationPresets } from '@presentation/ui/utils/AnimationPresets';

// フェードイン（500ms → AnimationPresets.fade.slow.duration）
this.cameras.main.fadeIn(AnimationPresets.fade.slow.duration, 0, 0, 0);

// ダイアログポップアップ
dialog.popUp(AnimationPresets.timing.normal);
```

### 5.3 HoverAnimationMixin（TASK-0053）

**使用箇所**:
- `TitleMenu.ts`: ボタンホバーエフェクト

```typescript
// 使用例
import { applyHoverAnimation } from '@presentation/ui/utils/HoverAnimationMixin';

applyHoverAnimation(button, this.scene, {
  scaleUp: AnimationPresets.button.hover.scale,
  duration: AnimationPresets.button.hover.duration,
});
```

### 5.4 Colors / THEME（TASK-0054）

**使用箇所**:
- 全コンポーネント: カラー定義の統一

```typescript
// 使用例
import { Colors, THEME } from '@presentation/ui/theme';

// ボタン色
backgroundColor: THEME.colors.primary,

// オーバーレイ色
overlayColor: Colors.background.overlay,
```

---

## 6. 受け入れ基準（Acceptance Criteria）

### 6.1 必須条件（MUST）

| ID | 条件 | 検証方法 |
|----|------|----------|
| AC-001 | TitleScene.tsが400行以下 | `wc -l TitleScene.ts` |
| AC-002 | 3つ以上のサブコンポーネントに分割 | ファイル数確認 |
| AC-003 | UIBackgroundBuilderを1箇所以上で使用 | コード検索 |
| AC-004 | AnimationPresetsを1箇所以上で使用 | コード検索 |
| AC-005 | Colors/THEMEを使用（ローカル色定義削除） | コード検索 |
| AC-006 | 既存テストが全て通過 | `pnpm test` |
| AC-007 | 新規コンポーネントのカバレッジ80%以上 | `pnpm test:coverage` |
| AC-008 | Biome lint/formatエラーなし | `pnpm lint` |

### 6.2 推奨条件（SHOULD）

| ID | 条件 | 検証方法 |
|----|------|----------|
| AC-009 | applyHoverAnimationを使用 | コード検索 |
| AC-010 | 各コンポーネントが単体でテスト可能 | テスト実行 |
| AC-011 | BaseComponentを継承 | コード検査 |
| AC-012 | 型定義でany型を最小化 | Biome警告確認 |

### 6.3 禁止条件（MUST NOT）

| ID | 条件 | 検証方法 |
|----|------|----------|
| AC-013 | 既存の機能を変更しない | E2Eテスト |
| AC-014 | 新たなバグを導入しない | 全テスト通過 |
| AC-015 | パフォーマンス劣化を起こさない | 手動確認 |

---

## 7. テスト要件

### 7.1 テストファイル構成

```
tests/unit/presentation/ui/scenes/components/title/
├── types.test.ts                     # 型定義・定数テスト
├── TitleLogo.test.ts                 # ロゴコンポーネントテスト
├── TitleMenu.test.ts                 # メニューコンポーネントテスト
├── TitleDialog.test.ts               # ダイアログコンポーネントテスト
└── TitleScene.integration.test.ts    # 統合テスト
```

### 7.2 テストケース概要

#### types.test.ts
- 定数が正しい値を持つこと
- 型定義がエクスポートされていること

#### TitleLogo.test.ts
- コンポーネントが正しく初期化されること
- タイトルテキストが表示されること
- サブタイトルテキストが表示されること
- バージョン情報が右下に表示されること
- destroyでリソースが解放されること

#### TitleMenu.test.ts
- コンポーネントが正しく初期化されること
- 新規ゲームボタンが表示されること
- コンティニューボタンが表示されること
- 設定ボタンが表示されること
- セーブデータなしでコンティニューボタンが無効化されること
- 各ボタンクリックでコールバックが呼ばれること
- destroyでリソースが解放されること

#### TitleDialog.test.ts
- コンポーネントが正しく初期化されること
- 確認ダイアログが表示されること
- 設定ダイアログが表示されること
- エラーダイアログが表示されること
- 「はい」クリックでonConfirmが呼ばれること
- 「いいえ」クリックでonCancelが呼ばれること
- ダイアログ閉じるでオーバーレイが消えること
- destroyでリソースが解放されること

#### TitleScene.integration.test.ts
- シーンが正しく初期化されること
- 全コンポーネントが作成されること
- 新規ゲームでMainSceneに遷移すること
- コンティニューでセーブデータ読み込み後MainSceneに遷移すること
- 設定で設定ダイアログが表示されること
- シャットダウンで全コンポーネントが破棄されること

### 7.3 カバレッジ目標

| 対象 | branches | functions | lines | statements |
|------|----------|-----------|-------|------------|
| types.ts | 100% | 100% | 100% | 100% |
| TitleLogo.ts | 80%+ | 80%+ | 80%+ | 80%+ |
| TitleMenu.ts | 80%+ | 80%+ | 80%+ | 80%+ |
| TitleDialog.ts | 80%+ | 80%+ | 80%+ | 80%+ |
| TitleScene.ts | 80%+ | 80%+ | 80%+ | 80%+ |

---

## 8. 実装順序

### Phase 1: 型定義・定数の分離（30分）
1. `types.ts` を作成
2. 定数・型定義を移動
3. `types.test.ts` を作成・実行

### Phase 2: TitleLogoコンポーネント（45分）
1. `TitleLogo.ts` を作成
2. `TitleLogo.test.ts` を作成・実行
3. TitleSceneから該当コードを削除

### Phase 3: TitleMenuコンポーネント（60分）
1. `TitleMenu.ts` を作成
2. 共通ユーティリティ（UIBackgroundBuilder, applyHoverAnimation）を活用
3. `TitleMenu.test.ts` を作成・実行
4. TitleSceneから該当コードを削除

### Phase 4: TitleDialogコンポーネント（60分）
1. `TitleDialog.ts` を作成
2. AnimationPresetsを活用
3. `TitleDialog.test.ts` を作成・実行
4. TitleSceneから該当コードを削除

### Phase 5: TitleScene統合・最終調整（45分）
1. TitleSceneをリファクタリング
2. コンポーネント統合
3. `TitleScene.integration.test.ts` を作成・実行
4. 全テスト実行・カバレッジ確認
5. lint/format確認

---

## 9. リスクと対策

| リスク | 影響 | 対策 |
|--------|------|------|
| rexUIのモック困難 | テスト遅延 | 既存のShopSceneテストパターンを参考 |
| 既存機能の破壊 | 本番影響 | 統合テストで網羅的に確認 |
| 型定義の不整合 | ビルドエラー | 段階的な移行とtsチェック |
| パフォーマンス劣化 | UX低下 | コンポーネント初期化を最適化 |

---

## 10. 完了条件チェックリスト

- [ ] TitleScene.tsが400行以下になっている
- [ ] 3つ以上のサブコンポーネントに分割されている
  - [ ] TitleLogo.ts
  - [ ] TitleMenu.ts
  - [ ] TitleDialog.ts
  - [ ] types.ts
  - [ ] index.ts
- [ ] 共通ユーティリティ（TASK-0053, 0054）を使用している
  - [ ] UIBackgroundBuilder
  - [ ] AnimationPresets
  - [ ] Colors / THEME
  - [ ] applyHoverAnimation（推奨）
- [ ] 既存テストが全て通過する
- [ ] 新規コンポーネントのテストカバレッジが80%以上
- [ ] Biome lint/formatエラーなし
- [ ] E2E動作確認完了

---

*作成日時: 2026-01-24*
*タスクID: TASK-0058*
*フェーズ: TDD要件定義*
