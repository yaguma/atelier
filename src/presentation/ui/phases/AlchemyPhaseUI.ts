/**
 * AlchemyPhaseUIコンポーネント
 * TASK-0024 調合フェーズUI
 *
 * @description
 * 調合フェーズ全体のUI管理を担当するコンポーネント。
 * レシピ選択、素材スロット配置、品質プレビュー、調合実行を管理する。
 */

import type Phaser from 'phaser';

// =============================================================================
// 定数定義
// =============================================================================

/** UI配置定数 */
const UI_LAYOUT = {
  /** コンポーネント初期X座標 */
  COMPONENT_X: 160,
  /** コンポーネント初期Y座標 */
  COMPONENT_Y: 80,
  /** レシピリストX座標 */
  RECIPE_LIST_X: -100,
  /** レシピリストY座標 */
  RECIPE_LIST_Y: 60,
  /** 調合エリアX座標 */
  ALCHEMY_AREA_X: 150,
  /** 調合エリアY座標 */
  ALCHEMY_AREA_Y: 60,
  /** 素材インベントリY座標 */
  MATERIAL_INVENTORY_Y: 350,
  /** タイトルX座標 */
  TITLE_X: 0,
  /** タイトルY座標 */
  TITLE_Y: 0,
} as const;

/** 素材スロット関連定数 */
const MATERIAL_SLOT = {
  /** 最大素材スロット数 */
  MAX_SLOTS: 3,
  /** スロット幅 */
  SLOT_WIDTH: 60,
  /** スロット高さ */
  SLOT_HEIGHT: 60,
  /** スロット間隔 */
  SLOT_SPACING: 10,
} as const;

/** エラーメッセージ定数 */
const ERROR_MESSAGES = {
  EVENT_BUS_NOT_AVAILABLE: 'EventBus is not available in scene.data',
  ALCHEMY_SERVICE_NOT_AVAILABLE: 'AlchemyService is not available',
  INVENTORY_SERVICE_NOT_AVAILABLE: 'InventoryService is not available',
  FAILED_TO_EMIT_EVENT: 'Failed to emit event:',
  NO_RECIPE_SELECTED: 'No recipe is selected',
  INVALID_SLOT_INDEX: 'Invalid slot index:',
} as const;

/** UIテキスト定数 */
const UI_TEXT = {
  PHASE_TITLE: '🧪 調合フェーズ',
  SELECT_MATERIALS: '素材を選択してください',
  CRAFT_BUTTON: '調合する',
  SKIP_BUTTON: 'スキップ',
  PREVIEW_FORMAT: '完成予測: {name} ({quality}品質)',
  NO_MATERIALS: '所持素材なし',
} as const;

/** スタイル定数 */
const UI_STYLES = {
  TITLE: {
    fontSize: '24px',
    color: '#ffffff',
  },
  LABEL: {
    fontSize: '16px',
    color: '#ffffff',
  },
  PREVIEW: {
    fontSize: '14px',
    color: '#cccccc',
  },
} as const;

/** キーボードショートカット定数 */
const KEYBOARD_KEYS = {
  /** 調合キー */
  CRAFT_UPPER: 'C',
  CRAFT_LOWER: 'c',
  /** スキップキー */
  SKIP_UPPER: 'S',
  SKIP_LOWER: 's',
  /** キャンセルキー */
  CANCEL: 'Escape',
  /** 確定キー */
  CONFIRM: 'Enter',
} as const;

/**
 * EventBusインターフェース
 */
interface IEventBus {
  emit(event: string, payload?: unknown): void;
  on(event: string, callback: (payload?: unknown) => void): void;
  off(event: string, callback: (payload?: unknown) => void): void;
  once(event: string, callback: (payload?: unknown) => void): void;
}

/**
 * 品質タイプ
 */
type Quality = 'C' | 'B' | 'A' | 'S';

/**
 * MaterialInstanceインターフェース
 */
interface MaterialInstance {
  instanceId: string;
  materialId: string;
  name: string;
  quality: Quality;
  isRare: boolean;
}

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
 * Itemインターフェース
 */
interface Item {
  id: string;
  itemId: string;
  name: string;
  quality: Quality;
  attributes: { name: string; value: number }[];
}

/**
 * CraftResultインターフェース
 */
interface CraftResult {
  success: boolean;
  item?: Item;
  consumedMaterials: MaterialInstance[];
  errorMessage?: string;
}

/**
 * IAlchemyServiceインターフェース
 */
interface IAlchemyService {
  getAvailableRecipes(materials: MaterialInstance[]): ItemMaster[];
  previewQuality(recipeId: string, materials: MaterialInstance[]): Quality;
  craft(recipeId: string, materials: MaterialInstance[]): CraftResult;
  canCraft(recipeId: string, materials: MaterialInstance[]): boolean;
}

/**
 * IInventoryServiceインターフェース
 */
interface IInventoryService {
  getMaterials(): MaterialInstance[];
  removeMaterials(materialIds: string[]): void;
  addItem(item: Item): void;
}

/**
 * RecipeCardUIインターフェース
 */
interface RecipeCardUI {
  recipe: ItemMaster;
  destroy(): void;
}

/**
 * MaterialSlotUIインターフェース
 */
interface MaterialSlotUI {
  index: number;
  material: MaterialInstance | null;
  setMaterial(material: MaterialInstance | null): void;
  clear(): void;
  destroy(): void;
}

/**
 * Buttonインターフェース
 */
interface Button {
  isEnabled(): boolean;
  setEnabled(enabled: boolean): void;
  destroy(): void;
}

/**
 * ScrollablePanelインターフェース
 */
interface ScrollablePanel {
  destroy(): void;
}

/**
 * GameEventType定義
 */
const GameEventType = {
  RECIPE_SELECTED: 'RECIPE_SELECTED',
  MATERIAL_SLOT_UPDATED: 'MATERIAL_SLOT_UPDATED',
  QUALITY_PREVIEW_CHANGED: 'QUALITY_PREVIEW_CHANGED',
  CRAFT_STARTED: 'CRAFT_STARTED',
  CRAFT_COMPLETED: 'CRAFT_COMPLETED',
  ACTION_POINTS_CONSUMED: 'ACTION_POINTS_CONSUMED',
  PHASE_TRANSITION_REQUESTED: 'PHASE_TRANSITION_REQUESTED',
} as const;

/**
 * BaseComponentクラス（簡易実装）
 * UIコンポーネントの基底クラス
 */
export abstract class BaseComponent {
  protected scene: Phaser.Scene;
  protected container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.container = scene.add.container(x, y);
  }

  public abstract create(): void;
  public abstract destroy(): void;

  public getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  public setVisible(visible: boolean): this {
    this.container.setVisible(visible);
    return this;
  }

  public setPosition(x: number, y: number): this {
    this.container.setPosition(x, y);
    return this;
  }
}

/**
 * AlchemyPhaseUIコンポーネント
 *
 * 調合フェーズのUIを管理するコンポーネント。
 * レシピ選択、素材スロット配置、品質プレビュー、調合実行を行う。
 */
export class AlchemyPhaseUI extends BaseComponent {
  /** EventBus参照 */
  private eventBus: IEventBus | null = null;

  /** AlchemyService参照 */
  private alchemyService: IAlchemyService | null = null;

  /** InventoryService参照 */
  private inventoryService: IInventoryService | null = null;

  /** レシピリスト */
  private recipeList: ScrollablePanel | null = null;

  /** 素材スロット */
  private materialSlots: MaterialSlotUI[] = [];

  /** プレビューテキスト */
  private previewText: Phaser.GameObjects.Text | null = null;

  /** 調合ボタン */
  private craftButton: Button | null = null;

  /** スキップボタン */
  private skipButton: Button | null = null;

  /** 選択中のレシピ */
  private selectedRecipe: ItemMaster | null = null;

  /** 選択中の素材 */
  private selectedMaterials: (MaterialInstance | null)[] = [];

  /** レシピカードリスト */
  private recipeCards: RecipeCardUI[] = [];

  /** キーボードリスナー関数 */
  private keyboardHandler: ((event: { key: string }) => void) | null = null;

  /**
   * コンストラクタ
   * @param scene - Phaserシーンインスタンス
   */
  constructor(scene: Phaser.Scene) {
    super(scene, UI_LAYOUT.COMPONENT_X, UI_LAYOUT.COMPONENT_Y);

    this.initializeServices();
    this.create();
  }

  /**
   * サービスを初期化
   */
  private initializeServices(): void {
    this.eventBus = this.scene.data.get('eventBus');
    if (!this.eventBus) {
      console.warn(ERROR_MESSAGES.EVENT_BUS_NOT_AVAILABLE);
    }

    this.alchemyService = this.scene.data.get('alchemyService');
    if (!this.alchemyService) {
      console.warn(ERROR_MESSAGES.ALCHEMY_SERVICE_NOT_AVAILABLE);
    }

    this.inventoryService = this.scene.data.get('inventoryService');
    if (!this.inventoryService) {
      console.warn(ERROR_MESSAGES.INVENTORY_SERVICE_NOT_AVAILABLE);
    }
  }

  /**
   * UIコンポーネント初期化
   */
  public create(): void {
    // タイトルを作成
    this.createTitle();

    // レシピリストを作成
    this.createRecipeList();

    // 調合エリアを作成
    this.createAlchemyArea();

    // 素材インベントリを作成
    this.createMaterialInventory();

    // 調合ボタンを作成
    this.createCraftButton();

    // キーボードリスナーを登録
    this.setupKeyboardListener();
  }

  /**
   * タイトルを作成
   */
  private createTitle(): void {
    const title = this.scene.add.text(
      UI_LAYOUT.TITLE_X,
      UI_LAYOUT.TITLE_Y,
      UI_TEXT.PHASE_TITLE,
      UI_STYLES.TITLE,
    );
    this.container.add(title);
  }

  /**
   * レシピリストを作成
   */
  private createRecipeList(): void {
    if (!this.alchemyService || !this.inventoryService) {
      return;
    }

    // 調合可能なレシピを取得
    const materials = this.inventoryService.getMaterials();
    const recipes = this.alchemyService.getAvailableRecipes(materials);

    // レシピカードを作成
    this.destroyRecipeCards();

    this.recipeCards = recipes.map((recipe) => ({
      recipe,
      destroy: () => {},
    }));

    // 簡易的なリスト表示（将来的にrexUIのScrollablePanelを使用）
    const listContainer = this.scene.add.container(
      UI_LAYOUT.RECIPE_LIST_X,
      UI_LAYOUT.RECIPE_LIST_Y,
    );

    recipes.forEach((recipe, index) => {
      const recipeText = this.scene.add.text(
        0,
        index * 30,
        `▷ ${recipe.name}`,
        UI_STYLES.LABEL,
      );
      recipeText.setInteractive({ useHandCursor: true });
      recipeText.on('pointerdown', () => this.onRecipeSelect(recipe));
      listContainer.add(recipeText);
    });

    this.container.add(listContainer);

    this.recipeList = {
      destroy: () => listContainer.destroy(),
    };
  }

  /**
   * 調合エリアを作成
   */
  private createAlchemyArea(): void {
    const alchemyContainer = this.scene.add.container(
      UI_LAYOUT.ALCHEMY_AREA_X,
      UI_LAYOUT.ALCHEMY_AREA_Y,
    );

    // 素材スロットラベル
    const slotsLabel = this.scene.add.text(
      0,
      0,
      '素材スロット:',
      UI_STYLES.LABEL,
    );
    alchemyContainer.add(slotsLabel);

    // 素材スロットを作成
    this.createMaterialSlots(alchemyContainer);

    // プレビューエリア
    this.previewText = this.scene.add.text(
      0,
      150,
      UI_TEXT.SELECT_MATERIALS,
      UI_STYLES.PREVIEW,
    );
    alchemyContainer.add(this.previewText);

    this.container.add(alchemyContainer);
  }

  /**
   * 素材スロットを作成
   * @param parent - 親コンテナ
   */
  private createMaterialSlots(parent: Phaser.GameObjects.Container): void {
    this.destroyMaterialSlots();

    for (let i = 0; i < MATERIAL_SLOT.MAX_SLOTS; i++) {
      const slotX = i * (MATERIAL_SLOT.SLOT_WIDTH + MATERIAL_SLOT.SLOT_SPACING);
      const slotY = 30;

      // スロット枠を作成
      const slotRect = this.scene.add.rectangle(
        slotX,
        slotY,
        MATERIAL_SLOT.SLOT_WIDTH,
        MATERIAL_SLOT.SLOT_HEIGHT,
        0x333333,
        0.5,
      );
      slotRect.setStrokeStyle(2, 0xcccccc);
      slotRect.setInteractive({ useHandCursor: true });
      slotRect.on('pointerdown', () => this.onSlotClick(i));
      parent.add(slotRect);

      // スロットUIオブジェクトを作成
      const slotUI: MaterialSlotUI = {
        index: i,
        material: null,
        setMaterial: (material: MaterialInstance | null) => {
          slotUI.material = material;
        },
        clear: () => {
          slotUI.material = null;
        },
        destroy: () => {},
      };

      this.materialSlots.push(slotUI);
      this.selectedMaterials.push(null);
    }
  }

  /**
   * 素材インベントリを作成
   */
  private createMaterialInventory(): void {
    if (!this.inventoryService) {
      return;
    }

    const inventoryContainer = this.scene.add.container(
      0,
      UI_LAYOUT.MATERIAL_INVENTORY_Y,
    );

    // 所持素材ラベル
    const label = this.scene.add.text(0, 0, '所持素材:', UI_STYLES.LABEL);
    inventoryContainer.add(label);

    // 所持素材一覧
    const materials = this.inventoryService.getMaterials();
    const materialsText =
      materials.length > 0
        ? materials.map((m) => `[${m.name}${m.quality}]`).join(' ')
        : UI_TEXT.NO_MATERIALS;

    const materialsDisplay = this.scene.add.text(
      0,
      25,
      materialsText,
      UI_STYLES.PREVIEW,
    );
    inventoryContainer.add(materialsDisplay);

    this.container.add(inventoryContainer);
  }

  /**
   * 調合ボタンを作成
   */
  private createCraftButton(): void {
    const buttonY = 280;

    // 調合ボタン（簡易実装）
    const craftButtonRect = this.scene.add.rectangle(
      UI_LAYOUT.ALCHEMY_AREA_X,
      buttonY,
      120,
      40,
      0xff9800,
    );
    craftButtonRect.setInteractive({ useHandCursor: true });
    craftButtonRect.on('pointerdown', () => this.onCraft());

    const craftButtonText = this.scene.add.text(
      UI_LAYOUT.ALCHEMY_AREA_X,
      buttonY,
      UI_TEXT.CRAFT_BUTTON,
      UI_STYLES.LABEL,
    );
    craftButtonText.setOrigin(0.5);

    this.container.add([craftButtonRect, craftButtonText]);

    this.craftButton = {
      isEnabled: () => this.canCraft(),
      setEnabled: (enabled: boolean) => {
        craftButtonRect.setAlpha(enabled ? 1 : 0.5);
        craftButtonRect.setInteractive(enabled);
      },
      destroy: () => {
        craftButtonRect.destroy();
        craftButtonText.destroy();
      },
    };

    // スキップボタン（簡易実装）
    const skipButtonRect = this.scene.add.rectangle(
      UI_LAYOUT.ALCHEMY_AREA_X + 140,
      buttonY,
      100,
      40,
      0x666666,
    );
    skipButtonRect.setInteractive({ useHandCursor: true });
    skipButtonRect.on('pointerdown', () => this.onSkip());

    const skipButtonText = this.scene.add.text(
      UI_LAYOUT.ALCHEMY_AREA_X + 140,
      buttonY,
      UI_TEXT.SKIP_BUTTON,
      UI_STYLES.LABEL,
    );
    skipButtonText.setOrigin(0.5);

    this.container.add([skipButtonRect, skipButtonText]);

    this.skipButton = {
      isEnabled: () => true,
      setEnabled: () => {},
      destroy: () => {
        skipButtonRect.destroy();
        skipButtonText.destroy();
      },
    };
  }

  /**
   * キーボードリスナーを設定
   */
  private setupKeyboardListener(): void {
    this.keyboardHandler = (event: { key: string }) => {
      this.handleKeyboardInput(event);
    };
    this.scene.input.keyboard.on('keydown', this.keyboardHandler);
  }

  /**
   * レシピ選択時の処理
   * @param recipe - 選択されたレシピ
   */
  private onRecipeSelect(recipe: ItemMaster): void {
    this.selectedRecipe = recipe;
    this.selectedMaterials = new Array(MATERIAL_SLOT.MAX_SLOTS).fill(null);

    // 素材スロットをクリア
    for (const slot of this.materialSlots) {
      slot.clear();
    }

    // プレビューを更新
    this.updatePreview();

    // RECIPE_SELECTEDイベントを発行
    this.emitEvent(GameEventType.RECIPE_SELECTED, {
      recipeId: recipe.id,
    });
  }

  /**
   * スロットクリック時の処理
   * @param slotIndex - スロットインデックス
   */
  private onSlotClick(slotIndex: number): void {
    if (!this.selectedRecipe) {
      console.warn(ERROR_MESSAGES.NO_RECIPE_SELECTED);
      return;
    }

    if (slotIndex < 0 || slotIndex >= MATERIAL_SLOT.MAX_SLOTS) {
      console.error(`${ERROR_MESSAGES.INVALID_SLOT_INDEX} ${slotIndex}`);
      return;
    }

    // 簡易実装: 最初の利用可能な素材を自動選択
    if (this.inventoryService) {
      const materials = this.inventoryService.getMaterials();
      if (materials.length > slotIndex) {
        this.onMaterialDrop(slotIndex, materials[slotIndex]);
      }
    }
  }

  /**
   * 素材ドロップ時の処理
   * @param slot - スロットインデックス
   * @param material - 素材インスタンス
   */
  private onMaterialDrop(slot: number, material: MaterialInstance): void {
    this.selectedMaterials[slot] = material;
    this.materialSlots[slot].setMaterial(material);

    // プレビューを更新
    this.updatePreview();

    // MATERIAL_SLOT_UPDATEDイベントを発行
    this.emitEvent(GameEventType.MATERIAL_SLOT_UPDATED, {
      slotIndex: slot,
      materialId: material.materialId,
    });
  }

  /**
   * プレビューを更新
   */
  private updatePreview(): void {
    if (!this.previewText) {
      return;
    }

    if (!this.selectedRecipe || !this.canCraft()) {
      this.previewText.setText(UI_TEXT.SELECT_MATERIALS);
      this.craftButton?.setEnabled(false);
      return;
    }

    if (!this.alchemyService) {
      return;
    }

    const materials = this.selectedMaterials.filter(
      (m): m is MaterialInstance => m !== null,
    );
    const quality = this.alchemyService.previewQuality(
      this.selectedRecipe.id,
      materials,
    );

    const previewText = UI_TEXT.PREVIEW_FORMAT.replace(
      '{name}',
      this.selectedRecipe.name,
    ).replace('{quality}', quality);

    this.previewText.setText(previewText);
    this.craftButton?.setEnabled(true);

    // QUALITY_PREVIEW_CHANGEDイベントを発行
    this.emitEvent(GameEventType.QUALITY_PREVIEW_CHANGED, {
      previewQuality: quality,
    });
  }

  /**
   * 調合実行
   */
  private onCraft(): void {
    if (!this.canCraft() || !this.selectedRecipe || !this.alchemyService) {
      return;
    }

    const materials = this.selectedMaterials.filter(
      (m): m is MaterialInstance => m !== null,
    );

    // CRAFT_STARTEDイベントを発行
    this.emitEvent(GameEventType.CRAFT_STARTED, {
      recipeId: this.selectedRecipe.id,
      materials: materials.map((m) => m.materialId),
    });

    // 調合を実行
    const result = this.alchemyService.craft(this.selectedRecipe.id, materials);

    if (result.success && result.item) {
      // 素材を消費
      if (this.inventoryService) {
        this.inventoryService.removeMaterials(materials.map((m) => m.instanceId));
        this.inventoryService.addItem(result.item);
      }

      // 調合結果を表示
      this.showCraftResult(result.item);

      // CRAFT_COMPLETEDイベントを発行
      this.emitEvent(GameEventType.CRAFT_COMPLETED, {
        itemId: result.item.itemId,
        quality: result.item.quality,
        consumedMaterials: materials,
      });

      // リセット
      this.reset();
    } else {
      console.error('調合に失敗しました:', result.errorMessage);
    }
  }

  /**
   * スキップ処理
   */
  private onSkip(): void {
    // PHASE_TRANSITION_REQUESTEDイベントを発行
    this.emitEvent(GameEventType.PHASE_TRANSITION_REQUESTED, {
      from: 'alchemy',
      to: 'delivery',
    });
  }

  /**
   * 調合結果を表示
   * @param item - 完成したアイテム
   */
  private showCraftResult(item: Item): void {
    if (!this.previewText) {
      return;
    }

    this.previewText.setText(`調合成功！ ${item.name} (${item.quality}品質)`);
  }

  /**
   * リセット
   */
  private reset(): void {
    this.selectedRecipe = null;
    this.selectedMaterials = new Array(MATERIAL_SLOT.MAX_SLOTS).fill(null);

    for (const slot of this.materialSlots) {
      slot.clear();
    }

    if (this.previewText) {
      this.previewText.setText(UI_TEXT.SELECT_MATERIALS);
    }

    this.craftButton?.setEnabled(false);
  }

  /**
   * 調合可能かチェック
   * @returns 調合可能な場合true
   */
  private canCraft(): boolean {
    if (!this.selectedRecipe || !this.alchemyService) {
      return false;
    }

    const materials = this.selectedMaterials.filter(
      (m): m is MaterialInstance => m !== null,
    );

    if (materials.length === 0) {
      return false;
    }

    return this.alchemyService.canCraft(this.selectedRecipe.id, materials);
  }

  /**
   * キーボード入力を処理
   * @param event - キーボードイベント
   */
  private handleKeyboardInput(event: { key: string }): void {
    const { key } = event;

    switch (key) {
      case KEYBOARD_KEYS.CRAFT_UPPER:
      case KEYBOARD_KEYS.CRAFT_LOWER:
      case KEYBOARD_KEYS.CONFIRM:
        if (this.canCraft()) {
          this.onCraft();
        }
        break;
      case KEYBOARD_KEYS.SKIP_UPPER:
      case KEYBOARD_KEYS.SKIP_LOWER:
        this.onSkip();
        break;
      case KEYBOARD_KEYS.CANCEL:
        this.reset();
        break;
    }
  }

  /**
   * イベントを安全に発行
   * @param eventType - イベントタイプ
   * @param payload - ペイロード
   */
  private emitEvent(eventType: string, payload: unknown): void {
    if (!this.eventBus) {
      return;
    }

    try {
      this.eventBus.emit(eventType, payload);
    } catch (error) {
      console.error(ERROR_MESSAGES.FAILED_TO_EMIT_EVENT, eventType, error);
    }
  }

  /**
   * レシピカードを全て破棄
   */
  private destroyRecipeCards(): void {
    for (const card of this.recipeCards) {
      card?.destroy?.();
    }
    this.recipeCards = [];
  }

  /**
   * 素材スロットを全て破棄
   */
  private destroyMaterialSlots(): void {
    for (const slot of this.materialSlots) {
      slot?.destroy?.();
    }
    this.materialSlots = [];
    this.selectedMaterials = [];
  }

  /**
   * キーボードリスナーを解除
   */
  private removeKeyboardListener(): void {
    if (this.keyboardHandler) {
      this.scene.input.keyboard.off('keydown', this.keyboardHandler);
      this.keyboardHandler = null;
    }
  }

  /**
   * リソース解放
   */
  public destroy(): void {
    this.destroyRecipeCards();
    this.destroyMaterialSlots();
    this.removeKeyboardListener();

    if (this.recipeList) {
      this.recipeList.destroy();
      this.recipeList = null;
    }

    if (this.craftButton) {
      this.craftButton.destroy();
      this.craftButton = null;
    }

    if (this.skipButton) {
      this.skipButton.destroy();
      this.skipButton = null;
    }

    if (this.container) {
      this.container.destroy();
    }
  }
}
