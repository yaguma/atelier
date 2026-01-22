# TASK-0047 タスクノート: 共通UIコンポーネント視覚実装

## 基本情報

| 項目 | 値 |
|------|-----|
| **タスクID** | TASK-0047 |
| **タスク名** | 共通UIコンポーネント視覚実装 |
| **見積時間** | 4時間 |
| **依存タスク** | TASK-0018, TASK-0046 |
| **開発タイプ** | TDD |
| **作成日** | 2026-01-22 |

---

## 1. 技術スタック

### 1.1 コア技術

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **Phaser** | ^3.87.0 | ゲームエンジン・描画 |
| **phaser3-rex-plugins** | ^1.80.0 | rexUI拡張コンポーネント |
| **TypeScript** | ^5.7.0 | 型安全な開発 |
| **Vite** | ^5.4.0 | ビルドツール |

### 1.2 テスト関連

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **Vitest** | ^4.0.17 | ユニット/統合テスト |
| **jsdom** | ^27.4.0 | テスト環境のDOM |
| **Playwright** | ^1.57.0 | E2Eテスト |

### 1.3 リンター/フォーマッター

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **Biome** | ^2.0.0 | リント・フォーマット |

---

## 2. 開発ルール

### 2.1 TypeScript設定

```typescript
// tsconfig.json より
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noImplicitOverride": true
  }
}
```

**パスエイリアス:**
- `@domain/*` → `src/domain/*`
- `@application/*` → `src/application/*`
- `@infrastructure/*` → `src/infrastructure/*`
- `@presentation/*` → `src/presentation/*`
- `@shared/*` → `src/shared/*`

### 2.2 Biome設定

```json
{
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

### 2.3 テストカバレッジ要件

```typescript
// vitest.config.ts より
thresholds: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
}
```

### 2.4 コメント規約

- JSDocスタイルのコメント必須
- `@description`, `@param`, `@returns`, `@throws` を適切に使用
- 信頼性レベルをマーク（🔵 要件定義書に基づく / 🟡 妥当な推測）

---

## 3. 関連実装

### 3.1 既存コンポーネント構造

#### components ディレクトリ（ロジック層）
- **HeaderUI.ts** (`src/presentation/ui/components/`)
  - ロジック・状態管理実装済み
  - `create()` メソッドは空実装（コンテナ作成のみ）
  - `update()` でランク・ゲージ・日数・所持金・APの内部状態を更新

- **SidebarUI.ts** (`src/presentation/ui/components/`)
  - ロジック・状態管理実装済み
  - `create()` メソッドは空実装
  - セクション折りたたみ状態管理実装済み

- **FooterUI.ts** (`src/presentation/ui/components/`)
  - ロジック・状態管理実装済み
  - `create()` でフェーズインジケーター配列を生成（ダミー）
  - フェーズ状態管理実装済み

#### main ディレクトリ（視覚層・既存実装あり）
- **HeaderUI.ts** (`src/presentation/ui/main/`)
  - GameObjectフィールド定義済み（`background`, `rankText`, `gaugeFill`など）
  - `create()` は `container.add([])` のみ
  - `destroyGameObjects()` メソッド実装済み

- **SidebarUI.ts** (`src/presentation/ui/main/`)
  - セクション構造定義済み（`SidebarSection` interface）
  - アニメーション設定定義済み
  - `createSection()` でテキスト生成実装済み（部分的）
  - 折りたたみアニメーション実装済み

- **FooterUI.ts** (`src/presentation/ui/main/`)
  - GameObjectフィールド定義済み
  - `create()` は `container.add([])` のみ

### 3.2 BaseComponent

**ファイル:** `src/presentation/ui/components/BaseComponent.ts`

```typescript
export abstract class BaseComponent {
  protected scene: Phaser.Scene;
  protected container: Phaser.GameObjects.Container;
  protected rexUI: any;

  constructor(scene: Phaser.Scene, x: number, y: number);
  abstract create(): void;
  abstract destroy(): void;
  setVisible(visible: boolean): this;
  setPosition(x: number, y: number): this;
  getContainer(): Phaser.GameObjects.Container;
}
```

### 3.3 テーマ定義

**ファイル:** `src/presentation/ui/theme.ts`

```typescript
export const THEME = {
  colors: {
    primary: 0x8b4513,      // SaddleBrown
    secondary: 0xd2691e,    // Chocolate
    background: 0xf5f5dc,   // Beige
    text: 0x333333,
    textLight: 0x666666,
    success: 0x228b22,      // ForestGreen
    warning: 0xdaa520,      // Goldenrod
    error: 0x8b0000,        // DarkRed
    disabled: 0xcccccc,
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

## 4. 設計文書（common-components.md）

### 4.1 カラー定数（タスク文書より）

```typescript
const COLORS = {
  // ステータス色
  RED: 0xFF6B6B,       // 昇格ゲージ0-29%、残り日数4-5日
  YELLOW: 0xFFD93D,    // 昇格ゲージ30-59%、残り日数6-10日
  GREEN: 0x6BCB77,     // 昇格ゲージ60-99%
  CYAN: 0x4ECDC4,      // 昇格ゲージ100%
  WHITE: 0xFFFFFF,     // 残り日数11日以上
  BRIGHT_RED: 0xFF0000, // 残り日数1-3日（点滅用）

  // フェーズインジケーター
  PHASE_PENDING: 0x6B7280,   // 未到達（グレー）
  PHASE_CURRENT: 0x6366F1,   // 現在（プライマリ）
  PHASE_COMPLETED: 0x10B981, // 完了（緑）
};
```

### 4.2 レイアウト定数

```typescript
const LAYOUT = {
  SIDEBAR_WIDTH: 200,
  HEADER_HEIGHT: 60,
  FOOTER_HEIGHT: 120,
};
```

### 4.3 コンポーネント要件

#### HeaderUI
1. ランク表示テキスト
2. 昇格ゲージ（プログレスバー: 背景 + フィル）
3. 残り日数テキスト（色変化・点滅対応）
4. 所持金テキスト
5. 行動ポイントテキスト（「現在/最大 AP」形式）

#### SidebarUI
1. 「受注依頼」セクションヘッダー
2. 「素材」セクションヘッダー
3. 「完成品」セクションヘッダー
4. 折りたたみアイコン（▼/▶）
5. 保管容量テキスト（「保管: X/Y」形式）
6. ショップボタン

#### FooterUI
1. フェーズインジケーター（4つのドット + 接続ライン）
2. 手札表示エリア（5つのプレースホルダー）
3. 「次へ」ボタン（ラベル動的変更対応）

---

## 5. 注意事項

### 5.1 Phaser固有の制約

1. **GameObjectの生成タイミング**
   - `create()` メソッド内でのみGameObject生成を行う
   - コンストラクタでは座標・参照の保持のみ

2. **リソース解放**
   - `destroy()` で明示的にGameObjectを破棄
   - nullチェック後に `destroy()` を呼び出し、参照をnullにリセット

3. **テキストスタイル**
   - `Phaser.Types.GameObjects.Text.TextStyle` を使用
   - 色は `#XXXXXX` 形式の文字列または `0xXXXXXX` 数値

4. **Graphics描画**
   - `fillStyle()` → `fillRect()` の順序
   - `clear()` で既存描画をクリア後に再描画

### 5.2 2つのUIファイル構造

現在、HeaderUI/SidebarUI/FooterUIは2つの場所に存在する:

1. **`src/presentation/ui/components/`** - TASK-0046で作成されたロジック層
2. **`src/presentation/ui/main/`** - MainScene用の視覚実装（部分的に実装済み）

**方針:** `main/` ディレクトリ内のファイルを拡張して視覚実装を追加する。

### 5.3 テストモックの注意点

```typescript
// tests/setup.ts でPhaserがモックされている
const mockText = {
  setText: vi.fn().mockReturnThis(),
  setStyle: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
};

const mockGraphics = {
  fillStyle: vi.fn().mockReturnThis(),
  fillRect: vi.fn().mockReturnThis(),
  clear: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
};

const mockContainer = {
  add: vi.fn().mockReturnThis(),
  setDepth: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
};
```

### 5.4 既存テストとの互換性

- 既存テスト（`*UI.spec.ts`）が引き続きパスすることを確認
- 新規テストは視覚要素の生成を検証

---

## 6. 実装計画

### 6.1 ステップ1: HeaderUI視覚実装（1.5時間）

1. **背景描画**
   ```typescript
   this.background = this.scene.add.graphics();
   this.background.fillStyle(THEME.colors.background, 1);
   this.background.fillRect(0, 0, screenWidth, HEADER_HEIGHT);
   ```

2. **ランクテキスト生成**
   ```typescript
   this.rankText = this.scene.add.text(x, y, 'ランク: G', textStyle);
   ```

3. **昇格ゲージ（背景 + フィル）**
   ```typescript
   this.gaugeBackground = this.scene.add.graphics();
   this.gaugeBackground.fillStyle(0x374151, 1);
   this.gaugeBackground.fillRect(x, y, gaugeWidth, gaugeHeight);

   this.gaugeFill = this.scene.add.graphics();
   this.gaugeFill.fillStyle(gaugeColor, 1);
   this.gaugeFill.fillRect(x, y, fillWidth, gaugeHeight);
   ```

4. **update()での視覚更新**
   - ランクテキスト更新
   - ゲージ幅・色更新
   - 日数テキスト・色更新
   - 所持金・APテキスト更新

### 6.2 ステップ2: SidebarUI視覚実装（1時間）

**既存実装を活用:**
- `createSection()` メソッドは既に基本的なテキスト生成を実装
- 保管容量テキストとショップボタンの追加が必要

1. **保管容量テキスト**
   ```typescript
   this.storageText = this.scene.add.text(x, y, '保管: 0/20', textStyle);
   ```

2. **ショップボタン**
   ```typescript
   const buttonBg = this.scene.add.rectangle(x, y, width, height, color);
   const buttonText = this.scene.add.text(x, y, 'ショップ', textStyle);
   this.shopButton = this.scene.add.container(x, y, [buttonBg, buttonText]);
   this.shopButton.setInteractive();
   ```

### 6.3 ステップ3: FooterUI視覚実装（1.5時間）

1. **フェーズインジケーター**
   ```typescript
   // 4つのドット（Circle）
   for (const phase of phases) {
     const dot = this.scene.add.circle(x, y, radius, color);
     this.phaseIndicators.push(dot);
   }
   // 接続ライン
   this.phaseLine = this.scene.add.graphics();
   this.phaseLine.lineStyle(2, lineColor);
   this.phaseLine.lineBetween(x1, y1, x2, y2);
   ```

2. **手札表示エリア（5つのプレースホルダー）**
   ```typescript
   for (let i = 0; i < 5; i++) {
     const placeholder = this.scene.add.rectangle(x + i * spacing, y, cardWidth, cardHeight, color);
     this.handPlaceholders.push(placeholder);
   }
   ```

3. **次へボタン**
   ```typescript
   const nextBg = this.scene.add.rectangle(x, y, width, height, color);
   const nextText = this.scene.add.text(x, y, '次へ', textStyle);
   this.nextButton = this.scene.add.container(x, y, [nextBg, nextText]);
   this.nextButton.setInteractive();
   ```

---

## 7. テストケース一覧

### 7.1 HeaderUI視覚テスト

```typescript
describe('HeaderUI 視覚実装', () => {
  describe('create()', () => {
    it('ランク表示テキストが生成されること');
    it('昇格ゲージの背景バーが生成されること');
    it('昇格ゲージのフィルバーが生成されること');
    it('残り日数テキストが生成されること');
    it('所持金テキストが生成されること');
    it('行動ポイントテキストが生成されること');
  });

  describe('update() 視覚更新', () => {
    it('ランク更新時にテキストが変更されること');
    it('昇格ゲージ更新時にバー幅が変更されること');
    it('昇格ゲージ30%未満で赤色になること');
    it('昇格ゲージ30-59%で黄色になること');
    it('昇格ゲージ60-99%で緑色になること');
    it('昇格ゲージ100%で水色になること');
    it('残り日数3日以下で点滅フラグがtrueになること');
  });
});
```

### 7.2 SidebarUI視覚テスト

```typescript
describe('SidebarUI 視覚実装', () => {
  describe('create()', () => {
    it('受注依頼セクションヘッダーが生成されること');
    it('素材セクションヘッダーが生成されること');
    it('完成品セクションヘッダーが生成されること');
    it('保管容量テキストが生成されること');
    it('ショップボタンが生成されること');
  });

  describe('update() 視覚更新', () => {
    it('保管容量更新時にテキストが変更されること');
  });

  describe('toggleSection() 視覚更新', () => {
    it('セクション折りたたみ時にアイコンが変化すること');
  });
});
```

### 7.3 FooterUI視覚テスト

```typescript
describe('FooterUI 視覚実装', () => {
  describe('create()', () => {
    it('フェーズインジケーターが4つ生成されること');
    it('手札表示エリアのプレースホルダーが5つ生成されること');
    it('次へボタンが生成されること');
  });

  describe('updatePhaseIndicator() 視覚更新', () => {
    it('現在フェーズのインジケーターがハイライトされること');
    it('完了フェーズのインジケーターが完了スタイルになること');
    it('未到達フェーズのインジケーターがグレーアウトされること');
  });

  describe('updateNextButton() 視覚更新', () => {
    it('ボタンラベルが更新されること');
    it('無効時にボタンがグレーアウトされること');
  });
});
```

---

## 8. 関連ファイル一覧

### 8.1 実装対象ファイル

| ファイルパス | 変更種別 |
|-------------|---------|
| `src/presentation/ui/main/HeaderUI.ts` | 修正 |
| `src/presentation/ui/main/SidebarUI.ts` | 修正 |
| `src/presentation/ui/main/FooterUI.ts` | 修正 |

### 8.2 テストファイル

| ファイルパス | 変更種別 |
|-------------|---------|
| `src/presentation/ui/main/HeaderUI.spec.ts` | 追加テスト |
| `src/presentation/ui/main/SidebarUI.spec.ts` | 追加テスト |
| `src/presentation/ui/main/FooterUI.spec.ts` | 追加テスト |

### 8.3 参照ファイル

| ファイルパス | 用途 |
|-------------|------|
| `src/presentation/ui/components/BaseComponent.ts` | 基底クラス |
| `src/presentation/ui/theme.ts` | テーマ定義 |
| `tests/setup.ts` | テストセットアップ |
| `docs/design/atelier-guild-rank/ui-design/screens/common-components.md` | 設計文書 |
| `docs/tasks/atelier-guild-rank/phase-3/TASK-0047.md` | タスク定義 |

---

## 9. コマンドリファレンス

```bash
# 開発サーバー起動
cd atelier-guild-rank && pnpm dev

# テスト実行
pnpm test

# 特定ファイルのテスト
pnpm test src/presentation/ui/main/HeaderUI.spec.ts

# テストウォッチモード
pnpm test:watch

# カバレッジ
pnpm test:coverage

# リント
pnpm lint

# リント修正
pnpm lint:fix
```

---

## 変更履歴

| 日付 | 変更内容 |
|------|---------|
| 2026-01-22 | 初版作成 |
