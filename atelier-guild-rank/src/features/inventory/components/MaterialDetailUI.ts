/**
 * MaterialDetailUI コンポーネント
 * TASK-0086: features/inventory/components作成
 *
 * 素材の詳細情報（名前、品質、属性）を表示するコンポーネント。
 * BaseComponentを継承し、統一されたライフサイクルに従う。
 */

import type { MaterialInstance } from '@domain/entities/MaterialInstance';
import { BaseComponent } from '@shared/components';
import { Colors, THEME } from '@shared/theme';
import type Phaser from 'phaser';

// =============================================================================
// 定数
// =============================================================================

/** パネル寸法 */
const PANEL = {
  WIDTH: 200,
  HEIGHT: 160,
  PADDING: 12,
} as const;

/** テキストスタイル */
const TEXT_STYLES = {
  NAME: { fontSize: `${THEME.sizes.large}px`, color: '#ffffff' },
  QUALITY: { fontSize: `${THEME.sizes.medium}px`, color: '#cccccc' },
  ATTRIBUTE: { fontSize: `${THEME.sizes.small}px`, color: '#aaaaaa' },
  LABEL: { fontSize: `${THEME.sizes.small}px`, color: '#888888' },
} as const;

/** レイアウトオフセット */
const OFFSET = {
  NAME_Y: -50,
  QUALITY_Y: -20,
  ATTR_LABEL_Y: 10,
  ATTR_VALUE_Y: 30,
} as const;

// =============================================================================
// 型定義
// =============================================================================

/** MaterialDetailUIの設定 */
export interface MaterialDetailUIConfig {
  /** 表示する素材 */
  material: MaterialInstance;
}

// =============================================================================
// コンポーネント
// =============================================================================

/**
 * 素材詳細UI
 *
 * 選択された素材の名前、品質、属性などの詳細情報を表示する。
 */
export class MaterialDetailUI extends BaseComponent {
  private config: MaterialDetailUIConfig;
  private created = false;
  private detailElements: Phaser.GameObjects.GameObject[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number, config: MaterialDetailUIConfig) {
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

    this.createBackground();
    this.createDetailContent(this.config.material);
  }

  destroy(): void {
    this.destroyDetailElements();
    this.container.destroy(true);
  }

  /** 表示する素材を更新 */
  updateMaterial(material: MaterialInstance): void {
    this.config = { material };
    this.destroyDetailElements();
    this.createDetailContent(material);
  }

  // ===========================================================================
  // private
  // ===========================================================================

  private createBackground(): void {
    const bg = this.scene.add.rectangle(0, 0, PANEL.WIDTH, PANEL.HEIGHT, Colors.background.card);
    bg.setStrokeStyle(1, Colors.border.primary);
    this.container.add(bg);
  }

  private createDetailContent(material: MaterialInstance): void {
    // 素材名
    const nameText = this.scene.add.text(0, OFFSET.NAME_Y, material.name, TEXT_STYLES.NAME);
    nameText.setOrigin(0.5);
    this.container.add(nameText);
    this.detailElements.push(nameText);

    // 品質表示
    const qualityColor = THEME.qualityColors[material.quality] ?? Colors.text.muted;
    const qualityText = this.scene.add.text(0, OFFSET.QUALITY_Y, `品質: ${material.quality}`, {
      ...TEXT_STYLES.QUALITY,
      color: `#${qualityColor.toString(16).padStart(6, '0')}`,
    });
    qualityText.setOrigin(0.5);
    this.container.add(qualityText);
    this.detailElements.push(qualityText);

    // 属性ラベル
    const attrLabel = this.scene.add.text(0, OFFSET.ATTR_LABEL_Y, '属性:', TEXT_STYLES.LABEL);
    attrLabel.setOrigin(0.5);
    this.container.add(attrLabel);
    this.detailElements.push(attrLabel);

    // 属性値
    const attrStr = material.attributes.join(', ');
    const attrText = this.scene.add.text(
      0,
      OFFSET.ATTR_VALUE_Y,
      attrStr || 'なし',
      TEXT_STYLES.ATTRIBUTE,
    );
    attrText.setOrigin(0.5);
    this.container.add(attrText);
    this.detailElements.push(attrText);
  }

  private destroyDetailElements(): void {
    for (const element of this.detailElements) {
      element.destroy();
    }
    this.detailElements = [];
  }
}
