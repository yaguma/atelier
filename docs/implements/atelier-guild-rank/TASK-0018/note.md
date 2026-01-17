# TASK-0018: 共通UIコンポーネント基盤 - 開発ノート

**作成日**: 2026-01-17
**タスクID**: TASK-0018
**要件名**: atelier-guild-rank
**機能名**: 共通UIコンポーネント基盤

---

## 1. 技術スタック

### 1.1 使用技術・フレームワーク

| 技術 | バージョン | 用途 |
|------|----------|------|
| **Phaser 3** | 最新版 | ゲームエンジン |
| **rexUI Plugin** | 最新版 | UIコンポーネントライブラリ |
| **TypeScript** | 最新版 | 型安全な開発 |
| **Vite** | 最新版 | ビルドツール |

**参照元**:
- docs/tasks/atelier-guild-rank/phase-1/TASK-0008.md
- docs/design/atelier-guild-rank/architecture-phaser.md

### 1.2 アーキテクチャパターン

- **Clean Architecture**: レイヤー分離（Presentation / Application / Domain / Infrastructure）
- **Event-Driven Architecture**: EventBusを用いたコンポーネント間通信
- **Phaser Scene管理**: シーンベースの画面遷移

**参照元**:
- docs/design/atelier-guild-rank/architecture-overview.md
- docs/design/atelier-guild-rank/architecture-components.md

### 1.3 Phaser設定

```typescript
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'game-container',
  backgroundColor: '#F5F5DC', // Beige
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  plugins: {
    scene: [
      {
        key: 'rexUI',
        plugin: RexUIPlugin,
        mapping: 'rexUI',
      },
    ],
  },
};
```

**参照元**: docs/tasks/atelier-guild-rank/phase-1/TASK-0008.md

---

## 2. 開発ルール

### 2.1 コーディング規約

#### ファイル構成

```
src/
├── presentation/
│   └── ui/
│       ├── theme.ts              # テーマ定義
│       └── components/
│           ├── BaseComponent.ts  # 基底クラス
│           ├── Button.ts         # ボタンコンポーネント
│           └── Dialog.ts         # ダイアログコンポーネント
```

**参照元**:
- docs/tasks/atelier-guild-rank/phase-3/TASK-0018.md
- docs/design/atelier-guild-rank/architecture-components.md

#### 命名規則

| 対象 | 規則 | 例 |
|------|------|-----|
| **クラス** | PascalCase | `BaseComponent`, `Button` |
| **定数** | UPPER_SNAKE_CASE | `THEME`, `COLOR_PALETTE` |
| **変数** | camelCase | `rexUI`, `container` |
| **プライベートフィールド** | `protected` キーワード | `protected scene` |

**参照元**: 一般的なTypeScriptコーディング規約

### 2.2 プロジェクト固有のルール

#### rexUIコンポーネント使用ルール

- rexUIは `this.rexUI` 経由でアクセス
- すべてのrexUIコンポーネントは `.layout()` を呼び出す
- コンテナは `depth` を設定してレイヤー管理

**参照元**:
- docs/design/atelier-guild-rank/ui-design/overview.md
- docs/design/atelier-guild-rank/architecture-phaser.md

#### UIレイヤー構成

| レイヤー | depth | 内容 |
|---------|------|------|
| Background | 0 | 背景画像・パターン |
| Content | 100 | メインコンテンツ |
| Sidebar | 150 | サイドバー |
| Header/Footer | 200 | ヘッダー・フッター |
| Overlay | 300 | オーバーレイ・ダイアログ背景 |
| Dialog | 400 | モーダルダイアログ |
| Toast | 500 | 通知メッセージ |

**参照元**: docs/design/atelier-guild-rank/ui-design/overview.md

---

## 3. 関連実装

### 3.1 依存タスク

#### TASK-0008: Phaser基本設定とBootScene

- **状態**: 完了（TDD開発完了 - 14テストケース全通過）
- **内容**: Phaserの基本設定、rexUIプラグイン導入、BootScene実装
- **成果物**:
  - src/main.ts - エントリーポイント
  - src/presentation/scenes/BootScene.ts - ブートシーン
  - src/presentation/scenes/BaseScene.ts - シーン基底クラス
  - src/infrastructure/di/container.ts - DIコンテナ

**参照元**: docs/tasks/atelier-guild-rank/phase-1/TASK-0008.md

### 3.2 類似機能の実装例

現時点では実装前のため、類似実装は存在しない。

**参照元**: プロジェクトルートの調査結果

### 3.3 参考パターン

#### 基底コンポーネントパターン

```typescript
abstract class BaseComponent {
  protected scene: Phaser.Scene;
  protected container: Phaser.GameObjects.Container;
  protected rexUI: RexUIPlugin;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.rexUI = scene.rexUI;
    this.container = scene.add.container(x, y);
  }

  abstract create(): void;
  abstract destroy(): void;

  setVisible(visible: boolean): this {
    this.container.setVisible(visible);
    return this;
  }

  setPosition(x: number, y: number): this {
    this.container.setPosition(x, y);
    return this;
  }
}
```

**参照元**: docs/tasks/atelier-guild-rank/phase-3/TASK-0018.md

---

## 4. 設計文書

### 4.1 UIテーマ定義

#### カラーパレット

```typescript
export const THEME = {
  colors: {
    primary: 0x8B4513,      // SaddleBrown
    secondary: 0xD2691E,    // Chocolate
    background: 0xF5F5DC,   // Beige
    text: 0x333333,
    textLight: 0x666666,
    success: 0x228B22,      // ForestGreen
    warning: 0xDAA520,      // Goldenrod
    error: 0x8B0000,        // DarkRed
    disabled: 0xCCCCCC,
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

**参照元**: docs/tasks/atelier-guild-rank/phase-3/TASK-0018.md

#### フォント設定

| 用途 | フォントファミリー | サイズ | スタイル |
|------|------------------|--------|---------|
| 見出し（大） | NotoSansJP | 24px | Bold |
| 見出し（中） | NotoSansJP | 20px | Bold |
| 見出し（小） | NotoSansJP | 16px | Bold |
| 本文 | NotoSansJP | 14px | Regular |
| キャプション | NotoSansJP | 12px | Regular |
| 数値 | RobotoMono | 16px | Bold |

**参照元**: docs/design/atelier-guild-rank/ui-design/overview.md

### 4.2 コンポーネント設計

#### ボタンコンポーネント

**種類**:
- プライマリボタン: 確定アクション用
- セカンダリボタン: キャンセル・戻る用
- テキストボタン: 軽微なアクション用
- アイコンボタン: アイコンのみ

**rexUI実装**:
```typescript
const button = scene.rexUI.add.label({
  background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 8, 0x8B4513),
  text: scene.add.text(0, 0, 'ボタン', { fontSize: '16px', color: '#ffffff' }),
  space: { left: 16, right: 16, top: 8, bottom: 8 }
});
```

**参照元**:
- docs/tasks/atelier-guild-rank/phase-3/TASK-0018.md
- docs/design/atelier-guild-rank/ui-design/overview.md

#### ダイアログコンポーネント

**種類**:
- 確認ダイアログ: ユーザーの意思確認
- 情報ダイアログ: 情報提示
- 選択ダイアログ: 複数選択肢から選択

**rexUI実装**:
```typescript
const dialog = scene.rexUI.add.dialog({
  x: 640, y: 360,
  background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 12, 0xF5F5DC),
  title: createLabel(scene, 'タイトル'),
  content: createLabel(scene, 'メッセージ内容'),
  actions: [
    createButton(scene, 'はい'),
    createButton(scene, 'いいえ')
  ],
  space: { title: 24, content: 24, action: 16 }
})
.layout()
.popUp(300);
```

**参照元**:
- docs/tasks/atelier-guild-rank/phase-3/TASK-0018.md
- docs/design/atelier-guild-rank/ui-design/overview.md

### 4.3 共通UIコンポーネント一覧

| コンポーネント | rexUI | 責務 |
|--------------|-------|------|
| **HeaderUI** | Sizer | ランク、昇格ゲージ、日数、金、AP表示 |
| **SidebarUI** | ScrollablePanel + Accordion | 依頼・素材・完成品リスト |
| **FooterUI** | Sizer | フェーズインジケーター、手札、ボタン |
| **CardView** | Container | カード表示 |
| **InventoryPanel** | ScrollablePanel | インベントリ表示 |
| **QuestPanel** | ScrollablePanel | 依頼表示 |
| **RankProgressBar** | ProgressBar | ランク進捗バー |
| **PhaseIndicator** | Container | 現在フェーズ表示 |
| **ActionPointView** | Label | 行動ポイント表示 |
| **GoldView** | Label | 所持金表示 |
| **DayCounter** | Label | 残り日数表示 |
| **DialogManager** | Dialog | モーダルダイアログ管理 |
| **ButtonFactory** | Buttons | ボタン生成 |
| **ToastManager** | Toast | 通知メッセージ |

**参照元**:
- docs/design/atelier-guild-rank/ui-design/overview.md
- docs/design/atelier-guild-rank/ui-design/screens/common-components.md

---

## 5. 注意事項

### 5.1 技術的制約

#### Phaserの制約

- DOM要素は使用しない（`dom.createContainer: false`）
- すべてUIはCanvas/WebGLで描画
- rexUIプラグインに依存

**参照元**: docs/design/atelier-guild-rank/architecture-phaser.md

#### rexUIの制約

- レイアウト後に `.layout()` を必ず呼ぶ
- コンテナのサイズは子要素から自動計算される
- スクロール可能パネルは固定サイズが必要

**参照元**: rexUI公式ドキュメント（推測）

### 5.2 セキュリティ要件

特になし（オフラインゲームのため）

**参照元**: プロジェクト要件

### 5.3 パフォーマンス要件

#### レンダリング最適化

- 更新頻度の設定: 値変更時のみ更新
- オブジェクトプール: カード・ツールチップの再利用
- 遅延読み込み: 画面外アイテムの遅延読み込み

**参照元**: docs/design/atelier-guild-rank/ui-design/screens/common-components.md

#### メモリ管理

```typescript
const POOL_CONFIG = {
  CARD_POOL: {
    initialSize: 10,
    maxSize: 20,
    expandBy: 5,
  },
  TOOLTIP_POOL: {
    initialSize: 3,
    maxSize: 5,
    expandBy: 1,
  },
};
```

**参照元**: docs/design/atelier-guild-rank/ui-design/screens/common-components.md

### 5.4 アクセシビリティ

#### キーボード操作

| キー | 機能 |
|-----|------|
| Enter/Space | 選択・決定 |
| Escape | キャンセル・閉じる |
| Tab | フォーカス移動 |
| Arrow Keys | リスト内移動 |
| 1-9 | ショートカット選択 |

**参照元**: docs/design/atelier-guild-rank/ui-design/overview.md

---

## 6. テスト戦略

### 6.1 テストケース

| テストID | テスト内容 | 期待結果 |
|---------|----------|----------|
| T-0018-01 | ボタン表示 | 正しいスタイルで表示 |
| T-0018-02 | ボタンクリック | コールバック実行 |
| T-0018-03 | ダイアログ表示 | モーダル表示 |
| T-0018-04 | ダイアログ閉じる | 非表示になる |

**参照元**: docs/tasks/atelier-guild-rank/phase-3/TASK-0018.md

### 6.2 統合テスト

- Phaserシーン内でのコンポーネント動作確認
- rexUIプラグインとの連携確認
- イベントバスとの連携確認

**参照元**: docs/design/atelier-guild-rank/architecture-phaser.md

---

## 7. 実装優先度

### 7.1 Phase 1: 必須コンポーネント

1. **テーマ定義** (`theme.ts`) - 最優先
2. **基底コンポーネント** (`BaseComponent.ts`)
3. **ボタンコンポーネント** (`Button.ts`)
4. **ダイアログコンポーネント** (`Dialog.ts`)

### 7.2 Phase 2: 共通UIコンポーネント（次回タスク）

- HeaderUI
- SidebarUI
- FooterUI
- その他各種コンポーネント

**参照元**: docs/tasks/atelier-guild-rank/phase-3/TASK-0018.md

---

## 8. 参考リンク

### 8.1 設計文書

- docs/spec/atelier-guild-rank-requirements.md - 要件定義書
- docs/design/atelier-guild-rank/architecture-overview.md - アーキテクチャ概要
- docs/design/atelier-guild-rank/architecture-phaser.md - Phaser実装設計
- docs/design/atelier-guild-rank/architecture-components.md - コンポーネント設計
- docs/design/atelier-guild-rank/ui-design/overview.md - UI設計概要
- docs/design/atelier-guild-rank/ui-design/screens/common-components.md - 共通コンポーネント設計

### 8.2 タスク文書

- docs/tasks/atelier-guild-rank/phase-1/TASK-0008.md - 依存タスク
- docs/tasks/atelier-guild-rank/phase-3/TASK-0018.md - 本タスク

---

## 9. 開発メモ

### 9.1 実装時の注意点

1. **rexUIの初期化**: シーンの `create()` で `this.rexUI` が利用可能になる
2. **コンテナの深度管理**: UIレイヤー構成に従って適切な `depth` を設定
3. **イベント購読**: `destroy()` 時に必ずイベント購読を解除
4. **相対パス**: すべてのファイルパスはプロジェクトルートからの相対パスで記載

### 9.2 よくある問題と解決策

| 問題 | 原因 | 解決策 |
|------|------|--------|
| rexUIが undefined | プラグイン設定ミス | main.ts でプラグイン設定を確認 |
| レイアウトが崩れる | `.layout()` 忘れ | rexUIコンポーネント生成後に必ず `.layout()` を呼ぶ |
| 深度が正しくない | depth 設定忘れ | UIレイヤー構成に従って depth を設定 |

---

**最終更新**: 2026-01-17
**作成者**: Claude (Zundamon)
