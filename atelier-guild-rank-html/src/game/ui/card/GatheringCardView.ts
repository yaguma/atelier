/**
 * 採取地カードビュー
 *
 * 採取地カード（GatheringCard）の視覚的表現を担当する。
 * 設計文書: docs/design/atelier-guild-rank-phaser/ui-design/overview.md
 */

import Phaser from 'phaser';
import { IGatheringCard, Card } from '@domain/card/Card';
import { CardType } from '@domain/common/types';
import { ICardView, CardViewOptions } from './ICardView';
import { CardState, CardStateStyles, getCardStateStyle } from './CardState';
import { CardSize, CardLayout, CardSizeType, getCardScale } from './CardConstants';
import { getCardTypeDisplayOption } from './CardTypeOptions';
import { TextStyles, mergeTextStyle } from '../../config/TextStyles';

/**
 * 採取地カードビュー固有のオプション
 */
export interface GatheringCardViewOptions extends Omit<CardViewOptions, 'card'> {
  /** 採取地カードデータ */
  card: IGatheringCard;
  /** 素材名解決関数（オプション） */
  getMaterialName?: (materialId: string) => string;
}

/**
 * 採取地カードビュークラス
 *
 * 採取地カードを描画し、インタラクションを管理する。
 */
export class GatheringCardView implements ICardView {
  /** Phaserコンテナ */
  public readonly container: Phaser.GameObjects.Container;

  /** カードデータ */
  public readonly card: IGatheringCard;

  /** シーン参照 */
  private scene: Phaser.Scene;

  /** カードサイズタイプ */
  private sizeType: CardSizeType;

  /** 現在の状態 */
  private state: CardState;

  /** 背景グラフィックス */
  private background: Phaser.GameObjects.Graphics;

  /** カード名テキスト */
  private nameText: Phaser.GameObjects.Text;

  /** コストテキスト */
  private costText: Phaser.GameObjects.Text;

  /** 種別ラベルテキスト */
  private typeLabel: Phaser.GameObjects.Text;

  /** 素材リストテキスト */
  private materialsText: Phaser.GameObjects.Text;

  /** クリックコールバック */
  private onClick?: (card: Card) => void;

  /** ホバーコールバック */
  private onHover?: (card: Card, isHovering: boolean) => void;

  /** 素材名解決関数 */
  private getMaterialName?: (materialId: string) => string;

  /**
   * コンストラクタ
   * @param scene Phaserシーン
   * @param options 作成オプション
   */
  constructor(scene: Phaser.Scene, options: GatheringCardViewOptions) {
    this.scene = scene;
    this.card = options.card;
    this.sizeType = options.size ?? 'STANDARD';
    this.state = options.state ?? 'normal';
    this.onClick = options.onClick;
    this.onHover = options.onHover;
    this.getMaterialName = options.getMaterialName;

    const { width, height } = CardSize[this.sizeType];
    const scale = getCardScale(this.sizeType);

    // コンテナ作成
    this.container = scene.add.container(options.x, options.y);

    // 背景グラフィックス作成
    this.background = scene.add.graphics();
    this.container.add(this.background);

    // カード種別の表示オプションを取得
    const typeOption = getCardTypeDisplayOption(CardType.GATHERING);

    // 背景を描画
    this.drawBackground();

    // 種別ラベル（左上）
    this.typeLabel = scene.add.text(
      -width / 2 + CardLayout.PADDING,
      -height / 2 + CardLayout.PADDING,
      typeOption.typeName,
      mergeTextStyle('bodySmall', {
        fontSize: `${Math.round(10 * scale)}px`,
        color: typeOption.labelColor,
      })
    );
    this.container.add(this.typeLabel);

    // コスト表示（右上）
    this.costText = scene.add.text(
      width / 2 - CardLayout.PADDING,
      -height / 2 + CardLayout.PADDING,
      `${this.card.cost}`,
      mergeTextStyle('cardCost', {
        fontSize: `${Math.round(16 * scale)}px`,
      })
    ).setOrigin(1, 0);
    this.container.add(this.costText);

    // カード名（中央上部）
    this.nameText = scene.add.text(
      0,
      -height / 2 + CardLayout.NAME_Y * scale,
      this.card.name,
      mergeTextStyle('cardName', {
        fontSize: `${Math.round(14 * scale)}px`,
        wordWrap: { width: width - CardLayout.PADDING * 2 },
      })
    ).setOrigin(0.5, 0.5);
    this.container.add(this.nameText);

    // 獲得可能素材リスト（中央下部）
    const materialsStr = this.formatMaterials();
    this.materialsText = scene.add.text(
      0,
      CardLayout.DESCRIPTION_Y * scale - height / 2,
      materialsStr,
      mergeTextStyle('cardDescription', {
        fontSize: `${Math.round(11 * scale)}px`,
        align: 'center',
        wordWrap: { width: width - CardLayout.PADDING * 2 },
      })
    ).setOrigin(0.5, 0);
    this.container.add(this.materialsText);

    // インタラクション設定
    if (options.interactive !== false) {
      this.setInteractive(true);
    }

    // 初期状態を適用
    this.applyState();
  }

  // ========================================
  // 状態管理
  // ========================================

  /**
   * 現在の状態を取得
   */
  getState(): CardState {
    return this.state;
  }

  /**
   * 状態を設定
   */
  setState(state: CardState): void {
    if (this.state !== state) {
      this.state = state;
      this.applyState();
    }
  }

  // ========================================
  // 表示更新
  // ========================================

  /**
   * カードデータを更新
   */
  update(card: Card): void {
    if (card.type !== CardType.GATHERING) {
      console.warn('GatheringCardView: Card type mismatch');
      return;
    }

    const gatheringCard = card as IGatheringCard;
    this.nameText.setText(gatheringCard.name);
    this.costText.setText(`${gatheringCard.cost}`);
    this.materialsText.setText(this.formatMaterials());
  }

  /**
   * 位置を設定
   */
  setPosition(x: number, y: number): void {
    this.container.setPosition(x, y);
  }

  /**
   * スケールを設定
   */
  setScale(scale: number): void {
    this.container.setScale(scale);
  }

  /**
   * 透明度を設定
   */
  setAlpha(alpha: number): void {
    this.container.setAlpha(alpha);
  }

  // ========================================
  // インタラクション
  // ========================================

  /**
   * インタラクティブ状態を設定
   */
  setInteractive(enabled: boolean): void {
    if (enabled) {
      const { width, height } = CardSize[this.sizeType];
      const hitArea = new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height);

      this.container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

      // ホバーイン
      this.container.on('pointerover', this.handlePointerOver, this);

      // ホバーアウト
      this.container.on('pointerout', this.handlePointerOut, this);

      // クリック
      this.container.on('pointerdown', this.handlePointerDown, this);
    } else {
      this.container.disableInteractive();
      this.container.off('pointerover', this.handlePointerOver, this);
      this.container.off('pointerout', this.handlePointerOut, this);
      this.container.off('pointerdown', this.handlePointerDown, this);
    }
  }

  /**
   * 選択状態を設定
   */
  setSelected(selected: boolean): void {
    this.setState(selected ? 'selected' : 'normal');
  }

  // ========================================
  // ライフサイクル
  // ========================================

  /**
   * リソースを破棄
   */
  destroy(): void {
    this.container.off('pointerover', this.handlePointerOver, this);
    this.container.off('pointerout', this.handlePointerOut, this);
    this.container.off('pointerdown', this.handlePointerDown, this);
    this.container.destroy();
  }

  // ========================================
  // プライベートメソッド
  // ========================================

  /**
   * 背景を描画
   */
  private drawBackground(): void {
    const { width, height } = CardSize[this.sizeType];
    const typeOption = getCardTypeDisplayOption(CardType.GATHERING);
    const stateStyle = getCardStateStyle(this.state);

    this.background.clear();

    // 背景塗りつぶし
    this.background.fillStyle(typeOption.backgroundColor, stateStyle.alpha);
    this.background.fillRoundedRect(
      -width / 2,
      -height / 2,
      width,
      height,
      CardLayout.CORNER_RADIUS
    );

    // ボーダー
    const borderColor = this.state === 'selected' ? stateStyle.borderColor : typeOption.borderColor;
    this.background.lineStyle(stateStyle.borderWidth, borderColor);
    this.background.strokeRoundedRect(
      -width / 2,
      -height / 2,
      width,
      height,
      CardLayout.CORNER_RADIUS
    );
  }

  /**
   * 状態に応じた表示を適用
   */
  private applyState(): void {
    const stateStyle = getCardStateStyle(this.state);

    // 背景を再描画
    this.drawBackground();

    // スケールとアルファを適用
    this.container.setScale(stateStyle.scale);
    this.container.setAlpha(stateStyle.alpha);
  }

  /**
   * 素材リストをフォーマット
   */
  private formatMaterials(): string {
    const maxDisplay = 3;
    const materials = this.card.materials.slice(0, maxDisplay);

    const lines = materials.map((m) => {
      // 素材名解決関数があれば使用、なければIDを表示
      const name = this.getMaterialName
        ? this.getMaterialName(m.materialId)
        : m.materialId;
      return `${name} x${m.quantity}`;
    });

    if (this.card.materials.length > maxDisplay) {
      lines.push('...');
    }

    return lines.join('\n');
  }

  /**
   * ポインターオーバーハンドラ
   */
  private handlePointerOver(): void {
    if (this.state !== 'disabled' && this.state !== 'selected' && this.state !== 'used') {
      this.setState('hover');
      if (this.onHover) {
        this.onHover(this.card, true);
      }
    }
  }

  /**
   * ポインターアウトハンドラ
   */
  private handlePointerOut(): void {
    if (this.state === 'hover') {
      this.setState('normal');
      if (this.onHover) {
        this.onHover(this.card, false);
      }
    }
  }

  /**
   * ポインターダウンハンドラ
   */
  private handlePointerDown(): void {
    if (this.state !== 'disabled' && this.state !== 'used' && this.onClick) {
      this.onClick(this.card);
    }
  }
}
