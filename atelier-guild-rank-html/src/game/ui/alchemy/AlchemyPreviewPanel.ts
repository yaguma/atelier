/**
 * AlchemyPreviewPanel実装
 *
 * TASK-0226: 調合プレビューパネルの実装
 * 調合フェーズで調合結果をプレビュー表示するパネル。
 * 選択中の素材から予測される品質や特性を表示する。
 *
 * 設計文書: docs/tasks/atelier-guild-rank-phaser/TASK-0226.md
 */

import Phaser from 'phaser';
import { Material } from '@domain/material/MaterialEntity';
import {
  IAlchemyPreviewPanel,
  AlchemyPreview,
  AlchemyPreviewPanelOptions,
} from './IAlchemyPreviewPanel';
import { MaterialView } from '../material/MaterialView';
import { Colors } from '../../config/ColorPalette';
import { TextStyles } from '../../config/TextStyles';

/**
 * パネルレイアウト定数
 */
const PANEL_LAYOUT = {
  WIDTH: 250,
  HEIGHT: 350,
  BORDER_RADIUS: 8,
  PADDING: 15,
  TITLE_Y: 15,
  RECIPE_NAME_Y: 45,
  QUALITY_SECTION_Y: 80,
  MATERIALS_SECTION_Y: 150,
  TRAITS_SECTION_Y: 260,
  STATUS_INDICATOR_Y: 320,
} as const;

/**
 * 品質別カラーマップ
 */
const QUALITY_COLORS: Record<string, string> = {
  legendary: '#ffd700',
  epic: '#a335ee',
  rare: '#0070dd',
  good: '#1eff00',
  normal: '#ffffff',
  poor: '#9d9d9d',
};

/**
 * 品質レベル順序（ゲージ表示用）
 */
const QUALITY_LEVELS = ['poor', 'normal', 'good', 'rare', 'epic', 'legendary'];

/**
 * AlchemyPreviewPanelクラス
 *
 * 調合プレビュー情報を表示するパネルを管理する。
 */
export class AlchemyPreviewPanel implements IAlchemyPreviewPanel {
  /** Phaserコンテナ */
  public readonly container: Phaser.GameObjects.Container;

  /** シーン参照 */
  private scene: Phaser.Scene;

  /** 現在のプレビュー情報 */
  private preview: AlchemyPreview | null = null;

  // UI要素
  private background!: Phaser.GameObjects.Graphics;
  private titleText!: Phaser.GameObjects.Text;
  private recipeNameText!: Phaser.GameObjects.Text;
  private qualitySection!: Phaser.GameObjects.Container;
  private materialsSection!: Phaser.GameObjects.Container;
  private traitsSection!: Phaser.GameObjects.Container;
  private statusIndicator!: Phaser.GameObjects.Container;

  /** MaterialViewインスタンス管理 */
  private materialViews: MaterialView[] = [];

  /**
   * コンストラクタ
   * @param scene Phaserシーン
   * @param options オプション
   */
  constructor(scene: Phaser.Scene, options: AlchemyPreviewPanelOptions = {}) {
    this.scene = scene;

    const x = options.x ?? 0;
    const y = options.y ?? 0;

    this.container = scene.add.container(x, y);
    this.create();
  }

  /**
   * パネルを構築
   */
  private create(): void {
    const { WIDTH, HEIGHT, BORDER_RADIUS, PADDING } = PANEL_LAYOUT;

    // 背景
    this.background = this.scene.add.graphics();
    this.background.fillStyle(Colors.panelBackground, 0.95);
    this.background.fillRoundedRect(0, 0, WIDTH, HEIGHT, BORDER_RADIUS);
    this.background.lineStyle(1, Colors.panelBorder);
    this.background.strokeRoundedRect(0, 0, WIDTH, HEIGHT, BORDER_RADIUS);
    this.container.add(this.background);

    // タイトル
    this.titleText = this.scene.add.text(
      WIDTH / 2,
      PANEL_LAYOUT.TITLE_Y,
      '🔮 調合プレビュー',
      {
        ...TextStyles.body,
        fontSize: '14px',
        fontStyle: 'bold',
      }
    ).setOrigin(0.5, 0);
    this.container.add(this.titleText);

    // レシピ名
    this.recipeNameText = this.scene.add.text(
      WIDTH / 2,
      PANEL_LAYOUT.RECIPE_NAME_Y,
      '',
      {
        ...TextStyles.body,
        fontSize: '16px',
        color: '#ffd700',
      }
    ).setOrigin(0.5, 0);
    this.container.add(this.recipeNameText);

    // 予測品質セクション
    this.qualitySection = this.scene.add.container(PADDING, PANEL_LAYOUT.QUALITY_SECTION_Y);
    this.container.add(this.qualitySection);
    this.createQualitySection();

    // 素材リストセクション
    this.materialsSection = this.scene.add.container(PADDING, PANEL_LAYOUT.MATERIALS_SECTION_Y);
    this.container.add(this.materialsSection);
    this.createMaterialsSection();

    // 特性セクション
    this.traitsSection = this.scene.add.container(PADDING, PANEL_LAYOUT.TRAITS_SECTION_Y);
    this.container.add(this.traitsSection);
    this.createTraitsSection();

    // ステータスインジケーター
    this.statusIndicator = this.scene.add.container(WIDTH / 2, PANEL_LAYOUT.STATUS_INDICATOR_Y);
    this.container.add(this.statusIndicator);
    this.createStatusIndicator();

    // 初期状態は空
    this.showEmptyState();
  }

  /**
   * 品質セクションを作成
   */
  private createQualitySection(): void {
    const label = this.scene.add.text(0, 0, '予測品質', {
      ...TextStyles.bodySmall,
      fontSize: '12px',
      color: '#aaaaaa',
    });
    this.qualitySection.add(label);
  }

  /**
   * 素材セクションを作成
   */
  private createMaterialsSection(): void {
    const label = this.scene.add.text(0, 0, '使用素材', {
      ...TextStyles.bodySmall,
      fontSize: '12px',
      color: '#aaaaaa',
    });
    this.materialsSection.add(label);
  }

  /**
   * 特性セクションを作成
   */
  private createTraitsSection(): void {
    const label = this.scene.add.text(0, 0, '継承特性', {
      ...TextStyles.bodySmall,
      fontSize: '12px',
      color: '#aaaaaa',
    });
    this.traitsSection.add(label);
  }

  /**
   * ステータスインジケーターを作成
   */
  private createStatusIndicator(): void {
    // 初期状態は空（updateStatusIndicatorで更新）
  }

  /**
   * プレビューを設定
   */
  setPreview(preview: AlchemyPreview | null): void {
    this.preview = preview;

    if (!preview) {
      this.showEmptyState();
      return;
    }

    // レシピ名
    this.recipeNameText.setText(preview.recipe.name ?? 'Unknown Recipe');

    // 品質表示
    this.updateQualityDisplay(preview.predictedQuality);

    // 素材リスト
    this.updateMaterialsList(preview.materials);

    // 特性リスト
    this.updateTraitsList(preview.predictedTraits);

    // ステータス
    this.updateStatusIndicator(preview.canCraft, preview.missingMaterials);
  }

  /**
   * 現在のプレビューを取得
   */
  getPreview(): AlchemyPreview | null {
    return this.preview;
  }

  /**
   * 空状態を表示
   */
  private showEmptyState(): void {
    this.recipeNameText.setText('レシピを選択してください');

    // 品質セクションをクリア
    this.clearSection(this.qualitySection, 1);
    const emptyQuality = this.scene.add.text(0, 20, '-', {
      ...TextStyles.body,
      fontSize: '20px',
      color: '#666666',
    });
    this.qualitySection.add(emptyQuality);

    // 素材セクションをクリア
    this.clearSection(this.materialsSection, 1);
    this.clearMaterialViews();
    const emptyMaterials = this.scene.add.text(0, 20, '素材を選択してください', {
      ...TextStyles.bodySmall,
      fontSize: '11px',
      color: '#666666',
    });
    this.materialsSection.add(emptyMaterials);

    // 特性セクションをクリア
    this.clearSection(this.traitsSection, 1);

    // ステータスをクリア
    this.updateStatusIndicator(false, []);
  }

  /**
   * 品質表示を更新
   */
  private updateQualityDisplay(quality: string): void {
    this.clearSection(this.qualitySection, 1);

    const color = QUALITY_COLORS[quality] ?? QUALITY_COLORS['normal'];
    const qualityText = this.scene.add.text(0, 20, quality.toUpperCase(), {
      ...TextStyles.body,
      fontSize: '20px',
      fontStyle: 'bold',
      color: color,
    });
    this.qualitySection.add(qualityText);

    // 品質ゲージ
    const level = QUALITY_LEVELS.indexOf(quality);
    const gauge = this.scene.add.graphics();
    gauge.fillStyle(0x333333, 1);
    gauge.fillRoundedRect(0, 50, 200, 8, 4);
    if (level >= 0) {
      const colorNum = parseInt(color.replace('#', ''), 16);
      gauge.fillStyle(colorNum, 1);
      gauge.fillRoundedRect(0, 50, ((level + 1) / QUALITY_LEVELS.length) * 200, 8, 4);
    }
    this.qualitySection.add(gauge);
  }

  /**
   * 素材リストを更新
   */
  private updateMaterialsList(materials: Material[]): void {
    this.clearSection(this.materialsSection, 1);
    this.clearMaterialViews();

    if (materials.length === 0) {
      const emptyText = this.scene.add.text(0, 20, '素材なし', {
        ...TextStyles.bodySmall,
        fontSize: '11px',
        color: '#666666',
      });
      this.materialsSection.add(emptyText);
      return;
    }

    // 最大4つまで表示
    const displayMaterials = materials.slice(0, 4);
    displayMaterials.forEach((material, index) => {
      const mv = new MaterialView(this.scene, {
        x: (index % 2) * 100,
        y: 20 + Math.floor(index / 2) * 45,
        material: material,
        mode: 'compact',
        count: 1,
        showQuality: false,
        interactive: false,
      });
      this.materialsSection.add(mv.container);
      this.materialViews.push(mv);
    });

    // 4つ以上の場合は「+N more」を表示
    if (materials.length > 4) {
      const moreText = this.scene.add.text(0, 110, `+${materials.length - 4} more`, {
        ...TextStyles.bodySmall,
        fontSize: '10px',
        color: '#aaaaaa',
      });
      this.materialsSection.add(moreText);
    }
  }

  /**
   * 特性リストを更新
   */
  private updateTraitsList(traits: string[]): void {
    this.clearSection(this.traitsSection, 1);

    if (traits.length === 0) {
      const emptyText = this.scene.add.text(0, 20, '継承特性なし', {
        ...TextStyles.bodySmall,
        fontSize: '11px',
        color: '#666666',
      });
      this.traitsSection.add(emptyText);
      return;
    }

    // 最大3つまで表示
    const displayTraits = traits.slice(0, 3);
    displayTraits.forEach((trait, index) => {
      const traitText = this.scene.add.text(0, 20 + index * 18, `• ${trait}`, {
        ...TextStyles.bodySmall,
        fontSize: '11px',
        color: '#aaaaff',
      });
      this.traitsSection.add(traitText);
    });
  }

  /**
   * ステータスインジケーターを更新
   */
  private updateStatusIndicator(canCraft: boolean, missing: string[]): void {
    // 既存をクリア
    this.statusIndicator.removeAll(true);

    if (canCraft) {
      const okText = this.scene.add.text(0, 0, '✅ 調合可能', {
        ...TextStyles.body,
        fontSize: '14px',
        color: '#00ff00',
      }).setOrigin(0.5);
      this.statusIndicator.add(okText);
    } else if (missing.length > 0) {
      const ngText = this.scene.add.text(0, 0, '❌ 素材不足', {
        ...TextStyles.body,
        fontSize: '14px',
        color: '#ff4444',
      }).setOrigin(0.5);
      this.statusIndicator.add(ngText);
    } else {
      const waitText = this.scene.add.text(0, 0, '⏳ 待機中', {
        ...TextStyles.body,
        fontSize: '14px',
        color: '#aaaaaa',
      }).setOrigin(0.5);
      this.statusIndicator.add(waitText);
    }
  }

  /**
   * セクション内の要素をクリア
   * @param section 対象コンテナ
   * @param keepFirst 保持する先頭要素数
   */
  private clearSection(section: Phaser.GameObjects.Container, keepFirst: number): void {
    const children = section.getAll();
    for (let i = children.length - 1; i >= keepFirst; i--) {
      const child = children[i];
      if (child) {
        child.destroy();
      }
    }
  }

  /**
   * MaterialViewをすべてクリア
   */
  private clearMaterialViews(): void {
    this.materialViews.forEach(mv => mv.destroy());
    this.materialViews = [];
  }

  /**
   * 素材を追加（リアルタイム更新用）
   */
  addMaterial(material: Material): void {
    if (!this.preview) return;

    const newMaterials = [...this.preview.materials, material];
    this.setPreview({
      ...this.preview,
      materials: newMaterials,
    });
  }

  /**
   * 素材を削除（リアルタイム更新用）
   */
  removeMaterial(material: Material): void {
    if (!this.preview) return;

    const newMaterials = this.preview.materials.filter(m => m !== material);
    this.setPreview({
      ...this.preview,
      materials: newMaterials,
    });
  }

  /**
   * 全素材をクリア（リアルタイム更新用）
   */
  clearMaterials(): void {
    if (!this.preview) return;

    this.setPreview({
      ...this.preview,
      materials: [],
    });
  }

  /**
   * 表示/非表示を設定
   */
  setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }

  /**
   * 有効/無効を設定
   */
  setEnabled(enabled: boolean): void {
    this.container.setAlpha(enabled ? 1 : 0.5);
  }

  /**
   * リソースを破棄
   */
  destroy(): void {
    this.clearMaterialViews();
    this.container.destroy();
  }
}
