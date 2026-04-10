/** 調合フェーズUIオーケストレーター (TASK-0045, Issue #459) */

import type { ItemInstance } from '@domain/entities/ItemInstance';
import type { MaterialInstance } from '@domain/entities/MaterialInstance';
import type { IAlchemyService } from '@domain/interfaces/alchemy-service.interface';
import { BaseComponent } from '@presentation/ui/components/BaseComponent';
import { THEME } from '@presentation/ui/theme';
import type { CardId, Quality } from '@shared/types';

import type Phaser from 'phaser';
import { AlchemyCraftPanel } from './AlchemyCraftPanel';
import { AlchemyRecipeGrid } from './AlchemyRecipeGrid';

export class AlchemyPhaseUI extends BaseComponent {
  private alchemyService: IAlchemyService;
  private onCraftCompleteCallback?: (item: ItemInstance) => void;
  private materialNameResolver?: (materialId: string) => string;

  private recipeGrid!: AlchemyRecipeGrid;
  private craftPanel!: AlchemyCraftPanel;

  private selectedRecipeId: CardId | null = null;
  private availableMaterials: MaterialInstance[] = [];
  private placedMaterials: MaterialInstance[] = [];
  private materialSlotCount = 0;
  private qualityPreview: Quality | null = null;

  constructor(
    scene: Phaser.Scene,
    alchemyService: IAlchemyService,
    onCraftComplete?: (item: ItemInstance) => void,
    materialNameResolver?: (materialId: string) => string,
  ) {
    if (!scene) throw new Error('AlchemyPhaseUI: scene is required');
    if (!alchemyService) throw new Error('AlchemyPhaseUI: alchemyService is required');

    super(scene, 0, 0, { addToScene: false });
    this.alchemyService = alchemyService;
    this.onCraftCompleteCallback = onCraftComplete;
    this.materialNameResolver = materialNameResolver;
  }

  create(): void {
    this.createTitle();

    this.recipeGrid = new AlchemyRecipeGrid(
      this.scene,
      this.container,
      this.rexUI,
      this.alchemyService,
      {
        onRecipeSelect: (id) => this.selectRecipe(id),
        onCraftRequest: () => {
          if (this.isCraftButtonEnabled()) this.executeCraft();
          else this.selectFocusedRecipe();
        },
        resolveMaterialName: (id) => this.resolveMaterialName(id),
      },
    );
    this.recipeGrid.create();
    this.recipeGrid.loadAndRender(this.availableMaterials);
    this.recipeGrid.setupKeyboard();

    this.craftPanel = new AlchemyCraftPanel(this.scene, this.container, this.rexUI, {
      onExecuteCraft: () => this.executeCraft(),
    });
    this.craftPanel.create();
  }

  private createTitle(): void {
    const titleText = this.scene.make
      .text({
        x: 440,
        y: 20,
        text: '⚗️ 調合フェーズ',
        style: {
          fontSize: `${THEME.sizes.xlarge}px`,
          color: `#${THEME.colors.text.toString(16).padStart(6, '0')}`,
          fontFamily: THEME.fonts.primary,
          fontStyle: 'bold',
        },
        add: false,
      })
      .setOrigin(0.5);
    this.container.add(titleText);
  }

  // ======== Recipe selection ========

  selectRecipe(recipeId: CardId): void {
    const recipe = this.recipeGrid.getRecipes().find((r) => r.id === recipeId);
    if (!recipe) {
      console.error(`AlchemyPhaseUI: Recipe not found: ${recipeId}`);
      return;
    }

    this.recipeGrid.clearSelection();
    this.selectedRecipeId = recipeId;

    this.recipeGrid.highlightRecipe(recipeId);

    this.materialSlotCount = recipe.requiredMaterials.reduce((s, m) => s + m.quantity, 0);
    this.autoPlaceMaterials(recipeId);
    this.updateCraftButton();
  }

  private selectFocusedRecipe(): void {
    const labels = this.recipeGrid.getLabels();
    // Find currently focused via scale
    const focused = labels.findIndex((l) => {
      const scale = l.cardContainer.scaleX ?? 1;
      return scale > 1;
    });
    if (focused >= 0 && labels[focused]?.craftable) {
      this.selectRecipe(labels[focused].recipe.id);
    }
  }

  private autoPlaceMaterials(recipeId: CardId): void {
    this.placedMaterials = [];
    const check = this.alchemyService.checkRecipeRequirements(recipeId, this.availableMaterials);
    if (!check.canCraft) return;
    this.placedMaterials = [...check.matchedMaterials];
    this.updateQualityPreview();
  }

  // ======== Material management ========

  setAvailableMaterials(materials: MaterialInstance[]): void {
    this.availableMaterials = [...materials];
  }

  selectMaterial(instanceId: string): void {
    const material = this.availableMaterials.find((m) => m.instanceId === instanceId);
    if (!material) return;
    this.placedMaterials.push(material);
    this.availableMaterials = this.availableMaterials.filter((m) => m.instanceId !== instanceId);
    this.updateQualityPreview();
  }

  removeMaterial(instanceId: string): void {
    const material = this.placedMaterials.find((m) => m.instanceId === instanceId);
    if (!material) return;
    this.placedMaterials = this.placedMaterials.filter((m) => m.instanceId !== instanceId);
    this.availableMaterials.push(material);
    this.updateQualityPreview();
  }

  private updateQualityPreview(): void {
    if (!this.selectedRecipeId || this.placedMaterials.length === 0) {
      this.qualityPreview = null;
      return;
    }
    this.qualityPreview = this.alchemyService.previewQuality(
      this.selectedRecipeId,
      this.placedMaterials,
    );
  }

  // ======== Craft execution ========

  executeCraft(): void {
    if (!this.isCraftButtonEnabled() || !this.selectedRecipeId) return;

    const usedIds = new Set(this.placedMaterials.map((m) => m.instanceId));
    const craftedItem = this.alchemyService.craft(this.selectedRecipeId, this.placedMaterials);

    this.onCraftCompleteCallback?.(craftedItem);

    this.availableMaterials = this.availableMaterials.filter((m) => !usedIds.has(m.instanceId));
    this.resetAfterCraft();
    this.refresh();
  }

  private resetAfterCraft(): void {
    this.placedMaterials = [];
    this.selectedRecipeId = null;

    this.qualityPreview = null;
    this.materialSlotCount = 0;
    this.recipeGrid.clearSelection();
    this.updateCraftButton();
  }

  isCraftButtonEnabled(): boolean {
    if (!this.selectedRecipeId) return false;
    return this.alchemyService.canCraft(this.selectedRecipeId, this.placedMaterials);
  }

  private updateCraftButton(): void {
    this.craftPanel?.updateVisibility(this.isCraftButtonEnabled(), this.qualityPreview);
  }

  // ======== Getters ========

  getRecipeCount(): number {
    return this.recipeGrid?.getRecipeCount() ?? 0;
  }
  getSelectedRecipeId(): CardId | null {
    return this.selectedRecipeId;
  }
  getMaterialSlotCount(): number {
    return this.materialSlotCount;
  }
  getPlacedMaterials(): MaterialInstance[] {
    return [...this.placedMaterials];
  }
  getAvailableMaterialCount(): number {
    return this.availableMaterials.length;
  }
  getQualityPreview(): Quality | null {
    return this.qualityPreview;
  }

  // ======== Refresh & Destroy ========

  refresh(): void {
    this.selectedRecipeId = null;

    this.recipeGrid?.loadAndRender(this.availableMaterials);
  }

  private resolveMaterialName(materialId: string): string {
    return this.materialNameResolver ? this.materialNameResolver(materialId) : materialId;
  }

  destroy(): void {
    this.recipeGrid?.destroy();
    this.craftPanel?.destroy();
    this.container.destroy();
  }
}
