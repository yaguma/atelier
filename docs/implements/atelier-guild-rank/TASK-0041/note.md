# タスクノート: TASK-0041 ツールチップ表示システム

**作成日**: 2026-01-19
**タスクID**: TASK-0041
**タスク名**: ツールチップ表示システム
**要件名**: atelier-guild-rank
**フェーズ**: Phase 5 - UI強化・ポリッシュ

---

## 1. 技術スタック

### 使用技術・フレームワーク

| カテゴリ | 技術 | バージョン | 用途 |
|---------|------|-----------|------|
| **ゲームエンジン** | Phaser 3 | 3.87+ | ゲームエンジン本体 |
| **UI拡張** | phaser3-rex-plugins | 1.80.0+ | rexUIプラグイン（Label, Container等） |
| **言語** | TypeScript | 5.x | 型安全な開発 |
| **ビルドツール** | Vite | 5.x | 高速ビルド・開発サーバー |
| **パッケージ管理** | pnpm | 9.x | 依存関係管理 |
| **Linter/Formatter** | Biome | 2.x | コード品質管理 |
| **テストフレームワーク** | Vitest | 4.x | 単体テスト・統合テスト |
| **CSS** | Tailwind CSS | 4.x | スタイリング |

### アーキテクチャパターン

- **Clean Architecture (4層構造)**
  - `src/domain/` - ビジネスロジック・エンティティ（依存なし）
  - `src/application/` - ゲームフロー制御・状態管理・イベント調整
  - `src/infrastructure/` - データ永続化・外部連携
  - `src/presentation/` - Phaser Scenes・UI Components
  - `src/shared/` - 共通ユーティリティ・型定義

### Path Aliases

```typescript
{
  "@domain/*": ["src/domain/*"],
  "@application/*": ["src/application/*"],
  "@infrastructure/*": ["src/infrastructure/*"],
  "@presentation/*": ["src/presentation/*"],
  "@shared/*": ["src/shared/*"]
}
```

### 参照元

- atelier-guild-rank/package.json
- atelier-guild-rank/tsconfig.json
- CLAUDE.md

---

## 2. 開発ルール

### プロジェクト固有のルール

1. **応答は日本語で行う**
   - ずんだもん口調で応答（語尾は「なのだ」）
   - 自分のことは「ずんだもん」と呼ぶ

2. **音声通知機能**
   - 全てのタスク完了時にVOICEVOXのMCP音声通知を使用
   - 設定: speaker=3, speedScale=1.3
   - 英単語は適切にカタカナ変換
   - 1回の通知は100文字以内

3. **Clean Architectureの遵守**
   - Presentation層はDomain/Application層に依存可能
   - Domain層は他層に依存しない
   - 依存方向: Presentation → Application → Domain

4. **コーディング規約（Biome）**
   - インデント: 2スペース
   - クォート: シングルクォート
   - セミコロン: 必須
   - 末尾カンマ: 全て

5. **テスト要件**
   - グローバルカバレッジ: 80%以上
   - Domain層カバレッジ: 90%以上
   - テストファイル配置: `tests/unit/`, `tests/integration/`

### 参照元

- CLAUDE.md
- atelier-guild-rank/biome.json (推定)

---

## 3. 関連実装

### 既存の類似実装

#### 3.1 BaseComponent - UIコンポーネント基底クラス

**ファイル**: atelier-guild-rank/src/presentation/ui/components/BaseComponent.ts

```typescript
export abstract class BaseComponent {
  protected scene: Phaser.Scene;
  protected container: Phaser.GameObjects.Container;
  protected rexUI: any;

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

  getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }
}
```

**特徴**:
- Phaser.Scene、Container、rexUIへのアクセスを提供
- 座標管理、可視性管理を標準実装
- create()、destroy()は抽象メソッドとしてサブクラスで実装

#### 3.2 Button - ボタンコンポーネント

**ファイル**: atelier-guild-rank/src/presentation/ui/components/Button.ts

**特徴**:
- rexUI.add.labelを使用
- ホバーエフェクト（拡大・色変更）実装済み
- PRIMARY, SECONDARY, TEXT, ICONの4種類
- setEnabled()でボタンの有効/無効を制御

**参考コード（ホバーエフェクト）**:

```typescript
private onPointerOver(): void {
  if (!this._enabled) return;

  // 拡大アニメーション
  this.scene.tweens.add({
    targets: this.label,
    scaleX: 1.05,
    scaleY: 1.05,
    duration: 100,
    ease: 'Power2',
  });

  // 背景色変更
  this.setHighlight(true);
}

private onPointerOut(): void {
  this.scene.tweens.add({
    targets: this.label,
    scaleX: 1,
    scaleY: 1,
    duration: 100,
    ease: 'Power2',
  });

  this.setHighlight(false);
}
```

#### 3.3 Dialog - ダイアログコンポーネント

**ファイル**: atelier-guild-rank/src/presentation/ui/components/Dialog.ts

**特徴**:
- rexUI.add.dialogを使用
- オーバーレイ背景（半透明黒）を実装
- show()、hide()メソッドでアニメーション付き表示/非表示
- CONFIRM, INFO, CHOICEの3種類

**参考コード（アニメーション）**:

```typescript
public show(duration: number = 300): this {
  if (!this._visible) {
    this._visible = true;
    this.overlay.setVisible(true);
    this.dialog.setVisible(true);
    this.dialog.popUp(duration);
  }
  return this;
}

public hide(duration: number = 300): this {
  this._visible = false;
  this.dialog.scaleDownDestroy(duration);
  this.overlay.setVisible(false);
  this.dialog.setVisible(false);

  if (this.config.onClose) {
    this.scene.time.delayedCall(duration, () => {
      if (this.config.onClose) {
        this.config.onClose();
      }
    });
  }
  return this;
}
```

### 参照元

- atelier-guild-rank/src/presentation/ui/components/BaseComponent.ts
- atelier-guild-rank/src/presentation/ui/components/Button.ts
- atelier-guild-rank/src/presentation/ui/components/Dialog.ts

---

## 4. 設計文書

### 4.1 UI設計概要

**ファイル**: docs/design/atelier-guild-rank/ui-design/overview.md

#### ツールチップに関する記載（セクション7）

```typescript
// 🟡 ツールチップコンポーネント
interface TooltipProps {
  content: string | TooltipContent;
  position: TooltipPosition;
  delay: number;              // 表示までの遅延（ms）
  maxWidth: number;
}

interface TooltipContent {
  title?: string;
  description: string;
  stats?: Record<string, string | number>;
}

enum TooltipPosition {
  TOP = 'top',
  BOTTOM = 'bottom',
  LEFT = 'left',
  RIGHT = 'right',
  AUTO = 'auto',              // 画面端に応じて自動調整
}
```

**信頼性レベル**: 🟡 黄信号（要件定義書から妥当な推測）

#### UIレイヤー構成（depthの深度管理）

| レイヤー | 深度(depth) | 内容 |
|---------|------------|------|
| Background | 0 | 背景画像・パターン |
| Content | 100 | メインコンテンツ（カード、リスト等） |
| Sidebar | 150 | サイドバー（依頼一覧、インベントリ） |
| Header/Footer | 200 | ヘッダー・フッター固定UI |
| Overlay | 300 | オーバーレイ・ダイアログ背景 |
| Dialog | 400 | モーダルダイアログ |
| **Toast** | **500** | 通知メッセージ |

**ツールチップのdepth設定**: 500〜600を推奨（Toastより上、または同等）

### 4.2 共通コンポーネント設計書

**ファイル**: docs/design/atelier-guild-rank/ui-design/screens/common-components.md

#### ツールチップに関する記載（セクション7）

```typescript
// 🟡 ツールチップコンポーネント
interface TooltipProps {
  content: string | TooltipContent;
  position: TooltipPosition;
  delay: number;              // 表示までの遅延（ms）
  maxWidth: number;
}

interface TooltipContent {
  title?: string;
  description: string;
  stats?: Record<string, string | number>;
}

enum TooltipPosition {
  TOP = 'top',
  BOTTOM = 'bottom',
  LEFT = 'left',
  RIGHT = 'right',
  AUTO = 'auto',              // 画面端に応じて自動調整
}
```

#### カードツールチップの例

**ワイヤーフレーム**:

```
┌─────────────────────────┐
│ 森の恵み                │
│ [採取カード]            │
│─────────────────────────│
│ 森林エリアで素材を      │
│ 採取できる              │
│─────────────────────────│
│ コスト: 1 AP            │
│ 効果: 素材+1            │
│ レアリティ: コモン      │
└─────────────────────────┘
```

### 4.3 カラーパレット

**ファイル**: atelier-guild-rank/src/presentation/ui/theme.ts

```typescript
export const THEME = {
  colors: {
    primary: 0x8B4513,
    primaryHover: 0xA0522D,
    secondary: 0xDAA520,
    secondaryHover: 0xFFD700,
    background: 0xF5F5DC,
    text: 0x333333,
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#333333',
  },
};
```

### 4.4 テキストスタイル

```typescript
const TEXT_STYLES = {
  BODY_SMALL: {
    fontFamily: 'NotoSansJP-Regular',
    fontSize: '12px',
    color: '#9CA3AF',
  },
};
```

### 参照元

- docs/design/atelier-guild-rank/ui-design/overview.md
- docs/design/atelier-guild-rank/ui-design/screens/common-components.md
- atelier-guild-rank/src/presentation/ui/theme.ts

---

## 5. 注意事項

### 5.1 技術的制約

1. **rexUIプラグインの利用**
   - rexUIはPhaser 3のプラグインであり、型定義が複雑
   - `any`型を使用する場合は、コメントで理由を明記する

2. **depth管理**
   - ツールチップは最前面に表示する必要がある
   - depth: 500〜600を設定（Toast同等または上）

3. **座標の境界チェック**
   - 画面端からはみ出さないよう、表示位置を自動調整
   - `scene.cameras.main.width/height`で画面サイズを取得

4. **メモリリーク防止**
   - destroy()でイベントリスナーを全て削除
   - rexUIコンポーネントも適切に破棄

### 5.2 セキュリティ要件

- ツールチップ表示はクライアント側の表示処理のみ
- 特別なセキュリティ要件なし

### 5.3 パフォーマンス要件

1. **表示遅延**
   - デフォルト遅延: 500ms（ユーザビリティを考慮）
   - カスタマイズ可能にする

2. **シングルトンパターン**
   - TooltipManagerをシングルトンとして実装
   - 複数のツールチップを同時に表示しない

3. **オブジェクトプール（将来の拡張）**
   - 頻繁に生成・破棄が発生する場合、オブジェクトプールを検討

### 参照元

- docs/design/atelier-guild-rank/ui-design/screens/common-components.md（パフォーマンス最適化セクション）
- atelier-guild-rank/src/presentation/ui/components/BaseComponent.ts（メモリ管理パターン）

---

## 6. 実装のポイント

### 6.1 シングルトンパターン

```typescript
export class TooltipManager {
  private static instance: TooltipManager;

  static getInstance(): TooltipManager {
    if (!TooltipManager.instance) {
      TooltipManager.instance = new TooltipManager();
    }
    return TooltipManager.instance;
  }

  // コンストラクタはprivateにする
  private constructor() {}
}
```

### 6.2 表示位置の自動調整

```typescript
private updatePosition(x: number, y: number): void {
  if (!this.tooltip || !this.scene) return;

  const bounds = this.tooltip.getBounds();
  const camera = this.scene.cameras.main;

  // 右端からはみ出す場合は左に表示
  if (x + bounds.width > camera.width) {
    x = x - bounds.width - 10;
  }

  // 下端からはみ出す場合は上に表示
  if (y + bounds.height > camera.height) {
    y = y - bounds.height - 10;
  }

  // 上端・左端のチェック
  x = Math.max(10, x);
  y = Math.max(10, y);

  this.tooltip.setPosition(x, y);
}
```

### 6.3 表示遅延の実装

```typescript
show(config: TooltipConfig): void {
  if (this.showTimeout) {
    clearTimeout(this.showTimeout);
  }

  const delay = config.delay ?? 500;
  this.showTimeout = setTimeout(() => {
    this.displayTooltip(config);
  }, delay);
}

hide(): void {
  if (this.showTimeout) {
    clearTimeout(this.showTimeout);
    this.showTimeout = null;
  }
  this.tooltip?.setVisible(false);
}
```

---

## 7. テスト戦略

### 7.1 単体テスト

- TooltipManagerのシングルトン動作
- show()、hide()メソッドの動作
- 表示位置の自動調整ロジック
- 表示遅延のタイミング

### 7.2 統合テスト

- MainSceneでの実際の表示確認
- カードホバー時のツールチップ表示
- 画面端での位置調整

### テストファイル配置

- `tests/unit/presentation/ui/components/TooltipManager.spec.ts`

---

## 8. 参考リンク

- [Phaser 3 公式ドキュメント](https://photonstorm.github.io/phaser3-docs/)
- [rexUI公式ドキュメント](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/ui-overview/)
- [Clean Architecture参考資料](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|----------|---------|
| 2026-01-19 | 1.0.0 | 初版作成 |
