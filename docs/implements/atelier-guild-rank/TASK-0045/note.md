# TASK-0045: 調合フェーズUI実装（再実装）タスクノート

**作成日**: 2026-01-21
**タスクID**: TASK-0045
**カテゴリ**: UI層 (Presentation)

---

## 1. 技術スタック

| カテゴリ | 技術 |
|----------|------|
| Framework | Phaser 3.87+ / rexUI |
| Language | TypeScript 5.x |
| Build | Vite 5.x |
| Package Manager | pnpm 9.x |
| Linter/Formatter | Biome 2.x |
| Unit Test | Vitest |
| E2E Test | Playwright |

### パスエイリアス

```typescript
import { ... } from '@domain/entities/...';
import { ... } from '@domain/interfaces/...';
import { ... } from '@application/services/...';
import { ... } from '@presentation/ui/...';
import { ... } from '@shared/types';
```

---

## 2. 開発ルール

### 2.1 コードスタイル（Biome）

- インデント: 2スペース
- クォート: シングルクォート
- セミコロン: 必須
- 末尾カンマ: 全て

### 2.2 テストカバレッジ目標

- Global: 80%+
- Domain層: 90%+

### 2.3 信頼性レベル表記

コード内のコメントで信頼性レベルを明記する:
- **青信号**: 設計文書に記載された仕様
- **黄信号**: 設計文書から妥当な推測
- **赤信号**: 設計文書にない推測

### 2.4 ファイルヘッダーテンプレート

```typescript
/**
 * [ファイル名] - [概要]
 *
 * TASK-0045: 調合フェーズUI実装（再実装）
 *
 * @description
 * [詳細な説明]
 *
 * @信頼性レベル [レベル]
 * - [理由]
 */
```

---

## 3. 関連実装（既存の実装パターン・参考コード）

### 3.1 BaseComponent（基底クラス）

**ファイル**: `src/presentation/ui/components/BaseComponent.ts`

```typescript
export abstract class BaseComponent {
  protected scene: Phaser.Scene;
  protected container: Phaser.GameObjects.Container;
  protected rexUI: any;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    // バリデーション: scene, x, yの検証
    this.scene = scene;
    this.container = scene.add.container(x, y);
    this.rexUI = scene.rexUI;
  }

  abstract create(): void;
  abstract destroy(): void;

  setVisible(visible: boolean): this { ... }
  setPosition(x: number, y: number): this { ... }
  getContainer(): Phaser.GameObjects.Container { ... }
}
```

### 3.2 GatheringPhaseUI（採取フェーズUI参照）

**ファイル**: `src/presentation/ui/phases/GatheringPhaseUI.ts`

**構造パターン**:
```typescript
export class GatheringPhaseUI extends BaseComponent {
  // UI要素
  private materialSlots: MaterialSlotUI[] = [];
  private gatheredDisplay!: Phaser.GameObjects.Container;
  private remainingText!: Phaser.GameObjects.Text;
  private titleText!: Phaser.GameObjects.Text;
  private endButton!: Button;

  // 状態管理
  private session: DraftSession | null = null;
  private onEndCallback?: () => void;

  constructor(
    scene: Phaser.Scene,
    private gatheringService: IGatheringService,
    onEnd?: () => void,
  ) {
    super(scene, 400, 100);
    this.onEndCallback = onEnd;
  }

  create(): void {
    this.createTitle();
    this.createRemainingCounter();
    this.createMaterialPool();
    this.createGatheredDisplay();
    this.createEndButton();
  }

  // セッション更新メソッド
  updateSession(session: DraftSession): void { ... }

  // プライベートメソッドでUI作成を分割
  private createTitle(): void { ... }
  private createMaterialPool(): void { ... }
  // ...
}
```

**キーポイント**:
- `BaseComponent`を継承
- サービスはコンストラクタで注入
- コールバックはオプショナル引数で受け取り
- `create()`でUI要素を作成
- 状態更新用のパブリックメソッドを提供

### 3.3 DeliveryPhaseUI（納品フェーズUI参照）

**ファイル**: `src/presentation/ui/phases/DeliveryPhaseUI.ts`

**特徴的なパターン**:

1. **定数定義の分離**:
```typescript
const UI_LAYOUT = {
  COMPONENT_X: 160,
  COMPONENT_Y: 80,
  // ...
} as const;

const ERROR_MESSAGES = { ... } as const;
const UI_TEXT = { ... } as const;
const UI_STYLES = { ... } as const;
const KEYBOARD_KEYS = { ... } as const;
```

2. **サービス初期化パターン**:
```typescript
private initializeServices(): void {
  this.eventBus = this.scene.data.get('eventBus');
  if (!this.eventBus) {
    console.warn(ERROR_MESSAGES.EVENT_BUS_NOT_AVAILABLE);
  }
  // 他のサービスも同様
}
```

3. **イベント発行パターン**:
```typescript
private emitEvent(eventType: string, payload: unknown): void {
  if (!this.eventBus) return;
  try {
    this.eventBus.emit(eventType, payload);
  } catch (error) {
    console.error(ERROR_MESSAGES.FAILED_TO_EMIT_EVENT, eventType, error);
  }
}
```

4. **リソース破棄パターン**:
```typescript
public destroy(): void {
  this.destroyQuestPanels();
  this.removeKeyboardListener();
  if (this.itemInventory) {
    this.itemInventory.destroy();
    this.itemInventory = null;
  }
  // ...
}
```

### 3.4 Button（ボタンコンポーネント参照）

**ファイル**: `src/presentation/ui/components/Button.ts`

```typescript
export class Button extends BaseComponent {
  constructor(scene: Phaser.Scene, x: number, y: number, config: ButtonConfig) {
    super(scene, x, y);
    // バリデーション
    this.config = { ...config, type: config.type || ButtonType.PRIMARY };
    this.create();
  }

  public create(): void {
    // rexUIを使用してラベルを作成
    this.background = this.rexUI.add.roundRectangle({ ... });
    this.label = this.rexUI.add.label({ ... });
    this.label.setInteractive();
    // イベントリスナー登録
  }

  public setEnabled(enabled: boolean): this { ... }
  public isEnabled(): boolean { ... }
  public destroy(): void { ... }
}
```

### 3.5 MaterialSlotUI（素材スロットUI参照）

**ファイル**: `src/presentation/ui/components/MaterialSlotUI.ts`

素材を表示するスロットUIコンポーネント。GatheringPhaseUIで使用されている。

```typescript
export interface MaterialDisplay {
  id: string;
  name: string;
  type: string;
  quality: Quality;
}

export class MaterialSlotUI extends BaseComponent {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    onSelect?: (material: MaterialDisplay) => void,
  ) { ... }

  setMaterial(material: MaterialDisplay): void { ... }
  setEmpty(): void { ... }
  setInteractive(enabled: boolean): void { ... }
}
```

---

## 4. 設計情報

### 4.1 IAlchemyService インターフェース

**ファイル**: `src/domain/interfaces/alchemy-service.interface.ts`

```typescript
export interface RecipeCheckResult {
  canCraft: boolean;
  missingMaterials: IRecipeRequiredMaterial[];
  matchedMaterials: MaterialInstance[];
}

export interface IAlchemyService {
  // 調合実行
  craft(recipeId: CardId, materials: MaterialInstance[]): ItemInstance;

  // 調合可能チェック
  canCraft(recipeId: CardId, availableMaterials: MaterialInstance[]): boolean;

  // 品質プレビュー
  previewQuality(recipeId: CardId, materials: MaterialInstance[]): Quality;

  // 利用可能なレシピ取得
  getAvailableRecipes(materials: MaterialInstance[]): IRecipeCardMaster[];

  // レシピ要件チェック
  checkRecipeRequirements(recipeId: CardId, materials: MaterialInstance[]): RecipeCheckResult;
}
```

### 4.2 MaterialInstance エンティティ

**ファイル**: `src/domain/entities/MaterialInstance.ts`

```typescript
export class MaterialInstance {
  constructor(
    public readonly instanceId: string,
    public readonly master: IMaterial,
    public readonly quality: Quality,
  ) {}

  get materialId(): MaterialId { return this.master.id; }
  get name(): string { return this.master.name; }
  get baseQuality(): Quality { return this.master.baseQuality; }
  get attributes(): Attribute[] { return this.master.attributes; }
}
```

### 4.3 ItemInstance エンティティ

**ファイル**: `src/domain/entities/ItemInstance.ts`

```typescript
export class ItemInstance {
  constructor(
    public readonly instanceId: string,
    public readonly master: ItemMaster,
    public readonly quality: Quality,
    public readonly usedMaterials: MaterialInstance[],
  ) {}

  get itemId(): ItemId { return this.master.id; }
  get name(): string { return this.master.name; }
  get basePrice(): number { ... }
  calculatePrice(): number { ... }
}
```

### 4.4 IRecipeCardMaster 型

**ファイル**: `src/shared/types/master-data.ts`

```typescript
export interface IRecipeRequiredMaterial {
  materialId: string;
  quantity: number;
  minQuality?: Quality;
}

export interface IRecipeCardMaster {
  id: CardId;
  name: string;
  type: 'RECIPE';
  cost: number;
  requiredMaterials: IRecipeRequiredMaterial[];
  outputItemId: string;
  category: ItemCategory;
  rarity: Rarity;
  unlockRank: GuildRank;
  description: string;
}
```

### 4.5 THEME 定数

**ファイル**: `src/presentation/ui/theme.ts`

```typescript
export const THEME = {
  colors: {
    primary: 0x8b4513,       // SaddleBrown
    primaryHover: 0x9b5523,
    secondary: 0xd2691e,     // Chocolate
    secondaryHover: 0xe2792e,
    background: 0xf5f5dc,    // Beige
    text: 0x333333,
    textLight: 0x666666,
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#FFFFFF',
    success: 0x228b22,
    warning: 0xdaa520,
    error: 0x8b0000,
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
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  qualityColors: {
    D: 0x808080, C: 0x00ff00, B: 0x0080ff, A: 0xffd700, S: 0xff00ff,
  },
} as const;
```

### 4.6 調合画面レイアウト

```
+-----------------------------------------------------------------------+
|                    調合フェーズ                                        |
|                                                                        |
|  +------------------------+    +------------------------------------+  |
|  |    レシピ一覧          |    |       調合エリア                   |  |
|  |                        |    |                                    |  |
|  |  > 回復薬              |    |   素材スロット:                    |  |
|  |    植物x1              |    |   [   ] + [   ] + [   ]            |  |
|  |                        |    |                                    |  |
|  |  > 爆弾                |    |   完成予測: 回復薬 (B品質)         |  |
|  |    鉱物x1, 火薬x1      |    |                                    |  |
|  |                        |    |   [調合する]                       |  |
|  +------------------------+    +------------------------------------+  |
|                                                                        |
|  所持素材: [薬草C] [薬草B] [鉄鉱A] [花D]                                |
|                                                                        |
+-----------------------------------------------------------------------+
```

---

## 5. 実装すべきファイル

| 成果物 | パス |
|--------|------|
| フェーズUI | `src/presentation/ui/phases/AlchemyPhaseUI.ts` |
| レシピリスト | `src/presentation/ui/components/RecipeListUI.ts` |
| テスト | `tests/unit/presentation/alchemy-phase-ui.test.ts` |

---

## 6. 注意事項

### 6.1 重要な実装ポイント

1. **サービス注入**: `IAlchemyService`と`IInventoryService`(または`IMaterialService`)をコンストラクタで受け取る
2. **BaseComponent継承**: 必ず`BaseComponent`を継承し、`create()`と`destroy()`を実装
3. **rexUI使用**: ボタンやラベルは`this.rexUI`経由で作成
4. **状態管理**: 選択中のレシピ・素材を内部状態として管理
5. **品質プレビュー**: `alchemyService.previewQuality()`を使用してリアルタイム表示
6. **調合実行**: `alchemyService.craft()`を呼び出し、結果をコールバックで通知

### 6.2 GatheringPhaseUIとの違い

| 項目 | GatheringPhaseUI | AlchemyPhaseUI |
|------|------------------|----------------|
| 主要サービス | IGatheringService | IAlchemyService |
| 選択対象 | 素材（単一選択） | レシピ + 複数素材 |
| 表示内容 | 素材プール | レシピリスト + 素材スロット |
| 結果 | MaterialInstance[] | ItemInstance |

### 6.3 テスト観点

1. 初期化テスト（正常に初期化されること）
2. レシピ選択テスト（選択状態が正しく変わること）
3. 素材選択テスト（スロットに正しく配置されること）
4. 品質プレビューテスト（正しい品質が表示されること）
5. 調合実行テスト（アイテム生成・素材消費）
6. 素材不足テスト（調合ボタン無効化）

### 6.4 コマンドリファレンス

```bash
# 開発サーバー起動
cd atelier-guild-rank && pnpm dev

# テスト実行
pnpm test tests/unit/presentation/alchemy-phase-ui.test.ts

# ウォッチモード
pnpm test:watch

# Lint
pnpm lint
pnpm lint:fix
```

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|----------|---------|
| 2026-01-21 | 1.0.0 | 初版作成 |
