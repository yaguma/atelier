# TASK-0226: AlchemyPreviewPanel実装 - タスクノート

## 技術スタック

| 項目 | バージョン/詳細 |
|------|----------------|
| ゲームエンジン | Phaser 3.87+ |
| 言語 | TypeScript 5.0+ |
| テストフレームワーク | Vitest |
| プロジェクトルート | `atelier-guild-rank-html/` |

## コーディング規約

### ファイル命名規則
- インターフェース: `I{ComponentName}.ts`（例: `IAlchemyPreviewPanel.ts`）
- 実装: `{ComponentName}.ts`（例: `AlchemyPreviewPanel.ts`）
- 定数: `{ComponentName}Constants.ts`（例: `AlchemyPreviewPanelConstants.ts`）
- テスト: `{ComponentName}.test.ts`（テストディレクトリ配下）

### コンポーネント設計パターン
```typescript
// インターフェースファイル
export interface IComponentPanel {
  readonly container: Phaser.GameObjects.Container;
  // メソッド定義
}

// 実装ファイル
export class ComponentPanel implements IComponentPanel {
  public readonly container: Phaser.GameObjects.Container;
  private readonly scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, options: ComponentOptions = {}) {
    this.scene = scene;
    this.container = scene.add.container(x, y);
    // 初期化
  }
}
```

### JSDocコメント
- ファイル先頭に概要とタスクIDを記載
- 公開メソッドには必ずJSDocを付与
- 設計文書への参照を含める

## 参考となる既存実装パターン

### 1. QuestPanel（最も近い参考実装）
**ファイル**: `src/game/ui/quest/QuestPanel.ts`

**採用すべきパターン**:
- コンストラクタでのUI要素作成
- `showEmptyState()` メソッドで初期状態を表示
- セクション別の `create*()` メソッドで構造化
- `clearSection()` でセクション内要素をクリア
- ボタンヘルパーメソッド

```typescript
// 構造例
private createBackground(): void { ... }
private createHeader(): void { ... }
private createRewardSection(): void { ... }
private showEmptyState(): void { ... }
private clearSection(section: Container): void { ... }
```

### 2. MaterialView（素材表示コンポーネント）
**ファイル**: `src/game/ui/material/MaterialView.ts`

**再利用ポイント**:
- コンパクト/詳細モードの切り替え
- 品質に応じた色分け（`MaterialQualityColors`）
- インタラクション設定（`setupInteraction()`）
- 状態管理（選択状態、有効/無効状態）

```typescript
// MaterialViewOptionsの利用
{
  x: number;
  y: number;
  material: Material;
  instance?: IMaterialInstance;
  mode?: 'compact' | 'detail';
  count?: number;
  showQuality?: boolean;
  interactive?: boolean;
  onClick?: (material: Material) => void;
  onHover?: (material: Material, isHovering: boolean) => void;
}
```

## 必要なインポートパス

```typescript
// Phaser
import Phaser from 'phaser';

// ドメインエンティティ
import { Material } from '@domain/material/MaterialEntity';
import { IMaterialInstance } from '@domain/material/Material';
import { RecipeCard } from '@domain/card/CardEntity';
import { Quality } from '@domain/common/types';

// UIコンポーネント
import { MaterialView } from '../material/MaterialView';
import type { MaterialViewOptions } from '../material/IMaterialView';

// 設定
import { Colors } from '../../config/ColorPalette';
import { TextStyles } from '../../config/TextStyles';
import { MaterialQualityColors } from '../material/MaterialConstants';
```

### パスエイリアス
- `@domain/` → `src/domain/`
- 相対パスは階層に応じて調整

## 設計上の注意点

### 1. AlchemyPreview型の定義
タスク仕様書で定義されている型:
```typescript
export interface AlchemyPreview {
  recipe: Recipe;           // RecipeCardエンティティを使用
  materials: Material[];    // 選択された素材リスト
  predictedQuality: string; // 予測品質（'legendary', 'epic', 'rare', 'good', 'normal', 'poor'）
  predictedTraits: string[];// 継承される特性リスト
  canCraft: boolean;        // 調合可能フラグ
  missingMaterials: string[];// 不足素材リスト
}
```

### 2. リアルタイム更新
- `addMaterial()`, `removeMaterial()`, `clearMaterials()` でプレビューを動的に更新
- 素材変更時に `setPreview()` を再呼び出し
- パフォーマンスを考慮してMaterialViewを適切に再利用/破棄

### 3. MaterialViewの再利用
- 最大4つまで表示（超過分は `+N more` で表示）
- `compact` モードを使用
- 既存のMaterialViewを破棄してから再作成

### 4. 品質表示
品質レベルとカラーマッピング:
```typescript
const qualityColors: Record<string, string> = {
  'legendary': '#ffd700', // 金
  'epic': '#a335ee',      // 紫
  'rare': '#0070dd',      // 青
  'good': '#1eff00',      // 緑
  'normal': '#ffffff',    // 白
  'poor': '#9d9d9d',      // 灰
};
```

### 5. ステータスインジケーター
3つの状態を表示:
- `canCraft === true`: 「調合可能」（緑）
- `missingMaterials.length > 0`: 「素材不足」（赤）
- その他: 「待機中」（灰）

## ディレクトリ構成

作成が必要なディレクトリ:
```
src/game/ui/alchemy/
├── IAlchemyPreviewPanel.ts    # インターフェース定義
├── AlchemyPreviewPanel.ts     # 実装
└── AlchemyPreviewPanelConstants.ts  # 定数（必要に応じて）
```

テストファイル配置:
```
tests/unit/game/ui/alchemy/
└── AlchemyPreviewPanel.test.ts
```

## パネルレイアウト仕様

```
┌─────────────────────────────┐
│   🔮 調合プレビュー         │  ← タイトル
├─────────────────────────────┤
│      [レシピ名]             │  ← レシピ名（金色）
├─────────────────────────────┤
│ 予測品質                    │
│ [品質ランク]                │  ← 品質テキスト（色分け）
│ [━━━━━━━━━━━━]              │  ← 品質ゲージ
├─────────────────────────────┤
│ 使用素材                    │
│ [素材1] [素材2]             │  ← MaterialView (compact)
│ [素材3] [素材4]             │
│ +N more                     │  ← 5つ以上の場合
├─────────────────────────────┤
│ 継承特性                    │
│ • 特性1                     │
│ • 特性2                     │
│ • 特性3                     │
├─────────────────────────────┤
│      ✅ 調合可能            │  ← ステータスインジケーター
│      ❌ 素材不足            │
│      ⏳ 待機中              │
└─────────────────────────────┘
```

推奨サイズ:
- 幅: 250px
- 高さ: 350px

## テスト観点

1. **プレビュー設定テスト**
   - `setPreview(preview)` でプレビュー内容が表示される
   - `setPreview(null)` で空状態に戻る
   - `getPreview()` で現在のプレビューを取得できる

2. **品質表示テスト**
   - 各品質レベルに応じた色が適用される
   - 品質ゲージが正しく描画される

3. **素材操作テスト**
   - `addMaterial()` で素材が追加される
   - `removeMaterial()` で素材が削除される
   - `clearMaterials()` で全素材がクリアされる

4. **ステータスインジケーターテスト**
   - `canCraft=true` で「調合可能」表示
   - `missingMaterials` がある場合「素材不足」表示
   - それ以外で「待機中」表示

5. **表示制御テスト**
   - `setVisible()` で表示/非表示が切り替わる
   - `setEnabled()` で有効/無効状態が切り替わる

## 参照ドキュメント

- タスク定義: `docs/tasks/atelier-guild-rank-phaser/TASK-0226.md`
- UI設計概要: `docs/design/atelier-guild-rank-phaser/ui-design/overview.md`
- MaterialView設計: `docs/tasks/atelier-guild-rank-phaser/TASK-0199.md`
