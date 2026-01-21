# TASK-0045: 調合フェーズUI実装（再実装） テストケース仕様書

**バージョン**: 1.0.0
**作成日**: 2026-01-21
**タスクID**: TASK-0045
**テストファイル**: `tests/unit/presentation/alchemy-phase-ui.test.ts`

---

## 1. テスト概要

### 1.1 テスト対象

| コンポーネント | ファイルパス | テスト範囲 |
|---------------|-------------|-----------|
| AlchemyPhaseUI | `src/presentation/ui/phases/AlchemyPhaseUI.ts` | 初期化、レシピ選択、素材選択、品質プレビュー、調合実行 |
| RecipeListUI | `src/presentation/ui/components/RecipeListUI.ts` | 初期化、レシピ表示、選択状態管理 |

### 1.2 テストカバレッジ目標

- ユニットテストカバレッジ: 80%以上
- 境界値・異常系を含む網羅的なテスト

### 1.3 依存関係

```typescript
// テスト対象
import { AlchemyPhaseUI } from '@presentation/ui/phases/AlchemyPhaseUI';
import { RecipeListUI } from '@presentation/ui/components/RecipeListUI';

// テスト依存
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type Phaser from 'phaser';
import type { IAlchemyService } from '@domain/interfaces/alchemy-service.interface';
import type { IRecipeCardMaster } from '@shared/types/master-data';
import type { MaterialInstance } from '@domain/entities/MaterialInstance';
import type { ItemInstance } from '@domain/entities/ItemInstance';
```

---

## 2. モック設計

### 2.1 Phaserシーンモック

```typescript
interface MockContainer {
  setPosition: ReturnType<typeof vi.fn>;
  setVisible: ReturnType<typeof vi.fn>;
  setDepth: ReturnType<typeof vi.fn>;
  add: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
  x: number;
  y: number;
  visible: boolean;
}

interface MockScene extends Phaser.Scene {
  add: {
    container: ReturnType<typeof vi.fn>;
    rectangle: ReturnType<typeof vi.fn>;
    text: ReturnType<typeof vi.fn>;
  };
  cameras: {
    main: {
      centerX: number;
      centerY: number;
      width: number;
      height: number;
    };
  };
  rexUI: {
    add: {
      roundRectangle: ReturnType<typeof vi.fn>;
      label: ReturnType<typeof vi.fn>;
      scrollablePanel: ReturnType<typeof vi.fn>;
    };
  };
}

const createMockScene = (): { scene: MockScene; mockContainer: MockContainer } => {
  const mockContainer: MockContainer = {
    setPosition: vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis(),
    setDepth: vi.fn().mockReturnThis(),
    add: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    x: 0,
    y: 0,
    visible: true,
  };

  const mockLabel = {
    setInteractive: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  };

  const scene = {
    add: {
      container: vi.fn().mockReturnValue(mockContainer),
      rectangle: vi.fn().mockReturnValue({
        setOrigin: vi.fn().mockReturnThis(),
        setFillStyle: vi.fn().mockReturnThis(),
      }),
      text: vi.fn().mockReturnValue({
        setOrigin: vi.fn().mockReturnThis(),
        setText: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
      }),
    },
    cameras: {
      main: {
        centerX: 640,
        centerY: 360,
        width: 1280,
        height: 720,
      },
    },
    rexUI: {
      add: {
        roundRectangle: vi.fn().mockReturnValue({
          setFillStyle: vi.fn().mockReturnThis(),
        }),
        label: vi.fn().mockReturnValue(mockLabel),
        scrollablePanel: vi.fn().mockReturnValue({
          layout: vi.fn().mockReturnThis(),
          destroy: vi.fn(),
        }),
      },
    },
  } as unknown as MockScene;

  return { scene, mockContainer };
};
```

### 2.2 IAlchemyServiceモック

```typescript
interface MockAlchemyService extends IAlchemyService {
  craft: ReturnType<typeof vi.fn>;
  canCraft: ReturnType<typeof vi.fn>;
  previewQuality: ReturnType<typeof vi.fn>;
  getAvailableRecipes: ReturnType<typeof vi.fn>;
  checkRecipeRequirements: ReturnType<typeof vi.fn>;
}

const createMockAlchemyService = (): MockAlchemyService => ({
  craft: vi.fn(),
  canCraft: vi.fn().mockReturnValue(true),
  previewQuality: vi.fn().mockReturnValue('B'),
  getAvailableRecipes: vi.fn().mockReturnValue([]),
  checkRecipeRequirements: vi.fn().mockReturnValue({
    canCraft: true,
    missingMaterials: [],
    matchedMaterials: [],
  }),
});
```

### 2.3 テストデータファクトリ

```typescript
// レシピマスターデータ生成
const createMockRecipe = (overrides?: Partial<IRecipeCardMaster>): IRecipeCardMaster => ({
  id: 'recipe-001' as CardId,
  name: '回復薬',
  type: 'RECIPE',
  cost: 1,
  requiredMaterials: [{ materialId: 'mat-001', quantity: 1 }],
  outputItemId: 'item-001',
  category: 'consumable',
  rarity: 'common',
  unlockRank: 'E',
  description: '基本的な回復薬',
  ...overrides,
});

// 素材インスタンス生成
const createMockMaterial = (overrides?: Partial<MaterialInstance>): MaterialInstance => ({
  instanceId: 'inst-001',
  master: {
    id: 'mat-001',
    name: '薬草',
    type: 'plant',
    baseQuality: 'C',
    attributes: [],
  },
  quality: 'B',
  get materialId() { return this.master.id; },
  get name() { return this.master.name; },
  get baseQuality() { return this.master.baseQuality; },
  get attributes() { return this.master.attributes; },
  ...overrides,
} as MaterialInstance);

// アイテムインスタンス生成
const createMockItem = (overrides?: Partial<ItemInstance>): ItemInstance => ({
  instanceId: 'item-inst-001',
  master: {
    id: 'item-001',
    name: '回復薬',
    basePrice: 100,
  },
  quality: 'B',
  usedMaterials: [],
  get itemId() { return this.master.id; },
  get name() { return this.master.name; },
  ...overrides,
} as ItemInstance);
```

---

## 3. テストケース一覧

### 3.1 AlchemyPhaseUI テストケース

#### 3.1.1 初期化（正常系）

| テストID | 説明 | 優先度 | 対応要件 |
|----------|------|--------|----------|
| TC-001 | BaseComponentを継承してAlchemyPhaseUIが正常に初期化される | P0 | FR-001 |
| TC-002 | IAlchemyServiceがコンストラクタで注入される | P0 | FR-002 |
| TC-003 | 調合完了コールバックがオプションで設定される | P1 | FR-003 |
| TC-004 | create()で全てのUI要素が作成される | P0 | FR-004 |
| TC-005 | destroy()で全てのUI要素が適切に破棄される | P0 | FR-005 |

#### 3.1.2 レシピ一覧表示（正常系）

| テストID | 説明 | 優先度 | 対応要件 |
|----------|------|--------|----------|
| TC-010 | 調合フェーズ開始時にレシピ一覧が左側パネルに表示される | P0 | FR-010 |
| TC-011 | レシピクリック時に選択状態になる | P0 | FR-011 |
| TC-012 | レシピ選択時に必要素材情報が調合エリアに表示される | P0 | FR-012 |
| TC-013 | レシピ選択時に対応する素材スロットが表示される | P0 | FR-013 |

#### 3.1.3 素材選択（正常系）

| テストID | 説明 | 優先度 | 対応要件 |
|----------|------|--------|----------|
| TC-020 | 所持素材クリック時にスロットに配置される | P0 | FR-020 |
| TC-021 | 素材配置時に所持素材表示が更新される | P1 | FR-021 |
| TC-022 | 配置済み素材クリック時にスロットから取り除かれる | P1 | FR-022 |
| TC-023 | 素材配置時に品質プレビューが更新される | P0 | FR-023 |

#### 3.1.4 品質プレビュー（正常系）

| テストID | 説明 | 優先度 | 対応要件 |
|----------|------|--------|----------|
| TC-030 | レシピと素材選択時に完成品予測品質が表示される | P0 | FR-030 |
| TC-031 | 素材変更時にリアルタイムで品質プレビューが更新される | P0 | FR-031 |
| TC-032 | 素材不足時に品質プレビューが「-」表示になる | P1 | FR-032 |

#### 3.1.5 調合実行（正常系）

| テストID | 説明 | 優先度 | 対応要件 |
|----------|------|--------|----------|
| TC-040 | 調合ボタンクリック時にalchemyService.craft()が呼び出される | P0 | FR-040 |
| TC-041 | 調合成功時にItemInstanceがコールバックで通知される | P0 | FR-041 |
| TC-042 | 調合成功時に素材スロットがクリアされる | P0 | FR-042 |
| TC-043 | 調合成功時に選択状態がリセットされる | P1 | FR-043 |

#### 3.1.6 調合ボタン状態（正常系）

| テストID | 説明 | 優先度 | 対応要件 |
|----------|------|--------|----------|
| TC-050 | 必要素材が揃っている時に調合ボタンが有効になる | P0 | FR-050 |
| TC-051 | 必要素材が不足時に調合ボタンが無効になる | P0 | FR-051 |
| TC-052 | レシピ未選択時に調合ボタンが無効になる | P0 | FR-052 |

### 3.2 RecipeListUI テストケース

#### 3.2.1 初期化（正常系）

| テストID | 説明 | 優先度 | 対応要件 |
|----------|------|--------|----------|
| TC-100 | BaseComponentを継承してRecipeListUIが正常に初期化される | P0 | FR-100 |
| TC-101 | IRecipeCardMaster[]を受け取って表示される | P0 | FR-101 |
| TC-102 | 選択時コールバックがオプションで設定される | P1 | FR-102 |

#### 3.2.2 レシピ表示（正常系）

| テストID | 説明 | 優先度 | 対応要件 |
|----------|------|--------|----------|
| TC-110 | レシピが縦方向リストとして表示される | P0 | FR-110 |
| TC-111 | 各レシピにレシピ名が表示される | P0 | FR-111 |
| TC-112 | 各レシピに必要素材の要約が表示される | P0 | FR-112 |

#### 3.2.3 選択状態（正常系）

| テストID | 説明 | 優先度 | 対応要件 |
|----------|------|--------|----------|
| TC-120 | レシピクリック時にハイライト表示される | P0 | FR-120 |
| TC-121 | レシピクリック時にコールバック関数が呼び出される | P0 | FR-121 |
| TC-122 | 新しいレシピ選択時に以前の選択が解除される | P0 | FR-122 |

---

## 4. 正常系テストケース詳細

### 4.1 AlchemyPhaseUI 初期化

```typescript
describe('AlchemyPhaseUI', () => {
  describe('初期化', () => {
    describe('TC-001: BaseComponentを継承して初期化', () => {
      // 【テスト目的】: AlchemyPhaseUIがBaseComponentを継承して正常に初期化されることを確認
      // 【対応要件】: FR-001
      // 🔵 信頼性レベル: requirements.md セクション2.1.1 FR-001に明記

      it('TC-001: コンストラクタで正常にインスタンスが作成される', () => {
        // Given: 有効なPhaserシーンモックとIAlchemyServiceモック
        const { scene } = createMockScene();
        const alchemyService = createMockAlchemyService();

        // When: AlchemyPhaseUIをインスタンス化する
        const ui = new AlchemyPhaseUI(scene, alchemyService);

        // Then:
        // - インスタンスが正常に作成される
        expect(ui).toBeDefined();
        expect(ui).toBeInstanceOf(AlchemyPhaseUI);
      });
    });

    describe('TC-002: IAlchemyServiceのコンストラクタ注入', () => {
      // 【テスト目的】: IAlchemyServiceがコンストラクタで正しく注入されることを確認
      // 【対応要件】: FR-002
      // 🔵 信頼性レベル: requirements.md セクション2.1.1 FR-002に明記

      it('TC-002: alchemyServiceがコンストラクタで受け取られる', () => {
        // Given: 有効なPhaserシーンモックとIAlchemyServiceモック
        const { scene } = createMockScene();
        const alchemyService = createMockAlchemyService();

        // When: AlchemyPhaseUIをインスタンス化する
        const ui = new AlchemyPhaseUI(scene, alchemyService);
        ui.create();

        // Then:
        // - alchemyServiceが内部で使用可能である（canCraftなどを呼び出せる）
        // - 初期状態でgetAvailableRecipesが呼び出される
        expect(alchemyService.getAvailableRecipes).toHaveBeenCalled();
      });
    });

    describe('TC-003: 調合完了コールバックの設定', () => {
      // 【テスト目的】: 調合完了コールバックがオプションで受け取れることを確認
      // 【対応要件】: FR-003
      // 🔵 信頼性レベル: requirements.md セクション2.1.1 FR-003に明記

      it('TC-003: onCraftCompleteコールバックがオプションで設定できる', () => {
        // Given: 有効なPhaserシーンモック、IAlchemyServiceモック、コールバック関数
        const { scene } = createMockScene();
        const alchemyService = createMockAlchemyService();
        const onCraftComplete = vi.fn();

        // When: コールバック付きでAlchemyPhaseUIをインスタンス化する
        const ui = new AlchemyPhaseUI(scene, alchemyService, onCraftComplete);

        // Then:
        // - エラーなくインスタンスが作成される
        expect(ui).toBeDefined();
      });
    });

    describe('TC-004: create()でUI要素作成', () => {
      // 【テスト目的】: create()で全てのUI要素が作成されることを確認
      // 【対応要件】: FR-004
      // 🔵 信頼性レベル: requirements.md セクション2.1.1 FR-004に明記

      it('TC-004: create()でコンテナ、レシピリスト、素材スロット、調合ボタンが作成される', () => {
        // Given: 有効なPhaserシーンモックとIAlchemyServiceモック
        const { scene, mockContainer } = createMockScene();
        const alchemyService = createMockAlchemyService();
        const ui = new AlchemyPhaseUI(scene, alchemyService);

        // When: create()を呼び出す
        ui.create();

        // Then:
        // - scene.add.containerが呼び出される
        expect(scene.add.container).toHaveBeenCalled();
        // - タイトルテキストが作成される
        expect(scene.add.text).toHaveBeenCalled();
      });
    });

    describe('TC-005: destroy()でリソース破棄', () => {
      // 【テスト目的】: destroy()で全てのUI要素が適切に破棄されることを確認
      // 【対応要件】: FR-005
      // 🔵 信頼性レベル: requirements.md セクション2.1.1 FR-005に明記

      it('TC-005: destroy()でコンテナとUI要素が破棄される', () => {
        // Given: AlchemyPhaseUIが初期化済み
        const { scene, mockContainer } = createMockScene();
        const alchemyService = createMockAlchemyService();
        const ui = new AlchemyPhaseUI(scene, alchemyService);
        ui.create();

        // When: destroy()を呼び出す
        ui.destroy();

        // Then:
        // - コンテナのdestroy()が呼び出される
        expect(mockContainer.destroy).toHaveBeenCalled();
      });
    });
  });
});
```

### 4.2 レシピ選択テスト

```typescript
describe('レシピ選択', () => {
  describe('TC-011: レシピクリックで選択状態になる', () => {
    // 【テスト目的】: レシピをクリックした際に選択状態が変更されることを確認
    // 【対応要件】: FR-011
    // 🔵 信頼性レベル: requirements.md セクション2.1.2 FR-011に明記

    it('TC-011: レシピクリックで選択状態が変更される', () => {
      // Given: AlchemyPhaseUIが初期化済み、レシピ一覧が表示されている
      const { scene } = createMockScene();
      const alchemyService = createMockAlchemyService();
      const recipe = createMockRecipe();
      alchemyService.getAvailableRecipes.mockReturnValue([recipe]);
      const ui = new AlchemyPhaseUI(scene, alchemyService);
      ui.create();

      // When: レシピをクリックする（内部メソッドをテスト）
      ui.selectRecipe(recipe.id);

      // Then:
      // - getSelectedRecipe()が選択したレシピIDを返す
      expect(ui.getSelectedRecipeId()).toBe(recipe.id);
    });
  });

  describe('TC-012: レシピ選択時に必要素材情報表示', () => {
    // 【テスト目的】: レシピ選択時に必要素材情報が調合エリアに表示されることを確認
    // 【対応要件】: FR-012
    // 🔵 信頼性レベル: requirements.md セクション2.1.2 FR-012に明記

    it('TC-012: レシピ選択で必要素材情報が表示される', () => {
      // Given: AlchemyPhaseUIが初期化済み
      const { scene } = createMockScene();
      const alchemyService = createMockAlchemyService();
      const recipe = createMockRecipe({
        requiredMaterials: [
          { materialId: 'mat-001', quantity: 2 },
          { materialId: 'mat-002', quantity: 1 },
        ],
      });
      alchemyService.getAvailableRecipes.mockReturnValue([recipe]);
      const ui = new AlchemyPhaseUI(scene, alchemyService);
      ui.create();

      // When: レシピを選択する
      ui.selectRecipe(recipe.id);

      // Then:
      // - 必要素材スロット数が正しい（2種類 = 3スロット）
      expect(ui.getMaterialSlotCount()).toBe(3);
    });
  });
});
```

### 4.3 素材選択テスト

```typescript
describe('素材選択', () => {
  describe('TC-020: 所持素材クリックでスロット配置', () => {
    // 【テスト目的】: 所持素材をクリックした際にスロットに配置されることを確認
    // 【対応要件】: FR-020
    // 🔵 信頼性レベル: requirements.md セクション2.1.3 FR-020に明記

    it('TC-020: 所持素材クリックでスロットに配置される', () => {
      // Given: AlchemyPhaseUIが初期化済み、レシピが選択済み
      const { scene } = createMockScene();
      const alchemyService = createMockAlchemyService();
      const recipe = createMockRecipe();
      const material = createMockMaterial();
      alchemyService.getAvailableRecipes.mockReturnValue([recipe]);
      const ui = new AlchemyPhaseUI(scene, alchemyService);
      ui.create();
      ui.setAvailableMaterials([material]);
      ui.selectRecipe(recipe.id);

      // When: 素材を選択する
      ui.selectMaterial(material.instanceId);

      // Then:
      // - スロットに素材が配置される
      expect(ui.getPlacedMaterials()).toContainEqual(
        expect.objectContaining({ instanceId: material.instanceId })
      );
    });
  });

  describe('TC-023: 素材配置時に品質プレビュー更新', () => {
    // 【テスト目的】: 素材配置時に品質プレビューが更新されることを確認
    // 【対応要件】: FR-023
    // 🔵 信頼性レベル: requirements.md セクション2.1.3 FR-023に明記

    it('TC-023: 素材配置でpreviewQuality()が呼び出される', () => {
      // Given: AlchemyPhaseUIが初期化済み、レシピが選択済み
      const { scene } = createMockScene();
      const alchemyService = createMockAlchemyService();
      const recipe = createMockRecipe();
      const material = createMockMaterial();
      alchemyService.getAvailableRecipes.mockReturnValue([recipe]);
      alchemyService.previewQuality.mockReturnValue('A');
      const ui = new AlchemyPhaseUI(scene, alchemyService);
      ui.create();
      ui.setAvailableMaterials([material]);
      ui.selectRecipe(recipe.id);

      // When: 素材を配置する
      ui.selectMaterial(material.instanceId);

      // Then:
      // - alchemyService.previewQuality()が呼び出される
      expect(alchemyService.previewQuality).toHaveBeenCalledWith(
        recipe.id,
        expect.any(Array)
      );
    });
  });
});
```

### 4.4 調合実行テスト

```typescript
describe('調合実行', () => {
  describe('TC-040: 調合ボタンでcraft()呼び出し', () => {
    // 【テスト目的】: 調合ボタンクリック時にalchemyService.craft()が呼び出されることを確認
    // 【対応要件】: FR-040
    // 🔵 信頼性レベル: requirements.md セクション2.1.5 FR-040に明記

    it('TC-040: 調合ボタンクリックでcraft()が呼び出される', () => {
      // Given: AlchemyPhaseUIが初期化済み、レシピ選択済み、素材配置済み
      const { scene } = createMockScene();
      const alchemyService = createMockAlchemyService();
      const recipe = createMockRecipe();
      const material = createMockMaterial();
      const craftedItem = createMockItem();
      alchemyService.getAvailableRecipes.mockReturnValue([recipe]);
      alchemyService.canCraft.mockReturnValue(true);
      alchemyService.craft.mockReturnValue(craftedItem);
      const ui = new AlchemyPhaseUI(scene, alchemyService);
      ui.create();
      ui.setAvailableMaterials([material]);
      ui.selectRecipe(recipe.id);
      ui.selectMaterial(material.instanceId);

      // When: 調合を実行する
      ui.executeCraft();

      // Then:
      // - alchemyService.craft()が呼び出される
      expect(alchemyService.craft).toHaveBeenCalledWith(
        recipe.id,
        expect.any(Array)
      );
    });
  });

  describe('TC-041: 調合成功時のコールバック通知', () => {
    // 【テスト目的】: 調合成功時にItemInstanceがコールバックで通知されることを確認
    // 【対応要件】: FR-041
    // 🔵 信頼性レベル: requirements.md セクション2.1.5 FR-041に明記

    it('TC-041: 調合成功でコールバックにItemInstanceが渡される', () => {
      // Given: AlchemyPhaseUIが初期化済み、コールバック関数が設定済み
      const { scene } = createMockScene();
      const alchemyService = createMockAlchemyService();
      const recipe = createMockRecipe();
      const material = createMockMaterial();
      const craftedItem = createMockItem();
      const onCraftComplete = vi.fn();
      alchemyService.getAvailableRecipes.mockReturnValue([recipe]);
      alchemyService.canCraft.mockReturnValue(true);
      alchemyService.craft.mockReturnValue(craftedItem);
      const ui = new AlchemyPhaseUI(scene, alchemyService, onCraftComplete);
      ui.create();
      ui.setAvailableMaterials([material]);
      ui.selectRecipe(recipe.id);
      ui.selectMaterial(material.instanceId);

      // When: 調合を実行する
      ui.executeCraft();

      // Then:
      // - onCraftCompleteがItemInstanceと共に呼び出される
      expect(onCraftComplete).toHaveBeenCalledWith(craftedItem);
    });
  });
});
```

### 4.5 調合ボタン状態テスト

```typescript
describe('調合ボタン状態', () => {
  describe('TC-050: 素材充足時にボタン有効', () => {
    // 【テスト目的】: 必要素材が揃っている時に調合ボタンが有効になることを確認
    // 【対応要件】: FR-050
    // 🔵 信頼性レベル: requirements.md セクション2.1.6 FR-050に明記

    it('TC-050: 素材充足時に調合ボタンが有効になる', () => {
      // Given: AlchemyPhaseUIが初期化済み、レシピ選択済み
      const { scene } = createMockScene();
      const alchemyService = createMockAlchemyService();
      const recipe = createMockRecipe();
      const material = createMockMaterial();
      alchemyService.getAvailableRecipes.mockReturnValue([recipe]);
      alchemyService.canCraft.mockReturnValue(true);
      const ui = new AlchemyPhaseUI(scene, alchemyService);
      ui.create();
      ui.setAvailableMaterials([material]);
      ui.selectRecipe(recipe.id);
      ui.selectMaterial(material.instanceId);

      // When: canCraftがtrueを返す
      // Then:
      // - isCraftButtonEnabled()がtrueを返す
      expect(ui.isCraftButtonEnabled()).toBe(true);
    });
  });

  describe('TC-051: 素材不足時にボタン無効', () => {
    // 【テスト目的】: 必要素材が不足時に調合ボタンが無効になることを確認
    // 【対応要件】: FR-051
    // 🔵 信頼性レベル: requirements.md セクション2.1.6 FR-051に明記

    it('TC-051: 素材不足時に調合ボタンが無効になる', () => {
      // Given: AlchemyPhaseUIが初期化済み、レシピ選択済み、素材未配置
      const { scene } = createMockScene();
      const alchemyService = createMockAlchemyService();
      const recipe = createMockRecipe();
      alchemyService.getAvailableRecipes.mockReturnValue([recipe]);
      alchemyService.canCraft.mockReturnValue(false);
      const ui = new AlchemyPhaseUI(scene, alchemyService);
      ui.create();
      ui.selectRecipe(recipe.id);

      // When: canCraftがfalseを返す
      // Then:
      // - isCraftButtonEnabled()がfalseを返す
      expect(ui.isCraftButtonEnabled()).toBe(false);
    });
  });

  describe('TC-052: レシピ未選択時にボタン無効', () => {
    // 【テスト目的】: レシピ未選択時に調合ボタンが無効になることを確認
    // 【対応要件】: FR-052
    // 🔵 信頼性レベル: requirements.md セクション2.1.6 FR-052に明記

    it('TC-052: レシピ未選択時に調合ボタンが無効になる', () => {
      // Given: AlchemyPhaseUIが初期化済み、レシピ未選択
      const { scene } = createMockScene();
      const alchemyService = createMockAlchemyService();
      const ui = new AlchemyPhaseUI(scene, alchemyService);
      ui.create();

      // When: レシピが選択されていない
      // Then:
      // - isCraftButtonEnabled()がfalseを返す
      expect(ui.isCraftButtonEnabled()).toBe(false);
    });
  });
});
```

---

## 5. 異常系テストケース詳細

```typescript
describe('異常系', () => {
  describe('TC-200: sceneがnullの場合', () => {
    // 【テスト目的】: sceneがnullの場合にエラーがスローされることを確認
    // 【対応要件】: FR-202
    // 🔵 信頼性レベル: requirements.md セクション2.3 FR-202に明記

    it('TC-200: sceneがnullでエラーがスローされる', () => {
      // Given: sceneがnull
      const alchemyService = createMockAlchemyService();

      // When & Then: エラーがスローされる
      expect(() => new AlchemyPhaseUI(null as unknown as Phaser.Scene, alchemyService))
        .toThrow(/scene/i);
    });
  });

  describe('TC-201: sceneがundefinedの場合', () => {
    // 【テスト目的】: sceneがundefinedの場合にエラーがスローされることを確認
    // 【対応要件】: FR-202
    // 🔵 信頼性レベル: requirements.md セクション2.3 FR-202に明記

    it('TC-201: sceneがundefinedでエラーがスローされる', () => {
      // Given: sceneがundefined
      const alchemyService = createMockAlchemyService();

      // When & Then: エラーがスローされる
      expect(() => new AlchemyPhaseUI(undefined as unknown as Phaser.Scene, alchemyService))
        .toThrow(/scene/i);
    });
  });

  describe('TC-202: IAlchemyServiceがnullの場合', () => {
    // 【テスト目的】: IAlchemyServiceがnullの場合にエラーがスローされることを確認
    // 【対応要件】: FR-203
    // 🟡 信頼性レベル: requirements.md セクション2.3 FR-203に明記

    it('TC-202: alchemyServiceがnullでエラーがスローされる', () => {
      // Given: alchemyServiceがnull
      const { scene } = createMockScene();

      // When & Then: エラーがスローされる
      expect(() => new AlchemyPhaseUI(scene, null as unknown as IAlchemyService))
        .toThrow(/alchemyService/i);
    });
  });

  describe('TC-203: 存在しないレシピID選択', () => {
    // 【テスト目的】: 存在しないレシピIDが指定された場合にエラーログが出力されることを確認
    // 【対応要件】: FR-200
    // 🔵 信頼性レベル: requirements.md セクション2.3 FR-200に明記

    it('TC-203: 存在しないレシピIDでエラーログが出力される', () => {
      // Given: AlchemyPhaseUIが初期化済み、console.errorをモック
      const { scene } = createMockScene();
      const alchemyService = createMockAlchemyService();
      const ui = new AlchemyPhaseUI(scene, alchemyService);
      ui.create();
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // When: 存在しないレシピIDを選択する
      ui.selectRecipe('non-existent-recipe');

      // Then:
      // - console.errorが呼び出される
      expect(errorSpy).toHaveBeenCalled();
      // - 選択状態は変更されない
      expect(ui.getSelectedRecipeId()).toBeNull();

      errorSpy.mockRestore();
    });
  });

  describe('TC-204: 素材不足での調合試行', () => {
    // 【テスト目的】: 素材不足時に調合が実行されないことを確認
    // 【対応要件】: FR-201
    // 🔵 信頼性レベル: requirements.md セクション2.3 FR-201に明記

    it('TC-204: 素材不足時にcraft()が呼び出されない', () => {
      // Given: AlchemyPhaseUIが初期化済み、素材不足状態
      const { scene } = createMockScene();
      const alchemyService = createMockAlchemyService();
      const recipe = createMockRecipe();
      alchemyService.getAvailableRecipes.mockReturnValue([recipe]);
      alchemyService.canCraft.mockReturnValue(false);
      const ui = new AlchemyPhaseUI(scene, alchemyService);
      ui.create();
      ui.selectRecipe(recipe.id);

      // When: 調合を試みる
      ui.executeCraft();

      // Then:
      // - craft()は呼び出されない
      expect(alchemyService.craft).not.toHaveBeenCalled();
    });
  });
});
```

---

## 6. 境界値テストケース詳細

```typescript
describe('境界値', () => {
  describe('TC-300: 空のレシピリスト', () => {
    // 【テスト目的】: レシピリストが空の場合の動作を確認
    // 【対応要件】: 境界値テスト（レシピリスト）
    // 🔵 信頼性レベル: requirements.md セクション5.1に明記

    it('TC-300: 空のレシピリストでも正常に表示される', () => {
      // Given: AlchemyPhaseUIが初期化、レシピ0件
      const { scene } = createMockScene();
      const alchemyService = createMockAlchemyService();
      alchemyService.getAvailableRecipes.mockReturnValue([]);
      const ui = new AlchemyPhaseUI(scene, alchemyService);

      // When: create()を呼び出す
      ui.create();

      // Then:
      // - エラーなく表示される
      expect(ui.getRecipeCount()).toBe(0);
    });
  });

  describe('TC-301: レシピ1件', () => {
    // 【テスト目的】: レシピ1件の場合の動作を確認
    // 【対応要件】: 境界値テスト（レシピリスト）
    // 🔵 信頼性レベル: requirements.md セクション5.1に明記

    it('TC-301: レシピ1件で正常に表示・選択できる', () => {
      // Given: AlchemyPhaseUIが初期化、レシピ1件
      const { scene } = createMockScene();
      const alchemyService = createMockAlchemyService();
      const recipe = createMockRecipe();
      alchemyService.getAvailableRecipes.mockReturnValue([recipe]);
      const ui = new AlchemyPhaseUI(scene, alchemyService);
      ui.create();

      // When: レシピを選択する
      ui.selectRecipe(recipe.id);

      // Then:
      // - 正常に選択される
      expect(ui.getSelectedRecipeId()).toBe(recipe.id);
    });
  });

  describe('TC-302: レシピ最大件数（20件）', () => {
    // 【テスト目的】: レシピ最大件数の場合の動作を確認
    // 【対応要件】: 境界値テスト（レシピリスト）
    // 🟡 信頼性レベル: requirements.md セクション5.1に明記

    it('TC-302: レシピ20件で正常に表示される', () => {
      // Given: AlchemyPhaseUIが初期化、レシピ20件
      const { scene } = createMockScene();
      const alchemyService = createMockAlchemyService();
      const recipes = Array.from({ length: 20 }, (_, i) =>
        createMockRecipe({ id: `recipe-${i}` as CardId, name: `レシピ${i}` })
      );
      alchemyService.getAvailableRecipes.mockReturnValue(recipes);
      const ui = new AlchemyPhaseUI(scene, alchemyService);

      // When: create()を呼び出す
      ui.create();

      // Then:
      // - 20件すべて表示される
      expect(ui.getRecipeCount()).toBe(20);
    });
  });

  describe('TC-303: 素材0件', () => {
    // 【テスト目的】: 所持素材が0件の場合の動作を確認
    // 【対応要件】: 境界値テスト（素材選択）
    // 🔵 信頼性レベル: requirements.md セクション5.2に明記

    it('TC-303: 素材0件でエラーなく表示される', () => {
      // Given: AlchemyPhaseUIが初期化、素材0件
      const { scene } = createMockScene();
      const alchemyService = createMockAlchemyService();
      const ui = new AlchemyPhaseUI(scene, alchemyService);
      ui.create();
      ui.setAvailableMaterials([]);

      // When & Then:
      // - エラーなく動作する
      expect(ui.getAvailableMaterialCount()).toBe(0);
    });
  });

  describe('TC-304: 最低品質（D）の素材', () => {
    // 【テスト目的】: D品質素材での品質プレビューを確認
    // 【対応要件】: 境界値テスト（品質）
    // 🔵 信頼性レベル: requirements.md セクション5.3に明記

    it('TC-304: D品質素材でD品質プレビューが表示される', () => {
      // Given: AlchemyPhaseUIが初期化、D品質素材
      const { scene } = createMockScene();
      const alchemyService = createMockAlchemyService();
      const recipe = createMockRecipe();
      const material = createMockMaterial({ quality: 'D' });
      alchemyService.getAvailableRecipes.mockReturnValue([recipe]);
      alchemyService.previewQuality.mockReturnValue('D');
      const ui = new AlchemyPhaseUI(scene, alchemyService);
      ui.create();
      ui.setAvailableMaterials([material]);
      ui.selectRecipe(recipe.id);
      ui.selectMaterial(material.instanceId);

      // When & Then:
      // - D品質がプレビューされる
      expect(alchemyService.previewQuality).toHaveBeenCalled();
    });
  });

  describe('TC-305: 最高品質（S）の素材', () => {
    // 【テスト目的】: S品質素材での品質プレビューを確認
    // 【対応要件】: 境界値テスト（品質）
    // 🔵 信頼性レベル: requirements.md セクション5.3に明記

    it('TC-305: S品質素材でS品質プレビューが表示される', () => {
      // Given: AlchemyPhaseUIが初期化、S品質素材
      const { scene } = createMockScene();
      const alchemyService = createMockAlchemyService();
      const recipe = createMockRecipe();
      const material = createMockMaterial({ quality: 'S' });
      alchemyService.getAvailableRecipes.mockReturnValue([recipe]);
      alchemyService.previewQuality.mockReturnValue('S');
      const ui = new AlchemyPhaseUI(scene, alchemyService);
      ui.create();
      ui.setAvailableMaterials([material]);
      ui.selectRecipe(recipe.id);
      ui.selectMaterial(material.instanceId);

      // When & Then:
      // - S品質がプレビューされる
      expect(alchemyService.previewQuality).toHaveBeenCalled();
    });
  });
});
```

---

## 7. RecipeListUI テストケース詳細

```typescript
describe('RecipeListUI', () => {
  describe('初期化', () => {
    describe('TC-100: BaseComponent継承', () => {
      // 【テスト目的】: RecipeListUIがBaseComponentを継承して正常に初期化されることを確認
      // 【対応要件】: FR-100
      // 🔵 信頼性レベル: requirements.md セクション2.2.1 FR-100に明記

      it('TC-100: コンストラクタで正常にインスタンスが作成される', () => {
        // Given: 有効なPhaserシーンモックとレシピ配列
        const { scene } = createMockScene();
        const recipes = [createMockRecipe()];

        // When: RecipeListUIをインスタンス化する
        const ui = new RecipeListUI(scene, 0, 0, recipes);

        // Then:
        // - インスタンスが正常に作成される
        expect(ui).toBeDefined();
        expect(ui).toBeInstanceOf(RecipeListUI);
      });
    });

    describe('TC-102: 選択コールバックの設定', () => {
      // 【テスト目的】: 選択時コールバックがオプションで設定できることを確認
      // 【対応要件】: FR-102
      // 🔵 信頼性レベル: requirements.md セクション2.2.1 FR-102に明記

      it('TC-102: onSelectコールバックがオプションで設定できる', () => {
        // Given: 有効なPhaserシーンモック、レシピ配列、コールバック関数
        const { scene } = createMockScene();
        const recipes = [createMockRecipe()];
        const onSelect = vi.fn();

        // When: コールバック付きでRecipeListUIをインスタンス化する
        const ui = new RecipeListUI(scene, 0, 0, recipes, onSelect);

        // Then:
        // - エラーなくインスタンスが作成される
        expect(ui).toBeDefined();
      });
    });
  });

  describe('選択状態', () => {
    describe('TC-121: コールバック呼び出し', () => {
      // 【テスト目的】: レシピクリック時にコールバック関数が呼び出されることを確認
      // 【対応要件】: FR-121
      // 🔵 信頼性レベル: requirements.md セクション2.2.3 FR-121に明記

      it('TC-121: レシピクリックでコールバックが呼び出される', () => {
        // Given: RecipeListUIが初期化済み、コールバック設定済み
        const { scene } = createMockScene();
        const recipe = createMockRecipe();
        const recipes = [recipe];
        const onSelect = vi.fn();
        const ui = new RecipeListUI(scene, 0, 0, recipes, onSelect);
        ui.create();

        // When: レシピを選択する
        ui.selectRecipe(recipe.id);

        // Then:
        // - onSelectがレシピと共に呼び出される
        expect(onSelect).toHaveBeenCalledWith(recipe);
      });
    });

    describe('TC-122: 選択解除', () => {
      // 【テスト目的】: 新しいレシピ選択時に以前の選択が解除されることを確認
      // 【対応要件】: FR-122
      // 🔵 信頼性レベル: requirements.md セクション2.2.3 FR-122に明記

      it('TC-122: 新しいレシピ選択で以前の選択が解除される', () => {
        // Given: RecipeListUIが初期化済み、レシピ1が選択済み
        const { scene } = createMockScene();
        const recipe1 = createMockRecipe({ id: 'recipe-1' as CardId, name: 'レシピ1' });
        const recipe2 = createMockRecipe({ id: 'recipe-2' as CardId, name: 'レシピ2' });
        const recipes = [recipe1, recipe2];
        const ui = new RecipeListUI(scene, 0, 0, recipes);
        ui.create();
        ui.selectRecipe(recipe1.id);

        // When: レシピ2を選択する
        ui.selectRecipe(recipe2.id);

        // Then:
        // - 選択中のレシピがレシピ2になる
        expect(ui.getSelectedRecipeId()).toBe(recipe2.id);
        // - レシピ1は選択解除される（isSelected(recipe1.id)がfalse）
        expect(ui.isSelected(recipe1.id)).toBe(false);
      });
    });
  });
});
```

---

## 8. 統合テストケース

```typescript
describe('統合テスト', () => {
  describe('TC-400: 完全な調合フロー', () => {
    // 【テスト目的】: レシピ選択→素材選択→調合実行の一連の流れが正常に動作することを確認
    // 【対応要件】: 統合テスト

    it('TC-400: レシピ選択→素材選択→調合実行が正常に動作する', () => {
      // Given: AlchemyPhaseUIが初期化済み
      const { scene } = createMockScene();
      const alchemyService = createMockAlchemyService();
      const recipe = createMockRecipe();
      const material = createMockMaterial();
      const craftedItem = createMockItem();
      const onCraftComplete = vi.fn();

      alchemyService.getAvailableRecipes.mockReturnValue([recipe]);
      alchemyService.canCraft.mockReturnValue(true);
      alchemyService.previewQuality.mockReturnValue('B');
      alchemyService.craft.mockReturnValue(craftedItem);

      const ui = new AlchemyPhaseUI(scene, alchemyService, onCraftComplete);
      ui.create();
      ui.setAvailableMaterials([material]);

      // Step 1: レシピ選択
      ui.selectRecipe(recipe.id);
      expect(ui.getSelectedRecipeId()).toBe(recipe.id);

      // Step 2: 素材選択
      ui.selectMaterial(material.instanceId);
      expect(ui.getPlacedMaterials()).toHaveLength(1);

      // Step 3: 調合実行
      ui.executeCraft();
      expect(alchemyService.craft).toHaveBeenCalled();
      expect(onCraftComplete).toHaveBeenCalledWith(craftedItem);

      // Step 4: 状態リセット確認
      expect(ui.getPlacedMaterials()).toHaveLength(0);
    });
  });

  describe('TC-401: 調合キャンセルフロー', () => {
    // 【テスト目的】: レシピ選択→素材選択→キャンセル（素材取り除き）の流れを確認

    it('TC-401: 素材取り除きでプレビューがリセットされる', () => {
      // Given: AlchemyPhaseUIが初期化済み、素材配置済み
      const { scene } = createMockScene();
      const alchemyService = createMockAlchemyService();
      const recipe = createMockRecipe();
      const material = createMockMaterial();

      alchemyService.getAvailableRecipes.mockReturnValue([recipe]);
      alchemyService.previewQuality.mockReturnValue('B');

      const ui = new AlchemyPhaseUI(scene, alchemyService);
      ui.create();
      ui.setAvailableMaterials([material]);
      ui.selectRecipe(recipe.id);
      ui.selectMaterial(material.instanceId);

      // When: 素材を取り除く
      ui.removeMaterial(material.instanceId);

      // Then:
      // - 素材が取り除かれる
      expect(ui.getPlacedMaterials()).toHaveLength(0);
      // - 調合ボタンが無効になる
      expect(ui.isCraftButtonEnabled()).toBe(false);
    });
  });

  describe('TC-402: 初期化→使用→破棄→再初期化', () => {
    // 【テスト目的】: ライフサイクル全体が正常に機能することを確認

    it('TC-402: ライフサイクル全体が正常に動作する', () => {
      // Given: 2つのシーンモック
      const mocks1 = createMockScene();
      const mocks2 = createMockScene();
      const alchemyService = createMockAlchemyService();

      // Step 1: 初期化
      const ui1 = new AlchemyPhaseUI(mocks1.scene, alchemyService);
      ui1.create();

      // Step 2: 使用
      const recipe = createMockRecipe();
      alchemyService.getAvailableRecipes.mockReturnValue([recipe]);
      ui1.selectRecipe(recipe.id);

      // Step 3: 破棄
      ui1.destroy();
      expect(mocks1.mockContainer.destroy).toHaveBeenCalled();

      // Step 4: 再初期化（新しいシーンで）
      const ui2 = new AlchemyPhaseUI(mocks2.scene, alchemyService);
      ui2.create();
      expect(ui2).toBeDefined();
    });
  });
});
```

---

## 9. テスト実行コマンド

```bash
# AlchemyPhaseUIテスト実行
cd atelier-guild-rank && pnpm test tests/unit/presentation/alchemy-phase-ui.test.ts

# ウォッチモードで実行
cd atelier-guild-rank && pnpm test:watch tests/unit/presentation/alchemy-phase-ui.test.ts

# カバレッジ付きで実行
cd atelier-guild-rank && pnpm test:coverage tests/unit/presentation/alchemy-phase-ui.test.ts
```

---

## 10. テストケースサマリー

| カテゴリ | テストケース数 | 優先度P0 | 優先度P1 |
|---------|--------------|---------|---------|
| AlchemyPhaseUI 初期化 | 5 | 4 | 1 |
| レシピ一覧表示 | 4 | 4 | 0 |
| 素材選択 | 4 | 2 | 2 |
| 品質プレビュー | 3 | 2 | 1 |
| 調合実行 | 4 | 3 | 1 |
| 調合ボタン状態 | 3 | 3 | 0 |
| RecipeListUI | 6 | 4 | 2 |
| 異常系 | 5 | 5 | 0 |
| 境界値 | 6 | 4 | 2 |
| 統合テスト | 3 | 3 | 0 |
| **合計** | **43** | **34** | **9** |

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|----------|---------|
| 2026-01-21 | 1.0.0 | 初版作成 |
