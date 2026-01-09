/**
 * 強化カードビュー
 *
 * 強化カード（EnhancementCard）の視覚的表現を担当する。
 * 設計文書: docs/design/atelier-guild-rank-phaser/ui-design/overview.md
 */

import Phaser from 'phaser';
import { IEnhancementCard, Card } from '@domain/card/Card';
import { CardType, EffectType } from '@domain/common/types';
import { ICardView, CardViewOptions } from './ICardView';
import { CardState, CardStateStyles, getCardStateStyle } from './CardState';
import { CardSize, CardLayout, CardSizeType, getCardScale } from './CardConstants';
import { getCardTypeDisplayOption } from './CardTypeOptions';
import { TextStyles, mergeTextStyle } from '../../config/TextStyles';

/**
 * 強化カードビュー固有のオプション
 */
export interface EnhancementCardViewOptions extends Omit<CardViewOptions, 'card'> {
  /** 強化カードデータ */
  card: IEnhancementCard;
}

/**
 * 効果タイプに対応するアイコンマッピング
 */
const EFFECT_TYPE_ICONS: Record<EffectType, string> = {
  [EffectType.QUALITY_UP]: '⬆️',
  [EffectType.QUALITY_BOOST]: '✨',
  [EffectType.MATERIAL_SAVE]: '💎',
  [EffectType.GATHERING_BONUS]: '🌿',
  [EffectType.RARE_CHANCE_UP]: '🎲',
  [EffectType.GOLD_BONUS]: '💰',
  [EffectType.GOLD_UP]: '💰',
  [EffectType.CONTRIBUTION_BONUS]: '⭐',
  [EffectType.COST_REDUCTION]: '⚡',
  [EffectType.STORAGE_EXPANSION]: '📦',
  [EffectType.ACTION_POINT_BONUS]: '🔋',
  [EffectType.ALCHEMY_COST_REDUCTION]: '🧪',
};

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
};

/**
 * 強化カードビュークラス
 *
 * 強化カードを描画し、インタラクションを管理する。
 */
export class EnhancementCardView implements ICardView {
  /** Phaserコンテナ */
  public readonly container: Phaser.GameObjects.Container;

  /** カードデータ */
  public readonly card: IEnhancementCard;

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

  /** 効果アイコンテキスト */
  private effectIcon: Phaser.GameObjects.Text;

  /** 効果説明テキスト */
  private effectText: Phaser.GameObjects.Text;

  /** クリックコールバック */
  private onClick?: (card: Card) => void;

  /** ホバーコールバック */
  private onHover?: (card: Card, isHovering: boolean) => void;

  /**
   * コンストラクタ
   * @param scene Phaserシーン
   * @param options 作成オプション
   */
  constructor(scene: Phaser.Scene, options: EnhancementCardViewOptions) {
    this.scene = scene;
    this.card = options.card;
    this.sizeType = options.size ?? 'STANDARD';
    this.state = options.state ?? 'normal';
    this.onClick = options.onClick;
    this.onHover = options.onHover;

    const { width, height } = CardSize[this.sizeType];
    const scale = getCardScale(this.sizeType);

    // コンテナ作成
    this.container = scene.add.container(options.x, options.y);

    // 背景グラフィックス作成
    this.background = scene.add.graphics();
    this.container.add(this.background);

    // カード種別の表示オプションを取得
    const typeOption = getCardTypeDisplayOption(CardType.ENHANCEMENT);

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

    // コスト表示（右上）- 強化カードはコスト0
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
      -height / 2 + 40 * scale,
      this.card.name,
      mergeTextStyle('cardName', {
        fontSize: `${Math.round(14 * scale)}px`,
        wordWrap: { width: width - CardLayout.PADDING * 2 },
      })
    ).setOrigin(0.5, 0);
    this.container.add(this.nameText);

    // 効果アイコン（中央）
    const iconStr = this.getEffectIcon();
    this.effectIcon = scene.add.text(
      0,
      -height / 2 + 75 * scale,
      iconStr,
      {
        fontSize: `${Math.round(32 * scale)}px`,
      }
    ).setOrigin(0.5);
    this.container.add(this.effectIcon);

    // 効果説明（下部）
    const effectDescription = this.formatEffectDescription();
    this.effectText = scene.add.text(
      0,
      height / 2 - 40 * scale,
      effectDescription,
      mergeTextStyle('cardDescription', {
        fontSize: `${Math.round(11 * scale)}px`,
        align: 'center',
        wordWrap: { width: width - CardLayout.PADDING * 2 },
      })
    ).setOrigin(0.5, 0);
    this.container.add(this.effectText);

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
    if (card.type !== CardType.ENHANCEMENT) {
      console.warn('EnhancementCardView: Card type mismatch');
      return;
    }

    const enhancementCard = card as IEnhancementCard;
    this.nameText.setText(enhancementCard.name);
    this.costText.setText(`${enhancementCard.cost}`);
    this.effectIcon.setText(this.getEffectIcon());
    this.effectText.setText(this.formatEffectDescription());
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
    const typeOption = getCardTypeDisplayOption(CardType.ENHANCEMENT);
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
   * 効果タイプに応じたアイコンを取得
   */
  private getEffectIcon(): string {
    const effectType = this.card.effect?.type;
    if (effectType && effectType in EFFECT_TYPE_ICONS) {
      return EFFECT_TYPE_ICONS[effectType];
    }
    return '✨'; // デフォルトアイコン
  }

  /**
   * 効果説明をフォーマット
   */
  private formatEffectDescription(): string {
    // カードの説明があればそれを使用
    if (this.card.description) {
      return this.card.description;
    }

    // なければ効果タイプと値から生成
    const effect = this.card.effect;
    if (!effect) {
      return '効果なし';
    }

    const typeName = EFFECT_TYPE_NAMES[effect.type] ?? effect.type;
    const valueStr = effect.value > 0 ? `+${effect.value}` : `${effect.value}`;

    return `${typeName} ${valueStr}`;
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
