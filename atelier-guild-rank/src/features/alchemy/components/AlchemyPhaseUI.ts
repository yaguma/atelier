/**
 * AlchemyPhaseUIコンポーネント
 * TASK-0045 調合フェーズUI実装（再実装）
 *
 * @description
 * 調合フェーズ全体のUI管理を担当するコンポーネント。
 * レシピ選択、素材配置、品質プレビュー、調合実行を管理する。
 *
 * TODO(TASK-0078): 601行 > 300行上限。レシピリスト・素材スロット・品質プレビューに分割を検討
 *
 * TODO(Phase 11): @domain/依存（ItemInstance, MaterialInstance, IAlchemyService）を
 * @features/または@shared/types経由に置き換える。UIコンポーネントはdomain層に直接依存すべきでない。
 *
 * TODO(Phase 11): createRecipeLabel, setLabelPosition, setupLabelInteractionが
 * RecipeListUIと重複している。共通ヘルパー（recipe-label-factory.ts等）に抽出を検討する。
 */

import type { ItemInstance } from '@domain/entities/ItemInstance';
import type { MaterialInstance } from '@domain/entities/MaterialInstance';
import type { IAlchemyService } from '@domain/interfaces/alchemy-service.interface';
import type { RexRoundRectangle } from '@presentation/types/rexui';
import { BaseComponent } from '@presentation/ui/components/BaseComponent';
import { THEME } from '@presentation/ui/theme';
import { ScrollableContainer } from '@shared/components/ScrollableContainer';
import { MAIN_LAYOUT } from '@shared/constants';
import { getSelectionIndexFromKey, isKeyForAction } from '@shared/constants/keybindings';
import type { CardId, Quality } from '@shared/types';
import type { IRecipeCardMaster } from '@shared/types/master-data';
import type Phaser from 'phaser';

/** 調合フェーズUIレイアウト定数 */
const ALCHEMY_PHASE_LAYOUT = {
  /** レシピリスト開始Y座標 */
  RECIPE_LIST_START_Y: 80,
  /** レシピリストX座標オフセット（カード左端位置） */
  RECIPE_LIST_OFFSET_X: 20,
  /** レシピアイテム高さ */
  ITEM_HEIGHT: 30,
  /** レシピアイテム幅 */
  ITEM_WIDTH: 200,
  /** アイテム間スペーシング */
  ITEM_SPACING: 12,
  /** グリッド列数 */
  GRID_COLUMNS: 4,
  /** グリッド水平マージン */
  GRID_MARGIN_X: 16,
  /** 角丸半径 */
  BORDER_RADIUS: 8,
  /** パディング(水平) */
  PADDING_HORIZONTAL: 10,
  /** パディング(垂直) */
  PADDING_VERTICAL: 5,
  /** 素材行の高さ */
  MATERIAL_LINE_HEIGHT: 22,
  /** 素材行のインデント（左端からのオフセット） */
  MATERIAL_INDENT: 30,
  /** スクロール速度係数 */
  SCROLL_SPEED: 0.5,
} as const;

/**
 * rexUIラベル情報の型定義
 * TASK-0059: rexUI型定義を適用
 */
interface RecipeLabelInfo {
  cardContainer: Phaser.GameObjects.Container;
  background: RexRoundRectangle;
  nameText: Phaser.GameObjects.Text;
  recipe: IRecipeCardMaster;
  /** 調合可能かどうか */
  craftable: boolean;
  /** 必要素材テキストオブジェクト（破棄用） */
  materialTexts: Phaser.GameObjects.Text[];
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

  /** 素材名解決関数（materialId → 表示名） */
  private materialNameResolver?: (materialId: string) => string;

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

  /** 調合実行ボタンコンテナ */
  private craftButtonContainer: Phaser.GameObjects.Container | null = null;

  /** 品質プレビューテキスト */
  private qualityPreviewText: Phaser.GameObjects.Text | null = null;

  /** キーボードイベントハンドラ参照（Issue #135） */
  private keyboardHandler: ((event: { key: string }) => void) | null = null;

  /** 現在のフォーカスインデックス（キーボードナビゲーション用） */
  private focusedRecipeIndex = 0;

  /** スクロール可能なコンテナ（Issue #357 → Issue #368: ScrollableContainerに統合） */
  private scrollableContainer: ScrollableContainer | null = null;

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
    materialNameResolver?: (materialId: string) => string,
  ) {
    // 入力バリデーション
    if (!scene) {
      throw new Error('AlchemyPhaseUI: scene is required');
    }

    if (!alchemyService) {
      throw new Error('AlchemyPhaseUI: alchemyService is required');
    }

    // Issue #116: コンテンツコンテナが既にオフセット済みなので(0, 0)を使用
    // Issue #137: 親コンテナに追加されるため、シーンには直接追加しない
    super(scene, 0, 0, { addToScene: false });
    this.alchemyService = alchemyService;
    this.onCraftCompleteCallback = onCraftComplete;
    this.materialNameResolver = materialNameResolver;
  }

  /**
   * UIコンポーネントを作成
   */
  create(): void {
    this.createTitle();
    this.createRecipeScrollArea();
    this.loadRecipes();
    this.createRecipeList();
    this.createCraftButton();
    this.setupKeyboardListener();
    this.updateRecipeFocus();
  }

  /**
   * タイトルを作成
   */
  private createTitle(): void {
    this.titleText = this.scene.make
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

    this.container.add(this.titleText);
  }

  /**
   * レシピを読み込む（全レシピを取得し、調合可否はUI表示で区別する）
   */
  private loadRecipes(): void {
    this.recipes = this.alchemyService.getAllRecipes();
  }

  /**
   * レシピリストを作成（グリッドレイアウト: レシピ名＋必要素材を1つのカード内に表示）
   * Issue #374: 複数列グリッド配置で画面スペースを有効活用
   */
  private createRecipeList(): void {
    const { GRID_COLUMNS, ITEM_WIDTH, GRID_MARGIN_X, RECIPE_LIST_OFFSET_X, ITEM_SPACING } =
      ALCHEMY_PHASE_LAYOUT;

    // 行ごとの最大カード高さを事前計算
    const rowMaxHeights = this.calculateRowMaxHeights();

    // 行ごとのY開始位置を累積計算
    const rowStartY = this.calculateRowStartPositions(rowMaxHeights);

    for (let i = 0; i < this.recipes.length; i++) {
      const recipe = this.recipes[i];
      const col = i % GRID_COLUMNS;
      const row = Math.floor(i / GRID_COLUMNS);

      const checkResult = this.alchemyService.checkRecipeRequirements(
        recipe.id,
        this.availableMaterials,
      );

      // 不足素材のマップを作成
      const missingMap = new Map<string, number>();
      for (const m of checkResult.missingMaterials) {
        missingMap.set(m.materialId, m.quantity);
      }

      // グリッド座標を計算
      const cardX = RECIPE_LIST_OFFSET_X + col * (ITEM_WIDTH + GRID_MARGIN_X);
      const cardY = rowStartY[row] ?? 0;

      // レシピカードを作成（名前＋素材を含む統合カード）
      const labelInfo = this.createRecipeCard(
        recipe,
        cardX,
        cardY,
        checkResult.canCraft,
        missingMap,
      );
      this.recipeLabels.push(labelInfo);
    }

    // Issue #368: ScrollableContainerにコンテンツ高さを通知
    const totalRows = Math.ceil(this.recipes.length / GRID_COLUMNS);
    const lastRowY = totalRows > 0 ? (rowStartY[totalRows - 1] ?? 0) : 0;
    const lastRowHeight = totalRows > 0 ? (rowMaxHeights[totalRows - 1] ?? 0) + ITEM_SPACING : 0;
    this.scrollableContainer?.setContentHeight(lastRowY + lastRowHeight);
    this.resetScroll();
  }

  /**
   * 行ごとの最大カード高さを計算
   * Issue #374: グリッドレイアウトで行内の高さを揃える
   */
  private calculateRowMaxHeights(): number[] {
    const { GRID_COLUMNS } = ALCHEMY_PHASE_LAYOUT;
    const totalRows = Math.ceil(this.recipes.length / GRID_COLUMNS);
    const rowMaxHeights: number[] = [];

    for (let row = 0; row < totalRows; row++) {
      let maxHeight = 0;
      for (let col = 0; col < GRID_COLUMNS; col++) {
        const index = row * GRID_COLUMNS + col;
        if (index >= this.recipes.length) break;
        const height = this.calculateCardHeight(this.recipes[index].requiredMaterials.length);
        if (height > maxHeight) {
          maxHeight = height;
        }
      }
      rowMaxHeights.push(maxHeight);
    }

    return rowMaxHeights;
  }

  /**
   * 行ごとのY開始位置を累積計算
   * Issue #374: 各行のY位置は前行の最大高さに基づく
   */
  private calculateRowStartPositions(rowMaxHeights: number[]): number[] {
    const { RECIPE_LIST_START_Y, ITEM_SPACING } = ALCHEMY_PHASE_LAYOUT;
    const rowStartY: number[] = [];
    let currentY = RECIPE_LIST_START_Y;

    for (let row = 0; row < rowMaxHeights.length; row++) {
      rowStartY.push(currentY);
      currentY += rowMaxHeights[row] + ITEM_SPACING;
    }

    return rowStartY;
  }

  /**
   * カードの高さを計算
   */
  private calculateCardHeight(materialCount: number): number {
    return (
      ALCHEMY_PHASE_LAYOUT.ITEM_HEIGHT +
      materialCount * ALCHEMY_PHASE_LAYOUT.MATERIAL_LINE_HEIGHT +
      ALCHEMY_PHASE_LAYOUT.PADDING_VERTICAL
    );
  }

  /**
   * 単一レシピカードを作成（レシピ名＋必要素材を1つの背景内に表示）
   *
   * @param recipe - レシピデータ
   * @param x - X座標（カード左端位置）
   * @param y - Y座標
   * @param craftable - 調合可能かどうか
   * @param missingMap - 不足素材マップ（materialId → 不足数量）
   * @returns レシピラベル情報
   */
  private createRecipeCard(
    recipe: IRecipeCardMaster,
    x: number,
    y: number,
    craftable: boolean,
    missingMap: Map<string, number>,
  ): RecipeLabelInfo {
    const materialCount = recipe.requiredMaterials.length;
    const cardHeight = this.calculateCardHeight(materialCount);

    // カードコンテナを作成
    const cardContainer = this.scene.add.container(x, y);

    // 背景（rexUI roundRectangle - 中心原点なのでカード中心に配置）
    const bgColor = craftable ? THEME.colors.secondary : 0x3a3a3a;
    const background = this.rexUI.add
      .roundRectangle({
        width: ALCHEMY_PHASE_LAYOUT.ITEM_WIDTH,
        height: cardHeight,
        radius: ALCHEMY_PHASE_LAYOUT.BORDER_RADIUS,
      })
      .setFillStyle(bgColor);
    background.setPosition(ALCHEMY_PHASE_LAYOUT.ITEM_WIDTH / 2, cardHeight / 2);
    cardContainer.add(background);

    // レシピ名テキスト
    const textColor = craftable ? THEME.colors.textOnSecondary : '#cccccc';
    const nameText = this.scene.make.text({
      x: ALCHEMY_PHASE_LAYOUT.PADDING_HORIZONTAL,
      y: ALCHEMY_PHASE_LAYOUT.PADDING_VERTICAL,
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

    // 必要素材テキスト
    const materialTexts: Phaser.GameObjects.Text[] = [];
    let materialY = ALCHEMY_PHASE_LAYOUT.ITEM_HEIGHT;

    for (const req of recipe.requiredMaterials) {
      const isMissing = missingMap.has(req.materialId);
      const materialColor = isMissing ? '#ff4444' : craftable ? '#e0d0b0' : '#aaaaaa';
      const materialName = this.resolveMaterialName(req.materialId);
      const displayText = `${materialName}: ${req.quantity}`;

      const materialText = this.scene.make.text({
        x: ALCHEMY_PHASE_LAYOUT.MATERIAL_INDENT,
        y: materialY,
        text: displayText,
        style: {
          fontSize: `${THEME.sizes.small}px`,
          color: materialColor,
          fontFamily: THEME.fonts.primary,
        },
        add: false,
      });
      cardContainer.add(materialText);
      materialTexts.push(materialText);
      materialY += ALCHEMY_PHASE_LAYOUT.MATERIAL_LINE_HEIGHT;
    }

    // スクロールコンテナに追加（Issue #357 → Issue #368: ScrollableContainerに統合）
    const targetContainer = this.scrollableContainer?.getScrollContainer() ?? this.container;
    targetContainer.add(cardContainer);

    // インタラクション設定（調合可能なレシピのみ）
    if (craftable) {
      background.setInteractive();
      background.on('pointerdown', () => {
        this.selectRecipe(recipe.id);
      });
    }

    return { cardContainer, background, nameText, recipe, craftable, materialTexts };
  }

  /**
   * 素材IDを表示名に解決
   */
  private resolveMaterialName(materialId: string): string {
    return this.materialNameResolver ? this.materialNameResolver(materialId) : materialId;
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

    // Issue #413: 自動素材配置 - checkRecipeRequirementsのmatchedMaterialsを使用
    this.autoPlaceMaterials(recipeId);

    // 調合ボタンと品質プレビューを更新
    this.updateCraftButtonVisibility();
  }

  /**
   * レシピ選択をクリア（調合不可レシピはグレーのまま維持）
   */
  private clearRecipeSelection(): void {
    for (const item of this.recipeLabels) {
      const color = item.craftable ? THEME.colors.secondary : 0x3a3a3a;
      item.background.setFillStyle(color);
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
   * Issue #413: レシピ選択時に必要素材を自動配置
   * checkRecipeRequirementsのmatchedMaterialsを利用して素材を配置する
   */
  private autoPlaceMaterials(recipeId: CardId): void {
    // 既存の配置をクリア
    this.placedMaterials = [];

    const checkResult = this.alchemyService.checkRecipeRequirements(
      recipeId,
      this.availableMaterials,
    );

    if (!checkResult.canCraft) {
      return;
    }

    // matchedMaterialsを配置済みリストに設定
    this.placedMaterials = [...checkResult.matchedMaterials];

    // 品質プレビューを更新
    this.updateQualityPreview();
  }

  /**
   * Issue #413: 調合実行ボタンを作成
   */
  private createCraftButton(): void {
    const gameWidth = this.scene.cameras.main.width;
    const gameHeight = this.scene.cameras.main.height;
    const buttonWidth = 180;
    const buttonHeight = 44;
    const buttonX = gameWidth - MAIN_LAYOUT.SIDEBAR_WIDTH - buttonWidth / 2 - 20;
    const buttonY = gameHeight - MAIN_LAYOUT.HEADER_HEIGHT - MAIN_LAYOUT.FOOTER_HEIGHT - 30;

    this.craftButtonContainer = this.scene.add.container(buttonX, buttonY);

    // ボタン背景
    const bg = this.rexUI.add
      .roundRectangle({
        width: buttonWidth,
        height: buttonHeight,
        radius: 10,
      })
      .setFillStyle(THEME.colors.primary);
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerdown', () => {
      this.executeCraft();
    });

    // ボタンテキスト
    const buttonText = this.scene.make.text({
      x: 0,
      y: 0,
      text: '調合実行',
      style: {
        fontSize: `${THEME.sizes.large}px`,
        color: '#ffffff',
        fontFamily: THEME.fonts.primary,
        fontStyle: 'bold',
      },
      add: false,
    });
    buttonText.setOrigin(0.5);

    this.craftButtonContainer.add([bg, buttonText]);

    // 品質プレビューテキスト（ボタンの上に表示）
    this.qualityPreviewText = this.scene.make.text({
      x: 0,
      y: -35,
      text: '',
      style: {
        fontSize: `${THEME.sizes.medium}px`,
        color: `#${THEME.colors.text.toString(16).padStart(6, '0')}`,
        fontFamily: THEME.fonts.primary,
      },
      add: false,
    });
    this.qualityPreviewText.setOrigin(0.5);
    this.craftButtonContainer.add(this.qualityPreviewText);

    this.container.add(this.craftButtonContainer);

    // 初期状態は非表示
    this.craftButtonContainer.setVisible(false);
  }

  /**
   * Issue #413: 調合ボタンの表示/非表示を更新
   */
  private updateCraftButtonVisibility(): void {
    if (!this.craftButtonContainer) return;

    const enabled = this.isCraftButtonEnabled();
    this.craftButtonContainer.setVisible(enabled);

    // 品質プレビューテキストを更新
    if (enabled && this.qualityPreview !== null) {
      this.qualityPreviewText?.setText(`品質: ${this.qualityPreview}`);
    } else {
      this.qualityPreviewText?.setText('');
    }
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

    // 使用する素材のinstanceIdを保持（リセット前に取得）
    const usedMaterialIds = new Set(this.placedMaterials.map((m) => m.instanceId));

    // 調合実行
    const craftedItem = this.alchemyService.craft(this.selectedRecipeId, this.placedMaterials);

    // コールバック呼び出し（インベントリ更新）
    if (this.onCraftCompleteCallback) {
      this.onCraftCompleteCallback(craftedItem);
    }

    // Issue #413: 使用素材をavailableMaterialsから除外してUI更新
    this.availableMaterials = this.availableMaterials.filter(
      (m) => !usedMaterialIds.has(m.instanceId),
    );

    // 状態リセット + UIリフレッシュ
    this.resetAfterCraft();
    this.refresh();
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
    this.updateCraftButtonVisibility();
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
   * UIを再構築する（素材リスト更新後に呼び出す）
   * 既存のレシピラベルを破棄し、レシピリストを再読み込み・再作成する。
   */
  refresh(): void {
    // スクロール位置をリセット（カード再作成前に実施）
    this.resetScroll();

    // 既存のレシピカードを破棄（コンテナ破棄で子要素も一括破棄）
    for (const item of this.recipeLabels) {
      item.cardContainer.destroy(true);
    }
    this.recipeLabels = [];

    // 選択状態をリセット
    this.selectedRecipeId = null;
    this.selectedRecipe = null;
    this.focusedRecipeIndex = 0;

    // レシピを再読み込み・再作成
    this.loadRecipes();
    this.createRecipeList();
    this.updateRecipeFocus();
  }

  /**
   * コンポーネントを破棄
   */
  destroy(): void {
    this.removeKeyboardListener();
    for (const item of this.recipeLabels) {
      item.cardContainer.destroy(true);
    }
    this.recipeLabels = [];
    if (this.craftButtonContainer) {
      this.craftButtonContainer.destroy(true);
      this.craftButtonContainer = null;
    }
    this.qualityPreviewText = null;
    this.destroyScrollArea();
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
    // 数字キーでレシピを直接選択（調合可能なもののみ）
    const selectionIndex = getSelectionIndexFromKey(event.key);
    if (selectionIndex !== null && selectionIndex <= this.recipes.length) {
      this.focusedRecipeIndex = selectionIndex - 1;
      this.updateRecipeFocus();
      const labelInfo = this.recipeLabels[this.focusedRecipeIndex];
      if (labelInfo?.craftable) {
        this.selectRecipe(labelInfo.recipe.id);
      }
      return;
    }

    // 矢印キーでレシピをナビゲート（Issue #374: グリッドに対応）
    if (isKeyForAction(event.key, 'UP')) {
      this.moveFocus(-ALCHEMY_PHASE_LAYOUT.GRID_COLUMNS);
    } else if (isKeyForAction(event.key, 'DOWN')) {
      this.moveFocus(ALCHEMY_PHASE_LAYOUT.GRID_COLUMNS);
    } else if (isKeyForAction(event.key, 'LEFT')) {
      this.moveFocus(-1);
    } else if (isKeyForAction(event.key, 'RIGHT')) {
      this.moveFocus(1);
    }
    // Enter/Spaceで調合実行（素材配置済みの場合）またはレシピ選択
    else if (isKeyForAction(event.key, 'CONFIRM')) {
      // Issue #413: 調合ボタンが有効なら調合実行を優先
      if (this.isCraftButtonEnabled()) {
        this.executeCraft();
      } else if (this.focusedRecipeIndex >= 0 && this.focusedRecipeIndex < this.recipes.length) {
        const labelInfo = this.recipeLabels[this.focusedRecipeIndex];
        if (labelInfo?.craftable) {
          this.selectRecipe(labelInfo.recipe.id);
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
      const scale = index === this.focusedRecipeIndex ? FOCUSED_SCALE : DEFAULT_SCALE;
      item.cardContainer.setScale(scale);
    });
  }

  // =============================================================================
  // Issue #357 → Issue #368: スクロール機能（ScrollableContainerに統合）
  // =============================================================================

  /**
   * レシピリスト用のスクロールエリアを作成
   */
  private createRecipeScrollArea(): void {
    const gameWidth = this.scene.cameras.main.width;
    const gameHeight = this.scene.cameras.main.height;

    this.scrollableContainer = new ScrollableContainer(this.scene, this.container, {
      maskBounds: {
        x: MAIN_LAYOUT.SIDEBAR_WIDTH,
        y: MAIN_LAYOUT.HEADER_HEIGHT + ALCHEMY_PHASE_LAYOUT.RECIPE_LIST_START_Y,
        width: gameWidth - MAIN_LAYOUT.SIDEBAR_WIDTH,
        height:
          gameHeight -
          MAIN_LAYOUT.HEADER_HEIGHT -
          MAIN_LAYOUT.FOOTER_HEIGHT -
          ALCHEMY_PHASE_LAYOUT.RECIPE_LIST_START_Y,
      },
      scrollSpeed: ALCHEMY_PHASE_LAYOUT.SCROLL_SPEED,
      isScrollEnabled: () => this.container.visible,
    });
    this.scrollableContainer.create();
  }

  /**
   * スクロール位置をリセット
   */
  private resetScroll(): void {
    this.scrollableContainer?.resetScroll();
  }

  /**
   * スクロールエリアを破棄
   */
  private destroyScrollArea(): void {
    if (this.scrollableContainer) {
      this.scrollableContainer.destroy();
      this.scrollableContainer = null;
    }
  }
}
