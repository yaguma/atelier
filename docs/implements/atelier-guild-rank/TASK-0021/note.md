# TASK-0021: カードUIコンポーネント - 開発ノート

**作成日**: 2026-01-18
**タスクID**: TASK-0021
**要件名**: atelier-guild-rank
**機能名**: カードUIコンポーネント

---

## 1. 技術スタック

### 1.1 使用技術・フレームワーク

| 技術 | バージョン | 用途 |
|------|----------|------|
| **Phaser 3** | 最新版 | ゲームエンジン |
| **rexUI Plugin** | 最新版 | UIコンポーネントライブラリ |
| **TypeScript** | 最新版 | 型安全な開発 |
| **Vite** | 最新版 | ビルドツール |
| **Vitest** | 最新版 | テストフレームワーク |

**参照元**:
- docs/tasks/atelier-guild-rank/phase-3/TASK-0021.md
- docs/tasks/atelier-guild-rank/phase-1/TASK-0008.md
- docs/design/atelier-guild-rank/architecture-phaser.md

### 1.2 アーキテクチャパターン

- **Clean Architecture**: レイヤー分離（Presentation / Application / Domain / Infrastructure）
- **Event-Driven Architecture**: EventBusを用いたコンポーネント間通信
- **Phaser Scene管理**: シーンベースの画面遷移
- **コンポーネントパターン**: 再利用可能なUIコンポーネント設計

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

**参照元**: docs/design/atelier-guild-rank/architecture-phaser.md

---

## 2. 開発ルール

### 2.1 コーディング規約

#### ファイル構成

```
atelier-guild-rank/src/
├── presentation/
│   └── ui/
│       ├── theme.ts                # テーマ定義（完成）
│       └── components/
│           ├── BaseComponent.ts    # 基底クラス（完成）
│           ├── CardUI.ts          # カードUIコンポーネント（実装済み）
│           └── HandDisplay.ts     # 手札表示コンポーネント（実装済み）
```

**参照元**:
- docs/tasks/atelier-guild-rank/phase-3/TASK-0021.md
- atelier-guild-rank/src/presentation/ui/ （実装ファイル）

#### 命名規則

| 対象 | 規則 | 例 |
|------|------|-----|
| **クラス** | PascalCase | `CardUI`, `HandDisplay` |
| **インターフェース** | PascalCase | `CardUIConfig` |
| **定数** | UPPER_SNAKE_CASE | `CARD_WIDTH`, `CARD_HEIGHT` |
| **変数** | camelCase | `background`, `nameText` |
| **プライベートフィールド** | `private` キーワード | `private background` |

**参照元**: TypeScriptコーディング規約、プロジェクト既存コード

### 2.2 プロジェクト固有のルール

#### BaseComponentの継承

- すべてのUIコンポーネントは `BaseComponent` を継承
- `create()` と `destroy()` メソッドを必ず実装
- `scene`, `container`, `rexUI` への参照を基底クラスから取得

```typescript
export class CardUI extends BaseComponent {
  constructor(scene: Phaser.Scene, config: CardUIConfig) {
    super(scene, config.x, config.y);
    // 初期化処理
  }

  create(): void {
    // UI生成
  }

  destroy(): void {
    // クリーンアップ
  }
}
```

**参照元**:
- atelier-guild-rank/src/presentation/ui/components/BaseComponent.ts
- docs/tasks/atelier-guild-rank/phase-3/TASK-0018.md

#### UIレイヤー構成

| レイヤー | depth | 内容 |
|---------|------|------|
| Background | 0 | 背景画像・パターン |
| Content | 100 | メインコンテンツ（カード表示など） |
| Sidebar | 150 | サイドバー |
| Header/Footer | 200 | ヘッダー・フッター |
| Overlay | 300 | オーバーレイ・ダイアログ背景 |
| Dialog | 400 | モーダルダイアログ |
| Toast | 500 | 通知メッセージ |

**カードUIは Content レイヤー (depth: 100) に配置すること**

**参照元**: docs/design/atelier-guild-rank/ui-design/overview.md

#### カードタイプ別カラー定義

```typescript
// カードタイプごとの背景色
const CARD_TYPE_COLORS = {
  GATHERING: 0x90ee90,    // LightGreen - 採取カード
  RECIPE: 0xffb6c1,       // LightPink - レシピカード（調合）
  ENHANCEMENT: 0xadd8e6,  // LightBlue - 強化カード
};
```

**参照元**:
- docs/tasks/atelier-guild-rank/phase-3/TASK-0021.md
- docs/design/atelier-guild-rank/ui-design/overview.md

---

## 3. 関連実装

### 3.1 依存タスク

#### TASK-0018: 共通UIコンポーネント基盤 ✅ 完了

- **状態**: Phase 1完了（TDD開発完了 - 48テストケース全通過）
- **内容**: テーマ定義、BaseComponent実装
- **成果物**:
  - atelier-guild-rank/src/presentation/ui/theme.ts - テーマ定義（完成）
  - atelier-guild-rank/src/presentation/ui/components/BaseComponent.ts - 基底クラス（完成）

**参照元**:
- docs/tasks/atelier-guild-rank/phase-3/TASK-0018.md
- docs/implements/atelier-guild-rank/TASK-0018/note.md

#### TASK-0009: カードエンティティ・DeckService実装 ✅ 完了

- **状態**: 完了（TDD開発完了 - 38テストケース全通過）
- **内容**: Cardエンティティ、DeckService実装
- **成果物**:
  - atelier-guild-rank/src/domain/entities/Card.ts - カードエンティティ
  - atelier-guild-rank/src/domain/interfaces/deck-service.interface.ts - インターフェース
  - atelier-guild-rank/src/application/services/deck-service.ts - DeckService実装

**Cardエンティティの主要メソッド**:
```typescript
class Card {
  readonly id: CardId;
  readonly master: CardMaster;

  get name(): string;
  get type(): CardType;
  get cost(): number;

  isGatheringCard(): boolean;
  isRecipeCard(): boolean;
  isEnhancementCard(): boolean;
}
```

**参照元**: docs/tasks/atelier-guild-rank/phase-2/TASK-0009.md

### 3.2 類似機能の実装例

#### CardUI（既存実装）

**ファイル**: atelier-guild-rank/src/presentation/ui/components/CardUI.ts

**実装済みの主要機能**:
- カードタイプ別の背景色表示
- アイコン、名前、コスト、効果テキストの配置
- インタラクティブ機能（ホバー時の拡大、クリックイベント）
- Fisher-Yates方式のアニメーション

**カードデザイン**:
```
┌─────────────────────┐
│ ┌─────────────────┐ │
│ │     アイコン    │ │  ← 80x80px プレースホルダー
│ │                 │ │
│ └─────────────────┘ │
│                     │
│   採取カード        │  ← カード名（14px Bold）
│                     │
│  ⚡ 1   素材×3      │  ← コスト表示（12px）
│                     │
│ 森の素材を3つ採取   │  ← 効果説明（10px）
│                     │
└─────────────────────┘
  120px × 160px
```

**参照元**: atelier-guild-rank/src/presentation/ui/components/CardUI.ts

#### HandDisplay（既存実装）

**ファイル**: atelier-guild-rank/src/presentation/ui/components/HandDisplay.ts

**実装済みの主要機能**:
- 横並びで5枚のカード表示
- カード選択状態の管理
- 選択中カードの強調表示
- カードクリック時のコールバック

**参照元**: atelier-guild-rank/src/presentation/ui/components/HandDisplay.ts

### 3.3 参考パターン

#### テーマ定義の使用

```typescript
import { THEME } from '../theme';

// カラー使用例
const backgroundColor = THEME.colors.background;
const textColor = THEME.colors.text;

// フォント使用例
const textStyle = {
  fontFamily: THEME.fonts.primary,
  fontSize: `${THEME.sizes.medium}px`,
  color: '#' + THEME.colors.text.toString(16).padStart(6, '0'),
};

// スペーシング使用例
const padding = THEME.spacing.md; // 16px
```

**参照元**: atelier-guild-rank/src/presentation/ui/theme.ts

---

## 4. 設計文書

### 4.1 カードデザイン仕様

#### カードの寸法

| 要素 | サイズ |
|------|--------|
| カード全体 | 120px × 160px |
| アイコンエリア | 80px × 80px |
| パディング | 8px |
| 枠線 | 2px（#333333） |

**参照元**: docs/tasks/atelier-guild-rank/phase-3/TASK-0021.md

#### カードタイプ別の色分け

| カードタイプ | 背景色 | Hex値 | 用途 |
|------------|--------|------|------|
| **採取カード** | LightGreen | 0x90ee90 | 素材を採取するカード |
| **レシピカード** | LightPink | 0xffb6c1 | アイテムを調合するカード |
| **強化カード** | LightBlue | 0xadd8e6 | 効果を強化するカード |

**参照元**:
- docs/tasks/atelier-guild-rank/phase-3/TASK-0021.md
- docs/design/atelier-guild-rank/ui-design/overview.md

### 4.2 CardUIコンポーネント設計

#### インターフェース定義

```typescript
export interface CardUIConfig {
  card: Card;              // 表示するカード
  x: number;               // X座標
  y: number;               // Y座標
  interactive?: boolean;   // インタラクティブにするか（デフォルト: false）
  onClick?: (card: Card) => void;  // クリック時のコールバック
}
```

#### 主要メソッド

| メソッド | 説明 |
|---------|------|
| `create()` | カードUIを生成（背景、アイコン、テキストなど） |
| `destroy()` | カードUIを破棄（メモリリーク防止） |
| `getCard()` | カードエンティティを取得 |
| `getContainer()` | Phaserコンテナを取得 |

**参照元**: docs/tasks/atelier-guild-rank/phase-3/TASK-0021.md

#### レイアウト構造

```typescript
Container (x, y)
├── background: Rectangle (120x160)
├── iconPlaceholder: Rectangle (80x80) - 将来的には画像に置き換え
├── nameText: Text - カード名
├── costText: Text - "⚡ 1" 形式
└── effectText: Text - 効果説明
```

**参照元**: atelier-guild-rank/src/presentation/ui/components/CardUI.ts

### 4.3 HandDisplayコンポーネント設計

#### インターフェース定義

```typescript
export interface HandDisplayConfig {
  x: number;
  y: number;
  maxHandSize?: number;         // 最大手札枚数（デフォルト: 5）
  cardSpacing?: number;         // カード間スペーシング（デフォルト: 8）
  onCardClick?: (card: Card) => void;
}
```

#### レイアウト

```
[カード1] [カード2] [カード3] [カード4] [カード5]
   ↑8px↑     ↑8px↑     ↑8px↑     ↑8px↑
```

**参照元**: docs/tasks/atelier-guild-rank/phase-3/TASK-0021.md

### 4.4 インタラクション設計

#### ホバーエフェクト

```typescript
// ホバー時: 1.1倍に拡大（100ms、Power2イージング）
this.scene.tweens.add({
  targets: this.container,
  scaleX: 1.1,
  scaleY: 1.1,
  duration: 100,
  ease: 'Power2',
});
```

#### クリックイベント

```typescript
// クリック時: コールバックを実行
this.background.on('pointerdown', () => {
  this.config.onClick?.(this.card);
});
```

**参照元**:
- atelier-guild-rank/src/presentation/ui/components/CardUI.ts
- docs/tasks/atelier-guild-rank/phase-3/TASK-0021.md

---

## 5. 注意事項

### 5.1 技術的制約

#### Phaserの制約

- DOM要素は使用しない（`dom.createContainer: false`）
- すべてのUIはCanvas/WebGLで描画
- rexUIプラグインに依存

**参照元**: docs/design/atelier-guild-rank/architecture-phaser.md

#### カードエンティティとの連携

- CardUIは `Card` エンティティを受け取る
- Cardエンティティからカードタイプ、名前、コストを取得
- カードマスターデータ（`master`）経由で素材プール等の詳細情報にアクセス

**CardTypeの定義**:
```typescript
enum CardType {
  GATHERING = 'GATHERING',      // 採取カード
  RECIPE = 'RECIPE',           // レシピカード
  ENHANCEMENT = 'ENHANCEMENT', // 強化カード
}
```

**参照元**: atelier-guild-rank/src/domain/entities/Card.ts

### 5.2 パフォーマンス要件

#### メモリ管理

- `destroy()` メソッドで必ずすべてのGameObjectsを破棄
- イベントリスナーも忘れずに削除
- 大量のカード表示時はオブジェクトプールの使用を検討

```typescript
public destroy(): void {
  // すべてのGameObjectsを破棄
  this.background?.destroy();
  this.iconPlaceholder?.destroy();
  this.nameText?.destroy();
  this.costText?.destroy();
  this.effectText?.destroy();

  // コンテナを破棄
  this.container?.destroy();
}
```

**参照元**:
- atelier-guild-rank/src/presentation/ui/components/CardUI.ts
- docs/design/atelier-guild-rank/ui-design/screens/common-components.md

#### レンダリング最適化

- カードの更新は値変更時のみ
- 手札外のカードは非表示にする
- ホバーエフェクトはTweenを使用（滑らかなアニメーション）

**参照元**: docs/design/atelier-guild-rank/ui-design/screens/common-components.md

### 5.3 アクセシビリティ

#### インタラクティブ要素

- `interactive: true` の場合、カードにホバーカーソルを表示
- クリック可能なカードは視覚的に区別できるようにする

**参照元**: docs/design/atelier-guild-rank/ui-design/overview.md

---

## 6. テスト戦略

### 6.1 テストケース

| テストID | テスト内容 | 期待結果 |
|---------|----------|----------|
| T-0021-01 | カード表示 | 正しいデザインで表示される |
| T-0021-02 | タイプ別色 | 採取=緑、調合=ピンク、強化=青 |
| T-0021-03 | 手札表示 | 5枚横並びで表示される |
| T-0021-04 | カード選択 | 選択中カードが強調表示される |
| T-0021-05 | ホバーエフェクト | カードが1.1倍に拡大 |
| T-0021-06 | クリックイベント | コールバックが実行される |

**参照元**: docs/tasks/atelier-guild-rank/phase-3/TASK-0021.md

### 6.2 統合テスト

- Phaserシーン内でのカード表示確認
- DeckServiceとの連携確認（カードデータ取得）
- EventBusとの連携確認（カード選択イベント）

**参照元**: docs/design/atelier-guild-rank/architecture-phaser.md

---

## 7. 実装優先度

### 7.1 Phase 1: CardUIコンポーネント（必須）

1. **CardUI基本実装** - カードの視覚的表現
2. **カードタイプ別色分け** - GATHERING/RECIPE/ENHANCEMENT
3. **インタラクティブ機能** - ホバー、クリック
4. **効果テキスト生成** - カードタイプに応じた説明文

### 7.2 Phase 2: HandDisplayコンポーネント（必須）

1. **手札表示** - 5枚横並び
2. **カード選択管理** - 選択状態の保持と強調表示
3. **カード間スペーシング** - 8pxの余白

### 7.3 Phase 3: アニメーション（推奨）

1. **ドローアニメーション** - デッキから手札へ
2. **プレイアニメーション** - 手札から場へ
3. **捨てアニメーション** - カードが消える

**参照元**: docs/tasks/atelier-guild-rank/phase-3/TASK-0021.md

---

## 8. 参考リンク

### 8.1 設計文書

- docs/spec/atelier-guild-rank-requirements.md - 要件定義書
- docs/design/atelier-guild-rank/architecture-overview.md - アーキテクチャ概要
- docs/design/atelier-guild-rank/architecture-phaser.md - Phaser実装設計
- docs/design/atelier-guild-rank/ui-design/overview.md - UI設計概要
- docs/design/atelier-guild-rank/ui-design/screens/common-components.md - 共通コンポーネント設計

### 8.2 タスク文書

- docs/tasks/atelier-guild-rank/phase-2/TASK-0009.md - カードエンティティ（依存タスク）
- docs/tasks/atelier-guild-rank/phase-3/TASK-0018.md - 共通UIコンポーネント基盤（依存タスク）
- docs/tasks/atelier-guild-rank/phase-3/TASK-0021.md - 本タスク

### 8.3 実装ファイル

- atelier-guild-rank/src/presentation/ui/theme.ts - テーマ定義
- atelier-guild-rank/src/presentation/ui/components/BaseComponent.ts - 基底クラス
- atelier-guild-rank/src/presentation/ui/components/CardUI.ts - カードUI（既存実装）
- atelier-guild-rank/src/presentation/ui/components/HandDisplay.ts - 手札表示（既存実装）
- atelier-guild-rank/src/domain/entities/Card.ts - カードエンティティ

---

## 9. 開発メモ

### 9.1 実装時の注意点

1. **BaseComponentの継承**: すべてのUIコンポーネントは `BaseComponent` を継承すること
2. **コンテナの深度管理**: CardUIはContent レイヤー (depth: 100) に配置
3. **イベント購読**: `destroy()` 時に必ずイベントリスナーを削除
4. **カードタイプの判定**: `card.isGatheringCard()` 等のメソッドを使用
5. **相対パス**: すべてのファイルパスはプロジェクトルートからの相対パスで記載

### 9.2 既存実装の活用

CardUIとHandDisplayは既に実装済みなので、以下の点を確認：

- **CardUI**: カードの視覚的表現は完成している
- **HandDisplay**: 手札の横並び表示機能は実装済み
- **テストケース**: 既存のテストケースを参考にして追加テストを作成

**既存実装のテストファイル**:
- atelier-guild-rank/src/presentation/ui/components/CardUI.spec.ts
- atelier-guild-rank/src/presentation/ui/components/HandDisplay.spec.ts

### 9.3 よくある問題と解決策

| 問題 | 原因 | 解決策 |
|------|------|--------|
| カードが表示されない | `create()` 忘れ | コンストラクタで `this.create()` を呼ぶ |
| ホバーが動作しない | `interactive: true` 未設定 | CardUIConfigで `interactive: true` を指定 |
| メモリリーク | `destroy()` 未実装 | すべてのGameObjectsを破棄 |
| カードの色が正しくない | カードタイプの判定ミス | `card.type` の値を確認 |

---

## 10. 実装状況

### 10.1 実装済みコンポーネント

#### CardUI ✅ 完了

- **ファイル**: atelier-guild-rank/src/presentation/ui/components/CardUI.ts
- **テスト**: atelier-guild-rank/src/presentation/ui/components/CardUI.spec.ts
- **機能**:
  - カードタイプ別の背景色表示
  - アイコン、名前、コスト、効果テキストの配置
  - インタラクティブ機能（ホバー、クリック）

#### HandDisplay ✅ 完了

- **ファイル**: atelier-guild-rank/src/presentation/ui/components/HandDisplay.ts
- **テスト**: atelier-guild-rank/src/presentation/ui/components/HandDisplay.spec.ts
- **機能**:
  - 横並びで5枚のカード表示
  - カード選択状態の管理
  - 選択中カードの強調表示

### 10.2 今後の拡張

- **ドラッグ&ドロップ**: カードをドラッグして使用
- **カードアニメーション**: より高度なエフェクト
- **カード詳細ビュー**: ホバー時に詳細情報を表示

---

**最終更新**: 2026-01-18
**作成者**: Claude (Zundamon)
