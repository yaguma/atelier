/**
 * カードツールチップ
 *
 * カードホバー時に詳細情報を表示するツールチップコンポーネント。
 * 設計文書: docs/design/atelier-guild-rank-phaser/ui-design/overview.md
 */

import Phaser from 'phaser';
import {
  Card,
  IGatheringCard,
  IRecipeCard,
  IEnhancementCard,
} from '@domain/card/Card';
import { CardType, EffectType } from '@domain/common/types';
import { Colors } from '../../config/ColorPalette';
import { mergeTextStyle } from '../../config/TextStyles';

/**
 * 効果タイプに対応する日本語名マッピング
 */
const EFFECT_TYPE_NAMES: Record<EffectType, string> = {
  [EffectType.QUALITY_UP]: '品質アップ',
  [EffectType.QUALITY_BOOST]: '品質ブースト',
  [EffectType.MATERIAL_SAVE]: '素材節約',
  [EffectType.GATHERING_BONUS]: '採取ボーナス',
  [EffectType.RARE_CHANCE_UP]: 'レア確率アップ',
  [EffectType.GOLD_BONUS]: '報酬アップ',
  [EffectType.GOLD_UP]: 'ゴールドアップ',
  [EffectType.CONTRIBUTION_BONUS]: '貢献度アップ',
  [EffectType.COST_REDUCTION]: 'コスト軽減',
  [EffectType.STORAGE_EXPANSION]: '保管拡張',
  [EffectType.ACTION_POINT_BONUS]: 'AP追加',
  [EffectType.ALCHEMY_COST_REDUCTION]: '調合コスト軽減',
  [EffectType.ALL_BONUS]: '全体ボーナス',
};

/**
 * ツールチップ設定オプション
 */
export interface CardTooltipConfig {
  /** ツールチップの幅（デフォルト: 220） */
  width?: number;
  /** 内側のパディング（デフォルト: 12） */
  padding?: number;
  /** 素材名解決関数 */
  getMaterialName?: (materialId: string) => string;
  /** アイテム名解決関数 */
  getItemName?: (itemId: string) => string;
}

/**
 * カードツールチップクラス
 *
 * カードにホバーした際に表示される詳細情報ツールチップ。
 * カード種別ごとに適切な情報を表示する。
 */
export class CardTooltip {
  /** Phaserコンテナ */
  private container: Phaser.GameObjects.Container;

  /** シーン参照 */
  private scene: Phaser.Scene;

  /** 背景グラフィックス */
  private background: Phaser.GameObjects.Graphics;

  /** タイトルテキスト */
  private titleText: Phaser.GameObjects.Text;

  /** 説明テキスト */
  private descriptionText: Phaser.GameObjects.Text;

  /** 詳細テキスト */
  private detailsText: Phaser.GameObjects.Text;

  /** ツールチップの幅 */
  private readonly width: number;

  /** 内側のパディング */
  private readonly padding: number;

  /** 素材名解決関数 */
  private getMaterialName?: (materialId: string) => string;

  /** アイテム名解決関数 */
  private getItemName?: (itemId: string) => string;

  /** 表示状態 */
  private visible: boolean = false;

  /**
   * コンストラクタ
   * @param scene Phaserシーン
   * @param config 設定オプション
   */
  constructor(scene: Phaser.Scene, config?: CardTooltipConfig) {
    this.scene = scene;
    this.width = config?.width ?? 220;
    this.padding = config?.padding ?? 12;
    this.getMaterialName = config?.getMaterialName;
    this.getItemName = config?.getItemName;

    // コンテナ作成
    this.container = scene.add.container(0, 0);
    this.container.setDepth(1500);
    this.container.setVisible(false);

    // 背景グラフィックス
    this.background = scene.add.graphics();
    this.container.add(this.background);

    // タイトルテキスト
    this.titleText = scene.add.text(
      this.padding,
      this.padding,
      '',
      mergeTextStyle('cardName', {
        fontSize: '14px',
      })
    );
    this.container.add(this.titleText);

    // 説明テキスト
    this.descriptionText = scene.add.text(
      this.padding,
      this.padding + 25,
      '',
      mergeTextStyle('body', {
        fontSize: '12px',
        wordWrap: { width: this.width - this.padding * 2 },
      })
    );
    this.container.add(this.descriptionText);

    // 詳細テキスト
    this.detailsText = scene.add.text(
      this.padding,
      this.padding + 70,
      '',
      mergeTextStyle('bodySmall', {
        fontSize: '11px',
        wordWrap: { width: this.width - this.padding * 2 },
      })
    );
    this.container.add(this.detailsText);
  }

  /**
   * ツールチップを表示する
   * @param card カードデータ
   * @param x X座標
   * @param y Y座標
   */
  show(card: Card, x: number, y: number): void {
    // カード情報を設定
    this.titleText.setText(card.name);
    this.descriptionText.setText(this.getDescription(card));
    this.detailsText.setText(this.getDetails(card));

    // 高さを計算
    const height = this.calculateHeight();

    // 背景を描画
    this.drawBackground(height);

    // 位置調整（画面外にはみ出さないように）
    const adjustedX = this.adjustX(x);
    const adjustedY = this.adjustY(y, height);
    this.container.setPosition(adjustedX, adjustedY);

    // 表示アニメーション
    this.container.setAlpha(0);
    this.container.setVisible(true);
    this.visible = true;

    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 150,
      ease: 'Power2',
    });
  }

  /**
   * ツールチップを非表示にする
   */
  hide(): void {
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 100,
      ease: 'Power2',
      onComplete: () => {
        this.container.setVisible(false);
        this.visible = false;
      },
    });
  }

  /**
   * 表示状態を取得する
   * @returns 表示中ならtrue
   */
  isVisible(): boolean {
    return this.visible;
  }

  /**
   * リソースを破棄する
   */
  destroy(): void {
    this.container.destroy();
  }

  // ========================================
  // プライベートメソッド
  // ========================================

  /**
   * カード種別に応じた説明文を生成する
   */
  private getDescription(card: Card): string {
    switch (card.type) {
      case CardType.GATHERING:
        return this.getGatheringDescription(card as IGatheringCard);
      case CardType.RECIPE:
        return this.getRecipeDescription(card as IRecipeCard);
      case CardType.ENHANCEMENT:
        return this.getEnhancementDescription(card as IEnhancementCard);
      default:
        return '';
    }
  }

  /**
   * 採取地カードの説明文を生成
   */
  private getGatheringDescription(card: IGatheringCard): string {
    return `APコスト: ${card.cost}\n採取地で素材を獲得`;
  }

  /**
   * レシピカードの説明文を生成
   */
  private getRecipeDescription(card: IRecipeCard): string {
    const outputName = this.getItemName
      ? this.getItemName(card.outputItemId)
      : card.outputItemId;
    return `APコスト: ${card.cost}\n${outputName}を調合`;
  }

  /**
   * 強化カードの説明文を生成
   */
  private getEnhancementDescription(card: IEnhancementCard): string {
    if (card.description) {
      return `APコスト: ${card.cost}\n${card.description}`;
    }
    return `APコスト: ${card.cost}\n特殊効果`;
  }

  /**
   * カード種別に応じた詳細情報を生成する
   */
  private getDetails(card: Card): string {
    switch (card.type) {
      case CardType.GATHERING:
        return this.getGatheringDetails(card as IGatheringCard);
      case CardType.RECIPE:
        return this.getRecipeDetails(card as IRecipeCard);
      case CardType.ENHANCEMENT:
        return this.getEnhancementDetails(card as IEnhancementCard);
      default:
        return '';
    }
  }

  /**
   * 採取地カードの詳細情報を生成
   */
  private getGatheringDetails(card: IGatheringCard): string {
    const maxDisplay = 3;
    const materials = card.materials.slice(0, maxDisplay);

    const lines = materials.map((m) => {
      const name = this.getMaterialName
        ? this.getMaterialName(m.materialId)
        : m.materialId;
      return `・${name} x${m.quantity}`;
    });

    if (card.materials.length > maxDisplay) {
      lines.push('...');
    }

    return '獲得可能素材:\n' + lines.join('\n');
  }

  /**
   * レシピカードの詳細情報を生成
   */
  private getRecipeDetails(card: IRecipeCard): string {
    const maxDisplay = 3;
    const materials = card.requiredMaterials.slice(0, maxDisplay);

    const lines = materials.map((m) => {
      const name = this.getMaterialName
        ? this.getMaterialName(m.materialId)
        : m.materialId;
      const qualityStr = m.minQuality ? ` (${m.minQuality}以上)` : '';
      return `・${name} x${m.quantity}${qualityStr}`;
    });

    if (card.requiredMaterials.length > maxDisplay) {
      lines.push('...');
    }

    return '必要素材:\n' + lines.join('\n');
  }

  /**
   * 強化カードの詳細情報を生成
   */
  private getEnhancementDetails(card: IEnhancementCard): string {
    const effect = card.effect;
    if (!effect) {
      return '';
    }

    const typeName = EFFECT_TYPE_NAMES[effect.type] ?? effect.type;
    const valueStr = effect.value > 0 ? `+${effect.value}` : `${effect.value}`;

    return `効果: ${typeName} ${valueStr}`;
  }

  /**
   * ツールチップの高さを計算する
   */
  private calculateHeight(): number {
    const titleHeight = 25;
    const descHeight = this.descriptionText.height + 10;
    const detailsHeight = this.detailsText.height;
    return this.padding * 2 + titleHeight + descHeight + detailsHeight;
  }

  /**
   * 背景を描画する
   */
  private drawBackground(height: number): void {
    this.background.clear();

    // 半透明の背景
    this.background.fillStyle(Colors.backgroundDark, 0.95);
    this.background.fillRoundedRect(0, 0, this.width, height, 8);

    // ボーダー
    this.background.lineStyle(1, Colors.panelBorder);
    this.background.strokeRoundedRect(0, 0, this.width, height, 8);
  }

  /**
   * X座標を画面内に収まるよう調整する
   */
  private adjustX(x: number): number {
    const screenWidth = this.scene.cameras.main.width;
    // 右側にはみ出す場合は左側に配置
    if (x + this.width > screenWidth - 10) {
      return x - this.width - 20;
    }
    return x + 20;
  }

  /**
   * Y座標を画面内に収まるよう調整する
   */
  private adjustY(y: number, height: number): number {
    const screenHeight = this.scene.cameras.main.height;
    // 下側にはみ出す場合は上に調整
    if (y + height > screenHeight - 10) {
      return screenHeight - height - 10;
    }
    return y;
  }
}
