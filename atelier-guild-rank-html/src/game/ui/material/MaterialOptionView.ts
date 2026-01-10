/**
 * MaterialOptionView 実装
 *
 * TASK-0220: MaterialOptionView設計・実装
 * 採取フェーズで素材選択肢をグリッド表示するコンポーネント
 */

import Phaser from 'phaser';
import { Material } from '../../../domain/material/MaterialEntity';
import type {
  IMaterialOptionView,
  MaterialOption,
  MaterialOptionViewOptions,
} from './IMaterialOptionView';
import { MaterialOptionLayout, MaterialQualityColors } from './MaterialConstants';
import { Colors } from '../../config/ColorPalette';
import { TextStyles } from '../../config/TextStyles';

/**
 * 選択肢アイテムデータ
 */
interface OptionItemData {
  container: Phaser.GameObjects.Container;
  option: MaterialOption;
  selected: boolean;
}

/**
 * MaterialOptionViewクラス
 *
 * 素材選択肢をグリッドで表示し、選択操作を提供する。
 */
export class MaterialOptionView implements IMaterialOptionView {
  public readonly container: Phaser.GameObjects.Container;

  private scene: Phaser.Scene;
  private options: MaterialOption[] = [];
  private optionItems: OptionItemData[] = [];
  private selectedMaterials: Material[] = [];
  private maxSelections: number;
  private enabled: boolean = true;

  private onSelect?: (material: Material) => void;
  private onDeselect?: (material: Material) => void;

  constructor(options: MaterialOptionViewOptions) {
    this.scene = options.scene;
    this.maxSelections = options.maxSelections ?? 1;
    this.onSelect = options.onSelect;
    this.onDeselect = options.onDeselect;

    const x = options.x ?? 0;
    const y = options.y ?? 0;

    this.container = this.scene.add.container(x, y);

    if (options.options.length > 0) {
      this.setOptions(options.options);
    }
  }

  // =====================================================
  // 選択肢管理
  // =====================================================

  setOptions(options: MaterialOption[]): void {
    this.clearItems();
    this.options = options;
    this.selectedMaterials = [];

    const { COLUMNS, ITEM_WIDTH, ITEM_HEIGHT, ITEM_SPACING } = MaterialOptionLayout;

    options.forEach((option, index) => {
      const col = index % COLUMNS;
      const row = Math.floor(index / COLUMNS);
      const x = col * (ITEM_WIDTH + ITEM_SPACING);
      const y = row * (ITEM_HEIGHT + ITEM_SPACING);

      const item = this.createOptionItem(option, x, y);
      this.optionItems.push(item);
      this.container.add(item.container);
    });
  }

  getOptions(): MaterialOption[] {
    return [...this.options];
  }

  // =====================================================
  // アイテム作成
  // =====================================================

  private createOptionItem(option: MaterialOption, x: number, y: number): OptionItemData {
    const { ITEM_WIDTH, ITEM_HEIGHT, ICON_SIZE, PADDING } = MaterialOptionLayout;
    const itemContainer = this.scene.add.container(x, y);

    // 背景
    const bg = this.scene.add.graphics();
    this.drawItemBackground(bg, false);
    itemContainer.add(bg);

    // 品質インジケーター
    const quality = option.material.baseQuality;
    if (quality) {
      const qualityColor = MaterialQualityColors[quality] ?? Colors.textPrimary;
      const qualityIndicator = this.scene.add.graphics();
      qualityIndicator.fillStyle(qualityColor, 1);
      qualityIndicator.fillRoundedRect(0, 0, 4, ITEM_HEIGHT, { tl: 8, bl: 8, tr: 0, br: 0 });
      itemContainer.add(qualityIndicator);
    }

    // アイコン
    const icon = this.scene.add.text(
      PADDING + ICON_SIZE / 2,
      ITEM_HEIGHT / 2,
      this.getMaterialEmoji(option.material),
      { fontSize: '32px' }
    ).setOrigin(0.5);
    itemContainer.add(icon);

    // 素材名
    const nameText = this.scene.add.text(
      PADDING + ICON_SIZE + 10,
      15,
      option.material.name,
      { ...TextStyles.body, fontSize: '13px' }
    );
    itemContainer.add(nameText);

    // 数量
    const quantityText = this.scene.add.text(
      PADDING + ICON_SIZE + 10,
      35,
      `x${option.quantity}`,
      { ...TextStyles.bodySmall, fontSize: '11px', color: '#aaaaaa' }
    );
    itemContainer.add(quantityText);

    // 確率（あれば）
    if (option.probability !== undefined) {
      const probText = this.scene.add.text(
        ITEM_WIDTH - PADDING,
        ITEM_HEIGHT / 2,
        `${Math.round(option.probability * 100)}%`,
        { ...TextStyles.bodySmall, fontSize: '12px', color: '#ffd700' }
      ).setOrigin(1, 0.5);
      itemContainer.add(probText);
    }

    // インタラクション
    itemContainer.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, ITEM_WIDTH, ITEM_HEIGHT),
      Phaser.Geom.Rectangle.Contains
    );

    const itemData: OptionItemData = {
      container: itemContainer,
      option,
      selected: false,
    };

    itemContainer.on('pointerover', () => {
      if (this.enabled && !itemData.selected) {
        this.drawItemBackground(bg, false, true);
      }
    });

    itemContainer.on('pointerout', () => {
      if (this.enabled) {
        this.drawItemBackground(bg, itemData.selected);
      }
    });

    itemContainer.on('pointerdown', () => {
      if (this.enabled) {
        this.toggleSelection(itemData);
      }
    });

    itemContainer.setData('bg', bg);

    return itemData;
  }

  private drawItemBackground(
    bg: Phaser.GameObjects.Graphics,
    selected: boolean,
    hover: boolean = false
  ): void {
    const { ITEM_WIDTH, ITEM_HEIGHT } = MaterialOptionLayout;

    bg.clear();

    if (selected) {
      bg.fillStyle(Colors.accent, 0.3);
      bg.fillRoundedRect(0, 0, ITEM_WIDTH, ITEM_HEIGHT, 8);
      bg.lineStyle(2, Colors.accent);
      bg.strokeRoundedRect(0, 0, ITEM_WIDTH, ITEM_HEIGHT, 8);
    } else if (hover) {
      bg.fillStyle(0x3a3a5a, 0.9);
      bg.fillRoundedRect(0, 0, ITEM_WIDTH, ITEM_HEIGHT, 8);
      bg.lineStyle(1, 0x5a5a7a);
      bg.strokeRoundedRect(0, 0, ITEM_WIDTH, ITEM_HEIGHT, 8);
    } else {
      bg.fillStyle(0x2a2a4a, 0.9);
      bg.fillRoundedRect(0, 0, ITEM_WIDTH, ITEM_HEIGHT, 8);
      bg.lineStyle(1, 0x4a4a6a);
      bg.strokeRoundedRect(0, 0, ITEM_WIDTH, ITEM_HEIGHT, 8);
    }
  }

  private toggleSelection(itemData: OptionItemData): void {
    if (itemData.selected) {
      this.deselectMaterial(itemData.option.material);
    } else {
      this.selectMaterial(itemData.option.material);
    }
  }

  // =====================================================
  // 選択管理
  // =====================================================

  getSelectedMaterials(): Material[] {
    return [...this.selectedMaterials];
  }

  selectMaterial(material: Material): void {
    if (!this.canSelectMore()) return;

    const itemData = this.optionItems.find((item) => item.option.material === material);
    if (!itemData || itemData.selected) return;

    itemData.selected = true;
    this.selectedMaterials.push(material);

    const bg = itemData.container.getData('bg') as Phaser.GameObjects.Graphics;
    this.drawItemBackground(bg, true);

    // 選択アニメーション
    this.scene.tweens.add({
      targets: itemData.container,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 100,
      yoyo: true,
      ease: 'Power2',
    });

    if (this.onSelect) {
      this.onSelect(material);
    }
  }

  deselectMaterial(material: Material): void {
    const itemData = this.optionItems.find((item) => item.option.material === material);
    if (!itemData || !itemData.selected) return;

    itemData.selected = false;
    this.selectedMaterials = this.selectedMaterials.filter((m) => m !== material);

    const bg = itemData.container.getData('bg') as Phaser.GameObjects.Graphics;
    this.drawItemBackground(bg, false);

    if (this.onDeselect) {
      this.onDeselect(material);
    }
  }

  clearSelection(): void {
    this.optionItems.forEach((item) => {
      if (item.selected) {
        item.selected = false;
        const bg = item.container.getData('bg') as Phaser.GameObjects.Graphics;
        this.drawItemBackground(bg, false);
      }
    });
    this.selectedMaterials = [];
  }

  // =====================================================
  // 選択上限
  // =====================================================

  setMaxSelections(max: number): void {
    this.maxSelections = max;
  }

  canSelectMore(): boolean {
    return this.selectedMaterials.length < this.maxSelections;
  }

  // =====================================================
  // 表示制御
  // =====================================================

  setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.container.setAlpha(enabled ? 1 : 0.5);
  }

  // =====================================================
  // 破棄
  // =====================================================

  destroy(): void {
    this.clearItems();
    this.container.destroy();
  }

  private clearItems(): void {
    this.optionItems.forEach((item) => item.container.destroy());
    this.optionItems = [];
  }

  // =====================================================
  // ユーティリティ
  // =====================================================

  private getMaterialEmoji(material: Material): string {
    // 属性から絵文字を決定
    const attrs = material.attributes;
    if (attrs.includes('fire' as any)) return '🔥';
    if (attrs.includes('water' as any)) return '💧';
    if (attrs.includes('earth' as any)) return '🌍';
    if (attrs.includes('wind' as any)) return '💨';
    if (attrs.includes('light' as any)) return '✨';
    if (attrs.includes('dark' as any)) return '🌙';

    // レア素材
    if (material.isRare) return '💎';

    // デフォルト
    return '🌿';
  }
}
