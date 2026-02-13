/**
 * MaterialListUI コンポーネント
 * TASK-0086: features/inventory/components作成
 *
 * 素材一覧をカード形式で表示し、素材選択機能を提供するコンポーネント。
 * BaseComponentを継承し、統一されたライフサイクルに従う。
 */

import type { MaterialInstance } from '@domain/entities/MaterialInstance';
import { BaseComponent } from '@shared/components';
import { Colors, THEME } from '@shared/theme';
import type Phaser from 'phaser';

// =============================================================================
// 定数
// =============================================================================

/** カード寸法 */
const CARD = {
  WIDTH: 80,
  HEIGHT: 100,
  SPACING: 16,
  MAX_DISPLAY: 8,
} as const;

/** テキストスタイル */
const TEXT_STYLES = {
  LABEL: { fontSize: `${THEME.sizes.medium}px`, color: '#ffffff' },
  MATERIAL_NAME: { fontSize: `${THEME.sizes.small}px`, color: '#ffffff' },
  MATERIAL_QUALITY: { fontSize: '10px', color: '#cccccc' },
  EMPTY_MESSAGE: { fontSize: `${THEME.sizes.small}px`, color: '#888888' },
} as const;

/** レイアウト */
const LAYOUT = {
  LABEL_Y: 0,
  LIST_Y: 25,
  QUALITY_INDICATOR_HEIGHT: 3,
  QUALITY_INDICATOR_MARGIN: 5,
} as const;

// =============================================================================
// 型定義
// =============================================================================

/** MaterialListUIの設定 */
export interface MaterialListUIConfig {
  /** 表示する素材リスト */
  materials: MaterialInstance[];
  /** 素材選択時のコールバック */
  onMaterialSelect: (material: MaterialInstance) => void;
}

/** 素材カード内部型 */
interface MaterialCardEntry {
  material: MaterialInstance;
  cardContainer: Phaser.GameObjects.Container;
  background: Phaser.GameObjects.Rectangle;
}

// =============================================================================
// コンポーネント
// =============================================================================

/**
 * 素材リストUI
 *
 * 素材一覧をカード形式で表示し、選択機能を提供する。
 */
export class MaterialListUI extends BaseComponent {
  private readonly config: MaterialListUIConfig;
  private materialCards: MaterialCardEntry[] = [];
  private selectedMaterial: MaterialInstance | null = null;
  private created = false;

  constructor(scene: Phaser.Scene, x: number, y: number, config: MaterialListUIConfig) {
    super(scene, x, y);
    if (!config) {
      throw new Error('config is required');
    }
    this.config = config;
  }

  create(): void {
    if (this.created) {
      return;
    }
    this.created = true;

    this.createLabel();

    if (this.config.materials.length === 0) {
      this.createEmptyMessage();
    } else {
      this.createMaterialCards();
    }
  }

  destroy(): void {
    this.destroyMaterialCards();
    this.selectedMaterial = null;
    this.container.destroy(true);
  }

  /** 選択中の素材を取得 */
  getSelectedMaterial(): MaterialInstance | null {
    return this.selectedMaterial;
  }

  /** 選択をクリア */
  clearSelection(): void {
    this.selectedMaterial = null;
    this.updateCardStyles();
  }

  /** 素材リストを更新 */
  updateMaterials(materials: MaterialInstance[]): void {
    this.config.materials = materials;
    this.destroyMaterialCards();

    if (materials.length === 0) {
      this.createEmptyMessage();
    } else {
      this.createMaterialCards();
    }
  }

  // ===========================================================================
  // private
  // ===========================================================================

  private createLabel(): void {
    const label = this.scene.add.text(0, LAYOUT.LABEL_Y, '素材一覧:', TEXT_STYLES.LABEL);
    this.container.add(label);
  }

  private createEmptyMessage(): void {
    const msg = this.scene.add.text(
      0,
      LAYOUT.LIST_Y,
      '素材がありません',
      TEXT_STYLES.EMPTY_MESSAGE,
    );
    this.container.add(msg);
  }

  private createMaterialCards(): void {
    const materials = this.config.materials.slice(0, CARD.MAX_DISPLAY);

    materials.forEach((material, index) => {
      const cardX = index * (CARD.WIDTH + CARD.SPACING);
      const entry = this.createMaterialCard(material, cardX, LAYOUT.LIST_Y);
      this.materialCards.push(entry);
      this.container.add(entry.cardContainer);
    });
  }

  private createMaterialCard(material: MaterialInstance, x: number, y: number): MaterialCardEntry {
    const cardContainer = this.scene.add.container(x, y);

    // カード背景
    const background = this.scene.add.rectangle(
      0,
      0,
      CARD.WIDTH,
      CARD.HEIGHT,
      Colors.ui.button.normal,
    );
    background.setStrokeStyle(2, Colors.border.primary);
    background.setInteractive({ useHandCursor: true });
    background.on('pointerdown', () => this.onMaterialClick(material));
    background.on('pointerover', () => this.onMaterialHover(material, background));
    background.on('pointerout', () => this.onMaterialOut(material, background));
    cardContainer.add(background);

    // 品質インジケーター
    const qualityColor = THEME.qualityColors[material.quality] ?? Colors.text.muted;
    const indicator = this.scene.add.rectangle(
      0,
      -CARD.HEIGHT / 2 + LAYOUT.QUALITY_INDICATOR_MARGIN,
      CARD.WIDTH - 10,
      LAYOUT.QUALITY_INDICATOR_HEIGHT,
      qualityColor,
    );
    cardContainer.add(indicator);

    // 素材名
    const nameText = this.scene.add.text(0, -15, material.name, TEXT_STYLES.MATERIAL_NAME);
    nameText.setOrigin(0.5);
    nameText.setWordWrapWidth(CARD.WIDTH - 10);
    cardContainer.add(nameText);

    // 品質表示
    const qualityText = this.scene.add.text(
      0,
      10,
      `品質: ${material.quality}`,
      TEXT_STYLES.MATERIAL_QUALITY,
    );
    qualityText.setOrigin(0.5);
    cardContainer.add(qualityText);

    return { material, cardContainer, background };
  }

  private onMaterialClick(material: MaterialInstance): void {
    this.selectedMaterial = material;
    this.updateCardStyles();
    this.config.onMaterialSelect(material);
  }

  private onMaterialHover(
    material: MaterialInstance,
    background: Phaser.GameObjects.Rectangle,
  ): void {
    if (this.selectedMaterial?.instanceId === material.instanceId) {
      return;
    }
    background.setFillStyle(Colors.ui.button.hover);
  }

  private onMaterialOut(
    material: MaterialInstance,
    background: Phaser.GameObjects.Rectangle,
  ): void {
    if (this.selectedMaterial?.instanceId === material.instanceId) {
      background.setFillStyle(Colors.ui.button.active);
    } else {
      background.setFillStyle(Colors.ui.button.normal);
    }
  }

  private updateCardStyles(): void {
    for (const entry of this.materialCards) {
      const isSelected = this.selectedMaterial?.instanceId === entry.material.instanceId;
      if (isSelected) {
        entry.background.setFillStyle(Colors.ui.button.active);
        entry.background.setStrokeStyle(3, Colors.border.gold);
      } else {
        entry.background.setFillStyle(Colors.ui.button.normal);
        entry.background.setStrokeStyle(2, Colors.border.primary);
      }
    }
  }

  private destroyMaterialCards(): void {
    for (const entry of this.materialCards) {
      entry.cardContainer.destroy();
    }
    this.materialCards = [];
  }
}
