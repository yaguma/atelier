/**
 * RecipeListUIコンポーネント
 * TASK-0024 調合フェーズUI - レシピリスト
 *
 * @description
 * 調合可能なレシピのリストを表示し、選択を管理するコンポーネント。
 */

import type Phaser from 'phaser';

// =============================================================================
// 定数定義
// =============================================================================

/** レシピリスト配置定数 */
const RECIPE_LIST_LAYOUT = {
  /** レシピアイテムの高さ */
  ITEM_HEIGHT: 30,
  /** レシピアイテムの間隔 */
  ITEM_SPACING: 5,
  /** リストの幅 */
  LIST_WIDTH: 200,
  /** リストの最大表示件数 */
  MAX_VISIBLE_ITEMS: 8,
} as const;

/** スタイル定数 */
const RECIPE_LIST_STYLES = {
  ITEM_DEFAULT: {
    fontSize: '16px',
    color: '#cccccc',
  },
  ITEM_SELECTED: {
    fontSize: '16px',
    color: '#ffff00',
  },
  ITEM_HOVER: {
    fontSize: '16px',
    color: '#ffffff',
  },
  REQUIRED_MATERIALS: {
    fontSize: '12px',
    color: '#999999',
  },
} as const;

/** UIテキスト定数 */
const RECIPE_LIST_TEXT = {
  NO_RECIPES: 'レシピがありません',
  SELECTED_INDICATOR: '▶',
  UNSELECTED_INDICATOR: '▷',
} as const;

/**
 * 品質タイプ
 */
type Quality = 'C' | 'B' | 'A' | 'S';

/**
 * ItemMasterインターフェース
 */
interface ItemMaster {
  id: string;
  name: string;
  category: string;
  baseQuality: Quality;
  requiredMaterials: {
    materialType: string;
    count: number;
  }[];
  tags: string[];
}

/**
 * RecipeListUIコンポーネントのプロパティ
 */
export interface RecipeListUIProps {
  /** レシピのリスト */
  recipes: ItemMaster[];
  /** レシピ選択時のコールバック */
  onRecipeSelect: (recipe: ItemMaster) => void;
  /** 初期選択レシピID（任意） */
  initialSelectedId?: string;
}

/**
 * RecipeItemUIインターフェース
 */
interface RecipeItemUI {
  recipe: ItemMaster;
  container: Phaser.GameObjects.Container;
  indicatorText: Phaser.GameObjects.Text;
  nameText: Phaser.GameObjects.Text;
  materialsText: Phaser.GameObjects.Text;
  isSelected: boolean;
  destroy(): void;
}

/**
 * RecipeListUIコンポーネント
 *
 * 調合可能なレシピをリスト表示し、選択を管理する。
 * 各レシピアイテムには、レシピ名と必要素材を表示する。
 */
export class RecipeListUI {
  /** Phaserシーン */
  private scene: Phaser.Scene;

  /** コンテナ */
  private container: Phaser.GameObjects.Container;

  /** レシピアイテムリスト */
  private recipeItems: RecipeItemUI[] = [];

  /** 選択中のレシピID */
  private selectedRecipeId: string | null = null;

  /** レシピ選択コールバック */
  private onRecipeSelectCallback: (recipe: ItemMaster) => void;

  /**
   * コンストラクタ
   * @param scene - Phaserシーン
   * @param x - X座標
   * @param y - Y座標
   * @param props - プロパティ
   */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    props: RecipeListUIProps,
  ) {
    this.scene = scene;
    this.container = scene.add.container(x, y);
    this.onRecipeSelectCallback = props.onRecipeSelect;
    this.selectedRecipeId = props.initialSelectedId || null;

    this.createRecipeItems(props.recipes);
  }

  /**
   * レシピアイテムを作成
   * @param recipes - レシピのリスト
   */
  private createRecipeItems(recipes: ItemMaster[]): void {
    this.destroyRecipeItems();

    if (recipes.length === 0) {
      this.createEmptyMessage();
      return;
    }

    recipes.forEach((recipe, index) => {
      const itemY = index * (RECIPE_LIST_LAYOUT.ITEM_HEIGHT + RECIPE_LIST_LAYOUT.ITEM_SPACING);
      const recipeItem = this.createRecipeItem(recipe, itemY);
      this.recipeItems.push(recipeItem);
      this.container.add(recipeItem.container);
    });
  }

  /**
   * 個別のレシピアイテムを作成
   * @param recipe - レシピ
   * @param y - Y座標
   * @returns レシピアイテムUI
   */
  private createRecipeItem(recipe: ItemMaster, y: number): RecipeItemUI {
    const itemContainer = this.scene.add.container(0, y);

    // 選択インジケーター
    const isSelected = recipe.id === this.selectedRecipeId;
    const indicator = isSelected
      ? RECIPE_LIST_TEXT.SELECTED_INDICATOR
      : RECIPE_LIST_TEXT.UNSELECTED_INDICATOR;

    const indicatorText = this.scene.add.text(
      0,
      0,
      indicator,
      isSelected ? RECIPE_LIST_STYLES.ITEM_SELECTED : RECIPE_LIST_STYLES.ITEM_DEFAULT,
    );
    itemContainer.add(indicatorText);

    // レシピ名
    const nameText = this.scene.add.text(
      20,
      0,
      recipe.name,
      isSelected ? RECIPE_LIST_STYLES.ITEM_SELECTED : RECIPE_LIST_STYLES.ITEM_DEFAULT,
    );
    nameText.setInteractive({ useHandCursor: true });
    itemContainer.add(nameText);

    // 必要素材
    const materialsInfo = this.formatRequiredMaterials(recipe);
    const materialsText = this.scene.add.text(
      30,
      18,
      materialsInfo,
      RECIPE_LIST_STYLES.REQUIRED_MATERIALS,
    );
    itemContainer.add(materialsText);

    // インタラクション設定
    this.setupItemInteraction(nameText, recipe);

    const recipeItem: RecipeItemUI = {
      recipe,
      container: itemContainer,
      indicatorText,
      nameText,
      materialsText,
      isSelected,
      destroy: () => itemContainer.destroy(),
    };

    return recipeItem;
  }

  /**
   * 必要素材を文字列にフォーマット
   * @param recipe - レシピ
   * @returns フォーマットされた素材文字列
   */
  private formatRequiredMaterials(recipe: ItemMaster): string {
    return recipe.requiredMaterials
      .map((rm) => `${rm.materialType}×${rm.count}`)
      .join(', ');
  }

  /**
   * アイテムのインタラクションを設定
   * @param text - テキストオブジェクト
   * @param recipe - レシピ
   */
  private setupItemInteraction(
    text: Phaser.GameObjects.Text,
    recipe: ItemMaster,
  ): void {
    // ホバー時
    text.on('pointerover', () => {
      if (recipe.id !== this.selectedRecipeId) {
        text.setStyle(RECIPE_LIST_STYLES.ITEM_HOVER);
      }
    });

    // ホバー解除時
    text.on('pointerout', () => {
      if (recipe.id !== this.selectedRecipeId) {
        text.setStyle(RECIPE_LIST_STYLES.ITEM_DEFAULT);
      }
    });

    // クリック時
    text.on('pointerdown', () => {
      this.selectRecipe(recipe);
    });
  }

  /**
   * レシピを選択
   * @param recipe - 選択するレシピ
   */
  private selectRecipe(recipe: ItemMaster): void {
    // 既に選択されている場合は何もしない
    if (this.selectedRecipeId === recipe.id) {
      return;
    }

    // 以前の選択を解除
    if (this.selectedRecipeId !== null) {
      this.deselectRecipe(this.selectedRecipeId);
    }

    // 新しいレシピを選択
    this.selectedRecipeId = recipe.id;
    this.highlightRecipe(recipe.id);

    // コールバックを呼び出し
    this.onRecipeSelectCallback(recipe);
  }

  /**
   * レシピの選択を解除
   * @param recipeId - レシピID
   */
  private deselectRecipe(recipeId: string): void {
    const item = this.recipeItems.find((item) => item.recipe.id === recipeId);
    if (!item) {
      return;
    }

    item.isSelected = false;
    item.indicatorText.setText(RECIPE_LIST_TEXT.UNSELECTED_INDICATOR);
    item.indicatorText.setStyle(RECIPE_LIST_STYLES.ITEM_DEFAULT);
    item.nameText.setStyle(RECIPE_LIST_STYLES.ITEM_DEFAULT);
  }

  /**
   * レシピをハイライト
   * @param recipeId - レシピID
   */
  private highlightRecipe(recipeId: string): void {
    const item = this.recipeItems.find((item) => item.recipe.id === recipeId);
    if (!item) {
      return;
    }

    item.isSelected = true;
    item.indicatorText.setText(RECIPE_LIST_TEXT.SELECTED_INDICATOR);
    item.indicatorText.setStyle(RECIPE_LIST_STYLES.ITEM_SELECTED);
    item.nameText.setStyle(RECIPE_LIST_STYLES.ITEM_SELECTED);
  }

  /**
   * 空のメッセージを作成
   */
  private createEmptyMessage(): void {
    const emptyText = this.scene.add.text(
      0,
      0,
      RECIPE_LIST_TEXT.NO_RECIPES,
      RECIPE_LIST_STYLES.ITEM_DEFAULT,
    );
    this.container.add(emptyText);
  }

  /**
   * レシピアイテムを全て破棄
   */
  private destroyRecipeItems(): void {
    for (const item of this.recipeItems) {
      item.destroy();
    }
    this.recipeItems = [];
  }

  /**
   * コンテナを取得
   * @returns コンテナ
   */
  public getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  /**
   * 表示/非表示を設定
   * @param visible - 表示するかどうか
   */
  public setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }

  /**
   * 位置を設定
   * @param x - X座標
   * @param y - Y座標
   */
  public setPosition(x: number, y: number): void {
    this.container.setPosition(x, y);
  }

  /**
   * レシピリストを更新
   * @param recipes - 新しいレシピのリスト
   */
  public updateRecipes(recipes: ItemMaster[]): void {
    this.createRecipeItems(recipes);
  }

  /**
   * リソース解放
   */
  public destroy(): void {
    this.destroyRecipeItems();
    this.container.destroy();
  }
}
