/**
 * AlchemyContainer 実装
 *
 * TASK-0227: AlchemyContainer設計
 * 調合フェーズコンテナの基本実装。
 * レシピ選択、素材選択、調合プレビュー、調合実行を管理する。
 *
 * 設計文書: docs/tasks/atelier-guild-rank-phaser/TASK-0227.md
 */

import Phaser from 'phaser';
import { GamePhase } from '../../../domain/common/types';
import { RecipeCard } from '../../../domain/card/CardEntity';
import { Material } from '../../../domain/material/MaterialEntity';
import { BasePhaseContainer } from './BasePhaseContainer';
import type {
  IAlchemyContainer,
  AlchemyContainerOptions,
  AlchemyResult,
} from './IAlchemyContainer';
import {
  AlchemyContainerLayout,
  AlchemyContainerTexts,
} from './AlchemyContainerConstants';
import type { MaterialOption } from '../material/IMaterialOptionView';
import { MaterialOptionView } from '../material/MaterialOptionView';
import { AlchemyPreviewPanel } from '../alchemy/AlchemyPreviewPanel';
import { HandContainer } from '../hand/HandContainer';
import { TextStyles } from '../../config/TextStyles';

/**
 * AlchemyContainerクラス
 *
 * 調合フェーズのメインコンテナ。
 * レシピ選択、素材選択、プレビュー、調合を管理する。
 */
export class AlchemyContainer
  extends BasePhaseContainer
  implements IAlchemyContainer
{
  public readonly phase = GamePhase.ALCHEMY;

  // レシピ管理
  private recipeCards: RecipeCard[] = [];
  private selectedRecipe: RecipeCard | null = null;

  // 素材管理
  private availableMaterials: Material[] = [];
  private selectedMaterials: Material[] = [];

  // UIコンポーネント
  private handContainer?: HandContainer;
  private materialOptionView?: MaterialOptionView;
  private previewPanel?: AlchemyPreviewPanel;

  // ボタン
  private craftButton?: Phaser.GameObjects.Container;
  private skipButton?: Phaser.GameObjects.Container;

  // コールバック
  private onAlchemyComplete?: (result: AlchemyResult) => void;
  private onSkip?: () => void;

  // 処理中フラグ
  private isProcessing: boolean = false;

  constructor(options: AlchemyContainerOptions) {
    super({
      scene: options.scene,
      eventBus: options.eventBus,
      x: options.x ?? 0,
      y: options.y ?? 0,
      width: AlchemyContainerLayout.WIDTH,
      height: AlchemyContainerLayout.HEIGHT,
    });

    this.onAlchemyComplete = options.onAlchemyComplete;
    this.onSkip = options.onSkip;
  }

  // =====================================================
  // BasePhaseContainer抽象メソッドの実装
  // =====================================================

  protected createContent(): void {
    this.createTitle(AlchemyContainerTexts.TITLE);
    this.createLayout();
    this.createActions();
  }

  protected async onEnter(): Promise<void> {
    this.resetSelection();
    this.updatePreview();
    this.updateCraftButtonState();
  }

  protected async onExit(): Promise<void> {
    // 特に追加処理なし
  }

  protected onUpdate(_delta: number): void {
    // 特に追加処理なし
  }

  protected getCompletionResult(): AlchemyResult | null {
    if (!this.selectedRecipe) return null;
    if (this.selectedMaterials.length === 0) return null;

    return this.generateCraftResult();
  }

  canComplete(): boolean {
    return this.canCraft();
  }

  // =====================================================
  // レイアウト作成
  // =====================================================

  private createLayout(): void {
    const { HAND_AREA, MATERIAL_AREA, PREVIEW_PANEL } = AlchemyContainerLayout;

    // 手札エリアラベル
    this.createAreaLabel(
      HAND_AREA.X,
      HAND_AREA.Y + HAND_AREA.LABEL_Y_OFFSET,
      AlchemyContainerTexts.RECIPE_LABEL
    );

    // 手札コンテナ（レシピカード表示）
    this.handContainer = new HandContainer(this.scene, {
      x: HAND_AREA.X + HAND_AREA.WIDTH / 2,
      y: HAND_AREA.Y + HAND_AREA.HEIGHT / 2,
      layoutType: 'horizontal',
      onCardSelect: (card, _index) =>
        this.handleRecipeSelect(card as unknown as RecipeCard),
    });
    this.container.add(this.handContainer.container);

    // 素材選択エリアラベル
    this.createAreaLabel(
      MATERIAL_AREA.X,
      MATERIAL_AREA.Y + MATERIAL_AREA.LABEL_Y_OFFSET,
      AlchemyContainerTexts.MATERIAL_LABEL
    );

    // プレビューパネル
    this.previewPanel = new AlchemyPreviewPanel(this.scene, {
      x: PREVIEW_PANEL.X,
      y: PREVIEW_PANEL.Y,
    });
    this.container.add(this.previewPanel.container);
  }

  private createAreaLabel(x: number, y: number, text: string): void {
    const label = this.scene.add.text(x, y, text, {
      ...TextStyles.body,
      fontSize: '13px',
      color: '#aaaaaa',
    });
    this.container.add(label);
  }

  private createActions(): void {
    const { ACTION_AREA, WIDTH } = AlchemyContainerLayout;
    const centerX = WIDTH / 2;

    // 調合ボタン
    this.craftButton = this.createButton(
      centerX + 70,
      ACTION_AREA.Y,
      AlchemyContainerTexts.CRAFT_BUTTON,
      () => this.craft(),
      true
    );
    this.container.add(this.craftButton);

    // スキップボタン
    this.skipButton = this.createButton(
      centerX - 70,
      ACTION_AREA.Y,
      AlchemyContainerTexts.SKIP_BUTTON,
      () => this.handleSkip(),
      false
    );
    this.container.add(this.skipButton);

    // リセットボタン
    const resetButton = this.createButton(
      WIDTH - 80,
      ACTION_AREA.Y,
      AlchemyContainerTexts.RESET_BUTTON,
      () => this.clearMaterials(),
      false
    );
    this.container.add(resetButton);
  }

  // =====================================================
  // レシピカード管理
  // =====================================================

  setRecipeCards(cards: RecipeCard[]): void {
    this.recipeCards = cards;
    this.selectedRecipe = null;

    // HandContainerに設定
    // HandContainerはCard型を受け取るが、RecipeCardはCardの一種
    this.handContainer?.setCards(cards as any[]);

    this.updateMaterialOptions();
    this.updatePreview();
    this.updateCraftButtonState();
  }

  getSelectedRecipe(): RecipeCard | null {
    return this.selectedRecipe;
  }

  selectRecipe(card: RecipeCard): void {
    this.handleRecipeSelect(card);
    this.handContainer?.selectCard(card as any);
  }

  private handleRecipeSelect(card: RecipeCard): void {
    this.selectedRecipe = card;
    this.clearMaterials();
    this.updateMaterialOptions();
    this.updatePreview();
    this.updateCraftButtonState();
    this.eventBus.emit('alchemy:recipe:selected' as any, { recipe: card });
  }

  // =====================================================
  // 素材管理
  // =====================================================

  setAvailableMaterials(materials: Material[]): void {
    this.availableMaterials = materials;
    this.updateMaterialOptions();
  }

  private updateMaterialOptions(): void {
    // 既存のビューを破棄
    if (this.materialOptionView) {
      this.materialOptionView.destroy();
      this.materialOptionView = undefined;
    }

    if (!this.selectedRecipe) {
      return;
    }

    const { MATERIAL_AREA } = AlchemyContainerLayout;

    // レシピに合った素材のみフィルタ
    const filteredMaterials = this.filterMaterialsForRecipe(
      this.availableMaterials,
      this.selectedRecipe
    );

    // MaterialOptionに変換
    const options: MaterialOption[] = filteredMaterials.map((m) => ({
      material: m,
      quantity: 1, // インベントリから取得すべき
    }));

    if (options.length === 0) {
      // 素材がない場合はメッセージを表示
      const emptyText = this.scene.add.text(
        MATERIAL_AREA.X,
        MATERIAL_AREA.Y + 20,
        '使用可能な素材がありません',
        {
          ...TextStyles.body,
          fontSize: '14px',
          color: '#888888',
        }
      );
      this.container.add(emptyText);
      return;
    }

    // 必要素材数を計算
    const requiredCount = this.getRequiredMaterialCount();

    this.materialOptionView = new MaterialOptionView({
      scene: this.scene,
      x: MATERIAL_AREA.X,
      y: MATERIAL_AREA.Y,
      options: options,
      maxSelections: requiredCount,
      onSelect: (material) => this.handleMaterialSelect(material),
      onDeselect: (material) => this.handleMaterialDeselect(material),
    });
    this.container.add(this.materialOptionView.container);
  }

  private filterMaterialsForRecipe(
    materials: Material[],
    recipe: RecipeCard
  ): Material[] {
    // レシピの要求素材情報を取得
    const requiredMaterials = recipe.getRequiredMaterials();

    if (!requiredMaterials || requiredMaterials.length === 0) {
      return materials;
    }

    // 要求カテゴリを取得
    const requiredCategories = requiredMaterials.map((rm) => rm.category);

    if (requiredCategories.length === 0) {
      return materials;
    }

    // カテゴリでフィルタリング
    return materials.filter((m) => {
      // 素材のカテゴリが要求カテゴリに含まれるか確認
      return requiredCategories.some(
        (category) => m.category === category || category === 'any'
      );
    });
  }

  private getRequiredMaterialCount(): number {
    if (!this.selectedRecipe) return 3;
    const required = this.selectedRecipe.getRequiredMaterials();
    return required.length > 0 ? required.length : 3;
  }

  getSelectedMaterials(): Material[] {
    return [...this.selectedMaterials];
  }

  selectMaterial(material: Material): void {
    if (!this.selectedMaterials.includes(material)) {
      this.selectedMaterials.push(material);
      this.materialOptionView?.selectMaterial(material);
      this.updatePreview();
      this.updateCraftButtonState();
    }
  }

  deselectMaterial(material: Material): void {
    this.selectedMaterials = this.selectedMaterials.filter(
      (m) => m !== material
    );
    this.materialOptionView?.deselectMaterial(material);
    this.updatePreview();
    this.updateCraftButtonState();
  }

  clearMaterials(): void {
    this.selectedMaterials = [];
    this.materialOptionView?.clearSelection();
    this.updatePreview();
    this.updateCraftButtonState();
    this.eventBus.emit('alchemy:materials:cleared' as any, {});
  }

  private handleMaterialSelect(material: Material): void {
    this.selectedMaterials.push(material);
    this.updatePreview();
    this.updateCraftButtonState();
    this.eventBus.emit('alchemy:material:selected' as any, { material });
  }

  private handleMaterialDeselect(material: Material): void {
    this.selectedMaterials = this.selectedMaterials.filter(
      (m) => m !== material
    );
    this.updatePreview();
    this.updateCraftButtonState();
    this.eventBus.emit('alchemy:material:deselected' as any, { material });
  }

  // =====================================================
  // プレビュー更新
  // =====================================================

  private updatePreview(): void {
    if (!this.selectedRecipe) {
      this.previewPanel?.setPreview(null);
      return;
    }

    // 品質予測
    const predictedQuality = this.predictQuality(this.selectedMaterials);
    const predictedTraits = this.predictTraits(this.selectedMaterials);
    const missingMaterials = this.getMissingMaterials();

    this.previewPanel?.setPreview({
      recipe: this.selectedRecipe,
      materials: this.selectedMaterials,
      predictedQuality,
      predictedTraits,
      canCraft: this.canCraft(),
      missingMaterials,
    });
  }

  private predictQuality(materials: Material[]): string {
    if (materials.length === 0) return 'normal';

    // 素材の品質から予測（簡易版）
    const qualityScores: Record<string, number> = {
      S: 6,
      A: 5,
      B: 4,
      C: 3,
      D: 2,
      E: 1,
    };

    const avgScore =
      materials.reduce((sum, m) => {
        const quality = m.baseQuality ?? 'C';
        return sum + (qualityScores[quality] ?? 3);
      }, 0) / materials.length;

    if (avgScore >= 5.5) return 'legendary';
    if (avgScore >= 4.5) return 'epic';
    if (avgScore >= 3.5) return 'rare';
    if (avgScore >= 2.5) return 'good';
    return 'normal';
  }

  private predictTraits(materials: Material[]): string[] {
    // 素材の特性から継承（簡易版）
    const traits: string[] = [];
    materials.forEach((m) => {
      if (m.traits) {
        traits.push(...m.traits);
      }
    });
    // 重複を除去して最大3つ
    return [...new Set(traits)].slice(0, 3);
  }

  private getMissingMaterials(): string[] {
    if (!this.selectedRecipe) return [];

    const requiredCount = this.getRequiredMaterialCount();
    if (this.selectedMaterials.length < requiredCount) {
      return [
        `素材が${requiredCount - this.selectedMaterials.length}個不足`,
      ];
    }
    return [];
  }

  // =====================================================
  // 調合操作
  // =====================================================

  canCraft(): boolean {
    if (!this.selectedRecipe) return false;

    const requiredCount = this.getRequiredMaterialCount();
    return this.selectedMaterials.length >= requiredCount;
  }

  private updateCraftButtonState(): void {
    const canCraft = this.canCraft();
    if (this.craftButton) {
      this.setButtonEnabled(this.craftButton, canCraft);
    }
  }

  async craft(): Promise<void> {
    if (!this.canCraft()) {
      this.showCannotCraftFeedback();
      return;
    }
    if (!this.selectedRecipe) return;
    if (this.isProcessing) return;

    // 操作を無効化
    this.isProcessing = true;
    this.setEnabled(false);

    // 調合アニメーション
    await this.playCraftAnimation();

    // 結果生成
    const result = this.generateCraftResult();

    // EventBus発火
    this.eventBus.emit('alchemy:craft' as any, result);

    // 成功表示
    await this.showCraftSuccess(result);

    // 処理完了
    this.isProcessing = false;

    // コールバック
    if (this.onAlchemyComplete) {
      this.onAlchemyComplete(result);
    }
  }

  private showCannotCraftFeedback(): void {
    if (this.craftButton) {
      const originalX = this.craftButton.x;
      this.scene.tweens.add({
        targets: this.craftButton,
        x: originalX + 5,
        duration: 50,
        yoyo: true,
        repeat: 3,
        onComplete: () => {
          this.craftButton!.x = originalX;
        },
      });
    }
  }

  private async playCraftAnimation(): Promise<void> {
    return new Promise((resolve) => {
      const centerX = AlchemyContainerLayout.WIDTH / 2;
      const centerY = AlchemyContainerLayout.HEIGHT / 2;

      // 調合エフェクト
      const particles: Phaser.GameObjects.Text[] = [];

      this.selectedMaterials.forEach((material, index) => {
        const angle = (index * Math.PI * 2) / this.selectedMaterials.length;
        const radius = 80;
        const startX = centerX + Math.cos(angle) * radius;
        const startY = centerY + Math.sin(angle) * radius;

        const emoji = this.getMaterialEmoji(material);
        const particle = this.scene.add
          .text(startX, startY, emoji, { fontSize: '24px' })
          .setOrigin(0.5);

        this.container.add(particle);
        particles.push(particle);

        // 中央に集まる
        this.scene.tweens.add({
          targets: particle,
          x: centerX,
          y: centerY,
          scaleX: 0.5,
          scaleY: 0.5,
          duration: 600,
          delay: index * 100,
          ease: 'Power2.easeIn',
        });
      });

      // 錬金釜エフェクト
      const cauldron = this.scene.add
        .text(centerX, centerY, '⚗️', { fontSize: '48px' })
        .setOrigin(0.5)
        .setAlpha(0);
      this.container.add(cauldron);

      this.scene.tweens.add({
        targets: cauldron,
        alpha: 1,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 300,
        delay: 300,
        ease: 'Power2',
      });

      // 集合後のバーストエフェクト
      this.scene.time.delayedCall(
        600 + this.selectedMaterials.length * 100,
        () => {
          const burst = this.scene.add.graphics();
          burst.fillStyle(0xffd700, 0.5);
          burst.fillCircle(centerX, centerY, 10);
          this.container.add(burst);

          this.scene.tweens.add({
            targets: burst,
            scaleX: 5,
            scaleY: 5,
            alpha: 0,
            duration: 400,
            ease: 'Power2',
            onComplete: () => {
              burst.destroy();
              particles.forEach((p) => p.destroy());
              cauldron.destroy();
              resolve();
            },
          });
        }
      );
    });
  }

  private generateCraftResult(): AlchemyResult {
    return {
      recipe: this.selectedRecipe!,
      usedMaterials: [...this.selectedMaterials],
      craftedItemId: this.selectedRecipe!.getOutputItemId(),
      craftedItemName: this.selectedRecipe!.name,
      quality: this.predictQuality(this.selectedMaterials),
      traits: this.predictTraits(this.selectedMaterials),
    };
  }

  private async showCraftSuccess(result: AlchemyResult): Promise<void> {
    return new Promise((resolve) => {
      const centerX = AlchemyContainerLayout.WIDTH / 2;
      const centerY = AlchemyContainerLayout.HEIGHT / 2;

      // 成功メッセージ
      const successText = this.scene.add
        .text(centerX, centerY - 20, `✨ ${result.craftedItemName}を調合！`, {
          ...TextStyles.heading,
          fontSize: '22px',
          color: '#ffd700',
        })
        .setOrigin(0.5);
      this.container.add(successText);

      // 品質表示
      const qualityText = this.scene.add
        .text(centerX, centerY + 20, `品質: ${result.quality.toUpperCase()}`, {
          ...TextStyles.body,
          fontSize: '16px',
          color: this.getQualityColor(result.quality),
        })
        .setOrigin(0.5);
      this.container.add(qualityText);

      // フェードアウト
      this.scene.tweens.add({
        targets: [successText, qualityText],
        y: '-=30',
        alpha: 0,
        duration: 1500,
        ease: 'Power2',
        onComplete: () => {
          successText.destroy();
          qualityText.destroy();
          resolve();
        },
      });
    });
  }

  private getQualityColor(quality: string): string {
    const colors: Record<string, string> = {
      legendary: '#ffd700',
      epic: '#a335ee',
      rare: '#0070dd',
      good: '#1eff00',
      normal: '#ffffff',
      poor: '#9d9d9d',
    };
    return colors[quality] ?? '#ffffff';
  }

  private getMaterialEmoji(material: Material): string {
    const attrs = material.attributes ?? [];

    if (attrs.includes('FIRE' as any)) return '🔥';
    if (attrs.includes('WATER' as any)) return '💧';
    if (attrs.includes('EARTH' as any)) return '🌍';
    if (attrs.includes('WIND' as any)) return '💨';
    if (attrs.includes('GRASS' as any)) return '🌿';

    if (material.isRare) return '💎';

    return '🧪';
  }

  // =====================================================
  // 操作
  // =====================================================

  private resetSelection(): void {
    this.selectedRecipe = null;
    this.selectedMaterials = [];
    this.handContainer?.deselectCard();
    this.materialOptionView?.clearSelection();
  }

  private handleSkip(): void {
    if (this.isProcessing) return;
    this.eventBus.emit('alchemy:skip' as any, {});
    if (this.onSkip) {
      this.onSkip();
    }
  }

  // =====================================================
  // 破棄
  // =====================================================

  destroy(): void {
    this.handContainer?.destroy();
    this.materialOptionView?.destroy();
    this.previewPanel?.destroy();
    super.destroy();
  }
}
