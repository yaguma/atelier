/**
 * MaterialView実装
 *
 * 素材の視覚的表現コンポーネント。
 * 設計文書: docs/tasks/atelier-guild-rank-phaser/TASK-0199.md
 */

import Phaser from 'phaser';
import { Material } from '@domain/material/MaterialEntity';
import { Quality } from '@domain/common/types';
import { IMaterialView, MaterialViewOptions } from './IMaterialView';
import {
  MaterialLayout,
  MaterialQualityColors,
  MaterialViewMode,
} from './MaterialConstants';
import { Colors } from '../../config/ColorPalette';
import { TextStyles } from '../../config/TextStyles';

/**
 * 素材ビュークラス
 *
 * 素材アイテムの視覚的表現と操作を管理する。
 */
export class MaterialView implements IMaterialView {
  /** Phaserコンテナ */
  public readonly container: Phaser.GameObjects.Container;

  /** 素材マスターデータ */
  public readonly material: Material;

  /** シーン参照 */
  private scene: Phaser.Scene;

  /** 表示モード */
  private mode: MaterialViewMode;

  /** 表示個数 */
  private count: number;

  /** 表示品質（instanceから取得、なければbaseQuality） */
  private displayQuality: Quality;

  /** 選択状態 */
  private selected: boolean = false;

  /** 有効状態 */
  private enabled: boolean = true;

  /** 品質表示フラグ */
  private showQuality: boolean;

  /** 背景グラフィックス */
  private background!: Phaser.GameObjects.Graphics;

  /** アイコン（スプライトまたはテキスト） */
  private iconSprite!: Phaser.GameObjects.Sprite | Phaser.GameObjects.Text;

  /** 名前テキスト（詳細モードのみ） */
  private nameText?: Phaser.GameObjects.Text;

  /** 個数テキスト */
  private countText?: Phaser.GameObjects.Text;

  /** 品質インジケーター */
  private qualityIndicator?: Phaser.GameObjects.Graphics;

  /** クリック時コールバック */
  private onClick?: (material: Material) => void;

  /** ホバー時コールバック */
  private onHover?: (material: Material, isHovering: boolean) => void;

  /**
   * コンストラクタ
   * @param scene Phaserシーン
   * @param options 作成オプション
   */
  constructor(scene: Phaser.Scene, options: MaterialViewOptions) {
    this.scene = scene;
    this.material = options.material;
    this.mode = options.mode ?? 'compact';
    this.count = options.count ?? 1;
    this.showQuality = options.showQuality ?? true;
    this.displayQuality = options.instance?.quality ?? this.material.baseQuality;
    this.onClick = options.onClick;
    this.onHover = options.onHover;

    this.container = scene.add.container(options.x, options.y);

    if (this.mode === 'compact') {
      this.createCompactView(options);
    } else {
      this.createDetailView(options);
    }

    if (options.interactive !== false) {
      this.setupInteraction();
    }
  }

  // ========================================
  // プライベート: ビュー構築
  // ========================================

  /**
   * コンパクトビューを作成する
   */
  private createCompactView(options: MaterialViewOptions): void {
    const { COMPACT_WIDTH, COMPACT_HEIGHT, ICON_SIZE, BORDER_RADIUS } = MaterialLayout;

    // 背景
    this.background = this.scene.add.graphics();
    this.drawBackground();
    this.container.add(this.background);

    // アイコン
    this.createIcon(0, -10);
    this.container.add(this.iconSprite);

    // 品質インジケーター
    if (this.showQuality && options.instance) {
      this.qualityIndicator = this.scene.add.graphics();
      const qualityColor = MaterialQualityColors[this.displayQuality] ?? Colors.textPrimary;
      this.qualityIndicator.fillStyle(qualityColor);
      this.qualityIndicator.fillCircle(COMPACT_WIDTH / 2 - 8, -COMPACT_HEIGHT / 2 + 8, 6);
      this.container.add(this.qualityIndicator);
    }

    // 個数バッジ（複数の場合のみ）
    if (this.count > 1) {
      this.countText = this.scene.add.text(
        COMPACT_WIDTH / 2 - 5,
        COMPACT_HEIGHT / 2 - 5,
        `x${this.count}`,
        { ...TextStyles.bodySmall, fontSize: '11px', color: '#ffffff' }
      ).setOrigin(1, 1);
      this.container.add(this.countText);
    }
  }

  /**
   * 詳細ビューを作成する
   */
  private createDetailView(options: MaterialViewOptions): void {
    const { DETAIL_WIDTH, DETAIL_HEIGHT, ICON_SIZE, DETAIL_BORDER_RADIUS } = MaterialLayout;

    // 背景
    this.background = this.scene.add.graphics();
    this.drawBackground();
    this.container.add(this.background);

    // アイコン
    this.createIcon(8 + ICON_SIZE / 2, DETAIL_HEIGHT / 2);
    this.container.add(this.iconSprite);

    // 素材名
    this.nameText = this.scene.add.text(
      ICON_SIZE + 20,
      12,
      this.material.name,
      { ...TextStyles.body, fontSize: '14px' }
    );
    this.container.add(this.nameText);

    // 品質テキスト
    if (options.instance && this.showQuality) {
      const qualityColor = MaterialQualityColors[this.displayQuality] ?? Colors.textPrimary;
      const qualityText = this.scene.add.text(
        ICON_SIZE + 20,
        32,
        `品質: ${this.displayQuality}`,
        {
          ...TextStyles.bodySmall,
          fontSize: '12px',
          color: `#${qualityColor.toString(16).padStart(6, '0')}`,
        }
      );
      this.container.add(qualityText);
    }

    // 個数
    this.countText = this.scene.add.text(
      DETAIL_WIDTH - 10,
      DETAIL_HEIGHT / 2,
      `x${this.count}`,
      { ...TextStyles.body, fontSize: '16px' }
    ).setOrigin(1, 0.5);
    this.container.add(this.countText);
  }

  /**
   * アイコンを作成する
   */
  private createIcon(x: number, y: number): void {
    const iconKey = `material_${this.material.id}`;
    if (this.scene.textures.exists(iconKey)) {
      this.iconSprite = this.scene.add.sprite(x, y, iconKey);
      this.iconSprite.setDisplaySize(MaterialLayout.ICON_SIZE, MaterialLayout.ICON_SIZE);
    } else {
      // フォールバック: 絵文字アイコン
      const fontSize = this.mode === 'compact' ? '32px' : '28px';
      this.iconSprite = this.scene.add.text(x, y, this.getMaterialEmoji(), {
        fontSize,
      }).setOrigin(0.5);
    }
  }

  /**
   * 背景を描画する
   */
  private drawBackground(): void {
    this.background.clear();

    if (this.mode === 'compact') {
      const { COMPACT_WIDTH, COMPACT_HEIGHT, BORDER_RADIUS } = MaterialLayout;
      this.background.fillStyle(Colors.backgroundDark, 0.8);
      this.background.fillRoundedRect(
        -COMPACT_WIDTH / 2,
        -COMPACT_HEIGHT / 2,
        COMPACT_WIDTH,
        COMPACT_HEIGHT,
        BORDER_RADIUS
      );

      // ボーダー
      const borderColor = this.selected ? Colors.accent : Colors.panelBorder;
      const borderWidth = this.selected ? 2 : 1;
      this.background.lineStyle(borderWidth, borderColor);
      this.background.strokeRoundedRect(
        -COMPACT_WIDTH / 2,
        -COMPACT_HEIGHT / 2,
        COMPACT_WIDTH,
        COMPACT_HEIGHT,
        BORDER_RADIUS
      );
    } else {
      const { DETAIL_WIDTH, DETAIL_HEIGHT, DETAIL_BORDER_RADIUS } = MaterialLayout;
      this.background.fillStyle(Colors.backgroundDark, 0.9);
      this.background.fillRoundedRect(0, 0, DETAIL_WIDTH, DETAIL_HEIGHT, DETAIL_BORDER_RADIUS);

      // ボーダー
      const borderColor = this.selected ? Colors.accent : Colors.panelBorder;
      const borderWidth = this.selected ? 2 : 1;
      this.background.lineStyle(borderWidth, borderColor);
      this.background.strokeRoundedRect(0, 0, DETAIL_WIDTH, DETAIL_HEIGHT, DETAIL_BORDER_RADIUS);
    }
  }

  /**
   * 素材カテゴリに応じた絵文字を取得する
   */
  private getMaterialEmoji(): string {
    // 属性から判断
    const attrs = this.material.getAttributes();
    if (attrs.includes('GRASS' as any)) return '🌿';
    if (attrs.includes('WATER' as any)) return '💧';
    if (attrs.includes('FIRE' as any)) return '🔥';
    if (attrs.includes('EARTH' as any)) return '🪨';
    if (attrs.includes('WIND' as any)) return '💨';

    // レア素材
    if (this.material.isRareMaterial()) return '✨';

    // デフォルト
    return '📦';
  }

  /**
   * インタラクションを設定する
   */
  private setupInteraction(): void {
    const bounds = this.mode === 'compact'
      ? new Phaser.Geom.Rectangle(
          -MaterialLayout.COMPACT_WIDTH / 2,
          -MaterialLayout.COMPACT_HEIGHT / 2,
          MaterialLayout.COMPACT_WIDTH,
          MaterialLayout.COMPACT_HEIGHT
        )
      : new Phaser.Geom.Rectangle(
          0,
          0,
          MaterialLayout.DETAIL_WIDTH,
          MaterialLayout.DETAIL_HEIGHT
        );

    this.container.setInteractive(bounds, Phaser.Geom.Rectangle.Contains);

    this.container.on('pointerover', () => {
      if (this.enabled && this.onHover) {
        this.onHover(this.material, true);
      }
    });

    this.container.on('pointerout', () => {
      if (this.enabled && this.onHover) {
        this.onHover(this.material, false);
      }
    });

    this.container.on('pointerdown', () => {
      if (this.enabled && this.onClick) {
        this.onClick(this.material);
      }
    });
  }

  // ========================================
  // パブリック: 表示更新
  // ========================================

  /**
   * 個数を設定する
   */
  setCount(count: number): void {
    this.count = count;
    if (this.countText) {
      this.countText.setText(`x${count}`);
      // compactモードでは複数時のみ表示
      if (this.mode === 'compact') {
        this.countText.setVisible(count > 1);
      }
    }
  }

  /**
   * 選択状態を設定する
   */
  setSelected(selected: boolean): void {
    if (this.selected === selected) return;
    this.selected = selected;
    this.drawBackground();
  }

  /**
   * 有効/無効状態を設定する
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.container.setAlpha(enabled ? 1 : 0.5);
    if (enabled) {
      this.setupInteraction();
    } else {
      this.container.disableInteractive();
    }
  }

  // ========================================
  // パブリック: 位置・表示
  // ========================================

  /**
   * 位置を設定する
   */
  setPosition(x: number, y: number): void {
    this.container.setPosition(x, y);
  }

  /**
   * 表示・非表示を設定する
   */
  setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }

  /**
   * 透明度を設定する
   */
  setAlpha(alpha: number): void {
    this.container.setAlpha(alpha);
  }

  /**
   * インタラクティブ状態を設定する
   */
  setInteractive(enabled: boolean): void {
    if (enabled) {
      this.setupInteraction();
    } else {
      this.container.disableInteractive();
    }
  }

  // ========================================
  // パブリック: ライフサイクル
  // ========================================

  /**
   * リソースを破棄する
   */
  destroy(): void {
    this.container.destroy();
  }
}
