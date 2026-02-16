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
import Phaser from 'phaser';

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
    const bg = new Phaser.GameObjects.Rectangle(
      this.scene,
      0,
      0,
      PANEL.WIDTH,
      PANEL.HEIGHT,
      Colors.background.card,
    );
    bg.setStrokeStyle(1, Colors.border.primary);
    this.container.add(bg);
  }

  private createDetailContent(material: MaterialInstance): void {
    // 素材名
    const nameText = this.scene.make.text({
      x: 0,
      y: OFFSET.NAME_Y,
      text: material.name,
      style: TEXT_STYLES.NAME,
      add: false,
    });
    nameText.setOrigin(0.5);
    this.container.add(nameText);
    this.detailElements.push(nameText);

    // 品質表示
    const qualityColor = THEME.qualityColors[material.quality] ?? Colors.text.muted;
    const qualityText = this.scene.make.text({
      x: 0,
      y: OFFSET.QUALITY_Y,
      text: `品質: ${material.quality}`,
      style: {
        ...TEXT_STYLES.QUALITY,
        color: `#${qualityColor.toString(16).padStart(6, '0')}`,
      },
      add: false,
    });
    qualityText.setOrigin(0.5);
    this.container.add(qualityText);
    this.detailElements.push(qualityText);

    // 属性ラベル
    const attrLabel = this.scene.make.text({
      x: 0,
      y: OFFSET.ATTR_LABEL_Y,
      text: '属性:',
      style: TEXT_STYLES.LABEL,
      add: false,
    });
    attrLabel.setOrigin(0.5);
    this.container.add(attrLabel);
    this.detailElements.push(attrLabel);

    // 属性値
    const attrStr = material.attributes.join(', ');
    const attrText = this.scene.make.text({
      x: 0,
      y: OFFSET.ATTR_VALUE_Y,
      text: attrStr || 'なし',
      style: TEXT_STYLES.ATTRIBUTE,
      add: false,
    });
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
