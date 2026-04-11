/** レシピグリッド表示・選択・キーボードナビ (Issue #459) */

import type { MaterialInstance } from '@domain/entities/MaterialInstance';
import type { IAlchemyService } from '@domain/interfaces/alchemy-service.interface';
import type { RexRoundRectangle, RexUIPlugin } from '@presentation/types/rexui';
import { THEME } from '@presentation/ui/theme';
import { ScrollableContainer } from '@shared/components/ScrollableContainer';
import { MAIN_LAYOUT } from '@shared/constants';
import { getSelectionIndexFromKey, isKeyForAction } from '@shared/constants/keybindings';
import type { CardId } from '@shared/types';
import type { IRecipeCardMaster } from '@shared/types/master-data';
import type Phaser from 'phaser';

const LAYOUT = {
  RECIPE_LIST_START_Y: 80,
  RECIPE_LIST_OFFSET_X: 20,
  ITEM_HEIGHT: 30,
  ITEM_WIDTH: 200,
  ITEM_SPACING: 12,
  GRID_COLUMNS: 3,
  GRID_MARGIN_X: 16,
  BORDER_RADIUS: 8,
  PADDING_HORIZONTAL: 10,
  PADDING_VERTICAL: 5,
  MATERIAL_LINE_HEIGHT: 22,
  MATERIAL_INDENT: 30,
  SCROLL_SPEED: 0.5,
} as const;

export { LAYOUT as ALCHEMY_GRID_LAYOUT };

export interface RecipeLabelInfo {
  cardContainer: Phaser.GameObjects.Container;
  background: RexRoundRectangle;
  nameText: Phaser.GameObjects.Text;
  recipe: IRecipeCardMaster;
  craftable: boolean;
  materialTexts: Phaser.GameObjects.Text[];
}

export interface AlchemyRecipeGridCallbacks {
  onRecipeSelect: (recipeId: CardId) => void;
  onCraftRequest: () => void;
  resolveMaterialName: (materialId: string) => string;
}

export class AlchemyRecipeGrid {
  private recipeLabels: RecipeLabelInfo[] = [];
  private recipes: IRecipeCardMaster[] = [];
  private focusedRecipeIndex = 0;
  private scrollableContainer: ScrollableContainer | null = null;
  private keyboardHandler: ((event: { key: string }) => void) | null = null;

  constructor(
    private scene: Phaser.Scene,
    private container: Phaser.GameObjects.Container,
    private rexUI: RexUIPlugin,
    private alchemyService: IAlchemyService,
    private callbacks: AlchemyRecipeGridCallbacks,
  ) {}

  create(): void {
    this.createScrollArea();
  }

  loadAndRender(availableMaterials: MaterialInstance[]): void {
    this.resetScroll();
    this.cleanupLabels();
    this.recipes = this.alchemyService.getAllRecipes();
    this.focusedRecipeIndex = 0;
    this.renderRecipeList(availableMaterials);
    this.updateFocus();
  }

  getRecipes(): IRecipeCardMaster[] {
    return this.recipes;
  }
  getRecipeCount(): number {
    return this.recipes.length;
  }
  getLabels(): RecipeLabelInfo[] {
    return this.recipeLabels;
  }

  clearSelection(): void {
    for (const item of this.recipeLabels) {
      const color = item.craftable ? THEME.colors.secondary : 0x3a3a3a;
      item.background.setFillStyle(color);
    }
  }

  highlightRecipe(recipeId: CardId): void {
    const item = this.recipeLabels.find((l) => l.recipe.id === recipeId);
    item?.background.setFillStyle(THEME.colors.primary);
  }

  setupKeyboard(): void {
    this.keyboardHandler = (event: { key: string }) => this.handleKeyInput(event);
    this.scene?.input?.keyboard?.on('keydown', this.keyboardHandler);
  }

  teardownKeyboard(): void {
    if (this.keyboardHandler) {
      this.scene?.input?.keyboard?.off('keydown', this.keyboardHandler);
      this.keyboardHandler = null;
    }
  }

  destroy(): void {
    this.teardownKeyboard();
    this.cleanupLabels();
    this.scrollableContainer?.destroy();
    this.scrollableContainer = null;
  }

  // ======== Private: Rendering ========

  private renderRecipeList(availableMaterials: MaterialInstance[]): void {
    const { GRID_COLUMNS, ITEM_WIDTH, GRID_MARGIN_X, RECIPE_LIST_OFFSET_X, ITEM_SPACING } = LAYOUT;
    const rowMaxHeights = this.calcRowMaxHeights();
    const rowStartY = this.calcRowStartY(rowMaxHeights);

    for (let i = 0; i < this.recipes.length; i++) {
      const recipe = this.recipes[i];
      const col = i % GRID_COLUMNS;
      const row = Math.floor(i / GRID_COLUMNS);
      const check = this.alchemyService.checkRecipeRequirements(recipe.id, availableMaterials);

      const missingMap = new Map<string, number>();
      for (const m of check.missingMaterials) missingMap.set(m.materialId, m.quantity);

      const cardX = RECIPE_LIST_OFFSET_X + col * (ITEM_WIDTH + GRID_MARGIN_X);
      const cardY = rowStartY[row] ?? 0;

      const labelInfo = this.createCard(recipe, cardX, cardY, check.canCraft, missingMap);
      this.recipeLabels.push(labelInfo);
    }

    const totalRows = Math.ceil(this.recipes.length / GRID_COLUMNS);
    const lastRowY = totalRows > 0 ? (rowStartY[totalRows - 1] ?? 0) : 0;
    const lastRowH = totalRows > 0 ? (rowMaxHeights[totalRows - 1] ?? 0) + ITEM_SPACING : 0;
    this.scrollableContainer?.setContentHeight(lastRowY + lastRowH);
    this.resetScroll();
  }

  private createCard(
    recipe: IRecipeCardMaster,
    x: number,
    y: number,
    craftable: boolean,
    missingMap: Map<string, number>,
  ): RecipeLabelInfo {
    const matCount = recipe.requiredMaterials.length;
    const cardH =
      LAYOUT.ITEM_HEIGHT + matCount * LAYOUT.MATERIAL_LINE_HEIGHT + LAYOUT.PADDING_VERTICAL;
    const cardContainer = this.scene.add.container(x, y);

    const bgColor = craftable ? THEME.colors.secondary : 0x3a3a3a;
    const background = this.rexUI.add
      .roundRectangle({ width: LAYOUT.ITEM_WIDTH, height: cardH, radius: LAYOUT.BORDER_RADIUS })
      .setFillStyle(bgColor);
    background.setPosition(LAYOUT.ITEM_WIDTH / 2, cardH / 2);
    cardContainer.add(background);

    const textColor = craftable ? THEME.colors.textOnSecondary : '#cccccc';
    const nameText = this.scene.make.text({
      x: LAYOUT.PADDING_HORIZONTAL,
      y: LAYOUT.PADDING_VERTICAL,
      text: recipe.name,
      style: {
        fontSize: `${THEME.sizes.medium}px`,
        color: textColor,
        fontFamily: THEME.fonts.primary,
        fontStyle: 'bold',
      },
      add: false,
    });
    cardContainer.add(nameText);

    const materialTexts: Phaser.GameObjects.Text[] = [];
    let matY = LAYOUT.ITEM_HEIGHT;
    for (const req of recipe.requiredMaterials) {
      const isMissing = missingMap.has(req.materialId);
      const matColor = isMissing ? '#ff4444' : craftable ? '#e0d0b0' : '#aaaaaa';
      const matText = this.scene.make.text({
        x: LAYOUT.MATERIAL_INDENT,
        y: matY,
        text: `${this.callbacks.resolveMaterialName(req.materialId)}: ${req.quantity}`,
        style: {
          fontSize: `${THEME.sizes.small}px`,
          color: matColor,
          fontFamily: THEME.fonts.primary,
        },
        add: false,
      });
      cardContainer.add(matText);
      materialTexts.push(matText);
      matY += LAYOUT.MATERIAL_LINE_HEIGHT;
    }

    const target = this.scrollableContainer?.getScrollContainer() ?? this.container;
    target.add(cardContainer);

    if (craftable) {
      background.setInteractive();
      background.on('pointerdown', () => this.callbacks.onRecipeSelect(recipe.id));
    }

    return { cardContainer, background, nameText, recipe, craftable, materialTexts };
  }

  // ======== Private: Layout calculations ========

  private calcRowMaxHeights(): number[] {
    const totalRows = Math.ceil(this.recipes.length / LAYOUT.GRID_COLUMNS);
    const heights: number[] = [];
    for (let row = 0; row < totalRows; row++) {
      let max = 0;
      for (let col = 0; col < LAYOUT.GRID_COLUMNS; col++) {
        const idx = row * LAYOUT.GRID_COLUMNS + col;
        if (idx >= this.recipes.length) break;
        const h =
          LAYOUT.ITEM_HEIGHT +
          this.recipes[idx].requiredMaterials.length * LAYOUT.MATERIAL_LINE_HEIGHT +
          LAYOUT.PADDING_VERTICAL;
        if (h > max) max = h;
      }
      heights.push(max);
    }
    return heights;
  }

  private calcRowStartY(rowMaxHeights: number[]): number[] {
    const result: number[] = [];
    let y = LAYOUT.RECIPE_LIST_START_Y;
    for (const h of rowMaxHeights) {
      result.push(y);
      y += h + LAYOUT.ITEM_SPACING;
    }
    return result;
  }

  // ======== Private: Keyboard ========

  private handleKeyInput(event: { key: string }): void {
    const selIdx = getSelectionIndexFromKey(event.key);
    if (selIdx !== null && selIdx <= this.recipes.length) {
      this.focusedRecipeIndex = selIdx - 1;
      this.updateFocus();
      const info = this.recipeLabels[this.focusedRecipeIndex];
      if (info?.craftable) this.callbacks.onRecipeSelect(info.recipe.id);
      return;
    }

    if (isKeyForAction(event.key, 'UP')) this.moveFocus(-LAYOUT.GRID_COLUMNS);
    else if (isKeyForAction(event.key, 'DOWN')) this.moveFocus(LAYOUT.GRID_COLUMNS);
    else if (isKeyForAction(event.key, 'LEFT')) this.moveFocus(-1);
    else if (isKeyForAction(event.key, 'RIGHT')) this.moveFocus(1);
    else if (isKeyForAction(event.key, 'CONFIRM')) {
      this.callbacks.onCraftRequest();
    }
  }

  private moveFocus(delta: number): void {
    if (this.recipes.length === 0) return;
    const newIdx = Math.max(0, Math.min(this.recipes.length - 1, this.focusedRecipeIndex + delta));
    if (newIdx !== this.focusedRecipeIndex) {
      this.focusedRecipeIndex = newIdx;
      this.updateFocus();
    }
  }

  private updateFocus(): void {
    this.recipeLabels.forEach((item, i) => {
      item.cardContainer.setScale(i === this.focusedRecipeIndex ? 1.05 : 1.0);
    });
  }

  // ======== Private: Scroll ========

  private createScrollArea(): void {
    const w = this.scene.cameras.main.width;
    const h = this.scene.cameras.main.height;
    this.scrollableContainer = new ScrollableContainer(this.scene, this.container, {
      maskBounds: {
        x: MAIN_LAYOUT.SIDEBAR_WIDTH,
        y: MAIN_LAYOUT.HEADER_HEIGHT + LAYOUT.RECIPE_LIST_START_Y,
        width: w - MAIN_LAYOUT.SIDEBAR_WIDTH - MAIN_LAYOUT.CONTEXT_PANEL_WIDTH,
        height:
          h - MAIN_LAYOUT.HEADER_HEIGHT - MAIN_LAYOUT.FOOTER_HEIGHT - LAYOUT.RECIPE_LIST_START_Y,
      },
      scrollSpeed: LAYOUT.SCROLL_SPEED,
      isScrollEnabled: () => this.container.visible,
    });
    this.scrollableContainer.create();
  }

  private resetScroll(): void {
    this.scrollableContainer?.resetScroll();
  }

  private cleanupLabels(): void {
    for (const item of this.recipeLabels) {
      if (item.craftable) item.background.off('pointerdown');
      item.cardContainer.destroy(true);
    }
    this.recipeLabels = [];
  }
}
