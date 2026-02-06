/**
 * AlchemyPhaseUIコンポーネント
 * TASK-0045 調合フェーズUI実装（再実装）
 *
 * @description
 * 調合フェーズ全体のUI管理を担当するコンポーネント。
 * レシピ選択、素材配置、品質プレビュー、調合実行を管理する。
 */

import type { ItemInstance } from '@domain/entities/ItemInstance';
import type { MaterialInstance } from '@domain/entities/MaterialInstance';
import type { IAlchemyService } from '@domain/interfaces/alchemy-service.interface';
import { getSelectionIndexFromKey, isKeyForAction } from '@shared/constants/keybindings';
import type { CardId, Quality } from '@shared/types';
import type { IRecipeCardMaster } from '@shared/types/master-data';
import type Phaser from 'phaser';
import { BaseComponent } from '../components/BaseComponent';
import { THEME } from '../theme';

/** 調合フェーズUIレイアウト定数 */
const ALCHEMY_PHASE_LAYOUT = {
  /** レシピリスト開始Y座標 */
  RECIPE_LIST_START_Y: 60,
  /** レシピリストX座標オフセット */
  RECIPE_LIST_OFFSET_X: -100,
  /** レシピアイテム高さ */
  ITEM_HEIGHT: 50,
  /** レシピアイテム幅 */
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
 * AlchemyPhaseUIコンポーネント
 *
 * 【責務】:
 * - レシピリストの表示
 * - 素材スロットの管理
 * - 品質プレビューの表示
 * - 調合実行の制御
 */
export class AlchemyPhaseUI extends BaseComponent {
  /** 調合サービス */
  private alchemyService: IAlchemyService;

  /** 調合完了コールバック */
  private onCraftCompleteCallback?: (item: ItemInstance) => void;

  /** 利用可能なレシピリスト */
  private recipes: IRecipeCardMaster[] = [];

  /** 選択中のレシピID */
  private selectedRecipeId: CardId | null = null;

  /** 選択中のレシピ */
  private selectedRecipe: IRecipeCardMaster | null = null;

  /** 利用可能な素材リスト */
  private availableMaterials: MaterialInstance[] = [];

  /** 配置済み素材リスト */
  private placedMaterials: MaterialInstance[] = [];

  /** 必要素材スロット数 */
  private materialSlotCount = 0;

  /** 品質プレビュー */
  private qualityPreview: Quality | null = null;

  /** タイトルテキスト */
  private titleText!: Phaser.GameObjects.Text;

  /** rexUIラベルリスト（レシピ用） */
  private recipeLabels: RecipeLabelInfo[] = [];

  /** キーボードイベントハンドラ参照（Issue #135） */
  private keyboardHandler: ((event: { key: string }) => void) | null = null;

  /** 現在のフォーカスインデックス（キーボードナビゲーション用） */
  private focusedRecipeIndex = 0;

  /**
   * コンストラクタ
   *
   * @param scene - Phaserシーン
   * @param alchemyService - 調合サービス
   * @param onCraftComplete - 調合完了コールバック（オプション）
   * @throws {Error} sceneがnullまたはundefinedの場合
   * @throws {Error} alchemyServiceがnullまたはundefinedの場合
   */
  constructor(
    scene: Phaser.Scene,
    alchemyService: IAlchemyService,
    onCraftComplete?: (item: ItemInstance) => void,
  ) {
    // 入力バリデーション
    if (!scene) {
      throw new Error('AlchemyPhaseUI: scene is required');
    }

    if (!alchemyService) {
      throw new Error('AlchemyPhaseUI: alchemyService is required');
    }

    // Issue #116: コンテンツコンテナが既にオフセット済みなので(0, 0)を使用
    super(scene, 0, 0);
    this.alchemyService = alchemyService;
    this.onCraftCompleteCallback = onCraftComplete;
  }

  /**
   * UIコンポーネントを作成
   */
  create(): void {
    this.createTitle();
    this.loadRecipes();
    this.createRecipeList();
    this.setupKeyboardListener();
    this.updateRecipeFocus();
  }

  /**
   * タイトルを作成
   */
  private createTitle(): void {
    this.titleText = this.scene.add
      .text(0, 0, '⚗️ 調合フェーズ', {
        fontSize: `${THEME.sizes.xlarge}px`,
        color: `#${THEME.colors.text.toString(16).padStart(6, '0')}`,
        fontFamily: THEME.fonts.primary,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.container.add(this.titleText);
  }

  /**
   * レシピを読み込む
   */
  private loadRecipes(): void {
    this.recipes = this.alchemyService.getAvailableRecipes(this.availableMaterials);
  }

  /**
   * レシピリストを作成
   */
  private createRecipeList(): void {
    this.recipes.forEach((recipe, index) => {
      const y =
        ALCHEMY_PHASE_LAYOUT.RECIPE_LIST_START_Y +
        index * (ALCHEMY_PHASE_LAYOUT.ITEM_HEIGHT + ALCHEMY_PHASE_LAYOUT.ITEM_SPACING);
      const labelInfo = this.createRecipeLabel(
        recipe,
        ALCHEMY_PHASE_LAYOUT.RECIPE_LIST_OFFSET_X,
        y,
      );
      this.recipeLabels.push(labelInfo);
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
        width: ALCHEMY_PHASE_LAYOUT.ITEM_WIDTH,
        height: ALCHEMY_PHASE_LAYOUT.ITEM_HEIGHT,
        radius: ALCHEMY_PHASE_LAYOUT.BORDER_RADIUS,
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
        left: ALCHEMY_PHASE_LAYOUT.PADDING_HORIZONTAL,
        right: ALCHEMY_PHASE_LAYOUT.PADDING_HORIZONTAL,
        top: ALCHEMY_PHASE_LAYOUT.PADDING_VERTICAL,
        bottom: ALCHEMY_PHASE_LAYOUT.PADDING_VERTICAL,
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
    // レシピを検索
    const recipe = this.recipes.find((r) => r.id === recipeId);
    if (!recipe) {
      console.error(`AlchemyPhaseUI: Recipe not found: ${recipeId}`);
      return;
    }

    // 既存の選択を解除
    this.clearRecipeSelection();

    // 選択状態を更新
    this.selectedRecipeId = recipeId;
    this.selectedRecipe = recipe;

    // ハイライト
    const selectedItem = this.recipeLabels.find((item) => item.recipe.id === recipeId);
    if (selectedItem) {
      selectedItem.background.setFillStyle(THEME.colors.primary);
    }

    // 必要素材スロット数を計算
    this.updateMaterialSlots();
  }

  /**
   * レシピ選択をクリア
   */
  private clearRecipeSelection(): void {
    for (const item of this.recipeLabels) {
      item.background.setFillStyle(THEME.colors.secondary);
    }
  }

  /**
   * 必要素材スロットを更新
   */
  private updateMaterialSlots(): void {
    if (!this.selectedRecipe) {
      this.materialSlotCount = 0;
      return;
    }

    // 必要素材の総数を計算
    this.materialSlotCount = this.selectedRecipe.requiredMaterials.reduce(
      (sum, mat) => sum + mat.quantity,
      0,
    );
  }

  /**
   * 利用可能な素材を設定
   *
   * @param materials - 素材リスト
   */
  setAvailableMaterials(materials: MaterialInstance[]): void {
    this.availableMaterials = [...materials];
  }

  /**
   * 素材を選択して配置
   *
   * @param instanceId - 素材インスタンスID
   */
  selectMaterial(instanceId: string): void {
    const material = this.availableMaterials.find((m) => m.instanceId === instanceId);
    if (!material) return;

    // 配置済みリストに追加
    this.placedMaterials.push(material);

    // 利用可能リストから削除
    this.availableMaterials = this.availableMaterials.filter((m) => m.instanceId !== instanceId);

    // 品質プレビューを更新
    this.updateQualityPreview();
  }

  /**
   * 配置済み素材を取り除く
   *
   * @param instanceId - 素材インスタンスID
   */
  removeMaterial(instanceId: string): void {
    const material = this.placedMaterials.find((m) => m.instanceId === instanceId);
    if (!material) return;

    // 配置済みリストから削除
    this.placedMaterials = this.placedMaterials.filter((m) => m.instanceId !== instanceId);

    // 利用可能リストに戻す
    this.availableMaterials.push(material);

    // 品質プレビューを更新
    this.updateQualityPreview();
  }

  /**
   * 品質プレビューを更新
   */
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

  /**
   * 調合を実行
   */
  executeCraft(): void {
    if (!this.isCraftButtonEnabled()) {
      return;
    }

    if (!this.selectedRecipeId) {
      return;
    }

    // 調合実行
    const craftedItem = this.alchemyService.craft(this.selectedRecipeId, this.placedMaterials);

    // コールバック呼び出し
    if (this.onCraftCompleteCallback) {
      this.onCraftCompleteCallback(craftedItem);
    }

    // 状態リセット
    this.resetAfterCraft();
  }

  /**
   * 調合後のリセット
   */
  private resetAfterCraft(): void {
    this.placedMaterials = [];
    this.selectedRecipeId = null;
    this.selectedRecipe = null;
    this.qualityPreview = null;
    this.materialSlotCount = 0;
    this.clearRecipeSelection();
  }

  /**
   * 調合ボタンが有効か確認
   *
   * @returns 有効な場合true
   */
  isCraftButtonEnabled(): boolean {
    if (!this.selectedRecipeId) {
      return false;
    }

    return this.alchemyService.canCraft(this.selectedRecipeId, this.placedMaterials);
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
   * 必要素材スロット数を取得
   *
   * @returns スロット数
   */
  getMaterialSlotCount(): number {
    return this.materialSlotCount;
  }

  /**
   * 配置済み素材を取得
   *
   * @returns 配置済み素材リスト
   */
  getPlacedMaterials(): MaterialInstance[] {
    return [...this.placedMaterials];
  }

  /**
   * 利用可能な素材数を取得
   *
   * @returns 利用可能な素材数
   */
  getAvailableMaterialCount(): number {
    return this.availableMaterials.length;
  }

  /**
   * 品質プレビューを取得
   *
   * @returns 品質プレビュー、未計算の場合はnull
   */
  getQualityPreview(): Quality | null {
    return this.qualityPreview;
  }

  /**
   * コンポーネントを破棄
   */
  destroy(): void {
    this.removeKeyboardListener();
    for (const item of this.recipeLabels) {
      item.label.destroy();
    }
    this.recipeLabels = [];
    this.container.destroy();
  }

  // =============================================================================
  // Issue #135: キーボード操作
  // =============================================================================

  /**
   * キーボードリスナーを設定
   */
  private setupKeyboardListener(): void {
    this.keyboardHandler = (event: { key: string }) => this.handleKeyboardInput(event);
    this.scene?.input?.keyboard?.on('keydown', this.keyboardHandler);
  }

  /**
   * キーボードリスナーを解除
   */
  private removeKeyboardListener(): void {
    if (this.keyboardHandler) {
      this.scene?.input?.keyboard?.off('keydown', this.keyboardHandler);
      this.keyboardHandler = null;
    }
  }

  /**
   * キーボード入力を処理
   *
   * @param event - キーボードイベント
   */
  private handleKeyboardInput(event: { key: string }): void {
    // 数字キーでレシピを直接選択
    const selectionIndex = getSelectionIndexFromKey(event.key);
    if (selectionIndex !== null && selectionIndex <= this.recipes.length) {
      this.focusedRecipeIndex = selectionIndex - 1;
      this.updateRecipeFocus();
      const recipe = this.recipes[this.focusedRecipeIndex];
      if (recipe) {
        this.selectRecipe(recipe.id);
      }
      return;
    }

    // 上下矢印キーでレシピをナビゲート
    if (isKeyForAction(event.key, 'UP')) {
      this.moveFocus(-1);
    } else if (isKeyForAction(event.key, 'DOWN')) {
      this.moveFocus(1);
    }
    // Enter/Spaceでフォーカス中のレシピを選択
    else if (isKeyForAction(event.key, 'CONFIRM')) {
      if (this.focusedRecipeIndex >= 0 && this.focusedRecipeIndex < this.recipes.length) {
        const recipe = this.recipes[this.focusedRecipeIndex];
        if (recipe) {
          this.selectRecipe(recipe.id);
        }
      }
    }
  }

  /**
   * フォーカスを移動
   *
   * @param delta - 移動量
   */
  private moveFocus(delta: number): void {
    if (this.recipes.length === 0) return;

    let newIndex = this.focusedRecipeIndex + delta;

    // 範囲内に収める
    if (newIndex < 0) {
      newIndex = 0;
    } else if (newIndex >= this.recipes.length) {
      newIndex = this.recipes.length - 1;
    }

    if (newIndex !== this.focusedRecipeIndex) {
      this.focusedRecipeIndex = newIndex;
      this.updateRecipeFocus();
    }
  }

  /**
   * レシピフォーカスを視覚的に更新
   */
  private updateRecipeFocus(): void {
    const FOCUSED_SCALE = 1.05;
    const DEFAULT_SCALE = 1.0;

    this.recipeLabels.forEach((item, index) => {
      if (!item.label) return;

      if (index === this.focusedRecipeIndex) {
        if (typeof item.label.setScale === 'function') {
          item.label.setScale(FOCUSED_SCALE);
        }
      } else {
        if (typeof item.label.setScale === 'function') {
          item.label.setScale(DEFAULT_SCALE);
        }
      }
    });
  }
}
