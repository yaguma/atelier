/**
 * MaterialSlotUIコンポーネント
 * TASK-0024 調合フェーズUI - 素材スロット
 *
 * @description
 * 調合に使用する素材を配置するスロットUIコンポーネント。
 * ドラッグ&ドロップやクリックによる素材の選択をサポートする。
 */

import type Phaser from 'phaser';

// =============================================================================
// 定数定義
// =============================================================================

/** スロット配置定数 */
const SLOT_LAYOUT = {
  /** スロット幅 */
  WIDTH: 60,
  /** スロット高さ */
  HEIGHT: 60,
  /** アイコンサイズ */
  ICON_SIZE: 40,
  /** 品質表示サイズ */
  QUALITY_SIZE: 16,
} as const;

/** スロット状態定数 */
const SLOT_STATE = {
  /** 空スロットの背景色 */
  EMPTY_BG_COLOR: 0x333333,
  /** 空スロットの透明度 */
  EMPTY_ALPHA: 0.5,
  /** 素材配置時の背景色 */
  FILLED_BG_COLOR: 0x444444,
  /** 素材配置時の透明度 */
  FILLED_ALPHA: 0.8,
  /** ホバー時の背景色 */
  HOVER_BG_COLOR: 0x555555,
  /** 選択時の枠線色 */
  SELECTED_BORDER_COLOR: 0xffff00,
  /** 通常時の枠線色 */
  DEFAULT_BORDER_COLOR: 0xcccccc,
  /** 枠線幅 */
  BORDER_WIDTH: 2,
} as const;

/** スタイル定数 */
const SLOT_STYLES = {
  EMPTY_TEXT: {
    fontSize: '32px',
    color: '#666666',
  },
  MATERIAL_NAME: {
    fontSize: '10px',
    color: '#ffffff',
  },
  QUALITY_TEXT: {
    fontSize: '12px',
    color: '#ffffff',
  },
} as const;

/** UIテキスト定数 */
const SLOT_TEXT = {
  EMPTY_INDICATOR: '+',
} as const;

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
 * MaterialSlotUIコンポーネントのプロパティ
 */
export interface MaterialSlotUIProps {
  /** スロットインデックス */
  index: number;
  /** スロットクリック時のコールバック */
  onSlotClick?: (index: number) => void;
  /** 素材ドロップ時のコールバック */
  onMaterialDrop?: (index: number, material: MaterialInstance) => void;
  /** 素材削除時のコールバック */
  onMaterialRemove?: (index: number) => void;
}

/**
 * MaterialSlotUIコンポーネント
 *
 * 素材を配置するスロットを表示し、素材の配置/削除を管理する。
 * 空スロットには「+」アイコンを表示し、素材配置時には素材情報を表示する。
 */
export class MaterialSlotUI {
  /** Phaserシーン */
  private scene: Phaser.Scene;

  /** コンテナ */
  private container: Phaser.GameObjects.Container;

  /** スロットインデックス */
  private index: number;

  /** 配置された素材 */
  private material: MaterialInstance | null = null;

  /** 背景矩形 */
  private background: Phaser.GameObjects.Rectangle | null = null;

  /** 枠線矩形 */
  private border: Phaser.GameObjects.Rectangle | null = null;

  /** 空スロットインジケーター */
  private emptyIndicator: Phaser.GameObjects.Text | null = null;

  /** 素材名テキスト */
  private materialNameText: Phaser.GameObjects.Text | null = null;

  /** 品質テキスト */
  private qualityText: Phaser.GameObjects.Text | null = null;

  /** スロットクリックコールバック */
  private onSlotClickCallback?: (index: number) => void;

  /** 素材ドロップコールバック */
  private onMaterialDropCallback?: (index: number, material: MaterialInstance) => void;

  /** 素材削除コールバック */
  private onMaterialRemoveCallback?: (index: number) => void;

  /** ホバー状態 */
  private isHovered = false;

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
    props: MaterialSlotUIProps,
  ) {
    this.scene = scene;
    this.container = scene.add.container(x, y);
    this.index = props.index;
    this.onSlotClickCallback = props.onSlotClick;
    this.onMaterialDropCallback = props.onMaterialDrop;
    this.onMaterialRemoveCallback = props.onMaterialRemove;

    this.createSlot();
  }

  /**
   * スロットを作成
   */
  private createSlot(): void {
    // 背景矩形
    this.background = this.scene.add.rectangle(
      0,
      0,
      SLOT_LAYOUT.WIDTH,
      SLOT_LAYOUT.HEIGHT,
      SLOT_STATE.EMPTY_BG_COLOR,
      SLOT_STATE.EMPTY_ALPHA,
    );
    this.container.add(this.background);

    // 枠線矩形
    this.border = this.scene.add.rectangle(
      0,
      0,
      SLOT_LAYOUT.WIDTH,
      SLOT_LAYOUT.HEIGHT,
    );
    this.border.setStrokeStyle(
      SLOT_STATE.BORDER_WIDTH,
      SLOT_STATE.DEFAULT_BORDER_COLOR,
    );
    this.container.add(this.border);

    // 空スロットインジケーター
    this.emptyIndicator = this.scene.add.text(
      0,
      0,
      SLOT_TEXT.EMPTY_INDICATOR,
      SLOT_STYLES.EMPTY_TEXT,
    );
    this.emptyIndicator.setOrigin(0.5);
    this.container.add(this.emptyIndicator);

    // インタラクションを設定
    this.setupInteraction();
  }

  /**
   * インタラクションを設定
   */
  private setupInteraction(): void {
    if (!this.background) {
      return;
    }

    this.background.setInteractive({ useHandCursor: true });

    // クリックイベント
    this.background.on('pointerdown', () => {
      this.handleSlotClick();
    });

    // ホバーイベント
    this.background.on('pointerover', () => {
      this.isHovered = true;
      this.updateVisualState();
    });

    this.background.on('pointerout', () => {
      this.isHovered = false;
      this.updateVisualState();
    });
  }

  /**
   * スロットクリックを処理
   */
  private handleSlotClick(): void {
    if (this.material && this.onMaterialRemoveCallback) {
      // 素材が配置されている場合は削除
      this.onMaterialRemoveCallback(this.index);
      this.clearMaterial();
    } else if (!this.material && this.onSlotClickCallback) {
      // 空スロットの場合は選択ダイアログを表示
      this.onSlotClickCallback(this.index);
    }
  }

  /**
   * 素材を設定
   * @param material - 素材インスタンス
   */
  public setMaterial(material: MaterialInstance): void {
    this.material = material;
    this.updateSlotDisplay();
    this.updateVisualState();

    if (this.onMaterialDropCallback) {
      this.onMaterialDropCallback(this.index, material);
    }
  }

  /**
   * 素材をクリア
   */
  public clearMaterial(): void {
    this.material = null;
    this.updateSlotDisplay();
    this.updateVisualState();
  }

  /**
   * スロットの表示を更新
   */
  private updateSlotDisplay(): void {
    if (this.material) {
      this.showMaterial();
    } else {
      this.showEmpty();
    }
  }

  /**
   * 素材表示を表示
   */
  private showMaterial(): void {
    if (!this.material) {
      return;
    }

    // 空スロットインジケーターを非表示
    if (this.emptyIndicator) {
      this.emptyIndicator.setVisible(false);
    }

    // 素材名を表示
    if (!this.materialNameText) {
      this.materialNameText = this.scene.add.text(
        0,
        15,
        '',
        SLOT_STYLES.MATERIAL_NAME,
      );
      this.materialNameText.setOrigin(0.5);
      this.container.add(this.materialNameText);
    }
    this.materialNameText.setText(this.material.name);
    this.materialNameText.setVisible(true);

    // 品質を表示
    if (!this.qualityText) {
      this.qualityText = this.scene.add.text(
        0,
        -15,
        '',
        SLOT_STYLES.QUALITY_TEXT,
      );
      this.qualityText.setOrigin(0.5);
      this.container.add(this.qualityText);
    }
    this.qualityText.setText(`(${this.material.quality})`);
    this.qualityText.setVisible(true);
    this.qualityText.setStyle({
      ...SLOT_STYLES.QUALITY_TEXT,
      color: this.getQualityColor(this.material.quality),
    });
  }

  /**
   * 空スロット表示を表示
   */
  private showEmpty(): void {
    // 空スロットインジケーターを表示
    if (this.emptyIndicator) {
      this.emptyIndicator.setVisible(true);
    }

    // 素材情報を非表示
    if (this.materialNameText) {
      this.materialNameText.setVisible(false);
    }
    if (this.qualityText) {
      this.qualityText.setVisible(false);
    }
  }

  /**
   * ビジュアル状態を更新
   */
  private updateVisualState(): void {
    if (!this.background || !this.border) {
      return;
    }

    // 背景色を更新
    if (this.isHovered) {
      this.background.setFillStyle(SLOT_STATE.HOVER_BG_COLOR);
    } else if (this.material) {
      this.background.setFillStyle(
        SLOT_STATE.FILLED_BG_COLOR,
        SLOT_STATE.FILLED_ALPHA,
      );
    } else {
      this.background.setFillStyle(
        SLOT_STATE.EMPTY_BG_COLOR,
        SLOT_STATE.EMPTY_ALPHA,
      );
    }
  }

  /**
   * 品質に応じた色を取得
   * @param quality - 品質
   * @returns 色コード
   */
  private getQualityColor(quality: Quality): string {
    const colorMap: Record<Quality, string> = {
      C: '#9E9E9E', // グレー
      B: '#4CAF50', // 緑
      A: '#2196F3', // 青
      S: '#FFD700', // 金
    };
    return colorMap[quality];
  }

  /**
   * スロットインデックスを取得
   * @returns スロットインデックス
   */
  public getIndex(): number {
    return this.index;
  }

  /**
   * 素材を取得
   * @returns 配置された素材
   */
  public getMaterial(): MaterialInstance | null {
    return this.material;
  }

  /**
   * 素材が配置されているか確認
   * @returns 素材が配置されている場合true
   */
  public hasMaterial(): boolean {
    return this.material !== null;
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
   * リソース解放
   */
  public destroy(): void {
    this.material = null;

    if (this.background) {
      this.background.destroy();
      this.background = null;
    }

    if (this.border) {
      this.border.destroy();
      this.border = null;
    }

    if (this.emptyIndicator) {
      this.emptyIndicator.destroy();
      this.emptyIndicator = null;
    }

    if (this.materialNameText) {
      this.materialNameText.destroy();
      this.materialNameText = null;
    }

    if (this.qualityText) {
      this.qualityText.destroy();
      this.qualityText = null;
    }

    this.container.destroy();
  }
}
