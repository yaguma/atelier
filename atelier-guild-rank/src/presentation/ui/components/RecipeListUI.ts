/**
 * RecipeListUIコンポーネント
 * TASK-0045 調合フェーズUI実装（再実装）
 *
 * @description
 * レシピリストを縦方向に表示するUIコンポーネント。
 * 選択状態のハイライト表示とコールバック通知を実装。
 */

import type { CardId } from '@shared/types';
import type { IRecipeCardMaster } from '@shared/types/master-data';
import type Phaser from 'phaser';
import { THEME } from '../theme';
import { BaseComponent } from './BaseComponent';

/** レシピリストUIレイアウト定数 */
const RECIPE_LIST_LAYOUT = {
  /** アイテム高さ */
  ITEM_HEIGHT: 50,
  /** アイテム幅 */
  ITEM_WIDTH: 200,
  /** アイテム間スペーシング */
  ITEM_SPACING: 10,
  /** 角丸半径 */
  BORDER_RADIUS: 8,
  /** パディング(水平) */
  PADDING_HORIZONTAL: 10,
  /** パディング(垂直) */
  PADDING_VERTICAL: 5,
} as const;

/** rexUIラベル情報の型定義 */
interface RecipeLabelInfo {
  // biome-ignore lint/suspicious/noExplicitAny: rexUIプラグインは型定義が複雑なため
  label: any;
  // biome-ignore lint/suspicious/noExplicitAny: rexUIプラグインは型定義が複雑なため
  background: any;
  recipe: IRecipeCardMaster;
}

/**
 * RecipeListUIコンポーネント
 *
 * 【責務】:
 * - レシピリストの縦方向表示
 * - 選択状態の管理
 * - 選択時のコールバック通知
 */
export class RecipeListUI extends BaseComponent {
  /** 表示するレシピリスト */
  private recipes: IRecipeCardMaster[];

  /** 選択時コールバック */
  private onSelectCallback?: (recipe: IRecipeCardMaster) => void;

  /** 選択中のレシピID */
  private selectedRecipeId: CardId | null = null;

  /** rexUIラベルリスト */
  private labels: RecipeLabelInfo[] = [];

  /**
   * コンストラクタ
   *
   * @param scene - Phaserシーン
   * @param x - X座標
   * @param y - Y座標
   * @param recipes - レシピリスト
   * @param onSelect - 選択時コールバック（オプション）
   */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    recipes: IRecipeCardMaster[],
    onSelect?: (recipe: IRecipeCardMaster) => void,
  ) {
    super(scene, x, y);
    this.recipes = recipes;
    this.onSelectCallback = onSelect;
  }

  /**
   * UIコンポーネントを作成
   */
  create(): void {
    this.createRecipeList();
  }

  /**
   * レシピリストを作成
   */
  private createRecipeList(): void {
    this.recipes.forEach((recipe, index) => {
      const y = index * (RECIPE_LIST_LAYOUT.ITEM_HEIGHT + RECIPE_LIST_LAYOUT.ITEM_SPACING);
      const labelInfo = this.createRecipeLabel(recipe, 0, y);
      this.labels.push(labelInfo);
    });
  }

  /**
   * 単一レシピラベルを作成
   *
   * @param recipe - レシピデータ
   * @param x - X座標
   * @param y - Y座標
   * @returns レシピラベル情報
   */
  private createRecipeLabel(recipe: IRecipeCardMaster, x: number, y: number): RecipeLabelInfo {
    // 背景（rexUI roundRectangle）
    const background = this.rexUI.add
      .roundRectangle({
        width: RECIPE_LIST_LAYOUT.ITEM_WIDTH,
        height: RECIPE_LIST_LAYOUT.ITEM_HEIGHT,
        radius: RECIPE_LIST_LAYOUT.BORDER_RADIUS,
      })
      .setFillStyle(THEME.colors.secondary);

    // テキスト
    const textObj = this.scene.add.text(0, 0, recipe.name, {
      fontSize: `${THEME.sizes.medium}px`,
      color: THEME.colors.textOnSecondary,
      fontFamily: THEME.fonts.primary,
    });

    // rexUI Label
    const label = this.rexUI.add.label({
      background,
      text: textObj,
      align: 'center',
      space: {
        left: RECIPE_LIST_LAYOUT.PADDING_HORIZONTAL,
        right: RECIPE_LIST_LAYOUT.PADDING_HORIZONTAL,
        top: RECIPE_LIST_LAYOUT.PADDING_VERTICAL,
        bottom: RECIPE_LIST_LAYOUT.PADDING_VERTICAL,
      },
    });

    // 位置設定
    this.setLabelPosition(label, x, y);

    // インタラクション設定
    this.setupLabelInteraction(label, recipe.id);

    return { label, background, recipe };
  }

  /**
   * ラベルの位置を設定
   *
   * @param label - rexUIラベル
   * @param x - X座標
   * @param y - Y座標
   */
  // biome-ignore lint/suspicious/noExplicitAny: rexUIプラグインは型定義が複雑なため
  private setLabelPosition(label: any, x: number, y: number): void {
    if (typeof label.setPosition === 'function') {
      label.setPosition(x, y);
    } else {
      label.x = x;
      label.y = y;
    }
  }

  /**
   * ラベルのインタラクションを設定
   *
   * @param label - rexUIラベル
   * @param recipeId - レシピID
   */
  // biome-ignore lint/suspicious/noExplicitAny: rexUIプラグインは型定義が複雑なため
  private setupLabelInteraction(label: any, recipeId: CardId): void {
    if (typeof label.setInteractive === 'function') {
      label.setInteractive();
    }

    if (typeof label.on === 'function') {
      label.on('pointerdown', () => {
        this.selectRecipe(recipeId);
      });
    }

    if (typeof label.layout === 'function') {
      label.layout();
    }
  }

  /**
   * レシピを選択
   *
   * @param recipeId - レシピID
   */
  selectRecipe(recipeId: CardId): void {
    // 既存の選択を解除
    this.clearSelection();

    // 選択状態を更新
    this.selectedRecipeId = recipeId;

    // 選択したレシピのハイライト
    const selectedItem = this.labels.find((item) => item.recipe.id === recipeId);
    if (selectedItem) {
      selectedItem.background.setFillStyle(THEME.colors.primary);

      // コールバック呼び出し
      if (this.onSelectCallback) {
        this.onSelectCallback(selectedItem.recipe);
      }
    }
  }

  /**
   * 選択をクリア
   */
  private clearSelection(): void {
    // すべてのラベルを通常色に戻す
    for (const item of this.labels) {
      item.background.setFillStyle(THEME.colors.secondary);
    }
  }

  /**
   * レシピ数を取得
   *
   * @returns レシピ数
   */
  getRecipeCount(): number {
    return this.recipes.length;
  }

  /**
   * 選択中のレシピIDを取得
   *
   * @returns 選択中のレシピID、未選択の場合はnull
   */
  getSelectedRecipeId(): CardId | null {
    return this.selectedRecipeId;
  }

  /**
   * 指定レシピが選択されているか確認
   *
   * @param recipeId - レシピID
   * @returns 選択されている場合true
   */
  isSelected(recipeId: CardId): boolean {
    return this.selectedRecipeId === recipeId;
  }

  /**
   * レシピ情報を取得
   *
   * @param recipeId - レシピID
   * @returns レシピ情報、存在しない場合はnull
   */
  getRecipeInfo(recipeId: CardId): IRecipeCardMaster | null {
    return this.recipes.find((r) => r.id === recipeId) ?? null;
  }

  /**
   * コンポーネントを破棄
   */
  destroy(): void {
    for (const item of this.labels) {
      item.label.destroy();
    }
    this.labels = [];
    this.container.destroy();
  }
}
